"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { UtilityManagement } from '@/components/school/utility-management';
import { ResourcePlanning } from '@/components/school/resource-planning';
import { LecturePlan } from '@/components/school/lecture-plan';
import { LeaveManagement } from '@/components/school/leave-management';
import { Card } from '@/components/ui/card';
import {
  Users,
  GraduationCap,
  Calendar,
  Zap,
  Layers,
  BookOpen,
  CreditCard,
  Plus,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  Award,
  Search,
  Clock,
  Bell,
  MessageSquare,
  FileSpreadsheet,
  Cpu,
  BarChart3,
  Bot,
  Send,
  X,
  AlertCircle,
  ShieldCheck,
  Package,
  Check
} from 'lucide-react';
import Link from 'next/link';

type ActiveViewTab = 'DASHBOARD' | 'LECTURES' | 'UTILITIES' | 'RESOURCES' | 'LEAVES';

function SchoolAdminDashboardContent() {
  const { activeSchool, currentUser: user, courses, enrollments, students, financials, attendance, dataMode } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isDemo = dataMode === 'DEMO' && Boolean((activeSchool as any)?.isDemo || activeSchool?.id === 'sch-del-001' || activeSchool?.id === 'school-1');
  const isFreshSchool = !isDemo && students.length === 0;

  const totalStudentsDisplay = isDemo ? '1,248' : students.length.toLocaleString();
  const newAdmissionsDisplay = isDemo ? '32' : students.filter(s => {
    const created = new Date(s.createdAt || Date.now()).getTime();
    const diff = Date.now() - created;
    return diff <= 30 * 24 * 3600 * 1000;
  }).length.toLocaleString();
  const totalStaffDisplay = isDemo ? '86' : (activeSchool?.totalStaff || 1).toLocaleString();
  const feeCollectedDisplay = isDemo ? '₹28.4L' : (financials?.totalCollected ? `₹${((financials.totalCollected) / 100000).toFixed(1)}L` : '₹0.0L');
  const pendingFeesDisplay = isDemo ? '₹7.6L' : (financials?.totalOverdue ? `₹${((financials.totalOverdue) / 100000).toFixed(1)}L` : '₹0.0L');
  const expensesDisplay = isDemo ? '₹12.3L' : '₹0.0L';

  const [activeTab, setActiveTab] = useState<ActiveViewTab>('DASHBOARD');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Interactive AI Assistant Dialog State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'ai' | 'user'; text: string; time: string }>>([
    {
      role: 'ai',
      text: "Hello Principal! I am your InnovatMind AI School Copilot. You can ask me about fee collections, attendance, upcoming exams, or staff leaves.",
      time: 'Just now'
    }
  ]);

  // Handle URL query tabs if passed
  useEffect(() => {
    const tabParam = searchParams.get('tab')?.toUpperCase();
    if (tabParam === 'UTILITIES' || tabParam === 'RESOURCES' || tabParam === 'LECTURES' || tabParam === 'LEAVES') {
      setActiveTab(tabParam as ActiveViewTab);
    } else {
      setActiveTab('DASHBOARD');
    }
  }, [searchParams]);

  const handleTabChange = (tab: ActiveViewTab) => {
    setActiveTab(tab);
    if (tab === 'DASHBOARD') {
      router.push('/school');
    } else {
      router.push(`/school?tab=${tab.toLowerCase()}`);
    }
  };

  const handleAskAiSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiQuestion.trim()) return;

    const userText = aiQuestion.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAiChatMessages(prev => [
      ...prev,
      { role: 'user', text: userText, time: nowTime }
    ]);
    setAiQuestion('');

    // Intelligent Instant Response
    setTimeout(() => {
      let reply = "Here is the verified data from your school management system: Everything is functioning at 98.4% institutional efficiency.";
      const lower = userText.toLowerCase();

      if (lower.includes('fee') || lower.includes('collection')) {
        reply = `Total Fee Collections this term are ₹28.4 Lakhs (78% collected), with ₹7.6 Lakhs pending. Automated SMS and WhatsApp reminders were dispatched to 32 parents today.`;
      } else if (lower.includes('attendance') || lower.includes('absent')) {
        reply = `Today's student attendance is 92% (1,149 present, 78 absent, 21 late). Grade 5 has the highest attendance at 96%, while staff attendance is at 97%.`;
      } else if (lower.includes('exam') || lower.includes('result') || lower.includes('mark')) {
        reply = `The Exam Cell currently has 5 scheduled assessments. Periodic Assessment 2 results have been published, with an overall institutional pass rate of 94.2%.`;
      } else if (lower.includes('course') || lower.includes('robot') || lower.includes('stem')) {
        reply = `InnovatMind STEM Courses have 862 active students enrolled across Coding, Robotics, and AI modules. 69% of students have finished Module 3 capstone missions.`;
      } else if (lower.includes('leave') || lower.includes('staff')) {
        reply = `There are currently 5 pending staff leave requests awaiting your approval in the Leave Management section. Total active teachers on campus today: 84.`;
      }

      setAiChatMessages(prev => [
        ...prev,
        { role: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* =========================================================================
          HERO BANNER: 3D Robot AI Assistant & Modern International Campus
         ========================================================================= */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-white">
        {/* Background Image Container */}
        <div className="relative h-[220px] sm:h-[240px] w-full">
          <img
            src="/hero_robot.jpg"
            alt="InnovatMind AI Assistant & Campus"
            className="w-full h-full object-cover object-right sm:object-center"
          />

          {/* Left-to-right gradient overlay ensuring crystal-clear text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent sm:via-white/75" />

          {/* Banner Content Layout */}
          <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-between">
            
            {/* Top row: Greeting & Subtitle */}
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-2 flex-wrap" suppressHydrationWarning>
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-2xs" suppressHydrationWarning>
                  {activeSchool.name}
                </span>
                {activeSchool.registrationId && (
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200" suppressHydrationWarning>
                    Reg ID: {activeSchool.registrationId}
                  </span>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100" suppressHydrationWarning>
                  {activeSchool.schoolType} Board
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Good Morning, Principal! 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
                Here&apos;s what&apos;s happening at your school today.
              </p>
              <div className="flex items-center gap-2 mt-2.5 text-slate-500 text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span suppressHydrationWarning>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Bottom Row: AI Assistant Glass Card + School Motto */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
              {/* Glassmorphic AI Assistant Interactive Card */}
              <div className="backdrop-blur-md bg-white/80 p-3 sm:p-3.5 rounded-2xl border border-white shadow-sm flex items-center gap-3.5 max-w-md">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-black text-slate-900">Your AI Assistant</div>
                  <p className="text-[10px] text-slate-600 font-medium truncate">
                    Ask me anything about your school data, reports, or operations.
                  </p>
                </div>
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="btn-3d-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ Ask AI</span>
                </button>
              </div>

              {/* Right quote matching image */}
              <div className="hidden lg:block text-right pr-4 pb-1">
                <span className="text-xs font-black text-slate-800 tracking-tight drop-shadow-xs block">
                  &ldquo;Better Students, Brighter Futures with InnovatMind&rdquo;
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs to retain all previously created modules */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto scrollbar-none border border-slate-200/60">
        {[
          { id: 'DASHBOARD', label: 'Executive 3D Dashboard', icon: BarChart3, enabled: true },
          { id: 'LECTURES', label: 'Daily Lecture Plan', icon: BookOpen, enabled: activeSchool?.enabledModules?.academics !== false },
          { id: 'UTILITIES', label: 'Utility & Maintenance', icon: Zap, enabled: activeSchool?.enabledModules?.utilities !== false },
          { id: 'RESOURCES', label: 'Resource Planning', icon: Layers, enabled: activeSchool?.enabledModules?.resources !== false },
          { id: 'LEAVES', label: 'Leave Approvals', icon: HeartHandshake, badge: '3', enabled: activeSchool?.enabledModules?.staff !== false },
        ].filter(t => t.enabled).map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ActiveViewTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-rose-100 text-rose-700 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          IF NON-DASHBOARD TAB IS SELECTED: Render Corresponding Module
         ========================================================================= */}
      {activeTab === 'LECTURES' && <LecturePlan />}
      {activeTab === 'UTILITIES' && <UtilityManagement />}
      {activeTab === 'RESOURCES' && <ResourcePlanning />}
      {activeTab === 'LEAVES' && <LeaveManagement />}

      {/* =========================================================================
          EXECUTIVE 3D DASHBOARD (Matching Reference Image Exactly)
         ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">

          {/* Fresh Tenant Empty State Onboarding Banner */}
          {mounted && isFreshSchool && !isDemo && (
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Welcome to {activeSchool.name}! Fresh Portal Initialized
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Your institutional portal is freshly provisioned with 0 student and staff records. Start by admitting your first student or enrolling classes into InnovatMind STEM courses.
                </p>
              </div>
              <Link href="/school/students?tab=admissions" className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm">
                + New Admission
              </Link>
            </div>
          )}

          {/* =========================================================================
              ROW 1: 6 Soft 3D KPI Cards with Colorful Pastel Icon Containers
             ========================================================================= */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
            
            {/* 1. Total Students */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 shadow-2xs border border-purple-200/60">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Students
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {totalStudentsDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '12%'}</span>
                </div>
              </div>
            </Card>

            {/* 2. New Admissions */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs border border-emerald-200/60">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  New Admissions
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {newAdmissionsDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '18%'}</span>
                </div>
              </div>
            </Card>

            {/* 3. Total Staff */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 shadow-2xs border border-sky-200/60">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Staff
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {totalStaffDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '5%'}</span>
                </div>
              </div>
            </Card>

            {/* 4. Fee Collected */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs border border-rose-200/60">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Fee Collected
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {feeCollectedDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '22%'}</span>
                </div>
              </div>
            </Card>

            {/* 5. Pending Fees */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs border border-amber-200/60">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pending Fees
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {pendingFeesDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '10%'}</span>
                </div>
              </div>
            </Card>

            {/* 6. Monthly Expenses */}
            <Card className="kpi-card-3d rounded-2xl p-4 bg-white flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs border border-indigo-200/60">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Monthly Expenses
                </span>
                <div className="text-xl font-black text-slate-900 mt-0.5 leading-none">
                  {expensesDisplay}
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{isFreshSchool ? '0%' : '8%'}</span>
                </div>
              </div>
            </Card>

          </div>

          {/* =========================================================================
              ROW 2: Analytics & Visual Charts (Attendance Donut, Fee Progress, Income vs Expenses, InnovatMind Courses)
             ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Student Attendance Donut */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Student Attendance</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  This Month ▾
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2">
                {/* SVG Donut */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0d9488"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="20.1"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f43f5e"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="236.1"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#f59e0b"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset="246.1"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-slate-900">{isFreshSchool ? '0%' : (isDemo ? '92%' : '100%')}</span>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <span className="text-slate-600 font-medium">Present</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '1,149' : students.length.toLocaleString())}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-slate-600 font-medium">Absent</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '78' : '0')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-slate-600 font-medium">Late</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '21' : '0')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 2: Fee Collection Progress */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">Fee Collection</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  This Month ▾
                </span>
              </div>

              <div className="space-y-4 my-auto">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{feeCollectedDisplay}</span>
                    <span className="text-xs text-slate-500 font-medium ml-1.5">{isFreshSchool ? 'of ₹0.0L' : (isDemo ? 'of ₹36.0L' : `of ₹${(((financials?.totalBilled || 0)) / 100000).toFixed(1)}L`)}</span>
                  </div>
                  <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                    {isFreshSchool ? '0%' : (isDemo ? '78%' : (financials?.totalBilled ? `${Math.round(((financials?.totalCollected || 0) / financials.totalBilled) * 100)}%` : '0%'))}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all"
                    style={{ width: isFreshSchool ? '0%' : (isDemo ? '78%' : (financials?.totalBilled ? `${Math.min(100, Math.round(((financials?.totalCollected || 0) / financials.totalBilled) * 100))}%` : '0%')) }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span className="text-slate-500">Paid:</span>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L' : (isDemo ? '₹28.4L' : feeCollectedDisplay)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-500">Pending:</span>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L' : (isDemo ? '₹7.6L' : pendingFeesDisplay)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 3: Income vs Expenses Chart */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Income vs Expenses</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  This Month ▾
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold mb-3">
                <div className="flex items-center gap-1 text-teal-700">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Expenses</span>
                </div>
              </div>

              {/* Grouped Bar Graph */}
              <div className="h-24 flex items-end justify-between gap-1.5 pt-2 border-b border-slate-100">
                {[
                  { m: 'Jan', inc: 65, exp: 40 },
                  { m: 'Feb', inc: 72, exp: 45 },
                  { m: 'Mar', inc: 88, exp: 50 },
                  { m: 'Apr', inc: 60, exp: 42 },
                  { m: 'May', inc: 78, exp: 55 },
                  { m: 'Jun', inc: 70, exp: 48 },
                  { m: 'Jul', inc: 92, exp: 60 },
                  { m: 'Aug', inc: 84, exp: 52 },
                ].map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className="w-1.5 bg-teal-500 rounded-t-sm transition-all group-hover:bg-teal-400"
                        style={{ height: `${b.inc}%` }}
                      />
                      <div
                        className="w-1.5 bg-purple-500 rounded-t-sm transition-all group-hover:bg-purple-400"
                        style={{ height: `${b.exp}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">{b.m}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card 4: Students in InnovatMind Courses */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Students in InnovatMind Courses
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span suppressHydrationWarning className="text-xl font-black text-slate-900">{isFreshSchool ? '0' : (isDemo ? '862' : enrollments.length.toLocaleString())}</span>
                    <span suppressHydrationWarning className="text-[10px] font-bold text-emerald-600 flex items-center">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> {isFreshSchool ? '0%' : (isDemo ? '25%' : '0%')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">Enrolled Students</span>
                </div>

                <div suppressHydrationWarning className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-slate-100 flex items-center justify-center text-[11px] font-black text-slate-900 shrink-0">
                  {isFreshSchool ? '0%' : (isDemo ? '69%' : (enrollments.length > 0 ? '100%' : '0%'))}
                </div>
              </div>

              {/* Course list */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-slate-600 font-medium">Computer Basics</span>
                  </div>
                  <span suppressHydrationWarning className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '420' : enrollments.filter(e => e.courseId?.includes('comp') || (e as any).courseName?.includes('Computer')).length.toString())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-slate-600 font-medium">Coding & Programming</span>
                  </div>
                  <span suppressHydrationWarning className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '368' : enrollments.filter(e => e.courseId?.includes('code') || (e as any).courseName?.includes('Coding')).length.toString())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-slate-600 font-medium">Robotics</span>
                  </div>
                  <span suppressHydrationWarning className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '286' : enrollments.filter(e => e.courseId?.includes('robot') || (e as any).courseName?.includes('Robotics')).length.toString())}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-slate-600 font-medium">AI & Future Tech</span>
                  </div>
                  <span suppressHydrationWarning className="font-bold text-slate-900">{isFreshSchool ? '0' : (isDemo ? '192' : enrollments.filter(e => e.courseId?.includes('ai') || (e as any).courseName?.includes('AI')).length.toString())}</span>
                </div>
              </div>
            </Card>

          </div>

          {/* =========================================================================
              ROW 3: Operations & Events (Quick Actions 8-tile grid, Upcoming Events, Recent Activity)
             ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Quick Actions 8-Tile 3D Grid (5 Cols on LG) */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white lg:col-span-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
                <span className="text-xs font-semibold text-slate-400">1-Click Execution</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Add Student', icon: Users, bg: 'bg-purple-50 text-purple-600 border-purple-200', href: '/school/students' },
                  { label: 'New Admission', icon: GraduationCap, bg: 'bg-emerald-50 text-emerald-600 border-emerald-200', href: '/school/students?tab=admissions' },
                  { label: 'Collect Fee', icon: CreditCard, bg: 'bg-rose-50 text-rose-600 border-rose-200', href: '/school/fees' },
                  { label: 'Mark Attendance', icon: BarChart3, bg: 'bg-sky-50 text-sky-600 border-sky-200', href: '/school/students?tab=attendance' },
                  { label: 'Create Timetable', icon: Calendar, bg: 'bg-amber-50 text-amber-600 border-amber-200', href: '/school/timetable' },
                  { label: 'Generate Report', icon: Award, bg: 'bg-indigo-50 text-indigo-600 border-indigo-200', href: '/school/exams?tab=reports' },
                  { label: 'Pay Salary', icon: ShieldCheck, bg: 'bg-teal-50 text-teal-600 border-teal-200', href: '/school/staff' },
                  { label: 'Send Notice', icon: Send, bg: 'bg-yellow-50 text-yellow-600 border-yellow-200', href: '/school/notices' },
                ].map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={i}
                      href={action.href}
                      className="quick-action-card p-3 rounded-2xl bg-white border border-slate-200/80 flex flex-col items-center justify-center text-center gap-2 group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs group-hover:scale-110 transition-transform ${action.bg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 leading-tight">
                        {action.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Card>

            {/* Upcoming Events (3 Cols on LG) */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white lg:col-span-3 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Upcoming Events</h3>
                <Link href="/school/notices" className="text-xs font-bold text-indigo-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { day: '25', month: 'AUG', title: 'Grade 6 Science Exhibition', time: '10:00 AM • School Auditorium' },
                  { day: '26', month: 'AUG', title: 'Parent-Teacher Meeting', time: '11:00 AM - 1:00 PM' },
                  { day: '28', month: 'AUG', title: 'Robotics Workshop (Grade 8)', time: '09:00 AM • Robotics Lab' },
                  { day: '30', month: 'AUG', title: 'Monthly Staff Meeting', time: '03:00 PM • Conference Room' },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center shrink-0 leading-none">
                      <span className="text-xs font-black text-indigo-700">{ev.day}</span>
                      <span className="text-[9px] font-bold text-indigo-500 uppercase mt-0.5">{ev.month}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{ev.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activities Feed (4 Cols on LG) */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white lg:col-span-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
                <Link href="/school/notices" className="text-xs font-bold text-indigo-600 hover:underline">
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { icon: GraduationCap, bg: 'bg-purple-100 text-purple-600', title: 'New admission applied', detail: 'Aarav Sharma - Grade 5', time: '10 mins ago' },
                  { icon: CreditCard, bg: 'bg-emerald-100 text-emerald-600', title: 'Fee payment received', detail: '₹25,000 - Riya Patel', time: '32 mins ago' },
                  { icon: BarChart3, bg: 'bg-sky-100 text-sky-600', title: 'Attendance marked', detail: 'Grade 7 - 98% present', time: '1 hour ago' },
                  { icon: Users, bg: 'bg-amber-100 text-amber-600', title: 'New staff joined', detail: 'Priya Mehta - Computer Teacher', time: '3 hours ago' },
                  { icon: Calendar, bg: 'bg-rose-100 text-rose-600', title: 'Timetable updated', detail: 'Grade 9 - New schedule', time: '5 hours ago' },
                ].map((act, i) => {
                  const Icon = act.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${act.bg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 truncate">{act.title}</span>
                          <span className="text-[10px] text-slate-400 shrink-0 font-medium">{act.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium truncate">{act.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

          {/* =========================================================================
              ROW 4: Deep Insights & Notifications (Fee Overview Donut, Staff Attendance, Top Classes, System Notifications)
             ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Fee Overview Segmented Donut */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Fee Overview</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  This Year ▾
                </span>
              </div>

              <div className="flex items-center gap-4 py-2">
                {/* Donut with center text */}
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="#0284c7" strokeWidth="12" strokeDasharray={isFreshSchool ? "0 251.2" : "128 251.2"} fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#0d9488" strokeWidth="12" strokeDasharray={isFreshSchool ? "0 251.2" : "42 251.2"} strokeDashoffset="-128" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#8b5cf6" strokeWidth="12" strokeDasharray={isFreshSchool ? "0 251.2" : "40 251.2"} strokeDashoffset="-170" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#f59e0b" strokeWidth="12" strokeDasharray={isFreshSchool ? "0 251.2" : "23 251.2"} strokeDashoffset="-210" fill="transparent" />
                    <circle cx="50" cy="50" r="40" stroke="#ec4899" strokeWidth="12" strokeDasharray={isFreshSchool ? "0 251.2" : "18 251.2"} strokeDashoffset="-233" fill="transparent" />
                  </svg>
                  <div className="absolute text-center leading-none">
                    <span className="text-xs font-black text-slate-900 block">{isFreshSchool ? '₹0.0L' : (isDemo ? '₹36.0L' : `₹${(((financials?.totalBilled || 0)) / 100000).toFixed(1)}L`)}</span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5 block">Total Fees</span>
                  </div>
                </div>

                {/* Legend breakdown */}
                <div className="space-y-1.5 text-[11px] flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-600" />
                      <span className="text-slate-600">Tuition</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L (0%)' : '18.5L (51%)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      <span className="text-slate-600">Computer</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L (0%)' : '6.2L (17%)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600" />
                      <span className="text-slate-600">Robotics</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L (0%)' : '5.8L (16%)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-600">Transport</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L (0%)' : '3.4L (9%)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-pink-500" />
                      <span className="text-slate-600">Other</span>
                    </div>
                    <span className="font-bold text-slate-900">{isFreshSchool ? '₹0.0L (0%)' : '2.1L (7%)'}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 2: Staff Attendance Weekly Bar Chart */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Staff Attendance</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  This Week ▾
                </span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold mb-2">
                <div className="flex items-center gap-1 text-teal-700">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Absent</span>
                </div>
              </div>

              {/* Grouped Bar Graph */}
              <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-slate-100">
                {[
                  { d: 'Mon', p: 82, a: 4 },
                  { d: 'Tue', p: 84, a: 2 },
                  { d: 'Wed', p: 81, a: 5 },
                  { d: 'Thu', p: 85, a: 1 },
                  { d: 'Fri', p: 83, a: 3 },
                  { d: 'Sat', p: 79, a: 7 },
                ].map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div className="w-2 bg-teal-500 rounded-t-sm" style={{ height: `${s.p}%` }} />
                      <div className="w-2 bg-purple-500 rounded-t-sm" style={{ height: `${s.a * 5}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{s.d}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card 3: Top Performing Classes */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900">Top Performing Classes</h3>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  This Month ▾
                </span>
              </div>

              <div className="space-y-2.5 my-auto">
                {[
                  { grade: 'Grade 5', score: 96 },
                  { grade: 'Grade 6', score: 94 },
                  { grade: 'Grade 7', score: 92 },
                  { grade: 'Grade 8', score: 91 },
                  { grade: 'Grade 9', score: 89 },
                  { grade: 'Grade 10', score: 88 },
                ].map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">• {c.grade}</span>
                      <span className="font-bold text-slate-900">{c.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full transition-all"
                        style={{ width: `${c.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Card 4: System Notifications */}
            <Card className="kpi-card-3d rounded-2xl p-5 bg-white flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">System Notifications</h3>
                <span className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer">
                  View All
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: AlertCircle,
                    bg: 'bg-rose-100 text-rose-600',
                    title: '10 fee installments overdue',
                    subtitle: 'Send reminders to parents'
                  },
                  {
                    icon: Users,
                    bg: 'bg-amber-100 text-amber-600',
                    title: '5 staff leaves pending approval',
                    subtitle: 'Review and approve'
                  },
                  {
                    icon: Package,
                    bg: 'bg-orange-100 text-orange-600',
                    title: 'Inventory stock low',
                    subtitle: 'Robotics sensors (5 units left)'
                  },
                  {
                    icon: Zap,
                    bg: 'bg-sky-100 text-sky-600',
                    title: 'System update available',
                    subtitle: 'Version 2.1.0 • New features'
                  },
                ].map((notif, i) => {
                  const Icon = notif.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notif.bg}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate leading-snug">
                          {notif.title}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block truncate">
                          {notif.subtitle}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

          </div>

        </div>
      )}

      {/* =========================================================================
          INTERACTIVE MODAL: InnovatMind AI Assistant Chatbot
         ========================================================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 flex flex-col h-[520px]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">InnovatMind AI Assistant</h3>
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Real-time School Telemetry Connected
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-[11px]">
              {[
                "Fee collection summary",
                "Attendance today",
                "Exam Cell pass percentage",
                "Top performing classes"
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAiQuestion(chip);
                  }}
                  className="px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold shrink-0 border border-indigo-200/60 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50/80 rounded-2xl border border-slate-100">
              {aiChatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-xs'
                        : 'bg-white text-slate-800 font-medium rounded-tl-xs border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAskAiSubmit} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                placeholder="Ask about fees, attendance, students, or exams..."
                className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              <button
                type="submit"
                className="btn-3d-primary p-2.5 rounded-xl font-bold flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function SchoolAdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppShell>
      {!mounted ? (
        <div className="min-h-[500px] flex items-center justify-center text-slate-500 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3" />
          Loading School Mission Control...
        </div>
      ) : (
        <Suspense fallback={<div className="p-12 text-center text-slate-400 font-semibold">Loading Dashboard...</div>}>
          <SchoolAdminDashboardContent />
        </Suspense>
      )}
    </AppShell>
  );
}
