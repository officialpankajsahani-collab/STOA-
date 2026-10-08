import {
  Vehicle,
  LoadingProgram,
  GatePass,
  LedgerEntry,
  AuditLog,
  PukarState,
  ParsedPukarNotice,
  ImportBatch,
  DriverAlertLocation,
  DriverEarningRecord,
  MasterAppConfig,
  ExecutiveOfficer,
  PlantEntity,
  BroadcastTicker,
  DynamicAppFeature,
} from '../src/types/index.js';
import { BUILT_IN_APP_FEATURES } from '../src/utils/featureRegistry.js';

export function normalizeVehicleNumber(raw: string): string {
  if (!raw) return '';
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function formatVehicleDisplay(normalized: string): string {
  if (!normalized) return '';
  const clean = normalizeVehicleNumber(normalized);
  // Match standard Indian format like OD15X7273 -> OD 15 X 7273
  const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})?(\d{1,4})$/);
  if (match) {
    const [, state, dist, series, num] = match;
    return `${state} ${dist}${series ? ' ' + series : ''} ${num}`;
  }
  return clean;
}

export function calculate15to15Cycle(date: Date = new Date()): {
  cycleName: string;
  startDate: string;
  endDate: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  let startYear = year;
  let startMonth = month;
  let endYear = year;
  let endMonth = month;

  if (day >= 16) {
    // Current cycle started on 16th of this month, ends on 15th of next month
    endMonth = month + 1;
    if (endMonth > 11) {
      endMonth = 0;
      endYear += 1;
    }
  } else {
    // Current cycle started on 16th of previous month, ends on 15th of this month
    startMonth = month - 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const cycleName = `16 ${monthNames[startMonth]} ${startYear} – 15 ${monthNames[endMonth]} ${endYear}`;
  const startDate = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-16`;
  const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-15`;

  return { cycleName, startDate, endDate };
}

export function calculateAssociationFee(capacityTon: number): number {
  return capacityTon > 18 ? 700 : 500;
}

// Initial Clean Production Fleet with registered vehicles and their bound mobile numbers
export const initialVehicles: Vehicle[] = [
  {
    id: 'veh-7273',
    normalizedNumber: 'OD15X7273',
    displayNumber: 'OD 15 X 7273',
    ownerName: 'रमेश कुमार साहु (Ramesh Sahu)',
    ownerMobile: '9861012345',
    membershipNumber: 'STOA-M-0412',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    serialNumber: 104,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-09-28',
    address: 'Dhanupali, Sambalpur, Odisha 768005',
    notes: 'Primary Association Carrier',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-7273', expiryDate: '2027-04-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'NIC-TRK-7273', expiryDate: '2027-05-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-7273', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-7273', expiryDate: '2027-03-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-7273', expiryDate: '2027-09-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-7273', expiryDate: '2027-10-10', status: 'VALID' },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'veh-7274',
    normalizedNumber: 'OD15X7274',
    displayNumber: 'OD 15 X 7274',
    ownerName: 'रमेश कुमार साहु (Ramesh Sahu)',
    ownerMobile: '9861012345',
    membershipNumber: 'STOA-M-0412',
    category: '12-Wheel / 18-26 Ton',
    capacityTon: 24,
    serialNumber: 106,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-09-30',
    address: 'Dhanupali, Sambalpur, Odisha 768005',
    notes: 'Secondary Truck for Member Ramesh Sahu (2 Trucks total)',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-7274', expiryDate: '2027-04-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'NIC-TRK-7274', expiryDate: '2027-05-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-7274', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-7274', expiryDate: '2027-03-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-7274', expiryDate: '2027-09-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-7274', expiryDate: '2027-10-10', status: 'VALID' },
    ],
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'veh-7188',
    normalizedNumber: 'OR15R7188',
    displayNumber: 'OR 15 R 7188',
    ownerName: 'अजय कुमार साहनी (Ajay Sahani)',
    ownerMobile: '9861099887',
    membershipNumber: 'STOA-M-0188',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    serialNumber: 101,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-09-28',
    address: 'Khetrajpur, Sambalpur, Odisha 768003',
    notes: 'Member of STOA Core Committee',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-7188', expiryDate: '2027-05-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'OIC-TRK-7188', expiryDate: '2027-06-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-7188', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-7188', expiryDate: '2027-04-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-7188', expiryDate: '2027-10-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-7188', expiryDate: '2027-11-10', status: 'VALID' },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'veh-1122',
    normalizedNumber: 'OD15A1122',
    displayNumber: 'OD 15 A 1122',
    ownerName: 'सरदार सुरिंदर सिंह (Surinder Singh)',
    ownerMobile: '9437012345',
    membershipNumber: 'STOA-M-0001',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    serialNumber: 102,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-05',
    address: 'Dhanupali Main Road, Sambalpur',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-1122', expiryDate: '2027-03-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'NIC-TRK-1122', expiryDate: '2027-04-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-1122', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-1122', expiryDate: '2027-02-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-1122', expiryDate: '2027-08-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-1122', expiryDate: '2027-09-10', status: 'VALID' },
    ],
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z',
  },
  {
    id: 'veh-demo-001',
    normalizedNumber: 'OD15A1001',
    displayNumber: 'OD 15 A 1001',
    ownerName: 'राजेश कुमार शर्मा (Rajesh Sharma)',
    ownerMobile: '9876543210',
    membershipNumber: 'STOA-M-1001',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    serialNumber: 103,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-02',
    address: 'Dhanupali, Sambalpur, Odisha 768005',
    notes: 'Regular carrier for Hindalco Hirakud and Lapanga',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-1001', expiryDate: '2027-03-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'NIC-TRK-1001', expiryDate: '2027-04-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-1001', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-1001', expiryDate: '2027-02-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-1001', expiryDate: '2027-08-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-1001', expiryDate: '2027-09-10', status: 'VALID' },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'veh-demo-002',
    normalizedNumber: 'OD15B2002',
    displayNumber: 'OD 15 B 2002',
    ownerName: 'अमित कुमार पटेल (Amit Patel)',
    ownerMobile: '9876543211',
    membershipNumber: 'STOA-M-1002',
    category: '12-Wheel / 18-26 Ton',
    capacityTon: 24,
    serialNumber: 105,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-01-01',
    membershipExpiryDate: '2027-06-30',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-01',
    address: 'Ainthapali, Sambalpur, Odisha 768004',
    notes: 'Heavy payload bulk material carrier',
    cancellationHistory: [],
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-2002', expiryDate: '2027-05-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'OIC-2002', expiryDate: '2027-06-10', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'TAX-2002', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'FIT-2002', expiryDate: '2027-04-12', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-OD-2002', expiryDate: '2027-07-30', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-2002', expiryDate: '2027-08-30', status: 'VALID' },
    ],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
];

