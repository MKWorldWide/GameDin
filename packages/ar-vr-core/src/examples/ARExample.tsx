import React, { useState } from 'react';
import { ARMarkerDetector, ARMarker } from '../components/ARMarkerDetector';
import { XRStatus } from '../components/XRStatus';
import { useXR } from '../hooks/useXR';
import * as THREE from 'three';

// Sample marker pattern URL (in a real app, this would be a path to your pattern file)
const DEFAULT_PATTERN_URL = '/markers/pattern-marker.patt';
const DEFAULT_CAMERA_PARAMETERS_URL = '/camera_para.dat';

/**
 * Example component demonstrating AR marker detection
 */
export function ARExample() {
  const { isARSupported } = useXR();
  const [detectedMarker, setDetectedMarker] = useState<string | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{x: number, y: number, z: number} | null>(null);

  const handleMarkerDetected = (marker: any) => {
    console.log('Marker detected:', marker);
    setDetectedMarker(marker.type);
    
    // Update marker position for visualization
    const position = new THREE.Vector3();
    marker.object.getWorldPosition(position);
    setMarkerPosition({
      x: position.x,
      y: position.y,
      z: position.z
    });
  };

  const handleMarkerLost = () => {
    console.log('Marker lost');
    setDetectedMarker(null);
    setMarkerPosition(null);
  };

  if (!isARSupported) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AR Example</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <XRStatus />
        </div>
        <p className="mt-4">
          This example requires a device with AR support. Please check your device and browser compatibility.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">GameDin AR Demo</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${
                  detectedMarker ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span>{detectedMarker ? 'Marker Detected' : 'Ready'}</span>
            </div>
            <XRStatus />
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <ARMarkerDetector
          markers={[
            {
              patternUrl: DEFAULT_PATTERN_URL,
              markerType: 'pattern',
              onDetected: handleMarkerDetected,
              onLost: handleMarkerLost,
            },
          ]}
          cameraParametersUrl={DEFAULT_CAMERA_PARAMETERS_URL}
          onInitialized={() => console.log('AR initialized')}
          onError={(error) => console.error('AR error:', error)}
        >
          <ARMarker type="pattern" patternUrl={DEFAULT_PATTERN_URL}>
            <group>
              {/* Simple 3D object to show when marker is detected */}
              <mesh position={[0, 0.5, 0]}>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="hotpink" />
              </mesh>
              
              {/* Info text above the marker */}
              <group position={[0, 1, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.01]}>
                  <planeGeometry args={[1.5, 0.3]} />
                  <meshBasicMaterial color="black" opacity={0.5} transparent />
                </mesh>
                <textGeometry args={['GameDin AR', { size: 0.2, height: 0.01 }]} />
                <meshStandardMaterial color="white" />
              </group>
            </group>
          </ARMarker>
        </ARMarkerDetector>
      </main>

      {!detectedMarker && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-center p-4">
          <div className="max-w-md bg-black bg-opacity-70 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Point your camera at a marker</h2>
            <p className="mb-4">
              This demo uses pattern-based AR markers. Print out a marker and point your camera at it.
            </p>
            <div className="bg-gray-800 p-3 rounded">
              <p className="text-sm text-gray-300">
                Download marker pattern:{' '}
                <a 
                  href={DEFAULT_PATTERN_URL} 
                  download="gamedin-marker.patt"
                  className="text-blue-400 hover:underline"
                >
                  gamedin-marker.patt
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {detectedMarker && markerPosition && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded">
          <h3 className="font-bold">Marker Detected</h3>
          <div className="text-sm">
            <p>Type: {detectedMarker}</p>
            <p>Position:</p>
            <div className="pl-2">
              <p>X: {markerPosition.x.toFixed(2)}</p>
              <p>Y: {markerPosition.y.toFixed(2)}</p>
              <p>Z: {markerPosition.z.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ARExample;
