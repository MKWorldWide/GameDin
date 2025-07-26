import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Skeleton,
  useTheme,
  TableSortLabel,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon, 
  Refresh as RefreshIcon,
  Add as AddIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';

// Mock data for demonstration
const mockUsers = Array.from({ length: 20 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? 'admin' : i % 2 === 0 ? 'moderator' : 'user',
  status: i % 5 === 0 ? 'inactive' : 'active',
  lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
  avatar: i % 4 === 0 ? `https://i.pravatar.cc/150?img=${i % 70}` : undefined,
  emailVerified: i % 3 !== 0,
}));

// Define table columns
const columns = [
  { id: 'name', label: 'User', sortable: true },
  { id: 'email', label: 'Email', sortable: true },
  { id: 'role', label: 'Role', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'lastLogin', label: 'Last Login', sortable: true },
  { id: 'createdAt', label: 'Member Since', sortable: true },
];

// Format date to a readable format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Get status color based on status
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
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

// Get role color based on role
const getRoleColor = (role: string) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'primary';
    case 'moderator':
      return 'secondary';
    case 'user':
      return 'default';
    default:
      return 'default';
  }
};

const UsersPage: React.FC = () => {
  const theme = useTheme();
  
  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // State for sorting
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Fetch users data
  const { 
    data: usersData, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return { 
        users: mockUsers,
        total: mockUsers.length,
        page: 1,
        limit: 100,
      };
    },
  });
  
  // Handle request sort
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle change page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle change rows per page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Handle role filter change
  const handleRoleFilterChange = (event: SelectChangeEvent) => {
    setRoleFilter(event.target.value);
    setPage(0);
  };
  
  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Filter and sort users
  const filteredUsers = usersData?.users
    ?.filter((user: any) => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a: any, b: any) => {
      let comparison = 0;
      
      if (orderBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (orderBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (orderBy === 'role') {
        comparison = a.role.localeCompare(b.role);
      } else if (orderBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (orderBy === 'lastLogin') {
        comparison = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
      } else if (orderBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return order === 'asc' ? comparison : -comparison;
    }) || [];
  
  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Empty rows for pagination
  const emptyRows = 
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredUsers.length) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          User Management
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => {}}
            sx={{ mr: 1 }}
          >
            Add User
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={toggleFilters}
              color={showFilters ? 'primary' : 'inherit'}
            >
              Filters
            </Button>
          </Box>
        </Box>
        
        {/* Advanced Filters */}
        {showFilters && (
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Advanced Filters
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  input={<OutlinedInput label="Role" />}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="moderator">Moderator</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
              
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => {
                  setRoleFilter('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                sx={{ ml: 'auto' }}
              >
                Clear Filters
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Users Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ p: 3 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={53} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">
              Failed to load users. Please try again.
            </Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => refetch()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        sortDirection={orderBy === column.id ? order : false}
                        sx={{
                          fontWeight: 'bold',
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        {column.sortable ? (
                          <TableSortLabel
                            active={orderBy === column.id}
                            direction={orderBy === column.id ? order : 'asc'}
                            onClick={() => handleRequestSort(column.id)}
                          >
                            {column.label}
                          </TableSortLabel>
                        ) : (
                          column.label
                        )}
                      </TableCell>
                    ))}
                    <TableCell sx={{ width: 100 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedUsers.map((user: any) => (
                    <TableRow 
                      hover 
                      key={user.id}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={user.avatar} 
                            alt={user.name}
                            sx={{ width: 36, height: 36, mr: 2 }}
                          >
                            {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          size="small"
                          color={getRoleColor(user.role) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          size="small"
                          color={getStatusColor(user.status) as any}
                          variant="filled"
                          sx={{ 
                            color: 'white',
                            fontWeight: 500,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={new Date(user.lastLogin).toLocaleString()}>
                          <Typography variant="body2">
                            {formatDate(user.lastLogin)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={new Date(user.createdAt).toLocaleString()}>
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Button size="small" color="primary">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={columns.length + 1} />
                    </TableRow>
                  )}
                  
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <PersonAddIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                          <Typography variant="subtitle1" color="textSecondary">
                            No users found
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                            Try adjusting your search or filter criteria
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Table Pagination */}
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
                  minHeight: 56,
                },
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default UsersPage;
