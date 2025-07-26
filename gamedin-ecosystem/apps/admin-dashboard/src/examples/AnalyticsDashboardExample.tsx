/**
 * @file Analytics Dashboard Example
 * @description Example implementation of the AnalyticsDashboard component
 * @version 1.0.0
 * @module examples/AnalyticsDashboardExample
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Snackbar,
  Alert,
  useTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';
import { enqueueSnackbar } from 'notistack';

/**
 * Example component demonstrating how to use the AnalyticsDashboard
 * 
 * @component
 * @example
 * // Basic usage
 * <AnalyticsDashboardExample />
 * 
 * @description
 * This example shows how to implement the AnalyticsDashboard component with 
 * custom event handlers and data fetching logic.
 * 
 * Key Features Demonstrated:
 * - Custom date range handling
 * - Real-time updates
 * - Error handling
 * - Custom event callbacks
 * - Snackbar notifications
 * 
 * @returns {React.ReactElement} The rendered example component
 */
const AnalyticsDashboardExample: React.FC = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Mock data fetching function
  const fetchAnalyticsData = async (dateRange: { start: Date; end: Date }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would fetch data from your API
      // const response = await fetch(`/api/analytics?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`);
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData = {
        // ... mock data structure matching your analytics data format
      };
      
      setLastUpdated(new Date());
      return mockData;
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date range changes
  const handleDateRangeChange = (range: '7d' | '30d' | '90d' | '12m' | 'custom') => {
    enqueueSnackbar(`Date range changed to: ${range}`, { variant: 'info' });
  };

  // Handle data point clicks
  const handleDataPointClick = (data: any) => {
    enqueueSnackbar(`Data point clicked: ${JSON.stringify(data)}`, { 
      variant: 'info',
      autoHideDuration: 3000,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    enqueueSnackbar('Refreshing data...', { variant: 'info' });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics Dashboard Example
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            This is an example implementation of the AnalyticsDashboard component.
            It demonstrates how to handle data fetching, error states, and user interactions.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Box mb={3}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Last Updated Indicator */}
        {lastUpdated && (
          <Box mb={2} display="flex" justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary">
              Last updated: {lastUpdated.toLocaleString()}
            </Typography>
          </Box>
        )}

        {/* Analytics Dashboard */}
        <Box sx={{ 
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[1],
          overflow: 'hidden',
        }}>
          <AnalyticsDashboard
            onDateRangeChange={handleDateRangeChange}
            onDataPointClick={handleDataPointClick}
            onRefresh={handleRefresh}
            // Uncomment to override default settings
            // settings={{
            //   theme: 'light',
            //   density: 'comfortable',
            //   defaultView: 'line',
            //   defaultDateRange: '30d',
            //   autoRefresh: true,
            //   refreshInterval: 300,
            //   showNotifications: true,
            //   showEmptyStates: true,
            //   showDataLabels: true,
            //   showGridLines: true,
            //   showLegend: true,
            // }}
          />
        </Box>

        {/* Example Actions */}
        <Box mt={4} display="flex" gap={2} flexWrap="wrap">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => enqueueSnackbar('Custom action triggered', { variant: 'success' })}
          >
            Trigger Custom Action
          </Button>
          <Button 
            variant="outlined" 
            color="primary"
            onClick={() => setError('This is an example error message.')}
          >
            Simulate Error
          </Button>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default AnalyticsDashboardExample;
