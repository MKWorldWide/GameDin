import { useState, useEffect, useCallback } from 'react';
import { 
  detectXRSupport, 
  getDeviceInfo, 
  isVRHeadset,
  type XRDeviceType,
  type XRSupportLevel
} from '../utils/xrUtils';

interface XRDeviceState {
  isSupported: boolean;
  deviceType: XRDeviceType;
  supportLevel: XRSupportLevel;
  deviceInfo: ReturnType<typeof getDeviceInfo>;
  features: {
    handTracking: boolean;
    hitTest: boolean;
    lightEstimation: boolean;
    anchors: boolean;
    depthSensing: boolean;
  };
  sessionModes: {
    inline: boolean;
    'immersive-vr': boolean;
    'immersive-ar': boolean;
  };
  isChecking: boolean;
  error: Error | null;
}

const initialState: XRDeviceState = {
  isSupported: false,
  deviceType: 'none',
  supportLevel: 'none',
  deviceInfo: {
    isMobile: false,
    isIOS: false,
    isTablet: false,
    orientation: 'unknown',
    userAgent: ''
  },
  features: {
    handTracking: false,
    hitTest: false,
    lightEstimation: false,
    anchors: false,
    depthSensing: false,
  },
  sessionModes: {
    inline: false,
    'immersive-vr': false,
    'immersive-ar': false,
  },
  isChecking: true,
  error: null,
};

export function useXRDevice() {
  const [state, setState] = useState<XRDeviceState>(initialState);

  const checkCapabilities = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isChecking: true, error: null }));
      
      const [capabilities, isVR] = await Promise.all([
        detectXRSupport(),
        isVRHeadset()
      ]);

      setState({
        isSupported: capabilities.deviceType !== 'none',
        deviceType: capabilities.deviceType,
        supportLevel: capabilities.supportLevel,
        deviceInfo: getDeviceInfo(),
        features: capabilities.features,
        sessionModes: capabilities.sessionModes,
        isChecking: false,
        error: null,
      });
    } catch (error) {
      console.error('Error checking XR capabilities:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error : new Error('Failed to check XR capabilities')
      }));
    }
  }, []);

  useEffect(() => {
    checkCapabilities();

    // Handle orientation changes
    const handleOrientationChange = () => {
      setState(prev => ({
        ...prev,
        deviceInfo: getDeviceInfo()
      }));
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [checkCapabilities]);

  return {
    ...state,
    refresh: checkCapabilities,
  };
}

export default useXRDevice;
