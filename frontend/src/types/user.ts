import { ISO8601Date } from './utilities';

export interface IUserProfile {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  coverUrl: string;
  presence: 'online' | 'offline' | 'in-game';
  currentGame?: string;
  reputation: number;
  rank?: string;
  level?: number;
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      rarity: string;
      game: string;
      earnedAt: ISO8601Date;
    }>;
  };
  stats: {
    gamesPlayed: number;
    winRate: number;
    totalMatches: number;
    favoriteGame: string;
    playtime: number;
    rank: string;
  };
  topGames: Array<{
    name: string;
    hoursPlayed: number;
    level: number;
    platform: string;
    rank?: string;
    winRate: number;
    favoriteCharacter?: string;
  }>;
  recentAchievements: Array<{
    id: string;
    name: string;
    game: string;
    icon: string;
    rarity: string;
    unlockedAt: ISO8601Date;
    description: string;
  }>;
  teams: Array<{
    id: string;
    name: string;
    game: string;
    role: string;
    members: number;
    rank?: string;
    logo: string;
  }>;
  highlights: Array<{
    id: string;
    title: string;
    game: string;
    type: 'clip' | 'achievement' | 'record';
    thumbnailUrl: string;
    views: number;
    date: ISO8601Date;
  }>;
  schedule: Array<{
    id: string;
    type: 'tournament' | 'practice' | 'streaming';
    game: string;
    title: string;
    date: ISO8601Date;
    participants: number;
  }>;
  activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: ISO8601Date;
  }>;
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  avatar: string;
  presence: 'online' | 'offline' | 'in-game';
  rank?: string;
  level?: number;
}

export interface IAuthUser extends IUser {
  token: string;
  refreshToken: string;
  expiresAt: ISO8601Date;
}
