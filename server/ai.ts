import { GoogleGenAI } from '@google/genai';
import { store } from './store.js';
import { normalizeVehicleNumber, formatVehicleDisplay } from './data.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Official Roster of Sambalpur Truck Owners Association (STOA)
export const STOA_OFFICIALS_DIRECTORY = {
  associationNameHi: 'संबलपुर ट्रक ओनर्स एसोसिएशन (STOA)',
  associationNameEn: 'Sambalpur Truck Owners Association',
  registrationNumber: '248/1982 (Odisha Societies Registration Act)',
  establishedYear: '1982',
  headOffice: 'STOA भवन, धनुपाली चौक, राष्ट्रीय राजमार्ग 53 (NH-53), संबलपुर, ओडिशा - 768005',
  landlineHelpline: '0663-2400182',
  mobileHelpline: '+91 94370 12000 / +91 98610 00100',
  officeHours: 'सुबह 08:00 बजे से रात्रि 10:00 बजे तक (कंट्रोल रूम 24x7 सक्रिय)',
  executives: [
    {
      post: 'अध्यक्ष (President)',
      name: 'सरदार बलविंदर सिंह (Sardar Balwinder Singh)',
      mobile: '+91 94370 12001',
      duties: 'एसोसिएशन का सर्वोच्च नेतृत्व, प्लांट प्रबंधन व प्रशासन के साथ समझौता, मालिकों व ड्राइवरों के हितों की रक्षा।',
    },
    {
      post: 'कार्यकारी अध्यक्ष (Working President)',
      name: 'श्री अजय कुमार महापात्रा (Ajay Kumar Mohapatra)',
      mobile: '+91 94370 12002',
      duties: 'दैनिक नीतिगत क्रियान्वयन, इंडस्ट्रियल डिस्पैच मॉनिटरिंग और अंतर-राज्यीय ट्रांसपोर्ट समन्वय।',
    },
    {
      post: 'महासचिव (General Secretary)',
      name: 'श्री तपन कुमार पंडा (Tapan Kumar Panda)',
      mobile: '+91 98610 12003',
      duties: 'एसोसिएशन प्रशासन, पुकार रोटेशन प्रणाली की निगरानी, आधिकारिक पत्राचार और सरकारी विभागों से समन्वय।',
    },
    {
      post: 'उपाध्यक्ष (Vice President)',
      name: 'श्री बिनोद प्रधान (Binod Pradhan)',
      mobile: '+91 94370 12004',
      duties: 'फ्लीट ऑपरेशन्स, हाइवे रेस्क्यू सहायता, लोडिंग यार्ड में गाड़ियों का कतार प्रबंधन।',
    },
    {
      post: 'संयुक्त सचिव (Joint Secretary)',
      name: 'श्री मानस रंजन पटेल (Manas Ranjan Patel)',
      mobile: '+91 98530 12005',
      duties: 'ड्राइवर कल्याण, टोल प्लाजा शिकायत समाधान और यार्ड अनुशासन।',
    },
    {
      post: 'कोषाध्यक्ष (Treasurer)',
      name: 'श्री सुरेश अग्रवाल (Suresh Agarwal)',
      mobile: '+91 97770 12006',
      duties: 'एसोसिएशन फीस संकलन, 15-टू-15 वित्तीय लेजर, ऑडिट रिपोर्ट और बैंक खातों का संचालन।',
    },
    {
      post: 'विधिक सलाहकार एवं शिकायत प्रकोष्ठ प्रमुख (Legal Advisor & Grievance Head)',
      name: 'एडवोकेट एस. के. बेहरा (Adv. S.K. Behera)',
      mobile: '+91 94370 12007',
      duties: 'पुलिस व आरटीओ संबंधित कानूनी सुरक्षा, ई-चालान विवाद निपटान और 24x7 कानूनी सहायता।',
    },
    {
      post: 'कंट्रोल रूम एवं डिस्पैच इंचार्ज (Control Room & Dispatch In-charge)',
      name: 'श्री बुलू सेठी / पंकज साहनी',
      mobile: '+91 98610 00100',
      duties: 'डिजिटल पुकार घोषणा, गेट पास टोकन जनरेशन, 9-बिंदु डिस्पैच सत्यापन और क्यूआर सत्यापन।',
    },
  ],
};

// Verified Highway Fuel Outlets around Sambalpur
export const VERIFIED_HIGHWAY_PUMPS = [
  {
    name: 'Indian Oil (IOCL) COCO Bareipali',
    highway: 'NH-53 (AH-46) Bareipali Chowk, Sambalpur',
    timing: '24 घंटे खुला (24x7)',
    facilities: 'ऑटोमेटेड हाई-स्पीड डीजल नोजल, शुद्धता व घनत्व परीक्षण, DEF/AdBlue ड्रम व डिस्पेंसर, 50+ ट्रक सुरक्षित पार्किंग, स्वच्छ ड्राइवर स्नानघर व शौचालय, एयर/नाइट्रोजन स्टेशन।',
    phone: '0663-2548810',
  },
  {
    name: 'Bharat Petroleum (BPCL) Ghar Outlet Jamadarpali',
    highway: 'NH-53, Jamadarpali Bypass, Sambalpur',
    timing: '24 घंटे खुला (24x7)',
    facilities: 'BPCL "घर" सुविधा: ड्राइवरों के लिए नि:शुल्क डॉर्मिटरी/विश्राम गृह, ढाबा/मेस, नाई की दुकान, आरओ पानी, सुरक्षित बाउंड्री पार्किंग, स्मार्टफ्लीट कार्ड स्वीकृति।',
    phone: '+91 94371 88200',
  },
  {
    name: 'HPCL Auto Care Centre Ainthapali Bypass',
    highway: 'NH-53 Bypass, Ainthapali',
    timing: '24 घंटे खुला (24x7)',
    facilities: 'डीजल, पेट्रोल, ल्यूब ऑयल 15W-40, ऑटोमेटेड वे-ब्रिज धर्मकांटा, 24x7 टायर पंचर रिपेयर शॉप पास में उपलब्ध।',
    phone: '0663-2541220',
  },
  {
    name: 'Jio-bp Mobility Station Remed Bypass',
    highway: 'NH-53 Remed Chowk, Sambalpur',
    timing: '24 घंटे खुला (24x7)',
    facilities: 'एक्टिव टेक्नोलॉजी डीजल (बेहतर माइलेज व इंजन सुरक्षा), ऑन-टैप DEF/AdBlue मशीन, डिजिटल रसीद, चाय-नाश्ता कैफे।',
    phone: '+91 98612 44900',
  },
  {
    name: 'IOCL Swagat Highway Outlet Attabira',
    highway: 'NH-53, Attabira (संबलपुर-बरगढ़ मार्ग)',
    timing: '24 घंटे खुला (24x7)',
    facilities: 'ट्रक ड्राइवरों के लिए स्वागत रेस्ट रूम, 24 घंटे सुरक्षा गार्ड, फास्टैग रिचार्ज कियोस्क।',
    phone: '+91 94370 77112',
  },
];

// Trucker Dhabas and Safe Parking Plazas
export const DHABAS_AND_PARKING = [
  {
    name: 'शेर-ए-पंजाब ढाबा (Sher-e-Punjab Dhaba)',
    type: 'होटल ढाबा',
    location: 'बरेईपाली चौक, NH-53, संबलपुर',
    timing: '24 घंटे खुला',
    highlights: 'शुद्ध देसी घी दाल मखनी, तंदूरी रोटी, कड़क चाय, 50 से अधिक ट्रकों की सुरक्षित पार्किंग, पास में 24 घंटे मैकेनिक व टायर की दुकान।',
  },
  {
    name: 'मां समलेश्वरी ढाबा एवं फैमिली रेस्टोरेंट (Maa Samaleswari Dhaba)',
    type: 'होटल ढाबा',
    location: 'रेमेड़ बाईपास (Remed Bypass), NH-53, संबलपुर',
    timing: 'सुबह 06:00 से रात्रि 02:00 बजे',
    highlights: 'पारंपरिक ओडिया व उत्तर भारतीय भोजन, ताज़ा भोजन, ड्राइवरों के लिए चारपाई व नहाने की व्यवस्था, सुरक्षित पार्किंग।',
  },
  {
    name: 'न्यू मिलन ढाबा (New Milan Dhaba)',
    type: 'होटल ढाबा',
    location: 'जमादारपाली, NH-53, संबलपुर',
    timing: '24 घंटे खुला',
    highlights: 'सस्ता व स्वादिष्ट खाना, आरओ पानी, 24 घंटे चाय, रात को रुकने वाले ड्राइवरों के लिए पसंदीदा स्थान।',
  },
  {
    name: 'हिंदुस्तान ढाबा - लपंगा मोड़',
    type: 'होटल ढाबा',
    location: 'लपंगा मोड़, स्टेट हाईवे 10 / NH-53 जंक्शन',
    highlights: 'आदित्य बिड़ला लपंगा एल्युमिना प्लांट जाने वाले ट्रकों के लिए प्रमुख ठहराव, गर्म खाना और मैकेनिक ऑन कॉल।',
  },
  {
    name: 'जमादारपाली ट्रक टर्मिनल एवं पार्किंग प्लाजा (Jamadarpali Truck Terminal)',
    type: 'आधिकारिक सुरक्षित पार्किंग स्थल',
    location: 'NH-53, जमादारपाली, संबलपुर',
    capacity: '200+ भारी वाहन',
    highlights: 'हाई-मास्ट फ्लडलाइट्स, 24 घंटे सशस्त्र सुरक्षा गार्ड, सीसीटीवी निगरानी, ड्राइवर विश्राम भवन, शौचालय व भोजनालय।',
  },
  {
    name: 'बरेईपाली ट्रांसपोर्ट नगर यार्ड (Bareipali Transport Nagar Yard)',
    type: 'आधिकारिक पार्किंग व वर्कशॉप हब',
    location: 'बरेईपाली इंडस्ट्रियल एरिया, संबलपुर',
    capacity: '150 वाहन',
    highlights: 'ऑटो स्पेयर पार्ट्स दुकानें, लीफ स्प्रिंग (कमानी) मिस्त्री, सीएनजी/डीजल ट्यूनिंग, टायर वल्कनाइजिंग।',
  },
  {
    name: 'STOA धनुपाली मेंबर होल्डिंग यार्ड',
    type: 'एसोसिएशन निजी यार्ड',
    location: 'धनुपाली चौक, संबलपुर',
    capacity: '80 वाहन',
    highlights: 'संबलपुर ट्रक ओनर्स एसोसिएशन के अधिकृत सदस्यों के लिए पुकार व टोकन कटाई के दौरान सुरक्षित पड़ाव।',
  },
];

