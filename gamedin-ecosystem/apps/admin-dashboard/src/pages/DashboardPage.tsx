import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader, 
  Skeleton,
  useTheme,
  LinearProgress,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  People as PeopleIcon,
  BarChart as BarChartIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import { format, subDays, subMonths, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useSnackbar } from '@/contexts/SnackbarContext';
import { analyticsApi } from '@/lib/api';

// Register ChartJS components
ChartJS.register(...registerables);

// Mock data for demonstration
const mockUserStats = {
  totalUsers: 1245,
  activeUsers: 892,
  newUsers: 124,
  userGrowth: 12.5,
  usersByRole: {
    player: 789,
    creator: 312,
    curator: 144,
  },
  usersByStatus: {
    active: 892,
    suspended: 23,
    unverified: 330,
  },
};

const mockOnboardingMetrics = {
  totalStarted: 1024,
  totalCompleted: 789,
  completionRate: 77.1,
  avgTimeToComplete: 8.5, // minutes
  steps: [
    { step: 'welcome', started: 1024, completed: 987, dropOffRate: 3.6, avgTime: 1.2 },
    { step: 'profile', started: 987, completed: 912, dropOffRate: 7.6, avgTime: 2.5 },
    { step: 'preferences', started: 912, completed: 845, dropOffRate: 7.3, avgTime: 2.8 },
    { step: 'verification', started: 845, completed: 789, dropOffRate: 6.6, avgTime: 1.8 },
    { step: 'complete', started: 789, completed: 789, dropOffRate: 0, avgTime: 0 },
  ],
  byDay: Array.from({ length: 30 }, (_, i) => ({
    date: subDays(new Date(), 29 - i).toISOString().split('T')[0],
    started: Math.floor(Math.random() * 50) + 20,
    completed: Math.floor(Math.random() * 40) + 15,
  })),
};

const mockSystemHealth = {
  status: 'healthy',
  services: [
    { name: 'API', status: 'up', responseTime: 120 },
    { name: 'Database', status: 'up', responseTime: 45 },
    { name: 'Cache', status: 'up', responseTime: 8 },
    { name: 'Email Service', status: 'up', responseTime: 320 },
    { name: 'File Storage', status: 'up', responseTime: 85 },
  ],
  metrics: {
    cpu: 24.5,
    memory: 62.3,
    disk: 38.7,
    uptime: 1234567, // seconds
  },
  lastChecked: new Date().toISOString(),
};

