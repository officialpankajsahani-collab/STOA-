import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  X,
  FileUp,
  RefreshCw,
  ArrowRight,
  Layers,
  Database,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { ImportBatch } from '../../types/index.js';
import { useLanguageTheme } from '../../context/LanguageThemeContext.js';
import { VehiclePlate } from '../common/VehiclePlate.js';

interface FleetImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (batch: ImportBatch) => void;
  adminName: string;
  adminRole: string;
}

interface ColumnDetection {
  key: string;
  labelHi: string;
  labelEn: string;
  detectedHeader: string | null;
  sampleValue: string | null;
  required: boolean;
}

const CANONICAL_FIELDS: { key: string; labelHi: string; labelEn: string; aliases: string[]; required: boolean }[] = [
  {
    key: 'vehicleNumber',
    labelHi: 'गाड़ी नंबर',
    labelEn: 'Vehicle No',
    aliases: ['vehicle number', 'vehicle no', 'veh_no', 'vehicle', 'गाड़ी नंबर', 'गाड़ी सं', 'ट्रक नंबर', 'reg no', 'registration', 'truck_no', 'regn no', 'v_no'],
    required: true,
  },
  {
    key: 'ownerName',
    labelHi: 'मालिक का नाम',
    labelEn: 'Owner Name',
    aliases: ['owner name', 'owner', 'मालिक का नाम', 'गाड़ी मालिक', 'मालिक', 'transporter', 'party name', 'owner_name', 'name'],
    required: false,
  },
  {
    key: 'mobile',
    labelHi: 'मोबाइल नंबर',
    labelEn: 'Mobile',
    aliases: ['mobile number', 'mobile', 'mobile no', 'phone', 'मोबाइल नंबर', 'मोबाइल', 'contact', 'फोन', 'mobile_no', 'phone_number'],
    required: false,
  },
  {
    key: 'category',
    labelHi: 'वाहन श्रेणी',
    labelEn: 'Category',
    aliases: ['vehicle type', 'category', 'गाड़ी प्रकार', 'type', 'श्रेणी', 'wheel', 'axle', 'वाहन प्रकार', 'चक्का'],
    required: false,
  },
  {
    key: 'capacityTon',
    labelHi: 'क्षमता (टन)',
    labelEn: 'Capacity (MT)',
    aliases: ['capacity', 'capacity (ton)', 'क्षमता (टन)', 'क्षमता', 'ton', 'tonnage', 'mt', 'weight_capacity', 'भार'],
    required: false,
  },
  {
    key: 'membershipNumber',
    labelHi: 'सदस्यता संख्या',
    labelEn: 'Membership No',
    aliases: ['membership number', 'membership no', 'सदस्यता नंबर', 'सदस्यता', 'member id', 'stoa no', 'membership_id'],
    required: false,
  },
  {
    key: 'serialNumber',
    labelHi: 'क्रम संख्या',
    labelEn: 'Serial No',
    aliases: ['serial number', 'serial', 'क्रम संख्या', 'क्रम', 'सीरियल', 'सीरियल नंबर', 'serial_no', 'sr_no'],
    required: false,
  },
];

