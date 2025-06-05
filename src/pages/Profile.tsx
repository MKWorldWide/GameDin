import { useState } from 'react';
<<<<<<< HEAD
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
=======
import useStore from '../store/useStore';
import type { IUser, IUserProfile } from '../types/social';

export default function Profile() {
  const user = useStore((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<IUserProfile>({
    name: user?.name || '',
    bio: user?.bio || '',
    picture: user?.picture || '/default-avatar.png'
  });

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setProfile({
      name: user?.name || '',
      bio: user?.bio || '',
      picture: user?.picture || '/default-avatar.png'
    });
  };

  const handleSave = async () => {
    // TODO: Implement save functionality
    setIsEditing(false);
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
  };

  if (!user) {
    return (
<<<<<<< HEAD
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Please sign in to view your profile.</Typography>
      </Box>
=======
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
      </div>
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <img
            src={user.picture || '/default-avatar.png'}
            alt={`${user.name || user.username}'s profile`}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                aria-label="Edit name"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name || user.username}
              </h1>
            )}
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {user.email && <div>{user.email}</div>}
              {user.rank && (
                <span className="mr-4">
                  Rank: {user.rank} • Level {user.level}
                </span>
              )}
              <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bio</h2>
          {isEditing ? (
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              aria-label="Edit bio"
            />
          ) : (
            <p className="text-gray-600 dark:text-gray-300">{user.bio || 'No bio yet.'}</p>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500"
                aria-label="Save profile changes"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={handleEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:hover:bg-blue-500"
              aria-label="Edit profile"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
