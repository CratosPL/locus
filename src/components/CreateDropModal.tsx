"use client";

import React, { useState } from "react";
import { DropCategory } from "@/types";
import { CATEGORY_CONFIG } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";

interface CreateDropModalProps {
  onClose: () => void;
  onCreate: (data: {
    message: string;
    reward: number;
    category: DropCategory;
  }) => void;
  userPosition?: GeoPosition | null;
}

export default function CreateDropModal({
  onClose,
  onCreate,
  userPosition,
}: CreateDropModalProps) {
  const [message, setMessage] = useState("");
  const [reward, setReward] = useState("0.05");
  const [category, setCategory] = useState<DropCategory>("lore");

  const handleSubmit = () => {
    if (message.trim()) {
      onCreate({ message: message.trim(), reward: parseFloat(reward), category });
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[90%] max-w-[400px] bg-void-100/[0.98] border border-crypt-300/20 rounded-2xl p-6 animate-slide-up"
      >
        <h3 className="text-crypt-300 font-mono text-lg font-bold mb-2">
          🪦 Create New Drop
        </h3>

        {/* Location indicator */}
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-crypt-300/5 border border-crypt-300/10">
          <div
            className={`w-2 h-2 rounded-full ${
              userPosition ? "bg-emerald-400 animate-pulse" : "bg-yellow-400"
            }`}
          />
          <span className="text-[11px] text-gray-500 font-mono">
            {userPosition
              ? `📍 Dropping at ${userPosition.lat.toFixed(4)}, ${userPosition.lng.toFixed(4)}`
              : "📍 Using default location (enable GPS for real coords)"}
          </span>
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-[11px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Leave a message for the finder..."
            rows={3}
            maxLength={200}
            className="w-full p-3 rounded-xl border border-crypt-300/20 bg-crypt-300/5 text-crypt-200 font-mono text-sm resize-none outline-none focus:border-crypt-300/40 transition-colors"
          />
          <div className="text-right text-[10px] text-gray-700 mt-1">
            {message.length}/200
          </div>
        </div>

        {/* Reward + Category */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-[11px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">
              Reward (SOL)
            </label>
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              step="0.01"
              min="0.01"
              className="w-full p-3 rounded-xl border border-crypt-300/20 bg-crypt-300/5 text-emerald-400 font-mono text-base font-bold outline-none focus:border-crypt-300/40 transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-gray-600 font-mono mb-1.5 uppercase tracking-widest">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as DropCategory)}
              className="w-full p-3 rounded-xl border border-crypt-300/20 bg-void text-crypt-200 font-mono text-sm outline-none"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.icon} {val.label}
                </option>
              ))}
            </select>
          </div>
        </div>

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
            className="flex-[2] py-3 rounded-xl border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white font-mono text-sm font-bold cursor-pointer tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:from-crypt-400 hover:to-crypt-600 transition-all"
          >
            🪦 Drop It
          </button>
        </div>
      </div>
    </div>
  );
}
