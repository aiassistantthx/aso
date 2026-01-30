import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import OpenAI from 'openai';
import path from 'path';
import fs from 'fs';
import { checkWizardProjectLimit, getPlanLimits } from '../middleware/planLimits.js';

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
        selectedTemplateId: body.selectedTemplateId as string | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        editedHeadlines: body.editedHeadlines as Prisma.InputJsonValue | undefined,
        editedMetadata: body.editedMetadata as Prisma.InputJsonValue | undefined,
        styleConfig: body.styleConfig as Prisma.InputJsonValue | undefined,
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
        const fullPath = path.join(process.cwd(), filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }

    // Clean up generated icon
    if (project.generatedIconUrl && project.generatedIconUrl.startsWith('/uploads/')) {
      const iconPath = path.join(process.cwd(), project.generatedIconUrl);
      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }
    }

    await fastify.prisma.wizardProject.delete({ where: { id } });
    return reply.status(204).send();
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

    const uploadDir = path.join(process.cwd(), 'uploads', request.user.id, 'wizard', id);
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
    const filePath = path.join(process.cwd(), currentScreenshots[idx]);
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

    // 1. Generate headlines if screenshots service is enabled
    if (project.generateScreenshots && screenshots.length > 0) {
      const count = Math.min(8, Math.max(5, screenshots.length));
      const headlinesPrompt = `You are an expert ASO copywriter for App Store screenshots.
Generate ${count} compelling short headlines for "${project.appName}".
App description: "${project.briefDescription}"
Target keywords: "${project.targetKeywords}"

Rules:
- Each headline: 3-8 words, highlight 1-2 key words with [brackets]
- Cover different features/benefits in sequence
- Use power words that drive downloads
- Return JSON: { "headlines": ["...", "..."] }`;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an ASO expert. Return only valid JSON.' },
            { role: 'user', content: headlinesPrompt },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content) as { headlines: string[] };
        const headlines = parsed.headlines || [];

        results.generatedHeadlines = headlines;
        results.editedHeadlines = headlines;
      } catch (error) {
        fastify.log.error(error, 'Headlines generation error');
        results.generatedHeadlines = [];
        results.editedHeadlines = [];
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

      const metadataPrompt = `You are an expert ASO (App Store Optimization) copywriter. Generate optimized App Store (iOS) metadata.

App Name: "${project.appName}"
Brief Description: "${project.briefDescription}"${keywordsLine}

Return a JSON object with these fields: ${fieldsDescription}

Rules:
- Respect character limits strictly — each field must not exceed its limit
- Optimize for discoverability with relevant keywords
- Use a professional marketing tone with short paragraphs in descriptions
- For keywords: comma-separated, no spaces after commas, exclude words already in title/subtitle
- Return ONLY valid JSON, no markdown fences or extra text`;

      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an ASO expert. Return only valid JSON.' },
            { role: 'user', content: metadataPrompt },
          ],
          temperature: 0.7,
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

        results.generatedMetadata = metadata;
        results.editedMetadata = metadata;
      } catch (error) {
        fastify.log.error(error, 'Metadata generation error');
      }
    }

    // 3. Generate icon if enabled
    if (project.generateIcon) {
      const toneAdj = TONE_ADJECTIVES[project.tone] || 'vibrant, bold';

      try {
        const iconResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: `Create a modern professional iOS app icon for "${project.appName}".
The app is: ${project.briefDescription}.
Style: Clean, minimal, simple recognizable symbol.
Use a ${toneAdj} color palette.
No text or letters. Square format.`,
          n: 1,
          size: '1024x1024',
        });

        const imageUrl = iconResponse.data?.[0]?.url;
        if (imageUrl) {
          // Download and save the icon
          const iconDir = path.join(process.cwd(), 'uploads', request.user.id, 'wizard', id);
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
      }
    }

    // Update project with all results
    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        ...(results.generatedHeadlines !== undefined && {
          generatedHeadlines: results.generatedHeadlines as Prisma.InputJsonValue,
        }),
        ...(results.editedHeadlines !== undefined && {
          editedHeadlines: results.editedHeadlines as Prisma.InputJsonValue,
        }),
        ...(results.generatedMetadata !== undefined && {
          generatedMetadata: results.generatedMetadata as Prisma.InputJsonValue,
        }),
        ...(results.editedMetadata !== undefined && {
          editedMetadata: results.editedMetadata as Prisma.InputJsonValue,
        }),
        ...(results.generatedIconUrl !== undefined && {
          generatedIconUrl: results.generatedIconUrl as string,
        }),
        ...(results.selectedTemplateId !== undefined && {
          selectedTemplateId: results.selectedTemplateId as string,
        }),
        status: 'generated',
        currentStep: 7,
      },
    });

    return updated;
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

    const translatedHeadlines: Record<string, string[]> = {};
    const translatedMetadata: Record<string, Record<string, string>> = {};

    for (const lang of project.targetLanguages) {
      if (lang === project.sourceLanguage) continue;

      // Translate headlines
      if (editedHeadlines && editedHeadlines.length > 0) {
        try {
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator for App Store screenshots. Translate the following texts to ${lang}.

IMPORTANT RULES:
1. Keep translations concise and impactful - they appear as headlines on app screenshots
2. PRESERVE all [brackets] around text - these mark highlighted words
3. PRESERVE the | character for line breaks
4. Keep numbers and special characters as-is
5. Return ONLY the translations, one per line, in the exact same order
6. Do not add numbers, quotes, or any other formatting
7. For short promotional phrases, keep them punchy and marketing-style`,
              },
              {
                role: 'user',
                content: editedHeadlines.join('\n'),
              },
            ],
            temperature: 0.3,
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
          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a professional ASO translator. Return only valid JSON. Every field MUST respect its character limit.' },
              {
                role: 'user',
                content: `Translate this App Store (iOS) metadata from ${project.sourceLanguage} to ${lang}.

App name: "${project.appName}"${keywordsContext}

Current metadata:
${JSON.stringify(editedMetadata, null, 2)}

Rules:
- Adapt the marketing tone to the target culture
- STRICTLY respect character limits: ${fieldsDescription}
- The app name "${project.appName}" MUST remain in appName field
- For short fields (appName, subtitle): if the direct translation exceeds the limit, rewrite it shorter
- Incorporate target keywords naturally
- For keywords: use equivalent search terms in the target language, comma-separated, no spaces
- Return ONLY valid JSON with the same field names`,
              },
            ],
            temperature: 0.3,
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

            const fixResponse = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: 'You are a professional ASO translator. Return only valid JSON. Every field MUST respect its character limit.' },
                {
                  role: 'user',
                  content: `The following translated fields exceed their character limits. Rewrite ONLY these fields to fit within limits.

App name: "${project.appName}"${keywordsContext}

Fields to fix:
${fixList}

Rules:
- Keep the app name "${project.appName}" in the appName field
- Keep it marketing-friendly and natural in ${lang}
- Return ONLY valid JSON with just the fixed fields`,
                },
              ],
              temperature: 0.2,
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
    }

    const updated = await fastify.prisma.wizardProject.update({
      where: { id },
      data: {
        translatedHeadlines: translatedHeadlines as Prisma.InputJsonValue,
        translatedMetadata: translatedMetadata as Prisma.InputJsonValue,
        status: 'translated',
        currentStep: 9,
      },
    });

    return updated;
  });
}
