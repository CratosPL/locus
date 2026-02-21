"use client";

import React from "react";
import { QuestTrail } from "@/types";
import { Compass, CheckCircle2 } from "lucide-react";

interface QuestTrailsProps {
  trails: QuestTrail[];
  trailProgress: Record<string, Set<string>>; // trailId -> set of visited waypoint ids
  activeTrailId: string | null;
  onSelectTrail: (trail: QuestTrail) => void;
  onStartTrail: (trailId: string) => void;
}

function getDifficultyStyle(d: string) {
  if (d === "easy") return { color: "#34d399", bg: "#34d39915", border: "#34d39933" };
  if (d === "medium") return { color: "#fbbf24", bg: "#fbbf2415", border: "#fbbf2433" };
  return { color: "#ef4444", bg: "#ef444415", border: "#ef444433" };
}

export default function QuestTrails({ trails, trailProgress, activeTrailId, onSelectTrail, onStartTrail }: QuestTrailsProps) {
  return (
    <div className="h-full overflow-y-auto px-3 py-3 space-y-2">
      {/* Header */}
      <div className="text-center mb-4 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-crypt-300/10 flex items-center justify-center mb-2">
          <Compass className="text-crypt-300" size={24} />
        </div>
        <h2 className="text-lg font-extrabold text-crypt-100 font-mono tracking-wider">
          Quest Trails
        </h2>
        <p className="text-[10px] text-gray-600 font-mono mt-1">
          Follow waypoints, complete quests, earn bonus SOL
        </p>
      </div>

      {trails.map(function(trail) {
        var isSunrise = trail.id === "trail-sunrise";
        var progress = trailProgress[trail.id];
        var visited = progress ? progress.size : 0;
        var total = trail.waypoints.length;
        var pct = Math.round((visited / total) * 100);
        var isActive = activeTrailId === trail.id;
        var isComplete = visited >= total;
        var diff = getDifficultyStyle(trail.difficulty);

        return (
          <div
            key={trail.id}
            className={"p-4 rounded-2xl border transition-all " + (
              isActive
                ? "bg-gradient-to-r from-crypt-300/10 to-crypt-500/10 border-crypt-300/30"
                : isComplete
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-void-100/60 border-crypt-300/10 hover:border-crypt-300/20"
            )}
          >
            {/* Trail header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: trail.color + "15", border: "1px solid " + trail.color + "33" }}
                >
                  {trail.icon}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-crypt-200 font-mono flex items-center gap-2">
                    {trail.name}
                    {isSunrise && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 animate-pulse">SUNRISE</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full uppercase"
                      style={{ color: diff.color, background: diff.bg, border: "1px solid " + diff.border }}
                    >
                      {trail.difficulty}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">
                      {trail.estimatedTime} • {trail.distance}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-emerald-400 font-mono">
                  {trail.reward} ◎
                </div>
                <div className="text-[8px] text-gray-600">bonus</div>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-gray-500 font-mono leading-relaxed mb-3">
              {trail.description}
            </p>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-[9px] text-gray-600 font-mono">
                  {visited}/{total} waypoints
                </span>
                <span className="text-[9px] font-mono" style={{ color: isComplete ? "#34d399" : trail.color }}>
                  {isComplete ? "✓ Complete!" : pct + "%"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-800/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: pct + "%",
                    background: isComplete
                      ? "linear-gradient(90deg, #34d399, #10b981)"
                      : "linear-gradient(90deg, " + trail.color + "88, " + trail.color + ")",
                  }}
                />
              </div>
            </div>

            {/* Waypoints preview */}
            <div className="flex items-center gap-1 mb-3">
              {trail.waypoints.map(function(wp, i) {
                var isVisited = progress && progress.has(wp.id);
                return (
                  <React.Fragment key={wp.id}>
                    <div
                      className={"w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold font-mono border transition-all " + (
                        isVisited
                          ? "bg-emerald-400/20 border-emerald-400/50 text-emerald-400"
                          : "bg-gray-800/30 border-gray-700/30 text-gray-600"
                      )}
                    >
                      {isVisited ? "✓" : (i + 1)}
                    </div>
                    {i < trail.waypoints.length - 1 && (
                      <div className={"flex-1 h-px " + (isVisited ? "bg-emerald-400/30" : "bg-gray-800/30")} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={function() { onSelectTrail(trail); }}
                className="flex-1 py-2 rounded-xl border border-crypt-300/20 bg-transparent text-[11px] font-mono text-gray-500 cursor-pointer hover:border-crypt-300/40 hover:text-crypt-300 transition-all"
              >
                View on Map
              </button>
              {!isComplete && (
                <button
                  onClick={function() { onStartTrail(trail.id); }}
                  className={"flex-1 py-2 rounded-xl border-none text-[11px] font-mono font-bold cursor-pointer transition-all " + (
                    isActive
                      ? "bg-crypt-300/20 text-crypt-300"
                      : "bg-gradient-to-r from-crypt-300 to-crypt-500 text-white"
                  )}
                >
                  {isActive ? "🎯 Active" : "Start Quest"}
                </button>
              )}
              {isComplete && (
                <button
                  className="flex-1 py-2 rounded-xl border-none bg-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold cursor-default"
                >
                  ✓ Completed
                </button>
              )}
            </div>
          </div>
        );
      })}

      <div className="text-center pt-3 pb-6">
        <p className="text-[9px] text-gray-700 font-mono">
          Walk to waypoints within 150m to check them off
        </p>
      </div>
    </div>
  );
}
