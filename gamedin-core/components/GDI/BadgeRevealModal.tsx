import React, { useEffect, useState } from 'react';
import { BadgeNFT } from '../../hooks/useBadgeNFTs';

interface BadgeRevealModalProps {
  badge: BadgeNFT | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * BadgeRevealModal - Full-screen modal to reveal newly minted badges
 * Features glow effects, share functionality, and OpenSea integration
 */
const BadgeRevealModal: React.FC<BadgeRevealModalProps> = ({ badge, isOpen, onClose }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && badge) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `I just unlocked the ${badge.tier} badge in GameDin!`,
        text: `Check out my ${badge.tier} achievement badge!`,
        url: badge.openseaUrl,
      });
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(badge.openseaUrl);
    }
  };

  const handleViewOnOpenSea = () => {
    window.open(badge.openseaUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}

      {/* Modal Content */}
      <div className="relative max-w-md w-full mx-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-8 text-center shadow-2xl border border-purple-500/30">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl"
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Badge Display */}
        <div className="mb-6">
          <div className="relative inline-block">
            <img
              src={badge.imageUrl}
              alt={`${badge.tier} Badge`}
              className="w-32 h-32 rounded-full shadow-2xl animate-pulse"
              style={{
                boxShadow: `0 0 40px ${badge.tier === 'Diamond' ? '#00ffff' : badge.tier === 'Gold' ? '#ffd700' : badge.tier === 'Silver' ? '#c0c0c0' : '#cd7f32'}`,
              }}
            />
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 blur-xl animate-pulse" />
          </div>
        </div>

        {/* Badge Info */}
        <h2 className="text-3xl font-bold text-white mb-2">
          🏆 {badge.tier} Badge Unlocked!
        </h2>
        <p className="text-purple-200 mb-6">
          Congratulations! You've earned the immortal {badge.tier} badge.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleViewOnOpenSea}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            🔗 View on OpenSea
          </button>
          
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            📤 Share Achievement
          </button>
        </div>

        {/* Token Info */}
        <div className="mt-6 p-4 bg-white/10 rounded-lg">
          <p className="text-sm text-purple-200">
            Token ID: {badge.tokenId}
          </p>
          <p className="text-sm text-purple-200">
            Minted: {new Date(badge.mintedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BadgeRevealModal; 