// Sample Demo Fleet (Available on-demand for sales demonstrations)
export const DEMO_SAMPLE_VEHICLES: Vehicle[] = [
  {
    id: 'veh-demo-001',
    normalizedNumber: 'OD15A1001',
    displayNumber: 'OD 15 A 1001',
    ownerName: 'राजेश कुमार शर्मा (Rajesh Sharma)',
    ownerMobile: '9876543210',
    membershipNumber: 'STOA-M-1001',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    serialNumber: 101,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-04-01',
    membershipExpiryDate: '2027-03-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-02',
    address: 'Dhanupali, Sambalpur, Odisha 768005',
    notes: 'Regular carrier for Hindalco Hirakud and Lapanga',
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-1001', expiryDate: '2027-03-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'NIC-TRK-1001', expiryDate: '2027-04-30', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'OD-TAX-1001', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'OD-FIT-1001', expiryDate: '2027-02-20', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-IND-1001', expiryDate: '2027-08-14', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-1001', expiryDate: '2027-09-10', status: 'VALID' },
    ],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'veh-demo-002',
    normalizedNumber: 'OD15B2002',
    displayNumber: 'OD 15 B 2002',
    ownerName: 'अमित कुमार पटेल (Amit Patel)',
    ownerMobile: '9876543211',
    membershipNumber: 'STOA-M-1002',
    category: '12-Wheel / 18-26 Ton',
    capacityTon: 24,
    serialNumber: 102,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-01-01',
    membershipExpiryDate: '2027-06-30',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-01',
    address: 'Ainthapali, Sambalpur, Odisha 768004',
    notes: 'Heavy payload bulk material carrier',
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-2002', expiryDate: '2027-05-15', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'OIC-2002', expiryDate: '2027-06-10', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'TAX-2002', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'FIT-2002', expiryDate: '2027-04-12', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-OD-2002', expiryDate: '2027-07-30', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-OD-2002', expiryDate: '2027-08-30', status: 'VALID' },
    ],
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'veh-demo-003',
    normalizedNumber: 'OD15C3003',
    displayNumber: 'OD 15 C 3003',
    ownerName: 'सुनील कुमार प्रधान (Sunil Pradhan)',
    ownerMobile: '9876543212',
    membershipNumber: 'STOA-M-1003',
    category: 'Trailer / Other',
    capacityTon: 31,
    serialNumber: 103,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-02-01',
    membershipExpiryDate: '2027-05-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-03',
    address: 'Khetrajpur, Sambalpur',
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-3003', expiryDate: '2027-04-20', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'BA-TRK-3003', expiryDate: '2027-05-20', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'TAX-3003', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'FIT-3003', expiryDate: '2027-03-15', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-3003', expiryDate: '2027-06-20', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-3003', expiryDate: '2027-07-28', status: 'VALID' },
    ],
    createdAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'veh-demo-004',
    normalizedNumber: 'OD15D4004',
    displayNumber: 'OD 15 D 4004',
    ownerName: 'दिलीप कुमार साहु (Dilip Sahu)',
    ownerMobile: '9876543213',
    membershipNumber: 'STOA-M-1004',
    category: 'Trailer / Other',
    capacityTon: 40,
    serialNumber: 104,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-01-01',
    membershipExpiryDate: '2027-08-31',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-02',
    address: 'Baraipali Industrial Area, Sambalpur',
    documents: [
      { docType: 'PUC', docNumber: 'PUC-4004', expiryDate: '2027-06-28', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'UIIC-4004', expiryDate: '2027-07-15', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'TAX-4004', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'FIT-4004', expiryDate: '2027-05-10', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-4004', expiryDate: '2027-09-19', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-4004', expiryDate: '2027-10-10', status: 'VALID' },
    ],
    createdAt: '2026-01-05T08:30:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
  {
    id: 'veh-demo-005',
    normalizedNumber: 'OD15E5005',
    displayNumber: 'OD 15 E 5005',
    ownerName: 'मनोज कुमार स्वाईं (Manoj Swain)',
    ownerMobile: '9876543214',
    membershipNumber: 'STOA-M-1005',
    category: '6-Wheel / 10-12 Ton',
    capacityTon: 11,
    serialNumber: 105,
    membershipStatus: 'ACTIVE',
    membershipStartDate: '2026-03-15',
    membershipExpiryDate: '2027-04-30',
    isBlacklisted: false,
    status: 'IN_QUEUE',
    lastLoadedDate: '2026-10-03',
    address: 'Burla, Sambalpur',
    documents: [
      { docType: 'PUC', docNumber: 'OD-PUC-5005', expiryDate: '2027-05-10', status: 'VALID' },
      { docType: 'Insurance', docNumber: 'HDFC-5005', expiryDate: '2027-06-25', status: 'VALID' },
      { docType: 'Road Tax', docNumber: 'TAX-5005', expiryDate: '2027-03-31', status: 'VALID' },
      { docType: 'Fitness', docNumber: 'FIT-5005', expiryDate: '2027-04-05', status: 'VALID' },
      { docType: 'National Permit', docNumber: 'NP-5005', expiryDate: '2027-08-15', status: 'VALID' },
      { docType: 'Odisha Permit', docNumber: 'OP-5005', expiryDate: '2027-09-20', status: 'VALID' },
    ],
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z',
  },
];

