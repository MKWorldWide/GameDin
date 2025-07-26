import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '@gamedin/auth';

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
  // Get current user's profile
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
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
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string' },
                notifications: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                    inApp: { type: 'boolean' },
                  },
                },
                privacy: {
                  type: 'object',
                  properties: {
                    profileVisible: { type: 'boolean' },
                    activityVisible: { type: 'boolean' },
                  },
                },
              },
            },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
            lastLogin: { type: 'string', nullable: true },
          },
        },
      },
    },
  }, async (request) => {
    // The user is attached to the request by the JWT strategy
    const { password, ...userWithoutPassword } = request.user;
    return userWithoutPassword;
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
  }, async (request) => {
    // In a real app, you would update the user in the database
    // For now, we'll just return the current user with updated fields
    const updatedUser = {
      ...request.user,
      ...request.body,
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      user: updatedUser,
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
  }, async (request, reply) => {
    const { currentPassword, newPassword } = request.body as z.infer<typeof ChangePasswordSchema>;
    
    try {
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
  }, async (request) => {
    const { email } = request.body as { email: string };
    
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
  }, async (request, reply) => {
    const { token, newPassword } = request.body as { token: string; newPassword: string };
    
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
