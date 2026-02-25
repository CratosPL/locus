"use client";

import React, { useState } from "react";
import { Info, Award, Settings, Zap, Users, Gamepad2, Sun, Share2, BookOpen, Terminal, CheckCircle2, Navigation } from "lucide-react";

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRetakeTutorial: () => void;
}

type Tab = "intro" | "users" | "faq" | "jury";

export default function InfoPanel({ isOpen, onClose, onRetakeTutorial }: InfoPanelProps) {
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
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("intro")}
            className={`min-w-fit flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === "intro" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Info size={14} /> OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`min-w-fit flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === "users" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <BookOpen size={14} /> USERS
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`min-w-fit flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === "faq" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Zap size={14} /> DEEP DIVE
          </button>
          <button
            onClick={() => setActiveTab("jury")}
            className={`min-w-fit flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === "jury" ? "bg-crypt-300 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
          >
            <Terminal size={14} /> JURY
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
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold text-xs">1</div>
                    <p className="text-xs">Connect your <b className="text-white">Solana Wallet</b> (Phantom/Solflare). Ensure you are on <b className="text-emerald-400">Devnet</b>.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold text-xs">2</div>
                    <p className="text-xs">Grant <b className="text-white">GPS Access</b>. Not in Warsaw? Enable <b className="text-yellow-400">Demo Mode</b> (bottom-left) to explore without moving.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-crypt-300/20 flex items-center justify-center shrink-0 text-crypt-300 font-bold text-xs">3</div>
                    <p className="text-xs">Tap a drop marker → walk within <b className="text-white">150m</b> → claim it. SOL transfers directly to your wallet.</p>
                  </div>
                </div>
              </section>

              {/* Social features */}
              <section className="bg-crypt-300/5 rounded-2xl p-4 border border-crypt-300/15 space-y-4">
                <h4 className="text-crypt-300 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                  <Users size={13} /> Social Features
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0">💬</span>
                    <div>
                      <b className="text-white block mb-0.5">Public Chat on drops</b>
                      <span className="text-gray-400">Every drop has a public comment thread. Tap <b className="text-white">Chat</b> in the drop popup to leave a message — stored on-chain via Tapestry.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0">✉️</span>
                    <div>
                      <b className="text-white block mb-0.5">Private DM to author</b>
                      <span className="text-gray-400">Tap <b className="text-white">DM</b> in the drop popup to send a private message to whoever left the drop. Perfect for meeting up or asking about the location.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0">👤</span>
                    <div>
                      <b className="text-white block mb-0.5">Follow from the map</b>
                      <span className="text-gray-400">Tap <b className="text-white">Follow</b> next to a creator's name in any drop popup. Follows are registered on Tapestry's social graph — fully on-chain.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg shrink-0">🗺️</span>
                    <div>
                      <b className="text-white block mb-0.5">Nearby Explorers</b>
                      <span className="text-gray-400">Open the <b className="text-white">Explorers Nearby</b> panel on the map (top-right, below Feed). See other active players around you, their rank and distance. Click any explorer to view their profile, follow them, or send a DM.</span>
                    </div>
                  </div>
                </div>
              </section>

              <button
                onClick={onRetakeTutorial}
                className="w-full p-4 rounded-xl border border-white/10 flex items-center justify-center gap-2 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                <Navigation size={14} /> Retake Guided Tour
              </button>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-4">
              <section className="space-y-4">
                <h3 className="text-crypt-300 font-bold uppercase tracking-widest text-xs border-l-2 border-crypt-300 pl-3">FEATURE DEEP DIVE</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" /> 1. HOW TO CLAIM A DROP?
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      When you are within <b className="text-white">150 meters</b> of a marker, click it and select "Claim". This triggers a Solana transaction. Once confirmed, the bounty SOL is transferred from the vault PDA directly to your wallet.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Share2 size={14} className="text-blue-400" /> 2. SOLANA BLINKS (SHARING)
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      Found a cool drop? Click <b className="text-white">"Share as Blink"</b>. It generates a link that turns into an interactive action on X (Twitter). Anyone with the link can claim the drop if they are physically near it!
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Users size={14} className="text-purple-400" /> 3. TAPESTRY SOCIAL
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      Your identity is your wallet. Every claim, like, and comment is a node on the <b className="text-white">Tapestry Social Graph</b>. Follow creators to see their new drops first.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Users size={14} className="text-emerald-400" /> 4. EXPLORERS NEARBY + DM
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      The <b className="text-white">Explorers Nearby</b> panel (map, top-right) shows active players around you with their rank and distance. Tap any explorer to open their profile — you can follow them or send a private message via Tapestry. Drop popups also have a <b className="text-white">DM button</b> to message the author directly.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Award size={14} className="text-emerald-400" /> 4. XP & LEVELS (MAGICBLOCK)
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      Every interaction grants XP. <b className="text-white">Claims = 50 XP</b>, <b className="text-white">Ghosts = 10 XP</b>, <b className="text-white">Follows = 5 XP</b>. Level up to unlock higher titles and larger discovery radiuses!
                    </p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-xs mb-2 flex items-center gap-2">
                      <Gamepad2 size={14} className="text-red-400" /> 5. AUDIUS ECHOES
                    </h4>
                    <p className="text-[11px] text-gray-400 pl-6 border-l border-white/10">
                      Look for drops with the <b className="text-white">🎵 icon</b>. These are "Music Echoes". When you walk close to them, the specific Audius track attached to that coordinate will begin to play automatically.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-crypt-300 font-bold uppercase tracking-widest text-xs border-l-2 border-crypt-300 pl-3">TROUBLESHOOTING FAQ</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] font-bold text-white mb-1">GPS isn't working?</p>
                    <p className="text-[10px] text-gray-500 italic">Make sure you allow location permissions in your browser. If you're not in Warsaw, enable "Demo Mode" in the bottom right to bypass GPS checks.</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] font-bold text-white mb-1">Is Locus Global?</p>
                    <p className="text-[10px] text-gray-500 italic">Yes! While we started in Warsaw, there are drops in NYC, London, Tokyo, and more. Try panning the map globally to discover them!</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl">
                    <p className="text-[11px] font-bold text-white mb-1">Transaction failed?</p>
                    <p className="text-[10px] text-gray-500 italic">Ensure your wallet is set to **Devnet** and you have some devnet SOL (visit solana.com/faucet). Locus runs on Devnet for the hackathon.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "jury" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <section>
                <h3 className="text-crypt-300 font-bold mb-3 flex items-center gap-2 uppercase">Hackathon Tracks</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs"><b className="text-purple-400">TAPESTRY:</b> Profile auto-created on wallet connect. Every drop + ghost mark = Tapestry content node. Likes, comments, follows on-chain. Live activity feed. Nearby Explorers panel with follow + private DM from map. Drop popups have public Chat and private DM buttons. ExplorerProfileModal with stats, rank, and message flow.</p>
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
