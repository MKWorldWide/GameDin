/**
 * AWS Environment Configuration for GameDin
 *
 * This module provides comprehensive AWS environment configuration including
 * feature flags, service configurations, and environment-specific settings
 * for optimal AWS deployment and performance.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// AWS service configuration
export interface AWSServiceConfig {
  region: string;
  cloudFront: {
    domain: string;
    enabled: boolean;
    optimization: 'ultra' | 'high' | 'balanced' | 'minimal';
  };
  s3: {
    bucket: string;
    enabled: boolean;
    lifecyclePolicy: boolean;
  };
  lambda: {
    edgeEnabled: boolean;
    functions: Record<string, string>;
  };
  monitoring: {
    cloudWatch: boolean;
    xRay: boolean;
    customMetrics: boolean;
    errorReporting: boolean;
  };
  costOptimization: {
    enabled: boolean;
    compression: 'aggressive' | 'balanced' | 'minimal';
    caching: 'optimal' | 'balanced' | 'minimal';
  };
}

// Feature flags configuration
export interface FeatureFlags {
  // Performance features
  performanceMonitoring: boolean;
  realTimeAnalytics: boolean;
  advancedCaching: boolean;

  // AWS-specific features
  cloudFrontOptimization: boolean;
  lambdaEdgeFunctions: boolean;
  s3LifecycleManagement: boolean;

  // User experience features
  offlineSupport: boolean;
  pushNotifications: boolean;
  advancedSearch: boolean;

  // Development features
  debugMode: boolean;
  performanceProfiling: boolean;
  errorReporting: boolean;
}

// Environment configuration
export interface EnvironmentConfig {
  environment: Environment;
  version: string;
  buildTime: string;
  optimizationLevel: string;
  awsServices: AWSServiceConfig;
  featureFlags: FeatureFlags;
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    errorReporting: boolean;
  };
}

/**
 * Get current environment
 */
export function getEnvironment(): Environment {
  return (process.env.VITE_APP_ENV as Environment) || 'development';
}

/**
 * Get AWS region
 */
export function getAWSRegion(): string {
  return process.env.VITE_AWS_REGION || 'us-east-1';
}

/**
 * Get CloudFront domain
 */
export function getCloudFrontDomain(): string {
  return process.env.VITE_CLOUDFRONT_DOMAIN || '';
}

/**
 * Get S3 bucket name
 */
export function getS3Bucket(): string {
  return process.env.VITE_S3_BUCKET || '';
}

/**
 * Check if Lambda@Edge is enabled
 */
export function isLambdaEdgeEnabled(): boolean {
  return process.env.VITE_LAMBDA_EDGE_ENABLED === 'true';
}

/**
 * Check if monitoring is enabled
 */
export function isMonitoringEnabled(): boolean {
  return process.env.VITE_MONITORING_ENABLED === 'true';
}

/**
 * Check if cost optimization is enabled
 */
export function isCostOptimizationEnabled(): boolean {
  return process.env.VITE_COST_OPTIMIZATION === 'true';
}

/**
 * Get AWS service configuration based on environment
 */
export function getAWSServiceConfig(): AWSServiceConfig {
  const environment = getEnvironment();
  const region = getAWSRegion();

  const baseConfig: AWSServiceConfig = {
    region,
    cloudFront: {
      domain: getCloudFrontDomain(),
      enabled: !!getCloudFrontDomain(),
      optimization: environment === 'production' ? 'ultra'
        : environment === 'staging' ? 'high' : 'balanced',
    },
    s3: {
      bucket: getS3Bucket(),
      enabled: !!getS3Bucket(),
      lifecyclePolicy: environment === 'production',
    },
    lambda: {
      edgeEnabled: isLambdaEdgeEnabled(),
      functions: {
        edgeOptimization: environment === 'production' ? 'gamedin-edge-production'
          : environment === 'staging' ? 'gamedin-edge-staging' : 'gamedin-edge-development',
      },
    },
    monitoring: {
      cloudWatch: isMonitoringEnabled(),
      xRay: isMonitoringEnabled(),
      customMetrics: environment === 'production',
      errorReporting: environment === 'production',
    },
    costOptimization: {
      enabled: isCostOptimizationEnabled(),
      compression: environment === 'production' ? 'aggressive' : 'balanced',
      caching: environment === 'production' ? 'optimal' : 'balanced',
    },
  };

  return baseConfig;
}

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const environment = getEnvironment();
  const awsConfig = getAWSServiceConfig();

  return {
    // Performance features
    performanceMonitoring: awsConfig.monitoring.cloudWatch,
    realTimeAnalytics: environment === 'production',
    advancedCaching: awsConfig.cloudFront.enabled,

    // AWS-specific features
    cloudFrontOptimization: awsConfig.cloudFront.enabled,
    lambdaEdgeFunctions: awsConfig.lambda.edgeEnabled,
    s3LifecycleManagement: awsConfig.s3.lifecyclePolicy,

    // User experience features
    offlineSupport: environment !== 'development',
    pushNotifications: environment === 'production',
    advancedSearch: environment !== 'development',

    // Development features
    debugMode: environment === 'development',
    performanceProfiling: environment === 'development',
    errorReporting: awsConfig.monitoring.errorReporting,
  };
}

