"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source?: "gps" | "ip";
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

// ─── IP geolocation fallback (HTTPS only, no AbortSignal.timeout) ─────────
function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  return new Promise(function(resolve, reject) {
    var controller = new AbortController();
    var timer = setTimeout(function() {
      controller.abort();
      reject(new Error("timeout"));
    }, ms);
    fetch(url, { signal: controller.signal })
      .then(function(r) { clearTimeout(timer); resolve(r); })
      .catch(function(e) { clearTimeout(timer); reject(e); });
  });
}

async function getIPLocation(): Promise<GeoPosition | null> {
  // Only HTTPS APIs that work from secure contexts
  var apis = [
    {
      url: "https://ipapi.co/json/",
      parse: function(d: any) { return { lat: d.latitude, lng: d.longitude }; }
    },
    {
      url: "https://ipwho.is/",
      parse: function(d: any) { return { lat: d.latitude, lng: d.longitude }; }
    },
    {
      url: "https://freeipapi.com/api/json",
      parse: function(d: any) { return { lat: d.latitude, lng: d.longitude }; }
    },
  ];

  for (var i = 0; i < apis.length; i++) {
    try {
      var resp = await fetchWithTimeout(apis[i].url, 6000);
      if (resp.ok) {
        var data = await resp.json();
        var coords = apis[i].parse(data);
        if (coords.lat && coords.lng && typeof coords.lat === "number") {
          console.log("[Geo] IP fallback via " + apis[i].url + ":", coords.lat.toFixed(2), coords.lng.toFixed(2));
          return {
            lat: coords.lat,
            lng: coords.lng,
            accuracy: 5000,
            timestamp: Date.now(),
            source: "ip",
          };
        }
      }
    } catch (e) {
      console.warn("[Geo] IP API failed:", apis[i].url);
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
        console.log("[Geo] GPS update:", newPos.lat.toFixed(5), newPos.lng.toFixed(5), "±" + Math.round(newPos.accuracy) + "m");
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
        }
        // For other errors: keep existing position, don't change status
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }
    );
  }, []);

  var requestLocation = useCallback(function() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setStatus("error");
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    setStatus("requesting");
    console.log("[Geo] Requesting location...");

    // ─── Attempt 1: High accuracy, generous timeout ─────────────────
    navigator.geolocation.getCurrentPosition(
      function onSuccess(pos) {
        console.log("[Geo] ✅ GPS:", pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5), "±" + Math.round(pos.coords.accuracy) + "m");
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
      function onError(err) {
        console.warn("[Geo] Attempt 1 failed:", err.code, err.message);

        if (err.code === 1) {
          setStatus("denied");
          setError("Location permission denied. Go to Settings → Privacy → Location Services → Safari → While Using.");
          return;
        }

        // ─── Attempt 2: Low accuracy, accept old cached position ────
        console.log("[Geo] Trying low accuracy + cached...");
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            console.log("[Geo] ✅ Cached/low GPS:", pos.coords.latitude.toFixed(5), pos.coords.longitude.toFixed(5));
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
            console.warn("[Geo] Attempt 2 failed:", err2.message);

            // ─── Attempt 3: IP geolocation ──────────────────────────
            console.log("[Geo] Falling back to IP geolocation...");
            getIPLocation().then(function(ipPos) {
              if (ipPos) {
                setPosition(ipPos);
                setError("Approximate location (IP-based). For precise GPS: check Settings → Privacy → Location Services.");
                setStatus("active");
                startWatch(); // Keep trying GPS in background
              } else {
                console.error("[Geo] All methods failed");
                setError("Cannot determine location. Please enable Location Services for your browser.");
                setStatus("error");
              }
            });
          },
          { enableHighAccuracy: false, maximumAge: 600000, timeout: 20000 }
        );
      },
      // iPhone GPS cold fix can take 15-20s, especially indoors
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 20000 }
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
      // IP location is too imprecise for claiming
      if (position.source === "ip") return false;
      return haversineDistance(position.lat, position.lng, lat, lng) <= CLAIM_RADIUS_METERS;
    },
    [position, demoMode]
  );

  var formatDistance = useCallback(
    function(lat: number, lng: number): string {
      if (demoMode) return "Demo mode";
      if (!position) return "Enable GPS";
      var dist = haversineDistance(position.lat, position.lng, lat, lng);
      var prefix = position.source === "ip" ? "~" : "";
      if (dist < 1000) return prefix + Math.round(dist) + "m away";
      return prefix + (dist / 1000).toFixed(1) + "km away";
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
