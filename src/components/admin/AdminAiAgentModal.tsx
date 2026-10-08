import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Terminal,
  Zap,
  Truck,
  RotateCcw,
  FileSpreadsheet,
  Mail,
  ShieldAlert,
  Volume2,
  VolumeX,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';

interface ExecutionRecord {
  id: string;
  command: string;
  reply: string;
  toolName?: string;
  toolDescription?: string;
  status: 'SUCCESS' | 'ERROR' | 'INFO';
  timestamp: string;
  navigation?: {
    targetTab?: string;
    fleetFilter?: string;
    searchQuery?: string;
  };
}

const PRESET_COMMANDS = [
  { label: '⚡ पुकार 101 से 250 चालू करो', cmd: 'पुकार चालू करो 101 से 250' },
  { label: '⛔ पुकार बंद करो', cmd: 'पुकार बंद करो' },
  { label: '📋 वेदांता 10 ट्रक लोड पोस्ट करो', cmd: 'वेदांता प्लांट का 10 ट्रक झाड़सुगुड़ा 1250 रेट लोड पोस्ट करो' },
  { label: '🧹 पूर्ण लोड प्रोग्राम साफ करो', cmd: 'पूरे कम्पलीट लोड डिलीट करो' },
  { label: '📧 आज की रिपोर्ट ईमेल भेजो', cmd: 'दैनिक रिपोर्ट ईमेल भेजो' },
  { label: '🚚 गाड़ी OD 15 A 1122 कतार में डालो', cmd: 'गाड़ी OD 15 A 1122 को READY_QUEUE करो' },
  { label: '🎫 गाड़ी OD 15 A 1122 का गेट पास काटो', cmd: 'गाड़ी OD 15 A 1122 का गेट पास जारी करो' },
  { label: '🚫 गाड़ी OD 15 B 2233 ब्लैकलिस्ट करो', cmd: 'गाड़ी OD 15 B 2233 ब्लैकलिस्ट करो' },
  { label: '📢 टिकर घोषणा बदलो', cmd: 'टिकर संदेश बदलो: कल सुबह 10 बजे आम सभा STOA भवन में होगी।' },
];

