import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.config';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return reply.status(401).send({ error: 'Invalid token format' });
    }

    // Verify the token
    const decoded = jwt.verify(token, authConfig.JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };

    // Attach user to request object
    request.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return reply.status(401).send({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.status(401).send({ error: 'Invalid token' });
    }
    console.error('Authentication error:', error);
    return reply.status(500).send({ error: 'Authentication failed' });
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: request.user.role,
      });
    }
  };
};
