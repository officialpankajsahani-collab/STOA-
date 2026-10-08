import React, { useState, useRef } from 'react';
import { useConfig } from '../../context/ConfigContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { useLogo } from '../../context/LogoContext.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import { ExecutiveOfficer, PlantEntity } from '../../types/index.js';
import {
  Building2,
  Users,
  RotateCcw,
  DollarSign,
  Factory,
  Radio,
  KeyRound,
  Download,
  Upload,
  Check,
  Plus,
  Trash2,
  Edit2,
  Save,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Search,
  Sliders,
  Layers,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  FileText,
  BookOpen,
  ShieldCheck,
  Image as ImageIcon,
  Truck,
  RefreshCw,
} from 'lucide-react';

export interface MasterSettingsPanelProps {
  initialTab?:
    | 'DIRECTORY'
    | 'AUTOHOOK'
    | 'PROFILE'
    | 'LOGO'
    | 'EXECUTIVES'
    | 'ROTATION'
    | 'FEES'
    | 'PLANTS'
    | 'TICKER'
    | 'SECURITY'
    | 'BACKUP'
    | 'GUIDE';
  onNavigateTab?: (tab: string) => void;
  onOpenLogoModal?: () => void;
  onOpenNewProgram?: () => void;
  onOpenAddVehicle?: () => void;
}

