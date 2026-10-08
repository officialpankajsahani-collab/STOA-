import React from 'react';

interface MaaSamaleswariCrestProps {
  className?: string;
  size?: number | string;
  title?: string;
}

/**
 * Authentic vector emblem of Maa Samaleswari / Sambalpur Divine Crest
 * Matches the right crest shown on official Sambalpur Truck Owners' Association physical receipts:
 * - Crown/Mukut in golden temple style
 * - Sacred Tilak & Kundan adornments
 * - Sacred red, yellow, and white traditional floral aura
 */
export const MaaSamaleswariCrest: React.FC<MaaSamaleswariCrestProps> = ({
  className = '',
  size = 48,
  title = 'Maa Samaleswari - Presiding Deity of Sambalpur',
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      viewBox="0 0 200 240"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFBEB" />
          <stop offset="70%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#B91C1C" />
        </radialGradient>
        <linearGradient id="goldCrown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="40%" stopColor="#CA8A04" />
          <stop offset="80%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>
        <linearGradient id="divineRed" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="50%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </defs>

      {/* Outer Divine Aura / Halo Rays */}
      <circle cx="100" cy="115" r="82" fill="none" stroke="#FDE047" strokeWidth="3" strokeDasharray="4,3" />
      <circle cx="100" cy="115" r="76" fill="#7F1D1D" />

      {/* Decorative Outer Arch / Prabhavali */}
      <path
        d="M 40 170 C 25 110, 50 40, 100 25 C 150 40, 175 110, 160 170 Z"
        fill="url(#goldCrown)"
        stroke="#450A0A"
        strokeWidth="2.5"
      />

      {/* Inner Sanctum Oval */}
      <ellipse cx="100" cy="120" rx="48" ry="62" fill="url(#divineRed)" stroke="#FEF08A" strokeWidth="2.5" />

      {/* Golden Chhatra / Crown (Mukut) */}
      <path
        d="M 75 58 L 100 28 L 125 58 L 115 72 L 85 72 Z"
        fill="url(#goldCrown)"
        stroke="#78350F"
        strokeWidth="1.5"
      />
      <circle cx="100" cy="24" r="5" fill="#EF4444" stroke="#FEF08A" strokeWidth="1.5" />

      {/* Crown Jewels */}
      <circle cx="88" cy="56" r="3" fill="#EF4444" />
      <circle cx="100" cy="54" r="3.5" fill="#3B82F6" />
      <circle cx="112" cy="56" r="3" fill="#EF4444" />

      {/* Divine Face / Idol Representation of Maa Samaleswari */}
      {/* Symbolic Golden Eye / Netra Form */}
      <ellipse cx="100" cy="108" rx="28" ry="16" fill="#F8FAFC" stroke="#000000" strokeWidth="2" />
      <circle cx="100" cy="108" r="9" fill="#000000" />
      <circle cx="98" cy="106" r="3" fill="#FFFFFF" />

      {/* Sacred Sindoor / Tilak & Chandan Crescent */}
      <path
        d="M 80 84 Q 100 94 120 84 Q 100 88 80 84 Z"
        fill="#FDE047"
        stroke="#78350F"
        strokeWidth="1"
      />
      <circle cx="100" cy="80" r="5.5" fill="#DC2626" />
      <circle cx="100" cy="80" r="2.5" fill="#FEF08A" />

      {/* Sacred Nose Ornament (Nath) */}
      <circle cx="116" cy="126" r="7" fill="none" stroke="#FDE047" strokeWidth="2" />
      <circle cx="123" cy="126" r="2.5" fill="#EF4444" />

      {/* Sacred Lips / Murti Expression */}
      <path
        d="M 88 138 Q 100 148 112 138"
        fill="none"
        stroke="#FEF08A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 90 139 Q 100 146 110 139"
        fill="none"
        stroke="#DC2626"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Golden Garland / Haar & Jewels */}
      <path
        d="M 62 145 C 65 185, 135 185, 138 145"
        fill="none"
        stroke="url(#goldCrown)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="178" r="5" fill="#EF4444" stroke="#FDE047" strokeWidth="1.5" />
      <circle cx="80" cy="170" r="4" fill="#3B82F6" stroke="#FDE047" strokeWidth="1" />
      <circle cx="120" cy="170" r="4" fill="#3B82F6" stroke="#FDE047" strokeWidth="1" />

      {/* Base Foundation / Lotus Pedestal */}
      <path
        d="M 50 195 Q 100 185 150 195 L 140 215 Q 100 205 60 215 Z"
        fill="url(#goldCrown)"
        stroke="#78350F"
        strokeWidth="2"
      />
      <ellipse cx="100" cy="208" rx="35" ry="4" fill="#DC2626" />
    </svg>
  );
};
