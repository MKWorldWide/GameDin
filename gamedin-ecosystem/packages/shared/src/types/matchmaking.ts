import { z } from 'zod';

export const MatchmakingStatusSchema = z.enum([
  'QUEUED',
  'MATCH_FOUND',
  'MATCHMAKING_FAILED',
  'CANCELLED',
]);

export type MatchmakingStatus = z.infer<typeof MatchmakingStatusSchema>;

export const GameModeSchema = z.enum([
  'SOLO',
  'DUO',
  'SQUAD',
  'CUSTOM',
]);

export type GameMode = z.infer<typeof GameModeSchema>;

export const MatchmakingPreferencesSchema = z.object({
  gameMode: GameModeSchema.default('SOLO'),
  skillLevel: z.number().min(1).max(100).default(50),
  region: z.string().default('us-east-1'),
  maxWaitTime: z.number().default(300), // in seconds
  partyId: z.string().uuid().optional(),
});

export type MatchmakingPreferences = z.infer<typeof MatchmakingPreferencesSchema>;

export const MatchSchema = z.object({
  id: z.string().uuid(),
  players: z.array(z.string().uuid()),
  teams: z.record(z.string(), z.array(z.string().uuid())),
  gameMode: GameModeSchema,
  region: z.string(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

export type Match = z.infer<typeof MatchSchema>;
