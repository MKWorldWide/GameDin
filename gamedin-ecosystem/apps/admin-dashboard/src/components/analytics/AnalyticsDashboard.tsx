/**
 * @file Analytics Dashboard Component
 * @description A comprehensive analytics dashboard with real-time data visualization
 * @version 1.0.0
 * @module components/analytics/AnalyticsDashboard
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
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
  Skeleton,
  Chip,
  Snackbar,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Slide,
  Grow,
  useMediaQuery,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
  CloudDownload as CloudDownloadIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  TableView as TableViewIcon,
  BarChart as BarChartIconFilled,
  PieChart as PieChartIconFilled,
  Timeline as TimelineIconFilled,
} from '@mui/icons-material';
import { format, subDays, subMonths, isAfter, parseISO, differenceInSeconds, startOfDay, endOfDay } from 'date-fns';
import { Chart as ChartJS, registerables, ChartData, ChartOptions } from 'chart.js';
import { Line, Bar, Pie, getElementAtEvent } from 'react-chartjs-2';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateRange } from '@mui/x-date-pickers-pro';

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends ChartType = ChartType> {
    annotation?: any;
    zoom?: any;
  }
}

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
}));

const StyledCardHeader = styled(CardHeader)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiCardHeader-action': {
    alignSelf: 'center',
  },
}));

const StyledCardContent = styled(CardContent)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '24px !important',
});

const SkeletonChart = styled(Skeleton)({
  width: '100%',
  height: '300px',
  transform: 'none',
});

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 10,
    top: 10,
    padding: '0 4px',
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)',
    },
    '70%': {
      boxShadow: '0 0 0 10px rgba(76, 175, 80, 0)',
    },
    '100%': {
      boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)',
    },
  },
}));

// Register ChartJS components
ChartJS.register(...registerables);

// Types
type DateRange = {
  startDate: string;
  endDate: string;
};

/**
 * Props for the MetricCard component
 * @interface MetricCardProps
 * @property {string} title - The title of the metric
 * @property {string|number} value - The current value to display
 * @property {number} [change] - The percentage change (positive or negative)
 * @property {React.ReactNode} icon - The icon to display
 * @property {string} [color='primary'] - The color theme for the card
 * @property {boolean} [loading=false] - Whether to show a loading skeleton
 * @property {boolean} [error=false] - Whether to show an error state
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  loading?: boolean;
};

/**
 * MetricCard Component
 * 
 * @component
 * @example
 * // Basic usage
 * <MetricCard 
 *   title="Total Users"
 *   value="1,234"
 *   change={12.5}
 *   icon={<PeopleIcon />}
 *   color="primary"
 * />
 *
 * @description
 * A card component that displays a single metric with an optional trend indicator.
 * Supports loading and error states, and is fully accessible.
 * 
 * @param {MetricCardProps} props - The component props
 * @returns {React.ReactElement} The rendered MetricCard component
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'primary',
  loading = false,
  error = false,
}) => {
  const theme = useTheme();
  const isPositive = change !== undefined ? change >= 0 : null;
  const [elevation, setElevation] = useState(1);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle mouse enter/leave for elevation effect
  const handleMouseEnter = () => setElevation(8);
  const handleMouseLeave = () => setElevation(1);

  // Handle refresh action
  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add refresh logic here if needed
  };

  // Empty state
  if (value === undefined && !loading && !error) {
    return (
      <StyledCard 
        elevation={elevation}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ 
          borderLeft: `4px solid ${theme.palette.grey[400]}`,
          opacity: 0.8,
        }}
      >
        <StyledCardContent>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" textAlign="center">
            <InfoOutlinedIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              No data available for {title.toLowerCase()}
            </Typography>
          </Box>
        </StyledCardContent>
      </StyledCard>
    );
  }

  // Error state
  if (error) {
    return (
      <StyledCard 
        elevation={elevation}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ 
          borderLeft: `4px solid ${theme.palette.error.main}`,
        }}
      >
        <StyledCardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="subtitle2" color="textSecondary" noWrap>
              {title}
            </Typography>
            <IconButton size="small" onClick={handleRefresh} color="error">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" flex={1}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="body2" color="error" align="center">
              Failed to load data
            </Typography>
            <Button 
              size="small" 
              color="error" 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              sx={{ mt: 1 }}
            >
              Retry
            </Button>
          </Box>
        </StyledCardContent>
      </StyledCard>
    );
  }

  // Loading state
  if (loading) {
    return (
      <StyledCard elevation={1}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="rectangular" height={60} sx={{ mt: 1, borderRadius: 1 }} />
        </CardContent>
      </StyledCard>
    );
  }

  // Default state with data
  return (
    <StyledCard 
      role="region" 
      aria-label={`${title} metric card`}
      tabIndex={0}
      elevation={elevation}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        '&:focus-visible': {
          outline: `3px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
        borderLeft: `4px solid ${theme.palette[color].main}`,
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={1}
          component="h3"
          sx={{
            margin: 0,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'text.secondary',
          }}
        >
          {title}
          <span aria-hidden="true">
            {icon}
          </span>
        </Box>
        <Typography 
          variant="h4" 
          component="div" 
          gutterBottom
          sx={{
            color: 'text.primary',
            '&:focus-visible': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
            },
          }}
          tabIndex={0}
        >
          {value}
        </Typography>
        {change !== undefined && (
          <Box 
            display="flex" 
            alignItems="center" 
            mt={1}
            component="p"
            sx={{ margin: 0 }}
          >
            {isPositive ? (
              <ArrowUpwardIcon
                fontSize="small"
                sx={{ color: 'success.main', mr: 0.5 }}
                aria-hidden="true"
              />
            ) : (
              <ArrowDownwardIcon
                fontSize="small"
                sx={{ color: 'error.main', mr: 0.5 }}
                aria-hidden="true"
              />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? 'success.main' : 'error.main',
                fontWeight: 'medium',
              }}
              aria-label={`${Math.abs(change)}% ${isPositive ? 'increase' : 'decrease'} from last period`}
            >
              {Math.abs(change)}% {isPositive ? 'increase' : 'decrease'} from last period
            </Typography>
          </Box>
        )}
  const theme = useTheme();
  
  if (!data) return null;
  
  // Prepare hourly data for the chart
  const hourlyData = {
    labels: data.byHour.map((item: any) => `${item.hour}:00`),
    datasets: [
      {
        label: 'Users by Hour',
        data: data.byHour.map((item: any) => item.users),
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const hourlyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {date ? format(parseISO(date), 'MMMM d, yyyy') : 'Details'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Summary" />
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Active Users"
                      secondary={data.activeUsers.toLocaleString()}
                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'h6' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="New Users"
                      secondary={data.newUsers.toLocaleString()}
                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'h6' }}
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="Sessions"
                      secondary={data.sessions.toLocaleString()}
                      primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                      secondaryTypographyProps={{ variant: 'h6' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
          <Grid item xs={12} md={8}>
            <Card>
              {renderMainChart()}
            </Card>
          </Grid>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<CloudDownloadIcon />}
          onClick={() => {
            // TODO: Implement export functionality
            console.log('Exporting data...');
          }}
        >
          Export Data
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Props for the AccessibleChart component
 * @interface AccessibleChartProps
 * @property {'line'|'bar'|'pie'} type - The type of chart to render
 * @property {Chart.ChartData} data - The chart data
 * @property {Chart.ChartOptions} options - Chart.js options
 * @property {string} ariaLabel - ARIA label for the chart
 * @property {(element: any) => void} [onDataPointClick] - Callback when a data point is clicked
 */
