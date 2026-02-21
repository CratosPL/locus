"use client";

import React, { useEffect, useState } from "react";
import { Drop, DropCategory, GhostMark, QuestTrail } from "@/types";
import { CATEGORY_CONFIG, WARSAW_CENTER, DEFAULT_ZOOM } from "@/utils/mockData";
import type { GeoPosition } from "@/hooks/useGeolocation";
import {
  Twitter,
  ExternalLink,
  Share2,
  Heart,
  MessageSquare,
  Navigation,
  MapPin,
  UserPlus,
  CheckCircle2,
  Lock,
  Ghost,
  Coins,
  History,
  Sun,
  Moon
} from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

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
  onFollow?: (targetProfileId: string) => Promise<boolean>;
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
  onFollow,
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
  const [isAutoTheme, setIsAutoTheme] = useState(true);

  useEffect(() => {
    if (!isAutoTheme) return;

    // Determine if it's night (18:00 - 06:00)
    const updateTheme = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 18 || hour < 6);
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAutoTheme]);

  // Clean up markers to reduce map clutter
  // In a real app we'd use clustering, for now we limit visibility or density
  const visibleDrops = drops.slice(0, 15); 
  const visibleGhosts = ghosts.slice(0, 10);

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
    lore: renderToStaticMarkup(<History size={18} />),
    quest: renderToStaticMarkup(<Navigation size={18} />),
    secret: renderToStaticMarkup(<Lock size={18} />),
    ritual: renderToStaticMarkup(<MapPin size={18} />),
    treasure: renderToStaticMarkup(<Coins size={18} />),
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
      {/* Time mode indicator & manual toggle */}
      <div className="absolute bottom-6 left-6 z-[2000] flex flex-col gap-2">
        {!isAutoTheme && (
          <button
            onClick={() => setIsAutoTheme(true)}
            className={`px-2 py-1 rounded-md backdrop-blur-md border border-white/10 text-[8px] font-bold uppercase tracking-tighter shadow-lg transition-all active:scale-95 ${isNight ? 'bg-crypt-500/20 text-crypt-400' : 'bg-gray-200/50 text-gray-600'}`}
          >
            Reset Auto
          </button>
        )}
        
        <button
          onClick={() => {
            setIsAutoTheme(false);
            setIsNight(!isNight);
          }}
          className={`flex items-center justify-center w-14 h-14 rounded-2xl backdrop-blur-xl border-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all active:scale-90 pointer-events-auto ${
            isNight
              ? 'bg-void-100/90 border-crypt-300/30 text-crypt-300 hover:border-crypt-300'
              : 'bg-white/90 border-blue-500/30 text-blue-600 hover:border-blue-500'
          }`}
          title={isNight ? "Switch to Day Mode" : "Switch to Night Mode"}
        >
          <div className="flex flex-col items-center gap-1">
            {isNight ? <Moon size={24} /> : <Sun size={24} />}
            <span className="text-[8px] font-black uppercase tracking-tighter">
              {isNight ? 'Night' : 'Day'}
            </span>
          </div>
        </button>
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
        {visibleDrops.map((drop) => {
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="drop-popup-creator">by {drop.createdBy}</span>
                        {onFollow && drop.createdBy.startsWith('@') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFollow(drop.createdBy.substring(1));
                            }}
                            className="flex items-center gap-1 text-[9px] text-crypt-300 hover:text-crypt-100 transition-colors bg-transparent border-none p-0 font-mono font-bold cursor-pointer"
                          >
                            <UserPlus size={10} />
                            Follow
                          </button>
                        )}
                      </div>

                      {/* Social contacts */}
                      <div className="flex gap-3 mt-1.5">
                        {drop.twitterHandle && (
                          <a
                            href={`https://x.com/${drop.twitterHandle.replace('@', '')}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-500 hover:text-blue-400 transition-colors"
                          >
                            <Twitter size={14} />
                          </a>
                        )}
                        {drop.externalLink && (
                          <a
                            href={drop.externalLink.startsWith('http') ? drop.externalLink : `https://${drop.externalLink}`}
                            target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-gray-500 hover:text-emerald-400 transition-colors"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const blinkUrl = `${window.location.origin}/api/actions/drop?id=${drop.id}`;
                            navigator.clipboard.writeText(blinkUrl);
                            alert("Blink URL copied to clipboard!\n\nShare this on X as an interactive Solana Blink.");
                          }}
                          className="text-gray-500 hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer"
                        >
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
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
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all font-mono text-[11px] ${
                            isLiked
                              ? "bg-pink-500/10 border-pink-500/40 text-pink-500"
                              : "bg-void-100/50 border-crypt-300/10 text-gray-500 hover:border-crypt-300/30"
                          }`}
                        >
                          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                          {isLiked ? "Liked" : "Like"}
                        </button>

                        {/* Comment toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCommentingDropId(
                              commentingDropId === drop.id ? null : drop.id
                            );
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all font-mono text-[11px] ${
                            commentingDropId === drop.id
                              ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                              : "bg-void-100/50 border-crypt-300/10 text-gray-500 hover:border-crypt-300/30"
                          }`}
                        >
                          <MessageSquare size={14} />
                          Comment
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
        {visibleGhosts.map(function(ghost) {
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
