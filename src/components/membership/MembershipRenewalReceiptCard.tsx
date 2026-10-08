import React, { useRef } from 'react';
import { MembershipRenewalReceipt } from '../../types/index.js';
import { StoaEmblemSvg } from '../common/StoaEmblemSvg.js';
import { MaaSamaleswariCrest } from '../common/MaaSamaleswariCrest.js';
import { Printer, Download, Share2, Copy, Check, ShieldCheck } from 'lucide-react';

interface MembershipRenewalReceiptCardProps {
  receipt: MembershipRenewalReceipt;
  showActions?: boolean;
  onPrint?: () => void;
  className?: string;
}

export const MembershipRenewalReceiptCard: React.FC<MembershipRenewalReceiptCardProps> = ({
  receipt,
  showActions = true,
  onPrint,
  className = '',
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const handleCopyDetails = () => {
    const text = `संस्था: सम्बलपुर ट्रक ओनर्स एसोसिएशन (STOA)
सदस्यता नवीनीकरण रसीद सं.: ${receipt.receiptNumber}
दिनांक: ${receipt.dateFormatted}
मालिक का नाम: ${receipt.ownerName}
गाड़ी नंबर: ${receipt.displayNumber}
सदस्यता सं.: ${receipt.membershipNumber}
नवीनीकरण वर्ष: ${receipt.renewalYear}
शुल्क राशि: ₹${receipt.feeAmount}/- (${receipt.feeInWords})
वैधता अवधि: ${receipt.newExpiryDate}
संपर्क: 9437056834 | stoa.sbp@gmail.com`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `*SAMBALPUR TRUCK OWNERS' ASSOCIATION (STOA)*%0A*सदस्यता नवीनीकरण रसीद सं.:* ${receipt.receiptNumber}%0A*दिनांक:* ${receipt.dateFormatted}%0A*मालिक:* ${receipt.ownerName}%0A*गाड़ी नंबर:* ${receipt.displayNumber}%0A*सदस्यता सं.:* ${receipt.membershipNumber}%0A*वर्ष:* ${receipt.renewalYear}%0A*शुल्क:* ₹${receipt.feeAmount}/- (${receipt.feeInWords})%0A*नई वैधता:* ${receipt.newExpiryDate}%0A%0A_H.O. Transport Nagar, NH-53, Sambalpur - 768006 (Odisha)_`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Action Bar (Hidden when printing) */}
      {showActions && (
        <div className="print:hidden flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white p-3 rounded-2xl shadow-sm text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              आधिकारिक सदस्यता नवीनीकरण रसीद #{receipt.receiptNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `/api/membership/receipt/${receipt.receiptNumber}/pdf`;
                link.download = `STOA_Renewal_Receipt_${receipt.receiptNumber}_${(receipt.displayNumber || receipt.vehicleNumber).replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              title="असली अपलोड किए गए फोटो जैसा आधिकारिक PDF डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF डाउनलोड करें</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              title="रसीद प्रिंट करें या ब्राउज़र से सेव करें"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट करें</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              title="व्हाट्सएप पर शेयर करें"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>व्हाट्सएप</span>
            </button>

            <button
              type="button"
              onClick={handleCopyDetails}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              title="विवरण कॉपी करें"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हो गया' : 'कॉपी'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 
        ACTUAL PRINTABLE OFFICIAL RECEIPT SLIP
        Faithfully matches the uploaded photograph (IMG_20260920_211353.jpg)
      */}
      <div
        ref={receiptRef}
        id="stoa-official-membership-receipt"
        className="relative w-full max-w-[800px] mx-auto bg-[#FFFDF9] border-2 border-[#8B1E3F]/40 rounded-2xl shadow-xl overflow-hidden font-sans text-slate-900 select-none print:shadow-none print:border print:border-black print:rounded-none print:m-0 print:w-full print:max-w-none"
        style={{
          boxShadow: '0 10px 30px -5px rgba(123, 17, 45, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Top Decorative Chevron Border Pattern */}
        <div
          className="h-2 w-full"
          style={{
            backgroundColor: '#5A081E',
            backgroundImage:
              'repeating-linear-gradient(45deg, #7B112D 0, #7B112D 6px, #5A081E 6px, #5A081E 12px)',
          }}
        />

        {/* 1. OFFICIAL TOP HEADER BANNER (Maroon Background, Yellow Title, White Subtitles, Dual Logos) */}
        <div className="relative px-3 sm:px-6 py-3.5 sm:py-4 bg-[#7B112D] text-white flex items-center justify-between gap-2 border-b-2 border-[#5A081E]">
          {/* Left: STOA Circular Truck Emblem */}
          <div className="shrink-0 flex items-center justify-center p-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-xs shadow-inner">
            <StoaEmblemSvg size={68} className="drop-shadow-md sm:w-[76px] sm:h-[76px] w-[54px] h-[54px]" />
          </div>

          {/* Center: Title & Association Details */}
          <div className="text-center flex-1 px-1 sm:px-2">
            <h1
              className="text-base sm:text-2xl font-black tracking-wide text-[#FFE500] uppercase font-sans leading-none drop-shadow-sm"
              style={{
                fontFamily: "'Arial Black', 'Impact', 'Trebuchet MS', sans-serif",
                letterSpacing: '0.04em',
              }}
            >
              SAMBALPUR TRUCK OWNERS' ASSOCIATION
            </h1>
            <p className="text-[10px] sm:text-xs text-white font-medium mt-1 leading-tight sm:leading-snug">
              H.O.: Transport Nagar, N.H. 53, SAMBALPUR - 768006 (ODISHA)
            </p>
            <p className="text-[9.5px] sm:text-[11.5px] text-white font-medium leading-tight sm:leading-snug">
              CONTACT NO. 9437056834, Regd. No. 7238/237 of 1973/74
            </p>
            <p className="text-[9.5px] sm:text-[11px] text-white/95 font-medium tracking-wide">
              E-mail ID : stoa.sbp@gmail.com
            </p>
          </div>

          {/* Right: Sacred Maa Samaleswari / Sambalpur Divine Crest */}
          <div className="shrink-0 flex items-center justify-center p-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-xs shadow-inner">
            <MaaSamaleswariCrest size={64} className="drop-shadow-md sm:w-[72px] sm:h-[72px] w-[50px] h-[50px]" />
          </div>
        </div>

        {/* 2. RECEIPT TITLE & BODY (With Realistic Truck Watermark) */}
        <div className="relative p-4 sm:p-7 bg-[#FFFDF9] min-h-[340px]">
          {/* Faded Heavy Freight Truck Watermark Silhouette */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.09]"
            style={{ zIndex: 0 }}
          >
            <svg viewBox="0 0 800 500" className="w-[85%] max-w-[650px] text-slate-800 fill-current">
              {/* Truck Cabin & Cargo Profile Silhouette */}
              <path d="M 80 340 L 80 180 C 80 160, 100 140, 130 140 L 360 140 C 370 140, 380 150, 385 160 L 420 220 C 425 230, 435 240, 450 240 L 740 240 C 755 240, 770 255, 770 270 L 770 340 Z" />
              <rect x="390" y="160" width="350" height="170" rx="10" />
              {/* Wheels */}
              <circle cx="160" cy="350" r="45" />
              <circle cx="160" cy="350" r="25" fill="#FFFDF9" />
              <circle cx="280" cy="350" r="45" />
              <circle cx="280" cy="350" r="25" fill="#FFFDF9" />
              <circle cx="560" cy="350" r="45" />
              <circle cx="560" cy="350" r="25" fill="#FFFDF9" />
              <circle cx="680" cy="350" r="45" />
              <circle cx="680" cy="350" r="25" fill="#FFFDF9" />
              {/* Grille & Windshield */}
              <rect x="110" y="160" width="100" height="60" rx="6" fill="#FFFDF9" />
              <rect x="230" y="160" width="120" height="60" rx="6" fill="#FFFDF9" />
            </svg>
          </div>

          {/* Cursive Title "Receipt" (as in uploaded physical document) */}
          <div className="relative text-center mb-4 sm:mb-6" style={{ zIndex: 1 }}>
            <span
              className="text-3xl sm:text-5xl text-[#1E293B] italic font-normal tracking-wide inline-block"
              style={{
                fontFamily: "'Great Vibes', 'Brush Script MT', 'Dancing Script', 'Segoe Script', cursive",
                textShadow: '0 1px 2px rgba(0,0,0,0.06)',
              }}
            >
              Receipt
            </span>
          </div>

          {/* 3. DOTTED UNDERLINE FIELD ROWS (With Official Bold Details) */}
          <div className="relative space-y-3.5 sm:space-y-4 text-xs sm:text-sm text-slate-800" style={{ zIndex: 1 }}>
            {/* ROW 1: Receipt No & Date */}
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline flex-1 min-w-0">
                <span className="font-semibold text-slate-700 whitespace-nowrap">No ....................</span>
                <span className="font-mono font-black text-base sm:text-lg text-slate-950 px-2 tracking-widest bg-amber-50/60 border-b-2 border-dotted border-slate-600 min-w-[70px] text-center inline-block">
                  {receipt.receiptNumber}
                </span>
                <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 hidden sm:inline">
                  ...........................................................................
                </span>
              </div>

              <div className="flex items-baseline">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Date ..................</span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-950 px-2 tracking-wider border-b-2 border-dotted border-slate-600 whitespace-nowrap bg-amber-50/60 inline-block">
                  {receipt.dateFormatted}
                </span>
              </div>
            </div>

            {/* ROW 2: Received with thanks from */}
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">Received with thanks from</span>
              <span className="text-slate-400 hidden sm:inline">................</span>
              <span className="font-bold text-xs sm:text-sm text-slate-950 uppercase px-2 tracking-wide border-b-2 border-dotted border-slate-600 flex-1 bg-amber-50/60">
                {receipt.ownerName}
              </span>
              <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap hidden sm:inline">
                ............................................................
              </span>
            </div>

            {/* ROW 3: the sum of Rupees */}
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">the sum of Rupees</span>
              <span className="text-slate-400 hidden sm:inline">................</span>
              <span className="font-bold text-xs sm:text-sm text-slate-950 uppercase px-2 tracking-wide border-b-2 border-dotted border-slate-600 flex-1 bg-amber-50/60">
                {receipt.feeInWords}
              </span>
              <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap hidden sm:inline">
                ............................................................
              </span>
            </div>

            {/* ROW 4: Membership No & Vehicle No */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2.5 sm:gap-4">
              <div className="flex items-baseline flex-1 min-w-0">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Membership No ........</span>
                <span className="font-mono font-black text-xs sm:text-sm text-slate-950 px-2 tracking-wider border-b-2 border-dotted border-slate-600 bg-amber-50/60 min-w-[100px] text-center inline-block">
                  {receipt.membershipNumber}
                </span>
                <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 hidden sm:inline">
                  ....................
                </span>
              </div>

              <div className="flex items-baseline flex-1 min-w-0">
                <span className="font-semibold text-slate-700 whitespace-nowrap">Vehicle No ........</span>
                <span className="font-mono font-black text-sm sm:text-base text-slate-950 px-2.5 tracking-wider border-b-2 border-dotted border-slate-600 bg-amber-50/60 min-w-[120px] text-center inline-block">
                  {receipt.displayNumber}
                </span>
                <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 hidden sm:inline">
                  ....................
                </span>
              </div>
            </div>

            {/* ROW 5: towards Renewal Fee for the year */}
            <div className="flex items-baseline gap-1">
              <span className="font-semibold text-slate-700 whitespace-nowrap">
                towards Renewal Fee for the year
              </span>
              <span className="text-slate-400 hidden sm:inline">................................</span>
              <span className="font-mono font-black text-xs sm:text-sm text-slate-950 px-3 tracking-wider border-b-2 border-dotted border-slate-600 bg-amber-50/60 min-w-[90px] text-center inline-block">
                {receipt.renewalYear}
              </span>
              <span className="text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap flex-1 hidden sm:inline">
                ...........................................................................
              </span>
            </div>
          </div>

          {/* 4. FOOTER: AMOUNT CAPSULE PILL (Left) & AUTHORIZED SIGNATORY (Right) */}
          <div className="relative pt-6 sm:pt-8 mt-4 sm:mt-6 flex items-end justify-between gap-3 border-t border-slate-200/60" style={{ zIndex: 1 }}>
            {/* Bottom Left: Rounded Cyan/Teal Rupee Pill Capsule */}
            <div className="relative flex flex-col items-start gap-1">
              {/* Rubber Stamp Overlay (Authentic angled stamp like in physical receipt) */}
              <div
                className="absolute -top-5 left-12 transform -rotate-12 pointer-events-none select-none font-mono font-bold text-xs text-sky-700/80 tracking-widest px-2 py-0.5 rounded border border-sky-400/40"
                style={{ fontFamily: "'Courier New', Courier, monospace" }}
              >
                STOA #{receipt.receiptNumber}
              </div>

              <div className="inline-flex items-center gap-2.5 bg-[#BAE6FD]/80 border-2 border-[#0284C7] px-4 py-1.5 rounded-full shadow-xs">
                {/* Circular Dark Blue Badge with White Rupee Sign */}
                <div className="w-8 h-8 rounded-full bg-[#0369A1] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                  ₹
                </div>
                {/* Amount in Bold numerals with /- suffix */}
                <span className="font-mono font-black text-lg sm:text-xl text-slate-950 tracking-wide pr-1">
                  {receipt.feeAmount}/-
                </span>
              </div>

              {/* Validity & Renewal Count info badges */}
              <div className="flex flex-col gap-0.5 pl-2">
                <span className="text-[10px] text-slate-600 font-medium">
                  वैधता: <strong className="text-emerald-800">{receipt.newExpiryDate}</strong> तक मान्य
                </span>
                <span className="text-[9.5px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                  सुरक्षित नवीनीकरण रिकॉर्ड: #{receipt.renewalCountForVehicle || 1} बार नवीनीकृत
                </span>
              </div>
            </div>

            {/* Bottom Right: Association Signatory */}
            <div className="text-right">
              {/* Authentic Digital Signature in Blue Ballpoint Ink */}
              <div className="inline-block mb-1 pr-2">
                <svg viewBox="0 0 160 45" className="w-24 sm:w-28 h-7 text-blue-700 stroke-current fill-none stroke-[2.2] -rotate-3">
                  <path d="M 10 32 C 25 15, 30 5, 45 22 C 60 38, 55 12, 70 20 C 85 28, 95 10, 110 30 C 120 40, 135 15, 150 25" />
                  <path d="M 20 38 L 135 32" strokeWidth="1.5" strokeDasharray="3,2" />
                </svg>
              </div>

              <p className="text-[10.5px] sm:text-xs font-bold text-slate-800 tracking-tight leading-tight">
                For <strong className="text-[#7B112D]">Sambalpur Truck Owner's Association</strong>
              </p>
              <span className="text-[9.5px] text-slate-500 block">
                अधिकृत हस्ताक्षरकर्ता (Authorized Signatory)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Chevron Strip */}
        <div
          className="h-2 w-full"
          style={{
            backgroundColor: '#5A081E',
            backgroundImage:
              'repeating-linear-gradient(45deg, #7B112D 0, #7B112D 6px, #5A081E 6px, #5A081E 12px)',
          }}
        />
      </div>

      {/* Helper text under receipt card */}
      <p className="text-[11px] text-center text-slate-500 print:hidden">
        🔒 यह संबलपुर ट्रक ओनर्स एसोसिएशन (पंजीयन सं. 7238/237) द्वारा जारी वैध कम्प्यूटरीकृत सदस्यता नवीनीकरण प्रमाणपत्र है।
      </p>
    </div>
  );
};
