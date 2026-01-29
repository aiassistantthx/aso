import { FastifyInstance } from 'fastify';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default async function screenshotRoutes(fastify: FastifyInstance) {
  // Upload screenshot
  fastify.post('/api/projects/:projectId/screenshots', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'uploads', request.user.id, projectId);
    fs.mkdirSync(uploadDir, { recursive: true });

    // Generate filename
    const ext = path.extname(data.filename) || '.png';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await pipeline(data.file, fs.createWriteStream(filepath));

    // Get current max order
    const maxOrder = await fastify.prisma.screenshot.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const screenshot = await fastify.prisma.screenshot.create({
      data: {
        projectId,
        order: (maxOrder._max.order ?? -1) + 1,
        imagePath: filename,
        text: '',
      },
    });

    return reply.status(201).send({
      ...screenshot,
      imageUrl: `/uploads/${request.user.id}/${projectId}/${filename}`,
    });
  });

  // Update screenshot
  fastify.put('/api/projects/:projectId/screenshots/:sid', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId, sid } = request.params as { projectId: string; sid: string };
    const body = request.body as Record<string, unknown>;

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const screenshot = await fastify.prisma.screenshot.findFirst({
      where: { id: sid, projectId },
    });

    if (!screenshot) {
      return reply.status(404).send({ error: 'Screenshot not found' });
    }

    const updated = await fastify.prisma.screenshot.update({
      where: { id: sid },
      data: {
        text: body.text as string | undefined,
        order: body.order as number | undefined,
        decorations: body.decorations as Prisma.InputJsonValue | undefined,
        styleOverride: body.styleOverride as Prisma.InputJsonValue | undefined,
        mockupSettings: body.mockupSettings as Prisma.InputJsonValue | undefined,
      },
    });

    return updated;
  });

  // Delete screenshot
  fastify.delete('/api/projects/:projectId/screenshots/:sid', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId, sid } = request.params as { projectId: string; sid: string };

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const screenshot = await fastify.prisma.screenshot.findFirst({
      where: { id: sid, projectId },
    });

    if (!screenshot) {
      return reply.status(404).send({ error: 'Screenshot not found' });
    }

    // Delete file
    if (screenshot.imagePath) {
      const filepath = path.join(process.cwd(), 'uploads', request.user.id, projectId, screenshot.imagePath);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    await fastify.prisma.screenshot.delete({ where: { id: sid } });

    return reply.status(204).send();
  });

  // Reorder screenshots
  fastify.put('/api/projects/:projectId/screenshots/reorder', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { order } = request.body as { order: string[] };

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Update each screenshot's order
    await Promise.all(
      order.map((id, index) =>
        fastify.prisma.screenshot.updateMany({
          where: { id, projectId },
          data: { order: index },
        })
      )
    );

    return { ok: true };
  });

  // Bulk update screenshots (for autosave)
  fastify.put('/api/projects/:projectId/screenshots/bulk', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { screenshots } = request.body as {
      screenshots: Array<{
        id: string;
        text?: string;
        order?: number;
        decorations?: unknown;
        styleOverride?: unknown;
        mockupSettings?: unknown;
      }>;
    };

    const project = await fastify.prisma.project.findFirst({
      where: { id: projectId, userId: request.user.id },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    await Promise.all(
      screenshots.map((s) =>
        fastify.prisma.screenshot.updateMany({
          where: { id: s.id, projectId },
          data: {
            text: s.text,
            order: s.order,
            decorations: s.decorations as Prisma.InputJsonValue | undefined,
            styleOverride: s.styleOverride as Prisma.InputJsonValue | undefined,
            mockupSettings: s.mockupSettings as Prisma.InputJsonValue | undefined,
          },
        })
      )
    );

    return { ok: true };
  });
}
