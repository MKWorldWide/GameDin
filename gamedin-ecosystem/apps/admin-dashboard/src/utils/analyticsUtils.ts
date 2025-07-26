import { 
  format, 
  parseISO, 
  subDays, 
  subMonths, 
  subYears, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  isSameDay, 
  isSameWeek, 
  isSameMonth, 
  isSameYear, 
  addDays, 
  differenceInDays, 
  differenceInMonths,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  formatDistanceToNow
} from 'date-fns';
import { DateRange } from '@/services/analyticsService';
import { UserActivityData, UserSource, DeviceDistribution } from '@/types/analytics';

type TimeUnit = 'day' | 'week' | 'month' | 'year';

/**
 * Format a date range for display
 */
export const formatDateRange = (startDate: string, endDate: string): string => {
  return `${format(new Date(startDate), 'MMM d, yyyy')} - ${format(new Date(endDate), 'MMM d, yyyy')}`;
};

/**
 * Generate an array of dates between two dates
 */
export const getDateRangeArray = (startDate: Date, endDate: Date, unit: TimeUnit = 'day'): string[] => {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(format(currentDate, 'yyyy-MM-dd'));
    
    switch (unit) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
    }
  }
  
  return dates;
};

/**
 * Calculate percentage change between two values
 */
export const calculateChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(1));
};

/**
 * Format a duration in seconds to a human-readable format
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format a number with appropriate units (K, M, B)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
};

/**
 * Get the start and end of a time period
 */
export const getTimeRange = (period: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
  const now = new Date();
  let start: Date;
  let end: Date;
  
  switch (period) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      break;
    case 'yesterday':
      const yesterday = subDays(now, 1);
      start = startOfDay(yesterday);
      end = endOfDay(yesterday);
      break;
    case 'thisWeek':
      start = startOfDay(subDays(now, now.getDay()));
      end = endOfDay(now);
      break;
    case 'lastWeek':
      const lastWeek = subDays(now, 7);
      start = startOfDay(subDays(lastWeek, lastWeek.getDay()));
      end = endOfDay(subDays(lastWeek, lastWeek.getDay() + 6));
      break;
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = endOfDay(now);
      break;
    case 'lastMonth':
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = subDays(firstDayOfThisMonth, 1);
      break;
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      end = endOfDay(now);
      break;
    case 'lastYear':
      start = new Date(now.getFullYear() - 1, 0, 1);
      end = new Date(now.getFullYear() - 1, 11, 31);
      break;
    default:
      start = subDays(now, 30);
      end = now;
  }
  
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
};

/**
 * Format a date to a human-readable relative time (e.g., "2 days ago")
 */
export const timeAgo = (date: string | Date): string => {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
};

/**
 * Convert a date range to a human-readable label
 */
export const getDateRangeLabel = (dateRange: DateRange): string => {
  const { startDate, endDate } = dateRange;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'Last 7 days';
  if (diffDays <= 30) return 'Last 30 days';
  if (diffDays <= 90) return 'Last 90 days';
  if (diffDays <= 365) return 'This year';
  return 'All time';
};

/**
 * Generate a random color for charts
 */
export const getRandomColor = (opacity: number = 1): string => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Generate a gradient for charts
 */
export const getGradient = (ctx: CanvasRenderingContext2D, chartArea: any, color: string): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, `${color}00`);
  gradient.addColorStop(1, `${color}80`);
  return gradient;
};

/**
 * Calculate retention rates from user activity data
 */
