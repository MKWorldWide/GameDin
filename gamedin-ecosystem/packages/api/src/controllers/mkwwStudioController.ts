// Import only what's needed
import type { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { appConfig } from '../config/app.config';

export class MKWWStudioController {
  // Verify API key with MKWW Studio
  async verifyApiKey(
    request: FastifyRequest<{ Body: { apiKey: string } }>,
    reply: FastifyReply
  ) {
    const { apiKey } = request.body;

    try {
      const response = await axios.get(`${appConfig.MKWW_STUDIO_URL}/api/v1/auth/verify`, {
        headers: {
          'X-MKWW-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });

      if (response.status === 200) {
        return reply.code(200).send({ 
          success: true, 
          message: 'API key is valid',
          user: response.data.user
        });
      }
      
      return reply.code(401).send({ 
        success: false, 
        message: 'Invalid API key' 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error('MKWW Studio verification error:', error);
      return reply.code(500).send({ 
        success: false, 
        message: 'Failed to verify API key with MKWW Studio',
        error: errorMessage
      });
    }
  }

  // Sync users with MKWW Studio
  async syncUsers(
    request: FastifyRequest<{ 
      Body: { 
        users: any[];
        apiKey: string;
      } 
    }>,
    reply: FastifyReply
  ) {
    const { users, apiKey } = request.body;

    if (!users || !Array.isArray(users)) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Invalid users data' 
      });
    }

    try {
      // Forward the request to MKWW Studio
      const response = await axios.post(
        `${appConfig.MKWW_STUDIO_URL}/api/v1/sync/users`,
        { users },
        {
          headers: {
            'X-MKWW-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 second timeout
        }
      );

      return reply.code(200).send({
        success: true,
        message: 'Users synced successfully',
        data: response.data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error('MKWW Studio sync users error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to sync users with MKWW Studio',
        error: errorMessage,
      });
    }
  }

  // Sync analytics data with MKWW Studio
  async syncAnalytics(
    request: FastifyRequest<{ 
      Body: { 
        analyticsData: any;
        apiKey: string;
      } 
    }>,
    reply: FastifyReply
  ) {
    const { analyticsData, apiKey } = request.body;

    if (!analyticsData) {
      return reply.code(400).send({ 
        success: false, 
        message: 'Analytics data is required' 
      });
    }

    try {
      // Forward the request to MKWW Studio
      const response = await axios.post(
        `${appConfig.MKWW_STUDIO_URL}/api/v1/sync/analytics`,
        analyticsData,
        {
          headers: {
            'X-MKWW-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // 15 second timeout
        }
      );

      return reply.code(200).send({
        success: true,
        message: 'Analytics synced successfully',
        data: response.data,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error('MKWW Studio sync analytics error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to sync analytics with MKWW Studio',
        error: errorMessage,
      });
    }
  }

  // Get MKWW Studio settings
  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      // In a real app, you'd get these from a database or config
      const settings = {
        enabled: appConfig.MKWW_STUDIO_ENABLED === 'true',
        baseUrl: appConfig.MKWW_STUDIO_URL,
        lastSync: null,
        // Add other settings as needed
      };

      return reply.code(200).send({
        success: true,
        data: settings,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      request.log.error('Failed to get MKWW Studio settings:', error);
      return reply.code(500).send({
        success: false,
        message: 'Failed to get MKWW Studio settings',
        error: errorMessage,
      });
    }
  }
}

export default new MKWWStudioController();
