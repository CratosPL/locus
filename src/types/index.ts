// ─── Core Types ──────────────────────────────────────────────────────────────

export interface GeoLocation {
  lat: number;
  lng: number;
}

export type DropCategory = "lore" | "quest" | "secret" | "ritual" | "treasure";

export interface Drop {
  id: string;
  location: GeoLocation;
  message: string;
  isClaimed: boolean;
  finderReward: number;
  category: DropCategory;
  createdBy: string;
  createdAt: string;
  claimedBy?: string;
  claimedAt?: string;
  twitterHandle?: string;
  externalLink?: string;
  dropType?: "crypto" | "memory";
  audiusTrackId?: string;
}

export interface CategoryConfig {
  icon: string;
  color: string;
  label: string;
}

// ─── Ghost Marks (ephemeral, free, no SOL) ───────────────────────────────────

export type GhostEmoji = "👻" | "💭" | "⚠️" | "📸" | "🎵" | "💀" | "🔥" | "❄️";

export interface GhostMark {
  id: string;
  location: GeoLocation;
  message: string;
  emoji: GhostEmoji;
  createdBy: string;
  createdAt: number; // timestamp for 24h expiry
  reactions: number;
}

// ─── Quest Trails ────────────────────────────────────────────────────────────

export interface QuestTrail {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  waypoints: TrailWaypoint[];
  reward: number;
  createdBy: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  distance: string;
}

export interface TrailWaypoint {
  id: string;
  location: GeoLocation;
  name: string;
  hint: string;
  order: number;
}

// ─── NFT Badges ──────────────────────────────────────────────────────────────

export interface NFTBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  thresholdType: "claims" | "creates" | "ghosts" | "trails" | "reputation";
  rarity: "common" | "rare" | "epic" | "legendary";
  color: string;
}

// ─── Solana Types ────────────────────────────────────────────────────────────

export type Address = string & { readonly __brand: unique symbol };
export type Signature = string & { readonly __brand: unique symbol };
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// ─── Activity Feed ───────────────────────────────────────────────────────────

export interface Activity {
  icon: string;
  text: string;
  color: string;
  timestamp: number;
}
