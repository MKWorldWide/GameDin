// Global test setup
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder and TextDecoder for Node.js test environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock global fetch
if (!global.fetch) {
  global.fetch = jest.fn();
  global.Headers = jest.fn();
  global.Request = jest.fn((...args) => ({
    ...new Request(...args),
  }));
  global.Response = jest.fn((...args) => ({
    ...new Response(...args),
  }));
}

// Mock console methods
const originalConsole = { ...console };
const consoleMocks = ['log', 'warn', 'error', 'debug', 'info'];

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();

  // Mock console methods
  consoleMocks.forEach((method) => {
    global.console[method] = jest.fn();
  });
});

afterEach(() => {
  // Restore original console methods
  consoleMocks.forEach((method) => {
    global.console[method] = originalConsole[method];
  });
});

// Set test timeout
jest.setTimeout(30000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.APP_ENV = 'test';
process.env.PORT = '3000';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ENCRYPTION_KEY = 'test-encryption-key';
process.env.ENCRYPTION_IV = 'test-encryption-iv';

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
  throw new Error(`Process exited with code ${code}`);
});

// Mock process.stdout and process.stderr
process.stdout.write = jest.fn();
process.stderr.write = jest.fn();

// Mock Date
const mockDate = new Date('2025-01-01T00:00:00.000Z');
global.Date = class extends Date {
  constructor() {
    super();
    return mockDate;
  }
  static now() {
    return mockDate.getTime();
  }
};

// Mock timers
jest.useFakeTimers().setSystemTime(mockDate.getTime());

// Mock crypto
const crypto = require('crypto');
Object.defineProperty(global.self, 'crypto', {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
  },
});

// Add custom matchers
expect.extend({
  toBeTypeOf(received, expected) {
    const type = typeof received;
    const pass = type === expected;
    return {
      message: () => `expected ${received} to be of type ${expected}, but got ${type}`,
      pass,
    };
  },
  toMatchSchema(received, schema) {
    try {
      schema.parse(received);
      return {
        message: () => 'Schema validation passed',
        pass: true,
      };
    } catch (error) {
      return {
        message: () => `Schema validation failed: ${error.message}`,
        pass: false,
      };
    }
  },
});

// Custom error matcher
expect.extend({
  toThrowWithMessage(received, expectedError, expectedMessage) {
    if (typeof received !== 'function') {
      throw new Error('Expected a function');
    }

    try {
      received();
      return {
        message: () => `Expected function to throw ${expectedError.name}`,
        pass: false,
      };
    } catch (error) {
      if (!(error instanceof expectedError)) {
        return {
          message: () => `Expected ${expectedError.name} but got ${error.constructor.name}`,
          pass: false,
        };
      }

      if (typeof expectedMessage === 'string' && !error.message.includes(expectedMessage)) {
        return {
          message: () => `Expected error message to contain: ${expectedMessage}\nReceived: ${error.message}`,
          pass: false,
        };
      }

      if (expectedMessage instanceof RegExp && !expectedMessage.test(error.message)) {
        return {
          message: () => `Expected error message to match: ${expectedMessage}\nReceived: ${error.message}`,
          pass: false,
        };
      }

      return {
        message: () => `Expected function not to throw ${expectedError.name}`,
        pass: true,
      };
    }
  },
});
