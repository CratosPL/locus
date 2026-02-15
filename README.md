# 🪦 LOCUS — Geo-Social Dead Drops on Solana

> *Discover and claim location-based messages with SOL rewards.*

**Solana Graveyard Hackathon 2026**

## What is Locus?

Locus is a geo-social dApp where users **drop encrypted messages at real-world coordinates** with SOL bounties attached. Other users discover these "dead drops" on a map and **claim rewards by physically visiting the location** — all verified on-chain.

## On-chain Program

| | |
|---|---|
| **Program ID** | `HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn` |
| **Network** | Solana Devnet |
| **Framework** | Pinocchio (zero-dependency) |

### Architecture
```
Drop PDA:  seeds = ["drop",  drop_id_bytes]  → stores drop metadata
Vault PDA: seeds = ["vault", drop_id_bytes]  → holds SOL reward

Instructions:
  0x00 = CreateDrop(lat, lng, reward, message)
  0x01 = ClaimDrop(drop_id)
```

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Tech Stack

- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Blockchain:** Solana (devnet) + Pinocchio program
- **Wallet:** @solana/wallet-adapter (Phantom, Solflare)
- **Map:** Leaflet + react-leaflet (dark mode tiles)
- **Styling:** Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + wallet provider
│   ├── page.tsx            # Main page — map, drops, interactions
│   └── globals.css         # Global styles + leaflet overrides
├── components/
│   ├── AppWalletProvider   # Solana wallet context
│   ├── Header              # Logo + WalletMultiButton
│   ├── MapView             # Leaflet map with drop markers
│   ├── StatsBar            # Active drops, rewards, claims
│   ├── DropList            # List view of all drops
│   └── CreateDropModal     # Create new drop form
├── hooks/
│   └── useProgram.ts       # On-chain program interaction
├── types/
│   └── index.ts            # TypeScript interfaces
└── utils/
    └── mockData.ts         # Sample drops in Warsaw
```

## License

MIT — Built for Solana Graveyard Hackathon 2026
