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
  finderReward: number; // in SOL
  category: DropCategory;
  createdBy: string;
  createdAt: string;
  claimedBy?: string;
  claimedAt?: string;
}

export interface CategoryConfig {
  icon: string;
  color: string;
  label: string;
}

// ─── Solana Types (aligned with @solana/kit patterns) ────────────────────────

/** Branded Address type (matches @solana/kit Address) */
export type Address = string & { readonly __brand: unique symbol };

/** Branded Signature type */
export type Signature = string & { readonly __brand: unique symbol };

/** Result type following @solana/kit pattern */
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
