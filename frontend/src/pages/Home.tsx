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
