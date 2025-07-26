import { AUTH_CONFIG } from '@/config';

// Token Management
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
};

// Refresh Token Management
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
};

// Token Expiry Management
export const getTokenExpiry = (): number | null => {
  const expiry = localStorage.getItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY);
  return expiry ? parseInt(expiry, 10) : null;
};

export const setTokenExpiry = (expiry: number): void => {
  localStorage.setItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY, expiry.toString());
};

export const removeTokenExpiry = (): void => {
  localStorage.removeItem(AUTH_CONFIG.TOKEN_EXPIRY_KEY);
};

// User Management
export const getCurrentUser = (): any => {
  const user = localStorage.getItem(AUTH_CONFIG.USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: any): void => {
  localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem(AUTH_CONFIG.USER_KEY);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const expiry = getTokenExpiry();
  
  if (!token || !expiry) {
    return false;
  }
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  return expiry > now;
};

// Check if user has specific permission
export const hasPermission = (permission: string): boolean => {
  const user = getCurrentUser();
  if (!user || !user.role) return false;
  
  // Super admin has all permissions
  if (user.role === 'super_admin') return true;
  
  const userPermissions = user.permissions || [];
  return userPermissions.includes(permission);
};

// Check if user has any of the specified permissions
export const hasAnyPermission = (permissions: string[]): boolean => {
  return permissions.some(permission => hasPermission(permission));
};

// Check if user has all of the specified permissions
export const hasAllPermissions = (permissions: string[]): boolean => {
  return permissions.every(permission => hasPermission(permission));
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeAuthToken();
  removeRefreshToken();
  removeTokenExpiry();
  removeCurrentUser();
};

// Parse JWT token
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT token', e);
    return null;
  }
};

// Set auth data from login response
export const setAuthData = (data: {
  token: string;
  refreshToken: string;
  user: any;
}): void => {
  const { token, refreshToken, user } = data;
  
  // Parse token to get expiry
  const decodedToken = parseJwt(token);
  const expiry = decodedToken?.exp || Math.floor(Date.now() / 1000) + 3600; // Default 1 hour
  
  setAuthToken(token);
  setRefreshToken(refreshToken);
  setTokenExpiry(expiry);
  setCurrentUser(user);
};
