import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { getOnboardingService } from './services/onboarding.service';
import { redisStorage } from './storage/redis.storage';

// Load environment variables
config();

// Export types and interfaces
export * from './types/onboarding';

// Export services
export { getOnboardingService, redisStorage };

export default getOnboardingService;

// Start the service if this file is run directly
if (require.main === module) {
  const port = parseInt(process.env.ONBOARDING_SERVICE_PORT || '3003', 10);
  const httpServer = createServer();
  
  // Initialize onboarding service
  const onboardingService = getOnboardingService();
  
  // Initialize WebSocket server for real-time updates
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io/onboarding',
  });
  
  // Set up WebSocket connections
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    
    console.log(`Client connected: ${socket.id} (User: ${userId})`);
    
    // Join user's room for private updates
    socket.join(`user:${userId}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id} (User: ${userId})`);
    });
    
    // Handle onboarding step completion
    socket.on('onboarding:complete-step', async (data, callback) => {
      try {
        const status = await onboardingService.completeOnboardingStep(userId, data);
        io.to(`user:${userId}`).emit('onboarding:status-updated', status);
        callback({ success: true, status });
      } catch (error) {
        console.error('Error completing onboarding step:', error);
        callback({ success: false, error: error.message });
      }
    });
    
    // Get current onboarding status
    socket.on('onboarding:status', async (callback) => {
      try {
        const status = await onboardingService.getOnboardingStatus(userId);
        callback({ success: true, status });
      } catch (error) {
        console.error('Error getting onboarding status:', error);
        callback({ success: false, error: error.message });
      }
    });
  });
  
  // Start the server
  httpServer.listen(port, () => {
    console.log(`🚀 Onboarding service running on port ${port}`);
  });
  
  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down onboarding service...');
    
    try {
      // Close Redis connection
      await redisStorage.clearAll();
      
      // Close the HTTP server
      httpServer.close(() => {
        console.log('✅ Onboarding service has been shut down');
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
