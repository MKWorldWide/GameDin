// Crystal Kit Playground: GDIDemo
// Demo page for testing GDI components in isolation
// Accessible, modular, and quantum-documented

import React, { useState } from 'react';
import { GDITokenDisplay } from '../components/GDITokenDisplay';
import { AccessGate } from '../components/AccessGate';
import { UserAura } from '../components/UserAura';
import { GDITier } from '../types/GDI';

const DEMO_AVATAR = 'https://api.dicebear.com/7.x/identicon/svg?seed=GDI';
const BASE_URL = '/api'; // Change as needed for your backend

export const GDIDemo: React.FC = () => {
  const [address, setAddress] = useState('0x1234567890abcdef');
  const [requiredTier, setRequiredTier] = useState<GDITier>('Initiate');

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Inter, sans-serif' }}>
      <h2>Crystal Kit Playground</h2>
      <label htmlFor="address-input">Wallet Address:</label>
      <input
        id="address-input"
        type="text"
        value={address}
        onChange={e => setAddress(e.target.value)}
        style={{ width: '100%', marginBottom: 16, padding: 8, fontSize: 16 }}
        aria-label="Wallet address input"
      />
      <GDITokenDisplay address={address} baseUrl={BASE_URL} />
      <div style={{ margin: '2rem 0' }}>
        <label htmlFor="tier-select">Required Tier for AccessGate:</label>
        <select
          id="tier-select"
          value={requiredTier}
          onChange={e => setRequiredTier(e.target.value as GDITier)}
          style={{ marginLeft: 8, fontSize: 16 }}
        >
          <option value="Wanderer">Wanderer</option>
          <option value="Initiate">Initiate</option>
          <option value="Radiant">Radiant</option>
          <option value="Sovereign">Sovereign</option>
        </select>
        <AccessGate address={address} requiredTier={requiredTier} baseUrl={BASE_URL}>
          <div style={{ marginTop: 16, padding: 16, background: '#eaffea', borderRadius: 8 }}>
            <strong>Secret Feature:</strong> You have access to this content!
          </div>
        </AccessGate>
      </div>
      <div style={{ margin: '2rem 0' }}>
        <h3>User Aura</h3>
        <UserAura avatarUrl={DEMO_AVATAR} tier={requiredTier} />
      </div>
    </div>
  );
}; 