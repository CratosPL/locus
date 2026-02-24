"use client";

import React, { useEffect, useState, useRef } from "react";
import { Activity } from "@/types";

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

// Simulated live Tapestry events that cycle in
const TAPESTRY_EVENTS: Activity[] = [
  { icon: "⚡", text: "phantom.sol claimed 0.12◎ drop", color: "#34d399", timestamp: 0 },
  { icon: "🪦", text: "wraith.sol created drop near Old Town", color: "#a78bfa", timestamp: 0 },
  { icon: "❤️", text: "spectre.sol liked your drop", color: "#ec4899", timestamp: 0 },
  { icon: "👻", text: "anon left ghost mark in Praga", color: "#8b5cf6", timestamp: 0 },
  { icon: "🏅", text: "lich.sol minted Phantom Hunter NFT", color: "#fbbf24", timestamp: 0 },
  { icon: "🗺️", text: "revenant.sol completed Vistula Trail", color: "#10b981", timestamp: 0 },
  { icon: "💬", text: "cipher.sol commented on a drop", color: "#60a5fa", timestamp: 0 },
  { icon: "👤", text: "dawn.sol followed phantom.sol", color: "#a78bfa", timestamp: 0 },
  { icon: "⚡", text: "keeper.sol claimed 0.25◎ treasure", color: "#34d399", timestamp: 0 },
  { icon: "🔥", text: "new drop appeared 230m from you", color: "#f59e0b", timestamp: 0 },
];

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function ActivityFeed({ activities, className = "" }: ActivityFeedProps) {
  const [feed, setFeed] = useState<Activity[]>([]);
  const [visible, setVisible] = useState(false);
  const [newItemId, setNewItemId] = useState<number | null>(null);
  const eventIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Merge real activities with simulated Tapestry events
  useEffect(() => {
    const initial = activities.slice(0, 3);
    setFeed(initial);
  }, []);

  // Sync real activities on top
  useEffect(() => {
    if (activities.length === 0) return;
    const latest = activities[0];
    setFeed(prev => {
      if (prev[0]?.timestamp === latest.timestamp) return prev;
      setNewItemId(latest.timestamp);
      setTimeout(() => setNewItemId(null), 600);
      return [latest, ...prev].slice(0, 6);
    });
  }, [activities]);

  // Auto-inject simulated Tapestry events every 6–12s
  useEffect(() => {
    const inject = () => {
      const event = TAPESTRY_EVENTS[eventIndexRef.current % TAPESTRY_EVENTS.length];
      const item: Activity = { ...event, timestamp: Date.now() };
      eventIndexRef.current++;
      setNewItemId(item.timestamp);
      setTimeout(() => setNewItemId(null), 600);
      setFeed(prev => [item, ...prev].slice(0, 6));
    };

    // First inject after 4s
    const first = setTimeout(() => {
      inject();
      timerRef.current = setInterval(inject, 7000 + Math.random() * 5000);
    }, 4000);

    return () => {
      clearTimeout(first);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Toggle visibility
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const t = setInterval(() => forceUpdate(n => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-void-100/90 border border-crypt-300/15 backdrop-blur cursor-pointer"
        onClick={() => setVisible(v => !v)}
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Live Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-gray-600 font-mono">Tapestry ↗</span>
          <span className="text-[8px] text-gray-600">{visible ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Feed items */}
      {visible && feed.map((a, i) => (
        <div
          key={`${a.timestamp}-${i}`}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            animation: newItemId === a.timestamp
              ? "feed-in 0.4s cubic-bezier(0.16,1,0.3,1)"
              : "none",
          }}
          className="px-3 py-2 rounded-lg bg-void-100/90 border border-crypt-300/10 backdrop-blur pointer-events-none"
        >
          <style>{`
            @keyframes feed-in {
              from { opacity: 0; transform: translateX(12px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          `}</style>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <span style={{ color: a.color }} className="text-[11px] flex-shrink-0">{a.icon}</span>
              <span className="text-[10px] text-gray-400 truncate leading-tight">{a.text}</span>
            </div>
            <span className="text-[8px] text-gray-700 flex-shrink-0 mt-0.5">{timeAgo(a.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