// Initial Loading Programs (Clean production instance starts with 0 programs)
export const initialLoadingPrograms: LoadingProgram[] = [];

// Demo Loading Programs (For sales presentation)
export const DEMO_SAMPLE_PROGRAMS: LoadingProgram[] = [
  {
    id: 'prog-001',
    company: 'Hindalco Samelter',
    destination: 'Visakhapatnam Port (Andhra Pradesh)',
    categoryRequired: '10-Wheel / 16-18 Ton',
    capacityTonRequired: 18,
    totalQuota: 25,
    bookedCount: 14,
    ratePerTon: 2450,
    advancePercentage: 70,
    pendingFreightAllowed: true,
    preferenceRule: 'Regular Sambalpur Smelter Line',
    isActive: true,
    createdAt: '2026-09-25T06:00:00Z',
  },
  {
    id: 'prog-002',
    company: 'Aditya Birla Lapanga',
    destination: 'Raipur (Chhattisgarh)',
    categoryRequired: '12-Wheel / 18-26 Ton',
    capacityTonRequired: 24,
    totalQuota: 18,
    bookedCount: 9,
    ratePerTon: 1850,
    advancePercentage: 75,
    pendingFreightAllowed: false,
    preferenceRule: 'Lapanga Priority Line',
    isActive: true,
    createdAt: '2026-09-25T07:30:00Z',
  },
  {
    id: 'prog-003',
    company: 'Vedanta Limited',
    destination: 'Kolkata Dock (West Bengal)',
    categoryRequired: 'Trailer / Other',
    capacityTonRequired: 35,
    totalQuota: 10,
    bookedCount: 4,
    ratePerTon: 3100,
    advancePercentage: 65,
    pendingFreightAllowed: true,
    preferenceRule: 'Heavy Ingot Coil Dispatch',
    isActive: true,
    createdAt: '2026-09-24T10:00:00Z',
  },
  {
    id: 'prog-004',
    company: 'Blue Fox',
    destination: 'Nagpur (Maharashtra)',
    categoryRequired: '10-Wheel / 16-18 Ton',
    capacityTonRequired: 16,
    totalQuota: 12,
    bookedCount: 5,
    ratePerTon: 2600,
    advancePercentage: 70,
    pendingFreightAllowed: false,
    preferenceRule: 'Fast Turnaround Expressway',
    isActive: true,
    createdAt: '2026-09-25T08:00:00Z',
  },
];

