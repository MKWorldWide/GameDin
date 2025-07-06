import { useMemo } from 'react';

/**
 * Interface for navigation item structure
 */
interface NavigationItem {
  name: string;
  path: string;
}

/**
 * Interface for the hook return value
 */
interface NavigationStructureReturn {
  navigationItems: NavigationItem[];
}

/**
 * Custom hook for managing navigation structure.
 * Provides a memoized array of navigation items to prevent unnecessary re-renders.
 * @returns {NavigationStructureReturn} An object containing the navigation items.
 */
const useNavigationStructure = (): NavigationStructureReturn => {
  // Memoize the navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo<NavigationItem[]>(() => [
    { name: 'Dashboard', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Customers', path: '/customers' },
  ], []);

  return { navigationItems };
};

export default useNavigationStructure;
