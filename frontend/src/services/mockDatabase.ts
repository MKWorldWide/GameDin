/**
 * Mock Database Service - Local Data Management
 *
 * This service provides a comprehensive local database with realistic mock data
 * for testing and development of the GameDin application. It includes all major
 * entities: users, posts, messages, games, achievements, and social interactions.
 *
 * Feature Context:
 * - Provides realistic gaming social platform data
 * - Supports all application features without external dependencies
 * - Includes automated data generation and seeding
 * - Maintains data consistency and relationships
 *
 * Usage Example:
 *   const mockDB = new MockDatabase();
 *   const users = mockDB.getUsers();
 *   const posts = mockDB.getPosts();
 *
 * Dependency Listing:
 * - IUser, IPost, IMessage, IGame, IAchievement types (frontend/src/types/social.ts)
 * - faker library for realistic data generation
 * - Local storage for persistence
 *
 * Performance Considerations:
 * - In-memory storage for fast access
 * - Indexed lookups for efficient queries
 * - Lazy loading for large datasets
 *
 * Security Implications:
 * - No sensitive data in mock database
 * - All data is publicly accessible for testing
 * - No authentication required for mock operations
 *
 * Changelog:
 * - [v3.2.2] Created comprehensive mock database with realistic data generation and automated test cases
 */

import { faker } from '@faker-js/faker';

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

/**
 * Mock Database Configuration
 */
interface MockDBConfig {
  userCount: number;
  postCount: number;
  gameCount: number;
  conversationCount: number;
  achievementCount: number;
}

/**
 * Mock Database Class
 */
export class MockDatabase {
  private users: Map<string, IUser> = new Map();
  private posts: Map<string, IPost> = new Map();
  private messages: Map<string, IMessage> = new Map();
  private conversations: Map<string, IConversation> = new Map();
  private games: Map<string, IGame> = new Map();
  private achievements: Map<string, IAchievement> = new Map();
  private notifications: Map<string, INotification> = new Map();
  private activities: Map<string, IActivity> = new Map();
  private friends: Map<string, IFriend[]> = new Map();

  constructor(config: Partial<MockDBConfig> = {}) {
    const defaultConfig: MockDBConfig = {
      userCount: 50,
      postCount: 200,
      gameCount: 100,
      conversationCount: 30,
      achievementCount: 50,
      ...config,
    };

    this.generateData(defaultConfig);
  }

  /**
   * Generate comprehensive mock data
   */
  private generateData(config: MockDBConfig): void {
    this.generateUsers(config.userCount);
    this.generateGames(config.gameCount);
    this.generateAchievements(config.achievementCount);
    this.generatePosts(config.postCount);
    this.generateConversations(config.conversationCount);
    this.generateFriendships();
    this.generateActivities();
    this.generateNotifications();
  }

  /**
   * Generate realistic user profiles
   */
  private generateUsers(count: number): void {
    const gamingUsernames = [
      'ProGamer123',
      'EliteSniper',
      'DragonSlayer',
      'PixelWarrior',
      'CyberNinja',
      'GameMaster',
      'VictoryRoyale',
      'EpicPlayer',
      'LegendaryGamer',
      'SkillShot',
      'TacticalGenius',
      'SpeedRunner',
      'BossKiller',
      'LevelMaster',
      'AchievementHunter',
      'GamingWizard',
      'ControllerKing',
      'MouseMaster',
      'KeyboardWarrior',
      'HeadsetHero',
    ];

    for (let i = 0; i < count; i++) {
      const username = gamingUsernames[i % gamingUsernames.length] + faker.number.int({ min: 1, max: 999 });
      const user: IUser = {
        id: faker.string.uuid(),
        email: faker.internet.email({ firstName: username }),
        username,
        name: faker.person.fullName(),
        picture: faker.image.avatar(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.sentence(),
        level: faker.number.int({ min: 1, max: 100 }),
        rank: this.getRandomRank(),
        status: faker.helpers.arrayElement(['online', 'offline', 'away', 'busy']),
        lastSeen: faker.date.recent(),
        friends: [],
        gameStats: {
          gamesPlayed: faker.number.int({ min: 10, max: 1000 }),
          gamesWon: faker.number.int({ min: 5, max: 800 }),
          winRate: faker.number.float({ min: 0.3, max: 0.9, precision: 0.01 }),
          achievements: [],
        },
        settings: {
          profileVisibility: faker.helpers.arrayElement(['public', 'friends', 'private']),
          notifications: {
            push: faker.datatype.boolean(),
            email: faker.datatype.boolean(),
            emailNotifications: {
              frequency: faker.helpers.arrayElement(['daily', 'weekly', 'real-time']),
              types: {
                friendRequests: faker.datatype.boolean(),
                messages: faker.datatype.boolean(),
                gameInvites: faker.datatype.boolean(),
                achievements: faker.datatype.boolean(),
              },
            },
          },
          privacy: {
            showOnlineStatus: faker.datatype.boolean(),
            showLastSeen: faker.datatype.boolean(),
            allowFriendRequests: faker.datatype.boolean(),
            showGameStats: faker.datatype.boolean(),
          },
        },
        attributes: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          picture: faker.image.avatar(),
          rank: this.getRandomRank(),
        },
      };

      this.users.set(user.id, user);
    }
  }

