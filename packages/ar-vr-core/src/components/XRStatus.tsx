import React from 'react';
import useXRDevice from '../hooks/useXRDevice';

type XRStatusProps = {
  /**
   * Optional class name for the root element
   */
  className?: string;
  
  /**
   * Optional custom render function for the status
   */
  children?: (status: ReturnType<typeof useXRDevice>) => React.ReactNode;
};

const defaultStatusMessages = {
  checking: 'Checking XR capabilities...',
  unsupported: 'Your device does not support XR features.',
  ar: 'AR mode available',
  vr: 'VR mode available',
  partial: ' (Limited support)',
  full: ' (Full support)',
};

/**
 * A component that displays the current XR capabilities of the device
 */
export const XRStatus: React.FC<XRStatusProps> = ({ 
  className = '',
  children 
}) => {
  const xrStatus = useXRDevice();
  const { 
    isChecking, 
    isSupported, 
    deviceType, 
    supportLevel, 
    deviceInfo,
    features,
    sessionModes,
    error
  } = xrStatus;

  // If a custom render function is provided, use that
  if (children) {
    return <div className={`xr-status ${className}`}>{children(xrStatus)}</div>;
  }

  // Show loading state
  if (isChecking) {
    return (
      <div className={`xr-status xr-status--checking ${className}`}>
        {defaultStatusMessages.checking}
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`xr-status xr-status--error ${className}`}>
        Error: {error.message}
      </div>
    );
  }

  // Show unsupported state
  if (!isSupported) {
    return (
      <div className={`xr-status xr-status--unsupported ${className}`}>
        {defaultStatusMessages.unsupported}
      </div>
    );
  }

  // Show supported state
  return (
    <div className={`xr-status xr-status--supported xr-status--${deviceType} ${className}`}>
      <div className="xr-status__header">
        {deviceType === 'ar' ? defaultStatusMessages.ar : defaultStatusMessages.vr}
        {supportLevel === 'partial' ? (
          <span className="xr-status__support-level">
            {defaultStatusMessages.partial}
          </span>
        ) : (
          <span className="xr-status__support-level xr-status__support-level--full">
            {defaultStatusMessages.full}
          </span>
        )}
      </div>
      
      <div className="xr-status__details">
        <div className="xr-status__device">
          Device: {deviceInfo.isMobile ? 'Mobile' : 'Desktop'}
          {deviceInfo.isIOS && ' (iOS)'}
          {deviceInfo.isTablet && ' (Tablet)'}
        </div>
        
        <div className="xr-status__orientation">
          Orientation: {deviceInfo.orientation}
        </div>
        
        <div className="xr-status__features">
          <h4>Supported Features:</h4>
          <ul>
            {features.handTracking && <li>Hand Tracking</li>}
            {features.hitTest && <li>Hit Testing</li>}
            {features.lightEstimation && <li>Light Estimation</li>}
            {features.anchors && <li>Spatial Anchors</li>}
            {features.depthSensing && <li>Depth Sensing</li>}
          </ul>
        </div>
        
        <div className="xr-status__sessions">
          <h4>Session Types:</h4>
          <ul>
            {sessionModes.inline && <li>Inline</li>}
            {sessionModes['immersive-vr'] && <li>Immersive VR</li>}
            {sessionModes['immersive-ar'] && <li>Immersive AR</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default XRStatus;
