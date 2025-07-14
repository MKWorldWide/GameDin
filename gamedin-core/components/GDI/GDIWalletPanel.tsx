import React from 'react';
import { useWalletConnect } from '../../hooks/useWalletConnect';
import { useGDI } from '../../hooks/useGDI';
import { useGDIProfile } from '../../hooks/useGDIProfile';
import WalletConnectButton from './WalletConnectButton';
import { GDITokenDisplay } from '../GDITokenDisplay';

interface GDIWalletPanelProps {
  className?: string;
}

/**
 * GDIWalletPanel - Comprehensive wallet interface with GDI integration
 * Shows wallet status, GDI balance, tier, and quick actions
 */
const GDIWalletPanel: React.FC<GDIWalletPanelProps> = ({ className = '' }) => {
  const { walletInfo } = useWalletConnect();
  const { balance, tier, loading: gdiLoading } = useGDI(
    walletInfo?.address || '', 
    { baseUrl: '/api' }
  );
  const { totalClaimed, progressToNextTier, nextTier } = useGDIProfile(
    walletInfo?.address || ''
  );

  if (!walletInfo) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🔗 Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to access GDI rewards, staking, and badges
          </p>
          <WalletConnectButton className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">💰 GDI Wallet</h3>
          <p className="text-sm text-gray-600">
            Connected: {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
          </p>
        </div>
        <WalletConnectButton showAddress={false} />
      </div>

      {/* GDI Balance & Tier */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-800">GDI Balance</h4>
            <div className="text-2xl font-bold text-blue-600">
              {gdiLoading ? '...' : (balance || 0).toFixed(2)} GDI
            </div>
          </div>
          <div className="text-right">
            <h4 className="font-semibold text-gray-800">Tier</h4>
            <div className="text-xl font-bold text-purple-600">{tier || '--'}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {nextTier && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Progress to {nextTier}</span>
              <span>{Math.round(progressToNextTier || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressToNextTier || 0}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Claimed</div>
          <div className="text-lg font-semibold text-gray-800">
            {totalClaimed || 0} GDI
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Network</div>
          <div className="text-lg font-semibold text-gray-800">
            {walletInfo.chainId === 1337 ? 'GameDin L3' : `Chain ${walletInfo.chainId}`}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Quick Actions</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            🎁 Claim Rewards
          </button>
          
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            🔒 Stake GDI
          </button>
          
          <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            🏆 View Badges
          </button>
          
          <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105">
            📊 Analytics
          </button>
        </div>
      </div>

      {/* Network Warning */}
      {walletInfo.chainId !== 1337 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm text-yellow-800">
              Switch to GameDin L3 network for full functionality
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GDIWalletPanel; 