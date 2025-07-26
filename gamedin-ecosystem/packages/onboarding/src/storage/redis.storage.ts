import Redis from 'ioredis';
import {
  BaseUser,
  InviteCode,
  InviteCodeStatus,
  OnboardingProfile,
  Referral,
  UserRole,
} from '../types/onboarding';

const DEFAULT_EXPIRY = 60 * 60 * 24 * 30; // 30 days in seconds

export class RedisStorage {
  private redis: Redis;
  
  // Key patterns
  private userKey = (userId: string) => `user:${userId}`;
  private userEmailKey = (email: string) => `user:email:${email.toLowerCase()}`;
  private usernameKey = (username: string) => `user:username:${username.toLowerCase()}`;
  private profileKey = (userId: string) => `profile:${userId}`;
  private inviteCodeKey = (code: string) => `invite:code:${code}`;
  private userInvitesKey = (userId: string) => `user:${userId}:invites`;
  private referralKey = (referrerId: string, refereeId: string) => `referral:${referrerId}:${refereeId}`;
  private userReferralsKey = (userId: string) => `user:${userId}:referrals`;

  constructor(redisUrl?: string) {
    this.redis = redisUrl ? new Redis(redisUrl) : new Redis();
  }

  // User methods
  async createUser(user: BaseUser): Promise<boolean> {
    const { id, email, username } = user;
    const userKey = this.userKey(id);
    const pipeline = this.redis.pipeline();
    
    // Store user data
    pipeline.hmset(userKey, this.serializeUser(user));
    
    // Create indexes for lookup
    if (email) {
      pipeline.set(this.userEmailKey(email), id);
    }
    pipeline.set(this.usernameKey(username), id);
    
    const results = await pipeline.exec();
    return results.every(([err]) => !err);
  }

  async getUserById(userId: string): Promise<BaseUser | null> {
    const userData = await this.redis.hgetall(this.userKey(userId));
    return Object.keys(userData).length ? this.deserializeUser(userData) : null;
  }

  async getUserByEmail(email: string): Promise<BaseUser | null> {
    const userId = await this.redis.get(this.userEmailKey(email));
    return userId ? this.getUserById(userId) : null;
  }

  async getUserByUsername(username: string): Promise<BaseUser | null> {
    const userId = await this.redis.get(this.usernameKey(username));
    return userId ? this.getUserById(userId) : null;
  }

  async updateUser(userId: string, updateData: Partial<BaseUser>): Promise<boolean> {
    const userKey = this.userKey(userId);
    const user = await this.getUserById(userId);
    
    if (!user) return false;
    
    const updatedUser = { ...user, ...updateData, updatedAt: new Date() };
    const pipeline = this.redis.pipeline();
    
    // Update user data
    pipeline.hmset(userKey, this.serializeUser(updatedUser));
    
    // Update email index if changed
    if (updateData.email && updateData.email !== user.email) {
      if (user.email) {
        pipeline.del(this.userEmailKey(user.email));
      }
      pipeline.set(this.userEmailKey(updateData.email), userId);
    }
    
    // Update username index if changed
    if (updateData.username && updateData.username !== user.username) {
      pipeline.del(this.usernameKey(user.username));
      pipeline.set(this.usernameKey(updateData.username), userId);
    }
    
    const results = await pipeline.exec();
    return results.every(([err]) => !err);
  }

  // Profile methods
  async getProfile(userId: string): Promise<OnboardingProfile | null> {
    const profileData = await this.redis.hgetall(this.profileKey(userId));
    return Object.keys(profileData).length ? this.deserializeProfile(profileData) : null;
  }

  async updateProfile(userId: string, profile: Partial<OnboardingProfile>): Promise<boolean> {
    const profileKey = this.profileKey(userId);
    const existingProfile = await this.getProfile(userId) || {} as OnboardingProfile;
    
    const updatedProfile = { 
      ...existingProfile, 
      ...profile, 
      userId,
      updatedAt: new Date() 
    };
    
    const result = await this.redis.hmset(profileKey, this.serializeProfile(updatedProfile));
    return result === 'OK';
  }

  // Invite code methods
  async createInviteCode(inviteCode: InviteCode): Promise<boolean> {
    const { code, createdBy } = inviteCode;
    const inviteKey = this.inviteCodeKey(code);
    const userInvitesKey = this.userInvitesKey(createdBy);
    
    const pipeline = this.redis.pipeline();
    
    // Store invite code
    pipeline.hmset(inviteKey, this.serializeInviteCode(inviteCode));
    
    // Set expiry if provided
    if (inviteCode.expiresAt) {
      const ttl = Math.ceil((inviteCode.expiresAt.getTime() - Date.now()) / 1000);
      if (ttl > 0) {
        pipeline.expire(inviteKey, ttl);
      }
    }
    
    // Add to user's invite code set
    pipeline.sadd(userInvitesKey, code);
    
    const results = await pipeline.exec();
    return results.every(([err]) => !err);
  }

  async getInviteCode(code: string): Promise<InviteCode | null> {
    const inviteData = await this.redis.hgetall(this.inviteCodeKey(code));
    return Object.keys(inviteData).length ? this.deserializeInviteCode(inviteData) : null;
  }

  async updateInviteCode(code: string, updateData: Partial<InviteCode>): Promise<boolean> {
    const inviteKey = this.inviteCodeKey(code);
    const invite = await this.getInviteCode(code);
    
    if (!invite) return false;
    
    const updatedInvite = { ...invite, ...updateData, updatedAt: new Date() };
    const result = await this.redis.hmset(inviteKey, this.serializeInviteCode(updatedInvite));
    return result === 'OK';
  }

