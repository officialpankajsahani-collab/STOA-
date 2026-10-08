import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageThemeProvider, useLanguageTheme } from './context/LanguageThemeContext.js';
import { ConfigProvider } from './context/ConfigContext.js';
import { LogoProvider } from './context/LogoContext.js';
import { SponsorProvider } from './context/SponsorContext.js';
import { ElectionProvider } from './context/ElectionContext.js';
import { ElectionCelebrationModal } from './components/common/ElectionCelebrationModal.js';
import { AssociationLogo } from './components/common/AssociationLogo.js';
import { AuthScreen } from './components/auth/AuthScreen.js';
import { OwnerApp } from './components/owner/OwnerApp.js';
import { AdminApp } from './components/admin/AdminApp.js';
import { StoaAIFloating } from './components/ai/StoaAIFloating.js';
import { LanguageSwitcher } from './components/common/LanguageSwitcher.js';
import { PWAInstallButton } from './components/common/PWAInstallButton.js';
import { OfflineIndicator } from './components/common/OfflineIndicator.js';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

const MainContainer: React.FC = () => {
  const { user, role, isLoading } = useAuth();
  const { deviceMode, setDeviceMode, t } = useLanguageTheme();
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="mb-4">
          <AssociationLogo size={72} showRing />
        </div>
        <p className="text-slate-900 text-lg font-black tracking-wider font-display">STOA NEXTGEN</p>
        <p className="text-rose-700 text-xs font-official font-semibold mt-1 tracking-wide">{t('appSubtitle', 'संबलपुर ट्रक ओनर्स एसोसिएशन')}</p>
        <div className="w-28 h-1.5 bg-slate-200 rounded-full mt-4 overflow-hidden border border-slate-300">
          <div className="w-1/2 h-full bg-gradient-to-r from-rose-600 to-pink-600 rounded-full animate-[shimmer_1.5s_infinite]" />
        </div>
      </div>
    );
  }

  // Not logged in -> Show Authentication
  if (!user || !role) {
    return (
      <>
        <AuthScreen />
        <StoaAIFloating isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        {/* Floating AI Button on Login screen: Circular Pink/Magenta button with ✨+ */}
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-5 sm:bottom-7 sm:right-6 z-40 w-14 h-14 bg-gradient-to-tr from-[#E50046] to-[#C2003B] hover:from-[#d0003f] hover:to-[#a80033] text-white rounded-full shadow-xl shadow-[#E50046]/35 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all ring-3 ring-white"
          title="STOA AI Assistant"
          aria-label="STOA AI Assistant"
        >
          <div className="flex items-center text-white">
            <Sparkles className="w-5 h-5 fill-white" />
            <span className="text-base font-black -ml-0.5 -mt-1 leading-none">+</span>
          </div>
        </button>
      </>
    );
  }

  // Logged in: Render Owner or Admin view
  const isOwner = role === 'OWNER';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center">
      {/* Top Device Bar */}
      <div className="w-full bg-white/95 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-rose-700 font-bold tracking-wide">
            {isOwner ? t('ownerApp', '📱 वाहन मालिक पोर्टल') : t('adminControlRoom', '🛡️ प्रशासनिक नियंत्रण कक्ष')}
          </span>
          <span className="text-slate-300 hidden sm:inline">&middot;</span>
          <span className="text-slate-700 hidden sm:inline text-[11px] font-semibold">
            {user.role === 'OWNER' ? (user as any).ownerName : (user as any).name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Language Selector (हिन्दी | English | ଓଡ଼ିଆ) */}
          <LanguageSwitcher variant="compact" />

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setDeviceMode('mobile')}
              title={t('mobileFrame', 'मोबाइल फ्रेम')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                deviceMode === 'mobile'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden sm:inline">{t('mobileFrame', 'मोबाइल फ्रेम')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode('responsive')}
              title={t('fullScreen', 'पूर्ण स्क्रीन')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all ${
                deviceMode === 'responsive'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3 h-3" />
              <span className="hidden sm:inline">{t('fullScreen', 'पूर्ण स्क्रीन')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* App Body Container */}
      <div className="w-full flex-1 flex justify-center items-start">
        {deviceMode === 'mobile' ? (
          // Android Phone Frame Container
          <div className="my-3 sm:my-6 w-full max-w-[430px] min-h-[850px] bg-white border-[8px] border-slate-300 rounded-[44px] shadow-2xl shadow-slate-300/70 overflow-hidden relative flex flex-col ring-1 ring-slate-200">
            {/* Phone Notch / Dynamic Island */}
            <div className="w-full bg-white pt-2.5 pb-1.5 px-6 flex justify-between items-center text-[10px] text-slate-600 font-mono z-40 select-none border-b border-slate-200">
              <span className="font-semibold">9:41</span>
              <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto" />
              <span className="font-semibold">5G &middot; 100%</span>
            </div>

            {/* Inner App Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {isOwner ? <OwnerApp onOpenAi={() => setIsAiOpen(true)} /> : <AdminApp onOpenAi={() => setIsAiOpen(true)} />}
            </div>

            {/* Bottom Android Gesture Bar */}
            <div className="w-full bg-white py-2 flex justify-center z-40 border-t border-slate-100">
              <div className="w-28 h-1 bg-slate-400 rounded-full" />
            </div>
          </div>
        ) : (
          // Full Screen Responsive View
          <div className="w-full min-h-screen bg-slate-50">
            {isOwner ? <OwnerApp onOpenAi={() => setIsAiOpen(true)} /> : <AdminApp onOpenAi={() => setIsAiOpen(true)} />}
          </div>
        )}
      </div>

      {/* Floating AI Assistant Launcher Button - Positioned at bottom: 78px, right: 16px above bottom nav */}
      <button
        type="button"
        onClick={() => setIsAiOpen(true)}
        style={{
          right: '16px',
          bottom: 'max(78px, calc(72px + env(safe-area-inset-bottom)))',
        }}
        className="fixed z-40 w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-[#E50046] to-[#C2003B] hover:from-[#d0003f] hover:to-[#a80033] text-white rounded-full shadow-xl shadow-[#E50046]/35 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all ring-3 ring-white"
        title="STOA AI Assistant"
        aria-label="STOA AI Assistant"
      >
        <div className="flex items-center text-white">
          <Sparkles className="w-5 h-5 fill-white" />
          <span className="text-base font-black -ml-0.5 -mt-1 leading-none">+</span>
        </div>
      </button>

      {/* AI Assistant Sheet/Modal */}
      <StoaAIFloating isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* STOA Biennial Election Winner Celebration Modal Popup */}
      <ElectionCelebrationModal />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <LanguageThemeProvider>
      <ConfigProvider>
        <LogoProvider>
          <SponsorProvider>
            <ElectionProvider>
              <AuthProvider>
                <MainContainer />
              </AuthProvider>
            </ElectionProvider>
          </SponsorProvider>
        </LogoProvider>
      </ConfigProvider>
    </LanguageThemeProvider>
  );
}
