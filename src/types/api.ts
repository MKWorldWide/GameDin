/**
 * API Type Definitions
 * 
 * This file contains TypeScript interface definitions for all API responses
 * used throughout the application. These types ensure type safety when
 * working with API data.
 */

// ========== Base Types ==========

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  totalCount?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: number;
  requestId?: string;
}

// ========== User Types ==========

export interface UserProfile {
  id: string;
  username: string;
  email: string; 
  displayName: string;
  avatar?: string;
  bio?: string;
  status?: 'online' | 'away' | 'offline' | 'gaming';
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    messages: boolean;
    friendRequests: boolean;
    gameInvites: boolean;
    eventReminders: boolean;
  };
  privacy?: {
    showOnlineStatus: boolean;
    showGames: boolean;
    showFriends: boolean;
  };
  accessibility?: {
    fontSize?: 'small' | 'medium' | 'large';
    highContrast?: boolean;
    reducedMotion?: boolean;
  };
}

export interface UserStats {
  totalGames?: number;
  favoriteGame?: string;
  friendCount?: number;
  eventsAttended?: number;
  accountAge?: number; // in days
  lastGamePlayed?: {
    id: string;
    name: string;
    timestamp: string;
  };
}

export interface FriendListResponse {
  friends: FriendConnection[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
}

export interface FriendConnection {
  id: string;
  user: UserProfile;
  status: 'online' | 'away' | 'offline' | 'gaming';
  currentGame?: {
    id: string;
    name: string;
    startTime: string;
  };
  lastActive: string;
  friendship: {
    since: string;
    initiatedBy: string;
  };
}

export interface FriendRequest {
  id: string;
  sender: UserProfile;
  recipient: UserProfile;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
  message?: string;
}

// ========== Messaging Types ==========

export interface Conversation {
  id: string;
  title?: string;
  type: 'direct' | 'group';
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isTyping?: TypingIndicator[];
}

export interface ConversationParticipant {
  id: string;
  user: UserProfile;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  content: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  updatedAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  readBy?: {
    userId: string;
    timestamp: string;
  }[];
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnailUrl?: string;
  name: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface TypingIndicator {
  userId: string;
  username: string;
  displayName: string;
  timestamp: string;
}

// ========== Game Types ==========

export interface Game {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  bannerImage?: string;
  releaseDate?: string;
  genre?: string[];
  platforms?: string[];
  publisher?: string;
  developer?: string;
  rating?: number;
  tags?: string[];
  popularity?: number;
  playerCount?: {
    min: number;
    max: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserGame {
  id: string;
  userId: string;
  game: Game;
  status: 'playing' | 'completed' | 'backlog' | 'interested';
  favorite: boolean;
  playtime?: number; // in minutes
  lastPlayed?: string;
  platforms?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ========== Event Types ==========

export interface GameEvent {
  id: string;
  title: string;
  description?: string;
  game?: Game;
  creator: UserProfile;
  startTime: string;
  endTime?: string;
  location?: {
    type: 'online' | 'physical';
    details: string;
  };
  maxParticipants?: number;
  currentParticipants: EventParticipant[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  visibility: 'public' | 'friends' | 'private';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  user: UserProfile;
  role: 'host' | 'co-host' | 'participant';
  status: 'attending' | 'tentative' | 'declined';
  joinedAt: string;
}

// ========== Notification Types ==========

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'friend_request' | 'event_invite' | 'system' | 'game_invite';
  title: string;
  content: string;
  read: boolean;
  actionLink?: string;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  data?: Record<string, any>;
}

// ========== Error Types ==========

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: number;
  requestId?: string;
  status: number;
} 