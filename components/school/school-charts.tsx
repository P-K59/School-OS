"use client";

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Users,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function AttendanceBarChart() {
  const [activeRange, setActiveRange] = useState<'THIS_WEEK' | 'LAST_WEEK'>('THIS_WEEK');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const thisWeekData = [
    { day: 'Mon', present: 432, total: 450, rate: 96, staffPresent: 16, staffTotal: 16 },
    { day: 'Tue', present: 428, total: 450, rate: 95, staffPresent: 15, staffTotal: 16 },
    { day: 'Wed', present: 420, total: 450, rate: 93, staffPresent: 14, staffTotal: 16 },
    { day: 'Thu', present: 435, total: 450, rate: 97, staffPresent: 16, staffTotal: 16 },
    { day: 'Fri', present: 418, total: 450, rate: 93, staffPresent: 14, staffTotal: 16 },
    { day: 'Sat', present: 405, total: 450, rate: 90, staffPresent: 15, staffTotal: 16 },
  ];

  const lastWeekData = [
    { day: 'Mon', present: 410, total: 450, rate: 91, staffPresent: 15, staffTotal: 16 },
    { day: 'Tue', present: 415, total: 450, rate: 92, staffPresent: 15, staffTotal: 16 },
    { day: 'Wed', present: 422, total: 450, rate: 94, staffPresent: 16, staffTotal: 16 },
    { day: 'Thu', present: 425, total: 450, rate: 94, staffPresent: 16, staffTotal: 16 },
    { day: 'Fri', present: 412, total: 450, rate: 92, staffPresent: 14, staffTotal: 16 },
    { day: 'Sat', present: 398, total: 450, rate: 88, staffPresent: 14, staffTotal: 16 },
  ];

  const data = activeRange === 'THIS_WEEK' ? thisWeekData : lastWeekData;
  const avgRate = Math.round(data.reduce((acc, d) => acc + d.rate, 0) / data.length);

  return (
    <div className="card-3d rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Attendance Trends
              </h3>
              <span className="text-xs text-slate-500 font-medium">Daily student turnout</span>
            </div>
          </div>

          {/* Range Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveRange('THIS_WEEK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeRange === 'THIS_WEEK' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setActiveRange('LAST_WEEK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeRange === 'LAST_WEEK' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Last Week
            </button>
          </div>
        </div>

        {/* Metric Highlight */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">{avgRate}%</span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
            <TrendingUp className="w-3.5 h-3.5" /> +2.4% vs last month
          </span>
        </div>

        {/* Interactive Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-2.5 pt-4 px-1">
          {data.map((item, idx) => {
            const isHovered = hoveredDay === idx;
            const barHeight = `${item.rate}%`;

            return (
              <div
                key={item.day}
                className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                onMouseEnter={() => setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none animate-in fade-in">
                    {item.day}: {item.present}/{item.total} ({item.rate}%)
                  </div>
                )}

                {/* Track background + Fill bar */}
                <div className="w-full h-32 bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      item.rate >= 95
                        ? 'bg-emerald-500 group-hover:bg-emerald-600'
                        : item.rate >= 90
                        ? 'bg-indigo-600 group-hover:bg-indigo-700'
                        : 'bg-amber-500 group-hover:bg-amber-600'
                    }`}
                    style={{ height: barHeight }}
                  />
                </div>

                {/* X-axis Day Label */}
                <span className={`text-[11px] font-semibold transition-colors ${
                  isHovered ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>&gt;95% Optimal</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span>90-95% Standard</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>&lt;90% Review</span>
        </span>
      </div>
    </div>
  );
}

export function FeeCollectionsChart() {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  const feeData = [
    { month: 'May', collected: 5.2, target: 6.0, rate: 86 },
    { month: 'Jun', collected: 6.8, target: 7.0, rate: 97 },
    { month: 'Jul', collected: 6.1, target: 6.5, rate: 93 },
    { month: 'Aug', collected: 5.9, target: 6.5, rate: 90 },
    { month: 'Sep', collected: 7.4, target: 7.5, rate: 98 },
    { month: 'Oct', collected: 7.0, target: 8.0, rate: 87 },
  ];

  return (
    <div className="card-3d rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Fee Collection Trajectory
              </h3>
              <span className="text-xs text-slate-500 font-medium">Term 1 Realization</span>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            85.2% Collected
          </span>
        </div>

        {/* Metric Highlight */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="text-3xl font-extrabold tracking-tight text-slate-900">₹38.4 Lakh</div>
            <span className="text-xs text-slate-500 font-medium">
              Collected out of <strong className="text-slate-700">₹45.0 Lakh</strong> Term 1 Total
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-rose-600">₹6.6 Lakh</div>
            <span className="text-[11px] text-slate-400 font-medium">Pending Overdue</span>
          </div>
        </div>

        {/* Visual Double Bar Chart */}
        <div className="h-44 flex items-end justify-between gap-3 pt-4 px-1">
          {feeData.map((item, idx) => {
            const isHovered = hoveredMonth === idx;
            const collectedHeight = `${(item.collected / 8.0) * 100}%`;
            const targetHeight = `${(item.target / 8.0) * 100}%`;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center gap-2 group relative cursor-pointer"
                onMouseEnter={() => setHoveredMonth(idx)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Floating Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap pointer-events-none animate-in fade-in">
                    {item.month}: ₹{item.collected}L / ₹{item.target}L ({item.rate}%)
                  </div>
                )}

                {/* Double Bar Container */}
                <div className="w-full h-32 flex items-end justify-center gap-1">
                  {/* Collected Bar */}
                  <div
                    className="w-1/2 bg-indigo-600 rounded-t-md group-hover:bg-indigo-700 transition-all duration-300"
                    style={{ height: collectedHeight }}
                  />
                  {/* Target Bar (Faded) */}
                  <div
                    className="w-1/2 bg-slate-200 rounded-t-md group-hover:bg-slate-300 transition-all duration-300"
                    style={{ height: targetHeight }}
                  />
                </div>

                {/* X-axis Label */}
                <span className={`text-[11px] font-semibold transition-colors ${
                  isHovered ? 'text-indigo-600 font-bold' : 'text-slate-500'
                }`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
          <span>Realized Collections</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
          <span>Billing Target</span>
        </span>
        <span className="font-semibold text-emerald-600">+11% vs Prev Year</span>
      </div>
    </div>
  );
}

export function ClassSyllabusProgress() {
  const classes = [
    { grade: 'Class 5', completed: 5, total: 6, subject: 'Math: Fractions', pct: 83 },
    { grade: 'Class 6', completed: 6, total: 6, subject: 'Science: Motion', pct: 100 },
    { grade: 'Class 7', completed: 4, total: 6, subject: 'English: Grammar', pct: 67 },
    { grade: 'Class 8', completed: 5, total: 6, subject: 'Coding: Python', pct: 83 },
    { grade: 'Class 9', completed: 4, total: 6, subject: 'Social: History', pct: 67 },
    { grade: 'Class 10', completed: 6, total: 6, subject: 'Physics: Optics', pct: 100 },
  ];

  return (
    <div className="card-3d rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Today's Curriculum Delivery
          </h3>
          <span className="text-xs text-slate-500 font-medium">Class-wise period completion</span>
        </div>
        <span className="text-xs font-bold text-indigo-600">
          30 of 36 Periods Completed (83%)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {classes.map((cls) => (
          <div key={cls.grade} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{cls.grade}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                cls.pct === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {cls.completed}/{cls.total} Periods
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  cls.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${cls.pct}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-500 truncate font-medium">
              Current: {cls.subject}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
