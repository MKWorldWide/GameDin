import { IUser } from './social';

export interface ISettings {
  profileVisibility: 'public' | 'friends' | 'private';
  notifications: {
    push: boolean;
    email: boolean;
    emailNotifications: {
      frequency: 'daily' | 'weekly' | 'real-time' | 'none';
      types: {
        friendRequests: boolean;
        messages: boolean;
        gameInvites: boolean;
        achievements: boolean;
      };
    };
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    allowFriendRequests: boolean;
    showGameStats: boolean;
  };
  theme: {
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorScheme: 'default' | 'dark' | 'light';
  };
  language: string;
  soundEffects: boolean;
  showGameActivity?: boolean;
  pushNotifications?: boolean;
  matchmakingEnabled?: boolean;
  allowMessages?: boolean;
  themeColor?: string;
  emailDigestTime?: string;
}

export interface Store {
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  settings: ISettings;
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export const defaultSettings: ISettings = {
  profileVisibility: 'public',
  notifications: {
    push: true,
    email: true,
    emailNotifications: {
      frequency: 'none',
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
  soundEffects: true
}; 