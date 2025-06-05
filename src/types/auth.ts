<<<<<<< HEAD
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
=======
export interface AmplifyUser {
  username: string;
  attributes?: {
    email?: string;
    name?: string;
    picture?: string;
    sub?: string;
    [key: string]: any;
  };
}

export interface CognitoAttributes {
  email: string;
  phone_number: string;
  name?: string;
  picture?: string;
  [key: string]: string | undefined;
}

export interface AuthContextType {
  user: AmplifyUser | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
} 