/**
 * Development Configuration
 *
 * This file contains development-specific configuration settings for the GameDin application.
 * It enables mock mode, testing features, and development tools for local development.
 *
 * Feature Context:
 * - Enables mock database and API services for local development
 * - Provides testing utilities and debugging tools
 * - Configures development-specific features and settings
 * - Allows easy switching between mock and real data
 *
 * Usage Example:
 *   import { devConfig } from './config/development';
 *   if (devConfig.enableMockMode) { ... }
 *
 * Dependency Listing:
 * - MockService (frontend/src/services/mockService.ts)
 * - All development utilities and testing tools
 *
 * Performance Considerations:
 * - Mock mode may impact performance during development
 * - Development tools add overhead but improve debugging
 *
 * Security Implications:
 * - Development mode bypasses security for testing
 * - Mock data contains no sensitive information
 * - Only for local development use
 *
 * Changelog:
 * - [v3.2.2] Created development configuration with mock mode and testing utilities
 */

import { mockService } from '../services/mockService';

/**
 * Development Configuration Interface
 */
interface DevelopmentConfig {
  // Mock and Testing
  enableMockMode: boolean;
  enableTestMode: boolean;
  enablePerformanceMode: boolean;

  // Data Configuration
  mockDataSize: 'small' | 'medium' | 'large' | 'extreme';
  enableAutoDataGeneration: boolean;

  // Development Tools
  enableDebugMode: boolean;
  enableLogging: boolean;
  enableErrorTracking: boolean;

  // Testing Utilities
  enableTestRunner: boolean;
  enableTestDataExport: boolean;
  enableTestScenarioRunner: boolean;

  // Performance Testing
  enableLoadTesting: boolean;
  loadTestLevel: 'low' | 'medium' | 'high' | 'extreme';

  // Development Features
  enableHotReload: boolean;
  enableSourceMaps: boolean;
  enableDevTools: boolean;
}

/**
 * Development Configuration
 */
export const devConfig: DevelopmentConfig = {
  // Mock and Testing
  enableMockMode: true,
  enableTestMode: true,
  enablePerformanceMode: false,

  // Data Configuration
  mockDataSize: 'medium',
  enableAutoDataGeneration: true,

  // Development Tools
  enableDebugMode: true,
  enableLogging: true,
  enableErrorTracking: true,

  // Testing Utilities
  enableTestRunner: true,
  enableTestDataExport: true,
  enableTestScenarioRunner: true,

  // Performance Testing
  enableLoadTesting: false,
  loadTestLevel: 'medium',

  // Development Features
  enableHotReload: true,
  enableSourceMaps: true,
  enableDevTools: true,
};

/**
 * Initialize development environment
 */
export const initializeDevelopment = async(): Promise<void> => {
  if (devConfig.enableMockMode) {
    console.log('🚀 Initializing development environment with mock mode...');

    try {
      // Initialize mock service
      await mockService.initialize();

      // Configure mock service based on development settings
      mockService.updateConfig({
        enableMockMode: devConfig.enableMockMode,
        autoInitialize: devConfig.enableAutoDataGeneration,
        dataSize: devConfig.mockDataSize,
        enablePerformanceMode: devConfig.enablePerformanceMode,
        enableTestMode: devConfig.enableTestMode,
      });

      // Log initialization status
      const stats = mockService.getStats();
      const health = mockService.getHealthStatus();

      console.log('✅ Mock service initialized successfully');
      console.log('📊 Mock data statistics:', stats);
      console.log('🏥 Service health:', health);

      // Enable development tools if configured
      if (devConfig.enableDevTools) {
        enableDevelopmentTools();
      }

    } catch (error) {
      console.error('❌ Failed to initialize development environment:', error);
      throw error;
    }
  }
};

/**
 * Enable development tools
 */
const enableDevelopmentTools = (): void => {
  // Expose mock service to window for debugging
  if (typeof window !== 'undefined') {
    (window as any).mockService = mockService;
    (window as any).devConfig = devConfig;

    console.log('🔧 Development tools enabled');
    console.log('💡 Access mock service via window.mockService');
    console.log('💡 Access dev config via window.devConfig');
  }
};

/**
 * Get development utilities
 */
export const getDevelopmentUtils = () => {
  return {
    // Mock service utilities
    mockService,

    // Test utilities
    runTestCase: (testCaseId: string) => mockService.runTestCase(testCaseId),
    runTestScenario: (scenarioId: string) => mockService.runTestScenario(scenarioId),
    getTestCases: () => mockService.getTestCases(),
    getTestScenarios: () => mockService.getTestScenarios(),

    // Data utilities
    exportData: () => mockService.exportData(),
    resetData: () => mockService.reset(),
    generatePerformanceData: (level: 'low' | 'medium' | 'high' | 'extreme') =>
      mockService.generatePerformanceData(level),

    // Configuration utilities
    updateConfig: (newConfig: Partial<DevelopmentConfig>) => {
      Object.assign(devConfig, newConfig);
      mockService.updateConfig({
        enableMockMode: devConfig.enableMockMode,
        autoInitialize: devConfig.enableAutoDataGeneration,
        dataSize: devConfig.mockDataSize,
        enablePerformanceMode: devConfig.enablePerformanceMode,
        enableTestMode: devConfig.enableTestMode,
      });
    },

    // Health and status utilities
    getHealthStatus: () => mockService.getHealthStatus(),
    getStats: () => mockService.getStats(),

    // Development mode utilities
    isMockModeEnabled: () => devConfig.enableMockMode,
    isTestModeEnabled: () => devConfig.enableTestMode,
    isDebugModeEnabled: () => devConfig.enableDebugMode,
  };
};

/**
 * Check if development environment is active
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development' || import.meta.env.DEV;
};

/**
 * Check if mock mode is enabled
 */
export const isMockModeEnabled = (): boolean => {
  return isDevelopment() && import.meta.env.VITE_ENABLE_MOCK_MODE === 'true';
};

/**
 * Check if test mode is enabled
 */
export const isTestModeEnabled = (): boolean => {
  return isDevelopment() && devConfig.enableTestMode;
};

/**
 * Check if debug mode is enabled
 */
export const isDebugModeEnabled = (): boolean => {
  return isDevelopment() && devConfig.enableDebugMode;
};

// Auto-initialize development environment
if (isDevelopment()) {
  // Temporarily disabled to prevent initialization issues
  // initializeDevelopment().catch(console.error);
}

export default devConfig;
