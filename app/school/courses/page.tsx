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
  GraduationCap
} from 'lucide-react';

export default function SchoolCoursesEnrollmentPage() {
  const { 
    activeSchool, 
    courses, 
    students, 
    enrollments, 
    batches, 
    bulkEnrollStudents, 
    updateStudentLearningProgress 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'catalog' | 'monitor' | 'batches'>('catalog');
  
  // Bulk Enrollment Modal State
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState<Course | null>(null);
  const [targetGrade, setTargetGrade] = useState<string>('Class 6');
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollSuccessBatch, setEnrollSuccessBatch] = useState<BulkEnrollmentBatch | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  
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

  const calculatedBilling = selectedCourseForEnroll
    ? unenrolledEligibleStudents.length * (selectedCourseForEnroll.pricePerStudent || 999)
    : 0;

  // Handle 1-Click Bulk Enrollment
  const handleConfirmEnrollment = () => {
    if (!selectedCourseForEnroll) return;
    try {
      const result = bulkEnrollStudents(selectedCourseForEnroll.id, targetGrade);
      setIsEnrollModalOpen(false);
      setEnrollSuccessBatch(result.batch);
      setNoticeMessage(`Enrolled ${result.enrolledCount} students in "${selectedCourseForEnroll.title}". Credentials generated.`);
      setTimeout(() => setNoticeMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    }
  };

  // Download Credentials as CSV
  const handleDownloadCSV = (batch: BulkEnrollmentBatch) => {
    const headers = ['Student Name', 'Admission No', 'Class', 'Login ID', 'Password', 'Course', 'School'];
    const rows = batch.studentCredentials.map(c => [
      `"${c.studentName}"`,
      `"${c.admissionNumber}"`,
      `"${c.gradeName}"`,
      `"${c.loginId}"`,
      `"${c.password}"`,
      `"${batch.courseTitle}"`,
      `"${batch.schoolName}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Student_Credentials_${batch.courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${batch.targetGrade}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy all credentials to clipboard
  const handleCopyAll = (batch: BulkEnrollmentBatch) => {
    const text = batch.studentCredentials
      .map((c, i) => `${i + 1}. ${c.studentName} (${c.gradeName}) | ID: ${c.loginId} | Password: ${c.password}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
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

                  {/* 1-Click Enroll CTA */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setSelectedCourseForEnroll(course);
                        setIsEnrollModalOpen(true);
                      }}
                      className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
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
                      <th className="pb-3 pl-2">Student & Credentials</th>
                      <th className="pb-3">Course</th>
                      <th className="pb-3">Current Module</th>
                      <th className="pb-3">Progress</th>
                      <th className="pb-3">Quiz Score</th>
                      <th className="pb-3">Last Active</th>
                      <th className="pb-3 pr-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredEnrollments.map((enr) => (
                      <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pl-2">
                          <div className="font-bold text-slate-900">{enr.studentName}</div>
                          <div className="text-[11px] text-slate-500">
                            {enr.gradeName} - Section {enr.sectionName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                            <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                              {enr.studentLoginId}
                            </span>
                            <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                              {enr.generatedPassword}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5">
                          <div className="font-semibold text-slate-800">{enr.courseTitle}</div>
                          <div className="text-[11px] text-slate-500">
                            {enr.completedLessons} / {enr.totalLessons} lessons
                          </div>
                        </td>

                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800">
                            {enr.currentModule}
                          </span>
                        </td>

                        <td className="py-3.5 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  enr.progressPercentage >= 100
                                    ? 'bg-emerald-500'
                                    : enr.progressPercentage >= 60
                                    ? 'bg-indigo-600'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${enr.progressPercentage}%` }}
                              />
                            </div>
                            <span className="font-bold text-xs text-slate-900">
                              {enr.progressPercentage}%
                            </span>
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
                    ))}
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
                            <span>PW: <strong className="text-slate-700">{cred.password}</strong></span>
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

        {/* Modal: Generated Credentials */}
        {enrollSuccessBatch && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {enrollSuccessBatch.totalEnrolled} Students Enrolled!
                      </h3>
                      <p className="text-xs text-slate-500">
                        {enrollSuccessBatch.courseTitle} • {enrollSuccessBatch.targetGrade}
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

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">
                    Generated student login IDs and passwords:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyAll(enrollSuccessBatch)}
                      className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedAll ? 'Copied ✓' : 'Copy All'}</span>
                    </button>
                    <button
                      onClick={() => handleDownloadCSV(enrollSuccessBatch)}
                      className="btn-3d-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>

                {/* Student Credentials List */}
                <div className="mt-3 overflow-y-auto max-h-[42vh] pr-1 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {enrollSuccessBatch.studentCredentials.map((cred, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span className="truncate">{cred.studentName}</span>
                          <span className="text-[10px] text-slate-500 font-normal">{cred.gradeName}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 mt-1 border-t border-slate-200/60 font-mono">
                          <span className="text-indigo-700 font-semibold">{cred.loginId}</span>
                          <span className="text-slate-700">{cred.password}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
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

      </div>
    </AppShell>
  );
}
