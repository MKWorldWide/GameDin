/**
 * Settings Store Slice
 * 
 * This module provides a domain-specific store for user settings and preferences.
 * It handles theme, notifications, privacy, and other user-configurable options.
 */

import { StateCreator } from 'zustand';
import { ISettings } from '../../types/store';
import { defaultSettings } from '../../constants/settings';

/**
 * Settings state and actions interface
 */
export interface SettingsSlice {
  // State
  settings: ISettings;
  darkMode: boolean;
  
  // Actions
  updateSettings: (newSettings: Partial<ISettings>) => void;
  toggleDarkMode: () => void;
  resetSettings: () => void;
  
  // Theme operations
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
 * Creates the settings slice for the Zustand store
 */
export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  // Initial state
  settings: defaultSettings,
  darkMode: false,
  
  // Settings actions
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  toggleDarkMode: () => set((state) => {
    const newDarkMode = !state.darkMode;
    // Also update the theme in settings
    const newSettings = { 
      ...state.settings, 
      theme: { 
        ...state.settings.theme, 
        darkMode: newDarkMode,
        colorScheme: newDarkMode ? 'dark' : 'light'
      } 
    };
    return { darkMode: newDarkMode, settings: newSettings };
  }),
  
  resetSettings: () => set({ settings: defaultSettings }),
  
  // Theme operations
  setTheme: (theme) => set((state) => ({
    settings: { 
      ...state.settings, 
      theme: { 
        ...state.settings.theme, 
        colorScheme: theme,
        darkMode: theme === 'dark'
      } 
    },
    darkMode: theme === 'dark'
  })),
  
  setFontSize: (size) => set((state) => ({
    settings: { 
      ...state.settings, 
      theme: { 
        ...state.settings.theme, 
        fontSize: size 
      } 
    }
  })),
  
  // Notification settings
  togglePushNotifications: () => set((state) => ({
    settings: { 
      ...state.settings, 
      notifications: { 
        ...state.settings.notifications, 
        push: !state.settings.notifications.push 
      } 
    }
  })),
  
  toggleEmailNotifications: () => set((state) => ({
    settings: { 
      ...state.settings, 
      notifications: { 
        ...state.settings.notifications, 
        email: !state.settings.notifications.email 
      } 
    }
  })),
  
  setNotificationFrequency: (frequency) => set((state) => ({
    settings: { 
      ...state.settings, 
      notifications: { 
        ...state.settings.notifications, 
        emailNotifications: { 
          ...state.settings.notifications.emailNotifications, 
          frequency 
        } 
      } 
    }
  })),
  
  toggleNotificationType: (type) => set((state) => ({
    settings: { 
      ...state.settings, 
      notifications: { 
        ...state.settings.notifications, 
        emailNotifications: { 
          ...state.settings.notifications.emailNotifications, 
          types: { 
            ...state.settings.notifications.emailNotifications.types, 
            [type]: !state.settings.notifications.emailNotifications.types[type] 
          } 
        } 
      } 
    }
  })),
  
  // Privacy settings
  toggleOnlineStatus: () => set((state) => ({
    settings: { 
      ...state.settings, 
      privacy: { 
        ...state.settings.privacy, 
        showOnlineStatus: !state.settings.privacy.showOnlineStatus 
      } 
    }
  })),
  
  toggleLastSeen: () => set((state) => ({
    settings: { 
      ...state.settings, 
      privacy: { 
        ...state.settings.privacy, 
        showLastSeen: !state.settings.privacy.showLastSeen 
      } 
    }
  })),
  
  toggleFriendRequests: () => set((state) => ({
    settings: { 
      ...state.settings, 
      privacy: { 
        ...state.settings.privacy, 
        allowFriendRequests: !state.settings.privacy.allowFriendRequests 
      } 
    }
  })),
  
  toggleGameStats: () => set((state) => ({
    settings: { 
      ...state.settings, 
      privacy: { 
        ...state.settings.privacy, 
        showGameStats: !state.settings.privacy.showGameStats 
      } 
    }
  })),
  
  setProfileVisibility: (visibility) => set((state) => ({
    settings: { 
      ...state.settings, 
      profileVisibility: visibility 
    }
  })),
}); 