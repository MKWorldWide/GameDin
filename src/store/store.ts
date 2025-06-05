/**
 * Root Store
 * 
 * This module combines all domain-specific store slices into a single Zustand store.
 * It provides a unified interface for accessing and manipulating application state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';
import { MessagingSlice, createMessagingSlice } from './slices/messagingSlice';

/**
 * Combined store type that includes all slices
 */
export type RootStore = AuthSlice & SettingsSlice & MessagingSlice;

/**
 * Create the root store with persistence
 */
export const useStore = create<RootStore>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createSettingsSlice(...a),
      ...createMessagingSlice(...a),
    }),
    {
      name: 'gamedin-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        settings: state.settings,
        darkMode: state.darkMode,
        // Don't persist user credentials, just authentication state
        isAuthenticated: state.isAuthenticated,
        // Don't persist messages or conversations (will be fetched from API)
      }),
    }
  )
);

/**
 * Hook for accessing only the auth slice
 */
export const useAuthStore = () => {
  const store = useStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    register: store.register,
    resetPassword: store.resetPassword,
    confirmResetPassword: store.confirmResetPassword,
    resendConfirmationCode: store.resendConfirmationCode,
    confirmSignUp: store.confirmSignUp,
    refreshSession: store.refreshSession,
  };
};

/**
 * Hook for accessing only the settings slice
 */
export const useSettingsStore = () => {
  const store = useStore();
  return {
    settings: store.settings,
    darkMode: store.darkMode,
    updateSettings: store.updateSettings,
    toggleDarkMode: store.toggleDarkMode,
    resetSettings: store.resetSettings,
    setTheme: store.setTheme,
    setFontSize: store.setFontSize,
    togglePushNotifications: store.togglePushNotifications,
    toggleEmailNotifications: store.toggleEmailNotifications,
    setNotificationFrequency: store.setNotificationFrequency,
    toggleNotificationType: store.toggleNotificationType,
    toggleOnlineStatus: store.toggleOnlineStatus,
    toggleLastSeen: store.toggleLastSeen,
    toggleFriendRequests: store.toggleFriendRequests,
    toggleGameStats: store.toggleGameStats,
    setProfileVisibility: store.setProfileVisibility,
  };
};

/**
 * Hook for accessing only the messaging slice
 */
export const useMessagingStore = () => {
  const store = useStore();
  return {
    conversations: store.conversations,
    activeConversationId: store.activeConversationId,
    messages: store.messages,
    messagesPagination: store.messagesPagination,
    typingIndicators: store.typingIndicators,
    isLoadingConversations: store.isLoadingConversations,
    isLoadingMessages: store.isLoadingMessages,
    error: store.error,
    setActiveConversation: store.setActiveConversation,
    fetchConversations: store.fetchConversations,
    fetchMessages: store.fetchMessages,
    sendMessage: store.sendMessage,
    markAsRead: store.markAsRead,
    sendTypingIndicator: store.sendTypingIndicator,
    createConversation: store.createConversation,
    leaveConversation: store.leaveConversation,
  };
}; 