/**
 * Get complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = getEnvironment();
  const awsServices = getAWSServiceConfig();
  const featureFlags = getFeatureFlags();

  return {
    environment,
    version: process.env.VITE_APP_VERSION || '4.1.0',
    buildTime: process.env.VITE_APP_BUILD_TIME || new Date().toISOString(),
    optimizationLevel: process.env.VITE_OPTIMIZATION_LEVEL || 'balanced',
    awsServices,
    featureFlags,
    api: {
      baseUrl: process.env.VITE_API_URL || 'http://localhost:3001',
      timeout: environment === 'production' ? 10000 : 30000,
      retries: environment === 'production' ? 3 : 1,
    },
    monitoring: {
      enabled: awsServices.monitoring.cloudWatch,
      sampleRate: environment === 'production' ? 0.1 : 1.0,
      errorReporting: awsServices.monitoring.errorReporting,
    },
  };
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const featureFlags = getFeatureFlags();
  return featureFlags[feature];
}

/**
 * Get AWS service status
 */
export function getAWSServiceStatus() {
  const config = getAWSServiceConfig();

  return {
    cloudFront: {
      enabled: config.cloudFront.enabled,
      domain: config.cloudFront.domain,
      optimization: config.cloudFront.optimization,
    },
    s3: {
      enabled: config.s3.enabled,
      bucket: config.s3.bucket,
      lifecyclePolicy: config.s3.lifecyclePolicy,
    },
    lambda: {
      edgeEnabled: config.lambda.edgeEnabled,
      functions: config.lambda.functions,
    },
    monitoring: {
      cloudWatch: config.monitoring.cloudWatch,
      xRay: config.monitoring.xRay,
      customMetrics: config.monitoring.customMetrics,
    },
    costOptimization: {
      enabled: config.costOptimization.enabled,
      compression: config.costOptimization.compression,
      caching: config.costOptimization.caching,
    },
  };
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(): { valid: boolean; errors: string[] } {
  const config = getEnvironmentConfig();
  const errors: string[] = [];

  // Validate required environment variables
  if (!process.env.VITE_APP_ENV) {
    errors.push('VITE_APP_ENV is not set');
  }

  if (!process.env.VITE_AWS_REGION) {
    errors.push('VITE_AWS_REGION is not set');
  }

  // Validate AWS service configuration
  if (config.environment === 'production') {
    if (!config.awsServices.cloudFront.domain) {
      errors.push('CloudFront domain is required for production');
    }

    if (!config.awsServices.s3.bucket) {
      errors.push('S3 bucket is required for production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get environment-specific API endpoints
 */
export function getAPIEndpoints() {
  const environment = getEnvironment();
  const baseUrl = process.env.VITE_API_URL || 'http://localhost:3001';

  return {
    base: baseUrl,
    auth: `${baseUrl}/auth`,
    api: `${baseUrl}/api`,
    ws: process.env.VITE_WS_URL || baseUrl.replace('http', 'ws'),
    cdn: getCloudFrontDomain() ? `https://${getCloudFrontDomain()}` : baseUrl,
  };
}

/**
 * Get monitoring configuration
 */
export function getMonitoringConfig() {
  const config = getEnvironmentConfig();

  return {
    enabled: config.monitoring.enabled,
    sampleRate: config.monitoring.sampleRate,
    errorReporting: config.monitoring.errorReporting,
    cloudWatch: config.awsServices.monitoring.cloudWatch,
    xRay: config.awsServices.monitoring.xRay,
    customMetrics: config.awsServices.monitoring.customMetrics,
  };
}

// Export default configuration
export const awsEnvironmentConfig = getEnvironmentConfig();

// Export utility functions
export const awsEnv = {
  getEnvironment,
  getAWSRegion,
  getCloudFrontDomain,
  getS3Bucket,
  isLambdaEdgeEnabled,
  isMonitoringEnabled,
  isCostOptimizationEnabled,
  getAWSServiceConfig,
  getFeatureFlags,
  getEnvironmentConfig,
  isFeatureEnabled,
  getAWSServiceStatus,
  validateEnvironmentConfig,
  getAPIEndpoints,
  getMonitoringConfig,
};

export default awsEnvironmentConfig;
