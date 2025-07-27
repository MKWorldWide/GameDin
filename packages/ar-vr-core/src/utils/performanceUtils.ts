import * as THREE from 'three';
import { XRState } from '../stores/useXRStore';

export interface PerformanceSettings {
  /** Target frame rate (default: 60) */
  targetFPS: number;
  /** Enable adaptive quality (default: true) */
  adaptiveQuality: boolean;
  /** Maximum texture resolution (default: 2048) */
  maxTextureResolution: number;
  /** Enable instanced rendering (default: true) */
  useInstancing: boolean;
  /** Enable geometry batching (default: true) */
  useBatching: boolean;
  /** Enable frustum culling (default: true) */
  useFrustumCulling: boolean;
  /** Enable occlusion culling (default: false, experimental) */
  useOcclusionCulling: boolean;
  /** Enable LOD (Level of Detail) (default: true) */
  useLOD: boolean;
  /** Enable compression for textures (default: true) */
  useTextureCompression: boolean;
  /** Enable mipmapping (default: true) */
  useMipmaps: boolean;
  /** Enable shadow maps (default: false on mobile) */
  enableShadows: boolean;
  /** Maximum number of lights (default: 4) */
  maxLights: number;
  /** Maximum number of bones per model (default: 30) */
  maxBones: number;
  /** Maximum number of vertices (default: 65535) */
  maxVertices: number;
  /** Enable WebGL 2.0 if available (default: true) */
  useWebGL2: boolean;
  /** Enable WebGL extensions for better performance */
  useWebGLExtensions: boolean;
}

/**
 * Default performance settings for high-end devices
 */
export const HIGH_END_SETTINGS: PerformanceSettings = {
  targetFPS: 90,
  adaptiveQuality: true,
  maxTextureResolution: 4096,
  useInstancing: true,
  useBatching: true,
  useFrustumCulling: true,
  useOcclusionCulling: true,
  useLOD: true,
  useTextureCompression: true,
  useMipmaps: true,
  enableShadows: true,
  maxLights: 8,
  maxBones: 60,
  maxVertices: 100000,
  useWebGL2: true,
  useWebGLExtensions: true,
};

/**
 * Default performance settings for mid-range devices
 */
export const MID_RANGE_SETTINGS: PerformanceSettings = {
  ...HIGH_END_SETTINGS,
  targetFPS: 60,
  maxTextureResolution: 2048,
  useOcclusionCulling: false,
  maxLights: 4,
  maxBones: 30,
  maxVertices: 50000,
};

/**
 * Default performance settings for low-end/mobile devices
 */
export const LOW_END_SETTINGS: PerformanceSettings = {
  ...MID_RANGE_SETTINGS,
  targetFPS: 30,
  maxTextureResolution: 1024,
  useBatching: false,
  useOcclusionCulling: false,
  enableShadows: false,
  maxLights: 2,
  maxBones: 15,
  maxVertices: 20000,
  useWebGL2: false,
};

/**
 * Detects device capabilities and returns appropriate performance settings
 */
export function detectPerformanceSettings(
  xrState: XRState
): PerformanceSettings {
  // Check for mobile devices
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Check for low-end devices
  const isLowEndDevice = (() => {
    if (isMobile) {
      // Check for low-end mobile devices
      const isLowEndMobile =
        /(android|iphone|ipod|ipad).*\b(2[0-9]{2}[a-z]?|3[0-9]{2}[a-z]?|4[0-9]{2}[a-z]?|5[0-9]{2}[a-z]?|6[0-9]{2}[a-z]?|7[0-9]{2}[a-z]?|8[0-9]{2}[a-z]?|9[0-9]{2}[a-z]?)\b/i.test(
          navigator.userAgent
        );
      return isLowEndMobile;
    }
    return false;
  })();

  // Get WebGL information
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // Check for WebGL support
  if (!gl) {
    console.warn('WebGL not supported, falling back to lowest settings');
    return LOW_END_SETTINGS;
  }

  // Get GPU information
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const gpuInfo = debugInfo
    ? {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      }
    : { vendor: 'unknown', renderer: 'unknown' };

  // Log GPU info for debugging
  console.log('GPU Info:', gpuInfo);

  // Check for known low-end GPUs
  const isLowEndGPU = /adreno\s(2|3|30[2-5]|4[0-9]{2}|50[0-4])|mali\s(4|6|7[0-9]{2})|powervr\s(sgx|rogue)\s(5[0-4][0-9]|55[0-5])|intel\shd\sgraphics/i.test(
    gpuInfo.renderer.toLowerCase()
  );

  // Determine performance profile based on device capabilities
  if (isLowEndDevice || isLowEndGPU) {
    return LOW_END_SETTINGS;
  } else if (isMobile) {
    return MID_RANGE_SETTINGS;
  }
  
  return HIGH_END_SETTINGS;
}

