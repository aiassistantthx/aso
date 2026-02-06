import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';

export default async function authRoutes(fastify: FastifyInstance) {
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

  // Toggle plan (admin only - vorobyeviv@gmail.com)
  fastify.post('/api/auth/toggle-plan', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const user = await fastify.prisma.user.findUnique({
      where: { id: request.user.id },
      include: { subscription: true },
    });

    if (!user || user.email !== 'vorobyeviv@gmail.com') {
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
