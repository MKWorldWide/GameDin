/**
 * Mock Service - Unified Testing Interface
 *
 * This service provides a unified interface for all mock functionality in the GameDin application.
 * It integrates the mock database, API service, and test data generator for comprehensive testing.
 *
 * Feature Context:
 * - Provides single entry point for all mock operations
 * - Enables seamless switching between mock and real data
 * - Supports automated testing and development workflows
 * - Maintains data consistency across all mock services
 *
 * Usage Example:
 *   const mockService = new MockService();
 *   await mockService.initialize();
 *   const users = await mockService.api.getUsers();
 *   const testCases = mockService.testGenerator.getTestCases();
 *
 * Dependency Listing:
 * - MockDatabase (frontend/src/services/mockDatabase.ts)
 * - MockApiService (frontend/src/services/mockApi.ts)
 * - TestDataGenerator (frontend/src/services/testDataGenerator.ts)
 * - All social types (frontend/src/types/social.ts)
 *
 * Performance Considerations:
 * - Efficient data initialization and caching
 * - Optimized service integration
 * - Memory management for large datasets
 *
 * Security Implications:
 * - No sensitive data in mock services
 * - Safe for development and testing environments
 * - No real authentication or authorization
 *
 * Changelog:
 * - [v3.2.2] Created unified mock service integrating database, API, and test generator for comprehensive testing
 */

import {
  IUser,
  IPost,
  IMessage,
  IConversation,
  IGame,
  IAchievement,
  INotification,
  IActivity,
  IFriend,
} from '../types/social';

import { mockApi } from './mockApi';
import { mockDatabase } from './mockDatabase';
import { testDataGenerator } from './testDataGenerator';


/**
 * Mock Service Configuration
 */
interface MockServiceConfig {
  enableMockMode: boolean;
  autoInitialize: boolean;
  dataSize: 'small' | 'medium' | 'large' | 'extreme';
  enablePerformanceMode: boolean;
  enableTestMode: boolean;
}

/**
 * Mock Service Statistics
 */
interface MockServiceStats {
  users: number;
  posts: number;
  messages: number;
  conversations: number;
  games: number;
  achievements: number;
  notifications: number;
  activities: number;
  testCases: number;
  scenarios: number;
}

/**
 * Mock Service Class
 */
export class MockService {
  public database: typeof mockDatabase;
  public api: typeof mockApi;
  public testGenerator: typeof testDataGenerator;

  private config: MockServiceConfig;
  private isInitialized: boolean = false;
  private stats: MockServiceStats | null = null;

  constructor(config: Partial<MockServiceConfig> = {}) {
    this.config = {
      enableMockMode: true,
      autoInitialize: true,
      dataSize: 'medium',
      enablePerformanceMode: false,
      enableTestMode: true,
      ...config,
    };

    this.database = mockDatabase;
    this.api = mockApi;
    this.testGenerator = testDataGenerator;

    if (this.config.autoInitialize) {
      this.initialize();
    }
  }

  /**
   * Initialize the mock service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize database with appropriate size
      await this.initializeDatabase();

      // Generate test data if test mode is enabled
      if (this.config.enableTestMode) {
        await this.initializeTestData();
      }

      // Calculate statistics
      this.calculateStats();

      this.isInitialized = true;
      console.log('Mock service initialized successfully', this.stats);
    } catch (error) {
      console.error('Failed to initialize mock service:', error);
      throw error;
    }
  }

  /**
   * Initialize database with appropriate data size
   */
  private async initializeDatabase(): Promise<void> {
    const sizeConfigs = {
      small: { userCount: 10, postCount: 50, gameCount: 20, conversationCount: 5, achievementCount: 10 },
      medium: { userCount: 50, postCount: 200, gameCount: 100, conversationCount: 30, achievementCount: 50 },
      large: { userCount: 200, postCount: 1000, gameCount: 500, conversationCount: 100, achievementCount: 200 },
      extreme: { userCount: 1000, postCount: 5000, gameCount: 1000, conversationCount: 500, achievementCount: 1000 },
    };

    const config = sizeConfigs[this.config.dataSize];

    // Reinitialize database with new configuration
    const newDatabase = new (require('./mockDatabase').MockDatabase)(config);

    // Update the singleton instance
    Object.assign(mockDatabase, newDatabase);
  }

