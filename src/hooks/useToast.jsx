import { useState, useCallback } from 'react';

/**
 * Custom hook for managing toast notifications.
 * Provides functions to show and hide toast messages with memoized callbacks.
 * @returns {Object} An object containing the toast state and functions to manage it.
 */
const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  // Memoize the showToast function to prevent unnecessary re-renders
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Memoize the hideToast function to prevent unnecessary re-renders
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
};

export default useToast; 