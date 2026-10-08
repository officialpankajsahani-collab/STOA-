import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useElection } from '../../context/ElectionContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  Vote,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Users,
  Printer,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ElectionVotingCard: React.FC = () => {
  const { user } = useAuth();
  const { election, hasOwnerVoted, hasVehicleVoted, getOwnerReceipt, castVote } = useElection();
  const { t, language } = useLanguageTheme();

  // ONLY render when election is currently ACTIVE
  if (election.status !== 'VOTING_ACTIVE') {
    return null;
  }

  const ownerUser = user as any;
  const ownerMobile = ownerUser?.mobile || ownerUser?.ownerMobile || ownerUser?.mobileNumber || '';
  const vehicleNumber = ownerUser?.vehicleNumber || '';
  const membershipNumber = ownerUser?.membershipNumber || '';
  const ownerName = ownerUser?.ownerName || '';

  const alreadyVoted = hasOwnerVoted(ownerMobile, membershipNumber, ownerName, vehicleNumber) || hasVehicleVoted(vehicleNumber);
  const existingReceipt = getOwnerReceipt(ownerMobile) || getOwnerReceipt(vehicleNumber) || (membershipNumber ? getOwnerReceipt(membershipNumber) : null);

  const [selections, setSelections] = useState<{ [postId: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [voteSubmittedJustNow, setVoteSubmittedJustNow] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState(existingReceipt);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Live Countdown to Voting Deadline
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  useEffect(() => {
    const calculateTime = () => {
      // Default to 48 hours from start or specified end date
      const targetTime = election.endDate
        ? new Date(election.endDate).getTime()
        : new Date(election.startDate || Date.now()).getTime() + 48 * 60 * 60 * 1000;

      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [election.endDate, election.startDate]);

  const handleSelectCandidate = (postId: string, candidateId: string) => {
    setSelections((prev) => ({
      ...prev,
      [postId]: candidateId,
    }));
    setErrorMsg(null);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validate that a candidate is chosen for all positions
    const unselected = election.posts.filter((p) => !selections[p.id]);
    if (unselected.length > 0) {
      setErrorMsg(
        language === 'en'
          ? `Please select a candidate for all posts: ${unselected.map((p) => p.nameEn).join(', ')}`
          : `कृपया सभी पदों के लिए उम्मीदवार का चयन करें: ${unselected.map((p) => p.nameHi).join(', ')}`
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmVote = () => {
    setSubmitting(true);
    setShowConfirmModal(false);

    const result = castVote(ownerMobile, vehicleNumber, selections, membershipNumber, ownerName);
    setSubmitting(false);

    if (result.success && result.receipt) {
      setVoteSubmittedJustNow(true);
      setLatestReceipt(result.receipt);
    } else {
      setErrorMsg(result.error || 'मतदान में त्रुटि हुई');
    }
  };

  const activeReceipt = latestReceipt || existingReceipt;
  const isVoteSubmitted = alreadyVoted || voteSubmittedJustNow;
  const turnoutPercent = Math.round((election.totalVotesCast / election.totalVotersRegistered) * 100);

  // ==================================================
  // STATE 1: VOTE SUBMITTED CONFIRMATION
  // ==================================================
  if (isVoteSubmitted) {
    return (
      <div className="w-full bg-white border border-emerald-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
        {/* Success Banner */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-emerald-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/25">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-md uppercase tracking-wider">
                Vote Submitted ✓
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {election.term}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-display mt-0.5">
              {language === 'en' ? 'Your Ballot Has Been Submitted!' : 'आपका मत सफलतापूर्वक दर्ज हो गया है!'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'en'
                ? 'Thank you for exercising your democratic right in the STOA Biennial Election.'
                : 'संबलपुर ट्रक ओनर्स एसोसिएशन द्विवार्षिक चुनाव में निष्पक्ष मतदान के लिए धन्यवाद।'}
            </p>
          </div>
        </div>

        {/* Digital Ballot Receipt */}
        {activeReceipt && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2.5 font-mono">
            <div className="flex items-center justify-between text-slate-700 font-bold border-b border-slate-200 pb-2">
              <span className="flex items-center gap-1.5 text-emerald-800">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                डिजिटल मतदान पावती (Official Ballot Receipt)
              </span>
              <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500">पावती आईडी:</span>
                <span className="font-bold text-slate-900">{activeReceipt.voteId}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500">वाहन संख्या:</span>
                <span className="font-bold text-slate-900">{activeReceipt.vehicleNumber}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500">मतदाता मोबाइल:</span>
                <span className="font-bold text-slate-900">XXXXXX{activeReceipt.ownerMobile.slice(-4)}</span>
              </div>
              <div className="flex justify-between sm:justify-start sm:gap-2">
                <span className="text-slate-500">दर्ज समय:</span>
                <span className="font-bold text-slate-900">
                  {new Date(activeReceipt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                  {new Date(activeReceipt.timestamp).toLocaleDateString()}
                </span>
              </div>
              {activeReceipt.trackingToken && (
                <div className="flex justify-between sm:justify-start sm:gap-2 sm:col-span-2">
                  <span className="text-slate-500">डिजिटल ट्रैकिंग टोकन:</span>
                  <span className="font-bold text-rose-700 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{activeReceipt.trackingToken}</span>
                </div>
              )}
            </div>

            {/* Zero-Knowledge Privacy Guarantee Banner */}
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2 font-sans">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block text-emerald-900 font-bold">100% पूर्ण मत गोपनीयता प्रमाणन</strong>
                <span className="text-slate-600 block leading-tight">
                  एडमिन के पास केवल यह रिकॉर्ड सुरक्षित हुआ है कि आपने मतदान कर दिया है। आपने किस उम्मीदवार या पार्टी को वोट दिया है, यह तकनीकी रूप से पूर्णतः गोपनीय व सीलबंद है और एडमिन सहित किसी को भी नहीं दिखेगा।
                </span>
              </div>
            </div>

            {/* Cryptographic Hash */}
            <div className="pt-1.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-500">
              <span className="truncate">
                सुरक्षा हैश: <code className="text-slate-800 font-bold">{activeReceipt.ballotHash}</code>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Lock className="w-3 h-3" /> 100% गोपनीय एवं सुरक्षित
              </span>
            </div>
          </div>
        )}

        {/* Live Voting Turnout Progress */}
        <div className="p-3 bg-white border border-slate-200 rounded-2xl text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-rose-600" />
              लाइव एसोसिएशन टर्नआउट (Live Turnout):
            </span>
            <span className="text-rose-700 font-mono">
              {election.totalVotesCast} / {election.totalVotersRegistered} ({turnoutPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, turnoutPercent)}%` }}
            />
          </div>
        </div>

        {/* Countdown Pill even after vote */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            मतदान समाप्ति में शेष:
          </span>
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
            {timeLeft.days > 0 && `${timeLeft.days}d `}
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
    );
  }

  // ==================================================
  // STATE 2: ACTIVE VOTING BALLOT WITH CANDIDATE LIST & COUNTDOWN
  // ==================================================
  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* 1. Header Banner & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-display">
                {election.title}
              </h3>
              <p className="text-[11px] text-rose-700 font-semibold font-mono">
                {election.term}
              </p>
            </div>
          </div>
        </div>

        {/* Active Pill */}
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            मतदान चालू (VOTING ACTIVE)
          </span>
        </div>
      </div>

      {/* 2. PROMINENT COUNTDOWN TIMER TO VOTING DEADLINE */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold flex items-center gap-1.5 text-amber-300 uppercase tracking-wider font-mono text-[11px]">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            मतदान समाप्ति उल्टी गिनती (Voting Deadline Countdown):
          </span>
          <span className="text-[10px] text-slate-300 font-mono">
            {election.endDate ? new Date(election.endDate).toLocaleDateString() : 'आधिकारिक समय'}
          </span>
        </div>

        {/* Countdown Digits Grid */}
        <div className="grid grid-cols-4 gap-2 text-center pt-0.5">
          {/* Days */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-lg sm:text-2xl font-black font-mono text-white block leading-none">
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-300 font-bold block mt-1">
              दिन (Days)
            </span>
          </div>

          {/* Hours */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-lg sm:text-2xl font-black font-mono text-amber-300 block leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-300 font-bold block mt-1">
              घंटे (Hours)
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-lg sm:text-2xl font-black font-mono text-white block leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-300 font-bold block mt-1">
              मिनट (Mins)
            </span>
          </div>

          {/* Seconds */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-2 border border-white/10">
            <span className="text-lg sm:text-2xl font-black font-mono text-rose-400 block leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-300 font-bold block mt-1">
              सेकंड (Secs)
            </span>
          </div>
        </div>
      </div>

      {/* Security Info Pill */}
      <div className="p-3 bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-950 shadow-2xs">
        <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-extrabold text-rose-900">
            🔒 एक मालिक = केवल 1 वोट नियम (1 Owner = 1 Vote Protocol)
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            एसोसिएशन चुनाव नियमावली के अनुसार <strong>एक मालिक के नाम पर चाहें 1 गाड़ी हो या 10 गाड़ियां</strong>, वह केवल एक ही वोट दे सकता है। उससे ज्यादा बार नहीं। मतदान संपन्न होते ही आपकी सभी पंजीकृत गाड़ियां व सदस्यता संख्या स्वतः सीलबंद हो जाएंगी।
          </p>
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. LIST CANDIDATES & ALLOW SELECTION FOR EACH POST */}
      <form onSubmit={handleOpenConfirm} className="space-y-4">
        {election.posts.map((post) => {
          const candidatesForPost = election.candidates.filter((c) => c.postId === post.id);

          return (
            <div key={post.id} className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="text-xs font-black text-slate-900 font-display flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                  {post.nameHi} ({post.nameEn})
                </span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">
                  {selections[post.id] ? '✓ चयनित' : 'चयन बाकी'}
                </span>
              </div>

              {/* Candidate Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {candidatesForPost.map((cand) => {
                  const isSelected = selections[post.id] === cand.id;

                  return (
                    <div
                      key={cand.id}
                      onClick={() => handleSelectCandidate(post.id, cand.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-rose-50/90 border-rose-600 shadow-sm ring-2 ring-rose-600/30'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Election Symbol Box */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0 shadow-2xs">
                          {cand.symbol}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {cand.name}
                          </p>
                          <span className="text-[11px] text-rose-700 font-semibold block truncate">
                            {cand.panel}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            गाड़ी: {cand.truckNumber || 'OD 15'}
                          </span>
                        </div>
                      </div>

                      {/* Selection Radio Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'border-rose-600 bg-rose-600' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Submit Ballot Action */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl text-xs sm:text-sm font-black shadow-md shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          <Lock className="w-4 h-4" />
          <span>{language === 'en' ? 'Cast Secret Vote' : 'गोपनीय मत दर्ज करें (Submit Vote)'}</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Vote className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">
                {language === 'en' ? 'Confirm Your Ballot' : 'मत की अंतिम पुष्टि करें'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                क्या आप अपने मत को सुरक्षित दर्ज करना चाहते हैं? एक बार दर्ज होने के बाद इसे बदला नहीं जा सकता।
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                संशोधित करें
              </button>
              <button
                type="button"
                onClick={handleConfirmVote}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                हां, मत दर्ज करें ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
