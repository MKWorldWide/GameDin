import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { UserSegment } from '../../types/segment';

interface SegmentListProps {
  segments: UserSegment[];
  selected: string[];
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (event: React.MouseEvent<unknown>, id: string) => void;
  onEdit: (segment: UserSegment) => void;
  onView: (segment: UserSegment) => void;
  onDelete: (segmentId: string) => void;
  onCreateNew: () => void;
  onSearch: (query: string) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalCount: number;
  loading: boolean;
  error: Error | null;
}

const SegmentList: React.FC<SegmentListProps> = ({
  segments,
  selected,
  onSelectAll,
  onSelect,
  onEdit,
  onView,
  onDelete,
  onCreateNew,
  onSearch,
  sortField,
  sortOrder,
  onSort,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalCount,
  loading,
  error,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const createSortHandler = (property: string) => () => {
    onSort(property);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - segments.length) : 0;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Error loading segments: {error.message}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(selected.length > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.main
                  : theme.palette.primary.dark,
              color: theme.palette.primary.contrastText,
            }),
          }}
        >
          {selected.length > 0 ? (
            <Typography
              sx={{ flex: '1 1 100%' }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {selected.length} selected
            </Typography>
          ) : (
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Segments
            </Typography>
          )}
          {selected.length > 0 ? (
            <Tooltip title="Delete">
              <IconButton
                onClick={() => {
                  // Handle bulk delete
                  selected.forEach((id) => onDelete(id));
                }}
                color="inherit"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search segments..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{ color: 'text.secondary', mr: 1, my: 0.5 }}
                    />
                  ),
                }}
                sx={{ mr: 2, minWidth: 250 }}
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateNew}
              >
                New Segment
              </Button>
            </>
          )}
        </Toolbar>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="segmentTable">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={
                      selected.length > 0 && selected.length < segments.length
                    }
                    checked={
                      segments.length > 0 && selected.length === segments.length
                    }
                    onChange={onSelectAll}
                    inputProps={{ 'aria-label': 'select all segments' }}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={createSortHandler('name')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell align="right">Users</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'updatedAt'}
                    direction={sortField === 'updatedAt' ? sortOrder : 'desc'}
                    onClick={createSortHandler('updatedAt')}
                  >
                    Last Updated
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : segments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      No segments found. Create your first segment to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                segments.map((segment) => {
                  const isItemSelected = isSelected(segment.id);
                  const labelId = `segment-checkbox-${segment.id}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={segment.id}
                      selected={isItemSelected}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                          onClick={(event) => onSelect(event, segment.id)}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        onClick={() => onView(segment)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" fontWeight="medium">
                            {segment.name}
                          </Typography>
                          {!segment.isActive && (
                            <Chip
                              label="Inactive"
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: 'grey.200',
                                color: 'text.secondary',
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell
                        onClick={() => onView(segment)}
                        sx={{
                          maxWidth: 300,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {segment.description || 'No description'}
                      </TableCell>
                      <TableCell onClick={() => onView(segment)}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {segment.tags.slice(0, 2).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          ))}
                          {segment.tags.length > 2 && (
                            <Chip
                              label={`+${segment.tags.length - 2}`}
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell
                        align="right"
                        onClick={() => onView(segment)}
                      >
                        {segment.userCount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell onClick={() => onView(segment)}>
                        {format(new Date(segment.updatedAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View">
                            <IconButton
                              size="small"
                              onClick={() => onView(segment)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(segment);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(segment.id);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Paper>
    </Box>
  );
};

export default SegmentList;
