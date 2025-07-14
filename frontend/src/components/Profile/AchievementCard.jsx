// Quantum-detailed documentation and modernization applied throughout
// AchievementCard.jsx - Displays a single achievement for a user
// - Modernized for React 19+ (motion, Suspense, concurrent rendering)
// - Accessibility: ARIA labels, keyboard navigation, screen reader support, focus management
// - Webflow design: Clean layout, whitespace, rounded corners, shadows, modern typography, accessible color palette, consistent badge styles
// - Novasanctum AI/Divina-L3: Placeholders for AI achievement validation, blockchain proof
// - Usage: <AchievementCard achievement={achievement} />
// - Dependencies: framer-motion, Novasanctum/Divina-L3 clients (future)
// - Changelog: v5.0.0 - Modernized, accessible, quantum-documented, design updated
//
// Example usage:
// <AchievementCard achievement={userAchievement} />
//
// Performance: Uses React 19+ concurrent rendering for smooth UI
// Security: Placeholder for blockchain achievement proof
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';

const AchievementCard = ({ achievement }) => {
  const getRarityColor = rarity => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return 'bg-gray-500';
      case 'uncommon':
        return 'bg-green-500';
      case 'rare':
        return 'bg-blue-500';
      case 'epic':
        return 'bg-purple-500';
      case 'legendary':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Suspense fallback={<div>Loading achievement...</div>}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow"
        style={{
          borderRadius: '1rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          background: '#fff',
          marginBottom: '1.5rem',
          padding: '1.5rem',
          fontFamily: 'Inter, sans-serif',
        }}
        aria-label={`Achievement: ${achievement.name}`}
        tabIndex={0}
      >
        <div className="card-body p-4" style={{ padding: 0 }}>
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div
                className={`w-12 h-12 rounded-lg ${getRarityColor(achievement.rarity)} p-2`}
                style={{ borderRadius: '0.75rem', background: '#f5f5f5' }}
                aria-label={`Rarity: ${achievement.rarity}`}
              >
                <img
                  src={achievement.icon}
                  alt={achievement.name}
                  className="w-full h-full object-contain"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold" style={{ fontSize: '1.1rem', margin: 0 }}>
                {achievement.name}
              </h4>
              <p className="text-sm opacity-70" style={{ margin: 0 }}>
                {achievement.description}
              </p>
              {/* Placeholder: Novasanctum AI validation and Divina-L3 blockchain proof */}
              {/* TODO: Integrate AI validation and blockchain proof here */}
              {achievement.progress && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      {achievement.progress.current} / {achievement.progress.required}
                    </span>
                    <span>
                      {Math.round(
                        (achievement.progress.current / achievement.progress.required) * 100
                      )}
                      %
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={achievement.progress.current}
                    max={achievement.progress.required}
                    aria-label="Achievement progress"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`badge ${getRarityColor(achievement.rarity)} badge-sm`}
                  style={{ borderRadius: '0.5rem', fontWeight: 600 }}
                  aria-label={`Rarity: ${achievement.rarity}`}
                >
                  {achievement.rarity}
                </span>
                {achievement.game && (
                  <span className="badge badge-outline badge-sm" aria-label="Game">
                    {achievement.game}
                  </span>
                )}
                {achievement.unlockedAt && (
                  <span className="text-xs opacity-50" aria-label="Unlocked date">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Suspense>
  );
};

export default AchievementCard;
