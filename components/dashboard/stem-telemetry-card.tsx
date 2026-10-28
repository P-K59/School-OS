"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Trophy, Flame } from 'lucide-react';

export function StemTelemetryCard() {
  const { stemTelemetry, activeSchool } = useAuth();

  return (
    <Card className="light-glass-glow card-hover text-slate-900 flex flex-col justify-between border-indigo-200">
      <CardHeader className="p-6 pb-4 border-b border-indigo-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              InnovatMind STEM & AI Pulse
            </CardTitle>
            <span className="text-xs text-indigo-700 font-semibold">{activeSchool.name} Lab Stream</span>
          </div>
        </div>
        <Link href="/student">
          <Badge variant="cyan" className="cursor-pointer hover:bg-cyan-100">
            Open Lab World →
          </Badge>
        </Link>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* STEM Telemetry Numbers */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-center shadow-xs">
            <div className="text-2xl font-extrabold text-indigo-700">{stemTelemetry.activeCoders}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Active Coders</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-center shadow-xs">
            <div className="text-2xl font-extrabold text-purple-700">{stemTelemetry.virtualRovers}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Virtual Rovers</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-center shadow-xs">
            <div className="text-2xl font-extrabold text-cyan-700">{stemTelemetry.aiHintsDelivered}</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">AI Tutor Hints</div>
          </div>
        </div>

        {/* Top Cadet Highlight */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950">Top Cadet: {stemTelemetry.topCadetName} ({stemTelemetry.topCadetClass})</div>
              <div className="text-[11px] text-amber-800 font-medium flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-0.5 font-bold"><Flame className="w-3.5 h-3.5 text-amber-600" /> {stemTelemetry.topCadetStreak}-day streak</span>
                <span>•</span>
                <span className="font-bold text-indigo-700">{stemTelemetry.topCadetXp} XP ({stemTelemetry.topCadetMission})</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
