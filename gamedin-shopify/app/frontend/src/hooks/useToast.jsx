import { useState, useCallback } from "react";

/**
 * Custom hook for managing toast notifications
 * @returns {Object} Toast state and functions to show/hide toasts
 */
export function useToast() {
  const [toastActive, setToastActive] = useState(false);
  const [toastContent, setToastContent] = useState({
    content: '',
    error: false,
    duration: 5000,
  });

  /**
   * Show a toast notification
   * @param {string} content - The message to display
   * @param {Object} options - Toast options
   * @param {boolean} options.error - Whether this is an error toast
   * @param {number} options.duration - How long to show the toast (ms)
   */
  const showToast = useCallback((content, { error = false, duration = 5000 } = {}) => {
    setToastContent({
      content,
      error,
      duration,
    });
    setToastActive(true);
  }, []);

  /**
   * Hide the active toast notification
   */
  const hideToast = useCallback(() => {
    setToastActive(false);
  }, []);

  /**
   * Show a success toast notification
   * @param {string} content - The success message to display
   * @param {Object} options - Toast options
   */
  const showSuccessToast = useCallback((content, options = {}) => {
    showToast(content, { ...options, error: false });
  }, [showToast]);

  /**
   * Show an error toast notification
   * @param {string} content - The error message to display
   * @param {Object} options - Toast options
   */
  const showErrorToast = useCallback((content, options = {}) => {
    showToast(content, { ...options, error: true });
  }, [showToast]);

  return {
    toastActive,
    toastContent,
    showToast,
    hideToast,
    showSuccessToast,
    showErrorToast,
  };
}

export default useToast; 