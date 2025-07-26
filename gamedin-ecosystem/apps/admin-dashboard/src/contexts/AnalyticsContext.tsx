import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { DateRange } from '@/components/analytics/AnalyticsDashboard';
import useAnalyticsData, { AnalyticsData } from '@/hooks/useAnalyticsData';

interface AnalyticsContextType extends AnalyticsData {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refreshAll: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const analyticsData = useAnalyticsData(dateRange);

  const refreshAll = useCallback(() => {
    analyticsData.refresh();
  }, [analyticsData]);

  const value = useMemo(
    () => ({
      ...analyticsData,
      dateRange,
      setDateRange,
      refreshAll,
    }),
    [analyticsData, dateRange, refreshAll]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;
