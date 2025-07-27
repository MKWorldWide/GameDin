import { renderHook, act } from '@testing-library/react-hooks';
import { useXR } from '../../hooks/useXR';
import { useXRStore } from '../../stores/useXRStore';

// Mock the store
jest.mock('../../stores/useXRStore');

const mockUseXRStore = useXRStore as jest.MockedFunction<typeof useXRStore>;

describe('useXR', () => {
  const mockState = {
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
    sessionType: null as 'inline' | 'immersive-vr' | 'immersive-ar' | null,
    isARMode: false,
    isVRMode: false,
    checkCapabilities: jest.fn(),
    setXRSession: jest.fn(),
    exitXRSession: jest.fn(),
    setARMode: jest.fn(),
    setVRMode: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up the mock return value for the store
    mockUseXRStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });
  });

  it('should return the correct initial state', () => {
    const { result } = renderHook(() => useXR());

    expect(result.current).toEqual({
      // Capabilities
      isARSupported: false,
      isVRSupported: false,
      isMobile: false,
      isHeadsetConnected: false,
      deviceType: 'none',
      supportLevel: 'none',
      deviceInfo: mockState.deviceInfo,
      features: mockState.features,
      sessionModes: mockState.sessionModes,
      
      // Session state
      isInXRSession: false,
      sessionType: null,
      isARMode: false,
      isVRMode: false,
      
      // Actions
      checkCapabilities: expect.any(Function),
      setXRSession: expect.any(Function),
      exitXRSession: expect.any(Function),
      setARMode: expect.any(Function),
      setVRMode: expect.any(Function),
    });
  });

  it('should call checkCapabilities when mounted', () => {
    renderHook(() => useXR());
    expect(mockState.checkCapabilities).toHaveBeenCalledTimes(1);
  });

  it('should update when store state changes', () => {
    const { result, rerender } = renderHook(() => useXR());
    
    // Update the mock state
    const newState = {
      ...mockState,
      isARSupported: true,
      isVRSupported: true,
      isInXRSession: true,
      sessionType: 'immersive-vr',
    };
    
    // Update the mock implementation
    mockUseXRStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector(newState);
      }
      return newState;
    });
    
    // Trigger a re-render
    rerender();
    
    // Verify the hook returns the updated state
    expect(result.current.isARSupported).toBe(true);
    expect(result.current.isVRSupported).toBe(true);
    expect(result.current.isInXRSession).toBe(true);
    expect(result.current.sessionType).toBe('immersive-vr');
  });

  it('should call store actions correctly', () => {
    const { result } = renderHook(() => useXR());
    
    // Test setXRSession
    const mockSession = {} as XRSession;
    act(() => {
      result.current.setXRSession(mockSession, 'immersive-vr');
    });
    expect(mockState.setXRSession).toHaveBeenCalledWith(mockSession, 'immersive-vr');
    
    // Test exitXRSession
    act(() => {
      result.current.exitXRSession();
    });
    expect(mockState.exitXRSession).toHaveBeenCalled();
    
    // Test setARMode
    act(() => {
      result.current.setARMode(true);
    });
    expect(mockState.setARMode).toHaveBeenCalledWith(true);
    
    // Test setVRMode
    act(() => {
      result.current.setVRMode(true);
    });
    expect(mockState.setVRMode).toHaveBeenCalledWith(true);
  });

  it('should handle selector function', () => {
    const { result } = renderHook(() => 
      useXR((state) => ({
        isARSupported: state.isARSupported,
        isVRSupported: state.isVRSupported,
      }))
    );
    
    expect(result.current).toEqual({
      isARSupported: false,
      isVRSupported: false,
    });
  });
});
