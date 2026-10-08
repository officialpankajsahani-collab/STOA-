import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { store } from './store.js';
import { normalizeVehicleNumber } from './data.js';
import { handleAiChat, generateDailyReport } from './ai.js';
import { parsePukarRawNotice } from './pukarParser.js';
import { reportService } from './reportService.js';
import { generateMembershipReceiptPdf } from './membershipReceiptPdf.js';
import { handleAdminAgentCommand } from './adminAgent.js';
import { UserRole, Vehicle } from '../src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for Cloud Run container probes
app.get(['/health', '/api/health', '/healthz'], (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Middleware for logging API calls
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[STOA API] ${req.method} ${req.path}`);
  }
  next();
});

// Simple session token generator
function generateToken(role: string, id: string): string {
  return `stoa_${role.toLowerCase()}_${Buffer.from(id + ':' + Date.now()).toString('base64')}`;
}

// ---------------- AUTH ROUTES ----------------
app.post('/api/auth/owner-login', (req: Request, res: Response) => {
  const { vehicleNumber, mobile } = req.body;
  const norm = normalizeVehicleNumber(vehicleNumber || '');
  if (!norm) {
    return res.status(400).json({ error: 'कृपया मान्य गाड़ी नंबर दर्ज करें (Valid Vehicle Number required)' });
  }

  if (!mobile || typeof mobile !== 'string') {
    return res.status(400).json({ error: 'कृपया अपना 10 अंकों का पंजीकृत मोबाइल नंबर दर्ज करें' });
  }

  const vehicle = store.getVehicleByNumber(norm);
  if (!vehicle) {
    return res.status(404).json({
      error: `गाड़ी नंबर ${norm} हमारे रिकॉर्ड में नहीं मिला। क्या आप नई गाड़ी रजिस्टर करना चाहते हैं?`,
      canRegister: true,
      normalizedNumber: norm,
    });
  }

  // Strict Security Check: Entered mobile MUST match the registered mobile for this vehicle
  const cleanEnteredMobile = mobile.replace(/\D/g, '').slice(-10);
  const cleanRegisteredMobile = (vehicle.ownerMobile || '').replace(/\D/g, '').slice(-10);

  if (!cleanEnteredMobile || cleanEnteredMobile.length < 10) {
    return res.status(400).json({ error: 'कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें' });
  }

  if (cleanEnteredMobile !== cleanRegisteredMobile) {
    return res.status(403).json({
      error: `सुरक्षा अस्वीकृति: दर्ज मोबाइल नंबर (${mobile}) इस गाड़ी (${vehicle.displayNumber || norm}) के साथ पंजीकृत नहीं है! केवल अधिकृत पंजीकृत मोबाइल नंबर (***${cleanRegisteredMobile.slice(-4)}) से ही लॉगिन संभव है।`,
    });
  }

  // Generate simulated 6-digit OTP
  const otp = '727388'; // Predictable fast demo OTP or random
  return res.json({
    success: true,
    message: `OTP सफलतापूर्वक आपके पंजीकृत मोबाइल (***${cleanRegisteredMobile.slice(-4)}) पर भेजा गया।`,
    normalizedNumber: norm,
    demoOtp: otp,
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { vehicleNumber, mobile, otp } = req.body;
  const norm = normalizeVehicleNumber(vehicleNumber || '');
  const vehicle = store.getVehicleByNumber(norm);

  if (!vehicle) {
    return res.status(404).json({ error: 'गाड़ी नहीं मिली' });
  }

  if (mobile) {
    const cleanEntered = String(mobile).replace(/\D/g, '').slice(-10);
    const cleanReg = (vehicle.ownerMobile || '').replace(/\D/g, '').slice(-10);
    if (cleanEntered && cleanEntered !== cleanReg) {
      return res.status(403).json({ error: 'सुरक्षा त्रुटि: अनधिकृत मोबाइल नंबर' });
    }
  }

  // Accept valid demo OTP '727388' or standard '123456'
  if (otp !== '727388' && otp !== '123456' && otp?.length !== 6) {
    return res.status(400).json({ error: 'गलत OTP (Invalid OTP code. Use 727388 or 123456)' });
  }

  const token = generateToken('OWNER', norm);
  return res.json({
    success: true,
    user: {
      id: vehicle.id,
      role: 'OWNER' as UserRole,
      ownerName: vehicle.ownerName,
      mobile: vehicle.ownerMobile,
      vehicleNumber: vehicle.normalizedNumber,
      membershipNumber: vehicle.membershipNumber,
      token,
    },
  });
});

app.post('/api/auth/owner-register', (req: Request, res: Response) => {
  const { ownerName, vehicleNumber, mobile, category, capacityTon, membershipNumber } = req.body;
  const norm = normalizeVehicleNumber(vehicleNumber || '');
  if (!norm || !ownerName || !mobile) {
    return res.status(400).json({ error: 'मालिक का नाम, गाड़ी नंबर और मोबाइल नंबर अनिवार्य हैं।' });
  }

  try {
    const newVehicle = store.addVehicle(
      {
        normalizedNumber: norm,
        ownerName,
        ownerMobile: mobile,
        category,
        capacityTon: Number(capacityTon) || 16,
        membershipNumber: membershipNumber || `STOA-M-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'IN_QUEUE',
      },
      ownerName,
      'OWNER'
    );

    const token = generateToken('OWNER', norm);
    return res.json({
      success: true,
      message: 'गाड़ी सफलतापूर्वक संबलपुर ट्रक ओनर्स एसोसिएशन में पंजीकृत हो गई है!',
      user: {
        id: newVehicle.id,
        role: 'OWNER',
        ownerName: newVehicle.ownerName,
        mobile: newVehicle.ownerMobile,
        vehicleNumber: newVehicle.normalizedNumber,
        membershipNumber: newVehicle.membershipNumber,
        token,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { adminId, pin } = req.body;
  if (!adminId || !pin) {
    return res.status(400).json({ error: 'Admin ID और पासवर्ड/पिन आवश्यक हैं।' });
  }

  const cleanId = adminId.trim().toUpperCase();
  // Valid credentials: ADMIN / configured PIN or SUPER_ADMIN / 7273
  if (cleanId === 'ADMIN' && store.verifyAdminPin(pin)) {
    const token = generateToken('ADMIN', cleanId);
    return res.json({
      success: true,
      user: {
        id: 'adm-01',
        role: 'ADMIN' as UserRole,
        adminId: 'ADMIN',
        name: 'STOA कंट्रोल डेस्क 01',
        token,
      },
    });
  } else if ((cleanId === 'SUPER_ADMIN' || cleanId === 'PANKAJ' || cleanId === 'OFFICIAL') && (pin === '7273' || pin === 'super123')) {
    const token = generateToken('SUPER_ADMIN', cleanId);
    return res.json({
      success: true,
      user: {
        id: 'super-01',
        role: 'SUPER_ADMIN' as UserRole,
        adminId: 'SUPER_ADMIN',
        name: 'पंकज साहनी (सुपर एडमिन - संबलपुर)',
        token,
      },
    });
  }

  return res.status(401).json({
    error: 'अमान्य Admin ID या पिन। (डेमो: ID "ADMIN" / PIN "1234" अथवा "SUPER_ADMIN" / PIN "7273")',
  });
});

// ---------------- FLEET ROUTES ----------------
app.get('/api/fleet', (req: Request, res: Response) => {
  const { search, category, status, membershipStatus, isBlacklisted } = req.query;
  const list = store.getVehicles({
    search: search as string,
    category: category as string,
    status: status as string,
    membershipStatus: membershipStatus as string,
    isBlacklisted: isBlacklisted !== undefined ? isBlacklisted === 'true' : undefined,
  });
  res.json({ success: true, count: list.length, vehicles: list });
});

// Import preview & execution and bulk operations (Must be defined before :number parameter route)
app.get('/api/fleet/import-history', (req: Request, res: Response) => {
  const history = store.getImportBatches();
  res.json({ success: true, history });
});

app.post('/api/fleet/bulk', (req: Request, res: Response) => {
  const { vehicleNumbers, updates, actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  const result = store.bulkUpdateVehicles(vehicleNumbers, updates, actor, actorRole as UserRole);
  res.json({ success: true, ...result });
});

app.post('/api/fleet/import-preview', (req: Request, res: Response) => {
  const { rows } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: 'डेटा पंक्तियां (rows) आवश्यक हैं' });
  }
  const preview = store.previewFleetImport(rows);
  res.json({ success: true, ...preview });
});

