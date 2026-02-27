"use client";

import React from "react";
import ActivityFeed from "./ActivityFeed";
import type { Activity } from "@/types";

interface FeedTabProps {
  activities: Activity[];
}

export default function FeedTab({ activities }: FeedTabProps) {
  return (
    <div
      className="flex flex-col h-full overflow-y-auto p-4 gap-3"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="text-[10px] text-gray-600 uppercase tracking-widest">Tapestry Protocol</div>
          <div className="text-sm font-black text-crypt-200">Live Social Feed</div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span className="text-[9px] text-emerald-400 font-mono">On-chain</span>
        </div>
      </div>

      <ActivityFeed activities={activities} className="w-full" />

      <div className="mt-2 p-3 rounded-xl bg-white/[0.02] border border-white/8 text-[10px] text-gray-600 leading-relaxed">
        Every event in this feed is powered by{" "}
        <span className="text-crypt-300">Tapestry Protocol</span> — profiles, content
        nodes, likes, comments and follows are stored on-chain. The social graph is fully
        decentralized.
      </div>
    </div>
  );
}
