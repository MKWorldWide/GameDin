import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '@gamedin/auth';
import { UserRole } from '@gamedin/shared/types/user';

const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Register a new user
  fastify.post('/register', {
    schema: {
      body: RegisterSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                role: { type: 'string', enum: Object.values(UserRole.Values) },
                isVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, username, password, displayName } = request.body as z.infer<typeof RegisterSchema>;
    
    try {
      const { user, token } = await AuthService.register({
        email,
        username,
        password,
        displayName,
      });

      // Set HTTP-only cookie with the token
      reply.setCookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // or 'strict' if you prefer
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Don't send sensitive data to the client
      const { password: _, ...userWithoutPassword } = user;
      
      reply.status(201).send({
        user: userWithoutPassword,
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists') || error.message.includes('already taken')) {
          throw fastify.httpErrors.conflict(error.message);
        }
      }
      throw error;
    }
  });

  // User login
  fastify.post('/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                displayName: { type: 'string' },
                role: { type: 'string' },
                isVerified: { type: 'boolean' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as z.infer<typeof LoginSchema>;
    
    try {
      const { user, token } = await AuthService.login({
        email,
        password,
      });

      // Set HTTP-only cookie with the token
      reply.setCookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      // Don't send sensitive data to the client
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials') || error.message.includes('not found')) {
          throw fastify.httpErrors.unauthorized('Invalid email or password');
        }
        if (error.message.includes('deactivated')) {
          throw fastify.httpErrors.forbidden('Account is deactivated');
        }
      }
      throw error;
    }
  });

  // Refresh access token
  fastify.post('/refresh-token', {
    schema: {
      body: RefreshTokenSchema,
    },
  }, async (request, reply) => {
    const { refreshToken } = request.body as z.infer<typeof RefreshTokenSchema>;
    
    try {
      const { token } = await AuthService.refreshToken(refreshToken);
      
      // Set new access token in HTTP-only cookie
      reply.setCookie('accessToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      
      return { token };
    } catch (error) {
      throw fastify.httpErrors.unauthorized('Invalid or expired refresh token');
    }
  });

  // Logout (client should delete the token)
  fastify.post('/logout', async (request, reply) => {
    // Clear the access token cookie
    reply.clearCookie('accessToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return { success: true, message: 'Successfully logged out' };
  });

  // Get current user (protected route)
  fastify.get('/me', {
    onRequest: [fastify.authenticate],
  }, async (request) => {
    // The user is attached to the request by the JWT strategy
    const { password, ...userWithoutPassword } = request.user;
    return userWithoutPassword;
  });
};
