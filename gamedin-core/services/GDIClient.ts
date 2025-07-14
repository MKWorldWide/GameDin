// Crystal Kit: GDIClient - Handles REST calls to the Global Divine Infrastructure (GDI) backend
// Supports both mock and MKZenith (Divina L3) backends. Modular, typed, and ready for cross-realm use.

import { GDITier, GDIBalanceResponse } from '../types/GDI';

/**
 * GDIClient provides methods to interact with the Global Divine Infrastructure backend.
 * Easily swap between mock data and MKZenith (Divina L3) backend.
 */
export class GDIClient {
  private baseUrl: string;
  private useMock: boolean;

  constructor({ baseUrl, useMock = false }: { baseUrl: string; useMock?: boolean }) {
    this.baseUrl = baseUrl;
    this.useMock = useMock;
  }

  /**
   * Get the GDI token balance for a given address.
   * Returns tier info and balance.
   */
  async getGDIBalance(address: string): Promise<GDIBalanceResponse> {
    if (this.useMock) {
      // Mock logic for rapid dev/testing
      const mockBalance = Math.floor(Math.random() * 1500);
      return {
        address,
        balance: mockBalance,
        tier: this.getTierForBalance(mockBalance),
      };
    }
    // Real backend call (MKZenith/Divina L3)
    const res = await fetch(`${this.baseUrl}/gdi/balance/${address}`);
    if (!res.ok) throw new Error('Failed to fetch GDI balance');
    const data = await res.json();
    return {
      address,
      balance: data.balance,
      tier: this.getTierForBalance(data.balance),
    };
  }

  /**
   * Determine GDI tier based on balance.
   */
  getTierForBalance(balance: number): GDITier {
    if (balance >= 1000) return 'Sovereign';
    if (balance >= 500) return 'Radiant';
    if (balance >= 100) return 'Initiate';
    return 'Wanderer';
  }
}

/**
 * Get the GDI tier for a given address.
 * Returns the tier as a string.
 */
async function getGDITier(address: string, baseUrl: string): Promise<GDITier> {
  const res = await fetch(`${baseUrl}/gdi/tier/${address}`);
  if (!res.ok) throw new Error('Failed to fetch GDI tier');
  const data = await res.json();
  return data.tier as GDITier;
}

/**
 * Check if the address has access to a required GDI tier.
 * Returns true if access is granted.
 */
async function canAccess(address: string, requiredTier: GDITier, baseUrl: string): Promise<boolean> {
  const res = await fetch(`${baseUrl}/gdi/can-access/${address}/${requiredTier}`);
  if (!res.ok) throw new Error('Failed to check GDI access');
  const data = await res.json();
  return !!data.canAccess;
}

/**
 * Stake GDI tokens for a given address.
 * Sends a POST request to /api/gdi/stake with address and amount.
 * Returns success status and new tier if applicable.
 */
export async function stakeGDI(address: string, amount: number): Promise<{ success: boolean; newTier?: GDITier }> {
  const res = await fetch(`/api/gdi/stake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, amount }),
  });
  return await res.json();
}

// Standalone exports for direct use
export { getGDITier, canAccess }; 