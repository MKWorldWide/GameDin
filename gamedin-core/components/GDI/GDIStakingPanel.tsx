import React, { useState, useEffect } from 'react';
import { useGDI } from '../../hooks/useGDI';
import { stakeGDI } from '../../services/GDIClient';
import { GDITier } from '../../types/GDI';

/**
 * GDIStakingPanel
 * Allows users to view their GDI balance/tier, stake GDI, and see live feedback.
 * @param address - The user's wallet or session address
 */
export interface GDIStakingPanelProps {
  address: string;
}

/**
 * GDIStakingPanel component
 * - Shows current GDI balance and tier
 * - Lets user enter an amount to stake
 * - Submits stake to backend (mock or real)
 * - Shows success/failure feedback
 * - Auto-refreshes balance/tier after stake
 */
const GDIStakingPanel: React.FC<GDIStakingPanelProps> = ({ address }) => {
  // Stake input amount (string for controlled input)
  const [inputAmount, setInputAmount] = useState<string>('');
  // Loading state for stake action
  const [loading, setLoading] = useState<boolean>(false);
  // Error message (if any)
  const [error, setError] = useState<string | null>(null);
  // Success message (if any)
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Used to trigger refresh after staking
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch GDI balance and tier using useGDI (auto-refresh on refreshKey)
  const { balance, tier, loading: gdiLoading, error: gdiError } = useGDI(address, { baseUrl: '/api' });

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle stake submission
  const handleStake = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const amount = parseFloat(inputAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount to stake.');
      setLoading(false);
      return;
    }
    try {
      const result = await stakeGDI(address, amount);
      if (result.success) {
        setSuccessMessage(`Successfully staked ${amount} GDI!${result.newTier ? ' New tier: ' + result.newTier : ''}`);
        setInputAmount('');
        setRefreshKey(k => k + 1); // Trigger refresh
      } else {
        setError('Staking failed. Please try again.');
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred during staking.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state if fetching GDI data
  if (gdiLoading) {
    return <div className="p-4 text-center text-gray-500">Loading GDI data...</div>;
  }

  // Show error if GDI data fetch failed
  if (gdiError) {
    return <div className="p-4 text-center text-red-500">Error: {gdiError}</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6 space-y-6 border border-blue-100">
      {/* GDI Balance and Tier Display */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-gray-700 text-sm">GDI Balance</div>
          <div className="text-2xl font-bold text-blue-700">{balance ?? '--'}</div>
        </div>
        <div>
          <div className="text-gray-700 text-sm">Tier</div>
          <div className="text-lg font-semibold text-purple-600">{tier ?? '--'}</div>
        </div>
      </div>
      {/* Stake Input */}
      <div>
        <label htmlFor="stake-amount" className="block text-gray-600 mb-1">Stake Amount</label>
        <div className="flex items-center space-x-2">
          <input
            id="stake-amount"
            type="number"
            min="0"
            step="any"
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            disabled={loading}
            aria-label="Stake amount"
          />
          <span className="text-gray-500">GDI</span>
        </div>
      </div>
      {/* Stake Button */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleStake}
        disabled={loading || !inputAmount}
        aria-busy={loading}
      >
        {loading ? 'Staking...' : 'Stake Now'}
      </button>
      {/* Status Messages */}
      {successMessage && (
        <div className="text-green-600 text-center" role="status">{successMessage}</div>
      )}
      {error && (
        <div className="text-red-600 text-center" role="alert">{error}</div>
      )}
    </div>
  );
};

export default GDIStakingPanel; 