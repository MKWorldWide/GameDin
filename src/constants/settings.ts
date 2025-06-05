import { ISettings } from '../types/store';

export const defaultSettings: ISettings = {
  profileVisibility: 'public',
  notifications: {
    push: true,
    email: true,
    emailNotifications: {
<<<<<<< HEAD
      frequency: 'none',
=======
      frequency: 'daily',
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
      types: {
        friendRequests: true,
        messages: true,
        gameInvites: true,
        achievements: true
      }
    }
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    showGameStats: true
  },
  theme: {
    darkMode: false,
    fontSize: 'medium',
    colorScheme: 'default'
  },
  language: 'en',
<<<<<<< HEAD
  soundEffects: true
};
=======
  soundEffects: true,
  showGameActivity: true,
  matchmakingEnabled: true,
  allowMessages: true,
  themeColor: '#7289da'
}; 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
