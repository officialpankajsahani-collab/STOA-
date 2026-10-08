import React, { useState } from 'react';
import { useLogo } from '../../context/LogoContext.js';
import { StoaEmblemSvg } from './StoaEmblemSvg.js';

export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;

interface AssociationLogoProps {
  size?: LogoSize;
  className?: string;
  showRing?: boolean;
  alt?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

export const AssociationLogo: React.FC<AssociationLogoProps> = ({
  size = 'md',
  className = '',
  showRing = false,
  alt = "संबलपुर ट्रक ओनर्स एसोसिएशन (STOA)",
}) => {
  const { logoUrl } = useLogo();
  const [imageError, setImageError] = useState(false);

  const numericSize = typeof size === 'number' ? size : SIZE_MAP[size] || 44;

  const ringStyles = showRing
    ? 'ring-2 ring-rose-500/30 shadow-md shadow-rose-900/10'
    : '';

  // If a custom logo is configured and hasn't errored out, render the image
  if (logoUrl && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white ${ringStyles} ${className}`}
        style={{ width: numericSize, height: numericSize }}
      >
        <img
          src={logoUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-contain rounded-full select-none"
        />
      </div>
    );
  }

  // Otherwise, render the authentic, crisp vector SVG emblem
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden ${ringStyles} ${className}`}
      style={{ width: numericSize, height: numericSize }}
    >
      <StoaEmblemSvg size={numericSize} title={alt} />
    </div>
  );
};
