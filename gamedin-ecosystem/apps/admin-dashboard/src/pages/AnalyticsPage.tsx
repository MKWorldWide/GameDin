import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  timelineItemClasses,
} from '@mui/lab';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  ReferenceLine,
  Label,
} from 'recharts';
import {
  DateRange as DateRangeIcon,
  Refresh,
  Download,
  ArrowUpward,
  ArrowDownward,
  Person,
  Group,
  AccessTime,
  TrendingUp,
  Devices,
  Language,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays, subMonths, parseISO, differenceInDays } from 'date-fns';
import { useAnalytics, type DatePreset } from '@/hooks/useAnalytics';
import { styled } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { tokens } from '@/theme';

// Styled components
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(3),
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  margin: theme.spacing(1, 0),
  lineHeight: 1.2,
  background: theme.palette.mode === 'dark' 
    ? `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.secondary.light} 90%)`
    : `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  '& svg': {
    marginRight: theme.spacing(1),
    fontSize: '1.1rem',
  },
}));

const ChangeIndicator = styled('span', {
  shouldForwardProp: (prop) => prop !== 'positive',
})<{ positive?: boolean }>(({ theme, positive }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '0.75rem',
  fontWeight: 600,
  marginLeft: theme.spacing(1),
  color: positive ? theme.palette.success.main : theme.palette.error.main,
  '& svg': {
    fontSize: '1rem',
    marginRight: 2,
  },
}));

const ChartContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '& .recharts-cartesian-axis-tick-value': {
    fontSize: '0.75rem',
    fill: theme.palette.text.secondary,
  },
  '& .recharts-legend-item-text': {
    fontSize: '0.75rem',
    color: theme.palette.text.primary,
  },
}));

const ChartHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const ChartTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const DateRangeSelector = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
}));

const PresetButton = styled(ToggleButton)(({ theme }) => ({
  textTransform: 'none',
  padding: theme.spacing(0.5, 2),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
}));

const StyledTimeline = styled(Timeline)(({ theme }) => ({
  padding: 0,
  margin: 0,
  [`& .${timelineItemClasses.root}:before`]: {
    flex: 0,
    padding: 0,
  },
}));

// Color palettes
const CHART_COLORS = {
  blue: '#4E79A7',
  green: '#59A14F',
  orange: '#F28E2B',
  red: '#E15759',
  purple: '#B07AA1',
  yellow: '#EDC949',
  teal: '#76B7B2',
  pink: '#FF9DA7',
  gray: '#BAB0AC',
  indigo: '#6B4C9A',
};

const PIE_COLORS = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.orange,
  CHART_COLORS.red,
  CHART_COLORS.purple,
  CHART_COLORS.yellow,
  CHART_COLORS.teal,
  CHART_COLORS.pink,
  CHART_COLORS.gray,
  CHART_COLORS.indigo,
];

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`;
};

const getChangeIndicator = (value: number) => {
  if (value > 0) {
    return (
      <ChangeIndicator positive>
        <ArrowUpward fontSize="inherit" />
        {Math.abs(value)}%
      </ChangeIndicator>
    );
  } else if (value < 0) {
    return (
      <ChangeIndicator>
        <ArrowDownward fontSize="inherit" />
        {Math.abs(value)}%
      </ChangeIndicator>
    );
  }
  return null;
};

// Mock data for demonstration
const mockAnalyticsData = {
  // User metrics
  totalUsers: 1245,
  newUsers: 124,
  activeUsers: 892,
  userGrowth: 12.5,
  
  // Engagement metrics
  avgSessionDuration: '4m 32s',
  avgSessionsPerUser: 3.2,
  retentionRate: 68.4,
  
  // Content metrics
  totalGames: 245,
  totalCreators: 189,
  avgRating: 4.2,
  
  // Time series data
  userActivity: Array.from({ length: 30 }, (_, i) => ({
    date: subDays(new Date(), 29 - i).toISOString().split('T')[0],
    activeUsers: Math.floor(Math.random() * 500) + 200,
    newUsers: Math.floor(Math.random() * 50) + 10,
    sessions: Math.floor(Math.random() * 800) + 300,
  })),
  
  // User acquisition
  userSources: [
    { name: 'Organic', value: 45 },
    { name: 'Referral', value: 25 },
    { name: 'Social', value: 15 },
    { name: 'Email', value: 10 },
    { name: 'Direct', value: 5 },
  ],
  
  // Device distribution
  deviceTypes: [
    { name: 'Mobile', value: 65 },
    { name: 'Desktop', value: 25 },
    { name: 'Tablet', value: 10 },
  ],
  
  // Geographic distribution
  geoDistribution: [
    { name: 'North America', value: 45, code: 'NA' },
    { name: 'Europe', value: 30, code: 'EU' },
    { name: 'Asia', value: 15, code: 'AS' },
    { name: 'South America', value: 5, code: 'SA' },
    { name: 'Africa', value: 3, code: 'AF' },
    { name: 'Oceania', value: 2, code: 'OC' },
  ],
};

