import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  AdminUser,
  Vehicle,
  LoadingProgram,
  GatePass,
  LedgerEntry,
  PukarState,
  AuditLog,
  ImportBatch,
  VEHICLE_CATEGORIES,
  VehicleCategory,
  MembershipRenewalReceipt,
} from '../../types/index.js';
import { MembershipReceiptModal } from '../membership/MembershipReceiptModal.js';
import { VehicleRenewalHistoryModal } from '../membership/VehicleRenewalHistoryModal.js';
import { QRCodeSvg } from '../common/QRCodeSvg.js';
import { VehiclePlate } from '../common/VehiclePlate.js';
import { LanguageSwitcher } from '../common/LanguageSwitcher.js';
import { AssociationLogo } from '../common/AssociationLogo.js';
import { LiveBroadcastTicker } from '../common/LiveBroadcastTicker.js';
import { LogoManagerModal } from './LogoManagerModal.js';
import { MasterSettingsPanel } from './MasterSettingsPanel.js';
import { ProductivityTrendPanel, TrendDay, TrendSummary } from './ProductivityTrendPanel.js';
import { PukarRawNoticePublisher } from './PukarRawNoticePublisher.js';
import { FleetImportModal } from './FleetImportModal.js';
import { DailyReportManager } from './DailyReportManager.js';
import { SponsorManagerPanel } from './SponsorManagerPanel.js';
import { ElectionManagerPanel } from './ElectionManagerPanel.js';
import { AdminAiAgentModal } from './AdminAiAgentModal.js';
import { getRtoDisplay } from '../../config/rtoCodes.js';
import {
  ShieldCheck,
  LayoutDashboard,
  Truck,
  RotateCcw,
  Radio,
  FileSpreadsheet,
  FileText,
  DollarSign,
  History,
  Settings,
  Sliders,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Edit2,
  RefreshCw,
  LogOut,
  Sparkles,
  ArrowRight,
  Printer,
  Ban,
  Check,
  X,
  Mail,
  Send,
  Award,
  Vote,
  Sun,
  Moon,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

export const AdminApp: React.FC<{ onOpenAi: () => void }> = ({ onOpenAi }) => {
  const { user, logout } = useAuth();
  const adminUser = user as AdminUser;
  const { t, language, setLanguage } = useLanguageTheme();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'fleet' | 'loading' | 'pukar' | 'membership' | 'ledger' | 'reports' | 'audit' | 'branding' | 'sponsor' | 'election' | 'settings'
  >('dashboard');

  // Core State
  const [stats, setStats] = useState<any>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [programs, setPrograms] = useState<LoadingProgram[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [pukar, setPukar] = useState<PukarState | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [importHistory, setImportHistory] = useState<ImportBatch[]>([]);
  const [trendData, setTrendData] = useState<TrendDay[]>([]);
  const [trendSummary, setTrendSummary] = useState<TrendSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // In-app Toast message (avoids blocked window.alert/confirm in iframe)
  const [adminToast, setAdminToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showAdminToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 3500);
  };

  // Fleet Search & Filters (Real-time search across owner name, vehicle number, mobile, serial)
  const [fleetSearch, setFleetSearch] = useState('');
  const [fleetCategory, setFleetCategory] = useState<string>('ALL');
  const [fleetStatus, setFleetStatus] = useState<string>('ALL');

  // Modals
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [showAiCommander, setShowAiCommander] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);
  const [newProgType, setNewProgType] = useState<'GENERAL' | 'PENDING' | 'PREFERENCE'>('GENERAL');
  const [showVerifyPaymentModal, setShowVerifyPaymentModal] = useState(false);
  const [activePassForPayment, setActivePassForPayment] = useState<GatePass | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [showCancelPassModal, setShowCancelPassModal] = useState(false);
  const [activePassForCancel, setActivePassForCancel] = useState<GatePass | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [vehicleToRenew, setVehicleToRenew] = useState<Vehicle | null>(null);
  const [renewalMonths, setRenewalMonths] = useState<6 | 12 | 24>(12);
  const [renewalFeeInput, setRenewalFeeInput] = useState<number>(300);
  const [renewalPaymentMode, setRenewalPaymentMode] = useState<'CASH' | 'ONLINE' | 'UPI'>('CASH');
  const [activeGeneratedReceipt, setActiveGeneratedReceipt] = useState<MembershipRenewalReceipt | null>(null);
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);

  // Pukar Active Sequence Range Config State (एडमिन अपने हिसाब से सक्रिय क्रम सीमा सेट करेगा)
  const [showPukarRangeEditor, setShowPukarRangeEditor] = useState(false);
  const [pukarStartSerialInput, setPukarStartSerialInput] = useState<number>(0);
  const [pukarEndSerialInput, setPukarEndSerialInput] = useState<number>(0);
  const [savingPukarRange, setSavingPukarRange] = useState(false);

  // Dispatch Form State
  const [dispatchVehicleNum, setDispatchVehicleNum] = useState('');
  const [dispatchProgramId, setDispatchProgramId] = useState('');
  const [dispatchDriverName, setDispatchDriverName] = useState('');
  const [dispatchErrors, setDispatchErrors] = useState<string[]>([]);
  const [dispatchSuccessPass, setDispatchSuccessPass] = useState<GatePass | null>(null);

  // New Vehicle Form State
  const [newVehNum, setNewVehNum] = useState('');
  const [newVehOwner, setNewVehOwner] = useState('');
  const [newVehMobile, setNewVehMobile] = useState('');
  const [newVehCategory, setNewVehCategory] = useState<VehicleCategory>('10-Wheel / 16-18 Ton');
  const [newVehCapacity, setNewVehCapacity] = useState('18');
  const [newVehSerial, setNewVehSerial] = useState('');

  // Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      const safeFetch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) return null;
          return await res.json();
        } catch (e) {
          console.warn(`Failed to fetch ${url}`, e);
          return null;
        }
      };

      const [stData, flData, prData, gpData, ldData, pkData, auData, imData] = await Promise.all([
        safeFetch('/api/reports/stats'),
        safeFetch('/api/fleet'),
        safeFetch('/api/loading/programs'),
        safeFetch('/api/gate-pass'),
        safeFetch('/api/ledger'),
        safeFetch('/api/pukar'),
        safeFetch('/api/audit-logs'),
        safeFetch('/api/fleet/import-history'),
      ]);

      if (stData?.stats) setStats(stData.stats);
      if (stData?.trend) {
        setTrendData(stData.trend.trend || []);
        setTrendSummary(stData.trend.summary || null);
      }
      if (flData?.vehicles) setVehicles(flData.vehicles);
      if (prData?.programs) setPrograms(prData.programs);
      if (gpData?.passes) setGatePasses(gpData.passes);
      if (ldData?.entries) setLedgerEntries(ldData.entries);
      if (pkData?.pukar) {
        setPukar(pkData.pukar);
        setPukarStartSerialInput(pkData.pukar.startSerial ?? 0);
        setPukarEndSerialInput(pkData.pukar.endSerial ?? 0);
      }
      if (auData?.logs) setAuditLogs(auData.logs);
      if (imData?.history) setImportHistory(imData.history);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    let eventSource: EventSource | null = null;
    let retryTimer: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/live/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'PROGRAMS_SYNC') {
              if (data.pukar) setPukar(data.pukar);
              if (data.programs) setPrograms(data.programs);
            }
          } catch {
            // Heartbeat
          }
        };
        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          retryTimer = setTimeout(connectSSE, 3000);
        };
      } catch {
        // Fallback
      }
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  // Update Pukar Active Sequence Range & Status
  const handleUpdatePukarRange = async (newStart?: number, newEnd?: number, newActive?: boolean) => {
    setSavingPukarRange(true);
    try {
      const s = newStart !== undefined ? newStart : Number(pukarStartSerialInput);
      const e = newEnd !== undefined ? newEnd : Number(pukarEndSerialInput);
      const act = newActive !== undefined ? newActive : pukar?.isActive;
      const res = await fetch('/api/pukar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            startSerial: s,
            endSerial: e,
            isActive: act,
          },
          actor: adminUser.name || 'Admin Control Desk',
          actorRole: adminUser.role || 'ADMIN',
        }),
      });
      const data = await res.json();
      if (data.success && data.pukar) {
        setPukar(data.pukar);
        setPukarStartSerialInput(data.pukar.startSerial ?? 0);
        setPukarEndSerialInput(data.pukar.endSerial ?? 0);
        setShowPukarRangeEditor(false);
        showAdminToast(`पुकार स्थिति सफलतापूर्वक अपडेट: #${s} — #${e} (${act ? 'चालू' : 'बंद'})`);
      }
    } catch (err) {
      console.error('Failed to update pukar range:', err);
    } finally {
      setSavingPukarRange(false);
    }
  };

  // Dispatch Execution
  const handleExecuteDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchErrors([]);
    setDispatchSuccessPass(null);

    try {
      const res = await fetch('/api/loading/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: dispatchVehicleNum,
          programId: dispatchProgramId,
          driverName: dispatchDriverName,
          actor: adminUser.name || 'Admin',
          actorRole: adminUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setDispatchErrors(data.errors || [data.error || 'सत्यापन विफल']);
      } else {
        setDispatchSuccessPass(data.gatePass);
        fetchData();
      }
    } catch (err: any) {
      setDispatchErrors([err.message || 'नेटवर्क त्रुटि']);
    }
  };

  // Payment Verification Execution
  const handleVerifyPayment = async () => {
    if (!activePassForPayment) return;
    try {
      const res = await fetch(`/api/gate-pass/${activePassForPayment.id}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentRef: paymentRefInput || 'CASH-REC-' + Date.now().toString().slice(-4),
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        setShowVerifyPaymentModal(false);
        setActivePassForPayment(null);
        setPaymentRefInput('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel Gate Pass Execution
  const handleCancelPass = async () => {
    if (!activePassForCancel) return;
    try {
      const res = await fetch(`/api/gate-pass/${activePassForCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReasonInput || 'Admin cancelled dispatch',
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        setShowCancelPassModal(false);
        setActivePassForCancel(null);
        setCancelReasonInput('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add Vehicle Submit
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fleet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          normalizedNumber: newVehNum,
          ownerName: newVehOwner,
          ownerMobile: newVehMobile,
          category: newVehCategory,
          capacityTon: Number(newVehCapacity) || 16,
          serialNumber: newVehSerial ? Number(newVehSerial) : undefined,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        setShowAddVehicleModal(false);
        setNewVehNum('');
        setNewVehOwner('');
        setNewVehMobile('');
        setNewVehSerial('');
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Edit Vehicle Submit
  const handleEditVehicleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicle) return;
    try {
      const res = await fetch(`/api/fleet/${editingVehicle.normalizedNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: editingVehicle,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        setShowEditVehicleModal(false);
        setEditingVehicle(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Renew Membership Submit ("जैसे ही रिन्यू करें बटन दबाएं तो एक अपलोड किया गया फोटो जैसा ही पीडीएफ फाइल जनरेट हो जाएं")
  const handleRenewMembership = async () => {
    if (!vehicleToRenew) return;
    try {
      const fee = Number(renewalFeeInput) || (renewalMonths === 6 ? 150 : renewalMonths === 12 ? 300 : 600);
      const res = await fetch('/api/membership/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleNumber: vehicleToRenew.normalizedNumber,
          months: renewalMonths,
          feePaid: fee,
          paymentMode: renewalPaymentMode,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowRenewModal(false);
        setVehicleToRenew(null);
        if (data.receipt) {
          // 1. Immediately trigger automatic download of the official photo-replica PDF file!
          const pdfUrl = data.pdfUrl || `/api/membership/receipt/${data.receipt.receiptNumber}/pdf`;
          const downloadLink = document.createElement('a');
          downloadLink.href = pdfUrl;
          downloadLink.download = `STOA_Renewal_Receipt_${data.receipt.receiptNumber}_${(data.receipt.displayNumber || data.receipt.vehicleNumber).replace(/\s+/g, '_')}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);

          // 2. Immediately pop up the official physical-style receipt on screen!
          setActiveGeneratedReceipt(data.receipt);
        }
        showAdminToast(
          `🎉 सदस्यता नवीनीकरण सफल! आधिकारिक फोटो जैसी PDF रसीद #${data.receipt?.receiptNumber || ''} तुरंत जनरेट व डाउनलोड हो गई (कुल #${data.receipt?.renewalCountForVehicle || 1} बार नवीनीकृत)`,
          'success'
        );
        fetchData();
      } else {
        const err = await res.json();
        showAdminToast(err.error || 'नवीनीकरण विफल', 'error');
      }
    } catch (e: any) {
      console.error(e);
      showAdminToast(e.message || 'त्रुटि हुई', 'error');
    }
  };

  // Delete Daily Load Program ("रोजाना लोड पोस्ट कर सकें और रोजाना उसको हटा सके")
  const handleDeleteProgram = async (programId: string, programTitle: string) => {
    // 1. Instant optimistic state update (UI updates immediately in 1 click)
    setPrograms((prev) => prev.filter((p) => p.id !== programId));
    setPukar((prev) =>
      prev
        ? {
            ...prev,
            activeProgramsCount: Math.max(0, (prev.activeProgramsCount || 1) - 1),
            currentNotice: prev.currentNotice
              ? {
                  ...prev.currentNotice,
                  items: prev.currentNotice.items.filter((item) => item.id !== programId),
                }
              : undefined,
          }
        : null
    );
    showAdminToast(`🗑️ लोडिंग प्रोग्राम "${programTitle}" तुरंत हटा दिया गया`, 'info');

    // 2. Call backend
    try {
      const res = await fetch(`/api/loading/programs/${programId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Delete program error:', e);
    }
  };

  // Post Next Day / New Program Modal State
  const [showPostNextDayModal, setShowPostNextDayModal] = useState(false);
  const [clearPreviousOnNextDay, setClearPreviousOnNextDay] = useState(false);
  const [loadFilter, setLoadFilter] = useState<'ALL' | 'TODAY' | 'TOMORROW' | 'COMPLETED' | 'AVAILABLE'>('ALL');
  const [expandedSlipsProgId, setExpandedSlipsProgId] = useState<Record<string, boolean>>({});
  const [nextDayForm, setNextDayForm] = useState({
    company: 'Hindalco Samelter' as const,
    destination: '',
    categoryRequired: '10-Wheel / 16-18 Ton' as any,
    capacityTonRequired: 18,
    totalQuota: 10,
    ratePerTon: 2200,
    advancePercentage: 70,
    pendingFreightAllowed: false,
    preferenceRule: '15-टू-15 रोटेशन वरीयता',
    programType: 'GENERAL' as 'GENERAL' | 'PENDING' | 'PREFERENCE',
    dateSection: 'TODAY' as 'TODAY' | 'TOMORROW' | 'SPECIAL',
    dateLabel: 'DT. TODAY',
    cargo: 'COIL / RI',
  });

  // Cancel/Remove a vehicle's slip from a load slot (गाड़ियां जब पर्ची कटा ले तब एडमिन उसको डिलीट कर दे)
  const handleCancelSlipForVehicle = async (passId: string, vehicleNumber: string, programTitle: string) => {
    try {
      const res = await fetch(`/api/gate-pass/${passId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: `Admin deleted slip for vehicle ${vehicleNumber} from ${programTitle}`,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        showAdminToast(`🗑️ गाड़ी ${vehicleNumber} की पर्ची हटा दी गई एवं कोटा पुनः खोल दिया गया।`, 'info');
        fetchData();
      } else {
        const data = await res.json();
        showAdminToast(data.error || 'पर्ची हटाने में त्रुटि हुई', 'error');
      }
    } catch (e: any) {
      showAdminToast(e.message || 'नेटवर्क त्रुटि', 'error');
    }
  };

  // Delete all programs where all vehicles have cut slips (कोटा पूर्ण लोड हटाएं)
  const handleDeleteCompletedPrograms = async () => {
    try {
      const res = await fetch('/api/loading/programs/completed-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showAdminToast(`✅ ${data.deletedCount || 0} पर्ची कटी पूर्ण लोड सफलतापूर्वक डिलीट कर दिए गए!`, 'success');
        fetchData();
      }
    } catch (e: any) {
      showAdminToast(e.message || 'त्रुटि हुई', 'error');
    }
  };

  // 1-Click Load the Official Loading Notice Presets (screenshot notice)
  const handleFillStandardSchedule = async () => {
    const standardLoads: Partial<LoadingProgram>[] = [
      {
        company: 'Hindalco Samelter',
        companyCustomName: 'SMELTER - BELUR 18MT',
        destination: 'BELUR (RI) [DT. 16/12/25]',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 18,
        totalQuota: 3,
        ratePerTon: 2200,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'RI',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - BHIWANDI + TALOJA',
        destination: 'BHIWANDI + TALOJA (COIL/SHEET 2 POINT) 18MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 18,
        totalQuota: 1,
        ratePerTon: 2400,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL/SHEET 2 POINT',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - MAUDA 18MT',
        destination: 'MAUDA (COIL) 18MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 18,
        totalQuota: 4,
        ratePerTon: 2100,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - MAUDA 16MT',
        destination: 'MAUDA (COIL) 16MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 6,
        ratePerTon: 2100,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - KANPUR 16MT',
        destination: 'KANPUR (COIL/SHEET) 16MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 1,
        ratePerTon: 2350,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL/SHEET',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - TALOJA 16MT',
        destination: 'TALOJA (COIL/SHEET 2 POINT) 16MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 1,
        ratePerTon: 2400,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL/SHEET 2 POINT',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - BELUR 16MT',
        destination: 'BELUR (COIL) 16MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 4,
        ratePerTon: 2200,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: 'FRP BLUEFOX - BANGALORE 16MT',
        destination: 'BANGALORE (COIL/SHEET 2 POINT) 16MT',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 1,
        ratePerTon: 2800,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. 16/12/25',
        cargo: 'COIL/SHEET 2 POINT',
        programType: 'GENERAL',
      },
      {
        company: 'Hindalco Samelter',
        companyCustomName: 'SMELTER - BELUR 18MT (TOMORROW)',
        destination: 'BELUR (RI/COIL) 18MT [DT. 17/12/25]',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 18,
        totalQuota: 2,
        ratePerTon: 2200,
        advancePercentage: 70,
        dateSection: 'TOMORROW',
        dateLabel: 'DT. 17/12/25',
        cargo: 'RI / COIL',
        programType: 'GENERAL',
      },
      {
        company: 'Other',
        companyCustomName: 'TALOJA VIA RAIPUR (TOMORROW)',
        destination: 'TALOJA VIA RAIPUR (RI) 16MT [DT. 17/12/25]',
        categoryRequired: '10-Wheel / 16-18 Ton',
        capacityTonRequired: 16,
        totalQuota: 4,
        ratePerTon: 2450,
        advancePercentage: 70,
        dateSection: 'TOMORROW',
        dateLabel: 'DT. 17/12/25',
        cargo: 'RI',
        preferenceRule: 'CHALLAN CHANGE WILL BE HELD AT RAIPUR',
        programType: 'GENERAL',
      },
      {
        company: 'Blue Fox',
        companyCustomName: '12 WHEELER - HOWRAH 25MT',
        destination: 'HOWRAH (COIL) 25MT [DT. TODAY]',
        categoryRequired: '12-Wheel / 18-26 Ton',
        capacityTonRequired: 25,
        totalQuota: 1,
        ratePerTon: 2500,
        advancePercentage: 70,
        dateSection: 'TODAY',
        dateLabel: 'DT. TODAY',
        cargo: 'COIL',
        programType: 'GENERAL',
      },
    ];

    try {
      const res = await fetch('/api/loading/programs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programs: standardLoads,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        showAdminToast('🎉 आधिकारिक दैनिक पुकार प्रोग्राम (11 लोडिंग स्लॉट) सफलतापूर्वक पोस्ट हो गया!', 'success');
        fetchData();
      }
    } catch (e: any) {
      showAdminToast(e.message || 'त्रुटि हुई', 'error');
    }
  };

  // Real-Time 3 Pukar Mode Transition Algorithm (सामान्य, पेंडिंग, प्रिफरेंस पुकार - जहां चल रही है वहीं से तुरंत कन्वर्ट)
  const handleSwitchPukarMode = async (newMode: 'GENERAL' | 'PENDING' | 'PREFERENCE', customSerial?: number) => {
    const currentProgress = customSerial || pukar?.currentProgressSerial || pukar?.startSerial || 101;

    // 1. Instant optimistic state update (0ms delay)
    setPukar((prev) => {
      if (!prev) return null;
      let announcement = '';
      if (newMode === 'PENDING') {
        announcement = `🚨 [पेंडिंग पुकार चालू]: क्रम संख्या #${currentProgress} से पुकार पेंडिंग राउंड में परिवर्तित कर दी गई है! पेंडिंग भाड़ा व प्रतीक्षा कोटा की गाड़ियां प्राथमिकता से तुरंत पर्ची कटाएं।`;
      } else if (newMode === 'PREFERENCE') {
        announcement = `🚨 [प्रिफरेंस पुकार चालू]: क्रम संख्या #${currentProgress} से पुकार प्रिफरेंस राउंड में परिवर्तित कर दी गई है! स्थानीय संबलपुर एवं विशेष रूट वरीयता नियम लागू हैं।`;
      } else {
        announcement = `📢 [सामान्य जनरल पुकार चालू]: क्रम संख्या #${currentProgress} से नियमित 15-टू-15 आवर्तन क्रम में सामान्य लोडिंग पुकार जारी है।`;
      }
      return {
        ...prev,
        mode: newMode,
        modeSwitchSerial: currentProgress,
        modeSwitchedAt: new Date().toISOString(),
        currentProgressSerial: currentProgress,
        isActive: true,
        announcementHi: announcement,
      };
    });

    const modeLabels: Record<string, string> = {
      GENERAL: '🔵 सामान्य जनरल पुकार',
      PENDING: '🟠 पेंडिंग पुकार',
      PREFERENCE: '🟣 प्रिफरेंस पुकार',
    };

    showAdminToast(
      `⚡ पुकार तुरंत ${modeLabels[newMode]} में कन्वर्ट हो गई (क्रम #${currentProgress} से आगे चालू)!`,
      'success'
    );

    // 2. Background API call
    try {
      const res = await fetch('/api/pukar/switch-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: newMode,
          actor: adminUser.name,
          actorRole: adminUser.role,
          targetSerial: currentProgress,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Mode switch error:', e);
    }
  };

  // Clear Daily Pukar Notice
  const handleClearDailyNotice = async () => {
    // 1. Instant optimistic state update
    setPukar((prev) =>
      prev
        ? {
            ...prev,
            isActive: false,
            currentNotice: undefined,
            activeProgramsCount: 0,
            announcementHi: 'वर्तमान में पुकार बंद है। अगला लोडिंग नोटिस जल्द जारी किया जाएगा।',
          }
        : null
    );
    showAdminToast('📢 दैनिक पुकार नोटिस तुरंत हटा दिया गया', 'info');

    // 2. Call backend
    try {
      const res = await fetch('/api/pukar/notice', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Clear notice error:', e);
    }
  };

  // Delete All Daily Loading Programs (प्रतिदिन टोटल लोडिंग प्रोग्राम तुरंत एकबार में हटाएं)
  const handleClearAllDailyPrograms = async () => {
    // 1. Instant optimistic state update (एकबार में बिना रुकावट तुरंत खाली करें)
    setPrograms([]);
    setPukar((prev) =>
      prev
        ? {
            ...prev,
            isActive: false,
            activeProgramsCount: 0,
            currentNotice: undefined,
            mode: 'GENERAL',
            currentProgressSerial: prev.startSerial || 101,
            modeSwitchSerial: undefined,
            modeSwitchedAt: undefined,
            announcementHi:
              'वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है।',
          }
        : null
    );
    showAdminToast('🗑️ संपूर्ण लोडिंग प्रोग्राम तुरंत डिलीट कर दिया गया!', 'success');

    // 2. Call backend immediately
    try {
      const res = await fetch('/api/loading/programs-clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pukar) {
          setPukar(data.pukar);
        }
        setPrograms([]);
      }
    } catch (e) {
      console.error('Clear all programs error:', e);
    }
  };

  // End Pukar and Delete All Programs (जब पुकार खत्म हो जाएगा तो सबकुछ लोडिंग प्रोग्राम तुरंत एकबार में डिलीट करें)
  const handleEndPukarAndClearAll = async () => {
    // 1. Instant optimistic state update
    setPrograms([]);
    setPukar((prev) =>
      prev
        ? {
            ...prev,
            isActive: false,
            activeProgramsCount: 0,
            currentNotice: undefined,
            mode: 'GENERAL',
            currentProgressSerial: prev.startSerial || 101,
            modeSwitchSerial: undefined,
            modeSwitchedAt: undefined,
            announcementHi:
              'पुकार समाप्त कर दी गई है। अगला लोडिंग कार्यक्रम सुबह 10:00 AM / शाम 04:00 PM पर जारी होगा।',
          }
        : null
    );
    showAdminToast('🛑 पुकार समाप्त कर दी गई एवं सभी लोडिंग प्रोग्राम तुरंत डिलीट हो गए!', 'success');

    // 2. Call backend
    try {
      const res = await fetch('/api/pukar/end-and-clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.pukar) {
          setPukar(data.pukar);
        }
        setPrograms([]);
      }
    } catch (e) {
      console.error('End pukar and clear error:', e);
    }
  };

  // Post next day / shift program
  const handlePostNextDayProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextDayForm.destination.trim()) {
      showAdminToast('कृपया गंतव्य (Destination) दर्ज करें', 'error');
      return;
    }
    try {
      if (clearPreviousOnNextDay) {
        await fetch('/api/loading/programs-clear-all', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ actor: adminUser.name }),
        });
      }

      const res = await fetch('/api/loading/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program: {
            ...nextDayForm,
            dateSection: 'TOMORROW',
            dateLabel: nextDayForm.dateLabel || 'DT. TOMORROW',
            companyCustomName: `${nextDayForm.company} (TOMORROW)`,
          },
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });
      if (res.ok) {
        // Also ensure pukar is active
        await fetch('/api/pukar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: {
              isActive: true,
              announcementHi: `🚨 अगले दिन का नया लोडिंग प्रोग्राम सक्रिय हो गया है: ${nextDayForm.company} -> ${nextDayForm.destination}`,
            },
            actor: adminUser.name,
            actorRole: adminUser.role,
          }),
        });
        showAdminToast('🎉 अगले दिन का नया लोडिंग प्रोग्राम सफलतापूर्वक सक्रिय हो गया!', 'success');
        setShowPostNextDayModal(false);
        setNextDayForm({
          company: 'Hindalco Samelter',
          destination: '',
          categoryRequired: '10-Wheel / 16-18 Ton',
          capacityTonRequired: 18,
          totalQuota: 10,
          ratePerTon: 2200,
          advancePercentage: 70,
          pendingFreightAllowed: false,
          preferenceRule: '15-टू-15 रोटेशन वरीयता',
          programType: 'GENERAL',
          dateSection: 'TOMORROW',
          dateLabel: 'DT. TOMORROW',
          cargo: 'COIL / RI',
        });
        fetchData();
      }
    } catch (err) {
      console.error('Post program error:', err);
    }
  };

  // Real-time Filtered vehicles list (by Owner Name, Vehicle Number, or Phone Number)
  const filteredVehicles = vehicles.filter((v) => {
    const q = fleetSearch.toLowerCase().trim();
    if (!q) {
      const matchesCategory = fleetCategory === 'ALL' || v.category === fleetCategory;
      const matchesStatus = fleetStatus === 'ALL' || v.status === fleetStatus;
      return matchesCategory && matchesStatus;
    }

    const matchesSearch =
      v.normalizedNumber.toLowerCase().includes(q) ||
      v.displayNumber.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.ownerMobile.includes(q) ||
      String(v.serialNumber).includes(q);

    const matchesCategory = fleetCategory === 'ALL' || v.category === fleetCategory;
    const matchesStatus = fleetStatus === 'ALL' || v.status === fleetStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {adminToast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3 max-w-md">
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-bold shadow-xl border flex items-center justify-between gap-3 ${
              adminToast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : adminToast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span>{adminToast.message}</span>
            <button
              type="button"
              onClick={() => setAdminToast(null)}
              className="p-1 hover:bg-white/20 rounded-lg cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Header Control Room Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            title={language === 'en' ? 'Click to change or edit Association Logo' : language === 'or' ? 'ସଂଘ ଲୋଗୋ ବଦଳାଇବା ପାଇଁ କ୍ଲିକ୍ କରନ୍ତୁ' : 'एसोसिएशन लोगो बदलने या संपादित करने के लिए क्लिक करें'}
            className="relative group cursor-pointer focus:outline-none transition-transform hover:scale-105"
          >
            <AssociationLogo size={46} showRing />
            <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-xs border border-slate-200 text-rose-600 group-hover:bg-rose-50 transition-colors">
              <Edit2 className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight font-display">
                {t('adminControlRoom', '🛡️ STOA ADMIN CONTROL ROOM')}
              </h1>
              <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">
                {adminUser.role}
              </span>
            </div>
            <p className="text-xs text-rose-700 font-official font-semibold leading-tight tracking-wide">
              {t('associationName', 'संबलपुर ट्रक ओनर्स एसोसिएशन · 15-टू-15 रोटेशन प्रणाली')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Master App Universal Edit Hub Button */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            title={language === 'en' ? 'Master App Control: Edit anything across the application' : 'मास्टर संपादन केंद्र: पूरे ऐप में कुछ भी बदलें'}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-slate-700"
          >
            <Sliders className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{language === 'en' ? 'Master Editor' : 'पूरे ऐप का संपादन'}</span>
          </button>

          {/* Quick Logo Edit Button */}
          <button
            type="button"
            onClick={() => setShowLogoModal(true)}
            title={t('logoAndBranding', 'लोगो व ब्रांडिंग')}
            className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden lg:inline">{t('editLogo', 'लोगो बदलें')}</span>
          </button>

          {/* Instant Language Switcher (हिन्दी | English | ଓଡ଼ିଆ) */}
          <LanguageSwitcher variant="compact" />

          <button
            type="button"
            onClick={fetchData}
            title={t('refresh', 'रिफ्रेश')}
            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowAiCommander(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-cyan-600/25 cursor-pointer transition-all hover:scale-[1.02] ring-1 ring-cyan-400/40"
            title="STOA AI एडमिन कमांडर एजेंट — बोले या लिखें, तुरंत संपूर्ण नियंत्रण करें"
          >
            <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden md:inline">AI कमांडर एजेंट</span>
            <span className="md:hidden">कमांडर AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
          </button>

          <button
            type="button"
            onClick={onOpenAi}
            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-rose-600/20 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">{t('aiAnalysis', 'STOA एआई विश्लेषण')}</span>
            <span className="sm:hidden">AI</span>
          </button>

          <button
            type="button"
            onClick={logout}
            title={t('logout', 'लॉग आउट')}
            className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-700 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Live Notice Marquee Ticker */}
      <LiveBroadcastTicker showEditButton onEditClick={() => setActiveTab('settings')} />

      {/* Navigation Sub-header (Tabs) */}
      <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1 sm:gap-2 py-2 min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            {t('dashboard', 'डैशबोर्ड')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            {t('fleet', 'फ्लीट प्रबंधन')}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current font-mono">
              {vehicles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('loading')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'loading'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('loading', 'दैनिक लोड व डिस्पैच')}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current font-mono">
              {programs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pukar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'pukar'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {t('pukar', 'पुकार कंट्रोल')}
            {pukar?.isActive && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            {t('ledger', '15-टू-15 लेजर')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('membership')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'membership'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('membership', 'सदस्यता व दस्तावेज')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Daily Reports & Email' : 'दैनिक PDF रिपोर्ट व ईमेल'}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            {t('audit', 'ऑडिट ट्रेल')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('logoAndBranding', 'लोगो व ब्रांडिंग')}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sponsor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'sponsor'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-xs border-amber-500'
                : 'bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100 hover:text-amber-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'en' ? 'Sponsor Manager' : '👑 प्रायोजक नियंत्रण'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('election')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'election'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-xs border-purple-600'
                : 'bg-purple-50/70 text-purple-800 border-purple-200 hover:bg-purple-100 hover:text-purple-900'
            }`}
          >
            <Vote className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === 'en' ? 'Election Manager' : '🗳️ चुनाव प्रबंधन (2026-2028)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-xs border-rose-600'
                : 'bg-rose-50/60 text-rose-800 border-rose-200 hover:bg-rose-100 hover:text-rose-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Master App Editor' : language === 'or' ? 'ମାଷ୍ଟର ସମ୍ପାଦନ କେନ୍ଦ୍ର' : 'मास्टर संपादन केंद्र'}</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Autonomous Admin AI Commander Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 border border-slate-700/80 p-4 sm:p-5 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
                  <Zap className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                      STOA AI एडमिन कमांडर (Autonomous Agent)
                    </h3>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      100% स्वायत्त कार्यकारी नियंत्रण
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    पूरे एडमिन पैनल में पुकार, लोडिंग प्रोग्राम, गेट पास, फ्लीट स्टेटस और दैनिक रिपोर्ट को एक आवाज या टेक्स्ट आदेश से तुरंत नियंत्रित करें।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAiCommander(true)}
                  className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Zap className="w-4 h-4" />
                  <span>कमांडर एजेंट खोलें</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  {t('totalFleet')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                    {stats.totalVehicles || vehicles.length}
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold font-mono">
                    {stats.activeVehicles || vehicles.length} {t('activeVehicles')}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  {t('todayLoaded')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 font-mono">
                    {stats.todayLoaded || 0}
                  </span>
                  <span className="text-xs text-slate-500">{t('rotationComplete')}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  {t('activePrograms')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
                    {programs.filter((p) => p.isActive).length}
                  </span>
                  <span className="text-xs text-slate-500">{t('plantsRoutes')}</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                  {t('feeRevenue')}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                    ₹{(stats.totalCollections || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Association Branding & Logo Control Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <AssociationLogo size={58} showRing />
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
                      {language === 'en' ? "Sambalpur Truck Owner's Association" : language === 'or' ? 'ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ' : 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA)'}
                    </h3>
                    <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">
                      ESTD. 1982
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'en'
                      ? 'Official emblem active on all Gate Passes, Slips, and Mobile Portals.'
                      : language === 'or'
                      ? 'ଅଫିସିଆଲ୍ ଲୋଗୋ ସମସ୍ତ ଗେଟ୍ ପାସ୍, ପର୍ଚି ଓ ମୋବାଇଲ୍ ଆପ୍‌ରେ ସକ୍ରିୟ ଅଛି।'
                      : 'आधिकारिक लोगो सभी गेट पास, पर्ची और मोबाइल पोर्टल्स में सक्रिय है।'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowLogoModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('editLogo', 'लोगो संपादित करें')}</span>
                </button>
              </div>
            </div>

            {/* Daily Loading PDF Report & Email Automation Quick Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">दैनिक लोडिंग PDF रिपोर्ट एवं ऑटो-ईमेल प्रेषण</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-mono font-bold">
                      सक्रिय (Active)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    आज के सभी लोडिंग संचालन, वजन (MT) व उपकर की अधिकृत PDF रिपोर्ट डाउनलोड करें अथवा सीधे एडमिन ईमेल पतों पर प्रेषित करें।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <a
                  href="/api/reports/daily-loading/pdf"
                  download="STOA_Daily_Loading_Report.pdf"
                  className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/20"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PDF डाउनलोड</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-102"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>रिपोर्ट व ईमेल केंद्र</span>
                </button>
              </div>
            </div>

            {/* 7-Day Productivity Trend Graph */}
            <ProductivityTrendPanel
              trend={trendData}
              summary={trendSummary || {
                total7DaysLoadings: 0,
                total7DaysCollections: 0,
                avgDailyLoadings: 0,
                avgDailyCollections: 0,
                peakLoadingDay: '—',
                peakLoadingCount: 0,
                paidPassesCount: 0,
                avgFeeRate: 0,
              }}
            />

            {/* Middle Grid: Quick Dispatch Form & Pukar Controller */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Dispatch Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    {t('quickDispatch')}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{language === 'en' ? 'Counter 01' : language === 'or' ? 'କାଉଣ୍ଟର ୦୧' : 'काउंटर 01'}</span>
                </div>

                <form onSubmit={handleExecuteDispatch} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">गाड़ी नंबर दर्ज करें</label>
                    <input
                      type="text"
                      required
                      value={dispatchVehicleNum}
                      onChange={(e) => setDispatchVehicleNum(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                      placeholder="उदा. OD15X7273"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">लोडिंग प्रोग्राम / कंपनी रूट</label>
                    <select
                      required
                      value={dispatchProgramId}
                      onChange={(e) => setDispatchProgramId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">प्रोग्राम चुनें...</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.company} &rarr; {p.destination} (कोटा: {p.bookedCount}/{p.totalQuota})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">चालक का नाम (Driver Name - Optional)</label>
                    <input
                      type="text"
                      value={dispatchDriverName}
                      onChange={(e) => setDispatchDriverName(e.target.value)}
                      placeholder="उदा. रमेश प्रधान"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {dispatchErrors.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-red-700">
                        <AlertTriangle className="w-4 h-4" /> 9-Point Verification Checks Not Met:
                      </p>
                      {dispatchErrors.map((err, i) => (
                        <p key={i} className="pl-5 text-[11px]">
                          &bull; {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {dispatchSuccessPass && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                      <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle className="w-4 h-4" /> गेट पास जारी: {dispatchSuccessPass.token}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <VehiclePlate number={dispatchSuccessPass.vehicleNumber} size="sm" />
                        <span className="text-[11px] text-slate-700">
                          नया क्रम: #{dispatchSuccessPass.nextSerial} &middot; फीस: ₹{dispatchSuccessPass.paymentAmount}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                  >
                    सत्यापित करें एवं गेट पास जारी करें (Authorize & Dispatch)
                  </button>
                </form>
              </div>

              {/* Pukar Quick Status Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 ${pukar?.isActive ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
                      <h3 className="text-sm font-bold text-slate-900">पुकार स्थिति (Live Pukar)</h3>
                    </div>
                    {/* 1-Click Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePukarRange(undefined, undefined, !pukar?.isActive)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                        pukar?.isActive
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 shadow-2xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                      }`}
                      title="पुकार चालू / बंद टॉगल करें"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${pukar?.isActive ? 'bg-rose-600 animate-ping' : 'bg-slate-400'}`} />
                      <span>{pukar?.isActive ? 'चालू (ACTIVE)' : 'बंद (INACTIVE)'}</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">सक्रिय क्रम सीमा:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-rose-700 text-sm bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                          #{pukar?.startSerial ?? 0} &mdash; #{pukar?.endSerial ?? 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPukarRangeEditor(!showPukarRangeEditor)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-lg text-[10px] font-bold border border-slate-200 transition-colors cursor-pointer"
                          title="एडमिन द्वारा क्रम सीमा सेट करें"
                        >
                          {showPukarRangeEditor ? '✕ बंद' : '⚙️ सीमा सेट करें'}
                        </button>
                      </div>
                    </div>

                    {/* Inline Range Editor (Admin can customize range according to needs) */}
                    {showPukarRangeEditor && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 animate-in fade-in">
                        <span className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider">
                          सक्रिय क्रम सीमा सेट करें (Set Active Range):
                        </span>

                        {/* Quick Presets */}
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {[
                            { label: '#0 — #0 (स्टैंडबाय)', s: 0, e: 0 },
                            { label: '#1 — #50 (सुबह)', s: 1, e: 50 },
                            { label: '#51 — #100 (दोपहर)', s: 51, e: 100 },
                            { label: '#101 — #150 (शाम)', s: 101, e: 150 },
                          ].map((pre) => (
                            <button
                              key={pre.label}
                              type="button"
                              onClick={() => {
                                setPukarStartSerialInput(pre.s);
                                setPukarEndSerialInput(pre.e);
                              }}
                              className="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-200 rounded-md font-mono text-slate-700 hover:text-rose-700 cursor-pointer"
                            >
                              {pre.label}
                            </button>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">प्रारंभिक क्रम (Min #):</label>
                            <input
                              type="number"
                              value={pukarStartSerialInput}
                              onChange={(e) => setPukarStartSerialInput(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500 block mb-0.5">अंतिम क्रम (Max #):</label>
                            <input
                              type="number"
                              value={pukarEndSerialInput}
                              onChange={(e) => setPukarEndSerialInput(Number(e.target.value))}
                              className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={savingPukarRange}
                            onClick={() => handleUpdatePukarRange(pukarStartSerialInput, pukarEndSerialInput)}
                            className="flex-1 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl text-[11px] shadow-xs cursor-pointer hover:from-rose-500 hover:to-pink-500 disabled:opacity-50"
                          >
                            {savingPukarRange ? 'सुरक्षित हो रहा है...' : '✓ क्रम सीमा अपडेट करें'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowPukarRangeEditor(false)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-[11px] cursor-pointer"
                          >
                            रद्द
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">घोषणा समय:</span>
                      <span className="text-slate-700 text-[11px] font-mono">{pukar?.announcedAt?.slice(11, 16) || '08:00'}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-2 leading-relaxed">
                      {pukar?.announcementHi}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab('pukar')}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs border border-slate-200 cursor-pointer"
                  >
                    पुकार नोटिस सेटिंग्स &rarr;
                  </button>
                  {pukar?.isActive && (
                    <button
                      type="button"
                      onClick={handleClearDailyNotice}
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl text-xs border border-red-200 cursor-pointer"
                    >
                      नोटिस हटाएं
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Gate Passes */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                  हालिया जारी गेट पास (Latest Gate Passes)
                </h3>
                <span className="text-xs text-slate-500 font-mono">कुल: {gatePasses.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">टोकन</th>
                      <th className="py-2.5 px-3">गाड़ी नंबर</th>
                      <th className="py-2.5 px-3">मालिक</th>
                      <th className="py-2.5 px-3">कंपनी व रूट</th>
                      <th className="py-2.5 px-3">क्रम (Serial)</th>
                      <th className="py-2.5 px-3">फीस</th>
                      <th className="py-2.5 px-3">भुगतान</th>
                      <th className="py-2.5 px-3 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gatePasses.slice(0, 5).map((pass) => (
                      <tr key={pass.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{pass.token}</td>
                        <td className="py-2.5 px-3">
                          <VehiclePlate number={pass.vehicleNumber} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{pass.ownerName}</td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {pass.company} &rarr; {pass.destination}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          #{pass.currentSerial} &rarr; #{pass.nextSerial}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">₹{pass.paymentAmount}</td>
                        <td className="py-2.5 px-3">
                          {pass.status === 'CANCELLED' ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 block w-fit">
                                रद्द (CANCELLED)
                              </span>
                              <span className="text-[10px] text-red-700 font-semibold block truncate max-w-[150px]" title={pass.cancellationReason}>
                                कारण: {pass.cancellationReason || 'लोडिंग रद्द'}
                              </span>
                            </div>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                pass.paymentStatus === 'VERIFIED_PAID'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {pass.paymentStatus === 'VERIFIED_PAID' ? 'PAID' : 'UNPAID'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {pass.status === 'CANCELLED' ? (
                            <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                              {pass.cancelledBy ? `${pass.cancelledBy}` : 'रद्द अभिलेख'}
                            </span>
                          ) : (
                            <>
                              {pass.paymentStatus === 'UNPAID' && pass.status === 'VALID' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePassForPayment(pass);
                                    setShowVerifyPaymentModal(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold mr-1 cursor-pointer"
                                >
                                  भुगतान दर्ज
                                </button>
                              )}
                              {pass.status === 'VALID' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePassForCancel(pass);
                                    setShowCancelPassModal(true);
                                  }}
                                  className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  रद्द करें
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. FLEET MANAGEMENT VIEW (With Real-time Search by Owner, Vehicle No, or Phone) */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            {/* Action Bar with Search Input Field */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex flex-1 gap-2 items-center">
                {/* Search Input Field with Real-Time Filtering */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={fleetSearch}
                    onChange={(e) => setFleetSearch(e.target.value)}
                    placeholder="मालिक का नाम, गाड़ी नंबर (OD 15...), या फोन नंबर से खोजें..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                  />
                  {fleetSearch && (
                    <button
                      type="button"
                      onClick={() => setFleetSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select
                  value={fleetCategory}
                  onChange={(e) => setFleetCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="ALL">सभी श्रेणियां</option>
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500 font-medium px-2 hidden lg:inline">
                  प्रदर्शित: <strong className="text-slate-900 font-mono">{filteredVehicles.length}</strong> / {vehicles.length} वाहन
                </span>

                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-600" />
                  Excel / CSV आयात
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  नई गाड़ी जोड़ें
                </button>
              </div>
            </div>

            {/* Fleet Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">{t('currentSerial')}</th>
                      <th className="py-3 px-3">{t('truckNo')}</th>
                      <th className="py-3 px-3">{t('ownerName')}</th>
                      <th className="py-3 px-3">{t('mobileNumber')}</th>
                      <th className="py-3 px-3">{t('vehicleCategory')}</th>
                      <th className="py-3 px-3">{t('capacity')}</th>
                      <th className="py-3 px-3">{t('membership')}</th>
                      <th className="py-3 px-3">{t('documents')}</th>
                      <th className="py-3 px-3">{t('status')}</th>
                      <th className="py-3 px-3 text-right">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVehicles.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                          {t('noVehiclesFound')}
                        </td>
                      </tr>
                    ) : (
                      filteredVehicles.map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-mono font-bold text-rose-700">#{v.serialNumber}</td>
                          <td className="py-3 px-3">
                            <VehiclePlate number={v.displayNumber} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-slate-900 font-semibold">{v.ownerName}</td>
                          <td className="py-3 px-3 text-slate-600 font-mono">{v.ownerMobile}</td>
                          <td className="py-3 px-3 text-slate-700">{v.category}</td>
                          <td className="py-3 px-3 text-slate-700 font-mono font-semibold">{v.capacityTon}T</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${
                                  v.membershipStatus === 'ACTIVE'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : v.membershipStatus === 'EXPIRING_SOON'
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {v.membershipStatus === 'ACTIVE' ? t('valid') : v.membershipStatus === 'EXPIRING_SOON' ? t('expiringSoon') : t('expired')}
                              </span>
                              <span className="text-[9.5px] text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit mt-0.5">
                                #{v.renewalCount || (v.renewalHistory ? v.renewalHistory.length : 0)} बार नवीनीकृत
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[11px] text-slate-600">
                              {v.documents?.filter((d) => d.status === 'VALID').length || 6} / 6 {t('valid')}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {v.isBlacklisted ? (
                              <span className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-bold">
                                {t('blacklisted')}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                                {v.status === 'ACTIVE' ? t('valid') : v.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingVehicle(v);
                                  setShowEditVehicleModal(true);
                                }}
                                title={t('edit')}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setVehicleToRenew(v);
                                  setShowRenewModal(true);
                                }}
                                title={t('renew')}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                {t('renew')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedVehicleForHistory(v)}
                                title="नवीनीकरण इतिहास देखें"
                                className="px-1.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-medium cursor-pointer"
                              >
                                इतिहास
                              </button>
                              {v.renewalHistory && v.renewalHistory.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const rec = v.renewalHistory![0];
                                    const link = document.createElement('a');
                                    link.href = `/api/membership/receipt/${rec.receiptNumber}/pdf`;
                                    link.download = `STOA_Renewal_Receipt_${rec.receiptNumber}_${(rec.displayNumber || v.displayNumber).replace(/\s+/g, '_')}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  title="नवीनतम फोटो जैसी PDF रसीद डाउनलोड करें"
                                  className="px-1.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer"
                                >
                                  PDF
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. LOADING & DAILY LOADS VIEW */}
        {activeTab === 'loading' && (
          <div className="space-y-6">
            {/* Programs Bar */}
            {(() => {
              const completedCount = programs.filter((p) => p.bookedCount >= p.totalQuota).length;
              const todayCount = programs.filter((p) => p.dateSection === 'TODAY' || !p.dateSection || p.dateLabel?.includes('TODAY') || p.dateLabel?.includes('16/')).length;
              const tomorrowCount = programs.filter((p) => p.dateSection === 'TOMORROW' || p.dateLabel?.includes('TOMORROW') || p.dateLabel?.includes('17/') || p.destination.includes('TOMORROW')).length;
              const availableCount = programs.filter((p) => p.bookedCount < p.totalQuota).length;

              const displayedPrograms = programs.filter((p) => {
                if (loadFilter === 'TODAY') {
                  return p.dateSection === 'TODAY' || !p.dateSection || p.dateLabel?.includes('TODAY') || p.dateLabel?.includes('16/');
                }
                if (loadFilter === 'TOMORROW') {
                  return p.dateSection === 'TOMORROW' || p.dateLabel?.includes('TOMORROW') || p.dateLabel?.includes('17/') || p.destination.includes('TOMORROW');
                }
                if (loadFilter === 'COMPLETED') {
                  return p.bookedCount >= p.totalQuota;
                }
                if (loadFilter === 'AVAILABLE') {
                  return p.bookedCount < p.totalQuota;
                }
                return true;
              });

              return (
                <>
                  <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between pb-3.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-black text-slate-900 font-display">
                            दैनिक लोडिंग प्रोग्राम प्रबंधन (Daily Load Posting Desk)
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 font-bold border border-rose-200 font-mono">
                            {programs.length} कुल स्लॉट
                          </span>
                          {completedCount > 0 && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 font-mono animate-pulse">
                              {completedCount} पर्ची पूर्ण (हटाने योग्य)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          रोजाना नया लोड पोस्ट करें, गाड़ियां पर्ची कटाने पर तत्काल डिलीट करें एवं अगले दिन का नया प्रोग्राम सेट करें।
                        </p>
                      </div>

                      {/* Header Action Buttons */}
                      <div className="flex flex-wrap gap-2 items-center">
                        {completedCount > 0 && (
                          <button
                            type="button"
                            onClick={handleDeleteCompletedPrograms}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                            title="जिन लोडों की सभी गाड़ियां पर्ची कटा चुकी हैं उन्हें एकबार में हटाएं"
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                            <span>पूर्ण लोड हटाएं ({completedCount})</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={handleFillStandardSchedule}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                          title="स्क्रीनशॉट वाला आधिकारिक नोटिस प्रोग्राम (11 स्लॉट्स) सीधे 1-क्लिक में पोस्ट करें"
                        >
                          <Sparkles className="w-4 h-4 text-slate-950" />
                          <span>⚡ आधिकारिक लोड भरें</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowPostNextDayModal(true)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
                          title="अगले दिन / नई शिफ्ट का नया लोडिंग प्रोग्राम शुरू करें"
                        >
                          <Calendar className="w-4 h-4 text-white" />
                          <span>🌅 अगले दिन का प्रोग्राम</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowNewProgramModal(true)}
                          className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer hover:scale-[1.02] transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>नया लोड पोस्ट करें</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleClearAllDailyPrograms}
                          className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                          title="आज के सभी लोडिंग प्रोग्राम तुरंत डिलीट करें"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          <span>सब हटाएं</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Tabs Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5" /> फ़िल्टर:
                      </span>
                      <button
                        type="button"
                        onClick={() => setLoadFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                          loadFilter === 'ALL'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        सभी स्लॉट ({programs.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadFilter('TODAY')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                          loadFilter === 'TODAY'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                        }`}
                      >
                        आज के लोड ({todayCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadFilter('TOMORROW')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                          loadFilter === 'TOMORROW'
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                        }`}
                      >
                        कल के लोड ({tomorrowCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadFilter('COMPLETED')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                          loadFilter === 'COMPLETED'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        पर्ची पूर्ण ({completedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoadFilter('AVAILABLE')}
                        className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                          loadFilter === 'AVAILABLE'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        खाली कोटा ({availableCount})
                      </button>
                    </div>
                  </div>

                  {/* 3 Real-time Pukar Switch Buttons in Loading Tab */}
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700 text-white rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/80">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-rose-600/30 text-rose-400 border border-rose-500/30 flex items-center justify-center font-black">
                          <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white tracking-wide">
                              लाइव पुकार मोड स्विच (Real-Time 1-Click Conversion)
                            </h4>
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse">
                              LIVE
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">
                            बटन दबाते ही पुकार जहां तक चल रही होगी वहीं से कन्वर्ट हो जाएगी (वर्तमान स्थिति: <strong>क्रम सं. #{pukar?.currentProgressSerial || pukar?.startSerial || 101}</strong>)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs">
                        <span className="text-slate-400 text-[11px]">वर्तमान सक्रिय मोड:</span>
                        <span className="font-bold font-mono text-amber-400">
                          {(pukar?.mode || 'GENERAL') === 'GENERAL'
                            ? '🔵 सामान्य पुकार'
                            : pukar?.mode === 'PENDING'
                            ? '🟠 पेंडिंग पुकार'
                            : '🟣 प्रिफरेंस पुकार'}
                        </span>
                      </div>
                    </div>

                    {/* 3 Buttons Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. सामान्य जनरल पुकार */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPukarMode('GENERAL')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                          (pukar?.mode || 'GENERAL') === 'GENERAL'
                            ? 'bg-blue-600/30 border-blue-400 text-white ring-2 ring-blue-400/40 shadow-blue-900/30'
                            : 'bg-slate-800/70 border-slate-700 hover:border-blue-400/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black flex items-center gap-1.5 text-blue-300">
                            <span>🔵</span> सामान्य जनरल पुकार
                          </span>
                          {(pukar?.mode || 'GENERAL') === 'GENERAL' && (
                            <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          क्रम #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से नियमित 15-टू-15 रोटेशन
                        </p>
                      </button>

                      {/* 2. पेंडिंग पुकार */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPukarMode('PENDING')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                          pukar?.mode === 'PENDING'
                            ? 'bg-amber-600/30 border-amber-400 text-white ring-2 ring-amber-400/40 shadow-amber-900/30'
                            : 'bg-slate-800/70 border-slate-700 hover:border-amber-400/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black flex items-center gap-1.5 text-amber-300">
                            <span>🟠</span> पेंडिंग पुकार
                          </span>
                          {pukar?.mode === 'PENDING' && (
                            <span className="text-[9px] bg-amber-500 text-slate-900 font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          क्रम #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से पेंडिंग राउंड चालू
                        </p>
                      </button>

                      {/* 3. प्रिफरेंस पुकार */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPukarMode('PREFERENCE')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                          pukar?.mode === 'PREFERENCE'
                            ? 'bg-purple-600/30 border-purple-400 text-white ring-2 ring-purple-400/40 shadow-purple-900/30'
                            : 'bg-slate-800/70 border-slate-700 hover:border-purple-400/60 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black flex items-center gap-1.5 text-purple-300">
                            <span>🟣</span> प्रिफरेंस पुकार
                          </span>
                          {pukar?.mode === 'PREFERENCE' && (
                            <span className="text-[9px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                              सक्रिय
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          क्रम #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से संबलपुर वरीयता नियम लागू
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Daily Programs Cards Grid with SLIPS LIST and DELETE actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedPrograms.length === 0 ? (
                      <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 text-xs space-y-3">
                        <p className="font-semibold text-slate-700">
                          {loadFilter === 'ALL'
                            ? 'वर्तमान में कोई सक्रिय लोड नहीं है।'
                            : `इस फ़िल्टर (${loadFilter}) में कोई लोडिंग स्लॉट नहीं मिला।`}
                        </p>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={handleFillStandardSchedule}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                          >
                            ⚡ 1-क्लिक आधिकारिक लोड भरें
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewProgramModal(true)}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
                          >
                            ➕ नया लोड पोस्ट करें
                          </button>
                        </div>
                      </div>
                    ) : (
                      displayedPrograms.map((p) => {
                        const isQuotaFull = p.bookedCount >= p.totalQuota;
                        const slipsList = p.slips || [];
                        const isExpanded = expandedSlipsProgId[p.id] ?? true;

                        return (
                          <div
                            key={p.id}
                            className={`bg-white border rounded-3xl p-4.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                              isQuotaFull
                                ? 'border-emerald-300 ring-2 ring-emerald-400/20 bg-emerald-50/20'
                                : 'border-slate-200'
                            }`}
                          >
                            <div>
                              {/* Top Tag Badges */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-mono">
                                    {p.companyCustomName || p.company}
                                  </span>
                                  {p.dateLabel && (
                                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-mono">
                                      {p.dateLabel}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {p.programType === 'PENDING' ? (
                                    <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
                                      🟠 पेंडिंग
                                    </span>
                                  ) : p.programType === 'PREFERENCE' ? (
                                    <span className="text-[10px] bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-md font-bold">
                                      🟣 प्रिफरेंस
                                    </span>
                                  ) : (
                                    <span className="text-[10px] bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded-md font-bold">
                                      🔵 सामान्य
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Destination Headline */}
                              <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                                &rarr; {p.destination}
                              </h4>

                              {/* Quota Progress Bar */}
                              <div className="mt-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                                <div className="flex justify-between items-center mb-1 font-mono font-bold">
                                  <span className={isQuotaFull ? 'text-emerald-700' : 'text-slate-700'}>
                                    {isQuotaFull ? '✅ पर्ची कटाई पूर्ण' : 'कोटा प्रगति'}
                                  </span>
                                  <span className={isQuotaFull ? 'text-emerald-700 text-xs' : 'text-slate-900'}>
                                    {p.bookedCount}/{p.totalQuota} गाड़ियां
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      isQuotaFull ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(100, Math.round((p.bookedCount / p.totalQuota) * 100))}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Details */}
                              <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                                <div className="flex justify-between">
                                  <span>वाहन श्रेणी / टन:</span>
                                  <span className="text-slate-900 font-semibold font-mono">
                                    {p.capacityTonRequired || 18} MT &bull; {p.categoryRequired}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>दर प्रति टन:</span>
                                  <span className="text-slate-900 font-mono font-bold">₹{p.ratePerTon} / Ton</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>अग्रिम (Advance):</span>
                                  <span className="text-slate-900 font-mono font-medium">{p.advancePercentage || 70}%</span>
                                </div>
                                {p.preferenceRule && (
                                  <div className="flex justify-between text-[11px]">
                                    <span>नियम / टिप्पणी:</span>
                                    <span className="text-rose-700 font-medium truncate max-w-[200px]" title={p.preferenceRule}>
                                      {p.preferenceRule}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Vehicles that cut slips section */}
                              {slipsList.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-slate-100">
                                  <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedSlipsProgId((prev) => ({
                                          ...prev,
                                          [p.id]: !isExpanded,
                                        }))
                                      }
                                      className="flex items-center gap-1 text-emerald-800 hover:text-emerald-950 cursor-pointer"
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>पर्ची कटी गाड़ियां ({slipsList.length}):</span>
                                      {isExpanded ? (
                                        <ChevronUp className="w-3 h-3 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="w-3 h-3 text-slate-400" />
                                      )}
                                    </button>
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {p.totalQuota - slipsList.length > 0
                                        ? `${p.totalQuota - slipsList.length} स्लॉट खाली`
                                        : '100% पूर्ण'}
                                    </span>
                                  </div>

                                  {isExpanded && (
                                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                                      {slipsList.map((slip) => (
                                        <div
                                          key={slip.id}
                                          className="p-2 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between text-[11px] gap-2"
                                        >
                                          <div>
                                            <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-300 text-[10px]">
                                                {slip.vehicleNumber}
                                              </span>
                                              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                                                #{slip.currentSerial}
                                              </span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono truncate max-w-[160px]">
                                              {slip.ownerName} &bull; {slip.issueTime?.slice(0, 5)}
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleCancelSlipForVehicle(
                                                slip.id,
                                                slip.vehicleNumber,
                                                `${p.company} - ${p.destination}`
                                              )
                                            }
                                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1 shrink-0"
                                            title="गाड़ी की पर्ची हटाएं व कोटा पुनः खोलें"
                                          >
                                            <Trash2 className="w-3 h-3 text-red-600" />
                                            <span>पर्ची हटाएं</span>
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                              {isQuotaFull && (
                                <div className="p-2 bg-emerald-100/80 rounded-xl text-center text-[11px] font-bold text-emerald-900 border border-emerald-300">
                                  🎉 सभी {p.totalQuota} गाड़ियां पर्ची कटा चुकी हैं!
                                </div>
                              )}

                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ID: {p.id.slice(-6)}
                                </span>

                                {isQuotaFull ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteProgram(p.id, `${p.company} - ${p.destination}`)
                                    }
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-[1.02]"
                                    title="सभी गाड़ियां पर्ची कटा चुकी हैं — यह लोड हटाएं"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    <span>पर्ची कटाई पूर्ण — लोड हटाएं</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteProgram(p.id, `${p.company} - ${p.destination}`)
                                    }
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                                    title="यह लोड हटाएं"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                    <span>लोड हटाएं (Delete)</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </>
              );
            })()}

            {/* 9-Point Verification Checklist Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                STOA 9-पॉइंट डिस्पैच सत्यापन प्रणाली (9-Point Dispatch Protocol)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                एसोसिएशन रोटेशन नियमों के अनुसार प्रत्येक डिस्पैच पर ये 9 चेक अनिवार्य रूप से लागू होते हैं:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">1. फ्लीट अस्तित्व (Vehicle Exists)</span>
                  <span className="text-slate-600 text-[11px]">वाहन STOA पंजीकृत डेटाबेस में होना अनिवार्य है।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">2. सक्रिय स्थिति (Active Status)</span>
                  <span className="text-slate-600 text-[11px]">वाहन ब्रेकडाउन अथवा मेंटेनेंस में न हो।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">3. वैध सदस्यता (Valid Membership)</span>
                  <span className="text-slate-600 text-[11px]">एसोसिएशन सदस्यता एक्सपायर न हो।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">4. ब्लैकलिस्ट जांच (No Blacklist)</span>
                  <span className="text-slate-600 text-[11px]">अनुशासनात्मक व वित्तीय ब्लैकलिस्ट मुक्त।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">5. पुकार सक्रियता (Pukar Active)</span>
                  <span className="text-slate-600 text-[11px]">कंट्रोल रूम द्वारा पुकार चालू की गई हो।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">6. पुकार रेंज (Serial In Range)</span>
                  <span className="text-slate-600 text-[11px]">क्रम संख्या निर्धारित पुकार सीमा में हो।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">7. Same-Day Lock</span>
                  <span className="text-slate-600 text-[11px]">एक वाहन एक ही दिन में दो बार लोड नहीं हो सकता।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">8. सक्रिय प्रोग्राम (Program Active)</span>
                  <span className="text-slate-600 text-[11px]">कंपनी व प्लांट द्वारा मांग सक्रिय हो।</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="font-bold text-rose-700 block mb-0.5">9. कोटा उपलब्धता (Quota Available)</span>
                  <span className="text-slate-600 text-[11px]">गंतव्य का वाहन कोटा रिक्त होना चाहिए।</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. PUKAR MANAGEMENT VIEW */}
        {activeTab === 'pukar' && (
          <div className="space-y-6">
            {/* Daily Loading Program Manager & Shift Schedule Controller */}
            <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-display">
                      दैनिक लोडिंग प्रोग्राम संचालन एवं ऑटो-शिफ्ट नियंत्रण
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      रोजाना सुबह 10:00 AM और शाम 04:00 PM शिफ्ट आधारित स्वचालित नियंत्रण
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full font-mono font-bold">
                    शिफ्ट समय: सुबह 10:00 AM &bull; शाम 04:00 PM
                  </span>
                </div>
              </div>

              {/* Action buttons: Clear All, End Pukar & Wipe All, Post New Program */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. Post New Program for Tomorrow / Next Shift */}
                <button
                  type="button"
                  onClick={() => setShowPostNextDayModal(true)}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <div className="text-left">
                    <span className="text-[10px] text-indigo-200 block uppercase tracking-wider">नया प्रोग्राम</span>
                    <span className="text-xs font-bold block mt-0.5">➕ अगले दिन/शिफ्ट का लोड जोड़ें</span>
                  </div>
                  <Plus className="w-4 h-4 shrink-0 text-indigo-200" />
                </button>

                {/* 2. Clear All Daily Loading Programs */}
                <button
                  type="button"
                  onClick={handleClearAllDailyPrograms}
                  className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer hover:scale-[1.01]"
                >
                  <div className="text-left">
                    <span className="text-[10px] text-red-200 block uppercase tracking-wider">प्रतिदिन तुरंत सफाई</span>
                    <span className="text-xs font-bold block mt-0.5">🗑️ संपूर्ण प्रोग्राम हटाएं (तुरंत 1-क्लिक)</span>
                  </div>
                  <Trash2 className="w-4 h-4 shrink-0 text-white" />
                </button>

                {/* 3. End Pukar & Delete All */}
                <button
                  type="button"
                  onClick={handleEndPukarAndClearAll}
                  className="p-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
                >
                  <div className="text-left">
                    <span className="text-[10px] text-red-200 block uppercase tracking-wider">पुकार समाप्ति</span>
                    <span className="text-xs font-bold block mt-0.5">🛑 पुकार बंद करें व सब डिलीट करें</span>
                  </div>
                  <Radio className="w-4 h-4 shrink-0 text-red-200" />
                </button>
              </div>

              {/* Status explanation */}
              <div className="p-3 bg-white rounded-2xl border border-amber-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                <span className="text-base shrink-0">ℹ️</span>
                <p className="leading-relaxed">
                  <strong>ऑटो-एल्गोरिथम नियम:</strong> जब कोई लोडिंग प्रोग्राम सक्रिय नहीं होता है, तो गाड़ी मालिकों के डैशबोर्ड पर स्वचालित रूप से यह संदेश दिखाई देता है: <em>&ldquo;वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है।&rdquo;</em> (अगली शिफ्ट की लाइव उल्टी गिनती के साथ)।
                </p>
              </div>
            </div>

            {/* Real-Time 3 Pukar Mode Transition Controller (सामान्य, पेंडिंग, प्रिफरेंस पुकार) */}
            <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900 font-display">
                        पुकार मोड चयन एवं तत्काल कन्वर्शन (3 Pukar Modes)
                      </h3>
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      बटन दबाते ही पुकार जहां तक चल रही होगी, वहीं से आगे तुरंत उस मोड में कन्वर्ट हो जाएगी।
                    </p>
                  </div>
                </div>

                {/* Active Mode Pill */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-slate-500">वर्तमान सक्रिय:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black font-mono flex items-center gap-1.5 shadow-2xs ${
                      (pukar?.mode || 'GENERAL') === 'PENDING'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : (pukar?.mode || 'GENERAL') === 'PREFERENCE'
                        ? 'bg-purple-100 text-purple-900 border border-purple-300 animate-pulse'
                        : 'bg-blue-100 text-blue-900 border border-blue-300'
                    }`}
                  >
                    {(pukar?.mode || 'GENERAL') === 'PENDING'
                      ? '🟠 पेंडिंग पुकार'
                      : (pukar?.mode || 'GENERAL') === 'PREFERENCE'
                      ? '🟣 प्रिफरेंस पुकार'
                      : '🔵 सामान्य जनरल पुकार'}
                  </span>
                </div>
              </div>

              {/* Progress point & conversion indicator */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-600 font-semibold">वर्तमान रनिंग पॉइंट:</span>
                  <strong className="font-mono text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 font-black text-sm">
                    #{pukar?.currentProgressSerial || pukar?.startSerial || 101}
                  </strong>
                  {pukar?.modeSwitchSerial && (
                    <span className="text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl font-bold">
                      ✓ अंतिम कन्वर्शन बिंदु: #{pukar.modeSwitchSerial} से लागू
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>0ms इंस्टेंट कन्वर्शन एल्गोरिथम सक्रिय</span>
                </div>
              </div>

              {/* 3 Large Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Button 1: सामान्य जनरल पुकार (General) */}
                <button
                  type="button"
                  onClick={() => handleSwitchPukarMode('GENERAL')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                    (pukar?.mode || 'GENERAL') === 'GENERAL'
                      ? 'bg-blue-50/90 border-blue-500 text-blue-950 ring-4 ring-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-black flex items-center gap-1.5">
                      <span>🔵</span> सामान्य पुकार
                    </span>
                    {(pukar?.mode || 'GENERAL') === 'GENERAL' && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        चालू (ACTIVE)
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-blue-900">15-टू-15 जनरल रोटेशन</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    क्रम संख्या #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से नियमित 15-टू-15 क्रमिक आवर्तन जारी रहेगा।
                  </p>
                </button>

                {/* Button 2: पेंडिंग पुकार (Pending) */}
                <button
                  type="button"
                  onClick={() => handleSwitchPukarMode('PENDING')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                    pukar?.mode === 'PENDING'
                      ? 'bg-amber-50/90 border-amber-500 text-amber-950 ring-4 ring-amber-500/10'
                      : 'bg-white border-slate-200 hover:border-amber-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-black flex items-center gap-1.5">
                      <span>🟠</span> पेंडिंग पुकार
                    </span>
                    {pukar?.mode === 'PENDING' && (
                      <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        चालू (ACTIVE)
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-amber-900">पेंडिंग भाड़ा व राउंड</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    बटन दबाते ही क्रम #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से पेंडिंग गाड़ियां तुरंत प्राथमिकता पर आएंगी।
                  </p>
                </button>

                {/* Button 3: प्रिफरेंस पुकार (Preference) */}
                <button
                  type="button"
                  onClick={() => handleSwitchPukarMode('PREFERENCE')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer shadow-xs hover:scale-[1.01] ${
                    pukar?.mode === 'PREFERENCE'
                      ? 'bg-purple-50/90 border-purple-500 text-purple-950 ring-4 ring-purple-500/10'
                      : 'bg-white border-slate-200 hover:border-purple-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-black flex items-center gap-1.5">
                      <span>🟣</span> प्रिफरेंस पुकार
                    </span>
                    {pukar?.mode === 'PREFERENCE' && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                        चालू (ACTIVE)
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-purple-900">संबलपुर लोकल / वरीयता</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    क्रम #{pukar?.currentProgressSerial || pukar?.startSerial || 101} से स्थानीय संबलपुर व विशेष रूट वरीयता नियम लागू होंगे।
                  </p>
                </button>
              </div>
            </div>

            {/* AI 1-Click Raw Notice Publisher Panel */}
            <PukarRawNoticePublisher
              currentNotice={pukar?.currentNotice}
              onPublished={() => {
                fetchData();
              }}
            />

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">पुकार संचालन नियंत्रण (Pukar Controller)</h3>
                    <p className="text-xs text-slate-500">संबलपुर 15-टू-15 मासिक चक्र रोटेशन पुकार</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pukar?.isActive ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {pukar?.isActive ? 'पुकार चालू (ACTIVE)' : 'पुकार बंद (STOPPED)'}
                </span>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!pukar) return;
                  await fetch('/api/pukar', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      updates: pukar,
                      actor: adminUser.name,
                      actorRole: adminUser.role,
                    }),
                  });
                  fetchData();
                }}
                className="space-y-4 text-xs"
              >
                {/* On/Off Switch */}
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block">पुकार स्थिति चालू / बंद (Toggle Pukar)</span>
                    <span className="text-[11px] text-slate-500">चालू करने पर यह तुरंत सभी मालिक ऐप पर दिखाई देगी।</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPukar({ ...pukar!, isActive: !pukar?.isActive })}
                      className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                        pukar?.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      {pukar?.isActive ? t('stopPukar', 'पुकार बंद करें') : t('startPukar', 'पुकार शुरू करें')}
                    </button>
                    {pukar?.isActive && (
                      <button
                        type="button"
                        onClick={handleClearDailyNotice}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold transition-all cursor-pointer"
                        title={t('clearDailyNotice', 'दैनिक नोटिस हटाएं')}
                      >
                        {t('delete', 'हटाएं')}
                      </button>
                    )}
                  </div>
                </div>

                {/* Serial Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">{t('startSerial', 'प्रारंभिक क्रम')}</label>
                    <input
                      type="number"
                      value={pukar?.startSerial || 101}
                      onChange={(e) => setPukar({ ...pukar!, startSerial: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">{t('endSerial', 'अंतिम क्रम')}</label>
                    <input
                      type="number"
                      value={pukar?.endSerial || 115}
                      onChange={(e) => setPukar({ ...pukar!, endSerial: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                {/* Announcements in Hindi, English, Odia */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('hindiAnnouncement', 'हिंदी घोषणा संदेश')}</label>
                  <textarea
                    rows={2}
                    value={pukar?.announcementHi || ''}
                    onChange={(e) => setPukar({ ...pukar!, announcementHi: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('odiaAnnouncement', 'ଓଡ଼ିଆ ଘୋଷଣା ବାର୍ତ୍ତା')}</label>
                  <textarea
                    rows={2}
                    value={pukar?.announcementOr || ''}
                    onChange={(e) => setPukar({ ...pukar!, announcementOr: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('englishAnnouncement', 'English Announcement')}</label>
                  <textarea
                    rows={2}
                    value={pukar?.announcementEn || ''}
                    onChange={(e) => setPukar({ ...pukar!, announcementEn: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  {t('saveBroadcast', 'पुकार परिवर्तन सहेजें एवं प्रसारित करें')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 5. 15-TO-15 LIFETIME LEDGER & DAILY CASH CSV */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('ledger', '15-टू-15 बहीखाता')}</h3>
                <p className="text-[11px] text-slate-500">
                  {t('cycle', 'आवर्तन चक्र')}: <strong className="text-rose-700 font-mono">{stats.currentCycle}</strong>
                </p>
              </div>

              {/* Daily Cash CSV Export */}
              <a
                href="/api/ledger/daily-cash-csv"
                download
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                {t('downloadCsvPaid', 'दैनिक रोकड़ सीएसवी डाउनलोड')}
              </a>
            </div>

            {/* Ledger Table */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">{t('token', 'टोकन')}</th>
                      <th className="py-3 px-3">{t('issueDate', 'दिनांक')}</th>
                      <th className="py-3 px-3">{t('truckNo', 'गाड़ी नंबर')}</th>
                      <th className="py-3 px-3">{t('ownerName', 'मालिक')}</th>
                      <th className="py-3 px-3">{t('routeDestination', 'कंपनी व रूट')}</th>
                      <th className="py-3 px-3">{t('cycle', 'रोटेशन क्रम')}</th>
                      <th className="py-3 px-3">{t('fee', 'फीस भुगतान')}</th>
                      <th className="py-3 px-3">{t('status', 'स्थिति')}</th>
                      <th className="py-3 px-3 text-right">{t('actions', 'कार्य')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ledgerEntries.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-rose-700">{l.token}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{l.loadingDate}</td>
                        <td className="py-3 px-3">
                          <VehiclePlate number={l.vehicleNumber} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium">{l.ownerName}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {l.company} &rarr; {l.route}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          #{l.currentSerial} &rarr; #{l.newSerial}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span
                            className={`font-semibold ${
                              l.paymentStatus === 'VERIFIED_PAID' ? 'text-emerald-700' : 'text-amber-800'
                            }`}
                          >
                            {l.paymentStatus === 'VERIFIED_PAID' ? `₹${l.amountPaid} (${t('verifiedPaid')})` : t('unpaid')}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              l.status === 'VALID' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                            title="रसीद प्रिंट"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. MEMBERSHIP & DOCUMENTS VIEW */}
        {activeTab === 'membership' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">सदस्यता नवीनीकरण एवं दस्तावेज निगरानी</h3>
                <p className="text-[11px] text-slate-500">
                  PUC, Insurance, Road Tax, Fitness, National Permit, Odisha Permit की समाप्ति ट्रैकिंग
                </p>
              </div>
              <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1 rounded-xl">
                नवीनीकरण अवधि: 6, 12, 24 माह
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">गाड़ी नंबर</th>
                      <th className="py-3 px-3">मालिक</th>
                      <th className="py-3 px-3">सदस्यता संख्या</th>
                      <th className="py-3 px-3">समाप्ति दिनांक</th>
                      <th className="py-3 px-3">स्थिति</th>
                      <th className="py-3 px-3">दस्तावेज चेतावनी</th>
                      <th className="py-3 px-3 text-right">कार्य</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((v) => {
                      const expiringDocs = v.documents?.filter(
                        (d) => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED'
                      );
                      return (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <VehiclePlate number={v.displayNumber} size="sm" />
                          </td>
                          <td className="py-3 px-3 text-slate-900 font-medium">{v.ownerName}</td>
                          <td className="py-3 px-3 font-mono text-rose-700 font-semibold">{v.membershipNumber}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs font-semibold text-slate-700">{v.membershipExpiryDate}</span>
                              <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 w-fit mt-0.5">
                                कुल {v.renewalCount || (v.renewalHistory ? v.renewalHistory.length : 0)} बार नवीनीकृत
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                v.membershipStatus === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : v.membershipStatus === 'EXPIRING_SOON'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {v.membershipStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {expiringDocs && expiringDocs.length > 0 ? (
                              <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-semibold">
                                ⚠️ {expiringDocs.map((d) => d.docType).join(', ')} नवीनीकरण योग्य
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-700">सभी 6 वैध</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setVehicleToRenew(v);
                                  setShowRenewModal(true);
                                }}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                title="सदस्यता रिन्यू करें और असली फोटो जैसा PDF जनरेट करें"
                              >
                                रिन्यू करें
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedVehicleForHistory(v)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors"
                                title="नवीनीकरण इतिहास व सभी रसीदें देखें"
                              >
                                इतिहास ({v.renewalCount || (v.renewalHistory ? v.renewalHistory.length : 0)})
                              </button>

                              {v.renewalHistory && v.renewalHistory.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const latestRec = v.renewalHistory![0];
                                    const link = document.createElement('a');
                                    link.href = `/api/membership/receipt/${latestRec.receiptNumber}/pdf`;
                                    link.download = `STOA_Renewal_Receipt_${latestRec.receiptNumber}_${(latestRec.displayNumber || v.displayNumber).replace(/\s+/g, '_')}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                                  title="नवीनतम फोटो जैसी PDF रसीद डाउनलोड करें"
                                >
                                  📄 PDF
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6.5 DAILY PDF REPORT & AUTOMATED EMAIL TAB */}
        {activeTab === 'reports' && <DailyReportManager />}

        {/* 7. AUDIT TRAIL VIEW */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">पूर्ण ऑडिट इतिहास (Immutable Audit Log)</h3>
                <p className="text-[11px] text-slate-500">प्रत्येक संपादन, आयात, रोटेशन व रद्दीकरण का डिजिटल साक्ष्य</p>
              </div>
              <span className="text-xs text-slate-500 font-mono">कुल रिकॉर्ड्स: {auditLogs.length}</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3">{t('timestamp', 'समय')}</th>
                      <th className="py-3 px-3">{t('actor', 'कार्यकर्ता')}</th>
                      <th className="py-3 px-3">{t('action', 'क्रिया')}</th>
                      <th className="py-3 px-3">{t('truckNo', 'गाड़ी नंबर')}</th>
                      <th className="py-3 px-3">{t('source', 'स्रोत')}</th>
                      <th className="py-3 px-3">
                        {language === 'en' ? 'Details / Notes' : language === 'or' ? 'ବିବରଣୀ / ଟିପ୍ପଣୀ' : 'विवरण / नोट्स'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                          {log.timestamp.slice(0, 19).replace('T', ' ')}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actor}</td>
                        <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">{log.action}</td>
                        <td className="py-2.5 px-3">
                          {log.vehicleNumber ? (
                            <VehiclePlate number={log.vehicleNumber} size="sm" />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
                            {log.source}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs truncate">
                          {log.notes || `${log.field || ''}: ${log.oldValue || ''} -> ${log.newValue || ''}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 8. LOGO & BRANDING STUDIO VIEW */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <AssociationLogo size={80} showRing />
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 font-display">
                        {language === 'en'
                          ? 'Sambalpur Truck Owner\'s Association — Logo & Identity'
                          : language === 'or'
                          ? 'ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ — ଲୋଗୋ ଓ ପରିଚୟ'
                          : 'संबलपुर ट्रक ओनर्स एसोसिएशन — आधिकारिक लोगो एवं ब्रांडिंग'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'en'
                        ? 'Administrative control over the official emblem. Changes update immediately across all devices, digital gate passes, and portals.'
                        : language === 'or'
                        ? 'ଅଫିସିଆଲ୍ ଲୋଗୋ ପରିଚାଳନା। ପରିବର୍ତ୍ତନ ତୁରନ୍ତ ସମସ୍ତ ଡିଭାଇସ୍, ଗେଟ୍ ପାସ୍ ଓ ପୋର୍ଟାଲ୍‌ରେ ଲାଗୁ ହୁଏ।'
                        : 'आधिकारिक लोगो का प्रशासनिक नियंत्रण। बदलाव तुरंत सभी मोबाइल डिवाइसों, डिजिटल गेट पास और पोर्टल्स में लागू हो जाते हैं।'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogoModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('changeLogo', 'नया लोगो अपलोड / चेंज करें')}</span>
                </button>
              </div>

              {/* Multi-Size Showcase Grid */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {language === 'en' ? 'Live System Appearances' : language === 'or' ? 'ବିଭିନ୍ନ ସ୍ଥାନରେ ଲାଇଭ୍ ପ୍ରଦର୍ଶନ' : 'एप्लिकेशन के विभिन्न हिस्सों में लाइव प्रदर्शन'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Top Bar Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      {language === 'en' ? '1. App Top Header (36px)' : language === 'or' ? '୧. ଟପ୍ ହେଡର୍ (୩୬px)' : '1. टॉप हेडर (36px)'}
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2.5 shadow-2xs">
                      <AssociationLogo size={36} showRing />
                      <div>
                        <span className="text-xs font-black text-slate-900 block font-display leading-tight">STOA NEXTGEN</span>
                        <span className="text-[10px] text-rose-700 font-semibold">{t('appSubtitle', 'संबलपुर ट्रक ओनर्स एसोसिएशन')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Gate Pass Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      {language === 'en' ? '2. Digital Gate Pass Sheet (52px)' : language === 'or' ? '୨. ଡିଜିଟାଲ୍ ଗେଟ୍ ପାସ୍ (୫୨px)' : '2. डिजिटल गेट पास पत्र (52px)'}
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col items-center text-center shadow-2xs">
                      <AssociationLogo size={52} showRing className="mb-1" />
                      <span className="text-[10px] font-bold text-rose-700 uppercase">{t('appSubtitle', 'संबलपुर ट्रक ओनर्स एसोसिएशन')}</span>
                      <span className="text-xs font-black text-slate-900">{t('digitalGatePass', 'डिजिटल गेट पास')}</span>
                    </div>
                  </div>

                  {/* High Res Seal Preview */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                      {language === 'en' ? '3. High-Res Official Seal (88px)' : language === 'or' ? '୩. ହାଇ-ରେଜୋଲ୍ୟୁସନ୍ ସିଲ୍ (୮୮px)' : '3. हाई-रिज़ॉल्यूशन आधिकारिक सील (88px)'}
                    </span>
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-center shadow-2xs">
                      <AssociationLogo size={88} showRing />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 9. SPONSOR MANAGEMENT STUDIO VIEW */}
        {activeTab === 'sponsor' && (
          <SponsorManagerPanel />
        )}

        {/* 10. STOA BIENNIAL ELECTION MANAGER VIEW */}
        {activeTab === 'election' && (
          <ElectionManagerPanel registeredVehicles={vehicles} />
        )}

        {/* 11. MASTER APP CONTROL & UNIVERSAL EDIT HUB */}
        {activeTab === 'settings' && (
          <MasterSettingsPanel
            onNavigateTab={(tab) => {
              if (['fleet', 'loading', 'pukar', 'membership', 'ledger', 'audit', 'branding', 'dashboard'].includes(tab)) {
                setActiveTab(tab as any);
              }
            }}
            onOpenLogoModal={() => setShowLogoModal(true)}
            onOpenNewProgram={() => setShowNewProgramModal(true)}
            onOpenAddVehicle={() => setShowAddVehicleModal(true)}
          />
        )}
      </main>

      {/* ---------------- MODALS ---------------- */}

      {/* ASSOCIATION LOGO MANAGER MODAL */}
      <LogoManagerModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        adminName={adminUser.name}
      />

      {/* 1. EXCEL/CSV FLEET IMPORT MODAL */}
      <FleetImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          fetchData();
        }}
        adminName={adminUser.name}
        adminRole={adminUser.role}
      />

      {/* 2. PAYMENT VERIFICATION MODAL */}
      {showVerifyPaymentModal && activePassForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              {t('verifyPaymentModalTitle', 'एसोसिएशन फीस भुगतान सत्यापन')}
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <p className="text-slate-600">{t('token')}: <span className="font-mono font-bold text-rose-700">{activePassForPayment.token}</span></p>
              <div className="flex items-center gap-2">
                <span className="text-slate-600">{t('truckNo')}:</span>
                <VehiclePlate number={activePassForPayment.vehicleNumber} size="sm" />
              </div>
              <p className="text-slate-600">
                {language === 'en' ? 'Amount Due:' : language === 'or' ? 'ଦେୟ ରାଶି:' : 'देय राशि:'} <span className="text-base font-bold text-emerald-700">₹{activePassForPayment.paymentAmount}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs text-slate-700 mb-1 font-semibold">
                {t('refNo', 'कैश रसीद संख्या / यूपीआई संदर्भ')}
              </label>
              <input
                type="text"
                value={paymentRefInput}
                onChange={(e) => setPaymentRefInput(e.target.value)}
                placeholder={language === 'en' ? 'e.g. UPI-9921827 or CASH-01' : 'उदा. UPI-9921827 या CASH-01'}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowVerifyPaymentModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleVerifyPayment}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                {t('recordPayment', 'भुगतान दर्ज करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CANCEL GATE PASS MODAL */}
      {showCancelPassModal && activePassForCancel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
              <Ban className="w-4 h-4" />
              {t('cancelGatePass', 'गेट पास रद्द करें')}
            </h3>

            <p className="text-xs text-slate-600">
              {language === 'en'
                ? 'Cancelling the pass will restore rotation serial and release loading quota.'
                : language === 'or'
                ? 'ପାସ୍ ବାତିଲ୍ କଲେ ଗାଡ଼ିର କ୍ରମିକ ସଂଖ୍ୟା ପୂର୍ବପରି ହୋଇଯିବ ଏବଂ କୋଟା ଖାଲି ହେବ।'
                : 'पास रद्द करने पर गाड़ी का क्रम पूर्ववत कर दिया जाएगा और कोटा पुनः उपलब्ध हो जाएगा।'}
            </p>

            <div>
              <label className="block text-xs text-slate-700 mb-1 font-semibold">{t('cancelReason', 'रद्दीकरण का कारण')}</label>
              <textarea
                rows={2}
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                placeholder={language === 'en' ? 'e.g. Driver sickness or plant shutdown' : 'उदा. ड्राइवर अस्वस्थता अथवा प्लांट लोडिंग निरस्त'}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelPassModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                {t('back')}
              </button>
              <button
                type="button"
                onClick={handleCancelPass}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                {t('cancelGatePass', 'रद्द करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. RENEW MEMBERSHIP MODAL */}
      {showRenewModal && vehicleToRenew && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-rose-600" />
                <span>{t('renewMembership', 'सदस्यता नवीनीकरण')}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">{t('truckNo')}:</span>
                <VehiclePlate number={vehicleToRenew.displayNumber} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">मालिक का नाम:</span>
                <strong className="text-slate-900 font-bold">{vehicleToRenew.ownerName}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">सदस्यता संख्या:</span>
                <span className="font-mono font-bold text-slate-900">{vehicleToRenew.membershipNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">सुरक्षित नवीनीकरण संख्या:</span>
                <span className="font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  वर्तमान में {vehicleToRenew.renewalCount || 0} बार &rarr; नया #{ (vehicleToRenew.renewalCount || 0) + 1 } बार होगा
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-600">वर्तमान समाप्ति:</span>
                <span className="font-mono text-rose-700 font-bold">{vehicleToRenew.membershipExpiryDate}</span>
              </div>
            </div>

            {/* Renewal Period */}
            <div>
              <label className="block text-xs text-slate-800 mb-1.5 font-bold">
                {t('renewalPeriod', 'नवीनीकरण अवधि')}:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[6, 12, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setRenewalMonths(m as any);
                      if (m === 6) setRenewalFeeInput(150);
                      else if (m === 12) setRenewalFeeInput(300);
                      else setRenewalFeeInput(600);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      renewalMonths === m
                        ? 'bg-rose-50 text-rose-700 border-rose-600 font-black ring-2 ring-rose-500/20 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">{m} {t('months', 'माह')}</span>
                    <span className="text-[10px] text-slate-500 block">
                      ₹{m === 6 ? '150' : m === 12 ? '300' : '600'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Renewal Fee & Payment Mode */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs text-slate-800 mb-1 font-bold">
                  शुल्क राशि (₹):
                </label>
                <input
                  type="number"
                  value={renewalFeeInput}
                  onChange={(e) => setRenewalFeeInput(Number(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-800 mb-1 font-bold">
                  भुगतान माध्यम:
                </label>
                <select
                  value={renewalPaymentMode}
                  onChange={(e) => setRenewalPaymentMode(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                >
                  <option value="CASH">नकद (Cash)</option>
                  <option value="UPI">UPI / QR</option>
                  <option value="ONLINE">ऑनलाइन ट्रांसफर</option>
                </select>
              </div>
            </div>

            {/* Photo Replica Notice */}
            <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
              <span className="text-xl shrink-0">📄</span>
              <p className="leading-snug">
                <strong>असली फोटो जैसा PDF रसीद जनरेटर:</strong> जैसे ही <strong>'रिन्यू करें'</strong> बटन दबाएंगे, अपलोड किए गए फोटो जैसा आधिकारिक सदस्यता नवीनीकरण रसीद PDF (एसोसिएशन के दोनों लोगो, गाड़ी नंबर, नई वैधता और रसीद संख्या के साथ) तुरंत जनरेट होकर स्वतः डाउनलोड हो जाएगा और रिकॉर्ड हमेशा सुरक्षित रहेगा।
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRenewModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleRenewMembership}
                className="flex-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
              >
                <span>रिन्यू करें व असली PDF जनरेट करें &rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD VEHICLE MODAL */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-rose-600" />
              {t('addNewVehicle', 'फ्लीट में नया वाहन जोड़ें')}
            </h3>

            <form onSubmit={handleAddVehicle} className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-semibold">{t('truckNo', 'गाड़ी नंबर')}</label>
                  {getRtoDisplay(newVehNum, language) && (
                    <span className="text-[11px] text-rose-600 font-bold font-mono">
                      {getRtoDisplay(newVehNum, language)}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={newVehNum}
                  onChange={(e) => setNewVehNum(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
                  placeholder="OD15X7273"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('ownerName', 'मालिक का नाम')}</label>
                <input
                  type="text"
                  required
                  value={newVehOwner}
                  onChange={(e) => setNewVehOwner(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Ramesh Kumar Sahu' : 'उदा. रमेश कुमार साहु'}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('registeredMobileNumber', 'मोबाइल नंबर')}</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={newVehMobile}
                  onChange={(e) => setNewVehMobile(e.target.value)}
                  placeholder="9861012345"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('vehicleCategory', 'वाहन श्रेणी')}</label>
                <select
                  value={newVehCategory}
                  onChange={(e) => setNewVehCategory(e.target.value as VehicleCategory)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('capacityTonLabel', 'क्षमता टन')}</label>
                  <input
                    type="number"
                    value={newVehCapacity}
                    onChange={(e) => setNewVehCapacity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('serialNumber', 'क्रम संख्या')}</label>
                  <input
                    type="number"
                    value={newVehSerial}
                    onChange={(e) => setNewVehSerial(e.target.value)}
                    placeholder="Auto: max + 1"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddVehicleModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {t('saveToFleet', 'फ्लीट में जोड़ें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT VEHICLE MODAL */}
      {showEditVehicleModal && editingVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-rose-600" />
                वाहन विवरण संपादित करें
              </h3>
              <VehiclePlate number={editingVehicle.displayNumber} size="sm" />
            </div>

            <form onSubmit={handleEditVehicleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('ownerName', 'मालिक का नाम')}</label>
                <input
                  type="text"
                  value={editingVehicle.ownerName}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, ownerName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('mobileNumber', 'मोबाइल नंबर')}</label>
                <input
                  type="tel"
                  value={editingVehicle.ownerMobile}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, ownerMobile: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">{t('vehicleCategory', 'वाहन श्रेणी')}</label>
                <select
                  value={editingVehicle.category}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, category: e.target.value as VehicleCategory })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {VEHICLE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('capacity', 'क्षमता टन')}</label>
                  <input
                    type="number"
                    value={editingVehicle.capacityTon}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, capacityTon: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">{t('serialNumber', 'क्रम संख्या')}</label>
                  <input
                    type="number"
                    value={editingVehicle.serialNumber}
                    onChange={(e) => setEditingVehicle({ ...editingVehicle, serialNumber: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="blk_check"
                  checked={editingVehicle.isBlacklisted}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, isBlacklisted: e.target.checked })}
                  className="w-4 h-4 text-rose-600 rounded"
                />
                <label htmlFor="blk_check" className="text-slate-700 font-semibold cursor-pointer">
                  {t('blacklistVehicle', 'इस गाड़ी को ब्लैकलिस्ट करें')}
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditVehicleModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 cursor-pointer"
                >
                  {t('cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  {t('saveChanges', 'परिवर्तन सहेजें')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. NEW DAILY LOADING PROGRAM MODAL ("एडमिन रोजाना लोड पोस्ट कर सकें") */}
      {showNewProgramModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col h-[90dvh] sm:h-[86vh] max-h-[90dvh] sm:max-h-[86vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    दैनिक लोड पोस्ट करें (Post Daily Loading Program)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    नया स्लॉट जोड़ते ही तुरंत सभी गाड़ी मालिकों के ऐप पर लाइव हो जाएगा
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProgramModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="newProgForm"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target as any;
                const dSection = form.dateSection.value;
                const today = new Date().toISOString().slice(0, 10);
                const dLabel = dSection === 'TOMORROW' ? 'DT. TOMORROW' : `DT. ${today.slice(8, 10)}/${today.slice(5, 7)}/${today.slice(2, 4)}`;

                await fetch('/api/loading/programs', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    program: {
                      company: form.company.value,
                      companyCustomName: `${form.company.value} - ${form.destination.value.slice(0, 24)}`,
                      destination: form.destination.value,
                      cargo: form.cargo?.value || 'COIL / RI',
                      dateSection: dSection,
                      dateLabel: dLabel,
                      categoryRequired: form.category.value,
                      capacityTonRequired: Number(form.capacity.value || 18),
                      totalQuota: Number(form.quota.value),
                      ratePerTon: Number(form.rate.value),
                      advancePercentage: Number(form.advance.value),
                      pendingFreightAllowed: newProgType === 'PENDING' ? true : form.pendingFreight?.checked,
                      preferenceRule: form.remarks?.value || (newProgType === 'PREFERENCE' ? 'स्थानीय संबलपुर वरीयता' : undefined),
                      programType: newProgType,
                    },
                    actor: adminUser.name,
                    actorRole: adminUser.role,
                  }),
                });
                setShowNewProgramModal(false);
                showAdminToast('🎉 नया लोडिंग प्रोग्राम सफलतापूर्वक पोस्ट हुआ!', 'success');
                fetchData();
              }}
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              {/* Scrollable Form Body with touch scroll */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:px-6 space-y-3.5 text-xs">
                {/* Quick 1-Click Preset Chips */}
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    आधिकारिक स्क्रीनशॉट प्रीसेट्स (1-क्लिक ऑटो-फिल):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { plant: 'Hindalco Samelter', dest: 'BELUR 18MT (RI) [DT. 16/12/25]', cargo: 'RI', cap: 18, quota: 3, rate: 2200, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'MAUDA 18MT (COIL) [DT. 16/12/25]', cargo: 'COIL', cap: 18, quota: 4, rate: 2100, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'MAUDA 16MT (COIL) [DT. 16/12/25]', cargo: 'COIL', cap: 16, quota: 6, rate: 2100, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'BHIWANDI + TALOJA 18MT (2 POINT)', cargo: 'COIL/SHEET', cap: 18, quota: 1, rate: 2400, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'KANPUR 16MT (COIL/SHEET)', cargo: 'COIL/SHEET', cap: 16, quota: 1, rate: 2350, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'TALOJA 16MT (2 POINT)', cargo: 'COIL/SHEET', cap: 16, quota: 1, rate: 2400, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'BELUR 16MT (COIL)', cargo: 'COIL', cap: 16, quota: 4, rate: 2200, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'BANGALORE 16MT (2 POINT)', cargo: 'COIL/SHEET', cap: 16, quota: 1, rate: 2800, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: '12 WHEELER HOWRAH 25MT (COIL)', cargo: 'COIL', cap: 25, quota: 1, rate: 2500, cat: '12-Wheel / 18-26 Ton' },
                      { plant: 'Hindalco Samelter', dest: 'TOMORROW BELUR 18MT (RI/COIL)', cargo: 'RI/COIL', cap: 18, quota: 2, rate: 2200, cat: '10-Wheel / 16-18 Ton', dateSection: 'TOMORROW' },
                      { plant: 'Other', dest: 'TOMORROW TALOJA VIA RAIPUR 16MT', cargo: 'RI', cap: 16, quota: 4, rate: 2450, cat: '10-Wheel / 16-18 Ton', dateSection: 'TOMORROW' },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const form = document.getElementById('newProgForm') as any;
                          if (form) {
                            form.company.value = chip.plant;
                            form.destination.value = chip.dest;
                            form.cargo.value = chip.cargo;
                            form.quota.value = chip.quota;
                            form.capacity.value = chip.cap;
                            form.rate.value = chip.rate;
                            form.category.value = chip.cat;
                            if (chip.dateSection) form.dateSection.value = chip.dateSection;
                          }
                        }}
                        className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-2xs"
                      >
                        + {chip.dest.split(' [')[0].slice(0, 26)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date selection & 3 Pukar Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      लोडिंग दिवस (Loading Day):
                    </label>
                    <select
                      name="dateSection"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="TODAY">आज का लोड (TODAY LOADING)</option>
                      <option value="TOMORROW">कल का लोड (TOMORROW LOADING)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 font-bold mb-1">
                      पुकार प्रकार (Pukar Type):
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setNewProgType('GENERAL')}
                        className={`p-1.5 rounded-xl border text-center font-bold text-[10px] cursor-pointer ${
                          newProgType === 'GENERAL'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        🔵 सामान्य
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProgType('PENDING')}
                        className={`p-1.5 rounded-xl border text-center font-bold text-[10px] cursor-pointer ${
                          newProgType === 'PENDING'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        🟠 पेंडिंग
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewProgType('PREFERENCE')}
                        className={`p-1.5 rounded-xl border text-center font-bold text-[10px] cursor-pointer ${
                          newProgType === 'PREFERENCE'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        🟣 प्रिफरेंस
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">कंपनी / प्लांट (Plant Name):</label>
                  <select name="company" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold">
                    <option value="Hindalco Samelter">हिंडाल्को स्मेल्टर (Hindalco Samelter)</option>
                    <option value="Blue Fox">ब्लू फॉक्स एफआरपी (Blue Fox FRP)</option>
                    <option value="Aditya Birla Lapanga">आदित्य बिड़ला लापंगा (Lapanga)</option>
                    <option value="Vedanta Limited">वेदांता लिमिटेड (Vedanta Jharsuguda)</option>
                    <option value="Other">अन्य संयंत्र / 12-चक्का (Other Plant)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">गंतव्य स्थान (Destination):</label>
                  <input
                    name="destination"
                    required
                    placeholder="उदा. BELUR 18MT (RI) / BHIWANDI + TALOJA / MAUDA / KANPUR"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">माल प्रकार (Cargo):</label>
                    <input
                      name="cargo"
                      defaultValue="COIL / RI"
                      placeholder="उदा. COIL, SHEET, RI, 2 POINT"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">टन क्षमता (MT):</label>
                    <input
                      name="capacity"
                      type="number"
                      defaultValue="18"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">अनिवार्य वाहन श्रेणी:</label>
                  <select name="category" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium">
                    {VEHICLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">गाड़ी कोटा (Count):</label>
                    <input name="quota" type="number" defaultValue="4" min="1" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-center" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">दर ₹/टन (Rate):</label>
                    <input name="rate" type="number" defaultValue="2200" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-center" />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">अग्रिम % (Advance):</label>
                    <input name="advance" type="number" defaultValue="70" className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-center" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">कटिंग नियम / विशेष टिप्पणी (Remarks):</label>
                  <input
                    name="remarks"
                    placeholder="उदा. FIRST ROUND CUTTING / CHALLAN CHANGE AT RAIPUR / 2 POINT"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Fixed Sticky Footer pinned at bottom - 100% ALWAYS VISIBLE */}
              <div className="flex gap-2 p-3 sm:px-6 sm:py-3.5 border-t border-slate-200 shrink-0 bg-slate-50 sm:bg-white z-10">
                <button
                  type="button"
                  onClick={() => setShowNewProgramModal(false)}
                  className="flex-1 py-3 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl font-bold border border-slate-300 cursor-pointer text-xs"
                >
                  {t('cancel', 'रद्द करें')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl cursor-pointer shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('postDailyLoad', '➕ नया लोड पोस्ट करें')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: POST NEXT DAY / SHIFT LOADING PROGRAM */}
      {showPostNextDayModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-in fade-in overflow-hidden">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col h-[90dvh] sm:h-[86vh] max-h-[90dvh] sm:max-h-[86vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    अगले दिन / शिफ्ट का नया लोडिंग प्रोग्राम जोड़ें
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    सुबह 10:00 AM अथवा शाम 04:00 PM शिफ्ट के लिए निर्धारित लोड
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPostNextDayModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostNextDayProgram} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body with touch scroll */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:px-6 space-y-3.5 text-xs">
                {/* Tomorrow Quick Presets Chips */}
                <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    कल के आधिकारिक लोड प्रीसेट्स (TOMORROW LOADING):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { plant: 'Hindalco Samelter', dest: 'BELUR 18MT (02 VEHICLES RI/COIL)', cargo: 'RI/COIL', cap: 18, quota: 2, rate: 2200, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Other', dest: 'TALOJA VIA RAIPUR 16MT (04 VEHICLES RI)', cargo: 'RI', cap: 16, quota: 4, rate: 2450, cat: '10-Wheel / 16-18 Ton', rem: 'CHALLAN CHANGE WILL BE HELD AT RAIPUR' },
                      { plant: 'Blue Fox', dest: 'MAUDA 18MT (COIL) [TOMORROW]', cargo: 'COIL', cap: 18, quota: 4, rate: 2100, cat: '10-Wheel / 16-18 Ton' },
                      { plant: 'Blue Fox', dest: 'HOWRAH 25MT 12-WHEELER (COIL)', cargo: 'COIL', cap: 25, quota: 1, rate: 2500, cat: '12-Wheel / 18-26 Ton' },
                    ].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setNextDayForm({
                            ...nextDayForm,
                            company: chip.plant as any,
                            destination: chip.dest,
                            cargo: chip.cargo,
                            totalQuota: chip.quota,
                            capacityTonRequired: chip.cap,
                            ratePerTon: chip.rate,
                            categoryRequired: chip.cat as any,
                            preferenceRule: chip.rem || '15-टू-15 रोटेशन वरीयता',
                          });
                        }}
                        className="px-2 py-1 bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all shadow-2xs"
                      >
                        + {chip.dest.slice(0, 28)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Pukar Mode / Options */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1.5">
                    लोडिंग पुकार प्रकार चुनें (Select Pukar Type):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNextDayForm({ ...nextDayForm, programType: 'GENERAL', pendingFreightAllowed: false })
                      }
                      className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                        nextDayForm.programType === 'GENERAL'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black">🔵 सामान्य</span>
                      <span className="block text-[9px] font-normal text-slate-500">15-टू-15 आवर्तन</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNextDayForm({ ...nextDayForm, programType: 'PENDING', pendingFreightAllowed: true })
                      }
                      className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                        nextDayForm.programType === 'PENDING'
                          ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black">🟠 पेंडिंग</span>
                      <span className="block text-[9px] font-normal text-slate-500">पेंडिंग भाड़ा</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setNextDayForm({
                          ...nextDayForm,
                          programType: 'PREFERENCE',
                          preferenceRule: nextDayForm.preferenceRule || 'स्थानीय संबलपुर वरीयता',
                        })
                      }
                      className={`p-2.5 rounded-2xl border text-center font-bold transition-all cursor-pointer ${
                        nextDayForm.programType === 'PREFERENCE'
                          ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-black">🟣 प्रिफरेंस</span>
                      <span className="block text-[9px] font-normal text-slate-500">संबलपुर वरीयता</span>
                    </button>
                  </div>
                </div>

                {/* Plant selection */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">प्लांट / कंपनी का चयन करें:</label>
                  <select
                    value={nextDayForm.company}
                    onChange={(e) => setNextDayForm({ ...nextDayForm, company: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Hindalco Samelter">हिंडाल्को स्मेल्टर (Hindalco Samelter)</option>
                    <option value="Blue Fox">ब्लू फॉक्स एफआरपी (Blue Fox FRP)</option>
                    <option value="Aditya Birla Lapanga">आदित्य बिड़ला लापंगा (Lapanga)</option>
                    <option value="Vedanta Limited">वेदांता लिमिटेड (Vedanta Jharsuguda)</option>
                    <option value="Other">अन्य संयंत्र (Other Plant)</option>
                  </select>
                </div>

                {/* Destination & Cargo */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">गंतव्य स्थान एवं माल विवरण (Destination & Material):</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. Belur Coil 18MT / Bhiwandi / Raipur"
                    value={nextDayForm.destination}
                    onChange={(e) => setNextDayForm({ ...nextDayForm, destination: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Mandatory Vehicle Category */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">अनिवार्य वाहन श्रेणी (Vehicle Category):</label>
                  <select
                    value={nextDayForm.categoryRequired}
                    onChange={(e) => setNextDayForm({ ...nextDayForm, categoryRequired: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-indigo-500"
                  >
                    {VEHICLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Numbers Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">गाड़ी कोटा:</label>
                    <input
                      type="number"
                      min={1}
                      value={nextDayForm.totalQuota}
                      onChange={(e) => setNextDayForm({ ...nextDayForm, totalQuota: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">लोड टन क्षमता:</label>
                    <input
                      type="number"
                      min={1}
                      value={nextDayForm.capacityTonRequired}
                      onChange={(e) => setNextDayForm({ ...nextDayForm, capacityTonRequired: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">दर ₹/टन:</label>
                    <input
                      type="number"
                      min={100}
                      value={nextDayForm.ratePerTon}
                      onChange={(e) => setNextDayForm({ ...nextDayForm, ratePerTon: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-mono text-center font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Option to clear old previous day loads */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      पुराने / आज के लोड साफ करें (Clear Previous Loads)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      चेक करने पर आज के सभी पुराने लोड हट जाएंगे और कल का बिल्कुल नया शेड्यूल शुरू होगा।
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    id="clear_prev_check"
                    checked={clearPreviousOnNextDay}
                    onChange={(e) => setClearPreviousOnNextDay(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {/* Fixed Footer pinned at bottom - 100% ALWAYS VISIBLE */}
              <div className="p-3 sm:px-6 sm:py-3.5 border-t border-slate-200 flex gap-2 shrink-0 bg-slate-50 sm:bg-white z-10">
                <button
                  type="button"
                  onClick={() => setShowPostNextDayModal(false)}
                  className="flex-1 py-3 bg-slate-200/80 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer text-xs"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 text-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>➕ नया लोडिंग प्रोग्राम पोस्ट करें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vehicle Renewal & Cancellation History Modal */}
      {selectedVehicleForHistory && (
        <VehicleRenewalHistoryModal
          vehicle={selectedVehicleForHistory}
          onClose={() => setSelectedVehicleForHistory(null)}
          onRenewRequested={(v) => {
            setSelectedVehicleForHistory(null);
            setVehicleToRenew(v);
          }}
        />
      )}

      {/* Supreme Autonomous Admin AI Commander Agent Modal */}
      <AdminAiAgentModal
        isOpen={showAiCommander}
        onClose={() => setShowAiCommander(false)}
        onNavigateTab={(tab, filter, query) => {
          if (tab) setActiveTab(tab);
          if (filter) setFleetStatus(filter);
          if (query) setFleetSearch(query);
        }}
        onRefreshData={fetchData}
      />
    </div>
  );
};
