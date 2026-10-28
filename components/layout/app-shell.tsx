"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { TenantSwitcher } from './tenant-switcher';
import { RoleSwitcher } from './role-switcher';
import { UserMenu } from './user-menu';
import { CommandPalette } from './command-palette';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  GraduationCap,
  Calendar,
  BookOpen,
  Building2,
  Plus,
  Cpu,
  Trophy,
  Settings,
  Bell,
  Sparkles,
  Menu,
  X,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  BarChart3,
  Package,
  MapPin,
  Search,
  Sliders,
  Zap,
  HeartHandshake,
  Award,
  Sun,
  Moon,
  HelpCircle,
  Grid,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Home,
  Gamepad2,
  FolderKanban,
  User,
  Terminal,
  Code2,
  ShieldAlert
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

function AppShellContent({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { role, activeSchool, currentUser, schools, setActiveSchool } = useAuth();
  const isStudentPortal = pathname.startsWith('/student');
  const isSuperAdminView = !isStudentPortal && (role === 'SUPER_ADMIN' || pathname.startsWith('/admin'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Security Route Guard & Multi-Tenant Access Verification
  useEffect(() => {
    if (!currentUser) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (currentUser.status === 'SUSPENDED' || currentUser.status === 'INACTIVE') {
      router.replace('/login?error=account_suspended');
      return;
    }

    // Role boundary checks
    if (pathname.startsWith('/admin')) {
      if (currentUser.role !== 'SUPER_ADMIN') {
        setSecurityNotice('Restricted Area: Super Admin privileges are required to access Central HQ.');
        if (currentUser.role === 'STUDENT') {
          router.replace('/student?error=unauthorized_admin');
        } else {
          router.replace('/school?error=unauthorized_admin');
        }
      }
    } else if (pathname.startsWith('/school')) {
      if (currentUser.role === 'STUDENT') {
        setSecurityNotice('Access Denied: Student accounts cannot access institutional administrative systems.');
        router.replace('/student?error=unauthorized_school');
      } else if (currentUser.role === 'SCHOOL_ADMIN' && currentUser.schoolId && activeSchool.id !== currentUser.schoolId) {
        // Enforce strict multi-tenant boundary: revert to authorized school
        const authorizedSchool = schools.find(s => s.id === currentUser.schoolId);
        if (authorizedSchool) {
          setActiveSchool(authorizedSchool, true);
        }
      }
    } else if (pathname.startsWith('/student')) {
      if (currentUser.role !== 'STUDENT' && currentUser.role !== 'SUPER_ADMIN') {
        setSecurityNotice('Restricted Area: The cadet portal is reserved for student accounts.');
        router.replace('/school?error=unauthorized_student');
      }
    }
  }, [pathname, currentUser, activeSchool.id, schools, setActiveSchool, router]);

  // Exact active state checker to prevent overlapping active tabs
  const isItemActive = (href: string) => {
    // 1. Root dashboards MUST be exact matches only
    if (href === '/admin') {
      return pathname === '/admin';
    }
    if (href === '/school') {
      return pathname === '/school';
    }
    if (href === '/student') {
      return pathname === '/student' && !searchParams.get('tab');
    }
    if (href === '/teacher') {
      return pathname === '/teacher';
    }
    if (href === '/parent') {
      return pathname === '/parent';
    }

    // 2. Prevent parent section from highlighting when on a sub-page that has its own menu item
    // e.g. /admin/schools/new has its own dedicated "Add School" menu item
    if (href === '/admin/schools' && pathname === '/admin/schools/new') {
      return false;
    }

    const [basePath, queryString] = href.split('?');

    // If current pathname doesn't match this item's base path
    if (pathname !== basePath && !pathname.startsWith(basePath + '/')) {
      return false;
    }

    // If the menu item specifies query parameters (e.g. ?tab=admissions, ?tab=attendance, ?view=parents)
    if (queryString) {
      const itemParams = new URLSearchParams(queryString);
      return Array.from(itemParams.entries()).every(
        ([key, val]) => searchParams.get(key) === val
      );
    }

    // If this menu item has NO query parameters (e.g. /school/students):
    // It should ONLY be active if NO sub-tab parameter is present in current URL
    if (pathname === '/school/students') {
      const currentTab = searchParams.get('tab');
      const currentView = searchParams.get('view');
      if (currentTab === 'admissions' || currentTab === 'attendance' || currentView === 'parents') {
        return false;
      }
      return true;
    }

    return pathname === basePath || pathname.startsWith(basePath + '/');
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic Navigation Items based on active persona / route
  const getNavItems = () => {
    if (role === 'SUPER_ADMIN' || pathname.startsWith('/admin')) {
      return [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'School Management', href: '/admin/schools', icon: Building2 },
        { label: 'Add School', href: '/admin/schools/new', icon: Plus },
        { label: 'Pricing Engine', href: '/admin/pricing', icon: CreditCard },
        { label: 'InnovatMind Trainers', href: '/admin/trainers', icon: Users },
        { label: 'Course Catalog', href: '/admin/courses', icon: BookOpen },
        { label: 'Platform Settings', href: '/admin#settings', icon: Settings },
      ];
    }

    if (role === 'STUDENT' || pathname.startsWith('/student')) {
      return [
        { label: 'Home', href: '/student', icon: Home },
        { label: 'My Learning', href: '/student?tab=learning', icon: BookOpen },
        { label: 'Coding Lab', href: '/student?tab=coding', icon: Terminal },
        { label: 'Robotics Lab', href: '/student?tab=robotics', icon: Cpu },
        { label: 'AI Lab', href: '/student?tab=ai', icon: Sparkles },
        { label: 'Quizzes & Games', href: '/student?tab=games', icon: Gamepad2 },
        { label: 'Projects', href: '/student?tab=projects', icon: FolderKanban },
        { label: 'Achievements', href: '/student?tab=achievements', icon: Trophy },
        { label: 'Leaderboard', href: '/student?tab=leaderboard', icon: BarChart3 },
        { label: 'My Profile', href: '/student?tab=profile', icon: User },
      ];
    }

    if (role === 'TEACHER' || pathname.startsWith('/teacher')) {
      return [
        { label: 'Teacher Hub', href: '/teacher', icon: LayoutDashboard },
        { label: 'Exam Marks Entry', href: '/school/exams?tab=marks', icon: Award, badge: 'Live' },
        { label: 'Class Attendance', href: '/teacher#attendance', icon: Calendar },
        { label: 'Assignments', href: '/teacher#assignments', icon: BookOpen },
        { label: 'Gradebook', href: '/teacher#gradebook', icon: GraduationCap },
      ];
    }

    if (role === 'PARENT' || pathname.startsWith('/parent')) {
      return [
        { label: 'Child Overview', href: '/parent', icon: LayoutDashboard },
        { label: 'Exam Marksheets', href: '/school/exams?tab=reports', icon: Award },
        { label: 'Attendance Record', href: '/parent#attendance', icon: Calendar },
        { label: 'Fee Payments', href: '/parent#fees', icon: CreditCard },
        { label: 'Report Cards', href: '/parent#reports', icon: GraduationCap },
      ];
    }

    // Default: SCHOOL_ADMIN - Structure matches the 3D reference design exactly
    return [
      { label: 'Dashboard', href: '/school', icon: LayoutDashboard },
      { label: 'Admission', href: '/school/students?tab=admissions', icon: Users, hasSub: true },
      { label: 'Students', href: '/school/students', icon: GraduationCap, hasSub: true },
      { label: 'Parents', href: '/school/parents', icon: Users, hasSub: true },
      { label: 'Staff & HR', href: '/school/staff', icon: FileSpreadsheet, hasSub: true },
      { label: 'Attendance', href: '/school/students?tab=attendance', icon: Calendar, hasSub: true },
      { label: 'Fees & Finance', href: '/school/fees', icon: CreditCard, hasSub: true },
      { label: 'Academics', href: '/school/lecture-plan', icon: BookOpen, hasSub: true },
      { label: 'Timetable', href: '/school/timetable', icon: Calendar },
      { label: 'Exams & Results', href: '/school/exams', icon: Award, badge: 'New' },
      { label: 'Courses (InnovatMind)', href: '/school/courses', icon: Sparkles, badge: 'Live' },
      { label: 'Communication', href: '/school/notices', icon: MessageSquare, hasSub: true },
      { label: 'Transport', href: '/school/transport', icon: MapPin },
      { label: 'Inventory & Assets', href: '/school/resources', icon: Package, hasSub: true },
      { label: 'Reports & Analytics', href: '/school/analytics', icon: BarChart3, hasSub: true },
      { label: 'Settings', href: '/school/settings', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F4F7FB] text-slate-900 flex font-sans">
      {/* Universal Omnibar Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* =========================================================================
          LEFT SIDEBAR: Sleek Dark Navy Glass matching the reference design (Fixed/Stationary)
         ========================================================================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B0F19] text-slate-300 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 md:sticky md:top-0 md:translate-x-0 shrink-0 select-none h-screen ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/70">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                  InnovatMind
                </span>
                <span className="text-[11px] font-semibold text-slate-400 -mt-0.5">
                  School OS
                </span>
              </div>
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = isItemActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "nav-pill-active text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                      }`}
                    />
                    <span className="tracking-tight">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.hasSub && (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Card: Student Mascot or STEM Hub */}
          <div className="p-3.5 border-t border-slate-800/80">
            {(role === 'STUDENT' || pathname.startsWith('/student')) ? (
              <div className="relative rounded-2xl overflow-hidden p-3.5 bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-slate-900 border border-indigo-500/30 shadow-lg">
                <div className="relative z-10 flex flex-col gap-1.5">
                  <div className="inline-flex px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30 w-fit">
                    Let&apos;s Learn Build
                  </div>
                  <span className="text-xs font-black text-white leading-tight">
                    Create &amp; Grow Together!
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 p-0.5 shadow-sm">
                      <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-xs">
                        🤖
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-300">
                      AI Mentor Online
                    </span>
                  </div>
                </div>
                <div className="absolute -right-2 -bottom-2 w-16 h-16 opacity-30 pointer-events-none">
                  <img
                    src="/images/robot-mentor.png"
                    alt="Robot Mentor"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <Link
                href="/student"
                className="relative block rounded-2xl overflow-hidden p-3.5 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-500/30 group hover:border-indigo-400/60 transition-all shadow-lg"
              >
                <div className="relative z-10 space-y-2">
                  <span className="text-[11px] font-extrabold text-white leading-tight block drop-shadow-sm">
                    Empowering Schools with AI, Robotics &amp; Future-Ready Education
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-300 group-hover:translate-x-1 transition-transform">
                    <span>Explore Student World</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN VIEWPORT & TOP HEADER
         ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs shrink-0">
          
          {/* Left: Mobile Toggle & Universal Search Input */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Omnibar Search Trigger matching image: "Search students, staff, fees, classes..." Ctrl K */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/60 transition-all text-xs group"
            >
              <div className="flex items-center gap-2.5">
                <Search className={`w-3.5 h-3.5 transition-colors ${
                  isStudentPortal ? 'text-cyan-500' : isSuperAdminView ? 'text-purple-500' : 'text-slate-400 group-hover:text-indigo-600'
                }`} />
                <span className="text-slate-500 font-medium truncate">
                  {isStudentPortal
                    ? 'Search courses, coding lab, robotics, AI, quizzes...'
                    : isSuperAdminView
                    ? 'Search schools, pricing rules, trainers, courses...'
                    : 'Search students, staff, fees, classes...'}
                </span>
              </div>
              <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-mono text-[10px] font-bold shadow-2xs">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right: Controls & User Profile Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Notification Bell with Badge */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                3
              </span>
            </button>

            {/* Help Question Circle */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Help & Shortcuts (Ctrl+K)"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* App Grid Switcher - Strictly role-scoped */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={
                isStudentPortal
                  ? "Student Learning Apps & Labs (Ctrl+K)"
                  : isSuperAdminView
                  ? "Super Admin Platform Apps (Ctrl+K)"
                  : "School Management Apps (Ctrl+K)"
              }
              aria-label="Apps Menu"
            >
              <Grid className="w-4 h-4" />
            </button>

            {/* Tenant Switcher & Role Switcher for Super Admin */}
            {isSuperAdminView && (
              <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200">
                <TenantSwitcher />
                <RoleSwitcher />
              </div>
            )}

            {/* School Profile Badge (Only shown in School Tenant view, NOT in Central Super Admin HQ, NOT in Student Portal) */}
            {!isSuperAdminView && !isStudentPortal && (
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-6 h-6 rounded-lg bg-indigo-600/10 text-indigo-700 font-extrabold text-[11px] flex items-center justify-center">
                  {activeSchool?.name?.charAt(0) || 'S'}
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-bold text-slate-800 truncate max-w-[150px]">
                    {activeSchool?.name}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {activeSchool?.code}
                  </span>
                </div>
              </div>
            )}

            {/* In Student Portal, display Student Cadet indicator */}
            {isStudentPortal && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-emerald-800">
                  Student Portal • {currentUser?.gradeName || 'Grade 6'}{currentUser?.sectionName ? ` • ${currentUser.sectionName}` : ''}
                </span>
              </div>
            )}

            {/* User Profile Dropdown Menu */}
            <div className="flex items-center pl-2 border-l border-slate-200">
              <UserMenu />
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-4">
          {(searchParams.get('error') || securityNotice) && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 shadow-sm animate-fade-in">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs font-semibold">
                  {securityNotice || (
                    <>
                      {searchParams.get('error') === 'unauthorized_admin' && 'Access Restricted: You attempted to access Super Admin Central HQ without proper authorization. Safely routed to your workspace.'}
                      {searchParams.get('error') === 'unauthorized_school' && 'Access Restricted: Student accounts do not have administrative clearance for School Management. Safely routed to Student Portal.'}
                      {searchParams.get('error') === 'unauthorized' && 'Access Restricted: You do not have permissions for that resource.'}
                    </>
                  )}
                </div>
              </div>
              <button 
                onClick={() => {
                  setSecurityNotice(null);
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('error');
                    router.replace(url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
                  }
                }}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0F19]" />}>
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}

