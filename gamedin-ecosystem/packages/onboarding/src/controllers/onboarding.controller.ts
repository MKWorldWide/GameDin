import { FastifyRequest, FastifyReply } from 'fastify';
import { authIntegrationService } from '../services/auth-integration.service';
import { OnboardingStep } from '../types/onboarding';
import { z } from 'zod';

// Request validation schemas
const completeStepSchema = z.object({
  step: z.nativeEnum(OnboardingStep),
  data: z.record(z.any()).optional(),
});

const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string()).optional(),
  preferences: z.record(z.any()).optional(),
});

const validateInviteCodeSchema = z.object({
  code: z.string().min(6).max(20),
});

/**
 * Get the current user's onboarding status
 */
export const getOnboardingStatus = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const status = await authIntegrationService.getOnboardingStatus(userId);
    if (!status) {
      return reply.status(404).send({ error: 'Onboarding status not found' });
    }

    return { status };
  } catch (error) {
    console.error('Error getting onboarding status:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Complete an onboarding step
 */
export const completeOnboardingStep = async (
  request: FastifyRequest<{ Body: z.infer<typeof completeStepSchema> }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const validation = completeStepSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Validation error',
        details: validation.error.issues 
      });
    }

    const { step, data } = validation.data;
    const status = await authIntegrationService.completeOnboardingStep(
      userId,
      step,
      data || {}
    );

    return { status };
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Update user profile during onboarding
 */
export const updateProfile = async (
  request: FastifyRequest<{ Body: z.infer<typeof updateProfileSchema> }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const validation = updateProfileSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Validation error',
        details: validation.error.issues 
      });
    }

    const profile = await authIntegrationService.updateProfile(userId, validation.data);
    return { profile };
  } catch (error) {
    console.error('Error updating profile:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Validate an invite code
 */
export const validateInviteCode = async (
  request: FastifyRequest<{ Body: { code: string } }>,
  reply: FastifyReply
) => {
  try {
    const validation = validateInviteCodeSchema.safeParse(request.body);
    if (!validation.success) {
      return reply.status(400).send({ 
        error: 'Validation error',
        details: validation.error.issues 
      });
    }

    const { code } = validation.data;
    const isValid = await authIntegrationService.validateInviteCode(code);
    
    return { 
      valid: isValid,
      code,
    };
  } catch (error) {
    console.error('Error validating invite code:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Get the current user's referral stats
 */
export const getReferralStats = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const stats = await authIntegrationService.getReferralStats(userId);
    return { stats };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Generate invite codes for the current user
 */
export const generateInviteCodes = async (
  request: FastifyRequest<{ Body: { count?: number; expiresInDays?: number } }>,
  reply: FastifyReply
) => {
  try {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const { count = 1, expiresInDays = 30 } = request.body;
    const codes = await authIntegrationService.generateInviteCodes(
      userId,
      count,
      expiresInDays
    );

    return { codes };
  } catch (error) {
    console.error('Error generating invite codes:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};
