"use client";

import React from "react";
import { Compass, MapPin, Activity as ActivityIcon } from "lucide-react";
import ActivityFeed from "./ActivityFeed";
import NearbyExplorers, { NearbyExplorer, MOCK_NEARBY_EXPLORERS } from "./NearbyExplorers";
import type { Drop, GhostMark, QuestTrail, Activity, GeoLocation } from "@/types";
import { TapestryProfile } from "@/hooks/useTapestry";

// ─── Types ──────────────────────────────────────────────────────────────────

interface MapOverlaysProps {
  drops: Drop[];
  ghostMarks: GhostMark[];
  activeTrail: QuestTrail | null;
  activeTrailProgress: Set<string>;
  activities: Activity[];
  profile: TapestryProfile | null;
  userPosition: GeoLocation | null;
  geoStatus: string;
  demoMode: boolean;
  showRightPanel: boolean;
  showLeftMenu: boolean;
  setShowRightPanel: (fn: (v: boolean) => boolean) => void;
  setShowLeftMenu: (fn: (v: boolean) => boolean) => void;
  setDemoMode: (v: boolean) => void;
  setFlyTrigger: (v: number) => void;
  requestLocation: () => void;
  isNearby: (lat: number, lng: number) => boolean;
  distanceTo: (lat: number, lng: number) => number | null;
  onOpenInfo: () => void;
  onViewExplorer: (e: NearbyExplorer) => void;
}

// ─── Slide-in animation keyframes ────────────────────────────────────────────

var PANEL_ANIMATION_STYLE = `
  @keyframes panel-slide-in {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
`;

// ─── Sub-components ──────────────────────────────────────────────────────────

function TrailBanner({ trail, progress }: { trail: QuestTrail; progress: Set<string> }) {
  var pct = Math.round((progress.size / trail.waypoints.length) * 100);
  return (
    <div className="absolute top-4 right-4 z-[1000] w-52">
      <div className="px-4 py-3 rounded-2xl bg-void/80 backdrop-blur-xl border border-white/10 text-center shadow-2xl glass-border-gradient">
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <Compass size={12} className="text-gray-500" />
          <span className="text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest">
            Active Quest
          </span>
        </div>
        <div className="text-[13px] font-mono font-black text-crypt-100 truncate mb-2">
          {trail.name}
        </div>
        <div className="flex items-center gap-2 justify-center bg-white/5 p-1.5 rounded-lg">
          <div className="flex-1 h-1 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full shadow-[0_0_8px_var(--trail-glow)]"
              style={{
                width: pct + "%",
                background: trail.color,
                // @ts-ignore
                "--trail-glow": trail.color,
              } as React.CSSProperties}
            />
          </div>
          <span className="text-[10px] font-mono font-black" style={{ color: trail.color }}>
            {progress.size}/{trail.waypoints.length}
          </span>
        </div>
      </div>
    </div>
  );
}

