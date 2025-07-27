# @gamedin/ar-vr-core

Core AR/VR functionality for the GameDin platform. This package provides the foundation for building immersive 3D, AR, and VR experiences using Three.js, React Three Fiber, and WebXR.

## Features

- 🎮 **3D Rendering**: High-performance 3D rendering with Three.js
- 🕶 **VR Support**: Built-in VR scene management with headset support
- 📱 **AR Support**: Marker-based AR detection and tracking
- 📊 **State Management**: Comprehensive XR state management with Zustand
- 🔍 **Device Detection**: Automatic detection of XR capabilities
- 📱 **Responsive**: Works across desktop and mobile devices
- 🛠 **Extensible**: Modular architecture for easy extension
- 🔄 **Real-time**: Built for real-time interactive experiences
- 🎨 **Customizable**: Easily theme and style components

## Installation

```bash
# Using npm
npm install @gamedin/ar-vr-core three @react-three/fiber @react-three/drei @react-three/xr @ar-js-org/ar.js

# Using yarn
yarn add @gamedin/ar-vr-core three @react-three/fiber @react-three/drei @react-three/xr @ar-js-org/ar.js

# Using pnpm
pnpm add @gamedin/ar-vr-core three @react-three/fiber @react-three/drei @react-three/xr @ar-js-org/ar.js
```

### Peer Dependencies

- `react` (^18.0.0)
- `react-dom` (^18.0.0)
- `three` (^0.150.0)
- `@react-three/fiber` (^8.0.0)
- `@react-three/drei` (^9.0.0)
- `@react-three/xr` (^4.0.0)
- `@ar-js-org/ar.js` (^0.7.1)
- `zustand` (^4.0.0)

## Quick Start

### Basic VR Scene

```tsx
import React from 'react';
import { VRScene } from '@gamedin/ar-vr-core';

function VRExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <VRScene>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </VRScene>
    </div>
  );
}

export default VRExample;
```

### AR Marker Detection

```tsx
import React from 'react';
import { ARMarkerDetector, ARMarker } from '@gamedin/ar-vr-core';

function ARExample() {
  return (
    <ARMarkerDetector
      markers={[{
        patternUrl: '/markers/pattern-marker.patt',
        markerType: 'pattern',
        onDetected: (marker) => console.log('Marker detected:', marker),
      }]}
      cameraParametersUrl="/camera_para.dat"
    >
      <ARMarker type="pattern" patternUrl="/markers/pattern-marker.patt">
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="hotpink" />
        </mesh>
      </ARMarker>
    </ARMarkerDetector>
  );
}

export default ARExample;
```

## Core Components

### XRProvider

A context provider that makes XR state available throughout your application.

```tsx
import { XRProvider } from '@gamedin/ar-vr-core';

function App() {
  return (
    <XRProvider>
      <YourApp />
    </XRProvider>
  );
}
```

### useXR Hook

Access XR state and actions anywhere in your component tree.

```tsx
import { useXR } from '@gamedin/ar-vr-core';

function XRStatus() {
  const { isARSupported, isVRSupported, isInXRSession } = useXR();
  
  return (
    <div>
      <p>AR Supported: {isARSupported ? '✅' : '❌'}</p>
      <p>VR Supported: {isVRSupported ? '✅' : '❌'}</p>
      <p>In XR Session: {isInXRSession ? '✅' : '❌'}</p>
    </div>
  );
}
```

### VRScene

A complete VR-ready scene with camera, lighting, and XR support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | ReactNode | - | 3D content to render in the scene |
| onSessionStart | () => void | - | Called when XR session starts |
| onSessionEnd | () => void | - | Called when XR session ends |
| className | string | '' | Additional CSS class name for the container |
| camera | Object | { position: [0, 1.6, 3], fov: 50 } | Camera configuration |
| enableControllers | boolean | true | Whether to render controllers |
| enableHands | boolean | true | Whether to enable hand tracking |

