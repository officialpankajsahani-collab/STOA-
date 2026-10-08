import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'hero' | 'floating' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header', className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t, language } = useLanguageTheme();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running standalone, show a small verified badge or null in header
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            {language === 'en'
              ? 'App installed on your device (Standalone Mode)'
              : language === 'or'
              ? 'ଆପଣଙ୍କ ଡିଭାଇସରେ ଆପ୍ ଇନଷ୍ଟଲ୍ ହୋଇଛି'
              : 'आपके डिवाइस पर ऐप पहले से इंस्टॉल है'}
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* 1. Header Variant */}
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-700/20 cursor-pointer transition-all hover:scale-102 active:scale-98 ${className}`}
          title={t('installApp', 'ऐप इंस्टॉल करें')}
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('installApp', 'ऐप इंस्टॉल करें')}</span>
          <span className="sm:hidden">{t('install', 'इंस्टॉल')}</span>
        </button>
      )}

      {/* 2. Hero Banner Variant */}
      {variant === 'hero' && (
        <div className={`w-full max-w-full box-border p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl shadow-lg border border-blue-900/50 flex flex-col gap-3 ${className}`}>
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs sm:text-sm font-black tracking-tight text-white font-display">
                  STOA NEXTGEN {language === 'en' ? 'Mobile App' : 'मोबाइल ऐप'}
                </span>
                <span className="text-[9px] bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                  PWA / APK
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                {language === 'en'
                  ? 'Install directly on your phone home screen for offline access and instant notifications.'
                  : language === 'or'
                  ? 'ତୁରନ୍ତ ସୂଚନା ଏବଂ ଅଫଲାଇନ୍ ବ୍ୟବହାର ପାଇଁ ଆପଣଙ୍କ ଫୋନରେ ଇନଷ୍ଟଲ୍ କରନ୍ତୁ।'
                  : 'बिना प्ले स्टोर के सीधे अपने मोबाइल की होम स्क्रीन पर इंस्टॉल करें।'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full pt-1 border-t border-white/10 sm:border-t-0 sm:pt-0">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="flex-1 px-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isInstallable ? 'अभी इंस्टॉल करें (Install)' : 'इंस्टॉल करने का तरीका'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs cursor-pointer transition-colors shrink-0"
              title="मदद"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Card Variant (in Profile / Settings) */}
      {variant === 'card' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full p-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-3xl text-left transition-all flex items-center justify-between shadow-xs cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 block">
                {language === 'en' ? 'Install STOA App on Mobile' : 'STOA मोबाइल ऐप इंस्टॉल करें'}
              </span>
              <span className="text-xs text-slate-500 block">
                {language === 'en' ? 'Add to Home Screen as a native app' : 'होम स्क्रीन पर जोड़ें और बिना रुकावट चलाएं'}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </button>
      )}

      {/* Interactive Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">STOA NEXTGEN ऐप इंस्टॉल करें</h3>
                  <p className="text-[11px] text-slate-300">Android एवं iPhone दोनों पर समर्थित</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
              {/* Android Instructions */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Android फोन में Chrome से इंस्टॉल कैसे करें:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>
                    अपने Android फोन में Google Chrome ब्राउज़र में यह लिंक खोलें।
                  </li>
                  <li>
                    ऊपर दायें कोने में बने <strong>तीन बिंदुओं (⋮ Menu)</strong> पर टैप करें।
                  </li>
                  <li>
                    मेन्यू में <strong>&quot;ऐप इंस्टॉल करें (Install app)&quot;</strong> या <strong>&quot;होम स्क्रीन पर जोड़ें (Add to Home screen)&quot;</strong> चुनें।
                  </li>
                  <li>
                    <strong>&quot;इंस्टॉल करें&quot;</strong> पर टैप करें। ऐप तुरंत आपके फोन के होम स्क्रीन पर अन्य ऐप्स की तरह इंस्टॉल हो जाएगा।
                  </li>
                </ol>
              </div>

              {/* iOS Instructions */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>iPhone / iPad (Safari) में कैसे इंस्टॉल करें:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                  <li>Safari ब्राउज़र में नीचे दिए गए <strong>Share बटन (चौकोर तीर)</strong> पर टैप करें।</li>
                  <li>नीचे स्क्रॉल करें और <strong>&quot;Add to Home Screen&quot; (होम स्क्रीन पर जोड़ें)</strong> पर टैप करें।</li>
                  <li>ऊपर दाईं ओर <strong>&quot;Add&quot;</strong> पर टैप करें।</li>
                </ol>
              </div>

              {/* Native APK Option */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>अगर आपको Android APK फाइल चाहिए:</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  इस प्रोजेक्ट में पूर्ण <strong>Jetpack Compose Kotlin कोड</strong> (फाइल: <code className="bg-blue-100 px-1 py-0.5 rounded text-[10px]">/android/StoaNextGenCompose.kt</code>) और PWA TWA विन्यास शामिल है। इसे Android Studio में खोलकर 1-क्लिक में <strong>.apk</strong> फाइल बनाई जा सकती है।
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                समझ गया (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
