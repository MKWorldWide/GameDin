import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  alpha,
  Skeleton,
  Button,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FilterListOff as FilterListOffIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Share as ShareIcon,
  FileCopy as FileCopyIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TableChart as TableChartIcon,
  Map as MapIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Mail as MailIcon,
  Favorite as FavoriteIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  CameraAlt as CameraAltIcon,
  Image as ImageIcon,
  MusicNote as MusicNoteIcon,
  Movie as MovieIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Cloud as CloudIcon,
  CloudQueue as CloudQueueIcon,
  CloudOff as CloudOffIcon,
  CloudDone as CloudDoneIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { UserSegment } from './types';

interface SegmentListProps {
  segments: UserSegment[];
  selectedSegmentId?: string | null;
  loading?: boolean;
  error?: string | null;
  onSelectSegment: (segment: UserSegment) => void;
  onCreateSegment: () => void;
  onEditSegment: (segment: UserSegment) => void;
  onDeleteSegment: (segmentId: string) => void;
  onDuplicateSegment: (segment: UserSegment) => void;
  onToggleActive: (segmentId: string, isActive: boolean) => void;
  onRefresh: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode?: 'list' | 'grid' | 'table';
  onViewModeChange?: (mode: 'list' | 'grid' | 'table') => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  filter?: Record<string, any>;
  onFilterChange?: (filter: Record<string, any>) => void;
  emptyState?: React.ReactNode;
  showActions?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showViewToggle?: boolean;
  showStatus?: boolean;
  showUserCount?: boolean;
  showLastUpdated?: boolean;
  showTags?: boolean;
  showFavorites?: boolean;
  onToggleFavorite?: (segmentId: string, isFavorite: boolean) => void;
  favorites?: string[];
  className?: string;
  style?: React.CSSProperties;
}

