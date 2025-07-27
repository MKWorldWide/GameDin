import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ARMarkerDetector } from '../../components/ARMarkerDetector';
import { useXR } from '../../hooks/useXR';
import * as THREE from 'three';

// Mock the useXR hook and other dependencies
jest.mock('../../hooks/useXR');

// Mock AR.js and Three.js dependencies
jest.mock('@ar-js-org/ar.js/three.js/build/ar-threex', () => ({
  ArToolkitContext: jest.fn().mockImplementation(() => ({
    init: jest.fn((callback) => callback()),
    update: jest.fn(),
    getProjectionMatrix: jest.fn(() => new THREE.Matrix4()),
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

// Mock Three.js
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      domElement: document.createElement('canvas'),
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      getContext: jest.fn().mockReturnValue({}),
      getPixelRatio: jest.fn().mockReturnValue(1),
      setViewport: jest.fn(),
      setScissor: jest.fn(),
      setScissorTest: jest.fn(),
      setClearColor: jest.fn(),
      clear: jest.fn(),
      getSize: jest.fn().mockReturnValue({ width: 800, height: 600 }),
      setAnimationLoop: jest.fn(),
    })),
    Scene: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      remove: jest.fn(),
      background: null,
    })),
    Camera: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      projectionMatrix: { copy: jest.fn() },
    })),
    AmbientLight: jest.fn().mockImplementation(() => ({
      // Mock light methods
    })),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      castShadow: true,
      shadow: {
        mapSize: { width: 2048, height: 2048 },
        camera: {
          left: -5,
          right: 5,
          top: 5,
          bottom: -5,
          near: 0.5,
          far: 500,
        },
      },
    })),
    Mesh: jest.fn().mockImplementation(() => ({
      rotation: { set: jest.fn() },
      position: { set: jest.fn() },
      receiveShadow: false,
    })),
    MeshStandardMaterial: jest.fn().mockImplementation(() => ({
      // Mock material methods
    })),
    PlaneGeometry: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
      x, y, z,
      set: jest.fn(),
      copy: jest.fn(),
      length: jest.fn(),
      normalize: jest.fn(),
      dot: jest.fn(),
      cross: jest.fn(),
      add: jest.fn(),
      sub: jest.fn(),
      multiplyScalar: jest.fn(),
      applyMatrix4: jest.fn(),
    })),
    Matrix4: jest.fn().mockImplementation(() => ({
      elements: new Array(16).fill(0),
      makeRotationX: jest.fn(),
      makeRotationY: jest.fn(),
      makeRotationZ: jest.fn(),
      makeTranslation: jest.fn(),
      makeScale: jest.fn(),
      compose: jest.fn(),
      copy: jest.fn(),
      multiply: jest.fn(),
      multiplyMatrices: jest.fn(),
      invert: jest.fn(),
      setPosition: jest.fn(),
    })),
    Object3D: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
      add: jest.fn(),
      remove: jest.fn(),
      traverse: jest.fn(),
      updateMatrix: jest.fn(),
      updateMatrixWorld: jest.fn(),
    })),
    Group: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      rotation: { set: jest.fn() },
      scale: { set: jest.fn() },
      add: jest.fn(),
      remove: jest.fn(),
      traverse: jest.fn(),
      updateMatrix: jest.fn(),
      updateMatrixWorld: jest.fn(),
    })),
  };
});

const mockUseXR = useXR as jest.MockedFunction<typeof useXR>;

