# LOCUS — Geo-Social Dead Drops on Solana

> Leave messages. Hide rewards. Discover secrets. Walk quests. Mint badges.

**Solana Graveyard Hackathon 2026 (Feb 12–27)**

🔗 [Live Demo](https://locus-psi-coral.vercel.app) · 📺 [Demo Video](https://youtu.be/ZfoLEfOfA0g?si=jkgyjuD_nAvcxskI) · ⛓ [Program on Explorer](https://explorer.solana.com/address/HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn?cluster=devnet)

---

## What is this?

Geo-social apps had their moment and then died. High fees, garbage UX, centralized backends — the whole category got written off around 2022–2024. LOCUS is my attempt to fix that.

The idea is simple: you drop a message at a physical location on the map, lock some SOL into it, and whoever walks within 150 meters of it can claim it. That's a dead drop. You can also leave ephemeral ghost marks that vanish after 24 hours, follow quest trails across the city, and earn NFT badges for your activity.

Everything runs on Solana devnet. The social layer (profiles, likes, comments, follows) goes through Tapestry Protocol so it's on-chain too, not just a database pretending to be Web3.

---

## Why Pinocchio instead of Anchor?

Honestly, I wanted to see if I could get the CU cost down to something that makes geo-social actually viable at scale. Anchor is great but it's heavy — around 200K compute units per transaction. Pinocchio gets the same thing done in ~13,250 CU with zero dependencies and a ~30KB binary. Every claim costs less than 0.00003 SOL in fees. That matters when you're thinking about hundreds of thousands of micro-transactions happening across a city.

---

## How it works

You connect your wallet, the app reads your GPS, and you see drops on the map around you. Click one, check the distance, walk to it, sign a transaction, get the SOL. That's the core loop.

On the creation side: pick a spot, write a message, lock in a reward (minimum 0.01 SOL to keep spam out), and your drop goes live. The SOL sits in a PDA vault until someone claims it or you pull it back.

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

**Program ID:** `HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn` (devnet)

PDAs are straightforward — `["drop", drop_id]` for the drop account, `["vault", drop_id]` for the SOL vault. Clean, auditable, no magic.

---

## Features

**Core mechanics**
- Drop messages with SOL rewards at real GPS coordinates
- GPS verification — must be within 150m to claim (Haversine formula)
- Real on-chain SOL transfers via Pinocchio program

**Ghost Marks** — ephemeral social layer. Short-lived messages (24h) with 8 emoji types. No SOL attached, just vibes, warnings, tips. Other users can react. Creates FOMO because whatever was on the map yesterday is gone.

**Quest Trails** — multi-waypoint walking routes. Three pre-built trails around Warsaw (Old Town Haunting, Vistula Death March, Crypto Graveyard Tour). GPS auto-check-in marks waypoints as you physically visit them. Completing a full trail pays out bonus SOL (0.5–1.0).

**NFT Badges** — achievement tokens that mint as compressed NFTs via Metaplex Bubblegum. Eight badges across rarity tiers:

| Badge | Requirement | Rarity |
|-------|------------|--------|
| 🩸 First Blood | Claim 1 drop | Common |
| 🧭 Explorer | Claim 5 drops | Rare |
| 👻 Phantom Hunter | Claim 10 drops | Epic |
| 👑 Lich Lord | Claim 25 drops | Legendary |
| ⚰️ Gravedigger | Create 3 drops | Common |
| 💭 Haunter | Leave 5 ghost marks | Rare |
| 🗺️ Trail Walker | Complete a quest trail | Rare |
| ⭐ Legend | Reach 200 reputation | Legendary |

**Reputation & Leaderboard** — score = Claims×10 + Created×5 + Likes×2. Ranks go from Lost Soul → Spirit → Wraith → Lich. Displayed on a live leaderboard.

**Social layer (Tapestry)** — profiles auto-created on wallet connect, likes and comments on drops stored on-chain, follow other explorers, build your social graph.

---

## Hackathon Tracks

**Tapestry — On-chain Social ($5,000)**
Every drop and ghost mark registers as a Tapestry content node. Profiles, follows, likes, and comments all go through the Tapestry protocol. No off-chain database for social data.

**MagicBlock — Gaming ($5,000)**
Quest Trails use game engine logic applied to the real world — sequenced waypoints, auto check-in triggers, difficulty levels, bonus rewards. Ghost Marks create a "now or never" loop that keeps people coming back daily.

**Sunrise — Migrations & Onboarding ($7,000)**
There's a dedicated Sunrise Quest Trail that walks new users through setting up a wallet, making their first on-chain interaction, and understanding what social graphs are. The "Lore" drops scattered around the trail explain Solana concepts (CU, PDA, Rent) in an immersive way rather than pointing people at documentation.

**Torque — Loyalty ($1,000)**
NFT badges for consistent explorers. Planned: daily check-in streaks at physical locations earning Torque-powered rewards.

---

## Anti-spam

Client-side right now:
- Max 5 active drops per wallet
- 60-second cooldown between creates
- Minimum 0.01 SOL reward as economic barrier
- Can't claim your own drops
- Can't claim the same drop twice

The roadmap for on-chain enforcement includes PDA counters per wallet, SOL stake requirements, reputation gates via Tapestry score, and eventually ZK proof of location (prove you were within range without revealing your exact coordinates).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Program | Pinocchio (zero-dep Solana framework) |
| Frontend | Next.js 14 + React 18 + TypeScript |
| Social | Tapestry Protocol |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Map | Leaflet + react-leaflet + CARTO dark tiles |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Getting Started

```bash
git clone https://github.com/CratosPL/locus.git
cd locus
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_TAPESTRY_API_KEY=your_key_from_app.usetapestry.dev
NEXT_PUBLIC_TAPESTRY_API_URL=https://api.usetapestry.dev/v1
NEXT_PUBLIC_TAPESTRY_NAMESPACE=locus
```

```bash
npm run dev
# http://localhost:3000
```

---

## Testing the App

If you're a judge and don't want to walk around Warsaw, there's a **Demo Mode** button that bypasses GPS. You can test the full flow from your desk.

1. Open the app — there's a 3-step welcome tour on first visit
2. Click **Enable GPS** (or turn on Demo Mode)
3. Connect Phantom or Solflare set to Devnet
4. Click a drop marker on the map → check the distance → claim it
5. Hit **+** to create a ghost mark or a new drop
6. Open the Quests tab → start a trail → walk (or demo) through waypoints
7. Check Profile for badge popups → mint your first NFT badge
8. Open Rank tab for the leaderboard

---

## Verified Transactions

All tested on devnet:

```
Claim:
3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized

Create Drop:
44dEsMYw1abdLaQdF6xh7WZnxXayWbzVLS9i6vh1AoAqTb9FWDLmL1G3PYj3qaUZPuw8kYod9Zfp1DvzQurnwTcS
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized

Deploy:
2T2jy6GuBUA3Nidu3wGnawphyxy4zVaraquL5t57RwdfjRopYxnsUJ6fFNYNMoRixRPTtckW69ghEwM2vgxDzBs2
CU: 13,250 | Fee: 0.000025 SOL | Status: ✅ Finalized
```

[View on Solscan](https://solscan.io/tx/3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY?cluster=devnet)

---

## Project Structure

```
src/
├── app/
│   ├── api/tapestry/route.ts   # Server proxy (handles CORS)
│   ├── layout.tsx              # Root layout + wallet provider + PWA
│   ├── page.tsx                # Main page
│   └── globals.css             # Dark theme + custom marker CSS
├── components/
│   ├── AppWalletProvider.tsx
│   ├── Header.tsx
│   ├── MapView.tsx             # Leaflet map + all markers + popups
│   ├── StatsBar.tsx
│   ├── DropList.tsx
│   ├── CreateDropModal.tsx     # Drop or Ghost Mark creation (tabbed)
│   ├── ProfilePanel.tsx        # Profile + badges + reputation
│   ├── Leaderboard.tsx
│   ├── QuestTrails.tsx
│   ├── WelcomeOverlay.tsx      # First-time onboarding
│   └── TxToast.tsx
├── hooks/
│   ├── useProgram.ts           # Solana program calls
│   ├── useTapestry.ts          # Tapestry API
│   └── useGeolocation.ts       # GPS + IP fallback + proximity calc
├── types/index.ts
└── utils/mockData.ts           # Sample drops, ghosts, trails, badge defs
```

---

## What's Next

ZK geofencing to prove proximity without revealing coordinates is the big one. After that: multi-token rewards (BONK, USDC), session keys for gas-free onboarding, multi-sig drops that need N finders to unlock, push notifications when drops appear near you, and seasonal events with prize pools.

The long-term vision is community-created drop zones in cities worldwide, with a marketplace for buying and selling quest trail templates.

---

## Team

Solo dev. Built for the Graveyard Hackathon 2026.

## License

MIT
