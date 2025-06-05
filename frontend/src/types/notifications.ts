export type NotificationType = 'FRIEND_REQUEST' | 'MESSAGE' | 'GAME_INVITE' | 'SYSTEM';

export interface INotification {
  id: string;
  type: NotificationType;
  content: string;
  timestamp: string;
  read: boolean;
  sender?: {
    id: string;
    username: string;
    avatar?: string;
  };
  metadata?: {
    gameId?: string;
    gameName?: string;
    messageId?: string;
    conversationId?: string;
    userId?: string;
  };
}

export interface NotificationsContextType {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export interface INotificationState {
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface INotificationActions {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

export interface INotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  types: {
    [K in NotificationType]: boolean;
  };
  sounds: boolean;
  doNotDisturb: {
    enabled: boolean;
    from: string; // HH:mm format
    to: string; // HH:mm format
  };
}

export interface INotificationSound {
  id: string;
  name: string;
  url: string;
}

export type NotificationFilter = 'all' | 'unread' | NotificationType;
