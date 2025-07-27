import * as THREE from 'three';
import { XRHandModel, XRHandModelFactory } from '@react-three/xr';
import { XRHandedness } from 'three';

export interface HandTrackingOptions {
  /** Enable hand tracking (default: true) */
  enabled: boolean;
  /** Update rate in milliseconds (default: 1000/60) */
  updateRate: number;
  /** Show debug visualization (default: false) */
  debug: boolean;
  /** Minimum confidence threshold for hand tracking (0-1, default: 0.8) */
  minConfidence: number;
}

/**
 * Hand tracking manager for WebXR hand tracking
 */
export class HandTrackingManager {
  private handModels: Map<XRHandedness, XRHandModel> = new Map();
  private handMesh: THREE.Group | null = null;
  private options: HandTrackingOptions;
  private lastUpdateTime = 0;
  private handMeshFactory: XRHandModelFactory;
  private scene: THREE.Scene;
  private controller1: THREE.XRTargetRaySpace | null = null;
  private controller2: THREE.XRTargetRaySpace | null = null;

  constructor(scene: THREE.Scene, options?: Partial<HandTrackingOptions>) {
    this.scene = scene;
    this.options = {
      enabled: true,
      updateRate: 1000 / 60,
      debug: false,
      minConfidence: 0.8,
      ...options,
    };

    this.handMeshFactory = new XRHandModelFactory();
  }

  /**
   * Initialize hand tracking
   */
  async init(): Promise<boolean> {
    if (!this.options.enabled) return false;

    try {
      // Check if hand tracking is supported
      const session: XRSession = (navigator as any).xr as XRSession;
      if (!session || !('requestFeature' in session)) {
        console.warn('WebXR Hand Tracking not supported in this browser');
        return false;
      }

      // Request hand tracking feature
      await session.updateRenderState({
        layers: [
          new XRWebGLLayer(session, session.renderState.baseLayer),
        ],
      });

      // Create hand meshes
      this.createHandMeshes();
      return true;
    } catch (error) {
      console.error('Failed to initialize hand tracking:', error);
      return false;
    }
  }

  /**
   * Update hand tracking
   * @param time Current time in milliseconds
   * @param frame XRFrame from requestAnimationFrame
   */
  update(time: number, frame?: XRFrame): void {
    if (!this.options.enabled || !frame || time - this.lastUpdateTime < this.options.updateRate) {
      return;
    }

    this.lastUpdateTime = time;

    // Get hand tracking data from frame
    const referenceSpace = frame.session.requestReferenceSpace('viewer');
    const poses = frame.getViewerPose(referenceSpace);

    if (!poses) return;

    // Update hand meshes
    for (const view of poses.views) {
      if (view.hand) {
        this.updateHandMesh(view.hand, frame);
      }
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.handModels.forEach((model) => {
      this.scene.remove(model);
      model.dispose?.();
    });
    this.handModels.clear();
  }

  /**
   * Enable or disable hand tracking
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
    if (enabled) {
      this.init();
    } else {
      this.dispose();
    }
  }

  /**
   * Get hand joint position and rotation
   */
  getHandJoint(handedness: XRHandedness, joint: XRHandJoint): THREE.Object3D | null {
    const handModel = this.handModels.get(handedness);
    if (!handModel) return null;

    // Find the joint in the hand model
    const jointObj = handModel.getObjectByName(joint);
    if (!jointObj) return null;

    return jointObj;
  }

  /**
   * Check if a hand is currently tracked
   */
  isHandTracked(handedness: XRHandedness): boolean {
    return this.handModels.has(handedness);
  }

  /**
   * Get the position of a hand joint in world space
   */
  getJointPosition(handedness: XRHandedness, joint: XRHandJoint): THREE.Vector3 | null {
    const jointObj = this.getHandJoint(handedness, joint);
    if (!jointObj) return null;

    const position = new THREE.Vector3();
    jointObj.getWorldPosition(position);
    return position;
  }

  /**
   * Get the rotation of a hand joint in world space
   */
  getJointRotation(handedness: XRHandedness, joint: XRHandJoint): THREE.Quaternion | null {
    const jointObj = this.getHandJoint(handedness, joint);
    if (!jointObj) return null;

    const quaternion = new THREE.Quaternion();
    jointObj.getWorldQuaternion(quaternion);
    return quaternion;
  }

  /**
   * Create hand meshes for visualization
   */
  private createHandMeshes(): void {
    // Create left hand
    const leftHand = this.handMeshFactory.createHandModel(
      this.scene,
      'left',
      'mesh',
      { model: 'lowpoly' }
    );
    leftHand.visible = false;
    this.handModels.set('left', leftHand);
    this.scene.add(leftHand);

    // Create right hand
    const rightHand = this.handMeshFactory.createHandModel(
      this.scene,
      'right',
      'mesh',
      { model: 'lowpoly' }
    );
    rightHand.visible = false;
    this.handModels.set('right', rightHand);
    this.scene.add(rightHand);
  }

  /**
   * Update hand mesh based on XR hand tracking data
   */
  private updateHandMesh(hand: XRHand, frame: XRFrame): void {
    const handedness = hand.handedness;
    const handModel = this.handModels.get(handedness);
    
    if (!handModel) return;

    // Update visibility
    handModel.visible = true;

    // Update joint positions
    for (const [jointName, joint] of Object.entries(hand)) {
      if (jointName === 'handedness' || jointName === 'size') continue;
      
      const jointObj = handModel.getObjectByName(jointName);
      if (!jointObj) continue;

      const jointPose = frame.getJointPose(joint as XRJointSpace, this.scene);
      if (!jointPose) continue;

      // Update position and rotation
      jointObj.position.set(
        jointPose.transform.position.x,
        jointPose.transform.position.y,
        jointPose.transform.position.z
      );
      
      jointObj.quaternion.set(
        jointPose.transform.orientation.x,
        jointPose.transform.orientation.y,
        jointPose.transform.orientation.z,
        jointPose.transform.orientation.w
      );
      
      // Update visibility based on confidence
      if ('radius' in jointPose) {
        jointObj.visible = jointPose.radius > 0 && jointPose.radius < 0.1;
      }
    }
  }

  /**
   * Add debug visualization for hand tracking
   */
  private addDebugVisualization(hand: XRHand, frame: XRFrame): void {
    if (!this.options.debug) return;

    const handedness = hand.handedness;
    const handGroup = new THREE.Group();
    handGroup.name = `${handedness}-debug`;
    
    // Remove existing debug visualization
    const existingDebug = this.scene.getObjectByName(`${handedness}-debug`);
    if (existingDebug) {
      this.scene.remove(existingDebug);
    }

    // Create debug spheres for each joint
    for (const [jointName, joint] of Object.entries(hand)) {
      if (jointName === 'handedness' || jointName === 'size') continue;
      
      const jointPose = frame.getJointPose(joint as XRJointSpace, this.scene);
      if (!jointPose) continue;

      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      
      sphere.position.set(
        jointPose.transform.position.x,
        jointPose.transform.position.y,
        jointPose.transform.position.z
      );
      
      handGroup.add(sphere);
      
      // Add line from joint to parent joint (if available)
      const parentJointName = this.getParentJointName(jointName);
      if (parentJointName && hand[parentJointName as keyof XRHand]) {
        const parentJoint = hand[parentJointName as keyof XRHand] as XRJointSpace;
        const parentPose = frame.getJointPose(parentJoint, this.scene);
        
        if (parentPose) {
          const points = [
            new THREE.Vector3(
              jointPose.transform.position.x,
              jointPose.transform.position.y,
              jointPose.transform.position.z
            ),
            new THREE.Vector3(
              parentPose.transform.position.x,
              parentPose.transform.position.y,
              parentPose.transform.position.z
            ),
          ];
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
          );
          
          handGroup.add(line);
        }
      }
    }
    
    this.scene.add(handGroup);
  }

