import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { VRScene } from '../../components/VRScene';
import { useXR } from '../../hooks/useXR';

// Mock the useXR hook and other dependencies
jest.mock('../../hooks/useXR');
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-canvas">{children}</div>
  ),
  useThree: jest.fn(),
}));

// Mock child components
jest.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Text3D: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="text-3d">{children}</div>
  ),
}));

jest.mock('@react-three/xr', () => ({
  XR: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="xr-provider">{children}</div>
  ),
  VRButton: () => <button data-testid="vr-button">Enter VR</button>,
  Controllers: () => <div data-testid="controllers" />,
  Hands: () => <div data-testid="hands" />,
}));

const mockUseXR = useXR as jest.MockedFunction<typeof useXR>;

describe('VRScene', () => {
  const defaultXRState = {
    isARSupported: false,
    isVRSupported: true, // Default to VR supported for most tests
    isMobile: false,
    isHeadsetConnected: false,
    deviceType: 'vr' as const,
    supportLevel: 'full' as const,
    deviceInfo: {
      isMobile: false,
      isIOS: false,
      isTablet: false,
      orientation: 'landscape' as const,
      userAgent: 'test-user-agent',
    },
    features: {
      handTracking: true,
      hitTest: true,
      lightEstimation: true,
      anchors: true,
      depthSensing: true,
    },
    sessionModes: {
      inline: true,
      'immersive-vr': true,
      'immersive-ar': false,
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseXR.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(defaultXRState);
      }
      return defaultXRState;
    });
  });

  it('should render VR scene with default props', () => {
    render(
      <VRScene>
        <div data-testid="child-content">Test Content</div>
      </VRScene>
    );

    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('vr-button')).toBeInTheDocument();
    expect(screen.getByTestId('xr-provider')).toBeInTheDocument();
    expect(screen.getByTestId('controllers')).toBeInTheDocument();
    expect(screen.getByTestId('hands')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should show error message when VR is not supported', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isVRSupported: false,
      supportLevel: 'none',
    }));

    render(<VRScene />);
    
    expect(screen.getByText('VR is not supported on this device.')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-canvas')).not.toBeInTheDocument();
  });

  it('should call onSessionStart when VR session starts', () => {
    const onSessionStart = jest.fn();
    const onSessionEnd = jest.fn();
    
    render(
      <VRScene 
        onSessionStart={onSessionStart}
        onSessionEnd={onSessionEnd}
      />
    );
    
    // Simulate XR session start
    const xrProvider = screen.getByTestId('xr-provider');
    const startEvent = new Event('sessionstart');
    Object.defineProperty(startEvent, 'session', {
      value: { type: 'immersive-vr' },
    });
    
    act(() => {
      xrProvider.dispatchEvent(startEvent);
    });
    
    expect(onSessionStart).toHaveBeenCalled();
    expect(onSessionEnd).not.toHaveBeenCalled();
  });

  it('should call onSessionEnd when VR session ends', () => {
    const onSessionStart = jest.fn();
    const onSessionEnd = jest.fn();
    
    render(
      <VRScene 
        onSessionStart={onSessionStart}
        onSessionEnd={onSessionEnd}
      />
    );
    
    // Simulate XR session end
    const xrProvider = screen.getByTestId('xr-provider');
    const endEvent = new Event('sessionend');
    
    act(() => {
      xrProvider.dispatchEvent(endEvent);
    });
    
    expect(onSessionEnd).toHaveBeenCalled();
    expect(onSessionStart).not.toHaveBeenCalled();
  });

  it('should apply custom className to container', () => {
    const customClass = 'custom-vr-scene';
    render(<VRScene className={customClass} />);
    
    const container = screen.getByTestId('vr-scene-container');
    expect(container).toHaveClass(customClass);
  });

  it('should render OrbitControls when not in VR mode', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isInXRSession: false,
    }));
    
    render(<VRScene />);
    
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('should not render OrbitControls when in VR mode', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isInXRSession: true,
      sessionType: 'immersive-vr',
    }));
    
    render(<VRScene />);
    
    expect(screen.queryByTestId('orbit-controls')).not.toBeInTheDocument();
  });
});
