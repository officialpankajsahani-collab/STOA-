import React, { useState, useEffect } from 'react';
import { useElection } from '../../context/ElectionContext.js';
import { AssociationLogo } from './AssociationLogo.js';
import {
  Trophy,
  Award,
  Sparkles,
  PartyPopper,
  X,
  Share2,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface ElectionCelebrationModalProps {
  onViewResults?: () => void;
}

export const ElectionCelebrationModal: React.FC<ElectionCelebrationModalProps> = ({
  onViewResults,
}) => {
  const { election } = useElection();
  const { celebration } = election;

  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if expired
  const isExpired = celebration.expiresAt
    ? new Date().getTime() > new Date(celebration.expiresAt).getTime()
    : false;

  const shouldShow = celebration.isActive && !isExpired && !isDismissed;

  if (!shouldShow) {
    return null;
  }

  const handleShare = () => {
    const text = `🏆 *संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2026-2028 परिणाम*\n\nविजयी पैनल: *${celebration.winningPanel}*\nपदाधिकारी: *${celebration.chiefWinnerName}*\n\n${celebration.winnerMessage}\n\nSTOA NextGen आधिकारिक पोर्टल: Sambalpur, Odisha`;
    if (navigator.share) {
      navigator.share({
        title: 'STOA Election Winner Announcement',
        text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      {/* Celebration Container */}
      <div
        className="w-full max-w-lg bg-gradient-to-b from-[#0B132B] via-[#101D42] to-[#070D1E] border-2 border-amber-400/80 rounded-3xl sm:rounded-[32px] overflow-hidden text-white shadow-2xl relative"
        style={{
          boxShadow: '0 0 50px rgba(245, 158, 11, 0.35), inset 0 1px 0 rgba(255, 235, 150, 0.4)',
        }}
      >
        {/* Animated Light Sweep Beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-300/20 to-transparent -skew-x-25 animate-gold-sweep" />
        </div>

        {/* Ambient floating celebration sparkles */}
        <div className="absolute top-4 left-6 text-amber-300 animate-particle-1 pointer-events-none text-xl">
          ✨
        </div>
        <div className="absolute top-10 right-8 text-yellow-300 animate-particle-2 pointer-events-none text-xl">
          🎉
        </div>
        <div className="absolute bottom-16 left-8 text-amber-400 animate-particle-3 pointer-events-none text-lg">
          🎊
        </div>
        <div className="absolute bottom-20 right-6 text-yellow-200 animate-particle-1 pointer-events-none text-xl">
          🌟
        </div>

        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Ribbon / Laurel Motif */}
        <div className="relative z-10 pt-5 sm:pt-6 px-4 sm:px-6 text-center">
          {/* Association Emblem with Gold Laurel Ring */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-500/40 via-yellow-300/60 to-amber-600/40 blur-xs animate-pulse" />
            <div className="relative p-1 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full shadow-lg">
              <AssociationLogo size={56} showRing={false} />
            </div>
          </div>

          {/* Official Tagline */}
          <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
            ★ संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) ★
          </p>

          {/* Election Banner Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 text-slate-950 font-black text-xs sm:text-sm my-2 shadow-md uppercase tracking-wider font-display">
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>द्विवार्षिक चुनाव 2026–2028 : विजय उद्घोष</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white mt-1 drop-shadow-md">
            हार्दिक बधाई एवं स्वागत! 💐
          </h3>
        </div>

        {/* Victory Card Centerpiece */}
        <div className="relative z-10 mx-4 sm:mx-6 my-3 p-4 sm:p-5 rounded-2xl bg-white/10 border border-amber-400/40 backdrop-blur-md text-center space-y-2.5 shadow-inner">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300/90 block">
            🏆 विजयी दल / पैनल
          </span>

          {/* Winning Panel Name */}
          <div className="animate-gold-glow">
            <h4
              className="text-2xl sm:text-3xl font-black font-display tracking-tight uppercase"
              style={{
                background: 'linear-gradient(180deg, #FFFFFF 0%, #FEF08A 40%, #F59E0B 80%, #D97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 12px rgba(245, 158, 11, 0.4)',
              }}
            >
              {celebration.winningPanel}
            </h4>
          </div>

          {/* Key Leader / Winner Names */}
          <div className="py-1 px-3 bg-amber-500/20 rounded-xl border border-amber-400/30 inline-block">
            <p className="text-xs sm:text-sm font-bold text-amber-200">
              {celebration.chiefWinnerName}
            </p>
          </div>

          {/* Congratulatory Message */}
          <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed px-1">
            "{celebration.winnerMessage}"
          </p>

          <p className="text-[11px] text-amber-200/80 font-mono italic">
            {celebration.winnerSubMessage}
          </p>

          {/* Verification Badge */}
          <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{celebration.declaredBy} द्वारा प्रमाणित</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative z-10 p-4 sm:p-5 bg-black/40 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? '✓ कॉपी हुआ!' : 'बधाई संदेश साझा करें (Share)'}</span>
          </button>

          {onViewResults && (
            <button
              type="button"
              onClick={() => {
                setIsDismissed(true);
                onViewResults();
              }}
              className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all hover:scale-[1.02]"
            >
              <span>पूर्ण परिणाम देखें</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
