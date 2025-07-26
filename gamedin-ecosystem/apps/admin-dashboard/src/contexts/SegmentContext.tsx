import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { UserSegment, SegmentCondition } from '../components/analytics/segments/types';

interface SegmentState {
  segments: UserSegment[];
  currentSegment: UserSegment | null;
  isLoading: boolean;
  error: string | null;
  previewData: {
    totalUsers: number;
    matchedUsers: number;
    matchRate: number;
    sampleUsers: Array<{
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
    }>;
  } | null;
}

type SegmentAction =
  | { type: 'FETCH_SEGMENTS_REQUEST' }
  | { type: 'FETCH_SEGMENTS_SUCCESS'; payload: UserSegment[] }
  | { type: 'FETCH_SEGMENTS_FAILURE'; payload: string }
  | { type: 'SET_CURRENT_SEGMENT'; payload: UserSegment | null }
  | { type: 'UPDATE_CURRENT_SEGMENT'; payload: Partial<UserSegment> }
  | { type: 'ADD_SEGMENT'; payload: UserSegment }
  | { type: 'UPDATE_SEGMENT'; payload: UserSegment }
  | { type: 'DELETE_SEGMENT'; payload: string }
  | { type: 'SET_PREVIEW_DATA'; payload: SegmentState['previewData'] }
  | { type: 'RESET_PREVIEW_DATA' };

const initialState: SegmentState = {
  segments: [],
  currentSegment: null,
  isLoading: false,
  error: null,
  previewData: null,
};

const segmentReducer = (state: SegmentState, action: SegmentAction): SegmentState => {
  switch (action.type) {
    case 'FETCH_SEGMENTS_REQUEST':
      return { ...state, isLoading: true, error: null };
    
    case 'FETCH_SEGMENTS_SUCCESS':
      return { ...state, isLoading: false, segments: action.payload };
    
    case 'FETCH_SEGMENTS_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
    
    case 'SET_CURRENT_SEGMENT':
      return { ...state, currentSegment: action.payload };
    
    case 'UPDATE_CURRENT_SEGMENT':
      return {
        ...state,
        currentSegment: state.currentSegment
          ? { ...state.currentSegment, ...action.payload }
          : null,
      };
    
    case 'ADD_SEGMENT':
      return {
        ...state,
        segments: [...state.segments, action.payload],
      };
    
    case 'UPDATE_SEGMENT':
      return {
        ...state,
        segments: state.segments.map((segment) =>
          segment.id === action.payload.id ? action.payload : segment
        ),
      };
    
    case 'DELETE_SEGMENT':
      return {
        ...state,
        segments: state.segments.filter((segment) => segment.id !== action.payload),
      };
    
    case 'SET_PREVIEW_DATA':
      return { ...state, previewData: action.payload };
    
    case 'RESET_PREVIEW_DATA':
      return { ...state, previewData: null };
    
    default:
      return state;
  }
};

interface SegmentContextType extends SegmentState {
  fetchSegments: () => Promise<void>;
  getSegment: (id: string) => Promise<void>;
  createSegment: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserSegment>;
  updateSegment: (id: string, updates: Partial<UserSegment>) => Promise<UserSegment>;
  deleteSegment: (id: string) => Promise<void>;
  setCurrentSegment: (segment: UserSegment | null) => void;
  updateCurrentSegment: (updates: Partial<UserSegment>) => void;
  previewSegment: (conditions: SegmentCondition[]) => Promise<void>;
  resetPreview: () => void;
  saveAsTemplate: (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UserSegment>;
}

const SegmentContext = createContext<SegmentContextType | undefined>(undefined);

export const SegmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(segmentReducer, initialState);
  const { showSnackbar } = useSnackbar();
  const {
    data: segmentsData,
    isLoading: isLoadingSegments,
    error: segmentsError,
    refetch: refetchSegments,
  } = useSegments();
  const createSegmentMutation = useCreateSegment();
  const updateSegmentMutation = useUpdateSegment();
  const deleteSegmentMutation = useDeleteSegment();
  const previewSegmentMutation = usePreviewSegment();
  const saveAsTemplateMutation = useSaveAsTemplate();

