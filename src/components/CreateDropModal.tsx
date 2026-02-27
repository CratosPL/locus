"use client";

import React, { useState, useEffect, useRef } from "react";
import { DropCategory, GhostEmoji } from "@/types";
import { CATEGORY_CONFIG, GHOST_EMOJIS } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";
import {
  Twitter,
  Link as LinkIcon,
  Info,
  Heart,
  Gift,
  Camera,
  Ghost,
  MapPin,
  History,
  Navigation,
  Lock,
  Coins,
  Sparkles,
  X,
  Plus,
  Music
} from "lucide-react";
import { useSound } from "@/hooks/useSound";

type CreateMode = "drop" | "ghost";

interface CreateDropModalProps {
  onClose: () => void;
  onCreate: (data: {
    message: string;
    reward: number;
    category: DropCategory;
    twitterHandle?: string;
    externalLink?: string;
    dropType: "crypto" | "memory";
    audiusTrackId?: string;
    audiusTrackName?: string;
    audiusArtist?: string;
  }) => void;
  onCreateGhost: (data: {
    message: string;
    emoji: GhostEmoji;
  }) => void;
  userPosition?: GeoPosition | null;
  isConnected: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: () => void;
}

var TOKEN_OPTIONS = [
  { id: "SOL", name: "SOL", icon: "◎", active: true },
  { id: "BONK", name: "BONK", icon: "🐕", active: false },
  { id: "USDC", name: "USDC", icon: "💲", active: false },
];

