import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import { getChatService, ChatService } from '..';
import { redisStorage } from '../storage/redis.storage';
import { v4 as uuidv4 } from 'uuid';

describe('ChatService', () => {
  let httpServer: ReturnType<typeof createServer>;
  let ioServer: SocketIOServer;
  let chatService: ChatService;
  let clientSocket1: Socket;
  let clientSocket2: Socket;
  
  const userId1 = uuidv4();
  const userId2 = uuidv4();
  const username1 = 'testuser1';
  const username2 = 'testuser2';
  
  beforeAll((done) => {
    // Create HTTP server and Socket.IO server for testing
    httpServer = createServer();
    ioServer = new SocketIOServer(httpServer, {
      path: '/socket.io/chat',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    
    // Initialize chat service with the test server
    chatService = getChatService(httpServer, ioServer);
    
    // Start the server
    httpServer.listen(3003, () => {
      // Set up client connections
      clientSocket1 = ioClient('http://localhost:3003/socket.io/chat', {
        auth: { userId: userId1, username: username1 },
        transports: ['websocket'],
      });
      
      clientSocket2 = ioClient('http://localhost:3003/socket.io/chat', {
        auth: { userId: userId2, username: username2 },
        transports: ['websocket'],
      });
      
      // Wait for both clients to connect
      Promise.all([
        new Promise<void>((resolve) => clientSocket1.on('connect', resolve)),
        new Promise<void>((resolve) => clientSocket2.on('connect', resolve)),
      ]).then(() => done());
    });
  });
  
  afterAll(async () => {
    // Clean up
    clientSocket1.close();
    clientSocket2.close();
    await chatService.close();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    await redisStorage.clearAll();
  });
  
  afterEach(async () => {
    // Clean up test data
    await redisStorage.clearAll();
  });
  
  describe('Room Management', () => {
    let roomId: string;
    
    test('should create a new room', async () => {
      const roomData = {
        name: 'Test Room',
        type: 'group' as const,
        participants: [userId1, userId2],
        creatorId: userId1,
      };
      
      const room = await chatService.createRoom(roomData);
      expect(room).toBeDefined();
      expect(room.name).toBe(roomData.name);
      expect(room.type).toBe(roomData.type);
      expect(room.participants).toContain(userId1);
      expect(room.participants).toContain(userId2);
      
      roomId = room.id;
    });
    
    test('should allow users to join a room', (done) => {
      clientSocket1.emit('room:join', roomId, (response: any) => {
        expect(response.success).toBe(true);
        expect(response.room).toBeDefined();
        expect(response.room.id).toBe(roomId);
        
        // Verify user-joined event is emitted to other users
        clientSocket2.on('room:user-joined', (data) => {
          expect(data.roomId).toBe(roomId);
          expect(data.userId).toBe(userId1);
          expect(data.username).toBe(username1);
          done();
        });
      });
    });
    
    test('should allow users to send messages in a room', (done) => {
      const testMessage = 'Hello, World!';
      
      // Join both users to the room
      clientSocket1.emit('room:join', roomId);
      clientSocket2.emit('room:join', roomId);
      
      // Listen for the message on the second client
      clientSocket2.on('message:new', (message) => {
        expect(message.roomId).toBe(roomId);
        expect(message.senderId).toBe(userId1);
        expect(message.content).toBe(testMessage);
        expect(message.type).toBe('text');
        done();
      });
      
      // Send a message from the first client
      setTimeout(() => {
        clientSocket1.emit('message:send', {
          roomId,
          content: testMessage,
          type: 'text',
        });
      }, 100);
    });
    
    test('should handle typing indicators', (done) => {
      // Listen for typing started event on the second client
      clientSocket2.on('typing:started', (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(userId1);
        expect(data.username).toBe(username1);
        
        // After receiving typing started, wait for typing stopped
        clientSocket2.on('typing:stopped', (stopData) => {
          expect(stopData.roomId).toBe(roomId);
          expect(stopData.userId).toBe(userId1);
          done();
        });
      });
      
      // Send typing events from the first client
      setTimeout(() => {
        clientSocket1.emit('typing:start', roomId);
        
        setTimeout(() => {
          clientSocket1.emit('typing:stop', roomId);
        }, 100);
      }, 100);
    });
    
    test('should allow users to leave a room', (done) => {
      // Listen for user left event on the second client
      clientSocket2.on('room:user-left', (data) => {
        expect(data.roomId).toBe(roomId);
        expect(data.userId).toBe(userId1);
        done();
      });
      
      // First client leaves the room
      clientSocket1.emit('room:leave', roomId);
    });
  });
  
  describe('User Presence', () => {
    test('should track online users', async () => {
      // Both clients should be online
      const onlineUsers = await chatService.getOnlineUsers();
      const onlineUserIds = onlineUsers.map(user => user.id);
      
      expect(onlineUserIds).toContain(userId1);
      expect(onlineUserIds).toContain(userId2);
      
      // Verify user data
      const user1 = onlineUsers.find(user => user.id === userId1);
      expect(user1).toBeDefined();
      expect(user1?.username).toBe(username1);
      expect(user1?.isOnline).toBe(true);
    });
    
    test('should handle user disconnection', (done) => {
      // Listen for user offline event
      clientSocket2.on('user:offline', (data) => {
        expect(data.userId).toBe(userId1);
        done();
      });
      
      // Disconnect the first client
      clientSocket1.disconnect();
    });
  });
});
