import { renderHook, act } from '@testing-library/react-hooks';
import { useXRDevice } from '../../hooks/useXRDevice';
import { detectXRSupport, getDeviceInfo } from '../../utils/xrUtils';

// Mock the xrUtils module
jest.mock('../../utils/xrUtils', () => ({
  detectXRSupport: jest.fn(),
  getDeviceInfo: jest.fn(),
  isVRHeadset: jest.fn(),
}));

// Mock the window.navigator.xr
const mockXR = {
  isSessionSupported: jest.fn(),
  requestSession: jest.fn(),
};

// Mock the window.navigator
const originalNavigator = { ...window.navigator };

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset the window.navigator mock
  Object.defineProperty(window, 'navigator', {
    value: {
      ...originalNavigator,
      xr: mockXR,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    },
    writable: true,
  });
  
  // Mock the window.screen.orientation
  Object.defineProperty(window, 'screen', {
    value: {
      orientation: {
        type: 'portrait-primary',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      },
    },
    writable: true,
  });
  
  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  
  // Default mock implementations
  (detectXRSupport as jest.Mock).mockResolvedValue({
    ar: 'full',
    vr: 'full',
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
      'immersive-ar': true,
    },
  });
  
  (getDeviceInfo as jest.Mock).mockReturnValue({
    isMobile: true,
    isIOS: true,
    isTablet: false,
    orientation: 'portrait',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  });
});

describe('useXRDevice', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useXRDevice());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.deviceInfo).toBeNull();
    expect(result.current.capabilities).toBeNull();
  });

  it('should detect device capabilities on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useXRDevice());
    
    // Initial state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the effect to complete
    await waitForNextUpdate();
    
    // After loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.deviceInfo).toEqual({
      isMobile: true,
      isIOS: true,
      isTablet: false,
      orientation: 'portrait',
      userAgent: expect.any(String),
    });
    expect(result.current.capabilities).toEqual({
      ar: 'full',
      vr: 'full',
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
        'immersive-ar': true,
      },
    });
  });

  it('should handle detection errors', async () => {
    const error = new Error('XR not supported');
    (detectXRSupport as jest.Mock).mockRejectedValueOnce(error);
    
    const { result, waitForNextUpdate } = renderHook(() => useXRDevice());
    
    // Initial state
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the effect to complete
    await waitForNextUpdate();
    
    // After error
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(error);
    expect(result.current.deviceInfo).toBeNull();
    expect(result.current.capabilities).toBeNull();
  });

  it('should refresh capabilities when refresh is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useXRDevice());
    
    // Wait for initial detection
    await waitForNextUpdate();
    
    // Update the mock implementation
    (detectXRSupport as jest.Mock).mockResolvedValueOnce({
      ar: 'partial',
      vr: 'none',
      features: {
        handTracking: false,
        hitTest: true,
        lightEstimation: false,
        anchors: false,
        depthSensing: false,
      },
      sessionModes: {
        inline: true,
        'immersive-vr': false,
        'immersive-ar': true,
      },
    });
    
    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });
    
    // Verify the capabilities were updated
    expect(result.current.capabilities).toEqual({
      ar: 'partial',
      vr: 'none',
      features: {
        handTracking: false,
        hitTest: true,
        lightEstimation: false,
        anchors: false,
        depthSensing: false,
      },
      sessionModes: {
        inline: true,
        'immersive-vr': false,
        'immersive-ar': true,
      },
    });
  });

  it('should handle orientation changes', async () => {
    // Mock the orientation change
    const addEventListener = jest.spyOn(window.screen.orientation, 'addEventListener');
    const removeEventListener = jest.spyOn(window.screen.orientation, 'removeEventListener');
    
    const { result, unmount } = renderHook(() => useXRDevice());
    
    // Verify event listeners were added
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    // Simulate orientation change
    const changeHandler = addEventListener.mock.calls[0][1] as EventListener;
    act(() => {
      changeHandler(new Event('change'));
    });
    
    // Verify getDeviceInfo was called again
    expect(getDeviceInfo).toHaveBeenCalledTimes(2); // Once on mount, once on orientation change
    
    // Cleanup
    unmount();
    
    // Verify event listeners were removed
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
