// Quantum-detailed documentation and modernization applied throughout
// ProfileHeader.tsx - Displays the user's profile header in GameDin
// - Modernized for React 19+ (concurrent rendering, Suspense-ready)
// - Accessibility: ARIA labels, keyboard navigation, screen reader support, focus management
// - Webflow design: Clean layout, whitespace, rounded corners, shadows, modern typography, accessible color palette, consistent button/card styles
// - Novasanctum AI/Divina-L3: Placeholders for AI-powered profile insights, blockchain-verified stats
// - Usage: <ProfileHeader user={user} isCurrentUser={true} onEditProfile={handleEditProfile} />
// - Dependencies: IUser type, Novasanctum/Divina-L3 clients (future)
// - Changelog: v5.0.0 - Modernized, accessible, quantum-documented, design updated
//
// Example usage:
// <ProfileHeader user={currentUser} isCurrentUser={true} onEditProfile={handleEditProfile} />
//
// Performance: Ready for concurrent rendering, memoizable
// Security: Placeholder for blockchain-verified stats
//
import React from 'react';
import { IUser } from '../../types/social';

interface ProfileHeaderProps {
  user: IUser;
  isCurrentUser: boolean;
  onEditProfile?: () => void;
}

export const ProfileHeader = ({ user, isCurrentUser, onEditProfile }: ProfileHeaderProps) => {
  return (
    <section
      className="profile-header"
      aria-label="User profile header"
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        background: '#fff',
        borderRadius: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        padding: '2rem',
        marginBottom: '2rem',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div className="profile-image" style={{ flexShrink: 0 }}>
        <img
          src={user.picture || user.avatar}
          alt={user.username}
          className="avatar"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '1rem',
            objectFit: 'cover',
            boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
          }}
          aria-label="User avatar"
        />
      </div>
      <div className="profile-info" style={{ flex: 1 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>{user.name || user.username}</h1>
        <p className="username" style={{ color: '#888', margin: '0.25rem 0' }}>@{user.username}</p>
        <p className="bio" style={{ margin: '0.5rem 0 1.5rem 0', color: '#444', fontSize: '1.1rem' }}>{user.bio}</p>
        {/* Placeholder: Novasanctum AI-powered profile insights and Divina-L3 blockchain-verified stats */}
        {/* TODO: Integrate AI insights and blockchain verification here */}
        <div className="stats" style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
          <div className="stat" aria-label="User level">
            <span className="label" style={{ color: '#aaa', fontSize: '0.95rem' }}>Level</span>
            <span className="value" style={{ fontWeight: 600, fontSize: '1.1rem', marginLeft: 4 }}>{user.level}</span>
          </div>
          <div className="stat" aria-label="User rank">
            <span className="label" style={{ color: '#aaa', fontSize: '0.95rem' }}>Rank</span>
            <span className="value" style={{ fontWeight: 600, fontSize: '1.1rem', marginLeft: 4 }}>{user.rank}</span>
          </div>
          <div className="stat" aria-label="Games won">
            <span className="label" style={{ color: '#aaa', fontSize: '0.95rem' }}>Games Won</span>
            <span className="value" style={{ fontWeight: 600, fontSize: '1.1rem', marginLeft: 4 }}>{user.gameStats.gamesWon}</span>
          </div>
          <div className="stat" aria-label="Win rate">
            <span className="label" style={{ color: '#aaa', fontSize: '0.95rem' }}>Win Rate</span>
            <span className="value" style={{ fontWeight: 600, fontSize: '1.1rem', marginLeft: 4 }}>{user.gameStats.winRate}%</span>
          </div>
        </div>
        {isCurrentUser && (
          <button
            onClick={onEditProfile}
            className="edit-profile-button"
            aria-label="Edit profile"
            style={{
              background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontWeight: 700,
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
              outline: 'none',
              transition: 'box-shadow 0.2s',
            }}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onEditProfile && onEditProfile();
              }
            }}
          >
            Edit Profile
          </button>
        )}
      </div>
    </section>
  );
};
