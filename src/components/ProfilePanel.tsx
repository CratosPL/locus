"use client";

import React, { useState } from "react";
import type { TapestryProfile } from "@/hooks/useTapestry";
import { BADGE_DEFINITIONS } from "@/utils/mockData";

interface ProfilePanelProps {
  profile: TapestryProfile | null;
  stats: { claimed: number; created: number; likes: number; ghosts: number; trails: number };
  mintedBadges: Set<string>;
  onMintBadge: (badgeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  tapestryConfigured: boolean;
}

function getRank(rep: number): { name: string; color: string } {
  if (rep >= 100) return { name: "Lich", color: "#fbbf24" };
  if (rep >= 50) return { name: "Wraith", color: "#a78bfa" };
  if (rep >= 20) return { name: "Phantom", color: "#60a5fa" };
  if (rep >= 5) return { name: "Spirit", color: "#34d399" };
  return { name: "Lost Soul", color: "#666" };
}

export default function ProfilePanel({
  profile, stats, mintedBadges, onMintBadge, isOpen, onClose, tapestryConfigured,
}: ProfilePanelProps) {
  var [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  if (!profile) {
    return (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div onClick={function(e) { e.stopPropagation(); }} className="w-[90%] max-w-[360px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up text-center">
          <div className="text-4xl mb-4">🪦</div>
          <p className="text-crypt-300 font-mono text-sm mb-2">Loading profile...</p>
          <p className="text-[11px] text-gray-600 font-mono">Connect wallet &amp; enable Tapestry</p>
          <button onClick={onClose} className="mt-4 px-6 py-2 rounded-xl border border-crypt-300/20 bg-transparent text-gray-500 font-mono text-sm cursor-pointer">Close</button>
        </div>
      </div>
    );
  }

  var reputation = stats.claimed * 10 + stats.created * 5 + stats.likes * 2;
  var rank = getRank(reputation);
  var shortAddr = profile.walletAddress.slice(0, 4) + "..." + profile.walletAddress.slice(-4);
  var explorerUrl = "https://explorer.solana.com/address/" + profile.walletAddress + "?cluster=devnet";

  var copyAddress = function() {
    navigator.clipboard.writeText(profile.walletAddress);
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };

  // Calculate badge eligibility
  var badges = BADGE_DEFINITIONS.map(function(badge) {
    var value = 0;
    if (badge.thresholdType === "claims") value = stats.claimed;
    else if (badge.thresholdType === "creates") value = stats.created;
    else if (badge.thresholdType === "ghosts") value = stats.ghosts;
    else if (badge.thresholdType === "trails") value = stats.trails;
    else if (badge.thresholdType === "reputation") value = reputation;

    var earned = value >= badge.threshold;
    var minted = mintedBadges.has(badge.id);
    var progress = Math.min(100, Math.round((value / badge.threshold) * 100));

    return { ...badge, earned: earned, minted: minted, progress: progress, currentValue: value };
  });

  var earnedCount = badges.filter(function(b) { return b.earned; }).length;
  var mintedCount = badges.filter(function(b) { return b.minted; }).length;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }} className="w-[92%] max-w-[380px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-5 animate-slide-up max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-crypt-300 font-mono text-lg font-bold">👤 Profile</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-crypt-300 transition-colors bg-transparent border-none cursor-pointer text-xl">✕</button>
        </div>

        {/* Avatar + Username + Rank */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crypt-300 to-crypt-500 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(167,139,250,0.3)]">🪦</div>
          <div>
            <div className="text-crypt-200 font-mono font-bold text-base">@{profile.username}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <button onClick={copyAddress} className="text-[11px] text-gray-600 font-mono bg-transparent border-none cursor-pointer hover:text-crypt-300 transition-colors p-0">
                {copied ? "✓ Copied!" : shortAddr}
              </button>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full" style={{ color: rank.color, background: rank.color + "15", border: "1px solid " + rank.color + "33" }}>
                {rank.name}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-gray-500 font-mono mb-4 leading-relaxed">{profile.bio}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-1.5 mb-4">
          {[
            { label: "Claims", value: stats.claimed, color: "text-emerald-400", icon: "⚡" },
            { label: "Drops", value: stats.created, color: "text-blue-400", icon: "🪦" },
            { label: "Ghosts", value: stats.ghosts, color: "text-purple-400", icon: "👻" },
            { label: "Likes", value: stats.likes, color: "text-pink-400", icon: "❤️" },
            { label: "Quests", value: stats.trails, color: "text-yellow-400", icon: "🗺️" },
          ].map(function(s) {
            return (
              <div key={s.label} className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-2 text-center">
                <div className="text-sm mb-0.5">{s.icon}</div>
                <div className={"text-base font-bold font-mono " + s.color}>{s.value}</div>
                <div className="text-[7px] text-gray-600 uppercase tracking-widest mt-0.5">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Reputation bar */}
        <div className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">Reputation</span>
            <span className="font-bold font-mono text-sm" style={{ color: rank.color }}>⚡ {reputation}</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-800/50 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: Math.min(reputation, 200) / 2 + "%", background: "linear-gradient(90deg, " + rank.color + "88, " + rank.color + ")" }} />
          </div>
        </div>

        {/* NFT Badges */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-600 font-mono uppercase tracking-widest">
              NFT Badges ({mintedCount} minted / {earnedCount} earned)
            </span>
          </div>
          <div className="space-y-2">
            {badges.map(function(badge) {
              return (
                <div
                  key={badge.id}
                  className={"flex items-center gap-3 p-2.5 rounded-xl border transition-all " + (
                    badge.minted ? "bg-crypt-300/8 border-crypt-300/20"
                      : badge.earned ? "bg-gradient-to-r from-crypt-300/5 to-transparent border-crypt-300/15"
                      : "bg-gray-900/20 border-gray-800/20 opacity-50"
                  )}
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={"text-[11px] font-mono font-bold " + (badge.earned ? "text-crypt-200" : "text-gray-600")}>
                        {badge.name}
                      </span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full uppercase" style={{ color: badge.color, background: badge.color + "15", border: "1px solid " + badge.color + "22" }}>
                        {badge.rarity}
                      </span>
                      {badge.minted && (
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">NFT ✓</span>
                      )}
                    </div>
                    <div className="text-[9px] text-gray-600 font-mono">{badge.description}</div>
                    {!badge.earned && (
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-gray-800/50 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: badge.progress + "%", background: badge.color + "66" }} />
                        </div>
                        <span className="text-[8px] text-gray-600 font-mono">{badge.currentValue}/{badge.threshold}</span>
                      </div>
                    )}
                  </div>
                  {badge.earned && !badge.minted && (
                    <button
                      onClick={function() { onMintBadge(badge.id); }}
                      className="px-2.5 py-1.5 rounded-lg border-none bg-gradient-to-r from-crypt-300 to-crypt-500 text-white text-[9px] font-mono font-bold cursor-pointer whitespace-nowrap"
                    >
                      Mint
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-crypt-300/10">
          <div className="flex items-center gap-2">
            <div className={"w-2 h-2 rounded-full " + (tapestryConfigured ? "bg-emerald-400" : "bg-yellow-400")} />
            <span className="text-[10px] text-gray-600 font-mono">Tapestry {tapestryConfigured ? "Connected" : "Demo"}</span>
          </div>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-crypt-300/60 font-mono hover:text-crypt-300 transition-colors">Explorer →</a>
        </div>
      </div>
    </div>
  );
}
