import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface WalletInfo {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider: string;
}

export interface WalletProvider {
  name: string;
  id: string;
  icon: string;
  connect: () => Promise<WalletInfo>;
  disconnect: () => Promise<void>;
  getAccount: () => Promise<string | null>;
  getChainId: () => Promise<number>;
  switchChain?: (chainId: number) => Promise<void>;
}

/**
 * useWalletConnect - Manages wallet connections with GDI integration
 * Supports MetaMask, WalletConnect, and other providers
 */
export function useWalletConnect() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && window.ethereum;

  // MetaMask Provider
  const metaMaskProvider: WalletProvider = {
    name: 'MetaMask',
    id: 'metamask',
    icon: '🦊',
    connect: async () => {
      if (!isMetaMaskAvailable) {
        throw new Error('MetaMask not found. Please install MetaMask extension.');
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        const walletInfo: WalletInfo = {
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true,
          provider: 'metamask'
        };

        setWalletInfo(walletInfo);
        toast.success('🦊 MetaMask connected!');
        return walletInfo;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to connect MetaMask');
      }
    },
    disconnect: async () => {
      setWalletInfo(null);
      toast.info('Wallet disconnected');
    },
    getAccount: async () => {
      if (!isMetaMaskAvailable) return null;
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts[0] || null;
    },
    getChainId: async () => {
      if (!isMetaMaskAvailable) return 1;
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return parseInt(chainId, 16);
    },
    switchChain: async (chainId: number) => {
      if (!isMetaMaskAvailable) return;
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          // Chain not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: 'GameDin L3',
              nativeCurrency: { name: 'GDI', symbol: 'GDI', decimals: 18 },
              rpcUrls: ['https://gdi-rpc.gamedin.com'],
              blockExplorerUrls: ['https://explorer.gamedin.com']
            }],
          });
        }
      }
    }
  };

  // Connect to wallet
  const connect = useCallback(async (provider: WalletProvider) => {
    setLoading(true);
    setError(null);
    
    try {
      const info = await provider.connect();
      setWalletInfo(info);
      
      // Auto-switch to GDI chain if needed
      if (provider.switchChain && info.chainId !== 1337) { // GDI L3 chain ID
        await provider.switchChain(1337);
      }
      
      return info;
    } catch (err: any) {
      setError(err.message);
      toast.error(`Connection failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async (provider: WalletProvider) => {
    try {
      await provider.disconnect();
      setWalletInfo(null);
      setError(null);
    } catch (err: any) {
      toast.error('Failed to disconnect wallet');
    }
  }, []);

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (isMetaMaskAvailable) {
        const account = await metaMaskProvider.getAccount();
        if (account) {
          const chainId = await metaMaskProvider.getChainId();
          setWalletInfo({
            address: account,
            chainId,
            isConnected: true,
            provider: 'metamask'
          });
        }
      }
    };

    autoConnect();
  }, [isMetaMaskAvailable]);

  // Listen for account/chain changes
  useEffect(() => {
    if (!isMetaMaskAvailable) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setWalletInfo(null);
        toast.info('Wallet disconnected');
      } else {
        setWalletInfo(prev => prev ? { ...prev, address: accounts[0] } : null);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setWalletInfo(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
      toast.info('Network changed');
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isMetaMaskAvailable]);

  return {
    walletInfo,
    loading,
    error,
    connect,
    disconnect,
    metaMaskProvider,
    isMetaMaskAvailable
  };
} 