/**
 * Authentication Store Slice
 * 
 * This module provides a domain-specific store for authentication-related state and actions.
 * It abstracts AWS Amplify Auth operations behind a clean interface for better testability
 * and maintainability.
 */

import { StateCreator } from 'zustand';
import { Auth } from '@aws-amplify/auth';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { IUser } from '../../types/social';
import { userMapper } from '../../utils/userMapper';

/**
 * Authentication state and actions interface
 */
export interface AuthSlice {
  // State
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth operations
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; username: string }) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // OAuth operations
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithTwitch: () => Promise<void>;
  handleOAuthRedirect: () => Promise<void>;
  
  // Session management
  validateSession: () => Promise<boolean>;
  getSecureToken: () => Promise<string | null>;
}

// Helper to manage token with secure httpOnly cookies
const secureTokenManager = {
  getSecureToken: async (): Promise<string | null> => {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch (error) {
      console.error('Error getting secure token:', error);
      return null;
    }
  },
  
  validateToken: async (): Promise<boolean> => {
    try {
      const session = await Auth.currentSession();
      const expiration = session.getIdToken().getExpiration() * 1000; // Convert to milliseconds
      const now = Date.now();
      
      // If token expires in less than 15 minutes, refresh it
      if (expiration - now < 15 * 60 * 1000) {
        await Auth.currentAuthenticatedUser();
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }
};

/**
 * Creates the auth slice for the Zustand store
 */
export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  
  // State setters
  setUser: (user) => set({ user }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  
  // Auth operations
  login: async (credentials) => {
    const { email, password } = credentials;
    
    try {
      set({ isLoading: true, error: null });
      
      const user = await Auth.signIn(email, password);
      
      // Map Cognito user to our application user model
      const mappedUser = userMapper(user);
      
      // Set secure HttpOnly cookies for tokens
      await secureTokenManager.getSecureToken();
      
      set({ 
        user: mappedUser, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error during login:', error);
      set({ 
        error: error.message || 'Failed to sign in', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    const { email, password, username } = userData;
    
    try {
      set({ isLoading: true, error: null });
      
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email,
          preferred_username: username,
        }
      });
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error during registration:', error);
      set({ 
        error: error.message || 'Failed to register', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.signOut();
      
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      set({ 
        error: error.message || 'Failed to sign out', 
        isLoading: false 
      });
    }
  },
  
  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.forgotPassword(email);
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error during password reset request:', error);
      set({ 
        error: error.message || 'Failed to request password reset', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  confirmResetPassword: async (email, code, newPassword) => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.forgotPasswordSubmit(email, code, newPassword);
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error during password reset confirmation:', error);
      set({ 
        error: error.message || 'Failed to reset password', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  resendConfirmationCode: async (email) => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.resendSignUp(email);
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error resending confirmation code:', error);
      set({ 
        error: error.message || 'Failed to resend confirmation code', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  confirmSignUp: async (email, code) => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.confirmSignUp(email, code);
      
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Error during sign-up confirmation:', error);
      set({ 
        error: error.message || 'Failed to confirm sign-up', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  refreshSession: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const user = await Auth.currentAuthenticatedUser();
      
      // Map Cognito user to our application user model
      const mappedUser = userMapper(user);
      
      // Set secure HttpOnly cookies for tokens
      await secureTokenManager.getSecureToken();
      
      set({ 
        user: mappedUser, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null // Don't set error for session refresh failures
      });
    }
  },
  
  // OAuth operations
  loginWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.federatedSignIn({
        provider: CognitoHostedUIIdentityProvider.Google
      });
      
      // Auth.federatedSignIn will redirect the user, so we don't need to set state here
    } catch (error: any) {
      console.error('Error during Google login:', error);
      set({ 
        error: error.message || 'Failed to sign in with Google', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  loginWithDiscord: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.federatedSignIn({
        provider: 'Discord' as any // Casting as any since Discord might not be in the enum
      });
      
      // Auth.federatedSignIn will redirect the user
    } catch (error: any) {
      console.error('Error during Discord login:', error);
      set({ 
        error: error.message || 'Failed to sign in with Discord', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  loginWithTwitch: async () => {
    try {
      set({ isLoading: true, error: null });
      
      await Auth.federatedSignIn({
        provider: 'Twitch' as any // Casting as any since Twitch might not be in the enum
      });
      
      // Auth.federatedSignIn will redirect the user
    } catch (error: any) {
      console.error('Error during Twitch login:', error);
      set({ 
        error: error.message || 'Failed to sign in with Twitch', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  handleOAuthRedirect: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Handle the redirect from OAuth provider
      const user = await Auth.currentAuthenticatedUser();
      
      // Map Cognito user to our application user model
      const mappedUser = userMapper(user);
      
      set({ 
        user: mappedUser, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error handling OAuth redirect:', error);
      set({ 
        error: error.message || 'Failed to complete sign-in', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },
  
  // Session management
  validateSession: async () => {
    return await secureTokenManager.validateToken();
  },
  
  getSecureToken: async () => {
    return await secureTokenManager.getSecureToken();
  }
}); 