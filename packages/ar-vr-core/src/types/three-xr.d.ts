// Type definitions for Three.js XR/WebXR integration
// Project: @gamedin/ar-vr-core

import * as THREE from 'three';

declare module 'three' {
  // Extend WebGLRenderer with XR-specific properties and methods
  interface WebGLRenderer {
    xr: {
      enabled: boolean;
      isPresenting: boolean;
      getSession(): XRSession | null;
      setSession(session: XRSession): Promise<void>;
      setFramebufferScaleFactor(scale: number): void;
      setReferenceSpaceType(type: XRReferenceSpaceType): void;
      getReferenceSpace(): XRReferenceSpace | null;
      getController(id: number): THREE.Group;
      getControllerGrip(id: number): THREE.Group;
      getHand(id: number): THREE.Group;
    };
  }

  // Extend Scene with XR-specific properties
  interface Scene {
    userData: {
      arSession?: XRSession;
      vrSession?: XRSession;
      isAR?: boolean;
      isVR?: boolean;
    };
  }

  // Extend Object3D with XR-specific properties
  interface Object3D {
    userData: {
      [key: string]: any;
      handTracking?: {
        jointName?: XRHandJoint;
        handSide?: 'left' | 'right';
        index?: number;
      };
    };
  }
}

// Global WebXR types
declare global {
  // Extend Window interface for WebXR globals
  interface Window {
    XR8?: any;
    THREE?: any;
    THREEx?: any;
    WebXRPolyfill?: any;
    XR?: XRSystem;
    XRSession?: XRSession;
    XRWebGLLayer?: any;
    
    DeviceOrientationEvent?: {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
  }

  // WebXR Core Types
  type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
  type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';
  type XREnvironmentBlendMode = 'opaque' | 'additive' | 'alpha-blend';
  type XRVisibilityState = 'visible' | 'visible-blurred' | 'hidden';
  type XRHandedness = 'none' | 'left' | 'right';
  type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';
  type XRDepthUsage = 'cpu-optimized' | 'gpu-optimized';
  type XRDepthDataFormat = 'luminance-alpha' | 'float32';
  type XRLayerLayout = 'default' | 'mono' | 'stereo' | 'stereo-left-right' | 'stereo-top-bottom';
  type XREye = 'none' | 'left' | 'right';

  // WebXR Interfaces
  interface XR {
    isSessionSupported(sessionType: XRSessionMode): Promise<boolean>;
    requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  }

  interface XRSystem extends EventTarget {
    isSessionSupported(sessionType: XRSessionMode): Promise<boolean>;
    requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  }

  interface XRSessionInit {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
    trackedImages?: XRTrackedImageInit[];
    depthSensing?: XRDepthStateInit;
    domOverlay?: { root: HTMLElement };
  }

  interface XRDepthStateInit {
    usagePreference?: XRDepthUsage[];
    dataFormatPreference?: XRDepthDataFormat[];
  }

  interface XRSession extends EventTarget {
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    updateRenderState(state: XRRenderState): Promise<void>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
    end(): Promise<void>;
    
    readonly renderState: XRRenderState;
    readonly visibilityState: XRVisibilityState;
    readonly environmentBlendMode: XREnvironmentBlendMode;
    readonly inputSources: XRInputSourceArray;
  }

  interface XRFrameRequestCallback {
    (time: number, frame: XRFrame): void;
  }

  interface XRRenderState {
    readonly depthNear: number;
    readonly depthFar: number;
    readonly inlineVerticalFieldOfView: number | null;
    readonly baseLayer: XRWebGLLayer | null;
    readonly layers: XRLayer[] | null;
  }

  interface XRReferenceSpace extends EventTarget {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
  }

  interface XRRigidTransform {
    readonly position: DOMPointReadOnly;
    readonly orientation: DOMPointReadOnly;
    readonly matrix: Float32Array;
    readonly inverse: XRRigidTransform;
  }

  interface XRFrame {
    readonly session: XRSession;
    getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
    getPose(space: XRSpace, baseSpace: XRSpace): XRPose | null;
    getHitTestResults(hitTestSource: XRHitTestSource): XRHitTestResult[];
  }

  interface XRViewerPose extends XRPose {
    readonly views: XRView[];
  }

  interface XRView {
    readonly eye: XREye;
    readonly projectionMatrix: Float32Array;
    readonly transform: XRRigidTransform;
    readonly recommendedViewportScale?: number;
  }

  interface XRPose {
    readonly transform: XRRigidTransform;
    readonly emulatedPosition: boolean;
  }

  interface XRInputSourceArray extends Array<XRInputSource> {
    [index: number]: XRInputSource;
  }

  interface XRInputSource {
    readonly handedness: XRHandedness;
    readonly targetRayMode: XRTargetRayMode;
    readonly targetRaySpace: XRSpace;
    readonly gripSpace?: XRSpace;
    readonly gamepad?: Gamepad;
    readonly hand?: XRHand;
    readonly profiles: string[];
  }

  type XRHandJoint =
    | 'wrist'
    | 'thumb-metacarpal' | 'thumb-phalanx-proximal' | 'thumb-phalanx-distal' | 'thumb-tip'
    | 'index-finger-metacarpal' | 'index-finger-phalanx-proximal' | 'index-finger-phalanx-intermediate' | 'index-finger-phalanx-distal' | 'index-finger-tip'
    | 'middle-finger-metacarpal' | 'middle-finger-phalanx-proximal' | 'middle-finger-phalanx-intermediate' | 'middle-finger-phalanx-distal' | 'middle-finger-tip'
    | 'ring-finger-metacarpal' | 'ring-finger-phalanx-proximal' | 'ring-finger-phalanx-intermediate' | 'ring-finger-phalanx-distal' | 'ring-finger-tip'
    | 'pinky-finger-metacarpal' | 'pinky-finger-phalanx-proximal' | 'pinky-finger-phalanx-intermediate' | 'pinky-finger-phalanx-distal' | 'pinky-finger-tip';

  interface XRHand extends Map<XRHandJoint, XRJointSpace> {
    readonly size: number;
  }

  interface XRJointSpace extends XRSpace {
    readonly jointName: XRHandJoint;
  }

  interface XRSpace extends EventTarget {}

  interface XRHitTestSource {
    cancel(): void;
  }

  interface XRHitTestResult {
    getPose(baseSpace: XRSpace): XRPose | null;
  }

  interface XRWebGLLayerInit {
    antialias?: boolean;
    alpha?: boolean;
    depth?: boolean;
    stencil?: boolean;
    framebufferScaleFactor?: number;
  }

  interface XRWebGLLayer {
    readonly framebuffer: WebGLFramebuffer | null;
    readonly framebufferWidth: number;
    readonly framebufferHeight: number;
    getViewport(view: XRView): XRViewport;
  }

  interface XRViewport {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  }

  interface XRLayer extends EventTarget {
    readonly layout: XRLayerLayout;
  }

  interface XRTrackedImageInit {
    image: ImageBitmap;
    widthInMeters: number;
  }

  // Extend the global Document interface for pointer lock and fullscreen
  interface Document {
    pointerLockElement: Element | null;
    mozPointerLockElement?: Element | null;
    webkitPointerLockElement?: Element | null;
    msPointerLockElement?: Element | null;
    exitPointerLock: () => Promise<void>;
    mozExitPointerLock?: () => Promise<void>;
    webkitExitPointerLock?: () => Promise<void>;
    msExitPointerLock?: () => Promise<void>;
  }

  // Extend the global HTMLElement interface for pointer lock and fullscreen
  interface HTMLElement {
    requestPointerLock: () => void;
    mozRequestPointerLock?: () => void;
    webkitRequestPointerLock?: () => void;
    msRequestPointerLock?: () => void;
    requestFullscreen: (options?: FullscreenOptions) => Promise<void>;
    mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
    webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
    msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
  }
}
