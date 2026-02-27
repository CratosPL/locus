"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { Drop, DropCategory } from "@/types";

// ─── Config ──────────────────────────────────────────────────────────────────
// Correct base URL: https://api.usetapestry.dev/v1 (NOT /api/v1)
var NAMESPACE = process.env.NEXT_PUBLIC_TAPESTRY_NAMESPACE || "locus";
var TAPESTRY_KEY = process.env.NEXT_PUBLIC_TAPESTRY_API_KEY || "";

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
 * useTapestry Hook — Tapestry On-chain Social ($5,000 track)
 *
 * API Reference: https://docs.usetapestry.dev/api
 * Endpoints used:
 *   POST /profiles/findOrCreate — create/find user profile
 *   POST /contents/create       — register drop as content node
 *   POST /likes                 — like a drop
 *   POST /comments              — comment on a drop
 *   POST /followers             — follow a user
 */
export function useTapestry() {
  var { publicKey, connected } = useWallet();
  var [profile, setProfile] = useState<TapestryProfile | null>(null);
  var [isLoading, setIsLoading] = useState(false);

  var isConfigured = !!TAPESTRY_KEY && TAPESTRY_KEY !== "YOUR_KEY_HERE";

  // ─── Helper: proxied API call ─────────────────────────────────────────
  var apiCall = useCallback(
    async function(
      endpoint: string,
      method: "GET" | "POST" | "PUT" | "DELETE",
      body?: Record<string, unknown>
    ) {
      if (!isConfigured) {
        console.log("[Tapestry] No API key — demo mode");
        return null;
      }

      var response = await fetch("/api/tapestry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: endpoint, method: method, body: body }),
      });

      if (!response.ok) {
        var errText = await response.text();
        throw new Error("Tapestry " + response.status + ": " + errText);
      }

      return await response.json();
    },
    [isConfigured]
  );

  // ─── Find or Create Profile ────────────────────────────────────────────
  // Docs: POST /profiles/findOrCreate
  var findOrCreateProfile = useCallback(async function() {
    if (!publicKey || !connected) return null;

    setIsLoading(true);
    try {
      var walletAddress = publicKey.toBase58();
      var username = "locus_" + walletAddress.slice(0, 6);

      console.log("[Tapestry] Finding/creating profile for:", walletAddress);

      var shortWallet = walletAddress.slice(0, 4);

      var result = await apiCall("/profiles/findOrCreate", "POST", {
        walletAddress: walletAddress,
        username: username,
        bio: "Explorer " + shortWallet + " | Haunting the map on Solana",
        blockchain: "SOLANA",
        execution: "FAST_UNCONFIRMED",
        namespace: NAMESPACE,
      });

      if (result) {
        var p = result.profile || result;
        var sc = result.socialCounts || {};
        var tapProfile: TapestryProfile = {
          id: p.id || p.username || username,
          username: p.username || username,
          bio: p.bio || "",
          walletAddress: walletAddress,
          namespace: NAMESPACE,
          followersCount: sc.followers || 0,
          followingCount: sc.following || 0,
        };
        setProfile(tapProfile);
        console.log("[Tapestry] Profile ready:", tapProfile.username);
        return tapProfile;
      }

      var demoProfile: TapestryProfile = {
        id: walletAddress,
        username: username,
        bio: "Locus explorer (demo mode)",
        walletAddress: walletAddress,
        namespace: NAMESPACE,
        followersCount: 0,
        followingCount: 0,
      };
      setProfile(demoProfile);
      return demoProfile;
    } catch (error) {
      console.error("[Tapestry] Profile error:", error);
      var wa = publicKey.toBase58();
      var fallback: TapestryProfile = {
        id: wa,
        username: "locus_" + wa.slice(0, 6),
        bio: "Locus explorer",
        walletAddress: wa,
        followersCount: 0,
        followingCount: 0,
      };
      setProfile(fallback);
      return fallback;
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connected, apiCall]);

  // ─── Register Drop as Content ──────────────────────────────────────────
  // Docs: POST /contents/create
  // Body: profileId, content, contentType, customProperties[]
  var registerDropAsContent = useCallback(
    async function(dropId: string, message: string, location: { lat: number; lng: number }, extras?: {
      twitter?: string; link?: string; type?: string;
      reward?: number; category?: string;
      audiusTrackId?: string; audiusTrackName?: string; audiusArtist?: string;
    }) {
      if (!publicKey || !profile) return null;
      try {
        var customProperties = [
          { key: "dropId", value: dropId },
          { key: "namespace", value: NAMESPACE },
          { key: "type", value: extras?.type || "geo-drop" },
          { key: "lat", value: String(location.lat) },
          { key: "lng", value: String(location.lng) },
          { key: "reward", value: String(extras?.reward ?? 0) },
          { key: "category", value: extras?.category || "lore" },
          { key: "createdBy", value: profile.username ? "@" + profile.username : publicKey.toBase58().slice(0, 8) },
        ];
        if (extras?.twitter) customProperties.push({ key: "twitter", value: extras.twitter });
        if (extras?.link) customProperties.push({ key: "link", value: extras.link });
        if (extras?.audiusTrackId) customProperties.push({ key: "audiusTrackId", value: extras.audiusTrackId });
        if (extras?.audiusTrackName) customProperties.push({ key: "audiusTrackName", value: extras.audiusTrackName });
        if (extras?.audiusArtist) customProperties.push({ key: "audiusArtist", value: extras.audiusArtist });

        var result = await apiCall("/contents/create", "POST", {
          profileId: profile.id,
          content: message,
          contentType: "drop",
          customProperties: customProperties,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] Content registered:", dropId, result);
        return result;
      } catch (error) {
        console.warn("[Tapestry] Content registration failed:", error);
        return null;
      }
    },
    [publicKey, profile, apiCall]
  );

  // ─── Fetch All Drops from Tapestry ──────────────────────────────────────
  // Reads back content nodes of type "drop" so all users see persistent drops.
  var fetchAllDrops = useCallback(
    async function(): Promise<Drop[]> {
      try {
        var result = await apiCall(
          "/contents?contentType=drop",
          "GET"
        );

        if (!result || !Array.isArray(result)) {
          // Try alternative endpoint format
          var altResult = await apiCall(
            "/contents/search?contentType=drop",
            "GET"
          );
          result = altResult?.contents || altResult || [];
        }

        var contents = Array.isArray(result) ? result : (result?.contents || []);
        if (!Array.isArray(contents)) return [];

        var drops: Drop[] = [];
        contents.forEach(function(item: any) {
          var props: Record<string, string> = {};
          var cpArray = item.customProperties || item.properties || [];
          if (Array.isArray(cpArray)) {
            cpArray.forEach(function(p: any) { props[p.key] = p.value; });
          }

          // Only include drops from our namespace
          if (props.namespace && props.namespace !== NAMESPACE) return;
          if (!props.lat || !props.lng) return;

          var drop: Drop = {
            id: props.dropId || item.id || ("tap_" + Date.now()),
            location: { lat: parseFloat(props.lat), lng: parseFloat(props.lng) },
            message: item.content || "",
            isClaimed: false,
            finderReward: parseFloat(props.reward || "0"),
            category: (props.category || "lore") as DropCategory,
            createdBy: props.createdBy || "anon",
            createdAt: item.createdAt ? item.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
            twitterHandle: props.twitter,
            externalLink: props.link,
            dropType: props.type === "memory-drop" ? "memory" : "crypto",
            audiusTrackId: props.audiusTrackId,
            audiusTrackName: props.audiusTrackName,
            audiusArtist: props.audiusArtist,
          };
          drops.push(drop);
        });

        console.log("[Tapestry] Fetched " + drops.length + " drops from on-chain social graph");
        return drops;
      } catch (error) {
        console.warn("[Tapestry] Failed to fetch drops:", error);
        return [];
      }
    },
    [apiCall]
  );

  // ─── Like a Drop ──────────────────────────────────────────────────────
  // Docs: POST /likes
  // Body: profileId, contentId
  var likeDrop = useCallback(
    async function(dropId: string) {
      if (!publicKey || !profile) return true;
      try {
        await apiCall("/likes", "POST", {
          profileId: profile.id,
          contentId: "drop_" + dropId,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] Liked:", dropId);
        return true;
      } catch (error) {
        console.warn("[Tapestry] Like API failed (local UI still works):", error);
        return true;
      }
    },
    [publicKey, profile, apiCall]
  );

  // ─── Comment on a Drop ────────────────────────────────────────────────
  // Docs: POST /comments
  // Body: profileId, contentId, text
  var commentOnDrop = useCallback(
    async function(dropId: string, text: string): Promise<TapestryComment | null> {
      if (!publicKey) return null;
      var authorName = profile ? profile.username : publicKey.toBase58().slice(0, 8) + "...";
      try {
        var result = await apiCall("/comments", "POST", {
          profileId: profile ? profile.id : publicKey.toBase58(),
          contentId: "drop_" + dropId,
          text: text,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] Comment added:", dropId);
        return {
          id: (result && result.commentId) || ("comment_" + Date.now()),
          text: text,
          author: authorName,
          createdAt: new Date().toISOString(),
        };
      } catch (error) {
        console.warn("[Tapestry] Comment API failed (local UI still works):", error);
        return {
          id: "comment_" + Date.now(),
          text: text,
          author: authorName,
          createdAt: new Date().toISOString(),
        };
      }
    },
    [publicKey, profile, apiCall]
  );

  // ─── Follow a User ────────────────────────────────────────────────────
  // Docs: POST /followers
  // Body: startId (me), endId (target)
  var followUser = useCallback(
    async function(targetProfileId: string) {
      if (!publicKey || !profile) return false;
      try {
        await apiCall("/followers", "POST", {
          startId: profile.id,
          endId: targetProfileId,
          blockchain: "SOLANA",
          execution: "FAST_UNCONFIRMED",
        });
        console.log("[Tapestry] Followed:", targetProfileId);
        return true;
      } catch (error) {
        console.warn("[Tapestry] Follow failed:", error);
        return false;
      }
    },
    [publicKey, profile, apiCall]
  );

  return {
    profile: profile,
    isLoading: isLoading,
    isConfigured: isConfigured,
    findOrCreateProfile: findOrCreateProfile,
    registerDropAsContent: registerDropAsContent,
    fetchAllDrops: fetchAllDrops,
    likeDrop: likeDrop,
    commentOnDrop: commentOnDrop,
    followUser: followUser,
  };
}
