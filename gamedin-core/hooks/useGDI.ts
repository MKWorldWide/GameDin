// Crystal Kit: useGDI - React hook for fetching GDI data
// Modular, typed, and ready for cross-realm use (web, VRChat, Unity via WebView)

import { useState, useEffect } from 'react';
import { GDIClient } from '../services/GDIClient';
import { GDIBalanceResponse } from '../types/GDI';
import { GDITier } from '../types/GDI';

/**
 * useGDI - Fetches and caches GDI balance and tier for a given address.
 * Returns { balance, tier, loading, error }.
 * Uses sessionStorage to cache results per session.
 */
export function useGDI(address: string, options: { baseUrl: string; useMock?: boolean }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [tier, setTier] = useState<GDITier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    // Session cache key
    const cacheKey = `gdi_${address}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { balance, tier } = JSON.parse(cached);
      setBalance(balance);
      setTier(tier);
      setLoading(false);
      return;
    }
    const client = new GDIClient(options);
    client.getGDIBalance(address)
      .then(data => {
        setBalance(data.balance);
        setTier(data.tier);
        sessionStorage.setItem(cacheKey, JSON.stringify({ balance: data.balance, tier: data.tier }));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [address, options.baseUrl, options.useMock]);

  return { balance, tier, loading, error };
} 