  /**
   * Generate popular games
   */
  private generateGames(count: number): void {
    const gameTitles = [
      'Valorant',
      'League of Legends',
      'Counter-Strike 2',
      'Fortnite',
      'Apex Legends',
      'Overwatch 2',
      'Call of Duty: Warzone',
      'PUBG: Battlegrounds',
      'Dota 2',
      'Rocket League',
      'Minecraft',
      'Among Us',
      'Fall Guys',
      'Genshin Impact',
      'World of Warcraft',
      'Final Fantasy XIV',
      'Destiny 2',
      'Rainbow Six Siege',
      'Teamfight Tactics',
      'Hearthstone',
    ];

    for (let i = 0; i < count; i++) {
      const game: IGame = {
        id: faker.string.uuid(),
        title: gameTitles[i % gameTitles.length],
        description: faker.lorem.paragraph(),
        coverImage: faker.image.urlLoremFlickr({ category: 'gaming' }),
        genre: faker.helpers.arrayElement(['FPS', 'MOBA', 'Battle Royale', 'RPG', 'Strategy', 'Sports']),
        platform: faker.helpers.arrayElement(['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile']),
        releaseDate: faker.date.past(),
        rating: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
        playerCount: faker.number.int({ min: 1000, max: 1000000 }),
        isActive: faker.datatype.boolean(),
        tags: faker.helpers.arrayElements(['Competitive', 'Casual', 'Co-op', 'PvP', 'Story-driven'], { min: 2, max: 4 }),
      };

      this.games.set(game.id, game);
    }
  }

  /**
   * Generate gaming achievements
   */
  private generateAchievements(count: number): void {
    const achievementNames = [
      'First Blood',
      'Unstoppable',
      'Sharpshooter',
      'Team Player',
      'Speed Demon',
      'Survivor',
      'Collector',
      'Explorer',
      'Strategist',
      'Legend',
      'Master Tactician',
      'Quick Reflexes',
      'Perfect Aim',
      'Lucky Shot',
      'Veteran',
      'Rookie',
      'Pro Gamer',
      'Elite Player',
      'Champion',
      'Hero',
    ];

    for (let i = 0; i < count; i++) {
      const achievement: IAchievement = {
        id: faker.string.uuid(),
        name: achievementNames[i % achievementNames.length],
        description: faker.lorem.sentence(),
        icon: faker.image.urlLoremFlickr({ category: 'abstract' }),
        unlockedAt: faker.date.recent(),
        rarity: faker.helpers.arrayElement(['common', 'rare', 'epic', 'legendary']),
        points: faker.number.int({ min: 10, max: 1000 }),
        gameId: Array.from(this.games.keys())[faker.number.int({ min: 0, max: this.games.size - 1 })],
      };

      this.achievements.set(achievement.id, achievement);
    }
  }

