import React, { useState, useRef } from 'react';
import { useSponsor, SponsorConfig } from '../../context/SponsorContext.js';
import { StoaSponsorBanner } from '../common/StoaSponsorBanner.js';
import {
  Award,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  RotateCcw,
  Sparkles,
  Truck,
  Image as ImageIcon,
  Save,
  Check,
  ShieldCheck,
  Sliders,
  Type,
  FileImage,
} from 'lucide-react';

export const SponsorManagerPanel: React.FC = () => {
  const {
    config,
    toggleSponsor,
    updateConfig,
    uploadLogoFile,
    resetLogoToOriginal,
    resetAllToDefault,
  } = useSponsor();

  const [formData, setFormData] = useState<SponsorConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if external update
  React.useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleInputChange = (field: keyof SponsorConfig, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    updateConfig({ [field]: value });
    showSaveIndicator();
  };

  const showSaveIndicator = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadLogoFile(file);
      if (res.success) {
        showSaveIndicator();
      } else {
        setUploadError(res.error || 'अपलोड में त्रुटि हुई');
      }
    } catch (err: any) {
      setUploadError(err.message || 'फ़ाइल अपलोड विफल');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              प्रायोजक प्रबंधन नियंत्रण (Sponsor Manager)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            स्पॉन्सर बैनर को कभी भी चालू/बंद करें, नया टेक्स्ट लिखें, और कंपनी फोटो/लोगो अपलोड करें।
          </p>
        </div>

        {/* Global ON / OFF Master Switch */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <span className="text-xs font-bold text-slate-700">
            {config.isEnabled ? (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                बैनर चालू है (VISIBLE)
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                बैनर हटाया गया (HIDDEN)
              </span>
            )}
          </span>

          <button
            type="button"
            onClick={() => {
              toggleSponsor();
              showSaveIndicator();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs ${
              config.isEnabled
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {config.isEnabled ? 'हटाएं (Turn OFF)' : 'लगाएं (Turn ON)'}
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✓ परिवर्तन तुरंत ऐप और सभी स्क्रीनों पर सुरक्षित कर दिए गए हैं!</span>
        </div>
      )}

      {/* Error Notification */}
      {uploadError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 1. REAL-TIME LIVE PREVIEW OF THE SPONSOR STRIP */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Eye className="w-4 h-4 text-amber-500" />
            लाइव प्रीव्यू (Live Real-time Preview in App)
          </span>
          <span className="text-[11px] text-slate-500">ऊंचाई: 88px (मोबाइल कॉम्पैक्ट)</span>
        </div>

        {/* The Live Banner Component */}
        <div className="p-3 bg-slate-100/70 rounded-2xl border border-slate-200 overflow-hidden">
          {config.isEnabled ? (
            <StoaSponsorBanner showFooter={false} className="my-0" />
          ) : (
            <div className="h-[88px] rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-500 text-xs font-semibold">
              🚫 स्पॉन्सर बैनर वर्तमान में हटाया गया है (ऐप पर नहीं दिखेगा)
            </div>
          )}
        </div>
      </div>

      {/* 2. TEXT EDITING SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Type className="w-4 h-4 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900">
            स्पॉन्सर टेक्स्ट संपादन (Edit Sponsor Text)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Main Sponsor Name */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              मुख्य स्पॉन्सर नाम (Main Sponsor Name):
            </label>
            <input
              type="text"
              value={formData.sponsorName}
              onChange={(e) => handleInputChange('sponsorName', e.target.value)}
              placeholder="उदा. Aaditya Ratan Group"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              संपर्क व्यक्ति / प्रतिनिधि (Contact Person):
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="उदा. (Pankaj Sahani)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Association Title */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              संस्था का नाम (Association Title):
            </label>
            <input
              type="text"
              value={formData.associationTitle}
              onChange={(e) => handleInputChange('associationTitle', e.target.value)}
              placeholder="उदा. संबलपुर STOA"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* System Title */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              प्रणाली शीर्षक (System Title):
            </label>
            <input
              type="text"
              value={formData.systemTitle}
              onChange={(e) => handleInputChange('systemTitle', e.target.value)}
              placeholder="उदा. 15-टू-15 आवर्तन"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Subtitle / Year */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              उप-शीर्षक (Subtitle / Version):
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleInputChange('subtitle', e.target.value)}
              placeholder="उदा. NextGen 2026"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Sponsor Label */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              स्पॉन्सर लेबल (Sponsor Label):
            </label>
            <input
              type="text"
              value={formData.sponsorLabel}
              onChange={(e) => handleInputChange('sponsorLabel', e.target.value)}
              placeholder="उदा. Sponsors:"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-rose-600"
            />
          </div>

          {/* Footer Text */}
          <div className="sm:col-span-2">
            <label className="block text-slate-700 font-bold mb-1">
              निचला फ़ूटर टेक्स्ट (Footer Text):
            </label>
            <input
              type="text"
              value={formData.footerText}
              onChange={(e) => handleInputChange('footerText', e.target.value)}
              placeholder="उदा. संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) • 15-टू-15 आवर्तन प्रणाली"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-rose-600"
            />
          </div>
        </div>
      </div>

      {/* 3. LOGO & PHOTO / FILE UPLOAD SECTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileImage className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              कंपनी लोगो / फोटो फ़ाइल अपलोड (Logo & Photo Upload)
            </h3>
          </div>

          {config.logoType === 'custom' && (
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              कस्टम फोटो सक्रिय
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Current Logo Display */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-slate-500 font-semibold mb-2">वर्तमान लोगो (Active Logo):</span>
            <div className="w-24 h-18 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shadow-xs">
              {config.logoType === 'custom' && config.customLogoUrl ? (
                <img
                  src={config.customLogoUrl}
                  alt="Custom Sponsor Logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <span className="text-[11px] font-black text-rose-600 block">AADITYA</span>
                  <span className="text-[8px] font-bold text-slate-900 block font-mono">RATAN GROUP</span>
                  <span className="text-[7px] text-emerald-700 font-bold block">LOGISTICS</span>
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {config.logoType === 'custom' ? 'कस्टम अपलोड की गई फोटो' : 'मूल Aaditya Ratan Group लोगो'}
            </p>
          </div>

          {/* Upload Controls */}
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="sponsor-logo-upload"
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'फ़ाइल अपलोड हो रही है...' : 'नया फोटो / लोगो फ़ाइल चुनें'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetLogoToOriginal();
                showSaveIndicator();
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>मूल Aaditya Ratan Group लोगो रीसेट करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. VISUAL TOGGLES (TRUCK & ANIMATION) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Sliders className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900">
            विजुअल एवं एनिमेशन विकल्प (Visual & Animation Options)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Toggle Truck Graphic */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-rose-600" />
              <div>
                <p className="font-bold text-slate-900">🚛 ट्रक ग्राफिक दिखाएं</p>
                <p className="text-[10px] text-slate-500">बैनर में बाईं ओर ट्रक ग्राफिक शामिल करें</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleInputChange('truckGraphicEnabled', !formData.truckGraphicEnabled);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                formData.truckGraphicEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Toggle Animation */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <p className="font-bold text-slate-900">✨ गोल्ड शाइन एनिमेशन</p>
                <p className="text-[10px] text-slate-500">हल्का सुनहरी रोशनी का पारगमन व हेडलाइट चमक</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                handleInputChange('animationEnabled', !formData.animationEnabled);
              }}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                formData.animationEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Reset All Settings to Default */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('क्या आप सभी स्पॉन्सर सेटिंग्स को मूल डिफ़ॉल्ट पर रीसेट करना चाहते हैं?')) {
                resetAllToDefault();
                showSaveIndicator();
              }
            }}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline cursor-pointer"
          >
            सभी स्पॉन्सर सेटिंग्स रीसेट करें
          </button>
        </div>
      </div>
    </div>
  );
};