// Format number with commas
const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

// Format percentage
const formatPercent = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Time range options
const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' },
];

// Chart components (simplified for example)
const LineChart = ({ data, height = 300 }: { data: any[], height?: number }) => (
  <Box sx={{ width: '100%', height, p: 2 }}>
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'action.hover', borderRadius: 1 }} />
  </Box>
);

const SimplePieChart = ({ data, height = 200 }: { data: any[], height?: number }) => (
  <Box sx={{ width: '100%', height, p: 2, display: 'flex', justifyContent: 'center' }}>
    <Box sx={{ width: height - 40, height: height - 40, borderRadius: '50%', bgcolor: 'action.hover' }} />
  </Box>
);

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  
  // State for filters
  const [timeRange, setTimeRange] = useState('30d');
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 29));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  
  // Simulate loading state
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics', timeRange, startDate, endDate],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockAnalyticsData;
    },
  });
  
  // Handle time range change
  const handleTimeRangeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRange: string | null,
  ) => {
    if (newRange !== null) {
      setTimeRange(newRange);
      
      // Update date range based on selection
      const today = new Date();
      switch (newRange) {
        case '7d':
          setStartDate(subDays(today, 6));
          setEndDate(today);
          break;
        case '30d':
          setStartDate(subDays(today, 29));
          setEndDate(today);
          break;
        case '90d':
          setStartDate(subDays(today, 89));
          setEndDate(today);
          break;
        case '12m':
          setStartDate(subMonths(today, 12));
          setEndDate(today);
          break;
        default:
          break;
      }
    }
  };
  
  // Handle date range changes
  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) setTimeRange('custom');
  };
  
  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    if (date) setTimeRange('custom');
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }
  
  // Error state
  if (isError || !data) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>
          Failed to load analytics data
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => refetch()}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownloadIcon />}
          >
            Export
          </Button>
        </Box>
      </Box>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
            size="small"
          >
            {timeRanges.map((range) => (
              <ToggleButton key={range.value} value={range.value}>
                {range.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
              maxDate={endDate || undefined}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate || undefined}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Box>
      </Paper>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{formatNumber(data.totalUsers)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{data.userGrowth}% from last period
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.contrastText'
                }}>
                  <PeopleIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    Active Users
                  </Typography>
                  <Typography variant="h4">{formatNumber(data.activeUsers)}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {formatPercent(data.retentionRate)} retention
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'success.contrastText'
                }}>
                  <QueryStatsIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* New Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    New Users
                  </Typography>
                  <Typography variant="h4">+{formatNumber(data.newUsers)}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    this period
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'info.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'info.contrastText'
                }}>
                  <PersonAddIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Engagement */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="overline">
                    Avg. Session
                  </Typography>
                  <Typography variant="h4">{data.avgSessionDuration}</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {data.avgSessionsPerUser} sessions/user
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'warning.contrastText'
                }}>
                  <TimelineIcon />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* User Activity Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="User Activity" 
              subheader={`${format(startDate || new Date(), 'MMM d, yyyy')} - ${format(endDate || new Date(), 'MMM d, yyyy')}`}
            />
            <Divider />
            <Box sx={{ p: 2, height: 400 }}>
              <LineChart data={data.userActivity} />
            </Box>
          </Card>
        </Grid>
        
        {/* User Sources */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="User Acquisition" />
            <Divider />
            <Box sx={{ p: 2, height: 400 }}>
              <SimplePieChart data={data.userSources} />
              <Box sx={{ mt: 2 }}>
                {data.userSources.map((source) => (
                  <Box key={source.name} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{source.name}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {source.value}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
        
        {/* Geographic Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Geographic Distribution" />
            <Divider />
            <Box sx={{ p: 2, height: 400 }}>
              <SimplePieChart data={data.geoDistribution} height={300} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {data.geoDistribution.map((region) => (
                  <Box key={region.code} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        bgcolor: 'primary.main', 
                        borderRadius: '2px',
                        mr: 1 
                      }} 
                    />
                    <Typography variant="body2">
                      {region.name} ({region.value}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
        
        {/* Device Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Device Distribution" />
            <Divider />
            <Box sx={{ p: 2, height: 400 }}>
              <SimplePieChart data={data.deviceTypes} height={300} />
              <Box sx={{ mt: 2 }}>
                {data.deviceTypes.map((device) => (
                  <Box key={device.name} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{device.name}</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {device.value}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={device.value} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        backgroundColor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
