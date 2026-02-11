import { FastifyRequest, FastifyReply } from 'fastify';

const PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
    maxTranslationsPerDay: 5,
    maxTargetLanguages: 2,
    maxWizardProjects: 1,
    maxWizardTargetLanguages: 2,
    maxWizardIconGenerations: 1,
  },
  PRO: {
    maxProjects: Infinity,
    maxTranslationsPerDay: Infinity,
    maxTargetLanguages: Infinity,
    maxWizardProjects: Infinity,
    maxWizardTargetLanguages: Infinity,
    maxWizardIconGenerations: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export async function checkUnifiedProjectLimit(request: FastifyRequest, reply: FastifyReply, mode: 'wizard' | 'manual') {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (mode === 'wizard') {
    if (limits.maxWizardProjects !== Infinity) {
      const count = await prisma.unifiedProject.count({ where: { userId, mode: 'wizard' } });
      if (count >= limits.maxWizardProjects) {
        reply.status(403).send({
          error: 'Plan limit reached',
          message: `Free plan allows up to ${limits.maxWizardProjects} wizard project${limits.maxWizardProjects !== 1 ? 's' : ''}. Upgrade to Pro for unlimited.`,
          limit: 'wizardProjects',
        });
        return false;
      }
    }
  } else {
    if (limits.maxProjects !== Infinity) {
      const count = await prisma.unifiedProject.count({ where: { userId, mode: 'manual' } });
      if (count >= limits.maxProjects) {
        reply.status(403).send({
          error: 'Plan limit reached',
          message: `Free plan allows up to ${limits.maxProjects} projects. Upgrade to Pro for unlimited.`,
          limit: 'projects',
        });
        return false;
      }
    }
  }
  return true;
}

export async function checkTranslationLimit(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxTranslationsPerDay !== Infinity) {
    // For free plan, we track translations per day in-memory
    // In production, this should use Redis or a DB counter
    // For now, we'll let it through and rely on frontend to show limit info
  }
}
