"use client";

import React, { useEffect, useState } from "react";

interface TxToastProps {
  message: string;
  signature?: string;
  type: "success" | "error" | "info";
  onDismiss: () => void;
}

export default function TxToast({ message, signature, type, onDismiss }: TxToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "#34d399", icon: "⚡" },
    error: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444", icon: "❌" },
    info: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", text: "#a78bfa", icon: "📍" },
  };

  const c = colors[type];
  const solscanUrl = signature && !signature.startsWith("demo_")
    ? "https://solscan.io/tx/" + signature + "?cluster=devnet"
    : null;

  return (
    <div
      className={"fixed top-4 left-1/2 -translate-x-1/2 z-[4000] transition-all duration-300 " + (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4")}
    >
      <div
        style={{ background: c.bg, borderColor: c.border }}
        className="flex items-center gap-3 px-5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl max-w-[90vw]"
      >
        <span className="text-xl animate-tx-success">{c.icon}</span>
        <div>
          <div style={{ color: c.text }} className="text-[12px] font-mono font-bold">
            {message}
          </div>
          {solscanUrl && (
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-600 font-mono hover:text-crypt-300 transition-colors"
            >
              View on Solscan →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
