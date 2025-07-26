import { QueryClient } from '@tanstack/react-query';
import { UserSegment, SegmentCondition } from '../components/analytics/segments/types';

const API_BASE_URL = '/api/segments';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  const data: ApiResponse<T> = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data.data as T;
};

// Create a query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export const segmentApi = {
  // Get all segments
  getSegments: async (): Promise<UserSegment[]> => {
    const response = await fetch(API_BASE_URL);
    return handleResponse<UserSegment[]>(response);
  },

  // Get a single segment by ID
  getSegment: async (id: string): Promise<UserSegment> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    return handleResponse<UserSegment>(response);
  },

  // Create a new segment
  createSegment: async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSegment> => {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segment),
    });
    return handleResponse<UserSegment>(response);
  },

  // Update an existing segment
  updateSegment: async (id: string, segment: Partial<UserSegment>): Promise<UserSegment> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(segment),
    });
    return handleResponse<UserSegment>(response);
  },

  // Delete a segment
  deleteSegment: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  // Preview segment conditions
  previewSegment: async (conditions: SegmentCondition[]): Promise<{
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
  }> => {
    const response = await fetch(`${API_BASE_URL}/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conditions }),
    });
    return handleResponse(response);
  },

  // Get segment templates
  getTemplates: async (): Promise<UserSegment[]> => {
    const response = await fetch(`${API_BASE_URL}/templates`);
    return handleResponse<UserSegment[]>(response);
  },

  // Save segment as template
  saveAsTemplate: async (segment: Omit<UserSegment, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSegment> => {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...segment,
        isTemplate: true,
      }),
    });
    return handleResponse<UserSegment>(response);
  },

  // Invalidate queries cache
  invalidateQueries: (queryKeys: string[]) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys });
  },
};

export { queryClient };

// Query keys for react-query
export const segmentQueryKeys = {
  all: ['segments'] as const,
  lists: () => [...segmentQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => 
    [...segmentQueryKeys.lists(), { filters }] as const,
  details: () => [...segmentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...segmentQueryKeys.details(), id] as const,
  preview: () => [...segmentQueryKeys.all, 'preview'] as const,
  templates: () => [...segmentQueryKeys.all, 'templates'] as const,
};
