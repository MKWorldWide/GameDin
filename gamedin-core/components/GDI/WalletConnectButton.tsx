import React, { useState } from 'react';
import { useWalletConnect } from '../../hooks/useWalletConnect';

interface WalletConnectButtonProps {
  className?: string;
  showAddress?: boolean;
}

/**
 * WalletConnectButton - Connect/disconnect wallet with GDI integration
 * Shows connection status, address, and network info
 */
const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ 
  className = '', 
  showAddress = true 
}) => {
  const { walletInfo, loading, connect, disconnect, metaMaskProvider, isMetaMaskAvailable } = useWalletConnect();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleConnect = async () => {
    try {
      await connect(metaMaskProvider);
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect(metaMaskProvider);
      setShowDropdown(false);
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 1337: return 'GameDin L3';
      case 137: return 'Polygon';
      case 56: return 'BSC';
      default: return `Chain ${chainId}`;
    }
  };

  if (!isMetaMaskAvailable) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed text-sm"
        >
          🦊 Install MetaMask
        </button>
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <button
        onClick={handleConnect}
        disabled={loading}
        className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🦊</span>
            <span>Connect Wallet</span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
      >
        <span>✅</span>
        {showAddress && (
          <span className="font-mono text-sm">{formatAddress(walletInfo.address)}</span>
        )}
        <span>▼</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4">
            {/* Wallet Info */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-lg">🦊</span>
                <span className="font-semibold text-gray-800">MetaMask</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Address: {formatAddress(walletInfo.address)}</div>
                <div>Network: {getNetworkName(walletInfo.chainId)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletInfo.address);
                  // You could add a toast here
                }}
                className="w-full px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                📋 Copy Address
              </button>
              
              {walletInfo.chainId !== 1337 && (
                <button
                  onClick={async () => {
                    try {
                      await metaMaskProvider.switchChain?.(1337);
                    } catch (error) {
                      console.error('Failed to switch chain:', error);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
                >
                  🔄 Switch to GameDin L3
                </button>
              )}
              
              <button
                onClick={handleDisconnect}
                className="w-full px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              >
                🚪 Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default WalletConnectButton; 