  async getUserInviteCodes(userId: string): Promise<InviteCode[]> {
    const userInvitesKey = this.userInvitesKey(userId);
    const codes = await this.redis.smembers(userInvitesKey);
    
    if (codes.length === 0) return [];
    
    const pipeline = this.redis.pipeline();
    codes.forEach(code => pipeline.hgetall(this.inviteCodeKey(code)));
    
    const results = await pipeline.exec();
    return results
      .map(([err, data]) => err ? null : this.deserializeInviteCode(data as any))
      .filter((invite): invite is InviteCode => invite !== null);
  }

  // Referral methods
  async createReferral(referral: Referral): Promise<boolean> {
    const { referrerId, refereeId } = referral;
    const referralKey = this.referralKey(referrerId, refereeId);
    const userReferralsKey = this.userReferralsKey(referrerId);
    
    const pipeline = this.redis.pipeline();
    
    // Store referral
    pipeline.hmset(referralKey, this.serializeReferral(referral));
    
    // Add to user's referral set
    pipeline.sadd(userReferralsKey, refereeId);
    
    const results = await pipeline.exec();
    return results.every(([err]) => !err);
  }

  async getReferral(referrerId: string, refereeId: string): Promise<Referral | null> {
    const referralData = await this.redis.hgetall(this.referralKey(referrerId, refereeId));
    return Object.keys(referralData).length ? this.deserializeReferral(referralData) : null;
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    const userReferralsKey = this.userReferralsKey(userId);
    const refereeIds = await this.redis.smembers(userReferralsKey);
    
    if (refereeIds.length === 0) return [];
    
    const pipeline = this.redis.pipeline();
    refereeIds.forEach(refereeId => pipeline.hgetall(this.referralKey(userId, refereeId)));
    
    const results = await pipeline.exec();
    return results
      .map(([err, data]) => err ? null : this.deserializeReferral(data as any))
      .filter((referral): referral is Referral => referral !== null);
  }

  // Serialization/deserialization helpers
  private serializeUser(user: BaseUser): Record<string, string> {
    return {
      id: user.id,
      email: user.email || '',
      username: user.username,
      displayName: user.displayName || '',
      avatar: user.avatar || '',
      roles: JSON.stringify(user.roles),
      isVerified: String(user.isVerified),
      isActive: String(user.isActive),
      metadata: JSON.stringify(user.metadata || {}),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString() || '',
    };
  }

  private deserializeUser(data: Record<string, string>): BaseUser {
    return {
      id: data.id,
      email: data.email || undefined,
      username: data.username,
      displayName: data.displayName || undefined,
      avatar: data.avatar || undefined,
      roles: JSON.parse(data.roles) as UserRole[],
      isVerified: data.isVerified === 'true',
      isActive: data.isActive === 'true',
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private serializeProfile(profile: OnboardingProfile): Record<string, string> {
    return {
      userId: profile.userId,
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      socialLinks: JSON.stringify(profile.socialLinks || {}),
      preferences: JSON.stringify(profile.preferences || {}),
      completedSteps: JSON.stringify(profile.completedSteps || []),
      currentStep: profile.currentStep,
      isOnboardingComplete: String(profile.isOnboardingComplete || false),
      completedAt: profile.completedAt?.toISOString() || '',
      metadata: JSON.stringify(profile.metadata || {}),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt?.toISOString() || '',
    };
  }

  private deserializeProfile(data: Record<string, string>): OnboardingProfile {
    return {
      userId: data.userId,
      bio: data.bio || undefined,
      location: data.location || undefined,
      website: data.website || undefined,
      socialLinks: data.socialLinks ? JSON.parse(data.socialLinks) : {},
      preferences: data.preferences ? JSON.parse(data.preferences) : {},
      completedSteps: data.completedSteps ? JSON.parse(data.completedSteps) : [],
      currentStep: data.currentStep as any,
      isOnboardingComplete: data.isOnboardingComplete === 'true',
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private serializeInviteCode(inviteCode: InviteCode): Record<string, string> {
    return {
      code: inviteCode.code,
      createdBy: inviteCode.createdBy,
      usedBy: inviteCode.usedBy || '',
      usedAt: inviteCode.usedAt?.toISOString() || '',
      status: inviteCode.status,
      expiresAt: inviteCode.expiresAt?.toISOString() || '',
      metadata: JSON.stringify(inviteCode.metadata || {}),
      createdAt: inviteCode.createdAt.toISOString(),
      updatedAt: inviteCode.updatedAt?.toISOString() || '',
    };
  }

  private deserializeInviteCode(data: Record<string, string>): InviteCode {
    return {
      code: data.code,
      createdBy: data.createdBy,
      usedBy: data.usedBy || undefined,
      usedAt: data.usedAt ? new Date(data.usedAt) : undefined,
      status: data.status as InviteCodeStatus,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  private serializeReferral(referral: Referral): Record<string, string> {
    return {
      referrerId: referral.referrerId,
      refereeId: referral.refereeId,
      source: referral.source,
      inviteCode: referral.inviteCode || '',
      metadata: JSON.stringify(referral.metadata || {}),
      createdAt: referral.createdAt.toISOString(),
    };
  }

  private deserializeReferral(data: Record<string, string>): Referral {
    return {
      referrerId: data.referrerId,
      refereeId: data.refereeId,
      source: data.source as any,
      inviteCode: data.inviteCode || undefined,
      metadata: data.metadata ? JSON.parse(data.metadata) : {},
      createdAt: new Date(data.createdAt),
    };
  }

  // Cleanup method for testing
  async clearAll(): Promise<void> {
    const keys = await this.redis.keys('*');
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}

export const redisStorage = new RedisStorage(process.env.REDIS_URL);