  // Fetch all segments
  const fetchSegments = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_SEGMENTS_REQUEST' });
      const data = await refetchSegments();
      dispatch({ type: 'FETCH_SEGMENTS_SUCCESS', payload: data });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch segments';
      dispatch({ type: 'FETCH_SEGMENTS_FAILURE', payload: errorMessage });
      showSnackbar(errorMessage, 'error');
    }
  }, [refetchSegments, showSnackbar]);

  // Get a single segment by ID
  const getSegment = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'FETCH_SEGMENTS_REQUEST' });
      const segment = await segmentApi.getSegment(id);
      dispatch({ type: 'SET_CURRENT_SEGMENT', payload: segment });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch segment';
      dispatch({ type: 'FETCH_SEGMENTS_FAILURE', payload: errorMessage });
      showSnackbar(errorMessage, 'error');
    }
  }, [showSnackbar]);

  // Create a new segment
  const createSegment = useCallback(async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSegment = await createSegmentMutation.mutateAsync(segment);
      dispatch({ type: 'ADD_SEGMENT', payload: newSegment });
      return newSegment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create segment';
      showSnackbar(errorMessage, 'error');
      throw error;
    }
  }, [createSegmentMutation, showSnackbar]);

  // Update an existing segment
  const updateSegment = useCallback(async (id: string, updates: Partial<UserSegment>) => {
    try {
      const updatedSegment = await updateSegmentMutation.mutateAsync({ id, ...updates });
      dispatch({ type: 'UPDATE_SEGMENT', payload: updatedSegment });
      if (state.currentSegment?.id === id) {
        dispatch({ type: 'SET_CURRENT_SEGMENT', payload: updatedSegment });
      }
      return updatedSegment;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update segment';
      showSnackbar(errorMessage, 'error');
      throw error;
    }
  }, [updateSegmentMutation, state.currentSegment?.id, showSnackbar]);

  // Delete a segment
  const deleteSegment = useCallback(async (id: string) => {
    try {
      await deleteSegmentMutation.mutateAsync(id);
      dispatch({ type: 'DELETE_SEGMENT', payload: id });
      if (state.currentSegment?.id === id) {
        dispatch({ type: 'SET_CURRENT_SEGMENT', payload: null });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete segment';
      showSnackbar(errorMessage, 'error');
      throw error;
    }
  }, [deleteSegmentMutation, state.currentSegment?.id, showSnackbar]);

  // Set the current segment
  const setCurrentSegment = useCallback((segment: UserSegment | null) => {
    dispatch({ type: 'SET_CURRENT_SEGMENT', payload: segment });
  }, []);

  // Update the current segment
  const updateCurrentSegment = useCallback((updates: Partial<UserSegment>) => {
    dispatch({ type: 'UPDATE_CURRENT_SEGMENT', payload: updates });
  }, []);

  // Preview segment conditions
  const previewSegment = useCallback(async (conditions: SegmentCondition[]) => {
    try {
      const previewData = await previewSegmentMutation.mutateAsync(conditions);
      dispatch({ type: 'SET_PREVIEW_DATA', payload: previewData });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to preview segment';
      showSnackbar(errorMessage, 'error');
      throw error;
    }
  }, [previewSegmentMutation, showSnackbar]);

  // Reset preview data
  const resetPreview = useCallback(() => {
    dispatch({ type: 'RESET_PREVIEW_DATA' });
  }, []);

  // Save segment as template
  const saveAsTemplate = useCallback(async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const template = await saveAsTemplateMutation.mutateAsync(segment);
      return template;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save segment as template';
      showSnackbar(errorMessage, 'error');
      throw error;
    }
  }, [saveAsTemplateMutation, showSnackbar]);

  // Effect to update state when segments data changes
  React.useEffect(() => {
    if (segmentsData) {
      dispatch({ type: 'FETCH_SEGMENTS_SUCCESS', payload: segmentsData });
    }
  }, [segmentsData]);

  // Effect to handle loading state
  React.useEffect(() => {
    if (isLoadingSegments) {
      dispatch({ type: 'FETCH_SEGMENTS_REQUEST' });
    }
  }, [isLoadingSegments]);

  // Effect to handle errors
  React.useEffect(() => {
    if (segmentsError) {
      const errorMessage = segmentsError instanceof Error ? segmentsError.message : 'Failed to load segments';
      dispatch({ type: 'FETCH_SEGMENTS_FAILURE', payload: errorMessage });
      showSnackbar(errorMessage, 'error');
    }
  }, [segmentsError, showSnackbar]);

  const value = {
    ...state,
    isLoading: state.isLoading || isLoadingSegments,
    error: state.error || (segmentsError as string) || null,
    fetchSegments,
    getSegment,
    createSegment,
    updateSegment,
    deleteSegment,
    setCurrentSegment,
    updateCurrentSegment,
    previewSegment,
    resetPreview,
    saveAsTemplate,
  };

  return (
    <SegmentContext.Provider value={value}>
      {children}
    </SegmentContext.Provider>
  );
};

export const useSegmentContext = () => {
  const context = useContext(SegmentContext);
  if (context === undefined) {
    throw new Error('useSegmentContext must be used within a SegmentProvider');
  }
  return context;
};

// Re-export hooks for convenience
export { useSegments, useSegment, useCreateSegment, useUpdateSegment, useDeleteSegment, usePreviewSegment, useSegmentTemplates, useSaveAsTemplate } from '../hooks/useSegments';