/**
 * Applies performance settings to a Three.js scene and renderer
 */
export function applyPerformanceSettings(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  settings: PerformanceSettings
): void {
  // Apply renderer settings
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = settings.enableShadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = true;
  renderer.sortObjects = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Apply scene settings
  scene.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      
      // Apply LOD if enabled
      if (settings.useLOD && !object.userData.hasLOD && mesh.geometry) {
        // Create LOD for complex meshes
        const lod = new THREE.LOD();
        const originalMesh = mesh.clone();
        
        // Create simplified versions for LOD
        if (mesh.geometry.attributes.position.count > 1000) {
          const geometry = mesh.geometry;
          const simplifiedGeometry = geometry.clone();
          
          // This is a simplified example - in a real app, you'd use a proper simplification algorithm
          // like THREE.SimplifyModifier or a pre-processed LOD model
          
          // Add LOD levels
          lod.addLevel(originalMesh, 0);
          lod.addLevel(
            new THREE.Mesh(
              simplifiedGeometry,
              (mesh.material as THREE.Material).clone()
            ),
            50
          );
          
          object.parent?.add(lod);
          object.parent?.remove(object);
          object.userData.hasLOD = true;
        }
      }

      // Apply material optimizations
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => {
          if ((material as THREE.Material).isMaterial) {
            optimizeMaterial(material as THREE.Material, settings);
          }
        });
      } else if ((mesh.material as THREE.Material).isMaterial) {
        optimizeMaterial(mesh.material as THREE.Material, settings);
      }
    }
  });
}

/**
 * Optimizes a material based on performance settings
 */
function optimizeMaterial(material: THREE.Material, settings: PerformanceSettings): void {
  // Skip if already optimized
  if (material.userData.optimized) return;
  
  // Common optimizations for all materials
  material.precision = settings.useWebGL2 ? 'highp' : 'mediump';
  material.dithering = false;
  
  // Optimize standard and physical materials
  if (
    material instanceof THREE.MeshStandardMaterial ||
    material instanceof THREE.MeshPhysicalMaterial
  ) {
    material.roughness = Math.max(0.1, material.roughness || 0.5);
    material.metalness = material.metalness || 0;
    material.envMapIntensity = material.envMapIntensity || 1.0;
    
    // Disable features on low-end devices
    if (!settings.enableShadows) {
      material.castShadow = false;
      material.receiveShadow = false;
    }
    
    // Reduce quality for better performance
    if (material.aoMap) material.aoMapIntensity = 0.5;
    if (material.normalMap) material.normalScale.set(0.8, 0.8);
    
    // Use simpler lighting model if possible
    if (settings.maxLights < 2) {
      material.envMap = null;
      material.lightMap = null;
      material.aoMap = null;
    }
  }
  
  // Optimize textures
  if (material.map && material.map instanceof THREE.Texture) {
    optimizeTexture(material.map, settings);
  }
  
  // Mark as optimized
  material.userData.optimized = true;
}

/**
 * Optimizes a texture based on performance settings
 */
