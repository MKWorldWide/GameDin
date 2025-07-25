

export interface Post {
  id: string;
  author: string;
  handle: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  lfg?: {
    game: string;
    skillLevel: string;
  };
}

export interface Stream {
  id: string;
  streamerName: string;
  streamerAvatar: string;
  game: string;
  title: string;
  viewers: number;
  thumbnailUrl: string;
}

export type RenderTier = 'Stellar' | 'Grove' | 'Aethercore';
export type ProfileFrame = 'none' | 'celestial' | 'runic' | 'verdant' | 'void';

export interface UserSettings {
  theme: 'light' | 'dark';
  accentColor: 'sky' | 'pink' | 'green' | 'indigo';
  renderTier: 'auto' | RenderTier;
  profileFrame: ProfileFrame;
}

export type Path = 'Sage' | 'Seer' | 'Warrior' | 'Architect' | 'Sovereign';

// --- ROLES & IDENTITY ---
export type UserRole = 'Player' | 'Creator' | 'Curator';

export interface LilithIdentity {
  soulSignature: string;
  verificationMethod: 'email' | 'social' | 'signature';
  verifiedAt: string;
  identityHash: string;
  layeredAuth: {
    primary: boolean;
    secondary?: boolean;
    biometric?: boolean;
  };
}

export interface OnboardingEvent {
  eventId: string;
  userId: string;
  eventType: 'registration_start' | 'path_selected' | 'role_assigned' | 'verification_complete' | 'onboarding_complete';
  timestamp: string;
  metadata: Record<string, any>;
  novaSanctumLogged: boolean;
}

export type NetworkProvider = 'steam' | 'xbox' | 'playstation' | 'discord' | 'twitch' | 'twitter';

export interface LinkedAccount {
  provider: NetworkProvider;
  userId: string;
  username: string;
  linkedAt: string;
}

// --- NEXUS DATA ---

export interface SteamActivity {
  game: string;
  hoursPlayed: number;
  lastPlayed: string;
}

export interface TwitchStatus {
    isLive: boolean;
    title?: string;
    game?: string;
    viewers?: number;
}

export interface Trophy {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    platform: NetworkProvider;
}

export interface GameTrophies {
    gameName: string;
    platform: NetworkProvider;
    trophies: Trophy[];
}

export interface Friend {
    id: string;
    soulName: string;
    path: Path;
    avatarUrl: string;
    isOnline: boolean;
    currentGame?: string;
    platform: NetworkProvider;
    bondScore: number; // 0-100
}

export interface NexusData {
    steam?: {
        activities: SteamActivity[];
    };
    twitch?: TwitchStatus;
    trophies?: GameTrophies[];
    friends?: Friend[];
}

// --- USER & CHAT ---

export interface User {
  id: string;
  name: string; // This is the Soul Name
  dream: string;
  path: Path;
  role: UserRole;
  avatarUrl: string;
  headerUrl: string;
  bio: string;
  status?: string;
  anthemUrl?: string;
  pronouns?: string;
  joinedDate: string;
  settings: UserSettings;
  following: string[]; // array of user handles
  linkedAccounts: LinkedAccount[];
  nexusData?: NexusData;
  lilithIdentity?: LilithIdentity;
  onboardingComplete: boolean;
  isCreator?: boolean;
  creatorProfile?: any;
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- MATCHMAKING ---
export interface Lobby {
    id: string;
    game: string;
    platform: NetworkProvider | 'Cross-Platform';
    title: string;
    currentPlayers: number;
    maxPlayers: number;
    skillLevel: string;
    playstyle: string;
}