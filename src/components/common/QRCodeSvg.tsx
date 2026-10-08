import React from 'react';

// Lightweight pseudo-random deterministic 21x21 QR-like matrix generator
// for offline SVG rendering of Gate Pass tokens
export const QRCodeSvg: React.FC<{ value: string; size?: number; className?: string }> = ({
  value,
  size = 140,
  className = '',
}) => {
  const matrixSize = 25;

  // Simple string hash to determine module pattern
  const hashString = (str: string, seed: number) => {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const isPositionPattern = (r: number, c: number) => {
    // Top-left finder
    if (r < 7 && c < 7) {
      if (r === 0 || r === 6 || c === 0 || c === 6) return true;
      if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Top-right finder
    if (r < 7 && c >= matrixSize - 7) {
      const oc = c - (matrixSize - 7);
      if (r === 0 || r === 6 || oc === 0 || oc === 6) return true;
      if (r >= 2 && r <= 4 && oc >= 2 && oc <= 4) return true;
      return false;
    }
    // Bottom-left finder
    if (r >= matrixSize - 7 && c < 7) {
      const or = r - (matrixSize - 7);
      if (or === 0 || or === 6 || c === 0 || c === 6) return true;
      if (or >= 2 && or <= 4 && c >= 2 && c <= 4) return true;
      return false;
    }
    // Timing patterns
    if (r === 6 || c === 6) return (r + c) % 2 === 0;
    return null;
  };

  const rects: React.ReactNode[] = [];
  const cellSize = size / matrixSize;

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const pos = isPositionPattern(r, c);
      let filled = false;
      if (pos !== null) {
        filled = pos;
      } else {
        const h = hashString(value, r * 37 + c * 17);
        filled = h % 3 === 0 || (r + c) % 5 === 0;
      }

      if (filled) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize * 0.96}
            height={cellSize * 0.96}
            rx={cellSize * 0.15}
            fill="currentColor"
          />
        );
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`text-stone-900 dark:text-stone-100 ${className}`}
      aria-label={`QR Code for ${value}`}
    >
      <rect width={size} height={size} fill="white" rx={8} />
      <g className="text-stone-900">{rects}</g>
    </svg>
  );
};
