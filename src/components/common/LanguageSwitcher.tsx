import React from 'react';
import { useLanguageTheme, Language } from '../../context/LanguageThemeContext.js';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pills' | 'compact' | 'header';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'pills',
}) => {
  const { language, setLanguage } = useLanguageTheme();

  const languages: { code: Language; label: string; sub: string }[] = [
    { code: 'hi', label: 'हिन्दी', sub: 'Hindi' },
    { code: 'en', label: 'English', sub: 'Eng' },
    { code: 'or', label: 'ଓଡ଼ିଆ', sub: 'Odia' },
  ];

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs shadow-2xs ${className}`}>
        <Globe className="w-3.5 h-3.5 text-slate-500 ml-1.5 shrink-0" />
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
              title={`${l.label} (${l.sub})`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Header variant: Sleek & modern with prominent visual selection
  return (
    <div
      className={`inline-flex items-center bg-slate-100/90 border border-slate-200/90 p-1 rounded-2xl shadow-xs backdrop-blur-xs ${className}`}
      role="group"
      aria-label="Language Selector (भाषा चयन)"
    >
      <div className="flex items-center gap-1">
        {languages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm ring-1 ring-rose-500/30 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              <span>{l.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
