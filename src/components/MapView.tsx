"use client";

import React, { useEffect, useState } from "react";
import { Drop, DropCategory, GhostMark, QuestTrail } from "@/types";
import { CATEGORY_CONFIG, WARSAW_CENTER, DEFAULT_ZOOM } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";

let L: typeof import("leaflet") | null = null;
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;
let Circle: any = null;
let Polyline: any = null;
let useMapHook: any = null;

interface MapProps {
  drops: Drop[];
  ghosts: GhostMark[];
  activeTrail: QuestTrail | null;
  trailProgress?: Set<string>;
  selectedDrop: Drop | null;
  onSelectDrop: (drop: Drop | null) => void;
  isConnected: boolean;
  isProcessing: boolean;
  onClaim: (dropId: string) => void;
  onLike: (dropId: string) => void;
  onComment: (dropId: string, text: string) => void;
  onConnectWallet: () => void;
  onReactGhost?: (ghostId: string) => void;
  likedIds: Set<string>;
  userPosition: GeoPosition | null;
  demoMode: boolean;
  formatDistance: (lat: number, lng: number) => string;
  isNearby: (lat: number, lng: number) => boolean;
  flyTrigger?: number;
}

// Inner component — flies map to user position when GPS activates
function FlyToUser({ position, flyTrigger }: { position: GeoPosition | null; flyTrigger: number }) {
  var map = useMapHook ? useMapHook() : null;
  var lastFlyTrigger = React.useRef(0);

  // Fly on first position OR when flyTrigger changes (re-center button)
  React.useEffect(function() {
    if (map && position) {
      if (lastFlyTrigger.current === 0 || flyTrigger !== lastFlyTrigger.current) {
        map.flyTo([position.lat, position.lng], 15, { duration: 1.2 });
        lastFlyTrigger.current = flyTrigger || 1;
      }
    }
  }, [map, position, flyTrigger]);

  return null;
}

