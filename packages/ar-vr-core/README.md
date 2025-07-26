# @gamedin/ar-vr-core

Core AR/VR functionality for the GameDin platform. This package provides the foundation for building immersive 3D, AR, and VR experiences using Three.js and React Three Fiber.

## Features

- 🎮 **3D Rendering**: High-performance 3D rendering with Three.js
- 📱 **Responsive**: Works across desktop and mobile devices
- 🛠 **Extensible**: Modular architecture for easy extension
- 🔄 **Real-time**: Built for real-time interactive experiences
- 🎨 **Customizable**: Easily theme and style components

## Installation

```bash
# Using npm
npm install @gamedin/ar-vr-core three @react-three/fiber @react-three/drei

# Using yarn
yarn add @gamedin/ar-vr-core three @react-three/fiber @react-three/drei

# Using pnpm
pnpm add @gamedin/ar-vr-core three @react-three/fiber @react-three/drei
```

## Quick Start

```tsx
import React from 'react';
import { Scene } from '@gamedin/ar-vr-core';
import '@gamedin/ar-vr-core/styles/global.css';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Scene />
    </div>
  );
}

export default App;
```

## Components

### Scene

The main container for 3D content. Provides a canvas with a basic scene setup.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| className | string | '' | Additional CSS class name for the canvas container |
| showStats | boolean | true | Whether to show performance stats |
| backgroundColor | string | '#000000' | Background color of the scene |
| onSceneReady | (scene: THREE.Scene) => void | undefined | Callback when the scene is initialized |

## Development

### Prerequisites

- Node.js 16+
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

```bash
pnpm test
```

## License

MIT