interface AccessibleChartProps {
  type: 'line' | 'bar' | 'pie';
  data: Chart.ChartData;
  options: Chart.ChartOptions;
  ariaLabel: string;
  onDataPointClick?: (element: any) => void;
}

/**
 * AccessibleChart Component
 * 
 * @component
 * @example
 * // Basic usage
 * <AccessibleChart
 *   type="line"
 *   data={chartData}
 *   options={chartOptions}
 *   ariaLabel="User activity over time"
 *   onDataPointClick={handleDataPointClick}
 * />
 *
 * @description
 * An accessible wrapper around Chart.js charts that adds keyboard navigation,
 * screen reader support, and enhanced accessibility features.
 * 
 * Key Features:
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Screen reader support with ARIA attributes
 * - Focus management for interactive elements
 * - High contrast support
 * - Responsive design
 * 
 * @param {AccessibleChartProps} props - The component props
 * @returns {React.ReactElement} The rendered AccessibleChart component
 */
const AccessibleChart = ({ 
  type, 
  data, 
  options, 
  ariaLabel, 
  onDataPointClick 
}: { 
  type: 'line' | 'bar' | 'pie', 
  data: any, 
  options: any, 
  ariaLabel: string,
  onDataPointClick?: (element: any) => void 
}) => {
  const chartRef = useRef<any>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const theme = useTheme();

  // Handle keyboard navigation for chart data points
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!data?.labels?.length) return;
    
    const dataLength = data.labels.length;
    
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => prev === null ? 0 : Math.min(prev + 1, dataLength - 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => prev === null ? dataLength - 1 : Math.max(0, prev - 1));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex !== null && onDataPointClick) {
          onDataPointClick([{ index: focusedIndex }]);
        }
        break;
      case 'Escape':
        setFocusedIndex(null);
        break;
      default:
        break;
    }
  };

  // Enhanced chart options with accessibility features
  const enhancedOptions = useMemo(() => ({
    ...options,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins?.legend,
        labels: {
          ...options.plugins?.legend?.labels,
          usePointStyle: true,
          padding: 20,
          font: {
            family: theme.typography.fontFamily,
            size: 12,
          },
          generateLabels: (chart: any) => {
            const { data } = chart;
            if (!data.datasets.length) return [];
            
            return data.datasets.map((dataset: any, i: number) => {
              const meta = chart.getDatasetMeta(i);
              const label = dataset.label || '';
              const borderColor = Array.isArray(dataset.borderColor) 
                ? dataset.borderColor[0] 
                : dataset.borderColor || theme.palette.primary.main;
              
              return {
                text: label,
                fillStyle: dataset.backgroundColor || borderColor,
                strokeStyle: borderColor,
                lineWidth: 1,
                hidden: !meta.visible,
                lineCap: 'round',
                lineJoin: 'round',
                pointStyle: 'circle',
                datasetIndex: i,
              };
            });
          },
        },
      },
      tooltip: {
        ...options.plugins?.tooltip,
        callbacks: {
          ...options.plugins?.tooltip?.callbacks,
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? context.parsed;
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
      axis: 'x',
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        setFocusedIndex(elements[0].index);
      } else {
        setFocusedIndex(null);
      }
    },
    // Add focus styles for keyboard navigation
    onFocus: (e: any, activeElements: any[]) => {
      if (activeElements.length > 0) {
        setFocusedIndex(activeElements[0].index);
      }
    },
  }), [options, theme, focusedIndex]);

  // Render the appropriate chart type with accessibility attributes
  const chartProps = {
    ref: chartRef,
    'aria-label': ariaLabel,
    role: 'img',
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    'data-testid': `${type}-chart`,
    style: {
      outline: 'none',
      width: '100%',
      height: '100%',
      minHeight: '300px',
    },
  };

  switch (type) {
    case 'line':
      return <Line data={data} options={enhancedOptions} {...chartProps} />;
    case 'bar':
      return <Bar data={data} options={enhancedOptions} {...chartProps} />;
    case 'pie':
      return <Pie data={data} options={enhancedOptions} {...chartProps} />;
    default:
      return null;
  }
};