export const AdminAiAgentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: any, filter?: string, query?: string) => void;
  onRefreshData?: () => void;
}> = ({ isOpen, onClose, onNavigateTab, onRefreshData }) => {
  const { user } = useAuth();
  const [commandInput, setCommandInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<ExecutionRecord[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [suggestedChips, setSuggestedChips] = useState<string[]>([
    '⚡ पुकार 101 से 250 चालू करें',
    '📋 वेदांता लोड पोस्ट करें',
    '🧹 कम्पलीट लोड हटाएं',
    '📧 रिपोर्ट ईमेल करें',
  ]);

  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Play subtle executive chime on action success
  const playAudioChime = (type: 'success' | 'action') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      const rec = new SpeechRec();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'hi-IN';

      rec.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setCommandInput(transcript);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('आपके ब्राउज़र में वॉइस स्पीच उपलब्ध नहीं है। कृपया टाइप करें।');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleExecuteCommand = async (cmdText?: string) => {
    const cmd = (cmdText || commandInput).trim();
    if (!cmd || isExecuting) return;

    setIsExecuting(true);
    setCommandInput('');

    try {
      const res = await fetch('/api/ai/admin-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cmd,
          adminName: (user as any)?.name || (user as any)?.ownerName || 'Admin',
          adminRole: user?.role || 'ADMIN',
        }),
      });

      const data = await res.json();

      const newRecord: ExecutionRecord = {
        id: `rec-${Date.now()}`,
        command: cmd,
        reply: data.reply || (data.success ? 'कार्रवाई सफलतापूर्वक निष्पादित की गई।' : 'कार्रवाई में समस्या आई।'),
        toolName: data.actionExecuted?.toolName,
        toolDescription: data.actionExecuted?.description,
        status: data.actionExecuted?.status || (data.success ? 'SUCCESS' : 'ERROR'),
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        navigation: data.navigation,
      };

      setHistory((prev) => [...prev, newRecord]);

      if (data.systemStateSnapshot) {
        setTelemetry(data.systemStateSnapshot);
      }

      if (data.suggestedFollowUps && Array.isArray(data.suggestedFollowUps)) {
        setSuggestedChips(data.suggestedFollowUps);
      }

      playAudioChime('success');

      // Trigger automatic refresh of the Admin Dashboard state
      if (onRefreshData) {
        onRefreshData();
      }

      // Auto-scroll to latest
      setTimeout(() => {
        endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      const errRecord: ExecutionRecord = {
        id: `rec-${Date.now()}`,
        command: cmd,
        reply: `सर्वर त्रुटि: ${err.message || 'नेटवर्क समस्या'}`,
        status: 'ERROR',
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setHistory((prev) => [...prev, errRecord]);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleNavigateDirect = (nav?: { targetTab?: string; fleetFilter?: string; searchQuery?: string }) => {
    if (nav?.targetTab && onNavigateTab) {
      onNavigateTab(nav.targetTab, nav.fleetFilter, nav.searchQuery);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[92vh] max-h-[860px] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 ring-1 ring-cyan-500/20">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  STOA AI एडमिन कमांडर (Autonomous Agent)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  सक्रिय (Active)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                एडमिन डैशबोर्ड का सुप्रीम AI कंट्रोलर — बोलें या लिखें, आदेश तुरंत क्रियान्वित होगा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ध्वनि चालू' : 'ध्वनि बंद'}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Telemetry Status Bar */}
        {telemetry && (
          <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-3 sm:gap-6 text-xs overflow-x-auto shrink-0 select-none">
            <div className="flex items-center gap-1.5 text-slate-400">
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>पुकार:</span>
              <strong className={telemetry.pukarActive ? 'text-emerald-400' : 'text-slate-500'}>
                {telemetry.pukarActive ? `चालू (${telemetry.pukarRange})` : 'बंद'}
              </strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              <span>कतार में गाड़ियां:</span>
              <strong className="text-slate-200">{telemetry.readyQueueCount}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
              <span>सक्रिय लोडिंग:</span>
              <strong className="text-slate-200">{telemetry.programsCount}</strong>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>आज लोड हुई:</span>
              <strong className="text-emerald-300">{telemetry.loadedTodayCount}</strong>
            </div>
          </div>
        )}

        {/* Main Content Area / Execution Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-900/60">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center shadow-inner">
                <Terminal className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-white">एडमिन AI कमांडर तैयार है</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  नीचे दिए गए प्रीसेट बटनों पर क्लिक करें या माइक दबाकर सीधे आदेश दें। यह एजेंट पूरे फ्लीट, पुकार, लोडिंग, गेट पास, और रिपोर्ट को वास्तविक समय में नियंत्रित करता है।
                </p>
              </div>

              {/* Preset Commands Grid */}
              <div className="w-full max-w-2xl pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider text-left">
                  त्वरित प्रशासनिक आदेश (Quick Actions):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {PRESET_COMMANDS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteCommand(item.cmd)}
                      disabled={isExecuting}
                      className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-cyan-500/50 text-xs text-slate-200 hover:text-white transition flex items-center justify-between group disabled:opacity-50 text-left"
                    >
                      <span className="font-medium truncate mr-2">{item.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div
                  key={record.id}
                  className="rounded-2xl border border-slate-800 bg-slate-850/80 overflow-hidden shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  {/* Command Row */}
                  <div className="px-4 py-2.5 bg-slate-800/60 border-b border-slate-750 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-cyan-400 font-bold">admin$</span>
                      <span className="text-slate-100 font-medium">{record.command}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {record.timestamp}
                    </span>
                  </div>

                  {/* Execution Response */}
                  <div className="p-4 space-y-3">
                    {/* Tool Badge */}
                    {record.toolName && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-md">
                          TOOL: {record.toolName}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md flex items-center gap-1 ${
                          record.status === 'SUCCESS'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}>
                          {record.status === 'SUCCESS' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {record.status === 'SUCCESS' ? 'तुरंत निष्पादित (Executed)' : 'त्रुटि (Failed)'}
                        </span>
                      </div>
                    )}

                    {/* Detailed Result Message */}
                    <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {record.reply}
                    </div>

                    {/* Navigation Direct Button if targetTab returned */}
                    {record.navigation?.targetTab && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          संबंधित डैशबोर्ड सेक्शन: <strong className="text-cyan-300 uppercase">{record.navigation.targetTab}</strong>
                        </span>
                        <button
                          onClick={() => handleNavigateDirect(record.navigation)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <span>डैशबोर्ड में देखें</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isExecuting && (
                <div className="p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 flex items-center gap-3 animate-pulse">
                  <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
                  <div>
                    <p className="text-xs font-bold text-cyan-300">आदेश का विश्लेषण व निष्पादन चालू है...</p>
                    <p className="text-[11px] text-slate-400">डेटाबेस और रियल-टाइम ब्रॉडकास्ट अपडेट किया जा रहा है</p>
                  </div>
                </div>
              )}

              <div ref={endOfHistoryRef} />
            </div>
          )}
        </div>

        {/* Suggested Chips */}
        {suggestedChips.length > 0 && (
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
            <span className="text-[10px] font-semibold text-slate-500 uppercase shrink-0">सुझाव:</span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleExecuteCommand(chip.replace(/^[⚡📋🧹📧🚚🎫🚫📢]\s*/, ''))}
                disabled={isExecuting}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium shrink-0 transition disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Input Dock */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecuteCommand();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              title={isListening ? 'बोलना बंद करें' : 'माइक दबाकर बोलें (Voice Command)'}
              className={`p-3 rounded-2xl transition shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Command Text Input */}
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={
                isListening
                  ? 'बोलिए, मैं सुन रहा हूँ...'
                  : 'आदेश लिखें (उदा: "पुकार चालू करो 101 से 250", "वेदांता 10 गाड़ी लोड पोस्ट करो")...'
              }
              disabled={isExecuting}
              className="flex-1 bg-slate-900 border border-slate-750 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition"
            />

            {/* Execute Button */}
            <button
              type="submit"
              disabled={!commandInput.trim() || isExecuting}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-sm flex items-center gap-1.5 transition shrink-0 shadow-lg shadow-cyan-600/30"
            >
              {isExecuting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline">आदेश दें</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
