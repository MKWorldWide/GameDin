import { IUser } from './social';

export interface ISettings {
  profileVisibility: 'public' | 'friends' | 'private';
  notifications: {
    push: boolean;
    email: boolean;
    emailNotifications: {
<<<<<<< HEAD
      frequency: 'daily' | 'weekly' | 'real-time' | 'none';
=======
      frequency: 'daily' | 'weekly' | 'real-time';
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
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
<<<<<<< HEAD
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
=======
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface Store {
  user: IUser | null;
  settings: ISettings;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  darkMode: boolean;
  
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
<<<<<<< HEAD
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
=======
  toggleDarkMode: () => void;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
} 
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
