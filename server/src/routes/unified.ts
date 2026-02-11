import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import { getPlanLimits } from '../middleware/planLimits.js';
import { UPLOADS_DIR } from '../config.js';
import { getPrompt, renderPrompt } from '../utils/prompts.js';
import { logAIUsage, extractTokenUsage } from '../utils/aiUsageLogger.js';

// Input limits for user-provided fields
const INPUT_LIMITS = {
  appName: 100,
  briefDescription: 500,
  targetKeywords: 200,
};

// Sanitize user input to prevent prompt injection
function sanitizeInput(input: string | undefined, maxLength: number): string {
  if (!input) return '';

  let sanitized = input
    // Limit length
    .slice(0, maxLength)
    // Remove potential prompt injection patterns
    .replace(/\b(ignore|disregard|forget|override)\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|prompts?)/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return sanitized;
}

const IOS_LIMITS: Record<string, number> = {
  appName: 30,
  subtitle: 30,
  description: 4000,
  whatsNew: 4000,
  keywords: 100,
};

const TONE_ADJECTIVES: Record<string, string> = {
  bright: 'vibrant, bold',
  pastel: 'soft, pastel',
  classic: 'professional, blue-toned',
  dark: 'dark, sleek',
};

const TONE_TEMPLATE_IDS: Record<string, string[]> = {
  bright: ['rainbow', 'neon-nights', 'hot-pink', 'electric-violet', 'sunset', 'instagram'],
  pastel: ['pastel-rainbow', 'pastel-lavender', 'pastel-pink', 'pastel-mint', 'clean-white'],
  classic: ['deep-blue', 'tech-blue', 'indigo', 'cool-gray', 'ocean'],
  dark: ['pure-black', 'dark-navy', 'dark-purple', 'neon-nights'],
};

const ALTERNATING_TEMPLATES = ['rainbow', 'pastel-rainbow', 'neon-nights', 'messenger', 'instagram', 'sunset', 'aurora', 'ocean', 'forest'];

