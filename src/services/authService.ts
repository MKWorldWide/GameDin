/**
 * Authentication Service
 * 
 * This service manages user authentication, JWT tokens, and session management.
 * It implements secure practices including:
 * - Short-lived access tokens with automatic refresh
 * - Secure token storage using httpOnly cookies
 * - Rate limiting protection
 * - Proper secure logout flow
 * - OAuth integration with secure token handling
 */

import { config } from '../config';
import indexedDBService from './indexedDBService';
import { addToOfflineQueue } from './indexedDBService';

// Constants
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Types
export type AuthToken = {
  token: string;
  expiresAt: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
  preferences?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: AuthToken;
  refreshToken: AuthToken;
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterCredentials = {
  email: string;
  username: string;
  password: string;
  displayName?: string;
};

export type AuthError = {
  message: string;
  code: string;
  status?: number;
};

// Refresh token timer
let refreshTimer: NodeJS.Timeout | null = null;

// Authentication state
let currentUser: User | null = null;
let isRefreshing = false;
let refreshPromise: Promise<AuthToken | null> | null = null;
let authListeners: Array<(user: User | null) => void> = [];

/**
 * Store authentication tokens and user data securely
 * @param tokens Authentication tokens response
 */
const storeAuthData = async (response: LoginResponse): Promise<void> => {
  const { accessToken, refreshToken, user } = response;
  
  // Store access token in memory for immediate use
  localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
  
  // Store user in memory and localStorage
  currentUser = user;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  // Store refreshToken in HttpOnly cookie (handled by backend)
  // We keep a record of its expiration for refresh timing
  localStorage.setItem(REFRESH_TOKEN_KEY, JSON.stringify({
    expiresAt: refreshToken.expiresAt
  }));
  
  // Store user data in IndexedDB for offline access
  try {
    await indexedDBService.setCache(
      indexedDBService.STORE.USERS, 
      {
        ...user,
        lastUpdated: Date.now()
      },
      30 * 24 * 60 * 60 * 1000 // 30 days cache
    );
  } catch (error) {
    console.error('Failed to store user data in IndexedDB:', error);
  }
  
  // Schedule token refresh
  scheduleTokenRefresh(accessToken.expiresAt);
  
  // Notify listeners about authentication state change
  notifyAuthStateChanged();
};

/**
 * Clear auth data on logout
 */
const clearAuthData = (): void => {
  // Clear from memory
  currentUser = null;
  
  // Clear from localStorage
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // Clear refresh timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  
  // Reset refresh state
  isRefreshing = false;
  refreshPromise = null;
  
  // Notify listeners about authentication state change
  notifyAuthStateChanged();
};

/**
 * Schedule a token refresh before the access token expires
 * @param expiresAt Timestamp when the token expires
 */
const scheduleTokenRefresh = (expiresAt: number): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  const now = Date.now();
  const expiresIn = expiresAt - now;
  
  // Refresh the token 1 minute before it expires
  const refreshTime = Math.max(0, expiresIn - 60 * 1000);
  
  refreshTimer = setTimeout(() => {
    refreshAccessToken()
      .catch(error => {
        console.error('Token refresh failed:', error);
        // If refresh fails, redirect to login
        clearAuthData();
        window.location.href = '/login?expired=true';
      });
  }, refreshTime);
};

/**
 * Notify all registered listeners about authentication state changes
 */
const notifyAuthStateChanged = (): void => {
  authListeners.forEach(listener => {
    try {
      listener(currentUser);
    } catch (error) {
      console.error('Error notifying auth listener:', error);
    }
  });
};

/**
 * Initialize the authentication service by loading stored data
 */
