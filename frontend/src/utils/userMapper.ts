/**
 * userMapper Utility - Cognito User to App User
 *
 * This function maps a CognitoUser object from AWS Amplify Auth to the app's IUser type.
 *
 * Feature Context:
 * - Ensures all user attributes are normalized and available for the app
 * - Provides sensible defaults for missing fields
 * - Supports avatar, bio, rank, and extensible attributes
 *
 * Usage Example:
 *   const appUser = userMapper(cognitoUser);
 *
 * Dependency Listing:
 * - CognitoUser from @aws-amplify/auth
 * - IUser type (frontend/src/types/social.ts)
 * - defaultSettings (frontend/src/constants/settings.ts)
 *
 * Performance Considerations:
 * - Lightweight, synchronous mapping
 *
 * Security Implications:
 * - No sensitive data is exposed; only normalized user profile fields
 *
 * Changelog:
 * - [v3.2.2] Merged conflicting implementations, standardized on extensible userMapper, added quantum documentation
 */

import { CognitoUser } from '@aws-amplify/auth';

import { defaultSettings } from '../constants/settings';
import { IUser } from '../types/social';

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
      rank: attributes['custom:rank'] || 'Rookie',
    },
  };
};
