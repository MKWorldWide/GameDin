// WebXR Device API
declare interface XR extends EventTarget {
  isSessionSupported(sessionType: XRSessionMode): Promise<boolean>;
  requestSession(sessionType: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  readonly session: XRSession | null;
  ondevicechange: ((this: XR, event: Event) => any) | null;
}

declare interface Navigator {
  xr?: XR;
  getVRDisplays?(): Promise<VRDisplay[]>;
}

// WebXR Session Types
type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

declare interface XRSessionInit {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
  domOverlay?: { root: HTMLElement };
}

declare interface XRSession extends EventTarget {
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  updateRenderState(state: XRRenderStateInit): Promise<void>;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  end(): Promise<void>;
  readonly renderState: XRRenderState;
  readonly inputSources: XRInputSourceArray;
  addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
}

declare interface XRFrameRequestCallback {
  (time: number, frame: XRFrame): void;
}

// WebXR Reference Space
declare interface XRReferenceSpace extends EventTarget {
  getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
  onreset: ((this: XRReferenceSpace, event: XRReferenceSpaceEvent) => any) | null;
}

declare interface XRReferenceSpaceEvent extends Event {
  readonly referenceSpace: XRReferenceSpace;
  readonly transform?: XRRigidTransform;
}

// WebXR Rigid Transform
declare interface XRRigidTransform {
  readonly position: DOMPointReadOnly;
  readonly orientation: DOMPointReadOnly;
  readonly matrix: Float32Array;
  readonly inverse: XRRigidTransform;
}

// WebXR Input Sources
declare interface XRInputSourceArray extends Array<XRInputSource> {
  [index: number]: XRInputSource;
  get(identifier: string): XRInputSource | null;
}

declare interface XRInputSource {
  readonly handedness: XRHandedness;
  readonly targetRayMode: XRTargetRayMode;
  readonly targetRaySpace: XRSpace;
  readonly gripSpace?: XRSpace;
  readonly gamepad?: Gamepad;
  readonly profiles: string[];
  readonly hand?: XRHand;
}

type XRHandedness = 'none' | 'left' | 'right';
type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';

// WebXR Hand Tracking
declare interface XRHand extends Map<XRHandJoint, XRJointSpace> {
  readonly size: number;
  get(joint: XRHandJoint): XRJointSpace | undefined;
  entries(): IterableIterator<[XRHandJoint, XRJointSpace]>;
  keys(): IterableIterator<XRHandJoint>;
  values(): IterableIterator<XRJointSpace>;
  [Symbol.iterator](): IterableIterator<[XRHandJoint, XRJointSpace]>;
}

type XRHandJoint =
  | 'wrist'
  | 'thumb-metacarpal' | 'thumb-phalanx-proximal' | 'thumb-phalanx-distal' | 'thumb-tip'
  | 'index-finger-metacarpal' | 'index-finger-phalanx-proximal' | 'index-finger-phalanx-intermediate' | 'index-finger-phalanx-distal' | 'index-finger-tip'
  | 'middle-finger-metacarpal' | 'middle-finger-phalanx-proximal' | 'middle-finger-phalanx-intermediate' | 'middle-finger-phalanx-distal' | 'middle-finger-tip'
  | 'ring-finger-metacarpal' | 'ring-finger-phalanx-proximal' | 'ring-finger-phalanx-intermediate' | 'ring-finger-phalanx-distal' | 'ring-finger-tip'
  | 'pinky-finger-metacarpal' | 'pinky-finger-phalanx-proximal' | 'pinky-finger-phalanx-intermediate' | 'pinky-finger-phalanx-distal' | 'pinky-finger-tip';

declare interface XRJointSpace extends XRSpace {
  readonly jointName: XRHandJoint;
}

// WebXR Space
declare interface XRSpace extends EventTarget {}

// WebXR Frame
declare interface XRFrame {
  readonly session: XRSession;
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
  getPose(space: XRSpace, baseSpace: XRSpace): XRPose | null;
  getJointPose(joint: XRJointSpace, baseSpace: XRSpace): XRJointPose | null;
  getHitTestResults(/* ... */): XRHitTestResult[];
  getHitTestResultsForTransientInput(/* ... */): XRTransientInputHitTestResult[];
}

declare interface XRViewerPose extends XRPose {
  readonly views: XRView[];
}

declare interface XRView {
  readonly eye: XREye;
  readonly projectionMatrix: Float32Array;
  readonly transform: XRRigidTransform;
  requestViewportScale(scale: number | null): void;
}

type XREye = 'none' | 'left' | 'right';

declare interface XRPose {
  readonly transform: XRRigidTransform;
  readonly emulatedPosition: boolean;
  readonly linearVelocity?: DOMPointReadOnly;
  readonly angularVelocity?: DOMPointReadOnly;
}

declare interface XRJointPose extends XRPose {
  readonly radius: number | undefined;
}

// WebXR Render State
declare interface XRRenderState {
  readonly depthNear: number;
  readonly depthFar: number;
  readonly inlineVerticalFieldOfView: number | null;
  readonly baseLayer: XRWebGLLayer | null;
  readonly outputCanvas: HTMLCanvasElement | null;
  readonly outputContext: any;
}

declare interface XRRenderStateInit {
  depthNear?: number;
  depthFar?: number;
  inlineVerticalFieldOfView?: number;
  baseLayer?: XRWebGLLayer | null;
  outputContext?: any;
}

// WebXR WebGL Layer
declare interface XRWebGLLayerInit {
  antialias?: boolean;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  framebufferScaleFactor?: number;
}

declare class XRWebGLLayer {
  constructor(session: XRSession, context: WebGLRenderingContext | WebGL2RenderingContext, layerInit?: XRWebGLLayerInit);
  readonly antialias: boolean;
  readonly framebuffer: WebGLFramebuffer | null;
  readonly framebufferWidth: number;
  readonly framebufferHeight: number;
  getViewport(view: XRView): XRViewport;
  static getNativeFramebufferScaleFactor(session: XRSession): number;
}

declare interface XRViewport {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// Legacy WebVR API (for backward compatibility)
declare interface VRDisplay extends EventTarget {
  isConnected: boolean;
  isPresenting: boolean;
  capabilities: VRDisplayCapabilities;
  stageParameters: VRStageParameters | null;
  displayId: number;
  displayName: string;
  requestPresent(layers: VRSource[]): Promise<void>;
  exitPresent(): Promise<void>;
  getPose(): VRPose;
  requestAnimationFrame(callback: FrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  submitFrame(): void;
  getLayers(): VRLayerInit[];
  depthNear: number;
  depthFar: number;
}

declare interface VRDisplayCapabilities {
  hasPosition: boolean;
  hasExternalDisplay: boolean;
  canPresent: boolean;
  maxLayers: number;
  hasStereo: boolean;
}

declare interface VRStageParameters {
  sittingToStandingTransform: Float32Array | null;
  sizeX: number;
  sizeZ: number;
}

declare interface VRPose {
  readonly timestamp: number;
  readonly position: Float32Array | null;
  readonly linearVelocity: Float32Array | null;
  readonly linearAcceleration: Float32Array | null;
  readonly orientation: Float32Array | null;
  readonly angularVelocity: Float32Array | null;
  readonly angularAcceleration: Float32Array | null;
}

type VRSource = HTMLCanvasElement | OffscreenCanvas;

declare interface VRLayerInit {
  source?: VRSource | null;
  leftBounds?: number[] | Float32Array | null;
  rightBounds?: number[] | Float32Array | null;
}

// Zustand type declarations
declare module 'zustand' {
  export * from 'zustand/index';
}

declare module 'zustand/middleware' {
  export * from 'zustand/middleware';
}

declare module 'zustand/persist' {
  export * from 'zustand/persist';
}

declare module 'zustand/middleware/immer' {
  export * from 'zustand/middleware/immer';
}
