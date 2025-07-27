// Main type definitions for @gamedin/ar-vr-core

// Core types
export * from './global';
export * from './window';

// Three.js and React Three Fiber extensions
export * from './three-extensions';
export * from './r3f-extensions';

// AR/VR specific types
declare module '@gamedin/ar-vr-core' {
  // Core types
  export interface XRState {
    isPresenting: boolean;
    isHandTracking: boolean;
    isARSupported: boolean;
    isVRSupported: boolean;
    session: XRSession | null;
    sessionMode: XRSessionMode | null;
    referenceSpace: XRReferenceSpace | null;
    frameRate: number | null;
    frame: XRFrame | null;
    viewerPose: XRViewerPose | null;
    inputSources: XRInputSourceArray;
    hands: {
      left: XRHand | null;
      right: XRHand | null;
    };
    performance: {
      fps: number;
      frameTime: number;
      drawCalls: number;
      triangles: number;
      points: number;
      lines: number;
    };
  }

  // AR/VR Session Configuration
  export interface XRSessionConfig {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
    referenceSpaceType?: XRReferenceSpaceType;
    frameRate?: number;
    depthSensing?: {
      usagePreference?: XRDepthUsage[];
      dataFormatPreference?: XRDepthDataFormat[];
    };
    domOverlay?: {
      root: HTMLElement;
    };
    layers?: {
      type: 'mono' | 'stereo' | 'stereo-left-right' | 'stereo-top-bottom';
      layout?: 'default' | 'mono' | 'stereo-left-right' | 'stereo-top-bottom';
      framebufferScaleFactor?: number;
    };
  }

  // AR/VR Events
  export type XREventType =
    | 'sessionstart'
    | 'sessionend'
    | 'select'
    | 'selectstart'
    | 'selectend'
    | 'squeeze'
    | 'squeezestart'
    | 'squeezeend'
    | 'connected'
    | 'disconnected'
    | 'visibilitychange'
    | 'frameratechange'
    | 'handtracking'
    | 'hittest'
    | 'planeadded'
    | 'planeremoved'
    | 'planechanged'
    | 'anchorsupdated';

  export interface XREvent<T = any> extends Event {
    type: XREventType;
    target: EventTarget | null;
    data?: T;
  }

  // AR/VR Components
  export interface ARProps {
    enabled?: boolean;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
    sessionInit?: XRSessionInit;
    children?: React.ReactNode;
  }

  export interface VRProps {
    enabled?: boolean;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
    sessionInit?: XRSessionInit;
    children?: React.ReactNode;
  }

  // AR/VR Hooks
  export function useXR(): XRState;
  export function useXREvent(
    type: XREventType,
    handler: (event: XREvent) => void,
    target?: EventTarget
  ): void;
  export function useARManager(): {
    startARSession: (options?: XRSessionConfig) => Promise<XRSession>;
    stopARSession: () => Promise<void>;
    state: XRState;
  };
  export function useVRManager(): {
    startVRSession: (options?: XRSessionConfig) => Promise<XRSession>;
    stopVRSession: () => Promise<void>;
    state: XRState;
  };
  export function useHandTracking(options?: {
    enabled?: boolean;
    hand?: 'left' | 'right' | 'both';
  }): {
    left: XRHand | null;
    right: XRHand | null;
    isTracking: boolean;
  };

  // AR/VR Components
  export const AR: React.FC<ARProps>;
  export const VR: React.FC<VRProps>;
  export const XRButton: React.FC<{
    mode: 'AR' | 'VR';
    sessionInit?: XRSessionInit;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
  }>;
  export const ARHitTest: React.FC<{
    onHit?: (hit: THREE.Intersection) => void;
    onMiss?: () => void;
    planeType?: 'horizontal' | 'vertical' | 'any';
    offset?: [number, number, number];
    children?: React.ReactNode;
  }>;
  export const ARAnchor: React.FC<{
    uid: string;
    type?: 'plane' | 'image' | 'face' | 'object';
    onFound?: () => void;
    onLost?: () => void;
    children?: React.ReactNode;
  }>;
  export const VRController: React.FC<{
    hand: 'left' | 'right' | 'none';
    model?: boolean;
    modelLeft?: string;
    modelRight?: string;
    modelColor?: string;
    children?: React.ReactNode;
  }>;
  export const VRHand: React.FC<{
    hand: 'left' | 'right';
    model?: boolean;
    jointRadius?: number;
    jointColor?: string | number;
    jointOpacity?: number;
    children?: React.ReactNode;
  }>;
  export const Teleport: React.FC<{
    points?: THREE.Vector3[];
    maxDistance?: number;
    curvePoints?: number;
    lineColor?: string | number;
    lineWidth?: number;
    onTeleport?: (position: THREE.Vector3) => void;
    children?: React.ReactNode;
  }>;
  export const PerformanceMonitor: React.FC<{
    threshold?: number;
    factor?: number;
    step?: number;
    onIncline?: () => void;
    onDecline?: () => void;
    onChange?: (fps: number, factor: number) => void;
    children?: React.ReactNode | (({ factor }: { factor: number }) => React.ReactNode);
  }>;

  // Re-export Three.js and React Three Fiber types
export * from 'three';
export * from '@react-three/fiber';
export * from '@react-three/drei';
export * from '@react-three/xr';
}

// Global augmentation for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // AR/VR specific components
      'ar-session': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'onSessionStart'?: (event: CustomEvent<XRSession>) => void;
          'onSessionEnd'?: () => void;
          'onError'?: (event: CustomEvent<Error>) => void;
        },
        HTMLElement
      >;
      'vr-session': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'onSessionStart'?: (event: CustomEvent<XRSession>) => void;
          'onSessionEnd'?: () => void;
          'onError'?: (event: CustomEvent<Error>) => void;
        },
        HTMLElement
      >;
      'xr-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'mode'?: 'AR' | 'VR';
          'onSessionStart'?: (event: CustomEvent<XRSession>) => void;
          'onSessionEnd'?: () => void;
          'onError'?: (event: CustomEvent<Error>) => void;
        },
        HTMLElement
      >;
    }
  }
}

// This export is needed to make this a module
export {};
