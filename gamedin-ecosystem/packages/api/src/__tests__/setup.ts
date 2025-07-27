// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.JWT_SECRET = 'test-secret';
process.env.DATABASE_URL = 'file:./test.db';
process.env.MKWW_STUDIO_URL = 'https://api.mkww.studio';
process.env.MKWW_STUDIO_ENABLED = 'true';
process.env.MKWW_STUDIO_API_PREFIX = '/api/v1';

// Mock console methods to reduce test noise
const consoleMethods = ['log', 'warn', 'error', 'info', 'debug'];

consoleMethods.forEach((method) => {
  jest.spyOn(console, method as keyof typeof console).mockImplementation(() => {});
});
