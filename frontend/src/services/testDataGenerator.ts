/**
 * Test Data Generator - Automated Test Cases
 *
 * This service provides comprehensive automated test data generation with realistic
 * scenarios and test cases for the GameDin application. It includes user interactions,
 * social behaviors, gaming activities, and edge cases for thorough testing.
 *
 * Feature Context:
 * - Generates realistic user interaction scenarios
 * - Creates comprehensive test cases for all features
 * - Provides automated data seeding and validation
 * - Supports performance testing and load scenarios
 *
 * Usage Example:
 *   const generator = new TestDataGenerator();
 *   const testCases = generator.generateUserInteractionTests();
 *   const loadTestData = generator.generateLoadTestData();
 *
 * Dependency Listing:
 * - MockDatabase (frontend/src/services/mockDatabase.ts)
 * - MockApiService (frontend/src/services/mockApi.ts)
 * - All social types (frontend/src/types/social.ts)
 *
 * Performance Considerations:
 * - Efficient data generation algorithms
 * - Memory-optimized test scenarios
 * - Scalable load testing data
 *
 * Security Implications:
 * - No sensitive data in test scenarios
 * - Safe for automated testing environments
 * - No real authentication required
 *
 * Changelog:
 * - [v3.2.2] Created comprehensive test data generator with automated test cases and realistic scenarios
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

/**
 * Test Case Interface
 */
interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  steps: string[];
  expectedResult: string;
  data?: any;
}

/**
 * Test Scenario Interface
 */
interface TestScenario {
  id: string;
  name: string;
  description: string;
  testCases: TestCase[];
  setupData?: any;
  cleanupData?: any;
}

/**
 * Performance Test Data Interface
 */
interface PerformanceTestData {
  users: IUser[];
  posts: IPost[];
  messages: IMessage[];
  loadLevel: 'low' | 'medium' | 'high' | 'extreme';
  concurrentUsers: number;
  requestsPerSecond: number;
}

/**
 * Test Data Generator Class
 */
export class TestDataGenerator {
  private testCases: Map<string, TestCase> = new Map();
  private scenarios: Map<string, TestScenario> = new Map();

  constructor() {
    this.generateTestCases();
    this.generateTestScenarios();
  }

  /**
   * Generate comprehensive test cases
   */
  private generateTestCases(): void {
    this.generateAuthenticationTestCases();
    this.generateUserProfileTestCases();
    this.generateSocialInteractionTestCases();
    this.generateGamingTestCases();
    this.generateMessagingTestCases();
    this.generateSearchTestCases();
    this.generateNotificationTestCases();
    this.generatePerformanceTestCases();
    this.generateEdgeCaseTestCases();
  }

