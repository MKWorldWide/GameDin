import { useCallback } from 'react';
import useStore from '../store/useStore';
import api from '../lib/api/axios';

export const useAuth = () => {
  const { setUser, logout: storeLogout } = useStore();

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('gamedin_token', data.token);
        localStorage.setItem('gamedin_refresh_token', data.refreshToken);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
    },
    [setUser]
  );

  const register = useCallback(
    async userData => {
      try {
        const { data } = await api.post('/auth/register', userData);
        localStorage.setItem('gamedin_token', data.token);
        localStorage.setItem('gamedin_refresh_token', data.refreshToken);
        setUser(data.user);
        return data.user;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
    },
    [setUser]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('gamedin_token');
    localStorage.removeItem('gamedin_refresh_token');
    storeLogout();
  }, [storeLogout]);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
      return data;
    } catch (error) {
      logout();
      throw new Error('Authentication check failed');
    }
  }, [setUser, logout]);

  return {
    login,
    register,
    logout,
    checkAuth,
  };
};
