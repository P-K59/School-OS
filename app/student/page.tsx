"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { DragAndDropCodingGame } from '@/components/student/drag-and-drop-game';
import { QuizBattleModal } from '@/components/student/quiz-battle-modal';
import { AiMentorDialog } from '@/components/student/ai-mentor-dialog';
import { LearningIslandDrawer, ISLANDS_DATA, IslandInfo } from '@/components/student/learning-island-drawer';
import { StudentMobilePortal } from '@/components/student/student-mobile-portal';
import {
  Sparkles,
  Trophy,
  Zap,
  Play,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award,
  Crown,
  Coins,
  Brain,
  Bot,
  Layers,
  Code2,
  Gamepad2,
  Cpu,
  ArrowRight,
  FolderKanban,
  Check,
  Star,
  Users,
  Target,
  Compass,
  Bookmark,
  Volume2,
  Terminal,
  BookOpen,
  LayoutDashboard,
  User,
  Shield,
  Activity,
  BarChart3,
  Search,
  ExternalLink,
  Lock,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';

export default function StudentPortalPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-[500px] flex items-center justify-center p-8 text-slate-500 font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Entering Cadet Learning World...</span>
        </div>
      </div>
    }>
      {!mounted ? (
        <div className="min-h-[500px] flex items-center justify-center p-8 text-slate-500 font-bold">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span>Entering Cadet Learning World...</span>
          </div>
        </div>
      ) : (
        <GamifiedStudentPortal />
      )}
    </Suspense>
  );
}

