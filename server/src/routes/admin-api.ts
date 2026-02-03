import { FastifyInstance } from 'fastify';
import { getAIUsageStats } from '../utils/aiUsageLogger.js';

export default async function adminApiRoutes(fastify: FastifyInstance) {
  // Dashboard statistics endpoint
  fastify.get('/api/admin/stats', async (request, reply) => {
    // Simple auth check via session cookie (AdminJS sets this)
    const adminCookie = request.cookies?.adminjs;
    if (!adminCookie) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // User stats
    const [totalUsers, usersToday, usersWeek, usersMonth] = await Promise.all([
      fastify.prisma.user.count(),
      fastify.prisma.user.count({ where: { createdAt: { gte: today } } }),
      fastify.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      fastify.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
    ]);

    // Subscription stats
    const subscriptions = await fastify.prisma.subscription.groupBy({
      by: ['plan'],
      _count: true,
    });
    const planCounts: Record<string, number> = { FREE: 0, PRO: 0 };
    for (const s of subscriptions) {
      planCounts[s.plan] = s._count;
    }
    // Users without subscription are FREE
    const usersWithSub = subscriptions.reduce((acc, s) => acc + s._count, 0);
    planCounts.FREE = totalUsers - usersWithSub + (planCounts.FREE || 0);

    // Project stats
    const [totalProjects, wizardProjects, manualProjects] = await Promise.all([
      fastify.prisma.unifiedProject.count(),
      fastify.prisma.unifiedProject.count({ where: { mode: 'wizard' } }),
      fastify.prisma.unifiedProject.count({ where: { mode: 'manual' } }),
    ]);

    // Screenshot stats
    const totalScreenshots = await fastify.prisma.unifiedScreenshot.count();

    // Get projects with translations to count localized screenshots
    const projectsWithTranslations = await fastify.prisma.unifiedProject.findMany({
      where: {
        OR: [
          { wizardTranslatedHeadlines: { not: null } },
          { metadataTranslations: { not: null } },
        ],
      },
      select: {
        id: true,
        targetLanguages: true,
        wizardUploadedScreenshots: true,
        _count: { select: { screenshots: true } },
      },
    });

    let localizedScreenshotsCount = 0;
    let totalLanguagesUsed = 0;
    const languageUsage: Record<string, number> = {};

    for (const p of projectsWithTranslations) {
      const screenshotCount = p._count.screenshots || (p.wizardUploadedScreenshots as string[] | null)?.length || 0;
      const langCount = p.targetLanguages.length;
      localizedScreenshotsCount += screenshotCount * langCount;
      totalLanguagesUsed += langCount;

      for (const lang of p.targetLanguages) {
        languageUsage[lang] = (languageUsage[lang] || 0) + 1;
      }
    }

    // Top languages
    const topLanguages = Object.entries(languageUsage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang, count]) => ({ language: lang, count }));

    // Recent users
    const recentUsers = await fastify.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    // AI costs (last 30 days)
    const aiStats = await getAIUsageStats(fastify.prisma, 30);

    // Promo code stats
    const [totalPromoCodes, activePromoCodes, totalRedemptions] = await Promise.all([
      fastify.prisma.promoCode.count(),
      fastify.prisma.promoCode.count({ where: { isActive: true } }),
      fastify.prisma.promoRedemption.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        today: usersToday,
        week: usersWeek,
        month: usersMonth,
        byPlan: planCounts,
      },
      projects: {
        total: totalProjects,
        wizard: wizardProjects,
        manual: manualProjects,
      },
      screenshots: {
        total: totalScreenshots,
        localized: localizedScreenshotsCount,
      },
      languages: {
        totalUsed: totalLanguagesUsed,
        top: topLanguages,
      },
      ai: {
        totalCost: aiStats.totalCost,
        totalRequests: aiStats.totalRequests,
        byOperation: aiStats.byOperation,
        byModel: aiStats.byModel,
        dailyCosts: aiStats.dailyCosts,
      },
      promoCodes: {
        total: totalPromoCodes,
        active: activePromoCodes,
        redemptions: totalRedemptions,
      },
      recentUsers,
    };
  });

  // Promo code validation endpoint (for frontend use)
  fastify.post('/api/promo/validate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { code } = request.body as { code: string };

    if (!code) {
      return reply.status(400).send({ error: 'Code is required' });
    }

    const promoCode = await fastify.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return reply.status(404).send({ error: 'Invalid promo code' });
    }

    if (!promoCode.isActive) {
      return reply.status(400).send({ error: 'This promo code is no longer active' });
    }

    const now = new Date();
    if (promoCode.validFrom > now) {
      return reply.status(400).send({ error: 'This promo code is not yet valid' });
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return reply.status(400).send({ error: 'This promo code has expired' });
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return reply.status(400).send({ error: 'This promo code has reached its usage limit' });
    }

    // Check if user already used this code
    const existingRedemption = await fastify.prisma.promoRedemption.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promoCode.id,
          userId: request.user.id,
        },
      },
    });

    if (existingRedemption) {
      return reply.status(400).send({ error: 'You have already used this promo code' });
    }

    return {
      valid: true,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      freeTrialDays: promoCode.freeTrialDays,
      description: promoCode.description,
    };
  });

  // Redeem promo code endpoint
  fastify.post('/api/promo/redeem', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { code } = request.body as { code: string };

    if (!code) {
      return reply.status(400).send({ error: 'Code is required' });
    }

    const promoCode = await fastify.prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode || !promoCode.isActive) {
      return reply.status(404).send({ error: 'Invalid or inactive promo code' });
    }

    const now = new Date();
    if (promoCode.validFrom > now || (promoCode.validUntil && promoCode.validUntil < now)) {
      return reply.status(400).send({ error: 'This promo code is not valid at this time' });
    }

    if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
      return reply.status(400).send({ error: 'This promo code has reached its usage limit' });
    }

    // Check if user already used this code
    const existingRedemption = await fastify.prisma.promoRedemption.findUnique({
      where: {
        promoCodeId_userId: {
          promoCodeId: promoCode.id,
          userId: request.user.id,
        },
      },
    });

    if (existingRedemption) {
      return reply.status(400).send({ error: 'You have already used this promo code' });
    }

    // Handle free trial promo codes
    if (promoCode.discountType === 'free_trial' && promoCode.freeTrialDays > 0) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + promoCode.freeTrialDays);

      // Create or update subscription with trial
      await fastify.prisma.subscription.upsert({
        where: { userId: request.user.id },
        create: {
          userId: request.user.id,
          plan: 'PRO',
          status: 'trialing',
          currentPeriodEnd: trialEnd,
        },
        update: {
          plan: 'PRO',
          status: 'trialing',
          currentPeriodEnd: trialEnd,
        },
      });
    }

    // Record redemption
    await fastify.prisma.$transaction([
      fastify.prisma.promoRedemption.create({
        data: {
          promoCodeId: promoCode.id,
          userId: request.user.id,
        },
      }),
      fastify.prisma.promoCode.update({
        where: { id: promoCode.id },
        data: { usedCount: { increment: 1 } },
      }),
    ]);

    return {
      success: true,
      message: promoCode.discountType === 'free_trial'
        ? `You now have ${promoCode.freeTrialDays} days of free PRO access!`
        : 'Promo code applied successfully',
    };
  });
}
