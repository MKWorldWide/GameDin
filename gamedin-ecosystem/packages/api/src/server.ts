import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import { appConfig } from './config/app.config';
import { authConfig } from '@gamedin/auth';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import segmentRoutes from './routes/segments';

export async function createServer(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    ...opts,
    logger: {
      level: appConfig.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
    disableRequestLogging: appConfig.NODE_ENV === 'production',
  });

  // Register plugins
  await app.register(fastifySensible);
  await app.register(fastifyHelmet);
  await app.register(fastifyCors, {
    origin: appConfig.CORS_ORIGIN,
    credentials: true,
  });

  // Rate limiting
  await app.register(fastifyRateLimit, {
    max: appConfig.RATE_LIMIT,
    timeWindow: '1 minute',
  });

  // JWT Authentication
  await app.register(fastifyJwt, {
    secret: authConfig.JWT_SECRET,
    cookie: {
      cookieName: 'accessToken',
      signed: false,
    },
  });

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await app.register(
    async (api) => {
      // Auth routes (public)
      await api.register(authRoutes, { prefix: '/auth' });
      
      // Protected routes (require authentication)
      await api.register(
        async (protectedRoutes) => {
          // Add JWT verification hook for all protected routes
          protectedRoutes.addHook('onRequest', async (request, reply) => {
            try {
              await request.jwtVerify();
            } catch (err) {
              reply.unauthorized('Invalid or missing token');
            }
          });

          // User routes
          await protectedRoutes.register(userRoutes, { prefix: '/users' });
          
          // Segment routes
          await protectedRoutes.register(segmentRoutes, { prefix: '/segments' });
          
          // Add more protected routes here
        },
        { prefix: '/v1' }
      );
    },
    { prefix: appConfig.API_PREFIX }
  );

  // Set not found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({ error: 'Not Found', message: 'Route not found' });
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    reply.status(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'Something went wrong',
    });
  });

  return app;
}
