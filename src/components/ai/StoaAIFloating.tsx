import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
  FileText,
  CheckCircle,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  dataContext?: any;
}

// Quick Topic Categories covering all 10 areas
const TOPIC_CATEGORIES = [
  {
    id: 'officials',
    label: '👑 अध्यक्ष व अधिकारी',
    prompt: 'संबलपुर ट्रक ओनर्स एसोसिएशन के प्रेसिडेंट (अध्यक्ष) और सभी पदाधिकारियों की सूची, फोन नंबर व कार्यक्षेत्र बताएं।',
  },
  {
    id: 'engine',
    label: '🔧 इंजन रिपेयर A to Z',
    prompt: 'गाड़ी के इंजन रिपेयर, ओवरहीट, सफेद/काला धुआं और BS6 DPF पार्क्ड रीजेनरेशन व AdBlue समस्या के बारे में बताएं।',
  },
  {
    id: 'tyres',
    label: '🛞 टायर व एयर प्रेशर',
    prompt: 'कमर्शियल ट्रक टायर (295/90 R20 आदि) में सही एयर प्रेशर (PSI), घिसाव के कारण और री-ट्रेडिंग के नियम बताएं।',
  },
  {
    id: 'toll',
    label: '🛣️ रोड व टोल टैक्स',
    prompt: 'संबलपुर और आसपास के टोल टैक्स (जामुर्दा, बारकोट), फास्टैग ब्लैकलिस्टिंग नियम व ओडिशा रोड टैक्स के बारे में बताएं।',
  },
  {
    id: 'mileage',
    label: '⛽ माइलेज व डीजल पंप',
    prompt: '6/10/12-व्हीलर ट्रक का सही माइलेज कैसे निकालें और संबलपुर NH-53 पर 24 घंटे खुले प्रमाणित डीजल पंप कौन से हैं?',
  },
  {
    id: 'dhaba',
    label: '🍲 होटल ढाबा व पार्किंग',
    prompt: 'संबलपुर हाईवे पर बेस्ट होटल ढाबा और 200+ ट्रकों की आधिकारिक सुरक्षित पार्किंग (जमादारपाली टर्मिनल) के बारे में बताएं।',
  },
  {
    id: 'police',
    label: '👮 पुलिस व कानूनी सुरक्षा',
    prompt: 'पुलिस व आरटीओ चेकिंग में ड्राइवर के कानूनी अधिकार, डिजिलॉकर की वैधता और आपातकालीन हेल्पलाइन 112 / 1033 की जानकारी दें।',
  },
  {
    id: 'fleet',
    label: '📋 रजिस्टर्ड गाड़ियां',
    prompt: 'एप्लिकेशन में कौन-कौन सी गाड़ियां रजिस्टर्ड हैं और किसी गाड़ी का फिटनेस/परमिट/सीरियल कैसे चेक करें?',
  },
];

