/**
 * IndexedDB Service
 * 
 * Provides a comprehensive offline data storage solution using Dexie.js.
 * This service handles:
 * - Local caching of API responses
 * - Offline data access and persistence
 * - Background synchronization when connectivity is restored
 * - Data expiration and automatic cleanup
 */

import Dexie, { Table } from 'dexie';
import { config } from '../config';
import { User } from './authService';

// Define store (table) names
export const STORE = {
  CACHE: 'cache',
  OFFLINE_QUEUE: 'offlineQueue',
  MESSAGES: 'messages',
  USERS: 'users',
  GAME_SESSIONS: 'gameSessions',
  GAME_LIBRARIES: 'gameLibraries',
  APP_STATE: 'appState',
};

// Cache item interface
interface CacheItem {
  id: string;
  data: any;
  expires: number;
  lastUpdated: number;
  key: string;
  store: string;
}

// Offline queue item interface
interface OfflineQueueItem {
  id?: number;
  url: string;
  method: string;
  body: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  priority: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

// Message interface
interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isLocalOnly: boolean;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    thumbnail?: string;
    size?: number;
    name?: string;
  }>;
  reactions?: Array<{
    userId: string;
    reaction: string;
    timestamp: number;
  }>;
}

// Game session interface
interface GameSession {
  id: string;
  title: string;
  gameId: string;
  description: string;
  startTime: number;
  endTime?: number;
  location?: {
    type: 'online' | 'physical';
    details: string;
  };
  hostId: string;
  participants: Array<{
    userId: string;
    status: 'invited' | 'accepted' | 'declined' | 'maybe';
    joinedAt?: number;
  }>;
  capacity: number;
  isPrivate: boolean;
  tags: string[];
  lastUpdated: number;
}

// Game library item interface
interface GameLibraryItem {
  id: string;
  userId: string;
  gameId: string;
  title: string;
  coverImage?: string;
  addedAt: number;
  lastPlayed?: number;
  playTime?: number;
  rating?: number;
  status: 'want-to-play' | 'playing' | 'completed' | 'abandoned';
  notes?: string;
  platforms: string[];
  tags: string[];
  isLocalOnly: boolean;
}

// App state interface
interface AppState {
  id: string;
  key: string;
  value: any;
  lastUpdated: number;
}

/**
 * GameDinDatabase class extending Dexie
 * Handles all offline data storage for the application
 */
class GameDinDatabase extends Dexie {
  cache!: Table<CacheItem>;
  offlineQueue!: Table<OfflineQueueItem>;
  messages!: Table<Message>;
  users!: Table<User & { lastUpdated: number }>;
  gameSessions!: Table<GameSession>;
  gameLibraries!: Table<GameLibraryItem>;
  appState!: Table<AppState>;

  constructor() {
    super('GameDinDB');
    
    // Define the database schema
    this.version(1).stores({
      // Simple key-value cache for API responses
      cache: 'id, key, store, expires',
      
      // Queue for operations to be performed when online
      offlineQueue: '++id, url, method, timestamp, status, priority',
      
      // User messages for chat functionality
      messages: 'id, conversationId, senderId, receiverId, timestamp, status',
      
      // User profiles for offline access
      users: 'id, email, username, lastUpdated',
      
      // Game sessions for events and multiplayer
      gameSessions: 'id, gameId, hostId, startTime, lastUpdated',
      
      // User's game library
      gameLibraries: 'id, userId, gameId, status, lastPlayed, isLocalOnly',
      
      // Application state (settings, preferences, etc.)
      appState: 'id, key, lastUpdated',
    });
  }
  
