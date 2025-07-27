/**
 * Type definitions for Three.js and related libraries
 * Project: @gamedin/ar-vr-core
 * 
 * This file provides type extensions for:
 * - Three.js core types (WebGLRenderer, Scene, Object3D)
 * - WebXR specifications
 * - AR.js integration
 * - React Three XR components and hooks
 */

// Import Three.js types for augmentation
import * as THREE from 'three';

// Extend Three.js core types with AR/VR related properties
declare module 'three' {
  // Extend WebGLRenderer with XR capabilities
  interface WebGLRenderer {
    /**
     * WebXR Manager for handling VR/AR sessions
     */
    xr: {
      enabled: boolean;
      isPresenting: boolean;
      getSession(): XRSession | null;
      setSession(session: XRSession): Promise<void>;
      setFramebufferScaleFactor(scale: number): void;
      setReferenceSpaceType(type: XRReferenceSpaceType): void;
      getReferenceSpace(): XRReferenceSpace | null;
      getController(id: number): THREE.Object3D;
      getControllerGrip(id: number): THREE.Object3D;
      getHand(id: number): THREE.Object3D;
    };
  }
  // Extend WebGLRenderer with XR properties
  interface WebGLRenderer {
    xr: {
      enabled: boolean;
      isPresenting: boolean;
      getSession(): XRSession | null;
      setSession(session: XRSession): Promise<void>;
      setFramebufferScaleFactor(scale: number): void;
      setReferenceSpaceType(type: XRReferenceSpaceType): void;
      getReferenceSpace(): XRReferenceSpace | null;
      getController(id: number): THREE.Object3D;
      getControllerGrip(id: number): THREE.Object3D;
      getHand(id: number): THREE.Object3D;
    };
  }

  /**
   * Extended Scene with AR/VR session data
   */
  interface Scene {
    userData: {
      /** Active AR session if in AR mode */
      arSession?: XRSession;
      /** Active VR session if in VR mode */
      vrSession?: XRSession;
      /** Flag indicating if scene is in AR mode */
      isAR?: boolean;
      /** Flag indicating if scene is in VR mode */
      isVR?: boolean;
      /** Custom user data */
      [key: string]: unknown;
    };
  }

  /**
   * Extended Object3D with hand tracking support
   */
  interface Object3D {
    userData: {
      /** Custom user data */
      [key: string]: unknown;
      
      /** Hand tracking configuration */
      handTracking?: {
        /** Name of the hand joint */
        jointName?: XRHandJoint;
        /** Which hand this object is tracking */
        handSide?: 'left' | 'right';
        /** Joint index if applicable */
        index?: number;
      };
    };
  }
}

// WebXR Type Declarations - Extend global WebXR API types
declare global {
  // Extend the global Window interface for AR/VR
  interface Window {
    // AR.js globals
    XR8?: any;
    ARController?: any;
    ARCameraParam?: any;
    ARThreeOnLoad?: () => void;
    THREEx?: {
      ArToolkitContext?: any;
      ArToolkitSource?: any;
      ArMarkerControls?: any;
    };
  }

  // WebXR Type Declarations
  interface XRFrame {
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
    getPose(space: XRSpace, baseSpace: XRReferenceSpace): XRPose | null;
    readonly session: XRSession;
    readonly predictedDisplayTime: number;
  }

  interface XRViewerPose extends XRPose {
    readonly transform: XRRigidTransform;
    readonly views: readonly XRView[];
  }

  interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
    readonly inverse: XRRigidTransform;
  }

  interface XRView {
    readonly eye: XREye;
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
    readonly recommendedViewportScale?: number;
    readonly isFirstPersonObserver?: boolean;
  }

  type XREye = 'none' | 'left' | 'right';

  interface XRPose {
    readonly transform: XRRigidTransform;
    readonly emulatedPosition: boolean;
  }
}

/**
 * Type definitions for AR.js Three.js integration
 * 
 * These types provide TypeScript support for AR.js components
 * when used with Three.js
 */
declare module '@ar-js-org/ar.js/three.js/build/ar-threex' {
  import * as THREE from 'three';

  export class ArToolkitSource {
    constructor(parameters: {
      sourceType?: 'webcam' | 'image' | 'video';
      sourceUrl?: string;
      sourceWidth?: number;
      sourceHeight?: number;
      displayWidth?: number;
      displayHeight?: number;
    });
    init(onReady: () => void, onError: (error: Error) => void): void;
    onResize(): void;
    copySizeTo(element: HTMLElement): void;
    domElement: HTMLElement;
  }

  export class ArToolkitContext {
    constructor(parameters: {
      cameraParametersUrl: string;
      detectionMode?: 'color' | 'color_and_matrix' | 'mono' | 'mono_and_matrix';
      maxDetectionRate?: number;
      canvasWidth?: number;
      canvasHeight?: number;
      debug?: boolean;
    });
    init(onCompleted: () => void): void;
    update(arScene: THREE.Scene, arCamera: THREE.Camera): void;
    getProjectionMatrix(): THREE.Matrix4;
  }

  export class ArMarkerControls {
    constructor(
      context: ArToolkitContext,
      object3d: THREE.Object3D,
      parameters: {
        type: 'pattern' | 'barcode' | 'unknown';
        patternUrl?: string;
        barcodeValue?: number;
        changeMatrixMode?: 'modelViewMatrix' | 'cameraTransformMatrix';
      }
    );
  }
}

/**
 * Type definitions for React Three XR
 * 
 * These types provide TypeScript support for React Three XR components
 * and hooks used in the AR/VR core package
 */
declare module '@react-three/xr' {
  import * as React from 'react';
  import * as THREE from 'three';
  
  export const VRButton: React.FC<{
    sessionInit?: XRSessionInit;
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
    children?: React.ReactNode;
  }>;
  
  export const XR: React.FC<{
    children: React.ReactNode;
  }>;
  
  export const Controllers: React.FC;
  export const Hands: React.FC<{
    modelLeft?: string;
    modelRight?: string;
  }>;
  
  export const useXR: () => {
    isPresenting: boolean;
    player: THREE.Group & {
      position: THREE.Vector3;
      rotation: THREE.Euler;
    };
    isHandTracking: boolean;
  };
  
  export const useXRFrame: (callback: (time: number, xrFrame: XRFrame) => void) => void;
}

// Re-export Three.js types with our extensions
export * from 'three';

// Export augmented types for external use
export type {
  XRFrame,
  XRViewerPose,
  XRRigidTransform,
  XRView,
  XREye,
  XRPose,
  XRReferenceSpace,
  XRSession,
  XRReferenceSpaceType,
  XRHandJoint
} from 'webxr';
