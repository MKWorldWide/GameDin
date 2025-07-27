import { create } from 'zustand';
import { StateCreator } from 'zustand';
import { devtools, persist, PersistOptions } from 'zustand/middleware';
import { detectXRSupport, getDeviceInfo, isVRHeadset } from '../utils/xrUtils';

interface XRState {
  // Device capabilities
  isARSupported: boolean;
  isVRSupported: boolean;
  isMobile: boolean;
  isHeadsetConnected: boolean;
  deviceType: 'ar' | 'vr' | 'none';
  supportLevel: 'full' | 'partial' | 'none';
  deviceInfo: {
    isMobile: boolean;
    isIOS: boolean;
    isTablet: boolean;
    orientation: 'portrait' | 'landscape' | 'unknown';
    userAgent: string;
  };
  
  // Session state
  isInXRSession: boolean;
  xrSessionType: 'inline' | 'immersive-vr' | 'immersive-ar' | null;
  
  // Scene state
  isSceneReady: boolean;
  isTracking: boolean;
  
  // Features
  features: {
    handTracking: boolean;
    hitTest: boolean;
    lightEstimation: boolean;
    anchors: boolean;
    depthSensing: boolean;
  };
  
  // Session modes
  sessionModes: {
    inline: boolean;
    'immersive-vr': boolean;
    'immersive-ar': boolean;
  };
  
  // Actions
  checkCapabilities: () => Promise<void>;
  startSession: (type: 'inline' | 'immersive-vr' | 'immersive-ar') => Promise<boolean>;
  endSession: () => Promise<void>;
  setSceneReady: (ready: boolean) => void;
  setTracking: (tracking: boolean) => void;
}

type XRStorePersist = (
  config: StateCreator<XRState>,
  options: PersistOptions<XRState>
) => StateCreator<XRState>;

const useXRStore = create<XRState>()(
  devtools(
    (persist as XRStorePersist)(
      (set, get) => ({
        isARSupported: false,
        isVRSupported: false,
        isMobile: false,
        isHeadsetConnected: false,
        deviceType: 'none',
        supportLevel: 'none',
        deviceInfo: getDeviceInfo(),
        isInXRSession: false,
        xrSessionType: null,
        isSceneReady: false,
        isTracking: false,
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

        checkCapabilities: async () => {
          try {
            const [detectedCapabilities, isVR] = await Promise.all([
              detectXRSupport(),
              isVRHeadset()
            ]);

            set({
              isARSupported: detectedCapabilities.sessionModes['immersive-ar'],
              isVRSupported: detectedCapabilities.sessionModes['immersive-vr'],
              isMobile: getDeviceInfo().isMobile,
              isHeadsetConnected: isVR,
              deviceType: detectedCapabilities.deviceType,
              supportLevel: detectedCapabilities.supportLevel,
              deviceInfo: getDeviceInfo(),
              features: detectedCapabilities.features,
              sessionModes: detectedCapabilities.sessionModes
            });
          } catch (error) {
            console.error('Error checking XR capabilities:', error);
          }
        },

        startSession: async (type: 'inline' | 'immersive-vr' | 'immersive-ar') => {
          if (typeof navigator === 'undefined' || !(navigator as any).xr) {
            console.error('WebXR not supported');
            return false;
          }

          try {
            const xr = (navigator as any).xr;
            const session = await xr.requestSession(type, {
              requiredFeatures: ['local-floor'],
              optionalFeatures: ['hand-tracking', 'hit-test']
            });

            set({
              isInXRSession: true,
              xrSessionType: type as any
            });

            // Set up session end handler
            session.addEventListener('end', () => {
              set({
                isInXRSession: false,
                xrSessionType: null,
                isSceneReady: false,
                isTracking: false
              });
            });

            return true;
          } catch (error) {
            console.error(`Failed to start ${type} session:`, error);
            return false;
          }
        },

        endSession: async () => {
          if (typeof navigator === 'undefined' || !(navigator as any).xr) {
            return;
          }

          const xr = (navigator as any).xr;
          const session = xr.session;
          if (session) {
            await session.end();
          }
        },

        setSceneReady: (ready: boolean) => set({ isSceneReady: ready }),
        setTracking: (tracking: boolean) => set({ isTracking: tracking })
      }),
      {
        name: 'xr-storage',
        partialize: (state: XRState) => ({
          isARSupported: state.isARSupported,
          isVRSupported: state.isVRSupported,
          isMobile: state.isMobile,
          isHeadsetConnected: state.isHeadsetConnected,
          deviceType: state.deviceType,
          supportLevel: state.supportLevel,
          features: state.features,
          sessionModes: state.sessionModes
        } as Partial<XRState>)
      }
    ),
    {
      name: 'XR Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

export default useXRStore;
