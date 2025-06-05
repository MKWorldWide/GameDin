import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Chat as ChatIcon,
  PersonAdd as AddFriendIcon,
  SportsEsports as GameIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { IUser } from '../../types/social';

interface IFriend extends IUser {
  isOnline: boolean;
  currentGame?: string;
}

const FriendsList: React.FC = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = React.useState<IFriend[]>([]);

  React.useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends');
        const data = await response.json();
        setFriends(data.friends);
      } catch (error) {
        console.error('Failed to fetch friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const handleMessage = (friendId: string) => {
    navigate(`/messages/${friendId}`);
  };

  const handleInviteToGame = (friendId: string) => {
    // TODO: Implement game invitation
    console.log('Invite to game:', friendId);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Friends
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {friends.filter(f => f.isOnline).length} online
          </Typography>
          <Tooltip title="Add Friend">
            <IconButton size="small">
              <AddFriendIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {friends.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No friends yet"
              secondary="Add friends to see them here"
              secondaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          friends.map(friend => (
            <ListItem
              key={friend.id}
              secondaryAction={
                <Box>
                  <Tooltip title="Send Message">
                    <IconButton edge="end" onClick={() => handleMessage(friend.id)}>
                      <ChatIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Invite to Game">
                    <IconButton edge="end" onClick={() => handleInviteToGame(friend.id)}>
                      <GameIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  color={friend.isOnline ? 'success' : 'default'}
                >
                  <Avatar src={friend.avatar} alt={friend.username} />
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={friend.username}
                secondary={friend.currentGame || (friend.isOnline ? 'Online' : 'Offline')}
                secondaryTypographyProps={{
                  color: friend.isOnline ? 'success.main' : 'text.secondary',
                }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default FriendsList; 