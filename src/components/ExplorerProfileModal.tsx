"use client";

import React, { useState } from "react";
import { UserPlus, Check, MessageSquare, X, ExternalLink } from "lucide-react";

interface ExplorerProfileModalProps {
  username: string;
  walletAddress?: string;
  dropsCreated?: number;
  dropsClaimed?: number;
  reputation?: number;
  isFollowing?: boolean;
  onFollow: (username: string) => Promise<boolean>;
  onSendMessage: (username: string, message: string) => void;
  onClose: () => void;
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

export default function ExplorerProfileModal({
  username,
  walletAddress,
  dropsCreated = 0,
  dropsClaimed = 0,
  reputation = 0,
  isFollowing = false,
  onFollow,
  onSendMessage,
  onClose,
}: ExplorerProfileModalProps) {
  const [followed, setFollowed] = useState(isFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [dmText, setDmText] = useState("");
  const [dmSent, setDmSent] = useState(false);

  const rank = getRank(reputation);
  const shortWallet = walletAddress
    ? walletAddress.slice(0, 4) + "..." + walletAddress.slice(-4)
    : null;

  async function handleFollow() {
    setFollowLoading(true);
    const ok = await onFollow(username);
    if (ok) setFollowed(true);
    setFollowLoading(false);
  }

  function handleSendDM() {
    if (!dmText.trim()) return;
    onSendMessage(username, dmText.trim());
    setDmSent(true);
    setDmText("");
    setTimeout(() => { setDmSent(false); setShowDM(false); }, 2000);
  }

  return (
    <div
      className="fixed inset-0 z-[6000] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full sm:w-[360px] max-w-[420px] rounded-t-2xl sm:rounded-2xl border border-crypt-300/20 overflow-hidden"
        style={{
          background: "#0a0612",
          fontFamily: "'JetBrains Mono', monospace",
          animation: "explorer-up 0.3s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <style>{`
          @keyframes explorer-up {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Top gradient bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-crypt-300 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-crypt-300/20 to-crypt-500/10 border border-crypt-300/20 flex items-center justify-center">
              <span className="text-xl font-black text-crypt-300">
                {username.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-black text-crypt-100">@{username}</div>
              {shortWallet && (
                <div className="text-[10px] text-gray-600 mt-0.5">{shortWallet}</div>
              )}
              <div
                className="text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full inline-block"
                style={{ color: rank.color, background: rank.color + "15", border: `1px solid ${rank.color}30` }}
              >
                {rank.label}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-400 bg-transparent border-none cursor-pointer p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mx-5 mb-4">
          {[
            { label: "Created", value: dropsCreated, color: "#a78bfa" },
            { label: "Claimed", value: dropsClaimed, color: "#34d399" },
            { label: "Rep", value: reputation, color: rank.color },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-2.5 text-center">
              <div className="text-base font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[8px] text-gray-600 uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* DM section */}
        {showDM && (
          <div className="mx-5 mb-3 p-3 rounded-xl bg-white/[0.03] border border-crypt-300/15">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-2">
              Message via Tapestry
            </div>
            {dmSent ? (
              <div className="text-[11px] text-emerald-400 text-center py-2 flex items-center justify-center gap-2">
                <Check size={14} /> Message sent on-chain
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dmText}
                  onChange={e => setDmText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleSendDM(); }}
                  placeholder="Hey, cool drop!"
                  autoFocus
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-gray-300 outline-none placeholder-gray-700 font-mono"
                  style={{ fontFamily: "inherit" }}
                />
                <button
                  onClick={handleSendDM}
                  className="px-3 py-2 rounded-lg border-none bg-gradient-to-r from-crypt-300 to-crypt-500 text-white text-[11px] font-bold cursor-pointer"
                >
                  Send
                </button>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mx-5 mb-5">
          <button
            onClick={handleFollow}
            disabled={followed || followLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[11px] font-bold font-mono transition-all cursor-pointer"
            style={{
              background: followed ? "rgba(167,139,250,0.08)" : "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.15))",
              borderColor: followed ? "rgba(167,139,250,0.3)" : "rgba(167,139,250,0.4)",
              color: followed ? "#a78bfa" : "#c4b5fd",
            }}
          >
            {followed ? <><Check size={13} /> Following</> : followLoading ? "..." : <><UserPlus size={13} /> Follow</>}
          </button>

          <button
            onClick={() => setShowDM(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-[11px] font-bold font-mono transition-all cursor-pointer hover:bg-white/10"
          >
            <MessageSquare size={13} />
            {showDM ? "Cancel" : "Message"}
          </button>
        </div>

        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="text-center py-2 text-[8px] text-gray-700">
          Powered by Tapestry Protocol
        </div>
      </div>
    </div>
  );
}
