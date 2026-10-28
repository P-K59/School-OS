"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
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
  X
} from 'lucide-react';

export default function SuperAdminDashboard() {
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
    createSchool
  } = useAuth();

  // Distribution tab state
  const [distTab, setDistTab] = useState<'location' | 'type' | 'status'>('location');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Quick Action Modal states
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Recent 5 partner schools
  const recentSchools = useMemo(() => {
    return schools.slice(0, 5);
  }, [schools]);

  // Top performing schools by enrollment
  const topSchools = useMemo(() => {
    return [
      { name: 'Sunrise International', total: 3240, enrolled: 2980, growth: '+32%', type: 'Private' },
      { name: 'Greenwood Public', total: 2880, enrolled: 2450, growth: '+28%', type: 'Private' },
      { name: 'Bright Future Academy', total: 2450, enrolled: 2120, growth: '+26%', type: 'Private' },
      { name: 'Shanti Niketan', total: 1980, enrolled: 1760, growth: '+24%', type: 'Government' },
      { name: 'Oxford Global', total: 1720, enrolled: 1480, growth: '+22%', type: 'Private' },
    ];
  }, []);

  // Course enrollment breakdown
  const courseEnrollmentStats = useMemo(() => {
    return [
      { name: 'Computer Basics', students: 8420, growth: '+32%', iconColor: 'text-indigo-600 bg-indigo-50' },
      { name: 'Coding & Programming', students: 6380, growth: '+28%', iconColor: 'text-cyan-600 bg-cyan-50' },
      { name: 'Robotics & Automation', students: 4960, growth: '+35%', iconColor: 'text-purple-600 bg-purple-50' },
      { name: 'AI & Future Tech', students: 3820, growth: '+40%', iconColor: 'text-rose-600 bg-rose-50' },
      { name: 'Web Development', students: 2540, growth: '+25%', iconColor: 'text-blue-600 bg-blue-50' },
    ];
  }, []);

  // Pipeline stages data
  const pipelineStats = [
    { label: 'New Enquiries', count: 24, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { label: 'In Discussion', count: 16, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Demo Scheduled', count: 8, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
    { label: 'Contract Stage', count: 5, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { label: 'Onboarding', count: 3, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  ];

  // Pipeline schools list
  const pipelineSchools = [
    { name: 'Navodaya Public', location: 'Kanpur', type: 'Private', date: '10 Oct 2026', status: 'In Discussion', color: 'bg-blue-50 text-blue-700' },
    { name: 'Radiant International', location: 'Jaipur', type: 'Private', date: '15 Oct 2026', status: 'Demo Scheduled', color: 'bg-cyan-50 text-cyan-700' },
    { name: 'Oxford Global', location: 'Bhopal', type: 'Affordable', date: '20 Oct 2026', status: 'Contract Stage', color: 'bg-amber-50 text-amber-700' },
    { name: 'Lifeline Public', location: 'Agra', type: 'Government', date: '25 Oct 2026', status: 'In Discussion', color: 'bg-blue-50 text-blue-700' },
    { name: 'Winda International', location: 'Gwalior', type: 'Private', date: '30 Oct 2026', status: 'New Enquiry', color: 'bg-indigo-50 text-indigo-700' },
  ];

  // Support Tickets
  const supportTickets = [
    { id: '#TCK-2041', subject: 'Lab setup issue', priority: 'High', status: 'Open', color: 'bg-rose-50 text-rose-700' },
    { id: '#TCK-2038', subject: 'Course access', priority: 'Medium', status: 'In Progress', color: 'bg-amber-50 text-amber-700' },
    { id: '#TCK-2035', subject: 'Payment update', priority: 'High', status: 'Open', color: 'bg-rose-50 text-rose-700' },
    { id: '#TCK-2031', subject: 'Trainer request', priority: 'Low', status: 'Resolved', color: 'bg-emerald-50 text-emerald-700' },
    { id: '#TCK-2028', subject: 'Hardware support', priority: 'Medium', status: 'In Progress', color: 'bg-amber-50 text-amber-700' },
  ];

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (aiPrompt.toLowerCase().includes('school') || aiPrompt.toLowerCase().includes('growth')) {
      setAiResponse(`Synthesizing platform telemetry: 48 partner schools active across 6 states. Sunrise International School (Nagpur) leads in STEM enrollment (+32% MoM growth), followed by Greenwood Public (Pune). 5 new schools currently in contract stage.`);
    } else if (aiPrompt.toLowerCase().includes('revenue') || aiPrompt.toLowerCase().includes('price')) {
      setAiResponse(`Financial engine summary: Total Monthly Revenue is ₹18.4 Cr (+28%). Computer & Coding courses comprise 42% of revenue. Pending fees stand at ₹3.2 Cr with Greenwood Public clearing ₹2,50,000 recently.`);
    } else if (aiPrompt.toLowerCase().includes('trainer')) {
      setAiResponse(`Operational roster: 86 master trainers certified. Rahul Sharma (Robotics, 6 schools, 32 hrs/wk) and Amit Verma (Coding, 5 schools) are fully allocated. Neha Singh is currently on scheduled leave.`);
    } else {
      setAiResponse(`InnovatMind OS Copilot: Query processed successfully across all 48 institutional tenants. Curriculum assignments, student attendance, and trainer allocations are operational with 99.8% uptime.`);
    }
  };

  return (
    <AppShell>
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
              Welcome back, Pankaj! 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 font-medium">
              Here's the complete operational and financial overview of InnovatMind School OS
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

            <select className="h-10 px-3.5 bg-slate-800/90 border border-slate-700 text-white text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Financial Year</option>
            </select>
          </div>
        </div>

        {/* 6 Metric KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Total Schools */}
          <Link href="/admin/schools" className="block group">
            <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Schools</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">48</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+14%</span>
              </div>
            </Card>
          </Link>

          {/* Card 2: Total Students */}
          <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">24,580</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18%</span>
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">86</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-blue-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8%</span>
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
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">31</h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-purple-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+24%</span>
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
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹18.4 Cr</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+28%</span>
            </div>
          </Card>

          {/* Card 6: Pending Payments */}
          <Card className="p-4 bg-white border border-slate-200/90 shadow-sm rounded-2xl hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Payments</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹3.2 Cr</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-rose-600">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-12%</span>
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
                <option value="ALL">All States</option>
                <option value="Maharashtra">Maharashtra (8)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (12)</option>
                <option value="Delhi">Delhi (5)</option>
                <option value="Madhya Pradesh">Madhya Pradesh (6)</option>
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

            {/* India Map Representation with Active Pin */}
            <div className="relative h-44 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 rounded-xl border border-indigo-100 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full opacity-35 text-indigo-400" viewBox="0 0 200 200" fill="currentColor">
                <path d="M70,30 Q90,20 110,35 Q130,50 140,80 Q150,110 130,140 Q110,170 80,180 Q60,170 50,140 Q40,100 50,60 Z" />
              </svg>

              {/* Pin 1: Maharashtra */}
              <div className="absolute top-1/2 left-1/3 -translate-y-4 -translate-x-4">
                <div className="relative group cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-300/60 animate-pulse"></div>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 w-32 p-2 bg-slate-900 text-white rounded-lg text-[10px] shadow-xl text-center pointer-events-none">
                    <span className="font-bold block">Maharashtra</span>
                    <span className="text-indigo-300">8 Schools • 4,820 Students</span>
                  </div>
                </div>
              </div>

              {/* Pin 2: Uttar Pradesh */}
              <div className="absolute top-1/4 left-1/2">
                <div className="w-3 h-3 rounded-full bg-purple-600 ring-4 ring-purple-200"></div>
              </div>

              {/* Pin 3: Delhi */}
              <div className="absolute top-1/5 left-2/5">
                <div className="w-3 h-3 rounded-full bg-cyan-600 ring-4 ring-cyan-200"></div>
              </div>
            </div>

            {/* State Count List */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Uttar Pradesh
                </span>
                <span className="font-bold text-slate-900">12</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span> Maharashtra
                </span>
                <span className="font-bold text-slate-900">8</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span> Madhya Pradesh
                </span>
                <span className="font-bold text-slate-900">6</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-600"></span> Delhi NCR
                </span>
                <span className="font-bold text-slate-900">5</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span> Other States
                </span>
                <span className="font-bold text-slate-900">17</span>
              </div>
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
                  {recentSchools.map(school => (
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
                          {school.isActive ? 'Active' : 'Onboarding'}
                        </span>
                      </td>
                    </tr>
                  ))}
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
              {topSchools.map((item, idx) => (
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
              ))}
            </div>
          </Card>

          {/* Recent Live Activities (3 cols) */}
          <Card className="lg:col-span-3 p-5 bg-white border border-slate-200/90 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Live Platform Activity</h3>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Real-time</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">New school onboarded</span>
                  <span className="text-[11px] text-slate-500">Bright Future Academy (Lucknow)</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">10 min ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">Course assigned</span>
                  <span className="text-[11px] text-slate-500">Robotics & Sensors Lab — Sunrise Int.</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">32 min ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">Fee received</span>
                  <span className="text-[11px] text-slate-500">₹2,50,000 — Greenwood Public</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">1 hour ago</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">Trainer allocated</span>
                  <span className="text-[11px] text-slate-500">Priya Mehta allocated to Navodaya</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">2 hours ago</span>
                </div>
              </div>
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
              <span className="text-xs font-bold text-indigo-600">56 Leads Active</span>
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
              {pipelineSchools.map(sch => (
                <div key={sch.name} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900 block leading-tight">{sch.name}</span>
                    <span className="text-[10px] text-slate-400">{sch.location} • {sch.date}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${sch.color}`}>
                    {sch.status}
                  </span>
                </div>
              ))}
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
      </div>
    </AppShell>
  );
}