function GamifiedStudentPortal() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  const { currentUser, role, dataMode } = useAuth();

  const isActualStudent = Boolean(
    dataMode === 'PRODUCTION' &&
    currentUser &&
    currentUser.schoolId &&
    currentUser.schoolId !== 'sch-del-001' &&
    currentUser.schoolId !== 'school-1' &&
    currentUser.schoolId !== 'school-2' &&
    currentUser.schoolId !== 'school-3' &&
    currentUser.id !== 'stud-1' &&
    currentUser.id !== 'usr-student-1'
  );

  // Gamification state with localStorage persistence
  const [studentXp, setStudentXp] = useState<number>(isActualStudent ? ((currentUser as any)?.currentXp || 0) : 1820);
  const [studentCoins, setStudentCoins] = useState<number>(isActualStudent ? 0 : 450);
  const [studentStreak, setStudentStreak] = useState<number>(isActualStudent ? 0 : 12);
  const [studentLevel, setStudentLevel] = useState<number>(isActualStudent ? 1 : 12);

  // Quest states
  const [completedQuests, setCompletedQuests] = useState<string[]>(isActualStudent ? [] : ['quest-1']);
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'CLASS' | 'SCHOOL'>('CLASS');

  // Mobile-First 30-Lecture Learning Portal State
  const [viewMode, setViewMode] = useState<'MOBILE_PORTAL' | 'CADET_CAMPUS'>('MOBILE_PORTAL');
  const [journeyData, setJourneyData] = useState<any>(null);
  const [isLoadingJourney, setIsLoadingJourney] = useState(true);

  const fetchJourney = async () => {
    try {
      const studentId = currentUser?.studentId || currentUser?.id || 'stud-1';
      const res = await fetch(`/api/courses/learning-journey?studentId=${studentId}`, {
        headers: {
          'x-user-role': 'STUDENT',
          'x-user-id': studentId
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJourneyData(data);
      }
    } catch (err) {
      console.error('Failed to fetch learning journey', err);
    } finally {
      setIsLoadingJourney(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, [currentUser?.id]);

  const handleVideoProgress = async (watchedSeconds: number, totalDuration: number) => {
    const studentId = currentUser?.studentId || currentUser?.id || 'stud-1';
    const courseId = journeyData?.course?.id || 'crs-stem-101';
    const lectureNumber = journeyData?.activeLecture?.lectureNumber || 1;
    const res = await fetch('/api/courses/learning-journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'STUDENT', 'x-user-id': studentId },
      body: JSON.stringify({ action: 'video_progress', studentId, courseId, lectureNumber, watchedSeconds, totalDurationSeconds: totalDuration })
    });
    return res.json();
  };

  const handleSubmitQuiz = async (answers: Record<string, any>) => {
    const studentId = currentUser?.studentId || currentUser?.id || 'stud-1';
    const courseId = journeyData?.course?.id || 'crs-stem-101';
    const lectureNumber = journeyData?.activeLecture?.lectureNumber || 1;
    const res = await fetch('/api/courses/learning-journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'STUDENT', 'x-user-id': studentId },
      body: JSON.stringify({ action: 'submit_quiz', studentId, courseId, lectureNumber, answers })
    });
    return res.json();
  };

  const handleSubmitGame = async (score: number) => {
    const studentId = currentUser?.studentId || currentUser?.id || 'stud-1';
    const courseId = journeyData?.course?.id || 'crs-stem-101';
    const lectureNumber = journeyData?.activeLecture?.lectureNumber || 1;
    const res = await fetch('/api/courses/learning-journey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'STUDENT', 'x-user-id': studentId },
      body: JSON.stringify({ action: 'submit_game', studentId, courseId, lectureNumber, score })
    });
    return res.json();
  };

  // Interactive Modals
  const [isPlayingGame, setIsPlayingGame] = useState(false);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [isAiMentorOpen, setIsAiMentorOpen] = useState(false);
  const [selectedIsland, setSelectedIsland] = useState<IslandInfo | null>(null);
  const [celebrationToast, setCelebrationToast] = useState<{ title: string; subtitle: string } | null>(null);

  // Coding Lab Sandbox State
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'blockly'>('python');
  const [activeSnippet, setActiveSnippet] = useState<string>('rover');
  const [customCode, setCustomCode] = useState<string>(
`# Mission: Mars Rover Obstacle Navigator
import robot_core as rover

print("Initializing Rover Lidar Sensor...")
rover.speed(150)

for step in range(1, 4):
    distance = rover.read_ultrasonic_cm()
    print(f"Step {step}: Distance ahead = {distance}cm")
    if distance > 30:
        rover.move_forward(10)
        print(">> Path clear. Moving forward 10cm.")
    else:
        rover.turn_right(90)
        print(">> Obstacle detected! Turning right 90 degrees.")

print("Mission Goal Accomplished! Cadet XP rewarded.")`
  );
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Robotics Lab State
  const [sensorDistance, setSensorDistance] = useState<number>(45);
  const [motorSpeed, setMotorSpeed] = useState<number>(180);
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  // AI Lab State
  const [selectedSpecimen, setSelectedSpecimen] = useState<'rover_wheel' | 'apple' | 'obstacle_cone' | 'solar_panel'>('rover_wheel');

  // Capstone Project Submission State
  const [isSubmitProjectOpen, setIsSubmitProjectOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [userProjects, setUserProjects] = useState(isActualStudent ? [] : [
    {
      id: 'proj-1',
      title: 'Smart Solar Street Light with LDR & Arduino',
      course: 'Robotics & Sensors with Arduino',
      status: 'GRADED',
      grade: 'A+',
      xpAwarded: 300,
      feedback: 'Excellent circuit assembly and modular code! Consider adding a potentiometer for twilight sensitivity calibration next.',
      trainer: 'Trainer Vikram Sethi',
      date: '2026-10-22'
    },
    {
      id: 'proj-2',
      title: 'Automated Waste Sorter with AI Vision',
      course: 'AI Cadet: Vision & Voice',
      status: 'IN_REVIEW',
      grade: 'Pending Review',
      xpAwarded: 250,
      feedback: 'Milestone 2 uploaded. Trainer currently testing classification on recyclable plastics dataset.',
      trainer: 'Trainer Sneha Rao',
      date: '2026-10-25'
    }
  ]);

  // Load persisted gamification state
  useEffect(() => {
    try {
      if (isActualStudent) {
        const studentId = currentUser?.id || (currentUser as any)?.studentId || 'actual';
        const savedXp = localStorage.getItem(`student_xp_${studentId}`);
        const savedCoins = localStorage.getItem(`student_coins_${studentId}`);
        const savedQuests = localStorage.getItem(`student_quests_${studentId}`);

        if (savedXp) {
          const num = Number(savedXp);
          setStudentXp(num);
          setStudentLevel(Math.max(1, Math.floor(num / 200) + 1));
        } else {
          const initXp = (currentUser as any)?.currentXp || 0;
          setStudentXp(initXp);
          setStudentLevel(Math.max(1, Math.floor(initXp / 200) + 1));
        }
        if (savedCoins) setStudentCoins(Number(savedCoins));
        else setStudentCoins(0);

        if (savedQuests) setCompletedQuests(JSON.parse(savedQuests));
        else setCompletedQuests([]);

        setUserProjects([]);
      } else {
        const savedXp = localStorage.getItem('student_xp');
        const savedCoins = localStorage.getItem('student_coins');
        const savedQuests = localStorage.getItem('student_quests');

        setStudentXp(savedXp ? Number(savedXp) : 1820);
        setStudentCoins(savedCoins ? Number(savedCoins) : 450);
        setStudentStreak(12);
        setStudentLevel(12);
        setCompletedQuests(savedQuests ? JSON.parse(savedQuests) : ['quest-1']);
      }
    } catch {}
  }, [currentUser?.id, isActualStudent]);

  // Award rewards idempotently
  const handleAwardReward = (xpToAdd: number, coinsToAdd: number, reason: string) => {
    const studentId = currentUser?.id || (currentUser as any)?.studentId || 'actual';
    const xpKey = isActualStudent ? `student_xp_${studentId}` : 'student_xp';
    const coinsKey = isActualStudent ? `student_coins_${studentId}` : 'student_coins';
    const questsKey = isActualStudent ? `student_quests_${studentId}` : 'student_quests';

    setStudentXp(prev => {
      const nextXp = prev + xpToAdd;
      try { localStorage.setItem(xpKey, String(nextXp)); } catch {}
      setStudentLevel(Math.max(1, Math.floor(nextXp / 200) + 1));
      return nextXp;
    });

    setStudentCoins(prev => {
      const nextCoins = prev + coinsToAdd;
      try { localStorage.setItem(coinsKey, String(nextCoins)); } catch {}
      return nextCoins;
    });

    // Mark quest done
    setCompletedQuests(prev => {
      const updated = Array.from(new Set([...prev, 'quest-2']));
      try { localStorage.setItem(questsKey, JSON.stringify(updated)); } catch {}
      return updated;
    });

    setCelebrationToast({
      title: `🎉 ${reason}!`,
      subtitle: `+${xpToAdd} XP & +${coinsToAdd} Coins credited to your Cadet Vault!`
    });

    setTimeout(() => {
      setCelebrationToast(null);
    }, 5000);
  };

  // Run Code in Coding Lab
  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput(['[SYSTEM] Compiling Python 3.11 AST...', '[SYSTEM] Connecting to Virtual Cadet Sandbox...']);

    setTimeout(() => {
      setConsoleOutput(prev => [
        ...prev,
        '>> Initializing Rover Lidar Sensor...',
        '>> Setting motor speed to 150 RPM',
        '>> Step 1: Distance ahead = 48cm',
        '>> Path clear. Moving forward 10cm.',
        '>> Step 2: Distance ahead = 38cm',
        '>> Path clear. Moving forward 10cm.',
        '>> Step 3: Distance ahead = 18cm',
        '>> Obstacle detected! Turning right 90 degrees.',
        '>> Mission Goal Accomplished! Cadet XP rewarded.',
        '[EXECUTION FINISHED] Process exited with code 0 (124ms)'
      ]);
      setIsRunningCode(false);
      handleAwardReward(30, 5, 'Code Execution Succeeded');
    }, 1200);
  };

  const studentDisplayName = currentUser?.role === 'STUDENT' ? currentUser.firstName : 'Aarav';
  const xpThreshold = 2000;
  const xpProgressPercent = Math.min(100, Math.round((studentXp / xpThreshold) * 100));

  if (viewMode === 'MOBILE_PORTAL') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Quick Portal Switcher Ribbon */}
        <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs">Mobile-First 30-Lecture Portal • One Lecture at a Time</span>
          </div>
          <button
            onClick={() => setViewMode('CADET_CAMPUS')}
            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[11px] font-semibold text-indigo-300 hover:text-white transition-colors cursor-pointer"
          >
            Cadet Campus Labs →
          </button>
        </div>

        <StudentMobilePortal
          studentProfile={{
            id: currentUser?.id || 'stud-1',
            name: currentUser?.displayName || 'Aarav Verma',
            admissionNumber: currentUser?.admissionNumber || 'STU-2026-00101',
            grade: currentUser?.gradeName || 'Grade 6',
            section: currentUser?.sectionName || 'A',
            schoolName: currentUser?.schoolName || 'Apex National Academy',
            xp: studentXp,
            level: studentLevel,
            streak: studentStreak
          }}
          course={journeyData?.course || {
            id: 'crs-stem-101',
            title: 'Python & AI Foundations',
            code: 'CRS-COD-101',
            category: 'Coding',
            totalLessons: 30
          }}
          schedule={journeyData?.schedule || {
            totalLectures: 30,
            completedLecturesCount: 1,
            unlockedLecturesCount: 2,
            overallProgressPercentage: 3,
            isCourseCompleted: false,
            nextScheduledUnlock: new Date(Date.now() + 86400000).toISOString()
          }}
          activeLecture={journeyData?.activeLecture}
          activeLectureState={journeyData?.activeLectureState}
          onVideoProgress={handleVideoProgress}
          onSubmitQuiz={handleSubmitQuiz}
          onSubmitGame={handleSubmitGame}
          onRefreshJourney={fetchJourney}
        />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-12 animate-fade-in font-sans">
        {/* Banner to Switch back to Mobile-First Portal */}
        <div className="p-3 bg-gradient-to-r from-indigo-900 to-purple-900 text-white rounded-2xl flex items-center justify-between text-xs shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base">📱</span>
            <span className="font-bold">Automatic 30-Lecture Mobile Journey is Active</span>
          </div>
          <button
            onClick={() => setViewMode('MOBILE_PORTAL')}
            className="px-3 py-1 bg-white text-indigo-900 font-bold rounded-xl text-xs shadow-xs hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            Open Mobile Portal →
          </button>
        </div>
        
        {/* Celebration Toast */}
        {celebrationToast && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-2xl flex items-center gap-3 animate-slide-in border border-white/20">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              🌟
            </div>
            <div>
              <h4 className="text-sm font-black">{celebrationToast.title}</h4>
              <p className="text-xs text-white/90">{celebrationToast.subtitle}</p>
            </div>
          </div>
        )}

        {/* =========================================================================
            TOP WELCOME & GAMIFICATION HEADER BAR
           ========================================================================= */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs min-w-0">
          
          {/* Left: Avatar & Greeting */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 p-0.5 shadow-md">
                <div className="w-full h-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center text-white text-2xl font-black">
                  👦
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 truncate">
                <span>Hi {studentDisplayName}!</span>
                <span className="animate-wave inline-block origin-bottom-right shrink-0">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                Ready for a new adventure today?
              </p>
            </div>
          </div>

          {/* Right: Gamification Badges (Level, Coins, Streak) */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            
            {/* Level Card */}
            <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/80 shadow-xs flex items-center gap-2.5 sm:gap-3 shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm sm:text-base shadow-xs shrink-0">
                👑
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">
                    Level {studentLevel}
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 font-mono">
                    {studentXp.toLocaleString()} / {xpThreshold.toLocaleString()} XP
                  </span>
                </div>
                {/* XP Progress Bar */}
                <div className="w-24 sm:w-36 h-2 bg-amber-200/60 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000 shadow-xs"
                    style={{ width: `${xpProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Coins Card */}
            <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-xs flex items-center gap-2 border border-amber-300 shrink-0">
              <span className="text-base sm:text-lg">🪙</span>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black">{studentCoins}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-900/80">Coins</span>
              </div>
            </div>

            {/* Streak Card */}
            <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-black shadow-xs flex items-center gap-2 border border-rose-400 shrink-0">
              <span className="text-base sm:text-lg animate-pulse">🔥</span>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-black">{studentStreak}</span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-rose-100">Day Streak</span>
              </div>
            </div>

          </div>
        </div>

        {/* =========================================================================
            CONDITIONAL TAB ROUTING VIEWPORT
           ========================================================================= */}

        {/* 1. HOME TAB: 3D Floating Islands Map & Dashboard Overview */}
        {(activeTab === 'home') && (
          <div className="space-y-6">
            
            {/* 3D Floating Islands Map */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-200/80 shadow-2xl bg-slate-950 w-full max-w-full">
              <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px]">
                <img
                  src="/images/learning-world-map.jpg"
                  alt="Your Learning World"
                  className="w-full h-full object-cover object-center filter saturate-110 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20 pointer-events-none" />

                {/* Wooden Signpost Badge */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 pointer-events-auto">
                  <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-900/90 via-amber-800/90 to-amber-950/90 border-2 border-amber-600/70 shadow-2xl text-white backdrop-blur-md">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                      Interactive Adventure
                    </span>
                    <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5 drop-shadow">
                      <span>Your Learning World</span>
                      <span>🗺️</span>
                    </h2>
                  </div>
                </div>

                {/* Top-Right Mission Goal Card */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 w-60 sm:w-72 max-w-[calc(100%-2rem)] pointer-events-auto">
                  <div className="p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-indigo-950/90 via-slate-900/90 to-purple-950/90 border border-indigo-400/50 shadow-2xl text-white backdrop-blur-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-400/40 text-pink-300 flex items-center justify-center text-xs font-black">
                          🎯
                        </div>
                        <span className="text-xs font-extrabold text-white">Today&apos;s Goal</span>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
                        1 / 3
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-indigo-400 rounded-full w-1/3" />
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50 text-slate-900 border-2 border-amber-300 shadow-md">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 block">
                        Current Mission
                      </span>
                      <div className="flex items-center gap-2 my-1">
                        <span className="text-lg">🧩</span>
                        <span className="text-xs font-black text-slate-900 leading-tight">
                          Complete the Puzzle Game
                        </span>
                      </div>
                      <button
                        onClick={() => setIsPlayingGame(true)}
                        className="w-full mt-2 h-8 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start Mission</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Clickable Hotspots for the 5 Islands */}
                <div className="absolute bottom-0 left-0 right-0 h-32 z-10 flex items-end justify-around pb-6 sm:pb-8 px-4 pointer-events-auto">
                  <button
                    onClick={() => setSelectedIsland(ISLANDS_DATA[0])}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/50 border-2 border-white group-hover:scale-110 transition-transform">
                      1
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-emerald-400/60 text-white text-[11px] font-extrabold text-center shadow-md">
                      <span className="block text-emerald-400">Starter Island</span>
                      <span className="text-[9px] text-slate-300 font-medium">Computer Basics</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedIsland(ISLANDS_DATA[1])}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-cyan-500/50 border-2 border-white group-hover:scale-110 transition-transform animate-bounce">
                      2
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-400/60 text-white text-[11px] font-extrabold text-center shadow-md">
                      <span className="block text-cyan-400">Coding City</span>
                      <span className="text-[9px] text-slate-300 font-medium">Blockly &amp; Python</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedIsland(ISLANDS_DATA[2])}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-amber-500/50 border-2 border-white group-hover:scale-110 transition-transform">
                      3
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-amber-400/60 text-white text-[11px] font-extrabold text-center shadow-md">
                      <span className="block text-amber-400">Robotics Lab</span>
                      <span className="text-[9px] text-slate-300 font-medium">Build &amp; Simulate</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedIsland(ISLANDS_DATA[3])}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-600 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-purple-600/50 border-2 border-white group-hover:scale-110 transition-transform">
                      4
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-purple-400/60 text-white text-[11px] font-extrabold text-center shadow-md">
                      <span className="block text-purple-400">AI Mountain</span>
                      <span className="text-[9px] text-slate-300 font-medium">Explore AI</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedIsland(ISLANDS_DATA[4])}
                    className="group flex flex-col items-center focus:outline-none cursor-pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-500/50 border-2 border-white group-hover:scale-110 transition-transform">
                      5
                    </div>
                    <div className="mt-1 px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-rose-400/60 text-white text-[11px] font-extrabold text-center shadow-md">
                      <span className="block text-rose-400">Innovation Space</span>
                      <span className="text-[9px] text-slate-300 font-medium">Real Projects</span>
                    </div>
                  </button>
                </div>

              </div>
            </div>

            {/* Quick Action Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => setIsPlayingGame(true)}
                    className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 hover:scale-105 transition-transform shrink-0"
                  >
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </button>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Continue Learning
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      Python: Loops with Game
                    </h3>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Progress</span>
                    <span className="text-emerald-600 font-mono">60%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-3/5" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-amber-300 hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 shadow-xs border border-amber-200/60">
                    🏆
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Next Quiz
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      Logic Challenge
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlayingQuiz(true)}
                  className="w-full h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Play Quiz</span>
                </button>
              </div>

              <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-cyan-300 hover:shadow-lg transition-all flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-xl shrink-0 shadow-xs border border-cyan-200/60">
                    🤖
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Build Project
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      Smart Street Light
                    </h3>
                  </div>
                </div>

                <Link
                  href="/student?tab=projects"
                  className="w-full h-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs border border-indigo-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>View Projects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white border border-indigo-500/30 shadow-md flex flex-col justify-between">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md p-1 shrink-0 overflow-hidden">
                    <img
                      src="/images/robot-mentor.png"
                      alt="AI Mentor"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 block">
                      AI Mentor
                    </span>
                    <h3 className="text-xs font-bold text-white truncate">
                      Ask Doubts, Get Hints!
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiMentorOpen(true)}
                  className="w-full h-9 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Chat Now</span>
                </button>
              </div>
            </div>

            {/* Quests, Achievements, Leaderboard Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-4 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm font-bold">
                      🎯
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Today&apos;s Quests</h3>
                  </div>
                  <Link href="/student?tab=games" className="text-[11px] font-extrabold text-indigo-600 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Complete 1 coding level
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-700">
                          <span>+100 XP</span>
                          <span>•</span>
                          <span>+20 🪙</span>
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[10px] font-black">
                      Done ✓
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                        2
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Play 2 quiz games
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-700">
                          <span>+50 XP</span>
                          <span>•</span>
                          <span>+10 🪙</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsPlayingQuiz(true)}
                      className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black transition-colors cursor-pointer"
                    >
                      Go →
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                      🏆
                    </div>
                    <h3 className="text-sm font-black text-slate-900">Leaderboard Highlights</h3>
                  </div>
                  <Link href="/student?tab=leaderboard" className="text-[11px] font-extrabold text-indigo-600 hover:underline">
                    Full Board →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-300/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-xs">
                      🥇
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-amber-800 block">Rank #1</span>
                      <h4 className="text-xs font-black text-slate-900 truncate">Rohan Mehra</h4>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">2,420 XP</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-400 flex items-center gap-3 relative shadow-xs">
                    <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-black">
                      YOU
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      🥈
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-indigo-800 block">Rank #2</span>
                      <h4 className="text-xs font-black text-slate-900 truncate">Aarav Verma</h4>
                      <span className="text-[10px] font-bold text-indigo-700 font-mono">{studentXp} XP</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-100 border border-orange-300/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-400 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      🥉
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase text-orange-800 block">Rank #3</span>
                      <h4 className="text-xs font-black text-slate-900 truncate">Ananya Joshi</h4>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">1,740 XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. MY LEARNING TAB: Active STEM Courses & Progress */}
        {(activeTab === 'learning') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">Enrolled Curriculum</span>
                <h2 className="text-xl sm:text-2xl font-black">My STEM Learning Track 📚</h2>
                <p className="text-xs text-blue-100 mt-0.5">Explore active modules, interactive coding environments, and upcoming lab workshops.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black text-white">
                  3 Enrolled Courses
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* Course 1 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-xs border border-indigo-100">
                    💻
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Grade 6-A • Computer Science</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">Creative Computing &amp; Python</h3>
                    <p className="text-xs text-slate-500 mt-1">Master logic, loops, conditional branching, and 2D games in visual Blockly and Python.</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="text-indigo-600 font-mono font-black">68% (14/20 Modules)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full w-[68%]" />
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Module:</span>
                    <span className="font-extrabold text-slate-900">Module 15: Nested Loops &amp; Matrix Grids</span>
                  </div>
                </div>

                <Link
                  href="/student?tab=coding"
                  className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open Coding Lab</span>
                </Link>
              </div>

              {/* Course 2 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-xs border border-amber-100">
                    🦾
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Grade 6-A • Hardware &amp; IoT</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">Robotics &amp; Sensors with Arduino</h3>
                    <p className="text-xs text-slate-500 mt-1">Assemble virtual breadboards, ultrasonic sonar sensors, servo motors, and autonomous rovers.</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="text-amber-600 font-mono font-black">45% (9/20 Modules)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-[45%]" />
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Module:</span>
                    <span className="font-extrabold text-slate-900">Module 10: Ultrasonic HC-SR04 Braking</span>
                  </div>
                </div>

                <Link
                  href="/student?tab=robotics"
                  className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Launch Robotics Lab</span>
                </Link>
              </div>

              {/* Course 3 */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-400 hover:shadow-md transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shadow-xs border border-purple-100">
                    🧠
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600">Grade 6-A • Artificial Intelligence</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">AI Cadet: Vision &amp; Voice Intelligence</h3>
                    <p className="text-xs text-slate-500 mt-1">Train neural network image classifiers, explore computer vision, and understand AI safety.</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                      <span>Progress</span>
                      <span className="text-purple-600 font-mono font-black">30% (6/20 Modules)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-[30%]" />
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Current Module:</span>
                    <span className="font-extrabold text-slate-900">Module 7: Object Classification Pipeline</span>
                  </div>
                </div>

                <Link
                  href="/student?tab=ai"
                  className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Enter AI Lab</span>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* 3. CODING LAB TAB: Interactive Runnable Code Sandbox */}
        {(activeTab === 'coding') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl border border-cyan-500/30">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Cadet Coding Studio &amp; Simulator 💻</h2>
                  <p className="text-xs text-slate-400">Write real Python code or visual blocks, execute in virtual sandbox, and earn live XP.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAiMentorOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Mentor</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Code Editor & Mission Selector (7 cols) */}
              <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl">
                
                {/* Editor Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-mono text-slate-400 ml-2">mission_rover_bot.py</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCodeLanguage(codeLanguage === 'python' ? 'blockly' : 'python')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-bold text-[11px] transition-colors"
                    >
                      {codeLanguage === 'python' ? 'Switch to Blocks' : 'Switch to Python'}
                    </button>
                    <button
                      onClick={() => {
                        setCustomCode(
`# Reset to default
import robot_core as rover
print("Ready for command sequence...")`
                        );
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white"
                      title="Reset Code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Area */}
                <div className="relative">
                  <textarea
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-900/90 text-emerald-300 font-mono text-xs sm:text-sm p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-colors leading-relaxed selection:bg-cyan-500/30 resize-none"
                    spellCheck={false}
                  />
                </div>

                {/* Execution Controls */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Cadet Sandbox • Virtual MicroPython 3.11
                  </span>

                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isRunningCode ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Simulating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Run Code (▶ +30 XP)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Terminal Output (5 cols) */}
              <div className="lg:col-span-5 bg-slate-950 rounded-3xl border border-slate-800 p-5 space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <span>Virtual Robot Console Output</span>
                    </span>
                    <button
                      onClick={() => setConsoleOutput([])}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-black/70 border border-slate-800 min-h-[220px] max-h-[280px] overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
                    {consoleOutput.length === 0 ? (
                      <span className="text-slate-600 italic">Click &quot;Run Code&quot; to execute your Python script in the simulator...</span>
                    ) : (
                      consoleOutput.map((line, idx) => (
                        <div key={idx} className={line.startsWith('>>') ? 'text-cyan-300' : line.includes('Finished') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {line}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🚀</span>
                    <span>Want interactive visual blocks?</span>
                  </div>
                  <button
                    onClick={() => setIsPlayingGame(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs cursor-pointer"
                  >
                    Play Block Maze
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 4. ROBOTICS LAB TAB: Interactive Hardware & Arduino Simulator */}
        {(activeTab === 'robotics') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-amber-500 text-slate-950 shadow-xl border border-amber-400">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center text-2xl shadow-md">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">Virtual Robotics &amp; Hardware Workbench 🦾</h2>
                  <p className="text-xs text-amber-950 font-bold">Simulate Arduino Uno, Ultrasonic Sonar, and autonomous obstacle avoidance in real time.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-2xl bg-slate-950 text-amber-300 text-xs font-black shadow-xs">
                  Hardware Sim: ACTIVE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Sensor & Motor Controls (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span>Interactive Sensor Controls</span>
                </h3>

                {/* Ultrasonic Range Slider */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-700">Ultrasonic Distance to Obstacle</span>
                    <span className={`px-2 py-0.5 rounded-lg font-mono ${sensorDistance < 25 ? 'bg-rose-100 text-rose-700 font-extrabold' : 'bg-emerald-100 text-emerald-800'}`}>
                      {sensorDistance} cm
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={sensorDistance}
                    onChange={(e) => setSensorDistance(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>10 cm (Close)</span>
                    <span>75 cm</span>
                    <span>150 cm (Far)</span>
                  </div>
                </div>

                {/* Motor Speed Slider */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-slate-700">Motor DC Speed</span>
                    <span className="px-2 py-0.5 rounded-lg font-mono bg-indigo-100 text-indigo-700">
                      {motorSpeed} RPM
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    value={motorSpeed}
                    onChange={(e) => setMotorSpeed(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                    <span>0 RPM (Halt)</span>
                    <span>150 RPM</span>
                    <span>300 RPM (Max)</span>
                  </div>
                </div>

                {/* Flash to Board Button */}
                <button
                  onClick={() => handleAwardReward(50, 10, 'Hardware Program Flashed')}
                  className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>Flash Code to Virtual Arduino (+50 XP)</span>
                </button>
              </div>

              {/* Virtual Arena Visualizer (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-mono text-slate-400">Virtual Rover Arena (Top-Down Sonar Feed)</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${sensorDistance < 25 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                      <span className="text-xs font-bold text-slate-300">
                        {sensorDistance < 25 ? 'BRAKE ENGAGED' : 'CRUISING'}
                      </span>
                    </div>
                  </div>

                  {/* 2D Canvas Representation */}
                  <div className="relative mt-4 h-56 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center">
                    
                    {/* Obstacle Box */}
                    <div
                      className="absolute right-8 w-12 h-24 rounded-xl bg-gradient-to-b from-rose-500 to-red-700 flex flex-col items-center justify-center text-white text-xs font-black shadow-lg"
                      style={{ opacity: sensorDistance < 25 ? 1 : 0.7 }}
                    >
                      <span>CONE</span>
                      <span className="text-[10px]">🚧</span>
                    </div>

                    {/* Sonar Waves */}
                    <div
                      className="absolute rounded-full border-2 border-dashed border-cyan-400/40 pointer-events-none transition-all duration-300"
                      style={{
                        width: `${sensorDistance * 3}px`,
                        height: `${sensorDistance * 3}px`,
                        left: '20%'
                      }}
                    />

                    {/* Rover Body */}
                    <div
                      className="absolute left-[20%] w-24 h-20 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 p-2 shadow-xl flex flex-col items-center justify-between transition-transform duration-300"
                      style={{
                        transform: sensorDistance < 25 ? 'rotate(-15deg)' : 'none'
                      }}
                    >
                      <span className="text-[9px] font-black uppercase">ROVER BOT</span>
                      <span className="text-xl">🤖</span>
                      <span className="text-[9px] font-mono font-bold">{motorSpeed} RPM</span>
                    </div>
                  </div>
                </div>

                {/* Real-time telemetry status */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Logic State:</span>
                  <span className={`font-mono font-black ${sensorDistance < 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {sensorDistance < 25
                      ? 'IF distance < 25cm -> TURN 90° & REVERSE'
                      : 'IF distance >= 25cm -> DRIVE FORWARD'}
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. AI LAB TAB: Interactive Machine Learning Specimen Classifier */}
        {(activeTab === 'ai') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-purple-700 to-indigo-900 text-white shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-purple-300 flex items-center justify-center text-2xl border border-white/20">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black">AI &amp; Neural Network Cadet Lab 🧠</h2>
                  <p className="text-xs text-purple-200">Explore Computer Vision, Object Classification, and test deep learning models interactively.</p>
                </div>
              </div>

              <button
                onClick={() => setIsAiMentorOpen(true)}
                className="px-4 py-2 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chat with Nova AI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Specimen Picker (5 cols) */}
              <div className="lg:col-span-5 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900">Select Test Specimen for Neural Inference:</h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedSpecimen('rover_wheel')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${selectedSpecimen === 'rover_wheel' ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span className="text-3xl block mb-1">⚙️</span>
                    <span className="text-xs font-black text-slate-900 block">Rover Gear</span>
                    <span className="text-[10px] text-slate-400">Mechanical Part</span>
                  </button>

                  <button
                    onClick={() => setSelectedSpecimen('apple')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${selectedSpecimen === 'apple' ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span className="text-3xl block mb-1">🍎</span>
                    <span className="text-xs font-black text-slate-900 block">Organic Apple</span>
                    <span className="text-[10px] text-slate-400">Bio Specimen</span>
                  </button>

                  <button
                    onClick={() => setSelectedSpecimen('obstacle_cone')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${selectedSpecimen === 'obstacle_cone' ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span className="text-3xl block mb-1">🚧</span>
                    <span className="text-xs font-black text-slate-900 block">Safety Barrier</span>
                    <span className="text-[10px] text-slate-400">Road Obstacle</span>
                  </button>

                  <button
                    onClick={() => setSelectedSpecimen('solar_panel')}
                    className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${selectedSpecimen === 'solar_panel' ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-400/40' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                  >
                    <span className="text-3xl block mb-1">🛰️</span>
                    <span className="text-xs font-black text-slate-900 block">Solar Array</span>
                    <span className="text-[10px] text-slate-400">Energy Source</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                  <span className="font-extrabold block">How this works:</span>
                  <p className="text-[11px] leading-relaxed text-indigo-800">
                    The vision model breaks pixels into RGB tensors, applies convolutional filter kernels (edges, textures, shapes), and outputs softmax probabilities across classes.
                  </p>
                </div>
              </div>

              {/* Real-time Confidence Breakdown (7 cols) */}
              <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <span className="font-mono text-purple-400">MobileNetV2 Inference Layer</span>
                  <span className="text-emerald-400 font-mono font-bold">Latency: 18ms</span>
                </div>

                <div className="space-y-4">
                  {selectedSpecimen === 'rover_wheel' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-emerald-400">Mechanical Rover Part</span>
                          <span className="font-mono text-emerald-400">97.8% Confidence</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[97.8%]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>Industrial Tool</span>
                          <span className="font-mono">1.8%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-600 rounded-full w-[1.8%]" />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSpecimen === 'apple' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-rose-400">Organic Fruit (Apple)</span>
                          <span className="font-mono text-rose-400">99.2% Confidence</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full w-[99.2%]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>Synthetic Ball</span>
                          <span className="font-mono">0.6%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-600 rounded-full w-[0.6%]" />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSpecimen === 'obstacle_cone' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-amber-400">Traffic Safety Cone</span>
                          <span className="font-mono text-amber-400">98.5% Confidence</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[98.5%]" />
                        </div>
                      </div>
                    </>
                  )}

                  {selectedSpecimen === 'solar_panel' && (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-cyan-400">Photovoltaic Solar Cell</span>
                          <span className="font-mono text-cyan-400">96.4% Confidence</span>
                        </div>
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full w-[96.4%]" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Validated Model Accuracy: 98.4%</span>
                  <button
                    onClick={() => handleAwardReward(40, 10, 'AI Classifier Model Validated')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Award +40 XP
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. QUIZZES & GAMES TAB: Complete Game Arcade */}
        {(activeTab === 'games') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 text-white shadow-xl">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-200">Arcade Arena</span>
                <h2 className="text-xl sm:text-2xl font-black">Quizzes &amp; Educational Games 🎮</h2>
                <p className="text-xs text-pink-100 mt-0.5">Test your logic, solve coding mazes, and climb the leaderboard with each win.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-xs font-black text-white">
                  7 Playable Games Available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Game 1: Drag & Drop Coding Maze */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-xs">
                    🧩
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600">Visual Blocks</span>
                    <h3 className="text-base font-black text-slate-900">Block Code Rover: Logic Maze</h3>
                    <p className="text-xs text-slate-500 mt-1">Guide your rover through the space grid using Move, Turn, and Repeat blocks.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">+100 XP</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800">+25 🪙</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlayingGame(true)}
                  className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Block Maze Now</span>
                </button>
              </div>

              {/* Game 2: Space Quiz Battle */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
                    🏆
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-600">Trivia Battle</span>
                    <h3 className="text-base font-black text-slate-900">Space &amp; Logic Quiz Battle</h3>
                    <p className="text-xs text-slate-500 mt-1">Answer 5 high-speed logic questions with instant feedback and concept explainers.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">+100 XP</span>
                    <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800">+25 🪙</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsPlayingQuiz(true)}
                  className="w-full h-10 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Enter Quiz Arena</span>
                </button>
              </div>

              {/* Game 3: AI Mentor Doubts */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-900 to-purple-950 text-white shadow-md flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 p-1 flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-300">Nova AI Companion</span>
                    <h3 className="text-base font-black text-white">Interactive AI Dialogue</h3>
                    <p className="text-xs text-indigo-200 mt-1">Ask questions about coding, robotics, or physics and get kid-safe guided answers.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsAiMentorOpen(true)}
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open AI Chat</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* 7. PROJECTS TAB: Capstone Project Showcase & Submissions */}
        {(activeTab === 'projects') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">STEM Innovation</span>
                <h2 className="text-xl sm:text-2xl font-black">Cadet Innovation Projects 🚀</h2>
                <p className="text-xs text-slate-400 mt-0.5">Submit capstone assignments, view trainer feedback, and earn certificates.</p>
              </div>
              <button
                onClick={() => setIsSubmitProjectOpen(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Submit New Project</span>
              </button>
            </div>

            {/* Submit Project Modal */}
            {isSubmitProjectOpen && (
              <div className="p-5 rounded-3xl bg-white border border-indigo-200 shadow-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Upload Capstone STEM Project</h3>
                  <button onClick={() => setIsSubmitProjectOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Cancel</button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Project Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart Irrigation Water Pump with Soil Sensor"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1">Summary &amp; Hardware Used</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what components you used and how your code works..."
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!newProjectTitle.trim()) return;
                      setUserProjects(prev => [
                        {
                          id: `proj-${Date.now()}`,
                          title: newProjectTitle,
                          course: 'Robotics & Sensors with Arduino',
                          status: 'IN_REVIEW',
                          grade: 'Under Review',
                          xpAwarded: 200,
                          feedback: 'Project successfully submitted. InnovatMind Trainer will review code within 24 hours.',
                          trainer: 'Trainer Vikram Sethi',
                          date: new Date().toISOString().split('T')[0]
                        },
                        ...prev
                      ]);
                      setNewProjectTitle('');
                      setNewProjectDesc('');
                      setIsSubmitProjectOpen(false);
                      handleAwardReward(150, 30, 'Capstone Project Submitted');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer shadow-md"
                  >
                    Submit for Review (+150 XP)
                  </button>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-4">
              {userProjects.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-3xl">
                    🚀
                  </div>
                  <h3 className="text-base font-bold text-slate-900">No Projects Submitted Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    You haven&apos;t submitted any STEM capstone projects yet. Complete lesson modules and build your first robotics or coding project to submit for review and earn XP!
                  </p>
                  <button
                    onClick={() => setIsSubmitProjectOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    + Submit First Project
                  </button>
                </div>
              ) : (
                userProjects.map((proj) => (
                  <div key={proj.id} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${proj.status === 'GRADED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {proj.status === 'GRADED' ? `Graded: ${proj.grade}` : 'Under Review'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">• Submitted {proj.date}</span>
                      </div>
                    <h3 className="text-base font-black text-slate-900">{proj.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{proj.course}</p>
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 mt-2">
                      <span className="font-bold text-slate-900 block mb-0.5">{proj.trainer} Feedback:</span>
                      <p className="text-slate-600 leading-relaxed">{proj.feedback}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      +{proj.xpAwarded} XP Earned
                    </span>
                    <button
                      onClick={() => handleAwardReward(20, 5, 'Project Certificate Downloaded')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Download Certificate
                    </button>
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* 8. ACHIEVEMENTS TAB: Badges & Trophies Gallery */}
        {(activeTab === 'achievements') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 shadow-xl border border-amber-300">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">Hall of Honors</span>
                <h2 className="text-xl sm:text-2xl font-black">Cadet Badges &amp; Trophies 🏆</h2>
                <p className="text-xs text-amber-950 font-bold mt-0.5">Collect all 12 achievement badges across coding, robotics, AI, and teamwork.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-2xl bg-slate-950 text-amber-300 text-xs font-black shadow-xs">
                  8 / 12 Badges Unlocked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                { title: 'First Code Run', desc: 'Executed your first script in Python.', icon: '⚡', unlocked: true },
                { title: 'Robo Architect', desc: 'Wired an Arduino with ultrasonic sensor.', icon: '🤖', unlocked: true },
                { title: 'AI Pioneer', desc: 'Trained your first neural vision model.', icon: '🧠', unlocked: true },
                { title: 'Quiz Champion', desc: 'Scored 100% on Space Quiz Battle.', icon: '🎯', unlocked: true },
                { title: '12-Day Streak', desc: 'Logged in 12 consecutive school days.', icon: '🔥', unlocked: true },
                { title: 'Space Pioneer', desc: 'Explored Space Launchport Island.', icon: '🚀', unlocked: true },
                { title: 'Puzzle Master', desc: 'Solved 10 Block Code Rover levels.', icon: '🧩', unlocked: true },
                { title: 'Bug Hunter', desc: 'Debugged a syntax loop error.', icon: '🛡️', unlocked: true },
                { title: 'Golden Cadet', desc: 'Reach Level 15 (Requires 3,000 XP).', icon: '👑', unlocked: false },
                { title: 'Hackathon Star', desc: 'Submit a top capstone STEM project.', icon: '⭐', unlocked: false },
                { title: 'Quantum Explorer', desc: 'Complete 30 lesson modules.', icon: '🔮', unlocked: false },
                { title: 'Grand Master', desc: 'Rank #1 on All-School Leaderboard.', icon: '🎖️', unlocked: false }
              ].map((b, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-3xl border text-center transition-all flex flex-col items-center justify-between ${b.unlocked ? 'bg-white border-amber-200/90 shadow-xs hover:border-amber-400' : 'bg-slate-50/70 border-slate-200 opacity-60'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-xs ${b.unlocked ? 'bg-amber-100' : 'bg-slate-200 text-slate-400'}`}>
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{b.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{b.desc}</p>
                  </div>
                  <span className={`mt-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${b.unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {b.unlocked ? 'Unlocked ✓' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. LEADERBOARD TAB: Class 6-A and School Rankings */}
        {(activeTab === 'leaderboard') && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-3xl bg-indigo-900 text-white shadow-xl border border-indigo-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300">Competitive Standings</span>
                <h2 className="text-xl sm:text-2xl font-black">Cadet Hall of Fame &amp; Leaderboard 🏅</h2>
                <p className="text-xs text-indigo-200 mt-0.5">Compete with classmates in Grade 6-A and students across Delhi Public Tech Academy.</p>
              </div>

              <div className="flex items-center gap-2 p-1 rounded-2xl bg-indigo-950/80 border border-indigo-700">
                <button
                  onClick={() => setActiveLeaderboardTab('CLASS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${activeLeaderboardTab === 'CLASS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  Grade 6-A (Class)
                </button>
                <button
                  onClick={() => setActiveLeaderboardTab('SCHOOL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-colors cursor-pointer ${activeLeaderboardTab === 'SCHOOL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All School
                </button>
              </div>
            </div>

            {/* Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 text-2xl font-black flex items-center justify-center shadow-md mb-2">
                  🥇
                </div>
                <span className="text-[10px] font-black uppercase text-amber-800">Rank #1 • Champion</span>
                <h3 className="text-sm font-black text-slate-900 mt-1">Rohan Mehra</h3>
                <span className="text-xs font-bold text-slate-500 font-mono mt-0.5">2,420 XP • 15 Day Streak</span>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-purple-100 border-2 border-indigo-500 shadow-md flex flex-col items-center text-center relative">
                <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-xs">
                  YOU
                </span>
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white text-2xl font-black flex items-center justify-center shadow-md mb-2">
                  🥈
                </div>
                <span className="text-[10px] font-black uppercase text-indigo-800">Rank #2 • Explorer</span>
                <h3 className="text-sm font-black text-slate-900 mt-1">Aarav Verma</h3>
                <span className="text-xs font-bold text-indigo-700 font-mono mt-0.5">{studentXp} XP • {studentStreak} Day Streak</span>
              </div>

              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-50 to-orange-100 border-2 border-orange-300 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-400 text-white text-2xl font-black flex items-center justify-center shadow-md mb-2">
                  🥉
                </div>
                <span className="text-[10px] font-black uppercase text-orange-800">Rank #3 • Challenger</span>
                <h3 className="text-sm font-black text-slate-900 mt-1">Ananya Joshi</h3>
                <span className="text-xs font-bold text-slate-500 font-mono mt-0.5">1,740 XP • 10 Day Streak</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 font-black text-xs text-slate-500 flex justify-between">
                <span>CADET RANKINGS</span>
                <span>TOTAL XP</span>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { rank: 1, name: 'Rohan Mehra', grade: 'Grade 6-A', xp: 2420, streak: 15, isCurrent: false },
                  { rank: 2, name: 'Aarav Verma (You)', grade: 'Grade 6-A', xp: studentXp, streak: studentStreak, isCurrent: true },
                  { rank: 3, name: 'Ananya Joshi', grade: 'Grade 6-A', xp: 1740, streak: 10, isCurrent: false },
                  { rank: 4, name: 'Kabir Das', grade: 'Grade 6-A', xp: 1610, streak: 8, isCurrent: false },
                  { rank: 5, name: 'Diya Sharma', grade: 'Grade 6-A', xp: 1540, streak: 7, isCurrent: false }
                ].map((s) => (
                  <div
                    key={s.rank}
                    className={`p-4 flex items-center justify-between text-xs ${s.isCurrent ? 'bg-indigo-50/80 font-black text-indigo-950' : 'text-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-mono font-extrabold text-slate-400">#{s.rank}</span>
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs">
                        {s.name[0]}
                      </div>
                      <div>
                        <span className="block font-bold">{s.name}</span>
                        <span className="text-[10px] text-slate-400">{s.grade} • 🔥 {s.streak} Days</span>
                      </div>
                    </div>
                    <span className="font-mono font-black text-slate-900">{s.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 10. MY PROFILE TAB: Student Cadet ID Card & Stats */}
        {(activeTab === 'profile') && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md p-1 border-2 border-white/30 shadow-lg flex items-center justify-center text-4xl">
                  👦
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase">
                      Active Cadet
                    </span>
                    <span className="text-xs text-emerald-200 font-mono">SCH-6A-042</span>
                  </div>
                  <h2 className="text-2xl font-black mt-1">Aarav Verma</h2>
                  <p className="text-xs text-emerald-100">Grade 6-A • Delhi Public Tech Academy</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="text-[9px] uppercase font-bold text-emerald-200 block">Cadet Level</span>
                  <span className="text-lg font-black">{studentLevel}</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="text-[9px] uppercase font-bold text-amber-200 block">Cadet Coins</span>
                  <span className="text-lg font-black">{studentCoins} 🪙</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                  <span className="text-[9px] uppercase font-bold text-rose-200 block">Streak</span>
                  <span className="text-lg font-black">{studentStreak} 🔥</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Cadet Skill Radar Breakdown (6 cols) */}
              <div className="lg:col-span-6 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900">Competency Mastery &amp; Skill Radar</h3>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Python &amp; Computational Logic</span>
                      <span className="font-mono text-indigo-600">85%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Robotics Hardware &amp; Arduino Circuits</span>
                      <span className="font-mono text-amber-600">70%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[70%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Artificial Intelligence &amp; Neural Vision</span>
                      <span className="font-mono text-purple-600">65%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full w-[65%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Problem Solving &amp; Algorithmic Speed</span>
                      <span className="font-mono text-emerald-600">90%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[90%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Guardian & School Credentials (6 cols) */}
              <div className="lg:col-span-6 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-slate-900">Institutional Profile Details</h3>
                
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-bold">Admission Number:</span>
                    <span className="font-mono font-bold text-slate-900">ADM-2024-042</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-bold">Institutional Email:</span>
                    <span className="font-mono font-bold text-slate-900">aarav.v@student.delhitech.edu.in</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-bold">Parent / Guardian:</span>
                    <span className="font-bold text-slate-900">Rajesh Verma (+91 98765 43210)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded-xl bg-slate-50">
                    <span className="text-slate-500 font-bold">Allocated STEM Trainer:</span>
                    <span className="font-bold text-indigo-700">Vikram Sethi (InnovatMind Lead)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            MODALS & INTERACTIVE DRAWERS
           ========================================================================= */}
        
        {/* Playable Drag & Drop Coding Game Modal */}
        {isPlayingGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-fade-in overflow-y-auto">
            <DragAndDropCodingGame
              onClose={() => setIsPlayingGame(false)}
              onGameComplete={(xp, coins) => {
                handleAwardReward(xp, coins, 'Coding Challenge Mastered');
              }}
            />
          </div>
        )}

        {/* Playable Quiz Battle Modal */}
        {isPlayingQuiz && (
          <QuizBattleModal
            onClose={() => setIsPlayingQuiz(false)}
            onComplete={(xp, coins) => {
              handleAwardReward(xp, coins, 'Quiz Battle Conquered');
            }}
          />
        )}

        {/* AI Mentor Chat Dialog */}
        {isAiMentorOpen && (
          <AiMentorDialog
            onClose={() => setIsAiMentorOpen(false)}
          />
        )}

        {/* Island Details & Mission Drawer */}
        {selectedIsland && (
          <LearningIslandDrawer
            island={selectedIsland}
            onClose={() => setSelectedIsland(null)}
            onLaunchMission={(missionTitle) => {
              if (selectedIsland.id === 1 || selectedIsland.id === 2) {
                setIsPlayingGame(true);
              } else if (selectedIsland.id === 4) {
                setIsPlayingQuiz(true);
              } else {
                setIsPlayingGame(true);
              }
            }}
          />
        )}

      </div>
    </AppShell>
  );
}
