import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import useXRStore, { XRState } from '../stores/useXRStore';

interface XRContextType extends XRState {
  isSupported: boolean;
  isImmersive: boolean;
}

const XRContext = createContext<XRContextType | undefined>(undefined);

export const XRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useXRStore();
  
  const value = useMemo(() => ({
    ...store,
    isSupported: store.isARSupported || store.isVRSupported,
    isImmersive: store.isInXRSession && 
      (store.xrSessionType === 'immersive-ar' || store.xrSessionType === 'immersive-vr')
  }), [store]);

  return <XRContext.Provider value={value}>{children}</XRContext.Provider>;
};

export const useXRContext = () => {
  const context = useContext(XRContext);
  if (context === undefined) {
    throw new Error('useXRContext must be used within an XRProvider');
  }
  return context;
};

export default XRProvider;