// Initial Pukar Notice parsed from official STOA program announcement
export const initialPukarNotice: ParsedPukarNotice = {
  id: 'puk-notice-init',
  title: 'ALUMINIUM PUKAR PROGRAM FOR TODAY AT 4 PM',
  rawText: `ALUMINIUM PUKAR PROGRAM FOR TODAY AT 4 PM

TODAY LOADING DT. 16/12/25
SMELTER
BELUR 18MT 03 VEHICLES RI,

FRP BLUEFOX
BHIWANDI + TALOJA 18MT 01 VEHICLE COIL/SHEET 2 POINT.
MAUDA 10 VEHICLE COIL.
18MT 04 VEHICLES 
16MT 06 VEHICLES.
KANPUR 16MT 01 VEHICLE COIL/SHEET.
TALOJA 16MT 01 VEHICLES COIL/SHEET 2 POINT.
BELUR 16MT 04 VEHICLES COIL.
BANGALORE 16MT  01  VEHICLE COIL/SHEET 2 POINT.

TOMORROW LOADING DT. 17/12/25
SMELTER 
BELUR 18MT 02 VEHICLES
01 VEHICLE RI
01 VEHICLE COIL.

TALOJA VIA RAIPUR 16MT 04 VEHICLES RI, CHALLAN CHANGE WILL BE HELD AT RAIPUR.


12 WHEELER PROGRAMME 

TODAY LOADING 
FRP BLUEFOX
HOWRAH 25MT 01 VEHICLE COIL.


TODAY LOADING 
ALL  PROGRAM,
&
TOMORROW LOADING 
BELUR COIL,
FIRST ROUND CUTTING SECOND ROUND PENDING.`,
  publishedAt: '2026-09-26T08:00:00Z',
  publishedBy: 'Admin Control Room (Dhanupali)',
  active: true,
  cuttingRule: 'FIRST ROUND CUTTING SECOND ROUND PENDING',
  items: [
    // TODAY LOADING
    {
      id: 'puk-item-1',
      plantSection: 'SMELTER',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'BELUR',
      cargo: 'RI',
      capacityMt: 18,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 3,
      bookedCount: 1,
      remarks: 'Direct Belur Smelter Line',
      ratePerTon: 2450,
    },
    {
      id: 'puk-item-2',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'BHIWANDI + TALOJA',
      cargo: 'COIL/SHEET 2 POINT',
      capacityMt: 18,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 1,
      bookedCount: 0,
      remarks: '2 POINT DELIVERY',
      ratePerTon: 2850,
    },
    {
      id: 'puk-item-3',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'MAUDA',
      cargo: 'COIL',
      capacityMt: 18,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 4,
      bookedCount: 2,
      remarks: '18MT COIL (MAUDA 10 VEHICLE POOL)',
      ratePerTon: 2150,
    },
    {
      id: 'puk-item-4',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'MAUDA',
      cargo: 'COIL',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 6,
      bookedCount: 3,
      remarks: '16MT COIL',
      ratePerTon: 2150,
    },
    {
      id: 'puk-item-5',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'KANPUR',
      cargo: 'COIL/SHEET',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 1,
      bookedCount: 0,
      remarks: 'Direct Kanpur line',
      ratePerTon: 2700,
    },
    {
      id: 'puk-item-6',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'TALOJA',
      cargo: 'COIL/SHEET 2 POINT',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 1,
      bookedCount: 0,
      remarks: '2 POINT DELIVERY',
      ratePerTon: 2800,
    },
    {
      id: 'puk-item-7',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'BELUR',
      cargo: 'COIL',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 4,
      bookedCount: 1,
      remarks: '16MT COIL',
      ratePerTon: 2450,
    },
    {
      id: 'puk-item-8',
      plantSection: 'FRP BLUEFOX',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'BANGALORE',
      cargo: 'COIL/SHEET 2 POINT',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 1,
      bookedCount: 0,
      remarks: '2 POINT DELIVERY',
      ratePerTon: 3100,
    },
    // TOMORROW LOADING
    {
      id: 'puk-item-9',
      plantSection: 'SMELTER',
      dateSection: 'TOMORROW',
      dateLabel: 'DT. 17/12/25',
      destination: 'BELUR',
      cargo: '01 VEHICLE RI + 01 VEHICLE COIL',
      capacityMt: 18,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 2,
      bookedCount: 0,
      remarks: '01 RI & 01 COIL',
      ratePerTon: 2450,
    },
    {
      id: 'puk-item-10',
      plantSection: 'SMELTER',
      dateSection: 'TOMORROW',
      dateLabel: 'DT. 17/12/25',
      destination: 'TALOJA VIA RAIPUR',
      cargo: 'RI',
      capacityMt: 16,
      categoryRequired: '10-Wheel / 16-18 Ton',
      vehicleQuota: 4,
      bookedCount: 0,
      remarks: 'CHALLAN CHANGE WILL BE HELD AT RAIPUR',
      ratePerTon: 2900,
    },
    // 12 WHEELER PROGRAMME
    {
      id: 'puk-item-11',
      plantSection: '12 WHEELER PROGRAMME',
      dateSection: 'TODAY',
      dateLabel: 'DT. 16/12/25',
      destination: 'HOWRAH',
      cargo: 'COIL',
      capacityMt: 25,
      categoryRequired: '12-Wheel / 18-26 Ton',
      vehicleQuota: 1,
      bookedCount: 0,
      remarks: '12 Wheeler Heavy Ingot Coil',
      ratePerTon: 2550,
    },
  ],
};

