"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/lib/types';
import { Shield, Building2, GraduationCap, Cpu, User, Users, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function RoleSwitcher() {
  const { role, setRole } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  const roleConfigs: Record<UserRole, { label: string; icon: React.ReactNode; color: string; path: string }> = {
    SUPER_ADMIN: {
      label: "Super Admin (InnovatMind)",
      icon: <Shield className="w-3.5 h-3.5 text-purple-600" />,
      color: "border-purple-200 bg-purple-50 text-purple-900 shadow-xs",
      path: "/admin",
    },
    SCHOOL_ADMIN: {
      label: "School Admin (Principal)",
      icon: <Building2 className="w-3.5 h-3.5 text-indigo-600" />,
      color: "border-indigo-200 bg-indigo-50 text-indigo-900 shadow-xs",
      path: "/school",
    },
    TEACHER: {
      label: "Teacher / Faculty",
      icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" />,
      color: "border-blue-200 bg-blue-50 text-blue-900 shadow-xs",
      path: "/teacher",
    },
    INNOVATMIND_TRAINER: {
      label: "InnovatMind STEM Trainer",
      icon: <Cpu className="w-3.5 h-3.5 text-cyan-700" />,
      color: "border-cyan-200 bg-cyan-50 text-cyan-900 shadow-xs",
      path: "/teacher",
    },
    STUDENT: {
      label: "Student (Learning World)",
      icon: <User className="w-3.5 h-3.5 text-emerald-700" />,
      color: "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-xs",
      path: "/student",
    },
    PARENT: {
      label: "Parent Portal",
      icon: <Users className="w-3.5 h-3.5 text-amber-700" />,
      color: "border-amber-200 bg-amber-50 text-amber-900 shadow-xs",
      path: "/parent",
    },
  };

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    setIsOpen(false);
    const targetPath = roleConfigs[newRole].path;
    router.push(targetPath);
  };

  const currentConfig = roleConfigs[role];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:opacity-95 ${currentConfig.color}`}
      >
        {currentConfig.icon}
        <span>{currentConfig.label}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-slide-up">
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Switch Persona & Portal
            </div>
            <div className="space-y-1">
              {(Object.keys(roleConfigs) as UserRole[]).map((r) => {
                const config = roleConfigs[r];
                const isSelected = r === role;
                return (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-slate-100 font-bold text-slate-900"
                        : "text-slate-600 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {config.icon}
                      <span>{config.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