/**
 * Downloads a chart as an image or CSV file
 * 
 * @function downloadChart
 * @param {string} chartId - The ID of the chart element to download
 * @param {'png'|'csv'} [format='png'] - The download format (PNG image or CSV data)
 * @returns {void}
 * 
 * @example
 * // Download chart as PNG
 * downloadChart('myChartId', 'png');
 * 
 * // Download chart data as CSV
 * downloadChart('myChartId', 'csv');
 * 
 * @description
 * This function provides functionality to export chart data in different formats.
 * For PNG exports, it captures the chart canvas and triggers a download.
 * For CSV exports, it extracts the chart data and generates a downloadable CSV file.
 * 
 * @throws {Error} If the chart element is not found or export fails
 */
const downloadChart = (chartId: string, format: 'png' | 'csv' = 'png') => {
  const canvas = document.getElementById(chartId) as HTMLCanvasElement;
  if (!canvas) return;

  if (format === 'png') {
    const link = document.createElement('a');
    link.download = `${chartId}-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else if (format === 'csv') {
    // For CSV export, you would typically transform your data and create a CSV string
    // This is a simplified example
    const data = [];
    const headers = ['Date', 'Value'];
    // Add your data transformation logic here
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${chartId}-${new Date().toISOString().split('T')[0]}.csv`);
  }
};

