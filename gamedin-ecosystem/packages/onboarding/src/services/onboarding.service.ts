import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { redisStorage } from '../storage/redis.storage';
import {
  BaseUser,
  CompleteOnboardingStepDto,
  CreateUserDto,
  GenerateInviteCodesDto,
  InviteCode,
  InviteCodeStatus,
  IOnboardingService,
  OnboardingProfile,
  OnboardingStatus,
  OnboardingStep,
  Referral,
  ReferralSource,
  ReferralStats,
  UpdateProfileDto,
  UserRole,
} from '../types/onboarding';

const SALT_ROUNDS = 10;
const INVITE_CODE_LENGTH = 8;
const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing characters

export class OnboardingService implements IOnboardingService {
  private readonly logger = console; // Replace with a proper logger in production

  // User management
  async createUser(userData: CreateUserDto): Promise<BaseUser> {
    // Validate email uniqueness if provided
    if (userData.email) {
      const existingUser = await redisStorage.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Validate username uniqueness
    const existingUsername = await redisStorage.getUserByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user
    const userId = uuidv4();
    const newUser: BaseUser = {
      id: userId,
      email: userData.email,
      username: userData.username,
      displayName: userData.displayName || userData.username,
      avatar: userData.avatar,
      roles: [UserRole.PLAYER], // Default role
      isVerified: false,
      isActive: true,
      metadata: {
        ...userData.metadata,
        registrationDate: new Date().toISOString(),
      },
      createdAt: new Date(),
    };

    // Store user in database
    await redisStorage.createUser(newUser);

    // Create default profile
    const profile: OnboardingProfile = {
      userId,
      preferences: {},
      completedSteps: [OnboardingStep.INITIAL],
      currentStep: OnboardingStep.PROFILE_SETUP,
      isOnboardingComplete: false,
      metadata: {},
      createdAt: new Date(),
    };

    await redisStorage.updateProfile(userId, profile);

    // Handle invite code if provided
    if (userData.inviteCode) {
      try {
        await this.useInviteCode(userData.inviteCode, userId);
      } catch (error) {
        this.logger.warn(`Failed to use invite code: ${error.message}`);
      }
    }

    // Handle referral source
    if (userData.referralSource) {
      // In a real app, you might want to track the referrer here
      this.logger.info(`User ${userId} was referred via ${userData.referralSource}`);
    }

    return newUser;
  }

  async getUserById(userId: string): Promise<BaseUser | null> {
    return redisStorage.getUserById(userId);
  }

  async updateUser(userId: string, updateData: Partial<BaseUser>): Promise<BaseUser | null> {
    const success = await redisStorage.updateUser(userId, updateData);
    return success ? this.getUserById(userId) : null;
  }

  // Profile management
  async getProfile(userId: string): Promise<OnboardingProfile | null> {
    return redisStorage.getProfile(userId);
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto): Promise<OnboardingProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedProfile = { ...profile, ...updateData, updatedAt: new Date() };
    await redisStorage.updateProfile(userId, updatedProfile);
    return updatedProfile;
  }

  async completeOnboardingStep(userId: string, stepData: CompleteOnboardingStepDto): Promise<OnboardingStatus> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Update completed steps if not already completed
    const updatedSteps = [...new Set([...profile.completedSteps, stepData.step])];
    
    // Determine next step
    let nextStep: OnboardingStep | undefined;
    const allSteps = Object.values(OnboardingStep);
    const currentIndex = allSteps.indexOf(stepData.step);
    
    if (currentIndex < allSteps.length - 1) {
      nextStep = allSteps[currentIndex + 1];
    }

    // Update profile
    const updatedProfile: OnboardingProfile = {
      ...profile,
      completedSteps: updatedSteps,
      currentStep: nextStep || profile.currentStep,
      isOnboardingComplete: nextStep === undefined,
      updatedAt: new Date(),
    };

    if (nextStep === undefined) {
      updatedProfile.completedAt = new Date();
    }

    await redisStorage.updateProfile(userId, updatedProfile);
    return this.getOnboardingStatus(userId);
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const allSteps = Object.values(OnboardingStep);
    const progress = Math.round((profile.completedSteps.length / allSteps.length) * 100);
    
    // Determine required fields based on current step
    let requiredFields: string[] = [];
    switch (profile.currentStep) {
      case OnboardingStep.PROFILE_SETUP:
        requiredFields = ['displayName', 'avatar'];
        break;
      case OnboardingStep.ROLE_SELECTION:
        requiredFields = ['roles'];
        break;
      case OnboardingStep.PREFERENCES:
        requiredFields = ['preferences'];
        break;
    }

