import { FastifyInstance } from 'fastify';
import { createServer } from '../../src/server';
import { appConfig } from '../../src/config/app.config';
import { mkdirSync, existsSync, writeFileSync } from 'fs';
import path from 'path';

// Mock axios for testing
jest.mock('axios');
const axios = require('axios');

describe('MKWW Studio Integration', () => {
  let server: FastifyInstance;
  const testPort = 4000;
  const testHost = `http://localhost:${testPort}`;

  beforeAll(async () => {
    // Create test server
    server = await createServer();
    
    // Start the server
    await server.listen({ port: testPort, host: '0.0.0.0' });
    
    // Mock axios responses
    axios.get.mockImplementation((url: string) => {
      if (url.includes('/auth/verify')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              name: 'Test User'
            }
          }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    axios.post.mockImplementation((url: string) => {
      if (url.includes('/sync/users')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            synced: 5,
            failed: 0
          }
        });
      }
      if (url.includes('/sync/analytics')) {
        return Promise.resolve({
          status: 200,
          data: {
            success: true,
            message: 'Analytics synced successfully'
          }
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });
  });

  afterAll(async () => {
    // Close the server after all tests
    await server.close();
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('API Key Verification', () => {
    it('should verify a valid API key', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/api/mkww/verify-key',
        payload: {
          apiKey: 'test-api-key-123'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.user).toBeDefined();
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/auth/verify'),
        expect.any(Object)
      );
    });

    it('should return 401 for invalid API key', async () => {
      // Mock a 401 response
      axios.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Invalid API key'
          }
        }
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/mkww/verify-key',
        payload: {
          apiKey: 'invalid-api-key'
        }
      });

      expect(response.statusCode).toBe(401);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(false);
    });
  });

  describe('User Sync', () => {
    it('should sync users with MKWW Studio', async () => {
      const testUsers = [
        { id: 'user1', name: 'User One', email: 'user1@example.com' },
        { id: 'user2', name: 'User Two', email: 'user2@example.com' }
      ];

      const response = await server.inject({
        method: 'POST',
        url: '/api/mkww/sync/users',
        headers: {
          'authorization': 'Bearer test-jwt-token'
        },
        payload: {
          users: testUsers,
          apiKey: 'test-api-key-123'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Users synced successfully');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sync/users'),
        { users: testUsers },
        expect.any(Object)
      );
    });
  });

  describe('Analytics Sync', () => {
    it('should sync analytics data with MKWW Studio', async () => {
      const testAnalytics = {
        metrics: {
          activeUsers: 42,
          pageViews: 1000,
          conversions: 25
        },
        timeRange: {
          start: '2023-01-01T00:00:00Z',
          end: '2023-01-31T23:59:59Z'
        }
      };

      const response = await server.inject({
        method: 'POST',
        url: '/api/mkww/sync/analytics',
        headers: {
          'authorization': 'Bearer test-jwt-token'
        },
        payload: {
          analyticsData: testAnalytics,
          apiKey: 'test-api-key-123'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Analytics synced successfully');
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sync/analytics'),
        testAnalytics,
        expect.any(Object)
      );
    });
  });

  describe('Settings', () => {
    it('should return MKWW Studio settings', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/mkww/settings',
        headers: {
          'authorization': 'Bearer test-jwt-token'
        }
      });

      expect(response.statusCode).toBe(200);
      const data = JSON.parse(response.payload);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('enabled');
      expect(data.data).toHaveProperty('baseUrl');
      expect(data.data).toHaveProperty('lastSync');
    });
  });
});
