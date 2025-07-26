import { v4 as uuidv4 } from 'uuid';
import { getOnboardingService, redisStorage } from '..';
import { UserRole, OnboardingStep, InviteCodeStatus } from '../types/onboarding';

describe('OnboardingService', () => {
  let onboardingService: ReturnType<typeof getOnboardingService>;
  let testUserId: string;
  let testInviteCode: string;
  
  beforeAll(() => {
    onboardingService = getOnboardingService();
  });
  
  beforeEach(async () => {
    // Clear all test data before each test
    await redisStorage.clearAll();
    
    // Create a test user
    testUserId = uuidv4();
    
    // Create a test invite code
    testInviteCode = 'TEST1234';
    await redisStorage.createInviteCode({
      code: testInviteCode,
      createdBy: 'system',
      status: InviteCodeStatus.ACTIVE,
      createdAt: new Date(),
    });
  });
  
  afterAll(async () => {
    await redisStorage.clearAll();
  });
  
  describe('User Management', () => {
    test('should create a new user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      };
      
      const user = await onboardingService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.displayName).toBe(userData.displayName);
      expect(user.roles).toContain(UserRole.PLAYER);
      expect(user.isVerified).toBe(false);
      
      // Verify profile was created
      const profile = await onboardingService.getProfile(user.id);
      expect(profile).toBeDefined();
      expect(profile?.userId).toBe(user.id);
      expect(profile?.currentStep).toBe(OnboardingStep.PROFILE_SETUP);
    });
    
    test('should not allow duplicate usernames', async () => {
      const userData = {
        username: 'duplicate',
        email: 'test1@example.com',
        password: 'password123',
      };
      
      // First user should succeed
      await onboardingService.createUser(userData);
      
      // Second user with same username should fail
      await expect(
        onboardingService.createUser({
          ...userData,
          email: 'test2@example.com',
        })
      ).rejects.toThrow('Username already taken');
    });
    
    test('should not allow duplicate emails', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password123',
      };
      
      // First user should succeed
      await onboardingService.createUser(userData);
      
      // Second user with same email should fail
      await expect(
        onboardingService.createUser({
          ...userData,
          username: 'user2',
        })
      ).rejects.toThrow('Email already in use');
    });
  });
  
  describe('Profile Management', () => {
    test('should update user profile', async () => {
      const userId = uuidv4();
      await onboardingService.createUser({
        username: 'profiletest',
        email: 'profile@example.com',
        password: 'password123',
      });
      
      const updateData = {
        bio: 'Test bio',
        location: 'Test Location',
        website: 'https://example.com',
        socialLinks: {
          twitter: 'https://twitter.com/test',
          discord: 'testuser#1234',
        },
      };
      
      const updatedProfile = await onboardingService.updateProfile(userId, updateData);
      
      expect(updatedProfile.bio).toBe(updateData.bio);
      expect(updatedProfile.location).toBe(updateData.location);
      expect(updatedProfile.website).toBe(updateData.website);
      expect(updatedProfile.socialLinks).toEqual(updateData.socialLinks);
    });
    
    test('should complete onboarding steps', async () => {
      const userId = uuidv4();
      await onboardingService.createUser({
        username: 'steptest',
        email: 'step@example.com',
        password: 'password123',
      });
      
      // Complete profile setup
      let status = await onboardingService.completeOnboardingStep(userId, {
        step: OnboardingStep.PROFILE_SETUP,
        data: { displayName: 'Step Test User' },
      });
      
      expect(status.currentStep).toBe(OnboardingStep.ROLE_SELECTION);
      expect(status.completedSteps).toContain(OnboardingStep.PROFILE_SETUP);
      
      // Complete role selection
      status = await onboardingService.completeOnboardingStep(userId, {
        step: OnboardingStep.ROLE_SELECTION,
        data: { roles: [UserRole.PLAYER, UserRole.CREATOR] },
      });
      
      expect(status.currentStep).toBe(OnboardingStep.PREFERENCES);
      expect(status.completedSteps).toContain(OnboardingStep.ROLE_SELECTION);
      
      // Complete preferences
      status = await onboardingService.completeOnboardingStep(userId, {
        step: OnboardingStep.PREFERENCES,
        data: { theme: 'dark', notifications: true },
      });
      
      expect(status.currentStep).toBe(OnboardingStep.COMPLETED);
      expect(status.completedSteps).toContain(OnboardingStep.PREFERENCES);
      expect(status.isComplete).toBe(true);
      expect(status.progress).toBe(100);
    });
  });
  
  describe('Invite Codes', () => {
    test('should generate invite codes', async () => {
      const userId = uuidv4();
      const codes = await onboardingService.generateInviteCodes(userId, {
        count: 3,
        expiresInDays: 30,
      });
      
      expect(codes).toHaveLength(3);
      expect(codes[0].createdBy).toBe(userId);
      expect(codes[0].status).toBe(InviteCodeStatus.ACTIVE);
      expect(codes[0].code).toHaveLength(8);
      
      // Verify codes were stored
      const userCodes = await redisStorage.getUserInviteCodes(userId);
      expect(userCodes).toHaveLength(3);
    });
    
    test('should validate invite codes', async () => {
      // Valid code
      let isValid = await onboardingService.validateInviteCode(testInviteCode);
      expect(isValid).toBe(true);
      
      // Invalid code
      isValid = await onboardingService.validateInviteCode('INVALID123');
      expect(isValid).toBe(false);
    });
    
    test('should use invite code', async () => {
      const userId = uuidv4();
      const invite = await onboardingService.useInviteCode(testInviteCode, userId);
      
      expect(invite.status).toBe(InviteCodeStatus.USED);
      expect(invite.usedBy).toBe(userId);
      expect(invite.usedAt).toBeInstanceOf(Date);
      
      // Verify code can't be used again
      await expect(
        onboardingService.useInviteCode(testInviteCode, 'another-user')
      ).rejects.toThrow('Invite code is not active');
    });
  });
  
  describe('Referrals', () => {
    test('should track referrals', async () => {
      // Create referrer and referee users
      const referrerId = uuidv4();
      const refereeId = uuidv4();
      
      // Create a referral
      await onboardingService.createUser({
        username: 'referrer',
        email: 'referrer@example.com',
        password: 'password123',
      });
      
      // Generate invite code for referrer
      const [inviteCode] = await onboardingService.generateInviteCodes(referrerId, { count: 1 });
      
      // Referee uses invite code
      await onboardingService.createUser({
        username: 'referee',
        email: 'referee@example.com',
        password: 'password123',
        inviteCode: inviteCode.code,
      });
      
      // Get referral stats
      const stats = await onboardingService.getReferralStats(referrerId);
      
      expect(stats.totalReferrals).toBe(1);
      expect(stats.activeReferrals).toBe(1);
    });
  });
});
