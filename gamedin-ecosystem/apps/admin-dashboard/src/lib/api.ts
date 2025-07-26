import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from '@/contexts/AuthContext';

// Create axios instance with base URL and headers
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the successful response data
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
        
        // Update tokens in localStorage
        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the Authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh token fails, log the user out
        console.error('Error refreshing token:', refreshError);
        
        // Clear auth data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Handle Axios errors
    const message = error.response?.data?.message || error.message;
    
    // Handle common HTTP error codes
    switch (error.response?.status) {
      case 400:
        return `Bad Request: ${message || 'Invalid request'}`;
      case 401:
        return 'Unauthorized: Please log in again';
      case 403:
        return 'Forbidden: You do not have permission to perform this action';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 500:
        return 'Internal Server Error: Please try again later';
      default:
        return message || 'An unknown error occurred';
    }
  }
  
  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

// API methods
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh-token', { refreshToken }),
  
  getMe: () => api.get('/auth/me'),
};

export const usersApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string; role?: string }) =>
    api.get('/admin/users', { params }),
  
  getUser: (id: string) =>
    api.get(`/admin/users/${id}`),
  
  createUser: (data: any) =>
    api.post('/admin/users', data),
  
  updateUser: (id: string, data: any) =>
    api.patch(`/admin/users/${id}`, data),
  
  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),
  
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  
  updateUserStatus: (id: string, active: boolean) =>
    api.patch(`/admin/users/${id}/status`, { active }),
};

export const analyticsApi = {
  getUserStats: (timeRange: string = '30d') =>
    api.get('/admin/analytics/users', { params: { timeRange } }),
  
  getOnboardingMetrics: (timeRange: string = '30d') =>
    api.get('/admin/analytics/onboarding', { params: { timeRange } }),
  
  getSystemHealth: () =>
    api.get('/admin/analytics/health'),
  
  getActivityLogs: (params: { page?: number; limit?: number; userId?: string; action?: string }) =>
    api.get('/admin/analytics/activity-logs', { params }),
};

export const settingsApi = {
  getSettings: () =>
    api.get('/admin/settings'),
  
  updateSettings: (data: any) =>
    api.patch('/admin/settings', data),
  
  getApiKeys: () =>
    api.get('/admin/settings/api-keys'),
  
  createApiKey: (name: string, permissions: string[]) =>
    api.post('/admin/settings/api-keys', { name, permissions }),
  
  deleteApiKey: (id: string) =>
    api.delete(`/admin/settings/api-keys/${id}`),
};

export default api;
