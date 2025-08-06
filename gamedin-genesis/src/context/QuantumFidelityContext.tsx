import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { detectPerformanceTier } from '../services/quantumFidelity';
import { RenderTier } from '../types';

interface QuantumFidelityContextType {
  activeTier: RenderTier;
  userSetting: 'auto' | RenderTier;
}

const QuantumFidelityContext = createContext<QuantumFidelityContextType | undefined>(undefined);

export const QuantumFidelityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userSetting = user?.settings?.renderTier || 'auto';
  
  const activeTier = useMemo(() => {
    if (userSetting === 'auto') {
      return detectPerformanceTier();
    }
    return userSetting;
  }, [userSetting]);

  useEffect(() => {
    const tierName = activeTier.toLowerCase();
    document.body.dataset.renderTier = tierName;
    console.log(`[Quantum Mesh] Active Tier: ${activeTier}`);
    
    // Cleanup on component unmount
    return () => {
      delete document.body.dataset.renderTier;
    };
  }, [activeTier]);

  const value = { activeTier, userSetting };

  return (
    <QuantumFidelityContext.Provider value={value}>
      {children}
    </QuantumFidelityContext.Provider>
  );
};

export const useQuantumFidelity = () => {
  const context = useContext(QuantumFidelityContext);
  if (context === undefined) {
    throw new Error('useQuantumFidelity must be used within a QuantumFidelityProvider');
  }
  return context;
};