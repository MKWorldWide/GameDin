import { XR } from './global';

declare global {
  interface Window {
    // WebXR API
    XR8?: {
      XrController: any;
      addCameraPipelineModule: (module: any) => void;
      addCameraPipelineModules: (modules: any[]) => void;
      on: (event: string, callback: (e?: any) => void) => void;
      setImageModuleSegmenterOptions: (options: any) => void;
      setMulticamController: (controller: any) => void;
      start: () => void;
      stop: () => void;
    };
    
    // Three.js and related globals
    THREE: any;
    THREEx: any;
    
    // AR.js
    AR: any;
    
    // WebXR Polyfill
    WebXRPolyfill: any;
    
    // Device orientation and motion
    DeviceOrientationEvent?: {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    
    // WebXR Polyfill
    webkitDevicePixelRatio?: number;
    
    // AR Quick Look
    WebXR: any;
    
    // XR globals
    XR: typeof XR;
    
    // Custom globals for AR/VR
    arVrUtils?: {
      isARSupported: () => Promise<boolean>;
      isVRSupported: () => Promise<boolean>;
      requestARSession: () => Promise<void>;
      requestVRSession: () => Promise<void>;
    };
    
    // Performance API
    PerformanceObserver?: any;
    performance: Performance & {
      memory?: {
        jsHeapSizeLimit: number;
        totalJSHeapSize: number;
        usedJSHeapSize: number;
      };
    };
    
    // WebGL debugging
    WEBGL_debug_renderer_info?: {
      UNMASKED_VENDOR_WEBGL: number;
      UNMASKED_RENDERER_WEBGL: number;
    };
    
    // WebXR Polyfill
    XRWebGLLayer?: any;
    XRSession?: any;
    XRSystem?: any;
    
    // WebXR Hand Input Module
    XRHand?: any;
  }
}

// This export is needed to make this a module
export {};
