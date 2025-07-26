import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useFormik, FormikHelpers } from 'formik';

// MUI Components
import {
  Box,
  Button,
  TextField,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Paper,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';

// Icons
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  FileCopy as FileCopyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

// Form and validation
import { Formik, Form, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';

// Types and components
import { ConditionGroup, UserSegment, SegmentCondition } from './types';
import ConditionBuilder from './ConditionBuilder';
import SegmentCondition from './SegmentCondition';
import SegmentPreview from './SegmentPreview';

// Default condition group for new segments
const DEFAULT_CONDITION_GROUP: ConditionGroup = {
  id: uuidv4(),
  type: 'custom',
  isGroup: true,
  logicalOperator: 'AND',
  conditions: [],
};

// Mock API service - replace with actual API calls
const segmentApi = {
  createSegment: async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Simulate API call
    return new Promise<UserSegment>((resolve) => {
      setTimeout(() => {
        const now = new Date().toISOString();
        resolve({
          ...segment,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
          isSystem: false,
          createdBy: 'current-user',
          updatedBy: 'current-user',
          metadata: {},
        });
      }, 1000);
    });
  },
  
  updateSegment: async (id: string, updates: Partial<UserSegment>) => {
    // Simulate API call
    return new Promise<UserSegment>((resolve) => {
      setTimeout(() => {
        resolve({
          ...updates as UserSegment,
          id,
          updatedAt: new Date().toISOString(),
          updatedBy: 'current-user',
        });
      }, 1000);
    });
  },
  
  deleteSegment: async (id: string) => {
    // Simulate API call
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  },
  
  previewSegment: async (conditions: any) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalUsers: 1000,
          matchingUsers: 250,
          sampleUsers: Array(5).fill(null).map((_, i) => ({
            id: `user-${i + 1}`,
            email: `user${i + 1}@example.com`,
            name: `User ${i + 1}`,
            lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          })),
        });
      }, 1000);
    });
  },
};

// Validation schema for the segment form
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Segment name is required'),
  filter: Yup.object()
    .shape({
      isGroup: Yup.boolean().required(),
      logicalOperator: Yup.string().when('isGroup', {
        is: true,
        then: Yup.string().required('Logical operator is required'),
        otherwise: Yup.string().notRequired(),
      }),
      conditions: Yup.array().when('isGroup', {
        is: true,
        then: Yup.array().min(1, 'At least one condition is required'),
        otherwise: Yup.array().notRequired(),
      }),
    })
    .required('Filter conditions are required')
    .test(
      'has-conditions',
      'At least one condition is required',
      (value) => {
        if (!value) return false;
        if (!value.isGroup) return true;
        return (value.conditions || []).length > 0;
      }
    ),
  description: Yup.string(),
  isActive: Yup.boolean(),
  tags: Yup.array().of(Yup.string()),
});

interface SegmentEditorProps {
  segment?: UserSegment;
  onSave?: (segment: UserSegment) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (segment: UserSegment) => void;
  onCancel?: () => void;
  isNew?: boolean;
}

