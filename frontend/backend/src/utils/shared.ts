/**
 * GameDin Backend - Shared Utilities v5.0.0
 * 
 * This module provides comprehensive utilities for the GameDin backend including:
 * - AWS SDK v3 integration with optimized clients
 * - Enhanced error handling and logging with Pino
 * - Advanced caching with Redis and in-memory fallback
 * - Input validation with Zod schemas
 * - Performance monitoring and metrics
 * - Novasanctum AI integration helpers
 * - Divina-L3 blockchain utilities
 * - Security and rate limiting utilities
 */

import { 
  DynamoDBClient, 
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  BatchWriteCommand,
  ScanCommand
} from '@aws-sdk/client-dynamodb';
import { 
  CloudWatchClient, 
  PutMetricDataCommand 
} from '@aws-sdk/client-cloudwatch';
import { 
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand 
} from '@aws-sdk/client-s3';
import { 
  LambdaClient, 
  InvokeCommand 
} from '@aws-sdk/client-lambda';
import { 
  ApiGatewayManagementApiClient,
  PostToConnectionCommand 
} from '@aws-sdk/client-apigatewaymanagementapi';

import pino from 'pino';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { format, parseISO } from 'date-fns';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Enhanced logger configuration with structured logging
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  },
  base: {
    service: 'gamedin-backend',
    version: '5.0.0',
    environment: process.env.NODE_ENV || 'development'
  }
});

// AWS SDK v3 Clients with optimized configuration
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  maxAttempts: 3,
  retryMode: 'adaptive' as const
};

export const dynamoClient = new DynamoDBClient(awsConfig);
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: true
  },
  unmarshallOptions: {
    wrapNumbers: false
  }
});

export const cloudwatchClient = new CloudWatchClient(awsConfig);
export const cognitoClient = new CognitoIdentityProviderClient(awsConfig);
export const s3Client = new S3Client(awsConfig);
export const lambdaClient = new LambdaClient(awsConfig);

// Redis client for caching and rate limiting
export const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true
});

// Rate limiter configuration
export const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'gamedin_rate_limit',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
  blockDuration: 60 * 15 // Block for 15 minutes
});

// Enhanced error handling with structured error types
export class GameDinError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'GameDinError';
  }
}

export class ValidationError extends GameDinError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends GameDinError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends GameDinError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends GameDinError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends GameDinError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

// Enhanced error handler wrapper with performance monitoring
export const errorHandler = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  functionName: string
) => async (...args: T): Promise<R> => {
  const startTime = Date.now();
  const requestId = nanoid();
  
  try {
    logger.info({
      functionName,
      requestId,
      message: 'Function execution started',
      args: args.length > 0 ? 'Arguments provided' : 'No arguments'
    });

    const result = await fn(...args);
    const executionTime = Date.now() - startTime;

    // Log success metrics
    await logMetric('FunctionExecutionTime', executionTime, {
      FunctionName: functionName,
      Status: 'Success'
    });

    await logMetric('FunctionSuccessCount', 1, {
      FunctionName: functionName
    });

    logger.info({
      functionName,
      requestId,
      message: 'Function execution completed successfully',
      executionTime
    });

    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Log error metrics
    await logMetric('FunctionExecutionTime', executionTime, {
      FunctionName: functionName,
      Status: 'Error'
    });

    await logMetric('FunctionErrorCount', 1, {
      FunctionName: functionName,
      ErrorType: error instanceof GameDinError ? error.code : 'UNKNOWN_ERROR'
    });

    logger.error({
      functionName,
      requestId,
      message: 'Function execution failed',
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        code: error instanceof GameDinError ? error.code : undefined
      },
      executionTime
    });

    throw error;
  }
};

