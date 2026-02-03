import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Polar } from '@polar-sh/sdk';

declare module 'fastify' {
  interface FastifyInstance {
    polar: Polar | null;
  }
}

async function polarPlugin(fastify: FastifyInstance) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    fastify.log.warn('POLAR_ACCESS_TOKEN not set, Polar features disabled');
    fastify.decorate('polar', null);
    return;
  }

  const polar = new Polar({
    accessToken,
    server: (process.env.POLAR_MODE as 'sandbox' | 'production') || 'sandbox',
  });

  fastify.decorate('polar', polar);
}

export default fp(polarPlugin);
