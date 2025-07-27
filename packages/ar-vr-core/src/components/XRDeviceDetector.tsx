import React, { useEffect, useState } from 'react';
import { detectXRSupport, getDeviceInfo, isVRHeadset } from '../utils/xrUtils';

interface XRDeviceDetectorProps {
  children: (props: {
    isChecking: boolean;
    isSupported: boolean;
    deviceType: 'ar' | 'vr' | 'none';
    supportLevel: 'full' | 'partial' | 'none';
    deviceInfo: ReturnType<typeof getDeviceInfo>;
    capabilities: Awaited<ReturnType<typeof detectXRSupport>>;
  }) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  unsupportedComponent?: React.ReactNode;
}

/**
 * XRDeviceDetector component that detects and provides XR capabilities
 * to its children via render props.
 */
export const XRDeviceDetector: React.FC<XRDeviceDetectorProps> = ({
  children,
  loadingComponent = <div>Checking XR capabilities...</div>,
  unsupportedComponent = <div>Your device does not support XR features.</div>,
}) => {
  const [isChecking, setIsChecking] = useState(true);
  const [deviceType, setDeviceType] = useState<'ar' | 'vr' | 'none'>('none');
  const [supportLevel, setSupportLevel] = useState<'full' | 'partial' | 'none'>('none');
  const [deviceInfo, setDeviceInfo] = useState<ReturnType<typeof getDeviceInfo>>(
    getDeviceInfo()
  );
  const [capabilities, setCapabilities] = useState<
    Awaited<ReturnType<typeof detectXRSupport>>
  >({
    deviceType: 'none',
    supportLevel: 'none',
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
  });

  useEffect(() => {
    let isMounted = true;

    const checkXRSupport = async () => {
      try {
        const [detectedCapabilities, isVR] = await Promise.all([
          detectXRSupport(),
          isVRHeadset(),
        ]);

        if (!isMounted) return;

        // If we have a VR headset but AR wasn't detected, prioritize VR
        if (isVR && detectedCapabilities.deviceType === 'none') {
          detectedCapabilities.deviceType = 'vr';
          detectedCapabilities.sessionModes['immersive-vr'] = true;
        }

        setCapabilities(detectedCapabilities);
        setDeviceType(detectedCapabilities.deviceType);
        setSupportLevel(detectedCapabilities.supportLevel);
        setDeviceInfo(getDeviceInfo());
      } catch (error) {
        console.error('Error detecting XR support:', error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkXRSupport();

    // Handle orientation changes
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (isChecking) {
    return <>{loadingComponent}</>;
  }

  if (deviceType === 'none' && supportLevel === 'none') {
    return <>{unsupportedComponent}</>;
  }

  return (
    <>
      {children({
        isChecking,
        isSupported: deviceType !== 'none',
        deviceType,
        supportLevel,
        deviceInfo,
        capabilities,
      })}
    </>
  );
};

export default XRDeviceDetector;
