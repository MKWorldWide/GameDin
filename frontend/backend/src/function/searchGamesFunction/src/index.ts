/**
 * GameDin Search Games Function v5.0.0
 * 
 * Enhanced search functionality with:
 * - AWS SDK v3 integration
 * - Advanced search algorithms with fuzzy matching
 * - Novasanctum AI-powered content analysis and recommendations
 * - Redis caching for performance optimization
 * - Comprehensive error handling and logging
 * - Rate limiting and security measures
 * - Multi-language support and internationalization
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
  NotFoundError
} from '@/utils/shared';
import { z } from 'zod';

// Enhanced search input validation schema
const searchInputSchema = z.object({
  searchTerm: z.string().min(1, 'Search term is required').max(200, 'Search term too long'),
  filters: z.object({
    genre: z.array(z.string()).optional(),
    platform: z.array(z.string()).optional(),
    rating: z.object({
      min: z.number().min(0).max(10).optional(),
      max: z.number().min(0).max(10).optional()
    }).optional(),
    releaseDate: z.object({
      start: z.string().datetime().optional(),
      end: z.string().datetime().optional()
    }).optional(),
    developer: z.string().optional(),
    publisher: z.string().optional()
  }).optional(),
  pagination: commonSchemas.pagination.optional(),
  sortBy: z.enum(['title', 'rating', 'releaseDate', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeAIRecommendations: z.boolean().default(true)
});

type SearchInput = z.infer<typeof searchInputSchema>;

// Game interface with enhanced properties
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
  createdAt: string;
  updatedAt: string;
}

// Enhanced search result interface
interface SearchResult {
  games: Game[];
  totalCount: number;
  hasMore: boolean;
  searchMetadata: {
    searchTerm: string;
    filters: any;
    executionTime: number;
    aiEnhanced: boolean;
    cacheHit: boolean;
  };
  aiRecommendations?: {
    relatedGames: string[];
    trendingGames: string[];
    personalizedSuggestions: string[];
  };
}

// Fuzzy search implementation with Levenshtein distance
class FuzzySearch {
  private static calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static search(searchTerm: string, games: Game[]): Game[] {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    const searchWords = normalizedSearchTerm.split(/\s+/);
    
    return games
      .map(game => {
        const titleWords = game.title.toLowerCase().split(/\s+/);
        const descriptionWords = game.description.toLowerCase().split(/\s+/);
        const genreWords = game.genre.map(g => g.toLowerCase());
        const tagWords = game.tags?.map(t => t.toLowerCase()) || [];
        
        let score = 0;
        let exactMatches = 0;
        
        // Calculate relevance score
        for (const searchWord of searchWords) {
          // Exact title match (highest priority)
          if (titleWords.some(word => word === searchWord)) {
            score += 100;
            exactMatches++;
          }
          // Partial title match
          else if (titleWords.some(word => word.includes(searchWord) || searchWord.includes(word))) {
            score += 50;
          }
          // Genre match
          else if (genreWords.some(word => word === searchWord)) {
            score += 30;
          }
          // Tag match
          else if (tagWords.some(word => word === searchWord)) {
            score += 25;
          }
          // Description match
          else if (descriptionWords.some(word => word.includes(searchWord))) {
            score += 10;
          }
          // Fuzzy match for typos
          else {
            const minDistance = Math.min(
              ...titleWords.map(word => this.calculateLevenshteinDistance(searchWord, word))
            );
            if (minDistance <= 2) {
              score += Math.max(0, 20 - minDistance * 5);
            }
          }
        }
        
        // Bonus for exact phrase match
        if (game.title.toLowerCase().includes(normalizedSearchTerm)) {
          score += 50;
        }
        
        // Bonus for AI score and popularity
        if (game.aiScore) score += game.aiScore * 0.1;
        if (game.popularity) score += game.popularity * 0.05;
        
        return { ...game, relevanceScore: score, exactMatches };
      })
      .filter(game => game.relevanceScore > 0)
      .sort((a, b) => {
        // Sort by exact matches first, then by relevance score
        if (a.exactMatches !== b.exactMatches) {
          return b.exactMatches - a.exactMatches;
        }
        return b.relevanceScore - a.relevanceScore;
      })
      .map(({ relevanceScore, exactMatches, ...game }) => game);
  }
}

// Novasanctum AI integration for enhanced search
class NovasanctumAIService {
  private static readonly AI_ENDPOINT = process.env.NOVASANCTUM_AI_ENDPOINT;
  private static readonly AI_API_KEY = process.env.NOVASANCTUM_AI_API_KEY;

  static async enhanceSearchResults(
    searchTerm: string, 
    games: Game[], 
    userId?: string
  ): Promise<{
    enhancedGames: Game[];
    recommendations: {
      relatedGames: string[];
      trendingGames: string[];
      personalizedSuggestions: string[];
    };
  }> {
    try {
      if (!this.AI_ENDPOINT || !this.AI_API_KEY) {
        logger.warn('Novasanctum AI not configured, skipping AI enhancement');
        return {
          enhancedGames: games,
          recommendations: {
            relatedGames: [],
            trendingGames: [],
            personalizedSuggestions: []
          }
        };
      }

      // Prepare data for AI analysis
      const gameData = games.map(game => ({
        id: game.id,
        title: game.title,
        description: game.description,
        genre: game.genre,
        tags: game.tags || [],
        rating: game.rating || 0,
        reviewCount: game.reviewCount || 0
      }));

      // Call Novasanctum AI for content analysis and recommendations
      const aiResponse = await fetch(`${this.AI_ENDPOINT}/analyze-games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.AI_API_KEY}`,
          'X-User-ID': userId || 'anonymous'
        },
        body: JSON.stringify({
          searchTerm,
          games: gameData,
          userContext: userId ? { userId } : undefined
        })
      });

      if (!aiResponse.ok) {
        throw new Error(`AI service error: ${aiResponse.statusText}`);
      }

      const aiResult = await aiResponse.json();

      // Enhance games with AI insights
      const enhancedGames = games.map(game => {
        const aiInsights = aiResult.gameInsights?.find((g: any) => g.id === game.id);
        return {
          ...game,
          aiScore: aiInsights?.relevanceScore || game.aiScore || 0,
          aiTags: aiInsights?.suggestedTags || [],
          aiDescription: aiInsights?.enhancedDescription || game.description
        };
      });

      // Sort by AI score if available
      enhancedGames.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

      return {
        enhancedGames,
        recommendations: {
          relatedGames: aiResult.recommendations?.relatedGames || [],
          trendingGames: aiResult.recommendations?.trendingGames || [],
          personalizedSuggestions: aiResult.recommendations?.personalizedSuggestions || []
        }
      };
    } catch (error) {
      logger.error({
        message: 'Failed to enhance search results with AI',
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Return original results if AI enhancement fails
      return {
        enhancedGames: games,
        recommendations: {
          relatedGames: [],
          trendingGames: [],
          personalizedSuggestions: []
        }
      };
    }
  }
}

// Main search function with enhanced capabilities
const searchGames = async (input: SearchInput, userId?: string): Promise<SearchResult> => {
  const startTime = Date.now();
  
  try {
    // Generate cache key
    const cacheKey = `search:${JSON.stringify(input)}:${userId || 'anonymous'}`;
    
    // Try to get from cache first
    const cachedResult = await cacheManager.get<SearchResult>(cacheKey);
    if (cachedResult) {
      logger.info({
        message: 'Search result retrieved from cache',
        searchTerm: input.searchTerm,
        cacheHit: true
      });
      
      await logMetric('SearchCacheHit', 1);
      return {
        ...cachedResult,
        searchMetadata: {
          ...cachedResult.searchMetadata,
          cacheHit: true,
          executionTime: Date.now() - startTime
        }
      };
    }

    // Build DynamoDB query parameters
    const queryParams: any = {
      TableName: process.env.GAMES_TABLE_NAME || 'GameDin-Games',
      FilterExpression: [],
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {}
    };

    // Add search term filter
    const searchWords = input.searchTerm.toLowerCase().split(/\s+/);
    const searchConditions = searchWords.map((word, index) => {
      const titleKey = `#title${index}`;
      const descKey = `#desc${index}`;
      const genreKey = `#genre${index}`;
      const wordValue = `:word${index}`;
      
      queryParams.ExpressionAttributeNames[titleKey] = 'title';
      queryParams.ExpressionAttributeNames[descKey] = 'description';
      queryParams.ExpressionAttributeNames[genreKey] = 'genre';
      queryParams.ExpressionAttributeValues[wordValue] = word;
      
      return `(contains(${titleKey}, ${wordValue}) OR contains(${descKey}, ${wordValue}) OR contains(${genreKey}, ${wordValue}))`;
    });

    if (searchConditions.length > 0) {
      queryParams.FilterExpression.push(`(${searchConditions.join(' AND ')})`);
    }

    // Add additional filters
    if (input.filters) {
      if (input.filters.genre?.length) {
        queryParams.FilterExpression.push('genre IN (:genres)');
        queryParams.ExpressionAttributeValues[':genres'] = input.filters.genre;
      }
      
      if (input.filters.platform?.length) {
        queryParams.FilterExpression.push('platform IN (:platforms)');
        queryParams.ExpressionAttributeValues[':platforms'] = input.filters.platform;
      }
      
      if (input.filters.rating?.min !== undefined) {
        queryParams.FilterExpression.push('rating >= :minRating');
        queryParams.ExpressionAttributeValues[':minRating'] = input.filters.rating.min;
      }
      
      if (input.filters.rating?.max !== undefined) {
        queryParams.FilterExpression.push('rating <= :maxRating');
        queryParams.ExpressionAttributeValues[':maxRating'] = input.filters.rating.max;
      }
      
      if (input.filters.developer) {
        queryParams.FilterExpression.push('developer = :developer');
        queryParams.ExpressionAttributeValues[':developer'] = input.filters.developer;
      }
      
      if (input.filters.publisher) {
        queryParams.FilterExpression.push('publisher = :publisher');
        queryParams.ExpressionAttributeValues[':publisher'] = input.filters.publisher;
      }
    }

    // Combine filter expressions
    if (queryParams.FilterExpression.length > 0) {
      queryParams.FilterExpression = queryParams.FilterExpression.join(' AND ');
    } else {
      delete queryParams.FilterExpression;
    }

    // Execute DynamoDB scan with filters
    const result = await dynamoOperations.scan(queryParams);
    let games = (result.Items || []) as Game[];

    // Apply fuzzy search for better results
    games = FuzzySearch.search(input.searchTerm, games);

    // Apply sorting
    const sortBy = input.sortBy || 'relevance';
    const sortOrder = input.sortOrder || 'desc';
    
    games.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'releaseDate':
          comparison = new Date(a.releaseDate || '').getTime() - new Date(b.releaseDate || '').getTime();
          break;
        case 'relevance':
        default:
          // Already sorted by relevance from FuzzySearch
          return 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const pagination = input.pagination || { limit: 20, offset: 0 };
    const totalCount = games.length;
    const paginatedGames = games.slice(pagination.offset, pagination.offset + pagination.limit);

    // Enhance with AI if requested
    let enhancedGames = paginatedGames;
    let aiRecommendations = {
      relatedGames: [],
      trendingGames: [],
      personalizedSuggestions: []
    };

    if (input.includeAIRecommendations) {
      const aiResult = await NovasanctumAIService.enhanceSearchResults(
        input.searchTerm,
        paginatedGames,
        userId
      );
      enhancedGames = aiResult.enhancedGames;
      aiRecommendations = aiResult.recommendations;
    }

    const executionTime = Date.now() - startTime;

    // Create result object
    const searchResult: SearchResult = {
      games: enhancedGames,
      totalCount,
      hasMore: pagination.offset + pagination.limit < totalCount,
      searchMetadata: {
        searchTerm: input.searchTerm,
        filters: input.filters,
        executionTime,
        aiEnhanced: input.includeAIRecommendations,
        cacheHit: false
      },
      aiRecommendations
    };

    // Cache the result for 5 minutes
    await cacheManager.set(cacheKey, searchResult, 300);

    // Log metrics
    await logMetric('SearchExecutionTime', executionTime);
    await logMetric('SearchResultCount', totalCount);
    await logMetric('SearchCacheMiss', 1);

    logger.info({
      message: 'Search completed successfully',
      searchTerm: input.searchTerm,
      resultCount: totalCount,
      executionTime,
      aiEnhanced: input.includeAIRecommendations
    });

    return searchResult;
  } catch (error) {
    logger.error({
      message: 'Search failed',
      searchTerm: input.searchTerm,
      error: error instanceof Error ? error.message : String(error)
    });
    
    await logMetric('SearchErrorCount', 1);
    throw error;
  }
};

// Lambda handler with enhanced error handling
export const handler = errorHandler(async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse and validate input
    const body = event.body ? JSON.parse(event.body) : {};
    const input = validateInput(searchInputSchema, {
      searchTerm: body.searchTerm || event.queryStringParameters?.searchTerm,
      filters: body.filters,
      pagination: body.pagination || {
        limit: parseInt(event.queryStringParameters?.limit || '20'),
        offset: parseInt(event.queryStringParameters?.offset || '0')
      },
      sortBy: body.sortBy || event.queryStringParameters?.sortBy,
      sortOrder: body.sortOrder || event.queryStringParameters?.sortOrder,
      includeAIRecommendations: body.includeAIRecommendations !== false
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
          message: 'Invalid JWT token in search request',
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Execute search
    const result = await searchGames(input, userId);

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
        message: 'Search completed successfully'
      })
    };
  } catch (error) {
    logger.error({
      message: 'Search handler error',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    const statusCode = error instanceof ValidationError ? 400 :
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
}, 'searchGamesFunction');

// Export for testing
export { searchGames, FuzzySearch, NovasanctumAIService }; 