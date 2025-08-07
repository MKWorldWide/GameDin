// Simple test component
import React from 'react';

function TestApp() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-4 text-blue-400">GameDin Test Page</h1>
        <p className="mb-6">If you can see this, the React app is working!</p>
        <div className="space-y-4">
          <button 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            onClick={() => alert('Button clicked!')}
          >
            Test Button
          </button>
          <div className="flex justify-center space-x-4">
            <span className="text-2xl">🎮</span>
            <span className="text-2xl">👾</span>
            <span className="text-2xl">🕹️</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestApp;
