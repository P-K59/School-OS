"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, ShieldCheck, Monitor, Cpu } from 'lucide-react';

export function TimetableFacilityCard() {
  const { facilities, activeSchool } = useAuth();

  return (
    <Card className="light-glass card-hover text-slate-900 flex flex-col justify-between">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Facility & Lab Occupancy Matrix
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">{activeSchool.name} • Period 2 Active</span>
          </div>
        </div>
        <Badge variant="success" className="gap-1 flex items-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>0 Conflicts Verified</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-3">
        {facilities.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-medium">
            No lab sessions currently scheduled for this period.
          </div>
        ) : (
          facilities.map((item) => (
            <div key={item.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-cyan-700 shadow-xs">
                  <Monitor className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.lab}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {item.class} • <span className="text-indigo-700 font-bold">{item.topic}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {item.status}
                </span>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">{item.teacher}</div>
              </div>
            </div>
          ))
        )}

        <div className="pt-2">
          <a
            href="/school/timetable"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors"
          >
            <span>Manage Academic Schedule & Lab Allocations</span>
            <span className="text-indigo-600 font-mono">→</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
