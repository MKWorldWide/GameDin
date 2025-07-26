import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { emailService } from '../services/email.service';
import { redisStorage } from '../storage/redis.storage';
import { authConfig } from '../config/auth.config';
import { TokenService } from '@gamedin/auth';

// Request validation schemas
const requestVerificationSchema = z.object({
  email: z.string().email(),
  redirectUrl: z.string().url().optional(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
  redirectUrl: z.string().url().optional(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * Request email verification
 */
export const requestEmailVerification = async (
  request: FastifyRequest<{ Body: z.infer<typeof requestVerificationSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { email, redirectUrl } = requestVerificationSchema.parse(request.body);
    
    // In a real app, you would look up the user by email
    // For now, we'll assume the user exists
    const user = await redisStorage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { success: true };
    }
    
    // Generate verification token
    const token = TokenService.generateVerificationToken(user.id);
    
    // Store token in Redis with 24h expiry
    await redisStorage.setVerificationToken(user.id, token);
    
    // Send verification email
    await emailService.sendVerificationEmail(
      user.id,
      user.email,
      user.username,
      redirectUrl
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting email verification:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (
  request: FastifyRequest<{ Querystring: { token: string } }>,
  reply: FastifyReply
) => {
  try {
    const { token } = verifyEmailSchema.parse(request.query);
    
    // Verify token
    const payload = TokenService.verifyVerificationToken(token);
    if (!payload) {
      return reply.status(400).send({ error: 'Invalid or expired token' });
    }
    
    // Mark email as verified
    const updated = await redisStorage.updateUser(payload.userId, {
      isVerified: true,
      verifiedAt: new Date(),
    });
    
    if (!updated) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    // Clear verification token
    await redisStorage.clearVerificationToken(payload.userId);
    
    // Redirect to success page or return success response
    const redirectUrl = `${authConfig.APP_URL}/email-verified`;
    return reply.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Error verifying email:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  request: FastifyRequest<{ Body: z.infer<typeof requestPasswordResetSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { email, redirectUrl } = requestPasswordResetSchema.parse(request.body);
    
    // In a real app, you would look up the user by email
    const user = await redisStorage.getUserByEmail(email);
    
    if (!user) {
      // Don't reveal that the email doesn't exist
      return { success: true };
    }
    
    // Generate password reset token
    const token = TokenService.generatePasswordResetToken(user.id);
    
    // Store token in Redis with 15m expiry
    await redisStorage.setPasswordResetToken(user.id, token);
    
    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.id,
      user.email,
      user.username,
      redirectUrl
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  request: FastifyRequest<{ Body: z.infer<typeof resetPasswordSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(request.body);
    
    // Verify token
    const payload = TokenService.verifyPasswordResetToken(token);
    if (!payload) {
      return reply.status(400).send({ error: 'Invalid or expired token' });
    }
    
    // Check if token exists in Redis
    const storedToken = await redisStorage.getPasswordResetToken(payload.userId);
    if (!storedToken || storedToken !== token) {
      return reply.status(400).send({ error: 'Invalid or expired token' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    const updated = await redisStorage.updateUser(payload.userId, {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });
    
    if (!updated) {
      return reply.status(404).send({ error: 'User not found' });
    }
    
    // Clear password reset token
    await redisStorage.clearPasswordResetToken(payload.userId);
    
    // Invalidate all user sessions (optional)
    await redisStorage.invalidateUserSessions(payload.userId);
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};
