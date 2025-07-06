/**
 * Self-Selecting Optimization Engine for GameDin
 * 
 * This engine dynamically adjusts application performance settings based on:
 * - Device capabilities (CPU, memory, GPU)
 * - Network conditions (bandwidth, latency)
 * - Operating system and browser
 * - User preferences and accessibility needs
 * - AWS Amplify deployment environment
 * 
 * @author GameDin Development Team
 * @version 4.0.0
 * @since 2024-07-06
 */

export interface DeviceCapabilities {
  cpuCores: number;
  memoryGB: number;
  gpuAvailable: boolean;
  gpuMemory?: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  touchSupport: boolean;
  batteryLevel?: number;
  isLowPowerMode?: boolean;
}

export interface NetworkConditions {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number; // Mbps
  rtt: number; // Round trip time in ms
  saveData: boolean;
  connectionType: string;
}

export interface OptimizationProfile {
  name: string;
  description: string;
  settings: {
    imageQuality: 'low' | 'medium' | 'high' | 'ultra';
    animationLevel: 'none' | 'reduced' | 'normal' | 'enhanced';
    cacheStrategy: 'aggressive' | 'balanced' | 'minimal';
    preloadLevel: 'none' | 'critical' | 'important' | 'all';
    compressionLevel: 'none' | 'basic' | 'advanced';
    backgroundSync: boolean;
    offlineMode: boolean;
    realTimeUpdates: boolean;
    analyticsLevel: 'minimal' | 'standard' | 'detailed';
  };
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    retryAttempts: number;
    batchSize: number;
  };
}

export interface EnvironmentContext {
  isProduction: boolean;
  isDevelopment: boolean;
  isStaging: boolean;
  awsRegion: string;
  amplifyVersion: string;
  deploymentStage: string;
}

/**
 * Detects device capabilities using browser APIs
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  const navigator = window.navigator as any;
  
  return {
    cpuCores: navigator.hardwareConcurrency || 4,
    memoryGB: (navigator.deviceMemory || 4) * 1024, // Convert to MB
    gpuAvailable: !!navigator.gpu || !!window.WebGLRenderingContext,
    gpuMemory: navigator.gpu?.adapter?.info?.memorySize,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(navigator.userAgent),
    isDesktop: !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)),
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    batteryLevel: navigator.getBattery?.()?.then((battery: any) => battery.level),
    isLowPowerMode: navigator.getBattery?.()?.then((battery: any) => battery.level < 0.2)
  };
}

/**
 * Detects network conditions using Network Information API
 */
export function detectNetworkConditions(): NetworkConditions {
  const navigator = window.navigator as any;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  return {
    effectiveType: connection?.effectiveType || '4g',
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 50,
    saveData: connection?.saveData || false,
    connectionType: connection?.type || 'unknown'
  };
}

/**
 * Detects environment context from AWS Amplify deployment
 */
export function detectEnvironmentContext(): EnvironmentContext {
  return {
    isProduction: import.meta.env.VITE_APP_ENV === 'production',
    isDevelopment: import.meta.env.VITE_APP_ENV === 'development',
    isStaging: import.meta.env.VITE_APP_ENV === 'staging',
    awsRegion: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    amplifyVersion: import.meta.env.VITE_AMPLIFY_VERSION || 'gen2',
    deploymentStage: import.meta.env.VITE_DEPLOYMENT_STAGE || 'development'
  };
}

/**
 * Self-selecting optimization algorithm that chooses the best profile
 * based on current conditions
 */
export function selectOptimizationProfile(): OptimizationProfile {
  const device = detectDeviceCapabilities();
  const network = detectNetworkConditions();
  const environment = detectEnvironmentContext();
  
  // Calculate performance score (0-100)
  const deviceScore = calculateDeviceScore(device);
  const networkScore = calculateNetworkScore(network);
  const environmentScore = calculateEnvironmentScore(environment);
  
  const totalScore = (deviceScore + networkScore + environmentScore) / 3;
  
  // Select profile based on total score
  if (totalScore >= 80) {
    return getUltraPerformanceProfile();
  } else if (totalScore >= 60) {
    return getHighPerformanceProfile();
  } else if (totalScore >= 40) {
    return getBalancedProfile();
  } else if (totalScore >= 20) {
    return getLowPerformanceProfile();
  } else {
    return getMinimalProfile();
  }
}

/**
 * Calculate device performance score
 */
