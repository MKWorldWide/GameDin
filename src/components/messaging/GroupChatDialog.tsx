<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { IUser } from '../../types/social';

interface GroupChatDialogProps {
  users: IUser[];
  onCreateGroup: (groupName: string, participants: string[]) => void;
  onClose: () => void;
}

export const GroupChatDialog = ({
  users,
  onCreateGroup,
  onClose
}: GroupChatDialogProps) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && selectedUsers.length > 0) {
      onCreateGroup(groupName, selectedUsers);
      onClose();
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
        : [...prev, userId]
    );
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="group-chat-dialog">
      <h2>Create Group Chat</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="groupName">Group Name</label>
          <input
            type="text"
            id="groupName"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            required
          />
        </div>

        <div className="form-group">
          <label>Select Participants</label>
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <label className="user-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUser(user.id)}
                  />
                  <div className="user-info">
                    <img
                      src={user.picture || user.avatar}
                      alt={user.username}
                      className="user-avatar"
                    />
                    <span className="user-name">
                      {user.name || user.username}
                    </span>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={!groupName.trim() || selectedUsers.length === 0}
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
}; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
