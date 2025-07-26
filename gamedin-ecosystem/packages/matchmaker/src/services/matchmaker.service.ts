import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  MatchRequest, 
  MatchResult, 
  MatchStatus, 
  IMatchMaker, 
  MatchRequestSchema, 
  MatchResultSchema 
} from '../types/match';

export class MatchMakerService extends EventEmitter implements IMatchMaker {
  private queue: Map<string, MatchRequest> = new Map();
  private matches: Map<string, MatchResult> = new Map();
  private matchInterval: NodeJS.Timeout | null = null;
  private isProcessing: boolean = false;

  constructor(private readonly matchIntervalMs: number = 5000) {
    super();
    this.startMatchmaking();
  }

  async addToQueue(request: MatchRequest): Promise<string> {
    // Validate the request
    const validatedRequest = MatchRequestSchema.parse({
      ...request,
      createdAt: new Date(),
    });

    const requestId = uuidv4();
    this.queue.set(requestId, validatedRequest);
    
    this.emit('queued', { requestId, request: validatedRequest });
    return requestId;
  }

  async cancelMatch(requestId: string): Promise<boolean> {
    if (this.queue.has(requestId)) {
      this.queue.delete(requestId);
      this.emit('cancelled', { requestId });
      return true;
    }
    return false;
  }

  async getMatchStatus(matchId: string): Promise<MatchResult | null> {
    return this.matches.get(matchId) || null;
  }

  async findMatches(): Promise<MatchResult[]> {
    if (this.isProcessing) {
      return [];
    }

    this.isProcessing = true;
    const newMatches: MatchResult[] = [];
    const processedRequests = new Set<string>();

    try {
      // Simple matching algorithm: group by role and preferences
      const requestsByRole = new Map<string, MatchRequest[]>();
      
      // Group requests by role
      for (const [requestId, request] of this.queue.entries()) {
        if (processedRequests.has(requestId)) continue;
        
        const key = `${request.role}:${request.preferences.region}:${request.preferences.language}`;
        if (!requestsByRole.has(key)) {
          requestsByRole.set(key, []);
        }
        requestsByRole.get(key)?.push(request);
      }

      // Try to form matches
      for (const [key, requests] of requestsByRole.entries()) {
        if (requests.length >= 2) { // Simple: match in pairs
          const [request1, request2] = requests;
          const matchId = uuidv4();
          
          const match: MatchResult = {
            matchId,
            status: MatchStatus.MATCHED,
            players: [request1.userId, request2.userId],
            metadata: {
              matchedAt: new Date(),
              role: key.split(':')[0],
              region: key.split(':')[1],
              language: key.split(':')[2],
            },
            createdAt: new Date(),
            matchedAt: new Date(),
          };

          // Validate the match
          const validatedMatch = MatchResultSchema.parse(match);
          
          // Add to matches and remove from queue
          this.matches.set(matchId, validatedMatch);
          newMatches.push(validatedMatch);
          
          // Remove matched requests from queue
          for (const [id, req] of this.queue.entries()) {
            if (req.userId === request1.userId || req.userId === request2.userId) {
              this.queue.delete(id);
              processedRequests.add(id);
            }
          }
        }
      }

      // Emit events for new matches
      for (const match of newMatches) {
        this.emit('match', match);
      }

      return newMatches;
    } catch (error) {
      console.error('Error finding matches:', error);
      this.emit('error', error);
      return [];
    } finally {
      this.isProcessing = false;
    }
  }

  private startMatchmaking(): void {
    if (this.matchInterval) {
      clearInterval(this.matchInterval);
    }

    this.matchInterval = setInterval(async () => {
      if (this.queue.size >= 2) {
        await this.findMatches();
      }
    }, this.matchIntervalMs);

    // Clean up on exit
    process.on('exit', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());
  }

  private shutdown(): void {
    if (this.matchInterval) {
      clearInterval(this.matchInterval);
      this.matchInterval = null;
    }
    this.emit('shutdown');
  }
}

// Singleton instance
export const matchMakerService = new MatchMakerService();

export default matchMakerService;
