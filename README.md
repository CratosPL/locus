# 🪦 LOCUS — Geo-Social Dead Drops on Solana

> **Leave messages. Hide rewards. Discover secrets. Walk quests. Mint badges.**
> A location-based social dApp where users drop messages with SOL bounties, leave ephemeral ghost marks, walk quest trails, and mint NFT achievement badges — all on Solana.

**🏆 Solana Graveyard Hackathon 2026 (Feb 12-27)**

🔗 **[Live Demo](https://locus-psi-coral.vercel.app)** · 📺 **[Demo Video](https://youtube.com/...)** · ⛓ **[Program on Explorer](https://explorer.solana.com/address/HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn?cluster=devnet)**

---

## 🏆 Hackathon Tracks Integration

### 1. Tapestry (On-chain Social) - $5,000 Prize
Locus is a social protocol at its core. Every "drop" is registered as a content node on **Tapestry**, allowing for:
- **On-chain Social Graph**: Profiles, followers, and following are managed via Tapestry.
- **Interactions**: Likes and comments on physical locations are stored on-chain.
- **Social Discovery**: Find other explorers near you via their Tapestry activity.

### 2. MagicBlock (Gaming) - $5,000 Prize
The app uses a "Game Engine" approach to the real world:
- **Quest Trails**: Sequenced waypoints that must be visited in order (using gaming logic).
- **Ghost Marks**: Ephemeral messages that disappear, creating a "now or never" gaming loop.
- **Gaming Tiers**: Reputation ranks (Lost Soul -> Spirit -> Wraith -> Lich) displayed on a competitive leaderboard.

### 3. Sunrise (Migrations & Onboarding) - $7,000 Prize
Locus serves as a perfect onboarding tool:
- **Sunrise Quest Trail**: A dedicated tutorial path that guides new users through setting up a wallet, making their first on-chain interaction, and understanding social graphs.
- **Educational Lore**: "Lore" drops that explain Solana concepts (CU, PDA, Rent) in an immersive way.

### 4. Torque (Loyalty) - $1,000 Prize
- **Loyalty Badges**: NFT-based rewards for consistent explorers.
- **Streak Mechanics**: (Planned) Daily check-ins at locations to earn Torque-powered rewards.

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

- **Program ID**: `HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn` (deployed on devnet)
- **Framework**: Pinocchio (zero-dependency, ultra-low CU)
- **Source Code**: [program/src/](./program/src/)
- **IDL**: [idl/locus.json](./idl/locus.json)

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
| 🗺️ Dark Map | Interactive themed map with custom SVG markers | Leaflet + CARTO + CSS filters |
| 📍 GPS Verification | Must be within 150m to claim (Haversine) | Browser Geolocation API |
| ⚡ On-chain Claims | Real SOL transactions signed by wallet | Pinocchio program |
| 🪦 Create Drops | Place drops at your GPS location with SOL reward | Pinocchio + Tapestry |
| 👻 Ghost Marks | Ephemeral marks on the map — disappear after 24h | Tapestry content nodes |
| 🗺️ Quest Trails | Multi-waypoint routes with auto check-in + bonus SOL | GPS proximity + localStorage |
| 🏅 NFT Badges | Mint achievement NFTs for claims, creates, quests | Metaplex Bubblegum (planned) |
| 👤 Tapestry Profiles | Auto-created on wallet connect | Tapestry REST API |
| ❤️ Likes & Comments | Social engagement on drops, stored on-chain | Tapestry protocol |
| 🏆 Leaderboard | Reputation ranking: Claims ×10 + Created ×5 + Likes ×2 | Client + Tapestry |
| 🏅 Badges & Ranks | 8 NFT badges, reputation system (Lost Soul → Lich) | Client + Tapestry |
| 🔍 Demo Mode | Toggle GPS bypass for testing/judging | Client-side flag |
| 💾 Persistent State | Claims, likes, ghosts, trails survive refresh | localStorage |
| 🛡️ Anti-spam | Max 5 drops/wallet, 60s cooldown, min reward, no self-claim | Client-side guards |
| 📱 PWA | Add to Home Screen, standalone mode | Web App Manifest |

---

### 👻 Ghost Marks — Ephemeral Social Layer

Ghost Marks are short-lived messages on the map that **disappear after 24 hours**. Unlike Drops (which hold SOL), Ghost Marks are lightweight social signals — tips, warnings, photos, vibes.

- 8 emoji types: 👻 💭 ⚠️ 📸 🎵 💀 🔥 ❄️
- Placed at your GPS location
- Other users can react (👻 button)
- Stored as Tapestry content nodes
- Creates FOMO: "what was on the map yesterday?"

### 🗺️ Quest Trails — Multi-Waypoint Routes

Quest Trails link multiple waypoints into a walking route. Users follow the trail, physically visit each checkpoint, and earn a bonus SOL reward for completing the full quest.

- 3 pre-built trails in Warsaw (Old Town Haunting, Vistula Death March, Crypto Graveyard Tour)
- Dashed polyline rendered on map connecting waypoints
- **Auto check-in**: GPS proximity (150m) automatically marks waypoints as visited
- Progress bar per trail with real-time tracking
- Difficulty levels: Easy / Medium / Hard
- Bonus SOL on completion (0.5–1.0 SOL)

### 🏅 NFT Badges — Proof of Discovery

Achievement badges that can be minted as compressed NFTs on Solana. Tracks user milestones across all features.

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

- Auto-popup when threshold reached: "Badge earned! Mint NFT?"
- Progress bars in Profile panel
- Rarity tiers with colors
- Production: Metaplex Bubblegum compressed NFTs (~0.001 SOL per mint)

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
NEXT_PUBLIC_TAPESTRY_API_URL=https://api.usetapestry.dev/v1
NEXT_PUBLIC_TAPESTRY_NAMESPACE=locus
```

```bash
npm run dev
# → http://localhost:3000
```

### Testing Flow
1. Open app → Complete 3-step welcome tour
2. Click **"📍 Enable GPS"** to activate location (or enable Demo Mode)
3. Click "Connect" → Connect Phantom/Solflare (set to Devnet)
4. Click a drop marker → See distance → Walk closer or use Demo Mode
5. Click "⚡ Claim Drop" → Sign transaction in wallet → 🎉 Confetti!
6. Check Profile → See NFT badge popup → Mint your first badge
7. Click **+** → Choose "👻 Ghost Mark" → Leave an ephemeral mark
8. Click **+** → Choose "🪦 Drop" → Create a new drop with SOL reward
9. Open **🧭 Quests** tab → Start a quest trail → Walk waypoints
10. Open **🏆 Rank** tab → Check your leaderboard position
11. Like / Comment on drops via social buttons

---

## Project Structure

```
src/
├── app/
│   ├── api/tapestry/route.ts   # Server-side proxy (CORS bypass)
│   ├── layout.tsx              # Root layout + wallet provider + PWA
│   ├── page.tsx                # Main page — map, drops, ghosts, trails, badges
│   └── globals.css             # Dark theme + markers + ghost/trail CSS
├── components/
│   ├── AppWalletProvider.tsx    # Solana wallet context
│   ├── Header.tsx              # Logo + generic wallet connect/disconnect
│   ├── MapView.tsx             # Leaflet map + drop/ghost/trail markers + popups
│   ├── StatsBar.tsx            # Active drops, rewards, claims
│   ├── DropList.tsx            # List view with category filters + sorting
│   ├── CreateDropModal.tsx     # Create drop OR ghost mark (tabbed modal)
│   ├── ProfilePanel.tsx        # Profile + NFT badges + reputation + mint
│   ├── Leaderboard.tsx         # Top players by reputation
│   ├── QuestTrails.tsx         # Trail listing + progress + start quest
│   ├── WelcomeOverlay.tsx      # 3-step onboarding for first-time users
│   └── TxToast.tsx             # Transaction success/error notifications
├── hooks/
│   ├── useProgram.ts           # Solana program interaction (claim/create)
│   ├── useTapestry.ts          # Tapestry social API (profile/like/comment)
│   └── useGeolocation.ts       # GPS + IP fallback + proximity
├── types/index.ts              # Drop, GhostMark, QuestTrail, NFTBadge types
└── utils/mockData.ts           # Sample drops, ghosts, trails, badge defs
public/
├── manifest.json               # PWA manifest
└── icon-512.svg                # App icon
```

---

## Hackathon Tracks

### Tapestry — On-chain Social ($5,000)

Locus uses Tapestry to bring **social features fully on-chain**:

- **Profiles** → Auto-created via `findOrCreate` on wallet connect
- **Content Nodes** → Every drop and ghost mark registered as Tapestry content
- **Likes** → On-chain engagement tracked per drop
- **Comments** → Users leave messages on drops via Tapestry
- **Social Graph** → Follow drop creators, build reputation

### DRiP — NFT Track ($2,500)

Locus implements **NFT achievement badges** as Proof-of-Discovery tokens:

- **8 badge definitions** with rarity tiers (Common → Legendary)
- **Auto-trigger** when user hits milestone (claims, creates, trails, reputation)
- **Mint flow** — popup with badge preview → confirm → mint compressed NFT
- **Profile gallery** — minted badges displayed with rarity + progress bars
- **Production path** → Metaplex Bubblegum for ~0.001 SOL per compressed NFT

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
- 🌍 **Multi-city expansion** — community-created drop zones worldwide
- 🏆 **Seasonal events** — time-limited trails with leaderboard prize pools
- 🤝 **Multi-sig drops** — require N finders to unlock a shared vault
- 🔔 **Push notifications** — alert when new drops appear near your location
- 📷 **Photo drops** — attach images to drops and ghost marks
- 🏪 **Creator marketplace** — buy/sell quest trail templates

---

## Team

Solo developer — **Graveyard Hackathon 2026**

## License

MIT
