import { PrismaClient } from '@prisma/client';

// Pricing per 1M tokens (as of 2024)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
};

// DALL-E pricing per image
const IMAGE_PRICING: Record<string, Record<string, number>> = {
  'dall-e-3': {
    '1024x1024': 0.040,
    '1024x1792': 0.080,
    '1792x1024': 0.080,
  },
  'dall-e-2': {
    '1024x1024': 0.020,
    '512x512': 0.018,
    '256x256': 0.016,
  },
};

export interface AIUsageLogInput {
  userId?: string;
  projectId?: string;
  operationType: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  success?: boolean;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
  // For image generation
  imageSize?: string;
  imageCount?: number;
}

function calculateCost(input: AIUsageLogInput): number {
  const { model, promptTokens = 0, completionTokens = 0, imageSize, imageCount = 1 } = input;

  // Image generation pricing
  if (model.startsWith('dall-e')) {
    const modelPricing = IMAGE_PRICING[model];
    if (modelPricing && imageSize) {
      return (modelPricing[imageSize] || 0.040) * imageCount;
    }
    return 0.040 * imageCount; // Default DALL-E 3 price
  }

  // Text model pricing
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    // Default to gpt-4o-mini pricing for unknown models
    return (promptTokens * 0.15 + completionTokens * 0.60) / 1_000_000;
  }

  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}

export async function logAIUsage(prisma: PrismaClient, input: AIUsageLogInput): Promise<void> {
  try {
    const estimatedCost = calculateCost(input);

    await prisma.aIUsageLog.create({
      data: {
        userId: input.userId,
        projectId: input.projectId,
        operationType: input.operationType,
        model: input.model,
        promptTokens: input.promptTokens || 0,
        completionTokens: input.completionTokens || 0,
        totalTokens: input.totalTokens || (input.promptTokens || 0) + (input.completionTokens || 0),
        estimatedCost,
        durationMs: input.durationMs || 0,
        success: input.success ?? true,
        errorMessage: input.errorMessage,
        metadata: input.metadata || null,
      },
    });
  } catch (error) {
    // Don't throw - logging should not break the main flow
    console.error('Failed to log AI usage:', error);
  }
}

// Helper to extract token usage from OpenAI response
export function extractTokenUsage(response: { usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } }): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  return {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
    totalTokens: response.usage?.total_tokens || 0,
  };
}

// Get aggregated stats for dashboard
export async function getAIUsageStats(prisma: PrismaClient, days: number = 30): Promise<{
  totalCost: number;
  totalRequests: number;
  byOperation: Record<string, { count: number; cost: number }>;
  byModel: Record<string, { count: number; cost: number }>;
  dailyCosts: Array<{ date: string; cost: number; requests: number }>;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const logs = await prisma.aIUsageLog.findMany({
    where: {
      createdAt: { gte: since },
    },
    select: {
      operationType: true,
      model: true,
      estimatedCost: true,
      createdAt: true,
    },
  });

  const byOperation: Record<string, { count: number; cost: number }> = {};
  const byModel: Record<string, { count: number; cost: number }> = {};
  const dailyMap: Record<string, { cost: number; requests: number }> = {};

  let totalCost = 0;

  for (const log of logs) {
    totalCost += log.estimatedCost;

    // By operation
    if (!byOperation[log.operationType]) {
      byOperation[log.operationType] = { count: 0, cost: 0 };
    }
    byOperation[log.operationType].count++;
    byOperation[log.operationType].cost += log.estimatedCost;

    // By model
    if (!byModel[log.model]) {
      byModel[log.model] = { count: 0, cost: 0 };
    }
    byModel[log.model].count++;
    byModel[log.model].cost += log.estimatedCost;

    // Daily
    const dateKey = log.createdAt.toISOString().split('T')[0];
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { cost: 0, requests: 0 };
    }
    dailyMap[dateKey].cost += log.estimatedCost;
    dailyMap[dateKey].requests++;
  }

  const dailyCosts = Object.entries(dailyMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCost,
    totalRequests: logs.length,
    byOperation,
    byModel,
    dailyCosts,
  };
}
