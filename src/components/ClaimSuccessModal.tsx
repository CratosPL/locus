"use client";

import React, { useEffect, useState } from "react";
import { Drop } from "@/types";

interface ClaimSuccessModalProps {
  drop: Drop;
  signature: string;
  onClose: () => void;
}

export default function ClaimSuccessModal({ drop, signature, onClose }: ClaimSuccessModalProps) {
  const [solCount, setSolCount] = useState(0);
  const [phase, setPhase] = useState<"transfer" | "done">("transfer");
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([]);

  // Animate SOL counter
  useEffect(() => {
    const target = drop.finderReward;
    const duration = 1200;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(target, parseFloat((increment * step).toFixed(4)));
      setSolCount(current);
      if (step >= steps) {
        clearInterval(timer);
        setPhase("done");
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [drop.finderReward]);

  // Generate floating particles
  useEffect(() => {
    const pts = Array.from({ length: 12 }, (_, i) => ({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      id: i,
    }));
    setParticles(pts);
  }, []);

  const solscanUrl = `https://solscan.io/tx/${signature}?cluster=devnet`;
  const shortSig = signature.slice(0, 8) + "..." + signature.slice(-8);

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          animation: "claim-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="relative w-[92%] max-w-[360px] rounded-2xl overflow-hidden border border-emerald-500/20 bg-[#060d0a]"
      >
        <style>{`
          @keyframes claim-slide-up {
            from { opacity: 0; transform: translateY(40px) scale(0.95); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
          @keyframes float-particle {
            0%   { transform: translateY(0px) scale(1); opacity: 0.7; }
            50%  { transform: translateY(-18px) scale(1.3); opacity: 1; }
            100% { transform: translateY(-36px) scale(0.5); opacity: 0; }
          }
          @keyframes vault-flow {
            0%   { transform: translateX(-100%); opacity: 0; }
            30%  { opacity: 1; }
            100% { transform: translateX(100%); opacity: 0; }
          }
          @keyframes sol-glow {
            0%, 100% { text-shadow: 0 0 20px rgba(52,211,153,0.5); }
            50%       { text-shadow: 0 0 40px rgba(52,211,153,0.9), 0 0 80px rgba(52,211,153,0.4); }
          }
          @keyframes ping-ring {
            0%   { transform: scale(0.8); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `}</style>

        {/* Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#34d399",
                animation: `float-particle ${1.5 + Math.random()}s ease-out ${Math.random() * 0.8}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Top glow bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <div className="p-6">

          {/* Header */}
          <div className="text-center mb-5">
            <div className="text-[9px] text-emerald-400/60 uppercase tracking-[0.3em] mb-1">Drop Claimed</div>
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-[ping-ring_1.5s_ease-out_infinite]" />
              <div className="relative w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* SOL amount */}
          <div className="text-center mb-5">
            <div
              style={{ animation: phase === "done" ? "sol-glow 2s ease-in-out infinite" : "none" }}
              className="text-4xl font-black text-emerald-400 tracking-tight tabular-nums"
            >
              +{solCount.toFixed(4)}
              <span className="text-xl ml-1 text-emerald-500/70">◎</span>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">SOL transferred to your wallet</div>
          </div>

          {/* Vault → Wallet flow */}
          <div className="mb-5 px-2">
            <div className="flex items-center gap-2 text-[9px] text-gray-600 mb-1.5 justify-between">
              <span>VAULT PDA</span>
              <span>YOUR WALLET</span>
            </div>
            <div className="relative h-6 rounded-full bg-white/5 border border-white/10 overflow-hidden flex items-center">
              <div className="absolute inset-0 overflow-hidden">
                <div
                  style={{ animation: "vault-flow 1.4s ease-in-out 0.2s" }}
                  className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
                />
              </div>
              <div className="w-full flex justify-between items-center px-3 relative z-10">
                <div className="w-2 h-2 rounded-full bg-red-400/60 border border-red-400/30" />
                <div className="flex gap-1">
                  {[0,1,2,3,4].map(i => (
                    <div
                      key={i}
                      style={{ animationDelay: `${i * 0.15}s` }}
                      className="w-1 h-1 rounded-full bg-emerald-400/40 animate-pulse"
                    />
                  ))}
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              </div>
            </div>
          </div>

          {/* Drop info */}
          <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/8">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Drop Message</div>
            <div className="text-[11px] text-gray-300 leading-relaxed line-clamp-2">
              "{drop.message}"
            </div>
            <div className="mt-2 flex items-center justify-between text-[9px]">
              <span className="text-gray-600">by {drop.createdBy}</span>
              <span className="text-gray-600 capitalize">{drop.category}</span>
            </div>
          </div>

          {/* Transaction signature */}
          <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/8">
            <div className="text-[9px] text-gray-600 uppercase tracking-widest mb-1.5">Transaction</div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-mono">{shortSig}</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                <span className="text-[9px] text-emerald-400">Finalized</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 font-mono text-[11px] text-center no-underline hover:bg-white/10 transition-colors"
            >
              View on Solscan ↗
            </a>
            <button
              onClick={onClose}
              className="flex-[1.5] py-3 rounded-xl border-none bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-mono text-[11px] font-bold cursor-pointer hover:from-emerald-400 hover:to-emerald-500 transition-all shadow-[0_4px_20px_rgba(52,211,153,0.3)]"
            >
              Awesome! 🎉
            </button>
          </div>
        </div>

        {/* Bottom glow */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
      </div>
    </div>
  );
}
