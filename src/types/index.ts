export type UserRole = 'OWNER' | 'ADMIN' | 'SUPER_ADMIN';

export type VehicleCategory =
  | '6-Wheel / 10-12 Ton'
  | '10-Wheel / 16-18 Ton'
  | '12-Wheel / 18-26 Ton'
  | 'Trailer / Other';

export const VEHICLE_CATEGORIES: VehicleCategory[] = [
  '6-Wheel / 10-12 Ton',
  '10-Wheel / 16-18 Ton',
  '12-Wheel / 18-26 Ton',
  'Trailer / Other',
];

export type DocumentStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface VehicleDocument {
  docType: 'PUC' | 'Insurance' | 'Road Tax' | 'Fitness' | 'National Permit' | 'Odisha Permit';
  docNumber: string;
  expiryDate: string; // YYYY-MM-DD
  status: DocumentStatus;
  notes?: string;
}

export interface Vehicle {
  id: string;
  normalizedNumber: string; // e.g. "OD15X7273"
  displayNumber: string; // e.g. "OD 15 X 7273"
  ownerName: string;
  ownerMobile: string;
  membershipNumber: string;
  category: VehicleCategory;
  capacityTon: number; // e.g. 16, 22, 28, 40
  serialNumber: number; // Current rotation serial
  membershipStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'INACTIVE';
  membershipStartDate: string;
  membershipExpiryDate: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
  status: 'ACTIVE' | 'IN_QUEUE' | 'LOADED_TODAY' | 'MAINTENANCE' | 'ARCHIVED';
  lastLoadedDate?: string;
  documents: VehicleDocument[];
  address?: string;
  photoUrl?: string;
  notes?: string;
  renewalCount?: number; // Total count of membership renewals for this vehicle
  renewalHistory?: MembershipRenewalReceipt[]; // Permanent record of all renewals
  cancellationHistory?: SlipCancellationRecord[]; // Permanent record of all slip cancellations
  createdAt: string;
  updatedAt: string;
}

export interface SlipCancellationRecord {
  id: string; // cancellation event ID
  passId: string;
  token: string;
  vehicleNumber: string;
  programTitle: string; // Plant / Destination description
  destination: string;
  cancelledAt: string; // ISO date-time
  cancelledBy: string; // e.g. "मालिक (Owner)" or "एडमिन (Admin)"
  cancellationReason: string;
  originalSerial: number;
}

export interface MembershipRenewalReceipt {
  id: string; // e.g. "REN-2026-0239"
  receiptNumber: number; // e.g. 239
  receiptNumberFormatted: string; // e.g. "239"
  dateFormatted: string; // e.g. "14-05-2025" or "04-10-2026"
  ownerName: string; // e.g. "PANKAJ KUMAR SAHANI"
  ownerMobile: string; // e.g. "9437056834"
  vehicleNumber: string; // e.g. "OD15X7273"
  displayNumber: string; // e.g. "OD 15X 7273"
  membershipNumber: string; // e.g. "2731273"
  feeAmount: number; // e.g. 300
  feeInWords: string; // e.g. "THREE HUNDRED ONLY"
  renewalYear: string; // e.g. "2025-26" or "2026-27"
  monthsAdded: number; // e.g. 12
  previousExpiryDate: string; // YYYY-MM-DD
  newExpiryDate: string; // YYYY-MM-DD
  renewalCountForVehicle: number; // 1, 2, 3...
  paymentMode: 'CASH' | 'ONLINE' | 'UPI';
  issuedBy: string; // e.g. "Admin Control Room"
  issuedAt: string; // ISO date string
  notes?: string;
}

export interface OwnerUser {
  id: string;
  role: 'OWNER';
  ownerName: string;
  mobile: string;
  vehicleNumber: string;
  membershipNumber: string;
  photoUrl?: string;
  token?: string;
}

export interface AdminUser {
  id: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  adminId: string;
  name: string;
  email?: string;
  token?: string;
}

export interface ParsedPukarItem {
  id: string;
  plantSection: string; // e.g. "SMELTER", "FRP BLUEFOX", "12 WHEELER PROGRAMME"
  dateSection: 'TODAY' | 'TOMORROW' | 'SPECIAL';
  dateLabel: string; // e.g. "DT. 16/12/25" or "DT. 17/12/25"
  destination: string; // e.g. "BELUR", "BHIWANDI + TALOJA", "MAUDA", "KANPUR"
  cargo: string; // e.g. "COIL", "RI", "COIL/SHEET 2 POINT"
  capacityMt: number; // e.g. 18, 16, 25
  categoryRequired: VehicleCategory;
  vehicleQuota: number;
  bookedCount: number;
  remarks?: string; // e.g. "CHALLAN CHANGE WILL BE HELD AT RAIPUR"
  ratePerTon?: number;
}

export interface ParsedPukarNotice {
  id: string;
  title: string; // e.g. "ALUMINIUM PUKAR PROGRAM FOR TODAY AT 4 PM"
  rawText: string;
  publishedAt: string;
  publishedBy: string;
  active: boolean;
  cuttingRule?: string; // "FIRST ROUND CUTTING SECOND ROUND PENDING"
  items: ParsedPukarItem[];
}

