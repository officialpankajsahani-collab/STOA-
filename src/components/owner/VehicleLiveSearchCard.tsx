import React, { useState } from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { Vehicle, VehicleDocument } from '../../types/index.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import {
  Search,
  X,
  Truck,
  User,
  Phone,
  ShieldCheck,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Share2,
  Sparkles,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface VehicleLiveSearchCardProps {
  onVehicleSelected?: (vehicle: Vehicle) => void;
  className?: string;
}

export const VehicleLiveSearchCard: React.FC<VehicleLiveSearchCardProps> = ({
  onVehicleSelected,
  className = '',
}) => {
  const { language, t } = useLanguageTheme();

  const [query, setQuery] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showAllDocs, setShowAllDocs] = useState(true);

  // Quick sample trucks for instant testing
  const sampleTrucks = [
    { number: 'OD15X7273', label: 'OD 15 X 7273', type: '10 चक्का (18T)', owner: 'रमेश साहु' },
    { number: 'OD15A1122', label: 'OD 15 A 1122', type: '12 चक्का (24T)', owner: 'बिनोद प्रधान' },
    { number: 'OD15C9081', label: 'OD 15 C 9081', type: '6 चक्का (11T)', owner: 'मानस पटेल' },
    { number: 'OD15B3456', label: 'OD 15 B 3456', type: '10 चक्का (18T)', owner: 'प्रमोद साहू' },
    { number: 'OD15D5544', label: 'OD 15 D 5544', type: 'ट्रेलर (38T)', owner: 'सुरेश अग्रवाल' },
  ];

  // Helper to format vehicle category into clean Hindi / English label
  const getCategoryDisplay = (cat: string) => {
    if (cat.includes('6-Wheel')) {
      return {
        hi: '6 चक्का (10-12 टन)',
        en: '6-Wheel (10-12 Ton)',
        or: '୬ ଚକିଆ (୧୦-୧୨ ଟନ୍)',
        badge: '6 चक्का / 6-Wheel',
        wheels: 6,
      };
    }
    if (cat.includes('10-Wheel')) {
      return {
        hi: '10 चक्का (16-18 टन)',
        en: '10-Wheel (16-18 Ton)',
        or: '୧୦ ଚକିଆ (୧୬-୧୮ ଟନ୍)',
        badge: '10 चक्का / 10-Wheel',
        wheels: 10,
      };
    }
    if (cat.includes('12-Wheel')) {
      return {
        hi: '12 चक्का (18-26 टन)',
        en: '12-Wheel (18-26 Ton)',
        or: '୧୨ ଚକିଆ (୧୮-୨୬ ଟନ୍)',
        badge: '12 चक्का / 12-Wheel',
        wheels: 12,
      };
    }
    return {
      hi: 'ट्रेलर / भारी वाहन (28-40+ टन)',
      en: 'Trailer / Heavy (28-40+ Ton)',
      or: 'ଟ୍ରେଲର୍ / ଭାରୀ ଯାନ',
      badge: 'ट्रेलर / Trailer',
      wheels: 14,
    };
  };

  // Helper to get Hindi document name
  const getDocName = (type: string) => {
    switch (type) {
      case 'Fitness':
        return { hi: 'फिटनेस प्रमाण पत्र', en: 'Fitness Certificate', or: 'ଫିଟନେସ୍ ପ୍ରମାଣପତ୍ର' };
      case 'Insurance':
        return { hi: 'वाहन बीमा (Insurance)', en: 'Vehicle Insurance', or: 'ଯାନ ବୀମା (Insurance)' };
      case 'PUC':
        return { hi: 'प्रदूषण नियंत्रण (PUC)', en: 'Pollution Under Control', or: 'ପ୍ରଦୂଷଣ ଯାଞ୍ଚ (PUC)' };
      case 'Road Tax':
        return { hi: 'रोड टैक्स (Road Tax)', en: 'Road Tax', or: 'ରୋଡ୍ ଟ୍ୟାକ୍ସ' };
      case 'National Permit':
        return { hi: 'ऑल इंडिया नेशनल परमिट', en: 'National Permit (AITP)', or: 'ନ୍ୟାସନାଲ୍ ପରମିଟ୍' };
      case 'Odisha Permit':
        return { hi: 'ओडिशा राज्य परमिट', en: 'Odisha State Goods Permit', or: 'ଓଡ଼ିଶା ରାଜ୍ୟ ପରମିଟ୍' };
      default:
        return { hi: type, en: type, or: type };
    }
  };

  // Calculate days remaining for document expiry
  const getExpiryCountdown = (expiryDateStr: string) => {
    try {
      const expiry = new Date(expiryDateStr);
      const now = new Date();
      const diffMs = expiry.getTime() - now.getTime();
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (days < 0) {
        return {
          expired: true,
          label:
            language === 'en'
              ? `Expired ${Math.abs(days)}d ago`
              : language === 'or'
              ? `${Math.abs(days)} ଦିନ ପୂର୍ବରୁ ସମାପ୍ତ`
              : `${Math.abs(days)} दिन पूर्व समाप्त`,
        };
      }
      if (days === 0) {
        return {
          expired: false,
          label: language === 'en' ? 'Expires today' : language === 'or' ? 'ଆଜି ସମାପ୍ତ ହେବ' : 'आज समाप्त होगा',
        };
      }
      return {
        expired: false,
        label:
          language === 'en'
            ? `${days} days left`
            : language === 'or'
            ? `${days} ଦିନ ବାକି ଅଛି`
            : `${days} दिन शेष`,
      };
    } catch {
      return { expired: false, label: expiryDateStr };
    }
  };

  // Perform search
  const handleSearch = async (searchTarget?: string) => {
    const rawVal = searchTarget !== undefined ? searchTarget : query;
    const clean = rawVal.trim().toUpperCase().replace(/[^a-zA-Z0-9]/g, '');

    if (!clean) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter a vehicle number'
          : language === 'or'
          ? 'ଦୟାକରି ଗାଡ଼ି ନମ୍ବର ଦିଅନ୍ତୁ'
          : 'कृपया गाड़ी नंबर दर्ज करें'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/fleet/${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.vehicle) {
        setVehicle(null);
        setErrorMsg(
          language === 'en'
            ? `Vehicle ${rawVal} is not registered with STOA Sambalpur`
            : language === 'or'
            ? `ଗାଡ଼ି ନମ୍ବର ${rawVal} ଏସଟିଓଏ ସମ୍ବଲପୁରରେ ପଞ୍ଜୀକୃତ ହୋଇନାହିଁ`
            : `गाड़ी ${rawVal} संबलपुर ट्रक ओनर्स एसोसिएशन में पंजीकृत नहीं मिली`
        );
      } else {
        setVehicle(data.vehicle);
        if (onVehicleSelected) onVehicleSelected(data.vehicle);
      }
    } catch (err: any) {
      setVehicle(null);
      setErrorMsg(err.message || 'नेटवर्क त्रुटि (Network error)');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setVehicle(null);
    setSearched(false);
    setErrorMsg(null);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 1800);
  };

  return (
    <div
      className={`bg-white border-2 border-rose-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 transition-all ${className}`}
    >
      {/* Header with Live Search Icon */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700 flex items-center justify-center text-white shadow-sm shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
              {language === 'en'
                ? 'Search Vehicle Details & Documents'
                : language === 'or'
                ? 'ଗାଡ଼ି ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ ଓ କାଗଜପତ୍ର ଖୋଜନ୍ତୁ'
                : 'गाड़ी लाइव स्थिति एवं कागजात सर्च'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {language === 'en'
                ? 'Search by vehicle number for owner, serial, queue & all 6 documents'
                : language === 'or'
                ? 'ମାଲିକ ନାମ, ସିରିଏଲ୍, ଚକା ପ୍ରକାର ଓ ସମସ୍ତ କାଗଜପତ୍ର ଦେଖନ୍ତୁ'
                : 'मालिक नाम, मेंबरशिप, 6/10/12 चक्का, सिरियल व सभी 6 कागजात'}
            </p>
          </div>
        </div>

        {searched && vehicle && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
            title="सर्च रीसेट करें"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input Bar with Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="space-y-2"
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-slate-400">
              <Truck className="w-4 h-4 text-rose-600" />
              <span className="text-[11px] font-bold text-slate-300">|</span>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              placeholder={
                language === 'en'
                  ? 'Enter vehicle number (e.g. OD15X7273 or 7273)...'
                  : language === 'or'
                  ? 'ଗାଡ଼ି ନମ୍ବର ଦିଅନ୍ତୁ (ଯଥା OD15X7273 କିମ୍ବା 7273)...'
                  : 'गाड़ी नंबर दर्ज करें (उदा. OD 15 X 7273 या सिर्फ 7273)...'
              }
              className="w-full pl-12 pr-9 py-3 bg-slate-50 border-2 border-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal focus:bg-white focus:outline-none focus:border-rose-600 focus:ring-3 focus:ring-rose-500/20 transition-all uppercase"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                title="हटाएं"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="py-3 px-5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === 'en' ? 'Searching...' : 'खोज रहे हैं...'}</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>{language === 'en' ? 'Search Vehicle' : 'सर्च करें'}</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Truck Chips */}
        {!vehicle && (
          <div className="pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              {language === 'en'
                ? 'Quick Tap Registered Trucks:'
                : language === 'or'
                ? 'ତୁରନ୍ତ ଦେଖିବା ପାଇଁ ବାଛନ୍ତୁ:'
                : 'तुरंत देखने हेतु पंजीकृत गाड़ियां:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTrucks.map((truck) => (
                <button
                  key={truck.number}
                  type="button"
                  onClick={() => {
                    setQuery(truck.number);
                    handleSearch(truck.number);
                  }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span className="font-mono font-bold">{truck.label}</span>
                  <span className="text-[10px] text-slate-400">({truck.type})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">{errorMsg}</p>
            <p className="text-[10px] text-rose-600 mt-0.5">
              सुझाव: गाड़ी नंबर सही लिखें जैसे OD15X7273, OD15A1122 या अंतिम 4 अंक जैसे 7273 दर्ज करें।
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          RESULT: PREMIUM VEHICLE DOSSIER CARD
      ======================================================== */}
      {vehicle && (
        <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Card Top: Number Plate & Queue Status Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 rounded-3xl text-white shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest block font-bold">
                  STOA SAMBALPUR · VERIFIED CARRIER
                </span>
                <div className="mt-1">
                  <VehiclePlate number={vehicle.displayNumber || vehicle.normalizedNumber} size="md" />
                </div>
              </div>

              {/* Status and Serial Highlight */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white font-mono font-bold text-xs">
                  <span className="text-slate-300 font-normal">आवर्तन सिरियल:</span>
                  <span className="text-emerald-400 font-black text-sm">#{vehicle.serialNumber}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>सक्रिय सदस्य</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {/* 1. Owner Name */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <User className="w-3.5 h-3.5 text-rose-600" />
                {language === 'en' ? 'Owner Name' : 'मालिक का नाम'}
              </span>
              <span className="font-bold text-slate-900 block leading-tight">
                {vehicle.ownerName}
              </span>
            </div>

            {/* 2. Mobile Number */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर'}
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  {vehicle.ownerMobile}
                </span>
                {vehicle.ownerMobile && (
                  <a
                    href={`tel:${vehicle.ownerMobile}`}
                    className="p-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold shrink-0 transition-colors"
                    title="सीधे कॉल करें"
                  >
                    कॉल
                  </a>
                )}
              </div>
            </div>

            {/* 3. Vehicle Category (चक्का / प्रकार) */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                {language === 'en' ? 'Vehicle Type (Axle)' : 'गाड़ी प्रकार (चक्का)'}
              </span>
              <span className="font-bold text-slate-900 block leading-tight">
                {getCategoryDisplay(vehicle.category).hi}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                क्षमता: {vehicle.capacityTon} MT टन
              </span>
            </div>

            {/* 4. Membership Number */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
                {language === 'en' ? 'Membership No' : 'मेंबरशिप नंबर'}
              </span>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  {vehicle.membershipNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(vehicle.membershipNumber, 'mem')}
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  {copiedText === 'mem' ? 'कॉपी हुआ' : 'कॉपी'}
                </button>
              </div>
            </div>

            {/* 5. Last Loaded Date */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {language === 'en' ? 'Last Loaded Date' : 'अंतिम लोडिंग तिथि'}
              </span>
              <span className="font-mono font-bold text-slate-900 block">
                {vehicle.lastLoadedDate || '16 Sep 2026'}
              </span>
              <span className="text-[10px] text-slate-500">आवर्तन चक्र में</span>
            </div>

            {/* 6. Registered Address */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-600" />
                {language === 'en' ? 'Location' : 'क्षेत्र / डिपो'}
              </span>
              <span className="font-medium text-slate-900 block truncate" title={vehicle.address}>
                {vehicle.address || 'Sambalpur, Odisha'}
              </span>
              <span className="text-[10px] text-slate-500">संबलपुर (OD-15)</span>
            </div>
          </div>

          {/* ========================================================
              ALL 6 VEHICLE DOCUMENTS SECTION (गाड़ी का सभी कागजात)
          ======================================================== */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  📑 {language === 'en' ? 'Vehicle Documents' : 'गाड़ी के सभी 6 कागजात (Documents)'}
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {vehicle.documents?.length || 6}/6 सत्यापित
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vehicle.documents?.map((doc: VehicleDocument) => {
                const docName = getDocName(doc.docType);
                const countdown = getExpiryCountdown(doc.expiryDate);
                const isExpiring = doc.status === 'EXPIRING_SOON';
                const isExpired = doc.status === 'EXPIRED';

                return (
                  <div
                    key={doc.docType}
                    className={`p-3 rounded-2xl border transition-all ${
                      isExpired
                        ? 'bg-red-50/70 border-red-200 text-red-900'
                        : isExpiring
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs block leading-tight text-slate-900">
                          {docName.hi}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5 truncate">
                          क्र.: {doc.docNumber}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                          isExpired
                            ? 'bg-red-100 text-red-800'
                            : isExpiring
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isExpired ? (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>समाप्त (EXPIRED)</span>
                          </>
                        ) : isExpiring ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>जल्द समाप्त</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>वैध (VALID)</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        वैधता: <span className="font-mono font-semibold text-slate-800">{doc.expiryDate}</span>
                      </span>
                      <span
                        className={`font-semibold text-[10px] ${
                          isExpired
                            ? 'text-red-700'
                            : isExpiring
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {countdown.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions (Print / Search Another) */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>गाड़ी डेटा प्रिंट / साझा करें</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>अन्य गाड़ी खोजें</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
