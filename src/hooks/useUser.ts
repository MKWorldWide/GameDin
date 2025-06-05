<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from '@aws-amplify/auth';
import useToast from './useToast';
import { mapCognitoUserToIUser } from '../utils/userMapper';
import { IUser } from '../types/social';

export function useUser() {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        const mappedUser = mapCognitoUserToIUser(cognitoUser);
        setUser(mappedUser);
        setIsAuthenticated(true);
      } catch (err) {
        setError(err as Error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, isAuthenticated, loading, error };
} 
=======
/**
 * User Management Hook
 * 
 * This hook provides a clean interface for user-related operations,
 * abstracting the underlying implementation details.
 * It combines authentication and user profile functionality.
 */

import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { IUser } from '../types/social';

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
   */
  const updateProfile = useCallback(async (updates: Partial<IUser>) => {
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
   */
  const uploadAvatar = useCallback(async (file: File) => {
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
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