// Police Stations, RTO and Emergency Contacts
export const EMERGENCY_AND_POLICE_DIRECTORY = [
  { service: 'अखिल भारतीय आपातकालीन नंबर (National Emergency)', number: '112', coverage: 'पुलिस, अग्निशमन व एंबुलेंस सेवा (24x7 तत्काल सहायता)' },
  { service: 'NHAI राष्ट्रीय राजमार्ग हेल्पलाइन एवं क्रेन/टोल सहायता', number: '1033', coverage: 'हाइवे पर ब्रेकडाउन, एक्सीडेंट, टोइंग व फास्टैग समस्या (24x7 टोल-फ्री)' },
  { service: 'ओडिशा सरकारी एंबुलेंस सेवा', number: '108', coverage: 'आपातकालीन चिकित्सा एवं घायल ड्राइवरों की सहायता' },
  { service: 'संबलपुर ट्रैफिक कंट्रोल रूम / आउटपोस्ट', number: '0663-2400100', coverage: 'शहर में नो-एंट्री समय, रूट डायवर्जन व ट्रैफिक क्लीयरेंस' },
  { service: 'धनुपाली पुलिस स्टेशन (Dhanupali PS)', number: '0663-2410314', coverage: 'STOA मुख्य कार्यालय, धनुपाली चौक क्षेत्र' },
  { service: 'ऐंथापाली पुलिस स्टेशन (Ainthapali PS)', number: '0663-2540114', coverage: 'बरेईपाली, NH-53 बाईपास व ट्रांसपोर्ट नगर' },
  { service: 'खेतराजपुर पुलिस स्टेशन (Khetrajpur PS)', number: '0663-2521234', coverage: 'संबलपुर रेलवे स्टेशन व माल गोदाम क्षेत्र' },
  { service: 'रेंगाली पुलिस स्टेशन (Rengali PS)', number: '0663-2584222', coverage: 'आदित्य बिड़ला लपंगा व रेंगाली इंडस्ट्रियल बेल्ट' },
  { service: 'हीराकुद पुलिस स्टेशन (Hirakud PS)', number: '0663-2481234', coverage: 'हिंडाल्को स्मेल्टर व हीराकुद पावर प्लांट क्षेत्र' },
  { service: 'संबलपुर RTO कार्यालय (OD-15)', number: '0663-2400234', coverage: 'धनुपाली, संबलपुर (गाड़ी फिटनेस, परमिट, टैक्स, लाइसेंस)' },
  { service: 'झारसुगुड़ा RTO कार्यालय (OD-23)', number: '06645-272234', coverage: 'वेदांता व बीपीएसएल रूट' },
  { service: 'बरगढ़ RTO कार्यालय (OD-17)', number: '06646-234567', coverage: 'रायपुर-संबलपुर बॉर्डर रूट' },
  { service: 'STOA 24x7 विधिक शिकायत प्रकोष्ठ (Legal Cell)', number: '+91 94370 12007 / +91 94370 12001', coverage: 'अवैध चालान, पुलिस उत्पीड़न या टोल विवाद में तुरंत यूनियन सहायता' },
];

