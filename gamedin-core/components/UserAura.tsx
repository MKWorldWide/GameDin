// Crystal Kit: UserAura - Avatar glow based on GDI tier
// Modular, typed, accessible, and styled for clarity

import React from 'react';
import { GDITier } from '../types/GDI';

/**
 * UserAura - Displays an avatar with a glow color based on GDI tier
 * @param avatarUrl - The user's avatar image URL
 * @param tier - The user's GDI tier
 *
 * Example:
 *   <UserAura avatarUrl="/avatars/hero.png" tier="Radiant" />
 */
const tierColors: Record<GDITier, string> = {
  Sovereign: '#ffd700', // Gold
  Radiant: '#00e6ff',   // Cyan
  Initiate: '#a0ffb3',  // Green
  Wanderer: '#b0b0b0',  // Gray
};

export const UserAura: React.FC<{ avatarUrl: string; tier: GDITier }> = ({ avatarUrl, tier }) => (
  <div
    aria-label={`User avatar with ${tier} aura`}
    style={{
      display: 'inline-block',
      borderRadius: '50%',
      boxShadow: `0 0 24px 8px ${tierColors[tier]}`,
      padding: 4,
      background: '#fff',
    }}
  >
    <img
      src={avatarUrl}
      alt="User avatar"
      style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'block',
      }}
    />
  </div>
); 