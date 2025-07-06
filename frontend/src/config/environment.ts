/**
 * Environment Configuration
 * 
 * This module manages environment-specific configuration for the GameDin application.
 * It provides type-safe access to environment variables and configuration settings
 * across different deployment environments (development, staging, production).
 * 
 * Feature Context:
 * - Centralized environment management
 * - Type-safe configuration access
 * - Environment-specific feature flags
 * - API endpoint management
 * - Security configuration
 * 
 * Usage Example:
 *   import { config } from './config/environment';
 *   const apiUrl = config.api.baseUrl;
 *   const isFeatureEnabled = config.features.chat;
 * 
 * Dependency Listing:
 * - AWS Amplify configuration
 * - Environment variables
 * - Feature flags
 * - API endpoints
 * 
 * Performance Considerations:
 * - Environment config is loaded once at startup
 * - No runtime configuration changes
 * - Optimized for tree-shaking
 * 
 * Security Implications:
 * - Sensitive values are managed through environment variables
 * - No hardcoded secrets in configuration
 * - Environment-specific security settings
 * 
 * Changelog:
 * - [v4.0.6] Created comprehensive environment configuration with TypeScript types and validation
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production';

/**
 * Feature flags interface
 */
interface FeatureFlags {
  chat: boolean;
  notifications: boolean;
  offlineMode: boolean;
  analytics: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  debugMode: boolean;
}

/**
 * API configuration interface
 */
interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  cacheTimeout: number;
}

/**
 * AWS configuration interface
 */
interface AwsConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  apiGatewayUrl: string;
}

/**
 * Security configuration interface
 */
interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableContentTypeSniffing: boolean;
  enableFrameOptions: boolean;
}

/**
 * Performance configuration interface
 */
interface PerformanceConfig {
  enableServiceWorker: boolean;
  enablePWA: boolean;
  enableCompression: boolean;
  enableCaching: boolean;
  cacheMaxAge: number;
}

/**
 * Application configuration interface
 */
interface AppConfig {
  name: string;
  version: string;
  environment: Environment;
  debug: boolean;
  features: FeatureFlags;
  api: ApiConfig;
  aws: AwsConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

/**
 * Get current environment
 */
const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return 'production';
    case 'staging':
      return 'staging';
    default:
      return 'development';
  }
};

/**
 * Get feature flags based on environment
 */
const getFeatureFlags = (environment: Environment): FeatureFlags => {
  const baseFlags = {
    chat: true,
    notifications: true,
    offlineMode: true,
    analytics: true,
    performanceMonitoring: true,
    errorTracking: true,
    debugMode: false,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseFlags,
        debugMode: false,
        analytics: true,
        performanceMonitoring: true,
        errorTracking: true,
      };
    case 'staging':
      return {
        ...baseFlags,
        debugMode: true,
        analytics: false,
        performanceMonitoring: true,
        errorTracking: true,
      };
    default: // development
      return {
        ...baseFlags,
        debugMode: true,
        analytics: false,
        performanceMonitoring: false,
        errorTracking: false,
      };
  }
};

/**
 * Get API configuration based on environment
 */
const getApiConfig = (environment: Environment): ApiConfig => {
  switch (environment) {
    case 'production':
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'https://api.gamedin.com',
        timeout: 30000,
        retryAttempts: 3,
        cacheTimeout: 300000, // 5 minutes
      };
    case 'staging':
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'https://staging-api.gamedin.com',
        timeout: 30000,
        retryAttempts: 3,
        cacheTimeout: 60000, // 1 minute
      };
    default: // development
      return {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
        timeout: 10000,
        retryAttempts: 1,
        cacheTimeout: 0, // No caching in development
      };
  }
};

/**
 * Get AWS configuration based on environment
 */
const getAwsConfig = (environment: Environment): AwsConfig => {
  switch (environment) {
    case 'production':
      return {
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
        userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '',
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
        apiGatewayUrl: process.env.REACT_APP_API_GATEWAY_URL || '',
      };
    case 'staging':
      return {
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
        userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '',
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
        apiGatewayUrl: process.env.REACT_APP_API_GATEWAY_URL || '',
      };
    default: // development
      return {
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
        userPoolId: process.env.REACT_APP_USER_POOL_ID || '',
        userPoolWebClientId: process.env.REACT_APP_USER_POOL_WEB_CLIENT_ID || '',
        identityPoolId: process.env.REACT_APP_IDENTITY_POOL_ID || '',
        apiGatewayUrl: process.env.REACT_APP_API_GATEWAY_URL || '',
      };
  }
};

/**
 * Get security configuration based on environment
 */
const getSecurityConfig = (environment: Environment): SecurityConfig => {
  const baseSecurity = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableContentTypeSniffing: false,
    enableFrameOptions: true,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseSecurity,
        enableCSP: true,
        enableHSTS: true,
      };
    case 'staging':
      return {
        ...baseSecurity,
        enableCSP: true,
        enableHSTS: false, // Disable HSTS in staging for testing
      };
    default: // development
      return {
        ...baseSecurity,
        enableCSP: false, // Disable CSP in development for easier debugging
        enableHSTS: false,
      };
  }
};

/**
 * Get performance configuration based on environment
 */
const getPerformanceConfig = (environment: Environment): PerformanceConfig => {
  const basePerformance = {
    enableServiceWorker: true,
    enablePWA: true,
    enableCompression: true,
    enableCaching: true,
    cacheMaxAge: 86400, // 24 hours
  };

  switch (environment) {
    case 'production':
      return {
        ...basePerformance,
        enableServiceWorker: true,
        enablePWA: true,
        enableCompression: true,
        enableCaching: true,
        cacheMaxAge: 86400, // 24 hours
      };
    case 'staging':
      return {
        ...basePerformance,
        enableServiceWorker: true,
        enablePWA: true,
        enableCompression: true,
        enableCaching: true,
        cacheMaxAge: 3600, // 1 hour for faster updates
      };
    default: // development
      return {
        ...basePerformance,
        enableServiceWorker: false, // Disable in development for easier debugging
        enablePWA: false,
        enableCompression: false,
        enableCaching: false,
        cacheMaxAge: 0,
      };
  }
};

/**
 * Application configuration
 */
export const config: AppConfig = {
  name: 'GameDin',
  version: process.env.REACT_APP_VERSION || '4.0.6',
  environment: getEnvironment(),
  debug: getEnvironment() !== 'production',
  features: getFeatureFlags(getEnvironment()),
  api: getApiConfig(getEnvironment()),
  aws: getAwsConfig(getEnvironment()),
  security: getSecurityConfig(getEnvironment()),
  performance: getPerformanceConfig(getEnvironment()),
};

/**
 * Validate configuration
 */
export const validateConfig = (): void => {
  const requiredEnvVars = [
    'REACT_APP_USER_POOL_ID',
    'REACT_APP_USER_POOL_WEB_CLIENT_ID',
    'REACT_APP_IDENTITY_POOL_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `⚠️ Missing environment variables: ${missingVars.join(', ')}`
    );
  }

  if (config.debug) {
    console.log('🔧 Environment Configuration:', {
      environment: config.environment,
      version: config.version,
      features: config.features,
      api: {
        baseUrl: config.api.baseUrl,
        timeout: config.api.timeout,
      },
      aws: {
        region: config.aws.region,
        userPoolId: config.aws.userPoolId ? '***' : 'NOT_SET',
      },
    });
  }
};

/**
 * Export configuration as default
 */
export default config; 