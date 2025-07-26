import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { redis } from '../lib/redis';
import { v4 as uuidv4 } from 'uuid';
import { authConfig } from '../config/auth.config';

// Validation schemas
const createInviteSchema = z.object({
  role: z.enum(['player', 'creator', 'moderator', 'admin']).default('player'),
  maxUses: z.number().int().positive().max(1000).default(1),
  expiresInDays: z.number().int().positive().default(7),
});

const listInvitesSchema = z.object({
  page: z.preprocess(Number, z.number().int().positive()).default(1),
  pageSize: z.preprocess(Number, z.number().int().positive().max(100)).default(10),
  search: z.string().optional(),
  role: z.enum(['player', 'creator', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'used', 'expired']).optional(),
  sortBy: z.enum(['newest', 'oldest', 'expiring']).default('newest'),
});

// Types
type InviteCode = {
  id: string;
  code: string;
  createdBy: string;
  usedBy?: string;
  usedAt?: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  role: string;
  createdAt: string;
  isExpired: boolean;
};

// Helper functions
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const getExpiryDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const isExpired = (expiresAt: string): boolean => {
  return new Date(expiresAt) < new Date();
};

// Generate a unique invite code
const generateUniqueInviteCode = async (): Promise<string> => {
  let code: string;
  let exists: boolean;
  
  do {
    code = generateInviteCode();
    const key = `invite:${code}`;
    exists = await redis.exists(key);
  } while (exists);
  
  return code;
};

