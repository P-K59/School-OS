"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { isRealSchool } from '@/lib/db/mock-data';
import { School as SchoolIcon, ChevronDown, Check, Lock, ShieldCheck } from 'lucide-react';

export function TenantSwitcher() {
  const { activeSchool, setActiveSchool, schools, role } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isSuperAdmin = mounted && role === 'SUPER_ADMIN';
  const realSchools = React.useMemo(() => schools.filter(isRealSchool), [schools]);
  const currentSchool = isRealSchool(activeSchool) ? activeSchool : (realSchools[0] || activeSchool);

  // For non-Super Admins (School Admin/Principal, Teachers, Students, Parents) or during initial hydration:
  // Show a strictly LOCKED, read-only tenant badge.
  if (!mounted || !isSuperAdmin) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 shadow-xs select-none">
        <div className="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center font-extrabold text-[11px]">
          {currentSchool.name.charAt(0)}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-slate-900 truncate max-w-[150px]">
            {currentSchool.name}
          </span>
          <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
            <Lock className="w-2.5 h-2.5 text-slate-400" />
            {currentSchool.code} (Locked)
          </span>
        </div>
      </div>
    );
  }

  // Only SUPER_ADMIN (InnovatMind Central Team) can switch between schools:
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-900 hover:bg-purple-100/80 transition-all shadow-xs"
      >
        <div className="w-6 h-6 rounded-lg bg-purple-200 border border-purple-300 text-purple-900 flex items-center justify-center font-extrabold text-[11px]">
          {currentSchool.name.charAt(0)}
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold text-purple-950 truncate max-w-[150px]">
            {currentSchool.name}
          </span>
          <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Super Admin View
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-purple-500 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-purple-200 bg-white p-2 shadow-xl z-50 animate-slide-up">
            <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Super Admin Multi-Tenant Switcher
            </div>
            <div className="space-y-1">
              {realSchools.map((school) => {
                const isSelected = school.id === currentSchool.id;
                return (
                  <button
                    key={school.id}
                    onClick={() => {
                      setActiveSchool(school, true);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-purple-50 text-purple-950 font-bold border border-purple-200"
                        : "hover:bg-slate-50 text-slate-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                        {school.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-[160px]">
                          {school.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {school.city}, {school.state}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-purple-600" />}
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
