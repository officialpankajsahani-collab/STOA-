import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { store } from './store.js';
import { normalizeVehicleNumber } from './data.js';
import { reportService } from './reportService.js';
import { UserRole, VehicleCategory } from '../src/types/index.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface AdminAgentResult {
  reply: string;
  actionExecuted?: {
    toolName: string;
    description: string;
    status: 'SUCCESS' | 'ERROR' | 'INFO';
    data?: any;
  };
  navigation?: {
    targetTab?: 'dashboard' | 'fleet' | 'loading' | 'pukar' | 'membership' | 'ledger' | 'reports' | 'audit' | 'branding' | 'sponsor' | 'election' | 'settings';
    fleetFilter?: string;
    searchQuery?: string;
  };
  suggestedFollowUps?: string[];
  systemStateSnapshot?: {
    pukarActive: boolean;
    pukarRange: string;
    pukarMode: string;
    programsCount: number;
    activeFleetCount: number;
    readyQueueCount: number;
    loadedTodayCount: number;
  };
}

// ----------------- TOOL DECLARATIONS FOR GEMINI -----------------
const updatePukarDeclaration: FunctionDeclaration = {
  name: 'update_pukar',
  description: 'Control Pukar loading session: activate/deactivate, set serial number range, cycle name, mode, and broadcast announcement.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      isActive: { type: Type.BOOLEAN, description: 'True to activate Pukar, false to stop/deactivate Pukar' },
      startSerial: { type: Type.NUMBER, description: 'Starting serial number of vehicles for Pukar (e.g. 101)' },
      endSerial: { type: Type.NUMBER, description: 'Ending serial number for Pukar (e.g. 250)' },
      mode: { type: Type.STRING, description: 'Pukar mode: ROTATION, FIFO, or PRIORITY' },
      cycle: { type: Type.STRING, description: 'Cycle title like 15-टू-15 चक्र #4' },
      announcementHi: { type: Type.STRING, description: 'Official Hindi announcement message' },
    },
    required: ['isActive'],
  },
};

const postLoadingProgramDeclaration: FunctionDeclaration = {
  name: 'post_loading_program',
  description: 'Post a new commercial loading program/order for trucks with plant name, cargo material, destination, freight rate, and truck count.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      company: { type: Type.STRING, description: 'Company or industrial plant name, e.g. Vedanta Limited, Hindalco, Bhushan Steel, Shyam Steel, UltraTech' },
      destination: { type: Type.STRING, description: 'Delivery destination / route, e.g. Jharsuguda, Rourkela, Raipur, Kolkata, Haldia Port, Cuttack' },
      cargo: { type: Type.STRING, description: 'Cargo/material, e.g. अल्युमीनियम सिल्लियां, कोयला, फ्लाई ऐश, स्टील कॉइल्स, सीमेंट' },
      rate: { type: Type.NUMBER, description: 'Freight rate per ton in ₹ (e.g. 1250)' },
      requiredTrucks: { type: Type.NUMBER, description: 'Number of trucks needed (e.g. 10)' },
      advance: { type: Type.NUMBER, description: 'Advance payment per truck in ₹ (e.g. 5000)' },
      shift: { type: Type.STRING, description: 'Loading shift: DAY or NIGHT' },
      programType: { type: Type.STRING, description: 'Type: GENERAL, PENDING, or PREFERENCE' },
    },
    required: ['company', 'destination', 'rate', 'requiredTrucks'],
  },
};

const manageLoadingProgramsDeclaration: FunctionDeclaration = {
  name: 'manage_loading_programs',
  description: 'Manage existing loading programs: delete specific program, clear completed loads, clear all programs, or prepare next day programs.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: 'Action to perform: delete_program, delete_completed, clear_all, or start_next_day',
      },
      programId: { type: Type.STRING, description: 'ID of program if deleting specific program' },
      dateLabel: { type: Type.STRING, description: 'Date label if rolling over to next day' },
    },
    required: ['action'],
  },
};

const manageVehicleDeclaration: FunctionDeclaration = {
  name: 'manage_vehicle',
  description: 'Manage fleet trucks: register new vehicle, change status (READY_QUEUE, UNDER_LOADING, DISPATCHED, MAINTENANCE), blacklist/unblacklist, renew membership, or delete.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'Action: register, update_status, blacklist, unblacklist, renew, delete' },
      vehicleNumber: { type: Type.STRING, description: 'Truck registration number, e.g. OD 15 A 1122' },
      status: { type: Type.STRING, description: 'READY_QUEUE, UNDER_LOADING, DISPATCHED, or MAINTENANCE' },
      ownerName: { type: Type.STRING, description: 'Owner full name' },
      ownerMobile: { type: Type.STRING, description: 'Owner mobile number (10 digits)' },
      category: { type: Type.STRING, description: '6_WHEELER, 10_WHEELER, 12_WHEELER, 14_WHEELER, or TRAILER' },
      capacityTon: { type: Type.NUMBER, description: 'Payload capacity in tons' },
      serialNumber: { type: Type.NUMBER, description: 'STOA roster serial number' },
      blacklistReason: { type: Type.STRING, description: 'Reason for blacklisting' },
      renewalMonths: { type: Type.NUMBER, description: 'Months to renew (6, 12, or 24)' },
    },
    required: ['action', 'vehicleNumber'],
  },
};

