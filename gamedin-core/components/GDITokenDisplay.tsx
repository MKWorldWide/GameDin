// Crystal Kit: GDITokenDisplay - UI element to show GDI token balance and tier
// Modular, typed, accessible, and styled for clarity

import React from 'react';
import { GDIBalanceResponse } from '../types/GDI';
import { useGDI } from '../hooks/useGDI';

/**
 * GDITokenDisplay - Displays a user's GDI token balance and tier by address
 * @param address - The user's wallet or account address
 *
 * Example:
 *   <GDITokenDisplay address="0x123" baseUrl="/api" />
 */
export const GDITokenDisplay: React.FC<{ address: string; baseUrl: string; useMock?: boolean }> = ({ address, baseUrl, useMock }) => {
  const { balance, tier, loading, error } = useGDI(address, { baseUrl, useMock });
  if (loading) return <div aria-busy="true">Loading GDI balance...</div>;
  if (error) return <div role="alert" style={{ color: 'red' }}>Error: {error}</div>;
  if (balance === null || !tier) return null;
  return (
    <div
      aria-label="GDI Token Balance"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: '#f7faff',
        borderRadius: '1rem',
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        padding: '1rem 2rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        fontSize: '1.2rem',
      }}
    >
      <span style={{ color: '#2a7cff' }}>GDI Balance:</span>
      <span style={{ color: '#222' }}>{balance}</span>
      <span style={{ color: '#888', fontStyle: 'italic' }}>({tier})</span>
    </div>
  );
}; 