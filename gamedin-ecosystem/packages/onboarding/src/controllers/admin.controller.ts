import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { adminService } from '../services/admin.service';

// Validation schemas
const getStatsSchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d', 'all']).default('30d'),
});

const getOnboardingMetricsSchema = z.object({
  timeRange: z.enum(['24h', '7d', '30d']).default('30d'),
});

const getActivityLogsSchema = z.object({
  limit: z.preprocess(
    val => parseInt(String(val), 10),
    z.number().int().min(1).max(1000).default(50)
  ),
});

/**
 * Get user statistics
 */
export const getUserStats = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof getStatsSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { timeRange } = getStatsSchema.parse(request.query);
    const stats = await adminService.getUserStats(timeRange);
    
    // Log the action
    await adminService.logAction(
      request.user?.id || 'system',
      'viewed_user_stats',
      { timeRange },
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      }
    );
    
    return { success: true, ...stats };
  } catch (error) {
    request.log.error('Error getting user stats:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve user statistics',
    });
  }
};

/**
 * Get onboarding metrics
 */
export const getOnboardingMetrics = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof getOnboardingMetricsSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { timeRange } = getOnboardingMetricsSchema.parse(request.query);
    const metrics = await adminService.getOnboardingMetrics(timeRange);
    
    // Log the action
    await adminService.logAction(
      request.user?.id || 'system',
      'viewed_onboarding_metrics',
      { timeRange },
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      }
    );
    
    return { success: true, ...metrics };
  } catch (error) {
    request.log.error('Error getting onboarding metrics:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve onboarding metrics',
    });
  }
};

/**
 * Get system health status
 */
export const getSystemHealth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const health = await adminService.getSystemHealth();
    
    // Log the action
    await adminService.logAction(
      request.user?.id || 'system',
      'viewed_system_health',
      {},
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      }
    );
    
    return { success: true, ...health };
  } catch (error) {
    request.log.error('Error getting system health:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve system health status',
    });
  }
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (
  request: FastifyRequest<{ Querystring: z.infer<typeof getActivityLogsSchema> }>,
  reply: FastifyReply
) => {
  try {
    const { limit } = getActivityLogsSchema.parse(request.query);
    const logs = await adminService.getActivityLogs(limit);
    
    // Log the action
    await adminService.logAction(
      request.user?.id || 'system',
      'viewed_activity_logs',
      { limit },
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      }
    );
    
    return { success: true, logs };
  } catch (error) {
    request.log.error('Error getting activity logs:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve activity logs',
    });
  }
};

/**
 * Get dashboard overview (combined stats)
 */
export const getDashboardOverview = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    // Get all data in parallel
    const [userStats, onboardingMetrics, systemHealth] = await Promise.all([
      adminService.getUserStats('30d'),
      adminService.getOnboardingMetrics('30d'),
      adminService.getSystemHealth(),
    ]);
    
    // Get recent activity logs
    const activityLogs = await adminService.getActivityLogs(10);
    
    // Log the action
    await adminService.logAction(
      request.user?.id || 'system',
      'viewed_dashboard_overview',
      {},
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'] || '',
      }
    );
    
    return {
      success: true,
      userStats,
      onboardingMetrics,
      systemHealth,
      recentActivity: activityLogs,
    };
  } catch (error) {
    request.log.error('Error getting dashboard overview:', error);
    return reply.status(500).send({
      success: false,
      error: 'Failed to retrieve dashboard overview',
    });
  }
};
