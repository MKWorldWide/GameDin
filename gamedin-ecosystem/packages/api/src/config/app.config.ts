import { env } from './env';

// Export the environment variables as app config
export const appConfig = {
  NODE_ENV: env.NODE_ENV,
  PORT: parseInt(env.PORT, 10),
  HOST: env.HOST,
  API_PREFIX: env.API_PREFIX,
  CORS_ORIGIN: env.CORS_ORIGIN,
  LOG_LEVEL: env.LOG_LEVEL,
  
  // Constants
  RATE_LIMIT: 100, // requests per window
  REQUEST_TIMEOUT: 30000, // 30 seconds
};
