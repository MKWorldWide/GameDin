import React from 'react';
import { Box, Typography, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { HelpOutline } from '@mui/icons-material';
import { formatPercentage } from '@/utils/analyticsFormatters';

const StyledTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-root': {
    padding: theme.spacing(1),
    borderRight: `1px solid ${theme.palette.divider}`,
    '&:last-child': {
      borderRight: 'none',
    },
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
    borderBottom: `2px solid ${theme.palette.divider}`,
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

interface RetentionData {
  cohort: string;
  size: number;
  data: {
    period: number;
    percentage: number;
    count: number;
  }[];
}

interface RetentionAnalysisProps {
  data: RetentionData[];
  loading?: boolean;
  title?: string;
  description?: string;
  maxPeriods?: number;
}

const RetentionAnalysis: React.FC<RetentionAnalysisProps> = ({
  data,
  loading = false,
  title = 'User Retention Analysis',
  description = 'Shows the percentage of users who return over time after their first visit.',
  maxPeriods = 6,
}) => {
  const theme = useTheme();
  
  // Generate period headers (Day 1, Day 7, Day 30, etc.)
  const periodHeaders = Array.from({ length: maxPeriods }, (_, i) => ({
    label: i === 0 ? 'Day 0' : `Day ${i * 7}`,
    value: i * 7,
  }));
  
  // Get the max retention percentage for the color scale
  const maxPercentage = Math.max(
    ...data.flatMap(cohort => cohort.data.map(d => d.percentage)),
    1 // Ensure at least 1% to avoid division by zero
  );
  
  // Function to get cell background color based on percentage
  const getCellBackground = (percentage: number) => {
    if (percentage === 0) return 'transparent';
    
    const opacity = Math.min(0.1 + (percentage / maxPercentage) * 0.9, 0.9);
    return `rgba(76, 175, 80, ${opacity})`; // Green scale
  };
  
  // Function to get text color based on background
  const getTextColor = (percentage: number) => {
    if (percentage === 0) return 'text.secondary';
    return percentage > maxPercentage * 0.5 ? 'common.white' : 'text.primary';
  };
  
  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          No retention data available
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          {title}
          <Tooltip title={description} arrow>
            <HelpOutline 
              fontSize="small" 
              color="action" 
              sx={{ ml: 1, verticalAlign: 'middle' }} 
            />
          </Tooltip>
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </Box>
      
      <TableContainer component={Paper} variant="outlined">
        <StyledTable size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cohort</TableCell>
              <TableCell align="right">Users</TableCell>
              {periodHeaders.map((header) => (
                <TableCell key={header.value} align="center">
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((cohort, index) => (
              <TableRow key={cohort.cohort} hover>
                <TableCell component="th" scope="row">
                  {cohort.cohort}
                </TableCell>
                <TableCell align="right">{cohort.size.toLocaleString()}</TableCell>
                {periodHeaders.map((header) => {
                  const periodData = cohort.data.find(d => d.period === header.value);
                  const percentage = periodData ? periodData.percentage : 0;
                  const count = periodData ? periodData.count : 0;
                  
                  return (
                    <TableCell 
                      key={header.value}
                      align="center"
                      sx={{
                        backgroundColor: getCellBackground(percentage),
                        color: getTextColor(percentage),
                        fontWeight: percentage > 0 ? 600 : 'normal',
                      }}
                    >
                      {percentage > 0 ? (
                        <Tooltip 
                          title={`${count.toLocaleString()} users (${formatPercentage(percentage)})`} 
                          arrow
                        >
                          <span>{formatPercentage(percentage)}</span>
                        </Tooltip>
                      ) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>
      
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Typography variant="caption" color="textSecondary">
          Hover over cells for detailed numbers
        </Typography>
      </Box>
      
      <Box mt={3}>
        <Typography variant="subtitle2" gutterBottom>
          How to read this table:
        </Typography>
        <Box component="ul" sx={{ pl: 2, '& li': { mb: 0.5 } }}>
          <li>
            <strong>Rows</strong> represent groups of users who started in the same time period (cohorts)
          </li>
          <li>
            <strong>Columns</strong> show what percentage of each cohort was active on subsequent days
          </li>
          <li>
            <strong>Darker cells</strong> indicate higher retention rates
          </li>
        </Box>
      </Box>
    </Box>
  );
};

export default RetentionAnalysis;
