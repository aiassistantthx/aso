import { FastifyInstance } from 'fastify';
import AdminJS, { ComponentLoader } from 'adminjs';
import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource, getModelByName } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { clearPromptsCache } from '../utils/prompts.js';
import { getRequiredEnv } from '../utils/validateEnv.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

AdminJS.registerAdapter({ Database, Resource });

// Component loader for custom components
const componentLoader = new ComponentLoader();

// Register custom components
const Components = {
  PolarLink: componentLoader.add('PolarLink', path.join(__dirname, '../admin/components/PolarLink')),
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
          showProperties: ['id', 'email', 'name', 'plan', 'projectCount', 'polarCustomerId', 'polarLink', 'createdAt'],
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
              before: async (request: { payload?: Record<string, unknown> }) => {
                if (request.payload) {
                  if (request.payload.code) {
                    request.payload.code = (request.payload.code as string).toUpperCase();
                  }
                  // Convert numeric fields from strings
                  if (request.payload.discountValue !== undefined && request.payload.discountValue !== '') {
                    request.payload.discountValue = parseFloat(request.payload.discountValue as string);
                  } else {
                    request.payload.discountValue = 0;
                  }
                  if (request.payload.freeTrialDays !== undefined && request.payload.freeTrialDays !== '') {
                    request.payload.freeTrialDays = parseInt(request.payload.freeTrialDays as string, 10);
                  } else {
                    request.payload.freeTrialDays = 0;
                  }
                  if (request.payload.maxUses !== undefined && request.payload.maxUses !== '') {
                    request.payload.maxUses = parseInt(request.payload.maxUses as string, 10);
                  } else {
                    delete request.payload.maxUses;
                  }
                  // Clean up empty date strings so Prisma uses defaults/null
                  if (request.payload.validFrom === '') {
                    delete request.payload.validFrom;
                  }
                  if (request.payload.validUntil === '') {
                    delete request.payload.validUntil;
                  }
                }
                return request;
              },
            },
            edit: {
              before: async (request: { payload?: Record<string, unknown> }) => {
                if (request.payload) {
                  if (request.payload.code) {
                    request.payload.code = (request.payload.code as string).toUpperCase();
                  }
                  if (request.payload.discountValue !== undefined && request.payload.discountValue !== '') {
                    request.payload.discountValue = parseFloat(request.payload.discountValue as string);
                  }
                  if (request.payload.freeTrialDays !== undefined && request.payload.freeTrialDays !== '') {
                    request.payload.freeTrialDays = parseInt(request.payload.freeTrialDays as string, 10);
                  }
                  if (request.payload.maxUses !== undefined && request.payload.maxUses !== '') {
                    request.payload.maxUses = parseInt(request.payload.maxUses as string, 10);
                  } else if (request.payload.maxUses === '') {
                    request.payload.maxUses = null;
                  }
                  if (request.payload.validFrom === '') {
                    delete request.payload.validFrom;
                  }
                  if (request.payload.validUntil === '') {
                    request.payload.validUntil = null;
                  }
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

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  await AdminJSFastify.buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email: string, password: string) => {
        // If admin credentials not configured, deny all access
        if (!adminEmail || !adminPassword) {
          fastify.log.warn('Admin credentials not configured - access denied');
          return null;
        }
        if (email === adminEmail && password === adminPassword) {
          return { email: adminEmail, role: 'admin' };
        }
        return null;
      },
      cookieName: 'adminjs',
      cookiePassword: getRequiredEnv('SESSION_SECRET'),
    },
    fastify,
  );

  fastify.log.info(`AdminJS started at /admin`);
}
