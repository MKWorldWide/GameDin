import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../hooks/useUser';

/**
 * Galaxy Home Page Component
 *
 * Features Apple-inspired design with:
 * - Hero section with cosmic gradients
 * - Animated feature cards
 * - Glassmorphism effects
 * - Smooth scroll animations
 * - Premium typography and spacing
 */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="relative min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-primary via-cosmic-secondary to-cosmic-tertiary"></div>
        <div className="absolute inset-0 bg-galaxy-radial animate-nebula-drift opacity-40"></div>

        {/* Floating nebula elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-accent-magenta/20 to-accent-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-accent-gold/20 to-accent-orange/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="animate-fade-in">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-sf-pro font-black mb-8 leading-tight">
              <span className="bg-gradient-to-r from-primary-400 via-secondary-400 to-accent-cyan bg-clip-text text-transparent">
                Welcome to
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-gold via-accent-orange to-accent-magenta bg-clip-text text-transparent">
                GameDin
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl lg:text-3xl text-text-secondary mb-12 font-sf-text font-medium max-w-4xl mx-auto leading-relaxed">
              Your cosmic gaming companion. Connect with fellow space explorers,
              track your achievements across the galaxy, and discover new adventures
              in the vast universe of gaming.
            </p>

            {/* CTA Buttons */}
            {!user && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-in-up">
                <button
                  onClick={() => navigate('/register')}
                  className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-sf-text font-semibold text-lg rounded-2xl hover:shadow-glow transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
                  aria-label="Get started with GameDin"
                >
                  <span className="flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Start Your Journey</span>
                  </span>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="group px-8 py-4 bg-cosmic-glass backdrop-blur-md border border-white/20 text-text-primary font-sf-text font-semibold text-lg rounded-2xl hover:bg-cosmic-glassHover hover:shadow-glass transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
                  aria-label="Sign in to your account"
                >
                  <span className="flex items-center space-x-2">
                    <span>⭐</span>
                    <span>Sign In</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-text-secondary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-text-secondary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 bg-cosmic-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-sf-pro font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                Why Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent-gold to-accent-orange bg-clip-text text-transparent">
                GameDin?
              </span>
            </h2>
            <p className="text-xl text-text-secondary font-sf-text font-medium max-w-3xl mx-auto">
              Experience gaming like never before with our cosmic features designed for the modern gamer
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Connect with Gamers */}
            <div className="group bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:shadow-glass transition-all duration-500 transform hover:-translate-y-2 animate-scale-in">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-cosmic transition-all duration-300">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-2xl font-sf-pro font-bold text-text-primary mb-4">
                Connect with Gamers
              </h3>
              <p className="text-text-secondary font-sf-text leading-relaxed">
                Find and connect with fellow space explorers who share your interests and gaming style across the galaxy.
              </p>
            </div>

            {/* Track Progress */}
            <div className="group bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:shadow-glass transition-all duration-500 transform hover:-translate-y-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-orange rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-star transition-all duration-300">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-sf-pro font-bold text-text-primary mb-4">
                Track Progress
              </h3>
              <p className="text-text-secondary font-sf-text leading-relaxed">
                Keep track of your cosmic achievements and progress across different galaxies and gaming universes.
              </p>
            </div>

            {/* Join Tournaments */}
            <div className="group bg-cosmic-glass backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:shadow-glass transition-all duration-500 transform hover:-translate-y-2 animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-accent-magenta to-accent-cyan rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-nebula transition-all duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-2xl font-sf-pro font-bold text-text-primary mb-4">
                Join Tournaments
              </h3>
              <p className="text-text-secondary font-sf-text leading-relaxed">
                Participate in intergalactic gaming tournaments and compete with players from across the universe.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