const manageGatePassDeclaration: FunctionDeclaration = {
  name: 'manage_gate_pass',
  description: 'Manage Gate Passes and Dispatch Slips: issue gate pass for a vehicle, verify loading fee payment, or cancel an issued gate pass.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, description: 'Action: issue, verify_payment, or cancel' },
      vehicleNumber: { type: Type.STRING, description: 'Truck number for issuing or cancelling pass' },
      programId: { type: Type.STRING, description: 'Program ID for issuing pass' },
      passId: { type: Type.STRING, description: 'Gate Pass ID or Token for payment verification or cancellation' },
      driverName: { type: Type.STRING, description: 'Assigned driver name' },
      cancelReason: { type: Type.STRING, description: 'Reason if cancelling pass' },
    },
    required: ['action'],
  },
};

const manageTickerDeclaration: FunctionDeclaration = {
  name: 'manage_ticker',
  description: 'Update live broadcast marquee ticker shown at the top of the app to all truck owners.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING, description: 'Marquee announcement text' },
      speed: { type: Type.STRING, description: 'Marquee speed: slow, normal, fast' },
    },
    required: ['message'],
  },
};

const sendDailyReportEmailDeclaration: FunctionDeclaration = {
  name: 'send_daily_report_email',
  description: 'Send daily loading report PDF and summary email to STOA administrators immediately.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetEmail: { type: Type.STRING, description: 'Optional recipient email' },
      isTest: { type: Type.BOOLEAN, description: 'Whether this is a test email' },
    },
  },
};

const navigateAdminUiDeclaration: FunctionDeclaration = {
  name: 'navigate_admin_ui',
  description: 'Switch the admin dashboard tab or filter the view (e.g. open fleet, loading, pukar, ledger, reports, settings tab).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      tab: {
        type: Type.STRING,
        description: 'Target tab: dashboard, fleet, loading, pukar, membership, ledger, reports, audit, branding, sponsor, election, settings',
      },
      fleetFilter: { type: Type.STRING, description: 'Optional fleet filter: ALL, READY, LOADING, DISPATCHED, BLACKLISTED' },
      searchQuery: { type: Type.STRING, description: 'Optional search text to apply' },
    },
    required: ['tab'],
  },
};

