import { IUser } from '../types/social';

export interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<IUser> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<IUser>) => Promise<void>;
}

export type UseAuthReturn = AuthState & AuthActions;

export function useAuth(): UseAuthReturn; 