const mockRecentActivity = [
  { id: 1, user: 'John Doe', action: 'logged in', timestamp: subDays(new Date(), 0.1).toISOString(), avatar: '' },
  { id: 2, user: 'Jane Smith', action: 'updated profile', timestamp: subDays(new Date(), 0.5).toISOString(), avatar: '' },
  { id: 3, user: 'Alex Johnson', action: 'created a new game', timestamp: subDays(new Date(), 1).toISOString(), avatar: '' },
  { id: 4, user: 'Sarah Williams', action: 'completed onboarding', timestamp: subDays(new Date(), 1.5).toISOString(), avatar: '' },
  { id: 5, user: 'Mike Brown', action: 'verified email', timestamp: subDays(new Date(), 2).toISOString(), avatar: '' },
];

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const { showSnackbar } = useSnackbar();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data using React Query
  const { data: userStats, isLoading: isLoadingUserStats } = useQuery(
    ['userStats'],
    () => analyticsApi.getUserStats('30d'),
    {
      initialData: mockUserStats,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching user stats:', error);
        showSnackbar('Failed to load user statistics', 'error');
      },
    }
  );

  const { data: onboardingMetrics, isLoading: isLoadingOnboarding } = useQuery(
    ['onboardingMetrics'],
    () => analyticsApi.getOnboardingMetrics('30d'),
    {
      initialData: mockOnboardingMetrics,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching onboarding metrics:', error);
        showSnackbar('Failed to load onboarding metrics', 'error');
      },
    }
  );

  const { data: systemHealth, isLoading: isLoadingSystemHealth } = useQuery(
    ['systemHealth'],
    analyticsApi.getSystemHealth,
    {
      initialData: mockSystemHealth,
      refetchOnWindowFocus: false,
      onError: (error) => {
        console.error('Error fetching system health:', error);
        showSnackbar('Failed to load system health', 'error');
      },
    }
  );

  const isLoading = isLoadingUserStats || isLoadingOnboarding || isLoadingSystemHealth;

  // Refresh all data
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        // In a real app, you would refetch the queries here
        new Promise(resolve => setTimeout(resolve, 1000)), // Simulate API call
      ]);
      showSnackbar('Dashboard data refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showSnackbar('Failed to refresh data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Chart data and options
  const userGrowthData = {
    labels: onboardingMetrics?.byDay?.map(day => format(new Date(day.date), 'MMM d')),
    datasets: [
      {
        label: 'Started',
        data: onboardingMetrics?.byDay?.map(day => day.started),
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Completed',
        data: onboardingMetrics?.byDay?.map(day => day.completed),
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}20`,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const userDistributionData = {
    labels: userStats ? Object.keys(userStats.usersByRole) : [],
    datasets: [
      {
        data: userStats ? Object.values(userStats.usersByRole) : [],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.info.main,
        ],
        borderWidth: 1,
      },
    ],
  };

  const onboardingFunnelData = {
    labels: onboardingMetrics?.steps?.map(step => step.step.charAt(0).toUpperCase() + step.step.slice(1)),
    datasets: [
      {
        label: 'Users',
        data: onboardingMetrics?.steps?.map(step => step.started) || [],
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

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
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };

  // Helper function to format numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return 'success';
      case 'degraded':
      case 'warning':
        return 'warning';
      case 'down':
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
      case 'healthy':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'warning':
      case 'degraded':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'down':
      case 'error':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <InfoIcon color="info" fontSize="small" />;
    }
  };

  // Helper function to format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total Users
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={100} height={40} />
                  ) : (
                    <Typography variant="h4">{formatNumber(userStats?.totalUsers || 0)}</Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <ArrowUpwardIcon color="success" fontSize="small" />
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 0.5 }}>
                      {userStats?.userGrowth || 0}% from last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Active Users (30d)
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={100} height={40} />
                  ) : (
                    <Typography variant="h4">{formatNumber(userStats?.activeUsers || 0)}</Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {userStats ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) : 0}% of total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 48, height: 48 }}>
                  <BarChartIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* New Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    New Users (30d)
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={100} height={40} />
                  ) : (
                    <Typography variant="h4">+{formatNumber(userStats?.newUsers || 0)}</Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {userStats ? Math.round((userStats.newUsers / userStats.totalUsers) * 100) : 0}% growth
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light', width: 48, height: 48 }}>
                  <TimelineIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Onboarding Completion */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Onboarding Completion
                  </Typography>
                  {isLoading ? (
                    <Skeleton variant="text" width={100} height={40} />
                  ) : (
                    <Typography variant="h4">{onboardingMetrics?.completionRate || 0}%</Typography>
                  )}
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {onboardingMetrics?.totalCompleted || 0} of {onboardingMetrics?.totalStarted || 0} users
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="User Growth (Last 30 Days)"
              action={
                <IconButton size="small" onClick={handleRefresh} disabled={isRefreshing}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              }
            />
            <Divider />
            <Box sx={{ p: 3, height: 350 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height="100%" />
              ) : (
                <Line data={userGrowthData} options={chartOptions} />
              )}
            </Box>
          </Card>
        </Grid>

        {/* User Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="User Distribution by Role" />
            <Divider />
            <Box sx={{ p: 3, height: 350, display: 'flex', flexDirection: 'column' }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height="100%" />
              ) : (
                <>
                  <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pie 
                      data={userDistributionData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }} 
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {userStats && Object.entries(userStats.usersByRole).map(([role, count]) => (
                      <Box key={role} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {count} ({(count / userStats.totalUsers * 100).toFixed(1)}%)
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Card>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="System Health" 
              action={
                <Chip 
                  label={systemHealth?.status.toUpperCase()} 
                  color={getStatusColor(systemHealth?.status || '') as any}
                  size="small"
                  sx={{ textTransform: 'uppercase' }}
                />
              }
            />
            <Divider />
            <Box sx={{ p: 3 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <Grid container spacing={3}>
                  {/* CPU Usage */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        CPU Usage
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {systemHealth?.metrics.cpu.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemHealth?.metrics.cpu || 0} 
                      color={
                        systemHealth?.metrics.cpu > 80 ? 'error' : 
                        systemHealth?.metrics.cpu > 60 ? 'warning' : 'primary'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  
                  {/* Memory Usage */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Memory Usage
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {systemHealth?.metrics.memory.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemHealth?.metrics.memory || 0} 
                      color={
                        systemHealth?.metrics.memory > 80 ? 'error' : 
                        systemHealth?.metrics.memory > 60 ? 'warning' : 'primary'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  
                  {/* Disk Usage */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Disk Usage
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {systemHealth?.metrics.disk.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={systemHealth?.metrics.disk || 0} 
                      color={
                        systemHealth?.metrics.disk > 80 ? 'error' : 
                        systemHealth?.metrics.disk > 60 ? 'warning' : 'primary'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Grid>
                  
                  {/* Uptime */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Uptime
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {systemHealth?.metrics.uptime ? formatUptime(systemHealth.metrics.uptime) : 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Services Status */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Services Status
                    </Typography>
                    <List dense disablePadding>
                      {systemHealth?.services.map((service) => (
                        <ListItem key={service.name} disableGutters disablePadding>
                          <ListItemAvatar sx={{ minWidth: 36 }}>
                            {getStatusIcon(service.status)}
                          </ListItemAvatar>
                          <ListItemText 
                            primary={service.name}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondary={`${service.responseTime}ms`}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <Chip 
                            label={service.status.toUpperCase()} 
                            color={getStatusColor(service.status) as any}
                            size="small"
                            sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Activity" 
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <Box sx={{ p: 0 }}>
              {isLoading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <List disablePadding>
                  {mockRecentActivity.map((activity) => {
                    const isTodayActivity = isToday(new Date(activity.timestamp));
                    const isYesterdayActivity = isYesterday(new Date(activity.timestamp));
                    
                    let timeAgo;
                    if (isTodayActivity) {
                      timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
                    } else if (isYesterdayActivity) {
                      timeAgo = 'Yesterday';
                    } else {
                      timeAgo = format(new Date(activity.timestamp), 'MMM d, yyyy');
                    }
                    
                    return (
                      <React.Fragment key={activity.id}>
                        <ListItem 
                          secondaryAction={
                            <Typography variant="caption" color="textSecondary">
                              {timeAgo}
                            </Typography>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar 
                              src={activity.avatar} 
                              alt={activity.user}
                              sx={{ width: 40, height: 40 }}
                            >
                              {activity.user.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" fontWeight="medium">
                                {activity.user} <span style={{ fontWeight: 'normal' }}>{activity.action}</span>
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="textSecondary">
                                {format(new Date(activity.timestamp), 'h:mm a')}
                              </Typography>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Onboarding Funnel */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Onboarding Funnel" 
              subheader={`${onboardingMetrics?.totalStarted || 0} started, ${onboardingMetrics?.totalCompleted || 0} completed (${onboardingMetrics?.completionRate || 0}%)`}
            />
            <Divider />
            <Box sx={{ p: 3, height: 400 }}>
              {isLoading ? (
                <Skeleton variant="rectangular" height="100%" />
              ) : (
                <Bar 
                  data={onboardingFunnelData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const,
                    plugins: {
                      ...chartOptions.plugins,
                      tooltip: {
                        callbacks: {
                          afterLabel: (context) => {
                            const step = onboardingMetrics?.steps?.[context.dataIndex];
                            if (!step) return '';
                            
                            const dropOff = step.dropOffRate > 0 ? 
                              `Drop-off: ${step.dropOffRate}%` : 
                              'Completed';
                            const time = step.avgTime > 0 ? 
                              `Avg. time: ${step.avgTime}m` : '';
                            
                            return [dropOff, time].filter(Boolean).join(' • ');
                          },
                        },
                      },
                    },
                  }} 
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
