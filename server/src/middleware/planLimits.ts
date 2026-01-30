import { FastifyRequest, FastifyReply } from 'fastify';

const PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
    maxTranslationsPerDay: 5,
    maxTargetLanguages: 2,
    maxMetadataProjects: 1,
    maxMetadataTargetLanguages: 2,
    maxWizardProjects: 1,
    maxWizardTargetLanguages: 2,
    maxWizardIconGenerations: 1,
  },
  PRO: {
    maxProjects: Infinity,
    maxTranslationsPerDay: Infinity,
    maxTargetLanguages: Infinity,
    maxMetadataProjects: Infinity,
    maxMetadataTargetLanguages: Infinity,
    maxWizardProjects: Infinity,
    maxWizardTargetLanguages: Infinity,
    maxWizardIconGenerations: Infinity,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: PlanType) {
  return PLAN_LIMITS[plan];
}

export async function checkProjectLimit(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxProjects !== Infinity) {
    const projectCount = await prisma.project.count({ where: { userId } });
    if (projectCount >= limits.maxProjects) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: `Free plan allows up to ${limits.maxProjects} projects. Upgrade to Pro for unlimited projects.`,
        limit: 'projects',
      });
      return;
    }
  }
}

export async function checkMetadataProjectLimit(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxMetadataProjects !== Infinity) {
    const count = await prisma.metadataProject.count({ where: { userId } });
    if (count >= limits.maxMetadataProjects) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: `Free plan allows up to ${limits.maxMetadataProjects} metadata project${limits.maxMetadataProjects !== 1 ? 's' : ''}. Upgrade to Pro for unlimited.`,
        limit: 'metadataProjects',
      });
      return;
    }
  }
}

export async function checkWizardProjectLimit(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id;
  const prisma = request.server.prisma;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const plan = subscription?.plan ?? 'FREE';
  const limits = getPlanLimits(plan);

  if (limits.maxWizardProjects !== Infinity) {
    const count = await prisma.wizardProject.count({ where: { userId } });
    if (count >= limits.maxWizardProjects) {
      reply.status(403).send({
        error: 'Plan limit reached',
        message: `Free plan allows up to ${limits.maxWizardProjects} wizard project${limits.maxWizardProjects !== 1 ? 's' : ''}. Upgrade to Pro for unlimited.`,
        limit: 'wizardProjects',
      });
      return;
    }
  }
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
