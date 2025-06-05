module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],
  testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json'
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/integration',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'reports/integration',
      outputName: 'junit.xml',
      classNameTemplate: '{filepath}',
      titleTemplate: '{title}'
    }]
  ]
}; 