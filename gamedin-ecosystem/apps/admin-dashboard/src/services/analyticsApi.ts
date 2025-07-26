import { apiService } from './api';
import { DateRange } from '@/components/analytics/AnalyticsDashboard';

// Types
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  usersByRole: Record<string, number>;
  usersByStatus: Record<string, number>;
}

export interface OnboardingMetrics {
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  avgTimeToComplete: number; // in minutes
  steps: Array<{
    step: string;
    started: number;
    completed: number;
    dropOffRate: number;
    avgTime: number; // in minutes
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
    status: 'up' | 'degraded' | 'down';
    responseTime: number; // in ms
  }>;
  metrics: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    uptime: number; // in seconds
  };
  lastChecked: string; // ISO date string
}

export interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string; // ISO date string
  avatar?: string;
  metadata?: Record<string, any>;
}

const analyticsApi = {
  // User Statistics
  async getUserStats(range: string = '30d'): Promise<UserStats> {
    return apiService.get(`/analytics/users?range=${range}`);
  },

  // Onboarding Metrics
  async getOnboardingMetrics(range: string = '30d'): Promise<OnboardingMetrics> {
    return apiService.get(`/analytics/onboarding?range=${range}`);
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    return apiService.get('/analytics/system-health');
  },

  // Recent Activity
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    return apiService.get(`/analytics/activity?limit=${limit}`);
  },

  // Custom Date Range
  async getCustomDateRangeAnalytics(dateRange: DateRange) {
    return apiService.get(
      `/analytics/custom?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
    );
  },

  // Export Data
  async exportData(format: 'csv' | 'json' = 'json', dateRange?: DateRange) {
    const params = new URLSearchParams({ format });
    
    if (dateRange) {
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
    }
    
    return apiService.get(`/analytics/export?${params.toString()}`, {
      responseType: 'blob',
    });
  },

  // Real-time Updates
  subscribeToUpdates(callback: (data: any) => void) {
    // In a real app, this would use WebSockets or Server-Sent Events
    const eventSource = new EventSource('/analytics/updates');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  },
};

export default analyticsApi;