// ----------------- TOOL EXECUTION LOGIC -----------------
export async function executeAdminAgentTool(
  name: string,
  args: any,
  actor: string = 'Admin AI Agent',
  actorRole: UserRole = 'ADMIN',
  broadcastCallback?: (action: string, detail?: any) => void
): Promise<{ success: boolean; message: string; data?: any; navigation?: any }> {
  try {
    switch (name) {
      case 'update_pukar': {
        const pukarUpdates: any = {};
        if (args.isActive !== undefined) {
          pukarUpdates.isActive = Boolean(args.isActive);
          if (pukarUpdates.isActive) {
            const activeCount = store.getPrograms().filter((p) => p.isActive).length;
            if (activeCount === 0) {
              store.addProgram(
                {
                  company: 'Vedanta Limited',
                  companyCustomName: 'वेदांता लिमिटेड (Vedanta Jharsuguda)',
                  destination: 'झारसुगुड़ा / संबलपुर इंडस्ट्रियल लाइन',
                  cargo: 'अल्युमीनियम सिल्लियां (Ingots)',
                  ratePerTon: 1250,
                  totalQuota: 15,
                  dateSection: 'TODAY',
                },
                actor,
                actorRole
              );
            }
          }
        }
        if (args.startSerial !== undefined) pukarUpdates.startSerial = Number(args.startSerial);
        if (args.endSerial !== undefined) pukarUpdates.endSerial = Number(args.endSerial);
        if (args.cycle) pukarUpdates.currentCycle = String(args.cycle);
        if (args.announcementHi) pukarUpdates.announcementHi = String(args.announcementHi);

        const updated = store.updatePukar(pukarUpdates, actor, actorRole);
        if (args.mode && ['ROTATION', 'FIFO', 'PRIORITY'].includes(args.mode.toUpperCase())) {
          store.switchPukarMode(args.mode.toUpperCase() as any, actor, actorRole);
        }

        if (broadcastCallback) {
          broadcastCallback('PUKAR_UPDATED', { actor });
        }

        const statusLabel = updated.isActive
          ? `पुकार सक्रिय (Active) कर दी गई है! रेंज: #${updated.startSerial} से #${updated.endSerial}`
          : 'पुकार बंद (Inactive) कर दी गई है।';

        return {
          success: true,
          message: statusLabel,
          data: updated,
          navigation: { targetTab: 'pukar' },
        };
      }

      case 'post_loading_program': {
        const rate = Number(args.rate) || 1200;
        const requiredTrucks = Number(args.requiredTrucks) || 10;
        const advance = Number(args.advance) || 4000;
        const cargo = args.cargo || 'अल्युमीनियम सिल्लियां (Ingots)';
        const company = args.company || 'वेदांता प्लांट (Vedanta Ltd)';
        const destination = args.destination || 'झाड़सुगुड़ा (Jharsuguda)';
        const shift = args.shift === 'NIGHT' ? 'NIGHT' : 'DAY';
        const programType = args.programType === 'PREFERENCE' ? 'PREFERENCE' : args.programType === 'PENDING' ? 'PENDING' : 'GENERAL';

        const created = store.addProgram(
          {
            company,
            cargo,
            destination,
            ratePerTon: rate,
            totalQuota: requiredTrucks,
            advancePercentage: Math.min(Math.round((advance / (rate * 20)) * 100), 80) || 70,
            programType,
            dateSection: 'TODAY',
          },
          actor,
          actorRole
        );

        if (broadcastCallback) {
          broadcastCallback('PROGRAM_CREATED', { programId: created.id });
        }

        return {
          success: true,
          message: `नया लोडिंग प्रोग्राम सफलतापूर्वक पोस्ट किया गया: ${company} — ${cargo} (${destination}) | दर: ₹${rate}/टन | कुल गाड़ियां: ${requiredTrucks} | प्रोग्राम ID: #${created.id}`,
          data: created,
          navigation: { targetTab: 'loading' },
        };
      }

      case 'manage_loading_programs': {
        const action = args.action;
        if (action === 'delete_completed') {
          const res = store.deleteCompletedPrograms(actor, actorRole);
          if (broadcastCallback) {
            broadcastCallback('COMPLETED_PROGRAMS_DELETED', { deletedCount: res.deletedCount });
          }
          return {
            success: true,
            message: `सभी पूर्ण (Completed) प्रोग्राम हटा दिए गए! हटाए गए: ${res.deletedCount}, शेष: ${res.remainingCount}`,
            data: res,
            navigation: { targetTab: 'loading' },
          };
        } else if (action === 'clear_all') {
          const res = store.clearAllDailyPrograms(actor, actorRole);
          if (broadcastCallback) {
            broadcastCallback('ALL_PROGRAMS_CLEARED', { clearedCount: res.clearedCount });
          }
          return {
            success: true,
            message: `आज के सभी लोडिंग प्रोग्राम क्लियर कर दिए गए! कुल साफ किए गए: ${res.clearedCount}`,
            data: res,
            navigation: { targetTab: 'loading' },
          };
        } else if (action === 'start_next_day') {
          const dateLabel = args.dateLabel || new Date(Date.now() + 86400000).toLocaleDateString('hi-IN');
          const res = store.startNextDayPrograms({ dateLabel }, actor, actorRole);
          if (broadcastCallback) {
            broadcastCallback('NEXT_DAY_PROGRAMS_STARTED', { dateLabel });
          }
          return {
            success: true,
            message: `अगले दिन (${dateLabel}) के लिए लोडिंग प्रोग्राम तैयार कर दिए गए!`,
            data: res,
            navigation: { targetTab: 'loading' },
          };
        } else if (action === 'delete_program' && args.programId) {
          const ok = store.deleteProgram(args.programId, actor, actorRole);
          if (broadcastCallback) {
            broadcastCallback('PROGRAM_DELETED', { programId: args.programId });
          }
          return {
            success: ok,
            message: ok ? `प्रोग्राम #${args.programId} हटा दिया गया` : 'प्रोग्राम नहीं मिला',
            navigation: { targetTab: 'loading' },
          };
        }
        return { success: false, message: 'अमान्य लोडिंग प्रोग्राम कार्रवाई' };
      }

      case 'manage_vehicle': {
        const action = args.action;
        const norm = normalizeVehicleNumber(args.vehicleNumber || '');
        if (!norm) {
          return { success: false, message: 'गाड़ी नंबर प्रदान करना अनिवार्य है' };
        }

        if (action === 'register') {
          const category: VehicleCategory = (args.category as VehicleCategory) || '10-Wheel / 16-18 Ton';
          const capacityTon = Number(args.capacityTon) || 25;
          const ownerName = args.ownerName || 'सम्मानित ट्रक मालिक';
          const ownerMobile = args.ownerMobile || '9437012000';
          const serialNumber = args.serialNumber || (store.getMaxSerial() + 1);

          const newVehicle = store.addVehicle(
            {
              normalizedNumber: norm,
              displayNumber: args.vehicleNumber || norm,
              ownerName,
              ownerMobile,
              category,
              capacityTon,
              serialNumber,
              membershipStatus: 'ACTIVE',
              status: 'IN_QUEUE',
            },
            actor,
            actorRole
          );

          if (broadcastCallback) broadcastCallback('VEHICLE_ADDED', { vehicleNumber: norm });

          return {
            success: true,
            message: `नई गाड़ी ${newVehicle.displayNumber} (#${newVehicle.serialNumber}) सफलतापूर्वक फ्लीट में रजिस्टर्ड की गई!`,
            data: newVehicle,
            navigation: { targetTab: 'fleet', searchQuery: norm },
          };
        }

        const vehicle = store.getVehicleByNumber(norm);
        if (!vehicle && action !== 'register') {
          return { success: false, message: `गाड़ी ${args.vehicleNumber} फ्लीट डेटाबेस में नहीं मिली` };
        }

        if (action === 'update_status' && args.status) {
          const targetStatus = args.status === 'READY_QUEUE' ? 'IN_QUEUE' : args.status === 'DISPATCHED' ? 'LOADED_TODAY' : args.status;
          const updated = store.updateVehicle(norm, { status: targetStatus as any }, actor, actorRole);
          if (broadcastCallback) broadcastCallback('VEHICLE_UPDATED', { vehicleNumber: norm });
          return {
            success: true,
            message: `गाड़ी ${updated.displayNumber} की स्थिति बदलकर '${targetStatus}' कर दी गई है।`,
            data: updated,
            navigation: { targetTab: 'fleet', searchQuery: norm },
          };
        }

        if (action === 'blacklist') {
          const reason = args.blacklistReason || 'प्रशासनिक आदेश द्वारा ब्लैकलिस्ट';
          const updated = store.updateVehicle(norm, { isBlacklisted: true, blacklistReason: reason }, actor, actorRole);
          if (broadcastCallback) broadcastCallback('VEHICLE_UPDATED', { vehicleNumber: norm });
          return {
            success: true,
            message: `गाड़ी ${updated.displayNumber} को ब्लैकलिस्ट किया गया। कारण: ${reason}`,
            data: updated,
            navigation: { targetTab: 'fleet', fleetFilter: 'BLACKLISTED', searchQuery: norm },
          };
        }

        if (action === 'unblacklist') {
          const updated = store.updateVehicle(norm, { isBlacklisted: false, blacklistReason: undefined }, actor, actorRole);
          if (broadcastCallback) broadcastCallback('VEHICLE_UPDATED', { vehicleNumber: norm });
          return {
            success: true,
            message: `गाड़ी ${updated.displayNumber} से ब्लैकलिस्ट प्रतिबंध हटा दिया गया है।`,
            data: updated,
            navigation: { targetTab: 'fleet', searchQuery: norm },
          };
        }

        if (action === 'renew') {
          const months = (Number(args.renewalMonths) === 6 ? 6 : Number(args.renewalMonths) === 24 ? 24 : 12) as 6 | 12 | 24;
          const fee = months === 6 ? 600 : months === 24 ? 2000 : 1200;
          const { vehicle: renewed, receipt } = store.renewMembership(norm, months, fee, actor, actorRole, 'CASH');
          if (broadcastCallback) broadcastCallback('VEHICLE_RENEWED', { vehicleNumber: norm });
          return {
            success: true,
            message: `गाड़ी ${renewed.displayNumber} की सदस्यता ${months} माह के लिए रिन्यू की गई! रसीद संख्या: #${receipt.receiptNumberFormatted} (वैधता: ${renewed.membershipExpiryDate})`,
            data: { vehicle: renewed, receipt },
            navigation: { targetTab: 'membership', searchQuery: norm },
          };
        }

        if (action === 'delete') {
          const ok = store.deleteVehicle(norm, actor, actorRole);
          if (broadcastCallback) broadcastCallback('VEHICLE_DELETED', { vehicleNumber: norm });
          return {
            success: ok,
            message: ok ? `गाड़ी ${norm} फ्लीट से हटा दी गई` : 'गाड़ी नहीं मिली',
            navigation: { targetTab: 'fleet' },
          };
        }

        return { success: false, message: 'अमान्य वाहन कार्रवाई' };
      }

      case 'manage_gate_pass': {
        const action = args.action;
        if (action === 'issue') {
          const norm = normalizeVehicleNumber(args.vehicleNumber || '');
          let programId = args.programId;
          if (!programId) {
            const activeProgs = store.getPrograms().filter((p) => p.isActive !== false);
            if (activeProgs.length > 0) {
              programId = activeProgs[0].id;
            }
          }

          if (!norm || !programId) {
            return { success: false, message: 'गेट पास जारी करने के लिए गाड़ी नंबर और प्रोग्राम का होना आवश्यक है' };
          }

          const res = store.validateAndDispatch(norm, programId, actor, actorRole, args.driverName);
          if (!res.success) {
            return {
              success: false,
              message: `गेट पास जारी नहीं हो सका:\n${(res.errors || []).join('\n')}`,
            };
          }

          if (broadcastCallback) {
            broadcastCallback('DISPATCH_COMPLETED', { vehicleNumber: norm, programId });
          }

          return {
            success: true,
            message: `गाड़ी ${res.gatePass?.vehicleNumber} के लिए गेट पास सफलतापूर्वक जारी किया गया! टोकन: ${res.gatePass?.token}`,
            data: res.gatePass,
            navigation: { targetTab: 'loading' },
          };
        }

        if (action === 'verify_payment') {
          const tokenOrId = args.passId || args.vehicleNumber;
          const passes = store.getGatePasses();
          const targetPass = passes.find((p) => p.id === tokenOrId || p.token === tokenOrId || normalizeVehicleNumber(p.vehicleNumber) === normalizeVehicleNumber(tokenOrId || ''));
          if (!targetPass) {
            return { success: false, message: 'वेरिफिकेशन के लिए गेट पास नहीं मिला' };
          }
          const verified = store.verifyPayment(targetPass.id, `AI-PAY-${Date.now()}`, actor, actorRole);
          if (broadcastCallback) broadcastCallback('PAYMENT_VERIFIED', { passId: verified.id });
          return {
            success: true,
            message: `टोकन ${verified.token} (गाड़ी ${verified.vehicleNumber}) का भुगतान सफलतापूर्वक सत्यापित (VERIFIED) कर दिया गया!`,
            data: verified,
            navigation: { targetTab: 'ledger' },
          };
        }

        if (action === 'cancel') {
          const tokenOrId = args.passId || args.vehicleNumber;
          const passes = store.getGatePasses();
          const targetPass = passes.find((p) => (p.id === tokenOrId || p.token === tokenOrId || normalizeVehicleNumber(p.vehicleNumber) === normalizeVehicleNumber(tokenOrId || '')) && p.status !== 'CANCELLED');
          if (!targetPass) {
            return { success: false, message: 'रद्द करने हेतु सक्रिय गेट पास नहीं मिला' };
          }
          const cancelled = store.cancelGatePass(targetPass.id, args.cancelReason || 'एडमिन एआई द्वारा रद्द', actor, actorRole);
          if (broadcastCallback) broadcastCallback('SLIP_CANCELLED', { passId: cancelled.id });
          return {
            success: true,
            message: `गेट पास टोकन ${cancelled.token} (गाड़ी ${cancelled.vehicleNumber}) रद्द कर दिया गया।`,
            data: cancelled,
            navigation: { targetTab: 'loading' },
          };
        }

        return { success: false, message: 'अमान्य गेट पास कार्रवाई' };
      }

      case 'manage_ticker': {
        const message = args.message;
        if (!message) return { success: false, message: 'संदेश खाली नहीं हो सकता' };
        const updated = store.updateTicker({ text: message, isActive: true }, actor);
        if (broadcastCallback) broadcastCallback('TICKER_UPDATED', { message });
        return {
          success: true,
          message: `लाइव टिकर घोषणा अद्यतन की गई: "${message}"`,
          data: updated,
          navigation: { targetTab: 'dashboard' },
        };
      }

      case 'send_daily_report_email': {
        const res = await reportService.sendDailyReportEmail({
          triggeredBy: args.isTest ? 'TEST_EMAIL' : 'MANUAL_ADMIN',
          targetEmail: args.targetEmail,
        });
        return {
          success: res.success,
          message: res.success
            ? 'दैनिक लोडिंग रिपोर्ट ईमेल सफलतापूर्वक संबंधित प्रशासनिक पतों पर भेज दी गई!'
            : `ईमेल प्रेषण विफल: ${res.message}`,
          data: res,
          navigation: { targetTab: 'reports' },
        };
      }

      case 'navigate_admin_ui': {
        return {
          success: true,
          message: `डैशबोर्ड में '${args.tab}' सेक्शन खोला गया।`,
          navigation: {
            targetTab: args.tab,
            fleetFilter: args.fleetFilter,
            searchQuery: args.searchQuery,
          },
        };
      }

      default:
        return { success: false, message: `अज्ञात टूल: ${name}` };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `त्रुटि: ${err.message || 'कार्रवाई निष्पादित नहीं हो सकी'}`,
    };
  }
}

