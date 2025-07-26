import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getChatService } from './services/chat.service';

// Load environment variables
config();

// Export types and interfaces
export * from './types/chat';

// Export services
export { getChatService };

export default getChatService;

// Start the service if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.CHAT_SERVICE_PORT || '3002', 10);
  const httpServer = createServer();
  
  // Initialize chat service with HTTP server
  const chatService = getChatService(httpServer);
  
  // Start the server
  httpServer.listen(port, () => {
    console.log(`🚀 Chat service running on port ${port}`);
    
    // Log when a new client connects
    chatService.getSocketServer().on('connection', (socket) => {
      const userId = socket.handshake.auth.userId || 'anonymous';
      console.log(`Client connected: ${socket.id} (User: ${userId})`);
      
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id} (User: ${userId})`);
      });
    });
  });
  
  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down chat service...');
    
    try {
      // Close the chat service
      await chatService.close();
      
      // Close the HTTP server
      httpServer.close(() => {
        console.log('✅ Chat service has been shut down');
        process.exit(0);
      });
      
      // Force close after timeout
      setTimeout(() => {
        console.error('⚠️ Forcing shutdown...');
        process.exit(1);
      }, 10000);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  };
  
  // Handle process termination signals
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown();
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
  });
}
