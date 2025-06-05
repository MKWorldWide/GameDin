import { CognitoUser } from '@aws-amplify/auth';
import { IUser } from '../types/social';

export const userMapper = (cognitoUser: CognitoUser): IUser => {
  const attributes = cognitoUser.attributes || {};
  
  return {
    id: cognitoUser.username,
    email: cognitoUser.username, // In Cognito, username is email
    username: attributes.preferred_username || cognitoUser.username,
    name: attributes.name || attributes.preferred_username || cognitoUser.username,
    picture: attributes.picture,
    avatar: attributes.avatar || attributes.picture,
    bio: attributes.profile,
    level: attributes['custom:level'] ? parseInt(attributes['custom:level'], 10) : 1,
    rank: attributes['custom:rank'] || 'Rookie',
    status: 'offline',
    lastSeen: new Date(),
    gameStats: {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
    },
    settings: {
      profileVisibility: 'public',
      notifications: {
        email: true,
        push: true,
        inGame: true,
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowFriendRequests: true,
        allowMessages: true,
      },
    },
    attributes
  };
}; 