export default function CreateDropModal({
  onClose, onCreate, onCreateGhost, userPosition, isConnected, pickedLocation, onPickLocation,
}: CreateDropModalProps) {
  var [mode, setMode] = useState<CreateMode>("drop");
  var [message, setMessage] = useState("");
  var [reward, setReward] = useState("0.05");
  var [category, setCategory] = useState<DropCategory>("lore");
  var [selectedToken, setSelectedToken] = useState("SOL");
  var [ghostEmoji, setGhostEmoji] = useState<GhostEmoji>("👻");
  var [twitter, setTwitter] = useState("");
  var [link, setLink] = useState("");
  var [dropType, setDropType] = useState<"crypto" | "memory">("crypto");
  var [audiusTrackId, setAudiusTrackId] = useState("");
  var [audiusTrackName, setAudiusTrackName] = useState("");
  var [audiusArtist, setAudiusArtist] = useState("");
  var [audiusQuery, setAudiusQuery] = useState("");
  var [audiusResults, setAudiusResults] = useState<{ id: string; title: string; artist: string; artwork?: string }[]>([]);
  var [audiusSearching, setAudiusSearching] = useState(false);
  var audiusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { playSound } = useSound();

  // Audius search with debounce
  useEffect(function() {
    if (!audiusQuery.trim() || audiusTrackId) return;
    if (audiusTimerRef.current) clearTimeout(audiusTimerRef.current);
    audiusTimerRef.current = setTimeout(async function() {
      setAudiusSearching(true);
      try {
        var res = await fetch(
          "/api/audius?query=" + encodeURIComponent(audiusQuery) + "&limit=6"
        );
        var json = await res.json();
        var tracks = (json.data || []).map(function(t: any) {
          return {
            id: t.id,
            title: t.title,
            artist: t.user?.name || t.user?.handle || "Unknown",
            artwork: t.artwork?.["150x150"] || t.artwork?.["480x480"],
          };
        });
        setAudiusResults(tracks);
      } catch {
        setAudiusResults([]);
      } finally {
        setAudiusSearching(false);
      }
    }, 500);
    return function() {
      if (audiusTimerRef.current) clearTimeout(audiusTimerRef.current);
    };
  }, [audiusQuery, audiusTrackId]);

  var handleSubmit = function() {
    if (!message.trim()) return;
    if (mode === "drop") {
      onCreate({
        message: message.trim(),
        reward: dropType === "crypto" ? parseFloat(reward) : 0,
        category: category,
        twitterHandle: twitter.trim() || undefined,
        externalLink: link.trim() || undefined,
        dropType: dropType,
        audiusTrackId: audiusTrackId.trim() || undefined,
        audiusTrackName: audiusTrackName || undefined,
        audiusArtist: audiusArtist || undefined,
      });
      playSound("success");
    } else {
      onCreateGhost({ message: message.trim(), emoji: ghostEmoji });
      playSound("ghost");
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
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-crypt-300" />
            <h3 className="text-crypt-300 font-mono text-sm font-black tracking-widest uppercase">
              {mode === "drop" ? (dropType === "memory" ? "Record Memory" : "Create Drop") : "Leave Mark"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-crypt-300 transition-colors bg-white/5 p-1.5 rounded-lg border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 mb-6 p-1.5 rounded-2xl bg-void/60 border border-white/5">
          <button
            onClick={function() { setMode("drop"); playSound("click"); }}
            className={"flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer border-none " + (
              mode === "drop"
                ? "bg-crypt-300/10 text-crypt-300 shadow-[inset_0_0_12px_rgba(167,139,250,0.1)] border border-crypt-300/20"
                : "bg-transparent text-gray-600 hover:text-gray-400"
            )}
          >
            <Plus size={12} />
            Drop
          </button>
          <button
            onClick={function() { setMode("ghost"); playSound("click"); }}
            className={"flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-mono text-[10px] font-black tracking-widest uppercase transition-all cursor-pointer border-none " + (
              mode === "ghost"
                ? "bg-purple-500/10 text-purple-400 shadow-[inset_0_0_12px_rgba(168,85,247,0.1)] border border-purple-500/20"
                : "bg-transparent text-gray-600 hover:text-gray-400"
            )}
          >
            <Ghost size={12} />
            Mark
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
          <div className={"w-2 h-2 rounded-full " + (pickedLocation ? "bg-crypt-300 animate-pulse" : userPosition ? "bg-emerald-400 animate-pulse" : "bg-yellow-400")} />
          <span className="text-[11px] text-gray-500 font-mono flex-1">
            {pickedLocation
              ? "📌 " + pickedLocation.lat.toFixed(4) + ", " + pickedLocation.lng.toFixed(4) + " (picked)"
              : userPosition
              ? "📍 " + userPosition.lat.toFixed(4) + ", " + userPosition.lng.toFixed(4)
              : "📍 Default location (enable GPS)"}
          </span>
          {onPickLocation && (
            <button
              onClick={function() { onPickLocation(); }}
              className="text-[9px] font-mono font-bold text-crypt-300 bg-crypt-300/10 px-2 py-1 rounded-md border border-crypt-300/20 cursor-pointer hover:bg-crypt-300/20 transition-colors"
            >
              📌 Pick on map
            </button>
          )}
        </div>

        {mode === "drop" ? (
          <>
            {/* Drop Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setDropType("crypto")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${dropType === "crypto" ? "bg-crypt-300/10 border-crypt-300/40 text-crypt-300" : "bg-transparent border-crypt-300/10 text-gray-600"}`}
              >
                <Gift size={14} />
                <span className="text-[10px] font-mono font-bold uppercase">Crypto Bounty</span>
              </button>
              <button
                onClick={() => setDropType("memory")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${dropType === "memory" ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" : "bg-transparent border-crypt-300/10 text-gray-600"}`}
              >
                <Camera size={14} />
                <span className="text-[10px] font-mono font-bold uppercase">Memory Drop</span>
              </button>
            </div>

            {dropType === "memory" && (
              <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-[10px] text-emerald-300/70 font-mono">
                Memory drops are social marks. No SOL reward required. Your message and location are saved on-chain and to Tapestry.
              </div>
            )}

            {/* Category selector */}
            <div className="mb-6">
              <label className="block text-[9px] text-gray-600 font-mono font-black mb-3 uppercase tracking-[0.2em]">Select Archetype</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CATEGORY_CONFIG).map(function([key, val]) {
                  var isActive = category === key;
                  const CategoryIcon = key === 'lore' ? History : key === 'quest' ? Navigation : key === 'secret' ? Lock : key === 'ritual' ? MapPin : Coins;
                  return (
                    <button
                      key={key}
                      onClick={function() { setCategory(key as DropCategory); }}
                      className={"flex flex-col items-center gap-2 p-3 rounded-2xl font-mono text-[10px] border transition-all cursor-pointer " + (
                        isActive ? "" : "border-white/5 bg-white/[0.02] text-gray-600 hover:border-white/10"
                      )}
                      style={isActive ? { borderColor: val.color + "66", background: val.color + "10", color: val.color } : undefined}
                    >
                      <CategoryIcon size={18} />
                      <span className="font-bold">{val.label}</span>
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
            {dropType === "crypto" && (
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
            )}

            {/* Reward amount (only if crypto) */}
            {dropType === "crypto" && (
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
            )}

            {/* Social & Music Links */}
            <div className="mb-4 space-y-3">
              <label className="block text-[10px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">Metadata (Optional)</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <Twitter size={14} />
                </div>
                <input
                  type="text" value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="X (Twitter) handle"
                  className="w-full pl-9 p-2.5 rounded-xl border border-crypt-300/10 bg-crypt-300/5 text-crypt-200 font-mono text-xs outline-none focus:border-crypt-300/30 transition-colors"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  <LinkIcon size={14} />
                </div>
                <input
                  type="text" value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="External link / Portfolio"
                  className="w-full pl-9 p-2.5 rounded-xl border border-crypt-300/10 bg-crypt-300/5 text-crypt-200 font-mono text-xs outline-none focus:border-crypt-300/30 transition-colors"
                />
              </div>
              {/* Audius music search */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400">
                    <Music size={14} />
                  </div>
                  {audiusTrackId ? (
                    <div className="w-full pl-9 pr-9 p-2.5 rounded-xl border border-pink-400/30 bg-pink-400/8 text-crypt-200 font-mono text-xs flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-pink-300 font-bold truncate">{audiusTrackName}</div>
                        <div className="text-gray-500 text-[10px] truncate">{audiusArtist}</div>
                      </div>
                      <button
                        onClick={function() { setAudiusTrackId(""); setAudiusTrackName(""); setAudiusArtist(""); setAudiusQuery(""); setAudiusResults([]); }}
                        className="ml-2 text-gray-600 hover:text-red-400 bg-transparent border-none cursor-pointer flex-shrink-0"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={audiusQuery}
                      onChange={function(e) { setAudiusQuery(e.target.value); }}
                      placeholder="Search Audius track by name..."
                      className="w-full pl-9 p-2.5 rounded-xl border border-crypt-300/10 bg-crypt-300/5 text-crypt-200 font-mono text-xs outline-none focus:border-pink-400/30 transition-colors"
                    />
                  )}
                </div>

                {/* Search results */}
                {!audiusTrackId && (audiusSearching || audiusResults.length > 0) && (
                  <div className="mt-1.5 rounded-xl border border-white/8 bg-void-100/95 overflow-hidden">
                    {audiusSearching ? (
                      <div className="p-3 text-[10px] text-gray-600 font-mono text-center">Searching Audius...</div>
                    ) : audiusResults.map(function(track) {
                      return (
                        <button
                          key={track.id}
                          onClick={function() {
                            setAudiusTrackId(track.id);
                            setAudiusTrackName(track.title);
                            setAudiusArtist(track.artist);
                            setAudiusResults([]);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-pink-400/8 transition-colors cursor-pointer border-none bg-transparent text-left border-b border-white/5 last:border-none"
                        >
                          {track.artwork ? (
                            <img src={track.artwork} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-pink-400/10 flex items-center justify-center flex-shrink-0">
                              <Music size={14} className="text-pink-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-[11px] font-bold text-gray-200 truncate">{track.title}</div>
                            <div className="text-[9px] text-gray-500 truncate">{track.artist}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
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
                ? (dropType === "memory"
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 shadow-[0_4px_15px_rgba(52,211,153,0.25)]"
                    : "bg-gradient-to-br from-crypt-300 to-crypt-500 hover:from-crypt-400 hover:to-crypt-600 shadow-[0_4px_15px_rgba(167,139,250,0.25)]")
                : "bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 shadow-[0_4px_15px_rgba(139,92,246,0.25)]"
            )}
          >
            {mode === "drop" ? (dropType === "memory" ? "📸 Record Memory" : "🪦 Drop It") : "👻 Haunt It"}
          </button>
        </div>
      </div>
    </div>
  );
}
