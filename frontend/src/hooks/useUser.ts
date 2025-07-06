/**
 * useUser Hook - Unified User Management
 *
 * This hook provides a comprehensive, quantum-documented interface for user-related operations in GameDin.
 * It abstracts authentication, user profile, and utility functions, leveraging the underlying Zustand store and useAuth hook.
 *
 * Feature Context:
 * - Centralizes all user state and actions (login, logout, register, profile updates, avatar upload, etc.)
 * - Ensures type safety and extensibility via the IUser interface
 * - Integrates with AWS Amplify Auth via the store slice, but exposes a clean, app-centric API
 *
 * Usage Example:
 *   const { user, isAuthenticated, login, updateProfile } = useUser();
 *   if (isAuthenticated) { ... }
 *
 * Dependency Listing:
 * - Depends on useAuth (frontend/src/hooks/useAuth.ts)
 * - IUser type (frontend/src/types/social.ts)
 * - Zustand store slices (frontend/src/store/slices/authSlice.ts)
 *
 * Performance Considerations:
 * - Uses useCallback for stable function references
 * - All state is managed in a single store for optimal reactivity
 *
 * Security Implications:
 * - All sensitive operations are abstracted and validated in the store/auth slice
 * - No direct token or credential handling in the UI layer
 *
 * Changelog:
 * - [v3.2.2] Merged conflicting implementations, standardized on feature-rich version, added quantum documentation
 */

import { useCallback } from 'react';

import { IUser } from '../types/social';

import { useAuth } from './useAuth';

/**
 * Interface for the user management hook
 */
interface UseUserReturn {
  // State
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Authentication
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;

  // User profile
  updateProfile: (updates: Partial<IUser>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;

  // Utility functions
  isCurrentUser: (userId: string) => boolean;
}

/**
 * Custom hook for user management operations
 *
 * Returns a unified interface for all user-related actions and state.
 *
 * Example:
 *   const { user, login, updateProfile } = useUser();
 */
export const useUser = (): UseUserReturn => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
  } = useAuth();

  /**
   * Update user profile information
   *
   * @param updates Partial<IUser> - fields to update
   * @returns Promise<void>
   */
  const updateProfile = useCallback(async(updates: Partial<IUser>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    // TODO: Implement actual API call to update user profile
    // For now, this is a placeholder
    console.log('Updating user profile:', updates);
    return Promise.resolve();
  }, [user]);

  /**
   * Upload user avatar
   *
   * @param file File - avatar image
   * @returns Promise<string> - URL of uploaded avatar
   */
  const uploadAvatar = useCallback(async(file: File) => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    // TODO: Implement actual file upload to S3 or similar
    // For now, this is a placeholder
    console.log('Uploading avatar:', file.name);
    // Return a mock URL
    return Promise.resolve(`https://example.com/avatars/${Date.now()}-${file.name}`);
  }, [user]);

  /**
   * Check if a user ID matches the current user
   *
   * @param userId string
   * @returns boolean
   */
  const isCurrentUser = useCallback((userId: string) => {
    return user?.id === userId;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    updateProfile,
    uploadAvatar,
    isCurrentUser,
  };
};
