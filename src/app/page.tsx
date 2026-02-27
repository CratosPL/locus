"use client";

import React, { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import StatsBar from "@/components/StatsBar";
import DropList from "@/components/DropList";
import CreateDropModal from "@/components/CreateDropModal";
import ProfilePanel from "@/components/ProfilePanel";
import QuestTrails from "@/components/QuestTrails";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import TxToast from "@/components/TxToast";
import InfoPanel from "@/components/InfoPanel";
import ClaimSuccessModal from "@/components/ClaimSuccessModal";
import ExplorerProfileModal from "@/components/ExplorerProfileModal";
import BottomNav, { TabId } from "@/components/BottomNav";
import BadgeMintPopup from "@/components/BadgeMintPopup";
import MapOverlays from "@/components/MapOverlays";
import FeedTab from "@/components/FeedTab";
import LeaderboardTab from "@/components/LeaderboardTab";
import { NearbyExplorer } from "@/components/NearbyExplorers";
import { useProgram } from "@/hooks/useProgram";
import { useTapestry } from "@/hooks/useTapestry";
import { useSound } from "@/hooks/useSound";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { MOCK_DROPS, MOCK_GHOSTS, MOCK_TRAILS, CATEGORY_CONFIG, BADGE_DEFINITIONS } from "@/utils/mockData";
import { loadSet, saveSet, loadJSON, saveJSON } from "@/utils/storage";
import type { Drop, DropCategory, GhostMark, GhostEmoji, QuestTrail, Activity } from "@/types";
import { SOLANA_CLUSTER } from "@/utils/config";
import confetti from "canvas-confetti";

var MapView = dynamic(function () { return import("@/components/MapView"); }, {
  ssr: false,
  loading: function () {
    return (
      <div className="w-full h-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🗺️</div>
          <p className="text-crypt-300 font-mono text-sm animate-pulse">Summoning the map...</p>
        </div>
      </div>
    );
  },
});

interface ToastData {
  id: number; message: string; signature?: string; type: "success" | "error" | "info";
}

export default function HomePage() {
  // ─── State ──────────────────────────────────────────────────────────────
  var [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());
  var [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  var [extraDrops, setExtraDrops] = useState<Drop[]>([]);
  var [ghostMarks, setGhostMarks] = useState<GhostMark[]>([]);
  var [selectedDrop, setSelectedDrop] = useState<Drop | null>(null);
  var [activeTab, setActiveTab] = useState<TabId>("map");
  var [flyTrigger, setFlyTrigger] = useState(0);
  var [showCreateModal, setShowCreateModal] = useState(false);
  var [showProfile, setShowProfile] = useState(false);
  var [showWelcome, setShowWelcome] = useState(true);
  var [forceWelcome, setForceWelcome] = useState(false);
  var [showInfo, setShowInfo] = useState(false);
  var [soundEnabled, setSoundEnabled] = useState(true);
  var [createdCount, setCreatedCount] = useState(0);
  var [ghostCount, setGhostCount] = useState(0);
  var [toasts, setToasts] = useState<ToastData[]>([]);
  var [activities, setActivities] = useState<Activity[]>([
    { icon: "🪦", text: "lich.sol dropped treasure near Łazienki", color: "#34d399", timestamp: Date.now() - 60000 },
    { icon: "👻", text: "anon left a ghost mark in Old Town", color: "#8b5cf6", timestamp: Date.now() - 90000 },
  ]);

  // Trail state
  var [activeTrailId, setActiveTrailId] = useState<string | null>(null);
  var [trailProgress, setTrailProgress] = useState<Record<string, Set<string>>>({});
  var [completedTrails, setCompletedTrails] = useState(0);

  // Badge / modal state
  var [mintedBadges, setMintedBadges] = useState<Set<string>>(new Set());
  var [pendingBadge, setPendingBadge] = useState<string | null>(null);
  var [claimResult, setClaimResult] = useState<{ drop: Drop; signature: string } | null>(null);
  var [viewingExplorer, setViewingExplorer] = useState<NearbyExplorer | null>(null);
  var [showRightPanel, setShowRightPanel] = useState(false);
  var [showLeftMenu, setShowLeftMenu] = useState(false);
  var [pickingLocation, setPickingLocation] = useState(false);
  var [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  var [tapestryDrops, setTapestryDrops] = useState<Drop[]>([]);

  // ─── Persist / hydrate ──────────────────────────────────────────────────
  useEffect(function () {
    setClaimedIds(loadSet("locus_claimed"));
    setLikedIds(loadSet("locus_likes"));
    setMintedBadges(loadSet("locus_minted_badges"));

    var savedDrops = loadJSON<Drop[]>("locus_extra_drops", []);
    setExtraDrops(savedDrops);
    setCreatedCount(savedDrops.length);

    var savedGhosts = loadJSON<GhostMark[]>("locus_ghosts", []);
    var now = Date.now();
    var activeGhosts = savedGhosts.filter(function (g) { return now - g.createdAt < 86400000; });
    var allGhosts = MOCK_GHOSTS.filter(function (g) { return now - g.createdAt < 86400000; }).concat(activeGhosts);
    setGhostMarks(allGhosts);
    setGhostCount(activeGhosts.length);

    var savedProgress = loadJSON<Record<string, string[]>>("locus_trail_progress", {});
    var progressSets: Record<string, Set<string>> = {};
    Object.keys(savedProgress).forEach(function (k) { progressSets[k] = new Set(savedProgress[k]); });
    setTrailProgress(progressSets);

    var completed = 0;
    MOCK_TRAILS.forEach(function (trail) {
      var p = progressSets[trail.id];
      if (p && p.size >= trail.waypoints.length) completed++;
    });
    setCompletedTrails(completed);
  }, []);

  // Auto-trim activities
  useEffect(function () {
    if (activities.length <= 3) return;
    var timer = setTimeout(function () { setActivities(function (prev) { return prev.slice(0, 5); }); }, 10000);
    return function () { clearTimeout(timer); };
  }, [activities.length]);

  // Merged drops array — MOCK_DROPS + Tapestry (on-chain) + local (user-created this session)
  var drops = MOCK_DROPS.concat(tapestryDrops).concat(extraDrops).map(function (d) {
    return { ...d, isClaimed: d.isClaimed || claimedIds.has(d.id) };
  });
  // Deduplicate by id (local drops may overlap with Tapestry)
  var seen = new Set<string>();
  drops = drops.filter(function (d) {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  // ─── Hooks ──────────────────────────────────────────────────────────────
  var { claimDrop: claimDropOnChain, createDrop: createDropOnChain, fetchOnChainDrops, isProcessing, isConnected, walletAddress } = useProgram();
  var { profile, isConfigured: tapestryConfigured, findOrCreateProfile, registerDropAsContent, likeDrop, commentOnDrop, followUser } = useTapestry();
  var { position: userPosition, demoMode, setDemoMode, isNearby, distanceTo, formatDistance, requestLocation, status: geoStatus } = useGeolocation();
  var { setVisible: setWalletModalVisible } = useWalletModal();
  var { playSound } = useSound();

  var handleConnectWallet = useCallback(function () {
    if (soundEnabled) playSound("click");
    setWalletModalVisible(true);
  }, [setWalletModalVisible, playSound, soundEnabled]);

  var showToast = useCallback(function (message: string, type: "success" | "error" | "info", signature?: string) {
    var id = Date.now();
    if (soundEnabled) playSound("notification");
    setToasts(function (prev) { return prev.concat([{ id, message, type, signature }]); });
  }, [playSound, soundEnabled]);

  var removeToast = useCallback(function (id: number) {
    setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id; }); });
  }, []);

  var addActivity = useCallback(function (icon: string, text: string, color: string) {
    setActivities(function (prev) { return [{ icon, text, color, timestamp: Date.now() }].concat(prev); });
  }, []);

  // Auto-create Tapestry profile
  useEffect(function () {
    if (isConnected && walletAddress && !profile) findOrCreateProfile();
  }, [isConnected, walletAddress, profile, findOrCreateProfile]);

  // Fetch persistent drops from Solana on-chain program accounts
  useEffect(function () {
    fetchOnChainDrops().then(function (onChainDrops) {
      if (onChainDrops.length > 0) {
        console.log("[App] Loaded " + onChainDrops.length + " drops from Solana on-chain");
        var converted: Drop[] = onChainDrops.map(function (d) {
          return {
            id: d.id,
            location: { lat: d.lat, lng: d.lng },
            message: "On-chain drop",
            isClaimed: d.isClaimed,
            finderReward: d.reward,
            category: "lore" as DropCategory,
            createdBy: d.creator,
            createdAt: new Date().toISOString().split("T")[0],
            dropType: d.reward > 0 ? "crypto" : "memory",
          };
        });
        setTapestryDrops(converted);
      }
    });
  }, [fetchOnChainDrops]);

  // ─── Trail proximity check ─────────────────────────────────────────────
  useEffect(function () {
    if (!activeTrailId || !userPosition) return;
    var trail = MOCK_TRAILS.find(function (t) { return t.id === activeTrailId; });
    if (!trail) return;

    var currentProgress = trailProgress[activeTrailId] || new Set();
    var changed = false;

    trail.waypoints.forEach(function (wp) {
      if (!currentProgress.has(wp.id) && isNearby(wp.location.lat, wp.location.lng)) {
        currentProgress.add(wp.id);
        changed = true;
addActivity("🗺️", "Reached " + wp.name, trail!.color);
      }
    });

    if (changed) {
      var newProgress = { ...trailProgress, [activeTrailId]: currentProgress };
      setTrailProgress(newProgress);
      var toSave: Record<string, string[]> = {};
      Object.keys(newProgress).forEach(function (k) { toSave[k] = Array.from(newProgress[k]); });
      saveJSON("locus_trail_progress", toSave);

      if (currentProgress.size >= trail.waypoints.length) {
        showToast("🏆 Trail Complete! " + trail.name + " — +" + trail.reward + " SOL bonus!", "success");
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: [trail.color, "#ffffff", "#a78bfa"] });
        setCompletedTrails(function (c) { return c + 1; });
      }
    }
  }, [activeTrailId, userPosition]);

  // ─── Badge logic ───────────────────────────────────────────────────────
  var checkBadges = useCallback(function (stats: { claims: number; creates: number; ghosts: number; trails: number; rep: number }) {
    BADGE_DEFINITIONS.forEach(function (badge) {
      if (mintedBadges.has(badge.id)) return;
      var value = 0;
      if (badge.thresholdType === "claims") value = stats.claims;
      else if (badge.thresholdType === "creates") value = stats.creates;
      else if (badge.thresholdType === "ghosts") value = stats.ghosts;
      else if (badge.thresholdType === "trails") value = stats.trails;
      else if (badge.thresholdType === "reputation") value = stats.rep;
      if (value >= badge.threshold) {
        if (soundEnabled) playSound("level-up");
        setPendingBadge(badge.id);
      }
    });
  }, [mintedBadges]);

  var handleMintBadge = useCallback(async function (badgeId: string) {
    var badge = BADGE_DEFINITIONS.find(function (b) { return b.id === badgeId; });
    if (!badge) return;
    showToast("🏅 Minting NFT Badge: " + badge.name + "...", "info");
    try {
      if (isConnected && claimDropOnChain) await claimDropOnChain("mint_badge_" + badgeId);
    } catch (e) { console.warn("Wallet prompt failed, continuing with simulation", e); }
    setTimeout(function () {
      var newMinted = new Set(mintedBadges);
      newMinted.add(badgeId);
      setMintedBadges(newMinted);
      saveSet("locus_minted_badges", newMinted);
      setPendingBadge(null);
      showToast("🎉 NFT Badge Minted! " + badge!.name, "success", "MOCK_" + Date.now().toString(36));
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [badge!.color, "#ffffff", "#fbbf24"] });
    }, 1000);
  }, [mintedBadges, showToast, isConnected, claimDropOnChain]);

  // ─── Claim ─────────────────────────────────────────────────────────────
  var handleClaim = useCallback(async function (dropId: string) {
    var drop = drops.find(function (d) { return d.id === dropId; });
    if (!drop) return;
    var myName = profile?.username ? "@" + profile.username : walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "";
    if (myName && drop.createdBy === myName) { showToast("Can't claim your own drop!", "error"); return; }
    if (claimedIds.has(dropId)) { showToast("Already claimed!", "info"); return; }
    if (!isNearby(drop.location.lat, drop.location.lng)) { showToast("Too far! " + formatDistance(drop.location.lat, drop.location.lng), "info"); return; }

    var result = await claimDropOnChain(dropId, userPosition?.lat, userPosition?.lng);
    if (result.ok) {
      if (soundEnabled) playSound("claim");
      var newClaimed = new Set(claimedIds); newClaimed.add(dropId);
      setClaimedIds(newClaimed); saveSet("locus_claimed", newClaimed);
      setClaimResult({ drop, signature: result.value }); setSelectedDrop(null);
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#34d399", "#a78bfa", "#ffffff", "#fbbf24"] });
      addActivity("⚡", "You claimed " + drop.finderReward + "◎ drop!", "#34d399");
      var rep = newClaimed.size * 10 + createdCount * 5 + likedIds.size * 2;
      checkBadges({ claims: newClaimed.size, creates: createdCount, ghosts: ghostCount, trails: completedTrails, rep });
    } else {
      showToast("Claim failed: " + result.error.message, "error");
    }
  }, [claimDropOnChain, drops, claimedIds, isNearby, formatDistance, showToast, profile, walletAddress, checkBadges, createdCount, likedIds, ghostCount, completedTrails, userPosition]);

  // ─── Create Drop ───────────────────────────────────────────────────────
  var handleCreateDrop = useCallback(async function (data: {
    message: string; reward: number; category: DropCategory;
    twitterHandle?: string; externalLink?: string; dropType: "crypto" | "memory";
    audiusTrackId?: string; audiusTrackName?: string; audiusArtist?: string;
  }) {
    if (extraDrops.filter(function (d) { return !d.isClaimed; }).length >= 5) { showToast("Max 5 active drops per wallet", "error"); return; }
    try {
      var last = parseInt(localStorage.getItem("locus_last_drop_time") || "0");
      if (Date.now() - last < 60000) { showToast("Cooldown: wait " + Math.ceil((60000 - (Date.now() - last)) / 1000) + "s", "info"); return; }
    } catch {}
    if (data.dropType === "crypto" && data.reward < 0.01) { showToast("Minimum reward: 0.01 SOL", "error"); return; }

    var lat = pickedLocation ? pickedLocation.lat : userPosition ? userPosition.lat : 52.2297 + (Math.random() - 0.5) * 0.01;
    var lng = pickedLocation ? pickedLocation.lng : userPosition ? userPosition.lng : 21.0122 + (Math.random() - 0.5) * 0.01;
    var result = await createDropOnChain(data.message, lat, lng, data.reward);

    if (result.ok) {
      setPickedLocation(null);
      var name = profile?.username ? "@" + profile.username : walletAddress ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4) : "anon.sol";
      var newDrop: Drop = {
        id: "drop-" + Date.now(), location: { lat, lng }, message: data.message,
        isClaimed: false, finderReward: data.reward, category: data.category,
        createdBy: name, createdAt: new Date().toISOString().split("T")[0],
        twitterHandle: data.twitterHandle, externalLink: data.externalLink,
        dropType: data.dropType, audiusTrackId: data.audiusTrackId,
        audiusTrackName: data.audiusTrackName, audiusArtist: data.audiusArtist,
      };
      try { localStorage.setItem("locus_last_drop_time", String(Date.now())); } catch {}
      setExtraDrops(function (prev) { var updated = prev.concat([newDrop]); saveJSON("locus_extra_drops", updated); return updated; });
      setCreatedCount(function (c) { return c + 1; });
      await registerDropAsContent(newDrop.id, data.message, { lat, lng }, {
        twitter: data.twitterHandle, link: data.externalLink,
        type: data.dropType === "memory" ? "memory-drop" : "geo-drop",
        reward: data.reward, category: data.category,
        audiusTrackId: data.audiusTrackId, audiusTrackName: data.audiusTrackName, audiusArtist: data.audiusArtist,
      });
      var cat = CATEGORY_CONFIG[data.category];
      if (soundEnabled) playSound("success");
      showToast("Drop created! " + cat.icon + " " + (data.dropType === "memory" ? "Memory recorded" : data.reward + " SOL"), "success", result.value);
      addActivity("🪦", "Dropped " + cat.label.toLowerCase() + " at your location", cat.color);
    } else { showToast("Create failed", "error"); }
  }, [createDropOnChain, userPosition, walletAddress, profile, registerDropAsContent, showToast, extraDrops, pickedLocation, soundEnabled, playSound, addActivity]);

  // ─── Ghost Mark ────────────────────────────────────────────────────────
  var handleCreateGhost = useCallback(function (data: { message: string; emoji: GhostEmoji }) {
    var lat = pickedLocation ? pickedLocation.lat : userPosition ? userPosition.lat : 52.2297 + (Math.random() - 0.5) * 0.01;
    var lng = pickedLocation ? pickedLocation.lng : userPosition ? userPosition.lng : 21.0122 + (Math.random() - 0.5) * 0.01;
    setPickedLocation(null);
    var ghost: GhostMark = { id: "ghost-" + Date.now(), location: { lat, lng }, message: data.message, emoji: data.emoji, createdBy: profile?.username ? "@" + profile.username : "anon", createdAt: Date.now(), reactions: 0 };
    setGhostMarks(function (prev) { var updated = prev.concat([ghost]); saveJSON("locus_ghosts", updated.filter(function (g) { return g.id.startsWith("ghost-"); })); return updated; });
    setGhostCount(function (c) { return c + 1; });
    if (soundEnabled) playSound("ghost");
    showToast("👻 Ghost mark left!", "success");
    addActivity("👻", "Left a ghost mark " + data.emoji, "#8b5cf6");
    var rep = claimedIds.size * 10 + createdCount * 5 + likedIds.size * 2;
    checkBadges({ claims: claimedIds.size, creates: createdCount, ghosts: ghostCount + 1, trails: completedTrails, rep });
  }, [userPosition, profile, showToast, ghostCount, claimedIds, createdCount, likedIds, completedTrails, checkBadges, pickedLocation, soundEnabled, playSound, addActivity]);

  var handleReactGhost = useCallback(function (ghostId: string) {
    if (soundEnabled) playSound("click");
    setGhostMarks(function (prev) { return prev.map(function (g) { return g.id === ghostId ? { ...g, reactions: g.reactions + 1 } : g; }); });
  }, [playSound]);

  // ─── Social handlers ───────────────────────────────────────────────────
  var handleLike = useCallback(async function (dropId: string) {
    if (!isConnected || likedIds.has(dropId)) return;
    if (await likeDrop(dropId)) {
      var newLikes = new Set(likedIds); newLikes.add(dropId);
      setLikedIds(newLikes); saveSet("locus_likes", newLikes);
      addActivity("❤️", "Liked a drop", "#f472b6");
    }
  }, [isConnected, likeDrop, likedIds]);

  var handleFollow = useCallback(async function (username: string) {
    if (!isConnected) { handleConnectWallet(); return false; }
    if (await followUser(username)) {
      showToast("Following @" + username, "success");
      addActivity("👤", "Followed @" + username, "#a78bfa");
      return true;
    }
    showToast("Follow failed", "error"); return false;
  }, [isConnected, followUser, handleConnectWallet, showToast]);

  var handleComment = useCallback(async function (dropId: string, text: string) {
    if (!isConnected || !text.trim()) return;
    if (await commentOnDrop(dropId, text)) {
      addActivity("💬", '"' + (text.length > 30 ? text.slice(0, 30) + "..." : text) + '"', "#60a5fa");
    }
  }, [isConnected, commentOnDrop]);

  var handleSendMessage = useCallback(function (username: string, _message: string) {
    showToast("Message sent to @" + username + " via Tapestry", "success");
    addActivity("💬", "You messaged @" + username, "#60a5fa");
  }, [showToast]);

  // ─── Trail handlers ────────────────────────────────────────────────────
  var handleSelectTrail = useCallback(function (trail: QuestTrail) {
    setActiveTrailId(trail.id); setActiveTab("map"); setFlyTrigger(Date.now());
  }, []);

  var handleStartTrail = useCallback(function (trailId: string) {
    setActiveTrailId(trailId); showToast("🗺️ Quest started! Walk to the waypoints.", "info");
  }, [showToast]);

  // ─── Derived ───────────────────────────────────────────────────────────
  var claimedCount = claimedIds.size;
  var likesCount = likedIds.size;
  var activeTrail = activeTrailId ? MOCK_TRAILS.find(function (t) { return t.id === activeTrailId; }) || null : null;
  var activeTrailProgress = activeTrailId ? trailProgress[activeTrailId] || new Set<string>() : new Set<string>();
  var pendingBadgeDef = pendingBadge ? BADGE_DEFINITIONS.find(function (b) { return b.id === pendingBadge; }) || null : null;

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="app-container flex flex-col h-[100dvh] bg-void overflow-hidden">
      {(showWelcome || forceWelcome) && (
        <WelcomeOverlay forceShow={forceWelcome} onDismiss={function () { if (soundEnabled) playSound("popup-close"); setShowWelcome(false); setForceWelcome(false); }} />
      )}

      {toasts.map(function (toast) {
        return <TxToast key={toast.id} message={toast.message} signature={toast.signature} type={toast.type} onDismiss={function () { removeToast(toast.id); }} />;
      })}

      {pendingBadgeDef && (
        <BadgeMintPopup badge={pendingBadgeDef} onDismiss={function () { setPendingBadge(null); }} onMint={handleMintBadge} />
      )}

      <Header soundEnabled={soundEnabled} onToggleSound={function () { setSoundEnabled(!soundEnabled); if (!soundEnabled) playSound("click"); }} />
      <StatsBar drops={drops} claimedCount={claimedCount} />

      <div className="flex-1 relative overflow-hidden text-lg">
        {activeTab === "map" ? (
          <>
            <MapView
              drops={drops} ghosts={ghostMarks} activeTrail={activeTrail}
              trailProgress={activeTrailProgress} selectedDrop={selectedDrop}
              onSelectDrop={setSelectedDrop} isConnected={isConnected}
              isProcessing={isProcessing} onClaim={handleClaim} onLike={handleLike}
              onComment={handleComment} onFollow={handleFollow}
              onMessageAuthor={function (u) { handleSendMessage(u, ""); }}
              onMapDrag={function () { setShowRightPanel(function () { return false; }); setShowLeftMenu(function () { return false; }); }}
              onConnectWallet={handleConnectWallet} onReactGhost={handleReactGhost}
              likedIds={likedIds} userPosition={userPosition} demoMode={demoMode}
              formatDistance={formatDistance} isNearby={isNearby} flyTrigger={flyTrigger}
              pickingLocation={pickingLocation}
              onMapClick={function (lat, lng) {
                if (pickingLocation) {
                  setPickedLocation({ lat, lng });
                  setPickingLocation(false);
                  setShowCreateModal(true);
                }
              }}
            />
            <MapOverlays
              drops={drops} ghostMarks={ghostMarks} activeTrail={activeTrail}
              activeTrailProgress={activeTrailProgress} activities={activities}
              profile={profile} userPosition={userPosition} geoStatus={geoStatus}
              demoMode={demoMode} showRightPanel={showRightPanel} showLeftMenu={showLeftMenu}
              setShowRightPanel={setShowRightPanel} setShowLeftMenu={setShowLeftMenu}
              setDemoMode={setDemoMode} setFlyTrigger={setFlyTrigger}
              requestLocation={requestLocation} isNearby={isNearby} distanceTo={distanceTo}
              onOpenInfo={function () { setShowInfo(true); setShowLeftMenu(function () { return false; }); }}
              onViewExplorer={setViewingExplorer}
            />
          </>
        ) : activeTab === "list" ? (
          <DropList drops={drops} onSelectDrop={function (d) { setSelectedDrop(d); setActiveTab("map"); }} formatDistance={formatDistance} />
        ) : activeTab === "trails" ? (
          <QuestTrails trails={MOCK_TRAILS} trailProgress={trailProgress} activeTrailId={activeTrailId} onSelectTrail={handleSelectTrail} onStartTrail={handleStartTrail} />
        ) : activeTab === "feed" ? (
          <FeedTab activities={activities} />
        ) : (
          <LeaderboardTab currentUser={profile?.username} currentStats={{ claimed: claimedCount, created: createdCount, likes: likesCount }} onFollow={handleFollow} />
        )}
      </div>

      <BottomNav
        activeTab={activeTab} setActiveTab={setActiveTab}
        isConnected={isConnected} showProfile={showProfile}
        soundEnabled={soundEnabled} playSound={playSound}
        onOpenCreate={function () { if (soundEnabled) playSound("popup-open"); setShowCreateModal(true); }}
        onOpenProfile={function () { if (soundEnabled) playSound("popup-open"); setShowProfile(true); }}
        onConnectWallet={handleConnectWallet}
      />

      {showCreateModal && (
        <CreateDropModal onClose={function () { if (soundEnabled) playSound("popup-close"); setShowCreateModal(false); }} onCreate={handleCreateDrop} onCreateGhost={handleCreateGhost} userPosition={userPosition} isConnected={isConnected}
          pickedLocation={pickedLocation}
          onPickLocation={function () {
            setShowCreateModal(false);
            setPickingLocation(true);
          }}
        />
      )}

      <ProfilePanel
        profile={profile} stats={{ claimed: claimedCount, created: createdCount, likes: likesCount, ghosts: ghostCount, trails: completedTrails }}
        mintedBadges={mintedBadges} onMintBadge={handleMintBadge}
        isOpen={showProfile} onClose={function () { if (soundEnabled) playSound("popup-close"); setShowProfile(false); }}
        tapestryConfigured={tapestryConfigured}
      />

      {claimResult && <ClaimSuccessModal drop={claimResult.drop} signature={claimResult.signature} onClose={function () { setClaimResult(null); }} />}

      {viewingExplorer && (
        <ExplorerProfileModal
          username={viewingExplorer.username} walletAddress={viewingExplorer.walletAddress}
          dropsCreated={viewingExplorer.dropsCreated} dropsClaimed={viewingExplorer.dropsClaimed}
          reputation={viewingExplorer.reputation} isFollowing={viewingExplorer.isFollowing}
          onFollow={async (username) => { var ok = await followUser(username); addActivity("👤", "You followed @" + username, "#a78bfa"); return ok; }}
          onSendMessage={handleSendMessage}
          onClose={function () { setViewingExplorer(null); }}
        />
      )}

      <InfoPanel isOpen={showInfo} onClose={function () { if (soundEnabled) playSound("popup-close"); setShowInfo(false); }} onRetakeTutorial={function () { if (soundEnabled) playSound("popup-open"); setShowInfo(false); setForceWelcome(true); }} />

      <div className="fixed bottom-16 right-3 px-2.5 py-1 rounded-full bg-void-100/90 border border-crypt-300/15 text-[9px] text-gray-600 font-mono z-50 tracking-wider capitalize">
        ⛓ Solana {SOLANA_CLUSTER} • Graveyard 2026
      </div>
    </div>
  );
}
