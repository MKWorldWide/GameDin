// Crystal Kit: useGDI - React hook for fetching GDI data
// Modular, typed, and ready for cross-realm use (web, VRChat, Unity via WebView)

import { useState, useEffect } from 'react';
import { GDIClient } from '../services/GDIClient';
import { GDIBalanceResponse } from '../types/GDI';

/**
 * useGDI - Fetches GDI balance and tier for a given address.
 * @param address - The user's wallet or account address
 * @param options - { baseUrl, useMock }
 * @returns { data, loading, error }
 *
 * Example:
 *   const { data, loading, error } = useGDI(address, { baseUrl: 'https://gdi.api', useMock: true });
 */
export function useGDI(address: string, options: { baseUrl: string; useMock?: boolean }) {
  const [data, setData] = useState<GDIBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);
    const client = new GDIClient(options);
    client.getGDIBalance(address)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [address, options.baseUrl, options.useMock]);

  return { data, loading, error };
} 