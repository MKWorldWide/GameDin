import { create } from 'zustand';
import { Store, ISettings } from '../types/store';
import { IUser } from '../types/social';
import { persist } from 'zustand/middleware';

const initialSettings: ISettings = {
  profileVisibility: 'public',
  showOnlineStatus: true,
  showGameActivity: true,
  emailNotifications: {
    frequency: 'none',
    friendRequests: true,
    messages: true,
    gameInvites: true,
    achievements: true,
    newsAndUpdates: false,
    security: true,
    teamInvites: true,
    matchmaking: true,
    marketing: true
  },
  emailDigestTime: '09:00',
  theme: {
    mode: 'dark',
    color: '#7289da'
  },
  pushNotifications: false,
  matchmakingEnabled: false,
  allowFriendRequests: true,
  allowMessages: true,
  darkMode: true,
  themeColor: '#7289da'
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      settings: initialSettings,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      updateSettings: (newSettings) => 
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        })),

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const mockUser: IUser = {
            id: '1',
            username: 'TestUser',
            email: credentials.email,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
            presence: 'online' as const,
            rank: 'Beginner',
            level: 1
          };
          set({ user: mockUser, isAuthenticated: true, loading: false });
        } catch (error) {
          set({ error: 'Login failed', loading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'app-store',
      version: 1,
    }
  )
);

export default useStore; 