# Crystal Kit: GDI Integration for GameDin

## Overview
Crystal Kit is the modular SDK for connecting GameDin’s frontend to the GDI infrastructure via MKZenith (Divina Layer 3 chain backend). It provides a type-safe, reusable system for GDI token balance, tier, access logic, and display components.

---

## Modules

### 1. `/gamedin-core/services/GDIClient.ts`
- **Purpose:** Provides async functions to fetch GDI balance, tier, and access rights for a given address.
- **Exports:**
  - `getGDIBalance(address: string): Promise<number>`
  - `getGDITier(address: string): Promise<GDITier>`
  - `canAccess(address: string, requiredTier: GDITier): Promise<boolean>`
- **Usage Example:**
```ts
import { getGDIBalance, getGDITier, canAccess } from 'gamedin-core/services/GDIClient';
const balance = await getGDIBalance(address);
const tier = await getGDITier(address);
const hasAccess = await canAccess(address, 'Radiant');
```

---

### 2. `/gamedin-core/hooks/useGDI.ts`
- **Purpose:** React hook to fetch and cache GDI balance and tier for a user address.
- **Returns:** `{ balance, tier, loading, error }`
- **Usage Example:**
```tsx
import useGDI from 'gamedin-core/hooks/useGDI';
const { balance, tier, loading, error } = useGDI(address);
```

---

### 3. `/gamedin-core/components/GDITokenDisplay.tsx`
- **Purpose:** Displays the user’s GDI balance and tier.
- **Usage Example:**
```tsx
<GDITokenDisplay address={address} />
```

---

### 4. `/gamedin-core/components/AccessGate.tsx`
- **Purpose:** Conditionally renders children if user meets minimum GDI tier.
- **Usage Example:**
```tsx
<AccessGate address={address} requiredTier="Radiant">
  <SecretFeature />
</AccessGate>
```

---

### 5. `/gamedin-core/components/UserAura.tsx`
- **Purpose:** Shows a color-coded badge or glow based on GDI tier.
- **Usage Example:**
```tsx
<UserAura tier={tier} />
```

---

### 6. `/gamedin-core/types/GDI.ts`
- **Purpose:** Type definitions for GDI tiers and levels.
- **Exports:**
```ts
export type GDITier = "Wanderer" | "Initiate" | "Radiant" | "Sovereign";
export const GDILevels = { Wanderer: 0, Initiate: 1, Radiant: 2, Sovereign: 3 };
```

---

## Live Code Sample: useGDI & AccessGate

```tsx
import useGDI from 'gamedin-core/hooks/useGDI';
import AccessGate from 'gamedin-core/components/AccessGate';

function GDIProtectedFeature({ address }: { address: string }) {
  const { balance, tier, loading } = useGDI(address);
  if (loading) return <div>Loading GDI data...</div>;
  return (
    <AccessGate address={address} requiredTier="Radiant">
      <div>Welcome, Radiant or above! Your balance: {balance}</div>
    </AccessGate>
  );
}
```

---

## Expansion & Reusability
- Designed for wallet auth, staking, and future GDI features.
- Reusable across GameDin, Blade Aeternum launcher, and GDI dashboard.

---

## Playground
- (Optional) Use `/gamedin-core/playground/` to test and demo Crystal Kit components in isolation.

---

## Changelog
- See @memories.md for all integration and update history. 