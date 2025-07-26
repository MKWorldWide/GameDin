import { AuthService as CoreAuthService } from '@gamedin/auth';
import { getOnboardingService } from './onboarding.service';
import { UserRole } from '@gamedin/shared/types/user';
import { OnboardingStep } from '../types/onboarding';

/**
 * Service to handle integration between auth and onboarding services
 */
export class AuthIntegrationService {
  private static instance: AuthIntegrationService;
  private onboardingService = getOnboardingService();

  private constructor() {}

  public static getInstance(): AuthIntegrationService {
    if (!AuthIntegrationService.instance) {
      AuthIntegrationService.instance = new AuthIntegrationService();
    }
    return AuthIntegrationService.instance;
  }

  /**
   * Handle successful user registration
   */
  public async handleUserRegistered(
    userId: string,
    email: string,
    username: string,
    displayName?: string
  ): Promise<void> {
    try {
      // Create onboarding profile for the new user
      await this.onboardingService.createUser({
        id: userId,
        email,
        username,
        displayName,
        roles: [UserRole.PLAYER],
        isVerified: false,
        isActive: true,
        metadata: {
          registrationDate: new Date().toISOString(),
        },
      });

      // Send welcome email (will be implemented in email service)
      await this.sendWelcomeEmail(email, username);

      // Log the registration event
      console.log(`User ${username} (${userId}) registered successfully`);
    } catch (error) {
      console.error('Error in handleUserRegistered:', error);
      // In a production environment, you might want to implement a retry mechanism
      // or send an alert to the operations team
    }
  }

  /**
   * Handle successful user login
   */
  public async handleUserLogin(userId: string): Promise<void> {
    try {
      const profile = await this.onboardingService.getProfile(userId);
      
      // If onboarding is not complete, update the last login time
      if (profile && !profile.isOnboardingComplete) {
        await this.onboardingService.updateProfile(userId, {
          lastLogin: new Date(),
        });
      }
      
      // You could add additional logic here, such as:
      // - Sending login notifications
      // - Updating user activity metrics
      // - Triggering post-login workflows
    } catch (error) {
      console.error('Error in handleUserLogin:', error);
    }
  }

  /**
   * Check if a user has completed onboarding
   */
  public async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const profile = await this.onboardingService.getProfile(userId);
      return profile?.isOnboardingComplete || false;
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Get the current onboarding status for a user
   */
  public async getOnboardingStatus(userId: string) {
    try {
      return await this.onboardingService.getOnboardingStatus(userId);
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return null;
    }
  }

  /**
   * Complete an onboarding step
   */
  public async completeOnboardingStep(
    userId: string,
    step: OnboardingStep,
    data: Record<string, any>
  ) {
    try {
      return await this.onboardingService.completeOnboardingStep(userId, {
        step,
        data,
      });
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      throw error;
    }
  }

  /**
   * Send welcome email to new users
   */
  private async sendWelcomeEmail(email: string, username: string): Promise<void> {
    // This is a placeholder for the email sending logic
    // In a real implementation, you would use an email service like SendGrid, SES, etc.
    console.log(`Sending welcome email to ${email}`);
    
    // Example implementation with a mock email service:
    /*
    try {
      await emailService.send({
        to: email,
        subject: 'Welcome to GameDin!',
        template: 'welcome',
        context: {
          username,
          verifyLink: `${process.env.APP_URL}/verify-email?token=${verificationToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // You might want to implement a retry mechanism or alert the team
    }
    */
  }
}

// Export a singleton instance
export const authIntegrationService = AuthIntegrationService.getInstance();
