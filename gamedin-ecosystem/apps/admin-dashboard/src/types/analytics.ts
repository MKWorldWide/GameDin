import { Theme } from '@mui/material/styles';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: keyof Theme['palette'] | 'default';
  loading?: boolean;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
}

export interface UserSource {
  name: string;
  value: number;
  percentage?: number;
  change?: number;
}

export interface DeviceDistribution {
  name: string;
  value: number;
  icon?: React.ReactNode;
}

export interface AnalyticsData {
  // Summary metrics
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  avgSessionDuration: string;
  avgSessionDurationMs: number;
  bounceRate: number;
  pagesPerSession: number;
  sessions: number;
  
  // Time series data
  userActivity: UserActivityData[];
  
  // User sources
  userSources: UserSource[];
  
  // Device distribution
  deviceDistribution: DeviceDistribution[];
  
  // Additional metrics
  retentionRates?: Record<number, number>; // Day X retention rates
  conversionFunnel?: {
    steps: string[];
    values: number[];
    conversionRates: number[];
  };
  
  // Metadata
  lastUpdated: string;
  timeRange: DateRange;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  tension?: number;
  fill?: boolean | string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right' | 'chartArea' | 'center';
      display?: boolean;
    };
    tooltip?: {
      mode?: 'index' | 'point' | 'nearest' | 'dataset' | 'x' | 'y';
      intersect?: boolean;
      callbacks?: Record<string, (...args: any[]) => any>;
    };
    title?: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    x?: {
      grid?: {
        display?: boolean;
        drawBorder?: boolean;
      };
      ticks?: {
        callback?: (value: any, index: number, values: any[]) => string | null | undefined;
      };
    };
    y?: {
      beginAtZero?: boolean;
      grid?: {
        display?: boolean;
        drawBorder?: boolean;
      };
      ticks?: {
        callback?: (value: any, index: number, values: any[]) => string | null | undefined;
      };
    };
  };
  // Add more chart.js options as needed
}

export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  height?: number | string;
  actions?: React.ReactNode;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  predefinedRanges?: Array<{
    label: string;
    value: string;
    getValue: () => { startDate: Date; endDate: Date };
  }>;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}