function ExploreHint({
  drops,
  isNearby,
  distanceTo,
}: {
  drops: Drop[];
  isNearby: (lat: number, lng: number) => boolean;
  distanceTo: (lat: number, lng: number) => number | null;
}) {
  var nearbyDrops = drops.filter(function (d) {
    return !d.isClaimed && isNearby(d.location.lat, d.location.lng);
  });
  if (nearbyDrops.length > 0) return null;

  var unclaimed = drops.filter(function (d) { return !d.isClaimed; });
  var distances = unclaimed
    .map(function (d) {
      var dist = distanceTo(d.location.lat, d.location.lng);
      return dist !== null ? dist : Infinity;
    })
    .sort(function (a, b) { return a - b; });
  var nearest = distances[0];

  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000] w-72 pointer-events-none">
      <div className="px-5 py-4 rounded-3xl bg-void/80 backdrop-blur-2xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] text-center glass-border-gradient">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
          <Compass size={20} className="text-crypt-300 animate-spin-slow" />
        </div>
        <div className="text-[11px] font-mono text-crypt-100 font-black uppercase tracking-widest mb-1">
          Scanning Perimeter
        </div>
        {nearest && nearest < Infinity ? (
          <div className="text-[10px] font-mono text-gray-500">
            Nearest signature detected at{" "}
            {nearest < 1000 ? Math.round(nearest) + "m" : (nearest / 1000).toFixed(1) + "km"}
          </div>
        ) : (
          <div className="text-[10px] font-mono text-gray-500">The area is silent...</div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function MapOverlays(props: MapOverlaysProps) {
  var {
    drops,
    ghostMarks,
    activeTrail,
    activeTrailProgress,
    activities,
    profile,
    userPosition,
    geoStatus,
    demoMode,
    showRightPanel,
    showLeftMenu,
    setShowRightPanel,
    setShowLeftMenu,
    setDemoMode,
    setFlyTrigger,
    requestLocation,
    isNearby,
    distanceTo,
    onOpenInfo,
    onViewExplorer,
  } = props;

  return (
    <>
      {/* Trail banner */}
      {activeTrail && (
        <TrailBanner trail={activeTrail} progress={activeTrailProgress} />
      )}

      {/* Explore hint — only when GPS active, no trail, nothing nearby */}
      {geoStatus === "active" && userPosition && !activeTrail && (
        <ExploreHint drops={drops} isNearby={isNearby} distanceTo={distanceTo} />
      )}

      {/* Right panel: activity + nearby explorers */}
      {!activeTrail && (
        <>
          <button
            onClick={function () { setShowRightPanel(function (v) { return !v; }); setShowLeftMenu(function () { return false; }); }}
            className={
              "absolute top-3 right-3 z-[1001] w-9 h-9 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all shadow-lg cursor-pointer " +
              (showRightPanel
                ? "bg-crypt-300/20 border-crypt-300/50 text-crypt-300"
                : "bg-void/80 border-white/10 text-gray-400")
            }
          >
            <div className="relative">
              <ActivityIcon size={15} />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] animate-pulse" />
            </div>
          </button>

          {showRightPanel && (
            <div
              className="absolute top-12 right-3 z-[1000] w-52 flex flex-col gap-1.5"
              style={{ animation: "panel-slide-in 0.2s ease-out" }}
            >
              <style>{PANEL_ANIMATION_STYLE}</style>
              <ActivityFeed activities={activities} />
              <NearbyExplorers explorers={MOCK_NEARBY_EXPLORERS} onViewProfile={onViewExplorer} />
            </div>
          )}
        </>
      )}

      {/* Left controls: GPS + hamburger + expandable menu */}
      <div className="absolute top-3 left-3 z-[1001] flex flex-col gap-1.5">
        {/* GPS — always visible */}
        <button
          onClick={function () {
            if (geoStatus === "active") setFlyTrigger(Date.now());
            else if (geoStatus === "idle" || geoStatus === "error") requestLocation();
          }}
          className={
            "w-9 h-9 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all shadow-lg cursor-pointer " +
            (geoStatus === "active"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : geoStatus === "requesting"
              ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-400"
              : geoStatus === "denied"
              ? "bg-red-500/15 border-red-500/40 text-red-400"
              : "bg-void/80 border-white/10 text-gray-400")
          }
        >
          <MapPin size={15} />
        </button>

        {/* Hamburger */}
        <button
          onClick={function () { setShowLeftMenu(function (v) { return !v; }); setShowRightPanel(function () { return false; }); }}
          className={
            "w-9 h-9 rounded-full border backdrop-blur-xl flex flex-col items-center justify-center gap-[3px] transition-all shadow-lg cursor-pointer " +
            (showLeftMenu
              ? "bg-crypt-300/20 border-crypt-300/50 text-crypt-300"
              : "bg-void/80 border-white/10 text-gray-500")
          }
        >
          <span className={"block w-3.5 h-px transition-all origin-center " + (showLeftMenu ? "rotate-45 translate-y-[4px] bg-crypt-300" : "bg-gray-400")} />
          <span className={"block w-3.5 h-px transition-all " + (showLeftMenu ? "opacity-0" : "bg-gray-400")} />
          <span className={"block w-3.5 h-px transition-all origin-center " + (showLeftMenu ? "-rotate-45 -translate-y-[4px] bg-crypt-300" : "bg-gray-400")} />
        </button>

        {/* Expanded left menu */}
        {showLeftMenu && (
          <div className="flex flex-col gap-1.5" style={{ animation: "panel-slide-in 0.2s ease-out" }}>
            <style>{PANEL_ANIMATION_STYLE}</style>

            {/* Spectral Density */}
            <div className="px-3 py-2 rounded-xl bg-void/90 backdrop-blur-xl border border-white/8 font-mono text-[9px] text-gray-500 shadow-xl w-44">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                <span className="font-black text-gray-400 uppercase tracking-widest">Spectral Density</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{drops.filter(function (d) { return !d.isClaimed; }).length} Drops</span>
                <span>{ghostMarks.length} Marks</span>
              </div>
              {userPosition && (function () {
                var unclaimed = drops.filter(function (d) { return !d.isClaimed; });
                var nearbyCount = unclaimed.filter(function (d) { return isNearby(d.location.lat, d.location.lng); }).length;
                var distances = unclaimed
                  .map(function (d) { var dist = distanceTo(d.location.lat, d.location.lng); return dist !== null ? dist : Infinity; })
                  .sort(function (a, b) { return a - b; });
                var nearest = distances[0];
                return (
                  <div className="mt-1 pt-1 border-t border-crypt-300/10">
                    {nearbyCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span>⚡</span><span>{nearbyCount} in range!</span>
                      </div>
                    ) : nearest && nearest < Infinity ? (
                      <div className="flex items-center gap-1.5 text-yellow-500/80">
                        <span>→</span><span>Nearest: {nearest < 1000 ? Math.round(nearest) + "m" : (nearest / 1000).toFixed(1) + "km"}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
              {profile && <div className="text-[9px] text-crypt-300 mt-0.5">@{profile.username}</div>}
            </div>

            {/* Demo toggle */}
            <button
              onClick={function () { setDemoMode(!demoMode); }}
              className={
                "flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl border transition-all cursor-pointer w-44 " +
                (demoMode
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                  : "bg-void/80 border-white/8 text-gray-500")
              }
            >
              <span className="text-[10px] font-mono">{demoMode ? "🔓 Demo ON" : "🔓 Demo Mode"}</span>
            </button>

            {/* Info / Jury */}
            <button
              onClick={function () { onOpenInfo(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-crypt-300/10 border border-crypt-300/25 text-crypt-300 backdrop-blur-xl cursor-pointer w-44 transition-all hover:bg-crypt-300/20"
            >
              <span className="text-[10px] font-mono font-bold">💡 Info / Jury</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
