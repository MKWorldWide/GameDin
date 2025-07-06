/**
 * Mock API Service - RESTful Endpoints
 *
 * This service provides comprehensive RESTful API endpoints that mirror the real
 * GameDin backend, enabling full application testing without external dependencies.
 *
 * Feature Context:
 * - Provides all CRUD operations for users, posts, messages, games, achievements
 * - Includes authentication, search, and social interaction endpoints
 * - Supports real-time-like operations with realistic response times
 * - Maintains data consistency and relationships
 *
 * Usage Example:
 *   const api = new MockApiService();
 *   const users = await api.getUsers();
 *   const posts = await api.getPosts();
 *
 * Dependency Listing:
 * - MockDatabase (frontend/src/services/mockDatabase.ts)
 * - IUser, IPost, IMessage, IGame, IAchievement types (frontend/src/types/social.ts)
 * - Axios-like response structure for compatibility
 *
 * Performance Considerations:
 * - Simulated network delays for realistic testing
 * - Efficient data filtering and pagination
 * - Optimized search algorithms
 *
 * Security Implications:
 * - No real authentication required
 * - All endpoints are publicly accessible for testing
 * - Mock tokens and session management
 *
 * Changelog:
 * - [v3.2.2] Created comprehensive mock API service with all GameDin endpoints and realistic responses
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
  IPaginatedResponse,
} from '../types/social';

import { mockDatabase } from './mockDatabase';

/**
 * Mock API Response Interface
 */
interface MockApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

/**
 * Mock API Error Interface
 */
interface MockApiError {
  response: {
    data: {
      message: string;
      code: string;
      details?: any;
    };
    status: number;
    statusText: string;
  };
}

/**
 * Mock API Service Class
 */
export class MockApiService {
  private baseURL: string = '/api';
  private delay: number = 100; // Simulated network delay in ms

  constructor(delay: number = 100) {
    this.delay = delay;
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  /**
   * Create successful API response
   */
  private createResponse<T>(data: T, status: number = 200): MockApiResponse<T> {
    return {
      data,
      status,
      statusText: this.getStatusText(status),
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
      config: {
        url: this.baseURL,
        method: 'GET',
      },
    };
  }

  /**
   * Create error response
   */
  private createError(message: string, status: number = 400): MockApiError {
    return {
      response: {
        data: {
          message,
          code: this.getErrorCode(status),
        },
        status,
        statusText: this.getStatusText(status),
      },
    };
  }

  /**
   * Get HTTP status text
   */
  private getStatusText(status: number): string {
    const statusTexts: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    return statusTexts[status] || 'Unknown';
  }

  /**
   * Get error code
   */
  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      500: 'INTERNAL_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  /**
   * Simulate random errors (5% chance)
   */
  private shouldSimulateError(): boolean {
    return Math.random() < 0.05;
  }

  // Authentication Endpoints

  /**
   * POST /api/auth/login
   */
  async login(credentials: { email: string; password: string }): Promise<MockApiResponse<{ user: IUser; token: string }>> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw this.createError('Invalid credentials', 401);
    }

