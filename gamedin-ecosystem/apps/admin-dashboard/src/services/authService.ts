import { apiService } from './api';
import { AUTH_CONFIG } from '@/config';
import { setAuthData, clearAuthData, parseJwt } from '@/utils/auth';

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    avatar?: string;
    lastLogin?: string;
  };
}

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Login user with email and password
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await apiService.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    // Store auth data in local storage
    setAuthData({
      token: response.token,
      refreshToken: response.refreshToken,
      user: response.user,
    });

    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    // Call logout API if needed
    await apiService.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear auth data
    clearAuthData();
  }
};

// Refresh access token
export const refreshAuthToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiService.post<RefreshTokenResponse>('/auth/refresh-token', {
      refreshToken,
    });

    // Update auth data with new tokens
    setAuthData({
      token: response.token,
      refreshToken: response.refreshToken,
      user: parseJwt(response.token),
    });

    return response.token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    // Clear auth data if refresh fails
    clearAuthData();
    return null;
  }
};

// Get current user
export const getCurrentUser = async (): Promise<AuthResponse['user'] | null> => {
  try {
    const user = await apiService.get<AuthResponse['user']>('/auth/me');
    return user;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (data: {
  firstName: string;
  lastName: string;
  avatar?: File;
}): Promise<AuthResponse['user']> => {
  const formData = new FormData();
  formData.append('firstName', data.firstName);
  formData.append('lastName', data.lastName);
  
  if (data.avatar) {
    formData.append('avatar', data.avatar);
  }

  const user = await apiService.patch<AuthResponse['user']>('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Update user in local storage
  const currentUser = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY) || '{}');
  localStorage.setItem(
    AUTH_CONFIG.USER_KEY,
    JSON.stringify({ ...currentUser, ...user })
  );

  return user;
};

// Change password
export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await apiService.post('/auth/change-password', data);
};

// Request password reset
export const requestPasswordReset = async (email: string): Promise<void> => {
  await apiService.post('/auth/forgot-password', { email });
};

// Reset password with token
export const resetPassword = async (data: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<void> => {
  await apiService.post('/auth/reset-password', data);
};

// Verify email with token
export const verifyEmail = async (token: string): Promise<void> => {
  await apiService.post('/auth/verify-email', { token });
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<void> => {
  await apiService.post('/auth/resend-verification', { email });
};

// Check if user has specific permission
export const checkPermission = (permission: string): boolean => {
  const user = JSON.parse(localStorage.getItem(AUTH_CONFIG.USER_KEY) || '{}');
  return user?.role === 'super_admin' || user?.permissions?.includes(permission);
};

// Check if user has any of the specified permissions
export const checkAnyPermission = (permissions: string[]): boolean => {
  return permissions.some(permission => checkPermission(permission));
};

// Check if user has all of the specified permissions
export const checkAllPermissions = (permissions: string[]): boolean => {
  return permissions.every(permission => checkPermission(permission));
};

export default {
  login,
  logout,
  refreshAuthToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
};
