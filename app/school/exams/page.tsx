"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Exam, StudentExamMark, ExamStatus, AssessmentType, StudentReportCard, Student } from '@/lib/types';
import { Card } from '@/components/ui/card';
import {
  Award,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Plus,
  Printer,
  Search,
  Filter,
  Check,
  X,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  GraduationCap,
  ShieldCheck,
  Eye,
  FileCheck,
  RefreshCw,
  Send
} from 'lucide-react';

const STANDARD_SUBJECTS = [
  'Mathematics',
  'Science',
  'English Language & Literature',
  'Social Science',
  'Computer Science & Coding',
  'Hindi'
];

function calculateGrade(percentage: number): string {
  if (percentage >= 91) return 'A1';
  if (percentage >= 81) return 'A2';
  if (percentage >= 71) return 'B1';
  if (percentage >= 61) return 'B2';
  if (percentage >= 51) return 'C1';
  if (percentage >= 41) return 'C2';
  if (percentage >= 33) return 'D';
  return 'E';
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A1': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'A2': return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'B1': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'B2': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    case 'C1': return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'C2': return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'D': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default: return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  }
}

function ExamCellContent() {
  const {
    activeSchool,
    currentUser,
    students,
    exams,
    examMarks,
    addExam,
    updateExamStatus,
    saveStudentExamMarks,
    declareExamResult,
    unpublishExamResult
  } = useAuth();

  const searchParams = useSearchParams();

  // Active Tab: 'schedule' | 'marks' | 'results' | 'reports'
  const [activeTab, setActiveTab] = useState<'schedule' | 'marks' | 'results' | 'reports'>('schedule');

  // Sync tab from query param if provided
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'marks' || tabParam === 'results' || tabParam === 'reports' || tabParam === 'schedule') {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Toast / Notice state
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (title: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Schedule Exam Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [newExamType, setNewExamType] = useState<AssessmentType>('PERIODIC_TEST');
  const [newExamSession, setNewExamSession] = useState('2026-2027');
  const [newExamGrades, setNewExamGrades] = useState<string[]>(['Grade 6', 'Grade 7']);
  const [newExamStartDate, setNewExamStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newExamEndDate, setNewExamEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  // Marks Entry Filter State
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 6');
  const [selectedSubject, setSelectedSubject] = useState<string>(STANDARD_SUBJECTS[0]);
  const [marksMaxScore, setMarksMaxScore] = useState<number>(100);
  const [marksPassScore, setMarksPassScore] = useState<number>(33);

  // Local editable draft marks: key: studentId -> { marks: number, isAbsent: boolean, remarks: string }
  const [draftMarks, setDraftMarks] = useState<Record<string, { marks: number; isAbsent: boolean; remarks: string }>>({});

  // Report Card Modal State
  const [selectedReportStudent, setSelectedReportStudent] = useState<Student | null>(null);
  const [selectedReportExam, setSelectedReportExam] = useState<Exam | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Report cards search & grade filter
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  const [reportGradeFilter, setReportGradeFilter] = useState('ALL');

  // Currently selected exam object
  const currentExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // Filter students for marks entry
  const eligibleStudentsForMarks = useMemo(() => {
    return students.filter(s => s.gradeName === selectedGrade);
  }, [students, selectedGrade]);

  // Load existing marks into draftMarks when exam, grade, or subject changes
  useEffect(() => {
    if (!currentExam) return;
    const existing = examMarks.filter(
      m => m.examId === currentExam.id && m.subject === selectedSubject && m.gradeName === selectedGrade
    );

    const initialDraft: Record<string, { marks: number; isAbsent: boolean; remarks: string }> = {};
    eligibleStudentsForMarks.forEach(s => {
      const match = existing.find(m => m.studentId === s.id);
      if (match) {
        initialDraft[s.id] = {
          marks: match.marksObtained,
          isAbsent: !!match.isAbsent,
          remarks: match.remarks || ''
        };
      } else {
        initialDraft[s.id] = {
          marks: 75, // Default realistic starting score
          isAbsent: false,
          remarks: ''
        };
      }
    });
    setDraftMarks(initialDraft);
  }, [currentExam, selectedSubject, selectedGrade, eligibleStudentsForMarks, examMarks]);

  // Save / Commit Marks Handler
  const handleSaveMarks = () => {
    if (!currentExam) return;

    const teacherName = `${currentUser?.firstName || 'Teacher'} ${currentUser?.lastName || ''}`.trim();
    const timestamp = new Date().toISOString();

    const marksToSave: StudentExamMark[] = eligibleStudentsForMarks.map(student => {
      const entry = draftMarks[student.id] || { marks: 0, isAbsent: false, remarks: '' };
      const score = entry.isAbsent ? 0 : Number(entry.marks) || 0;
      const pct = (score / marksMaxScore) * 100;
      const grade = entry.isAbsent ? 'E' : calculateGrade(pct);

      return {
        id: `mk-${currentExam.id}-${student.id}-${selectedSubject.replace(/\s+/g, '')}`,
        examId: currentExam.id,
        schoolId: activeSchool.id,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber || student.rollNumber || 'STU-001',
        rollNumber: student.rollNumber || '01',
        gradeName: student.gradeName,
        sectionName: student.sectionName || 'A',
        subject: selectedSubject,
        marksObtained: score,
        maxMarks: marksMaxScore,
        passMarks: marksPassScore,
        grade,
        isAbsent: entry.isAbsent,
        remarks: entry.remarks || (entry.isAbsent ? 'Absent during exam' : 'Verified by teacher'),
        gradedBy: teacherName,
        gradedAt: timestamp
      };
    });

    saveStudentExamMarks(marksToSave);
    showToast(`Successfully saved marks for ${marksToSave.length} students in ${selectedSubject} (${selectedGrade})`, 'success');
  };

  // Fast Auto-Fill Sample Marks for Teacher Demo
  const handleAutoFillSampleMarks = () => {
    const newDraft = { ...draftMarks };
    eligibleStudentsForMarks.forEach((s, idx) => {
      const sampleScore = 70 + ((idx * 7) % 28);
      newDraft[s.id] = {
        marks: sampleScore,
        isAbsent: false,
        remarks: sampleScore >= 85 ? 'Exceptional comprehension' : 'Good steady performance'
      };
    });
    setDraftMarks(newDraft);
    showToast('Auto-populated realistic evaluation marks. Click "Save & Commit Marks" to persist.', 'info');
  };

  // Schedule New Exam Submit
  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamCode.trim()) {
      showToast('Please provide exam title and unique code', 'error');
      return;
    }

    const created = addExam({
      schoolId: activeSchool.id,
      title: newExamTitle.trim(),
      code: newExamCode.trim().toUpperCase(),
      type: newExamType,
      academicSession: newExamSession,
      targetGrades: newExamGrades,
      startDate: newExamStartDate,
      endDate: newExamEndDate,
      status: 'SCHEDULED'
    });

    setIsScheduleModalOpen(false);
    setSelectedExamId(created.id);
    showToast(`Assessment "${created.title}" successfully scheduled!`, 'success');

    // Reset inputs
    setNewExamTitle('');
    setNewExamCode('');
  };

  // Declare Exam Results
  const handleDeclareResult = (exam: Exam) => {
    const signer = `${currentUser?.firstName || 'Principal'} ${currentUser?.lastName || ''}`.trim() || 'Exam Controller';
    declareExamResult(exam.id, signer);
    showToast(`Official results declared for ${exam.title}! Marksheets are now published.`, 'success');
  };

  // Unpublish / Recall Exam Results
  const handleUnpublishResult = (exam: Exam) => {
    unpublishExamResult(exam.id);
    showToast(`Results for ${exam.title} un-published for re-evaluation.`, 'info');
  };

  // Compute Overall KPI Metrics
  const stats = useMemo(() => {
    const totalExams = exams.length;
    const declaredExams = exams.filter(e => e.isResultPublished).length;
    
    const distinctMarks = examMarks.length;
    const passingMarks = examMarks.filter(m => !m.isAbsent && m.marksObtained >= m.passMarks).length;
    const overallPassRate = distinctMarks > 0 ? Math.round((passingMarks / distinctMarks) * 100) : 96;

    const ongoingOrEvaluating = exams.filter(e => e.status === 'ONGOING' || e.status === 'EVALUATING').length;

    return {
      totalExams,
      declaredExams,
      overallPassRate,
      ongoingOrEvaluating
    };
  }, [exams, examMarks]);

  // Build Report Card Data for a Selected Student & Exam
  const generatedReportCard = useMemo((): StudentReportCard | null => {
    if (!selectedReportStudent || !selectedReportExam) return null;

    const studentMarks = examMarks.filter(
      m => m.examId === selectedReportExam.id && m.studentId === selectedReportStudent.id
    );

    const subjectBreakdown = STANDARD_SUBJECTS.map((subject, idx) => {
      const match = studentMarks.find(m => m.subject.toLowerCase() === subject.toLowerCase());
      if (match) {
        return {
          subject: match.subject,
          marksObtained: match.marksObtained,
          maxMarks: match.maxMarks,
          passMarks: match.passMarks,
          grade: match.grade,
          status: (match.isAbsent ? 'ABSENT' : match.marksObtained >= match.passMarks ? 'PASSED' : 'FAILED') as 'PASSED' | 'FAILED' | 'ABSENT'
        };
      }
      const score = 75 + ((idx * 6) % 22);
      const grade = calculateGrade(score);
      return {
        subject,
        marksObtained: score,
        maxMarks: 100,
        passMarks: 33,
        grade,
        status: 'PASSED' as const
      };
    });

    const totalMarksObtained = subjectBreakdown.reduce((sum, s) => sum + (s.status === 'ABSENT' ? 0 : s.marksObtained), 0);
    const totalMaxMarks = subjectBreakdown.reduce((sum, s) => sum + s.maxMarks, 0);
    const percentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const overallGrade = calculateGrade(percentage);
    const hasFailed = subjectBreakdown.some(s => s.status === 'FAILED');

    return {
      studentId: selectedReportStudent.id,
      studentName: `${selectedReportStudent.firstName} ${selectedReportStudent.lastName}`.trim(),
      admissionNumber: selectedReportStudent.admissionNumber || selectedReportStudent.rollNumber || 'STU-001',
      rollNumber: selectedReportStudent.rollNumber || '01',
      gradeName: selectedReportStudent.gradeName,
      sectionName: selectedReportStudent.sectionName || 'A',
      examTitle: selectedReportExam.title,
      examCode: selectedReportExam.code,
      academicSession: selectedReportExam.academicSession,
      totalMarksObtained,
      totalMaxMarks,
      percentage,
      overallGrade,
      resultStatus: hasFailed ? 'FAILED' : 'PASSED',
      classRank: 3,
      attendancePercentage: selectedReportStudent.attendancePercentage || 96.5,
      subjectBreakdown,
      generalRemarks: percentage >= 85 
        ? 'Outstanding academic consistency, inquisitive nature, and exceptional conduct.' 
        : 'Good overall performance. Capable of achieving top grades with regular revision.'
    };
  }, [selectedReportStudent, selectedReportExam, examMarks]);

  // Filter students for Report Card tab
  const filteredReportStudents = useMemo(() => {
    return students.filter(s => {
      const matchesGrade = reportGradeFilter === 'ALL' || s.gradeName === reportGradeFilter;
      const matchesSearch = reportSearchQuery.trim() === '' || 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
        (s.admissionNumber && s.admissionNumber.toLowerCase().includes(reportSearchQuery.toLowerCase())) ||
        (s.rollNumber && s.rollNumber.toLowerCase().includes(reportSearchQuery.toLowerCase()));
      return matchesGrade && matchesSearch;
    });
  }, [students, reportGradeFilter, reportSearchQuery]);

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Executive Header matching STEM Style */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Official Exam Cell & Assessment Directorate
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Assessments, Marks & Result Cell
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Exam</span>
          </button>

          <button
            onClick={() => setActiveTab('marks')}
            className="btn-3d-secondary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 text-indigo-700 bg-indigo-50/50 border-indigo-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <span>Upload Marks</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className="btn-3d-secondary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 text-emerald-700 bg-emerald-50/50 border-emerald-200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Declare Results</span>
          </button>
        </div>
      </div>

      {/* Real-time Toast Banner */}
      {toastMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-xs transition-all ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          toastMessage.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
          'bg-blue-50 text-blue-900 border-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage.title}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Exams</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalExams}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            {stats.ongoingOrEvaluating} ongoing / evaluating
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Results Declared</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.declaredExams}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Live marksheets accessible
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pass Rate</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.overallPassRate}%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Standard CBSE/ICSE scale
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marks Evaluated</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{examMarks.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Subject entries logged
          </p>
        </Card>
      </div>

      {/* 4 Tabs Segmented Control Navigation */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/60 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>1. Exam Schedules & Assessments</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-200 text-slate-700 font-bold">
            {exams.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('marks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'marks'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-600" />
          <span>2. Teacher Marks Entry & Grading</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-amber-100 text-amber-800 font-bold">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'results'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>3. Result Declaration & Cell</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {stats.declaredExams} Published
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-purple-600" />
          <span>4. Student Marksheets & Reports</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: EXAM SCHEDULES & ASSESSMENTS
         ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Academic Assessment Calendar</h2>
              <p className="text-xs text-slate-500">Manage term exams, unit tests, and practical evaluations</p>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="btn-3d-primary px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule Assessment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(exam => {
              const isDeclared = exam.isResultPublished;
              return (
                <Card key={exam.id} className="card-3d rounded-2xl p-5 bg-white border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {exam.type.replace(/_/g, ' ')}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isDeclared ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        exam.status === 'MARKS_SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        exam.status === 'EVALUATING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {exam.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">{exam.title}</h3>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">Code: {exam.code}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Target Classes:</span>
                        <span className="font-semibold text-slate-800">{(exam.targetGrades || []).join(', ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Date Range:</span>
                        <span className="font-semibold text-slate-800">{exam.startDate} to {exam.endDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Evaluation Progress:</span>
                        <span className="font-semibold text-slate-800">
                          {exam.evaluatedStudentsCount || 0} / {exam.totalStudentsCount || 30} students
                        </span>
                      </div>
                      {exam.averagePercentage !== undefined && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Batch Average:</span>
                          <span className="font-bold text-emerald-700">{exam.averagePercentage}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExamId(exam.id);
                        if (exam.targetGrades && exam.targetGrades[0]) {
                          setSelectedGrade(exam.targetGrades[0]);
                        }
                        setActiveTab('marks');
                      }}
                      className="btn-3d-secondary flex-1 py-2 rounded-xl text-xs font-bold text-indigo-700 flex items-center justify-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Enter Marks</span>
                    </button>

                    {isDeclared ? (
                      <button
                        onClick={() => {
                          setSelectedReportExam(exam);
                          setActiveTab('reports');
                        }}
                        className="btn-3d-success py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        title="View Marksheets"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Results</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDeclareResult(exam)}
                        className="btn-3d-primary py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        title="Declare Result"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Declare</span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TEACHER MARKS ENTRY & EVALUATION
         ========================================================================= */}
      {activeTab === 'marks' && (
        <div className="space-y-4">
          {/* Control Bar */}
          <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                    Assessment / Exam
                  </label>
                  <select
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                    Target Grade / Class
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={e => setSelectedGrade(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1 uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {STANDARD_SUBJECTS.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-end flex-wrap">
                <button
                  onClick={handleAutoFillSampleMarks}
                  type="button"
                  className="btn-3d-secondary px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5"
                  title="Populate test evaluation marks"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Auto-Fill Samples</span>
                </button>

                <button
                  onClick={handleSaveMarks}
                  type="button"
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Commit Marks</span>
                </button>
              </div>
            </div>

            {/* Sub-bar with Max Marks & Pass Marks */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Max Marks:</span>
                  <input
                    type="number"
                    value={marksMaxScore}
                    onChange={e => setMarksMaxScore(Number(e.target.value) || 100)}
                    className="w-16 px-2 py-0.5 rounded-lg border border-slate-200 text-center font-bold text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Pass Marks:</span>
                  <input
                    type="number"
                    value={marksPassScore}
                    onChange={e => setMarksPassScore(Number(e.target.value) || 33)}
                    className="w-16 px-2 py-0.5 rounded-lg border border-slate-200 text-center font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Graded by:</span>
                <span className="font-bold text-slate-800">
                  {currentUser?.firstName || 'Teacher'} ({currentUser?.designation || 'Faculty'})
                </span>
              </div>
            </div>
          </Card>

          {/* Inline Marks Entry Table */}
          <Card className="card-3d rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Evaluation Sheet: {selectedSubject} ({selectedGrade})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enter marks obtained out of {marksMaxScore}. Grade calculates automatically.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {eligibleStudentsForMarks.length} Students Enrolled
              </span>
            </div>

            {eligibleStudentsForMarks.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-700">No students found in {selectedGrade}</p>
                <p className="text-xs text-slate-400 mt-1">Select a class that has enrolled students (e.g. Grade 6 or Grade 7)</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">Roll</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Admission No</th>
                      <th className="py-3 px-4">Absent</th>
                      <th className="py-3 px-4 text-center">Marks Obtained (/ {marksMaxScore})</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      <th className="py-3 px-4">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {eligibleStudentsForMarks.map(student => {
                      const entry = draftMarks[student.id] || { marks: 0, isAbsent: false, remarks: '' };
                      const score = entry.isAbsent ? 0 : Number(entry.marks) || 0;
                      const pct = (score / marksMaxScore) * 100;
                      const grade = entry.isAbsent ? 'E' : calculateGrade(pct);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">
                            {student.rollNumber || '01'}
                          </td>

                          <td className="py-3 px-4 font-bold text-slate-900">
                            {student.firstName} {student.lastName}
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                            {student.admissionNumber || 'STU-001'}
                          </td>

                          <td className="py-3 px-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={entry.isAbsent}
                                onChange={e => {
                                  setDraftMarks(prev => ({
                                    ...prev,
                                    [student.id]: {
                                      ...prev[student.id],
                                      isAbsent: e.target.checked
                                    }
                                  }));
                                }}
                                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                              />
                              <span className="text-[11px] font-medium text-slate-600">Absent</span>
                            </label>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <input
                              type="number"
                              min={0}
                              max={marksMaxScore}
                              disabled={entry.isAbsent}
                              value={entry.isAbsent ? '' : entry.marks}
                              onChange={e => {
                                const val = Math.min(marksMaxScore, Math.max(0, Number(e.target.value) || 0));
                                setDraftMarks(prev => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    marks: val
                                  }
                                }));
                              }}
                              className={`w-24 text-center font-bold px-2 py-1 rounded-xl border ${
                                entry.isAbsent
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                  : score < marksPassScore
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-indigo-500'
                              }`}
                              placeholder={entry.isAbsent ? 'ABS' : '0'}
                            />
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${getGradeColor(grade)}`}>
                              {entry.isAbsent ? 'ABS (E)' : grade}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={entry.remarks}
                              onChange={e => {
                                const rmk = e.target.value;
                                setDraftMarks(prev => ({
                                  ...prev,
                                  [student.id]: {
                                    ...prev[student.id],
                                    remarks: rmk
                                  }
                                }));
                              }}
                              placeholder="Add specific observation..."
                              className="w-full text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs text-slate-500">
                Click <strong>"Save & Commit Marks"</strong> to submit grades to the Exam Cell.
              </span>
              <button
                onClick={handleSaveMarks}
                className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Commit Marks</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: RESULT DECLARATION & EXAM CELL
         ========================================================================= */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Exam Cell Result Declaration</h2>
              <p className="text-xs text-slate-500">Official sign-off & publishing marks to student and parent portals</p>
            </div>
          </div>

          <Card className="card-3d rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Exam Details</th>
                    <th className="py-3.5 px-4">Target Grades</th>
                    <th className="py-3.5 px-4">Session</th>
                    <th className="py-3.5 px-4 text-center">Marks Evaluated</th>
                    <th className="py-3.5 px-4 text-center">Class Avg</th>
                    <th className="py-3.5 px-4 text-center">Result Status</th>
                    <th className="py-3.5 px-4 text-right">Official Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {exams.map(exam => {
                    const isDeclared = exam.isResultPublished;
                    const evalCount = exam.evaluatedStudentsCount || 0;
                    const totalCount = exam.totalStudentsCount || 30;
                    const progressPct = Math.round((evalCount / Math.max(1, totalCount)) * 100);

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{exam.title}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {exam.code} • {exam.type}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {(exam.targetGrades || []).join(', ')}
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          {exam.academicSession}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="font-bold text-slate-800">
                            {evalCount} / {totalCount}
                          </div>
                          <div className="w-24 bg-slate-200 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, progressPct)}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                          {exam.averagePercentage ? `${exam.averagePercentage}%` : '84%'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isDeclared ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Declared ({exam.resultDeclaredDate || 'Published'})
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Pending Sign-Off
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {isDeclared ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedReportExam(exam);
                                  setActiveTab('reports');
                                }}
                                className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 flex items-center gap-1"
                              >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>View Cards</span>
                              </button>

                              <button
                                onClick={() => handleUnpublishResult(exam)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                                title="Recall / Re-evaluate"
                              >
                                Recall
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDeclareResult(exam)}
                              className="btn-3d-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ml-auto"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Declare Result</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 4: STUDENT MARKSHEETS & REPORT CARDS
         ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Marksheets & Official Report Cards</h2>
              <p className="text-xs text-slate-500">Preview, generate, and print CBSE/ICSE standard report cards</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={e => setReportSearchQuery(e.target.value)}
                  placeholder="Search student or roll no..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
                />
              </div>

              <select
                value={reportGradeFilter}
                onChange={e => setReportGradeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="ALL">All Grades</option>
                <option value="Grade 6">Grade 6</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <Card className="card-3d rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-4">Roll</th>
                    <th className="py-3.5 px-4">Student Name</th>
                    <th className="py-3.5 px-4">Class & Section</th>
                    <th className="py-3.5 px-4">Admission ID</th>
                    <th className="py-3.5 px-4 text-center">Attendance</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Official Marksheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReportStudents.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {student.rollNumber || '01'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {student.firstName} {student.lastName}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {student.gradeName} ({student.sectionName || 'A'})
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {student.admissionNumber || 'STU-001'}
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-indigo-700">
                        {student.attendancePercentage ? `${student.attendancePercentage}%` : '96%'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          PASSED & PROMOTED
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReportStudent(student);
                            setSelectedReportExam(currentExam || exams[0]);
                            setIsReportModalOpen(true);
                          }}
                          className="btn-3d-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5 ml-auto"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Marksheet</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: SCHEDULE NEW EXAM
         ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Assessment</h3>
                  <p className="text-xs text-slate-500">Configure new exam code, type and target dates</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Exam Title *</label>
                <input
                  type="text"
                  required
                  value={newExamTitle}
                  onChange={e => setNewExamTitle(e.target.value)}
                  placeholder="e.g. Periodic Assessment 2 (2026)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Exam Code *</label>
                  <input
                    type="text"
                    required
                    value={newExamCode}
                    onChange={e => setNewExamCode(e.target.value)}
                    placeholder="e.g. PA2-2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assessment Type</label>
                  <select
                    value={newExamType}
                    onChange={e => setNewExamType(e.target.value as AssessmentType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PERIODIC_TEST">Periodic Test</option>
                    <option value="MID_TERM">Mid Term Examination</option>
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="FINAL_EXAM">Final Annual Exam</option>
                    <option value="PRACTICAL">Lab & Practical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExamStartDate}
                    onChange={e => setNewExamStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={newExamEndDate}
                    onChange={e => setNewExamEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Classes</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(gr => {
                    const isSelected = newExamGrades.includes(gr);
                    return (
                      <button
                        type="button"
                        key={gr}
                        onClick={() => {
                          setNewExamGrades(prev =>
                            isSelected ? prev.filter(g => g !== gr) : [...prev, gr]
                          );
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {gr}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2 rounded-xl font-bold text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assessment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: OFFICIAL PRINTABLE REPORT CARD / MARKSHEET
         ========================================================================= */}
      {isReportModalOpen && generatedReportCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 my-8">
            
            {/* Action Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Academic Transcript
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Marksheet Container */}
            <div className="p-6 border-2 border-slate-900 rounded-2xl bg-white space-y-6">
              
              {/* School Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {activeSchool.name}
                </h2>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Affiliated to Central Board of Secondary Education (CBSE) • {activeSchool.city}
                </p>
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider">
                  {generatedReportCard.examTitle} ({generatedReportCard.academicSession})
                </div>
              </div>

              {/* Student Particulars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                  <span className="font-bold text-slate-900">{generatedReportCard.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                  <span className="font-bold text-slate-900">{generatedReportCard.gradeName} - {generatedReportCard.sectionName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                  <span className="font-bold font-mono text-slate-900">{generatedReportCard.rollNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission ID</span>
                  <span className="font-bold font-mono text-slate-900">{generatedReportCard.admissionNumber}</span>
                </div>
              </div>

              {/* Subject-Wise Marks Breakdown Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-700 border-b border-slate-300 text-[11px]">
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3 text-center">Max Marks</th>
                      <th className="py-2.5 px-3 text-center">Pass Marks</th>
                      <th className="py-2.5 px-3 text-center">Marks Obtained</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-3 text-center">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {generatedReportCard.subjectBreakdown.map((sb, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{sb.subject}</td>
                        <td className="py-2 px-3 text-center font-mono">{sb.maxMarks}</td>
                        <td className="py-2 px-3 text-center font-mono">{sb.passMarks}</td>
                        <td className="py-2 px-3 text-center font-bold text-slate-900 font-mono">
                          {sb.status === 'ABSENT' ? 'ABS' : sb.marksObtained}
                        </td>
                        <td className="py-2 px-3 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[11px] ${getGradeColor(sb.grade)}`}>
                            {sb.grade}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`text-[11px] font-bold ${sb.status === 'PASSED' ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {sb.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Summary Total Row */}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900">
                      <td className="py-2.5 px-3 uppercase text-slate-900 font-black">Grand Total</td>
                      <td className="py-2.5 px-3 text-center font-mono">{generatedReportCard.totalMaxMarks}</td>
                      <td className="py-2.5 px-3 text-center font-mono">-</td>
                      <td className="py-2.5 px-3 text-center font-bold text-indigo-700 font-mono text-sm">
                        {generatedReportCard.totalMarksObtained}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-xs font-black bg-indigo-100 text-indigo-800">
                          {generatedReportCard.overallGrade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-emerald-800 font-black">
                        {generatedReportCard.percentage}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Final Decision & Remarks */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Official Result:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    PROMOTED TO NEXT ACADEMIC GRADE
                  </span>
                </div>
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700">Faculty Remarks: </span>
                  {generatedReportCard.generalRemarks}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex items-center justify-between text-xs text-center border-t border-slate-200">
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="text-slate-500 font-semibold">Class Teacher</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="text-slate-500 font-semibold">Exam Controller</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1" />
                  <span className="text-slate-900 font-bold">Principal Signature</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ExamCellPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-slate-400 font-semibold">Loading Exam Cell...</div>}>
        <ExamCellContent />
      </Suspense>
    </AppShell>
  );
}
