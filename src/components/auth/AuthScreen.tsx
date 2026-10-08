import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguageTheme, Language } from '../../context/LanguageThemeContext.js';
import { VEHICLE_CATEGORIES, VehicleCategory } from '../../types/index.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import { StoaSponsorBanner } from '../common/StoaSponsorBanner.js';
import { getRtoDisplay } from '../../config/rtoCodes.js';
import {
  Truck,
  ShieldCheck,
  KeyRound,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  UserPlus,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronRight,
  X,
  Phone,
} from 'lucide-react';

// Standardized vehicle number auto-formatter:
// e.g. "OD15X7273" -> "OD 15 X 7273"
export function formatVehicleDisplay(input: string): string {
  if (!input) return '';
  const raw = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (raw.length === 0) return '';
  if (raw.length <= 2) return raw;
  if (raw.length <= 4) return `${raw.slice(0, 2)} ${raw.slice(2)}`;

  const state = raw.slice(0, 2);
  const rto = raw.slice(2, 4);
  const remainder = raw.slice(4);

  const match = remainder.match(/^([A-Z]{1,3})?(\d{1,4})?$/);
  if (match) {
    const series = match[1] || '';
    const num = match[2] || '';
    let result = `${state} ${rto}`;
    if (series) result += ` ${series}`;
    if (num) result += ` ${num}`;
    return result;
  }

  return `${state} ${rto} ${remainder}`.trim();
}

// Indian mobile validation: exactly 10 digits starting with 6, 7, 8, or 9
export function isValidIndianMobile(mobile: string): boolean {
  const clean = mobile.replace(/[^0-9]/g, '');
  return /^[6-9]\d{9}$/.test(clean);
}

