import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Button,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Rating,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useAuth } from '../context/AuthContext';

interface IPlayerStats {
  username: string;
  avatarUrl: string;
  games: {
    name: string;
    rank: string;
    winRate: number;
    kda: number;
    matches: number;
    recentPerformance: number[];
  }[];
  roles: {
    name: string;
    proficiency: number;
  }[];
  playstyle: {
    aggression: number;
    teamwork: number;
    objectiveFocus: number;
    consistency: number;
  };
  availability: {
    timezone: string;
    schedule: string[];
  };
}

interface ITeamSuggestion {
  id: string;
  players: {
    username: string;
    avatarUrl: string;
    role: string;
    compatibility: number;
  }[];
  synergy: number;
  playstyle: string;
  strengths: string[];
  weaknesses: string[];
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 5,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    borderRadius: 5,
  },
}));

const StatBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
}));

const GameAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedGame, setSelectedGame] = useState('valorant');
  const [playerStats, setPlayerStats] = useState<IPlayerStats | null>(null);
  const [teamSuggestions, setTeamSuggestions] = useState<ITeamSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [findTeamDialogOpen, setFindTeamDialogOpen] = useState(false);

  useEffect(() => {
    // Mock player stats data
    const mockPlayerStats: IPlayerStats = {
      username: 'ProGamer123',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer123',
      games: [
        {
          name: 'Valorant',
          rank: 'Diamond 2',
          winRate: 58.5,
          kda: 1.8,
          matches: 245,
          recentPerformance: [65, 72, 58, 80, 75, 68, 85],
        },
        {
          name: 'League of Legends',
          rank: 'Platinum 1',
          winRate: 52.3,
          kda: 3.2,
          matches: 189,
          recentPerformance: [60, 55, 70, 65, 75, 80, 72],
        },
      ],
      roles: [
        { name: 'Entry Fragger', proficiency: 85 },
        { name: 'Support', proficiency: 70 },
        { name: 'IGL', proficiency: 60 },
      ],
      playstyle: {
        aggression: 75,
        teamwork: 85,
        objectiveFocus: 70,
        consistency: 80,
      },
      availability: {
        timezone: 'UTC-5',
        schedule: ['Weekday Evenings', 'Weekend Afternoons'],
      },
    };
    setPlayerStats(mockPlayerStats);

    // Mock team suggestions
    const mockTeamSuggestions: ITeamSuggestion[] = [
      {
        id: '1',
        players: [
          {
            username: 'ProGamer123',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer123',
            role: 'Entry Fragger',
            compatibility: 95,
          },
          {
            username: 'TacticalMind',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TacticalMind',
            role: 'IGL',
            compatibility: 90,
          },
          {
            username: 'SupportKing',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SupportKing',
            role: 'Support',
            compatibility: 88,
          },
        ],
        synergy: 91,
        playstyle: 'Aggressive with Strong Map Control',
        strengths: ['Entry Fragging', 'Site Execution', 'Team Coordination'],
        weaknesses: ['Post-plant Situations', 'Economy Management'],
      },
    ];
    setTeamSuggestions(mockTeamSuggestions);
  }, []);

  const handleFindTeam = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setFindTeamDialogOpen(true);
    }, 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Game Analytics & Matchmaking
        </Typography>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab icon={<AssessmentIcon />} label="Performance Analysis" />
          <Tab icon={<GroupsIcon />} label="Team Finder" />
          <Tab icon={<TimelineIcon />} label="Progress Tracking" />
        </Tabs>
      </Box>

      {activeTab === 0 && playerStats && (
        <Grid container spacing={3}>
          {/* Game Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Game</InputLabel>
              <Select
                value={selectedGame}
                label="Select Game"
                onChange={e => setSelectedGame(e.target.value)}
              >
                <MenuItem value="valorant">Valorant</MenuItem>
                <MenuItem value="lol">League of Legends</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Performance Overview */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Overview
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <StatBox>
                      <Typography variant="subtitle2" gutterBottom>
                        Win Rate
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {playerStats.games[0].winRate}%
                      </Typography>
                      <ProgressBar
                        variant="determinate"
                        value={playerStats.games[0].winRate}
                        sx={{ mt: 1 }}
                      />
                    </StatBox>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StatBox>
                      <Typography variant="subtitle2" gutterBottom>
                        KDA Ratio
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {playerStats.games[0].kda}
                      </Typography>
                      <ProgressBar
                        variant="determinate"
                        value={playerStats.games[0].kda * 20}
                        sx={{ mt: 1 }}
                      />
                    </StatBox>
                  </Grid>
                </Grid>

                {/* Playstyle Analysis */}
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Playstyle Analysis
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2">Aggression</Typography>
                    <ProgressBar
                      variant="determinate"
                      value={playerStats.playstyle.aggression}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Teamwork</Typography>
                    <ProgressBar
                      variant="determinate"
                      value={playerStats.playstyle.teamwork}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Objective Focus</Typography>
                    <ProgressBar
                      variant="determinate"
                      value={playerStats.playstyle.objectiveFocus}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">Consistency</Typography>
                    <ProgressBar
                      variant="determinate"
                      value={playerStats.playstyle.consistency}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Role Proficiency */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Role Proficiency
                </Typography>
                {playerStats.roles.map(role => (
                  <Box key={role.name} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">{role.name}</Typography>
                      <Typography variant="body2" color="primary">
                        {role.proficiency}%
                      </Typography>
                    </Box>
                    <ProgressBar variant="determinate" value={role.proficiency} />
                  </Box>
                ))}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Team Finder */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">AI Team Matchmaking</Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonSearchIcon />}
                    onClick={handleFindTeam}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Analyzing Profile...
                      </>
                    ) : (
                      'Find Team'
                    )}
                  </Button>
                </Box>

                {teamSuggestions.map(team => (
                  <Box key={team.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Suggested Team Composition
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <StatBox>
                          <Typography variant="subtitle2" gutterBottom>
                            Team Synergy
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress
                              variant="determinate"
                              value={team.synergy}
                              size={60}
                              thickness={6}
                              sx={{ color: 'primary.main' }}
                            />
                            <Typography variant="h4" color="primary">
                              {team.synergy}%
                            </Typography>
                          </Box>
                        </StatBox>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <StatBox>
                          <Typography variant="subtitle2" gutterBottom>
                            Team Members
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={2}>
                            {team.players.map(player => (
                              <Box key={player.username} textAlign="center">
                                <Tooltip title={`${player.username} - ${player.role}`}>
                                  <Avatar
                                    src={player.avatarUrl}
                                    sx={{ width: 48, height: 48, mb: 1 }}
                                  />
                                </Tooltip>
                                <Typography variant="caption" display="block">
                                  {player.role}
                                </Typography>
                                <Typography variant="caption" color="primary">
                                  {player.compatibility}% Match
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </StatBox>
                      </Grid>
                      <Grid item xs={12}>
                        <StatBox>
                          <Typography variant="subtitle2" gutterBottom>
                            Team Analysis
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            Playstyle: {team.playstyle}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                            <Typography variant="body2">Strengths:</Typography>
                            {team.strengths.map(strength => (
                              <Chip key={strength} label={strength} size="small" color="success" />
                            ))}
                          </Box>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Typography variant="body2">Areas for Improvement:</Typography>
                            {team.weaknesses.map(weakness => (
                              <Chip key={weakness} label={weakness} size="small" color="warning" />
                            ))}
                          </Box>
                        </StatBox>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* Progress Tracking */}
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Trends
                </Typography>
                {/* Add performance tracking charts and statistics here */}
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      )}

      {/* Find Team Dialog */}
      <Dialog
        open={findTeamDialogOpen}
        onClose={() => setFindTeamDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Team Preferences</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Preferred Game</InputLabel>
              <Select label="Preferred Game">
                <MenuItem value="valorant">Valorant</MenuItem>
                <MenuItem value="lol">League of Legends</MenuItem>
                <MenuItem value="csgo">CS:GO</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Preferred Role</InputLabel>
              <Select label="Preferred Role">
                <MenuItem value="entry">Entry Fragger</MenuItem>
                <MenuItem value="support">Support</MenuItem>
                <MenuItem value="igl">In-Game Leader</MenuItem>
              </Select>
            </FormControl>
            <TextField fullWidth label="Rank Range" margin="normal" />
            <TextField fullWidth label="Schedule Availability" margin="normal" multiline rows={2} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFindTeamDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setFindTeamDialogOpen(false)}>
            Find Matches
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GameAnalytics;
