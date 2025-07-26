import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { DateRange } from '@/components/analytics/AnalyticsDashboard';
import analyticsApi, { 
  UserStats, 
  OnboardingMetrics, 
  SystemHealth, 
  RecentActivity 
} from '@/services/analyticsApi';
import { useCallback, useEffect } from 'react';

export function useAnalyticsData(dateRange: DateRange) {
  const queryClient = useQueryClient();
  const { startDate, endDate } = dateRange;

  // User Stats Query
  const userStatsQuery = useQuery<UserStats, Error>(
    ['analytics', 'user-stats', startDate, endDate],
    () => analyticsApi.getUserStats(`${startDate}:${endDate}`),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    }
  );

  // Onboarding Metrics Query
  const onboardingQuery = useQuery<OnboardingMetrics, Error>(
    ['analytics', 'onboarding', startDate, endDate],
    () => analyticsApi.getOnboardingMetrics(`${startDate}:${endDate}`),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 3,
    }
  );

  // System Health Query
  const systemHealthQuery = useQuery<SystemHealth, Error>(
    ['analytics', 'system-health'],
    analyticsApi.getSystemHealth,
    {
      refetchInterval: 60 * 1000, // Refresh every minute
      refetchOnWindowFocus: true,
      retry: 2,
    }
  );

  // Recent Activity Query
  const recentActivityQuery = useQuery<RecentActivity[], Error>(
    ['analytics', 'recent-activity'],
    () => analyticsApi.getRecentActivity(10),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    }
  );

  // Export Data Mutation
  const exportMutation = useMutation(
    (params: { format: 'csv' | 'json'; dateRange?: DateRange }) =>
      analyticsApi.exportData(params.format, params.dateRange),
    {
      onSuccess: (data, variables) => {
        // Create a download link for the exported file
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `analytics-export-${new Date().toISOString().split('T')[0]}.${variables.format}`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
      },
    }
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const unsubscribe = analyticsApi.subscribeToUpdates((data) => {
        // Invalidate relevant queries when real-time updates are received
        if (data.type === 'userActivity') {
          queryClient.invalidateQueries(['analytics', 'user-stats']);
          queryClient.invalidateQueries(['analytics', 'recent-activity']);
        } else if (data.type === 'onboarding') {
          queryClient.invalidateQueries(['analytics', 'onboarding']);
        } else if (data.type === 'systemHealth') {
          queryClient.invalidateQueries(['analytics', 'system-health']);
        }
      });

      return () => {
        unsubscribe?.();
      };
    }
  }, [queryClient]);

  // Combined loading state
  const isLoading = 
    userStatsQuery.isLoading || 
    onboardingQuery.isLoading || 
    systemHealthQuery.isLoading ||
    recentActivityQuery.isLoading;

  // Combined error state
  const error = 
    userStatsQuery.error || 
    onboardingQuery.error || 
    systemHealthQuery.error ||
    recentActivityQuery.error;

  // Refresh all data
  const refreshAll = useCallback(() => {
    queryClient.invalidateQueries(['analytics']);
  }, [queryClient]);

  // Export data
  const exportData = useCallback((format: 'csv' | 'json' = 'json') => {
    exportMutation.mutate({ format, dateRange });
  }, [dateRange, exportMutation]);

  return {
    // Data
    userStats: userStatsQuery.data,
    onboardingMetrics: onboardingQuery.data,
    systemHealth: systemHealthQuery.data,
    recentActivity: recentActivityQuery.data,
    
    // Loading and error states
    isLoading,
    isRefreshing: userStatsQuery.isRefetching || 
                  onboardingQuery.isRefetching || 
                  systemHealthQuery.isRefetching ||
                  recentActivityQuery.isRefetching,
    error,
    
    // Actions
    refresh: refreshAll,
    exportData,
    isExporting: exportMutation.isLoading,
    exportError: exportMutation.error,
    
    // Individual query statuses (for granular control)
    queries: {
      userStats: {
        ...userStatsQuery,
        refresh: () => queryClient.invalidateQueries(['analytics', 'user-stats']),
      },
      onboarding: {
        ...onboardingQuery,
        refresh: () => queryClient.invalidateQueries(['analytics', 'onboarding']),
      },
      systemHealth: {
        ...systemHealthQuery,
        refresh: () => queryClient.invalidateQueries(['analytics', 'system-health']),
      },
      recentActivity: {
        ...recentActivityQuery,
        refresh: () => queryClient.invalidateQueries(['analytics', 'recent-activity']),
      },
    },
  };
}

export default useAnalyticsData;
