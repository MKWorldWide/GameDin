// Crystal Kit Playground Entry
// Renders the GDIDemo component for isolated GDI component testing

import React from 'react';
import { createRoot } from 'react-dom/client';
import { GDIDemo } from './GDIDemo';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<GDIDemo />);
} 