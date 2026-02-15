"use client";

import { useState, useEffect, useCallback } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const CLAIM_RADIUS_METERS = 150;

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000;
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

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setDemoMode(true);
      return;
    }

    setIsWatching(true);
    let watchId: number | null = null;
    let fallbackStarted = false;

    const onSuccess = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      });
      setError(null);
    };

    const startLowAccuracy = () => {
      if (fallbackStarted) return;
      fallbackStarted = true;
      console.log("[Geo] Falling back to low accuracy");
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      watchId = navigator.geolocation.watchPosition(
        onSuccess,
        (err) => {
          console.warn("[Geo] Low accuracy also failed:", err.message);
          setError(err.message);
          // Don't auto-enable demo mode — let user toggle it manually
        },
        {
          enableHighAccuracy: false,
          maximumAge: 60000,
          timeout: 30000,
        }
      );
    };

    // Try high accuracy first
    watchId = navigator.geolocation.watchPosition(
      onSuccess,
      (err) => {
        console.warn("[Geo] High accuracy failed:", err.message);
        setError(err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setDemoMode(true);
        } else {
          // Timeout or unavailable → try low accuracy
          startLowAccuracy();
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,
        timeout: 10000,
      }
    );

    // Safety: if no position after 12s, try low accuracy
    const fallbackTimer = setTimeout(() => {
      if (!position) {
        startLowAccuracy();
      }
    }, 12000);

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearTimeout(fallbackTimer);
      setIsWatching(false);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const distanceTo = useCallback(
    (lat: number, lng: number): number | null => {
      if (!position) return null;
      return haversineDistance(position.lat, position.lng, lat, lng);
    },
    [position]
  );

  const isNearby = useCallback(
    (lat: number, lng: number): boolean => {
      if (demoMode) return true;
      if (!position) return false;
      return haversineDistance(position.lat, position.lng, lat, lng) <= CLAIM_RADIUS_METERS;
    },
    [position, demoMode]
  );

  const formatDistance = useCallback(
    (lat: number, lng: number): string => {
      if (demoMode) return "Demo mode";
      if (!position) return "Locating...";
      const dist = haversineDistance(position.lat, position.lng, lat, lng);
      if (dist < 1000) return Math.round(dist) + "m away";
      return (dist / 1000).toFixed(1) + "km away";
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
