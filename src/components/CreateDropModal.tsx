"use client";

import React, { useState } from "react";
import { DropCategory, GhostEmoji } from "@/types";
import { CATEGORY_CONFIG, GHOST_EMOJIS } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";

type CreateMode = "drop" | "ghost";

interface CreateDropModalProps {
  onClose: () => void;
  onCreate: (data: {
    message: string;
    reward: number;
    category: DropCategory;
  }) => void;
  onCreateGhost: (data: {
    message: string;
    emoji: GhostEmoji;
  }) => void;
  userPosition?: GeoPosition | null;
  isConnected: boolean;
}

var TOKEN_OPTIONS = [
  { id: "SOL", name: "SOL", icon: "◎", active: true },
  { id: "BONK", name: "BONK", icon: "🐕", active: false },
  { id: "USDC", name: "USDC", icon: "💲", active: false },
];

export default function CreateDropModal({
  onClose, onCreate, onCreateGhost, userPosition, isConnected,
}: CreateDropModalProps) {
  var [mode, setMode] = useState<CreateMode>("drop");
  var [message, setMessage] = useState("");
  var [reward, setReward] = useState("0.05");
  var [category, setCategory] = useState<DropCategory>("lore");
  var [selectedToken, setSelectedToken] = useState("SOL");
  var [ghostEmoji, setGhostEmoji] = useState<GhostEmoji>("👻");

  var handleSubmit = function() {
    if (!message.trim()) return;
    if (mode === "drop") {
      onCreate({ message: message.trim(), reward: parseFloat(reward), category: category });
    } else {
      onCreateGhost({ message: message.trim(), emoji: ghostEmoji });
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={function(e) { e.stopPropagation(); }}
        className="w-[92%] max-w-[420px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-5 animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-crypt-300 font-mono text-lg font-bold">
            {mode === "drop" ? "🪦 New Drop" : "👻 Ghost Mark"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-crypt-300 transition-colors bg-transparent border-none cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-4 p-1 rounded-xl bg-void/60 border border-crypt-300/10">
          <button
            onClick={function() { setMode("drop"); }}
            className={"flex-1 py-2 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border-none " + (
              mode === "drop"
                ? "bg-crypt-300/15 text-crypt-300"
                : "bg-transparent text-gray-600 hover:text-gray-400"
            )}
          >
            🪦 Drop (SOL)
          </button>
          <button
            onClick={function() { setMode("ghost"); }}
            className={"flex-1 py-2 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer border-none " + (
              mode === "ghost"
                ? "bg-purple-500/15 text-purple-400"
                : "bg-transparent text-gray-600 hover:text-gray-400"
            )}
          >
            👻 Ghost Mark
          </button>
        </div>

        {/* Ghost mode explainer */}
        {mode === "ghost" && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-purple-500/5 border border-purple-500/15 text-[10px] text-purple-300/70 font-mono">
            Ghost marks are ephemeral — they disappear after 24h. No SOL reward, just whispers on the map. Saved to Tapestry social graph.
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-crypt-300/5 border border-crypt-300/10">
          <div className={"w-2 h-2 rounded-full " + (userPosition ? "bg-emerald-400 animate-pulse" : "bg-yellow-400")} />
          <span className="text-[11px] text-gray-500 font-mono">
            {userPosition
              ? "📍 " + userPosition.lat.toFixed(4) + ", " + userPosition.lng.toFixed(4)
              : "📍 Default location (enable GPS)"}
          </span>
        </div>

        {mode === "drop" ? (
          <>
            {/* Category selector */}
            <div className="mb-3">
              <label className="block text-[10px] text-gray-600 font-mono mb-2 uppercase tracking-widest">Category</label>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(CATEGORY_CONFIG).map(function([key, val]) {
                  var isActive = category === key;
                  return (
                    <button
                      key={key}
                      onClick={function() { setCategory(key as DropCategory); }}
                      className={"flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all cursor-pointer " + (
                        isActive ? "border-opacity-50 bg-opacity-20" : "border-crypt-300/10 bg-transparent text-gray-600 hover:border-crypt-300/20"
                      )}
                      style={isActive ? { borderColor: val.color + "77", background: val.color + "15", color: val.color } : undefined}
                    >
                      <span>{val.icon}</span>
                      {val.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div className="mb-3">
              <label className="block text-[10px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">Message</label>
              <textarea
                value={message} onChange={function(e) { setMessage(e.target.value); }}
                placeholder="Leave a message for the finder..."
                rows={3} maxLength={200}
                className="w-full p-3 rounded-xl border border-crypt-300/20 bg-crypt-300/5 text-crypt-200 font-mono text-sm resize-none outline-none focus:border-crypt-300/40 transition-colors placeholder-gray-700"
              />
              <div className="text-right text-[10px] text-gray-700 mt-1">{message.length}/200</div>
            </div>

            {/* Token selector */}
            <div className="mb-3">
              <label className="block text-[10px] text-gray-600 font-mono mb-2 uppercase tracking-widest">Reward Token</label>
              <div className="flex gap-2">
                {TOKEN_OPTIONS.map(function(token) {
                  var isSelected = selectedToken === token.id;
                  return (
                    <button
                      key={token.id}
                      onClick={function() { if (token.active) setSelectedToken(token.id); }}
                      className={"relative flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border font-mono text-[11px] transition-all " + (
                        !token.active ? "border-gray-800/30 bg-gray-900/20 text-gray-700 cursor-not-allowed"
                          : isSelected ? "border-crypt-300/50 bg-crypt-300/10 text-crypt-200 cursor-pointer"
                          : "border-crypt-300/10 bg-transparent text-gray-600 cursor-pointer hover:border-crypt-300/20"
                      )}
                    >
                      <span className="text-lg">{token.icon}</span>
                      <span className="font-bold">{token.name}</span>
                      {!token.active && <span className="absolute -top-1.5 right-1 text-[8px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-full">Soon</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reward amount */}
            <div className="mb-4">
              <label className="block text-[10px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">Reward Amount</label>
              <div className="relative">
                <input
                  type="number" value={reward}
                  onChange={function(e) { setReward(e.target.value); }}
                  step="0.01" min="0.01"
                  className="w-full p-3 pr-14 rounded-xl border border-crypt-300/20 bg-crypt-300/5 text-emerald-400 font-mono text-lg font-bold outline-none focus:border-crypt-300/40 transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-mono text-sm">{selectedToken}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {["0.01", "0.05", "0.1", "0.25"].map(function(val) {
                  return (
                    <button
                      key={val}
                      onClick={function() { setReward(val); }}
                      className={"flex-1 py-1.5 rounded-lg border font-mono text-[11px] transition-all cursor-pointer " + (
                        reward === val ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400" : "border-crypt-300/10 bg-transparent text-gray-600 hover:border-crypt-300/20"
                      )}
                    >
                      {val} ◎
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Ghost emoji selector */}
            <div className="mb-3">
              <label className="block text-[10px] text-gray-600 font-mono mb-2 uppercase tracking-widest">Emoji</label>
              <div className="grid grid-cols-4 gap-2">
                {GHOST_EMOJIS.map(function(g) {
                  var isActive = ghostEmoji === g.emoji;
                  return (
                    <button
                      key={g.emoji}
                      onClick={function() { setGhostEmoji(g.emoji); }}
                      className={"flex flex-col items-center gap-1 py-2 rounded-xl border transition-all cursor-pointer " + (
                        isActive
                          ? "border-purple-400/50 bg-purple-400/10 text-purple-300"
                          : "border-crypt-300/10 bg-transparent text-gray-600 hover:border-crypt-300/20"
                      )}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className="text-[8px] font-mono">{g.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ghost message */}
            <div className="mb-4">
              <label className="block text-[10px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">Message</label>
              <textarea
                value={message} onChange={function(e) { setMessage(e.target.value); }}
                placeholder="Leave a whisper for passersby..."
                rows={2} maxLength={120}
                className="w-full p-3 rounded-xl border border-purple-500/20 bg-purple-500/5 text-purple-200 font-mono text-sm resize-none outline-none focus:border-purple-500/40 transition-colors placeholder-gray-700"
              />
              <div className="flex justify-between text-[10px] text-gray-700 mt-1">
                <span>Disappears in 24h</span>
                <span>{message.length}/120</span>
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-crypt-300/20 bg-transparent text-gray-600 font-mono text-sm cursor-pointer hover:border-crypt-300/40 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim()}
            className={"flex-[2] py-3 rounded-xl border-none text-white font-mono text-sm font-bold cursor-pointer tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed transition-all " + (
              mode === "drop"
                ? "bg-gradient-to-br from-crypt-300 to-crypt-500 hover:from-crypt-400 hover:to-crypt-600 shadow-[0_4px_15px_rgba(167,139,250,0.25)]"
                : "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 shadow-[0_4px_15px_rgba(139,92,246,0.25)]"
            )}
          >
            {mode === "drop" ? "🪦 Drop It" : "👻 Haunt It"}
          </button>
        </div>
      </div>
    </div>
  );
}
