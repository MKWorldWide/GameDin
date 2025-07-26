import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  IconButton, 
  Menu, 
  MenuItem, 
  Tooltip, 
  useTheme, 
  LinearProgress, 
  alpha,
  Paper,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Skeleton,
  useMediaQuery
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
  People as PeopleIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIconFilled,
  BarChart as BarChartIconFilled,
  PieChart as PieChartIconFilled,
  Download as DownloadIcon,
  TimelineOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@mui/icons-material';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Import our custom chart components
import { ChartContainer, LineChart, BarChart, PieChart } from './charts';
import { DateRangePicker } from './DateRangePicker';

// Import types and utilities
import { 
  AnalyticsData, 
  UserActivityData, 
  ChartData, 
  ChartOptions,
  DateRange as DateRangeType
} from '@/types/analytics';
import { 
  formatDateRange, 
  calculateRetentionRates, 
  calculateConversionFunnel, 
  groupActivityByPeriod,
  calculateEngagementMetrics,
  generateTimeSeries,
  formatNumber,
  formatDuration
} from '@/utils/analyticsUtils';

// Mock data generator - replace with real API calls
const generateMockData = (dateRange: DateRangeType): Promise<AnalyticsData> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Generate time series data
      const userActivity: UserActivityData[] = [];
      let currentDate = new Date(startDate);
      
      for (let i = 0; i <= daysDiff; i++) {
        const date = new Date(currentDate);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Base values with some randomness and weekly patterns
        const baseActiveUsers = 500 + Math.sin(i / 3.5) * 100 + Math.random() * 50;
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
        
        userActivity.push({
          date: format(date, 'yyyy-MM-dd'),
          activeUsers: Math.round(baseActiveUsers * weekendMultiplier * (0.9 + Math.random() * 0.2)),
          newUsers: Math.round((20 + Math.random() * 15) * weekendMultiplier),
          sessions: Math.round((baseActiveUsers * (1.2 + Math.random() * 0.3)) * weekendMultiplier),
          pageViews: Math.round((baseActiveUsers * (3 + Math.random() * 2)) * weekendMultiplier),
          bounceRate: 30 + Math.random() * 15, // 30-45% bounce rate
          avgSessionDuration: 120 + Math.random() * 180, // 2-5 minutes
        });
        
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
      
      // User sources
      const userSources = [
        { name: 'Direct', value: 35, change: 2.5 },
        { name: 'Organic Search', value: 25, change: -1.2 },
        { name: 'Social', value: 20, change: 3.7 },
        { name: 'Referral', value: 15, change: 0.8 },
        { name: 'Email', value: 5, change: -0.5 },
      ];
      
      // Device distribution
      const deviceDistribution = [
        { name: 'Mobile', value: 60, icon: '📱' },
        { name: 'Desktop', value: 30, icon: '💻' },
        { name: 'Tablet', value: 10, icon: '⌚' },
      ];
      
      // Engagement metrics
      const engagement = calculateEngagementMetrics(userActivity);
      
      // Prepare the response
      const response: AnalyticsData = {
        totalUsers: 12450,
        activeUsers: 5890,
        newUsers: userActivity.reduce((sum, day) => sum + day.newUsers, 0),
        userGrowth: 12.5,
        avgSessionDuration: formatDuration(engagement.avgSessionDuration * 1000), // Convert to ms
        avgSessionDurationMs: engagement.avgSessionDuration * 1000,
        bounceRate: engagement.bounceRate,
        pagesPerSession: engagement.pagesPerSession,
        sessions: userActivity.reduce((sum, day) => sum + day.sessions, 0),
        userActivity,
        userSources,
        deviceDistribution,
        lastUpdated: new Date().toISOString(),
        timeRange: dateRange,
      };
      
      resolve(response);
    }, 800); // Simulate network delay
  });
};

// Chart options
const defaultChartOptions: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        drawBorder: false,
      },
    },
  },
};

