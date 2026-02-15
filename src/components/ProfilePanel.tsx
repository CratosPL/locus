"use client";

import React, { useState } from "react";
import type { TapestryProfile } from "@/hooks/useTapestry";

interface ProfilePanelProps {
  profile: TapestryProfile | null;
  stats: {
    claimed: number;
    created: number;
    likes: number;
  };
  isOpen: boolean;
  onClose: () => void;
  tapestryConfigured: boolean;
}

// Badges earned based on activity
function getBadges(stats: { claimed: number; created: number; likes: number }) {
  var badges: Array<{ icon: string; name: string; desc: string; earned: boolean }> = [
    { icon: "👻", name: "First Soul", desc: "Claim your first drop", earned: stats.claimed >= 1 },
    { icon: "🗺️", name: "Explorer", desc: "Claim 3 drops", earned: stats.claimed >= 3 },
    { icon: "💀", name: "Necromancer", desc: "Claim 5 drops", earned: stats.claimed >= 5 },
    { icon: "🪦", name: "Gravedigger", desc: "Create your first drop", earned: stats.created >= 1 },
    { icon: "⚰️", name: "Undertaker", desc: "Create 3 drops", earned: stats.created >= 3 },
    { icon: "❤️", name: "Spirit", desc: "Like 3 drops", earned: stats.likes >= 3 },
    { icon: "👑", name: "Lich King", desc: "Earn 100 reputation", earned: (stats.claimed * 10 + stats.created * 5 + stats.likes * 2) >= 100 },
  ];
  return badges;
}

// Rank based on reputation
function getRank(rep: number): { name: string; color: string } {
  if (rep >= 100) return { name: "Lich", color: "#fbbf24" };
  if (rep >= 50) return { name: "Wraith", color: "#a78bfa" };
  if (rep >= 20) return { name: "Phantom", color: "#60a5fa" };
  if (rep >= 5) return { name: "Spirit", color: "#34d399" };
  return { name: "Lost Soul", color: "#666" };
}

export default function ProfilePanel({
  profile,
  stats,
  isOpen,
  onClose,
  tapestryConfigured,
}: ProfilePanelProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Loading fallback
  if (!profile) {
    return (
      <div
        className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={function(e) { e.stopPropagation(); }}
          className="w-[90%] max-w-[360px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up text-center"
        >
          <div className="text-4xl mb-4">🪦</div>
          <p className="text-crypt-300 font-mono text-sm mb-2">Loading profile...</p>
          <p className="text-[11px] text-gray-600 font-mono">Connect wallet &amp; enable Tapestry</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 rounded-xl border border-crypt-300/20 bg-transparent text-gray-500 font-mono text-sm cursor-pointer hover:border-crypt-300/40 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  var reputation = stats.claimed * 10 + stats.created * 5 + stats.likes * 2;
  var rank = getRank(reputation);
  var badges = getBadges(stats);
  var earnedBadges = badges.filter(function(b) { return b.earned; });
  var shortAddr = profile.walletAddress.slice(0, 4) + "..." + profile.walletAddress.slice(-4);
  var explorerUrl = "https://explorer.solana.com/address/" + profile.walletAddress + "?cluster=devnet";

  var copyAddress = function() {
    navigator.clipboard.writeText(profile.walletAddress);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={function(e) { e.stopPropagation(); }}
        className="w-[92%] max-w-[380px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-crypt-300 font-mono text-lg font-bold">👤 Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-crypt-300 transition-colors bg-transparent border-none cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Avatar + Username + Rank */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crypt-300 to-crypt-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(167,139,250,0.3)]">
            🪦
          </div>
          <div>
            <div className="text-crypt-200 font-mono font-bold text-base">
              @{profile.username}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={copyAddress}
                className="text-[11px] text-gray-600 font-mono bg-transparent border-none cursor-pointer hover:text-crypt-300 transition-colors p-0"
              >
                {copied ? "✓ Copied!" : shortAddr}
              </button>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{ color: rank.color, background: rank.color + "15", border: "1px solid " + rank.color + "33" }}
              >
                {rank.name}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[12px] text-gray-500 font-mono mb-4 leading-relaxed">
          {profile.bio}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Claimed", value: stats.claimed, color: "text-emerald-400", icon: "⚡" },
            { label: "Created", value: stats.created, color: "text-blue-400", icon: "🪦" },
            { label: "Likes", value: stats.likes, color: "text-pink-400", icon: "❤️" },
          ].map(function(s) {
            return (
              <div
                key={s.label}
                className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-2.5 text-center"
              >
                <div className="text-sm mb-0.5">{s.icon}</div>
                <div className={"text-lg font-bold font-mono " + s.color}>
                  {s.value}
                </div>
                <div className="text-[8px] text-gray-600 uppercase tracking-widest mt-0.5">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reputation bar */}
        <div className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
              Reputation
            </span>
            <span className="font-bold font-mono text-sm" style={{ color: rank.color }}>
              ⚡ {reputation}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800/50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: Math.min(reputation, 100) + "%",
                background: "linear-gradient(90deg, " + rank.color + "88, " + rank.color + ")",
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-gray-700 font-mono">0</span>
            <span className="text-[8px] text-gray-700 font-mono">Next: {reputation < 5 ? "Spirit (5)" : reputation < 20 ? "Phantom (20)" : reputation < 50 ? "Wraith (50)" : reputation < 100 ? "Lich (100)" : "MAX"}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-4">
          <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mb-2">
            Badges ({earnedBadges.length}/{badges.length})
          </div>
          <div className="grid grid-cols-4 gap-2">
            {badges.map(function(badge) {
              return (
                <div
                  key={badge.name}
                  className={"flex flex-col items-center gap-1 p-2 rounded-lg border transition-all " + (
                    badge.earned
                      ? "bg-crypt-300/8 border-crypt-300/20"
                      : "bg-gray-900/20 border-gray-800/20 opacity-40"
                  )}
                  title={badge.desc}
                >
                  <span className={"text-xl " + (!badge.earned ? "grayscale" : "")}>
                    {badge.icon}
                  </span>
                  <span className={"text-[8px] font-mono text-center leading-tight " + (
                    badge.earned ? "text-crypt-200" : "text-gray-700"
                  )}>
                    {badge.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tapestry + Explorer */}
        <div className="flex items-center justify-between pt-3 border-t border-crypt-300/10">
          <div className="flex items-center gap-2">
            <div
              className={"w-2 h-2 rounded-full " + (
                tapestryConfigured ? "bg-emerald-400" : "bg-yellow-400"
              )}
            />
            <span className="text-[10px] text-gray-600 font-mono">
              Tapestry {tapestryConfigured ? "Connected" : "Demo"}
            </span>
          </div>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-crypt-300/60 font-mono hover:text-crypt-300 transition-colors"
          >
            Explorer →
          </a>
        </div>
      </div>
    </div>
  );
}