function optimizeTexture(texture: THREE.Texture, settings: PerformanceSettings): void {
  // Skip if already optimized
  if (texture.userData.optimized) return;
  
  // Apply texture compression if supported
  if (settings.useTextureCompression) {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy() || 1;
  } else {
    texture.anisotropy = 1;
  }
  
  // Apply mipmapping
  texture.minFilter = settings.useMipmaps
    ? THREE.LinearMipMapLinearFilter
    : THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = settings.useMipmaps;
  
  // Limit texture resolution
  if (texture.image) {
    const maxSize = settings.maxTextureResolution;
    if (texture.image.width > maxSize || texture.image.height > maxSize) {
      const aspect = texture.image.width / texture.image.height;
      texture.image.width = Math.min(texture.image.width, maxSize);
      texture.image.height = Math.round(texture.image.width / aspect);
      texture.needsUpdate = true;
    }
  }
  
  // Mark as optimized
  texture.userData.optimized = true;
}

/**
 * Creates a performance monitor to track and maintain target FPS
 */
export class PerformanceMonitor {
  private targetFPS: number;
  private frameTimes: number[] = [];
  private frameTimeSum = 0;
  private lastFrameTime = 0;
  private frameCount = 0;
  private averageFrameTime = 0;
  private qualityLevel = 1.0;
  private callbacks: Array<(quality: number) => void> = [];
  
  constructor(targetFPS = 60) {
    this.targetFPS = targetFPS;
    this.lastFrameTime = performance.now();
  }
  
  /**
   * Call this at the beginning of each frame
   */
  beginFrame(): void {
    this.lastFrameTime = performance.now();
  }
  
  /**
   * Call this at the end of each frame
   */
  endFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    
    // Update frame time history
    this.frameTimes.push(frameTime);
    this.frameTimeSum += frameTime;
    this.frameCount++;
    
    // Keep only the last 60 frames
    if (this.frameTimes.length > 60) {
      this.frameTimeSum -= this.frameTimes.shift() || 0;
    }
    
    // Calculate average frame time
    if (this.frameTimes.length > 0) {
      this.averageFrameTime = this.frameTimeSum / this.frameTimes.length;
      
      // Calculate current FPS
      const currentFPS = 1000 / this.averageFrameTime;
      
      // Adjust quality based on FPS
      if (currentFPS < this.targetFPS * 0.9) {
        // Decrease quality
        this.qualityLevel = Math.max(0.1, this.qualityLevel - 0.05);
        this.notifyQualityChange();
      } else if (currentFPS > this.targetFPS * 1.1 && this.qualityLevel < 1.0) {
        // Increase quality
        this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.01);
        this.notifyQualityChange();
      }
    }
  }
  
  /**
   * Get the current quality level (0.0 to 1.0)
   */
  getQuality(): number {
    return this.qualityLevel;
  }
  
  /**
   * Register a callback for quality changes
   */
  onQualityChange(callback: (quality: number) => void): void {
    this.callbacks.push(callback);
  }
  
  /**
   * Notify all registered callbacks of quality changes
   */
  private notifyQualityChange(): void {
    for (const callback of this.callbacks) {
      callback(this.qualityLevel);
    }
  }
  
  /**
   * Get the current average FPS
   */
  getFPS(): number {
    return 1000 / this.averageFrameTime;
  }
  
  /**
   * Get the current average frame time in milliseconds
   */
  getAverageFrameTime(): number {
    return this.averageFrameTime;
  }
  
  /**
   * Reset all performance metrics
   */
  reset(): void {
    this.frameTimes = [];
    this.frameTimeSum = 0;
    this.frameCount = 0;
    this.averageFrameTime = 0;
    this.qualityLevel = 1.0;
    this.lastFrameTime = performance.now();
  }
}

export default {
  detectPerformanceSettings,
  applyPerformanceSettings,
  PerformanceMonitor,
  HIGH_END_SETTINGS,
  MID_RANGE_SETTINGS,
  LOW_END_SETTINGS,
};
