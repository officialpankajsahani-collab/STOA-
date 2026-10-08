import React, { useState } from 'react';
import { Vehicle, MembershipRenewalReceipt, SlipCancellationRecord } from '../../types/index.js';
import { MembershipReceiptModal } from './MembershipReceiptModal.js';
import { X, Calendar, RotateCcw, FileText, CheckCircle2, ShieldAlert, Award, Ban } from 'lucide-react';

interface VehicleRenewalHistoryModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onRenewRequested?: (vehicle: Vehicle) => void;
}

export const VehicleRenewalHistoryModal: React.FC<VehicleRenewalHistoryModalProps> = ({
  vehicle,
  onClose,
  onRenewRequested,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<MembershipRenewalReceipt | null>(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState<'renewals' | 'cancellations'>('renewals');

  if (!vehicle) return null;

  const history = vehicle.renewalHistory || [];
  const renewalCount = vehicle.renewalCount || history.length || 0;
  const cancellations = vehicle.cancellationHistory || [];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    सदस्यता नवीनीकरण इतिहास (Renewal Records)
                  </h3>
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold font-mono">
                    कुल {renewalCount} बार नवीनीकृत
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  गाड़ी: <strong>{vehicle.displayNumber}</strong> &bull; मालिक: <strong>{vehicle.ownerName}</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">सदस्यता संख्या</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {vehicle.membershipNumber}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">वर्तमान स्थिति</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {vehicle.membershipStatus}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">वर्तमान समाप्ति</span>
              <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                {vehicle.membershipExpiryDate}
              </span>
            </div>
            <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900">
              <span className="text-[10px] text-amber-700 block">कुल रसीदें</span>
              <span className="font-mono font-black text-amber-950 text-sm mt-0.5 block">
                {history.length} रसीदें सुरक्षित
              </span>
            </div>
          </div>

          {/* Sub-tab Switchers */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveHistoryTab('renewals')}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeHistoryTab === 'renewals'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>सदस्यता नवीनीकरण ({history.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveHistoryTab('cancellations')}
              className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeHistoryTab === 'cancellations'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-slate-600 hover:text-red-700'
              }`}
            >
              <Ban className="w-3.5 h-3.5 text-red-600" />
              <span>रद्द की गई पर्चियां ({cancellations.length})</span>
            </button>
          </div>

          {/* TAB 1: RENEWALS */}
          {activeHistoryTab === 'renewals' && (
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-600" />
              जारी आधिकारिक रसीदें व नवीनीकरण लॉग:
            </h4>

            {history.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <p>इस गाड़ी के लिए अभी तक कोई डिजिटल नवीनीकरण रसीद पंजीकृत नहीं है।</p>
                {onRenewRequested && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRenewRequested(vehicle);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer text-xs"
                  >
                    सदस्यता अभी रिन्यू करें (रसीद जारी करें)
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {history.map((rec, idx) => (
                  <div
                    key={rec.id || idx}
                    className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:border-rose-300 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-mono font-black rounded-lg border border-rose-200">
                          रसीद #{rec.receiptNumber}
                        </span>
                        <span className="font-bold text-slate-900">
                          वर्ष {rec.renewalYear}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          दिनांक: {rec.dateFormatted}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5">
                        <span>शुल्क: <strong>₹{rec.feeAmount}/-</strong> ({rec.feeInWords})</span>
                        <span>&bull;</span>
                        <span>वैधता: <strong>{rec.newExpiryDate}</strong> तक (+{rec.monthsAdded} माह)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/api/membership/receipt/${rec.receiptNumber}/pdf`;
                          link.download = `STOA_Renewal_Receipt_${rec.receiptNumber}_${(rec.displayNumber || rec.vehicleNumber).replace(/\s+/g, '_')}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-[1.02]"
                        title="आधिकारिक PDF डाउनलोड करें"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF डाउनलोड</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(rec)}
                        className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all hover:scale-[1.02]"
                        title="रसीद देखें व प्रिंट करें"
                      >
                        <span>रसीद देखें</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* TAB 2: CANCELLATIONS */}
          {activeHistoryTab === 'cancellations' && (
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-red-600" />
                रद्द की गई पर्चियों एवं कारणों का आधिकारिक लॉग (Cancellation Records):
              </h4>

              {cancellations.length === 0 ? (
                <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="font-bold text-slate-800">इस गाड़ी की कोई पर्ची रद्द नहीं हुई है।</p>
                  <p className="text-[11px] text-slate-400">सभी लोडिंग चक्र सामान्य एवं निर्बाध रूप से संचालित हैं।</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {cancellations.map((c, idx) => (
                    <div
                      key={c.id || idx}
                      className="p-3.5 bg-red-50/50 border border-red-200 rounded-2xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-red-100 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-white border border-red-200 font-mono font-black text-rose-700 rounded-lg shadow-2xs">
                            {c.token}
                          </span>
                          <span className="font-bold text-slate-900">
                            {c.programTitle} &rarr; {c.destination}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-md text-[10px]">
                          रद्द (CANCELLED)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-white p-2.5 rounded-xl border border-red-100">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-0.5">
                            रद्द करने का कारण:
                          </span>
                          <span className="font-black text-red-700 leading-snug block">
                            {c.cancellationReason || 'मालिक/एडमिन द्वारा रद्द'}
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-red-100 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">रद्दकर्ता:</span>
                            <span className="font-bold text-slate-800">{c.cancelledBy}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">तारीख व समय:</span>
                            <span className="font-mono text-slate-600">
                              {c.cancelledAt ? new Date(c.cancelledAt).toLocaleString('hi-IN') : 'सत्यापित'}
                            </span>
                          </div>
                          {c.originalSerial !== undefined && (
                            <div className="flex justify-between pt-0.5 border-t border-slate-100 text-emerald-700 font-bold">
                              <span>बहाल रोटेशन क्रम:</span>
                              <span className="font-mono">#{c.originalSerial}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
            >
              बंद करें
            </button>

            {onRenewRequested && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRenewRequested(vehicle);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>नया नवीनीकरण करें (+1 वर्ष / ₹300)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested Single Receipt View Modal */}
      {selectedReceipt && (
        <MembershipReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          isNewRenewal={false}
        />
      )}
    </>
  );
};
