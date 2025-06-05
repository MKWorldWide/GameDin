import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Badge } from '@mui/material';
import { Notifications as NotificationsIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useNotifications } from '../../context/NotificationsContext';

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, clearAllNotifications } = useNotifications();

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        {notifications.length > 0 && (
          <IconButton onClick={clearAllNotifications} size="small">
            <ClearIcon />
          </IconButton>
        )}
      </Box>

      <List>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        ) : (
          notifications.map(notification => (
            <ListItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              sx={{
                cursor: 'pointer',
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemText
                primary={notification.type}
                secondary={notification.content}
                secondaryTypographyProps={{
                  sx: { color: 'text.secondary' },
                }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationCenter;

