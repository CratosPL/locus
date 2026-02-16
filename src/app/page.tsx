"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import DropList from "@/components/DropList";
import CreateDropModal from "@/components/CreateDropModal";
import ProfilePanel from "@/components/ProfilePanel";
import Leaderboard from "@/components/Leaderboard";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import TxToast from "@/components/TxToast";
import { useProgram } from "@/hooks/useProgram";
import { useTapestry } from "@/hooks/useTapestry";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { MOCK_DROPS, CATEGORY_CONFIG } from "@/utils/mockData";
import type { Drop, DropCategory, Activity } from "@/types";

const MapView = dynamic(function() { return import("@/components/MapView"); }, {
  ssr: false,
  loading: function() {
    return (
      <div className="w-full h-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🗺️</div>
          <p className="text-crypt-300 font-mono text-sm animate-pulse">
            Summoning the map...
          </p>
        </div>
      </div>
    );
  },
});

type TabId = "map" | "list" | "leaderboard";

interface ToastData {
  id: number;
  message: string;
  signature?: string;
  type: "success" | "error" | "info";
}

function loadClaimedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    var saved = localStorage.getItem("locus_claimed");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function saveClaimedIds(ids: Set<string>) {
  try {
    localStorage.setItem("locus_claimed", JSON.stringify(Array.from(ids)));
  } catch {}
}

