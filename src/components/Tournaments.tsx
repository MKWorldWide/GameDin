import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  AvatarGroup,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { tournamentsApi, teamsApi } from '../services/api';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupIcon from '@mui/icons-material/Group';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import TimelineIcon from '@mui/icons-material/Timeline';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface ITournament {
  id: string;
  title: string;
  game: {
    name: string;
    icon: string;
  };
  startDate: string;
  endDate: string;
  prizePool: {
    amount: number;
    currency: string;
  };
  format: string;
  teamSize: number;
  maxTeams: number;
  registeredTeams: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  description: string;
  rules: string[];
  organizer: {
    name: string;
    logo: string;
    verified: boolean;
  };
  location: {
    type: 'online' | 'offline';
    venue?: string;
    address?: string;
  };
  streams?: {
    platform: string;
    url: string;
  }[];
}

const StyledCard = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(8, 95, 128, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  const statusColors = {
    upcoming: theme.palette.info.main,
    ongoing: theme.palette.success.main,
    completed: theme.palette.grey[500],
  };
  return {
    backgroundColor: statusColors[status as keyof typeof statusColors],
    color: '#fff',
  };
});

const Tournaments: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<ITournament[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [userTeams, setUserTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    game: '',
    description: '',
    startDate: '',
    endDate: '',
    prizePool: '',
    maxTeams: '',
    format: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tournamentsResponse, teamsResponse] = await Promise.all([
          tournamentsApi.getTournaments(),
          teamsApi.getTeams(),
        ]);
        setTournaments(tournamentsResponse.data);
        setUserTeams(teamsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load tournaments',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTournament = async () => {
    try {
      const response = await tournamentsApi.createTournament(createFormData);
      setTournaments(prev => [...prev, response.data]);
      setCreateDialogOpen(false);
      setCreateFormData({
        title: '',
        game: '',
        description: '',
        startDate: '',
        endDate: '',
        prizePool: '',
        maxTeams: '',
        format: '',
      });
      setSnackbar({
        open: true,
        message: 'Tournament created successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error creating tournament:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create tournament',
        severity: 'error',
      });
    }
  };

  const handleRegister = (tournamentId: string) => {
    setSnackbar({
      open: true,
      message: 'Successfully registered for the tournament',
      severity: 'success',
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: SelectChangeEvent<string>) => {
    setSelectedGame(e.target.value);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch =
      tournament.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tournament.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === 'all' || tournament.game.name === selectedGame;
    return matchesSearch && matchesGame;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tournaments & Events
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Game</InputLabel>
              <Select value={selectedGame} label="Game" onChange={handleFilterChange}>
                <MenuItem value="all">All Games</MenuItem>
                <MenuItem value="Valorant">Valorant</MenuItem>
                <MenuItem value="League of Legends">League of Legends</MenuItem>
                <MenuItem value="CS:GO">CS:GO</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Tournament
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tournaments Grid */}
      <Grid container spacing={3}>
        {loading ? (
          <Box display="flex" justifyContent="center" width="100%" mt={4}>
            <CircularProgress />
          </Box>
        ) : (
          filteredTournaments.map(tournament => (
            <Grid item xs={12} md={6} key={tournament.id}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {tournament.title}
                      </Typography>
                      <Box display="flex" gap={1} mb={2}>
                        <Chip label={tournament.game.name} size="small" color="primary" />
                        <StatusChip
                          label={tournament.status}
                          size="small"
                          status={tournament.status}
                        />
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Tooltip title={tournament.organizer.name}>
                        <Avatar src={tournament.organizer.logo} sx={{ width: 40, height: 40 }} />
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="textSecondary" paragraph>
                    {tournament.description}
                  </Typography>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarMonthIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Start Date
                          </Typography>
                          <Typography variant="body2">
                            {new Date(tournament.startDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MonetizationOnIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Prize Pool
                          </Typography>
                          <Typography variant="body2">
                            ${tournament.prizePool.amount} {tournament.prizePool.currency}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <GroupsIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Teams
                          </Typography>
                          <Typography variant="body2">
                            {tournament.registeredTeams}/{tournament.maxTeams}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmojiEventsIcon color="action" />
                        <Box>
                          <Typography variant="caption" color="textSecondary" display="block">
                            Format
                          </Typography>
                          <Typography variant="body2">{tournament.format}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <GroupsIcon />
                      <Typography variant="body2">
                        {tournament.registeredTeams}/{tournament.maxTeams} Teams
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleRegister(tournament.id)}
                      disabled={tournament.registeredTeams >= tournament.maxTeams}
                    >
                      Register
                    </Button>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))
        )}
      </Grid>

      {/* Create Tournament Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create Tournament</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Tournament Title"
              value={createFormData.title}
              onChange={e => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Game</InputLabel>
              <Select
                value={createFormData.game}
                label="Game"
                onChange={e => setCreateFormData(prev => ({ ...prev, game: e.target.value }))}
              >
                <MenuItem value="Valorant">Valorant</MenuItem>
                <MenuItem value="League of Legends">League of Legends</MenuItem>
                <MenuItem value="CS:GO">CS:GO</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={createFormData.description}
              onChange={e => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
              margin="normal"
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="datetime-local"
                  value={createFormData.startDate}
                  onChange={e =>
                    setCreateFormData(prev => ({ ...prev, startDate: e.target.value }))
                  }
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="datetime-local"
                  value={createFormData.endDate}
                  onChange={e => setCreateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Prize Pool"
              type="number"
              value={createFormData.prizePool}
              onChange={e => setCreateFormData(prev => ({ ...prev, prizePool: e.target.value }))}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Maximum Teams"
              type="number"
              value={createFormData.maxTeams}
              onChange={e => setCreateFormData(prev => ({ ...prev, maxTeams: e.target.value }))}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Tournament Format</InputLabel>
              <Select
                value={createFormData.format}
                label="Tournament Format"
                onChange={e => setCreateFormData(prev => ({ ...prev, format: e.target.value }))}
              >
                <MenuItem value="Single Elimination">Single Elimination</MenuItem>
                <MenuItem value="Double Elimination">Double Elimination</MenuItem>
                <MenuItem value="Round Robin">Round Robin</MenuItem>
                <MenuItem value="Swiss">Swiss System</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTournament}>
            Create Tournament
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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
    </Container>
  );
};

export default Tournaments;
