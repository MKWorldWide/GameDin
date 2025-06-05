import { initialize, LDClient } from 'launchdarkly-js-client-sdk';

interface FeatureFlags {
  enableRealtimeChat: boolean;
  enableGameRecommendations: boolean;
  enableAchievements: boolean;
  enableSocialFeatures: boolean;
  enableDarkMode: boolean;
  enableBetaFeatures: boolean;
}

class FeatureFlagService {
  private client: LDClient | null = null;
  private static instance: FeatureFlagService;

  private constructor() {}

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (!process.env.REACT_APP_LAUNCH_DARKLY_CLIENT_ID) {
      console.error('LaunchDarkly client ID not found');
      return;
    }

    this.client = initialize(
      process.env.REACT_APP_LAUNCH_DARKLY_CLIENT_ID,
      {
        key: userId,
        anonymous: !userId,
        privateAttributes: ['email', 'phoneNumber'],
        custom: {
          groups: [],
          roles: []
        }
      }
    );

    await this.client.waitForInitialization();
  }

  async getFlags(): Promise<FeatureFlags> {
    if (!this.client) {
      return this.getDefaultFlags();
    }

    return {
      enableRealtimeChat: await this.client.variation('enable-realtime-chat', false),
      enableGameRecommendations: await this.client.variation('enable-game-recommendations', false),
      enableAchievements: await this.client.variation('enable-achievements', false),
      enableSocialFeatures: await this.client.variation('enable-social-features', false),
      enableDarkMode: await this.client.variation('enable-dark-mode', true),
      enableBetaFeatures: await this.client.variation('enable-beta-features', false)
    };
  }

  private getDefaultFlags(): FeatureFlags {
    return {
      enableRealtimeChat: process.env.NODE_ENV === 'development',
      enableGameRecommendations: process.env.NODE_ENV === 'development',
      enableAchievements: process.env.NODE_ENV === 'development',
      enableSocialFeatures: process.env.NODE_ENV === 'development',
      enableDarkMode: true,
      enableBetaFeatures: process.env.NODE_ENV === 'development'
    };
  }

  async updateUserContext(context: {
    email?: string;
    groups?: string[];
    roles?: string[];
  }): Promise<void> {
    if (!this.client) return;

    await this.client.identify({
      ...this.client.getContext(),
      custom: {
        ...context
      }
    });
  }

  onFlagChange(flagKey: keyof FeatureFlags, callback: (value: boolean) => void): void {
    if (!this.client) return;

    this.client.on(`change:${flagKey}`, (value: boolean) => {
      callback(value);
    });
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }
}

export const featureFlags = FeatureFlagService.getInstance();
export type { FeatureFlags }; 