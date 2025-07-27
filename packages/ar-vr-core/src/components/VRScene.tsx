import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, Text3D, Stats, useProgress, Html } from '@react-three/drei';
import { VRButton, XR, Controllers, Hands, useXR as useXRState, useXRFrame } from '@react-three/xr';
import { useXR } from '../hooks/useXR';
import { PerformanceMonitor, PerformanceSettings, detectPerformanceSettings } from '../utils/performanceUtils';
import { HandTrackingManager, HandTrackingOptions } from '../utils/handTracking';

// Extend Three.js types for JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      performanceMonitor: any;
    }
  }
}

extend({ PerformanceMonitor });

// Simple Box component that rotates
function RotatingBox() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

// VR Environment component
function VREnvironment() {
  const { scene } = useThree();
  
  // Set up basic lighting
  useEffect(() => {
    scene.background = new THREE.Color(0x111111);
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      
      {/* Interactive elements */}
      <RotatingBox />
      
      {/* Welcome text */}
      <Text3D
        position={[0, 1, -3]}
        scale={0.5}
        font="/fonts/helvetiker_regular.typeface.json"
      >
        Welcome to GameDin VR
        <meshStandardMaterial color="white" />
      </Text3D>
    </>
  );
}

// Main VR Scene component
export function VRScene({
  onSessionStart,
  onSessionEnd,
  children,
}: {
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  children?: React.ReactNode;
}) {
  const { isVRSupported } = useXR();
  
  if (!isVRSupported) {
    return (
      <div className="vr-scene-error">
        VR is not supported on this device. Please check your browser and headset settings.
      </div>
    );
  }

  return (
    <div className="vr-scene-container" style={{ width: '100%', height: '100vh' }}>
      <VRButton />
      <Canvas shadows camera={{ position: [0, 1.6, 3], fov: 50 }}>
        <XR onSessionStart={onSessionStart} onSessionEnd={onSessionEnd}>
          <Suspense fallback={null}>
            <VREnvironment />
            {children}
            <Controllers />
            <Hands />
          </Suspense>
        </XR>
        {!isVRSupported && <OrbitControls />}
      </Canvas>
    </div>
  );
}

export default VRScene;
