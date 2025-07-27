import fastify, { type FastifyInstance, type FastifyServerOptions, type FastifyRequest, type FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import { appConfig } from './config/app.config';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import segmentRoutes from './routes/segments';
import mkwwStudioRoutes from './routes/mkwwStudio.routes';

// Define authConfig locally since we're having issues with the import
const authConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
};

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
  // CORS Configuration
  const allowedOrigins = [
    'https://mkww.studio',
    'https://www.mkww.studio',
    'http://localhost:3000',
    'http://localhost:3001',
    ...(appConfig.CORS_ORIGIN && appConfig.CORS_ORIGIN !== '*' 
      ? [appConfig.CORS_ORIGIN]
      : [])
  ];

  // CORS Configuration
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, false);
      }
      
      // Check if origin is allowed
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      // Return error for disallowed origins
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400 // 24 hours
  };

  await app.register(fastifyCors, corsOptions);

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

  // API routes with versioning
  await app.register(
    async (api) => {
      // Public routes (no authentication required)
      await api.register(authRoutes, { prefix: '/auth' });
      await api.register(mkwwStudioRoutes);
      
      // Protected routes (require authentication)
      await api.register(
        async (protectedRoutes) => {
          // Add JWT verification hook for all protected routes
          protectedRoutes.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
            try {
              await request.jwtVerify();
            } catch (err: any) {
              reply.code(401).send({ 
                error: 'Unauthorized',
                message: err.message || 'Invalid or missing token' 
              });
            }
          });

          // User routes
          await protectedRoutes.register(userRoutes, { prefix: '/users' });
          
          // Segment routes
          await protectedRoutes.register(segmentRoutes, { prefix: '/segments' });
          
          // Add more protected routes here
        },
        { 
          prefix: `/v1`
        }
      );
    },
    { 
      prefix: appConfig.API_PREFIX 
    }
  );

  // Health check endpoint
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Set not found handler
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({ error: 'Not Found', message: 'Route not found' });
  });

  // Global error handler
  app.setErrorHandler((error: any, request: FastifyRequest, reply: FastifyReply) => {
    request.log.error(error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    const statusCode = error.statusCode || 500;
    
    // Don't expose internal server errors in production
    const message = statusCode >= 500 && appConfig.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : error.message || 'Something went wrong';
    
    reply.status(statusCode).send({
      error: error.name || 'Internal Server Error',
      message,
      ...(appConfig.NODE_ENV !== 'production' && error.stack ? { stack: error.stack } : {}),
    });
  });

  return app;
}