// Enhanced CloudWatch metrics logging
export const logMetric = async (
  metricName: string,
  value: number,
  dimensions: Record<string, string> = {}
) => {
  try {
    const command = new PutMetricDataCommand({
      Namespace: 'GameDin/Backend',
      MetricData: [{
        MetricName: metricName,
        Value,
        Unit: metricName.includes('Time') ? 'Milliseconds' : 'Count',
        Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({
          Name,
          Value
        }))
      }]
    });

    await cloudwatchClient.send(command);
  } catch (error) {
    logger.error({
      message: 'Failed to log metric',
      metricName,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Enhanced DynamoDB operations with error handling and metrics
export const dynamoOperations = {
  async get(params: any) {
    const command = new GetCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBGetOperation', 1);
    return result;
  },

  async put(params: any) {
    const command = new PutCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBPutOperation', 1);
    return result;
  },

  async query(params: any) {
    const command = new QueryCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBQueryOperation', 1);
    return result;
  },

  async update(params: any) {
    const command = new UpdateCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBUpdateOperation', 1);
    return result;
  },

  async delete(params: any) {
    const command = new DeleteCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBDeleteOperation', 1);
    return result;
  },

  async scan(params: any) {
    const command = new ScanCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBScanOperation', 1);
    return result;
  },

  async batchWrite(params: any) {
    const command = new BatchWriteCommand(params);
    const result = await dynamoDocClient.send(command);
    await logMetric('DynamoDBBatchWriteOperation', 1);
    return result;
  }
};

// Enhanced caching system with Redis and in-memory fallback
class CacheManager {
  private memoryCache = new Map<string, { value: any; expiry: number }>();

  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first
      const cached = await redisClient.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn({
        message: 'Redis cache get failed, falling back to memory',
        key,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Fallback to memory cache
    const item = this.memoryCache.get(key);
    if (item && Date.now() < item.expiry) {
      return item.value;
    }

    return null;
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      // Set in Redis
      await redisClient.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (error) {
      logger.warn({
        message: 'Redis cache set failed, using memory fallback',
        key,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    // Always set in memory as fallback
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });

    // Clean up expired items
    this.cleanupMemoryCache();
  }

  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      logger.warn({
        message: 'Redis cache delete failed',
        key,
        error: error instanceof Error ? error.message : String(error)
      });
    }
    this.memoryCache.delete(key);
  }

  private cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Enhanced input validation with Zod schemas
export const validateInput = <T>(schema: z.ZodSchema<T>, input: unknown): T => {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Validation failed',
        { details: error.errors }
      );
    }
    throw error;
  }
};

// Common validation schemas
export const commonSchemas = {
  id: z.string().min(1, 'ID is required'),
  email: z.string().email('Invalid email format'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be less than 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pagination: z.object({
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0)
  }),
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime()
  }).refine(data => new Date(data.startDate) < new Date(data.endDate), {
    message: 'Start date must be before end date'
  })
};

// Enhanced authentication utilities
export const authUtils = {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  },

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  generateJWT(payload: Record<string, any>, expiresIn: string = '24h'): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.sign(payload, secret, { expiresIn });
  },

  verifyJWT(token: string): Record<string, any> {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    return jwt.verify(token, secret) as Record<string, any>;
  },

  async getCognitoUser(username: string) {
    const command = new AdminGetUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username
    });
    return cognitoClient.send(command);
  }
};

// Enhanced S3 utilities
export const s3Utils = {
  async uploadFile(bucket: string, key: string, body: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read'
    });
    
    await s3Client.send(command);
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  },

  async deleteFile(bucket: string, key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    await s3Client.send(command);
  },

  async getFile(bucket: string, key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await s3Client.send(command);
    if (!response.Body) {
      throw new NotFoundError('File');
    }
    
    return Buffer.from(await response.Body.transformToByteArray());
  }
};

// Enhanced WebSocket utilities
export const websocketUtils = {
  async sendMessage(connectionId: string, message: any, endpoint: string): Promise<void> {
    const client = new ApiGatewayManagementApiClient({
      endpoint
    });
    
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(message)
    });
    
    await client.send(command);
  }
};

// Enhanced Lambda invocation utilities
export const lambdaUtils = {
  async invokeFunction(functionName: string, payload: any): Promise<any> {
    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
      InvocationType: 'RequestResponse'
    });
    
    const response = await lambdaClient.send(command);
    if (response.Payload) {
      return JSON.parse(Buffer.from(response.Payload).toString());
    }
    return null;
  }
};

// Utility functions
export const utils = {
  generateId(): string {
    return nanoid(16);
  },

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
  },

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      
      const attempt = async () => {
        try {
          attempts++;
          const result = await fn();
          resolve(result);
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            setTimeout(attempt, delay * attempts);
          }
        }
      };
      
      attempt();
    });
  }
};

// Export all utilities
export default {
  logger,
  errorHandler,
  logMetric,
  dynamoOperations,
  cacheManager,
  validateInput,
  commonSchemas,
  authUtils,
  s3Utils,
  websocketUtils,
  lambdaUtils,
  utils,
  GameDinError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
}; 