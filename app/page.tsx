"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Building2,
  GraduationCap,
  BarChart3,
  Cpu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Globe,
  Menu,
  X,
  Code2,
  Sparkles,
  Users,
  Trophy,
  BookOpen,
  Award,
  Layers,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { loginAsRole, setDataMode } = useAuth();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>('English');
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLaunchDemo = (role: 'SCHOOL_ADMIN' | 'STUDENT' | 'SUPER_ADMIN') => {
    setDataMode('DEMO');
    loginAsRole(role, 'school-1');
    setDemoModalOpen(false);
    if (role === 'SUPER_ADMIN') router.push('/admin');
    else if (role === 'STUDENT') router.push('/student');
    else router.push('/school');
  };

  // Coding Sandbox State
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const [activeCategory, setActiveCategory] = useState('Python Programming');
  const [simRunning, setSimRunning] = useState(false);
  const [simComplete, setSimComplete] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Gamified Quiz State
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Video Walkthrough Modal State
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const categories = [
    'Computer Basics',
    'Python Programming',
    'Web Development',
    'AI & Machine Learning',
    'Robotics & IoT',
    'Data Analytics'
  ];

  const handleRunSimulation = () => {
    setSimRunning(true);
    setSimComplete(false);
    setSimStep(0);
    setActiveTab('output');

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setSimStep(current);
      if (current >= 4) {
        clearInterval(interval);
        setSimRunning(false);
        setSimComplete(true);
      }
    }, 450);
  };

  const handleQuizSelect = (idx: number) => {
    setSelectedQuizAnswer(idx);
    setQuizScore(idx === 1 ? 50 : 0);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-700 relative overflow-x-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full bg-blue-300/15 blur-[140px] pointer-events-none" />
      <div className="absolute top-[25%] left-[-10%] w-[45vw] h-[45vw] max-w-[650px] max-h-[650px] rounded-full bg-purple-300/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-cyan-200/20 blur-[160px] pointer-events-none" />

      {/* =========================================================================
          SECTION B: TOP NAVIGATION BAR
      ========================================================================== */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                InnovatMind
              </span>
              <span className="text-xs font-semibold text-slate-400 -mt-0.5">
                School OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-slate-600">
            <Link href="/" className="text-blue-600 font-bold border-b-2 border-blue-600 pb-1 -mb-1">
              Home
            </Link>
            <div className="relative group flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
              <span>Product</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />
              <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl p-2 hidden group-hover:block animate-fade-in">
                <Link href="#features" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">School Management</Link>
                <Link href="#coding-robotics" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Student Learning & STEM</Link>
                <Link href="#stakeholders" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Role Dashboards</Link>
              </div>
            </div>
            <div className="relative group flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />
              <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl p-2 hidden group-hover:block animate-fade-in">
                <Link href="#stakeholders" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">For K-12 Private Schools</Link>
                <Link href="#stakeholders" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">For STEM & Robotics Labs</Link>
                <Link href="#stakeholders" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">For School Chains & Trusts</Link>
              </div>
            </div>
            <div className="relative group flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
              <span>Learning</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:rotate-180" />
              <div className="absolute top-full left-0 mt-3 w-56 rounded-2xl bg-white border border-slate-100 shadow-xl p-2 hidden group-hover:block animate-fade-in">
                <Link href="#coding-robotics" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Python & Block Coding</Link>
                <Link href="#coding-robotics" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Robotics & IoT Projects</Link>
                <Link href="#gamified" className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl">Gamified Missions & Quizzes</Link>
              </div>
            </div>
            <Link href="#pricing" className="hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="#how-it-works" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="#contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Header Controls */}
          <div className="hidden sm:flex items-center gap-3.5">
            
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white border border-slate-200 shadow-lg p-1.5 z-50">
                  <button
                    onClick={() => { setSelectedLanguage('English'); setIsLangOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setSelectedLanguage('Hindi'); setIsLangOpen(false); }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    हिन्दी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Demo Preview Button */}
            <button
              onClick={() => setDemoModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-black text-amber-800 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="Explore full platform features with pre-populated sample data"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo Preview</span>
            </button>

            {/* Login Button */}
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 transition-colors cursor-pointer"
            >
              Log in
            </Link>

            {/* Get Started Button */}
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 group cursor-pointer active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-700">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-blue-600">Home</Link>
              <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Product & Solutions</Link>
              <Link href="#coding-robotics" onClick={() => setMobileMenuOpen(false)}>STEM & Robotics Learning</Link>
              <Link href="#stakeholders" onClick={() => setMobileMenuOpen(false)}>For Schools & Students</Link>
              <Link href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
              <Link href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                onClick={() => { setMobileMenuOpen(false); setDemoModalOpen(true); }}
                className="w-full h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Demo Preview</span>
              </button>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-xl border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/25"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION C: HERO SECTION (Headline, Subtext, CTAs, 3D Mockup Devices)
      ========================================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[11px] font-black tracking-widest text-blue-700 uppercase">
                School Management & Digital Learning
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.12]">
              One platform to <br className="hidden sm:inline" />
              run <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                your school.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              InnovatMind School OS helps schools manage daily operations, empower teachers, and give students access to future-ready digital learning—all in one connected platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/register"
                className="h-12 px-7 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2 group cursor-pointer active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                type="button"
                onClick={() => setDemoModalOpen(true)}
                className="h-12 px-6 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100/90 text-amber-900 font-extrabold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Demo Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoModalOpen(true)}
                className="h-12 px-5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Video Preview</span>
              </button>
            </div>

            {/* Value Checkmarks */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Simple onboarding</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Role-based access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>School and student learning connected</span>
              </div>
            </div>

          </div>

          {/* Right Hero Visuals: Realistic Dual-Device Showcase (Laptop + Mobile) */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[620px]">
              
              {/* Laptop Shell Frame */}
              <div className="relative rounded-2xl bg-slate-900 p-2 sm:p-2.5 shadow-2xl shadow-blue-500/15 border-4 border-slate-800">
                
                {/* Camera Notch Dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-auto mb-1.5" />

                {/* Laptop Screen Content: Greenwood International School */}
                <div className="rounded-xl overflow-hidden bg-white border border-slate-200 shadow-inner text-left font-sans">
                  
                  {/* Dashboard Top Header Bar */}
                  <div className="h-10 bg-slate-900 text-white px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-[10px]">
                        M
                      </div>
                      <span className="font-bold text-[11px] tracking-tight">InnovatMind School OS</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-2 py-1 rounded-md text-[10px] text-slate-300 w-44">
                      <span>Search anything...</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                        A
                      </div>
                      <span className="font-bold hidden sm:inline">Admin</span>
                    </div>
                  </div>

                  {/* Dashboard Inner Body */}
                  <div className="flex h-64 sm:h-72 bg-slate-50/60 overflow-hidden text-[11px]">
                    
                    {/* Dark Compact Left Sidebar */}
                    <div className="w-24 sm:w-28 bg-[#0F172A] text-slate-300 p-2 space-y-1 hidden xs:block shrink-0">
                      <div className="px-2 py-1 rounded-md bg-blue-600 text-white font-bold text-[10px] flex items-center gap-1.5">
                        <BarChart3 className="w-3 h-3" />
                        <span>Dashboard</span>
                      </div>
                      <div className="px-2 py-1 rounded-md text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        <span>Students</span>
                      </div>
                      <div className="px-2 py-1 rounded-md text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3" />
                        <span>Teachers</span>
                      </div>
                      <div className="px-2 py-1 rounded-md text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Attendance</span>
                      </div>
                      <div className="px-2 py-1 rounded-md text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5">
                        <Award className="w-3 h-3" />
                        <span>Fees</span>
                      </div>
                      <div className="px-2 py-1 rounded-md text-slate-400 hover:text-white text-[10px] flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>Learning</span>
                      </div>
                    </div>

                    {/* Main School Content Overview */}
                    <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3">
                      
                      {/* School Title Header */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div>
                          <div className="text-[13px] font-black text-slate-900 leading-tight">School Overview</div>
                          <div className="text-[9px] text-slate-400 font-semibold">Greenwood International School • Session 2024-25</div>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          This Month
                        </span>
                      </div>

                      {/* 4 Stat Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div className="text-[9px] text-slate-400 font-bold">Students</div>
                          <div className="text-sm font-black text-slate-900">1,248</div>
                          <div className="text-[8px] text-emerald-600 font-bold">↑ 12% this month</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div className="text-[9px] text-slate-400 font-bold">Teachers</div>
                          <div className="text-sm font-black text-slate-900">86</div>
                          <div className="text-[8px] text-blue-600 font-bold">↑ 4% this month</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div className="text-[9px] text-slate-400 font-bold">Attendance</div>
                          <div className="text-sm font-black text-slate-900">94%</div>
                          <div className="text-[8px] text-emerald-600 font-bold">↑ 2% this week</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                          <div className="text-[9px] text-slate-400 font-bold">Fee Collection</div>
                          <div className="text-sm font-black text-slate-900">₹18.4L</div>
                          <div className="text-[8px] text-emerald-600 font-bold">↑ 8% this month</div>
                        </div>
                      </div>

                      {/* Chart & Activity Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        {/* Attendance Chart Mock */}
                        <div className="sm:col-span-7 bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-800 mb-2">Attendance Overview</div>
                          <div className="h-20 flex items-end justify-between gap-1 pt-2 border-b border-slate-100">
                            {[70, 85, 92, 78, 88, 95].map((h, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div style={{ height: `${h}%` }} className="w-full max-w-[14px] bg-blue-500 rounded-t-xs" />
                                <span className="text-[7px] text-slate-400 font-medium">M{i+1}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="sm:col-span-5 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                          <div className="text-[10px] font-bold text-slate-800">Recent Activities</div>
                          <div className="text-[9px] p-1 rounded bg-slate-50 text-slate-600">
                            <span className="font-bold text-slate-900 block">New Student Admitted</span>
                            Aarav Sharma - Grade 6
                          </div>
                          <div className="text-[9px] p-1 rounded bg-slate-50 text-slate-600">
                            <span className="font-bold text-slate-900 block">Fee Payment Received</span>
                            Grade 4 • ₹12,000
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Laptop Keyboard Base Bar */}
              <div className="w-[108%] -ml-[4%] h-3.5 bg-slate-800 rounded-b-xl border-t border-slate-700 shadow-md" />

              {/* Companion Mobile Smartphone Frame (Floating Overlap Right) */}
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 w-44 sm:w-52 rounded-3xl bg-slate-900 p-2 shadow-2xl border-2 border-slate-800 z-20 hidden xs:block">
                <div className="rounded-2xl bg-white overflow-hidden p-3 space-y-2 text-left">
                  
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div>
                      <div className="text-[11px] font-black text-slate-900">Welcome Back Aarav!</div>
                      <div className="text-[8px] text-slate-400 font-semibold">Grade 6 • Section A</div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                      A
                    </div>
                  </div>

                  {/* Continue Learning Card */}
                  <div className="p-2 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 space-y-1">
                    <span className="text-[8px] font-bold text-blue-600 uppercase">Continue Learning</span>
                    <div className="text-[10px] font-black text-slate-900">Python Basics</div>
                    <div className="w-full bg-blue-200/60 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full w-[60%]" />
                    </div>
                    <div className="text-[8px] text-slate-500 font-semibold">60% Complete</div>
                  </div>

                  {/* Quick Action Tiles */}
                  <div className="grid grid-cols-2 gap-1.5 text-center">
                    <div className="p-1.5 rounded-lg bg-slate-50 text-[8px] font-bold text-slate-700 border border-slate-100">
                      📚 My Classes
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 text-[8px] font-bold text-slate-700 border border-slate-100">
                      🎯 Quizzes
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 text-[8px] font-bold text-slate-700 border border-slate-100">
                      💻 Projects
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50 text-[8px] font-bold text-slate-700 border border-slate-100">
                      🏆 Achievements
                    </div>
                  </div>

                  {/* Daily Progress */}
                  <div className="pt-1 flex items-center justify-between text-[8px] text-slate-500 font-bold border-t border-slate-100">
                    <span>Today's Progress</span>
                    <span className="text-blue-600">2/5 Activities</span>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION D: ECOSYSTEM STRIP / METRICS PILLS
      ========================================================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto flex-1">
            
            {/* Pill 1: School Management */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">School</div>
                <div className="text-[11px] text-slate-500 font-medium">Management</div>
              </div>
            </div>

            {/* Pill 2: Student Learning */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-emerald-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">Student</div>
                <div className="text-[11px] text-slate-500 font-medium">Learning</div>
              </div>
            </div>

            {/* Pill 3: Analytics & Reports */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-amber-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">Analytics</div>
                <div className="text-[11px] text-slate-500 font-medium">& Reports</div>
              </div>
            </div>

            {/* Pill 4: AI & Robotics */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50/70 hover:bg-purple-50/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-slate-900 leading-tight">AI, Robotics</div>
                <div className="text-[11px] text-slate-500 font-medium">& Future Skills</div>
              </div>
            </div>

          </div>

          {/* Right Indicative Badge */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-500 pl-4 border-l border-slate-200 shrink-0">
            <span className="w-6 h-0.5 bg-blue-600 rounded-full" />
            <span>A complete ecosystem for modern schools</span>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION E: TAILORED FOR EVERY STAKEHOLDER (4 Responsive Cards)
      ========================================================================== */}
      <section id="stakeholders" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 text-left gap-4">
          <div>
            <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase block mb-1">
              TAILORED FOR EVERY STAKEHOLDER
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              One Platform. Multiple People. <span className="text-blue-600">Maximum Impact.</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs text-left md:text-right font-medium">
              Different users. Different goals. A unified platform that brings everyone together.
            </p>
            <div className="hidden sm:flex items-center gap-2">
              <button aria-label="Previous card" className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-2xs">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button aria-label="Next card" className="w-9 h-9 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 shadow-2xs">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Responsive Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: School Admins */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                  alt="School Administrator at computer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-black text-white bg-blue-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Administration
                </span>
              </div>

              <div className="p-5 text-left space-y-3">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                  For School Admins
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Admissions and student records</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Attendance, fees and finance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Staff and academic management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Reports and school operations</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0 flex justify-end">
              <Link
                href="/login?redirect=/school"
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-blue-600 hover:text-white flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
                title="Enter School Admin Portal"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Teachers */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full bg-gradient-to-br from-emerald-600 to-teal-700 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80"
                  alt="Teacher guiding students in class"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-black text-white bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Academics
                </span>
              </div>

              <div className="p-5 text-left space-y-3">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  For Teachers
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Class and lesson management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Attendance and assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Student progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Teaching resources & curriculum</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0 flex justify-end">
              <Link
                href="/login?redirect=/teacher"
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-emerald-600 hover:text-white flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
                title="Enter Teacher Portal"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Students */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full bg-gradient-to-br from-indigo-600 to-purple-700 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80"
                  alt="Student coding with headset"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-black text-white bg-purple-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Gamified Learning
                </span>
              </div>

              <div className="p-5 text-left space-y-3">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-purple-600 transition-colors">
                  For Students
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Interactive lessons and quizzes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Coding, AI and robotics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Progress, points and badges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Fun and engaging missions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0 flex justify-end">
              <Link
                href="/login?redirect=/student"
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-purple-600 hover:text-white flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
                title="Enter Student Portal"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 4: Parents */}
          <div className="rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="h-44 w-full bg-gradient-to-br from-amber-500 to-rose-600 relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=600&q=80"
                  alt="Mother helping student with schoolwork"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-xs font-black text-white bg-amber-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  Parent Engagement
                </span>
              </div>

              <div className="p-5 text-left space-y-3">
                <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                  For Parents
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Track your child's progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Attendance and academic updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Fee information (where enabled)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>School announcements & calendar</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0 flex justify-end">
              <Link
                href="/login?redirect=/parent"
                className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-amber-600 hover:text-white flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-xs"
                title="Enter Parent Portal"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION F: FUTURE-READY LEARNING (Coding, AI, Robotics & Simulation Sandbox)
      ========================================================================== */}
      <section id="coding-robotics" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Section Header */}
        <div className="text-left mb-10 space-y-2">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            FUTURE-READY LEARNING
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Coding, AI, Robotics <span className="text-blue-600">& More</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-medium">
            Help students develop real-world skills through interactive courses, projects and hands-on learning experiences.
          </p>
        </div>

        {/* 3-Column Interactive Sandbox Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Learning Categories Selector */}
          <div className="lg:col-span-3 space-y-2 text-left">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className={`w-3.5 h-3.5 ${activeCategory === cat ? 'text-white' : 'text-slate-400'}`} />
              </button>
            ))}

            <div className="pt-4">
              <Link
                href="/student"
                className="w-full h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
              >
                <span>Explore Student Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Center Column: Interactive Code Sandbox & Robot Simulation Grid */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden text-left">
            
            {/* Sandbox Tabs */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'output' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Output & Simulation
                </button>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                main.py • Python 3
              </div>
            </div>

            {/* Sandbox Content */}
            <div className="p-4 sm:p-5">
              {activeTab === 'code' ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs sm:text-sm text-emerald-400 leading-relaxed shadow-inner">
                    <span className="text-slate-500 block"># Move the robot to the goal</span>
                    <span className="text-purple-400">for</span> i <span className="text-purple-400">in</span> <span className="text-cyan-400">range</span>(<span className="text-amber-400">4</span>): <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">move_forward</span>() <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-300">turn_right</span>()
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={simRunning}
                      onClick={handleRunSimulation}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {simRunning ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Run Code</span>
                        </>
                      )}
                    </button>
                    <span className="text-xs text-slate-400 font-semibold">
                      Click to watch the robot execute in the simulation grid!
                    </span>
                  </div>
                </div>
              ) : (
                /* Output & Robot Simulation Grid */
                <div className="space-y-4 text-center">
                  
                  {/* Visual 4x4 Grid with Robot and Flag */}
                  <div className="relative mx-auto w-56 h-56 bg-slate-100 rounded-2xl border-2 border-slate-200 grid grid-cols-4 grid-rows-4 p-2 gap-1.5 shadow-inner">
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <div key={idx} className="bg-white/80 rounded-lg border border-slate-200/50 flex items-center justify-center relative">
                        {idx === 15 && (
                          <div className="text-base animate-pulse">🚩</div>
                        )}
                        {((simStep === 0 && idx === 0) ||
                          (simStep === 1 && idx === 3) ||
                          (simStep === 2 && idx === 7) ||
                          (simStep === 3 && idx === 11) ||
                          (simStep >= 4 && idx === 15)) && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-blue-500/50 transition-all duration-300">
                            🤖
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Output Terminal Log */}
                  <div className="p-3 bg-slate-900 rounded-xl text-left font-mono text-[11px] text-slate-300 space-y-1">
                    <div className="text-emerald-400 font-bold">$ python main.py</div>
                    {simStep >= 1 && <div>&gt; Robot moved forward +1 step.</div>}
                    {simStep >= 2 && <div>&gt; Robot turned right 90°.</div>}
                    {simStep >= 3 && <div>&gt; Robot navigating obstacle course...</div>}
                    {simComplete && (
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>[SUCCESS] Goal reached! Code verified (+50 XP Earned)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('code'); setSimComplete(false); setSimStep(0); }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Edit Code
                    </button>
                    <button
                      type="button"
                      disabled={simRunning}
                      onClick={handleRunSimulation}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Re-run
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: "Built for Real Skills" Highlights */}
          <div className="lg:col-span-3 rounded-3xl bg-white border border-slate-200/90 shadow-md p-6 text-left space-y-4">
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Built for Real Skills
            </h3>
            <ul className="space-y-3.5 text-xs text-slate-600 font-semibold">
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Interactive Coding</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Robotics Simulations</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>AI Projects & ML Models</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Certificates & Progress</span>
              </li>
            </ul>

            <div className="pt-2 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-slate-700 space-y-1">
                <div className="text-[11px] font-black text-blue-900">National NEP 2020 Aligned</div>
                <p className="text-[10px] text-slate-600">
                  Comprehensive graded computer science & robotics curriculum from Grade 1 to Grade 12.
                </p>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION G: GAMIFIED LEARNING ("Learning That Kids Love")
      ========================================================================== */}
      <section id="gamified" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
            
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-black tracking-widest text-cyan-400 uppercase">
                MOTIVATION & ENGAGEMENT
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Learning That Kids Love
              </h2>
              <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                Transform passive lectures into active discovery with gamified coding quests, robotic experiments, badges, and learning levels designed for Grades 1 to 12.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Interactive quizzes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Coding challenges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Points & badges</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Age-appropriate levels</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer"
                >
                  <span>Launch Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-bold text-[10px]">
                      Quick Challenge
                    </span>
                    <span className="text-slate-300 font-semibold">Grade 6 • Robotics Logic</span>
                  </div>
                  <span className="text-amber-400 font-black text-xs">+50 XP</span>
                </div>

                <div className="text-sm font-bold text-white leading-snug">
                  "In our robotic simulation, what does calling <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">turn_right()</code> execute?"
                </div>

                <div className="space-y-2">
                  {[
                    "Moves the robot forward by 2 squares",
                    "Rotates the robot clockwise by 90 degrees",
                    "Stops the robot simulation immediately"
                  ].map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuizSelect(idx)}
                      className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        selectedQuizAnswer === idx
                          ? idx === 1
                            ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200'
                            : 'bg-rose-500/30 border-2 border-rose-400 text-rose-200'
                          : 'bg-white/5 border border-white/10 hover:bg-white/15 text-slate-200'
                      }`}
                    >
                      <span>{option}</span>
                      {selectedQuizAnswer === idx && (
                        <span>{idx === 1 ? '✅ Correct!' : '❌ Try again'}</span>
                      )}
                    </button>
                  ))}
                </div>

                {quizScore !== null && (
                  <div className={`p-2.5 rounded-xl text-center text-xs font-bold ${
                    quizScore > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    {quizScore > 0 ? '🎉 Awesome job! You unlocked the Robotics Cadet Badge.' : 'Almost there! Selecting option 2 will rotate the robot.'}
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION H: HOW IT WORKS (3 Simple Steps)
      ========================================================================== */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-12 space-y-2">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            SEAMLESS IMPLEMENTATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How InnovatMind School OS Works
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Get your school running smoothly in three straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Step 1 */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="text-lg font-black text-slate-900">
              School Joins the OS
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Register your institution through our verified onboarding workflow. Configure school details, academic sessions, and core preferences in minutes.
            </p>
            <div className="pt-2">
              <Link href="/register" className="text-xs font-extrabold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
                <span>Start School Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 font-black text-xl flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Configure & Assign Roles
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              School administrators add teachers, provision student credentials in bulk, assign STEM curriculum, and define permissions using unified role access.
            </p>
            <div className="pt-2">
              <Link href="/login?redirect=/school" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1">
                <span>Access Admin Gateway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 font-black text-xl flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Empower Learning & Operations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Teachers track progress, students code and build robotics missions, and parents stay updated with real-time academic and attendance notifications.
            </p>
            <div className="pt-2">
              <Link href="/login" className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                <span>Unified Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          SECTION I: PRICING & CALL TO ACTION
      ========================================================================== */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-12 space-y-2">
          <span className="text-[11px] font-black tracking-widest text-blue-600 uppercase">
            TRANSPARENT INSTITUTIONAL MODEL
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Educational Growth
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Core school management with flexible future-ready robotics and coding curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 text-left">
          
          {/* Card 1: Core School ERP (Free institutional tier) */}
          <div className="rounded-3xl bg-white border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all space-y-6">
            <div>
              <span className="text-xs font-black uppercase text-blue-600 tracking-wider">Foundation Tier</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">School Management ERP</h3>
              <p className="text-xs text-slate-500 mt-2">
                Essential school administration, attendance, and student registry tools for modern schools.
              </p>
            </div>

            <div className="text-3xl font-black text-slate-900">
              ₹0 <span className="text-xs text-slate-400 font-semibold">/ school management access</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 font-semibold border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Student, teacher, and staff registries</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Attendance tracking & timetabling</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Fee invoice creation & tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Unified role-based dashboard access</span>
              </li>
            </ul>

            <Link
              href="/register"
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Onboard Your School Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: AI & Robotics Curriculum Programs */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-purple-50/80 border-2 border-blue-500/40 p-8 shadow-xl relative space-y-6">
            <span className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              Future-Ready STEM
            </span>

            <div>
              <span className="text-xs font-black uppercase text-purple-600 tracking-wider">Premium Learning</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">Coding & Robotics Programs</h3>
              <p className="text-xs text-slate-500 mt-2">
                Turnkey AI, Python, web development, and hardware robotics curriculum with certified trainer support.
              </p>
            </div>

            <div className="text-3xl font-black text-slate-900">
              Custom <span className="text-xs text-slate-500 font-semibold">/ Per Student Grade Plan</span>
            </div>

            <ul className="space-y-3 text-xs text-slate-600 font-semibold border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Full access to student learning portal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Grades 1-12 gamified coding & AI curriculum</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Certified InnovatMind trainer allocation</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Hardware robotics kits & school lab setup</span>
              </li>
            </ul>

            <Link
              href="#contact"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Contact Us for Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Big Banner CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-14 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Build a Smarter School with InnovatMind
            </h2>
            <p className="text-sm sm:text-base text-blue-100 font-medium">
              Join progressive institutions empowering students with digital management, coding, and future skills.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <Link
                href="/register"
                className="h-12 px-7 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </Link>
              <Link
                href="#contact"
                className="h-12 px-7 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>

      </section>

      {/* =========================================================================
          SECTION J: FOOTER & INSTITUTIONAL RESOURCES
      ========================================================================== */}
      <footer id="contact" className="relative z-10 bg-white border-t border-slate-200 pt-16 pb-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-100">
            
            {/* Col 1: Brand & Description */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  M
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-black tracking-tight text-slate-900 leading-none">
                    InnovatMind
                  </span>
                  <span className="text-xs font-semibold text-slate-400 -mt-0.5">
                    School OS
                  </span>
                </div>
              </Link>
              <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed">
                Empowering schools, teachers, and students through modern management software and future-ready coding, AI, and robotics curriculum.
              </p>
              <div className="text-xs text-slate-600 space-y-1 font-semibold">
                <div>HQ: New Delhi, India • Serving Schools Pan-India</div>
                <div>Support: <a href="mailto:support@innovatmind.com" className="text-blue-600 hover:underline">support@innovatmind.com</a></div>
              </div>
            </div>

            {/* Col 2: Platform Links */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Platform
              </span>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link href="#features" className="hover:text-blue-600">School ERP</Link></li>
                <li><Link href="#coding-robotics" className="hover:text-blue-600">Student Learning Portal</Link></li>
                <li><Link href="#gamified" className="hover:text-blue-600">Robotics Curriculum</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600">Institutional Pricing</Link></li>
              </ul>
            </div>

            {/* Col 3: Stakeholder Portals */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Portals
              </span>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><Link href="/login?redirect=/school" className="hover:text-blue-600">School Admin Portal</Link></li>
                <li><Link href="/login?redirect=/teacher" className="hover:text-blue-600">Teacher Workspace</Link></li>
                <li><Link href="/login?redirect=/student" className="hover:text-blue-600">Student Cadet Portal</Link></li>
                <li><Link href="/login?redirect=/admin" className="hover:text-blue-600">Super Admin Gateway</Link></li>
              </ul>
            </div>

            {/* Col 4: Institutional Compliance */}
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Security & Trust
              </span>
              <ul className="space-y-2 text-xs text-slate-600 font-medium">
                <li><span className="text-slate-500">FERPA & COPPA Compliant</span></li>
                <li><span className="text-slate-500">Encrypted Role-Based Storage</span></li>
                <li><span className="text-slate-500">Institutional Data Isolation</span></li>
                <li><span className="text-slate-500">Audit Trail Verification</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <div>
              © {new Date().getFullYear()} InnovatMind School OS. All rights reserved.
            </div>
            <div className="flex items-center gap-6 font-semibold">
              <Link href="/login" className="hover:text-blue-600">Privacy Policy</Link>
              <Link href="/login" className="hover:text-blue-600">Terms of Service</Link>
              <Link href="/login" className="hover:text-blue-600">Security Disclosures</Link>
            </div>
          </div>

        </div>
      </footer>

      {/* =========================================================================
          WALKTHROUGH MODAL
      ========================================================================== */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Explore InnovatMind School OS</h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-950 p-6 text-white text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500 flex items-center justify-center mx-auto text-blue-400">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
                <h4 className="font-black text-lg">Interactive Platform Tour</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Experience seamless school administration and student-led robotics learning in real time. Choose a role to dive straight into a live dashboard:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Link
                    href="/login?redirect=/school"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                  >
                    View School Admin
                  </Link>
                  <Link
                    href="/login?redirect=/student"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    View Student Portal
                  </Link>
                  <Link
                    href="/login?redirect=/admin"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                  >
                    View Super Admin
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Demo Portal Selection Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
            <button
              onClick={() => setDemoModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Explore InnovatMind Live Demo</h3>
                <p className="text-xs text-slate-500 font-semibold">Test all platform capabilities with pre-populated dummy demo fixtures — no sign up required</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {/* Option 1: School Admin Demo */}
              <button
                onClick={() => handleLaunchDemo('SCHOOL_ADMIN')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-indigo-500/80 hover:bg-indigo-50/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200 font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 flex items-center gap-2">
                      <span>School Admin Portal</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Principal View</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Admissions, real-time attendance, fee ledgers, timetable clash detector, and STEM lab analytics with sample school data.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </button>

              {/* Option 2: Student Learning Portal */}
              <button
                onClick={() => handleLaunchDemo('STUDENT')}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/80 hover:bg-emerald-50/40 transition-all flex items-center justify-between group cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200 font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-emerald-700 flex items-center gap-2">
                      <span>Student Learning Portal</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Cadet View</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      3D coding game, Mars rover simulator, gamified XP, quest battles, and floating STEM islands.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0 ml-3" />
              </button>

              </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Want to setup your school&apos;s real workspace?</span>
              <Link
                href="/register"
                onClick={() => setDemoModalOpen(false)}
                className="font-black text-indigo-600 hover:text-indigo-800"
              >
                Register Real School →
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
