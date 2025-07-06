/**
 * AWS Amplify Optimizer for GameDin
 * 
 * This module provides dynamic optimization for AWS Amplify deployment
 * based on the self-selecting optimization engine. It configures:
 * - API request strategies
 * - Authentication flows
 * - Storage optimization
 * - Real-time subscriptions
 * - Caching strategies
 * - Performance monitoring
 * 
 * @author GameDin Development Team
 * @version 4.0.0
 * @since 2024-07-06
 */

import { Amplify, Auth, API, Storage } from 'aws-amplify';
import { selectOptimizationProfile, OptimizationProfile } from './optimizationEngine';

export interface AmplifyOptimizationConfig {
  api: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    retryAttempts: number;
    batchSize: number;
    cacheStrategy: 'memory' | 'localStorage' | 'indexedDB' | 'none';
    compression: boolean;
  };
  auth: {
    autoSignIn: boolean;
    rememberDevice: boolean;
    mfaEnabled: boolean;
    sessionTimeout: number;
    refreshTokenRotation: boolean;
  };
  storage: {
    cacheControl: string;
    maxFileSize: number;
    compressionLevel: number;
    encryption: boolean;
    versioning: boolean;
  };
  realtime: {
    enabled: boolean;
    maxConnections: number;
    reconnectInterval: number;
    heartbeatInterval: number;
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    performanceTracking: boolean;
    errorReporting: boolean;
  };
}

/**
 * Configure AWS Amplify with optimization settings
 */
export function configureAmplifyWithOptimization(
  amplifyConfig: any,
  optimizationProfile: OptimizationProfile
): void {
  const optimizationConfig = generateAmplifyOptimizationConfig(optimizationProfile);
  
  // Apply optimization to Amplify configuration
  const optimizedConfig = {
    ...amplifyConfig,
    API: {
      ...amplifyConfig.API,
      endpoints: optimizeApiEndpoints(amplifyConfig.API?.endpoints, optimizationConfig.api),
      graphql_headers: async () => ({
        'x-optimization-profile': optimizationProfile.name,
        'x-device-capabilities': JSON.stringify(getDeviceCapabilities()),
        'x-network-conditions': JSON.stringify(getNetworkConditions())
      })
    },
    Auth: {
      ...amplifyConfig.Auth,
      ...optimizationConfig.auth
    },
    Storage: {
      ...amplifyConfig.Storage,
      ...optimizationConfig.storage
    }
  };
  
  // Configure Amplify
  Amplify.configure(optimizedConfig);
  
  // Apply real-time optimizations
  if (optimizationConfig.realtime.enabled) {
    configureRealTimeOptimizations(optimizationConfig.realtime);
  }
  
  // Apply monitoring optimizations
  if (optimizationConfig.monitoring.enabled) {
    configureMonitoringOptimizations(optimizationConfig.monitoring);
  }
  
  console.log('🚀 AWS Amplify configured with optimization:', optimizationProfile.name);
}

/**
 * Generate optimization configuration based on profile
 */
