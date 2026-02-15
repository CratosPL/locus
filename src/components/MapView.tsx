"use client";

import React, { useEffect, useState } from "react";
import { Drop, DropCategory } from "@/types";
import { CATEGORY_CONFIG, WARSAW_CENTER, DEFAULT_ZOOM } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";

let L: typeof import("leaflet") | null = null;
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;
let Circle: any = null;
let useMapHook: any = null;

interface MapProps {
  drops: Drop[];
  selectedDrop: Drop | null;
  onSelectDrop: (drop: Drop | null) => void;
  isConnected: boolean;
  isProcessing: boolean;
  onClaim: (dropId: string) => void;
  onLike: (dropId: string) => void;
  onComment: (dropId: string, text: string) => void;
  likedIds: Set<string>;
  userPosition: GeoPosition | null;
  demoMode: boolean;
  formatDistance: (lat: number, lng: number) => string;
  isNearby: (lat: number, lng: number) => boolean;
}

// Inner component — flies map to user position when GPS activates
function FlyToUser({ position }: { position: GeoPosition | null }) {
  var map = useMapHook ? useMapHook() : null;
  var hasFlown = React.useRef(false);

  React.useEffect(function() {
    if (map && position && !hasFlown.current) {
      map.flyTo([position.lat, position.lng], 15, { duration: 1.5 });
      hasFlown.current = true;
    }
  }, [map, position]);

  return null;
}

