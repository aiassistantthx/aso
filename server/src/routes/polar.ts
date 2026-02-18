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
      let discountId: string | undefined;

      // Check local promo codes first (created in admin panel)
      if (discountCode) {
        const localPromo = await fastify.prisma.promoCode.findUnique({
          where: { code: discountCode.toUpperCase() },
        });

        if (localPromo) {
          // Validate the local promo code
          if (!localPromo.isActive) {
            return reply.status(400).send({ error: 'This promo code is no longer active' });
          }
          const now = new Date();
          if (localPromo.validFrom > now) {
            return reply.status(400).send({ error: 'This promo code is not yet valid' });
          }
          if (localPromo.validUntil && localPromo.validUntil < now) {
            return reply.status(400).send({ error: 'This promo code has expired' });
          }
          if (localPromo.maxUses && localPromo.usedCount >= localPromo.maxUses) {
            return reply.status(400).send({ error: 'This promo code has reached its usage limit' });
          }
          const existingRedemption = await fastify.prisma.promoRedemption.findUnique({
            where: {
              promoCodeId_userId: {
                promoCodeId: localPromo.id,
                userId: user.id,
              },
            },
          });
          if (existingRedemption) {
            return reply.status(400).send({ error: 'You have already used this promo code' });
          }

          // For free_trial codes: grant PRO access directly, skip Polar
          if (localPromo.discountType === 'free_trial' && localPromo.freeTrialDays > 0) {
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + localPromo.freeTrialDays);

            await fastify.prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                plan: 'PRO',
                status: 'trialing',
                currentPeriodEnd: trialEnd,
              },
              update: {
                plan: 'PRO',
                status: 'trialing',
                currentPeriodEnd: trialEnd,
              },
            });

            // Record redemption
            await fastify.prisma.$transaction([
              fastify.prisma.promoRedemption.create({
                data: {
                  promoCodeId: localPromo.id,
                  userId: user.id,
                },
              }),
              fastify.prisma.promoCode.update({
                where: { id: localPromo.id },
                data: { usedCount: { increment: 1 } },
              }),
            ]);

            const appUrl = process.env.APP_URL || 'http://localhost:3000';
            return { url: `${appUrl}/dashboard?promo=success&days=${localPromo.freeTrialDays}` };
          }

          // For percent/fixed local codes: use stored Polar discount ID
          if (localPromo.polarDiscountId) {
            discountId = localPromo.polarDiscountId;
          }
          // Fall through to Polar discount lookup if no stored ID
        }
      }

      // Resolve discount code to Polar discount ID if not already resolved
      if (discountCode && !discountId) {
        try {
          const discountsResponse = await fastify.polar.discounts.list({});
          const match = discountsResponse.result.items.find(
            (d: { code?: string | null }) => d.code && d.code.toLowerCase() === discountCode.toLowerCase(),
          );
          if (match) {
            discountId = match.id;
          }
        } catch (polarDiscountError) {
          fastify.log.warn(polarDiscountError, 'Failed to lookup Polar discounts');
        }
        if (!discountId) {
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

      return { url: session.customerPortalUrl };
    } catch (error) {
      fastify.log.error(error, 'Failed to create Polar portal session');
      return reply.status(500).send({ error: 'Failed to create portal session' });
    }
  });

  // Cancel subscription
  fastify.post('/api/polar/cancel', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!fastify.polar) {
      return reply.status(503).send({ error: 'Polar not configured' });
    }

    const { reason, comment } = (request.body as { reason?: string; comment?: string }) || {};

    const subscription = await fastify.prisma.subscription.findUnique({
      where: { userId: request.user.id },
    });

    if (!subscription) {
      return reply.status(404).send({ error: 'No subscription found' });
    }

    if (!subscription.polarSubscriptionId) {
      return reply.status(400).send({ error: 'Cannot cancel a manually granted subscription' });
    }

    if (subscription.status === 'canceled') {
      return reply.status(400).send({ error: 'Subscription is already canceled' });
    }

    try {
      const validReasons = ['customer_service', 'low_quality', 'missing_features', 'switched_service', 'too_complex', 'too_expensive', 'unused', 'other'] as const;
      const cancellationReason = reason && validReasons.includes(reason as typeof validReasons[number])
        ? reason as typeof validReasons[number]
        : undefined;

      await fastify.polar.subscriptions.update({
        id: subscription.polarSubscriptionId,
        subscriptionUpdate: {
          cancelAtPeriodEnd: true,
          ...(cancellationReason ? { customerCancellationReason: cancellationReason } : {}),
          ...(comment ? { customerCancellationComment: comment } : {}),
        },
      });

      await fastify.prisma.subscription.update({
        where: { userId: request.user.id },
        data: { status: 'canceled' },
      });

      return {
        success: true,
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
      };
    } catch (error) {
      fastify.log.error(error, 'Failed to cancel subscription via Polar');
      return reply.status(500).send({ error: 'Failed to cancel subscription' });
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

            // If cancelAtPeriodEnd is set, keep PRO but mark as canceled
            const cancelAtPeriodEnd = (subscription as unknown as { cancelAtPeriodEnd?: boolean }).cancelAtPeriodEnd;
            const plan = cancelAtPeriodEnd ? 'PRO' : (subscription.status === 'active' ? 'PRO' : 'FREE');
            const status = cancelAtPeriodEnd ? 'canceled' : subscription.status;

            await fastify.prisma.subscription.upsert({
              where: { userId: user.id },
              create: {
                userId: user.id,
                polarSubscriptionId: subscription.id,
                plan,
                status,
                currentPeriodEnd,
              },
              update: {
                polarSubscriptionId: subscription.id,
                plan,
                status,
                currentPeriodEnd,
              },
            });
          }
          break;
        }

        case 'subscription.canceled': {
          // Canceled = cancel at period end confirmed, keep PRO until period ends
          const subscription = event.data;
          await fastify.prisma.subscription.updateMany({
            where: { polarSubscriptionId: subscription.id },
            data: {
              status: 'canceled',
            },
          });
          break;
        }

        case 'subscription.revoked': {
          // Revoked = subscription fully terminated, remove PRO access
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
