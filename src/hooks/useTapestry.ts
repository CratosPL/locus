"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// ─── Config ──────────────────────────────────────────────────────────────────
const TAPESTRY_API =
  process.env.NEXT_PUBLIC_TAPESTRY_API_URL ||
  "https://api.usetapestry.dev/api/v1";
const TAPESTRY_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || "";
const NAMESPACE = process.env.NEXT_PUBLIC_TAPESTRY_NAMESPACE || "locus";

// ─── Types ───────────────────────────────────────────────────────────────────
export interface TapestryProfile {
  id: string;
  username: string;
  bio: string;
  walletAddress: string;
  createdAt?: string;
  namespace?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface TapestryComment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

/**
 * useTapestry Hook
 *
 * Integrates Tapestry social protocol for the On-chain Social track.
 * Features: profiles, likes, comments, follows, content registration.
 *
 * Uses REST API directly — works in Next.js client components.
 * Docs: https://docs.usetapestry.dev/
 *
 * Track: Tapestry — On-chain Social ($5,000)
 */
export function useTapestry() {
  const { publicKey, connected } = useWallet();
  const [profile, setProfile] = useState<TapestryProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isConfigured = !!TAPESTRY_KEY && TAPESTRY_KEY !== "YOUR_KEY_HERE";

  // ─── Helper: API call (proxied through /api/tapestry to avoid CORS) ───
  const apiCall = useCallback(
    async (
      endpoint: string,
      method: "GET" | "POST" | "DELETE" = "GET",
      body?: Record<string, unknown>
    ) => {
      if (!isConfigured) {
        console.log("[Tapestry] No API key — running in demo mode");
        return null;
      }

      const response = await fetch("/api/tapestry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint, method, body }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Tapestry ${response.status}: ${errText}`);
      }

      return await response.json();
    },
    [isConfigured]
  );

  // ─── Find or Create Profile ────────────────────────────────────────────
  const findOrCreateProfile = useCallback(async () => {
    if (!publicKey || !connected) return null;

    setIsLoading(true);
    try {
      const walletAddress = publicKey.toBase58();
      const username = `locus_${walletAddress.slice(0, 6)}`;

      console.log("[Tapestry] Finding/creating profile for:", walletAddress);

      const result = await apiCall("/profiles/findOrCreate", "POST", {
        walletAddress,
        username,
        bio: `Locus explorer 🪦 | Dropping secrets on Solana`,
        blockchain: "SOLANA",
        execution: "FAST_UNCONFIRMED",
        namespace: NAMESPACE,
      });

      if (result) {
        const tapProfile: TapestryProfile = {
          id: result.profile?.id || result.id || walletAddress,
          username: result.profile?.username || result.username || username,
          bio: result.profile?.bio || result.bio || "",
          walletAddress,
          namespace: NAMESPACE,
          followersCount: result.profile?.followersCount || 0,
          followingCount: result.profile?.followingCount || 0,
        };
        setProfile(tapProfile);
        console.log("[Tapestry] ✅ Profile ready:", tapProfile.username);
        return tapProfile;
      }

      // Demo fallback
      const demoProfile: TapestryProfile = {
        id: walletAddress,
        username,
        bio: "Locus explorer (demo mode)",
        walletAddress,
        namespace: NAMESPACE,
        followersCount: 0,
        followingCount: 0,
      };
      setProfile(demoProfile);
      return demoProfile;
    } catch (error) {
      console.error("[Tapestry] Profile error:", error);
      // Still set a demo profile so UI works
      const walletAddress = publicKey.toBase58();
      const fallback: TapestryProfile = {
        id: walletAddress,
        username: `locus_${walletAddress.slice(0, 6)}`,
        bio: "Locus explorer",
        walletAddress,
        followersCount: 0,
        followingCount: 0,
      };
      setProfile(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, apiCall]);

  // ─── Register Drop as Content Node ─────────────────────────────────────
  const registerDropAsContent = useCallback(
    async (dropId: string, message: string) => {
      if (!publicKey) return null;
      try {
        const result = await apiCall("/content", "POST", {
          id: "drop_" + dropId,
          namespace: NAMESPACE,
          authorWalletAddress: publicKey.toBase58(),
          contentType: "drop",
          content: message,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] ✅ Content registered:", dropId);
        return result;
      } catch (error) {
        console.warn("[Tapestry] Content registration failed:", error);
        return null;
      }
    },
    [publicKey, apiCall]
  );

  // ─── Like a Drop ──────────────────────────────────────────────────────
  const likeDrop = useCallback(
    async (dropId: string) => {
      if (!publicKey) return false;
      try {
        await apiCall("/like", "POST", {
          targetContentId: "drop_" + dropId,
          namespace: NAMESPACE,
          authorWalletAddress: publicKey.toBase58(),
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] ✅ Liked:", dropId);
        return true;
      } catch (error) {
        console.warn("[Tapestry] Like API failed (local state still updated):", error);
        // Return true anyway — local UI tracks likes, Tapestry is bonus
        return true;
      }
    },
    [publicKey, apiCall]
  );

  // ─── Comment on a Drop ────────────────────────────────────────────────
  const commentOnDrop = useCallback(
    async (dropId: string, text: string): Promise<TapestryComment | null> => {
      if (!publicKey) return null;
      try {
        const result = await apiCall("/comment", "POST", {
          targetContentId: "drop_" + dropId,
          namespace: NAMESPACE,
          authorWalletAddress: publicKey.toBase58(),
          text,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] ✅ Comment added:", dropId);
        return {
          id: result?.id || ("comment_" + Date.now()),
          text,
          author:
            profile?.username || publicKey.toBase58().slice(0, 8) + "...",
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        console.warn("[Tapestry] Comment API failed (local state still updated):", error);
        return {
          id: "comment_" + Date.now(),
          text,
          author: profile?.username || publicKey.toBase58().slice(0, 8) + "...",
          createdAt: new Date().toISOString(),
        };
      }
    },
    [publicKey, profile, apiCall]
  );

  // ─── Follow a User ────────────────────────────────────────────────────
  const followUser = useCallback(
    async (targetWalletAddress: string) => {
      if (!publicKey) return false;
      try {
        await apiCall("/followers", "POST", {
          followerWalletAddress: publicKey.toBase58(),
          followeeWalletAddress: targetWalletAddress,
          namespace: NAMESPACE,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] ✅ Followed:", targetWalletAddress);
        return true;
      } catch (error) {
        console.warn("[Tapestry] Follow failed:", error);
        return false;
      }
    },
    [publicKey, apiCall]
  );

  return {
    profile,
    isLoading,
    isConfigured,
    findOrCreateProfile,
    registerDropAsContent,
    likeDrop,
    commentOnDrop,
    followUser,
  };
}