export const FleetImportModal: React.FC<FleetImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  adminName,
  adminRole,
}) => {
  const { t, language } = useLanguageTheme();
  const [activeTab, setActiveTab] = useState<'UPLOAD' | 'PASTE'>('UPLOAD');
  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Fleet_Import.xlsx');
  const [fileSize, setFileSize] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [workbookRef, setWorkbookRef] = useState<XLSX.WorkBook | null>(null);

  // Parsed content
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<ColumnDetection[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  // Preview state
  const [previewData, setPreviewData] = useState<any>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process rows and detect columns
  const analyzeColumnsAndRows = (rows: Record<string, any>[], textPreview?: string) => {
    if (rows.length === 0) {
      setFileError('फ़ाइल में कोई डेटा पंक्ति नहीं मिली।');
      setDetectedColumns([]);
      setParsedRows([]);
      return;
    }

    const firstRow = rows[0];
    const headers = Object.keys(firstRow);

    const detections: ColumnDetection[] = CANONICAL_FIELDS.map((field) => {
      let matchedHeader: string | null = null;

      // 1. Exact or Alias match
      for (const h of headers) {
        const cleanH = h.toLowerCase().trim().replace(/[_\-\.]/g, ' ');
        if (field.aliases.some((alias) => cleanH === alias || cleanH.includes(alias))) {
          matchedHeader = h;
          break;
        }
      }

      const sampleVal = matchedHeader && firstRow[matchedHeader] !== undefined ? String(firstRow[matchedHeader]) : null;

      return {
        key: field.key,
        labelHi: field.labelHi,
        labelEn: field.labelEn,
        detectedHeader: matchedHeader,
        sampleValue: sampleVal,
        required: field.required,
      };
    });

    setDetectedColumns(detections);
    setParsedRows(rows);
    if (textPreview) setCsvText(textPreview);
    setFileError(null);
  };

  // Handle uploaded file
  const processUploadedFile = async (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + ' KB');
    setIsProcessingFile(true);
    setFileError(null);

    const ext = file.name.split('.').pop()?.toLowerCase();

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        // Read binary Excel
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        setWorkbookRef(workbook);
        setSheetNames(workbook.SheetNames);

        const firstSheetName = workbook.SheetNames[0];
        setSelectedSheet(firstSheetName);

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        const csvStr = XLSX.utils.sheet_to_csv(worksheet);

        analyzeColumnsAndRows(jsonRows, csvStr);
      } else {
        // CSV or TXT
        const text = await file.text();
        setWorkbookRef(null);
        setSheetNames([]);
        setCsvText(text);

        // Parse via XLSX parser for robust comma/quote handling
        const workbook = XLSX.read(text, { type: 'string' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        analyzeColumnsAndRows(jsonRows, text);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setFileError(`फ़ाइल पढ़ने में त्रुटि: ${err.message || 'अमान्य फ़ाइल स्वरूप'}`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Sheet switch for multi-sheet Excel
  const handleSheetChange = (sheetName: string) => {
    if (!workbookRef) return;
    setSelectedSheet(sheetName);
    const worksheet = workbookRef.Sheets[sheetName];
    const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    const csvStr = XLSX.utils.sheet_to_csv(worksheet);
    analyzeColumnsAndRows(jsonRows, csvStr);
  };

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Handle Text Paste change
  const handlePasteChange = (text: string) => {
    setCsvText(text);
    if (!text.trim()) {
      setParsedRows([]);
      setDetectedColumns([]);
      return;
    }

    try {
      const workbook = XLSX.read(text, { type: 'string' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      analyzeColumnsAndRows(jsonRows);
    } catch {
      // Fallback simple line split
      const lines = text.trim().split('\n');
      if (lines.length > 1) {
        const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        const rows = lines.slice(1).map((l) => {
          const vals = l.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] || '';
          });
          return obj;
        });
        analyzeColumnsAndRows(rows);
      }
    }
  };

  // Fill Demo CSV
  const fillDemoData = () => {
    const demo =
      `Vehicle Number,Owner Name,Mobile,Category,Capacity,Membership No,Serial No\n` +
      `OD15X7273,रमेश कुमार साहु (Updated),9861012345,10-Wheel / 16-18 Ton,18,STOA-M-0412,104\n` +
      `OD15K5050,संतोष कुमार पाणिग्रही,9438099112,12-Wheel / 18-26 Ton,24,STOA-M-0899,105\n` +
      `OD15L8822,दीपक अग्रवाल,9778012345,6-Wheel / 10-12 Ton,11,STOA-M-0901,106\n` +
      `OD15M1199,मुरलीधर प्रधान,9437199880,10-Wheel / 16-18 Ton,18,STOA-M-1102,107\n` +
      `OD15P4410,संजय त्रिपाठी (नया ट्रक),9861234567,Trailer / Other,36,STOA-M-1405,108`;
    setFileName('STOA_Sambalpur_Fleet_Demo.csv');
    setFileSize('1.2 KB');
    handlePasteChange(demo);
    setActiveTab('PASTE');
  };

  // Request Preview from API
  const handleValidateAndPreview = async () => {
    if (parsedRows.length === 0) return;
    setIsValidating(true);
    setFileError(null);

    try {
      const res = await fetch('/api/fleet/import-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFileError(data.error || 'सत्यापन विफल हुआ');
      } else {
        setPreviewData(data);
        setStep('PREVIEW');
      }
    } catch (err: any) {
      setFileError(err.message || 'सत्यापन अनुरोध विफल');
    } finally {
      setIsValidating(false);
    }
  };

  // Execute Import
  const handleConfirmExecute = async () => {
    if (!previewData || parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      const res = await fetch('/api/fleet/import-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          rows: parsedRows,
          actor: adminName || 'Admin',
          actorRole: adminRole || 'ADMIN',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onImportSuccess(data.batch);
        onClose();
      } else {
        setFileError(data.error || 'फ्लीट डेटा आयात विफल');
      }
    } catch (err: any) {
      setFileError(err.message || 'आयात निष्पादन त्रुटि');
    } finally {
      setIsImporting(false);
    }
  };

  const matchedVehicleCol = detectedColumns.find((c) => c.key === 'vehicleNumber')?.detectedHeader;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#150a18] border border-pink-900/40 rounded-3xl max-w-3xl w-full p-5 sm:p-7 max-h-[92vh] flex flex-col shadow-2xl shadow-pink-950/40 space-y-4 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-pink-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-pink-600/30 ring-1 ring-pink-400/40">
              <Upload className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                {language === 'hi' ? 'Excel / CSV फ्लीट आयात' : language === 'or' ? 'Excel / CSV ଫ୍ଲିଟ୍ ଆମଦାନୀ' : 'Excel / CSV Fleet Importer'}
              </h3>
              <p className="text-[11px] text-pink-300/70">
                {language === 'hi' ? 'ऑटोमैटिक कॉलम डिटेक्शन, डुप्लीकेट जांच व रियल-टाइम प्रिव्यू' : language === 'or' ? 'ସ୍ୱୟଂକ୍ରିୟ ସ୍ତମ୍ଭ ଚିହ୍ନଟ, ନକଲ ଯାଞ୍ଚ ଓ ରିଅଲ୍-ଟାଇମ୍ ପ୍ରିଭ୍ୟୁ' : 'Automatic column detection, duplicate check & real-time preview'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-pink-300 hover:text-white rounded-xl hover:bg-pink-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs">
          {step === 'INPUT' ? (
            <>
              {/* Tabs Switcher: Upload File vs Paste Text */}
              <div className="flex items-center justify-between gap-2 border-b border-pink-950 pb-2">
                <div className="flex items-center gap-1.5 bg-[#100713] p-1 rounded-2xl border border-pink-900/40">
                  <button
                    type="button"
                    onClick={() => setActiveTab('UPLOAD')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'UPLOAD'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/25'
                        : 'text-pink-300/70 hover:text-white'
                    }`}
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    {language === 'hi' ? 'फ़ाइल अपलोड' : language === 'or' ? 'ଫାଇଲ୍ ଅପଲୋଡ୍' : 'Upload File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('PASTE')}
                    className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeTab === 'PASTE'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-md shadow-pink-500/25'
                        : 'text-pink-300/70 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {language === 'hi' ? 'टेक्स्ट पेस्ट' : language === 'or' ? 'ଟେକ୍ସଟ୍ ପେଷ୍ଟ' : 'Paste CSV'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fillDemoData}
                  className="px-2.5 py-1.5 bg-[#1b0e1e] hover:bg-[#251329] text-pink-300 rounded-xl text-[11px] font-semibold flex items-center gap-1 border border-pink-900/40 cursor-pointer transition-all"
                >
                  {language === 'hi' ? 'डेमो फ्लीट भरें' : language === 'or' ? 'ଡେମୋ ତଥ୍ୟ ଭରନ୍ତୁ' : 'Fill Sample Data'}
                </button>
              </div>

              {/* TAB 1: FILE UPLOAD ZONE */}
              {activeTab === 'UPLOAD' && (
                <div className="space-y-3">
                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-pink-400 bg-pink-500/10 scale-[1.01]'
                        : selectedFile
                        ? 'border-emerald-500/60 bg-emerald-500/5'
                        : 'border-pink-900/40 hover:border-pink-500/60 bg-[#100713]'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          processUploadedFile(e.target.files[0]);
                        }
                      }}
                      accept=".xlsx,.xls,.csv,.tsv,.txt"
                      className="hidden"
                    />

                    {isProcessingFile ? (
                      <div className="py-4 space-y-2">
                        <RefreshCw className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                        <p className="text-pink-200 font-semibold">फ़ाइल प्रोसेस हो रही है...</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white font-mono">{selectedFile.name}</h4>
                        <div className="flex items-center justify-center gap-2 text-stone-400 text-[11px]">
                          <span>आकार: {fileSize}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 font-semibold">
                            {parsedRows.length} पंक्तियां सफलतापूर्वक लोड हुईं
                          </span>
                        </div>
                        <p className="text-[10px] text-pink-400/90 pt-1">
                          (दूसरी फ़ाइल चुनने के लिए यहाँ क्लिक करें या ड्रैग करें)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto">
                          <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          यहाँ एक्सेल (.xlsx, .xls) अथवा CSV फ़ाइल ड्रैग करें
                        </h4>
                        <p className="text-pink-300/70 text-[11px]">
                          या अपने कंप्यूटर से फ़ाइल चुनने के लिए <span className="text-pink-400 underline font-semibold">ब्राउज़ करें</span>
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-pink-950/70 border border-pink-900/40 text-[10px] text-pink-200 font-mono">.XLSX</span>
                          <span className="px-2 py-0.5 rounded bg-pink-950/70 border border-pink-900/40 text-[10px] text-pink-200 font-mono">.XLS</span>
                          <span className="px-2 py-0.5 rounded bg-pink-950/70 border border-pink-900/40 text-[10px] text-pink-200 font-mono">.CSV</span>
                          <span className="px-2 py-0.5 rounded bg-pink-950/70 border border-pink-900/40 text-[10px] text-pink-200 font-mono">.TSV</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-sheet selector if Excel workbook has multiple sheets */}
                  {sheetNames.length > 1 && (
                    <div className="flex items-center justify-between p-3 bg-[#100713] border border-pink-900/40 rounded-2xl">
                      <span className="text-pink-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-pink-400" />
                        एक्सेल शीट चुनें (Sheet Selection):
                      </span>
                      <select
                        value={selectedSheet}
                        onChange={(e) => handleSheetChange(e.target.value)}
                        className="bg-[#1b0e1e] border border-pink-900/50 text-pink-300 rounded-xl px-2.5 py-1 text-xs font-semibold focus:outline-none"
                      >
                        {sheetNames.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TEXT PASTE ZONE */}
              {activeTab === 'PASTE' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-pink-200 text-[11px]">
                    <span>CSV टेक्स्ट (हेडर सहित पंक्तियां):</span>
                    <span className="font-mono text-pink-400">{parsedRows.length} पंक्तियां खोजी गईं</span>
                  </div>
                  <textarea
                    rows={7}
                    value={csvText}
                    onChange={(e) => handlePasteChange(e.target.value)}
                    placeholder="Vehicle Number,Owner Name,Mobile,Category,Capacity,Membership No..."
                    className="w-full bg-[#100713] border border-pink-900/50 rounded-2xl p-3 font-mono text-[11px] text-pink-100 placeholder-pink-900/50 focus:outline-none focus:ring-1 focus:ring-pink-500 shadow-inner"
                  />
                </div>
              )}

              {/* AUTO-COLUMN DETECTION REPORT PANEL */}
              {parsedRows.length > 0 && (
                <div className="bg-[#100713] border border-pink-900/40 rounded-3xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-pink-400" />
                      ऑटो कॉलम डिटेक्शन रिपोर्ट (Auto Detected Columns)
                    </span>
                    <span className="text-[10px] text-pink-300/70">
                      पहचाने गए: {detectedColumns.filter((c) => c.detectedHeader).length} / {detectedColumns.length}
                    </span>
                  </div>

                  {/* Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {detectedColumns.map((col) => {
                      const isFound = Boolean(col.detectedHeader);
                      return (
                        <div
                          key={col.key}
                          className={`p-2 rounded-xl border text-[11px] transition-all ${
                            isFound
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                              : col.required
                              ? 'bg-red-500/10 border-red-500/30 text-red-300'
                              : 'bg-[#180d1b] border-pink-950 text-stone-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white truncate">{col.labelHi}</span>
                            {isFound ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <span className="text-[9px] text-stone-500">वैकल्पिक</span>
                            )}
                          </div>
                          <div className="mt-1 truncate text-[10px] font-mono">
                            {isFound ? (
                              <span className="text-pink-300 font-bold">&rarr; {col.detectedHeader}</span>
                            ) : (
                              <span className="text-stone-500 italic">नहीं मिला</span>
                            )}
                          </div>
                          {col.sampleValue && (
                            <div className="text-[9px] text-stone-400 truncate mt-0.5">
                              उदा: {col.sampleValue}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!matchedVehicleCol && (
                    <div className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        चेतावनी: 'गाड़ी नंबर' (Vehicle Number) कॉलम नहीं मिला। कृपया अपने एक्सेल में हेडर जांचें।
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Box */}
              {fileError && (
                <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}
            </>
          ) : (
            /* STEP 2: PREVIEW & DIFF COMPARISON VIEW */
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-[#100713] rounded-2xl border border-pink-900/40">
                  <span className="text-pink-300/70 block text-[10px] font-medium">कुल पंक्तियां</span>
                  <span className="text-xl font-bold font-mono text-white">
                    {previewData?.summary?.total || 0}
                  </span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                  <span className="text-emerald-400 block text-[10px] font-medium">नए वाहन</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    +{previewData?.summary?.newCount || 0}
                  </span>
                </div>
                <div className="p-3 bg-pink-500/10 rounded-2xl border border-pink-500/30">
                  <span className="text-pink-300 block text-[10px] font-medium">अपडेट योग्य</span>
                  <span className="text-xl font-bold font-mono text-pink-400">
                    {previewData?.summary?.updatedCount || 0}
                  </span>
                </div>
                <div className="p-3 bg-[#100713] rounded-2xl border border-pink-900/40">
                  <span className="text-stone-400 block text-[10px] font-medium">अपरिवर्तित</span>
                  <span className="text-xl font-bold font-mono text-stone-300">
                    {previewData?.summary?.unchangedCount || 0}
                  </span>
                </div>
              </div>

              {/* Diff Preview Table */}
              <div className="max-h-72 overflow-y-auto border border-pink-900/40 rounded-2xl bg-[#100713]">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-[#180d1b] text-pink-300/80 sticky top-0 border-b border-pink-900/40">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">{t('vehicleRegNumber', 'गाड़ी नंबर')}</th>
                      <th className="py-2.5 px-3">{t('ownerName', 'मालिक')}</th>
                      <th className="py-2.5 px-3">{t('vehicleCategory', 'श्रेणी / क्षमता')}</th>
                      <th className="py-2.5 px-3">{t('status', 'स्थिति')}</th>
                      <th className="py-2.5 px-3">{language === 'hi' ? 'बदलाव' : language === 'or' ? 'ପରିବର୍ତ୍ତନ' : 'Diffs'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-950/60">
                    {previewData?.matchedRows?.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-pink-950/20">
                        <td className="py-2.5 px-3 font-mono text-stone-500">{r.rowNumber}</td>
                        <td className="py-2.5 px-3">
                          <VehiclePlate number={r.normalizedNumber} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-stone-200">{r.ownerName}</td>
                        <td className="py-2.5 px-3 text-stone-400 font-mono">
                          {r.capacityTon}T ({r.category?.split('/')[0] || ''})
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              r.statusType === 'NEW'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : r.statusType === 'UPDATED'
                                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                                : r.statusType === 'ERROR'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-[#1c0e1e] text-stone-400'
                            }`}
                          >
                            {r.statusType === 'NEW'
                              ? (language === 'hi' ? 'नया वाहन' : language === 'or' ? 'ନୂଆ ଗାଡ଼ି' : 'New Vehicle')
                              : r.statusType === 'UPDATED'
                              ? (language === 'hi' ? 'अपडेट' : language === 'or' ? 'ଅପଡେଟ୍' : 'Updated')
                              : r.statusType === 'ERROR'
                              ? (language === 'hi' ? 'त्रुटि' : language === 'or' ? 'ତ୍ରୁଟି' : 'Error')
                              : (language === 'hi' ? 'समान' : language === 'or' ? 'ସମାନ' : 'Unchanged')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-300">
                          {r.diffs && r.diffs.length > 0 ? (
                            r.diffs.map((d: any, i: number) => (
                              <span key={i} className="block text-[10px]">
                                <span className="text-pink-300/70">{d.field}:</span>{' '}
                                <del className="text-red-400">{d.oldValue}</del> &rarr;{' '}
                                <ins className="text-emerald-400 no-underline font-semibold">{d.newValue}</ins>
                              </span>
                            ))
                          ) : r.errors && r.errors.length > 0 ? (
                            <span className="text-red-400">{r.errors.join(', ')}</span>
                          ) : (
                            <span className="text-stone-500">{language === 'hi' ? 'कोई परिवर्तन नहीं' : language === 'or' ? 'କୌଣସି ପରିବର୍ତ୍ତନ ନାହିଁ' : 'No changes'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-pink-950">
          {step === 'INPUT' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-[#1b0e1e] hover:bg-[#251329] border border-pink-900/40 text-pink-300 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
              >
                {t('cancel', 'रद्द करें')}
              </button>
              <button
                type="button"
                onClick={handleValidateAndPreview}
                disabled={parsedRows.length === 0 || isValidating || !matchedVehicleCol}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? 'सत्यापन हो रहा है...' : language === 'or' ? 'ଯାଞ୍ଚ ହେଉଛି...' : 'Validating...'}</span>
                  </>
                ) : (
                  <>
                    <span>{language === 'hi' ? 'जांचें एवं पूर्वावलोकन देखें' : language === 'or' ? 'ଯାଞ୍ଚ ଓ ପ୍ରିଭ୍ୟୁ ଦେଖନ୍ତୁ' : 'Validate & Preview'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep('INPUT')}
                className="px-4 py-2.5 bg-[#1b0e1e] hover:bg-[#251329] border border-pink-900/40 text-pink-300 rounded-xl font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                &larr; {language === 'hi' ? 'वापस बदलें' : language === 'or' ? 'ପଛକୁ ଫେରନ୍ତୁ' : 'Back to Edit'}
              </button>
              <button
                type="button"
                onClick={handleConfirmExecute}
                disabled={isImporting}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-pink-600/30 disabled:opacity-50 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'hi' ? 'डेटाबेस में सेव हो रहा है...' : language === 'or' ? 'ସାଇତା ହେଉଛି...' : 'Saving to Database...'}</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>{language === 'hi' ? `पुष्टि करें व फ्लीट आयात करें (${parsedRows.length} रिकॉर्ड्स)` : language === 'or' ? `ନିଶ୍ଚିତ କରି ଫ୍ଲିଟ୍ ଆମଦାନୀ କରନ୍ତୁ (${parsedRows.length} ରେକର୍ଡ)` : `Confirm & Import Fleet (${parsedRows.length} records)`}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
