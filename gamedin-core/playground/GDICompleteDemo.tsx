import React, { useState } from 'react';
import GDIStakingPanel from '../components/GDI/GDIStakingPanel';
import GDIRewardsPanel from '../components/GDI/GDIRewardsPanel';
import BadgeCollection from '../components/GDI/BadgeCollection';
import { GDITier } from '../types/GDI';

const DEMO_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';

export const GDICompleteDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'staking' | 'badges'>('rewards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 GDI Complete System Demo
          </h1>
          <p className="text-gray-600">
            Experience the full GameDin Divine Infrastructure - Rewards, Staking, and NFT Badges
          </p>
        </div>

        {/* Demo Address */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Demo Wallet Address:
          </label>
          <input
            type="text"
            value={DEMO_ADDRESS}
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'rewards'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎁 Rewards & Tiers
          </button>
          <button
            onClick={() => setActiveTab('staking')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'staking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔒 Staking Panel
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeTab === 'badges'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏆 Badge Collection
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-1">
            {activeTab === 'rewards' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎁 GDI Rewards & Tier System
                </h2>
                <GDIRewardsPanel address={DEMO_ADDRESS} />
              </div>
            )}

            {activeTab === 'staking' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🔒 GDI Staking Panel
                </h2>
                <GDIStakingPanel address={DEMO_ADDRESS} />
              </div>
            )}

            {activeTab === 'badges' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🏆 Badge Collection
                </h2>
                <BadgeCollection address={DEMO_ADDRESS} />
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ℹ️ System Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🎯 Current Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live GDI balance and tier tracking</li>
                    <li>• Automatic NFT badge minting on tier unlock</li>
                    <li>• Staking with real-time feedback</li>
                    <li>• Badge collection with OpenSea integration</li>
                    <li>• Confetti animations and celebratory UI</li>
                    <li>• Share functionality for achievements</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🏅 Tier System:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>🟫 Bronze: 0-99 GDI</div>
                    <div>⚪ Silver: 100-499 GDI</div>
                    <div>🟡 Gold: 500-999 GDI</div>
                    <div>💎 Diamond: 1000+ GDI</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🔗 Integration Points:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• GDIClient for API calls</li>
                    <li>• useGDIProfile for tier tracking</li>
                    <li>• useBadgeNFTs for badge management</li>
                    <li>• OpenSea for NFT viewing</li>
                    <li>• Toast notifications for feedback</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDICompleteDemo; 