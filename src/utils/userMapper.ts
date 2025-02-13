import { IUser } from '../types/social';
import { CognitoUser } from '@aws-amplify/auth';

export function mapCognitoUserToIUser(cognitoUser: CognitoUser): IUser {
  const attributes = cognitoUser.attributes || {};
  
  return {
    id: cognitoUser.username,
    username: cognitoUser.username,
    email: attributes.email,
    name: attributes.name,
    picture: attributes.picture,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
} 