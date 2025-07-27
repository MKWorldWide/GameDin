import React, { useState } from 'react';
import { VRScene } from '../components/VRScene';
import { XRStatus } from '../components/XRStatus';
import { useXR } from '../hooks/useXR';

/**
 * Example component demonstrating VR scene usage
 */
export function VRExample() {
  const { isVRSupported, isInXRSession } = useXR();
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'starting' | 'active' | 'ending'>('idle');

  const handleSessionStart = () => {
    console.log('VR session started');
    setSessionStatus('active');
  };

  const handleSessionEnd = () => {
    console.log('VR session ended');
    setSessionStatus('idle');
  };

  if (!isVRSupported) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">VR Example</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <XRStatus />
        </div>
        <p className="mt-4">
          This example requires a VR headset and a compatible browser. Please check your setup and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">GameDin VR Demo</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div 
                className={`w-3 h-3 rounded-full mr-2 ${
                  isInXRSession ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span>{isInXRSession ? 'In VR' : 'VR Ready'}</span>
            </div>
            <XRStatus />
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <VRScene 
          onSessionStart={handleSessionStart}
          onSessionEnd={handleSessionEnd}
        >
          {/* Additional VR content can be added as children */}
          <mesh position={[2, 1, -3]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="lightblue" />
          </mesh>
          
          <mesh position={[-2, 1, -3]} rotation={[0, Math.PI / 4, 0]}>
            <torusKnotGeometry args={[0.5, 0.2, 100, 16]} />
            <meshStandardMaterial color="#ff7f50" />
          </mesh>
        </VRScene>
      </main>

      {!isInXRSession && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <div className="inline-block bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            <p className="mb-2">Put on your VR headset and click the VR button to enter VR mode</p>
            <div className="flex justify-center space-x-2 text-xs text-gray-300">
              <span>Move: Thumbstick</span>
              <span>•</span>
              <span>Select: Trigger</span>
              <span>•</span>
              <span>Exit: Back button</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VRExample;
