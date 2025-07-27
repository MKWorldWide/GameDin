import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { JWT } from '@fastify/jwt';

// Import User type from our shared types
declare global {
  // This augments the existing Fastify types
  namespace FastifyJWT {
    interface User {
      id: string;
      email: string;
      username: string;
      role: string;
      isVerified: boolean;
      // Add other user properties as needed
    }
  }
}

// Define User interface
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  role: string;
  isVerified: boolean;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string | null;
  password?: string; // For internal use only
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: User;
  }
}

// AuthService type declarations
declare module '@gamedin/auth' {
  export class AuthService {
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>;
    static requestPasswordReset(email: string): Promise<void>;
    static resetPassword(token: string, newPassword: string): Promise<void>;
  }
}

// Schema for updating user profile
const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark']).optional(),
    notifications: z.object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      inApp: z.boolean().optional(),
    }).optional(),
    privacy: z.object({
      profileVisible: z.boolean().optional(),
      activityVisible: z.boolean().optional(),
    }).optional(),
  }).optional(),
}).strict();

// Schema for changing password
const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
}).strict();

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // Get current user profile
  fastify.get('/me', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            role: { type: 'string' },
            isVerified: { type: 'boolean' },
            settings: { type: 'object' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            lastLogin: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    // The user is attached to the request by the JWT strategy
    const user = request.user;
    if (!user) {
      throw fastify.httpErrors.unauthorized('Not authenticated');
    }
    
    // Create a new object with only the properties we want to expose
    // Use type assertion to handle the JWT user type
    const userData = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isVerified: user.isVerified,
      // Add other properties as needed
    };
    
    return userData;
  });

  // Update current user's profile
  fastify.patch('/me', {
    onRequest: [fastify.authenticate],
    schema: {
      body: UpdateProfileSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                avatarUrl: { type: 'string', nullable: true },
                role: { type: 'string' },
                isVerified: { type: 'boolean' },
                settings: { type: 'object' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    if (!request.user) {
      throw fastify.httpErrors.unauthorized('Not authenticated');
    }
    
    // Type assertion for the request body
    const body = request.body as z.infer<typeof UpdateProfileSchema>;
    
    // Create a new user object with updated fields
    const updatedUser: User = {
      ...request.user,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Remove password before sending response
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return {
      success: true,
      user: userWithoutPassword,
    };
  });

  // Change password
  fastify.post('/me/change-password', {
    onRequest: [fastify.authenticate],
    schema: {
      body: ChangePasswordSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest) => {
    if (!request.user) {
      throw fastify.httpErrors.unauthorized('Not authenticated');
    }
    
    // Type assertion for the request body
    const { currentPassword, newPassword } = request.body as z.infer<typeof ChangePasswordSchema>;
    
    try {
      // Dynamic import to avoid circular dependencies
      const { AuthService } = await import('@gamedin/auth');
      
      await AuthService.changePassword(
        request.user.id,
        currentPassword,
        newPassword
      );
      
      return {
        success: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          throw fastify.httpErrors.unauthorized('Current password is incorrect');
        }
        if (error.message.includes('User not found')) {
          throw fastify.httpErrors.notFound('User not found');
        }
      }
      throw error;
    }
  });

  // Request password reset
  fastify.post('/request-password-reset', {
    schema: {
      body: z.object({
        email: z.string().email(),
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { email: string } }>) => {
    const { AuthService } = await import('@gamedin/auth');
    const { email } = request.body;
    
    try {
      await AuthService.requestPasswordReset(email);
      
      // In a real app, you would send an email with the reset token
      // For now, we'll just return a success message
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    } catch (error) {
      // Don't reveal whether the email exists or not
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
      };
    }
  });

  // Reset password with token
  fastify.post('/reset-password', {
    schema: {
      body: z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }),
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: { token: string; newPassword: string } }>) => {
    const { AuthService } = await import('@gamedin/auth');
    const { token, newPassword } = request.body;
    
    try {
      await AuthService.resetPassword(token, newPassword);
      
      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired')) {
          throw fastify.httpErrors.badRequest('Invalid or expired reset token');
        }
        if (error.message.includes('User not found')) {
          throw fastify.httpErrors.notFound('User not found');
        }
      }
      throw error;
    }
  });
};
