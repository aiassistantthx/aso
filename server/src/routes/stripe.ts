import { FastifyInstance } from 'fastify';

export default async function stripeRoutes(fastify: FastifyInstance) {
  // Create checkout session
  fastify.post('/api/stripe/checkout', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!fastify.stripe) {
      return reply.status(503).send({ error: 'Stripe not configured' });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Create or reuse Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await fastify.stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await fastify.prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    if (!priceId) {
      return reply.status(503).send({ error: 'Stripe price not configured' });
    }

    const session = await fastify.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=success`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?checkout=canceled`,
    });

    return { url: session.url };
  });

  // Customer portal
  fastify.post('/api/stripe/portal', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!fastify.stripe) {
      return reply.status(503).send({ error: 'Stripe not configured' });
    }

    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
    });

    if (!user?.stripeCustomerId) {
      return reply.status(400).send({ error: 'No billing account found' });
    }

    const session = await fastify.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard`,
    });

    return { url: session.url };
  });

  // Webhook
  fastify.post('/api/stripe/webhook', {
    config: { rawBody: true },
  }, async (request, reply) => {
    if (!fastify.stripe) {
      return reply.status(503).send({ error: 'Stripe not configured' });
    }

    const sig = request.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return reply.status(400).send({ error: 'Missing signature or webhook secret' });
    }

    let event;
    try {
      event = fastify.stripe.webhooks.constructEvent(
        (request as unknown as { rawBody: string }).rawBody,
        sig,
        webhookSecret,
      );
    } catch (err) {
      fastify.log.error(err, 'Webhook signature verification failed');
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        const user = await fastify.prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const stripeSub = await fastify.stripe.subscriptions.retrieve(subscriptionId);
          await fastify.prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeSubscriptionId: subscriptionId,
              plan: 'PRO',
              status: stripeSub.status,
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscriptionId,
              plan: 'PRO',
              status: stripeSub.status,
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await fastify.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
            plan: sub.status === 'active' ? 'PRO' : 'FREE',
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await fastify.prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: 'canceled',
            plan: 'FREE',
          },
        });
        break;
      }
    }

    return { received: true };
  });
}