/**
 * Dashboard settings type definition
 * @typedef {Object} DashboardSettings
 * @property {'light'|'dark'|'system'} theme - Color theme preference
 * @property {'comfortable'|'compact'|'spacious'} density - UI density setting
 * @property {'line'|'bar'|'pie'} defaultView - Default chart view type
 * @property {'7d'|'30d'|'90d'|'12m'|'custom'} defaultDateRange - Default date range
 * @property {boolean} autoRefresh - Whether to auto-refresh data
 * @property {number} refreshInterval - Refresh interval in seconds
 * @property {boolean} showNotifications - Whether to show notifications
 * @property {boolean} showEmptyStates - Whether to show empty states
 * @property {boolean} showDataLabels - Whether to show data labels on charts
 * @property {boolean} showGridLines - Whether to show grid lines on charts
 * @property {boolean} showLegend - Whether to show chart legends
 */
type DashboardSettings = {
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact' | 'spacious';
  defaultView: 'line' | 'bar' | 'pie';
  defaultDateRange: '7d' | '30d' | '90d' | '12m' | 'custom';
  autoRefresh: boolean;
  refreshInterval: number;
  showNotifications: boolean;
  showEmptyStates: boolean;
  showDataLabels: boolean;
  showGridLines: boolean;
  showLegend: boolean;
};

/**
 * Default dashboard settings
 * @type {DashboardSettings}
 * @constant
 */
const DEFAULT_SETTINGS: DashboardSettings = {
  theme: 'system',
  density: 'comfortable',
  defaultView: 'line',
  defaultDateRange: '30d',
  autoRefresh: true,
  refreshInterval: 300, // 5 minutes
  showNotifications: true,
  showEmptyStates: true,
  showDataLabels: true,
  showGridLines: true,
  showLegend: true,
};

/**
 * Main Analytics Dashboard Component
 * 
 * @component
 * @example
 * return (
 *   <AnalyticsDashboard />
 * )
 * 
 * @description
 * The AnalyticsDashboard component provides a comprehensive overview of analytics data
 * with interactive charts, real-time updates, and customizable views.
 * 
 * Features:
 * - Real-time data visualization
 * - Interactive charts with drill-down capabilities
 * - Customizable date ranges
 * - Responsive design
 * - Accessibility support
 * - User preferences persistence
 * 
 * @returns {React.ReactElement} The rendered AnalyticsDashboard component
 */