// Initial Pukar State (Clean slate: No phantom loading program until Admin publishes one)
export const initialPukarState: PukarState = {
  isActive: false,
  mode: 'GENERAL',
  currentProgressSerial: 0,
  modeSwitchSerial: 0,
  currentCycle: calculate15to15Cycle().cycleName,
  startSerial: 0,
  endSerial: 0,
  announcedAt: '2026-10-06T08:00:00Z',
  announcedBy: 'Admin Control Room (Dhanupali)',
  announcementHi: 'वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है।',
  announcementEn: 'No loading program is currently active. Daily loading pukar operates at 10:00 AM and 04:00 PM.',
  announcementOr: 'ବର୍ତ୍ତମାନ କୌଣସି ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ସକ୍ରିୟ ନାହିଁ।',
  activeProgramsCount: 0,
  currentNotice: undefined,
};

// Initial Gate Passes (Clean production instance)
export const initialGatePasses: GatePass[] = [];

// Demo Gate Passes (For sales presentation)
export const DEMO_SAMPLE_GATE_PASSES: GatePass[] = [
  {
    id: 'pass-001',
    token: 'STOA-2026-1001',
    currentSerial: 101,
    nextSerial: 102,
    vehicleNumber: 'OD15A1001',
    ownerName: 'राजेश कुमार शर्मा',
    ownerMobile: '9876543210',
    category: '10-Wheel / 16-18 Ton',
    capacityTon: 18,
    company: 'Hindalco Samelter',
    destination: 'Visakhapatnam Port',
    programId: 'prog-001',
    issueDate: '2026-10-04',
    issueTime: '08:45:10',
    paymentStatus: 'VERIFIED_PAID',
    paymentAmount: 500,
    paymentReference: 'UPI-STOA-9921827',
    paidAt: '2026-10-04T08:50:00Z',
    status: 'VALID',
    qrPayload: 'STOA|STOA-2026-1001|OD15A1001|101|18T|HINDALCO|PAID|VERIFIED',
  },
  {
    id: 'pass-002',
    token: 'STOA-2026-1002',
    currentSerial: 102,
    nextSerial: 103,
    vehicleNumber: 'OD15B2002',
    ownerName: 'अमित कुमार पटेल',
    ownerMobile: '9876543211',
    category: '12-Wheel / 18-26 Ton',
    capacityTon: 24,
    company: 'Aditya Birla Lapanga',
    destination: 'Raipur',
    programId: 'prog-002',
    issueDate: '2026-10-04',
    issueTime: '09:15:22',
    paymentStatus: 'VERIFIED_PAID',
    paymentAmount: 700,
    paymentReference: 'CASH-REC-00812',
    paidAt: '2026-10-04T09:20:00Z',
    status: 'VALID',
    qrPayload: 'STOA|STOA-2026-1002|OD15B2002|102|24T|LAPANGA|PAID|VERIFIED',
  },
];

