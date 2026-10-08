import React, { useState, useEffect } from 'react';
import { ParsedPukarNotice } from '../../types/index.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  Sparkles,
  Radio,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Layers,
  Truck,
  RotateCcw,
  Trash2,
} from 'lucide-react';

const SAMPLE_RAW_NOTICE = `ALUMINIUM PUKAR PROGRAM FOR TODAY AT 4 PM

TODAY LOADING DT. 16/12/25
SMELTER
BELUR 18MT 03 VEHICLES RI,

FRP BLUEFOX
BHIWANDI + TALOJA 18MT 01 VEHICLE COIL/SHEET 2 POINT.
MAUDA 10 VEHICLE COIL.
18MT 04 VEHICLES 
16MT 06 VEHICLES.
KANPUR 16MT 01 VEHICLE COIL/SHEET.
TALOJA 16MT 01 VEHICLES COIL/SHEET 2 POINT.
BELUR 16MT 04 VEHICLES COIL.
BANGALORE 16MT  01  VEHICLE COIL/SHEET 2 POINT.

TOMORROW LOADING DT. 17/12/25
SMELTER 
BELUR 18MT 02 VEHICLES
01 VEHICLE RI
01 VEHICLE COIL.

TALOJA VIA RAIPUR 16MT 04 VEHICLES RI, CHALLAN CHANGE WILL BE HELD AT RAIPUR.


12 WHEELER PROGRAMME 

TODAY LOADING 
FRP BLUEFOX
HOWRAH 25MT 01 VEHICLE COIL.


TODAY LOADING 
ALL  PROGRAM,
&
TOMORROW LOADING 
BELUR COIL,
FIRST ROUND CUTTING SECOND ROUND PENDING.`;