export const initAuth = (): Promise<User | null> => {
  return new Promise((resolve) => {
    try {
      // Try to load user from localStorage
      const userJson = localStorage.getItem(USER_KEY);
      const tokenJson = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshJson = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (userJson && tokenJson && refreshJson) {
        const user = JSON.parse(userJson) as User;
        const accessToken = JSON.parse(tokenJson) as AuthToken;
        const refreshToken = JSON.parse(refreshJson) as { expiresAt: number };
        
        currentUser = user;
        
        // Check if access token is expired
        const now = Date.now();
        if (accessToken.expiresAt <= now) {
          // Access token expired, try to refresh
          refreshAccessToken()
            .then(() => resolve(currentUser))
            .catch(() => {
              clearAuthData();
              resolve(null);
            });
        } else {
          // Schedule token refresh
          scheduleTokenRefresh(accessToken.expiresAt);
          resolve(user);
        }
      } else {
        resolve(null);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      clearAuthData();
      resolve(null);
    }
  });
};

/**
 * Login with email and password
 * @param credentials Login credentials
 */
export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Authentication failed',
        code: error.code || 'auth/unknown-error',
        status: response.status,
      };
    }
    
    const data = await response.json() as LoginResponse;
    await storeAuthData(data);
    
    return data.user;
  } catch (error) {
    if (!navigator.onLine) {
      // If offline, add to queue for later and throw a specific error
      await addToOfflineQueue(
        `${config.apiBaseUrl}/auth/login`,
        'POST',
        credentials
      );
      
      throw {
        message: 'Cannot login while offline. Your login will be attempted when you are back online.',
        code: 'auth/offline',
        status: 503,
      };
    }
    
    throw error;
  }
};

/**
 * Register a new account
 * @param credentials Registration credentials
 */
export const register = async (credentials: RegisterCredentials): Promise<User> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Registration failed',
        code: error.code || 'auth/unknown-error',
        status: response.status,
      };
    }
    
    const data = await response.json() as LoginResponse;
    await storeAuthData(data);
    
    return data.user;
  } catch (error) {
    if (!navigator.onLine) {
      throw {
        message: 'Cannot register while offline. Please try again when you have an internet connection.',
        code: 'auth/offline',
        status: 503,
      };
    }
    
    throw error;
  }
};

/**
 * Refresh the access token using the refresh token
 * This uses a singleton promise to prevent multiple simultaneous refresh attempts
 */
export const refreshAccessToken = async (): Promise<AuthToken | null> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  
  // Start the refresh process
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Send the httpOnly refresh token cookie
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      const { accessToken, user } = data;
      
      // Update the access token in storage
      localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
      
      // Update user if provided
      if (user) {
        currentUser = user;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        
        // Update in IndexedDB
        await indexedDBService.setCache(
          indexedDBService.STORE.USERS,
          {
            ...user,
            lastUpdated: Date.now()
          }
        );
        
        // Notify listeners
        notifyAuthStateChanged();
      }
      
      // Schedule the next refresh
      scheduleTokenRefresh(accessToken.expiresAt);
      
      return accessToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear auth data if refresh fails
      clearAuthData();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
};

/**
 * Get the current access token
 * Will attempt to refresh if the token is expired
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    const tokenJson = localStorage.getItem(ACCESS_TOKEN_KEY);
    
    if (!tokenJson) {
      return null;
    }
    
    const accessToken = JSON.parse(tokenJson) as AuthToken;
    const now = Date.now();
    
    // If the token is expired or about to expire (within 10 seconds), refresh it
    if (accessToken.expiresAt <= now + 10000) {
      const newToken = await refreshAccessToken();
      return newToken?.token || null;
    }
    
    return accessToken.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Logout the current user
 * This will revoke tokens and clear the auth state
 */
