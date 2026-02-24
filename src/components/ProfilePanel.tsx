"use client";

import React, { useState } from "react";
import type { TapestryProfile } from "@/hooks/useTapestry";
import { BADGE_DEFINITIONS } from "@/utils/mockData";
import { ADDRESS_URL } from "@/utils/config";
import {
  User,
  Copy,
  Check,
  Zap,
  Ghost,
  Heart,
  Map as MapIcon,
  Award,
  ExternalLink,
  X,
  Share2,
  Sparkles
} from "lucide-react";

interface ProfilePanelProps {
  profile: TapestryProfile | null;
  stats: { claimed: number; created: number; likes: number; ghosts: number; trails: number };
  mintedBadges: Set<string>;
  onMintBadge: (badgeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  tapestryConfigured: boolean;
}

const LEVEL_THRESHOLDS = [0, 20, 50, 100, 200, 500, 1000];

function getLevelInfo(xp: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }

  const currentThreshold = LEVEL_THRESHOLDS[level - 1];
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold * 2;
  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return { level, progress, nextThreshold };
}

function getRank(level: number): { name: string; color: string } {
  if (level >= 6) return { name: "Lich Lord", color: "#fbbf24" };
  if (level >= 5) return { name: "Wraith", color: "#a78bfa" };
  if (level >= 4) return { name: "Phantom", color: "#60a5fa" };
  if (level >= 3) return { name: "Spirit", color: "#34d399" };
  if (level >= 2) return { name: "Ghoul", color: "#9ca3af" };
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
        <div onClick={function(e) { e.stopPropagation(); }} className="w-[90%] max-w-[360px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-8 animate-slide-up text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-full bg-crypt-300/10 border border-crypt-300/30 flex items-center justify-center mx-auto mb-6">
            <User className="text-crypt-300 animate-pulse" size={32} />
          </div>
          <p className="text-crypt-300 font-mono text-sm mb-2">Summoning profile...</p>
          <p className="text-[11px] text-gray-600 font-mono">Connect wallet & enable Tapestry</p>
          <button onClick={onClose} className="mt-6 w-full py-3 rounded-xl border border-crypt-300/20 bg-white/5 text-gray-400 font-mono text-sm cursor-pointer hover:bg-white/10 transition-colors">Close</button>
        </div>
      </div>
    );
  }

  var reputation = stats.claimed * 10 + stats.created * 5 + stats.likes * 2;
  var { level, progress: levelProgress, nextThreshold } = getLevelInfo(reputation);
  var rank = getRank(level);
  var shortAddr = profile.walletAddress.slice(0, 4) + "..." + profile.walletAddress.slice(-4);
  var explorerUrl = ADDRESS_URL(profile.walletAddress);

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User size={18} className="text-crypt-300" />
            <h3 className="text-crypt-300 font-mono text-sm font-bold tracking-widest uppercase">Identity</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-crypt-300 transition-colors bg-white/5 p-1.5 rounded-lg border-none cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Avatar + Username + Rank */}
        <div className="flex items-center gap-5 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-crypt-300 to-crypt-500 flex items-center justify-center shadow-[0_0_30px_rgba(167,139,250,0.3)] border border-white/20 transform rotate-3">
              <div className="transform -rotate-3 text-white">
                <User size={40} />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-void flex items-center justify-center" title="Online">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-crypt-100 font-mono font-bold text-xl truncate">@{profile.username}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <button onClick={copyAddress} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 text-[10px] text-gray-500 font-mono border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                {copied ? "Copied" : shortAddr}
              </button>
              <span className="text-[9px] font-mono font-black px-2 py-1 rounded-md uppercase tracking-tighter" style={{ color: rank.color, background: rank.color + "15", border: "1px solid " + rank.color + "33" }}>
                LVL {level} · {rank.name}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-400 font-mono mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 italic">"{profile.bio}"</p>

        {/* Social Graph Info */}
        <div className="flex gap-8 mb-6 border-y border-crypt-300/10 py-4 px-2 bg-crypt-300/5 rounded-lg">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono text-crypt-100">{profile.followersCount || 0}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Followers</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold font-mono text-crypt-100">{profile.followingCount || 0}</span>
            <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Following</span>
          </div>
          <div className="ml-auto flex items-center">
             <div className="text-xs font-mono text-crypt-300 bg-crypt-300/10 px-3 py-1.5 rounded-lg border border-crypt-300/30 font-bold animate-pulse">
               Tapestry Active
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[
            { label: "Claims", value: stats.claimed, color: "text-emerald-400", icon: <Zap size={16} /> },
            { label: "Drops", value: stats.created, color: "text-blue-400", icon: <MapIcon size={16} /> },
            { label: "Ghosts", value: stats.ghosts, color: "text-purple-400", icon: <Ghost size={16} /> },
            { label: "Likes", value: stats.likes, color: "text-pink-400", icon: <Heart size={16} /> },
            { label: "Quests", value: stats.trails, color: "text-yellow-400", icon: <Award size={16} /> },
          ].map(function(s) {
            return (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 px-1 text-center hover:bg-white/[0.06] transition-all hover:scale-[1.02]">
                <div className={"flex justify-center mb-1.5 " + s.color}>{s.icon}</div>
                <div className={"text-base font-black font-mono " + s.color}>{s.value}</div>
                <div className="text-[7px] text-gray-600 uppercase tracking-tighter font-black mt-1 leading-none">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Level / XP Progress Bar */}
        <div className="bg-crypt-300/5 border border-crypt-300/10 rounded-2xl p-4 mb-4 shadow-[inset_0_0_20px_rgba(167,139,250,0.05)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400 animate-pulse" />
              <span className="text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em] font-black">Experience</span>
            </div>
            <div className="text-right">
               <span className="font-black font-mono text-sm text-crypt-100">{reputation}</span>
               <span className="text-[10px] text-gray-600 font-mono ml-1">/ {nextThreshold} XP</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-black/40 border border-white/5 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(167,139,250,0.4)]"
              style={{
                width: levelProgress + "%",
                background: "linear-gradient(90deg, " + rank.color + "66, " + rank.color + ")"
              }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-gray-600 font-mono font-bold">Level {level}</span>
            <span className="text-[9px] text-gray-600 font-mono font-bold">Level {level + 1}</span>
          </div>
        </div>

        {/* NFT Badges */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Award size={14} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">
                Relics & Achievements
              </span>
            </div>
            <span className="text-[9px] font-mono text-crypt-300 bg-crypt-300/10 px-2 py-0.5 rounded-md border border-crypt-300/20">
              {mintedCount}/{earnedCount}
            </span>
          </div>
          <div className="space-y-2">
            {badges.map(function(badge) {
              return (
                <div
                  key={badge.id}
                  className={"flex items-center gap-4 p-3 rounded-xl border transition-all " + (
                    badge.minted ? "bg-crypt-300/5 border-crypt-300/20 shadow-[inset_0_0_12px_rgba(167,139,250,0.05)]"
                      : badge.earned ? "bg-white/[0.02] border-white/10"
                      : "bg-transparent border-white/5 opacity-40"
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/5" style={{ filter: badge.earned ? `drop-shadow(0 0 6px ${badge.color}66)` : "grayscale(1) opacity(0.5)" }}>
                    {typeof badge.icon === "function" ? badge.icon(badge.earned ? badge.color : "#4b5563") : <span className="text-xl">{badge.icon}</span>}
                  </div>
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
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-crypt-300/60 font-mono hover:text-crypt-300 transition-colors">
            Explorer <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
