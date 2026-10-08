import React from 'react';
import { MembershipRenewalReceipt } from '../../types/index.js';
import { MembershipRenewalReceiptCard } from './MembershipRenewalReceiptCard.js';
import { X, CheckCircle, Download, FileText, Printer } from 'lucide-react';

interface MembershipReceiptModalProps {
  receipt: MembershipRenewalReceipt | null;
  onClose: () => void;
  isNewRenewal?: boolean;
}

export const MembershipReceiptModal: React.FC<MembershipReceiptModalProps> = ({
  receipt,
  onClose,
  isNewRenewal = false,
}) => {
  if (!receipt) return null;

  const pdfDownloadUrl = `/api/membership/receipt/${receipt.receiptNumber}/pdf`;
  const pdfFilename = `STOA_Renewal_Receipt_${receipt.receiptNumber}_${(receipt.displayNumber || receipt.vehicleNumber).replace(/\s+/g, '_')}.pdf`;

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfDownloadUrl;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto border border-slate-200">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>{isNewRenewal ? '🎉 सदस्यता नवीनीकरण सफल!' : 'सदस्यता नवीनीकरण रसीद'}</span>
                <span className="text-xs font-mono font-bold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-lg border border-rose-200">
                  रसीद #{receipt.receiptNumber}
                </span>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
                  कुल #{receipt.renewalCountForVehicle || 1} बार नवीनीकृत
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                गाड़ी: <strong className="text-slate-800">{receipt.displayNumber}</strong> &bull; मालिक: <strong className="text-slate-800">{receipt.ownerName}</strong> &bull; वर्ष: <strong className="text-slate-800">{receipt.renewalYear}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs transition-all cursor-pointer hover:scale-[1.02]"
              title="असली अपलोड किए गए फोटो जैसा आधिकारिक PDF डाउनलोड करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF डाउनलोड करें</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="बंद करें"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner for New Renewal */}
        {isNewRenewal && (
          <div className="p-3 bg-emerald-50/90 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                <strong>सफल!</strong> गाड़ी <strong>{receipt.displayNumber}</strong> के लिए सदस्यता नवीनीकरण रसीद <strong>#{receipt.receiptNumber}</strong> (वैधता: {receipt.newExpiryDate}) अपलोड किए गए फोटो जैसे असली प्रारूप में जनरेट हो गई है।
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="shrink-0 font-bold underline hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>डाउनलोड करें</span>
            </button>
          </div>
        )}

        {/* Modal Body: The Exact Replica Receipt */}
        <div className="overflow-x-auto pb-1">
          <MembershipRenewalReceiptCard receipt={receipt} />
        </div>

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span>
              सुरक्षित नवीनीकरण रिकॉर्ड: <strong className="text-slate-900 font-mono">कुल #{receipt.renewalCountForVehicle || 1} बार</strong>
            </span>
            <span>&bull;</span>
            <span>
              नई सदस्यता वैधता: <strong className="text-emerald-700 font-mono">{receipt.newExpiryDate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF फाइल डाउनलोड करें</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors cursor-pointer text-xs"
            >
              बंद करें (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
