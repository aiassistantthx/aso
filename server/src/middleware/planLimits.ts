import { FastifyRequest, FastifyReply } from 'fastify';

const PLAN_LIMITS = {
  FREE: {
    maxLifetimeProjects: 1,        // Total projects ever created (even deleted)
    maxGenerationsPerProject: 3,   // AI generations per project
    maxTargetLanguages: 2,         // Additional languages (besides source)
  },
  PRO: {
    maxLifetimeProjects: Infinity,
    maxGenerationsPerProject: Infinity,
    maxTargetLanguages: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

/**
 * Check if user can create a new project (lifetime limit)
 */
export async function checkProjectLimit(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const [subscription, user] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { totalProjectsCreated: true } }),
  ]);

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxLifetimeProjects !== Infinity) {
    const totalCreated = user?.totalProjectsCreated ?? 0;
    if (totalCreated >= limits.maxLifetimeProjects) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: 'You have already used your free project. Upgrade to Pro for unlimited projects.',
        limit: 'lifetimeProjects',
        currentUsage: totalCreated,
        maxAllowed: limits.maxLifetimeProjects,
      });
      return false;
    }
  }
  return true;
}

/**
 * Check if project can do more AI generations
 */
export async function checkGenerationLimit(
  request: FastifyRequest,
  reply: FastifyReply,
  projectId: string
): Promise<boolean> {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const [subscription, project] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.unifiedProject.findUnique({ where: { id: projectId }, select: { generationCount: true } }),
  ]);

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxGenerationsPerProject !== Infinity) {
    const currentCount = project?.generationCount ?? 0;
    if (currentCount >= limits.maxGenerationsPerProject) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: `You have used all ${limits.maxGenerationsPerProject} free generations. Upgrade to Pro for unlimited AI generations.`,
        limit: 'generations',
        currentUsage: currentCount,
        maxAllowed: limits.maxGenerationsPerProject,
      });
      return false;
    }
  }
  return true;
}

/**
 * Check target languages limit
 */
export async function checkLanguageLimit(
  request: FastifyRequest,
  reply: FastifyReply,
  targetLanguagesCount: number
): Promise<boolean> {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxTargetLanguages !== Infinity) {
    if (targetLanguagesCount > limits.maxTargetLanguages) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: `Free plan allows up to ${limits.maxTargetLanguages} additional languages. Upgrade to Pro for all 40+ languages.`,
        limit: 'targetLanguages',
        currentUsage: targetLanguagesCount,
        maxAllowed: limits.maxTargetLanguages,
      });
      return false;
    }
  }
  return true;
}

/**
 * Increment project generation count
 */
export async function incrementGenerationCount(prisma: any, projectId: string): Promise<void> {
  await prisma.unifiedProject.update({
    where: { id: projectId },
    data: { generationCount: { increment: 1 } },
  });
}

/**
 * Increment user's lifetime project count
 */
export async function incrementProjectCount(prisma: any, userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totalProjectsCreated: { increment: 1 } },
  });
}

/**
 * Get user's current limits and usage
 */
export async function getUserLimitsInfo(prisma: any, userId: string, projectId?: string) {
  const [subscription, user, project] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { totalProjectsCreated: true } }),
    projectId ? prisma.unifiedProject.findUnique({ where: { id: projectId }, select: { generationCount: true } }) : null,
  ]);

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  return {
    plan,
    limits: {
      maxLifetimeProjects: limits.maxLifetimeProjects === Infinity ? null : limits.maxLifetimeProjects,
      maxGenerationsPerProject: limits.maxGenerationsPerProject === Infinity ? null : limits.maxGenerationsPerProject,
      maxTargetLanguages: limits.maxTargetLanguages === Infinity ? null : limits.maxTargetLanguages,
    },
    usage: {
      totalProjectsCreated: user?.totalProjectsCreated ?? 0,
      projectGenerationCount: project?.generationCount ?? 0,
    },
  };
}
