"use client";

import React from "react";
import type { NFTBadge } from "@/types";

interface BadgeMintPopupProps {
  badge: NFTBadge;
  onDismiss: () => void;
  onMint: (badgeId: string) => void;
}

export default function BadgeMintPopup({ badge, onDismiss, onMint }: BadgeMintPopupProps) {
  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-72 bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up text-center">
        <div
          className="w-16 h-16 mx-auto mb-4"
          style={{ filter: `drop-shadow(0 0 14px ${badge.color}88)` }}
        >
          {typeof badge.icon === "function" ? (
            badge.icon(badge.color)
          ) : (
            <span className="text-6xl">{badge.icon}</span>
          )}
        </div>

        <h3 className="text-crypt-200 font-mono text-2xl font-bold mb-2">
          {badge.name}
        </h3>
        <p className="text-sm text-gray-400 font-mono mb-2">
          {badge.description}
        </p>

        <span
          className="inline-block text-xs font-mono font-bold px-3 py-1 rounded-full mb-6 uppercase"
          style={{
            color: badge.color,
            background: badge.color + "15",
            border: "1px solid " + badge.color + "33",
          }}
        >
          {badge.rarity}
        </span>

        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 rounded-xl border border-crypt-300/20 bg-transparent text-gray-500 font-mono text-sm cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={function () { onMint(badge.id); }}
            className="flex-[2] py-3 rounded-xl border-none bg-gradient-to-r from-crypt-300 to-crypt-500 text-white font-mono text-sm font-bold cursor-pointer shadow-lg active:scale-95"
          >
            🏅 Mint NFT Badge
          </button>
        </div>
      </div>
    </div>
  );
}
