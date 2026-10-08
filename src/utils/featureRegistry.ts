import { DynamicAppFeature } from '../types/index.js';

export const BUILT_IN_APP_FEATURES: DynamicAppFeature[] = [
  {
    id: 'rto_district_auto_detect',
    nameHi: 'ओडिशा RTO कोड एवं जिला पहचान (OD01-OD35)',
    nameEn: 'Odisha RTO Code & District Detection',
    descriptionHi: 'गाड़ी नंबर इनपुट से OD01 से OD35 तक के आरटीओ कोड व जिला का स्वतः त्रिभाषी (हिन्दी, अंग्रेजी, ओड़िया) पहचान।',
    descriptionEn: 'Automatic detection and multilingual display of Odisha RTO districts from OD01 to OD35.',
    category: 'SYSTEM',
    status: 'ACTIVE',
    routeOrTab: 'auth/owner-login',
    whereShown: 'वाहन पंजीकरण नंबर (Vehicle Registration Number) के ठीक दाईं तरफ',
    version: '1.2.0',
    fields: [
      {
        key: 'autoHighlight',
        labelHi: 'ऑटो-हाइलाइट सक्षम रखें',
        labelEn: 'Enable Auto Highlight',
        type: 'boolean',
        value: true,
      },
      {
        key: 'displayColor',
        labelHi: 'प्रतीक रंग (Hex Code)',
        labelEn: 'Display Color',
        type: 'text',
        value: '#E50046',
      },
    ],
  },
  {
    id: 'pukar_daily_loading',
    nameHi: 'पुकार दैनिक लोडिंग सिस्टम (Pukar Daily Loading)',
    nameEn: 'Pukar Daily Loading System',
    descriptionHi: 'संबलपुर एसोसिएशन की दैनिक लोडिंग सूचना, पारदर्शी रोटेशन क्रम और डिजिटल पुकार पर्ची।',
    descriptionEn: 'Daily loading notices, transparent queue rotation, and digital pukar passes.',
    category: 'PUKAR',
    status: 'ACTIVE',
    routeOrTab: 'owner/pukar',
    whereShown: 'मालिक डैशबोर्ड: पुकार टैब और एडमिन पुकार प्रबंधन',
    version: '2.4.0',
    fields: [
      {
        key: 'autoRefreshIntervalSec',
        labelHi: 'ऑटो-रिफ्रेश अंतराल (सेकंड)',
        labelEn: 'Auto Refresh Interval (Seconds)',
        type: 'number',
        value: 30,
        unit: 'सेकंड',
      },
      {
        key: 'enableLiveMarquee',
        labelHi: 'लाइव पुकार टिकर सक्षम करें',
        labelEn: 'Enable Live Pukar Ticker',
        type: 'boolean',
        value: true,
      },
    ],
  },
  {
    id: 'rotation_15to15_engine',
    nameHi: '15-से-15 चक्र रोटेशन इंजन (Rotation Engine)',
    nameEn: '15-to-15 Rotation Cycle Engine',
    descriptionHi: 'प्रत्येक महीने के 1 से 15 और 16 से महीने के अंत तक के दो चक्रों में गाड़ियों का निष्पक्ष रोटेशन क्रम।',
    descriptionEn: 'Bi-monthly fair rotation queue management (1st-15th and 16th-end).',
    category: 'ROTATION',
    status: 'ACTIVE',
    routeOrTab: 'owner/rotation',
    whereShown: 'मालिक डैशबोर्ड: रोटेशन टैब एवं एडमिन पैनल',
    version: '2.1.0',
    fields: [
      {
        key: 'rotationJumpPenaltySerials',
        labelHi: 'कतार तोड़ने पर पेनल्टी (सीरियल वृद्धि)',
        labelEn: 'Jump Penalty Serial Increase',
        type: 'number',
        value: 10,
        unit: 'सीरियल',
      },
      {
        key: 'absentGraceHours',
        labelHi: 'अनुपस्थिति रियायत समय (घंटे)',
        labelEn: 'Absent Grace Period (Hours)',
        type: 'number',
        value: 24,
        unit: 'घंटे',
      },
    ],
  },
  {
    id: 'election_voting_card',
    nameHi: 'एसोसिएशन द्विवार्षिक चुनाव मतदान कार्ड (Election Voting)',
    nameEn: 'Association Biennial Election Voting',
    descriptionHi: 'द्विवार्षिक चुनाव सक्रिय होने पर मालिक डैशबोर्ड पर गुप्त मतदान एवं उल्टी गिनती (Countdown) कार्ड।',
    descriptionEn: 'Secret ballot voting card and live deadline countdown on Owner dashboard during active elections.',
    category: 'ELECTION',
    status: 'ACTIVE',
    routeOrTab: 'owner/home',
    whereShown: 'मालिक डैशबोर्ड (केवल जब चुनाव सक्रिय हो)',
    version: '1.4.0',
    fields: [
      {
        key: 'showCountdown',
        labelHi: 'मतदान समाप्ति उल्टी गिनती दिखाएं',
        labelEn: 'Show Polling Deadline Countdown',
        type: 'boolean',
        value: true,
      },
      {
        key: 'allowInstantReceipt',
        labelHi: 'डिजिटल मतदान पावती सक्षम रखें',
        labelEn: 'Allow Digital Ballot Receipt',
        type: 'boolean',
        value: true,
      },
    ],
  },
  {
    id: 'gatepass_token_system',
    nameHi: 'डिजिटल गेट पास एवं टोकन बारकोड (Gate Pass System)',
    nameEn: 'Digital Gate Pass & Token System',
    descriptionHi: 'प्लांट गेट पर त्वरित स्कैनिंग हेतु क्यूआर/बारकोड युक्त डिजिटल गेट पास पर्ची।',
    descriptionEn: 'QR & Barcode verified digital loading gate pass for quick plant entry.',
    category: 'BILLING',
    status: 'ACTIVE',
    routeOrTab: 'owner/gatepass',
    whereShown: 'मालिक गेट पास टैब और एडमिन लोडिंग रिकॉर्ड',
    version: '1.9.0',
    fields: [
      {
        key: 'standardFeeUpTo18Ton',
        labelHi: '18 टन तक सामान्य शुल्क (₹)',
        labelEn: 'Standard Fee up to 18 Ton',
        type: 'number',
        value: 50,
        unit: 'रुपये',
      },
      {
        key: 'heavyFeeAbove18Ton',
        labelHi: '18 टन से अधिक भारी शुल्क (₹)',
        labelEn: 'Heavy Truck Fee above 18 Ton',
        type: 'number',
        value: 100,
        unit: 'रुपये',
      },
    ],
  },
  {
    id: 'daily_loading_reports_email',
    nameHi: 'दैनिक लोडिंग रिपोर्ट व ऑटो-ईमेल (Daily Reports & Email)',
    nameEn: 'Daily Loading Report & Auto Email Service',
    descriptionHi: 'दैनिक 8:00 PM पर लोडिंग आंकड़ों की स्वतः समरी रिपोर्ट तैयार करना व पदाधिकारियों को ईमेल प्रेषण।',
    descriptionEn: 'Automated daily report generation with PDF attachment and SMTP email dispatch.',
    category: 'REPORTS',
    status: 'ACTIVE',
    routeOrTab: 'admin/reports',
    whereShown: 'एडमिन पैनल: दैनिक रिपोर्ट प्रबंधक',
    version: '2.0.0',
    fields: [
      {
        key: 'scheduledTime',
        labelHi: 'स्वतः प्रेषण का समय',
        labelEn: 'Scheduled Time (HH:MM)',
        type: 'text',
        value: '20:00',
      },
      {
        key: 'autoEmailEnabled',
        labelHi: 'स्वतः ईमेल भेजना सक्षम करें',
        labelEn: 'Enable Auto Email',
        type: 'boolean',
        value: true,
      },
    ],
  },
  {
    id: 'driver_alert_system',
    nameHi: 'चालक अलर्ट व स्पीड/स्थान सूचना (Driver Live Alerts)',
    nameEn: 'Driver Live Alerts & Speed Warnings',
    descriptionHi: 'संबलपुर-झारसुगुड़ा-अंगुल हाईवे पर ब्लैक स्पॉट, टोल व गति चेतावनी का रीयल-टाइम अलर्ट।',
    descriptionEn: 'Real-time road safety, toll warnings, and speed alerts along critical Odisha transport routes.',
    category: 'SECURITY',
    status: 'ACTIVE',
    routeOrTab: 'owner/driver-alerts',
    whereShown: 'मालिक डैशबोर्ड: अलर्ट टैब',
    version: '1.3.0',
    fields: [
      {
        key: 'enableAudioChime',
        labelHi: 'ऑडियो चेतावनी ध्वनि सक्षम करें',
        labelEn: 'Enable Audio Chime Warning',
        type: 'boolean',
        value: true,
      },
    ],
  },
];

