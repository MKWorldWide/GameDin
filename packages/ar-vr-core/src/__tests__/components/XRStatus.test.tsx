import React from 'react';
import { render, screen } from '@testing-library/react';
import { XRStatus } from '../../components/XRStatus';
import { useXR } from '../../hooks/useXR';

// Mock the useXR hook
jest.mock('../../hooks/useXR');

const mockUseXR = useXR as jest.MockedFunction<typeof useXR>;

describe('XRStatus', () => {
  const defaultXRState = {
    isARSupported: false,
    isVRSupported: false,
    isMobile: false,
    isHeadsetConnected: false,
    deviceType: 'none' as const,
    supportLevel: 'none' as const,
    deviceInfo: {
      isMobile: false,
      isIOS: false,
      isTablet: false,
      orientation: 'unknown' as const,
      userAgent: 'test-user-agent',
    },
    features: {
      handTracking: false,
      hitTest: false,
      lightEstimation: false,
      anchors: false,
      depthSensing: false,
    },
    sessionModes: {
      inline: false,
      'immersive-vr': false,
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

  it('should render default status when no XR support', () => {
    render(<XRStatus />);
    
    expect(screen.getByText('XR Status')).toBeInTheDocument();
    expect(screen.getByText('Not Supported')).toBeInTheDocument();
    expect(screen.getByText('AR: Not Supported')).toBeInTheDocument();
    expect(screen.getByText('VR: Not Supported')).toBeInTheDocument();
  });

  it('should render AR support status', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isARSupported: true,
      supportLevel: 'full',
      features: {
        ...defaultXRState.features,
        hitTest: true,
        lightEstimation: true,
      },
    }));
    
    render(<XRStatus />);
    
    expect(screen.getByText('AR: Supported (full)')).toBeInTheDocument();
    expect(screen.getByText('• Hit Test')).toBeInTheDocument();
    expect(screen.getByText('• Light Estimation')).toBeInTheDocument();
  });

  it('should render VR support status', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isVRSupported: true,
      isHeadsetConnected: true,
      supportLevel: 'partial',
      features: {
        ...defaultXRState.features,
        handTracking: true,
      },
    }));
    
    render(<XRStatus />);
    
    expect(screen.getByText('VR: Supported (partial)')).toBeInTheDocument();
    expect(screen.getByText('• Headset Connected')).toBeInTheDocument();
    expect(screen.getByText('• Hand Tracking')).toBeInTheDocument();
  });

  it('should render custom children when provided', () => {
    const customText = 'Custom XR Status';
    render(
      <XRStatus>
        <div>{customText}</div>
      </XRStatus>
    );
    
    expect(screen.getByText(customText)).toBeInTheDocument();
    expect(screen.queryByText('XR Status')).not.toBeInTheDocument();
  });

  it('should render device info when showDeviceInfo is true', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      deviceInfo: {
        isMobile: true,
        isIOS: true,
        isTablet: false,
        orientation: 'portrait',
        userAgent: 'test-user-agent',
      },
    }));
    
    render(<XRStatus showDeviceInfo />);
    
    expect(screen.getByText('Device Info')).toBeInTheDocument();
    expect(screen.getByText('Mobile: Yes')).toBeInTheDocument();
    expect(screen.getByText('iOS: Yes')).toBeInTheDocument();
    expect(screen.getByText('Tablet: No')).toBeInTheDocument();
    expect(screen.getByText('Orientation: portrait')).toBeInTheDocument();
  });

  it('should render session status when in XR session', () => {
    mockUseXR.mockImplementation(() => ({
      ...defaultXRState,
      isInXRSession: true,
      sessionType: 'immersive-vr',
      isVRMode: true,
    }));
    
    render(<XRStatus />);
    
    expect(screen.getByText('In VR Session')).toBeInTheDocument();
    expect(screen.getByText('Session Type: immersive-vr')).toBeInTheDocument();
  });

  it('should handle custom class names', () => {
    const customClassName = 'custom-xr-status';
    render(<XRStatus className={customClassName} />);
    
    const container = screen.getByTestId('xr-status');
    expect(container).toHaveClass(customClassName);
  });
});
