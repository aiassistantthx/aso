import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Stripe from 'stripe';

declare module 'fastify' {
  interface FastifyInstance {
    stripe: Stripe;
  }
}

async function stripePlugin(fastify: FastifyInstance) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    fastify.log.warn('STRIPE_SECRET_KEY not set, Stripe features disabled');
    // Create a dummy that throws on use
    fastify.decorate('stripe', null as unknown as Stripe);
    return;
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
  });

  fastify.decorate('stripe', stripe);
}

export default fp(stripePlugin);
