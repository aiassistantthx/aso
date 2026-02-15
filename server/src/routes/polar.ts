import { FastifyInstance } from 'fastify';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

// In-memory price cache (5 minutes)
let priceCache: { data: unknown; expiry: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function getAllowedProductIds(): string[] {
  const ids: string[] = [];
  const monthly = process.env.POLAR_MONTHLY_PRODUCT_ID;
  const yearly = process.env.POLAR_YEARLY_PRODUCT_ID;
  const legacy = process.env.POLAR_PRO_PRODUCT_ID;
  if (monthly) ids.push(monthly);
  if (yearly) ids.push(yearly);
  if (legacy) ids.push(legacy);
  return ids;
}

export default async function polarRoutes(fastify: FastifyInstance) {
  // Get pricing info
  fastify.get('/api/polar/prices', async (_request, reply) => {
    if (!fastify.polar) {
      return reply.status(503).send({ error: 'Polar not configured' });
    }

    const monthlyProductId = process.env.POLAR_MONTHLY_PRODUCT_ID;
    const yearlyProductId = process.env.POLAR_YEARLY_PRODUCT_ID;

    if (!monthlyProductId || !yearlyProductId) {
      return reply.status(503).send({ error: 'Polar products not configured' });
    }

    // Return cached data if valid
    if (priceCache && Date.now() < priceCache.expiry) {
      return priceCache.data;
    }

    try {
      const [monthlyProduct, yearlyProduct] = await Promise.all([
        fastify.polar.products.get({ id: monthlyProductId }),
        fastify.polar.products.get({ id: yearlyProductId }),
      ]);

      // Extract fixed price in cents from each product
      const monthlyPrice = monthlyProduct.prices.find(
        (p: { type: string }) => p.type === 'one_time' || p.type === 'recurring',
      );
      const yearlyPrice = yearlyProduct.prices.find(
        (p: { type: string }) => p.type === 'one_time' || p.type === 'recurring',
      );

      const monthlyPriceCents = (monthlyPrice as { priceAmount: number })?.priceAmount ?? 0;
      const yearlyPriceCents = (yearlyPrice as { priceAmount: number })?.priceAmount ?? 0;

      const yearlyPerMonthCents = Math.round(yearlyPriceCents / 12);
      const savingsPercent = monthlyPriceCents > 0
        ? Math.round((1 - yearlyPerMonthCents / monthlyPriceCents) * 100)
        : 0;

      const result = {
        monthly: {
          productId: monthlyProductId,
          priceCents: monthlyPriceCents,
          interval: 'month' as const,
        },
        yearly: {
          productId: yearlyProductId,
          priceCents: yearlyPriceCents,
          perMonthCents: yearlyPerMonthCents,
          interval: 'year' as const,
        },
        savingsPercent,
      };

      priceCache = { data: result, expiry: Date.now() + CACHE_TTL };
      return result;
    } catch (error) {
      fastify.log.error(error, 'Failed to fetch Polar prices');
      return reply.status(500).send({ error: 'Failed to fetch pricing' });
    }
  });

  // Create checkout session
  fastify.post('/api/polar/checkout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!fastify.polar) {
      return reply.status(503).send({ error: 'Polar not configured' });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Accept optional productId and discountCode from body
    const body = (request.body as { productId?: string; discountCode?: string }) || {};
    let productId = body.productId;
    const discountCode = body.discountCode;

    if (productId) {
      // Validate against whitelist
      const allowed = getAllowedProductIds();
      if (!allowed.includes(productId)) {
        return reply.status(400).send({ error: 'Invalid product ID' });
      }
    } else {
      // Fallback: monthly > legacy
      productId = process.env.POLAR_MONTHLY_PRODUCT_ID || process.env.POLAR_PRO_PRODUCT_ID;
    }

    if (!productId) {
      return reply.status(503).send({ error: 'Polar product not configured' });
    }

    const successUrl = process.env.POLAR_SUCCESS_URL ||
      `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=success&checkout_id={CHECKOUT_ID}`;

    try {
      // Resolve discount code to ID if provided
      let discountId: string | undefined;
      if (discountCode) {
        let found = false;
        for await (const discount of fastify.polar.discounts.list({})) {
          if (discount.code && discount.code.toLowerCase() === discountCode.toLowerCase()) {
            discountId = discount.id;
            found = true;
            break;
          }
        }
        if (!found) {
          return reply.status(400).send({ error: 'Invalid promo code' });
        }
      }

      // Create checkout with customer info
      const checkout = await fastify.polar.checkouts.create({
        products: [productId],
        successUrl,
        customerEmail: user.email,
        customerName: user.name || undefined,
        externalCustomerId: user.id,
        customerId: user.polarCustomerId || undefined,
        ...(discountId ? { discountId } : {}),
      });

      return { url: checkout.url };
    } catch (error) {
      fastify.log.error(error, 'Failed to create Polar checkout');
      return reply.status(500).send({ error: 'Failed to create checkout session' });
    }
  });

  // Customer portal
  fastify.post('/api/polar/portal', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!fastify.polar) {
      return reply.status(503).send({ error: 'Polar not configured' });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user?.polarCustomerId) {
      return reply.status(400).send({ error: 'No Polar billing account found' });
    }

    try {
      // Create customer session for portal access
      const session = await fastify.polar.customerSessions.create({
        customerId: user.polarCustomerId,
      });

      // Polar customer portal URL
      const portalUrl = `https://polar.sh/customer-portal?token=${session.token}`;
      return { url: portalUrl };
    } catch (error) {
      fastify.log.error(error, 'Failed to create Polar portal session');
      return reply.status(500).send({ error: 'Failed to create portal session' });
    }
  });

  // Webhook
  fastify.post('/api/polar/webhook', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (!webhookSecret) {
      fastify.log.error('POLAR_WEBHOOK_SECRET not configured');
      return reply.status(400).send({ error: 'Webhook secret not configured' });
    }

    try {
      const event = validateEvent(
        (request as unknown as { rawBody: Buffer }).rawBody,
        request.headers as Record<string, string>,
        webhookSecret,
      );

      fastify.log.info({ type: event.type }, 'Received Polar webhook');

      switch (event.type) {
        case 'subscription.created':
        case 'subscription.updated': {
          const subscription = event.data;
          const customerId = subscription.customerId;

          // Find user by Polar customer ID or external ID
          let user = await fastify.prisma.user.findFirst({
            where: { polarCustomerId: customerId },
          });

          // If not found by polarCustomerId, try to find by external ID and update
          if (!user && subscription.customer?.externalId) {
            user = await fastify.prisma.user.findUnique({
              where: { id: subscription.customer.externalId },
            });
            if (user) {
              await fastify.prisma.user.update({
                where: { id: user.id },
                data: { polarCustomerId: customerId },
              });
            }
          }

          if (user) {
            const currentPeriodEnd = subscription.currentPeriodEnd
              ? new Date(subscription.currentPeriodEnd)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

            await fastify.prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                polarSubscriptionId: subscription.id,
                plan: subscription.status === 'active' ? 'PRO' : 'FREE',
                status: subscription.status,
                currentPeriodEnd,
              },
              update: {
                polarSubscriptionId: subscription.id,
                plan: subscription.status === 'active' ? 'PRO' : 'FREE',
                status: subscription.status,
                currentPeriodEnd,
              },
            });
          }
          break;
        }

        case 'subscription.canceled':
        case 'subscription.revoked': {
          const subscription = event.data;
          await fastify.prisma.subscription.updateMany({
            where: { polarSubscriptionId: subscription.id },
            data: {
              status: 'canceled',
              plan: 'FREE',
            },
          });
          break;
        }

        case 'checkout.created': {
          fastify.log.info('Checkout created');
          break;
        }

        case 'checkout.updated': {
          const checkout = event.data;
          if (checkout.status === 'succeeded') {
            fastify.log.info('Checkout succeeded');
          }
          break;
        }
      }

      return { received: true };
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        fastify.log.error('Webhook signature verification failed');
        return reply.status(403).send({ error: 'Invalid signature' });
      }
      throw error;
    }
  });
}
