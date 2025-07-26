import React from 'react';
import { Box, Grid, Typography, useTheme, Paper, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DateRange } from '@/components/analytics/DateRangePicker';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import SummaryCards from '@/components/analytics/SummaryCards';
import LineChart from '@/components/analytics/LineChart';
import BarChart from '@/components/analytics/BarChart';
import PieChart from '@/components/analytics/PieChart';
import { format } from 'date-fns';

const DashboardContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(4, 0, 2),
  fontWeight: 600,
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 48,
    height: 4,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 2,
  },
}));

const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  
  // Initialize with default date range (last 30 days)
  const [dateRange, setDateRange] = React.useState<DateRange>({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });
  
  // Fetch analytics data using our custom hook
  const {
    summaryMetrics,
    chartData,
    isLoading,
    error,
    daysInRange,
  } = useDashboardAnalytics(dateRange);
  
  // Handle date range changes
  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <DashboardContainer>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>Loading analytics data...</Typography>
        </Box>
      </DashboardContainer>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <DashboardContainer>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="h6" gutterBottom>Error Loading Analytics</Typography>
          <Typography>{error.message || 'An unknown error occurred while loading analytics data.'}</Typography>
        </Paper>
      </DashboardContainer>
    );
  }
  
  // Format date range display
  const formattedDateRange = `${format(new Date(dateRange.startDate), 'MMM d, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM d, yyyy')}`;
  
  return (
    <DashboardContainer>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {formattedDateRange} • {daysInRange} days
          </Typography>
        </Box>
        
        {/* Date Range Picker - Implement this component based on your UI library */}
        {/* <DateRangePicker value={dateRange} onChange={handleDateRangeChange} /> */}
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      {/* Summary Cards */}
      {summaryMetrics && (
        <Box mb={4}>
          <SectionTitle variant="h6" component="h2">
            Key Metrics
          </SectionTitle>
          <SummaryCards metrics={summaryMetrics} loading={isLoading} />
        </Box>
      )}
      
      {/* User Growth Chart */}
      {chartData?.userGrowth && (
        <Box mb={4}>
          <SectionTitle variant="h6" component="h2">
            User Growth
          </SectionTitle>
          <LineChart
            title="User Growth Over Time"
            description={`Showing user growth from ${formattedDateRange}`}
            data={chartData.userGrowth}
            loading={isLoading}
            height={400}
          />
        </Box>
      )}
      
      <Grid container spacing={3} mb={4}>
        {/* Users by Role */}
        {chartData?.usersByRole && (
          <Grid item xs={12} md={6}>
            <PieChart
              title="Users by Role"
              description="Distribution of users across different roles"
              data={{
                labels: chartData.usersByRole.labels,
                datasets: [
                  {
                    data: chartData.usersByRole.datasets[0].data,
                    label: 'Users',
                  },
                ],
              }}
              loading={isLoading}
              height={350}
            />
          </Grid>
        )}
        
        {/* Onboarding Funnel */}
        {chartData?.onboardingFunnel && (
          <Grid item xs={12} md={6}>
            <BarChart
              title="Onboarding Funnel"
              description="User progression through the onboarding steps"
              data={{
                labels: chartData.onboardingFunnel.labels,
                datasets: chartData.onboardingFunnel.datasets,
              }}
              loading={isLoading}
              height={350}
              options={{
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => value.toLocaleString(),
                    },
                  },
                },
              }}
            />
          </Grid>
        )}
      </Grid>
      
      {/* Additional Analytics Sections */}
      <Box mb={4}>
        <SectionTitle variant="h6" component="h2">
          User Engagement
        </SectionTitle>
        <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="textSecondary">Engagement metrics and visualizations coming soon</Typography>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SectionTitle variant="h6" component="h2">
            Retention Analysis
          </SectionTitle>
          <Paper sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">Retention analysis coming soon</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SectionTitle variant="h6" component="h2">
            System Health
          </SectionTitle>
          <Paper sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="textSecondary">System health metrics coming soon</Typography>
          </Paper>
        </Grid>
      </Grid>
    </DashboardContainer>
  );
};

export default AnalyticsDashboard;
