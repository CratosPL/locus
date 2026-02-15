"use client";

import { useState, useEffect, useCallback } from "react";

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

export function useGeolocation() {
  var [position, setPosition] = useState<GeoPosition | null>(null);
  var [error, setError] = useState<string | null>(null);
  var [isWatching, setIsWatching] = useState(false);
  var [demoMode, setDemoMode] = useState(false);

  useEffect(function() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    setIsWatching(true);

    var watchId = navigator.geolocation.watchPosition(
      function(pos) {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        });
        setError(null);
        console.log("[Geo] Position:", pos.coords.latitude.toFixed(4), pos.coords.longitude.toFixed(4));
      },
      function(err) {
        console.warn("[Geo] Error:", err.message);
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 15000,
      }
    );

    return function() {
      navigator.geolocation.clearWatch(watchId);
      setIsWatching(false);
    };
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
      if (!position) return "Locating...";
      var dist = haversineDistance(position.lat, position.lng, lat, lng);
      if (dist < 1000) return Math.round(dist) + "m away";
      return (dist / 1000).toFixed(1) + "km away";
    },
    [position, demoMode]
  );

  return {
    position: position,
    error: error,
    isWatching: isWatching,
    demoMode: demoMode,
    setDemoMode: setDemoMode,
    distanceTo: distanceTo,
    isNearby: isNearby,
    formatDistance: formatDistance,
    claimRadius: CLAIM_RADIUS_METERS,
  };
}
