import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguageTheme, Language } from '../../context/LanguageThemeContext.js';
import { OwnerUser, Vehicle } from '../../types/index.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import {
  X,
  Camera,
  Trash2,
  Check,
  Globe,
  User,
  Phone,
  Truck,
  ShieldCheck,
  AlertCircle,
  Save,
  Sparkles,
} from 'lucide-react';

interface OwnerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onProfileUpdated?: (updatedVehicle?: Vehicle) => void;
}

export const OwnerSettingsModal: React.FC<OwnerSettingsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onProfileUpdated,
}) => {
  const { user, updateOwnerProfile } = useAuth();
  const ownerUser = user as OwnerUser;
  const { language, setLanguage, t } = useLanguageTheme();

  const [ownerName, setOwnerName] = useState(ownerUser?.ownerName || vehicle?.ownerName || '');
  const [mobile, setMobile] = useState(ownerUser?.mobile || vehicle?.ownerMobile || '');
  const [photoUrl, setPhotoUrl] = useState<string>(ownerUser?.photoUrl || vehicle?.photoUrl || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if modal is reopened
  React.useEffect(() => {
    if (isOpen) {
      setOwnerName(ownerUser?.ownerName || vehicle?.ownerName || '');
      setMobile(ownerUser?.mobile || vehicle?.ownerMobile || '');
      setPhotoUrl(ownerUser?.photoUrl || vehicle?.photoUrl || '');
      setErrorMsg(null);
      setSaveSuccess(false);
    }
  }, [isOpen, ownerUser, vehicle]);

  if (!isOpen) return null;

  // Handle Photo File Upload & Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB raw)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(
        language === 'en'
          ? 'Image size should be less than 5MB'
          : language === 'or'
          ? 'ଫଟୋ ଆକାର ୫MB ରୁ କମ୍ ହେବା ଉଚିତ୍'
          : 'फोटो का आकार 5MB से कम होना चाहिए'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(compressedDataUrl);
          setErrorMsg(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate Name
    if (!ownerName.trim()) {
      setErrorMsg(
        language === 'en'
          ? 'Owner name is required'
          : language === 'or'
          ? 'ମାଲିକ ନାମ ଆବଶ୍ୟକ'
          : 'मालिक का नाम दर्ज करना आवश्यक है'
      );
      return;
    }

    // Validate Mobile (10 digits)
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMsg(
        language === 'en'
          ? 'Please enter a valid 10-digit mobile number'
          : language === 'or'
          ? 'ଦୟାକରି ୧୦-ଅଙ୍କ ବିଶିଷ୍ଟ ବୈଧ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ'
          : 'कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें'
      );
      return;
    }

    setSaving(true);
    try {
      const res = await updateOwnerProfile({
        ownerName: ownerName.trim(),
        mobile: cleanMobile,
        photoUrl: photoUrl,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'प्रोफ़ाइल सहेजने में विफल');
        setSaving(false);
        return;
      }

      setSaveSuccess(true);
      if (onProfileUpdated && vehicle) {
        onProfileUpdated({
          ...vehicle,
          ownerName: ownerName.trim(),
          ownerMobile: cleanMobile,
          photoUrl: photoUrl,
        });
      }

      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'नेटवर्क त्रुटि');
    } finally {
      setSaving(false);
    }
  };

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'hi', label: 'हिन्दी', native: 'Hindi' },
    { code: 'en', label: 'English', native: 'English' },
    { code: 'or', label: 'ଓଡ଼ିଆ', native: 'Odia' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-white to-pink-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {language === 'en'
                  ? 'Settings & Profile'
                  : language === 'or'
                  ? 'ସେଟିଂସ୍ ଓ ପ୍ରୋଫାଇଲ୍'
                  : 'सेटिंग्स एवं प्रोफाइल'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {language === 'en'
                  ? 'Language, Owner Name, Mobile & Photo'
                  : language === 'or'
                  ? 'ଭାଷା, ମାଲିକ ନାମ, ମୋବାଇଲ୍ ଓ ଫଟୋ'
                  : 'भाषा, मालिक नाम, मोबाइल नंबर और फोटो'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'en'
                  ? 'Settings and Profile updated successfully!'
                  : language === 'or'
                  ? 'ସେଟିଂସ୍ ଓ ପ୍ରୋଫାଇଲ୍ ସଫଳତାର ସହ ଅଦ୍ୟତନ ହେଲା!'
                  : 'सेटिंग्स एवं प्रोफाइल सफलतापूर्वक अपडेट हो गई!'}
              </span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: LANGUAGE SWITCHER */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-rose-600" />
                <span>
                  {language === 'en'
                    ? 'App Language'
                    : language === 'or'
                    ? 'ଆପ୍ ଭାଷା ଚୟନ'
                    : 'ऐप भाषा (Language)'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'en'
                  ? 'Instant Switch'
                  : language === 'or'
                  ? 'ତୁରନ୍ତ ପରିବର୍ତ୍ତନ'
                  : 'तुरंत बदलाव'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {languages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-xs">{l.label}</span>
                    <span className={`text-[10px] font-normal ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                      {l.native}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: PROFILE PHOTO UPLOADER */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-rose-600" />
              <span>
                {language === 'en'
                  ? 'Profile Photo'
                  : language === 'or'
                  ? 'ପ୍ରୋଫାଇଲ୍ ଫଟୋ'
                  : 'प्रोफाइल फोटो (Profile Photo)'}
              </span>
            </label>

            <div className="flex items-center gap-4">
              {/* Photo Avatar Preview */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Owner Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-2xl">
                      {ownerName?.trim()?.[0]?.toUpperCase() || 'T'}
                    </div>
                  )}
                </div>

                {/* Edit Icon Badge */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md ring-2 ring-white cursor-pointer transition-transform hover:scale-110"
                  title="फोटो अपलोड करें"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Photo Actions & Info */}
              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>
                      {photoUrl
                        ? language === 'en'
                          ? 'Change'
                          : language === 'or'
                          ? 'ବଦଳାନ୍ତୁ'
                          : 'फोटो बदलें'
                        : language === 'en'
                        ? 'Upload Photo'
                        : language === 'or'
                        ? 'ଫଟୋ ଅପଲୋଡ୍'
                        : 'फोटो लगाएं'}
                    </span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-2.5 py-1.5 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="फोटो हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Remove' : language === 'or' ? 'ହଟାନ୍ତୁ' : 'हटाएं'}</span>
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight">
                  {language === 'en'
                    ? 'JPG, PNG or WEBP format. Compressed automatically.'
                    : language === 'or'
                    ? 'JPG, PNG କିମ୍ବା WEBP ଫର୍ମାଟ୍।'
                    : 'गैलरी या कैमरे से सीधे फोटो चुनें। अपने आप ऑप्टिमाइज़ होगा।'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: OWNER DETAILS EDIT */}
          <div className="space-y-3.5">
            {/* Owner Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  {language === 'en'
                    ? 'Owner Name'
                    : language === 'or'
                    ? 'ମାଲିକଙ୍କ ନାମ'
                    : 'मालिक का नाम (Owner Name)'}
                </span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="उदा. रमेश कुमार साहु (Ramesh Sahu)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                required
              />
            </div>

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-rose-600" />
                <span>
                  {language === 'en'
                    ? 'Mobile Number'
                    : language === 'or'
                    ? 'ମୋବାଇଲ୍ ନମ୍ବର'
                    : 'मोबाइल नंबर (Mobile Number)'}
                </span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9861012345"
                  className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'en'
                  ? 'Used for SMS, loading pukar notifications & OTP verification.'
                  : language === 'or'
                  ? 'SMS, ପୁକାର ନୋଟିସ୍ ଓ OTP ଯାଞ୍ଚ ପାଇଁ ବ୍ୟବହୃତ।'
                  : 'पुकार अलर्ट, लोडिंग सूचना व सुरक्षा सत्यापन हेतु उपयोग होता है।'}
              </p>
            </div>

            {/* Vehicle Number & Membership (Read-only Badge Cards) */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <Truck className="w-3 h-3 text-slate-500" />
                  {language === 'en' ? 'Vehicle' : language === 'or' ? 'ଗାଡ଼ି ନମ୍ବର' : 'गाड़ी नंबर'}
                </span>
                <div className="mt-1">
                  <VehiclePlate number={ownerUser?.vehicleNumber || 'OD 15 X 7273'} size="sm" />
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {language === 'en' ? 'Membership' : language === 'or' ? 'ସଦସ୍ୟତା' : 'सदस्यता क्र.'}
                </span>
                <span className="font-mono font-bold text-slate-800 text-[11px] block mt-1">
                  {vehicle?.membershipNumber || ownerUser?.membershipNumber || 'STOA-M-0412'}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Footer / Save Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer text-center"
            >
              {language === 'en' ? 'Cancel' : language === 'or' ? 'ବାତିଲ୍' : 'रद्द करें'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-2 py-2.5 px-4 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-2xl text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>
                {saving
                  ? language === 'en'
                    ? 'Saving...'
                    : language === 'or'
                    ? 'ସେଭ୍ ହେଉଛି...'
                    : 'सहेजा जा रहा है...'
                  : language === 'en'
                  ? 'Save Changes'
                  : language === 'or'
                  ? 'ସେଭ୍ କରନ୍ତୁ'
                  : 'सेटिंग्स सहेजें'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
