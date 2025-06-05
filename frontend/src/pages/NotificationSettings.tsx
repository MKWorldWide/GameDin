import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Switch,
  FormGroup,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Email as EmailIcon,
  PhoneAndroid as PhoneIcon,
  DesktopWindows as DesktopIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { INotificationPreferences, NotificationType } from '../types/notifications';

const defaultPreferences: INotificationPreferences = {
  email: true,
  push: true,
  desktop: true,
  types: {
    FRIEND_REQUEST: true,
    MESSAGE: true,
    GAME_INVITE: true,
    SYSTEM: true
  },
  sounds: true,
  doNotDisturb: {
    enabled: false,
    from: '22:00',
    to: '08:00',
  },
};

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<INotificationPreferences>(defaultPreferences);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleChange = (
    key: keyof INotificationPreferences | keyof INotificationPreferences['types'],
    value: boolean
  ) => {
    if (key in preferences.types) {
      setPreferences(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [key]: value,
        },
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleTimeChange = (type: 'from' | 'to', value: Date | null) => {
    if (value) {
      const timeString = value.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });
      setPreferences(prev => ({
        ...prev,
        doNotDisturb: {
          ...prev.doNotDisturb,
          [type]: timeString,
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save preferences
      setSnackbar({
        open: true,
        message: 'Notification preferences saved successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save notification preferences',
        severity: 'error',
      });
    }
  };

  const handleReset = () => {
    setPreferences(defaultPreferences);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Notification Settings
          </Typography>
          <Typography color="text.secondary">
            Customize how and when you want to receive notifications
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Channels
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.email}
                  onChange={e => handleChange('email', e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon />
                  <span>Email Notifications</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.push}
                  onChange={e => handleChange('push', e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon />
                  <span>Push Notifications</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.desktop}
                  onChange={e => handleChange('desktop', e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DesktopIcon />
                  <span>Desktop Notifications</span>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.sounds}
                  onChange={e => handleChange('sounds', e.target.checked)}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {preferences.sounds ? <VolumeUpIcon /> : <VolumeOffIcon />}
                  <span>Notification Sounds</span>
                </Box>
              }
            />
          </FormGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Notification Types
          </Typography>
          <FormGroup>
            {Object.entries(preferences.types).map(([type, enabled]) => (
              <FormControlLabel
                key={type}
                control={
                  <Switch
                    checked={enabled}
                    onChange={e => handleChange(type as NotificationType, e.target.checked)}
                  />
                }
                label={type.replace('_', ' ').toLowerCase()}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <TimeIcon />
            <Typography variant="h6">Do Not Disturb</Typography>
          </Box>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.doNotDisturb.enabled}
                  onChange={e =>
                    setPreferences(prev => ({
                      ...prev,
                      doNotDisturb: {
                        ...prev.doNotDisturb,
                        enabled: e.target.checked,
                      },
                    }))
                  }
                />
              }
              label="Enable Do Not Disturb"
            />
            {preferences.doNotDisturb.enabled && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <TimePicker
                  label="From"
                  value={new Date(`2000-01-01T${preferences.doNotDisturb.from}`)}
                  onChange={newValue => handleTimeChange('from', newValue)}
                />
                <TimePicker
                  label="To"
                  value={new Date(`2000-01-01T${preferences.doNotDisturb.to}`)}
                  onChange={newValue => handleTimeChange('to', newValue)}
                />
              </Box>
            )}
          </FormGroup>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={handleReset}>
            Reset to Default
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
};

export default NotificationSettings;
