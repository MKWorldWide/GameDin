import { IUser } from './social';

export interface ISettings {
  profileVisibility: 'public' | 'friends' | 'private';
  notifications: {
    push: boolean;
    email: boolean;
    emailNotifications: {
      frequency: 'daily' | 'weekly' | 'real-time';
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

  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  toggleDarkMode: () => void;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
}