// Initial Ledger Entries (Clean production instance)
export const initialLedger: LedgerEntry[] = [];

// Demo Ledger Entries (For sales presentation)
export const DEMO_SAMPLE_LEDGER: LedgerEntry[] = [
  {
    id: 'led-001',
    token: 'STOA-2026-1001',
    loadingDate: '2026-10-04',
    cycle: calculate15to15Cycle().cycleName,
    currentSerial: 101,
    newSerial: 102,
    vehicleNumber: 'OD15A1001',
    ownerName: 'राजेश कुमार शर्मा',
    company: 'Hindalco Samelter',
    route: 'Visakhapatnam Port',
    status: 'VALID',
    paymentStatus: 'VERIFIED_PAID',
    amountPaid: 500,
    driverName: 'बुलू सेठी',
    notes: 'Loaded on time. Normal rotation applied.',
  },
  {
    id: 'led-002',
    token: 'STOA-2026-1002',
    loadingDate: '2026-10-04',
    cycle: calculate15to15Cycle().cycleName,
    currentSerial: 102,
    newSerial: 103,
    vehicleNumber: 'OD15B2002',
    ownerName: 'अमित कुमार पटेल',
    company: 'Aditya Birla Lapanga',
    route: 'Raipur',
    status: 'VALID',
    paymentStatus: 'VERIFIED_PAID',
    amountPaid: 700,
    driverName: 'सुनील बाग',
    notes: 'Heavy vehicle fee ₹700 collected via cash desk.',
  },
];

// Initial Audit Logs (Clean production instance)
export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-init-001',
    timestamp: '2026-10-04T00:00:00Z',
    actor: 'System SuperAdmin',
    actorRole: 'SUPER_ADMIN',
    action: 'SYSTEM_SETTINGS_UPDATE',
    field: 'database',
    oldValue: '-',
    newValue: 'Clean Production Instance Initialized',
    source: 'DISPATCH_ACTION',
    notes: 'STOA NEXTGEN Commercial Production ERP initialized. Clean database ready for production fleet registration.',
  },
];

// Initial Import History (Clean production instance)
export const initialImportBatches: ImportBatch[] = [];

// Driver Alert Locations (Geofenced Zones in Sambalpur region)
export const initialAlertLocations: DriverAlertLocation[] = [
  {
    id: 'geo-001',
    name: 'STOA Head Office (Dhanupali)',
    zone: 'Dhanupali Main Gate',
    latitude: 21.4552,
    longitude: 83.9855,
    radiusMeters: 500,
    alertType: 'ENTRY',
    messageHi: 'संबलपुर ट्रक ओनर्स एसोसिएशन मुख्य कार्यालय क्षेत्र में आपका स्वागत है। पास काउंटर खुला है।',
    messageEn: 'Welcome to STOA Head Office Dhanupali. Gate pass counter is active.',
    messageOr: 'ଏସ.ଟି.ଓ.ଏ ମୁଖ୍ୟ କାର୍ଯ୍ୟାଳୟ ଧନୁପାଲି କୁ ସ୍ଵାଗତ। ଗେଟ୍ ପାସ୍ କାଉଣ୍ଟର ଖୋଲା ଅଛି।',
    activeTruckCount: 14,
  },
  {
    id: 'geo-002',
    name: 'Hindalco Smelter (Hirakud)',
    zone: 'Hirakud Dispatch Yard',
    latitude: 21.5284,
    longitude: 83.8711,
    radiusMeters: 1200,
    alertType: 'QUEUE_CALL',
    messageHi: 'हिंडाल्को स्मेल्टर: क्रम संख्या 101 से 110 वाले ट्रक इनवर्ड बे में लाइन अप करें।',
    messageEn: 'Hindalco Smelter: Serial numbers 101 to 110 line up at inward bay.',
    messageOr: 'ହିଣ୍ଡାଲକୋ ସ୍ମେଲ୍ଟର: ସିରିଆଲ୍ ୧୦୧ ରୁ ୧୧୦ ଇନୱାର୍ଡ ବେ ରେ ଲାଇନ୍ କରନ୍ତୁ।',
    activeTruckCount: 28,
  },
  {
    id: 'geo-003',
    name: 'Aditya Birla Plant (Lapanga)',
    zone: 'Lapanga Weighbridge 02',
    latitude: 21.7214,
    longitude: 84.0289,
    radiusMeters: 1500,
    alertType: 'SPEED_WARNING',
    messageHi: 'लपंगा प्लांट क्षेत्र: गति सीमा 20 किमी/घंटा का पालन करें और हेल्मेट/जूते अनिवार्य पहनें।',
    messageEn: 'Lapanga Plant: Speed limit 20 km/h. PPE kit mandatory.',
    messageOr: 'ଲପଙ୍ଗା ପ୍ଲାଣ୍ଟ: ଗତି ସୀମା ୨୦ କିମି/ଘଣ୍ଟା ମାନନ୍ତୁ। ପିପିଇ କିଟ୍ ବାଧ୍ୟତାମୂଳକ।',
    activeTruckCount: 19,
  },
  {
    id: 'geo-004',
    name: 'Jamadarpali Truck Terminal',
    zone: 'NH-53 Parking Plaza',
    latitude: 21.5031,
    longitude: 84.0512,
    radiusMeters: 800,
    alertType: 'PARKING_FULL',
    messageHi: 'जमादारपाली पार्किंग बे 3 में खाली जगह उपलब्ध है। ड्राइवर विश्राम गृह और भोजनालय खुला है।',
    messageEn: 'Jamadarpali Parking Bay 3 has parking slots available. Rest house active.',
    messageOr: 'ଜମାଦାରପାଲି ପାର୍କିଂ ବେ ୩ ରେ ସ୍ଥାନ ଉପଲବ୍ଧ ଅଛି। ବିଶ୍ରାମ ଗୃହ ଖୋଲା।',
    activeTruckCount: 42,
  },
];

