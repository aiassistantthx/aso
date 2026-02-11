import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

export default async function authRoutes(fastify: FastifyInstance) {
  // Firebase Auth - verify Firebase token and return/create user
  fastify.post('/api/auth/firebase', async (request, reply) => {
    const { idToken } = request.body as { idToken: string };

    if (!idToken) {
      return reply.status(400).send({ error: 'Firebase ID token is required' });
    }

    if (!fastify.firebaseAuth) {
      return reply.status(503).send({ error: 'Firebase Auth is not configured' });
    }

    try {
      // Verify Firebase token
      const decodedToken = await fastify.firebaseAuth.verifyIdToken(idToken);
      const { uid, email, name } = decodedToken;

      if (!email) {
        return reply.status(400).send({ error: 'Email is required for authentication' });
      }

      // Try to find user by Firebase UID first
      let user = await fastify.prisma.user.findUnique({
        where: { firebaseUid: uid },
        include: { subscription: true },
      });

      if (!user) {
        // Try to find by email (existing legacy user)
        user = await fastify.prisma.user.findUnique({
          where: { email },
          include: { subscription: true },
        });

        if (user) {
          // Link Firebase UID to existing user (migration)
          user = await fastify.prisma.user.update({
            where: { id: user.id },
            data: {
              firebaseUid: uid,
              authProvider: 'firebase',
              name: user.name || name || undefined,
            },
            include: { subscription: true },
          });
        } else {
          // Create new user
          user = await fastify.prisma.user.create({
            data: {
              email,
              firebaseUid: uid,
              authProvider: 'firebase',
              name: name || undefined,
            },
            include: { subscription: true },
          });
        }
      }

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.subscription?.plan ?? 'FREE',
          subscription: user.subscription ? {
            status: user.subscription.status,
            plan: user.subscription.plan,
            currentPeriodEnd: user.subscription.currentPeriodEnd,
          } : null,
        },
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Firebase auth error');
      return reply.status(401).send({ error: 'Invalid Firebase token' });
    }
  });

  // Register
  fastify.post('/api/auth/register', async (request, reply) => {
    const { email, password, name } = request.body as {
      email: string;
      password: string;
      name?: string;
    };

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return reply.status(400).send({ error: 'Password must be at least 6 characters' });
    }

    const existing = await fastify.prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await fastify.prisma.user.create({
      data: { email, passwordHash, name },
    });

    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    return reply.send({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });

  // Login
  fastify.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    // Users without passwordHash are Firebase-only users
    if (!user.passwordHash) {
      return reply.status(401).send({ error: 'Please sign in with Google or Magic Link' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = fastify.jwt.sign({ id: user.id, email: user.email });
    return reply.send({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  });

  // Toggle plan (admin only - uses ADMIN_EMAILS env var)
  fastify.post('/api/auth/toggle-plan', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { subscription: true },
    });

    // Check if user email is in admin list
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!user || !adminEmails.includes(user.email.toLowerCase())) {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    const currentPlan = user.subscription?.plan ?? 'FREE';
    const newPlan = currentPlan === 'FREE' ? 'PRO' : 'FREE';

    if (user.subscription) {
      await fastify.prisma.subscription.update({
        where: { userId: user.id },
        data: { plan: newPlan, status: 'active', currentPeriodEnd: new Date('2099-12-31') },
      });
    } else {
      await fastify.prisma.subscription.create({
        data: {
          userId: user.id,
          plan: newPlan,
          status: 'active',
          currentPeriodEnd: new Date('2099-12-31'),
        },
      });
    }

    return reply.send({ plan: newPlan });
  });

  // Get current user
  fastify.get('/api/auth/me', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { subscription: true },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.send({
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.subscription?.plan ?? 'FREE',
      subscription: user.subscription ? {
        status: user.subscription.status,
        plan: user.subscription.plan,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      } : null,
    });
  });
}
