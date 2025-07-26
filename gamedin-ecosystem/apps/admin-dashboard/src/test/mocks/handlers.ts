import { http, HttpResponse } from 'msw';

// Mock data for the API responses
export const mockAnalyticsData = {
  metrics: {
    totalUsers: 1245,
    activeUsers: 845,
    avgSession: '2m 45s',
    bounceRate: '23%',
    sessions: 1245,
    pageViews: 8450,
    pagesPerSession: 6.8,
    avgSessionDuration: 165, // in seconds
  },
  charts: {
    usersOverTime: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [400, 300, 500, 450, 600, 500, 700],
    },
    trafficSources: {
      labels: ['Direct', 'Referral', 'Social', 'Organic', 'Email'],
      data: [30, 25, 20, 15, 10],
    },
    userActivity: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [200, 300, 250, 400, 300, 350, 500],
    },
  },
  recentActivity: [
    { id: 1, user: 'John Doe', action: 'signed up', time: '2 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'completed onboarding', time: '10 minutes ago' },
    { id: 3, user: 'Bob Johnson', action: 'upgraded plan', time: '1 hour ago' },
  ],
  topPages: [
    { page: '/dashboard', views: 1245, users: 845, bounceRate: '23%' },
    { page: '/settings', views: 845, users: 600, bounceRate: '15%' },
    { page: '/profile', views: 720, users: 520, bounceRate: '18%' },
  ],
};

// Define the request handlers
export const handlers = [
  // Get analytics data
  http.get('/api/analytics/dashboard', () => {
    return HttpResponse.json(mockAnalyticsData);
  }),
  
  // Update date range
  http.post('/api/analytics/date-range', async ({ request }) => {
    const body = await request.json() as { startDate: string; endDate: string };
    return HttpResponse.json({
      ...mockAnalyticsData,
      dateRange: {
        startDate: body.startDate,
        endDate: body.endDate,
      },
    });
  }),
  
  // Get user activity
  http.get('/api/analytics/user-activity', () => {
    return HttpResponse.json({
      activity: mockAnalyticsData.recentActivity,
    });
  }),
  
  // Get top pages
  http.get('/api/analytics/top-pages', () => {
    return HttpResponse.json({
      pages: mockAnalyticsData.topPages,
    });
  }),
];
