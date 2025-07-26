/**
 * Authentication configuration
 * Loads environment variables and provides type-safe access to them
 */

// Default values for development
const defaultConfig = {
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // Password reset token expiration (in minutes)
  PASSWORD_RESET_EXPIRES_IN: '15m',
  
  // Email verification token expiration (in hours)
  EMAIL_VERIFICATION_EXPIRES_IN: '24h',
  
  // Bcrypt salt rounds for password hashing
  SALT_ROUNDS: 10,
  
  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Redis configuration
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // API configuration
  API_PREFIX: '/api',
  PORT: process.env.PORT || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Email configuration (for production)
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@gamedin.gg',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'sendgrid',
  
  // Frontend URLs
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  EMAIL_VERIFICATION_URL: process.env.EMAIL_VERIFICATION_URL || 
    'http://localhost:3000/verify-email',
  PASSWORD_RESET_URL: process.env.PASSWORD_RESET_URL || 
    'http://localhost:3000/reset-password',
} as const;

// Type for the configuration object
type AuthConfig = typeof defaultConfig;

// Export the configuration object
export const authConfig: AuthConfig = defaultConfig;

// Export types for better type safety
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // JWT
      JWT_SECRET: string;
      JWT_EXPIRES_IN: string;
      REFRESH_TOKEN_SECRET: string;
      REFRESH_TOKEN_EXPIRES_IN: string;
      
      // Server
      NODE_ENV: 'development' | 'production' | 'test';
      PORT: string;
      
      // Database
      REDIS_URL: string;
      
      // Email
      EMAIL_ENABLED: string;
      EMAIL_FROM: string;
      EMAIL_SERVICE: string;
      
      // URLs
      APP_URL: string;
      EMAIL_VERIFICATION_URL: string;
      PASSWORD_RESET_URL: string;
      
      // Add other environment variables as needed
      [key: string]: string | undefined;
    }
  }
}

// Validate required environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredVars = [
    'JWT_SECRET',
    'REFRESH_TOKEN_SECRET',
    'REDIS_URL',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}
