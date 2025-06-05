import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  Chip,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    bio: profile.bio || '',
    languages: profile.languages || [],
    games: profile.games || [],
    availability: profile.availability || {
      schedule: [
        { day: 'Weekdays', time: '18:00-23:00' },
        { day: 'Weekends', time: '14:00-02:00' },
      ],
      timezone: 'UTC-5',
    },
    preferences: profile.preferences || {
      roles: [],
      playstyle: [],
      communication: [],
    },
  });

  const [newLanguage, setNewLanguage] = useState('');
  const [newGame, setNewGame] = useState({ name: '', rank: '' });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const addLanguage = () => {
    if (newLanguage && !formData.languages.includes(newLanguage)) {
      handleChange('languages', [...formData.languages, newLanguage]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (lang) => {
    handleChange('languages', formData.languages.filter(l => l !== lang));
  };

  const addGame = () => {
    if (newGame.name && newGame.rank) {
      handleChange('games', [...formData.games, { ...newGame, hours: 0 }]);
      setNewGame({ name: '', rank: '' });
    }
  };

  const removeGame = (gameName) => {
    handleChange('games', formData.games.filter(g => g.name !== gameName));
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Profile
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Basic Info */}
          <Box>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Stack spacing={2}>
              <TextField
                label="Username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                fullWidth
              />
              <TextField
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </Box>

          {/* Languages */}
          <Box>
            <Typography variant="h6" gutterBottom>Languages</Typography>
            <Box mb={2}>
              <Grid container spacing={1}>
                {formData.languages.map((lang) => (
                  <Grid item key={lang}>
                    <Chip
                      label={lang}
                      onDelete={() => removeLanguage(lang)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                label="Add Language"
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={addLanguage}
                disabled={!newLanguage}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Games */}
          <Box>
            <Typography variant="h6" gutterBottom>Games</Typography>
            <Box mb={2}>
              <Grid container spacing={1}>
                {formData.games.map((game) => (
                  <Grid item key={game.name} xs={12} sm={6} md={4}>
                    <Chip
                      label={`${game.name} - ${game.rank}`}
                      onDelete={() => removeGame(game.name)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box display="flex" gap={1}>
              <TextField
                label="Game Name"
                value={newGame.name}
                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                size="small"
              />
              <TextField
                label="Rank"
                value={newGame.rank}
                onChange={(e) => setNewGame({ ...newGame, rank: e.target.value })}
                size="small"
              />
              <Button
                variant="outlined"
                onClick={addGame}
                disabled={!newGame.name || !newGame.rank}
              >
                Add
              </Button>
            </Box>
          </Box>

          {/* Preferences */}
          <Box>
            <Typography variant="h6" gutterBottom>Gaming Preferences</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={formData.preferences.roles}
                    onChange={(e) => handleNestedChange('preferences', 'roles', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['Entry Fragger', 'IGL', 'Support', 'Lurker', 'AWPer'].map((role) => (
                      <MenuItem key={role} value={role}>
                        {role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Playstyle</InputLabel>
                  <Select
                    multiple
                    value={formData.preferences.playstyle}
                    onChange={(e) => handleNestedChange('preferences', 'playstyle', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['Aggressive', 'Strategic', 'Defensive', 'Flex'].map((style) => (
                      <MenuItem key={style} value={style}>
                        {style}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Communication</InputLabel>
                  <Select
                    multiple
                    value={formData.preferences.communication}
                    onChange={(e) => handleNestedChange('preferences', 'communication', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {['Voice Chat', 'Discord', 'Text Chat', 'Hand Signals 👋'].map((comm) => (
                      <MenuItem key={comm} value={comm}>
                        {comm}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Availability */}
          <Box>
            <Typography variant="h6" gutterBottom>Availability</Typography>
            <Grid container spacing={2}>
              {formData.availability.schedule.map((slot, index) => (
                <Grid item xs={12} sm={6} key={slot.day}>
                  <Stack spacing={1}>
                    <TextField
                      label="Day"
                      value={slot.day}
                      onChange={(e) => {
                        const newSchedule = [...formData.availability.schedule];
                        newSchedule[index] = { ...slot, day: e.target.value };
                        handleNestedChange('availability', 'schedule', newSchedule);
                      }}
                      fullWidth
                    />
                    <TextField
                      label="Time"
                      value={slot.time}
                      onChange={(e) => {
                        const newSchedule = [...formData.availability.schedule];
                        newSchedule[index] = { ...slot, time: e.target.value };
                        handleNestedChange('availability', 'schedule', newSchedule);
                      }}
                      fullWidth
                    />
                  </Stack>
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  label="Timezone"
                  value={formData.availability.timezone}
                  onChange={(e) => handleNestedChange('availability', 'timezone', e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
