import React, { useState, useEffect, useRef } from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';

interface VehiclePlateProps {
  number: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
  showHologram?: boolean;
}

export const VehiclePlate: React.FC<VehiclePlateProps> = ({
  number,
  size = 'md',
  className = '',
  showHologram = true,
}) => {
  const { language, t } = useLanguageTheme();
  const plateRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const countryStamp = 'IND';
  const plateTitle = t('commercialPlate', 'व्यावसायिक नंबर प्लेट');

  // Format number cleanly in one straight line (e.g., OD 15 X 7273 or OD 15 AA 1234)
  const formatPlateNumber = (raw: string) => {
    if (!raw) return 'OD 15 X 7273';
    const cleaned = raw.trim().toUpperCase();
    
    // If it already has spaces, normalize them into single spaces
    if (cleaned.includes(' ')) {
      return cleaned.replace(/\s+/g, ' ');
    }

    // If no spaces (e.g. OD15X7273 or OD15AA1234), format into standard Indian RTO format
    const match = cleaned.match(/^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{1,4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
    }

    return cleaned;
  };

  const formattedNumber = formatPlateNumber(number);

  // Dynamic mobile tilt sensor (इधर उधर मोबाइल घुमाने से चमकिला होलोग्राम अलग-अलग रंग में चमकेगा)
  useEffect(() => {
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma is left-to-right tilt [-90 to 90]
        // beta is front-to-back tilt [-180 to 180]
        const posX = Math.min(Math.max(((e.gamma + 35) / 70) * 100, 0), 100);
        const posY = Math.min(Math.max(((e.beta - 20) / 70) * 100, 0), 100);
        setTilt({ x: posX, y: posY });
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
      }
    };
  }, []);

  // Mouse hover tilt for desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!plateRef.current) return;
    const rect = plateRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 50, y: 50 });
  };

  // 1. HERO SIZE: Main prominent card plate (लंबा, सीधा लाइन में, भारत सरकार का चमकीला होलोग्राम + IND)
  if (size === 'hero') {
    return (
      <div
        ref={plateRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`w-fit max-w-full inline-flex items-center select-all group relative overflow-hidden transition-all duration-200 ${className}`}
        title="High Security Registration Plate (HSRP) - Commercial Transport"
      >
        <div
          className="relative inline-flex items-center bg-[#ffd000] border-[2.5px] border-[#0a0a0a] rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 shadow-md"
          style={{
            backgroundColor: '#ffd000',
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1.5px 0 rgba(0, 0, 0, 0.25)',
          }}
        >
          {/* Inner embossed black border running around the HSRP perimeter */}
          <div className="absolute inset-[2.5px] border border-black/80 rounded-[8px] pointer-events-none" />

          {/* Left Silver Rivet Hole */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-inner mr-1.5 sm:mr-2 z-10 shrink-0" />

          {/* HSRP Identification Section (Left side: Hologram + IND) */}
          <div className="flex flex-col items-center justify-center mr-2 sm:mr-3 pr-1.5 sm:pr-2 border-r border-black/60 z-10 shrink-0 select-none">
            {/* Hologram Badge with Chakra & Prismatic Iridescent Refraction */}
            <div
              className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] overflow-hidden border border-slate-700/60 shadow-xs flex items-center justify-center"
              style={{
                background: `linear-gradient(${tilt.x * 3.6}deg, 
                  hsl(${tilt.x * 2.5 + 160}, 90%, 55%) 0%, 
                  hsl(${tilt.y * 2.5 + 280}, 95%, 60%) 35%, 
                  hsl(${tilt.x * 2.5 + 40}, 95%, 55%) 70%, 
                  hsl(${tilt.y * 2.5 + 200}, 90%, 55%) 100%)`,
                boxShadow: 'inset 0 0 2px rgba(255,255,255,0.9), 0 1px 2px rgba(0,0,0,0.3)',
              }}
              title="भारत सरकार का सुरक्षा होलोग्राम (Government of India Security Hologram)"
            >
              {/* Ashoka Chakra SVG Hologram Stamping */}
              <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/90 drop-shadow-xs animate-pulse">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="1.5 1" />
                <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" stroke="currentColor" strokeWidth="0.8" />
              </svg>

              {/* Shimmer light bar across hologram */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent pointer-events-none transition-transform duration-75"
                style={{
                  transform: `translateX(${(tilt.x - 50) * 1.5}%) translateY(${(tilt.y - 50) * 1.5}%)`,
                }}
              />
            </div>

            {/* Country Code Stamped (भारत / IND / ଭାରତ) */}
            <span className="text-[9px] sm:text-[10px] font-black text-[#002277] tracking-wider leading-none mt-0.5 font-sans">
              {countryStamp}
            </span>
          </div>

          {/* Vehicle Number: In ONE Straight Single Line, Elongated, Embossed Black */}
          <div className="z-10 whitespace-nowrap flex items-center overflow-hidden">
            <span
              className="text-[15px] sm:text-2xl font-black text-[#0a0a0a] tracking-[0.08em] sm:tracking-[0.14em] font-mono leading-none select-all truncate"
              style={{
                fontFamily: 'var(--font-mono)',
                textShadow: '0.8px 0.8px 0px rgba(255, 255, 255, 0.7), -0.5px -0.5px 0px rgba(0, 0, 0, 0.35)',
              }}
            >
              {formattedNumber}
            </span>
          </div>

          {/* Right Silver Rivet Hole */}
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-600 shadow-inner ml-2 sm:ml-3 z-10 shrink-0" />

          {/* Subtle metallic reflection streak across the plate */}
          <div
            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none -skew-x-25 transition-transform duration-100"
            style={{
              left: `${tilt.x}%`,
              transform: 'translateX(-50%) skewX(-25deg)',
            }}
          />
        </div>
      </div>
    );
  }

  // 2. LARGE SIZE: Used in modal headers & gate pass inspection
  if (size === 'lg') {
    return (
      <div
        ref={plateRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`w-fit max-w-full inline-flex items-center select-all group relative overflow-hidden ${className}`}
      >
        <div
          className="relative inline-flex items-center bg-[#ffd000] border-2 border-[#0a0a0a] rounded-lg px-2 sm:px-2.5 py-1 shadow-sm"
          style={{
            backgroundColor: '#ffd000',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
          }}
        >
          <div className="absolute inset-[2px] border border-black/75 rounded-[5px] pointer-events-none" />

          {/* Hologram + IND */}
          <div className="flex flex-col items-center justify-center mr-1.5 pr-1.5 border-r border-black/50 z-10 shrink-0 select-none">
            <div
              className="w-3.5 h-3.5 rounded-[3px] overflow-hidden border border-slate-700/50 flex items-center justify-center"
              style={{
                background: `linear-gradient(${tilt.x * 3.6}deg, 
                  hsl(${tilt.x * 2.5 + 160}, 90%, 55%) 0%, 
                  hsl(${tilt.y * 2.5 + 280}, 95%, 60%) 40%, 
                  hsl(${tilt.x * 2.5 + 40}, 95%, 55%) 100%)`,
              }}
            >
              <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white/90">
                <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="text-[8px] font-black text-[#002277] tracking-wider leading-none mt-0.5">
              {countryStamp}
            </span>
          </div>

          {/* Single Straight Line Number */}
          <span
            className="text-base sm:text-lg font-black text-[#0a0a0a] tracking-[0.12em] font-mono leading-none z-10 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-mono)',
              textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.6)',
            }}
          >
            {formattedNumber}
          </span>
        </div>
      </div>
    );
  }

  // 3. SMALL SIZE: Used in tables, lists, audit logs, badges
  if (size === 'sm') {
    return (
      <span
        className={`w-fit max-w-full inline-flex items-center relative bg-[#ffd000] border-[1.5px] border-[#0a0a0a] rounded-[6px] px-1.5 py-0.5 shadow-2xs whitespace-nowrap select-all ${className}`}
        style={{ backgroundColor: '#ffd000' }}
        title={plateTitle}
      >
        <span className="absolute inset-[1px] border border-black/60 rounded-[3px] pointer-events-none" />
        
        {/* Mini Hologram & Country Stamp */}
        {showHologram && (
          <span className="inline-flex items-center gap-0.5 mr-1 pr-1 border-r border-black/40 z-10 shrink-0 select-none">
            <span className="w-2 h-2 rounded-[1.5px] hsrp-hologram-iridescent inline-block" />
            <span className="text-[7px] font-black text-[#002277] leading-none">{countryStamp}</span>
          </span>
        )}

        {/* Single Line Number */}
        <span
          className="text-[11px] font-black text-[#0a0a0a] tracking-wider font-mono leading-none z-10"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {formattedNumber}
        </span>
      </span>
    );
  }

  // 4. MEDIUM (Default)
  return (
    <div
      ref={plateRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`w-fit max-w-full inline-flex items-center select-all group relative overflow-hidden ${className}`}
    >
      <div
        className="relative inline-flex items-center bg-[#ffd000] border-[2px] border-[#0a0a0a] rounded-lg px-2 py-1 shadow-xs whitespace-nowrap"
        style={{
          backgroundColor: '#ffd000',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
        }}
      >
        <div className="absolute inset-[1.5px] border border-black/70 rounded-[5px] pointer-events-none" />

        {/* Hologram + Country Stamp */}
        <div className="flex flex-col items-center justify-center mr-1.5 pr-1 border-r border-black/50 z-10 shrink-0 select-none">
          <div
            className="w-3 h-3 rounded-[2.5px] overflow-hidden border border-slate-700/50 flex items-center justify-center hsrp-hologram-iridescent"
          >
            <svg viewBox="0 0 24 24" className="w-2 h-2 text-white/90">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-[7.5px] font-black text-[#002277] tracking-wider leading-none mt-0.5">
            {countryStamp}
          </span>
        </div>

        {/* Single Straight Line Number */}
        <span
          className="text-xs sm:text-sm font-black text-[#0a0a0a] tracking-[0.12em] font-mono leading-none z-10"
          style={{
            fontFamily: 'var(--font-mono)',
            textShadow: '0.5px 0.5px 0px rgba(255, 255, 255, 0.6)',
          }}
        >
          {formattedNumber}
        </span>
      </div>
    </div>
  );
};
