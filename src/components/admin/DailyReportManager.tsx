import React, { useState, useEffect } from 'react';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  DailyReportConfig,
  DailyReportSummary,
  ReportEmailLog,
  AdminEmailRecipient,
  SmtpConfig,
} from '../../types/index.js';
import {
  FileText,
  Mail,
  Download,
  Eye,
  Send,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Truck,
  DollarSign,
  ShieldCheck,
  Building2,
  X,
  Share2,
  Printer,
  Settings,
  Search,
  Filter,
  Check,
} from 'lucide-react';

export const DailyReportManager: React.FC = () => {
  const { t, language } = useLanguageTheme();

  // Selected date state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Core Data
  const [summary, setSummary] = useState<DailyReportSummary | null>(null);
  const [config, setConfig] = useState<DailyReportConfig | null>(null);
  const [logs, setLogs] = useState<ReportEmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Action states
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Test email modal
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('official.pankajsahani@gmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // New recipient form state
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [newRecipName, setNewRecipName] = useState('');
  const [newRecipEmail, setNewRecipEmail] = useState('');
  const [newRecipRole, setNewRecipRole] = useState('Administrative Officer');
  const [isSavingRecip, setIsSavingRecip] = useState(false);

  // Schedule settings
  const [scheduledTime, setScheduledTime] = useState('20:00');
  const [autoEmailEnabled, setAutoEmailEnabled] = useState(true);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // SMTP Settings Modal
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [isVerifyingSmtp, setIsVerifyingSmtp] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [directEmailToast, setDirectEmailToast] = useState(false);

  // Itemized log filter & search
  const [opSearch, setOpSearch] = useState('');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState('ALL');

  // Verify SMTP Connection
  const handleVerifySmtp = async () => {
    setIsVerifyingSmtp(true);
    setVerifyResult(null);
    try {
      const res = await fetch('/api/reports/smtp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost.trim(),
          port: Number(smtpPort),
          user: smtpUser.trim(),
          pass: smtpPass,
        }),
      });
      const data = await res.json();
      setVerifyResult({ success: data.success, message: data.message });
    } catch (err: any) {
      setVerifyResult({ success: false, message: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setIsVerifyingSmtp(false);
    }
  };

  // 1-Click Direct Webmail Compose (Gmail / Default Mail Client) with instant PDF download
  const handleDirectWebmailCompose = (targetTo?: string) => {
    const recipientsList = targetTo
      ? [targetTo]
      : (config?.recipients || []).filter((r) => r.notifyDaily).map((r) => r.email);

    const toStr = recipientsList.join(',');
    const subject = `STOA NEXTGEN: आधिकारिक दैनिक लोडिंग रिपोर्ट सारांश — ${selectedDate} (Ref: ${summary?.referenceNumber || 'STOA-RPT'})`;

    const plantText = (summary?.plantBreakdown || [])
      .map((p) => `• ${p.plant}: ${p.trucksCount} गाड़ियां (${p.tonnage} MT)`)
      .join('\n');

    const bodyText = `महोदय / महोदया,\n\nदिनांक ${selectedDate} को संबलपुर क्षेत्र के विभिन्न औद्योगिक संयंत्रों (हिंडाल्को, वेदांत, आदित्य बिड़ला लापंगा, इत्यादि) के लिए संपन्न हुए लोडिंग संचालन का आधिकारिक दैनिक सारांश निम्न प्रकार है:\n\n• कुल आवंटित गाड़ियां: ${summary?.totalPassesIssued || 0} Trucks\n• कुल प्रेषित माल: ${(summary?.totalWeightTon || 0).toLocaleString()} MT\n• एसोसिएशन उपकर संग्रह: ₹${(summary?.totalFeeCollected || 0).toLocaleString('en-IN')}\n• कतार में प्रतीक्षारत गाड़ियां: ${summary?.inQueueCount || 0} Trucks\n\nसंयंत्र-वार वितरण:\n${plantText}\n\n📌 कृपया आधिकारिक मुहर व हस्ताक्षरित विस्तृत वाहन-वार लोडिंग लॉग हेतु संलग्न PDF देखें। (PDF फ़ाइल डाउनलोड हो चुकी है)\n\n---\nसंबलपुर ट्रक ओनर्स एसोसिएशन (STOA NEXTGEN)\nकेन्द्रीय नियंत्रण कक्ष, धनुपाली, संबलपुर\nहेल्पलाइन: 0663-2400123 / 9437012345`;

    // 1. Download PDF file
    const pdfLink = document.createElement('a');
    pdfLink.href = `/api/reports/daily-loading/pdf?date=${selectedDate}`;
    pdfLink.download = `STOA_Daily_Loading_Report_${selectedDate}.pdf`;
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);

    // 2. Open Gmail Web Compose
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toStr)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    const newWin = window.open(gmailUrl, '_blank');
    if (!newWin) {
      window.location.href = `mailto:${toStr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    }

    setDirectEmailToast(true);
    setTimeout(() => setDirectEmailToast(false), 6000);
  };

  // Fetch report summary for selected date
  const fetchSummary = async (date: string) => {
    try {
      const prevRes = await fetch(`/api/reports/daily-loading/preview?date=${date}`);
      const prevData = await prevRes.json();
      if (prevData.summary) setSummary(prevData.summary);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  // Fetch all report data
  const fetchReportData = async () => {
    setLoading(true);
    try {
      await fetchSummary(selectedDate);

      // Report Config & Recipients
      const confRes = await fetch('/api/reports/config');
      const confData = await confRes.json();
      if (confData.config) {
        setConfig(confData.config);
        setScheduledTime(confData.config.scheduledTime || '20:00');
        setAutoEmailEnabled(confData.config.autoEmailEnabled ?? true);
        if (confData.config.smtp) {
          setSmtpHost(confData.config.smtp.host || '');
          setSmtpPort(confData.config.smtp.port || 587);
          setSmtpUser(confData.config.smtp.user || '');
          setSmtpFrom(confData.config.smtp.from || '');
        }
      }

      // Email History Logs
      const logsRes = await fetch('/api/reports/email-history');
      const logsData = await logsRes.json();
      if (logsData.logs) setLogs(logsData.logs);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // When date changes
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    fetchSummary(newDate);
  };

  // Send Email Now to all active registered recipients
  const handleSendEmailNow = async () => {
    setIsSendingEmail(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/reports/daily-loading/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate }),
      });
      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.message || (data.success ? 'रिपोर्ट सफलतापूर्वक ईमेल कर दी गई।' : 'ईमेल प्रेषण विफल।'),
      });
      fetchReportData();
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Send Test Email to a single address
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress.trim()) return;
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/reports/daily-loading/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEmail: testEmailAddress.trim(),
          date: selectedDate,
          isTest: true,
        }),
      });
      const data = await res.json();
      setSendResult({
        success: data.success,
        message: data.success
          ? `परीक्षण PDF रिपोर्ट सफलतापूर्वक ${testEmailAddress} पर भेजी गई।`
          : `परीक्षण विफल: ${data.message}`,
      });
      setShowTestEmailModal(false);
      fetchReportData();
    } catch (err: any) {
      setSendResult({ success: false, message: err.message || 'नेटवर्क त्रुटि' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Save Schedule settings
  const handleSaveScheduleConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/reports/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoEmailEnabled,
          scheduledTime,
        }),
      });
      if (res.ok) {
        setConfigSavedToast(true);
        setTimeout(() => setConfigSavedToast(false), 3000);
        fetchReportData();
      }
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Save SMTP Settings
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    try {
      const res = await fetch('/api/reports/smtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost,
          port: Number(smtpPort),
          user: smtpUser,
          pass: smtpPass,
          from: smtpFrom,
        }),
      });
      if (res.ok) {
        setShowSmtpModal(false);
        setSendResult({ success: true, message: 'SMTP सेटिंग्स सफलतापूर्वक सुरक्षित की गईं।' });
        fetchReportData();
      }
    } catch (err: any) {
      setSendResult({ success: false, message: err.message });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  // Add Recipient
  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipName.trim() || !newRecipEmail.trim()) return;
    setIsSavingRecip(true);
    try {
      const res = await fetch('/api/reports/recipients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRecipName,
          email: newRecipEmail,
          role: newRecipRole,
        }),
      });
      if (res.ok) {
        setNewRecipName('');
        setNewRecipEmail('');
        setShowAddRecipientModal(false);
        fetchReportData();
      }
    } catch (err) {
      console.error('Failed to add recipient:', err);
    } finally {
      setIsSavingRecip(false);
    }
  };

  // Toggle recipient notification
  const handleToggleRecipient = async (id: string) => {
    try {
      const res = await fetch(`/api/reports/recipients/${id}/toggle`, { method: 'POST' });
      if (res.ok) fetchReportData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Recipient
  const handleDeleteRecipient = async (id: string, email: string) => {
    try {
      const res = await fetch(`/api/reports/recipients/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReportData();
    } catch (err) {
      console.error('Failed to delete recipient:', err);
    }
  };

  // Open PDF Preview Modal
  const handleOpenPdfPreview = () => {
    const url = `/api/reports/daily-loading/pdf?date=${selectedDate}&t=${Date.now()}`;
    setPreviewPdfUrl(url);
    setShowPreviewModal(true);
  };

  // Share summary on WhatsApp
  const handleShareWhatsApp = () => {
    if (!summary) return;
    const plantText = summary.plantBreakdown
      .map((p) => `• ${p.plant}: ${p.trucksCount} गाड़ियां (${p.tonnage} MT)`)
      .join('\n');

    const msg = `*🚛 संबलपुर ट्रक ओनर्स एसोसिएशन (STOA NEXTGEN)*\n*दैनिक लोडिंग एवं प्रेषण रिपोर्ट सारांश*\n📅 दिनांक: ${summary.reportDate} | 15-टू-15 आवर्तन\n📄 संदर्भ: ${summary.referenceNumber}\n\n📊 *मुख्य आंकड़े:*\n• कुल आवंटित गाड़ियां: *${summary.totalPassesIssued} Trucks*\n• कुल प्रेषित माल: *${summary.totalWeightTon.toLocaleString()} MT*\n• एसोसिएशन उपकर: *₹${summary.totalFeeCollected.toLocaleString('en-IN')}*\n• कतार में प्रतीक्षारत: *${summary.inQueueCount} Trucks*\n\n🏭 *संयंत्र-वार विवरण:*\n${plantText}\n\n_संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्वारा स्वतः उत्पन्न आधिकारिक रिपोर्ट_`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Filtered operations
  const filteredOperations = (summary?.operations || []).filter((op) => {
    if (selectedPlantFilter !== 'ALL' && op.plant !== selectedPlantFilter) return false;
    if (opSearch) {
      const q = opSearch.toLowerCase();
      return (
        op.vehicleNumber.toLowerCase().includes(q) ||
        op.ownerName.toLowerCase().includes(q) ||
        op.token.toLowerCase().includes(q) ||
        String(op.serialNumber).includes(q) ||
        op.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-blue-900/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <FileText className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-rose-400 uppercase">
                {language === 'en' ? 'Certified Daily Operations & Dispatch' : 'आधिकारिक दैनिक लोडिंग रिपोर्ट'}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-semibold">
                PDF & Email Automated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              {language === 'en'
                ? 'Daily Fleet Loading PDF Report & Email Dispatch'
                : 'दैनिक लोडिंग PDF रिपोर्ट एवं ऑटोमैटिक ईमेल प्रेषण'}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {language === 'en'
                ? 'Generate certified summary PDF reports of all daily loading operations, truck assignments, plant dispatches, and automatically email them to registered administrative addresses.'
                : 'सभी औद्योगिक संयंत्रों (हिंडाल्को, वेदांत, लापंगा), गेट पास, लोडिंग आवंटन और एसोसिएशन उपकर का आधिकारिक दैनिक PDF सारांश तैयार करें और स्वतः पंजीकृत प्रशासनिक ईमेल पतों पर भेजें।'}
            </p>

            {/* Live SMTP Status Badge & Config Pill */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {config?.smtp?.isConfigured ? (
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(true)}
                  className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-500/40 cursor-pointer transition-colors shadow-xs"
                  title="SMTP सेटिंग्स देखें या बदलें"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>वास्तविक मेल सर्वर सक्रिय: <strong>{config.smtp.host}</strong></span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(true)}
                  className="flex items-center gap-1.5 text-[11px] text-amber-200 bg-amber-950/70 hover:bg-amber-900/80 px-3 py-1 rounded-full border border-amber-500/40 cursor-pointer transition-colors shadow-xs"
                  title="Gmail ऐप पासवर्ड या SMTP सेट करें ताकि ईमेल सीधे आपके इनबॉक्स में आए"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>⚙️ SMTP सर्वर सेटिंग्स (Gmail / Custom) &rarr;</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowSmtpModal(true)}
                className="text-[11px] text-blue-200 hover:text-white bg-blue-900/40 hover:bg-blue-900/60 px-2.5 py-1 rounded-full border border-blue-500/30 cursor-pointer transition-colors flex items-center gap-1"
              >
                <Settings className="w-3 h-3 text-blue-300" />
                <span>सर्वर सेटिंग्स</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Download PDF Button */}
            <a
              href={`/api/reports/daily-loading/pdf?date=${selectedDate}`}
              download={`STOA_Daily_Loading_Report_${selectedDate}.pdf`}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 shadow-sm"
              title="चयनित दिनांक की PDF डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{language === 'en' ? 'Download PDF' : 'PDF डाउनलोड करें'}</span>
            </a>

            {/* Preview PDF Button */}
            <button
              type="button"
              onClick={handleOpenPdfPreview}
              className="px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{language === 'en' ? 'Preview Report' : 'प्रीव्यू करें'}</span>
            </button>

            {/* Test Email Button */}
            <button
              type="button"
              onClick={() => setShowTestEmailModal(true)}
              className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="जांच हेतु टेस्ट ईमेल भेजें"
            >
              <Mail className="w-4 h-4 text-amber-300" />
              <span>टेस्ट ईमेल</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="व्हाट्सएप पर सारांश साझा करें"
            >
              <Share2 className="w-4 h-4 text-emerald-300" />
              <span>शेयर</span>
            </button>

            {/* 1-Click Direct Gmail Compose Button */}
            <button
              type="button"
              onClick={() => handleDirectWebmailCompose()}
              className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-700/30 hover:scale-102 active:scale-98"
              title="Gmail कंपोज़ विंडो खोलें एवं PDF डाउनलोड करें"
            >
              <Mail className="w-4 h-4 text-emerald-100" />
              <span>1-क्लिक Gmail से भेजें</span>
            </button>

            {/* Send Email Now Button (System SMTP) */}
            <button
              type="button"
              onClick={handleSendEmailNow}
              disabled={isSendingEmail}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-rose-600/30 hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              {isSendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{language === 'en' ? 'Sending Email...' : 'ईमेल भेजा जा रहा है...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{language === 'en' ? 'Email to Admins' : 'सभी एडमिन को भेजें'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1-Click Gmail Feedback Toast */}
        {directEmailToast && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>✅ Gmail कंपोज़ विंडो खुल गई है एवं दैनिक रिपोर्ट PDF डाउनलोड हो चुका है!</strong> डाउनलोड की गई PDF को संलग्न (Attach) करके 1-क्लिक में ईमेल प्रेषित करें।
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDirectEmailToast(false)}
              className="text-white/60 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Feedback Alert if email was sent */}
        {sendResult && (
          <div
            className={`mt-4 p-3 rounded-2xl text-xs flex items-center justify-between border ${
              sendResult.success
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {sendResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{sendResult.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setSendResult(null)}
              className="text-white/60 hover:text-white cursor-pointer ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 1.5 Date Selection Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-rose-600" />
          <span className="text-xs font-bold text-slate-800">रिपोर्ट दिनांक चुनें (Select Date):</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Buttons */}
          <button
            type="button"
            onClick={() => handleDateChange(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === todayStr
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            आज (Today)
          </button>

          <button
            type="button"
            onClick={() => {
              const y = new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0];
              handleDateChange(y);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDate === new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0]
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            कल (Yesterday)
          </button>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="text-[11px] text-slate-500">कैलेंडर:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <button
            type="button"
            onClick={() => fetchSummary(selectedDate)}
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
            title="डेटा रिफ्रेश करें"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid for Selected Date's Loading Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">आवंटित लोड (Passes)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {summary?.totalPassesIssued || 0}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> {selectedDate} को जारी स्लिप्स
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">कुल प्रेषित वजन (MT)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {summary?.totalWeightTon?.toLocaleString() || 0} <span className="text-sm font-normal text-slate-500">MT</span>
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            औद्योगिक माल ढुलाई
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">एसोसिएशन उपकर</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
            ₹{summary?.totalFeeCollected?.toLocaleString('en-IN') || 0}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            15-टू-15 खाता संग्रह
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">अंतिम ऑटो प्रेषण</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
            {config?.lastSentStatus === 'SUCCESS' ? (
              <span className="text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> सफल (Delivered)
              </span>
            ) : config?.lastSentStatus === 'FAILED' ? (
              <span className="text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> विफल (Failed)
              </span>
            ) : (
              <span className="text-slate-500">शेड्यूल सक्रिय</span>
            )}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block font-mono">
            {config?.lastSentAt
              ? new Date(config.lastSentAt).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
              : 'हर रोज़ ' + (config?.scheduledTime || '20:00')}
          </span>
        </div>
      </div>

      {/* 3. Two Columns: Schedule & SMTP Settings + Registered Email Inboxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Automated Daily Schedule Configuration */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Automated Daily Dispatch Schedule' : 'स्वचालित दैनिक ईमेल शेड्यूल'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'en' ? 'Daily automatic trigger time' : 'नियत समय पर स्वतः PDF रिपोर्ट प्रेषण'}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  autoEmailEnabled
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {autoEmailEnabled ? 'सक्रिय (Active)' : 'बंद (Off)'}
              </span>
            </div>

            <div className="space-y-4 my-5">
              {/* Enable/Disable Toggle */}
              <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    दैनिक ऑटो-ईमेल चालू रखें
                  </span>
                  <span className="text-[11px] text-slate-500">
                    शाम को सभी पंजीकृत एडमिन को स्वतः PDF भेजें
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoEmailEnabled}
                  onChange={(e) => setAutoEmailEnabled(e.target.checked)}
                  className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                />
              </label>

              {/* Scheduled Time Input */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  ईमेल प्रेषण का समय (Daily Dispatch Time - IST)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                  />
                  <span className="text-xs text-slate-500">
                    (भारतीय समयानुसार शाम <strong>{scheduledTime}</strong> बजे)
                  </span>
                </div>
              </div>

              {/* SMTP Settings Button */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">ईमेल सर्वर (SMTP Server)</span>
                  <span className="text-[11px] text-slate-500">
                    {config?.smtp?.isConfigured ? `होस्ट: ${config.smtp.host}` : 'सिस्टम डिफॉल्ट मेल सर्वर सक्रिय'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSmtpModal(true)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-600" />
                  <span>कॉन्फ़िगर</span>
                </button>
              </div>

              {/* Informational Notes */}
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-2xl text-[11px] text-blue-900 leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-blue-700" />
                यह रिपोर्ट सर्वर-साइड क्रॉन द्वारा प्रतिदिन निर्धारित समय पर निष्पादित होती है। इसमें आज के सभी गेट पास, लोड हुए वाहनों के नंबर, क्रम संख्या, वजन और शुल्क की आधिकारिक ऑडिटेड कॉपी संलग्न रहती है।
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {configSavedToast ? (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> सेटिंग्स सुरक्षित की गईं!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">परिवर्तन सहेजने हेतु क्लिक करें</span>
            )}

            <button
              type="button"
              onClick={handleSaveScheduleConfig}
              disabled={isSavingConfig}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all disabled:opacity-50"
            >
              {isSavingConfig ? 'सहेजा जा रहा है...' : 'शेड्यूल सहेजें (Save Schedule)'}
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Registered Administrative Email Inboxes */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {language === 'en' ? 'Registered Administrative Email Addresses' : 'पंजीकृत प्रशासनिक ईमेल पते'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    इन ईमेल पतों पर प्रतिदिन लोडिंग सारांश PDF भेजी जाती है
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddRecipientModal(true)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया ईमेल जोड़ें</span>
              </button>
            </div>

            {/* Recipients List */}
            <div className="divide-y divide-slate-100 my-3">
              {config?.recipients?.map((recip) => (
                <div key={recip.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {recip.name[0] || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{recip.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.2 rounded font-medium">
                          {recip.role}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 block">{recip.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleRecipient(recip.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold cursor-pointer transition-colors ${
                        recip.notifyDaily
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                      }`}
                      title="दैनिक नोटिफिकेशन चालू/बंद करें"
                    >
                      {recip.notifyDaily ? 'सक्रिय (On)' : 'निष्क्रिय (Off)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecipient(recip.id, recip.email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="ईमेल हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span>कुल पंजीकृत प्राप्तकर्ता: <strong>{config?.recipients?.length || 0}</strong> अधिकारी</span>
            <span className="text-slate-500 font-mono">CC: ऑटो-शेड्यूल एवं मैनुअल प्रेषण</span>
          </div>
        </div>
      </div>

      {/* 4. Plant Breakdown & Operations Preview Table with Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-rose-600" />
              <span>{selectedDate} का संयंत्र-वार लोडिंग विवरण (Industrial Plants Summary)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              रिपोर्ट संदर्भ: <strong>{summary?.referenceNumber}</strong> • 15-टू-15 आवर्तन चक्र
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-mono font-bold">
              {summary?.reportDate}
            </span>
          </div>
        </div>

        {/* Plant Summary Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">औद्योगिक संयंत्र</th>
                <th className="py-2.5 px-3">मुख्य गंतव्य (Destinations)</th>
                <th className="py-2.5 px-3 text-right">गाड़ियों की संख्या</th>
                <th className="py-2.5 px-3 text-right">कुल वजन (MT)</th>
                <th className="py-2.5 px-3 text-right">स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.plantBreakdown?.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{p.plant}</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.destinations.join(', ') || 'Regional'}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-right">{p.trucksCount} Trucks</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-700 text-right">{p.tonnage.toLocaleString()} MT</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      सत्यापित
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Itemized Operations Table Header & Filters */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                विस्तृत वाहन लोडिंग लॉग ({filteredOperations.length} गाड़ियां)
              </h4>
              <p className="text-[11px] text-slate-500">प्रत्येक वाहन का गेट पास, टोकन एवं वजन विवरण</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Plant Filter */}
              <select
                value={selectedPlantFilter}
                onChange={(e) => setSelectedPlantFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="ALL">सभी संयंत्र (All Plants)</option>
                {summary?.plantBreakdown.map((p) => (
                  <option key={p.plant} value={p.plant}>
                    {p.plant}
                  </option>
                ))}
              </select>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="गाड़ी, टोकन या मालिक..."
                  value={opSearch}
                  onChange={(e) => setOpSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3">टोकन (Pass ID)</th>
                  <th className="py-2 px-3">गाड़ी नंबर</th>
                  <th className="py-2 px-3">क्रम #</th>
                  <th className="py-2 px-3">मालिक / ट्रांसपोर्टर</th>
                  <th className="py-2 px-3">संयंत्र एवं गंतव्य</th>
                  <th className="py-2 px-3 text-right">वजन (MT)</th>
                  <th className="py-2 px-3 text-right">शुल्क स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredOperations.map((op, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-900 font-bold">{op.token}</td>
                    <td className="py-2 px-3 font-bold text-rose-700">{op.vehicleNumber}</td>
                    <td className="py-2 px-3 text-slate-700">#{op.serialNumber}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{op.ownerName.split('(')[0].trim()}</td>
                    <td className="py-2 px-3 font-sans text-slate-600">
                      {op.plant} ➔ {op.destination}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">{op.capacityTon} MT</td>
                    <td className="py-2 px-3 text-right font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          op.paymentStatus === 'VERIFIED_PAID'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {op.paymentStatus === 'VERIFIED_PAID' ? `₹${op.paymentAmount} PAID` : 'UNPAID'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Recent Email Delivery Audit Trail */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {language === 'en' ? 'Report Email Dispatch Log & Audit History' : 'रिपोर्ट ईमेल प्रेषण लॉग व ऑडिट इतिहास'}
              </h3>
              <p className="text-[11px] text-slate-500">
                हाल ही में प्रेषित की गई दैनिक रिपोर्टों का समय, प्राप्तकर्ता और डिलीवरी स्थिति
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchReportData}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">समय (Timestamp)</th>
                <th className="py-2.5 px-3">रिपोर्ट दिनांक</th>
                <th className="py-2.5 px-3">प्राप्तकर्ता (Recipients)</th>
                <th className="py-2.5 px-3">प्रेषण प्रकार</th>
                <th className="py-2.5 px-3">PDF आकार</th>
                <th className="py-2.5 px-3 text-right">डिलीवरी स्थिति</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleString('hi-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{log.reportDate}</td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {log.recipients.map((em, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono truncate max-w-[140px]">
                          {em}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        log.triggeredBy === 'AUTO_SCHEDULE'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : log.triggeredBy === 'TEST_EMAIL'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {log.triggeredBy === 'AUTO_SCHEDULE'
                        ? '⏰ ऑटो-शेड्यूल'
                        : log.triggeredBy === 'TEST_EMAIL'
                        ? '🧪 टेस्ट ईमेल'
                        : '👤 एडमिन मैनुअल'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                    {log.pdfSizeBytes ? `${Math.round(log.pdfSizeBytes / 1024)} KB` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {log.status === 'SUCCESS' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          सफल (Delivered)
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          विफल (Failed)
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Administrative Recipient */}
      {showAddRecipientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold">नया प्रशासनिक ईमेल पंजीकृत करें</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRecipientModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecipient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  अधिकारी / प्राप्तकर्ता का नाम *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. पंकज साहनी (Dispatch Incharge)"
                  value={newRecipName}
                  onChange={(e) => setNewRecipName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ईमेल पता (Email Address) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="official.pankajsahani@gmail.com"
                  value={newRecipEmail}
                  onChange={(e) => setNewRecipEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पद / भूमिका (Designation / Role)
                </label>
                <select
                  value={newRecipRole}
                  onChange={(e) => setNewRecipRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 cursor-pointer"
                >
                  <option value="Chief Dispatch Admin & IT Incharge">Chief Dispatch Admin & IT Incharge</option>
                  <option value="President, STOA">President, STOA</option>
                  <option value="General Secretary, STOA">General Secretary, STOA</option>
                  <option value="Vice President, STOA">Vice President, STOA</option>
                  <option value="Treasurer / Finance Incharge">Treasurer / Finance Incharge</option>
                  <option value="Plant Control Desk Officer">Plant Control Desk Officer</option>
                  <option value="Auditor & Legal Advisor">Auditor & Legal Advisor</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecipientModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSavingRecip}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-rose-500 hover:to-pink-500 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSavingRecip ? 'जोड़ा जा रहा है...' : 'ईमेल पंजीकृत करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Send Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold">परीक्षण (Test) PDF ईमेल प्रेषण</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestEmailModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                यह परीक्षण ईमेल <strong>{selectedDate}</strong> की दैनिक लोडिंग PDF रिपोर्ट को एक विशिष्ट ईमेल पते पर भेजेगा, जिससे आप डिलीवरी व PDF फॉर्मेट की जांच कर सकें।
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  परीक्षण ईमेल पता (Recipient Email) *
                </label>
                <input
                  type="email"
                  required
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center justify-between">
                <span>संलग्नक: <strong>STOA_Daily_Loading_Report_{selectedDate}.pdf</strong></span>
                <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded-full font-mono font-bold">PDF Ready</span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestEmailModal(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  रद्द करें
                </button>

                {/* Direct 1-Click Gmail Test */}
                <button
                  type="button"
                  onClick={() => {
                    handleDirectWebmailCompose(testEmailAddress);
                    setShowTestEmailModal(false);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Gmail में कंपोज़ खोलें एवं टेस्ट PDF डाउनलोड करें"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>1-क्लिक Gmail से टेस्ट करें</span>
                </button>

                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:from-amber-500 hover:to-amber-600 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSendingTest ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>भेजा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>सर्वर SMTP द्वारा भेजें</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: In-App PDF Preview Modal */}
      {showPreviewModal && previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-4xl h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold">STOA दैनिक लोडिंग PDF रिपोर्ट पूर्वावलोकन</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    संदर्भ: {summary?.referenceNumber} • {summary?.reportDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewPdfUrl}
                  download={`STOA_Daily_Loading_Report_${summary?.reportDate}.pdf`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>डाउनलोड</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full bg-slate-100 p-2 overflow-hidden">
              <iframe
                src={previewPdfUrl}
                title="STOA Daily Report PDF Preview"
                className="w-full h-full rounded-2xl border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SMTP Server Configuration Modal */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[95vh] flex flex-col">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Settings className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="text-sm font-bold">ईमेल सर्वर (SMTP) सेटिंग्स व प्रमाणीकरण</h3>
                  <p className="text-[11px] text-slate-300">दैनिक व टेस्ट रिपोर्ट सीधे इनबॉक्स में पहुंचाने हेतु कॉन्फ़िगर करें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSmtpModal(false);
                  setVerifyResult(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSmtp} className="p-6 space-y-4 overflow-y-auto">
              {/* Quick Preset Buttons */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  ⚡ 1-क्लिक प्रदाता चयन (Quick Provider Presets):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('smtp.gmail.com');
                      setSmtpPort(465);
                      if (smtpUser && !smtpFrom) {
                        setSmtpFrom(`STOA Dispatch Control <${smtpUser}>`);
                      }
                    }}
                    className="p-2 bg-white hover:bg-blue-50 border border-blue-200 rounded-xl text-left text-xs font-bold text-blue-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="block text-[10px] text-blue-600 font-mono">Google</span>
                    <span>Gmail (465 SSL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('mail.stoa-sambalpur.org');
                      setSmtpPort(465);
                    }}
                    className="p-2 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl text-left text-xs font-bold text-emerald-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="block text-[10px] text-emerald-600 font-mono">Domain</span>
                    <span>cPanel / Webmail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSmtpHost('smtp-relay.brevo.com');
                      setSmtpPort(587);
                    }}
                    className="p-2 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-left text-xs font-bold text-amber-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="block text-[10px] text-amber-600 font-mono">Relay</span>
                    <span>Brevo / SendGrid</span>
                  </button>
                </div>
              </div>

              {/* Host and Port */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    SMTP Host (सर्वर पता) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="smtp.gmail.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Port *</label>
                  <select
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none cursor-pointer"
                  >
                    <option value={465}>465 (SSL)</option>
                    <option value={587}>587 (TLS)</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username (प्रेषक ईमेल पता) *
                </label>
                <input
                  type="email"
                  required
                  placeholder="official.pankajsahani@gmail.com"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    App Password / Secret (ऐप पासवर्ड) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                  >
                    {showPassword ? 'पासवर्ड छुपाएं' : 'पासवर्ड देखें'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="16-अक्षर का Google App Password दर्ज करें"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                <p className="text-[10.5px] text-slate-500 mt-1 leading-normal">
                  💡 <strong>Gmail सहायता:</strong> Gmail में मुख्य पासवर्ड काम नहीं करता। अपने Google Account में <em>Security &rarr; 2-Step Verification &rarr; App Passwords</em> में जाकर 16-अक्षर का पासवर्ड बनाएं।
                </p>
              </div>

              {/* From Header */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sender Header (From Display)
                </label>
                <input
                  type="text"
                  placeholder="STOA Dispatch Control <dispatch@stoa-sambalpur.org>"
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                />
              </div>

              {/* Verify Connection Alert Box */}
              {verifyResult && (
                <div
                  className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
                    verifyResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  {verifyResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed">{verifyResult.message}</span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                {/* Verify Connection Button */}
                <button
                  type="button"
                  onClick={handleVerifySmtp}
                  disabled={isVerifyingSmtp || !smtpHost || !smtpUser}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifyingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-600" />
                      <span>कनेक्शन जांचा जा रहा है...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>🔌 कनेक्शन टेस्ट करें</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSmtpModal(false);
                      setVerifyResult(null);
                    }}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSmtp}
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-rose-500 hover:to-pink-500 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSavingSmtp ? 'सहेजा जा रहा है...' : 'सुरक्षित करें'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