export const calculateRetentionRates = (userActivity: UserActivityData[]): Record<number, number> => {
  const retentionRates: Record<number, number> = {};
  
  if (!userActivity.length) return retentionRates;
  
  // Group by signup date
  const signupCohorts: Record<string, number> = {};
  const activeUsersByDay: Record<string, Set<string>> = {};
  
  // First pass: find all signup dates and group users
  userActivity.forEach(activity => {
    if (!signupCohorts[activity.date]) {
      signupCohorts[activity.date] = 0;
    }
    signupCohorts[activity.date] += activity.newUsers;
  });
  
  // Second pass: track active users by day
  userActivity.forEach(activity => {
    const date = parseISO(activity.date);
    const dayKey = format(date, 'yyyy-MM-dd');
    
    if (!activeUsersByDay[dayKey]) {
      activeUsersByDay[dayKey] = new Set();
    }
    
    // Add active users to the day's set
    // Note: In a real implementation, you'd track individual user IDs
    for (let i = 0; i < activity.activeUsers; i++) {
      activeUsersByDay[dayKey].add(`${dayKey}-${i}`);
    }
  });
  
  // Calculate retention for each cohort
  Object.entries(signupCohorts).forEach(([signupDate, cohortSize]) => {
    if (cohortSize === 0) return;
    
    const signupDay = parseISO(signupDate);
    const daysSinceSignup = differenceInDays(new Date(), signupDay);
    
    // Calculate retention for each day after signup
    for (let day = 1; day <= daysSinceSignup; day++) {
      const targetDate = addDays(signupDay, day);
      const targetDateKey = format(targetDate, 'yyyy-MM-dd');
      
      if (activeUsersByDay[targetDateKey]) {
        // In a real implementation, you'd track actual user retention
        // This is a simplified version that assumes some retention
        const retentionRate = Math.max(0, 1 - (day * 0.05));
        retentionRates[day] = Math.round(retentionRate * 100);
      }
    }
  });
  
  return retentionRates;
};

/**
 * Calculate conversion funnel metrics
 */
export const calculateConversionFunnel = (userActivity: UserActivityData[]) => {
  if (!userActivity.length) return { steps: [], values: [], conversionRates: [] };
  
  // Aggregate metrics across all dates
  const totals = userActivity.reduce(
    (acc, curr) => {
      acc.visits += curr.sessions || 0;
      acc.signups += curr.newUsers || 0;
      acc.activeUsers += curr.activeUsers || 0;
      return acc;
    },
    { visits: 0, signups: 0, activeUsers: 0 }
  );
  
  // Calculate conversion rates
  const visitToSignup = totals.visits > 0 ? (totals.signups / totals.visits) * 100 : 0;
  const signupToActive = totals.signups > 0 ? (totals.activeUsers / totals.signups) * 100 : 0;
  
  return {
    steps: ['Visits', 'Signups', 'Active Users'],
    values: [totals.visits, totals.signups, totals.activeUsers],
    conversionRates: [100, visitToSignup, signupToActive],
  };
};

/**
 * Group user activity by time period
 */
export const groupActivityByPeriod = (
  userActivity: UserActivityData[], 
  period: 'day' | 'week' | 'month' | 'year' = 'day'
) => {
  if (!userActivity.length) return [];
  
  const groupedData: Record<string, UserActivityData> = {};
  
  userActivity.forEach(activity => {
    const date = parseISO(activity.date);
    let periodKey: string;
    
    switch (period) {
      case 'week':
        periodKey = format(startOfWeek(date), 'yyyy-MM-dd');
        break;
      case 'month':
        periodKey = format(startOfMonth(date), 'yyyy-MM');
        break;
      case 'year':
        periodKey = format(startOfYear(date), 'yyyy');
        break;
      case 'day':
      default:
        periodKey = format(date, 'yyyy-MM-dd');
    }
    
    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        date: periodKey,
        activeUsers: 0,
        newUsers: 0,
        sessions: 0,
        pageViews: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
      };
    }
    
    // Aggregate metrics
    groupedData[periodKey].activeUsers += activity.activeUsers || 0;
    groupedData[periodKey].newUsers += activity.newUsers || 0;
    groupedData[periodKey].sessions += activity.sessions || 0;
    groupedData[periodKey].pageViews = (groupedData[periodKey].pageViews || 0) + (activity.pageViews || 0);
    
    // Calculate weighted average for rates and durations
    const totalSessions = groupedData[periodKey].sessions;
    if (totalSessions > 0) {
      const prevSessions = totalSessions - (activity.sessions || 0);
      const prevBounceRate = groupedData[periodKey].bounceRate || 0;
      const prevAvgDuration = groupedData[periodKey].avgSessionDuration || 0;
      
      // Weighted average for bounce rate
      groupedData[periodKey].bounceRate = 
        ((prevBounceRate * prevSessions) + ((activity.bounceRate || 0) * (activity.sessions || 0))) / totalSessions;
      
      // Weighted average for session duration
      groupedData[periodKey].avgSessionDuration = 
        ((prevAvgDuration * prevSessions) + ((activity.avgSessionDuration || 0) * (activity.sessions || 0))) / totalSessions;
    }
  });
  
  return Object.values(groupedData).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

