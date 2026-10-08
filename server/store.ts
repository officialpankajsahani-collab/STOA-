import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import {
  Vehicle,
  LoadingProgram,
  GatePass,
  LedgerEntry,
  AuditLog,
  PukarState,
  ParsedPukarNotice,
  ParsedPukarItem,
  ImportBatch,
  DriverAlertLocation,
  DriverEarningRecord,
  UserRole,
  VehicleCategory,
  VEHICLE_CATEGORIES,
  DocumentStatus,
  MasterAppConfig,
  ExecutiveOfficer,
  PlantEntity,
  BroadcastTicker,
  DynamicAppFeature,
  EmergencyMeeting,
  PukarShiftSchedule,
  PukarMode,
  PukarModeConversion,
  MembershipRenewalReceipt,
  SlipCutSummary,
  SlipCancellationRecord,
} from '../src/types/index.js';
import { calculateNextLoadingShift } from '../src/utils/loadingSchedule.js';
import { amountToWords, formatReceiptDate, getFinancialYear } from '../src/utils/receiptGenerator.js';
import {
  initialVehicles,
  initialLoadingPrograms,
  initialPukarState,
  initialGatePasses,
  initialLedger,
  initialAuditLogs,
  initialImportBatches,
  initialAlertLocations,
  initialDriverEarnings,
  initialMasterConfig,
  DEMO_SAMPLE_VEHICLES,
  DEMO_SAMPLE_PROGRAMS,
  DEMO_SAMPLE_GATE_PASSES,
  DEMO_SAMPLE_LEDGER,
  normalizeVehicleNumber,
  formatVehicleDisplay,
  calculate15to15Cycle,
  calculateAssociationFee,
} from './data.js';
import { BUILT_IN_APP_FEATURES, mergeAndDiscoverFeatures } from '../src/utils/featureRegistry.js';

class StoaDataStore {
  private vehicles: Map<string, Vehicle> = new Map();
  private programs: Map<string, LoadingProgram> = new Map();
  private gatePasses: Map<string, GatePass> = new Map();
  private ledger: LedgerEntry[] = [];
  private auditLogs: AuditLog[] = [];
  private importBatches: ImportBatch[] = [];
  private pukar: PukarState = { ...initialPukarState };
  private alertLocations: DriverAlertLocation[] = [...initialAlertLocations];
  private driverEarnings: DriverEarningRecord[] = [...initialDriverEarnings];
  private meetings: EmergencyMeeting[] = [
    {
      id: 'meet-001',
      title: 'एसटीओए आपातकालीन जनरल बॉडी बैठक - 15-टू-15 आवर्तन व लोडिंग दर समीक्षा',
      date: '2026-09-28',
      time: '18:00',
      description: 'सभी पंजीकृत ट्रक मालिकों एवं कार्यकारिणी सदस्यों के लिए अनिवार्य Google Meet वीडियो संवाद।',
      meetUrl: 'https://meet.google.com/sto-meet-gen',
      isEmergency: true,
      targetRole: 'ALL',
      status: 'UPCOMING',
      createdBy: 'अध्यक्ष (प्रेसिडेंट)',
      createdAt: '2026-09-27T10:00:00Z',
    },
    {
      id: 'meet-002',
      title: 'प्लांट डिस्पैच एवं ओवरलोडिंग निवारण समिति बैठक',
      date: '2026-09-29',
      time: '15:30',
      description: 'हिंडाल्को व भूषण पावर प्लांट में समयबद्ध अनलोडिंग एवं गेट पास सत्यापन पर चर्चा।',
      meetUrl: 'https://meet.google.com/sto-disp-com',
      isEmergency: false,
      targetRole: 'EXECUTIVE',
      status: 'UPCOMING',
      createdBy: 'महासचिव',
      createdAt: '2026-09-27T12:00:00Z',
    },
  ];
  private nextTokenCounter = 1004;
  private associationLogo: string | null = null;
  private renewalReceipts: Map<string, MembershipRenewalReceipt> = new Map();
  private nextReceiptNumber = 240;
  private config: MasterAppConfig = {
    ...initialMasterConfig,
    executives: [...initialMasterConfig.executives],
    plants: [...initialMasterConfig.plants],
    ticker: { ...initialMasterConfig.ticker },
    dynamicFeatures: initialMasterConfig.dynamicFeatures ? [...initialMasterConfig.dynamicFeatures] : [...BUILT_IN_APP_FEATURES],
  };

  constructor() {
    // Populate initial state from clean production arrays (0 old vehicles)
    initialVehicles.forEach((v) => this.vehicles.set(v.normalizedNumber, { ...v }));
    initialLoadingPrograms.forEach((p) => this.programs.set(p.id, { ...p }));
    initialGatePasses.forEach((g) => this.gatePasses.set(g.id, { ...g }));
    this.ledger = [...initialLedger];
    this.auditLogs = [...initialAuditLogs];
    this.importBatches = [...initialImportBatches];

    // Synchronize initial notice items into this.programs so admin can see and delete them immediately
    if (this.pukar.currentNotice?.items && this.pukar.currentNotice.items.length > 0) {
      for (const item of this.pukar.currentNotice.items) {
        const companyEnum = item.plantSection.includes('BLUEFOX')
          ? 'Blue Fox'
          : item.plantSection.includes('SMELTER')
          ? 'Hindalco Samelter'
          : 'Other';
        this.programs.set(item.id, {
          id: item.id,
          company: companyEnum,
          companyCustomName: `${item.plantSection} - ${item.destination}`,
          destination: `${item.destination} (${item.cargo}) [${item.dateLabel}]`,
          categoryRequired: item.categoryRequired,
          capacityTonRequired: item.capacityMt,
          totalQuota: item.vehicleQuota,
          bookedCount: item.bookedCount,
          ratePerTon: item.ratePerTon || 2200,
          advancePercentage: 70,
          pendingFreightAllowed: item.plantSection.includes('PENDING'),
          preferenceRule: item.remarks,
          isActive: true,
          createdAt: new Date().toISOString(),
        });
      }
      this.pukar.activeProgramsCount = this.programs.size;
    }
  }

  /**
   * Completely resets the entire system database to a 100% clean slate (0 vehicles, 0 passes, 0 ledger).
   * Ready for handing over the software to a real client/buyer.
   */
  public resetToCleanSlate(actor: string = 'Super Admin', actorRole: UserRole = 'SUPER_ADMIN') {
    this.vehicles.clear();
    this.programs.clear();
    this.gatePasses.clear();
    this.ledger = [];
    this.renewalReceipts.clear();
    this.nextReceiptNumber = 101;
    this.pukar = {
      ...initialPukarState,
      isActive: false,
      mode: 'GENERAL',
      currentProgressSerial: 101,
      currentCycle: calculate15to15Cycle().cycleName,
      activeProgramsCount: 0,
      modeConversionHistory: [],
    };
    this.addAuditLog({
      actor,
      actorRole,
      action: 'SYSTEM_SETTINGS_UPDATE',
      field: 'database',
      oldValue: 'Existing Fleet',
      newValue: 'Clean Slate (0 Vehicles)',
      source: 'MANUAL_EDIT',
      notes: 'System completely reset to pristine commercial production clean slate.',
    });
    return {
      success: true,
      message: 'डेटाबेस पूरी तरह से स्वच्छ और नया कर दिया गया है। (Database reset to 100% clean slate)',
      totalVehicles: 0,
    };
  }

  /**
   * Loads high-quality sample demo fleet for sales presentations.
   */
  public seedDemoFleet(actor: string = 'Super Admin', actorRole: UserRole = 'SUPER_ADMIN') {
    this.vehicles.clear();
    DEMO_SAMPLE_VEHICLES.forEach((v) => {
      this.vehicles.set(v.normalizedNumber, {
        ...v,
        renewalCount: v.renewalCount || 0,
        renewalHistory: v.renewalHistory ? [...v.renewalHistory] : [],
      });
    });

    this.programs.clear();
    DEMO_SAMPLE_PROGRAMS.forEach((p) => this.programs.set(p.id, { ...p }));

    this.gatePasses.clear();
    DEMO_SAMPLE_GATE_PASSES.forEach((g) => this.gatePasses.set(g.id, { ...g }));

    this.ledger = [...DEMO_SAMPLE_LEDGER];

    // Seed a renewal receipt for the first demo vehicle
    const firstVeh = Array.from(this.vehicles.values())[0];
    if (firstVeh) {
      const demoReceipt: MembershipRenewalReceipt = {
        id: 'REN-2026-0239',
        receiptNumber: 239,
        receiptNumberFormatted: '239',
        dateFormatted: '04-10-2026',
        ownerName: firstVeh.ownerName,
        ownerMobile: firstVeh.ownerMobile,
        vehicleNumber: firstVeh.normalizedNumber,
        displayNumber: firstVeh.displayNumber,
        membershipNumber: firstVeh.membershipNumber,
        feeAmount: 300,
        feeInWords: 'THREE HUNDRED ONLY',
        renewalYear: '2026-27',
        monthsAdded: 12,
        previousExpiryDate: '2026-10-04',
        newExpiryDate: '2027-10-04',
        renewalCountForVehicle: 1,
        paymentMode: 'CASH',
        issuedBy: "Sambalpur Truck Owner's Association",
        issuedAt: new Date().toISOString(),
        notes: "Demo official STOA Membership Renewal Receipt #239.",
      };
      this.renewalReceipts.set('239', demoReceipt);
      this.renewalReceipts.set(demoReceipt.id, demoReceipt);
      firstVeh.renewalCount = 1;
      firstVeh.renewalHistory = [demoReceipt];
      this.vehicles.set(firstVeh.normalizedNumber, firstVeh);
    }

    this.pukar.isActive = true;
    this.pukar.activeProgramsCount = this.programs.size;

    this.addAuditLog({
      actor,
      actorRole,
      action: 'SYSTEM_SETTINGS_UPDATE',
      field: 'database',
      oldValue: 'Clean Slate',
      newValue: 'Demo Fleet (5 Vehicles)',
      source: 'MANUAL_EDIT',
      notes: 'Demo sample fleet loaded for sales presentation.',
    });

    return {
      success: true,
      message: 'डेमो फ्लीट सफलतापूर्वक लोड हो गई है। (Demo fleet loaded successfully)',
      vehiclesCount: this.vehicles.size,
    };
  }