export interface PukarShiftSchedule {
  currentShift: 'MORNING' | 'EVENING' | 'OFF_HOURS';
  nextShiftTime: string;
  nextShiftLabelHi: string;
  nextShiftLabelEn: string;
  nextShiftLabelOr: string;
  morningTimeDisplay: string;
  eveningTimeDisplay: string;
  timeRemainingSeconds: number;
  isShiftActiveWindow: boolean;
  autoScheduleMode: boolean;
}

export type PukarMode = 'GENERAL' | 'PENDING' | 'PREFERENCE';

export interface PukarModeConversion {
  fromMode: PukarMode;
  toMode: PukarMode;
  atSerial: number;
  timestamp: string;
  actor: string;
  reason?: string;
}

export interface PukarState {
  isActive: boolean;
  mode: PukarMode; // 'GENERAL' | 'PENDING' | 'PREFERENCE'
  currentProgressSerial: number; // Current point reached in serial rotation
  modeSwitchSerial?: number; // Serial number at which conversion occurred
  modeSwitchedAt?: string; // Timestamp of mode conversion
  modeConversionHistory?: PukarModeConversion[]; // History of mode conversions
  currentCycle: string; // e.g. "16 Feb 2026 – 15 Mar 2026"
  startSerial: number;
  endSerial: number;
  announcedAt?: string;
  announcedBy?: string;
  announcementHi: string;
  announcementEn: string;
  announcementOr: string;
  activeProgramsCount: number;
  currentNotice?: ParsedPukarNotice;
  scheduleInfo?: PukarShiftSchedule;
  autoShiftScheduleEnabled?: boolean;
}

export interface SlipCutSummary {
  id: string; // gatePass id
  token: string;
  vehicleNumber: string;
  currentSerial: number;
  nextSerial: number;
  ownerName: string;
  ownerMobile: string;
  issueDate: string;
  issueTime: string;
  paymentStatus: 'UNPAID' | 'VERIFIED_PAID' | 'WAIVED';
}

export interface LoadingProgram {
  id: string;
  company: 'Hindalco Samelter' | 'Blue Fox' | 'Aditya Birla Lapanga' | 'Vedanta Limited' | 'Other';
  companyCustomName?: string;
  destination: string; // e.g., "Visakhapatnam", "Nagpur", "Kolkata", "Raipur", "Haldia"
  categoryRequired: VehicleCategory;
  capacityTonRequired: number;
  totalQuota: number;
  bookedCount: number;
  ratePerTon: number;
  advancePercentage: number;
  pendingFreightAllowed: boolean;
  preferenceRule?: string; // e.g., "Local Sambalpur Preference"
  programType?: PukarMode; // 'GENERAL' | 'PENDING' | 'PREFERENCE'
  dateSection?: 'TODAY' | 'TOMORROW' | 'SPECIAL';
  dateLabel?: string;
  cargo?: string;
  isActive: boolean;
  createdAt: string;
  slips?: SlipCutSummary[];
}

export interface GatePass {
  id: string;
  token: string; // e.g., "STOA-2026-1042"
  currentSerial: number;
  nextSerial: number;
  vehicleNumber: string;
  ownerName: string;
  ownerMobile: string;
  category: VehicleCategory;
  capacityTon: number;
  company: string;
  companyName?: string;
  driverName?: string;
  destination: string;
  programId: string;
  issueDate: string; // YYYY-MM-DD
  issueTime: string; // HH:mm:ss
  paymentStatus: 'UNPAID' | 'VERIFIED_PAID' | 'WAIVED';
  paymentAmount: number; // ₹700 if > 18 ton, else ₹500
  paymentReference?: string;
  paidAt?: string;
  status: 'VALID' | 'COMPLETED' | 'CANCELLED';
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  qrPayload: string;
}

export interface LedgerEntry {
  id: string;
  token: string;
  loadingDate: string;
  cycle: string;
  currentSerial: number;
  newSerial: number;
  vehicleNumber: string;
  ownerName: string;
  company: string;
  route: string;
  status: 'VALID' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'VERIFIED_PAID';
  amountPaid: number;
  driverName?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  vehicleNumber?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  source: 'MANUAL_EDIT' | 'EXCEL_IMPORT' | 'CSV_IMPORT' | 'BULK_UPDATE' | 'DISPATCH_ACTION' | 'PAYMENT_VERIFICATION' | 'AUTO_DISCOVERY';
  batchId?: string;
  notes?: string;
}

export interface ImportBatch {
  id: string;
  fileName: string;
  importedAt: string;
  adminName: string;
  totalRows: number;
  newCount: number;
  updatedCount: number;
  unchangedCount: number;
  duplicateCount: number;
  failedCount: number;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';
}

