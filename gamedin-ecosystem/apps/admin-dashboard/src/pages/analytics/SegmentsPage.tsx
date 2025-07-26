import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Add as AddIcon, Error as ErrorIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useSnackbar } from 'notistack';

// Import hooks
import { 
  useSegments, 
  useCreateSegment, 
  useUpdateSegment, 
  useDeleteSegment, 
  usePreviewSegment, 
  useSegmentTemplates,
  useSaveAsTemplate 
} from '../../hooks/useSegments';

// Import components
import { PageHeader } from '../../components/PageHeader';
import { ErrorAlert } from '../../components/ErrorAlert';
import { SegmentEditor } from '../../components/analytics/segments/SegmentEditor';
import { SegmentList } from '../../components/analytics/segments/SegmentList';
import { SegmentPreview } from '../../components/analytics/segments/SegmentPreview';

// Types
export interface UserSegment {
  id: string;
  name: string;
  description: string;
  tags: string[];
  conditions: any[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface SegmentsPageProps {
  // Add any props here if needed
}

const SegmentsPage: React.FC<SegmentsPageProps> = () => {
  // State management
  const [showEditor, setShowEditor] = useState(false);
  const [currentSegment, setCurrentSegment] = useState<UserSegment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [segmentToDelete, setSegmentToDelete] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Hooks
  const { enqueueSnackbar } = useSnackbar();

  // Data fetching
  const { 
    data: segments = [], 
    isLoading, 
    error, 
    refetch: refetchSegments 
  } = useSegments();

  // Preview mutation
  const { 
    mutate: previewSegment, 
    data: previewData, 
    isLoading: isPreviewLoading, 
    error: previewError
  } = usePreviewSegment();

  // Template data
  const { data: templates = [] } = useSegmentTemplates();

  // Mutations
  const createSegmentMutation = useCreateSegment();
  const updateSegmentMutation = useUpdateSegment();
  const deleteSegmentMutation = useDeleteSegment();
  const saveAsTemplateMutation = useSaveAsTemplate();

  // Handle segment creation
  const handleCreateSegment = async (segmentData: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSegmentMutation.mutateAsync(segmentData);
      setShowEditor(false);
      setCurrentSegment(null);
      refetchSegments();
      enqueueSnackbar('Segment created successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error creating segment:', error);
      enqueueSnackbar('Failed to create segment', { variant: 'error' });
    }
  };

  // Handle segment update
  const handleUpdateSegment = async (id: string, updates: Partial<UserSegment>) => {
    try {
      await updateSegmentMutation.mutateAsync({ id, ...updates });
      setShowEditor(false);
      setCurrentSegment(null);
      refetchSegments();
      enqueueSnackbar('Segment updated successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error updating segment:', error);
      enqueueSnackbar('Failed to update segment', { variant: 'error' });
    }
  };

  // Handle segment deletion
  const handleDeleteSegment = async (id: string) => {
    try {
      await deleteSegmentMutation.mutateAsync(id);
      setShowDeleteDialog(false);
      setSegmentToDelete(null);
      refetchSegments();
      enqueueSnackbar('Segment deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting segment:', error);
      enqueueSnackbar('Failed to delete segment', { variant: 'error' });
    }
  };

  // Handle saving segment as template
  const handleSaveAsTemplate = async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await saveAsTemplateMutation.mutateAsync(segment);
      enqueueSnackbar('Segment saved as template successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error saving segment as template:', error);
      enqueueSnackbar('Failed to save segment as template', { variant: 'error' });
    }
  };

  // Handle preview segment
  const handlePreviewSegment = async (conditions: any[]) => {
    try {
      await previewSegment(conditions);
      setTabValue(1); // Switch to preview tab
    } catch (error) {
      console.error('Error previewing segment:', error);
      enqueueSnackbar('Failed to preview segment', { variant: 'error' });
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle edit segment
  const handleEditSegment = (segment: UserSegment) => {
    setCurrentSegment(segment);
    setShowEditor(true);
  };

  // Handle create new segment
  const handleCreateNewSegment = () => {
    setCurrentSegment(null);
    setShowEditor(true);
  };
      setShowEditor(false);
      setCurrentSegment(null);
      setTabValue(0);
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Error creating segment: ${error.message}`, { variant: 'error' });
    },
  });

  const updateSegmentMutation = useUpdateSegment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      enqueueSnackbar('Segment updated successfully', { variant: 'success' });
      setShowEditor(false);
      setCurrentSegment(null);
      setTabValue(0);
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Error updating segment: ${error.message}`, { variant: 'error' });
    },
  });

  const deleteSegmentMutation = useDeleteSegment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
      enqueueSnackbar('Segment deleted successfully', { variant: 'success' });
      setShowDeleteDialog(false);
      setSegmentToDelete(null);
    },
    onError: (error: Error) => {
      enqueueSnackbar(`Error deleting segment: ${error.message}`, { variant: 'error' });
    },
  });

  // Handlers
  const handleCreateNew = () => {
    setCurrentSegment(null);
    setShowEditor(true);
    setTabValue(0);
  };

  const handleEditSegment = (segment: UserSegment) => {
    setCurrentSegment(segment);
    setShowEditor(true);
    setTabValue(0);
  };

  const handleViewSegment = (segment: UserSegment) => {
    setCurrentSegment(segment);
    setTabValue(1);
    setPreviewPage(1);
    refetchPreview();
  };

  const handleSaveSegment = (segmentData: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (currentSegment) {
      updateSegmentMutation.mutate({ id: currentSegment.id, ...segmentData });
    } else {
      createSegmentMutation.mutate(segmentData);
    }
  };

  const handleDeleteClick = (segmentId: string) => {
    setSegmentToDelete(segmentId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (segmentToDelete) {
      deleteSegmentMutation.mutate(segmentToDelete);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = segments.map((segment) => segment.id);
      setSelectedSegments(newSelected);
      return;
    }
    setSelectedSegments([]);
  };

  const handleSelect = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selectedSegments.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedSegments, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedSegments.slice(1));
    } else if (selectedIndex === selectedSegments.length - 1) {
      newSelected = newSelected.concat(selectedSegments.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedSegments.slice(0, selectedIndex),
        selectedSegments.slice(selectedIndex + 1)
      );
    }

    setSelectedSegments(newSelected);
  };

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortField(field as keyof UserSegment);
    setSortOrder(isAsc ? 'desc' : 'asc');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefreshPreview = () => {
    refetchPreview();
  };

  const handleViewUser = (userId: string) => {
    // Navigate to user detail page
    navigate(`/users/${userId}`);
  };

  // Filter and sort segments
  const filteredSegments = segments.filter((segment) => 
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (segment.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    segment.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedSegments = [...filteredSegments].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === 'userCount') {
      comparison = (a.userCount || 0) - (b.userCount || 0);
    } else if (sortField === 'updatedAt') {
      comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - sortedSegments.length) : 0;

  // Effect to reset page when search query changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            User Segments
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ ml: 2 }}
          >
            New Segment
          </Button>
        </Box>
        <Divider />
      </Box>

      {showEditor ? (
        <SegmentEditor
          segment={currentSegment}
          onSave={handleSaveSegment}
          onCancel={() => {
            setShowEditor(false);
            setCurrentSegment(null);
          }}
          loading={createSegmentMutation.isPending || updateSegmentMutation.isPending}
        />
      ) : currentSegment ? (
        <Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                label="Edit Segment" 
                id="segment-tab-0" 
                aria-controls="segment-tabpanel-0" 
              />
              <Tab 
                label="Preview" 
                id="segment-tab-1" 
                aria-controls="segment-tabpanel-1" 
                disabled={!currentSegment}
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <SegmentEditor
              segment={currentSegment}
              onSave={handleSaveSegment}
              onCancel={() => setCurrentSegment(null)}
              loading={updateSegmentMutation.isPending}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <SegmentPreview
              segment={currentSegment}
              previewData={{
                users: previewData?.users || [],
                total: previewData?.total || 0,
                loading: isPreviewLoading,
                error: previewError as Error | null,
              }}
              onRefresh={handleRefreshPreview}
              onClose={() => setCurrentSegment(null)}
              onViewUser={handleViewUser}
            />
          </TabPanel>
        </Box>
      ) : (
        <SegmentList
          segments={sortedSegments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
          selected={selectedSegments}
          onSelectAll={handleSelectAllClick}
          onSelect={handleSelect}
          onEdit={handleEditSegment}
          onView={handleViewSegment}
          onDelete={handleDeleteClick}
          onCreateNew={handleCreateNew}
          onSearch={setSearchQuery}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalCount={sortedSegments.length}
          loading={isLoading}
          error={error as Error | null}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Segment
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this segment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowDeleteDialog(false)} 
            color="primary"
            disabled={deleteSegmentMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            disabled={deleteSegmentMutation.isPending}
            startIcon={deleteSegmentMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {deleteSegmentMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SegmentsPage;