// Create a new invite code
export const createInvite = async (
  request: FastifyRequest<{ Body: z.infer<typeof createInviteSchema> }>,
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
    
    const { role, maxUses, expiresInDays } = createInviteSchema.parse(request.body);
    
    // Generate a unique invite code
    const code = await generateUniqueInviteCode();
    const now = new Date().toISOString();
    const expiresAt = getExpiryDate(expiresInDays);
    
    // Create invite object
    const invite: Omit<InviteCode, 'isExpired'> = {
      id: uuidv4(),
      code,
      createdBy: request.user.id,
      expiresAt,
      maxUses,
      useCount: 0,
      role,
      createdAt: now,
    };
    
    // Store in Redis
    await redis.hSet(`invite:${code}`, invite);
    
    // Add to invites set for the creator
    await redis.sAdd(`user:${request.user.id}:invites`, code);
    
    // Add to global invites set (for admin dashboard)
    await redis.zAdd('invites', {
      score: new Date(expiresAt).getTime(),
      value: code,
    });
    
    return {
      success: true,
      code,
      url: `${authConfig.FRONTEND_URL}/signup?invite=${code}`,
      expiresAt,
    };
  } catch (error) {
    console.error('Error creating invite:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// List all invite codes
export const listInvites = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof listInvitesSchema> }>,
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
    } = listInvitesSchema.parse(request.query);
    
    // Get all invite codes
    let inviteCodes: string[] = [];
    
    if (search) {
      // In a real app, you'd use Redis search or a different approach
      // This is a simplified version that loads all invites and filters in memory
      const allInvites = await redis.zRange('invites', 0, -1);
      inviteCodes = allInvites.filter(code => 
        code.toLowerCase().includes(search.toLowerCase())
      );
    } else {
      // Get paginated invites based on sort order
      const start = (page - 1) * pageSize;
      const stop = start + pageSize - 1;
      
      if (sortBy === 'newest') {
        inviteCodes = await redis.zRevRange('invites', start, stop);
      } else if (sortBy === 'oldest') {
        inviteCodes = await redis.zRange('invites', start, stop);
      } else if (sortBy === 'expiring') {
        // For expiring soonest first, we can use the natural order since score is timestamp
        inviteCodes = await redis.zRange('invites', start, stop);
      }
    }
    
    // Get invite details
    const invites = await Promise.all(
      inviteCodes.map(async (code) => {
        const inviteData = await redis.hGetAll(`invite:${code}`);
        const isExpired = new Date(inviteData.expiresAt) < new Date();
        return {
          ...inviteData,
          isExpired,
        } as InviteCode;
      })
    );
    
    // Apply filters
    let filteredInvites = invites.filter(invite => {
      // Filter by role if specified
      if (role && invite.role !== role) return false;
      
      // Filter by status if specified
      if (status === 'active' && (invite.isExpired || invite.useCount >= invite.maxUses)) return false;
      if (status === 'used' && (invite.useCount < 1 || invite.useCount < invite.maxUses)) return false;
      if (status === 'expired' && !invite.isExpired) return false;
      
      return true;
    });
    
    // Get total count for pagination
    const total = filteredInvites.length;
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const paginatedInvites = filteredInvites.slice(startIndex, startIndex + pageSize);
    
    return {
      success: true,
      invites: paginatedInvites,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error) {
    console.error('Error listing invites:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Get invite code details
export const getInvite = async (
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply
) => {
  try {
    const { code } = request.params;
    
    // Check if user is authenticated and has admin role
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    if (!request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Get invite data
    const inviteData = await redis.hGetAll(`invite:${code}`);
    
    if (!inviteData || !inviteData.code) {
      return reply.status(404).send({ error: 'Invite not found' });
    }
    
    const isExpired = new Date(inviteData.expiresAt) < new Date();
    
    return {
      success: true,
      invite: {
        ...inviteData,
        isExpired,
      },
    };
  } catch (error) {
    console.error('Error getting invite:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Delete an invite code
export const deleteInvite = async (
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply
) => {
  try {
    const { code } = request.params;
    
    // Check if user is authenticated and has admin role
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    
    if (!request.user.roles?.includes('admin')) {
      return reply.status(403).send({ error: 'Forbidden' });
    }
    
    // Check if invite exists
    const exists = await redis.exists(`invite:${code}`);
    
    if (!exists) {
      return reply.status(404).send({ error: 'Invite not found' });
    }
    
    // Get invite data to find the creator
    const inviteData = await redis.hGetAll(`invite:${code}`);
    
    // Delete the invite
    await redis.del(`invite:${code}`);
    
    // Remove from global invites set
    await redis.zRem('invites', code);
    
    // Remove from creator's invites set if we have the data
    if (inviteData.createdBy) {
      await redis.sRem(`user:${inviteData.createdBy}:invites`, code);
    }
    
    return {
      success: true,
      message: 'Invite deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting invite:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

// Validate an invite code (for signup)
export const validateInvite = async (
  request: FastifyRequest<{ Params: { code: string } }>,
  reply: FastifyReply
) => {
  try {
    const { code } = request.params;
    
    // Get invite data
    const inviteData = await redis.hGetAll(`invite:${code}`);
    
    if (!inviteData || !inviteData.code) {
      return reply.status(404).send({ 
        valid: false,
        error: 'Invalid or expired invite code',
      });
    }
    
    // Check if invite is expired
    const isExpired = new Date(inviteData.expiresAt) < new Date();
    
    if (isExpired) {
      return reply.status(400).send({
        valid: false,
        error: 'This invite code has expired',
      });
    }
    
    // Check if invite has reached max uses
    const useCount = parseInt(inviteData.useCount || '0', 10);
    const maxUses = parseInt(inviteData.maxUses || '1', 10);
    
    if (useCount >= maxUses) {
      return reply.status(400).send({
        valid: false,
        error: 'This invite code has reached its maximum number of uses',
      });
    }
    
    // Return valid invite data (without sensitive info)
    return {
      valid: true,
      role: inviteData.role || 'player',
      createdBy: inviteData.createdBy,
      expiresAt: inviteData.expiresAt,
    };
  } catch (error) {
    console.error('Error validating invite:', error);
    return reply.status(500).send({ 
      valid: false,
      error: 'Internal server error',
    });
  }
};

// Mark an invite as used
export const useInvite = async (
  code: string,
  userId: string
): Promise<{ success: boolean; role?: string; error?: string }> => {
  try {
    // Get invite data
    const inviteData = await redis.hGetAll(`invite:${code}`);
    
    if (!inviteData || !inviteData.code) {
      return { success: false, error: 'Invalid invite code' };
    }
    
    // Check if invite is expired
    const isExpired = new Date(inviteData.expiresAt) < new Date();
    
    if (isExpired) {
      return { success: false, error: 'Invite code has expired' };
    }
    
    // Check if invite has reached max uses
    const useCount = parseInt(inviteData.useCount || '0', 10) + 1;
    const maxUses = parseInt(inviteData.maxUses || '1', 10);
    
    if (useCount > maxUses) {
      return { success: false, error: 'Invite code has reached its maximum number of uses' };
    }
    
    // Update invite use count and mark as used by this user
    await redis.hSet(`invite:${code}`, {
      useCount,
      usedBy: userId,
      usedAt: new Date().toISOString(),
    });
    
    return { 
      success: true, 
      role: inviteData.role || 'player',
    };
  } catch (error) {
    console.error('Error using invite:', error);
    return { success: false, error: 'Failed to use invite code' };
  }
};
