// Crystal Kit: AccessGate - GDI-gated component
// Modular, typed, accessible, and styled for clarity

import React from 'react';
import { GDITier } from '../types/GDI';

/**
 * AccessGate - Conditionally renders children if user's GDI tier meets or exceeds requiredTier
 * @param userTier - The user's GDI tier
 * @param requiredTier - The minimum GDI tier required for access
 * @param children - Content to render if access is granted
 *
 * Example:
 *   <AccessGate userTier="Radiant" requiredTier="Initiate">Secret Content</AccessGate>
 */
const tierOrder: GDITier[] = ['Wanderer', 'Initiate', 'Radiant', 'Sovereign'];

export const AccessGate: React.FC<{ userTier: GDITier; requiredTier: GDITier; children: React.ReactNode }> = ({ userTier, requiredTier, children }) => {
  const hasAccess = tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
  return hasAccess ? (
    <div aria-label={`Access granted: ${userTier} >= ${requiredTier}`}>{children}</div>
  ) : (
    <div aria-label={`Access denied: ${userTier} < ${requiredTier}`} style={{ color: '#aaa', fontStyle: 'italic' }}>
      Access restricted: {requiredTier} tier required.
    </div>
  );
}; 