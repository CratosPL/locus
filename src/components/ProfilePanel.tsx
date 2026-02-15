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

export default function ProfilePanel({
  profile,
  stats,
  isOpen,
  onClose,
  tapestryConfigured,
}: ProfilePanelProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Loading fallback when profile hasn't loaded yet
  if (!profile) {
    return (
      <div
        className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[90%] max-w-[360px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up text-center"
        >
          <div className="text-4xl mb-4">🪦</div>
          <p className="text-crypt-300 font-mono text-sm mb-2">
            Loading profile...
          </p>
          <p className="text-[11px] text-gray-600 font-mono">
            Connect wallet &amp; enable Tapestry
          </p>
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

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortAddr = `${profile.walletAddress.slice(0, 4)}...${profile.walletAddress.slice(-4)}`;
  const explorerUrl = `https://explorer.solana.com/address/${profile.walletAddress}?cluster=devnet`;
  const reputation = stats.claimed * 10 + stats.created * 5 + stats.likes * 2;

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-[360px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-crypt-300 font-mono text-lg font-bold">
            👤 Profile
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-crypt-300 transition-colors bg-transparent border-none cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Avatar + Username */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-crypt-300 to-crypt-500 flex items-center justify-center text-2xl">
            🪦
          </div>
          <div>
            <div className="text-crypt-200 font-mono font-bold text-base">
              @{profile.username}
            </div>
            <button
              onClick={copyAddress}
              className="text-[11px] text-gray-600 font-mono bg-transparent border-none cursor-pointer hover:text-crypt-300 transition-colors p-0"
            >
              {copied ? "✓ Copied!" : shortAddr}
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="text-[12px] text-gray-500 font-mono mb-5 leading-relaxed">
          {profile.bio}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Claimed", value: stats.claimed, color: "text-emerald-400" },
            { label: "Created", value: stats.created, color: "text-blue-400" },
            { label: "Likes", value: stats.likes, color: "text-pink-400" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-3 text-center"
            >
              <div className={`text-lg font-bold font-mono ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Reputation */}
        <div className="bg-crypt-300/5 border border-crypt-300/10 rounded-xl p-3 mb-5 flex items-center justify-between">
          <span className="text-[11px] text-gray-600 font-mono uppercase tracking-widest">
            Reputation
          </span>
          <span className="text-crypt-300 font-bold font-mono text-lg">
            ⚡ {reputation}
          </span>
        </div>

        {/* Tapestry badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                tapestryConfigured ? "bg-emerald-400" : "bg-yellow-400"
              }`}
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
