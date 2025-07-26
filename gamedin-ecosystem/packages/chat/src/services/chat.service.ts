import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { redisStorage } from '../storage/redis.storage';
import { 
  ChatRoom, 
  CreateMessageDto, 
  CreateRoomDto, 
  IChatService, 
  Message, 
  MessageType, 
  UpdateMessageDto, 
  UpdateRoomDto, 
  User 
} from '../types/chat';

export class ChatService implements IChatService {
  private io: SocketIOServer;
  private connectedClients: Map<string, Socket> = new Map();
  private userRooms: Map<string, Set<string>> = new Map();

  constructor(httpServer?: HttpServer, io?: SocketIOServer) {
    if (io) {
      this.io = io;
    } else if (httpServer) {
      this.io = new SocketIOServer(httpServer, {
        cors: {
          origin: process.env.CORS_ORIGIN || '*', // In production, replace with your frontend URL
          methods: ['GET', 'POST'],
          credentials: true
        },
        path: '/socket.io/chat',
        serveClient: false,
      });
    } else {
      throw new Error('Either httpServer or io instance must be provided');
    }

    this.initializeSocketHandlers();
  }

  private initializeSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Extract user ID from handshake or token (simplified)
      const userId = socket.handshake.auth.userId || `anon-${socket.id}`;
      const username = socket.handshake.auth.username || `User-${socket.id.substring(0, 8)}`;
      
      // Store the socket connection
      this.connectedClients.set(userId, socket);
      
      // Initialize user data
      const user: User = {
        id: userId,
        username,
        isOnline: true,
        lastSeen: new Date(),
      };
      
      // Set user as online
      this.setUserOnline(userId, { username });
      
      // Join user to their rooms
      this.joinUserRooms(userId);
      
      // Notify others that user is online
      socket.broadcast.emit('user:online', { userId, username });
      