// ----------------- DETERMINISTIC INTENT FALLBACK ENGINE -----------------
function parseIntentDeterministically(cmd: string): { toolName: string; args: any } | null {
  const text = cmd.toLowerCase().trim();

  // 1. Pukar Activation / Deactivation / Range
  if (
    (text.includes('पुकार') || text.includes('pukar')) &&
    (text.includes('चालू') || text.includes('शुरू') || text.includes('start') || text.includes('activate') || text.includes('on'))
  ) {
    // Extract serial numbers (e.g. 101 से 250, 101 to 200, 150)
    const numbers = text.match(/\d+/g)?.map(Number) || [];
    let startSerial = 101;
    let endSerial = 200;
    if (numbers.length >= 2) {
      startSerial = numbers[0];
      endSerial = numbers[1];
    } else if (numbers.length === 1) {
      startSerial = numbers[0];
      endSerial = numbers[0] + 50;
    }
    return {
      toolName: 'update_pukar',
      args: { isActive: true, startSerial, endSerial, announcementHi: 'दैनिक लोडिंग पुकार चालू है।' },
    };
  }

  if (
    (text.includes('पुकार') || text.includes('pukar')) &&
    (text.includes('बंद') || text.includes('stop') || text.includes('deactivate') || text.includes('off') || text.includes('समाप्त'))
  ) {
    return {
      toolName: 'update_pukar',
      args: { isActive: false },
    };
  }

  if (text.includes('पुकार मोड') || text.includes('pukar mode') || text.includes('रोटेशन') || text.includes('rotation') || text.includes('fifo')) {
    const mode = text.includes('fifo') ? 'FIFO' : text.includes('priority') || text.includes('प्राथमिकता') ? 'PRIORITY' : 'ROTATION';
    return {
      toolName: 'update_pukar',
      args: { isActive: true, mode },
    };
  }

  // 2. Loading Program: Add / Post
  if (
    (text.includes('लोड') || text.includes('लोडिंग') || text.includes('program') || text.includes('गाड़ी चाहिए')) &&
    (text.includes('पोस्ट') || text.includes('डालो') || text.includes('जोड़ो') || text.includes('add') || text.includes('post') || text.includes('create'))
  ) {
    const nums = text.match(/\d+/g)?.map(Number) || [];
    let rate = 1200;
    let requiredTrucks = 10;
    for (const n of nums) {
      if (n >= 500 && n <= 10000) rate = n;
      else if (n >= 1 && n < 500) requiredTrucks = n;
    }

    let company = 'वेदांता प्लांट (Vedanta Ltd)';
    if (text.includes('हिंडाल्को') || text.includes('hindalco')) company = 'हिंडाल्को इंडस्ट्रीज (Hindalco Hirakud)';
    else if (text.includes('भूषण') || text.includes('bhushan')) company = 'भूषण पॉवर एंड स्टील (Bhushan Steel)';
    else if (text.includes('श्याम') || text.includes('shyam')) company = 'श्याम मेटालिक्स (Shyam Metalics)';
    else if (text.includes('सीमेंट') || text.includes('ultratech')) company = 'अल्ट्राटेक सीमेंट (UltraTech Cement)';

    let destination = 'झाड़सुगुड़ा (Jharsuguda)';
    if (text.includes('राउरकेला') || text.includes('rourkela')) destination = 'राउरकेला (Rourkela)';
    else if (text.includes('कोलकाता') || text.includes('kolkata')) destination = 'कोलकाता (Kolkata Port)';
    else if (text.includes('रायपुर') || text.includes('raipur')) destination = 'रायपुर (Raipur)';
    else if (text.includes('हल्दिया') || text.includes('haldia')) destination = 'हल्दिया पोर्ट (Haldia)';
    else if (text.includes('कटक') || text.includes('cuttack')) destination = 'कटक / भुवनेश्वर (Cuttack)';

    let cargo = 'अल्युमीनियम सिल्लियां (Ingots)';
    if (text.includes('कोयला') || text.includes('coal')) cargo = 'कोयला (Industrial Coal)';
    else if (text.includes('फ्लाई ऐश') || text.includes('fly ash') || text.includes('राख')) cargo = 'फ्लाई ऐश (Fly Ash)';
    else if (text.includes('स्टील') || text.includes('steel') || text.includes('कॉइल')) cargo = 'स्टील कॉइल्स (Steel Coils)';
    else if (text.includes('सीमेंट') || text.includes('cement')) cargo = 'सीमेंट बैग्स (Cement Bags)';

    return {
      toolName: 'post_loading_program',
      args: { company, destination, cargo, rate, requiredTrucks, advance: 4000, shift: text.includes('नाइट') ? 'NIGHT' : 'DAY' },
    };
  }

  // 3. Delete Completed Programs / Clear All
  if (text.includes('कम्पलीट') || text.includes('पूर्ण') || text.includes('completed')) {
    if (text.includes('हटाओ') || text.includes('डिलीट') || text.includes('delete') || text.includes('clear')) {
      return { toolName: 'manage_loading_programs', args: { action: 'delete_completed' } };
    }
  }

  if (text.includes('पूरे लोड') || text.includes('सब प्रोग्राम') || text.includes('all program') || text.includes('क्लियर लोड')) {
    if (text.includes('डिलीट') || text.includes('साफ') || text.includes('हटाओ') || text.includes('clear')) {
      return { toolName: 'manage_loading_programs', args: { action: 'clear_all' } };
    }
  }

  if (text.includes('अगले दिन') || text.includes('कल का') || text.includes('next day')) {
    return { toolName: 'manage_loading_programs', args: { action: 'start_next_day' } };
  }

  // 4. Gate Pass: Issue, Verify Payment, Cancel
  if (text.includes('गेट पास') || text.includes('गेटपास') || text.includes('gate pass') || text.includes('पर्ची')) {
    const plateMatch = cmd.match(/[A-Za-z]{2}\s*\d{1,2}\s*[A-Za-z]{0,3}\s*\d{3,4}/);
    const vehicleNumber = plateMatch ? plateMatch[0] : undefined;

    if (text.includes('जारी') || text.includes('काटो') || text.includes('issue') || text.includes('generate')) {
      return { toolName: 'manage_gate_pass', args: { action: 'issue', vehicleNumber } };
    }
    if (text.includes('भुगतान') || text.includes('पेमेंट') || text.includes('verify') || text.includes('paid')) {
      return { toolName: 'manage_gate_pass', args: { action: 'verify_payment', vehicleNumber } };
    }
    if (text.includes('रद्द') || text.includes('cancel')) {
      return { toolName: 'manage_gate_pass', args: { action: 'cancel', vehicleNumber, cancelReason: 'एडमिन आदेश द्वारा रद्द' } };
    }
  }

  // 5. Vehicle: Blacklist / Unblacklist / Renew / Status change
  const vehiclePlateMatch = cmd.match(/[A-Za-z]{2}\s*\d{1,2}\s*[A-Za-z]{0,3}\s*\d{3,4}/);
  if (vehiclePlateMatch) {
    const vNum = vehiclePlateMatch[0];
    if (text.includes('ब्लैकलिस्ट') && (text.includes('हटाओ') || text.includes('unblacklist') || text.includes('खोल'))) {
      return { toolName: 'manage_vehicle', args: { action: 'unblacklist', vehicleNumber: vNum } };
    }
    if (text.includes('ब्लैकलिस्ट') || text.includes('blacklist')) {
      return { toolName: 'manage_vehicle', args: { action: 'blacklist', vehicleNumber: vNum, blacklistReason: 'एसोसिएशन अनुशासनहीनता' } };
    }
    if (text.includes('रिन्यू') || text.includes('renew') || text.includes('सदस्यता')) {
      return { toolName: 'manage_vehicle', args: { action: 'renew', vehicleNumber: vNum, renewalMonths: 12 } };
    }
    if (text.includes('रेडी') || text.includes('ready') || text.includes('कतार')) {
      return { toolName: 'manage_vehicle', args: { action: 'update_status', vehicleNumber: vNum, status: 'READY_QUEUE' } };
    }
    if (text.includes('लोडिंग') || text.includes('loading')) {
      return { toolName: 'manage_vehicle', args: { action: 'update_status', vehicleNumber: vNum, status: 'UNDER_LOADING' } };
    }
    if (text.includes('डिस्पैच') || text.includes('dispatched')) {
      return { toolName: 'manage_vehicle', args: { action: 'update_status', vehicleNumber: vNum, status: 'DISPATCHED' } };
    }
    if (text.includes('हटाओ') || text.includes('डिलीट') || text.includes('delete')) {
      return { toolName: 'manage_vehicle', args: { action: 'delete', vehicleNumber: vNum } };
    }
  }

  // 6. Ticker Broadcast
  if (text.includes('टिकर') || text.includes('ticker') || text.includes('घोषण') || text.includes('marquee')) {
    const cleanMsg = cmd.replace(/.*(मैसेज|संदेश|करो|लिखो|डालो|बदलो|set|update)\s*[:=]?\s*/i, '').trim();
    return {
      toolName: 'manage_ticker',
      args: { message: cleanMsg || 'संबलपुर ट्रक ओनर्स एसोसिएशन: सभी सदस्य नियमों का पालन करें।' },
    };
  }

  // 7. Email Report
  if (text.includes('ईमेल') || text.includes('email') || text.includes('रिपोर्ट भेजो') || text.includes('send report')) {
    const emailMatch = cmd.match(/[\w.-]+@[\w.-]+\.\w+/);
    return {
      toolName: 'send_daily_report_email',
      args: { targetEmail: emailMatch ? emailMatch[0] : undefined },
    };
  }

  // 8. Navigation
  if (text.includes('फ्लीट') || text.includes('गाड़ी') || text.includes('fleet') || text.includes('truck')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'fleet' } };
  }
  if (text.includes('पुकार') || text.includes('pukar')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'pukar' } };
  }
  if (text.includes('लोडिंग') || text.includes('loading') || text.includes('प्रोग्राम')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'loading' } };
  }
  if (text.includes('लेजर') || text.includes('ledger') || text.includes('हिसाब') || text.includes('कलेक्शन')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'ledger' } };
  }
  if (text.includes('सदस्यता') || text.includes('रिन्यूअल') || text.includes('membership')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'membership' } };
  }
  if (text.includes('रिपोर्ट') || text.includes('report')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'reports' } };
  }
  if (text.includes('सेटिंग्स') || text.includes('settings')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'settings' } };
  }
  if (text.includes('ऑडिट') || text.includes('audit')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'audit' } };
  }
  if (text.includes('ब्रांडिंग') || text.includes('लोगो') || text.includes('logo')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'branding' } };
  }
  if (text.includes('चुनाव') || text.includes('election')) {
    return { toolName: 'navigate_admin_ui', args: { tab: 'election' } };
  }

  return null;
}

