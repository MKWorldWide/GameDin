import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';
import { IUser } from '../../types/social';

interface ProfileHeaderProps {
  user: IUser;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        src={user.avatar}
        alt={user.username}
        sx={{ width: 120, height: 120 }}
      />
      <Box>
        <Typography variant="h4">{user.username}</Typography>
        <Typography variant="body1" color="text.secondary">
          {user.bio}
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileHeader; 