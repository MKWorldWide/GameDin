import React from 'react';

/**
 * Games Page Component
 *
 * Features:
 * - Galaxy-themed game browsing interface
 * - Responsive grid layout
 * - Glassmorphism design elements
 * - Loading states with cosmic animations
 */
const Games: React.FC = () => {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-sf-pro font-bold text-text-primary mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
            Discover Games
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Explore the vast universe of games and find your next adventure
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
          {/* Loading Game Card */}
          <div className="bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-glass hover:shadow-glow transition-all duration-300 transform hover:scale-105">
            <div className="animate-pulse">
              <div className="w-full h-48 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-xl mb-4"></div>
              <div className="h-6 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded mb-2"></div>
              <div className="h-4 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded w-3/4"></div>
            </div>
          </div>

          {/* Placeholder Game Cards */}
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-glass hover:shadow-glow transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="w-full h-48 bg-gradient-to-br from-primary-500/30 to-secondary-500/30 rounded-xl mb-4 flex items-center justify-center">
                <span className="text-4xl">🎮</span>
              </div>
              <h3 className="text-xl font-sf-text font-semibold text-text-primary mb-2 group-hover:text-primary-400 transition-colors">
                Game {index + 1}
              </h3>
              <p className="text-text-secondary text-sm">
                An exciting adventure waiting to be discovered
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-accent-gold bg-accent-gold/10 px-2 py-1 rounded-full">
                  Coming Soon
                </span>
                <button className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-sf-text font-medium rounded-xl hover:shadow-glow transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass">
            <h2 className="text-2xl font-sf-pro font-bold text-text-primary mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-text-secondary mb-6 max-w-md mx-auto">
              Join thousands of gamers and discover your next favorite game
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-sf-text font-medium rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105">
              Explore More Games
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Games;
