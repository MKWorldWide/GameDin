import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { getAuthToken } from '@/utils/auth';

const api = axios.create({
  baseURL: `${API_BASE_URL}/analytics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface UserStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  userGrowth: number;
  retentionRate: number;
}

export interface EngagementStats {
  avgSessionDuration: string;
  avgSessionsPerUser: number;
  totalSessions: number;
  bounceRate: number;
}

export interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
}

export interface UserSource {
  name: string;
  value: number;
}

export interface DeviceDistribution {
  name: string;
  value: number;
}

export interface GeoDistribution {
  name: string;
  code: string;
  value: number;
}

export interface AnalyticsData {
  userStats: UserStats;
  engagementStats: EngagementStats;
  userActivity: UserActivity[];
  userSources: UserSource[];
  deviceDistribution: DeviceDistribution[];
  geoDistribution: GeoDistribution[];
}

class AnalyticsService {
  async getAnalytics(dateRange: DateRange): Promise<AnalyticsData> {
    try {
      const response = await api.get('', { params: dateRange });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async exportAnalytics(dateRange: DateRange, format: 'csv' | 'json' = 'json') {
    try {
      const response = await api.get('/export', {
        params: { ...dateRange, format },
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  async getRealTimeUpdates(callback: (data: any) => void) {
    // In a real app, this would use WebSockets
    const eventSource = new EventSource(`${API_BASE_URL}/analytics/updates`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  }
}

export const analyticsService = new AnalyticsService();
