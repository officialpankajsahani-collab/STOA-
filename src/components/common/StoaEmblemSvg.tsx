import React from 'react';

interface StoaEmblemSvgProps {
  className?: string;
  size?: number | string;
  title?: string;
}

/**
 * Authentic vector emblem of "SAMBALPUR TRUCK OWNER'S ASSOCIATION · SAMBALPUR"
 * Faithfully matches the official circular emblem with:
 * - Dark blue and white outer borders
 * - Red circular band with top and bottom curved text
 * - Radiating yellow and white sunburst rays
 * - Iconic loaded Indian multi-axle freight truck in center
 */
export const StoaEmblemSvg: React.FC<StoaEmblemSvgProps> = ({
  className = '',
  size = 48,
  title = "Sambalpur Truck Owner's Association",
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  // Generate 32 radial sunburst ray paths
  const rayPaths = [];
  const numRays = 32;
  const rayAngle = 360 / numRays;
  for (let i = 0; i < numRays; i += 2) {
    const a1 = (i * rayAngle * Math.PI) / 180;
    const a2 = ((i + 1) * rayAngle * Math.PI) / 180;
    const r = 180;
    const x1 = 250 + r * Math.sin(a1);
    const y1 = 250 - r * Math.cos(a1);
    const x2 = 250 + r * Math.sin(a2);
    const y2 = 250 - r * Math.cos(a2);
    rayPaths.push(
      <polygon
        key={i}
        points={`250,250 ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`}
        fill="#facc15"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      width={pixelSize}
      height={pixelSize}
      className={`shrink-0 select-none ${className}`}
      role="img"
      aria-label={title}
      style={{ overflow: 'visible' }}
    >
      <title>{title}</title>
      <defs>
        {/* Shadow filter for depth */}
        <filter id="stoa-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
        </filter>

        {/* Clip path for inner sunburst disk */}
        <clipPath id="inner-sunburst-clip">
          <circle cx="250" cy="250" r="162" />
        </clipPath>

        {/* Top curved path for upper text: SAMBALPUR TRUCK OWNER'S ASSOCIATION */}
        {/* Sweep along upper half circle */}
        <path
          id="upper-arc-path"
          d="M 68,250 A 182,182 0 1,1 432,250"
          fill="none"
        />

        {/* Bottom curved path for lower text: • SAMBALPUR • */}
        {/* Arc along lower half circle from left to right */}
        <path
          id="lower-arc-path"
          d="M 95,280 A 182,182 0 0,0 405,280"
          fill="none"
        />
      </defs>

      {/* Outer Blue Thin Rim */}
      <circle cx="250" cy="250" r="248" fill="#1e3a8a" />

      {/* Outer White Divider */}
      <circle cx="250" cy="250" r="244" fill="#ffffff" />

      {/* Main Red Circular Band */}
      <circle cx="250" cy="250" r="240" fill="#b91c1c" stroke="#991b1b" strokeWidth="2" />

      {/* Inner Blue Rim between red ring and sunburst */}
      <circle cx="250" cy="250" r="166" fill="#1e3a8a" />
      <circle cx="250" cy="250" r="164" fill="#ffffff" />

      {/* Sunburst Disc Background (White base) */}
      <g clipPath="url(#inner-sunburst-clip)">
        <circle cx="250" cy="250" r="162" fill="#ffffff" />
        {/* Radiating Yellow Rays */}
        {rayPaths}
      </g>

      {/* Inner rim border */}
      <circle
        cx="250"
        cy="250"
        r="162"
        fill="none"
        stroke="#1e3a8a"
        strokeWidth="3.5"
      />

      {/* Upper Arc Text: SAMBALPUR TRUCK OWNER'S ASSOCIATION */}
      <text
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
        fontSize="24"
        fontWeight="900"
        letterSpacing="2.2px"
        textAnchor="middle"
        style={{ textTransform: 'uppercase' }}
      >
        <textPath href="#upper-arc-path" startOffset="50%" textAnchor="middle">
          SAMBALPUR TRUCK OWNER&apos;S ASSOCIATION
        </textPath>
      </text>

      {/* Lower Arc Text: • SAMBALPUR • */}
      <text
        fill="#ffffff"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
        fontSize="27"
        fontWeight="900"
        letterSpacing="4.5px"
        textAnchor="middle"
        style={{ textTransform: 'uppercase' }}
      >
        <textPath href="#lower-arc-path" startOffset="50%" textAnchor="middle">
          • SAMBALPUR •
        </textPath>
      </text>

      {/* CENTERPIECE: Iconic Loaded Indian Cargo Truck */}
      <g transform="translate(250, 252) scale(0.96) translate(-250, -250)" filter="url(#stoa-shadow)">
        {/* Soft ground shadow under truck */}
        <ellipse cx="252" cy="336" rx="146" ry="14" fill="#0f172a" opacity="0.45" />

        {/* Cargo Body - High Loaded Mound with Olive Tarp */}
        <path
          d="M 112,185 C 112,168 128,154 150,152 C 172,150 200,147 240,146 C 285,145 320,148 348,154 C 368,158 376,170 376,186 L 372,210 L 115,208 Z"
          fill="#5a6048"
          stroke="#3f4433"
          strokeWidth="3"
        />

        {/* Tarp Folds & Details */}
        <path
          d="M 130,172 Q 170,162 210,168 Q 270,160 320,168 Q 355,165 372,176"
          fill="none"
          stroke="#73795f"
          strokeWidth="3.5"
        />
        <path
          d="M 125,188 Q 185,178 245,182 Q 305,176 365,186"
          fill="none"
          stroke="#424634"
          strokeWidth="2.5"
        />
        {/* Rope tie-downs along the tarp */}
        <line x1="145" y1="156" x2="140" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="185" y1="150" x2="182" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="225" y1="148" x2="224" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="265" y1="148" x2="266" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="305" y1="152" x2="308" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />
        <line x1="345" y1="158" x2="348" y2="208" stroke="#d97706" strokeWidth="2" strokeDasharray="3,3" />

        {/* Red Truck Cargo Body (Long carrier deck) */}
        <rect
          x="110"
          y="204"
          width="170"
          height="76"
          rx="3"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="3"
        />

        {/* Cargo Body Side Ribs & Decorative Stripes */}
        <g stroke="#ffffff" strokeWidth="2" opacity="0.95">
          <line x1="110" y1="218" x2="280" y2="218" />
          <line x1="110" y1="234" x2="280" y2="234" />
          <line x1="110" y1="250" x2="280" y2="250" />
          <line x1="110" y1="266" x2="280" y2="266" />
        </g>
        {/* Vertical Wooden Carrier Slats */}
        <g stroke="#7f1d1d" strokeWidth="3">
          <line x1="138" y1="205" x2="138" y2="280" />
          <line x1="166" y1="205" x2="166" y2="280" />
          <line x1="194" y1="205" x2="194" y2="280" />
          <line x1="222" y1="205" x2="222" y2="280" />
          <line x1="250" y1="205" x2="250" y2="280" />
        </g>
        {/* Body Decorative Badges (White and Yellow stickers) */}
        <rect x="122" y="254" width="10" height="8" fill="#facc15" stroke="#ffffff" strokeWidth="1" />
        <rect x="148" y="254" width="12" height="8" fill="#ffffff" />
        <rect x="176" y="254" width="12" height="8" fill="#facc15" />
        <rect x="204" y="254" width="12" height="8" fill="#ffffff" />
        <rect x="232" y="254" width="12" height="8" fill="#facc15" />
        <rect x="260" y="254" width="12" height="8" fill="#ffffff" />

        {/* Truck Chassis Frame under body */}
        <rect x="116" y="278" width="248" height="12" fill="#1e293b" />
        <rect x="128" y="288" width="30" height="14" fill="#334155" rx="2" /> {/* Fuel Tank */}
        <rect x="164" y="288" width="18" height="10" fill="#475569" rx="1" /> {/* Tool Box */}

        {/* Truck Cabin (Forward Control / Semi-Forward 3/4 View) */}
        <path
          d="M 276,192 L 344,190 C 354,190 362,196 366,206 L 386,252 C 389,260 388,272 384,284 L 380,296 L 276,296 Z"
          fill="#38bdf8"
          stroke="#0284c7"
          strokeWidth="3.5"
        />

        {/* Cabin Visor & Crown (Top roof rack) */}
        <rect x="274" y="180" width="76" height="14" rx="3" fill="#ffffff" stroke="#0284c7" strokeWidth="2.5" />
        <rect x="282" y="183" width="60" height="8" fill="#dc2626" rx="2" />
        {/* STOA Crown text on visor */}
        <text
          x="312"
          y="189"
          fill="#ffffff"
          fontSize="6.5"
          fontWeight="900"
          fontFamily="monospace"
          textAnchor="middle"
        >
          STAC
        </text>

        {/* Windshield Glass */}
        <path
          d="M 288,198 L 342,198 C 347,198 352,203 355,210 L 366,236 C 367,239 365,242 361,242 L 288,242 Z"
          fill="#0c4a6e"
          stroke="#ffffff"
          strokeWidth="2.5"
        />
        {/* Windshield Reflection */}
        <path
          d="M 304,202 L 334,202 L 348,236 L 318,236 Z"
          fill="#38bdf8"
          opacity="0.45"
        />
        {/* Windshield Wipers */}
        <line x1="310" y1="240" x2="322" y2="218" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
        <line x1="334" y1="240" x2="346" y2="218" stroke="#000000" strokeWidth="2" strokeLinecap="round" />

        {/* Cabin Front Panel / Grille (White, Red, Yellow stripes) */}
        <path
          d="M 364,242 L 384,246 C 387,249 388,255 388,262 L 383,294 L 358,294 L 358,242 Z"
          fill="#f8fafc"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        {/* Decorative Tricolor Band across grill */}
        <rect x="360" y="248" width="26" height="4" fill="#f97316" />
        <rect x="360" y="252" width="26" height="4" fill="#ffffff" />
        <rect x="360" y="256" width="26" height="4" fill="#16a34a" />

        {/* Cabin Door & Side Window */}
        <path
          d="M 282,202 L 310,202 L 310,238 L 282,238 Z"
          fill="#075985"
          stroke="#38bdf8"
          strokeWidth="2"
        />
        <line x1="316" y1="202" x2="316" y2="292" stroke="#0284c7" strokeWidth="2" /> {/* Door seam */}
        <circle cx="312" cy="254" r="2.5" fill="#facc15" /> {/* Door handle */}

        {/* Chrome Front Heavy Bumper */}
        <rect
          x="356"
          y="288"
          width="36"
          height="16"
          rx="3"
          fill="#e2e8f0"
          stroke="#475569"
          strokeWidth="2"
        />
        {/* Number Plate on Bumper */}
        <rect x="364" y="292" width="18" height="7" fill="#fbbf24" stroke="#000000" strokeWidth="1" rx="1" />
        <text
          x="373"
          y="297.5"
          fill="#000000"
          fontSize="4.5"
          fontWeight="900"
          fontFamily="monospace"
          textAnchor="middle"
        >
          OD-15
        </text>

        {/* Headlights (Bright Yellow / White with chrome ring) */}
        <circle cx="363" cy="275" r="5" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="377" cy="276" r="5" fill="#fef08a" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="363" cy="275" r="2.5" fill="#ffffff" />
        <circle cx="377" cy="276" r="2.5" fill="#ffffff" />

        {/* Left Side Rear-View Mirror */}
        <line x1="358" y1="210" x2="372" y2="206" stroke="#000000" strokeWidth="2.5" />
        <rect x="370" y="200" width="4.5" height="14" rx="2" fill="#000000" />

        {/* Mudflaps & Wheel Arches */}
        <path d="M 124,286 A 24,24 0 0,1 172,286" fill="none" stroke="#000000" strokeWidth="5" />
        <path d="M 174,286 A 24,24 0 0,1 222,286" fill="none" stroke="#000000" strokeWidth="5" />
        <path d="M 324,290 A 26,26 0 0,1 376,290" fill="none" stroke="#000000" strokeWidth="5" />

        {/* WHEELS (Heavy Duty Truck Tyres) */}
        {/* Rear Tandem Axle 1 */}
        <g>
          <circle cx="148" cy="308" r="23" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <circle cx="148" cy="308" r="14" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <circle cx="148" cy="308" r="6" fill="#1e293b" />
          <circle cx="148" cy="308" r="2" fill="#f8fafc" />
          {/* Wheel Lug Nuts */}
          <circle cx="143" cy="304" r="1.2" fill="#000000" />
          <circle cx="153" cy="304" r="1.2" fill="#000000" />
          <circle cx="143" cy="312" r="1.2" fill="#000000" />
          <circle cx="153" cy="312" r="1.2" fill="#000000" />
        </g>

        {/* Rear Tandem Axle 2 */}
        <g>
          <circle cx="198" cy="308" r="23" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
          <circle cx="198" cy="308" r="14" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
          <circle cx="198" cy="308" r="6" fill="#1e293b" />
          <circle cx="198" cy="308" r="2" fill="#f8fafc" />
          {/* Wheel Lug Nuts */}
          <circle cx="193" cy="304" r="1.2" fill="#000000" />
          <circle cx="203" cy="304" r="1.2" fill="#000000" />
          <circle cx="193" cy="312" r="1.2" fill="#000000" />
          <circle cx="203" cy="312" r="1.2" fill="#000000" />
        </g>

        {/* Front Steer Axle */}
        <g>
          <circle cx="348" cy="310" r="24" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
          <circle cx="348" cy="310" r="15" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
          <circle cx="348" cy="310" r="6.5" fill="#1e293b" />
          <circle cx="348" cy="310" r="2.5" fill="#f8fafc" />
          {/* Front Hub Lug Nuts */}
          <circle cx="342" cy="305" r="1.3" fill="#000000" />
          <circle cx="354" cy="305" r="1.3" fill="#000000" />
          <circle cx="342" cy="315" r="1.3" fill="#000000" />
          <circle cx="354" cy="315" r="1.3" fill="#000000" />
        </g>
      </g>
    </svg>
  );
};
