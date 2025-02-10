import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Avatar,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Badge,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi, messagesApi } from '../services/api';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MessageIcon from '@mui/icons-material/Message';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import TimelineIcon from '@mui/icons-material/Timeline';

interface IUserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  status: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  reputation: number;
  rank?: string;
  level?: number;
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      game: string;
      earnedAt: string;
    }>;
  };
  stats: {
    gamesPlayed: number;
    winRate: number;
    totalMatches: number;
    favoriteGame: string;
    playtime: number;
    rank: string;
  };
  topGames: Array<{
    name: string;
    hoursPlayed: number;
    level: number;
    platform: string;
    rank?: string;
    winRate: number;
    favoriteCharacter?: string;
  }>;
  recentAchievements: Array<{
    id: string;
    name: string;
    game: string;
    icon: string;
    rarity: string;
    unlockedAt: string;
    description: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    game: string;
    role: string;
    members: number;
    rank?: string;
    logo: string;
  }>;
  highlights: Array<{
    id: string;
    title: string;
    game: string;
    type: 'clip' | 'achievement' | 'record';
    thumbnailUrl: string;
    views: number;
    date: string;
  }>;
  schedule: Array<{
    id: string;
    type: 'tournament' | 'practice' | 'streaming';
    game: string;
    title: string;
    date: string;
    participants: number;
  }>;
  activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const CoverImage = styled(Box)({
  height: '200px',
  width: '100%',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
});

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(15),
  height: theme.spacing(15),
  border: `4px solid ${theme.palette.background.paper}`,
  position: 'absolute',
  bottom: '-30%',
  left: theme.spacing(3),
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
}));

const GameCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
}));

const AchievementCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 215, 0, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const StatusBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const HighlightCard = styled(Paper)(() => ({
  padding: '1rem',
  borderRadius: '0.5rem',
  backgroundColor: 'var(--highlight-bg)',
  color: 'var(--highlight-text)',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out',
  },
}));

const HighlightOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2),
  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  color: 'white',
}));

const TeamCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<ITabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    bio: '',
    currentGame: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const fetchProfile = async (username: string) => {
    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authApi.getProfile(username);
      setProfile(response.data);
      setEditFormData({
        bio: response.data.bio,
        currentGame: response.data.currentGame || '',
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile(username);
    }
  }, [username]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ mt: -8 }} // Compensate for navbar
      >
        <Typography>Profile not found</Typography>
      </Box>
    );
  }

  const isOwnProfile = user.username === profile.username;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#44b700';
      case 'in-game':
        return '#ff9800';
      default:
        return '#bdbdbd';
    }
  };

  const handleEditProfile = async () => {
    try {
      await authApi.updateProfile(username!, editFormData);
      setProfile(prev => (prev ? { ...prev, ...editFormData } : null));
      setEditDialogOpen(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    }
  };

  const handleAddFriend = async () => {
    try {
      // Implement friend request logic
      setSnackbar({
        open: true,
        message: 'Friend request sent',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send friend request',
        severity: 'error',
      });
    }
  };

  const handleSendMessage = async () => {
    try {
      if (!profile) return;
      const response = await messagesApi.createConversation(profile.id);
      navigate(`/messages/${response.data.id}`);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to start conversation',
        severity: 'error',
      });
    }
  };

  const handleInviteToTeam = async () => {
    try {
      // Implement team invitation logic
      setSnackbar({
        open: true,
        message: 'Team invitation sent',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send team invitation',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ pt: 8 }}>
      {' '}
      {/* Add padding top to account for navbar */}
      <CoverImage sx={{ backgroundImage: `url(${profile.coverUrl})` }}>
        <StatusBadge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            position: 'absolute',
            bottom: '-20%',
            left: theme => theme.spacing(3),
            '& .MuiBadge-badge': {
              backgroundColor: getStatusColor(profile.status),
            },
          }}
        >
          <ProfileAvatar src={profile.avatarUrl} alt={profile.username} />
        </StatusBadge>
      </CoverImage>
      <Container maxWidth="lg">
        <Box sx={{ mt: 10, mb: 4 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" gutterBottom>
                  {profile.username}
                </Typography>
                {profile.status === 'in-game' && (
                  <Chip
                    icon={<SportsEsportsIcon />}
                    label={`Playing ${profile.currentGame}`}
                    color="warning"
                    size="small"
                  />
                )}
              </Box>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
                {profile.bio}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  icon={<StarIcon />}
                  label={`${profile.reputation} Rating`}
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<WhatshotIcon />}
                  label={`${profile.stats.winRate}% Win Rate`}
                  color="success"
                  size="small"
                />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              {!isOwnProfile && (
                <>
                  <Tooltip title="Add Friend">
                    <IconButton color="primary" onClick={handleAddFriend}>
                      <PersonAddIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Send Message">
                    <IconButton color="primary" onClick={handleSendMessage}>
                      <MessageIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Invite to Team">
                    <IconButton color="primary" onClick={handleInviteToTeam}>
                      <GroupAddIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              {isOwnProfile && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  sx={{ mt: 1 }}
                  onClick={() => setEditDialogOpen(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupIcon />
                  <Typography variant="h6">{profile.stats.gamesPlayed}</Typography>
                </Box>
                <Typography color="textSecondary">Games</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <SportsEsportsIcon />
                  <Typography variant="h6">{profile.stats.totalMatches}</Typography>
                </Box>
                <Typography color="textSecondary">Total Matches</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <EmojiEventsIcon />
                  <Typography variant="h6">{profile.achievements.total}</Typography>
                </Box>
                <Typography color="textSecondary">Achievements</Typography>
              </StatsCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatsCard>
                <Box display="flex" alignItems="center" gap={1}>
                  <TimelineIcon />
                  <Typography variant="h6">{profile.stats.totalMatches}</Typography>
                </Box>
                <Typography color="textSecondary">Total Matches</Typography>
              </StatsCard>
            </Grid>
          </Grid>

          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
            <Tab label="Games" icon={<VideogameAssetIcon />} iconPosition="start" />
            <Tab label="Achievements" icon={<EmojiEventsIcon />} iconPosition="start" />
            <Tab label="Teams" icon={<GroupIcon />} iconPosition="start" />
            <Tab label="Highlights" icon={<WhatshotIcon />} iconPosition="start" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Box>
              {profile.topGames.map((game, index) => (
                <GameCard key={index}>
                  <SportsEsportsIcon sx={{ fontSize: 40 }} />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{game.name}</Typography>
                      <Box display="flex" gap={1}>
                        <Chip label={game.platform} size="small" />
                        {game.rank && <Chip label={game.rank} color="primary" size="small" />}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Level {game.level}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {game.hoursPlayed} hours played
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {game.winRate}% Win Rate
                      </Typography>
                      {game.favoriteCharacter && (
                        <Typography variant="body2" color="textSecondary">
                          Favorite: {game.favoriteCharacter}
                        </Typography>
                      )}
                    </Box>
                    <LinearProgress variant="determinate" value={game.level % 100} sx={{ mt: 1 }} />
                  </Box>
                </GameCard>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box>
              {profile.achievements.recent.map(achievement => (
                <AchievementCard key={achievement.id}>
                  <Typography variant="h4" component="span">
                    {achievement.icon}
                  </Typography>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{achievement.name}</Typography>
                      <Chip label={achievement.rarity} size="small" color="warning" />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {achievement.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Unlocked {new Date(achievement.earnedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </AchievementCard>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box>
              {profile.teams.map(team => (
                <TeamCard key={team.id}>
                  <Avatar src={team.logo} alt={team.name} sx={{ width: 60, height: 60 }} />
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{team.name}</Typography>
                      <Box display="flex" gap={1}>
                        <Chip label={team.game} size="small" />
                        {team.rank && <Chip label={team.rank} color="primary" size="small" />}
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Role: {team.role}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {team.members} Members
                      </Typography>
                    </Box>
                  </Box>
                </TeamCard>
              ))}
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={2}>
              {profile.highlights.map(highlight => (
                <Grid item xs={12} sm={6} md={4} key={highlight.id}>
                  <HighlightCard sx={{ backgroundImage: `url(${highlight.thumbnailUrl})` }}>
                    <HighlightOverlay>
                      <Typography variant="h6">{highlight.title}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption">{highlight.game}</Typography>
                        <Typography variant="caption">{highlight.views} views</Typography>
                      </Box>
                    </HighlightOverlay>
                  </HighlightCard>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Upcoming Schedule Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Schedule
            </Typography>
            <Grid container spacing={2}>
              {profile.schedule.map(event => (
                <Grid item xs={12} sm={6} md={4} key={event.id}>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(8, 95, 128, 0.1)' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">{event.title}</Typography>
                      <Chip
                        label={event.type}
                        size="small"
                        color={event.type === 'tournament' ? 'error' : 'primary'}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {event.game}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    {event.participants > 0 && (
                      <Typography variant="caption" color="textSecondary">
                        {event.participants} participants
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Container>
      {/* Add Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            value={editFormData.bio}
            onChange={e => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Current Game"
            value={editFormData.currentGame}
            onChange={e => setEditFormData(prev => ({ ...prev, currentGame: e.target.value }))}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditProfile} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
