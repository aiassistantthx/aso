import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import { checkProjectLimit } from '../middleware/planLimits.js';

export default async function projectRoutes(fastify: FastifyInstance) {
  // List user's projects
  fastify.get('/api/projects', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    const projects = await fastify.prisma.project.findMany({
      where: { userId: request.user.id },
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
      updatedAt: p.updatedAt,
      screenshotCount: p._count.screenshots,
      thumbnail: p.screenshots[0]?.imagePath
        ? `/uploads/${p.userId}/${p.id}/${p.screenshots[0].imagePath}`
        : null,
    }));
  });

  // Create project
  fastify.post('/api/projects', {
    onRequest: [fastify.authenticate],
    preHandler: [checkProjectLimit],
  }, async (request, reply) => {
    const { name, styleConfig, deviceSize, sourceLanguage, targetLanguages } = request.body as {
      name: string;
      styleConfig?: Record<string, unknown>;
      deviceSize?: string;
      sourceLanguage?: string;
      targetLanguages?: string[];
    };

    if (!name) {
      return reply.status(400).send({ error: 'Project name is required' });
    }

    const project = await fastify.prisma.project.create({
      data: {
        userId: request.user.id,
        name,
        styleConfig: (styleConfig ?? {}) as Prisma.InputJsonValue,
        deviceSize: deviceSize ?? '6.9',
        sourceLanguage: sourceLanguage ?? 'en-US',
        targetLanguages: targetLanguages ?? [],
      },
    });

    return reply.status(201).send(project);
  });

  // Get project with screenshots
  fastify.get('/api/projects/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.project.findFirst({
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

  // Update project
  fastify.put('/api/projects/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.project.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const updated = await fastify.prisma.project.update({
      where: { id },
      data: {
        name: body.name as string | undefined,
        styleConfig: body.styleConfig as Prisma.InputJsonValue | undefined,
        deviceSize: body.deviceSize as string | undefined,
        sourceLanguage: body.sourceLanguage as string | undefined,
        targetLanguages: body.targetLanguages as string[] | undefined,
        translationData: body.translationData as Prisma.InputJsonValue | undefined,
      },
    });

    return updated;
  });

  // Delete project
  fastify.delete('/api/projects/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const project = await fastify.prisma.project.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Delete project (screenshots cascade)
    await fastify.prisma.project.delete({ where: { id } });

    // Clean up uploaded files
    const fs = await import('fs');
    const path = await import('path');
    const uploadDir = path.join(process.cwd(), 'uploads', request.user.id, id);
    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true });
    }

    return reply.send({ ok: true });
  });

  // Autosave
  fastify.post('/api/projects/:id/autosave', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.project.findFirst({
      where: { id, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const updated = await fastify.prisma.project.update({
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
}
