import React, { useState, useRef } from 'react';
import { useLogo } from '../../context/LogoContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import {
  Upload,
  Link,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Download,
  AlertCircle,
  Eye,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

interface LogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({
  isOpen,
  onClose,
  adminName = 'Admin',
}) => {
  const { logoUrl, isCustom, uploadLogo, setCustomUrl, resetLogo } = useLogo();
  const { t, language } = useLanguageTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [urlInput, setUrlInput] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        type: 'error',
        text: language === 'en'
          ? 'Please select a valid image file (PNG, JPG, SVG, WebP).'
          : language === 'or'
          ? 'ଦୟାକରି କେବଳ ବୈଧ ଫଟୋ (PNG, JPG, SVG, WebP) ବାଛନ୍ତୁ।'
          : 'कृपया केवल मान्य छवि (PNG, JPG, SVG, WebP) चुनें।',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewDataUrl(event.target?.result as string);
      setStatusMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async () => {
    if (!fileInputRef.current?.files?.[0] && !previewDataUrl) {
      setStatusMessage({
        type: 'error',
        text: language === 'en'
          ? 'Please choose an image file first.'
          : language === 'or'
          ? 'ଦୟାକରି ପ୍ରଥମେ ଗୋଟିଏ ଫଟୋ ବାଛନ୍ତୁ।'
          : 'कृपया पहले एक छवि फ़ाइल चुनें।',
      });
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    setIsProcessing(true);
    setStatusMessage(null);

    try {
      if (file) {
        const res = await uploadLogo(file, adminName);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: language === 'en'
              ? 'Logo successfully updated and saved across all portals!'
              : language === 'or'
              ? 'ଲୋଗୋ ସଫଳତାର ସହ ଅଦ୍ୟତନ ହେଲା ଓ ସବୁ ପୋର୍ଟାଲ୍‌ରେ ଲାଗୁ ହେଲା!'
              : 'लोगो सफलतापूर्वक अपडेट हो गया और सभी पोर्टल्स में लागू हो गया!',
          });
          setPreviewDataUrl(null);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'अपलोड विफल' });
        }
      } else if (previewDataUrl) {
        const res = await setCustomUrl(previewDataUrl, adminName);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: language === 'en'
              ? 'Logo successfully saved!'
              : language === 'or'
              ? 'ଲୋଗୋ ସଫଳତାର ସହ ସାଇତା ଗଲା!'
              : 'लोगो सफलतापूर्वक सहेज लिया गया!',
          });
          setPreviewDataUrl(null);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'सहेजना विफल' });
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!urlInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: language === 'en'
          ? 'Please enter an image URL.'
          : language === 'or'
          ? 'ଦୟାକରି ଇମେଜ୍ URL ପ୍ରବେଶ କରନ୍ତୁ।'
          : 'कृपया एक छवि URL दर्ज करें।',
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await setCustomUrl(urlInput.trim(), adminName);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'New logo URL saved and applied!'
            : language === 'or'
            ? 'ନୂଆ ଲୋଗୋ URL ସଫଳତାର ସହ ପ୍ରୟୋଗ ହେଲା!'
            : 'नया लोगो URL सफलतापूर्वक सहेज लिया गया!',
        });
        setUrlInput('');
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'सहेजना विफल' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDefault = async () => {
    const confirmText = language === 'en'
      ? 'Reset to original Sambalpur Truck Owner\'s Association official emblem?'
      : language === 'or'
      ? 'ସମ୍ବଲପୁର ଟ୍ରକ୍ ମାଲିକ ସଂଘର ମୂଳ ଅଫିସିଆଲ୍ ଲୋଗୋକୁ ଫେରିବାକୁ ଚାହାଁନ୍ତି କି?'
      : 'क्या आप संबलपुर ट्रक ओनर्स एसोसिएशन के मूल आधिकारिक एम्बलम पर वापस लौटना चाहते हैं?';

    if (!window.confirm(confirmText)) return;

    setIsProcessing(true);
    setStatusMessage(null);
    setPreviewDataUrl(null);

    try {
      const res = await resetLogo(adminName);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'Reset to official emblem complete!'
            : language === 'or'
            ? 'ମୂଳ ଅଫିସିଆଲ୍ ଲୋଗୋ ପୁନଃସ୍ଥାପିତ ହେଲା!'
            : 'मूल आधिकारिक लोगो सफलतापूर्वक पुनर्स्थापित हो गया!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'रीसेट विफल' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 text-slate-900 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                {language === 'en'
                  ? 'Association Logo & Branding Manager'
                  : language === 'or'
                  ? 'ସଂଘ ଲୋଗୋ ଓ ବ୍ରାଣ୍ଡିଂ ନିୟନ୍ତ୍ରଣ'
                  : 'एसोसिएशन लोगो व ब्रांडिंग प्रबंधक'}
              </h2>
              <p className="text-xs text-rose-700 font-medium">
                {language === 'en'
                  ? 'Change, edit or upload the official logo anytime'
                  : language === 'or'
                  ? 'ଯେକୌଣସି ସମୟରେ ଲୋଗୋ ବଦଳାନ୍ତୁ ବା ଅପଲୋଡ୍ କରନ୍ତୁ'
                  : 'एडमिन किसी भी समय नया लोगो अपलोड या बदल सकते हैं'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-2xl text-xs flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
        )}

        {/* Current Active Logo Section */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <AssociationLogo size={92} showRing />
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-200 text-emerald-600">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {language === 'en'
                    ? "Sambalpur Truck Owner's Association"
                    : language === 'or'
                    ? 'ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ'
                    : 'संबलपुर ट्रक ओनर्स एसोसिएशन'}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    isCustom
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isCustom
                    ? (language === 'en' ? 'Custom Logo Active' : language === 'or' ? 'କଷ୍ଟମ୍ ଲୋଗୋ ସକ୍ରିୟ' : 'कस्टम लोगो सक्रिय')
                    : (language === 'en' ? 'Official Emblem (Default)' : language === 'or' ? 'ଅଫିସିଆଲ୍ ଏମ୍ବ୍ଲେମ୍ (ଡିଫଲ୍ଟ)' : 'मूल आधिकारिक एम्बलम')}
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {language === 'en'
                  ? 'This logo automatically reflects on the Top Header, Login Screen, Gate Passes, Driver App and Admin Room.'
                  : language === 'or'
                  ? 'ଏହି ଲୋଗୋ ଟପ୍ ହେଡର୍, ଲଗଇନ୍ ପରଦା, ଗେଟ୍ ପାସ୍ ଓ ଆଡମିନ୍ ରୁମ୍‌ରେ ସ୍ୱୟଂକ୍ରିୟ ଭାବେ ଦେଖାଯାଏ।'
                  : 'यह लोगो हेडर, लॉगिन स्क्रीन, डिजिटल गेट पास, ड्राइवर ऐप और एडमिन रूम में तुरंत दिखाई देता है।'}
              </p>

              {isCustom && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  disabled={isProcessing}
                  className="mt-2.5 text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1.5 cursor-pointer hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {language === 'en'
                      ? 'Restore Default Official STOA Emblem'
                      : language === 'or'
                      ? 'ମୂଳ ଅଫିସିଆଲ୍ ଏମ୍ବ୍ଲେମ୍ ପୁନଃସ୍ଥାପନ କରନ୍ତୁ'
                      : 'मूल आधिकारिक STOA एम्बलम पर वापस रीसेट करें'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Live Scale Previews */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              {language === 'en' ? 'Live Size Previews:' : language === 'or' ? 'ଲାଇଭ୍ ସାଇଜ୍ ପ୍ରିଭ୍ୟୁ:' : 'लाइव साइज़ पूर्वावलोकन:'}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" title="Header (32px)">
                <AssociationLogo size={32} />
                <span className="text-[10px] font-mono">32px</span>
              </div>
              <div className="flex items-center gap-1.5" title="Gatepass (44px)">
                <AssociationLogo size={44} />
                <span className="text-[10px] font-mono">44px</span>
              </div>
              <div className="flex items-center gap-1.5" title="Card (56px)">
                <AssociationLogo size={56} />
                <span className="text-[10px] font-mono">56px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change / Upload Options Tabs */}
        <div className="mt-5">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('UPLOAD');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'UPLOAD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {language === 'en' ? 'Upload Image File' : language === 'or' ? 'ଫାଇଲ୍ ଅପଲୋଡ୍ କରନ୍ତୁ' : 'फ़ोटो फ़ाइल अपलोड करें'}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('URL');
                setStatusMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === 'URL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              {language === 'en' ? 'Direct Image URL' : language === 'or' ? 'ଇମେଜ୍ URL ଦିଅନ୍ତୁ' : 'सीधा इमेज URL दर्ज करें'}
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'UPLOAD' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="stoa-logo-file-input"
              />

              <label
                htmlFor="stoa-logo-file-input"
                className="border-2 border-dashed border-slate-300 hover:border-rose-500 hover:bg-rose-50/30 transition-all rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-600 flex items-center justify-center transition-colors mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {language === 'en'
                    ? 'Click to browse or drop new logo image'
                    : language === 'or'
                    ? 'ନୂଆ ଲୋଗୋ ଫଟୋ ବାଛିବା ପାଇଁ ଏଠାରେ କ୍ଲିକ୍ କରନ୍ତୁ'
                    : 'नया लोगो चुनने के लिए यहाँ क्लिक करें'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  PNG, JPG, SVG, WebP (स्वतः गोल आकार में फिट होगा)
                </span>
              </label>

              {/* Upload Preview if selected */}
              {previewDataUrl && (
                <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={previewDataUrl}
                      alt="New Logo Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        {language === 'en' ? 'New Logo Selected' : language === 'or' ? 'ନୂଆ ଲୋଗୋ ବଛାଗଲା' : 'नई लोगो छवि चुनी गई'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {language === 'en' ? 'Ready to apply system-wide' : language === 'or' ? 'ଲାଗୁ କରିବାକୁ ପ୍ରସ୍ତୁତ' : 'सिस्टम में लागू करने के लिए तैयार'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewDataUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveUpload}
                disabled={isProcessing || (!fileInputRef.current?.files?.[0] && !previewDataUrl)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <span>{language === 'en' ? 'Saving Logo...' : language === 'or' ? 'ସାଇତା ହେଉଛି...' : 'सहेजा जा रहा है...'}</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === 'en'
                        ? 'Save & Set as Official Logo'
                        : language === 'or'
                        ? 'ସାଇତନ୍ତୁ ଓ ଅଫିସିଆଲ୍ ଲୋଗୋ କରନ୍ତୁ'
                        : 'सहेजें व आधिकारिक लोगो के रूप में सेट करें'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Image URL */}
          {activeTab === 'URL' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {language === 'en' ? 'Image Web URL' : language === 'or' ? 'ଇମେଜ୍ ୱେବ୍ URL' : 'छवि वेब URL'}:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/stoa-logo.png"
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {urlInput && (
                    <div className="w-9 h-9 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      <img src={urlInput} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={isProcessing || !urlInput.trim()}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <span>{language === 'en' ? 'Saving URL...' : language === 'or' ? 'ସାଇତା ହେଉଛି...' : 'सहेजा जा रहा है...'}</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>
                      {language === 'en'
                        ? 'Save Logo URL'
                        : language === 'or'
                        ? 'ଲୋଗୋ URL ସାଇତନ୍ତୁ'
                        : 'लोगो URL सहेजें'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
          >
            {t('close', 'बंद करें')}
          </button>
        </div>
      </div>
    </div>
  );
};
