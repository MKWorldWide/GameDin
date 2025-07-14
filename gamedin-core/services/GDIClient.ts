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