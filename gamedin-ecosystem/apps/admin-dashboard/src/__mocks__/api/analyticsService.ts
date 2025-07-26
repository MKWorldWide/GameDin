import { DateRange } from '@/services/analyticsService';
import { subDays, format } from 'date-fns';

// Generate mock analytics data
export const generateMockAnalyticsData = (dateRange: DateRange) => {
  const days = Math.ceil(
    (new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / 
    (1000 * 60 * 60 * 24)
  ) + 1;

  // Generate time series data
  const timeSeries = Array.from({ length: days }, (_, i) => {
    const date = format(subDays(new Date(dateRange.endDate), days - i - 1), 'yyyy-MM-dd');
    return {
      date,
      users: Math.floor(Math.random() * 1000) + 500,
      sessions: Math.floor(Math.random() * 1500) + 800,
      pageViews: Math.floor(Math.random() * 5000) + 2000,
      bounceRate: Math.random() * 0.5 + 0.2, // 20-70%
      avgSessionDuration: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
    };
  });

  // Calculate totals
  const totals = {
    users: timeSeries.reduce((sum, day) => sum + day.users, 0),
    sessions: timeSeries.reduce((sum, day) => sum + day.sessions, 0),
    pageViews: timeSeries.reduce((sum, day) => sum + day.pageViews, 0),
    avgBounceRate: 
      timeSeries.reduce((sum, day) => sum + day.bounceRate, 0) / timeSeries.length,
    avgSessionDuration: 
      timeSeries.reduce((sum, day) => sum + day.avgSessionDuration, 0) / timeSeries.length,
  };

  // Generate user segments
  const segments = [
    { name: 'New Users', value: Math.floor(totals.users * 0.35) },
    { name: 'Returning Users', value: Math.floor(totals.users * 0.65) },
  ];

  // Generate traffic sources
  const sources = [
    { name: 'Direct', value: Math.floor(totals.sessions * 0.3) },
    { name: 'Organic Search', value: Math.floor(totals.sessions * 0.4) },
    { name: 'Social', value: Math.floor(totals.sessions * 0.15) },
    { name: 'Referral', value: Math.floor(totals.sessions * 0.1) },
    { name: 'Email', value: Math.floor(totals.sessions * 0.05) },
  ];

  // Generate device distribution
  const devices = [
    { name: 'Desktop', value: Math.floor(totals.sessions * 0.55) },
    { name: 'Mobile', value: Math.floor(totals.sessions * 0.4) },
    { name: 'Tablet', value: Math.floor(totals.sessions * 0.05) },
  ];

  return {
    timeSeries,
    totals,
    segments,
    sources,
    devices,
    lastUpdated: new Date().toISOString(),
  };
};

// Mock API functions
export const fetchAnalyticsData = async (dateRange: DateRange) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: generateMockAnalyticsData(dateRange),
  };
};

export const fetchRealTimeData = async () => {
  // Simulate real-time data
  return {
    activeUsers: Math.floor(Math.random() * 100) + 50,
    activeSessions: Math.floor(Math.random() * 200) + 100,
    eventsLast5Min: Math.floor(Math.random() * 500) + 200,
  };
};
