import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type ARMarkerType = 'pattern' | 'barcode' | 'nft';

export interface ARMarkerProps {
  /**
   * Type of marker (pattern, barcode, or NFT)
   */
  type: ARMarkerType;
  
  /**
   * URL to the marker pattern file (for pattern markers)
   */
  patternUrl?: string;
  
  /**
   * Barcode ID (for barcode markers)
   */
  barcodeValue?: number;
  
  /**
   * Size of the marker in meters
   */
  size?: number;
  
  /**
   * Called when the marker is detected
   */
  onDetected?: (marker: any) => void;
  
  /**
   * Called when the marker is lost
   */
  onLost?: () => void;
  
  /**
   * Children to render when the marker is detected
   */
  children?: React.ReactNode;
  
  /**
   * Internal use only - provided by ARMarkerDetector
   */
  markerRoots?: { [key: string]: THREE.Group };
  
  /**
   * Internal use only - provided by ARMarkerDetector
   */
  markerType?: string;
}

/**
 * ARMarker component that represents a trackable marker in AR
 */
export const ARMarker: React.FC<ARMarkerProps> = ({
  type,
  patternUrl,
  barcodeValue,
  size = 1,
  onDetected,
  onLost,
  children,
  markerRoots,
  markerType,
}) => {
  const groupRef = useRef<THREE.Group>(new THREE.Group());
  
  useEffect(() => {
    if (!markerRoots || !markerType) return;
    
    const markerRoot = markerRoots[markerType];
    if (!markerRoot) return;
    
    // Add our group to the marker root
    markerRoot.add(groupRef.current);
    
    // Set initial scale based on marker size
    groupRef.current.scale.set(size, size, size);
    
    return () => {
      // Clean up by removing from marker root
      if (groupRef.current.parent) {
        groupRef.current.parent.remove(groupRef.current);
      }
    };
  }, [markerRoots, markerType, size]);
  
  // Handle marker detection/loss
  useEffect(() => {
    if (!markerType) return;
    
    const handleMarkerFound = (event: any) => {
      if (event.type === markerType) {
        onDetected?.(event);
      }
    };
    
    const handleMarkerLost = (event: any) => {
      if (event.type === markerType) {
        onLost?.();
      }
    };
    
    // In a real implementation, we would connect these to the AR context events
    // For now, this is a placeholder
    
    return () => {
      // Clean up event listeners
    };
  }, [markerType, onDetected, onLost]);
  
  // If we're not in an AR context, just render the children directly
  if (!markerRoots || !markerType) {
    return <>{children}</>;
  }
  
  return (
    <group ref={groupRef}>
      {children}
    </group>
  );
};

export default ARMarker;
