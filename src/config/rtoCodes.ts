/**
 * Comprehensive Indian RTO (Regional Transport Office) Codes & District Directory
 * Featuring exhaustive coverage of all Odisha RTO codes (OD01–OD35+)
 * with full multilingual localization: Hindi (hi), English (en), and Odia (or).
 */

export interface RtoEntry {
  code: string; // e.g., 'OD15', 'CG04', 'JH05'
  districtEn: string;
  districtHi: string;
  districtOr: string;
  stateCode: string;
  stateEn: string;
  stateHi: string;
  stateOr: string;
  region?: string;
}

/**
 * Complete, authoritative map of all 35+ Odisha RTO codes
 */
export const ODISHA_RTO_MAP: Record<string, RtoEntry> = {
  OD01: {
    code: 'OD01',
    districtEn: 'Balasore',
    districtHi: 'बालेश्वर',
    districtOr: 'ବାଲେଶ୍ଵର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD02: {
    code: 'OD02',
    districtEn: 'Bhubaneswar-I',
    districtHi: 'भुवनेश्वर-I',
    districtOr: 'ଭୁବନେଶ୍ୱର-୧',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD03: {
    code: 'OD03',
    districtEn: 'Bolangir',
    districtHi: 'बोलांगीर',
    districtOr: 'ବଲାଙ୍ଗୀର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD04: {
    code: 'OD04',
    districtEn: 'Chandikhole',
    districtHi: 'चंडीखोल',
    districtOr: 'ଚଣ୍ଡିଖୋଲ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD05: {
    code: 'OD05',
    districtEn: 'Cuttack',
    districtHi: 'कटक',
    districtOr: 'କଟକ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD06: {
    code: 'OD06',
    districtEn: 'Dhenkanal',
    districtHi: 'ढेंकनाल',
    districtOr: 'ଢେଙ୍କାନାଳ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD07: {
    code: 'OD07',
    districtEn: 'Ganjam (Chhatrapur)',
    districtHi: 'गंजम (छत्रपुर)',
    districtOr: 'ଗଞ୍ଜାମ (ଛତ୍ରପୁର)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD08: {
    code: 'OD08',
    districtEn: 'Kalahandi (Bhawanipatna)',
    districtHi: 'कालाहांडी (भवानीपटना)',
    districtOr: 'କଳାହାଣ୍ଡି (ଭବାନୀପାଟଣା)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD09: {
    code: 'OD09',
    districtEn: 'Keonjhar',
    districtHi: 'क्योंझर',
    districtOr: 'କେନ୍ଦୁଝର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD10: {
    code: 'OD10',
    districtEn: 'Koraput',
    districtHi: 'कोरापुट',
    districtOr: 'କୋରାପୁଟ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD11: {
    code: 'OD11',
    districtEn: 'Mayurbhanj (Baripada)',
    districtHi: 'मयूरभंज (बारीपदा)',
    districtOr: 'ମୟୂରଭଞ୍ଜ (ବାରିପଦା)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD12: {
    code: 'OD12',
    districtEn: 'Phulbani (Kandhamal)',
    districtHi: 'फूलबनी (कंधमाल)',
    districtOr: 'ଫୁଲବାଣୀ (କନ୍ଧମାଳ)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD13: {
    code: 'OD13',
    districtEn: 'Puri',
    districtHi: 'पुरी',
    districtOr: 'ପୁରୀ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD14: {
    code: 'OD14',
    districtEn: 'Rourkela',
    districtHi: 'राउरकेला',
    districtOr: 'ରାଉରକେଲା',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD15: {
    code: 'OD15',
    districtEn: 'Sambalpur',
    districtHi: 'संबलपुर',
    districtOr: 'ସମ୍ବଲପୁର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD16: {
    code: 'OD16',
    districtEn: 'Sundargarh',
    districtHi: 'सुंदरगढ़',
    districtOr: 'ସୁନ୍ଦରଗଡ଼',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD17: {
    code: 'OD17',
    districtEn: 'Bargarh',
    districtHi: 'बरगढ़',
    districtOr: 'ବରଗଡ଼',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD18: {
    code: 'OD18',
    districtEn: 'Rayagada',
    districtHi: 'रायगड़ा',
    districtOr: 'ରାୟଗଡ଼ା',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD19: {
    code: 'OD19',
    districtEn: 'Angul',
    districtHi: 'अंगुल',
    districtOr: 'ଅନୁଗୋଳ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD20: {
    code: 'OD20',
    districtEn: 'Gajapati (Paralakhemundi)',
    districtHi: 'गजपति (पारलाखेमुंडी)',
    districtOr: 'ଗଜପତି (ପାରଳାଖେମୁଣ୍ଡି)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD21: {
    code: 'OD21',
    districtEn: 'Jagatsinghpur',
    districtHi: 'जगतसिंहपुर',
    districtOr: 'ଜଗତସିଂହପୁର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD22: {
    code: 'OD22',
    districtEn: 'Bhadrak',
    districtHi: 'भद्रक',
    districtOr: 'ଭଦ୍ରକ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD23: {
    code: 'OD23',
    districtEn: 'Jharsuguda',
    districtHi: 'झारसुगुड़ा',
    districtOr: 'ଝାରସୁଗୁଡ଼ା',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD24: {
    code: 'OD24',
    districtEn: 'Nabarangpur',
    districtHi: 'नबरंगपुर',
    districtOr: 'ନବରଙ୍ଗପୁର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD25: {
    code: 'OD25',
    districtEn: 'Nayagarh',
    districtHi: 'नयागढ़',
    districtOr: 'ନୟାଗଡ଼',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD26: {
    code: 'OD26',
    districtEn: 'Nuapada',
    districtHi: 'नुआपड़ा',
    districtOr: 'ନୂଆପଡ଼ା',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD27: {
    code: 'OD27',
    districtEn: 'Boudh',
    districtHi: 'बौध',
    districtOr: 'ବୌଦ୍ଧ',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD28: {
    code: 'OD28',
    districtEn: 'Deogarh',
    districtHi: 'देवगढ़',
    districtOr: 'ଦେବଗଡ଼',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD29: {
    code: 'OD29',
    districtEn: 'Kendrapara',
    districtHi: 'केंद्रपाड़ा',
    districtOr: 'କେନ୍ଦ୍ରାପଡ଼ା',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD30: {
    code: 'OD30',
    districtEn: 'Malkangiri',
    districtHi: 'मलकानगिरी',
    districtOr: 'ମାଲକାନଗିରି',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD31: {
    code: 'OD31',
    districtEn: 'Sonepur (Subarnapur)',
    districtHi: 'सोनपुर (सुवर्णपुर)',
    districtOr: 'ସୁବର୍ଣ୍ଣପୁର (ସୋନପୁର)',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD32: {
    code: 'OD32',
    districtEn: 'Bhanjanagar (Ganjam-II)',
    districtHi: 'भंजनगर',
    districtOr: 'ଭଞ୍ଜନଗର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD33: {
    code: 'OD33',
    districtEn: 'Bhubaneswar-II',
    districtHi: 'भुवनेश्वर-II',
    districtOr: 'ଭୁବନେଶ୍ୱର-୨',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD34: {
    code: 'OD34',
    districtEn: 'Jajpur',
    districtHi: 'जाजपुर',
    districtOr: 'ଯାଜପୁର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
  OD35: {
    code: 'OD35',
    districtEn: 'Talcher',
    districtHi: 'तालचेर',
    districtOr: 'ତାଳଚେର',
    stateCode: 'OD',
    stateEn: 'Odisha',
    stateHi: 'ओडिशा',
    stateOr: 'ଓଡ଼ିଶା',
  },
};

/**
 * Comprehensive Indian RTO Map covering all Odisha codes (OD01-OD35)
 * as well as major interstate transport corridor RTO codes frequently
 * active in Odisha industrial logistics (Chhattisgarh, Jharkhand,
 * West Bengal, Bihar, Andhra Pradesh, Maharashtra, etc.)
 */
export const INDIAN_RTO_MAP: Record<string, RtoEntry> = {
  // All Odisha RTOs
  ...ODISHA_RTO_MAP,

  // Neighboring & Major Interstate Freight Corridors:
  // --- Chhattisgarh (CG) ---
  CG04: {
    code: 'CG04',
    districtEn: 'Raipur',
    districtHi: 'रायपुर',
    districtOr: 'ରାୟପୁର',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },
  CG07: {
    code: 'CG07',
    districtEn: 'Durg / Bhilai',
    districtHi: 'दुर्ग / भिलाई',
    districtOr: 'ଦୁର୍ଗ / ଭିଲାଇ',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },
  CG10: {
    code: 'CG10',
    districtEn: 'Bilaspur',
    districtHi: 'बिलासपुर',
    districtOr: 'ବିଳାସପୁର',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },
  CG11: {
    code: 'CG11',
    districtEn: 'Janjgir-Champa',
    districtHi: 'जांजगीर-चांपा',
    districtOr: 'ଜାଞ୍ଜଗିର-ଚାମ୍ପା',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },
  CG12: {
    code: 'CG12',
    districtEn: 'Korba',
    districtHi: 'कोरबा',
    districtOr: 'କୋରବା',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },
  CG13: {
    code: 'CG13',
    districtEn: 'Raigarh',
    districtHi: 'रायगढ़',
    districtOr: 'ରାୟଗଡ଼ (ଛ.ଗ.)',
    stateCode: 'CG',
    stateEn: 'Chhattisgarh',
    stateHi: 'छत्तीसगढ़',
    stateOr: 'ଛତିଶଗଡ଼',
  },

  // --- Jharkhand (JH) ---
  JH01: {
    code: 'JH01',
    districtEn: 'Ranchi',
    districtHi: 'रांची',
    districtOr: 'ରାଞ୍ଚି',
    stateCode: 'JH',
    stateEn: 'Jharkhand',
    stateHi: 'झारखंड',
    stateOr: 'ଝାଡ଼ଖଣ୍ଡ',
  },
  JH05: {
    code: 'JH05',
    districtEn: 'Jamshedpur (East Singhbhum)',
    districtHi: 'जमशेदपुर (पूर्वी सिंहभूम)',
    districtOr: 'ଜାମସେଦପୁର',
    stateCode: 'JH',
    stateEn: 'Jharkhand',
    stateHi: 'झारखंड',
    stateOr: 'ଝାଡ଼ଖଣ୍ଡ',
  },
  JH09: {
    code: 'JH09',
    districtEn: 'Bokaro Steel City',
    districtHi: 'बोकारो',
    districtOr: 'ବୋକାରୋ',
    stateCode: 'JH',
    stateEn: 'Jharkhand',
    stateHi: 'झारखंड',
    stateOr: 'ଝାଡ଼ଖଣ୍ଡ',
  },
  JH10: {
    code: 'JH10',
    districtEn: 'Dhanbad',
    districtHi: 'धनबाद',
    districtOr: 'ଧାନବାଦ',
    stateCode: 'JH',
    stateEn: 'Jharkhand',
    stateHi: 'झारखंड',
    stateOr: 'ଝାଡ଼ଖଣ୍ଡ',
  },

  // --- West Bengal (WB) ---
  WB01: {
    code: 'WB01',
    districtEn: 'Kolkata Central',
    districtHi: 'कोलकाता',
    districtOr: 'କୋଲକାତା',
    stateCode: 'WB',
    stateEn: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    stateOr: 'ପଶ୍ଚିମବଙ୍ଗ',
  },
  WB02: {
    code: 'WB02',
    districtEn: 'Kolkata North',
    districtHi: 'कोलकाता उत्तर',
    districtOr: 'କୋଲକାତା ଉତ୍ତର',
    stateCode: 'WB',
    stateEn: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    stateOr: 'ପଶ୍ଚିମବଙ୍ଗ',
  },
  WB38: {
    code: 'WB38',
    districtEn: 'Asansol (Paschim Bardhaman)',
    districtHi: 'आसनसोल',
    districtOr: 'ଆସାନସୋଲ',
    stateCode: 'WB',
    stateEn: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    stateOr: 'ପଶ୍ଚିମବଙ୍ଗ',
  },
  WB39: {
    code: 'WB39',
    districtEn: 'Durgapur',
    districtHi: 'दुर्गापुर',
    districtOr: 'ଦୁର୍ଗାପୁର',
    stateCode: 'WB',
    stateEn: 'West Bengal',
    stateHi: 'पश्चिम बंगाल',
    stateOr: 'ପଶ୍ଚିମବଙ୍ଗ',
  },

  // --- Bihar (BR) ---
  BR01: {
    code: 'BR01',
    districtEn: 'Patna',
    districtHi: 'पटना',
    districtOr: 'ପାଟଣା',
    stateCode: 'BR',
    stateEn: 'Bihar',
    stateHi: 'बिहार',
    stateOr: 'ବିହାର',
  },
  BR02: {
    code: 'BR02',
    districtEn: 'Gaya',
    districtHi: 'गया',
    districtOr: 'ଗୟା',
    stateCode: 'BR',
    stateEn: 'Bihar',
    stateHi: 'बिहार',
    stateOr: 'ବିହାର',
  },

  // --- Andhra Pradesh & Telangana ---
  AP31: {
    code: 'AP31',
    districtEn: 'Visakhapatnam',
    districtHi: 'विशाखापट्टनम',
    districtOr: 'ବିଶାଖାପାଟଣା',
    stateCode: 'AP',
    stateEn: 'Andhra Pradesh',
    stateHi: 'आंध्र प्रदेश',
    stateOr: 'ଆନ୍ଧ୍ର ପ୍ରଦେଶ',
  },
  TS09: {
    code: 'TS09',
    districtEn: 'Hyderabad Central',
    districtHi: 'हैदराबाद',
    districtOr: 'ହାଇଦ୍ରାବାଦ',
    stateCode: 'TS',
    stateEn: 'Telangana',
    stateHi: 'तेलंगाना',
    stateOr: 'ତେଲେଙ୍ଗାନା',
  },

  // --- Maharashtra ---
  MH31: {
    code: 'MH31',
    districtEn: 'Nagpur',
    districtHi: 'नागपुर',
    districtOr: 'ନାଗପୁର',
    stateCode: 'MH',
    stateEn: 'Maharashtra',
    stateHi: 'महाराष्ट्र',
    stateOr: 'ମହାରାଷ୍ଟ୍ର',
  },
};

/**
 * Generic alias for Indian RTO Map
 */
export const RTO_MAP = INDIAN_RTO_MAP;

/**
 * Extracts and detects the RTO entry from any Indian vehicle registration input.
 * Supports:
 * - "OD15A1122" / "OD 15 A 1122" / "OD-15-A-1122"
 * - "OR15A1122" (Legacy Odisha prefix OR)
 * - "CG04E1234", "JH05F9876", "WB38A4411", etc.
 * - Bare code like "OD15", "od 15"
 */
export function detectRto(input: string | null | undefined): RtoEntry | null {
  if (!input) return null;

  // Clean the input: uppercase, strip spaces, dashes, dots, and non-alphanumeric chars
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!clean || clean.length < 3) {
    return null;
  }

  // Handle Odisha legacy OR prefix -> map to OD
  let normalized = clean;
  if (normalized.startsWith('OR')) {
    normalized = 'OD' + normalized.slice(2);
  }

  // Match State Code (2 letters) + RTO Digits (1-2 digits)
  const match = normalized.match(/^([A-Z]{2})(\d{1,2})/);
  if (!match) {
    return null;
  }

  const state = match[1];
  const rawDigits = match[2];
  const rtoNum = parseInt(rawDigits, 10);

  if (isNaN(rtoNum) || rtoNum < 1 || rtoNum > 99) {
    return null;
  }

  // Prevent premature single-digit match while user is actively typing e.g. "OD1" before "OD15"
  if (rawDigits.length === 1) {
    const afterDigits = normalized.slice(state.length + 1);
    if (!afterDigits || !/^[A-Z]/.test(afterDigits)) {
      if (!input.toUpperCase().includes('0' + rawDigits) && !new RegExp(`\\b${state}\\s*0?[1-9]\\s+[A-Z]`, 'i').test(input)) {
        return null;
      }
    }
  }

  const paddedCode = `${state}${String(rtoNum).padStart(2, '0')}`;
  return INDIAN_RTO_MAP[paddedCode] || null;
}

/**
 * Specific helper for Odisha RTO detection (backward compatible with existing callers)
 */
export function detectOdishaRto(input: string | null | undefined): RtoEntry | null {
  const rto = detectRto(input);
  if (rto && rto.stateCode === 'OD') {
    return rto;
  }
  return null;
}

/**
 * Parses the vehicle number and returns the correctly localized district string.
 *
 * Examples:
 * - getRtoDisplay('OD15X7273', 'hi') => "संबलपुर (OD15)"
 * - getRtoDisplay('OD15X7273', 'en') => "Sambalpur (OD15)"
 * - getRtoDisplay('OD15X7273', 'or') => "ସମ୍ବଲପୁର (OD15)"
 * - getRtoDisplay('CG04A1122', 'hi') => "रायपुर (CG04)"
 *
 * If the number is invalid, incomplete, or unrecognized, returns null.
 */
export function getRtoDisplay(
  vehicleNumber: string | null | undefined,
  language: string = 'hi'
): string | null {
  const rto = detectRto(vehicleNumber);
  if (!rto) return null;

  const codeDisplay = rto.code;

  switch (language) {
    case 'en':
      return `${rto.districtEn} (${codeDisplay})`;
    case 'or':
      return `${rto.districtOr} (${codeDisplay})`;
    case 'hi':
    default:
      return `${rto.districtHi} (${codeDisplay})`;
  }
}

/**
 * Helper to get list of all registered Odisha RTO entries
 */
export function getAllOdishaRtoCodes(): RtoEntry[] {
  return Object.values(ODISHA_RTO_MAP);
}
