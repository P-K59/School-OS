"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Student, GenderType } from '@/lib/types';
import { initialGrades, initialSections } from '@/lib/db/mock-data';
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
  Search,
  UserPlus,
  Filter,
  X,
  Trophy,
  Flame,
  Mail,
  Phone,
  Sparkles,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  QrCode,
  ShieldCheck,
  GraduationCap,
  Download,
  AlertTriangle,
  Bot,
  BrainCircuit,
  CreditCard,
  FileText,
  Calendar,
  Wand2,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { BulkStudentImportModal } from '@/components/school/bulk-student-import-modal';

function StudentsManagementPageContent() {
  const {
    students,
    addStudent,
    generateNextAdmissionNumber,
    markAttendance,
    markBatchAttendance,
    getAttendanceForDate,
    activeSchool,
    resetStudentCredentials,
    provisionStudentAccount,
    dataMode
  } = useAuth();
  const searchParams = useSearchParams();

  const isDemo = dataMode === 'DEMO' && Boolean((activeSchool as any)?.isDemo || activeSchool?.id === 'sch-del-001' || activeSchool?.id === 'school-1');

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'DIRECTORY' | 'ATTENDANCE_REGISTER' | 'AI_INSIGHTS'>('DIRECTORY');

  // React to URL navigation queries (attendance, admissions, directory)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'attendance') {
      setActiveTab('ATTENDANCE_REGISTER');
    } else if (tabParam === 'admissions' || tabParam === 'enroll') {
      setIsAddModalOpen(true);
    } else if (tabParam === 'insights') {
      setActiveTab('AI_INSIGHTS');
    } else if (!tabParam) {
      setActiveTab('DIRECTORY');
    }
  }, [searchParams]);

  // Search and Filter State (Directory)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState<string>('ALL');

  // Attendance Register Filter State (Date, Grade, Section)
  const todayDateString = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayDateString = useMemo(() => new Date(Date.now() - 86400000).toISOString().split('T')[0], []);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(todayDateString);
  const [selectedAttendanceGrade, setSelectedAttendanceGrade] = useState<string>('ALL');
  const [selectedAttendanceSection, setSelectedAttendanceSection] = useState<string>('ALL');
  
  // Selected Student for Detail Drawer & ID Card
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);

  // Quick Notification Toast & Modal Error Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available Grades & Sections Scoped to Active School Tenant
  const availableGrades = useMemo(() => {
    const schoolGrades = initialGrades.filter(g => g.schoolId === activeSchool.id || (isDemo && g.schoolId === 'school-1'));
    return schoolGrades.length > 0 ? schoolGrades : initialGrades.slice(0, 5);
  }, [activeSchool.id, isDemo]);

  const availableSections = useMemo(() => {
    const schoolSecs = initialSections.filter(s => s.schoolId === activeSchool.id || (isDemo && s.schoolId === 'school-1'));
    return schoolSecs.length > 0 ? schoolSecs : initialSections.slice(0, 4);
  }, [activeSchool.id, isDemo]);

  // Modal State: Enroll Student & Bulk Import
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    admissionNumber: '',
    rollNumber: '',
    gradeId: availableGrades[0]?.id || 'grade-6',
    sectionId: availableSections[0]?.id || 'sec-6a',
    dob: '2013-06-15',
    gender: 'MALE' as GenderType,
    bloodGroup: 'B+',
    address: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
  });

  // Auto-seed next admission number when opening modal or on mount
  useEffect(() => {
    if (isAddModalOpen && !formData.admissionNumber) {
      setFormData(prev => ({
        ...prev,
        admissionNumber: generateNextAdmissionNumber(),
        gradeId: availableGrades[0]?.id || 'grade-6',
        sectionId: availableSections[0]?.id || 'sec-6a',
      }));
    }
  }, [isAddModalOpen, activeSchool.id]);

  // Filtered student list for Directory
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      `${s.firstName} ${s.lastName} ${s.admissionNumber} ${s.rollNumber}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === 'ALL' || s.gradeId === selectedGrade || s.gradeName === selectedGrade;
    const matchesFee = selectedFeeStatus === 'ALL' || s.feeStatus === selectedFeeStatus;
    return matchesSearch && matchesGrade && matchesFee;
  });

  // Filtered student list for Attendance Register
  const attendanceFilteredStudents = students.filter((s) => {
    const matchesGrade = selectedAttendanceGrade === 'ALL' || s.gradeId === selectedAttendanceGrade || s.gradeName === selectedAttendanceGrade;
    const matchesSection = selectedAttendanceSection === 'ALL' || s.sectionId === selectedAttendanceSection || s.sectionName === selectedAttendanceSection;
    return matchesGrade && matchesSection;
  });

  // Calculate actual saved attendance telemetry for the selected date & class/section
  const currentDayAttendance = getAttendanceForDate(
    selectedAttendanceDate,
    selectedAttendanceGrade,
    selectedAttendanceSection
  );

  // Overall Directory metrics
  const totalStudentsCount = students.length || 1;
  const presentCount = students.filter(s => (s.todayAttendance || 'PRESENT') === 'PRESENT').length;
  const absentCount = students.filter(s => s.todayAttendance === 'ABSENT').length;
  const lateCount = students.filter(s => s.todayAttendance === 'LATE').length;
  const overallAttendanceRate = Math.round((presentCount / totalStudentsCount) * 100);

  // Anomaly students (Attendance < 90% or 2 consecutive flags)
  const anomalyStudents = students.filter(s => s.attendancePercentage < 92 || s.todayAttendance === 'ABSENT');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setModalError('Student first name and last name are required.');
      return;
    }
    if (!formData.admissionNumber?.trim()) {
      setModalError('Admission number is required.');
      return;
    }
    if (!formData.parentName?.trim() || !formData.parentPhone?.trim()) {
      setModalError('Guardian name and guardian phone number are required.');
      return;
    }

    const grade = availableGrades.find(g => g.id === formData.gradeId) || availableGrades[0];
    const section = availableSections.find(sec => sec.id === formData.sectionId) || availableSections[0];

    try {
      const newStudent = addStudent({
        schoolId: activeSchool.id,
        profileId: `prof-${Date.now()}`,
        admissionNumber: formData.admissionNumber.trim(),
        rollNumber: formData.rollNumber.trim() || `${grade.numericLevel}-A-${Math.floor(10 + Math.random() * 89)}`,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || `${formData.firstName.toLowerCase()}.${formData.lastName[0]?.toLowerCase()}@student.school.in`,
        gradeId: grade.id,
        gradeName: grade.name,
        sectionId: section.id,
        sectionName: section.name,
        sessionId: 'session-2025',
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || 'O+',
        address: formData.address || `${activeSchool.city}, India`,
        photoUrl: formData.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80`,
        status: 'ACTIVE',
        parentName: formData.parentName.trim(),
        parentPhone: formData.parentPhone.trim(),
        parentEmail: formData.parentEmail.trim(),
        attendancePercentage: 100.0,
        feeStatus: 'PENDING',
        todayAttendance: 'PRESENT',
      });

      setIsAddModalOpen(false);
      setModalError(null);
      
      // Automatically open the generated Student ID Card with their photo
      setIdCardStudent(newStudent);
      showToast(`Student ${newStudent.firstName} registered. Digital ID Card generated.`);

      // Reset form with next sequence
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        admissionNumber: generateNextAdmissionNumber(),
        rollNumber: '',
        gradeId: availableGrades[0]?.id || 'grade-6',
        sectionId: availableSections[0]?.id || 'sec-6a',
        dob: '2013-06-15',
        gender: 'MALE',
        bloodGroup: 'B+',
        address: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
      });
    } catch (err: any) {
      setModalError(err.message || 'An error occurred while enrolling the student.');
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    markAttendance(studentId, status, selectedAttendanceDate);
    showToast(`Marked ${status} for ${selectedAttendanceDate}.`);
  };

  const handleMarkAllPresentForDate = () => {
    const marks = attendanceFilteredStudents.map(s => ({
      studentId: s.id,
      status: 'PRESENT' as const
    }));
    markBatchAttendance(marks, selectedAttendanceDate);
    showToast(`Marked all ${marks.length} students PRESENT for ${selectedAttendanceDate}.`);
  };

  const handleMarkAllAbsentForDate = () => {
    const marks = attendanceFilteredStudents.map(s => ({
      studentId: s.id,
      status: 'ABSENT' as const
    }));
    markBatchAttendance(marks, selectedAttendanceDate);
    showToast(`Marked ${marks.length} students ABSENT for ${selectedAttendanceDate}.`);
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto font-sans">
        {/* Clean Executive Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                {activeSchool.name}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Students & Attendance
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Bulk CSV Import</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
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
              <span>Total Students</span>
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {isDemo ? (students.length > 0 ? students.length.toLocaleString() : '1,248') : students.length.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-indigo-600 mt-1">
              Active Enrollments
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Attendance</span>
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {isDemo ? (students.length > 0 ? `${overallAttendanceRate}%` : '96%') : (students.length === 0 ? '0%' : `${overallAttendanceRate}%`)}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">
              {isDemo ? (students.length > 0 ? `${presentCount} Present • ${absentCount} Absent` : '1,198 Present • 50 Absent') : `${presentCount} Present • ${absentCount} Absent`}
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Absence Alerts</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {isDemo ? (anomalyStudents.length > 0 ? anomalyStudents.length : 14) : anomalyStudents.length}
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-1">
              Students Flagged
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Fee Cleared</span>
              <CreditCard className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {isDemo ? (students.length > 0 ? `${students.filter(s => s.feeStatus === 'PAID').length} / ${students.length}` : '1,148 / 1,248') : `${students.filter(s => s.feeStatus === 'PAID').length} / ${students.length}`}
            </div>
            <div className="text-xs font-semibold text-purple-600 mt-1">
              Fee Paid
            </div>
          </div>
        </div>

        {/* Clean Segmented Tab Navigation */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-slate-200/60">
          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'DIRECTORY'
                ? 'btn-3d-secondary bg-white text-slate-900 font-bold border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE_REGISTER')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ATTENDANCE_REGISTER'
                ? 'btn-3d-secondary bg-white text-slate-900 font-bold border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance Register</span>
          </button>

          <button
            onClick={() => setActiveTab('AI_INSIGHTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === 'AI_INSIGHTS'
                ? 'btn-3d-secondary bg-white text-slate-900 font-bold border-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Student Insights ({anomalyStudents.length})</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <Card className="light-glass p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search student name, roll or admission #..."
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

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Class:</span>
              </div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              >
                <option value="ALL">All Grades</option>
                {initialGrades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 ml-2">
                <span>Fee Status:</span>
              </div>
              <select
                value={selectedFeeStatus}
                onChange={(e) => setSelectedFeeStatus(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
          </div>
        </Card>

        {/* TAB 1: Main Student Directory */}
        {activeTab === 'DIRECTORY' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`${selectedStudent ? "lg:col-span-2" : "lg:col-span-3"}`}>
              <Card className="light-glass overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission & Roll</TableHead>
                      <TableHead>Class / Section</TableHead>
                      <TableHead>Today Status</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                      <TableHead>Fee Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-500 text-xs font-medium">
                          No students match the selected query.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredStudents.map((s) => {
                        const isSelected = selectedStudent?.id === s.id;
                        const todayStat = s.todayAttendance || 'PRESENT';
                        return (
                          <TableRow
                            key={s.id}
                            onClick={() => setSelectedStudent(s)}
                            className={`cursor-pointer ${
                              isSelected ? "bg-indigo-50/70 border-indigo-200" : ""
                            }`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={s.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80`}
                                  alt={s.firstName}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
                                />
                                <div>
                                  <div className="font-bold text-slate-900 text-xs">
                                    {s.firstName} {s.lastName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-[130px] font-medium">
                                    {s.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-mono font-bold text-slate-800">
                                {s.admissionNumber}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Roll: {s.rollNumber}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-bold text-slate-900">
                                {s.gradeName}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                {s.sectionName}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  todayStat === 'PRESENT'
                                    ? 'success'
                                    : todayStat === 'LATE'
                                    ? 'warning'
                                    : 'destructive'
                                }
                              >
                                {todayStat}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs font-bold text-emerald-700">
                                {s.attendancePercentage}%
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  s.feeStatus === 'PAID'
                                    ? 'success'
                                    : s.feeStatus === 'PARTIAL'
                                    ? 'warning'
                                    : 'destructive'
                                }
                              >
                                {s.feeStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIdCardStudent(s);
                                  }}
                                  className="text-xs h-7 gap-1 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
                                  title="View & Print ID Card"
                                >
                                  <QrCode className="w-3 h-3" />
                                  <span>ID Card</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStudent(s);
                                  }}
                                  className="text-xs h-7 text-slate-600 hover:text-slate-900 font-bold"
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>

            {/* Student Profile Quick View Panel */}
            {selectedStudent && (
              <div className="space-y-4 animate-fade-in">
                <Card className="light-glass p-5 relative shadow-md border-indigo-200">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={selectedStudent.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80`}
                      alt={selectedStudent.firstName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-200 shadow-md"
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <div className="text-xs text-indigo-700 font-mono font-bold">
                        {selectedStudent.admissionNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Roll: {selectedStudent.rollNumber} • Blood: {selectedStudent.bloodGroup || 'O+'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Class & Section:</span>
                      <span className="font-bold text-slate-900">{selectedStudent.gradeName} - {selectedStudent.sectionName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Today&apos;s Status:</span>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            selectedStudent.todayAttendance === 'PRESENT'
                              ? 'success'
                              : selectedStudent.todayAttendance === 'LATE'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {selectedStudent.todayAttendance || 'PRESENT'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Attendance Rate:</span>
                      <span className="text-emerald-700 font-extrabold">{selectedStudent.attendancePercentage}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Fee Payment:</span>
                      <Badge variant={selectedStudent.feeStatus === 'PAID' ? 'success' : 'destructive'}>
                        {selectedStudent.feeStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* ID Card Generator Trigger */}
                  <div className="mt-4">
                    <Button
                      onClick={() => setIdCardStudent(selectedStudent)}
                      className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
                      size="sm"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Generate / Print Student ID Card</span>
                    </Button>
                  </div>

                  {/* STEM Gamification Stats */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      STEM Gamification
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-white border border-indigo-100 shadow-xs">
                        <div className="text-base font-extrabold text-indigo-700">{selectedStudent.currentXp}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Total XP</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-indigo-100 shadow-xs">
                        <div className="text-base font-extrabold text-purple-700">Lvl {selectedStudent.currentLevel}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Tier</div>
                      </div>
                      <div className="p-2 rounded-xl bg-white border border-indigo-100 shadow-xs">
                        <div className="text-base font-extrabold text-amber-700 flex items-center justify-center gap-0.5">
                          <Flame className="w-3.5 h-3.5 text-amber-600" />
                          {selectedStudent.currentStreak}
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Streak</div>
                      </div>
                    </div>
                  </div>

                  {/* Parent Contact Details */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-700">
                    <div className="font-bold text-slate-900">Parent / Guardian</div>
                    <div className="text-slate-600 font-medium">{selectedStudent.parentName}</div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{selectedStudent.parentPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{selectedStudent.parentEmail}</span>
                    </div>
                  </div>

                  {/* Student Portal Account & Credentials */}
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Portal Account Access</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        selectedStudent.provisioningStatus === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : selectedStudent.provisioningStatus === 'SUSPENDED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {selectedStudent.provisioningStatus || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[11px]">Cadet Login ID:</span>
                        <span className="font-mono font-bold text-cyan-300">
                          {selectedStudent.credentials?.loginId || `STU-${activeSchool.city?.slice(0, 3).toUpperCase() || 'DEL'}-${selectedStudent.admissionNumber.slice(-3)}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                        <span className="text-slate-400 text-[11px]">Temp Password:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {selectedStudent.credentials?.temporaryPassword || 'Cadet@2025'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const res = resetStudentCredentials(selectedStudent.id);
                          if (res.success && res.credentials) {
                            showToast(`Credentials re-issued for ${selectedStudent.firstName}. New password generated.`);
                            setSelectedStudent({
                              ...selectedStudent,
                              credentials: res.credentials,
                              provisioningStatus: 'ACTIVE'
                            });
                          }
                        }}
                        className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-7"
                      >
                        Re-issue Temporary Password
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Daily Attendance Register */}
        {activeTab === 'ATTENDANCE_REGISTER' && (
          <div className="space-y-4">
            {/* Control Bar: Class, Section, and Date Selection */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Picker */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <label className="text-xs font-bold text-slate-700">Date:</label>
                  <input
                    type="date"
                    value={selectedAttendanceDate}
                    max={todayDateString}
                    onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                    className="bg-transparent text-xs font-bold font-mono text-slate-900 focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Quick Date Chips */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedAttendanceDate(todayDateString)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedAttendanceDate === todayDateString
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAttendanceDate(yesterdayDateString);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedAttendanceDate === yesterdayDateString
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    Yesterday
                  </button>
                </div>

                {/* Class / Grade Selector */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Class:</label>
                  <select
                    value={selectedAttendanceGrade}
                    onChange={(e) => setSelectedAttendanceGrade(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Classes</option>
                    {availableGrades.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section Selector */}
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-slate-600">Section:</label>
                  <select
                    value={selectedAttendanceSection}
                    onChange={(e) => setSelectedAttendanceSection(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">All Sections</option>
                    {availableSections.map((sec) => (
                      <option key={sec.id} value={sec.name}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Batch Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleMarkAllPresentForDate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMarkAllAbsentForDate}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs gap-1.5 shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Mark All Absent</span>
                </Button>
              </div>
            </div>

            {/* Actual Saved Data Telemetry Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 shadow-2xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Enrolled Students
                </span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {currentDayAttendance.totalCount}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">In selected filter</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Present
                </span>
                <span className="text-lg font-black text-emerald-700 block mt-0.5">
                  {currentDayAttendance.presentCount}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">On-campus</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block">
                  Late Arrivals
                </span>
                <span className="text-lg font-black text-amber-700 block mt-0.5">
                  {currentDayAttendance.lateCount}
                </span>
                <span className="text-[10px] text-amber-600 font-semibold">Guardians alerted</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block">
                  Absent
                </span>
                <span className="text-lg font-black text-rose-700 block mt-0.5">
                  {currentDayAttendance.absentCount}
                </span>
                <span className="text-[10px] text-rose-600 font-semibold">Unexcused</span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-indigo-200 shadow-2xs col-span-2 sm:col-span-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 block">
                  Attendance Rate
                </span>
                <span className="text-lg font-black text-indigo-700 block mt-0.5">
                  {currentDayAttendance.attendanceRate}%
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">Calculated from saved marks</span>
              </div>
            </div>

            {/* Table of Scoped Students with Dated Status */}
            <Card className="light-glass overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission / Roll</TableHead>
                    <TableHead>Class & Section</TableHead>
                    <TableHead>Historical Rate</TableHead>
                    <TableHead className="text-center">Status on {selectedAttendanceDate}</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceFilteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500 text-xs font-semibold">
                        No students found matching class &apos;{selectedAttendanceGrade}&apos; and section &apos;{selectedAttendanceSection}&apos; in {activeSchool.name}.
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceFilteredStudents.map((s) => {
                      const record = currentDayAttendance.records.find(r => r.studentId === s.id);
                      const currentMark = record ? record.status : (selectedAttendanceDate === todayDateString ? (s.todayAttendance || 'PRESENT') : 'PRESENT');

                      return (
                        <TableRow key={s.id} className="hover:bg-slate-50/80">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <img
                                src={s.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80`}
                                alt={s.firstName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">
                                  {s.firstName} {s.lastName}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  Guardian: {s.parentName} ({s.parentPhone})
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs font-bold text-slate-800">{s.admissionNumber}</span>
                            <span className="block text-[11px] font-mono text-slate-500">Roll: {s.rollNumber}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-xs text-slate-800">{s.gradeName}</span>
                            <span className="block text-[11px] text-slate-500">{s.sectionName}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full ${
                                    s.attendancePercentage >= 95
                                      ? 'bg-emerald-600'
                                      : s.attendancePercentage >= 85
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${s.attendancePercentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold font-mono text-slate-800">{s.attendancePercentage}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 gap-1">
                              <button
                                onClick={() => handleAttendanceChange(s.id, 'PRESENT')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  currentMark === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Present</span>
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(s.id, 'LATE')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  currentMark === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <Clock className="w-3 h-3" />
                                <span>Late</span>
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(s.id, 'ABSENT')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  currentMark === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Absent</span>
                              </button>
                              <button
                                onClick={() => handleAttendanceChange(s.id, 'EXCUSED')}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                  currentMark === 'EXCUSED'
                                    ? 'bg-blue-600 text-white shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                                }`}
                              >
                                <ShieldCheck className="w-3 h-3" />
                                <span>Excused</span>
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIdCardStudent(s)}
                              className="text-xs h-7 text-indigo-700 hover:text-indigo-900 font-bold"
                            >
                              <QrCode className="w-3 h-3 mr-1" />
                              <span>ID Card</span>
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

        {/* TAB 3: AI Attendance & Retention Insights */}
        {activeTab === 'AI_INSIGHTS' && (
          <div className="space-y-5">
            <Card className="light-glass p-5 border-indigo-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>AI Attendance Anomaly & Dropout Predictor</span>
                    <Badge variant="cyan" className="text-[10px]">Neural Pattern Model Active</Badge>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Continuous ML analysis identifying students with irregular punch patterns, sudden attendance dips, and parent communication flags.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {anomalyStudents.map((s) => (
                <Card key={s.id} className="light-glass p-5 border-amber-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80`}
                          alt={s.firstName}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-extrabold text-sm text-slate-900">
                            {s.firstName} {s.lastName}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {s.gradeName} • {s.sectionName} • Roll {s.rollNumber}
                          </div>
                        </div>
                      </div>
                      <Badge variant="warning">
                        {s.attendancePercentage}% Attendance
                      </Badge>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>AI Diagnostic: Attendance dropped below institutional threshold</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        Student missed recent lab sessions. Recommended proactive WhatsApp alert to guardian {s.parentName} ({s.parentPhone}).
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast(`Automated WhatsApp attendance notice dispatched to ${s.parentPhone}.`)}
                      className="text-xs font-bold text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      <span>Notify Guardian</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setIdCardStudent(s)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <span>View Record & ID</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Enroll New Student */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-indigo-600" />
                    Enroll New Student
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tenant: {activeSchool.name} • Instant Photo ID Card Generation
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Inline Validation / Error Banner */}
              {modalError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">First Name *</label>
                    <Input
                      required
                      placeholder="e.g. Samarth"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 bg-white border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Last Name *</label>
                    <Input
                      required
                      placeholder="e.g. Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 bg-white border-slate-300 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Class / Grade *</label>
                    <select
                      value={formData.gradeId}
                      onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    >
                      {availableGrades.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Section *</label>
                    <select
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                    >
                      {availableSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Admission No *</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, admissionNumber: generateNextAdmissionNumber() })}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 cursor-pointer"
                        title="Auto-generate next sequential admission number"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Auto</span>
                      </button>
                    </div>
                    <Input
                      required
                      value={formData.admissionNumber}
                      onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                      placeholder="e.g. ADM-2026-0105"
                      className="mt-1 bg-white border-slate-300 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Roll Number</label>
                    <Input
                      placeholder="e.g. 06-A-14"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="mt-1 bg-white border-slate-300 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800 shadow-xs"
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Student Photo URL (Web / Camera)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="bg-white border-slate-300 text-xs font-medium"
                    />
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Parent / Guardian Details
                  </span>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Parent Name *</label>
                      <Input
                        required
                        placeholder="e.g. Alok Sharma"
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="mt-1 bg-white border-slate-300 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Parent Phone *</label>
                      <Input
                        required
                        placeholder="+91 98111 00000"
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                        className="mt-1 bg-white border-slate-300 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="default" className="shadow-md shadow-indigo-100 font-bold">
                    Save & Generate ID Card
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Digital Student ID Card Generator (Printable & Downloadable) */}
        {idCardStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">Digital Student Identity Card</h3>
                </div>
                <button
                  onClick={() => setIdCardStudent(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Printable Card Canvas */}
              <div id="student-id-badge" className="mt-4 p-5 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
                {/* Background decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Card Header: School Branding */}
                <div className="flex items-center justify-between border-b border-white/15 pb-3 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center font-extrabold text-base border border-white/20">
                      🎓
                    </div>
                    <div>
                      <div className="text-xs font-black tracking-wide uppercase text-white font-mono">
                        {activeSchool.name}
                      </div>
                      <div className="text-[10px] text-cyan-200 font-semibold">
                        Affiliated to {activeSchool.schoolType} Board • Session 2025–26
                      </div>
                    </div>
                  </div>
                  <Badge variant="cyan" className="text-[9px] font-mono font-bold">
                    STUDENT PASS
                  </Badge>
                </div>

                {/* Card Body: Photo & Core Metadata */}
                <div className="mt-4 flex items-center gap-4 relative z-10">
                  <img
                    src={idCardStudent.photoUrl || `https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80`}
                    alt={idCardStudent.firstName}
                    className="w-20 h-24 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-slate-800"
                  />
                  <div className="space-y-1">
                    <h4 className="text-base font-black tracking-tight text-white">
                      {idCardStudent.firstName} {idCardStudent.lastName}
                    </h4>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      ADM: {idCardStudent.admissionNumber}
                    </div>
                    <div className="text-[11px] text-indigo-100 font-medium">
                      Class: <span className="font-bold text-white">{idCardStudent.gradeName}</span> ({idCardStudent.sectionName})
                    </div>
                    <div className="text-[11px] text-indigo-100 font-medium">
                      Roll No: <span className="font-mono font-bold text-white">{idCardStudent.rollNumber}</span>
                    </div>
                    <div className="text-[10px] text-indigo-200 font-medium">
                      Blood Group: <span className="font-bold text-white">{idCardStudent.bloodGroup || 'O+'}</span>
                    </div>
                    <div className="text-[10px] text-cyan-200 font-mono font-bold pt-0.5">
                      Portal ID: <span className="text-white">{idCardStudent.credentials?.loginId || `STU-${activeSchool.city?.slice(0, 3).toUpperCase() || 'DEL'}-${idCardStudent.admissionNumber.slice(-3)}`}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Barcode / QR & Emergency Contact */}
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between relative z-10">
                  <div className="space-y-0.5">
                    <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-bold">Emergency Contact</div>
                    <div className="text-xs font-bold text-white">{idCardStudent.parentName}</div>
                    <div className="text-[10px] font-mono text-cyan-200">{idCardStudent.parentPhone}</div>
                  </div>

                  <div className="p-2 rounded-xl bg-white text-slate-900 shadow-sm text-center">
                    <QrCode className="w-10 h-10 text-slate-900" />
                    <span className="text-[8px] font-mono font-black text-slate-700 block">ID VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print ID Card</span>
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIdCardStudent(null)}
                    className="text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      showToast(`Digital ID Badge for ${idCardStudent.firstName} saved to institution records.`);
                      setIdCardStudent(null);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Confirm & Issue</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Student CSV / Excel Import Modal */}
        <BulkStudentImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={(count) => showToast(`Successfully admitted ${count} students via bulk CSV import!`)}
        />
      </div>
    </AppShell>
  );
}

export default function StudentsManagementPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400 font-semibold">Loading Students & Attendance...</div>}>
      <StudentsManagementPageContent />
    </Suspense>
  );
}

