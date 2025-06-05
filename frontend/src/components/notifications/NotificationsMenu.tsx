import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Menu,
} from '@mui/material';
import { INotification } from '../../types/social';

interface NotificationsMenuProps {
  notifications: INotification[];
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onNotificationClick: (notification: INotification) => void;
}

const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
  notifications,
  anchorEl,
  onClose,
  onNotificationClick,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          maxHeight: 400,
        },
      }}
    >
      <List>
        {notifications.map((notification) => (
          <ListItem
            key={notification.id}
            button
            onClick={() => onNotificationClick(notification)}
          >
            <ListItemText
              primary={notification.title}
              secondary={notification.description}
            />
          </ListItem>
        ))}
        {notifications.length === 0 && (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        )}
      </List>
    </Menu>
  );
};

export default NotificationsMenu;
