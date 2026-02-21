"use client";

import React, { useState } from "react";
import { Info, Award, Settings, Zap, Users, Gamepad2, Sun, Share2, BookOpen, Terminal, CheckCircle2 } from "lucide-react";

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "intro" | "users" | "jury";

export default function InfoPanel({ isOpen, onClose }: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("intro");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[550px] bg-void-100 border border-crypt-300/30 rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto animate-slide-up flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-crypt-100 font-mono tracking-tighter">LOCUS</h2>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Project Documentation</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("intro")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "intro" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Info size={14} /> OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "users" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <BookOpen size={14} /> USER GUIDE
          </button>
          <button
            onClick={() => setActiveTab("jury")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === "jury" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Terminal size={14} /> JURY SPECS
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6 font-mono text-sm leading-relaxed text-gray-300 overflow-y-auto pr-2 custom-scrollbar">

          {activeTab === "intro" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h3 className="text-crypt-300 font-bold mb-3 flex items-center gap-2 uppercase">
                  The Concept
                </h3>
                <p>
                  Locus is a <span className="text-white">Geo-Social dApp</span> built for the Solana Graveyard Hackathon.
                  It transforms physical geography into a digital "graveyard" where history, secrets, and rewards are pinned to real-world coordinates.
                </p>
              </section>

              <section className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-white font-bold mb-2 text-xs uppercase tracking-wider">Key Features</h3>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><b className="text-white">Dead Drops:</b> Geofenced SOL bounties locked in on-chain vaults.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><b className="text-white">Ghost Marks:</b> Ephemeral social messages registered on Tapestry.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span><b className="text-white">RPG Progression:</b> Earn XP and Ranks (Ghost → Lich) via MagicBlock logic.</span>
                  </li>
                </ul>
              </section>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h3 className="text-crypt-300 font-bold mb-4 flex items-center gap-2 uppercase">Getting Started</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold">1</div>
                    <p>Connect your <b className="text-white">Solana Wallet</b> (Phantom/Solflare). Ensure you are on <b className="text-emerald-400">Devnet</b>.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold">2</div>
                    <p>Grant <b className="text-white">GPS Access</b>. In Demo Mode, you can click the "map" to simulate walking if you aren't in Warsaw.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold">3</div>
                    <p>Locate markers. Blue/Purple are <b className="text-white">Loot Drops</b> (SOL rewards). Green circles are <b className="text-white">Ghost Marks</b>.</p>
                  </div>
                </div>
              </section>

              <section className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                <h4 className="text-amber-500 font-bold text-xs mb-2 flex items-center gap-2">
                  <Zap size={14} /> PRO TIP: SUNRISE TUTORIAL
                </h4>
                <p className="text-xs">Open the <b className="text-white">Trails</b> menu and start the "Sunrise Onboarding" quest to learn the ropes and earn your first XP!</p>
              </section>
            </div>
          )}

          {activeTab === "jury" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h3 className="text-crypt-300 font-bold mb-3 flex items-center gap-2 uppercase">Hackathon Tracks</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs"><b className="text-purple-400">TAPESTRY:</b> Profile metadata and social graph (follows) are synced with Tapestry v1 API.</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs"><b className="text-blue-400">MAGICBLOCK:</b> RPG logic for Leveling and ephemeral state (Ghost Marks expire after 24h).</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs"><b className="text-blue-500">BLINKS:</b> Full Solana Action support for claiming drops via social links (`/api/actions/drop`).</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs"><b className="text-red-400">AUDIUS:</b> Integration with Audius API for proximity-triggered "echo" music tracks.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-crypt-300 font-bold mb-2 text-xs uppercase">Technical Specs</h3>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 font-mono text-[10px] space-y-2">
                  <p><span className="text-gray-500">PROGRAM_ID:</span> <span className="text-emerald-400 break-all">HCmA7eUzxhZLF8MwM3XWQwdttepiS3BJrnG5JViCWQKn</span></p>
                  <p><span className="text-gray-500">CLUSTER:</span> Devnet</p>
                  <p><span className="text-gray-500">FRAMEWORK:</span> Next.js 14, React Leaflet, Anchor</p>
                </div>
              </section>
            </div>
          )}

          <section className="pt-4 border-t border-white/5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Graveyard Hackathon 2026 Entry</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/70">Production Ready</span>
              </div>
            </div>
          </section>

        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-crypt-300 to-crypt-500 text-white font-bold font-mono text-sm shadow-[0_4px_20px_rgba(167,139,250,0.3)] active:scale-95 transition-all shrink-0"
        >
          CLOSE GUIDE
        </button>

      </div>
    </div>
  );
}
