import React from 'react';
import { useParams } from 'react-router-dom';

/**
 * GameDetails Page Component
 *
 * Features:
 * - Galaxy-themed details view
 * - Glassmorphism card for game info
 * - Responsive layout
 * - Loading state with cosmic style
 */
const GameDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass">
          <h1 className="text-4xl font-sf-pro font-bold text-text-primary mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Game Details
          </h1>
          <div className="mt-4">
            <p className="text-lg text-text-secondary">Loading game details for ID: <span className="font-mono text-accent-gold">{id}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
