"use client";

import React from "react";

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoPanel({ isOpen, onClose }: InfoPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[500px] bg-void-100 border border-crypt-300/30 rounded-3xl p-8 max-h-[90vh] overflow-y-auto animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-crypt-100 font-mono tracking-tighter">LOCUS</h2>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">Project Information & Hackathon Guide</p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="space-y-8 font-mono text-sm leading-relaxed text-gray-300">
          
          <section>
            <h3 className="text-crypt-300 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">🗺️</span> O CO CHODZI?
            </h3>
            <p>
              Locus to geolokalizacyjna gra społecznościowa (dApp), która zmienia miasto w interaktywny "crypto graveyard". Użytkownicy mogą zostawiać "Dead Drops" (skrytki z SOL) oraz "Ghost Marks" (ulotne wiadomości) przypięte do fizycznych współrzędnych GPS.
            </p>
          </section>

          <section className="bg-crypt-300/5 border border-crypt-300/20 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="text-xl">🏆</span> DLA JURY (HACKATHON TRACKS)
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex gap-3">
                <span className="shrink-0 w-16 text-purple-400 font-bold uppercase tracking-tighter bg-purple-400/10 px-2 py-1 rounded text-center h-fit">Social</span>
                <p><span className="text-white font-bold">Tapestry Integration:</span> Każdy drop i ghost jest zarejestrowany jako node na protokole Tapestry. Social graph (follow/likes) jest w pełni on-chain.</p>
              </div>

              <div className="flex gap-3">
                <span className="shrink-0 w-16 text-blue-400 font-bold uppercase tracking-tighter bg-blue-400/10 px-2 py-1 rounded text-center h-fit">Gaming</span>
                <p><span className="text-white font-bold">MagicBlock Gaming:</span> Wykorzystujemy logikę questów i efemerycznych wiadomości (Ghost Marks znikają po 24h). System rang: Lost Soul → Lich.</p>
              </div>

              <div className="flex gap-3">
                <span className="shrink-0 w-16 text-amber-500 font-bold uppercase tracking-tighter bg-amber-500/10 px-2 py-1 rounded text-center h-fit">Sunrise</span>
                <p><span className="text-white font-bold">Sunrise Onboarding:</span> Specjalna ścieżka "Sunrise Web3 Tutorial" uczy nowych użytkowników obsługi portfela i interakcji on-chain.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-crypt-300 font-bold mb-3 flex items-center gap-2">
              <span className="text-xl">⚙️</span> JAK GRAĆ?
            </h3>
            <ul className="space-y-3 list-none pl-1">
              <li className="flex gap-2"><span className="text-crypt-400">01.</span> Włącz GPS lub tryb Demo.</li>
              <li className="flex gap-2"><span className="text-crypt-400">02.</span> Podłącz portfel Solana (Devnet).</li>
              <li className="flex gap-2"><span className="text-crypt-400">03.</span> Podejdź na 150m do markera, aby go odebrać (Claim).</li>
              <li className="flex gap-2"><span className="text-crypt-400">04.</span> Twórz własne dropy z nagrodą SOL dla innych.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest">Built for Graveyard Hackathon 2026</span>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400/70">Program Verified</span>
              </div>
            </div>
          </section>

        </div>

        <button 
          onClick={onClose}
          className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-crypt-300 to-crypt-500 text-white font-bold font-mono text-sm shadow-[0_4px_20px_rgba(167,139,250,0.3)] active:scale-95 transition-all"
        >
          ROZUMIEM
        </button>

      </div>
    </div>
  );
}
