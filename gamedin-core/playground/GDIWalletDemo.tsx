import React, { useState } from 'react';
import GDIWalletPanel from '../components/GDI/GDIWalletPanel';
import GDIRewardsPanel from '../components/GDI/GDIRewardsPanel';
import GDIStakingPanel from '../components/GDI/GDIStakingPanel';
import BadgeCollection from '../components/GDI/BadgeCollection';
import WalletConnectButton from '../components/GDI/WalletConnectButton';
import { useWalletConnect } from '../hooks/useWalletConnect';

export const GDIWalletDemo: React.FC = () => {
  const { walletInfo } = useWalletConnect();
  const [activeSection, setActiveSection] = useState<'wallet' | 'rewards' | 'staking' | 'badges'>('wallet');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🔗 GDI Wallet Integration Demo
          </h1>
          <p className="text-gray-600 mb-4">
            Experience seamless wallet integration with GameDin Divine Infrastructure
          </p>
          
          {/* Global Wallet Connect */}
          <div className="flex justify-center mb-6">
            <WalletConnectButton />
          </div>
        </div>

        {/* Connection Status */}
        {walletInfo && (
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Connected: {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Chain {walletInfo.chainId}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Provider: {walletInfo.provider}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6 shadow-sm">
          <button
            onClick={() => setActiveSection('wallet')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeSection === 'wallet'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💰 Wallet Panel
          </button>
          <button
            onClick={() => setActiveSection('rewards')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeSection === 'rewards'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🎁 Rewards & Tiers
          </button>
          <button
            onClick={() => setActiveSection('staking')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeSection === 'staking'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🔒 Staking
          </button>
          <button
            onClick={() => setActiveSection('badges')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              activeSection === 'badges'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            🏆 Badges
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeSection === 'wallet' && (
              <GDIWalletPanel />
            )}

            {activeSection === 'rewards' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🎁 GDI Rewards & Tier System
                </h2>
                {walletInfo ? (
                  <GDIRewardsPanel address={walletInfo.address} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Connect your wallet to view rewards
                  </div>
                )}
              </div>
            )}

            {activeSection === 'staking' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🔒 GDI Staking Panel
                </h2>
                {walletInfo ? (
                  <GDIStakingPanel address={walletInfo.address} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Connect your wallet to access staking
                  </div>
                )}
              </div>
            )}

            {activeSection === 'badges' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  🏆 Badge Collection
                </h2>
                {walletInfo ? (
                  <BadgeCollection address={walletInfo.address} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Connect your wallet to view badges
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                ℹ️ Wallet Features
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🔗 Connection:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• MetaMask integration</li>
                    <li>• Auto-reconnect on page load</li>
                    <li>• Account/network change detection</li>
                    <li>• Chain switching support</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">💰 GDI Integration:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live balance tracking</li>
                    <li>• Tier progression</li>
                    <li>• Reward claiming</li>
                    <li>• Staking operations</li>
                    <li>• Badge minting</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🌐 Network Support:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• GameDin L3 (Primary)</li>
                    <li>• Ethereum Mainnet</li>
                    <li>• Polygon</li>
                    <li>• BSC</li>
                    <li>• Auto-chain switching</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">🔒 Security:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Secure wallet connections</li>
                    <li>• Transaction signing</li>
                    <li>• Network validation</li>
                    <li>• Error handling</li>
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

export default GDIWalletDemo; 