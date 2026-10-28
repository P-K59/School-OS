"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Radio,
  Cpu,
  Layers,
  ShieldCheck,
  Lock
} from 'lucide-react';

export function MissionControlHeader() {
  const { activeSchool } = useAuth();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl light-glass-glow p-6 sm:p-7 mb-6 border border-indigo-100 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
            <span className="px-3 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-xs">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              LIVE TELEMETRY ACTIVE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              TENANT: {activeSchool.code}
            </span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
              {time || '10:45:00 AM'} IST
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span>{activeSchool.name}</span>
            <Badge variant="cyan" className="text-xs font-bold">
              {activeSchool.schoolType} Board
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-medium">
            Campus Operations & Performance Dashboard • Code: <span className="font-mono font-bold text-slate-800">{activeSchool.code}</span>
          </p>
        </div>

        {/* Quick Command Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/school/students">
            <Button size="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 font-bold">
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </Button>
          </Link>
          <Link href="/student">
            <Button size="default" variant="glow" className="gap-2 font-bold shadow-md shadow-indigo-200">
              <Cpu className="w-4 h-4" />
              <span>Launch STEM Lab</span>
            </Button>
          </Link>
          <Link href="/school/staff">
            <Button size="default" variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold">
              <Layers className="w-4 h-4" />
              <span>Teacher Logs</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
