import {
  formatDateRange,
  getDateRangeArray,
  calculateChange,
  formatDuration,
  formatNumber,
  getTimeRange,
  timeAgo,
  getDateRangeLabel,
  getRandomColor,
  calculateRetentionRates,
  calculateConversionFunnel,
  groupActivityByPeriod,
  calculateEngagementMetrics,
  generateTimeSeries,
} from '../analyticsUtils';
import { subDays, subMonths, subYears, format, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from '@/services/analyticsService';
import { UserActivityData } from '@/types/analytics';

describe('Analytics Utilities', () => {
  describe('formatDateRange', () => {
    it('formats date range correctly', () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      const result = formatDateRange(startDate, endDate);
      expect(result).toBe('Jan 1, 2023 - Jan 31, 2023');
    });
  });

  describe('getDateRangeArray', () => {
    it('generates an array of daily dates', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-03');
      const result = getDateRangeArray(startDate, endDate, 'day');
      expect(result).toEqual(['2023-01-01', '2023-01-02', '2023-01-03']);
    });

    it('generates an array of weekly dates', () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-15');
      const result = getDateRangeArray(startDate, endDate, 'week');
      expect(result).toHaveLength(3); // 3 weeks
    });
  });

  describe('calculateChange', () => {
    it('calculates positive change correctly', () => {
      expect(calculateChange(150, 100)).toBe(50);
    });

    it('calculates negative change correctly', () => {
      expect(calculateChange(50, 100)).toBe(-50);
    });

    it('handles zero previous value', () => {
      expect(calculateChange(100, 0)).toBe(100);
    });
  });

  describe('formatDuration', () => {
    it('formats seconds correctly', () => {
      expect(formatDuration(30)).toBe('30s');
    });

    it('formats minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s');
    });

    it('formats hours and minutes', () => {
      expect(formatDuration(3660)).toBe('1h 1m');
    });
  });

  describe('formatNumber', () => {
    it('formats small numbers', () => {
      expect(formatNumber(42)).toBe('42');
    });

    it('formats thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K');
    });

    it('formats millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M');
    });
  });

  describe('getTimeRange', () => {
    it('returns correct range for today', () => {
      const now = new Date();
      const { startDate, endDate } = getTimeRange('today');
      
      expect(format(startDate, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));
      expect(format(endDate, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));
    });

    it('returns correct range for this month', () => {
      const now = new Date();
      const { startDate, endDate } = getTimeRange('thisMonth');
      
      expect(format(startDate, 'yyyy-MM-01')).toBe(format(now, 'yyyy-MM-01'));
      expect(format(endDate, 'yyyy-MM-dd')).toBe(format(now, 'yyyy-MM-dd'));
    });
  });

  describe('timeAgo', () => {
    it('returns just now for recent time', () => {
      const now = new Date();
      expect(timeAgo(now)).toBe('just now');
    });

    it('returns minutes ago', () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      expect(timeAgo(tenMinutesAgo)).toBe('10 minutes ago');
    });
  });

  describe('getDateRangeLabel', () => {
    it('returns custom range for custom dates', () => {
      const range: DateRange = {
        startDate: '2023-01-01',
        endDate: '2023-01-31',
        key: 'custom',
      };
      expect(getDateRangeLabel(range)).toBe('Jan 1, 2023 - Jan 31, 2023');
    });
  });

  describe('calculateRetentionRates', () => {
    it('calculates retention rates correctly', () => {
      const userActivity: UserActivityData[] = [
        { userId: '1', date: '2023-01-01', sessions: 1, duration: 100 },
        { userId: '1', date: '2023-01-02', sessions: 1, duration: 200 },
        { userId: '2', date: '2023-01-01', sessions: 1, duration: 150 },
      ];
      
      const retentionRates = calculateRetentionRates(userActivity);
      
      // User 1 returned on day 1, user 2 did not
      expect(retentionRates[1]).toBe(50); // 1 out of 2 users returned
    });
  });

  describe('calculateEngagementMetrics', () => {
    it('calculates engagement metrics correctly', () => {
      const userActivity: UserActivityData[] = [
        { userId: '1', date: '2023-01-01', sessions: 2, duration: 100 },
        { userId: '1', date: '2023-01-02', sessions: 1, duration: 200 },
        { userId: '2', date: '2023-01-01', sessions: 1, duration: 150 },
      ];
      
      const metrics = calculateEngagementMetrics(userActivity);
      
      expect(metrics.totalUsers).toBe(2);
      expect(metrics.totalSessions).toBe(4);
      expect(metrics.avgSessionDuration).toBeGreaterThan(0);
    });
  });

  describe('generateTimeSeries', () => {
    it('generates time series with zero-filled gaps', () => {
      const data = [
        { date: '2023-01-01', value: 10 },
        { date: '2023-01-03', value: 20 },
      ];
      
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-03');
      
      const result = generateTimeSeries(data, startDate, endDate, 'day', 0);
      
      expect(result).toHaveLength(3);
      expect(result[0].value).toBe(10);
      expect(result[1].value).toBe(0); // Zero-filled gap
      expect(result[2].value).toBe(20);
    });
  });
});
