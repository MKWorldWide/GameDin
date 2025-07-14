/**
 * GameDin Recommendation Engine v5.0.0
 * 
 * Advanced game recommendation system with:
 * - Novasanctum AI-powered content-based filtering
 * - Collaborative filtering with user behavior analysis
 * - Hybrid recommendation algorithms
 * - Real-time personalization
 * - Multi-criteria decision making
 * - A/B testing support for recommendation strategies
 * - Performance optimization with caching
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
  AuthenticationError
} from '@/utils/shared';
import { z } from 'zod';

// Enhanced recommendation input validation schema
const recommendationInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  limit: z.number().min(1).max(100).default(20),
  filters: z.object({
    genre: z.array(z.string()).optional(),
    platform: z.array(z.string()).optional(),
    rating: z.object({
      min: z.number().min(0).max(10).optional(),
      max: z.number().min(0).max(10).optional()
    }).optional(),
    price: z.object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional()
    }).optional(),
    releaseDate: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional()
    }).optional()
  }).optional(),
  strategy: z.enum(['ai', 'collaborative', 'hybrid', 'popular', 'recent']).default('hybrid'),
  includePlayedGames: z.boolean().default(false),
  diversity: z.number().min(0).max(1).default(0.3),
  freshness: z.number().min(0).max(1).default(0.2)
});

type RecommendationInput = z.infer<typeof recommendationInputSchema>;

// Enhanced interfaces for recommendation system
interface User {
  id: string;
  username: string;
  preferences: {
    favoriteGenres: string[];
    favoritePlatforms: string[];
    preferredPriceRange: { min: number; max: number };
    preferredRating: { min: number; max: number };
  };
  behavior: {
    totalPlaytime: number;
    averageSessionLength: number;
    preferredPlayTimes: string[];
    socialGaming: boolean;
  };
  demographics: {
    age: number;
    location: string;
    gamingExperience: 'beginner' | 'intermediate' | 'expert';
  };
}

interface Game {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  genre: string[];
  platform: string[];
  releaseDate?: string;
  developer: string;
  publisher: string;
  rating?: number;
  reviewCount?: number;
  price?: number;
  tags?: string[];
  aiScore?: number;
  popularity?: number;
  complexity?: number;
  playtime?: number;
  multiplayer?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserGameInteraction {
  userId: string;
  gameId: string;
  interactionType: 'play' | 'review' | 'favorite' | 'purchase' | 'wishlist' | 'view';
  rating?: number;
  playtime?: number;
  lastInteraction: string;
  frequency: number;
}

interface RecommendationResult {
  games: Game[];
  recommendations: {
    strategy: string;
    confidence: number;
    reasoning: string[];
    diversity: number;
    freshness: number;
  };
  userInsights: {
    preferences: any;
    behavior: any;
    recommendations: any;
  };
  metadata: {
    executionTime: number;
    cacheHit: boolean;
    aiEnhanced: boolean;
  };
}

// Novasanctum AI Recommendation Service
class NovasanctumAIRecommendationService {
  private static readonly AI_ENDPOINT = process.env.NOVASANCTUM_AI_ENDPOINT;
  private static readonly AI_API_KEY = process.env.NOVASANCTUM_AI_API_KEY;

  static async generateRecommendations(
    user: User,
    availableGames: Game[],
    userInteractions: UserGameInteraction[],
    strategy: string,
    limit: number
  ): Promise<{
    recommendedGames: Game[];
    confidence: number;
    reasoning: string[];
  }> {
    try {
      if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
        logger.warn('Novasanctum AI not configured, using fallback recommendations');
        return this.generateFallbackRecommendations(user, availableGames, limit);
      }

      // Prepare data for AI analysis
      const aiRequest = {
        user: {
          id: user.id,
          preferences: user.preferences,
          behavior: user.behavior,
          demographics: user.demographics
        },
        interactions: userInteractions.map(interaction => ({
          gameId: interaction.gameId,
          type: interaction.interactionType,
          rating: interaction.rating,
          playtime: interaction.playtime,
          frequency: interaction.frequency
        })),
        availableGames: availableGames.map(game => ({
          id: game.id,
          title: game.title,
          description: game.description,
          genre: game.genre,
          platform: game.platform,
          rating: game.rating,
          price: game.price,
          tags: game.tags,
          complexity: game.complexity,
          playtime: game.playtime,
          multiplayer: game.multiplayer
        })),
        strategy,
        limit,
        context: {
          timestamp: new Date().toISOString(),
          userAgent: 'GameDin-Recommendation-Engine',
          version: '5.0.0'
        }
      };

      // Call Novasanctum AI for recommendations
      const aiResponse = await fetch(`${this.AI_ENDPOINT}/recommend-games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
          'X-User-ID': user.id,
          'X-Strategy': strategy
        },
        body: JSON.stringify(aiRequest)
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.statusText}`);
      }

      const aiResult = await aiResponse.json();

      // Map AI recommendations back to game objects
      const recommendedGames = aiResult.recommendedGames
        .map((rec: any) => {
          const game = availableGames.find(g => g.id === rec.gameId);
          return game ? { ...game, aiScore: rec.score, aiReasoning: rec.reasoning } : null;
        })
        .filter(Boolean)
        .slice(0, limit);

      return {
        recommendedGames,
        confidence: aiResult.confidence || 0.7,
        reasoning: aiResult.reasoning || ['AI-powered recommendations based on user preferences and behavior']
      };
    } catch (error) {
      logger.error({
        message: 'Failed to generate AI recommendations',
        userId: user.id,
        error: error instanceof Error ? error.message : String(error)
      });

      // Fallback to traditional recommendation methods
      return this.generateFallbackRecommendations(user, availableGames, limit);
    }
  }

  private static generateFallbackRecommendations(
    user: User,
    availableGames: Game[],
    limit: number
  ): {
    recommendedGames: Game[];
    confidence: number;
    reasoning: string[];
  } {
    // Content-based filtering based on user preferences
    const scoredGames = availableGames.map(game => {
      let score = 0;
      const reasoning: string[] = [];

      // Genre preference matching
      const genreMatch = game.genre.some(genre => 
        user.preferences.favoriteGenres.includes(genre)
      );
      if (genreMatch) {
        score += 30;
        reasoning.push('Matches your favorite genres');
      }

      // Platform preference matching
      const platformMatch = game.platform.some(platform => 
        user.preferences.favoritePlatforms.includes(platform)
      );
      if (platformMatch) {
        score += 20;
        reasoning.push('Available on your preferred platforms');
      }

      // Rating preference matching
      if (game.rating && game.rating >= user.preferences.preferredRating.min) {
        score += 15;
        reasoning.push('Meets your rating preferences');
      }

      // Price preference matching
      if (game.price && game.price <= user.preferences.preferredPriceRange.max) {
        score += 10;
        reasoning.push('Within your price range');
      }

      // Popularity bonus
      if (game.popularity) {
        score += game.popularity * 0.1;
        reasoning.push('Popular among gamers');
      }

      return { ...game, score, reasoning };
    });

    // Sort by score and return top recommendations
    const recommendedGames = scoredGames
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, reasoning, ...game }) => game);

    return {
      recommendedGames,
      confidence: 0.6,
      reasoning: ['Content-based recommendations based on your preferences']
    };
  }
}

// Collaborative Filtering Service
class CollaborativeFilteringService {
  static async findSimilarUsers(
    userId: string,
    userInteractions: UserGameInteraction[]
  ): Promise<string[]> {
    try {
      // Get all user interactions for similarity calculation
      const allInteractions = await dynamoOperations.scan({
        TableName: process.env.USER_INTERACTIONS_TABLE_NAME || 'GameDin-UserInteractions'
      });

      const interactions = allInteractions.Items || [];
      
      // Calculate user similarity using cosine similarity
      const userSimilarities = new Map<string, number>();
      const currentUserInteractions = new Map<string, number>();

      // Build current user's interaction vector
      userInteractions.forEach(interaction => {
        const weight = this.getInteractionWeight(interaction.interactionType);
        currentUserInteractions.set(interaction.gameId, weight);
      });

      // Calculate similarity with other users
      const otherUsers = new Map<string, Map<string, number>>();
      
      interactions.forEach((interaction: any) => {
        if (interaction.userId !== userId) {
          if (!otherUsers.has(interaction.userId)) {
            otherUsers.set(interaction.userId, new Map());
          }
          const weight = this.getInteractionWeight(interaction.interactionType);
          otherUsers.get(interaction.userId)!.set(interaction.gameId, weight);
        }
      });

      // Calculate cosine similarity
      otherUsers.forEach((userInteractions, otherUserId) => {
        const similarity = this.calculateCosineSimilarity(
          currentUserInteractions,
          userInteractions
        );
        if (similarity > 0.1) { // Minimum similarity threshold
          userSimilarities.set(otherUserId, similarity);
        }
      });

      // Return top similar users
      return Array.from(userSimilarities.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([userId]) => userId);
    } catch (error) {
      logger.error({
        message: 'Failed to find similar users',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  private static getInteractionWeight(interactionType: string): number {
    switch (interactionType) {
      case 'purchase': return 5;
      case 'play': return 4;
      case 'favorite': return 3;
      case 'review': return 2;
      case 'wishlist': return 1;
      case 'view': return 0.5;
      default: return 0;
    }
  }

  private static calculateCosineSimilarity(
    vector1: Map<string, number>,
    vector2: Map<string, number>
  ): number {
    const allKeys = new Set([...vector1.keys(), ...vector2.keys()]);
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    allKeys.forEach(key => {
      const val1 = vector1.get(key) || 0;
      const val2 = vector2.get(key) || 0;
      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    });

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }
}

// Main recommendation engine
class RecommendationEngine {
  static async generateRecommendations(
    input: RecommendationInput
  ): Promise<RecommendationResult> {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = `recommendations:${input.userId}:${JSON.stringify(input)}`;
      
      // Try to get from cache first
      const cachedResult = await cacheManager.get<RecommendationResult>(cacheKey);
      if (cachedResult) {
        logger.info({
          message: 'Recommendations retrieved from cache',
          userId: input.userId,
          cacheHit: true
        });
        
        await logMetric('RecommendationCacheHit', 1);
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            cacheHit: true,
            executionTime: Date.now() - startTime
          }
        };
      }

      // Get user data
      const user = await this.getUser(input.userId);
      if (!user) {
        throw new NotFoundError('User');
      }

      // Get user interactions
      const userInteractions = await this.getUserInteractions(input.userId);

      // Get available games
      const availableGames = await this.getAvailableGames(input.filters);

      // Generate recommendations based on strategy
      let recommendedGames: Game[];
      let confidence: number;
      let reasoning: string[];

      switch (input.strategy) {
        case 'ai':
          const aiResult = await NovasanctumAIRecommendationService.generateRecommendations(
            user,
            availableGames,
            userInteractions,
            'ai',
            input.limit
          );
          recommendedGames = aiResult.recommendedGames;
          confidence = aiResult.confidence;
          reasoning = aiResult.reasoning;
          break;

        case 'collaborative':
          const collaborativeResult = await this.generateCollaborativeRecommendations(
            user,
            availableGames,
            userInteractions,
            input.limit
          );
          recommendedGames = collaborativeResult.games;
          confidence = collaborativeResult.confidence;
          reasoning = collaborativeResult.reasoning;
          break;

        case 'hybrid':
          const hybridResult = await this.generateHybridRecommendations(
            user,
            availableGames,
            userInteractions,
            input.limit,
            input.diversity,
            input.freshness
          );
          recommendedGames = hybridResult.games;
          confidence = hybridResult.confidence;
          reasoning = hybridResult.reasoning;
          break;

        case 'popular':
          const popularResult = await this.generatePopularRecommendations(
            availableGames,
            input.limit
          );
          recommendedGames = popularResult.games;
          confidence = popularResult.confidence;
          reasoning = popularResult.reasoning;
          break;

        case 'recent':
          const recentResult = await this.generateRecentRecommendations(
            availableGames,
            input.limit
          );
          recommendedGames = recentResult.games;
          confidence = recentResult.confidence;
          reasoning = recentResult.reasoning;
          break;

        default:
          throw new ValidationError(`Unknown recommendation strategy: ${input.strategy}`);
      }

      // Apply diversity and freshness if specified
      if (input.diversity > 0 || input.freshness > 0) {
        recommendedGames = this.applyDiversityAndFreshness(
          recommendedGames,
          input.diversity,
          input.freshness
        );
      }

      // Filter out played games if requested
      if (!input.includePlayedGames) {
        const playedGameIds = new Set(userInteractions
          .filter(i => i.interactionType === 'play')
          .map(i => i.gameId)
        );
        recommendedGames = recommendedGames.filter(game => !playedGameIds.has(game.id));
      }

      const executionTime = Date.now() - startTime;

      // Create result object
      const result: RecommendationResult = {
        games: recommendedGames,
        recommendations: {
          strategy: input.strategy,
          confidence,
          reasoning,
          diversity: input.diversity,
          freshness: input.freshness
        },
        userInsights: {
          preferences: user.preferences,
          behavior: user.behavior,
          recommendations: {
            totalInteractions: userInteractions.length,
            favoriteGenres: this.getFavoriteGenres(userInteractions),
            averageRating: this.getAverageRating(userInteractions),
            playtimeStats: this.getPlaytimeStats(userInteractions)
          }
        },
        metadata: {
          executionTime,
          cacheHit: false,
          aiEnhanced: input.strategy === 'ai' || input.strategy === 'hybrid'
        }
      };

      // Cache the result for 10 minutes
      await cacheManager.set(cacheKey, result, 600);

      // Log metrics
      await logMetric('RecommendationExecutionTime', executionTime);
      await logMetric('RecommendationResultCount', recommendedGames.length);
      await logMetric('RecommendationCacheMiss', 1);

      logger.info({
        message: 'Recommendations generated successfully',
        userId: input.userId,
        strategy: input.strategy,
        resultCount: recommendedGames.length,
        executionTime,
        confidence
      });

      return result;
    } catch (error) {
      logger.error({
        message: 'Recommendation generation failed',
        userId: input.userId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      await logMetric('RecommendationErrorCount', 1);
      throw error;
    }
  }

  private static async getUser(userId: string): Promise<User | null> {
    try {
      const result = await dynamoOperations.get({
        TableName: process.env.USERS_TABLE_NAME || 'GameDin-Users',
        Key: { id: userId }
      });

      return result.Item as User || null;
    } catch (error) {
      logger.error({
        message: 'Failed to get user',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }

  private static async getUserInteractions(userId: string): Promise<UserGameInteraction[]> {
    try {
      const result = await dynamoOperations.query({
        TableName: process.env.USER_INTERACTIONS_TABLE_NAME || 'GameDin-UserInteractions',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      });

      return (result.Items || []) as UserGameInteraction[];
    } catch (error) {
      logger.error({
        message: 'Failed to get user interactions',
        userId,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  private static async getAvailableGames(filters?: any): Promise<Game[]> {
    try {
      const scanParams: any = {
        TableName: process.env.GAMES_TABLE_NAME || 'GameDin-Games'
      };

      // Apply filters if provided
      if (filters) {
        scanParams.FilterExpression = [];
        scanParams.ExpressionAttributeNames = {};
        scanParams.ExpressionAttributeValues = {};

        if (filters.genre?.length) {
          scanParams.FilterExpression.push('genre IN (:genres)');
          scanParams.ExpressionAttributeValues[':genres'] = filters.genre;
        }

        if (filters.platform?.length) {
          scanParams.FilterExpression.push('platform IN (:platforms)');
          scanParams.ExpressionAttributeValues[':platforms'] = filters.platform;
        }

        if (filters.rating?.min !== undefined) {
          scanParams.FilterExpression.push('rating >= :minRating');
          scanParams.ExpressionAttributeValues[':minRating'] = filters.rating.min;
        }

        if (filters.rating?.max !== undefined) {
          scanParams.FilterExpression.push('rating <= :maxRating');
          scanParams.ExpressionAttributeValues[':maxRating'] = filters.rating.max;
        }

        if (scanParams.FilterExpression.length > 0) {
          scanParams.FilterExpression = scanParams.FilterExpression.join(' AND ');
        } else {
          delete scanParams.FilterExpression;
        }
      }

      const result = await dynamoOperations.scan(scanParams);
      return (result.Items || []) as Game[];
    } catch (error) {
      logger.error({
        message: 'Failed to get available games',
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  private static async generateCollaborativeRecommendations(
    user: User,
    availableGames: Game[],
    userInteractions: UserGameInteraction[],
    limit: number
  ): Promise<{ games: Game[]; confidence: number; reasoning: string[] }> {
    const similarUsers = await CollaborativeFilteringService.findSimilarUsers(
      user.id,
      userInteractions
    );

    if (similarUsers.length === 0) {
      return {
        games: availableGames.slice(0, limit),
        confidence: 0.3,
        reasoning: ['No similar users found, showing popular games']
      };
    }

    // Get games that similar users have played but current user hasn't
    const similarUserInteractions = await Promise.all(
      similarUsers.map(userId => this.getUserInteractions(userId))
    );

    const gameScores = new Map<string, number>();
    const playedGameIds = new Set(userInteractions.map(i => i.gameId));

    similarUserInteractions.flat().forEach(interaction => {
      if (!playedGameIds.has(interaction.gameId)) {
        const currentScore = gameScores.get(interaction.gameId) || 0;
        const weight = this.getInteractionWeight(interaction.interactionType);
        gameScores.set(interaction.gameId, currentScore + weight);
      }
    });

    const recommendedGames = availableGames
      .filter(game => gameScores.has(game.id))
      .sort((a, b) => (gameScores.get(b.id) || 0) - (gameScores.get(a.id) || 0))
      .slice(0, limit);

    return {
      games: recommendedGames,
      confidence: 0.7,
      reasoning: [`Based on ${similarUsers.length} similar users' preferences`]
    };
  }

  private static async generateHybridRecommendations(
    user: User,
    availableGames: Game[],
    userInteractions: UserGameInteraction[],
    limit: number,
    diversity: number,
    freshness: number
  ): Promise<{ games: Game[]; confidence: number; reasoning: string[] }> {
    // Combine AI and collaborative filtering
    const [aiResult, collaborativeResult] = await Promise.all([
      NovasanctumAIRecommendationService.generateRecommendations(
        user,
        availableGames,
        userInteractions,
        'ai',
        Math.ceil(limit * 0.6)
      ),
      this.generateCollaborativeRecommendations(
        user,
        availableGames,
        userInteractions,
        Math.ceil(limit * 0.4)
      )
    ]);

    // Combine and deduplicate results
    const combinedGames = [...aiResult.recommendedGames, ...collaborativeResult.games];
    const uniqueGames = Array.from(
      new Map(combinedGames.map(game => [game.id, game])).values()
    );

    return {
      games: uniqueGames.slice(0, limit),
      confidence: (aiResult.confidence + collaborativeResult.confidence) / 2,
      reasoning: [...aiResult.reasoning, ...collaborativeResult.reasoning]
    };
  }

  private static async generatePopularRecommendations(
    availableGames: Game[],
    limit: number
  ): Promise<{ games: Game[]; confidence: number; reasoning: string[] }> {
    const popularGames = availableGames
      .filter(game => game.popularity && game.rating)
      .sort((a, b) => {
        const scoreA = (a.popularity || 0) * 0.7 + (a.rating || 0) * 0.3;
        const scoreB = (b.popularity || 0) * 0.7 + (b.rating || 0) * 0.3;
        return scoreB - scoreA;
      })
      .slice(0, limit);

    return {
      games: popularGames,
      confidence: 0.8,
      reasoning: ['Based on popularity and ratings']
    };
  }

  private static async generateRecentRecommendations(
    availableGames: Game[],
    limit: number
  ): Promise<{ games: Game[]; confidence: number; reasoning: string[] }> {
    const recentGames = availableGames
      .filter(game => game.releaseDate)
      .sort((a, b) => new Date(b.releaseDate!).getTime() - new Date(a.releaseDate!).getTime())
      .slice(0, limit);

    return {
      games: recentGames,
      confidence: 0.6,
      reasoning: ['Latest releases']
    };
  }

  private static applyDiversityAndFreshness(
    games: Game[],
    diversity: number,
    freshness: number
  ): Game[] {
    if (diversity === 0 && freshness === 0) return games;

    const diversifiedGames: Game[] = [];
    const usedGenres = new Set<string>();
    const usedDevelopers = new Set<string>();

    games.forEach(game => {
      const genreDiversity = game.genre.some(g => !usedGenres.has(g));
      const developerDiversity = !usedDevelopers.has(game.developer);
      const isRecent = game.releaseDate && 
        new Date(game.releaseDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      let score = 1;
      if (diversity > 0) {
        if (genreDiversity) score += diversity;
        if (developerDiversity) score += diversity * 0.5;
      }
      if (freshness > 0 && isRecent) {
        score += freshness;
      }

      diversifiedGames.push({ ...game, diversityScore: score });
    });

    return diversifiedGames
      .sort((a, b) => (b.diversityScore || 0) - (a.diversityScore || 0))
      .map(({ diversityScore, ...game }) => game);
  }

  private static getInteractionWeight(interactionType: string): number {
    switch (interactionType) {
      case 'purchase': return 5;
      case 'play': return 4;
      case 'favorite': return 3;
      case 'review': return 2;
      case 'wishlist': return 1;
      case 'view': return 0.5;
      default: return 0;
    }
  }

  private static getFavoriteGenres(interactions: UserGameInteraction[]): string[] {
    const genreCounts = new Map<string, number>();
    interactions.forEach(interaction => {
      // This would need to be enhanced to get game genres
      // For now, return empty array
    });
    return [];
  }

  private static getAverageRating(interactions: UserGameInteraction[]): number {
    const ratings = interactions
      .filter(i => i.rating)
      .map(i => i.rating!);
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  }

  private static getPlaytimeStats(interactions: UserGameInteraction[]): any {
    const playtimes = interactions
      .filter(i => i.playtime)
      .map(i => i.playtime!);
    
    return {
      total: playtimes.reduce((a, b) => a + b, 0),
      average: playtimes.length > 0 ? playtimes.reduce((a, b) => a + b, 0) / playtimes.length : 0,
      count: playtimes.length
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
    const input = validateInput(recommendationInputSchema, {
      userId: body.userId || event.queryStringParameters?.userId,
      limit: parseInt(body.limit || event.queryStringParameters?.limit || '20'),
      filters: body.filters,
      strategy: body.strategy || event.queryStringParameters?.strategy,
      includePlayedGames: body.includePlayedGames !== false,
      diversity: parseFloat(body.diversity || event.queryStringParameters?.diversity || '0.3'),
      freshness: parseFloat(body.freshness || event.queryStringParameters?.freshness || '0.2')
    });

    // Validate user authentication
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Valid authentication token required');
    }

    // Execute recommendation generation
    const result = await RecommendationEngine.generateRecommendations(input);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Cache-Control': 'public, max-age=600'
      },
      body: JSON.stringify({
        success: true,
        data: result,
        message: 'Recommendations generated successfully'
      })
    };
  } catch (error) {
    logger.error({
      message: 'Recommendation handler error',
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
}, 'recommendGamesFunction');

// Export for testing
export { 
  RecommendationEngine, 
  NovasanctumAIRecommendationService, 
  CollaborativeFilteringService 
}; 