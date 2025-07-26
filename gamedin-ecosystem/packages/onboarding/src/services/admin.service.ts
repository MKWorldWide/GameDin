import { redisService } from '@gamedin/shared/services/redis.service';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  usersByRole: Record<string, number>;
  usersByStatus: {
    active: number;
    suspended: number;
    unverified: number;
  };
}

export interface OnboardingMetrics {
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  avgTimeToComplete: number; // in seconds
  steps: Array<{
    step: string;
    started: number;
    completed: number;
    dropOffRate: number;
    avgTime: number; // in seconds
  }>;
  byDay: Array<{
    date: string;
    started: number;
    completed: number;
  }>;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    responseTime: number; // in ms
    error?: string;
  }>;
  metrics: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    uptime: number; // in seconds
  };
  lastChecked: string;
}

/**
 * Service class for admin operations
 */
export class AdminService {
  private static instance: AdminService;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }
  
  /**
   * Get user statistics
   */
  public async getUserStats(timeRange: '24h' | '7d' | '30d' | 'all' = '30d'): Promise<UserStats> {
    try {
      // In a real app, you'd query your database for these metrics
      // This is a simplified example using Redis
      
      const now = new Date();
      const timeAgo = new Date();
      
      switch (timeRange) {
        case '24h':
          timeAgo.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeAgo.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeAgo.setDate(now.getDate() - 30);
          break;
        // 'all' uses default date (epoch start)
      }
      
      // Get all user IDs
      const userIds = await redisService.sMembers('users:all');
      
      // Get user data in batches to avoid blocking
      const batchSize = 100;
      const batches = [];
      
      for (let i = 0; i < userIds.length; i += batchSize) {
        const batch = userIds.slice(i, i + batchSize);
        batches.push(batch);
      }
      
      const users = [];
      
      for (const batch of batches) {
        const pipeline = redisService.getClient().multi();
        
        for (const userId of batch) {
          pipeline.hGetAll(`user:${userId}`);
        }
        
        const results = await pipeline.exec();
        users.push(...results);
      }
      
      // Calculate stats
      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: 0,
        newUsers: 0,
        usersByRole: {},
        usersByStatus: {
          active: 0,
          suspended: 0,
          unverified: 0,
        },
      };
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      
      for (const user of users) {
        const roles = JSON.parse(user.roles || '[]');
        const isActive = user.lastLoginAt && new Date(user.lastLoginAt) >= thirtyDaysAgo;
        const isNew = user.createdAt && new Date(user.createdAt) >= thirtyDaysAgo;
        
        // Count by status
        if (user.isSuspended === 'true') {
          stats.usersByStatus.suspended++;
        } else if (user.isEmailVerified === 'true') {
          stats.usersByStatus.active++;
          
          if (isActive) {
            stats.activeUsers++;
          }
        } else {
          stats.usersByStatus.unverified++;
        }
        
        // Count by role
        for (const role of roles) {
          stats.usersByRole[role] = (stats.usersByRole[role] || 0) + 1;
        }
        
        // Count new users
        if (isNew) {
          stats.newUsers++;
        }
      }
      
      return stats;
      
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw new Error('Failed to retrieve user statistics');
    }
  }
  
  /**
   * Get onboarding metrics
   */
  public async getOnboardingMetrics(timeRange: '24h' | '7d' | '30d' = '30d'): Promise<OnboardingMetrics> {
    try {
      // In a real app, you'd query your analytics database for these metrics
      // This is a simplified example
      
      const now = new Date();
      const timeAgo = new Date();
      
      switch (timeRange) {
        case '24h':
          timeAgo.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeAgo.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeAgo.setDate(now.getDate() - 30);
          break;
      }
      
      // Get onboarding events from Redis
      // In a real app, you'd use a proper analytics database
      const events = await redisService.lRange('analytics:onboarding', 0, -1);
      
      const filteredEvents = events
        .map(event => JSON.parse(event))
        .filter(event => new Date(event.timestamp) >= timeAgo);
      
      // Group events by session
      const sessions: Record<string, any[]> = {};
      
      for (const event of filteredEvents) {
        if (!sessions[event.sessionId]) {
          sessions[event.sessionId] = [];
        }
        sessions[event.sessionId].push(event);
      }
      
      // Calculate metrics
      const metrics: OnboardingMetrics = {
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
        avgTimeToComplete: 0,
        steps: [
          { step: 'welcome', started: 0, completed: 0, dropOffRate: 0, avgTime: 0 },
          { step: 'profile', started: 0, completed: 0, dropOffRate: 0, avgTime: 0 },
          { step: 'preferences', started: 0, completed: 0, dropOffRate: 0, avgTime: 0 },
          { step: 'verification', started: 0, completed: 0, dropOffRate: 0, avgTime: 0 },
          { step: 'complete', started: 0, completed: 0, dropOffRate: 0, avgTime: 0 },
        ],
        byDay: [],
      };
      
      // Process each session
      const completedSessions = [];
      
      for (const sessionId in sessions) {
        const sessionEvents = sessions[sessionId];
        const startEvent = sessionEvents.find(e => e.event === 'onboarding_started');
        const completeEvent = sessionEvents.find(e => e.event === 'onboarding_completed');
        
        if (startEvent) {
          metrics.totalStarted++;
          
          // Track step progress
          const stepEvents = sessionEvents.filter(e => e.event === 'step_completed');
          
          for (const step of metrics.steps) {
            const stepEvent = stepEvents.find((e: any) => e.step === step.step);
            
            if (stepEvent) {
              step.completed++;
              
              // Calculate time spent on step if we have timing info
              if (stepEvent.duration) {
                step.avgTime = ((step.avgTime * (step.completed - 1)) + stepEvent.duration) / step.completed;
              }
            }
            
            // If any step was started, all previous steps were started
            if (stepEvent || step.completed > 0) {
              step.started = metrics.totalStarted;
            }
          }
          
          // Track completion
          if (completeEvent) {
            metrics.totalCompleted++;
            completedSessions.push({
              startTime: new Date(startEvent.timestamp),
              endTime: new Date(completeEvent.timestamp),
              duration: (new Date(completeEvent.timestamp).getTime() - new Date(startEvent.timestamp).getTime()) / 1000, // in seconds
            });
          }
        }
      }
      
      // Calculate drop-off rates
      for (let i = 0; i < metrics.steps.length; i++) {
        const step = metrics.steps[i];
        const nextStep = metrics.steps[i + 1];
        
        if (nextStep) {
          step.dropOffRate = ((step.started - nextStep.started) / step.started) * 100;
        } else if (step.step === 'complete') {
          step.dropOffRate = 0; // No drop-off after completion
        } else {
          step.dropOffRate = 0; // Shouldn't happen with proper data
        }
      }
      
      // Calculate average time to complete
      if (completedSessions.length > 0) {
        metrics.avgTimeToComplete = completedSessions.reduce((sum, session) => sum + session.duration, 0) / completedSessions.length;
      }
      
      // Calculate completion rate
      if (metrics.totalStarted > 0) {
        metrics.completionRate = (metrics.totalCompleted / metrics.totalStarted) * 100;
      }
      
      // Group by day for time series data
      const days = new Set<string>();
      const byDayMap = new Map<string, { started: number; completed: number }>();
      
      for (const event of filteredEvents) {
        const date = new Date(event.timestamp);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!byDayMap.has(dateStr)) {
          byDayMap.set(dateStr, { started: 0, completed: 0 });
          days.add(dateStr);
        }
        
        const dayData = byDayMap.get(dateStr)!;
        
        if (event.event === 'onboarding_started') {
          dayData.started++;
        } else if (event.event === 'onboarding_completed') {
          dayData.completed++;
        }
      }
      
      // Convert map to array and sort by date
      metrics.byDay = Array.from(days)
        .sort()
        .map(date => ({
          date,
          started: byDayMap.get(date)?.started || 0,
          completed: byDayMap.get(date)?.completed || 0,
        }));
      
      return metrics;
      
    } catch (error) {
      logger.error('Error getting onboarding metrics:', error);
      throw new Error('Failed to retrieve onboarding metrics');
    }
  }
  
  /**
   * Get system health status
   */
  public async getSystemHealth(): Promise<SystemHealth> {
    try {
      const health: SystemHealth = {
        status: 'healthy',
        services: [],
        metrics: {
          cpu: 0,
          memory: 0,
          disk: 0,
          uptime: process.uptime(),
        },
        lastChecked: new Date().toISOString(),
      };
      
      // Check Redis connection
      try {
        const start = Date.now();
        await redisService.ping();
        const responseTime = Date.now() - start;
        
        health.services.push({
          name: 'Redis',
          status: 'up',
          responseTime,
        });
      } catch (error) {
        health.status = 'degraded';
        health.services.push({
          name: 'Redis',
          status: 'down',
          responseTime: -1,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // In a real app, you'd check other services like:
      // - Database
      // - External APIs
      // - Cache
      // - Storage
      // - Message queues
      
      // Simulate some metrics (in a real app, use os module or a monitoring service)
      health.metrics = {
        cpu: Math.min(100, Math.floor(Math.random() * 60) + 10), // 10-70%
        memory: Math.min(100, Math.floor(Math.random() * 50) + 20), // 20-70%
        disk: Math.min(100, Math.floor(Math.random() * 40) + 10), // 10-50%
        uptime: process.uptime(),
      };
      
      // If any critical service is down, mark as unhealthy
      const criticalServices = health.services.filter(s => 
        ['Redis', 'Database'].includes(s.name)
      );
      
      if (criticalServices.some(s => s.status !== 'up')) {
        health.status = 'unhealthy';
      }
      
      return health;
      
    } catch (error) {
      logger.error('Error getting system health:', error);
      throw new Error('Failed to retrieve system health');
    }
  }
  
  /**
   * Get recent activity logs
   */
  public async getActivityLogs(limit: number = 50): Promise<Array<{
    id: string;
    timestamp: string;
    action: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    metadata: Record<string, any>;
  }>> {
    try {
      // In a real app, you'd query your logs database
      // This is a simplified example using Redis
      
      const logs = await redisService.lRange('admin:activity_logs', 0, limit - 1);
      
      return logs.map(log => JSON.parse(log));
      
    } catch (error) {
      logger.error('Error getting activity logs:', error);
      throw new Error('Failed to retrieve activity logs');
    }
  }
  
  /**
   * Log an admin action
   */
  public async logAction(
    userId: string,
    action: string,
    metadata: Record<string, any> = {},
    request?: {
      ip: string;
      userAgent: string;
    }
  ): Promise<void> {
    try {
      const logEntry = {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        action,
        userId,
        ipAddress: request?.ip || 'unknown',
        userAgent: request?.userAgent || 'unknown',
        metadata,
      };
      
      // Add to Redis list (trim to keep last 10,000 entries)
      await redisService.lPush('admin:activity_logs', JSON.stringify(logEntry));
      await redisService.lTrim('admin:activity_logs', 0, 9999);
      
    } catch (error) {
      logger.error('Error logging admin action:', error);
      // Don't throw, as this shouldn't fail the main operation
    }
  }
}

// Export a singleton instance
export const adminService = AdminService.getInstance();
