import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  FormControl, 
  FormControlLabel, 
  FormHelperText, 
  Grid, 
  IconButton, 
  InputAdornment, 
  InputLabel, 
  OutlinedInput, 
  Switch, 
  TextField, 
  Typography 
} from '@mui/material';
import { useMKWWStudio } from '../../contexts/MKWWStudioContext';
import { MKWW_STUDIO_CONFIG } from '../../config';
import { CheckCircle, CloudOff, CloudQueue, Sync } from '@mui/icons-material';

const MKWWStudioIntegration: React.FC = () => {
  const { isConnected, isLoading, error, verifyConnection, syncUsers, syncAnalytics } = useMKWWStudio();
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(MKWW_STUDIO_CONFIG.BASE_URL);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('mkwwStudioSettings');
    if (savedSettings) {
      try {
        const { apiKey, baseUrl, isEnabled } = JSON.parse(savedSettings);
        setApiKey(apiKey || '');
        setBaseUrl(baseUrl || MKWW_STUDIO_CONFIG.BASE_URL);
        setIsEnabled(!!isEnabled);
        
        // If we have an API key and it's enabled, set it in the service
        if (apiKey && isEnabled) {
          mkwwStudioService.setAuthToken(apiKey);
        }
      } catch (err) {
        console.error('Failed to load MKWW Studio settings:', err);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = { apiKey, baseUrl, isEnabled };
    localStorage.setItem('mkwwStudioSettings', JSON.stringify(settings));
    
    // Update the service with the new API key if enabled
    if (isEnabled && apiKey) {
      mkwwStudioService.setAuthToken(apiKey);
    } else {
      mkwwStudioService.setAuthToken('');
    }
  };

  // Test the connection to MKWW Studio
  const testConnection = async () => {
    setIsTesting(true);
    try {
      await verifyConnection();
    } finally {
      setIsTesting(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings();
  };

  // Handle sync button click
  const handleSyncClick = async () => {
    try {
      // TODO: Replace with actual data to sync
      const mockUsers = [];
      const mockAnalytics = {};
      
      if (mockUsers.length > 0) {
        await syncUsers(mockUsers);
      }
      
      await syncAnalytics(mockAnalytics);
      setLastSync(new Date());
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader 
        title="MKWW Studio Integration" 
        subheader="Connect your GameDin portal with MKWW Studio"
        action={
          <Box display="flex" alignItems="center">
            {isConnected ? (
              <Box display="flex" alignItems="center" color="success.main">
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="body2">Connected</Typography>
              </Box>
            ) : (
              <Box display="flex" alignItems="center" color="text.secondary">
                <CloudOff sx={{ mr: 1 }} />
                <Typography variant="body2">Disconnected</Typography>
              </Box>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  variant="outlined"
                  type={isEnabled ? 'password' : 'text'}
                  disabled={isLoading || isTesting}
                  InputProps={{
                    endAdornment: isEnabled && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setIsEnabled(!isEnabled)}
                          edge="end"
                        >
                          {isEnabled ? <CloudQueue /> : <CloudOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <FormHelperText>
                  Your MKWW Studio API key. Keep this secure.
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Base URL"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  variant="outlined"
                  disabled={isLoading || isTesting}
                />
                <FormHelperText>
                  The base URL for the MKWW Studio API
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    color="primary"
                    disabled={isLoading || isTesting}
                  />
                }
                label={
                  <Box>
                    <Typography>Enable MKWW Studio Integration</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {isEnabled 
                        ? 'Integration is active and syncing data.' 
                        : 'Integration is currently disabled.'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Box color="error.main" mt={1}>
                  <Typography variant="body2">{error.message}</Typography>
                </Box>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isLoading || isTesting}
                    sx={{ mr: 2 }}
                  >
                    Save Settings
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={testConnection}
                    disabled={isLoading || isTesting || !isEnabled || !apiKey}
                    sx={{ mr: 2 }}
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                </Box>
                
                <Box display="flex" alignItems="center">
                  {lastSync && (
                    <Typography variant="caption" color="textSecondary" sx={{ mr: 2 }}>
                      Last synced: {new Date(lastSync).toLocaleString()}
                    </Typography>
                  )}
                  
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<Sync />}
                    onClick={handleSyncClick}
                    disabled={isLoading || isTesting || !isEnabled || !isConnected}
                  >
                    Sync Now
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default MKWWStudioIntegration;
