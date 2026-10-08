import React from 'react';
import { useConfig } from '../../context/ConfigContext.js';
import { Radio, AlertTriangle, AlertCircle, Edit2 } from 'lucide-react';

interface LiveBroadcastTickerProps {
  onEditClick?: () => void;
  showEditButton?: boolean;
}

export const LiveBroadcastTicker: React.FC<LiveBroadcastTickerProps> = ({
  onEditClick,
  showEditButton = false,
}) => {
  const { config } = useConfig();
  const ticker = config?.ticker;
  const isEmergency = ticker?.type === 'EMERGENCY';
  const isWarning = ticker?.type === 'WARNING';

  const defaultTickerText = 'संबलपुर ट्रक ओनर्स एसोसिएशन: 15-टू-15 आवर्तन एवं लाइव लोडिंग कतार प्रणाली सक्रिय है।';
  const broadcastText = ticker?.text || defaultTickerText;

  return (
    <aside
      aria-label="Live Association Notice"
      className="w-full py-2.5 px-4 text-xs flex items-center justify-between gap-3 select-none transition-colors z-20 shadow-sm"
      style={{ backgroundColor: '#9E0038', color: '#FFFFFF' }}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Live Pill Badge */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider shrink-0 border border-white/30 backdrop-blur-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <Radio className="w-3 h-3 shrink-0" />
          <span>लाइव प्रसारण</span>
        </span>

        {/* Clear, visible text */}
        <div className="min-w-0 flex-1 flex items-center overflow-hidden">
          <p className="font-bold text-white text-xs sm:text-sm tracking-wide truncate">
            {broadcastText}
          </p>
        </div>
      </div>

      {showEditButton && onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          title="सूचना टिकर संपादित करें"
          className="shrink-0 px-2 py-0.5 bg-black/20 hover:bg-black/40 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer text-white"
        >
          <Edit2 className="w-2.5 h-2.5" />
          <span className="hidden sm:inline">संपादित करें</span>
        </button>
      )}
    </aside>
  );
};

