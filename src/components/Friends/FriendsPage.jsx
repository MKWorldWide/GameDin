import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  Badge,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  PersonAdd as AddIcon,
  Chat as ChatIcon,
  SportsEsports as GameIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';

const FriendsPage = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const {
    friends,
    requests,
    suggestions,
    acceptFriendRequest,
    rejectFriendRequest,
    addFriend,
  } = useStore();

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleAcceptRequest = (requestId) => {
    acceptFriendRequest(requestId);
  };

  const handleRejectRequest = (requestId) => {
    rejectFriendRequest(requestId);
  };

  const handleAddFriend = (suggestion) => {
    addFriend(suggestion);
  };

  const handleMessage = (friendId) => {
    navigate(`/messages/${friendId}`);
  };

  const handleInviteToGame = (friendId) => {
    // TODO: Implement game invitation
    console.log('Invite to game:', friendId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'in-game':
        return 'warning';
      default:
        return 'default';
    }
  };

  const renderFriendsList = () => (
    <List>
      {friends.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="No friends yet"
            secondary="Add friends to see them here"
          />
        </ListItem>
      ) : (
        friends.map((friend) => (
          <ListItem
            key={friend.id}
            secondaryAction={
              <Box>
                <IconButton onClick={() => handleMessage(friend.id)}>
                  <ChatIcon />
                </IconButton>
                <IconButton onClick={() => handleInviteToGame(friend.id)}>
                  <GameIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                color={getStatusColor(friend.status)}
              >
                <Avatar src={friend.avatar} alt={friend.username} />
              </Badge>
            </ListItemAvatar>
            <ListItemText
              primary={friend.username}
              secondary={friend.status || 'Offline'}
            />
          </ListItem>
        ))
      )}
    </List>
  );

  const renderRequests = () => (
    <List>
      {requests.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="No pending requests"
            secondary="Friend requests will appear here"
          />
        </ListItem>
      ) : (
        requests.map((request) => (
          <ListItem
            key={request.id}
            secondaryAction={
              <Box>
                <IconButton
                  color="success"
                  onClick={() => handleAcceptRequest(request.id)}
                >
                  <CheckIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleRejectRequest(request.id)}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar src={request.avatar} alt={request.username} />
            </ListItemAvatar>
            <ListItemText
              primary={request.username}
              secondary="Sent you a friend request"
            />
          </ListItem>
        ))
      )}
    </List>
  );

  const renderSuggestions = () => (
    <List>
      {suggestions.length === 0 ? (
        <ListItem>
          <ListItemText
            primary="No suggestions available"
            secondary="Check back later for friend suggestions"
          />
        </ListItem>
      ) : (
        suggestions.map((suggestion) => (
          <ListItem
            key={suggestion.id}
            secondaryAction={
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleAddFriend(suggestion)}
              >
                Add Friend
              </Button>
            }
          >
            <ListItemAvatar>
              <Avatar src={suggestion.avatar} alt={suggestion.username} />
            </ListItemAvatar>
            <ListItemText
              primary={suggestion.username}
              secondary={suggestion.mutualFriends + ' mutual friends'}
            />
          </ListItem>
        ))
      )}
    </List>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Friends
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedTab} onChange={handleTabChange}>
            <Tab label={`Friends (${friends.length})`} />
            <Tab
              label={`Requests (${requests.length})`}
              sx={{
                '& .MuiBadge-badge': {
                  backgroundColor: 'error.main',
                  color: 'error.contrastText',
                },
              }}
            />
            <Tab label={`Suggestions (${suggestions.length})`} />
          </Tabs>
        </Box>

        {selectedTab === 0 && renderFriendsList()}
        {selectedTab === 1 && renderRequests()}
        {selectedTab === 2 && renderSuggestions()}
      </Box>
    </Container>
  );
};

export default FriendsPage; 