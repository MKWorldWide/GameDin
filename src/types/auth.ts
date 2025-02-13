import { CognitoUser } from '@aws-amplify/auth';

export interface CognitoAttributes {
  email: string;
  phone_number: string;
  [key: string]: string;
}

export interface AmplifyUser extends CognitoUser {
  attributes: CognitoAttributes;
}

export interface AuthContextType {
  user: AmplifyUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; attributes: CognitoAttributes }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AmplifyUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
} 