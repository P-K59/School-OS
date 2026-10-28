"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  CalendarCheck,
  QrCode,
  Bell,
  X,
  CheckCircle2,
  Printer,
  Smartphone,
  Send,
  Sparkles,
  Zap,
  Clock,
  UserCheck
} from 'lucide-react';

export function DashboardCommandBar() {
  const { students, invoices, activeSchool, payInvoice, markAttendance } = useAuth();

  // Modal Triggers
  const [activeModal, setActiveModal] = useState<'FEE' | 'ATTENDANCE' | 'ID_CARD' | 'NOTICE' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Quick Fee State
  const pendingInvoices = invoices.filter(i => i.status !== 'PAID');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(pendingInvoices[0]?.id || invoices[0]?.id || '');
  const [collectAmount, setCollectAmount] = useState<number>(28500);

  // Quick ID Card State
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0];

  // Quick Notice State
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');

  // Handle Quick Fee Submit
  const handleQuickPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || collectAmount <= 0) return;
    const res = payInvoice(selectedInvoiceId, collectAmount, 'UPI');
    if (res.success) {
      showToast(`Fee payment of ₹${collectAmount.toLocaleString('en-IN')} confirmed via UPI. Receipt: ${res.receiptNumber}`);
      setActiveModal(null);
    }
  };

  // Handle Quick Notice Broadcast
  const handleQuickBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeMessage.trim()) return;
    showToast(`Instant circular "${noticeTitle}" dispatched via WhatsApp & SMS to all guardians!`);
    setActiveModal(null);
    setNoticeTitle('');
    setNoticeMessage('');
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Quick Action Floating Bar */}
      <div className="rounded-2xl light-glass p-3 border border-indigo-100/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Quick Actions Command Bar
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setActiveModal('FEE')}
            className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Collect Fee (UPI)</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal('ATTENDANCE')}
            className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal('ID_CARD')}
            variant="outline"
            className="h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
          >
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
            <span>Print Student ID</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveModal('NOTICE')}
            variant="outline"
            className="h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs rounded-xl"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Broadcast Circular</span>
          </Button>
        </div>
      </div>

      {/* Modal 1: Quick Fee Collection */}
      {activeModal === 'FEE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Instant Fee Collection</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickPay} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Select Student Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setCollectAmount(inv.totalAmount - inv.paidAmount);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.studentName} • {inv.invoiceNumber} (Due: ₹{(inv.totalAmount - inv.paidAmount).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Collection Amount (₹)</label>
                <Input
                  type="number"
                  required
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(Number(e.target.value))}
                  className="mt-1 bg-white border-slate-300 text-xs font-bold text-slate-900 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Instant UPI Settlement Active</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Payment instantly reconciles with Student & Parent portals with a digital tax receipt.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="default" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Confirm & Receive ₹{collectAmount.toLocaleString('en-IN')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Daily Attendance Punch */}
      {activeModal === 'ATTENDANCE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <CalendarCheck className="w-5 h-5 text-indigo-600" />
                <span>Today&apos;s Attendance Punch</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {students.slice(0, 5).map((s) => (
                <div key={s.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={s.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=100`}
                      alt={s.firstName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="font-bold text-slate-900">{s.firstName} {s.lastName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Roll: {s.rollNumber}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        markAttendance(s.id, 'PRESENT');
                        showToast(`Marked ${s.firstName} PRESENT.`);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        (s.todayAttendance || 'PRESENT') === 'PRESENT'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      P
                    </button>
                    <button
                      onClick={() => {
                        markAttendance(s.id, 'LATE');
                        showToast(`Marked ${s.firstName} LATE.`);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        s.todayAttendance === 'LATE'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      L
                    </button>
                    <button
                      onClick={() => {
                        markAttendance(s.id, 'ABSENT');
                        showToast(`Marked ${s.firstName} ABSENT.`);
                      }}
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        s.todayAttendance === 'ABSENT'
                          ? 'bg-rose-600 text-white'
                          : 'bg-white border text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      A
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Auto-synced with parent alerts</span>
              <Button size="sm" onClick={() => setActiveModal(null)} className="bg-indigo-600 text-white font-bold text-xs">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Quick Print Student ID Badge */}
      {activeModal === 'ID_CARD' && currentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <QrCode className="w-5 h-5 text-indigo-600" />
                <span>Instant Student ID Badge</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3">
              <label className="text-xs font-bold text-slate-700">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.admissionNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Render Printable Badge */}
            <div className="mt-4 p-4 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <span className="text-xs font-black uppercase font-mono">{activeSchool.name}</span>
                <Badge variant="cyan" className="text-[9px]">ID PASS</Badge>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <img
                  src={currentStudent.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=200`}
                  alt={currentStudent.firstName}
                  className="w-16 h-20 rounded-xl object-cover border-2 border-white shrink-0"
                />
                <div className="space-y-0.5">
                  <div className="font-extrabold text-sm text-white">{currentStudent.firstName} {currentStudent.lastName}</div>
                  <div className="text-[10px] text-cyan-300 font-mono">ADM: {currentStudent.admissionNumber}</div>
                  <div className="text-[10px] text-indigo-200">Roll: {currentStudent.rollNumber} • Class: {currentStudent.gradeName}</div>
                  <div className="text-[9px] text-slate-300">Emergency: {currentStudent.parentPhone}</div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between">
                <span className="text-[8px] font-mono text-cyan-200">VALID ACADEMIC 2025–26</span>
                <QrCode className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold text-xs gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </Button>
              <Button size="sm" onClick={() => setActiveModal(null)} className="bg-indigo-600 text-white font-bold text-xs">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Quick Notice Broadcast */}
      {activeModal === 'NOTICE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Bell className="w-5 h-5 text-amber-600" />
                <span>Broadcast Quick Circular</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickBroadcast} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Circular Title *</label>
                <Input
                  required
                  placeholder="e.g. Early Dispersal / Sports Day"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="mt-1 bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Message Content *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type message dispatched to WhatsApp & SMS..."
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" size="sm" onClick={() => setActiveModal(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="default" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
