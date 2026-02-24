"use client";

import React, { useState, useEffect } from "react";
import { Activity, MapPin, Zap, Navigation } from "lucide-react";

interface WelcomeOverlayProps {
  onDismiss: () => void;
  forceShow?: boolean;
}

export default function WelcomeOverlay({ onDismiss, forceShow }: WelcomeOverlayProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  // Check if already seen
  useEffect(() => {
    if (forceShow) {
      setVisible(true);
      return;
    }
    try {
      if (localStorage.getItem("locus_welcomed")) {
        setVisible(false);
        onDismiss();
      }
    } catch {}
  }, [onDismiss, forceShow]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem("locus_welcomed", "true");
    } catch {}
    setVisible(false);
    onDismiss();
  };

  const steps = [
    {
      icon: <Activity size={80} />,
      title: "Welcome to Locus",
      desc: "Geo-social dead drops on Solana. Leave hidden messages with SOL rewards at real-world locations.",
    },
    {
      icon: <MapPin size={80} />,
      title: "Discover & Claim",
      desc: "Walk within 150m of a drop to claim it. GPS verifies your location. Each claim is a real Solana transaction.",
    },
    {
      icon: <Zap size={80} />,
      title: "Create & Earn",
      desc: "Drop messages at your location with SOL bounties. Others find them, you build reputation on Tapestry.",
    },
  ];

  const current = steps[step];

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-void/95 backdrop-blur-xl">
      <div className="w-[90%] max-w-[380px] text-center">
        {/* Icon */}
        <div className="mb-6 animate-float flex justify-center text-crypt-300">
          {current.icon}
        </div>

        {/* Title */}
        <h2 className="text-crypt-200 font-mono text-2xl font-bold mb-3 tracking-wider">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-gray-500 font-mono text-sm leading-relaxed mb-8 px-4">
          {current.desc}
        </p>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={
                "h-1.5 rounded-full transition-all " +
                (i === step
                  ? "w-8 bg-crypt-300"
                  : i < step
                    ? "w-4 bg-crypt-300/40"
                    : "w-4 bg-gray-800")
              }
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-center">
          {step < steps.length - 1 ? (
            <>
              <button
                onClick={dismiss}
                className="px-6 py-3 rounded-xl border border-crypt-300/20 bg-transparent text-gray-600 font-mono text-sm cursor-pointer hover:border-crypt-300/40 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(step + 1)}
                className="px-8 py-3 rounded-xl border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white font-mono text-sm font-bold cursor-pointer tracking-wider hover:from-crypt-400 hover:to-crypt-600 transition-all"
              >
                Next
              </button>
            </>
          ) : (
            <button
              onClick={dismiss}
              className="flex items-center gap-2 px-10 py-3 rounded-xl border-none bg-gradient-to-br from-crypt-300 to-crypt-500 text-white font-mono text-sm font-bold cursor-pointer tracking-wider hover:from-crypt-400 hover:to-crypt-600 transition-all shadow-[0_4px_20px_rgba(167,139,250,0.3)]"
            >
              <Navigation size={18} /> Explore the Map
            </button>
          )}
        </div>

        {/* Hackathon badge */}
        <div className="mt-10 text-[10px] text-gray-800 font-mono tracking-widest uppercase">
          Solana Graveyard Hackathon 2026
        </div>
      </div>
    </div>
  );
}
