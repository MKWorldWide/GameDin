import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Badge,
  Chip,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import { useAuth } from '../context/AuthContext';
import { IUserProfile } from '../types/user';
import { useUser } from '../hooks/useUser';

interface IAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: {
    type: 'xp' | 'badge' | 'title';
    value: number | string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'gaming' | 'social' | 'community' | 'special';
}

interface IBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedDate: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const RarityBadge = styled(Badge)<{ rarity: string }>(({ theme, rarity }) => {
  const rarityColors = {
    common: '#7E7E7E',
    rare: '#0088FE',
    epic: '#AA00FF',
    legendary: '#FFD700',
  };
  return {
    '& .MuiBadge-badge': {
      backgroundColor: rarityColors[rarity as keyof typeof rarityColors],
      color: '#fff',
    },
  };
});

const Achievements: React.FC = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading achievements
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please sign in to view achievements</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="space-y-4">
          <p className="text-gray-600">No achievements yet. Start playing to earn some!</p>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
