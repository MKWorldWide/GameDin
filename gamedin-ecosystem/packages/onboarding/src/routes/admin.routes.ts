import { FastifyInstance } from 'fastify';
import { authenticate } from '@gamedin/auth/middleware/auth.middleware';
import * as adminController from '../controllers/admin.controller';

/**
 * Register admin routes
 */
export async function adminRoutes(fastify: FastifyInstance) {
  // Apply authentication middleware to all admin routes
  fastify.register(async (fastify) => {
    // Require admin role for all admin routes
    fastify.addHook('onRequest', authenticate({ roles: ['admin'] }));

    // Dashboard overview (combined stats)
    fastify.get(
      '/overview',
      {
        schema: {
          tags: ['admin'],
          summary: 'Get dashboard overview with combined stats',
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                userStats: { $ref: 'UserStats' },
                onboardingMetrics: { $ref: 'OnboardingMetrics' },
                systemHealth: { $ref: 'SystemHealth' },
                recentActivity: {
                  type: 'array',
                  items: { $ref: 'ActivityLog' },
                },
              },
            },
            401: { $ref: 'UnauthorizedError' },
            403: { $ref: 'ForbiddenError' },
            500: { $ref: 'InternalServerError' },
          },
        },
      },
      adminController.getDashboardOverview
    );

    // User statistics
    fastify.get(
      '/stats/users',
      {
        schema: {
          tags: ['admin'],
          summary: 'Get user statistics',
          security: [{ bearerAuth: [] }],
          querystring: {
            type: 'object',
            properties: {
              timeRange: {
                type: 'string',
                enum: ['24h', '7d', '30d', 'all'],
                default: '30d',
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                totalUsers: { type: 'number' },
                activeUsers: { type: 'number' },
                newUsers: { type: 'number' },
                usersByRole: { type: 'object' },
                usersByStatus: {
                  type: 'object',
                  properties: {
                    active: { type: 'number' },
                    suspended: { type: 'number' },
                    unverified: { type: 'number' },
                  },
                },
              },
            },
            401: { $ref: 'UnauthorizedError' },
            403: { $ref: 'ForbiddenError' },
            500: { $ref: 'InternalServerError' },
          },
        },
      },
      adminController.getUserStats
    );

    // Onboarding metrics
    fastify.get(
      '/metrics/onboarding',
      {
        schema: {
          tags: ['admin'],
          summary: 'Get onboarding metrics',
          security: [{ bearerAuth: [] }],
          querystring: {
            type: 'object',
            properties: {
              timeRange: {
                type: 'string',
                enum: ['24h', '7d', '30d'],
                default: '30d',
              },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                totalStarted: { type: 'number' },
                totalCompleted: { type: 'number' },
                completionRate: { type: 'number' },
                avgTimeToComplete: { type: 'number' },
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      step: { type: 'string' },
                      started: { type: 'number' },
                      completed: { type: 'number' },
                      dropOffRate: { type: 'number' },
                      avgTime: { type: 'number' },
                    },
                  },
                },
                byDay: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      date: { type: 'string' },
                      started: { type: 'number' },
                      completed: { type: 'number' },
                    },
                  },
                },
              },
            },
            401: { $ref: 'UnauthorizedError' },
            403: { $ref: 'ForbiddenError' },
            500: { $ref: 'InternalServerError' },
          },
        },
      },
      adminController.getOnboardingMetrics
    );

    // System health
    fastify.get(
      '/system/health',
      {
        schema: {
          tags: ['admin'],
          summary: 'Get system health status',
          security: [{ bearerAuth: [] }],
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
                services: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      status: { type: 'string', enum: ['up', 'down', 'degraded'] },
                      responseTime: { type: 'number' },
                      error: { type: 'string', nullable: true },
                    },
                  },
                },
                metrics: {
                  type: 'object',
                  properties: {
                    cpu: { type: 'number' },
                    memory: { type: 'number' },
                    disk: { type: 'number' },
                    uptime: { type: 'number' },
                  },
                },
                lastChecked: { type: 'string', format: 'date-time' },
              },
            },
            401: { $ref: 'UnauthorizedError' },
            403: { $ref: 'ForbiddenError' },
            500: { $ref: 'InternalServerError' },
          },
        },
      },
      adminController.getSystemHealth
    );

    // Activity logs
    fastify.get(
      '/activity/logs',
      {
        schema: {
          tags: ['admin'],
          summary: 'Get activity logs',
          security: [{ bearerAuth: [] }],
          querystring: {
            type: 'object',
            properties: {
              limit: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
            },
          },
          response: {
            200: {
              type: 'object',
              properties: {
                success: { type: 'boolean' },
                logs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      action: { type: 'string' },
                      userId: { type: 'string' },
                      ipAddress: { type: 'string' },
                      userAgent: { type: 'string' },
                      metadata: { type: 'object' },
                    },
                  },
                },
              },
            },
            401: { $ref: 'UnauthorizedError' },
            403: { $ref: 'ForbiddenError' },
            500: { $ref: 'InternalServerError' },
          },
        },
      },
      adminController.getActivityLogs
    );
  }, { prefix: '/admin' });
}

// Export schemas for OpenAPI documentation
export const adminSchemas = {
  UserStats: {
    type: 'object',
    properties: {
      totalUsers: { type: 'number' },
      activeUsers: { type: 'number' },
      newUsers: { type: 'number' },
      usersByRole: { type: 'object' },
      usersByStatus: {
        type: 'object',
        properties: {
          active: { type: 'number' },
          suspended: { type: 'number' },
          unverified: { type: 'number' },
        },
      },
    },
  },
  OnboardingMetrics: {
    type: 'object',
    properties: {
      totalStarted: { type: 'number' },
      totalCompleted: { type: 'number' },
      completionRate: { type: 'number' },
      avgTimeToComplete: { type: 'number' },
      steps: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            step: { type: 'string' },
            started: { type: 'number' },
            completed: { type: 'number' },
            dropOffRate: { type: 'number' },
            avgTime: { type: 'number' },
          },
        },
      },
      byDay: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            started: { type: 'number' },
            completed: { type: 'number' },
          },
        },
      },
    },
  },
  SystemHealth: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['healthy', 'degraded', 'unhealthy'] },
      services: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['up', 'down', 'degraded'] },
            responseTime: { type: 'number' },
            error: { type: 'string', nullable: true },
          },
        },
      },
      metrics: {
        type: 'object',
        properties: {
          cpu: { type: 'number' },
          memory: { type: 'number' },
          disk: { type: 'number' },
          uptime: { type: 'number' },
        },
      },
      lastChecked: { type: 'string', format: 'date-time' },
    },
  },
  ActivityLog: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      timestamp: { type: 'string', format: 'date-time' },
      action: { type: 'string' },
      userId: { type: 'string' },
      ipAddress: { type: 'string' },
      userAgent: { type: 'string' },
      metadata: { type: 'object' },
    },
  },
  UnauthorizedError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', default: false },
      error: { type: 'string', default: 'Unauthorized' },
    },
  },
  ForbiddenError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', default: false },
      error: { type: 'string', default: 'Forbidden' },
    },
  },
  InternalServerError: {
    type: 'object',
    properties: {
      success: { type: 'boolean', default: false },
      error: { type: 'string', default: 'Internal Server Error' },
    },
  },
};
