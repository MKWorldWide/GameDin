

import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useRouter } from './hooks/useRouter';
import Layout from './components/layout/Layout';
import GenesisPage from './pages/GenesisPage';
import FeedPage from './pages/FeedPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LivePage from './pages/LivePage';
import StreamPage from './pages/StreamPage';
import MatchmakingPage from './pages/MatchmakingPage';
import CreatorStudioPage from './pages/CreatorStudioPage';
import LoadingSpinner from './components/LoadingSpinner';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';
import { QuantumFidelityProvider } from './context/QuantumFidelityContext';

const AppRouter: React.FC = () => {
  const { user, loading } = useAuth();
  const { path } = useRouter();

  if (loading) {
    return (
        <div className="flex min-h-screen justify-center items-center bg-primary">
            <LoadingSpinner />
        </div>
    );
  }

  if (!user) {
    return <GenesisPage />;
  }
  
  const renderPage = () => {
    if (path.startsWith('/stream/')) {
        const streamId = path.split('/')[2];
        return <StreamPage streamId={streamId} />;
    }
    
    if (path.startsWith('/profile/')) {
        const handle = path.split('/')[2];
        return <ProfilePage userHandle={handle} />;
    }

    switch (path) {
        case '/live':
            return <LivePage />;
        case '/matchmaking':
            return <MatchmakingPage />;
        case '/chat':
            return <ChatPage />;
        case '/profile':
            return <ProfilePage />;
        case '/creator-studio':
            return <CreatorStudioPage />;
        case '/':
        default:
            return <FeedPage />;
    }
  };

  return <Layout>{renderPage()}</Layout>;
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ThemeProvider>
          <QuantumFidelityProvider>
            <Toast />
            <AppRouter />
          </QuantumFidelityProvider>
        </ThemeProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;