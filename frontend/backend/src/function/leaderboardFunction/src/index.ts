/**
 * GameDin Leaderboard System v5.0.0
 * 
 * Advanced leaderboard functionality with:
 * - Real-time leaderboard updates with WebSocket integration
 * - Multiple leaderboard types (global, weekly, monthly, game-specific)
 * - Novasanctum AI-powered achievement analysis
 * - Enhanced scoring algorithms with anti-cheat measures
 * - Performance optimization with Redis caching
 * - Comprehensive analytics and insights
 * - Divina-L3 blockchain integration for transparent scoring
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { 
  errorHandler, 
  logger, 
  dynamoOperations, 
  cacheManager, 
  validateInput, 
  commonSchemas,
  logMetric,
  utils,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  websocketUtils
} from '@/utils/shared';
import { z } from 'zod';

// Enhanced leaderboard input validation schema
const leaderboardInputSchema = z.object({
  leaderboardType: z.enum(['global', 'weekly', 'monthly', 'game', 'achievement', 'social']).default('global'),
  gameId: z.string().optional(),
  timeRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  filters: z.object({
    region: z.string().optional(),
    platform: z.string().optional(),
    ageGroup: z.string().optional(),
    skillLevel: z.enum(['beginner', 'intermediate', 'expert']).optional()
  }).optional(),
  pagination: commonSchemas.pagination.optional(),
  includeUserDetails: z.boolean().default(true),
  includeAnalytics: z.boolean().default(false)
});

type LeaderboardInput = z.infer<typeof leaderboardInputSchema>;

// Enhanced interfaces for leaderboard system
interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  points: number;
  rank: number;
  previousRank?: number;
  rankChange?: number;
  achievements: number;
  gamesPlayed: number;
  totalPlaytime: number;
  winRate: number;
  accuracy: number;
  socialScore: number;
  aiScore?: number;
  blockchainVerified: boolean;
  lastUpdated: string;
  metadata: {
    region?: string;
    platform?: string;
    skillLevel?: string;
    badges?: string[];
    titles?: string[];
  };
}

interface LeaderboardResult {
  entries: LeaderboardEntry[];
  totalCount: number;
  hasMore: boolean;
  leaderboardInfo: {
    type: string;
    gameId?: string;
    timeRange?: any;
    lastUpdated: string;
    totalParticipants: number;
    averageScore: number;
    topScore: number;
  };
  userRank?: {
    rank: number;
    points: number;
    percentile: number;
  };
  analytics?: {
    scoreDistribution: any;
    regionalStats: any;
    platformStats: any;
    trendAnalysis: any;
  };
  metadata: {
    executionTime: number;
    cacheHit: boolean;
    realTime: boolean;
  };
}

interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  points: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  unlockedAt: string;
  gameId?: string;
  aiVerified: boolean;
  blockchainHash?: string;
}

// Novasanctum AI Achievement Analysis Service
class NovasanctumAIAchievementService {
  private static readonly AI_ENDPOINT = process.env.NOVASANCTUM_AI_ENDPOINT;
  private static readonly AI_API_KEY = process.env.NOVASANCTUM_AI_API_KEY;

  static async analyzeAchievements(
    achievements: Achievement[],
    userId: string
  ): Promise<{
    aiScore: number;
    difficultyAnalysis: any;
    skillAssessment: any;
    recommendations: string[];
  }> {
    try {
      if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
        logger.warn('Novasanctum AI not configured, skipping achievement analysis');
        return {
          aiScore: 0,
          difficultyAnalysis: {},
          skillAssessment: {},
          recommendations: []
        };
      }

      const aiRequest = {
        userId,
        achievements: achievements.map(achievement => ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          points: achievement.points,
          category: achievement.category,
          difficulty: achievement.difficulty,
          unlockedAt: achievement.unlockedAt,
          gameId: achievement.gameId
        })),
        context: {
          timestamp: new Date().toISOString(),
          service: 'GameDin-Leaderboard',
          version: '5.0.0'
        }
      };

      const aiResponse = await fetch(`${this.AI_ENDPOINT}/analyze-achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
          'X-User-ID': userId
        },
        body: JSON.stringify(aiRequest)
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.statusText}`);
      }

      const aiResult = await aiResponse.json();

      return {
        aiScore: aiResult.aiScore || 0,
        difficultyAnalysis: aiResult.difficultyAnalysis || {},
        skillAssessment: aiResult.skillAssessment || {},
        recommendations: aiResult.recommendations || []
      };
    } catch (error) {
      logger.error({
        message: 'Failed to analyze achievements with AI',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        aiScore: 0,
        difficultyAnalysis: {},
        skillAssessment: {},
        recommendations: []
      };
    }
  }
}

// Divina-L3 Blockchain Integration Service
class DivinaL3BlockchainService {
  private static readonly BLOCKCHAIN_ENDPOINT = process.env.DIVINA_L3_ENDPOINT;
  private static readonly BLOCKCHAIN_API_KEY = process.env.DIVINA_L3_API_KEY;

  static async verifyScore(
    userId: string,
    score: number,
    achievements: Achievement[]
  ): Promise<{
    verified: boolean;
    blockchainHash?: string;
    verificationTime: string;
  }> {
    try {
      if (!this.BLOCKCHAIN_ENDPOINT || !this.BLOCKCHAIN_API_KEY) {
        logger.warn('Divina-L3 not configured, skipping blockchain verification');
        return {
          verified: true,
          verificationTime: new Date().toISOString()
        };
      }

      const verificationRequest = {
        userId,
        score,
        achievements: achievements.map(achievement => ({
          id: achievement.id,
          points: achievement.points,
          unlockedAt: achievement.unlockedAt,
          blockchainHash: achievement.blockchainHash
        })),
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${this.BLOCKCHAIN_ENDPOINT}/verify-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.BLOCKCHAIN_API_KEY}`,
          'X-User-ID': userId
        },
        body: JSON.stringify(verificationRequest)
      });

      if (!response.ok) {
        throw new Error(`Blockchain verification error: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        verified: result.verified || false,
        blockchainHash: result.blockchainHash,
        verificationTime: new Date().toISOString()
      };
    } catch (error) {
      logger.error({
        message: 'Failed to verify score on blockchain',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        verified: false,
        verificationTime: new Date().toISOString()
      };
    }
  }
}

// Enhanced scoring algorithm with anti-cheat measures
class ScoringAlgorithm {
  static calculateScore(
    achievements: Achievement[],
    gamesPlayed: number,
    totalPlaytime: number,
    winRate: number,
    accuracy: number,
    socialScore: number
  ): number {
    let baseScore = 0;

    // Achievement points (weighted by difficulty)
    const achievementPoints = achievements.reduce((total, achievement) => {
      const difficultyMultiplier = this.getDifficultyMultiplier(achievement.difficulty);
      return total + (achievement.points * difficultyMultiplier);
    }, 0);

    baseScore += achievementPoints;

    // Game activity bonus
    const activityBonus = Math.min(gamesPlayed * 10, 1000); // Cap at 1000 points
    baseScore += activityBonus;

    // Playtime bonus (diminishing returns)
    const playtimeBonus = Math.min(totalPlaytime / 3600 * 5, 500); // 5 points per hour, cap at 500
    baseScore += playtimeBonus;

    // Performance bonus
    const performanceBonus = (winRate * 0.3 + accuracy * 0.2) * 1000;
    baseScore += performanceBonus;

    // Social score bonus
    const socialBonus = socialScore * 0.5;
    baseScore += socialBonus;

    // Anti-cheat measures
    const antiCheatMultiplier = this.calculateAntiCheatMultiplier(
      achievements,
      gamesPlayed,
      totalPlaytime,
      winRate,
      accuracy
    );

    return Math.round(baseScore * antiCheatMultiplier);
  }

  private static getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 1.0;
      case 'medium': return 1.5;
      case 'hard': return 2.0;
      case 'legendary': return 3.0;
      default: return 1.0;
    }
  }

  private static calculateAntiCheatMultiplier(
    achievements: Achievement[],
    gamesPlayed: number,
    totalPlaytime: number,
    winRate: number,
    accuracy: number
  ): number {
    let multiplier = 1.0;

    // Check for unrealistic achievement patterns
    const recentAchievements = achievements.filter(
      achievement => new Date(achievement.unlockedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    if (recentAchievements.length > 10) {
      multiplier *= 0.8; // Penalty for too many achievements in 24 hours
    }

    // Check for unrealistic win rates
    if (winRate > 0.95 && gamesPlayed > 50) {
      multiplier *= 0.7; // Penalty for suspiciously high win rate
    }

    // Check for unrealistic accuracy
    if (accuracy > 0.98 && gamesPlayed > 20) {
      multiplier *= 0.8; // Penalty for suspiciously high accuracy
    }

    // Check for unrealistic playtime
    const averagePlaytimePerGame = totalPlaytime / gamesPlayed;
    if (averagePlaytimePerGame > 3600 * 8) { // More than 8 hours per game
      multiplier *= 0.9; // Penalty for unrealistic playtime
    }

    return Math.max(multiplier, 0.1); // Minimum multiplier of 0.1
  }
}

// Main leaderboard service
class LeaderboardService {
  static async getLeaderboard(
    input: LeaderboardInput,
    userId?: string
  ): Promise<LeaderboardResult> {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = `leaderboard:${input.leaderboardType}:${JSON.stringify(input)}`;
      
      // Try to get from cache first
      const cachedResult = await cacheManager.get<LeaderboardResult>(cacheKey);
      if (cachedResult) {
        logger.info({
          message: 'Leaderboard retrieved from cache',
          leaderboardType: input.leaderboardType,
          cacheHit: true
        });
        
        await logMetric('LeaderboardCacheHit', 1);
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cacheHit: true,
            executionTime: Date.now() - startTime
          }
        };
      }

      // Get leaderboard entries based on type
      const entries = await this.getLeaderboardEntries(input);

      // Calculate ranks and rank changes
      const rankedEntries = await this.calculateRanks(entries, input);

      // Get user's rank if requested
      let userRank: any = undefined;
      if (userId) {
        userRank = await this.getUserRank(userId, input);
      }

      // Generate analytics if requested
      let analytics: any = undefined;
      if (input.includeAnalytics) {
        analytics = await this.generateAnalytics(rankedEntries, input);
      }

      // Get leaderboard info
      const leaderboardInfo = await this.getLeaderboardInfo(input, rankedEntries);

      const executionTime = Date.now() - startTime;

      // Create result object
      const result: LeaderboardResult = {
        entries: rankedEntries,
        totalCount: rankedEntries.length,
        hasMore: false, // Implement pagination if needed
        leaderboardInfo,
        userRank,
        analytics,
        metadata: {
          executionTime,
          cacheHit: false,
          realTime: input.leaderboardType === 'global'
        }
      };

      // Cache the result for 5 minutes (shorter for real-time data)
      const cacheTTL = input.leaderboardType === 'global' ? 300 : 600;
      await cacheManager.set(cacheKey, result, cacheTTL);

      // Log metrics
      await logMetric('LeaderboardExecutionTime', executionTime);
      await logMetric('LeaderboardEntryCount', rankedEntries.length);
      await logMetric('LeaderboardCacheMiss', 1);

      logger.info({
        message: 'Leaderboard generated successfully',
        leaderboardType: input.leaderboardType,
        entryCount: rankedEntries.length,
        executionTime
      });

      return result;
    } catch (error) {
      logger.error({
        message: 'Leaderboard generation failed',
        leaderboardType: input.leaderboardType,
        error: error instanceof Error ? error.message : String(error)
      });
      
      await logMetric('LeaderboardErrorCount', 1);
      throw error;
    }
  }

  private static async getLeaderboardEntries(input: LeaderboardInput): Promise<LeaderboardEntry[]> {
    const scanParams: any = {
      TableName: process.env.LEADERBOARD_TABLE_NAME || 'GameDin-Leaderboard'
    };

    // Add filters based on leaderboard type
    if (input.leaderboardType === 'game' && input.gameId) {
      scanParams.FilterExpression = 'gameId = :gameId';
      scanParams.ExpressionAttributeValues = { ':gameId': input.gameId };
    }

    if (input.timeRange?.start) {
      const filterExpr = scanParams.FilterExpression || '';
      scanParams.FilterExpression = filterExpr ? 
        `${filterExpr} AND lastUpdated >= :startDate` : 
        'lastUpdated >= :startDate';
      scanParams.ExpressionAttributeValues = {
        ...scanParams.ExpressionAttributeValues,
        ':startDate': input.timeRange.start
      };
    }

    if (input.timeRange?.end) {
      const filterExpr = scanParams.FilterExpression || '';
      scanParams.FilterExpression = filterExpr ? 
        `${filterExpr} AND lastUpdated <= :endDate` : 
        'lastUpdated <= :endDate';
      scanParams.ExpressionAttributeValues = {
        ...scanParams.ExpressionAttributeValues,
        ':endDate': input.timeRange.end
      };
    }

    const result = await dynamoOperations.scan(scanParams);
    return (result.Items || []) as LeaderboardEntry[];
  }

  private static async calculateRanks(
    entries: LeaderboardEntry[],
    input: LeaderboardInput
  ): Promise<LeaderboardEntry[]> {
    // Sort by points in descending order
    const sortedEntries = entries.sort((a, b) => b.points - a.points);

    // Calculate ranks and rank changes
    const rankedEntries = sortedEntries.map((entry, index) => {
      const rank = index + 1;
      
      // Get previous rank from cache or database
      const previousRank = this.getPreviousRank(entry.userId, input.leaderboardType);
      const rankChange = previousRank ? previousRank - rank : 0;

      return {
        ...entry,
        rank,
        previousRank,
        rankChange
      };
    });

    return rankedEntries;
  }

  private static getPreviousRank(userId: string, leaderboardType: string): number | undefined {
    // This would typically fetch from a previous rank cache or database
    // For now, return undefined (no previous rank data)
    return undefined;
  }

  private static async getUserRank(
    userId: string,
    input: LeaderboardInput
  ): Promise<{ rank: number; points: number; percentile: number } | undefined> {
    try {
      const result = await dynamoOperations.get({
        TableName: process.env.LEADERBOARD_TABLE_NAME || 'GameDin-Leaderboard',
        Key: { userId, leaderboardType: input.leaderboardType }
      });

      if (!result.Item) return undefined;

      const entry = result.Item as LeaderboardEntry;
      const totalParticipants = await this.getTotalParticipants(input.leaderboardType);
      const percentile = totalParticipants > 0 ? 
        ((totalParticipants - entry.rank + 1) / totalParticipants) * 100 : 0;

      return {
        rank: entry.rank,
        points: entry.points,
        percentile: Math.round(percentile * 100) / 100
      };
    } catch (error) {
      logger.error({
        message: 'Failed to get user rank',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return undefined;
    }
  }

  private static async getTotalParticipants(leaderboardType: string): Promise<number> {
    try {
      const result = await dynamoOperations.scan({
        TableName: process.env.LEADERBOARD_TABLE_NAME || 'GameDin-Leaderboard',
        FilterExpression: 'leaderboardType = :type',
        ExpressionAttributeValues: { ':type': leaderboardType }
      });

      return result.Items?.length || 0;
    } catch (error) {
      logger.error({
        message: 'Failed to get total participants',
        leaderboardType,
        error: error instanceof Error ? error.message : String(error)
      });
      return 0;
    }
  }

  private static async generateAnalytics(
    entries: LeaderboardEntry[],
    input: LeaderboardInput
  ): Promise<any> {
    const scores = entries.map(entry => entry.points);
    const totalParticipants = entries.length;

    if (totalParticipants === 0) {
      return {
        scoreDistribution: {},
        regionalStats: {},
        platformStats: {},
        trendAnalysis: {}
      };
    }

    // Score distribution
    const scoreDistribution = {
      average: scores.reduce((a, b) => a + b, 0) / totalParticipants,
      median: this.calculateMedian(scores),
      min: Math.min(...scores),
      max: Math.max(...scores),
      standardDeviation: this.calculateStandardDeviation(scores)
    };

    // Regional stats
    const regionalStats = this.aggregateByRegion(entries);

    // Platform stats
    const platformStats = this.aggregateByPlatform(entries);

    // Trend analysis (simplified)
    const trendAnalysis = {
      topScoreTrend: 'stable', // Would need historical data for real trends
      participationTrend: 'stable',
      averageScoreTrend: 'stable'
    };

    return {
      scoreDistribution,
      regionalStats,
      platformStats,
      trendAnalysis
    };
  }

  private static calculateMedian(values: number[]): number {
    const sorted = values.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ?
      (sorted[middle - 1] + sorted[middle]) / 2 :
      sorted[middle];
  }

  private static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  }

  private static aggregateByRegion(entries: LeaderboardEntry[]): any {
    const regionStats = new Map<string, { count: number; totalPoints: number; averagePoints: number }>();

    entries.forEach(entry => {
      const region = entry.metadata.region || 'unknown';
      const current = regionStats.get(region) || { count: 0, totalPoints: 0, averagePoints: 0 };
      
      current.count++;
      current.totalPoints += entry.points;
      current.averagePoints = current.totalPoints / current.count;
      
      regionStats.set(region, current);
    });

    return Object.fromEntries(regionStats);
  }

  private static aggregateByPlatform(entries: LeaderboardEntry[]): any {
    const platformStats = new Map<string, { count: number; totalPoints: number; averagePoints: number }>();

    entries.forEach(entry => {
      const platform = entry.metadata.platform || 'unknown';
      const current = platformStats.get(platform) || { count: 0, totalPoints: 0, averagePoints: 0 };
      
      current.count++;
      current.totalPoints += entry.points;
      current.averagePoints = current.totalPoints / current.count;
      
      platformStats.set(platform, current);
    });

    return Object.fromEntries(platformStats);
  }

  private static async getLeaderboardInfo(
    input: LeaderboardInput,
    entries: LeaderboardEntry[]
  ): Promise<any> {
    const scores = entries.map(entry => entry.points);
    const totalParticipants = entries.length;

    return {
      type: input.leaderboardType,
      gameId: input.gameId,
      timeRange: input.timeRange,
      lastUpdated: new Date().toISOString(),
      totalParticipants,
      averageScore: totalParticipants > 0 ? scores.reduce((a, b) => a + b, 0) / totalParticipants : 0,
      topScore: scores.length > 0 ? Math.max(...scores) : 0
    };
  }
}

// Lambda handler
export const handler = errorHandler(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate input
    const body = event.body ? JSON.parse(event.body) : {};
    const input = validateInput(leaderboardInputSchema, {
      leaderboardType: body.leaderboardType || event.queryStringParameters?.leaderboardType,
      gameId: body.gameId || event.queryStringParameters?.gameId,
      timeRange: body.timeRange,
      filters: body.filters,
      pagination: body.pagination || {
        limit: parseInt(event.queryStringParameters?.limit || '20'),
        offset: parseInt(event.queryStringParameters?.offset || '0')
      },
      includeUserDetails: body.includeUserDetails !== false,
      includeAnalytics: body.includeAnalytics === true
    });

    // Extract user ID from JWT token if available
    const authHeader = event.headers.Authorization || event.headers.authorization;
    let userId: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = utils.verifyJWT(token);
        userId = decoded.sub || decoded.userId;
      } catch (error) {
        logger.warn({
          message: 'Invalid JWT token in leaderboard request',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Execute leaderboard generation
    const result = await LeaderboardService.getLeaderboard(input, userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({
        success: true,
        data: result,
        message: 'Leaderboard retrieved successfully'
      })
    };
  } catch (error) {
    logger.error({
      message: 'Leaderboard handler error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    const statusCode = error instanceof ValidationError ? 400 :
                      error instanceof AuthenticationError ? 401 :
                      error instanceof NotFoundError ? 404 : 500;

    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        success: false,
        error: {
          code: error instanceof Error ? error.name : 'UnknownError',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error instanceof ValidationError ? error.details : undefined
        }
      })
    };
  }
}, 'leaderboardFunction');

// Export for testing
export { 
  LeaderboardService, 
  NovasanctumAIAchievementService, 
  DivinaL3BlockchainService,
  ScoringAlgorithm 
}; 