### ARMarkerDetector

Detects and tracks AR markers in the camera feed.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| markers | Array<{ patternUrl: string, markerType: 'pattern'\|'barcode'\|'nft', onDetected?: (marker) => void, onLost?: () => void }> | [] | Array of markers to detect |
| cameraParametersUrl | string | - | URL to camera parameters file |
| onInitialized | () => void | - | Called when AR is initialized |
| onError | (error: Error) => void | - | Called when an error occurs |
| className | string | '' | Additional CSS class name |

### ARMarker

Represents a trackable marker in AR space.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | 'pattern'\|'barcode'\|'nft' | - | Type of marker |
| patternUrl | string | - | URL to marker pattern file (for pattern markers) |
| barcodeValue | number | - | Barcode value (for barcode markers) |
| size | number | 1 | Size of the marker in meters |
| onDetected | (marker: any) => void | - | Called when marker is detected |
| onLost | () => void | - | Called when marker is lost |

### XRStatus

Displays the current XR status and device capabilities.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showDeviceInfo | boolean | false | Whether to show detailed device info |
| className | string | '' | Additional CSS class name |
| children | (state: XRState) => ReactNode | - | Render prop for custom rendering |

## Hooks

### useXRDevice

Detects XR device capabilities and provides device information.

```tsx
import { useXRDevice } from '@gamedin/ar-vr-core';

function DeviceInfo() {
  const { deviceInfo, capabilities, isLoading, error } = useXRDevice();
  
  if (isLoading) return <div>Detecting device capabilities...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <p>Device: {deviceInfo?.isMobile ? 'Mobile' : 'Desktop'}</p>
      <p>AR Support: {capabilities?.ar || 'none'}</p>
      <p>VR Support: {capabilities?.vr || 'none'}</p>
    </div>
  );
}
```

## Utilities

### xrUtils

Utility functions for XR development.

```ts
import { detectXRSupport, getDeviceInfo } from '@gamedin/ar-vr-core/utils/xrUtils';

// Detect XR support
const xrSupport = await detectXRSupport();
console.log('AR support:', xrSupport.ar); // 'full', 'partial', or 'none'
console.log('VR support:', xrSupport.vr); // 'full', 'partial', or 'none'

// Get device info
const deviceInfo = getDeviceInfo();
console.log('Is mobile:', deviceInfo.isMobile);
console.log('Is iOS:', deviceInfo.isIOS);
console.log('Orientation:', deviceInfo.orientation);
```

## Development

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start development server:
   ```bash
   pnpm dev
   ```

### Building

```bash
pnpm build
```

### Testing

Run unit tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

Run test coverage:
```bash
pnpm test:coverage
```

## Browser Support

- Chrome 79+ (recommended for best performance)
- Firefox 70+
- Edge 79+
- Safari 15.4+ (with WebXR enabled)
- iOS 15+ (with WebXR enabled via feature flags)

## Performance Optimization

For optimal performance in AR/VR applications:

1. **Use Instanced Meshes**: For repeated geometry, use `InstancedMesh`
2. **Implement Level of Detail (LOD)**: Use `useLOD` for complex models
3. **Optimize Textures**: Use compressed textures and reasonable resolutions
4. **Limit Draw Calls**: Combine geometries where possible
5. **Use React.memo**: For complex components to prevent unnecessary re-renders
6. **Enable WebGL 2.0**: For better performance on supported devices

## Troubleshooting

### AR Not Working on iOS
- Ensure WebXR is enabled in Safari Experimental Features
- Use HTTPS for camera access
- Check for iOS version compatibility (15+ recommended)

### VR Not Working
- Ensure you have a compatible VR headset
- Check browser support (Chrome recommended)
- Make sure the page is served over HTTPS

## License

MIT

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

For support, please open an issue in our [GitHub repository](https://github.com/gamedin/ar-vr-core).
