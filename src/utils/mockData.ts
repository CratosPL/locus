import { Drop, CategoryConfig, DropCategory } from "@/types";

export const CATEGORY_CONFIG: Record<DropCategory, CategoryConfig> = {
  lore: { icon: "👻", color: "#a78bfa", label: "Lore" },
  quest: { icon: "🔮", color: "#60a5fa", label: "Quest" },
  secret: { icon: "⚰️", color: "#f472b6", label: "Secret" },
  ritual: { icon: "🕯️", color: "#fbbf24", label: "Ritual" },
  treasure: { icon: "💀", color: "#34d399", label: "Treasure" },
};

export const MOCK_DROPS: Drop[] = [
  {
    id: "drop-1",
    location: { lat: 52.2297, lng: 21.0122 },
    message: "👻 First soul lost in the Old Town... the cobblestones remember.",
    isClaimed: false,
    finderReward: 0.05,
    category: "lore",
    createdBy: "phantom.sol",
    createdAt: "2026-02-12",
  },
  {
    id: "drop-2",
    location: { lat: 52.2319, lng: 21.0067 },
    message: "🔮 A forgotten oracle speaks beneath the Palace of Culture. Listen closely...",
    isClaimed: false,
    finderReward: 0.12,
    category: "quest",
    createdBy: "spectre.sol",
    createdAt: "2026-02-13",
  },
  {
    id: "drop-3",
    location: { lat: 52.235, lng: 21.0 },
    message: "⚰️ The coffin builder's secret recipe for digital immortality — now on-chain.",
    isClaimed: true,
    finderReward: 0.08,
    category: "secret",
    createdBy: "wraith.sol",
    createdAt: "2026-02-11",
    claimedBy: "finder.sol",
    claimedAt: "2026-02-12",
  },
  {
    id: "drop-4",
    location: { lat: 52.227, lng: 21.018 },
    message: "🕯️ Light a candle at the Vistula crossroads at midnight. The blockchain never forgets.",
    isClaimed: false,
    finderReward: 0.15,
    category: "ritual",
    createdBy: "shade.sol",
    createdAt: "2026-02-14",
  },
  {
    id: "drop-5",
    location: { lat: 52.24, lng: 20.995 },
    message: "💀 The necromancer's apprentice left coordinates here. Final destination: Łazienki Park.",
    isClaimed: false,
    finderReward: 0.25,
    category: "treasure",
    createdBy: "lich.sol",
    createdAt: "2026-02-12",
  },
  {
    id: "drop-6",
    location: { lat: 52.233, lng: 21.025 },
    message: "🌙 Moonlit whispers echo through the Praga district...",
    isClaimed: false,
    finderReward: 0.03,
    category: "lore",
    createdBy: "banshee.sol",
    createdAt: "2026-02-13",
  },
  {
    id: "drop-7",
    location: { lat: 52.22, lng: 21.01 },
    message: "🗝️ The key to the on-chain crypt is hidden in plain sight near Mokotów.",
    isClaimed: false,
    finderReward: 0.2,
    category: "quest",
    createdBy: "revenant.sol",
    createdAt: "2026-02-14",
  },
];

// Warsaw center coordinates for map initialization
export const WARSAW_CENTER = { lat: 52.2297, lng: 21.0122 };
export const DEFAULT_ZOOM = 14;