  /**
   * Initialize test data
   */
  private async initializeTestData(): Promise<void> {
    // Test data is already generated in the TestDataGenerator constructor
    console.log('Test data initialized:', {
      testCases: this.testGenerator.getTestCases().length,
      scenarios: this.testGenerator.getTestScenarios().length,
    });
  }

  /**
   * Calculate service statistics
   */
  private calculateStats(): void {
    this.stats = {
      users: this.database.getUsers().length,
      posts: this.database.getPosts().length,
      messages: this.database.getMessages().length,
      conversations: this.database.getConversations().length,
      games: this.database.getGames().length,
      achievements: this.database.getAchievements().length,
      notifications: this.database.getNotifications().length,
      activities: this.database.getActivities().length,
      testCases: this.testGenerator.getTestCases().length,
      scenarios: this.testGenerator.getTestScenarios().length,
    };
  }

  /**
   * Get service statistics
   */
  public getStats(): MockServiceStats | null {
    return this.stats;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get service configuration
   */
  public getConfig(): MockServiceConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<MockServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Reset all mock data
   */
  public async reset(): Promise<void> {
    this.isInitialized = false;
    this.stats = null;
    await this.initialize();
  }

  /**
   * Generate performance test data
   */
  public generatePerformanceData(loadLevel: 'low' | 'medium' | 'high' | 'extreme') {
    return this.testGenerator.generatePerformanceTestData(loadLevel);
  }

  /**
   * Run a specific test case
   */
  public async runTestCase(testCaseId: string) {
    return this.testGenerator.runTestCase(testCaseId);
  }

  /**
   * Run a test scenario
   */
  public async runTestScenario(scenarioId: string) {
    return this.testGenerator.runTestScenario(scenarioId);
  }

  /**
   * Get all test cases
   */
  public getTestCases() {
    return this.testGenerator.getTestCases();
  }

  /**
   * Get test cases by category
   */
  public getTestCasesByCategory(category: string) {
    return this.testGenerator.getTestCasesByCategory(category);
  }

  /**
   * Get test cases by priority
   */
  public getTestCasesByPriority(priority: string) {
    return this.testGenerator.getTestCasesByPriority(priority);
  }

  /**
   * Get all test scenarios
   */
  public getTestScenarios() {
    return this.testGenerator.getTestScenarios();
  }

  /**
   * Search users
   */
  public searchUsers(query: string): IUser[] {
    return this.database.searchUsers(query);
  }

  /**
   * Search games
   */
  public searchGames(query: string): IGame[] {
    return this.database.searchGames(query);
  }

  /**
   * Get user by ID
   */
  public getUser(id: string): IUser | undefined {
    return this.database.getUser(id);
  }

  /**
   * Get all users
   */
  public getUsers(): IUser[] {
    return this.database.getUsers();
  }

  /**
   * Get posts by user
   */
  public getPostsByUser(userId: string): IPost[] {
    return this.database.getPostsByUser(userId);
  }

  /**
   * Get activities by user
   */
  public getActivitiesByUser(userId: string): IActivity[] {
    return this.database.getActivitiesByUser(userId);
  }

  /**
   * Get notifications by user
   */
  public getNotificationsByUser(userId: string): INotification[] {
    return this.database.getNotificationsByUser(userId);
  }

  /**
   * Get friends for user
   */
  public getFriends(userId: string): IFriend[] {
    return this.database.getFriends(userId);
  }

  /**
   * Get all posts
   */
  public getPosts(): IPost[] {
    return this.database.getPosts();
  }

  /**
   * Get all games
   */
  public getGames(): IGame[] {
    return this.database.getGames();
  }

  /**
   * Get all achievements
   */
  public getAchievements(): IAchievement[] {
    return this.database.getAchievements();
  }

  /**
   * Get all conversations
   */
  public getConversations(): IConversation[] {
    return this.database.getConversations();
  }

  /**
   * Get messages by conversation
   */
  public getMessagesByConversation(conversationId: string): IMessage[] {
    return this.database.getMessagesByConversation(conversationId);
  }

  /**
   * Get all notifications
   */
  public getNotifications(): INotification[] {
    return this.database.getNotifications();
  }

  /**
   * Get all activities
   */
  public getActivities(): IActivity[] {
    return this.database.getActivities();
  }

  /**
   * Create a new user
   */
  public createUser(userData: Partial<IUser>): IUser {
    const newUser: IUser = {
      id: `user_${Date.now()}`,
      email: userData.email || `user${Date.now()}@example.com`,
      username: userData.username || `User${Date.now()}`,
      name: userData.name || `User ${Date.now()}`,
      picture: userData.picture || `https://api.dicebear.com/7.x/initials/svg?seed=User${Date.now()}`,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=User${Date.now()}`,
      bio: userData.bio || '',
      level: userData.level || 1,
      rank: userData.rank || 'Rookie',
      status: userData.status || 'online',
      lastSeen: userData.lastSeen || new Date(),
      friends: userData.friends || [],
      gameStats: userData.gameStats || {
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
        achievements: [],
      },
      settings: userData.settings || {
        profileVisibility: 'public',
        notifications: {
          push: true,
          email: true,
          emailNotifications: {
            frequency: 'real-time',
            types: {
              friendRequests: true,
              messages: true,
              gameInvites: true,
              achievements: true,
            },
          },
        },
        privacy: {
          showOnlineStatus: true,
          showLastSeen: true,
          allowFriendRequests: true,
          showGameStats: true,
        },
      },
      attributes: userData.attributes || {
        email: userData.email || `user${Date.now()}@example.com`,
        name: userData.name || `User ${Date.now()}`,
        picture: userData.picture || `https://api.dicebear.com/7.x/initials/svg?seed=User${Date.now()}`,
        rank: userData.rank || 'Rookie',
      },
    };

    // Add to database (this would need to be implemented in MockDatabase)
    return newUser;
  }

