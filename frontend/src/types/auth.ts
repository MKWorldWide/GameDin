/**
 * Authentication Types for GameDin Application
 *
 * This module defines all authentication-related types including user interfaces,
 * context types, and AWS Amplify authentication integration.
 *
 * @author GameDin Development Team
 * @version 4.1.0
 * @since 2024-07-06
 */

import { AuthUser } from '@aws-amplify/auth';

// AWS Cognito attributes interface
export interface CognitoAttributes {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string;
  phone_number?: string;
  [key: string]: string | boolean | undefined;
}

// Extended auth user interface
export interface IAuthUser extends AuthUser {
  attributes: CognitoAttributes;
}

// Amplify user interface for compatibility
export interface AmplifyUser {
  username: string;
  attributes?: CognitoAttributes;
}

// Authentication context type
export interface AuthContextType {
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: IAuthUser | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  forgotPassword: (username: string) => Promise<void>;
  confirmForgotPassword: (username: string, code: string, newPassword: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resendSignUp: (username: string) => Promise<void>;
}

// Authentication state interface
export interface AuthState {
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

// Sign-in credentials interface
export interface SignInCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Sign-up credentials interface
export interface SignUpCredentials {
  username: string;
  password: string;
  email: string;
  name?: string;
  phoneNumber?: string;
}

// Password reset interface
export interface PasswordReset {
  username: string;
  code: string;
  newPassword: string;
}

// Authentication error interface
export interface AuthError {
  code: string;
  message: string;
  name: string;
  stack?: string;
}

// Session interface
export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

// User profile interface
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
