import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { GDIClient } from '../services/GDIClient';
import { BadgeNFT } from './useBadgeNFTs';

export function useMintBadgeOnTierChange(
  address: string, 
  tier: string, 
  onBadgeMinted?: (badge: BadgeNFT) => void
) {
  const prevTier = useRef<string | null>(null);

  useEffect(() => {
    if (!address || !tier) return;
    if (prevTier.current && prevTier.current !== tier) {
      // New tier detected - mint badge
      toast.loading(`Minting ${tier} badge...`);
      GDIClient.mintRewardBadge(address, tier as any)
        .then((badge) => {
          toast.success(`🪙 ${tier} badge minted!`);
          if (onBadgeMinted) {
            onBadgeMinted(badge);
          }
        })
        .catch((err) => {
          toast.error('Failed to mint badge');
          console.error(err);
        });
    }
    prevTier.current = tier;
  }, [tier, address, onBadgeMinted]);
} 