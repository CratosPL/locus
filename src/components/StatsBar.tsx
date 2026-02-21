"use client";

import React from "react";
import { Drop } from "@/types";
import { MapPin, Coins, Zap, Globe } from "lucide-react";

interface StatsBarProps {
  drops: Drop[];
  claimedCount: number;
}

export default function StatsBar({ drops, claimedCount }: StatsBarProps) {
  const active = drops.filter((d) => !d.isClaimed).length;
  const totalReward = drops
    .filter((d) => !d.isClaimed)
    .reduce((sum, d) => sum + d.finderReward, 0);

  const stats = [
    { label: "Active", value: String(active), icon: <MapPin size={12} />, color: "#a78bfa" },
    { label: "Rewards", value: totalReward.toFixed(2) + " ◎", icon: <Coins size={12} />, color: "#34d399" },
    { label: "Claimed", value: String(claimedCount), icon: <Zap size={12} />, color: "#60a5fa" },
    { label: "Testnet", value: "Live", icon: <Globe size={12} />, color: "#fbbf24" },
  ];

  return (
    <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide" suppressHydrationWarning>
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-void-100/60 border border-crypt-300/10 shadow-sm"
          suppressHydrationWarning
        >
          <span className="text-crypt-300" suppressHydrationWarning>{s.icon}</span>
          <div>
            <div className="text-[9px] text-gray-700 font-mono uppercase tracking-widest leading-none">
              {s.label}
            </div>
            <div
              className="text-sm font-bold font-mono leading-tight"
              style={{ color: s.color }}
              suppressHydrationWarning
            >
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
