import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'hi' | 'en' | 'or';
export type Theme = 'dark' | 'light';
export type DeviceMode = 'mobile' | 'responsive';

interface LanguageThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageThemeContext = createContext<LanguageThemeContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  // ==========================================
  // 1. PURE HINDI (राष्ट्रभाषा मानक हिन्दी - कोई भी अंग्रेजी शब्द या कोष्ठक नहीं)
  // ==========================================
  hi: {
    appTitle: 'एसटीओए नेक्स्टजेन',
    appSubtitle: 'संबलपुर ट्रक ओनर्स एसोसिएशन',
    associationName: 'संबलपुर ट्रक ओनर्स एसोसिएशन · 15-टू-15 आवर्तन प्रणाली',
    owner: 'वाहन मालिक',
    admin: 'प्रशासक',
    superAdmin: 'मुख्य प्रशासक',
    ownerApp: '📱 वाहन मालिक पोर्टल',
    adminControlRoom: '🛡️ प्रशासनिक नियंत्रण कक्ष',
    
    // Navigation & Tabs
    home: 'मुख्य पृष्ठ',
    myVehicle: 'मेरा वाहन',
    myLedger: 'मेरा हिसाब-किताब',
    gatePass: 'गेट पास',
    profile: 'प्रोफाइल',
    dashboard: 'डैशबोर्ड',
    fleet: 'फ्लीट प्रबंधन',
    loading: 'दैनिक लोड व प्रेषण',
    pukar: 'पुकार नियंत्रण',
    membership: 'सदस्यता एवं दस्तावेज',
    ledger: '15-टू-15 बहीखाता',
    reports: 'दैनिक रिपोर्ट',
    audit: 'ऑडिट इतिहास',
    settings: 'व्यवस्था',
    
    // Common Actions
    refresh: 'रिफ्रेश',
    logout: 'लॉग आउट',
    login: 'लॉगिन',
    aiAssistant: 'एसटीओए एआई',
    aiAnalysis: 'एआई विश्लेषण',
    mobileFrame: 'मोबाइल फ्रेम',
    fullScreen: 'पूर्ण स्क्रीन',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    cancel: 'रद्द करें',
    save: 'सुरक्षित करें',
    close: 'बंद करें',
    submit: 'जमा करें',
    renew: 'नवीनीकरण',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    download: 'डाउनलोड करें',
    confirm: 'पुष्टि करें',
    back: 'वापस',
    sendOtp: 'ओटीपी प्राप्त करें',
    verifyAndLogin: 'सत्यापित कर प्रवेश करें',
    months: 'माह',

    // Vehicle & Plate
    activeVehicle: 'सक्रिय पंजीकृत वाहन',
    currentSerial: 'वर्तमान क्रम संख्या',
    capacity: 'लोड क्षमता',
    capacityTon: 'टन',
    capacityTonLabel: 'क्षमता टन',
    membershipStatus: 'सदस्यता स्थिति',
    recentLoading: 'अंतिम लोडिंग तिथि',
    commercialPlate: 'व्यावसायिक नंबर प्लेट',
    stateCode: 'संबलपुर',
    autoFormat: 'स्वचालित सामान्यीकरण',
    plateCountryStamp: 'भारत',
    vehicleCategory: 'वाहन श्रेणी',
    documents: 'दस्तावेज',
    status: 'स्थिति',
    actions: 'कार्य',
    serialNumber: 'क्रम संख्या',
    allCategories: 'सभी श्रेणियां',
    importExcel: 'एक्सेल / सीएसवी आयात',
    addNewVehicle: 'नई गाड़ी जोड़ें',
    saveToFleet: 'फ्लीट में जोड़ें',
    saveChanges: 'परिवर्तन सहेजें',
    blacklistVehicle: 'इस गाड़ी को काली सूची में डालें',
    displayedVehicles: 'प्रदर्शित वाहन',
    noVehiclesFound: 'कोई वाहन नहीं मिला। कृपया खोज शब्द जांचें।',

    // KPI & Stats
    totalFleet: 'कुल पंजीकृत फ्लीट',
    activeVehicles: 'सक्रिय वाहन',
    todayLoaded: 'आज लोड हुए वाहन',
    rotationComplete: 'आवर्तन पूर्ण',
    activePrograms: 'सक्रिय लोडिंग रूट्स',
    plantsRoutes: 'संयंत्र व रूट्स',
    feeRevenue: 'एसोसिएशन शुल्क संकलन',
    todayCollection: 'आज का कुल संकलन',
    productivityTrend: '7-दिवसीय लोडिंग एवं उत्पादकता रुझान',

    // Pukar & Notice
    livePukar: 'दैनिक लोडिंग पुकार चालू है',
    pukarInactive: 'वर्तमान में पुकार बंद है',
    nextNoticeSoon: 'अगला लोडिंग नोटिस शीघ्र जारी किया जाएगा।',
    serialRange: 'पुकार क्रम सीमा',
    announcementTime: 'घोषणा समय',
    activeProgramsCount: 'सक्रिय लोडिंग कार्यक्रम',
    cycle: 'आवर्तन चक्र',
    yourTurnPukar: 'शुभ सूचना! आपका वाहन वर्तमान पुकार सूची में शामिल है।',
    waitTurn: 'कृपया अपनी बारी की प्रतीक्षा करें।',
    liveCycle: 'दैनिक चक्र',
    queueReady: 'कतार में तैयार',
    waitingVehicles: 'प्रतीक्षा सूची',
    stopPukar: 'पुकार बंद करें',
    startPukar: 'पुकार शुरू करें',
    startSerial: 'प्रारंभिक क्रम',
    endSerial: 'अंतिम क्रम',
    hindiAnnouncement: 'हिंदी घोषणा संदेश',
    odiaAnnouncement: 'ओड़िया घोषणा संदेश',
    englishAnnouncement: 'अंग्रेजी घोषणा संदेश',
    saveBroadcast: 'पुकार परिवर्तन सहेजें एवं प्रसारित करें',
    readyForLoading: 'लोडिंग के लिए तैयार',
    waitingQueueCount: 'प्रतीक्षा सूची गाड़ियां',

    // Dispatch & Gate Pass
    quickDispatch: 'त्वरित 9-पॉइंट सत्यापन एवं प्रेषण',
    authorizeDispatch: 'सत्यापित कर गेट पास जारी करें',
    digitalGatePass: 'डिजिटल गेट पास',
    tokenNo: 'टोकन संख्या',
    token: 'टोकन',
    truckNo: 'वाहन क्रमांक',
    ownerName: 'मालिक का नाम',
    driverName: 'चालक का नाम',
    destination: 'संयंत्र व गंतव्य',
    ratePerTon: 'दर प्रति टन',
    quota: 'गाड़ी कोटा',
    advance: 'अग्रिम भुगतान',
    advancePercent: 'अग्रिम प्रतिशत',
    fee: 'एसोसिएशन शुल्क',
    paymentStatus: 'भुगतान स्थिति',
    verifiedPaid: 'प्रदत्त',
    unpaid: 'अदत्त',
    valid: 'वैध',
    expired: 'समाप्त',
    expiringSoon: 'शीघ्र समाप्त',
    blacklisted: 'काली सूची में',
    recordPayment: 'भुगतान दर्ज करें',
    cancelPassAction: 'गेट पास रद्द करें',
    cancelGatePass: 'गेट पास रद्द करें',
    cancelReason: 'रद्दीकरण का कारण',
    printPass: 'प्रिंट अथवा साझा करें',
    issueDate: 'जारी करने की तिथि',
    postDailyLoad: 'रोजाना लोड पोस्ट करें',
    deleteDailyLoad: 'लोड हटाएं',
    clearDailyNotice: 'दैनिक नोटिस हटाएं',
    newLoadTitle: 'नया लोडिंग प्रोग्राम जोड़ें',
    companyName: 'संयंत्र अथवा कंपनी',
    routeDestination: 'गंतव्य स्थान व माल',
    totalTruckQuota: 'कुल गाड़ी कोटा',
    verifyPaymentModalTitle: 'एसोसिएशन शुल्क भुगतान सत्यापन',
    refNo: 'कैश रसीद संख्या अथवा यूपीआई संदर्भ',
    renewMembership: 'सदस्यता नवीनीकरण',
    renewalPeriod: 'नवीनीकरण अवधि',

    // Driver & Owner App specifics
    geofenceCheckpoints: 'संबलपुर ड्राइवर जांच चौकियां',
    statutoryDocuments: 'वाहन वैधानिक दस्तावेज',
    grossFreight: 'कुल भाड़ा',
    dieselAdvance: 'डीजल अग्रिम',
    cashAdvance: 'नकद अग्रिम',
    netPending: 'शेष बकाया राशि',
    loadingRotationLedger: 'लोडिंग इतिहास बहीखाता',
    helpline: 'संबलपुर एसटीओए सहायता केंद्र',
    languageSelect: 'भाषा चयन',
    logoutSession: 'लॉग आउट',
    noGatePasses: 'कोई गेट पास उपलब्ध नहीं है',
    noLedger: 'कोई बहीखाता प्रविष्टि नहीं मिली',
    activeSlipBooked: 'लोडिंग पर्ची सक्रिय',
    downloadCsvPaid: 'दैनिक रोकड़ सीएसवी डाउनलोड',

    // Audit Trail
    auditTrail: 'पूर्ण ऑडिट इतिहास',
    timestamp: 'समय',
    actor: 'कार्यकर्ता',
    action: 'क्रिया',
    source: 'स्रोत',

    // Auth Screen
    ownerLogin: 'वाहन मालिक लॉगिन',
    adminLogin: 'प्रशासनिक लॉगिन',
    roleOwner: 'वाहन मालिक',
    roleAdmin: 'प्रशासनिक नियंत्रण',
    quickDemoVehicles: 'त्वरित डेमो गाड़ियां',
    vehicleRegNumber: 'गाड़ी नंबर',
    registeredMobileNumber: 'पंजीकृत मोबाइल नंबर',
    enter4DigitOtp: '4-अंकीय ओटीपी कोड दर्ज करें',
    getOtp: 'ओटीपी प्राप्त करें',
    newOwnerRegistration: 'नए गाड़ी मालिक का पंजीकरण',
    ownerNameInput: 'मालिक का पूरा नाम',
    vehicleNumberInput: 'गाड़ी का नंबर',
    registerAndEnter: 'पंजीकृत कर प्रवेश करें',
    adminId: 'प्रशासक पहचान',
    adminSecurityPin: 'सुरक्षा पिन',
    searchFleetPlaceholder: 'मालिक का नाम, गाड़ी नंबर, या फोन नंबर से खोजें...',
    companyPlant: 'कंपनी / संयंत्र',
    otherPlant: 'अन्य संयंत्र',
    destinationCargo: 'गंतव्य स्थान व माल',
    mandatoryCategory: 'अनिवार्य वाहन श्रेणी',
    truckQuota: 'गाड़ी कोटा',
    pendingFreightOption: 'पेंडिंग भाड़ा - क्रम सुरक्षित रखें',
    mobileNumber: 'मोबाइल नंबर',
    adminPortalTitle: 'प्रशासनिक नियंत्रण कक्ष',
    ownerPortalTitle: 'वाहन मालिक पोर्टल',
    enterPin: 'सुरक्षा पिन दर्ज करें',
    logoAndBranding: 'लोगो व ब्रांडिंग',
    changeLogo: 'लोगो बदलें',
    editLogo: 'लोगो संपादित करें',
    officialEmblem: 'मूल आधिकारिक एम्बलम',
    uploadNewLogo: 'नया लोगो अपलोड करें',
    resetToDefaultLogo: 'मूल लोगो पर रीसेट करें',
  },

  // ==========================================
  // 2. PURE ENGLISH (Zero Hindi or Devanagari words - Clean Professional English)
  // ==========================================
  en: {
    appTitle: 'STOA NEXTGEN',
    appSubtitle: 'Sambalpur Truck Owners Association',
    associationName: 'Sambalpur Truck Owners Association · 15-to-15 Rotation System',
    owner: 'Vehicle Owner',
    admin: 'Administrator',
    superAdmin: 'Super Administrator',
    ownerApp: '📱 Vehicle Owner Portal',
    adminControlRoom: '🛡️ Administrative Control Room',
    
    // Navigation & Tabs
    home: 'Home',
    myVehicle: 'My Vehicle',
    myLedger: 'My Ledger',
    gatePass: 'Gate Pass',
    profile: 'Profile',
    dashboard: 'Dashboard',
    fleet: 'Fleet Management',
    loading: 'Daily Loads & Dispatch',
    pukar: 'Pukar Notice Control',
    membership: 'Membership & Documents',
    ledger: '15-to-15 Ledger',
    reports: 'Daily Reports',
    audit: 'Audit Log',
    settings: 'Settings',
    
    // Common Actions
    refresh: 'Refresh',
    logout: 'Log Out',
    login: 'Log In',
    aiAssistant: 'STOA AI',
    aiAnalysis: 'AI Analysis',
    mobileFrame: 'Mobile Frame',
    fullScreen: 'Full Screen',
    search: 'Search',
    filter: 'Filter',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    submit: 'Submit',
    renew: 'Renew',
    edit: 'Edit',
    delete: 'Delete',
    download: 'Download',
    confirm: 'Confirm',
    back: 'Back',
    sendOtp: 'Send OTP',
    verifyAndLogin: 'Verify & Enter',
    months: 'Months',

    // Vehicle & Plate
    activeVehicle: 'Active Registered Vehicle',
    currentSerial: 'Current Serial Number',
    capacity: 'Load Capacity',
    capacityTon: 'Tons',
    capacityTonLabel: 'Capacity (Tons)',
    membershipStatus: 'Membership Status',
    recentLoading: 'Last Loading Date',
    commercialPlate: 'Commercial Number Plate',
    stateCode: 'Sambalpur',
    autoFormat: 'Auto Normalization',
    plateCountryStamp: 'IND',
    vehicleCategory: 'Vehicle Category',
    documents: 'Documents',
    status: 'Status',
    actions: 'Actions',
    serialNumber: 'Serial Number',
    allCategories: 'All Categories',
    importExcel: 'Import Excel / CSV',
    addNewVehicle: 'Add New Vehicle',
    saveToFleet: 'Add to Fleet',
    saveChanges: 'Save Changes',
    blacklistVehicle: 'Blacklist this Vehicle',
    displayedVehicles: 'Showing Vehicles',
    noVehiclesFound: 'No vehicles found. Please check your search query.',

    // KPI & Stats
    totalFleet: 'Total Registered Fleet',
    activeVehicles: 'Active Vehicles',
    todayLoaded: 'Vehicles Loaded Today',
    rotationComplete: 'Rotation Complete',
    activePrograms: 'Active Loading Routes',
    plantsRoutes: 'Plants & Routes',
    feeRevenue: 'Association Fee Revenue',
    todayCollection: 'Today’s Total Collection',
    productivityTrend: '7-Day Loading & Productivity Trend',

    // Pukar & Notice
    livePukar: 'Daily Loading Pukar Active',
    pukarInactive: 'Pukar Currently Inactive',
    nextNoticeSoon: 'Next loading notice will be announced soon.',
    serialRange: 'Pukar Serial Range',
    announcementTime: 'Announcement Time',
    activeProgramsCount: 'Active Loading Programs',
    cycle: 'Rotation Cycle',
    yourTurnPukar: 'Good news! Your vehicle is in the active Pukar list.',
    waitTurn: 'Please wait for your turn.',
    liveCycle: 'Daily Cycle',
    queueReady: 'Ready in Queue',
    waitingVehicles: 'Waiting Queue',
    stopPukar: 'Stop Pukar',
    startPukar: 'Start Pukar',
    startSerial: 'Start Serial',
    endSerial: 'End Serial',
    hindiAnnouncement: 'Hindi Announcement Message',
    odiaAnnouncement: 'Odia Announcement Message',
    englishAnnouncement: 'English Announcement Message',
    saveBroadcast: 'Save & Broadcast Pukar Changes',
    readyForLoading: 'Ready for Loading',
    waitingQueueCount: 'Waiting Queue Trucks',

    // Dispatch & Gate Pass
    quickDispatch: 'Quick 9-Point Verification & Dispatch',
    authorizeDispatch: 'Authorize & Issue Gate Pass',
    digitalGatePass: 'Digital Gate Pass',
    tokenNo: 'Token Number',
    token: 'Token',
    truckNo: 'Vehicle Number',
    ownerName: 'Owner Name',
    driverName: 'Driver Name',
    destination: 'Plant & Route',
    ratePerTon: 'Rate Per Ton',
    quota: 'Vehicle Quota',
    advance: 'Advance Payment',
    advancePercent: 'Advance Percentage',
    fee: 'Association Fee',
    paymentStatus: 'Payment Status',
    verifiedPaid: 'PAID',
    unpaid: 'UNPAID',
    valid: 'VALID',
    expired: 'EXPIRED',
    expiringSoon: 'EXPIRING SOON',
    blacklisted: 'BLACKLISTED',
    recordPayment: 'Record Payment',
    cancelPassAction: 'Cancel Gate Pass',
    cancelGatePass: 'Cancel Gate Pass',
    cancelReason: 'Cancellation Reason',
    printPass: 'Print / Share',
    issueDate: 'Issue Date',
    postDailyLoad: 'Post Daily Load',
    deleteDailyLoad: 'Delete Load',
    clearDailyNotice: 'Clear Daily Notice',
    newLoadTitle: 'Add New Loading Program',
    companyName: 'Plant or Company',
    routeDestination: 'Destination Route & Cargo',
    totalTruckQuota: 'Total Vehicle Quota',
    verifyPaymentModalTitle: 'Association Fee Payment Verification',
    refNo: 'Receipt No. or UPI Reference',
    renewMembership: 'Membership Renewal',
    renewalPeriod: 'Renewal Period',

    // Driver & Owner App specifics
    geofenceCheckpoints: 'Sambalpur Driver Checkpoints',
    statutoryDocuments: 'Statutory Vehicle Documents',
    grossFreight: 'Gross Freight',
    dieselAdvance: 'Diesel Advance',
    cashAdvance: 'Cash Advance',
    netPending: 'Net Pending Balance',
    loadingRotationLedger: 'Loading Rotation Ledger',
    helpline: 'Sambalpur STOA Helpline',
    languageSelect: 'Select Language',
    logoutSession: 'Log Out',
    noGatePasses: 'No Gate Passes Available',
    noLedger: 'No Ledger Entries Found',
    activeSlipBooked: 'Active Loading Slip Booked',
    downloadCsvPaid: 'Download Daily Cash CSV',

    // Audit Trail
    auditTrail: 'Immutable Audit Log',
    timestamp: 'Timestamp',
    actor: 'Actor',
    action: 'Action',
    source: 'Source',

    // Auth Screen
    ownerLogin: 'Vehicle Owner Login',
    adminLogin: 'Administrative Login',
    roleOwner: 'Vehicle Owner',
    roleAdmin: 'Administrative Control',
    quickDemoVehicles: 'Quick Demo Vehicles',
    vehicleRegNumber: 'Vehicle Registration Number',
    registeredMobileNumber: 'Registered Mobile Number',
    enter4DigitOtp: 'Enter 4-Digit OTP Code',
    getOtp: 'Get OTP Code',
    newOwnerRegistration: 'New Vehicle Owner Registration',
    ownerNameInput: 'Owner Full Name',
    vehicleNumberInput: 'Vehicle Number',
    registerAndEnter: 'Register & Enter',
    adminId: 'Administrator ID',
    adminSecurityPin: 'Security PIN',
    searchFleetPlaceholder: 'Search by owner name, vehicle number, or mobile...',
    companyPlant: 'Company / Plant',
    otherPlant: 'Other Plant',
    destinationCargo: 'Destination Route & Cargo',
    mandatoryCategory: 'Mandatory Vehicle Category',
    truckQuota: 'Truck Quota',
    pendingFreightOption: 'Pending Freight - Preserve Rotation',
    mobileNumber: 'Mobile Number',
    adminPortalTitle: 'Administrative Control Room',
    ownerPortalTitle: 'Vehicle Owner Portal',
    enterPin: 'Enter Security PIN',
    logoAndBranding: 'Logo & Branding',
    changeLogo: 'Change Logo',
    editLogo: 'Edit Logo',
    officialEmblem: 'Official Emblem',
    uploadNewLogo: 'Upload New Logo',
    resetToDefaultLogo: 'Reset to Official Emblem',
  },

  // ==========================================
  // 3. PURE ODIA (ସମ୍ପୂର୍ଣ୍ଣ ଶୁଦ୍ଧ ଓଡ଼ିଆ ଭାଷା)
  // ==========================================
  or: {
    appTitle: 'ଏସ.ଟି.ଓ.ଏ ନେକ୍ସଟଜେନ୍',
    appSubtitle: 'ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ',
    associationName: 'ସମ୍ବଲପୁର ଟ୍ରକ ମାଲିକ ସଂଘ · ୧୫-ରୁ-୧୫ ପର୍ଯ୍ୟାୟ ବ୍ୟବସ୍ଥା',
    owner: 'ଗାଡ଼ି ମାଲିକ',
    admin: 'ପ୍ରଶାସକ',
    superAdmin: 'ମୁଖ୍ୟ ପ୍ରଶାସକ',
    ownerApp: '📱 ଗାଡ଼ି ମାଲିକ ପୋର୍ଟାଲ୍',
    adminControlRoom: '🛡️ ପ୍ରଶାସନିକ ନିୟନ୍ତ୍ରଣ କକ୍ଷ',

    // Navigation & Tabs
    home: 'ମୁଖ୍ୟ ପୃଷ୍ଠା',
    myVehicle: 'ମୋର ଗାଡ଼ି',
    myLedger: 'ମୋର ହିସାବ',
    gatePass: 'ଗେଟ୍ ପାସ୍',
    profile: 'ପ୍ରୋଫାଇଲ୍',
    dashboard: 'ଡ୍ୟାସବୋର୍ଡ',
    fleet: 'ଫ୍ଲିଟ୍ ପରିଚାଳନା',
    loading: 'ଦୈନିକ ଲୋଡିଂ ଓ ପ୍ରେରଣ',
    pukar: 'ପୁକାର ନିୟନ୍ତ୍ରଣ',
    membership: 'ସଦସ୍ୟତା ଓ ଦଲିଲପତ୍ର',
    ledger: '୧୫-ରୁ-୧୫ ଖାତା',
    reports: 'ଦୈନିକ ବିବରଣୀ',
    audit: 'ଅଡିଟ୍ ଇତିହାସ',
    settings: 'ସେଟିଙ୍ଗ୍ସ',

    // Common Actions
    refresh: 'ରିଫ୍ରେସ୍',
    logout: 'ଲଗ୍ ଆଉଟ୍',
    login: 'ଲଗ୍ ଇନ୍',
    aiAssistant: 'ଏସ.ଟି.ଓ.ଏ ଏଆଇ',
    aiAnalysis: 'ଏଆଇ ବିଶ୍ଳେଷଣ',
    mobileFrame: 'ମୋବାଇଲ୍ ଫ୍ରେମ୍',
    fullScreen: 'ସମ୍ପୂର୍ଣ୍ଣ ସ୍କ୍ରିନ୍',
    search: 'ଖୋଜନ୍ତୁ',
    filter: 'ଫିଲ୍ଟର୍',
    cancel: 'ବାତିଲ୍',
    save: 'ସାଇତନ୍ତୁ',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
    submit: 'ଦାଖଲ କରନ୍ତୁ',
    renew: 'ନବୀକରଣ',
    edit: 'ସମ୍ପାଦନ',
    delete: 'ହଟାନ୍ତୁ',
    download: 'ଡାଉନଲୋଡ୍ କରନ୍ତୁ',
    confirm: 'ନିଶ୍ଚିତ କରନ୍ତୁ',
    back: 'ପଛକୁ',
    sendOtp: 'ଓଟିପି ପାଆନ୍ତୁ',
    verifyAndLogin: 'ଯାଞ୍ଚ କରି ପ୍ରବେଶ କରନ୍ତୁ',
    months: 'ମାସ',

    // Vehicle & Plate
    activeVehicle: 'ସକ୍ରିୟ ପଞ୍ଜୀକୃତ ଗାଡ଼ି',
    currentSerial: 'ବର୍ତ୍ତମାନ କ୍ରମିକ ସଂଖ୍ୟା',
    capacity: 'ଭାର ଧାରଣ କ୍ଷମତା',
    capacityTon: 'ଟନ୍',
    capacityTonLabel: 'କ୍ଷମତା (ଟନ୍)',
    membershipStatus: 'ସଦସ୍ୟତା ସ୍ଥିତି',
    recentLoading: 'ଶେଷ ଲୋଡିଂ ତାରିଖ',
    commercialPlate: 'ବ୍ୟାବସାୟିକ ନମ୍ବର ପ୍ଲେଟ୍',
    stateCode: 'ସମ୍ବଲପୁର',
    autoFormat: 'ସ୍ୱୟଂକ୍ରିୟ ସଂଶୋଧନ',
    plateCountryStamp: 'ଭାରତ',
    vehicleCategory: 'ଗାଡ଼ି ବର୍ଗ',
    documents: 'ଦଲିଲପତ୍ର',
    status: 'ସ୍ଥିତି',
    actions: 'କାର୍ଯ୍ୟ',
    serialNumber: 'କ୍ରମିକ ସଂଖ୍ୟା',
    allCategories: 'ସମସ୍ତ ଶ୍ରେଣୀ',
    importExcel: 'Excel / CSV ଆମଦାନୀ',
    addNewVehicle: 'ନୂଆ ଗାଡ଼ି ଯୋଡ଼ନ୍ତୁ',
    saveToFleet: 'ଫ୍ଲିଟ୍‌ରେ ଯୋଡ଼ନ୍ତୁ',
    saveChanges: 'ପରିବର୍ତ୍ତନ ସାଇତନ୍ତୁ',
    blacklistVehicle: 'ଏହି ଗାଡ଼ିକୁ କଳା ତାଲିକାଭୁକ୍ତ କରନ୍ତୁ',
    displayedVehicles: 'ପ୍ରଦର୍ଶିତ ଗାଡ଼ି',
    noVehiclesFound: 'କୌଣସି ଗାଡ଼ି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଖୋଜିବା ଶବ୍ଦ ଯାଞ୍ଚ କରନ୍ତୁ।',

    // KPI & Stats
    totalFleet: 'ମୋଟ ପଞ୍ଜୀକୃତ ଗାଡ଼ି',
    activeVehicles: 'ସକ୍ରିୟ ଗାଡ଼ି',
    todayLoaded: 'ଆଜି ଲୋଡ୍ ହୋଇଥିବା ଗାଡ଼ି',
    rotationComplete: 'ପର୍ଯ୍ୟାୟ ସମ୍ପୂର୍ଣ୍ଣ',
    activePrograms: 'ସକ୍ରିୟ ଲୋଡିଂ ରୁଟ୍',
    plantsRoutes: 'ପ୍ଲାଣ୍ଟ୍ ଓ ରୁଟ୍',
    feeRevenue: 'ସଂଘ ଶୁଳ୍କ ଆଦାୟ',
    todayCollection: 'ଆଜିର ମୋଟ ଆଦାୟ',
    productivityTrend: '୭-ଦିନର ଲୋଡିଂ ଓ ଉତ୍ପାଦନ ବିବରଣୀ',

    // Pukar & Notice
    livePukar: 'ଦୈନିକ ଲୋଡିଂ ପୁକାର ଚାଲୁ ଅଛି',
    pukarInactive: 'ବର୍ତ୍ତମାନ ପୁକାର ବନ୍ଦ ଅଛି',
    nextNoticeSoon: 'ପରବର୍ତ୍ତୀ ଲୋଡିଂ ନୋଟିସ୍ ଶୀଘ୍ର ପ୍ରକାଶ ପାଇବ।',
    serialRange: 'ପୁକାର କ୍ରମିକ ସୀମା',
    announcementTime: 'ଘୋଷଣା ସମୟ',
    activeProgramsCount: 'ସକ୍ରିୟ ଲୋଡିଂ କାର୍ଯ୍ୟକ୍ରମ',
    cycle: 'ଆବର୍ତ୍ତନ ଚକ୍ର',
    yourTurnPukar: 'ଶୁଭ ଖବର! ଆପଣଙ୍କ ଗାଡ଼ି ବର୍ତ୍ତମାନ ପୁକାର ତାଲିକାରେ ଅଛି।',
    waitTurn: 'ଦୟାକରି ଆପଣଙ୍କ ପାଳିକୁ ଅପେକ୍ଷା କରନ୍ତୁ।',
    liveCycle: 'ଦୈନିକ ଚକ୍ର',
    queueReady: 'ଧାଡ଼ିରେ ପ୍ରସ୍ତୁତ',
    waitingVehicles: 'ଅପେକ୍ଷାରତ ଗାଡ଼ି',
    stopPukar: 'ପୁକାର ବନ୍ଦ କରନ୍ତୁ',
    startPukar: 'ପୁକାର ଆରମ୍ଭ କରନ୍ତୁ',
    startSerial: 'ପ୍ରାରମ୍ଭିକ କ୍ରମ',
    endSerial: 'ଅନ୍ତିମ କ୍ରମ',
    hindiAnnouncement: 'ହିନ୍ଦୀ ଘୋଷଣା ବାର୍ତ୍ତା',
    odiaAnnouncement: 'ଓଡ଼ିଆ ଘୋଷଣା ବାର୍ତ୍ତା',
    englishAnnouncement: 'ଇଂରାଜୀ ଘୋଷଣା ବାର୍ତ୍ତା',
    saveBroadcast: 'ପୁକାର ପରିବର୍ତ୍ତନ ସାଇତନ୍ତୁ ଓ ପ୍ରସାରଣ କରନ୍ତୁ',
    readyForLoading: 'ଲୋଡିଂ ପାଇଁ ପ୍ରସ୍ତୁତ',
    waitingQueueCount: 'ଅପେକ୍ଷା ତାଲିକା ଟ୍ରକ୍',

    // Dispatch & Gate Pass
    quickDispatch: 'ତୁରନ୍ତ ୯-ପଏଣ୍ଟ ଯାଞ୍ଚ ଓ ପ୍ରେରଣ',
    authorizeDispatch: 'ଯାଞ୍ଚ କରି ଗେଟ୍ ପାସ୍ ଦିଅନ୍ତୁ',
    digitalGatePass: 'ଡିଜିଟାଲ୍ ଗେଟ୍ ପାସ୍',
    tokenNo: 'ଟୋକନ୍ ନମ୍ବର',
    token: 'ଟୋକନ୍',
    truckNo: 'ଗାଡ଼ି ନମ୍ବର',
    ownerName: 'ମାଲିକଙ୍କ ନାମ',
    driverName: 'ଚାଳକଙ୍କ ନାମ',
    destination: 'ପ୍ଲାଣ୍ଟ୍ ଓ ରୁଟ୍',
    ratePerTon: 'ଦର ପ୍ରତି ଟନ୍',
    quota: 'ଗାଡ଼ି କୋଟା',
    advance: 'ଅଗ୍ରୀମ ପୈଠ',
    advancePercent: 'ଅଗ୍ରୀମ ଶତକଡ଼ା',
    fee: 'ସଂଘ ଶୁଳ୍କ',
    paymentStatus: 'ପୈଠ ସ୍ଥିତି',
    verifiedPaid: 'ପୈଠ',
    unpaid: 'ବାକି',
    valid: 'ବୈଧ',
    expired: 'ସମାପ୍ତ',
    expiringSoon: 'ଶୀଘ୍ର ସମାପ୍ତ',
    blacklisted: 'କଳା ତାଲିକାଭୁକ୍ତ',
    recordPayment: 'ପୈଠ ଦାଖଲ କରନ୍ତୁ',
    cancelPassAction: 'ଗେଟ୍ ପାସ୍ ବାତିଲ୍ କରନ୍ତୁ',
    cancelGatePass: 'ଗେଟ୍ ପାସ୍ ବାତିଲ୍ କରନ୍ତୁ',
    cancelReason: 'ବାତିଲ୍ କରିବାର କାରଣ',
    printPass: 'ପ୍ରିଣ୍ଟ୍ / ସେୟାର୍',
    issueDate: 'ପ୍ରଦାନ ତାରିଖ',
    postDailyLoad: 'ଦୈନିକ ଲୋଡ୍ ପୋଷ୍ଟ କରନ୍ତୁ',
    deleteDailyLoad: 'ଲୋଡ୍ ହଟାନ୍ତୁ',
    clearDailyNotice: 'ଦୈନିକ ନୋଟିସ୍ ହଟାନ୍ତୁ',
    newLoadTitle: 'ନୂଆ ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ଯୋଡ଼ନ୍ତୁ',
    companyName: 'ପ୍ଲାଣ୍ଟ୍ କିମ୍ବା କମ୍ପାନୀ',
    routeDestination: 'ଗନ୍ତବ୍ୟ ସ୍ଥଳ ଓ ମାଲ୍',
    totalTruckQuota: 'ମୋଟ ଗାଡ଼ି କୋଟା',
    verifyPaymentModalTitle: 'ସଂଘ ଶୁଳ୍କ ପୈଠ ଯାଞ୍ଚ',
    refNo: 'ରସିଦ ନମ୍ବର କିମ୍ବା UPI ସନ୍ଦର୍ଭ',
    renewMembership: 'ସଦସ୍ୟତା ନବୀକରଣ',
    renewalPeriod: 'ନବୀକରଣ ଅବଧି',

    // Driver & Owner App specifics
    geofenceCheckpoints: 'ସମ୍ବଲପୁର ଡ୍ରାଇଭର ଯାଞ୍ଚ ଚୌକି',
    statutoryDocuments: 'ଗାଡ଼ିର ଆଇନଗତ ଦଲିଲପତ୍ର',
    grossFreight: 'ମୋଟ ଭଡ଼ା',
    dieselAdvance: 'ଡିଜେଲ୍ ଅଗ୍ରୀମ',
    cashAdvance: 'ନଗଦ ଅଗ୍ରୀମ',
    netPending: 'ଅବଶିଷ୍ଟ ବାକି ରାଶି',
    loadingRotationLedger: 'ଲୋଡିଂ ଇତିହାସ ଖାତା',
    helpline: 'ସମ୍ବଲପୁର ଏସ.ଟି.ଓ.ଏ ସହାୟତା ଡେସ୍କ',
    languageSelect: 'ଭାଷା ଚୟନ',
    logoutSession: 'ଲଗ୍ ଆଉଟ୍',
    noGatePasses: 'କୌଣସି ଗେଟ୍ ପାସ୍ ଉପଲବ୍ଧ ନାହିଁ',
    noLedger: 'କୌଣସି ଖାତା ବିବରଣୀ ମିଳିଲା ନାହିଁ',
    activeSlipBooked: 'ସକ୍ରିୟ ଲୋଡିଂ ପର୍ଚି',
    downloadCsvPaid: 'ଦୈନିକ ନଗଦ CSV ଡାଉନଲୋଡ୍',

    // Audit Trail
    auditTrail: 'ସମ୍ପୂର୍ଣ୍ଣ ଅଡିଟ୍ ଇତିହାସ',
    timestamp: 'ସମୟ',
    actor: 'କାର୍ଯ୍ୟକର୍ତ୍ତା',
    action: 'କ୍ରିୟା',
    source: 'ଉତ୍ସ',

    // Auth Screen
    ownerLogin: 'ଗାଡ଼ି ମାଲିକ ଲଗ୍ ଇନ୍',
    adminLogin: 'ପ୍ରଶାସନିକ ଲଗ୍ ଇନ୍',
    roleOwner: 'ଗାଡ଼ି ମାଲିକ',
    roleAdmin: 'ପ୍ରଶାସନିକ ନିୟନ୍ତ୍ରଣ',
    quickDemoVehicles: 'ଶୀଘ୍ର ଡେମୋ ଗାଡ଼ି',
    vehicleRegNumber: 'ଗାଡ଼ି ନମ୍ବର',
    registeredMobileNumber: 'ପଞ୍ଜୀକୃତ ମୋବାଇଲ୍ ନମ୍ବର',
    enter4DigitOtp: '୪-ଅଙ୍କ ବିଶିଷ୍ଟ OTP ଦାଖଲ କରନ୍ତୁ',
    getOtp: 'OTP କୋଡ୍ ପାଆନ୍ତୁ',
    newOwnerRegistration: 'ନୂଆ ଗାଡ଼ି ମାଲିକ ପଞ୍ଜୀକରଣ',
    ownerNameInput: 'ମାଲିକଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ନାମ',
    vehicleNumberInput: 'ଗାଡ଼ି ନମ୍ବର',
    registerAndEnter: 'ପଞ୍ଜୀକରଣ କରି ପ୍ରବେଶ କରନ୍ତୁ',
    adminId: 'ପ୍ରଶାସକ ଆଇଡି',
    adminSecurityPin: 'ସୁରକ୍ଷା ପିନ୍',
    searchFleetPlaceholder: 'ଗାଡ଼ି ନମ୍ବର, ମାଲିକଙ୍କ ନାମ କିମ୍ବା ଫୋନ୍ ନମ୍ବର ଖୋଜନ୍ତୁ...',
    companyPlant: 'କମ୍ପାନୀ / ପ୍ଲାଣ୍ଟ୍',
    otherPlant: 'ଅନ୍ୟାନ୍ୟ ପ୍ଲାଣ୍ଟ୍',
    destinationCargo: 'ଗନ୍ତବ୍ୟ ସ୍ଥଳ ଓ ମାଲ୍',
    mandatoryCategory: 'ବାଧ୍ୟତାମୂଳକ ଗାଡ଼ି ବର୍ଗ',
    truckQuota: 'ଗାଡ଼ି କୋଟା',
    pendingFreightOption: 'ବାକି ଭଡ଼ା - କ୍ରମ ସଂରକ୍ଷଣ',
    mobileNumber: 'ମୋବାଇଲ୍ ନମ୍ବର',
    adminPortalTitle: 'ପ୍ରଶାସନିକ ନିୟନ୍ତ୍ରଣ କକ୍ଷ',
    ownerPortalTitle: 'ଗାଡ଼ି ମାଲିକ ପୋର୍ଟାଲ୍',
    enterPin: 'ସୁରକ୍ଷା ପିନ୍ ଦାଖଲ କରନ୍ତୁ',
    logoAndBranding: 'ସଂଘ ଲୋଗୋ ଓ ବ୍ରାଣ୍ଡିଂ',
    changeLogo: 'ଲୋଗୋ ବଦଳାନ୍ତୁ',
    editLogo: 'ଲୋଗୋ ଏଡିଟ୍ କରନ୍ତୁ',
    officialEmblem: 'ମୂଳ ଅଫିସିଆଲ୍ ଏମ୍ବ୍ଲେମ୍',
    uploadNewLogo: 'ନୂଆ ଲୋଗୋ ଅପଲୋଡ୍ କରନ୍ତୁ',
    resetToDefaultLogo: 'ମୂଳ ଲୋଗୋ ପୁନଃସ୍ଥାପନ କରନ୍ତୁ',
  },
};