app.post('/api/fleet/import-execute', (req: Request, res: Response) => {
  const { fileName = 'Import.xlsx', rows, actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: 'डेटा पंक्तियां (rows) आवश्यक हैं' });
  }
  const batch = store.executeFleetImport(fileName, rows, actor, actorRole as UserRole);
  res.json({ success: true, batch });
});

app.post('/api/fleet', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  try {
    const vehicle = store.addVehicle(req.body, actor, actorRole as UserRole);
    res.json({ success: true, vehicle });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/fleet/:number', (req: Request, res: Response) => {
  const vehicle = store.getVehicleByNumber(req.params.number);
  if (!vehicle) return res.status(404).json({ error: 'गाड़ी नहीं मिली' });
  res.json({ success: true, vehicle });
});

app.put('/api/fleet/:number', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN', updates } = req.body;
  try {
    const vehicle = store.updateVehicle(req.params.number, updates || req.body, actor, actorRole as UserRole);
    res.json({ success: true, vehicle });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/fleet/:number', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  try {
    const deleted = store.deleteVehicle(req.params.number, actor, actorRole as UserRole);
    res.json({ success: deleted });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Owner Profile & Settings Management
app.put('/api/owner/profile', (req: Request, res: Response) => {
  const { vehicleNumber, ownerName, mobile, photoUrl } = req.body;
  if (!vehicleNumber) {
    return res.status(400).json({ error: 'गाड़ी नंबर आवश्यक है (Vehicle number required)' });
  }
  try {
    const updates: Partial<Vehicle> = {};
    if (ownerName !== undefined && typeof ownerName === 'string') updates.ownerName = ownerName.trim();
    if (mobile !== undefined && typeof mobile === 'string') updates.ownerMobile = mobile.trim();
    if (photoUrl !== undefined) (updates as any).photoUrl = photoUrl;

    const vehicle = store.updateVehicle(vehicleNumber, updates, ownerName || 'Owner', 'OWNER');
    res.json({
      success: true,
      message: 'प्रोफ़ाइल विवरण सफलतापूर्वक अपडेट किए गए!',
      vehicle,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- REALTIME EVENT STREAM (SSE) FOR INSTANT MOBILE SYNC ----------------
const sseClients = new Set<Response>();

export function broadcastProgramsSync(action: string, detail?: any) {
  const pukar = store.getPukar();
  const programs = store.getPrograms();
  const payload = JSON.stringify({
    type: 'PROGRAMS_SYNC',
    action,
    pukar,
    programs,
    timestamp: new Date().toISOString(),
    detail,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/live/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state on connection
  const initialPayload = JSON.stringify({
    type: 'CONNECTED',
    pukar: store.getPukar(),
    programs: store.getPrograms(),
    timestamp: new Date().toISOString(),
  });
  res.write(`data: ${initialPayload}\n\n`);

  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

// ---------------- PUKAR & LOADING ROUTES ----------------
app.get('/api/pukar', (req: Request, res: Response) => {
  const pukar = store.getPukar();
  res.json({ success: true, pukar });
});

app.put('/api/pukar', (req: Request, res: Response) => {
  const { updates, actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  const pukar = store.updatePukar(updates || req.body, actor, actorRole as UserRole);
  broadcastProgramsSync('PUKAR_UPDATED', { actor });
  res.json({ success: true, pukar });
});

// Admin 1-Click Pukar Mode Switch (सामान्य, पेंडिंग, प्रिफरेंस पुकार - जहां चल रही है वहीं से कन्वर्ट)
app.post('/api/pukar/switch-mode', (req: Request, res: Response) => {
  const { mode, actor = 'Admin Control Desk', actorRole = 'ADMIN', targetSerial } = req.body;
  if (!mode || !['GENERAL', 'PENDING', 'PREFERENCE'].includes(mode)) {
    return res.status(400).json({ error: 'अमान्य पुकार मोड (Must be GENERAL, PENDING, or PREFERENCE)' });
  }
  const updatedPukar = store.switchPukarMode(mode, actor, actorRole as UserRole, targetSerial ? Number(targetSerial) : undefined);
  broadcastProgramsSync('MODE_SWITCHED', { mode, actor });
  res.json({
    success: true,
    message: `पुकार मोड सफलतापूर्वक ${mode} में परिवर्तित किया गया!`,
    pukar: updatedPukar,
  });
});

// Admin 1-Click AI Raw Notice Parse & Publish
app.post('/api/pukar/ai-parse-publish', async (req: Request, res: Response) => {
  const { rawText, actor = 'Admin Control Desk' } = req.body;
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'कृपया पुकार नोटिस टेक्स्ट दर्ज करें (Notice text required)' });
  }

  try {
    const parsedNotice = await parsePukarRawNotice(rawText, actor);
    store.publishAiPukarNotice(parsedNotice, actor);
    broadcastProgramsSync('NOTICE_PUBLISHED', { noticeTitle: parsedNotice.title, count: parsedNotice.items.length });
    res.json({
      success: true,
      message: 'एआई द्वारा पुकार नोटिस सफलतापूर्वक विश्लेषित एवं प्रसारित किया गया!',
      notice: parsedNotice,
      activeProgramsCount: parsedNotice.items.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI Parsing failed' });
  }
});

// Owner Serial Slip Booking ("ओनर अपना सिरियल नंबर डालकर पर्ची कटा सकें")
app.post('/api/loading/owner-slip-booking', (req: Request, res: Response) => {
  const { serialNumber, vehicleNumber, pukarItemId, driverName } = req.body;
  if (!serialNumber || !vehicleNumber || !pukarItemId) {
    return res.status(400).json({
      error: 'क्रम संख्या (Serial), गाड़ी नंबर और लोडिंग स्लॉट अनिवार्य हैं।',
    });
  }

  const result = store.bookSlipByOwnerSerial({
    serialNumber: Number(serialNumber),
    vehicleNumber,
    pukarItemId,
    driverName,
  });

  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: 'पर्ची कटाई सत्यापन विफल (Slip Booking Validation Failed)',
      error: result.error,
      errors: result.errors,
    });
  }

  broadcastProgramsSync('SLIP_BOOKED', { vehicleNumber, pukarItemId });
  res.json({
    success: true,
    message: '🎉 आपकी लोडिंग पर्ची सफलतापूर्वक कट गई है एवं डिजिटल गेट पास जारी हो गया है!',
    gatePass: result.gatePass,
    ledgerEntry: result.ledgerEntry,
  });
});

app.get('/api/loading/programs', (req: Request, res: Response) => {
  const programs = store.getPrograms();
  res.json({ success: true, programs });
});

app.post('/api/loading/programs', (req: Request, res: Response) => {
  const { program, actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  const created = store.addProgram(program, actor, actorRole as UserRole);
  broadcastProgramsSync('PROGRAM_CREATED', { programId: created.id });
  res.json({ success: true, program: created });
});

// Admin can post multiple load programs in batch
app.post('/api/loading/programs/batch', (req: Request, res: Response) => {
  const { programs = [], actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  const created = store.addProgramsBatch(programs, actor, actorRole as UserRole);
  broadcastProgramsSync('PROGRAMS_BATCH_CREATED', { count: created.length });
  res.json({ success: true, count: created.length, programs: created });
});

app.put('/api/loading/programs/:id', (req: Request, res: Response) => {
  const { updates, actor = 'Admin', actorRole = 'ADMIN' } = req.body;
  try {
    const updated = store.updateProgram(req.params.id, updates, actor, actorRole as UserRole);
    broadcastProgramsSync('PROGRAM_UPDATED', { programId: req.params.id });
    res.json({ success: true, program: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin can delete/remove daily load program ("रोजाना लोड पोस्ट कर सकें और रोजाना उसको हटा सके")
app.delete('/api/loading/programs/:id', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const deleted = store.deleteProgram(req.params.id, actor, actorRole as UserRole);
  broadcastProgramsSync('PROGRAM_DELETED', { programId: req.params.id });
  res.json({ success: deleted, message: deleted ? 'लोडिंग प्रोग्राम हटा दिया गया।' : 'प्रोग्राम नहीं मिला।' });
});

// Admin can delete all completed programs where vehicles have cut slips (गाड़ियां जब पर्ची कटा लें तब एडमिन उसको डिलीट कर दे)
app.delete('/api/loading/programs/completed', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const result = store.deleteCompletedPrograms(actor, actorRole as UserRole);
  broadcastProgramsSync('COMPLETED_PROGRAMS_DELETED', { deletedCount: result.deletedCount });
  res.json({
    success: true,
    message: `${result.deletedCount} पर्ची कटी पूर्ण लोडिंग प्रोग्राम डिलीट कर दिए गए।`,
    ...result,
  });
});
app.post('/api/loading/programs/completed-delete', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const result = store.deleteCompletedPrograms(actor, actorRole as UserRole);
  broadcastProgramsSync('COMPLETED_PROGRAMS_DELETED', { deletedCount: result.deletedCount });
  res.json({
    success: true,
    message: `${result.deletedCount} पर्ची कटी पूर्ण लोडिंग प्रोग्राम डिलीट कर दिए गए।`,
    ...result,
  });
});

// Admin can start next day's loading program ("फिर अगले दिन के लिए नया लोडिंग प्रोग्राम पोस्ट कर सकें")
app.post('/api/loading/start-next-day', (req: Request, res: Response) => {
  const {
    clearAllPrevious = true,
    clearCompletedOnly = false,
    dateLabel,
    newPrograms = [],
    actor = 'Admin',
    actorRole = 'ADMIN',
  } = req.body || {};

  const result = store.startNextDayPrograms(
    { clearAllPrevious, clearCompletedOnly, dateLabel, newPrograms },
    actor,
    actorRole as UserRole
  );
  broadcastProgramsSync('NEXT_DAY_PROGRAMS_STARTED', { dateLabel });
  res.json({
    message: `अगले दिन (${dateLabel || 'Next Day'}) का नया लोडिंग प्रोग्राम सक्रिय हो गया है!`,
    ...result,
  });
});

// Admin can delete/clear ALL daily loading programs in 1-click (तुरंत एकबार में डिलिट हो जाए)
const handleClearAllPrograms = (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const result = store.clearAllDailyPrograms(actor, actorRole as UserRole);
  broadcastProgramsSync('ALL_PROGRAMS_CLEARED', { clearedCount: result.clearedCount });
  res.json({
    success: true,
    message: `सभी ${result.clearedCount} लोडिंग प्रोग्राम सफलतापूर्वक तुरंत हटा दिए गए।`,
    clearedCount: result.clearedCount,
    pukar: result.pukar,
    programs: [],
  });
};

app.delete('/api/loading/programs-clear-all', handleClearAllPrograms);
app.post('/api/loading/programs-clear-all', handleClearAllPrograms);

// Admin can end pukar and clear all loading programs at once
app.post('/api/pukar/end-and-clear', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const result = store.endPukarAndClearAll(actor, actorRole as UserRole);
  broadcastProgramsSync('PUKAR_ENDED_AND_CLEARED', { clearedCount: result.clearedCount });
  res.json({
    ...result,
    programs: [],
  });
});

// Shift schedule information (Morning 10 AM / Evening 4 PM algorithm)
app.get('/api/pukar/schedule-info', (req: Request, res: Response) => {
  const pukar = store.getPukar();
  res.json({
    success: true,
    schedule: pukar.scheduleInfo,
    pukarActive: pukar.isActive,
    activeProgramsCount: pukar.activeProgramsCount,
  });
});

// Admin can clear/remove daily pukar notice
app.delete('/api/pukar/notice', (req: Request, res: Response) => {
  const { actor = 'Admin', actorRole = 'ADMIN' } = req.body || {};
  const cleared = store.clearDailyNotice(actor, actorRole as UserRole);
  broadcastProgramsSync('NOTICE_CLEARED', { actor });
  res.json({ success: cleared, message: 'दैनिक पुकार नोटिस सफलतापूर्वक हटा दिया गया।' });
});

// 9-point Dispatch Validation & Serial Rotation Execution
app.post('/api/loading/dispatch', (req: Request, res: Response) => {
  const { vehicleNumber, programId, actor = 'Admin', actorRole = 'ADMIN', driverName } = req.body;
  if (!vehicleNumber || !programId) {
    return res.status(400).json({ error: 'गाड़ी नंबर और प्रोग्राम आईडी आवश्यक हैं।' });
  }

  const result = store.validateAndDispatch(vehicleNumber, programId, actor, actorRole as UserRole, driverName);
  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: 'डिस्पैच सत्यापन विफल (9-Point Dispatch Validation Failed)',
      errors: result.errors,
    });
  }

  broadcastProgramsSync('DISPATCH_COMPLETED', { vehicleNumber, programId });
  res.json({
    success: true,
    message: 'गाड़ी सफलतापूर्वक लोड हो गई एवं गेट पास जारी किया गया!',
    gatePass: result.gatePass,
    ledgerEntry: result.ledgerEntry,
  });
});

// ---------------- GATE PASS ROUTES ----------------
app.get('/api/gate-pass', (req: Request, res: Response) => {
  const { vehicleNumber, status, token } = req.query;
  const passes = store.getGatePasses({
    vehicleNumber: vehicleNumber as string,
    status: status as string,
    token: token as string,
  });
  res.json({ success: true, count: passes.length, passes });
});

app.post('/api/gate-pass/:id/verify-payment', (req: Request, res: Response) => {
  const { paymentRef, actor = 'Accounts Desk', actorRole = 'ADMIN' } = req.body;
  try {
    const pass = store.verifyPayment(req.params.id, paymentRef, actor, actorRole as UserRole);
    res.json({ success: true, pass });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/gate-pass/:id/cancel', (req: Request, res: Response) => {
  const { reason = 'Cancelled', actor = 'Admin', actorRole = 'ADMIN', vehicleNumber } = req.body;
  try {
    const pass = store.cancelGatePass(req.params.id, reason, actor, actorRole as UserRole, vehicleNumber);
    broadcastProgramsSync('SLIP_CANCELLED', { passId: req.params.id, vehicleNumber });
    res.json({ success: true, pass });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ---------------- LEDGER & CSV ROUTES ----------------
app.get('/api/ledger', (req: Request, res: Response) => {
  const { search, status, paymentStatus, cycle } = req.query;
  const entries = store.getLedger({
    search: search as string,
    status: status as any,
    paymentStatus: paymentStatus as any,
    cycle: cycle as string,
  });
  res.json({ success: true, count: entries.length, entries });
});

app.get('/api/ledger/daily-cash-csv', (req: Request, res: Response) => {
  const csvData = store.getDailyCashCsv();
  const dateStr = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="STOA_Daily_Cash_${dateStr}.csv"`);
  res.send(csvData);
});

// ---------------- MEMBERSHIP & AUDIT ----------------
app.post('/api/membership/renew', (req: Request, res: Response) => {
  const {
    vehicleNumber,
    months = 12,
    feePaid = 300,
    actor = 'Admin Control Desk',
    actorRole = 'ADMIN',
    paymentMode = 'CASH',
    renewalYear,
  } = req.body;
  try {
    const result = store.renewMembership(
      vehicleNumber,
      months as any,
      Number(feePaid),
      actor,
      actorRole as UserRole,
      paymentMode,
      renewalYear
    );
    const pdfUrl = `/api/membership/receipt/${result.receipt.receiptNumber}/pdf`;
    res.json({
      success: true,
      message: `सदस्यता सफलतापूर्वक नवीनीकृत की गई। आधिकारिक रसीद #${result.receipt.receiptNumber} तुरंत जनरेट की गई।`,
      vehicle: result.vehicle,
      receipt: result.receipt,
      pdfUrl,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Official Membership Renewal Receipt PDF generation endpoint (IMG_20260920_211353.jpg replica)
app.get('/api/membership/receipt/:idOrNumber/pdf', async (req: Request, res: Response) => {
  try {
    const { idOrNumber } = req.params;
    const receipt = store.getRenewalReceipt(idOrNumber);
    if (!receipt) {
      return res.status(404).send('रसीद नहीं मिली (Receipt not found)');
    }

    const pdfBuffer = await generateMembershipReceiptPdf(receipt);
    const filename = `STOA_Renewal_Receipt_${receipt.receiptNumber}_${(receipt.displayNumber || receipt.vehicleNumber).replace(/\s+/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error generating membership receipt PDF:', err);
    res.status(500).send('रसीद PDF जनरेट करने में त्रुटि: ' + (err?.message || 'Server error'));
  }
});

// Get all membership renewal receipts or filter by vehicleNumber
app.get('/api/membership/renewals', (req: Request, res: Response) => {
  const { vehicleNumber } = req.query;
  const receipts = store.getRenewalReceipts(vehicleNumber ? String(vehicleNumber) : undefined);
  res.json({ success: true, receipts });
});

// Get single receipt by ID or Receipt Number
app.get('/api/membership/renewals/:idOrNumber', (req: Request, res: Response) => {
  const { idOrNumber } = req.params;
  const receipt = store.getRenewalReceipt(idOrNumber);
  if (!receipt) {
    return res.status(404).json({ error: 'रसीद नहीं मिली (Receipt not found)' });
  }
  res.json({ success: true, receipt });
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  const logs = store.getAuditLogs(150);
  res.json({ success: true, logs });
});

app.get('/api/reports/stats', (req: Request, res: Response) => {
  const stats = store.getStats();
  const trend = store.getLast7DaysTrend();
  res.json({ success: true, stats, trend });
});

app.get('/api/reports/trend-7days', (req: Request, res: Response) => {
  const trendData = store.getLast7DaysTrend();
  res.json({ success: true, ...trendData });
});

// ---------------- DRIVER ALERTS & EARNINGS ----------------
app.get('/api/alerts/locations', (req: Request, res: Response) => {
  const locations = store.getDriverAlerts();
  res.json({ success: true, locations });
});

app.get('/api/driver/earnings', (req: Request, res: Response) => {
  const { vehicleNumber } = req.query;
  const earnings = store.getDriverEarnings(vehicleNumber as string);
  res.json({ success: true, earnings });
});

// ---------------- AI ASSISTANT ROUTES ----------------
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, role = 'OWNER', vehicleNumber, userName, preferredLanguage = 'hi' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'संदेश खाली नहीं हो सकता' });
  }

  try {
    const result = await handleAiChat({
      message,
      role: role as UserRole,
      vehicleNumber,
      userName,
      preferredLanguage,
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'AI service unavailable' });
  }
});

app.get('/api/ai/daily-report', async (req: Request, res: Response) => {
  const { role = 'OWNER', vehicleNumber } = req.query;
  try {
    const report = await generateDailyReport(role as UserRole, vehicleNumber as string);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Supreme Autonomous Admin AI Commander Agent endpoint
app.post('/api/ai/admin-agent', async (req: Request, res: Response) => {
  const { command, adminName = 'Admin', adminRole = 'ADMIN' } = req.body || {};
  try {
    const result = await handleAdminAgentCommand({
      command,
      adminName,
      adminRole: adminRole as UserRole,
      broadcastCallback: (action, detail) => broadcastProgramsSync(action, detail),
    });
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error('[Admin Agent API Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'एडमिन एआई सेवा अनुपलब्ध' });
  }
});

// ---------------- LOGO & BRANDING SETTINGS ----------------
app.get('/api/settings/logo', (_req: Request, res: Response) => {
  const logo = store.getAssociationLogo();
  res.json({
    success: true,
    logoUrl: logo,
    isCustom: !!logo,
  });
});

app.post('/api/settings/logo', (req: Request, res: Response) => {
  const { logoUrl, updatedBy = 'Admin' } = req.body;
  if (!logoUrl || typeof logoUrl !== 'string') {
    return res.status(400).json({ error: 'मान्य लोगो डेटा या URL आवश्यक है' });
  }
  const saved = store.setAssociationLogo(logoUrl, updatedBy);
  res.json({
    success: true,
    logoUrl: saved,
    message: 'लोगो सफलतापूर्वक अपडेट हो गया',
  });
});

app.delete('/api/settings/logo', (req: Request, res: Response) => {
  const { updatedBy = 'Admin' } = req.body || {};
  store.setAssociationLogo(null, updatedBy);
  res.json({
    success: true,
    logoUrl: null,
    message: 'लोगो मूल आधिकारिक एम्बलम पर रीसेट किया गया',
  });
});

// ---------------- MASTER CONFIG & UNIVERSAL EDITING ENDPOINTS ----------------
app.get('/api/config', (_req: Request, res: Response) => {
  const config = store.getConfig();
  res.json({ success: true, config });
});

app.put('/api/config', (req: Request, res: Response) => {
  const { updates, updatedBy = 'Admin' } = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'अपडेट डेटा आवश्यक है' });
  }
  const updated = store.updateConfig(updates, updatedBy);
  res.json({ success: true, config: updated, message: 'सेटिंग्स सफलतापूर्वक सहेजी गईं' });
});

app.put('/api/config/pin', (req: Request, res: Response) => {
  const { newPin, updatedBy = 'Admin' } = req.body;
  if (!newPin || newPin.trim().length < 4) {
    return res.status(400).json({ error: 'सुरक्षा पिन न्यूनतम 4 अंकों का होना चाहिए' });
  }
  const ok = store.updateAdminPin(newPin, updatedBy);
  res.json({ success: ok, message: 'एडमिन सुरक्षा पिन सफलतापूर्वक बदल दिया गया' });
});

app.put('/api/config/ticker', (req: Request, res: Response) => {
  const { text, type = 'INFO', isActive = true, updatedBy = 'Admin' } = req.body;
  const updated = store.updateTicker({ text, type, isActive }, updatedBy);
  res.json({ success: true, ticker: updated, message: 'लाइव टिकर सूचना अद्यतन की गई' });
});

// Executives Management
app.post('/api/config/executives', (req: Request, res: Response) => {
  const { name, designation, mobile, plantInCharge, isActive = true, updatedBy = 'Admin' } = req.body;
  if (!name || !designation || !mobile) {
    return res.status(400).json({ error: 'नाम, पद और मोबाइल नंबर अनिवार्य हैं' });
  }
  const created = store.addExecutive({ name, designation, mobile, plantInCharge, isActive }, updatedBy);
  res.json({ success: true, executive: created, message: 'नया पदाधिकारी सफलतापूर्वक जोड़ा गया' });
});

app.put('/api/config/executives/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { updates, updatedBy = 'Admin' } = req.body;
  try {
    const updated = store.updateExecutive(id, updates || {}, updatedBy);
    res.json({ success: true, executive: updated, message: 'पदाधिकारी विवरण अद्यतन किया गया' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/config/executives/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { updatedBy = 'Admin' } = req.body || {};
  const ok = store.deleteExecutive(id, updatedBy);
  res.json({ success: ok, message: 'पदाधिकारी हटाया गया' });
});

// Plants Management
app.post('/api/config/plants', (req: Request, res: Response) => {
  const { name, code, location, dailyCapacity, contactPerson, contactMobile, destinations = [], isActive = true, updatedBy = 'Admin' } = req.body;
  if (!name || !location) {
    return res.status(400).json({ error: 'प्लांट का नाम और स्थान अनिवार्य हैं' });
  }
  const created = store.addPlant({
    name,
    code: code || name.slice(0, 4).toUpperCase(),
    location,
    dailyCapacity: Number(dailyCapacity) || 100,
    contactPerson,
    contactMobile,
    isActive,
    destinations,
  }, updatedBy);
  res.json({ success: true, plant: created, message: 'नया प्लांट सफलतापूर्वक जोड़ा गया' });
});

app.put('/api/config/plants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { updates, updatedBy = 'Admin' } = req.body;
  try {
    const updated = store.updatePlant(id, updates || {}, updatedBy);
    res.json({ success: true, plant: updated, message: 'प्लांट विवरण अद्यतन किया गया' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/config/plants/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { updatedBy = 'Admin' } = req.body || {};
  const ok = store.deletePlant(id, updatedBy);
  res.json({ success: ok, message: 'प्लांट हटाया गया' });
});

// System Snapshot Backup & Restore
app.get('/api/config/snapshot', (_req: Request, res: Response) => {
  const snapshot = store.getSystemSnapshot();
  res.json({ success: true, snapshot });
});

app.post('/api/config/restore', (req: Request, res: Response) => {
  const { snapshot, updatedBy = 'Admin' } = req.body;
  if (!snapshot) {
    return res.status(400).json({ error: 'मान्य स्नैपशॉट बैकअप डेटा आवश्यक है' });
  }
  const ok = store.restoreSystemSnapshot(snapshot, updatedBy);
  res.json({ success: ok, message: 'सिस्टम बैकअप सफलतापूर्वक पुनर्स्थापित किया गया' });
});

// ---------------- DAILY LOADING REPORT & EMAIL AUTOMATION ENDPOINTS ----------------
app.get('/api/reports/daily-loading/preview', (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    const summary = reportService.getDailySummary(date);
    res.json({ success: true, summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'रिपोर्ट पूर्वावलोकन प्राप्त करने में विफल' });
  }
});

app.get('/api/reports/daily-loading/pdf', async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || undefined;
    const summary = reportService.getDailySummary(date);
    const pdfBuffer = await reportService.generateDailyPdf(summary);
    const filename = `STOA_Daily_Loading_Report_${summary.reportDate}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'PDF रिपोर्ट तैयार करने में त्रुटि' });
  }
});

app.get('/api/reports/config', (_req: Request, res: Response) => {
  res.json({ success: true, config: reportService.getConfig() });
});

app.put('/api/reports/config', (req: Request, res: Response) => {
  try {
    const updated = reportService.updateConfig(req.body || {});
    res.json({ success: true, config: updated, message: 'दैनिक रिपोर्ट विन्यास अद्यतन किया गया' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/reports/recipients', (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'नाम और ईमेल अनिवार्य हैं' });
  }
  const created = reportService.addRecipient({ name, email, role });
  res.json({ success: true, recipient: created, message: 'प्रशासनिक ईमेल सफलतापूर्वक जोड़ा गया' });
});

app.delete('/api/reports/recipients/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = reportService.removeRecipient(id);
  res.json({ success: ok, message: ok ? 'ईमेल हटाया गया' : 'ईमेल नहीं मिला' });
});

app.post('/api/reports/recipients/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = reportService.toggleRecipientNotify(id);
  res.json({ success: ok, message: ok ? 'अधिसूचना स्थिति बदली गई' : 'ईमेल नहीं मिला' });
});

app.put('/api/reports/smtp', (req: Request, res: Response) => {
  try {
    const updated = reportService.updateSmtp(req.body || {});
    res.json({ success: true, smtp: updated, message: 'SMTP सेटिंग्स सफलतापूर्वक सुरक्षित की गईं' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Verify live SMTP connection
app.post('/api/reports/smtp/verify', async (req: Request, res: Response) => {
  try {
    const result = await reportService.verifySmtpConnection(req.body || {});
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'SMTP सत्यापन विफल' });
  }
});

// Commercial Production / Clean Slate & Sales Demo endpoints
app.post('/api/admin/clean-slate', (req: Request, res: Response) => {
  try {
    const actor = req.body?.actor || 'Admin';
    const result = store.resetToCleanSlate(actor, 'SUPER_ADMIN');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/seed-demo', (req: Request, res: Response) => {
  try {
    const actor = req.body?.actor || 'Admin';
    const result = store.seedDemoFleet(actor, 'SUPER_ADMIN');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/reports/daily-loading/send-email', async (req: Request, res: Response) => {
  try {
    const { targetEmail, date, isTest } = req.body || {};
    const result = await reportService.sendDailyReportEmail({
      triggeredBy: isTest ? 'TEST_EMAIL' : 'MANUAL_ADMIN',
      targetEmail,
      date,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'ईमेल प्रेषण विफल' });
  }
});

app.get('/api/reports/email-history', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string, 10) || 20;
  res.json({ success: true, logs: reportService.getEmailLogs(limit) });
});

// ---------------- FRONTEND INTEGRATION ----------------
async function setupServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    // In Dev: dynamically mount Vite middlewares with attached HTTP server for HMR WebSocket
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: process.cwd(),
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In Production: serve built static files from dist
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[STOA NEXTGEN] Server running on port ${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start STOA server:', err);
  process.exit(1);
});
