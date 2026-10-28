"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Clock } from 'lucide-react';

export function AttendanceRadarCard() {
  const { attendance, activeSchool } = useAuth();

  const studentAttendance = attendance.studentPercentage;
  const staffAttendance = attendance.staffPercentage;
  const combinedAttendance = ((studentAttendance + staffAttendance) / 2).toFixed(1);

  return (
    <Card className="light-glass card-hover text-slate-900 flex flex-col justify-between">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Daily Attendance Telemetry
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">Tenant: {activeSchool.name}</span>
          </div>
        </div>
        <Link href="/school/students">
          <Badge variant="success" className="cursor-pointer hover:bg-emerald-100">
            {combinedAttendance}% Combined →
          </Badge>
        </Link>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Student Attendance Block */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-xs">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Students</span>
              <span className="text-emerald-700 font-extrabold text-lg">{studentAttendance}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${studentAttendance}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {attendance.studentsPresent} present • {attendance.studentsExcused} excused
            </div>
          </div>

          {/* Staff Attendance Block */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 shadow-xs">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Faculty & Staff</span>
              <span className="text-cyan-700 font-extrabold text-lg">{staffAttendance}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden">
              <div
                className="h-full bg-cyan-600 rounded-full transition-all duration-500"
                style={{ width: `${staffAttendance}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {attendance.staffPresent} present • {attendance.staffOnLeave} on leave
            </div>
          </div>
        </div>

        {/* Late Arrival Telemetry */}
        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{attendance.lateArrivalsCount} late arrivals notified to guardians via automated SMS</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-700">Logged Today</span>
        </div>
      </CardContent>
    </Card>
  );
}