export const MasterSettingsPanel: React.FC<MasterSettingsPanelProps> = ({
  initialTab = 'DIRECTORY',
  onNavigateTab,
  onOpenLogoModal,
  onOpenNewProgram,
  onOpenAddVehicle,
}) => {
  const {
    config,
    features,
    autoScanAndSyncFeatures,
    updateFeatureField,
    updateFeature,
    addFeature,
    deleteFeature,
    updateConfig,
    updateAdminPin,
    updateTicker,
    addExecutive,
    updateExecutive,
    deleteExecutive,
    addPlant,
    updatePlant,
    deletePlant,
    downloadSystemSnapshot,
    restoreSystemSnapshot,
  } = useConfig();
  const { logoUrl, isCustom, uploadLogo, setCustomUrl, resetLogo } = useLogo();
  const { t, language } = useLanguageTheme();

  const [activeTab, setActiveTab] = useState<
    | 'DIRECTORY'
    | 'AUTOHOOK'
    | 'PROFILE'
    | 'LOGO'
    | 'EXECUTIVES'
    | 'ROTATION'
    | 'FEES'
    | 'PLANTS'
    | 'TICKER'
    | 'SECURITY'
    | 'BACKUP'
    | 'GUIDE'
  >(initialTab);

  // Search filter for Universal Directory
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState<'ALL' | 'IDENTITY' | 'OPERATIONS' | 'RULES' | 'SECURITY'>('ALL');

  // Auto-Hook Live Hub States
  const [autoScanning, setAutoScanning] = useState(false);
  const [featureSearch, setFeatureSearch] = useState('');
  const [featureCategoryFilter, setFeatureCategoryFilter] = useState<'ALL' | 'NOTIFICATIONS' | 'FLEET' | 'ROTATION' | 'LOADING' | 'PUKAR' | 'PAYMENTS' | 'GENERAL' | 'SECURITY'>('ALL');
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, any>>>({});

  const handleRunAutoHook = async () => {
    setAutoScanning(true);
    setStatusMessage(null);
    try {
      const res = await autoScanAndSyncFeatures('Admin');
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? `Auto-Hook complete: ${res.count} new component(s) discovered and synchronized in Master Edit Hub!`
            : `ऑटो-हुक सफल: नए कंपोनेंट स्कैन हुए और मास्टर संपादन केंद्र रजिस्ट्री में स्वतः दर्ज हो गए! (कुल: ${features?.length || 0})`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'ऑटो-हुक स्कैन विफल' });
      }
    } finally {
      setAutoScanning(false);
    }
  };

  const handleSaveFeatureFieldValue = async (featureId: string, fieldKey: string, val: any) => {
    try {
      const res = await updateFeatureField(featureId, fieldKey, val, 'Admin');
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `फ़ीचर मान सफलतापूर्वक अपडेट हुआ (${fieldKey})`,
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'अपडेट विफल' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'त्रुटि' });
    }
  };

  // Logo tab form states
  const [logoInputType, setLogoInputType] = useState<'FILE' | 'URL'>('FILE');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Local Form States
  const [profileForm, setProfileForm] = useState({
    associationName: config.associationName,
    tagline: config.tagline,
    estdYear: config.estdYear,
    regNumber: config.regNumber,
    address: config.address,
    helplineMobile: config.helplineMobile,
    emergencyMobile: config.emergencyMobile,
    email: config.email,
    upiId: config.upiId,
  });

  const [rotationForm, setRotationForm] = useState({
    rotationCycle1Days: config.rotationCycle1Days,
    rotationCycle2Days: config.rotationCycle2Days,
    rotationJumpPenaltySerials: config.rotationJumpPenaltySerials,
    absentGraceHours: config.absentGraceHours,
    preserveRotationOnPendingFreight: config.preserveRotationOnPendingFreight,
  });

  const [feeForm, setFeeForm] = useState({
    heavyFeeAbove18Ton: config.heavyFeeAbove18Ton,
    standardFeeUpTo18Ton: config.standardFeeUpTo18Ton,
    membership6Months: config.membership6Months,
    membership12Months: config.membership12Months,
    membership24Months: config.membership24Months,
  });

  const [tickerForm, setTickerForm] = useState({
    text: config.ticker?.text || '',
    type: config.ticker?.type || 'INFO',
    isActive: config.ticker?.isActive ?? true,
  });

  const [pinForm, setPinForm] = useState({
    newPin: '',
    confirmPin: '',
  });

  // Executive Modal State
  const [showExecModal, setShowExecModal] = useState(false);
  const [editingExecId, setEditingExecId] = useState<string | null>(null);
  const [execForm, setExecForm] = useState({
    name: '',
    designation: '',
    mobile: '',
    plantInCharge: '',
    isActive: true,
  });

  // Plant Modal State
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [plantForm, setPlantForm] = useState({
    name: '',
    code: '',
    location: '',
    dailyCapacity: 100,
    contactPerson: '',
    contactMobile: '',
    destinationsStr: '',
    isActive: true,
  });

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handlers
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateConfig(profileForm);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'Association profile successfully updated!'
            : language === 'or'
            ? 'ସଂଘ ପ୍ରୋଫାଇଲ୍ ସଫଳତାର ସହ ଅଦ୍ୟତନ ହେଲା!'
            : 'एसोसिएशन प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट हो गया!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'सहेजना विफल' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRotation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateConfig({
        ...rotationForm,
        rotationJumpPenaltySerials: Number(rotationForm.rotationJumpPenaltySerials) || 50,
        absentGraceHours: Number(rotationForm.absentGraceHours) || 2,
      });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? '15-to-15 rotation rules updated!'
            : language === 'or'
            ? '୧୫-ରୁ-୧୫ ପର୍ଯ୍ୟାୟ ନିୟମ ଅଦ୍ୟତନ ହେଲା!'
            : '15-टू-15 आवर्तन एवं रोटेशन नियम सफलतापूर्वक सहेजे गए!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'सहेजना विफल' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateConfig({
        heavyFeeAbove18Ton: Number(feeForm.heavyFeeAbove18Ton) || 700,
        standardFeeUpTo18Ton: Number(feeForm.standardFeeUpTo18Ton) || 500,
        membership6Months: Number(feeForm.membership6Months) || 1000,
        membership12Months: Number(feeForm.membership12Months) || 1800,
        membership24Months: Number(feeForm.membership24Months) || 3200,
      });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'Fee & financial slabs updated!'
            : language === 'or'
            ? 'ଶୁଳ୍କ ଓ ଦର ସ୍ଲାବ୍ ଅଦ୍ୟତନ ହେଲା!'
            : 'एसोसिएशन फीस व दर स्लैब सफलतापूर्वक सहेजे गए!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'सहेजना विफल' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateTicker(
        tickerForm.text,
        tickerForm.type as 'INFO' | 'WARNING' | 'EMERGENCY',
        tickerForm.isActive
      );
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'Live broadcast ticker updated!'
            : language === 'or'
            ? 'ଲାଇଭ୍ ସୂଚନା ଟିକର୍ ଅଦ୍ୟତନ ହେଲା!'
            : 'लाइव प्रसारण सूचना टिकर तुरंत सभी स्क्रीन पर लागू हो गया!',
        });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'अपडेट विफल' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinForm.newPin !== pinForm.confirmPin) {
      setStatusMessage({
        type: 'error',
        text: language === 'en' ? 'New PINs do not match.' : 'दोनों सुरक्षा पिन समान नहीं हैं।',
      });
      return;
    }
    if (pinForm.newPin.length < 4) {
      setStatusMessage({
        type: 'error',
        text: language === 'en' ? 'PIN must be at least 4 digits.' : 'पिन कम से कम 4 अंकों का होना चाहिए।',
      });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateAdminPin(pinForm.newPin);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: language === 'en'
            ? 'Admin security PIN successfully changed!'
            : 'एडमिन सुरक्षा पिन सफलतापूर्वक बदल दिया गया!',
        });
        setPinForm({ newPin: '', confirmPin: '' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'पिन बदलना विफल' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Executive Actions
  const handleOpenAddExec = () => {
    setEditingExecId(null);
    setExecForm({
      name: '',
      designation: '',
      mobile: '',
      plantInCharge: '',
      isActive: true,
    });
    setShowExecModal(true);
  };

  const handleOpenEditExec = (exec: ExecutiveOfficer) => {
    setEditingExecId(exec.id);
    setExecForm({
      name: exec.name,
      designation: exec.designation,
      mobile: exec.mobile,
      plantInCharge: exec.plantInCharge || '',
      isActive: exec.isActive,
    });
    setShowExecModal(true);
  };

  const handleSaveExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingExecId) {
        await updateExecutive(editingExecId, execForm);
      } else {
        await addExecutive(execForm);
      }
      setShowExecModal(false);
      setStatusMessage({
        type: 'success',
        text: 'कार्यकारिणी विवरण अद्यतन किया गया!',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExecutive = async (id: string, name: string) => {
    if (!window.confirm(`क्या आप ${name} को कार्यकारिणी से हटाना चाहते हैं?`)) return;
    await deleteExecutive(id);
    setStatusMessage({ type: 'success', text: 'पदाधिकारी हटाया गया।' });
  };

  // Plant Actions
  const handleOpenAddPlant = () => {
    setEditingPlantId(null);
    setPlantForm({
      name: '',
      code: '',
      location: '',
      dailyCapacity: 100,
      contactPerson: '',
      contactMobile: '',
      destinationsStr: 'रायपुर, विशाखापट्टनम, हल्दिया',
      isActive: true,
    });
    setShowPlantModal(true);
  };

  const handleOpenEditPlant = (plt: PlantEntity) => {
    setEditingPlantId(plt.id);
    setPlantForm({
      name: plt.name,
      code: plt.code,
      location: plt.location,
      dailyCapacity: plt.dailyCapacity,
      contactPerson: plt.contactPerson || '',
      contactMobile: plt.contactMobile || '',
      destinationsStr: plt.destinations ? plt.destinations.join(', ') : '',
      isActive: plt.isActive,
    });
    setShowPlantModal(true);
  };

  const handleSavePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const destArray = plantForm.destinationsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        name: plantForm.name,
        code: plantForm.code || plantForm.name.slice(0, 4).toUpperCase(),
        location: plantForm.location,
        dailyCapacity: Number(plantForm.dailyCapacity) || 100,
        contactPerson: plantForm.contactPerson,
        contactMobile: plantForm.contactMobile,
        destinations: destArray,
        isActive: plantForm.isActive,
      };

      if (editingPlantId) {
        await updatePlant(editingPlantId, payload);
      } else {
        await addPlant(payload);
      }
      setShowPlantModal(false);
      setStatusMessage({
        type: 'success',
        text: 'प्लांट विवरण सफलतापूर्वक सहेज लिया गया!',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlant = async (id: string, name: string) => {
    if (!window.confirm(`क्या आप प्लांट "${name}" को हटाना चाहते हैं?`)) return;
    await deletePlant(id);
    setStatusMessage({ type: 'success', text: 'प्लांट हटाया गया।' });
  };

  // Backup restore file upload handler
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const res = await restoreSystemSnapshot(json);
        if (res.success) {
          setStatusMessage({
            type: 'success',
            text: 'सिस्टम बैकअप सफलतापूर्वक पुनर्स्थापित किया गया!',
          });
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'रिस्टोर विफल' });
        }
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: 'अमान्य बैकअप फ़ाइल: ' + err.message });
      }
    };
    reader.readAsText(file);
  };

  // Clean Slate for selling to client (0 vehicles)
  const handleCleanSlate = async () => {
    try {
      const res = await fetch('/api/admin/clean-slate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'Super Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'डेटाबेस को 100% स्वच्छ (0 वाहन, 0 पास) कर दिया गया है। सॉफ़्टवेयर अब क्लाइंट को देने के लिए तैयार है।',
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'त्रुटि' });
    }
  };

  // Seed sample demo fleet for sales presentations
  const handleSeedDemo = async () => {
    try {
      const res = await fetch('/api/admin/seed-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: 'Super Admin' }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: 'बिक्री प्रदर्शन हेतु नमूना डेटा (Demo Fleet) लोड कर दिया गया है।',
        });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'त्रुटि' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
              {language === 'en'
                ? 'Master Application Control & Configuration Hub'
                : language === 'or'
                ? 'ମାଷ୍ଟର ନିୟନ୍ତ୍ରଣ ଓ ସମ୍ପାଦନ କେନ୍ଦ୍ର'
                : 'मास्टर संपादन एवं सिस्टम सेटिंग्स केंद्र'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {language === 'en'
              ? 'Edit anything across the entire application — association details, executives, rotation policies, fee rates, industrial plants, live marquee ticker, and backup.'
              : language === 'or'
              ? 'ସମଗ୍ର ଆପ୍‌ରେ କିଛି ବି ସମ୍ପାଦନ କରନ୍ତୁ — ସଂଘ ବିବରଣୀ, କର୍ମକର୍ତ୍ତା, ନିୟମ, ଶୁଳ୍କ ହାର, ପ୍ଲାଣ୍ଟ୍, ଲାଇଭ୍ ଟିକର୍ ଏବଂ ବ୍ୟାକଅପ୍।'
              : 'पूरे एप्लिकेशन में कुछ भी बदलें — एसोसिएशन विवरण, पदाधिकारी, 15-टू-15 नियम, फीस दरें, प्लांट, लाइव सूचना टिकर व डेटा बैकअप।'}
          </p>
        </div>

        <button
          type="button"
          onClick={downloadSystemSnapshot}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 text-rose-600" />
          <span>{language === 'en' ? 'Quick Backup (.json)' : 'डेटा बैकअप डाउनलोड'}</span>
        </button>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-700 text-xs px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('DIRECTORY')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'DIRECTORY'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Universal Edit Hub' : language === 'or' ? 'ୟୁନିଭର୍ସାଲ୍ ଏଡିଟ୍ ହବ୍' : 'यूनिवर्सल संपादन केंद्र'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUTOHOOK')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
            activeTab === 'AUTOHOOK'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'en' ? 'Auto-Hook Live Hub' : 'ऑटो-हुक रजिस्ट्री'}</span>
          <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] rounded-full font-black">
            {features?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('LOGO')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'LOGO'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Logo & Branding' : language === 'or' ? 'ଲୋଗୋ ଓ ବ୍ରାଣ୍ଡିଂ' : 'लोगो व ब्रांडिंग'}</span>
          {isCustom && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'PROFILE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Profile & Info' : language === 'or' ? 'ସଂଘ ପ୍ରୋଫାଇଲ୍' : 'एसोसिएशन प्रोफ़ाइल'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EXECUTIVES')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'EXECUTIVES'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Executives' : language === 'or' ? 'କର୍ମକର୍ତ୍ତା' : 'कार्यकारिणी'} ({config.executives?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ROTATION')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'ROTATION'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Rotation Rules' : language === 'or' ? 'ରୋଟେସନ୍ ନିୟମ' : '15-टू-15 नियम'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FEES')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'FEES'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Fee Slabs' : language === 'or' ? 'ଶୁଳ୍କ ହାର' : 'फीस व दर स्लैब'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PLANTS')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'PLANTS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Factory className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Plants' : language === 'or' ? 'ପ୍ଲାଣ୍ଟସ୍' : 'उद्योग व प्लांट्स'} ({config.plants?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TICKER')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'TICKER'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Live Ticker' : language === 'or' ? 'ଲାଇଭ୍ ଟିକର୍' : 'लाइव टिकर'}</span>
          {config.ticker?.isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SECURITY')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'SECURITY'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Security PIN' : language === 'or' ? 'ସୁରକ୍ଷା ପିନ୍' : 'सुरक्षा पिन'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('BACKUP')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'BACKUP'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Backup & Restore' : language === 'or' ? 'ବ୍ୟାକଅପ୍' : 'डेटा बैकअप'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GUIDE')}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'GUIDE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'en' ? 'Admin Guide' : language === 'or' ? 'ନିର୍ଦ୍ଦେଶାବଳୀ' : 'एडमिन गाइड'}</span>
        </button>
      </div>

      {/* TAB 0: UNIVERSAL DIRECTORY & ONE-CLICK EDIT HUB */}
      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6">
          {/* Search & Filter Header */}
          <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-300 text-xs font-bold mb-2 backdrop-blur-xs border border-white/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Complete Administrative Control' : 'संपूर्ण प्रशासनिक नियंत्रण व संपादन समाधान'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  {language === 'en'
                    ? 'What would you like to edit across the app?'
                    : language === 'or'
                    ? 'ଆପଣ ଆପ୍‌ରେ କ’ଣ ସମ୍ପାଦନ ବା ପରିବର୍ତ୍ତନ କରିବାକୁ ଚାହାଁନ୍ତି?'
                    : 'आप पूरे एप्लिकेशन में क्या बदलना या संपादित करना चाहते हैं?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {language === 'en'
                    ? 'Click any module below to directly edit text, logo, truck details, loading quotas, fee tariffs, marquee notices, or industrial factories.'
                    : language === 'or'
                    ? 'ତଳେ ଥିବା ଯେକୌଣସି ବିଭାଗ ଉପରେ କ୍ଲିକ୍ କରି ଲୋଗୋ, ଗାଡ଼ି, ଲୋଡ୍, ଫିସ୍, ନିୟମ ଓ ସୂଚନା ସହଜରେ ପରିବର୍ତ୍ତନ କରନ୍ତୁ।'
                    : 'नीचे दिए गए किसी भी कार्ड पर क्लिक करें और तुरंत लोगो, गाड़ी, लोड, प्लांट, रोटेशन नियम, फीस व लाइव टिकर बदलें।'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('GUIDE')}
                  className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-rose-300" />
                  <span>{language === 'en' ? 'Step-by-Step Guide' : 'संपादन गाइड देखें'}</span>
                </button>
              </div>
            </div>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
                placeholder={
                  language === 'en'
                    ? 'Search anything to edit (e.g. logo, truck, quota, plant, rotation, fee, pin, ticker)...'
                    : 'कुछ भी खोजने के लिए टाइप करें (जैसे: लोगो, गाड़ी, लोड, प्लांट, रोटेशन, फीस, टिकर, पिन, बैकअप)...'
                }
                className="w-full pl-10 pr-24 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-slate-400 rounded-2xl text-xs sm:text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all font-medium"
              />
              {directorySearch && (
                <button
                  type="button"
                  onClick={() => setDirectorySearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 bg-white/10 rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold text-[11px]">
                {language === 'en' ? 'Filter Category:' : 'श्रेणी फ़िल्टर:'}
              </span>
              {[
                { id: 'ALL', labelHi: 'सभी 14 मॉड्यूल', labelEn: 'All 14 Modules' },
                { id: 'IDENTITY', labelHi: 'लोगो व पहचान', labelEn: 'Logo & Identity' },
                { id: 'OPERATIONS', labelHi: 'फ्लीट व ऑपरेशन्स', labelEn: 'Fleet & Operations' },
                { id: 'RULES', labelHi: 'नियम व लेजर', labelEn: 'Rules & Ledger' },
                { id: 'SECURITY', labelHi: 'सुरक्षा व बैकअप', labelEn: 'Security & Backup' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setDirectoryCategory(c.id as any)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    directoryCategory === c.id
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {language === 'en' ? c.labelEn : c.labelHi}
                </button>
              ))}
            </div>
          </div>

          {/* 14 Interactive Editable Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 0. Auto-Hook Feature Hub & Dynamic Components */}
            {(!directorySearch || /auto|hook|हुक|डायनेमिक|कंपोनेंट|फीचर|रजिस्ट्री/i.test(directorySearch)) && (
              <div className="bg-gradient-to-br from-white to-amber-50/40 border border-amber-200 hover:border-amber-400 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{features?.length || 0} ऑटो-हुक्ड</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {language === 'en' ? 'Auto-Hook Live Component Registry' : 'ऑटो-हुक कंपोनेंट एवं फीचर रजिस्ट्री'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === 'en'
                        ? 'Scans the codebase for new UI components and registers them into the central Master Edit Hub for zero-code configuration.'
                        : 'नए जोड़े गए फीचर्स और कंपोनेंट्स को स्वतः पहचानकर मास्टर संपादन डेटाबेस में दर्ज करता है।'}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-1 text-[11px] text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">पहचाने गए विजेट्स:</span>
                      <span className="font-bold font-mono text-slate-900">{features?.length || 0} एक्टिव मॉड्यूल्स</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">एडमिन एक्सेस:</span>
                      <span className="font-semibold text-emerald-700">पूर्ण संपादन नियंत्रण</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('AUTOHOOK')}
                    className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                  >
                    <span>रजिस्ट्री व लाइव एडिट खोलें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* 1. Logo & Visual Branding */}
            {(!directorySearch || /लोगो|logo|symbol|emblem|icon|चिन्ह|सील/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'IDENTITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {isCustom ? 'कस्टम लोगो सक्रिय' : 'वेक्टर प्रतीक'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Association Logo & Emblem' : 'एसोसिएशन लोगो व आधिकारिक सील'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {language === 'en'
                          ? 'Change the circular STOA emblem by uploading any new PNG/JPG/SVG image or setting a web image URL.'
                          : 'संबलपुर ट्रक ओनर्स एसोसिएशन का गोलाकार लोगो बदलें, नया फोटो अपलोड करें या ऑनलाइन लिंक दें।'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">हेडर, गेट पास, रसीद, लॉगिन</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">वर्तमान स्थिति:</span>
                        <span className="font-semibold text-emerald-700">सक्रिय व परिवर्तनीय</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('LOGO')}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>लोगो बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onOpenLogoModal && (
                      <button
                        type="button"
                        onClick={onOpenLogoModal}
                        title="लोगो स्टूडियो पॉपअप"
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs border border-rose-200 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* 2. Association Profile & Contacts */}
            {(!directorySearch || /नाम|पता|फोन|मोबाइल|हेल्पलाइन|ईमेल|upi|address|phone|email|profile|name|रजिस्ट्रेशन/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'IDENTITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        ESTD {config.estdYear}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Profile, Name & Contacts' : 'संस्था प्रोफ़ाइल, नाम व संपर्क विवरण'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        एसोसिएशन का आधिकारिक नाम, उपशीर्षक, स्थापना वर्ष, सरकारी पंजीयन नंबर, कार्यालय का पता, हेल्पलाइन, ईमेल व UPI ID।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">गेट पास, पावती, कानूनी नोटिस, शीर्ष पट्टी</span>
                      </div>
                      <div className="flex items-center justify-between truncate">
                        <span className="text-slate-400">वर्तमान मान:</span>
                        <span className="font-semibold text-slate-800 truncate max-w-[160px]">{config.associationName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('PROFILE')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>प्रोफ़ाइल संपादित करें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 3. Fleet & Vehicle Directory */}
            {(!directorySearch || /गाड़ी|वाहन|ट्रक|फ्लीट|fleet|truck|vehicle|owner|मालिक|नंबर|श्रेणी|एक्सल/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'OPERATIONS') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                        <Truck className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        फ्लीट प्रबंधन
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Fleet, Trucks & Owners' : 'फ्लीट, गाड़ियाँ व वाहन मालिक डेटा'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        फ्लीट में नई गाड़ी जोड़ें, किसी भी गाड़ी का नंबर/मालिक/मोबाइल/श्रेणी संपादित करें, एक्सेल/CSV इम्पोर्ट व ब्लैकलिस्टिंग।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">फ्लीट टैब, डिस्पैच, मालिक का खाता</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">सुविधाएं:</span>
                        <span className="font-semibold text-emerald-700">जोड़ें, बदलें, हटाएं, Excel इम्पोर्ट</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('fleet')}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>फ्लीट सूची खोलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onOpenAddVehicle && (
                      <button
                        type="button"
                        onClick={onOpenAddVehicle}
                        className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>गाड़ी जोड़ें</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* 4. Daily Loading Programs & Quotas */}
            {(!directorySearch || /लोड|लोडिंग|प्रोग्राम|कोटा|loading|quota|freight|भाड़ा|advance|दैनिक/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'OPERATIONS') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        लोड व डिस्पैच
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Daily Loading Programs' : 'दैनिक लोड, कोटा व भाड़ा दर'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        प्लांट्स के लिए रोजाना नया लोड पोस्ट करें, अनिवार्य वाहन श्रेणी, भाड़ा दर ₹/टन और 70% अग्रिम भाड़ा कोटा निर्धारित करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">दैनिक लोड टैब, मालिक 'आज का लोड'</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">नियम:</span>
                        <span className="font-semibold text-slate-800">70% एडवांस, 30% समायोजन</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('loading')}
                      className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>लोड प्रोग्राम देखें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {onOpenNewProgram && (
                      <button
                        type="button"
                        onClick={onOpenNewProgram}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>लोड पोस्ट</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

            {/* 5. Industrial Plants Directory */}
            {(!directorySearch || /प्लांट|उद्योग|फैक्ट्री|hindalco|vedanta|lapanga|blue fox|plant|factory/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'OPERATIONS') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Factory className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {config.plants?.length || 0} प्लांट्स
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Industrial Plants & Units' : 'उद्योग, फैक्ट्रियां व लोडिंग प्लांट्स'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        हिंडाल्को, वेदांत, आदित्य बिड़ला लपंगा आदि को जोड़ें या बदलें; दैनिक क्षमता, सुपरवाइजर संपर्क व अधिकृत गंतव्य सेट करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">लोडिंग चयन, गेट पास, संपर्क सूची</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कार्य:</span>
                        <span className="font-semibold text-indigo-700">प्लांट जोड़ें, क्षमता व गंतव्य बदलें</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('PLANTS')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>प्लांट्स निर्देशिका संपादित करें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 6. 15-to-15 Rotation Rules */}
            {(!directorySearch || /नियम|रोटेशन|rotation|आवर्तन|15|cycle|penalty|grace|पेनाल्टी|क्रम/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'RULES') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                        <RotateCcw className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        15-टू-15 नियम
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? '15-to-15 Rotation Policies' : '15-टू-15 आवर्तन एवं रोटेशन नियम'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        आवर्तन चक्र 1 व 2 की तिथियाँ, जंप पेनाल्टी (50 क्रम), 2 घंटे अनुपस्थिति छूट व पेंडिंग भाड़े पर क्रम सुरक्षा का नियम बदलें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">जंप पेनाल्टी:</span>
                        <span className="font-semibold text-rose-700">{config.rotationJumpPenaltySerials} क्रम संख्या पीछे</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">अनुपस्थिति ग्रेस:</span>
                        <span className="font-semibold text-slate-800">{config.absentGraceHours} घंटे की छूट</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('ROTATION')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>रोटेशन नियम बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 7. Fees & Tariffs */}
            {(!directorySearch || /फीस|शुल्क|दर|fee|tariff|heavy|membership|सदस्यता|पैसा|रुपया/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'RULES') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        दर स्लैब
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Fee Slabs & Tariffs' : 'एसोसिएशन फीस व दर संरचना'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        भारी वाहन एसोसिएशन फीस (&gt;18T ₹{config.heavyFeeAbove18Ton}), सामान्य वाहन फीस (&lt;=18T ₹{config.standardFeeUpTo18Ton}) और सदस्यता नवीनीकरण दरें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">भारी वाहन (&gt;18T):</span>
                        <span className="font-semibold text-rose-700">₹{config.heavyFeeAbove18Ton} प्रति पर्ची</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">वार्षिक सदस्यता:</span>
                        <span className="font-semibold text-slate-800">₹{config.membership12Months} / 12 माह</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('FEES')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>शुल्क दरें बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 8. Live Notice Marquee Ticker */}
            {(!directorySearch || /टिकर|सूचना|संदेश|ticker|notice|marquee|alert|लाइव|अलर्ट/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'IDENTITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                        <Radio className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${config.ticker?.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {config.ticker?.isActive ? '🔴 लाइव प्रसारण चालू' : 'बंद'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Live Announcement Marquee' : 'लाइव सूचना टिकर (सभी स्क्रीन पर)'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        सभी ट्रक मालिकों व ड्राइवरों की स्क्रीन पर सबसे ऊपर लाल/अंबर पट्टी में चलने वाला आधिकारिक टिकर संदेश तुरंत बदलें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600 truncate">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">प्रकार:</span>
                        <span className="font-semibold text-rose-700">{config.ticker?.type || 'INFO'}</span>
                      </div>
                      <p className="text-slate-700 truncate font-mono text-[10px]">{config.ticker?.text}</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('TICKER')}
                      className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>टिकर संदेश बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 9. Live Pukar Control */}
            {(!directorySearch || /पुकार|pukar|call|voice|notice|व्हाट्सएप|whatsapp/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'OPERATIONS') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200">
                        <Radio className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        कंट्रोल रूम
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Pukar Control & Broadcast' : 'पुकार कंट्रोल रूम व बुलेटिन'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        लाइव डिजिटल पुकार शुरू या रोकें, कच्ची पुकार पर्ची का संपादन करें, व्हाट्सएप बुलेटिन जारी करें व गाड़ियों को कॉल करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">मालिक ऐप 'पुकार', कंट्रोल रूम</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">सुविधाएं:</span>
                        <span className="font-semibold text-purple-700">वॉइस, टेक्स्ट, व्हाट्सएप फ़ॉर्मेट</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('pukar')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>पुकार कंट्रोल खोलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 10. Financial Ledger & Pass Records */}
            {(!directorySearch || /लेजर|ledger|हिसाब|खाता|pass|पर्ची|gate pass|भुगतान|payment/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'RULES') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        15-टू-15 खाता
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Financial Ledger & Pass' : '15-टू-15 वित्तीय लेजर व पास'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        जारी गेट पासों का भुगतान सत्यापित करें, पर्ची रद्द करें, टीडीएस व सेस कटौती देखें व 15-दिवसीय समायोजन करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">15-टू-15 लेजर, ऑडिट ट्रेल</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कार्य:</span>
                        <span className="font-semibold text-emerald-700">भुगतान दर्ज करें, रद्दीकरण</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('ledger')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>लेजर व पर्चियां खोलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 11. Executive Committee */}
            {(!directorySearch || /पदाधिकारी|अध्यक्ष|सचिव|कार्यकारिणी|executive|committee|officer|president/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'IDENTITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-700 border border-orange-200">
                        <Users className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {config.executives?.length || 0} पदाधिकारी
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Executive Committee' : 'कार्यकारिणी व पदाधिकारी निर्देशिका'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        एसोसिएशन अध्यक्ष, महासचिव, कोषाध्यक्ष, उपाध्यक्ष व प्लांट प्रभारियों के नाम, मोबाइल नंबर व पद बदलें या नया पदाधिकारी जोड़ें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ दिखता है:</span>
                        <span className="font-semibold text-slate-800">आधिकारिक संपर्क, हेल्पडेस्क</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कार्य:</span>
                        <span className="font-semibold text-orange-700">जोड़ें, बदलें, फ़ोन नंबर अपडेट</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('EXECUTIVES')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>पदाधिकारी बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 12. Admin Security PIN */}
            {(!directorySearch || /पिन|सुरक्षा|पासवर्ड|pin|security|password|access/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'SECURITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        सुरक्षा कोड
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Admin 4-Digit Security PIN' : 'प्रशासनिक 4-अंकीय सुरक्षा पिन'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        एडमिन कंट्रोल रूम में अनधिकृत प्रवेश रोकने के लिए अपना 4-अंकों का गुप्त प्रशासनिक सुरक्षा कोड कभी भी बदलें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">कहाँ उपयोग होता है:</span>
                        <span className="font-semibold text-slate-800">एडमिन लॉगिन स्क्रीन पर</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">स्थिति:</span>
                        <span className="font-semibold text-emerald-700">सक्रिय सुरक्षा गार्ड</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('SECURITY')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>सुरक्षा पिन बदलें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* 13. Full System Backup & Restore */}
            {(!directorySearch || /बैकअप|डेटा|रिस्टोर|backup|restore|snapshot|json|डाउनलोड/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'SECURITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200">
                        <Download className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        डेटा सुरक्षा
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'System Backup & Restore' : 'डेटा बैकअप, रिस्टोर व सुरक्षित प्रति'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        एक क्लिक में पूरे डेटाबेस (सभी गाड़ियाँ, लोड, सेटिंग्स, ऑडिट) का JSON बैकअप डाउनलोड करें व किसी भी समय पुनर्स्थापित करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">फ़ॉर्मेट:</span>
                        <span className="font-semibold text-slate-800 font-mono">.json (स्टैंडर्ड)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">सुविधा:</span>
                        <span className="font-semibold text-sky-700">1-क्लिक डाउनलोड व रिस्टोर</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={downloadSystemSnapshot}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>बैकअप डाउनलोड</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('BACKUP')}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer"
                    >
                      <span>रिस्टोर</span>
                    </button>
                  </div>
                </div>
              )}

            {/* 14. Language & Theme Settings */}
            {(!directorySearch || /भाषा|language|odia|english|hindi|हिन्दी|उड़िया|theme/i.test(directorySearch)) &&
              (directoryCategory === 'ALL' || directoryCategory === 'IDENTITY') && (
                <div className="bg-white border border-slate-200 hover:border-rose-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        त्रिभाषी प्रणाली
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                        {language === 'en' ? 'Language & Display Modes' : 'त्रिभाषी प्रणाली (हिन्दी · English · ଓଡ଼ିଆ)'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        पूरे एप्लिकेशन की भाषा तुरंत हिन्दी, English या ଓଡ଼ିଆ में बदलें। साथ ही मोबाइल व डेस्कटॉप मोड में स्विच करें।
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">वर्तमान भाषा:</span>
                        <span className="font-semibold text-rose-700 font-bold">
                          {language === 'hi' ? 'हिन्दी (Hindi)' : language === 'en' ? 'English (UK/US)' : 'ଓଡ଼ିଆ (Odia)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">स्विच विकल्प:</span>
                        <span className="font-semibold text-slate-800">शीर्ष बार में हमेशा उपलब्ध</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('GUIDE')}
                      className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                    >
                      <span>मार्गदर्शिका पढ़ें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
          </div>

          {/* Quick FAQ / Guide Accordion */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-4 h-4 text-rose-600" />
              <h4 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Quick Answers: How to edit anything in the application' : 'त्वरित समाधान: एडमिन पूरे ऐप में क्या और कैसे बदल सकते हैं?'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  1. एसोसिएशन का लोगो कैसे बदलें?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  ऊपर <strong>'लोगो व ब्रांडिंग'</strong> टैब पर क्लिक करें, अपने कंप्यूटर से नया फोटो चुनें या लिंक पेस्ट करें और 'सहेजें' पर क्लिक करें। यह तुरंत पूरे एप्लिकेशन, लॉगिन स्क्रीन और गेट पास पर लागू हो जाएगा।
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  2. किसी गाड़ी का नंबर या मालिक का नाम कैसे बदलें?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  ऊपर <strong>'फ्लीट'</strong> टैब में जाएं, गाड़ी खोजें और <strong>'संपादित करें (Edit)'</strong> बटन पर क्लिक करें। आप नंबर, मालिक का नाम, मोबाइल नंबर, श्रेणी या सीरियल तुरंत बदल सकते हैं।
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  3. आज का नया लोड व भाड़ा कैसे पोस्ट करें?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  <strong>'दैनिक लोड'</strong> टैब में <strong>'+ नया लोड पोस्ट करें'</strong> पर क्लिक करें। प्लांट चुनें, गंतव्य, कुल कोटा और भाड़ा दर ₹/टन दर्ज करें। यह सभी ट्रक मालिकों को दिखने लगेगा।
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  4. सभी ट्रकों को तुरंत चेतावनी या अलर्ट कैसे भेजें?
                </span>
                <p className="text-slate-600 leading-relaxed">
                  <strong>'लाइव टिकर'</strong> टैब में जाएं, संदेश लिखें, प्रकार (सामान्य / चेतावनी / आपातकालीन) चुनें और सक्रिय करें। यह तुरंत सभी उपयोगकर्ताओं की स्क्रीन पर सबसे ऊपर लाल पट्टी में चलने लगेगा।
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 0.25: AUTO-HOOK LIVE REGISTRY & DYNAMIC COMPONENT HUB */}
      {activeTab === 'AUTOHOOK' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-2 backdrop-blur-xs border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Hook Dynamic Component Detection Engine</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                  ऑटो-हुक कंपोनेंट एवं फीचर रजिस्ट्री (Universal Edit Hub)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  जब भी एप्लिकेशन में कोई नया कंपोनेंट, विजेट या फीचर जोड़ा जाता है, यह इंजन उसे स्वतः पहचानकर इस मास्टर संपादन डेटाबेस में पंजीकृत करता है ताकि एडमिन बिना कोड बदले उसे नियंत्रित कर सके।
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRunAutoHook}
                  disabled={autoScanning}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950/30 cursor-pointer transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${autoScanning ? 'animate-spin' : ''}`} />
                  <span>{autoScanning ? 'स्कैन जारी है...' : '🔄 नए कंपोनेंट स्कैन करें (Auto-Hook)'}</span>
                </button>
              </div>
            </div>

            {/* Live Statistics Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/10">
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-slate-300 uppercase block font-semibold">कुल ऑटो-हुक फीचर्स</span>
                <span className="text-2xl font-black font-mono text-white">{features?.length || 0}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-emerald-300 uppercase block font-semibold">सक्रिय (Active)</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  {features?.filter((f) => f.status === 'ACTIVE').length || 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-amber-300 uppercase block font-semibold">स्वचालित पहचाने गए</span>
                <span className="text-2xl font-black font-mono text-amber-400">
                  {features?.filter((f) => f.isAutoDiscovered).length || 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                <span className="text-[10px] text-rose-300 uppercase block font-semibold">संपादन योग्य फील्ड्स</span>
                <span className="text-2xl font-black font-mono text-rose-300">
                  {features?.reduce((acc, f) => acc + (f.fields?.length || 0), 0) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  placeholder="कंपोनेंट, फीचर नाम, आईडी या प्रदर्शित स्क्रीन खोजें..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-rose-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                {(['ALL', 'NOTIFICATIONS', 'FLEET', 'ROTATION', 'LOADING', 'PUKAR', 'PAYMENTS', 'GENERAL'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFeatureCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer shrink-0 text-xs ${
                      featureCategoryFilter === cat
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Component Registry Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features
              ?.filter((f) => {
                if (featureCategoryFilter !== 'ALL' && f.category !== featureCategoryFilter) return false;
                if (!featureSearch.trim()) return true;
                const q = featureSearch.toLowerCase();
                return (
                  f.nameHi.toLowerCase().includes(q) ||
                  f.nameEn.toLowerCase().includes(q) ||
                  f.id.toLowerCase().includes(q) ||
                  (f.whereShown?.toLowerCase().includes(q) ?? false) ||
                  f.category.toLowerCase().includes(q)
                );
              })
              .map((feature) => (
                <div
                  key={feature.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Badges Bar */}
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>AUTO-HOOKED</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 uppercase font-mono">
                          {feature.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono font-semibold border border-rose-100">
                          {feature.routeOrTab || 'screen'}
                        </span>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={async () => {
                          const nextStatus = feature.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                          await updateFeature(feature.id, { status: nextStatus }, 'Admin');
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                          feature.status === 'ACTIVE'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title="फ़ीचर ऑन/ऑफ टॉगल करें"
                      >
                        <span>{feature.status === 'ACTIVE' ? 'सक्रिय (ON)' : 'निष्क्रिय (OFF)'}</span>
                      </button>
                    </div>

                    {/* Feature Title & Description */}
                    <div>
                      <h4 className="text-base font-bold text-slate-900 leading-snug">{feature.nameHi}</h4>
                      <p className="text-xs font-medium text-slate-500 font-sans">{feature.nameEn}</p>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{feature.descriptionHi}</p>
                      <p className="text-[11px] text-slate-400 mt-1 font-mono">स्थान: {feature.whereShown}</p>
                    </div>

                    {/* Configurable Dynamic Fields */}
                    {feature.fields && feature.fields.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">
                          संपादन योग्य पैरामीटर्स (Live Parameters)
                        </span>

                        {feature.fields.map((field) => {
                          const currentVal =
                            fieldValues[feature.id]?.[field.key] !== undefined
                              ? fieldValues[feature.id][field.key]
                              : field.value;

                          return (
                            <div key={field.key} className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1.5 text-xs">
                              <div className="flex items-center justify-between">
                                <label className="font-semibold text-slate-800">
                                  {field.labelHi} <span className="font-mono text-slate-400 text-[10px]">({field.key})</span>
                                </label>
                                {field.unit && <span className="text-[10px] text-slate-500 font-mono">{field.unit}</span>}
                              </div>

                              {field.type === 'boolean' ? (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 text-[11px]">स्थिति: {currentVal ? 'सक्षम (True)' : 'अक्षम (False)'}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = !currentVal;
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [feature.id]: {
                                          ...(prev[feature.id] || {}),
                                          [field.key]: next,
                                        },
                                      }));
                                      handleSaveFeatureFieldValue(feature.id, field.key, next);
                                    }}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      currentVal
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                    }`}
                                  >
                                    {currentVal ? 'सक्षम (ON)' : 'अक्षम (OFF)'}
                                  </button>
                                </div>
                              ) : field.type === 'select' ? (
                                <div className="flex gap-2">
                                  <select
                                    value={currentVal}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [feature.id]: {
                                          ...(prev[feature.id] || {}),
                                          [field.key]: v,
                                        },
                                      }));
                                    }}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium"
                                  >
                                    {field.options?.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveFeatureFieldValue(feature.id, field.key, currentVal)}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-all"
                                  >
                                    सहेजें
                                  </button>
                                </div>
                              ) : field.type === 'textarea' ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    rows={2}
                                    value={currentVal}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [feature.id]: {
                                          ...(prev[feature.id] || {}),
                                          [field.key]: v,
                                        },
                                      }));
                                    }}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl leading-relaxed text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveFeatureFieldValue(feature.id, field.key, currentVal)}
                                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
                                  >
                                    संदेश सहेजें
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type={field.type === 'number' ? 'number' : 'text'}
                                    value={currentVal}
                                    onChange={(e) => {
                                      const v = field.type === 'number' ? Number(e.target.value) : e.target.value;
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [feature.id]: {
                                          ...(prev[feature.id] || {}),
                                          [field.key]: v,
                                        },
                                      }));
                                    }}
                                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-medium text-xs font-mono"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveFeatureFieldValue(feature.id, field.key, currentVal)}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold cursor-pointer transition-all"
                                  >
                                    सहेजें
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>ID: {feature.id}</span>
                    <span>v{feature.version}</span>
                  </div>
                </div>
              ))}
          </div>

          {features?.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700">अभी कोई कंपोनेंट हुक नहीं मिला</p>
              <p className="text-xs text-slate-500 mt-1">ऊपर दिए गए 'नए कंपोनेंट स्कैन करें' बटन पर क्लिक करें।</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 0.5: LOGO & BRANDING STUDIO */}
      {activeTab === 'LOGO' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-rose-600" />
                {language === 'en' ? 'Association Logo & Visual Identity Studio' : 'एसोसिएशन लोगो व आधिकारिक पहचान संपादन'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'en'
                  ? 'Admin can change the association logo anytime. Upload a custom logo or reset to the official STOA circular vector emblem.'
                  : 'एडमिन एसोसिएशन का लोगो कभी भी बदल सकते हैं। नया फोटो अपलोड करें, वेब लिंक दें या आधिकारिक एसटीओए वेक्टर प्रतीक पर रीसेट करें।'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono ${isCustom ? 'bg-amber-100 text-amber-800' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {isCustom ? 'कस्टम लोगो सक्रिय' : 'आधिकारिक एसटीओए सील'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Current Logo & Live Previews */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-4">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  वर्तमान सक्रिय लोगो (Active Logo)
                </span>

                <div className="flex justify-center py-2">
                  <AssociationLogo size={120} showRing />
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">संबलपुर ट्रक ओनर्स एसोसिएशन · संबलपुर</p>
                  <p className="text-[11px] text-slate-500 font-mono">SAMBALPUR TRUCK OWNER'S ASSOCIATION</p>
                </div>

                {isCustom && (
                  <button
                    type="button"
                    onClick={async () => {
                      await resetLogo('Admin');
                      setStatusMessage({
                        type: 'success',
                        text: 'लोगो आधिकारिक एसटीओए प्रतीक पर सफलतापूर्वक रीसेट कर दिया गया!',
                      });
                    }}
                    className="w-full py-2 bg-white hover:bg-slate-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>डिफ़ॉल्ट आधिकारिक एसटीओए लोगो पर रीसेट करें</span>
                  </button>
                )}
              </div>

              {/* Real-time Previews across Scenarios */}
              <div className="border border-slate-200 rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">
                  एप्लिकेशन में वास्तविक रूप (Live Previews):
                </span>

                {/* Scenario 1: Navbar */}
                <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2.5 shadow-xs">
                  <AssociationLogo size={36} showRing />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate">STOA CONTROL ROOM</p>
                    <p className="text-[9px] text-rose-700 font-semibold truncate">संबलपुर ट्रक ओनर्स एसोसिएशन</p>
                  </div>
                  <span className="ml-auto text-[9px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">हेडर</span>
                </div>

                {/* Scenario 2: Gate Pass */}
                <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl text-center space-y-1">
                  <AssociationLogo size={44} showRing className="mx-auto" />
                  <p className="text-[10px] font-black text-rose-900 tracking-wider">SAMBALPUR TRUCK OWNER'S ASSOCIATION</p>
                  <p className="text-[9px] text-slate-600">लोडिंग गेट पास व फ्रेट पावती रसीद</p>
                  <span className="inline-block text-[9px] font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">प्रिंटेड पर्ची</span>
                </div>
              </div>
            </div>

            {/* Right Column: Upload / URL Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => setLogoInputType('FILE')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    logoInputType === 'FILE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  <span>नया फोटो अपलोड करें (Upload File)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogoInputType('URL')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    logoInputType === 'URL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>वेब इमेज लिंक (Image URL)</span>
                </button>
              </div>

              {/* File Upload Option */}
              {logoInputType === 'FILE' && (
                <div className="space-y-4">
                  <div
                    onClick={() => logoFileRef.current?.click()}
                    className="border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-3xl p-8 text-center bg-rose-50/20 hover:bg-rose-50/40 transition-all cursor-pointer space-y-3 group"
                  >
                    <input
                      ref={logoFileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setLogoUploading(true);
                        try {
                          const res = await uploadLogo(file, 'Admin');
                          if (res.success) {
                            setStatusMessage({
                              type: 'success',
                              text: 'नया लोगो सफलतापूर्वक अपलोड व लागू हो गया!',
                            });
                          } else {
                            setStatusMessage({ type: 'error', text: res.error || 'अपलोड विफल' });
                          }
                        } finally {
                          setLogoUploading(false);
                        }
                      }}
                    />

                    <div className="w-14 h-14 rounded-2xl bg-white shadow-md mx-auto flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-7 h-7" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {logoUploading ? 'लोगो प्रोसेस किया जा रहा है...' : 'नया लोगो चुनने के लिए यहाँ क्लिक करें'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, SVG, WebP फ़ॉर्मेट समर्थित (अधिकतम 5 MB).
                      </p>
                    </div>

                    <span className="inline-block px-3 py-1 bg-white text-rose-700 text-xs font-bold rounded-full shadow-xs border border-rose-200">
                      ब्राउज़ करें (Browse Image)
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    💡 <strong>सुझाव:</strong> संबलपुर ट्रक ओनर्स एसोसिएशन का उच्च-रिज़ॉल्यूशन गोलाकार लोगो (चौकोर या पारदर्शी पृष्ठभूमि) सबसे अच्छा दिखता है। सिस्टम ऑटोमैटिक रूप से इसे ऑप्टिमाइज़ कर देगा।
                  </p>
                </div>
              )}

              {/* URL Option */}
              {logoInputType === 'URL' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      छवि का सीधा इंटरनेट लिंक (Direct Image URL):
                    </label>
                    <input
                      type="url"
                      value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)}
                      placeholder="https://example.com/stoa-logo.png"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={!customLogoUrl.trim() || logoUploading}
                    onClick={async () => {
                      if (!customLogoUrl.trim()) return;
                      setLogoUploading(true);
                      try {
                        const res = await setCustomUrl(customLogoUrl.trim(), 'Admin');
                        if (res.success) {
                          setStatusMessage({
                            type: 'success',
                            text: 'वेब लोगो लिंक सफलतापूर्वक सेट हो गया!',
                          });
                          setCustomLogoUrl('');
                        } else {
                          setStatusMessage({ type: 'error', text: res.error || 'अमान्य लिंक' });
                        }
                      } finally {
                        setLogoUploading(false);
                      }
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {logoUploading ? 'लागू किया जा रहा है...' : 'यह लोगो लागू करें (Save Logo URL)'}
                  </button>
                </div>
              )}

              {onOpenLogoModal && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">एडवांस्ड लोगो स्टूडियो में और विकल्प उपलब्ध हैं:</span>
                  <button
                    type="button"
                    onClick={onOpenLogoModal}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                    <span>लोगो स्टूडियो पॉपअप खोलें</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: ASSOCIATION PROFILE */}
      {activeTab === 'PROFILE' && (
        <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600" />
              एसोसिएशन मूल पहचान व संपर्क विवरण
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              यह जानकारी मुख्य स्क्रीन, गेट पास हेडर, आधिकारिक नोटिस और पावती पर प्रदर्शित होती है।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">एसोसिएशन का नाम:</label>
              <input
                type="text"
                required
                value={profileForm.associationName}
                onChange={(e) => setProfileForm({ ...profileForm, associationName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">टैगलाइन / उपशीर्षक:</label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">स्थापना वर्ष (ESTD):</label>
              <input
                type="text"
                value={profileForm.estdYear}
                onChange={(e) => setProfileForm({ ...profileForm, estdYear: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">सरकारी पंजीकरण संख्या (Reg No):</label>
              <input
                type="text"
                value={profileForm.regNumber}
                onChange={(e) => setProfileForm({ ...profileForm, regNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">कार्यालय का भौतिक पता:</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">कंट्रोल रूम हेल्पलाइन नंबर:</label>
              <input
                type="text"
                value={profileForm.helplineMobile}
                onChange={(e) => setProfileForm({ ...profileForm, helplineMobile: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">आपातकालीन नंबर (हाइवे व पुलिस):</label>
              <input
                type="text"
                value={profileForm.emergencyMobile}
                onChange={(e) => setProfileForm({ ...profileForm, emergencyMobile: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">आधिकारिक ईमेल आईडी:</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">एसोसिएशन आधिकारिक UPI ID:</label>
              <input
                type="text"
                value={profileForm.upiId}
                onChange={(e) => setProfileForm({ ...profileForm, upiId: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'एसोसिएशन प्रोफ़ाइल सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: EXECUTIVES DIRECTORY */}
      {activeTab === 'EXECUTIVES' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-600" />
                कार्यकारिणी, अध्यक्ष व पदाधिकारी प्रबंधन
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                यहाँ से किसी भी पदाधिकारी का नाम, पद, फोन नंबर बदलें या नया सदस्य जोड़ें। यह एसटीओए एआई और ओनर ऐप में तुरंत दिखेगा।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddExec}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नया पदाधिकारी जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {config.executives?.map((exec) => (
              <div
                key={exec.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 hover:border-rose-300 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{exec.name}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold uppercase ${
                        exec.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {exec.isActive ? 'सक्रिय' : 'निष्क्रिय'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 block mt-0.5">{exec.designation}</span>
                  <div className="text-xs text-slate-600 mt-1 space-y-0.5 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{exec.mobile}</span>
                    </div>
                    {exec.plantInCharge && (
                      <div className="text-[11px] text-slate-500 font-sans">
                        प्रभार: {exec.plantInCharge}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditExec(exec)}
                    title="संपादित करें"
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExecutive(exec.id, exec.name)}
                    title="हटाएं"
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: 15-TO-15 ROTATION RULES */}
      {activeTab === 'ROTATION' && (
        <form onSubmit={handleSaveRotation} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              15-टू-15 आवर्तन चक्र व लोडिंग नीतियां
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              संबलपुर एसोसिएशन का 15-टू-15 चक्र नियम, गैरहाजिरी रिपोर्टिंग समय और नंबर कटिंग नीतियां यहाँ से निर्धारित करें।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">चक्र 1 अवधि (Cycle 1):</label>
              <input
                type="text"
                value={rotationForm.rotationCycle1Days}
                onChange={(e) => setRotationForm({ ...rotationForm, rotationCycle1Days: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">उदा. 1 से 15 तारीख तक</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">चक्र 2 अवधि (Cycle 2):</label>
              <input
                type="text"
                value={rotationForm.rotationCycle2Days}
                onChange={(e) => setRotationForm({ ...rotationForm, rotationCycle2Days: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">उदा. 16 से माह अंतिम तारीख तक</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                नंबर जंप करने पर दंड (Penalty Serials):
              </label>
              <input
                type="number"
                value={rotationForm.rotationJumpPenaltySerials}
                onChange={(e) => setRotationForm({ ...rotationForm, rotationJumpPenaltySerials: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">नियम तोड़ने पर गाड़ी का क्रम इतने नंबर पीछे किया जाएगा</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                पुकार के बाद प्लांट रिपोर्टिंग ग्रेस समय (घंटे):
              </label>
              <input
                type="number"
                value={rotationForm.absentGraceHours}
                onChange={(e) => setRotationForm({ ...rotationForm, absentGraceHours: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">इस समय के भीतर गाड़ी उपस्थित न होने पर अगला नंबर पुकारा जाएगा</span>
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rotationForm.preserveRotationOnPendingFreight}
                  onChange={(e) =>
                    setRotationForm({ ...rotationForm, preserveRotationOnPendingFreight: e.target.checked })
                  }
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  पेंडिंग भाड़ा होने पर गाड़ी का 15-टू-15 क्रम सुरक्षित रखें (Preserve Rotation on Pending Balance)
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'रोटेशन नियम सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: FEES & SLABS */}
      {activeTab === 'FEES' && (
        <form onSubmit={handleSaveFees} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              एसोसिएशन लोडिंग फीस व सदस्यता दर स्लैब
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              यहाँ निर्धारित दरें डिजिटल गेट पास जारी करते समय और सदस्यता नवीनीकरण पर स्वतः लागू होंगी।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl">
              <label className="block text-rose-950 font-bold mb-1">
                भारी वाहन लोडिंग फीस (&gt;18 टन / Multi-Axle):
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-rose-700 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={feeForm.heavyFeeAbove18Ton}
                  onChange={(e) => setFeeForm({ ...feeForm, heavyFeeAbove18Ton: Number(e.target.value) })}
                  className="w-full bg-white border border-rose-300 rounded-xl pl-7 pr-3 py-2 text-base font-black text-rose-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <span className="text-[10px] text-rose-700/80 mt-1 block">12-पहिया व ट्रेलर गाड़ियों के लिए (मानक: ₹700)</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="block text-slate-800 font-bold mb-1">
                मध्यम वाहन लोडिंग फीस (&le;18 टन / 6 &amp; 10-Wheel):
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-slate-700 font-bold font-mono">₹</span>
                <input
                  type="number"
                  value={feeForm.standardFeeUpTo18Ton}
                  onChange={(e) => setFeeForm({ ...feeForm, standardFeeUpTo18Ton: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-3 py-2 text-base font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">6 व 10-पहिया गाड़ियों के लिए (मानक: ₹500)</span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">6 माह सदस्यता नवीनीकरण दर (₹):</label>
              <input
                type="number"
                value={feeForm.membership6Months}
                onChange={(e) => setFeeForm({ ...feeForm, membership6Months: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">12 माह (वार्षिक) सदस्यता दर (₹):</label>
              <input
                type="number"
                value={feeForm.membership12Months}
                onChange={(e) => setFeeForm({ ...feeForm, membership12Months: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">24 माह (द्विवार्षिक) सदस्यता दर (₹):</label>
              <input
                type="number"
                value={feeForm.membership24Months}
                onChange={(e) => setFeeForm({ ...feeForm, membership24Months: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'फीस दरें सहेजें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: PLANTS & ROUTES */}
      {activeTab === 'PLANTS' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-rose-600" />
                औद्योगिक प्लांट्स व लोडिंग गंतव्य रूट्स
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                संबलपुर क्षेत्र के सभी अधिकृत उद्योग। नए प्लांट या रूट जोड़ें, दैनिक क्षमता तय करें या निष्क्रिय करें।
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddPlant}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>नया प्लांट जोड़ें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.plants?.map((plt) => (
              <div
                key={plt.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between hover:border-rose-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{plt.name}</span>
                      <span className="text-[10px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                        {plt.code}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        plt.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {plt.isActive ? 'सक्रिय' : 'बंद'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mt-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{plt.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-500">दैनिक क्षमता:</span>
                      <strong className="text-slate-900">{plt.dailyCapacity} गाड़ियां</strong>
                    </div>
                    {plt.contactPerson && (
                      <div className="text-[11px] text-slate-500">
                        संपर्क: {plt.contactPerson} ({plt.contactMobile || 'N/A'})
                      </div>
                    )}
                  </div>

                  {plt.destinations && plt.destinations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60">
                      <span className="text-[10px] font-semibold text-slate-500 block mb-1">प्रमुख गंतव्य रूट्स:</span>
                      <div className="flex flex-wrap gap-1">
                        {plt.destinations.map((d, i) => (
                          <span key={i} className="text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlant(plt)}
                    className="px-2.5 py-1 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>संपादित करें</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlant(plt.id, plt.name)}
                    className="px-2.5 py-1 text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: LIVE BROADCAST TICKER */}
      {activeTab === 'TICKER' && (
        <form onSubmit={handleSaveTicker} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-600" />
              लाइव सूचना प्रसारण व टिकर रिबन (Live Marquee Ticker)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              यहाँ लिखा गया संदेश सभी ट्रक मालिकों के मोबाइल ऐप के सबसे ऊपर लाइव स्क्रॉलिंग रिबन में तुरंत प्रदर्शित होगा।
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                प्रसारण संदेश टेक्स्ट (Broadcast Message):
              </label>
              <textarea
                rows={3}
                required
                value={tickerForm.text}
                onChange={(e) => setTickerForm({ ...tickerForm, text: e.target.value })}
                placeholder="उदा. 📢 आवश्यक सूचना: हिंडाल्को में आज दोपहर 2 बजे से गेट नं 3 पर लोडिंग चालू होगी..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">गंभीरता स्तर (Alert Severity):</label>
                <select
                  value={tickerForm.type}
                  onChange={(e) => setTickerForm({ ...tickerForm, type: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                >
                  <option value="INFO">सामान्य सूचना (Standard Maroon/Blue)</option>
                  <option value="WARNING">महत्वपूर्ण चेतावनी (Yellow Warning)</option>
                  <option value="EMERGENCY">आपातकाल / तुरंत ध्यान दें (Red Emergency Alert)</option>
                </select>
              </div>

              <div className="flex items-center sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tickerForm.isActive}
                    onChange={(e) => setTickerForm({ ...tickerForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    टिकर को सभी स्क्रीन पर सक्रिय (LIVE) रखें
                  </span>
                </label>
              </div>
            </div>

            {/* Live Ticker Preview */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">लाइव प्रिव्यू (Live Preview):</span>
              <div
                className={`p-2 rounded-xl text-xs flex items-center gap-2 font-medium ${
                  tickerForm.type === 'EMERGENCY'
                    ? 'bg-red-600 text-white font-bold'
                    : tickerForm.type === 'WARNING'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-rose-900 text-rose-50'
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{tickerForm.text || 'संदेश यहाँ दिखाई देगा...'}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'सहेजा जा रहा है...' : 'लाइव टिकर प्रसारित करें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: SECURITY & PIN */}
      {activeTab === 'SECURITY' && (
        <form onSubmit={handleSavePin} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs max-w-md">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-600" />
              एडमिन सुरक्षा पिन (Admin Security PIN)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              कंट्रोल रूम में लॉगिन के लिए प्रयुक्त 4 या अधिक अंकों का गुप्त सुरक्षा पिन बदलें।
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">नया सुरक्षा पिन (New PIN):</label>
              <input
                type="password"
                required
                maxLength={8}
                value={pinForm.newPin}
                onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                placeholder="उदा. 4589"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">नया सुरक्षा पिन पुनः दर्ज करें:</label>
              <input
                type="password"
                required
                maxLength={8}
                value={pinForm.confirmPin}
                onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                placeholder="उदा. 4589"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-base font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'बदला जा रहा है...' : 'सुरक्षा पिन अद्यतन करें'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 8: BACKUP & RESTORE */}
      {activeTab === 'BACKUP' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-rose-600" />
              संपूर्ण सिस्टम डेटा बैकअप व आपदा पुनर्प्राप्ति (Disaster Recovery)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              सभी गाड़ियां, मालिक, 15-टू-15 लेजर, गेट पास, पुकार और कॉन्फ़िगरेशन को सुरक्षित .JSON फ़ाइल में डाउनलोड या रिस्टोर करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export Card */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">1. पूर्ण सिस्टम बैकअप डाउनलोड</span>
                <p className="text-xs text-slate-500 mt-1">
                  फ्लीट डेटाबेस, लेजर एंट्रीज़, सक्रिय पुकार और मास्टर सेटिंग्स का पूर्ण स्नैपशॉट अपने कंप्यूटर पर सुरक्षित रखें।
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSystemSnapshot}
                className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>बैकअप फ़ाइल डाउनलोड करें (.json)</span>
              </button>
            </div>

            {/* Restore Card */}
            <div className="p-5 bg-rose-50/40 border border-rose-200 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm block">2. बैकअप फ़ाइल से पुनर्स्थापित करें</span>
                <p className="text-xs text-slate-500 mt-1">
                  यदि कभी सिस्टम रीसेट करना हो, तो पूर्व में डाउनलोड की गई .json बैकअप फ़ाइल अपलोड करके 1 सेकंड में पूरा डेटा बहाल करें।
                </p>
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleRestoreFile}
                  id="stoa-restore-input"
                  className="hidden"
                />
                <label
                  htmlFor="stoa-restore-input"
                  className="w-full py-2.5 bg-white hover:bg-rose-50 border border-rose-300 text-rose-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>बैकअप फ़ाइल चुनें व रिस्टोर करें</span>
                </label>
              </div>
            </div>
          </div>

          {/* Commercial Production & Sales Demo Hub */}
          <div className="pt-4 border-t border-slate-200">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-mono font-bold uppercase">
                      Commercial Production Ready
                    </span>
                    <span className="text-xs font-bold text-amber-300">
                      ★ क्लाइंट विक्रय एवं डेमो प्रबंधन
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    वाणिज्यिक उत्पादन स्थिति व स्वच्छ शुरुआत (Commercial Clean Slate)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    सॉफ़्टवेयर को क्लाइंट / ट्रक एसोसिएशन को विक्रय करते समय डेटाबेस को 100% स्वच्छ शुरुआत (0 गाड़ियां, 0 गेट पास) पर रीसेट करें, अथवा डेमो प्रेजेंटेशन हेतु नमूना डेटा लोड करें।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* 100% Clean Slate Button */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-rose-300 block">
                    1. 100% स्वच्छ शुरुआत (0 वाहन)
                  </span>
                  <p className="text-[11px] text-slate-300">
                    सभी पुराने टेस्ट वाहनों व पावती को हटाकर सिस्टम को एकदम नई शुरुआत हेतु तैयार करें।
                  </p>
                  <button
                    type="button"
                    onClick={handleCleanSlate}
                    className="w-full mt-2 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>डेटाबेस पूर्ण स्वच्छ करें (Clean Slate)</span>
                  </button>
                </div>

                {/* Sales Demo Fleet Button */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-emerald-300 block">
                    2. बिक्री प्रेजेंटेशन डेमो डेटा
                  </span>
                  <p className="text-[11px] text-slate-300">
                    ट्रक यूनियन व प्रशासनिक अधिकारियों को संपूर्ण कार्यप्रणाली दिखाने हेतु उच्च-गुणवत्ता नमूना गाड़ियां लोड करें।
                  </p>
                  <button
                    type="button"
                    onClick={handleSeedDemo}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>डेमो फ्लीट लोड करें (Load Demo)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT EXECUTIVE */}
      {showExecModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              {editingExecId ? 'पदाधिकारी विवरण संपादित करें' : 'नया पदाधिकारी जोड़ें'}
            </h3>

            <form onSubmit={handleSaveExecutive} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">पूरा नाम:</label>
                <input
                  type="text"
                  required
                  value={execForm.name}
                  onChange={(e) => setExecForm({ ...execForm, name: e.target.value })}
                  placeholder="उदा. सरदार बलविंदर सिंह"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">पद (Designation):</label>
                <input
                  type="text"
                  required
                  value={execForm.designation}
                  onChange={(e) => setExecForm({ ...execForm, designation: e.target.value })}
                  placeholder="उदा. प्रेसिडेंट (अध्यक्ष), महासचिव, कोषाध्यक्ष"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">मोबाइल नंबर:</label>
                <input
                  type="tel"
                  required
                  value={execForm.mobile}
                  onChange={(e) => setExecForm({ ...execForm, mobile: e.target.value })}
                  placeholder="+91 94370 11111"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">कार्यक्षेत्र / प्लांट प्रभार (वैकल्पिक):</label>
                <input
                  type="text"
                  value={execForm.plantInCharge}
                  onChange={(e) => setExecForm({ ...execForm, plantInCharge: e.target.value })}
                  placeholder="उदा. लपंगा प्लांट प्रभारी अथवा वित्तीय प्रबंधन"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={execForm.isActive}
                    onChange={(e) => setExecForm({ ...execForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-800">सक्रिय पदाधिकारी (Active in Directory)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExecModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isSaving ? 'सहेजा जा रहा है...' : 'सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PLANT */}
      {showPlantModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-slate-900">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Factory className="w-4 h-4 text-rose-600" />
              {editingPlantId ? 'प्लांट विवरण संपादित करें' : 'नया औद्योगिक प्लांट जोड़ें'}
            </h3>

            <form onSubmit={handleSavePlant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">प्लांट का नाम:</label>
                <input
                  type="text"
                  required
                  value={plantForm.name}
                  onChange={(e) => setPlantForm({ ...plantForm, name: e.target.value })}
                  placeholder="उदा. हिंडाल्को स्मेल्टर प्लांट"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">प्लांट कोड:</label>
                  <input
                    type="text"
                    value={plantForm.code}
                    onChange={(e) => setPlantForm({ ...plantForm, code: e.target.value.toUpperCase() })}
                    placeholder="HND"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">दैनिक क्षमता (गाड़ियां):</label>
                  <input
                    type="number"
                    value={plantForm.dailyCapacity}
                    onChange={(e) => setPlantForm({ ...plantForm, dailyCapacity: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">स्थान (Location):</label>
                <input
                  type="text"
                  required
                  value={plantForm.location}
                  onChange={(e) => setPlantForm({ ...plantForm, location: e.target.value })}
                  placeholder="उदा. हिराकुद, संबलपुर"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">संपर्क व्यक्ति:</label>
                  <input
                    type="text"
                    value={plantForm.contactPerson}
                    onChange={(e) => setPlantForm({ ...plantForm, contactPerson: e.target.value })}
                    placeholder="श्री एम.के. शर्मा"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">संपर्क मोबाइल:</label>
                  <input
                    type="tel"
                    value={plantForm.contactMobile}
                    onChange={(e) => setPlantForm({ ...plantForm, contactMobile: e.target.value })}
                    placeholder="9861011001"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">प्रमुख गंतव्य रूट्स (कॉमा से अलग करें):</label>
                <input
                  type="text"
                  value={plantForm.destinationsStr}
                  onChange={(e) => setPlantForm({ ...plantForm, destinationsStr: e.target.value })}
                  placeholder="रायपुर, विशाखापट्टनम, हल्दिया, नागपुर"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={plantForm.isActive}
                    onChange={(e) => setPlantForm({ ...plantForm, isActive: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span className="font-semibold text-slate-800">सक्रिय प्लांट (Active for Loading)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlantModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isSaving ? 'सहेजा जा रहा है...' : 'सहेजें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 9: STEP-BY-STEP ADMIN GUIDE & MANUAL */}
      {activeTab === 'GUIDE' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-rose-600" />
              {language === 'en' ? 'Administrative Operation Manual & System Guide' : 'प्रशासनिक संचालन एवं संपादन संपूर्ण मार्गदर्शिका'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'en'
                ? 'Complete guidance for administrators on how to edit, customize, manage, and backup any part of the application.'
                : 'एडमिनिस्ट्रेटर के लिए पूरे एप्लिकेशन में किसी भी डेटा, नियम, लोगो, गाड़ी, लोड व सेटिंग्स को बदलने की विस्तृत निर्देशिका।'}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Guide Item 1: Logo */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">1</span>
                  एसोसिएशन का लोगो (Logo) कैसे बदलें या नया लगाएं?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('LOGO')}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs cursor-pointer"
                >
                  लोगो टैब पर जाएं
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • ऊपर दिए गए <strong>'लोगो व ब्रांडिंग'</strong> टैब पर जाएं।<br />
                • <strong>'नया फोटो अपलोड करें'</strong> पर क्लिक करके अपने कंप्यूटर से कोई भी PNG, JPG या SVG फ़ाइल चुनें, अथवा सीधे <strong>'इमेज लिंक'</strong> दर्ज करें।<br />
                • सिस्टम तुरंत इसे संबलपुर ट्रक ओनर्स एसोसिएशन के आधिकारिक आकार में कन्वर्ट कर देगा और यह तुरंत सभी स्क्रीन (लॉगिन, हेडर, डिजिटल पर्ची) पर दिखने लगेगा।<br />
                • यदि कभी वापस मूल आधिकारिक सील चाहिए, तो <strong>'डिफ़ॉल्ट लोगो पर रीसेट करें'</strong> बटन दबाएं।
              </p>
            </div>

            {/* Guide Item 2: Vehicles */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">2</span>
                  किसी भी ट्रक का नंबर, मालिक का नाम या मोबाइल नंबर कैसे संपादित करें?
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('fleet')}
                  className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  फ्लीट टैब पर जाएं
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • मुख्य नेविगेशन बार में <strong>'फ्लीट (Fleet)'</strong> टैब खोलें।<br />
                • सर्च बॉक्स में गाड़ी नंबर (जैसे: <strong>OD15...</strong>), मालिक का नाम या मोबाइल नंबर लिखकर खोजें।<br />
                • संबंधित गाड़ी के सामने बने <strong>'संपादित करें (Edit)'</strong> बटन पर क्लिक करें।<br />
                • आप मालिक का नाम, पंजीकृत मोबाइल नंबर, वाहन श्रेणी (10-चक्का, 12-चक्का, ट्रेलर), टन क्षमता या सीरियल नंबर बदल सकते हैं और <strong>'परिवर्तन सहेजें'</strong> पर क्लिक करें।<br />
                • नई गाड़ी जोड़ने के लिए <strong>'+ नया वाहन जोड़ें'</strong> का उपयोग करें।
              </p>
            </div>

            {/* Guide Item 3: Daily Load */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">3</span>
                  दैनिक लोडिंग कोटा, नया लोड व भाड़ा दर कैसे पोस्ट करें?
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('loading')}
                  className="px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs cursor-pointer"
                >
                  लोडिंग टैब पर जाएं
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • <strong>'दैनिक लोड व डिस्पैच'</strong> टैब में जाएं और <strong>'+ रोजाना लोड पोस्ट करें'</strong> पर क्लिक करें।<br />
                • कंपनी (हिंडाल्को, वेदांत, आदित्य बिड़ला लपंगा), गंतव्य, अनिवार्य वाहन श्रेणी, कुल ट्रक कोटा और भाड़ा दर ₹/टन दर्ज करें।<br />
                • <strong>'लोड पोस्ट करें'</strong> पर क्लिक करते ही यह सभी संबंधित ट्रक मालिकों के मोबाइल ऐप पर दिखाई देने लगेगा।
              </p>
            </div>

            {/* Guide Item 4: Ticker */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">4</span>
                  सभी उपयोगकर्ताओं को स्क्रीन पर लाइव टिकर संदेश / अलर्ट कैसे प्रसारित करें?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('TICKER')}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs cursor-pointer"
                >
                  टिकर टैब पर जाएं
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • <strong>'लाइव सूचना टिकर'</strong> टैब में जाएं।<br />
                • अपना संदेश लिखें (जैसे: प्लांट में लोडिंग समय, अवकाश, बैठक या आवश्यक निर्देश)।<br />
                • स्तर चुनें (सामान्य / चेतावनी / आपातकालीन) और <strong>'लाइव रखें'</strong> चेकबॉक्स टिक करके सहेजें।<br />
                • यह तुरंत सभी सक्रिय मोबाइलों और स्क्रीनों के ऊपर चमकती पट्टी में दौड़ने लगेगा।
              </p>
            </div>

            {/* Guide Item 5: Rotation & Fees */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">5</span>
                  15-टू-15 रोटेशन नियम या एसोसिएशन शुल्क दरें कैसे बदलें?
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveTab('ROTATION')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    रोटेशन नियम
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('FEES')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-xs cursor-pointer"
                  >
                    फीस दरें
                  </button>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • <strong>'15-टू-15 नियम'</strong> टैब में आवर्तन चक्र की तिथियां, जंप पेनाल्टी (डिफ़ॉल्ट 50 क्रम) व ग्रेस घंटे बदले जा सकते हैं।<br />
                • <strong>'फीस व दर स्लैब'</strong> टैब में भारी वाहन शुल्क (&gt;18T ₹700) व मध्यम वाहन शुल्क (&le;18T ₹500) तथा 6/12/24 माह की सदस्यता दरें कभी भी संशोधित की जा सकती हैं।
              </p>
            </div>

            {/* Guide Item 6: Backup */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">6</span>
                  सिस्टम डेटा बैकअप कैसे लें व सुरक्षित रखें?
                </span>
                <button
                  type="button"
                  onClick={downloadSystemSnapshot}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>बैकअप डाउनलोड</span>
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                • <strong>'डेटा बैकअप'</strong> टैब में <strong>'बैकअप फ़ाइल डाउनलोड करें'</strong> पर क्लिक करें।<br />
                • आपकी पूरी फ्लीट, चालू लोडिंग पर्चियां, 15-टू-15 लेजर और सभी सेटिंग्स 1 सेकंड में .json फ़ाइल के रूप में सुरक्षित डाउनलोड हो जाएंगी।<br />
                • भविष्य में नए कंप्यूटर या ब्राउज़र पर डेटा बहाल करने के लिए उसी फ़ाइल को <strong>'बैकअप फ़ाइल चुनें व रिस्टोर करें'</strong> से अपलोड कर सकते हैं।
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