function loadExtraDrops(): Drop[] {
  if (typeof window === "undefined") return [];
  try {
    var saved = localStorage.getItem("locus_extra_drops");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveExtraDrops(drops: Drop[]) {
  try {
    localStorage.setItem("locus_extra_drops", JSON.stringify(drops));
  } catch {}
}

export default function HomePage() {
  // ─── State ──────────────────────────────────────────────────────────────
  var [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  var [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  var [extraDrops, setExtraDrops] = useState<Drop[]>([]);
  var [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  var [activeTab, setActiveTab] = useState<TabId>("map");
  var [flyTrigger, setFlyTrigger] = useState(0);
  var [showConfetti, setShowConfetti] = useState(false);
  var [showCreateModal, setShowCreateModal] = useState(false);
  var [showProfile, setShowProfile] = useState(false);
  var [showWelcome, setShowWelcome] = useState(true);
  var [createdCount, setCreatedCount] = useState(0);
  var [toasts, setToasts] = useState<ToastData[]>([]);
  var [activities, setActivities] = useState<Activity[]>([
    { icon: "🪦", text: "lich.sol dropped treasure near Łazienki", color: "#34d399", timestamp: Date.now() - 60000 },
    { icon: "⚡", text: "shade.sol created a ritual drop", color: "#fbbf24", timestamp: Date.now() - 120000 },
  ]);

  // Load persisted state
  useEffect(function() {
    setClaimedIds(loadClaimedIds());
    var savedDrops = loadExtraDrops();
    setExtraDrops(savedDrops);
    setCreatedCount(savedDrops.length);
    try {
      var savedLikes = localStorage.getItem("locus_likes");
      if (savedLikes) setLikedIds(new Set(JSON.parse(savedLikes)));
    } catch {}
  }, []);

  // Auto-remove old activities
  useEffect(function() {
    if (activities.length <= 3) return;
    var timer = setTimeout(function() {
      setActivities(function(prev) { return prev.slice(0, 5); });
    }, 10000);
    return function() { clearTimeout(timer); };
  }, [activities.length]);

  // Build drops array
  var drops = MOCK_DROPS.concat(extraDrops).map(function(d) {
    return {
      ...d,
      isClaimed: d.isClaimed || claimedIds.has(d.id),
    };
  });

  // ─── Hooks ──────────────────────────────────────────────────────────────
  var {
    claimDrop: claimDropOnChain,
    createDrop: createDropOnChain,
    isProcessing,
    isConnected,
    walletAddress,
  } = useProgram();

  var {
    profile,
    isConfigured: tapestryConfigured,
    findOrCreateProfile,
    registerDropAsContent,
    likeDrop,
    commentOnDrop,
  } = useTapestry();

  var {
    position: userPosition,
    demoMode,
    setDemoMode,
    isNearby,
    distanceTo,
    formatDistance,
    requestLocation,
    status: geoStatus,
  } = useGeolocation();

  var { setVisible: setWalletModalVisible } = useWalletModal();

  var handleConnectWallet = useCallback(function() {
    setWalletModalVisible(true);
  }, [setWalletModalVisible]);

  // ─── Toast helper ──────────────────────────────────────────────────────
  var showToast = useCallback(function(message: string, type: "success" | "error" | "info", signature?: string) {
    var id = Date.now();
    setToasts(function(prev) { return prev.concat([{ id: id, message: message, type: type, signature: signature }]); });
  }, []);

  var removeToast = useCallback(function(id: number) {
    setToasts(function(prev) { return prev.filter(function(t) { return t.id !== id; }); });
  }, []);

  // ─── Auto-create Tapestry profile ──────────────────────────────────────
  useEffect(function() {
    if (isConnected && walletAddress && !profile) {
      findOrCreateProfile();
    }
  }, [isConnected, walletAddress, profile, findOrCreateProfile]);

  // ─── Claim Handler ─────────────────────────────────────────────────────
  var handleClaim = useCallback(
    async function(dropId: string) {
      var drop = drops.find(function(d) { return d.id === dropId; });
      if (!drop) return;

      // Can't claim your own drop
      var myName = profile?.username ? "@" + profile.username : walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "";
      if (myName && drop.createdBy === myName) {
        showToast("Can't claim your own drop!", "error");
        return;
      }

      // Already claimed
      if (claimedIds.has(dropId)) {
        showToast("Already claimed!", "info");
        return;
      }

      var dropReward = drop.finderReward;
      var dropLat = drop.location.lat;
      var dropLng = drop.location.lng;

      if (!isNearby(dropLat, dropLng)) {
        var dist = formatDistance(dropLat, dropLng);
        showToast("Too far! " + dist, "info");
        return;
      }

      var result = await claimDropOnChain(dropId);

      if (result.ok) {
        var newClaimed = new Set(claimedIds);
        newClaimed.add(dropId);
        setClaimedIds(newClaimed);
        saveClaimedIds(newClaimed);

        showToast("Drop claimed! +" + dropReward + " SOL", "success", result.value);

        // Confetti celebration
        setShowConfetti(true);
        setTimeout(function() { setShowConfetti(false); }, 2000);

        setActivities(function(prev) {
          return [{ icon: "⚡", text: "Claimed " + dropReward + "◎ drop!", color: "#34d399", timestamp: Date.now() }].concat(prev);
        });
        setSelectedDrop(null);
      } else {
        showToast("Claim failed: " + result.error.message, "error");
      }
    },
    [claimDropOnChain, drops, claimedIds, isNearby, formatDistance, showToast, profile, walletAddress]
  );

  // ─── Create Drop Handler ──────────────────────────────────────────────
  var handleCreateDrop = useCallback(
    async function(data: { message: string; reward: number; category: DropCategory }) {
      // ─── Anti-spam: max 5 active drops per wallet ──────────────
      var myDrops = extraDrops.filter(function(d) { return !d.isClaimed; });
      if (myDrops.length >= 5) {
        showToast("Max 5 active drops per wallet", "error");
        return;
      }

      // ─── Anti-spam: 60s cooldown ──────────────────────────────
      var lastDrop = extraDrops[extraDrops.length - 1];
      if (lastDrop) {
        var lastTime = new Date(lastDrop.createdAt).getTime();
        var now = Date.now();
        // createdAt is date-only string, so check localStorage for precise time
        try {
          var lastDropTime = parseInt(localStorage.getItem("locus_last_drop_time") || "0");
          if (now - lastDropTime < 60000) {
            var wait = Math.ceil((60000 - (now - lastDropTime)) / 1000);
            showToast("Cooldown: wait " + wait + "s", "info");
            return;
          }
        } catch {}
      }

      // ─── Anti-spam: minimum reward ────────────────────────────
      if (data.reward < 0.01) {
        showToast("Minimum reward: 0.01 SOL", "error");
        return;
      }

      var lat = userPosition ? userPosition.lat : 52.2297 + (Math.random() - 0.5) * 0.01;
      var lng = userPosition ? userPosition.lng : 21.0122 + (Math.random() - 0.5) * 0.01;

      var result = await createDropOnChain(data.message, lat, lng, data.reward);

      if (result.ok) {
        var newDropId = "drop-" + Date.now();
        var creatorName = profile?.username
          ? "@" + profile.username
          : walletAddress
            ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)
            : "anon.sol";

        var newDrop: Drop = {
          id: newDropId,
          location: { lat: lat, lng: lng },
          message: data.message,
          isClaimed: false,
          finderReward: data.reward,
          category: data.category,
          createdBy: creatorName,
          createdAt: new Date().toISOString().split("T")[0],
        };

        try { localStorage.setItem("locus_last_drop_time", String(Date.now())); } catch {}

        setExtraDrops(function(prev) {
          var updated = prev.concat([newDrop]);
          saveExtraDrops(updated);
          return updated;
        });
        setCreatedCount(function(c) { return c + 1; });

        await registerDropAsContent(newDropId, data.message);

        var cat = CATEGORY_CONFIG[data.category];
        showToast("Drop created! " + cat.icon + " " + data.reward + " SOL", "success", result.value);

        setActivities(function(prev) {
          return [{ icon: "🪦", text: "Dropped " + cat.label.toLowerCase() + " at your location", color: cat.color, timestamp: Date.now() }].concat(prev);
        });
      } else {
        showToast("Create failed", "error");
      }
    },
    [createDropOnChain, userPosition, walletAddress, profile, registerDropAsContent, showToast, extraDrops]
  );

  // ─── Like Handler ──────────────────────────────────────────────────────
  var handleLike = useCallback(
    async function(dropId: string) {
      if (!isConnected || likedIds.has(dropId)) return;
      var success = await likeDrop(dropId);
      if (success) {
        var newLikes = new Set(likedIds);
        newLikes.add(dropId);
        setLikedIds(newLikes);
        try {
          localStorage.setItem("locus_likes", JSON.stringify(Array.from(newLikes)));
        } catch {}
        setActivities(function(prev) {
          return [{ icon: "❤️", text: "Liked a drop", color: "#f472b6", timestamp: Date.now() }].concat(prev);
        });
      }
    },
    [isConnected, likeDrop, likedIds]
  );

  // ─── Comment Handler ───────────────────────────────────────────────────
  var handleComment = useCallback(
    async function(dropId: string, text: string) {
      if (!isConnected || !text.trim()) return;
      var comment = await commentOnDrop(dropId, text);
      if (comment) {
        var preview = text.length > 30 ? text.slice(0, 30) + "..." : text;
        setActivities(function(prev) {
          return [{ icon: "💬", text: '"' + preview + '"', color: "#60a5fa", timestamp: Date.now() }].concat(prev);
        });
      }
    },
    [isConnected, commentOnDrop]
  );

  var handleSelectDropFromList = useCallback(function(drop: Drop) {
    setSelectedDrop(drop);
    setActiveTab("map");
  }, []);

  var claimedCount = claimedIds.size;
  var likesCount = likedIds.size;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[100dvh] bg-void overflow-hidden">
      {/* Welcome overlay */}
      {showWelcome && (
        <WelcomeOverlay onDismiss={function() { setShowWelcome(false); }} />
      )}

      {/* Tx Toast notifications */}
      {toasts.map(function(toast) {
        return (
          <TxToast
            key={toast.id}
            message={toast.message}
            signature={toast.signature}
            type={toast.type}
            onDismiss={function() { removeToast(toast.id); }}
          />
        );
      })}

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
              onConnectWallet={handleConnectWallet}
              likedIds={likedIds}
              userPosition={userPosition}
              demoMode={demoMode}
              formatDistance={formatDistance}
              isNearby={isNearby}
              flyTrigger={flyTrigger}
            />

            {/* Explore hint — GPS on, no drops in range */}
            {geoStatus === "active" && userPosition && (function() {
              var nearbyDrops = drops.filter(function(d) {
                return !d.isClaimed && isNearby(d.location.lat, d.location.lng);
              });
              if (nearbyDrops.length > 0) return null;
              var unclaimed = drops.filter(function(d) { return !d.isClaimed; });
              var distances = unclaimed.map(function(d) {
                var dist = distanceTo(d.location.lat, d.location.lng);
                return dist !== null ? dist : Infinity;
              }).sort(function(a, b) { return a - b; });
              var nearest = distances[0];
              return (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] w-72">
                  <div className="px-4 py-3 rounded-2xl bg-void/90 backdrop-blur-xl border border-crypt-300/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-center">
                    <div className="text-2xl mb-1">🧭</div>
                    <div className="text-[11px] font-mono text-crypt-200 font-bold">No drops in range</div>
                    {nearest && nearest < Infinity ? (
                      <div className="text-[10px] font-mono text-gray-500 mt-1">
                        Nearest drop is {nearest < 1000 ? Math.round(nearest) + "m" : (nearest / 1000).toFixed(1) + "km"} away — keep exploring!
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-gray-500 mt-1">
                        Be the first to drop a secret here
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Activity feed */}
            {activities.length > 0 && (
              <div className="absolute top-14 right-3 z-[1000] w-52 flex flex-col gap-1.5 pointer-events-none">
                {activities.slice(0, 3).map(function(a, i) {
                  return (
                    <div
                      key={a.timestamp + "-" + i}
                      className="px-3 py-2 rounded-lg bg-void-100/90 border border-crypt-300/10 text-[11px] font-mono text-gray-500 animate-fade-in backdrop-blur"
                    >
                      <span style={{ color: a.color }}>{a.icon}</span> {a.text}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info overlay */}
            <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5">
              <div className="px-3 py-1.5 rounded-lg bg-void/80 backdrop-blur border border-crypt-300/10 font-mono text-[10px] text-gray-600 tracking-wider">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {drops.filter(function(d) { return !d.isClaimed; }).length} active drops
                  </span>
                </div>
                {/* Nearby drops indicator */}
                {userPosition && (function() {
                  var unclaimed = drops.filter(function(d) { return !d.isClaimed; });
                  var nearbyCount = unclaimed.filter(function(d) { return isNearby(d.location.lat, d.location.lng); }).length;
                  var distances = unclaimed.map(function(d) {
                    var dist = distanceTo(d.location.lat, d.location.lng);
                    return dist !== null ? dist : Infinity;
                  }).sort(function(a, b) { return a - b; });
                  var nearest = distances[0];
                  return (
                    <div className="mt-1 pt-1 border-t border-crypt-300/10">
                      {nearbyCount > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <span className="text-[10px]">⚡</span>
                          <span>{nearbyCount} in range!</span>
                        </div>
                      ) : nearest && nearest < Infinity ? (
                        <div className="flex items-center gap-1.5 text-yellow-500/80">
                          <span className="text-[10px]">→</span>
                          <span>Nearest: {nearest < 1000 ? Math.round(nearest) + "m" : (nearest / 1000).toFixed(1) + "km"}</span>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
                {profile && (
                  <div className="text-[9px] text-crypt-300 mt-0.5">
                    @{profile.username}
                  </div>
                )}
              </div>

              <button
                onClick={function() {
                  if (geoStatus === "active") {
                    // Re-center map on current position
                    setFlyTrigger(Date.now());
                  } else if (geoStatus === "idle" || geoStatus === "error") {
                    requestLocation();
                  }
                }}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur border transition-colors cursor-pointer " + (
                  geoStatus === "active"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : geoStatus === "requesting"
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                      : geoStatus === "denied"
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                )}
              >
                <span className="text-[10px] font-mono font-bold">
                  {geoStatus === "active"
                    ? (userPosition && userPosition.source === "ip"
                        ? "📍 ~IP loc"
                        : "📍 GPS " + (userPosition ? Math.round(userPosition.accuracy) + "m" : ""))
                    : geoStatus === "requesting"
                      ? "📍 Locating..."
                      : geoStatus === "denied"
                        ? "📍 GPS Denied"
                        : "📍 Enable GPS"}
                </span>
              </button>

              <button
                onClick={function() { setDemoMode(!demoMode); }}
                className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg backdrop-blur border transition-colors cursor-pointer " + (
                  demoMode
                    ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                    : "bg-void/80 border-crypt-300/10 text-gray-600"
                )}
              >
                <span className="text-[10px] font-mono">
                  {demoMode ? "🔓 Demo ON" : "🔓 Demo"}
                </span>
              </button>
            </div>
          </>
        ) : activeTab === "list" ? (
          <DropList
            drops={drops}
            onSelectDrop={handleSelectDropFromList}
            formatDistance={formatDistance}
          />
        ) : (
          <Leaderboard
            currentUser={profile ? profile.username : undefined}
            currentStats={{ claimed: claimedCount, created: createdCount, likes: likesCount }}
          />
        )}
      </div>

      {/* Bottom nav */}
      <nav className="flex justify-around items-center py-2.5 bg-void-100/95 border-t border-crypt-300/10 z-50 relative backdrop-blur-xl shrink-0" style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}>
        {([
          { id: "map" as TabId, icon: "🗺️", label: "Map" },
          { id: "list" as TabId, icon: "📜", label: "Drops" },
          { id: "leaderboard" as TabId, icon: "🏆", label: "Rank" },
        ]).map(function(tab) {
          return (
            <button
              key={tab.id}
              onClick={function() { setActiveTab(tab.id); }}
              className={"flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-wider transition-colors px-5 py-1 " + (
                activeTab === tab.id ? "text-crypt-300" : "text-gray-600"
              )}
            >
              <span className="text-xl">{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}

        {isConnected ? (
          <button
            onClick={function() { setShowCreateModal(true); }}
            className="w-12 h-12 rounded-full border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white text-2xl cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(167,139,250,0.4)] -mt-6 hover:from-crypt-400 hover:to-crypt-600 transition-all active:scale-95"
          >
            +
          </button>
        ) : (
          <button
            onClick={handleConnectWallet}
            className="px-4 py-2.5 rounded-full border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white text-[11px] font-mono font-bold cursor-pointer flex items-center justify-center shadow-[0_4px_20px_rgba(167,139,250,0.4)] -mt-4 hover:from-crypt-400 hover:to-crypt-600 transition-all active:scale-95 tracking-wider"
          >
            🔗 Connect
          </button>
        )}

        <button
          onClick={function() { if (isConnected) setShowProfile(true); else handleConnectWallet(); }}
          className={"flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-wider px-5 py-1 transition-colors " + (
            isConnected ? "text-gray-600 hover:text-crypt-300" : "text-gray-600"
          )}
        >
          <span className="text-xl">👤</span>
          {isConnected ? "Profile" : "Login"}
        </button>
      </nav>

      {showCreateModal && (
        <CreateDropModal
          onClose={function() { setShowCreateModal(false); }}
          onCreate={handleCreateDrop}
          userPosition={userPosition}
        />
      )}

      <ProfilePanel
        profile={profile}
        stats={{ claimed: claimedCount, created: createdCount, likes: likesCount }}
        isOpen={showProfile}
        onClose={function() { setShowProfile(false); }}
        tapestryConfigured={tapestryConfigured}
      />

      <div className="fixed bottom-16 right-3 px-2.5 py-1 rounded-full bg-void-100/90 border border-crypt-300/15 text-[9px] text-gray-600 font-mono z-50 tracking-wider">
        ⛓ Solana Devnet • Graveyard 2026
      </div>

      {/* Claim celebration */}
      {showConfetti && (
        <>
          <div className="claim-flash" />
          <div className="confetti-container">
            {Array.from({ length: 40 }).map(function(_, i) {
              var colors = ["#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#60a5fa", "#fff"];
              var color = colors[i % colors.length];
              var left = 20 + Math.random() * 60;
              var delay = Math.random() * 0.4;
              var size = 4 + Math.random() * 8;
              var dx = (Math.random() - 0.5) * 60;
              return (
                <div
                  key={"conf-" + i}
                  className="confetti-particle"
                  style={{
                    left: left + "%",
                    width: size + "px",
                    height: size + "px",
                    background: color,
                    borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                    animationDelay: delay + "s",
                    animationDuration: (1 + Math.random()) + "s",
                    transform: "translateX(" + dx + "vw)",
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