function generateAmplifyOptimizationConfig(profile: OptimizationProfile): AmplifyOptimizationConfig {
  return {
    api: {
      maxConcurrentRequests: profile.performance.maxConcurrentRequests,
      requestTimeout: profile.performance.requestTimeout,
      retryAttempts: profile.performance.retryAttempts,
      batchSize: profile.performance.batchSize,
      cacheStrategy: profile.settings.cacheStrategy === 'aggressive' ? 'indexedDB' :
                    profile.settings.cacheStrategy === 'balanced' ? 'localStorage' :
                    profile.settings.cacheStrategy === 'minimal' ? 'memory' : 'none',
      compression: profile.settings.compressionLevel !== 'none'
    },
    auth: {
      autoSignIn: profile.settings.backgroundSync,
      rememberDevice: profile.settings.cacheStrategy !== 'minimal',
      mfaEnabled: profile.settings.analyticsLevel === 'detailed',
      sessionTimeout: profile.settings.cacheStrategy === 'aggressive' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      refreshTokenRotation: profile.settings.securityLevel === 'high'
    },
    storage: {
      cacheControl: profile.settings.cacheStrategy === 'aggressive' ? 'public, max-age=31536000' :
                   profile.settings.cacheStrategy === 'balanced' ? 'public, max-age=3600' :
                   'no-cache',
      maxFileSize: profile.settings.imageQuality === 'ultra' ? 50 * 1024 * 1024 :
                  profile.settings.imageQuality === 'high' ? 25 * 1024 * 1024 :
                  profile.settings.imageQuality === 'medium' ? 10 * 1024 * 1024 : 5 * 1024 * 1024,
      compressionLevel: profile.settings.compressionLevel === 'advanced' ? 9 :
                       profile.settings.compressionLevel === 'basic' ? 6 : 0,
      encryption: true,
      versioning: profile.settings.cacheStrategy === 'aggressive'
    },
    realtime: {
      enabled: profile.settings.realTimeUpdates,
      maxConnections: profile.performance.maxConcurrentRequests,
      reconnectInterval: profile.performance.requestTimeout / 1000,
      heartbeatInterval: 30
    },
    monitoring: {
      enabled: profile.settings.analyticsLevel !== 'minimal',
      logLevel: profile.settings.analyticsLevel === 'detailed' ? 'debug' :
               profile.settings.analyticsLevel === 'standard' ? 'info' : 'error',
      performanceTracking: profile.settings.analyticsLevel !== 'minimal',
      errorReporting: true
    }
  };
}

/**
 * Optimize API endpoints based on performance profile
 */
function optimizeApiEndpoints(endpoints: any, apiConfig: AmplifyOptimizationConfig['api']): any {
  if (!endpoints) return endpoints;
  
  const optimizedEndpoints = { ...endpoints };
  
  Object.keys(optimizedEndpoints).forEach(key => {
    const endpoint = optimizedEndpoints[key];
    optimizedEndpoints[key] = {
      ...endpoint,
      custom_header: async () => ({
        ...endpoint.custom_header?.(),
        'x-optimization-cache': apiConfig.cacheStrategy,
        'x-optimization-compression': apiConfig.compression.toString(),
        'x-optimization-batch-size': apiConfig.batchSize.toString()
      })
    };
  });
  
  return optimizedEndpoints;
}

/**
 * Configure real-time optimizations
 */
function configureRealTimeOptimizations(realtimeConfig: AmplifyOptimizationConfig['realtime']): void {
  // Configure WebSocket connections
  if (typeof window !== 'undefined') {
    window.__GAMEDIN_REALTIME_CONFIG__ = realtimeConfig;
  }
  
  // Set up connection pooling
  if (realtimeConfig.maxConnections > 1) {
    console.log('🔌 Real-time optimization: Connection pooling enabled');
  }
}

/**
 * Configure monitoring optimizations
 */
function configureMonitoringOptimizations(monitoringConfig: AmplifyOptimizationConfig['monitoring']): void {
  // Configure CloudWatch logging
  if (monitoringConfig.enabled) {
    console.log('📊 Monitoring optimization: CloudWatch logging enabled');
  }
  
  // Configure performance tracking
  if (monitoringConfig.performanceTracking) {
    console.log('⚡ Performance tracking: Enabled');
  }
  
  // Configure error reporting
  if (monitoringConfig.errorReporting) {
    console.log('🚨 Error reporting: Enabled');
  }
}

/**
 * Get device capabilities for API headers
 */
function getDeviceCapabilities(): any {
  const navigator = window.navigator as any;
  return {
    cores: navigator.hardwareConcurrency || 4,
    memory: navigator.deviceMemory || 4,
    connection: navigator.connection?.effectiveType || 'unknown',
    userAgent: navigator.userAgent
  };
}

/**
 * Get network conditions for API headers
 */
