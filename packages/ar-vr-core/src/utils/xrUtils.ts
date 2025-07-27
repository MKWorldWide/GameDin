/**
 * Utility functions for XR device detection and capabilities
 */

export type XRDeviceType = 'ar' | 'vr' | 'none';
export type XRSupportLevel = 'full' | 'partial' | 'none';

interface XRDeviceCapabilities {
  deviceType: XRDeviceType;
  supportLevel: XRSupportLevel;
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
}

/**
 * Detects XR capabilities of the current device
 */
export async function detectXRSupport(): Promise<XRDeviceCapabilities> {
  const capabilities: XRDeviceCapabilities = {
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
  };

  if (typeof navigator === 'undefined' || !('xr' in navigator)) {
    return capabilities;
  }

  const xr = (navigator as any).xr;
  
  try {
    // Check for different session modes
    const modes: Array<keyof XRDeviceCapabilities['sessionModes']> = [
      'inline',
      'immersive-vr',
      'immersive-ar',
    ];

    const sessionChecks = modes.map(async (mode) => {
      try {
        const supported = await xr.isSessionSupported(mode);
        capabilities.sessionModes[mode] = supported;
        return { mode, supported };
      } catch (error) {
        console.warn(`Error checking ${mode} session support:`, error);
        return { mode, supported: false };
      }
    });

    // Wait for all session checks to complete
    await Promise.all(sessionChecks);

    // Determine device type based on supported sessions
    if (capabilities.sessionModes['immersive-ar']) {
      capabilities.deviceType = 'ar';
    } else if (capabilities.sessionModes['immersive-vr']) {
      capabilities.deviceType = 'vr';
    }

    // Check for additional features if we have XR support
    if (capabilities.deviceType !== 'none') {
      try {
        const session = await xr.requestSession('inline');
        
        // Check for hand tracking support
        if (session.requestHitTestSource) {
          capabilities.features.hitTest = true;
        }

        // Check for other features
        if (session.updateWorldTrackingState) {
          capabilities.features.handTracking = true;
        }

        // End the test session
        await session.end();
      } catch (error) {
        console.warn('Error testing XR features:', error);
      }
    }

    // Determine support level
    if (capabilities.deviceType !== 'none') {
      capabilities.supportLevel = 'full';
      
      // Check for WebXR hit testing extension
      if (!capabilities.features.hitTest && !capabilities.features.handTracking) {
        capabilities.supportLevel = 'partial';
      }
    }
  } catch (error) {
    console.error('Error detecting XR capabilities:', error);
  }

  return capabilities;
}

/**
 * Gets the user's device type (mobile/desktop) and orientation
 */
export function getDeviceInfo() {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /Mobi|Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isTablet = /(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(userAgent);
  
  let orientation: 'portrait' | 'landscape' | 'unknown' = 'unknown';
  if (typeof window !== 'undefined') {
    orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  }

  return {
    isMobile,
    isIOS,
    isTablet,
    orientation,
    userAgent,
  };
}

/**
 * Checks if the device is likely a VR headset
 */
export async function isVRHeadset(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('getVRDisplays' in navigator)) {
    return false;
  }

  try {
    const displays = await (navigator as any).getVRDisplays();
    return displays.length > 0;
  } catch (error) {
    console.warn('Error checking for VR displays:', error);
    return false;
  }
}
