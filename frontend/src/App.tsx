import React, { lazy, Suspense, useMemo, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import core components
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';

// Import development tools
import { isDevelopment, isMockModeEnabled } from './config/development';
import { mockService } from './services/mockService';

// Lazy load pages for code splitting and performance optimization
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Lazy load development components
const TestRunner = lazy(() => import('./components/TestRunner'));

/**
 * Main App component that serves as the root of the application
 * Features a stunning galaxy theme with Apple-inspired design principles
 *
 * Design Features:
 * - Deep cosmic backgrounds with nebula gradients
 * - Glassmorphism effects for modern UI
 * - Smooth animations and micro-interactions
 * - Premium typography with SF Pro fonts
 * - Responsive design optimized for all devices
 * - Accessibility-first approach with ARIA labels
 *
 * Development Features:
 * - Mock data integration for local development
 * - Test runner interface for automated testing
 * - Development tools and debugging utilities
 */
const App: React.FC = () => {
  const [showDevTools, setShowDevTools] = useState(false);
  const [devStats, setDevStats] = useState<any>(null);

  // Initialize development environment
  useEffect(() => {
    if (isDevelopment() && isMockModeEnabled()) {
      const initializeDev = async() => {
        try {
          await mockService.initialize();
          const stats = mockService.getStats();
          setDevStats(stats);
          console.log('🎮 GameDin Development Mode Active');
          console.log('📊 Mock Data Loaded:', stats);
        } catch (error) {
          console.error('Failed to initialize development environment:', error);
        }
      };

      initializeDev();
    }
  }, []);

  // Development keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D to toggle dev tools
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDevTools(prev => !prev);
      }
    };

    if (isDevelopment()) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, []);

  // Memoize the fallback component for Suspense to prevent re-creation
  const fallback = useMemo(() => <LoadingSpinner />, []);

  // Memoize the error boundary fallback for consistent error handling
  const errorFallback = useMemo(() => (
    <div className="min-h-screen flex items-center justify-center bg-cosmic-primary relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 bg-galaxy-radial animate-nebula-drift"></div>
      <div className="absolute top-10 left-10 w-2 h-2 bg-accent-gold rounded-full animate-star-twinkle"></div>
      <div className="absolute top-20 right-20 w-1 h-1 bg-accent-cyan rounded-full animate-star-twinkle" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-accent-magenta rounded-full animate-star-twinkle" style={{ animationDelay: '1s' }}></div>

      <div className="relative z-10 text-center p-8 bg-cosmic-glass backdrop-blur-md rounded-2xl border border-white/10 shadow-glass">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center animate-pulse-glow">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-sf-pro font-bold text-text-primary mb-4 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Cosmic Error
        </h1>
        <p className="text-text-secondary mb-6 max-w-md">
          Something unexpected happened in the galaxy. Don't worry, we're working to restore the cosmic balance.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-sf-text font-medium rounded-xl hover:shadow-glow transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary-500/30"
          aria-label="Refresh the page"
        >
          Restart Journey
        </button>
      </div>
    </div>
  ), []);

  // Memoize the routes to prevent unnecessary re-renders
  const routes = useMemo(() => (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/:id" element={<GameDetails />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  ), []);

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Router>
        <div className="min-h-screen bg-cosmic-primary relative overflow-hidden font-sf-pro">
          {/* Animated cosmic background */}
          <div className="fixed inset-0 bg-gradient-to-br from-cosmic-primary via-cosmic-secondary to-cosmic-tertiary"></div>
          <div className="fixed inset-0 bg-galaxy-radial animate-nebula-drift opacity-30"></div>

          {/* Floating stars background */}
          <div className="fixed inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-accent-gold rounded-full animate-star-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              ></div>
            ))}
            {[...Array(15)].map((_, i) => (
              <div
                key={`cyan-${i}`}
                className="absolute w-0.5 h-0.5 bg-accent-cyan rounded-full animate-star-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random()}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Development Mode Indicator */}
          {isDevelopment() && isMockModeEnabled() && (
            <div className="fixed top-4 left-4 z-50">
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                <span>🧪 DEV MODE</span>
                <button
                  onClick={() => setShowDevTools(prev => !prev)}
                  className="bg-black text-yellow-500 px-2 py-0.5 rounded text-xs hover:bg-gray-800 transition-colors"
                >
                  {showDevTools ? 'Hide' : 'Show'} Tools
                </button>
              </div>
              {devStats && (
                <div className="mt-2 bg-black/80 text-white p-2 rounded text-xs">
                  <div>Users: {devStats.users}</div>
                  <div>Posts: {devStats.posts}</div>
                  <div>Games: {devStats.games}</div>
                </div>
              )}
            </div>
          )}

          {/* Development Tools Panel */}
          {isDevelopment() && showDevTools && (
            <div className="fixed top-0 left-0 w-full h-full z-40 bg-black/50 backdrop-blur-sm">
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setShowDevTools(false)}
                  className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
                >
                  ✕ Close Dev Tools
                </button>
              </div>
              <div className="w-full h-full overflow-auto p-4">
                <Suspense fallback={<LoadingSpinner />}>
                  <TestRunner />
                </Suspense>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="relative z-10">
            {/* Navigation component */}
            <Navigation />

            {/* Main content area with lazy loading */}
            <main className="container mx-auto px-4 py-8 relative">
              <Suspense fallback={fallback}>
                {routes}
              </Suspense>
            </main>
          </div>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
