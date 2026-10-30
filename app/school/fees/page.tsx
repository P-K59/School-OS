"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { FeeInvoice, PaymentStatus, PaymentReceipt, InstitutionalFeeStructure } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  CreditCard,
  Search,
  Filter,
  X,
  Plus,
  CheckCircle2,
  FileText,
  Smartphone,
  Landmark,
  Banknote,
  Receipt,
  Download,
  Printer,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Building2,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  BellRing,
  Send
} from 'lucide-react';
import { FeePaymentGatewayModal } from '@/components/school/fee-payment-gateway-modal';
import { BrandedFeeReceiptModal } from '@/components/school/branded-fee-receipt-modal';
import { FeeReminderModal } from '@/components/school/fee-reminder-modal';

export default function FeeManagementPage() {
  const { 
    invoices, 
    financials, 
    activeSchool, 
    students, 
    feeStructures, 
    payInvoice, 
    createInvoice, 
    getInvoiceReceipt,
    sendBatchFeeReminders,
    applyFeeWaiver
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'LEDGER' | 'STRUCTURES'>('LEDGER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Payment Collection Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);
  const [reminderInvoice, setReminderInvoice] = useState<FeeInvoice | null>(null);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // New Invoice Modal State
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({
    studentId: '',
    category: 'Term 2 Tuition + STEM Lab Fee',
    totalAmount: 28500,
    discountAmount: 0,
    dueDate: '2025-06-15',
  });

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = `${inv.studentName} ${inv.invoiceNumber} ${inv.category}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const overdueInvoices = invoices.filter(inv => inv.status !== 'PAID');

  const handleBatchRemindOverdue = () => {
    if (overdueInvoices.length === 0) return;
    const res = sendBatchFeeReminders(overdueInvoices.map(i => i.id), 'WHATSAPP');
    if (res.success) {
      showToast(`Batch fee reminders dispatched to ${res.count} parents via WhatsApp & SMS!`);
    }
  };

  const handleOpenCollect = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
  };

  const handleViewReceipt = (invoice: FeeInvoice) => {
    const existing = getInvoiceReceipt(invoice.invoiceNumber) || getInvoiceReceipt(invoice.id);
    if (existing) {
      setActiveReceipt(existing);
    } else {
      // Build comprehensive receipt display from invoice data
      const student = students.find(s => s.id === invoice.studentId);
      const remaining = (invoice.totalAmount - invoice.discountAmount) - invoice.paidAmount;
      setActiveReceipt({
        receiptNumber: `REC-${invoice.invoiceNumber.replace('INV-', '')}`,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        schoolId: activeSchool.id,
        schoolName: activeSchool.name,
        studentId: invoice.studentId,
        studentName: invoice.studentName,
        admissionNumber: student?.admissionNumber || 'ADM-2025-001',
        gradeName: student?.gradeName || 'Grade 10',
        sectionName: student?.sectionName || 'A',
        category: invoice.category,
        amountPaid: invoice.paidAmount,
        paymentMode: 'UPI',
        totalAmount: invoice.totalAmount,
        discountAmount: invoice.discountAmount || 0,
        previousPaidAmount: 0,
        remainingBalance: Math.max(0, remaining),
        status: invoice.status,
        paidAt: invoice.createdAt || new Date().toISOString(),
        authorizedSignatory: 'Accounts Officer, InnovatMind School OS'
      });
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.id === newInvoiceForm.studentId) || students[0];
    if (!targetStudent) {
      alert('Please select a student.');
      return;
    }

    createInvoice({
      schoolId: activeSchool.id,
      studentId: targetStudent.id,
      studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
      category: newInvoiceForm.category,
      totalAmount: Number(newInvoiceForm.totalAmount),
      discountAmount: Number(newInvoiceForm.discountAmount),
      paidAmount: 0,
      dueDate: newInvoiceForm.dueDate,
      status: 'PENDING',
    });

    setIsNewInvoiceOpen(false);
  };

  const handlePrepopulateStructureInvoice = (structure: InstitutionalFeeStructure) => {
    setNewInvoiceForm(prev => ({
      ...prev,
      category: `${structure.gradeName} Annual Fee (${structure.academicSession})`,
      totalAmount: structure.totalAnnualFee,
      discountAmount: 0
    }));
    setActiveTab('LEDGER');
    setIsNewInvoiceOpen(true);
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Clean Executive Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                {activeSchool.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Institutional Fees & Revenue Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict authorized billing, student balance ledgers, and verified payment receipting.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Invoice</span>
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Billed</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {formatCurrency(financials.totalBilled)}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-1">
              Academic Year 2025–26
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Total Collected</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700">
              {formatCurrency(financials.totalCollected)}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">
              {Math.round((financials.totalCollected / (financials.totalBilled || 1)) * 100)}% Realized
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Outstanding Due</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600">
              {formatCurrency(financials.totalOverdue)}
            </div>
            <div className="text-xs font-semibold text-rose-600 mt-1">
              Pending Balances
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Digital UPI Share</span>
              <Smartphone className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-purple-700">
              {financials.upiPercentage}%
            </div>
            <div className="text-xs font-semibold text-purple-600 mt-1">
              Verified Gateway / Counters
            </div>
          </div>
        </div>

        {/* Tab Navigation: Fee Ledger vs Institutional Fee Structures */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'LEDGER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Student Invoices & Fee Ledger ({filteredInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STRUCTURES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'STRUCTURES'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Configured Fee Structures ({feeStructures.length})</span>
          </button>
        </div>

        {/* TAB 1: STUDENT INVOICES & FEE LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-4">
            {/* Invoices Filter & Search Bar */}
            <div className="card-3d bg-white p-4 rounded-2xl border border-slate-200/80">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search student, invoice # or fee type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-slate-300 text-xs font-medium text-slate-900"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto">
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Status:</span>
                  </div>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  >
                    <option value="ALL">All Invoices</option>
                    <option value="PAID">Paid</option>
                    <option value="PARTIAL">Partial Payment</option>
                    <option value="PENDING">Pending Collection</option>
                  </select>

                  <span className="text-xs text-slate-500 font-mono font-bold pl-2">
                    Showing {filteredInvoices.length} of {invoices.length}
                  </span>

                  {overdueInvoices.length > 0 && (
                    <button
                      onClick={handleBatchRemindOverdue}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ml-auto"
                    >
                      <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                      <span>Remind All Overdue ({overdueInvoices.length})</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Main Invoices Table */}
            <div className="card-3d bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Fee Description</TableHead>
                    <TableHead>Billed Amount</TableHead>
                    <TableHead>Paid / Outstanding</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 text-xs font-medium">
                        No fee invoices match the current query.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const netPayable = inv.totalAmount - inv.discountAmount;
                      const remaining = netPayable - inv.paidAmount;
                      const student = students.find(s => s.id === inv.studentId);
                      return (
                        <TableRow key={inv.id} className="hover:bg-slate-50/80">
                          <TableCell className="font-mono text-xs font-bold text-indigo-700">
                            {inv.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900 text-xs">
                              {inv.studentName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {student ? `${student.admissionNumber} • ${student.gradeName}-${student.sectionName}` : 'Active Cadet'}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium max-w-[200px] truncate">
                            {inv.category}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-800">
                            {formatCurrency(inv.totalAmount)}
                            {inv.discountAmount > 0 && (
                              <div className="text-[10px] text-emerald-600 font-normal">
                                Disc: -{formatCurrency(inv.discountAmount)}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs font-bold text-emerald-700">
                              {formatCurrency(inv.paidAmount)}
                            </div>
                            {remaining > 0 ? (
                              <div className="font-mono text-[10px] text-rose-600 font-bold">
                                Due: {formatCurrency(remaining)}
                              </div>
                            ) : (
                              <div className="font-mono text-[10px] text-emerald-600 font-medium">
                                Fully Cleared
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono font-medium">
                            {inv.dueDate}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                inv.status === 'PAID'
                                  ? 'success'
                                  : inv.status === 'PARTIAL'
                                  ? 'warning'
                                  : 'destructive'
                              }
                            >
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {inv.status !== 'PAID' && (
                                <>
                                  <button
                                    onClick={() => handleOpenCollect(inv)}
                                    className="btn-3d-success text-xs h-8 px-3 rounded-xl font-bold whitespace-nowrap"
                                  >
                                    Collect Fee
                                  </button>
                                  <button
                                    onClick={() => setReminderInvoice(inv)}
                                    className="px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                                    title="Send Payment Reminder to Parent"
                                  >
                                    <BellRing className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Remind</span>
                                  </button>
                                </>
                              )}
                              {inv.paidAmount > 0 && (
                                <button
                                  onClick={() => handleViewReceipt(inv)}
                                  className="btn-3d-secondary text-xs h-8 px-3 rounded-xl font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                                  title="View Official Payment Receipt"
                                >
                                  <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* TAB 2: CONFIGURABLE INSTITUTIONAL FEE STRUCTURES */}
        {activeTab === 'STRUCTURES' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Grade-Wise Approved Institutional Fee Schedule
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Established schedules for tuition, STEM & robotics laboratories, annual development, and examinations for {activeSchool.name}.
                </p>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 font-medium">
                Academic Session: <span className="font-bold text-indigo-700">2025–2026</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feeStructures.map((structure) => (
                <div key={structure.id} className="card-3d bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs">
                        {structure.gradeName}
                      </span>
                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {structure.academicSession}
                      </span>
                    </div>

                    <div className="border-t border-b border-slate-100 py-3 my-2 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Tuition Fee:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(structure.tuitionFee)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          STEM & Robotics Lab:
                        </span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(structure.stemLabFee)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Exam & Library:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(structure.examLibraryFee)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span>Annual Campus Dev:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrency(structure.annualCharges)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-xs font-bold text-slate-700">Total Annual Fee:</span>
                      <span className="text-lg font-black text-indigo-700 font-mono">
                        {formatCurrency(structure.totalAnnualFee)}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePrepopulateStructureInvoice(structure)}
                      className="w-full btn-3d-primary py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <span>Issue Invoices for {structure.gradeName}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Payment Gateway Modal */}
        <FeePaymentGatewayModal
          isOpen={Boolean(selectedInvoice)}
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPaymentSuccess={(rcpt) => {
            setActiveReceipt(rcpt);
            showToast(`Payment collected successfully! Generated Receipt ${rcpt.receiptNumber}`);
          }}
        />

        {/* Branded Official Digital Receipt View & Export */}
        <BrandedFeeReceiptModal
          receipt={activeReceipt}
          activeSchool={activeSchool}
          onClose={() => setActiveReceipt(null)}
        />

        {/* Parent Fee Payment Reminder Modal */}
        <FeeReminderModal
          isOpen={Boolean(reminderInvoice)}
          invoice={reminderInvoice}
          onClose={() => setReminderInvoice(null)}
          onReminderSent={(msg) => showToast(msg)}
        />

        {/* Modal: Create Fee Invoice */}
        {isNewInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  Generate New Invoice
                </h3>
                <button
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Student *</label>
                  <select
                    value={newInvoiceForm.studentId}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, studentId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    required
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.admissionNumber}) — {s.gradeName}-{s.sectionName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fee Description *</label>
                  <Input
                    required
                    value={newInvoiceForm.category}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, category: e.target.value })}
                    className="bg-white border-slate-300 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Fee (₹) *</label>
                    <Input
                      type="number"
                      required
                      min={100}
                      value={newInvoiceForm.totalAmount}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, totalAmount: Number(e.target.value) })}
                      className="bg-white border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Discount (₹)</label>
                    <Input
                      type="number"
                      min={0}
                      value={newInvoiceForm.discountAmount}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, discountAmount: Number(e.target.value) })}
                      className="bg-white border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Due Date *</label>
                  <Input
                    type="date"
                    required
                    value={newInvoiceForm.dueDate}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                    className="bg-white border-slate-300 text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewInvoiceOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="shadow-md shadow-indigo-100 font-bold">
                    Issue Invoice
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
