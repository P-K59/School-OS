"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Course, BulkEnrollmentBatch } from '@/lib/types';
import { Card } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Download,
  Copy,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  Key,
  Search,
  Check,
  X,
  GraduationCap,
  AlertCircle,
  RotateCw,
  ShieldCheck
} from 'lucide-react';

export default function SchoolCoursesEnrollmentPage() {
  const { 
    activeSchool, 
    courses, 
    students, 
    enrollments, 
    batches, 
    bulkEnrollStudents, 
    updateStudentLearningProgress,
    resolveCoursePrice
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'catalog' | 'monitor' | 'batches'>('catalog');
  
  // Bulk Enrollment Modal State
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [targetGrade, setTargetGrade] = useState<string>('Class 6');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollSuccessBatch, setEnrollSuccessBatch] = useState<BulkEnrollmentBatch | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [viewingScheduleCourse, setViewingScheduleCourse] = useState<Course | null>(null);
  
  // Filter & Search in Monitor Table
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Calculate eligible students for modal preview
  const eligibleStudents = selectedCourseForEnroll
    ? targetGrade === 'ALL'
      ? students
      : students.filter(s => s.gradeName === targetGrade || s.gradeName.includes(targetGrade))
    : [];
    
  const unenrolledEligibleStudents = selectedCourseForEnroll
    ? eligibleStudents.filter(s => !enrollments.some(e => e.studentId === s.id && e.courseId === selectedCourseForEnroll.id))
    : [];

  // Deterministic pricing resolution through central rules engine
  const pricingResolution = selectedCourseForEnroll
    ? resolveCoursePrice(selectedCourseForEnroll.id, activeSchool.id, activeSchool.academicSession, targetGrade)
    : null;
  const unitPrice = pricingResolution ? pricingResolution.price : (selectedCourseForEnroll?.pricePerStudent ?? 0);
  const discountPercent = pricingResolution?.discountPercent || 0;
  const isFreeCourse = Boolean(selectedCourseForEnroll?.isFreeCourse || unitPrice === 0);
  const finalUnitPrice = isFreeCourse ? 0 : Math.round(unitPrice * (1 - discountPercent / 100));
  const calculatedBilling = unenrolledEligibleStudents.length * finalUnitPrice;

  // Handle 1-Click Bulk Enrollment
  const handleConfirmEnrollment = () => {
    if (!selectedCourseForEnroll) return;
    try {
      const result = bulkEnrollStudents(selectedCourseForEnroll.id, targetGrade);
      setIsEnrollModalOpen(false);
      setEnrollSuccessBatch(result.batch);
      setNoticeMessage(`Enrolled ${result.enrolledCount} students in "${selectedCourseForEnroll.title}". Credentials and activation tokens generated.`);
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    }
  };

  // Download Activation Roster as CSV (Never plaintext passwords)
  const handleDownloadCSV = (batch: BulkEnrollmentBatch) => {
    const headers = ['Student Name', 'Student ID', 'Class', 'Account Status', 'Enrollment Result', 'Course', 'School'];
    const records = batch.enrolledStudentsResults || batch.studentCredentials.map(c => ({
      studentName: c.studentName,
      studentId: c.admissionNumber,
      className: c.gradeName,
      accountStatus: c.accountStatus || 'ACTIVATION_PENDING',
      result: 'SUCCESS' as const,
      reason: ''
    }));

    const rows = records.map(r => [
      `"${r.studentName}"`,
      `"${r.studentId}"`,
      `"${r.className}"`,
      `"${r.accountStatus}"`,
      `"${r.result}"`,
      `"${batch.courseTitle}"`,
      `"${batch.schoolName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enrollment_Roster_${batch.courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${batch.targetGrade}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Activation Summary to clipboard
  const handleCopyAll = (batch: BulkEnrollmentBatch) => {
    const records = batch.enrolledStudentsResults || [];
    const text = records
      .map((r, i) => `${i + 1}. ${r.studentName} (${r.className}) | Student ID: ${r.studentId} | Status: ${r.accountStatus}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  // Retry enrollment for failed records
  const handleRetryStudent = (record: any) => {
    if (!enrollSuccessBatch) return;
    try {
      const res = bulkEnrollStudents(enrollSuccessBatch.courseId, 'ALL', [record.studentId]);
      if (res.batch?.enrolledStudentsResults) {
        setEnrollSuccessBatch(prev => {
          if (!prev) return null;
          const updated = (prev.enrolledStudentsResults || []).map(r => 
            r.studentId === record.studentId ? (res.batch.enrolledStudentsResults?.[0] || r) : r
          );
          return { ...prev, enrolledStudentsResults: updated, totalEnrolled: prev.totalEnrolled + 1 };
        });
      }
    } catch (err: any) {
      alert(err.message || 'Retry failed');
    }
  };

  // Filtered enrollments for monitor
  const filteredEnrollments = enrollments.filter(enr => {
    const matchesQuery = 
      enr.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.studentLoginId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = courseFilter === 'ALL' || enr.courseId === courseFilter;
    const matchesStatus = statusFilter === 'ALL' || enr.status === statusFilter;
    return matchesQuery && matchesCourse && matchesStatus;
  });

  const avgCompletionRate = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progressPercentage, 0) / enrollments.length)
    : 0;

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
              Courses & Bulk Enrollment
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('monitor')}
              className="btn-3d-secondary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Student Progress</span>
            </button>
            <button
              onClick={() => {
                setSelectedCourseForEnroll(courses[0]);
                setIsEnrollModalOpen(true);
              }}
              className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>1-Click Bulk Enroll</span>
            </button>
          </div>
        </div>

        {/* Notice alert */}
        {noticeMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{noticeMessage}</span>
            </div>
            <button onClick={() => setNoticeMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Clean Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Enrolled Students</span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {enrollments.length}
            </div>
            <div className="text-xs font-semibold text-indigo-600 mt-1">
              Across {batches.length} Batches
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Average Progress</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {avgCompletionRate}%
            </div>
            <div className="text-xs font-semibold text-purple-600 mt-1">
              Curriculum Delivered
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Completed</span>
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {enrollments.filter(e => e.status === 'COMPLETED').length}
            </div>
            <div className="text-xs font-semibold text-emerald-600 mt-1">
              Finished Curriculum
            </div>
          </div>

          <div className="card-3d rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
              <span>Courses Available</span>
              <BookOpen className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {courses.length}
            </div>
            <div className="text-xs font-semibold text-cyan-600 mt-1">
              Registered by Admin
            </div>
          </div>
        </div>

        {/* Clean Segmented Tab Navigation */}
        <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-slate-200/60">
          {[
            { id: 'catalog', label: `Courses (${courses.length})`, icon: BookOpen },
            { id: 'monitor', label: `Student Progress (${enrollments.length})`, icon: Sparkles },
            { id: 'batches', label: `Enrollment Batches (${batches.length})`, icon: Key },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'btn-3d-secondary bg-white text-slate-900 font-bold border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Course Catalog */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in">
            {courses.map(course => {
              const enrolledCount = enrollments.filter(e => e.courseId === course.id).length;
              const price = course.pricePerStudent || 999;

              return (
                <Card key={course.id} className="card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
                  <div>
                    {/* Category & Eligibility */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          course.category === 'Coding' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          course.category === 'Robotics' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                          course.category === 'AI' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {course.category}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Grades {course.minGrade}–{course.maxGrade}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-slate-500">
                        {course.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-2">{course.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                      {course.description}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                      <span><strong className="text-slate-800">{course.totalModules}</strong> Modules</span>
                      <span>•</span>
                      <span><strong className="text-slate-800">{course.totalLessons}</strong> Lessons</span>
                    </div>

                    {/* Price and Enrolled Stats */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Price per Seat
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-xl font-extrabold text-slate-900">
                            ₹{price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-500">/ student</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Enrolled
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {enrolledCount} Students
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Enroll & Schedule Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingScheduleCourse(course)}
                      className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-slate-700"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>30 Lectures & Schedule</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCourseForEnroll(course);
                        setIsEnrollModalOpen(true);
                      }}
                      className="btn-3d-primary px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Bulk Enroll</span>
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* TAB 2: Student Learning Progress */}
        {activeTab === 'monitor' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Student Learning Progress</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live course progress and lesson completions.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-[180px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search student or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Courses ({courses.length})</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ACTIVE">New</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredEnrollments.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No enrolled students found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pl-2">Student & Account</th>
                      <th className="pb-3">Course</th>
                      <th className="pb-3">Active Lecture</th>
                      <th className="pb-3">Progress (30 Lec)</th>
                      <th className="pb-3">Quiz Avg</th>
                      <th className="pb-3">Last Active</th>
                      <th className="pb-3 pr-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredEnrollments.map((enr) => {
                      const activeLec = enr.activeLectureNumber || Math.min(30, Math.max(1, Math.floor((enr.completedLessons || 0) + 1)));
                      const isBehind = enr.progressPercentage < 15;
                      const isCompleted = enr.status === 'COMPLETED' || enr.progressPercentage >= 100;

                      return (
                        <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 pl-2">
                            <div className="font-bold text-slate-900">{enr.studentName}</div>
                            <div className="text-[11px] text-slate-500">
                              {enr.gradeName} - Section {enr.sectionName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                              <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold" title="Student Login ID">
                                {enr.studentLoginId}
                              </span>
                              <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-widest text-[9px]" title="Cryptographically Secured Hash">
                                ••••••••
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5">
                            <div className="font-semibold text-slate-800">{enr.courseTitle}</div>
                            <div className="text-[11px] text-slate-500">
                              {enr.completedLessons} / 30 lectures completed
                            </div>
                          </td>

                          <td className="py-3.5">
                            <div className="flex flex-col gap-0.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 w-fit">
                                Lecture {activeLec}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {enr.currentModule || `Unit ${Math.floor((activeLec - 1) / 5) + 1}`}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isCompleted
                                      ? 'bg-emerald-500'
                                      : enr.progressPercentage >= 50
                                      ? 'bg-indigo-600'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${enr.progressPercentage}%` }}
                                />
                              </div>
                              <span className="font-bold text-xs text-slate-900">
                                {enr.progressPercentage}%
                              </span>
                              {isBehind ? (
                                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                                  Behind
                                </span>
                              ) : isCompleted ? (
                                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  Done
                                </span>
                              ) : (
                                <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-indigo-50 text-indigo-600 border border-indigo-200">
                                  On Track
                                </span>
                              )}
                            </div>
                          </td>

                        <td className="py-3.5 font-bold text-slate-900">
                          {enr.quizScoreAverage > 0 ? `${enr.quizScoreAverage}%` : '—'}
                        </td>

                        <td className="py-3.5 text-slate-500 text-[11px]">
                          {enr.lastActiveAt}
                        </td>

                        <td className="py-3.5 pr-2 text-right">
                          <button
                            onClick={() => {
                              updateStudentLearningProgress(enr.id, 1, Math.min(100, (enr.quizScoreAverage || 80) + 3));
                              setNoticeMessage(`Lesson updated for ${enr.studentName}`);
                              setTimeout(() => setNoticeMessage(null), 3000);
                            }}
                            className="btn-3d-secondary px-2.5 py-1 rounded-lg text-[11px] font-bold text-indigo-700"
                            title="Simulate +1 lesson progress"
                          >
                            + 1 Lesson
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Enrollment Batches */}
        {activeTab === 'batches' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4 animate-in fade-in">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <span>Enrollment Batches & Passwords</span>
              </h2>
            </div>

            {batches.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No enrollment batches yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {batches.map(batch => (
                  <div key={batch.id} className="card-3d rounded-2xl p-5 bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{batch.courseTitle}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                            {batch.targetGrade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Enrolled on {new Date(batch.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyAll(batch)}
                          className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedAll ? 'Copied ✓' : 'Copy All'}</span>
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(batch)}
                          className="btn-3d-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download CSV</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Students</span>
                        <span className="font-extrabold text-slate-900 text-base">{batch.totalEnrolled}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Rate</span>
                        <span className="font-extrabold text-slate-900 text-base">₹{batch.pricePerStudent} / seat</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">Total Billing</span>
                        <span className="font-extrabold text-emerald-700 text-base">₹{batch.totalBilling.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Compact student credentials preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      {batch.studentCredentials.slice(0, 6).map((cred, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <div className="font-bold text-slate-900 truncate">{cred.studentName}</div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 font-mono">
                            <span>ID: <strong className="text-indigo-700">{cred.loginId}</strong></span>
                            <span className="text-slate-400">PW: ••••••••</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modal: 1-Click Bulk Enrollment */}
        {isEnrollModalOpen && selectedCourseForEnroll && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Bulk Enroll: {selectedCourseForEnroll.title}
                </h3>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Course summary */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{selectedCourseForEnroll.category}</span>
                  <div className="text-[11px] text-slate-500">
                    {selectedCourseForEnroll.totalModules} Modules • {selectedCourseForEnroll.totalLessons} Lessons
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registered Rate</span>
                  <span className="font-extrabold text-indigo-700 text-sm">
                    ₹{(selectedCourseForEnroll.pricePerStudent || 999).toLocaleString('en-IN')} / seat
                  </span>
                </div>
              </div>

              {/* Class Selection Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Target Class *
                  </label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="ALL">All Students</option>
                  </select>
                </div>

                {/* Calculation box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Students in {targetGrade}:</span>
                    <span className="font-bold text-slate-900">{eligibleStudents.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>New Students to Enroll:</span>
                    <span className="font-bold text-indigo-600">{unenrolledEligibleStudents.length}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Total Billing:</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      ₹{calculatedBilling.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEnrollment}
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Enroll All Students</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Bulk Enrollment Activation & Provisioning Results Table */}
        {enrollSuccessBatch && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Bulk Enrollment Completed: {enrollSuccessBatch.totalEnrolled} Students Enrolled
                      </h3>
                      <p className="text-xs text-slate-500">
                        {enrollSuccessBatch.courseTitle} • {enrollSuccessBatch.targetGrade} • School: {enrollSuccessBatch.schoolName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEnrollSuccessBatch(null)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Enrolled: {enrollSuccessBatch.totalEnrolled}
                    </span>
                    {enrollSuccessBatch.failedCount ? (
                      <span className="px-2.5 py-1 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Failed: {enrollSuccessBatch.failedCount}
                      </span>
                    ) : null}
                    <span className="text-slate-500">
                      Total Billed: <strong className="text-slate-800">₹{enrollSuccessBatch.totalBilling.toLocaleString('en-IN')}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAll(enrollSuccessBatch)}
                      className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedAll ? 'Copied ✓' : 'Copy Summary'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCSV(enrollSuccessBatch)}
                      className="btn-3d-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Roster CSV</span>
                    </button>
                  </div>
                </div>

                {/* Table: | Student Name | Student ID | Class | Account Status | Result | */}
                <div className="mt-3 overflow-y-auto max-h-[46vh] border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Student ID</th>
                        <th className="py-2.5 px-3">Class</th>
                        <th className="py-2.5 px-3">Account Status</th>
                        <th className="py-2.5 px-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(enrollSuccessBatch.enrolledStudentsResults || enrollSuccessBatch.studentCredentials.map(c => ({
                        studentName: c.studentName,
                        studentId: c.admissionNumber,
                        admissionNumber: c.admissionNumber,
                        className: c.gradeName,
                        accountStatus: c.accountStatus || 'ACTIVATION_PENDING',
                        result: 'SUCCESS' as const,
                        reason: undefined
                      }))).map((record: any, idx: number) => {
                        const isSuccess = record.result === 'SUCCESS';
                        const isActivationPending = record.accountStatus === 'ACTIVATION_PENDING';
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {record.studentName}
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-700">
                              {record.admissionNumber || record.studentId}
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              {record.className}
                            </td>
                            <td className="py-2 px-3">
                              {isActivationPending ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3" />
                                  <span>ACTIVATION_PENDING</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>{record.accountStatus || 'ACTIVE'}</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              {isSuccess ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                  <Check className="w-3 h-3" />
                                  <span>SUCCESS</span>
                                </span>
                              ) : (
                                <div className="inline-flex items-center justify-end gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800" title={record.reason}>
                                    <AlertCircle className="w-3 h-3" />
                                    <span>FAILED</span>
                                  </span>
                                  {record.reason && (
                                    <span className="text-[10px] text-slate-400 max-w-[120px] truncate" title={record.reason}>
                                      {record.reason}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRetryStudent(record)}
                                    className="p-1 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                                    title="Retry Enrollment"
                                  >
                                    <RotateCw className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Passwords are cryptographically secured and sent via encrypted activation links. Plaintext credentials are never displayed in public logs.
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Batch Reference: {enrollSuccessBatch.id}
                </span>
                <button
                  onClick={() => {
                    setEnrollSuccessBatch(null);
                    setActiveTab('monitor');
                  }}
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold"
                >
                  View Student Progress →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: School Admin 30-Lecture Curriculum & Schedule Viewer */}
        {viewingScheduleCourse && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Grades {viewingScheduleCourse.minGrade}–{viewingScheduleCourse.maxGrade}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      30 Lectures Configured
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Policy: {viewingScheduleCourse.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {viewingScheduleCourse.title} — 30-Lecture Curriculum & Schedule
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class-wise automated learning schedule configured by Super Admin with Google Drive video streaming, quizzes and games.
                  </p>
                </div>
                <button
                  onClick={() => setViewingScheduleCourse(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Schedule list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
                {(viewingScheduleCourse.curriculumLectures && viewingScheduleCourse.curriculumLectures.length > 0
                  ? viewingScheduleCourse.curriculumLectures
                  : Array.from({ length: 30 }, (_, i) => ({
                      id: `lec-${i + 1}`,
                      lectureNumber: i + 1,
                      title: `Lecture ${i + 1}: ${viewingScheduleCourse.category} Mission ${i + 1}`,
                      moduleName: `Unit ${Math.floor(i / 5) + 1}`,
                      durationMinutes: 15,
                      xpReward: 50,
                      quiz: { passingPercentage: 70, questions: [{}, {}, {}] },
                      game: { gameType: i % 2 === 0 ? 'HARDWARE_MATCH' : 'CODING_SEQUENCE' }
                    }))
                ).map((lec: any) => (
                  <div
                    key={lec.id || lec.lectureNumber}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-indigo-50/30 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        #{lec.lectureNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {lec.title}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {lec.moduleName}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                          <span>⏱ {lec.durationMinutes || 15} mins video</span>
                          <span>•</span>
                          <span>📝 Quiz (3 Questions, 70% Pass)</span>
                          <span>•</span>
                          <span>🎮 Game ({lec.game?.gameType?.replace(/_/g, ' ') || 'Interactive Activity'})</span>
                          <span>•</span>
                          <span className="font-bold text-amber-600">⚡ {lec.xpReward || 50} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        <Clock className="w-3 h-3 text-indigo-500" />
                        <span>Day {lec.lectureNumber} Schedule</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Full 30-lecture sequence protected by sequential unlock and daily release policy.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingScheduleCourse(null)}
                    className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const courseToEnroll = viewingScheduleCourse;
                      setViewingScheduleCourse(null);
                      setSelectedCourseForEnroll(courseToEnroll);
                      setIsEnrollModalOpen(true);
                    }}
                    className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Assign / Enroll Students</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
