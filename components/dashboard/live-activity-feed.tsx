"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Receipt, UserPlus, Sparkles, BellRing, Clock } from 'lucide-react';

export function LiveActivityFeed() {
  const { activities, activeSchool } = useAuth();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TEACHER':
        return { icon: Activity, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'FEE':
        return { icon: Receipt, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'STEM':
        return { icon: Sparkles, color: 'text-cyan-700 bg-cyan-50 border-cyan-200' };
      case 'ADMISSION':
        return { icon: UserPlus, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      default:
        return { icon: BellRing, color: 'text-purple-700 bg-purple-50 border-purple-200' };
    }
  };

  return (
    <Card className="light-glass card-hover text-slate-900 flex flex-col justify-between">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Live Institutional Audit Ledger
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">Tenant Scoped: {activeSchool.name}</span>
          </div>
        </div>
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
        </span>
      </CardHeader>

      <CardContent className="p-6 space-y-3.5">
        {activities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-medium">
            No audit records logged yet for this school.
          </div>
        ) : (
          activities.map((evt) => {
            const { icon: Icon, color } = getCategoryIcon(evt.category);
            return (
              <div key={evt.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3.5 hover:border-slate-300 transition-colors shadow-xs">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-xs ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-900 truncate">{evt.title}</div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {evt.time}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{evt.detail}</div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