export interface DriverAlertLocation {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  alertType: 'ENTRY' | 'QUEUE_CALL' | 'PARKING_FULL' | 'SPEED_WARNING' | 'EMERGENCY';
  messageHi: string;
  messageEn: string;
  messageOr: string;
  activeTruckCount: number;
}

export interface DriverEarningRecord {
  id: string;
  tripDate: string;
  token: string;
  destination: string;
  grossFreight: number;
  associationFee: number;
  dieselAdvance: number;
  cashAdvance: number;
  netPendingBalance: number;
  status: 'SETTLED' | 'PENDING';
}

export interface ExecutiveOfficer {
  id: string;
  name: string;
  designation: string; // e.g. 'प्रेसिडेंट (अध्यक्ष)', 'महासचिव', 'कोषाध्यक्ष', 'उपाध्यक्ष'
  mobile: string;
  plantInCharge?: string;
  isActive: boolean;
}

export interface PlantEntity {
  id: string;
  name: string;
  code: string;
  location: string;
  dailyCapacity: number;
  contactPerson?: string;
  contactMobile?: string;
  isActive: boolean;
  destinations: string[];
}

export interface BroadcastTicker {
  id: string;
  text: string;
  type: 'INFO' | 'WARNING' | 'EMERGENCY';
  isActive: boolean;
  updatedAt: string;
}

export interface MasterAppConfig {
  associationName: string;
  tagline: string;
  estdYear: string;
  regNumber: string;
  address: string;
  helplineMobile: string;
  emergencyMobile: string;
  email: string;
  upiId: string;

  // 15-to-15 Rotation rules
  rotationCycle1Days: string;
  rotationCycle2Days: string;
  rotationJumpPenaltySerials: number;
  absentGraceHours: number;
  preserveRotationOnPendingFreight: boolean;

  // Fee Slabs
  heavyFeeAbove18Ton: number;
  standardFeeUpTo18Ton: number;
  membership6Months: number;
  membership12Months: number;
  membership24Months: number;

  // Security
  adminPin: string;

  // Live Broadcast Marquee
  ticker: BroadcastTicker;

  // Executives & Plants
  executives: ExecutiveOfficer[];
  plants: PlantEntity[];

  // Dynamic Modifiable Features Registry
  dynamicFeatures?: DynamicAppFeature[];
}

export interface DynamicAppFeatureField {
  key: string;
  labelHi: string;
  labelEn?: string;
  type: 'boolean' | 'number' | 'text' | 'textarea' | 'select';
  value: any;
  unit?: string;
  options?: { label: string; value: string }[];
}

export interface DynamicAppFeature {
  id: string;
  nameHi: string;
  nameEn: string;
  descriptionHi: string;
  descriptionEn?: string;
  category: 'OWNER' | 'ADMIN' | 'PUKAR' | 'SECURITY' | 'ROTATION' | 'BILLING' | 'ELECTION' | 'REPORTS' | 'SYSTEM';
  status: 'ACTIVE' | 'DISABLED';
  routeOrTab?: string;
  whereShown?: string;
  version: string;
  isAutoDiscovered?: boolean;
  fields?: DynamicAppFeatureField[];
}

export interface EmergencyMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  meetUrl: string;
  isEmergency: boolean;
  targetRole: 'ALL' | 'EXECUTIVE' | 'OWNERS_ONLY';
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export interface AdminEmailRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  notifyDaily: boolean;
  addedAt: string;
}

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  from?: string;
  isConfigured: boolean;
}

export interface DailyReportConfig {
  recipients: AdminEmailRecipient[];
  autoEmailEnabled: boolean;
  scheduledTime: string;
  lastSentAt?: string;
  lastSentStatus?: 'SUCCESS' | 'FAILED' | 'PENDING';
  includePendingSlips: boolean;
  includeRevenueStats: boolean;
  smtp?: SmtpConfig;
}

export interface LoadingOperationItem {
  token: string;
  serialNumber: number;
  vehicleNumber: string;
  ownerName: string;
  plant: string;
  destination: string;
  category: string;
  capacityTon: number;
  paymentStatus: 'UNPAID' | 'VERIFIED_PAID' | 'WAIVED';
  paymentAmount: number;
  time: string;
  status: 'VALID' | 'COMPLETED' | 'CANCELLED';
}

export interface DailyReportSummary {
  reportDate: string;
  generatedAt: string;
  referenceNumber: string;
  cycle: string;
  totalPassesIssued: number;
  totalWeightTon: number;
  totalFeeCollected: number;
  activeProgramsCount: number;
  inQueueCount: number;
  plantBreakdown: {
    plant: string;
    trucksCount: number;
    tonnage: number;
    destinations: string[];
  }[];
  operations: LoadingOperationItem[];
}

export interface ReportEmailLog {
  id: string;
  timestamp: string;
  reportDate: string;
  recipients: string[];
  status: 'SUCCESS' | 'FAILED';
  subject: string;
  pdfSizeBytes: number;
  messageId?: string;
  previewUrl?: string;
  error?: string;
  triggeredBy: 'AUTO_SCHEDULE' | 'MANUAL_ADMIN' | 'TEST_EMAIL';
}

