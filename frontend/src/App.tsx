import React from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import awsconfig from './aws-exports';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Games from './pages/Games';
import Profile from './pages/Profile';
import GameDetails from './pages/GameDetails';

// Configure Amplify
Amplify.configure(awsconfig);

function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navigation signOut={signOut} />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/:id" element={<GameDetails />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </Router>
      )}
    </Authenticator>
  );
}

export default App; 