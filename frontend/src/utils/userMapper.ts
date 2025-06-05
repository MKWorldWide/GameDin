import { AuthUser } from '@aws-amplify/auth';
import { IUser } from '../types/social';

interface CognitoAttributes {
  email?: string;
  name?: string;
  picture?: string;
  rank?: string;
  level?: string;
  [key: string]: string | undefined;
}

interface ExtendedCognitoUser extends Omit<AuthUser, 'attributes'> {
  attributes?: CognitoAttributes;
  username: string;
}

export const mapCognitoUserToIUser = (user: AuthUser): IUser => {
  return {
    id: user.userId,
    username: user.username,
    email: user.signInDetails?.loginId || '',
    name: user.username,
    picture: '/default-avatar.png',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}; 