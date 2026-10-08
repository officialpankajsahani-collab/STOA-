import React, { useState, useEffect } from 'react';
import { ParsedPukarNotice, ParsedPukarItem, Vehicle, GatePass } from '../../types/index.js';
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
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Printer,
  Sparkles,
  MapPin,
  Check,
  ChevronRight,
  Layers,
  Sun,
  Moon,
  Bell,
  RefreshCw,
} from 'lucide-react';

interface PukarScheduleViewerProps {
  notice?: ParsedPukarNotice;
  vehicle: Vehicle | null;
  onSlipGenerated: (pass: GatePass) => void;
}

export const PukarScheduleViewer: React.FC<PukarScheduleViewerProps> = ({
  notice,
  vehicle,
  onSlipGenerated,
}) => {
  const { t, language } = useLanguageTheme();
  const [selectedDateTab, setSelectedDateTab] = useState<'ALL' | 'TODAY' | 'TOMORROW'>('TODAY');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('ALL');

  // Automatic Shift Schedule (Morning 10:00 AM & Evening 04:00 PM)
  const [shiftSchedule, setShiftSchedule] = useState(() => calculateNextLoadingShift());

  useEffect(() => {
    const timer = setInterval(() => {
      setShiftSchedule(calculateNextLoadingShift());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Slip Booking Modal State
  const [bookingItem, setBookingItem] = useState<ParsedPukarItem | null>(null);
  const [serialInput, setSerialInput] = useState<string>(vehicle ? String(vehicle.serialNumber) : '');
  const [driverNameInput, setDriverNameInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingErrorsList, setBookingErrorsList] = useState<string[]>([]);
  const [generatedPass, setGeneratedPass] = useState<GatePass | null>(null);

  // When no loading program is active, display the official shift schedule algorithm card
  if (!notice || !notice.items || notice.items.length === 0) {
    const countdown = formatCountdown(shiftSchedule.timeRemainingSeconds);
    const nextShiftLabel =
      language === 'or'
        ? shiftSchedule.nextShiftLabelOr
        : language === 'en'
        ? shiftSchedule.nextShiftLabelEn
        : shiftSchedule.nextShiftLabelHi;

    return (
      <div className="bg-gradient-to-b from-white via-slate-50/50 to-white border-2 border-amber-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Top Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-mono">
                  {language === 'en' ? 'Shift Schedule Active' : language === 'or' ? 'ପାଳି ସମୟସାରଣୀ' : 'दैनिक पुकार समय सारिणी'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                {language === 'en'
                  ? 'No loading program is currently active'
                  : language === 'or'
                  ? 'ବର୍ତ୍ତମାନ କୌଣସି ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ସକ୍ରିୟ ନାହିଁ'
                  : 'वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है'}
              </h3>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded-xl border border-slate-200 self-start sm:self-auto font-bold">
            STOA Control Desk
          </span>
        </div>

        {/* Core Association Message requested by user */}
        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1.5 leading-relaxed">
          <p className="font-bold flex items-center gap-1.5 text-amber-900">
            <Radio className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
            <span>
              {language === 'en'
                ? 'Loading Pukar Program starts daily at 10:00 AM and 04:00 PM.'
                : language === 'or'
                ? 'ଆସୋସିଏସନର ଲୋଡିଂ ପୁକାର କାର୍ଯ୍ୟକ୍ରମ ପ୍ରତିଦିନ ସକାଳ ୧୦:୦୦ ଏବଂ ସନ୍ଧ୍ୟା ୦୪:୦୦ ରେ ଆରମ୍ଭ ହୁଏ।'
                : 'एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है।'}
            </span>
          </p>
          <p className="text-[11px] text-amber-800">
            {language === 'en'
              ? 'When the Pukar finishes, all previous loading slots are automatically cleared. A fresh program will be posted for the next shift.'
              : language === 'or'
              ? 'ପୁକାର ସରିବା ମାତ୍ରେ ପୂର୍ବର ସମସ୍ତ ଲୋଡିଂ କାର୍ଯ୍ୟକ୍ରମ ହଟାଇ ଦିଆଯାଏ ଏବଂ ପରବର୍ତ୍ତୀ ପାଳି ପାଇଁ ନୂତନ କାର୍ଯ୍ୟକ୍ରମ ପୋଷ୍ଟ କରାଯାଏ।'
              : 'पुकार खत्म होने पर सभी पुराना लोडिंग प्रोग्राम हटा दिया जाता है तथा अगली शिफ्ट के निर्धारित समय पर नया लोडिंग प्रोग्राम पोस्ट किया जाएगा।'}
          </p>
        </div>

        {/* 2 Daily Shift Blocks: Morning 10 AM & Evening 4 PM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Shift 1: Morning 10:00 AM */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-bold">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {language === 'en' ? 'Morning Shift' : language === 'or' ? 'ପ୍ରଥମ ପାଳି (ସକାଳ)' : 'प्रथम शिफ्ट (सुबह)'}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">10:00 AM</span>
              </div>
            </div>
            <span className="text-[10px] bg-orange-50 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
              {language === 'en' ? 'Shift 1' : 'शिफ्ट 1'}
            </span>
          </div>

          {/* Shift 2: Evening 04:00 PM */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                  {language === 'en' ? 'Evening Shift' : language === 'or' ? 'ଦ୍ୱିତୀୟ ପାଳି (ସନ୍ଧ୍ୟା)' : 'द्वितीय शिफ्ट (शाम)'}
                </span>
                <span className="text-sm font-black text-slate-900 font-mono">04:00 PM</span>
              </div>
            </div>
            <span className="text-[10px] bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
              {language === 'en' ? 'Shift 2' : 'शिफ्ट 2'}
            </span>
          </div>
        </div>

        {/* Live Countdown to Next Loading Program */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-mono font-bold block">
              {language === 'en' ? 'Next Scheduled Loading Program:' : language === 'or' ? 'ପରବର୍ତ୍ତୀ ନିର୍ଦ୍ଧାରିତ ଲୋଡିଂ ପୁକାର:' : 'अगला संभावित लोडिंग कार्यक्रम:'}
            </span>
            <p className="text-sm font-black text-white font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>{nextShiftLabel}</span>
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-1.5 font-mono text-center self-start sm:self-auto bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <div>
              <span className="text-base font-black text-amber-300 block leading-none">{countdown.hours}</span>
              <span className="text-[8px] text-slate-400 uppercase">घंटे</span>
            </div>
            <span className="text-amber-300 font-bold text-sm">:</span>
            <div>
              <span className="text-base font-black text-amber-300 block leading-none">{countdown.minutes}</span>
              <span className="text-[8px] text-slate-400 uppercase">मिनट</span>
            </div>
            <span className="text-amber-300 font-bold text-sm">:</span>
            <div>
              <span className="text-base font-black text-emerald-400 block leading-none animate-pulse">{countdown.seconds}</span>
              <span className="text-[8px] text-slate-400 uppercase">सेकंड</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filter items
  const filteredItems = notice.items.filter((item) => {
    const matchesDate = selectedDateTab === 'ALL' || item.dateSection === selectedDateTab;
    const matchesPlant = selectedPlantFilter === 'ALL' || item.plantSection.includes(selectedPlantFilter);
    return matchesDate && matchesPlant;
  });

  const handleOpenBookingModal = (item: ParsedPukarItem) => {
    setBookingItem(item);
    setSerialInput(vehicle ? String(vehicle.serialNumber) : '');
    setBookingError(null);
    setBookingErrorsList([]);
    setGeneratedPass(null);
  };

  const handleConfirmSlipBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingItem || !vehicle) return;

    setIsSubmitting(true);
    setBookingError(null);
    setBookingErrorsList([]);

    try {
      const res = await fetch('/api/loading/owner-slip-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: Number(serialInput),
          vehicleNumber: vehicle.normalizedNumber,
          pukarItemId: bookingItem.id,
          driverName: driverNameInput || 'Registered Driver',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setBookingError(data.error || 'पर्ची कटाई सत्यापन विफल');
        setBookingErrorsList(data.errors || []);
      } else {
        setGeneratedPass(data.gatePass);
        onSlipGenerated(data.gatePass);
      }
    } catch (err: any) {
      setBookingError(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider font-mono">
              📢 {language === 'en' ? 'Official Pukar Loading Schedule' : language === 'or' ? 'ସରକାରୀ ପୁକାର ଲୋଡିଂ କାର୍ଯ୍ୟକ୍ରମ' : 'आधिकारिक पुकार लोडिंग कार्यक्रम'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {notice.publishedAt?.slice(11, 16)} {language === 'en' ? 'Live' : language === 'or' ? 'ଲାଇଭ୍' : 'बजे लाइव'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
          {notice.title}
        </h3>

        {notice.cuttingRule && (
          <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-center gap-2 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold text-[11px]">{notice.cuttingRule}</span>
          </div>
        )}
      </div>

      {/* Date Switcher Tabs (TODAY vs TOMORROW) */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedDateTab('TODAY')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              selectedDateTab === 'TODAY'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3 text-rose-600" />
            {language === 'en' ? 'Today' : language === 'or' ? 'ଆଜିର ଲୋଡିଂ' : 'आज की लोडिंग'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateTab('TOMORROW')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              selectedDateTab === 'TOMORROW'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3 h-3 text-rose-600" />
            {language === 'en' ? 'Tomorrow' : language === 'or' ? 'ଆସନ୍ତାକାଲିର ଲୋଡିଂ' : 'कल की लोडिंग'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedDateTab('ALL')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
              selectedDateTab === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'en' ? 'All' : language === 'or' ? 'ସମସ୍ତ' : 'सभी'}
          </button>
        </div>

        {/* Plant Selector */}
        <select
          value={selectedPlantFilter}
          onChange={(e) => setSelectedPlantFilter(e.target.value)}
          className="bg-white border border-slate-300 text-slate-800 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="ALL">{language === 'en' ? 'All Plants' : language === 'or' ? 'ସମସ୍ତ ପ୍ଲାଣ୍ଟ୍' : 'सभी संयंत्र'}</option>
          <option value="SMELTER">SMELTER</option>
          <option value="BLUEFOX">FRP BLUEFOX</option>
          <option value="12 WHEELER">12 WHEELER</option>
        </select>
      </div>

      {/* Program Slots Cards Grid */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const remainingQuota = item.vehicleQuota - item.bookedCount;
          const isFull = remainingQuota <= 0;

          return (
            <div
              key={item.id}
              className={`p-3.5 bg-white border rounded-2xl text-xs transition-all ${
                isFull
                  ? 'border-slate-200 opacity-60 bg-slate-50'
                  : 'border-slate-200 hover:border-rose-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 font-mono border border-rose-200">
                      {item.plantSection}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.dateLabel}</span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    {item.destination}
                  </h4>
                </div>

                {/* Quota badge */}
                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      isFull ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isFull
                      ? (language === 'en' ? 'Quota Full' : language === 'or' ? 'କୋଟା ପୂର୍ଣ୍ଣ' : 'कोटा पूर्ण')
                      : `${remainingQuota} / ${item.vehicleQuota} ${language === 'en' ? 'Available' : language === 'or' ? 'ଖାଲି' : 'उपलब्ध'}`}
                  </span>
                  <span className="text-[10px] text-slate-600 block mt-0.5 font-mono font-bold">
                    {item.capacityMt} MT
                  </span>
                </div>
              </div>

              {/* Cargo & Line Details */}
              <div className="flex flex-wrap items-center justify-between text-slate-700 gap-1 pt-1.5 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{language === 'en' ? 'Cargo:' : language === 'or' ? 'ମାଲ୍:' : 'माल:'}</span>
                  <span className="font-semibold text-slate-900">{item.cargo}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{t('vehicleCategory')}:</span>
                  <span className="text-rose-700 font-medium">{item.categoryRequired}</span>
                </div>
              </div>

              {/* Special Remarks if any */}
              {item.remarks && (
                <div className="mt-1.5 p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-700 font-mono">
                  {language === 'en' ? 'Note:' : language === 'or' ? 'ଟିପ୍ପଣୀ:' : 'नोट:'} {item.remarks}
                </div>
              )}

              {/* Booking Button */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {t('fee')}: <strong className="text-slate-800 font-mono">₹{item.capacityMt > 18 ? 700 : 500}</strong>
                </span>

                <button
                  type="button"
                  disabled={isFull}
                  onClick={() => handleOpenBookingModal(item)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                    isFull
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-sm cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Book Slip' : language === 'or' ? 'ପର୍ଚି କାଟନ୍ତୁ' : 'पर्ची कटाएं'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLIP BOOKING MODAL */}
      {bookingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {language === 'en' ? 'Loading Slip Booking' : language === 'or' ? 'ଲୋଡିଂ ପର୍ଚି କଟାଣ' : 'लोडिंग पर्ची कटाई'}
                  </h3>
                  <p className="text-[11px] text-rose-700 font-semibold">{t('appSubtitle')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingItem(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {!generatedPass ? (
              <form onSubmit={handleConfirmSlipBooking} className="space-y-3.5 text-xs">
                {/* Selected Slot Summary Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-800">
                  <div className="flex justify-between items-center text-rose-700 font-bold">
                    <span className="text-xs">{bookingItem.plantSection}</span>
                    <span className="font-mono text-slate-700 text-[11px] px-2 py-0.5 rounded bg-white border border-slate-200">{bookingItem.dateLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('routeDestination')}:</span>
                    <span className="font-bold text-slate-900 text-sm">{bookingItem.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'en' ? 'Cargo:' : language === 'or' ? 'ମାଲ୍:' : 'माल प्रकार:'}</span>
                    <span className="font-medium">{bookingItem.cargo} ({bookingItem.capacityMt} MT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'en' ? 'Available Quota:' : language === 'or' ? 'ଉପଲବ୍ଧ କୋଟା:' : 'उपलब्ध कोटा:'}</span>
                    <span className="text-emerald-700 font-mono font-bold">
                      {bookingItem.vehicleQuota - bookingItem.bookedCount} {language === 'en' ? 'Slots Remaining' : language === 'or' ? 'ସ୍ଲଟ୍ ବାକି' : 'स्लॉट बाकी'}
                    </span>
                  </div>
                  {bookingItem.remarks && (
                    <div className="pt-1 text-[10px] text-slate-600 font-mono">
                      {language === 'en' ? 'Note:' : language === 'or' ? 'ଟିପ୍ପଣୀ:' : 'नोट:'} {bookingItem.remarks}
                    </div>
                  )}
                </div>

                {/* Owner Serial Number Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'en'
                      ? 'Enter Your Serial Number:'
                      : language === 'or'
                      ? 'ଆପଣଙ୍କ କ୍ରମିକ ସଂଖ୍ୟା ଦାଖଲ କରନ୍ତୁ:'
                      : 'अपना क्रम संख्या दर्ज करें:'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      placeholder="104"
                      className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-lg font-mono font-bold text-rose-700 placeholder-slate-400 tracking-wider focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                    />
                    <span className="absolute right-3.5 top-3.5 text-[11px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {t('serialNumber')}: #{vehicle?.serialNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {language === 'en'
                      ? 'Enter current serial number to verify rotation turn.'
                      : language === 'or'
                      ? 'ଆପଣଙ୍କ ଗାଡ଼ିର କ୍ରମିକ ସଂଖ୍ୟା ଯାଞ୍ଚ ପାଇଁ ଦାଖଲ କରନ୍ତୁ।'
                      : 'सत्यापन हेतु अपनी गाड़ी का वर्तमान सीरियल दर्ज करें।'}
                  </p>
                </div>

                {/* Vehicle Details Confirmation */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">{t('truckNo')}:</span>
                    <span className="font-mono font-bold text-slate-900">{vehicle?.displayNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('capacity')}:</span>
                    <span className="font-bold text-slate-900">{vehicle?.capacityTon} {t('capacityTon')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('membershipStatus')}:</span>
                    <span className="text-emerald-700 font-semibold">{t('valid')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t('fee')}:</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{bookingItem.capacityMt > 18 ? 700 : 500}
                    </span>
                  </div>
                </div>

                {/* Optional Driver Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'en' ? 'Driver Name (Optional):' : language === 'or' ? 'ଚାଳକଙ୍କ ନାମ (ଇଚ୍ଛାଧୀନ):' : 'चालक का नाम (वैकल्पिक):'}
                  </label>
                  <input
                    type="text"
                    value={driverNameInput}
                    onChange={(e) => setDriverNameInput(e.target.value)}
                    placeholder={language === 'en' ? 'e.g. Ranjan Bhoi' : 'उदा. रंजन भोई'}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                {/* Errors Display */}
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-red-700">
                      <AlertTriangle className="w-4 h-4 shrink-0" /> {language === 'en' ? 'Verification Failed:' : language === 'or' ? 'ଯାଞ୍ଚ ବିଫଳ:' : 'सत्यापन विफल:'}
                    </p>
                    <p className="pl-5 text-[11px]">{bookingError}</p>
                    {bookingErrorsList.map((err, idx) => (
                      <p key={idx} className="pl-5 text-[11px]">
                        &bull; {err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setBookingItem(null)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer transition-colors"
                  >
                    {t('cancel')}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting
                      ? (language === 'en' ? 'Processing...' : 'पर्ची काटी जा रही है...')
                      : (language === 'en' ? 'Confirm & Issue Slip' : language === 'or' ? 'ପର୍ଚି ନିଶ୍ଚିତ କରନ୍ତୁ' : 'पर्ची जारी करें')}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              /* Success Printable Gate Pass Receipt */
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">
                      {language === 'en' ? 'Loading slip booked successfully!' : language === 'or' ? 'ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ଲୋଡିଂ ପର୍ଚି କଟାଗଲା।' : 'बधाई! आपकी लोडिंग पर्ची कट गई है।'}
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      {language === 'en' ? 'New Rotation Serial:' : language === 'or' ? 'ନୂଆ କ୍ରମିକ ସଂଖ୍ୟା:' : 'नया रोटेशन क्रम संख्या:'} <strong className="text-slate-900 font-mono">#{generatedPass.nextSerial}</strong>
                    </p>
                  </div>
                </div>

                {/* Official Pass Slip on Clean White Paper */}
                <div className="bg-white text-slate-900 p-5 rounded-3xl shadow-lg border-2 border-slate-300 relative overflow-hidden">
                  <div className="text-center border-b border-slate-200 pb-3 mb-3 relative z-10">
                    <AssociationLogo size={48} showRing className="mx-auto mb-2" />
                    <span className="text-xs font-official font-bold text-rose-700 tracking-wider block">
                      {t('appSubtitle')}
                    </span>
                    <h4 className="text-base font-black text-slate-900 font-display tracking-wide uppercase">
                      {t('digitalGatePass')}
                    </h4>
                    <p className="text-[11px] font-mono font-bold text-slate-800 mt-0.5">
                      {t('token')}: <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{generatedPass.token}</span>
                    </p>
                  </div>

                  <div className="flex justify-center my-3 bg-slate-50 p-3 rounded-2xl w-fit mx-auto border border-slate-200 shadow-xs">
                    <QRCodeSvg value={generatedPass.qrPayload} size={120} />
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100 relative z-10">
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-slate-600 font-medium">{t('truckNo')}:</span>
                      <VehiclePlate number={generatedPass.vehicleNumber} size="sm" />
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 font-medium">{t('ownerName')}:</span>
                      <span className="font-semibold text-slate-900">{generatedPass.ownerName}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-600 font-medium">{t('companyName')}:</span>
                      <span className="font-bold text-slate-900">
                        {generatedPass.company} &rarr; {generatedPass.destination}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 items-center">
                      <span className="text-slate-600 font-medium">{t('currentSerial')}:</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        #{generatedPass.currentSerial} &rarr; #{generatedPass.nextSerial}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 items-center">
                      <span className="text-slate-600 font-medium">{t('fee')}:</span>
                      <span className="font-bold text-rose-700 font-mono text-sm tabular-nums">₹{generatedPass.paymentAmount}</span>
                    </div>
                    <div className="flex justify-between pt-2 items-center">
                      <span className="text-slate-600 font-medium">{t('paymentStatus')}:</span>
                      <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-lg text-[10px] font-mono">
                        {t('unpaid')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      {t('printPass')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingItem(null)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer hover:from-rose-500 hover:to-pink-500"
                    >
                      {language === 'en' ? 'Done' : language === 'or' ? 'ସମ୍ପୂର୍ଣ୍ଣ' : 'पूर्ण'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
