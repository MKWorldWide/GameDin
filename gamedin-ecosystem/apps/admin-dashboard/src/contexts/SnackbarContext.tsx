import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor, SnackbarCloseReason } from '@mui/material';

export interface SnackbarMessage {
  message: string;
  severity: AlertColor;
  key: number;
}

export interface SnackbarContextType {
  showSnackbar: (message: string, severity?: AlertColor) => void;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackPack, setSnackPack] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [messageInfo, setMessageInfo] = useState<SnackbarMessage | null>(null);

  const processQueue = useCallback(() => {
    if (snackPack.length > 0 && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    }
  }, [snackPack, messageInfo]);

  const handleClose = useCallback((event: Event | React.SyntheticEvent, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    setMessageInfo(null);
  }, []);

  // Show a snackbar with custom severity
  const showSnackbar = useCallback((message: string, severity: AlertColor = 'info') => {
    setSnackPack((prev) => [
      ...prev,
      { message, severity, key: new Date().getTime() },
    ]);
  }, []);

  // Helper methods for different severity levels
  const showError = useCallback((message: string) => {
    showSnackbar(message, 'error');
  }, [showSnackbar]);

  const showSuccess = useCallback((message: string) => {
    showSnackbar(message, 'success');
  }, [showSnackbar]);

  const showWarning = useCallback((message: string) => {
    showSnackbar(message, 'warning');
  }, [showSnackbar]);

  const showInfo = useCallback((message: string) => {
    showSnackbar(message, 'info');
  }, [showSnackbar]);

  // Process the queue when messageInfo changes
  React.useEffect(() => {
    if (snackPack.length && !messageInfo) {
      // Set a new snack when we don't have an active one
      setMessageInfo({ ...snackPack[0] });
      setSnackPack((prev) => prev.slice(1));
      setOpen(true);
    } else if (snackPack.length && messageInfo && open) {
      // Close an active snack when a new one is added
      setOpen(false);
    }
  }, [snackPack, messageInfo, open]);

  const value = React.useMemo(
    () => ({
      showSnackbar,
      showError,
      showSuccess,
      showWarning,
      showInfo,
    }),
    [showSnackbar, showError, showSuccess, showWarning, showInfo]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={messageInfo ? messageInfo.key : undefined}
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionProps={{ onExited: handleExited }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ marginBottom: 4 }}
      >
        <Alert
          onClose={handleClose}
          severity={messageInfo?.severity || 'info'}
          variant="filled"
          sx={{ width: '100%' }}
          elevation={6}
        >
          {messageInfo?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
