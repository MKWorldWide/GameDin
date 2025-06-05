import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, signIn, signOut } from '@aws-amplify/auth';
import useToast from '../hooks/useToast';
import store from '../store/useStore';
import { IUser } from '../types/social';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: IUser | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        const mappedUser: IUser = {
          id: currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || '',
          name: currentUser.username,
          picture: '/default-avatar.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(mappedUser);
        showToast('Successfully logged in', 'success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showToast('Failed to login', 'error');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      showToast('Successfully logged out', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      showToast('Failed to logout', 'error');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const mappedUser: IUser = {
          id: currentUser.userId,
          username: currentUser.username,
          email: currentUser.signInDetails?.loginId || '',
          name: currentUser.username,
          picture: '/default-avatar.png',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setUser(mappedUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        showToast('Failed to fetch user', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [showToast]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser, setLoading, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
