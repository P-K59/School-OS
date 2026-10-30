"use client";

import React, { useState, useEffect } from 'react';
import {
  Home,
  BookOpen,
  BarChart3,
  User,
  Sparkles,
  Flame,
  Trophy,
  Zap,
  Play,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  RotateCcw,
  Shield,
  Layers,
  Award,
  Video,
  HelpCircle,
  Gamepad2,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { MobileVideoPlayer } from './mobile-video-player';
import { InteractiveLectureQuiz } from './interactive-lecture-quiz';
import { InteractiveLectureGame } from './interactive-lecture-game';
import { CurriculumLecture, StudentLectureJourneyState } from '@/lib/types';

interface StudentMobilePortalProps {
  studentProfile: {
    id: string;
    name: string;
    admissionNumber: string;
    grade: string;
    section: string;
    schoolName: string;
    xp: number;
    level: number;
    streak: number;
  };
  course: {
    id: string;
    title: string;
    code?: string;
    category: string;
    totalLessons: number;
  };
  schedule: {
    totalLectures: number;
    completedLecturesCount: number;
    unlockedLecturesCount: number;
    overallProgressPercentage: number;
    isCourseCompleted: boolean;
    nextScheduledUnlock?: string;
  };
  activeLecture: CurriculumLecture | null;
  activeLectureState: StudentLectureJourneyState | null;
  onVideoProgress: (watchedSeconds: number, totalDuration: number) => Promise<any>;
  onSubmitQuiz: (answers: Record<string, any>) => Promise<any>;
  onSubmitGame: (score: number) => Promise<any>;
  onRefreshJourney: () => Promise<void>;
  onLogout?: () => void;
}

export function StudentMobilePortal({
  studentProfile,
  course,
  schedule,
  activeLecture,
  activeLectureState,
  onVideoProgress,
  onSubmitQuiz,
  onSubmitGame,
  onRefreshJourney,
  onLogout
}: StudentMobilePortalProps) {
  // Mobile Navigation Tabs: 'HOME' | 'LEARN' | 'PROGRESS' | 'PROFILE'
  const [activeTab, setActiveTab] = useState<'HOME' | 'LEARN' | 'PROGRESS' | 'PROFILE'>('HOME');

  // Journey Local State (synced from activeLectureState)
  const [journeyState, setJourneyState] = useState<StudentLectureJourneyState>(() => {
    return activeLectureState || {
      lectureId: activeLecture?.id || 'lec-1',
      lectureNumber: activeLecture?.lectureNumber || 1,
      isUnlocked: true,
      videoWatchedSeconds: 0,
      videoWatchPercentage: 0,
      videoCompleted: false,
      quizUnlocked: false,
      quizCompleted: false,
      quizAttempts: 0,
      gameUnlocked: false,
      gameCompleted: false,
      xpAwarded: false,
      journeyCompleted: false
    };
  });

  const [celebrationToast, setCelebrationToast] = useState<{ title: string; subtitle: string; xp: number } | null>(null);

  useEffect(() => {
    if (activeLectureState) {
      setJourneyState(activeLectureState);
    }
  }, [activeLectureState]);

  // Video progress handler
  const handleVideoProgressUpdate = async (watchedSeconds: number, totalDuration: number) => {
    if (!activeLecture) return;
    try {
      const res = await onVideoProgress(watchedSeconds, totalDuration);
      if (res && res.journeyState) {
        setJourneyState(res.journeyState);
      }
    } catch {}
  };

  // Video completion handler
  const handleVideoCompleted = async () => {
    if (!activeLecture) return;
    setJourneyState(prev => ({
      ...prev,
      videoCompleted: true,
      quizUnlocked: true
    }));
    await handleVideoProgressUpdate(
      Math.round(activeLecture.estimatedDurationMinutes * 60 * 0.85),
      activeLecture.estimatedDurationMinutes * 60
    );
  };

  // Quiz submission handler
  const handleQuizCompleted = async (score: number) => {
    if (!activeLecture) return;
    try {
      const mockAnswers: Record<string, any> = {};
      activeLecture.quiz?.questions?.forEach(q => {
        mockAnswers[q.id] = q.correctAnswer;
      });
      const res = await onSubmitQuiz(mockAnswers);
      if (res && res.journeyState) {
        setJourneyState(res.journeyState);
      } else {
        setJourneyState(prev => ({
          ...prev,
          quizCompleted: true,
          gameUnlocked: true,
          quizScore: score
        }));
      }
    } catch {
      setJourneyState(prev => ({
        ...prev,
        quizCompleted: true,
        gameUnlocked: true,
        quizScore: score
      }));
    }
  };

  // Game completion handler
  const handleGameCompleted = async (score: number) => {
    if (!activeLecture) return;
    try {
      const res = await onSubmitGame(score);
      const xpEarned = res?.xpAwardedThisStep || (activeLecture.xpReward + (activeLecture.game?.xpBonus || 50));
      setCelebrationToast({
        title: `Lecture ${activeLecture.lectureNumber} Conquered!`,
        subtitle: `Mastered ${activeLecture.topic}. +${xpEarned} XP awarded!`,
        xp: xpEarned
      });
      if (res && res.journeyState) {
        setJourneyState(res.journeyState);
      } else {
        setJourneyState(prev => ({
          ...prev,
          gameCompleted: true,
          journeyCompleted: true,
          xpAwarded: true
        }));
      }
      setTimeout(() => {
        onRefreshJourney();
      }, 1500);
    } catch {
      setCelebrationToast({
        title: `Lecture ${activeLecture.lectureNumber} Conquered!`,
        subtitle: `Mastered ${activeLecture.topic}!`,
        xp: 100
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between pb-20 select-none">
      
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
            M
          </div>
          <div>
            <span className="text-xs font-black text-slate-900 leading-none block">InnovatMind</span>
            <span className="text-[10px] text-slate-500 font-semibold">{studentProfile.schoolName}</span>
          </div>
        </div>

        {/* Gamification Pills (Streak & XP) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-700 text-xs font-black shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{studentProfile.streak}d</span>
          </div>
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full text-indigo-700 text-xs font-black shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
            <span>{studentProfile.xp} XP</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-4 space-y-4">
        
        {/* CELEBRATION TOAST */}
        {celebrationToast && (
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Trophy className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-xs font-black block">{celebrationToast.title}</span>
                <span className="text-[11px] text-emerald-100">{celebrationToast.subtitle}</span>
              </div>
            </div>
            <button
              onClick={() => setCelebrationToast(null)}
              className="text-xs font-bold px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg"
            >
              Done
            </button>
          </div>
        )}

        {/* ==============================================================
            TAB 1: HOME ("What should I learn today?")
           ============================================================== */}
        {activeTab === 'HOME' && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Cadet Welcome Banner */}
            <div className="p-5 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      Cadet Portal • {studentProfile.grade} {studentProfile.section}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                      Welcome, {studentProfile.name.split(' ')[0]}!
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-xs text-indigo-200">
                    Lvl {studentProfile.level}
                  </div>
                </div>

                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-indigo-200 block font-semibold">Today's Mission</span>
                    <span className="font-bold text-white">
                      {activeLecture ? activeLecture.title : 'All Available Missions Completed!'}
                    </span>
                  </div>
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                </div>
              </div>
            </div>

            {/* Current Active Mission Card */}
            {activeLecture ? (
              <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      #{activeLecture.lectureNumber}
                    </span>
                    <div>
                      <span className="text-xs font-black text-slate-900 block leading-tight">{activeLecture.topic}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{activeLecture.moduleName}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span>Unlocked Mission</span>
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeLecture.shortDescription}
                </p>

                {/* 3 Steps Mini Badges */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className={`p-2.5 rounded-xl border text-center ${
                    journeyState.videoCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Video className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">1. Video</span>
                    <span className="text-[9px] font-semibold">{journeyState.videoCompleted ? 'Done' : 'Watch'}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-center ${
                    journeyState.quizCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : (journeyState.quizUnlocked ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60')
                  }`}>
                    <HelpCircle className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">2. Quiz</span>
                    <span className="text-[9px] font-semibold">{journeyState.quizCompleted ? 'Passed' : (journeyState.quizUnlocked ? 'Ready' : 'Locked')}</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-center ${
                    journeyState.gameCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : (journeyState.gameUnlocked ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60')
                  }`}>
                    <Gamepad2 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">3. Game</span>
                    <span className="text-[9px] font-semibold">{journeyState.gameCompleted ? 'Conquered' : (journeyState.gameUnlocked ? 'Ready' : 'Locked')}</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={() => setActiveTab('LEARN')}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{journeyState.videoCompleted ? 'Continue Learning Journey' : 'Start Today’s Mission'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-6 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Trophy className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-black text-slate-900">All Available Sessions Mastered!</h3>
                <p className="text-xs text-slate-500">
                  You are completely caught up! The next scheduled session will unlock on schedule.
                </p>
                {schedule.nextScheduledUnlock && (
                  <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl inline-block">
                    Next unlock: {new Date(schedule.nextScheduledUnlock).toLocaleString()}
                  </div>
                )}
              </div>
            )}

            {/* Quick Course Progress Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">{course.title}</span>
                <span className="text-indigo-600">{schedule.completedLecturesCount} of {schedule.totalLectures} Completed</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${schedule.overallProgressPercentage}%` }}
                />
              </div>
            </div>

          </div>
        )}

        {/* ==============================================================
            TAB 2: LEARN (The 6-Step Interactive Learning Journey)
           ============================================================== */}
        {activeTab === 'LEARN' && activeLecture && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Mission Header */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {activeLecture.moduleName}
                </span>
                <h2 className="text-sm sm:text-base font-black text-slate-900">
                  {activeLecture.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('HOME')}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Back
              </button>
            </div>

            {/* STEP 1: VIDEO STREAMING LESSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Step 1: Watch Video Lesson</span>
                </span>
                {journeyState.videoCompleted && (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </span>
                )}
              </div>

              <MobileVideoPlayer
                videoRef={activeLecture.videoRef}
                provider={activeLecture.videoProvider}
                title={activeLecture.title}
                durationMinutes={activeLecture.estimatedDurationMinutes}
                initialWatchedSeconds={journeyState.videoWatchedSeconds}
                completionThresholdPercent={activeLecture.videoCompletionThresholdPercent || 80}
                onProgressUpdate={handleVideoProgressUpdate}
                onVideoCompleted={handleVideoCompleted}
              />
            </div>

            {/* STEP 2: CHECKPOINT QUIZ */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Checkpoint Quiz</span>
                </span>
                {journeyState.quizCompleted ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Passed ({journeyState.quizScore}%)</span>
                  </span>
                ) : (
                  !journeyState.quizUnlocked && (
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Watch video to unlock</span>
                    </span>
                  )
                )}
              </div>

              {journeyState.quizUnlocked ? (
                activeLecture.quiz ? (
                  <InteractiveLectureQuiz
                    quiz={activeLecture.quiz}
                    lectureNumber={activeLecture.lectureNumber}
                    onQuizCompleted={handleQuizCompleted}
                  />
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    No checkpoint quiz required for this session.
                  </div>
                )
              ) : (
                <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-600">Quiz Locked</span>
                  <span className="text-[11px]">Watch at least 80% of the video lesson above to unlock this quiz.</span>
                </div>
              )}
            </div>

            {/* STEP 3: EDUCATIONAL GAME CHALLENGE */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="w-4 h-4 text-purple-600" />
                  <span>Step 3: Educational Game Challenge</span>
                </span>
                {journeyState.gameCompleted ? (
                  <span className="text-emerald-600 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered!</span>
                  </span>
                ) : (
                  !journeyState.gameUnlocked && (
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pass quiz to unlock</span>
                    </span>
                  )
                )}
              </div>

              {journeyState.gameUnlocked ? (
                activeLecture.game ? (
                  <InteractiveLectureGame
                    game={activeLecture.game}
                    lectureNumber={activeLecture.lectureNumber}
                    onGameCompleted={handleGameCompleted}
                  />
                ) : (
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                    Challenge complete!
                  </div>
                )
              ) : (
                <div className="p-5 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-600">Game Challenge Locked</span>
                  <span className="text-[11px]">Pass the checkpoint quiz above to unlock this interactive learning game.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==============================================================
            TAB 3: PROGRESS & BADGES
           ============================================================== */}
        {activeTab === 'PROGRESS' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-black text-slate-900">Curriculum Progress</h3>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <span className="text-2xl font-black text-indigo-700">{schedule.completedLecturesCount}</span>
                  <span className="text-[11px] font-bold text-indigo-500 block">Lectures Completed</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                  <span className="text-2xl font-black text-purple-700">{schedule.totalLectures}</span>
                  <span className="text-[11px] font-bold text-purple-500 block">Total Course Lectures</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Overall Mastery</span>
                  <span>{schedule.overallProgressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${schedule.overallProgressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Badges Ribbon */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
              <h3 className="text-sm font-black text-slate-900">Unlocked Badges</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'First Mission', icon: Zap, unlocked: schedule.completedLecturesCount >= 1 },
                  { name: 'Quiz Master', icon: Trophy, unlocked: schedule.completedLecturesCount >= 2 },
                  { name: 'Unit 1 Mastery', icon: Award, unlocked: schedule.completedLecturesCount >= 5 }
                ].map((b, i) => {
                  const Icon = b.icon;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 ${
                        b.unlocked ? 'bg-amber-50/60 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-amber-500" />
                      <span className="text-[10px] font-bold">{b.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==============================================================
            TAB 4: PROFILE
           ============================================================== */}
        {activeTab === 'PROFILE' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
                {studentProfile.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{studentProfile.name}</h3>
                <span className="text-xs text-slate-500">{studentProfile.admissionNumber}</span>
              </div>
              <div className="text-xs text-indigo-600 font-bold bg-indigo-50 py-1 px-3 rounded-full inline-block">
                {studentProfile.grade} • Section {studentProfile.section}
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">School</span>
                <span className="font-bold text-slate-800">{studentProfile.schoolName}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Cadet Level</span>
                <span className="font-bold text-slate-800">Level {studentProfile.level}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-slate-500">Total XP</span>
                <span className="font-bold text-slate-800">{studentProfile.xp} XP</span>
              </div>
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="w-full h-11 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-2xl border border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}

      </main>

      {/* ==============================================================
          BOTTOM MOBILE NAVIGATION BAR (Sticky Fixed on Smartphones)
         ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-6 safe-area-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          
          <button
            type="button"
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'HOME' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LEARN')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'LEARN' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Learn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROGRESS')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'PROGRESS' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Progress</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer ${
              activeTab === 'PROFILE' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Profile</span>
          </button>

        </div>
      </nav>

    </div>
  );
}
