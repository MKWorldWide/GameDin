import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Grid,
  Divider,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import useStore from '../../store/useStore';
import Timeline from './Timeline';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, addFriend } = useStore();
  const isOwnProfile = user?.username === username;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      // Mock API call - replace with actual API call
      return {
        id: '123',
        username: username,
        bio: 'Competitive gamer looking for teammates',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        level: 42,
        rank: 'Diamond',
        stats: {
          gamesPlayed: 150,
          winRate: 65,
          matchesWon: 98,
          matchesLost: 52,
          favoriteGame: 'Valorant',
          playtime: 450,
        },
      };
    },
    enabled: !!username,
  });

  const handleEditProfile = () => {
    // Handle edit profile
    console.log('Edit profile');
  };

  const handleAddFriend = async () => {
    if (!profile) return;
    try {
      await addFriend(profile.id);
      // Show success message
    } catch (error) {
      console.error('Failed to add friend:', error);
      // Show error message
    }
  };

  const handleSendMessage = () => {
    if (!profile) return;
    navigate(`/messages/${profile.id}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">Error loading profile. Please try again later.</Alert>
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">Profile not found.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              <Avatar
                src={profile.avatar}
                alt={profile.username}
                sx={{ width: 120, height: 120 }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom>
                  {profile.username}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {profile.bio}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  {isOwnProfile ? (
                    <Button variant="contained" onClick={handleEditProfile}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outlined" onClick={handleAddFriend}>
                        Add Friend
                      </Button>
                      <Button variant="outlined" onClick={handleSendMessage}>
                        Message
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Level & Rank
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Level</Typography>
                    <Typography>{profile.level}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Rank</Typography>
                    <Typography>{profile.rank}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Gaming Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Games Played
                    </Typography>
                    <Typography variant="h6">{profile.stats.gamesPlayed}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Win Rate
                    </Typography>
                    <Typography variant="h6">{profile.stats.winRate}%</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Matches Won
                    </Typography>
                    <Typography variant="h6">{profile.stats.matchesWon}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Matches Lost
                    </Typography>
                    <Typography variant="h6">{profile.stats.matchesLost}</Typography>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Favorite Game
                    </Typography>
                    <Typography variant="h6">{profile.stats.favoriteGame}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Playtime
                    </Typography>
                    <Typography variant="h6">{profile.stats.playtime} hours</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Timeline */}
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Activity Feed
            </Typography>
            <Timeline userId={profile.id} />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ProfilePage;
