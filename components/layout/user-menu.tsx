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
  ExternalLink
} from 'lucide-react';

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, role, activeSchool, logout, loginAsRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isStudent = pathname.startsWith('/student');
  const isSuperAdmin = !isStudent && (role === 'SUPER_ADMIN' || pathname.startsWith('/admin'));

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
  };

  const handleRoleSwitch = (newRole: UserRole, targetPath: string) => {
    loginAsRole(newRole, activeSchool.id);
    setIsOpen(false);
    router.push(targetPath);
  };

  const getRoleConfig = (r: UserRole) => {
    switch (r) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield };
      case 'SCHOOL_ADMIN':
        return { label: 'Principal', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Building2 };
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

  const userRole = currentUser?.role || (isStudent ? 'STUDENT' : isSuperAdmin ? 'SUPER_ADMIN' : role);
  const roleMeta = getRoleConfig(userRole);
  
  const displayName = currentUser?.displayName 
    || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() 
    || (currentUser?.email ? currentUser.email.split('@')[0] : 'User');

  const displayEmail = currentUser?.email || (userRole === 'SUPER_ADMIN' ? 'superadmin@innovatmind.com' : 'user@innovatmind.com');

  const displaySubtitle = currentUser?.role === 'STUDENT'
    ? `${currentUser.gradeName || 'Cadet Student'} • ${currentUser.admissionNumber || 'Grade 6'}`
    : currentUser?.role === 'SUPER_ADMIN'
    ? 'Super Admin • Central HQ'
    : (currentUser?.designation || (currentUser?.schoolName ? `${roleMeta.label} • ${currentUser.schoolName}` : roleMeta.label));

  const initials = (currentUser?.firstName && currentUser?.lastName)
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
    : displayName.substring(0, 2).toUpperCase();

  const roleList: { role: UserRole; title: string; path: string; icon: any }[] = [
    { role: 'SCHOOL_ADMIN', title: 'School Admin / Principal', path: '/school', icon: Building2 },
    { role: 'STUDENT', title: 'Student Learning World', path: '/student', icon: Sparkles },
    { role: 'TEACHER', title: 'Faculty / Teacher', path: '/teacher', icon: GraduationCap },
    { role: 'PARENT', title: 'Parent & Guardian', path: '/parent', icon: Users },
    { role: 'SUPER_ADMIN', title: 'InnovatMind Central Admin', path: '/admin', icon: Shield },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 transition-all shadow-xs"
        aria-label="User profile menu"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-extrabold text-slate-800 leading-tight">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">
            {displaySubtitle}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-3 shadow-xl z-50 animate-fade-in">
          {/* User Details Header */}
          <div className="flex items-center gap-3 p-2 bg-slate-50/80 rounded-xl border border-slate-100 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate">
                {displayName}
              </div>
              <div className="text-[11px] text-slate-500 truncate font-mono">
                {displayEmail}
              </div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${roleMeta.color}`}>
                  {roleMeta.label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  • {isSuperAdmin ? 'Central Operations' : activeSchool.code}
                </span>
              </div>
            </div>
          </div>

          {/* Institution or Central HQ badge */}
          {isSuperAdmin ? (
            <div className="px-2.5 py-1.5 mb-2 text-[11px] text-purple-700 bg-purple-50/80 rounded-lg border border-purple-100 flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-600" />
                InnovatMind Central HQ
              </span>
              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-800 font-mono">
                48 Schools Pan-India
              </span>
            </div>
          ) : (
            <div className="px-2 py-1.5 mb-2 text-[11px] text-slate-600 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
              <span className="font-semibold truncate">{activeSchool.name}</span>
              <span className="text-[9px] font-bold text-indigo-700 font-mono">{activeSchool.schoolType}</span>
            </div>
          )}

          {/* Quick Persona Switching Options - Restricted strictly to SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="py-1">
              <div className="text-[10px] font-extrabold text-purple-700 uppercase tracking-wider px-2 mb-1 flex items-center gap-1">
                <Shield className="w-3 h-3 text-purple-600" />
                <span>Super Admin Persona Preview</span>
              </div>
              <div className="space-y-0.5">
                {roleList.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleRoleSwitch(item.role, item.path)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-purple-50 text-purple-800'
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
          )}

          {/* Actions & Logout */}
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/login');
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              <span>Switch School / Login Screen</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Sign Out from Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
