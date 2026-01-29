import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { checkMetadataProjectLimit } from '../middleware/planLimits.js';

const IOS_LIMITS: Record<string, number> = {
  appName: 30,
  subtitle: 30,
  description: 4000,
  whatsNew: 4000,
  keywords: 100,
};

const ANDROID_LIMITS: Record<string, number> = {
  appName: 30,
  shortDescription: 80,
  fullDescription: 4000,
  whatsNew: 500,
};

function getLimits(platform: string) {
  return platform === 'android' ? ANDROID_LIMITS : IOS_LIMITS;
}

export default async function metadataRoutes(fastify: FastifyInstance) {
  const openaiKey = process.env.OPENAI_API_KEY;
  let openai: OpenAI | null = null;

  if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey });
  }

  // List user's metadata projects
  fastify.get('/api/metadata', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const projects = await fastify.prisma.metadataProject.findMany({
      where: { userId: request.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        platform: true,
        appName: true,
        updatedAt: true,
      },
    });
    return projects;
  });

  // Create metadata project
  fastify.post('/api/metadata', {
    onRequest: [fastify.authenticate],
    preHandler: [checkMetadataProjectLimit],
  }, async (request, reply) => {
    const { name, platform } = request.body as {
      name: string;
      platform: string;
    };

    if (!name || !platform) {
      return reply.status(400).send({ error: 'Name and platform are required' });
    }

    if (platform !== 'ios' && platform !== 'android') {
      return reply.status(400).send({ error: 'Platform must be "ios" or "android"' });
    }

    const project = await fastify.prisma.metadataProject.create({
      data: {
        userId: request.user.id,
        name,
        platform,
      },
    });

    return reply.status(201).send(project);
  });

  // Get metadata project
  fastify.get('/api/metadata/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.metadataProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Metadata project not found' });
    }

    return project;
  });

  // Update metadata project
  fastify.put('/api/metadata/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.metadataProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Metadata project not found' });
    }

    const updated = await fastify.prisma.metadataProject.update({
      where: { id },
      data: {
        name: body.name as string | undefined,
        platform: body.platform as string | undefined,
        inputMode: body.inputMode as string | undefined,
        appName: body.appName as string | undefined,
        briefDescription: body.briefDescription as string | undefined,
        targetKeywords: body.targetKeywords as string | undefined,
        editedMetadata: body.editedMetadata as Prisma.InputJsonValue | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        translations: body.translations as Prisma.InputJsonValue | undefined,
      },
    });

    return updated;
  });

  // Delete metadata project
  fastify.delete('/api/metadata/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.metadataProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Metadata project not found' });
    }

    await fastify.prisma.metadataProject.delete({ where: { id } });
    return reply.status(204).send();
  });

  // Generate metadata with AI
  fastify.post('/api/metadata/:id/generate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };

    const project = await fastify.prisma.metadataProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Metadata project not found' });
    }

    const limits = getLimits(project.platform);
    const fieldsDescription = Object.entries(limits)
      .map(([field, limit]) => `${field} (max ${limit} chars)`)
      .join(', ');

    const keywordsLine = project.inputMode === 'keywords' && project.targetKeywords
      ? `\nTarget keywords to incorporate: "${project.targetKeywords}"`
      : '';

    const prompt = `You are an expert ASO (App Store Optimization) copywriter. Generate optimized ${project.platform === 'ios' ? 'App Store (iOS)' : 'Google Play (Android)'} metadata.

App Name: "${project.appName}"
Brief Description: "${project.briefDescription}"${keywordsLine}

Return a JSON object with these fields: ${fieldsDescription}

Rules:
- Respect character limits strictly — each field must not exceed its limit
- Optimize for discoverability with relevant keywords
- Use a professional marketing tone with short paragraphs in descriptions
- ${project.platform === 'ios' ? 'For keywords: comma-separated, no spaces after commas, exclude words already in title/subtitle' : 'For shortDescription: make it catchy and keyword-rich'}
- Return ONLY valid JSON, no markdown fences or extra text`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an ASO expert. Return only valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      const metadata = JSON.parse(content);

      const updated = await fastify.prisma.metadataProject.update({
        where: { id },
        data: {
          generatedMetadata: metadata as Prisma.InputJsonValue,
          editedMetadata: metadata as Prisma.InputJsonValue,
        },
      });

      return updated;
    } catch (error) {
      fastify.log.error(error, 'Metadata generation error');
      return reply.status(500).send({ error: 'Failed to generate metadata' });
    }
  });

  // Translate metadata
  fastify.post('/api/metadata/:id/translate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const { targetLanguages } = request.body as { targetLanguages: string[] };

    if (!targetLanguages?.length) {
      return reply.status(400).send({ error: 'targetLanguages are required' });
    }

    const project = await fastify.prisma.metadataProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Metadata project not found' });
    }

    // Check plan limits for target languages
    const subscription = await fastify.prisma.subscription.findUnique({
      where: { userId: request.user.id },
    });

    const plan = subscription?.plan ?? 'FREE';
    if (plan === 'FREE' && targetLanguages.length > 2) {
      return reply.status(403).send({
        error: 'Free plan allows up to 2 target languages. Upgrade to Pro for unlimited.',
        limit: 'targetLanguages',
      });
    }

    const editedMetadata = project.editedMetadata as Record<string, string> | null;
    if (!editedMetadata) {
      return reply.status(400).send({ error: 'No metadata to translate. Generate metadata first.' });
    }

    const limits = getLimits(project.platform);
    const translations: Record<string, Record<string, string>> = {};

    for (const lang of targetLanguages) {
      if (lang === project.sourceLanguage) continue;

      const fieldsDescription = Object.entries(limits)
        .map(([field, limit]) => `${field} (max ${limit} chars)`)
        .join(', ');

      const prompt = `Translate this ${project.platform === 'ios' ? 'App Store (iOS)' : 'Google Play (Android)'} metadata from ${project.sourceLanguage} to ${lang}.

Current metadata:
${JSON.stringify(editedMetadata, null, 2)}

Rules:
- Adapt the marketing tone to the target culture
- Respect character limits strictly: ${fieldsDescription}
- ${project.platform === 'ios' ? 'For keywords: use equivalent search terms in the target language, comma-separated, no spaces' : 'Keep shortDescription catchy in target language'}
- Return ONLY valid JSON with the same field names`;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a professional ASO translator. Return only valid JSON.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content || '{}';
        translations[lang] = JSON.parse(content);
      } catch (error) {
        fastify.log.error(error, `Metadata translation error for ${lang}`);
        translations[lang] = { ...editedMetadata };
      }
    }

    const updated = await fastify.prisma.metadataProject.update({
      where: { id },
      data: {
        targetLanguages,
        translations: translations as Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}