function selectTemplate(tone: string, screenshotCount: number): string {
  const candidates = TONE_TEMPLATE_IDS[tone] || TONE_TEMPLATE_IDS['bright'];
  if (screenshotCount >= 4) {
    const alternating = candidates.filter(id => ALTERNATING_TEMPLATES.includes(id));
    if (alternating.length > 0) {
      return alternating[Math.floor(Math.random() * alternating.length)];
    }
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default async function unifiedRoutes(fastify: FastifyInstance) {
  const openaiKey = process.env.OPENAI_API_KEY;
  let openai: OpenAI | null = null;

  if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey });
  }

  // List all unified projects
  fastify.get('/api/unified', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const { mode } = request.query as { mode?: string };

    const where: { userId: string; mode?: string } = { userId: request.user.id };
    if (mode && (mode === 'wizard' || mode === 'manual')) {
      where.mode = mode;
    }

    const projects = await fastify.prisma.unifiedProject.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        screenshots: {
          orderBy: { order: 'asc' },
          take: 1,
          select: { id: true, imagePath: true },
        },
        _count: { select: { screenshots: true } },
      },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      mode: p.mode,
      appName: p.appName,
      wizardStatus: p.wizardStatus,
      wizardCurrentStep: p.wizardCurrentStep,
      wizardTone: p.wizardTone,
      updatedAt: p.updatedAt,
      screenshotCount: p._count.screenshots,
      thumbnail: p.screenshots[0]?.imagePath
        ? p.screenshots[0].imagePath.startsWith('/uploads')
          ? p.screenshots[0].imagePath
          : `/uploads/${p.userId}/${p.id}/${p.screenshots[0].imagePath}`
        : p.wizardUploadedScreenshots
          ? (p.wizardUploadedScreenshots as string[])[0] || null
          : null,
    }));
  });

  // Create unified project
  fastify.post('/api/unified', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { mode = 'wizard', name } = request.body as { mode?: string; name?: string };

    // Check plan limits
    const subscription = await fastify.prisma.subscription.findUnique({
      where: { userId: request.user.id },
    });
    const plan = subscription?.plan ?? 'FREE';
    const limits = getPlanLimits(plan);

    const projectCount = await fastify.prisma.unifiedProject.count({
      where: { userId: request.user.id },
    });

    if (mode === 'wizard') {
      const wizardCount = await fastify.prisma.unifiedProject.count({
        where: { userId: request.user.id, mode: 'wizard' },
      });
      if (limits.maxWizardProjects !== Infinity && wizardCount >= limits.maxWizardProjects) {
        return reply.status(403).send({
          error: 'Plan limit reached',
          message: `Free plan allows up to ${limits.maxWizardProjects} wizard project${limits.maxWizardProjects !== 1 ? 's' : ''}. Upgrade to Pro for unlimited.`,
          limit: 'wizardProjects',
        });
      }
    } else {
      if (limits.maxProjects !== Infinity && projectCount >= limits.maxProjects) {
        return reply.status(403).send({
          error: 'Plan limit reached',
          message: `Free plan allows up to ${limits.maxProjects} projects. Upgrade to Pro for unlimited.`,
          limit: 'projects',
        });
      }
    }

    const project = await fastify.prisma.unifiedProject.create({
      data: {
        userId: request.user.id,
        name: name || (mode === 'wizard' ? '' : `Project ${new Date().toLocaleDateString()}`),
        mode: mode === 'manual' ? 'manual' : 'wizard',
      },
    });

    return reply.status(201).send(project);
  });

  // Get unified project with screenshots
  fastify.get('/api/unified/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
      include: {
        screenshots: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    return project;
  });

  // Update unified project
  fastify.put('/api/unified/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Sanitize user inputs to prevent prompt injection
    const sanitizedAppName = body.appName !== undefined
      ? sanitizeInput(body.appName as string, INPUT_LIMITS.appName)
      : undefined;
    const sanitizedBriefDescription = body.briefDescription !== undefined
      ? sanitizeInput(body.briefDescription as string, INPUT_LIMITS.briefDescription)
      : undefined;
    const sanitizedTargetKeywords = body.targetKeywords !== undefined
      ? sanitizeInput(body.targetKeywords as string, INPUT_LIMITS.targetKeywords)
      : undefined;

    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: {
        name: body.name as string | undefined,
        appName: sanitizedAppName,
        briefDescription: sanitizedBriefDescription,
        targetKeywords: sanitizedTargetKeywords,
        styleConfig: body.styleConfig as Prisma.InputJsonValue | undefined,
        deviceSize: body.deviceSize as string | undefined,
        metadataPlatform: body.metadataPlatform as string | undefined,
        generatedMetadata: body.generatedMetadata as Prisma.InputJsonValue | undefined,
        editedMetadata: body.editedMetadata as Prisma.InputJsonValue | undefined,
        metadataTranslations: body.metadataTranslations as Prisma.InputJsonValue | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        translationData: body.translationData as Prisma.InputJsonValue | undefined,
        wizardCurrentStep: body.wizardCurrentStep as number | undefined,
        wizardTone: body.wizardTone as string | undefined,
        wizardLayoutPreset: body.wizardLayoutPreset as string | undefined,
        wizardSelectedTemplateId: body.wizardSelectedTemplateId as string | undefined,
        wizardGeneratedHeadlines: body.wizardGeneratedHeadlines as Prisma.InputJsonValue | undefined,
        wizardEditedHeadlines: body.wizardEditedHeadlines as Prisma.InputJsonValue | undefined,
        wizardGeneratedIconUrl: body.wizardGeneratedIconUrl as string | undefined,
        wizardStatus: body.wizardStatus as string | undefined,
        wizardUploadedScreenshots: body.wizardUploadedScreenshots as Prisma.InputJsonValue | undefined,
        wizardScreenshotEditorData: body.wizardScreenshotEditorData as Prisma.InputJsonValue | undefined,
        wizardTranslatedHeadlines: body.wizardTranslatedHeadlines as Prisma.InputJsonValue | undefined,
        wizardGenerateScreenshots: body.wizardGenerateScreenshots as boolean | undefined,
        wizardGenerateIcon: body.wizardGenerateIcon as boolean | undefined,
        wizardGenerateMetadata: body.wizardGenerateMetadata as boolean | undefined,
      },
    });

    return updated;
  });

  // Delete unified project
  fastify.delete('/api/unified/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Clean up uploaded files for wizard mode
    if (project.mode === 'wizard') {
      const screenshots = project.wizardUploadedScreenshots as string[] | null;
      if (screenshots) {
        for (const filePath of screenshots) {
          const fullPath = path.join(UPLOADS_DIR, filePath.replace(/^\/uploads\/?/, ''));
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }

      if (project.wizardGeneratedIconUrl && project.wizardGeneratedIconUrl.startsWith('/uploads/')) {
        const iconPath = path.join(UPLOADS_DIR, project.wizardGeneratedIconUrl.replace(/^\/uploads\/?/, ''));
        if (fs.existsSync(iconPath)) {
          fs.unlinkSync(iconPath);
        }
      }
    }

    // Clean up manual project files
    const uploadDir = path.join(UPLOADS_DIR, request.user.id, id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true });
    }

    await fastify.prisma.unifiedProject.delete({ where: { id } });
    return reply.send({ ok: true });
  });

  // Upload screenshot (for wizard mode)
  fastify.post('/api/unified/:id/screenshots', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(UPLOADS_DIR, request.user.id, 'unified', id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(data.filename) || '.png';
    const fileName = `screenshot_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = await data.toBuffer();
    fs.writeFileSync(filePath, buffer);

    const relativePath = `/uploads/${request.user.id}/unified/${id}/${fileName}`;

    if (project.mode === 'wizard') {
      // Wizard mode: store in wizardUploadedScreenshots array
      const currentScreenshots = (project.wizardUploadedScreenshots as string[] | null) || [];
      const updatedScreenshots = [...currentScreenshots, relativePath];

      const updated = await fastify.prisma.unifiedProject.update({
        where: { id },
        data: {
          wizardUploadedScreenshots: updatedScreenshots as Prisma.InputJsonValue,
        },
      });

      return { screenshotUrl: relativePath, project: updated };
    } else {
      // Manual mode: create UnifiedScreenshot record
      const screenshotCount = await fastify.prisma.unifiedScreenshot.count({
        where: { projectId: id },
      });

      const screenshot = await fastify.prisma.unifiedScreenshot.create({
        data: {
          projectId: id,
          order: screenshotCount,
          imagePath: fileName,
        },
      });

      return { screenshotUrl: relativePath, screenshot };
    }
  });

  // Remove screenshot (for wizard mode by index)
  fastify.delete('/api/unified/:id/screenshots/:index', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id, index } = request.params as { id: string; index: string };
    const idx = parseInt(index, 10);

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    if (project.mode === 'wizard') {
      const currentScreenshots = (project.wizardUploadedScreenshots as string[] | null) || [];
      if (idx < 0 || idx >= currentScreenshots.length) {
        return reply.status(400).send({ error: 'Invalid screenshot index' });
      }

      // Delete file
      const filePath = path.join(UPLOADS_DIR, currentScreenshots[idx].replace(/^\/uploads\/?/, ''));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const updatedScreenshots = currentScreenshots.filter((_, i) => i !== idx);

      const updated = await fastify.prisma.unifiedProject.update({
        where: { id },
        data: {
          wizardUploadedScreenshots: updatedScreenshots as Prisma.InputJsonValue,
        },
      });

      return updated;
    } else {
      // Manual mode: delete by screenshot ID
      const screenshot = await fastify.prisma.unifiedScreenshot.findFirst({
        where: { projectId: id, id: index },
      });

      if (!screenshot) {
        return reply.status(404).send({ error: 'Screenshot not found' });
      }

      if (screenshot.imagePath) {
        const filePath = path.join(UPLOADS_DIR, request.user.id, id, screenshot.imagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await fastify.prisma.unifiedScreenshot.delete({ where: { id: index } });
      return { ok: true };
    }
  });

  // Generate all (headlines + metadata + icon) - for wizard mode
  fastify.post('/api/unified/:id/generate-all', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const screenshots = (project.wizardUploadedScreenshots as string[] | null) || [];
    const results: Record<string, unknown> = {};
    const errors: string[] = [];

    // 1. Generate headlines if screenshots service is enabled
    if (project.wizardGenerateScreenshots && screenshots.length > 0) {
      const count = Math.min(8, Math.max(5, screenshots.length));

      // Load prompt from DB
      const headlinesConfig = await getPrompt(fastify.prisma, 'headlines_generation');
      const headlinesPrompt = renderPrompt(headlinesConfig.userTemplate, {
        count,
        appName: project.appName,
        briefDescription: project.briefDescription,
        targetKeywords: project.targetKeywords,
      });

      const startTime = Date.now();
      try {
        const response = await openai.chat.completions.create({
          model: headlinesConfig.model,
          messages: [
            { role: 'system', content: headlinesConfig.systemMessage },
            { role: 'user', content: headlinesPrompt },
          ],
          temperature: headlinesConfig.temperature,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content) as { headlines: string[] };
        const headlines = parsed.headlines || [];

        // Log AI usage
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'headlines_generation',
          model: headlinesConfig.model,
          ...extractTokenUsage(response),
          durationMs: Date.now() - startTime,
          success: true,
        });

        if (headlines.length > 0) {
          results.wizardGeneratedHeadlines = headlines;
          results.wizardEditedHeadlines = headlines;
        } else {
          errors.push('Headlines generation returned empty results');
        }
      } catch (error) {
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'headlines_generation',
          model: headlinesConfig.model,
          durationMs: Date.now() - startTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        fastify.log.error(error, 'Headlines generation error');
        errors.push(`Headlines generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Select template based on tone
      const templateId = selectTemplate(project.wizardTone, screenshots.length);
      results.wizardSelectedTemplateId = templateId;
    }

    // 2. Generate metadata if enabled
    if (project.wizardGenerateMetadata) {
      const fieldsDescription = Object.entries(IOS_LIMITS)
        .map(([field, limit]) => `${field} (max ${limit} chars)`)
        .join(', ');

      const keywordsLine = project.targetKeywords
        ? `\nTarget keywords to incorporate: "${project.targetKeywords}"`
        : '';

      // Load prompt from DB
      const metadataConfig = await getPrompt(fastify.prisma, 'metadata_generation');
      const metadataPrompt = renderPrompt(metadataConfig.userTemplate, {
        appName: project.appName,
        briefDescription: project.briefDescription,
        keywordsLine,
        fieldsDescription,
      });

      const metaStartTime = Date.now();
      try {
        const response = await openai.chat.completions.create({
          model: metadataConfig.model,
          messages: [
            { role: 'system', content: metadataConfig.systemMessage },
            { role: 'user', content: metadataPrompt },
          ],
          temperature: metadataConfig.temperature,
          response_format: { type: 'json_object' },
        });

        // Log AI usage
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'metadata_generation',
          model: metadataConfig.model,
          ...extractTokenUsage(response),
          durationMs: Date.now() - metaStartTime,
          success: true,
        });

        const content = response.choices[0]?.message?.content || '{}';
        let metadata = JSON.parse(content) as Record<string, string>;

        // Fix fields exceeding limits
        const overFields = Object.entries(IOS_LIMITS).filter(
          ([field, limit]) => metadata[field] && metadata[field].length > limit,
        );

        if (overFields.length > 0) {
          const fixList = overFields
            .map(([field, limit]) => `- "${field}": currently ${metadata[field].length} chars, max ${limit}. Current value: "${metadata[field]}"`)
            .join('\n');

          // Load fix prompt from DB
          const fixConfig = await getPrompt(fastify.prisma, 'metadata_fix');
          const fixPrompt = renderPrompt(fixConfig.userTemplate, {
            appName: project.appName,
            keywordsLine: project.targetKeywords ? `Target keywords: "${project.targetKeywords}"` : '',
            fixList,
          });

          const fixStartTime = Date.now();
          const fixResponse = await openai.chat.completions.create({
            model: fixConfig.model,
            messages: [
              { role: 'system', content: fixConfig.systemMessage },
              { role: 'user', content: fixPrompt },
            ],
            temperature: fixConfig.temperature,
            response_format: { type: 'json_object' },
          });

          // Log fix usage
          await logAIUsage(fastify.prisma, {
            userId: request.user.id,
            projectId: id,
            operationType: 'metadata_fix',
            model: fixConfig.model,
            ...extractTokenUsage(fixResponse),
            durationMs: Date.now() - fixStartTime,
            success: true,
          });

          const fixContent = fixResponse.choices[0]?.message?.content || '{}';
          const fixes = JSON.parse(fixContent) as Record<string, string>;

          for (const [field, limit] of overFields) {
            if (fixes[field] && fixes[field].length <= limit) {
              metadata[field] = fixes[field];
            } else if (fixes[field]) {
              metadata[field] = fixes[field].slice(0, limit);
            }
          }
        }

        results.generatedMetadata = metadata;
        results.editedMetadata = metadata;
      } catch (error) {
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'metadata_generation',
          model: metadataConfig.model,
          durationMs: Date.now() - metaStartTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        fastify.log.error(error, 'Metadata generation error');
        errors.push(`Metadata generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 3. Generate icon if enabled
    if (project.wizardGenerateIcon) {
      const toneAdj = TONE_ADJECTIVES[project.wizardTone] || 'vibrant, bold';

      // Load icon prompt from DB
      const iconConfig = await getPrompt(fastify.prisma, 'icon_generation');
      const iconPrompt = renderPrompt(iconConfig.userTemplate, {
        appName: project.appName,
        briefDescription: project.briefDescription,
        toneAdjective: toneAdj,
      });

      const iconStartTime = Date.now();
      try {
        const iconResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: iconPrompt,
          n: 1,
          size: '1024x1024',
        });

        // Log AI usage for icon generation
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'icon_generation',
          model: 'dall-e-3',
          durationMs: Date.now() - iconStartTime,
          success: true,
          imageSize: '1024x1024',
          imageCount: 1,
        });

        const imageUrl = iconResponse.data?.[0]?.url;
        if (imageUrl) {
          const iconDir = path.join(UPLOADS_DIR, request.user.id, 'unified', id);
          if (!fs.existsSync(iconDir)) {
            fs.mkdirSync(iconDir, { recursive: true });
          }

          const iconFileName = `icon_${Date.now()}.png`;
          const iconFilePath = path.join(iconDir, iconFileName);

          const iconFetch = await fetch(imageUrl);
          const iconBuffer = Buffer.from(await iconFetch.arrayBuffer());
          fs.writeFileSync(iconFilePath, iconBuffer);

          const relativeIconPath = `/uploads/${request.user.id}/unified/${id}/${iconFileName}`;
          results.wizardGeneratedIconUrl = relativeIconPath;
        }
      } catch (error) {
        await logAIUsage(fastify.prisma, {
          userId: request.user.id,
          projectId: id,
          operationType: 'icon_generation',
          model: 'dall-e-3',
          durationMs: Date.now() - iconStartTime,
          success: false,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        fastify.log.error(error, 'Icon generation error');
        errors.push(`Icon generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update project with results
    const updateData: Record<string, unknown> = {
      wizardStatus: 'generated',
      wizardCurrentStep: 6,
    };

    if (results.wizardGeneratedHeadlines !== undefined) {
      updateData.wizardGeneratedHeadlines = results.wizardGeneratedHeadlines as Prisma.InputJsonValue;
      updateData.wizardEditedHeadlines = results.wizardEditedHeadlines as Prisma.InputJsonValue;
    }
    if (results.generatedMetadata !== undefined) {
      updateData.generatedMetadata = results.generatedMetadata as Prisma.InputJsonValue;
      updateData.editedMetadata = results.editedMetadata as Prisma.InputJsonValue;
    }
    if (results.wizardGeneratedIconUrl !== undefined) {
      updateData.wizardGeneratedIconUrl = results.wizardGeneratedIconUrl as string;
    }
    if (results.wizardSelectedTemplateId !== undefined) {
      updateData.wizardSelectedTemplateId = results.wizardSelectedTemplateId as string;
    }

    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: updateData,
    });

    const response: Record<string, unknown> = { ...updated };
    if (errors.length > 0) {
      response.generationErrors = errors;
    }
    return response;
  });

  // Translate headlines + metadata
  fastify.post('/api/unified/:id/translate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Check plan limits
    const subscription = await fastify.prisma.subscription.findUnique({
      where: { userId: request.user.id },
    });
    const plan = subscription?.plan ?? 'FREE';
    const limits = getPlanLimits(plan);

    if (limits.maxWizardTargetLanguages !== Infinity && project.targetLanguages.length > limits.maxWizardTargetLanguages) {
      return reply.status(403).send({
        error: `Free plan allows up to ${limits.maxWizardTargetLanguages} target languages. Upgrade to Pro for unlimited.`,
        limit: 'targetLanguages',
      });
    }

    const editedHeadlines = project.wizardEditedHeadlines as string[] | null;
    const editedMetadata = project.editedMetadata as Record<string, string> | null;

    // Load existing translations to preserve them
    const existingHeadlines = (project.wizardTranslatedHeadlines as Record<string, string[]> | null) || {};
    const existingMetadata = (project.metadataTranslations as Record<string, Record<string, string>> | null) || {};

    const translatedHeadlines: Record<string, string[]> = { ...existingHeadlines };
    const translatedMetadata: Record<string, Record<string, string>> = { ...existingMetadata };

    // Only translate languages that don't have translations yet
    const langsToTranslate = project.targetLanguages.filter(
      l => l !== project.sourceLanguage && !existingHeadlines[l] && !existingMetadata[l]
    );

    if (langsToTranslate.length === 0) {
      return project;
    }

    fastify.log.info(`Translating ${langsToTranslate.length} new languages (${Object.keys(existingHeadlines).length} already done)`);

    const translateLang = async (lang: string) => {
      // Translate headlines
      if (editedHeadlines && editedHeadlines.length > 0) {
        const headlineStartTime = Date.now();
        try {
          // Load headlines translation prompt from DB
          const headlinesTransConfig = await getPrompt(fastify.prisma, 'headlines_translation');
          const systemMessage = renderPrompt(headlinesTransConfig.systemMessage, { targetLanguage: lang });

          const response = await openai.chat.completions.create({
            model: headlinesTransConfig.model,
            messages: [
              { role: 'system', content: systemMessage },
              { role: 'user', content: editedHeadlines.join('\n') },
            ],
            temperature: headlinesTransConfig.temperature,
          });

          // Log AI usage
          await logAIUsage(fastify.prisma, {
            userId: request.user.id,
            projectId: id,
            operationType: 'headlines_translation',
            model: headlinesTransConfig.model,
            ...extractTokenUsage(response),
            durationMs: Date.now() - headlineStartTime,
            success: true,
            metadata: { targetLanguage: lang },
          });

          const translatedContent = response.choices[0]?.message?.content || '';
          const translatedTexts = translatedContent.split('\n').filter((t) => t.trim());
          translatedHeadlines[lang] = editedHeadlines.map((original, i) => translatedTexts[i]?.trim() || original);
        } catch (error) {
          await logAIUsage(fastify.prisma, {
            userId: request.user.id,
            projectId: id,
            operationType: 'headlines_translation',
            model: 'gpt-4o-mini',
            durationMs: Date.now() - headlineStartTime,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: { targetLanguage: lang },
          });
          fastify.log.error(error, `Headline translation error for ${lang}`);
          translatedHeadlines[lang] = editedHeadlines;
        }
      }

      // Translate metadata
      if (editedMetadata) {
        const fieldsDescription = Object.entries(IOS_LIMITS)
          .map(([field, limit]) => `${field} (max ${limit} chars)`)
          .join(', ');

        const keywordsContext = project.targetKeywords
          ? `\nTarget keywords that MUST be incorporated where possible: "${project.targetKeywords}"`
          : '';

        const metaTransStartTime = Date.now();
        try {
          // Load metadata translation prompt from DB
          const metadataTransConfig = await getPrompt(fastify.prisma, 'metadata_translation');
          const metadataTransPrompt = renderPrompt(metadataTransConfig.userTemplate, {
            sourceLanguage: project.sourceLanguage,
            targetLanguage: lang,
            appName: project.appName,
            keywordsContext,
            metadata: JSON.stringify(editedMetadata, null, 2),
            fieldsDescription,
          });

          const response = await openai.chat.completions.create({
            model: metadataTransConfig.model,
            messages: [
              { role: 'system', content: metadataTransConfig.systemMessage },
              { role: 'user', content: metadataTransPrompt },
            ],
            temperature: metadataTransConfig.temperature,
            response_format: { type: 'json_object' },
          });

          // Log AI usage
          await logAIUsage(fastify.prisma, {
            userId: request.user.id,
            projectId: id,
            operationType: 'metadata_translation',
            model: metadataTransConfig.model,
            ...extractTokenUsage(response),
            durationMs: Date.now() - metaTransStartTime,
            success: true,
            metadata: { targetLanguage: lang },
          });

          const content = response.choices[0]?.message?.content || '{}';
          let translated = JSON.parse(content) as Record<string, string>;

          // Fix fields exceeding limits
          const strictFields = Object.entries(IOS_LIMITS).filter(([, limit]) => limit <= 100);
          const overLimitFields = strictFields.filter(
            ([field, limit]) => translated[field] && translated[field].length > limit,
          );

          if (overLimitFields.length > 0) {
            const fixList = overLimitFields
              .map(([field, limit]) => `- "${field}": currently ${translated[field].length} chars, max ${limit}. Current value: "${translated[field]}"`)
              .join('\n');

            // Load metadata translation fix prompt from DB
            const metadataFixConfig = await getPrompt(fastify.prisma, 'metadata_translation_fix');
            const metadataFixPrompt = renderPrompt(metadataFixConfig.userTemplate, {
              appName: project.appName,
              keywordsContext,
              fixList,
              targetLanguage: lang,
            });

            const fixStartTime = Date.now();
            const fixResponse = await openai.chat.completions.create({
              model: metadataFixConfig.model,
              messages: [
                { role: 'system', content: metadataFixConfig.systemMessage },
                { role: 'user', content: metadataFixPrompt },
              ],
              temperature: metadataFixConfig.temperature,
              response_format: { type: 'json_object' },
            });

            // Log fix usage
            await logAIUsage(fastify.prisma, {
              userId: request.user.id,
              projectId: id,
              operationType: 'metadata_translation_fix',
              model: metadataFixConfig.model,
              ...extractTokenUsage(fixResponse),
              durationMs: Date.now() - fixStartTime,
              success: true,
              metadata: { targetLanguage: lang },
            });

            const fixContent = fixResponse.choices[0]?.message?.content || '{}';
            const fixes = JSON.parse(fixContent) as Record<string, string>;

            for (const [field, limit] of overLimitFields) {
              if (fixes[field] && fixes[field].length <= limit) {
                translated[field] = fixes[field];
              } else if (fixes[field]) {
                translated[field] = fixes[field].slice(0, limit);
              }
            }
          }

          translatedMetadata[lang] = translated;
        } catch (error) {
          await logAIUsage(fastify.prisma, {
            userId: request.user.id,
            projectId: id,
            operationType: 'metadata_translation',
            model: 'gpt-4o-mini',
            durationMs: Date.now() - metaTransStartTime,
            success: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            metadata: { targetLanguage: lang },
          });
          fastify.log.error(error, `Metadata translation error for ${lang}`);
          translatedMetadata[lang] = { ...editedMetadata };
        }
      }
    };

    // Run translations in parallel batches of 10
    const BATCH_SIZE = 10;
    for (let i = 0; i < langsToTranslate.length; i += BATCH_SIZE) {
      const batch = langsToTranslate.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(translateLang));
    }

    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: {
        wizardTranslatedHeadlines: translatedHeadlines as Prisma.InputJsonValue,
        metadataTranslations: translatedMetadata as Prisma.InputJsonValue,
        wizardStatus: 'translated',
        wizardCurrentStep: 8,
      },
    });

    return updated;
  });

  // Convert wizard project to manual mode
  fastify.post('/api/unified/:id/convert-to-manual', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
      include: {
        screenshots: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    if (project.mode === 'manual') {
      return reply.status(400).send({ error: 'Project is already in manual mode' });
    }

    const wizardScreenshots = project.wizardUploadedScreenshots as string[] | null;
    const headlines = project.wizardEditedHeadlines as string[] | null;
    const editorData = project.wizardScreenshotEditorData as Array<{
      decorations?: unknown;
      styleOverride?: unknown;
      mockupSettings?: unknown;
    }> | null;

    // Create UnifiedScreenshot records from wizard data
    if (wizardScreenshots && wizardScreenshots.length > 0) {
      // Copy files from wizard directory to project directory
      const projectUploadDir = path.join(UPLOADS_DIR, request.user.id, id);
      if (!fs.existsSync(projectUploadDir)) {
        fs.mkdirSync(projectUploadDir, { recursive: true });
      }

      for (let i = 0; i < wizardScreenshots.length; i++) {
        const srcPath = path.join(UPLOADS_DIR, wizardScreenshots[i].replace(/^\/uploads\/?/, ''));
        const fileName = path.basename(wizardScreenshots[i]);
        const destPath = path.join(projectUploadDir, fileName);

        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
        }

        await fastify.prisma.unifiedScreenshot.create({
          data: {
            projectId: id,
            order: i,
            imagePath: fileName,
            text: headlines?.[i] || '',
            decorations: editorData?.[i]?.decorations as Prisma.InputJsonValue ?? undefined,
            styleOverride: editorData?.[i]?.styleOverride as Prisma.InputJsonValue ?? undefined,
            mockupSettings: editorData?.[i]?.mockupSettings as Prisma.InputJsonValue ?? undefined,
          },
        });
      }
    }

    // Update project mode and preserve style config
    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: {
        mode: 'manual',
        name: project.name || project.appName || 'Converted Project',
        // Preserve styleConfig from wizard - it contains colors, fonts, mockup settings
        styleConfig: project.styleConfig as Prisma.InputJsonValue ?? undefined,
      },
      include: {
        screenshots: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return updated;
  });

  // Autosave endpoint
  fastify.post('/api/unified/:id/autosave', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: {
        styleConfig: body.styleConfig as Prisma.InputJsonValue | undefined,
        deviceSize: body.deviceSize as string | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        translationData: body.translationData as Prisma.InputJsonValue | undefined,
      },
    });

    return { ok: true, updatedAt: updated.updatedAt };
  });

  // Screenshot bulk update for manual mode
  fastify.put('/api/unified/:id/screenshots/bulk', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { screenshots: screenshotUpdates } = request.body as {
      screenshots: Array<{
        id: string;
        text?: string;
        decorations?: unknown;
        styleOverride?: unknown;
        mockupSettings?: unknown;
      }>;
    };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    for (const update of screenshotUpdates) {
      await fastify.prisma.unifiedScreenshot.update({
        where: { id: update.id },
        data: {
          text: update.text,
          decorations: update.decorations as Prisma.InputJsonValue | undefined,
          styleOverride: update.styleOverride as Prisma.InputJsonValue | undefined,
          mockupSettings: update.mockupSettings as Prisma.InputJsonValue | undefined,
        },
      });
    }

    return { ok: true };
  });

  // Screenshot reorder for manual mode
  fastify.put('/api/unified/:id/screenshots/reorder', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { order } = request.body as { order: string[] };

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    for (let i = 0; i < order.length; i++) {
      await fastify.prisma.unifiedScreenshot.update({
        where: { id: order[i] },
        data: { order: i },
      });
    }

    return { ok: true };
  });

  // Generate metadata only (for manual mode)
  fastify.post('/api/unified/:id/generate-metadata', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const fieldsDescription = Object.entries(IOS_LIMITS)
      .map(([field, limit]) => `${field} (max ${limit} chars)`)
      .join(', ');

    const keywordsLine = project.targetKeywords
      ? `\nTarget keywords to incorporate: "${project.targetKeywords}"`
      : '';

    // Load prompt from DB
    const metadataConfig = await getPrompt(fastify.prisma, 'metadata_generation');
    const metadataPrompt = renderPrompt(metadataConfig.userTemplate, {
      appName: project.appName,
      briefDescription: project.briefDescription,
      keywordsLine,
      fieldsDescription,
    });

    try {
      const response = await openai.chat.completions.create({
        model: metadataConfig.model,
        messages: [
          { role: 'system', content: metadataConfig.systemMessage },
          { role: 'user', content: metadataPrompt },
        ],
        temperature: metadataConfig.temperature,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      let metadata = JSON.parse(content) as Record<string, string>;

      // Fix fields exceeding limits
      const overFields = Object.entries(IOS_LIMITS).filter(
        ([field, limit]) => metadata[field] && metadata[field].length > limit,
      );

      if (overFields.length > 0) {
        const fixList = overFields
          .map(([field, limit]) => `- "${field}": currently ${metadata[field].length} chars, max ${limit}. Current value: "${metadata[field]}"`)
          .join('\n');

        const fixPrompt = `These generated ASO fields exceed character limits. Rewrite ONLY these fields to fit.

App name: "${project.appName}"
${project.targetKeywords ? `Target keywords: "${project.targetKeywords}"` : ''}

Fields to fix:
${fixList}

Rules:
- Keep app name "${project.appName}" in appName
- Incorporate keywords naturally
- Stay marketing-friendly
- Return ONLY valid JSON with just the fixed fields`;

        const fixResponse = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an ASO expert. Return only valid JSON. Every field MUST respect its character limit.' },
            { role: 'user', content: fixPrompt },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        });

        const fixContent = fixResponse.choices[0]?.message?.content || '{}';
        const fixes = JSON.parse(fixContent) as Record<string, string>;

        for (const [field, limit] of overFields) {
          if (fixes[field] && fixes[field].length <= limit) {
            metadata[field] = fixes[field];
          } else if (fixes[field]) {
            metadata[field] = fixes[field].slice(0, limit);
          }
        }
      }

      const updated = await fastify.prisma.unifiedProject.update({
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

  // Translate metadata only (for manual mode)
  fastify.post('/api/unified/:id/translate-metadata', {
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

    const project = await fastify.prisma.unifiedProject.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Check plan limits
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

    const translations: Record<string, Record<string, string>> = {};
    const strictFields = Object.entries(IOS_LIMITS).filter(([, limit]) => limit <= 100);

    for (const lang of targetLanguages) {
      if (lang === project.sourceLanguage) continue;

      const fieldsDescription = Object.entries(IOS_LIMITS)
        .map(([field, limit]) => `${field} (max ${limit} chars)`)
        .join(', ');

      const keywordsContext = project.targetKeywords
        ? `\nTarget keywords that MUST be incorporated where possible: "${project.targetKeywords}"`
        : '';

      try {
        // Load metadata translation prompt from DB
        const metadataTransConfig = await getPrompt(fastify.prisma, 'metadata_translation');
        const metadataTransPrompt = renderPrompt(metadataTransConfig.userTemplate, {
          sourceLanguage: project.sourceLanguage,
          targetLanguage: lang,
          appName: project.appName,
          keywordsContext,
          metadata: JSON.stringify(editedMetadata, null, 2),
          fieldsDescription,
        });

        const response = await openai.chat.completions.create({
          model: metadataTransConfig.model,
          messages: [
            { role: 'system', content: metadataTransConfig.systemMessage },
            { role: 'user', content: metadataTransPrompt },
          ],
          temperature: metadataTransConfig.temperature,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content || '{}';
        let translated = JSON.parse(content) as Record<string, string>;

        // Fix over-limit fields
        const overLimitFields = strictFields.filter(
          ([field, limit]) => translated[field] && translated[field].length > limit,
        );

        if (overLimitFields.length > 0) {
          const fixList = overLimitFields
            .map(([field, limit]) => `- "${field}": currently ${translated[field].length} chars, max ${limit}. Current value: "${translated[field]}"`)
            .join('\n');

          // Load metadata translation fix prompt from DB
          const metadataFixConfig = await getPrompt(fastify.prisma, 'metadata_translation_fix');
          const metadataFixPrompt = renderPrompt(metadataFixConfig.userTemplate, {
            appName: project.appName,
            keywordsContext,
            fixList,
            targetLanguage: lang,
          });

          const fixResponse = await openai.chat.completions.create({
            model: metadataFixConfig.model,
            messages: [
              { role: 'system', content: metadataFixConfig.systemMessage },
              { role: 'user', content: metadataFixPrompt },
            ],
            temperature: metadataFixConfig.temperature,
            response_format: { type: 'json_object' },
          });

          const fixContent = fixResponse.choices[0]?.message?.content || '{}';
          const fixes = JSON.parse(fixContent) as Record<string, string>;

          for (const [field, limit] of overLimitFields) {
            if (fixes[field] && fixes[field].length <= limit) {
              translated[field] = fixes[field];
            } else if (fixes[field]) {
              translated[field] = fixes[field].slice(0, limit);
            }
          }
        }

        translations[lang] = translated;
      } catch (error) {
        fastify.log.error(error, `Metadata translation error for ${lang}`);
        translations[lang] = { ...editedMetadata };
      }
    }

    const updated = await fastify.prisma.unifiedProject.update({
      where: { id },
      data: {
        targetLanguages,
        metadataTranslations: translations as Prisma.InputJsonValue,
      },
    });

    return updated;
  });
}
