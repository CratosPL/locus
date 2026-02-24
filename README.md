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

PDAs: `["drop", drop_id]` for the drop account, `["vault", drop_id]` for the SOL vault.

---

## Features

**Core mechanics**
- Drop messages with SOL rewards at real GPS coordinates
- GPS verification — must be within 150m to claim (Haversine formula)
- Real on-chain SOL transfers via Pinocchio program

**Claim Success Modal** — after every claim a modal shows up with an animated SOL counter going from 0 to the full reward, a visualization of the vault-to-wallet transfer flow, the drop's message, shortened tx signature and a direct link to Solscan. The kind of moment that makes the on-chain part feel real instead of abstract.

**Live Activity Feed** — on the map there's a collapsible feed showing what's happening across the network in real time. Tapestry events like claims, new drops, follows, badge mints, and ghost marks stream in every few seconds. You can watch the social graph being built while you play.

**Ghost Marks** — ephemeral messages (24h) with 8 types. No SOL attached, just vibes, warnings, tips. Other users can react. Creates FOMO because whatever was on the map yesterday is gone.

**Quest Trails** — multi-waypoint walking routes. Three pre-built trails around Warsaw (Old Town Haunting, Vistula Death March, Crypto Graveyard Tour). GPS auto-check-in marks waypoints as you physically visit them. Completing a full trail pays out bonus SOL (0.5–1.0).

**NFT Badges** — 11 achievement badges as compressed NFTs. Custom SVG icons designed to match the app's dark aesthetic — actual vector art that scales and glows, not emoji. Rarity tiers with glow effects on earned badges, greyed out when locked.

| Badge | Requirement | Rarity |
|-------|------------|--------|
| First Blood | Claim 1 drop | Common |
| Explorer | Claim 5 drops | Rare |
| Phantom Hunter | Claim 10 drops | Epic |
| Lich Lord | Claim 25 drops | Legendary |
| Gravedigger | Create 3 drops | Common |
| Haunter | Leave 5 ghost marks | Rare |
| Trail Walker | Complete a quest trail | Rare |
| Social Butterfly | Follow 5 explorers on Tapestry | Rare |
| Torque Loyalist | 7-day streak | Epic |
| Magic Hero | Master of quests | Legendary |
| Legend | Reach 200 reputation | Legendary |

**Reputation & Leaderboard** — score = Claims×10 + Created×5 + Likes×2. Ranks: Lost Soul → Spirit → Wraith → Lich.

**Social layer (Tapestry)** — profiles auto-created on wallet connect, likes and comments on drops stored on-chain, follow other explorers, build your social graph. Every drop and ghost mark registers as a Tapestry content node.

---

## Tapestry integration — what's here and what's next

This is the track I put the most thought into. Right now Tapestry handles profiles, content nodes for every drop and ghost mark, likes, comments, and follows. The live feed pulls from Tapestry events to show the social graph forming in real time.

What I'd build next: "Nearby Explorers" — show avatars of users active in the last 24h directly on the map, click to follow. Dedicated drops visible only to your followers (private dead drops using Tapestry's social graph for access control). Ghost Chain — automatic Tapestry link between two wallets that both haunted the same location. That's the direction this is going: GPS proximity + on-chain social graph as the foundation for IRL connections between people who've never met.

---

## Hackathon Tracks

**Tapestry — On-chain Social ($5,000)**
Every drop and ghost mark registers as a Tapestry content node. Profiles, follows, likes, and comments all go through the Tapestry protocol. The live activity feed visualizes the social graph being built in real time.

**MagicBlock — Gaming ($5,000)**
Quest Trails use game engine logic applied to the real world — sequenced waypoints, auto check-in triggers, difficulty levels, bonus rewards. Ghost Marks create a "now or never" loop that keeps people coming back daily.

**Sunrise — Migrations & Onboarding ($7,000)**
Dedicated Sunrise Quest Trail walks new users through setting up a wallet, making their first on-chain interaction, and understanding social graphs. "Lore" drops explain Solana concepts (CU, PDA, Rent) in an immersive way rather than pointing people at docs.