  /**
   * Initialize the database and perform cleanup
   */
  async initialize(): Promise<void> {
    try {
      // Clean up expired cache entries
      await this.cleanup();
      
      // Process pending offline queue items if online
      if (navigator.onLine) {
        this.processPendingQueue();
      }
      
      console.log('IndexedDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }
  
  /**
   * Set a cached item with optional expiration
   * @param store Store name
   * @param data Data to cache
   * @param expiresIn Time in milliseconds until the cache expires (default: 1 hour)
   */
  async setCache(
    store: string,
    data: any,
    expiresIn: number = 60 * 60 * 1000
  ): Promise<void> {
    try {
      const now = Date.now();
      const id = data.id || `${store}-${now}`;
      const key = `${store}-${id}`;
      
      await this.cache.put({
        id,
        key,
        store,
        data,
        expires: now + expiresIn,
        lastUpdated: now,
      });
    } catch (error) {
      console.error(`Failed to cache item in ${store}:`, error);
    }
  }
  
  /**
   * Get a cached item
   * @param store Store name
   * @param id Item ID
   * @returns Cached data or null if not found or expired
   */
  async getCache<T = any>(store: string, id: string): Promise<T | null> {
    try {
      const now = Date.now();
      const key = `${store}-${id}`;
      
      const cacheItem = await this.cache
        .where('key')
        .equals(key)
        .first();
      
      // Return null if item doesn't exist or is expired
      if (!cacheItem || cacheItem.expires < now) {
        if (cacheItem && cacheItem.expires < now) {
          // Delete expired item
          await this.cache.delete(cacheItem.id);
        }
        return null;
      }
      
      return cacheItem.data as T;
    } catch (error) {
      console.error(`Failed to get cached item from ${store}:`, error);
      return null;
    }
  }
  
  /**
   * Delete a cached item
   * @param store Store name
   * @param id Item ID
   */
  async deleteCache(store: string, id: string): Promise<void> {
    try {
      const key = `${store}-${id}`;
      
      // Find the cache item by key
      const cacheItem = await this.cache
        .where('key')
        .equals(key)
        .first();
      
      if (cacheItem) {
        await this.cache.delete(cacheItem.id);
      }
    } catch (error) {
      console.error(`Failed to delete cached item from ${store}:`, error);
    }
  }
  
  /**
   * Add an item to the offline queue
   * @param url API endpoint
   * @param method HTTP method
   * @param body Request body
   * @param headers Optional headers
   * @param priority Priority (higher number = higher priority)
   * @returns ID of the queued item
   */
  async addToQueue(
    url: string,
    method: string,
    body: any,
    headers?: Record<string, string>,
    priority: number = 1
  ): Promise<number> {
    try {
      // Add to the queue
      const id = await this.offlineQueue.add({
        url,
        method,
        body,
        headers,
        timestamp: Date.now(),
        retryCount: 0,
        priority,
        status: 'pending',
      });
      
      console.log(`Added item to offline queue: ${method} ${url}`);
      
      // Process the queue if we're online
      if (navigator.onLine) {
        this.processPendingQueue();
      }
      
      return id;
    } catch (error) {
      console.error('Failed to add item to offline queue:', error);
      throw error;
    }
  }
  
  /**
   * Process pending items in the offline queue
   */
  async processPendingQueue(): Promise<void> {
    // Don't process if offline
    if (!navigator.onLine) {
      return;
    }
    
    try {
      // Get all pending items, sorted by priority (high to low) and timestamp
      const pendingItems = await this.offlineQueue
        .where('status')
        .equals('pending')
        .sortBy(['priority', 'timestamp']);
      
      if (pendingItems.length === 0) {
        return;
      }
      
      console.log(`Processing ${pendingItems.length} offline queue items`);
      
      // Process each item sequentially to avoid race conditions
      for (const item of pendingItems) {
        // Mark as processing
        await this.offlineQueue.update(item.id!, {
          status: 'processing',
        });
        
        try {
          // Perform the API request
          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              ...item.headers,
            },
            body: item.method !== 'GET' ? JSON.stringify(item.body) : undefined,
            credentials: 'include', // Send cookies for auth
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          // Mark as completed
          await this.offlineQueue.update(item.id!, {
            status: 'completed',
          });
          
          console.log(`Successfully processed offline queue item: ${item.method} ${item.url}`);
        } catch (error) {
          console.error(`Failed to process offline queue item:`, error);
          
          // Increment retry count
          const retryCount = item.retryCount + 1;
          const maxRetries = 5;
          
          if (retryCount < maxRetries) {
            // Mark for retry
            await this.offlineQueue.update(item.id!, {
              status: 'pending',
              retryCount,
              error: (error as Error).message,
            });
          } else {
            // Mark as failed after max retries
            await this.offlineQueue.update(item.id!, {
              status: 'failed',
              error: (error as Error).message,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  }
  
  /**
   * Store a message locally
   * @param message Message to store
   */
  async storeMessage(message: Omit<Message, 'id'> & { id?: string }): Promise<string> {
    try {
      // Generate ID if not provided
      const id = message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store the message
      await this.messages.put({
        ...message,
        id,
      });
      
      return id;
    } catch (error) {
      console.error('Failed to store message:', error);
      throw error;
    }
  }
  
  /**
   * Get messages for a conversation
   * @param conversationId Conversation ID
   * @param limit Maximum number of messages to return
   * @param offset Offset for pagination
   * @returns Array of messages
   */
  async getMessages(
    conversationId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Message[]> {
    try {
      return await this.messages
        .where('conversationId')
        .equals(conversationId)
        .reverse() // Most recent first
        .offset(offset)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error('Failed to get messages:', error);
      return [];
    }
  }
  
  /**
   * Delete expired items from the cache
   */
  async cleanup(): Promise<void> {
    try {
      const now = Date.now();
      
      // Delete expired cache items
      const expiredItems = await this.cache
        .where('expires')
        .below(now)
        .toArray();
      
      if (expiredItems.length > 0) {
        console.log(`Cleaning up ${expiredItems.length} expired cache items`);
        
        await Promise.all(
          expiredItems.map(item => this.cache.delete(item.id))
        );
      }
      
      // Clean up completed/failed queue items older than 7 days
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      const oldQueueItems = await this.offlineQueue
        .where('timestamp')
        .below(sevenDaysAgo)
        .and(item => 
          item.status === 'completed' || item.status === 'failed'
        )
        .toArray();
      
      if (oldQueueItems.length > 0) {
        console.log(`Cleaning up ${oldQueueItems.length} old queue items`);
        
        await Promise.all(
          oldQueueItems.map(item => this.offlineQueue.delete(item.id!))
        );
      }
    } catch (error) {
      console.error('Error during cache cleanup:', error);
    }
  }
  
  /**
   * Save app state (settings, preferences, etc.)
   * @param key State key
   * @param value State value
   */
  async saveAppState(key: string, value: any): Promise<void> {
    try {
      const now = Date.now();
      const id = key;
      
      await this.appState.put({
        id,
        key,
        value,
        lastUpdated: now,
      });
    } catch (error) {
      console.error('Failed to save app state:', error);
    }
  }
  
  /**
   * Get app state value
   * @param key State key
   * @returns State value or null if not found
   */
  async getAppState<T = any>(key: string): Promise<T | null> {
    try {
      const state = await this.appState
        .where('key')
        .equals(key)
        .first();
      
      return state ? state.value as T : null;
    } catch (error) {
      console.error('Failed to get app state:', error);
      return null;
    }
  }
  
  /**
   * Store user's game library item
   * @param gameItem Game library item
   */
  async storeGameLibraryItem(gameItem: Omit<GameLibraryItem, 'id'> & { id?: string }): Promise<string> {
    try {
      // Generate ID if not provided
      const id = gameItem.id || `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store the game library item
      await this.gameLibraries.put({
        ...gameItem,
        id,
      });
      
      return id;
    } catch (error) {
      console.error('Failed to store game library item:', error);
      throw error;
    }
  }
  
  /**
   * Get user's game library
   * @param userId User ID
   * @returns Array of game library items
   */
  async getGameLibrary(userId: string): Promise<GameLibraryItem[]> {
    try {
      return await this.gameLibraries
        .where('userId')
        .equals(userId)
        .toArray();
    } catch (error) {
      console.error('Failed to get game library:', error);
      return [];
    }
  }
  
  /**
   * Store a game session
   * @param session Game session
   */
  async storeGameSession(session: Omit<GameSession, 'id'> & { id?: string }): Promise<string> {
    try {
      // Generate ID if not provided
      const id = session.id || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Store the game session
      await this.gameSessions.put({
        ...session,
        id,
        lastUpdated: Date.now(),
      });
      
      return id;
    } catch (error) {
      console.error('Failed to store game session:', error);
      throw error;
    }
  }
  
  /**
   * Get game sessions
   * @param filters Filter options
   * @returns Array of game sessions
   */
  async getGameSessions(filters: {
    hostId?: string;
    gameId?: string;
    participantId?: string;
    futureOnly?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<GameSession[]> {
    try {
      const {
        hostId,
        gameId,
        participantId,
        futureOnly = false,
        limit = 20,
        offset = 0,
      } = filters;
      
      let collection = this.gameSessions.toCollection();
      
      // Apply filters
      if (hostId) {
        collection = this.gameSessions.where('hostId').equals(hostId);
      } else if (gameId) {
        collection = this.gameSessions.where('gameId').equals(gameId);
      }
      
      // Get all sessions that match the filter
      let sessions = await collection.toArray();
      
      // Apply post-query filters
      if (participantId) {
        sessions = sessions.filter(session => 
          session.participants.some(p => p.userId === participantId)
        );
      }
      
      if (futureOnly) {
        const now = Date.now();
        sessions = sessions.filter(session => session.startTime > now);
      }
      
      // Sort by start time (ascending)
      sessions.sort((a, b) => a.startTime - b.startTime);
      
      // Apply pagination
      return sessions.slice(offset, offset + limit);
    } catch (error) {
      console.error('Failed to get game sessions:', error);
      return [];
    }
  }
  
  /**
   * Clear all data (for logout or reset)
   */
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        this.cache.clear(),
        this.messages.clear(),
        this.users.clear(),
        this.gameSessions.clear(),
        this.gameLibraries.clear(),
        this.appState.clear(),
        // Keep offline queue to ensure pending operations are completed
      ]);
      
      console.log('All IndexedDB data cleared successfully');
    } catch (error) {
      console.error('Failed to clear IndexedDB data:', error);
      throw error;
    }
  }
}

// Create and export the IndexedDB instance
const indexedDBService = new GameDinDatabase();

// Initialize the database when the module is imported
indexedDBService.initialize().catch(error => {
  console.error('Failed to initialize IndexedDB service:', error);
});

// Export specific functions for easier import
export const addToOfflineQueue = (
  url: string,
  method: string,
  body: any,
  headers?: Record<string, string>,
  priority: number = 1
): Promise<number> => {
  return indexedDBService.addToQueue(url, method, body, headers, priority);
};

export const processPendingQueue = (): Promise<void> => {
  return indexedDBService.processPendingQueue();
};

export const getOfflineMessages = (
  conversationId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Message[]> => {
  return indexedDBService.getMessages(conversationId, limit, offset);
};

export const storeOfflineMessage = (message: Omit<Message, 'id'> & { id?: string }): Promise<string> => {
  return indexedDBService.storeMessage(message);
};

export default indexedDBService; 