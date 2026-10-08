import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import { useSponsor } from '../../context/SponsorContext.js';

interface StoaSponsorBannerProps {
  className?: string;
  showFooter?: boolean;
}

export const StoaSponsorBanner: React.FC<StoaSponsorBannerProps> = ({
  className = '',
  showFooter = true,
}) => {
  const { config } = useSponsor();

  // If Admin has disabled / removed the sponsor banner, do not render anything!
  if (!config.isEnabled) {
    return null;
  }

  return (
    <div className={`w-full max-w-full box-border my-2.5 space-y-1.5 select-none ${className}`}>
      {/* ==================================================
          PREMIUM COMPACT ADVERTISEMENT STRIP (80–95px HEIGHT)
          [ 🚛 | 15-टू-15 आवर्तन प्रणाली | Sponsors: Aaditya Ratan Group | LOGO ]
          ================================================== */}
      <div
        className="w-full max-w-full box-border rounded-2xl relative overflow-hidden text-white shadow-lg transition-all duration-300"
        style={{
          height: '88px',
          background: 'linear-gradient(90deg, #060B1A 0%, #0D1938 35%, #101F44 65%, #060B1A 100%)',
          border: '1.2px solid rgba(245, 158, 11, 0.45)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 235, 150, 0.25)',
        }}
      >
        {/* Animated Golden Light Sweep Beam across the strip */}
        {config.animationEnabled && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="w-1/4 h-full bg-gradient-to-r from-transparent via-amber-300/20 to-transparent -skew-x-25 animate-gold-sweep" />
          </div>
        )}

        {/* Ambient subtle sparkle */}
        {config.animationEnabled && (
          <div className="absolute top-1.5 right-20 text-yellow-300/70 animate-particle-2 pointer-events-none">
            <Sparkles className="w-2.5 h-2.5" />
          </div>
        )}

        {/* Inner Content Strip: 4 Balanced Horizontal Columns */}
        <div className="relative z-10 w-full h-full flex items-center justify-between px-2 sm:px-3 py-1 gap-1.5 sm:gap-2">
          {/* ==================================================
              COL 1: 🚛 INDIAN HEAVY TRANSPORT TRUCK GRAPHIC
              ================================================== */}
          {config.truckGraphicEnabled && (
            <>
              <div className="shrink-0 flex items-center justify-center w-[46px] sm:w-[54px] h-[72px]">
                <svg
                  viewBox="0 0 72 70"
                  className="w-full h-auto drop-shadow-sm select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="stripCabGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E50046" />
                      <stop offset="65%" stopColor="#A80033" />
                      <stop offset="100%" stopColor="#550019" />
                    </linearGradient>
                    <linearGradient id="stripBeam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  {/* Road Ground Shadow */}
                  <ellipse cx="36" cy="66" rx="32" ry="3" fill="#020617" opacity="0.6" />

                  {/* Container silhouette */}
                  <rect x="8" y="10" width="56" height="40" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="0.8" />
                  <line x1="22" y1="10" x2="22" y2="35" stroke="#475569" strokeWidth="0.8" opacity="0.5" />
                  <line x1="50" y1="10" x2="50" y2="35" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

                  {/* Cabin Body */}
                  <path
                    d="M14 62 L14 30 L22 16 L50 16 L58 30 L58 62 Z"
                    fill="url(#stripCabGrad)"
                    stroke="#E50046"
                    strokeWidth="1"
                  />

                  {/* Sun Visor with STOA logo plate */}
                  <path d="M12 18 L36 14 L60 18 L56 22 L16 22 Z" fill="#F59E0B" />
                  <text x="36" y="20" fill="#0A1128" fontSize="3.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
                    STOA
                  </text>

                  {/* Windshield */}
                  <path
                    d="M18 24 L24 17 L48 17 L54 24 L52 35 L20 35 Z"
                    fill="#93C5FD"
                    fillOpacity="0.6"
                    stroke="#60A5FA"
                    strokeWidth="0.6"
                  />
                  <path d="M25 18 L35 18 L28 34 L21 34 Z" fill="#FFFFFF" fillOpacity="0.35" />

                  {/* Chrome Grille */}
                  <rect x="23" y="39" width="26" height="18" rx="1.5" fill="#E2E8F0" stroke="#475569" strokeWidth="0.6" />
                  <line x1="25" y1="43" x2="47" y2="43" stroke="#1E293B" strokeWidth="0.8" />
                  <line x1="25" y1="47" x2="47" y2="47" stroke="#1E293B" strokeWidth="0.8" />
                  <line x1="25" y1="51" x2="47" y2="51" stroke="#1E293B" strokeWidth="0.8" />

                  {/* Chrome Front Bumper */}
                  <rect x="11" y="58" width="50" height="7" rx="1.5" fill="#CBD5E1" stroke="#64748B" strokeWidth="0.6" />

                  {/* Number Plate */}
                  <rect x="28" y="59.5" width="16" height="4.2" rx="0.8" fill="#FFD000" stroke="#000000" strokeWidth="0.4" />
                  <text x="36" y="63" fill="#000000" fontSize="3" fontWeight="900" fontFamily="monospace" textAnchor="middle">
                    OD 15
                  </text>

                  {/* Glowing Headlights with Beams */}
                  <rect
                    x="13"
                    y="59"
                    width="5"
                    height="4.5"
                    rx="1"
                    fill="#FEF08A"
                    className={config.animationEnabled ? 'animate-headlight' : ''}
                  />
                  <polygon
                    points="13,59 5,68 13,68"
                    fill="url(#stripBeam)"
                    className={config.animationEnabled ? 'animate-headlight' : ''}
                  />

                  <rect
                    x="54"
                    y="59"
                    width="5"
                    height="4.5"
                    rx="1"
                    fill="#FEF08A"
                    className={config.animationEnabled ? 'animate-headlight' : ''}
                  />
                  <polygon
                    points="54,59 59,68 67,68"
                    fill="url(#stripBeam)"
                    className={config.animationEnabled ? 'animate-headlight' : ''}
                  />

                  {/* Wheels */}
                  <rect x="12" y="63" width="6" height="5" rx="1.5" fill="#020617" />
                  <rect x="54" y="63" width="6" height="5" rx="1.5" fill="#020617" />
                </svg>
              </div>

              {/* Thin Gold Divider */}
              <div className="w-px h-11 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent shrink-0" />
            </>
          )}

          {/* ==================================================
              COL 2: 15-टू-15 आवर्तन प्रणाली & STOA
              ================================================== */}
          <div className="flex flex-col justify-center min-w-0 shrink-0 max-w-[105px] sm:max-w-[125px]">
            {/* Gold Ribbon Pill */}
            <div
              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full overflow-hidden shadow-xs shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #FDE68A 50%, #D97706 100%)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            >
              <Award className="w-2.5 h-2.5 text-[#0A1128] shrink-0" />
              <span className="text-[9px] sm:text-[10px] font-black text-[#0A1128] tracking-tight leading-none whitespace-nowrap uppercase font-display truncate">
                {config.systemTitle}
              </span>
            </div>

            {/* Association Subtitle */}
            <span className="text-[9.5px] sm:text-[10.5px] font-official font-bold text-amber-200 tracking-tight leading-tight truncate mt-1">
              {config.associationTitle}
            </span>
            <span className="text-[8px] sm:text-[8.5px] text-slate-300 font-mono leading-none truncate">
              {config.subtitle}
            </span>
          </div>

          {/* Thin Gold Divider */}
          <div className="w-px h-11 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent shrink-0" />

          {/* ==================================================
              COL 3: SPONSORS: AADITYA RATAN GROUP
              ================================================== */}
          <div className="flex-1 min-w-0 flex flex-col justify-center text-left pl-0.5 sm:pl-1">
            <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-wider text-amber-300/80 uppercase leading-none">
              {config.sponsorLabel}
            </span>

            {/* Main Sponsor Name Focal Point */}
            <div className={`mt-0.5 min-w-0 ${config.animationEnabled ? 'animate-gold-glow' : ''}`}>
              <h3
                className="text-[12px] sm:text-[13.5px] font-black tracking-tight uppercase font-display leading-tight truncate"
                style={{
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF08A 35%, #F59E0B 80%, #D97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 1px 6px rgba(245, 158, 11, 0.3)',
                }}
              >
                {config.sponsorName}
              </h3>
            </div>

            {/* Sub-text: Contact Person */}
            <p
              className="text-[9px] sm:text-[10px] font-semibold text-[#FEF3C7] tracking-wider leading-none mt-0.5 truncate"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            >
              {config.contactPerson}
            </p>
          </div>

          {/* ==================================================
              COL 4: AADITYA RATAN GROUP LOGO / CUSTOM PHOTO BADGE
              ================================================== */}
          <div className="shrink-0 flex items-center justify-center pl-0.5">
            <div
              className="bg-white/95 rounded-xl px-1.5 py-1 shadow-sm border border-slate-200/80 flex items-center justify-center h-[62px] sm:h-[66px] w-[70px] sm:w-[80px] overflow-hidden"
              title={config.sponsorName}
            >
              {config.logoType === 'custom' && config.customLogoUrl ? (
                /* Custom Uploaded Logo Photo */
                <img
                  src={config.customLogoUrl}
                  alt={config.sponsorName}
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Original Aaditya Ratan Group Vector Logo */
                <svg
                  viewBox="0 0 160 120"
                  className="w-full h-auto select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* TOP WORDMARK: AADITYA */}
                  <g id="AadityaRedWordmark">
                    <path d="M12 28 L24 4 L36 28 L28 28 L24 16 L20 28 Z M24 12 L22 17 L26 17 Z" fill="#D91424" />
                    <path d="M38 28 L50 4 L62 28 L54 28 L50 16 L46 28 Z M50 12 L48 17 L52 17 Z" fill="#D91424" />
                    <path d="M66 4 L76 4 C83 4 87 8 87 16 C87 24 83 28 76 28 L66 28 Z M72 10 L72 22 L76 22 C79 22 81 20 81 16 C81 12 79 10 76 10 Z" fill="#D91424" />
                    <rect x="91" y="4" width="6" height="24" fill="#D91424" />
                    <path d="M101 4 L117 4 L117 10 L112 10 L112 28 L106 28 L106 10 L101 10 Z" fill="#D91424" />
                    <path d="M120 4 L127 16 L127 28 L133 28 L133 16 L140 4 L133 4 L130 11 L127 4 Z" fill="#D91424" />
                    <path d="M142 28 L154 4 L166 28 L158 28 L154 16 L150 28 Z M154 12 L152 17 L156 17 Z" fill="#D91424" />
                  </g>

                  {/* SUBTITLE: RATAN GROUP */}
                  <text
                    x="88"
                    y="40"
                    fill="#0F172A"
                    fontSize="12.5"
                    fontWeight="900"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    letterSpacing="1.8"
                    textAnchor="middle"
                  >
                    RATAN GROUP
                  </text>

                  {/* LOGISTICS CIRCULAR EMBLEM */}
                  <g id="LogisticsEmblem" transform="translate(42, 45)">
                    <circle cx="38" cy="28" r="22" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
                    <circle cx="38" cy="28" r="19" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 2" />

                    <rect x="23" y="24" width="16" height="11" rx="1.5" fill="#E2E8F0" stroke="#334155" strokeWidth="0.8" />
                    <rect x="21" y="27" width="5" height="8" rx="1" fill="#10B981" />
                    <circle cx="25" cy="35" r="2" fill="#0F172A" />
                    <circle cx="35" cy="35" r="2" fill="#0F172A" />

                    <path d="M38 31 L54 31 L51 35 L38 35 Z" fill="#1E3A8A" />
                    <rect x="42" y="24" width="8" height="7" fill="#3B82F6" />
                    <line x1="46" y1="21" x2="46" y2="24" stroke="#D91424" strokeWidth="1.5" />

                    <path d="M20 37 Q29 35 38 37 Q47 39 56 37" stroke="#0284C7" strokeWidth="1.5" fill="none" />
                  </g>

                  {/* LOGISTICS LABEL */}
                  <text
                    x="80"
                    y="105"
                    fill="#D91424"
                    fontSize="7.5"
                    fontWeight="900"
                    fontFamily="sans-serif"
                    letterSpacing="0.8"
                    textAnchor="middle"
                  >
                    AADITYA RATAN <tspan fill="#059669">LOGISTICS</tspan>
                  </text>

                  {/* Tagline */}
                  <text
                    x="80"
                    y="115"
                    fill="#64748B"
                    fontSize="5"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    letterSpacing="0.8"
                    textAnchor="middle"
                  >
                    COMMITMENT • EXCELLENCE
                  </text>
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          MINIMAL FOOTER (Clean 1-line)
          ================================================== */}
      {showFooter && (
        <footer className="w-full text-center py-1 select-none">
          <p className="text-[11px] font-bold text-slate-700 tracking-wide font-display">
            {config.footerText}
          </p>
        </footer>
      )}
    </div>
  );
};
