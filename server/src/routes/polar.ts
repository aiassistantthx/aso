import { FastifyInstance } from 'fastify';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';

export default async function polarRoutes(fastify: FastifyInstance) {
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

    const productId = process.env.POLAR_PRO_PRODUCT_ID;
    if (!productId) {
      return reply.status(503).send({ error: 'Polar product not configured' });
    }

    const successUrl = process.env.POLAR_SUCCESS_URL ||
      `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=success&checkout_id={CHECKOUT_ID}`;

    try {
      // Create checkout with customer info
      const checkout = await fastify.polar.checkouts.create({
        products: [productId],
        successUrl,
        customerEmail: user.email,
        customerName: user.name || undefined,
        externalCustomerId: user.id,
        customerId: user.polarCustomerId || undefined,
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
