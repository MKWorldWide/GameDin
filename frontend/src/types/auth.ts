import { AuthUser } from '@aws-amplify/auth';

export interface CognitoAttributes {
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub?: string;
}

export interface IAuthUser extends AuthUser {
  attributes: CognitoAttributes;
}

export interface AuthContextType {
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  setUser: (user: IAuthUser | null) => void;
  setLoading: (value: boolean) => void;
  setError: (error: string | null) => void;
} 