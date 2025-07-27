import * as React from 'react';
import * as THREE from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // AR/VR specific components
      'arSession': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
      'vrSession': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D>;
      
      // Controllers and inputs
      'vrController': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        hand?: 'left' | 'right' | 'none';
        model?: boolean;
        modelLeft?: string;
        modelRight?: string;
        modelColor?: string;
      };
      
      'vrHand': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        hand: 'left' | 'right';
        model?: boolean;
        jointRadius?: number;
        jointColor?: string | number;
        jointOpacity?: number;
      };
      
      // Navigation and interaction
      'teleport': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        points?: THREE.Vector3[];
        maxDistance?: number;
        curvePoints?: number;
        lineColor?: string | number;
        lineWidth?: number;
      };
      
      // UI and overlays
      'vrOverlay': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        position?: [number, number, number];
        rotation?: [number, number, number];
        scale?: number | [number, number, number];
        fixedSize?: boolean;
        pixelRatio?: number;
      };
      
      // Environment
      'vrEnvironment': ReactThreeFiber.Object3DNode<THREE.Scene, typeof THREE.Scene> & {
        background?: string | number | THREE.Texture;
        environment?: string | THREE.Texture;
        ground?: boolean | { radius?: number; color?: string | number; };
        skybox?: string | string[] | THREE.Texture | THREE.CubeTexture;
      };
      
      // AR specific
      'arHitTest': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        onHit?: (hit: THREE.Intersection) => void;
        onMiss?: () => void;
        planeType?: 'horizontal' | 'vertical' | 'any';
        offset?: [number, number, number];
      };
      
      'arAnchor': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        uid: string;
        type?: 'plane' | 'image' | 'face' | 'object';
        onFound?: () => void;
        onLost?: () => void;
      };
      
      // Performance
      'performanceMonitor': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        threshold?: number;
        factor?: number;
        step?: number;
        onIncline?: () => void;
        onDecline?: () => void;
        onChange?: (fps: number, factor: number) => void;
      };
      
      // Accessibility
      'vrAccessibility': ReactThreeFiber.Object3DNode<THREE.Object3D, typeof THREE.Object3D> & {
        enabled?: boolean;
        debug?: boolean;
        maxZIndex?: number;
        zIndexRange?: [number, number];
        onFocus?: (target: THREE.Object3D) => void;
        onBlur?: (target: THREE.Object3D) => void;
        onClick?: (target: THREE.Object3D) => void;
      };
    }
  }
}

// Extend React Three Fiber's useFrame hook
declare module '@react-three/fiber' {
  export interface ThreeEvent<T = Event> extends ThreeEventDispatcher<T> {
    // AR/VR specific event properties
    intersection?: THREE.Intersection;
    intersections: THREE.Intersection[];
    stopped: boolean;
    unprojectedPoint: THREE.Vector3;
    ray: THREE.Ray;
    camera: THREE.Camera;
    sourceEvent: T;
    delta: number;
    
    // AR/VR specific methods
    stopPropagation: () => void;
    
    // Controller events
    controller?: {
      hand: 'left' | 'right' | 'none';
      target: THREE.XRTargetRaySpace;
      grip: THREE.XRGripSpace;
      inputSource: XRInputSource;
    };
  }
  
  export interface UseFrameOptions {
    // AR/VR specific frame options
    vr?: boolean;
    ar?: boolean;
    priority?: number;
    renderPriority?: number;
  }
  
  export function useFrame(
    callback: (state: RootState, delta: number, frame?: XRFrame) => void,
    renderPriority?: number,
    options?: UseFrameOptions
  ): null;
}

// Extend React Three Drei types
declare module '@react-three/drei' {
  export interface VRCanvasProps {
    // AR/VR specific canvas props
    vr?: boolean;
    ar?: boolean;
    sessionInit?: XRSessionInit;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
  }
  
  export interface ARCanvasProps extends VRCanvasProps {
    arEnabled?: boolean;
    tracking?: boolean;
    children?: React.ReactNode;
  }
  
  export interface VRButtonProps {
    sessionInit?: XRSessionInit;
    onSessionStart?: (session: XRSession) => void;
    onSessionEnd?: () => void;
    onError?: (error: Error) => void;
    children?: React.ReactNode;
  }
}

// This export is needed to make this a module
export {};
