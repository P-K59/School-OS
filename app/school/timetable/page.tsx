"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { TimetableSlot } from '@/lib/types';
import { initialGrades, initialSections } from '@/lib/db/mock-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  BookOpen,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function TimetableManagementPage() {
  const { timetableSlots, activeSchool, staff, addTimetableSlot, deleteTimetableSlot } = useAuth();

  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 6');
  const [selectedSection, setSelectedSection] = useState<string>('Section A');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  // Schedule Slot Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [slotForm, setSlotForm] = useState({
    day: 'Monday' as TimetableSlot['day'],
    periodNumber: 1,
    timeSlot: '08:30 AM - 09:15 AM',
    grade: 'Grade 6',
    section: 'Section A',
    subject: 'Python Arcade Coding',
    teacher: 'Rajesh Kumar',
    room: 'Computer Lab 1',
  });

  const periodTimeSlots: Record<number, string> = {
    1: '08:30 AM - 09:15 AM',
    2: '09:15 AM - 10:00 AM',
    3: '10:15 AM - 11:00 AM',
    4: '11:00 AM - 11:45 AM',
    5: '12:30 PM - 01:15 PM',
    6: '01:15 PM - 02:00 PM',
    7: '02:00 PM - 02:45 PM',
    8: '02:45 PM - 03:30 PM',
  };

  const daysList: TimetableSlot['day'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filteredSlots = timetableSlots.filter(
    s => s.grade === selectedGrade && s.section === selectedSection
  );

  const handlePeriodChange = (periodNum: number) => {
    setSlotForm({
      ...slotForm,
      periodNumber: periodNum,
      timeSlot: periodTimeSlots[periodNum] || '08:30 AM - 09:15 AM',
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    const result = addTimetableSlot({
      day: slotForm.day,
      periodNumber: slotForm.periodNumber,
      timeSlot: slotForm.timeSlot,
      grade: selectedGrade,
      section: selectedSection,
      subject: slotForm.subject,
      teacher: slotForm.teacher,
      room: slotForm.room,
    });

    if (!result.success) {
      setConflictError(result.conflict || 'Schedule conflict detected.');
      return;
    }

    setIsScheduleModalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
              <span>{activeSchool.name}</span>
              <span>•</span>
              <span>Academic Timetable & Lab Allocator</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Conflict-Free Academic Timetable
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Automated clash detection prevents double-booking faculty and specialized STEM robotics facilities across all sections.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setConflictError(null);
                setSlotForm(prev => ({
                  ...prev,
                  grade: selectedGrade,
                  section: selectedSection,
                  day: selectedDay as any,
                }));
                setIsScheduleModalOpen(true);
              }}
              className="gap-2 shadow-md shadow-indigo-100 font-bold"
              size="default"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Period Slot</span>
            </Button>
          </div>
        </div>

        {/* Filter Selection Bar (Grade, Section, Day) */}
        <Card className="light-glass p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Select Grade:</span>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  <option value="Grade 6">Grade 6</option>
                  <option value="Grade 7">Grade 7</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  <option value="Section A">Section A</option>
                  <option value="Section B">Section B</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Clash Engine Active</span>
              </div>
            </div>

            {/* Day Selector Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {daysList.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDay === day
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Timetable Schedule Grid (Periods 1 to 8) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((periodNum) => {
            const timeSlot = periodTimeSlots[periodNum];
            const slot = filteredSlots.find(
              s => s.day === selectedDay && s.periodNumber === periodNum
            );

            return (
              <Card
                key={periodNum}
                className={`p-4 rounded-2xl transition-all duration-200 flex flex-col justify-between ${
                  slot
                    ? 'light-glass border-indigo-200 shadow-xs hover:shadow-md'
                    : 'bg-white/60 border-dashed border-slate-300 hover:border-indigo-300'
                }`}
              >
                <div>
                  {/* Period Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs flex items-center justify-center">
                        {periodNum}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Period {periodNum}</span>
                    </div>
                    <div className="text-[10px] font-mono font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{timeSlot}</span>
                    </div>
                  </div>

                  {slot ? (
                    /* Populated Slot */
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="text-sm font-extrabold text-slate-900 leading-snug">
                          {slot.subject}
                        </div>
                        {slot.subject.includes('Python') || slot.subject.includes('Robotics') || slot.subject.includes('AI') ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-50 text-cyan-700 border border-cyan-200 shrink-0">
                            STEM Lab
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{slot.teacher}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="text-slate-600">{slot.room}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Free / Unassigned Period */
                    <div className="py-6 text-center text-slate-400 text-xs font-medium">
                      Free Period / Unassigned
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {slot ? (
                    <>
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Conflict-Free</span>
                      </span>
                      <button
                        onClick={() => deleteTimetableSlot(slot.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove period assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setConflictError(null);
                        setSlotForm({
                          day: selectedDay as any,
                          periodNumber: periodNum,
                          timeSlot: timeSlot,
                          grade: selectedGrade,
                          section: selectedSection,
                          subject: 'Python Arcade Coding',
                          teacher: staff[0]?.name || 'Dr. Ananya Sharma',
                          room: 'Computer Lab 1',
                        });
                        setIsScheduleModalOpen(true);
                      }}
                      className="w-full text-xs text-indigo-700 hover:text-indigo-800 font-bold h-7"
                    >
                      + Assign Class
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Modal: Assign Class Slot */}
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Assign Academic Period
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {selectedGrade} ({selectedSection}) • {slotForm.day}
                  </p>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conflict Error Notification */}
              {conflictError && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-rose-900">Schedule Collision Detected</div>
                    <div className="mt-0.5 leading-relaxed">{conflictError}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Period Number *</label>
                    <select
                      value={slotForm.periodNumber}
                      onChange={(e) => handlePeriodChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                        <option key={p} value={p}>Period {p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Time Slot</label>
                    <Input
                      disabled
                      value={slotForm.timeSlot}
                      className="bg-slate-100 border-slate-300 text-xs font-mono font-bold text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject / Curriculum *</label>
                  <select
                    value={slotForm.subject}
                    onChange={(e) => setSlotForm({ ...slotForm, subject: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs"
                  >
                    <option value="Python Arcade Coding">Python Arcade Coding (STEM)</option>
                    <option value="Autonomous Rover Lab">Autonomous Rover Lab (Robotics)</option>
                    <option value="AI Sparks Foundations">AI Sparks Foundations (AI/ML)</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics & Electronics">Physics & Electronics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="English Literature">English Literature</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Teacher *</label>
                    <select
                      value={slotForm.teacher}
                      onChange={(e) => setSlotForm({ ...slotForm, teacher: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs"
                    >
                      {staff.map(stf => (
                        <option key={stf.id} value={stf.name}>
                          {stf.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Room / Facility *</label>
                    <select
                      value={slotForm.room}
                      onChange={(e) => setSlotForm({ ...slotForm, room: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs"
                    >
                      <option value="Computer Lab 1">Computer Lab 1</option>
                      <option value="Robotics Lab">Robotics Lab</option>
                      <option value="Physics Lab">Physics Lab</option>
                      <option value="Room 201">Room 201</option>
                      <option value="Room 202">Room 202</option>
                      <option value="Makerspace Arena">Makerspace Arena</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="shadow-md shadow-indigo-100 font-bold">
                    Validate & Assign
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
