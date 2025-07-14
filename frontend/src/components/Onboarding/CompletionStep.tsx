import React from 'react';

/**
 * CompletionStep - Final onboarding step, congratulates user and provides quick links
 * Fully accessible, mobile-first, and quantum-documented
 */
const CompletionStep: React.FC<{ onFinish: () => void }> = ({ onFinish }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
    <div className="text-5xl mb-4 animate-bounce">🎉</div>
    <h2 className="text-3xl font-bold text-blue-700 mb-2">You’re Ready!</h2>
    <p className="text-lg text-gray-700 mb-6 max-w-xl">
      Your GameDin profile is set up. Dive into the feed, connect with friends, and start earning rewards!
    </p>
    <div className="flex flex-wrap gap-4 justify-center mb-6">
      <a href="/feed" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Go to Feed">Go to Feed</a>
      <a href="/messages" className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Go to Chat">Go to Chat</a>
      <a href="/achievements" className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400" aria-label="View Achievements">View Achievements</a>
      <a href="/wallet" className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400" aria-label="Open Wallet">Open Wallet</a>
    </div>
    <button
      onClick={onFinish}
      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Finish onboarding"
    >
      Start Exploring
    </button>
  </div>
);

export default CompletionStep;
