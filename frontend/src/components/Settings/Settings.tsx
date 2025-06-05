import * as React from 'react';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Switch,
  TextField,
  Button,
  FormControlLabel,
  Grid,
  Avatar,
  Chip,
  FormGroup,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Language as LanguageIcon,
  Games as GamesIcon,
  Visibility as PrivacyIcon,
  NotificationsActive as NotificationsActiveIcon,
  Block as BlockIcon,
  Public as PublicIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Message as MessageIcon,
  Group as GroupIcon,
  EmojiEvents as EventsIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import store from '../../store/useStore';
import { Store, ISettings } from '../../types/store';
import { useAuth } from '../../context/AuthContext';

interface SettingsItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
}

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactElement;
  description: string;
}

const settingsSections: SettingSection[] = [
  {
    id: 'account',
    title: 'Account Settings',
    icon: <AccountIcon />,
    description: 'Manage your account information and preferences',
  },
  {
    id: 'privacy',
    title: 'Privacy',
    icon: <PrivacyIcon />,
    description: 'Control who can see your profile and activity',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: <NotificationsIcon />,
    description: 'Customize your notification preferences',
  },
  {
    id: 'gaming',
    title: 'Gaming Preferences',
    icon: <GamesIcon />,
    description: 'Set your gaming preferences and matchmaking settings',
  },
  {
    id: 'appearance',
    title: 'Appearance',
    icon: <ThemeIcon />,
    description: 'Customize how GameDin looks',
  },
  {
    id: 'blocking',
    title: 'Blocking',
    icon: <BlockIcon />,
    description: 'Manage blocked users and content',
  },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = React.useState('account');
  const {
    settings,
    updateSettings,
    isAuthenticated,
    loading,
    error,
    setUser,
    setIsAuthenticated,
    setLoading,
    setError,
    login,
    logout,
    darkMode,
    toggleDarkMode,
  } = store<Store>(state => ({
    user: state.user,
    settings: state.settings,
    updateSettings: state.updateSettings,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    setUser: state.setUser,
    setIsAuthenticated: state.setIsAuthenticated,
    setLoading: state.setLoading,
    setError: state.setError,
    login: state.login,
    logout: state.logout,
    darkMode: state.darkMode,
    toggleDarkMode: state.toggleDarkMode
  }));

  const handleSettingChange = (setting: keyof ISettings, value: any) => {
    updateSettings({ [setting]: value });
  };

  const handleNotificationChange = (key: keyof ISettings['notifications']['emailNotifications']['types'], value: any) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        emailNotifications: {
          ...settings.notifications.emailNotifications,
          types: {
            ...settings.notifications.emailNotifications.types,
            [key]: value,
          }
        }
      }
    });
  };

  const handleFrequencyChange = (value: 'daily' | 'weekly' | 'real-time' | 'none') => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        emailNotifications: {
          ...settings.notifications.emailNotifications,
          frequency: value
        }
      }
    });
  };

  const renderAccountSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Profile Information</Typography>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          src={user?.avatar}
          alt={user?.username}
          sx={{ width: 80, height: 80 }}
        />
        <Button startIcon={<EditIcon />} variant="outlined">
          Change Avatar
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            defaultValue={user?.username}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            defaultValue={user?.email}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            defaultValue={user?.bio}
            margin="normal"
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderPrivacySettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Privacy Settings</Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Profile Visibility"
            secondary="Control who can see your profile"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.profileVisibility === 'public'}
                onChange={(e) => handleSettingChange('profileVisibility', e.target.checked ? 'public' : 'private')}
              />
            }
            label={settings.profileVisibility === 'public' ? 'Public' : 'Private'}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Online Status"
            secondary="Show when you're online"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.privacy.showOnlineStatus}
                onChange={(e) => handleSettingChange('privacy', {
                  ...settings.privacy,
                  showOnlineStatus: e.target.checked
                })}
              />
            }
            label=""
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Game Activity"
            secondary="Share your gaming activity with friends"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.privacy.showGameStats}
                onChange={(e) => handleSettingChange('privacy', {
                  ...settings.privacy,
                  showGameStats: e.target.checked
                })}
              />
            }
            label=""
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderNotificationSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
      
      {/* Email Notification Frequency */}
      <FormControl component="fieldset" sx={{ mb: 4, width: '100%' }}>
        <FormLabel component="legend" sx={{ mb: 2 }}>Email Digest Frequency</FormLabel>
        <RadioGroup
          value={settings.notifications.emailNotifications.frequency}
          onChange={(e) => handleFrequencyChange(e.target.value as 'daily' | 'weekly' | 'real-time' | 'none')}
        >
          <FormControlLabel 
            value="none" 
            control={<Radio />} 
            label="No email notifications (recommended)"
          />
          <FormControlLabel 
            value="real-time" 
            control={<Radio />} 
            label="Real-time updates (high volume)"
          />
          <FormControlLabel 
            value="daily-digest" 
            control={<Radio />} 
            label="Daily digest"
          />
          <FormControlLabel 
            value="weekly-digest" 
            control={<Radio />} 
            label="Weekly digest"
          />
        </RadioGroup>
      </FormControl>

      {settings.notifications.emailNotifications.frequency !== 'none' && (
        <>
          {/* Digest Time Selection */}
          {settings.notifications.emailNotifications.frequency !== 'real-time' && (
            <FormControl fullWidth sx={{ mb: 4 }}>
              <FormLabel>Digest Delivery Time</FormLabel>
              <TextField
                type="time"
                value={settings.emailDigestTime}
                onChange={(e) => handleSettingChange('emailDigestTime', e.target.value)}
                sx={{ mt: 1 }}
              />
            </FormControl>
          )}

          {/* Email Notification Categories */}
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Email Notification Categories
          </Typography>
          <FormGroup>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <SecurityIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Security Alerts" 
                  secondary="Login attempts, password changes, etc."
                />
                <Switch
                  checked={false}
                  onChange={(e) => {/* Security notifications not in current types */}}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  These are important security-related notifications that help protect your account. 
                  We recommend keeping these enabled.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <MessageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Direct Messages" 
                  secondary="Notifications about new messages"
                />
                <Switch
                  checked={settings.notifications.emailNotifications.types.messages}
                  onChange={(e) => handleNotificationChange('messages', e.target.checked)}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  Receive email notifications when you get new direct messages. 
                  If disabled, you'll still see messages in the app.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <GroupIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Social" 
                  secondary="Friend requests and team invites"
                />
                <Switch
                  checked={settings.notifications.emailNotifications.types.friendRequests}
                  onChange={(e) => handleNotificationChange('friendRequests', e.target.checked)}
                />
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications.types.friendRequests}
                        onChange={(e) => handleNotificationChange('friendRequests', e.target.checked)}
                      />
                    }
                    label="Friend Requests"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false}
                        onChange={(e) => {/* Team invites notifications not in current types */}}
                      />
                    }
                    label="Team Invites"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <GamesIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Gaming" 
                  secondary="Game invites and matchmaking"
                />
                <Switch
                  checked={settings.notifications.emailNotifications.types.gameInvites}
                  onChange={(e) => handleNotificationChange('gameInvites', e.target.checked)}
                />
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.notifications.emailNotifications.types.gameInvites}
                        onChange={(e) => handleNotificationChange('gameInvites', e.target.checked)}
                      />
                    }
                    label="Game Invites"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={false}
                        onChange={(e) => {/* Matchmaking notifications not in current types */}}
                      />
                    }
                    label="Matchmaking Updates"
                  />
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <EventsIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Achievements" 
                  secondary="Progress and unlocks"
                />
                <Switch
                  checked={settings.notifications.emailNotifications.types.achievements}
                  onChange={(e) => handleNotificationChange('achievements', e.target.checked)}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  Get notified when you unlock new achievements or make significant progress.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <ListItemIcon>
                  <CampaignIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Marketing" 
                  secondary="News, updates, and promotions"
                />
                <Switch
                  checked={false}
                  onChange={(e) => {/* Marketing notifications not in current types */}}
                />
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">
                  Receive updates about new features, gaming events, and special offers.
                  You can unsubscribe from these at any time.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </FormGroup>
        </>
      )}

      <Divider sx={{ my: 4 }} />

      {/* Push Notifications */}
      <Typography variant="subtitle1" gutterBottom>
        Push Notifications
      </Typography>
      <ListItem>
        <ListItemIcon>
          <NotificationsActiveIcon />
        </ListItemIcon>
        <ListItemText
          primary="Browser Notifications"
          secondary="Receive notifications while browsing"
        />
        <Switch
          checked={settings.notifications.push}
          onChange={(e) => handleSettingChange('notifications', {
            ...settings.notifications,
            push: e.target.checked
          })}
        />
      </ListItem>
    </Box>
  );

  const renderGamingSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Gaming Preferences</Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Matchmaking"
            secondary="Allow automatic matchmaking with other players"
          />
          <Switch
            checked={settings.privacy.showGameStats}
            onChange={(e) => handleSettingChange('privacy', {
              ...settings.privacy,
              showGameStats: e.target.checked
            })}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Friend Requests"
            secondary="Allow other players to send you friend requests"
          />
          <Switch
            checked={settings.privacy.allowFriendRequests}
            onChange={(e) => handleSettingChange('privacy', {
              ...settings.privacy,
              allowFriendRequests: e.target.checked
            })}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Direct Messages"
            secondary="Allow messages from other players"
          />
          <Switch
            checked={settings.privacy.showLastSeen}
            onChange={(e) => handleSettingChange('privacy', {
              ...settings.privacy,
              showLastSeen: e.target.checked
            })}
          />
        </ListItem>
      </List>
    </Box>
  );

  const renderAppearanceSettings = () => {
    const themeColors = [
      { name: 'Blue', value: '#085f80' },
      { name: 'Purple', value: '#6B46C1' },
      { name: 'Green', value: '#2F855A' },
      { name: 'Red', value: '#C53030' },
      { name: 'Orange', value: '#C05621' },
      { name: 'Pink', value: '#B83280' },
      { name: 'Teal', value: '#2C7A7B' },
    ];

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Theme Color
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
          {themeColors.map((color) => (
            <Box
              key={color.value}
              onClick={() => handleSettingChange('themeColor', color.value)}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: color.value,
                cursor: 'pointer',
                border: settings.themeColor === color.value ? '2px solid white' : 'none',
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                },
                position: 'relative',
              }}
              title={color.name}
            />
          ))}
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={settings.theme.darkMode}
              onChange={(e) => handleSettingChange('theme', {
                ...settings.theme,
                darkMode: e.target.checked
              })}
            />
          }
          label="Dark Mode"
        />
      </Box>
    );
  };

  const renderContent = () => {
    switch (selectedSection) {
      case 'account':
        return renderAccountSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'gaming':
        return renderGamingSettings();
      case 'appearance':
        return renderAppearanceSettings();
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Navigation */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ bgcolor: 'background.paper' }}>
            <List component="nav">
              {settingsSections.map((section) => (
                <ListItemButton
                  key={section.id}
                  selected={selectedSection === section.id}
                  onClick={() => setSelectedSection(section.id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.dark',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: selectedSection === section.id ? 'primary.light' : 'inherit' }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    secondary={section.description}
                    primaryTypographyProps={{
                      variant: 'body1',
                      fontWeight: selectedSection === section.id ? 600 : 400,
                    }}
                    secondaryTypographyProps={{
                      variant: 'body2',
                      sx: { display: { xs: 'none', sm: 'block' } },
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
            {renderContent()}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings; 