const AnalyticsDashboard: React.FC = () => {
  const theme = useTheme();
  const muiTheme = useMuiTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [dateRange, setDateRange] = useState<DateRange<Date>>([
    subDays(new Date(), 30),
    new Date(),
  ]);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [viewType, setViewType] = useState<'line' | 'bar' | 'pie'>(settings.defaultView || 'line');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRealTime, setIsRealTime] = useState(settings.autoRefresh);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>({});
  const [drilldownData, setDrilldownData] = useState<{ active: boolean; data: any; date: string | null }>({ 
    active: false, 
    data: null, 
    date: null 
  });

  /**
   * Effect to persist settings to localStorage when they change
   * @effect
   * @listens settings
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    }
  }, [settings]);

  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useQuery(
    ['analytics', dateRange],
    () => analyticsService.getAnalytics(dateRange),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchInterval: isRealTime ? 30000 : false,
      onError: (err) => {
        console.error('Error fetching analytics:', err);
        enqueueSnackbar('Failed to fetch analytics data. Please try again.', {
          variant: 'error',
          autoHideDuration: 3000,
        });
      },
      onSuccess: () => {
        setLastUpdated(new Date());
        if (isRefetching) {
          enqueueSnackbar('Data refreshed successfully', {
            variant: 'success',
            autoHideDuration: 2000,
          });
        }
      },
    }
  );

  /**
   * Handles manual refresh of dashboard data
   * @function handleRefresh
   * @async
   * @returns {Promise<void>}
   */
  const handleRefresh = () => {
    queryClient.invalidateQueries(['analytics']);
    const updatedAt = new Date();
    setLastUpdated(updatedAt);
    
    if (settings.showNotifications) {
      enqueueSnackbar('Dashboard data refreshed', {
        variant: 'success',
        autoHideDuration: 3000,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        action: (key) => (
          <IconButton 
            size="small" 
            onClick={() => closeSnackbar(key)}
            aria-label="Close notification"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        ),
      });
    }
  };

  /**
   * Toggles real-time updates on/off
   * @function toggleRealTime
   * @returns {void}
   */
  const toggleRealTime = () => {
    const newValue = !isRealTime;
    setIsRealTime(newValue);
    
    if (settings.showNotifications) {
      enqueueSnackbar(
        `Real-time updates ${newValue ? 'enabled' : 'disabled'}`,
        {
          variant: newValue ? 'success' : 'info',
          autoHideDuration: 3000,
          action: (key) => (
            <IconButton 
              size="small" 
              onClick={() => closeSnackbar(key)}
              aria-label="Close notification"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          ),
        }
      );
    }
  };

  /**
   * Handles date range change
   * @function handleDateRangeChange
   * @param {'7d'|'30d'|'90d'|'12m'|'custom'} range - The selected date range
   * @returns {void}
   */
  const handleDateRangeChange = (range: '7d' | '30d' | '90d' | '12m' | 'custom') => {
    setDateRange(range);
    
    if (range !== 'custom') {
      const end = new Date();
      let start = new Date();
      let rangeLabel = '';
      
      switch (range) {
        case '7d':
          start.setDate(end.getDate() - 7);
          rangeLabel = '7 days';
          break;
        case '30d':
          start.setDate(end.getDate() - 30);
          rangeLabel = '30 days';
          break;
        case '90d':
          start.setDate(end.getDate() - 90);
          rangeLabel = '90 days';
          break;
        case '12m':
          start.setMonth(end.getMonth() - 12);
          rangeLabel = '12 months';
          break;
        default:
          break;
      }
      
      setCustomDateRange([start, end]);
      
      if (settings.showNotifications) {
        enqueueSnackbar(`Date range changed to last ${rangeLabel}`, {
          variant: 'info',
          autoHideDuration: 3000,
        });
      }
    } else {
      setShowDateRangePicker(true);
    }
  };

  const handleDateRangePickerChange = (newValue: DateRange<Date>) => {
    setDateRange(newValue);
    setShowDateRangePicker(false);
  };

  /**
   * Handles chart click events for drilldown functionality
   * @function handleChartClick
   * @param {Array} elements - Chart.js active elements array
   * @returns {void}
   */
  const handleChartClick = (elements: any[]) => {
    if (!elements || elements.length === 0 || !analyticsData) return;
    
    const element = elements[0];
    const datasetIndex = element.datasetIndex;
    const dataIndex = element.index;
    const dataset = analyticsData.datasets[datasetIndex];
    const label = analyticsData.labels[dataIndex];
    const value = dataset.data[dataIndex];
    
    // Simulate detailed data for the drilldown
    const detailedData = {
      date: label,
      totalUsers: value,
      newUsers: Math.round(value * 0.3),
      activeUsers: Math.round(value * 0.7),
      sessions: Math.round(value * 1.5),
      avgSessionDuration: Math.round(Math.random() * 10) + 1,
      bounceRate: Math.round(Math.random() * 30) + 10,
      byHour: Array(24).fill(0).map((_, i) => ({
        hour: i,
        users: Math.round(value * (0.5 + Math.random() * 0.5) * (i > 8 && i < 20 ? 1 : 0.5)),
      })),
      byDevice: [
        { name: 'Desktop', value: Math.round(Math.random() * 30) + 40 },
        { name: 'Mobile', value: Math.round(Math.random() * 20) + 30 },
        { name: 'Tablet', value: 100 - (Math.round(Math.random() * 30) + 40 + Math.round(Math.random() * 20) + 30) },
      ],
      bySource: [
        { name: 'Direct', value: Math.round(Math.random() * 30) + 30 },
        { name: 'Organic Search', value: Math.round(Math.random() * 20) + 20 },
        { name: 'Social', value: Math.round(Math.random() * 20) + 10 },
        { name: 'Referral', value: 100 - (Math.round(Math.random() * 30) + 30 + Math.round(Math.random() * 20) + 20 + Math.round(Math.random() * 20) + 10) },
      ],
    };
    
    setDrilldownData({
      active: true,
      data: detailedData,
      date: label,
    });
    
    if (settings.showNotifications) {
      enqueueSnackbar(`Viewing details for ${label}`, {
        variant: 'info',
    if (!analyticsData) return { labels: [], datasets: [] };
    
    // Apply filters if any
    let filteredData = [...analyticsData.userActivity];
    
    // ... (rest of the code remains the same)
    // Filter by date range is already handled by the API
    
    const labels = filteredData.map(item => 
      format(parseISO(item.date), 'MMM d')
    );
    
    return {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: filteredData.map(item => item.activeUsers),
          borderColor: theme.palette.primary.main,
          backgroundColor: theme.palette.primary.main,
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'New Users',
          data: filteredData.map(item => item.newUsers),
          borderColor: theme.palette.success.main,
          backgroundColor: theme.palette.success.main,
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Sessions',
          data: filteredData.map(item => item.sessions),
          borderColor: theme.palette.info.main,
          backgroundColor: theme.palette.info.main,
          tension: 0.3,
          fill: true,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [analyticsData, theme.palette, activeFilters]);

  // Chart options with enhanced interactivity and accessibility
  const chartOptions = {
    accessibility: {
      enabled: true,
      description: 'Interactive chart showing user activity over time',
      keyboard: {
        enabled: true,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    onClick: handleChartClick,
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        onClick: (e: any, legendItem: any, legend: any) => {
          // Prevent hiding datasets on legend click to keep all data visible
          const index = legendItem.datasetIndex;
          const ci = legend.chart;
          const meta = ci.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
          ci.update();
        },
        labels: {
          usePointStyle: true,
          padding: 20,
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.datasets.map((dataset: any, i: number) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                lineCap: 'round',
                lineDash: [],
                lineDashOffset: 0,
                pointStyle: 'circle',
                rotation: 0,
              }));
            }
            return [];
          },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        padding: 12,
        usePointStyle: true,
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US').format(context.parsed.y);
            }
            return label;
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
          onZoomComplete: ({ chart }: { chart: any }) => {
            // This prevents the chart from resetting the zoom level
            // when the chart is updated for other reasons
            chart.options.plugins.zoom.limits = {
              x: { min: chart.scales.x.min, max: chart.scales.x.max },
            };
          },
        },
        pan: {
          enabled: true,
          mode: 'x',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: (context: any) => {
            if (context.tick.value === 0) {
              return theme.palette.divider;
            }
            return theme.palette.divider;
          },
        },
        ticks: {
          callback: (value: any) => {
            if (value >= 1000) {
              return `${value / 1000}k`;
            }
            return value;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
    },
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        hitRadius: 10,
        hoverBorderWidth: 2,
      },
    },
    onHover: (event: any, elements: any) => {
      const target = event.native?.target;
      if (target) {
        target.style.cursor = elements.length ? 'pointer' : 'default';
      }
    },
  };

  // Render loading state
  if (isLoading && !analyticsData) {
    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="text" width={200} height={40} />
          <Box>
            <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block', mr: 1 }} />
            <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block' }} />
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
          
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Box p={4} textAlign="center">
        <Box mb={3}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, opacity: 0.7 }} />
        </Box>
        <Typography variant="h5" color="error" gutterBottom>
          Oops! Something went wrong
        </Typography>
        <Typography color="textSecondary" paragraph>
          We couldn't load the analytics data. Please check your connection and try again.
        </Typography>
        <Box mt={3}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => refetch()}
            startIcon={<RefreshIcon />}
            sx={{ mr: 2 }}
          >
            Retry
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
        <Box mt={4} textAlign="left" maxWidth={600} mx="auto">
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Error Details:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, overflow: 'auto', maxHeight: 200, bgcolor: 'background.default' }}>
            <pre>
              {JSON.stringify(error, null, 2)}
            </pre>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={3} gap={2}>
        {/* ... */}
      </Box>

      {/* Date Range Selector */}
      <Box mb={3} display="flex" flexWrap="wrap" gap={2} alignItems="center">
        <Paper 
          component="section"
          aria-label="Date range selection"
          sx={{ p: 0.5, display: 'inline-flex' }}
        >
          <ToggleButtonGroup
            value={dateRange}
            exclusive
            onChange={(e, value) => handleDateRangeChange(value)}
            aria-label="Select date range"
            size="small"
            sx={{
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                '&:not(:first-of-type)': {
                  borderRadius: 1,
                  borderLeft: `1px solid ${theme.palette.divider}`,
                },
                '&:first-of-type': {
                  borderRadius: 1,
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                },
              },
            }}
          >
            <ToggleButton 
              value="7d" 
              aria-label="Last 7 days"
              sx={{ minWidth: 60 }}
            >
              7D
            </ToggleButton>
            <ToggleButton 
              value="30d" 
              aria-label="Last 30 days"
              sx={{ minWidth: 60 }}
            >
              30D
            </ToggleButton>
            <ToggleButton 
              value="90d" 
              aria-label="Last 90 days"
              sx={{ minWidth: 60 }}
            >
              90D
            </ToggleButton>
            <ToggleButton 
              value="12m" 
              aria-label="Last 12 months"
              sx={{ minWidth: 60 }}
            >
              12M
            </ToggleButton>
            <Tooltip title="Custom range">
              <ToggleButton 
                value="custom" 
                aria-label="Select custom date range"
                onClick={() => setShowDateRangePicker(true)}
                selected={showDateRangePicker}
                sx={{ minWidth: 40 }}
              >
                <DateRangeIcon fontSize="small" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
        </Paper>
        
        {/* Date Range Picker Dialog */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            open={showDateRangePicker}
            onClose={() => setShowDateRangePicker(false)}
            value={customDateRange}
            onChange={handleDateRangePickerChange}
            renderInput={(startProps, endProps) => (
              <div style={{ display: 'none' }}>
                <TextField 
                  {...startProps} 
                  inputProps={{
                    ...startProps.inputProps,
                    'aria-label': 'Start date',
                  }}
                />
                <Box sx={{ mx: 1 }} aria-hidden="true"> to </Box>
                <TextField 
                  {...endProps} 
                  inputProps={{
                    ...endProps.inputProps,
                    'aria-label': 'End date',
                  }}
                />
              </div>
            )}
            components={{
              OpenPickerIcon: DateRangeIcon,
            }}
            disableFuture
            maxDate={new Date()}
            PopperProps={{
              placement: 'bottom-start',
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': 'Date range picker dialog',
            }}
          />
        </LocalizationProvider>
        
        {/* Last updated indicator */}
        <Box 
          flexGrow={1} 
          display="flex" 
          justifyContent="flex-end"
          component="section"
          aria-live="polite"
          aria-atomic="true"
        >
          <Tooltip 
            title={`Last updated: ${lastUpdated ? format(lastUpdated, 'PPpp') : 'Never'}`}
            aria-label={`Last updated: ${lastUpdated ? format(lastUpdated, 'PPpp') : 'Never'}`}
          >
            <Chip
              size="small"
              icon={<AccessTimeIcon fontSize="small" aria-hidden="true" />}
              label={
                <Typography variant="caption" color="text.secondary">
                  {formatLastUpdated(lastUpdated)}
                </Typography>
              }
              variant="outlined"
              sx={{
                '& .MuiChip-label': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                },
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                },
              }}
              tabIndex={0}
            />
          </Tooltip>
        </Box>
      </Box>

      {/* ... */}
    </Box>
  );
};

export default AnalyticsDashboard;
