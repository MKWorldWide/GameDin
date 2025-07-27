// Mock WebXR API
const mockXR = {
  isSessionSupported: jest.fn().mockResolvedValue(true),
  requestSession: jest.fn().mockResolvedValue({
    end: jest.fn().mockResolvedValue(undefined),
    updateWorldTrackingState: jest.fn(),
    requestHitTestSource: jest.fn(),
    requestHitTestSourceForTransientInput: jest.fn(),
    requestLightProbe: jest.fn(),
    requestReferenceSpace: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }),
};

// Mock WebGL context
const mockWebGLContext = {
  getExtension: jest.fn().mockReturnValue({}),
  getParameter: jest.fn().mockReturnValue(16), // Default to 16x MSAA samples
  canvas: {
    width: 300,
    height: 150,
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  scissor: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  getExtension: jest.fn().mockReturnValue({
    setCompatibleXRDevice: jest.fn(),
  }),
  makeXRCompatible: jest.fn().mockResolvedValue(undefined),
};

// Mock WebGLRenderingContext
const mockGetContext = jest.fn().mockReturnValue(mockWebGLContext);

// Mock HTMLCanvasElement
Object.defineProperty(global.HTMLCanvasElement.prototype, 'getContext', {
  value: mockGetContext,
});

// Mock WebXR Device API
Object.defineProperty(global.navigator, 'xr', {
  value: mockXR,
  configurable: true,
  writable: true,
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return window.setTimeout(callback, 0);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

// Mock ResizeObserver
class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserver;

// Mock matchMedia
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock THREE.js WebGLRenderer
jest.mock('three', () => {
  const THREE = jest.requireActual('three');
  
  // Mock WebGLRenderer
  const mockWebGLRenderer = jest.fn().mockImplementation(() => ({
    domElement: document.createElement('canvas'),
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    getContext: jest.fn().mockReturnValue(mockWebGLContext),
    getPixelRatio: jest.fn().mockReturnValue(1),
    setViewport: jest.fn(),
    setScissor: jest.fn(),
    setScissorTest: jest.fn(),
    setClearColor: jest.fn(),
    clear: jest.fn(),
    getSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
    getDrawingBufferSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
    getRenderTarget: jest.fn(),
    setRenderTarget: jest.fn(),
    readRenderTargetPixels: jest.fn(),
    copyFramebufferToTexture: jest.fn(),
    copyTextureToTexture: jest.fn(),
    copyTextureToTexture3D: jest.fn(),
    setAnimationLoop: jest.fn(),
    initTexture: jest.fn(),
  }));
  
  return {
    ...THREE,
    WebGLRenderer: mockWebGLRenderer,
  };
});

// Mock @react-three/fiber
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useFrame: jest.fn((callback) => {
    // Call the callback once to test the animation frame
    callback({ clock: { getDelta: () => 0.016 } });
  }),
  useThree: jest.fn(() => ({
    camera: { position: { set: jest.fn() } },
    scene: { add: jest.fn(), remove: jest.fn() },
    gl: { domElement: document.createElement('canvas') },
    size: { width: 800, height: 600 },
    viewport: { width: 800, height: 600 },
  })),
}));

// Mock @react-three/drei
jest.mock('@react-three/drei', () => ({
  ...jest.requireActual('@react-three/drei'),
  OrbitControls: () => null,
  Text3D: ({ children, ...props }: any) => (
    <mesh {...props}>
      <textGeometry args={[children, { size: 0.2, height: 0.01 }]} />
      <meshStandardMaterial />
    </mesh>
  ),
}));

// Mock @react-three/xr
jest.mock('@react-three/xr', () => ({
  ...jest.requireActual('@react-three/xr'),
  XR: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  VRButton: () => <div data-testid="vr-button">VR Button</div>,
  Controllers: () => null,
  Hands: () => null,
  useXR: () => ({
    isPresenting: false,
    isHandTracking: false,
    player: { position: [0, 0, 0] },
  }),
}));

// Mock AR.js
jest.mock('@ar-js-org/ar.js/three.js/build/ar-threex', () => ({
  ArToolkitContext: jest.fn().mockImplementation(() => ({
    init: jest.fn((callback) => callback()),
    update: jest.fn(),
    getProjectionMatrix: jest.fn(() => new (require('three').Matrix4)()),
    arController: {
      debugSetup: jest.fn(),
      loadMarker: jest.fn(),
    },
  })),
  
  ArToolkitSource: jest.fn().mockImplementation(() => ({
    init: jest.fn((onReady) => {
      onReady();
      return Promise.resolve();
    }),
    domElement: document.createElement('video'),
    ready: true,
    on: jest.fn(),
  })),
  
  ArToolkitProfile: {
    // Mock profile methods as needed
  },
}));
