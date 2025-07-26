import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { segmentApi, segmentQueryKeys } from '../api/segmentApi';
import { UserSegment, SegmentCondition } from '../components/analytics/segments/types';
import { useSnackbar } from '../contexts/SnackbarContext';

export const useSegments = (filters = {}) => {
  return useQuery({
    queryKey: segmentQueryKeys.list(filters),
    queryFn: () => segmentApi.getSegments(),
    onError: (error: Error) => {
      console.error('Error fetching segments:', error);
    },
  });
};

export const useSegment = (id: string) => {
  return useQuery({
    queryKey: segmentQueryKeys.detail(id),
    queryFn: () => segmentApi.getSegment(id),
    enabled: !!id,
    onError: (error: Error) => {
      console.error(`Error fetching segment ${id}:`, error);
    },
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) =>
      segmentApi.createSegment(segment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentQueryKeys.lists() });
      showSnackbar('Segment created successfully', 'success');
    },
    onError: (error: Error) => {
      console.error('Error creating segment:', error);
      showSnackbar(`Error creating segment: ${error.message}`, 'error');
    },
  });
};

export const useUpdateSegment = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string } & Partial<UserSegment>) =>
      segmentApi.updateSegment(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: segmentQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentQueryKeys.detail(id) });
      showSnackbar('Segment updated successfully', 'success');
    },
    onError: (error: Error) => {
      console.error('Error updating segment:', error);
      showSnackbar(`Error updating segment: ${error.message}`, 'error');
    },
  });
};

export const useDeleteSegment = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: string) => segmentApi.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentQueryKeys.lists() });
      showSnackbar('Segment deleted successfully', 'success');
    },
    onError: (error: Error) => {
      console.error('Error deleting segment:', error);
      showSnackbar(`Error deleting segment: ${error.message}`, 'error');
    },
  });
};

export const usePreviewSegment = () => {
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (conditions: SegmentCondition[]) =>
      segmentApi.previewSegment(conditions),
    onError: (error: Error) => {
      console.error('Error previewing segment:', error);
      showSnackbar(`Error previewing segment: ${error.message}`, 'error');
    },
  });
};

export const useSegmentTemplates = () => {
  return useQuery({
    queryKey: segmentQueryKeys.templates(),
    queryFn: () => segmentApi.getTemplates(),
    onError: (error: Error) => {
      console.error('Error fetching segment templates:', error);
    },
  });
};

export const useSaveAsTemplate = () => {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) =>
      segmentApi.saveAsTemplate(segment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentQueryKeys.templates() });
      showSnackbar('Segment saved as template successfully', 'success');
    },
    onError: (error: Error) => {
      console.error('Error saving segment as template:', error);
      showSnackbar(
        `Error saving segment as template: ${error.message}`,
        'error'
      );
    },
  });
};
