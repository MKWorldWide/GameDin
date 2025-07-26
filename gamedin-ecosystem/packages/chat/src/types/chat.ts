import { z } from 'zod';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  SYSTEM = 'system',
  COMMAND = 'command',
}

export enum ChatRoomType {
  DIRECT = 'direct',
  GROUP = 'group',
  MATCH = 'match',
  GLOBAL = 'global',
}

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1),
  avatar: z.string().optional(),
  isOnline: z.boolean().default(false),
  lastSeen: z.date().optional(),
});

export type User = z.infer<typeof UserSchema>;

export const ChatRoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.nativeEnum(ChatRoomType),
  participants: z.array(z.string().uuid()).min(1),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type ChatRoom = z.infer<typeof ChatRoomSchema>;

export const MessageSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
  readBy: z.array(z.string().uuid()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const CreateMessageDto = MessageSchema.pick({
  roomId: true,
  content: true,
  type: true,
  metadata: true,
}).extend({
  senderId: z.string().uuid(),
});

export type CreateMessageDto = z.infer<typeof CreateMessageDto>;

export const UpdateMessageDto = MessageSchema.pick({
  content: true,
  metadata: true,
}).partial();

export type UpdateMessageDto = z.infer<typeof UpdateMessageDto>;

export const CreateRoomDto = ChatRoomSchema.pick({
  name: true,
  type: true,
  participants: true,
  metadata: true,
}).extend({
  creatorId: z.string().uuid(),
});

export type CreateRoomDto = z.infer<typeof CreateRoomDto>;

export const UpdateRoomDto = ChatRoomSchema.pick({
  name: true,
  participants: true,
  metadata: true,
}).partial();

export type UpdateRoomDto = z.infer<typeof UpdateRoomDto>;

export interface IChatService {
  // Room management
  createRoom(roomData: CreateRoomDto): Promise<ChatRoom>;
  getRoom(roomId: string): Promise<ChatRoom | null>;
  updateRoom(roomId: string, updateData: UpdateRoomDto): Promise<ChatRoom | null>;
  deleteRoom(roomId: string): Promise<boolean>;
  listUserRooms(userId: string): Promise<ChatRoom[]>;
  addUserToRoom(roomId: string, userId: string): Promise<boolean>;
  removeUserFromRoom(roomId: string, userId: string): Promise<boolean>;
  
  // Message management
  sendMessage(messageData: CreateMessageDto): Promise<Message>;
  getMessages(roomId: string, limit?: number, before?: Date): Promise<Message[]>;
  updateMessage(messageId: string, updateData: UpdateMessageDto): Promise<Message | null>;
  deleteMessage(messageId: string): Promise<boolean>;
  markAsRead(messageId: string, userId: string): Promise<boolean>;
  
  // User presence
  setUserOnline(userId: string): Promise<void>;
  setUserOffline(userId: string): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
}
