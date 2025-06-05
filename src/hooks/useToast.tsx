import { useCallback } from 'react';

const useToast = () => {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Implement toast functionality here
    console.log(`${type}: ${message}`);
  }, []);

  return { showToast };
};

export default useToast; 