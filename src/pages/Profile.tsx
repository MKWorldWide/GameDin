import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { IUser, IUserProfile } from '../types/social';
import { Box, Avatar, Typography, Button, Grid, Paper } from '@mui/material';
import EditProfileDialog from '../components/profile/EditProfileDialog';

interface ProfileProps {
  // Add any props if needed
}

export default function Profile({}: ProfileProps) {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [profile, setProfile] = useState<IUserProfile | null>(null);

  const handleEditProfile = () => {
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Please sign in to view your profile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={user.attributes?.picture || '/default-avatar.png'}
                alt={user.username}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user.attributes?.name || user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {user.attributes?.email}
              </Typography>
              <Button variant="contained" color="primary" onClick={handleEditProfile}>
                Edit Profile
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            {/* Add profile content here */}
          </Grid>
        </Grid>
      </Paper>

      <EditProfileDialog
        open={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        user={user}
        onSave={(updatedProfile) => {
          setProfile(updatedProfile);
          handleCloseEditDialog();
        }}
      />
    </Box>
  );
}
