import { useEffect } from 'react';
import useXRStore from '../stores/useXRStore';

export const useXR = () => {
  const {
    isARSupported,
    isVRSupported,
    isMobile,
    isHeadsetConnected,
    isInXRSession,
    xrSessionType,
    isSceneReady,
    isTracking,
    checkCapabilities,
    startSession,
    endSession,
    setSceneReady,
    setTracking
  } = useXRStore();

  // Check capabilities on mount
  useEffect(() => {
    checkCapabilities();
  }, [checkCapabilities]);

  // Clean up session on unmount
  useEffect(() => {
    return () => {
      if (isInXRSession) {
        endSession().catch(console.error);
      }
    };
  }, [isInXRSession, endSession]);

  return {
    // State
    isARSupported,
    isVRSupported,
    isMobile,
    isHeadsetConnected,
    isInXRSession,
    xrSessionType,
    isSceneReady,
    isTracking,
    
    // Actions
    startSession,
    endSession,
    setSceneReady,
    setTracking,
    
    // Helpers
    isSupported: isARSupported || isVRSupported,
    isImmersive: isInXRSession && (xrSessionType === 'immersive-ar' || xrSessionType === 'immersive-vr')
  };
};

export default useXR;
