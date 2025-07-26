import React, { useState, useCallback } from 'react';
import { format, subDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { DateRange as MuiDateRange } from '@mui/lab/DateRangePicker';
import { TextField, Box, Popover, Button, Typography, Stack, IconButton } from '@mui/material';
import { DateRange as DateRangeIcon, Close as CloseIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Define the DateRange type for our component
export interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
}

// Predefined date range options
const QUICK_RANGES = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'This month', value: 'this_month' },
  { label: 'Last month', value: 'last_month' },
  { label: 'This year', value: 'this_year' },
];

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

// Parse date string to Date object
const parseDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Calculate date range based on quick range selection
const getDateRange = (range: string | number): { startDate: string; endDate: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (typeof range === 'number') {
    const startDate = subDays(today, range - 1);
    return {
      startDate: formatDate(startDate),
      endDate: formatDate(today),
    };
  }
  
  switch (range) {
    case 'this_month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(today),
      };
    }
    case 'last_month': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: formatDate(lastMonth),
        endDate: formatDate(endOfLastMonth),
      };
    }
    case 'this_year': {
      const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
      return {
        startDate: formatDate(firstDayOfYear),
        endDate: formatDate(today),
      };
    }
    default:
      return {
        startDate: formatDate(subDays(today, 29)), // Default to last 30 days
        endDate: formatDate(today),
      };
  }
};

// Styled components
const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    padding: theme.spacing(3),
    borderRadius: 12,
    boxShadow: theme.shadows[10],
    minWidth: 600,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90vw',
    },
  },
}));

const QuickRangeButton = styled(Button)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  padding: theme.spacing(1, 2),
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: selected ? 600 : 400,
  backgroundColor: selected 
    ? theme.palette.primary.light + '33' 
    : theme.palette.action.hover,
  color: selected 
    ? theme.palette.primary.main 
    : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const DateRangeDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  minWidth: 300,
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: string; // YYYY-MM-DD format
  maxDate?: string;  // YYYY-MM-DD format
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  minDate,
  maxDate = formatDate(new Date()), // Default max date is today
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [selectedRange, setSelectedRange] = useState<string | number>('30');
  const [dateRange, setDateRange] = useState<MuiDateRange<Date>>([
    value.startDate ? parseDate(value.startDate) : null,
    value.endDate ? parseDate(value.endDate) : null,
  ]);

  // Handle popover open
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle popover close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle quick range selection
  const handleQuickRangeSelect = (range: string | number) => {
    setSelectedRange(range);
    const newRange = getDateRange(range);
    setDateRange([parseDate(newRange.startDate), parseDate(newRange.endDate)]);
    onChange(newRange);
    handleClose();
  };

  // Handle custom date range selection
  const handleCustomRangeSelect = () => {
    if (dateRange[0] && dateRange[1]) {
      onChange({
        startDate: formatDate(dateRange[0]),
        endDate: formatDate(dateRange[1]),
      });
      setSelectedRange('custom');
      handleClose();
    }
  };

  // Format date range for display
  const formatDisplayDate = (dateStr: string) => {
    return format(parseDate(dateStr), 'MMM d, yyyy');
  };

  // Check if a date is disabled (before minDate or after maxDate)
  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, parseDate(minDate))) return true;
    if (maxDate && isAfter(date, parseDate(maxDate))) return true;
    return false;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'date-range-popover' : undefined;

  return (
    <>
      <DateRangeDisplay 
        aria-describedby={id}
        onClick={(e) => setAnchorEl(e.currentTarget as any)}
      >
        <DateRangeIcon color="action" sx={{ mr: 1 }} />
        <Box flex={1}>
          <Typography variant="body1">
            {formatDisplayDate(value.startDate)} - {formatDisplayDate(value.endDate)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {selectedRange === 'custom' ? 'Custom range' : `Last ${selectedRange} days`}
          </Typography>
        </Box>
      </DateRangeDisplay>
      
      <StyledPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Select Date Range</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>Quick Ranges</Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {QUICK_RANGES.map((range) => (
                <QuickRangeButton
                  key={range.label}
                  selected={selectedRange === range.value}
                  onClick={() => handleQuickRangeSelect(range.value)}
                >
                  {range.label}
                </QuickRangeButton>
              ))}
            </Box>
          </Box>
          
          <Box mb={3}>
            <Typography variant="subtitle2" gutterBottom>Custom Range</Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="caption" display="block" mb={0.5}>
                  Start Date
                </Typography>
                <TextField
                  type="date"
                  value={dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setDateRange([date, dateRange[1]]);
                    setSelectedRange('custom');
                  }}
                  inputProps={{
                    min: minDate,
                    max: maxDate,
                  }}
                  size="small"
                />
              </Box>
              
              <Box>
                <Typography variant="caption" display="block" mb={0.5}>
                  End Date
                </Typography>
                <TextField
                  type="date"
                  value={dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : null;
                    setDateRange([dateRange[0], date]);
                    setSelectedRange('custom');
                  }}
                  inputProps={{
                    min: minDate,
                    max: maxDate,
                  }}
                  size="small"
                />
              </Box>
              
              <Box alignSelf="flex-end" mb={0.5}>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleCustomRangeSelect}
                  disabled={!dateRange[0] || !dateRange[1]}
                >
                  Apply
                </Button>
              </Box>
            </Box>
            
            {dateRange[0] && dateRange[1] && (
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Selected: {formatDisplayDate(formatDate(dateRange[0]))} - {formatDisplayDate(formatDate(dateRange[1]))}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={handleClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleCustomRangeSelect}
              disabled={!dateRange[0] || !dateRange[1]}
            >
              Apply Date Range
            </Button>
          </Box>
        </Box>
      </StyledPopover>
    </>
  );
};

export default DateRangePicker;
