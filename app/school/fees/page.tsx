"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { FeeInvoice, PaymentStatus } from '@/lib/types';
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
  AlertTriangle
} from 'lucide-react';

export default function FeeManagementPage() {
  const { invoices, financials, activeSchool, students, payInvoice, createInvoice } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Payment Collection Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE'>('UPI');
  const [activeReceipt, setActiveReceipt] = useState<{ receiptNumber: string; invoice: FeeInvoice; amount: number; mode: string } | null>(null);

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

  const handleOpenCollect = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    const remaining = (invoice.totalAmount - invoice.discountAmount) - invoice.paidAmount;
    setCollectAmount(remaining);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || collectAmount <= 0) return;

    const res = payInvoice(selectedInvoice.id, collectAmount, paymentMode);
    if (res.success) {
      setActiveReceipt({
        receiptNumber: res.receiptNumber,
        invoice: selectedInvoice,
        amount: collectAmount,
        mode: paymentMode,
      });
      setSelectedInvoice(null);
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
              Fee Collections & Invoices
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

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
              Pending Collection
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
              Online Payments
            </div>
          </div>
        </div>

        {/* Invoices Filter & Search Bar */}
        <div className="card-3d bg-white p-4 rounded-2xl border border-slate-200/80">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search student, invoice # or category..."
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
                <TableHead>Total Fee</TableHead>
                <TableHead>Paid / Remaining</TableHead>
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
                  const remaining = (inv.totalAmount - inv.discountAmount) - inv.paidAmount;
                  return (
                    <TableRow key={inv.id} className="hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-bold text-indigo-700">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-xs">
                        {inv.studentName}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 font-medium">
                        {inv.category}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-800">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-xs font-bold text-emerald-700">
                          {formatCurrency(inv.paidAmount)}
                        </div>
                        {remaining > 0 && (
                          <div className="font-mono text-[10px] text-rose-600 font-semibold">
                            Due: {formatCurrency(remaining)}
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
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => handleOpenCollect(inv)}
                            className="btn-3d-success text-xs h-8 px-3 rounded-xl font-bold"
                          >
                            Collect Fee
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setActiveReceipt({
                                receiptNumber: `REC-${inv.invoiceNumber.replace('INV-', '')}`,
                                invoice: inv,
                                amount: inv.paidAmount,
                                mode: 'UPI',
                              });
                            }}
                            className="btn-3d-secondary text-xs h-8 px-3 rounded-xl font-bold inline-flex items-center gap-1.5"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Modal: Collect Payment */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600" />
                    Collect Student Fee
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Invoice: <span className="font-mono font-bold text-indigo-700">{selectedInvoice.invoiceNumber}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProcessPayment} className="mt-4 space-y-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Student:</span>
                    <span className="font-bold text-slate-900">{selectedInvoice.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Category:</span>
                    <span className="font-semibold text-slate-800">{selectedInvoice.category}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5 font-bold">
                    <span className="text-slate-700">Remaining Due:</span>
                    <span className="text-rose-600 font-mono">
                      {formatCurrency((selectedInvoice.totalAmount - selectedInvoice.discountAmount) - selectedInvoice.paidAmount)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Amount to Collect (₹) *</label>
                  <Input
                    type="number"
                    required
                    min={1}
                    max={(selectedInvoice.totalAmount - selectedInvoice.discountAmount) - selectedInvoice.paidAmount}
                    value={collectAmount}
                    onChange={(e) => setCollectAmount(Number(e.target.value))}
                    className="bg-white border-slate-300 font-mono font-bold text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">Payment Method *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                      { id: 'NET_BANKING', label: 'NetBanking', icon: Landmark },
                      { id: 'CASH', label: 'Cash Counter', icon: Banknote },
                      { id: 'CHEQUE', label: 'Cheque / DD', icon: FileText },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = paymentMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMode(mode.id as any)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedInvoice(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-100"
                  >
                    Confirm & Generate Receipt
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Digital Receipt Generator View */}
        {activeReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              {/* Receipt Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-extrabold mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Official Transaction Receipt
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeSchool.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{activeSchool.address}, {activeSchool.city}</p>
                <div className="text-[11px] font-mono text-indigo-700 font-bold mt-1">
                  Receipt #: {activeReceipt.receiptNumber}
                </div>
              </div>

              {/* Receipt Breakdown */}
              <div className="my-5 space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900">{activeReceipt.invoice.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Invoice Number:</span>
                  <span className="font-mono font-bold text-slate-800">{activeReceipt.invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Fee Category:</span>
                  <span className="font-semibold text-slate-800">{activeReceipt.invoice.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Payment Mode:</span>
                  <span className="font-bold text-emerald-700">{activeReceipt.mode}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-b border-slate-200 text-sm font-extrabold bg-slate-50 px-2 rounded-lg">
                  <span className="text-slate-800">Amount Paid:</span>
                  <span className="text-emerald-700 font-mono">{formatCurrency(activeReceipt.amount)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </Button>

                <Button
                  onClick={() => setActiveReceipt(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}

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
                        {s.firstName} {s.lastName} ({s.admissionNumber})
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">Total Amount (₹) *</label>
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
                    <label className="text-xs font-bold text-slate-700 block mb-1">Due Date *</label>
                    <Input
                      type="date"
                      required
                      value={newInvoiceForm.dueDate}
                      onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, dueDate: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-mono"
                    />
                  </div>
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
