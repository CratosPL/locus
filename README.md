# 🪦 LOCUS — Geo-Social Dead Drops on Solana

> **Leave messages. Hide rewards. Discover secrets.**
> A location-based social dApp where users drop encrypted messages with SOL bounties at real-world coordinates — and others must physically walk there to claim them.

**🏆 Solana Graveyard Hackathon 2026 — Tapestry On-chain Social Track**

🔗 **[Live Demo](https://locus-psi-coral.vercel.app)** · 📺 **[Demo Video](https://youtube.com/...)** · ⛓ **[Program on Explorer](https://explorer.solana.com/address/HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn?cluster=devnet)**

---

## The Problem

Geo-social apps died in 2022–2024. High costs, bad UX, and centralized infrastructure killed every attempt at location-based crypto experiences. The category was abandoned.

## The Solution

Locus resurrects geo-social with:
- **Pinocchio program** — zero-dependency, ~13K CU per transaction (vs ~200K for Anchor)
- **Tapestry protocol** — on-chain social graph (profiles, likes, comments, follows)
- **GPS verification** — must be within 150m of a drop to claim it
- **SOL rewards** — real value locked in PDA vaults, released on claim

---

## How It Works

```
Creator                                    Finder
  │                                          │
  ├─ Connects wallet                         ├─ Connects wallet
  ├─ GPS locates position                    ├─ GPS locates position
  ├─ Creates drop (message + SOL)            ├─ Sees drops on map
  │   └─► CreateDrop tx → Solana             ├─ Walks within 150m radius
  │   └─► Content node → Tapestry            ├─ Claims drop (signs tx)
  │                                          │   └─► ClaimDrop tx → Solana
  └─ Gets notified when claimed              │   └─► SOL transferred from vault
                                             └─ Likes/comments via Tapestry
```

### On-chain Architecture

```
Program: HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn (Devnet)

┌─────────────────────────────────────────────────┐
│  Locus Program (Pinocchio — zero dependencies)  │
├─────────────────────────────────────────────────┤
│                                                 │
│  CreateDrop (0x00)          ClaimDrop (0x01)     │
│  ├─ lat, lng, reward        ├─ drop_id          │
│  ├─ message                 ├─ verify signer    │
│  ├─ derive Drop PDA         ├─ derive vault     │
│  └─ fund Vault PDA          └─ transfer SOL     │
│                                                 │
│  PDAs:                                          │
│  Drop  = seeds["drop",  drop_id_bytes]          │
│  Vault = seeds["vault", drop_id_bytes]          │
│                                                 │
│  CU cost: ~13,250 per transaction               │
└─────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐    ┌──────────────────────┐
│  Tapestry API   │    │   Solana Devnet      │
│  (Social Layer) │    │   (Settlement Layer) │
│                 │    │                      │
│  • Profiles     │    │  • SOL transfers     │
│  • Likes        │    │  • PDA accounts      │
│  • Comments     │    │  • Tx confirmation   │
│  • Follows      │    │                      │
│  • Content      │    │                      │
└─────────────────┘    └──────────────────────┘
```

---

## Features

| Feature | Description | Stack |
|---------|-------------|-------|
| 🗺️ Dark Map | Interactive map with categorized drop markers | Leaflet + CARTO dark tiles |
| 📍 GPS Verification | Must be within 150m to claim (Haversine) | Browser Geolocation API |
| ⚡ On-chain Claims | Real SOL transactions signed by wallet | Pinocchio program |
| 🪦 Create Drops | Place drops at your GPS location with SOL reward | Pinocchio + Tapestry |
| 👤 Tapestry Profiles | Auto-created on wallet connect | Tapestry REST API |
| ❤️ Likes & Comments | Social engagement on drops, stored on-chain | Tapestry protocol |
| 🏅 Badges & Ranks | 7 discovery badges, reputation system (Lost Soul → Lich) | Client + Tapestry |
| 🔍 Demo Mode | Toggle GPS bypass for testing/judging | Client-side flag |
| 💾 Persistent State | Claims, likes, and created drops survive refresh | localStorage |
| 🛡️ Anti-spam | Max 5 drops/wallet, 60s cooldown, min reward, no self-claim | Client-side guards |
| 🪙 Token Selector | SOL active, BONK/USDC coming soon | UI roadmap |

---

## Anti-Spam & Security

Locus implements client-side protections and has a roadmap for on-chain enforcement:

### Current (Client-side)

| Protection | How |
|---|---|
| Max 5 active drops per wallet | Blocks creation after 5 unclaimed drops |
| 60-second cooldown | Prevents rapid-fire drop spam |
| Minimum 0.01 SOL reward | Economic barrier to low-effort spam |
| No self-claiming | Can't claim your own drops |
| Duplicate claim prevention | Can't claim same drop twice |

### Future (On-chain — Sybil Resistance Roadmap)

| Protection | Implementation |
|---|---|
| PDA counter per wallet | On-chain account tracking drop count per pubkey |
| SOL stake requirement | Lock 0.1 SOL per active drop, released on claim |
| Reputation gate | Min Tapestry score required to create drops |
| Time-locked claims | Drops become claimable only after N confirmations |
| ZK proof of location | Prove proximity without revealing exact coordinates |
| Quadratic staking | Cost increases per drop: 1st free, 2nd 0.05, 3rd 0.1... |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Program** | Pinocchio (zero-dep Solana framework) |
| **Frontend** | Next.js 14 + React 18 + TypeScript |
| **Social** | Tapestry Protocol (on-chain social graph) |
| **Wallet** | @solana/wallet-adapter (Phantom, Solflare) |
| **Map** | Leaflet + react-leaflet |
| **Styling** | Tailwind CSS (custom dark theme) |
| **Deploy** | Vercel |

---

## Quick Start

```bash
git clone https://github.com/CratosPL/locus.git
cd locus
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_TAPESTRY_API_KEY=your_key_from_app.usetapestry.dev
NEXT_PUBLIC_TAPESTRY_API_URL=https://api.usetapestry.dev/api/v1
NEXT_PUBLIC_TAPESTRY_NAMESPACE=locus
```

```bash
npm run dev
# → http://localhost:3000
```

### Testing Flow
1. Open app → Complete 3-step welcome tour
2. Click **"📍 Enable GPS"** to activate location (or enable Demo Mode)
3. Click "Select Wallet" → Connect Solflare/Phantom (set to Devnet)
4. Click a drop marker → See distance → Walk closer or use Demo Mode
5. Click "⚡ Claim Drop" → Sign transaction in wallet
6. See transaction confirmed on [Solscan](https://solscan.io)
7. Click **+** to create a new drop at your location (max 5 per wallet, 60s cooldown)
8. Like / Comment on drops via social buttons
9. Open Profile → Check your badges and reputation rank

---

## Project Structure

```
src/
├── app/
│   ├── api/tapestry/route.ts   # Server-side proxy (CORS bypass)
│   ├── layout.tsx              # Root layout + wallet provider
│   ├── page.tsx                # Main page — map, drops, social
│   └── globals.css             # Dark theme + Leaflet overrides
├── components/
│   ├── AppWalletProvider.tsx    # Solana wallet context
│   ├── Header.tsx              # Logo + wallet connect/disconnect
│   ├── MapView.tsx             # Leaflet map + GPS + popups + social
│   ├── StatsBar.tsx            # Active drops, rewards, claims
│   ├── DropList.tsx            # List view with category filters + sorting
│   ├── CreateDropModal.tsx     # Create drop with token selector + GPS coords
│   ├── ProfilePanel.tsx        # Tapestry profile + badges + reputation
│   ├── WelcomeOverlay.tsx      # 3-step onboarding for first-time users
│   └── TxToast.tsx             # Transaction success/error notifications
├── hooks/
│   ├── useProgram.ts           # Solana program interaction (claim/create)
│   ├── useTapestry.ts          # Tapestry social API (profile/like/comment)
│   └── useGeolocation.ts       # GPS on user gesture (iOS-compatible) + proximity
├── types/index.ts
└── utils/mockData.ts           # Sample drops in Warsaw
```

---

## Hackathon Track: Tapestry — On-chain Social ($5,000)

Locus uses Tapestry to bring **social features fully on-chain**:

- **Profiles** → Auto-created via `findOrCreate` on wallet connect
- **Content Nodes** → Every drop registered as Tapestry content
- **Likes** → On-chain engagement tracked per drop
- **Comments** → Users leave messages on drops via Tapestry
- **Social Graph** → Follow drop creators, build reputation

This transforms a simple geo-cache into a **social discovery platform** where reputation, engagement, and location create unique on-chain experiences.

---

## Why Pinocchio?

| | Anchor | Pinocchio |
|---|--------|-----------|
| CU per tx | ~200,000 | ~13,250 |
| Binary size | ~200KB | ~30KB |
| Dependencies | Many | Zero |
| Rent cost | Higher | Lower |

Pinocchio was chosen to demonstrate that geo-social doesn't need to be expensive. Every claim costs < 0.00003 SOL in fees.

---

## Verified Transactions

```
# Claim transaction
Signature: 3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized

# Create drop transaction
Signature: 44dEsMYw1abdLaQdF6xh7WZnxXayWbzVLS9i6vh1AoAqTb9FWDLmL1G3PYj3qaUZPuw8kYod9Zfp1DvzQurnwTcS
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized

# Deploy drop transaction
Signature: 2T2jy6GuBUA3Nidu3wGnawphyxy4zVaraquL5t57RwdfjRopYxnsUJ6fFNYNMoRixRPTtckW69ghEwM2vgxDzBs2
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized
```

[View on Solscan →](https://solscan.io/tx/3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY?cluster=devnet)

---

## Future Roadmap

- 🔐 **ZK geofencing** — prove proximity without revealing exact location
- 🛡️ **On-chain sybil resistance** — PDA counters, quadratic staking, reputation gates
- 🪙 **Multi-token rewards** — BONK, USDC, and SPL token support for drop bounties
- 🎫 **Session keys** — gas-free claiming for onboarding new users
- 🖼️ **NFT badges** — mint Proof-of-Discovery NFTs for completed quests
- 🌍 **Multi-city expansion** — community-created drop zones worldwide
- 🏆 **Leaderboards** — seasonal events with prize pools
- 📱 **PWA** — push notifications for nearby drops, offline map caching
- 🤝 **Multi-sig drops** — require N finders to unlock a shared vault

---

## Team

Solo developer — **Graveyard Hackathon 2026**

## License

MIT
