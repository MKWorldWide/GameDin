import React from 'react';

/**
 * WelcomeStep - First step of onboarding flow
 * Shows branding, value proposition, and a start button
 * Fully accessible and mobile-first
 */
const WelcomeStep: React.FC<{ onNext: () => void }> = ({ onNext }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
    <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to GameDin!</h1>
    <p className="text-lg text-gray-700 mb-6 max-w-xl">
      Your all-in-one gaming social platform. Connect, compete, and earn rewards in a next-gen, AI-powered, blockchain-secured world.
    </p>
    <button
      onClick={onNext}
      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Start onboarding"
    >
      Get Started
    </button>
  </div>
);

export default WelcomeStep;
