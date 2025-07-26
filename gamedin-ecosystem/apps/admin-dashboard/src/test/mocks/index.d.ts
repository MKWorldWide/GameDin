declare module './test/mocks/handlers' {
  import { RequestHandler } from 'msw';
  
  export const handlers: RequestHandler[];
  export const mockAnalyticsData: {
    metrics: {
      totalUsers: number;
      activeUsers: number;
      avgSession: string;
      bounceRate: string;
      sessions: number;
      pageViews: number;
      pagesPerSession: number;
      avgSessionDuration: number;
    };
    charts: {
      usersOverTime: {
        labels: string[];
        data: number[];
      };
      trafficSources: {
        labels: string[];
        data: number[];
      };
      userActivity: {
        labels: string[];
        data: number[];
      };
    };
    recentActivity: Array<{
      id: number;
      user: string;
      action: string;
      time: string;
    }>;
    topPages: Array<{
      page: string;
      views: number;
      users: number;
      bounceRate: string;
    }>;
  };
}
