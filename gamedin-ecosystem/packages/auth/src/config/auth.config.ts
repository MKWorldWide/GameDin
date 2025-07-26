import { z } from 'zod';

const AuthConfigSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  PASSWORD_RESET_EXPIRES_IN: z.string().default('1h'),
  SALT_ROUNDS: z.number().default(10),
  COOKIE_SECRET: z.string().min(32),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.boolean().default(process.env.NODE_ENV === 'production'),
  COOKIE_HTTP_ONLY: z.boolean().default(true),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
});

type AuthConfig = z.infer<typeof AuthConfigSchema>;

export const authConfig: AuthConfig = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-here',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  PASSWORD_RESET_EXPIRES_IN: process.env.PASSWORD_RESET_EXPIRES_IN || '1h',
  SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS || '10', 10),
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'your-cookie-secret-here',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'lax',
};

// Validate the config on startup
AuthConfigSchema.parse(authConfig);
