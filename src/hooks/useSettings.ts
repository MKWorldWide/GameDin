/**
 * Settings Hook
 * 
 * This hook provides a clean interface for managing user settings,
 * abstracting the underlying implementation details.
 * It uses the settings slice of the store for state management.
 */

import { useCallback } from 'react';
import { useSettingsStore } from '../store/store';
import { ISettings } from '../types/store';

/**
 * Interface for the settings hook
 */
interface UseSettingsReturn {
  // State
  settings: ISettings;
  darkMode: boolean;
  
  // General settings
  updateSettings: (newSettings: Partial<ISettings>) => void;
  resetSettings: () => void;
  
  // Theme settings
  toggleDarkMode: () => void;
  setTheme: (theme: 'default' | 'dark' | 'light') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  // Notification settings
  togglePushNotifications: () => void;
  toggleEmailNotifications: () => void;
  setNotificationFrequency: (frequency: 'daily' | 'weekly' | 'real-time') => void;
  toggleNotificationType: (type: keyof ISettings['notifications']['emailNotifications']['types']) => void;
  
  // Privacy settings
  toggleOnlineStatus: () => void;
  toggleLastSeen: () => void;
  toggleFriendRequests: () => void;
  toggleGameStats: () => void;
  setProfileVisibility: (visibility: 'public' | 'friends' | 'private') => void;
}

/**
 * Custom hook for settings operations
 */
export const useSettings = (): UseSettingsReturn => {
  const {
    settings,
    darkMode,
    updateSettings,
    toggleDarkMode,
    resetSettings,
    setTheme,
    setFontSize,
    togglePushNotifications,
    toggleEmailNotifications,
    setNotificationFrequency,
    toggleNotificationType,
    toggleOnlineStatus,
    toggleLastSeen,
    toggleFriendRequests,
    toggleGameStats,
    setProfileVisibility,
  } = useSettingsStore();

  return {
    settings,
    darkMode,
    updateSettings,
    resetSettings,
    toggleDarkMode,
    setTheme,
    setFontSize,
    togglePushNotifications,
    toggleEmailNotifications,
    setNotificationFrequency,
    toggleNotificationType,
    toggleOnlineStatus,
    toggleLastSeen,
    toggleFriendRequests,
    toggleGameStats,
    setProfileVisibility,
  };
}; 