// Driver Earnings History
export const initialDriverEarnings: DriverEarningRecord[] = [
  {
    id: 'earn-001',
    tripDate: '2026-09-22',
    token: 'STOA-2026-0988',
    destination: 'Nagpur (Maharashtra)',
    grossFreight: 41600,
    associationFee: 500,
    dieselAdvance: 22000,
    cashAdvance: 7000,
    netPendingBalance: 12100,
    status: 'SETTLED',
  },
  {
    id: 'earn-002',
    tripDate: '2026-09-14',
    token: 'STOA-2026-0941',
    destination: 'Visakhapatnam Port',
    grossFreight: 44100,
    associationFee: 500,
    dieselAdvance: 24000,
    cashAdvance: 6500,
    netPendingBalance: 13100,
    status: 'SETTLED',
  },
  {
    id: 'earn-003',
    tripDate: '2026-09-03',
    token: 'STOA-2026-0899',
    destination: 'Raipur (Chhattisgarh)',
    grossFreight: 33300,
    associationFee: 500,
    dieselAdvance: 17500,
    cashAdvance: 5000,
    netPendingBalance: 10300,
    status: 'SETTLED',
  },
];

export const initialMasterConfig: MasterAppConfig = {
  associationName: 'संबलपुर ट्रक ओनर्स एसोसिएशन',
  tagline: '15-टू-15 आवर्तन एवं डिजिटल लोडिंग प्रबंधन',
  estdYear: '1982',
  regNumber: 'OR/SBP/1982/0488',
  address: 'एसटीओए भवन, जमादारपाली ट्रक टर्मिनल, एनएच-53, संबलपुर, ओडिशा - 768200',
  helplineMobile: '+91 94370 12345',
  emergencyMobile: '112 / 1033 (NHAI) / +91 98610 99999',
  email: 'contact@stoa-sambalpur.org',
  upiId: 'stoa.sambalpur@sbi',

  // 15-to-15 Rotation rules
  rotationCycle1Days: '1 से 15 तारीख',
  rotationCycle2Days: '16 से माह अंतिम तारीख',
  rotationJumpPenaltySerials: 50,
  absentGraceHours: 2,
  preserveRotationOnPendingFreight: true,

  // Fee Slabs
  heavyFeeAbove18Ton: 700,
  standardFeeUpTo18Ton: 500,
  membership6Months: 1000,
  membership12Months: 1800,
  membership24Months: 3200,

  // Security
  adminPin: '1234',

  // Live Broadcast Marquee Ticker
  ticker: {
    id: 'tick-001',
    text: '📢 संबलपुर ट्रक ओनर्स एसोसिएशन: 15-टू-15 आवर्तन का कड़ाई से पालन करें। बिना डिजिटल पर्ची के किसी भी प्लांट में लोडिंग वर्जित है। 24x7 कंट्रोल रूम: 9437012345',
    type: 'INFO',
    isActive: true,
    updatedAt: new Date().toISOString(),
  },

  // Leadership & Executive Directory
  executives: [
    {
      id: 'exec-1',
      name: 'सरदार बलविंदर सिंह (Sardar Balwinder Singh)',
      designation: 'प्रेसिडेंट (अध्यक्ष)',
      mobile: '+91 94370 11111',
      plantInCharge: 'समस्त उद्योग व नीतिगत निर्णय',
      isActive: true,
    },
    {
      id: 'exec-2',
      name: 'श्री निरंजन त्रिपाठी',
      designation: 'महासचिव (General Secretary)',
      mobile: '+91 94370 22222',
      plantInCharge: 'कार्यालय प्रशासन व सदस्यता',
      isActive: true,
    },
    {
      id: 'exec-3',
      name: 'श्री राजेश कुमार अग्रवाल',
      designation: 'कोषाध्यक्ष (Treasurer)',
      mobile: '+91 94370 33333',
      plantInCharge: 'वित्तीय लेखा व 15-टू-15 लेजर',
      isActive: true,
    },
    {
      id: 'exec-4',
      name: 'श्री देवेन्द्र प्रधान',
      designation: 'उपाध्यक्ष (Vice President)',
      mobile: '+91 94370 44444',
      plantInCharge: 'आदित्य बिड़ला लपंगा प्लांट प्रभारी',
      isActive: true,
    },
    {
      id: 'exec-5',
      name: 'श्री सुखविंदर गिल',
      designation: 'संयुक्त सचिव (Joint Secretary)',
      mobile: '+91 94370 55555',
      plantInCharge: 'हिंडाल्को स्मेल्टर हिराकुद प्रभारी',
      isActive: true,
    },
    {
      id: 'exec-6',
      name: 'एडवोकेट पी.के. पटनायक',
      designation: 'कानूनी सलाहकार (Legal Advisor)',
      mobile: '+91 94370 66666',
      plantInCharge: 'आरटीओ, पुलिस व टोल कानूनी संरक्षण',
      isActive: true,
    },
  ],

  // Industrial Plants
  plants: [
    {
      id: 'plt-1',
      name: 'हिंडाल्को स्मेल्टर प्लांट',
      code: 'HINDALCO',
      location: 'हिराकुद, संबलपुर',
      dailyCapacity: 180,
      contactPerson: 'श्री एम.के. शर्मा (डिस्पैच हेड)',
      contactMobile: '+91 98610 11001',
      isActive: true,
      destinations: ['रायपुर', 'विशाखापट्टनम', 'हल्दिया', 'नागपुर', 'कटक', 'कोलकाता'],
    },
    {
      id: 'plt-2',
      name: 'आदित्य बिड़ला लपंगा एल्युमिनियम',
      code: 'LAPANGA',
      location: 'लपंगा, संबलपुर',
      dailyCapacity: 220,
      contactPerson: 'श्री आर.एन. मोहंती (लॉजिस्टिक्स)',
      contactMobile: '+91 98610 11002',
      isActive: true,
      destinations: ['झारसुगुड़ा', 'रायपुर', 'राउरकेला', 'बिलासपुर', 'हैदराबाद'],
    },
    {
      id: 'plt-3',
      name: 'वेदांता लिमिटेड',
      code: 'VEDANTA',
      location: 'झारसुगुड़ा (संबलपुर जोन)',
      dailyCapacity: 250,
      contactPerson: 'श्री अमिताभ पांडा',
      contactMobile: '+91 98610 11003',
      isActive: true,
      destinations: ['विशाखापट्टनम पोर्ट', 'हल्दिया', 'पारादीप पोर्ट', 'नागपुर'],
    },
    {
      id: 'plt-4',
      name: 'अन्य इस्पात व सीमेंट उद्योग',
      code: 'OTHER',
      location: 'बरगढ़ / संबलपुर इंडस्ट्रियल जोन',
      dailyCapacity: 90,
      contactPerson: 'कंट्रोल रूम प्रभारी',
      contactMobile: '+91 94370 12345',
      isActive: true,
      destinations: ['संबलपुर लोकल', 'सोनपुर', 'भुवनेश्वर', 'कटक'],
    },
  ],

  // Auto-Discovered and Dynamic Features Registry
  dynamicFeatures: [...BUILT_IN_APP_FEATURES],
};

