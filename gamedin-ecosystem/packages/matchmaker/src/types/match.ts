import { z } from 'zod';

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  CANCELLED = 'cancelled',
  TIMED_OUT = 'timed_out',
}

export enum PlayerRole {
  PLAYER = 'player',
  CREATOR = 'creator',
  CURATOR = 'curator',
}

export const PlayerPreferencesSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  language: z.string().min(1, 'Language is required'),
  skillLevel: z.number().min(1).max(100).default(50),
  gameModes: z.array(z.string()).default([]),
  customParameters: z.record(z.unknown()).optional(),
});

export type PlayerPreferences = z.infer<typeof PlayerPreferencesSchema>;

export const MatchRequestSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(PlayerRole),
  preferences: PlayerPreferencesSchema,
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
});

export type MatchRequest = z.infer<typeof MatchRequestSchema>;

export const MatchResultSchema = z.object({
  matchId: z.string().uuid(),
  status: z.nativeEnum(MatchStatus),
  players: z.array(z.string().uuid()),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  matchedAt: z.date().optional(),
});

export type MatchResult = z.infer<typeof MatchResultSchema>;

export interface IMatchMaker {
  addToQueue(request: MatchRequest): Promise<string>;
  cancelMatch(requestId: string): Promise<boolean>;
  getMatchStatus(matchId: string): Promise<MatchResult | null>;
  findMatches(): Promise<MatchResult[]>;
}
