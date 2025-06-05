import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
} from '@mui/material';
import { IUser, IUserProfile } from '../../types/social';

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  user: IUser;
  onSave: (profile: IUserProfile) => void;
}

export default function EditProfileDialog({
  open,
  onClose,
  user,
  onSave,
}: EditProfileDialogProps) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [picture, setPicture] = useState(user.picture || user.avatar || '');

  const handleSubmit = () => {
    const updatedProfile: IUserProfile = {
      id: user.id,
      user: {
        ...user,
        name,
        bio,
        picture,
      },
      posts: [],
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(updatedProfile);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            my: 2,
          }}
        >
          <Avatar
            src={picture || '/default-avatar.png'}
            alt={user.username}
            sx={{ width: 100, height: 100 }}
          />
          <TextField
            fullWidth
            label="Profile Picture URL"
            value={picture}
            onChange={(e) => setPicture(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            multiline
            rows={4}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
} 