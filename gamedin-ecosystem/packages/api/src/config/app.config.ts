import { env } from './env';

// Export the environment variables as app config
export const appConfig = {
  NODE_ENV: env.NODE_ENV,
  PORT: parseInt(env.PORT, 10),
  HOST: env.HOST,
  API_PREFIX: env.API_PREFIX,
  CORS_ORIGIN: env.CORS_ORIGIN,
  LOG_LEVEL: env.LOG_LEVEL,
  
  // MKWW Studio Integration
  MKWW_STUDIO_URL: env.MKWW_STUDIO_URL || 'https://mkww.studio',
  MKWW_STUDIO_ENABLED: env.MKWW_STUDIO_ENABLED || 'false',
  MKWW_STUDIO_API_PREFIX: env.MKWW_STUDIO_API_PREFIX || '/api/v1',
  
  // Constants
  RATE_LIMIT: 100, // requests per window
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  // API Settings
  API_TIMEOUT: 30000, // 30 seconds
  
  // Security
  JWT_SECRET: env.JWT_SECRET || 'your-jwt-secret-key-here',
  JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '7d',
  
  // Caching
  CACHE_TTL: 3600, // 1 hour in seconds
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
};
