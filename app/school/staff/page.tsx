"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { StaffMember, PayrollRecord, TeacherTask, TeacherPermissionConfig } from '@/lib/types';
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
  Clock,
  Key,
  Copy,
  Check,
  Lock,
  ClipboardList,
  CheckSquare,
  Plus,
  AlertCircle,
  Sparkles,
  BookOpen,
  Layers,
  Sliders,
  CheckCircle
} from 'lucide-react';

export default function StaffManagementPage() {
  const {
    staff,
    payrollRecords,
    activeSchool,
    activities,
    addStaff,
    runPayrollForMonth,
    resetStaffPassword,
    teacherTasks,
    assignTeacherTask,
    updateTeacherTaskStatus
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'STAFF_ROSTER' | 'TEACHER_TASKS' | 'TEACHER_ACTIVITY' | 'PAYROLL_LOGS'>('STAFF_ROSTER');
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
    password: 'Teach@2026',
    basicSalary: 50000,
    allowances: 12000,
    assignedGrades: ['Grade 6', 'Grade 7', 'Grade 8'] as string[],
    assignedSubjects: ['Computer Science & AI', 'Robotics & STEM'] as string[],
    permissions: {
      canTakeAttendance: true,
      canGradeExams: true,
      canManageCurriculum: true,
      canManageAssignments: true,
      canApproveLeaves: false,
    } as TeacherPermissionConfig
  });

  // Credential Banner after Adding Staff
  const [newStaffSuccessCreds, setNewStaffSuccessCreds] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [isNewStaffCredCopied, setIsNewStaffCredCopied] = useState(false);

  // Staff Password Reset State
  const [staffResetMember, setStaffResetMember] = useState<StaffMember | null>(null);
  const [staffResetPasswordInput, setStaffResetPasswordInput] = useState('');
  const [staffResetSuccessPass, setStaffResetSuccessPass] = useState<string | null>(null);
  const [isStaffCredCopied, setIsStaffCredCopied] = useState(false);

  // Assign Task Modal State
  const [isAssignTaskOpen, setIsAssignTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    teacherId: '',
    title: '',
    description: '',
    assignedGrade: 'Grade 8',
    subject: 'Computer Science & AI',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  });
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('ALL');

  // Selected Month for Payroll Run
  const [payrollMonth, setPayrollMonth] = useState('May 2025');
  const [payrollNotice, setPayrollNotice] = useState<string | null>(null);

  const filteredStaff = staff.filter(s => {
    const matchesSearch = `${s.name} ${s.employeeId} ${s.designation} ${s.department} ${s.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDept = selectedDepartment === 'ALL' || s.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const filteredTasks = teacherTasks.filter(t => {
    if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
    return true;
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

    const email = staffForm.email.trim().toLowerCase();
    const tempPassword = staffForm.password.trim() || ('Teach@' + Math.floor(1000 + Math.random() * 9000));

    addStaff({
      schoolId: activeSchool.id,
      employeeId: `EMP-${activeSchool.code.replace('SCH-', '')}-${Math.floor(100 + Math.random() * 900)}`,
      name: staffForm.name,
      designation: staffForm.designation,
      department: staffForm.department,
      email: email,
      phone: staffForm.phone || '+91 99000 00000',
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: Number(staffForm.basicSalary),
      allowances: Number(staffForm.allowances),
      attendanceRate: 98.0,
      status: 'ACTIVE',
      assignedGrades: staffForm.assignedGrades,
      assignedSubjects: staffForm.assignedSubjects,
      permissions: staffForm.permissions,
      credentials: {
        loginId: email,
        temporaryPassword: tempPassword,
        generatedAt: new Date().toISOString(),
      }
    });

    setNewStaffSuccessCreds({
      name: staffForm.name,
      email: email,
      password: tempPassword,
    });

    setIsAddStaffOpen(false);
    setStaffForm({
      name: '',
      designation: 'Senior Faculty',
      department: 'Computer Science',
      email: '',
      phone: '',
      password: 'Teach@' + Math.floor(1000 + Math.random() * 9000),
      basicSalary: 50000,
      allowances: 12000,
      assignedGrades: ['Grade 6', 'Grade 7', 'Grade 8'],
      assignedSubjects: ['Computer Science & AI', 'Robotics & STEM'],
      permissions: {
        canTakeAttendance: true,
        canGradeExams: true,
        canManageCurriculum: true,
        canManageAssignments: true,
        canApproveLeaves: false,
      }
    });
  };

  const handleAssignTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeacher = staff.find(s => s.id === taskForm.teacherId) || staff[0];
    if (!targetTeacher || !taskForm.title) return;

    assignTeacherTask({
      schoolId: activeSchool.id,
      teacherId: targetTeacher.id,
      teacherName: targetTeacher.name,
      teacherEmail: targetTeacher.email,
      title: taskForm.title,
      description: taskForm.description,
      assignedGrade: taskForm.assignedGrade,
      subject: taskForm.subject,
      dueDate: taskForm.dueDate,
      priority: taskForm.priority,
      status: 'PENDING'
    });

    setIsAssignTaskOpen(false);
    setTaskForm({
      teacherId: '',
      title: '',
      description: '',
      assignedGrade: 'Grade 8',
      subject: 'Computer Science & AI',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'MEDIUM'
    });
    setActiveTab('TEACHER_TASKS');
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt);
  };

  const AVAILABLE_GRADES = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const AVAILABLE_SUBJECTS = [
    'Computer Science & AI',
    'Robotics & STEM',
    'Science & Physics',
    'Mathematics',
    'English Language',
    'Social Sciences & History'
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
              <span>{activeSchool.name}</span>
              <span>•</span>
              <span>Human Resources & Teacher Function Assignment</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Staff Management & Teacher Duties
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Create teacher login accounts using their Email, assign classes & permissions, dispatch teaching tasks, and run payroll.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setTaskForm(prev => ({ ...prev, teacherId: staff[0]?.id || '' }));
                setIsAssignTaskOpen(true);
              }}
              variant="outline"
              className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
              size="default"
            >
              <ClipboardList className="w-4 h-4" />
              <span>Assign Teacher Task</span>
            </Button>

            <Button
              onClick={() => setIsAddStaffOpen(true)}
              className="gap-2 shadow-md shadow-indigo-100 font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              size="default"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Faculty Login</span>
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

        {/* Success Banner when new Faculty is Created */}
        {newStaffSuccessCreds && (
          <div className="p-4 rounded-3xl bg-indigo-50/90 border border-indigo-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-indigo-950">
                  Teacher Login Account Created for {newStaffSuccessCreds.name}
                </h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  The faculty member can now log in at <span className="font-mono font-semibold">/login</span> using their Email ID.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono">
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-slate-800">
                    <strong>Email (Login ID):</strong> {newStaffSuccessCreds.email}
                  </span>
                  <span className="bg-white px-2.5 py-1 rounded-lg border border-indigo-200 text-indigo-700 font-bold">
                    <strong>Password:</strong> {newStaffSuccessCreds.password}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `Teacher Portal Login Details\nSchool: ${activeSchool.name}\nName: ${newStaffSuccessCreds.name}\nLogin ID / Email: ${newStaffSuccessCreds.email}\nPassword: ${newStaffSuccessCreds.password}\nPortal Link: ${window.location.origin}/login`;
                  navigator.clipboard.writeText(text);
                  setIsNewStaffCredCopied(true);
                  setTimeout(() => setIsNewStaffCredCopied(false), 2500);
                }}
                className="text-xs font-semibold border-indigo-300 text-indigo-800 hover:bg-indigo-100/70 h-9 gap-1.5"
              >
                {isNewStaffCredCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {isNewStaffCredCopied ? 'Copied Details' : 'Copy Credentials'}
              </Button>
              <button
                onClick={() => setNewStaffSuccessCreds(null)}
                className="w-8 h-8 rounded-full hover:bg-indigo-100 flex items-center justify-center text-indigo-400 hover:text-indigo-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Tasks</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
              {teacherTasks.length}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              {teacherTasks.filter(t => t.status === 'COMPLETED').length} Done • {teacherTasks.filter(t => t.status === 'IN_PROGRESS').length} In Progress
            </div>
          </Card>

          <Card className="light-glass p-4 rounded-2xl border-purple-100 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Payroll</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-purple-700 mt-2 font-mono">
              {formatCurrency(staff.reduce((acc, curr) => acc + curr.basicSalary + curr.allowances, 0))}
            </div>
            <div className="text-[11px] text-purple-700 font-medium mt-1">
              Deterministic Base Salary
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
            <span>Faculty & Staff Directory ({staff.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TEACHER_TASKS')}
            className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'TEACHER_TASKS'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Assigned Tasks & Duties ({teacherTasks.length})</span>
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
            <span>Teacher Daily Activity & Logs</span>
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
            <span>Payroll Slips ({payrollRecords.length})</span>
          </button>
        </div>

        {/* TAB 1: Staff Directory & Roster */}
        {activeTab === 'STAFF_ROSTER' ? (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="light-glass p-4">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search name, email, EMP ID or department..."
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
                    <option value="Mathematics">Mathematics</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Staff Table */}
            <Card className="light-glass overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty & Login ID</TableHead>
                    <TableHead>Assigned Classes & Subjects</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500 text-xs font-medium">
                        No faculty members match the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((stf) => (
                      <TableRow key={stf.id} className="hover:bg-slate-50/80">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {stf.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{stf.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{stf.designation}</div>
                              <div className="text-[11px] font-mono text-indigo-600 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{stf.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {(stf.assignedGrades && stf.assignedGrades.length > 0) ? (
                                stf.assignedGrades.map(g => (
                                  <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                    {g}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Classes unassigned</span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {stf.assignedSubjects?.join(', ') || 'General Faculty'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs font-semibold text-slate-800">
                          {stf.department}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-slate-800">
                          {formatCurrency(stf.basicSalary)}
                          <span className="block text-[10px] text-emerald-600 font-semibold font-sans">
                            +{formatCurrency(stf.allowances)} allowances
                          </span>
                        </TableCell>

                        <TableCell>
                          <Badge variant={stf.status === 'ACTIVE' ? 'success' : 'warning'}>
                            {stf.status}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setTaskForm(prev => ({
                                  ...prev,
                                  teacherId: stf.id,
                                  assignedGrade: stf.assignedGrades?.[0] || 'Grade 8',
                                  subject: stf.assignedSubjects?.[0] || 'Computer Science & AI'
                                }));
                                setIsAssignTaskOpen(true);
                              }}
                              title="Assign Task to this Teacher"
                              className="h-8 px-2.5 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50 font-semibold gap-1"
                            >
                              <ClipboardList className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Assign Task</span>
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStaffResetMember(stf);
                                setStaffResetPasswordInput('');
                                setStaffResetSuccessPass(null);
                                setIsStaffCredCopied(false);
                              }}
                              title="Reset Teacher Login Password"
                              className="h-8 px-2.5 text-xs text-amber-700 border-amber-200 hover:bg-amber-50 font-semibold gap-1"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Reset Password</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : activeTab === 'TEACHER_TASKS' ? (
          /* TAB 2: Teacher Tasks Management */
          <div className="space-y-4">
            <Card className="light-glass p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-slate-600">Filter by Status:</span>
                <select
                  value={taskStatusFilter}
                  onChange={(e) => setTaskStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  <option value="ALL">All Statuses ({teacherTasks.length})</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <Button
                onClick={() => {
                  setTaskForm(prev => ({ ...prev, teacherId: staff[0]?.id || '' }));
                  setIsAssignTaskOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 gap-2 shadow-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Duty / Task</span>
              </Button>
            </Card>

            {filteredTasks.length === 0 ? (
              <Card className="light-glass p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Teacher Tasks Assigned Yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  School Admin can assign specific duties (exam marking, lesson preparation, event management, lab checks) to teachers here.
                </p>
                <Button
                  onClick={() => {
                    setTaskForm(prev => ({ ...prev, teacherId: staff[0]?.id || '' }));
                    setIsAssignTaskOpen(true);
                  }}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs mt-2"
                >
                  Assign First Task
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((t) => (
                  <Card key={t.id} className="p-4 bg-white border border-slate-200/80 shadow-xs rounded-2xl space-y-3 flex flex-col justify-between hover:border-indigo-200 transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          t.priority === 'URGENT' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          t.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {t.priority} Priority
                        </span>

                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          t.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-2">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>

                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-400">Assigned To:</span>
                          <span className="font-bold text-slate-900">{t.teacherName}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-400">Target Class:</span>
                          <span className="font-semibold text-indigo-600">{t.assignedGrade} &bull; {t.subject}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-400">Due Date:</span>
                          <span className="font-mono text-slate-700">{t.dueDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-slate-400">Update Status:</span>
                      <div className="flex items-center gap-1">
                        {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const).map(st => (
                          <button
                            key={st}
                            onClick={() => updateTeacherTaskStatus(t.id, st)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              t.status === st
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st === 'IN_PROGRESS' ? 'In Progress' : st === 'COMPLETED' ? 'Done' : 'Pending'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'TEACHER_ACTIVITY' ? (
          /* TAB 3: Teacher Activity Ledger Tab */
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
                <div className="text-[11px] text-slate-500 font-medium mt-1">Biometric Attendance Verified</div>
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
                <div className="text-[11px] text-emerald-600 font-bold mt-1">STEM & Robotics Labs Synchronized</div>
              </Card>

              <Card className="light-glass p-4 rounded-2xl border-purple-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duties Assigned</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-purple-700 mt-2 font-mono">
                  {teacherTasks.length} Assigned
                </div>
                <div className="text-[11px] text-purple-700 font-medium mt-1">Supervised by School Admin</div>
              </Card>
            </div>

            <Card className="light-glass p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Live Faculty Ledger & Class Logs
              </h3>
              <div className="divide-y divide-slate-100">
                {activities
                  .filter(a => a.category === 'TEACHER' || a.category === 'AUTH')
                  .slice(0, 10)
                  .map(act => (
                    <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-800">{act.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{act.detail}</div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 shrink-0">{act.time}</div>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        ) : (
          /* TAB 4: Deterministic Payroll Slips Tab */
          <div className="space-y-4">
            <Card className="light-glass p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Deterministic Payroll Ledger — {activeSchool.name}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  Formula: Net Pay = (Basic + Allowances + 5% Incentive) - (Deductions)
                </div>
              </div>
            </Card>

            <Card className="light-glass overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Disbursement Month</TableHead>
                    <TableHead>Basic Pay</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Incentive</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Salary Slip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-slate-500 text-xs font-medium">
                        No payroll disbursements logged yet. Click &quot;Execute Cycle&quot; to generate slips.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payrollRecords.map((rec) => (
                      <TableRow key={rec.id} className="hover:bg-slate-50/80">
                        <TableCell className="font-bold text-xs text-slate-900">
                          {rec.staffName}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-indigo-800">
                          {rec.month}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-800">
                          {formatCurrency(rec.basicSalary)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-emerald-700">
                          +{formatCurrency(rec.allowances)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-purple-700">
                          +{formatCurrency(rec.incentives)}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-black text-slate-950">
                          {formatCurrency(rec.netSalary)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">
                            {rec.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSlip(rec)}
                            className="h-7 text-xs font-bold gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Printer className="w-3 h-3" />
                            <span>View Slip</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Modal 1: Add Faculty Member & Login Account */}
        {isAddStaffOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Create Faculty Account & Assign Duties</h3>
                    <p className="text-xs text-slate-500">Generates login access for teacher at <span className="font-mono">/login</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="flex-1 overflow-y-auto pr-1 mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Designation *</label>
                    <Input
                      required
                      placeholder="e.g. Senior Faculty / STEM Lead"
                      value={staffForm.designation}
                      onChange={(e) => setStaffForm({ ...staffForm, designation: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Faculty Email (This is their Login ID) *
                    </label>
                    <Input
                      type="email"
                      required
                      placeholder="teacher@school.edu.in"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Initial Password *
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        required
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        className="bg-white border-slate-300 text-xs font-mono flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStaffForm(prev => ({
                            ...prev,
                            password: 'Teach@' + Math.floor(1000 + Math.random() * 9000)
                          }));
                        }}
                        className="text-xs h-9 px-2.5 text-indigo-600 border-slate-200"
                      >
                        Auto
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Department *</label>
                    <select
                      value={staffForm.department}
                      onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    >
                      <option value="Computer Science">Computer Science & AI</option>
                      <option value="InnovatMind STEM Labs">InnovatMind STEM Labs</option>
                      <option value="Science">Science & Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Administration">Administration</option>
                    </select>
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

                {/* Assigned Classes */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    Assign Classes / Grades to this Teacher
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_GRADES.map(g => {
                      const isSel = staffForm.assignedGrades.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setStaffForm(prev => ({ ...prev, assignedGrades: prev.assignedGrades.filter(x => x !== g) }));
                            } else {
                              setStaffForm(prev => ({ ...prev, assignedGrades: [...prev.assignedGrades, g] }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSel
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    Assign Subjects
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SUBJECTS.map(subj => {
                      const isSel = staffForm.assignedSubjects.includes(subj);
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setStaffForm(prev => ({ ...prev, assignedSubjects: prev.assignedSubjects.filter(x => x !== subj) }));
                            } else {
                              setStaffForm(prev => ({ ...prev, assignedSubjects: [...prev.assignedSubjects, subj] }));
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSel
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {subj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Teacher Permissions / Functional Rights */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    Teacher Functional Access & Rights
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'canTakeAttendance' as const, label: 'Mark Classroom Attendance' },
                      { key: 'canGradeExams' as const, label: 'Enter Exam Marks & Grading' },
                      { key: 'canManageCurriculum' as const, label: 'Manage Daily Lecture Plan' },
                      { key: 'canManageAssignments' as const, label: 'Post Assignments & Homework' },
                      { key: 'canApproveLeaves' as const, label: 'Approve Student Leaves' },
                    ].map(perm => (
                      <label key={perm.key} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={staffForm.permissions[perm.key]}
                          onChange={(e) => setStaffForm(prev => ({
                            ...prev,
                            permissions: { ...prev.permissions, [perm.key]: e.target.checked }
                          }))}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                        />
                        <span className="font-semibold text-slate-700">{perm.label}</span>
                      </label>
                    ))}
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
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 h-10 shadow-md">
                    Create Faculty Login & ID
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Reset Teacher Password Modal */}
        {staffResetMember && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Reset Teacher Password</h3>
                    <p className="text-xs text-slate-500">{staffResetMember.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStaffResetMember(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {staffResetSuccessPass ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-950">Password Successfully Updated!</h4>
                    <p className="text-xs text-emerald-700">
                      Teacher can now log in at <span className="font-mono font-semibold">/login</span> using their email.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher Login Email</span>
                      <p className="text-xs font-mono font-bold text-slate-800 break-all">{staffResetMember.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</span>
                      <p className="text-sm font-mono font-black text-indigo-600">{staffResetSuccessPass}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const text = `Teacher Portal Login\nName: ${staffResetMember.name}\nEmail / Login ID: ${staffResetMember.email}\nNew Password: ${staffResetSuccessPass}\nLogin: ${window.location.origin}/login`;
                        navigator.clipboard.writeText(text);
                        setIsStaffCredCopied(true);
                        setTimeout(() => setIsStaffCredCopied(false), 2500);
                      }}
                      className="flex-1 text-xs font-semibold border-slate-300 h-10 gap-2"
                    >
                      {isStaffCredCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {isStaffCredCopied ? 'Copied' : 'Copy Credentials'}
                    </Button>
                    <Button
                      onClick={() => setStaffResetMember(null)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-5"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Teacher Login Email (Login ID)</span>
                    <p className="text-xs font-mono font-bold text-slate-800 break-all">{staffResetMember.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Set New Password</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Min 6 characters..."
                        value={staffResetPasswordInput}
                        onChange={(e) => setStaffResetPasswordInput(e.target.value)}
                        className="text-xs font-mono h-10 rounded-xl bg-slate-50 border-slate-200 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStaffResetPasswordInput('Teach@' + Math.floor(1000 + Math.random() * 9000));
                        }}
                        className="text-xs font-semibold h-10 px-3 border-slate-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        Auto
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStaffResetMember(null)}
                      className="text-xs text-slate-600 border-slate-200 h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!staffResetPasswordInput || staffResetPasswordInput.trim().length < 6}
                      onClick={async () => {
                        const pass = staffResetPasswordInput.trim();
                        await resetStaffPassword(staffResetMember.id, pass);
                        setStaffResetSuccessPass(pass);
                      }}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 shadow-sm"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Modal 3: Assign Task to Teacher Modal */}
        {isAssignTaskOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Assign Duty / Task to Teacher</h3>
                    <p className="text-xs text-slate-500">School Admin task assignment</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAssignTaskOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignTaskSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Faculty / Teacher *</label>
                  <select
                    required
                    value={taskForm.teacherId}
                    onChange={(e) => setTaskForm({ ...taskForm, teacherId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                  >
                    <option value="">-- Choose Faculty Member --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department} &bull; {s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Task Title *</label>
                  <Input
                    required
                    placeholder="e.g. Conduct Mid-Term Robotics Practical Exam"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="text-xs font-medium bg-white border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Instructions / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on deliverables, guidelines, or class timings..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Target Class</label>
                    <select
                      value={taskForm.assignedGrade}
                      onChange={(e) => setTaskForm({ ...taskForm, assignedGrade: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {AVAILABLE_GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                    <select
                      value={taskForm.subject}
                      onChange={(e) => setTaskForm({ ...taskForm, subject: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                    >
                      {AVAILABLE_SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Due Date</label>
                    <Input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="text-xs bg-white border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssignTaskOpen(false)}
                    className="text-xs border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
                  >
                    Assign Task
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Modal 4: Payroll Slip Modal */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-xl w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Deterministic Salary Slip</h3>
                    <p className="text-[11px] text-slate-500">{activeSchool.name} &bull; {selectedSlip.month}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSlip(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Faculty Name</span>
                  <span className="font-bold text-slate-900">{selectedSlip.staffName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Slip ID</span>
                  <span className="font-mono text-slate-700">{selectedSlip.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Basic Pay</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(selectedSlip.basicSalary)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Allowances</span>
                  <span className="font-mono font-semibold text-emerald-700">+{formatCurrency(selectedSlip.allowances)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Incentives (5%)</span>
                  <span className="font-mono font-semibold text-purple-700">+{formatCurrency(selectedSlip.incentives)}</span>
                </div>
                {selectedSlip.leaveDeduction > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-rose-600 font-medium">Attendance Deductions</span>
                    <span className="font-mono font-semibold text-rose-600">-{formatCurrency(selectedSlip.leaveDeduction)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                  <span className="font-black text-slate-900">Net Disbursed</span>
                  <span className="font-mono font-black text-indigo-700 text-base">{formatCurrency(selectedSlip.netSalary)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  size="sm"
                  onClick={() => window.print()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 h-9 px-4"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Slip
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