  /**
   * Generate social posts
   */
  private generatePosts(count: number): void {
    const postTypes = ['achievement', 'game_review', 'tournament', 'highlight', 'general'];
    const userIds = Array.from(this.users.keys());

    for (let i = 0; i < count; i++) {
      const authorId = userIds[faker.number.int({ min: 0, max: userIds.length - 1 })];
      const author = this.users.get(authorId)!;

      const post: IPost = {
        id: faker.string.uuid(),
        content: this.generatePostContent(),
        author,
        likes: faker.number.int({ min: 0, max: 1000 }),
        comments: faker.number.int({ min: 0, max: 100 }),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        type: faker.helpers.arrayElement(postTypes),
        gameId: faker.helpers.maybe(() => Array.from(this.games.keys())[faker.number.int({ min: 0, max: this.games.size - 1 })]),
        media: faker.helpers.maybe(() => ({
          type: faker.helpers.arrayElement(['image', 'video']),
          url: faker.image.urlLoremFlickr({ category: 'gaming' }),
          thumbnail: faker.image.urlLoremFlickr({ category: 'gaming' }),
        })),
      };

      this.posts.set(post.id, post);
    }
  }

  /**
   * Generate conversations and messages
   */
  private generateConversations(count: number): void {
    const userIds = Array.from(this.users.keys());

    for (let i = 0; i < count; i++) {
      const participantIds = faker.helpers.arrayElements(userIds, { min: 2, max: 5 });
      const participants = participantIds.map(id => ({
        user: this.users.get(id)!,
        role: faker.helpers.arrayElement(['ADMIN', 'MEMBER']),
        joinedAt: faker.date.past(),
        lastRead: faker.date.recent(),
        isTyping: false,
        isMuted: false,
      }));

      const conversation: IConversation = {
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(['PRIVATE', 'GROUP']),
        title: conversation.type === 'GROUP' ? faker.company.name() : undefined,
        description: faker.lorem.sentence(),
        groupAvatar: conversation.type === 'GROUP' ? faker.image.avatar() : undefined,
        participants,
        lastMessage: undefined,
        unreadCount: faker.number.int({ min: 0, max: 10 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        metadata: {
          theme: faker.helpers.arrayElement(['dark', 'light', 'gaming']),
          pinnedMessages: [],
          customEmoji: {},
        },
      };

      this.conversations.set(conversation.id, conversation);

      // Generate messages for this conversation
      this.generateMessagesForConversation(conversation.id, participantIds);
    }
  }

  /**
   * Generate messages for a conversation
   */
  private generateMessagesForConversation(conversationId: string, participantIds: string[]): void {
    const messageCount = faker.number.int({ min: 5, max: 50 });

    for (let i = 0; i < messageCount; i++) {
      const authorId = participantIds[faker.number.int({ min: 0, max: participantIds.length - 1 })];
      const author = this.users.get(authorId)!;

      const message: IMessage = {
        id: faker.string.uuid(),
        conversationId,
        content: this.generateMessageContent(),
        type: faker.helpers.arrayElement(['text', 'image', 'video', 'file', 'system']),
        author,
        status: faker.helpers.arrayElement(['sending', 'sent', 'delivered', 'read', 'failed']),
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
        attachments: faker.helpers.maybe(() => [{
          id: faker.string.uuid(),
          type: faker.helpers.arrayElement(['image', 'video', 'file']),
          url: faker.image.urlLoremFlickr({ category: 'gaming' }),
          name: faker.system.fileName(),
          size: faker.number.int({ min: 1000, max: 10000000 }),
          mimeType: faker.system.mimeType(),
          metadata: {
            width: faker.number.int({ min: 100, max: 1920 }),
            height: faker.number.int({ min: 100, max: 1080 }),
            duration: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 300 })),
            thumbnail: faker.image.urlLoremFlickr({ category: 'gaming' }),
          },
        }]),
        metadata: {
          replyTo: faker.helpers.maybe(() => faker.string.uuid()),
          mentions: faker.helpers.maybe(() => faker.helpers.arrayElements(participantIds, { min: 1, max: 3 })),
          links: faker.helpers.maybe(() => [faker.internet.url()]),
          reactions: faker.helpers.maybe(() => [{
            id: faker.string.uuid(),
            userId: faker.helpers.arrayElement(participantIds),
            emoji: faker.helpers.arrayElement(['👍', '❤️', '😂', '😮', '😢', '😡']),
            createdAt: faker.date.recent(),
          }]),
        },
      };

      this.messages.set(message.id, message);
    }
  }

  /**
   * Generate friendships between users
   */
  private generateFriendships(): void {
    const userIds = Array.from(this.users.keys());

    userIds.forEach(userId => {
      const friendCount = faker.number.int({ min: 0, max: 20 });
      const friendIds = faker.helpers.arrayElements(userIds.filter(id => id !== userId), friendCount);

      const userFriends: IFriend[] = friendIds.map(friendId => {
        const friend = this.users.get(friendId)!;
        return {
          ...friend,
          friendshipStatus: faker.helpers.arrayElement(['pending', 'accepted', 'blocked']),
          friendSince: faker.date.past(),
        };
      });

      this.friends.set(userId, userFriends);
    });
  }

  /**
   * Generate user activities
   */
  private generateActivities(): void {
    const userIds = Array.from(this.users.keys());
    const gameIds = Array.from(this.games.keys());

    userIds.forEach(userId => {
      const activityCount = faker.number.int({ min: 5, max: 20 });

      for (let i = 0; i < activityCount; i++) {
        const activity: IActivity = {
          id: faker.string.uuid(),
          type: faker.helpers.arrayElement(['post', 'achievement', 'game']),
          content: faker.lorem.sentence(),
          user: this.users.get(userId)!,
          likes: faker.number.int({ min: 0, max: 100 }),
          isLiked: faker.datatype.boolean(),
          comments: [],
          media: faker.helpers.maybe(() => ({
            type: faker.helpers.arrayElement(['image', 'video']),
            file: new File([''], 'mock.jpg', { type: 'image/jpeg' }),
            preview: faker.image.urlLoremFlickr({ category: 'gaming' }),
            url: faker.image.urlLoremFlickr({ category: 'gaming' }),
          })),
          gameId: faker.helpers.maybe(() => gameIds[faker.number.int({ min: 0, max: gameIds.length - 1 })]),
          createdAt: faker.date.recent(),
          updatedAt: faker.date.recent(),
        };

        this.activities.set(activity.id, activity);
      }
    });
  }

  /**
   * Generate notifications
   */
  private generateNotifications(): void {
    const userIds = Array.from(this.users.keys());

    userIds.forEach(userId => {
      const notificationCount = faker.number.int({ min: 0, max: 10 });

      for (let i = 0; i < notificationCount; i++) {
        const notification: INotification = {
          id: faker.string.uuid(),
          type: faker.helpers.arrayElement(['MESSAGE', 'FRIEND_REQUEST', 'ACHIEVEMENT', 'SYSTEM']),
          title: this.generateNotificationTitle(),
          description: faker.lorem.sentence(),
          read: faker.datatype.boolean(),
          createdAt: faker.date.recent(),
          data: {
            conversationId: faker.helpers.maybe(() => Array.from(this.conversations.keys())[faker.number.int({ min: 0, max: this.conversations.size - 1 })]),
            userId: faker.helpers.maybe(() => userIds[faker.number.int({ min: 0, max: userIds.length - 1 })]),
            achievementId: faker.helpers.maybe(() => Array.from(this.achievements.keys())[faker.number.int({ min: 0, max: this.achievements.size - 1 })]),
            post: faker.helpers.maybe(() => Array.from(this.posts.values())[faker.number.int({ min: 0, max: this.posts.size - 1 })]),
          },
        };

        this.notifications.set(notification.id, notification);
      }
    });
  }

  // Helper methods for data generation
  private getRandomRank(): string {
    return faker.helpers.arrayElement(['Rookie', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster']);
  }

  private generatePostContent(): string {
    const templates = [
      'Just achieved {achievement} in {game}! 🎮',
      'Amazing game session with {friends}! We dominated! 💪',
      'New personal best in {game}: {score} points! 🏆',
      'Can\'t believe I pulled off that {move} in {game}! 😱',
      'Looking for teammates for {game}. Anyone interested? 🤝',
      'Review of {game}: {rating}/10. {comment}',
      'Tournament announcement: {tournament} starting next week! 🏅',
      'Streaming {game} tonight at 8 PM! Come join the fun! 📺',
    ];

    const template = faker.helpers.arrayElement(templates);
    return template
      .replace('{achievement}', faker.helpers.arrayElement(['First Blood', 'Unstoppable', 'Sharpshooter']))
      .replace('{game}', faker.helpers.arrayElement(['Valorant', 'League of Legends', 'CS2']))
      .replace('{friends}', faker.helpers.arrayElement(['the squad', 'my team', 'everyone']))
      .replace('{score}', faker.number.int({ min: 1000, max: 10000 }).toString())
      .replace('{move}', faker.helpers.arrayElement(['360 no-scope', 'clutch play', 'perfect round']))
      .replace('{rating}', faker.number.int({ min: 7, max: 10 }).toString())
      .replace('{comment}', faker.lorem.sentence())
      .replace('{tournament}', faker.helpers.arrayElement(['Summer Championship', 'Pro League', 'Community Cup']));
  }

  private generateMessageContent(): string {
    const templates = [
      'Hey! How\'s it going?',
      'Want to play {game} later?',
      'Great game last night!',
      'Did you see the new update?',
      'Check out this clip I made!',
      'What do you think about {game}?',
      'Are you free for a quick match?',
      'That was an amazing play!',
      'Thanks for the game!',
      'See you online later!',
    ];

    const template = faker.helpers.arrayElement(templates);
    return template.replace('{game}', faker.helpers.arrayElement(['Valorant', 'League of Legends', 'CS2']));
  }

  private generateNotificationTitle(): string {
    const templates = [
      'New message from {user}',
      '{user} sent you a friend request',
      'You unlocked {achievement}!',
      'New tournament available',
      'Your post got {count} likes',
      'Game update available',
      'Weekly challenge completed',
      'New achievement available',
    ];

    const template = faker.helpers.arrayElement(templates);
    return template
      .replace('{user}', faker.person.firstName())
      .replace('{achievement}', faker.helpers.arrayElement(['First Blood', 'Sharpshooter', 'Team Player']))
      .replace('{count}', faker.number.int({ min: 1, max: 100 }).toString());
  }

  // Public API methods
  public getUsers(): IUser[] {
    return Array.from(this.users.values());
  }

  public getUser(id: string): IUser | undefined {
    return this.users.get(id);
  }

  public getPosts(): IPost[] {
    return Array.from(this.posts.values());
  }

  public getPost(id: string): IPost | undefined {
    return this.posts.get(id);
  }

  public getMessages(): IMessage[] {
    return Array.from(this.messages.values());
  }

  public getMessagesByConversation(conversationId: string): IMessage[] {
    return Array.from(this.messages.values()).filter(msg => msg.conversationId === conversationId);
  }

  public getConversations(): IConversation[] {
    return Array.from(this.conversations.values());
  }

  public getConversation(id: string): IConversation | undefined {
    return this.conversations.get(id);
  }

  public getGames(): IGame[] {
    return Array.from(this.games.values());
  }

  public getGame(id: string): IGame | undefined {
    return this.games.get(id);
  }

  public getAchievements(): IAchievement[] {
    return Array.from(this.achievements.values());
  }

  public getAchievement(id: string): IAchievement | undefined {
    return this.achievements.get(id);
  }

  public getNotifications(): INotification[] {
    return Array.from(this.notifications.values());
  }

  public getActivities(): IActivity[] {
    return Array.from(this.activities.values());
  }

  public getFriends(userId: string): IFriend[] {
    return this.friends.get(userId) || [];
  }

  public searchUsers(query: string): IUser[] {
    const users = this.getUsers();
    return users.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase())
      || user.name.toLowerCase().includes(query.toLowerCase()));
  }

  public searchGames(query: string): IGame[] {
    const games = this.getGames();
    return games.filter(game =>
      game.title.toLowerCase().includes(query.toLowerCase())
      || game.genre.toLowerCase().includes(query.toLowerCase()));
  }

  public getPostsByUser(userId: string): IPost[] {
    return this.getPosts().filter(post => post.author.id === userId);
  }

  public getActivitiesByUser(userId: string): IActivity[] {
    return this.getActivities().filter(activity => activity.user.id === userId);
  }

  public getNotificationsByUser(userId: string): INotification[] {
    return this.getNotifications().filter(notification =>
      notification.data?.userId === userId);
  }
}

// Export singleton instance
export const mockDatabase = new MockDatabase();
