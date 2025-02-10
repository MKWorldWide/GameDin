import { IUser } from './social';

export interface ISettings {
  profileVisibility: 'public' | 'private';
  showOnlineStatus: boolean;
  showGameActivity: boolean;
  emailNotifications: {
    frequency: 'none' | 'real-time' | 'daily-digest' | 'weekly-digest';
    friendRequests: boolean;
    messages: boolean;
    gameInvites: boolean;
    achievements: boolean;
    newsAndUpdates: boolean;
    security: boolean;
    teamInvites: boolean;
    matchmaking: boolean;
    marketing: boolean;
  };
  emailDigestTime: string;
  theme: {
    mode: 'light' | 'dark';
    color: string;
  };
  pushNotifications: boolean;
  matchmakingEnabled: boolean;
  allowFriendRequests: boolean;
  allowMessages: boolean;
  darkMode: boolean;
  themeColor: string;
}

export interface StoreState {
  user: IUser | null;
  isAuthenticated: boolean;
  settings: ISettings;
  loading: boolean;
  error: string | null;
}

export interface StoreActions {
  setUser: (user: IUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateSettings: (settings: Partial<ISettings>) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

export type Store = StoreState & StoreActions; 