export const StoaAIFloating: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { language } = useLanguageTheme();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dailyReportModal, setDailyReportModal] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize welcome message
  useEffect(() => {
    if (user) {
      const isOwner = user.role === 'OWNER';
      let welcomeText = '';
      if (language === 'en') {
        welcomeText = isOwner
          ? `🚚 **Welcome to Sambalpur Truck Owners Association AI!**

Hello **${(user as any).ownerName || 'Respected Member'}**! Your truck **${(user as any).vehicleNumber || 'OD15'}** is linked.

Ask me anything about trucks & transport:
• 🔧 **Engine:** Overheating, smoke analysis, BS6 DPF regeneration, AdBlue errors.
• 🛞 **Tyres & PSI:** Optimal pressure, shoulder/tread wear, alignment.
• 🛣️ **Highways & Tolls:** NH-53, Jamurda toll, FASTag rules, Odisha road tax.
• 📋 **Registered Fleet:** Vehicle fitness, permits, and active rotation queue.
• 👑 **STOA Leadership:** President Sardar Balwinder Singh and executive contacts.
• ⛽ **Mileage & Fuel:** Mileage formula and verified 24/7 pumps on NH-53.
• 🍲 **Parking & Dhaba:** Jamadarpali terminal (200+ capacity) and food stops.
• 👮 **Legal & Police:** Toll/RTO guidelines, emergency 112/1033, DigiLocker rules.`
          : `🛡️ **STOA Control Room Master AI — Sambalpur Truck Owners Association**

Hello **${(user as any).name || 'Control Officer'}**! STOA NextGen AI is active.

Query fleet loading rotation, 15-to-15 financial ledgers, active Pukar status, executive directory, technical engine SOPs, toll rates, or generate daily dispatch reports.`;
      } else if (language === 'or') {
        welcomeText = isOwner
          ? `🚚 **ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ ଏଆଇ ସହାୟକକୁ ସ୍ୱାଗତ!**

ନମସ୍କାର **${(user as any).ownerName || 'ସମ୍ମାନିତ ସଦସ୍ୟ'}**! ଆପଣଙ୍କ ଗାଡ଼ି **${(user as any).vehicleNumber || 'OD15'}** ଡାଟାବେସ ସହ ସଂଯୁକ୍ତ।

ଟ୍ରକ ଓ ପରିବହନ ସମ୍ବନ୍ଧୀୟ ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ:
• 🔧 **ଇଞ୍ଜିନ୍ ମରାମତି:** ଓଭରହିଟିଂ, ଧୂଆଁ ବିଶ୍ଳେଷଣ, BS6 DPF ଓ AdBlue ସମସ୍ୟା।
• 🛞 **ଟାୟାର୍ ଓ ଏୟାର୍:** ସଠିକ୍ PSI, ଘିସାବ ଓ ରି-ଟ୍ରେଡ୍ ନିୟମ।
• 🛣️ **ରୋଡ୍ ଓ ଟୋଲ୍ ଟ୍ୟାକ୍ସ:** NH-53, ଜାମୁର୍ଦା ଟୋଲ୍, ଫାସଟ୍ୟାଗ୍ ନିୟମ।
• 📋 **ପଞ୍ଜୀକୃତ ଗାଡ଼ି:** ଫିଟନେସ୍, ପରମିଟ୍ ଓ ଲୋଡିଂ କ୍ରମିକ ସଂଖ୍ୟା।
• 👑 **ସଂଘ କର୍ମକର୍ତ୍ତା:** ସଭାପତି ସର୍ଦ୍ଦାର ବଲବିନ୍ଦର ସିଂହ ଓ କାର୍ଯ୍ୟକାରିଣୀ ଫୋନ୍ ନମ୍ବର।`
          : `🛡️ **ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ କଣ୍ଟ୍ରୋଲ୍ ରୁମ୍ ମାଷ୍ଟର ଏଆଇ**

ନମସ୍କାର **${(user as any).name || 'କଣ୍ଟ୍ରୋଲ୍ ଅଫିସର'}**! ଏସ.ଟି.ଓ.ଏ ନେକ୍ସଟଜେନ୍ ଏଆଇ ସକ୍ରିୟ ଅଛି।

ଆପଣ ଫ୍ଲିଟ୍ ଲୋଡିଂ ପର୍ଯ୍ୟାୟ, ୧୫-ରୁ-୧୫ ଖାତା, ପୁକାର ସ୍ଥିତି କିମ୍ବା ଦୈନିକ ରିପୋର୍ଟ ପାଇପାରିବେ।`;
      } else {
        welcomeText = isOwner
          ? `🚚 **संबलपुर ट्रक ओनर्स एसोसिएशन (STOA NEXTGEN महा-ज्ञानी AI) में आपका स्वागत है!**

नमस्ते **${(user as any).ownerName || 'सम्मानित सदस्य'} जी**! आपकी गाड़ी **${(user as any).vehicleNumber || 'OD15'}** डेटाबेस में लिंक्ड है।

मुझसे आप ट्रक और ट्रांसपोर्ट का **A to Z** कुछ भी पूछ सकते हैं:
• 🔧 **इंजन रिपेयर:** ओवरहीटिंग, धुआं विश्लेषण, BS6 DPF पार्क्ड रीजेनरेशन, AdBlue/DEF एरर।
• 🛞 **टायर व एयर प्रेशर:** सही PSI, कंधा/गोदी घिसाव, अलाइनमेंट, री-ट्रेड नियम।
• 🛣️ **रोड, हाइवे व टोल टैक्स:** NH-53, जामुर्दा टोल, फास्टैग नियम, ओडिशा रोड टैक्स।
• 📋 **रजिस्टर्ड गाड़ियां:** डेटाबेस में दर्ज किसी भी गाड़ी का मालिक, फिटनेस, परमिट व सीरियल।
• 👑 **एसोसिएशन अधिकारी:** अध्यक्ष सरदार बलविंदर सिंह व कार्यकारिणी के मोबाइल नंबर।
• ⛽ **माइलेज व डीजल पंप:** माइलेज फॉर्मूला, NH-53 पर 24 घंटे खुले प्रमाणित पंप।
• 🍲 **ढाबा व पार्किंग:** शेर-ए-पंजाब, मां समलेश्वरी, जमादारपाली ट्रक टर्मिनल (200+ पार्किंग)।
• 👮 **पुलिस व कानूनी सुरक्षा:** आपातकालीन 112/1033, डिजिलॉकर वैधता, लाइसेंस जब्ती रसीद नियम।`
          : `🛡️ **STOA कंट्रोल रूम मास्टर एआई — संबलपुर ट्रक ओनर्स एसोसिएशन**

नमस्ते **${(user as any).name || 'कंट्रोल ऑफिसर'} जी**! STOA नेक्स्टजेन महा-ज्ञानी एआई सक्रिय है। 

आप फ्लीट लोडिंग रोटेशन, 15-टू-15 वित्तीय लेजर, पुकार स्थिति, कार्यकारिणी डायरेक्टरी, टेक्निकल इंजन एसओपी, टोल दरें, अथवा दैनिक संचालन रिपोर्ट प्राप्त कर सकते हैं।`;
      }

      setMessages([
        {
          id: 'msg-welcome',
          sender: 'ai',
          text: welcomeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [user, language]);

  // Scroll to bottom on message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Web Speech API Voice Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'or' ? 'hi-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('आपके ब्राउज़र में वॉइस स्पीच रिकग्निशन समर्थित नहीं है।');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Strip markdown formatting for cleaner speech
    const clean = text.replace(/[*#_`•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const isOwner = user?.role === 'OWNER';
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          role: user?.role || 'OWNER',
          vehicleNumber: isOwner ? (user as any).vehicleNumber : undefined,
          userName: isOwner ? (user as any).ownerName : (user as any).name,
          preferredLanguage: language,
        }),
      });

      const data = await res.json();
      const reply = data.reply || 'नमस्ते, STOA सेवा में आपका स्वागत है।';

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dataContext: data.dataContext,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          text: 'एआई सेवा से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFetchDailyReport = async () => {
    setIsThinking(true);
    try {
      const isOwner = user?.role === 'OWNER';
      const veh = isOwner ? (user as any).vehicleNumber : undefined;
      const res = await fetch(`/api/ai/daily-report?role=${user?.role}&vehicleNumber=${veh || ''}`);
      const data = await res.json();
      if (data.report) {
        setDailyReportModal(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  const isOwner = user?.role === 'OWNER';

  // Format markdown helper
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.startsWith('•') || line.startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
            <span className="text-rose-600 font-bold shrink-0 leading-relaxed">•</span>
            <span className="leading-relaxed text-slate-800">{formattedParts}</span>
          </div>
        );
      }

      if (line.trim().startsWith('1.') || line.trim().startsWith('2.') || line.trim().startsWith('3.') || line.trim().startsWith('4.') || line.trim().startsWith('5.') || line.trim().startsWith('6.') || line.trim().startsWith('7.') || line.trim().startsWith('8.') || line.trim().startsWith('9.') || line.trim().startsWith('10.')) {
        return (
          <div key={idx} className="my-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed text-slate-800">
            {formattedParts}
          </div>
        );
      }

      return (
        <p key={idx} className={`${line.trim() === '' ? 'h-2' : 'my-0.5 leading-relaxed text-slate-800'}`}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 sm:rounded-3xl w-full max-w-2xl h-[92vh] sm:h-[720px] flex flex-col overflow-hidden shadow-2xl relative font-sans">
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-700 flex items-center justify-center text-white font-bold shadow-sm ring-1 ring-rose-400/30">
              <Bot className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5 font-display">
                  STOA NEXTGEN AI
                  <span className="text-[9px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    महा-ज्ञानी
                  </span>
                </h3>
                <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded-lg hidden sm:inline">
                  {isOwner
                    ? (language === 'en' ? 'Owner Mode' : language === 'or' ? 'ମାଲିକ ମୋଡ୍' : 'ट्रक मालिक मोड')
                    : (language === 'en' ? 'Admin Mode' : language === 'or' ? 'ପ୍ରଶାସନିକ ମୋଡ୍' : 'कंट्रोल रूम मोड')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {language === 'en'
                  ? 'Engine Repair · Tyres · Tolls · Fleet · Leadership · Mileage · Dhaba · Police'
                  : language === 'or'
                  ? 'ଇଞ୍ଜିନ୍ ମରାମତି · ଟାୟାର୍ · ଟୋଲ୍ · ଫ୍ଲିଟ୍ · ନେତୃତ୍ୱ · ମାଇଲେଜ୍ · ଢାବା · ପୋଲିସ୍'
                  : 'इंजन रिपेयर · टायर · टोल · फ्लीट · प्रेसिडेंट · माइलेज · ढाबा · पुलिस'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleFetchDailyReport}
              title={language === 'en' ? 'Daily Report' : language === 'or' ? 'ଦୈନିକ ରିପୋର୍ଟ' : 'दैनिक रिपोर्ट'}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">{language === 'en' ? 'Daily Report' : language === 'or' ? 'ଦୈନିକ ରିପୋର୍ଟ' : 'दैनिक रिपोर्ट'}</span>
            </button>

            <button
              type="button"
              onClick={clearChat}
              title={language === 'en' ? 'Clear Chat' : language === 'or' ? 'ଚାଟ୍ ସଫା କରନ୍ତୁ' : 'चैट साफ करें'}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Topic Quick Chips */}
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none shrink-0">
          {TOPIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSendMessage(cat.prompt)}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl text-[11px] font-medium whitespace-nowrap border border-slate-200 transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-rose-600 to-pink-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-rose-700 shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 text-white font-medium rounded-tr-none shadow-rose-600/20'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="break-words font-sans text-[12px] leading-relaxed">
                  {renderFormattedText(m.text)}
                </div>

                <div
                  className={`flex items-center justify-between mt-2 pt-1.5 border-t text-[10px] ${
                    m.sender === 'user' ? 'border-white/20 text-white/80' : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {m.sender === 'ai' && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => speakText(m.text)}
                        title={language === 'en' ? 'Listen' : language === 'or' ? 'ଶୁଣନ୍ତୁ' : 'आवाज में सुनें'}
                        className="hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                        <span className="text-[10px] font-medium text-slate-600">{language === 'en' ? 'Speak' : language === 'or' ? 'ଶୁଣନ୍ତୁ' : 'बोलें'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(m.id, m.text)}
                        title={language === 'en' ? 'Copy' : language === 'or' ? 'କପି' : 'कॉपी करें'}
                        className="hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">{language === 'en' ? 'Copied' : language === 'or' ? 'କପି ହେଲା' : 'कॉपी हुआ'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-600 font-medium">{language === 'en' ? 'Copy' : language === 'or' ? 'କପି' : 'कॉपी'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2.5 text-slate-600 text-xs pl-9 font-medium py-1">
              <Bot className="w-4 h-4 text-rose-600 animate-bounce" />
              <span className="animate-pulse">
                {language === 'en'
                  ? 'STOA AI is analyzing and formulating response...'
                  : language === 'or'
                  ? 'ଏସ.ଟି.ଓ.ଏ ଏଆଇ ବିଚାର କରି ସଠିକ୍ ଉତ୍ତର ପ୍ରସ୍ତୁତ କରୁଛି...'
                  : 'STOA AI गहराई से सोच रहा है और सटीक उत्तर तैयार कर रहा है...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleMic}
            title={isListening ? (language === 'en' ? 'Stop Mic' : 'माइक बंद करें') : (language === 'en' ? 'Voice Input' : 'बोलकर पूछें')}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              isListening
                ? (language === 'en' ? 'Listening... Speak now...' : language === 'or' ? 'ଶୁଣୁଛି... କୁହନ୍ତୁ...' : 'सुन रहा हूँ... बोलिए...')
                : (language === 'en' ? 'Ask about vehicle, engine, tyre, toll, mileage, pump, police...' : language === 'or' ? 'ଗାଡ଼ି, ଇଞ୍ଜିନ୍, ଟାୟାର୍, ଟୋଲ୍, ମାଇଲେଜ୍ କିମ୍ବା ପୋଲିସ୍ ବିଷୟରେ ପଚାରନ୍ତୁ...' : 'गाड़ी नंबर, इंजन, टायर, टोल, प्रेसिडेंट, पंप, ढाबा या पुलिस के बारे में पूछें...')
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 hover:from-rose-500 hover:to-pink-500 disabled:opacity-40 text-white font-bold rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer hover:scale-105 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Daily Report Modal Popup */}
        {dailyReportModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs p-5 flex flex-col justify-between overflow-y-auto">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-rose-600" />
                  {dailyReportModal.title}
                </h4>
                <button
                  type="button"
                  onClick={() => setDailyReportModal(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {dailyReportModal.summary}
              </p>

              {/* Metrics */}
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1.5 uppercase tracking-wider">
                  {language === 'en' ? 'Key Metrics' : language === 'or' ? 'ମୁଖ୍ୟ ମେଟ୍ରିକ୍ସ' : 'मुख्य मेट्रिक्स'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(dailyReportModal.metrics || {}).map(([k, v]: any) => (
                    <div key={k} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">{k}</span>
                      <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <span className="text-[11px] text-slate-500 font-semibold block mb-1.5 uppercase tracking-wider">
                  {language === 'en' ? 'AI Recommendations & Route Optimization' : language === 'or' ? 'ଏଆଇ ପରାମର୍ଶ ଓ ରୁଟ୍ ବିବରଣୀ' : 'एआई परिचालन एवं रूट अनुशंसाएं'}
                </span>
                <div className="space-y-1.5 text-xs text-slate-800">
                  {dailyReportModal.recommendations?.map((r: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => speakText(dailyReportModal.summary)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  आवाज में सुनें
                </button>
                <button
                  type="button"
                  onClick={() => setDailyReportModal(null)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 cursor-pointer hover:from-rose-500 hover:to-pink-500"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