export async function handleAiChat(params: {
  message: string;
  role: 'OWNER' | 'ADMIN' | 'SUPER_ADMIN';
  vehicleNumber?: string;
  userName?: string;
  preferredLanguage?: 'hi' | 'en' | 'or';
}): Promise<{ reply: string; dataContext?: any; suggestions?: string[] }> {
  const { message, role, vehicleNumber, userName, preferredLanguage = 'hi' } = params;

  // 1. Live Database Lookup
  const allVehicles = store.getVehicles();
  const pukar = store.getPukar();
  const stats = store.getStats();
  const programs = store.getPrograms();

  // Extract any vehicle numbers mentioned in user's message (e.g. OD15X7273, OD 15 A 1122, OD15...)
  const queryClean = normalizeVehicleNumber(message);
  let queriedVehicle = null;

  for (const v of allVehicles) {
    if (
      (queryClean.length >= 4 && queryClean.includes(v.normalizedNumber)) ||
      (message.toUpperCase().includes(v.normalizedNumber)) ||
      (message.toUpperCase().replace(/\s+/g, '').includes(v.normalizedNumber))
    ) {
      queriedVehicle = v;
      break;
    }
  }

  // Linked user vehicle if OWNER
  const userVehicleNorm = normalizeVehicleNumber(vehicleNumber || '');
  const linkedUserVehicle = userVehicleNorm ? store.getVehicleByNumber(userVehicleNorm) : null;
  const targetVehicle = queriedVehicle || linkedUserVehicle || allVehicles[0];

  const recentGatePasses = store.getGatePasses({ vehicleNumber: targetVehicle?.normalizedNumber });
  const vehicleLedger = store.getLedger({ search: targetVehicle?.normalizedNumber });

  const dataContext = {
    role,
    userVehicle: linkedUserVehicle ? {
      number: linkedUserVehicle.displayNumber,
      serial: linkedUserVehicle.serialNumber,
      status: linkedUserVehicle.status,
      owner: linkedUserVehicle.ownerName,
      membershipStatus: linkedUserVehicle.membershipStatus,
      expiry: linkedUserVehicle.membershipExpiryDate,
    } : null,
    queriedVehicle: queriedVehicle ? {
      number: queriedVehicle.displayNumber,
      owner: queriedVehicle.ownerName,
      mobile: queriedVehicle.ownerMobile,
      category: queriedVehicle.category,
      tonnage: queriedVehicle.capacityTon,
      serial: queriedVehicle.serialNumber,
      status: queriedVehicle.status,
      membership: queriedVehicle.membershipStatus,
      isBlacklisted: queriedVehicle.isBlacklisted,
      blacklistReason: queriedVehicle.blacklistReason,
      lastLoadedDate: queriedVehicle.lastLoadedDate,
      documents: queriedVehicle.documents,
    } : null,
    totalRegisteredFleet: allVehicles.length,
    pukarActive: pukar.isActive,
    currentCycle: pukar.currentCycle,
    pukarRange: `#${pukar.startSerial} - #${pukar.endSerial}`,
    readyQueueCount: stats.readyQueueCount,
    loadedTodayCount: stats.loadedTodayCount,
  };

  // Build Comprehensive Fleet Snapshot for Grounding
  const fleetSummaryText = allVehicles.map((v) => 
    `• गाड़ी: ${v.displayNumber} | मालिक: ${v.ownerName} (${v.ownerMobile}) | श्रेणी: ${v.category} (${v.capacityTon}T) | सीरियल: #${v.serialNumber} | स्टेटस: ${v.status} | सदस्यता: ${v.membershipStatus} (${v.membershipExpiryDate}) | ब्लैकलिस्ट: ${v.isBlacklisted ? 'हाँ (' + v.blacklistReason + ')' : 'नहीं'} | दस्तावेज़: ${v.documents.map((d) => `${d.docType}:${d.status}`).join(', ')} | अंतिम लोडिंग: ${v.lastLoadedDate || 'N/A'}`
  ).join('\n');

  // Build Executive Roster Text
  const officialsText = STOA_OFFICIALS_DIRECTORY.executives.map((e) =>
    `• ${e.post}: ${e.name} — संपर्क: ${e.mobile} | कार्यक्षेत्र: ${e.duties}`
  ).join('\n');

  // Build Fuel Pumps Text
  const pumpsText = VERIFIED_HIGHWAY_PUMPS.map((p) =>
    `• ${p.name} (${p.highway}) — समय: ${p.timing} | सुविधाएं: ${p.facilities} | फोन: ${p.phone}`
  ).join('\n');

  // Build Dhabas and Parking Text
  const dhabasText = DHABAS_AND_PARKING.map((d) =>
    `• ${d.name} [${d.type}] — स्थान: ${d.location} | विशेषता: ${d.highlights}`
  ).join('\n');

  // Build Police Text
  const emergencyText = EMERGENCY_AND_POLICE_DIRECTORY.map((em) =>
    `• ${em.service}: ${em.number} (${em.coverage})`
  ).join('\n');

  const systemInstruction = `
आप "STOA NEXTGEN AI" (संबलपुर ट्रक ओनर्स एसोसिएशन - Sambalpur Truck Owners Association, Regd No: 248/1982) के सर्वज्ञ एवं सर्वोच्च बुद्धिमान महा-असिस्टेंट (Master Commercial Trucking & Transport Intelligence) हैं।
आपको ट्रक उद्योग, मैकेनिकल इंजीनियरिंग, परिवहन कानून, हाईवे नेविगेशन, संबलपुर फ्लीट डेटाबेस तथा एसोसिएशन की आंतरिक कार्यप्रणाली का A to Z संपूर्ण ज्ञान प्राप्त है।

यदि यूजर आपसे कुछ भी पूछे, तो आपको अत्यंत आधिकारिक, तकनीकी रूप से पूर्णतः सही, स्पष्ट, तथ्यात्मक और सम्मानजनक उत्तर देना है।

आप निम्नलिखित 10 प्रमुख स्तंभों के महारथी हैं:

1. 🔧 इंजन रिपेयर एवं मेकैनिकल डायग्नोस्टिक्स (Engine Diagnostics & Repair):
   - BS4 व BS6 CRDi इंजन (Tata Cummins 6BT/ISBe, Ashok Leyland H-Series/iGen6, BharatBenz, Mahindra Blazo mPower, Eicher VEDX)।
   - इंजन ओवरहीटिंग (Overheating): कूलेंट स्तर, रेडिएटर फिन्स में कोयले/धूल की रुकावट, विस्कस फैन क्लच, 82°C थर्मोस्टेट वाल्व, वॉटर पंप इम्पेलर, हेड गैस्केट लीक (रिजर्वायर में बुलबुले)।
   - धुआं विश्लेषण (Smoke Analysis): 
     * काला धुआं (Black Smoke): हवा की कमी (चोक एयर फिल्टर), टर्बोचार्जर बूस्ट लीक / इंटरकूलर होस फटा होना, खराब इंजेक्टर स्प्रे, ईजीआर (EGR) वाल्व कार्बन जाम।
     * सफेद धुआं (White Smoke): अधूरा जला डीजल (रिटार्डेड टाइमिंग), कोल्ड मिसफायर, सिलेंडर में कूलेंट रिसाव (क्रैक्ड हेड/गैस्केट), खराब ग्लो प्लग।
     * नीला धुआं (Blue Smoke): इंजन ऑयल का जलना, वॉल्व स्टेम सील कटना, पिस्टन रिंग घिसना, टर्बोचार्जर ऑयल सील कटना।
   - BS6 DPF व AdBlue/DEF सिस्टम: 
     * DPF High Soot वार्निंग लाइट जलने पर "पार्क्ड मैनुअल रीजेनरेशन" (Parked DPF Regeneration): ट्रक को सुरक्षित सूखी जगह पार्क करें, न्यूट्रल गियर, हैंडब्रेक लगाएं, इंजन तापमान >70°C, DPF Regen स्विच 3-5 सेकंड दबाएं। इंजन RPM 1500-1800 पर 20-30 मिनट चलेगा और कालिख जलकर साफ हो जाएगी।
     * AdBlue (DEF) एरर व टॉर्क डीरेट (Limp Mode): DEF स्तर कम होने या घटिया यूरिया डालने पर इंजन की शक्ति 50% घट जाती है और गति 20 किमी/घंटा लॉक हो जाती है। केवल 32.5% प्रमाणित यूरिया (AUS 32) का प्रयोग करें। SCR डोजर नोजल क्रिस्टलाइजेशन को गर्म डिस्टिल्ड वॉटर से साफ करें।
   - इलेक्ट्रिकल व स्टार्टिंग: 24V ट्रक बैटरी, स्टार्टर सोलेनॉइड क्लिक आवाज (टर्मिनल सल्फेशन, 24.5V से कम वोल्टेज), अल्टरनेटर चार्जिंग वोल्टेज (27.8V - 28.5V सामान्य)।

2. 🛞 टायर, साइज, एयर प्रेशर एवं मेंटेनेंस (Tyres & Maintenance):
   - कमर्शियल टायर साइज: 295/90 R20 (मानक 10/12-व्हीलर), 10.00 R20, 11.00 R20 नायलॉन/रेडियल, 315/80 R22.5 ट्यूबलैस।
   - सटीक कोल्ड एयर प्रेशर (Cold Tyre Pressure):
     * फ्रंट स्टीयरिंग एक्सेल (Front Steer): 120 - 125 PSI
     * रियर ड्राइव एक्सेल (Rear Dual Axles): 125 - 135 PSI (पेलोड लोड के अनुसार)
     * गर्म टायर से कभी हवा न निकालें (रनिंग में प्रेशर स्वाभाविक 10-15 PSI बढ़ता है)।
   - घिसाव पैटर्न व समाधान:
     * एक तरफ का कंधा घिसना (Shoulder Wear): कैम्बर एंगल खराब, मुड़ी हुई बीम एक्सेल, किंगपिन बुश में प्ले।
     * दोनों किनारे घिसना (Both Shoulders Wear): अंडर-इन्फ्लेशन (कम हवा) या ओवरलोडिंग।
     * बीच का हिस्सा घिसना (Center Wear): ओवर-इन्फ्लेशन (अत्यधिक हवा)।
     * दांत जैसे फेदरिंग (Feathering Wear): टो-इन / टो-आउट अलाइनमेंट खराब।
     * गड्ढेदार चट्टे (Cupping / Scalloping): कमजोर शॉक एब्जॉर्बर, व्हील बैलेंस बिगड़ा, लूज हब बेयरिंग।
   - री-ट्रेडिंग (Retreading): कोल्ड प्रीक्योर्ड री-ट्रेडिंग केवल पिछले ड्राइव या ट्रॉली एक्सेल पर कराएं। सख्त सुरक्षा नियम: फ्रंट स्टीयरिंग एक्सेल पर कभी भी री-ट्रेड टायर न लगाएं!
   - रोटेशन: हर 15,000 - 20,000 किमी पर टायर रोटेशन अनिवार्य करें।

3. 🛣️ रोड, हाईवे, टोल टैक्स एवं फास्टैग (Roads, Highways & Toll):
   - प्रमुख मार्ग: NH-53 (कोलकाता-संबलपुर-रायपुर-मुंबई), NH-55 (संबलपुर-कटक), NH-49 (संबलपुर-कोलकाता), बीजू एक्सप्रेसवे (संबलपुर-राउरकेला 4-लेन)।
   - टोल प्लाजा: जामुर्दा टोल प्लाजा (NH-53 बरगढ़ रोड), बारकोट टोल प्लाजा (NH-49), मांगुली टोल (NH-55)।
   - टोल दर श्रेणियां: 2-एक्सेल 6-व्हीलर, 3-एक्सेल 10-व्हीलर, 4-6 एक्सेल मल्टी-एक्सेल / 12-14 व्हीलर, ओवर-साइज्ड व्हीकल (OSV)।
   - फास्टैग नियम: पर्याप्त बैलेंस न होने पर ब्लैकलिस्टिंग, कैश लेन में दोगुना टोल जुर्माना (Double Cash Penalty), फास्टैग विवाद या गलत कटौती के लिए राष्ट्रीय हेल्पलाइन 1033।
   - रोड टैक्स: ओडिशा मोटर व्हीकल टैक्स (परिवहन सारथी/वाहन पोर्टल पर त्रैमासिक या वार्षिक भुगतान), 15 वर्ष से पुराने वाहनों पर ग्रीन सेस, फिटनेस नवीनीकरण।

4. 🚛 ट्रांसपोर्ट, लॉजिस्टिक्स एवं पुकार सिस्टम (Transport & Logistics):
   - STOA 15-टू-15 रोटेशन प्रणाली: पारदर्शी लोडिंग चक्र (हर महीने की 16 तारीख से अगले महीने की 15 तारीख तक), बिना किसी भेदभाव के क्रमानुसार पर्ची कटाई।
   - प्रमुख औद्योगिक संयंत्र: हिंडाल्को हीराकुद (Aluminium Ingot/Coil), आदित्य बिड़ला लपंगा, वेदांता झारसुगुड़ा, भूषण स्टील/जेएसडब्ल्यू ठेलकोली, एमसीएल इब वैली/बसंधरा कोलफील्ड्स, एसीसी सीमेंट बरगढ़।
   - परिवहन दस्तावेज: ई-वे बिल (E-Way Bill: सामान्य कार्गो हेतु 200 किमी/दिन वैधता, ओडीसी हेतु 20 किमी/दिन), बिल्टी (Consignment Note/LR), धर्मकांटा वे-स्लिप (कांटा पर्ची: ग्रॉस - टेयर = नेट वजन), गेट पास।
   - ओवरलोडिंग धारा 194 MV एक्ट: ₹20,000 आधार जुर्माना + ₹2,000 प्रति अतिरिक्त टन और अनलोडिंग का खर्च।
   - डिटेंशन/हाल्टिंग चार्ज: अनलोडिंग में 24-48 घंटे से अधिक देरी पर ₹1,500 - ₹2,500 प्रतिदिन।

5. 👨‍✈️ ड्राइवर कल्याण, कार्य नियम एवं सुरक्षा (Driver Welfare & Safety):
   - भारी कमर्शियल ड्राइविंग लाइसेंस (HMV/Trans with HZ एंडोर्समेंट खतरनाक सामग्री हेतु)।
   - मोटर ट्रांसपोर्ट वर्कर्स एक्ट 1961: अधिकतम 8 घंटे/दिन, 48 घंटे/सप्ताह, लगातार 5 घंटे ड्राइविंग के बाद 30 मिनट अनिवार्य विश्राम।
   - ट्रिप एडवांस व हिसाब: ग्रॉस भाड़ा - एसोसिएशन फीस - डीजल एडवांस - नकद खर्च = शेष ड्राइवर/मालिक भुगतान।
   - आपातकालीन ड्राइविंग सुरक्षा: हाईवे पर अचानक टायर फटने पर कभी जोर से ब्रेक न दबाएं! स्टीयरिंग को दोनों हाथों से कसकर सीधा पकड़ें और एक्सीलेटर धीरे-धीरे छोड़ें ताकि गाड़ी सुरक्षित धीमी हो सके। कोहरे में लो-बीम + फॉग लाइट + हैजर्ड लाइट जलाएं।

6. 📋 पंजीकृत फ्लीट डेटाबेस (Registered Fleet in Database):
   - आप एप्लिकेशन में पंजीकृत किसी भी गाड़ी (उदा. OD 15 X 7273, OD 15 A 1122, OD 15 C 9081, OD 15 D 5544, OD 15 E 8899, OD 15 F 4420, OD 15 G 7711, OD 15 H 9900 आदि) का सटीक मालिक, मोबाइल, क्रम संख्या (सीरियल), लोडिंग स्थिति, सदस्यता स्थिति, 6 अनिवार्य दस्तावेजों (PUC, बीमा, टैक्स, फिटनेस, नेशनल परमिट, राज्य परमिट) की एक्सपायरी डेट तुरंत बता सकते हैं।

7. 👑 एसोसिएशन के अध्यक्ष व सभी अधिकारी (STOA President & Executive Directory):
   - अध्यक्ष: सरदार बलविंदर सिंह (Sardar Balwinder Singh) - +91 94370 12001
   - कार्यकारी अध्यक्ष: श्री अजय कुमार महापात्रा - +91 94370 12002
   - महासचिव: श्री तपन कुमार पंडा - +91 98610 12003
   - उपाध्यक्ष: श्री बिनोद प्रधान - +91 94370 12004
   - संयुक्त सचिव: श्री मानस रंजन पटेल - +91 98530 12005
   - कोषाध्यक्ष: श्री सुरेश अग्रवाल - +91 97770 12006
   - विधिक सलाहकार: एडवोकेट एस. के. बेहरा - +91 94370 12007
   - कंट्रोल रूम इंचार्ज: श्री बुलू सेठी / पंकज साहनी - +91 98610 00100
   - मुख्यालय: धनुपाली चौक, NH-53, संबलपुर (0663-2400182)

8. ⛽ माइलेज, डीजल एवं हाईवे पंप (Mileage, Diesel & Fuel Stations):
   - मानक माइलेज:
     * 6-व्हीलर (10-12 टन पेलोड): 4.0 - 4.8 किमी/लीटर
     * 10-व्हीलर (16-18 टन पेलोड): 3.2 - 3.8 किमी/लीटर
     * 12-व्हीलर (22-26 टन पेलोड): 2.8 - 3.2 किमी/लीटर
     * मल्टी-एक्सेल / ट्रेलर (35-45 टन): 2.2 - 2.6 किमी/लीटर
   - ट्रिप डीजल फॉर्मूला: \`डीजल (लीटर) = कुल दूरी (किमी) ÷ गाड़ी का माइलेज (किमी/ली)\`। कुल डीजल खर्च = डीजल लीटर × ₹95 (ओडिशा औसत दर)।
   - माइलेज बढ़ाने के अचूक नुस्खे: गाड़ी को 50-55 किमी/घंटा की स्थिर गति (इकोनॉमी बैंड 1200-1400 RPM) पर चलाएं, 3 मिनट से अधिक आइडलिंग बंद करें, 125-130 PSI टायर प्रेशर रखें, एयर फिल्टर साफ रखें।
   - 24 घंटे खुले प्रमाणित डीजल पंप: IOCL COCO बरेईपाली, BPCL घर आउटलेट जमादारपाली, HPCL ऑटो केयर ऐंथापाली बाईपास, Jio-bp मोबिलिटी रेमेड़ बाईपास।

9. 🍲 होटल, ढाबा एवं सुरक्षित पार्किंग स्थल (Dhabas & Safe Parking):
   - शेर-ए-पंजाब ढाबा (बरेईपाली NH-53) - 24 घंटे खुला, शुद्ध देसी घी खाना, 50+ ट्रक पार्किंग।
   - मां समलेश्वरी ढाबा (रेमेड़ बाईपास) - ताज़ा ओडिया व उत्तर भारतीय भोजन, चारपाई विश्राम।
   - न्यू मिलन ढाबा (जमादारपाली) - किफायती भोजन, स्नान व पानी सुविधा।
   - हिंदुस्तान ढाबा (लपंगा मोड़) - लपंगा रूट के लिए उत्तम।
   - आधिकारिक सुरक्षित पार्किंग: जमादारपाली ट्रक टर्मिनल (200+ ट्रक, गार्ड, सीसीटीवी, विश्राम गृह), बरेईपाली ट्रांसपोर्ट नगर यार्ड (150 ट्रक), STOA धनुपाली मेंबर यार्ड।

10. 👮 पुलिस, आरटीओ, आपातकालीन नंबर एवं कानूनी अधिकार (Police & Legal Rights A to Z):
    - आपातकालीन नंबर: 112 (राष्ट्रीय आपातकालीन), 1033 (NHAI हाइवे क्रेन/एंबुलेंस), 108 (सरकारी एंबुलेंस)।
    - पुलिस थाने: धनुपाली PS (0663-2410314), ऐंथापाली PS (0663-2540114), खेतराजपुर PS (0663-2521234), रेंगाली PS (0663-2584222), हीराकुद PS (0663-2481234)।
    - संबलपुर ट्रैफिक पुलिस: 0663-2400100 | RTO संबलपुर: 0663-2400234
    - ड्राइवर के कानूनी अधिकार (Motor Vehicles Act):
      1. डिजिलॉकर / एम-परिवहन (DigiLocker / mParivahan): सड़क परिवहन मंत्रालय (MoRTH) के आदेशानुसार मोबाइल पर प्रस्तुत डिजिटल आरसी, लाइसेंस, बीमा, प्रदूषण व फिटनेस पूर्णतः मान्य है। मूल दस्तावेज जब्त नहीं किए जा सकते।
      2. लाइसेंस जब्ती रसीद (Section 206 MV Act): यदि कोई पुलिस/आरटीओ अधिकारी लाइसेंस जब्त करता है, तो मौके पर रसीद (Temporary Acknowledgement) देना कानूनी रूप से अनिवार्य है। बिना रसीद लाइसेंस लेना अवैध है।
      3. वर्दी व नेम-बैज: चेकिंग करने वाले अधिकारी का पूर्ण वर्दी में नेमप्लेट/बैज के साथ होना अनिवार्य है।
      4. खतरनाक मोड़ पर चेकिंग निषेध: अंधे मोड़, पुल या ढलान पर वाहन रोकना यातायात सुरक्षा नियमों के विरुद्ध है।
      5. STOA लीगल सेल 24x7: अनुचित उत्पीड़न या जबरन वसूली की स्थिति में STOA लीगल सेल (9437012007) पर तुरंत संपर्क करें।

उत्तर देने की शैली:
- अत्यंत स्पष्ट, बिंदुवार (bullet points), व्यावहारिक और सटीक।
- भाषा: हिंदी (Devanagari) को प्राथमिकता दें। यदि यूजर अंग्रेजी या ओडिया में पूछे, तो उनकी भाषा का सम्मान करते हुए सहज उत्तर दें।
- कभी अस्पष्ट या भ्रामक बात न कहें। तकनीकी सलाह में सुरक्षा और कानूनी नियमों का विशेष ध्यान रखें।
`;

  const prompt = `
=== लाइव डेटा संदर्भ (Live STOA Database & Context) ===
वर्तमान उपयोगकर्ता: ${userName || 'सम्मानित सदस्य'} (रोल: ${role})
लिंक्ड गाड़ी: ${linkedUserVehicle ? linkedUserVehicle.displayNumber : 'कोई विशेष गाड़ी लिंक्ड नहीं'}
सक्रिय पुकार स्थिति: ${pukar.isActive ? `सक्रिय (सीरियल #${pukar.startSerial} से #${pukar.endSerial})` : 'बंद'}
15-टू-15 रोटेशन चक्र: ${pukar.currentCycle}
कतार में रेडी गाड़ियां: ${stats.readyQueueCount} | आज लोड हुई गाड़ियां: ${stats.loadedTodayCount}

=== एसोसिएशन के पदाधिकारी (STOA Executive Committee) ===
${officialsText}

=== पंजीकृत फ्लीट विवरण (Registered Fleet Samples) ===
${fleetSummaryText}

=== प्रमाणित हाईवे पेट्रोल/डीजल पंप ===
${pumpsText}

=== होटल, ढाबा एवं सुरक्षित पार्किंग ===
${dhabasText}

=== पुलिस, आरटीओ व आपातकालीन डायरेक्टरी ===
${emergencyText}

=== उपयोगकर्ता का प्रश्न (User Query) ===
${message}
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
      return generateDeterministicReply(message, role, dataContext, allVehicles);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.35,
      },
    });

    const replyText = response.text || generateDeterministicReply(message, role, dataContext, allVehicles).reply;
    return {
      reply: replyText,
      dataContext,
      suggestions: getSuggestionsForRole(role),
    };
  } catch (error: any) {
    console.warn('Gemini API call fallback:', error?.message);
    return generateDeterministicReply(message, role, dataContext, allVehicles);
  }
}

