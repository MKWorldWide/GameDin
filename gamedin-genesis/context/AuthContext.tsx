

import { createContext } from 'react';
import { User, Path, NetworkProvider } from '../types';

interface AuthContextType {
  user: User | null;
  login: (soulName: string, dream: string, path: Path) => void;
  logout: () => void;
  loading: boolean;
  updateUser: (newUserDetails: Partial<User>) => void;
  showToast: (message: string) => void;
  toggleFollow: (handle: string) => void;
  linkNexusAccount: (provider: NetworkProvider) => Promise<void>;
  unlinkNexusAccount: (provider: NetworkProvider) => void;
  refreshNexusData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);