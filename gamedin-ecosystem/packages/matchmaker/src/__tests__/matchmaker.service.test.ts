import { matchMakerService, MatchStatus, PlayerRole } from '..';
import { v4 as uuidv4 } from 'uuid';

describe('MatchMakerService', () => {
  beforeEach(() => {
    // Reset the service before each test
    matchMakerService['queue'].clear();
    matchMakerService['matches'].clear();
  });

  describe('addToQueue', () => {
    it('should add a player to the matchmaking queue', async () => {
      const userId = uuidv4();
      const requestId = await matchMakerService.addToQueue({
        userId,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
          skillLevel: 50,
        },
      });

      expect(requestId).toBeDefined();
      expect(matchMakerService['queue'].has(requestId)).toBe(true);
    });
  });

  describe('cancelMatch', () => {
    it('should remove a player from the matchmaking queue', async () => {
      const userId = uuidv4();
      const requestId = await matchMakerService.addToQueue({
        userId,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
        },
      });

      const result = await matchMakerService.cancelMatch(requestId);
      expect(result).toBe(true);
      expect(matchMakerService['queue'].has(requestId)).toBe(false);
    });

    it('should return false if request ID does not exist', async () => {
      const result = await matchMakerService.cancelMatch('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('findMatches', () => {
    it('should match two players with compatible preferences', async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();

      // Add two players with compatible preferences
      await matchMakerService.addToQueue({
        userId: userId1,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
          skillLevel: 50,
        },
      });

      await matchMakerService.addToQueue({
        userId: userId2,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
          skillLevel: 55,
        },
      });

      // Trigger matchmaking
      const matches = await matchMakerService.findMatches();
      
      expect(matches.length).toBe(1);
      expect(matches[0].players).toContain(userId1);
      expect(matches[0].players).toContain(userId2);
      expect(matches[0].status).toBe(MatchStatus.MATCHED);
    });

    it('should not match players with incompatible preferences', async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();

      // Add two players with incompatible preferences
      await matchMakerService.addToQueue({
        userId: userId1,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
        },
      });

      await matchMakerService.addToQueue({
        userId: userId2,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'eu-west',
          language: 'fr',
        },
      });

      // Trigger matchmaking
      const matches = await matchMakerService.findMatches();
      expect(matches.length).toBe(0);
    });
  });

  describe('getMatchStatus', () => {
    it('should return null for non-existent match', async () => {
      const status = await matchMakerService.getMatchStatus('non-existent-id');
      expect(status).toBeNull();
    });

    it('should return the status of an existing match', async () => {
      const userId1 = uuidv4();
      const userId2 = uuidv4();

      // Add two players and create a match
      await matchMakerService.addToQueue({
        userId: userId1,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
        },
      });

      await matchMakerService.addToQueue({
        userId: userId2,
        role: PlayerRole.PLAYER,
        preferences: {
          region: 'us-east',
          language: 'en',
        },
      });

      // Trigger matchmaking
      const matches = await matchMakerService.findMatches();
      const matchId = matches[0].matchId;

      // Get match status
      const status = await matchMakerService.getMatchStatus(matchId);
      expect(status).toBeDefined();
      expect(status?.matchId).toBe(matchId);
      expect(status?.status).toBe(MatchStatus.MATCHED);
    });
  });
});