  /**
   * Get the parent joint name for a given joint
   */
  private getParentJointName(jointName: string): string | null {
    const jointHierarchy: Record<string, string | null> = {
      'wrist': null,
      'thumb-metacarpal': 'wrist',
      'thumb-phalanx-proximal': 'thumb-metacarpal',
      'thumb-phalanx-distal': 'thumb-phalanx-proximal',
      'thumb-tip': 'thumb-phalanx-distal',
      'index-finger-metacarpal': 'wrist',
      'index-finger-phalanx-proximal': 'index-finger-metacarpal',
      'index-finger-phalanx-intermediate': 'index-finger-phalanx-proximal',
      'index-finger-phalanx-distal': 'index-finger-phalanx-intermediate',
      'index-finger-tip': 'index-finger-phalanx-distal',
      'middle-finger-metacarpal': 'wrist',
      'middle-finger-phalanx-proximal': 'middle-finger-metacarpal',
      'middle-finger-phalanx-intermediate': 'middle-finger-phalanx-proximal',
      'middle-finger-phalanx-distal': 'middle-finger-phalanx-intermediate',
      'middle-finger-tip': 'middle-finger-phalanx-distal',
      'ring-finger-metacarpal': 'wrist',
      'ring-finger-phalanx-proximal': 'ring-finger-metacarpal',
      'ring-finger-phalanx-intermediate': 'ring-finger-phalanx-proximal',
      'ring-finger-phalanx-distal': 'ring-finger-phalanx-intermediate',
      'ring-finger-tip': 'ring-finger-phalanx-distal',
      'pinky-finger-metacarpal': 'wrist',
      'pinky-finger-phalanx-proximal': 'pinky-finger-metacarpal',
      'pinky-finger-phalanx-intermediate': 'pinky-finger-phalanx-proximal',
      'pinky-finger-phalanx-distal': 'pinky-finger-phalanx-intermediate',
      'pinky-finger-tip': 'pinky-finger-phalanx-distal',
    };

    return jointHierarchy[jointName] || null;
  }
}

/**
 * Hook for using hand tracking in React components
 */
export function useHandTracking(
  scene: THREE.Scene,
  options?: Partial<HandTrackingOptions>
): HandTrackingManager {
  const [handTracking, setHandTracking] = React.useState<HandTrackingManager | null>(null);
  
  React.useEffect(() => {
    if (!scene) return;
    
    const manager = new HandTrackingManager(scene, options);
    setHandTracking(manager);
    
    // Initialize hand tracking
    if (options?.enabled !== false) {
      manager.init();
    }
    
    // Clean up on unmount
    return () => {
      manager.dispose();
    };
  }, [scene, JSON.stringify(options)]);
  
  return handTracking as HandTrackingManager;
}

export default HandTrackingManager;
