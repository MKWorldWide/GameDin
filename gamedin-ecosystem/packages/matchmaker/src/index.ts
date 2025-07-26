import { config } from 'dotenv';
import { matchMakerService } from './services/matchmaker.service';

// Load environment variables
config();

// Export types and interfaces
export * from './types/match';

// Export services
export { matchMakerService };

export default matchMakerService;

// Start the service if this file is run directly
if (require.main === module) {
  const port = process.env.MATCHMAKER_PORT || 3001;
  
  console.log(`🚀 Matchmaker service starting on port ${port}...`);
  
  // Example usage
  matchMakerService
    .on('queued', ({ requestId, request }) => {
      console.log(`📝 Request queued: ${requestId} (${request.userId})`);
    })
    .on('match', (match) => {
      console.log(`🎉 Match found: ${match.matchId}`, match.players);
    })
    .on('cancelled', ({ requestId }) => {
      console.log(`❌ Request cancelled: ${requestId}`);
    })
    .on('error', (error) => {
      console.error('❌ Matchmaker error:', error);
    })
    .on('shutdown', () => {
      console.log('🛑 Matchmaker service shutting down...');
    });
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
  });
}