export default function MapView({
  drops,
  selectedDrop,
  onSelectDrop,
  isConnected,
  isProcessing,
  onClaim,
  onLike,
  onComment,
  likedIds,
  userPosition,
  demoMode,
  formatDistance,
  isNearby,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentingDropId, setCommentingDropId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    Promise.all([import("leaflet"), import("react-leaflet")])
      .then(([leafletMod, reactLeafletMod]) => {
        L = leafletMod.default || leafletMod;
        MapContainer = reactLeafletMod.MapContainer;
        TileLayer = reactLeafletMod.TileLayer;
        Marker = reactLeafletMod.Marker;
        Popup = reactLeafletMod.Popup;
        Circle = reactLeafletMod.Circle;
        useMapHook = reactLeafletMod.useMap;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
        setLeafletReady(true);
      })
      .catch((err) => console.error("Leaflet load failed:", err));
  }, []);

  if (!mounted || !leafletReady || !L || !MapContainer) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-float">🗺️</div>
          <p className="text-crypt-300 font-mono text-sm animate-pulse">
            Summoning the map...
          </p>
        </div>
      </div>
    );
  }

  // ─── Icons ──────────────────────────────────────────────────────────────
  const createDropIcon = (category: DropCategory, isClaimed: boolean) => {
    const config = CATEGORY_CONFIG[category];
    const bgColor = isClaimed ? "#333" : config.color;
    const opacity = isClaimed ? 0.5 : 1;

    return L!.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: ${bgColor}22; border: 2px solid ${bgColor};
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; opacity: ${opacity};
          box-shadow: 0 0 12px ${bgColor}44;
          transition: transform 0.2s; cursor: pointer;
        "><span style="line-height:1">${config.icon}</span></div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });
  };

  const userIcon = L!.divIcon({
    className: "user-marker",
    html: `
      <div style="
        width: 20px; height: 20px; border-radius: 50%;
        background: #3b82f6; border: 3px solid #fff;
        box-shadow: 0 0 0 6px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.5);
        animation: user-pulse 2s ease-in-out infinite;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  // Center on user if available
  const mapCenter: [number, number] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : [WARSAW_CENTER.lat, WARSAW_CENTER.lng];

  const handleCommentSubmit = (dropId: string) => {
    if (commentText.trim()) {
      onComment(dropId, commentText.trim());
      setCommentText("");
      setCommentingDropId(null);
    }
  };

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        style={{ background: "#050208" }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
        />

        {/* Fly to user when GPS activates */}
        <FlyToUser position={userPosition} />

        {/* ─── User position marker ─────────────────────────────────── */}
        {userPosition && (
          <>
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userIcon}
            />
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={150}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.06,
                weight: 1,
                dashArray: "6 4",
              }}
            />
          </>
        )}

        {/* ─── Drop markers ─────────────────────────────────────────── */}
        {drops.map((drop) => {
          const cat = CATEGORY_CONFIG[drop.category];
          const nearby = isNearby(drop.location.lat, drop.location.lng);
          const distance = formatDistance(drop.location.lat, drop.location.lng);
          const isLiked = likedIds.has(drop.id);

          return (
            <Marker
              key={drop.id}
              position={[drop.location.lat, drop.location.lng]}
              icon={createDropIcon(drop.category, drop.isClaimed)}
              eventHandlers={{ click: () => onSelectDrop(drop) }}
            >
              <Popup maxWidth={280} minWidth={240}>
                <div
                  style={{
                    background: "#0f0a18",
                    padding: "14px",
                    borderRadius: "14px",
                    border: `1px solid ${cat.color}33`,
                    fontFamily: "monospace",
                    minWidth: "220px",
                  }}
                >
                  {/* Category + Distance */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background: `${cat.color}22`,
                        color: cat.color,
                        border: `1px solid ${cat.color}44`,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cat.icon} {cat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: nearby ? "#34d399" : "#ef4444",
                        fontWeight: 600,
                      }}
                    >
                      {nearby ? "📍 In range" : `📍 ${distance}`}
                    </div>
                  </div>

                  {/* Message */}
                  <p style={{ color: "#c4b5fd", fontSize: "13px", lineHeight: 1.5, margin: "8px 0" }}>
                    {drop.message}
                  </p>

                  {/* Creator + Reward */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "10px", color: "#666" }}>
                      by {drop.createdBy}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: 800, color: "#34d399" }}>
                      {drop.finderReward} ◎
                    </span>
                  </div>

                  {/* ─── Action Area ──────────────────────────────────── */}
                  {drop.isClaimed ? (
                    <div style={{
                      padding: "8px", borderRadius: "8px",
                      background: "rgba(50,50,50,0.3)",
                      color: "#666", textAlign: "center", fontSize: "12px",
                    }}>
                      ✓ Claimed {drop.claimedBy ? `by ${drop.claimedBy.slice(0, 8)}...` : ""}
                    </div>
                  ) : !isConnected ? (
                    <div style={{
                      padding: "8px", borderRadius: "8px",
                      background: "rgba(167,139,250,0.08)",
                      border: "1px dashed rgba(167,139,250,0.3)",
                      color: "#a78bfa", textAlign: "center", fontSize: "12px",
                    }}>
                      🔗 Connect wallet to claim
                    </div>
                  ) : !nearby ? (
                    <div style={{
                      padding: "8px", borderRadius: "8px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px dashed rgba(239,68,68,0.3)",
                      color: "#ef4444", textAlign: "center", fontSize: "12px",
                    }}>
                      📍 Walk closer to claim ({distance})
                    </div>
                  ) : (
                    <button
                      onClick={() => onClaim(drop.id)}
                      disabled={isProcessing}
                      style={{
                        width: "100%", padding: "10px", borderRadius: "8px",
                        border: "none",
                        background: isProcessing
                          ? "rgba(167,139,250,0.2)"
                          : "linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)",
                        color: "#fff", fontSize: "12px", fontWeight: 700,
                        cursor: isProcessing ? "wait" : "pointer",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                      }}
                    >
                      {isProcessing ? "⏳ Confirming..." : "⚡ Claim Drop"}
                    </button>
                  )}

                  {/* ─── Social Bar (Tapestry) ────────────────────────── */}
                  {isConnected && (
                    <div style={{ marginTop: "10px", borderTop: "1px solid rgba(167,139,250,0.1)", paddingTop: "10px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* Like button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLike(drop.id);
                          }}
                          disabled={isLiked}
                          style={{
                            flex: 1, padding: "6px", borderRadius: "8px",
                            border: `1px solid ${isLiked ? "#f472b6" : "rgba(167,139,250,0.15)"}`,
                            background: isLiked ? "rgba(244,114,182,0.1)" : "rgba(167,139,250,0.05)",
                            color: isLiked ? "#f472b6" : "#888",
                            fontSize: "11px", cursor: isLiked ? "default" : "pointer",
                            fontFamily: "monospace",
                          }}
                        >
                          {isLiked ? "❤️ Liked" : "🤍 Like"}
                        </button>

                        {/* Comment toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentingDropId(
                              commentingDropId === drop.id ? null : drop.id
                            );
                          }}
                          style={{
                            flex: 1, padding: "6px", borderRadius: "8px",
                            border: "1px solid rgba(167,139,250,0.15)",
                            background: commentingDropId === drop.id
                              ? "rgba(96,165,250,0.1)"
                              : "rgba(167,139,250,0.05)",
                            color: commentingDropId === drop.id ? "#60a5fa" : "#888",
                            fontSize: "11px", cursor: "pointer",
                            fontFamily: "monospace",
                          }}
                        >
                          💬 Comment
                        </button>
                      </div>

                      {/* Comment input */}
                      {commentingDropId === drop.id && (
                        <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                          <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleCommentSubmit(drop.id);
                            }}
                            placeholder="Leave a message..."
                            style={{
                              flex: 1, padding: "6px 10px",
                              borderRadius: "8px",
                              border: "1px solid rgba(167,139,250,0.2)",
                              background: "rgba(167,139,250,0.05)",
                              color: "#c4b5fd", fontSize: "11px",
                              fontFamily: "monospace",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => handleCommentSubmit(drop.id)}
                            style={{
                              padding: "6px 10px", borderRadius: "8px",
                              border: "none",
                              background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                              color: "#fff", fontSize: "11px",
                              cursor: "pointer", fontWeight: 700,
                            }}
                          >
                            ↵
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Custom styles */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 14px !important;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip {
          background: #0f0a18 !important;
          border: 1px solid rgba(167,139,250,0.1) !important;
        }
        .leaflet-popup-close-button {
          color: #666 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 8px !important;
        }
        .leaflet-container { background: #050208 !important; }
        .custom-marker:hover > div { transform: scale(1.2) !important; }
        @keyframes user-pulse {
          0%, 100% { box-shadow: 0 0 0 6px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(59,130,246,0.1), 0 0 30px rgba(59,130,246,0.3); }
        }
      `}</style>
    </div>
  );
}
