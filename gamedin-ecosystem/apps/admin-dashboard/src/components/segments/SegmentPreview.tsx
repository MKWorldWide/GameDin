import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { UserSegment } from '../../types/segment';

interface UserPreview {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
  avatar?: string;
}

interface SegmentPreviewProps {
  segment: UserSegment;
  previewData?: {
    users: UserPreview[];
    total: number;
    loading: boolean;
    error: Error | null;
  };
  onRefresh: () => void;
  onClose: () => void;
  onViewUser: (userId: string) => void;
}

const SegmentPreview: React.FC<SegmentPreviewProps> = ({
  segment,
  previewData = { users: [], total: 0, loading: false, error: null },
  onRefresh,
  onClose,
  onViewUser,
}) => {
  const theme = useTheme();
  const { users, total, loading, error } = previewData;

  const getConditionText = (condition: any) => {
    const fieldMap: Record<string, string> = {
      'user.status': 'Status',
      'user.role': 'Role',
      'user.createdAt': 'Signup Date',
      'user.lastActive': 'Last Active',
      'user.email': 'Email',
      'user.country': 'Country',
      'user.subscription': 'Subscription',
      'user.device': 'Device',
      'user.browser': 'Browser',
      'user.os': 'OS',
    };

    const operatorMap: Record<string, string> = {
      equals: 'is',
      not_equals: 'is not',
      contains: 'contains',
      greater_than: 'is after',
      less_than: 'is before',
      in: 'is one of',
      not_in: 'is not one of',
    };

    const field = fieldMap[condition.field] || condition.field;
    const operator = operatorMap[condition.operator] || condition.operator;
    
    return `${field} ${operator} ${JSON.stringify(condition.value)}`;
  };

  return (
    <Card>
      <CardHeader
        title="Segment Preview"
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
        subheader={
          <Typography variant="body2" color="textSecondary">
            {total.toLocaleString()} users match this segment
          </Typography>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Segment Details
              </Typography>
              <Divider />
              <Box mt={2}>
                <Typography variant="body1">
                  <strong>Name:</strong> {segment.name}
                </Typography>
                {segment.description && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Description:</strong> {segment.description}
                  </Typography>
                )}
                {segment.tags && segment.tags.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body1" component="span">
                      <strong>Tags:</strong>{' '}
                    </Typography>
                    {segment.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Status:</strong>{' '}
                  <span
                    style={{
                      color: segment.isActive
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {segment.isActive ? 'Active' : 'Inactive'}
                  </span>
                </Typography>
              </Box>
            </Box>

            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Typography variant="subtitle1">Conditions</Typography>
                <Button
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={onRefresh}
                  disabled={loading}
                  sx={{ ml: 'auto' }}
                >
                  Refresh
                </Button>
              </Box>
              <Divider />
              <List dense>
                {segment.conditions.map((condition, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={`${index === 0 ? 'Where' : 'AND'}`}
                        primaryTypographyProps={{
                          variant: 'body2',
                          color: 'textSecondary',
                        }}
                      />
                      <Box sx={{ ml: 2, flexGrow: 1 }}>
                        <Typography variant="body2">
                          {getConditionText(condition)}
                        </Typography>
                      </Box>
                    </ListItem>
                    {index < segment.conditions.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="subtitle1">Matching Users</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({users.length} of {total.toLocaleString()} shown)
              </Typography>
            </Box>
            <Divider />
            
            {error ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <Typography color="error" gutterBottom>
                  Error loading preview: {error.message}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={onRefresh}
                  sx={{ mt: 2 }}
                >
                  Try Again
                </Button>
              </Box>
            ) : loading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
                textAlign="center"
                p={3}
              >
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  No users match the current segment conditions.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Try adjusting your conditions or check for typos.
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Active</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {user.avatar ? (
                              <Box
                                component="img"
                                src={user.avatar}
                                alt={user.name}
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  mr: 1,
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '50%',
                                  bgcolor: 'action.selected',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  mr: 1,
                                }}
                              >
                                <PersonIcon fontSize="small" color="action" />
                              </Box>
                            )}
                            <Box>
                              <Typography variant="body2" noWrap>
                                {user.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                                noWrap
                              >
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            size="small"
                            color={
                              user.status === 'active' ? 'success' : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {format(new Date(user.lastActive), 'MMM d, yyyy')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(user.lastActive), 'h:mm a')}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => onViewUser(user.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {total > users.length && (
              <Box mt={2} textAlign="center">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  Load More
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SegmentPreview;
