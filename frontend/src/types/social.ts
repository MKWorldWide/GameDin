/**
 * Social Types for GameDin Application
 *
 * This module defines all social interaction types including users, posts,
 * conversations, messages, and related interfaces for the gaming social platform.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

// Basic user types
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  rank?: string;
  level?: number;
}

// Message and conversation types
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
export type ConversationType = 'PRIVATE' | 'GROUP';
export type ParticipantRole = 'ADMIN' | 'MEMBER';
export type UserPresence = 'online' | 'offline' | 'away' | 'busy';

// Rich text content for posts
export interface RichTextContent {
  blocks: Array<{
    id: string;
    type: 'paragraph' | 'heading' | 'list' | 'code' | 'image' | 'video';
    content: string;
    metadata?: Record<string, any>;
  }>;
  formatting: Array<{
    blockId: string;
    range: [number, number];
    style: 'bold' | 'italic' | 'link' | 'mention' | 'hashtag';
    data?: Record<string, any>;
  }>;
}

// Post and comment types
export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  comments: Comment[];
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  createdAt: string;
  updatedAt: string;
}

// Reaction and attachment types
export interface Reaction {
  id: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
  userId: string;
  createdAt: string;
}

export interface Attachment {
  url: string;
  type: 'image' | 'video' | 'link';
  description?: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'message';
  sender: User;
  recipient: User;
  post?: Post;
  createdAt: string;
  updatedAt: string;
}

// Feed and activity types
export interface FeedItem {
  id: string;
  type: 'post' | 'shared' | 'activity';
  content: PostContent;
  author: User;
  createdAt: string;
  updatedAt: string;
  reactions: Reaction[];
  comments: Comment[];
  score: number;
  position: number;
  seen: boolean;
  promoted: boolean;
}

export interface PostContent {
  text: string;
  richText: any | null; // Replace with proper rich text type when implemented
  attachments: Attachment[];
}

export interface SharedContent extends Post {
  originalPost: Post;
  sharerComment?: string;
}

export interface ActivityContent {
  type: 'follow' | 'reaction' | 'achievement';
  actors: User[];
  target: Post | User;
  timestamp: string;
}

export interface FeedState {
  items: FeedItem[];
  lastFetched: string;
  hasMore: boolean;
  loading: boolean;
  error: Error | null;
  filters: {
    type: string[];
    timeRange: string;
    following: boolean;
  };
}

// WebSocket message types
export interface WebSocketMessage {
  id: string;
  type: 'ACTIVITY_CREATE' | 'ACTIVITY_UPDATE' | 'ACTIVITY_DELETE' | 'MESSAGE_CREATE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE';
  data: {
    activity?: IActivity;
    activityId?: string;
    message?: IMessage;
    messageId?: string;
  };
  timestamp: string;
}

// Cache configuration
export interface CacheConfig {
  key: string;
  ttl: number;
  version: string;
  dependencies: string[];
}

// Extended user interface with gaming features
export interface IUser {
  id: string;
  email: string;
  username: string;
  name: string;
  picture?: string;
  avatar: string;
  bio: string;
  level: number;
  rank: string;
  status: UserPresence;
  lastSeen: Date;
  friends: IFriend[];
  gameStats: {
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    achievements: string[];
  };
  settings: {
    profileVisibility: 'public' | 'friends' | 'private';
    notifications: {
      push: boolean;
      email: boolean;
      emailNotifications: {
        frequency: 'daily' | 'weekly' | 'real-time';
        types: {
          friendRequests: boolean;
          messages: boolean;
          gameInvites: boolean;
          achievements: boolean;
        };
      };
    };
    privacy: {
      showOnlineStatus: boolean;
      showLastSeen: boolean;
      allowFriendRequests: boolean;
      showGameStats: boolean;
    };
  };
  attributes?: Record<string, string | undefined>;
}

// Friend relationship types
export interface IFriend extends IUser {
  friendshipStatus: 'pending' | 'accepted' | 'blocked';
  friendSince: string;
}

// User profile types
export interface IUserProfile {
  user: IUser;
  isCurrentUser: boolean;
}

// Post types with media support
export interface IPost {
  id: string;
  content: string;
  author: IUser;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  media?: IPostMedia;
}

export interface IComment {
  id: string;
  content: string;
  author: IUser;
  post: Post;
  postId: string;
  createdAt: string;
  updatedAt: string;
}

// Achievement and game preference types
export interface IAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface IGamePreference {
  id: string;
  name: string;
  genre: string;
  platform: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'pro';
}

export interface ISocialLink {
  platform: string;
  url: string;
}

// Media types
export interface IPostMedia {
  type: 'image' | 'video';
  file: File;
  preview: string;
  url?: string;
}

// Game activity types
export interface IGameActivity {
  id: string;
  game: {
    id: string;
    title: string;
    coverImage: string;
  };
  user: IUser;
  type: 'played' | 'reviewed' | 'rated' | 'achieved';
  score?: number;
  review?: string;
  achievement?: string;
  createdAt: string;
  updatedAt: string;
}

// Message and conversation types
export interface IMessage {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  author: IUser;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  attachments?: IAttachment[];
  metadata?: {
    replyTo?: string;
    mentions?: string[];
    links?: string[];
    reactions?: IReaction[];
  };
}

export interface IAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
  };
}

export interface IReaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface IConversationParticipant {
  id: string;
  user: IUser;
  role: ParticipantRole;
  joinedAt: Date;
  lastRead?: Date;
  isTyping: boolean;
  isMuted: boolean;
}

export interface IConversation {
  id: string;
  type: ConversationType;
  title?: string;
  description?: string;
  groupAvatar?: string;
  participants: IConversationParticipant[];
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    theme?: string;
    pinnedMessages?: string[];
    customEmoji?: Record<string, string>;
  };
}

// Group participant types
export interface GroupParticipant {
  id: string;
  role: 'owner' | 'admin' | 'member';
  user: IUser;
  conversation: IConversation;
  createdAt: string;
  updatedAt: string;
}

// Message input types
export interface IMessageInput {
  content: string;
  recipientId: string;
  attachments?: File[];
  metadata?: {
    replyTo?: string;
    mentions?: string[];
  };
}

// Notification types
export interface INotification {
  id: string;
  type: 'MESSAGE' | 'FRIEND_REQUEST' | 'ACHIEVEMENT' | 'SYSTEM';
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  data?: {
    conversationId?: string;
    userId?: string;
    achievementId?: string;
    post?: IPost;
  };
}

// Activity types
export interface IActivity {
  id: string;
  type: 'post' | 'achievement' | 'game';
  content: string;
  user: IUser;
  likes: number;
  isLiked: boolean;
  lastMessage?: IMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    theme?: string;
    pinnedMessages?: string[];
    customEmoji?: Record<string, string>;
  };
}

// Pagination and response types
export interface IPaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  hasMore: boolean;
}

// WebSocket message types
export interface IWebSocketMessage<T = unknown> {
  type: 'MESSAGE' | 'TYPING' | 'PRESENCE' | 'REACTION';
  payload: T;
  timestamp: Date;
}

// Typing indicator types
export interface ITypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

// Presence update types
export interface IPresenceUpdate {
  userId: string;
  status: UserPresence;
  lastSeen: Date;
}

// Error types
export interface IChatError extends Error {
  code: string;
  details?: Record<string, unknown>;
  retry?: boolean;
}
