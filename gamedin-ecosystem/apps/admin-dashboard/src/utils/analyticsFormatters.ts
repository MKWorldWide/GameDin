import { format, subDays, parseISO, differenceInDays } from 'date-fns';
import { UserStats, OnboardingMetrics, RecentActivity, SystemHealth } from '@/services/analyticsApi';

type DateRange = {
  startDate: string;
  endDate: string;
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m` 
    : `${hours}h`;
};

export const formatDate = (dateString: string, formatStr: string = 'MMM d, yyyy'): string => {
  return format(parseISO(dateString), formatStr);
};

export const generateDateRange = (days: number = 30): DateRange => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  };
};

export const calculateDateRangeDays = (startDate: string, endDate: string): number => {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
};

export const processUserStats = (data: UserStats) => {
  return {
    ...data,
    userGrowthFormatted: formatPercentage(data.userGrowth / 100, 1),
    totalUsersFormatted: formatNumber(data.totalUsers),
    activeUsersFormatted: formatNumber(data.activeUsers),
    newUsersFormatted: formatNumber(data.newUsers),
    usersByRoleArray: Object.entries(data.usersByRole).map(([role, count]) => ({
      role,
      count,
      percentage: (count / data.totalUsers) * 100
    })),
    usersByStatusArray: Object.entries(data.usersByStatus).map(([status, count]) => ({
      status,
      count,
      percentage: (count / data.totalUsers) * 100
    }))
  };
};

export const processOnboardingMetrics = (data: OnboardingMetrics) => {
  return {
    ...data,
    completionRateFormatted: formatPercentage(data.completionRate),
    avgTimeToCompleteFormatted: formatDuration(data.avgTimeToComplete),
    steps: data.steps.map(step => ({
      ...step,
      dropOffRateFormatted: formatPercentage(step.dropOffRate),
      avgTimeFormatted: formatDuration(step.avgTime),
      completionRate: step.completed / step.started,
      completionRateFormatted: formatPercentage(step.completed / step.started)
    })),
    byDay: data.byDay.map(day => ({
      ...day,
      dateFormatted: formatDate(day.date, 'MMM d')
    }))
  };
};

export const processSystemHealth = (data: SystemHealth) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'success';
      case 'degraded': return 'warning';
      case 'down': return 'error';
      default: return 'default';
    }
  };

  return {
    ...data,
    statusColor: data.status === 'healthy' ? 'success' : 
                 data.status === 'degraded' ? 'warning' : 'error',
    services: data.services.map(service => ({
      ...service,
      statusColor: getStatusColor(service.status),
      responseTimeFormatted: `${service.responseTime}ms`
    })),
    lastCheckedFormatted: formatDate(data.lastChecked, 'MMM d, yyyy HH:mm')
  };
};

export const processRecentActivity = (activities: RecentActivity[]) => {
  return activities.map(activity => ({
    ...activity,
    timeAgo: (() => {
      const now = new Date();
      const date = new Date(activity.timestamp);
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 24 * 60) return `${Math.floor(diffInMinutes / 60)}h ago`;
      return formatDate(activity.timestamp, 'MMM d');
    })()
  }));
};
