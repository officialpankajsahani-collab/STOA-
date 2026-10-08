import React, { useState, useEffect } from 'react';
import { LoadingProgram, Vehicle, GatePass, PukarState, UserRole } from '../../types/index.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { QRCodeSvg } from '../common/QRCodeSvg.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import { calculateNextLoadingShift, formatCountdown } from '../../utils/loadingSchedule.js';
import {
  Radio,
  Calendar,
  Truck,
  Ticket,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Sparkles,
  MapPin,
  ChevronRight,
  Layers,
  RefreshCw,
  Ban,
  XCircle,
  X,
  Plus,
  Check,
  ShieldCheck,
  ArrowRight,
  User,
  Phone,
} from 'lucide-react';

interface TodayPukarViewerProps {
  programs: LoadingProgram[];
  pukar: PukarState | null;
  vehicle: Vehicle | null;
  gatePasses: GatePass[];
  selectedPass: GatePass | null;
  onSelectPass: (pass: GatePass) => void;
  onSlipGenerated: (pass: GatePass) => void;
  onRequestCancelSlip: (pass: GatePass) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const TodayPukarViewer: React.FC<TodayPukarViewerProps> = ({
  programs,
  pukar,
  vehicle,
  gatePasses,
  selectedPass,
  onSelectPass,
  onSlipGenerated,
  onRequestCancelSlip,
  onRefresh,
  isRefreshing = false,
}) => {
  const { t, language } = useLanguageTheme();

  // Top Sub-Tab: Programs vs Issued Passes
  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'passes'>('programs');

  // Filter chips for Programs
  const [filter, setFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'AVAILABLE'>('ALL');

  // Gate Pass Generation Modal State
  const [bookingProg, setBookingProg] = useState<LoadingProgram | null>(null);
  const [driverName, setDriverName] = useState<string>('');
  const [driverPhone, setDriverPhone] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingErrorsList, setBookingErrorsList] = useState<string[]>([]);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Shift countdown timer
  const [shiftSchedule, setShiftSchedule] = useState(() => calculateNextLoadingShift());
  useEffect(() => {
    const timer = setInterval(() => {
      setShiftSchedule(calculateNextLoadingShift());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Combine all programs from /api/loading/programs and pukar.currentNotice.items
  const allPrograms: LoadingProgram[] = [...programs];
  if (pukar?.currentNotice?.items && Array.isArray(pukar.currentNotice.items)) {
    for (const item of pukar.currentNotice.items) {
      if (!allPrograms.some((p) => p.id === item.id)) {
        const companyName = item.plantSection.includes('SMELTER')
          ? 'Hindalco Samelter'
          : item.plantSection.includes('BLUEFOX') || item.plantSection.includes('FRP')
          ? 'Blue Fox'
          : item.plantSection.includes('LAPANGA')
          ? 'Aditya Birla Lapanga'
          : item.plantSection.includes('VEDANTA')
          ? 'Vedanta Limited'
          : 'Other';

        allPrograms.push({
          id: item.id,
          company: companyName,
          companyCustomName: `${item.plantSection} - ${item.destination}`,
          destination: item.destination,
          cargo: item.cargo || 'COIL / RI',
          dateSection: item.dateSection === 'TOMORROW' ? 'TOMORROW' : 'TODAY',
          dateLabel: item.dateLabel || 'DT. TODAY',
          categoryRequired: item.categoryRequired || '10-Wheel / 16-18 Ton',
          capacityTonRequired: item.capacityMt || 18,
          totalQuota: item.vehicleQuota || 1,
          bookedCount: item.bookedCount || 0,
          ratePerTon: item.ratePerTon || 2200,
          advancePercentage: 70,
          pendingFreightAllowed: false,
          preferenceRule: item.remarks,
          programType: 'GENERAL',
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  const activePrograms = allPrograms.filter((p) => p.isActive !== false);

  const isSerialInPukar = Boolean(
    pukar?.isActive &&
      vehicle?.serialNumber &&
      pukar.startSerial &&
      pukar.endSerial &&
      vehicle.serialNumber >= pukar.startSerial &&
      vehicle.serialNumber <= pukar.endSerial
  );

  const filteredPrograms = activePrograms.filter((p) => {
    if (filter === 'TODAY') {
      return p.dateSection !== 'TOMORROW';
    }
    if (filter === 'TOMORROW') {
      return p.dateSection === 'TOMORROW';
    }
    if (filter === 'AVAILABLE') {
      const remaining = p.totalQuota - p.bookedCount;
      return remaining > 0;
    }
    return true;
  });

  const todayCount = activePrograms.filter((p) => p.dateSection !== 'TOMORROW').length;
  const tomorrowCount = activePrograms.filter((p) => p.dateSection === 'TOMORROW').length;
  const availableCount = activePrograms.filter((p) => p.totalQuota - p.bookedCount > 0).length;

  // Handle direct Gate Pass Generation
  const handleGenerateGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingProg || !vehicle) return;

    setIsSubmitting(true);
    setBookingError(null);
    setBookingErrorsList([]);
    setBookingSuccessMsg(null);

    try {
      const res = await fetch('/api/loading/owner-slip-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: Number(vehicle.serialNumber),
          vehicleNumber: vehicle.normalizedNumber,
          pukarItemId: bookingProg.id,
          driverName: driverName.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBookingError(data.error || data.message || 'गेट पास जनरेट करने में त्रुटि');
        if (data.errors && Array.isArray(data.errors)) {
          setBookingErrorsList(data.errors);
        }
        return;
      }

      setBookingSuccessMsg(data.message || '🎉 डिजिटल गेट पास सफलतापूर्वक जारी हो गया!');
      if (data.gatePass) {
        onSlipGenerated(data.gatePass);
        onSelectPass(data.gatePass);
        setActiveSubTab('passes');
      }
      setBookingProg(null);
      setDriverName('');
      setDriverPhone('');
    } catch (err: any) {
      setBookingError(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextShiftLabel =
    language === 'or'
      ? shiftSchedule.nextShiftLabelOr
      : language === 'en'
      ? shiftSchedule.nextShiftLabelEn
      : shiftSchedule.nextShiftLabelHi;

  const currentPass = selectedPass || (gatePasses.length > 0 ? gatePasses[0] : null);

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & REAL-TIME PUKAR STATUS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white rounded-3xl p-4 sm:p-6 shadow-md border-2 border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full font-mono shadow-xs">
                  आज का पुकार (LIVE PUKAR)
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-rose-300 border border-slate-700 px-2 py-0.5 rounded-full font-mono">
                  चक्र: {pukar?.currentCycle || '15-टू-15 आवर्तन'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                दैनिक लोडिंग प्रोग्राम एवं गेट पास केंद्र
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onRefresh}
              title="पुकार एवं लोड रिफ्रेश करें"
              className="px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
              <span>लाइव रिफ्रेश</span>
            </button>
          </div>
        </div>

        {/* Live Pukar Mode Indicator Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <span className="text-slate-400 font-medium">पुकार व्यवस्था:</span>
            <span className="font-extrabold text-white">
              {pukar?.mode === 'GENERAL'
                ? '🔵 सामान्य (15-टू-15)'
                : pukar?.mode === 'PENDING'
                ? '🟠 पेंडिंग भाड़ा'
                : '🟣 संबलपुर वरीयता'}
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <span className="text-slate-400 font-medium">सक्रिय लोडिंग प्रोग्राम:</span>
            <span className="font-mono font-black text-rose-400 text-sm">
              {activePrograms.length} प्रोग्राम
            </span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
            <span className="text-slate-400 font-medium">आपका रोटेशन क्रम:</span>
            <span className="font-mono font-black text-amber-300 text-sm">
              #{vehicle?.serialNumber ?? '—'}
            </span>
          </div>
        </div>

        {/* Pukar Serial Range & Announcement Banner (When Active) */}
        {pukar?.isActive ? (
          <div className="bg-slate-800/90 rounded-2xl p-3 sm:p-4 border border-rose-500/30 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs font-bold text-rose-300">
                  पुकार क्रम सीमा (Active Serial Range):
                </span>
              </div>
              <span className="font-mono text-sm sm:text-base font-black text-white">
                #{pukar.startSerial || 101} &ndash; #{pukar.endSerial || 115}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              🚨 {language === 'or'
                ? pukar.announcementOr
                : language === 'en'
                ? pukar.announcementEn || 'Pukar active today for serial numbers. Loading program active.'
                : pukar.announcementHi || 'आज क्रम संख्या 101 से 115 तक के लिए पुकार सक्रिय है। लोडिंग कार्यक्रम चालू है।'}
            </p>

            {/* Vehicle Queue Position relative to Pukar */}
            <div
              className={`p-2.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${
                isSerialInPukar
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900/60 border border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isSerialInPukar ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  वर्तमान वाहन क्रम:{' '}
                  <strong className="font-mono font-bold text-white">#{vehicle?.serialNumber || '105'}</strong>
                </span>
              </div>
              <span className="font-bold sm:text-right">
                {isSerialInPukar ? (
                  <span className="text-emerald-400">✓ लोडिंग हेतु कतार में पात्र (Ready for Loading!)</span>
                ) : (
                  <span className="text-amber-300">
                    प्रतीक्षा सूची: {Math.max(0, (vehicle?.serialNumber || 0) - (pukar.endSerial || 115))} गाड़ियां
                  </span>
                )}
              </span>
            </div>
          </div>
        ) : (
          /* Shift Schedule Countdown when no active Pukar announcement */
          <div className="bg-slate-800/90 rounded-2xl p-3 sm:p-4 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-slate-200">
                दैनिक लोडिंग पुकार समय सारिणी (10:00 AM & 04:00 PM)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">अगला कार्यक्रम: <strong className="text-white">{nextShiftLabel}</strong></span>
              <span className="font-mono bg-slate-900 text-amber-300 px-2.5 py-1 rounded-xl font-bold border border-slate-700">
                {formatCountdown(shiftSchedule.timeRemainingSeconds).formatted}
              </span>
            </div>
          </div>
        )}

        {/* Success Banner if booking confirmed */}
        {bookingSuccessMsg && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-bold">{bookingSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setBookingSuccessMsg(null)}
              className="text-emerald-300 hover:text-white font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 2. SUB-TAB SWITCHER: LOADS vs GATE PASSES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs flex gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('programs')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'programs'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>लाइव लोडिंग प्रोग्राम</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              activeSubTab === 'programs' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {activePrograms.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('passes')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'passes'
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>मेरे डिजिटल गेट पास</span>
          {gatePasses.length > 0 && (
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeSubTab === 'passes' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {gatePasses.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. VIEW: LOADING PROGRAMS LIST */}
      {activeSubTab === 'programs' && (
        <div className="space-y-3.5">
          {/* Filter Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              सभी लोड ({activePrograms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('TODAY')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'TODAY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              आज का लोड ({todayCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('TOMORROW')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'TOMORROW'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              कल का लोड ({tomorrowCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('AVAILABLE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                filter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              खाली कोटा ({availableCount})
            </button>
          </div>

          {/* EMPTY STATE: No active loading program */}
          {activePrograms.length === 0 ? (
            <div className="bg-gradient-to-b from-white via-slate-50/50 to-white border-2 border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                    समय सारिणी सक्रिय
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है
                  </h3>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
                <p className="text-amber-950 font-medium leading-relaxed">
                  📢 एडमिन काउंटर द्वारा जब भी नया लोडिंग प्रोग्राम पोस्ट किया जाएगा (सुबह 10:00 AM या शाम 04:00 PM), वह तुरंत आपके मोबाइल पर यहाँ दिखाई देगा और आप सीधे यहीं से अपना गेट पास जनरेट कर सकेंगे।
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-amber-200/80 gap-2">
                  <span className="text-slate-600 font-bold">अगला संभावित कार्यक्रम:</span>
                  <span className="font-mono font-black text-rose-700 text-sm">
                    {nextShiftLabel}
                  </span>
                </div>
              </div>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-xs shadow-xs space-y-2">
              <Layers className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">इस फिल्टर में कोई लोडिंग प्रोग्राम नहीं है</p>
              <button
                type="button"
                onClick={() => setFilter('ALL')}
                className="text-rose-600 font-bold hover:underline"
              >
                सभी {activePrograms.length} लोड देखें &rarr;
              </button>
            </div>
          ) : (
            /* LIST OF ACTIVE PROGRAMS */
            <div className="space-y-3">
              {filteredPrograms.map((prog) => {
                const remaining = Math.max(0, prog.totalQuota - prog.bookedCount);
                const isFull = remaining <= 0;
                const percentBooked = Math.min(
                  100,
                  Math.round((prog.bookedCount / Math.max(1, prog.totalQuota)) * 100)
                );

                return (
                  <div
                    key={prog.id}
                    className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all shadow-xs space-y-3.5 ${
                      isFull
                        ? 'border-slate-200 opacity-90'
                        : 'border-rose-200 hover:border-rose-400 hover:shadow-md'
                    }`}
                  >
                    {/* Program Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Plant Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-white font-mono">
                            {prog.company}
                          </span>

                          {/* Day Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prog.dateSection === 'TOMORROW'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {prog.dateSection === 'TOMORROW' ? '🌅 कल का लोड' : '📅 आज का लोड'}
                          </span>

                          {/* Pukar Mode Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              prog.programType === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : prog.programType === 'PREFERENCE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {prog.programType === 'PENDING'
                              ? '🟠 पेंडिंग'
                              : prog.programType === 'PREFERENCE'
                              ? '🟣 प्रिफरेंस'
                              : '🔵 सामान्य'}
                          </span>
                        </div>

                        {/* Destination Title */}
                        <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1.5 tracking-tight flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{prog.destination}</span>
                        </h4>
                      </div>

                      {/* Quota Counter Pill */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-xs font-mono font-black ${
                            isFull
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                          }`}
                        >
                          {isFull ? 'कोटा पूर्ण' : `खाली कोटा: ${remaining} / ${prog.totalQuota}`}
                        </span>
                      </div>
                    </div>

                    {/* Program Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">लोड टन क्षमता</span>
                        <strong className="text-slate-900 font-mono text-xs font-extrabold">
                          {prog.capacityTonRequired} MT
                        </strong>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">वाहन श्रेणी</span>
                        <strong className="text-slate-900 text-xs font-bold truncate block">
                          {prog.categoryRequired}
                        </strong>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">दर (Freight Rate)</span>
                        <strong className="text-rose-700 font-mono text-xs font-black">
                          ₹{prog.ratePerTon} / टन
                        </strong>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-500 block">अग्रिम भाड़ा</span>
                        <strong className="text-emerald-700 font-mono text-xs font-black">
                          {prog.advancePercentage}% अग्रिम
                        </strong>
                      </div>
                    </div>

                    {/* Visual Quota Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                        <span>कुल कोटा: {prog.totalQuota} गाड़ियां</span>
                        <span>
                          {prog.bookedCount} कटी पर्चियां • {remaining} खाली
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isFull
                              ? 'bg-slate-400'
                              : percentBooked > 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentBooked}%` }}
                        />
                      </div>
                    </div>

                    {/* Cutting Remarks / Rules */}
                    {prog.preferenceRule && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 flex items-start gap-1.5 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>विशेष निर्देश: {prog.preferenceRule}</span>
                      </div>
                    )}

                    {/* DEDICATED BUTTON: GENERATE GATE PASS */}
                    <div className="pt-1">
                      {isFull ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 bg-slate-100 text-slate-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-200"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>❌ इस लाइन का कोटा पूर्ण हो चुका है (No Quota Left)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setBookingProg(prog);
                            setBookingError(null);
                            setBookingErrorsList([]);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-rose-600 via-rose-700 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl font-black text-xs shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
                        >
                          <Ticket className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                          <span>🎫 गेट पास जनरेट करें (पर्ची काटें)</span>
                          <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. VIEW: ISSUED GATE PASSES */}
      {activeSubTab === 'passes' && (
        <div className="space-y-4">
          {gatePasses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-xs shadow-xs space-y-3">
              <Ticket className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="font-extrabold text-slate-800 text-sm">
                  कोई सक्रिय गेट पास जारी नहीं किया गया है
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  लाइव लोडिंग प्रोग्राम में से स्लॉट चुनकर आप तुरंत अपना डिजिटल गेट पास जनरेट कर सकते हैं।
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubTab('programs')}
                className="mt-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>लाइव लोडिंग प्रोग्राम देखें व पास जनरेट करें &rarr;</span>
              </button>
            </div>
          ) : (
            <div>
              {/* Pass Selector if multiple passes exist */}
              {gatePasses.length > 1 && (
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 text-xs">
                  {gatePasses.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelectPass(p)}
                      className={`px-3 py-1.5 rounded-xl font-mono font-semibold shrink-0 transition-all cursor-pointer ${
                        currentPass?.id === p.id
                          ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p.token}
                    </button>
                  ))}
                </div>
              )}

              {/* Printable Gate Pass Sheet */}
              {currentPass && (
                <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 shadow-sm relative border-2 border-slate-300 space-y-4">
                  {/* Cancellation Alert Banner */}
                  {currentPass.status === 'CANCELLED' && (
                    <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-900 space-y-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-black text-sm uppercase text-red-700">
                          यह लोडिंग पर्ची रद्द (CANCELLED) कर दी गई है
                        </span>
                      </div>
                      <div className="text-xs bg-white p-3 rounded-xl border border-red-200 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600 font-bold">कारण:</span>
                          <span className="text-red-700 font-extrabold">
                            {currentPass.cancellationReason || 'मालिक द्वारा लोडिंग रद्द'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">रद्दकर्ता:</span>
                          <span className="font-bold">{currentPass.cancelledBy || 'गाड़ी मालिक'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="text-center border-b border-slate-200 pb-3">
                    <AssociationLogo size={52} showRing className="mx-auto mb-2" />
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block font-official">
                      संबलपुर ट्रक ओनर्स एसोसिएशन
                    </span>
                    <h2 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                      डिजिटल गेट पास (DIGITAL GATE PASS)
                    </h2>
                    <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                      टोकन संख्या: <strong className="text-slate-900 text-sm font-mono">{currentPass.token}</strong>
                    </p>
                  </div>

                  {/* QR Code Center */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
                    <QRCodeSvg value={currentPass.qrPayload} size={150} />
                    <span className="text-[10px] font-mono text-slate-500 mt-2 font-semibold">
                      सुरक्षित गेट पास सत्यापन क्यूआर (STOA Official QR)
                    </span>
                  </div>

                  {/* Details Table */}
                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-slate-500">वाहन संख्या:</span>
                      <VehiclePlate number={currentPass.vehicleNumber} size="sm" />
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">मालिक का नाम:</span>
                      <span className="font-semibold text-slate-900">{currentPass.ownerName}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">कंपनी / प्लांट:</span>
                      <span className="font-bold text-rose-700">{currentPass.companyName || currentPass.company}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">गंतव्य स्थान:</span>
                      <span className="font-bold text-slate-900">{currentPass.destination}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">वाहन क्षमता:</span>
                      <span className="font-mono font-bold text-slate-800">{currentPass.capacityTon} टन</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">जारी दिनांक व समय:</span>
                      <span className="font-mono text-slate-700">{currentPass.issueDate} | {currentPass.issueTime}</span>
                    </div>
                    {currentPass.driverName && (
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">चालक का नाम:</span>
                        <span className="font-semibold text-slate-900">{currentPass.driverName}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>प्रिंट अथवा साझा करें</span>
                    </button>

                    {currentPass.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => onRequestCancelSlip(currentPass)}
                        className="py-3 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Ban className="w-4 h-4 text-red-600" />
                        <span>पर्ची रद्द करें (Cancel Slip)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL: DIRECT GATE PASS GENERATOR */}
      {bookingProg && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col h-[90dvh] sm:h-auto sm:max-h-[88vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    गेट पास जनरेट करें (Book Loading Slip)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {bookingProg.company} &rarr; {bookingProg.destination}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingProg(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGenerateGatePass} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:px-6 space-y-3.5 text-xs">
                {/* Error Banner */}
                {bookingError && (
                  <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl text-red-900 space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="font-bold">{bookingError}</span>
                    </div>
                    {bookingErrorsList.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 text-[11px] text-red-800 pt-1">
                        {bookingErrorsList.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Program Summary Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">संयंत्र / कंपनी:</span>
                    <strong className="text-slate-900 font-bold">{bookingProg.company}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">गंतव्य स्थान:</span>
                    <strong className="text-rose-700 font-black">{bookingProg.destination}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">माल प्रकार:</span>
                    <strong className="text-slate-800">{bookingProg.cargo || 'COIL / RI'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">दर एवं अग्रिम:</span>
                    <strong className="text-emerald-700 font-mono font-black">
                      ₹{bookingProg.ratePerTon} / टन • {bookingProg.advancePercentage}% अग्रिम
                    </strong>
                  </div>
                </div>

                {/* Vehicle Verification Box */}
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                  <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    सत्यापित वाहन विवरण (Logged-in Vehicle):
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <VehiclePlate number={vehicle?.displayNumber || vehicle?.normalizedNumber || 'OD 15'} size="sm" />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        मालिक: {vehicle?.ownerName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">वर्तमान आवर्तन क्रम</span>
                      <span className="text-sm font-mono font-black text-rose-700">
                        #{vehicle?.serialNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Name Input */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    चालक का नाम (Driver Name - वैकल्पिक):
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="उदा. राजेश कुमार"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Notice text */}
                <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-600 leading-relaxed font-medium">
                  ℹ️ गेट पास जनरेट होते ही आधिकारिक डिजिटल टोकन संख्या एवं सत्यापन क्यूआर कोड जारी हो जाएगा। 15-टू-15 रोटेशन नियमानुसार गाड़ी का क्रम अंतिम स्थान पर अपडेट हो जाएगा।
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="p-3 sm:px-6 sm:py-3.5 border-t border-slate-200 flex gap-2 shrink-0 bg-slate-50 z-10">
                <button
                  type="button"
                  onClick={() => setBookingProg(null)}
                  className="flex-1 py-3 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-black text-xs shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>सत्यापन जारी है...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>✅ डिजिटल गेट पास जारी करें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
