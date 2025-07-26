import React from 'react';
import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { formatNumber } from '@/utils/analyticsFormatters';

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

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.2,
  marginBottom: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const ChangeChip = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'trend',
})<{ trend: 'up' | 'down' }>(({ theme, trend }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: theme.spacing(0.25, 1),
  borderRadius: 12,
  fontSize: '0.75rem',
  fontWeight: 600,
  backgroundColor: trend === 'up' 
    ? theme.palette.success.light + '33' 
    : theme.palette.error.light + '33',
  color: trend === 'up' 
    ? theme.palette.success.dark 
    : theme.palette.error.dark,
}));

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  loading?: boolean;
  icon?: React.ReactNode;
  format?: (value: number | string) => string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change = 0,
  loading = false,
  icon,
  format = (val) => val.toString(),
}) => {
  const isPositive = change >= 0;
  const changeValue = Math.abs(change);
  
  return (
    <StyledCard>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <StatLabel variant="overline" color="textSecondary">
            {title}
          </StatLabel>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        
        {loading ? (
          <Skeleton variant="text" width="80%" height={48} />
        ) : (
          <StatValue variant="h4">
            {format(value)}
          </StatValue>
        )}
        
        {change !== undefined && !loading && (
          <Box mt="auto">
            <ChangeChip trend={isPositive ? 'up' : 'down'}>
              {isPositive ? (
                <ArrowUpwardIcon fontSize="inherit" sx={{ mr: 0.5 }} />
              ) : (
                <ArrowDownwardIcon fontSize="inherit" sx={{ mr: 0.5 }} />
              )}
              {formatNumber(changeValue)}% {isPositive ? 'increase' : 'decrease'}
            </ChangeChip>
            <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
              vs previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

interface SummaryCardsProps {
  metrics: {
    totalUsers?: {
      value: number;
      change: number;
    };
    activeUsers?: {
      value: number;
      change: number;
    };
    newUsers?: {
      value: number;
      change: number;
    };
    completionRate?: {
      value: number;
      change: number;
    };
  };
  loading?: boolean;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ metrics, loading = false }) => {
  const {
    totalUsers,
    activeUsers,
    newUsers,
    completionRate,
  } = metrics;

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={3} mb={4}>
      <MetricCard
        title="Total Users"
        value={totalUsers?.value || 0}
        change={totalUsers?.change}
        loading={loading}
        format={formatNumber}
      />
      <MetricCard
        title="Active Users"
        value={activeUsers?.value || 0}
        change={activeUsers?.change}
        loading={loading}
        format={formatNumber}
      />
      <MetricCard
        title="New Users"
        value={newUsers?.value || 0}
        change={newUsers?.change}
        loading={loading}
        format={formatNumber}
      />
      <MetricCard
        title="Onboarding Completion"
        value={completionRate?.value || 0}
        change={completionRate?.change}
        loading={loading}
        format={(val) => `${Math.round(Number(val) * 100)}%`}
      />
    </Box>
  );
};

export default SummaryCards;
