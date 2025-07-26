import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/config';
import { getAuthToken, isAuthenticated, refreshAuthToken } from '@/utils/auth';

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getAuthToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and common errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const newToken = await refreshAuthToken();
        
        if (newToken) {
          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status;
    
    // Create a custom error object with more details
    const apiError = new Error(message) as any;
    apiError.status = status;
    apiError.data = error.response?.data;
    
    throw apiError;
  }
  
  throw new Error('An unexpected error occurred');
};

// API service methods
export const apiService = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // POST request
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // PUT request
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // PATCH request
  patch: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // File upload
  upload: async <T>(
    url: string, 
    file: File, 
    fieldName: string = 'file', 
    onUploadProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }
    
    try {
      const response = await api.post<T>(url, formData, config);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  // Cancel token source (for cancelling requests)
  cancelToken: () => axios.CancelToken.source(),
  
  // Check if an error is a cancellation
  isCancel: (error: any) => axios.isCancel(error),
};

export default api;
