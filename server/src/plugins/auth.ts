import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import fjwt from '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}

async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fjwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    sign: { expiresIn: '7d' },
  });

  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);

    // Try Firebase token verification first
    if (fastify.firebaseAuth) {
      try {
        const decodedToken = await fastify.firebaseAuth.verifyIdToken(token);

        // Find user by Firebase UID
        const user = await fastify.prisma.user.findUnique({
          where: { firebaseUid: decodedToken.uid },
        });

        if (user) {
          request.user = { id: user.id, email: user.email };
          return;
        }

        // If no user found by UID, try to find by email and link
        if (decodedToken.email) {
          const userByEmail = await fastify.prisma.user.findUnique({
            where: { email: decodedToken.email },
          });

          if (userByEmail) {
            // Link Firebase UID to existing user (migration)
            await fastify.prisma.user.update({
              where: { id: userByEmail.id },
              data: {
                firebaseUid: decodedToken.uid,
                authProvider: 'firebase',
              },
            });
            request.user = { id: userByEmail.id, email: userByEmail.email };
            return;
          }
        }

        // Firebase token valid but no user - this shouldn't happen for protected routes
        // The /api/auth/firebase endpoint handles user creation
        return reply.status(401).send({ error: 'User not found' });
      } catch {
        // Firebase verification failed, try legacy JWT
      }
    }

    // Fallback to legacy JWT verification
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin);
