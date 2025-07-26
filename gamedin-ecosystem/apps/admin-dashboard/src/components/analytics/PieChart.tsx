import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Card, CardContent, Typography, Box, Skeleton, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { formatNumber, formatPercentage } from '@/utils/analyticsFormatters';

// Register ChartJS components
ChartJS.register(
  ArcElement,
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

const LegendContainer = styled(Box)({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '16px',
});

const LegendItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 8px',
  borderRadius: '4px',
  backgroundColor: 'rgba(0, 0, 0, 0.03)',
});

const ColorSwatch = styled('div', {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color }) => ({
  width: '12px',
  height: '12px',
  borderRadius: '2px',
  backgroundColor: color,
  marginRight: '8px',
}));

interface PieChartProps {
  title: string;
  description?: string;
  data: ChartData<'doughnut'>;
  loading?: boolean;
  height?: number | string;
  options?: ChartOptions<'doughnut'>;
  displayLegendInline?: boolean;
  cutoutPercentage?: number;
}

const defaultOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      display: false, // We'll use custom legend
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
          const label = context.label || '';
          const value = context.raw as number;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${formatNumber(value)} (${percentage}%)`;
        },
      },
    },
  },
};

const PieChart: React.FC<PieChartProps> = ({
  title,
  description,
  data,
  loading = false,
  height = 300,
  options = {},
  displayLegendInline = true,
  cutoutPercentage = 65,
}) => {
  const theme = useTheme();
  
  // Define a set of default colors if none provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.primary.light,
    theme.palette.secondary.light,
    theme.palette.success.light,
    theme.palette.error.light,
  ];
  
  // Merge default options with custom options
  const chartOptions = React.useMemo(() => ({
    ...defaultOptions,
    ...options,
    cutout: `${cutoutPercentage}%`,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
      tooltip: {
        ...defaultOptions.plugins?.tooltip,
        ...options.plugins?.tooltip,
      },
    },
  }), [options, cutoutPercentage]);
  
  // Process chart data with default colors if needed
  const chartData = React.useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) {
      return data;
    }
    
    return {
      ...data,
      datasets: data.datasets.map((dataset, datasetIndex) => {
        // If colors are already defined, use them
        if (dataset.backgroundColor) {
          return dataset;
        }
        
        // Generate colors based on theme
        const backgroundColors = Array.isArray(dataset.data) 
          ? dataset.data.map((_, index) => {
              const colorIndex = index % defaultColors.length;
              return defaultColors[colorIndex];
            })
          : [];
        
        const hoverColors = backgroundColors.map(color => 
          alpha(color, 0.8)
        );
        
        return {
          ...dataset,
          backgroundColor: backgroundColors,
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
          hoverBackgroundColor: hoverColors,
          hoverBorderColor: theme.palette.common.white,
        };
      }),
    };
  }, [data, theme]);
  
  // Generate legend items
  const legendItems = React.useMemo(() => {
    if (!chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
      return [];
    }
    
    const dataset = chartData.datasets[0];
    const total = Array.isArray(dataset.data) 
      ? dataset.data.reduce((a: number, b: number) => a + b, 0)
      : 0;
    
    return chartData.labels.map((label, index) => {
      const value = Array.isArray(dataset.data) ? dataset.data[index] : 0;
      const percentage = total > 0 ? (Number(value) / total) * 100 : 0;
      
      // Get the color for this segment
      let color = '';
      if (Array.isArray(dataset.backgroundColor)) {
        color = typeof dataset.backgroundColor[index] === 'string' 
          ? dataset.backgroundColor[index] as string
          : defaultColors[index % defaultColors.length];
      } else if (typeof dataset.backgroundColor === 'string') {
        color = dataset.backgroundColor;
      } else {
        color = defaultColors[index % defaultColors.length];
      }
      
      return {
        label: String(label),
        value: Number(value),
        percentage,
        color,
      };
    });
  }, [chartData]);

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
        
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center">
          <Box flex={1} minWidth={{ xs: '100%', md: '60%' }}>
            <ChartContainer style={{ height }}>
              {loading ? (
                <Skeleton 
                  variant="circular" 
                  width="100%" 
                  height="100%" 
                  animation="wave"
                  sx={{ 
                    borderRadius: '50%',
                    transform: 'none', // Fix for skeleton animation
                  }}
                />
              ) : (
                <Doughnut 
                  data={chartData} 
                  options={chartOptions} 
                  height={height}
                />
              )}
            </ChartContainer>
          </Box>
          
          {displayLegendInline && (
            <Box flex={1} mt={{ xs: 2, md: 0 }} pl={{ md: 2 }}>
              <LegendContainer>
                {legendItems.map((item, index) => (
                  <LegendItem key={index}>
                    <ColorSwatch color={item.color} />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatNumber(item.value)} ({formatPercentage(item.percentage / 100, 1)})
                      </Typography>
                    </Box>
                  </LegendItem>
                ))}
              </LegendContainer>
            </Box>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default PieChart;
