"use client";

import React from "react";
import { Drop } from "@/types";

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
    { label: "Active Drops", value: String(active), color: "text-crypt-300" },
    {
      label: "Total Rewards",
      value: `${totalReward.toFixed(2)} ◎`,
      color: "text-emerald-400",
    },
    { label: "Your Claims", value: String(claimedCount), color: "text-blue-400" },
    { label: "Network", value: "Devnet", color: "text-amber-400" },
  ];

  return (
    <div className="flex gap-3 px-4 py-2 overflow-x-auto scrollbar-hide">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex-shrink-0 px-3 py-2 rounded-xl bg-void-100/80 border border-crypt-300/10"
        >
          <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
            {s.label}
          </div>
          <div className={`text-base font-bold ${s.color} font-mono mt-0.5`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
