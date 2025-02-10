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
  const { user } = useAuth();
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<IAchievement[]>([]);
  const [badges, setBadges] = useState<IBadge[]>([]);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [nextLevelXp, setNextLevelXp] = useState(1000);

  useEffect(() => {
    // Fetch user profile with achievements
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        const mockProfile: IUserProfile = {
          id: user?.id || '',
          username: user?.username || '',
          email: user?.email || '',
          avatar: user?.avatar || '',
          bio: '',
          coverUrl: '',
          presence: user?.presence || 'offline',
          reputation: 0,
          achievements: {
            total: 0,
            recent: [],
          },
          stats: {
            gamesPlayed: 0,
            winRate: 0,
            totalMatches: 0,
            favoriteGame: '',
            playtime: 0,
            rank: '',
          },
          topGames: [],
          recentAchievements: [],
          teams: [],
          highlights: [],
          schedule: [],
          activity: [],
        };
        setProfile(mockProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Mock achievements data
    const mockAchievements: IAchievement[] = [
      {
        id: '1',
        title: 'First Blood',
        description: 'Win your first competitive match',
        icon: '🎮',
        progress: 1,
        maxProgress: 1,
        completed: true,
        reward: { type: 'xp', value: 100 },
        rarity: 'common',
        category: 'gaming',
      },
      {
        id: '2',
        title: 'Community Leader',
        description: 'Create a popular forum thread with 100+ replies',
        icon: '👑',
        progress: 75,
        maxProgress: 100,
        completed: false,
        reward: { type: 'badge', value: 'Community Expert' },
        rarity: 'rare',
        category: 'community',
      },
      {
        id: '3',
        title: 'Tournament Champion',
        description: 'Win a tournament with a prize pool',
        icon: '🏆',
        progress: 0,
        maxProgress: 1,
        completed: false,
        reward: { type: 'title', value: 'Champion' },
        rarity: 'legendary',
        category: 'gaming',
      },
    ];
    setAchievements(mockAchievements);

    // Mock badges data
    const mockBadges: IBadge[] = [
      {
        id: '1',
        name: 'Early Adopter',
        icon: '🌟',
        description: "Joined during the platform's beta phase",
        rarity: 'rare',
        earnedDate: '2024-01-15',
      },
      {
        id: '2',
        name: 'Team Player',
        icon: '🤝',
        description: 'Successfully participated in 10 team formations',
        rarity: 'common',
        earnedDate: '2024-02-20',
      },
    ];
    setBadges(mockBadges);
  }, []);

  const calculateLevelProgress = (currentXp: number, nextLevel: number) => {
    return (currentXp / nextLevel) * 100;
  };

  const handleUnlock = async (achievementId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/achievements/${achievementId}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username,
          avatar: user?.avatar || '',
          presence: user?.presence || 'offline',
        }),
      });

      if (response.ok) {
        // ... rest of the function ...
      }
    } catch (error) {
      // ... error handling ...
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Achievements
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          Your gaming accomplishments and progress
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Total Score
              </Typography>
              <Typography variant="h3">{profile?.reputation || 0}</Typography>
            </Paper>
          </Grid>
          {/* User Level Progress */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Level {level}
              </Typography>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculateLevelProgress(xp, nextLevelXp)}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'primary.main',
                    },
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary">
                {xp} / {nextLevelXp} XP to next level
              </Typography>
            </Paper>
          </Grid>
          {/* Badges Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <WorkspacePremiumIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Earned Badges
              </Typography>
              <Grid container spacing={2}>
                {badges.map(badge => (
                  <Grid item xs={12} sm={6} md={4} key={badge.id}>
                    <RarityBadge
                      rarity={badge.rarity}
                      badgeContent={badge.rarity.charAt(0).toUpperCase()}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <StyledCard>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h5" component="span">
                              {badge.icon}
                            </Typography>
                            <Typography variant="h6">{badge.name}</Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {badge.description}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            display="block"
                            sx={{ mt: 1 }}
                          >
                            Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </StyledCard>
                    </RarityBadge>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          {/* Achievements Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                <EmojiEventsIcon sx={{ mr: 1, verticalAlign: 'bottom' }} />
                Achievements
              </Typography>
              <Grid container spacing={2}>
                {achievements.map(achievement => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <RarityBadge
                      rarity={achievement.rarity}
                      badgeContent={achievement.rarity.charAt(0).toUpperCase()}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                      <StyledCard>
                        <CardContent>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <Typography variant="h5" component="span">
                              {achievement.icon}
                            </Typography>
                            <Typography variant="h6">{achievement.title}</Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            {achievement.description}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <Typography variant="body2">
                                Progress: {achievement.progress}/{achievement.maxProgress}
                              </Typography>
                              <Chip
                                size="small"
                                icon={
                                  achievement.reward.type === 'xp' ? (
                                    <StarIcon />
                                  ) : (
                                    <MilitaryTechIcon />
                                  )
                                }
                                label={`${achievement.reward.type.toUpperCase()}: ${achievement.reward.value}`}
                                color="primary"
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={(achievement.progress / achievement.maxProgress) * 100}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: achievement.completed
                                    ? 'success.main'
                                    : 'primary.main',
                                },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </RarityBadge>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Achievements;
