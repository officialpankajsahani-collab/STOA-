import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { OwnerUser, Vehicle, GatePass, LedgerEntry, PukarState, DriverAlertLocation, DriverEarningRecord, MembershipRenewalReceipt, SlipCancellationRecord, LoadingProgram } from '../../types/index.js';
import { QRCodeSvg } from '../common/QRCodeSvg.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import { LanguageSwitcher } from '../common/LanguageSwitcher.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import { LiveBroadcastTicker } from '../common/LiveBroadcastTicker.js';
import { TodayPukarViewer } from './TodayPukarViewer.js';
import { MembershipReceiptModal } from '../membership/MembershipReceiptModal.js';
import { VehicleRenewalHistoryModal } from '../membership/VehicleRenewalHistoryModal.js';
import {
  Truck,
  Home,
  FileText,
  DollarSign,
  Ticket,
  User,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Share2,
  LogOut,
  Sparkles,
  PhoneCall,
  Bell,
  RefreshCw,
  ExternalLink,
  Settings,
  Camera,
  Sun,
  Moon,
  XCircle,
  Ban,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { calculateNextLoadingShift, formatCountdown } from '../../utils/loadingSchedule.js';
import { PWAInstallButton } from '../common/PWAInstallButton.js';
import { StoaSponsorBanner } from '../common/StoaSponsorBanner.js';
import { ElectionVotingCard } from './ElectionVotingCard.js';
import { OwnerSettingsModal } from './OwnerSettingsModal.js';
import { VehicleLiveSearchCard } from './VehicleLiveSearchCard.js';

export const OwnerApp: React.FC<{ onOpenAi: () => void }> = ({ onOpenAi }) => {
  const { user, logout } = useAuth();
  const ownerUser = user as OwnerUser;
  const { t, language, setLanguage } = useLanguageTheme();

  const [activeTab, setActiveTab] = useState<'home' | 'pukar' | 'vehicle' | 'ledger' | 'pass' | 'profile'>('home');
  const [showSettings, setShowSettings] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [pukar, setPukar] = useState<PukarState | null>(null);
  const [programs, setPrograms] = useState<LoadingProgram[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [alerts, setAlerts] = useState<DriverAlertLocation[]>([]);
  const [earnings, setEarnings] = useState<DriverEarningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<MembershipRenewalReceipt | null>(null);
  const [showRenewalHistoryModal, setShowRenewalHistoryModal] = useState(false);
  const [isSerialAnimating, setIsSerialAnimating] = useState(false);
  const [serialAnimationKey, setSerialAnimationKey] = useState(0);

  // Slip Cancellation State
  const [showCancelSlipModal, setShowCancelSlipModal] = useState(false);
  const [cancelReasonPreset, setCancelReasonPreset] = useState('गाड़ी में तकनीकी खराबी / ब्रेकडाउन (Mechanical Breakdown)');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [cancellingSlip, setCancellingSlip] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);
  const [cancelErrorMsg, setCancelErrorMsg] = useState<string | null>(null);

  // Daily Shift Schedule Algorithm (Morning 10 AM & Evening 4 PM)
  const [shiftSchedule, setShiftSchedule] = useState(() => calculateNextLoadingShift());

  useEffect(() => {
    const timer = setInterval(() => {
      setShiftSchedule(calculateNextLoadingShift());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOwnerData = async () => {
    if (!ownerUser?.vehicleNumber) return;
    setLoading(true);
    setIsSerialAnimating(true);
    setSerialAnimationKey((k) => k + 1);
    try {
      // 1. Vehicle profile
      const vRes = await fetch(`/api/fleet/${ownerUser.vehicleNumber}`);
      const vData = await vRes.json();
      if (vData.vehicle) setVehicle(vData.vehicle);

      // 2. Live Pukar & Daily Loading Programs
      const [pRes, prRes] = await Promise.all([fetch('/api/pukar'), fetch('/api/loading/programs')]);
      const [pData, prData] = await Promise.all([pRes.json(), prRes.json()]);
      if (pData.pukar) setPukar(pData.pukar);
      if (prData.programs && Array.isArray(prData.programs)) setPrograms(prData.programs);

      // 3. Gate Passes for this vehicle
      const gRes = await fetch(`/api/gate-pass?vehicleNumber=${ownerUser.vehicleNumber}`);
      const gData = await gRes.json();
      if (gData.passes) {
        setGatePasses(gData.passes);
        if (gData.passes.length > 0 && !selectedPass) {
          setSelectedPass(gData.passes[0]);
        }
      }

      // 4. Loading ledger for this vehicle
      const lRes = await fetch(`/api/ledger?search=${ownerUser.vehicleNumber}`);
      const lData = await lRes.json();
      if (lData.entries) setLedgerEntries(lData.entries);

      // 5. Driver Alert check points
      const aRes = await fetch('/api/alerts/locations');
      const aData = await aRes.json();
      if (aData.locations) setAlerts(aData.locations);

      // 6. Driver Earnings
      const eRes = await fetch(`/api/driver/earnings?vehicleNumber=${ownerUser.vehicleNumber}`);
      const eData = await eRes.json();
      if (eData.earnings) setEarnings(eData.earnings);
    } catch (e) {
      console.error('Owner data fetch error:', e);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsSerialAnimating(false);
      }, 1400);
    }
  };

  const handleRefreshGatePass = async () => {
    setIsSerialAnimating(true);
    setSerialAnimationKey((prev) => prev + 1);
    await fetchOwnerData();
  };

  const handleCancelSlip = async () => {
    if (!selectedPass) return;
    const finalReason = (cancelReasonPreset === 'अन्य कारण (Custom Reason)' ? cancelReasonCustom : cancelReasonPreset).trim() || 'मालिक द्वारा लोडिंग रद्द';
    setCancellingSlip(true);
    setCancelErrorMsg(null);
    try {
      const res = await fetch(`/api/gate-pass/${selectedPass.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: finalReason,
          actor: ownerUser?.ownerName || vehicle?.ownerName || 'गाड़ी मालिक',
          actorRole: 'OWNER',
          vehicleNumber: ownerUser?.vehicleNumber || vehicle?.normalizedNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCancelErrorMsg(data.error || 'पर्ची रद्द करने में त्रुटि');
        return;
      }
      setCancelSuccessMsg('पर्ची सफलतापूर्वक रद्द कर दी गई है एवं रोटेशन क्रम सुरक्षित बहाल कर दिया गया है!');
      setShowCancelSlipModal(false);
      setCancelReasonCustom('');
      await fetchOwnerData();
    } catch (err: any) {
      setCancelErrorMsg(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setCancellingSlip(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, [ownerUser?.vehicleNumber]);

  // Real-time synchronization across all mobile devices
  // When Admin deletes or adds a loading program, it updates immediately on all owners' phones without refresh!
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let retryTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/live/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PROGRAMS_SYNC' || data.type === 'CONNECTED') {
              if (data.pukar) {
                setPukar(data.pukar);
              }
              if (Array.isArray(data.programs)) {
                setPrograms(data.programs);
              }
              if (data.detail && (data.action === 'SLIP_BOOKED' || data.action === 'SLIP_CANCELLED' || data.action === 'DISPATCH_COMPLETED')) {
                fetchOwnerData();
              }
            }
          } catch (e) {
            // Heartbeat or parse skip
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          retryTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (e) {
        // Fallback to polling
      }
    };

    connectSSE();

    // Fast fallback polling (every 3 seconds) for mobile resilience
    const pollInterval = setInterval(async () => {
      try {
        const [pRes, prRes] = await Promise.all([fetch('/api/pukar'), fetch('/api/loading/programs')]);
        const [pData, prData] = await Promise.all([pRes.json(), prRes.json()]);
        if (pData.success && pData.pukar) {
          setPukar(pData.pukar);
        }
        if (prData.success && Array.isArray(prData.programs)) {
          setPrograms(prData.programs);
        }
      } catch {
        // silent
      }
    }, 3000);

    // Re-check instantly when mobile screen turns on or user returns to tab
    const handleVisibility = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const [pRes, prRes] = await Promise.all([fetch('/api/pukar'), fetch('/api/loading/programs')]);
          const [pData, prData] = await Promise.all([pRes.json(), prRes.json()]);
          if (pData.success && pData.pukar) {
            setPukar(pData.pukar);
          }
          if (prData.success && Array.isArray(prData.programs)) {
            setPrograms(prData.programs);
          }
        } catch {
          // silent
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimeout) clearTimeout(retryTimeout);
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, []);

  const isSerialInPukar =
    pukar?.isActive &&
    vehicle &&
    vehicle.serialNumber >= pukar.startSerial &&
    vehicle.serialNumber <= pukar.endSerial;

  // Real-time cancellation records from vehicle profile and gate passes (सत्यापित व सुरक्षित डेटा)
  const allCancellationRecords: SlipCancellationRecord[] = [
    ...(vehicle?.cancellationHistory || []),
    ...gatePasses
      .filter(
        (p) =>
          p.status === 'CANCELLED' &&
          !(vehicle?.cancellationHistory || []).some((c) => c.passId === p.id || c.token === p.token)
      )
      .map((p) => ({
        id: `canc-${p.id}`,
        passId: p.id,
        token: p.token,
        vehicleNumber: p.vehicleNumber,
        programTitle: p.company || 'Loading Program',
        destination: p.destination || 'Industrial Line',
        cancelledAt: p.cancelledAt || p.issueDate,
        cancelledBy: p.cancelledBy || 'गाड़ी मालिक / एडमिन',
        cancellationReason: p.cancellationReason || 'मालिक द्वारा लोडिंग रद्द',
        originalSerial: p.currentSerial,
      })),
  ];

  const renderCancellationHistoryCard = () => (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-center shadow-2xs">
            <Ban className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>
                {language === 'en'
                  ? 'Official Slip Cancellation Records'
                  : language === 'or'
                  ? 'ବାତିଲ ହୋଇଥିବା ପର୍ଚିର ସରକାରୀ ରେକର୍ଡ'
                  : 'रद्द की गई पर्चियों का आधिकारिक रिकॉर्ड'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.2 bg-red-100 text-red-800 rounded-full font-mono">
                {allCancellationRecords.length}
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {language === 'en'
                ? 'Permanent audit records visible to Owner & Admin'
                : 'एडमिन एवं मालिक दोनों के पास सुरक्षित व पारदर्शी डेटा'}
            </p>
          </div>
        </div>
      </div>

      {allCancellationRecords.length === 0 ? (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <span className="font-semibold text-slate-700">कोई रद्द की गई पर्ची दर्ज नहीं है।</span>
          <p className="text-[11px] text-slate-400 mt-0.5">सभी लोडिंग पर्चियां सामान्य एवं सक्रिय हैं।</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {allCancellationRecords.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 bg-red-50/60 hover:bg-red-50 border border-red-200 rounded-2xl text-xs space-y-2 transition-all"
            >
              <div className="flex items-center justify-between border-b border-red-100 pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-rose-700 text-xs bg-white px-2 py-0.5 rounded-lg border border-red-200 shadow-2xs">
                    {item.token || `SLIP #${idx + 1}`}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800">
                    {item.programTitle || 'लोडिंग स्लॉट'} &rarr; {item.destination || 'गंतव्य'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-800 rounded-md">
                  रद्द (CANCELLED)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-xl border border-red-100">
                  <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    रद्द करने का कारण (Reason):
                  </span>
                  <span className="font-extrabold text-red-700 leading-snug block">
                    {item.cancellationReason || 'मालिक/एडमिन द्वारा रद्द'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-red-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">रद्दकर्ता:</span>
                    <span className="font-semibold text-slate-800">{item.cancelledBy || 'मालिक'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">तारीख व समय:</span>
                    <span className="font-mono text-slate-600">
                      {item.cancelledAt ? new Date(item.cancelledAt).toLocaleString('hi-IN') : 'सत्यापित'}
                    </span>
                  </div>
                  {item.originalSerial !== undefined && (
                    <div className="flex justify-between pt-0.5 border-t border-slate-100 text-emerald-700 font-semibold">
                      <span>बहाल रोटेशन क्रम:</span>
                      <span className="font-mono font-bold">#{item.originalSerial}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans overflow-x-hidden"
      style={{ paddingBottom: 'max(140px, calc(115px + env(safe-area-inset-bottom)))' }}
    >
      {/* 1. COMPLETELY FIXED RESPONSIVE APPLICATION HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 sm:px-4 py-2.5 shadow-xs w-full max-w-full box-border">
        {/* Row 1: Association logo + STOA NEXTGEN title (Full width, completely visible) */}
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="shrink-0 flex items-center justify-center">
              <AssociationLogo size={38} showRing />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-display whitespace-nowrap">
                STOA <span className="text-rose-600">NEXTGEN</span>
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOwnerData}
            title={t('refresh', 'रिफ्रेश करें')}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Row 2: Owner photo avatar + Owner name + mobile number + role */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative shrink-0">
              {ownerUser?.photoUrl || vehicle?.photoUrl ? (
                <img
                  src={ownerUser?.photoUrl || vehicle?.photoUrl}
                  alt="Owner"
                  className="w-7 h-7 rounded-full object-cover border-2 border-rose-500 shadow-xs"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {ownerUser?.ownerName?.[0] || 'T'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-slate-900 truncate block">
                {ownerUser?.ownerName || vehicle?.ownerName || 'Binod Pradhan'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block">
                📱 {ownerUser?.mobile || vehicle?.ownerMobile || '9861012345'}
              </span>
            </div>
          </div>
          <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">
            वाहन मालिक
          </span>
        </div>

        {/* Row 3: Location / RTO information */}
        <div className="mt-1 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-600 min-w-0">
            <MapPin className="w-3 h-3 text-rose-600 shrink-0" />
            <span className="text-[11px] text-slate-500">Location:</span>
            <span className="text-[11px] font-bold text-slate-900 font-mono">
              Sambalpur (OD15)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">STOA Portal</span>
        </div>
      </header>

      {/* Live Notice Marquee Ticker */}
      <LiveBroadcastTicker />

      {/* Main Body Tabs */}
      <main className="flex-1 w-full max-w-lg mx-auto p-3 sm:p-4 space-y-4 box-border">
        {/* 1. HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-4 w-full max-w-full box-border">
            {/* 4. IMPROVED RESPONSIVE INSTALL APP CARD */}
            <PWAInstallButton variant="hero" />

            {/* 1. CRITICAL FIX: ACTIVE REGISTERED VEHICLE CARD (100% width, no overflow) */}
            <div className="w-full max-w-full box-border bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
              {/* Header: Label & Status with Subtle Pulse Animations */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]"></span>
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold font-mono">
                    {t('activeVehicle', 'ACTIVE REGISTERED VEHICLE')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 animate-pulse"></span>
                  </span>
                  <span>{vehicle?.status === 'IN_QUEUE' ? 'कतार में (In Queue)' : 'पंजीकृत (Registered)'}</span>
                </span>
              </div>

              {/* Vehicle Number Plate - Kept 100% inside card */}
              <div className="w-full overflow-hidden">
                <VehiclePlate
                  number={vehicle?.displayNumber || ownerUser?.vehicleNumber || 'OD 15 A 1122'}
                  size="hero"
                  className="max-w-full"
                />
              </div>

              {/* Vehicle Type & Current Serial Number - Statically & Responsively stacked on mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                    {language === 'en' ? 'Vehicle Type / Category:' : 'वाहन श्रेणी / प्रकार:'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                    {vehicle?.category || '12-Wheeler / 18-26 Ton'}
                  </p>
                </div>

                <div className="flex items-baseline sm:flex-col sm:items-end gap-1.5 sm:gap-0 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    {t('currentSerial', 'Current Serial Number')}:
                  </span>
                  <div
                    key={`home-serial-${serialAnimationKey}`}
                    className={`transition-all duration-700 ${
                      isSerialAnimating
                        ? 'scale-110 text-emerald-600 font-black animate-pulse'
                        : 'text-rose-700'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl font-mono font-black">
                      #{vehicle?.serialNumber || '105'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. RESPONSIVE VEHICLE DETAILS GRID (2 columns on mobile, 3 on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {language === 'en' ? 'Load Capacity' : 'लोड क्षमता'}
                  </span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    {vehicle?.capacityTon || 18} {language === 'en' ? 'Ton' : 'टन'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {language === 'en' ? 'Membership' : 'सदस्यता'}
                  </span>
                  <span className="font-bold text-emerald-700 text-xs mt-0.5 block truncate">
                    {vehicle?.membershipNumber || 'STOA-M-7273'}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-medium block">
                    {language === 'en' ? 'Last Loading Date' : 'अंतिम लोडिंग तिथि'}
                  </span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">
                    {vehicle?.lastLoadedDate || '29 Sep 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* STOA Biennial Election 2026-2028 Voting & Result Hub */}
            <ElectionVotingCard />

            {/* Quick Actions Grid with Non-floating STOA AI option */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('pukar')}
                className="p-3.5 bg-gradient-to-br from-rose-50/90 via-white to-pink-50/70 hover:to-pink-100/70 border-2 border-rose-300 hover:border-rose-400 rounded-3xl text-left transition-all flex flex-col justify-between shadow-xs cursor-pointer group relative overflow-hidden"
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                    <Radio className="w-4 h-4 animate-pulse" />
                  </div>
                  {programs.filter((p) => p.isActive !== false).length > 0 ? (
                    <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full font-mono shadow-xs animate-pulse">
                      {programs.filter((p) => p.isActive !== false).length} लोड
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-mono">
                      लाइव
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[11px] text-rose-800 font-extrabold block">आज का पुकार देखें</span>
                  <span className="text-xs font-black text-slate-900 block mt-0.5 group-hover:text-rose-700">
                    {programs.filter((p) => p.isActive !== false).length > 0
                      ? `${programs.filter((p) => p.isActive !== false).length} लोड व पास &rarr;`
                      : 'लोडिंग प्रोग्राम &rarr;'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 rounded-3xl text-left transition-all flex flex-col justify-between shadow-xs cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 border border-emerald-100">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">15-टू-15 हिसाब</span>
                  <span className="text-xs font-bold text-slate-900">कमाई व लेजर ({ledgerEntries.length})</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenAi}
                className="col-span-2 sm:col-span-1 p-3.5 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200 rounded-3xl text-left transition-all flex items-center sm:flex-col justify-between shadow-xs cursor-pointer"
              >
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center sm:mb-2 shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-rose-700 font-semibold block">STOA AI सहायक</span>
                  <span className="text-xs font-bold text-slate-900">रोटेशन व सहायता &rarr;</span>
                </div>
              </button>
            </div>

            {/* Driver Location Alert Checkpoints */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  {t('geofenceCheckpoints', 'संबलपुर ड्राइवर जांच चौकियां')}
                </h3>
                <span className="text-[11px] text-rose-700 font-mono font-semibold">
                  {language === 'en' ? 'Active Hubs' : language === 'or' ? 'ସକ୍ରିୟ କେନ୍ଦ୍ର' : 'सक्रिय केंद्र'}
                </span>
              </div>

              <div className="space-y-2.5">
                {alerts.map((alt) => (
                  <div key={alt.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{alt.name}</span>
                      <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-mono font-bold">
                        {alt.activeTruckCount} {language === 'en' ? 'Trucks Present' : language === 'or' ? 'ଟ୍ରକ୍ ଉପସ୍ଥିତ' : 'ट्रक उपस्थित'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {language === 'or' ? alt.messageOr : language === 'en' ? alt.messageEn : alt.messageHi}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Demo Vehicles preview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  {t('quickDemoVehicles', 'त्वरित डेमो गाड़ियां')}:
                </span>
                <span className="text-[10px] text-slate-500">15-टू-15 आवर्तन नमूना</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1 pt-0.5 scrollbar-none -mx-1 px-1">
                {[
                  { plate: 'OD 15 A 1122', owner: 'Binod Pradhan', type: '12-Wheel (25T)' },
                  { plate: 'OD 15 X 7273', owner: 'Ramesh Sahu', type: '10-Wheel (18T)' },
                  { plate: 'OD 15 B 4455', owner: 'Rajesh Patel', type: '14-Wheel (31T)' },
                  { plate: 'OD 15 C 8899', owner: 'Surendra Ray', type: '16-Wheel (35T)' },
                ].map((d, i) => (
                  <div key={i} className="w-[170px] shrink-0 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <VehiclePlate number={d.plate} size="sm" />
                    <p className="text-xs font-bold text-slate-900 truncate mt-1">{d.owner}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">{d.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ==================================================
                PREMIUM SPONSOR BANNER (Aaditya Ratan Ratan Group)
                ================================================== */}
            <StoaSponsorBanner showFooter={true} />
          </div>
        )}

        {/* 2. MY VEHICLE TAB (मेरा वाहन) */}
        {activeTab === 'vehicle' && (
          <div className="space-y-4">
            {/* Live Vehicle & Documents Search Feature (मेरा वाहन सर्च) */}
            <VehicleLiveSearchCard />

            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {language === 'en' ? 'Active Vehicle Details' : language === 'or' ? 'ସକ୍ରିୟ ଗାଡ଼ି ବିବରଣୀ' : 'सक्रिय गाड़ी विवरण'}
                    </span>
                  </div>
                  <div className="mt-1">
                    <VehiclePlate number={vehicle?.displayNumber || ownerUser?.vehicleNumber || 'OD 15 X 7273'} size="lg" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>ACTIVE</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
                    {vehicle?.category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mt-4">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t('ownerName', 'मालिक का नाम')}</span>
                  <span className="font-semibold text-slate-900">{vehicle?.ownerName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t('registeredMobileNumber', 'मोबाइल')}</span>
                  <span className="font-semibold text-slate-900">{vehicle?.ownerMobile}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t('membershipStatus', 'सदस्यता स्थिति')}</span>
                  <span className="font-mono text-rose-700 font-bold">{vehicle?.membershipNumber}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">{t('capacity', 'लोड क्षमता')}</span>
                  <span className="font-semibold text-slate-900">{vehicle?.capacityTon} {t('capacityTon', 'टन')}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">
                    {language === 'en' ? 'Membership Validity' : language === 'or' ? 'ସଦସ୍ୟତା ବୈଧତା' : 'सदस्यता वैधता'}
                  </span>
                  <span className="font-semibold text-slate-900">{vehicle?.membershipExpiryDate}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">
                    {language === 'en' ? 'Blacklist Status' : language === 'or' ? 'କଳା ତାଲିକା ସ୍ଥିତି' : 'काली सूची स्थिति'}
                  </span>
                  <span className={vehicle?.isBlacklisted ? 'text-red-700 font-bold' : 'text-emerald-700 font-semibold'}>
                    {vehicle?.isBlacklisted
                      ? (language === 'en' ? 'Yes (Restricted)' : language === 'or' ? 'ହଁ (କଟକଣା ଅଛି)' : 'हाँ (रोक लगी है)')
                      : (language === 'en' ? 'No (Clear)' : language === 'or' ? 'ନାହିଁ (ସ୍ୱଚ୍ଛ)' : 'नहीं (स्वच्छ)')}
                  </span>
                </div>
              </div>
            </div>

            {/* Dedicated Membership Renewal & Receipts Section */}
            <div className="bg-white border-2 border-rose-100 rounded-3xl p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center font-bold">
                    🏛️
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      सदस्यता नवीनीकरण प्रमाणपत्र व रसीदें (Membership Renewal)
                    </h4>
                    <p className="text-[10.5px] text-slate-500">
                      सम्बलपुर ट्रक ओनर्स एसोसिएशन (पंजीयन सं. 7238/237) &bull; आजीवन सुरक्षित डिजिटल रिकॉर्ड
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  कुल #{vehicle?.renewalCount || (vehicle?.renewalHistory ? vehicle.renewalHistory.length : 0)} बार नवीनीकृत
                </span>
              </div>

              {/* Status and count summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">सदस्यता संख्या</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                    {vehicle?.membershipNumber}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">वर्तमान वैधता</span>
                  <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                    {vehicle?.membershipExpiryDate}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">सदस्यता स्थिति</span>
                  <span className="font-bold text-slate-900 mt-0.5 block flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {vehicle?.membershipStatus}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
                  <span className="text-[10px] text-amber-800 block">सुरक्षित नवीनीकरण</span>
                  <span className="font-mono font-black mt-0.5 block">
                    {vehicle?.renewalCount || (vehicle?.renewalHistory ? vehicle.renewalHistory.length : 0)} बार रिकॉर्डेड
                  </span>
                </div>
              </div>

              {/* Latest Receipt Action Bar */}
              {vehicle?.renewalHistory && vehicle.renewalHistory.length > 0 ? (
                <div className="p-3 bg-gradient-to-r from-rose-50/60 to-amber-50/60 rounded-2xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-rose-800 bg-white px-2 py-0.5 rounded-lg border border-rose-200">
                        रसीद #{vehicle.renewalHistory[0].receiptNumber}
                      </span>
                      <span className="font-bold text-slate-900">
                        वर्ष {vehicle.renewalHistory[0].renewalYear}
                      </span>
                      <span className="text-[10.5px] text-slate-500">
                        दिनांक: {vehicle.renewalHistory[0].dateFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      शुल्क: <strong>₹{vehicle.renewalHistory[0].feeAmount}/-</strong> ({vehicle.renewalHistory[0].feeInWords}) &bull; नई वैधता: <strong>{vehicle.renewalHistory[0].newExpiryDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        const rec = vehicle.renewalHistory![0];
                        const link = document.createElement('a');
                        link.href = `/api/membership/receipt/${rec.receiptNumber}/pdf`;
                        link.download = `STOA_Renewal_Receipt_${rec.receiptNumber}_${(rec.displayNumber || vehicle.displayNumber).replace(/\s+/g, '_')}.pdf`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                      title="असली अपलोड किए गए फोटो जैसा PDF डाउनलोड करें"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF डाउनलोड करें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(vehicle.renewalHistory![0])}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-300 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      title="फोटो जैसा सदस्यता रसीद देखें"
                    >
                      <span>रसीद देखें</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRenewalHistoryModal(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs cursor-pointer transition-colors"
                      title="समस्त नवीनीकरण इतिहास देखें"
                    >
                      <span>समस्त इतिहास ({vehicle.renewalHistory.length})</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span>इस गाड़ी के लिए डिजिटल नवीनीकरण अभिलेख सुरक्षित हैं।</span>
                  <button
                    type="button"
                    onClick={() => setShowRenewalHistoryModal(true)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    नवीनीकरण इतिहास देखें
                  </button>
                </div>
              )}
            </div>

            {/* Vehicle Documents */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                {t('statutoryDocuments', 'वाहन वैधानिक दस्तावेज')}
              </h4>

              <div className="space-y-2">
                {vehicle?.documents?.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">{doc.docType}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {doc.docNumber} &middot; Exp: {doc.expiryDate}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${
                        doc.status === 'VALID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : doc.status === 'EXPIRING_SOON'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {doc.status === 'VALID' ? t('valid') : doc.status === 'EXPIRING_SOON' ? t('expiringSoon') : t('expired')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slip Cancellation History & Reasons */}
            {renderCancellationHistoryCard()}
          </div>
        )}

        {/* 3. MY LEDGER / EARNINGS TAB */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            {/* Earnings Summary Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                {language === 'en' ? 'Current 15-to-15 Cycle Earnings Summary' : language === 'or' ? 'ଚାଲୁ ୧୫-ରୁ-୧୫ ଚକ୍ର ରୋଜଗାର ସାରାଂଶ' : 'चालू 15-टू-15 चक्र कमाई सारांश'}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">
                  ₹
                  {earnings.reduce((a, c) => a + c.grossFreight, 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">{t('grossFreight', 'कुल भाड़ा')}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-3.5 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">{t('dieselAdvance', 'डीजल अग्रिम')}</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{earnings.reduce((a, c) => a + c.dieselAdvance, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{t('cashAdvance', 'नकद अग्रिम')}</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    ₹{earnings.reduce((a, c) => a + c.cashAdvance, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">{t('netPending', 'शेष बकाया राशि')}</span>
                  <span className="font-semibold text-rose-700 font-mono">
                    ₹{earnings.reduce((a, c) => a + c.netPendingBalance, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Loading History Entries */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                {t('loadingRotationLedger', 'लोडिंग इतिहास बहीखाता')}
              </h4>

              {ledgerEntries.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">{t('noLedger', 'कोई बहीखाता प्रविष्टि नहीं मिली')}</p>
              ) : (
                <div className="space-y-2.5">
                  {ledgerEntries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-rose-700 font-bold">{item.token}</span>
                        <span className="text-[11px] text-slate-500">{item.loadingDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-800">
                        <span className="font-semibold text-slate-900">{item.company}</span>
                        <span className="text-slate-600">&rarr; {item.route}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                        <span className="text-slate-600">
                          {t('serialNumber', 'क्रम')}: #{item.currentSerial} &rarr; #{item.newSerial}
                        </span>
                        <span
                          className={`font-semibold ${
                            item.paymentStatus === 'VERIFIED_PAID' ? 'text-emerald-700' : 'text-amber-800'
                          }`}
                        >
                          {item.paymentStatus === 'VERIFIED_PAID' ? `₹${item.amountPaid} (${t('verifiedPaid')})` : t('unpaid')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TODAY PUKAR & LOADING PROGRAM HUB + DIRECT GATE PASS */}
        {(activeTab === 'pukar' || activeTab === 'pass') && (
          <TodayPukarViewer
            programs={programs}
            pukar={pukar}
            vehicle={vehicle}
            gatePasses={gatePasses}
            selectedPass={selectedPass}
            onSelectPass={setSelectedPass}
            onSlipGenerated={(pass) => {
              fetchOwnerData();
              setSelectedPass(pass);
            }}
            onRequestCancelSlip={(pass) => {
              setSelectedPass(pass);
              setCancelErrorMsg(null);
              setShowCancelSlipModal(true);
            }}
            onRefresh={handleRefreshGatePass}
            isRefreshing={isSerialAnimating}
          />
        )}

        {/* 5. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-xs relative overflow-hidden">
              {/* Photo with Camera trigger */}
              <div className="relative inline-block mx-auto mb-3">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md mx-auto flex items-center justify-center">
                  {ownerUser?.photoUrl || vehicle?.photoUrl ? (
                    <img
                      src={ownerUser?.photoUrl || vehicle?.photoUrl}
                      alt="Owner Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-2xl">
                      {ownerUser?.ownerName?.[0] || 'T'}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md ring-2 ring-white cursor-pointer transition-transform hover:scale-110"
                  title="फोटो बदलें / सेटिंग्स"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{ownerUser?.ownerName || vehicle?.ownerName}</h3>
              <p className="text-xs font-semibold text-slate-600 font-mono mt-0.5 flex items-center justify-center gap-1">
                <span>📱 +91 {ownerUser?.mobile || vehicle?.ownerMobile || '9861012345'}</span>
              </p>

              <div className="mt-2.5 flex justify-center">
                <VehiclePlate number={ownerUser?.vehicleNumber || vehicle?.displayNumber || 'OD 15 X 7273'} size="sm" />
              </div>

              <p className="text-[11px] text-slate-500 mt-2">
                {t('membershipStatus', 'सदस्यता')}: <span className="font-mono font-bold text-slate-800">{vehicle?.membershipNumber || ownerUser?.membershipNumber || 'STOA-M-0412'}</span>
              </p>

              {/* Direct Settings & Profile Edit Button */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <Settings className="w-4 h-4 text-white" />
                  <span>
                    {language === 'en'
                      ? '⚙️ Settings (Language, Profile & Photo)'
                      : language === 'or'
                      ? '⚙️ ସେଟିଂସ୍ (ଭାଷା, ପ୍ରୋଫାଇଲ୍ ଓ ଫଟୋ)'
                      : '⚙️ सेटिंग्स (भाषा, प्रोफाइल एवं फोटो)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Install STOA App on Device */}
            <PWAInstallButton variant="card" />

            {/* Official Slip Cancellation Records */}
            {renderCancellationHistoryCard()}

            {/* Helpline Numbers */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                {t('helpline', 'संबलपुर एसटीओए सहायता केंद्र')}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {language === 'en' ? 'Head Office (Dhanupali)' : language === 'or' ? 'ମୁଖ୍ୟ କାର୍ଯ୍ୟାଳୟ (ଧନୁପାଲି)' : 'मुख्य कार्यालय (धनुपाली)'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">0663-2400123 / 9437012345</span>
                  </div>
                  <a
                    href="tel:9437012345"
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-[11px] font-bold shadow-xs hover:from-rose-500 hover:to-pink-500"
                  >
                    {language === 'en' ? 'Call' : language === 'or' ? 'କଲ୍' : 'कॉल करें'}
                  </a>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {language === 'en' ? 'Hirakud Smelter Gate Desk' : language === 'or' ? 'ହୀରାକୁଦ ସ୍ମେଲ୍ଟର ଗେଟ୍ ଡେସ୍କ' : 'हीराकुद स्मेल्टर गेट डेस्क'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">9861099887</span>
                  </div>
                  <a
                    href="tel:9861099887"
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-[11px] font-bold shadow-xs hover:from-rose-500 hover:to-pink-500"
                  >
                    {language === 'en' ? 'Call' : language === 'or' ? 'କଲ୍' : 'कॉल करें'}
                  </a>
                </div>
              </div>
            </div>

            {/* Language Switch */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                {t('languageSelect', 'भाषा चयन')}
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    language === 'hi'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    language === 'en'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('or')}
                  className={`py-2.5 rounded-xl font-bold border transition-all ${
                    language === 'or'
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ଓଡ଼ିଆ
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {t('logoutSession', 'लॉग आउट')}
            </button>
          </div>
        )}
      </main>

      {/* Owner Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 pt-1.5 max-w-lg mx-auto shadow-lg"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'home' ? 'text-rose-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('home', 'होम')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicle')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'vehicle' ? 'text-rose-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('myVehicle', 'मेरा वाहन')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'ledger' ? 'text-rose-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('myLedger', 'मेरा हिसाब')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pukar')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all relative cursor-pointer ${
              activeTab === 'pukar' || activeTab === 'pass'
                ? 'text-rose-600 font-bold scale-105'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">आज का पुकार</span>
            {programs.filter((p) => p.isActive !== false).length > 0 ? (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white animate-pulse" />
            ) : gatePasses.length > 0 ? (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'text-rose-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{t('profile', 'प्रोफाइल')}</span>
          </button>
        </div>
      </nav>

      {/* Owner Settings Modal */}
      <OwnerSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        vehicle={vehicle}
        onProfileUpdated={(updated) => {
          if (updated) setVehicle(updated);
        }}
      />

      {/* Official Membership Receipt Modal (Photo Replica) */}
      {selectedReceipt && (
        <MembershipReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          isNewRenewal={false}
        />
      )}

      {/* Vehicle Renewal History Records Modal */}
      {showRenewalHistoryModal && vehicle && (
        <VehicleRenewalHistoryModal
          vehicle={vehicle}
          onClose={() => setShowRenewalHistoryModal(false)}
        />
      )}

      {/* Owner Slip Cancellation Modal */}
      {showCancelSlipModal && selectedPass && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <Ban className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    लोडिंग पर्ची रद्द करें (Cancel Slip)
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    टोकन: <strong>{selectedPass.token}</strong> &bull; {selectedPass.vehicleNumber}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCancelSlipModal(false);
                  setCancelErrorMsg(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Explanatory Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>सुरक्षित रोटेशन बहाली गारंटी</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                पर्ची रद्द करने पर आपकी गाड़ी का मूल क्रम (<strong className="font-mono">#{selectedPass.currentSerial}</strong>) रोटेशन में सुरक्षित बहाल रहेगा। रद्द करने का कारण आपके एवं एडमिन प्रोफाइल में सुरक्षित दर्ज होगा।
              </p>
            </div>

            {cancelErrorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{cancelErrorMsg}</span>
              </div>
            )}

            {/* Reason Selection */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">
                रद्द करने का मुख्य कारण चुनें (Select Reason):
              </label>
              {[
                'गाड़ी में तकनीकी खराबी / ब्रेकडाउन (Mechanical Breakdown)',
                'ड्राइवर अस्वस्थ या अनुपलब्ध (Driver Unavailable)',
                'अन्य संयंत्र/रूट पर बुकिंग (Alternative Plant / Route)',
                'मालिक द्वारा व्यक्तिगत कारण (Personal / Family Reason)',
                'अन्य कारण (Custom Reason)',
              ].map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                    cancelReasonPreset === r
                      ? 'bg-rose-50/70 border-rose-400 text-rose-900 font-bold shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={r}
                    checked={cancelReasonPreset === r}
                    onChange={() => setCancelReasonPreset(r)}
                    className="accent-rose-600"
                  />
                  <span className="text-xs">{r}</span>
                </label>
              ))}

              {cancelReasonPreset === 'अन्य कारण (Custom Reason)' && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    विस्तृत कारण लिखें (Enter details):
                  </label>
                  <textarea
                    rows={2}
                    value={cancelReasonCustom}
                    onChange={(e) => setCancelReasonCustom(e.target.value)}
                    placeholder="उदा. टायर पंक्चर, कागजात में देरी, आदि..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancelSlipModal(false);
                  setCancelErrorMsg(null);
                }}
                disabled={cancellingSlip}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                वापस जाएं (Back)
              </button>
              <button
                type="button"
                onClick={handleCancelSlip}
                disabled={cancellingSlip || (cancelReasonPreset === 'अन्य कारण (Custom Reason)' && !cancelReasonCustom.trim())}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancellingSlip ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>रद्द किया जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>हां, पर्ची रद्द करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
