<<<<<<< HEAD
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
=======
import { IFriend } from '../../types/social';

interface FriendsListProps {
  friends: IFriend[];
  onAcceptFriend?: (friendId: string) => void;
  onRejectFriend?: (friendId: string) => void;
  onBlockFriend?: (friendId: string) => void;
  onUnblockFriend?: (friendId: string) => void;
}

export const FriendsList = ({
  friends,
  onAcceptFriend,
  onRejectFriend,
  onBlockFriend,
  onUnblockFriend
}: FriendsListProps) => {
  const pendingFriends = friends.filter(friend => friend.friendshipStatus === 'pending');
  const acceptedFriends = friends.filter(friend => friend.friendshipStatus === 'accepted');
  const blockedFriends = friends.filter(friend => friend.friendshipStatus === 'blocked');

  return (
    <div className="friends-list">
      {pendingFriends.length > 0 && (
        <section className="friends-section">
          <h3>Pending Friend Requests</h3>
          {pendingFriends.map(friend => (
            <div key={friend.id} className="friend-item pending">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                  <span className="friend-status">{friend.status}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onAcceptFriend && (
                  <button onClick={() => onAcceptFriend(friend.id)}>Accept</button>
                )}
                {onRejectFriend && (
                  <button onClick={() => onRejectFriend(friend.id)}>Reject</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {acceptedFriends.length > 0 && (
        <section className="friends-section">
          <h3>Friends</h3>
          {acceptedFriends.map(friend => (
            <div key={friend.id} className="friend-item">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                  <span className="friend-status">{friend.status}</span>
                  <span className="friend-since">Friends since {new Date(friend.friendSince).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onBlockFriend && (
                  <button onClick={() => onBlockFriend(friend.id)}>Block</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {blockedFriends.length > 0 && (
        <section className="friends-section">
          <h3>Blocked Users</h3>
          {blockedFriends.map(friend => (
            <div key={friend.id} className="friend-item blocked">
              <div className="friend-info">
                <img
                  src={friend.picture || friend.avatar}
                  alt={friend.username}
                  className="friend-avatar"
                />
                <div className="friend-details">
                  <span className="friend-name">{friend.name || friend.username}</span>
                </div>
              </div>
              <div className="friend-actions">
                {onUnblockFriend && (
                  <button onClick={() => onUnblockFriend(friend.id)}>Unblock</button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
