import { FastifyInstance } from 'fastify';
import AdminJS from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

AdminJS.registerAdapter({ Database, Resource });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function setupAdmin(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get DMMF for Prisma models
  const dmmf = (prisma as any)._baseDmmf;

  const admin = new AdminJS({
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    branding: {
      companyName: 'ASO Admin',
      logo: false,
      withMadeWithLove: false,
    },
    resources: [
      // Main resources
      {
        resource: { model: getModelByName('User', dmmf), client: prisma },
        options: {
          navigation: { name: 'Users', icon: 'User' },
          listProperties: ['id', 'email', 'name', 'createdAt'],
          filterProperties: ['email', 'name', 'createdAt'],
          editProperties: ['email', 'name'],
          showProperties: ['id', 'email', 'name', 'stripeCustomerId', 'polarCustomerId', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('Subscription', dmmf), client: prisma },
        options: {
          navigation: { name: 'Subscriptions', icon: 'CreditCard' },
          listProperties: ['id', 'userId', 'plan', 'status', 'currentPeriodEnd'],
          filterProperties: ['plan', 'status'],
          editProperties: ['plan', 'status', 'currentPeriodEnd'],
        },
      },
      // Unified Projects (new)
      {
        resource: { model: getModelByName('UnifiedProject', dmmf), client: prisma },
        options: {
          navigation: { name: 'Unified Projects', icon: 'Layers' },
          listProperties: ['id', 'name', 'mode', 'userId', 'wizardStatus', 'createdAt'],
          filterProperties: ['mode', 'wizardStatus', 'createdAt'],
          showProperties: ['id', 'name', 'mode', 'userId', 'appName', 'briefDescription', 'wizardCurrentStep', 'wizardStatus', 'sourceLanguage', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('UnifiedScreenshot', dmmf), client: prisma },
        options: {
          navigation: { name: 'Unified Screenshots', icon: 'Image' },
          listProperties: ['id', 'projectId', 'order', 'text'],
        },
      },
      // Legacy resources
      {
        resource: { model: getModelByName('Project', dmmf), client: prisma },
        options: {
          navigation: { name: 'Legacy', icon: 'Archive' },
          listProperties: ['id', 'name', 'userId', 'deviceSize', 'createdAt'],
          filterProperties: ['name', 'userId', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('WizardProject', dmmf), client: prisma },
        options: {
          navigation: { name: 'Legacy', icon: 'Archive' },
          listProperties: ['id', 'appName', 'userId', 'status', 'currentStep', 'createdAt'],
          filterProperties: ['status', 'currentStep', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('MetadataProject', dmmf), client: prisma },
        options: {
          navigation: { name: 'Legacy', icon: 'Archive' },
          listProperties: ['id', 'name', 'userId', 'platform', 'createdAt'],
          filterProperties: ['platform', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('Screenshot', dmmf), client: prisma },
        options: {
          navigation: { name: 'Legacy', icon: 'Archive' },
          listProperties: ['id', 'projectId', 'order', 'text'],
        },
      },
    ],
  });

  await admin.initialize();

  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email: string, password: string) => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          return { email: ADMIN_EMAIL, role: 'admin' };
        }
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: process.env.SESSION_SECRET || 'a-very-long-secret-key-for-sessions-min-32-chars',
    },
    fastify,
  );

  fastify.log.info(`AdminJS started at /admin`);
}
