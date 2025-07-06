import { useCallback } from 'react';

/**
 * Toast message types for different notification styles
 */
type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Interface for toast message structure
 */
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Interface for the hook return value
 */
interface UseToastReturn {
  showToast: (message: string, type?: ToastType) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

/**
 * Custom hook for managing toast notifications
 * Provides methods to show different types of toast messages
 * @returns {UseToastReturn} Object containing toast methods
 */
const useToast = (): UseToastReturn => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    // TODO: Implement actual toast functionality with a toast library
    // For now, we'll use console.log as a placeholder
    console.log(`${type.toUpperCase()}: ${message}`);

    // In a real implementation, this would:
    // 1. Create a toast message object
    // 2. Add it to a toast state/context
    // 3. Display it using a toast component
    // 4. Auto-remove after specified duration
  }, []);

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast(message, 'error');
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};

export default useToast;
