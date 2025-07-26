import { useState, useMemo } from 'react';
import { DateRange } from '@/components/analytics/AnalyticsDashboard';
import { useAnalyticsData } from './useAnalyticsData';
import { 
  processUserStats, 
  processOnboardingMetrics, 
  processSystemHealth, 
  processRecentActivity,
  generateDateRange,
  calculateDateRangeDays
} from '@/utils/analyticsFormatters';

export const useDashboardAnalytics = (initialDateRange?: DateRange) => {
  // State for date range with default of last 30 days
  const [dateRange, setDateRange] = useState<DateRange>(
    initialRange || generateDateRange(30)
  );
  
  // Fetch all analytics data
  const {
    userStats,
    onboardingMetrics,
    systemHealth,
    recentActivity,
    isLoading,
    error,
    refetch,
    exportData
  } = useAnalyticsData(dateRange);

  // Process and memoize the data
  const processedData = useMemo(() => ({
    userStats: userStats ? processUserStats(userStats) : null,
    onboardingMetrics: onboardingMetrics ? processOnboardingMetrics(onboardingMetrics) : null,
    systemHealth: systemHealth ? processSystemHealth(systemHealth) : null,
    recentActivity: recentActivity ? processRecentActivity(recentActivity) : [],
  }), [userStats, onboardingMetrics, systemHealth, recentActivity]);

  // Handle date range changes
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  // Get summary metrics for the dashboard overview
  const summaryMetrics = useMemo(() => {
    if (!processedData.userStats || !processedData.onboardingMetrics) return null;
    
    return {
      totalUsers: {
        value: processedData.userStats.totalUsersFormatted,
        change: processedData.userStats.userGrowth,
        changeType: processedData.userStats.userGrowth >= 0 ? 'increase' : 'decrease',
        description: 'Total users',
      },
      activeUsers: {
        value: processedData.userStats.activeUsersFormatted,
        change: 0, // This would come from comparing with previous period
        changeType: 'increase' as const,
        description: 'Active users (30d)',
      },
      newUsers: {
        value: processedData.userStats.newUsersFormatted,
        change: 0, // This would come from comparing with previous period
        changeType: 'increase' as const,
        description: 'New users',
      },
      completionRate: {
        value: processedData.onboardingMetrics.completionRateFormatted,
        change: 0, // This would come from comparing with previous period
        changeType: 'increase' as const,
        description: 'Onboarding completion',
      },
    };
  }, [processedData.userStats, processedData.onboardingMetrics]);

  // Get chart data for the dashboard
  const chartData = useMemo(() => {
    if (!processedData.userStats || !processedData.onboardingMetrics) return null;

    return {
      userGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Total Users',
            data: [100, 200, 300, 400, 500, 600, processedData.userStats.totalUsers],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            tension: 0.3,
            fill: true,
          },
        ],
      },
      onboardingFunnel: {
        labels: processedData.onboardingMetrics.steps.map(step => step.step),
        datasets: [
          {
            label: 'Started',
            data: processedData.onboardingMetrics.steps.map(step => step.started),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
          },
          {
            label: 'Completed',
            data: processedData.onboardingMetrics.steps.map(step => step.completed),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
          },
        ],
      },
      usersByRole: {
        labels: Object.keys(processedData.userStats.usersByRole),
        datasets: [
          {
            data: Object.values(processedData.userStats.usersByRole),
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
          },
        ],
      },
    };
  }, [processedData.userStats, processedData.onboardingMetrics]);

  return {
    // State
    dateRange,
    setDateRange: handleDateRangeChange,
    
    // Raw data
    rawData: {
      userStats: processedData.userStats,
      onboardingMetrics: processedData.onboardingMetrics,
      systemHealth: processedData.systemHealth,
      recentActivity: processedData.recentActivity,
    },
    
    // Processed data
    summaryMetrics,
    chartData,
    
    // Status
    isLoading,
    error,
    
    // Actions
    refetch,
    exportData,
    
    // Utilities
    daysInRange: dateRange ? calculateDateRangeDays(dateRange.startDate, dateRange.endDate) : 0,
  };
};

export default useDashboardAnalytics;