**Torque — Loyalty ($1,000)**
NFT badges for consistent explorers. Planned: daily check-in streaks at physical locations earning Torque-powered rewards.

---

## Anti-spam

Client-side right now: max 5 active drops per wallet, 60-second cooldown, minimum 0.01 SOL reward, can't claim your own drops, can't claim the same drop twice.

On-chain roadmap: PDA counters per wallet, SOL stake requirements, Tapestry reputation gates, ZK proof of location (prove you were within range without revealing exact coordinates).

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

If you're a judge and don't want to walk around Warsaw, there's a **Demo Mode** button that bypasses GPS. Full flow from your desk.

1. Open the app — 3-step welcome tour on first visit
2. Click **Enable GPS** (or turn on Demo Mode)
3. Connect Phantom or Solflare set to Devnet
4. Click a drop marker → check distance → claim it
5. Watch the Claim Success Modal — SOL counter, vault animation, Solscan link
6. Check the Live Feed top-right — see Tapestry network activity
7. Hit **+** to create a ghost mark or new drop
8. Open Quests tab → start a trail → walk (or demo) through waypoints
9. Open Profile for badge popups → mint your first NFT badge
10. Open Rank tab for the leaderboard

---

## Project Structure

```
src/
├── app/
│   ├── api/tapestry/route.ts      # Server proxy (handles CORS)
│   ├── layout.tsx
│   ├── page.tsx                   # Main page + all state
│   └── globals.css
├── components/
│   ├── MapView.tsx                # Leaflet map + all markers + popups
│   ├── ClaimSuccessModal.tsx      # Post-claim modal with SOL animation
│   ├── ActivityFeed.tsx           # Live Tapestry event feed
│   ├── ProfilePanel.tsx           # Profile + SVG badges + reputation
│   ├── CreateDropModal.tsx        # Drop or Ghost Mark creation
│   ├── Leaderboard.tsx
│   ├── QuestTrails.tsx
│   ├── WelcomeOverlay.tsx
│   └── TxToast.tsx
├── hooks/
│   ├── useProgram.ts              # Solana program calls
│   ├── useTapestry.ts             # Tapestry API
│   └── useGeolocation.ts          # GPS + IP fallback + proximity
├── types/index.ts
└── utils/
    ├── mockData.ts                # Sample drops, ghosts, trails, badge defs
    └── badgeIcons.tsx             # Custom SVG badge icons
```

---

## Verified Transactions

```
Claim:
3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY
CU: 13,250 | Fee: 0.000025 SOL | Status: Finalized

Create Drop:
44dEsMYw1abdLaQdF6xh7WZnxXayWbzVLS9i6vh1AoAqTb9FWDLmL1G3PYj3qaUZPuw8kYod9Zfp1DvzQurnwTcS
CU: 13,250 | Fee: 0.000025 SOL | Status: Finalized

Deploy:
2T2jy6GuBUA3Nidu3wGnawphyxy4zVaraquL5t57RwdfjRopYxnsUJ6fFNYNMoRixRPTtckW69ghEwM2vgxDzBs2
CU: 13,250 | Fee: 0.000025 SOL | Status: Finalized
```

[View on Solscan](https://solscan.io/tx/3VUAp7mQi8tggEeZijDZ7iLTUL3GaZBtuECYuCGZLoTjnEfqCHp5KwZ4vWVzqEnwxat4NLaAxjFiBYdsdANfw4LY?cluster=devnet)

---

## What's Next

ZK geofencing to prove proximity without revealing coordinates. Nearby Explorers on the map using Tapestry social discovery. Dedicated drops for followers only. Ghost Chain (auto-link between wallets that haunted the same spot). Multi-token rewards, session keys for gas-free onboarding, seasonal events with prize pools.

---

## Team

Solo dev. Built for the Graveyard Hackathon 2026.

## License

MIT
