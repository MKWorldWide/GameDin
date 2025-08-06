

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { User, UserSettings, Path, NetworkProvider, CreatorProfile, CreatorXP, GeneratedConcept, LinkedAccount } from '../types';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { MOCK_AVATARS, MOCK_HEADERS } from '../constants';
import * as nexus from '../services/nexus';
import * as db from '../services/database';

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

const defaultCreatorProfile: CreatorProfile = {
  xp: { innovation: 0, integration: 0, expression: 0, engineering: 0 },
  tier: 'Dream Seedling',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      db.seedInitialData();
      const currentUserId = localStorage.getItem('gamedin-session');
      if (currentUserId) {
        const loggedInUser = db.getUserById(currentUserId);
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error("Failed to initialize auth", error);
      localStorage.removeItem('gamedin-session');
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (soulName: string, dream: string, path: Path) => {
    const handle = soulName.toLowerCase().replace(/\s/g, '_');
    
    // Check if handle already exists
    if(db.getUserByHandle(handle)) {
        // For this prototype, we'll just log in as the existing user
        const existingUser = db.getUserByHandle(handle);
        if (existingUser) {
            localStorage.setItem('gamedin-session', existingUser.id);
            setUser(existingUser);
            showToast(`Welcome back, ${existingUser.name}`);
            return;
        }
    }
      
    const newUser: User = { 
      id: `user_${Date.now()}`,
      name: soulName,
      handle,
      dream,
      path,
      avatarUrl: MOCK_AVATARS[Math.floor(Math.random() * MOCK_AVATARS.length)],
      headerUrl: MOCK_HEADERS[Math.floor(Math.random() * MOCK_HEADERS.length)],
      bio: "A new soul, awakened. The dream begins.",
      pronouns: '',
      status: 'A new soul, awakened.',
      anthemUrl: '',
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      settings: defaultSettings,
      following: ['oracle_ai'],
      linkedAccounts: [],
      nexusData: {},
      creatorProfile: defaultCreatorProfile,
      gallery: [],
    };
    
    db.addUser(newUser);
    localStorage.setItem('gamedin-session', newUser.id);
    
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
    localStorage.removeItem('gamedin-session');
    setUser(null);
  };
  
  const updateUser = useCallback((newUserDetails: Partial<User>) => {
    if (!user) return;
    const updatedUser = { 
        ...user, 
        ...newUserDetails, 
        settings: {...user.settings, ...newUserDetails.settings},
        nexusData: {...user.nexusData, ...newUserDetails.nexusData},
        creatorProfile: newUserDetails.creatorProfile ? { ...user.creatorProfile, ...newUserDetails.creatorProfile, xp: {...user.creatorProfile.xp, ...newUserDetails.creatorProfile.xp}} : user.creatorProfile,
    };
    
    db.updateUser(updatedUser);
    setUser(updatedUser);
  }, [user]);

  const updateCreatorXP = useCallback((xpGains: Partial<CreatorXP>) => {
    if (!user) return;
    const newXP: CreatorXP = { ...user.creatorProfile.xp };
    let totalXPGained = 0;
    (Object.keys(xpGains) as Array<keyof CreatorXP>).forEach(key => {
        newXP[key] = (newXP[key] || 0) + (xpGains[key] || 0);
        totalXPGained += xpGains[key] || 0;
    });

    // TODO: Add logic to update tier based on total XP
    const updatedProfile: CreatorProfile = {
        ...user.creatorProfile,
        xp: newXP,
    };

    updateUser({ creatorProfile: updatedProfile });
    if(totalXPGained > 0) {
      showToast(`Gained ${totalXPGained} Creator XP!`);
    }
  }, [user, updateUser, showToast]);

  const saveConceptToGallery = useCallback((concept: Omit<GeneratedConcept, 'id'>) => {
    if (!user) return;
    const newConcept: GeneratedConcept = {
        ...concept,
        id: `concept_${Date.now()}`
    };
    const newGallery = [...user.gallery, newConcept];
    updateUser({ gallery: newGallery });
    showToast(`"${concept.name}" has been saved to your gallery!`);
  }, [user, updateUser, showToast]);


  const toggleFollow = useCallback((handleToToggle: string) => {
    if (!user) return;
    const isFollowing = user.following.includes(handleToToggle);
    const newFollowing = isFollowing
        ? user.following.filter(f => f !== handleToToggle)
        : [...user.following, handleToToggle];
    
    updateUser({ following: newFollowing });
    showToast(isFollowing ? `Unfollowed @${handleToToggle}` : `Followed @${handleToToggle}`);
  }, [user, updateUser, showToast]);

  const refreshNexusData = useCallback(async () => {
    if (!user) return;
    try {
        showToast("Syncing with the Nexus...");
        const data = await nexus.fetchNexusData(user.linkedAccounts);
        updateUser({ nexusData: data });
        showToast("Nexus data synchronized!");
    } catch(e) {
        console.error(`[Nexus] Failed to refresh data`, e);
        showToast("Failed to refresh Nexus data. The connection is unstable.");
    }
  }, [user, updateUser, showToast]);

  const linkNexusAccount = useCallback(async (provider: NetworkProvider) => {
    if (!user) return;
    try {
      showToast(`Connecting to ${provider}...`);
      const newAccount = await nexus.connectAccount(provider, user.name);
      const updatedAccounts = [...user.linkedAccounts, newAccount];
      
      const updatedUserWithAccount = { ...user, linkedAccounts: updatedAccounts };
      updateUser(updatedUserWithAccount);
      showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account linked! Syncing...`);

      // Now fetch data with the new account included
      const data = await nexus.fetchNexusData(updatedAccounts);
      updateUser({ ...updatedUserWithAccount, nexusData: data });
      showToast(`Nexus data for ${provider} synchronized!`);

    } catch (e) {
      console.error(`[Nexus] Failed to link ${provider}`, e);
      showToast(`Failed to link ${provider}. The Nexus may be experiencing interference.`);
    }
  }, [user, updateUser, showToast]);

  const unlinkNexusAccount = useCallback(async (provider: NetworkProvider) => {
    if(!user) return;
    
    const updatedAccounts = user.linkedAccounts.filter(acc => acc.provider !== provider);
    const updatedUserWithAccount = { ...user, linkedAccounts: updatedAccounts };

    showToast(`Unlinking from ${provider}. Resyncing Nexus...`);
    // Fetch new data based on remaining accounts
    const data = await nexus.fetchNexusData(updatedAccounts);
    
    // Update user with unlinked account and refreshed data
    updateUser({ ...updatedUserWithAccount, nexusData: data });
    
    showToast(`${provider.charAt(0).toUpperCase() + provider.slice(1)} unlinked. Nexus synchronized.`);
  }, [user, updateUser, showToast]);

  const value = { user, login, logout, loading, updateUser, showToast, toggleFollow, linkNexusAccount, unlinkNexusAccount, refreshNexusData, updateCreatorXP, saveConceptToGallery };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};