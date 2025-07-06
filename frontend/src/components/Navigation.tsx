import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useUser } from '../hooks/useUser';

interface NavigationProps {
  signOut?: () => void;
}

/**
 * Galaxy Navigation Component
 *
 * Features Apple-inspired design with:
 * - Glassmorphism navigation bar
 * - Smooth hover animations
 * - Cosmic gradient effects
 * - Responsive mobile menu
 * - Premium typography and spacing
 */
const Navigation: React.FC<NavigationProps> = ({ signOut }) => {
  const { user } = useUser();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle sign out with fallback
  const handleSignOut = () => {
    if (signOut) {
      signOut();
    } else {
      // Fallback: just reload the page for now
      window.location.reload();
    }
  };

  // Navigation items
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/games', label: 'Games', icon: '🎮' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-cosmic-glass/80 backdrop-blur-xl border-b border-white/10 shadow-glass'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            aria-label="GameDin Home"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-cosmic group-hover:shadow-glow transition-all duration-300 transform group-hover:scale-105">
                <span className="text-xl">🚀</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
            </div>
            <span className="text-2xl lg:text-3xl font-sf-pro font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              GameDin
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-sf-text font-medium transition-all duration-300 relative group ${
                  location.pathname === item.path
                    ? 'text-text-primary bg-cosmic-glass/50 shadow-glass'
                    : 'text-text-secondary hover:text-text-primary hover:bg-cosmic-glass/30'
                }`}
                aria-label={`Navigate to ${item.label}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"></div>
                )}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Avatar */}
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-gold to-accent-orange rounded-full flex items-center justify-center shadow-star hover:shadow-glow transition-all duration-300 transform hover:scale-105">
                    <span className="text-white font-sf-text font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-accent-gold to-accent-orange rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2 bg-gradient-to-r from-status-error to-red-600 text-white font-sf-text font-medium rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="px-6 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-sf-text font-medium rounded-xl animate-pulse-glow">
                Sign In
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-cosmic-glass/50 backdrop-blur-sm border border-white/10 hover:bg-cosmic-glass/70 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10 animate-slide-in-down">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-sf-text font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-text-primary bg-cosmic-glass/50 shadow-glass'
                      : 'text-text-secondary hover:text-text-primary hover:bg-cosmic-glass/30'
                  }`}
                  aria-label={`Navigate to ${item.label}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
