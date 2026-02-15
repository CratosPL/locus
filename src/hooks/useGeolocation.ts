"use client";

import { useState, useCallback, useRef } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

var CLAIM_RADIUS_METERS = 150;

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  var R = 6371000;
  var dLat = ((lat2 - lat1) * Math.PI) / 180;
  var dLng = ((lng2 - lng1) * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export type GeoStatus = "idle" | "requesting" | "active" | "denied" | "error";

export function useGeolocation() {
  var [position, setPosition] = useState<GeoPosition | null>(null);
  var [error, setError] = useState<string | null>(null);
  var [status, setStatus] = useState<GeoStatus>("idle");
  var [demoMode, setDemoMode] = useState(false);
  var watchIdRef = useRef<number | null>(null);

  // Must be called from a user gesture (click) — required by iOS Safari
  var requestLocation = useCallback(function() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setStatus("error");
      return;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setStatus("requesting");
    console.log("[Geo] Requesting location (user gesture)...");

    // First: getCurrentPosition for immediate result + permission prompt
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        console.log("[Geo] Got position:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4), "accuracy:", Math.round(pos.coords.accuracy) + "m");
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
        setStatus("active");

        // Then: start watching for updates
        watchIdRef.current = navigator.geolocation.watchPosition(
          function(watchPos) {
            setPosition({
              lat: watchPos.coords.latitude,
              lng: watchPos.coords.longitude,
              accuracy: watchPos.coords.accuracy,
              timestamp: watchPos.timestamp,
            });
          },
          function(watchErr) {
            console.warn("[Geo] Watch error:", watchErr.message);
            if (watchErr.code === 1) { // PERMISSION_DENIED (can happen if revoked)
              setStatus("denied");
              setError(watchErr.message);
              if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
              }
            }
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
        );
      },
      function(err) {
        console.error("[Geo] Permission/error:", err.code, err.message);
        setError(err.message);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setStatus("denied");
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT — try low accuracy
          console.log("[Geo] Trying low accuracy...");
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              console.log("[Geo] Low accuracy position:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4));
              setPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp,
              });
              setError(null);
              setStatus("active");
            },
            function(err2) {
              console.error("[Geo] Low accuracy also failed:", err2.message);
              setError(err2.message);
              setStatus("error");
            },
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 }
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }, []);

  var stopWatching = useCallback(function() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setStatus("idle");
    setPosition(null);
  }, []);

  var distanceTo = useCallback(
    function(lat: number, lng: number): number | null {
      if (!position) return null;
      return haversineDistance(position.lat, position.lng, lat, lng);
    },
    [position]
  );

  var isNearby = useCallback(
    function(lat: number, lng: number): boolean {
      if (demoMode) return true;
      if (!position) return false;
      return haversineDistance(position.lat, position.lng, lat, lng) <= CLAIM_RADIUS_METERS;
    },
    [position, demoMode]
  );

  var formatDistance = useCallback(
    function(lat: number, lng: number): string {
      if (demoMode) return "Demo mode";
      if (!position) return "Enable GPS";
      var dist = haversineDistance(position.lat, position.lng, lat, lng);
      if (dist < 1000) return Math.round(dist) + "m away";
      return (dist / 1000).toFixed(1) + "km away";
    },
    [position, demoMode]
  );

  return {
    position: position,
    error: error,
    status: status,
    demoMode: demoMode,
    setDemoMode: setDemoMode,
    requestLocation: requestLocation,
    stopWatching: stopWatching,
    distanceTo: distanceTo,
    isNearby: isNearby,
    formatDistance: formatDistance,
    claimRadius: CLAIM_RADIUS_METERS,
  };
}
