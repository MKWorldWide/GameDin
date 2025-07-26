import React, { useMemo, useState } from 'react';
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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  FilterList as FilterListIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { format, subDays, subMonths, isAfter, parseISO } from 'date-fns';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Register ChartJS components
ChartJS.register(...registerables);

// Types
type DateRange = {
  startDate: string;
  endDate: string;
};

type MetricCardProps = {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
};

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
}) => {
  const theme = useTheme();
  const colorMap: Record<string, string> = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };

  const bgColor = colorMap[color] || theme.palette.primary.main;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography color="textSecondary" variant="overline">
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: alpha(bgColor, 0.1),
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: bgColor,
            }}
          >
            {icon}
          </Box>
        </Box>
        {loading ? (
          <Box>
            <LinearProgress />
            <Box height={24} />
          </Box>
        ) : (
          <>
            <Typography variant="h4">{value}</Typography>
            {change !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {change >= 0 ? (
                  <ArrowUpwardIcon color="success" fontSize="small" />
                ) : (
                  <ArrowDownwardIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'} from last period
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Main Analytics Dashboard Component
const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewType, setViewType] = useState<'line' | 'bar' | 'pie'>('line');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data fetch - replace with actual API calls
  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', dateRange],
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      return {
        totalUsers: 1245,
        activeUsers: 892,
        newUsers: 124,
        userGrowth: 12.5,
        avgSessionDuration: '2m 45s',
        bounceRate: 24.3,
        pagesPerSession: 4.2,
        sessions: 3456,
        
        // Time series data for charts
        userActivity: Array.from({ length: 30 }, (_, i) => ({
          date: format(subDays(new Date(), 29 - i), 'yyyy-MM-dd'),
          activeUsers: Math.floor(Math.random() * 200) + 100,
          newUsers: Math.floor(Math.random() * 50) + 10,
          sessions: Math.floor(Math.random() * 150) + 100,
        })),
        
        // User sources
        userSources: [
          { name: 'Direct', value: 35 },
          { name: 'Organic Search', value: 25 },
          { name: 'Social', value: 20 },
          { name: 'Referral', value: 15 },
          { name: 'Email', value: 5 },
        ],
        
        // Device distribution
        deviceDistribution: [
          { name: 'Mobile', value: 60 },
          { name: 'Desktop', value: 30 },
          { name: 'Tablet', value: 10 },
        ],
      };
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle view type change
  const handleViewTypeChange = (type: 'line' | 'bar' | 'pie') => {
    setViewType(type);
    handleMenuClose();
  };

  // Handle date range change
  const handleDateRangeChange = (range: '7d' | '30d' | '90d' | '12m' | 'custom') => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (range) {
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
      // For custom range, we'll use the existing date range
      default:
        break;
    }
    
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries(['analytics']);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    const labels = analyticsData.userActivity.map(item => 
      format(parseISO(item.date), 'MMM d')
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: analyticsData.userActivity.map(item => item.activeUsers),
          borderColor: theme.palette.primary.main,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          tension: 0.3,
          fill: true,
        },
        {
          label: 'New Users',
          data: analyticsData.userActivity.map(item => item.newUsers),
          borderColor: theme.palette.success.main,
          backgroundColor: alpha(theme.palette.success.main, 0.1),
          tension: 0.3,
          fill: true,
        },
        {
          label: 'Sessions',
          data: analyticsData.userActivity.map(item => item.sessions),
          borderColor: theme.palette.info.main,
          backgroundColor: alpha(theme.palette.info.main, 0.1),
          tension: 0.3,
          fill: true,
        },
      ],
    };
  }, [analyticsData, theme.palette]);

  // Prepare pie chart data
  const pieChartData = useMemo(() => {
    if (!analyticsData) return { labels: [], datasets: [] };
    
    return {
      labels: analyticsData.userSources.map(item => item.name),
      datasets: [
        {
          data: analyticsData.userSources.map(item => item.value),
          backgroundColor: [
            theme.palette.primary.main,
            theme.palette.success.main,
            theme.palette.info.main,
            theme.palette.warning.main,
            theme.palette.error.main,
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [analyticsData, theme.palette]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  // Render chart based on view type
  const renderChart = () => {
    if (!analyticsData) return null;
    
    switch (viewType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} height={300} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} height={300} />;
      case 'pie':
        return <Pie data={pieChartData} options={pieChartOptions} height={300} />;
      default:
        return <Line data={chartData} options={chartOptions} height={300} />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change view">
            <IconButton
              onClick={handleMenuOpen}
              color="primary"
              aria-label="change view"
              aria-controls="view-menu"
              aria-haspopup="true"
            >
              {viewType === 'line' && <TimelineIcon />}
              {viewType === 'bar' && <BarChartIcon />}
              {viewType === 'pie' && <PieChartIcon />}
            </IconButton>
          </Tooltip>
          <Menu
            id="view-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleViewTypeChange('line')}>
              <TimelineIcon sx={{ mr: 1 }} /> Line Chart
            </MenuItem>
            <MenuItem onClick={() => handleViewTypeChange('bar')}>
              <BarChartIcon sx={{ mr: 1 }} /> Bar Chart
            </MenuItem>
            <MenuItem onClick={() => handleViewTypeChange('pie')}>
              <PieChartIcon sx={{ mr: 1 }} /> Pie Chart
            </MenuItem>
          </Menu>
          
          <Tooltip title="Filter">
            <IconButton color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Date range">
            <IconButton color="primary">
              <DateRangeIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Date Range Selector */}
      <Box mb={3}>
        <Paper sx={{ p: 1, display: 'inline-block' }}>
          <Box display="flex" gap={1}>
            {['7d', '30d', '90d', '12m'].map((range) => (
              <Button
                key={range}
                variant={dateRange.startDate === format(subDays(new Date(), parseInt(range)), 'yyyy-MM-dd') ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handleDateRangeChange(range as any)}
              >
                {range}
              </Button>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Metrics Grid */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={analyticsData?.totalUsers.toLocaleString() || '0'}
            change={analyticsData?.userGrowth || 0}
            icon={<PeopleIcon />}
            color="primary"
            loading={isLoading || isRefreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Users"
            value={analyticsData?.activeUsers.toLocaleString() || '0'}
            change={8.2}
            icon={<PeopleIcon />}
            color="success"
            loading={isLoading || isRefreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="New Users"
            value={analyticsData?.newUsers.toLocaleString() || '0'}
            change={-3.4}
            icon={<PeopleIcon />}
            color="info"
            loading={isLoading || isRefreshing}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg. Session"
            value={analyticsData?.avgSessionDuration || '0s'}
            change={5.1}
            icon={<TimelineIcon />}
            color="warning"
            loading={isLoading || isRefreshing}
          />
        </Grid>
      </Grid>

      {/* Main Chart */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="User Activity"
              subheader={`${format(new Date(dateRange.startDate), 'MMM d, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM d, yyyy')}`}
              action={
                <IconButton onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent sx={{ height: 400, position: 'relative' }}>
              {isLoading || isRefreshing ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : (
                renderChart()
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Additional Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="User Sources" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {isLoading || isRefreshing ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : (
                <Pie data={pieChartData} options={pieChartOptions} height={250} />
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Device Distribution" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {isLoading || isRefreshing ? (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  height="100%"
                >
                  <LinearProgress sx={{ width: '100%' }} />
                </Box>
              ) : (
                <Bar 
                  data={{
                    labels: analyticsData?.deviceDistribution?.map(item => item.name) || [],
                    datasets: [{
                      label: 'Users',
                      data: analyticsData?.deviceDistribution?.map(item => item.value) || [],
                      backgroundColor: [
                        theme.palette.primary.main,
                        theme.palette.success.main,
                        theme.palette.info.main,
                      ],
                      borderWidth: 1,
                    }],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          drawBorder: false,
                        },
                        ticks: {
                          callback: (value: any) => `${value}%`,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }} 
                  height={250} 
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;