    return {
      userId,
      currentStep: profile.currentStep,
      completedSteps: profile.completedSteps,
      isComplete: profile.isOnboardingComplete,
      nextStep: this.getNextStep(profile.currentStep),
      progress,
      requiredFields,
    };
  }

  // Invite code management
  async generateInviteCodes(userId: string, options: GenerateInviteCodesDto): Promise<InviteCode[]> {
    const codes: InviteCode[] = [];
    
    for (let i = 0; i < options.count; i++) {
      const code = this.generateRandomCode(INVITE_CODE_LENGTH);
      const expiresAt = options.expiresInDays 
        ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;
      
      const inviteCode: InviteCode = {
        code,
        createdBy: userId,
        status: InviteCodeStatus.ACTIVE,
        expiresAt,
        metadata: {
          ...options.metadata,
          batchId: options.metadata?.batchId || uuidv4(),
        },
        createdAt: new Date(),
      };

      await redisStorage.createInviteCode(inviteCode);
      codes.push(inviteCode);
    }

    return codes;
  }

  async validateInviteCode(code: string): Promise<boolean> {
    const invite = await redisStorage.getInviteCode(code);
    if (!invite) return false;
    
    // Check if code is active
    if (invite.status !== InviteCodeStatus.ACTIVE) return false;
    
    // Check if code is expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await redisStorage.updateInviteCode(code, { status: InviteCodeStatus.REVOKED });
      return false;
    }
    
    return true;
  }

  async useInviteCode(code: string, userId: string): Promise<InviteCode> {
    const invite = await redisStorage.getInviteCode(code);
    if (!invite) {
      throw new Error('Invalid invite code');
    }

    if (invite.status !== InviteCodeStatus.ACTIVE) {
      throw new Error('Invite code is not active');
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await redisStorage.updateInviteCode(code, { status: InviteCodeStatus.REVOKED });
      throw new Error('Invite code has expired');
    }

    // Mark code as used
    await redisStorage.updateInviteCode(code, {
      status: InviteCodeStatus.USED,
      usedBy: userId,
      usedAt: new Date(),
    });

    // Create referral if applicable
    if (invite.createdBy !== userId) {
      const referral: Referral = {
        referrerId: invite.createdBy,
        refereeId: userId,
        source: ReferralSource.INVITE_CODE,
        inviteCode: code,
        metadata: {},
        createdAt: new Date(),
      };

      await redisStorage.createReferral(referral);
    }

    return { ...invite, status: InviteCodeStatus.USED, usedBy: userId, usedAt: new Date() };
  }

  // Referral management
  async getReferralStats(userId: string): Promise<ReferralStats> {
    const referrals = await redisStorage.getUserReferrals(userId);
    const activeReferrals = referrals.filter(r => {
      // In a real app, you might have more sophisticated logic to determine active referrals
      const referralDate = new Date(r.createdAt);
      const daysSinceReferral = (Date.now() - referralDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceReferral <= 30; // Active if referred within last 30 days
    });

    // In a real app, you might check if referred users have completed certain actions
    const convertedReferrals = referrals.filter(r => {
      // This is a placeholder - implement actual conversion logic
      return Math.random() > 0.5; // 50% conversion rate for demo
    });

    return {
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      pendingVerification: 0, // Implement verification logic if needed
      convertedReferrals: convertedReferrals.length,
      conversionRate: referrals.length > 0 ? (convertedReferrals.length / referrals.length) * 100 : 0,
      recentReferrals: referrals.slice(0, 10), // Return most recent 10 referrals
    };
  }

  async getReferralTree(userId: string, depth: number = 2): Promise<Referral[]> {
    // In a real implementation, this would recursively fetch referrals
    // For now, just return direct referrals
    return redisStorage.getUserReferrals(userId);
  }

  // Admin methods
  async getPendingVerifications(): Promise<BaseUser[]> {
    // In a real implementation, this would fetch users pending verification
    // For now, return an empty array
    return [];
  }

  async verifyUser(userId: string, verifiedBy: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isVerified = true;
    user.metadata = {
      ...user.metadata,
      verifiedBy,
      verifiedAt: new Date().toISOString(),
    };

    return !!(await this.updateUser(userId, user));
  }

  async revokeInviteCode(code: string, revokedBy: string): Promise<boolean> {
    const invite = await redisStorage.getInviteCode(code);
    if (!invite) {
      throw new Error('Invite code not found');
    }

    if (invite.status !== InviteCodeStatus.ACTIVE) {
      throw new Error('Only active invite codes can be revoked');
    }

    return redisStorage.updateInviteCode(code, {
      status: InviteCodeStatus.REVOKED,
      metadata: {
        ...invite.metadata,
        revokedBy,
        revokedAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    });
  }

  // Helper methods
  private generateRandomCode(length: number): string {
    return Array.from(
      { length },
      () => INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)]
    ).join('');
  }

  private getNextStep(currentStep: OnboardingStep): OnboardingStep | undefined {
    const steps = Object.values(OnboardingStep);
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : undefined;
  }
}

// Singleton instance
let onboardingService: OnboardingService | null = null;

export const getOnboardingService = (): OnboardingService => {
  if (!onboardingService) {
    onboardingService = new OnboardingService();
  }
  return onboardingService;
};

export default getOnboardingService;
