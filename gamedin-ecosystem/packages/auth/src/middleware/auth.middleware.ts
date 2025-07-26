import { FastifyRequest, FastifyReply, FastifyInstance, FastifyPluginAsync } from 'fastify';
import { verifyToken } from '../services/token.service';
import { redis } from '../lib/redis';

export interface UserPayload {
  id: string;
  email: string;
  roles: string[];
  [key: string]: any;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
  }
}

/**
 * Authentication middleware options
 */
interface AuthOptions {
  /**
   * Whether authentication is required (default: true)
   * If false, user will be set if token is valid, but 401 won't be thrown if missing/invalid
   */
  required?: boolean;
  
  /**
   * Required user roles (any of these roles will pass)
   */
  roles?: string | string[];
  
  /**
   * Required permissions (user must have all specified permissions)
   */
  permissions?: string | string[];
}

/**
 * Default authentication options
 */
const defaultAuthOptions: AuthOptions = {
  required: true,
  roles: [],
  permissions: []
};

/**
 * Normalize roles to an array
 */
function normalizeRoles(roles?: string | string[]): string[] {
  if (!roles) return [];
  if (Array.isArray(roles)) return roles;
  return [roles];
}

/**
 * Check if user has required roles
 */
function hasRequiredRoles(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Check if user has required permissions
 * Note: This is a simplified example - in a real app, you'd want a more robust permission system
 */
function hasRequiredPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (requiredPermissions.length === 0) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Authentication middleware factory
 */
export function authenticate(options: AuthOptions = {}): FastifyPluginAsync {
  const { required, roles, permissions } = { ...defaultAuthOptions, ...options };
  const requiredRoles = normalizeRoles(roles);
  const requiredPermissions = normalizeRoles(permissions);

  return async function(fastify: FastifyInstance) {
    fastify.decorateRequest('user', null);
    
    fastify.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Skip authentication for preflight requests
        if (request.method === 'OPTIONS') {
          return;
        }

        // Check for Authorization header
        const authHeader = request.headers.authorization;
        
        if (!authHeader) {
          if (required) {
            return reply.status(401).send({ 
              error: 'Unauthorized',
              message: 'No authorization token provided'
            });
          }
          return;
        }

        // Extract token from header (format: "Bearer <token>")
        const [scheme, token] = authHeader.split(' ');
        
        if (scheme.toLowerCase() !== 'bearer' || !token) {
          if (required) {
            return reply.status(401).send({ 
              error: 'Unauthorized',
              message: 'Invalid authorization format. Expected: Bearer <token>'
            });
          }
          return;
        }

        // Verify token
        const decoded = await verifyToken(token);
        
        // Check if token is blacklisted (for logout functionality)
        const isBlacklisted = await redis.get(`token:blacklist:${token}`);
        if (isBlacklisted) {
          throw new Error('Token has been revoked');
        }

        // Attach user to request
        request.user = decoded as UserPayload;

        // Check roles if required
        if (requiredRoles.length > 0 && !hasRequiredRoles(decoded.roles || [], requiredRoles)) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Insufficient permissions (roles)'
          });
        }

        // Check permissions if required
        if (requiredPermissions.length > 0) {
          // In a real app, you'd fetch user permissions from the database
          const userPermissions = await getUserPermissions(decoded.id);
          if (!hasRequiredPermissions(userPermissions, requiredPermissions)) {
            return reply.status(403).send({
              error: 'Forbidden',
              message: 'Insufficient permissions'
            });
          }
        }

      } catch (error) {
        if (required) {
          const message = error instanceof Error ? error.message : 'Invalid token';
          return reply.status(401).send({ 
            error: 'Unauthorized',
            message
          });
        }
        // If not required, just continue without setting the user
      }
    });
  };
}

/**
 * Get user permissions (stub - implement based on your permission system)
 */
async function getUserPermissions(userId: string): Promise<string[]> {
  // In a real app, you'd fetch this from your database
  // This is a simplified example
  const user = await redis.hGetAll(`user:${userId}`);
  return JSON.parse(user.permissions || '[]');
}

/**
 * Require authentication decorator
 */
export function requireAuth(roles?: string | string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (this: any, ...args: any[]) {
      const [request, reply] = args as [FastifyRequest, FastifyReply];
      
      if (!request.user) {
        return reply.status(401).send({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      // Check roles if specified
      if (roles) {
        const requiredRoles = Array.isArray(roles) ? roles : [roles];
        const userRoles = request.user.roles || [];
        
        if (!requiredRoles.some(role => userRoles.includes(role))) {
          return reply.status(403).send({
            error: 'Forbidden',
            message: 'Insufficient permissions'
          });
        }
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Get current user decorator
 */
export function currentUser(
  target: any,
  propertyKey: string,
  parameterIndex: number
) {
  const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey) || [];
  paramTypes[parameterIndex] = { name: 'User' };
  
  const originalMethod = target[propertyKey];
  
  target[propertyKey] = function (this: any, ...args: any[]) {
    const request = args[0] as FastifyRequest;
    
    if (!request.user) {
      throw new Error('User not authenticated');
    }
    
    // Replace the parameter with the user object
    const newArgs = [...args];
    newArgs[parameterIndex] = request.user;
    
    return originalMethod.apply(this, newArgs);
  };
  
  // Copy metadata to the new method
  Reflect.getMetadataKeys(originalMethod).forEach(key => {
    const value = Reflect.getMetadata(key, originalMethod);
    Reflect.defineMetadata(key, value, target[propertyKey]);
  });
  
  // Update parameter types
  Reflect.defineMetadata('design:paramtypes', paramTypes, target, propertyKey);
}
