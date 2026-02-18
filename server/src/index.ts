import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import rawBody from 'fastify-raw-body';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

import { validateEnv } from './utils/validateEnv.js';
import prismaPlugin from './plugins/prisma.js';
import firebasePlugin from './plugins/firebase.js';
import authPlugin from './plugins/auth.js';
import polarPlugin from './plugins/polar.js';
import { setupAdmin } from './plugins/admin.js';
import { seedPrompts } from './utils/seedPrompts.js';

import cookie from '@fastify/cookie';
import authRoutes from './routes/auth.js';
import translateRoutes from './routes/translate.js';
import polarRoutes from './routes/polar.js';
import unifiedRoutes from './routes/unified.js';
import adminApiRoutes from './routes/admin-api.js';
import { UPLOADS_DIR } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  // Validate required environment variables before starting
  validateEnv();

  const fastify = Fastify({
    logger: true,
  });

  // Shared Prisma client for admin
  const prisma = new PrismaClient();
  await prisma.$connect();

  // Seed default prompts if not present
  await seedPrompts(prisma);

  // Setup AdminJS first (in its own encapsulated scope)
  await fastify.register(async (instance) => {
    await setupAdmin(instance, prisma);
  });

  // Cookie parser (for admin session check)
  await fastify.register(cookie);

  // CORS for dev mode
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Security headers (CSP, XSS protection, etc.)
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://www.gstatic.com", "https://datafa.st", "https://www.googletagmanager.com", "https://googletagmanager.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "https://www.googletagmanager.com"],
        connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com", "https://firebaseinstallations.googleapis.com", "https://accounts.google.com", "https://oauth2.googleapis.com", "https://www.googleapis.com", "https://www.google-analytics.com", "https://analytics.google.com", "https://region1.google-analytics.com"],
        frameSrc: ["'self'", "https://accounts.google.com", "https://*.firebaseapp.com", "https://www.googletagmanager.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Allow popups to communicate back (required for Firebase Auth popup flow)
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  });

  // Rate limiting for auth endpoints (brute force protection)
  await fastify.register(rateLimit, {
    global: false, // Don't apply globally, only to specific routes
  });

  // Multipart uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Raw body for webhook signature verification
  await fastify.register(rawBody, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
  });

  // Plugins
  await fastify.register(prismaPlugin);
  await fastify.register(firebasePlugin);
  await fastify.register(authPlugin);
  await fastify.register(polarPlugin);

  // API Routes
  await fastify.register(authRoutes);
  await fastify.register(translateRoutes);
  await fastify.register(polarRoutes);
  await fastify.register(unifiedRoutes);
  await fastify.register(adminApiRoutes);

  // Serve uploaded files
  const uploadsDir = UPLOADS_DIR;
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
      if (request.url.startsWith('/api/') || request.url.startsWith('/uploads/') || request.url.startsWith('/admin')) {
        return reply.status(404).send({ error: 'Not found' });
      }
      return reply.sendFile('index.html');
    });
  }

  // Cleanup on close
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

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
