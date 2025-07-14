import React from 'react';
import { useBadgeNFTs } from '../../hooks/useBadgeNFTs';

interface BadgeCollectionProps {
  address: string;
}

/**
 * BadgeCollection - Displays all minted badge NFTs in a grid layout
 * Features hover effects, OpenSea integration, and responsive design
 */
const BadgeCollection: React.FC<BadgeCollectionProps> = ({ address }) => {
  const { badges, loading, error } = useBadgeNFTs(address);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading your badge collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading badges: {error}</p>
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Badges Yet</h3>
        <p className="text-gray-600">Start earning GDI rewards to unlock your first badge!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Badge Collection</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="group relative bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200"
          >
            {/* Badge Image */}
            <div className="relative mb-3">
              <img
                src={badge.imageUrl}
                alt={`${badge.tier} Badge`}
                className="w-full h-24 object-cover rounded-lg"
                style={{
                  boxShadow: `0 0 20px ${badge.tier === 'Diamond' ? '#00ffff' : badge.tier === 'Gold' ? '#ffd700' : badge.tier === 'Silver' ? '#c0c0c0' : '#cd7f32'}`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Badge Info */}
            <div className="text-center">
              <h3 className="font-semibold text-gray-800 mb-1">{badge.tier}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {new Date(badge.mintedAt).toLocaleDateString()}
              </p>
              
              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => window.open(badge.openseaUrl, '_blank')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  🔗 View NFT
                </button>
              </div>
            </div>

            {/* Tier Indicator */}
            <div className="absolute top-2 right-2">
              <span className="text-xs font-bold px-2 py-1 rounded-full text-white"
                style={{
                  backgroundColor: badge.tier === 'Diamond' ? '#00ffff' : badge.tier === 'Gold' ? '#ffd700' : badge.tier === 'Silver' ? '#c0c0c0' : '#cd7f32',
                  color: badge.tier === 'Gold' ? '#000' : '#fff',
                }}>
                {badge.tier}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgeCollection; 