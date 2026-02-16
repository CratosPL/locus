"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source?: "gps" | "ip" | "manual";
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

// ─── IP-based geolocation fallback ────────────────────────────────────────
async function getIPLocation(): Promise<GeoPosition | null> {
  // Try multiple free IP geolocation APIs
  var apis = [
    {
      url: "https://ipapi.co/json/",
      parse: function(d: any) { return { lat: d.latitude, lng: d.longitude }; }
    },
    {
      url: "https://ip-api.com/json/?fields=lat,lon",
      parse: function(d: any) { return { lat: d.lat, lng: d.lon }; }
    },
  ];

  for (var i = 0; i < apis.length; i++) {
    try {
      var resp = await fetch(apis[i].url, { signal: AbortSignal.timeout(5000) });
      if (resp.ok) {
        var data = await resp.json();
        var coords = apis[i].parse(data);
        if (coords.lat && coords.lng) {
          console.log("[Geo] IP fallback success:", coords.lat.toFixed(4), coords.lng.toFixed(4));
          return {
            lat: coords.lat,
            lng: coords.lng,
            accuracy: 5000, // ~5km accuracy for IP
            timestamp: Date.now(),
            source: "ip",
          };
        }
      }
    } catch (e) {
      console.warn("[Geo] IP API " + i + " failed:", e);
    }
  }
  return null;
}

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

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      function(pos) {
        var newPos: GeoPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: "gps",
        };
        console.log("[Geo] GPS:", newPos.lat.toFixed(4), newPos.lng.toFixed(4), "±" + Math.round(newPos.accuracy) + "m");
        setPosition(newPos);
        setError(null);
        setStatus("active");
        retryCountRef.current = 0;
      },
      function(err) {
        console.warn("[Geo] Watch error:", err.code, err.message);
        if (err.code === 1) {
          setStatus("denied");
          setError("Location permission denied");
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
        } else {
          if (!position) setStatus("error");
          retryCountRef.current++;
          if (retryCountRef.current <= 3) {
            var delay = retryCountRef.current * 5000;
            console.log("[Geo] Will retry in " + (delay / 1000) + "s");
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            retryTimerRef.current = setTimeout(startWatch, delay);
          }
        }
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 20000 }
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

    // Attempt 1: High accuracy
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        console.log("[Geo] Got GPS:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4), "±" + Math.round(pos.coords.accuracy) + "m");
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: "gps",
        });
        setError(null);
        setStatus("active");
        startWatch();
      },
      function(err) {
        console.warn("[Geo] High accuracy failed:", err.code, err.message);

        if (err.code === 1) {
          setStatus("denied");
          setError("Location permission denied");
          return;
        }

        // Attempt 2: Low accuracy, accept cached
        console.log("[Geo] Trying low accuracy...");
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            console.log("[Geo] Low accuracy GPS:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4));
            setPosition({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
              source: "gps",
            });
            setError(null);
            setStatus("active");
            startWatch();
          },
          function(err2) {
            console.warn("[Geo] Low accuracy also failed:", err2.message);

            // Attempt 3: IP geolocation fallback
            console.log("[Geo] Trying IP geolocation fallback...");
            getIPLocation().then(function(ipPos) {
              if (ipPos) {
                setPosition(ipPos);
                setError("Using approximate location (IP). GPS unavailable.");
                setStatus("active");
                // Still try to start GPS watch — it might work later
                startWatch();
              } else {
                setError("Location unavailable. Check browser permissions in System Settings → Privacy → Location Services.");
                setStatus("error");
              }
            });
          },
          { enableHighAccuracy: false, maximumAge: 300000, timeout: 15000 }
        );
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
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
