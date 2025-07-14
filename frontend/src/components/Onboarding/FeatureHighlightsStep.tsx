import React from 'react';

/**
 * FeatureHighlightsStep - Onboarding step to showcase GameDin's core features
 * Fully accessible, mobile-first, and quantum-documented
 */
const FEATURES = [
  {
    icon: '🎮',
    title: 'Personalized Feed',
    description: 'Get AI-powered game recommendations and updates tailored to your interests.'
  },
  {
    icon: '💬',
    title: 'Real-Time Chat',
    description: 'Connect instantly with friends and teammates in secure, real-time chat.'
  },
  {
    icon: '🏆',
    title: 'Achievements & Badges',
    description: 'Earn badges and rewards for your gaming milestones and progress.'
  },
  {
    icon: '🔒',
    title: 'Secure Wallet',
    description: 'Manage your GDI tokens, staking, and NFT badges with blockchain security.'
  },
  {
    icon: '🤝',
    title: 'Social Graph',
    description: 'Find friends, join groups, and grow your gaming network.'
  },
];

const FeatureHighlightsStep: React.FC<{ onNext: () => void; onBack: () => void }> = ({ onNext, onBack }) => (
  <div className="max-w-2xl mx-auto flex flex-col gap-8 p-6">
    <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">GameDin Highlights</h2>
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {FEATURES.map((feature, idx) => (
        <li
          key={feature.title}
          className="flex items-start gap-4 bg-white rounded-lg shadow p-4 border border-blue-50"
          aria-label={feature.title}
        >
          <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        </li>
      ))}
    </ul>
    <div className="flex justify-between mt-6">
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Back
      </button>
      <button
        type="button"
        onClick={onNext}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Next
      </button>
    </div>
  </div>
);

export default FeatureHighlightsStep;