/**
 * Calculate user engagement metrics
 */
export const calculateEngagementMetrics = (userActivity: UserActivityData[]) => {
  if (!userActivity.length) {
    return {
      avgSessionsPerUser: 0,
      avgSessionDuration: 0,
      pagesPerSession: 0,
      bounceRate: 0,
    };
  }
  
  const totals = userActivity.reduce(
    (acc, curr) => {
      acc.totalSessions += curr.sessions || 0;
      acc.totalUsers += curr.activeUsers || 0;
      acc.totalDuration += (curr.avgSessionDuration || 0) * (curr.sessions || 0);
      acc.totalBounceRate += (curr.bounceRate || 0) * (curr.sessions || 0);
      acc.totalPageViews += curr.pageViews || 0;
      return acc;
    },
    { 
      totalSessions: 0, 
      totalUsers: 0, 
      totalDuration: 0, 
      totalBounceRate: 0,
      totalPageViews: 0,
    }
  );
  
  return {
    avgSessionsPerUser: totals.totalUsers > 0 ? totals.totalSessions / totals.totalUsers : 0,
    avgSessionDuration: totals.totalSessions > 0 ? totals.totalDuration / totals.totalSessions : 0,
    pagesPerSession: totals.totalSessions > 0 ? totals.totalPageViews / totals.totalSessions : 0,
    bounceRate: totals.totalSessions > 0 ? totals.totalBounceRate / totals.totalSessions : 0,
  };
};

/**
 * Generate time series data with zero-filled gaps
 */
export const generateTimeSeries = (
  data: Array<{ date: string; [key: string]: any }>,
  startDate: Date,
  endDate: Date,
  interval: 'day' | 'week' | 'month' | 'year' = 'day',
  fillValue: any = 0
) => {
  const result: Array<{ date: string; [key: string]: any }> = [];
  const dateMap = new Map(data.map(item => [item.date, item]));
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    const existingData = dateMap.get(dateKey);
    
    if (existingData) {
      result.push({ ...existingData });
    } else {
      // Create a new entry with default values
      const defaultEntry: Record<string, any> = { date: dateKey };
      
      // Copy all possible keys from the first data item with default values
      if (data.length > 0) {
        Object.keys(data[0])
          .filter(key => key !== 'date')
          .forEach(key => {
            defaultEntry[key] = fillValue;
          });
      }
      
      result.push(defaultEntry);
    }
    
    // Move to the next interval
    switch (interval) {
      case 'week':
        currentDate = addDays(currentDate, 7);
        break;
      case 'month':
        currentDate = startOfMonth(addDays(endOfMonth(currentDate), 1));
        break;
      case 'year':
        currentDate = startOfYear(addDays(endOfYear(currentDate), 1));
        break;
      case 'day':
      default:
        currentDate = addDays(currentDate, 1);
    }
  }
  
  return result;
};

// Export all utilities
export default {
  // Date utilities
  formatDateRange,
  getDateRangeArray,
  getTimeRange,
  timeAgo,
  getDateRangeLabel,
  
  // Number utilities
  calculateChange,
  formatDuration,
  formatNumber,
  
  // Chart utilities
  getRandomColor,
  getGradient,
  
  // Analytics utilities
  calculateRetentionRates,
  calculateConversionFunnel,
  groupActivityByPeriod,
  calculateEngagementMetrics,
  generateTimeSeries,
};
