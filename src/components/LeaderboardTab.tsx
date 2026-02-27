"use client";

import React from "react";
import Leaderboard from "./Leaderboard";

interface LeaderboardTabProps {
  currentUser?: string;
  currentStats: { claimed: number; created: number; likes: number };
  onFollow: (username: string) => Promise<boolean>;
}

export default function LeaderboardTab({ currentUser, currentStats, onFollow }: LeaderboardTabProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Hackathon Banner */}
      <div className="mx-3 mt-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-amber-600/20 border border-white/10 flex items-center justify-between shadow-lg">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-none">
            Graveyard Hackathon
          </span>
          <span className="text-[8px] text-white/50 font-mono mt-1">
            Multi-Track Integration Verified
          </span>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" title="MagicBlock" />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#a855f7]" title="Tapestry" />
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_#f59e0b]" title="Sunrise" />
        </div>
      </div>

      <Leaderboard
        currentUser={currentUser}
        currentStats={currentStats}
        onFollow={onFollow}
      />
    </div>
  );
}
