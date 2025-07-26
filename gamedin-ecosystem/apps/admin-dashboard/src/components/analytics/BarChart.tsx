import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatNumber } from '@/utils/analyticsFormatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const ChartContainer = styled(Box)({
  position: 'relative',
  height: '300px',
  width: '100%',
  marginTop: '16px',
});

interface BarChartProps {
  title: string;
  description?: string;
  data: ChartData<'bar'>;
  loading?: boolean;
  height?: number | string;
  options?: ChartOptions<'bar'>;
  stacked?: boolean;
}

const defaultOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      titleColor: '#1a1a1a',
      bodyColor: '#1a1a1a',
      borderColor: 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
      padding: 12,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += formatNumber(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      stacked: false,
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      stacked: false,
      ticks: {
        callback: (value) => formatNumber(Number(value)),
      },
    },
  },
};

const BarChart: React.FC<BarChartProps> = ({
  title,
  description,
  data,
  loading = false,
  height = 300,
  options = {},
  stacked = false,
}) => {
  const theme = useTheme();
  
  // Merge default options with custom options
  const chartOptions = React.useMemo(() => {
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      plugins: {
        ...defaultOptions.plugins,
        ...options.plugins,
        legend: {
          ...defaultOptions.plugins?.legend,
          ...options.plugins?.legend,
        },
        tooltip: {
          ...defaultOptions.plugins?.tooltip,
          ...options.plugins?.tooltip,
        },
      },
      scales: {
        ...defaultOptions.scales,
        ...options.scales,
        x: {
          ...defaultOptions.scales?.x,
          ...options.scales?.x,
          stacked,
        },
        y: {
          ...defaultOptions.scales?.y,
          ...options.scales?.y,
          stacked,
        },
      },
    };
    
    return mergedOptions;
  }, [options, stacked, theme]);

  // Enhance data with theme colors if not provided
  const chartData = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) {
      return data;
    }
    
    return {
      ...data,
      datasets: data.datasets.map((dataset, index) => {
        // Skip if colors are already defined
        if (dataset.backgroundColor) {
          return dataset;
        }
        
        // Generate colors based on theme
        const colors = [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
        ];
        
        const colorIndex = index % colors.length;
        const baseColor = colors[colorIndex];
        
        return {
          ...dataset,
          backgroundColor: alpha(baseColor, 0.8),
          borderColor: baseColor,
          borderWidth: 1,
          hoverBackgroundColor: baseColor,
          hoverBorderColor: theme.palette.common.black,
        };
      }),
    };
  }, [data, theme]);

  return (
    <StyledCard>
      <CardContent>
        <Box mb={2}>
          <Typography variant="h6" component="h3" fontWeight={600}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="textSecondary">
              {description}
            </Typography>
          )}
        </Box>
        
        <ChartContainer style={{ height }}>
          {loading ? (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%" 
              animation="wave"
              sx={{ transform: 'none' }} // Fix for skeleton animation
            />
          ) : (
            <Bar 
              data={chartData} 
              options={chartOptions} 
              height={height}
            />
          )}
        </ChartContainer>
      </CardContent>
    </StyledCard>
  );
};

export default BarChart;
