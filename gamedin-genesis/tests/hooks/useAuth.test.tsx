

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import { ToastProvider } from '../../context/ToastContext';
import React from 'react';
import { Path } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Wrapper component with all necessary providers
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
);

describe('useAuth Hook', () => {

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should start with loading true, then set user to null', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    // After useEffect runs
    act(() => {});
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });
  
  it('should initialize user from localStorage if present', () => {
    const mockUser = { id: '123', name: 'Test User', dream: 'Test Dream', path: 'Sage' };
    localStorage.setItem('gamedin-user', JSON.stringify(mockUser));
    
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('should log in a user and save user and divinaL3 data to localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const soulName = 'Ra';
    const dream = 'To build a new dawn';
    const path: Path = 'Sovereign';

    act(() => {
      result.current.login(soulName, dream, path);
    });

    // Check user object in state
    expect(result.current.user).not.toBeNull();
    expect(result.current.user?.name).toBe(soulName);
    expect(result.current.user?.dream).toBe(dream);
    expect(result.current.user?.path).toBe(path);
    expect(result.current.user?.following).toContain('@oracle_ai');

    // Check user data in localStorage
    const storedUser = JSON.parse(localStorage.getItem('gamedin-user')!);
    expect(storedUser.name).toBe(soulName);
    expect(storedUser.dream).toBe(dream);
    expect(storedUser.path).toBe(path);
    
    // Check divinaL3.json in localStorage
    const divinaL3 = JSON.parse(localStorage.getItem('divinaL3.json')!);
    expect(divinaL3.soulName).toBe(soulName);
    expect(divinaL3.dream).toBe(dream);
    expect(divinaL3.path).toBe(path);
    expect(divinaL3.timestamp).toBeDefined();
  });

  it('should log out a user and clear all related data from localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // First, log in
    act(() => {
      result.current.login('Ra', 'To build a new dawn', 'Sovereign');
    });
    expect(result.current.user).not.toBeNull();

    // Then, log out
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('gamedin-user')).toBeNull();
    expect(localStorage.getItem('divinaL3.json')).toBeNull();
  });
  
  it('should update user details', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.login('Ra', 'To build a new dawn', 'Sovereign');
    });

    const newBio = "The sun also rises.";
    act(() => {
      result.current.updateUser({ bio: newBio });
    });

    expect(result.current.user?.bio).toBe(newBio);
    const storedUser = JSON.parse(localStorage.getItem('gamedin-user')!);
    expect(storedUser.bio).toBe(newBio);
  });

  it('should allow a user to follow another user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
        result.current.login('Ra', 'To build a new dawn', 'Sovereign');
    });

    expect(result.current.user?.following).toEqual(['@oracle_ai']);

    act(() => {
        result.current.toggleFollow('@testuser2');
    });
    
    expect(result.current.user?.following).toContain('@oracle_ai');
    expect(result.current.user?.following).toContain('@testuser2');
    let storedUser = JSON.parse(localStorage.getItem('gamedin-user')!);
    expect(storedUser.following).toContain('@testuser2');
  });

   it('should allow a user to unfollow another user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
        result.current.login('Ra', 'To build a new dawn', 'Sovereign');
    });
    
    // First follow
    act(() => {
        result.current.toggleFollow('@testuser2');
    });
    expect(result.current.user?.following).toContain('@testuser2');

    // Then unfollow
    act(() => {
        result.current.toggleFollow('@testuser2');
    });

    expect(result.current.user?.following).not.toContain('@testuser2');
    expect(result.current.user?.following).toEqual(['@oracle_ai']);
    const storedUser = JSON.parse(localStorage.getItem('gamedin-user')!);
    expect(storedUser.following).not.toContain('@testuser2');
  });

});
