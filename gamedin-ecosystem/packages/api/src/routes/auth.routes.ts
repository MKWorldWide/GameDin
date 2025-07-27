import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';

// Import types from our declaration files
declare module '@gamedin/auth' {
  export class AuthService {
    static register(data: { email: string; username: string; password: string; displayName?: string }): Promise<{ user: any; token: string }>;
    static login(credentials: { email: string; password: string }): Promise<{ user: any; token: string }>;
    static refreshToken(token: string): Promise<{ token: string }>;
  }
}

// Define UserRole enum locally since we're having issues with the import
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

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
  fastify.post<{ Body: z.infer<typeof RegisterSchema> }>('/register', {
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
                role: { type: 'string', enum: Object.values(UserRole) },
                isVerified: { type: 'boolean' },
                createdAt: { type: 'string' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof RegisterSchema> }>, reply: FastifyReply) => {
    const { email, username, password, displayName } = request.body;
    
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
      const userData = user as Record<string, any>;
      const { password: _, ...userWithoutPassword } = userData;
      
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
  fastify.post<{ Body: z.infer<typeof LoginSchema> }>('/login', {
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
                role: { type: 'string', enum: Object.values(UserRole) },
                isVerified: { type: 'boolean' },
              },
            },
            token: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof LoginSchema> }>, reply: FastifyReply) => {
    const { email, password } = request.body;
    
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
      const userData = user as Record<string, any>;
      const { password: _, ...userWithoutPassword } = userData;
      
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
  fastify.post<{ Body: z.infer<typeof RefreshTokenSchema> }>('/refresh-token', {
    schema: {
      body: RefreshTokenSchema,
    },
  }, async (request: FastifyRequest<{ Body: z.infer<typeof RefreshTokenSchema> }>, reply: FastifyReply) => {
    const { refreshToken } = request.body;
    
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
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
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
  }, async (request: FastifyRequest & { user?: any }) => {
    // The user is attached to the request by the JWT strategy
    if (!request.user) {
      throw fastify.httpErrors.unauthorized('Not authenticated');
    }
    const userData = request.user as Record<string, any>;
    const { password, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  });
};
