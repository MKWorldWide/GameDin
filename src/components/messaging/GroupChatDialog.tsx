import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Avatar,
  Box,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
} from '@mui/material';
import {
  Group as GroupIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as AddPersonIcon,
  PersonRemove as RemovePersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { IUser, IConversation, IConversationParticipant, GroupParticipant } from '../../types/social';
import useStore from '../../store/useStore';

interface GroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participants: string[]) => void;
  availableUsers: IUser[];
  existingGroup?: IConversation;
  currentUser?: IUser;
}

const GroupChatDialog: React.FC<GroupChatDialogProps> = ({
  open,
  onClose,
  onCreateGroup,
  availableUsers,
  existingGroup,
  currentUser
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName.trim(), selectedUsers);
      handleClose();
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedUsers([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Group Chat</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          Select Participants
        </Typography>
        <List sx={{ width: '100%', maxHeight: 300, overflow: 'auto' }}>
          {availableUsers.map((user) => (
            <ListItem
              key={user.id}
              dense
              button
              onClick={() => handleToggleUser(user.id)}
            >
              <Checkbox
                edge="start"
                checked={selectedUsers.includes(user.id)}
                tabIndex={-1}
                disableRipple
              />
              <ListItemAvatar>
                <Avatar src={user.picture || user.avatar} alt={user.username} />
              </ListItemAvatar>
              <ListItemText primary={user.username} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!groupName.trim() || selectedUsers.length === 0}
          color="primary"
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GroupChatDialog;
