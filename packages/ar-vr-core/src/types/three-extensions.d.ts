import * as THREE from 'three';

declare module 'three' {
  // Extend Three.js types as needed
  interface WebGLRendererParameters {
    xrCompatible?: boolean;
    powerPreference?: 'default' | 'high-performance' | 'low-power';
  }

  interface WebGLRenderer {
    xr: {
      enabled: boolean;
      getSession(): XRSession | null;
      setSession(session: XRSession): Promise<void>;
      setFramebufferScaleFactor(value: number): void;
      setReferenceSpaceType(type: XRReferenceSpaceType): void;
      getReferenceSpace(): XRReferenceSpace | null;
      getSession(): XRSession | null;
      isPresenting: boolean;
    };
  }

  // Extend Object3D with XR-specific properties
  interface Object3D {
    // AR/VR specific extensions
    matrixAutoUpdate: boolean;
    frustumCulled: boolean;
    renderOrder: number;
    
    // For AR hit testing
    visible: boolean;
    
    // For hand tracking
    userData: {
      [key: string]: any;
      handTracking?: {
        jointName?: string;
        handSide?: 'left' | 'right';
        index?: number;
      };
    };
  }

  // Extend Mesh for AR/VR specific needs
  interface Mesh {
    // For AR plane detection
    userData: Object3D['userData'] & {
      type?: 'plane' | 'featurePoint' | 'image' | 'object';
      uuid?: string;
      arTrackingMethod?: 'feature-point' | 'plane-detection' | 'image-tracking';
    };
  }

  // Extend Scene for AR/VR
  interface Scene {
    // AR/VR specific extensions
    background: THREE.Color | THREE.Texture | null;
    environment: THREE.Texture | null;
    
    // For AR/VR session management
    userData: {
      [key: string]: any;
      arSession?: XRSession;
      vrSession?: XRSession;
      isAR?: boolean;
      isVR?: boolean;
    };
  }

  // Extend Camera for XR
  interface PerspectiveCamera {
    // XR-specific camera properties
    isPerspectiveCamera: true;
    isXR: boolean;
    
    // For stereo rendering
    view: {
      enabled: boolean;
      fullWidth: number;
      fullHeight: number;
      offsetX: number;
      offsetY: number;
      width: number;
      height: number;
    };
    
    // For XR camera handling
    updateProjectionMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
  }
}

// Extend the global namespace for Three.js plugins
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // AR/VR specific components
      'ar-camera': any;
      'ar-hit-test': any;
      'ar-marker': any;
      'ar-anchor': any;
      'vr-camera': any;
      'vr-controller': any;
      'vr-hand': any;
      'vr-locomotion': any;
      'vr-teleport': any;
      'vr-skybox': any;
      'vr-environment': any;
      'vr-gui': any;
    }
  }
}

// Export the extended THREE module
export {};
