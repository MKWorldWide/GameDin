import { useMemo } from 'react';

/**
 * Custom hook for managing navigation structure.
 * Provides a memoized array of navigation items to prevent unnecessary re-renders.
 * @returns {Object} An object containing the navigation items.
 */
const useNavigationStructure = () => {
  // Memoize the navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    { name: 'Dashboard', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Customers', path: '/customers' }
  ], []);

  return { navigationItems };
};

export default useNavigationStructure; 