    const users = mockDatabase.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw this.createError('User not found', 404);
    }

    const token = `mock_token_${user.id}_${Date.now()}`;
    return this.createResponse({ user, token });
  }

  /**
   * POST /api/auth/register
   */
  async register(userData: { email: string; password: string; username: string }): Promise<MockApiResponse<{ user: IUser; token: string }>> {
    await this.simulateDelay();

    if (this.shouldSimulateError()) {
      throw this.createError('Registration failed', 400);
    }

    const newUser: IUser = {
      id: `user_${Date.now()}`,
      email: userData.email,
      username: userData.username,
      name: userData.username,
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
      bio: '',
      level: 1,
      rank: 'Rookie',
      status: 'online',
      lastSeen: new Date(),
      friends: [],
      gameStats: {
        gamesPlayed: 0,
        gamesWon: 0,
        winRate: 0,
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
        email: userData.email,
        name: userData.username,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
        rank: 'Rookie',
      },
    };

    const token = `mock_token_${newUser.id}_${Date.now()}`;
    return this.createResponse({ user: newUser, token }, 201);
  }

  /**
   * POST /api/auth/logout
   */
  async logout(): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateDelay();
    return this.createResponse({ message: 'Successfully logged out' });
  }

  // User Endpoints

  /**
   * GET /api/users
   */
  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<MockApiResponse<IPaginatedResponse<IUser>>> {
    await this.simulateDelay();

    let users = mockDatabase.getUsers();

    // Apply search filter
    if (params?.search) {
      users = mockDatabase.searchUsers(params.search);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    const response: IPaginatedResponse<IUser> = {
      items: paginatedUsers,
      hasMore: endIndex < users.length,
      nextToken: endIndex < users.length ? `page_${page + 1}` : undefined,
    };

    return this.createResponse(response);
  }

  /**
   * GET /api/users/:id
   */
  async getUser(id: string): Promise<MockApiResponse<IUser>> {
    await this.simulateDelay();

    const user = mockDatabase.getUser(id);
    if (!user) {
      throw this.createError('User not found', 404);
    }

    return this.createResponse(user);
  }

  /**
   * PUT /api/users/:id
   */
  async updateUser(id: string, updates: Partial<IUser>): Promise<MockApiResponse<IUser>> {
    await this.simulateDelay();

    const user = mockDatabase.getUser(id);
    if (!user) {
      throw this.createError('User not found', 404);
    }

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    return this.createResponse(updatedUser);
  }

  /**
   * GET /api/users/:id/posts
   */
  async getUserPosts(userId: string, params?: { page?: number; limit?: number }): Promise<MockApiResponse<IPaginatedResponse<IPost>>> {
    await this.simulateDelay();

    const posts = mockDatabase.getPostsByUser(userId);
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    const response: IPaginatedResponse<IPost> = {
      items: paginatedPosts,
      hasMore: endIndex < posts.length,
      nextToken: endIndex < posts.length ? `page_${page + 1}` : undefined,
    };

    return this.createResponse(response);
  }

  /**
   * GET /api/users/:id/friends
   */
  async getUserFriends(userId: string): Promise<MockApiResponse<IFriend[]>> {
    await this.simulateDelay();

    const friends = mockDatabase.getFriends(userId);
    return this.createResponse(friends);
  }

  // Post Endpoints

  /**
   * GET /api/posts
   */
  async getPosts(params?: { page?: number; limit?: number; userId?: string }): Promise<MockApiResponse<IPaginatedResponse<IPost>>> {
    await this.simulateDelay();

    let posts = mockDatabase.getPosts();

    // Filter by user if specified
    if (params?.userId) {
      posts = posts.filter(post => post.author.id === params.userId);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    const response: IPaginatedResponse<IPost> = {
      items: paginatedPosts,
      hasMore: endIndex < posts.length,
      nextToken: endIndex < posts.length ? `page_${page + 1}` : undefined,
    };

    return this.createResponse(response);
  }

  /**
   * GET /api/posts/:id
   */
  async getPost(id: string): Promise<MockApiResponse<IPost>> {
    await this.simulateDelay();

    const post = mockDatabase.getPost(id);
    if (!post) {
      throw this.createError('Post not found', 404);
    }

    return this.createResponse(post);
  }

  /**
   * POST /api/posts
   */
  async createPost(postData: { content: string; authorId: string; gameId?: string }): Promise<MockApiResponse<IPost>> {
    await this.simulateDelay();

    const author = mockDatabase.getUser(postData.authorId);
    if (!author) {
      throw this.createError('Author not found', 404);
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

    return this.createResponse(newPost, 201);
  }

  /**
   * PUT /api/posts/:id
   */
  async updatePost(id: string, updates: Partial<IPost>): Promise<MockApiResponse<IPost>> {
    await this.simulateDelay();

    const post = mockDatabase.getPost(id);
    if (!post) {
      throw this.createError('Post not found', 404);
    }

    const updatedPost = { ...post, ...updates, updatedAt: new Date().toISOString() };
    return this.createResponse(updatedPost);
  }

  /**
   * DELETE /api/posts/:id
   */
  async deletePost(id: string): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateDelay();

    const post = mockDatabase.getPost(id);
    if (!post) {
      throw this.createError('Post not found', 404);
    }

    return this.createResponse({ message: 'Post deleted successfully' });
  }

  // Message Endpoints

  /**
   * GET /api/conversations
   */
  async getConversations(userId: string): Promise<MockApiResponse<IConversation[]>> {
    await this.simulateDelay();

    const conversations = mockDatabase.getConversations().filter(conv =>
      conv.participants.some(p => p.user.id === userId));

    return this.createResponse(conversations);
  }

  /**
   * GET /api/conversations/:id/messages
   */
  async getMessages(conversationId: string, params?: { page?: number; limit?: number }): Promise<MockApiResponse<IPaginatedResponse<IMessage>>> {
    await this.simulateDelay();

    const messages = mockDatabase.getMessagesByConversation(conversationId);
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    const response: IPaginatedResponse<IMessage> = {
      items: paginatedMessages,
      hasMore: endIndex < messages.length,
      nextToken: endIndex < messages.length ? `page_${page + 1}` : undefined,
    };

    return this.createResponse(response);
  }

  /**
   * POST /api/conversations/:id/messages
   */
  async sendMessage(conversationId: string, messageData: { content: string; authorId: string }): Promise<MockApiResponse<IMessage>> {
    await this.simulateDelay();

    const author = mockDatabase.getUser(messageData.authorId);
    if (!author) {
      throw this.createError('Author not found', 404);
    }

    const newMessage: IMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      content: messageData.content,
      type: 'text',
      author,
      status: 'sent',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.createResponse(newMessage, 201);
  }

  // Game Endpoints

  /**
   * GET /api/games
   */
  async getGames(params?: { page?: number; limit?: number; search?: string; genre?: string }): Promise<MockApiResponse<IPaginatedResponse<IGame>>> {
    await this.simulateDelay();

    let games = mockDatabase.getGames();

    // Apply search filter
    if (params?.search) {
      games = mockDatabase.searchGames(params.search);
    }

    // Apply genre filter
    if (params?.genre) {
      games = games.filter(game => game.genre === params.genre);
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedGames = games.slice(startIndex, endIndex);

    const response: IPaginatedResponse<IGame> = {
      items: paginatedGames,
      hasMore: endIndex < games.length,
      nextToken: endIndex < games.length ? `page_${page + 1}` : undefined,
    };

    return this.createResponse(response);
  }

  /**
   * GET /api/games/:id
   */
  async getGame(id: string): Promise<MockApiResponse<IGame>> {
    await this.simulateDelay();

    const game = mockDatabase.getGame(id);
    if (!game) {
      throw this.createError('Game not found', 404);
    }

    return this.createResponse(game);
  }

  // Achievement Endpoints

  /**
   * GET /api/achievements
   */
  async getAchievements(params?: { userId?: string; gameId?: string }): Promise<MockApiResponse<IAchievement[]>> {
    await this.simulateDelay();

    let achievements = mockDatabase.getAchievements();

    // Filter by user if specified
    if (params?.userId) {
      const user = mockDatabase.getUser(params.userId);
      if (user) {
        achievements = achievements.filter(achievement =>
          user.gameStats.achievements.includes(achievement.id));
      }
    }

    // Filter by game if specified
    if (params?.gameId) {
      achievements = achievements.filter(achievement => achievement.gameId === params.gameId);
    }

    return this.createResponse(achievements);
  }

  // Notification Endpoints

  /**
   * GET /api/notifications
   */
  async getNotifications(userId: string, params?: { unreadOnly?: boolean }): Promise<MockApiResponse<INotification[]>> {
    await this.simulateDelay();

    let notifications = mockDatabase.getNotificationsByUser(userId);

    if (params?.unreadOnly) {
      notifications = notifications.filter(notification => !notification.read);
    }

    return this.createResponse(notifications);
  }

  /**
   * PUT /api/notifications/:id/read
   */
  async markNotificationAsRead(id: string): Promise<MockApiResponse<INotification>> {
    await this.simulateDelay();

    const notifications = mockDatabase.getNotifications();
    const notification = notifications.find(n => n.id === id);

    if (!notification) {
      throw this.createError('Notification not found', 404);
    }

    const updatedNotification = { ...notification, read: true };
    return this.createResponse(updatedNotification);
  }

  // Activity Endpoints

  /**
   * GET /api/activities
   */
  async getActivities(params?: { userId?: string; type?: string }): Promise<MockApiResponse<IActivity[]>> {
    await this.simulateDelay();

    let activities = mockDatabase.getActivities();

    // Filter by user if specified
    if (params?.userId) {
      activities = activities.filter(activity => activity.user.id === params.userId);
    }

    // Filter by type if specified
    if (params?.type) {
      activities = activities.filter(activity => activity.type === params.type);
    }

    return this.createResponse(activities);
  }

  // Search Endpoints

  /**
   * GET /api/search
   */
  async search(query: string, type?: 'users' | 'games' | 'posts'): Promise<MockApiResponse<any>> {
    await this.simulateDelay();

    const results: any = {};

    if (!type || type === 'users') {
      results.users = mockDatabase.searchUsers(query);
    }

    if (!type || type === 'games') {
      results.games = mockDatabase.searchGames(query);
    }

    if (!type || type === 'posts') {
      const posts = mockDatabase.getPosts();
      results.posts = posts.filter(post =>
        post.content.toLowerCase().includes(query.toLowerCase()));
    }

    return this.createResponse(results);
  }

  // Friend Endpoints

  /**
   * POST /api/friends/request
   */
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateDelay();

    const fromUser = mockDatabase.getUser(fromUserId);
    const toUser = mockDatabase.getUser(toUserId);

    if (!fromUser || !toUser) {
      throw this.createError('User not found', 404);
    }

    return this.createResponse({ message: 'Friend request sent successfully' });
  }

  /**
   * POST /api/friends/accept
   */
  async acceptFriendRequest(userId: string, friendId: string): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateDelay();

    const user = mockDatabase.getUser(userId);
    const friend = mockDatabase.getUser(friendId);

    if (!user || !friend) {
      throw this.createError('User not found', 404);
    }

    return this.createResponse({ message: 'Friend request accepted' });
  }

  /**
   * DELETE /api/friends/:friendId
   */
  async removeFriend(userId: string, friendId: string): Promise<MockApiResponse<{ message: string }>> {
    await this.simulateDelay();

    const user = mockDatabase.getUser(userId);
    const friend = mockDatabase.getUser(friendId);

    if (!user || !friend) {
      throw this.createError('User not found', 404);
    }

    return this.createResponse({ message: 'Friend removed successfully' });
  }
}

// Export singleton instance
export const mockApi = new MockApiService();
