

export interface Comment {
  id: string;
  authorHandle: string;
  authorAvatarUrl: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string;
  content: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  sharesCount: number;
  comments?: Comment[];
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

// --- CREATOR ---

export interface CreatorXP {
    innovation: number;
    integration: number;
    expression: number;
    engineering: number;
}

export type CreatorTier = 'Dream Seedling' | 'Aether Weaver' | 'Nexus Shaper' | 'World Forger' | 'Genesis Architect';

export interface CreatorProfile {
    xp: CreatorXP;
    tier: CreatorTier;
}

export interface GeneratedConcept {
    id: string;
    imageUrl: string;
    description: string;
    name: string;
}


// --- USER & CHAT ---

export interface User {
  id: string;
  name: string; // This is the Soul Name
  handle: string; // The @username for routing and mentions
  dream: string;
  path: Path;
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
  creatorProfile: CreatorProfile;
  gallery: GeneratedConcept[];
}

export interface GlobalChatMessage {
  id: string;
  authorHandle: string;
  authorName: string;
  authorAvatarUrl: string;
  text: string;
  timestamp: string;
}

// --- MATCHMAKING ---
export interface Lobby {
    id:string;
    game: string;
    platform: NetworkProvider | 'Cross-Platform';
    title: string;
    currentPlayers: number;
    maxPlayers: number;
    skillLevel: string;
    playstyle: string;
}