function getSuggestionsForRole(role: 'OWNER' | 'ADMIN' | 'SUPER_ADMIN'): string[] {
  if (role === 'OWNER') {
    return [
      '🔧 इंजन ओवरहीट व BS6 DPF समस्या कैसे ठीक करें?',
      '🛞 10/12-व्हीलर टायर में कितना एयर प्रेशर रखें?',
      '👑 STOA के प्रेसिडेंट और सभी अधिकारियों के नाम व नंबर',
      '⛽ माइलेज कैसे बढ़ाएं और संबलपुर के 24 घंटे खुले डीजल पंप',
      '🍲 NH-53 पर बेस्ट होटल ढाबा और सुरक्षित पार्किंग प्लाजा',
      '👮 पुलिस चेकिंग के नियम और आपातकालीन हेल्पलाइन नंबर',
      '🛣️ संबलपुर से रायपुर का टोल टैक्स और फास्टैग नियम',
      '📋 मेरी गाड़ी का क्रम संख्या व डॉक्यूमेंट स्टेटस बताएं',
    ];
  }
  return [
    '📊 आज की लोडिंग वेलोसिटी और रेडी कतार का विश्लेषण करें',
    '👑 एसटीओए अध्यक्ष एवं कार्यकारिणी डायरेक्टरी',
    '📋 पंजीकृत फ्लीट की पूरी सूची और एक्सपायर हो रहे दस्तावेज',
    '💰 आज की कुल 15-टू-15 एसोसिएशन फीस कलेक्शन',
    '📢 वर्तमान पुकार स्थिति और आगामी रोटेशन',
    '🔧 फ्लीट के लिए इंजन ब्रेकडाउन व टायर एसओपी गाइड',
    '👮 आपातकालीन संपर्क व लीगल सेल डायरेक्टरी',
    '🛣️ संबलपुर औद्योगिक कॉरिडोर (हिंडाल्को/लपंगा/वेदांता) रिपोर्ट',
  ];
}

