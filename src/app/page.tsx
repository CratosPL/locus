"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import DropList from "@/components/DropList";
import CreateDropModal from "@/components/CreateDropModal";
import ProfilePanel from "@/components/ProfilePanel";
import { useProgram } from "@/hooks/useProgram";
import { useTapestry } from "@/hooks/useTapestry";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MOCK_DROPS, CATEGORY_CONFIG } from "@/utils/mockData";
import type { Drop, DropCategory, Activity } from "@/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-void">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-bounce">🗺️</div>
        <p className="text-crypt-300 font-mono text-sm animate-pulse">
          Summoning the map...
        </p>
      </div>
    </div>
  ),
});

type TabId = "map" | "list";

// Persist claimed drops across refreshes
function loadClaimedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("locus_claimed");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function saveClaimedIds(ids: Set<string>) {
  try {
    localStorage.setItem("locus_claimed", JSON.stringify([...ids]));
  } catch {}
}

export default function HomePage() {
  // ─── Persistent claimed state ───────────────────────────────────────────
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    setClaimedIds(loadClaimedIds());
    try {
      const savedLikes = localStorage.getItem("locus_likes");
      if (savedLikes) setLikedIds(new Set(JSON.parse(savedLikes)));
    } catch {}
  }, []);

  // Apply claimed state to drops
  const [extraDrops, setExtraDrops] = useState<Drop[]>([]);
  const drops = [...MOCK_DROPS, ...extraDrops].map((d) => ({
    ...d,
    isClaimed: d.isClaimed || claimedIds.has(d.id),
  }));

  // ─── UI State ───────────────────────────────────────────────────────────
  const [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("map");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [createdCount, setCreatedCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([
    {
      icon: "🪦",
      text: "lich.sol dropped treasure near Łazienki",
      color: "#34d399",
      timestamp: Date.now() - 60000,
    },
    {
      icon: "⚡",
      text: "shade.sol created a ritual drop",
      color: "#fbbf24",
      timestamp: Date.now() - 120000,
    },
  ]);

  // ─── Hooks ──────────────────────────────────────────────────────────────
  const {
    claimDrop: claimDropOnChain,
    createDrop: createDropOnChain,
    isProcessing,
    isConnected,
    walletAddress,
    programId,
  } = useProgram();

  const {
    profile,
    isConfigured: tapestryConfigured,
    findOrCreateProfile,
    registerDropAsContent,
    likeDrop,
    commentOnDrop,
  } = useTapestry();

  const {
    position: userPosition,
    demoMode,
    setDemoMode,
    isNearby,
    formatDistance,
  } = useGeolocation();

  // ─── Auto-create Tapestry profile on wallet connect ────────────────────
  useEffect(() => {
    if (isConnected && walletAddress && !profile) {
      findOrCreateProfile();
    }
  }, [isConnected, walletAddress, profile, findOrCreateProfile]);

  // ─── Claim Handler (with geo-check) ────────────────────────────────────
  const handleClaim = useCallback(
    async (dropId: string) => {
      const drop = drops.find((d) => d.id === dropId);
      if (!drop) return;

      // Geo-check: must be within 150m (or demo mode)
      if (!isNearby(drop.location.lat, drop.location.lng)) {
        const dist = formatDistance(drop.location.lat, drop.location.lng);
        setActivities((prev) => [
          {
            icon: "📍",
            text: `Too far to claim! ${dist}`,
            color: "#ef4444",
            timestamp: Date.now(),
          },
          ...prev,
        ]);
        return;
      }

      const result = await claimDropOnChain(dropId);

      if (result.ok) {
        // Persist claim
        const newClaimed = new Set(claimedIds);
        newClaimed.add(dropId);
        setClaimedIds(newClaimed);
        saveClaimedIds(newClaimed);

        setActivities((prev) => [
          {
            icon: "⚡",
            text: `Claimed ${drop.finderReward}◎ drop!`,
            color: "#34d399",
            timestamp: Date.now(),
          },
          ...prev,
        ]);
        setSelectedDrop(null);
      } else {
        setActivities((prev) => [
          {
            icon: "❌",
            text: `Claim failed: ${result.error.message}`,
            color: "#ef4444",
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    },
    [claimDropOnChain, drops, claimedIds, isNearby, formatDistance]
  );

  // ─── Create Drop Handler (at user's location) ─────────────────────────
  const handleCreateDrop = useCallback(
    async (data: {
      message: string;
      reward: number;
      category: DropCategory;
    }) => {
      // Use real GPS if available, otherwise Warsaw center + offset
      const lat = userPosition
        ? userPosition.lat
        : 52.2297 + (Math.random() - 0.5) * 0.01;
      const lng = userPosition
        ? userPosition.lng
        : 21.0122 + (Math.random() - 0.5) * 0.01;

      const result = await createDropOnChain(
        data.message,
        lat,
        lng,
        data.reward
      );

      if (result.ok) {
        const newDropId = `drop-${Date.now()}`;
        const newDrop: Drop = {
          id: newDropId,
          location: { lat, lng },
          message: data.message,
          isClaimed: false,
          finderReward: data.reward,
          category: data.category,
          createdBy: profile?.username
            ? `@${profile.username}`
            : walletAddress
              ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`
              : "anon.sol",
          createdAt: new Date().toISOString().split("T")[0],
        };
        setExtraDrops((prev) => [...prev, newDrop]);
        setCreatedCount((c) => c + 1);

        // Register on Tapestry
        await registerDropAsContent(newDropId, data.message);

        const cat = CATEGORY_CONFIG[data.category];
        setActivities((prev) => [
          {
            icon: "🪦",
            text: `Dropped ${cat.label.toLowerCase()} at your location`,
            color: cat.color,
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    },
    [createDropOnChain, userPosition, walletAddress, profile, registerDropAsContent]
  );

  // ─── Like Handler (Tapestry) ───────────────────────────────────────────
  const handleLike = useCallback(
    async (dropId: string) => {
      if (!isConnected || likedIds.has(dropId)) return;
      const success = await likeDrop(dropId);
      if (success) {
        const newLikes = new Set(likedIds);
        newLikes.add(dropId);
        setLikedIds(newLikes);
        try {
          localStorage.setItem("locus_likes", JSON.stringify([...newLikes]));
        } catch {}
        setActivities((prev) => [
          {
            icon: "❤️",
            text: `Liked a drop`,
            color: "#f472b6",
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    },
    [isConnected, likeDrop, likedIds]
  );

  // ─── Comment Handler (Tapestry) ────────────────────────────────────────
  const handleComment = useCallback(
    async (dropId: string, text: string) => {
      if (!isConnected || !text.trim()) return;
      const comment = await commentOnDrop(dropId, text);
      if (comment) {
        setActivities((prev) => [
          {
            icon: "💬",
            text: `"${text.slice(0, 30)}${text.length > 30 ? "..." : ""}"`,
            color: "#60a5fa",
            timestamp: Date.now(),
          },
          ...prev,
        ]);
      }
    },
    [isConnected, commentOnDrop]
  );

  const handleSelectDropFromList = useCallback((drop: Drop) => {
    setSelectedDrop(drop);
    setActiveTab("map");
  }, []);

  const claimedCount = claimedIds.size;
  const likesCount = likedIds.size;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-void overflow-hidden">
      <Header />
      <StatsBar drops={drops} claimedCount={claimedCount} />

      <div className="flex-1 relative overflow-hidden">
        {activeTab === "map" ? (
          <>
            <MapView
              drops={drops}
              selectedDrop={selectedDrop}
              onSelectDrop={setSelectedDrop}
              isConnected={isConnected}
              isProcessing={isProcessing}
              onClaim={handleClaim}
              onLike={handleLike}
              onComment={handleComment}
              likedIds={likedIds}
              userPosition={userPosition}
              demoMode={demoMode}
              formatDistance={formatDistance}
              isNearby={isNearby}
            />

            {/* Activity feed overlay */}
            {activities.length > 0 && (
              <div className="absolute top-14 right-3 z-[1000] w-52 flex flex-col gap-1.5">
                {activities.slice(0, 3).map((a, i) => (
                  <div
                    key={`${a.timestamp}-${i}`}
                    className="px-3 py-2 rounded-lg bg-void-100/90 border border-crypt-300/10 text-[11px] font-mono text-gray-500 animate-fade-in backdrop-blur"
                  >
                    <span style={{ color: a.color }}>{a.icon}</span> {a.text}
                  </div>
                ))}
              </div>
            )}

            {/* Info overlay (top left) */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-lg bg-void/80 backdrop-blur border border-crypt-300/10 font-mono text-[10px] text-gray-600 tracking-wider">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {drops.filter((d) => !d.isClaimed).length} active drops
                  </span>
                </div>
                {profile && (
                  <div className="text-[9px] text-crypt-300 mt-0.5">
                    @{profile.username}
                  </div>
                )}
              </div>

              {/* Demo mode toggle */}
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur border transition-colors cursor-pointer ${
                  demoMode
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-void/80 border-crypt-300/10 text-gray-600"
                }`}
              >
                <span className="text-[10px] font-mono">
                  {demoMode ? "📍 Demo Mode ON" : "📍 GPS Active"}
                </span>
              </button>
            </div>
          </>
        ) : (
          <DropList drops={drops} onSelectDrop={handleSelectDropFromList} />
        )}
      </div>

      {/* Bottom navigation */}
      <nav className="flex justify-around items-center py-2.5 bg-void-100/95 border-t border-crypt-300/10 z-50 relative backdrop-blur-xl">
        {(
          [
            { id: "map" as TabId, icon: "🗺️", label: "Map" },
            { id: "list" as TabId, icon: "📜", label: "Drops" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-wider transition-colors px-5 py-1 ${
              activeTab === tab.id ? "text-crypt-300" : "text-gray-600"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </button>
        ))}

        {isConnected && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-12 h-12 rounded-full border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white text-2xl cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(167,139,250,0.4)] -mt-6 hover:from-crypt-400 hover:to-crypt-600 transition-all active:scale-95"
          >
            +
          </button>
        )}

        <button
          onClick={() => isConnected && setShowProfile(true)}
          className={`flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-wider px-5 py-1 transition-colors ${
            isConnected ? "text-gray-600 hover:text-crypt-300" : "text-gray-800"
          }`}
        >
          <span className="text-xl">👤</span>
          Profile
        </button>
      </nav>

      {showCreateModal && (
        <CreateDropModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateDrop}
          userPosition={userPosition}
        />
      )}

      <ProfilePanel
        profile={profile}
        stats={{ claimed: claimedCount, created: createdCount, likes: likesCount }}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        tapestryConfigured={tapestryConfigured}
      />

      <div className="fixed bottom-16 right-3 px-2.5 py-1 rounded-full bg-void-100/90 border border-crypt-300/15 text-[9px] text-gray-600 font-mono z-50 tracking-wider">
        ⛓ Solana Devnet • Graveyard 2026
      </div>
    </div>
  );
}