// ----------------- MAIN ENTRYPOINT -----------------
export async function handleAdminAgentCommand(params: {
  command: string;
  adminName?: string;
  adminRole?: UserRole;
  broadcastCallback?: (action: string, detail?: any) => void;
}): Promise<AdminAgentResult> {
  const { command, adminName = 'Admin', adminRole = 'ADMIN', broadcastCallback } = params;

  // System snapshot for telemetry
  const pukar = store.getPukar();
  const allVehicles = store.getVehicles();
  const stats = store.getStats();
  const programs = store.getPrograms();

  const systemStateSnapshot = {
    pukarActive: pukar.isActive,
    pukarRange: `#${pukar.startSerial} - #${pukar.endSerial}`,
    pukarMode: pukar.mode,
    programsCount: programs.length,
    activeFleetCount: allVehicles.length,
    readyQueueCount: stats.readyQueueCount || 0,
    loadedTodayCount: stats.loadedTodayCount || 0,
  };

  const cleanCmd = (command || '').trim();
  if (!cleanCmd) {
    return {
      reply: 'कृपया कोई प्रशासनिक आदेश दें। जैसे: "पुकार 101 से 250 चालू करो", "वेदांता का 10 ट्रक लोड पोस्ट करो", या "गाड़ी OD 15 A 1122 का गेट पास काटो"।',
      systemStateSnapshot,
      suggestedFollowUps: [
        '⚡ पुकार 101 से 250 चालू करें',
        '📋 वेदांता 10 ट्रक लोड पोस्ट करें',
        '🧹 पूर्ण लोड प्रोग्राम हटाएं',
        '📧 आज की रिपोर्ट ईमेल करें',
      ],
    };
  }

  let executedResult: any = null;
  let toolExecutedName = '';
  let modelReplyText = '';

  // 1. Try Gemini Function Calling with gemini-3.8-flash
  const apiKey = process.env.GEMINI_API_KEY;
  let geminiSuccess = false;

  if (apiKey) {
    try {
      const systemInstruction = `
आप "STOA NEXTGEN" (संबलपुर ट्रक ओनर्स एसोसिएशन - Sambalpur Truck Owners Association) के सर्वोच्च प्रशासनिक 'एआई एडमिन कमांडर एजेंट' (Supreme Autonomous Admin AI Commander) हैं।
आपके पास पूरे एडमिन पैनल और ट्रांसपोर्ट मैनेजमेंट सिस्टम का 100% पूर्ण कार्यकारी अधिकार है।

वर्तमान सिस्टम स्थिति:
- पुकार स्थिति: ${pukar.isActive ? `सक्रिय (रेंज #${pukar.startSerial} से #${pukar.endSerial}, मोड: ${pukar.mode})` : 'बंद'}
- कुल रजिस्टर्ड फ्लीट: ${allVehicles.length} ट्रक
- कतार में तैयार गाड़ियां: ${stats.readyQueueCount || 0}
- आज लोड हुई गाड़ियां: ${stats.loadedTodayCount || 0}
- सक्रिय लोडिंग प्रोग्राम: ${programs.length}

एडमिन जो भी आदेश दे, आपको तुरंत उपयुक्त Tool Call करके उसे कार्यान्वित करना है।
हमेशा पेशेवर, त्वरित और सटीक हिंदी में उत्तर दें जिसमें की गई कार्रवाई का विवरण हो।
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: cleanCmd,
        config: {
          systemInstruction,
          tools: [
            {
              functionDeclarations: [
                updatePukarDeclaration,
                postLoadingProgramDeclaration,
                manageLoadingProgramsDeclaration,
                manageVehicleDeclaration,
                manageGatePassDeclaration,
                manageTickerDeclaration,
                sendDailyReportEmailDeclaration,
                navigateAdminUiDeclaration,
              ],
            },
          ],
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call && call.name) {
          toolExecutedName = call.name;
          console.log('[Admin Agent Tool Call]:', call.name, JSON.stringify(call.args));
          executedResult = await executeAdminAgentTool(
            call.name,
            call.args || {},
            `Admin (${adminName} via AI Agent)`,
            adminRole,
            broadcastCallback
          );
          modelReplyText = response.text || executedResult.message;
          geminiSuccess = true;
        }
      } else if (response.text) {
        modelReplyText = response.text;
      }
    } catch (e: any) {
      console.warn('[Admin Agent] Gemini API attempt fallback:', e.message);
    }
  }

  // 2. If Gemini did not call a tool, use Deterministic Intent Engine for guaranteed instant execution
  if (!executedResult) {
    const parsed = parseIntentDeterministically(cleanCmd);
    if (parsed) {
      toolExecutedName = parsed.toolName;
      executedResult = await executeAdminAgentTool(
        parsed.toolName,
        parsed.args,
        `Admin (${adminName} via AI Agent)`,
        adminRole,
        broadcastCallback
      );
      if (!modelReplyText) {
        modelReplyText = `✅ **आदेश तुरंत निष्पादित किया गया:**\n${executedResult.message}`;
      }
    } else {
      if (!modelReplyText) {
        modelReplyText = `मैं आपके आदेश को समझ रहा हूँ। कृपया विशिष्ट निर्देश दें, जैसे:
• "पुकार चालू करो 101 से 250"
• "वेदांता 10 ट्रक झाड़सुगुड़ा 1250 रेट लोड पोस्ट करो"
• "गाड़ी OD 15 X 7273 ब्लैकलिस्ट करो"
• "दैनिक रिपोर्ट ईमेल भेजो"
• "फ्लीट टैब खोलो"`;
      }
    }
  }

  // Follow-up suggestions based on action
  let suggestedFollowUps = [
    '⚡ पुकार स्थिति चेक करें',
    '📋 नए लोडिंग प्रोग्राम देखें',
    '🚚 फ्लीट कतार देखें',
    '📧 रिपोर्ट ईमेल करें',
  ];

  if (toolExecutedName === 'update_pukar') {
    suggestedFollowUps = [
      '📋 नया लोड पोस्ट करें',
      '🚚 कतार में गाड़ियां चेक करें',
      '🎫 गेट पास जारी करें',
      '⛔ पुकार बंद करें',
    ];
  } else if (toolExecutedName === 'post_loading_program') {
    suggestedFollowUps = [
      '🎫 इस प्रोग्राम का गेट पास काटो',
      '⚡ पुकार रेंज बढ़ाओ',
      '🧹 कम्पलीट प्रोग्राम साफ करो',
      '📋 एक और लोड पोस्ट करो',
    ];
  }

  return {
    reply: modelReplyText || executedResult?.message || 'कार्रवाई पूर्ण की गई।',
    actionExecuted: executedResult
      ? {
          toolName: toolExecutedName,
          description: executedResult.message,
          status: executedResult.success ? 'SUCCESS' : 'ERROR',
          data: executedResult.data,
        }
      : undefined,
    navigation: executedResult?.navigation,
    suggestedFollowUps,
    systemStateSnapshot,
  };
}
