import { PrismaClient } from '@prisma/client';
import { DEFAULT_PROMPTS } from './prompts.js';

const PROMPT_METADATA: Record<string, { name: string; description: string }> = {
  headlines_generation: {
    name: 'Headlines Generation',
    description: 'Generates ASO headlines for App Store screenshots',
  },
  metadata_generation: {
    name: 'Metadata Generation',
    description: 'Generates optimized App Store metadata (appName, subtitle, keywords, description, whatsNew)',
  },
  metadata_fix: {
    name: 'Metadata Fix',
    description: 'Fixes metadata fields that exceed character limits',
  },
  headlines_translation: {
    name: 'Headlines Translation',
    description: 'Translates screenshot headlines to target language',
  },
  metadata_translation: {
    name: 'Metadata Translation',
    description: 'Translates App Store metadata to target language',
  },
  metadata_translation_fix: {
    name: 'Metadata Translation Fix',
    description: 'Fixes translated metadata fields that exceed character limits',
  },
  icon_generation: {
    name: 'Icon Generation',
    description: 'DALL-E prompt for generating app icons',
  },
};

/**
 * Seed default prompts into the database if they don't exist
 */
export async function seedPrompts(prisma: PrismaClient): Promise<void> {
  const existingCount = await prisma.adminPrompt.count();

  if (existingCount > 0) {
    console.log(`Prompts already seeded (${existingCount} prompts in DB)`);
    return;
  }

  console.log('Seeding default prompts...');

  for (const [key, config] of Object.entries(DEFAULT_PROMPTS)) {
    const meta = PROMPT_METADATA[key] || { name: key, description: '' };

    await prisma.adminPrompt.create({
      data: {
        key,
        name: meta.name,
        description: meta.description,
        systemMessage: config.systemMessage,
        userTemplate: config.userTemplate,
        model: config.model,
        temperature: config.temperature,
        isActive: true,
      },
    });

    console.log(`  Created prompt: ${key}`);
  }

  console.log(`Seeded ${Object.keys(DEFAULT_PROMPTS).length} prompts`);
}
