"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Course, SchoolCourseAssignment, AssignmentStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  ChevronLeft,
  Building2,
  Plus,
  Edit,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  CreditCard,
  X,
  Search,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function SchoolCourseAssignmentPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const {
    activeSchool,
    setActiveSchool,
    schools,
    courses,
    schoolCourseAssignments,
    trainers,
    assignCourseToSchool,
    updateCourseAssignment,
    changeAssignmentStatus,
    resolveCoursePrice
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

  // Current school assignments
  const assignments = useMemo(() => {
    return schoolCourseAssignments.filter(a => a.schoolId === school.id);
  }, [schoolCourseAssignments, school.id]);

  // Modal State for New Course Assignment
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<SchoolCourseAssignment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    courseId: courses[0]?.id || '',
    academicSession: '2026-2027',
    eligibleGrades: ['Grade 6', 'Grade 7', 'Grade 8'],
    eligibleSections: ['A', 'B'],
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    capacity: 500,
    assignedTrainerId: '',
    status: 'ACTIVE' as AssignmentStatus,
    notes: '',
  });

  const availableGrades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const availableSections = ['A', 'B', 'C', 'D', 'E'];

  // Selected course details
  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === form.courseId) || courses[0];
  }, [courses, form.courseId]);

  // Live pricing preview for this selection
  const livePrice = useMemo(() => {
    if (!selectedCourse) return { price: 999, currency: 'INR', billingBasis: 'PER_STUDENT' };
    return resolveCoursePrice(selectedCourse.id, school.id, form.academicSession);
  }, [selectedCourse, school.id, form.academicSession, resolveCoursePrice]);

  const handleOpenAssignModal = () => {
    setErrorMsg(null);
    setEditingAssignment(null);
    setForm({
      courseId: courses[0]?.id || '',
      academicSession: '2026-2027',
      eligibleGrades: ['Grade 6', 'Grade 7', 'Grade 8'],
      eligibleSections: ['A', 'B'],
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      capacity: 500,
      assignedTrainerId: '',
      status: 'ACTIVE',
      notes: '',
    });
    setIsAssignOpen(true);
  };

  const handleEditAssignment = (assignment: SchoolCourseAssignment) => {
    setErrorMsg(null);
    setEditingAssignment(assignment);
    setForm({
      courseId: assignment.courseId,
      academicSession: assignment.academicSession,
      eligibleGrades: assignment.eligibleGrades,
      eligibleSections: assignment.eligibleSections || ['A'],
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      capacity: assignment.capacity,
      assignedTrainerId: assignment.assignedTrainerId || '',
      status: assignment.status,
      notes: assignment.notes || '',
    });
    setIsAssignOpen(true);
  };

  const handleGradeToggle = (grade: string) => {
    setForm(prev => {
      const exists = prev.eligibleGrades.includes(grade);
      if (exists) {
        return { ...prev, eligibleGrades: prev.eligibleGrades.filter(g => g !== grade) };
      } else {
        return { ...prev, eligibleGrades: [...prev.eligibleGrades, grade] };
      }
    });
  };

  const handleSectionToggle = (section: string) => {
    setForm(prev => {
      const exists = prev.eligibleSections.includes(section);
      if (exists) {
        return { ...prev, eligibleSections: prev.eligibleSections.filter(s => s !== section) };
      } else {
        return { ...prev, eligibleSections: [...prev.eligibleSections, section] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.eligibleGrades.length === 0) {
      setErrorMsg('Please select at least one eligible grade.');
      return;
    }
    if (form.capacity <= 0) {
      setErrorMsg('Student capacity must be greater than zero.');
      return;
    }

    const assignedTrainer = trainers.find(t => t.id === form.assignedTrainerId);

    if (editingAssignment) {
      updateCourseAssignment(editingAssignment.id, {
        eligibleGrades: form.eligibleGrades,
        eligibleSections: form.eligibleSections,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        assignedTrainerId: form.assignedTrainerId || undefined,
        assignedTrainerName: assignedTrainer?.name,
        status: form.status,
        notes: form.notes,
      });
      setIsAssignOpen(false);
    } else {
      const res = assignCourseToSchool({
        schoolId: school.id,
        schoolName: school.name,
        courseId: selectedCourse.id,
        courseTitle: selectedCourse.title,
        academicSession: form.academicSession,
        eligibleGrades: form.eligibleGrades,
        eligibleSections: form.eligibleSections,
        startDate: form.startDate,
        endDate: form.endDate,
        capacity: Number(form.capacity),
        appliedPricePerUnit: livePrice.price,
        billingBasis: livePrice.billingBasis as any,
        assignedTrainerId: form.assignedTrainerId || undefined,
        assignedTrainerName: assignedTrainer?.name,
        status: form.status,
        notes: form.notes,
      });

      if (res.success) {
        setIsAssignOpen(false);
      } else {
        setErrorMsg(res.error || 'Failed to assign course.');
      }
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
          <span className="font-semibold text-slate-800">Course Assignments</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                Curriculum Directorate
              </span>
              <span className="text-xs text-slate-500 font-medium">• Institutional Allocation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              Course Assignments — {school.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Assign STEM, Robotics, and AI curricula to {school.name}. Set eligible grades, capacity, and view live applied pricing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleOpenAssignModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 h-10 px-5 shadow-md shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              Assign New Course
            </Button>
          </div>
        </div>

        {/* Assignments Table */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Course Name & Domain</th>
                  <th className="py-3 px-4">Academic Session</th>
                  <th className="py-3 px-4">Eligible Grades & Sections</th>
                  <th className="py-3 px-4">Applied Unit Price</th>
                  <th className="py-3 px-4">Enrollment vs Capacity</th>
                  <th className="py-3 px-4">Assigned Trainer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                      <p className="font-semibold text-slate-600">No courses assigned to {school.name} yet.</p>
                      <Button size="sm" onClick={handleOpenAssignModal} className="mt-3 bg-indigo-600 text-white text-xs font-bold">
                        Assign First Course
                      </Button>
                    </td>
                  </tr>
                ) : (
                  assignments.map(a => (
                    <tr key={a.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block leading-tight">{a.courseTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">ID: {a.id}</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {a.academicSession}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">
                          {a.eligibleGrades.join(', ')}
                        </span>
                        {a.eligibleSections && a.eligibleSections.length > 0 && (
                          <span className="text-[10px] text-slate-500">Sections: {a.eligibleSections.join(', ')}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-purple-700 text-sm">₹{a.appliedPricePerUnit}</span>
                        <span className="text-[10px] text-slate-400 block">per student</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">{a.enrolledStudentsCount}</span>
                        <span className="text-slate-500"> / {a.capacity} capacity</span>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full" 
                            style={{ width: `${Math.min(100, Math.round((a.enrolledStudentsCount / (a.capacity || 1)) * 100))}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {a.assignedTrainerName ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            {a.assignedTrainerName}
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Pending Trainer
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] font-bold ${
                            a.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            a.status === 'PAUSED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {a.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAssignment(a)}
                            className="h-8 px-2.5 text-[11px] font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>

                          {a.status === 'ACTIVE' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => changeAssignmentStatus(a.id, 'PAUSED')}
                              title="Pause Assignment"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => changeAssignmentStatus(a.id, 'ACTIVE')}
                              title="Activate Assignment"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Course Assignment Modal */}
        {isAssignOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-xl w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {editingAssignment ? 'Edit Course Assignment' : 'Assign STEM Curriculum'}
                    </h3>
                    <p className="text-[11px] text-slate-500">{school.name}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAssignOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Course Selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Select Course <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={Boolean(editingAssignment)}
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.category} • Class {c.minGrade}-{c.maxGrade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Applicable Pricing Banner */}
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">
                      Live Applicable Pricing (Engine)
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{livePrice.price} <span className="text-xs font-normal text-slate-500">/ {livePrice.billingBasis.toLowerCase().replace('_', ' ')}</span>
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-white text-purple-700 border-purple-300">
                    Deterministic Resolution
                  </Badge>
                </div>

                {/* Academic Session & Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Session</label>
                    <select
                      value={form.academicSession}
                      onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                    >
                      <option value="2026-2027">2026-2027</option>
                      <option value="2025-2026">2025-2026</option>
                      <option value="2027-2028">2027-2028</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Capacity</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Eligible Grades Multi-select */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Eligible Grades (Select All that Apply) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableGrades.map(grade => {
                      const isSelected = form.eligibleGrades.includes(grade);
                      return (
                        <button
                          type="button"
                          key={grade}
                          onClick={() => handleGradeToggle(grade)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {grade}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Eligible Sections Multi-select */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Eligible Sections
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    {availableSections.map(section => {
                      const isSelected = form.eligibleSections.includes(section);
                      return (
                        <button
                          type="button"
                          key={section}
                          onClick={() => handleSectionToggle(section)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {section}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dates & Trainer */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Curriculum Start Date</label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Curriculum End Date</label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Assigned InnovatMind Master Trainer
                    </label>
                    <select
                      value={form.assignedTrainerId}
                      onChange={(e) => setForm({ ...form, assignedTrainerId: e.target.value })}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                    >
                      <option value="">Pending Trainer Assignment</option>
                      {trainers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.specialization} • Workload: {t.currentWorkloadHours}/{t.maxWorkloadHours} hrs)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                    {editingAssignment ? 'Save Changes' : 'Confirm Assignment'}
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
