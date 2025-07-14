import { useEffect, useState } from 'react';
import { Button, Progress } from '@/components/ui';
import { useGDIProfile } from '@/hooks/useGDIProfile';
import { useMintBadgeOnTierChange } from '@/hooks/useMintBadgeOnTierChange';
import { useBadgeNFTs } from '@/hooks/useBadgeNFTs';
import { GDIClient } from '@/lib/gdiClient';
import { toast } from 'sonner';
import BadgeRevealModal from './BadgeRevealModal';
import BadgeCollection from './BadgeCollection';
import { BadgeNFT } from '@/hooks/useBadgeNFTs';

const tierIcons: Record<string, string> = {
  Bronze: '/assets/tiers/bronze.svg',
  Silver: '/assets/tiers/silver.svg',
  Gold: '/assets/tiers/gold.svg',
  Diamond: '/assets/tiers/diamond.svg'
};

export default function GDIRewardsPanel({ address }: { address: string }) {
  const [claimable, setClaimable] = useState(false);
  const [rewards, setRewards] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newlyMintedBadge, setNewlyMintedBadge] = useState<BadgeNFT | null>(null);
  const [showBadgeCollection, setShowBadgeCollection] = useState(false);
  
  const { tier, totalClaimed, nextTier, progressToNextTier } = useGDIProfile(address);
  const { badges } = useBadgeNFTs(address);

  // Wire the badge minting hook with modal integration
  useMintBadgeOnTierChange(address, tier, (badge) => {
    setNewlyMintedBadge(badge);
    setShowBadgeModal(true);
  });

  const fetchRewards = async () => {
    try {
      const data = await GDIClient.getClaimableRewards(address);
      setRewards(data.amount);
      setClaimable(data.claimable);
    } catch (e) {
      toast.error('Failed to load rewards');
    }
  };

  const claim = async () => {
    try {
      setLoading(true);
      await GDIClient.claimRewards(address);
      toast.success('Rewards claimed!');
      fetchRewards();
    } catch (e) {
      toast.error('Claim failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRewards(); }, [address]);

  return (
    <>
      <div className='rounded-2xl p-4 shadow-xl border bg-background space-y-4'>
        <div className="flex items-center justify-between">
          <h2 className='text-xl font-bold'>Your GDI Rewards</h2>
          <button
            onClick={() => setShowBadgeCollection(!showBadgeCollection)}
            className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            🏆 {badges.length} Badges
          </button>
        </div>
        
        <p className='text-sm text-muted-foreground'>Claimable: {rewards} GDI</p>
        
        <Button onClick={claim} disabled={!claimable || loading}>
          {loading ? 'Claiming...' : 'Claim GDI'}
        </Button>

        <div className='mt-4 p-3 rounded-lg border flex items-center gap-3'>
          <img src={tierIcons[tier]} alt={tier} className='w-6 h-6' />
          <div className='flex-1'>
            <h3 className='font-semibold text-lg'>🏅 {tier}</h3>
            {nextTier ? (
              <>
                <p className='text-xs text-muted-foreground'>Progress to {nextTier}:</p>
                <Progress value={progressToNextTier} className='mt-1' />
                <p className='text-xs mt-1'>{totalClaimed} GDI / {nextTier === 'Silver' ? 100 : nextTier === 'Gold' ? 500 : 1000}</p>
              </>
            ) : (
              <p className='text-xs text-emerald-500 mt-2'>🎉 Max tier achieved. You're a Diamond, babydoll.</p>
            )}
          </div>
        </div>

        {/* Badge Collection Toggle */}
        {showBadgeCollection && (
          <div className="mt-4 border-t pt-4">
            <BadgeCollection address={address} />
          </div>
        )}
      </div>

      {/* Badge Reveal Modal */}
      <BadgeRevealModal
        badge={newlyMintedBadge}
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
      />
    </>
  );
} 