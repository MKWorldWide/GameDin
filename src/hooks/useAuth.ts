/**
 * Authentication Hook
 * 
 * This hook provides a clean interface for authentication operations,
 * abstracting the underlying AWS Amplify Auth implementation.
 * It uses the auth slice of the store for state management.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/store';
import { IUser } from '../types/social';

/**
 * Interface for the authentication hook
 */
interface UseAuthReturn {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}

/**
 * Custom hook for authentication operations
 */
export const useAuth = (): UseAuthReturn => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    register: storeRegister,
    resetPassword: storeResetPassword,
    confirmResetPassword: storeConfirmResetPassword,
    resendConfirmationCode: storeResendConfirmationCode,
    confirmSignUp: storeConfirmSignUp,
    refreshSession,
  } = useAuthStore();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        await refreshSession();
      } catch (error) {
        // Session check failed, user is not authenticated
        console.error('Session check failed:', error);
      }
    };

    if (!isAuthenticated && !isLoading) {
      checkSession();
    }
  }, [isAuthenticated, isLoading, refreshSession]);

  // Simplified login function
  const login = async (email: string, password: string) => {
    await storeLogin({ email, password });
  };

  // Simplified register function
  const register = async (email: string, password: string, username: string) => {
    await storeRegister({ email, password, username });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: storeLogout,
    register,
    resetPassword: storeResetPassword,
    confirmResetPassword: storeConfirmResetPassword,
    resendConfirmationCode: storeResendConfirmationCode,
    confirmSignUp: storeConfirmSignUp,
  };
}; 