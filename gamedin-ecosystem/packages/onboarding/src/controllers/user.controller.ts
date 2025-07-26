import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { redis } from '../lib/redis';
import { authConfig } from '../config/auth.config';

// Validation schemas
const listUsersSchema = z.object({
  page: z.preprocess(Number, z.number().int().positive()).default(1),
  pageSize: z.preprocess(Number, z.number().int().positive().max(100)).default(10),
  search: z.string().optional(),
  role: z.enum(['player', 'creator', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'unverified']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'name']).default('newest'),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  displayName: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  roles: z.array(z.enum(['player', 'creator', 'moderator', 'admin'])).optional(),
  isEmailVerified: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
  suspendReason: z.string().max(500).optional().nullable(),
});

// Types
type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  roles: string[];
  isEmailVerified: boolean;
  isSuspended: boolean;
  suspendReason: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// List all users with pagination and filtering
export const listUsers = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof listUsersSchema> }>,
  reply: FastifyReply
) => {
  try {
    // Check if user is authenticated and has admin role
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    if (!request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    const { 
      page = 1, 
      pageSize = 10, 
      search, 
      role, 
      status, 
      sortBy = 'newest' 
    } = listUsersSchema.parse(request.query);
    
    // In a real app, you'd query your database here with proper pagination and filtering
    // This is a simplified example that gets all users and filters in memory
    const userIds = await redis.sMembers('users:all');
    
    // Get user details
    const users = await Promise.all(
      userIds.map(async (userId) => {
        const userData = await redis.hGetAll(`user:${userId}`);
        return {
          id: userId,
          email: userData.email || '',
          username: userData.username || '',
          displayName: userData.displayName || userData.username || '',
          avatar: userData.avatar || null,
          bio: userData.bio || null,
          roles: JSON.parse(userData.roles || '[]'),
          isEmailVerified: userData.isEmailVerified === 'true',
          isSuspended: userData.isSuspended === 'true',
          suspendReason: userData.suspendReason || null,
          lastLoginAt: userData.lastLoginAt || null,
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString(),
        } as User;
      })
    );
    
    // Apply filters
    let filteredUsers = users.filter(user => {
      // Filter by search term if provided
      if (search) {
        const searchLower = search.toLowerCase();
        if (!user.email.toLowerCase().includes(searchLower) &&
            !user.username.toLowerCase().includes(searchLower) &&
            !(user.displayName && user.displayName.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      
      // Filter by role if specified
      if (role && !user.roles.includes(role)) {
        return false;
      }
      
      // Filter by status if specified
      if (status === 'active' && (user.isSuspended || !user.isEmailVerified)) {
        return false;
      }
      if (status === 'suspended' && !user.isSuspended) {
        return false;
      }
      if (status === 'unverified' && user.isEmailVerified) {
        return false;
      }
      
      return true;
    });
    
    // Apply sorting
    if (sortBy === 'newest') {
      filteredUsers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'oldest') {
      filteredUsers.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sortBy === 'name') {
      filteredUsers.sort((a, b) => 
        (a.displayName || a.username).localeCompare(b.displayName || b.username)
      );
    }
    
    // Get total count for pagination
    const total = filteredUsers.length;
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      users: paginatedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Error listing users:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Get user by ID
export const getUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    
    // Check if user is authenticated and has admin role
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    // Allow users to view their own profile, but require admin for others
    if (request.user.id !== id && !request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Get user data
    const userData = await redis.hGetAll(`user:${id}`);
    
    if (!userData.id) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    const user: User = {
      id,
      email: userData.email || '',
      username: userData.username || '',
      displayName: userData.displayName || userData.username || '',
      avatar: userData.avatar || null,
      bio: userData.bio || null,
      roles: JSON.parse(userData.roles || '[]'),
      isEmailVerified: userData.isEmailVerified === 'true',
      isSuspended: userData.isSuspended === 'true',
      suspendReason: userData.suspendReason || null,
      lastLoginAt: userData.lastLoginAt || null,
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };
    
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error getting user:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Update user
export const updateUser = async (
  request: FastifyRequest<{ 
    Params: { id: string },
    Body: z.infer<typeof updateUserSchema>
  }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    const updateData = updateUserSchema.parse(request.body);
    
    // Check if user is authenticated
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    // Only allow admins to update other users
    if (request.user.id !== id && !request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Check if user exists
    const exists = await redis.exists(`user:${id}`);
    if (!exists) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    // Get current user data
    const currentUser = await redis.hGetAll(`user:${id}`);
    const currentRoles = JSON.parse(currentUser.roles || '[]');
    
    // Prepare update data
    const updateObj: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    };
    
    // Update basic fields
    if (updateData.email !== undefined) updateObj.email = updateData.email;
    if (updateData.username !== undefined) updateObj.username = updateData.username;
    if (updateData.displayName !== undefined) updateObj.displayName = updateData.displayName || '';
    if (updateData.avatar !== undefined) updateObj.avatar = updateData.avatar || '';
    if (updateData.bio !== undefined) updateObj.bio = updateData.bio || '';
    
    // Update email verification status (admin only)
    if (updateData.isEmailVerified !== undefined && request.user.roles?.includes('admin')) {
      updateObj.isEmailVerified = String(updateData.isEmailVerified);
    }
    
    // Update suspension status (admin only)
    if (updateData.isSuspended !== undefined && request.user.roles?.includes('admin')) {
      updateObj.isSuspended = String(updateData.isSuspended);
      
      // Add/update suspend reason if suspending
      if (updateData.isSuspended && updateData.suspendReason !== undefined) {
        updateObj.suspendReason = updateData.suspendReason || '';
      } else if (!updateData.isSuspended) {
        updateObj.suspendReason = '';
      }
    }
    
    // Update roles (admin only)
    if (updateData.roles !== undefined && request.user.roles?.includes('admin')) {
      // Prevent removing the last admin role if this is the last admin
      if (updateData.roles.length === 0) {
        return reply.status(400).send({ 
          error: 'A user must have at least one role' 
        });
      }
      
      // Prevent removing admin role from self
      if (id === request.user.id && !updateData.roles.includes('admin')) {
        return reply.status(400).send({ 
          error: 'Cannot remove admin role from yourself' 
        });
      }
      
      updateObj.roles = JSON.stringify(updateData.roles);
    }
    
    // Apply updates
    if (Object.keys(updateObj).length > 1) { // More than just updatedAt
      await redis.hSet(`user:${id}`, updateObj);
    }
    
    // Get updated user data
    const updatedUser = await redis.hGetAll(`user:${id}`);
    
    return {
      success: true,
      user: {
        id,
        email: updatedUser.email || '',
        username: updatedUser.username || '',
        displayName: updatedUser.displayName || updatedUser.username || '',
        avatar: updatedUser.avatar || null,
        bio: updatedUser.bio || null,
        roles: JSON.parse(updatedUser.roles || '[]'),
        isEmailVerified: updatedUser.isEmailVerified === 'true',
        isSuspended: updatedUser.isSuspended === 'true',
        suspendReason: updatedUser.suspendReason || null,
        lastLoginAt: updatedUser.lastLoginAt || null,
        createdAt: updatedUser.createdAt || new Date().toISOString(),
        updatedAt: updatedUser.updatedAt || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  try {
    const { id } = request.params;
    
    // Check if user is authenticated and has admin role
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    // Prevent users from deleting themselves
    if (request.user.id === id) {
      return reply.status(400).send({ 
        error: 'You cannot delete your own account' 
      });
    }
    
    // Check if user has admin role
    if (!request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Check if user exists
    const exists = await redis.exists(`user:${id}`);
    if (!exists) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    // Get user data before deletion (for cleanup)
    const userData = await redis.hGetAll(`user:${id}`);
    
    // Delete user data
    await redis.del(`user:${id}`);
    
    // Remove from users set
    await redis.sRem('users:all', id);
    
    // Remove from any role sets
    const roles = JSON.parse(userData.roles || '[]');
    for (const role of roles) {
      await redis.sRem(`role:${role}`, id);
    }
    
    // In a real app, you'd also need to:
    // 1. Invalidate any active sessions/tokens
    // 2. Clean up any related data (posts, comments, etc.)
    // 3. Send account deletion notification
    
    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};
