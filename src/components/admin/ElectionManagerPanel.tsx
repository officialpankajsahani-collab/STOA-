import React, { useState, useEffect, useMemo } from 'react';
import { useElection } from '../../context/ElectionContext.js';
import { ElectionStatus, Candidate, WinnerCelebration, VoterAuditEntry } from '../../types/election.js';
import {
  Vote,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  Award,
  Users,
  Clock,
  Sparkles,
  PartyPopper,
  Edit2,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
  Calendar,
  X,
  Send,
  Radio,
  Check,
  Flame,
  Truck,
  AlertTriangle,
  Search,
  Filter,
  Lock,
  FileText,
  Printer,
  History,
  UserCheck,
  UserX,
  Shield,
  Download,
} from 'lucide-react';
import { ElectionCelebrationModal } from '../common/ElectionCelebrationModal.js';

export interface ElectionManagerPanelProps {
  registeredVehicles?: any[];
}

export const ElectionManagerPanel: React.FC<ElectionManagerPanelProps> = ({ registeredVehicles }) => {
  const {
    election,
    updateStatus,
    updateCandidateVotes,
    addCandidate,
    removeCandidate,
    initiateElectionCycle,
    setCountdownTimer,
    toggleVotingActive,
    updateCelebration,
    toggleCelebration,
    declareWinnersAutomatically,
    resetElectionData,
    getAvailableCycles,
    getCycleVoterAuditRoll,
    hasOwnerVoted,
  } = useElection();

  const { celebration } = election;

  // Fleet vehicles state for building unique owner roster
  const [fleetVehicles, setFleetVehicles] = useState<any[]>(registeredVehicles || []);

  useEffect(() => {
    if (registeredVehicles && registeredVehicles.length > 0) {
      setFleetVehicles(registeredVehicles);
      return;
    }
    // Fetch from backend /api/fleet if not passed or empty
    fetch('/api/fleet')
      .then((res) => res.json())
      .then((data) => {
        if (data?.vehicles && Array.isArray(data.vehicles)) {
          setFleetVehicles(data.vehicles);
        }
      })
      .catch((err) => console.error('Failed to load fleet vehicles for election roster:', err));
  }, [registeredVehicles]);

  // Selected Election Cycle for Independent Isolated Tracking
  const availableCycles = getAvailableCycles();
  const [selectedCycleId, setSelectedCycleId] = useState<string>(election.id || 'STOA-ELEC-2026');

  // Sync selected cycle if election id changes
  useEffect(() => {
    if (election.id && !availableCycles.some((c) => c.id === selectedCycleId)) {
      setSelectedCycleId(election.id);
    }
  }, [election.id, availableCycles, selectedCycleId]);

  // Search and status filter for Voter Tracking System
  const [trackerSearch, setTrackerSearch] = useState<string>('');
  const [trackerStatusFilter, setTrackerStatusFilter] = useState<'all' | 'voted' | 'pending'>('all');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Modals state
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showBroadcastWinnerModal, setShowBroadcastWinnerModal] = useState(false);
  const [showCelebrationPreview, setShowCelebrationPreview] = useState(false);

  // Selected post filter for candidate list
  const [selectedPostFilter, setSelectedPostFilter] = useState<string>('all');

  // Initiate Cycle Form State
  const [initiateForm, setInitiateForm] = useState({
    title: election.title || 'संबलपुर ट्रक ओनर्स एसोसिएशन द्विवार्षिक चुनाव',
    term: election.term || '2026 - 2028 (द्विवार्षिक चुनाव)',
    startDate: election.startDate || new Date().toISOString().slice(0, 16),
    endDate: election.endDate || new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
    totalVotersRegistered: election.totalVotersRegistered || 420,
    resetVotes: true,
  });

  // Add Candidate Form State
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    postId: election.posts[0]?.id || 'pres',
    panel: 'एकता परिवहन मोर्चा',
    symbol: '🚚',
    truckNumber: '',
    votes: 0,
  });

  // Broadcast Winner Form State
  const [broadcastForm, setBroadcastForm] = useState<WinnerCelebration>({
    isActive: true,
    winningPanel: celebration.winningPanel || 'एकता परिवहन मोर्चा',
    chiefWinnerName: celebration.chiefWinnerName || 'सरदार सुरिंदर सिंह (अध्यक्ष) एवं पंकज साहनी (महासचिव)',
    chiefWinnerPost: celebration.chiefWinnerPost || 'समस्त विजयी कार्यकारिणी (2026-2028)',
    winnerMessage:
      celebration.winnerMessage ||
      'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2026–2028 में प्रचंड बहुमत से विजयी होने पर समस्त पदाधिकारियों को हार्दिक बधाई एवं शुभकामनाएं!',
    winnerSubMessage:
      celebration.winnerSubMessage ||
      'एसोसिएशन के समस्त सम्मानित ट्रक मालिकों के अटूट विश्वास, निष्पक्ष मतदान और ऐतिहासिक समर्थन के लिए कोटि-कोटि धन्यवाद!',
    declaredBy: 'मुख्य चुनाव अधिकारी, STOA संबलपुर',
    declaredAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    durationHours: celebration.durationHours || 24,
  });

  // Live countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Update live countdown
  useEffect(() => {
    const calculateTime = () => {
      if (!election.endDate) return;
      const target = new Date(election.endDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [election.endDate]);

  // Turnout percentage
  const turnoutPercent = election.totalVotersRegistered > 0
    ? Math.round((election.totalVotesCast / election.totalVotersRegistered) * 100)
    : 0;

  // Structure representing unique owner in STOA Association (1 Owner = 1 Vote across 1 or 10 trucks)
  interface UniqueOwnerItem {
    id: string;
    ownerName: string;
    ownerMobile: string;
    membershipNumber: string;
    vehicles: string[];
    hasVoted: boolean;
    auditEntry?: VoterAuditEntry;
  }

  // Build Unique Owners List for Selected Election Cycle (1 Owner = 1 Vote)
  const uniqueOwnersList = useMemo<UniqueOwnerItem[]>(() => {
    const ownerMap: { [key: string]: UniqueOwnerItem } = {};

    // 1. Process Fleet Vehicles: Group by owner's mobile, membership, or name
    (fleetVehicles || []).forEach((v: any, index: number) => {
      const cleanMobile = (v.ownerMobile || '').replace(/\D/g, '').slice(-10);
      const cleanMem = (v.membershipNumber || '').trim().toUpperCase();
      const cleanName = (v.ownerName || '').trim();
      const key = cleanMobile || cleanMem || cleanName.toLowerCase() || `veh-${index}`;

      const dispVeh = v.displayNumber || v.normalizedNumber || v.vehicleNumber || 'OD 15 X';

      if (!ownerMap[key]) {
        ownerMap[key] = {
          id: `owner-${key}`,
          ownerName: v.ownerName || 'पंजीकृत ट्रक मालिक',
          ownerMobile: cleanMobile || v.ownerMobile || '—',
          membershipNumber: v.membershipNumber || 'STOA-MEM',
          vehicles: [dispVeh],
          hasVoted: false,
        };
      } else {
        if (!ownerMap[key].vehicles.includes(dispVeh)) {
          ownerMap[key].vehicles.push(dispVeh);
        }
      }
    });

    // 2. Fetch specific cycle's isolated audit roll
    const cycleRoll = getCycleVoterAuditRoll(selectedCycleId) || [];

    // Also include any audit roll entries from this specific cycle if not already in fleet
    cycleRoll.forEach((audit) => {
      const cleanMobile = (audit.mobile || '').replace(/\D/g, '').slice(-10);
      const cleanMem = (audit.membershipNumber || '').trim().toUpperCase();
      const cleanName = (audit.voterName || '').trim();
      const key = cleanMobile || cleanMem || cleanName.toLowerCase();

      if (key && !ownerMap[key]) {
        ownerMap[key] = {
          id: `owner-${audit.id}`,
          ownerName: audit.voterName || 'पंजीकृत ट्रक मालिक',
          ownerMobile: audit.mobile || '—',
          membershipNumber: audit.membershipNumber || 'STOA-MEM',
          vehicles: audit.vehicleNumber ? [audit.vehicleNumber] : [],
          hasVoted: true,
          auditEntry: audit,
        };
      }
    });

    // 3. Evaluate voting status for the selected cycle
    const isCurrentActiveCycle = selectedCycleId === (election.id || 'STOA-ELEC-2026');

    return Object.values(ownerMap).map((owner) => {
      // Look for audit entry strictly in this cycle
      const matchingAudit = cycleRoll.find((a) => {
        const aMobile = (a.mobile || '').replace(/\D/g, '').slice(-10);
        const aMem = (a.membershipNumber || '').trim().toUpperCase();
        const aName = (a.voterName || '').trim().toLowerCase();
        const aVeh = (a.vehicleNumber || '').replace(/\s+/g, '').toUpperCase();

        const oMobile = owner.ownerMobile.replace(/\D/g, '').slice(-10);
        const oMem = owner.membershipNumber.trim().toUpperCase();
        const oName = owner.ownerName.trim().toLowerCase();

        return (
          (aMobile && aMobile === oMobile) ||
          (aMem && aMem === oMem) ||
          (aName && aName === oName) ||
          owner.vehicles.some((v) => v.replace(/\s+/g, '').toUpperCase() === aVeh)
        );
      });

      let voted = false;
      let audit = matchingAudit;

      if (matchingAudit) {
        voted = true;
      } else if (isCurrentActiveCycle) {
        // If current active cycle, also check live state in election context
        const cleanMobile = owner.ownerMobile.replace(/\D/g, '').slice(-10);
        const cleanMem = owner.membershipNumber.trim().toUpperCase();
        const cleanName = owner.ownerName.trim();
        const firstVeh = owner.vehicles[0] || '';

        if (hasOwnerVoted(cleanMobile, cleanMem, cleanName, firstVeh)) {
          voted = true;
          audit = {
            id: `audit-${owner.id}`,
            cycleId: selectedCycleId,
            voterName: owner.ownerName,
            vehicleNumber: owner.vehicles.join(', '),
            membershipNumber: owner.membershipNumber,
            mobile: owner.ownerMobile,
            votedAt: new Date().toISOString(),
            trackingToken: `STOA-TRK-${owner.ownerMobile.slice(-4)}-VERIFIED`,
          };
        }
      }

      return {
        ...owner,
        hasVoted: voted,
        auditEntry: audit,
      };
    });
  }, [
    fleetVehicles,
    selectedCycleId,
    election.cycleVoterRolls,
    election.votedMobiles,
    election.votedVehicles,
    election.votedMemberships,
    election.votedOwners,
    election.id,
    getCycleVoterAuditRoll,
    hasOwnerVoted,
  ]);

  // Filtered owners list based on search and status
  const filteredOwnerVoters = useMemo(() => {
    let list = uniqueOwnersList;

    if (trackerStatusFilter === 'voted') {
      list = list.filter((o) => o.hasVoted);
    } else if (trackerStatusFilter === 'pending') {
      list = list.filter((o) => !o.hasVoted);
    }

    if (trackerSearch.trim()) {
      const q = trackerSearch.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.ownerName.toLowerCase().includes(q) ||
          o.ownerMobile.toLowerCase().includes(q) ||
          o.membershipNumber.toLowerCase().includes(q) ||
          o.vehicles.some((v) => v.toLowerCase().includes(q)) ||
          (o.auditEntry?.trackingToken && o.auditEntry.trackingToken.toLowerCase().includes(q))
      );
    }

    return list;
  }, [uniqueOwnersList, trackerStatusFilter, trackerSearch]);

  const totalRegisteredCount = uniqueOwnersList.length;
  const votedCount = uniqueOwnersList.filter((o) => o.hasVoted).length;
  const pendingCount = Math.max(0, totalRegisteredCount - votedCount);
  const liveTurnoutPct = totalRegisteredCount > 0 ? Math.round((votedCount / totalRegisteredCount) * 100) : 0;

  // Handle Quick Countdown Additions
  const addHoursToCountdown = (hours: number) => {
    const newEnd = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
    setCountdownTimer(newEnd);
    showToast(`काउंटडाउन टाइमर में ${hours} घंटे जोड़े गए!`, 'success');
  };

  // Handle Add Candidate Submit
  const handleAddCandidateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.name.trim()) {
      showToast('कृपया उम्मीदवार का नाम दर्ज करें', 'warn');
      return;
    }

    addCandidate({
      name: candidateForm.name.trim(),
      postId: candidateForm.postId,
      panel: candidateForm.panel.trim(),
      symbol: candidateForm.symbol,
      truckNumber: candidateForm.truckNumber.trim() || undefined,
      votes: Number(candidateForm.votes) || 0,
    });

    showToast(`उम्मीदवार ${candidateForm.name} सफलतापूर्वक जोड़ा गया!`, 'success');
    setCandidateForm({
      name: '',
      postId: election.posts[0]?.id || 'pres',
      panel: 'एकता परिवहन मोर्चा',
      symbol: '🚚',
      truckNumber: '',
      votes: 0,
    });
    setShowAddCandidateModal(false);
  };

  // Handle Initiate Cycle Submit
  const handleInitiateCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initiateElectionCycle({
      title: initiateForm.title,
      term: initiateForm.term,
      startDate: initiateForm.startDate,
      endDate: initiateForm.endDate,
      totalVotersRegistered: Number(initiateForm.totalVotersRegistered),
      resetVotes: initiateForm.resetVotes,
    });
    showToast('नया चुनाव सत्र सफलतापूर्वक प्रारंभ किया गया!', 'success');
    setShowInitiateModal(false);
  };

  // Auto-fill Broadcast Winner modal based on actual tally
  const autoFillWinnersFromTally = () => {
    // Determine winner for each post
    const winnersByPost: { [postId: string]: Candidate } = {};
    for (const post of election.posts) {
      const cands = election.candidates.filter((c) => c.postId === post.id);
      if (cands.length > 0) {
        const top = cands.reduce((max, c) => (c.votes > max.votes ? c : max), cands[0]);
        winnersByPost[post.id] = top;
      }
    }

    const pres = winnersByPost['pres'];
    const sec = winnersByPost['sec'];

    // Count panel wins
    const panelWins: { [p: string]: number } = {};
    Object.values(winnersByPost).forEach((w) => {
      panelWins[w.panel] = (panelWins[w.panel] || 0) + 1;
    });

    let topPanel = election.panels[0]?.name || 'एकता परिवहन मोर्चा';
    let maxWins = 0;
    for (const [panel, count] of Object.entries(panelWins)) {
      if (count > maxWins) {
        maxWins = count;
        topPanel = panel;
      }
    }

    setBroadcastForm((prev) => ({
      ...prev,
      winningPanel: topPanel,
      chiefWinnerName: `${pres?.name || 'अध्यक्ष'} (अध्यक्ष) एवं ${sec?.name || 'महासचिव'} (महासचिव)`,
      chiefWinnerPost: 'समस्त विजयी कार्यकारिणी (2026-2028)',
      winnerMessage: `संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) द्विवार्षिक चुनाव 2026–2028 में '${topPanel}' को ऐतिहासिक जनादेश और प्रचंड बहुमत से विजयी बनाने पर समस्त नवनिर्वाचित पदाधिकारियों को हार्दिक बधाई एवं शुभकामनाएं!`,
    }));

    showToast('वर्तमान मतगणना के आधार पर विजेता जानकारी स्वचालित भर दी गई', 'info');
  };

  // Handle Broadcast Winner Submit
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Number(broadcastForm.durationHours) || 24;

    updateCelebration({
      ...broadcastForm,
      isActive: true,
      declaredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
    });

    updateStatus('RESULTS_DECLARED');
    showToast('🏆 बधाई संदेश सभी वाहन मालिकों के मोबाइल पर सफलतापूर्वक ब्रॉडकास्ट कर दिया गया!', 'success');
    setShowBroadcastWinnerModal(false);
  };

  const isVotingActive = election.status === 'VOTING_ACTIVE';

  // Filtered candidate list
  const filteredCandidates = selectedPostFilter === 'all'
    ? election.candidates
    : election.candidates.filter((c) => c.postId === selectedPostFilter);

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* 1. TOP HEADER & PRIMARY ACTION BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 font-display leading-tight">
                एसोसिएशन चुनाव नियंत्रण कक्ष (STOA Election Manager)
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                {election.title} • {election.term}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Voting Toggle, Initiate Cycle & Broadcast Winner */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Voting Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              toggleVotingActive();
              showToast(
                isVotingActive
                  ? '🛑 मतदान बंद कर दिया गया (Voting Deactivated)'
                  : '🟢 मतदान चालू कर दिया गया (Voting Activated Live)'
              );
            }}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 ${
              isVotingActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isVotingActive ? 'bg-white animate-ping' : 'bg-slate-500'
              }`}
            />
            <span>{isVotingActive ? 'मतदान सक्रिय है (Active)' : 'मतदान बंद है (Turn On)'}</span>
          </button>

          {/* Initiate Election Cycle Button */}
          <button
            type="button"
            onClick={() => setShowInitiateModal(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
            <span>नया चुनाव चक्र शुरू करें</span>
          </button>

          {/* Broadcast Winner Modal Trigger */}
          <button
            type="button"
            onClick={() => {
              autoFillWinnersFromTally();
              setShowBroadcastWinnerModal(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <PartyPopper className="w-4 h-4 text-slate-950" />
            <span>विजेता बधाई ब्रॉडकास्ट करें</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : toast.type === 'warn'
              ? 'bg-rose-50 border border-rose-300 text-rose-800'
              : 'bg-blue-50 border border-blue-300 text-blue-800'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Security Lock Banner: Admin cannot edit votes & 1 vehicle = 1 vote strictly enforced */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 text-white rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-white">
                🔒 अपरिवर्तनीय डिजिटल मतदान सुरक्षा (Tamper-Proof Voting Audit)
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono font-bold">
                सुरक्षित
              </span>
            </div>
            <p className="text-xs text-indigo-200/90 mt-0.5">
              1 गाड़ी नंबर = केवल 1 वोट मान्य है। एडमिन द्वारा मतों में कोई मैनुअल छेड़छाड़ या बदलाव संभव नहीं है।
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-900/50 px-3 py-1.5 rounded-2xl border border-indigo-500/30 text-[11px] font-mono shrink-0">
          <span className="text-indigo-300">कुल पंजीकृत मत:</span>
          <span className="text-amber-300 font-bold">{election.totalVotesCast}</span>
        </div>
      </div>

      {/* 2. COUNTDOWN TIMER & VOTING STATUS CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                मतदान काउंटडाउन टाइमर (Voting Countdown Timer)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                समय सीमा: {new Date(election.endDate).toLocaleString('hi-IN')}
              </p>
            </div>
          </div>

          {/* Quick Timer Extension Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">
              त्वरित समय जोड़ें:
            </span>
            {[
              { label: '+2 घंटे', hours: 2 },
              { label: '+6 घंटे', hours: 6 },
              { label: '+12 घंटे', hours: 12 },
              { label: '+24 घंटे', hours: 24 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => addHoursToCountdown(preset.hours)}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Ticker Boxes & Custom Deadline Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          {/* Digital Timer Counter */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 sm:p-4 rounded-2xl shadow-inner">
            <div className="flex-1 text-center bg-white/10 rounded-xl py-2 px-1">
              <span className="font-mono font-black text-lg sm:text-2xl text-emerald-400 block leading-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-300">दिन (Days)</span>
            </div>
            <span className="font-mono text-lg font-bold text-slate-500">:</span>
            <div className="flex-1 text-center bg-white/10 rounded-xl py-2 px-1">
              <span className="font-mono font-black text-lg sm:text-2xl text-emerald-400 block leading-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-300">घंटे (Hrs)</span>
            </div>
            <span className="font-mono text-lg font-bold text-slate-500">:</span>
            <div className="flex-1 text-center bg-white/10 rounded-xl py-2 px-1">
              <span className="font-mono font-black text-lg sm:text-2xl text-emerald-400 block leading-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-300">मिनट (Min)</span>
            </div>
            <span className="font-mono text-lg font-bold text-slate-500">:</span>
            <div className="flex-1 text-center bg-white/10 rounded-xl py-2 px-1">
              <span className="font-mono font-black text-lg sm:text-2xl text-rose-400 block leading-tight animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-300">सेकंड (Sec)</span>
            </div>
          </div>

          {/* Custom Date/Time Deadline Setter */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                कस्टम समाप्ति तिथि व समय चुनें:
              </label>
              <input
                type="datetime-local"
                value={new Date(election.endDate).toISOString().slice(0, 16)}
                onChange={(e) => {
                  if (e.target.value) {
                    setCountdownTimer(new Date(e.target.value).toISOString());
                    showToast('मतदान समाप्ति समय अपडेट किया गया!', 'info');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ELECTION LIFECYCLE STAGES (4 चरण) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              चुनाव संचालन चक्र (Election Lifecycle Stage Switcher)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">1-क्लिक से कभी भी स्थिति बदलें</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Stage 1: Upcoming */}
          <button
            type="button"
            onClick={() => {
              updateStatus('UPCOMING');
              showToast('चुनाव स्थिति: नामांकन व प्रचार चरण में सेट की गई');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              election.status === 'UPCOMING'
                ? 'bg-blue-50 border-blue-500 shadow-xs ring-1 ring-blue-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 block">चरण 1</span>
            <span className="font-bold text-slate-900 block mt-0.5">📢 नामांकन व प्रचार</span>
            <span className="text-[10px] text-slate-500 block">वोटिंग अभी शुरू नहीं</span>
          </button>

          {/* Stage 2: Voting Active */}
          <button
            type="button"
            onClick={() => {
              updateStatus('VOTING_ACTIVE');
              showToast('मतदान चालू कर दिया गया है! सभी ट्रक मालिक अब ऑनलाइन वोट कर सकते हैं।');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              election.status === 'VOTING_ACTIVE'
                ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-mono text-emerald-600 font-bold block">चरण 2 (सक्रिय)</span>
            <span className="font-bold text-slate-900 block mt-0.5">🗳️ मतदान चालू करें</span>
            <span className="text-[10px] text-emerald-700 block">मालिकों के लिए वोटिंग ओपन</span>
          </button>

          {/* Stage 3: Voting Closed */}
          <button
            type="button"
            onClick={() => {
              updateStatus('VOTING_CLOSED');
              showToast('मतदान बंद कर दिया गया। अब कोई नया मत नहीं डल सकेगा।');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              election.status === 'VOTING_CLOSED'
                ? 'bg-amber-50 border-amber-500 shadow-xs ring-1 ring-amber-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-500 block">चरण 3</span>
            <span className="font-bold text-slate-900 block mt-0.5">🛑 मतदान बंद करें</span>
            <span className="text-[10px] text-slate-500 block">वोटिंग समाप्त, गणना जारी</span>
          </button>

          {/* Stage 4: Results Declared */}
          <button
            type="button"
            onClick={() => {
              declareWinnersAutomatically();
              showToast('परिणाम घोषित कर दिए गए और बधाई पॉपअप सभी मालिकों के लिए सक्रिय हो गया!');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              election.status === 'RESULTS_DECLARED'
                ? 'bg-purple-50 border-purple-500 shadow-xs ring-1 ring-purple-500'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[10px] font-mono text-purple-600 font-bold block">चरण 4 (अंतिम)</span>
            <span className="font-bold text-slate-900 block mt-0.5">🏆 परिणाम घोषित करें</span>
            <span className="text-[10px] text-purple-700 block">विजेताओं की घोषणा व बधाई</span>
          </button>
        </div>
      </div>

      {/* 4. CANDIDATE MANAGEMENT (उम्मीदवार जोड़ें / हटाएं) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              उम्मीदवार प्रबंधन (Add / Remove Candidates)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक पद के लिए प्रत्याशी जोड़ें, हटाएं या संपादित करें
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCandidateModal(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>नया उम्मीदवार जोड़ें</span>
          </button>
        </div>

        {/* Post Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedPostFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedPostFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            सभी पद ({(election.candidates || []).length})
          </button>
          {(election.posts || []).map((post) => {
            const count = (election.candidates || []).filter((c) => c.postId === post.id).length;
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPostFilter(post.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedPostFilter === post.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {post.nameHi} ({count})
              </button>
            );
          })}
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {filteredCandidates.map((cand) => {
            const postObj = election.posts.find((p) => p.id === cand.postId);
            return (
              <div
                key={cand.id}
                className={`p-3.5 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                  cand.isWinner ? 'border-amber-400 shadow-sm' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1 bg-slate-50 rounded-xl border border-slate-100">
                        {cand.symbol}
                      </span>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">
                          {cand.name}
                        </span>
                        <span className="text-[10px] text-rose-600 font-semibold block">
                          {postObj?.nameHi || cand.postId}
                        </span>
                      </div>
                    </div>

                    {/* Delete candidate button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`क्या आप उम्मीदवार '${cand.name}' को हटाना चाहते हैं?`)) {
                          removeCandidate(cand.id);
                          showToast(`उम्मीदवार '${cand.name}' हटाया गया`, 'info');
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="उम्मीदवार हटाएं"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-2.5 text-[11px] space-y-1 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">पार्टी/पैनल:</span>
                      <span className="font-medium text-slate-800">{cand.panel}</span>
                    </div>
                    {cand.truckNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">गाड़ी:</span>
                        <span className="font-mono font-bold text-slate-800">{cand.truckNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">सत्यापित मत:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg font-mono font-black text-sm text-slate-900 shadow-2xs">
                      {cand.votes}
                    </span>
                    {cand.isWinner && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black border border-amber-300">
                        🏆 विजेता
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. LIVE VOTING TALLY & STATS */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              लाइव वोटों की गिनती एवं प्रतिशत (Live Vote Counting & Turnout)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              सत्यापित मतपत्रों के आधार पर प्रत्येक पद का लाइव विश्लेषण
            </p>
          </div>

          {/* Tally Stats Pills */}
          <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">कुल पंजीकृत मालिक</span>
              <span className="font-mono font-bold text-slate-900">{election.totalVotersRegistered}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block">कुल पड़े मत</span>
              <span className="font-mono font-bold text-rose-700">{election.totalVotesCast}</span>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div>
              <span className="text-[10px] text-slate-500 block">टर्नआउट</span>
              <span className="font-mono font-bold text-emerald-700">{turnoutPercent}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown by Post */}
        <div className="space-y-4">
          {(election.posts || []).map((post) => {
            const candidatesForPost = (election.candidates || []).filter((c) => c.postId === post.id);
            const totalPostVotes = candidatesForPost.reduce((acc, c) => acc + c.votes, 0);

            return (
              <div key={post.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black text-slate-900 font-display">
                    {post.nameHi} ({post.nameEn})
                  </span>
                  <span className="text-[11px] font-mono text-slate-600 font-bold">
                    कुल मत: {totalPostVotes}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidatesForPost.map((cand) => {
                    const pct = totalPostVotes > 0 ? Math.round((cand.votes / totalPostVotes) * 100) : 0;

                    return (
                      <div
                        key={cand.id}
                        className={`p-3 rounded-xl border bg-white space-y-2 ${
                          cand.isWinner ? 'border-amber-400 shadow-xs' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cand.symbol}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {cand.name}
                                {cand.isWinner && (
                                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-md text-[9px] font-black">
                                    विजेता 🏆
                                  </span>
                                )}
                              </p>
                              <span className="text-[10px] text-slate-500 block">{cand.panel}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-black text-sm text-slate-900 block">
                              {cand.votes} वोट
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono font-semibold">
                              {pct}%
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              cand.isWinner
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. VOTER TRACKING SYSTEM & REAL-TIME AUDIT LEDGER (वोटर ट्रैकिंग सिस्टम) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                वोटर ट्रैकिंग सिस्टम एवं मतदान उपस्थिति लेजर (Live Voter Tracking System)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              प्रत्येक चुनाव सत्र का स्वतंत्र डेटा • 1 मालिक = 1 वोट नियम • 100% गोपनीय गुप्त मतदान
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="मतदाता उपस्थिति पत्रक प्रिंट करें"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>ऑडिट पत्रक प्रिंट करें</span>
            </button>
          </div>
        </div>

        {/* Multi-Year Independent Cycle Selector Switcher */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>चुनाव सत्र चुनें (Independent Cycle Archive):</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              🔒 सत्र पृथक्करण: प्रत्येक वर्ष का ट्रैकिंग डेटा पूरी तरह अलग व सुरक्षित है
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {availableCycles.map((cycle) => {
              const isSelected = selectedCycleId === cycle.id;
              const isActiveElection = cycle.id === (election.id || 'STOA-ELEC-2026');

              return (
                <button
                  key={cycle.id}
                  type="button"
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActiveElection ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span>{cycle.term || cycle.title}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                      isSelected
                        ? 'bg-indigo-700 text-indigo-100'
                        : isActiveElection
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isActiveElection ? 'सक्रिय (Live)' : 'अभिलेख'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 100% Confidential Secret Ballot Notice Card */}
        <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-emerald-900 font-bold">
              🔒 शत-प्रतिशत गोपनीय गुप्त मतदान (100% Confidential Secret Ballot Protocol)
            </strong>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              एडमिन अथवा किसी भी अधिकारी को कभी पता नहीं चलेगा कि किस मालिक ने किस पार्टी या किस उम्मीदवार को वोट दिया है।
              प्रणाली में केवल यह रिकॉर्ड सुरक्षित होता है कि किस मालिक ने वोट दिया है और किसका पेंडिंग है।
              जैसे ही कोई पेंडिंग मालिक वोट देगा, वह तुरंत <strong>'मतदान संपन्न'</strong> में दर्ज हो जाएगा।
            </p>
          </div>
        </div>

        {/* 4 Live Turnout KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            <span className="text-[10px] text-slate-500 block">कुल पंजीकृत मालिक</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-lg text-slate-900">{totalRegisteredCount}</span>
              <span className="text-[10px] text-slate-400">मालिक</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">1 मालिक = 1 वोट नियम</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-emerald-600" />
              <span>मतदान संपन्न (Voted)</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-lg text-emerald-800">{votedCount}</span>
              <span className="text-[10px] text-emerald-600">दर्ज</span>
            </div>
            <span className="text-[9px] text-emerald-700 font-mono block mt-0.5">सत्यापित डिजिटल पावती</span>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
              <UserX className="w-3 h-3 text-amber-600" />
              <span>पेंडिंग मतदाता (Pending)</span>
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-lg text-amber-800">{pendingCount}</span>
              <span className="text-[10px] text-amber-600">शेष</span>
            </div>
            <span className="text-[9px] text-amber-700 font-mono block mt-0.5">वोटिंग की प्रतीक्षा में</span>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
            <span className="text-[10px] text-indigo-700 font-bold block">मतदान टर्नआउट (%)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono font-black text-lg text-indigo-800">{liveTurnoutPct}%</span>
              <span className="text-[10px] text-indigo-600">टर्नआउट</span>
            </div>
            {/* Turnout mini progress */}
            <div className="w-full h-1.5 bg-indigo-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, liveTurnoutPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Pills & Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setTrackerStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                trackerStatusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              सभी मतदाता ({totalRegisteredCount})
            </button>
            <button
              type="button"
              onClick={() => setTrackerStatusFilter('voted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                trackerStatusFilter === 'voted'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>मतदान संपन्न ({votedCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setTrackerStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                trackerStatusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>पेंडिंग मतदाता ({pendingCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="मालिक, गाड़ी, मोबाइल या सदस्यता खोजें..."
              value={trackerSearch}
              onChange={(e) => setTrackerSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600"
            />
            {trackerSearch && (
              <button
                type="button"
                onClick={() => setTrackerSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Live Roster of Owners Table / Cards */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {filteredOwnerVoters.length === 0 ? (
            <div className="p-8 text-center bg-slate-50/50">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">कोई मतदाता रिकॉर्ड नहीं मिला</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                खोज फ़िल्टर बदलें या पंजीकृत बेड़े की जाँच करें
              </p>
            </div>
          ) : (
            filteredOwnerVoters.map((owner, idx) => {
              const initials = owner.ownerName
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'TR';

              return (
                <div
                  key={owner.id || idx}
                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    owner.hasVoted ? 'bg-white hover:bg-emerald-50/30' : 'bg-amber-50/20 hover:bg-amber-50/50'
                  }`}
                >
                  {/* Left: Avatar & Owner Details */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        owner.hasVoted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {initials}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">{owner.ownerName}</span>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                          सदस्यता: {owner.membershipNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        <span className="font-mono text-slate-700">📱 {owner.ownerMobile}</span>
                        <span>•</span>
                        {/* Associated Vehicles Display */}
                        <div className="flex items-center gap-1 flex-wrap">
                          <Truck className="w-3 h-3 text-slate-400" />
                          {owner.vehicles.map((veh, vIdx) => (
                            <span
                              key={vIdx}
                              className="font-mono font-semibold bg-slate-100 text-slate-800 px-1.5 py-0.2 rounded text-[10px]"
                            >
                              {veh}
                            </span>
                          ))}
                          {owner.vehicles.length > 1 && (
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 py-0.2 rounded">
                              {owner.vehicles.length} गाड़ियां (1 वोट)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Voting Status & Secret Ballot Seal */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0">
                    {owner.hasVoted ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>मतदान संपन्न (VOTED)</span>
                          </span>
                        </div>
                        <div className="text-left sm:text-right space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-mono block">
                            समय: {owner.auditEntry?.votedAt ? new Date(owner.auditEntry.votedAt).toLocaleString('hi-IN') : 'सत्यापित'}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block">
                            टोकन: {owner.auditEntry?.trackingToken || 'STOA-TRK-VERIFIED'}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-0.5 sm:justify-end">
                            <Lock className="w-2.5 h-2.5" /> गुप्त मतदान (पसंद सुरक्षित)
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            <span>पेंडिंग मतदाता (PENDING)</span>
                          </span>
                        </div>
                        <div className="text-left sm:text-right space-y-0.5">
                          <span className="text-[10px] text-amber-700 font-semibold block">
                            मतदान की प्रतीक्षा में
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            वोट देते ही यहाँ स्वतः 'मतदान संपन्न' दिखेगा
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 7. IMMUTABLE ELECTION AUDIT CERTIFICATION & SECURITY PROTOCOL */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>अपरिवर्तनीय डिजिटल मतदान सुरक्षा (Immutable Secret Ballot Protocol)</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                AUDIT LOCKED
              </span>
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              कुल {votedCount} सत्यापित मतदान संपन्न एवं {pendingCount} पेंडिंग मालिकों की डिजिटल पावती सुरक्षित रूप से सील हैं। एक मालिक के नाम पर चाहें 1 गाड़ी हो या 10 गाड़ियां, केवल 1 ही वोट मान्य है।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs shrink-0 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700">1 मालिक = 1 मत लॉक</span>
        </div>
      </div>

      {/* PRINT ATTENDANCE SHEET MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    एसोसिएशन आधिकारिक मतदाता उपस्थिति पत्रक (Official Voter Roll)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    सत्र: {availableCycles.find((c) => c.id === selectedCycleId)?.term || election.term} • STOA संबलपुर
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-500 block">कुल पंजीकृत मालिक:</span>
                <span className="font-bold font-mono text-slate-900">{totalRegisteredCount}</span>
              </div>
              <div>
                <span className="text-emerald-700 block font-bold">मतदान संपन्न:</span>
                <span className="font-bold font-mono text-emerald-800">{votedCount}</span>
              </div>
              <div>
                <span className="text-amber-700 block font-bold">पेंडिंग:</span>
                <span className="font-bold font-mono text-amber-800">{pendingCount}</span>
              </div>
              <div>
                <span className="text-indigo-700 block font-bold">टर्नआउट:</span>
                <span className="font-bold font-mono text-indigo-800">{liveTurnoutPct}%</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">क्र.</th>
                    <th className="p-2">मालिक का नाम</th>
                    <th className="p-2">गाड़ी(यां)</th>
                    <th className="p-2">स्थिति</th>
                    <th className="p-2">डिजिटल ट्रैकिंग टोकन</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {uniqueOwnersList.map((owner, i) => (
                    <tr key={owner.id} className={owner.hasVoted ? 'bg-white' : 'bg-amber-50/30'}>
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-sans font-bold text-slate-900">{owner.ownerName}</td>
                      <td className="p-2">{owner.vehicles.join(', ')}</td>
                      <td className="p-2 font-sans font-bold">
                        {owner.hasVoted ? (
                          <span className="text-emerald-700">✅ मतदान संपन्न</span>
                        ) : (
                          <span className="text-amber-700">⏳ पेंडिंग</span>
                        )}
                      </td>
                      <td className="p-2 text-[10px] text-slate-600">
                        {owner.hasVoted ? (owner.auditEntry?.trackingToken || 'VERIFIED') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[10px] text-slate-500 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              🔒 <strong>गोपनीयता प्रमाणन:</strong> चुनाव नियमावली के तहत किसी भी मालिक का वोट किस प्रत्याशी को गया है, यह रिकॉर्ड नहीं किया जाता।
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
              >
                बंद करें
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-md transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>प्रिंट / PDF सेव करें</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: INITIATE ELECTION CYCLE MODAL
      ======================================================== */}
      {showInitiateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  नया चुनाव सत्र प्रारंभ करें (Initiate Election Cycle)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInitiateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateCycleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">चुनाव शीर्षक (Title):</label>
                <input
                  type="text"
                  required
                  value={initiateForm.title}
                  onChange={(e) => setInitiateForm({ ...initiateForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">द्विवार्षिक कार्यकाल (Term):</label>
                <input
                  type="text"
                  required
                  value={initiateForm.term}
                  onChange={(e) => setInitiateForm({ ...initiateForm, term: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रारंभ तारीख (Start):</label>
                  <input
                    type="datetime-local"
                    required
                    value={initiateForm.startDate}
                    onChange={(e) => setInitiateForm({ ...initiateForm, startDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-slate-900 text-[11px] font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">समाप्ति तारीख (End):</label>
                  <input
                    type="datetime-local"
                    required
                    value={initiateForm.endDate}
                    onChange={(e) => setInitiateForm({ ...initiateForm, endDate: e.target.value })}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-xl text-slate-900 text-[11px] font-mono focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">कुल पंजीकृत मतदाता (Voters):</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={initiateForm.totalVotersRegistered}
                  onChange={(e) => setInitiateForm({ ...initiateForm, totalVotersRegistered: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-semibold focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-amber-900">
                <input
                  type="checkbox"
                  id="resetVotes"
                  checked={initiateForm.resetVotes}
                  onChange={(e) => setInitiateForm({ ...initiateForm, resetVotes: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="resetVotes" className="text-[11px] cursor-pointer">
                  <span className="font-bold block">विद्यमान मत एवं पावती रीसेट करें</span>
                  नया चुनाव सत्र शुरू करने हेतु पुराने सभी पड़े मतों को शून्य कर दिया जाएगा।
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md"
                >
                  चुनाव चक्र प्रारंभ करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: ADD CANDIDATE MODAL
      ======================================================== */}
      {showAddCandidateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  नया उम्मीदवार जोड़ें (Add Candidate)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCandidateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCandidateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">उम्मीदवार का नाम:</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. सरदार सुरिंदर सिंह"
                  value={candidateForm.name}
                  onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">चुनाव पद (Post):</label>
                <select
                  value={candidateForm.postId}
                  onChange={(e) => setCandidateForm({ ...candidateForm, postId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-rose-600"
                >
                  {(election.posts || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameHi} ({p.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">पार्टी / पैनल (Panel):</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. एकता परिवहन मोर्चा / संबलपुर स्वाभिमान पैनल"
                  value={candidateForm.panel}
                  onChange={(e) => setCandidateForm({ ...candidateForm, panel: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">चुनाव चिन्ह (Symbol):</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={candidateForm.symbol}
                    onChange={(e) => setCandidateForm({ ...candidateForm, symbol: e.target.value })}
                    className="w-16 px-2 py-1.5 border border-slate-200 rounded-xl text-center text-lg focus:outline-none focus:border-rose-600"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {['🚚', '⚖️', '⚙️', '🌟', '🛡️', '🌾', '☀️', '🚩', '🤝'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setCandidateForm({ ...candidateForm, symbol: sym })}
                        className={`p-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                          candidateForm.symbol === sym
                            ? 'bg-rose-100 border-rose-500 scale-110'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">गाड़ी नंबर (वैकल्पिक):</label>
                <input
                  type="text"
                  placeholder="उदा. OD 15 X 7273"
                  value={candidateForm.truckNumber}
                  onChange={(e) => setCandidateForm({ ...candidateForm, truckNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCandidateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors cursor-pointer shadow-md"
                >
                  उम्मीदवार सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: BROADCAST WINNER MODAL (विजेता बधाई ब्रॉडकास्ट)
      ======================================================== */}
      {showBroadcastWinnerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-gradient-to-b from-amber-50/60 via-white to-white border-2 border-amber-300 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                  <PartyPopper className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    विजेता बधाई ब्रॉडकास्ट करें (Broadcast Winner Modal)
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    सभी वाहन मालिकों के मोबाइल पर सीधे बधाई पॉपअप भेजें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBroadcastWinnerModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3 text-xs">
              {/* Auto-detect button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={autoFillWinnersFromTally}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>लाइव मतों से ऑटो-भरें (Auto-Fill)</span>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  विजयी पैनल / पार्टी (Winning Panel):
                </label>
                <select
                  value={broadcastForm.winningPanel}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, winningPanel: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                >
                  {(election.panels || []).map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.symbol} {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  प्रमुख विजयी नाम एवं पद (Chief Winners):
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.chiefWinnerName}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, chiefWinnerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  बधाई संदेश (Congratulations Message):
                </label>
                <textarea
                  rows={2}
                  required
                  value={broadcastForm.winnerMessage}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, winnerMessage: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  आभार एवं धन्यवाद संदेश (Thank-You Subtext):
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.winnerSubMessage}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, winnerSubMessage: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">घोषणा कर्ता (Authority):</label>
                  <input
                    type="text"
                    value={broadcastForm.declaredBy}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, declaredBy: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">प्रदर्शन अवधि (Duration):</label>
                  <select
                    value={broadcastForm.durationHours}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, durationHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value={6}>6 घंटे (6 Hours)</option>
                    <option value={12}>12 घंटे (12 Hours)</option>
                    <option value={24}>24 घंटे (1 दिन)</option>
                    <option value={48}>48 घंटे (2 दिन)</option>
                    <option value={72}>72 घंटे (3 दिन)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => setShowCelebrationPreview(true)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>लाइव प्रीव्यू देखें</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>अभी सभी मालिकों को ब्रॉडकास्ट भेजें</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal if requested */}
      {showCelebrationPreview && (
        <ElectionCelebrationModal onViewResults={() => setShowCelebrationPreview(false)} />
      )}
    </div>
  );
};