export default function MapView({
  drops,
  ghosts,
  activeTrail,
  trailProgress,
  selectedDrop,
  onSelectDrop,
  isConnected,
  isProcessing,
  onClaim,
  onLike,
  onComment,
  onConnectWallet,
  onReactGhost,
  likedIds,
  userPosition,
  demoMode,
  formatDistance,
  isNearby,
  flyTrigger,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentingDropId, setCommentingDropId] = useState<string | null>(null);
  const [isNight, setIsNight] = useState(true);

  useEffect(() => {
    // Determine if it's night (18:00 - 06:00)
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);

    const interval = setInterval(() => {
      const h = new Date().getHours();
      setIsNight(h >= 18 || h < 6);
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Determine if it's night (18:00 - 06:00)
    const hour = new Date().getHours();
    setIsNight(hour >= 18 || hour < 6);
  }, []);

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
        Polyline = reactLeafletMod.Polyline;
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

  // ─── SVG Icons per category ─────────────────────────────────────────────
  const SVG_ICONS: Record<string, string> = {
    lore: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2C6.48 2 2 6 2 10.5c0 3 1.5 5.5 4 7L12 22l6-4.5c2.5-1.5 4-4 4-7C22 6 17.52 2 12 2z"/><circle cx="12" cy="10" r="2" fill="currentColor"/></svg>',
    quest: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/></svg>',
    secret: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>',
    ritual: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>',
    treasure: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 12h4l3-9 6 18 3-9h4"/></svg>',
  };

  // ─── Icons ──────────────────────────────────────────────────────────────
  const createDropIcon = (category: DropCategory, isClaimed: boolean) => {
    const config = CATEGORY_CONFIG[category];
    const bgColor = isClaimed ? "#444" : config.color;
    const glowColor = isClaimed ? "transparent" : config.color;
    const claimedClass = isClaimed ? "drop-marker-claimed" : "marker-pulse";
    const svgIcon = SVG_ICONS[category] || SVG_ICONS.lore;

    return L!.divIcon({
      className: "custom-marker",
      html: '<div class="drop-marker ' + claimedClass + '" style="' +
        '--marker-color:' + bgColor + '; --glow-color:' + glowColor + ';">' +
        '<div class="drop-marker-inner">' +
          '<div class="drop-marker-svg" style="color:' + (isClaimed ? '#666' : '#fff') + '">' + svgIcon + '</div>' +
        '</div>' +
        '<div class="drop-marker-pointer"></div>' +
        (isClaimed ? '' : '<div class="drop-marker-ring"></div>') +
        '<div class="drop-marker-reward" style="color:' + bgColor + '">' +
          (isClaimed ? '✓' : config.icon) +
        '</div>' +
      '</div>',
      iconSize: [48, 58],
      iconAnchor: [24, 54],
      popupAnchor: [0, -54],
    });
  };

  const userIcon = L!.divIcon({
    className: "user-marker",
    html: '<div class="user-dot"><div class="user-dot-core"></div><div class="user-dot-ring"></div><div class="user-dot-ring2"></div></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Ghost mark icon — translucent, ethereal
  const createGhostIcon = (emoji: string) => {
    return L!.divIcon({
      className: "custom-marker",
      html: '<div class="ghost-marker">' +
        '<div class="ghost-marker-inner">' + emoji + '</div>' +
        '<div class="ghost-marker-ring"></div>' +
      '</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });
  };

  // Trail waypoint icon
  const createTrailIcon = (order: number, color: string, isVisited: boolean) => {
    return L!.divIcon({
      className: "custom-marker",
      html: '<div class="trail-waypoint" style="--trail-color:' + color + ';">' +
        '<div class="trail-waypoint-inner ' + (isVisited ? 'trail-visited' : '') + '">' +
          '<span class="trail-waypoint-num">' + (isVisited ? '✓' : order) + '</span>' +
        '</div>' +
      '</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

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
      {/* Time mode indicator */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider ${isNight ? 'bg-void-100/40 text-crypt-300' : 'bg-white/40 text-gray-800'}`}>
          {isNight ? '🌙 Night Mode' : '☀️ Day Mode'}
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        style={{ background: isNight ? "#050208" : "#f4f1ea" }}
        zoomControl={false}
      >
        <TileLayer
          url={isNight 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          maxZoom={19}
          className={`map-tiles-themed ${isNight ? "map-tiles-night" : "map-tiles-day"}`}
          key={isNight ? 'night' : 'day'}
        />

        {/* Fly to user when GPS activates */}
        <FlyToUser position={userPosition} flyTrigger={flyTrigger || 0} />

        {/* ─── User position marker ─────────────────────────────────── */}
        {userPosition && (
          <>
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={userIcon}
            />
            {/* Accuracy ring */}
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={Math.max(15, userPosition.accuracy)}
              pathOptions={{
                color: isNight ? "#818cf8" : "#4f46e5",
                fillColor: isNight ? "#a78bfa" : "#6366f1",
                fillOpacity: isNight ? 0.08 : 0.04,
                weight: 1,
                dashArray: "4 4",
              }}
            />
            {/* Claim radius ring */}
            <Circle
              center={[userPosition.lat, userPosition.lng]}
              radius={150}
              pathOptions={{
                color: isNight ? "#818cf8" : "#4f46e5",
                fillColor: "transparent",
                fillOpacity: 0,
                weight: 1.5,
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
              <Popup maxWidth={290} minWidth={250} className="locus-popup">
                <div className="drop-popup">
                  {/* Header band */}
                  <div className="drop-popup-header" style={{ borderColor: cat.color + "44", background: cat.color + "11" }}>
                    <div className="drop-popup-badge" style={{ background: cat.color + "22", color: cat.color, borderColor: cat.color + "55" }}>
                      {cat.icon} {cat.label}
                    </div>
                    <div className={"drop-popup-distance " + (nearby ? "nearby" : "far")}>
                      {nearby ? "✓ In range" : distance}
                    </div>
                  </div>

                  {/* Message */}
                  <p className="drop-popup-message">{drop.message}</p>

                  {/* Creator + Reward row */}
                  <div className="drop-popup-meta">
                    <span className="drop-popup-creator">by {drop.createdBy}</span>
                    <span className="drop-popup-reward" style={{ color: cat.color }}>
                      {drop.finderReward} <span className="sol-symbol">◎</span>
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
                    <button
                      onClick={function(e) { e.stopPropagation(); onConnectWallet(); }}
                      style={{
                      padding: "10px", borderRadius: "8px",
                      background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(124,58,237,0.15))",
                      border: "1px solid rgba(167,139,250,0.4)",
                      color: "#a78bfa", textAlign: "center" as const, fontSize: "13px",
                      cursor: "pointer", width: "100%", fontFamily: "inherit", fontWeight: 700,
                    }}>
                      🔗 Connect Wallet to Claim
                    </button>
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

        {/* ─── Ghost Markers ─────────────────────────────────────────── */}
        {ghosts.map(function(ghost) {
          var age = Date.now() - ghost.createdAt;
          var hoursLeft = Math.max(0, Math.round((86400000 - age) / 3600000));
          return (
            <Marker
              key={ghost.id}
              position={[ghost.location.lat, ghost.location.lng]}
              icon={createGhostIcon(ghost.emoji)}
            >
              <Popup className="locus-popup ghost-popup">
                <div style={{
                  fontFamily: "JetBrains Mono, monospace",
                  padding: "12px", minWidth: "180px",
                }}>
                  <div style={{ fontSize: "24px", textAlign: "center", marginBottom: "6px" }}>
                    {ghost.emoji}
                  </div>
                  <p style={{ color: "#c4b5fd", fontSize: "12px", textAlign: "center", margin: "0 0 8px" }}>
                    {ghost.message}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "9px", color: "#666" }}>
                      ⏳ {hoursLeft}h left
                    </span>
                    <button
                      onClick={function() { if (onReactGhost) onReactGhost(ghost.id); }}
                      style={{
                        background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
                        borderRadius: "12px", padding: "3px 10px", cursor: "pointer",
                        color: "#a78bfa", fontSize: "11px", fontFamily: "inherit",
                      }}
                    >
                      👻 {ghost.reactions}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* ─── Active Trail Polyline + Waypoints ─────────────────────── */}
        {activeTrail && Polyline && (
          <>
            <Polyline
              positions={activeTrail.waypoints.map(function(wp) {
                return [wp.location.lat, wp.location.lng] as [number, number];
              })}
              pathOptions={{
                color: activeTrail.color,
                weight: 3,
                opacity: 0.6,
                dashArray: "8 6",
              }}
            />
            {activeTrail.waypoints.map(function(wp) {
              var visited = trailProgress && trailProgress.has(wp.id);
              return (
                <Marker
                  key={wp.id}
                  position={[wp.location.lat, wp.location.lng]}
                  icon={createTrailIcon(wp.order, activeTrail.color, !!visited)}
                >
                  <Popup className="locus-popup">
                    <div style={{
                      fontFamily: "JetBrains Mono, monospace",
                      padding: "10px", minWidth: "160px",
                    }}>
                      <div style={{
                        fontSize: "11px", fontWeight: 700,
                        color: activeTrail.color, marginBottom: "4px",
                      }}>
                        #{wp.order} — {wp.name}
                      </div>
                      <p style={{ color: "#999", fontSize: "11px", margin: "0 0 6px", fontStyle: "italic" }}>
                        {wp.hint}
                      </p>
                      <div style={{ fontSize: "10px", color: visited ? "#34d399" : "#666" }}>
                        {visited ? "✓ Visited" : "Walk within 150m to check in"}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}
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
        .leaflet-container { background: ${isNight ? "#050208" : "#f4f1ea"} !important; }
        .custom-marker:hover > div { transform: scale(1.2) !important; }
        @keyframes user-pulse {
          0%, 100% { box-shadow: 0 0 0 6px rgba(59,130,246,0.3), 0 0 20px rgba(59,130,246,0.5); }
          50% { box-shadow: 0 0 0 12px rgba(59,130,246,0.1), 0 0 30px rgba(59,130,246,0.3); }
        }
      `}</style>
    </div>
  );
}