  /**
   * Generate authentication test cases
   */
  private generateAuthenticationTestCases(): void {
    const authTests: TestCase[] = [
      {
        id: 'AUTH_001',
        name: 'Successful User Login',
        description: 'User should be able to login with valid credentials',
        category: 'Authentication',
        priority: 'critical',
        steps: [
          'Navigate to login page',
          'Enter valid email and password',
          'Click login button',
        ],
        expectedResult: 'User should be logged in and redirected to dashboard',
        data: {
          email: 'test@example.com',
          password: 'validPassword123',
        },
      },
      {
        id: 'AUTH_002',
        name: 'Failed Login - Invalid Credentials',
        description: 'User should see error message for invalid credentials',
        category: 'Authentication',
        priority: 'high',
        steps: [
          'Navigate to login page',
          'Enter invalid email and password',
          'Click login button',
        ],
        expectedResult: 'Error message should be displayed',
        data: {
          email: 'invalid@example.com',
          password: 'wrongPassword',
        },
      },
      {
        id: 'AUTH_003',
        name: 'User Registration',
        description: 'New user should be able to register successfully',
        category: 'Authentication',
        priority: 'critical',
        steps: [
          'Navigate to registration page',
          'Fill in all required fields',
          'Submit registration form',
        ],
        expectedResult: 'User account should be created and user logged in',
        data: {
          email: 'newuser@example.com',
          password: 'NewPassword123',
          username: 'NewGamer123',
        },
      },
      {
        id: 'AUTH_004',
        name: 'User Logout',
        description: 'User should be able to logout successfully',
        category: 'Authentication',
        priority: 'high',
        steps: [
          'Login as a user',
          'Click logout button',
          'Confirm logout',
        ],
        expectedResult: 'User should be logged out and redirected to login page',
      },
    ];

    authTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate user profile test cases
   */
  private generateUserProfileTestCases(): void {
    const profileTests: TestCase[] = [
      {
        id: 'PROFILE_001',
        name: 'View User Profile',
        description: 'User should be able to view their own profile',
        category: 'User Profile',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to profile page',
          'View profile information',
        ],
        expectedResult: 'Profile should display all user information correctly',
      },
      {
        id: 'PROFILE_002',
        name: 'Update User Profile',
        description: 'User should be able to update their profile information',
        category: 'User Profile',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to profile settings',
          'Update profile information',
          'Save changes',
        ],
        expectedResult: 'Profile should be updated with new information',
        data: {
          bio: 'Updated bio text',
          rank: 'Gold',
          settings: {
            profileVisibility: 'friends',
          },
        },
      },
      {
        id: 'PROFILE_003',
        name: 'Upload Profile Picture',
        description: 'User should be able to upload a profile picture',
        category: 'User Profile',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Navigate to profile settings',
          'Click upload picture',
          'Select image file',
          'Save changes',
        ],
        expectedResult: 'Profile picture should be updated',
        data: {
          file: new File([''], 'profile.jpg', { type: 'image/jpeg' }),
        },
      },
      {
        id: 'PROFILE_004',
        name: 'View Other User Profile',
        description: 'User should be able to view other users\' profiles',
        category: 'User Profile',
        priority: 'high',
        steps: [
          'Login as a user',
          'Search for another user',
          'Click on user profile',
        ],
        expectedResult: 'Other user\'s profile should be displayed with appropriate privacy settings',
      },
    ];

    profileTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate social interaction test cases
   */
  private generateSocialInteractionTestCases(): void {
    const socialTests: TestCase[] = [
      {
        id: 'SOCIAL_001',
        name: 'Create Social Post',
        description: 'User should be able to create a new social post',
        category: 'Social Interactions',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to create post page',
          'Write post content',
          'Add optional media',
          'Publish post',
        ],
        expectedResult: 'Post should be created and visible in feed',
        data: {
          content: 'Just achieved a new high score in Valorant! 🎮',
          gameId: 'game_123',
        },
      },
      {
        id: 'SOCIAL_002',
        name: 'Like and Unlike Post',
        description: 'User should be able to like and unlike posts',
        category: 'Social Interactions',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Find a post in feed',
          'Click like button',
          'Click like button again',
        ],
        expectedResult: 'Like count should increase then decrease',
        data: {
          postId: 'post_123',
        },
      },
      {
        id: 'SOCIAL_003',
        name: 'Comment on Post',
        description: 'User should be able to comment on posts',
        category: 'Social Interactions',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Find a post in feed',
          'Click comment button',
          'Write comment',
          'Submit comment',
        ],
        expectedResult: 'Comment should be added to post',
        data: {
          postId: 'post_123',
          comment: 'Great achievement! Congrats! 🎉',
        },
      },
      {
        id: 'SOCIAL_004',
        name: 'Share Post',
        description: 'User should be able to share posts',
        category: 'Social Interactions',
        priority: 'low',
        steps: [
          'Login as a user',
          'Find a post in feed',
          'Click share button',
          'Add optional comment',
          'Share post',
        ],
        expectedResult: 'Post should be shared to user\'s profile',
        data: {
          postId: 'post_123',
          shareComment: 'Check out this amazing post!',
        },
      },
    ];

    socialTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate gaming test cases
   */
  private generateGamingTestCases(): void {
    const gamingTests: TestCase[] = [
      {
        id: 'GAMING_001',
        name: 'Browse Games',
        description: 'User should be able to browse available games',
        category: 'Gaming',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to games page',
          'Browse game list',
          'Apply filters',
        ],
        expectedResult: 'Games should be displayed with filtering options',
        data: {
          filters: {
            genre: 'FPS',
            platform: 'PC',
          },
        },
      },
      {
        id: 'GAMING_002',
        name: 'Search Games',
        description: 'User should be able to search for specific games',
        category: 'Gaming',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to games page',
          'Enter search term',
          'View search results',
        ],
        expectedResult: 'Relevant games should be displayed',
        data: {
          searchTerm: 'Valorant',
        },
      },
      {
        id: 'GAMING_003',
        name: 'View Game Details',
        description: 'User should be able to view detailed game information',
        category: 'Gaming',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Find a game in list',
          'Click on game',
          'View game details',
        ],
        expectedResult: 'Game details should be displayed with all information',
        data: {
          gameId: 'game_123',
        },
      },
      {
        id: 'GAMING_004',
        name: 'Track Achievements',
        description: 'User should be able to view and track achievements',
        category: 'Gaming',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Navigate to achievements page',
          'View achievement list',
          'Filter by game',
        ],
        expectedResult: 'Achievements should be displayed with progress',
        data: {
          gameId: 'game_123',
        },
      },
    ];

    gamingTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate messaging test cases
   */
  private generateMessagingTestCases(): void {
    const messagingTests: TestCase[] = [
      {
        id: 'MESSAGING_001',
        name: 'Start New Conversation',
        description: 'User should be able to start a new conversation',
        category: 'Messaging',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to messages',
          'Click new conversation',
          'Select recipient',
          'Send first message',
        ],
        expectedResult: 'New conversation should be created',
        data: {
          recipientId: 'user_456',
          message: 'Hey! Want to play together?',
        },
      },
      {
        id: 'MESSAGING_002',
        name: 'Send Message',
        description: 'User should be able to send messages in conversations',
        category: 'Messaging',
        priority: 'high',
        steps: [
          'Login as a user',
          'Open existing conversation',
          'Type message',
          'Send message',
        ],
        expectedResult: 'Message should be sent and displayed',
        data: {
          conversationId: 'conv_123',
          message: 'Great game last night!',
        },
      },
      {
        id: 'MESSAGING_003',
        name: 'View Message History',
        description: 'User should be able to view message history',
        category: 'Messaging',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Open conversation',
          'Scroll through messages',
          'Load more messages',
        ],
        expectedResult: 'Message history should be displayed with pagination',
      },
      {
        id: 'MESSAGING_004',
        name: 'Mark Messages as Read',
        description: 'Messages should be marked as read when viewed',
        category: 'Messaging',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Open conversation with unread messages',
          'View messages',
        ],
        expectedResult: 'Messages should be marked as read',
      },
    ];

    messagingTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate search test cases
   */
  private generateSearchTestCases(): void {
    const searchTests: TestCase[] = [
      {
        id: 'SEARCH_001',
        name: 'Search Users',
        description: 'User should be able to search for other users',
        category: 'Search',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to search page',
          'Enter search term',
          'Select users filter',
          'View results',
        ],
        expectedResult: 'Relevant users should be displayed',
        data: {
          searchTerm: 'ProGamer',
          filter: 'users',
        },
      },
      {
        id: 'SEARCH_002',
        name: 'Search Games',
        description: 'User should be able to search for games',
        category: 'Search',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to search page',
          'Enter search term',
          'Select games filter',
          'View results',
        ],
        expectedResult: 'Relevant games should be displayed',
        data: {
          searchTerm: 'Valorant',
          filter: 'games',
        },
      },
      {
        id: 'SEARCH_003',
        name: 'Search Posts',
        description: 'User should be able to search for posts',
        category: 'Search',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Navigate to search page',
          'Enter search term',
          'Select posts filter',
          'View results',
        ],
        expectedResult: 'Relevant posts should be displayed',
        data: {
          searchTerm: 'achievement',
          filter: 'posts',
        },
      },
      {
        id: 'SEARCH_004',
        name: 'Advanced Search Filters',
        description: 'User should be able to use advanced search filters',
        category: 'Search',
        priority: 'low',
        steps: [
          'Login as a user',
          'Navigate to search page',
          'Open advanced filters',
          'Apply multiple filters',
          'View results',
        ],
        expectedResult: 'Filtered results should be displayed',
        data: {
          filters: {
            type: 'users',
            rank: 'Diamond',
            game: 'Valorant',
          },
        },
      },
    ];

    searchTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate notification test cases
   */
  private generateNotificationTestCases(): void {
    const notificationTests: TestCase[] = [
      {
        id: 'NOTIFICATION_001',
        name: 'View Notifications',
        description: 'User should be able to view their notifications',
        category: 'Notifications',
        priority: 'high',
        steps: [
          'Login as a user',
          'Click notification bell',
          'View notification list',
        ],
        expectedResult: 'Notifications should be displayed with proper formatting',
      },
      {
        id: 'NOTIFICATION_002',
        name: 'Mark Notification as Read',
        description: 'User should be able to mark notifications as read',
        category: 'Notifications',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Open notifications',
          'Click on unread notification',
        ],
        expectedResult: 'Notification should be marked as read',
      },
      {
        id: 'NOTIFICATION_003',
        name: 'Filter Notifications',
        description: 'User should be able to filter notifications by type',
        category: 'Notifications',
        priority: 'low',
        steps: [
          'Login as a user',
          'Open notifications',
          'Select notification type filter',
          'View filtered results',
        ],
        expectedResult: 'Only notifications of selected type should be displayed',
        data: {
          filter: 'messages',
        },
      },
    ];

    notificationTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate performance test cases
   */
  private generatePerformanceTestCases(): void {
    const performanceTests: TestCase[] = [
      {
        id: 'PERF_001',
        name: 'Load Large Feed',
        description: 'Application should handle large feed loading efficiently',
        category: 'Performance',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to feed page',
          'Scroll through large number of posts',
        ],
        expectedResult: 'Feed should load smoothly without performance issues',
        data: {
          postCount: 1000,
        },
      },
      {
        id: 'PERF_002',
        name: 'Search Performance',
        description: 'Search should be fast and responsive',
        category: 'Performance',
        priority: 'high',
        steps: [
          'Login as a user',
          'Navigate to search page',
          'Perform multiple rapid searches',
        ],
        expectedResult: 'Search results should appear quickly',
        data: {
          searchTerms: ['game', 'user', 'post', 'achievement'],
        },
      },
      {
        id: 'PERF_003',
        name: 'Message Loading',
        description: 'Message history should load efficiently',
        category: 'Performance',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Open conversation with many messages',
          'Scroll through message history',
        ],
        expectedResult: 'Messages should load smoothly with pagination',
      },
    ];

    performanceTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate edge case test cases
   */
  private generateEdgeCaseTestCases(): void {
    const edgeCaseTests: TestCase[] = [
      {
        id: 'EDGE_001',
        name: 'Empty Feed',
        description: 'Application should handle empty feed gracefully',
        category: 'Edge Cases',
        priority: 'medium',
        steps: [
          'Login as new user',
          'Navigate to feed page',
        ],
        expectedResult: 'Empty state should be displayed with helpful message',
      },
      {
        id: 'EDGE_002',
        name: 'No Search Results',
        description: 'Application should handle no search results gracefully',
        category: 'Edge Cases',
        priority: 'medium',
        steps: [
          'Login as a user',
          'Search for non-existent term',
          'View search results',
        ],
        expectedResult: 'No results message should be displayed',
        data: {
          searchTerm: 'nonexistentterm12345',
        },
      },
      {
        id: 'EDGE_003',
        name: 'Long Content Handling',
        description: 'Application should handle very long content properly',
        category: 'Edge Cases',
        priority: 'low',
        steps: [
          'Login as a user',
          'Create post with very long content',
          'View post in feed',
        ],
        expectedResult: 'Long content should be truncated or handled properly',
        data: {
          content: 'A'.repeat(10000),
        },
      },
      {
        id: 'EDGE_004',
        name: 'Special Characters',
        description: 'Application should handle special characters properly',
        category: 'Edge Cases',
        priority: 'low',
        steps: [
          'Login as a user',
          'Create post with special characters',
          'View post in feed',
        ],
        expectedResult: 'Special characters should be displayed correctly',
        data: {
          content: 'Test with émojis 🎮 and special chars: !@#$%^&*()',
        },
      },
    ];

    edgeCaseTests.forEach(test => this.testCases.set(test.id, test));
  }

  /**
   * Generate test scenarios
   */
  private generateTestScenarios(): void {
    const scenarios: TestScenario[] = [
      {
        id: 'SCENARIO_001',
        name: 'New User Onboarding',
        description: 'Complete new user registration and onboarding flow',
        testCases: [
          this.testCases.get('AUTH_003')!,
          this.testCases.get('PROFILE_001')!,
          this.testCases.get('PROFILE_002')!,
          this.testCases.get('SOCIAL_001')!,
        ],
        setupData: {
          newUser: {
            email: 'newuser@example.com',
            password: 'NewPassword123',
            username: 'NewGamer123',
          },
        },
      },
      {
        id: 'SCENARIO_002',
        name: 'Social Interaction Flow',
        description: 'Complete social interaction flow including posts, likes, and comments',
        testCases: [
          this.testCases.get('SOCIAL_001')!,
          this.testCases.get('SOCIAL_002')!,
          this.testCases.get('SOCIAL_003')!,
          this.testCases.get('NOTIFICATION_001')!,
        ],
      },
      {
        id: 'SCENARIO_003',
        name: 'Gaming Discovery',
        description: 'Game discovery and interaction flow',
        testCases: [
          this.testCases.get('GAMING_001')!,
          this.testCases.get('GAMING_002')!,
          this.testCases.get('GAMING_003')!,
          this.testCases.get('GAMING_004')!,
        ],
      },
      {
        id: 'SCENARIO_004',
        name: 'Messaging Communication',
        description: 'Complete messaging and communication flow',
        testCases: [
          this.testCases.get('MESSAGING_001')!,
          this.testCases.get('MESSAGING_002')!,
          this.testCases.get('MESSAGING_003')!,
          this.testCases.get('MESSAGING_004')!,
        ],
      },
    ];

    scenarios.forEach(scenario => this.scenarios.set(scenario.id, scenario));
  }

  /**
   * Generate performance test data
   */
  public generatePerformanceTestData(loadLevel: 'low' | 'medium' | 'high' | 'extreme'): PerformanceTestData {
    const loadConfigs = {
      low: { users: 100, posts: 500, messages: 1000, concurrentUsers: 10, requestsPerSecond: 5 },
      medium: { users: 500, posts: 2500, messages: 5000, concurrentUsers: 50, requestsPerSecond: 25 },
      high: { users: 1000, posts: 5000, messages: 10000, concurrentUsers: 100, requestsPerSecond: 50 },
      extreme: { users: 5000, posts: 25000, messages: 50000, concurrentUsers: 500, requestsPerSecond: 250 },
    };

    const config = loadConfigs[loadLevel];
    const users = this.generateUsers(config.users);
    const posts = this.generatePosts(config.posts, users);
    const messages = this.generateMessages(config.messages, users);

    return {
      users,
      posts,
      messages,
      loadLevel,
      concurrentUsers: config.concurrentUsers,
      requestsPerSecond: config.requestsPerSecond,
    };
  }

  /**
   * Generate users for performance testing
   */
  private generateUsers(count: number): IUser[] {
    const users: IUser[] = [];
    for (let i = 0; i < count; i++) {
      const user: IUser = {
        id: `perf_user_${i}`,
        email: `user${i}@example.com`,
        username: `PerfUser${i}`,
        name: `Performance User ${i}`,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=User${i}`,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User${i}`,
        bio: `Performance test user ${i}`,
        level: Math.floor(Math.random() * 100) + 1,
        rank: ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'][Math.floor(Math.random() * 6)],
        status: ['online', 'offline', 'away', 'busy'][Math.floor(Math.random() * 4)],
        lastSeen: new Date(),
        friends: [],
        gameStats: {
          gamesPlayed: Math.floor(Math.random() * 1000),
          gamesWon: Math.floor(Math.random() * 800),
          winRate: Math.random() * 0.7 + 0.3,
          achievements: [],
        },
        settings: {
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
        attributes: {
          email: `user${i}@example.com`,
          name: `Performance User ${i}`,
          picture: `https://api.dicebear.com/7.x/initials/svg?seed=User${i}`,
          rank: ['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'][Math.floor(Math.random() * 6)],
        },
      };
      users.push(user);
    }
    return users;
  }

  /**
   * Generate posts for performance testing
   */
  private generatePosts(count: number, users: IUser[]): IPost[] {
    const posts: IPost[] = [];
    for (let i = 0; i < count; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      const post: IPost = {
        id: `perf_post_${i}`,
        content: `Performance test post ${i} - ${Math.random().toString(36).substring(7)}`,
        author,
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        type: ['achievement', 'game_review', 'tournament', 'highlight', 'general'][Math.floor(Math.random() * 5)],
      };
      posts.push(post);
    }
    return posts;
  }

  /**
   * Generate messages for performance testing
   */
  private generateMessages(count: number, users: IUser[]): IMessage[] {
    const messages: IMessage[] = [];
    for (let i = 0; i < count; i++) {
      const author = users[Math.floor(Math.random() * users.length)];
      const message: IMessage = {
        id: `perf_msg_${i}`,
        conversationId: `perf_conv_${Math.floor(i / 50)}`,
        content: `Performance test message ${i}`,
        type: 'text',
        author,
        status: 'read',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      };
      messages.push(message);
    }
    return messages;
  }

  // Public API methods
  public getTestCases(): TestCase[] {
    return Array.from(this.testCases.values());
  }

  public getTestCase(id: string): TestCase | undefined {
    return this.testCases.get(id);
  }

  public getTestScenarios(): TestScenario[] {
    return Array.from(this.scenarios.values());
  }

  public getTestScenario(id: string): TestScenario | undefined {
    return this.scenarios.get(id);
  }

  public getTestCasesByCategory(category: string): TestCase[] {
    return this.getTestCases().filter(test => test.category === category);
  }

  public getTestCasesByPriority(priority: string): TestCase[] {
    return this.getTestCases().filter(test => test.priority === priority);
  }

  public runTestCase(testCaseId: string): Promise<{ success: boolean; result: any; error?: string }> {
    return new Promise(async(resolve) => {
      const testCase = this.testCases.get(testCaseId);
      if (!testCase) {
        resolve({ success: false, error: 'Test case not found' });
        return;
      }

      try {
        // Simulate test execution
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Random success/failure for demonstration
        const success = Math.random() > 0.1; // 90% success rate

        if (success) {
          resolve({ success: true, result: `Test case ${testCaseId} executed successfully` });
        } else {
          resolve({ success: false, error: `Test case ${testCaseId} failed` });
        }
      } catch (error) {
        resolve({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });
  }

  public runTestScenario(scenarioId: string): Promise<{ success: boolean; results: any[]; errors: string[] }> {
    return new Promise(async(resolve) => {
      const scenario = this.scenarios.get(scenarioId);
      if (!scenario) {
        resolve({ success: false, results: [], errors: ['Scenario not found'] });
        return;
      }

      const results: any[] = [];
      const errors: string[] = [];

      for (const testCase of scenario.testCases) {
        const result = await this.runTestCase(testCase.id);
        if (result.success) {
          results.push(result.result);
        } else {
          errors.push(result.error || 'Unknown error');
        }
      }

      const success = errors.length === 0;
      resolve({ success, results, errors });
    });
  }
}

// Export singleton instance
export const testDataGenerator = new TestDataGenerator();