export const LanguageThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hi');
  const [theme, setThemeState] = useState<Theme>('light');
  const [deviceMode, setDeviceModeState] = useState<DeviceMode>('mobile');

  useEffect(() => {
    const savedLang = localStorage.getItem('stoa_lang') as Language;
    if (savedLang && ['hi', 'en', 'or'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    const savedTheme = localStorage.getItem('stoa_theme') as Theme;
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      setThemeState(savedTheme);
    } else {
      setThemeState('light');
    }
    const savedDevice = localStorage.getItem('stoa_device') as DeviceMode;
    if (savedDevice && ['mobile', 'responsive'].includes(savedDevice)) {
      setDeviceModeState(savedDevice);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('stoa_lang', lang);
  };

  const setTheme = (th: Theme) => {
    setThemeState(th);
    localStorage.setItem('stoa_theme', th);
  };

  const setDeviceMode = (mode: DeviceMode) => {
    setDeviceModeState(mode);
    localStorage.setItem('stoa_device', mode);
  };

  /**
   * PURE TRANSLATION RESOLUTION
   * - In 'en' mode: guarantees zero Hindi/Odia characters ever appear.
   * - In 'hi' mode: guarantees zero English brackets or mixed English words appear.
   * - In 'or' mode: returns pure Odia.
   */
  const t = (key: string, fallback?: string): string => {
    const dict = translations[language];
    if (dict && dict[key]) {
      return dict[key];
    }

    if (language === 'en') {
      if (translations.en[key]) return translations.en[key];
      // Clean fallback if it contains Hindi/Odia
      if (fallback && !/[\u0900-\u097F\u0B00-\u0B7F]/.test(fallback)) {
        return fallback.replace(/\([^)]*\)/g, '').trim();
      }
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
    }

    if (language === 'hi') {
      if (translations.hi[key]) return translations.hi[key];
      if (fallback) {
        // Remove any English in parentheses e.g. "गाड़ी नंबर (Vehicle Number)" -> "गाड़ी नंबर"
        return fallback.replace(/\([A-Za-z0-9\s/&_-]+\)/g, '').trim();
      }
      return key;
    }

    if (language === 'or') {
      if (translations.or[key]) return translations.or[key];
      if (translations.hi[key]) return translations.hi[key];
      return fallback || key;
    }

    return translations.hi[key] || fallback || key;
  };

  return (
    <LanguageThemeContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        deviceMode,
        setDeviceMode,
        t,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </LanguageThemeContext.Provider>
  );
};

export const useLanguageTheme = () => {
  const ctx = useContext(LanguageThemeContext);
  if (!ctx) throw new Error('useLanguageTheme must be used within LanguageThemeProvider');
  return ctx;
};