      // Handle disconnection
      socket.on('disconnect', async () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.connectedClients.delete(userId);
        await this.setUserOffline(userId);
        socket.broadcast.emit('user:offline', { userId });
      });
      
      // Handle joining a room
      socket.on('room:join', async (roomId: string, callback) => {
        try {
          const room = await this.getRoom(roomId);
          if (!room) {
            return callback({ error: 'Room not found' });
          }
          
          if (!room.participants.includes(userId)) {
            return callback({ error: 'Not a participant of this room' });
          }
          
          await socket.join(roomId);
          this.addUserToRoomCache(userId, roomId);
          
          // Notify room that user joined
          socket.to(roomId).emit('room:user-joined', { roomId, userId, username });
          
          callback({ success: true, room });
        } catch (error) {
          console.error('Error joining room:', error);
          callback({ error: 'Failed to join room' });
        }
      });
      
      // Handle leaving a room
      socket.on('room:leave', (roomId: string) => {
        socket.leave(roomId);
        this.removeUserFromRoomCache(userId, roomId);
        socket.to(roomId).emit('room:user-left', { roomId, userId });
      });
      
      // Handle sending a message
      socket.on('message:send', async (data: Omit<CreateMessageDto, 'senderId'>, callback) => {
        try {
          const messageData: CreateMessageDto = {
            ...data,
            senderId: userId,
          };
          
          const message = await this.sendMessage(messageData);
          
          // Broadcast to room
          this.io.to(message.roomId).emit('message:new', message);
          
          callback({ success: true, message });
        } catch (error) {
          console.error('Error sending message:', error);
          callback({ error: 'Failed to send message' });
        }
      });
      
      // Handle typing indicator
      socket.on('typing:start', (roomId: string) => {
        socket.to(roomId).emit('typing:started', { roomId, userId, username });
      });
      
      socket.on('typing:stop', (roomId: string) => {
        socket.to(roomId).emit('typing:stopped', { roomId, userId });
      });
      
      // Handle message read receipt
      socket.on('message:read', async (messageId: string, roomId: string) => {
        await this.markAsRead(messageId, userId);
        socket.to(roomId).emit('message:read', { messageId, userId });
      });
    });
  }
  
  private async joinUserRooms(userId: string): Promise<void> {
    const rooms = await this.listUserRooms(userId);
    const socket = this.connectedClients.get(userId);
    
    if (socket) {
      rooms.forEach(room => {
        socket.join(room.id);
        this.addUserToRoomCache(userId, room.id);
      });
    }
  }
  
  private addUserToRoomCache(userId: string, roomId: string): void {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)?.add(roomId);
  }
  
  private removeUserFromRoomCache(userId: string, roomId: string): void {
    if (this.userRooms.has(userId)) {
      this.userRooms.get(userId)?.delete(roomId);
    }
  }

  // IChatService implementation
  async createRoom(roomData: CreateRoomDto): Promise<ChatRoom> {
    const room: ChatRoom = {
      id: uuidv4(),
      name: roomData.name,
      type: roomData.type,
      participants: [...new Set([...roomData.participants, roomData.creatorId])],
      createdAt: new Date(),
      metadata: roomData.metadata || {},
    };
    
    const success = await redisStorage.createRoom(room);
    if (!success) {
      throw new Error('Failed to create room');
    }
    
    // If any participants are online, join them to the room
    for (const participantId of room.participants) {
      const socket = this.connectedClients.get(participantId);
      if (socket) {
        await socket.join(room.id);
        this.addUserToRoomCache(participantId, room.id);
      }
    }
    
    // Notify all participants about the new room
    this.io.to(room.participants).emit('room:created', room);
    
    return room;
  }

  async getRoom(roomId: string): Promise<ChatRoom | null> {
    return redisStorage.getRoom(roomId);
  }

  async updateRoom(roomId: string, updateData: UpdateRoomDto): Promise<ChatRoom | null> {
    const room = await this.getRoom(roomId);
    if (!room) return null;
    
    const updatedRoom: ChatRoom = {
      ...room,
      ...updateData,
      updatedAt: new Date(),
    };
    
    if (updateData.participants) {
      // Handle participant changes
      const newParticipants = new Set(updateData.participants);
      const oldParticipants = new Set(room.participants);
      
      // Add new participants to the room
      for (const participantId of newParticipants) {
        if (!oldParticipants.has(participantId)) {
          const socket = this.connectedClients.get(participantId);
          if (socket) {
            await socket.join(roomId);
            this.addUserToRoomCache(participantId, roomId);
          }
        }
      }
      
      // Remove participants who are no longer in the room
      for (const participantId of oldParticipants) {
        if (!newParticipants.has(participantId)) {
          const socket = this.connectedClients.get(participantId);
          if (socket) {
            await socket.leave(roomId);
            this.removeUserFromRoomCache(participantId, roomId);
          }
        }
      }
    }
    
    const success = await redisStorage.updateRoom(roomId, updatedRoom);
    if (!success) {
      throw new Error('Failed to update room');
    }
    
    // Notify all participants about the room update
    this.io.to(roomId).emit('room:updated', updatedRoom);
    
    return updatedRoom;
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (!room) return false;
    
    const success = await redisStorage.deleteRoom(roomId);
    if (!success) {
      throw new Error('Failed to delete room');
    }
    
    // Notify all participants about the room deletion
    this.io.to(roomId).emit('room:deleted', { roomId });
    
    // Remove all clients from the room
    if (this.io.sockets.adapter.rooms.has(roomId)) {
      this.io.socketsLeave(roomId);
    }
    
    return true;
  }

  async listUserRooms(userId: string): Promise<ChatRoom[]> {
    return redisStorage.listUserRooms(userId);
  }

  async addUserToRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (!room) return false;
    
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      const success = await this.updateRoom(roomId, { participants: room.participants });
      return success !== null;
    }
    
    return true;
  }

  async removeUserFromRoom(roomId: string, userId: string): Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (!room) return false;
    
    const participantIndex = room.participants.indexOf(userId);
    if (participantIndex !== -1) {
      room.participants.splice(participantIndex, 1);
      
      // If no participants left, delete the room
      if (room.participants.length === 0) {
        return this.deleteRoom(roomId);
      }
      
      const success = await this.updateRoom(roomId, { participants: room.participants });
      return success !== null;
    }
    
    return true;
  }

  async sendMessage(messageData: CreateMessageDto): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      ...messageData,
      readBy: [messageData.senderId],
      createdAt: new Date(),
    };
    
    const success = await redisStorage.addMessage(message);
    if (!success) {
      throw new Error('Failed to save message');
    }
    
    return message;
  }

  async getMessages(roomId: string, limit: number = 50, before?: Date): Promise<Message[]> {
    return redisStorage.getMessages(roomId, limit, before);
  }

  async updateMessage(messageId: string, updateData: UpdateMessageDto): Promise<Message | null> {
    // In a real implementation, you would update the message in the database
    // and then broadcast the update to all clients in the room
    throw new Error('Not implemented');
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    // In a real implementation, you would soft-delete the message in the database
    // and then broadcast the deletion to all clients in the room
    throw new Error('Not implemented');
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    // In a real implementation, you would update the readBy array in the database
    // for the specified message and user
    return true;
  }

  async setUserOnline(userId: string, userData: Partial<User>): Promise<void> {
    await redisStorage.setUserOnline(userId, userData);
  }

  async setUserOffline(userId: string): Promise<void> {
    await redisStorage.setUserOffline(userId);
  }

  async getOnlineUsers(limit: number = 100): Promise<User[]> {
    return redisStorage.getOnlineUsers(limit);
  }
  
  // Additional methods for direct server-side usage
  getSocketServer(): SocketIOServer {
    return this.io;
  }
  
  getSocket(userId: string): Socket | undefined {
    return this.connectedClients.get(userId);
  }
  
  async close(): Promise<void> {
    // Close all connections
    this.io.sockets.sockets.forEach(socket => socket.disconnect(true));
    
    // Close the server
    return new Promise((resolve, reject) => {
      this.io.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

// Singleton instance
let chatService: ChatService | null = null;

export const getChatService = (httpServer?: HttpServer, io?: SocketIOServer): ChatService => {
  if (!chatService) {
    if (!httpServer && !io) {
      throw new Error('Either httpServer or io instance must be provided for the first initialization');
    }
    chatService = new ChatService(httpServer, io);
  }
  return chatService;
};

export default getChatService;