/**
 * Merges existing configured features with the built-in system features.
 */
export function mergeAndDiscoverFeatures(existing: DynamicAppFeature[] = []): {
  merged: DynamicAppFeature[];
  newlyDiscoveredCount: number;
} {
  const merged = [...existing];
  let newlyDiscoveredCount = 0;

  BUILT_IN_APP_FEATURES.forEach((builtin) => {
    const existingIndex = merged.findIndex((f) => f.id === builtin.id);
    if (existingIndex === -1) {
      merged.push({ ...builtin });
      newlyDiscoveredCount++;
    } else {
      // Retain custom admin settings while updating descriptions and field schema
      const curr = merged[existingIndex];
      merged[existingIndex] = {
        ...builtin,
        ...curr,
        fields: builtin.fields?.map((bf) => {
          const matchingField = curr.fields?.find((cf) => cf.key === bf.key);
          return matchingField ? { ...bf, value: matchingField.value } : bf;
        }),
      };
    }
  });

  return { merged, newlyDiscoveredCount };
}

/**
 * Scans the application for registered components and discovers new features.
 */
export function autoScanAppFeatures(existing: DynamicAppFeature[] = []): {
  features: DynamicAppFeature[];
  newFeatures: DynamicAppFeature[];
} {
  const newFeatures: DynamicAppFeature[] = [];
  const currentList = [...existing];

  BUILT_IN_APP_FEATURES.forEach((builtin) => {
    if (!currentList.some((f) => f.id === builtin.id)) {
      currentList.push({ ...builtin });
      newFeatures.push(builtin);
    }
  });

  return {
    features: currentList,
    newFeatures,
  };
}
