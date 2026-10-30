"use client";

import React, { useState, useEffect } from 'react';
import { FeeInvoice, PaymentReceipt, Student } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  QrCode,
  Banknote,
  Landmark,
  FileCheck2,
  X,
  AlertCircle,
  Sparkles,
  Percent,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface FeePaymentGatewayModalProps {
  isOpen: boolean;
  invoice: FeeInvoice | null;
  onClose: () => void;
  onPaymentSuccess: (receipt: PaymentReceipt) => void;
}

export function FeePaymentGatewayModal({
  isOpen,
  invoice,
  onClose,
  onPaymentSuccess
}: FeePaymentGatewayModalProps) {
  const { payInvoice, activeSchool, students } = useAuth();

  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE'>('UPI');
  const [amount, setAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // Optional Fee Waiver / Concession Section
  const [showWaiverSection, setShowWaiverSection] = useState(false);
  const [waiverAmount, setWaiverAmount] = useState<number>(0);
  const [waiverReason, setWaiverReason] = useState<string>('Merit Scholarship (10%)');

  const [error, setError] = useState<string | null>(null);
  const [isCopiedUpi, setIsCopiedUpi] = useState(false);

  // Student linked to invoice
  const student = invoice ? students.find(s => s.id === invoice.studentId) : null;

  // Outstanding calculation
  const totalBilled = invoice?.totalAmount || 0;
  const existingDiscount = invoice?.discountAmount || 0;
  const alreadyPaid = invoice?.paidAmount || 0;
  const currentNetPayable = totalBilled - existingDiscount;
  const remainingBefore = Math.max(0, currentNetPayable - alreadyPaid);

  useEffect(() => {
    if (invoice) {
      const net = (invoice.totalAmount - (invoice.discountAmount || 0)) - invoice.paidAmount;
      const initialRemaining = Math.max(0, net);
      setAmount(initialRemaining);
      setTransactionRef('');
      setBankName('');
      setChequeNumber('');
      setPaymentNotes('');
      setShowWaiverSection(false);
      setWaiverAmount(0);
      setError(null);
    }
  }, [invoice]);

  if (!isOpen || !invoice) return null;

  // Real-time calculation with optional additional waiver
  const effectiveWaiver = showWaiverSection ? Math.min(waiverAmount, remainingBefore) : 0;
  const remainingAfterWaiver = Math.max(0, remainingBefore - effectiveWaiver);
  const projectedRemaining = Math.max(0, remainingAfterWaiver - amount);

  const schoolUpiVpa = `innovatmind.${activeSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@icici`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(schoolUpiVpa);
    setIsCopiedUpi(true);
    setTimeout(() => setIsCopiedUpi(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0 && effectiveWaiver <= 0) {
      setError('Please specify a payment amount or apply an authorized concession waiver.');
      return;
    }

    if (amount > remainingAfterWaiver) {
      setError(`Payment amount ₹${amount.toLocaleString('en-IN')} exceeds the remaining balance of ₹${remainingAfterWaiver.toLocaleString('en-IN')}.`);
      return;
    }

    const res = payInvoice(invoice.id, amount, paymentMode, {
      transactionRef: transactionRef.trim() || undefined,
      bankName: bankName.trim() || undefined,
      chequeNumber: chequeNumber.trim() || undefined,
      notes: paymentNotes.trim() || undefined,
      additionalDiscount: effectiveWaiver > 0 ? effectiveWaiver : undefined,
      waiverReason: effectiveWaiver > 0 ? waiverReason : undefined
    });

    if (res.success && res.receipt) {
      onPaymentSuccess(res.receipt);
      onClose();
    } else {
      setError(res.error || 'Payment gateway could not process this transaction.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                Fee Collection Gateway
              </span>
              <span className="text-emerald-100 text-xs font-mono font-semibold">
                {invoice.invoiceNumber}
              </span>
            </div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-200" />
              Collect Student Fee Payment
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              {student ? `${student.firstName} ${student.lastName} (Adm: ${student.admissionNumber || 'N/A'}) • ${student.gradeName} - Section ${student.sectionName}` : invoice.studentName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Balance Breakdown Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Billed</span>
              <span className="font-mono font-bold text-slate-800 text-sm">
                ₹{totalBilled.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Concession / Waiver</span>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                -₹{(existingDiscount + effectiveWaiver).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Paid So Far</span>
              <span className="font-mono font-bold text-indigo-700 text-sm">
                ₹{alreadyPaid.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-rose-50/80 border border-rose-100 rounded-xl p-1.5 -m-1">
              <span className="text-[10px] font-bold text-rose-600 uppercase block">Net Balance Due</span>
              <span className="font-mono font-black text-rose-700 text-sm">
                ₹{remainingAfterWaiver.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Mode Selector Tabs */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Payment Collection Channel *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('UPI')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMode === 'UPI'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  {paymentMode === 'UPI' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs">UPI Instant</div>
                  <div className="text-[10px] text-slate-500 font-medium">QR Code & VPA</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CASH')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMode === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  {paymentMode === 'CASH' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs">Cash Desk</div>
                  <div className="text-[10px] text-slate-500 font-medium">School Counter</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('NET_BANKING')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMode === 'NET_BANKING'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Landmark className="w-5 h-5 text-emerald-600" />
                  {paymentMode === 'NET_BANKING' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs">Net Banking</div>
                  <div className="text-[10px] text-slate-500 font-medium">NEFT / RTGS / IMPS</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('CHEQUE')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 ${
                  paymentMode === 'CHEQUE'
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  {paymentMode === 'CHEQUE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <div>
                  <div className="font-extrabold text-xs">Bank Cheque</div>
                  <div className="text-[10px] text-slate-500 font-medium">Clearing / DD</div>
                </div>
              </button>
            </div>
          </div>

          {/* UPI Dynamic QR Code Visual if UPI Selected */}
          {paymentMode === 'UPI' && (
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-xs shrink-0 text-center">
                <QrCode className="w-20 h-20 text-indigo-900 mx-auto" />
                <span className="text-[8px] font-mono font-bold text-slate-600 block mt-1">SCAN & PAY ₹{amount}</span>
              </div>
              <div className="space-y-1.5 text-xs flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">Direct School UPI VPA:</span>
                  <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="font-mono font-bold text-indigo-700 text-[11px]">{schoolUpiVpa}</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="text-slate-400 hover:text-indigo-600"
                    >
                      {isCopiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Parents can scan using Google Pay, PhonePe, Paytm or BHIM UPI. Enter the Transaction UTR below once confirmed.
                </p>
              </div>
            </div>
          )}

          {/* Amount Input with Quick Preset Chips */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">
                Collection Amount (₹) *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAmount(remainingAfterWaiver)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] transition-colors"
                >
                  Full Balance (₹{remainingAfterWaiver.toLocaleString('en-IN')})
                </button>
                {remainingAfterWaiver > 1000 && (
                  <button
                    type="button"
                    onClick={() => setAmount(Math.round(remainingAfterWaiver / 2))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] transition-colors"
                  >
                    50% Partial (₹{Math.round(remainingAfterWaiver / 2).toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>
            <Input
              type="number"
              required
              min={1}
              max={remainingAfterWaiver}
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount to collect..."
              className="font-mono text-base font-extrabold text-slate-900 bg-white border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Mode-Specific Reference Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {paymentMode === 'UPI' && (
              <div className="col-span-full">
                <label className="font-bold text-slate-700 block mb-1">UPI UTR / Transaction Reference #</label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. 423985712093"
                  className="bg-white border-slate-300 font-mono text-xs"
                />
              </div>
            )}

            {paymentMode === 'NET_BANKING' && (
              <>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bank Name *</label>
                  <Input
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India, HDFC"
                    className="bg-white border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NEFT / RTGS Reference Number *</label>
                  <Input
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. SBIN000491823"
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
              </>
            )}

            {paymentMode === 'CHEQUE' && (
              <>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cheque Number *</label>
                  <Input
                    required
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="e.g. 004819"
                    className="bg-white border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Drawee Bank Name *</label>
                  <Input
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Axis Bank, ICICI"
                    className="bg-white border-slate-300 text-xs"
                  />
                </div>
              </>
            )}

            {paymentMode === 'CASH' && (
              <div className="col-span-full">
                <label className="font-bold text-slate-700 block mb-1">Cash Receipt / Counter Slip ID (Optional)</label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. CSH-2025-089"
                  className="bg-white border-slate-300 font-mono text-xs"
                />
              </div>
            )}
          </div>

          {/* Scholarship / Concession Waiver Accordion */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            <button
              type="button"
              onClick={() => setShowWaiverSection(!showWaiverSection)}
              className="w-full p-3 text-left font-bold text-xs text-slate-700 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Percent className="w-4 h-4" />
                Apply Scholarship / Concession Waiver to this Payment
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {showWaiverSection ? 'Collapse' : '+ Add Waiver'}
              </span>
            </button>

            {showWaiverSection && (
              <div className="p-3.5 pt-0 border-t border-slate-200/60 bg-white grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Concession Amount (₹)</label>
                  <Input
                    type="number"
                    min={0}
                    max={remainingBefore}
                    value={waiverAmount || ''}
                    onChange={(e) => setWaiverAmount(Number(e.target.value))}
                    placeholder="e.g. 2500"
                    className="font-mono text-xs bg-white border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waiver Category / Reason *</label>
                  <select
                    value={waiverReason}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                  >
                    <option value="Merit Scholarship (10%)">Merit Scholarship (Top Academic Performer)</option>
                    <option value="Sibling Concession (15%)">Sibling Concession (Multi-child Enrollment)</option>
                    <option value="Staff Ward Concession">Staff Ward Concession (Teacher/Staff Child)</option>
                    <option value="STEM Lab Excellence Grant">STEM Lab & Robotics Excellence Grant</option>
                    <option value="Financial Hardship Relief">Financial Hardship Relief (Principal Approved)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Post-Payment Summary Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-extrabold text-emerald-950 block">Instant Official Digital Receipt</span>
                <span className="text-[11px] text-emerald-700">Digital stamp, signature & verifiable QR code will be generated upon confirmation</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-emerald-800 block">Remaining Due Post-Payment</span>
              <span className={`font-mono font-black text-sm ${projectedRemaining === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                {projectedRemaining === 0 ? 'ZERO (FULLY SETTLED)' : `₹${projectedRemaining.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-100"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Generate Official Receipt</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
