import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store, ISettings } from '../types/store';
import { defaultSettings } from '../constants/settings';
import type { IUser } from '../types/social';

const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      settings: defaultSettings,
      darkMode: false,
      isAuthenticated: false,
      loading: false,
      error: null,

      setUser: (user: IUser | null) => set({ user }),
      updateSettings: (settings: Partial<ISettings>) => set((state) => ({ 
        settings: { ...state.settings, ...settings } 
      })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setIsAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      setLoading: (value: boolean) => set({ loading: value }),
      setError: (error: string | null) => set({ error }),

      login: async (credentials: { email: string; password: string }) => {
        set({ loading: true, error: null });
        try {
          // Implementation will be added later with AWS Amplify
          set({ loading: false, isAuthenticated: true });
        } catch (error) {
          set({ loading: false, error: 'Login failed' });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false 
        });
      }
    }),
    {
      name: 'gamedin-storage',
    }
  )
);

export default useStore; 