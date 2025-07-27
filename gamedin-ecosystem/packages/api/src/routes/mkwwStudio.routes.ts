import { FastifyInstance } from 'fastify';
import mkwwStudioController from '../controllers/mkwwStudioController';
import { verifyJWT } from '../plugins/authenticate';

export default async function mkwwStudioRoutes(fastify: FastifyInstance) {
  // Public routes (no authentication required)
  fastify.post(
    '/mkww/verify-key',
    {
      schema: {
        body: {
          type: 'object',
          required: ['apiKey'],
          properties: {
            apiKey: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              user: { type: ['object', 'null'] },
            },
          },
          401: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
    mkwwStudioController.verifyApiKey
  );

  // Protected routes (require authentication)
  fastify.register(
    async (fastify) => {
      // Add JWT verification to all routes in this plugin
      fastify.addHook('onRequest', verifyJWT);

      // Get MKWW Studio settings
      fastify.get(
        '/mkww/settings',
        {
          schema: {
            response: {
              200: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      enabled: { type: 'boolean' },
                      baseUrl: { type: 'string' },
                      lastSync: { type: ['string', 'null'] },
                    },
                  },
                },
              },
              500: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
        mkwwStudioController.getSettings
      );

      // Sync users with MKWW Studio
      fastify.post(
        '/mkww/sync/users',
        {
          schema: {
            body: {
              type: 'object',
              required: ['users', 'apiKey'],
              properties: {
                users: {
                  type: 'array',
                  items: {
                    type: 'object',
                  },
                },
                apiKey: { type: 'string' },
              },
            },
            response: {
              200: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { type: 'object' },
                },
              },
              400: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
              500: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
        mkwwStudioController.syncUsers
      );

      // Sync analytics with MKWW Studio
      fastify.post(
        '/mkww/sync/analytics',
        {
          schema: {
            body: {
              type: 'object',
              required: ['analyticsData', 'apiKey'],
              properties: {
                analyticsData: {
                  type: 'object',
                },
                apiKey: { type: 'string' },
              },
            },
            response: {
              200: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: { type: 'object' },
                },
              },
              400: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                },
              },
              500: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  error: { type: 'string' },
                },
              },
            },
          },
        },
        mkwwStudioController.syncAnalytics
      );
    },
    { prefix: '/api' } // All routes in this plugin will be prefixed with /api
  );
}
