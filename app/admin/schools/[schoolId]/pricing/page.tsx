"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Course, BillingBasis, SchoolPricingOverride } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  ChevronLeft,
  Building2,
  BookOpen,
  Plus,
  Edit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function SchoolCoursePricingPage() {
  const params = useParams();
  const schoolId = params.schoolId as string;

  const {
    activeSchool,
    setActiveSchool,
    schools,
    courses,
    pricingRules,
    schoolPricingOverrides,
    schoolCourseAssignments,
    resolveCoursePrice,
    setSchoolPricingOverride,
    resetSchoolPricingOverride,
    recordAuditEvent
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState('2026-2027');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Override Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    customPrice: 999,
    billingBasis: 'PER_STUDENT' as BillingBasis,
    effectiveStartDate: '2026-04-01',
    effectiveEndDate: '2027-03-31',
    reason: '',
  });
  const [confirmResetCourse, setConfirmResetCourse] = useState<Course | null>(null);

  // Compute pricing breakdown for all courses for this school
  const coursePricingRows = useMemo(() => {
    return courses.map(course => {
      // 1. Resolve effective price using deterministic hierarchy
      const resolved = resolveCoursePrice(course.id, school.id, selectedSession);
      const defaultCatalogPrice = course.pricePerStudent || 999;
      const effectivePrice = resolved.price;
      const hasOverride = resolved.overrideApplied;

      // 2. Compute price difference
      const priceDelta = effectivePrice - defaultCatalogPrice;
      const percentDelta = defaultCatalogPrice > 0 
        ? Math.round(((effectivePrice - defaultCatalogPrice) / defaultCatalogPrice) * 100)
        : 0;

      // 3. Find active assignment if exists
      const assignment = schoolCourseAssignments.find(
        a => a.schoolId === school.id && a.courseId === course.id && a.academicSession === selectedSession
      );

      const enrolledCount = assignment?.enrolledStudentsCount || 0;
      const estimatedStudents = assignment?.capacity || Math.round((school.totalStudents || 500) * 0.35);
      const estimatedValue = effectivePrice * (assignment ? assignment.capacity : estimatedStudents);

      return {
        course,
        defaultPrice: defaultCatalogPrice,
        effectivePrice,
        currency: resolved.currency || 'INR',
        billingBasis: resolved.billingBasis || 'PER_STUDENT',
        hasOverride,
        source: resolved.source,
        reason: resolved.reason,
        ruleId: resolved.ruleId,
        priceDelta,
        percentDelta,
        assignment,
        enrolledCount,
        estimatedValue,
        status: assignment ? assignment.status : (hasOverride ? 'CONFIGURED' : 'DEFAULT')
      };
    }).filter(row => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || row.course.title.toLowerCase().includes(q) || row.course.category.toLowerCase().includes(q);
      const matchesCategory = selectedCategory === 'ALL' || row.course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, school, selectedSession, searchQuery, selectedCategory, resolveCoursePrice, schoolCourseAssignments]);

  const handleOpenOverrideModal = (course: Course, currentEffectivePrice: number) => {
    const existingOverride = schoolPricingOverrides.find(
      o => o.schoolId === school.id && o.courseId === course.id && o.academicSession === selectedSession
    );
    setEditingCourse(course);
    setOverrideForm({
      customPrice: existingOverride ? existingOverride.customPrice : currentEffectivePrice,
      billingBasis: existingOverride ? existingOverride.billingBasis : 'PER_STUDENT',
      effectiveStartDate: existingOverride ? existingOverride.effectiveStartDate : '2026-04-01',
      effectiveEndDate: existingOverride?.effectiveEndDate || '2027-03-31',
      reason: existingOverride ? existingOverride.reason : '',
    });
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (Number(overrideForm.customPrice) < 0) {
      alert('Price cannot be negative.');
      return;
    }
    if (!overrideForm.reason.trim()) {
      alert('A valid reason for this price override is required for auditing.');
      return;
    }

    setSchoolPricingOverride({
      schoolId: school.id,
      schoolName: school.name,
      courseId: editingCourse.id,
      courseTitle: editingCourse.title,
      academicSession: selectedSession,
      customPrice: Number(overrideForm.customPrice),
      currency: 'INR',
      billingBasis: overrideForm.billingBasis,
      effectiveStartDate: overrideForm.effectiveStartDate,
      effectiveEndDate: overrideForm.effectiveEndDate,
      reason: overrideForm.reason.trim(),
      status: 'ACTIVE',
      createdBy: 'usr-super'
    });

    setEditingCourse(null);
  };

  const handleConfirmReset = () => {
    if (!confirmResetCourse) return;
    resetSchoolPricingOverride(school.id, confirmResetCourse.id, selectedSession);
    setConfirmResetCourse(null);
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
          <span className="font-semibold text-slate-800">Course Pricing Engine</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                Institutional Course Pricing
              </span>
              <span className="text-xs text-slate-500 font-medium">• Tier Precedence Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-8 h-8 text-purple-600" />
              Course Pricing — {school.name}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Configure course pricing with deterministic precedence hierarchy. Set custom overrides with auditable justification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/admin/schools/${school.id}/courses`}>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-2 h-10 px-4">
                <BookOpen className="w-4 h-4" />
                Assign Courses
              </Button>
            </Link>
          </div>
        </div>

        {/* Pricing Hierarchy Explainer Card */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-200/80 rounded-2xl shadow-sm text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-purple-950 block text-sm">
                Deterministic Pricing Hierarchy Resolution:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-purple-900 font-medium pt-1">
                <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-slate-500">Global Base</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
                <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-slate-600">Region ({school.region || 'North'})</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
                <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-slate-600">State ({school.state})</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
                <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-slate-600">Board ({school.schoolType})</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
                <span className="px-2 py-0.5 bg-white border border-purple-200 rounded-md font-mono text-slate-600">Grade Tier</span>
                <ArrowRight className="w-3 h-3 text-purple-400" />
                <span className="px-2 py-0.5 bg-purple-600 text-white font-bold rounded-md font-mono shadow-xs">School-Specific Override (Wins)</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                The most specific valid rule applies automatically. Overrides take highest precedence and are logged in the immutable audit trail.
              </p>
            </div>
          </div>
        </Card>

        {/* Filter and Session Selector Bar */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search course title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Coding">Coding</option>
              <option value="Robotics">Robotics</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="IoT">IoT & Electronics</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <span className="text-slate-500 font-semibold">Academic Cycle:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="h-9 px-3 bg-indigo-50/70 border border-indigo-200 rounded-xl font-bold text-indigo-900 text-xs focus:outline-none"
            >
              <option value="2026-2027">2026-2027 (Active Session)</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2027-2028">2027-2028 (Upcoming)</option>
            </select>
          </div>
        </Card>

        {/* Pricing Table */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Course Name & Domain</th>
                  <th className="py-3 px-4">Grade Range</th>
                  <th className="py-3 px-4">Default Catalog</th>
                  <th className="py-3 px-4">Effective School Price</th>
                  <th className="py-3 px-4">Difference</th>
                  <th className="py-3 px-4">Capacity / Enrolled</th>
                  <th className="py-3 px-4">Estimated Value</th>
                  <th className="py-3 px-4">Status & Source</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coursePricingRows.map(({
                  course,
                  defaultPrice,
                  effectivePrice,
                  hasOverride,
                  source,
                  reason,
                  priceDelta,
                  percentDelta,
                  assignment,
                  enrolledCount,
                  estimatedValue,
                  status
                }) => (
                  <tr key={course.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block leading-tight">{course.title}</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{course.category} • {course.difficulty}</span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      Class {course.minGrade} - {course.maxGrade}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-500 line-through">₹{defaultPrice}</span>
                      <span className="text-[10px] text-slate-400 block">per student</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-900 text-sm">
                          ₹{effectivePrice}
                        </span>
                        {hasOverride && (
                          <Badge className="bg-purple-100 text-purple-800 text-[9px] font-bold px-1.5 py-0">
                            Override
                          </Badge>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]" title={source}>
                        {source}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {priceDelta === 0 ? (
                        <span className="text-slate-400 font-semibold">— Standard</span>
                      ) : priceDelta < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                          <TrendingDown className="w-3.5 h-3.5" />
                          {percentDelta}% (Save ₹{Math.abs(priceDelta)})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{percentDelta}% (+₹{priceDelta})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {assignment ? (
                        <div>
                          <span className="font-bold text-slate-800">{enrolledCount} enrolled</span>
                          <span className="text-[10px] text-slate-400 block">Cap: {assignment.capacity}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{estimatedValue.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      {assignment ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                          {assignment.status} Assignment
                        </Badge>
                      ) : hasOverride ? (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                          Custom Override
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 text-[10px]">
                          Hierarchy Default
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenOverrideModal(course, effectivePrice)}
                          className="h-8 px-2.5 text-[11px] font-bold text-purple-700 border-purple-200 hover:bg-purple-50"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {hasOverride ? 'Edit Price' : 'Override Price'}
                        </Button>

                        {hasOverride && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmResetCourse(course)}
                            title="Reset to Hierarchy Default"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Set / Edit School Price Override Modal */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Configure School-Specific Price Override
                    </h3>
                    <p className="text-[11px] text-slate-500">{editingCourse.title}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingCourse(null)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSaveOverride} className="space-y-4 text-xs">
                <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-xl space-y-1 text-purple-900">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Central Base Catalog Price:</span>
                    <span className="font-mono font-bold">₹{editingCourse.pricePerStudent} / student</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Target Institution:</span>
                    <span className="font-bold">{school.name} ({school.code})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[11px]">Academic Session:</span>
                    <span className="font-bold">{selectedSession}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Custom Override Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={overrideForm.customPrice}
                      onChange={(e) => setOverrideForm({ ...overrideForm, customPrice: Number(e.target.value) })}
                      required
                      className="h-10 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Billing Mode / Basis
                    </label>
                    <select
                      value={overrideForm.billingBasis}
                      onChange={(e) => setOverrideForm({ ...overrideForm, billingBasis: e.target.value as BillingBasis })}
                      className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                    >
                      <option value="PER_STUDENT">Per Student (Enrolled Count)</option>
                      <option value="PER_BATCH">Per Batch / Lab Setup</option>
                      <option value="PER_TERM">Per Academic Term</option>
                      <option value="ANNUAL_FLAT">Annual Flat Licensing</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Effective Start Date</label>
                    <Input
                      type="date"
                      value={overrideForm.effectiveStartDate}
                      onChange={(e) => setOverrideForm({ ...overrideForm, effectiveStartDate: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Effective End Date</label>
                    <Input
                      type="date"
                      value={overrideForm.effectiveEndDate}
                      onChange={(e) => setOverrideForm({ ...overrideForm, effectiveEndDate: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Justification & Audit Rationale <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide contractual reason (e.g. EduTech Expo multi-year bulk discount, government pilot subsidy, board concession)..."
                    value={overrideForm.reason}
                    onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                    required
                    className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    This rationale will be recorded permanently in the Super Admin audit log.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingCourse(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
                    Apply Price Override
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Confirmation Modal for Resetting to Default */}
        {confirmResetCourse && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Revert to Hierarchy Default?
                  </h3>
                  <p className="text-xs text-slate-500">{confirmResetCourse.title}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Resetting will remove the school-specific override and restore the standard hierarchical rate determined by region, state, and board affiliation.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setConfirmResetCourse(null)} className="text-xs">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleConfirmReset} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
                  Revert Price
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
