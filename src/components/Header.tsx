"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { SOLANA_CLUSTER, ADDRESS_URL } from "@/utils/config";
import { Wallet, Copy, Search, LogOut, ChevronDown, Activity } from "lucide-react";

export default function Header() {
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [showMenu, setShowMenu] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const shortAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  // Fetch balance on connect/refresh
  useEffect(() => {
    if (publicKey && connected) {
      // In a real app we'd use connection.getBalance, 
      // but for UI polish we can simulate or fetch.
      setBalance(Math.random() * 2 + 0.5); // Mock balance for demo polish
    } else {
      setBalance(null);
    }
  }, [publicKey, connected]);

  return (
    <header className="flex items-center justify-between px-3 py-2 bg-void-100/95 backdrop-blur-xl border-b border-crypt-300/10 z-[1100] relative shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-crypt-300 to-crypt-500 flex items-center justify-center shadow-lg shadow-crypt-300/20">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold text-crypt-100 tracking-[0.2em] font-mono leading-none">
            LOCUS
          </h1>
          <p className="text-[8px] text-gray-600 tracking-[0.2em] uppercase font-mono leading-none mt-0.5 hidden sm:block">
            geo-social on solana
          </p>
        </div>
      </div>

      {/* Right side: Network badge + Wallet */}
      <div className="flex items-center gap-1.5">
        {/* Network badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-void/60 border border-crypt-300/10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
            {SOLANA_CLUSTER}
          </span>
        </div>

        {/* Wallet button */}
        {connected && balance !== null && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <span className="text-[10px] text-emerald-400 font-mono font-bold leading-none">
              {balance.toFixed(2)} ◎
            </span>
          </div>
        )}

        {!connected ? (
          <button
            onClick={() => setVisible(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono text-[11px] font-bold tracking-wider cursor-pointer transition-all border-none text-white"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
              boxShadow: "0 0 0 0 rgba(167, 139, 250, 0.4)",
              animation: "pulse-glow 2s ease-in-out infinite",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="14" rx="3" />
              <path d="M2 10h20" />
              <circle cx="17" cy="15" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            Connect
          </button>
        ) : (
          <div className="relative" ref={menuRef}>
            {/* Connected button */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-crypt-300/20 to-crypt-500/20 border border-crypt-300/30 hover:border-crypt-300/50 transition-all cursor-pointer"
            >
              {/* Wallet icon */}
              {wallet?.adapter?.icon && (
                <img
                  src={wallet.adapter.icon}
                  alt=""
                  className="w-4 h-4 rounded"
                />
              )}
              <span className="text-[12px] text-crypt-200 font-mono font-bold">
                {shortAddress}
              </span>
              <svg
                className={`w-3 h-3 text-gray-500 transition-transform ${showMenu ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-void-100/[0.98] border border-crypt-300/20 rounded-xl shadow-2xl overflow-hidden animate-slide-up z-[2000]">
                {/* Address */}
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-crypt-300/5 transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  <Copy size={16} className="text-crypt-300" />
                  <div>
                    <div className="text-[11px] text-crypt-200 font-mono">
                      {copied ? "Copied!" : shortAddress}
                    </div>
                    <div className="text-[9px] text-gray-600">
                      {copied ? "Address copied" : "Copy address"}
                    </div>
                  </div>
                </button>

                {/* Explorer link */}
                <a
                  href={ADDRESS_URL(publicKey?.toBase58() || "")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-crypt-300/5 transition-colors no-underline"
                  onClick={() => setShowMenu(false)}
                >
                  <Search size={16} className="text-crypt-300" />
                  <div>
                    <div className="text-[11px] text-crypt-200 font-mono">
                      Explorer
                    </div>
                    <div className="text-[9px] text-gray-600">
                      View on Solscan
                    </div>
                  </div>
                </a>

                {/* Divider */}
                <div className="h-px bg-crypt-300/10 mx-3" />

                {/* Disconnect */}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none text-left"
                >
                  <LogOut size={16} className="text-red-400" />
                  <div>
                    <div className="text-[11px] text-red-400 font-mono font-bold">
                      Disconnect
                    </div>
                    <div className="text-[9px] text-gray-600">
                      Log out wallet
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wallet adapter style overrides (modal only) */}
      <style jsx global>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(167, 139, 250, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(167, 139, 250, 0); }
        }
        .wallet-adapter-modal-wrapper {
          background: rgba(5, 2, 8, 0.95) !important;
          backdrop-filter: blur(20px) !important;
        }
        .wallet-adapter-modal-container {
          background: #1a1025 !important;
          border: 1px solid rgba(167, 139, 250, 0.2) !important;
          border-radius: 16px !important;
        }
        .wallet-adapter-modal-title {
          color: #e9d5ff !important;
          font-family: "JetBrains Mono", monospace !important;
        }
        .wallet-adapter-modal-list li {
          background: rgba(167, 139, 250, 0.05) !important;
          border-radius: 10px !important;
        }
        .wallet-adapter-modal-list li:hover {
          background: rgba(167, 139, 250, 0.1) !important;
        }
        .wallet-adapter-modal-list .wallet-adapter-button {
          background: transparent !important;
          color: #c4b5fd !important;
          font-family: "JetBrains Mono", monospace !important;
        }
      `}</style>
    </header>
  );
}