  /**
   * Create a new post
   */
  public createPost(postData: { content: string; authorId: string; gameId?: string }): IPost {
    const author = this.database.getUser(postData.authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    const newPost: IPost = {
      id: `post_${Date.now()}`,
      content: postData.content,
      author,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'general',
      gameId: postData.gameId,
    };

    return newPost;
  }

  /**
   * Create a new message
   */
  public createMessage(messageData: { content: string; authorId: string; conversationId: string }): IMessage {
    const author = this.database.getUser(messageData.authorId);
    if (!author) {
      throw new Error('Author not found');
    }

    const newMessage: IMessage = {
      id: `msg_${Date.now()}`,
      conversationId: messageData.conversationId,
      content: messageData.content,
      type: 'text',
      author,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newMessage;
  }

  /**
   * Export all data for backup or testing
   */
  public exportData(): any {
    return {
      users: this.database.getUsers(),
      posts: this.database.getPosts(),
      messages: this.database.getMessages(),
      conversations: this.database.getConversations(),
      games: this.database.getGames(),
      achievements: this.database.getAchievements(),
      notifications: this.database.getNotifications(),
      activities: this.database.getActivities(),
      stats: this.stats,
      config: this.config,
    };
  }

  /**
   * Import data from backup
   */
  public importData(data: any): void {
    // This would need to be implemented in MockDatabase
    console.log('Importing data:', data);
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: any } {
    if (!this.isInitialized) {
      return { status: 'unhealthy', details: { message: 'Service not initialized' } };
    }

    if (!this.stats) {
      return { status: 'degraded', details: { message: 'Statistics not available' } };
    }

    return {
      status: 'healthy',
      details: {
        initialized: this.isInitialized,
        stats: this.stats,
        config: this.config,
      },
    };
  }
}

// Export singleton instance
export const mockService = new MockService();

// Export for use in components
export default mockService;
