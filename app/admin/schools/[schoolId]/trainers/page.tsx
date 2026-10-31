"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { TrainerProfile, TrainerAllocation } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  ChevronLeft,
  Building2,
  Plus,
  Trash2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Award,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function SchoolTrainerAllocationPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const {
    activeSchool,
    setActiveSchool,
    schools,
    courses,
    trainers,
    trainerAllocations,
    allocateTrainer,
    removeTrainerAllocation
  } = useAuth();

  const school = useMemo(() => {
    return schools.find(s => s.id === schoolId) || schools[0];
  }, [schools, schoolId]);

  // Keep activeSchool in AuthContext in sync with the school being viewed in this page
  React.useEffect(() => {
    if (school && activeSchool?.id !== school.id) {
      setActiveSchool(school, true);
    }
  }, [school, activeSchool?.id, setActiveSchool]);

  // Active allocations for this specific school
  const allocations = useMemo(() => {
    return trainerAllocations.filter(a => a.schoolId === school.id);
  }, [trainerAllocations, school.id]);

  // Modal State
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const [form, setForm] = useState({
    trainerId: trainers[0]?.id || '',
    courseId: courses[0]?.id || '',
    assignedGrades: ['Grade 6', 'Grade 7'],
    academicSession: '2026-2027',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    workloadHoursPerWeek: 10,
    allocatedDays: ['Monday', 'Wednesday', 'Friday'] as ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[],
    timeSlot: '09:00 AM - 01:00 PM',
  });

  const availableDays: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const selectedTrainer = useMemo(() => {
    return trainers.find(t => t.id === form.trainerId) || trainers[0];
  }, [trainers, form.trainerId]);

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === form.courseId) || courses[0];
  }, [courses, form.courseId]);

  const handleDayToggle = (day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday') => {
    setForm(prev => {
      const exists = prev.allocatedDays.includes(day);
      if (exists) {
        return { ...prev, allocatedDays: prev.allocatedDays.filter(d => d !== day) };
      } else {
        return { ...prev, allocatedDays: [...prev.allocatedDays, day] };
      }
    });
  };

  const handleOpenAllocateModal = () => {
    setConflictWarning(null);
    setForm({
      trainerId: trainers[0]?.id || '',
      courseId: courses[0]?.id || '',
      assignedGrades: ['Grade 6', 'Grade 7'],
      academicSession: '2026-2027',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      workloadHoursPerWeek: 10,
      allocatedDays: ['Monday', 'Wednesday', 'Friday'],
      timeSlot: '09:00 AM - 01:00 PM',
    });
    setIsAllocateOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictWarning(null);

    if (form.allocatedDays.length === 0) {
      setConflictWarning('Please select at least one training day.');
      return;
    }

    const res = allocateTrainer({
      trainerId: selectedTrainer.id,
      trainerName: selectedTrainer.name,
      schoolId: school.id,
      schoolName: school.name,
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      assignedGrades: form.assignedGrades,
      academicSession: form.academicSession,
      startDate: form.startDate,
      endDate: form.endDate,
      workloadHoursPerWeek: Number(form.workloadHoursPerWeek),
      allocatedDays: form.allocatedDays,
      timeSlot: form.timeSlot,
      status: 'ACTIVE'
    });

    if (res.success) {
      setIsAllocateOpen(false);
    } else {
      setConflictWarning(res.conflict || 'Conflict detected in trainer scheduling.');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/schools" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold">
            <ChevronLeft className="w-4 h-4" />
            School Management
          </Link>
          <span>/</span>
          <Link href={`/admin/schools/${school.id}`} className="hover:text-indigo-600 transition-colors font-semibold">
            {school.name}
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Trainer Allocation</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Operations & Mentorship
              </span>
              <span className="text-xs text-slate-500 font-medium">• Master Trainer Roster</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-8 h-8 text-blue-600" />
              Trainer Allocation — {school.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Deploy InnovatMind specialist trainers to {school.name}. Manage weekly commitments and prevent scheduling overlaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleOpenAllocateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2 h-10 px-5 shadow-md shadow-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              Allocate Master Trainer
            </Button>
          </div>
        </div>

        {/* Allocations Table */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Trainer Name & Specialization</th>
                  <th className="py-3 px-4">Curriculum Course</th>
                  <th className="py-3 px-4">Assigned Grades</th>
                  <th className="py-3 px-4">Weekly Workload</th>
                  <th className="py-3 px-4">Scheduled Days & Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                      <p className="font-semibold text-slate-600">No InnovatMind trainers allocated to {school.name} yet.</p>
                      <Button size="sm" onClick={handleOpenAllocateModal} className="mt-3 bg-blue-600 text-white text-xs font-bold">
                        Allocate First Trainer
                      </Button>
                    </td>
                  </tr>
                ) : (
                  allocations.map(a => (
                    <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {a.trainerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{a.trainerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Alloc ID: {a.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {a.courseTitle}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {a.assignedGrades.join(', ')}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          {a.workloadHoursPerWeek} hrs / week
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {a.allocatedDays.join(', ')}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {a.timeSlot || '09:00 AM - 01:00 PM'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                          {a.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTrainerAllocation(a.id)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Revoke Trainer Allocation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Allocate Trainer Modal */}
        {isAllocateOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Allocate InnovatMind Master Trainer
                    </h3>
                    <p className="text-[11px] text-slate-500">{school.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAllocateOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {conflictWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{conflictWarning}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Trainer Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Master Trainer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.trainerId}
                    onChange={(e) => setForm({ ...form, trainerId: e.target.value })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    {trainers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} — {t.specialization} (Workload: {t.currentWorkloadHours}/{t.maxWorkloadHours} hrs/wk • {t.assignedSchoolsCount} schools)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Trainer Capacity Info */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Specialization:</span>
                    <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      {selectedTrainer.specialization}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Current Workload:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {selectedTrainer.currentWorkloadHours} / {selectedTrainer.maxWorkloadHours} hrs / week
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Available Capacity:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {Math.max(0, selectedTrainer.maxWorkloadHours - selectedTrainer.currentWorkloadHours)} hrs remaining
                    </span>
                  </div>
                </div>

                {/* Course Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Course / Curriculum <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Workload and Time Slot */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Assigned Hours / Week <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="40"
                      value={form.workloadHoursPerWeek}
                      onChange={(e) => setForm({ ...form, workloadHoursPerWeek: Number(e.target.value) })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Schedule Time Slot</label>
                    <Input
                      placeholder="e.g. 09:00 AM - 01:00 PM"
                      value={form.timeSlot}
                      onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Allocated Days */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Allocated Class Days <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableDays.map(day => {
                      const isSelected = form.allocatedDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => handleDayToggle(day)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAllocateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                    Confirm Trainer Allocation
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