export const PukarRawNoticePublisher: React.FC<{
  currentNotice?: ParsedPukarNotice;
  onPublished: (notice: ParsedPukarNotice) => void;
}> = ({ currentNotice, onPublished }) => {
  const { t, language } = useLanguageTheme();
  const [rawText, setRawText] = useState(SAMPLE_RAW_NOTICE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [publishedNotice, setPublishedNotice] = useState<ParsedPukarNotice | undefined>(currentNotice);

  useEffect(() => {
    setPublishedNotice(currentNotice);
  }, [currentNotice]);

  const handleClearNoticeInstantly = async () => {
    setPublishedNotice(undefined);
    setStatusMessage({
      type: 'success',
      text: '🗑️ संपूर्ण लोडिंग प्रोग्राम और पुकार नोटिस तुरंत एकबार में डिलीट कर दिया गया!',
    });
    try {
      await fetch('/api/loading/programs-clear-all', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'Admin Control Room' }),
      });
      onPublished({
        id: '',
        title: '',
        rawText: '',
        publishedAt: '',
        publishedBy: '',
        active: false,
        items: [],
      });
    } catch (e: any) {
      console.error('Delete notice error:', e);
    }
  };

  const handleParseAndPublish = async () => {
    if (!rawText.trim()) return;
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/pukar/ai-parse-publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText,
          actor: 'Admin Control Room (Dhanupali)',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatusMessage({
          type: 'error',
          text: data.error || (language === 'en' ? 'AI notice analysis failed. Please try again.' : language === 'or' ? 'ଏଆଇ ନୋଟିସ୍ ବିଶ୍ଳେଷଣ ବିଫଳ ହେଲା। ଦୟାକରି ପୁନଃ ଚେଷ୍ଟା କରନ୍ତୁ।' : 'एआई नोटिस विश्लेषण में विफल। कृपया पुनः प्रयास करें।'),
        });
      } else {
        setPublishedNotice(data.notice);
        onPublished(data.notice);
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? `🎉 ${data.notice.title} parsed successfully! ${data.notice.items.length} loading slots are now live.`
            : language === 'or'
            ? `🎉 ${data.notice.title} ସଫଳତାର ସହ ବିଶ୍ଳେଷଣ ହେଲା! ମୋଟ ${data.notice.items.length} ଟି ସ୍ଲଟ୍ ସକ୍ରିୟ ହୋଇ ଲାଇଭ୍ ହୋଇଛି।`
            : `🎉 ${data.notice.title} सफलतापूर्वक विश्लेषित हो गया! कुल ${data.notice.items.length} लोडिंग स्लॉट्स सक्रिय होकर ओनर इंटरफेस में लाइव प्रसारित हो चुके हैं।`,
        });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || (language === 'en' ? 'Network error' : language === 'or' ? 'ନେଟୱାର୍କ ତ୍ରୁଟି' : 'नेटवर्क त्रुटि') });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700 text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 font-display">
              {language === 'en' ? '⚡ AI One-Click Pukar Notice Publisher' : language === 'or' ? '⚡ ଏଆଇ ୧-କ୍ଲିକ୍ ପୁକାର ଲୋଡିଂ ନୋଟିସ୍ ପୋଷ୍ଟ' : '⚡ AI 1-क्लिक पुकार लोडिंग प्रोग्राम पोस्ट करें'}
            </h3>
            <p className="text-xs text-slate-600 font-official font-medium mt-0.5 leading-relaxed">
              {language === 'en'
                ? 'Paste raw notice text — AI automatically parses today/tomorrow plants, destinations, and quotas for truck owners.'
                : language === 'or'
                ? 'କଞ୍ଚା ନୋଟିସ୍ ଟେକ୍ସଟ୍ ପେଷ୍ଟ କରନ୍ତୁ — ଏଆଇ ସ୍ୱୟଂକ୍ରିୟ ଭାବରେ ଆଜି/ଆସନ୍ତାକାଲିର ପ୍ଲାଣ୍ଟ୍, ଗନ୍ତବ୍ୟ ଓ କୋଟା ଅଲଗା କରି ଲାଇଭ୍ ପର୍ଚି ସକ୍ରିୟ କରିବ।'
                : 'कच्चा नोटिस टेक्स्ट पेस्ट करें — AI स्वतः टुडे/टुमॉरो प्लांट्स, डेस्टिनेशन और कोटा को अलग-अलग करके ओनर्स के लिए लाइव पर्ची सिस्टम सक्रिय कर देगा।'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setRawText(SAMPLE_RAW_NOTICE)}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold self-start sm:self-auto cursor-pointer transition-all"
        >
          {language === 'en' ? '✨ Fill Sample Notice' : language === 'or' ? '✨ ନମୁନା ନୋଟିସ୍ ଭରନ୍ତୁ' : '✨ आधिकारिक फॉर्मेट नमूना भरें'}
        </button>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <label className="font-semibold">{language === 'en' ? 'Raw Notice Text:' : language === 'or' ? 'ପୁକାର ନୋଟିସ୍ କଞ୍ଚା ଟେକ୍ସଟ୍:' : 'पुकार नोटिस कच्चा टेक्स्ट:'}</label>
          <span className="text-[11px] text-slate-500 font-medium">{language === 'en' ? 'Smart AI Slot Extraction' : language === 'or' ? 'ସ୍ମାର୍ଟ ଏଆଇ ପାର୍ସିଂ' : 'स्मार्ट AI पार्सिंग'}</span>
        </div>
        <textarea
          rows={11}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="ALUMINIUM PUKAR PROGRAM FOR TODAY AT 4 PM..."
          className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 font-mono text-xs text-slate-900 leading-relaxed placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
        />
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">{statusMessage.text}</p>
        </div>
      )}

      {/* Broadcast Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-[11px] text-slate-500">
          {language === 'en'
            ? 'Once published, live Pukar quota and Book Slip buttons will activate instantly in owner apps.'
            : language === 'or'
            ? 'ପୋଷ୍ଟ କରିବା କ୍ଷଣି ସମସ୍ତ ଗାଡ଼ି ମାଲିକଙ୍କ ମୋବାଇଲ୍ ଆପ୍‌ରେ ଲାଇଭ୍ ପୁକାର, କୋଟା ଓ ପର୍ଚି ବଟନ୍ ସକ୍ରିୟ ହୋଇଯିବ।'
            : 'पोस्ट करते ही सभी ट्रक मालिकों के मोबाइल ऐप पर लाइव पुकार, कोटा और पर्ची बुकिंग बटन चालू हो जाएगा।'}
        </div>
        <button
          type="button"
          onClick={handleParseAndPublish}
          disabled={isProcessing || !rawText.trim()}
          className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
        >
          {isProcessing ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>{language === 'en' ? 'AI Analyzing & Broadcasting...' : language === 'or' ? 'ଏଆଇ ବିଶ୍ଳେଷଣ ଚାଲିଛି...' : 'AI विश्लेषण एवं प्रसारण जारी...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{language === 'en' ? 'AI Parse & Publish Live Notice' : language === 'or' ? 'ଏଆଇ ବିଶ୍ଳେଷଣ କରି ଲାଇଭ୍ ପୋଷ୍ଟ କରନ୍ତୁ' : 'AI द्वारा विश्लेषण करें एवं लाइव पोस्ट करें'}</span>
            </>
          )}
        </button>
      </div>

      {/* Live Active Preview Summary */}
      {publishedNotice && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'en' ? 'Currently Broadcasted Live Notice:' : language === 'or' ? 'ବର୍ତ୍ତମାନ ଲାଇଭ୍ ଥିବା ପୁକାର:' : 'वर्तमान में लाइव प्रसारित पुकार:'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-rose-700 font-mono font-bold bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                {publishedNotice.items.length} {language === 'en' ? 'Active Slots' : language === 'or' ? 'ସକ୍ରିୟ ସ୍ଲଟ୍' : 'स्लॉट सक्रिय'}
              </span>
              <button
                type="button"
                onClick={handleClearNoticeInstantly}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                title="यह नोटिस व सभी स्लॉट्स तुरंत डिलीट करें"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>तुरंत पूरा प्रोग्राम हटाएं</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="text-sm font-display">{publishedNotice.title}</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {publishedNotice.publishedAt?.slice(11, 16)} {language === 'en' ? 'hrs' : language === 'or' ? 'ସମୟ' : 'बजे'}
              </span>
            </div>
            {publishedNotice.cuttingRule && (
              <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                {language === 'en' ? 'Cutting Rule: ' : language === 'or' ? 'କଟିଂ ନିୟମ: ' : 'कटिंग नियम: '}
                {publishedNotice.cuttingRule}
              </p>
            )}

            {/* Quick breakdown badges */}
            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
              {publishedNotice.items.slice(0, 6).map((item) => (
                <span
                  key={item.id}
                  className="bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-mono text-[10px]"
                >
                  {item.plantSection} &rarr; {item.destination} ({item.capacityMt}T, {item.vehicleQuota} {language === 'en' ? 'Trucks' : language === 'or' ? 'ଗାଡ଼ି' : 'गाड़ियां'})
                </span>
              ))}
              {publishedNotice.items.length > 6 && (
                <span className="text-slate-500 text-[10px] self-center">
                  +{publishedNotice.items.length - 6} {language === 'en' ? 'more slots...' : language === 'or' ? 'ଅଧିକ ସ୍ଲଟ୍...' : 'अन्य स्लॉट्स...'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
