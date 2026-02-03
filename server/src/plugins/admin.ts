import { FastifyInstance } from 'fastify';
import AdminJS, { ComponentLoader } from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { clearPromptsCache } from '../utils/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

AdminJS.registerAdapter({ Database, Resource });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Component loader for custom components
const componentLoader = new ComponentLoader();

// Register custom components
const Components = {
  PolarLink: componentLoader.add('PolarLink', path.join(__dirname, '../admin/components/PolarLink')),
  StripeLink: componentLoader.add('StripeLink', path.join(__dirname, '../admin/components/StripeLink')),
  Dashboard: componentLoader.add('Dashboard', path.join(__dirname, '../admin/components/Dashboard')),
};

export async function setupAdmin(fastify: FastifyInstance, prisma: PrismaClient) {
  // Get DMMF for Prisma models
  const dmmf = (prisma as any)._baseDmmf;

  const admin = new AdminJS({
    rootPath: '/admin',
    loginPath: '/admin/login',
    logoutPath: '/admin/logout',
    componentLoader,
    branding: {
      companyName: 'ASO Admin',
      logo: false,
      withMadeWithLove: false,
    },
    dashboard: {
      component: Components.Dashboard,
    },
    resources: [
      // Users with enhanced features
      {
        resource: { model: getModelByName('User', dmmf), client: prisma },
        options: {
          navigation: { name: 'Users', icon: 'User' },
          listProperties: ['id', 'email', 'name', 'plan', 'projectCount', 'createdAt'],
          filterProperties: ['email', 'name', 'createdAt'],
          editProperties: ['email', 'name'],
          showProperties: ['id', 'email', 'name', 'plan', 'projectCount', 'stripeCustomerId', 'polarCustomerId', 'polarLink', 'stripeLink', 'createdAt'],
          properties: {
            plan: {
              isVisible: { list: true, filter: false, show: true, edit: false },
              type: 'string',
            },
            projectCount: {
              isVisible: { list: true, filter: false, show: true, edit: false },
              type: 'number',
            },
            polarLink: {
              isVisible: { list: false, filter: false, show: true, edit: false },
              components: {
                show: Components.PolarLink,
              },
            },
            stripeLink: {
              isVisible: { list: false, filter: false, show: true, edit: false },
              components: {
                show: Components.StripeLink,
              },
            },
          },
          actions: {
            list: {
              after: async (response: { records?: Array<{ params: Record<string, unknown> }> }) => {
                // Enrich users with plan and project count
                const userIds = response.records?.map((r: { params: Record<string, unknown> }) => r.params.id as string) || [];

                if (userIds.length > 0) {
                  const subscriptions = await prisma.subscription.findMany({
                    where: { userId: { in: userIds } },
                    select: { userId: true, plan: true },
                  });

                  const projectCounts = await prisma.unifiedProject.groupBy({
                    by: ['userId'],
                    where: { userId: { in: userIds } },
                    _count: true,
                  });

                  const subMap = new Map(subscriptions.map(s => [s.userId, s.plan]));
                  const countMap = new Map(projectCounts.map(p => [p.userId, p._count]));

                  for (const record of response.records || []) {
                    const id = record.params.id as string;
                    record.params.plan = subMap.get(id) || 'FREE';
                    record.params.projectCount = countMap.get(id) || 0;
                  }
                }

                return response;
              },
            },
            show: {
              after: async (response: { record?: { params: Record<string, unknown> } }) => {
                const userId = response.record?.params.id as string | undefined;
                if (userId) {
                  const subscription = await prisma.subscription.findUnique({
                    where: { userId },
                    select: { plan: true },
                  });
                  const projectCount = await prisma.unifiedProject.count({
                    where: { userId },
                  });

                  if (response.record) {
                    response.record.params.plan = subscription?.plan || 'FREE';
                    response.record.params.projectCount = projectCount;
                  }
                }
                return response;
              },
            },
            grantPro: {
              actionType: 'record',
              icon: 'Star',
              label: 'Grant PRO',
              guard: 'Are you sure you want to grant PRO subscription to this user?',
              handler: async (_request: unknown, _response: unknown, context: { record?: { params: { id: string }; toJSON: (admin: unknown) => unknown }; currentAdmin: unknown; h: { resourceUrl: (opts: { resourceId: string }) => string } }) => {
                const { record, currentAdmin } = context;
                const userId = record?.params.id;

                if (!userId) {
                  return {
                    record: record?.toJSON(currentAdmin),
                    notice: {
                      message: 'User not found',
                      type: 'error',
                    },
                  };
                }

                // Create or update subscription
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

                await prisma.subscription.upsert({
                  where: { userId },
                  create: {
                    userId,
                    plan: 'PRO',
                    status: 'active',
                    currentPeriodEnd: oneYearFromNow,
                  },
                  update: {
                    plan: 'PRO',
                    status: 'active',
                    currentPeriodEnd: oneYearFromNow,
                  },
                });

                return {
                  record: record?.toJSON(currentAdmin),
                  notice: {
                    message: 'PRO subscription granted successfully',
                    type: 'success',
                  },
                  redirectUrl: context.h.resourceUrl({ resourceId: 'User' }),
                };
              },
              component: false,
            },
            revokePro: {
              actionType: 'record',
              icon: 'X',
              label: 'Revoke PRO',
              guard: 'Are you sure you want to revoke PRO subscription from this user?',
              handler: async (_request: unknown, _response: unknown, context: { record?: { params: { id: string }; toJSON: (admin: unknown) => unknown }; currentAdmin: unknown; h: { resourceUrl: (opts: { resourceId: string }) => string } }) => {
                const { record, currentAdmin } = context;
                const userId = record?.params.id;

                if (!userId) {
                  return {
                    record: record?.toJSON(currentAdmin),
                    notice: {
                      message: 'User not found',
                      type: 'error',
                    },
                  };
                }

                const subscription = await prisma.subscription.findUnique({
                  where: { userId },
                });

                if (!subscription || subscription.plan === 'FREE') {
                  return {
                    record: record?.toJSON(currentAdmin),
                    notice: {
                      message: 'User is already on FREE plan',
                      type: 'info',
                    },
                  };
                }

                await prisma.subscription.update({
                  where: { userId },
                  data: {
                    plan: 'FREE',
                    status: 'active',
                  },
                });

                return {
                  record: record?.toJSON(currentAdmin),
                  notice: {
                    message: 'PRO subscription revoked',
                    type: 'success',
                  },
                  redirectUrl: context.h.resourceUrl({ resourceId: 'User' }),
                };
              },
              component: false,
            },
          },
        },
      },
      // Subscriptions
      {
        resource: { model: getModelByName('Subscription', dmmf), client: prisma },
        options: {
          navigation: { name: 'Users', icon: 'CreditCard' },
          listProperties: ['id', 'userId', 'plan', 'status', 'currentPeriodEnd'],
          filterProperties: ['plan', 'status'],
          editProperties: ['plan', 'status', 'currentPeriodEnd'],
        },
      },
      // Admin Prompts
      {
        resource: { model: getModelByName('AdminPrompt', dmmf), client: prisma },
        options: {
          navigation: { name: 'Settings', icon: 'Settings' },
          listProperties: ['key', 'name', 'model', 'temperature', 'isActive', 'updatedAt'],
          filterProperties: ['key', 'model', 'isActive'],
          editProperties: ['name', 'description', 'systemMessage', 'userTemplate', 'model', 'temperature', 'isActive'],
          showProperties: ['key', 'name', 'description', 'systemMessage', 'userTemplate', 'model', 'temperature', 'isActive', 'createdAt', 'updatedAt'],
          properties: {
            key: {
              isDisabled: true, // Key should not be editable after creation
            },
            systemMessage: {
              type: 'textarea',
              props: {
                rows: 6,
              },
            },
            userTemplate: {
              type: 'textarea',
              props: {
                rows: 15,
              },
            },
            description: {
              type: 'textarea',
              props: {
                rows: 2,
              },
            },
          },
          actions: {
            edit: {
              after: async (response: unknown) => {
                // Clear cache when prompt is edited
                clearPromptsCache();
                return response;
              },
            },
            new: {
              isAccessible: false, // Don't allow creating new prompts (use seed)
            },
            delete: {
              isAccessible: false, // Don't allow deleting prompts
            },
          },
        },
      },
      // Unified Projects (new)
      {
        resource: { model: getModelByName('UnifiedProject', dmmf), client: prisma },
        options: {
          navigation: { name: 'Projects', icon: 'Layers' },
          listProperties: ['id', 'name', 'mode', 'userId', 'wizardStatus', 'createdAt'],
          filterProperties: ['mode', 'wizardStatus', 'createdAt'],
          showProperties: ['id', 'name', 'mode', 'userId', 'appName', 'briefDescription', 'wizardCurrentStep', 'wizardStatus', 'sourceLanguage', 'createdAt'],
        },
      },
      {
        resource: { model: getModelByName('UnifiedScreenshot', dmmf), client: prisma },
        options: {
          navigation: { name: 'Projects', icon: 'Image' },
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
      // Promo Codes
      {
        resource: { model: getModelByName('PromoCode', dmmf), client: prisma },
        options: {
          navigation: { name: 'Marketing', icon: 'Gift' },
          listProperties: ['code', 'description', 'discountType', 'discountValue', 'usedCount', 'maxUses', 'isActive', 'validUntil'],
          filterProperties: ['code', 'discountType', 'isActive'],
          editProperties: ['code', 'description', 'discountType', 'discountValue', 'freeTrialDays', 'maxUses', 'validFrom', 'validUntil', 'isActive'],
          showProperties: ['id', 'code', 'description', 'discountType', 'discountValue', 'freeTrialDays', 'maxUses', 'usedCount', 'validFrom', 'validUntil', 'isActive', 'createdAt'],
          properties: {
            code: {
              description: 'Unique promo code (will be uppercased)',
            },
            discountType: {
              availableValues: [
                { value: 'percent', label: 'Percentage Discount' },
                { value: 'fixed', label: 'Fixed Amount Discount' },
                { value: 'free_trial', label: 'Free Trial Days' },
              ],
            },
            discountValue: {
              description: 'For percent: 0-100, for fixed: amount in cents',
            },
            freeTrialDays: {
              description: 'Days of free PRO access (for free_trial type)',
            },
          },
          actions: {
            new: {
              before: async (request: { payload?: { code?: string } }) => {
                if (request.payload?.code) {
                  request.payload.code = request.payload.code.toUpperCase();
                }
                return request;
              },
            },
            edit: {
              before: async (request: { payload?: { code?: string } }) => {
                if (request.payload?.code) {
                  request.payload.code = request.payload.code.toUpperCase();
                }
                return request;
              },
            },
          },
        },
      },
      {
        resource: { model: getModelByName('PromoRedemption', dmmf), client: prisma },
        options: {
          navigation: { name: 'Marketing', icon: 'CheckCircle' },
          listProperties: ['id', 'promoCodeId', 'userId', 'redeemedAt'],
          actions: {
            new: { isAccessible: false },
            edit: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
      // AI Usage Logs
      {
        resource: { model: getModelByName('AIUsageLog', dmmf), client: prisma },
        options: {
          navigation: { name: 'Analytics', icon: 'Activity' },
          listProperties: ['id', 'operationType', 'model', 'totalTokens', 'estimatedCost', 'success', 'createdAt'],
          filterProperties: ['operationType', 'model', 'success', 'createdAt'],
          showProperties: ['id', 'userId', 'projectId', 'operationType', 'model', 'promptTokens', 'completionTokens', 'totalTokens', 'estimatedCost', 'durationMs', 'success', 'errorMessage', 'metadata', 'createdAt'],
          properties: {
            estimatedCost: {
              type: 'number',
            },
          },
          sort: {
            sortBy: 'createdAt',
            direction: 'desc',
          },
          actions: {
            new: { isAccessible: false },
            edit: { isAccessible: false },
            delete: { isAccessible: false },
          },
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
