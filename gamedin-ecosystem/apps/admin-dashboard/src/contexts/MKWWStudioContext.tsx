import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mkwwStudioService } from '../services/mkwwStudioService';
import { useSnackbar } from 'notistack';

interface MKWWStudioContextType {
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  verifyConnection: () => Promise<void>;
  syncUsers: (users: any[]) => Promise<any>;
  syncAnalytics: (analyticsData: any) => Promise<any>;
}

const MKWWStudioContext = createContext<MKWWStudioContextType | undefined>(undefined);

export const MKWWStudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  // Verify connection to MKWW Studio
  const verifyConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const connected = await mkwwStudioService.verifyConnection();
      setIsConnected(connected);
      if (connected) {
        enqueueSnackbar('Successfully connected to MKWW Studio', { variant: 'success' });
      } else {
        enqueueSnackbar('Failed to verify connection to MKWW Studio', { variant: 'warning' });
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to MKWW Studio');
      setError(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync users with MKWW Studio
  const syncUsers = async (users: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mkwwStudioService.syncUsers(users);
      enqueueSnackbar('Successfully synced users with MKWW Studio', { variant: 'success' });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync users with MKWW Studio');
      setError(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync analytics data with MKWW Studio
  const syncAnalytics = async (analyticsData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await mkwwStudioService.syncAnalytics(analyticsData);
      enqueueSnackbar('Successfully synced analytics with MKWW Studio', { variant: 'success' });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to sync analytics with MKWW Studio');
      setError(error);
      enqueueSnackbar(error.message, { variant: 'error' });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify connection on mount
  useEffect(() => {
    // Only verify if we have a token
    if (mkwwStudioService['authToken']) {
      verifyConnection();
    }
  }, []);

  return (
    <MKWWStudioContext.Provider
      value={{
        isConnected,
        isLoading,
        error,
        verifyConnection,
        syncUsers,
        syncAnalytics,
      }}
    >
      {children}
    </MKWWStudioContext.Provider>
  );
};

// Custom hook to use the MKWW Studio context
export const useMKWWStudio = (): MKWWStudioContextType => {
  const context = useContext(MKWWStudioContext);
  if (context === undefined) {
    throw new Error('useMKWWStudio must be used within a MKWWStudioProvider');
  }
  return context;
};

export default MKWWStudioContext;
