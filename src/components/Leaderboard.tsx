"use client";

import React from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  claimed: number;
  created: number;
  likes: number;
  reputation: number;
  isMagicBlock?: boolean; // Track if they are using gaming enhancements
}

interface LeaderboardProps {
  currentUser?: string;
  currentStats: { claimed: number; created: number; likes: number };
  onFollow?: (username: string) => void;
}

// Mock leaderboard — in production this would come from Tapestry API
var MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: "lich.sol", claimed: 47, created: 12, likes: 89, reputation: 683 },
  { rank: 2, username: "spectre.sol", claimed: 35, created: 8, likes: 54, reputation: 480 },
  { rank: 3, username: "wraith.sol", claimed: 28, created: 15, likes: 32, reputation: 419 },
  { rank: 4, username: "phantom.sol", claimed: 22, created: 6, likes: 41, reputation: 332 },
  { rank: 5, username: "banshee.sol", claimed: 19, created: 10, likes: 28, reputation: 296 },
  { rank: 6, username: "revenant.sol", claimed: 15, created: 4, likes: 22, reputation: 214 },
  { rank: 7, username: "shade.sol", claimed: 12, created: 7, likes: 18, reputation: 191 },
  { rank: 8, username: "cipher.sol", claimed: 10, created: 3, likes: 15, reputation: 145 },
  { rank: 9, username: "keeper.sol", claimed: 8, created: 2, likes: 12, reputation: 114 },
  { rank: 10, username: "nightshift.sol", claimed: 5, created: 1, likes: 8, reputation: 71 },
];

function getRankIcon(rank: number): string {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return "#" + rank;
}

function getRankStyle(rank: number): string {
  if (rank === 1) return "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
  if (rank === 2) return "from-gray-400/15 to-gray-500/10 border-gray-400/25";
  if (rank === 3) return "from-amber-600/15 to-amber-700/10 border-amber-600/25";
  return "from-void/40 to-void/20 border-crypt-300/8";
}

export default function Leaderboard({ currentUser, currentStats, onFollow }: LeaderboardProps) {
  var myRep = currentStats.claimed * 10 + currentStats.created * 5 + currentStats.likes * 2;

  // Insert current user into leaderboard if they have activity
  var fullBoard = MOCK_LEADERBOARD.slice();
  if (currentUser && myRep > 0) {
    var myEntry: LeaderboardEntry = {
      rank: 0,
      username: "@" + currentUser,
      claimed: currentStats.claimed,
      created: currentStats.created,
      likes: currentStats.likes,
      reputation: myRep,
    };
    // Find where to insert
    var inserted = false;
    for (var i = 0; i < fullBoard.length; i++) {
      if (myRep > fullBoard[i].reputation) {
        myEntry.rank = i + 1;
        fullBoard.splice(i, 0, myEntry);
        inserted = true;
        break;
      }
    }
    if (!inserted) {
      myEntry.rank = fullBoard.length + 1;
      fullBoard.push(myEntry);
    }
    // Re-rank
    for (var j = 0; j < fullBoard.length; j++) {
      fullBoard[j].rank = j + 1;
    }
    // Keep top 12
    fullBoard = fullBoard.slice(0, 12);
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-3 space-y-2">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-extrabold text-crypt-100 font-mono tracking-wider">
          🏆 Leaderboard
        </h2>
        <p className="text-[10px] text-gray-600 font-mono mt-1">
          Top explorers by reputation • Claims ×10 + Created ×5 + Likes ×2
        </p>
      </div>

      {/* Your stats card */}
      {currentUser && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-crypt-300/10 to-crypt-500/10 border border-crypt-300/20">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[11px] text-gray-500 font-mono">Your Reputation</div>
              <div className="text-xl font-extrabold text-crypt-300 font-mono">{myRep} RP</div>
            </div>
            <div className="flex gap-3 text-center">
              <div>
                <div className="text-sm font-bold text-crypt-200">{currentStats.claimed}</div>
                <div className="text-[8px] text-gray-600">Claims</div>
              </div>
              <div>
                <div className="text-sm font-bold text-crypt-200">{currentStats.created}</div>
                <div className="text-[8px] text-gray-600">Created</div>
              </div>
              <div>
                <div className="text-sm font-bold text-crypt-200">{currentStats.likes}</div>
                <div className="text-[8px] text-gray-600">Likes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      {fullBoard.map(function(entry) {
        var isMe = currentUser && entry.username === "@" + currentUser;
        return (
          <div
            key={entry.rank + "-" + entry.username}
            className={"relative flex items-center gap-5 p-4 rounded-2xl bg-gradient-to-r border transition-all " +
              getRankStyle(entry.rank) +
              (isMe ? " ring-2 ring-crypt-300/60 shadow-lg" : "")
            }
          >
            {/* Gaming Track Badge (MagicBlock) */}
            {entry.rank <= 5 && (
              <div className="absolute -top-1 -right-1 flex gap-1">
                <div className="bg-blue-500 text-[6px] text-white px-1 py-0.5 rounded shadow-lg animate-pulse" title="MagicBlock Gaming Tier">MAGIC</div>
              </div>
            )}
            {/* Rank */}
            <div className="w-8 text-center shrink-0">
              {entry.rank <= 3 ? (
                <span className="text-lg">{getRankIcon(entry.rank)}</span>
              ) : (
                <span className="text-[11px] font-bold text-gray-500 font-mono">{getRankIcon(entry.rank)}</span>
              )}
            </div>

            {/* Username */}
            <div className="flex-1 min-w-0">
              <div className={"text-base font-extrabold font-mono truncate " + (isMe ? "text-crypt-200" : "text-crypt-100")}>
                {entry.username} {isMe ? "← you" : ""}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                {entry.claimed} claims • {entry.created} drops
              </div>
            </div>

            {/* Reputation & Follow */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <div className="text-right bg-void/30 px-3 py-1.5 rounded-xl border border-white/5">
                <div className={"text-lg font-black font-mono " + (entry.rank <= 3 ? "text-crypt-300" : "text-gray-400")}>
                  {entry.reputation}
                </div>
                <div className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Reputation</div>
              </div>
              {!isMe && onFollow && (
                <button
                  onClick={() => onFollow(entry.username.replace('@', ''))}
                  className="px-2 py-0.5 rounded-lg border border-crypt-300/30 bg-crypt-300/10 text-[9px] text-crypt-300 font-mono font-bold hover:bg-crypt-300/20 transition-all cursor-pointer"
                >
                  + Follow
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer note */}
      <div className="text-center pt-3 pb-6 space-y-2">
        <div className="flex justify-center gap-2">
          <span className="text-[8px] px-2 py-0.5 rounded-full bg-crypt-300/10 text-crypt-400 border border-crypt-300/20">#TapestrySocial</span>
          <span className="text-[8px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">#MagicBlockGaming</span>
          <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">#TorqueLoyalty</span>
        </div>
        <p className="text-[9px] text-gray-700 font-mono">
          On-chain leaderboard powered by Tapestry social graph
        </p>
      </div>
    </div>
  );
}
