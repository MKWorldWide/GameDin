import Redis from 'ioredis';
import { ChatRoom, Message, User } from '../types/chat';

export class RedisStorage {
  private redis: Redis;
  private roomKey = (roomId: string) => `chat:room:${roomId}`;
  private roomMessagesKey = (roomId: string) => `chat:room:${roomId}:messages`;
  private userKey = (userId: string) => `chat:user:${userId}`;
  private userRoomsKey = (userId: string) => `chat:user:${userId}:rooms`;
  private onlineUsersKey = 'chat:online:users';

  constructor(redisUrl?: string) {
    this.redis = redisUrl ? new Redis(redisUrl) : new Redis();
  }

  // Room methods
  async createRoom(room: ChatRoom): Promise<boolean> {
    const roomKey = this.roomKey(room.id);
    const pipeline = this.redis.pipeline();
    
    // Store room data
    pipeline.hmset(roomKey, {
      id: room.id,
      name: room.name,
      type: room.type,
      participants: JSON.stringify(room.participants),
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt?.toISOString() || null,
      metadata: JSON.stringify(room.metadata || {}),
    });
    
    // Add room to each participant's room list
    for (const participantId of room.participants) {
      pipeline.sadd(this.userRoomsKey(participantId), room.id);
    }
    
    const results = await pipeline.exec();
    return results.every(([err, _]) => !err);
  }

  async getRoom(roomId: string): Promise<ChatRoom | null> {
    const roomData = await this.redis.hgetall(this.roomKey(roomId));
    
    if (!roomData || !roomData.id) {
      return null;
    }
    
    return {
      id: roomData.id,
      name: roomData.name,
      type: roomData.type as any,
      participants: JSON.parse(roomData.participants),
      createdAt: new Date(roomData.createdAt),
      updatedAt: roomData.updatedAt ? new Date(roomData.updatedAt) : undefined,
      metadata: roomData.metadata ? JSON.parse(roomData.metadata) : {},
    };
  }

  async updateRoom(roomId: string, updateData: Partial<ChatRoom>): Promise<boolean> {
    const roomKey = this.roomKey(roomId);
    const updateFields: Record<string, string> = {};
    
    if (updateData.name) updateFields.name = updateData.name;
    if (updateData.participants) updateFields.participants = JSON.stringify(updateData.participants);
    if (updateData.metadata) updateFields.metadata = JSON.stringify(updateData.metadata);
    
    updateFields.updatedAt = new Date().toISOString();
    
    const result = await this.redis.hmset(roomKey, updateFields);
    return result === 'OK';
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    const roomKey = this.roomKey(roomId);
    const room = await this.getRoom(roomId);
    
    if (!room) return false;
    
    const pipeline = this.redis.pipeline();
    
    // Delete room data
    pipeline.del(roomKey);
    
    // Remove room from participants' room lists
    for (const participantId of room.participants) {
      pipeline.srem(this.userRoomsKey(participantId), roomId);
    }
    
    // Delete room messages
    pipeline.del(this.roomMessagesKey(roomId));
    
    const results = await pipeline.exec();
    return results.every(([err, _]) => !err);
  }

  async listUserRooms(userId: string): Promise<ChatRoom[]> {
    const roomIds = await this.redis.smembers(this.userRoomsKey(userId));
    const rooms = await Promise.all(roomIds.map(id => this.getRoom(id)));
    return rooms.filter((room): room is ChatRoom => room !== null);
  }

  // Message methods
  async addMessage(message: Message): Promise<boolean> {
    const messageKey = this.roomMessagesKey(message.roomId);
    const messageData = JSON.stringify({
      ...message,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt?.toISOString() || null,
    });
    
    const result = await this.redis.zadd(
      messageKey,
      message.createdAt.getTime(),
      messageData
    );
    
    // Keep only the last 1000 messages per room
    await this.redis.zremrangebyrank(messageKey, 0, -1001);
    
    return result > 0;
  }

  async getMessages(roomId: string, limit: number = 50, before?: Date): Promise<Message[]> {
    const messageKey = this.roomMessagesKey(roomId);
    const maxScore = before ? before.getTime() : '+inf';
    
    const messages = await this.redis.zrevrangebyscore(
      messageKey,
      maxScore,
      '-inf',
      'WITHSCORES',
      'LIMIT',
      0,
      limit
    );
    
    // Convert the flat array of [message, score, message, score, ...] to Message objects
    const result: Message[] = [];
    for (let i = 0; i < messages.length; i += 2) {
      const messageData = JSON.parse(messages[i]);
      result.push({
        ...messageData,
        createdAt: new Date(messageData.createdAt),
        updatedAt: messageData.updatedAt ? new Date(messageData.updatedAt) : undefined,
      });
    }
    
    return result;
  }

  // User presence methods
  async setUserOnline(userId: string, userData: Partial<User>): Promise<boolean> {
    const userKey = this.userKey(userId);
    const onlineUsersKey = this.onlineUsersKey;
    
    const pipeline = this.redis.pipeline();
    
    // Update user data
    if (Object.keys(userData).length > 0) {
      const updateData: Record<string, string> = {};
      if (userData.username) updateData.username = userData.username;
      if (userData.avatar) updateData.avatar = userData.avatar;
      updateData.isOnline = 'true';
      updateData.lastSeen = new Date().toISOString();
      
      pipeline.hmset(userKey, updateData);
    } else {
      pipeline.hmset(userKey, {
        isOnline: 'true',
        lastSeen: new Date().toISOString(),
      });
    }
    
    // Add to online users set with current timestamp as score
    pipeline.zadd(onlineUsersKey, Date.now(), userId);
    
    const results = await pipeline.exec();
    return results.every(([err, _]) => !err);
  }

  async setUserOffline(userId: string): Promise<boolean> {
    const userKey = this.userKey(userId);
    const onlineUsersKey = this.onlineUsersKey;
    
    const pipeline = this.redis.pipeline();
    
    // Update user data
    pipeline.hmset(userKey, {
      isOnline: 'false',
      lastSeen: new Date().toISOString(),
    });
    
    // Remove from online users set
    pipeline.zrem(onlineUsersKey, userId);
    
    const results = await pipeline.exec();
    return results.every(([err, _]) => !err);
  }

  async getOnlineUsers(limit: number = 100): Promise<User[]> {
    const onlineUsersKey = this.onlineUsersKey;
    const userIds = await this.redis.zrevrange(onlineUsersKey, 0, limit - 1);
    
    if (userIds.length === 0) return [];
    
    const pipeline = this.redis.pipeline();
    userIds.forEach(userId => {
      pipeline.hgetall(this.userKey(userId));
    });
    
    const results = await pipeline.exec();
    return results.map(([err, userData], index) => ({
      id: userIds[index],
      username: userData.username || `User-${userIds[index].substring(0, 8)}`,
      avatar: userData.avatar || '',
      isOnline: userData.isOnline === 'true',
      lastSeen: userData.lastSeen ? new Date(userData.lastSeen) : new Date(),
    }));
  }

  // Cleanup method for testing
  async clearAll(): Promise<void> {
    const keys = await this.redis.keys('chat:*');
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }
}

export const redisStorage = new RedisStorage(process.env.REDIS_URL);
