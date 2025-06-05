import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HomeMajor, GameControllerMajor, CustomersMajor, AnalyticsMajor, SettingsMajor } from "@shopify/polaris-icons";

/**
 * Custom hook for managing navigation structure and mobile navigation state
 * @returns {Object} Navigation structure and related functions
 */
export function useNavigationStructure() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavigationActive, setMobileNavigationActive] = useState(false);

  // Toggle mobile navigation visibility
  const toggleMobileNavigationActive = useCallback(
    () => setMobileNavigationActive((active) => !active),
    [],
  );

  // Define navigation items
  const navigationItems = [
    {
      url: '/',
      label: 'Dashboard',
      icon: HomeMajor,
      selected: location.pathname === '/',
      onClick: () => {
        navigate('/');
        setMobileNavigationActive(false);
      },
    },
    {
      url: '/products',
      label: 'Games',
      icon: GameControllerMajor,
      selected: location.pathname.startsWith('/products'),
      onClick: () => {
        navigate('/products');
        setMobileNavigationActive(false);
      },
    },
    {
      url: '/customers',
      label: 'Customers',
      icon: CustomersMajor,
      selected: location.pathname.startsWith('/customers'),
      onClick: () => {
        navigate('/customers');
        setMobileNavigationActive(false);
      },
    },
    {
      url: '/analytics',
      label: 'Analytics',
      icon: AnalyticsMajor,
      selected: location.pathname.startsWith('/analytics'),
      onClick: () => {
        navigate('/analytics');
        setMobileNavigationActive(false);
      },
    },
    {
      url: '/settings',
      label: 'Settings',
      icon: SettingsMajor,
      selected: location.pathname.startsWith('/settings'),
      onClick: () => {
        navigate('/settings');
        setMobileNavigationActive(false);
      },
    },
  ];

  return {
    navigationItems,
    mobileNavigationActive,
    toggleMobileNavigationActive,
  };
}

export default useNavigationStructure; 