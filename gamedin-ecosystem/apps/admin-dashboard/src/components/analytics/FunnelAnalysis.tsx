import React from 'react';
import { Box, Typography, useTheme, Paper, Stepper, Step, StepLabel, StepContent, styled } from '@mui/material';
import { formatNumber, formatPercentage } from '@/utils/analyticsFormatters';

const StyledFunnel = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 800,
  margin: '0 auto',
  '& .funnel-step': {
    width: '100%',
    marginBottom: theme.spacing(1),
    position: 'relative',
    '&:not(:last-child)::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: -theme.spacing(1),
      transform: 'translateX(-50%)',
      width: 0,
      height: 0,
      borderLeft: '20px solid transparent',
      borderRight: '20px solid transparent',
      borderTop: `20px solid ${theme.palette.grey[200]}`,
      zIndex: 1,
    },
  },
  '& .funnel-bar': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.common.white,
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows[4],
    },
  },
  '& .funnel-metric': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 100,
    '& .value': {
      fontSize: '1.2rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    '& .label': {
      fontSize: '0.75rem',
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  '& .funnel-dropoff': {
    position: 'absolute',
    right: theme.spacing(2),
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: theme.spacing(0.5, 1),
    borderRadius: 12,
    fontSize: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(0.5),
      fontSize: '1rem',
    },
  },
}));

interface FunnelStep {
  id: string;
  name: string;
  count: number;
  percentage?: number;
  color?: string;
  description?: string;
}

interface FunnelAnalysisProps {
  steps: FunnelStep[];
  title?: string;
  description?: string;
  loading?: boolean;
  height?: number | string;
}

const FunnelAnalysis: React.FC<FunnelAnalysisProps> = ({
  steps,
  title = 'Conversion Funnel',
  description = 'Visualizes user progression through key conversion points',
  loading = false,
  height = 'auto',
}) => {
  const theme = useTheme();
  
  // Default colors if not provided
  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];
  
  // Process steps to calculate percentages and add colors
  const processedSteps = React.useMemo(() => {
    if (!steps || steps.length === 0) return [];
    
    const maxCount = Math.max(...steps.map(step => step.count));
    
    return steps.map((step, index) => ({
      ...step,
      percentage: step.count > 0 ? (step.count / steps[0].count) * 100 : 0,
      color: step.color || defaultColors[index % defaultColors.length],
      dropoff: index > 0 
        ? 100 - (step.count / steps[index - 1].count) * 100 
        : 0,
    }));
  }, [steps]);
  
  if (loading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography>Loading funnel data...</Typography>
      </Box>
    );
  }
  
  if (!processedSteps || processedSteps.length === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Typography color="textSecondary">No funnel data available</Typography>
      </Box>
    );
  }
  
  // Calculate the maximum width for the funnel visualization
  const maxWidth = 100; // Percentage
  
  return (
    <Box height={height}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="textSecondary" paragraph>
            {description}
          </Typography>
        )}
      </Box>
      
      <StyledFunnel>
        {processedSteps.map((step, index) => {
          // Calculate width based on percentage of first step
          const width = (step.count / processedSteps[0].count) * maxWidth;
          const isFirst = index === 0;
          const isLast = index === processedSteps.length - 1;
          
          return (
            <Box 
              key={step.id} 
              className="funnel-step"
              sx={{ width: `${Math.max(30, width)}%` }}
            >
              <Paper 
                className="funnel-bar"
                sx={{ 
                  backgroundColor: step.color,
                  borderTopLeftRadius: isFirst ? theme.shape.borderRadius * 2 : 0,
                  borderTopRightRadius: isFirst ? theme.shape.borderRadius * 2 : 0,
                  borderBottomLeftRadius: isLast ? theme.shape.borderRadius * 2 : 0,
                  borderBottomRightRadius: isLast ? theme.shape.borderRadius * 2 : 0,
                }}
              >
                <Box className="funnel-metric">
                  <span className="value">{formatNumber(step.count)}</span>
                  <span className="label">{step.name}</span>
                </Box>
                
                <Box className="funnel-metric">
                  <span className="value">{formatPercentage(step.percentage / 100, 1)}</span>
                  <span className="label">of total</span>
                </Box>
                
                {!isFirst && (
                  <Box className="funnel-dropoff">
                    <span>▼</span>
                    {formatPercentage(step.dropoff / 100, 1)} dropoff
                  </Box>
                )}
              </Paper>
            </Box>
          );
        })}
      </StyledFunnel>
      
      {/* Detailed breakdown in a stepper for mobile */}
      <Box mt={4} display={{ xs: 'block', md: 'none' }}>
        <Stepper orientation="vertical">
          {processedSteps.map((step, index) => (
            <Step key={step.id} active={true}>
              <StepLabel 
                sx={{ 
                  '& .MuiStepLabel-label': { 
                    fontSize: '1rem',
                    fontWeight: 600,
                  },
                }}
              >
                {step.name}
              </StepLabel>
              <StepContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Users
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatNumber(step.count)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" color="textSecondary">
                      Conversion
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPercentage(step.percentage / 100, 1)}
                    </Typography>
                  </Box>
                </Box>
                {!isFirst && (
                  <Box mt={1}>
                    <Typography variant="caption" color="error">
                      {formatPercentage(step.dropoff / 100, 1)} dropoff from previous step
                    </Typography>
                  </Box>
                )}
                {step.description && (
                  <Box mt={1}>
                    <Typography variant="caption" color="textSecondary">
                      {step.description}
                    </Typography>
                  </Box>
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
};

export default FunnelAnalysis;
