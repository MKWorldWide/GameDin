import React, { lazy, Suspense, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { useToast } from './hooks/useToast';
import { useNavigationStructure } from './hooks/useNavigationStructure';
import config from './config';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const GameDetails = lazy(() => import('./pages/GameDetails'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Initialize Amplify with configuration
Amplify.configure(config);

const App = () => {
  const { showToast } = useToast();
  const { navigationItems } = useNavigationStructure();

  // Memoize navigation items to prevent unnecessary re-renders
  const memoizedNavigationItems = useMemo(() => navigationItems, [navigationItems]);

  // Memoize the fallback component for Suspense
  const fallback = useMemo(() => <LoadingSpinner />, []);

  // Memoize the error boundary fallback
  const errorFallback = useMemo(() => <div>Something went wrong. Please try again.</div>, []);

  // Memoize the Authenticator component to prevent re-renders
  const MemoizedAuthenticator = useMemo(() => (
    <Authenticator>
      {({ signOut, user }) => (
        <div>
          <h1>Hello {user.username}</h1>
          <button onClick={signOut}>Sign out</button>
        </div>
      )}
    </Authenticator>
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
        <Suspense fallback={fallback}>
          {MemoizedAuthenticator}
          {routes}
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 