// Main component
export const EnhancedAnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for date range
  const [dateRange, setDateRange] = useState<DateRangeType>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // State for chart view type
  const [viewType, setViewType] = useState<'line' | 'bar' | 'pie'>('line');
  
  // State for date picker
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<null | HTMLElement>(null);
  
  // State for period grouping
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  
  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading, 
    isRefetching 
  } = useQuery<AnalyticsData>({
    queryKey: ['analytics', dateRange],
    queryFn: () => generateMockData(dateRange),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
  
  // Process data for charts
  const processedData = useMemo(() => {
    if (!analyticsData) return null;
    
    // Group data by selected period
    const groupedActivity = groupActivityByPeriod(analyticsData.userActivity, period);
    
    // Prepare chart data
    const labels = groupedActivity.map(item => {
      const date = new Date(item.date);
      switch (period) {
        case 'week':
          return `Week of ${format(date, 'MMM d')}`;
        case 'month':
          return format(date, 'MMM yyyy');
        case 'day':
        default:
          return format(date, 'MMM d');
      }
    });
    
    const chartData: ChartData = {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: groupedActivity.map(item => item.activeUsers),
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderColor: theme.palette.primary.main,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: 'New Users',
          data: groupedActivity.map(item => item.newUsers),
          backgroundColor: alpha(theme.palette.success.main, 0.2),
          borderColor: theme.palette.success.main,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Sessions',
          data: groupedActivity.map(item => item.sessions),
          backgroundColor: alpha(theme.palette.info.main, 0.2),
          borderColor: theme.palette.info.main,
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
    
    // Prepare pie chart data for user sources
    const pieChartData: ChartData = {
      labels: analyticsData.userSources.map(source => source.name),
      datasets: [
        {
          data: analyticsData.userSources.map(source => source.value),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.info.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderWidth: 1,
          borderColor: theme.palette.background.paper,
        },
      ],
    };
    
    // Prepare bar chart data for device distribution
    const barChartData: ChartData = {
      labels: analyticsData.deviceDistribution.map(device => device.name),
      datasets: [
        {
          label: 'Users by Device',
          data: analyticsData.deviceDistribution.map(device => device.value),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.info.main,
          ],
          borderWidth: 1,
          borderColor: theme.palette.background.paper,
        },
      ],
    };
    
    // Calculate retention rates
    const retentionRates = calculateRetentionRates(analyticsData.userActivity);
    
    // Calculate conversion funnel
    const conversionFunnel = calculateConversionFunnel(analyticsData.userActivity);
    
    return {
      chartData,
      pieChartData,
      barChartData,
      retentionRates,
      conversionFunnel,
      engagement: calculateEngagementMetrics(analyticsData.userActivity),
    };
  }, [analyticsData, period, theme.palette]);
  
  // Handle date range change
  const handleDateRangeChange = (newDateRange: DateRangeType) => {
    setDateRange(newDateRange);
    setDatePickerAnchorEl(null);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    queryClient.invalidateQueries(['analytics']);
  };
  
  // Handle period change
  const handlePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: 'day' | 'week' | 'month' | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };
  
  // Handle view type change
  const handleViewTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewType: 'line' | 'bar' | 'pie' | null,
  ) => {
    if (newViewType !== null) {
      setViewType(newViewType);
    }
  };
  
  // Handle export data
  const handleExportData = () => {
    if (!analyticsData) return;
    
    // Convert data to CSV
    const headers = [
      'Date',
      'Active Users',
      'New Users',
      'Sessions',
      'Page Views',
      'Bounce Rate',
      'Avg. Session Duration (s)',
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    analyticsData.userActivity.forEach(item => {
      const row = [
        `"${item.date}"`,
        item.activeUsers,
        item.newUsers,
        item.sessions,
        item.pageViews || '',
        item.bounceRate ? item.bounceRate.toFixed(2) + '%' : '',
        item.avgSessionDuration ? item.avgSessionDuration.toFixed(0) : '',
      ];
      
      csvRows.push(row.join(','));
    });
    
    // Create a download link
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render chart based on view type
  const renderChart = () => {
    if (!processedData) return null;
    
    const commonProps = {
      height: 400,
      style: { height: 400 },
    };
    
    switch (viewType) {
      case 'bar':
        return (
          <BarChart 
            data={processedData.chartData} 
            options={defaultChartOptions}
            {...commonProps}
          />
        );
      case 'pie':
        return (
          <PieChart 
            data={processedData.pieChartData} 
            options={{
              ...defaultChartOptions,
              plugins: {
                ...defaultChartOptions.plugins,
                legend: {
                  position: isMobile ? 'bottom' : 'right',
                },
              },
            }}
            {...commonProps}
          />
        );
      case 'line':
      default:
        return (
          <LineChart 
            data={processedData.chartData} 
            options={defaultChartOptions}
            {...commonProps}
          />
        );
    }
  };
  
  // Loading state
  if (isLoading && !analyticsData) {
    return (
      <Box p={3}>
        <Skeleton variant="rectangular" height={64} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
        <Box mt={3}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
        <Grid container spacing={3} mt={0}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      {/* Header with title and actions */}
      <Box 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        gap={2}
      >
        <Typography variant="h4" component="h1" gutterBottom={false}>
          Analytics Dashboard
        </Typography>
        
        <Box display="flex" gap={1} flexWrap="wrap">
          {/* Date range selector */}
          <Button
            variant="outlined"
            startIcon={<DateRangeIcon />}
            onClick={(e) => setDatePickerAnchorEl(e.currentTarget)}
          >
            {formatDateRange(dateRange.startDate, dateRange.endDate)}
          </Button>
          
          {/* View type toggle */}
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={handleViewTypeChange}
            aria-label="chart view type"
            size="small"
          >
            <ToggleButton value="line" aria-label="line chart">
              {viewType === 'line' ? <TimelineIconFilled /> : <TimelineOutlined />}
            </ToggleButton>
            <ToggleButton value="bar" aria-label="bar chart">
              {viewType === 'bar' ? <BarChartIconFilled /> : <BarChartOutlined />}
            </ToggleButton>
            <ToggleButton value="pie" aria-label="pie chart">
              {viewType === 'pie' ? <PieChartIconFilled /> : <PieChartOutlined />}
            </ToggleButton>
          </ToggleButtonGroup>
          
          {/* Period selector */}
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            aria-label="time period"
            size="small"
          >
            <ToggleButton value="day" aria-label="daily">Day</ToggleButton>
            <ToggleButton value="week" aria-label="weekly">Week</ToggleButton>
            <ToggleButton value="month" aria-label="monthly">Month</ToggleButton>
          </ToggleButtonGroup>
          
          {/* Refresh button */}
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefetching}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          {/* Export button */}
          <Tooltip title="Export data">
            <IconButton 
              onClick={handleExportData}
              color="primary"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Date range picker popover */}
      <DateRangePicker
        open={Boolean(datePickerAnchorEl)}
        anchorEl={datePickerAnchorEl}
        onClose={() => setDatePickerAnchorEl(null)}
        value={dateRange}
        onChange={handleDateRangeChange}
      />
      
      {/* Key metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="overline" display="block">
                Total Users
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(analyticsData?.totalUsers || 0)}
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <ShowChartIcon 
                  color="primary" 
                  sx={{ fontSize: 16, mr: 0.5 }} 
                />
                <Typography 
                  variant="body2" 
                  color="primary"
                  sx={{ fontWeight: 'medium' }}
                >
                  {analyticsData?.userGrowth?.toFixed(1)}% from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="overline" display="block">
                Active Users
              </Typography>
              <Typography variant="h4" component="div">
                {formatNumber(analyticsData?.activeUsers || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                {formatNumber(processedData?.engagement.avgSessionsPerUser.toFixed(1) || 0)} avg. sessions per user
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="overline" display="block">
                Avg. Session
              </Typography>
              <Typography variant="h4" component="div">
                {formatDuration(processedData?.engagement.avgSessionDuration * 1000 || 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ mt: 1 }}
              >
                {processedData?.engagement.pagesPerSession.toFixed(1)} pages/session
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" variant="overline" display="block">
                Bounce Rate
              </Typography>
              <Typography variant="h4" component="div">
                {processedData?.engagement.bounceRate.toFixed(1)}%
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                {processedData && processedData.engagement.bounceRate < 40 ? (
                  <ShowChartIcon 
                    sx={{ 
                      color: 'success.main', 
                      fontSize: 16, 
                      mr: 0.5,
                      transform: 'rotate(180deg)'
                    }} 
                  />
                ) : (
                  <ShowChartIcon 
                    sx={{ 
                      color: 'error.main', 
                      fontSize: 16, 
                      mr: 0.5 
                    }} 
                  />
                )}
                <Typography 
                  variant="body2" 
                  color={processedData && processedData.engagement.bounceRate < 40 ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 'medium' }}
                >
                  {processedData && processedData.engagement.bounceRate < 40 ? 'Good' : 'High'} bounce rate
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main chart */}
      <Box mb={3}>
        <ChartContainer 
          title="User Activity"
          subtitle={`${formatDateRange(dateRange.startDate, dateRange.endDate)} • ${period.charAt(0).toUpperCase() + period.slice(1)}ly view`}
          loading={isLoading || isRefetching}
          height={450}
        >
          {renderChart()}
        </ChartContainer>
      </Box>
      
      {/* Bottom row */}
      <Grid container spacing={3}>
        {/* User sources */}
        <Grid item xs={12} md={6}>
          <ChartContainer 
            title="User Sources"
            subtitle="Where your users come from"
            loading={isLoading || isRefetching}
            height={400}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <PieChart 
                  data={processedData?.pieChartData || { labels: [], datasets: [] }}
                  options={{
                    ...defaultChartOptions,
                    plugins: {
                      ...defaultChartOptions.plugins,
                      legend: {
                        position: isMobile ? 'bottom' : 'right',
                      },
                    },
                  }}
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" flexDirection="column" gap={2} mt={2}>
                  {analyticsData?.userSources.map((source, index) => (
                    <Box key={source.name}>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" color="textPrimary">
                          {source.name}
                        </Typography>
                        <Typography variant="body2" color="textPrimary" fontWeight="medium">
                          {source.value}%
                        </Typography>
                      </Box>
                      <Box 
                        sx={{
                          height: 8,
                          bgcolor: theme.palette.grey[200],
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Box 
                          sx={{
                            height: '100%',
                            width: `${source.value}%`,
                            bgcolor: [
                              theme.palette.primary.main,
                              theme.palette.success.main,
                              theme.palette.info.main,
                              theme.palette.warning.main,
                              theme.palette.error.main,
                            ][index % 5],
                            borderRadius: 2,
                          }}
                        />
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="caption" color="textSecondary">
                          {source.change >= 0 ? '+' : ''}{source.change}% from last period
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </ChartContainer>
        </Grid>
        
        {/* Device distribution */}
        <Grid item xs={12} md={6}>
          <ChartContainer 
            title="Device Distribution"
            subtitle="Devices used to access your platform"
            loading={isLoading || isRefetching}
            height={400}
          >
            <BarChart 
              data={processedData?.barChartData || { labels: [], datasets: [] }}
              options={{
                ...defaultChartOptions,
                indexAxis: 'y',
                plugins: {
                  ...defaultChartOptions.plugins,
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  ...defaultChartOptions.scales,
                  x: {
                    ...defaultChartOptions.scales?.x,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
              height={300}
            />
            
            <Grid container spacing={2} mt={2}>
              {analyticsData?.deviceDistribution.map((device) => (
                <Grid item xs={4} key={device.name}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="textPrimary">
                      {device.icon}
                    </Typography>
                    <Typography variant="h6" color="textPrimary">
                      {device.value}%
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {device.name}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </ChartContainer>
        </Grid>
      </Grid>
      
      {/* Conversion funnel */}
      {processedData?.conversionFunnel && (
        <Box mt={3}>
          <ChartContainer 
            title="Conversion Funnel"
            subtitle="User journey from first visit to active user"
            loading={isLoading || isRefetching}
            height={400}
          >
            <Box display="flex" justifyContent="center" alignItems="flex-end" height={300} gap={2}>
              {processedData.conversionFunnel.steps.map((step, index) => {
                const value = processedData.conversionFunnel.values[index];
                const conversionRate = processedData.conversionFunnel.conversionRates[index];
                const prevRate = index > 0 
                  ? processedData.conversionFunnel.conversionRates[index - 1] 
                  : 100;
                const dropoff = index > 0 ? prevRate - conversionRate : 0;
                
                return (
                  <Box 
                    key={step} 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center"
                    flex={1}
                    maxWidth={200}
                  >
                    <Box 
                      sx={{
                        width: '100%',
                        height: Math.max(50, (conversionRate / 100) * 250),
                        bgcolor: theme.palette.primary.main,
                        borderRadius: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[4],
                        },
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        color="white" 
                        align="center"
                        sx={{ 
                          fontWeight: 'bold',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        {formatNumber(value)}
                      </Typography>
                    </Box>
                    
                    <Box mt={1} textAlign="center">
                      <Typography variant="body2" color="textPrimary" fontWeight="medium">
                        {step}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {conversionRate.toFixed(1)}% conversion
                      </Typography>
                      
                      {index > 0 && (
                        <Box 
                          mt={0.5} 
                          p={0.5} 
                          bgcolor={dropoff > 0 ? 'error.light' : 'success.light'}
                          borderRadius={1}
                        >
                          <Typography 
                            variant="caption" 
                            color={dropoff > 0 ? 'error.dark' : 'success.dark'}
                            fontWeight="medium"
                          >
                            {dropoff > 0 ? `-${dropoff.toFixed(1)}%` : 'No dropoff'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </ChartContainer>
        </Box>
      )}
      
      {/* Data last updated */}
      <Box mt={3} textAlign="center">
        <Typography variant="caption" color="textSecondary">
          Data last updated: {analyticsData ? format(new Date(analyticsData.lastUpdated), 'PPpp') : 'Loading...'}
        </Typography>
      </Box>
    </Box>
  );
};

export default EnhancedAnalyticsDashboard;
