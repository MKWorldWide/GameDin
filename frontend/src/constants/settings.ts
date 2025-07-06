import { ISettings } from '../types/store';

export const defaultSettings: ISettings = {
  profileVisibility: 'public',
  notifications: {
    push: true,
    email: true,
    emailNotifications: {
      frequency: 'daily',
      types: {
        friendRequests: true,
        messages: true,
        gameInvites: true,
        achievements: true,
      },
    },
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    showGameStats: true,
  },
  theme: {
    darkMode: false,
    fontSize: 'medium',
    colorScheme: 'default',
  },
  language: 'en',
  soundEffects: true,
  showGameActivity: true,
  matchmakingEnabled: true,
  allowMessages: true,
  themeColor: '#7289da',
};
