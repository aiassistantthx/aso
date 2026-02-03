/**
 * Migration script: Unify Projects
 *
 * Migrates data from old project models (Project, WizardProject, MetadataProject)
 * to the new UnifiedProject model.
 *
 * Run with: npx tsx server/src/migrations/unifyProjects.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateWizardProjects() {
  console.log('Migrating WizardProjects...');

  const wizardProjects = await prisma.wizardProject.findMany();
  console.log(`Found ${wizardProjects.length} wizard projects to migrate`);

  for (const wp of wizardProjects) {
    // Check if already migrated (by checking for matching userId + appName + createdAt)
    const existing = await prisma.unifiedProject.findFirst({
      where: {
        userId: wp.userId,
        name: wp.appName || 'Wizard Project',
        mode: 'wizard',
        createdAt: wp.createdAt,
      },
    });

    if (existing) {
      console.log(`  Skipping wizard project ${wp.id} (already migrated)`);
      continue;
    }

    // Create unified project
    const unified = await prisma.unifiedProject.create({
      data: {
        userId: wp.userId,
        name: wp.appName || 'Wizard Project',
        mode: 'wizard',
        appName: wp.appName,
        briefDescription: wp.briefDescription,
        targetKeywords: wp.targetKeywords,
        styleConfig: wp.styleConfig as Prisma.InputJsonValue ?? undefined,
        metadataPlatform: 'ios',
        generatedMetadata: wp.generatedMetadata as Prisma.InputJsonValue ?? undefined,
        editedMetadata: wp.editedMetadata as Prisma.InputJsonValue ?? undefined,
        metadataTranslations: wp.translatedMetadata as Prisma.InputJsonValue ?? undefined,
        sourceLanguage: wp.sourceLanguage,
        targetLanguages: wp.targetLanguages,
        wizardCurrentStep: wp.currentStep,
        wizardTone: wp.tone,
        wizardLayoutPreset: wp.layoutPreset,
        wizardSelectedTemplateId: wp.selectedTemplateId,
        wizardGeneratedHeadlines: wp.generatedHeadlines as Prisma.InputJsonValue ?? undefined,
        wizardEditedHeadlines: wp.editedHeadlines as Prisma.InputJsonValue ?? undefined,
        wizardGeneratedIconUrl: wp.generatedIconUrl,
        wizardStatus: wp.status,
        wizardUploadedScreenshots: wp.uploadedScreenshots as Prisma.InputJsonValue ?? undefined,
        wizardScreenshotEditorData: wp.screenshotEditorData as Prisma.InputJsonValue ?? undefined,
        wizardTranslatedHeadlines: wp.translatedHeadlines as Prisma.InputJsonValue ?? undefined,
        wizardGenerateScreenshots: wp.generateScreenshots,
        wizardGenerateIcon: wp.generateIcon,
        wizardGenerateMetadata: wp.generateMetadata,
        createdAt: wp.createdAt,
        updatedAt: wp.updatedAt,
      },
    });

    // Convert uploadedScreenshots to UnifiedScreenshot records
    const uploadedScreenshots = wp.uploadedScreenshots as string[] | null;
    const editedHeadlines = wp.editedHeadlines as string[] | null;
    const editorData = wp.screenshotEditorData as Array<{
      decorations?: unknown;
      styleOverride?: unknown;
      mockupSettings?: unknown;
    }> | null;

    if (uploadedScreenshots && uploadedScreenshots.length > 0) {
      for (let i = 0; i < uploadedScreenshots.length; i++) {
        await prisma.unifiedScreenshot.create({
          data: {
            projectId: unified.id,
            order: i,
            imagePath: uploadedScreenshots[i],
            text: editedHeadlines?.[i] || '',
            decorations: editorData?.[i]?.decorations as Prisma.InputJsonValue ?? undefined,
            styleOverride: editorData?.[i]?.styleOverride as Prisma.InputJsonValue ?? undefined,
            mockupSettings: editorData?.[i]?.mockupSettings as Prisma.InputJsonValue ?? undefined,
          },
        });
      }
    }

    console.log(`  Migrated wizard project ${wp.id} -> ${unified.id}`);
  }
}

async function migrateProjects() {
  console.log('Migrating Projects (manual editor)...');

  const projects = await prisma.project.findMany({
    include: {
      screenshots: {
        orderBy: { order: 'asc' },
      },
    },
  });
  console.log(`Found ${projects.length} manual projects to migrate`);

  for (const p of projects) {
    // Check if already migrated
    const existing = await prisma.unifiedProject.findFirst({
      where: {
        userId: p.userId,
        name: p.name,
        mode: 'manual',
        createdAt: p.createdAt,
      },
    });

    if (existing) {
      console.log(`  Skipping project ${p.id} (already migrated)`);
      continue;
    }

    // Create unified project
    const unified = await prisma.unifiedProject.create({
      data: {
        userId: p.userId,
        name: p.name,
        mode: 'manual',
        appName: p.name,
        styleConfig: p.styleConfig as Prisma.InputJsonValue ?? undefined,
        deviceSize: p.deviceSize,
        sourceLanguage: p.sourceLanguage,
        targetLanguages: p.targetLanguages,
        translationData: p.translationData as Prisma.InputJsonValue ?? undefined,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      },
    });

    // Convert screenshots
    for (const s of p.screenshots) {
      await prisma.unifiedScreenshot.create({
        data: {
          projectId: unified.id,
          order: s.order,
          imagePath: s.imagePath,
          text: s.text,
          decorations: s.decorations as Prisma.InputJsonValue ?? undefined,
          styleOverride: s.styleOverride as Prisma.InputJsonValue ?? undefined,
          mockupSettings: s.mockupSettings as Prisma.InputJsonValue ?? undefined,
        },
      });
    }

    console.log(`  Migrated project ${p.id} -> ${unified.id}`);
  }
}

async function migrateMetadataProjects() {
  console.log('Migrating MetadataProjects...');

  const metadataProjects = await prisma.metadataProject.findMany();
  console.log(`Found ${metadataProjects.length} metadata projects to migrate`);

  for (const mp of metadataProjects) {
    // Check if already migrated
    const existing = await prisma.unifiedProject.findFirst({
      where: {
        userId: mp.userId,
        name: mp.name,
        mode: 'manual',
        createdAt: mp.createdAt,
      },
    });

    if (existing) {
      console.log(`  Skipping metadata project ${mp.id} (already migrated)`);
      continue;
    }

    // Create unified project (metadata-only projects become manual mode with metadata filled in)
    const unified = await prisma.unifiedProject.create({
      data: {
        userId: mp.userId,
        name: mp.name,
        mode: 'manual',
        appName: mp.appName,
        briefDescription: mp.briefDescription,
        targetKeywords: mp.targetKeywords,
        metadataPlatform: mp.platform,
        generatedMetadata: mp.generatedMetadata as Prisma.InputJsonValue ?? undefined,
        editedMetadata: mp.editedMetadata as Prisma.InputJsonValue ?? undefined,
        metadataTranslations: mp.translations as Prisma.InputJsonValue ?? undefined,
        sourceLanguage: mp.sourceLanguage,
        targetLanguages: mp.targetLanguages,
        createdAt: mp.createdAt,
        updatedAt: mp.updatedAt,
      },
    });

    console.log(`  Migrated metadata project ${mp.id} -> ${unified.id}`);
  }
}

async function main() {
  console.log('Starting unified project migration...\n');

  try {
    await migrateWizardProjects();
    console.log('');

    await migrateProjects();
    console.log('');

    await migrateMetadataProjects();
    console.log('');

    // Print summary
    const unifiedCount = await prisma.unifiedProject.count();
    const screenshotCount = await prisma.unifiedScreenshot.count();

    console.log('Migration complete!');
    console.log(`Total unified projects: ${unifiedCount}`);
    console.log(`Total unified screenshots: ${screenshotCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
