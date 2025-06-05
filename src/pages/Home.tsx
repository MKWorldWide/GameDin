<<<<<<< HEAD
import React from 'react';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import TokenIcon from '@mui/icons-material/Token';
import GamesIcon from '@mui/icons-material/Games';

const VideoBackground = styled('video')({
  position: 'fixed',
  right: 0,
  bottom: 0,
  minWidth: '100%',
  minHeight: '100%',
  width: 'auto',
  height: 'auto',
  zIndex: -1,
  objectFit: 'cover',
});

const ContentOverlay = styled(Box)(({ theme }) => ({
  position: 'relative',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}));

const Section = styled(Box)(({ theme }) => ({
  padding: theme.spacing(10, 0),
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '20px',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(1.5, 4),
  fontSize: '1.2rem',
  borderRadius: '30px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Welcome to GameDin</h1>
      <p className="text-lg text-gray-700">
        Your personal gaming companion. Track your games, connect with friends, and discover new adventures.
      </p>
    </div>
  );
};

export default Home;
=======
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to GameDin
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your personal gaming companion. Connect with fellow gamers, track your achievements, and discover new adventures.
            </p>
            {!user && (
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose GameDin?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect with Gamers</h3>
              <p className="text-gray-600">Find and connect with fellow gamers who share your interests and gaming style.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Keep track of your gaming achievements and progress across different games.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Tournaments</h3>
              <p className="text-gray-600">Participate in gaming tournaments and compete with players worldwide.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
