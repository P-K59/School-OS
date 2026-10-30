"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { isRealSchool } from '@/lib/db/mock-data';
import { School, Course, SchoolType, TrainerProfile } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  ArrowRight,
  SlidersHorizontal,
  Bot,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
  ChevronRight,
  RotateCcw,
  X
} from 'lucide-react';
import { WelcomeKitModal } from '@/components/admin/welcome-kit-modal';

function SuperAdminDashboardContent() {
  const router = useRouter();
  const {
    currentUser,
    schools,
    courses,
    trainers,
    schoolCourseAssignments,
    trainerAllocations,
    pricingRules,
    activities,
    createSchool,
    setSchoolStatus,
    approveSchool,
    rejectSchool,
    revokeSchoolDeletion
  } = useAuth();

  // Distribution tab state
  const [distTab, setDistTab] = useState<'location' | 'type' | 'status'>('location');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Quick Action Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedApplicationForReview, setSelectedApplicationForReview] = useState<School | null>(null);
  const [rejectModalSchool, setRejectModalSchool] = useState<School | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [welcomeKitSchool, setWelcomeKitSchool] = useState<School | null>(null);

  // Strict Real Schools Filter - exclude demo seed schools so only actual onboarded schools appear
  const realSchools = useMemo(() => {
    return schools.filter(isRealSchool);
  }, [schools]);

  // Pending approval schools (self-registered from /register awaiting Super Admin confirmation)
  const pendingSchools = useMemo(() => {
    return realSchools.filter(s => s.onboardingStatus === 'PENDING_APPROVAL' || s.onboardingStatus === 'UNDER_REVIEW' || !s.isActive);
  }, [realSchools]);

  // Active verified schools
  const activeRealSchools = useMemo(() => {
    return realSchools.filter(s => s.isActive && (s.onboardingStatus === 'ACTIVE' || !s.onboardingStatus));
  }, [realSchools]);

  // Total Students across real schools
  const totalStudentsCount = useMemo(() => {
    return realSchools.reduce((acc, s) => acc + (s.totalStudents || 0), 0);
  }, [realSchools]);

  // Recent 5 partner schools
  const recentSchools = useMemo(() => {
    return realSchools.slice(0, 5);
  }, [realSchools]);

  // Top performing real schools
  const topSchools = useMemo(() => {
    return realSchools.map(s => ({
      name: s.name,
      total: s.totalStudents || 0,
      enrolled: Math.round((s.totalStudents || 0) * 0.8),
      growth: s.isActive ? '+100%' : 'Pending',
      type: s.schoolType
    }));
  }, [realSchools]);

  // Course enrollment breakdown
  const courseEnrollmentStats = useMemo(() => {
    return courses.slice(0, 5).map(c => ({
      name: c.title,
      students: 0,
      growth: 'Active',
      iconColor: 'text-indigo-600 bg-indigo-50'
    }));
  }, [courses]);

  // Pipeline stages data
  const pipelineStats = useMemo(() => [
    { label: 'New Enquiries', count: pendingSchools.length, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'In Review', count: pendingSchools.filter(s => s.onboardingStatus === 'UNDER_REVIEW').length, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Active Schools', count: activeRealSchools.length, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Total Onboarded', count: realSchools.length, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'Suspended', count: realSchools.filter(s => s.onboardingStatus === 'SUSPENDED').length, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ], [pendingSchools, activeRealSchools, realSchools]);

  // Support Tickets
  const supportTickets = [
    { id: '#TCK-1001', subject: 'Curriculum configuration', priority: 'Medium', status: 'In Progress', color: 'bg-amber-50 text-amber-700' },
    { id: '#TCK-1002', subject: 'Trainer allocation check', priority: 'Low', status: 'Resolved', color: 'bg-emerald-50 text-emerald-700' },
  ];

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (aiPrompt.toLowerCase().includes('school') || aiPrompt.toLowerCase().includes('growth')) {
      setAiResponse(`Synthesizing central telemetry: ${realSchools.length} partner school(s) recorded in database with ${pendingSchools.length} pending approval request(s). Total student headcount: ${totalStudentsCount.toLocaleString()}.`);
    } else if (aiPrompt.toLowerCase().includes('revenue') || aiPrompt.toLowerCase().includes('price')) {
      setAiResponse(`Financial engine summary: ${realSchools.length} operational school tenant(s). Course catalog has ${courses.length} active courses with automated billing rules.`);
    } else if (aiPrompt.toLowerCase().includes('trainer')) {
      setAiResponse(`Operational roster: ${trainers.length} certified master trainer(s) registered in InnovatMind pool.`);
    } else {
      setAiResponse(`InnovatMind OS Copilot: Query processed. System telemetry: ${realSchools.length} institutional tenant(s), ${pendingSchools.length} pending verification, 99.9% uptime.`);
    }
  };

  return (
    <>
      <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
        {/* Welcome Back & Campus Hero Header */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-3 py-0.5 rounded-full">
                Central Operations Command
              </span>
              <span className="text-xs text-slate-400 font-semibold">• Super Admin Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Welcome back, Super Admin! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium">
              Live operational monitoring for registered institutional tenants
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-xs">
                IM
              </div>
              <div>
                <span className="text-xs font-black text-white block">InnovatMind</span>
                <span className="text-[10px] text-slate-300 block">AI & Robotics Platform</span>
              </div>
            </div>

            <Link href="/admin/schools/new">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                <Plus className="w-4 h-4" />
                <span>Add New School</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Revoke Restoration Success Banner */}
        {revokeMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{revokeMessage}</span>
            </div>
            <button onClick={() => setRevokeMessage(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in ${
            actionFeedback.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2.5">
              {actionFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{actionFeedback.message}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="hover:opacity-75 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Institutional Self-Registration Approval Queue (Critical) */}
        {pendingSchools.length > 0 && (
          <Card className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-200 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-950 flex items-center gap-2">
                    Pending Institutional Registrations
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900 border border-amber-300">
                      {pendingSchools.length} Awaiting Approval
                    </span>
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Self-registered institutions cannot log in until approved and confirmed by Super Admin.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {pendingSchools.map(sch => (
                <div key={sch.id} className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">{sch.name}</span>
                      <Badge variant="outline" className="text-[10px] font-bold border-indigo-200 text-indigo-700 bg-indigo-50">
                        {sch.schoolType}
                      </Badge>
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sch.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                        {sch.onboardingStatus || 'PENDING_APPROVAL'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>📍 {sch.city}, {sch.state}</span>
                      <span>✉️ {sch.email}</span>
                      <span>📞 {sch.phone}</span>
                      <span>Registered: {new Date(sch.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplicationForReview(sch)}
                      className="text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200"
                    >
                      View Application
                    </Button>
                    <Button
                      size="sm"
                      disabled={isProcessingAction}
                      onClick={async () => {
                        setIsProcessingAction(true);
                        setActionFeedback(null);
                        try {
                          const res = await approveSchool(sch.id);
                          if (res.success && res.school) {
                            setActionFeedback({ type: 'success', message: `School '${sch.name}' approved and activated successfully!` });
                            setWelcomeKitSchool(res.school);
                          } else {
                            setActionFeedback({ type: 'error', message: res.error || 'Failed to approve school.' });
                          }
                        } catch (err: any) {
                          setActionFeedback({ type: 'error', message: err.message || 'Error processing approval request.' });
                        } finally {
                          setIsProcessingAction(false);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isProcessingAction ? 'Processing...' : 'Approve & Activate'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRejectModalSchool(sch);
                        setRejectReason('');
                      }}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 6 Metric KPI Cards Row - Strictly dynamic from realSchools */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Real Schools */}
          <Link href="/admin/schools" className="block group">
            <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Schools</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight" suppressHydrationWarning>{realSchools.length}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
                <span className="text-[10px] text-slate-400 font-semibold" suppressHydrationWarning>{activeRealSchools.length} active verified</span>
              </div>
            </Card>
          </Link>

          {/* Card 2: Total Real Students */}
          <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight" suppressHydrationWarning>{totalStudentsCount.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-slate-400">
              <span className="text-[10px] font-semibold" suppressHydrationWarning>Across {realSchools.length} school(s)</span>
            </div>
          </Card>

          {/* Card 3: Total Trainers */}
          <Link href="/admin/trainers" className="block group">
            <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Trainers</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{trainers.length}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-blue-600">
                <span className="text-[10px] text-slate-400 font-semibold">Certified Pool</span>
              </div>
            </Card>
          </Link>

          {/* Card 4: Active Courses */}
          <Link href="/admin/pricing" className="block group">
            <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md hover:border-purple-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Courses</span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{courses.length}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-purple-600">
                <span className="text-[10px] text-slate-400 font-semibold">STEM & Coding Modules</span>
              </div>
            </Card>
          </Link>

          {/* Card 5: Monthly Revenue */}
          <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {totalStudentsCount > 0 ? `₹${((totalStudentsCount * 999) / 100000).toFixed(1)} L` : '₹0.0 L'}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
              <span className="text-[10px] text-slate-400 font-semibold">Operational Billing</span>
            </div>
          </Card>

          {/* Card 6: Pending Approvals */}
          <Card className={`p-4 bg-white border shadow-sm rounded-2xl transition-all ${
            pendingSchools.length > 0 ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/90'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                pendingSchools.length > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className={`text-2xl font-black tracking-tight ${
              pendingSchools.length > 0 ? 'text-amber-700' : 'text-slate-900'
            }`} suppressHydrationWarning>
              {pendingSchools.length}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold">
              <span className={pendingSchools.length > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'} suppressHydrationWarning>
                {pendingSchools.length > 0 ? 'Requires Confirmation' : 'All Verified ✓'}
              </span>
            </div>
          </Card>
        </div>

        {/* Middle Row: School Distribution, Enrollment Growth, Financial Overview, Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Col 1: School Distribution Map & State List (4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">School Distribution</h3>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="text-xs h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL" suppressHydrationWarning>All Regions ({realSchools.length})</option>
                {Array.from(new Set(realSchools.map(s => s.state).filter(Boolean))).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                onClick={() => setDistTab('location')}
                className={`flex-1 py-1 rounded-lg transition-all ${distTab === 'location' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
              >
                By Location
              </button>
              <button
                onClick={() => setDistTab('type')}
                className={`flex-1 py-1 rounded-lg transition-all ${distTab === 'type' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
              >
                By Type
              </button>
              <button
                onClick={() => setDistTab('status')}
                className={`flex-1 py-1 rounded-lg transition-all ${distTab === 'status' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'}`}
              >
                By Status
              </button>
            </div>

            {/* Regional Map Representation */}
            <div className="relative h-44 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 rounded-xl border border-indigo-100 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full opacity-35 text-indigo-400" viewBox="0 0 200 200" fill="currentColor">
                <path d="M70,30 Q90,20 110,35 Q130,50 140,80 Q150,110 130,140 Q110,170 80,180 Q60,170 50,140 Q40,100 50,60 Z" />
              </svg>

              {realSchools.length > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-white/95 border border-indigo-200 rounded-2xl p-3 shadow-md text-center space-y-1">
                    <span className="text-[11px] font-black text-indigo-700 block uppercase tracking-wider">
                      Active Coverage
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      {realSchools.length} School(s) • {totalStudentsCount.toLocaleString()} Students
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {Array.from(new Set(realSchools.map(s => s.state).filter(Boolean))).join(', ') || 'India'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs font-semibold">
                  Zero institutions onboarded
                </div>
              )}
            </div>

            {/* Dynamic State Count List */}
            <div className="space-y-1.5 text-xs">
              {realSchools.length === 0 ? (
                <div className="py-4 text-center text-slate-400 font-medium text-xs">
                  No regional distribution data yet.
                </div>
              ) : (
                Array.from(new Set(realSchools.map(s => s.state).filter(Boolean))).map(st => {
                  const count = realSchools.filter(s => s.state === st).length;
                  return (
                    <div key={st} className="flex items-center justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span> {st}
                      </span>
                      <span className="font-bold text-slate-900">{count} school(s)</span>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Col 2: Student Enrollment Growth (5 cols) */}
          <Card className="lg:col-span-5 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Student Enrollment Growth</h3>
                <p className="text-[11px] text-slate-400">Total Students vs Active Students</p>
              </div>
              <Badge variant="outline" className="text-xs text-slate-600">
                Last 6 Months
              </Badge>
            </div>

            {/* Interactive SVG Bar Chart */}
            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
              {[
                { month: 'Jan', total: 60, active: 45 },
                { month: 'Feb', total: 75, active: 55 },
                { month: 'Mar', total: 90, active: 70 },
                { month: 'Apr', total: 110, active: 85 },
                { month: 'May', total: 125, active: 100 },
                { month: 'Jun', total: 145, active: 115 },
                { month: 'Jul', total: 170, active: 135 },
                { month: 'Aug', total: 200, active: 160 },
              ].map(bar => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Total bar */}
                    <div
                      className="w-3 bg-indigo-600 rounded-t-md group-hover:bg-indigo-500 transition-all"
                      style={{ height: `${(bar.total / 200) * 100}%` }}
                      title={`Total: ${bar.total * 120}`}
                    />
                    {/* Active bar */}
                    <div
                      className="w-3 bg-purple-400 rounded-t-md group-hover:bg-purple-300 transition-all"
                      style={{ height: `${(bar.active / 200) * 100}%` }}
                      title={`Active: ${bar.active * 120}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-1">{bar.month}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-600"></span> Total Enrolled
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-purple-400"></span> Active Learners
              </span>
            </div>
          </Card>

          {/* Col 3: Revenue Donut & Quick Actions (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {/* Revenue Overview Card */}
            <Card className="p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Revenue & Financials</h3>
                <Badge variant="outline" className="text-[10px]">This Year</Badge>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xl font-black text-slate-900 block">₹18.4 Cr</span>
                  <span className="text-[10px] text-emerald-600 font-bold">+28% YoY Growth</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700 block">₹3.2 Cr</span>
                  <span className="text-[10px] text-rose-500 font-semibold">Pending Dues</span>
                </div>
              </div>

              {/* Progress Bar Categories */}
              <div className="space-y-1.5 text-[11px] pt-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-indigo-600">Computer Courses</span>
                  <span className="font-bold">42%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[42%]"></div>
                </div>

                <div className="flex justify-between font-semibold pt-1">
                  <span className="text-purple-600">Robotics Labs</span>
                  <span className="font-bold">18%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[18%]"></div>
                </div>

                <div className="flex justify-between font-semibold pt-1">
                  <span className="text-cyan-600">AI & Future Tech</span>
                  <span className="font-bold">15%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-cyan-600 h-full w-[15%]"></div>
                </div>
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quick Operations</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link href="/admin/schools/new">
                  <Button variant="outline" size="sm" className="w-full h-10 text-[11px] font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 flex items-center gap-1.5 justify-start">
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add School</span>
                  </Button>
                </Link>

                <Link href="/admin/trainers">
                  <Button variant="outline" size="sm" className="w-full h-10 text-[11px] font-bold border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 justify-start">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trainers</span>
                  </Button>
                </Link>

                <Link href="/admin/pricing">
                  <Button variant="outline" size="sm" className="w-full h-10 text-[11px] font-bold border-purple-200 text-purple-700 hover:bg-purple-50 flex items-center gap-1.5 justify-start">
                    <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                    <span>Course Pricing</span>
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsAiModalOpen(true)}
                  className="w-full h-10 text-[11px] font-bold border-cyan-200 text-cyan-700 hover:bg-cyan-50 flex items-center gap-1.5 justify-start"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-600" />
                  <span>AI Copilot</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Row 2: Recent Schools, Top Performing Schools, Course Enrollment & Live Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Recent Schools Table (5 cols) */}
          <Card className="lg:col-span-5 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Recent Partner Schools</h3>
              <Link href="/admin/schools" className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">School Name</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Board</th>
                    <th className="py-2 px-3">Students</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentSchools.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 font-medium text-xs">
                        No institutions onboarded yet. Create an account via '+ Add School' or accept registrations above.
                      </td>
                    </tr>
                  ) : (
                    recentSchools.map(school => (
                      <tr key={school.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">
                          <Link href={`/admin/schools/${school.id}`} className="font-bold text-slate-900 hover:text-indigo-600">
                            {school.name}
                          </Link>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{school.city}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px] font-bold">
                            {school.schoolType}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {school.totalStudents}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${school.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {school.isActive ? 'Active' : 'Pending Approval'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Performing Schools (4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Top Performing Institutions</h3>
              <span className="text-[11px] text-slate-400 font-semibold">By Course Enrollment</span>
            </div>

            <div className="space-y-2.5">
              {topSchools.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium text-xs">
                  Institutional performance rankings will display once onboarded schools enroll students.
                </div>
              ) : (
                topSchools.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-black text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400">{item.enrolled} enrolled / {item.total}</span>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {item.growth}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Live Activities (3 cols) */}
          <Card className="lg:col-span-3 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Live Platform Activity</h3>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Real-time</Badge>
            </div>

            <div className="space-y-3 text-xs">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium text-xs">
                  No platform events recorded yet.
                </div>
              ) : (
                activities.slice(0, 5).map(act => (
                  <div key={act.id} className="p-2 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${act.title.includes('Deleted') ? 'bg-rose-500' : 'bg-indigo-500'}`}></span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 block leading-tight truncate">{act.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block line-clamp-2 mt-0.5">{act.detail}</span>

                      {act.isRevokable && act.deletedSnapshot && (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const res = await revokeSchoolDeletion(act.id);
                              if (res.success) {
                                setRevokeMessage(`Accidental deletion revoked! Institution "${res.restoredSchool?.name}" has been successfully restored.`);
                                setTimeout(() => setRevokeMessage(null), 6000);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-lg cursor-pointer transition-colors shadow-2xs"
                            title="Undo accidental deletion and restore school records"
                          >
                            <RotateCcw className="w-3 h-3 text-amber-600" />
                            <span>Revoke Deletion</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Row 3: InnovatMind Trainers, Pipeline, Support Tickets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* InnovatMind Trainers Roster (4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">InnovatMind Trainers</h3>
              <Link href="/admin/trainers" className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {trainers.map(trainer => (
                <div key={trainer.id} className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{trainer.name}</span>
                      <span className="text-[10px] text-slate-400">{trainer.specialization} • {trainer.assignedSchoolsCount} schools</span>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${trainer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {trainer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* School Onboarding Pipeline (4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">School Onboarding Pipeline</h3>
              <span className="text-xs font-bold text-indigo-600">{pendingSchools.length} Pending Pipeline</span>
            </div>

            {/* Stage Counter Pills */}
            <div className="grid grid-cols-5 gap-1 text-center">
              {pipelineStats.map(stat => (
                <div key={stat.label} className={`p-1.5 rounded-lg border ${stat.color}`}>
                  <span className="text-xs font-black block">{stat.count}</span>
                  <span className="text-[9px] font-bold block truncate">{stat.label.split(' ')[0]}</span>
                </div>
              ))}
            </div>

            {/* Pipeline List */}
            <div className="space-y-2 pt-1 text-xs">
              {pendingSchools.length === 0 ? (
                <div className="py-6 text-center text-slate-400 font-medium text-xs">
                  No schools in onboarding pipeline.
                </div>
              ) : (
                pendingSchools.map(sch => (
                  <div key={sch.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                    <div>
                      <span className="font-bold text-slate-900 block leading-tight">{sch.name}</span>
                      <span className="text-[10px] text-slate-400">{sch.city}, {sch.state} • {new Date(sch.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {sch.onboardingStatus || 'PENDING_APPROVAL'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Support Tickets (4 cols) */}
          <Card className="lg:col-span-4 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Institutional Support Tickets</h3>
              <span className="text-xs text-slate-400 font-medium">Auto-synced</span>
            </div>

            <div className="space-y-2 text-xs">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-2.5 bg-slate-50/80 hover:bg-slate-50 rounded-xl">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-indigo-600 text-[11px]">{ticket.id}</span>
                      <span className="font-bold text-slate-900">{ticket.subject}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Priority: {ticket.priority}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-bold ${ticket.color}`}>
                    {ticket.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* AI Copilot Interactive Dialog Modal */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">InnovatMind AI Copilot</h3>
                    <span className="text-[10px] text-cyan-600 font-semibold">Super Admin Intelligence Engine</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAiModalOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleAskAi} className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder="Ask about schools, courses, revenue, or trainer workloads..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="text-xs h-10 pr-10"
                  />
                  <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 px-2.5 bg-indigo-600 text-white">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              {aiResponse && (
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/60 rounded-xl text-xs text-indigo-950 space-y-1">
                  <span className="font-bold text-indigo-700 block text-[11px] uppercase tracking-wider">AI Executive Briefing:</span>
                  <p className="leading-relaxed">{aiResponse}</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Application Details Modal */}
        {selectedApplicationForReview && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Application
                    </span>
                    {selectedApplicationForReview.registrationId && (
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {selectedApplicationForReview.registrationId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedApplicationForReview.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Submitted on {new Date(selectedApplicationForReview.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplicationForReview(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Institution Details</span>
                  <div><strong>Affiliation:</strong> {selectedApplicationForReview.schoolType} Board</div>
                  <div><strong>Tenant Code:</strong> <span className="font-mono">{selectedApplicationForReview.code}</span></div>
                  <div><strong>Location:</strong> {selectedApplicationForReview.city}, {selectedApplicationForReview.state}</div>
                  <div><strong>Address:</strong> {selectedApplicationForReview.address || 'N/A'} ({selectedApplicationForReview.postalCode || ''})</div>
                  <div><strong>Capacity:</strong> {(selectedApplicationForReview as any).studentCapacity || selectedApplicationForReview.totalStudents || 0} students</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Primary Administrative Contact</span>
                  <div><strong>Principal / Head:</strong> {selectedApplicationForReview.principalName || 'Institutional Head'}</div>
                  <div><strong>Official Email:</strong> <span className="font-mono break-all">{selectedApplicationForReview.email}</span></div>
                  <div><strong>Contact Phone:</strong> {selectedApplicationForReview.phone || 'N/A'}</div>
                  {selectedApplicationForReview.adminCredentials?.email && (
                    <div className="pt-2 border-t border-slate-200 text-indigo-900">
                      <strong>Designated Admin Login:</strong>
                      <span className="block font-mono text-[11px] text-indigo-600 mt-0.5 break-all">
                        {selectedApplicationForReview.adminCredentials.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Approval Impact</span>
                </div>
                <p>
                  Approving this request will immediately provision their multi-tenant workspace, generate their active credentials, and grant the institution access to the ERP and STEM lab modules.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplicationForReview(null)}
                  className="text-xs border-slate-200 text-slate-600 h-9"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const sch = selectedApplicationForReview;
                    setSelectedApplicationForReview(null);
                    setRejectModalSchool(sch);
                    setRejectReason('');
                  }}
                  className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 h-9 font-bold"
                >
                  Decline Application
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingAction}
                  onClick={async () => {
                    setIsProcessingAction(true);
                    setActionFeedback(null);
                    try {
                      const res = await approveSchool(selectedApplicationForReview.id);
                      if (res.success && res.school) {
                        const approved = res.school;
                        setSelectedApplicationForReview(null);
                        setActionFeedback({ type: 'success', message: `School '${approved.name}' approved and activated successfully!` });
                        setWelcomeKitSchool(approved);
                      } else {
                        setActionFeedback({ type: 'error', message: res.error || 'Failed to approve school.' });
                      }
                    } catch (err: any) {
                      setActionFeedback({ type: 'error', message: err.message || 'Error processing approval request.' });
                    } finally {
                      setIsProcessingAction(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessingAction ? 'Processing...' : 'Approve & Activate Tenant'}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModalSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Decline Institutional Request</h3>
                  <p className="text-xs text-slate-500">{rejectModalSchool.name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Rejection (Optional Notes)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Incomplete accreditation documents or duplicate application..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalSchool(null)}
                  className="text-xs text-slate-600 border-slate-200 h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingAction}
                  onClick={async () => {
                    setIsProcessingAction(true);
                    setActionFeedback(null);
                    try {
                      const res = await rejectSchool(rejectModalSchool.id, rejectReason);
                      if (res.success) {
                        setActionFeedback({ type: 'success', message: `School '${rejectModalSchool.name}' application declined.` });
                        setRejectModalSchool(null);
                      } else {
                        setActionFeedback({ type: 'error', message: res.error || 'Failed to decline school request.' });
                      }
                    } catch (err: any) {
                      setActionFeedback({ type: 'error', message: err.message || 'Error processing request.' });
                    } finally {
                      setIsProcessingAction(false);
                    }
                  }}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isProcessingAction ? 'Declining...' : 'Confirm Decline'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Welcome Kit Modal */}
        <WelcomeKitModal
          school={welcomeKitSchool}
          isOpen={Boolean(welcomeKitSchool)}
          onClose={() => setWelcomeKitSchool(null)}
          onDispatched={(updated) => setWelcomeKitSchool(updated)}
        />
      </div>
    </>
  );
}

export default function SuperAdminDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppShell>
      {!mounted ? (
        <div className="min-h-[500px] flex items-center justify-center text-slate-500 text-sm font-medium">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3" />
          Loading Central HQ Dashboard...
        </div>
      ) : (
        <SuperAdminDashboardContent />
      )}
    </AppShell>
  );
}
