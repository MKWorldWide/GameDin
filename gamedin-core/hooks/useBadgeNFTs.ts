import { useEffect, useState } from 'react';
import { GDIClient } from '../services/GDIClient';

export interface BadgeNFT {
  id: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  mintedAt: string;
  tokenId: string;
  openseaUrl: string;
  imageUrl: string;
}

/**
 * useBadgeNFTs - Fetches and tracks all minted badge NFTs for a user
 * @param address - The user's wallet address
 * @returns { badges, loading, error, refetch }
 */
export function useBadgeNFTs(address: string) {
  const [badges, setBadges] = useState<BadgeNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const data = await GDIClient.getMintedBadges(address);
      setBadges(data.badges || []);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [address]);

  return { badges, loading, error, refetch: fetchBadges };
} 