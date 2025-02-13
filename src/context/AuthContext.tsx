import React, { createContext, useContext, ReactNode } from 'react';
import { AmplifyUser } from '@aws-amplify/ui';
import store from '../store/useStore';
import { Store } from '../types/store';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AmplifyUser | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: Partial<AmplifyUser> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    user, 
    setUser, 
    logout: storeLogout, 
    loading, 
    error, 
    login, 
    isAuthenticated, 
    settings, 
    updateSettings,
    setIsAuthenticated,
    setLoading,
    setError
  } = store<Store>(state => ({
    user: state.user,
    setUser: state.setUser,
    logout: state.logout,
    loading: state.loading,
    error: state.error,
    login: state.login,
    isAuthenticated: state.isAuthenticated,
    settings: state.settings,
    updateSettings: state.updateSettings,
    setIsAuthenticated: state.setIsAuthenticated,
    setLoading: state.setLoading,
    setError: state.setError
  }));

  const register = async (userData: Partial<AmplifyUser> & { password: string }) => {
    try {
      // Implementation will be handled by Amplify
      throw new Error('Not implemented');
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const value = {
    isAuthenticated: !!user,
    user: user as AmplifyUser | null,
    login,
    register,
    logout: storeLogout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