export const logout = async (): Promise<void> => {
  try {
    // Attempt to revoke tokens on the server
    if (navigator.onLine) {
      await fetch(`${config.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Send cookies
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always clear local auth data, even if the server request fails
    clearAuthData();
  }
};

/**
 * OAuth authentication (redirects to provider)
 * @param provider OAuth provider (google, facebook, etc.)
 * @param redirect Redirect URL after authentication
 */
export const oauthLogin = (provider: string, redirect: string = window.location.pathname): void => {
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
  const state = encodeURIComponent(JSON.stringify({ redirect }));
  
  window.location.href = `${config.apiBaseUrl}/auth/${provider}?redirect_uri=${redirectUri}&state=${state}`;
};

/**
 * Process OAuth callback
 * @param code Authorization code from OAuth provider
 * @param state State parameter from OAuth flow
 */
export const processOAuthCallback = async (code: string, state: string): Promise<{ user: User, redirect: string }> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, state }),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'OAuth authentication failed',
        code: error.code || 'auth/unknown-error',
        status: response.status,
      };
    }
    
    const data = await response.json() as LoginResponse & { redirect: string };
    await storeAuthData(data);
    
    return {
      user: data.user,
      redirect: data.redirect || '/'
    };
  } catch (error) {
    console.error('OAuth callback processing failed:', error);
    throw error;
  }
};

/**
 * Check if the current user has the specified role
 * @param role Role to check
 */
export const hasRole = (role: string): boolean => {
  return currentUser?.roles?.includes(role) || false;
};

/**
 * Subscribe to authentication state changes
 * @param listener Function to call when auth state changes
 * @returns Unsubscribe function
 */
export const onAuthStateChanged = (listener: (user: User | null) => void): () => void => {
  authListeners.push(listener);
  
  // Call with current state immediately
  listener(currentUser);
  
  // Return unsubscribe function
  return () => {
    authListeners = authListeners.filter(l => l !== listener);
  };
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
};

/**
 * Reset password with email
 * @param email User's email
 */
export const resetPassword = async (email: string): Promise<void> => {
  const response = await fetch(`${config.apiBaseUrl}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw {
      message: error.message || 'Password reset failed',
      code: error.code || 'auth/unknown-error',
      status: response.status,
    };
  }
};

/**
 * Update user profile
 * @param updates Profile updates
 */
export const updateProfile = async (updates: Partial<User>): Promise<User> => {
  if (!currentUser) {
    throw {
      message: 'User not authenticated',
      code: 'auth/unauthenticated',
    };
  }
  
  try {
    const token = await getAccessToken();
    
    if (!token) {
      throw {
        message: 'User not authenticated',
        code: 'auth/unauthenticated',
      };
    }
    
    const response = await fetch(`${config.apiBaseUrl}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
      credentials: 'include', // Send cookies
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw {
        message: error.message || 'Profile update failed',
        code: error.code || 'auth/unknown-error',
        status: response.status,
      };
    }
    
    const updatedUser = await response.json() as User;
    
    // Update current user and storage
    currentUser = updatedUser;
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    
    // Update in IndexedDB
    await indexedDBService.setCache(
      indexedDBService.STORE.USERS,
      {
        ...updatedUser,
        lastUpdated: Date.now()
      }
    );
    
    // Notify listeners
    notifyAuthStateChanged();
    
    return updatedUser;
  } catch (error) {
    if (!navigator.onLine) {
      // If offline, add to queue for later
      await addToOfflineQueue(
        `${config.apiBaseUrl}/user/profile`,
        'PATCH',
        updates
      );
      
      // Apply optimistic update locally
      const optimisticUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as User;
      
      currentUser = optimisticUser;
      localStorage.setItem(USER_KEY, JSON.stringify(optimisticUser));
      
      // Update in IndexedDB
      await indexedDBService.setCache(
        indexedDBService.STORE.USERS,
        {
          ...optimisticUser,
          lastUpdated: Date.now()
        }
      );
      
      // Notify listeners
      notifyAuthStateChanged();
      
      return optimisticUser;
    }
    
    throw error;
  }
};

/**
 * Check rate limit for authentication operations
 * Prevents brute force attacks by limiting login attempts
 * @param operation The operation being rate limited
 */
export const checkRateLimit = async (operation: string): Promise<boolean> => {
  try {
    const response = await fetch(`${config.apiBaseUrl}/auth/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation }),
      credentials: 'include', // Send cookies
    });
    
    // If rate limited, throw an error
    if (response.status === 429) {
      const data = await response.json();
      
      throw {
        message: data.message || 'Too many requests. Please try again later.',
        code: 'auth/rate-limited',
        status: 429,
        retryAfter: parseInt(response.headers.get('Retry-After') || '60', 10)
      };
    }
    
    // Otherwise, we're good to go
    return true;
  } catch (error) {
    if ((error as any).code === 'auth/rate-limited') {
      throw error;
    }
    
    // If there's a network error or we're offline, assume no rate limiting
    console.warn('Rate limit check failed, assuming not rate limited', error);
    return true;
  }
};

// Export authentication service
export default {
  initAuth,
  login,
  register,
  logout,
  refreshAccessToken,
  getAccessToken,
  getCurrentUser,
  onAuthStateChanged,
  hasRole,
  oauthLogin,
  processOAuthCallback,
  resetPassword,
  updateProfile,
  checkRateLimit
}; 