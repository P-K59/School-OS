"use client";

import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Course, CurriculumLecture, VideoProviderType, UnlockPolicy, SchedulePolicy, GameType } from '@/lib/types';
import { generate30LectureCurriculum, exportLecturesToCsv } from '@/lib/courses/curriculum-generator';

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

  const [activeTab, setActiveTab] = useState<'METADATA' | 'LECTURES' | 'DRIVE_SYNC' | 'SCHEDULE'>('LECTURES');
  const [targetGrade, setTargetGrade] = useState<number>(course.minGrade || 6);
  const [unlockPolicy, setUnlockPolicy] = useState<UnlockPolicy>(course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION');
  const [schedulePolicy, setSchedulePolicy] = useState<SchedulePolicy>(course.defaultScheduleType || 'DAILY');

  // Course Metadata State
  const [title, setTitle] = useState(course.title);
  const [code, setCode] = useState(course.code || 'CRS-STEM-101');
  const [category, setCategory] = useState(course.category || 'Coding');
  const [difficulty, setDifficulty] = useState(course.difficulty || 'Beginner');
  const [version, setVersion] = useState(course.version || 'v1.0');
  const [description, setDescription] = useState(course.description || '');

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
    setSaveSuccessMsg(`Mapped Google Drive folder '${cleanId}' to all 30 lectures!`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const csvContent = exportLecturesToCsv(lectures);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${course.slug || 'course'}_30_lectures_curriculum.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update single lecture
  const handleUpdateLecture = (lectureNumber: number, field: keyof CurriculumLecture, value: any) => {
    setLectures(prev => prev.map(l => l.lectureNumber === lectureNumber ? { ...l, [field]: value } : l));
  };

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await onSaveCourse({
        title,
        code,
        category: category as any,
        difficulty: difficulty as any,
        version,
        description,
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
      setSaveSuccessMsg('Curriculum Studio: All 30 lectures and course metadata saved!');
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  30 Lectures Scaffolding
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure grade-wise 30-lecture curriculum, Google Drive streaming, quizzes, and educational games.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
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
              <span>30 Lectures Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('METADATA')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'METADATA' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Course Settings &amp; Grade</span>
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
          </div>

          {/* Quick Toolbar Buttons */}
          <div className="flex items-center gap-2">
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
                    Each lecture consists of Video Stream, Checkpoint Quiz, Educational Game, and XP Reward.
                  </p>
                </div>
                <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Total: {lectures.length} Lectures Configured
                </div>
              </div>

              {/* Lecture Cards Accordion List */}
              <div className="space-y-3">
                {lectures.map((lec) => {
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

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                            +{lec.xpReward} XP
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
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
                  <label className="text-xs font-bold text-slate-700">Target Grade</label>
                  <select
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(Number(e.target.value))}
                    className="w-full h-10 border border-slate-200 rounded-xl px-2 text-xs"
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
                    className="w-full h-10 border border-slate-200 rounded-xl px-2 text-xs"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Unlock Policy</label>
                <select
                  value={unlockPolicy}
                  onChange={(e) => setUnlockPolicy(e.target.value as any)}
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs"
                >
                  <option value="HYBRID_SCHEDULE_AND_COMPLETION">
                    Hybrid: Unlock when scheduled date arrives AND previous lecture completed (Recommended)
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
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE SYNC */}
          {activeTab === 'DRIVE_SYNC' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2">
                  <FolderSync className="w-5 h-5 text-blue-600" />
                  <h4 className="text-xs font-bold text-blue-900">Google Drive Bulk Video Mapping</h4>
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Provide your organization's Google Drive Folder ID. The Course Studio will automatically map
                  30 lectures to corresponding file references (`https://drive.google.com/file/d/FOLDER_ID_LEC_XX/preview`).
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Google Drive Folder ID / Reference</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={driveFolderId}
                    onChange={(e) => setDriveFolderId(e.target.value)}
                    placeholder="e.g. 1IM_STEM_GRADE_6_VIDEOS"
                    className="flex-1 h-10 border border-slate-200 rounded-xl px-3 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleBulkMapDriveFolder}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Map 30 Lectures
                  </button>
                </div>
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

        </div>

        {/* Bottom Actions Bar */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Course Studio: {lectures.length} Lectures configured • Target: Grade {targetGrade}
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
  );
}
