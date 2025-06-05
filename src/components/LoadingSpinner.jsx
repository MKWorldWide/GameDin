import React from 'react';

/**
 * LoadingSpinner component to display a loading indicator.
 * Used as a fallback for Suspense and lazy-loaded components.
 */
const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 