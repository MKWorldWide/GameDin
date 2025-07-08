/**
 * GameDin Quantum Layer - Jest Configuration
 * Comprehensive testing configuration for TypeScript components
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // File extensions to test
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(spec|test).(ts|tsx|js)',
    '<rootDir>/quantum-tasks/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/quantum-tasks/**/?(*.)(spec|test).(ts|tsx|js)',
    '<rootDir>/blockchain/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/blockchain/**/?(*.)(spec|test).(ts|tsx|js)'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // TypeScript configuration
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        outDir: './dist',
        rootDir: './src',
        baseUrl: './',
        paths: {
          '@/*': ['src/*'],
          '@quantum/*': ['quantum-tasks/*'],
          '@blockchain/*': ['blockchain/*'],
          '@testing/*': ['testing/*']
        }
      }
    }
  },
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@quantum/(.*)$': '<rootDir>/quantum-tasks/$1',
    '^@blockchain/(.*)$': '<rootDir>/blockchain/$1',
    '^@testing/(.*)$': '<rootDir>/testing/$1'
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    'quantum-tasks/**/*.{ts,tsx,js,jsx}',
    'blockchain/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!quantum-tasks/**/*.d.ts',
    '!blockchain/**/*.d.ts',
    '!src/**/__tests__/**',
    '!quantum-tasks/**/__tests__/**',
    '!blockchain/**/__tests__/**',
    '!src/**/node_modules/**',
    '!quantum-tasks/**/node_modules/**',
    '!blockchain/**/node_modules/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './quantum-tasks/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './blockchain/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Test timeout
  testTimeout: 30000,
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/testing/setup/jest.setup.ts',
    '<rootDir>/testing/setup/quantum.setup.ts',
    '<rootDir>/testing/setup/blockchain.setup.ts'
  ],
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Module path mapping for testing
  modulePaths: [
    '<rootDir>/src',
    '<rootDir>/quantum-tasks',
    '<rootDir>/blockchain',
    '<rootDir>/testing'
  ],
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(quantum-circuit|quantum-random|quantum-ml|qiskit|cirq|pennylane)/)'
  ],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Force exit after tests
  forceExit: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Maximum workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Test results processor
  testResultsProcessor: 'jest-junit',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'GameDin Quantum Layer Test Report'
      }
    ]
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.unit.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)unit.(spec|test).(ts|tsx|js)'
      ],
      setupFilesAfterEnv: ['<rootDir>/testing/setup/unit.setup.ts']
    },
    {
      displayName: 'integration',
      testMatch: [
        '<rootDir>/src/**/__tests__/**/*.integration.(ts|tsx|js)',
        '<rootDir>/src/**/?(*.)integration.(spec|test).(ts|tsx|js)'
      ],
      setupFilesAfterEnv: ['<rootDir>/testing/setup/integration.setup.ts']
    },
    {
      displayName: 'quantum',
      testMatch: [
        '<rootDir>/quantum-tasks/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/quantum-tasks/**/?(*.)(spec|test).(ts|tsx|js)'
      ],
      setupFilesAfterEnv: ['<rootDir>/testing/setup/quantum.setup.ts']
    },
    {
      displayName: 'blockchain',
      testMatch: [
        '<rootDir>/blockchain/**/__tests__/**/*.(ts|tsx|js)',
        '<rootDir>/blockchain/**/?(*.)(spec|test).(ts|tsx|js)'
      ],
      setupFilesAfterEnv: ['<rootDir>/testing/setup/blockchain.setup.ts']
    }
  ],
  
  // Global test configuration
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
}; 