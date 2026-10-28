"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';
import {
  User,
  LogOut,
  ChevronDown,
  Shield,
  Building2,
  GraduationCap,
  Sparkles,
  Users,
  Cpu,
  CheckCircle2,
  Lock,
  BookOpen,
  Settings,
  Loader2
} from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, role, activeSchool, logout, loginAsRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Authoritative role evaluation: prioritize currentUser.role from verified session
  const effectiveRole: UserRole = currentUser?.role || (
    pathname.startsWith('/student') ? 'STUDENT' :
    pathname.startsWith('/admin') ? 'SUPER_ADMIN' :
    role
  );

  const isStudentRole = effectiveRole === 'STUDENT';
  const isSchoolAdminRole = effectiveRole === 'SCHOOL_ADMIN';
  const isSuperAdminRole = effectiveRole === 'SUPER_ADMIN';

  // Handle outside click and Escape key listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Robust Logout Handler with Invalidation & Redirect
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      logout();
      setIsOpen(false);
      // Replace URL to prevent browser history back-navigation to protected state
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setIsLoggingOut(false);
    }
  };

  // Super Admin Persona Preview Switcher
  const handleRoleSwitch = (newRole: UserRole, targetPath: string) => {
    loginAsRole(newRole, activeSchool.id);
    setIsOpen(false);
    router.push(targetPath);
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield };
      case 'SCHOOL_ADMIN':
        return { label: 'Principal & Director', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Building2 };
      case 'TEACHER':
        return { label: 'Faculty', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: GraduationCap };
      case 'INNOVATMIND_TRAINER':
        return { label: 'STEM Trainer', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Cpu };
      case 'STUDENT':
        return { label: 'Cadet Student', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Sparkles };
      case 'PARENT':
        return { label: 'Guardian', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Users };
      default:
        return { label: r, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: User };
    }
  };

  const roleMeta = getRoleBadge(effectiveRole);

  const displayName = currentUser?.displayName
    || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim()
    || (isStudentRole ? 'Student Cadet' : isSuperAdminRole ? 'Super Admin' : 'Principal');

  const displayEmail = currentUser?.email || (
    isSuperAdminRole ? 'superadmin@innovatmind.com' :
    isStudentRole ? 'cadet@innovatmind.com' :
    'admin@innovatmind.com'
  );

  const displaySubtitle = isStudentRole
    ? `${currentUser?.gradeName || 'Grade 6'}${currentUser?.sectionName ? ` • ${currentUser.sectionName}` : ''}`
    : isSuperAdminRole
    ? 'Central Platform HQ'
    : (currentUser?.designation || activeSchool?.name || 'Institutional Management');

  const initials = (currentUser?.firstName && currentUser?.lastName)
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  const superAdminRoleList: { role: UserRole; title: string; path: string; icon: any }[] = [
    { role: 'SUPER_ADMIN', title: 'InnovatMind Central HQ', path: '/admin', icon: Shield },
    { role: 'SCHOOL_ADMIN', title: 'School Admin / Principal', path: '/school', icon: Building2 },
    { role: 'STUDENT', title: 'Student Learning World', path: '/student', icon: Sparkles },
    { role: 'TEACHER', title: 'Faculty / Teacher Hub', path: '/teacher', icon: GraduationCap },
    { role: 'PARENT', title: 'Parent & Guardian Portal', path: '/parent', icon: Users },
  ];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User profile and account menu"
        className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      >
        <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0 ${
          isStudentRole
            ? 'bg-gradient-to-tr from-emerald-500 to-teal-600'
            : isSuperAdminRole
            ? 'bg-gradient-to-tr from-purple-600 to-indigo-700'
            : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
        }`}>
          {initials}
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-black text-slate-800 leading-tight truncate max-w-[130px]">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[130px]">
            {displaySubtitle}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {/* Profile Dropdown Panel */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 sm:max-w-sm rounded-2xl border border-slate-200/90 bg-white/98 backdrop-blur-md p-3.5 shadow-2xl z-50 animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto focus:outline-none"
        >
          {/* ===============================================================
              1. STUDENT PROFILE MENU
             =============================================================== */}
          {isStudentRole && (
            <div className="space-y-3">
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-2.5 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-slate-50 rounded-xl border border-emerald-100/80">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700 truncate">
                    {currentUser?.gradeName || 'Grade 6'}{currentUser?.sectionName ? ` • ${currentUser.sectionName}` : ''}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Cadet #{currentUser?.admissionNumber || 'STU-001'}
                  </div>
                </div>
              </div>

              {/* Assigned School (Strictly Read-Only Information) */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Enrolled School (Read-Only)
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {activeSchool?.name || 'Assigned School'}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200/70 text-[9px] font-bold font-mono text-slate-600 shrink-0">
                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                  {activeSchool?.code || 'CBSE'}
                </span>
              </div>

              {/* Authorized Student Menu Actions */}
              <div className="space-y-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/student?tab=profile');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors text-left cursor-pointer focus:outline-none focus:bg-emerald-50"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                  <span>My Profile &amp; Cadet ID</span>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/student?tab=learning');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 transition-colors text-left cursor-pointer focus:outline-none focus:bg-emerald-50"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>My Learning Track</span>
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="border-t border-slate-100 my-1" />

              {/* Full-Width Sign Out Action */}
              <button
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ===============================================================
              2. SCHOOL ADMIN / PRINCIPAL PROFILE MENU
             =============================================================== */}
          {isSchoolAdminRole && (
            <div className="space-y-3">
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {displayEmail}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Principal &amp; Director
                    </span>
                  </div>
                </div>
              </div>

              {/* Currently Assigned School (Read-Only Context) */}
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Assigned Institution
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {activeSchool?.name}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-indigo-100/70 text-[9px] font-bold font-mono text-indigo-700 shrink-0">
                  {activeSchool?.schoolType || 'CBSE'}
                </span>
              </div>

              {/* School Admin Navigation Actions */}
              <div className="space-y-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/school');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-indigo-50"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Institutional Dashboard</span>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/school/staff');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-indigo-50"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Faculty &amp; Staff Roster</span>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/school/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-indigo-50"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>School Settings</span>
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="border-t border-slate-100 my-1" />

              {/* Full-Width Sign Out Action */}
              <button
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ===============================================================
              3. SUPER ADMIN (CENTRAL HQ) PROFILE MENU
             =============================================================== */}
          {isSuperAdminRole && (
            <div className="space-y-3">
              {/* Profile Header */}
              <div className="flex items-center gap-3 p-2.5 bg-purple-50/60 rounded-xl border border-purple-100">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-purple-700 truncate font-mono">
                    {displayEmail}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                      Super Admin
                    </span>
                    <span className="text-[10px] text-purple-600 font-medium">
                      • Central HQ
                    </span>
                  </div>
                </div>
              </div>

              {/* Platform Management Navigation Actions */}
              <div className="space-y-1">
                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-purple-50"
                >
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Central HQ Dashboard</span>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin/schools');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-purple-50"
                >
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span>Tenant Schools Directory</span>
                </button>

                <button
                  role="menuitem"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/admin/pricing');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50/60 transition-colors text-left cursor-pointer focus:outline-none focus:bg-purple-50"
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>Central Pricing Engine</span>
                </button>
              </div>

              {/* Persona Navigation Workflow (Authorized Super Admin Testing Only) */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-purple-600" />
                  <span>Persona Preview (HQ Only)</span>
                </div>
                <div className="space-y-0.5">
                  {superAdminRoleList.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = role === item.role;
                    return (
                      <button
                        role="menuitem"
                        key={item.role}
                        onClick={() => handleRoleSwitch(item.role, item.path)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-purple-50 text-purple-800 font-bold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.title}</span>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtle Divider */}
              <div className="border-t border-slate-100 my-1" />

              {/* Full-Width Sign Out Action */}
              <button
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* ===============================================================
              4. FALLBACK (TEACHER / PARENT / OTHER ROLES)
             =============================================================== */}
          {!isStudentRole && !isSchoolAdminRole && !isSuperAdminRole && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {displayName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate font-mono">
                    {displayEmail}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${roleMeta.color}`}>
                      {roleMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Institution
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate block">
                      {activeSchool?.name}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-[9px] font-bold font-mono text-slate-600 shrink-0">
                  {activeSchool?.code}
                </span>
              </div>

              <div className="border-t border-slate-100 my-1" />

              <button
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                    <span>Signing Out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
