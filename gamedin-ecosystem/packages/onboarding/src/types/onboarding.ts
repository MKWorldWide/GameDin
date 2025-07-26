import { z } from 'zod';

export enum UserRole {
  PLAYER = 'player',
  CREATOR = 'creator',
  CURATOR = 'curator',
  ADMIN = 'admin',
}

export enum OnboardingStep {
  INITIAL = 'initial',
  PROFILE_SETUP = 'profile_setup',
  ROLE_SELECTION = 'role_selection',
  PREFERENCES = 'preferences',
  COMPLETED = 'completed',
}

export enum InviteCodeStatus {
  ACTIVE = 'active',
  USED = 'used',
  REVOKED = 'revoked',
}

export enum ReferralSource {
  INVITE_CODE = 'invite_code',
  SOCIAL_MEDIA = 'social_media',
  SEARCH_ENGINE = 'search_engine',
  DIRECT = 'direct',
  OTHER = 'other',
}

// Base schemas
const BaseUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50),
  displayName: z.string().min(2).max(100).optional(),
  avatar: z.string().url().optional(),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
});

export type BaseUser = z.infer<typeof BaseUserSchema>;

// Onboarding schemas
export const OnboardingProfileSchema = z.object({
  userId: z.string().uuid(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().optional(),
  socialLinks: z.record(z.string().url()).optional(),
  preferences: z.record(z.unknown()).optional(),
  completedSteps: z.array(z.nativeEnum(OnboardingStep)).default([]),
  currentStep: z.nativeEnum(OnboardingStep).default(OnboardingStep.INITIAL),
  isOnboardingComplete: z.boolean().default(false),
  completedAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
});

export type OnboardingProfile = z.infer<typeof OnboardingProfileSchema>;

export const InviteCodeSchema = z.object({
  code: z.string().length(8).regex(/^[A-Z0-9]+$/),
  createdBy: z.string().uuid(),
  usedBy: z.string().uuid().optional(),
  usedAt: z.date().optional(),
  status: z.nativeEnum(InviteCodeStatus).default(InviteCodeStatus.ACTIVE),
  expiresAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
});

export type InviteCode = z.infer<typeof InviteCodeSchema>;

export const ReferralSchema = z.object({
  referrerId: z.string().uuid(),
  refereeId: z.string().uuid(),
  source: z.nativeEnum(ReferralSource).default(ReferralSource.DIRECT),
  inviteCode: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
});

export type Referral = z.infer<typeof ReferralSchema>;

// DTOs
export const CreateUserDto = BaseUserSchema.pick({
  email: true,
  username: true,
  displayName: true,
  avatar: true,
}).extend({
  password: z.string().min(8),
  inviteCode: z.string().optional(),
  referralSource: z.nativeEnum(ReferralSource).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateProfileDto = OnboardingProfileSchema.partial().pick({
  bio: true,
  location: true,
  website: true,
  socialLinks: true,
  preferences: true,
  metadata: true,
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileDto>;

export const CompleteOnboardingStepDto = z.object({
  step: z.nativeEnum(OnboardingStep),
  data: z.record(z.unknown()).optional(),
});

export type CompleteOnboardingStepDto = z.infer<typeof CompleteOnboardingStepDto>;

export const GenerateInviteCodesDto = z.object({
  count: z.number().int().min(1).max(10).default(1),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type GenerateInviteCodesDto = z.infer<typeof GenerateInviteCodesDto>;

// Response types
export interface OnboardingStatus {
  userId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isComplete: boolean;
  nextStep?: OnboardingStep;
  progress: number;
  requiredFields: string[];
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingVerification: number;
  convertedReferrals: number;
  conversionRate: number;
  recentReferrals: Referral[];
}

// Service interfaces
export interface IOnboardingService {
  // User management
  createUser(userData: CreateUserDto): Promise<BaseUser>;
  getUserById(userId: string): Promise<BaseUser | null>;
  updateUser(userId: string, updateData: Partial<BaseUser>): Promise<BaseUser | null>;
  
  // Profile management
  getProfile(userId: string): Promise<OnboardingProfile | null>;
  updateProfile(userId: string, updateData: UpdateProfileDto): Promise<OnboardingProfile>;
  completeOnboardingStep(userId: string, stepData: CompleteOnboardingStepDto): Promise<OnboardingStatus>;
  getOnboardingStatus(userId: string): Promise<OnboardingStatus>;
  
  // Invite codes
  generateInviteCodes(userId: string, options: GenerateInviteCodesDto): Promise<InviteCode[]>;
  validateInviteCode(code: string): Promise<boolean>;
  useInviteCode(code: string, userId: string): Promise<InviteCode>;
  
  // Referrals
  getReferralStats(userId: string): Promise<ReferralStats>;
  getReferralTree(userId: string, depth?: number): Promise<Referral[]>;
  
  // Admin
  getPendingVerifications(): Promise<BaseUser[]>;
  verifyUser(userId: string, verifiedBy: string): Promise<boolean>;
  revokeInviteCode(code: string, revokedBy: string): Promise<boolean>;
}
