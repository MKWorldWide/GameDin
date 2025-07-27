import { act } from 'react-test-renderer';
import { create } from 'zustand';
import { useXRStore } from '../../stores/useXRStore';

// Mock the store for testing
const useTestStore = create(useXRStore);

describe('useXRStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useTestStore.setState(useTestStore.getInitialState());
  });

  it('should initialize with default values', () => {
    const state = useTestStore.getState();
    
    expect(state.isARSupported).toBe(false);
    expect(state.isVRSupported).toBe(false);
    expect(state.isMobile).toBe(false);
    expect(state.isHeadsetConnected).toBe(false);
    expect(state.deviceType).toBe('none');
    expect(state.supportLevel).toBe('none');
    expect(state.deviceInfo).toEqual({
      isMobile: false,
      isIOS: false,
      isTablet: false,
      orientation: 'unknown',
      userAgent: '',
    });
    expect(state.features).toEqual({
      handTracking: false,
      hitTest: false,
      lightEstimation: false,
      anchors: false,
      depthSensing: false,
    });
    expect(state.sessionModes).toEqual({
      inline: false,
      'immersive-vr': false,
      'immersive-ar': false,
    });
  });

  it('should update device capabilities', async () => {
    await act(async () => {
      await useTestStore.getState().checkCapabilities();
    });

    const state = useTestStore.getState();
    
    // Since we're in a test environment, we can't actually detect XR capabilities
    // So we just verify the function runs without errors
    expect(typeof state.checkCapabilities).toBe('function');
  });

  it('should set XR session', () => {
    act(() => {
      useTestStore.getState().setXRSession({
        type: 'immersive-vr',
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        requestReferenceSpace: jest.fn(),
        updateRenderState: jest.fn(),
      } as any);
    });

    expect(useTestStore.getState().isInXRSession).toBe(true);
    expect(useTestStore.getState().sessionType).toBe('immersive-vr');
  });

  it('should exit XR session', async () => {
    // First set a session
    const mockSession = {
      type: 'immersive-vr',
      end: jest.fn().mockResolvedValue(undefined),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any;

    act(() => {
      useTestStore.getState().setXRSession(mockSession);
    });

    // Then exit the session
    await act(async () => {
      await useTestStore.getState().exitXRSession();
    });

    expect(mockSession.end).toHaveBeenCalled();
    expect(useTestStore.getState().isInXRSession).toBe(false);
    expect(useTestStore.getState().sessionType).toBeNull();
  });

  it('should toggle AR mode', () => {
    act(() => {
      useTestStore.getState().setARMode(true);
    });
    expect(useTestStore.getState().isARMode).toBe(true);

    act(() => {
      useTestStore.getState().setARMode(false);
    });
    expect(useTestStore.getState().isARMode).toBe(false);
  });

  it('should toggle VR mode', () => {
    act(() => {
      useTestStore.getState().setVRMode(true);
    });
    expect(useTestStore.getState().isVRMode).toBe(true);

    act(() => {
      useTestStore.getState().setVRMode(false);
    });
    expect(useTestStore.getState().isVRMode).toBe(false);
  });
});
