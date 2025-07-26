import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';
import { config } from '../config';

/**
 * Redis service for handling caching and real-time data
 */
export class RedisService {
  private static instance: RedisService;
  private client: RedisClientType;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: config.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            logger.error('Max reconnection attempts reached');
            return new Error('Max reconnection attempts reached');
          }
          // Exponential backoff
          return Math.min(retries * 100, 5000);
        },
      },
    });

    this.setupEventListeners();
  }

  /**
   * Get RedisService singleton instance
   */
  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Setup Redis event listeners
   */
  private setupEventListeners(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.info('Redis client disconnected');
    });
  }

  /**
   * Connect to Redis
   */
  public async connect(): Promise<void> {
    if (this.isConnected) return;
    
    try {
      await this.client.connect();
      this.isConnected = true;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      await this.client.quit();
      this.isConnected = false;
    } catch (error) {
      logger.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  /**
   * Get a value from Redis
   */
  public async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Error getting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a value in Redis
   */
  public async set(
    key: string, 
    value: string, 
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, { EX: ttlSeconds });
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key from Redis
   */
  public async del(key: string): Promise<number> {
    try {
      return await this.client.del(key);
    } catch (error) {
      logger.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Error checking if key exists ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set a key with expiration
   */
  public async setex(
    key: string, 
    seconds: number, 
    value: string
  ): Promise<boolean> {
    try {
      await this.client.setEx(key, seconds, value);
      return true;
    } catch (error) {
      logger.error(`Error setting key with expiration ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get the TTL of a key in seconds
   */
  public async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Error getting TTL for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Increment a key's value
   */
  public async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Error incrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Decrement a key's value
   */
  public async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error(`Error decrementing key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Add a member to a sorted set
   */
  public async zadd(
    key: string, 
    score: number, 
    member: string
  ): Promise<number> {
    try {
      return await this.client.zAdd(key, { score, value: member });
    } catch (error) {
      logger.error(`Error adding member to sorted set ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get a range of members from a sorted set
   */
  public async zrange(
    key: string, 
    start: number, 
    stop: number, 
    withScores: boolean = false
  ): Promise<string[]> {
    try {
      return await this.client.zRange(key, start, stop, {
        BY: 'SCORE',
        REV: false,
        ...(withScores && { WITHSCORES: true })
      });
    } catch (error) {
      logger.error(`Error getting range from sorted set ${key}:`, error);
      throw error;
    }
  }

  /**
   * Publish a message to a channel
   */
  public async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.client.publish(channel, message);
    } catch (error) {
      logger.error(`Error publishing to channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to a channel
   */
  public async subscribe(
    channel: string, 
    callback: (channel: string, message: string) => void
  ): Promise<void> {
    try {
      const subscriber = this.client.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe(channel, (message, channel) => {
        callback(channel, message);
      });
      
      // Handle disconnects
      subscriber.on('error', (error) => {
        logger.error('Redis subscriber error:', error);
        // Attempt to resubscribe
        setTimeout(() => {
          this.subscribe(channel, callback).catch((err) => {
            logger.error('Failed to resubscribe:', err);
          });
        }, 5000);
      });
      
    } catch (error) {
      logger.error(`Error subscribing to channel ${channel}:`, error);
      throw error;
    }
  }

  /**
   * Execute a Lua script
   */
  public async eval<T = any>(
    script: string, 
    keys: string[] = [], 
    args: (string | number)[] = []
  ): Promise<T> {
    try {
      // @ts-ignore - The type definition for eval is not great
      return await this.client.eval(script, {
        keys,
        arguments: args.map(String)
      }) as T;
    } catch (error) {
      logger.error('Error executing Lua script:', error);
      throw error;
    }
  }

  /**
   * Get the underlying Redis client
   * Use with caution - prefer using the service methods when possible
   */
  public getClient(): RedisClientType {
    return this.client;
  }
}

// Export a singleton instance
export const redisService = RedisService.getInstance();

// Helper function to get Redis client with error handling
export const getRedisClient = (): RedisClientType => {
  const client = RedisService.getInstance().getClient();
  
  if (!client) {
    throw new Error('Redis client is not available');
  }
  
  return client;
};

// Export the Redis client type for convenience
export type { RedisClientType } from 'redis';
