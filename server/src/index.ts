import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import prismaPlugin from './plugins/prisma.js';
import authPlugin from './plugins/auth.js';
import stripePlugin from './plugins/stripe.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import screenshotRoutes from './routes/screenshots.js';
import translateRoutes from './routes/translate.js';
import stripeRoutes from './routes/stripe.js';
import metadataRoutes from './routes/metadata.js';
import wizardRoutes from './routes/wizard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  const fastify = Fastify({
    logger: true,
  });

  // CORS for dev mode
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Multipart uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Plugins
  await fastify.register(prismaPlugin);
  await fastify.register(authPlugin);
  await fastify.register(stripePlugin);

  // API Routes
  await fastify.register(authRoutes);
  await fastify.register(projectRoutes);
  await fastify.register(screenshotRoutes);
  await fastify.register(translateRoutes);
  await fastify.register(stripeRoutes);
  await fastify.register(metadataRoutes);
  await fastify.register(wizardRoutes);

  // Serve uploaded files
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve frontend static files in production (register first to get decorateReply)
  const distDir = path.resolve(__dirname, '../../dist');
  if (fs.existsSync(distDir)) {
    await fastify.register(fastifyStatic, {
      root: distDir,
      prefix: '/',
      wildcard: false,
    });
  }

  await fastify.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
    decorateReply: false,
  });

  if (fs.existsSync(distDir)) {
    // SPA fallback: serve index.html for non-API routes
    fastify.setNotFoundHandler(async (request, reply) => {
      if (request.url.startsWith('/api/') || request.url.startsWith('/uploads/')) {
        return reply.status(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  // Start
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