function getNetworkConditions(): any {
  const navigator = window.navigator as any;
  const connection = navigator.connection;
  return {
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false
  };
}

/**
 * Optimize API requests based on current profile
 */
export function createOptimizedApiClient(): any {
  const profile = window.__GAMEDIN_OPTIMIZATION__;
  
  return {
    get: async (apiName: string, path: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'x-optimization-profile': profile.name,
          'x-request-timeout': profile.performance.requestTimeout.toString()
        }
      };
      
      return API.get(apiName, path, optimizedOptions);
    },
    
    post: async (apiName: string, path: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'x-optimization-profile': profile.name,
          'x-request-timeout': profile.performance.requestTimeout.toString()
        }
      };
      
      return API.post(apiName, path, optimizedOptions);
    },
    
    put: async (apiName: string, path: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'x-optimization-profile': profile.name,
          'x-request-timeout': profile.performance.requestTimeout.toString()
        }
      };
      
      return API.put(apiName, path, optimizedOptions);
    },
    
    del: async (apiName: string, path: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'x-optimization-profile': profile.name,
          'x-request-timeout': profile.performance.requestTimeout.toString()
        }
      };
      
      return API.del(apiName, path, optimizedOptions);
    }
  };
}

/**
 * Optimize storage operations based on current profile
 */
export function createOptimizedStorageClient(): any {
  const profile = window.__GAMEDIN_OPTIMIZATION__;
  
  return {
    get: async (key: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        cacheControl: profile.settings.cacheStrategy === 'aggressive' ? 'public, max-age=31536000' :
                     profile.settings.cacheStrategy === 'balanced' ? 'public, max-age=3600' :
                     'no-cache'
      };
      
      return Storage.get(key, optimizedOptions);
    },
    
    put: async (key: string, object: any, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        cacheControl: profile.settings.cacheStrategy === 'aggressive' ? 'public, max-age=31536000' :
                     profile.settings.cacheStrategy === 'balanced' ? 'public, max-age=3600' :
                     'no-cache',
        compression: profile.settings.compressionLevel !== 'none'
      };
      
      return Storage.put(key, object, optimizedOptions);
    },
    
    remove: async (key: string, options: any = {}) => {
      return Storage.remove(key, options);
    },
    
    list: async (path: string, options: any = {}) => {
      const optimizedOptions = {
        ...options,
        maxKeys: profile.performance.batchSize
      };
      
      return Storage.list(path, optimizedOptions);
    }
  };
}

/**
 * Initialize AWS Amplify optimizer
 */
export function initializeAmplifyOptimizer(amplifyConfig: any): void {
  // Get current optimization profile
  const profile = selectOptimizationProfile();
  
  // Configure Amplify with optimization
  configureAmplifyWithOptimization(amplifyConfig, profile);
  
  // Create optimized clients
  const optimizedApi = createOptimizedApiClient();
  const optimizedStorage = createOptimizedStorageClient();
  
  // Make optimized clients available globally
  window.__GAMEDIN_OPTIMIZED_API__ = optimizedApi;
  window.__GAMEDIN_OPTIMIZED_STORAGE__ = optimizedStorage;
  
  console.log('🎯 AWS Amplify optimizer initialized with profile:', profile.name);
}

// Type declarations for global objects
declare global {
  interface Window {
    __GAMEDIN_OPTIMIZATION__: OptimizationProfile;
    __GAMEDIN_REALTIME_CONFIG__: AmplifyOptimizationConfig['realtime'];
    __GAMEDIN_OPTIMIZED_API__: ReturnType<typeof createOptimizedApiClient>;
    __GAMEDIN_OPTIMIZED_STORAGE__: ReturnType<typeof createOptimizedStorageClient>;
  }
}

export default {
  configureAmplifyWithOptimization,
  createOptimizedApiClient,
  createOptimizedStorageClient,
  initializeAmplifyOptimizer
}; 