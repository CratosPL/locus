"use client";

import React, { useState } from "react";
import { UserPlus, Users, Navigation } from "lucide-react";

export interface NearbyExplorer {
  username: string;
  walletAddress: string;
  distance: number; // meters
  lastActive: number; // timestamp
  dropsCreated: number;
  dropsClaimed: number;
  reputation: number;
  isFollowing?: boolean;
}

interface NearbyExplorersProps {
  explorers: NearbyExplorer[];
  onViewProfile: (explorer: NearbyExplorer) => void;
  className?: string;
}

const RANK_CONFIG = [
  { min: 0,   label: "Lost Soul", color: "#6b7280" },
  { min: 50,  label: "Spirit",    color: "#a78bfa" },
  { min: 150, label: "Wraith",    color: "#818cf8" },
  { min: 300, label: "Lich",      color: "#fbbf24" },
];

function getRank(rep: number) {
  return [...RANK_CONFIG].reverse().find(r => rep >= r.min) || RANK_CONFIG[0];
}

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

function formatDist(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

// Mock nearby explorers — in production pulled from Tapestry social graph
// filtered by GPS proximity
export const MOCK_NEARBY_EXPLORERS: NearbyExplorer[] = [
  { username: "phantom_dev",  walletAddress: "Phm1...k9aB", distance: 87,  lastActive: Date.now() - 180000,  dropsCreated: 12, dropsClaimed: 34, reputation: 248, isFollowing: false },
  { username: "wraith_hunter", walletAddress: "Wr4i...mX2c", distance: 234, lastActive: Date.now() - 900000,  dropsCreated: 5,  dropsClaimed: 18, reputation: 130, isFollowing: true },
  { username: "anon_seeker",   walletAddress: "An0n...p3Kd", distance: 412, lastActive: Date.now() - 3600000, dropsCreated: 2,  dropsClaimed: 7,  reputation: 55,  isFollowing: false },
  { username: "lich_lord_pl",  walletAddress: "L1cH...r7Qe", distance: 623, lastActive: Date.now() - 7200000, dropsCreated: 31, dropsClaimed: 67, reputation: 512, isFollowing: false },
];

export default function NearbyExplorers({ explorers, onViewProfile, className = "" }: NearbyExplorersProps) {
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? explorers : explorers.slice(0, 3);

  return (
    <div className={className} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-void-100/90 border border-crypt-300/15 backdrop-blur cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <Users size={11} className="text-crypt-300" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            Explorers Nearby
          </span>
          <span className="text-[8px] text-crypt-300 bg-crypt-300/10 px-1.5 py-0.5 rounded-full">
            {explorers.length}
          </span>
        </div>
        <span className="text-[8px] text-gray-600">{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Explorer list */}
      {expanded && (
        <div className="flex flex-col gap-1 mt-1">
          {visible.map((explorer) => {
            const rank = getRank(explorer.reputation);
            return (
              <div
                key={explorer.username}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-void-100/90 border border-crypt-300/10 backdrop-blur cursor-pointer hover:border-crypt-300/30 transition-colors"
                onClick={() => onViewProfile(explorer)}
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{ background: rank.color + "20", color: rank.color, border: `1px solid ${rank.color}30` }}
                >
                  {explorer.username.slice(0, 1).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-gray-300 truncate">
                      @{explorer.username}
                    </span>
                    {explorer.isFollowing && (
                      <span className="text-[7px] text-crypt-300 bg-crypt-300/10 px-1 py-0.5 rounded">following</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[7px]" style={{ color: rank.color }}>{rank.label}</span>
                    <span className="text-[7px] text-gray-700">·</span>
                    <span className="text-[7px] text-gray-600">{timeAgo(explorer.lastActive)}</span>
                  </div>
                </div>

                {/* Distance */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Navigation size={9} className="text-gray-600" />
                  <span className="text-[9px] text-gray-500">{formatDist(explorer.distance)}</span>
                </div>
              </div>
            );
          })}

          {explorers.length > 3 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-[9px] text-crypt-300 text-center py-1 bg-transparent border-none cursor-pointer opacity-70 hover:opacity-100"
            >
              +{explorers.length - 3} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
