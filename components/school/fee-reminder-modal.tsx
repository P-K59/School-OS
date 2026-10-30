"use client";

import React, { useState } from 'react';
import { FeeInvoice, Student, School } from '@/lib/types';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BellRing,
  MessageSquare,
  Smartphone,
  Mail,
  Copy,
  Check,
  X,
  ExternalLink,
  Send,
  AlertTriangle,
  Clock,
  Sparkles
} from 'lucide-react';

interface FeeReminderModalProps {
  isOpen: boolean;
  invoice: FeeInvoice | null;
  onClose: () => void;
  onReminderSent: (message: string) => void;
}

export function FeeReminderModal({
  isOpen,
  invoice,
  onClose,
  onReminderSent
}: FeeReminderModalProps) {
  const { sendFeeReminder, activeSchool, students } = useAuth();

  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !invoice) return null;

  const student = students.find(s => s.id === invoice.studentId);
  const parentPhone = student?.parentPhone || '+91 98765 43210';
  const parentName = student?.parentName || 'Parent / Guardian';

  const netPayable = invoice.totalAmount - (invoice.discountAmount || 0);
  const outstanding = Math.max(0, netPayable - invoice.paidAmount);

  const cleanPhone = parentPhone.replace(/[^0-9]/g, '');

  const reminderTemplate = `Dear ${parentName},\n\nGreetings from ${activeSchool.name}. This is an official reminder regarding pending school fees for your ward *${invoice.studentName}* (Adm No: ${student?.admissionNumber || 'N/A'}, Class: ${student?.gradeName || 'N/A'}).\n\n📌 *Fee Category:* ${invoice.category}\n💰 *Outstanding Balance:* ₹${outstanding.toLocaleString('en-IN')}\n📅 *Due Date:* ${invoice.dueDate}\n\nKindly remit the fee at the earliest through our school counter or via UPI at: innovatmind.${activeSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@icici.\n\nThank you,\nFinance & Accounts Office\n${activeSchool.name}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reminderTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setIsSending(true);
    const res = sendFeeReminder(invoice.id, channel);
    setIsSending(false);
    if (res.success) {
      onReminderSent(`Fee reminder dispatched via ${channel} to ${parentName} (${parentPhone})!`);
      onClose();
    }
  };

  const handleOpenWhatsApp = () => {
    sendFeeReminder(invoice.id, 'WHATSAPP');
    const encoded = encodeURIComponent(reminderTemplate);
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
    onReminderSent(`Opened WhatsApp chat with prefilled fee reminder!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Send Fee Payment Reminder
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {invoice.studentName} • Outstanding: ₹{outstanding.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Target Parent Meta Box */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient Parent</span>
              <span className="font-bold text-slate-800">{parentName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact Phone</span>
              <span className="font-mono font-bold text-indigo-700">{parentPhone}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Invoice Number</span>
              <span className="font-mono font-bold text-slate-700">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Due Date Status</span>
              <span className="font-semibold text-rose-600">Due: {invoice.dueDate}</span>
            </div>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Dispatch Communication Channel
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setChannel('WHATSAPP')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  channel === 'WHATSAPP'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
              
              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  channel === 'SMS'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>SMS Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel('EMAIL')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  channel === 'EMAIL'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Email Notice</span>
              </button>
            </div>
          </div>

          {/* Live Message Template Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Formatted Reminder Notification Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
              {reminderTemplate}
            </div>
          </div>

          {/* Last reminder sent indicator if available */}
          {invoice.lastReminderSentAt && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Last reminder was sent on {new Date(invoice.lastReminderSentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} via {invoice.lastReminderChannel || 'WHATSAPP'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenWhatsApp}
              className="gap-1.5 text-xs font-bold text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open in WhatsApp</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch via {channel}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
