import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import { checkWizardProjectLimit, getPlanLimits } from '../middleware/planLimits.js';
import { UPLOADS_DIR } from '../config.js';
import { getPrompt, renderPrompt } from '../utils/prompts.js';

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

// Templates that have alternating colors (good for 4+ screenshots)
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

export default async function wizardRoutes(fastify: FastifyInstance) {
  const openaiKey = process.env.OPENAI_API_KEY;
  let openai: OpenAI | null = null;

  if (openaiKey) {
    openai = new OpenAI({ apiKey: openaiKey });
  }

  // List wizard projects
  fastify.get('/api/wizard', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const projects = await fastify.prisma.wizardProject.findMany({
      where: { userId: request.user.id },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        appName: true,
        status: true,
        currentStep: true,
        tone: true,
        updatedAt: true,
      },
    });
    return projects;
  });

  // Create wizard project
  fastify.post('/api/wizard', {
    onRequest: [fastify.authenticate],
    preHandler: [checkWizardProjectLimit],
  }, async (request, reply) => {
    const project = await fastify.prisma.wizardProject.create({
      data: {
        userId: request.user.id,
      },
    });
    return reply.status(201).send(project);
  });

  // Get wizard project
  fastify.get('/api/wizard/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }
    return project;
  });

  // Update wizard project
  fastify.put('/api/wizard/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        appName: body.appName as string | undefined,
        briefDescription: body.briefDescription as string | undefined,
        targetKeywords: body.targetKeywords as string | undefined,
        generateScreenshots: body.generateScreenshots as boolean | undefined,
        generateIcon: body.generateIcon as boolean | undefined,
        generateMetadata: body.generateMetadata as boolean | undefined,
        tone: body.tone as string | undefined,
        layoutPreset: body.layoutPreset as string | undefined,
        selectedTemplateId: body.selectedTemplateId as string | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        editedHeadlines: body.editedHeadlines as Prisma.InputJsonValue | undefined,
        editedMetadata: body.editedMetadata as Prisma.InputJsonValue | undefined,
        styleConfig: body.styleConfig as Prisma.InputJsonValue | undefined,
        screenshotEditorData: body.screenshotEditorData as Prisma.InputJsonValue | undefined,
        currentStep: body.currentStep as number | undefined,
        status: body.status as string | undefined,
      },
    });

    return updated;
  });

  // Delete wizard project
  fastify.delete('/api/wizard/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    // Clean up uploaded files
    const screenshots = project.uploadedScreenshots as string[] | null;
    if (screenshots) {
      for (const filePath of screenshots) {
        const fullPath = path.join(UPLOADS_DIR, filePath.replace(/^\/uploads\/?/, ''));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Clean up generated icon
    if (project.generatedIconUrl && project.generatedIconUrl.startsWith('/uploads/')) {
      const iconPath = path.join(UPLOADS_DIR, project.generatedIconUrl.replace(/^\/uploads\/?/, ''));
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    await fastify.prisma.wizardProject.delete({ where: { id } });
    return reply.send({ ok: true });
  });

  // Upload screenshot
  fastify.post('/api/wizard/:id/screenshots', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(UPLOADS_DIR, request.user.id, 'wizard', id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(data.filename) || '.png';
    const fileName = `screenshot_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = await data.toBuffer();
    fs.writeFileSync(filePath, buffer);

    const relativePath = `/uploads/${request.user.id}/wizard/${id}/${fileName}`;
    const currentScreenshots = (project.uploadedScreenshots as string[] | null) || [];
    const updatedScreenshots = [...currentScreenshots, relativePath];

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        uploadedScreenshots: updatedScreenshots as Prisma.InputJsonValue,
      },
    });

    return { screenshotUrl: relativePath, project: updated };
  });

  // Remove screenshot
  fastify.delete('/api/wizard/:id/screenshots/:index', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id, index } = request.params as { id: string; index: string };
    const idx = parseInt(index, 10);

    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    const currentScreenshots = (project.uploadedScreenshots as string[] | null) || [];
    if (idx < 0 || idx >= currentScreenshots.length) {
      return reply.status(400).send({ error: 'Invalid screenshot index' });
    }

    // Delete file
    const filePath = path.join(UPLOADS_DIR, currentScreenshots[idx].replace(/^\/uploads\/?/, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const updatedScreenshots = currentScreenshots.filter((_, i) => i !== idx);

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        uploadedScreenshots: updatedScreenshots as Prisma.InputJsonValue,
      },
    });

    return updated;
  });

  // Generate all (headlines + metadata + icon + template selection)
  fastify.post('/api/wizard/:id/generate-all', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    const screenshots = (project.uploadedScreenshots as string[] | null) || [];
    const results: Record<string, unknown> = {};
    const errors: string[] = [];

    // 1. Generate headlines if screenshots service is enabled
    if (project.generateScreenshots && screenshots.length > 0) {
      const count = Math.min(8, Math.max(5, screenshots.length));

      // Load prompt from DB
      const headlinesConfig = await getPrompt(fastify.prisma, 'headlines_generation');
      const headlinesPrompt = renderPrompt(headlinesConfig.userTemplate, {
        count,
        appName: project.appName,
        briefDescription: project.briefDescription,
        targetKeywords: project.targetKeywords,
      });

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

        if (headlines.length > 0) {
          results.generatedHeadlines = headlines;
          results.editedHeadlines = headlines;
        } else {
          errors.push('Headlines generation returned empty results');
        }
      } catch (error) {
        fastify.log.error(error, 'Headlines generation error');
        errors.push(`Headlines generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't overwrite existing headlines on failure
      }

      // Select template based on tone
      const templateId = selectTemplate(project.tone, screenshots.length);
      results.selectedTemplateId = templateId;
    }

    // 2. Generate metadata if enabled
    if (project.generateMetadata) {
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

          // Load fix prompt from DB
          const fixConfig = await getPrompt(fastify.prisma, 'metadata_fix');
          const fixPrompt = renderPrompt(fixConfig.userTemplate, {
            appName: project.appName,
            keywordsLine: project.targetKeywords ? `Target keywords: "${project.targetKeywords}"` : '',
            fixList,
          });

          const fixResponse = await openai.chat.completions.create({
            model: fixConfig.model,
            messages: [
              { role: 'system', content: fixConfig.systemMessage },
              { role: 'user', content: fixPrompt },
            ],
            temperature: fixConfig.temperature,
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

        results.generatedMetadata = metadata;
        results.editedMetadata = metadata;
      } catch (error) {
        fastify.log.error(error, 'Metadata generation error');
        errors.push(`Metadata generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // 3. Generate icon if enabled
    if (project.generateIcon) {
      const toneAdj = TONE_ADJECTIVES[project.tone] || 'vibrant, bold';

      // Load icon prompt from DB
      const iconConfig = await getPrompt(fastify.prisma, 'icon_generation');
      const iconPrompt = renderPrompt(iconConfig.userTemplate, {
        appName: project.appName,
        briefDescription: project.briefDescription,
        toneAdjective: toneAdj,
      });

      try {
        const iconResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: iconPrompt,
          n: 1,
          size: '1024x1024',
        });

        const imageUrl = iconResponse.data?.[0]?.url;
        if (imageUrl) {
          // Download and save the icon
          const iconDir = path.join(UPLOADS_DIR, request.user.id, 'wizard', id);
          if (!fs.existsSync(iconDir)) {
            fs.mkdirSync(iconDir, { recursive: true });
          }

          const iconFileName = `icon_${Date.now()}.png`;
          const iconFilePath = path.join(iconDir, iconFileName);

          const iconFetch = await fetch(imageUrl);
          const iconBuffer = Buffer.from(await iconFetch.arrayBuffer());
          fs.writeFileSync(iconFilePath, iconBuffer);

          const relativeIconPath = `/uploads/${request.user.id}/wizard/${id}/${iconFileName}`;
          results.generatedIconUrl = relativeIconPath;
        }
      } catch (error) {
        fastify.log.error(error, 'Icon generation error');
        errors.push(`Icon generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Only update fields that were successfully generated
    const updateData: Record<string, unknown> = {
      status: 'generated',
      currentStep: 6,
    };

    if (results.generatedHeadlines !== undefined) {
      updateData.generatedHeadlines = results.generatedHeadlines as Prisma.InputJsonValue;
      updateData.editedHeadlines = results.editedHeadlines as Prisma.InputJsonValue;
    }
    if (results.generatedMetadata !== undefined) {
      updateData.generatedMetadata = results.generatedMetadata as Prisma.InputJsonValue;
      updateData.editedMetadata = results.editedMetadata as Prisma.InputJsonValue;
    }
    if (results.generatedIconUrl !== undefined) {
      updateData.generatedIconUrl = results.generatedIconUrl as string;
    }
    if (results.selectedTemplateId !== undefined) {
      updateData.selectedTemplateId = results.selectedTemplateId as string;
    }

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: updateData,
    });

    // Return project with any generation errors so frontend can display them
    const response: Record<string, unknown> = { ...updated };
    if (errors.length > 0) {
      response.generationErrors = errors;
    }
    return response;
  });

  // Convert wizard project to regular project for manual editing
  fastify.post('/api/wizard/:id/to-project', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const wizardProject = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!wizardProject) {
      return reply.status(404).send({ error: 'Wizard project not found' });
    }

    const body = request.body as Record<string, unknown> | null;
    const screenshots = (wizardProject.uploadedScreenshots as string[] | null) || [];
    const headlines = (wizardProject.editedHeadlines as string[] | null) || [];

    // Use style config from request body (resolved from template on frontend), or fallback
    const styleConfig: Record<string, unknown> = (body?.styleConfig as Record<string, unknown>) || {
      backgroundColor: '#667eea',
      gradient: { enabled: true, color1: '#667eea', color2: '#764ba2', angle: 135 },
      textColor: '#ffffff',
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: 72,
      textPosition: 'top',
      textAlign: 'center',
      paddingTop: 80,
      paddingBottom: 60,
      showMockup: true,
      mockupColor: 'black',
      mockupStyle: 'flat',
      mockupVisibility: 'full',
      mockupAlignment: 'bottom',
      mockupOffset: { x: 0, y: 60 },
      textOffset: { x: 0, y: 0 },
      mockupScale: 1.0,
      mockupRotation: 0,
      mockupContinuation: 'none',
      highlightColor: '#FFE135',
      highlightPadding: 12,
      highlightBorderRadius: 8,
    };

    // Create the regular project
    const project = await fastify.prisma.project.create({
      data: {
        userId: request.user.id,
        name: wizardProject.appName || 'Wizard Project',
        styleConfig: styleConfig as Prisma.InputJsonValue,
        sourceLanguage: wizardProject.sourceLanguage,
        targetLanguages: wizardProject.targetLanguages,
      },
    });

    // Copy screenshot files from wizard dir to project dir
    const projectUploadDir = path.join(UPLOADS_DIR, request.user.id, project.id);
    if (!fs.existsSync(projectUploadDir)) {
      fs.mkdirSync(projectUploadDir, { recursive: true });
    }

    for (let i = 0; i < screenshots.length; i++) {
      const srcPath = path.join(UPLOADS_DIR, screenshots[i].replace(/^\/uploads\/?/, ''));
      const fileName = path.basename(screenshots[i]);
      const destPath = path.join(projectUploadDir, fileName);

      // Copy file to new project directory
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }

      await fastify.prisma.screenshot.create({
        data: {
          projectId: project.id,
          order: i,
          imagePath: fileName,
          text: headlines[i] || '',
        },
      });
    }

    // Fetch the full project with screenshots
    const fullProject = await fastify.prisma.project.findUnique({
      where: { id: project.id },
      include: { screenshots: { orderBy: { order: 'asc' } } },
    });

    return reply.status(201).send(fullProject);
  });

  // Translate headlines + metadata
  fastify.post('/api/wizard/:id/translate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    if (!openai) {
      return reply.status(503).send({ error: 'AI service not configured' });
    }

    const { id } = request.params as { id: string };
    const project = await fastify.prisma.wizardProject.findFirst({
      where: { id, userId: request.user.id },
    });
    if (!project) {
      return reply.status(404).send({ error: 'Wizard project not found' });
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

    const editedHeadlines = project.editedHeadlines as string[] | null;
    const editedMetadata = project.editedMetadata as Record<string, string> | null;

    // Load existing translations to preserve them
    const existingHeadlines = (project.translatedHeadlines as Record<string, string[]> | null) || {};
    const existingMetadata = (project.translatedMetadata as Record<string, Record<string, string>> | null) || {};

    const translatedHeadlines: Record<string, string[]> = { ...existingHeadlines };
    const translatedMetadata: Record<string, Record<string, string>> = { ...existingMetadata };

    // Only translate languages that don't have translations yet
    const langsToTranslate = project.targetLanguages.filter(
      l => l !== project.sourceLanguage && !existingHeadlines[l] && !existingMetadata[l]
    );

    // If all languages already translated, just return
    if (langsToTranslate.length === 0) {
      return project;
    }

    fastify.log.info(`Translating ${langsToTranslate.length} new languages (${Object.keys(existingHeadlines).length} already done)`);

    // Translate a single language (headlines + metadata)
    const translateLang = async (lang: string) => {
      // Translate headlines
      if (editedHeadlines && editedHeadlines.length > 0) {
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

          const translatedContent = response.choices[0]?.message?.content || '';
          const translatedTexts = translatedContent.split('\n').filter((t) => t.trim());
          translatedHeadlines[lang] = editedHeadlines.map((original, i) => translatedTexts[i]?.trim() || original);
        } catch (error) {
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

          translatedMetadata[lang] = translated;
        } catch (error) {
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

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        translatedHeadlines: translatedHeadlines as Prisma.InputJsonValue,
        translatedMetadata: translatedMetadata as Prisma.InputJsonValue,
        status: 'translated',
        currentStep: 8,
      },
    });

    return updated;
  });
}
