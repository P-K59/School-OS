"use client";

import React, { useState } from 'react';
import { X, Smartphone, Sparkles, Shield, RotateCcw } from 'lucide-react';
import { Course, CurriculumLecture, StudentLectureJourneyState } from '@/lib/types';
import { StudentMobilePortal } from '../student/student-mobile-portal';
import { LearningJourneyOrchestrator } from '@/lib/learning/journey-orchestrator';

interface CoursePreviewModalProps {
  course: Course;
  lectures: CurriculumLecture[];
  isOpen: boolean;
  onClose: () => void;
}

export function CoursePreviewModal({
  course,
  lectures,
  isOpen,
  onClose
}: CoursePreviewModalProps) {
  if (!isOpen) return null;

  // Active lecture (defaults to Lecture 1)
  const [activeLectureIndex, setActiveLectureIndex] = useState(0);
  const activeLecture = lectures[activeLectureIndex] || lectures[0] || null;

  // In-memory journey states dictionary for preview
  const [journeyStates, setJourneyStates] = useState<Record<number, StudentLectureJourneyState>>({});
  const [previewXp, setPreviewXp] = useState(250);
  const [previewLevel, setPreviewLevel] = useState(1);

  const activeLectureState = activeLecture
    ? LearningJourneyOrchestrator.getOrCreateState(activeLecture, journeyStates[activeLecture.lectureNumber])
    : null;

  // Video progress callback
  const handleVideoProgress = async (watchedSeconds: number, totalDuration: number) => {
    if (!activeLecture || !activeLectureState) return;
    const result = LearningJourneyOrchestrator.processVideoWatch(activeLecture, activeLectureState, {
      lectureNumber: activeLecture.lectureNumber,
      watchedSeconds,
      totalDurationSeconds: totalDuration
    });
    setJourneyStates(prev => ({ ...prev, [activeLecture.lectureNumber]: result.journeyState }));
    return result;
  };

  // Quiz submission callback
  const handleQuizSubmit = async (answers: Record<string, any>) => {
    if (!activeLecture || !activeLectureState) return;
    const result = LearningJourneyOrchestrator.evaluateQuizSubmission(activeLecture, activeLectureState, {
      lectureNumber: activeLecture.lectureNumber,
      answers
    });
    setJourneyStates(prev => ({ ...prev, [activeLecture.lectureNumber]: result.journeyState }));
    return result;
  };

  // Game submission callback
  const handleGameSubmit = async (score: number) => {
    if (!activeLecture || !activeLectureState) return;
    const result = LearningJourneyOrchestrator.processGameCompletion(activeLecture, activeLectureState, {
      lectureNumber: activeLecture.lectureNumber,
      score
    });

    if (result.xpAwardedThisStep > 0) {
      setPreviewXp(prev => {
        const next = prev + result.xpAwardedThisStep;
        setPreviewLevel(Math.max(1, Math.floor(next / 500) + 1));
        return next;
      });
    }

    setJourneyStates(prev => ({ ...prev, [activeLecture.lectureNumber]: result.journeyState }));

    // Auto advance to next lecture if completed
    if (activeLectureIndex < lectures.length - 1) {
      setTimeout(() => {
        setActiveLectureIndex(prev => prev + 1);
      }, 1500);
    }

    return result;
  };

  // Reset preview session
  const handleResetPreview = () => {
    setJourneyStates({});
    setActiveLectureIndex(0);
    setPreviewXp(250);
    setPreviewLevel(1);
  };

  const completedCount = Object.values(journeyStates).filter(s => s.journeyCompleted).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg flex flex-col items-center my-auto">
        
        {/* Top Control Bar */}
        <div className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl px-4 py-3 mb-3 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Mobile Student Preview</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sandbox
                </span>
              </div>
              <span className="text-[10px] text-slate-400">
                Testing {course.title} • Zero real data modified
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetPreview}
              title="Reset Preview State"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Phone Mockup Frame (390px Width - iPhone/Android standard) */}
        <div className="w-full max-w-[390px] h-[780px] bg-slate-900 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700 flex flex-col relative overflow-hidden">
          
          {/* Phone Speaker Notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-40 flex items-center justify-center">
            <div className="w-10 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* Inner Mobile Screen */}
          <div className="w-full h-full bg-slate-50 rounded-[34px] overflow-y-auto flex flex-col pt-3 relative">
            <StudentMobilePortal
              studentProfile={{
                id: 'usr-preview-superadmin',
                name: 'Cadet SuperAdmin',
                admissionNumber: 'PRV-2026-001',
                grade: `Grade ${course.minGrade || 6}`,
                section: 'A',
                schoolName: 'InnovatMind Academy (Preview Sandbox)',
                xp: previewXp,
                level: previewLevel,
                streak: 3
              }}
              course={{
                id: course.id,
                title: course.title,
                code: course.code,
                category: course.category,
                totalLessons: lectures.length
              }}
              schedule={{
                totalLectures: lectures.length,
                completedLecturesCount: completedCount,
                unlockedLecturesCount: Math.min(lectures.length, completedCount + 1),
                overallProgressPercentage: Math.round((completedCount / (lectures.length || 30)) * 100),
                isCourseCompleted: completedCount >= lectures.length
              }}
              activeLecture={activeLecture}
              activeLectureState={activeLectureState}
              onVideoProgress={handleVideoProgress}
              onSubmitQuiz={handleQuizSubmit}
              onSubmitGame={handleGameSubmit}
              onRefreshJourney={async () => {}}
              onLogout={onClose}
            />
          </div>

          {/* Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full pointer-events-none" />
        </div>

      </div>
    </div>
  );
}

