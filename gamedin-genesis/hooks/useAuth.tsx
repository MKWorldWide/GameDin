

import * as React from 'react';
import { useState, useEffect, useContext, useCallback } from 'react';
import { User, UserSettings, Path, NetworkProvider, UserRole, LinkedAccount } from '../types';
import { createLilithIdentity, verifySoulSignature } from '../services/lilithOS';
import { logOnboardingEvent } from '../services/novaSanctum';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MOCK_AVATARS, MOCK_HEADERS } from '../constants';
import * as nexus from '../services/nexus';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider and ToastProvider');
  }
  return context;
};

const defaultSettings: UserSettings = {
  theme: 'dark',
  accentColor: 'sky',
  renderTier: 'auto',
  profileFrame: 'none',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('gamedin-user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure new properties exist for older stored users
        if (!parsedUser.isCreator) parsedUser.isCreator = false;
        if (!parsedUser.creatorProfile) parsedUser.creatorProfile = { xp: { innovation: 0, integration: 0, expression: 0, engineering: 0 }, tier: 'Dream Seedling' };
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('gamedin-user');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = async (soulName: string, dream: string, path: Path, role: UserRole = 'Player', verificationMethod?: 'email' | 'social' | 'signature') => {
    // Create LilithOS identity for new users
    const lilithIdentity = await createLilithIdentity(soulName, dream);
    
    // Determine role if not provided (backward compatibility)
    const userRole: UserRole = role;
    
    // Log onboarding completion event
    await logOnboardingEvent({
      userId: `user_${Date.now()}`,
      eventType: 'onboarding_complete',
      metadata: {
        soulName,
        path,
        role: userRole,
        verificationMethod,
        timestamp: new Date().toISOString()
      }
    });

    const newUser: User = { 
      id: `user_${Date.now()}`,
      name: soulName,
      dream,
      path,
      role: userRole,
      lilithIdentity,
      onboardingComplete: true,
      avatarUrl: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
      headerUrl: MOCK_HEADERS[Math.floor(Math.random() * MOCK_HEADERS.length)],
      bio: "A new soul, awakened. The dream begins.",
      pronouns: '',
      status: 'A new soul, awakened.',
      anthemUrl: '',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      settings: defaultSettings,
      following: ['@oracle_ai'],
      linkedAccounts: [],
      nexusData: {},
      isCreator: role === 'Creator',
      creatorProfile: role === 'Creator' ? { 
        xp: { innovation: 0, integration: 0, expression: 0, engineering: 0 }, 
        tier: 'Dream Seedling' 
      } : undefined
    };
    localStorage.setItem('gamedin-user', JSON.stringify(newUser));

    // Also store the divinaL3.json as requested
    const divinaL3 = {
        soulName: newUser.name,
        dream: newUser.dream,
        path: newUser.path,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('divinaL3.json', JSON.stringify(divinaL3));

    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('gamedin-user');
    localStorage.removeItem('divinaL3.json');
    setUser(null);
  };
  
  const updateUser = useCallback((newUserDetails: Partial<User>) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        ...newUserDetails, 
        settings: {...user.settings, ...newUserDetails.settings},
        nexusData: {...user.nexusData, ...newUserDetails.nexusData},
    };
    setUser(updatedUser);
    localStorage.setItem('gamedin-user', JSON.stringify(updatedUser));
  }, [user]);

  const toggleFollow = useCallback((handle: string) => {
    if (!user) return;
    const isFollowing = user.following.includes(handle);
    const newFollowing = isFollowing
        ? user.following.filter((followedHandle: string) => followedHandle !== handle)
        : [...user.following, handle];
    
    updateUser({ following: newFollowing });
    showToast(isFollowing ? `Unfollowed ${handle}` : `Followed ${handle}`);
  }, [user, updateUser, showToast]);

  const linkNexusAccount = useCallback(async (provider: NetworkProvider) => {
    if (!user) return;
    try {
      const newAccount = await nexus.connectAccount(provider, user.name);
      const updatedAccounts = [...user.linkedAccounts, newAccount];
      updateUser({ linkedAccounts: updatedAccounts });
      showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account linked successfully!`);
    } catch (e) {
      console.error(`[Nexus] Failed to link ${provider}`, e);
      showToast(`Failed to link ${provider}. The Nexus may be experiencing interference.`);
    }
  }, [user, updateUser, showToast]);

  const unlinkNexusAccount = useCallback((provider: NetworkProvider) => {
    if(!user) return;
    const updatedAccounts = user.linkedAccounts.filter((account: LinkedAccount) => account.provider !== provider);
    updateUser({ linkedAccounts: updatedAccounts });
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked.`);
  }, [user, updateUser, showToast]);

  const refreshNexusData = useCallback(async () => {
    if (!user || user.linkedAccounts.length === 0) return;
    try {
        const data = await nexus.fetchNexusData(user.linkedAccounts);
        updateUser({ nexusData: data });
        showToast("Nexus data refreshed.");
    } catch(e) {
        console.error(`[Nexus] Failed to refresh data`, e);
        showToast("Failed to refresh Nexus data. The connection is unstable.");
    }
  }, [user, updateUser, showToast]);


  // Verify user's LilithOS identity
  const verifyIdentity = useCallback(async (signature: string) => {
    if (!user?.lilithIdentity) return false;
    return await verifySoulSignature(user.lilithIdentity, signature);
  }, [user]);

  // Update user role (e.g., when upgrading from player to creator)
  const updateUserRole = useCallback(async (newRole: UserRole) => {
    if (!user) return;
    
    await logOnboardingEvent({
      userId: user.id,
      eventType: 'role_updated',
      metadata: {
        previousRole: user.role,
        newRole,
        timestamp: new Date().toISOString()
      }
    });

    updateUser({ 
      role: newRole,
      isCreator: newRole === 'Creator',
      creatorProfile: newRole === 'Creator' ? { 
        xp: { innovation: 0, integration: 0, expression: 0, engineering: 0 }, 
        tier: 'Dream Seedling' 
      } : user.creatorProfile
    });
  }, [user, updateUser]);

  const value = { 
    user, 
    login, 
    logout, 
    loading, 
    updateUser, 
    showToast, 
    toggleFollow, 
    linkNexusAccount, 
    unlinkNexusAccount, 
    refreshNexusData,
    verifyIdentity,
    updateUserRole
  };

  // Using createElement to ensure compatibility
  return React.createElement(AuthContext.Provider, { value }, children);
};