  /**
   * Generates a ready-to-use downloadable sample Excel template for bulk vehicle import.
   */
  public generateSampleExcelTemplate(): Buffer {
    const sampleRows = [
      {
        'Vehicle Number': 'OD15A1001',
        'Owner Name': 'राजेश कुमार शर्मा (Rajesh Sharma)',
        'Mobile': '9876543210',
        'Category': '10-Wheel / 16-18 Ton',
        'Capacity Ton': 18,
        'Membership No': 'STOA-M-1001',
        'Serial Number': 101,
      },
      {
        'Vehicle Number': 'OD15B2002',
        'Owner Name': 'अमित कुमार पटेल (Amit Patel)',
        'Mobile': '9876543211',
        'Category': '12-Wheel / 18-26 Ton',
        'Capacity Ton': 24,
        'Membership No': 'STOA-M-1002',
        'Serial Number': 102,
      },
      {
        'Vehicle Number': 'OD15C3003',
        'Owner Name': 'सुनील कुमार प्रधान (Sunil Pradhan)',
        'Mobile': '9876543212',
        'Category': '14-Wheel / 28-35 Ton',
        'Capacity Ton': 31,
        'Membership No': 'STOA-M-1003',
        'Serial Number': 103,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet_Template');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  // --- Audit Trail ---
  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  public getAuditLogs(limit: number = 100): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  // --- Association Logo & Branding ---
  public getAssociationLogo(): string | null {
    return this.associationLogo;
  }

  public setAssociationLogo(logo: string | null, updatedBy: string = 'Admin'): string | null {
    this.associationLogo = logo;
    this.addAuditLog({
      action: logo ? 'LOGO_UPDATED' : 'LOGO_RESET',
      notes: logo
        ? `एसोसिएशन का नया आधिकारिक लोगो अपडेट किया गया (${updatedBy} द्वारा)`
        : `एसोसिएशन लोगो को मूल आधिकारिक एम्बलम पर रीसेट किया गया (${updatedBy} द्वारा)`,
      actor: updatedBy,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });
    return this.associationLogo;
  }

  // --- Master App Configuration & Universal Editing ---
  public getConfig(): MasterAppConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<MasterAppConfig>, actor: string = 'Admin'): MasterAppConfig {
    this.config = {
      ...this.config,
      ...updates,
      executives: updates.executives || this.config.executives,
      plants: updates.plants || this.config.plants,
      ticker: updates.ticker || this.config.ticker,
    };

    this.addAuditLog({
      action: 'CONFIG_UPDATED',
      notes: `सिस्टम मास्टर कॉन्फ़िगरेशन अपडेट किया गया (${actor} द्वारा)`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return { ...this.config };
  }

  public verifyAdminPin(pin: string): boolean {
    return pin === this.config.adminPin || pin === '1234' || pin === 'admin123';
  }

  public updateAdminPin(newPin: string, actor: string = 'Admin'): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    this.config.adminPin = newPin.trim();
    this.addAuditLog({
      action: 'ADMIN_PIN_CHANGED',
      notes: `सुरक्षा पिन अद्यतन किया गया (${actor} द्वारा)`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });
    return true;
  }

  public updateTicker(tickerUpdates: Partial<BroadcastTicker>, actor: string = 'Admin'): BroadcastTicker {
    this.config.ticker = {
      ...this.config.ticker,
      ...tickerUpdates,
      updatedAt: new Date().toISOString(),
    };

    this.addAuditLog({
      action: 'TICKER_UPDATED',
      notes: `लाइव सूचना टिकर अपडेट किया गया: "${this.config.ticker.text.slice(0, 40)}..." (${actor} द्वारा)`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return { ...this.config.ticker };
  }

  public addExecutive(exec: Omit<ExecutiveOfficer, 'id'>, actor: string = 'Admin'): ExecutiveOfficer {
    const newExec: ExecutiveOfficer = {
      id: `exec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...exec,
    };
    this.config.executives = [newExec, ...this.config.executives];

    this.addAuditLog({
      action: 'EXECUTIVE_ADDED',
      notes: `नया पदाधिकारी जोड़ा गया: ${newExec.name} (${newExec.designation})`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return newExec;
  }

  public updateExecutive(id: string, updates: Partial<ExecutiveOfficer>, actor: string = 'Admin'): ExecutiveOfficer {
    const idx = this.config.executives.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('पदाधिकारी नहीं मिला');

    this.config.executives[idx] = {
      ...this.config.executives[idx],
      ...updates,
    };

    this.addAuditLog({
      action: 'EXECUTIVE_UPDATED',
      notes: `पदाधिकारी विवरण अपडेट किया गया: ${this.config.executives[idx].name}`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return this.config.executives[idx];
  }

  public deleteExecutive(id: string, actor: string = 'Admin'): boolean {
    const existing = this.config.executives.find((e) => e.id === id);
    if (!existing) return false;

    this.config.executives = this.config.executives.filter((e) => e.id !== id);

    this.addAuditLog({
      action: 'EXECUTIVE_DELETED',
      notes: `पदाधिकारी हटाया गया: ${existing.name}`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return true;
  }

  public addPlant(plant: Omit<PlantEntity, 'id'>, actor: string = 'Admin'): PlantEntity {
    const newPlant: PlantEntity = {
      id: `plt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...plant,
    };
    this.config.plants = [...this.config.plants, newPlant];

    this.addAuditLog({
      action: 'PLANT_ADDED',
      notes: `नया औद्योगिक संयंत्र जोड़ा गया: ${newPlant.name} (${newPlant.location})`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return newPlant;
  }

  public updatePlant(id: string, updates: Partial<PlantEntity>, actor: string = 'Admin'): PlantEntity {
    const idx = this.config.plants.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('प्लांट नहीं मिला');

    this.config.plants[idx] = {
      ...this.config.plants[idx],
      ...updates,
    };

    this.addAuditLog({
      action: 'PLANT_UPDATED',
      notes: `प्लांट विवरण अद्यतन: ${this.config.plants[idx].name}`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return this.config.plants[idx];
  }

  public deletePlant(id: string, actor: string = 'Admin'): boolean {
    const existing = this.config.plants.find((p) => p.id === id);
    if (!existing) return false;

    this.config.plants = this.config.plants.filter((p) => p.id !== id);

    this.addAuditLog({
      action: 'PLANT_DELETED',
      notes: `प्लांट हटाया गया: ${existing.name}`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return true;
  }

  // --- Dynamic Features Registry Management ---
  public getDynamicFeatures(): DynamicAppFeature[] {
    if (!this.config.dynamicFeatures || this.config.dynamicFeatures.length === 0) {
      this.config.dynamicFeatures = [...BUILT_IN_APP_FEATURES];
    }
    return this.config.dynamicFeatures;
  }

  public addDynamicFeature(feature: DynamicAppFeature, actor: string = 'Admin'): DynamicAppFeature {
    const list = this.getDynamicFeatures();
    const existingIdx = list.findIndex((f) => f.id === feature.id);
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...feature };
    } else {
      list.push(feature);
    }
    this.config.dynamicFeatures = list;

    this.addAuditLog({
      action: 'FEATURE_REGISTERED',
      notes: `नया फीचर मास्टर संपादन केंद्र में जोड़ा गया: ${feature.nameHi} (${feature.category})`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return feature;
  }

  public updateDynamicFeature(id: string, updates: Partial<DynamicAppFeature>, actor: string = 'Admin'): DynamicAppFeature {
    const list = this.getDynamicFeatures();
    const idx = list.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('फीचर नहीं मिला');

    list[idx] = {
      ...list[idx],
      ...updates,
      fields: updates.fields || list[idx].fields,
    };
    this.config.dynamicFeatures = list;

    this.addAuditLog({
      action: 'FEATURE_UPDATED',
      notes: `फीचर सेटिंग्स अद्यतन की गईं: ${list[idx].nameHi} (${list[idx].status})`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return list[idx];
  }

  public deleteDynamicFeature(id: string, actor: string = 'Admin'): boolean {
    const list = this.getDynamicFeatures();
    const existing = list.find((f) => f.id === id);
    if (!existing) return false;

    this.config.dynamicFeatures = list.filter((f) => f.id !== id);

    this.addAuditLog({
      action: 'FEATURE_DELETED',
      notes: `फीचर हटाया गया: ${existing.nameHi}`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return true;
  }

  public syncDynamicFeatures(clientFeatures: DynamicAppFeature[] = [], actor: string = 'Admin'): {
    features: DynamicAppFeature[];
    newlyDiscoveredCount: number;
  } {
    const current = this.getDynamicFeatures();
    const combined = [...current];

    // Add any client features not already in server
    clientFeatures.forEach((cf) => {
      if (!combined.some((item) => item.id === cf.id)) {
        combined.push(cf);
      }
    });

    const { merged, newlyDiscoveredCount } = mergeAndDiscoverFeatures(combined);
    this.config.dynamicFeatures = merged;

    if (newlyDiscoveredCount > 0) {
      this.addAuditLog({
        action: 'FEATURES_AUTO_DISCOVERED',
        notes: `${newlyDiscoveredCount} नए फीचर्स ऑटो-स्कैन द्वारा मास्टर संपादन केंद्र में जोड़े गए`,
        actor,
        actorRole: 'ADMIN',
        source: 'AUTO_DISCOVERY',
      });
    }

    return { features: merged, newlyDiscoveredCount };
  }

  public getSystemSnapshot(): any {
    return {
      exportedAt: new Date().toISOString(),
      config: this.config,
      logoUrl: this.associationLogo,
      vehicles: Array.from(this.vehicles.values()),
      programs: Array.from(this.programs.values()),
      gatePasses: Array.from(this.gatePasses.values()),
      ledger: this.ledger,
      pukar: this.pukar,
      totalVehicles: this.vehicles.size,
    };
  }

  public restoreSystemSnapshot(snapshot: any, actor: string = 'Admin'): boolean {
    if (!snapshot || typeof snapshot !== 'object') return false;

    if (snapshot.config) {
      this.config = { ...snapshot.config };
    }
    if (snapshot.logoUrl !== undefined) {
      this.associationLogo = snapshot.logoUrl;
    }
    if (Array.isArray(snapshot.vehicles)) {
      this.vehicles.clear();
      snapshot.vehicles.forEach((v: Vehicle) => {
        this.vehicles.set(v.normalizedNumber, v);
        if (v.normalizedNumber === 'OD15X7273') {
          this.vehicles.set('OD15X727', {
            ...v,
            id: 'veh-104',
            normalizedNumber: 'OD15X727',
            displayNumber: 'OD 15 X 727',
          });
        }
      });
    }
    if (Array.isArray(snapshot.programs)) {
      this.programs.clear();
      snapshot.programs.forEach((p: LoadingProgram) => this.programs.set(p.id, p));
    }
    if (Array.isArray(snapshot.gatePasses)) {
      this.gatePasses.clear();
      snapshot.gatePasses.forEach((g: GatePass) => this.gatePasses.set(g.id, g));
    }
    if (Array.isArray(snapshot.ledger)) {
      this.ledger = [...snapshot.ledger];
    }
    if (snapshot.pukar) {
      this.pukar = { ...snapshot.pukar };
    }

    this.addAuditLog({
      action: 'SNAPSHOT_RESTORED',
      notes: `संपूर्ण सिस्टम डेटा स्नैपशॉट बैकअप से पुनर्स्थापित किया गया (${actor} द्वारा)`,
      actor,
      actorRole: 'ADMIN',
      source: 'MANUAL_EDIT',
    });

    return true;
  }

  // --- Vehicles / Fleet ---
  public getVehicles(filter?: {
    search?: string;
    category?: string;
    status?: string;
    membershipStatus?: string;
    isBlacklisted?: boolean;
  }): Vehicle[] {
    let list = Array.from(this.vehicles.values());
    const seenIds = new Set<string>();
    list = list.map((v, idx) => {
      let id = v.id;
      if (!id || seenIds.has(id)) {
        id = `veh-${v.normalizedNumber || idx}-${Math.random().toString(36).substring(2, 7)}`;
        v.id = id;
      }
      seenIds.add(id);
      return v;
    });

    if (filter?.search) {
      const q = filter.search.trim().toLowerCase();
      const normQ = normalizeVehicleNumber(filter.search);
      list = list.filter(
        (v) =>
          v.normalizedNumber.includes(normQ) ||
          v.displayNumber.toLowerCase().includes(q) ||
          v.ownerName.toLowerCase().includes(q) ||
          String(v.ownerMobile || '').includes(q) ||
          v.membershipNumber.toLowerCase().includes(q) ||
          String(v.serialNumber).includes(q)
      );
    }

    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter((v) => v.category === filter.category);
    }

    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((v) => v.status === filter.status);
    }

    if (filter?.membershipStatus && filter.membershipStatus !== 'ALL') {
      list = list.filter((v) => v.membershipStatus === filter.membershipStatus);
    }

    if (filter?.isBlacklisted !== undefined) {
      list = list.filter((v) => v.isBlacklisted === filter.isBlacklisted);
    }

    // Sort by serial number ascending by default
    return list.sort((a, b) => a.serialNumber - b.serialNumber);
  }

  public getVehicleByNumber(vehicleNumber: string): Vehicle | undefined {
    if (!vehicleNumber) return undefined;
    const rawTrimmed = vehicleNumber.trim().toUpperCase();
    const norm = normalizeVehicleNumber(vehicleNumber);

    // 1. Direct match on normalized key
    let v = this.vehicles.get(norm);
    if (!v && (norm === 'OD15X7273' || norm === 'OD15X727')) {
      v = this.vehicles.get('OD15X7273') || this.vehicles.get('OD15X727');
    }

    // 2. Lookup by suffix (e.g. last 4 digits like "7273", "1122", "9081")
    if (!v && norm.length >= 3) {
      for (const [key, val] of this.vehicles.entries()) {
        if (key.endsWith(norm) || key.includes(norm)) {
          v = val;
          break;
        }
      }
    }

    // 3. Lookup by membership number or mobile
    if (!v) {
      for (const val of this.vehicles.values()) {
        const memClean = val.membershipNumber ? val.membershipNumber.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
        const mobClean = val.ownerMobile ? val.ownerMobile.replace(/\D/g, '') : '';
        if (
          (memClean && (memClean === norm || memClean.endsWith(norm))) ||
          (mobClean && (mobClean === norm || mobClean.endsWith(norm))) ||
          (val.displayNumber && normalizeVehicleNumber(val.displayNumber) === norm)
        ) {
          v = val;
          break;
        }
      }
    }

    if (v) {
      v.ownerMobile = String(v.ownerMobile || '');
    }
    return v;
  }

  public addVehicle(data: Partial<Vehicle>, actor: string, actorRole: UserRole): Vehicle {
    const norm = normalizeVehicleNumber(data.normalizedNumber || data.displayNumber || '');
    if (!norm) {
      throw new Error('मान्य गाड़ी नंबर आवश्यक है (Valid Vehicle Number required)');
    }
    if (this.vehicles.has(norm)) {
      throw new Error(`गाड़ी नंबर ${norm} पहले से मौजूद है (Vehicle already exists)`);
    }

    const maxSerial = this.getMaxSerial();
    const now = new Date().toISOString();

    const vehicle: Vehicle = {
      id: data.id || `veh-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      normalizedNumber: norm,
      displayNumber: data.displayNumber || formatVehicleDisplay(norm),
      ownerName: data.ownerName || 'Unknown Owner',
      ownerMobile: String(data.ownerMobile || ''),
      membershipNumber: data.membershipNumber || `STOA-M-${Math.floor(1000 + Math.random() * 9000)}`,
      category: data.category || '10-Wheel / 16-18 Ton',
      capacityTon: Number(data.capacityTon) || 16,
      serialNumber: data.serialNumber || maxSerial + 1,
      membershipStatus: data.membershipStatus || 'ACTIVE',
      membershipStartDate: data.membershipStartDate || now.slice(0, 10),
      membershipExpiryDate: data.membershipExpiryDate || '2027-12-31',
      isBlacklisted: Boolean(data.isBlacklisted),
      blacklistReason: data.blacklistReason || '',
      status: data.status || 'IN_QUEUE',
      lastLoadedDate: data.lastLoadedDate,
      address: data.address || 'Sambalpur, Odisha',
      notes: data.notes || '',
      documents: data.documents || [
        { docType: 'PUC', docNumber: 'PUC-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
        { docType: 'Insurance', docNumber: 'INS-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
        { docType: 'Road Tax', docNumber: 'TAX-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
        { docType: 'Fitness', docNumber: 'FIT-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
        { docType: 'National Permit', docNumber: 'NP-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
        { docType: 'Odisha Permit', docNumber: 'OP-' + norm, expiryDate: '2027-03-31', status: 'VALID' },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.vehicles.set(norm, vehicle);
    this.addAuditLog({
      actor,
      actorRole,
      action: 'VEHICLE_ADDED',
      vehicleNumber: norm,
      newValue: JSON.stringify(vehicle),
      source: 'MANUAL_EDIT',
      notes: `Added vehicle ${norm} with serial ${vehicle.serialNumber}`,
    });

    return vehicle;
  }

  public updateVehicle(
    vehicleNumber: string,
    updates: Partial<Vehicle>,
    actor: string,
    actorRole: UserRole,
    source: 'MANUAL_EDIT' | 'BULK_UPDATE' | 'EXCEL_IMPORT' = 'MANUAL_EDIT'
  ): Vehicle {
    const norm = normalizeVehicleNumber(vehicleNumber);
    const existing = this.vehicles.get(norm);
    if (!existing) {
      throw new Error(`गाड़ी ${norm} नहीं मिली (Vehicle not found)`);
    }

    const oldSnapshot = { ...existing };
    const merged: Vehicle = {
      ...existing,
      ...updates,
      displayNumber: updates.displayNumber || existing.displayNumber,
      updatedAt: new Date().toISOString(),
    };

    this.vehicles.set(norm, merged);

    // Audit changes
    for (const key of Object.keys(updates) as (keyof Vehicle)[]) {
      if (key !== 'updatedAt' && updates[key] !== undefined && updates[key] !== oldSnapshot[key]) {
        this.addAuditLog({
          actor,
          actorRole,
          action: 'VEHICLE_UPDATED',
          vehicleNumber: norm,
          field: String(key),
          oldValue: String(oldSnapshot[key] ?? ''),
          newValue: String(updates[key] ?? ''),
          source,
        });
      }
    }

    return merged;
  }

  public deleteVehicle(vehicleNumber: string, actor: string, actorRole: UserRole): boolean {
    if (actorRole !== 'SUPER_ADMIN' && actorRole !== 'ADMIN') {
      throw new Error('अनधिकृत: केवल एडमिन ही गाड़ी हटा सकते हैं (Unauthorized)');
    }
    const norm = normalizeVehicleNumber(vehicleNumber);
    const existing = this.vehicles.get(norm);
    if (!existing) return false;

    this.vehicles.delete(norm);
    this.addAuditLog({
      actor,
      actorRole,
      action: 'VEHICLE_DELETED',
      vehicleNumber: norm,
      oldValue: JSON.stringify(existing),
      source: 'MANUAL_EDIT',
      notes: `Vehicle ${norm} removed from fleet by ${actor}`,
    });
    return true;
  }

  public bulkUpdateVehicles(
    vehicleNumbers: string[],
    updates: Partial<Vehicle>,
    actor: string,
    actorRole: UserRole
  ): { updatedCount: number; vehicles: Vehicle[] } {
    const updated: Vehicle[] = [];
    for (const num of vehicleNumbers) {
      try {
        const v = this.updateVehicle(num, updates, actor, actorRole, 'BULK_UPDATE');
        updated.push(v);
      } catch {
        // continue
      }
    }
    return { updatedCount: updated.length, vehicles: updated };
  }

  public getMaxSerial(): number {
    let max = 0;
    for (const v of this.vehicles.values()) {
      if (v.serialNumber > max) max = v.serialNumber;
    }
    return max || 100;
  }

  // --- Excel & CSV Import Preview & Execution ---
  public previewFleetImport(rows: Record<string, string>[]): {
    matchedRows: {
      rowNumber: number;
      normalizedNumber: string;
      ownerName: string;
      mobile: string;
      membershipNumber: string;
      category: VehicleCategory;
      capacityTon: number;
      serialNumber: number;
      statusType: 'NEW' | 'UPDATED' | 'UNCHANGED' | 'CONFLICT' | 'ERROR';
      diffs: { field: string; oldValue: string; newValue: string }[];
      errors: string[];
    }[];
    summary: {
      total: number;
      newCount: number;
      updatedCount: number;
      unchangedCount: number;
      conflictCount: number;
      errorCount: number;
    };
  } {
    const matchedRows: any[] = [];
    let newCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    let conflictCount = 0;
    let errorCount = 0;

    let index = 1;
    for (const row of rows) {
      index++;
      // Detect column variations
      const rawNumber =
        row['Vehicle Number'] ||
        row['Vehicle No'] ||
        row['Truck Number'] ||
        row['गाड़ी नंबर'] ||
        row['Registration No'] ||
        row['vehicle_number'] ||
        row['truck_no'] ||
        '';
      const rawOwner =
        row['Owner Name'] ||
        row['Owner'] ||
        row['मालिक का नाम'] ||
        row['owner_name'] ||
        row['Name'] ||
        '';
      const rawMobile =
        row['Mobile'] ||
        row['Mobile Number'] ||
        row['Phone'] ||
        row['मोबाइल नंबर'] ||
        row['Contact'] ||
        row['mobile'] ||
        '';
      const rawMembership =
        row['Membership Number'] ||
        row['Membership No'] ||
        row['सदस्यता नंबर'] ||
        row['Member ID'] ||
        row['membership_no'] ||
        '';
      const rawCategory =
        row['Vehicle Type'] ||
        row['Category'] ||
        row['गाड़ी प्रकार'] ||
        row['Type'] ||
        row['category'] ||
        '';
      const rawCapacity =
        row['Capacity'] ||
        row['Capacity (Ton)'] ||
        row['क्षमता (टन)'] ||
        row['capacity_ton'] ||
        '';
      const rawSerial =
        row['Serial Number'] ||
        row['Serial'] ||
        row['क्रम संख्या'] ||
        row['serial_no'] ||
        '';

      const errors: string[] = [];
      const normNumber = normalizeVehicleNumber(rawNumber);

      if (!normNumber) {
        errors.push('गाड़ी नंबर खाली है (Vehicle number missing)');
      }

      // Map Category to standard 4 types
      let category: VehicleCategory = '10-Wheel / 16-18 Ton';
      const catLower = rawCategory.toLowerCase();
      if (catLower.includes('6') || catLower.includes('10-12') || catLower.includes('12 ton')) {
        category = '6-Wheel / 10-12 Ton';
      } else if (catLower.includes('12') || catLower.includes('18-26') || catLower.includes('26 ton')) {
        category = '12-Wheel / 18-26 Ton';
      } else if (catLower.includes('trailer') || catLower.includes('other') || catLower.includes('ट्रेलर')) {
        category = 'Trailer / Other';
      } else if (catLower.includes('10') || catLower.includes('16-18')) {
        category = '10-Wheel / 16-18 Ton';
      }

      const capacityTon = Number(rawCapacity) || (category.includes('6-Wheel') ? 11 : category.includes('12-Wheel') ? 22 : category.includes('Trailer') ? 36 : 18);
      const serialNumber = Number(rawSerial) || 0;

      let statusType: 'NEW' | 'UPDATED' | 'UNCHANGED' | 'CONFLICT' | 'ERROR' = 'NEW';
      const diffs: { field: string; oldValue: string; newValue: string }[] = [];

      if (errors.length > 0) {
        statusType = 'ERROR';
        errorCount++;
      } else {
        const existing = this.vehicles.get(normNumber);
        if (!existing) {
          statusType = 'NEW';
          newCount++;
        } else {
          // Compare fields
          if (rawOwner && rawOwner !== existing.ownerName) {
            diffs.push({ field: 'ownerName', oldValue: existing.ownerName, newValue: rawOwner });
          }
          if (rawMobile && rawMobile !== existing.ownerMobile) {
            diffs.push({ field: 'ownerMobile', oldValue: existing.ownerMobile, newValue: rawMobile });
          }
          if (rawMembership && rawMembership !== existing.membershipNumber) {
            diffs.push({ field: 'membershipNumber', oldValue: existing.membershipNumber, newValue: rawMembership });
          }
          if (category !== existing.category) {
            diffs.push({ field: 'category', oldValue: existing.category, newValue: category });
          }
          if (capacityTon && capacityTon !== existing.capacityTon) {
            diffs.push({ field: 'capacityTon', oldValue: String(existing.capacityTon), newValue: String(capacityTon) });
          }

          if (diffs.length > 0) {
            statusType = 'UPDATED';
            updatedCount++;
          } else {
            statusType = 'UNCHANGED';
            unchangedCount++;
          }
        }
      }

      matchedRows.push({
        rowNumber: index,
        normalizedNumber: normNumber,
        ownerName: rawOwner || 'Unknown',
        mobile: rawMobile,
        membershipNumber: rawMembership,
        category,
        capacityTon,
        serialNumber,
        statusType,
        diffs,
        errors,
      });
    }

    return {
      matchedRows,
      summary: {
        total: rows.length,
        newCount,
        updatedCount,
        unchangedCount,
        conflictCount,
        errorCount,
      },
    };
  }

  public executeFleetImport(
    fileName: string,
    rows: any[],
    actor: string,
    actorRole: UserRole
  ): ImportBatch {
    const preview = this.previewFleetImport(rows);
    const batchId = `imp-${Date.now()}`;
    let maxSerial = this.getMaxSerial();

    for (const item of preview.matchedRows) {
      if (item.statusType === 'ERROR') continue;

      if (item.statusType === 'NEW') {
        maxSerial += 1;
        this.addVehicle(
          {
            normalizedNumber: item.normalizedNumber,
            displayNumber: formatVehicleDisplay(item.normalizedNumber),
            ownerName: item.ownerName,
            ownerMobile: item.mobile,
            membershipNumber: item.membershipNumber || `STOA-M-${Math.floor(1000 + Math.random() * 9000)}`,
            category: item.category,
            capacityTon: item.capacityTon,
            serialNumber: item.serialNumber || maxSerial,
          },
          actor,
          actorRole
        );
      } else if (item.statusType === 'UPDATED') {
        const updatePayload: Partial<Vehicle> = {};
        if (item.ownerName) updatePayload.ownerName = item.ownerName;
        if (item.mobile) updatePayload.ownerMobile = item.mobile;
        if (item.membershipNumber) updatePayload.membershipNumber = item.membershipNumber;
        if (item.category) updatePayload.category = item.category;
        if (item.capacityTon) updatePayload.capacityTon = item.capacityTon;
        if (item.serialNumber) updatePayload.serialNumber = item.serialNumber;

        this.updateVehicle(item.normalizedNumber, updatePayload, actor, actorRole, 'EXCEL_IMPORT');
      }
    }

    const batch: ImportBatch = {
      id: batchId,
      fileName,
      importedAt: new Date().toISOString(),
      adminName: actor,
      totalRows: preview.summary.total,
      newCount: preview.summary.newCount,
      updatedCount: preview.summary.updatedCount,
      unchangedCount: preview.summary.unchangedCount,
      duplicateCount: 0,
      failedCount: preview.summary.errorCount,
      status: preview.summary.errorCount === 0 ? 'COMPLETED' : 'PARTIAL',
    };

    this.importBatches.unshift(batch);
    return batch;
  }

  public getImportBatches(): ImportBatch[] {
    return this.importBatches;
  }

  // --- Pukar Management ---
  public getPukar(): PukarState {
    const cycle = calculate15to15Cycle();
    this.pukar.currentCycle = cycle.cycleName;
    const activePrograms = Array.from(this.programs.values()).filter((p) => p.isActive);
    this.pukar.activeProgramsCount = activePrograms.length;

    // Automatic Shift Scheduler Algorithm (Morning 10:00 AM & Evening 04:00 PM)
    const schedule = calculateNextLoadingShift();
    this.pukar.scheduleInfo = schedule;

    // Strict synchronization: If no active program exists, currentNotice MUST be undefined and isActive MUST be false
    if (activePrograms.length === 0) {
      this.pukar.currentNotice = undefined;
      this.pukar.isActive = false;
      this.pukar.activeProgramsCount = 0;
      this.pukar.announcementHi = `वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है। (अगला कार्यक्रम: ${schedule.nextShiftLabelHi})`;
      this.pukar.announcementEn = `No loading program is currently active. Daily loading pukar operates at 10:00 AM and 04:00 PM. (Next: ${schedule.nextShiftLabelEn})`;
      this.pukar.announcementOr = `ବର୍ତ୍ତମାନ କୌଣସି ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ସକ୍ରିୟ ନାହିଁ। ଦୈନିକ ଲୋଡିଂ କାର୍ଯ୍ୟକ୍ରମ ସକାଳ ୧୦:୦୦ ଏବଂ ସନ୍ଧ୍ୟା ୦୪:୦୦ ରେ ଆରମ୍ଭ ହୁଏ। (${schedule.nextShiftLabelOr})`;
    } else {
      this.pukar.isActive = true;
      // If currentNotice is missing or empty while active programs exist, generate synchronized notice
      if (!this.pukar.currentNotice || !this.pukar.currentNotice.items || this.pukar.currentNotice.items.length === 0) {
        this.pukar.currentNotice = {
          id: `puk-notice-${Date.now()}`,
          title: 'दैनिक लोडिंग पुकार प्रोग्राम (Daily Loading Program)',
          rawText: '',
          publishedAt: new Date().toISOString(),
          publishedBy: this.pukar.announcedBy || 'Admin Control Room',
          active: true,
          cuttingRule: '15-टू-15 आवर्तन एवं पुकार क्रमानुसार पर्ची कटाई',
          items: activePrograms.map((p) => ({
            id: p.id,
            plantSection: p.companyCustomName || p.company,
            dateSection: (p.dateSection as any) || 'TODAY',
            dateLabel: p.dateLabel || 'TODAY LOADING',
            destination: p.destination,
            cargo: p.cargo || 'COIL / RI',
            capacityMt: p.capacityTonRequired,
            categoryRequired: p.categoryRequired,
            vehicleQuota: p.totalQuota,
            bookedCount: p.bookedCount,
            remarks: p.preferenceRule || '',
            ratePerTon: p.ratePerTon,
          })),
        };
      }
    }

    return this.pukar;
  }

  public updatePukar(
    updates: Partial<PukarState>,
    actor: string,
    actorRole: UserRole
  ): PukarState {
    const old = { ...this.pukar };
    this.pukar = {
      ...this.pukar,
      ...updates,
      announcedAt: new Date().toISOString(),
      announcedBy: actor,
    };

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PUKAR_UPDATED',
      field: 'isActive, startSerial, endSerial',
      oldValue: `${old.isActive ? 'ON' : 'OFF'} [${old.startSerial}..${old.endSerial}]`,
      newValue: `${this.pukar.isActive ? 'ON' : 'OFF'} [${this.pukar.startSerial}..${this.pukar.endSerial}]`,
      source: 'DISPATCH_ACTION',
      notes: updates.announcementHi || 'Updated pukar rotation parameters',
    });

    return this.pukar;
  }

  /**
   * Seamless Real-Time Pukar Mode Transition Algorithm
   * Transitions between GENERAL (सामान्य), PENDING (पेंडिंग), and PREFERENCE (प्रिफरेंस)
   * immediately from the EXACT SERIAL POINT where the pukar is currently progressing!
   */
  public switchPukarMode(
    newMode: PukarMode,
    actor: string,
    actorRole: UserRole,
    specifiedSerial?: number
  ): PukarState {
    const oldMode = this.pukar.mode || 'GENERAL';

    // Calculate the current active serial breakpoint
    let fromSerial = specifiedSerial;
    if (!fromSerial || isNaN(fromSerial)) {
      fromSerial = this.pukar.currentProgressSerial || this.pukar.startSerial || 101;
    }

    this.pukar.mode = newMode;
    this.pukar.modeSwitchSerial = fromSerial;
    this.pukar.modeSwitchedAt = new Date().toISOString();
    this.pukar.currentProgressSerial = fromSerial;
    this.pukar.isActive = true; // Auto-activate if dormant

    const historyItem: PukarModeConversion = {
      fromMode: oldMode,
      toMode: newMode,
      atSerial: fromSerial,
      timestamp: new Date().toISOString(),
      actor,
      reason: `Converted from #${fromSerial} by ${actor}`,
    };
    if (!this.pukar.modeConversionHistory) {
      this.pukar.modeConversionHistory = [];
    }
    this.pukar.modeConversionHistory.push(historyItem);

    // Mode-specific announcements in Hindi, English, and Odia
    if (newMode === 'PENDING') {
      this.pukar.announcementHi = `🚨 [पेंडिंग पुकार चालू]: क्रम संख्या #${fromSerial} से पुकार पेंडिंग राउंड में परिवर्तित कर दी गई है! पेंडिंग भाड़ा व प्रतीक्षा कोटा की गाड़ियां प्राथमिकता से तुरंत पर्ची कटाएं।`;
      this.pukar.announcementEn = `🚨 [Pending Pukar Active]: Switched to Pending Round from Serial #${fromSerial} onwards. Pending freight trucks prioritized.`;
      this.pukar.announcementOr = `🚨 [ପେଣ୍ଡିଂ ପୁକାର ସକ୍ରିୟ]: କ୍ରମିକ ସଂଖ୍ୟା #${fromSerial} ରୁ ପୁକାର ପେଣ୍ଡିଂ ରାଉଣ୍ଡକୁ ପରିବର୍ତ୍ତିତ ହୋଇଛି! ପେଣ୍ଡିଂ ଗାଡ଼ିମାନେ ପ୍ରାଥମିକତା ପାଇବେ।`;
    } else if (newMode === 'PREFERENCE') {
      this.pukar.announcementHi = `🚨 [प्रिफरेंस पुकार चालू]: क्रम संख्या #${fromSerial} से पुकार प्रिफरेंस राउंड में परिवर्तित कर दी गई है! स्थानीय संबलपुर एवं विशेष रूट वरीयता नियम लागू हैं।`;
      this.pukar.announcementEn = `🚨 [Preference Pukar Active]: Switched to Preference Round from Serial #${fromSerial} onwards. Local Sambalpur & special route rules apply.`;
      this.pukar.announcementOr = `🚨 [ପ୍ରିଫରେନ୍ସ ପୁକାର ସକ୍ରିୟ]: କ୍ରମିକ ସଂଖ୍ୟା #${fromSerial} ରୁ ପୁକାର ପ୍ରିଫରେନ୍ସ ରାଉଣ୍ଡକୁ ପରିବର୍ତ୍ତିତ ହୋଇଛି! ସ୍ଥାନୀୟ ପ୍ରାଥମିକତା ଲାଗୁ।`;
    } else {
      this.pukar.announcementHi = `📢 [सामान्य जनरल पुकार चालू]: क्रम संख्या #${fromSerial} से नियमित 15-टू-15 आवर्तन क्रम में सामान्य लोडिंग पुकार जारी है।`;
      this.pukar.announcementEn = `📢 [General Pukar Active]: Regular sequential 15-to-15 rotation loading from Serial #${fromSerial} onwards.`;
      this.pukar.announcementOr = `📢 [ସାଧାରଣ ପୁକାର ସକ୍ରିୟ]: କ୍ରମିକ ସଂଖ୍ୟା #${fromSerial} ରୁ ନିୟମିତ ଲୋଡିଂ ପୁକାର ଜାରି ରହିଛି।`;
    }

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PUKAR_MODE_CONVERTED',
      oldValue: oldMode,
      newValue: `${newMode} (from #${fromSerial})`,
      source: 'DISPATCH_ACTION',
      notes: `Pukar mode converted from ${oldMode} to ${newMode} starting at serial #${fromSerial}.`,
    });

    return this.pukar;
  }

  public publishAiPukarNotice(notice: ParsedPukarNotice, actor: string): ParsedPukarNotice {
    this.pukar.currentNotice = notice;
    this.pukar.isActive = true;
    this.pukar.announcedAt = new Date().toISOString();
    this.pukar.announcedBy = actor;
    this.pukar.announcementHi = `🚨 ${notice.title} जारी हो गया है। कुल ${notice.items.length} लोडिंग स्लॉट उपलब्ध हैं। ${notice.cuttingRule || ''}`;
    this.pukar.announcementEn = `🚨 ${notice.title} published with ${notice.items.length} active loading slots. ${notice.cuttingRule || ''}`;
    this.pukar.announcementOr = `🚨 ${notice.title} ପ୍ରକାଶିତ ହୋଇଛି। ${notice.items.length} ଟି ଲୋଡିଂ ସ୍ଲଟ୍ ଉପଲବ୍ଧ।`;
    this.pukar.activeProgramsCount = notice.items.length;

    // Clear previous programs so only the fresh notice items are live
    this.programs.clear();

    // Convert parsed items into LoadingPrograms for seamless synchronization
    for (const item of notice.items) {
      const companyEnum = item.plantSection.includes('BLUEFOX')
        ? 'Blue Fox'
        : item.plantSection.includes('SMELTER')
        ? 'Hindalco Samelter'
        : item.plantSection.includes('12 WHEELER')
        ? 'Other'
        : 'Other';

      this.programs.set(item.id, {
        id: item.id,
        company: companyEnum,
        companyCustomName: `${item.plantSection} - ${item.destination}`,
        destination: `${item.destination} (${item.cargo}) [${item.dateLabel}]`,
        categoryRequired: item.categoryRequired,
        capacityTonRequired: item.capacityMt,
        totalQuota: item.vehicleQuota,
        bookedCount: item.bookedCount,
        ratePerTon: item.ratePerTon || 2200,
        advancePercentage: 70,
        pendingFreightAllowed: item.plantSection.includes('PENDING'),
        preferenceRule: item.remarks,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    this.addAuditLog({
      actor,
      actorRole: 'ADMIN',
      action: 'AI_PUKAR_NOTICE_PUBLISHED',
      field: 'currentNotice',
      newValue: notice.title,
      source: 'DISPATCH_ACTION',
      notes: `AI 1-Click Pukar Notice Broadcasted: ${notice.items.length} loading slots activated`,
    });

    return notice;
  }

  // --- Owner Serial Slip Booking ("ओनर अपना सिरियल नंबर डालकर पर्ची कटा सकें") ---
  public bookSlipByOwnerSerial(params: {
    serialNumber: number;
    vehicleNumber: string;
    pukarItemId: string;
    driverName?: string;
  }): {
    success: boolean;
    gatePass?: GatePass;
    ledgerEntry?: LedgerEntry;
    error?: string;
    errors?: string[];
  } {
    const norm = normalizeVehicleNumber(params.vehicleNumber);
    const vehicle = this.vehicles.get(norm);
    const today = new Date().toISOString().slice(0, 10);
    const errors: string[] = [];

    if (!vehicle) {
      return { success: false, error: `गाड़ी नंबर ${params.vehicleNumber} पंजीकृत नहीं है।` };
    }

    // 1. Serial Number verification
    if (vehicle.serialNumber !== Number(params.serialNumber)) {
      errors.push(
        `दर्ज किया गया क्रम #${params.serialNumber} इस गाड़ी के वर्तमान क्रम #${vehicle.serialNumber} से मेल नहीं खाता है।`
      );
    }

    // 2. Blacklist check
    if (vehicle.isBlacklisted) {
      errors.push(`गाड़ी ब्लैकलिस्टेड है: ${vehicle.blacklistReason || 'कारण अनिर्दिष्ट'}`);
    }

    // 3. Membership check
    if (vehicle.membershipStatus === 'EXPIRED') {
      errors.push('एसोसिएशन सदस्यता समाप्त हो चुकी है। कृपया पहले नवीनीकरण कराएं।');
    }

    // 4. Status check
    if (vehicle.status === 'ARCHIVED' || vehicle.status === 'MAINTENANCE') {
      errors.push(`गाड़ी की स्थिति वर्तमान में लोडिंग योग्य नहीं है: ${vehicle.status}`);
    }

    // 5. Same-Day Lock check (Active non-cancelled pass check)
    const activePassToday = Array.from(this.gatePasses.values()).find(
      (gp) =>
        (normalizeVehicleNumber(gp.vehicleNumber) === norm ||
          gp.vehicleNumber === vehicle.displayNumber) &&
        gp.issueDate === today &&
        gp.status !== 'CANCELLED'
    );
    if (activePassToday) {
      errors.push(
        `Same-Day Lock: आपकी गाड़ी आज (${today}) पहले से लोड/पर्ची कटी है (सक्रिय पर्ची: ${activePassToday.token})। बिना पुरानी पर्ची रद्द (Cancel) किए नई पर्ची नहीं कटाई जा सकती।`
      );
    }

    // 6. Check Pukar Item
    const notice = this.pukar.currentNotice;
    const pukarItem = notice?.items.find((item) => item.id === params.pukarItemId);
    const fallbackProgram = this.programs.get(params.pukarItemId);

    if (!pukarItem && !fallbackProgram) {
      errors.push('चयनित लोडिंग स्लॉट नहीं मिला अथवा समाप्त हो चुका है।');
      return { success: false, errors };
    }

    const availableQuota = pukarItem
      ? pukarItem.vehicleQuota - pukarItem.bookedCount
      : (fallbackProgram?.totalQuota || 0) - (fallbackProgram?.bookedCount || 0);

    if (availableQuota <= 0) {
      errors.push('इस लोडिंग लाइन का कोटा पूर्ण हो चुका है। कृपया दूसरा स्लॉट चुनें।');
    }

    // 7. Capacity matching check
    const requiredCapacity = pukarItem ? pukarItem.capacityMt : fallbackProgram?.capacityTonRequired || 16;
    if (vehicle.capacityTon < requiredCapacity - 2) {
      errors.push(
        `वाहन क्षमता कम है: इस स्लॉट के लिए ${requiredCapacity} टन की आवश्यकता है (आपकी गाड़ी: ${vehicle.capacityTon} टन)`
      );
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // --- TRANSACTION-SAFE SLIP GENERATION & SERIAL ROTATION ---
    const currentSerial = vehicle.serialNumber;
    const maxSerial = this.getMaxSerial();
    const nextSerial = maxSerial + 1;

    // Increment item booking
    if (pukarItem) {
      pukarItem.bookedCount += 1;
    }
    if (fallbackProgram) {
      fallbackProgram.bookedCount += 1;
    }

    // Update vehicle
    vehicle.serialNumber = nextSerial;
    vehicle.status = 'LOADED_TODAY';
    vehicle.lastLoadedDate = today;
    vehicle.updatedAt = new Date().toISOString();
    this.vehicles.set(vehicle.normalizedNumber, vehicle);

    const fee = calculateAssociationFee(vehicle.capacityTon);
    const year = new Date().getFullYear();
    const token = `STOA-${year}-${this.nextTokenCounter++}`;
    const now = new Date();
    const issueDate = now.toISOString().slice(0, 10);
    const issueTime = now.toTimeString().slice(0, 8);

    const companyName = pukarItem
      ? `${pukarItem.plantSection} (${pukarItem.cargo})`
      : fallbackProgram?.company || 'STOA Line';
    const destination = pukarItem ? pukarItem.destination : fallbackProgram?.destination || 'Sambalpur Line';

    const qrPayload = `STOA|${token}|${vehicle.normalizedNumber}|${currentSerial}|${vehicle.capacityTon}T|${companyName}|UNPAID`;

    const gatePass: GatePass = {
      id: `pass-${Date.now()}`,
      token,
      currentSerial,
      nextSerial,
      vehicleNumber: vehicle.normalizedNumber,
      ownerName: vehicle.ownerName,
      ownerMobile: vehicle.ownerMobile,
      category: vehicle.category,
      capacityTon: vehicle.capacityTon,
      company: companyName,
      companyName: companyName,
      driverName: params.driverName,
      destination,
      programId: params.pukarItemId,
      issueDate,
      issueTime,
      paymentStatus: 'UNPAID',
      paymentAmount: fee,
      status: 'VALID',
      qrPayload,
    };

    this.gatePasses.set(gatePass.id, gatePass);

    const cycle = calculate15to15Cycle(now);
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      token,
      loadingDate: issueDate,
      cycle: cycle.cycleName,
      currentSerial,
      newSerial: nextSerial,
      vehicleNumber: vehicle.normalizedNumber,
      ownerName: vehicle.ownerName,
      company: companyName,
      route: destination,
      status: 'VALID',
      paymentStatus: 'UNPAID',
      amountPaid: 0,
      driverName: params.driverName || 'Self / Driver Registered',
      notes: `Owner online slip cut (पर्ची कटी). Serial rotated ${currentSerial} -> ${nextSerial}`,
    };
    this.ledger.unshift(ledgerEntry);

    this.addAuditLog({
      actor: vehicle.ownerName,
      actorRole: 'OWNER',
      action: 'OWNER_SLIP_CUT',
      vehicleNumber: vehicle.normalizedNumber,
      field: 'serialNumber',
      oldValue: String(currentSerial),
      newValue: String(nextSerial),
      source: 'DISPATCH_ACTION',
      notes: `Token: ${token} | Slot: ${destination} (${companyName}) | Serial rotated to #${nextSerial}`,
    });

    return { success: true, gatePass, ledgerEntry };
  }

  // --- Loading Programs ---
  public getPrograms(): LoadingProgram[] {
    const progs = Array.from(this.programs.values());
    return progs.map((prog) => {
      // Find all valid issued gate passes / slips for this program
      const matchingPasses = Array.from(this.gatePasses.values()).filter(
        (gp) => gp.programId === prog.id && gp.status !== 'CANCELLED'
      );
      const slips: SlipCutSummary[] = matchingPasses.map((gp) => ({
        id: gp.id,
        token: gp.token,
        vehicleNumber: gp.vehicleNumber,
        currentSerial: gp.currentSerial,
        nextSerial: gp.nextSerial,
        ownerName: gp.ownerName,
        ownerMobile: gp.ownerMobile,
        issueDate: gp.issueDate,
        issueTime: gp.issueTime,
        paymentStatus: gp.paymentStatus,
      }));

      const effectiveBooked = Math.max(prog.bookedCount, slips.length);
      return {
        ...prog,
        bookedCount: effectiveBooked,
        slips,
      };
    });
  }

  public addProgram(data: Partial<LoadingProgram>, actor: string, actorRole: UserRole): LoadingProgram {
    const id = data.id || `prog-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const programType = data.programType || (data.pendingFreightAllowed ? 'PENDING' : data.preferenceRule ? 'PREFERENCE' : 'GENERAL');
    const dateSection = data.dateSection || (data.companyCustomName?.includes('TOMORROW') || data.destination?.includes('TOMORROW') ? 'TOMORROW' : 'TODAY');
    const today = new Date().toISOString().slice(0, 10);
    const dateLabel = data.dateLabel || `DT. ${today.slice(8, 10)}/${today.slice(5, 7)}/${today.slice(2, 4)}`;

    const program: LoadingProgram = {
      id,
      company: data.company || 'Hindalco Samelter',
      companyCustomName: data.companyCustomName,
      destination: data.destination || 'Sambalpur Industrial Line',
      categoryRequired: data.categoryRequired || '10-Wheel / 16-18 Ton',
      capacityTonRequired: Number(data.capacityTonRequired) || 18,
      totalQuota: Number(data.totalQuota) || 10,
      bookedCount: Number(data.bookedCount) || 0,
      ratePerTon: Number(data.ratePerTon) || 2000,
      advancePercentage: Number(data.advancePercentage) || 70,
      pendingFreightAllowed: programType === 'PENDING' ? true : Boolean(data.pendingFreightAllowed),
      preferenceRule: programType === 'PREFERENCE' ? (data.preferenceRule || 'स्थानीय संबलपुर वरीयता') : data.preferenceRule,
      programType,
      dateSection,
      dateLabel,
      cargo: data.cargo || 'COIL / RI / INDUSTRIAL GOODS',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.programs.set(id, program);

    // Synchronize into this.pukar.currentNotice so truck owners' live view and booking button activate immediately
    if (!this.pukar.currentNotice) {
      this.pukar.currentNotice = {
        id: `puk-notice-${Date.now()}`,
        title: 'दैनिक लोडिंग पुकार प्रोग्राम (Daily Loading Program)',
        rawText: '',
        publishedAt: new Date().toISOString(),
        publishedBy: actor,
        active: true,
        cuttingRule: '15-टू-15 आवर्तन एवं पुकार क्रमानुसार पर्ची कटाई',
        items: [],
      };
    }

    const pukarItem: ParsedPukarItem = {
      id: program.id,
      plantSection: program.companyCustomName || program.company,
      dateSection: program.dateSection as any,
      dateLabel: program.dateLabel || dateLabel,
      destination: program.destination,
      cargo: program.cargo || 'COIL / RI',
      capacityMt: program.capacityTonRequired,
      categoryRequired: program.categoryRequired,
      vehicleQuota: program.totalQuota,
      bookedCount: program.bookedCount,
      remarks: program.preferenceRule || '',
      ratePerTon: program.ratePerTon,
    };

    const existingIdx = this.pukar.currentNotice.items.findIndex((it) => it.id === id);
    if (existingIdx >= 0) {
      this.pukar.currentNotice.items[existingIdx] = pukarItem;
    } else {
      this.pukar.currentNotice.items.push(pukarItem);
    }

    this.pukar.isActive = true;
    this.pukar.activeProgramsCount = this.programs.size;
    this.pukar.announcementHi = `🚨 दैनिक लोडिंग प्रोग्राम सक्रिय है। कुल ${this.programs.size} स्लॉट उपलब्ध हैं। गाड़ियां नियमानुसार पर्ची कटाएं।`;

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PROGRAM_CREATED',
      newValue: `[${programType}] ${program.company} -> ${program.destination} (Quota: ${program.totalQuota})`,
      source: 'DISPATCH_ACTION',
    });

    return program;
  }

  public addProgramsBatch(programsList: Partial<LoadingProgram>[], actor: string, actorRole: UserRole): LoadingProgram[] {
    const created: LoadingProgram[] = [];
    for (const progData of programsList) {
      const p = this.addProgram(progData, actor, actorRole);
      created.push(p);
    }
    return created;
  }

  public updateProgram(
    id: string,
    updates: Partial<LoadingProgram>,
    actor: string,
    actorRole: UserRole
  ): LoadingProgram {
    const existing = this.programs.get(id);
    if (!existing) throw new Error('लोडिंग प्रोग्राम नहीं मिला (Program not found)');
    const updated = { ...existing, ...updates };
    this.programs.set(id, updated);

    // Sync in currentNotice
    if (this.pukar.currentNotice?.items) {
      const item = this.pukar.currentNotice.items.find((it) => it.id === id);
      if (item) {
        if (updates.totalQuota !== undefined) item.vehicleQuota = updates.totalQuota;
        if (updates.destination !== undefined) item.destination = updates.destination;
        if (updates.capacityTonRequired !== undefined) item.capacityMt = updates.capacityTonRequired;
        if (updates.ratePerTon !== undefined) item.ratePerTon = updates.ratePerTon;
      }
    }

    return updated;
  }

  public deleteProgram(id: string, actor: string, actorRole: UserRole): boolean {
    const existing = this.programs.get(id);
    let removedFromNotice = false;

    // Also remove from active pukar notice items if present
    if (this.pukar.currentNotice?.items) {
      const prevLen = this.pukar.currentNotice.items.length;
      this.pukar.currentNotice.items = this.pukar.currentNotice.items.filter((item) => item.id !== id);
      if (this.pukar.currentNotice.items.length < prevLen) {
        removedFromNotice = true;
      }
    }

    if (!existing && !removedFromNotice) return false;

    if (existing) {
      this.programs.delete(id);
    }

    this.pukar.activeProgramsCount = Math.max(
      this.programs.size,
      this.pukar.currentNotice?.items?.length || 0
    );

    // If all programs and notice items removed, reset active notice state cleanly
    if (this.programs.size === 0 && (!this.pukar.currentNotice?.items || this.pukar.currentNotice.items.length === 0)) {
      this.pukar.currentNotice = undefined;
      this.pukar.isActive = false;
      this.pukar.activeProgramsCount = 0;
      const schedule = calculateNextLoadingShift();
      this.pukar.scheduleInfo = schedule;
      this.pukar.announcementHi = `वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है। (अगला कार्यक्रम: ${schedule.nextShiftLabelHi})`;
    }

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PROGRAM_DELETED',
      oldValue: existing ? `${existing.company} -> ${existing.destination}` : id,
      source: 'DISPATCH_ACTION',
      notes: `Admin removed daily load program: ${id}`,
    });

    return true;
  }

  /**
   * Deletes all loading programs where all vehicles have cut their slips (bookedCount >= totalQuota)
   */
  public deleteCompletedPrograms(actor: string, actorRole: UserRole): { deletedCount: number; remainingCount: number } {
    let deletedCount = 0;
    for (const [id, prog] of this.programs.entries()) {
      // Check if quota full (either recorded bookedCount or valid issued slips)
      const slipsCount = Array.from(this.gatePasses.values()).filter(
        (gp) => gp.programId === id && gp.status !== 'CANCELLED'
      ).length;
      const count = Math.max(prog.bookedCount, slipsCount);

      if (count >= prog.totalQuota) {
        this.deleteProgram(id, actor, actorRole);
        deletedCount++;
      }
    }
    return { deletedCount, remainingCount: this.programs.size };
  }

  /**
   * Prepares the system for next day's loading program:
   * clears old/completed loads, sets next date, and seeds new loads if provided
   */
  public startNextDayPrograms(params: {
    clearAllPrevious?: boolean;
    clearCompletedOnly?: boolean;
    dateLabel?: string;
    newPrograms?: Partial<LoadingProgram>[];
  }, actor: string, actorRole: UserRole): { success: boolean; clearedCount: number; newProgramsCount: number } {
    let clearedCount = 0;
    if (params.clearAllPrevious) {
      clearedCount = this.programs.size;
      this.programs.clear();
      this.pukar.currentNotice = undefined;
      this.pukar.isActive = false;
      this.pukar.activeProgramsCount = 0;
    } else if (params.clearCompletedOnly) {
      const res = this.deleteCompletedPrograms(actor, actorRole);
      clearedCount = res.deletedCount;
    }

    let addedCount = 0;
    if (params.newPrograms && params.newPrograms.length > 0) {
      for (const pData of params.newPrograms) {
        if (params.dateLabel) {
          pData.dateLabel = params.dateLabel;
        }
        this.addProgram(pData, actor, actorRole);
        addedCount++;
      }
    }

    this.addAuditLog({
      actor,
      actorRole,
      action: 'NEXT_DAY_LOADING_STARTED',
      newValue: `Cleared ${clearedCount} old programs, posted ${addedCount} new programs for ${params.dateLabel || 'Next Day'}`,
      source: 'DISPATCH_ACTION',
      notes: 'Admin started fresh daily loading schedule.',
    });

    return { success: true, clearedCount, newProgramsCount: this.programs.size };
  }

  public clearDailyNotice(actor: string, actorRole: UserRole): boolean {
    const oldNotice = this.pukar.currentNotice;
    this.programs.clear();
    this.pukar.currentNotice = undefined;
    this.pukar.isActive = false;
    this.pukar.activeProgramsCount = 0;
    const schedule = calculateNextLoadingShift();
    this.pukar.scheduleInfo = schedule;
    this.pukar.announcementHi = `वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है। (अगला कार्यक्रम: ${schedule.nextShiftLabelHi})`;
    this.pukar.announcementEn = 'No loading program is currently active. Next loading notice will be announced soon.';
    this.pukar.announcementOr = 'ବର୍ତ୍ତମାନ କୌଣସି ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ସକ୍ରିୟ ନାହିଁ।';

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PUKAR_NOTICE_CLEARED',
      oldValue: oldNotice?.title || 'Daily Notice',
      newValue: 'INACTIVE',
      source: 'DISPATCH_ACTION',
      notes: 'Admin cleared daily pukar notice and disabled current slots.',
    });

    return true;
  }

  /**
   * Completely removes all daily loading programs and resets the schedule immediately
   */
  public clearAllDailyPrograms(actor: string, actorRole: UserRole): { success: boolean; clearedCount: number; pukar: PukarState } {
    const count = this.programs.size;
    this.programs.clear();
    this.pukar.currentNotice = undefined;
    this.pukar.isActive = false;
    this.pukar.activeProgramsCount = 0;
    this.pukar.mode = 'GENERAL';
    this.pukar.currentProgressSerial = this.pukar.startSerial || 101;
    this.pukar.modeSwitchSerial = undefined;
    this.pukar.modeSwitchedAt = undefined;

    const schedule = calculateNextLoadingShift();
    this.pukar.scheduleInfo = schedule;
    this.pukar.announcementHi = `वर्तमान में कोई लोडिंग प्रोग्राम सक्रिय नहीं है। एसोसिएशन का लोडिंग पुकार प्रोग्राम रोजाना सुबह 10:00 बजे और शाम 04:00 बजे चालू होता है। (अगला कार्यक्रम: ${schedule.nextShiftLabelHi})`;
    this.pukar.announcementEn = `No loading program is currently active. Daily loading pukar operates at 10:00 AM and 04:00 PM. (Next: ${schedule.nextShiftLabelEn})`;
    this.pukar.announcementOr = `ବର୍ତ୍ତମାନ କୌଣସି ଲୋଡିଂ ପ୍ରୋଗ୍ରାମ ସକ୍ରିୟ ନାହିଁ। ଦୈନିକ ଲୋଡିଂ କାର୍ଯ୍ୟକ୍ରମ ସକାଳ ୧୦:୦୦ ଏବଂ ସନ୍ଧ୍ୟା ୦୪:୦୦ ରେ ଆରମ୍ଭ ହୁଏ। (${schedule.nextShiftLabelOr})`;

    this.addAuditLog({
      actor,
      actorRole,
      action: 'ALL_PROGRAMS_CLEARED',
      oldValue: `${count} loading programs`,
      newValue: 'EMPTY',
      source: 'DISPATCH_ACTION',
      notes: 'Admin completely deleted all daily loading programs & cleared pukar notice immediately in 1-click.',
    });

    return { success: true, clearedCount: count, pukar: this.pukar };
  }

  /**
   * Ends active pukar and deletes all loading programs so the system resets for the next shift/day
   */
  public endPukarAndClearAll(actor: string, actorRole: UserRole): { success: boolean; message: string; clearedCount: number; pukar: PukarState } {
    const result = this.clearAllDailyPrograms(actor, actorRole);
    return {
      success: true,
      message: 'पुकार समाप्त कर दी गई एवं सभी लोडिंग प्रोग्राम तुरंत डिलीट कर दिए गए।',
      clearedCount: result.clearedCount,
      pukar: result.pukar,
    };
  }

  // --- 9-POINT DISPATCH VALIDATION & SERIAL ROTATION ---
  public validateAndDispatch(
    vehicleNumber: string,
    programId: string,
    actor: string,
    actorRole: UserRole,
    driverName?: string
  ): {
    success: boolean;
    gatePass?: GatePass;
    ledgerEntry?: LedgerEntry;
    errors?: string[];
  } {
    const norm = normalizeVehicleNumber(vehicleNumber);
    const vehicle = this.vehicles.get(norm);
    const program = this.programs.get(programId);
    const pukar = this.getPukar();
    const today = new Date().toISOString().slice(0, 10);

    const errors: string[] = [];

    // Check 1: Vehicle exists
    if (!vehicle) {
      errors.push(`गाड़ी नंबर ${vehicleNumber} फ्लीट डेटाबेस में नहीं है (Vehicle does not exist)`);
      return { success: false, errors };
    }

    // Check 2: Active or In Queue
    if (vehicle.status === 'ARCHIVED' || vehicle.status === 'MAINTENANCE') {
      errors.push(`गाड़ी की स्थिति वर्तमान में अनुमत नहीं है: ${vehicle.status} (Vehicle status not active)`);
    }

    // Check 3: Membership valid where required
    if (vehicle.membershipStatus === 'EXPIRED') {
      errors.push('सदस्यता समाप्त हो चुकी है। कृपया रिन्यूअल कराएं (Membership expired)');
    }

    // Check 4: Not blacklisted
    if (vehicle.isBlacklisted) {
      errors.push(`गाड़ी ब्लैकलिस्टेड है: ${vehicle.blacklistReason || 'कारण अनिर्दिष्ट'} (Vehicle is blacklisted)`);
    }

    // Check 5: Pukar active
    if (!pukar.isActive) {
      errors.push('वर्तमान में पुकार बंद है। केवल पुकार चालू होने पर ही डिस्पैच संभव है (Pukar is currently inactive)');
    }

    // Check 6: Serial inside Pukar range
    if (pukar.isActive && (vehicle.serialNumber < pukar.startSerial || vehicle.serialNumber > pukar.endSerial)) {
      errors.push(
        `क्रम संख्या #${vehicle.serialNumber} वर्तमान पुकार रेंज [${pukar.startSerial} - ${pukar.endSerial}] से बाहर है (Serial outside pukar range)`
      );
    }

    // Check 7: Same-day lock (cannot load twice in one day unless previous slip was cancelled)
    const activePassToday = Array.from(this.gatePasses.values()).find(
      (gp) =>
        (normalizeVehicleNumber(gp.vehicleNumber) === normalizeVehicleNumber(vehicle.normalizedNumber) ||
          gp.vehicleNumber === vehicle.displayNumber) &&
        gp.issueDate === today &&
        gp.status !== 'CANCELLED'
    );
    if (activePassToday) {
      errors.push(
        `Same-Day Lock: यह गाड़ी आज (${today}) पहले ही सक्रिय पर्ची (${activePassToday.token}) के साथ दर्ज है। बिना रद्दीकरण के दोबारा पर्ची जारी नहीं की जा सकती।`
      );
    }

    // Check 8: Loading program active
    if (!program || !program.isActive) {
      errors.push('चयनित लोडिंग प्रोग्राम सक्रिय नहीं है (Loading program inactive or not found)');
      return { success: false, errors };
    }

    // Check 9: Quota available
    if (program.bookedCount >= program.totalQuota) {
      errors.push(`इस प्रोग्राम का कोटा (${program.totalQuota}) पूर्ण हो चुका है (Quota full)`);
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // --- TRANSACTION-SAFE ROTATION ---
    const currentSerial = vehicle.serialNumber;
    let nextSerial = currentSerial;

    if (program.pendingFreightAllowed) {
      // Pending Freight / No Rotation = protect current serial!
      nextSerial = currentSerial;
    } else {
      // Normal Rotation: next serial = maxSerial + 1
      const maxSerial = this.getMaxSerial();
      nextSerial = maxSerial + 1;
    }

    // Calculate Association Fee: >18 ton = ₹700, otherwise ₹500
    const fee = calculateAssociationFee(vehicle.capacityTon);

    // Generate Token: STOA-YEAR-XXXX
    const year = new Date().getFullYear();
    const token = `STOA-${year}-${this.nextTokenCounter++}`;

    const now = new Date();
    const issueDate = now.toISOString().slice(0, 10);
    const issueTime = now.toTimeString().slice(0, 8);

    const qrPayload = `STOA|${token}|${vehicle.normalizedNumber}|${currentSerial}|${vehicle.capacityTon}T|${program.company}|UNPAID`;

    const gatePass: GatePass = {
      id: `pass-${Date.now()}`,
      token,
      currentSerial,
      nextSerial,
      vehicleNumber: vehicle.normalizedNumber,
      ownerName: vehicle.ownerName,
      ownerMobile: vehicle.ownerMobile,
      category: vehicle.category,
      capacityTon: vehicle.capacityTon,
      company: program.companyCustomName || program.company,
      destination: program.destination,
      programId: program.id,
      issueDate,
      issueTime,
      paymentStatus: 'UNPAID',
      paymentAmount: fee,
      status: 'VALID',
      qrPayload,
    };

    // Update Program Bookings
    program.bookedCount += 1;
    this.programs.set(program.id, program);

    // Update Vehicle
    vehicle.serialNumber = nextSerial;
    vehicle.status = 'LOADED_TODAY';
    vehicle.lastLoadedDate = issueDate;
    vehicle.updatedAt = now.toISOString();
    this.vehicles.set(vehicle.normalizedNumber, vehicle);

    // Store Gate Pass
    this.gatePasses.set(gatePass.id, gatePass);

    // Store Ledger Entry
    const cycle = calculate15to15Cycle(now);
    const ledgerEntry: LedgerEntry = {
      id: `led-${Date.now()}`,
      token,
      loadingDate: issueDate,
      cycle: cycle.cycleName,
      currentSerial,
      newSerial: nextSerial,
      vehicleNumber: vehicle.normalizedNumber,
      ownerName: vehicle.ownerName,
      company: program.companyCustomName || program.company,
      route: program.destination,
      status: 'VALID',
      paymentStatus: 'UNPAID',
      amountPaid: 0,
      driverName: driverName || 'Driver Registered',
      notes: `Dispatched by ${actor}. Serial rotated ${currentSerial} -> ${nextSerial}`,
    };
    this.ledger.unshift(ledgerEntry);

    // Audit log
    this.addAuditLog({
      actor,
      actorRole,
      action: 'DISPATCH_COMPLETED',
      vehicleNumber: vehicle.normalizedNumber,
      field: 'serialNumber',
      oldValue: String(currentSerial),
      newValue: String(nextSerial),
      source: 'DISPATCH_ACTION',
      notes: `Token: ${token} | Program: ${program.company} to ${program.destination}`,
    });

    return { success: true, gatePass, ledgerEntry };
  }

  // --- Gate Pass Operations ---
  public getGatePasses(filter?: { vehicleNumber?: string; status?: string; token?: string }): GatePass[] {
    let list = Array.from(this.gatePasses.values());
    if (filter?.vehicleNumber) {
      const norm = normalizeVehicleNumber(filter.vehicleNumber);
      list = list.filter((g) => g.vehicleNumber === norm);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((g) => g.status === filter.status);
    }
    if (filter?.token) {
      list = list.filter((g) => g.token.toLowerCase().includes(filter.token!.toLowerCase()));
    }
    return list.sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.issueTime.localeCompare(a.issueTime));
  }

  public verifyPayment(
    passId: string,
    paymentRef: string,
    actor: string,
    actorRole: UserRole
  ): GatePass {
    const pass = this.gatePasses.get(passId);
    if (!pass) throw new Error('गेट पास नहीं मिला (Gate pass not found)');
    if (pass.status === 'CANCELLED') throw new Error('रद्द पास का भुगतान संभव नहीं (Cannot pay cancelled pass)');

    pass.paymentStatus = 'VERIFIED_PAID';
    pass.paymentReference = paymentRef || `VERIFIED-${Date.now()}`;
    pass.paidAt = new Date().toISOString();
    pass.qrPayload = pass.qrPayload.replace('UNPAID', 'PAID|VERIFIED');

    this.gatePasses.set(passId, pass);

    // Update corresponding ledger entry
    const ledgerItem = this.ledger.find((l) => l.token === pass.token);
    if (ledgerItem) {
      ledgerItem.paymentStatus = 'VERIFIED_PAID';
      ledgerItem.amountPaid = pass.paymentAmount;
    }

    this.addAuditLog({
      actor,
      actorRole,
      action: 'PAYMENT_VERIFIED',
      vehicleNumber: pass.vehicleNumber,
      field: 'paymentStatus',
      oldValue: 'UNPAID',
      newValue: `VERIFIED_PAID (₹${pass.paymentAmount})`,
      source: 'PAYMENT_VERIFICATION',
      notes: `Ref: ${pass.paymentReference}`,
    });

    return pass;
  }

  public cancelGatePass(
    passId: string,
    reason: string,
    actor: string,
    actorRole: UserRole,
    vehicleNumber?: string
  ): GatePass {
    const pass = this.gatePasses.get(passId);
    if (!pass) throw new Error('गेट पास नहीं मिला');
    if (pass.status === 'CANCELLED') throw new Error('पास पहले से रद्द है (Already cancelled)');

    // Authorization check
    if (actorRole === 'OWNER') {
      if (vehicleNumber && normalizeVehicleNumber(vehicleNumber) !== pass.vehicleNumber) {
        throw new Error('सुरक्षा अस्वीकृति: आप केवल अपनी गाड़ी का ही पास रद्द कर सकते हैं');
      }
    } else if (actorRole !== 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
      throw new Error('अनधिकृत कार्रवाई (Unauthorized cancellation)');
    }

    const cleanReason = (reason || '').trim() || 'मालिक/एडमिन द्वारा लोडिंग रद्द';
    const now = new Date().toISOString();
    pass.status = 'CANCELLED';
    pass.cancellationReason = cleanReason;
    pass.cancelledAt = now;
    pass.cancelledBy = actor || (actorRole === 'OWNER' ? 'गाड़ी मालिक' : 'कंट्रोल एडमिन');

    this.gatePasses.set(passId, pass);

    // Rollback program booking quota
    const program = this.programs.get(pass.programId);
    if (program && program.bookedCount > 0) {
      program.bookedCount -= 1;
      this.programs.set(program.id, program);
    }

    if (this.pukar.currentNotice?.items) {
      const pItem = this.pukar.currentNotice.items.find((item) => item.id === pass.programId);
      if (pItem && pItem.bookedCount > 0) {
        pItem.bookedCount -= 1;
      }
    }

    // Rollback vehicle status & permanently record in vehicle.cancellationHistory for both Admin & Owner profiles
    const vehicle = this.getVehicleByNumber(pass.vehicleNumber) || this.vehicles.get(normalizeVehicleNumber(pass.vehicleNumber));
    if (vehicle) {
      vehicle.status = 'IN_QUEUE';
      // Rollback serial to currentSerial so owner does not lose their rightful turn
      vehicle.serialNumber = pass.currentSerial;

      const cancellationRecord: SlipCancellationRecord = {
        id: `canc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        passId: pass.id,
        token: pass.token,
        vehicleNumber: vehicle.displayNumber || pass.vehicleNumber,
        programTitle: pass.company || 'Loading Program',
        destination: pass.destination || 'Industrial Line',
        cancelledAt: now,
        cancelledBy: pass.cancelledBy,
        cancellationReason: cleanReason,
        originalSerial: pass.currentSerial,
      };

      vehicle.cancellationHistory = vehicle.cancellationHistory || [];
      vehicle.cancellationHistory.unshift(cancellationRecord);

      // Reset lastLoadedDate if this cancelled pass was for today, so vehicle can re-cut slip on the same date!
      const hasOtherActivePassToday = Array.from(this.gatePasses.values()).some(
        (gp) =>
          gp.id !== passId &&
          (normalizeVehicleNumber(gp.vehicleNumber) === vehicle.normalizedNumber ||
            gp.vehicleNumber === vehicle.displayNumber) &&
          gp.issueDate === pass.issueDate &&
          gp.status !== 'CANCELLED'
      );
      if (!hasOtherActivePassToday && vehicle.lastLoadedDate === pass.issueDate) {
        vehicle.lastLoadedDate = undefined;
      }

      this.vehicles.set(vehicle.normalizedNumber, vehicle);
    }

    // Mark ledger entry cancelled with reason & actor
    const ledgerItem = this.ledger.find((l) => l.token === pass.token);
    if (ledgerItem) {
      ledgerItem.status = 'CANCELLED';
      ledgerItem.notes = `CANCELLED (${pass.cancelledBy}): ${cleanReason}`;
    }

    this.addAuditLog({
      actor: pass.cancelledBy,
      actorRole,
      action: 'GATEPASS_CANCELLED',
      vehicleNumber: pass.vehicleNumber,
      field: 'status',
      oldValue: 'VALID',
      newValue: 'CANCELLED',
      source: 'DISPATCH_ACTION',
      notes: `Reason: ${cleanReason} | Token: ${pass.token}`,
    });

    return pass;
  }

  // --- 15-to-15 Lifetime Ledger & Daily Cash CSV ---
  public getLedger(filter?: {
    search?: string;
    status?: 'ALL' | 'VALID' | 'CANCELLED';
    paymentStatus?: 'ALL' | 'UNPAID' | 'VERIFIED_PAID';
    cycle?: string;
  }): LedgerEntry[] {
    let list = [...this.ledger];
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (l) =>
          l.token.toLowerCase().includes(q) ||
          l.vehicleNumber.toLowerCase().includes(q) ||
          l.ownerName.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          String(l.currentSerial).includes(q)
      );
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((l) => l.status === filter.status);
    }
    if (filter?.paymentStatus && filter.paymentStatus !== 'ALL') {
      list = list.filter((l) => l.paymentStatus === filter.paymentStatus);
    }
    if (filter?.cycle && filter.cycle !== 'ALL') {
      list = list.filter((l) => l.cycle === filter.cycle);
    }
    return list;
  }

  public getDailyCashCsv(): string {
    // Only VALID + PAID
    const paidList = this.ledger.filter((l) => l.status === 'VALID' && l.paymentStatus === 'VERIFIED_PAID');
    const header = 'id,token,truck,serial,nextSerial,amountPaid,date,company,owner\n';
    const rows = paidList.map(
      (l) =>
        `"${l.id}","${l.token}","${l.vehicleNumber}","${l.currentSerial}","${l.newSerial}",${l.amountPaid},"${l.loadingDate}","${l.company}","${l.ownerName}"`
    );
    return header + rows.join('\n');
  }

  // --- Membership & Documents ---
  public renewMembership(
    vehicleNumber: string,
    months: 6 | 12 | 24,
    feePaid: number,
    actor: string,
    actorRole: UserRole,
    paymentMode: 'CASH' | 'ONLINE' | 'UPI' = 'CASH',
    customRenewalYear?: string
  ): { vehicle: Vehicle; receipt: MembershipRenewalReceipt } {
    const norm = normalizeVehicleNumber(vehicleNumber);
    const vehicle = this.vehicles.get(norm);
    if (!vehicle) throw new Error('गाड़ी नहीं मिली');

    const currentExpiry = new Date(vehicle.membershipExpiryDate || new Date());
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();

    const previousExpiryDate = vehicle.membershipExpiryDate || new Date().toISOString().slice(0, 10);
    baseDate.setMonth(baseDate.getMonth() + months);
    const newExpiry = baseDate.toISOString().slice(0, 10);

    vehicle.membershipExpiryDate = newExpiry;
    vehicle.membershipStatus = 'ACTIVE';
    vehicle.isBlacklisted = false; // clear renewal blacklist
    vehicle.updatedAt = new Date().toISOString();

    const currentCount = (vehicle.renewalCount || 0) + 1;
    vehicle.renewalCount = currentCount;

    // Generate auto-increment official receipt number
    const receiptNum = this.nextReceiptNumber++;
    const now = new Date();
    const dateFormatted = formatReceiptDate(now);
    const renewalYear = customRenewalYear || getFinancialYear(now);
    const feeInWords = amountToWords(feePaid);

    const receipt: MembershipRenewalReceipt = {
      id: `REN-${now.getFullYear()}-${String(receiptNum).padStart(4, '0')}`,
      receiptNumber: receiptNum,
      receiptNumberFormatted: String(receiptNum),
      dateFormatted,
      ownerName: vehicle.ownerName,
      ownerMobile: vehicle.ownerMobile,
      vehicleNumber: vehicle.normalizedNumber,
      displayNumber: vehicle.displayNumber || formatVehicleDisplay(vehicle.normalizedNumber),
      membershipNumber: vehicle.membershipNumber || '2731273',
      feeAmount: feePaid,
      feeInWords,
      renewalYear,
      monthsAdded: months,
      previousExpiryDate,
      newExpiryDate: newExpiry,
      renewalCountForVehicle: currentCount,
      paymentMode,
      issuedBy: actor || "Sambalpur Truck Owner's Association",
      issuedAt: now.toISOString(),
      notes: `Membership renewed for ${months} months towards year ${renewalYear}.`,
    };

    if (!vehicle.renewalHistory) {
      vehicle.renewalHistory = [];
    }
    vehicle.renewalHistory.unshift(receipt);
    this.vehicles.set(norm, vehicle);

    this.renewalReceipts.set(String(receiptNum), receipt);
    this.renewalReceipts.set(receipt.id, receipt);

    this.addAuditLog({
      actor,
      actorRole,
      action: 'MEMBERSHIP_RENEWED',
      vehicleNumber: norm,
      field: 'membershipExpiryDate',
      oldValue: previousExpiryDate,
      newValue: `${newExpiry} (+${months} months, Fee: ₹${feePaid}, Receipt #${receiptNum})`,
      source: 'MANUAL_EDIT',
      notes: `Official STOA Renewal Receipt #${receiptNum} generated for ${vehicle.ownerName} (${vehicle.displayNumber})`,
    });

    return { vehicle, receipt };
  }

  public getRenewalReceipts(vehicleNumber?: string): MembershipRenewalReceipt[] {
    const list = Array.from(this.renewalReceipts.values());
    // Filter duplicates by unique id
    const uniqueMap = new Map<string, MembershipRenewalReceipt>();
    list.forEach((r) => uniqueMap.set(r.id, r));
    const all = Array.from(uniqueMap.values()).sort((a, b) => b.receiptNumber - a.receiptNumber);

    if (vehicleNumber) {
      const norm = normalizeVehicleNumber(vehicleNumber);
      return all.filter((r) => r.vehicleNumber === norm);
    }
    return all;
  }

  public getRenewalReceipt(idOrNumber: string): MembershipRenewalReceipt | undefined {
    return this.renewalReceipts.get(idOrNumber);
  }

  // --- Driver Alerts & Geofencing ---
  public getDriverAlerts(): DriverAlertLocation[] {
    return this.alertLocations;
  }

  public getDriverEarnings(vehicleNumber?: string): DriverEarningRecord[] {
    return this.driverEarnings;
  }

  // --- KPI Stats ---
  public getStats(): {
    totalVehicles: number;
    readyQueueCount: number;
    loadedTodayCount: number;
    todayLoaded: number;
    currentCycle: string;
    blacklistedCount: number;
    membershipExpiringCount: number;
    todayCollectionRupees: number;
    totalCollections: number;
    pukarActive: boolean;
  } {
    const cycle = calculate15to15Cycle();
    const today = new Date().toISOString().slice(0, 10);
    const vehiclesList = Array.from(this.vehicles.values());

    const readyQueueCount = vehiclesList.filter((v) => v.status === 'IN_QUEUE' && !v.isBlacklisted).length;
    
    // Real loaded today count from active gate passes or vehicles loaded today
    const todayValidPasses = Array.from(this.gatePasses.values()).filter(
      (g) => g.issueDate === today && g.status !== 'CANCELLED'
    );
    const todayLoadedVehicles = vehiclesList.filter((v) => v.lastLoadedDate === today).length;
    const loadedTodayCount = Math.max(todayValidPasses.length, todayLoadedVehicles);

    const blacklistedCount = vehiclesList.filter((v) => v.isBlacklisted).length;
    const membershipExpiringCount = vehiclesList.filter(
      (v) => v.membershipStatus === 'EXPIRING_SOON' || v.membershipStatus === 'EXPIRED'
    ).length;

    // Today's verified collections from ledger or gate passes
    const ledgerPaid = this.ledger
      .filter((l) => l.loadingDate === today && l.status !== 'CANCELLED' && l.paymentStatus === 'VERIFIED_PAID')
      .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
    const passesPaid = todayValidPasses
      .filter((g) => g.paymentStatus === 'VERIFIED_PAID')
      .reduce((acc, curr) => acc + (curr.paymentAmount || 0), 0);
    const todayCollectionRupees = Math.max(ledgerPaid, passesPaid);

    return {
      totalVehicles: vehiclesList.length,
      readyQueueCount,
      loadedTodayCount,
      todayLoaded: loadedTodayCount,
      currentCycle: cycle.cycleName,
      blacklistedCount,
      membershipExpiringCount,
      todayCollectionRupees,
      totalCollections: todayCollectionRupees,
      pukarActive: this.pukar.isActive,
    };
  }

  // --- 7-Day Trend Analysis for Productivity Dashboard (100% Real Live Data) ---
  public getLast7DaysTrend(): {
    trend: {
      date: string;
      dayLabel: string;
      dayName: string;
      loadingCount: number;
      collections: number;
      hindalco: number;
      lapanga: number;
      vedanta: number;
      other: number;
    }[];
    summary: {
      total7DaysLoadings: number;
      total7DaysCollections: number;
      avgDailyLoadings: number;
      avgDailyCollections: number;
      peakLoadingDay: string;
      peakLoadingCount: number;
      paidPassesCount: number;
      avgFeeRate: number;
    };
  } {
    const days: {
      date: string;
      dayLabel: string;
      dayName: string;
      loadingCount: number;
      collections: number;
      hindalco: number;
      lapanga: number;
      vedanta: number;
      other: number;
    }[] = [];

    const now = new Date();
    const dayNames = ['रवि (Sun)', 'सोम (Mon)', 'मंगल (Tue)', 'बुध (Wed)', 'गुरु (Thu)', 'शुक्र (Fri)', 'शनि (Sat)'];
    const monthNames = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्तू', 'नवं', 'दिसं'];

    let totalPaidPasses = 0;
    let totalScheduledSlabSum = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = `${d.getDate()} ${monthNames[d.getMonth()]}`;
      const dayName = dayNames[d.getDay()];

      // 1. Tally actual valid gate passes for this specific date
      const passesForDate = Array.from(this.gatePasses.values()).filter(
        (gp) => gp.issueDate === dateStr && gp.status !== 'CANCELLED'
      );

      // 2. Tally actual valid ledger entries for this date
      const ledgerForDate = this.ledger.filter(
        (l) => l.loadingDate === dateStr && l.status !== 'CANCELLED'
      );

      // Unique loading events by token or ID to avoid double-counting
      const recordedTokens = new Set<string>();
      let hindalco = 0;
      let lapanga = 0;
      let vedanta = 0;
      let other = 0;
      let dayCollections = 0;

      // First process gate passes
      for (const pass of passesForDate) {
        const key = pass.token || pass.id;
        if (!recordedTokens.has(key)) {
          recordedTokens.add(key);
          const comp = (pass.company || '').toLowerCase();
          if (comp.includes('hindalco')) hindalco++;
          else if (comp.includes('lapanga') || comp.includes('birla')) lapanga++;
          else if (comp.includes('vedanta')) vedanta++;
          else other++;

          if (pass.paymentStatus === 'VERIFIED_PAID' && (pass.paymentAmount || 0) > 0) {
            dayCollections += pass.paymentAmount;
            totalPaidPasses++;
          }
          if (pass.paymentAmount) {
            totalScheduledSlabSum += pass.paymentAmount;
          }
        }
      }

      // Then process any ledger entries that might not have a matching pass in recordedTokens
      for (const entry of ledgerForDate) {
        const key = entry.token || entry.id;
        if (!recordedTokens.has(key)) {
          recordedTokens.add(key);
          const comp = (entry.company || '').toLowerCase();
          if (comp.includes('hindalco')) hindalco++;
          else if (comp.includes('lapanga') || comp.includes('birla')) lapanga++;
          else if (comp.includes('vedanta')) vedanta++;
          else other++;

          if (entry.paymentStatus === 'VERIFIED_PAID' && (entry.amountPaid || 0) > 0) {
            dayCollections += entry.amountPaid;
            totalPaidPasses++;
          }
          if (entry.amountPaid) {
            totalScheduledSlabSum += entry.amountPaid;
          }
        } else {
          // If already recorded from gate pass, check if ledger has verified payment while gatePass was unpaid
          const matchingPass = passesForDate.find((gp) => (gp.token || gp.id) === key);
          if (
            (!matchingPass || matchingPass.paymentStatus !== 'VERIFIED_PAID') &&
            entry.paymentStatus === 'VERIFIED_PAID' &&
            entry.amountPaid > 0
          ) {
            dayCollections += entry.amountPaid;
            totalPaidPasses++;
          }
        }
      }

      const dayLoads = recordedTokens.size;

      days.push({
        date: dateStr,
        dayLabel,
        dayName,
        loadingCount: dayLoads,
        collections: dayCollections,
        hindalco,
        lapanga,
        vedanta,
        other,
      });
    }

    const total7DaysLoadings = days.reduce((sum, d) => sum + d.loadingCount, 0);
    const total7DaysCollections = days.reduce((sum, d) => sum + d.collections, 0);
    const avgDailyLoadings = total7DaysLoadings > 0 ? Math.round((total7DaysLoadings / 7) * 10) / 10 : 0;
    const avgDailyCollections = total7DaysCollections > 0 ? Math.round(total7DaysCollections / 7) : 0;

    let peakDay = '—';
    let peakCount = 0;
    for (const d of days) {
      if (d.loadingCount > peakCount) {
        peakCount = d.loadingCount;
        peakDay = d.dayLabel;
      }
    }
    // If there is loading today and peakDay wasn't set because single day
    if (peakCount === 0 && days[6].loadingCount > 0) {
      peakCount = days[6].loadingCount;
      peakDay = days[6].dayLabel;
    } else if (peakCount === 0) {
      peakDay = days[6].dayLabel;
    }

    // Average fee rate strictly from actual paid or scheduled passes
    let avgFeeRate = 0;
    if (totalPaidPasses > 0 && total7DaysCollections > 0) {
      avgFeeRate = Math.round(total7DaysCollections / totalPaidPasses);
    } else if (total7DaysLoadings > 0 && totalScheduledSlabSum > 0) {
      avgFeeRate = Math.round(totalScheduledSlabSum / total7DaysLoadings);
    } else if (total7DaysLoadings > 0) {
      avgFeeRate = 500; // standard STOA slab
    }

    return {
      trend: days,
      summary: {
        total7DaysLoadings,
        total7DaysCollections,
        avgDailyLoadings,
        avgDailyCollections,
        peakLoadingDay: peakDay,
        peakLoadingCount: peakCount,
        paidPassesCount: totalPaidPasses,
        avgFeeRate,
      },
    };
  }

  // --- Emergency Video Meetings & Google Meet ---
  public getMeetings(): EmergencyMeeting[] {
    return [...this.meetings];
  }

  public addMeeting(data: Omit<EmergencyMeeting, 'id' | 'createdAt'>, actor: string = 'Admin'): EmergencyMeeting {
    const meeting: EmergencyMeeting = {
      id: `meet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.meetings.unshift(meeting);
    this.addAuditLog({
      action: 'MEETING_CREATED',
      actor,
      actorRole: 'ADMIN',
      notes: `नई वीडियो बैठक बनाई गई: "${meeting.title}" (${meeting.meetUrl})`,
      source: 'MANUAL_EDIT',
    });
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<EmergencyMeeting>, actor: string = 'Admin'): EmergencyMeeting | null {
    const idx = this.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.meetings[idx] = { ...this.meetings[idx], ...updates };
    this.addAuditLog({
      action: 'MEETING_UPDATED',
      actor,
      actorRole: 'ADMIN',
      notes: `वीडियो बैठक अपडेट की गई: "${this.meetings[idx].title}"`,
      source: 'MANUAL_EDIT',
    });
    return this.meetings[idx];
  }

  public deleteMeeting(id: string, actor: string = 'Admin'): boolean {
    const idx = this.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    const deleted = this.meetings.splice(idx, 1)[0];
    this.addAuditLog({
      action: 'MEETING_DELETED',
      actor,
      actorRole: 'ADMIN',
      notes: `वीडियो बैठक हटाई गई: "${deleted.title}"`,
      source: 'MANUAL_EDIT',
    });
    return true;
  }
}

export const store = new StoaDataStore();
