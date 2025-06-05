/**
 * User Profile Hook
 * 
 * This hook manages user profile data with SWR for automatic caching,
 * revalidation, and offline support. It provides:
 * 
 * 1. Profile data fetching with persistent offline caching
 * 2. Profile updates with optimistic UI and offline operation queueing
 * 3. Status management with real-time updates
 * 4. Type-safe interface for all user profile operations
 */

import { useCallback } from 'react';
import { useData, useMutation } from './useSWR';
import { useAuth } from './useAuth';
import { STORE } from '../services/cacheService';
import { UserProfile, UserPreferences } from '../types/api';

interface UseUserProfileOptions {
  /** Stale time in milliseconds (default: 5 minutes) */
  staleTime?: number;
  /** Cache time in milliseconds (default: 24 hours) */
  cacheTime?: number;
}

interface UpdateProfileData {
  displayName?: string;
  bio?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

/**
 * Hook for fetching and managing user profile data
 */
export const useUserProfile = (
  userId?: string, 
  options: UseUserProfileOptions = {}
) => {
  const { user: authUser } = useAuth();
  const id = userId || authUser?.id;
  
  // Default cache settings
  const {
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 24 * 60 * 60 * 1000 // 24 hours
  } = options;
  
  // Fetch profile data with SWR
  const {
    data: profile,
    error,
    isLoading,
    isValidating,
    mutate,
    isOffline,
    isFromCache
  } = useData<UserProfile>(
    id ? `/users/${id}/profile` : null,
    {
      // Cache to IndexedDB for offline access
      cacheTo: STORE.USERS,
      staleTime,
      cacheTime,
      // Only revalidate on focus after 5 minutes of inactivity
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
      // Refresh data when component mounts
      revalidateOnMount: true
    }
  );
  
  // Handle profile updates with optimistic UI
  const { 
    trigger: updateProfile,
    isMutating: isUpdating,
    error: updateError
  } = useMutation<UserProfile>(
    id ? `/users/${id}/profile` : null,
    {
      // Cache updates to IndexedDB
      cacheTo: STORE.USERS,
      // Optimize UI by immediately showing changes
      onSuccess: (updatedData) => {
        // Update the cached data
        mutate(updatedData, { revalidate: false });
      },
      // Keep offline behavior
      offlineMode: 'cache-first'
    }
  );
  
  /**
   * Update user profile with optimistic UI update
   */
  const handleUpdateProfile = useCallback(async (updateData: UpdateProfileData) => {
    if (!id || !profile) return;
    
    // Create optimistic data for the update
    const optimisticData = {
      ...profile,
      ...updateData,
      // Merge preferences if provided
      preferences: updateData.preferences 
        ? { ...profile.preferences, ...updateData.preferences }
        : profile.preferences,
      // Update timestamp
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Trigger the update with optimistic data
      await updateProfile({
        method: 'PUT',
        body: updateData,
        optimisticData
      });
      
      return true;
    } catch (err) {
      // Error handling will be done via the updateError state
      return false;
    }
  }, [id, profile, updateProfile]);
  
  /**
   * Update user status
   */
  const updateStatus = useCallback(async (status: UserProfile['status']) => {
    if (!id || !profile) return false;
    
    try {
      await handleUpdateProfile({ 
        preferences: { 
          ...profile.preferences,
          status 
        } 
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [id, profile, handleUpdateProfile]);
  
  /**
   * Set user theme preference
   */
  const setTheme = useCallback(async (theme: UserPreferences['theme']) => {
    if (!id || !profile) return false;
    
    try {
      await handleUpdateProfile({
        preferences: {
          ...profile.preferences,
          theme
        }
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [id, profile, handleUpdateProfile]);
  
  /**
   * Update notification preferences
   */
  const updateNotificationPreferences = useCallback(async (
    notifications: Partial<UserPreferences['notifications']>
  ) => {
    if (!id || !profile || !profile.preferences) return false;
    
    try {
      await handleUpdateProfile({
        preferences: {
          ...profile.preferences,
          notifications: {
            ...profile.preferences.notifications,
            ...notifications
          }
        }
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [id, profile, handleUpdateProfile]);
  
  /**
   * Update privacy settings
   */
  const updatePrivacySettings = useCallback(async (
    privacy: Partial<UserPreferences['privacy']>
  ) => {
    if (!id || !profile || !profile.preferences) return false;
    
    try {
      await handleUpdateProfile({
        preferences: {
          ...profile.preferences,
          privacy: {
            ...profile.preferences.privacy,
            ...privacy
          }
        }
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [id, profile, handleUpdateProfile]);
  
  /**
   * Update accessibility settings
   */
  const updateAccessibilitySettings = useCallback(async (
    accessibility: Partial<UserPreferences['accessibility']>
  ) => {
    if (!id || !profile || !profile.preferences) return false;
    
    try {
      await handleUpdateProfile({
        preferences: {
          ...profile.preferences,
          accessibility: {
            ...profile.preferences.accessibility,
            ...accessibility
          }
        }
      });
      return true;
    } catch (err) {
      return false;
    }
  }, [id, profile, handleUpdateProfile]);
  
  return {
    // Data states
    profile,
    isLoading,
    isValidating,
    error,
    isUpdating,
    updateError,
    isOffline,
    isFromCache,
    
    // Actions
    updateProfile: handleUpdateProfile,
    updateStatus,
    setTheme,
    updateNotificationPreferences,
    updatePrivacySettings,
    updateAccessibilitySettings,
    
    // Manual revalidation
    refreshProfile: () => mutate()
  };
};

export default useUserProfile; 