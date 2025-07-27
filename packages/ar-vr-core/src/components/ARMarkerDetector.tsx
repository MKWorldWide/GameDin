import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ARMarker, ARMarkerType } from './ARMarker';
import { useXR } from '../hooks/useXR';

interface ARMarkerDetectorProps {
  /**
   * List of marker patterns to detect
   * Format: { patternUrl: string, markerType: ARMarkerType }[]
   */
  markers: {
    patternUrl: string;
    markerType: ARMarkerType;
    onDetected?: (marker: any) => void;
    onLost?: () => void;
  }[];
  
  /**
   * Camera parameters file URL
   */
  cameraParametersUrl: string;
  
  /**
   * Called when AR is initialized
   */
  onInitialized?: () => void;
  
  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void;
  
  /**
   * Children to render when AR is ready
   */
  children?: React.ReactNode;
}

/**
 * ARMarkerDetector component for marker-based AR experiences
 */
export const ARMarkerDetector: React.FC<ARMarkerDetectorProps> = ({
  markers,
  cameraParametersUrl,
  onInitialized,
  onError,
  children,
}) => {
  const { isARSupported } = useXR();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const arToolkitRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const markerRootsRef = useRef<{ [key: string]: THREE.Group }>({});

  // Initialize AR.js
  useEffect(() => {
    if (!isARSupported) {
      const err = new Error('AR is not supported on this device');
      setError(err);
      onError?.(err);
      return;
    }

    const initAR = async () => {
      try {
        // Dynamically import AR.js to avoid SSR issues
        const { ArToolkitContext, ArToolkitSource, ArToolkitProfile } = await import('@ar-js-org/ar.js/three.js/build/ar-threex');
        
        // Create a scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create a camera
        const camera = new THREE.Camera();
        cameraRef.current = camera;
        scene.add(camera);

        // Create a renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(new THREE.Color('lightgrey'), 0);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        rendererRef.current = renderer;

        // Append renderer to DOM
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.overflow = 'hidden';
        container.appendChild(renderer.domElement);
        document.body.appendChild(container);

        // Create AR source
        const arToolkitSource = new ArToolkitSource({
          sourceType: 'webcam',
        });

        // Handle resize
        const onResize = () => {
          if (cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(window.innerWidth, window.innerHeight);
          }
        };

        window.addEventListener('resize', onResize);

        // Initialize AR context
        const arToolkitContext = new ArToolkitContext({
          cameraParametersUrl,
          detectionMode: 'mono',
          maxDetectionRate: 30,
          canvasWidth: window.innerWidth,
          canvasHeight: window.innerHeight,
        });

        arToolkitContext.init(() => {
          // Copy projection matrix to camera
          camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
        });

        // Handle marker detection
        arToolkitContext.addEventListener('markerFound', (marker: any) => {
          const markerData = markers.find(m => m.markerType === marker.type);
          if (markerData) {
            markerData.onDetected?.(marker);
          }
        });

        arToolkitContext.addEventListener('markerLost', (marker: any) => {
          const markerData = markers.find(m => m.markerType === marker.type);
          if (markerData) {
            markerData.onLost?.();
          }
        });

        // Animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);
          
          if (arToolkitSource.ready) {
            arToolkitContext.update(arToolkitSource.domElement);
          }
          
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };

        // Start animation loop
        animate();
        
        // Set up markers
        markers.forEach(marker => {
          const markerRoot = new THREE.Group();
          markerRootsRef.current[marker.markerType] = markerRoot;
          scene.add(markerRoot);
          
          // Create a marker helper
          const markerControls = new (window as any).THREEx.ArMarkerControls(
            arToolkitContext,
            markerRoot,
            {
              type: marker.markerType,
              patternUrl: marker.patternUrl,
            }
          );
        });

        setIsInitialized(true);
        onInitialized?.();
        arToolkitRef.current = { arToolkitSource, arToolkitContext };

      } catch (err) {
        console.error('Error initializing AR:', err);
        const error = err instanceof Error ? err : new Error('Failed to initialize AR');
        setError(error);
        onError?.(error);
      }
    };

    initAR();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (rendererRef.current?.domElement?.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener('resize', onResize);
    };
  }, [isARSupported, cameraParametersUrl, JSON.stringify(markers)]);

  // Handle errors
  if (error) {
    return (
      <div className="ar-error">
        <h3>AR Error</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  // Show loading state
  if (!isInitialized) {
    return <div className="ar-loading">Initializing AR...</div>;
  }

  // Render children with marker roots
  return (
    <div className="ar-marker-detector">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            markerRoots: markerRootsRef.current,
          });
        }
        return child;
      })}
    </div>
  );
};

export default ARMarkerDetector;
