"use client";

import React, { useState } from "react";
import { Drop, DropCategory } from "@/types";
import { CATEGORY_CONFIG } from "@/utils/mockData";
import {
  Filter,
  ArrowUpDown,
  Coins,
  Clock,
  History,
  Navigation,
  Lock,
  MapPin,
  Activity,
  Twitter,
  Link as LinkIcon,
  Ghost,
  ScrollText
} from "lucide-react";

interface DropListProps {
  drops: Drop[];
  onSelectDrop: (drop: Drop) => void;
  formatDistance?: (lat: number, lng: number) => string;
}

export default function DropList({ drops, onSelectDrop, formatDistance }: DropListProps) {
  const [filter, setFilter] = useState<DropCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"reward" | "date">("reward");

  var filtered = drops.filter(function(d) {
    return filter === "all" || d.category === filter;
  });

  filtered.sort(function(a, b) {
    if (sortBy === "reward") return b.finderReward - a.finderReward;
    return b.createdAt.localeCompare(a.createdAt);
  });

  var activeCount = drops.filter(function(d) { return !d.isClaimed; }).length;

  return (
    <div className="p-5 overflow-y-auto h-full bg-void">
      <div className="flex items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2">
          <ScrollText size={16} className="text-crypt-300" />
          <h3 className="text-crypt-300 font-mono text-xs font-black tracking-[0.2em] uppercase">
            Spectral Vault
          </h3>
        </div>
        <div className="flex gap-1.5">
          {(["reward", "date"] as const).map(function(s) {
            return (
              <button
                key={s}
                onClick={function() { setSortBy(s); }}
                className={"flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[9px] border cursor-pointer transition-colors " + (
                  sortBy === s
                    ? "border-crypt-300/30 bg-crypt-300/10 text-crypt-300"
                    : "border-transparent bg-transparent text-gray-700 hover:text-gray-500"
                )}
              >
                {s === "reward" ? <Coins size={10} /> : <Clock size={10} />}
                {s === "reward" ? "Value" : "Recent"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={function() { setFilter("all"); }}
          className={"px-3 py-1 rounded-full font-mono text-[10px] border cursor-pointer transition-all " + (
            filter === "all"
              ? "border-crypt-300/30 bg-crypt-300/10 text-crypt-300"
              : "border-crypt-300/10 bg-transparent text-gray-600 hover:border-crypt-300/20"
          )}
        >
          All
        </button>
        {Object.entries(CATEGORY_CONFIG).map(function([key, val]) {
          var count = drops.filter(function(d) { return d.category === key; }).length;
          const CategoryIcon = key === 'lore' ? History : key === 'quest' ? Navigation : key === 'secret' ? Lock : key === 'ritual' ? MapPin : Coins;
          return (
            <button
              key={key}
              onClick={function() { setFilter(key as DropCategory); }}
              className={"flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] border cursor-pointer transition-all flex-shrink-0 " + (
                filter === key
                  ? "border-opacity-40 bg-opacity-10"
                  : "border-crypt-300/10 bg-transparent text-gray-600 hover:border-crypt-300/20"
              )}
              style={filter === key ? {
                borderColor: val.color + "66",
                background: val.color + "15",
                color: val.color,
              } : undefined}
            >
              <CategoryIcon size={12} />
              {val.label}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Drop list */}
      <div className="space-y-2">
        {filtered.map(function(drop) {
          var cat = CATEGORY_CONFIG[drop.category];
          var dist = formatDistance ? formatDistance(drop.location.lat, drop.location.lng) : null;
          const CategoryIcon = drop.category === 'lore' ? History : drop.category === 'quest' ? Navigation : drop.category === 'secret' ? Lock : drop.category === 'ritual' ? MapPin : Coins;
          return (
            <button
              key={drop.id}
              onClick={function() { onSelectDrop(drop); }}
              className={"w-full text-left p-4 rounded-2xl transition-all cursor-pointer bg-transparent shadow-sm " + (
                drop.isClaimed
                  ? "bg-white/[0.02] border border-white/[0.05] opacity-60"
                  : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05] hover:translate-x-1"
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: cat.color + "15", color: cat.color }}
                  >
                    <CategoryIcon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={"text-[13px] font-mono truncate " + (
                        drop.isClaimed ? "text-gray-600 line-through" : "text-crypt-100 font-bold"
                      )}
                    >
                      {drop.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-600 font-mono flex items-center gap-1">
                        <Activity size={10} />
                        {drop.createdBy}
                      </span>
                      {dist && (
                        <span className="text-[10px] text-gray-600 font-mono">
                          · {dist}
                        </span>
                      )}
                      {(drop.twitterHandle || drop.externalLink) && (
                        <span className="flex gap-1.5 ml-1">
                          {drop.twitterHandle && <Twitter size={10} className="text-gray-700" />}
                          {drop.externalLink && <LinkIcon size={10} className="text-gray-700" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end flex-shrink-0 ml-3">
                  <span
                    className={"text-sm font-bold font-mono " + (
                      drop.isClaimed ? "text-gray-700" : "text-emerald-400"
                    )}
                  >
                    {drop.isClaimed ? "✓" : drop.finderReward + " ◎"}
                  </span>
                  <span
                    className="text-[9px] font-mono mt-0.5"
                    style={{ color: cat.color + "88" }}
                  >
                    {cat.label}
                  </span>
                </div>
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-crypt-300/5 flex items-center justify-center mb-4 text-crypt-300/20">
              <Ghost size={40} />
            </div>
            <h4 className="text-crypt-200 font-mono text-sm font-bold mb-2">
              {filter === "all" ? "No drops yet" : "No " + CATEGORY_CONFIG[filter as DropCategory].label.toLowerCase() + " drops"}
            </h4>
            <p className="text-gray-600 font-mono text-[11px] leading-relaxed max-w-[240px]">
              {filter === "all"
                ? "The graveyard is quiet... Be the first to drop a secret on the map."
                : "No drops in this category. Try another filter or create one yourself."
              }
            </p>
            <div className="mt-4 px-4 py-2 rounded-full border border-crypt-300/15 bg-crypt-300/5">
              <span className="text-[10px] text-crypt-300 font-mono">
                Tap + to create a drop
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
