import { FastifyInstance } from 'fastify';
import {
  requestEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/auth.controller';

/**
 * Register authentication routes
 */
export async function authRoutes(fastify: FastifyInstance) {
  // Request email verification
  fastify.post('/auth/request-verification', requestEmailVerification);
  
  // Verify email with token (GET for email links)
  fastify.get('/auth/verify-email', verifyEmail);
  
  // Request password reset
  fastify.post('/auth/request-password-reset', requestPasswordReset);
  
  // Reset password with token
  fastify.post('/auth/reset-password', resetPassword);
}
