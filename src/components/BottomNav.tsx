"use client";

import React from "react";
import {
  Map as MapIcon,
  ScrollText,
  Compass,
  Trophy,
  User,
  Activity as ActivityIcon,
} from "lucide-react";
import type { SoundType } from "@/hooks/useSound";

export type TabId = "map" | "list" | "trails" | "leaderboard" | "feed";

interface BottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isConnected: boolean;
  showProfile: boolean;
  soundEnabled: boolean;
  playSound: (name: SoundType) => void;
  onOpenCreate: () => void;
  onOpenProfile: () => void;
  onConnectWallet: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  isConnected,
  showProfile,
  soundEnabled,
  playSound,
  onOpenCreate,
  onOpenProfile,
  onConnectWallet,
}: BottomNavProps) {

  var leftTabs: { id: TabId; icon: React.ReactNode; label: string }[] = [
    { id: "map", icon: <MapIcon size={18} />, label: "Map" },
    { id: "list", icon: <ScrollText size={18} />, label: "Drops" },
    { id: "trails", icon: <Compass size={18} />, label: "Quests" },
  ];

  function handleTab(id: TabId) {
    if (soundEnabled) playSound("click");
    setActiveTab(id);
  }

  function tabCls(id: TabId | "__profile") {
    var isActive = id === "__profile" ? showProfile : activeTab === id;
    return (
      "flex flex-col items-center gap-0.5 bg-transparent border-none cursor-pointer font-mono text-[8px] font-bold tracking-tight transition-all active:scale-90 w-14 py-1 " +
      (isActive ? "text-crypt-300" : "text-gray-500")
    );
  }

  function dotCls(id: TabId | "__profile") {
    var isActive = id === "__profile" ? showProfile : activeTab === id;
    return (
      "flex items-center justify-center w-8 h-6 rounded-lg transition-all " +
      (isActive ? "bg-crypt-300/15" : "")
    );
  }

  return (
    <nav
      className="flex items-center bg-void/80 border-t border-white/5 z-50 relative backdrop-blur-2xl shrink-0 glass-border-gradient"
      style={{
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        paddingTop: "8px",
      }}
    >
      {/* Left: Map, Drops, Quests */}
      <div className="flex flex-1 justify-evenly items-center">
        {leftTabs.map(function (tab) {
          return (
            <button
              key={tab.id}
              onClick={function () { handleTab(tab.id); }}
              className={tabCls(tab.id)}
            >
              <div className={dotCls(tab.id)}>{tab.icon}</div>
              <span className="opacity-80 uppercase tracking-widest">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Center: Action Button */}
      <div className="flex flex-col items-center px-1 -translate-y-3">
        <button
          onClick={function () {
            if (soundEnabled) playSound("click");
            if (isConnected) {
              if (soundEnabled) playSound("popup-open");
              onOpenCreate();
            } else {
              onConnectWallet();
            }
          }}
          className="w-13 h-13 w-[52px] h-[52px] rounded-full border-4 border-void bg-gradient-to-br from-crypt-300 to-crypt-500 text-white text-2xl cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(167,139,250,0.5)] hover:from-crypt-400 hover:to-crypt-600 transition-all active:scale-90 z-10"
        >
          +
        </button>
      </div>

      {/* Right: Rank, Feed, Profile */}
      <div className="flex flex-1 justify-evenly items-center">
        <button onClick={function () { handleTab("leaderboard"); }} className={tabCls("leaderboard")}>
          <div className={dotCls("leaderboard")}><Trophy size={18} /></div>
          <span className="opacity-80 uppercase tracking-widest">Rank</span>
        </button>

        <button onClick={function () { handleTab("feed"); }} className={tabCls("feed")}>
          <div className={"relative " + dotCls("feed")}>
            <ActivityIcon size={18} />
            <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_#34d399] animate-pulse" />
          </div>
          <span className="opacity-80 uppercase tracking-widest">Feed</span>
        </button>

        <button
          onClick={function () {
            if (soundEnabled) playSound("click");
            if (isConnected) {
              if (soundEnabled) playSound("popup-open");
              onOpenProfile();
            } else {
              onConnectWallet();
            }
          }}
          className={tabCls("__profile")}
        >
          <div className={dotCls("__profile")}><User size={18} /></div>
          <span className="opacity-80 uppercase tracking-widest">
            {isConnected ? "Profile" : "Login"}
          </span>
        </button>
      </div>
    </nav>
  );
}
