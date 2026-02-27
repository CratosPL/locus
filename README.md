# LOCUS — Geo-Social Dead Drops on Solana

> Leave messages. Hide SOL. Walk quests. Discover strangers. Everything on-chain.

**Solana Graveyard Hackathon 2026 — Feb 12–27**

🔗 [Live Demo](https://locus-psi-coral.vercel.app) · 📺 [Demo Video](https://youtu.be/ZfoLEfOfA0g?si=jkgyjuD_nAvcxskI) · ⛓ [Program on Explorer](https://explorer.solana.com/address/HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn?cluster=devnet)

---

## Submission Checklist

- [x] Built on Solana (Pinocchio program, devnet)
- [x] Working live demo: https://locus-psi-coral.vercel.app
- [x] Demo video (under 3 minutes): https://youtu.be/ZfoLEfOfA0g
- [x] Public GitHub repo with full source code
- [x] Team size: 1 person
- [x] Targets 4 sponsor tracks: **Tapestry** · **MagicBlock** · **Audius** · **Torque**

---

## What is LOCUS?

Geo-social apps had their moment and then died. High fees, garbage UX, centralized backends — the whole category was written off around 2022–2024. LOCUS is an attempt to fix that by making geography the core mechanic and Solana the backbone.

The loop: drop a message at a real GPS coordinate, lock SOL into it, whoever walks within 150 meters can claim it. That's a dead drop. On top of that: ephemeral ghost marks that vanish in 24 hours, walking quest trails across cities, NFT achievement badges, and a live on-chain social graph via Tapestry Protocol.

Why the category died before and why it won't here: fees were the killer. On Ethereum, a $0.50 micro-reward made no sense when gas was $5. With Pinocchio on Solana, a full claim transaction costs 0.000025 SOL in fees. That's what makes geo-social viable.

---

## Why Pinocchio and not Anchor?

I wanted to see how low the CU cost could go. Anchor is great but it's heavy — around 200K compute units per transaction. Pinocchio gets the same done in ~13,250 CU with zero dependencies and a ~30KB binary. Every claim costs less than 0.00003 SOL. That matters at scale when you're thinking about thousands of micro-transactions across cities every day.

---

## On-chain Geofence

The claim instruction enforces a 150-meter proximity check directly in the Solana program. The claimer's GPS coordinates are encoded as fixed-point integers (× 1e7) in the transaction data. The program:

1. **Bounding-box reject** — quick check that `|Δlat|` and `|Δlng|` are within limits (accounts for longitude shrinking at higher latitudes via a scaling factor for 40–60°N).
2. **Euclidean distance² ≤ radius²** — normalises longitude delta to latitude-equivalent units, then compares squared distance against the 15,000-unit (~150 m) threshold. All integer math, no floating point.

This is a dual-layer approach: the frontend does a Haversine check before even building the transaction (better UX — instant "too far" feedback), and the program independently enforces the geofence on-chain so a spoofed client can't bypass it. The next step is ZK geofencing to verify proximity without revealing exact coordinates.

---

## How it works

```
Creator                                    Finder
  │                                          │
  ├─ Connects wallet                         ├─ Connects wallet
  ├─ GPS locates position                    ├─ GPS locates position
  ├─ Creates drop (message + SOL reward)     ├─ Sees nearby drops on map
  │   └─► CreateDrop tx → Solana program     ├─ Walks within 150m radius
  │   └─► Content node registered → Tapestry ├─ Claims drop (signs tx + GPS coords)
  │                                          │   └─► ClaimDrop tx → Solana
  │                                          │   └─► On-chain geofence: ≤150m check
  │                                          │   └─► SOL transferred from PDA vault
  └─ Receives notification via feed          └─ Likes/comments via Tapestry
```

**Program ID:** `HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn` (devnet)

PDAs: `["drop", drop_id]` for the drop account, `["vault", drop_id]` for the SOL vault.

---

## Hackathon Tracks

### Tapestry — On-chain Social · $5,000

Every drop and ghost mark registers as a Tapestry content node at creation time. Profiles are auto-created on wallet connect and synced to Tapestry. Every like, comment, and follow goes through the Tapestry protocol — nothing is stored in a centralized database.

What's built specifically for this track:

- **Live Activity Feed** on the map — real-time stream of Tapestry events (claims, new drops, follows, badge mints, ghost marks). The social graph forming visibly as people use the app.
- **Nearby Explorers panel** — shows active wallets around the user with their rank, distance, and last active time. Click any explorer to open their full profile.
- **Explorer Profile Modal** — stats (drops created/claimed, reputation), rank (Lost Soul → Lich), wallet address, Follow button (updates Tapestry social graph), and inline DM field.
- **Drop popups with social layer** — every popup has Like (on-chain), public Chat (comment thread on the drop's content node), and private DM button to message the author directly.
- **Follow inline** — Follow button directly in the drop popup next to the creator's handle. One tap, no extra screens, on-chain.

The bigger vision: GPS proximity + Tapestry social graph creates conditions for real-world connections between people who've never met. Two wallets haunting the same location auto-linked. Drops visible only to followers. City-wide social graphs built entirely from physical presence.

---

### MagicBlock — Gaming · $5,000

Quest Trails bring RPG game logic to the physical world. Each trail is a sequence of GPS waypoints across a real city — the app auto-detects when you physically visit each one, marks progress, and pays out bonus SOL on completion.

Three pre-built trails: Old Town Haunting (Warsaw), Vistula Death March (Warsaw), Crypto Graveyard Tour (global). Each has difficulty tiers, narrative hints per waypoint, and variable rewards (0.5–1.0 SOL for full completion).

Ghost Marks create the "now or never" daily loop: ephemeral messages with 24-hour expiry. Players check back every day to see what appeared and what vanished. This is the retention mechanic.

RPG Progression layer: every action earns XP (Claims: 50 XP, Ghost Marks: 10 XP, Follows: 5 XP). XP gates rank titles (Lost Soul → Spirit → Wraith → Lich) and unlocks discovery radius bonuses.

---

### Audius — Music · $3,000

Music Drops are a dedicated drop type where creators attach an Audius track to a real GPS coordinate. When a finder walks to the location and opens the drop, they see the track name, artist, and a play button that streams directly from Audius.

The UX for creators: search by track name directly in the create drop modal — the app queries `discoveryprovider.audius.co/v1/tracks/search` with debounce, returns results with artwork, title, and artist. Select and it's attached. No Track IDs to copy-paste.

Music drops are visually distinct on the map: pink marker color, music note SVG icon, `♪` badge in the corner, and the reward label shows `♪ 0.05 ◎`. In the popup, the play button shows the actual track name and artist (`▶ Midnight Solana · CryptoBeats`), not just a music icon.

Seven example music drops are seeded globally across Warsaw, Tokyo (Shibuya), London, Paris, New York (Times Square), Sydney (Harbour), San Francisco (Golden Gate). Each with a message written from the perspective of someone who was actually there.

---

### Torque — Loyalty · $1,000

NFT badges for consistent explorer behavior. 11 achievement badges as compressed NFTs with custom SVG icons — actual vector art that glows and scales, not emoji. Earned badges show full color with glow effects; locked badges are greyed out.

Badge system tracks: drops claimed (First Blood → Explorer → Phantom Hunter → Lich Lord), drops created, ghost marks left, quest trails completed, follows made, reputation score.

The Torque Loyalist badge specifically targets the 7-day streak mechanic — daily check-ins at any physical location. This is the foundation for a Torque-powered streak reward system in production.

---

## Features

**Core dead drop mechanic**
- Drop messages + SOL rewards at real GPS coordinates (global, any city)
- 150m geofence enforcement — **dual layer**: client-side Haversine + **on-chain Euclidean distance check** in the Pinocchio program
- Real on-chain SOL transfers: vault PDA holds funds, released on claim
- Anti-spam: max 5 active drops per wallet, 60s cooldown, 0.01 SOL minimum

**Music Drops (Audius)**
- Attach any Audius track to a GPS location by searching track name
- Pink markers with music note icon and ♪ badge on map
- Inline player in popup with track name and artist
- 7 example drops across Warsaw, Tokyo, London, Paris, New York, Sydney, San Francisco

**Social Discovery (Tapestry)**
- Public comment threads on every drop
- Private DM to drop author from map popup
- Follow button inline in drop popup
- Nearby Explorers panel with distance, rank, last active
- Explorer Profile Modal with stats, follow, and DM

**Ghost Marks**
- 8 types: 👻 💭 ⚠️ 📸 🎵 💀 🔥 ❄️
- 24-hour auto-expiry
- Reaction counter
- Registered as Tapestry content nodes

**Quest Trails**
- Multi-waypoint walking routes through real city areas
- GPS auto-check-in at each waypoint
- Progress tracking and completion rewards (0.5–1.0 SOL)
- Difficulty tiers: Novice / Veteran / Legendary

**NFT Badges**
- 11 achievements as compressed NFTs
- Custom SVG icons with dynamic color and glow
- Rarity tiers: Common / Rare / Epic / Legendary

| Badge | Condition | Rarity |
|-------|-----------|--------|
| First Blood | Claim 1 drop | Common |
| Explorer | Claim 5 drops | Rare |
| Phantom Hunter | Claim 10 drops | Epic |
| Lich Lord | Claim 25 drops | Legendary |
| Gravedigger | Create 3 drops | Common |
| Haunter | Leave 5 ghost marks | Rare |
| Trail Walker | Complete a quest trail | Rare |
| Social Butterfly | Follow 5 explorers | Rare |
| Torque Loyalist | 7-day streak | Epic |
| Magic Hero | Master of quests | Legendary |
| Legend | Reach 200 reputation | Legendary |

**Leaderboard & Reputation**
- Score = Claims×10 + Created×5 + Likes×2
- Ranks: Lost Soul → Spirit → Wraith → Lich
- Global leaderboard

**Live Activity Feed**
- Collapsible panel on map (toggle via 📡 button)
- Tapestry social events: claims, new drops, follows, badge mints
- Auto-collapses when map is panned — clean exploration view

**Map UX**
- GPS icon always visible (top-left, color-coded by status)
- Hamburger menu ☰ holds Spectral Density stats, Demo Mode, Info/Jury docs
- Panels auto-close on map drag
- Demo Mode for judges without GPS in the field

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

## Tech Stack

| Layer | Tech |
|-------|------|
| Program | Pinocchio (zero-dep Solana framework) |
| Frontend | Next.js 14 + React 18 + TypeScript |
| Social | Tapestry Protocol |
| Music | Audius API |
| Wallet | @solana/wallet-adapter (Phantom, Solflare) |
| Map | Leaflet + react-leaflet + CARTO dark tiles |
| Styling | Tailwind CSS |
| Deploy | Vercel |

---

## Testing the App (for Judges)

**Demo Mode** bypasses GPS — full flow from your desk.

1. Open the app — 3-step welcome tour on first visit
2. Click the **GPS icon** (top-left) or enable **Demo Mode** via ☰ hamburger menu
3. Connect Phantom or Solflare — set to **Devnet**
4. Click a drop marker → walk close → claim it
5. Watch the **Claim Success Modal** — SOL counter animation, vault→wallet visualization, Solscan link
6. Tap **📡** (top-right) → open Live Feed and Nearby Explorers
7. Click an explorer → view profile → follow or DM
8. **Pink markers = Music Drops** → open one, hit play → streams from Audius
9. Tap **+** → create a drop, search for an Audius track by name, attach it
10. Go to **Quests** tab → start a trail → walk (or demo) waypoints
11. Go to **Profile** → see badges → mint an NFT badge
12. Go to **Rank** tab for the leaderboard

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

## Project Structure

```
src/
├── app/
│   ├── api/tapestry/route.ts        # Server proxy (handles CORS)
│   ├── api/audius/route.ts          # Audius search proxy
│   ├── api/actions/drop/route.ts    # Solana Actions / Blinks endpoint
│   ├── layout.tsx
│   ├── page.tsx                     # Main page — state + orchestration (~450 lines)
│   └── globals.css
├── components/
│   ├── MapView.tsx                  # Leaflet map + markers + popups + social bar
│   ├── MapOverlays.tsx              # GPS, hamburger menu, right panel, trail banner
│   ├── BottomNav.tsx                # Bottom tab navigation bar
│   ├── BadgeMintPopup.tsx           # Badge achievement mint modal
│   ├── FeedTab.tsx                  # Live social feed tab
│   ├── LeaderboardTab.tsx           # Leaderboard tab with hackathon banner
│   ├── ClaimSuccessModal.tsx        # Post-claim modal with SOL animation
│   ├── ActivityFeed.tsx             # Live Tapestry event feed
│   ├── ExplorerProfileModal.tsx     # Explorer profile with follow + DM
│   ├── NearbyExplorers.tsx          # Nearby players panel
│   ├── ProfilePanel.tsx             # Profile + SVG badges + reputation
│   ├── CreateDropModal.tsx          # Drop or Ghost Mark creation + Audius search
│   ├── InfoPanel.tsx                # In-app documentation + jury guide
│   ├── Leaderboard.tsx
│   ├── QuestTrails.tsx
│   ├── WelcomeOverlay.tsx
│   └── TxToast.tsx
├── hooks/
│   ├── useProgram.ts                # Solana program calls (Pinocchio + on-chain geofence)
│   ├── useTapestry.ts               # Tapestry API integration
│   ├── useGeolocation.ts            # GPS + IP fallback + Haversine proximity
│   └── useSound.ts
├── types/index.ts
└── utils/
    ├── storage.ts                   # localStorage helpers (SSR-safe)
    ├── mockData.ts                  # Global seeded drops, ghosts, trails, badges
    ├── config.ts                    # Solana cluster + program ID
    └── badgeIcons.tsx               # Custom SVG badge icons
```

---

## What's Next

ZK geofencing — upgrade the current on-chain Euclidean distance check to a ZK proof that verifies proximity without revealing exact coordinates. Ghost Chain — automatic Tapestry link between wallets that haunted the same location. Drops visible only to your followers. Multi-token rewards. Session keys for gasless onboarding. Seasonal city events with shared prize pools.

---

## Team

Solo dev. Built for the Graveyard Hackathon 2026.

## License

MIT
