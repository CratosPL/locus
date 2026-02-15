"use client";

import React, { useState } from "react";
import { Drop, DropCategory } from "@/types";
import { CATEGORY_CONFIG } from "@/utils/mockData";

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
    <div className="p-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-crypt-300 font-mono text-sm tracking-[0.2em] uppercase">
          Drops ({activeCount} active)
        </h3>
        <div className="flex gap-1.5">
          {(["reward", "date"] as const).map(function(s) {
            return (
              <button
                key={s}
                onClick={function() { setSortBy(s); }}
                className={"px-2 py-1 rounded-md font-mono text-[9px] border cursor-pointer transition-colors " + (
                  sortBy === s
                    ? "border-crypt-300/30 bg-crypt-300/10 text-crypt-300"
                    : "border-transparent bg-transparent text-gray-700 hover:text-gray-500"
                )}
              >
                {s === "reward" ? "💰 Value" : "📅 Recent"}
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
          return (
            <button
              key={key}
              onClick={function() { setFilter(key as DropCategory); }}
              className={"flex items-center gap-1 px-3 py-1 rounded-full font-mono text-[10px] border cursor-pointer transition-all flex-shrink-0 " + (
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
              <span>{val.icon}</span>
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
          return (
            <button
              key={drop.id}
              onClick={function() { onSelectDrop(drop); }}
              className={"w-full text-left p-3.5 rounded-xl transition-all cursor-pointer bg-transparent " + (
                drop.isClaimed
                  ? "bg-gray-900/40 border border-gray-800/30"
                  : "bg-void-100/80 border hover:border-opacity-50"
              )}
              style={{
                borderColor: drop.isClaimed ? undefined : cat.color + "22",
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                    style={{ background: cat.color + "15" }}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={"text-xs font-mono truncate " + (
                        drop.isClaimed ? "text-gray-600 line-through" : "text-crypt-200"
                      )}
                    >
                      {drop.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-700 font-mono">
                        {drop.createdBy}
                      </span>
                      {dist && (
                        <span className="text-[10px] text-gray-700 font-mono">
                          · {dist}
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
          <div className="text-center py-8 text-gray-700 font-mono text-sm">
            No drops in this category yet
          </div>
        )}
      </div>
    </div>
  );
}