const SegmentList: React.FC<SegmentListProps> = ({
  segments = [],
  selectedSegmentId,
  loading = false,
  error = null,
  onSelectSegment,
  onCreateSegment,
  onEditSegment,
  onDeleteSegment,
  onDuplicateSegment,
  onToggleActive,
  onRefresh,
  searchQuery = '',
  onSearchChange,
  viewMode = 'list',
  onViewModeChange,
  sortBy = 'updatedAt',
  sortDirection = 'desc',
  onSortChange,
  filter = {},
  onFilterChange,
  emptyState = null,
  showActions = true,
  showSearch = true,
  showFilters = true,
  showSort = true,
  showViewToggle = true,
  showStatus = true,
  showUserCount = true,
  showLastUpdated = true,
  showTags = true,
  showFavorites = true,
  onToggleFavorite,
  favorites = [],
  className = '',
  style = {},
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    segment: UserSegment | null;
  } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleContextMenu = (event: React.MouseEvent, segment: UserSegment) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            segment,
          }
        : null,
    );
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMenuClick = (action: string, segment: UserSegment) => {
    switch (action) {
      case 'edit':
        onEditSegment(segment);
        break;
      case 'duplicate':
        onDuplicateSegment(segment);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${segment.name}"?`)) {
          onDeleteSegment(segment.id);
        }
        break;
      case 'toggleActive':
        onToggleActive(segment.id, !segment.isActive);
        break;
      case 'toggleFavorite':
        if (onToggleFavorite) {
          onToggleFavorite(segment.id, !favorites.includes(segment.id));
        }
        break;
      default:
        break;
    }
    handleCloseContextMenu();
  };

  const filteredSegments = useMemo(() => {
    let result = [...segments];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (segment) =>
          segment.name.toLowerCase().includes(query) ||
          segment.description?.toLowerCase().includes(query) ||
          segment.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply filters
    if (filter.status) {
      result = result.filter((segment) =>
        filter.status === 'active' ? segment.isActive : !segment.isActive,
      );
    }

    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        let aValue = a[sortBy as keyof UserSegment];
        let bValue = b[sortBy as keyof UserSegment];

        // Handle nested properties if needed
        if (sortBy === 'userCount') {
          aValue = a.userCount;
          bValue = b.userCount;
        }

        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (aValue instanceof Date && bValue instanceof Date) {
          return sortDirection === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        return 0;
      });
    }

    return result;
  }, [segments, searchQuery, filter, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (!onSortChange) return;
    
    if (sortBy === field) {
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const renderSortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return (
      <SortIcon
        fontSize="small"
        sx={{
          transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          ml: 0.5,
        }}
      />
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    
    if (emptyState) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
          textAlign="center"
          height="100%"
          minHeight={300}
        >
          {emptyState}
        </Box>
      );
    }

    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        textAlign="center"
        height="100%"
        minHeight={300}
      >
        <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No segments found
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {searchQuery
            ? 'No segments match your search. Try a different query.'
            : 'Create your first segment to get started'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onCreateSegment}
          sx={{ mt: 2 }}
        >
          Create Segment
        </Button>
      </Box>
    );
  };

  const renderLoadingSkeletons = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <ListItem key={index} disablePadding>
        <ListItemButton>
          <ListItemIcon>
            <Skeleton variant="circular" width={40} height={40} />
          </ListItemIcon>
          <ListItemText
            primary={<Skeleton variant="text" width="60%" />}
            secondary={<Skeleton variant="text" width="40%" />}
          />
          <ListItemSecondaryAction>
            <Skeleton variant="circular" width={24} height={24} />
          </ListItemSecondaryAction>
        </ListItemButton>
      </ListItem>
    ));
  };

  const renderSegmentItem = (segment: UserSegment) => {
    const isSelected = selectedSegmentId === segment.id;
    const isFavorite = favorites.includes(segment.id);
    const updatedAt = new Date(segment.updatedAt);
    const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });

    return (
      <ListItem
        key={segment.id}
        disablePadding
        onContextMenu={(e) => handleContextMenu(e, segment)}
        sx={{
          mb: 1,
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.08)
            : 'background.paper',
          border: `1px solid ${
            isSelected
              ? theme.palette.primary.main
              : theme.palette.divider
          }`,
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: isSelected
              ? theme.palette.primary.main
              : theme.palette.text.secondary,
            boxShadow: theme.shadows[1],
          },
        }}
      >
        <ListItemButton
          onClick={() => onSelectSegment(segment)}
          selected={isSelected}
          sx={{
            py: 1.5,
            px: 2,
            '&.Mui-selected': {
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: segment.isActive
                  ? theme.palette.success.main
                  : theme.palette.grey[400],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 20,
              }}
            >
              {segment.name.charAt(0).toUpperCase()}
            </Box>
          </ListItemIcon>
          <ListItemText
            primary={
              <Box
                display="flex"
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    fontWeight: 500,
                    maxWidth: 200,
                  }}
                >
                  {segment.name}
                </Typography>
                {segment.isSystem && (
                  <Chip
                    label="System"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            }
            secondary={
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{
                    maxWidth: 300,
                    display: 'block',
                  }}
                >
                  {segment.description || 'No description'}
                </Typography>
                {showTags && segment.tags && segment.tags.length > 0 && (
                  <Box display="flex" flexWrap="wrap" gap={0.5} mt={0.5}>
                    {segment.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {segment.tags.length > 3 && (
                      <Chip
                        label={`+${segment.tags.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                )}
              </Box>
            }
            sx={{ my: 0 }}
          />
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            ml={2}
            sx={{ minWidth: 120 }}
          >
            {showUserCount && (
              <Chip
                label={`${segment.userCount.toLocaleString()} users`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            )}
            {showLastUpdated && (
              <Typography variant="caption" color="text.secondary">
                {timeAgo}
              </Typography>
            )}
          </Box>
          {showFavorites && onToggleFavorite && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(segment.id, !isFavorite);
              }}
              sx={{ ml: 1 }}
            >
              {isFavorite ? (
                <StarIcon color="warning" />
              ) : (
                <StarBorderIcon />
              )}
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(e.currentTarget);
              setContextMenu({
                mouseX: e.clientX - 2,
                mouseY: e.clientY - 4,
                segment,
              });
            }}
          >
            <MoreVertIcon />
          </IconButton>
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        ...style,
      }}
      className={className}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Segments</Typography>
          <Box display="flex" gap={1}>
            {showViewToggle && onViewModeChange && (
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    onViewModeChange(newMode);
                  }
                }}
                aria-label="View mode"
              >
                <ToggleButton value="list" size="small">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="grid" size="small">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="table" size="small">
                  <TableRowsIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onCreateSegment}
              size="small"
            >
              New Segment
            </Button>
          </Box>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap">
          {showSearch && (
            <TextField
              placeholder="Search segments..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => onSearchChange('')}
                      edge="end"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 400 }}
            />
          )}
          {showFilters && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<FilterListIcon />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ ml: 'auto' }}
            >
              Filters
            </Button>
          )}
          <IconButton size="small" onClick={onRefresh}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box flex={1} overflow="auto" p={2}>
        {loading && segments.length === 0 ? (
          <List disablePadding>{renderLoadingSkeletons()}</List>
        ) : filteredSegments.length === 0 ? (
          renderEmptyState()
        ) : (
          <List disablePadding>
            {filteredSegments.map((segment) => renderSegmentItem(segment))}
          </List>
        )}
      </Box>
      <Menu
        anchorEl={contextMenu?.segment ? null : anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <FilterListIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Filter by Status</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <ListItemIcon>
            <SortIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sort by Name</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onRefresh}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
      </Menu>
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {contextMenu?.segment && (
          <>
            <MenuItem
              onClick={() =>
                handleMenuClick('toggleActive', contextMenu.segment!)
              }
            >
              <ListItemIcon>
                {contextMenu.segment.isActive ? (
                  <CancelIcon fontSize="small" color="error" />
                ) : (
                  <CheckCircleIcon fontSize="small" color="success" />
                )}
              </ListItemIcon>
              <ListItemText>
                {contextMenu.segment.isActive ? 'Deactivate' : 'Activate'}
              </ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuClick('edit', contextMenu.segment!)}
            >
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleMenuClick('duplicate', contextMenu.segment!)}
            >
              <ListItemIcon>
                <FileCopyIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate</ListItemText>
            </MenuItem>
            {showFavorites && onToggleFavorite && (
              <MenuItem
                onClick={() =>
                  handleMenuClick('toggleFavorite', contextMenu.segment!)
                }
              >
                <ListItemIcon>
                  {favorites.includes(contextMenu.segment.id) ? (
                    <StarIcon color="warning" fontSize="small" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {favorites.includes(contextMenu.segment.id)
                    ? 'Remove from Favorites'
                    : 'Add to Favorites'}
                </ListItemText>
              </MenuItem>
            )}
            <Divider />
            <MenuItem
              onClick={() => handleMenuClick('delete', contextMenu.segment!)}
              sx={{ color: 'error.main' }}
            >
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  );
};

export default SegmentList;
