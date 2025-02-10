import React, { createContext, useContext, ReactNode } from 'react';
import { IUser } from '../types/social';
import store from '../store/useStore';
import { Store } from '../types/store';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Store['user'];
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: Partial<IUser> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Mock user for testing
const mockUser: IUser = {
  id: '1',
  username: 'TestUser',
  email: 'test@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser',
  presence: 'online',
  rank: 'Gold',
  level: 42
};

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

  const register = async (userData: Partial<IUser> & { password: string }) => {
    try {
      const newUser: IUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: userData.username || 'User',
        email: userData.email || '',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
        presence: 'online' as const,
        rank: 'Beginner',
        level: 1,
      };
      setUser(newUser);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const value = {
    isAuthenticated: !!user,
    user,
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