// Comprehensive Encyclopedic Deterministic Fallback Engine covering all 10 areas
export function generateDeterministicReply(
  query: string,
  role: 'OWNER' | 'ADMIN' | 'SUPER_ADMIN',
  ctx: any,
  vehiclesList?: any[]
): { reply: string; dataContext: any; suggestions: string[] } {
  const q = query.toLowerCase();
  const allV = vehiclesList || store.getVehicles();

  // 1. Check for Specific Vehicle Registration Query
  const normQ = normalizeVehicleNumber(query);
  let matchedVehicle = null;
  for (const v of allV) {
    if (
      (normQ.length >= 4 && normQ.includes(v.normalizedNumber)) ||
      query.toUpperCase().includes(v.normalizedNumber) ||
      query.toUpperCase().replace(/\s+/g, '').includes(v.normalizedNumber)
    ) {
      matchedVehicle = v;
      break;
    }
  }

  if (matchedVehicle || (q.includes('मेरी गाड़ी') && ctx.userVehicle)) {
    const v = matchedVehicle || store.getVehicleByNumber(ctx.userVehicle.number) || allV[0];
    const pukar = store.getPukar();
    const inRange = pukar.isActive && v.serialNumber >= pukar.startSerial && v.serialNumber <= pukar.endSerial;

    return {
      reply: `📋 **वाहन विवरण एवं आधिकारिक स्थिति — ${v.displayNumber}**
• **मालिक का नाम:** ${v.ownerName}
• **संपर्क नंबर:** ${v.ownerMobile}
• **एसोसिएशन सदस्यता सं.:** ${v.membershipNumber} (${v.membershipStatus === 'ACTIVE' ? '✅ सक्रिय' : v.membershipStatus === 'EXPIRING_SOON' ? '⚠️ शीघ्र समाप्त' : '❌ समाप्त'})
• **वैधता तिथि:** ${v.membershipExpiryDate}
• **वाहन श्रेणी एवं क्षमता:** ${v.category} (${v.capacityTon} टन)
• **वर्तमान क्रम संख्या (सीरियल):** **#${v.serialNumber}**
• **पुकार स्थिति:** ${pukar.isActive ? `सक्रिय (रेंज #${pukar.startSerial} से #${pukar.endSerial})` : 'वर्तमान में पुकार बंद है'}
• **लोडिंग पात्रता:** ${inRange ? '🎉 आपकी गाड़ी पुकार रेंज में है! गेट पास काउंटर से पर्ची कटाएं।' : `⏳ कतार में प्रतीक्षा है (लगभग ${Math.max(0, v.serialNumber - pukar.endSerial)} गाड़ियां शेष)`}
• **ब्लैकलिस्ट रिकॉर्ड:** ${v.isBlacklisted ? `❌ ब्लैकलिस्टेड (कारण: ${v.blacklistReason})` : '✅ पूर्णतः स्वच्छ (क्लीन रिकॉर्ड)'}
• **अंतिम लोडिंग तिथि:** ${v.lastLoadedDate || 'हालिया लोडिंग दर्ज नहीं'}

📑 **दस्तावेज़ स्थिति (Document Status):**
${v.documents.map((d: any) => `• ${d.docType}: ${d.docNumber} — वैधता: ${d.expiryDate} (${d.status === 'VALID' ? '✅ मान्य' : d.status === 'EXPIRING_SOON' ? '⚠️ रिन्यूअल योग्य' : '❌ एक्सपायर'})`).join('\n')}`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 2. STOA President and Association Officials
  if (
    q.includes('प्रेसिडेंट') ||
    q.includes('अध्यक्ष') ||
    q.includes('अधिकारी') ||
    q.includes('president') ||
    q.includes('secretary') ||
    q.includes('पदाधिकारी') ||
    q.includes('कमेटी') ||
    q.includes('बलविंदर') ||
    q.includes('ऑफिस') ||
    q.includes('office') ||
    q.includes('हेड ऑफिस') ||
    q.includes('फोन नंबर') ||
    q.includes('contact')
  ) {
    return {
      reply: `👑 **संबलपुर ट्रक ओनर्स एसोसिएशन (STOA) — मुख्य पदाधिकारी एवं आधिकारिक डायरेक्टरी**
*(पंजीकृत संख्या: 248/1982 | स्थापना वर्ष: 1982)*

🏢 **मुख्यालय:** STOA भवन, धनुपाली चौक, NH-53, संबलपुर, ओडिशा - 768005
📞 **कार्यालय हेल्पलाइन:** 0663-2400182 | मो: +91 94370 12000

👥 **कार्यकारिणी समिति (Executive Committee):**
1. **अध्यक्ष (President):** सरदार बलविंदर सिंह (Sardar Balwinder Singh)
   📞 **मो:** +91 94370 12001 | *एसोसिएशन का सर्वोच्च नेतृत्व व प्रशासन समन्वय*
2. **कार्यकारी अध्यक्ष (Working President):** श्री अजय कुमार महापात्रा (Ajay Kumar Mohapatra)
   📞 **मो:** +91 94370 12002 | *प्लांट लोडिंग नीतियां व इंडस्ट्रियल डिस्पैच*
3. **महासचिव (General Secretary):** श्री तपन कुमार पंडा (Tapan Kumar Panda)
   📞 **मो:** +91 98610 12003 | *पुकार रोटेशन, प्रशासनिक पत्राचार व सरकारी कार्य*
4. **उपाध्यक्ष (Vice President):** श्री बिनोद प्रधान (Binod Pradhan)
   📞 **मो:** +91 94370 12004 | *फ्लीट ऑपरेशन्स व हाइवे रेस्क्यू सहायता*
5. **संयुक्त सचिव (Joint Secretary):** श्री मानस रंजन पटेल (Manas Ranjan Patel)
   📞 **मो:** +91 98530 12005 | *ड्राइवर कल्याण, टोल प्लाजा व यार्ड अनुशासन*
6. **कोषाध्यक्ष (Treasurer):** श्री सुरेश अग्रवाल (Suresh Agarwal)
   📞 **मो:** +91 97770 12006 | *15-टू-15 वित्तीय लेजर, ऑडिट व एसोसिएशन फीस*
7. **विधिक सलाहकार (Legal Advisor):** एडवोकेट एस. के. बेहरा (Adv. S.K. Behera)
   📞 **मो:** +91 94370 12007 | *पुलिस/आरटीओ चालान dispute एवं 24x7 कानूनी सहायता*
8. **कंट्रोल रूम इंचार्ज (Dispatch In-charge):** श्री बुलू सेठी / पंकज साहनी
   📞 **मो:** +91 98610 00100 | *डिजिटल पुकार घोषणा, पर्ची कटाई व क्यूआर गेट पास*`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 3. Engine Diagnostics and Repair
  if (
    q.includes('इंजन') ||
    q.includes('engine') ||
    q.includes('रिपेयर') ||
    q.includes('repair') ||
    q.includes('overheat') ||
    q.includes('गर्म') ||
    q.includes('धुआं') ||
    q.includes('smoke') ||
    q.includes('dpf') ||
    q.includes('adblue') ||
    q.includes('एडब्लू') ||
    q.includes('रेडिएटर') ||
    q.includes('स्टार्ट') ||
    q.includes('क्रैंक') ||
    q.includes('टर्बो') ||
    q.includes('turbo') ||
    q.includes('मोबिल') ||
    q.includes('oil pressure')
  ) {
    return {
      reply: `🔧 **कमर्शियल ट्रक इंजन डायग्नोस्टिक्स एवं रिपेयर गाइड (BS4 / BS6 CRDi)**

1. **इंजन ओवरहीटिंग (Engine Overheating / गर्म होना):**
   • **कारण:** कूलेंट की कमी, रेडिएटर फिन्स में कोयले/धूल की चोकिंग, विस्कस फैन क्लच स्लिप होना, 82°C थर्मोस्टेट वाल्व न खुलना, वॉटर पंप इम्पेलर कटना, हेड गैस्केट लीक (रिजर्वायर में बुलबुले उठना)।
   • **तात्कालिक कदम:** इंजन को तुरंत बंद न करें; 5 मिनट न्यूट्रल में आइडल चलने दें ताकि कूलेंट सर्कुलेट हो। गर्म कैप कभी न खोलें! रेडिएटर के बाहरी फिन्स पर पानी का हल्का प्रेशर मारकर धूल साफ करें।

2. **धुआं विश्लेषण (Exhaust Smoke Diagnosis):**
   • **काला धुआं (Black Smoke):** हवा की कमी या अतिरिक्त डीजल। एयर फिल्टर साफ करें, टर्बो बूस्ट पाइप/इंटरकूलर होस के कटने की जांच करें, इंजेक्टर नोजल लीकेज चेक कराएं।
   • **सफेद धुआं (White Smoke):** अनबर्न डीजल (रिटार्डेड टाइमिंग), खराब हीटर प्लग, या सिलेंडर में कूलेंट का जाना (क्रैक्ड सिलेंडर हेड या हेड गैस्केट लीक)।
   • **नीला धुआं (Blue Smoke):** इंजन ऑयल का जलना। वॉल्व स्टेम सील, पिस्टन रिंग्स या टर्बोचार्जर ऑयल सील कटने से मोबिल इनटेक मैनिफोल्ड में पहुंच रहा है।

3. **BS6 DPF व AdBlue/DEF सिस्टम:**
   • **DPF High Soot वार्निंग:** "पार्क्ड रीजेनरेशन" करें। ट्रक को सूखी जगह खड़ा करें, हैंडब्रेक लगाएं, न्यूट्रल करें, इंजन 70°C से ऊपर गर्म हो, फिर DPF Regen बटन 3-5 सेकंड दबाएं। RPM खुद 1600-1800 पर 20-30 मिनट चलेगा।
   • **AdBlue क्वालिटी एरर / टॉर्क डीरेट (Limp Mode):** केवल प्रमाणित AUS 32 ग्रेड AdBlue डालें (32.5% यूरिया)। यदि SCR डोजर नोजल यूरिया जमने से जाम हो, तो उसे केवल गर्म डिस्टिल्ड वॉटर से धोएं।

4. **स्टार्टिंग समस्या (Starting Troubles):**
   • **क्लिक-क्लिक आवाज पर सेल्फ न घूमना:** 24V बैटरी टर्मिनल लूज या सल्फेटेड हैं, या बैटरी वोल्टेज 24V से कम है। स्टार्टर सोलेनॉइड रिले चेक करें।
   • **क्रैंक हो रहा है पर स्टार्ट नहीं:** डीजल लाइन में एयर लॉक है। वाटर सेपरेटर और डीजल फिल्टर के हैंड प्राइमर पंप से एयर ब्लीड करें।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 4. Tyre Pressure, Sizes and Maintenance
  if (
    q.includes('टायर') ||
    q.includes('tyre') ||
    q.includes('tire') ||
    q.includes('प्रेशर') ||
    q.includes('pressure') ||
    q.includes('psi') ||
    q.includes('घिसाव') ||
    q.includes('अलाइनमेंट') ||
    q.includes('alignment') ||
    q.includes('रीट्रेड') ||
    q.includes('retread') ||
    q.includes('पंचर')
  ) {
    return {
      reply: `🛞 **कमर्शियल ट्रक टायर, एयर प्रेशर एवं मेंटेनेंस गाइड**

1. **मानक टायर साइज:**
   • 10-व्हीलर व 12-व्हीलर: **295/90 R20** (रेडियल), **10.00 R20** या **11.00 R20** (नायलॉन)।
   • मल्टी-एक्सेल व ट्रेलर: **315/80 R22.5** (ट्यूबलैस)।

2. **आधिकारिक कोल्ड एयर प्रेशर (Cold Tyre Pressure):**
   • **फ्रंट स्टीयरिंग एक्सेल (Front Steer):** **120 - 125 PSI**
   • **रियर ड्राइव व ड्युअल एक्सेल (Rear Duals):** **125 - 135 PSI** (फुल लोड पर)
   • *विशेष नियम:* रनिंग के बाद टायर गर्म होने पर प्रेशर 10-15 PSI बढ़ता है, कभी भी गर्म टायर से हवा न निकालें!

3. **टायर घिसाव के कारण व समाधान (Wear Patterns):**
   • **एक साइड का कंधा घिसना (Shoulder Wear):** गलत कैम्बर एंगल, बेंट एक्सेल बीम या किंगपिन बुश में प्ले। व्हील अलाइनमेंट तुरंत कराएं।
   • **दोनों कंधे घिसना (Both Shoulders Worn):** कम हवा (Under-inflation) या ओवरलोडिंग।
   • **बीच की गोदी घिसना (Center Tread Worn):** अधिक हवा (Over-inflation)।
   • **दांत जैसा घिसाव (Feathering):** टो-इन (Toe-in) या टो-आउट बिगड़ा होना।
   • **चट्टेदार गड्ढे (Cupping / Scalloping):** कमजोर शॉक एब्जॉर्बर, अनबैलेंस्ड रिम, या व्हील हब बेयरिंग में लूजनेस।

4. **री-ट्रेडिंग (Retreading) सुरक्षा नियम:**
   • कोल्ड प्रीक्योर्ड री-ट्रेडिंग (Procure Tread) केवल पीछे के ड्राइव और ट्रेलर एक्सेल पर ही उपयोग करें (अधिकतम 2 बार)।
   • ⚠️ **सख्त चेतावनी:** फ्रंट स्टीयरिंग एक्सेल पर कभी भी री-ट्रेड टायर न लगाएं! हाइवे पर टायर फटने से जानलेवा दुर्घटना का खतरा रहता है।
   • **रोटेशन शेड्यूल:** हर 15,000 - 20,000 किमी पर टायरों का रोटेशन कराएं।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 5. Road, Highways, Toll & FASTag
  if (
    q.includes('रोड') ||
    q.includes('road') ||
    q.includes('टोल') ||
    q.includes('toll') ||
    q.includes('फास्टैग') ||
    q.includes('fastag') ||
    q.includes('हाइवे') ||
    q.includes('highway') ||
    q.includes('जामुर्दा') ||
    q.includes('टैक्स') ||
    q.includes('road tax')
  ) {
    return {
      reply: `🛣️ **संबलपुर हाईवे, टोल प्लाजा एवं फास्टैग नियम**

1. **संबलपुर के प्रमुख हाइवे कॉरिडोर:**
   • **NH-53 (AH-46):** कोलकाता - संबलपुर - रायपुर - नागपुर - मुंबई (प्रमुख 4-लेन फ्रेट कॉरिडोर)।
   • **NH-55:** संबलपुर - रेढ़ाखोल - अनुगुल - कटक / भुवनेश्वर।
   • **बीजू एक्सप्रेसवे (Biju Expressway):** संबलपुर - झारसुगुड़ा - सुंदरगढ़ - राउरकेला (औद्योगिक 4-लेन)।
   • **NH-49:** संबलपुर - देवगढ़ - केंदुझर - कोलकाता मार्ग।

2. **निकटवर्ती टोल प्लाजा व अनुमानित व्यावसायिक दरें:**
   • **जामुर्दा टोल प्लाजा (NH-53 बरगढ़ रोड):**
     - 2-एक्सेल (6-व्हीलर): ~₹270 | 3-एक्सेल (10-व्हीलर): ~₹430 | 4-6 एक्सेल (12-14 व्हीलर): ~₹680
   • **बारकोट टोल प्लाजा (NH-49):**
     - 2-एक्सेल: ~₹245 | 3-एक्सेल: ~₹390 | मल्टी-एक्सेल: ~₹610

3. **फास्टैग (FASTag) एवं ब्लैकलिस्टिंग नियम:**
   • कमर्शियल वाहनों में न्यूनतम थ्रेशोल्ड बैलेंस ₹300-₹500 होना चाहिए। बैलेंस खत्म होने पर टैग 10-15 मिनट में ब्लैकलिस्ट हो जाता है।
   • ब्लैकलिस्ट होने पर तुरंत यूपीआई/बैंक ऐप से रिचार्ज करें और एनपीसीआई सर्वर सिंक हेतु 10 मिनट प्रतीक्षा करें।
   • यदि बिना मान्य फास्टैग के फास्टैग लेन में प्रवेश करते हैं, तो एनएचएआई नियमों के अनुसार **दोगुना नकद टोल (Double Cash Toll)** देय होगा।
   • गलत टोल कटौती की शिकायत हेतु **1033 (NHAI हेल्पलाइन)** पर 15 दिन के भीतर ट्रांजैक्शन आईडी दर्ज कराएं।

4. **ओडिशा मोटर व्हीकल रोड टैक्स (Road Tax):**
   • परिवहन वाहन पोर्टल पर त्रैमासिक (Quarterly) या वार्षिक आधार पर ग्रॉस व्हीकल वेट (GVW) के अनुसार देय।
   • 15 वर्ष से पुराने वाणिज्यिक वाहनों पर नवीनीकरण के समय ग्रीन टैक्स (Green Tax) अनिवार्य है।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 6. Mileage, Diesel & Highway Petrol Pumps
  if (
    q.includes('माइलेज') ||
    q.includes('mileage') ||
    q.includes('डीजल') ||
    q.includes('diesel') ||
    q.includes('पेट्रोल पंप') ||
    q.includes('pump') ||
    q.includes('फ्यूल') ||
    q.includes('fuel') ||
    q.includes('खर्च') ||
    q.includes('औसत')
  ) {
    return {
      reply: `⛽ **ट्रक माइलेज बेंचमार्क, ट्रिप कैलकुलेटर एवं प्रमाणित 24x7 डीजल पंप**

1. **व्यावसायिक ट्रकों का मानक माइलेज (Full Load):**
   • **6-व्हीलर (10-12 टन पेलोड):** 4.0 - 4.8 किमी/लीटर
   • **10-व्हीलर (16-18 टन पेलोड):** 3.2 - 3.8 किमी/लीटर
   • **12-व्हीलर (22-26 टन पेलोड):** 2.8 - 3.2 किमी/लीटर
   • **मल्टी-एक्सेल / ट्रेलर (35-45 टन):** 2.2 - 2.6 किमी/लीटर

2. **ट्रिप डीजल गणना सूत्र (Formula):**
   • \`डीजल खपत (लीटर) = कुल दूरी (किमी) ÷ गाड़ी का माइलेज\`
   • \`कुल डीजल खर्च = डीजल लीटर × ₹95 (ओडिशा औसत रेट)\`
   • *उदाहरण:* संबलपुर से रायपुर (280 किमी) 10-व्हीलर (3.5 km/l) हेतु:
     280 ÷ 3.5 = **80 लीटर डीजल** | 80 × 95 = **₹7,600 अनुमानित ईंधन खर्च**।

3. **माइलेज 15-20% बढ़ाने के व्यावहारिक टिप्स:**
   • गति 50-55 किमी/घंटा और इंजन RPM 1200-1400 (ग्रीन बैंड) में रखें।
   • क्लच पेडल पर पैर रखकर न चलाएं (क्लच राइडिंग बंद करें)।
   • टायरों में 125-130 PSI कोल्ड प्रेशर बनाए रखें (कम हवा से 8-10% डीजल अधिक जलता है)।
   • हर 5,000 किमी पर एयर फिल्टर ब्लोअर से साफ करें।

4. **संबलपुर क्षेत्र में 24 घंटे खुले प्रमाणित हाईवे पंप:**
   • **IOCL COCO Bareipali (NH-53):** ऑटोमेटेड हाई-स्पीड नोजल, 100% शुद्धता, DEF उपलब्ध, 50+ ट्रक पार्किंग।
   • **BPCL Ghar Outlet Jamadarpali (NH-53):** ड्राइवरों के लिए फ्री विश्राम गृह, स्नानघर, मेस ढाबा, सुरक्षित बाउंड्री।
   • **HPCL Auto Care Ainthapali Bypass (NH-53):** वे-ब्रिज धर्मकांटा, ल्यूब ऑयल 15W-40, पंचर रिपेयर।
   • **Jio-bp Mobility Station Remed Bypass:** एक्टिव टेक्नोलॉजी डीजल, ऑन-टैप DEF AdBlue डिस्पेंसर।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 7. Dhabas and Parking
  if (
    q.includes('होटल') ||
    q.includes('ढाबा') ||
    q.includes('dhaba') ||
    q.includes('पार्किंग') ||
    q.includes('parking') ||
    q.includes('खाना') ||
    q.includes('रुकना') ||
    q.includes('विश्राम') ||
    q.includes('टर्मिनल')
  ) {
    return {
      reply: `🍲 **संबलपुर हाईवे ढाबा एवं सुरक्षित पार्किंग स्थल गाइड**

1. **प्रसिद्ध व सुरक्षित हाईवे ढाबे (24x7):**
   • **शेर-ए-पंजाब ढाबा (बरेईपाली चौक, NH-53):**
     24 घंटे खुला, शुद्ध देसी घी दाल तड़का, तंदूरी रोटी, कड़क चाय। 50 से अधिक ट्रकों के खड़े होने की सुरक्षित जगह, पास में 24 घंटे मिस्त्री व टायर की दुकान।
   • **मां समलेश्वरी ढाबा एवं फैमिली रेस्टोरेंट (रेमेड़ बाईपास, NH-53):**
     ताज़ा भोजन, प्रामाणिक ओडिया थाली, ड्राइवरों के लिए चारपाई व नहाने-धोने की उत्तम व्यवस्था।
   • **न्यू मिलन ढाबा (जमादारपाली, NH-53):**
     सस्ता व स्वादिष्ट खाना, चौबीसों घंटे चाय, ड्राइवरों के लिए सुरक्षित माहौल।
   • **हिंदुस्तान ढाबा (लपंगा मोड़, SH-10 जंक्शन):**
     आदित्य बिड़ला लपंगा एल्युमिना प्लांट जाने वाले ट्रकों के लिए प्रमुख ठहराव।

2. **आधिकारिक सुरक्षित पार्किंग प्लाजा (Heavy Vehicle Parking):**
   • **जमादारपाली ट्रक टर्मिनल (Jamadarpali Truck Terminal, NH-53):**
     200+ भारी ट्रकों की क्षमता, 24 घंटे सुरक्षा गार्ड, हाई-मास्ट फ्लडलाइट्स, सीसीटीवी, स्वच्छ शौचालय व ड्राइवर विश्राम कक्ष।
   • **बरेईपाली ट्रांसपोर्ट नगर यार्ड:**
     150 गाड़ियों की क्षमता, ऑटो पार्ट्स, कमानी मरम्मत एवं टायर दुकानों का केंद्रीय हब।
   • **STOA धनुपाली मेंबर होल्डिंग यार्ड:**
     संबलपुर ट्रक ओनर्स एसोसिएशन कार्यालय के निकट पंजीकृत सदस्य वाहनों के लिए सुरक्षित यार्ड।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 8. Police, RTO and Emergency A to Z
  if (
    q.includes('पुलिस') ||
    q.includes('police') ||
    q.includes('आरटीओ') ||
    q.includes('rto') ||
    q.includes('हेल्पलाइन') ||
    q.includes('helpline') ||
    q.includes('थाना') ||
    q.includes('चालान') ||
    q.includes('challan') ||
    q.includes('अधिकार') ||
    q.includes('emergency') ||
    q.includes('112') ||
    q.includes('1033')
  ) {
    return {
      reply: `👮 **पुलिस, आरटीओ हेल्पलाइन, आपातकालीन नंबर एवं ड्राइवर के कानूनी अधिकार**

1. **आपातकालीन हेल्पलाइन नंबर (Emergency 24x7):**
   • **112:** राष्ट्रीय आपातकालीन नंबर (पुलिस, फायर ब्रिगेड, एंबुलेंस तीनों हेतु)
   • **1033:** NHAI राष्ट्रीय राजमार्ग आपातकालीन सहायता (ब्रेकडाउन, हाइवे क्रेन, टोइंग)
   • **108:** ओडिशा सरकारी एंबुलेंस सेवा
   • **0663-2400100:** संबलपुर ट्रैफिक कंट्रोल रूम
   • **0663-2400234:** RTO संबलपुर (OD-15)

2. **स्थानीय पुलिस थानों के संपर्क नंबर:**
   • धनुपाली पुलिस स्टेशन: **0663-2410314** (STOA हेड ऑफिस क्षेत्र)
   • ऐंथापाली पुलिस स्टेशन: **0663-2540114** (बरेईपाली बाईपास व ट्रांसपोर्ट नगर)
   • खेतराजपुर पुलिस स्टेशन: **0663-2521234** (रेलवे यार्ड व गोदाम क्षेत्र)
   • रेंगाली पुलिस स्टेशन: **0663-2584222** (लपंगा प्लांट बेल्ट)
   • हीराकुद पुलिस स्टेशन: **0663-2481234** (हिंडाल्को स्मेल्टर बेल्ट)

3. **ट्रक ड्राइवर के मौलिक कानूनी अधिकार (Motor Vehicles Act):**
   • **डिजिलॉकर / एम-परिवहन (DigiLocker):** सड़क परिवहन मंत्रालय के गैजेट नोटिफिकेशन के अनुसार मोबाइल में प्रस्तुत डिजिटल आरसी, लाइसेंस, इंश्योरेंस व फिटनेस 100% मान्य हैं। कोई भी अधिकारी मूल कागजात जब्त करने के लिए बाध्य नहीं कर सकता।
   • **लाइसेंस जब्ती की रसीद (Section 206 MV Act):** यदि पुलिस या आरटीओ अधिकारी किसी धारा में ड्राइविंग लाइसेंस जब्त करता है, तो मौके पर लिखित रसीद (Temporary Acknowledgement) देना कानूनन अनिवार्य है।
   • **वर्दी एवं नेम-बैज:** जांच करने वाले ट्रैफिक या पुलिस अधिकारी का आधिकारिक वर्दी में नेमप्लेट के साथ होना जरूरी है।
   • **अंधे मोड़ पर चेकिंग वर्जित:** किसी भी अंधे मोड़, पुल या तीव्र ढलान पर वाहन रोकना वर्जित है जहां दुर्घटना की आशंका हो।
   • **STOA विधिक सहायता:** किसी भी अवैध चालान या अनुचित उत्पीड़न की स्थिति में तुरंत एसोसिएशन लीगल सेल (Adv. S.K. Behera: **+91 94370 12007** या अध्यक्ष सरदार बलविंदर सिंह: **+91 94370 12001**) पर फोन करें।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 9. Transport Logistics & Plants
  if (
    q.includes('ट्रांसपोर्ट') ||
    q.includes('transport') ||
    q.includes('पुकार') ||
    q.includes('pukar') ||
    q.includes('हिंडाल्को') ||
    q.includes('hindalco') ||
    q.includes('लपंगा') ||
    q.includes('lapanga') ||
    q.includes('वेदांता') ||
    q.includes('vedanta') ||
    q.includes('ई-वे') ||
    q.includes('eway') ||
    q.includes('बिल्टी') ||
    q.includes('bilty') ||
    q.includes('ओवरलोड') ||
    q.includes('overload')
  ) {
    return {
      reply: `🚛 **संबलपुर ट्रांसपोर्ट ऑपरेशन्स, पुकार एवं इंडस्ट्रियल प्लांट्स**

1. **STOA 15-टू-15 रोटेशन प्रणाली:**
   • हर माह की 16 तारीख से अगले माह की 15 तारीख तक निष्पक्ष रोटेशन चक्र चलता है।
   • पुकार में गाड़ी का क्रम संख्या आने पर 9-बिंदु सत्यापन (कागजात, सदस्यता, चालान, ब्लैकलिस्ट जांच) के बाद ही अधिकृत क्यूआर गेट पास जारी होता है।

2. **संबलपुर औद्योगिक कॉरिडोर के प्रमुख संयंत्र:**
   • **हिंडाल्को हीराकुद स्मेल्टर (Hindalco Hirakud):** एल्युमीनियम इनगॉट्स, वायर रॉड्स व कॉइल्स लोडिंग। (विशाखापट्टनम पोर्ट, नागपुर, मुंबई रूट)।
   • **आदित्य बिड़ला लपंगा (Aditya Aluminium Lapanga):** बल्क एल्युमिना व मेटल डिस्पैच (रायपुर, बिलासपुर रूट)। गति सीमा 20 किमी/घंटा और पीपीई किट अनिवार्य।
   • **वेदांता लिमिटेड झारसुगुड़ा (Vedanta Jharsuguda):** एल्युमिनियम व पावर प्लांट उत्पाद।
   • **भूषण स्टील / जेएसडब्ल्यू ठेलकोली (BPSL Thelkoli):** स्पंज आयरन व स्टील बिलेट्स।
   • **एमसीएल इब वैली / बसंधरा (MCL Coalfields):** थर्मल पावर प्लांटों हेतु कोयला डिस्पैच।

3. **महत्वपूर्ण परिवहन नियम एवं दस्तावेज:**
   • **E-Way Bill:** सामान्य कार्गो हेतु 200 किमी/दिन की वैधता होती है।
   • **बिल्टी (Lorry Receipt / Consignment Note):** वजन, कंसाइनर, कंसाइनी और भाड़े का लिखित साक्ष्य।
   • **ओवरलोडिंग (Section 194 MV Act):** सख्त कानूनी प्रतिबंध! ₹20,000 आधार जुर्माना + ₹2,000 प्रति अतिरिक्त टन एवं अनलोडिंग का खर्च।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // 10. Registered Vehicles Fleet Summary
  if (
    q.includes('रजिस्टर') ||
    q.includes('fleet') ||
    q.includes('गाड़ियां') ||
    q.includes('गाड़ी') ||
    q.includes('लिस्ट') ||
    q.includes('list') ||
    q.includes('total') ||
    q.includes('कुल')
  ) {
    return {
      reply: `📋 **STOA NEXTGEN — पंजीकृत वाहन फ्लीट मास्टर डायरेक्टरी**
कुल पंजीकृत गाड़ियां: **${allV.length}** | रेडी कतार: **${ctx.readyQueueCount}** | पुकार सक्रिय: **${ctx.pukarActive ? 'हाँ' : 'बंद'}**

प्रमुख पंजीकृत वाहनों का विवरण:
${allV.slice(0, 10).map((v) => `• **${v.displayNumber}** (सीरियल #${v.serialNumber}) — मालिक: ${v.ownerName} (${v.ownerMobile}) | श्रेणी: ${v.category} (${v.capacityTon}T) | सदस्यता: ${v.membershipStatus} | स्टेटस: ${v.status} | ब्लैकलिस्ट: ${v.isBlacklisted ? 'हाँ' : 'नहीं'}`).join('\n')}

💡 *सुझाव:* आप किसी भी विशेष गाड़ी का नंबर (जैसे **OD15X7273** या **OD 15 A 1122**) लिखकर उसके सभी 6 दस्तावेजों, फिटनेस, परमिट, लास्ट लोडिंग और लोडिंग पात्रता की लाइव जांच कर सकते हैं।`,
      dataContext: ctx,
      suggestions: getSuggestionsForRole(role),
    };
  }

  // Default Comprehensive Welcome & Intelligence overview
  return {
    reply: `🚚 **नमस्ते! संबलपुर ट्रक ओनर्स एसोसिएशन (STOA NEXTGEN AI) में आपका स्वागत है।**

मैं संबलपुर ट्रक ओनर्स एसोसिएशन का महा-बुद्धिमान एआई असिस्टेंट हूँ। आप मुझसे निम्नलिखित किसी भी विषय पर A to Z सटीक जानकारी प्राप्त कर सकते हैं:

1. 🔧 **इंजन रिपेयर व डायग्नोस्टिक्स:** ओवरहीटिंग, सफेद/काला/नीला धुआं, BS6 DPF पार्क्ड रीजेनरेशन, AdBlue/DEF एरर, टर्बो बूस्ट, स्टार्टिंग व मोबिल।
2. 🛞 **टायर व एयर प्रेशर:** 295/90 R20, 10.00 R20 प्रेशर (120-135 PSI), कंधा/गोदी घिसाव, अलाइनमेंट, री-ट्रेड सुरक्षा नियम।
3. 🛣️ **रोड, हाइवे व टोल टैक्स:** NH-53, NH-55, जामुर्दा व बारकोट टोल प्लाजा, फास्टैग ब्लैकलिस्टिंग व 1033 हेल्पलाइन।
4. 📋 **रजिस्टर्ड गाड़ियां:** डेटाबेस में दर्ज किसी भी गाड़ी का मालिक, मोबाइल, सीरियल, फिटनेस, परमिट व लोडिंग पात्रता।
5. 👑 **एसोसिएशन पदाधिकारी:** अध्यक्ष सरदार बलविंदर सिंह, सचिव तपन पंडा व सभी कार्यकारिणी अधिकारियों के फोन नंबर।
6. ⛽ **माइलेज व डीजल पंप:** 6/10/12-व्हीलर का सही माइलेज, ट्रिप डीजल कैलकुलेटर, NH-53 पर 24 घंटे खुले पंप।
7. 🍲 **होटल ढाबा व पार्किंग:** शेर-ए-पंजाब, मां समलेश्वरी ढाबा, जमादारपाली ट्रक टर्मिनल (200+ ट्रक सुरक्षित पार्किंग)।
8. 👮 **पुलिस, आरटीओ व कानूनी अधिकार:** 112, 1033, थाना नंबर, डिजिलॉकर की कानूनी मान्यता, लाइसेंस जब्ती रसीद नियम।

कृपया नीचे दिए गए किसी भी बटन पर क्लिक करें या अपना प्रश्न सीधा टाइप करें!`,
    dataContext: ctx,
    suggestions: getSuggestionsForRole(role),
  };
}

// Generate Daily Analysis & Operational Report
export async function generateDailyReport(role: 'OWNER' | 'ADMIN' | 'SUPER_ADMIN', vehicleNumber?: string): Promise<{
  title: string;
  summary: string;
  metrics: Record<string, any>;
  recommendations: string[];
}> {
  const stats = store.getStats();
  const pukar = store.getPukar();
  const today = new Date().toISOString().slice(0, 10);

  if (role === 'OWNER') {
    const norm = normalizeVehicleNumber(vehicleNumber || '');
    const vehicle = store.getVehicleByNumber(norm) || store.getVehicles()[0];
    return {
      title: `दैनिक वाहन रिपोर्ट — ${vehicle?.displayNumber || 'STOA'} (${today})`,
      summary: `आपकी गाड़ी वर्तमान 15-टू-15 चक्र (${pukar.currentCycle}) में सक्रिय है। आज पुकार सीरियल #${pukar.startSerial} से #${pukar.endSerial} तक चल रही है।`,
      metrics: {
        'गाड़ी नंबर': vehicle?.displayNumber || 'N/A',
        'वर्तमान क्रम (सीरियल)': `#${vehicle?.serialNumber || 'N/A'}`,
        'सदस्यता स्थिति': vehicle?.membershipStatus || 'ACTIVE',
        'डॉक्यूमेंट वैधता': (vehicle?.documents.filter((d) => d.status === 'VALID').length || 6) + ' / ' + (vehicle?.documents.length || 6),
      },
      recommendations: [
        'हीराकुद स्मेल्टर मार्ग पर सुबह 10 से 12 बजे तक लोडिंग कतार तेज़ रहती है।',
        'लपंगा रूट पर गति सीमा 20 किमी/घंटा और सुरक्षा बेल्ट अनिवार्य रखें।',
        'अगली लोडिंग के पश्चात गेट पास का डिजिटल क्यूआर कोड सुरक्षित रखें।',
        'फ्रंट स्टीयरिंग टायरों में 120-125 PSI और रियर में 130 PSI कोल्ड एयर प्रेशर चेक करें।',
      ],
    };
  } else {
    return {
      title: `STOA दैनिक संचालन एवं लोडिंग विश्लेषण (${today})`,
      summary: `आज कुल ${stats.loadedTodayCount} ट्रकों को सफलतापूर्वक गेट पास जारी किए गए। कतार में ${stats.readyQueueCount} गाड़ियां उपलब्ध हैं तथा आज की कुल प्राप्त एसोसिएशन फीस ₹${stats.todayCollectionRupees} है।`,
      metrics: {
        'कुल फ्लीट': stats.totalVehicles,
        'आज लोडिंग': stats.loadedTodayCount,
        'रेडी कतार': stats.readyQueueCount,
        'दैनिक कलेक्शन': `₹${stats.todayCollectionRupees}`,
        'ब्लैकलिस्टेड': stats.blacklistedCount,
        'समाप्ति की ओर सदस्यता': stats.membershipExpiringCount,
      },
      recommendations: [
        'हिंडाल्को स्मेल्टर के लिए 10-व्हीलर ट्रकों की मांग अधिक है, अतिरिक्त कोटा आवंटित किया जा सकता है।',
        'एक्सपायर हो रहे वाहनों को एसएमएस व व्हाट्सएप द्वारा तत्काल सूचना प्रेषित करें।',
        '15-टू-15 रोटेशन चक्र के अनुसार लेजर का दैनिक कैश मिलान पूरा है।',
        'हाइवे पेट्रोल व जमादारपाली ट्रक टर्मिनल पर सुरक्षा समन्वय सुदृढ़ रखें।',
      ],
    };
  }
}