function calculateDeviceScore(device: DeviceCapabilities): number {
  let score = 0;
  
  // CPU scoring
  score += Math.min(device.cpuCores * 10, 40);
  
  // Memory scoring
  score += Math.min(device.memoryGB / 1024 * 20, 30);
  
  // GPU scoring
  if (device.gpuAvailable) score += 10;
  
  // Device type scoring
  if (device.isDesktop) score += 10;
  else if (device.isTablet) score += 5;
  else if (device.isMobile) score += 0;
  
  // Touch support (negative for mobile optimization)
  if (device.touchSupport && device.isMobile) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate network performance score
 */
function calculateNetworkScore(network: NetworkConditions): number {
  let score = 0;
  
  // Connection type scoring
  switch (network.effectiveType) {
    case '4g': score += 40; break;
    case '3g': score += 25; break;
    case '2g': score += 10; break;
    case 'slow-2g': score += 5; break;
  }
  
  // Downlink scoring
  score += Math.min(network.downlink * 2, 30);
  
  // RTT scoring (lower is better)
  score += Math.max(0, 20 - network.rtt / 5);
  
  // Save data mode (negative impact)
  if (network.saveData) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate environment performance score
 */
function calculateEnvironmentScore(environment: EnvironmentContext): number {
  let score = 50; // Base score
  
  // Production environment gets boost
  if (environment.isProduction) score += 20;
  else if (environment.isStaging) score += 10;
  else if (environment.isDevelopment) score += 0;
  
  // AWS region optimization
  const optimalRegions = ['us-east-1', 'us-west-2', 'eu-west-1'];
  if (optimalRegions.includes(environment.awsRegion)) score += 10;
  
  // Amplify Gen2 gets boost
  if (environment.amplifyVersion === 'gen2') score += 10;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Optimization profiles for different performance levels
 */
function getUltraPerformanceProfile(): OptimizationProfile {
  return {
    name: 'Ultra Performance',
    description: 'Maximum performance for high-end devices and fast networks',
    settings: {
      imageQuality: 'ultra',
      animationLevel: 'enhanced',
      cacheStrategy: 'aggressive',
      preloadLevel: 'all',
      compressionLevel: 'advanced',
      backgroundSync: true,
      offlineMode: true,
      realTimeUpdates: true,
      analyticsLevel: 'detailed'
    },
    performance: {
      maxConcurrentRequests: 10,
      requestTimeout: 30000,
      retryAttempts: 3,
      batchSize: 50
    }
  };
}

function getHighPerformanceProfile(): OptimizationProfile {
  return {
    name: 'High Performance',
    description: 'Optimized for good devices and networks',
    settings: {
      imageQuality: 'high',
      animationLevel: 'normal',
      cacheStrategy: 'balanced',
      preloadLevel: 'important',
      compressionLevel: 'advanced',
      backgroundSync: true,
      offlineMode: true,
      realTimeUpdates: true,
      analyticsLevel: 'standard'
    },
    performance: {
      maxConcurrentRequests: 8,
      requestTimeout: 25000,
      retryAttempts: 3,
      batchSize: 30
    }
  };
}

function getBalancedProfile(): OptimizationProfile {
  return {
    name: 'Balanced',
    description: 'Balanced performance for average devices and networks',
    settings: {
      imageQuality: 'medium',
      animationLevel: 'normal',
      cacheStrategy: 'balanced',
      preloadLevel: 'critical',
      compressionLevel: 'basic',
      backgroundSync: false,
      offlineMode: true,
      realTimeUpdates: false,
      analyticsLevel: 'standard'
    },
    performance: {
      maxConcurrentRequests: 5,
      requestTimeout: 20000,
      retryAttempts: 2,
      batchSize: 20
    }
  };
}

function getLowPerformanceProfile(): OptimizationProfile {
  return {
    name: 'Low Performance',
    description: 'Optimized for low-end devices and slow networks',
    settings: {
      imageQuality: 'low',
      animationLevel: 'reduced',
      cacheStrategy: 'minimal',
      preloadLevel: 'none',
      compressionLevel: 'basic',
      backgroundSync: false,
      offlineMode: false,
      realTimeUpdates: false,
      analyticsLevel: 'minimal'
    },
    performance: {
      maxConcurrentRequests: 3,
      requestTimeout: 15000,
      retryAttempts: 1,
      batchSize: 10
    }
  };
}

function getMinimalProfile(): OptimizationProfile {
  return {
    name: 'Minimal',
    description: 'Minimal performance for very limited devices and networks',
    settings: {
      imageQuality: 'low',
      animationLevel: 'none',
      cacheStrategy: 'minimal',
      preloadLevel: 'none',
      compressionLevel: 'none',
      backgroundSync: false,
      offlineMode: false,
      realTimeUpdates: false,
      analyticsLevel: 'minimal'
    },
    performance: {
      maxConcurrentRequests: 1,
      requestTimeout: 10000,
      retryAttempts: 0,
      batchSize: 5
    }
  };
}

/**
 * Apply optimization profile to the application
 */
export function applyOptimizationProfile(profile: OptimizationProfile): void {
  // Store profile in localStorage for persistence
  localStorage.setItem('gamedin-optimization-profile', JSON.stringify(profile));
  
  // Apply settings to global configuration
  window.__GAMEDIN_OPTIMIZATION__ = profile;
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('optimizationProfileChanged', {
    detail: { profile }
  }));
  
  // Log optimization selection
  console.log(`🎯 Applied optimization profile: ${profile.name}`, profile);
}

/**
 * Get current optimization profile
 */
export function getCurrentOptimizationProfile(): OptimizationProfile {
  const stored = localStorage.getItem('gamedin-optimization-profile');
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Fallback to balanced profile
  return getBalancedProfile();
}

/**
 * Initialize optimization engine
 */
export function initializeOptimizationEngine(): OptimizationProfile {
  const profile = selectOptimizationProfile();
  applyOptimizationProfile(profile);
  
  // Set up network change listener
  if ('connection' in navigator) {
    navigator.addEventListener('change', () => {
      const newProfile = selectOptimizationProfile();
      applyOptimizationProfile(newProfile);
    });
  }
  
  return profile;
}

// Type declaration for global optimization object
declare global {
  interface Window {
    __GAMEDIN_OPTIMIZATION__: OptimizationProfile;
  }
}

export default {
  detectDeviceCapabilities,
  detectNetworkConditions,
  detectEnvironmentContext,
  selectOptimizationProfile,
  applyOptimizationProfile,
  getCurrentOptimizationProfile,
  initializeOptimizationEngine
}; 