type SegmentFormValues = Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt' | 'isSystem' | 'createdBy' | 'updatedBy' | 'metadata' | 'version' | 'userCount'> & {
  filter: ConditionGroup;
};

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segment: initialSegment,
  onSave: externalOnSave,
  onDelete: externalOnDelete,
  onDuplicate: externalOnDuplicate,
  onCancel: externalOnCancel,
  isNew = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState('conditions');
  // Form submission state is managed by Formik
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    totalUsers: number;
    matchingUsers: number;
    sampleUsers: Array<{
      id: string;
      email: string;
      name: string;
      lastActive: string;
    }>;
  } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Handle form submission
  const handleSubmit = useCallback(async (
    values: SegmentFormValues,
    { setSubmitting }: FormikHelpers<SegmentFormValues>
  ) => {
    try {
      // Ensure we have a valid filter with at least one condition
      if (!values.filter || (values.filter.isGroup && !(values.filter.conditions?.length))) {
        showSnackbar('Please add at least one condition', { variant: 'error' });
        return;
      }

      const segmentData: UserSegment = {
        ...values,
        id: initialSegment?.id || uuidv4(),
        userCount: 0, // Will be updated by the backend
        updatedAt: new Date().toISOString(),
        createdAt: initialSegment?.createdAt || new Date().toISOString(),
        isSystem: false,
        createdBy: 'current-user-id', // Replace with actual user ID
        updatedBy: 'current-user-id', // Replace with actual user ID
        metadata: {},
        version: 1,
      };

      if (initialSegment?.id) {
        // Update existing segment
        const updatedSegment = await segmentApi.updateSegment(initialSegment.id, segmentData);
        showSnackbar('Segment updated successfully', { variant: 'success' });
        externalOnSave?.(updatedSegment);
      } else {
        // Create new segment
        const newSegment = await segmentApi.createSegment(segmentData);
        showSnackbar('Segment created successfully', { variant: 'success' });
        externalOnSave?.(newSegment);
      }
    } catch (error) {
      console.error('Error saving segment:', error);
      showSnackbar('Failed to save segment', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  }, [initialSegment, externalOnSave, showSnackbar]);

  // Initialize form with formik
  const formik = useFormik<SegmentFormValues>({
    initialValues: useMemo(
      () => ({
        name: initialSegment?.name || '',
        description: initialSegment?.description || '',
        filter: initialSegment?.filter || { ...DEFAULT_CONDITION_GROUP },
        isActive: initialSegment?.isActive ?? true,
        tags: initialSegment?.tags || [],
      }),
      [initialSegment]
    ),
    validationSchema: validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true,
  });



  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  // Handle condition updates from the ConditionBuilder
  const handleFilterChange = useCallback((updatedFilter: ConditionGroup) => {
    formik.setFieldValue('filter', updatedFilter, false);
  }, [formik]);

  // Render the conditions builder
  const renderConditions = () => (
    <Box>
      <ConditionBuilder
        condition={formik.values.filter}
        onUpdate={handleFilterChange}
        onRemove={() => {}}
        isRoot={true}
      />
      
      <Box mt={2}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            const newCondition = {
              id: uuidv4(),
              type: 'user',
              attribute: 'email',
              operator: 'equals',
              value: '',
              isGroup: false,
            };
            
            formik.setFieldValue('filter', {
              ...formik.values.filter,
              conditions: [...(formik.values.filter.conditions || []) as SegmentCondition[], newCondition as SegmentCondition],
            });
          }}
        >
          Add Condition
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {
            const newGroup: ConditionGroup = {
              id: uuidv4(),
              type: 'group',
              isGroup: true,
              logicalOperator: 'AND',
              conditions: [
                {
                  id: uuidv4(),
                  type: 'user',
                  attribute: 'email',
                  operator: 'equals',
                  value: '',
                  isGroup: false,
                },
              ],
            };
            
            formik.setFieldValue('filter', {
              ...formik.values.filter,
              conditions: [...(formik.values.filter.conditions || []), newGroup],
            });
          }}
          sx={{ ml: 2 }}
        >
          Add Group
        </Button>
      </Box>
    </Box>
  );

  // Default condition group
  const DEFAULT_CONDITION_GROUP: ConditionGroup = {
    id: uuidv4(),
    type: 'group',
    isGroup: true,
    logicalOperator: 'AND',
    conditions: [
      {
        id: uuidv4(),
        type: 'user',
        isGroup: false,
        attribute: 'email',
        operator: 'equals',
        value: '',
      } as const,
    ],
  };

  // Handle preview button click
  const handlePreview = async () => {
    try {
      setIsPreviewLoading(true);
      const data = await segmentApi.previewSegment(formik.values.filter);
      setPreviewData(data);
      setActiveTab('preview');
    } catch (error) {
      console.error('Error previewing segment:', error);
      showSnackbar('Failed to preview segment', 'error');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!initialSegment?.id) return;
    
    try {
      setIsDeleting(true);
      await segmentApi.deleteSegment(initialSegment.id);
      
      if (externalOnDelete) {
        externalOnDelete(initialSegment.id);
      } else {
        // Navigate to segments list if no external handler provided
        navigate('/analytics/segments');
      }
      
      showSnackbar('Segment deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting segment:', error);
      showSnackbar('Failed to delete segment. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Handle duplicate button click
  const handleDuplicate = () => {
    if (!initialSegment) return;
    
    const duplicatedSegment = {
      ...initialSegment,
      id: uuidv4(),
      name: `${initialSegment.name} (Copy)`,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    if (externalOnDuplicate) {
      externalOnDuplicate(duplicatedSegment);
    } else {
      // Navigate to new segment if no external handler provided
      navigate(`/analytics/segments/${duplicatedSegment.id}/edit`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (externalOnCancel) {
      externalOnCancel();
    } else {
      navigate(-1); // Go back
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    if (!initialSegment) return true;
    
    return (
      formik.values.name !== initialSegment.name ||
      formik.values.description !== initialSegment.description ||
      JSON.stringify(formik.values.filter) !== JSON.stringify(initialSegment.filter) ||
      formik.values.isActive !== initialSegment.isActive ||
      JSON.stringify(formik.values.tags) !== JSON.stringify(initialSegment.tags)
    );
  };

  // Render settings tab
  const renderSettingsTab = () => (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Segment Settings
      </Typography>
      
      <TextField
        fullWidth
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.description && Boolean(formik.errors.description)}
        helperText={formik.touched.description && formik.errors.description}
        margin="normal"
        multiline
        rows={3}
      />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="tags-label">Tags</InputLabel>
        <Select
          labelId="tags-label"
          id="tags"
          multiple
          value={formik.values.tags}
          onChange={(e) => formik.setFieldValue('tags', e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} size="small" />
              ))}
            </Box>
          )}
        >
          {['VIP', 'Inactive', 'High Value', 'New User', 'At Risk'].map((tag) => (
            <MenuItem key={tag} value={tag}>
              {tag}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.isActive}
            onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
            name="isActive"
            color="primary"
          />
        }
        label={formik.values.isActive ? 'Active' : 'Inactive'}
        sx={{ mt: 2 }}
      />
      
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
        Advanced Settings
      </Typography>
      
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.isSystem || false}
            onChange={(e) => formik.setFieldValue('isSystem', e.target.checked)}
            name="isSystem"
            color="primary"
            disabled={!isNew} // Only allow setting system flag on creation
          />
        }
        label="System Segment"
        sx={{ mb: 1 }}
      />
      
      <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
        System segments are managed by the application and cannot be modified or deleted by users.
      </Typography>
      
      {!isNew && initialSegment && (
        <Box mt={4} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Segment ID: {initialSegment.id}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Created: {new Date(initialSegment.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Last Updated: {new Date(initialSegment.updatedAt).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Created By: {initialSegment.createdBy || 'System'}
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Tooltip title="Back">
                <IconButton onClick={handleCancel} size="small" sx={{ mr: 1 }}>
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="h6">
                {isNew ? 'Create Segment' : 'Edit Segment'}
              </Typography>
            </Box>
            <Box>
              {!isNew && (
                <>
                  <Tooltip title="Duplicate">
                    <IconButton
                      size="small"
                      onClick={handleDuplicate}
                      sx={{ mr: 1 }}
                      disabled={isSubmitting || isDeleting}
                    >
                      <FileCopyIcon />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={handleDeleteClick}
                      color="error"
                      sx={{ mr: 1 }}
                      disabled={isSubmitting || isDeleting || formik.values.isSystem}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={() => formik.handleSubmit()}
                disabled={isSubmitting || isDeleting || (!isNew && !hasChanges())}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                textTransform: 'none',
                minWidth: 'auto',
                px: 2,
                mr: 1,
              },
            }}
          >
            <Tab label="Conditions" value="conditions" />
            <Tab 
              label="Preview" 
              value="preview" 
              disabled={formik.values.filter.conditions?.length === 0}
            />
            <Tab label="Settings" value="settings" />
          </Tabs>
        </Box>
        
        {/* Content */}
        <Box flex={1} overflow="auto" p={3}>
          {activeTab === 'conditions' && renderConditionsTab()}
          
          {activeTab === 'preview' && previewData && (
            <SegmentPreview
              totalUsers={previewData.totalUsers}
              matchedUsers={previewData.matchedUsers}
              matchRate={previewData.matchRate}
              sampleUsers={previewData.sampleUsers}
              loading={isPreviewLoading}
              onRefresh={handlePreview}
              onExport={() => {
                // TODO: Implement export functionality
                showSnackbar('Export functionality coming soon!', 'info');
              }}
            />
          )}
          
          {activeTab === 'settings' && renderSettingsTab()}
        </Box>
        
        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            {activeTab === 'conditions' && formik.values.filter.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={isPreviewLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={handlePreview}
                disabled={isPreviewLoading || formik.values.filter.length === 0}
              >
                {isPreviewLoading ? 'Updating Preview...' : 'Update Preview'}
              </Button>
            )}
          </Box>
          
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={() => formik.handleSubmit()}
              disabled={isSubmitting || isDeleting || (!isNew && !hasChanges())}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Segment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the segment "{formik.values.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SegmentEditor;
