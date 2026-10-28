"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { StaffMember, PayrollRecord } from '@/lib/types';
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
  Users,
  Search,
  Filter,
  X,
  UserPlus,
  Play,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Download,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  Calculator,
  Calendar,
  Clock
} from 'lucide-react';

export default function StaffManagementPage() {
  const { staff, payrollRecords, activeSchool, activities, addStaff, runPayrollForMonth } = useAuth();

  const [activeTab, setActiveTab] = useState<'STAFF_ROSTER' | 'TEACHER_ACTIVITY' | 'PAYROLL_LOGS'>('STAFF_ROSTER');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  
  // Payroll Slip Modal State
  const [selectedSlip, setSelectedSlip] = useState<PayrollRecord | null>(null);
  
  // Add Staff Modal State
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    designation: 'Senior Faculty',
    department: 'Computer Science',
    email: '',
    phone: '',
    basicSalary: 50000,
    allowances: 12000,
  });

  // Selected Month for Payroll Run
  const [payrollMonth, setPayrollMonth] = useState('May 2025');
  const [payrollNotice, setPayrollNotice] = useState<string | null>(null);

  const filteredStaff = staff.filter(s => {
    const matchesSearch = `${s.name} ${s.employeeId} ${s.designation} ${s.department}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'ALL' || s.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleRunPayroll = () => {
    const res = runPayrollForMonth(payrollMonth);
    setPayrollNotice(
      `✓ Successfully executed deterministic payroll for ${payrollMonth}: ${res.generatedCount} records created, ₹${res.totalDisbursed.toLocaleString('en-IN')} disbursed.`
    );
    setActiveTab('PAYROLL_LOGS');
    setTimeout(() => setPayrollNotice(null), 7000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) return;

    addStaff({
      schoolId: activeSchool.id,
      employeeId: `EMP-${activeSchool.code.replace('SCH-', '')}-${Math.floor(100 + Math.random() * 900)}`,
      name: staffForm.name,
      designation: staffForm.designation,
      department: staffForm.department,
      email: staffForm.email,
      phone: staffForm.phone || '+91 99000 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: Number(staffForm.basicSalary),
      allowances: Number(staffForm.allowances),
      attendanceRate: 98.0,
      status: 'ACTIVE',
    });

    setIsAddStaffOpen(false);
    setStaffForm({
      name: '',
      designation: 'Senior Faculty',
      department: 'Computer Science',
      email: '',
      phone: '',
      basicSalary: 50000,
      allowances: 12000,
    });
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
              <span>{activeSchool.name}</span>
              <span>•</span>
              <span>Human Resources & Payroll Engine</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Staff Directory & Deterministic Payroll
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage faculty roster, attendance records, and automated deterministic payroll disbursements with transparent salary slips.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsAddStaffOpen(true)}
              className="gap-2 shadow-md shadow-indigo-100 font-bold"
              size="default"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Faculty / Staff</span>
            </Button>
          </div>
        </div>

        {/* Notice alert */}
        {payrollNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{payrollNotice}</span>
            </div>
            <button onClick={() => setPayrollNotice(null)} className="text-emerald-600 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* HR Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="light-glass p-4 rounded-2xl border-indigo-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Faculty & Staff</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
              {staff.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              {staff.filter(s => s.status === 'ACTIVE').length} On Duty • {staff.filter(s => s.status === 'ON_LEAVE').length} On Leave
            </div>
          </Card>

          <Card className="light-glass p-4 rounded-2xl border-emerald-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Attendance</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
              97.6%
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              Biometric Check-In Active
            </div>
          </Card>

          <Card className="light-glass p-4 rounded-2xl border-purple-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deterministic Payroll</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-700 mt-2 font-mono">
              {formatCurrency(staff.reduce((acc, curr) => acc + curr.basicSalary + curr.allowances, 0))}
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              Base Monthly Allocation
            </div>
          </Card>

          <Card className="light-glass p-4 rounded-2xl border-blue-100 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Run Payroll Cycle</span>
              <div className="flex items-center gap-2 mt-2">
                <select
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-xs"
                >
                  <option value="May 2025">May 2025</option>
                  <option value="June 2025">June 2025</option>
                  <option value="July 2025">July 2025</option>
                </select>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleRunPayroll}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute Cycle</span>
            </Button>
          </Card>
        </div>

        {/* Tab Toggle Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('STAFF_ROSTER')}
            className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'STAFF_ROSTER'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staff.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('TEACHER_ACTIVITY')}
            className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TEACHER_ACTIVITY'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Teacher Daily Activity & Class Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('PAYROLL_LOGS')}
            className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'PAYROLL_LOGS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Payroll Slips & History ({payrollRecords.length})</span>
          </button>
        </div>

        {activeTab === 'STAFF_ROSTER' ? (
          /* Staff Roster Tab */
          <div className="space-y-4">
            {/* Filters */}
            <Card className="light-glass p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search staff name, EMP ID or department..."
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
                    <span>Department:</span>
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Administration">Administration</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Science">Science & Physics</option>
                    <option value="InnovatMind STEM Labs">InnovatMind STEM Labs</option>
                    <option value="Robotics">Robotics</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Staff Table */}
            <Card className="light-glass overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>EMP ID</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Pay</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 text-xs font-medium">
                        No faculty members match the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((stf) => (
                      <TableRow key={stf.id} className="hover:bg-slate-50/80">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {stf.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{stf.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{stf.designation}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-700">
                          {stf.employeeId}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-indigo-800">
                          {stf.department}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-800">
                          {formatCurrency(stf.basicSalary)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-emerald-700">
                          +{formatCurrency(stf.allowances)}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-emerald-700">
                          {stf.attendanceRate}%
                        </TableCell>
                        <TableCell>
                          <Badge variant={stf.status === 'ACTIVE' ? 'success' : 'warning'}>
                            {stf.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-[11px] text-slate-500 font-mono">
                            {stf.phone}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : activeTab === 'TEACHER_ACTIVITY' ? (
          /* Teacher Activity Ledger Tab for Principal Oversight */
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="light-glass p-4 rounded-2xl border-indigo-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Checked-In</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-indigo-700 mt-2 font-mono">
                  {staff.filter(s => s.status === 'ACTIVE').length} Teachers
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">100% Biometric Punch Verified</div>
              </Card>

              <Card className="light-glass p-4 rounded-2xl border-emerald-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periods Conducted Today</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
                  24 / 28 Slots
                </div>
                <div className="text-[11px] text-emerald-600 font-bold mt-1">Python & STEM Labs Active</div>
              </Card>

              <Card className="light-glass p-4 rounded-2xl border-purple-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Supervision Mode</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-purple-700 mt-2 font-mono">
                  Principal Direct
                </div>
                <div className="text-[11px] text-purple-700 font-medium mt-1">Real-Time Teacher Audit Ledger</div>
              </Card>
            </div>

            {/* Teacher Activity Feed */}
            <Card className="light-glass p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Live Teacher Class & Lab Activity Stream</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Chronological feed of teacher actions, period attendance marks, and lab checkouts.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  LIVE FEED
                </span>
              </div>

              <div className="space-y-3">
                {activities
                  .filter(evt => evt.category === 'TEACHER' || evt.category === 'FACILITY' || evt.category === 'AUTH')
                  .map((evt) => (
                    <div key={evt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 hover:border-indigo-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100/70 border border-indigo-200 text-indigo-700 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{evt.title}</div>
                          <div className="text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">{evt.detail}</div>
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{evt.time}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        ) : (
          /* Payroll Slips Tab */
          <div className="space-y-4">
            <Card className="light-glass overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Name</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Basic Pay</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Incentives</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Salary Slip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="h-32 text-center text-slate-500 text-xs font-medium">
                        No payroll records found. Click &quot;Execute Cycle&quot; to generate deterministic payroll.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((pay) => {
                      const totalDeductions = pay.leaveDeduction + pay.advance + pay.otherDeduction;
                      return (
                        <TableRow key={pay.id} className="hover:bg-slate-50/80">
                          <TableCell className="font-bold text-slate-900 text-xs">
                            {pay.staffName}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-indigo-700">
                            {pay.month}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-slate-800">
                            {formatCurrency(pay.basicSalary)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-emerald-700">
                            +{formatCurrency(pay.allowances)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-purple-700">
                            +{formatCurrency(pay.incentives)}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-rose-600">
                            -{formatCurrency(totalDeductions)}
                          </TableCell>
                          <TableCell className="font-mono text-xs font-extrabold text-slate-900 bg-indigo-50/40">
                            {formatCurrency(pay.netSalary)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={pay.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                              {pay.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedSlip(pay)}
                              className="text-xs text-indigo-700 hover:text-indigo-800 font-bold h-8 px-2.5"
                            >
                              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
                              View Slip
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Modal: Salary Slip Detail View */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              {/* Slip Header */}
              <div className="text-center pb-4 border-b border-slate-200">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold mb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Deterministic Salary Disbursal Slip
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{activeSchool.name}</h2>
                <p className="text-xs text-slate-500 font-medium">{activeSchool.address}, {activeSchool.city}</p>
                <div className="text-xs font-mono text-indigo-700 font-bold mt-1">
                  Pay Period: {selectedSlip.month}
                </div>
              </div>

              {/* Employee Summary */}
              <div className="my-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-medium">Employee Name:</span>
                  <div className="font-bold text-slate-900">{selectedSlip.staffName}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Payment Status:</span>
                  <div>
                    <Badge variant={selectedSlip.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                      {selectedSlip.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mathematical Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Earnings (+)</div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Basic Salary:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedSlip.basicSalary)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">House Rent / Special Allowances:</span>
                  <span className="font-mono font-bold text-emerald-700">+{formatCurrency(selectedSlip.allowances)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Performance Incentives:</span>
                  <span className="font-mono font-bold text-purple-700">+{formatCurrency(selectedSlip.incentives)}</span>
                </div>

                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider pt-2">Deductions (-)</div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Leave / Absence Deductions:</span>
                  <span className="font-mono font-bold text-rose-600">-{formatCurrency(selectedSlip.leaveDeduction)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Salary Advances:</span>
                  <span className="font-mono font-bold text-rose-600">-{formatCurrency(selectedSlip.advance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Professional Tax / Insurance:</span>
                  <span className="font-mono font-bold text-rose-600">-{formatCurrency(selectedSlip.otherDeduction)}</span>
                </div>

                <div className="flex justify-between py-2.5 border-t-2 border-slate-900 text-sm font-extrabold bg-indigo-50/70 px-3 rounded-xl mt-3">
                  <span className="text-slate-900">Net Disbursed Salary:</span>
                  <span className="text-indigo-700 font-mono text-base">{formatCurrency(selectedSlip.netSalary)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </Button>

                <Button
                  onClick={() => setSelectedSlip(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Faculty Member */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-600" />
                  Add Faculty / Staff Member
                </h3>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                  <Input
                    required
                    placeholder="e.g. Dr. Preeti Varma"
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    className="bg-white border-slate-300 text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                    <Input
                      required
                      placeholder="e.g. Senior Faculty"
                      value={staffForm.designation}
                      onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Department *</label>
                    <select
                      value={staffForm.department}
                      onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Science">Science & Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="InnovatMind STEM Labs">InnovatMind STEM Labs</option>
                      <option value="Administration">Administration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email *</label>
                    <Input
                      type="email"
                      required
                      placeholder="faculty@school.edu.in"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="bg-white border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                    <Input
                      placeholder="+91 99000 00000"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Basic Salary (₹) *</label>
                    <Input
                      type="number"
                      required
                      min={1000}
                      value={staffForm.basicSalary}
                      onChange={(e) => setStaffForm({ ...staffForm, basicSalary: Number(e.target.value) })}
                      className="bg-white border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Allowances (₹) *</label>
                    <Input
                      type="number"
                      required
                      min={0}
                      value={staffForm.allowances}
                      onChange={(e) => setStaffForm({ ...staffForm, allowances: Number(e.target.value) })}
                      className="bg-white border-slate-300 font-mono font-bold text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddStaffOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="shadow-md shadow-indigo-100 font-bold">
                    Add Faculty Member
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
