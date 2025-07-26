import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { formatNumber } from '@/utils/analyticsFormatters';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

interface LineChartProps {
  title: string;
  description?: string;
  data: ChartData<'line'>;
  loading?: boolean;
  height?: number | string;
  options?: ChartOptions<'line'>;
}

const defaultOptions: ChartOptions<'line'> = {
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
      mode: 'index',
      intersect: false,
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
      ticks: {
        callback: (value) => formatNumber(Number(value)),
      },
    },
  },
  interaction: {
    mode: 'nearest',
    axis: 'x',
    intersect: false,
  },
};

const LineChart: React.FC<LineChartProps> = ({
  title,
  description,
  data,
  loading = false,
  height = 300,
  options = {},
}) => {
  const theme = useTheme();
  
  // Merge default options with custom options
  const chartOptions = React.useMemo(() => ({
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
    },
  }), [options, theme]);

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
            <Line 
              data={data} 
              options={chartOptions} 
              height={height}
            />
          )}
        </ChartContainer>
      </CardContent>
    </StyledCard>
  );
};

export default LineChart;
