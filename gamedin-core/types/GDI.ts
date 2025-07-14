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