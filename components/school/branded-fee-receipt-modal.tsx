"use client";

import React, { useState } from 'react';
import { PaymentReceipt, School } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Printer,
  Download,
  Share2,
  X,
  CheckCircle2,
  Building2,
  CreditCard,
  QrCode,
  FileCheck,
  Send,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';

interface BrandedFeeReceiptModalProps {
  receipt: PaymentReceipt | null;
  activeSchool: School;
  onClose: () => void;
}

export function BrandedFeeReceiptModal({
  receipt,
  activeSchool,
  onClose
}: BrandedFeeReceiptModalProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!receipt) return null;

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Official Payment Receipt — ${activeSchool.name}*\n` +
      `Receipt No: ${receipt.receiptNumber}\n` +
      `Student: ${receipt.studentName} (Adm: ${receipt.admissionNumber || 'N/A'})\n` +
      `Class: ${receipt.gradeName || 'N/A'} - Section ${receipt.sectionName || 'N/A'}\n` +
      `Category: ${receipt.category}\n` +
      `Amount Paid: ₹${receipt.amountPaid.toLocaleString('en-IN')} via ${receipt.paymentMode}\n` +
      (receipt.transactionRef ? `Ref/UTR: ${receipt.transactionRef}\n` : '') +
      `Outstanding Balance: ₹${receipt.remainingBalance.toLocaleString('en-IN')}\n` +
      `Date: ${new Date(receipt.paidAt).toLocaleDateString('en-IN')}\n` +
      `Verified by InnovatMind School OS Financial Gateway.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadReceipt = () => {
    const receiptData = {
      institution: activeSchool.name,
      registrationId: activeSchool.registrationId || 'IMS-2026-0001',
      receiptNumber: receipt.receiptNumber,
      invoiceNumber: receipt.invoiceNumber,
      studentName: receipt.studentName,
      admissionNumber: receipt.admissionNumber,
      grade: `${receipt.gradeName} - ${receipt.sectionName}`,
      feeCategory: receipt.category,
      amountPaid: receipt.amountPaid,
      paymentMode: receipt.paymentMode,
      transactionRef: receipt.transactionRef,
      bankName: receipt.bankName,
      chequeNumber: receipt.chequeNumber,
      discountAmount: receipt.discountAmount,
      waiverReason: receipt.waiverReason,
      remainingBalance: receipt.remainingBalance,
      paidAt: receipt.paidAt,
      signatory: receipt.authorizedSignatory,
      systemVerification: 'AUTHENTIC_STAMPED_DIGITAL_RECORD'
    };

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Official_Receipt_${receipt.receiptNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl overflow-hidden my-4 print:border-none print:shadow-none print:my-0 print:p-6">
        {/* Top Watermark / Seal Banner */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none print:hidden" />

        {/* Action Header (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              Verified Official Receipt
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Official Letterhead */}
        <div className="pt-2">
          {/* School Crest, Affiliation & Registration ID */}
          <div className="text-center pb-5 border-b border-slate-200 relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              OFFICIAL INSTITUTIONAL PAYMENT RECEIPT
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
              {activeSchool.name}
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {activeSchool.address}, {activeSchool.city}, {activeSchool.state}
            </p>
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-1.5 flex-wrap">
              <span>Affiliation: {activeSchool.schoolType} Board</span>
              <span>•</span>
              <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                Reg ID: {activeSchool.registrationId || 'IMS-2026-000101'}
              </span>
              <span>•</span>
              <span>Email: {activeSchool.email}</span>
            </div>

            {/* Official PAID Stamp */}
            <div className="absolute top-2 right-0 rotate-12 select-none pointer-events-none">
              <div className="px-3.5 py-1 border-2 border-emerald-600 rounded-lg text-emerald-700 font-black text-sm uppercase tracking-widest bg-emerald-50/80 shadow-xs">
                PAID & VERIFIED
              </div>
            </div>
          </div>

          {/* Receipt & Student Details Grid */}
          <div className="my-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Receipt Number</span>
              <span className="font-mono font-extrabold text-indigo-700 text-sm">{receipt.receiptNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Transaction Date</span>
              <span className="font-medium text-slate-800">
                {new Date(receipt.paidAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
              <span className="font-bold text-slate-900 text-xs">{receipt.studentName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Number</span>
              <span className="font-mono font-bold text-slate-800 text-xs">{receipt.admissionNumber || 'ADM-2025-001'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Grade & Section</span>
              <span className="font-semibold text-slate-800 text-xs">{receipt.gradeName || 'Class'} - Section {receipt.sectionName || 'A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Reference</span>
              <span className="font-mono font-semibold text-slate-700 text-xs">{receipt.invoiceNumber}</span>
            </div>
          </div>

          {/* Itemized Fee Breakdown Table */}
          <div className="space-y-2 text-xs border-b border-slate-200 pb-4">
            <div className="flex justify-between py-1 text-slate-600">
              <span className="font-medium">Fee Description / Component:</span>
              <span className="font-bold text-slate-900">{receipt.category}</span>
            </div>
            
            <div className="flex justify-between py-1 text-slate-600">
              <span>Gross Billed Fee:</span>
              <span className="font-mono font-medium text-slate-800">{formatCurrency(receipt.totalAmount)}</span>
            </div>

            {receipt.discountAmount > 0 && (
              <div className="flex justify-between py-1 text-emerald-700 bg-emerald-50/50 px-2 rounded-lg">
                <span className="flex items-center gap-1">
                  <span>Scholarship / Concession Waiver:</span>
                  {receipt.waiverReason && (
                    <span className="text-[10px] text-emerald-600 font-semibold">({receipt.waiverReason})</span>
                  )}
                </span>
                <span className="font-mono font-bold">-{formatCurrency(receipt.discountAmount)}</span>
              </div>
            )}

            {receipt.previousPaidAmount > 0 && (
              <div className="flex justify-between py-1 text-slate-500">
                <span>Previously Remitted:</span>
                <span className="font-mono">{formatCurrency(receipt.previousPaidAmount)}</span>
              </div>
            )}

            {/* Collected Highlight Box */}
            <div className="flex items-center justify-between py-2.5 px-3.5 my-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold">
              <div>
                <div className="flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Amount Remitted This Transaction:</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                  Payment Mode: <span className="font-bold uppercase">{receipt.paymentMode}</span>
                  {receipt.transactionRef && (
                    <span className="font-mono text-emerald-800 ml-1.5">• Ref: {receipt.transactionRef}</span>
                  )}
                  {receipt.chequeNumber && (
                    <span className="font-mono text-emerald-800 ml-1.5">• Chq #{receipt.chequeNumber} ({receipt.bankName})</span>
                  )}
                </div>
              </div>
              <div className="font-mono font-black text-base text-emerald-800">
                {formatCurrency(receipt.amountPaid)}
              </div>
            </div>

            <div className="flex justify-between py-1 text-slate-600 font-semibold">
              <span>Remaining Outstanding Balance:</span>
              <span className={`font-mono font-bold ${receipt.remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {receipt.remainingBalance > 0 ? formatCurrency(receipt.remainingBalance) : '₹0 (Fully Settled)'}
              </span>
            </div>
          </div>

          {/* Verification QR & Signatures Block */}
          <div className="pt-4 flex items-end justify-between text-xs">
            {/* Authenticity QR Code */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-center">
                <QrCode className="w-12 h-12 text-slate-900 mx-auto" />
                <span className="text-[7px] font-mono font-black text-slate-700 block mt-0.5">AUTHENTIC SLIP</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Digitally Certified</span>
                </div>
                <p className="text-[9px] text-slate-400 max-w-[180px] leading-tight">
                  This computer-generated receipt is electronically verified and does not require a physical stamp.
                </p>
              </div>
            </div>

            {/* Authorized Signatory Block */}
            <div className="text-right">
              <div className="inline-block border-b border-slate-400 w-36 mb-1" />
              <div className="font-bold text-slate-800 text-[11px]">{receipt.authorizedSignatory}</div>
              <div className="text-[10px] text-slate-400">InnovatMind School OS Finance Desk</div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Print, WhatsApp Share, JSON Download) */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap print:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-1.5 font-bold text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Slip</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReceipt}
              className="gap-1.5 font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download JSON</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShareWhatsApp}
              className="gap-1.5 font-bold text-xs text-emerald-700 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share via WhatsApp</span>
            </Button>
          </div>

          <Button
            size="sm"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
