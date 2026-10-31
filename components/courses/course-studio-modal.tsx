"use client";

import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  Layers,
  Video,
  HelpCircle,
  Gamepad2,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  FolderSync,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Award,
  ArrowRight,
  Smartphone,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Check,
  ExternalLink,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react';
import { Course, CurriculumLecture, VideoProviderType, UnlockPolicy, SchedulePolicy, GameType } from '@/lib/types';
import { generate30LectureCurriculum, exportLecturesToCsv } from '@/lib/courses/curriculum-generator';
import { GoogleDriveProvider, VideoProviderFactory } from '@/lib/video/video-provider';
import { CoursePreviewModal } from './course-preview-modal';

interface CourseStudioModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSaveCourse: (updatedCourse: Partial<Course>) => Promise<void>;
  onBulkUpdateLectures: (courseId: string, lectures: CurriculumLecture[]) => Promise<void>;
}

export function CourseStudioModal({
  course,
  isOpen,
  onClose,
  onSaveCourse,
  onBulkUpdateLectures
}: CourseStudioModalProps) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'LECTURES' | 'METADATA' | 'DRIVE_SYNC' | 'CHECKLIST'>('LECTURES');
  const [targetGrade, setTargetGrade] = useState<number>(course.minGrade || 6);
  const [unlockPolicy, setUnlockPolicy] = useState<UnlockPolicy>(course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION');
  const [schedulePolicy, setSchedulePolicy] = useState<SchedulePolicy>(course.defaultScheduleType || 'DAILY');

  // Course Lifecycle & Metadata State
  const [title, setTitle] = useState(course.title);
  const [code, setCode] = useState(course.code || 'CRS-STEM-101');
  const [category, setCategory] = useState(course.category || 'Coding');
  const [subject, setSubject] = useState(course.subject || 'STEM & Computer Science');
  const [difficulty, setDifficulty] = useState(course.difficulty || 'Beginner');
  const [version, setVersion] = useState(course.version || 'v1.0');
  const [status, setStatus] = useState<'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED'>(
    (course.status as any) || (course.isPublished ? 'PUBLISHED' : 'DRAFT')
  );
  const [description, setDescription] = useState(course.description || '');
  const [prerequisites, setPrerequisites] = useState(course.prerequisites || 'Basic familiarity with computer operations.');

  // 30 Lectures State
  const [lectures, setLectures] = useState<CurriculumLecture[]>(() => {
    if (course.curriculumLectures && course.curriculumLectures.length > 0) {
      return [...course.curriculumLectures];
    }
    return generate30LectureCurriculum({
      grade: course.minGrade || 6,
      courseTitle: course.title,
      unlockPolicy: course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION'
    });
  });

  const [expandedLectureNumber, setExpandedLectureNumber] = useState<number | null>(1);
  const [driveFolderId, setDriveFolderId] = useState(course.driveConfig?.folderId || '1InnovatMind_Curriculum_Folder');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Live Google Drive Asset Test State
  const [testVideoUrl, setTestVideoUrl] = useState('https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view?usp=drive_link');
  const [testVideoResult, setTestVideoResult] = useState<any | null>(null);

  // Mobile Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Auto-generate standard 30 lectures for selected grade
  const handleRegenerate30Lectures = () => {
    const generated = generate30LectureCurriculum({
      grade: targetGrade,
      courseTitle: title,
      unlockPolicy,
      scheduleType: schedulePolicy
    });
    setLectures(generated);
    setSaveSuccessMsg(`Scaffolded standard 30-lecture curriculum for Grade ${targetGrade}!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Bulk map Google Drive folder to all 30 lectures
  const handleBulkMapDriveFolder = () => {
    if (!driveFolderId.trim()) return;
    const cleanId = driveFolderId.trim();
    const updated = lectures.map(l => {
      const fileId = `${cleanId}_LEC_${String(l.lectureNumber).padStart(2, '0')}`;
      return {
        ...l,
        videoProvider: 'GOOGLE_DRIVE' as VideoProviderType,
        videoRef: `https://drive.google.com/file/d/${fileId}/preview`,
        videoMetadata: {
          ...l.videoMetadata,
          driveWebViewLink: `https://drive.google.com/file/d/${fileId}/view`,
          fileName: `Grade_${targetGrade}_Lecture_${l.lectureNumber}.mp4`
        }
      };
    });
    setLectures(updated);
    setSaveSuccessMsg(`Mapped Google Drive folder '${cleanId}' to all ${lectures.length} lectures!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Insert real test Google Drive asset to Lecture 1
  const handleInsertTestDriveAsset = () => {
    const testAssetUrl = 'https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/preview';
    setLectures(prev => prev.map(l => {
      if (l.lectureNumber === 1) {
        return {
          ...l,
          videoProvider: 'GOOGLE_DRIVE' as VideoProviderType,
          videoRef: testAssetUrl,
          videoMetadata: {
            ...l.videoMetadata,
            fileName: 'Lecture_1_Verified_Test_Video.mp4',
            driveWebViewLink: 'https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view'
          }
        };
      }
      return l;
    }));
    setSaveSuccessMsg('Inserted verified test Google Drive asset into Lecture 1!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Validate Google Drive video link
  const handleValidateTestVideo = () => {
    const provider = new GoogleDriveProvider();
    const resolved = provider.resolvePlaybackMetadata(testVideoUrl, 'Test Playback Verification');
    setTestVideoResult(resolved);
  };

  // Add a new lecture
  const handleAddLecture = () => {
    const nextNum = lectures.length + 1;
    const newLec: CurriculumLecture = {
      id: `lec-${targetGrade}-${nextNum}`,
      lectureNumber: nextNum,
      title: `Lecture ${nextNum}: Extended Practical Session`,
      shortDescription: `Interactive exploration and challenge for session ${nextNum}.`,
      learningObjectives: [
        'Apply previously learned concepts to practical problems',
        'Pass the checkpoint assessment with >= 70% score',
        'Complete the interactive engineering game challenge'
      ],
      moduleName: `Unit ${Math.ceil(nextNum / 6)}: Advanced Topics`,
      topic: `Topic ${nextNum}`,
      gradeLevel: targetGrade,
      estimatedDurationMinutes: 25,
      videoProvider: 'GOOGLE_DRIVE',
      videoRef: `https://drive.google.com/file/d/1IM_DRV_${targetGrade}_LEC_${String(nextNum).padStart(2, '0')}/preview`,
      videoCompletionThresholdPercent: 80,
      quiz: {
        id: `quiz-lec-${nextNum}`,
        title: `Checkpoint Quiz ${nextNum}`,
        description: 'Verify your understanding of this lecture',
        questionsCount: 3,
        passingPercentage: 70,
        isMandatory: true,
        questions: [
          {
            id: `q-${nextNum}-1`,
            type: 'MCQ',
            prompt: 'What is the primary objective of this session?',
            options: [
              'To build and verify a practical solution',
              'To memorize definitions without practice',
              'To skip checking instructions'
            ],
            correctAnswer: 'To build and verify a practical solution',
            explanation: 'Practical problem solving is the core goal of STEM learning.'
          }
        ]
      },
      game: {
        id: `game-lec-${nextNum}`,
        title: `Interactive Challenge ${nextNum}`,
        type: 'LOGIC_CIRCUIT',
        instructions: 'Solve the logic circuit challenge to earn bonus XP',
        difficulty: 'MEDIUM',
        config: { targetCircuit: 'AND_GATE' },
        xpBonus: 50
      },
      releaseSchedule: {
        type: schedulePolicy,
        dayOffset: nextNum,
        customTime: '09:00'
      },
      unlockPolicy,
      status: 'READY',
      xpReward: 100
    };
    setLectures([...lectures, newLec]);
    setExpandedLectureNumber(nextNum);
  };

  // Duplicate lecture
  const handleDuplicateLecture = (lectureNumber: number) => {
    const source = lectures.find(l => l.lectureNumber === lectureNumber);
    if (!source) return;

    const duplicated: CurriculumLecture = {
      ...source,
      id: `lec-${targetGrade}-${Date.now()}`,
      title: `${source.title} (Copy)`,
      lectureNumber: lectures.length + 1
    };

    setLectures([...lectures, duplicated]);
    setExpandedLectureNumber(duplicated.lectureNumber);
  };

  // Delete lecture
  const handleDeleteLecture = (lectureNumber: number) => {
    if (lectures.length <= 1) {
      alert('A course must retain at least 1 lecture.');
      return;
    }
    const filtered = lectures.filter(l => l.lectureNumber !== lectureNumber);
    // Renumber 1..N
    const renumbered = filtered.map((l, idx) => ({
      ...l,
      lectureNumber: idx + 1
    }));
    setLectures(renumbered);
  };

  // Reorder lecture
  const handleMoveLecture = (lectureNumber: number, direction: 'UP' | 'DOWN') => {
    const idx = lectures.findIndex(l => l.lectureNumber === lectureNumber);
    if (idx === -1) return;
    if (direction === 'UP' && idx === 0) return;
    if (direction === 'DOWN' && idx === lectures.length - 1) return;

    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    const copy = [...lectures];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);

    // Renumber
    const renumbered = copy.map((l, i) => ({
      ...l,
      lectureNumber: i + 1
    }));
    setLectures(renumbered);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = exportLecturesToCsv(lectures);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${course.slug || 'course'}_${lectures.length}_lectures_curriculum.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update single lecture
  const handleUpdateLecture = (lectureNumber: number, field: keyof CurriculumLecture, value: any) => {
    setLectures(prev => prev.map(l => l.lectureNumber === lectureNumber ? { ...l, [field]: value } : l));
  };

  // Publishing Validation Checklist Memo
  const validationChecklist = useMemo(() => {
    const hasTitle = Boolean(title && title.trim().length >= 3);
    const hasCode = Boolean(code && code.trim().length >= 3);
    const hasDescription = Boolean(description && description.trim().length >= 10);
    const hasGradeMapping = targetGrade >= 1 && targetGrade <= 12;
    const hasMinLectures = lectures.length >= 30;
    const hasSequentialLectures = lectures.every((l, idx) => l.lectureNumber === idx + 1);
    const lecturesWithValidVideo = lectures.filter(l => Boolean(l.videoRef && l.videoRef.trim()));
    const allVideosValid = lecturesWithValidVideo.length === lectures.length;
    const lecturesWithQuiz = lectures.filter(l => Boolean(l.quiz && (l.quiz.questions?.length > 0 || l.quiz.questionsCount > 0)));
    const allQuizzesValid = lecturesWithQuiz.length === lectures.length;
    const lecturesWithGame = lectures.filter(l => Boolean(l.game && l.game.type));
    const allGamesValid = lecturesWithGame.length === lectures.length;
    const hasSchedulePolicy = Boolean(schedulePolicy && unlockPolicy);

    const items = [
      { id: 'info', label: 'Course Information (Title, Code, Description)', passed: hasTitle && hasCode && hasDescription, error: 'Provide title (>=3 chars), unique code, and description (>=10 chars)' },
      { id: 'grade', label: 'Grade & Subject Mapping', passed: hasGradeMapping && Boolean(category), error: 'Ensure grade level is configured between Grade 1 and 12' },
      { id: 'count', label: '30-Lecture Curriculum Requirement', passed: hasMinLectures, error: `Course requires at least 30 lectures (currently ${lectures.length})` },
      { id: 'sequence', label: 'Sequential Lecture Numbering (1..N)', passed: hasSequentialLectures, error: 'Lecture numbers must be strictly sequential without gaps' },
      { id: 'video', label: 'Video Streaming Assets Assigned', passed: allVideosValid, error: `${lectures.length - lecturesWithValidVideo.length} lecture(s) missing video reference` },
      { id: 'quiz', label: 'Checkpoint Quizzes Configured', passed: allQuizzesValid, error: `${lectures.length - lecturesWithQuiz.length} lecture(s) missing quiz checkpoints` },
      { id: 'game', label: 'Educational Games Attached', passed: allGamesValid, error: `${lectures.length - lecturesWithGame.length} lecture(s) missing interactive games` },
      { id: 'schedule', label: 'Release Schedule & Unlock Policy', passed: hasSchedulePolicy, error: 'Select default unlock and scheduling policy' }
    ];

    const isReadyForPublishing = items.every(item => item.passed);
    const completedCount = items.filter(item => item.passed).length;
    const score = Math.round((completedCount / items.length) * 100);

    return { items, isReadyForPublishing, completedCount, totalCount: items.length, score };
  }, [title, code, description, targetGrade, category, lectures, schedulePolicy, unlockPolicy]);

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveCourse({
        title,
        code,
        category: category as any,
        subject,
        difficulty: difficulty as any,
        version,
        status,
        isPublished: status === 'PUBLISHED',
        description,
        prerequisites,
        minGrade: targetGrade,
        maxGrade: Math.min(12, targetGrade + 2),
        unlockPolicy,
        defaultScheduleType: schedulePolicy,
        totalLessons: lectures.length,
        driveConfig: {
          folderId: driveFolderId,
          connectedAt: new Date().toISOString(),
          mappedVideosCount: lectures.filter(l => l.videoProvider === 'GOOGLE_DRIVE').length
        }
      });
      await onBulkUpdateLectures(course.id, lectures);
      setSaveSuccessMsg('Curriculum Studio: All lectures, course metadata, and lifecycle status saved!');
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(`Error saving course: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
        <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Top Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 font-bold">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">Course Studio</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    {version}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                    status === 'REVIEW' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                    'bg-slate-500/20 text-slate-300 border-slate-400/30'
                  }`}>
                    {status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Super Admin Curriculum Control: 30-lecture sequence, Google Drive streaming, quizzes, and educational games.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Preview Mobile Student</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Switcher & Quick Actions Ribbon */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl">
              <button
                onClick={() => setActiveTab('LECTURES')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'LECTURES' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>30 Lectures Builder ({lectures.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('METADATA')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'METADATA' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Course Lifecycle &amp; Grade</span>
              </button>
              <button
                onClick={() => setActiveTab('DRIVE_SYNC')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'DRIVE_SYNC' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Google Drive Video Mapping</span>
              </button>
              <button
                onClick={() => setActiveTab('CHECKLIST')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'CHECKLIST' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Publishing Checklist ({validationChecklist.score}%)</span>
              </button>
            </div>

            {/* Quick Toolbar Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInsertTestDriveAsset}
                title="Insert verified Google Drive test video asset into Lecture 1"
                className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-indigo-600" />
                <span>Set Test Drive Asset (Lec 1)</span>
              </button>
              <button
                type="button"
                onClick={handleRegenerate30Lectures}
                title="Regenerate 30 standard lectures for selected grade"
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Scaffold 30</span>
              </button>
              <button
                type="button"
                onClick={handleExportCsv}
                className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Success Alert Banner */}
          {saveSuccessMsg && (
            <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{saveSuccessMsg}</span>
            </div>
          )}

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: 30 LECTURES BUILDER */}
            {activeTab === 'LECTURES' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">30 Lectures Curriculum Flow</h3>
                    <p className="text-xs text-slate-500">
                      Each lecture contains Video Stream, Checkpoint Quiz, Educational Game, and XP Reward.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddLecture}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Lecture</span>
                    </button>
                    <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-xl border border-indigo-100">
                      Total: {lectures.length} Lectures
                    </div>
                  </div>
                </div>

                {/* Lecture Cards Accordion List */}
                <div className="space-y-3">
                  {lectures.map((lec, idx) => {
                    const isExpanded = expandedLectureNumber === lec.lectureNumber;
                    return (
                      <div
                        key={lec.id || lec.lectureNumber}
                        className={`border rounded-2xl transition-all ${
                          isExpanded ? 'border-indigo-300 bg-indigo-50/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {/* Summary Row */}
                        <div
                          onClick={() => setExpandedLectureNumber(isExpanded ? null : lec.lectureNumber)}
                          className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center shrink-0">
                              #{lec.lectureNumber}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">{lec.title}</span>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                  {lec.moduleName}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {lec.estimatedDurationMinutes} mins
                                </span>
                                <span className="flex items-center gap-1">
                                  <Video className="w-3 h-3 text-blue-500" />
                                  {lec.videoProvider === 'GOOGLE_DRIVE' ? 'Google Drive' : lec.videoProvider}
                                </span>
                                <span className="flex items-center gap-1">
                                  <HelpCircle className="w-3 h-3 text-emerald-500" />
                                  {lec.quiz?.questionsCount || 3} Questions
                                </span>
                                <span className="flex items-center gap-1">
                                  <Gamepad2 className="w-3 h-3 text-purple-500" />
                                  {lec.game?.title || 'Interactive Game'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Reorder Buttons */}
                            <button
                              type="button"
                              onClick={() => handleMoveLecture(lec.lectureNumber, 'UP')}
                              disabled={idx === 0}
                              title="Move Lecture Up"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveLecture(lec.lectureNumber, 'DOWN')}
                              disabled={idx === lectures.length - 1}
                              title="Move Lecture Down"
                              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Duplicate Button */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateLecture(lec.lectureNumber)}
                              title="Duplicate Lecture"
                              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteLecture(lec.lectureNumber)}
                              title="Delete Lecture"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md ml-1">
                              +{lec.xpReward} XP
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                            )}
                          </div>
                        </div>

                        {/* Expanded In-Depth Details */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Lecture Title & Module */}
                              <div className="space-y-1">
                                <label className="font-bold text-slate-700">Lecture Title</label>
                                <input
                                  type="text"
                                  value={lec.title}
                                  onChange={(e) => handleUpdateLecture(lec.lectureNumber, 'title', e.target.value)}
                                  className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-bold text-slate-700">Unit / Module</label>
                                <input
                                  type="text"
                                  value={lec.moduleName}
                                  onChange={(e) => handleUpdateLecture(lec.lectureNumber, 'moduleName', e.target.value)}
                                  className="w-full h-9 bg-white border border-slate-200 rounded-lg px-3 text-xs text-slate-800"
                                />
                              </div>
                            </div>

                            {/* Video Streaming Reference */}
                            <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                                  <Video className="w-3.5 h-3.5 text-blue-600" />
                                  Video Asset Streaming
                                </span>
                                <span className="text-[11px] text-blue-700 font-semibold">
                                  Provider: {lec.videoProvider}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="md:col-span-2 space-y-1">
                                  <label className="text-[11px] font-semibold text-slate-600">Google Drive Embed / Preview URL</label>
                                  <input
                                    type="text"
                                    value={lec.videoRef}
                                    onChange={(e) => handleUpdateLecture(lec.lectureNumber, 'videoRef', e.target.value)}
                                    className="w-full h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs font-mono text-slate-800"
                                    placeholder="https://drive.google.com/file/d/.../preview"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-slate-600">Watch Threshold (%)</label>
                                  <input
                                    type="number"
                                    value={lec.videoCompletionThresholdPercent}
                                    onChange={(e) => handleUpdateLecture(lec.lectureNumber, 'videoCompletionThresholdPercent', Number(e.target.value))}
                                    className="w-full h-8 bg-white border border-slate-200 rounded-lg px-2 text-xs text-slate-800"
                                    min={50}
                                    max={100}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Quiz & Game Association Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1">
                                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  Checkpoint Quiz: {lec.quiz?.title || 'Lecture Quiz'}
                                </span>
                                <p className="text-[11px] text-emerald-700">
                                  {lec.quiz?.questionsCount || 3} Questions • Passing: {lec.quiz?.passingPercentage || 70}%
                                </p>
                              </div>
                              <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-1">
                                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                                  <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                                  Game Challenge: {lec.game?.title}
                                </span>
                                <p className="text-[11px] text-purple-700">
                                  Archetype: {lec.game?.type} • +{lec.game?.xpBonus || 50} Bonus XP
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COURSE METADATA & GRADE SETTINGS */}
            {activeTab === 'METADATA' && (
              <div className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Code</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white"
                    >
                      <option value="Coding">Coding</option>
                      <option value="Robotics">Robotics</option>
                      <option value="AI">Artificial Intelligence</option>
                      <option value="IoT">Internet of Things</option>
                      <option value="STEM Foundations">STEM Foundations</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Course Lifecycle Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white font-bold text-indigo-700"
                    >
                      <option value="DRAFT">DRAFT (In Preparation)</option>
                      <option value="REVIEW">REVIEW (Quality Check)</option>
                      <option value="PUBLISHED">PUBLISHED (Available for Assignment)</option>
                      <option value="PAUSED">PAUSED (Temporarily Suspended)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Version</label>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-mono"
                      placeholder="e.g. v1.0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Target Grade Level</label>
                    <select
                      value={targetGrade}
                      onChange={(e) => setTargetGrade(Number(e.target.value))}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                        <option key={g} value={g}>Grade {g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Difficulty</label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Unlock Policy</label>
                  <select
                    value={unlockPolicy}
                    onChange={(e) => setUnlockPolicy(e.target.value as any)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs bg-white"
                  >
                    <option value="HYBRID_SCHEDULE_AND_COMPLETION">
                      Hybrid: Unlock on scheduled date AND completion of previous lecture (Recommended)
                    </option>
                    <option value="SEQUENTIAL">Sequential: Unlock immediately upon completing previous lecture</option>
                    <option value="SCHEDULE_BASED">Schedule-Based: Unlock strictly on configured date/time</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Course Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Prerequisites</label>
                  <input
                    type="text"
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs"
                    placeholder="e.g. Basic computer basics, mouse and keyboard familiarity"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: GOOGLE DRIVE SYNC & VERIFICATION */}
            {activeTab === 'DRIVE_SYNC' && (
              <div className="space-y-5 max-w-2xl">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderSync className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xs font-bold text-blue-900">Google Drive Bulk Video Mapping</h4>
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Provide your organization's Google Drive Folder ID. The Course Studio will automatically map
                    all lectures to corresponding file references (`https://drive.google.com/file/d/FOLDER_ID_LEC_XX/preview`).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Google Drive Folder ID / Reference</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={driveFolderId}
                      onChange={(e) => setDriveFolderId(e.target.value)}
                      placeholder="e.g. 1InnovatMind_Curriculum_Folder"
                      className="flex-1 h-10 border border-slate-200 rounded-xl px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleBulkMapDriveFolder}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Map All Lectures
                    </button>
                  </div>
                </div>

                {/* Live Google Drive Video Playback Validation Tool */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white">Live Google Drive Video Verification</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTestVideoUrl('https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view?usp=drive_link')}
                      className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
                    >
                      Load Provided Test Asset (1VOC-cFi...)
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={testVideoUrl}
                      onChange={(e) => setTestVideoUrl(e.target.value)}
                      placeholder="Paste Google Drive video URL"
                      className="flex-1 h-9 bg-slate-800 border border-slate-700 text-white rounded-xl px-3 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleValidateTestVideo}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Validate &amp; Test
                    </button>
                  </div>

                  {testVideoResult && (
                    <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2 text-xs animate-fade-in">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">File ID: <code className="text-emerald-400">{testVideoResult.fileId}</code></span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {testVideoResult.validationStatus}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono break-all">
                        Embed: {testVideoResult.embedUrl}
                      </div>

                      {/* Video Player Test Embed */}
                      <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden border border-slate-700 mt-2">
                        <iframe
                          src={testVideoResult.embedUrl}
                          title="Google Drive Test Player"
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <h5 className="text-xs font-bold text-slate-700 mb-2">Mapped Video References Preview (First 3):</h5>
                  <div className="space-y-2 font-mono text-[11px] text-slate-600">
                    {lectures.slice(0, 3).map(l => (
                      <div key={l.lectureNumber} className="p-2 bg-slate-100 rounded-lg border border-slate-200">
                        <strong>Lecture {l.lectureNumber}:</strong> {l.videoRef}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PUBLISHING VALIDATION CHECKLIST */}
            {activeTab === 'CHECKLIST' && (
              <div className="space-y-4 max-w-2xl">
                <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between shadow-md">
                  <div>
                    <h4 className="text-sm font-black">Publishing Quality Assurance</h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Verify course completeness and curriculum integrity before publishing.
                    </p>
                  </div>
                  <div className="text-center bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                    <span className="text-2xl font-black text-emerald-400">{validationChecklist.score}%</span>
                    <span className="text-[10px] font-bold text-slate-300 block">Readiness Score</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {validationChecklist.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                        item.passed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        item.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {item.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-xs font-bold block ${item.passed ? 'text-emerald-950' : 'text-rose-950'}`}>
                          {item.label}
                        </span>
                        {!item.passed && (
                          <span className="text-[11px] font-medium text-rose-700 mt-0.5 block">
                            {item.error}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {validationChecklist.isReadyForPublishing ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="font-bold">Course meets all institutional publishing standards!</span>
                    </div>
                    {status !== 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={() => setStatus('PUBLISHED')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                      >
                        Set to PUBLISHED
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Please resolve the checklist items above before setting the course status to PUBLISHED.</span>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Bottom Actions Bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500 font-medium">
              Course Studio: {lectures.length} Lectures configured • Target: Grade {targetGrade} • Status: <strong className="text-slate-800">{status}</strong>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveAll}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Studio Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Course Studio</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Student Preview Modal */}
      {showPreviewModal && (
        <CoursePreviewModal
          course={{
            ...course,
            title,
            code,
            category: category as any,
            minGrade: targetGrade
          }}
          lectures={lectures}
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </>
  );
}
