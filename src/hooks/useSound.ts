"use client";

import { useCallback, useRef } from "react";

/**
 * useSound Hook — Immersive Feedback ($5,000 MagicBlock Track)
 * Handles haptic vibrations and interface sound effects using Web Audio API.
 */

export type SoundType =
  | "claim"
  | "success"
  | "error"
  | "click"
  | "level-up"
  | "ghost"
  | "popup-open"
  | "popup-close"
  | "notification";

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      try {
        window.navigator.vibrate(pattern);
      } catch (e) {
        // Ignore haptic failures
      }
    }
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const ctx = getCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case "click":
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        vibrate(10);
        break;

      case "popup-open":
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        vibrate(20);
        break;

      case "popup-close":
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        vibrate(15);
        break;

      case "notification":
        // Two-tone notification
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.setValueAtTime(0.1, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        vibrate([50, 30, 50]);
        break;

      case "claim":
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.4);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        vibrate([40, 60, 40, 60]);
        break;

      case "level-up":
        // Majestic arpeggio
        [0, 0.1, 0.2, 0.3].forEach((offset, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          const freq = [523.25, 659.25, 783.99, 1046.50][i]; // C5, E5, G5, C6
          o.type = "sine";
          o.frequency.setValueAtTime(freq, now + offset);
          g.gain.setValueAtTime(0, now + offset);
          g.gain.linearRampToValueAtTime(0.1, now + offset + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.4);
          o.start(now + offset);
          o.stop(now + offset + 0.5);
        });
        vibrate([100, 50, 100, 50, 200]);
        break;

      case "success":
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        vibrate(40);
        break;

      case "error":
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(70, now + 0.4);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        vibrate([200, 100, 200]);
        break;

      case "ghost":
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 1.5);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1);
        gain.gain.linearRampToValueAtTime(0, now + 1.5);
        osc.start(now);
        osc.stop(now + 1.5);
        vibrate(50);
        break;
    }
  }, [vibrate]);

  return { vibrate, playSound };
}
