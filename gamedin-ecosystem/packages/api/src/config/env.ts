import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('*'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Authentication
  JWT_SECRET: z.string().default('your-jwt-secret-key-here'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().default('your-refresh-token-secret-here'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  PASSWORD_RESET_EXPIRES_IN: z.string().default('1h'),
  SALT_ROUNDS: z.string().default('10'),
  COOKIE_SECRET: z.string().default('your-cookie-secret-here'),

  // Database
  DATABASE_URL: z.string().default('postgresql://user:password@localhost:5432/gamedin?schema=public'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Email (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // External Services (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // MKWW Studio Integration
  MKWW_STUDIO_URL: z.string().url().default('https://mkww.studio'),
  MKWW_STUDIO_ENABLED: z.string().default('false'),
  MKWW_STUDIO_API_PREFIX: z.string().default('/api/v1'),

  // Feature Flags
  ENABLE_LLM_MODERATION: z.string().default('false'),
  ENABLE_INVITE_FLOW: z.string().default('false'),
  ENABLE_REDIS_CLUSTER: z.string().default('false'),
});

// Parse environment variables
const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

// Export the validated environment variables
export const env = envVars.data;
