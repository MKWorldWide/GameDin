<<<<<<< HEAD
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
=======
import { CognitoUser } from '@aws-amplify/auth';
import { IUser } from '../types/social';
import { defaultSettings } from '../constants/settings';

export const userMapper = (cognitoUser: CognitoUser): IUser => {
  const attributes = cognitoUser.attributes || {};
  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${attributes.preferred_username || attributes.email || cognitoUser.username}`;

  // Ensure required string fields have default values
  const email = attributes.email || cognitoUser.username;
  const username = attributes.preferred_username || email.split('@')[0] || cognitoUser.username;
  const name = attributes.name || username;

  return {
    id: cognitoUser.username,
    email,
    username,
    name,
    picture: attributes.picture || defaultAvatar,
    avatar: attributes.picture || defaultAvatar,
    bio: attributes['custom:bio'] || '',
    rank: attributes['custom:rank'] || 'Rookie',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attributes: {
      email: attributes.email,
      name: attributes.name,
      picture: attributes.picture,
      rank: attributes['custom:rank'] || 'Rookie'
    }
  };
};
>>>>>>> 2471f6c48a55d40216017bf626f34df3290ed4b9
