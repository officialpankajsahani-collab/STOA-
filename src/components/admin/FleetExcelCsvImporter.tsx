import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { AdminUser } from '../../types/index.js';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Trash2,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface FleetExcelCsvImporterProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
  adminUser: AdminUser;
}

export const FleetExcelCsvImporter: React.FC<FleetExcelCsvImporterProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  adminUser,
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'FILE_UPLOAD' | 'PASTE_TEXT'>('FILE_UPLOAD');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Fleet_Import.xlsx');
  const [fileSizeText, setFileSizeText] = useState<string>('');
  const [fileFormat, setFileFormat] = useState<'XLSX' | 'XLS' | 'CSV'>('XLSX');
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Preview state
  const [importStep, setImportStep] = useState<'UPLOAD' | 'PREVIEW'>('UPLOAD');
  const [previewResult, setPreviewResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Manual text fallback state
  const [manualText, setManualText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process File (Excel or CSV)
  const processUploadedFile = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setSelectedFile(file);
    setFileName(file.name);

    // Format size
    const kb = Math.round(file.size / 1024);
    setFileSizeText(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') setFileFormat('CSV');
    else if (ext === 'xls') setFileFormat('XLS');
    else setFileFormat('XLSX');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error('एक्सेल शीट में कोई डेटा नहीं मिला।');
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (jsonRows.length === 0) {
        throw new Error('चयनित फाइल में कोई डेटा पंक्तियां नहीं मिलीं।');
      }

      // Convert all cell values to string
      const stringifiedRows: Record<string, string>[] = jsonRows.map((row) => {
        const obj: Record<string, string> = {};
        Object.keys(row).forEach((k) => {
          obj[k.trim()] = String(row[k] ?? '').trim();
        });
        return obj;
      });

      const headers = Object.keys(stringifiedRows[0] || {});
      setDetectedHeaders(headers);
      setParsedRows(stringifiedRows);
    } catch (err: any) {
      console.error('File parse error:', err);
      setParseError(err.message || 'फाइल पढ़ने में समस्या हुई। कृपया मान्य .xlsx, .xls या .csv फाइल अपलोड करें।');
      setSelectedFile(null);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Sample CSV / Excel Template Download
  const handleDownloadSampleTemplate = () => {
    const sampleData = [
      {
        'Vehicle Number': 'OD15A9988',
        'Owner Name': 'रमेश कुमार साहु',
        'Mobile': '9861012345',
        'Vehicle Type': '10-Wheel / 16-18 Ton',
        'Capacity': '18',
        'Membership No': 'STOA-M-0412',
        'Address': 'Dhanupali Sambalpur',
        'Notes': 'Regular carrier',
      },
      {
        'Vehicle Number': 'OD15B7711',
        'Owner Name': 'बिनोद प्रधान',
        'Mobile': '9437023456',
        'Vehicle Type': '12-Wheel / 18-26 Ton',
        'Capacity': '24',
        'Membership No': 'STOA-M-0188',
        'Address': 'Ainthapali Sambalpur',
        'Notes': 'Bulk carrier',
      },
      {
        'Vehicle Number': 'OD15C2233',
        'Owner Name': 'मानस रंजन पटेल',
        'Mobile': '9853034567',
        'Vehicle Type': '6-Wheel / 10-12 Ton',
        'Capacity': '11',
        'Membership No': 'STOA-M-0305',
        'Address': 'Khetrajpur',
        'Notes': 'Local lines',
      },
      {
        'Vehicle Number': 'OD15D4455',
        'Owner Name': 'सुरेश अग्रवाल',
        'Mobile': '9777045678',
        'Vehicle Type': 'Trailer / Other',
        'Capacity': '38',
        'Membership No': 'STOA-M-0072',
        'Address': 'Baraipali Industrial',
        'Notes': 'Heavy payload',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fleet_Template');
    XLSX.writeFile(wb, 'STOA_Fleet_Import_Sample_Template.xlsx');
  };

  // Validate & Preview Rows
  const handleGeneratePreview = async () => {
    let rowsToPreview = parsedRows;

    if (activeInputMode === 'PASTE_TEXT') {
      const lines = manualText.trim().split('\n');
      if (lines.length < 2) {
        setParseError('कृपया कम से कम हेडर और एक पंक्ति का डेटा दर्ज करें।');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
      rowsToPreview = lines.slice(1).map((line) => {
        const vals = line.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = vals[i] || '';
        });
        return obj;
      });
      setFileName('Manual_Paste.csv');
    }

    if (rowsToPreview.length === 0) {
      setParseError('कोई मान्य डेटा पंक्तियां उपलब्ध नहीं हैं।');
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/fleet/import-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rowsToPreview }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'पूर्वावलोकन उत्पन्न करने में विफल।');
      }
      setPreviewResult(data);
      setImportStep('PREVIEW');
    } catch (e: any) {
      setParseError(e.message || 'सत्यापन में समस्या हुई।');
    } finally {
      setIsParsing(false);
    }
  };

  // Confirm and Execute Import
  const handleConfirmExecute = async () => {
    if (!previewResult) return;
    setIsSubmitting(true);

    try {
      let rowsToImport = parsedRows;
      if (activeInputMode === 'PASTE_TEXT') {
        const lines = manualText.trim().split('\n');
        const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());
        rowsToImport = lines.slice(1).map((line) => {
          const vals = line.split(',').map((v) => v.replace(/^["']|["']$/g, '').trim());
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] || '';
          });
          return obj;
        });
      }

      const res = await fetch('/api/fleet/import-execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          rows: rowsToImport,
          actor: adminUser.name,
          actorRole: adminUser.role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'आयात निष्पादित करने में विफल।');
      }

      onImportComplete();
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'आयात सहेजने में विफल।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper check for column detection
  const hasCol = (keywords: string[]) => {
    return detectedHeaders.some((h) =>
      keywords.some((k) => h.toLowerCase().includes(k.toLowerCase()))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-850 border border-stone-700 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Excel / CSV फ्लीट आयात (Fleet Importer)
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-mono font-semibold px-2 py-0.5 rounded">
                  XLSX &middot; XLS &middot; CSV
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                सीधे फाइल अपलोड करें — सिस्टम ऑटो कॉलम मैपिंग, डुप्लीकेट जांच और ओल्ड/न्यू वैल्यू पूर्वावलोकन करेगा।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {importStep === 'UPLOAD' ? (
            <div className="space-y-4 text-xs">
              {/* Top Mode Tabs & Template Download */}
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-750 self-start">
                  <button
                    type="button"
                    onClick={() => setActiveInputMode('FILE_UPLOAD')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      activeInputMode === 'FILE_UPLOAD'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    फाइल अपलोड करें (Upload File)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInputMode('PASTE_TEXT')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                      activeInputMode === 'PASTE_TEXT'
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    टेक्स्ट पेस्ट करें (Paste Raw)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-400 border border-stone-750 rounded-xl font-semibold flex items-center gap-1.5 self-start cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  सैंपल टेम्पलेट डाउनलोड (.xlsx)
                </button>
              </div>

              {/* Error Banner */}
              {parseError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <p>{parseError}</p>
                </div>
              )}

              {/* MODE 1: FILE UPLOAD (DRAG & DROP / FILE BROWSE) */}
              {activeInputMode === 'FILE_UPLOAD' && (
                <div className="space-y-4">
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Drag & Drop Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      isDragOver
                        ? 'border-amber-400 bg-amber-500/10'
                        : selectedFile
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-stone-700 bg-stone-900/80 hover:border-amber-500/50 hover:bg-stone-900'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-7 h-7" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {selectedFile ? 'फाइल चुनी जा चुकी है' : 'यहाँ एक्सेल / CSV फाइल ड्रैग करें या क्लिक करके चुनें'}
                      </h4>
                      <p className="text-xs text-stone-400">
                        समर्थित प्रारूप: <strong className="text-amber-400 font-mono">.XLSX, .XLS, .CSV</strong> (अधिकतम 10,000 पंक्तियां)
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold flex items-center gap-2 pointer-events-none"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      फाइल ब्राउज़ करें (Choose File)
                    </button>
                  </div>

                  {/* Selected File Details Card */}
                  {selectedFile && (
                    <div className="p-4 bg-stone-900 border border-stone-750 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                            {fileFormat}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm block font-mono">{fileName}</span>
                            <span className="text-[11px] text-stone-400">
                              आकार: {fileSizeText} &middot; कुल पहचानी गई पंक्तियां:{' '}
                              <strong className="text-emerald-400">{parsedRows.length}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setParsedRows([]);
                            setDetectedHeaders([]);
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-400 rounded-lg hover:bg-stone-800"
                          title="फाइल हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Auto-Column Match Indicators */}
                      <div className="pt-2 border-t border-stone-800">
                        <span className="text-[11px] text-stone-400 block mb-1.5 font-semibold">
                          स्वतः पहचाने गए कॉलम (Auto-Detected Columns):
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['vehicle', 'truck', 'number', 'गाड़ी'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>गाड़ी नंबर (Vehicle Number)</span>
                          </div>

                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['owner', 'name', 'मालिक'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>मालिक का नाम (Owner Name)</span>
                          </div>

                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['mobile', 'phone', 'contact', 'मोबाइल'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>मोबाइल (Mobile)</span>
                          </div>

                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['category', 'type', 'प्रकार', 'श्रेणी'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>वाहन श्रेणी (Category)</span>
                          </div>

                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['capacity', 'ton', 'क्षमता'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>लोड क्षमता (Capacity)</span>
                          </div>

                          <div
                            className={`p-2 rounded-lg border flex items-center gap-1.5 ${
                              hasCol(['membership', 'member', 'सदस्यता'])
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-stone-850 border-stone-750 text-stone-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 shrink-0" />
                            <span>सदस्यता नं. (Membership No)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: PASTE TEXT FALLBACK */}
              {activeInputMode === 'PASTE_TEXT' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-stone-300 font-semibold">CSV पंक्तियां सीधे पेस्ट करें:</label>
                    <button
                      type="button"
                      onClick={() => {
                        setManualText(
                          `Vehicle Number,Owner Name,Mobile,Category,Capacity,Membership No\n` +
                            `OD15X7273,रमेश कुमार साहु (Updated),9861012345,10-Wheel / 16-18 Ton,18,STOA-M-0412\n` +
                            `OD15K5050,संतोष कुमार पाणिग्रही,9438099112,12-Wheel / 18-26 Ton,24,STOA-M-0899\n` +
                            `OD15L8822,दीपक अग्रवाल,9778012345,6-Wheel / 10-12 Ton,11,STOA-M-0901`
                        );
                      }}
                      className="text-amber-400 underline text-[11px]"
                    >
                      डेमो टेक्स्ट भरें
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder="Vehicle Number,Owner Name,Mobile,Category,Capacity,Membership No..."
                    className="w-full bg-stone-900 border border-stone-750 rounded-xl p-3 font-mono text-[11px] text-amber-200/90 leading-relaxed focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl font-semibold"
                >
                  रद्द करें
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  disabled={
                    isParsing ||
                    (activeInputMode === 'FILE_UPLOAD' && parsedRows.length === 0) ||
                    (activeInputMode === 'PASTE_TEXT' && !manualText.trim())
                  }
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isParsing ? 'जाँच जारी है...' : 'डेटा सत्यापित करें एवं पूर्वावलोकन देखें (Validate & Preview)'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW & DIFF CONFIRMATION */
            <div className="space-y-4 text-xs">
              {/* 4 Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="text-[10px] text-stone-400 block font-semibold uppercase">कुल पंक्तियां</span>
                  <span className="text-xl font-black text-white font-mono">{previewResult?.summary?.total}</span>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block font-semibold uppercase">नए वाहन (New)</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {previewResult?.summary?.newCount}
                  </span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block font-semibold uppercase">अपडेट योग्य (Update)</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {previewResult?.summary?.updatedCount}
                  </span>
                </div>
                <div className="p-3 bg-stone-800 rounded-xl">
                  <span className="text-[10px] text-stone-400 block font-semibold uppercase">अपरिवर्तित (Same)</span>
                  <span className="text-xl font-black text-stone-300 font-mono">
                    {previewResult?.summary?.unchangedCount}
                  </span>
                </div>
              </div>

              {/* Diff Preview Table */}
              <div className="max-h-72 overflow-y-auto border border-stone-800 rounded-2xl">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-stone-900 text-stone-400 sticky top-0 border-b border-stone-800">
                    <tr>
                      <th className="py-2.5 px-3">पंक्ति</th>
                      <th className="py-2.5 px-3">गाड़ी नंबर</th>
                      <th className="py-2.5 px-3">मालिक का नाम</th>
                      <th className="py-2.5 px-3">श्रेणी / क्षमता</th>
                      <th className="py-2.5 px-3">स्थिति</th>
                      <th className="py-2.5 px-3">बदलाव (OLD &rarr; NEW)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 bg-stone-900/50">
                    {previewResult?.matchedRows?.map((r: any, idx: number) => (
                      <tr key={idx} className="hover:bg-stone-850">
                        <td className="py-2.5 px-3 font-mono text-stone-400">#{r.rowNumber}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-white">{r.normalizedNumber}</td>
                        <td className="py-2.5 px-3 text-stone-200">{r.ownerName}</td>
                        <td className="py-2.5 px-3 text-stone-300">
                          {r.category} ({r.capacityTon}T)
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              r.statusType === 'NEW'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : r.statusType === 'UPDATED'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {r.statusType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-300">
                          {r.diffs && r.diffs.length > 0 ? (
                            r.diffs.map((d: any, i: number) => (
                              <span key={i} className="block text-[10px]">
                                {d.field}: <del className="text-red-400 line-through">{d.oldValue}</del> &rarr;{' '}
                                <ins className="text-emerald-400 no-underline font-semibold">{d.newValue}</ins>
                              </span>
                            ))
                          ) : (
                            <span className="text-stone-400 text-[10px]">अपरिवर्तित (No Changes)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Confirmation Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setImportStep('UPLOAD')}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs font-semibold"
                >
                  &larr; वापस फाइल बदलें
                </button>

                <button
                  type="button"
                  onClick={handleConfirmExecute}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'फ्लीट में सहेजा जा रहा है...'
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>फ्लीट में आयात पूर्ण करें (Confirm & Save to Fleet)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
