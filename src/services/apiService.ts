/**
 * API Service
 * 
 * This service manages all API requests with proper error handling,
 * request timeout, and TypeScript typing. It serves as the foundation
 * for data fetching with SWR.
 */

import { API } from 'aws-amplify';
import { Auth } from 'aws-amplify';
import { API_URL, API_TIMEOUT } from '../config';

// Error types for better error handling
export enum ErrorType {
  NETWORK = 'network',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

// API error interface with type discrimination
export interface ApiError {
  type: ErrorType;
  status?: number;
  message: string;
  originalError?: any;
  timestamp: number;
  requestId?: string;
}

// Fetch options with timeout
interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Create an API error from any error type
 */
const createApiError = (error: any, defaultMessage = 'An unknown error occurred'): ApiError => {
  const timestamp = Date.now();
  
  // Network error
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      type: ErrorType.NETWORK,
      message: 'Network connection error. Please check your internet connection.',
      originalError: error,
      timestamp
    };
  }
  
  // Timeout error
  if (error.name === 'AbortError') {
    return {
      type: ErrorType.TIMEOUT,
      message: 'Request timed out. Please try again.',
      originalError: error,
      timestamp
    };
  }
  
  // Server error with response
  if (error.response) {
    const status = error.response.status;
    const requestId = error.response.headers?.['x-request-id'];
    
    // Authentication error
    if (status === 401) {
      return {
        type: ErrorType.AUTHENTICATION,
        status,
        message: 'Authentication required. Please log in again.',
        originalError: error,
        timestamp,
        requestId
      };
    }
    
    // Validation error
    if (status === 400 || status === 422) {
      return {
        type: ErrorType.VALIDATION,
        status,
        message: error.response.data?.message || 'Validation failed. Please check your input.',
        originalError: error,
        timestamp,
        requestId
      };
    }
    
    // Server error
    if (status >= 500) {
      return {
        type: ErrorType.SERVER,
        status,
        message: 'Server error. Our team has been notified.',
        originalError: error,
        timestamp,
        requestId
      };
    }
    
    // Other HTTP errors
    return {
      type: ErrorType.UNKNOWN,
      status,
      message: error.response.data?.message || defaultMessage,
      originalError: error,
      timestamp,
      requestId
    };
  }
  
  // Unknown errors
  return {
    type: ErrorType.UNKNOWN,
    message: error.message || defaultMessage,
    originalError: error,
    timestamp
  };
};

/**
 * Base fetcher function that works with SWR
 * Handles timeouts, authentication, and error parsing
 */
export const fetcher = async <T>(url: string, options: FetchOptions = {}): Promise<T> => {
  try {
    // Set default timeout from config
    const timeout = options.timeout || API_TIMEOUT;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Get authentication token
    const token = (await Auth.currentSession()).getIdToken().getJwtToken();
    
    // Merge options with authentication and signal
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    };
    
    // Perform fetch with full URL
    const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
    const response = await fetch(fullUrl, fetchOptions);
    
    // Clear timeout
    clearTimeout(timeoutId);
    
    // Handle HTTP errors
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: await response.json().catch(() => ({})),
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    }
    
    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    // Convert error to ApiError and throw
    throw createApiError(error);
  }
};

/**
 * API client with typed methods for different endpoints
 */
const apiClient = {
  // User management
  users: {
    get: <T>(userId: string) => fetcher<T>(`/users/${userId}`),
    update: <T>(userId: string, data: any) => fetcher<T>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getProfile: <T>(userId: string) => fetcher<T>(`/users/${userId}/profile`),
    updateProfile: <T>(userId: string, data: any) => fetcher<T>(`/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getFriends: <T>(userId: string) => fetcher<T>(`/users/${userId}/friends`)
  },
  
  // Conversations and messaging
  conversations: {
    list: <T>(params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetcher<T>(`/conversations${query}`);
    },
    get: <T>(conversationId: string) => fetcher<T>(`/conversations/${conversationId}`),
    create: <T>(data: { participantIds: string[], title?: string }) => fetcher<T>('/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    leave: <T>(conversationId: string) => fetcher<T>(`/conversations/${conversationId}/leave`, {
      method: 'POST'
    })
  },
  
  // Messages
  messages: {
    list: <T>(conversationId: string, params?: { limit?: number, nextToken?: string }) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return fetcher<T>(`/conversations/${conversationId}/messages${query}`);
    },
    send: <T>(conversationId: string, data: { content: string, attachments?: any[] }) => fetcher<T>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    markAsRead: <T>(conversationId: string, messageId: string) => fetcher<T>(`/conversations/${conversationId}/messages/${messageId}/read`, {
      method: 'POST'
    })
  },
  
  // Games
  games: {
    list: <T>(params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetcher<T>(`/games${query}`);
    },
    get: <T>(gameId: string) => fetcher<T>(`/games/${gameId}`),
    getUserGames: <T>(userId: string) => fetcher<T>(`/users/${userId}/games`)
  },
  
  // Events
  events: {
    list: <T>(params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetcher<T>(`/events${query}`);
    },
    get: <T>(eventId: string) => fetcher<T>(`/events/${eventId}`),
    create: <T>(data: any) => fetcher<T>('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    join: <T>(eventId: string) => fetcher<T>(`/events/${eventId}/join`, {
      method: 'POST'
    }),
    leave: <T>(eventId: string) => fetcher<T>(`/events/${eventId}/leave`, {
      method: 'POST'
    })
  },
  
  // Generic request method for custom endpoints
  request: <T>(method: string, path: string, data?: any) => {
    const options: RequestInit = {
      method: method.toUpperCase()
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return fetcher<T>(path, options);
  }
};

export default apiClient; 