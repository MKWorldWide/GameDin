import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService, type DateRange, type AnalyticsData } from '@/services/analyticsService';
import { subDays, format, isAfter, subMonths } from 'date-fns';

export type DatePreset = '7d' | '30d' | '90d' | '12m' | 'custom';

export interface AnalyticsState extends AnalyticsData {
  isLoading: boolean;
  error: Error | null;
  dateRange: DateRange;
  datePreset: DatePreset;
  setDateRange: (range: DateRange) => void;
  setDatePreset: (preset: DatePreset) => void;
  refresh: () => void;
}

const getDateRangeFromPreset = (preset: DatePreset): DateRange => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch (preset) {
    case '7d':
      startDate = subDays(endDate, 7);
      break;
    case '30d':
      startDate = subDays(endDate, 30);
      break;
    case '90d':
      startDate = subDays(endDate, 90);
      break;
    case '12m':
      startDate = subMonths(endDate, 12);
      break;
    case 'custom':
    default:
      // Default to last 30 days
      startDate = subDays(endDate, 30);
  }

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
};

export const useAnalytics = (initialPreset: DatePreset = '30d') => {
  const [datePreset, setDatePreset] = useState<DatePreset>(initialPreset);
  const [dateRange, setDateRange] = useState<DateRange>(
    getDateRangeFromPreset(initialPreset)
  );
  const queryClient = useQueryClient();

  // Update date range when preset changes
  useEffect(() => {
    if (datePreset !== 'custom') {
      setDateRange(getDateRangeFromPreset(datePreset));
    }
  }, [datePreset]);

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery<AnalyticsData, Error>({
    queryKey: ['analytics', dateRange],
    queryFn: () => analyticsService.getAnalytics(dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    onError: (err) => {
      console.error('Failed to fetch analytics:', err);
    },
  });

  // Handle date range change
  const handleDateRangeChange = useCallback((newRange: DateRange) => {
    setDateRange(newRange);
    setDatePreset('custom');
  }, []);

  // Set up real-time updates
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Only enable real-time in production or when explicitly enabled
      return;
    }

    const cleanup = analyticsService.getRealTimeUpdates((data) => {
      // Update relevant queries when real-time data is received
      if (data.type === 'newUser') {
        queryClient.invalidateQueries({ queryKey: ['analytics', dateRange] });
      }
    });

    return () => {
      cleanup?.();
    };
  }, [dateRange, queryClient]);

  return {
    // Data
    ...(analyticsData || {
      userStats: {
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        userGrowth: 0,
        retentionRate: 0,
      },
      engagementStats: {
        avgSessionDuration: '0:00',
        avgSessionsPerUser: 0,
        totalSessions: 0,
        bounceRate: 0,
      },
      userActivity: [],
      userSources: [],
      deviceDistribution: [],
      geoDistribution: [],
    }),
    
    // State
    isLoading,
    error: error as Error | null,
    dateRange,
    datePreset,
    
    // Actions
    setDateRange: handleDateRangeChange,
    setDatePreset,
    refresh: refetch,
  };
};

export default useAnalytics;
