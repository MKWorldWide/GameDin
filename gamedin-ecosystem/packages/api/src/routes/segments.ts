import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { UserSegment, SegmentCondition } from '../../../apps/admin-dashboard/src/components/analytics/segments/types';

// In-memory storage for segments (replace with database in production)
const segments: UserSegment[] = [];

export default async function segmentRoutes(fastify: FastifyInstance) {
  // Get all segments
  fastify.get('/segments', async () => {
    return { success: true, data: segments };
  });

  // Get a single segment by ID
  fastify.get('/segments/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const segment = segments.find(s => s.id === id);
    
    if (!segment) {
      return reply.status(404).send({ 
        success: false, 
        error: 'Segment not found' 
      });
    }
    
    return { success: true, data: segment };
  });

  // Create a new segment
  fastify.post('/segments', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'filter'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          filter: { type: 'array' },
          isActive: { type: 'boolean', default: true },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'> }>, reply: FastifyReply) => {
    const newSegment: UserSegment = {
      ...request.body,
      id: randomUUID(),
      userCount: 0, // Will be calculated based on filter
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system', // Replace with actual user ID from auth
    };

    segments.push(newSegment);
    return { success: true, data: newSegment };
  });

  // Update a segment
  fastify.put('/segments/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          filter: { type: 'array' },
          isActive: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Params: { id: string },
    Body: Partial<Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>> 
  }>, reply: FastifyReply) => {
    const { id } = request.params;
    const segmentIndex = segments.findIndex(s => s.id === id);
    
    if (segmentIndex === -1) {
      return reply.status(404).send({ 
        success: false, 
        error: 'Segment not found' 
      });
    }

    const updatedSegment = {
      ...segments[segmentIndex],
      ...request.body,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system', // Replace with actual user ID from auth
    };

    segments[segmentIndex] = updatedSegment;
    return { success: true, data: updatedSegment };
  });

  // Delete a segment
  fastify.delete('/segments/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const segmentIndex = segments.findIndex(s => s.id === id);
    
    if (segmentIndex === -1) {
      return reply.status(404).send({ 
        success: false, 
        error: 'Segment not found' 
      });
    }

    segments.splice(segmentIndex, 1);
    return { success: true, data: { id } };
  });

  // Preview segment conditions
  fastify.post('/segments/preview', {
    schema: {
      body: {
        type: 'object',
        required: ['conditions'],
        properties: {
          conditions: { type: 'array' },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { conditions: SegmentCondition[] } }>) => {
    // In a real implementation, this would query the database
    // For now, return mock data
    return {
      success: true,
      data: {
        totalUsers: 1000,
        matchedUsers: Math.floor(Math.random() * 1000),
        matchRate: Math.random(),
        sampleUsers: Array(5).fill(null).map((_, i) => ({
          id: `user-${i}`,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
          avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
          lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
          joinDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
          status: ['active', 'inactive', 'suspended'][Math.floor(Math.random() * 3)] as 'active' | 'inactive' | 'suspended',
          role: ['user', 'admin', 'moderator'][Math.floor(Math.random() * 3)],
          country: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
          device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
          sessions: Math.floor(Math.random() * 100),
          totalSpend: parseFloat((Math.random() * 1000).toFixed(2)),
        })),
      },
    };
  });

  // Get segment templates
  fastify.get('/segments/templates', async () => {
    const templates: UserSegment[] = [
      {
        id: 'template-1',
        name: 'Active Users',
        description: 'Users who have been active in the last 30 days',
        filter: [
          {
            id: 'condition-1',
            type: 'date',
            attribute: 'lastActive',
            operator: 'greater_than',
            value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        userCount: 0,
        isActive: true,
        isSystem: true,
        tags: ['engagement', 'active'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      // Add more templates as needed
    ];

    return { success: true, data: templates };
  });

  // Save segment as template
  fastify.post('/segments/templates', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'filter'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          filter: { type: 'array' },
          tags: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  }, async (request: FastifyRequest<{ 
    Body: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt' | 'isSystem' | 'userCount' | 'isActive'> 
  }>) => {
    const newTemplate: UserSegment = {
      ...request.body,
      id: `template-${randomUUID()}`,
      userCount: 0,
      isActive: true,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system', // Replace with actual user ID from auth
    };

    // In a real implementation, save to database
    return { success: true, data: newTemplate };
  });
}

// Add this to your Fastify server setup:
// app.register(segmentRoutes, { prefix: '/api' });
