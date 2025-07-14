// Crystal Kit: AccessGate - GDI-gated component
// Modular, typed, accessible, and styled for clarity

import React from 'react';
import { GDITier } from '../types/GDI';
import { useGDI } from '../hooks/useGDI';

/**
 * AccessGate - Conditionally renders children if user's GDI tier meets or exceeds requiredTier
 * Accepts either address (fetches tier) or userTier directly.
 *
 * Example:
 *   <AccessGate address="0x123" requiredTier="Radiant" baseUrl="/api">Secret Content</AccessGate>
 *   <AccessGate userTier="Radiant" requiredTier="Initiate">Secret Content</AccessGate>
 */
export const AccessGate: React.FC<
  | { address: string; requiredTier: GDITier; baseUrl: string; useMock?: boolean; children: React.ReactNode }
  | { userTier: GDITier; requiredTier: GDITier; children: React.ReactNode }
> = (props) => {
  let userTier: GDITier | null = null;
  let loading = false;
  let error: string | null = null;
  if ('address' in props) {
    const gdi = useGDI(props.address, { baseUrl: props.baseUrl, useMock: props.useMock });
    userTier = gdi.tier;
    loading = gdi.loading;
    error = gdi.error;
  } else {
    userTier = props.userTier;
  }
  const { requiredTier, children } = props;
  if (loading) return <div aria-busy="true">Checking GDI access...</div>;
  if (error) return <div role="alert" style={{ color: 'red' }}>Error: {error}</div>;
  if (!userTier) return null;
  const hasAccess = GDILevels[userTier] >= GDILevels[requiredTier];
  return hasAccess ? (
    <div aria-label={`Access granted: ${userTier} >= ${requiredTier}`}>{children}</div>
  ) : (
    <div aria-label={`Access denied: ${userTier} < ${requiredTier}`} style={{ color: '#aaa', fontStyle: 'italic' }}>
      Access restricted: {requiredTier} tier required.
    </div>
  );
}; 