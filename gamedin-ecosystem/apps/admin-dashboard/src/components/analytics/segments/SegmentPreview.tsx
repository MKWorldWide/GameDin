import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
  Chip,
  useTheme,
  Tooltip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastActive: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  role: string;
  country: string;
  device: string;
  sessions: number;
  totalSpend: number;
}

interface SegmentPreviewProps {
  totalUsers: number;
  matchedUsers: number;
  matchRate: number;
  sampleUsers: User[];
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

const SegmentPreview: React.FC<SegmentPreviewProps> = ({
  totalUsers,
  matchedUsers,
  matchRate,
  sampleUsers = [],
  loading = false,
  onRefresh,
  onExport,
}) => {
  const theme = useTheme();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState<keyof User>('name');
  const [order, setOrder] = React.useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = sampleUsers.map((user) => user.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Sort users
  const sortedUsers = React.useMemo(() => {
    return [...sampleUsers].sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });
  }, [sampleUsers, order, orderBy]);

  // Filter users by search term
  const filteredUsers = React.useMemo(() => {
    if (!searchTerm) return sortedUsers;
    
    const term = searchTerm.toLowerCase();
    return sortedUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.country.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term) ||
        user.device.toLowerCase().includes(term)
    );
  }, [sortedUsers, searchTerm]);

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
      if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
      return `${Math.floor(diffInSeconds / 31536000)}y ago`;
    } catch (e) {
      return '';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Calculate match percentage
  const matchPercentage = totalUsers > 0 ? Math.round((matchedUsers / totalUsers) * 100) : 0;

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Users in Segment
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h4" fontWeight="bold">
                {formatNumber(matchedUsers)}
              </Typography>
              <Chip
                label={`${matchRate}% match rate`}
                color="primary"
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Box mt={1}>
              <Typography variant="caption" color="textSecondary">
                out of {formatNumber(totalUsers)} total users
              </Typography>
            </Box>
            <Box mt={2}>
              <LinearProgress
                variant="determinate"
                value={matchPercentage > 100 ? 100 : matchPercentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Segment Size
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {matchPercentage < 0.01 ? '<0.01' : matchPercentage}%
            </Typography>
            <Typography variant="caption" color="textSecondary">
              of total user base
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                This segment represents a {matchPercentage < 10 ? 'small' : matchPercentage < 30 ? 'moderate' : 'large'}{' '}
                portion of your user base.
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <div>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Sample Users
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {sampleUsers.length}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  showing {Math.min(rowsPerPage, sampleUsers.length)} of {sampleUsers.length}
                </Typography>
              </div>
              <Box>
                <Tooltip title="Refresh">
                  <IconButton size="small" onClick={onRefresh} disabled={loading}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box mt={2}>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={onExport}
                disabled={loading || sampleUsers.length === 0}
              >
                Export All Users
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* User Table */}
      <Paper variant="outlined" sx={{ mb: 3 }}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="medium">
            Sample Users
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: 250 }}
            />
            <Tooltip title="Filter">
              <IconButton size="small">
                <FilterListIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Divider />
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={selected.length > 0 && selected.length < sampleUsers.length}
                    checked={sampleUsers.length > 0 && selected.length === sampleUsers.length}
                    onChange={handleSelectAllClick}
                    inputProps={{ 'aria-label': 'select all users' }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    User
                    {orderBy === 'name' ? (
                      <span style={{ display: 'none' }}>
                        {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Last Active</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Sessions</TableCell>
                <TableCell align="right">Total Spend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Loading users...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      color="text.secondary"
                    >
                      <PersonIcon fontSize="large" />
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        No users found
                      </Typography>
                      <Typography variant="body2">
                        {searchTerm ? 'Try a different search term' : 'No users match this segment'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => {
                  const isItemSelected = isSelected(user.id);
                  const labelId = `user-checkbox-${user.id}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={user.id}
                      selected={isItemSelected}
                      onClick={() => handleClick(user.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        <Box display="flex" alignItems="center">
                          <Avatar
                            src={user.avatar}
                            alt={user.name}
                            sx={{ width: 32, height: 32, mr: 2 }}
                          >
                            {user.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(user.status)}
                          size="small"
                          color={getStatusColor(user.status)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={new Date(user.lastActive).toLocaleString()}>
                          <span>{formatTimeAgo(user.lastActive)}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{formatDate(user.joinDate)}</TableCell>
                      <TableCell>{user.sessions}</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <Typography variant="body2" fontWeight="medium">
                            ${user.totalSpend.toFixed(2)}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-toolbar': {
              minHeight: 52,
            },
          }}
        />
      </Paper>
      
      {/* User Distribution */}
      <Typography variant="subtitle1" gutterBottom>
        User Distribution
      </Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              By Status
            </Typography>
            <Box height={200}>
              {/* Placeholder for status distribution chart */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="text.secondary"
                border={`1px dashed ${theme.palette.divider}`}
                borderRadius={1}
              >
                <Typography>Status distribution chart</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              By Role
            </Typography>
            <Box height={200}>
              {/* Placeholder for role distribution chart */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                height="100%"
                color="text.secondary"
                border={`1px dashed ${theme.palette.divider}`}
                borderRadius={1}
              >
                <Typography>Role distribution chart</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" mt={2} mb={4}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          onClick={() => {}}
          sx={{ mr: 2 }}
        >
          Save Segment
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SendIcon />}
          onClick={() => {}}
        >
          Send to {selected.length > 0 ? selected.length : 'All'} Users
        </Button>
      </Box>
    </Box>
  );
};

export default SegmentPreview;
