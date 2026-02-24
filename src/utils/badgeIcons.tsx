import React from "react";

export type BadgeIconFn = (color: string) => React.ReactNode;

export const BADGE_ICONS: Record<string, BadgeIconFn> = {
  "first-blood": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <line x1="24" y1="6" x2="24" y2="34" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="18,34 30,34 24,44" fill={c} opacity="0.8"/>
      <polygon points="20,6 28,6 30,14 24,18 18,14" fill={c} opacity="0.9"/>
      <line x1="18" y1="14" x2="30" y2="14" stroke={c} strokeWidth="1.5" opacity="0.6"/>
      <circle cx="24" cy="38" r="2" fill={c} opacity="0.5"/>
      <circle cx="22" cy="42" r="1.2" fill={c} opacity="0.3"/>
    </svg>
  ),
  "explorer": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="18" y="10" width="12" height="18" rx="6" stroke={c} strokeWidth="2" fill="none"/>
      <line x1="24" y1="28" x2="24" y2="38" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="24" cy="39" rx="5" ry="2" stroke={c} strokeWidth="1.5" opacity="0.5"/>
      <ellipse cx="24" cy="19" rx="3" ry="4" fill={c} opacity="0.2"/>
      <line x1="24" y1="15" x2="24" y2="23" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
      <line x1="12" y1="24" x2="18" y2="24" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <line x1="30" y1="24" x2="36" y2="24" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <circle cx="24" cy="7" r="2" fill={c} opacity="0.6"/>
    </svg>
  ),
  "phantom-hunter": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M14 40 Q14 26 24 20 Q34 26 34 40 Q30 36 24 40 Q18 36 14 40Z" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.1"/>
      <circle cx="19" cy="31" r="2.5" fill={c} opacity="0.9"/>
      <circle cx="29" cy="31" r="2.5" fill={c} opacity="0.9"/>
      <path d="M19 37 Q24 34 29 37" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M24 20 L24 10" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M20 13 Q24 8 28 13" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3"/>
      <path d="M14 40 Q12 42 10 44" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M24 40 Q24 43 22 45" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M34 40 Q36 42 38 44" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  "lich-lord": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <ellipse cx="24" cy="22" rx="11" ry="13" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.08"/>
      <circle cx="18" cy="20" r="3" fill={c} opacity="0.9"/>
      <circle cx="30" cy="20" r="3" fill={c} opacity="0.9"/>
      <circle cx="18" cy="20" r="1.5" fill="#050208"/>
      <circle cx="30" cy="20" r="1.5" fill="#050208"/>
      <path d="M19 28 L21 26 L24 28 L27 26 L29 28" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 33 Q24 36 28 33" stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M24 35 L24 42" stroke={c} strokeWidth="1.5" opacity="0.5"/>
      <path d="M15 8 L24 4 L33 8 L33 13 Q24 10 15 13Z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15"/>
      <line x1="10" y1="10" x2="15" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="38" y1="10" x2="33" y2="8" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="24" cy="14" r="1.5" fill={c} opacity="0.7"/>
    </svg>
  ),
  "gravedigger": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <line x1="32" y1="8" x2="14" y2="26" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="28" y="4" width="10" height="7" rx="2" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.15" transform="rotate(45 33 7.5)"/>
      <path d="M14 26 L10 38 L22 34Z" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.2" strokeLinejoin="round"/>
      <path d="M10 38 L8 44" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      <path d="M28 36 Q32 34 36 36 Q36 42 32 44 Q28 42 28 36Z" stroke={c} strokeWidth="1.5" fill="none" opacity="0.4"/>
      <line x1="30" y1="39" x2="34" y2="39" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="32" y1="37" x2="32" y2="41" stroke={c} strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  "haunter": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M24 8 C16 8 10 14 10 22 L10 38 L14 34 L18 38 L22 34 L26 38 L30 34 L34 38 L38 34 L38 22 C38 14 32 8 24 8Z" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.08"/>
      <circle cx="19" cy="22" r="3" fill={c} opacity="0.6"/>
      <circle cx="29" cy="22" r="3" fill={c} opacity="0.6"/>
      <circle cx="19" cy="22" r="1.5" fill="#050208"/>
      <circle cx="29" cy="22" r="1.5" fill="#050208"/>
      <path d="M20 29 Q24 32 28 29" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M16 6 Q14 3 12 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M32 6 Q34 3 36 5" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
      <path d="M24 6 L24 3" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    </svg>
  ),
  "trail-walker": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M10 38 Q18 30 24 24 Q30 18 38 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" opacity="0.5"/>
      <ellipse cx="15" cy="36" rx="4" ry="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15" transform="rotate(-15 15 36)"/>
      <ellipse cx="20" cy="40" rx="5" ry="4" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15" transform="rotate(10 20 40)"/>
      <ellipse cx="28" cy="28" rx="4" ry="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15" transform="rotate(-15 28 28)"/>
      <ellipse cx="33" cy="32" rx="5" ry="4" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.15" transform="rotate(10 33 32)"/>
      <circle cx="38" cy="10" r="4" fill={c} opacity="0.9"/>
      <path d="M36 10 L38 12 L41 8" stroke="#050208" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  "social-butterfly": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="14" cy="12" r="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.1"/>
      <circle cx="34" cy="12" r="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.1"/>
      <circle cx="8" cy="28" r="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.1"/>
      <circle cx="40" cy="28" r="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.1"/>
      <circle cx="24" cy="36" r="5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.1"/>
      <line x1="14" y1="17" x2="19" y2="31" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="34" y1="17" x2="29" y2="31" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="13" y1="26" x2="19" y2="34" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="35" y1="26" x2="29" y2="34" stroke={c} strokeWidth="1" opacity="0.4"/>
      <line x1="19" y1="12" x2="29" y2="12" stroke={c} strokeWidth="1" opacity="0.4"/>
    </svg>
  ),
  "torque-loyalist": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M24 6 L38 14 L38 30 Q38 40 24 44 Q10 40 10 30 L10 14 Z" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.08"/>
      <path d="M24 14 Q28 18 26 23 Q30 20 29 26 Q26 22 24 26 Q22 22 19 26 Q18 20 22 23 Q20 18 24 14Z" fill={c} opacity="0.9"/>
      <path d="M18 30 L22 26 L24 28 L26 26 L30 30" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
    </svg>
  ),
  "magicblock-hero": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <line x1="12" y1="36" x2="36" y2="12" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="36" y1="36" x2="12" y2="12" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="10,10 16,10 16,16 10,16" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.3"/>
      <polygon points="32,10 38,10 38,16 32,16" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.3"/>
      <polygon points="10,32 16,32 16,38 10,38" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.3"/>
      <polygon points="32,32 38,32 38,38 32,38" stroke={c} strokeWidth="1.5" fill={c} fillOpacity="0.3"/>
      <circle cx="24" cy="24" r="4" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.2"/>
      <circle cx="24" cy="24" r="1.5" fill={c}/>
    </svg>
  ),
  "legend": (c) => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <path d="M30 10 A12 12 0 1 0 18 34 A8 8 0 1 1 30 10Z" stroke={c} strokeWidth="2" fill={c} fillOpacity="0.1"/>
      <circle cx="32" cy="16" r="3" fill={c} opacity="0.9"/>
      <line x1="32" y1="6" x2="32" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="38" y1="10" x2="35.5" y2="12.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="42" y1="16" x2="38" y2="16" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="21" cy="22" r="3" fill={c} opacity="0.4"/>
      <circle cx="27" cy="28" r="2" fill={c} opacity="0.3"/>
    </svg>
  ),
};
