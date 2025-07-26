import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stats, useProgress, Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loading component that shows loading progress
 */
const Loader = () => {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loading">
        <div className="progress">{Math.round(progress)}% loaded</div>
      </div>
    </Html>
  );
};

/**
 * Simple rotating cube component
 */
const RotatingCube = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
};

/**
 * Scene component with basic lighting and camera setup
 */
const SceneContent = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <RotatingCube />
      <OrbitControls />
      <Stats />
    </>
  );
};

/**
 * Properties for the Scene component
 */
export interface SceneProps {
  /** CSS class name for the canvas container */
  className?: string;
  /** Whether to show the stats overlay */
  showStats?: boolean;
  /** Background color of the scene */
  backgroundColor?: string;
  /** Callback when the scene is initialized */
  onSceneReady?: (scene: THREE.Scene) => void;
}

/**
 * A reusable 3D scene component with Three.js
 * 
 * @example
 * ```tsx
 * <Scene 
 *   className="my-scene"
 *   showStats={true}
 *   backgroundColor="black"
 *   onSceneReady={(scene) => console.log('Scene ready', scene)}
 * />
 * ```
 */
const Scene: React.FC<SceneProps> = ({
  className = '',
  showStats = true,
  backgroundColor = '#000000',
  onSceneReady,
}) => {
  const sceneRef = useRef<THREE.Scene>();
  
  const handleCreated = ({ scene }: { scene: THREE.Scene }) => {
    sceneRef.current = scene;
    onSceneReady?.(scene);
  };

  return (
    <div className={`ar-vr-scene ${className}`} style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        onCreated={handleCreated}
        style={{ background: backgroundColor }}
      >
        <Suspense fallback={<Loader />}>
          <SceneContent />
          {showStats && <Stats />}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene;