describe('ARMarkerDetector', () => {
  const defaultXRState = {
    isARSupported: true,
    isVRSupported: false,
    isMobile: true,
    isHeadsetConnected: false,
    deviceType: 'ar' as const,
    supportLevel: 'full' as const,
    deviceInfo: {
      isMobile: true,
      isIOS: true,
      isTablet: false,
      orientation: 'portrait' as const,
      userAgent: 'test-user-agent',
    },
    features: {
      handTracking: false,
      hitTest: true,
      lightEstimation: true,
      anchors: true,
      depthSensing: false,
    },
    sessionModes: {
      inline: true,
      'immersive-vr': false,
      'immersive-ar': true,
    },
    isInXRSession: false,
    sessionType: null,
    isARMode: false,
    isVRMode: false,
    checkCapabilities: jest.fn(),
    setXRSession: jest.fn(),
    exitXRSession: jest.fn(),
    setARMode: jest.fn(),
    setVRMode: jest.fn(),
  };

  const defaultMarkers = [
    {
      patternUrl: '/markers/pattern-marker.patt',
      markerType: 'pattern' as const,
    },
  ];

  const defaultProps = {
    markers: defaultMarkers,
    cameraParametersUrl: '/camera_para.dat',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseXR.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(defaultXRState);
      }
      return defaultXRState;
    });
  });

  it('should render loading state initially', () => {
    render(<ARMarkerDetector {...defaultProps} />);
    
    expect(screen.getByText('Initializing AR...')).toBeInTheDocument();
  });

  it('should render error message when AR is not supported', async () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isARSupported: false,
      supportLevel: 'none',
    }));
    
    render(<ARMarkerDetector {...defaultProps} />);
    
    expect(screen.getByText(/AR is not supported on this device/)).toBeInTheDocument();
  });

  it('should call onInitialized when AR is initialized', async () => {
    const onInitialized = jest.fn();
    
    await act(async () => {
      render(
        <ARMarkerDetector
          {...defaultProps}
          onInitialized={onInitialized}
        />
      );
    });
    
    expect(onInitialized).toHaveBeenCalled();
  });

  it('should call onError when initialization fails', async () => {
    const error = new Error('AR initialization failed');
    const onError = jest.fn();
    
    // Mock ArToolkitSource.init to reject
    const mockArToolkitSource = require('@ar-js-org/ar.js/three.js/build/ar-threex').ArToolkitSource;
    mockArToolkitSource.mockImplementationOnce(() => ({
      init: jest.fn(() => Promise.reject(error)),
      domElement: document.createElement('video'),
      ready: false,
      on: jest.fn(),
    }));
    
    await act(async () => {
      render(
        <ARMarkerDetector
          {...defaultProps}
          onError={onError}
        />
      );
    });
    
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle marker detection', async () => {
    const onMarkerDetected = jest.fn();
    const onMarkerLost = jest.fn();
    
    const markers = [
      {
        ...defaultMarkers[0],
        onDetected: onMarkerDetected,
        onLost: onMarkerLost,
      },
    ];
    
    await act(async () => {
      render(
        <ARMarkerDetector
          {...defaultProps}
          markers={markers}
        >
          <div data-testid="ar-content">AR Content</div>
        </ARMarkerDetector>
      );
    });
    
    // Simulate marker found event
    const arContext = require('@ar-js-org/ar.js/three.js/build/ar-threex').ArToolkitContext;
    const mockContext = arContext.mock.results[0].instance;
    const markerFoundEvent = { type: 'pattern' };
    
    act(() => {
      // Find the markerFound event listener and call it
      const markerFoundListener = mockContext.addEventListener.mock.calls.find(
        ([eventName]) => eventName === 'markerFound'
      )?.[1];
      
      if (markerFoundListener) {
        markerFoundListener(markerFoundEvent);
      }
    });
    
    expect(onMarkerDetected).toHaveBeenCalledWith(markerFoundEvent);
    
    // Simulate marker lost event
    act(() => {
      const markerLostListener = mockContext.addEventListener.mock.calls.find(
        ([eventName]) => eventName === 'markerLost'
      )?.[1];
      
      if (markerLostListener) {
        markerLostListener(markerFoundEvent);
      }
    });
    
    expect(onMarkerLost).toHaveBeenCalled();
  });

  it('should clean up resources on unmount', async () => {
    const { unmount } = render(
      <ARMarkerDetector {...defaultProps}>
        <div data-testid="ar-content">AR Content</div>
      </ARMarkerDetector>
    );
    
    await act(async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    // Get the mock renderer instance
    const mockRenderer = new (require('three').WebGLRenderer)();
    
    unmount();
    
    // Verify cleanup was called
    expect(mockRenderer.dispose).toHaveBeenCalled();
    expect(mockRenderer.setAnimationLoop).toHaveBeenCalledWith(null);
  });
});
