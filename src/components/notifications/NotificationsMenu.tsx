<<<<<<< HEAD
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
=======
import { useState } from 'react';
import type { INotification } from '../../types/social';

interface NotificationsMenuProps {
  notifications: INotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  open: boolean;
  anchorEl: HTMLElement | null;
}

export default function NotificationsMenu({
  notifications,
  onClose,
  onMarkAsRead,
  open,
  anchorEl,
}: NotificationsMenuProps) {
  if (!open) return null;

  const handleKeyDown = (event: React.KeyboardEvent, notificationId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onMarkAsRead(notificationId);
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
      style={{
        top: anchorEl?.getBoundingClientRect().bottom ?? 0,
        right: window.innerWidth - (anchorEl?.getBoundingClientRect().right ?? 0),
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="notifications-menu"
    >
      <div className="py-1" role="none">
        {notifications.length === 0 ? (
          <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400" role="menuitem">
            No new notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700" role="none">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-blue-50 dark:bg-blue-900' : ''
                }`}
                onClick={() => onMarkAsRead(notification.id)}
                onKeyDown={(e) => handleKeyDown(e, notification.id)}
                role="menuitem"
                tabIndex={0}
                aria-label={notification.title}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {notification.type === 'MESSAGE' && (
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    )}
                    {notification.type === 'FRIEND_REQUEST' && (
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                      </svg>
                    )}
                    {notification.type === 'ACHIEVEMENT' && (
                      <svg
                        className="h-6 w-6 text-yellow-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {notification.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