export const AuthScreen: React.FC = () => {
  const { loginAsOwner, verifyOwnerOtp, registerOwner, loginAsAdmin } = useAuth();
  const { t, language, setLanguage } = useLanguageTheme();

  const [authTab, setAuthTab] = useState<'OWNER' | 'ADMIN'>('OWNER');

  // Owner Login State (Defaulting to standardized format)
  const [vehicleInput, setVehicleInput] = useState('OD 15 X 7273');
  const [mobileInput, setMobileInput] = useState('9861012345');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Owner Register Modal State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regName, setRegName] = useState('');
  const [regVehicle, setRegVehicle] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regCategory, setRegCategory] = useState<VehicleCategory>('10-Wheel / 16-18 Ton');
  const [regCapacity, setRegCapacity] = useState('18');
  const [regMembership, setRegMembership] = useState('');

  // Admin Login State
  const [adminId, setAdminId] = useState('ADMIN');
  const [adminPin, setAdminPin] = useState('1234');

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ vehicle?: string; mobile?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Languages list for Header
  const languages: { code: Language; label: string }[] = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'en', label: 'English' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
  ];

  // Quick Demo vehicles list
  const demoVehicles = [
    {
      formatted: 'OD 15 X 7273',
      raw: 'OD15X7273',
      mobile: '9861012345',
      owner: language === 'en' ? 'Ramesh Sahu' : language === 'or' ? 'ରମେଶ ସାହୁ' : 'रमेश साहु',
      type: language === 'en' ? '10-Wheel (18T)' : language === 'or' ? '୧୦-ଚକିଆ (୧୮T)' : '10-पहिया (18T)',
    },
    {
      formatted: 'OD 15 A 1122',
      raw: 'OD15A1122',
      mobile: '9437023456',
      owner: language === 'en' ? 'Binod Pradhan' : language === 'or' ? 'ବିନୋଦ ପ୍ରଧାନ' : 'बिनोद प्रधान',
      type: language === 'en' ? '12-Wheel (25T)' : language === 'or' ? '୧୨-ଚକିଆ (୨୫T)' : '12-पहिया (25T)',
    },
    {
      formatted: 'OD 15 B 4455',
      raw: 'OD15B4455',
      mobile: '9861234567',
      owner: language === 'en' ? 'Rajesh Patel' : language === 'or' ? 'ରାଜେଶ ପଟେଲ' : 'राजेश पटेल',
      type: language === 'en' ? '14-Wheel (31T)' : language === 'or' ? '୧୪-ଚକିଆ (୩୧T)' : '14-पहिया (31T)',
    },
    {
      formatted: 'OD 15 C 8899',
      raw: 'OD15C8899',
      mobile: '9437890123',
      owner: language === 'en' ? 'Surendra Ray' : language === 'or' ? 'ସୁରେନ୍ଦ୍ର ରାୟ' : 'सुरेन्द्र राय',
      type: language === 'en' ? '16-Wheel (35T)' : language === 'or' ? '୧୬-ଚକିଆ (୩୫T)' : '16-पहिया (35T)',
    },
  ];

  // Cooldown timer for OTP Resend
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Vehicle input change handler with automatic formatting
  const handleVehicleChange = (val: string) => {
    const formatted = formatVehicleDisplay(val);
    setVehicleInput(formatted);
    if (fieldErrors.vehicle) {
      setFieldErrors((prev) => ({ ...prev, vehicle: undefined }));
    }
  };

  // Mobile input change handler (numbers only, max 10 digits)
  const handleMobileChange = (val: string) => {
    const digitsOnly = val.replace(/[^0-9]/g, '').slice(0, 10);
    setMobileInput(digitsOnly);
    if (fieldErrors.mobile) {
      setFieldErrors((prev) => ({ ...prev, mobile: undefined }));
    }
  };

  // Select demo vehicle
  const handleSelectDemoVehicle = (item: (typeof demoVehicles)[0]) => {
    setVehicleInput(item.formatted);
    setMobileInput(item.mobile);
    setOtpSent(false);
    setErrorMessage(null);
    setFieldErrors({});
  };

  // Submit Owner Login (Request OTP)
  const handleOwnerLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const errors: { vehicle?: string; mobile?: string } = {};

    const cleanVehicle = vehicleInput.replace(/\s+/g, '');
    if (!cleanVehicle || cleanVehicle.length < 6) {
      errors.vehicle = 'कृपया सही वाहन नंबर दर्ज करें';
    }

    if (!isValidIndianMobile(mobileInput)) {
      errors.mobile = 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const res = await loginAsOwner(cleanVehicle, mobileInput);
      if (!res.success) {
        if (res.canRegister) {
          setRegVehicle(vehicleInput);
          setErrorMessage(res.error || 'गाड़ी रिकॉर्ड में नहीं है। कृपया नया पंजीकरण करें।');
        } else {
          setErrorMessage(res.error || 'लॉगिन असफल');
        }
      } else {
        setOtpSent(true);
        setDemoOtpHint(res.demoOtp || '727388');
        setOtpCode(res.demoOtp || '727388');
        setResendCooldown(30);
        setSuccessMessage('OTP भेजा गया! नीचे दिया गया कोड सत्यापित करें।');
      }
    } catch {
      setErrorMessage('OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const cleanVehicle = vehicleInput.replace(/\s+/g, '');
      const res = await loginAsOwner(cleanVehicle, mobileInput);
      if (res.success) {
        setDemoOtpHint(res.demoOtp || '727388');
        setOtpCode(res.demoOtp || '727388');
        setResendCooldown(30);
        setSuccessMessage('नया OTP कोड पुनः भेजा गया है।');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!otpCode || otpCode.length < 4) {
      setErrorMessage('कृपया पूर्ण OTP दर्ज करें');
      return;
    }

    setLoading(true);

    try {
      const cleanVehicle = vehicleInput.replace(/\s+/g, '');
      const res = await verifyOwnerOtp(cleanVehicle, otpCode, mobileInput);
      if (!res.success) {
        setErrorMessage(res.error || 'गलत OTP कोड');
      }
    } catch {
      setErrorMessage('सत्यापन में समस्या हुई।');
    } finally {
      setLoading(false);
    }
  };

  // Admin login handler
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await loginAsAdmin(adminId, adminPin);
      if (!res.success) {
        setErrorMessage(res.error || 'प्रशासक लॉगिन असफल। सही पिन दर्ज करें।');
      }
    } finally {
      setLoading(false);
    }
  };

  // Registration submit handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const cleanVehicle = regVehicle.replace(/\s+/g, '');
      const res = await registerOwner({
        ownerName: regName,
        vehicleNumber: cleanVehicle,
        mobile: regMobile,
        category: regCategory,
        capacityTon: Number(regCapacity) || 16,
        membershipNumber: regMembership || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'पंजीकरण असफल');
      } else {
        setShowRegisterModal(false);
        setSuccessMessage('नया वाहन सफलतापूर्वक पंजीकृत हुआ! अब लॉगिन करें।');
        setVehicleInput(formatVehicleDisplay(regVehicle));
        setMobileInput(regMobile);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#182033] flex flex-col justify-between px-3 sm:px-4 pt-2 pb-24 relative overflow-x-hidden font-sans">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] h-64 bg-[#E50046]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#101B3A]/5 rounded-full blur-3xl pointer-events-none" />

      {/* ==================================================
          1. HEADER SECTION
          ================================================== */}
      <header className="relative z-10 w-full max-w-md mx-auto pt-2 pb-3">
        {/* Row 1: STOA Logo, Association Titles, ESTD 1982 */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: STOA Circular Association Logo */}
          <div className="shrink-0 flex items-center justify-center">
            <AssociationLogo size={46} showRing />
          </div>

          {/* Center/Left: Titles */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-[17px] sm:text-[18px] font-black tracking-tight text-[#101B3A] font-display uppercase leading-tight">
                STOA <span className="text-[#E50046]">NEXTGEN</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-[#E50046] font-official font-bold leading-tight tracking-wide truncate mt-0.5">
              संबलपुर ट्रक ओनर्स एसोसिएशन
            </p>
          </div>

          {/* Right: ESTD. 1982 Badge */}
          <div className="shrink-0 text-right">
            <div className="inline-flex flex-col items-center justify-center px-2 py-1 rounded-xl bg-white border border-[#E2E6EE] shadow-2xs">
              <span className="text-[8px] font-mono font-bold text-[#687386] tracking-wider uppercase leading-none">
                ESTD.
              </span>
              <span className="text-[12px] font-mono font-black text-[#101B3A] leading-tight mt-0.5">
                1982
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Responsive Language Selector (हिन्दी | English | ଓଡ଼ିଆ) */}
        <div className="mt-2.5 flex items-center justify-center w-full">
          <div
            className="inline-flex items-center p-0.5 bg-white/90 border border-[#E2E6EE] rounded-2xl shadow-xs backdrop-blur-xs max-w-full overflow-x-auto scrollbar-none"
            role="group"
            aria-label="Language Selector"
          >
            {languages.map((l) => {
              const isActive = language === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#E50046] text-white shadow-xs scale-[1.02]'
                      : 'text-[#687386] hover:text-[#182033] hover:bg-slate-100'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ==================================================
          2. MAIN VEHICLE CARD
          ================================================== */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto bg-white border border-[#E2E6EE] rounded-3xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50">
        {/* Top Segmented Tabs: 🚚 वाहन मालिक | 🛡 प्रशासनिक नियंत्रण */}
        <div className="flex bg-[#F7F8FC] p-1 rounded-2xl mb-5 border border-[#E2E6EE]">
          <button
            type="button"
            onClick={() => {
              setAuthTab('OWNER');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authTab === 'OWNER'
                ? 'bg-[#E50046] text-white shadow-sm'
                : 'text-[#687386] hover:text-[#182033]'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('roleOwner', 'वाहन मालिक')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('ADMIN');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2.5 px-2 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authTab === 'ADMIN'
                ? 'bg-[#101B3A] text-white shadow-sm'
                : 'text-[#687386] hover:text-[#182033]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">{t('roleAdmin', 'प्रशासनिक नियंत्रण')}</span>
          </button>
        </div>

        {/* Error / Success Feedback Banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E50046] mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{errorMessage}</p>
              {regVehicle && (
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(true)}
                  className="mt-1 text-[#E50046] underline font-bold hover:text-rose-900 block"
                >
                  नए गाड़ी मालिक का पंजीकरण करें &rarr;
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {/* ==================================================
            TAB 1: VEHICLE OWNER LOGIN FLOW
            ================================================== */}
        {authTab === 'OWNER' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleOwnerLoginSubmit} className="space-y-4">
                {/* 3. VEHICLE NUMBER FIELD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#182033]">
                      {t('vehicleRegNumber', 'गाड़ी नंबर')}
                    </label>
                    {getRtoDisplay(vehicleInput, language) && (
                      <span className="text-[11px] text-[#E50046] font-bold font-mono transition-all">
                        {getRtoDisplay(vehicleInput, language)}
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={vehicleInput}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      placeholder="OD 15 X 7273"
                      maxLength={14}
                      className={`w-full bg-[#F7F8FC] border-2 rounded-2xl px-4 py-3.5 text-[#182033] placeholder-slate-400 text-base font-plate font-black tracking-widest focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#E50046]/20 transition-all ${
                        fieldErrors.vehicle
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#E2E6EE] focus:border-[#E50046]'
                      }`}
                    />
                  </div>
                  {fieldErrors.vehicle && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {fieldErrors.vehicle}
                    </p>
                  )}

                  {/* 4. AUTOMATIC SAMANYIKARAN (Compact Preview) */}
                  <div className="mt-2 p-2 bg-[#F7F8FC] rounded-xl border border-[#E2E6EE] flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#687386] font-medium whitespace-nowrap">
                      स्वचालित सामान्यीकरण:
                    </span>
                    <div className="overflow-hidden">
                      <VehiclePlate number={vehicleInput || 'OD 15 X 7273'} size="sm" />
                    </div>
                  </div>
                </div>

                {/* 5. REGISTERED MOBILE NUMBER */}
                <div>
                  <label className="block text-xs font-bold text-[#182033] mb-1.5">
                    {t('registeredMobileNumber', 'पंजीकृत मोबाइल नंबर')}
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#687386] font-mono pointer-events-none">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={mobileInput}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="9861012345"
                      className={`w-full bg-[#F7F8FC] border-2 rounded-2xl pl-12 pr-10 py-3.5 text-[#182033] placeholder-slate-400 text-sm font-mono font-bold tracking-wider focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#E50046]/20 transition-all ${
                        fieldErrors.mobile
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#E2E6EE] focus:border-[#E50046]'
                      }`}
                    />
                    <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386]" />
                  </div>
                  {fieldErrors.mobile && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {fieldErrors.mobile}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>सख्त सुरक्षा: केवल इस गाड़ी के साथ पंजीकृत अधिकृत मोबाइल नंबर ही मान्य है।</span>
                  </p>
                </div>

                {/* 6. LARGE OTP BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-gradient-to-r from-[#E50046] to-[#C2003B] hover:from-[#d0003f] hover:to-[#a80033] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#E50046]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>OTP भेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('getOtp', 'ओटीपी प्राप्त करें')}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>

                {/* 7. NEW VEHICLE OWNER REGISTRATION LINK */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRegVehicle(vehicleInput);
                      setRegMobile(mobileInput);
                      setShowRegisterModal(true);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#E50046] hover:text-[#C2003B] py-1 px-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>नए गाड़ी मालिक का पंजीकरण</span>
                  </button>
                </div>
              </form>
            ) : (
              /* OTP VERIFICATION STEP */
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 animate-in fade-in">
                {/* Vehicle & Mobile Summary */}
                <div className="p-3 bg-[#F7F8FC] rounded-2xl border border-[#E2E6EE] text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VehiclePlate number={vehicleInput} size="sm" />
                  </div>
                  <p className="text-[#687386] font-mono text-[11px]">
                    +91 ******{mobileInput.slice(-4)}
                  </p>
                </div>

                {/* Demo OTP hint box with 1-click auto-fill */}
                {demoOtpHint && (
                  <div className="p-2.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-900 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-rose-700 block font-semibold">
                        डेमो सत्यापन कोड (Demo OTP):
                      </span>
                      <span className="font-mono font-black text-sm text-[#E50046]">
                        {demoOtpHint}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(demoOtpHint)}
                      className="px-2.5 py-1 bg-[#E50046] text-white rounded-lg text-[11px] font-bold shadow-xs cursor-pointer hover:bg-rose-700"
                    >
                      स्वतः भरें
                    </button>
                  </div>
                )}

                {/* OTP Code Input */}
                <div>
                  <label className="block text-xs font-bold text-[#182033] mb-1.5">
                    {t('enter4DigitOtp', 'ओटीपी कोड दर्ज करें')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="727388"
                    className="w-full h-14 bg-[#F7F8FC] border-2 border-[#E2E6EE] rounded-2xl px-4 text-center text-2xl font-mono tracking-widest text-[#E50046] font-black focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#E50046]/20 focus:border-[#E50046]"
                  />
                </div>

                {/* Resend Cooldown Counter */}
                <div className="flex items-center justify-between text-xs px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setErrorMessage(null);
                    }}
                    className="text-[#687386] hover:text-[#182033] font-semibold underline cursor-pointer"
                  >
                    ← नंबर बदलें
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className={`font-semibold cursor-pointer ${
                      resendCooldown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-[#E50046] hover:underline'
                    }`}
                  >
                    {resendCooldown > 0 ? (
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3" /> पुनः भेजें ({resendCooldown}s)
                      </span>
                    ) : (
                      'पुनः OTP भेजें'
                    )}
                  </button>
                </div>

                {/* Verify Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-gradient-to-r from-[#E50046] to-[#C2003B] hover:from-[#d0003f] hover:to-[#a80033] text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-[#E50046]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>सत्यापित हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('verifyAndLogin', 'सत्यापित कर प्रवेश करें')}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* ==================================================
                8. QUICK DEMO VEHICLES (Horizontal Scrollable)
                ================================================== */}
            <div className="mt-5 pt-4 border-t border-[#E2E6EE]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-[#182033] uppercase tracking-wider">
                  {t('quickDemoVehicles', 'त्वरित डेमो गाड़ियां')}:
                </span>
                <span className="text-[10px] text-[#687386]">क्लिक कर तुरंत भरें</span>
              </div>

              {/* Horizontal Scrollable Container */}
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none -mx-1 px-1">
                {demoVehicles.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDemoVehicle(item)}
                    className="w-[185px] shrink-0 p-2.5 bg-[#F7F8FC] hover:bg-slate-100 rounded-2xl text-left border border-[#E2E6EE] hover:border-[#E50046]/50 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="mb-1.5 pointer-events-none">
                      <VehiclePlate number={item.formatted} size="sm" />
                    </div>
                    <p className="text-xs font-bold text-[#182033] truncate group-hover:text-[#E50046] transition-colors">
                      {item.owner}
                    </p>
                    <span className="text-[10px] text-[#687386] font-mono block">
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* ==================================================
                PREMIUM SPONSOR BANNER (Aaditya Ratan Ratan Group)
                ================================================== */}
            <StoaSponsorBanner showFooter={false} className="mt-4" />
          </div>
        )}

        {/* ==================================================
            TAB 2: ADMINISTRATIVE LOGIN FLOW
            ================================================== */}
        {authTab === 'ADMIN' && (
          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-bold text-[#182033] mb-1.5">
                {t('adminId', 'प्रशासक पहचान')}
              </label>
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value.toUpperCase())}
                placeholder="ADMIN"
                className="w-full bg-[#F7F8FC] border-2 border-[#E2E6EE] rounded-2xl px-4 py-3.5 text-[#182033] text-sm font-mono font-bold tracking-wider focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#101B3A]/20 focus:border-[#101B3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#182033] mb-1.5">
                {t('adminSecurityPin', 'सुरक्षा पिन')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="••••"
                  className="w-full bg-[#F7F8FC] border-2 border-[#E2E6EE] rounded-2xl px-4 py-3.5 text-[#182033] text-sm tracking-widest focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#101B3A]/20 focus:border-[#101B3A]"
                />
                <KeyRound className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687386]" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[54px] bg-[#101B3A] hover:bg-slate-900 text-white font-bold rounded-2xl text-sm transition-all shadow-md shadow-slate-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>लॉगिन हो रहा है...</span>
                </>
              ) : (
                <>
                  <span>प्रशासनिक नियंत्रण में प्रवेश</span>
                  <ShieldCheck className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Admin accounts */}
            <div className="mt-5 pt-4 border-t border-[#E2E6EE]">
              <p className="text-[11px] text-[#687386] mb-2 font-bold uppercase tracking-wider">
                त्वरित डेमो क्रेडेंशियल्स:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setAdminId('ADMIN');
                    setAdminPin('1234');
                  }}
                  className="p-2.5 bg-[#F7F8FC] hover:bg-slate-100 rounded-xl text-left border border-[#E2E6EE] transition-all cursor-pointer"
                >
                  <span className="font-bold text-[#101B3A] block">सामान्य एडमिन</span>
                  <span className="text-[11px] text-[#E50046] font-mono font-bold">ADMIN / 1234</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdminId('SUPER_ADMIN');
                    setAdminPin('7273');
                  }}
                  className="p-2.5 bg-[#F7F8FC] hover:bg-slate-100 rounded-xl text-left border border-[#E2E6EE] transition-all cursor-pointer"
                >
                  <span className="font-bold text-[#101B3A] block">सुपर एडमिन</span>
                  <span className="text-[11px] text-[#E50046] font-mono font-bold">SUPER / 7273</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* ==================================================
          REGISTRATION MODAL FOR NEW VEHICLE OWNERS
          ================================================== */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-[#101B3A]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white border border-[#E2E6EE] rounded-3xl max-w-md w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E6EE] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E50046] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#101B3A]">
                  नए गाड़ी मालिक का पंजीकरण
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-[#182033]">गाड़ी नंबर *</label>
                  {getRtoDisplay(regVehicle, language) && (
                    <span className="text-[11px] text-[#E50046] font-bold font-mono">
                      {getRtoDisplay(regVehicle, language)}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={regVehicle}
                  onChange={(e) => setRegVehicle(formatVehicleDisplay(e.target.value))}
                  placeholder="OD 15 X 7273"
                  className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] font-plate font-bold tracking-widest focus:outline-none focus:border-[#E50046]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#182033] mb-1">मालिक का नाम *</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="उदा. रमेश साहु"
                  className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] focus:outline-none focus:border-[#E50046]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#182033] mb-1">मोबाइल नंबर *</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="9861012345"
                  className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] font-mono focus:outline-none focus:border-[#E50046]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#182033] mb-1">वाहन श्रेणी *</label>
                <select
                  value={regCategory}
                  onChange={(e) => {
                    const cat = e.target.value as VehicleCategory;
                    setRegCategory(cat);
                    if (cat.includes('10-Wheel')) setRegCapacity('18');
                    else if (cat.includes('12-Wheel')) setRegCapacity('25');
                    else if (cat.includes('14-Wheel')) setRegCapacity('31');
                    else if (cat.includes('16-Wheel')) setRegCapacity('35');
                  }}
                  className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] focus:outline-none focus:border-[#E50046] cursor-pointer"
                >
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#182033] mb-1">क्षमता (MT)</label>
                  <input
                    type="number"
                    value={regCapacity}
                    onChange={(e) => setRegCapacity(e.target.value)}
                    className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] font-mono focus:outline-none focus:border-[#E50046]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#182033] mb-1">एसोसिएशन सदस्यता #</label>
                  <input
                    type="text"
                    value={regMembership}
                    onChange={(e) => setRegMembership(e.target.value)}
                    placeholder="उदा. STOA-1420"
                    className="w-full bg-[#F7F8FC] border border-[#E2E6EE] rounded-xl px-3.5 py-2.5 text-[#182033] font-mono focus:outline-none focus:border-[#E50046]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-[#E2E6EE] text-[#687386] rounded-xl font-bold cursor-pointer hover:bg-slate-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#E50046] hover:bg-[#C2003B] text-white rounded-xl font-bold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {loading ? 'पंजीकरण हो रहा है...' : 'पंजीकरण पूर्ण करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Info text */}
      <footer className="relative z-10 w-full max-w-md mx-auto text-center mt-3">
        <p className="text-[11px] text-[#687386]">
          संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) • 15-टू-15 आवर्तन प्रणाली
        </p>
      </footer>
    </div>
  );
};
