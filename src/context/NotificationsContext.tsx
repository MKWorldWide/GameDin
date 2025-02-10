import React, { createContext, useContext, useState, useEffect } from 'react';
import { INotification, NotificationsContextType } from '../types/notifications';
import useStore from '../store/useStore';

// Mock data
const mockNotifications: INotification[] = [
  {
    id: '1',
    type: 'FRIEND_REQUEST',
    content: 'John Doe sent you a friend request',
    timestamp: new Date().toISOString(),
    read: false,
    sender: {
      id: '123',
      username: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'
    }
  },
  {
    id: '2',
    type: 'GAME_INVITE',
    content: 'Jane Smith invited you to play Fortnite',
    timestamp: new Date().toISOString(),
    read: false,
    sender: {
      id: '456',
      username: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane'
    },
    metadata: {
      gameId: '789',
      gameName: 'Fortnite'
    }
  }
];

const NotificationsContext = createContext<NotificationsContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  clearAllNotifications: async () => {},
});

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useStore(state => state.user);

  useEffect(() => {
    if (!user) return;

    // Simulate API call with mock data
    setLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
      setLoading(false);
    }, 1000);
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => prev - 1);
  };

  const clearAllNotifications = async () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationsContext);

export default NotificationsContext;
