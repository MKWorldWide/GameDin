import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from './SnackbarContext';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // Load user from localStorage on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Set auth token for API calls
          const token = localStorage.getItem('accessToken');
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
          
          // Refresh token if it's expired or about to expire
          const decodedToken: any = token ? jwtDecode(token) : null;
          const isTokenExpired = decodedToken ? decodedToken.exp * 1000 < Date.now() + 300000 : true; // 5 minutes buffer
          
          if (isTokenExpired) {
            const refreshed = await refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Handle token refresh
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) return true; // Prevent multiple refresh attempts
    
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    setIsRefreshing(true);
    
    try {
      const response = await api.post<AuthTokens>('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      
      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Update user data
      const decoded: any = jwtDecode(accessToken);
      const userData = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        isEmailVerified: decoded.isEmailVerified,
        createdAt: decoded.createdAt,
        updatedAt: decoded.updatedAt,
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.post<AuthTokens & { user: User }>('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Update state
      setUser(userData);

      // Show success message
      showSnackbar('Successfully logged in', 'success');

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to log in. Please try again.';
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: { name: string; email: string; password: string }) => {
    try {
      setIsLoading(true);
      await api.post('/auth/register', {
        ...data,
        role: 'admin', // Default role for admin dashboard users
      });

      // Show success message
      showSnackbar(
        'Registration successful! Please check your email to verify your account.',
        'success'
      );

      // Redirect to login page
      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      showSnackbar(errorMessage, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    
    // Clear react-query cache
    queryClient.clear();
    
    // Redirect to login page
    navigate('/login');
    
    // Show logout message
    showSnackbar('You have been logged out', 'info');
  }, [navigate, queryClient, showSnackbar]);

  // Update user data
  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Add request interceptor to handle 401 errors
  useEffect(() => {
    const requestInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If error is not 401 or we've already tried to refresh, reject
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error);
        }
        
        originalRequest._retry = true;
        
        // Try to refresh the token
        const refreshed = await refreshToken();
        if (refreshed) {
          // Update the auth header with the new token
          const token = localStorage.getItem('accessToken');
          if (token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          }
        }
        
        // If we couldn't refresh, log the user out
        logout();
        return Promise.reject(error);
      }
    );
    
    return () => {
      api.interceptors.response.eject(requestInterceptor);
    };
  }, [logout, refreshToken]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
