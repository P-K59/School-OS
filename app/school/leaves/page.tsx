"use client";

import React from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { LeaveManagement } from '@/components/school/leave-management';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LeavesPage() {
  return (
    <AppShell>
      <div className="space-y-4 pb-12">
        <div className="flex items-center gap-2">
          <Link
            href="/school"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Daily Overview</span>
          </Link>
        </div>
        <LeaveManagement />
      </div>
    </AppShell>
  );
}
