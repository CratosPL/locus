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
    { label: "Active", value: String(active), icon: <MapPin size={13} />, color: "#a78bfa" },
    { label: "Vault", value: totalReward.toFixed(2) + "◎", icon: <Coins size={13} />, color: "#34d399" },
    { label: "Claimed", value: String(claimedCount), icon: <Zap size={13} />, color: "#60a5fa" },
    { label: "Network", value: "Devnet", icon: <Globe size={13} />, color: "#fbbf24" },
  ];

  return (
    <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide bg-void/30 backdrop-blur-sm border-b border-white/[0.03]" suppressHydrationWarning>
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:bg-white/[0.06] transition-colors"
          suppressHydrationWarning
        >
          <div className="p-2 rounded-xl bg-white/[0.03] text-crypt-300" suppressHydrationWarning>{s.icon}</div>
          <div>
            <div className="text-[8px] text-gray-600 font-mono font-black uppercase tracking-[0.2em] leading-none mb-1">
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
