"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
  var retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  var retryCountRef = useRef(0);

  // Cleanup on unmount
  useEffect(function() {
    return function() {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  // Start watching with error recovery
  var startWatch = useCallback(function() {
    if (!navigator.geolocation) return;

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      function(pos) {
        var newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        console.log("[Geo] Position:", newPos.lat.toFixed(4), newPos.lng.toFixed(4), "±" + Math.round(newPos.accuracy) + "m");
        setPosition(newPos);
        setError(null);
        setStatus("active");
        retryCountRef.current = 0; // Reset retry count on success
      },
      function(err) {
        console.warn("[Geo] Watch error:", err.code, err.message);
        if (err.code === 1) {
          // PERMISSION_DENIED — don't retry
          setStatus("denied");
          setError("Location permission denied");
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        } else {
          // POSITION_UNAVAILABLE or TIMEOUT — auto-retry
          // Keep status as "active" if we had a previous position (just stale)
          if (!position) {
            setStatus("error");
          }
          retryCountRef.current++;
          if (retryCountRef.current <= 5) {
            var delay = Math.min(retryCountRef.current * 3000, 15000);
            console.log("[Geo] Will retry in " + (delay / 1000) + "s (attempt " + retryCountRef.current + "/5)");
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(function() {
              startWatch();
            }, delay);
          }
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15000,    // Allow 15s cached position (was 0 — too aggressive)
        timeout: 20000,
      }
    );
  }, [position]);

  // Must be called from user gesture (click) — required by iOS Safari
  var requestLocation = useCallback(function() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setStatus("error");
      return;
    }

    // Clear existing
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    retryCountRef.current = 0;

    setStatus("requesting");
    console.log("[Geo] Requesting location (user gesture)...");

    // First: getCurrentPosition for permission prompt + immediate result
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        console.log("[Geo] Got position:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4), "±" + Math.round(pos.coords.accuracy) + "m");
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
        setStatus("active");

        // Then start continuous watching
        startWatch();
      },
      function(err) {
        console.error("[Geo] Initial error:", err.code, err.message);
        if (err.code === 1) {
          setStatus("denied");
          setError("Location permission denied");
        } else {
          // Try with relaxed settings
          console.log("[Geo] Trying relaxed settings...");
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              console.log("[Geo] Relaxed position:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4));
              setPosition({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
                timestamp: pos.timestamp,
              });
              setError(null);
              setStatus("active");
              startWatch();
            },
            function(err2) {
              console.error("[Geo] Relaxed also failed:", err2.message);
              setError(err2.message);
              setStatus("error");
            },
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 30000 }
          );
        }
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }, [startWatch]);

  var stopWatching = useCallback(function() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
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
