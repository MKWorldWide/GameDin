// Crystal Kit: GDI Types - Type definitions for Global Divine Infrastructure

/**
 * GDI Tiers
 * - Sovereign: 1000+
 * - Radiant: 500+
 * - Initiate: 100+
 * - Wanderer: <100
 */
export type GDITier = 'Sovereign' | 'Radiant' | 'Initiate' | 'Wanderer';

/**
 * GDI Balance response structure
 */
export interface GDIBalanceResponse {
  address: string;
  balance: number;
  tier: GDITier;
}

/**
 * GDI Levels mapping for tier comparison and gating logic
 * 0: Wanderer, 1: Initiate, 2: Radiant, 3: Sovereign
 */
export const GDILevels: Record<GDITier, number> = {
  Wanderer: 0,
  Initiate: 1,
  Radiant: 2,
  Sovereign: 3,
}; 