# Crystal Kit: The Divine Developer Toolkit for GameDin

Crystal Kit is the foundational infrastructure and modular component library for the GameDin metaverse, enabling seamless integration with the Global Divine Infrastructure (GDI), cross-realm data sharing, and universal UI tools. Designed for use across VRChat, Unity (Blade Aeternum), and web apps, Crystal Kit is the official bridge to GDI and the Divina L3 chain (via MKZenith).

---

## ✨ Purpose
Crystal Kit empowers developers to:
- Access and display GDI token balances and tiers
- Gate content and features by GDI tier
- Show user auras and divine status
- Rapidly onboard with mock or real (MKZenith) data
- Build cross-realm, cross-platform experiences

---

## 📦 Modules

### `/services/GDIClient.ts`
Handles REST calls to the GDI backend. Easily switch between mock and MKZenith (Divina L3) backends. Includes tier logic and a sample `getGDIBalance(address)` method.

### `/hooks/useGDI.ts`
A React hook for fetching and returning GDI data. Returns `{ data, loading, error }` for a given address. Works with both mock and real backends.

### `/components/GDITokenDisplay.tsx`
UI element to show a user's GDI token balance and tier. Clean, accessible, and styled for clarity.

### `/components/UserAura.tsx`
Avatar glow based on GDI tier. Instantly divine.

### `/components/AccessGate.tsx`
GDI-gated component. Conditionally renders children if the user's tier meets or exceeds the required tier.

### `/types/GDI.ts`
TypeScript type definitions for GDI Tier, balance response, and related data. Universal and ready for cross-realm use.

---

## 🏆 GDI Tiers
- **Sovereign**: 1000+
- **Radiant**: 500+
- **Initiate**: 100+
- **Wanderer**: <100

---

## 🛠️ Usage Examples

### 1. Fetching GDI Balance
```ts
import { GDIClient } from 'gamedin-core/services/GDIClient';
const client = new GDIClient({ baseUrl: 'https://gdi.api', useMock: true });
const balance = await client.getGDIBalance('0x123...');
console.log(balance.tier); // e.g., 'Radiant'
```

### 2. Using the React Hook
```tsx
import { useGDI } from 'gamedin-core/hooks/useGDI';
const { data, loading, error } = useGDI('0x123...', { baseUrl: 'https://gdi.api', useMock: true });
```

### 3. Displaying Token Balance
```tsx
import { GDITokenDisplay } from 'gamedin-core/components/GDITokenDisplay';
<GDITokenDisplay balanceData={data} />
```

### 4. Showing User Aura
```tsx
import { UserAura } from 'gamedin-core/components/UserAura';
<UserAura avatarUrl="/avatars/hero.png" tier="Radiant" />
```

### 5. GDI-Gated Content
```tsx
import { AccessGate } from 'gamedin-core/components/AccessGate';
<AccessGate userTier="Radiant" requiredTier="Initiate">Secret Content</AccessGate>
```

---

## 🧙‍♂️ Developer Notes
- All modules are modular, typed, and ready for cross-realm use (web, VRChat, Unity via WebView/Electron).
- Easily swap between mock and real (MKZenith) backends for rapid prototyping and production.
- Style is clean, divine, and designed for rapid onboarding.
- Extend, remix, and contribute to the metaverse!

---

Crystal Kit marks the official beginning of universal GDI integration across all GameDin realms. Power your apps like a god. 