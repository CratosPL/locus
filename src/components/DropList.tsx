"use client";

import React from "react";
import { Drop } from "@/types";
import { CATEGORY_CONFIG } from "@/utils/mockData";

interface DropListProps {
  drops: Drop[];
  onSelectDrop: (drop: Drop) => void;
}

export default function DropList({ drops, onSelectDrop }: DropListProps) {
  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-crypt-300 font-mono mb-4 text-sm tracking-[0.2em] uppercase">
        All Drops ({drops.length})
      </h3>

      <div className="space-y-2">
        {drops.map((drop) => {
          const cat = CATEGORY_CONFIG[drop.category];
          return (
            <button
              key={drop.id}
              onClick={() => onSelectDrop(drop)}
              className={`w-full text-left p-3.5 rounded-xl transition-all ${
                drop.isClaimed
                  ? "bg-gray-900/40 border border-gray-800/30"
                  : "bg-void-100/80 border hover:border-opacity-50"
              }`}
              style={{
                borderColor: drop.isClaimed ? undefined : `${cat.color}22`,
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg flex-shrink-0">{cat.icon}</span>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-mono truncate ${
                        drop.isClaimed ? "text-gray-600" : "text-crypt-200"
                      }`}
                    >
                      {drop.message}
                    </p>
                    <p className="text-[10px] text-gray-700 font-mono mt-1">
                      {drop.createdBy} • {drop.createdAt}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-sm font-bold font-mono flex-shrink-0 ml-3 ${
                    drop.isClaimed ? "text-gray-700" : "text-emerald-400"
                  }`}
                >
                  {drop.isClaimed ? "✓" : `${drop.finderReward}◎`}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
