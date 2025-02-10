import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Box,
  Typography,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Tooltip,
  useTheme,
  ListItem,
  ListItemAvatar,
  Avatar,
  Badge,
} from '@mui/material';
import {
  CheckCircle as ReadIcon,
  Delete as DeleteIcon,
  Favorite as LikeIcon,
  Comment as CommentIcon,
  PersonAdd as FollowIcon,
  AlternateEmail as MentionIcon,
  EmojiEvents as TournamentIcon,
  Group as TeamIcon,
  Star as AchievementIcon,
  Info as SystemIcon,
  FilterList as FilterIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Message as MessageIcon,
  SportsEsports as SportsEsportsIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { INotification, NotificationType, NotificationFilter } from '../../types/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationsMenuProps {
  notifications: INotification[];
  anchorEl: null | HTMLElement;
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'FRIEND_REQUEST':
      return <PersonIcon />;
    case 'MESSAGE':
      return <MessageIcon />;
    case 'GAME_INVITE':
      return <SportsEsportsIcon />;
    case 'SYSTEM':
      return <SystemIcon />;
    default:
      return <NotificationsIcon />;
  }
};

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  anchorEl,
  open,
  onClose,
  onMarkAsRead,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setFilter(newValue === 0 ? 'all' : 'unread');
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const handleNotificationClick = (notification: INotification) => {
    onMarkAsRead(notification.id);
    
    switch (notification.type) {
      case 'FRIEND_REQUEST':
        if (notification.metadata?.userId) {
          navigate(`/profile/${notification.metadata.userId}`);
        }
        break;
      case 'MESSAGE':
        if (notification.metadata?.conversationId) {
          navigate(`/messages/${notification.metadata.conversationId}`);
        }
        break;
      case 'GAME_INVITE':
        if (notification.metadata?.gameId) {
          navigate(`/games/${notification.metadata.gameId}`);
        }
        break;
      case 'SYSTEM':
        // Handle system notifications
        break;
    }
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxHeight: 400,
          width: '100%',
          maxWidth: 360,
        },
      }}
    >
      {notifications.length === 0 ? (
        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            No new notifications
          </Typography>
        </MenuItem>
      ) : (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            sx={{ 
              whiteSpace: 'normal',
              py: 1,
              px: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: notification.read ? 'transparent' : 'action.hover',
            }}
          >
            <ListItem disablePadding>
              <ListItemAvatar>
                <Avatar>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={notification.content}
                secondary={
                  <React.Fragment>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          </MenuItem>
        ))
      )}
    </Menu>
  );
};

export default NotificationsMenu;
