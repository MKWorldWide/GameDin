import { FastifyInstance } from 'fastify';
import {
  getOnboardingStatus,
  completeOnboardingStep,
  updateProfile,
  validateInviteCode,
  getReferralStats,
  generateInviteCodes,
} from '../controllers/onboarding.controller';
import { authenticate } from '../middleware/auth.middleware';

/**
 * Register onboarding routes
 */
export async function onboardingRoutes(fastify: FastifyInstance) {
  // Protected routes (require authentication)
  fastify.register(async (fastify) => {
    // Add authentication middleware to all routes in this group
    fastify.addHook('onRequest', authenticate);

    // Get current user's onboarding status
    fastify.get('/onboarding/status', getOnboardingStatus);

    // Complete an onboarding step
    fastify.post('/onboarding/complete-step', completeOnboardingStep);

    // Update user profile
    fastify.post('/onboarding/profile', updateProfile);

    // Get referral stats
    fastify.get('/onboarding/referrals/stats', getReferralStats);

    // Generate invite codes
    fastify.post('/onboarding/referrals/generate-codes', generateInviteCodes);
  });

  // Public routes (no authentication required)
  
  // Validate an invite code
  fastify.post('/onboarding/validate-invite', validateInviteCode);

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'onboarding' };
  });
}
