import React from 'react';
import { createRoot } from 'react-dom/client';
import TestApp from './App.test';

// Find the root element
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

// Create a root
const root = createRoot(container);

// Render the test app
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
