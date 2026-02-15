"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number; // meters
  timestamp: number;
}

/**
 * useGeolocation Hook
 *
 * Provides real GPS position for geo-verification.
 * - Watches position continuously
 * - Calculates distance to any point
 * - Checks if user is within claim radius
 *
 * CLAIM_RADIUS: 150m — user must be within 150m of a drop to claim it.
 * DEMO_MODE: bypasses geo-check for hackathon judges who aren't in Warsaw.
 */

const CLAIM_RADIUS_METERS = 150;

// Haversine formula — distance between two lat/lng points in meters
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Start watching GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setDemoMode(true); // auto-enable demo mode
      return;
    }

    setIsWatching(true);

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
      },
      (err) => {
        console.warn("[Geo] Error:", err.message);
        setError(err.message);
        // If user denies GPS, auto-enable demo mode
        if (err.code === err.PERMISSION_DENIED) {
          setDemoMode(true);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
  }, []);

  // Calculate distance from user to a point
  const distanceTo = useCallback(
    (lat: number, lng: number): number | null => {
      if (!position) return null;
      return haversineDistance(position.lat, position.lng, lat, lng);
    },
    [position]
  );

  // Check if user is within claim radius of a point
  const isNearby = useCallback(
    (lat: number, lng: number): boolean => {
      if (demoMode) return true; // demo mode bypasses geo-check
      if (!position) return false;
      const dist = haversineDistance(position.lat, position.lng, lat, lng);
      return dist <= CLAIM_RADIUS_METERS;
    },
    [position, demoMode]
  );

  // Format distance for display
  const formatDistance = useCallback(
    (lat: number, lng: number): string => {
      if (demoMode) return "Demo mode";
      if (!position) return "Locating...";
      const dist = haversineDistance(position.lat, position.lng, lat, lng);
      if (dist < 1000) return `${Math.round(dist)}m away`;
      return `${(dist / 1000).toFixed(1)}km away`;
    },
    [position, demoMode]
  );

  return {
    position,
    error,
    isWatching,
    demoMode,
    setDemoMode,
    distanceTo,
    isNearby,
    formatDistance,
    claimRadius: CLAIM_RADIUS_METERS,
  };
}
