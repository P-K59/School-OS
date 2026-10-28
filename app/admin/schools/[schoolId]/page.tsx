"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { School, SchoolType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  ChevronLeft,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Users,
  GraduationCap,
  CreditCard,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Edit,
  Save,
  X,
  FileText,
  Activity,
  DollarSign,
  BarChart3,
  Layers
} from 'lucide-react';

type SchoolTab = 
  | 'overview' 
  | 'academic' 
  | 'contacts' 
  | 'courses_pricing' 
  | 'students' 
  | 'staff' 
  | 'finance' 
  | 'reports' 
  | 'activity';

export default function SchoolDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const schoolId = params.schoolId as string;

  const {
    schools,
    courses,
    pricingRules,
    schoolPricingOverrides,
    schoolCourseAssignments,
    trainers,
    trainerAllocations,
    students,
    staff,
    financials,
    activities,
    updateSchool,
    recordAuditEvent
  } = useAuth();

  // Active tab state
  const initialTab = (searchParams.get('tab') as SchoolTab) || 'overview';
  const [activeTab, setActiveTab] = useState<SchoolTab>(initialTab);

  // Find school by ID or fallback
  const school = useMemo(() => {
    return schools.find(s => s.id === schoolId) || schools[0];
  }, [schools, schoolId]);

  // Edit School Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: school.name,
    email: school.email,
    phone: school.phone,
    principalName: school.principalName || '',
    contactPersonName: school.contactPersonName || '',
    contactPersonPhone: school.contactPersonPhone || '',
    contactPersonEmail: school.contactPersonEmail || '',
    city: school.city,
    state: school.state,
    address: school.address,
    postalCode: school.postalCode,
    totalStudents: school.totalStudents,
    totalStaff: school.totalStaff,
    contractStartDate: school.contractStartDate || '',
    contractEndDate: school.contractEndDate || '',
    notes: school.notes || '',
  });

  // School-specific course assignments
  const schoolAssignments = useMemo(() => {
    return schoolCourseAssignments.filter(a => a.schoolId === school.id);
  }, [schoolCourseAssignments, school.id]);

  // School-specific pricing overrides
  const schoolOverrides = useMemo(() => {
    return schoolPricingOverrides.filter(o => o.schoolId === school.id);
  }, [schoolPricingOverrides, school.id]);

  // School-specific trainer allocations
  const schoolAllocations = useMemo(() => {
    return trainerAllocations.filter(a => a.schoolId === school.id);
  }, [trainerAllocations, school.id]);

  // School audit activities
  const schoolActivities = useMemo(() => {
    return activities.filter(a => a.schoolId === school.id);
  }, [activities, school.id]);

  // School students & staff
  const schoolStudents = useMemo(() => {
    return students.filter(s => s.schoolId === school.id);
  }, [students, school.id]);

  const schoolStaffMembers = useMemo(() => {
    return staff.filter(s => s.schoolId === school.id);
  }, [staff, school.id]);

  // Estimated contract value calculation
  const estimatedContractValue = useMemo(() => {
    return schoolAssignments.reduce((acc, curr) => {
      return acc + (curr.appliedPricePerUnit * (curr.capacity || school.totalStudents));
    }, 0);
  }, [schoolAssignments, school.totalStudents]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchool(school.id, {
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      principalName: editForm.principalName,
      contactPersonName: editForm.contactPersonName,
      contactPersonPhone: editForm.contactPersonPhone,
      contactPersonEmail: editForm.contactPersonEmail,
      city: editForm.city,
      state: editForm.state,
      address: editForm.address,
      postalCode: editForm.postalCode,
      totalStudents: Number(editForm.totalStudents),
      totalStaff: Number(editForm.totalStaff),
      contractStartDate: editForm.contractStartDate,
      contractEndDate: editForm.contractEndDate,
      notes: editForm.notes,
    });
    setIsEditOpen(false);
  };

  const tabs: { id: SchoolTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'academic', label: 'Academic Details' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'courses_pricing', label: 'Course Pricing & Assignment', count: schoolAssignments.length },
    { id: 'students', label: 'Students', count: schoolStudents.length },
    { id: 'staff', label: 'Staff', count: schoolStaffMembers.length },
    { id: 'finance', label: 'Finance' },
    { id: 'reports', label: 'Reports' },
    { id: 'activity', label: 'Activity Logs', count: schoolActivities.length },
  ];

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/schools" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold">
            <ChevronLeft className="w-4 h-4" />
            School Management
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">{school.name}</span>
        </div>

        {/* Institution Hero Header Banner */}
        <Card className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/30 flex items-center justify-center font-black text-2xl text-white shadow-lg shrink-0">
                {school.name.slice(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                    {school.name}
                  </h1>
                  <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                    {school.code}
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30 text-[10px] font-bold">
                    {school.schoolType} Board
                  </Badge>
                  {school.isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active Tenant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {school.onboardingStatus || 'Onboarding'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {school.city}, {school.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    Session: {school.academicSession || '2026-2027'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    {school.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditForm({
                    name: school.name,
                    email: school.email,
                    phone: school.phone,
                    principalName: school.principalName || '',
                    contactPersonName: school.contactPersonName || '',
                    contactPersonPhone: school.contactPersonPhone || '',
                    contactPersonEmail: school.contactPersonEmail || '',
                    city: school.city,
                    state: school.state,
                    address: school.address,
                    postalCode: school.postalCode,
                    totalStudents: school.totalStudents,
                    totalStaff: school.totalStaff,
                    contractStartDate: school.contractStartDate || '',
                    contractEndDate: school.contractEndDate || '',
                    notes: school.notes || '',
                  });
                  setIsEditOpen(true);
                }}
                className="bg-slate-800/80 border-slate-700 hover:bg-slate-700 text-white text-xs font-semibold gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </Button>

              <Link href={`/admin/schools/${school.id}/pricing`}>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  Course Pricing
                </Button>
              </Link>

              <Link href={`/admin/schools/${school.id}/courses`}>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Assign Course
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Total Enrollment</span>
              <span className="text-lg font-black text-white">{(school.totalStudents || 0).toLocaleString()}</span>
              <span className="text-[10px] text-indigo-300 block">Eligible Students</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">STEM Courses Assigned</span>
              <span className="text-lg font-black text-cyan-300">{schoolAssignments.length}</span>
              <span className="text-[10px] text-cyan-200 block">Active Curricula</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Allocated Master Trainers</span>
              <span className="text-lg font-black text-purple-300">{schoolAllocations.length}</span>
              <span className="text-[10px] text-purple-200 block">On-site & Hybrid</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-semibold uppercase">Annual Contract Value</span>
              <span className="text-lg font-black text-emerald-400">
                ₹{(estimatedContractValue / 100000).toFixed(2)} Lakhs
              </span>
              <span className="text-[10px] text-emerald-300 block">Estimated Billing</span>
            </div>
          </div>
        </Card>

        {/* 9 Navigable Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-t-2xl px-2 pt-2 shadow-sm overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 text-xs font-bold transition-all border-b-2 rounded-t-lg flex items-center gap-1.5 ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Details */}
            <div className="md:col-span-2 space-y-6">
              {/* Institutional Profile */}
              <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    Institutional Profile & Campus
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    Affiliation ID: {school.code}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Campus Address</span>
                    <span className="font-semibold text-slate-800">{school.address || `${school.city}, ${school.state}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">City, State & PIN</span>
                    <span className="font-semibold text-slate-800">{school.city}, {school.state} - {school.postalCode || '400001'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Principal / Head</span>
                    <span className="font-semibold text-slate-800">{school.principalName || 'Principal In-charge'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Designated Coordinator</span>
                    <span className="font-semibold text-slate-800">{school.contactPersonName || 'STEM Lab Coordinator'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Official Email</span>
                    <span className="font-semibold text-slate-800">{school.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Official Phone</span>
                    <span className="font-semibold text-slate-800">{school.phone}</span>
                  </div>
                </div>

                {school.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Partnership Notes:</span>
                    <p className="text-slate-600 leading-relaxed">{school.notes}</p>
                  </div>
                )}
              </Card>

              {/* Assigned Courses Section Preview */}
              <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Assigned Courses ({schoolAssignments.length})
                  </h3>
                  <Link href={`/admin/schools/${school.id}/courses`}>
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-semibold gap-1">
                      <span>Manage All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>

                {schoolAssignments.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 text-xs">
                    No STEM courses assigned to this school yet.
                    <div className="mt-2">
                      <Link href={`/admin/schools/${school.id}/courses`}>
                        <Button size="sm" className="bg-indigo-600 text-white text-xs">Assign First Course</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schoolAssignments.map(assignment => (
                      <div key={assignment.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{assignment.courseTitle}</span>
                          <span className="text-[11px] text-slate-500">
                            Grades: {assignment.eligibleGrades.join(', ')} • Capacity: {assignment.capacity} students
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-purple-700 block">₹{assignment.appliedPricePerUnit} / {assignment.billingBasis.toLowerCase().replace('_', ' ')}</span>
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {assignment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right 1 Col: Contract & Quick Links */}
            <div className="space-y-6">
              {/* Contract Status Card */}
              <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Contract & Renewal Status
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Contract Lifecycle</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs mt-0.5">
                      Active Partner Contract
                    </Badge>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Contract Duration</span>
                    <span className="font-bold text-slate-800">
                      {school.contractStartDate || '2026-04-01'} to {school.contractEndDate || '2028-03-31'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Primary Currency</span>
                    <span className="font-bold text-slate-800">INR (₹ Indian Rupee)</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] font-semibold">Default Billing Mode</span>
                    <span className="font-bold text-slate-800">Annual Institutional Licensing</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link href={`/admin/schools/${school.id}/pricing`}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50">
                      Configure School Course Pricing
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Allocated Trainers Card */}
              <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Allocated Trainers ({schoolAllocations.length})
                  </h3>
                  <Link href={`/admin/schools/${school.id}/trainers`}>
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-semibold p-0 h-auto">
                      Allocate
                    </Button>
                  </Link>
                </div>

                {schoolAllocations.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No master trainers allocated yet.</p>
                ) : (
                  <div className="space-y-2">
                    {schoolAllocations.map(allocation => (
                      <div key={allocation.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-900 block">{allocation.trainerName}</span>
                        <span className="text-[11px] text-slate-500 block">
                          {allocation.courseTitle} ({allocation.workloadHoursPerWeek} hrs/wk)
                        </span>
                        <span className="text-[10px] text-indigo-600 font-semibold">
                          Days: {allocation.allocatedDays.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Academic Details */}
        {activeTab === 'academic' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Academic Infrastructure & Session</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Academic Year</span>
                <span className="text-base font-black text-slate-900 mt-1 block">{school.academicSession || '2026-2027'}</span>
                <span className="text-emerald-600 text-[11px] font-medium">CBSE / ICSE Synchronized</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Enrolled Student Strength</span>
                <span className="text-base font-black text-slate-900 mt-1 block">{(school.totalStudents || 0).toLocaleString()}</span>
                <span className="text-indigo-600 text-[11px] font-medium">Classes 1 through 12</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 font-semibold block text-[11px]">Faculty & Staff Strength</span>
                <span className="text-base font-black text-slate-900 mt-1 block">{school.totalStaff || 0}</span>
                <span className="text-purple-600 text-[11px] font-medium">Teaching & Administrative</span>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Contacts */}
        {activeTab === 'contacts' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Official Administrative Contacts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-indigo-700 uppercase block">Principal & Head of School</span>
                <p className="text-sm font-bold text-slate-900">{school.principalName || 'Principal In-charge'}</p>
                <p className="text-slate-600">Email: {school.email}</p>
                <p className="text-slate-600">Phone: {school.phone}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-purple-700 uppercase block">Designated STEM Coordinator</span>
                <p className="text-sm font-bold text-slate-900">{school.contactPersonName || 'Coordinator'}</p>
                <p className="text-slate-600">Email: {school.contactPersonEmail || school.email}</p>
                <p className="text-slate-600">Phone: {school.contactPersonPhone || school.phone}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 4: Course Pricing & Assignment */}
        {activeTab === 'courses_pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Course Pricing & Curriculum Assignment</h3>
                <p className="text-xs text-slate-500">Manage course assignments, pricing overrides, and trainer allocation for this school.</p>
              </div>

              <div className="flex items-center gap-2">
                <Link href={`/admin/schools/${school.id}/pricing`}>
                  <Button size="sm" variant="outline" className="text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-50">
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    Manage Pricing Overrides
                  </Button>
                </Link>
                <Link href={`/admin/schools/${school.id}/courses`}>
                  <Button size="sm" className="bg-indigo-600 text-white text-xs font-bold">
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    Assign New Course
                  </Button>
                </Link>
              </div>
            </div>

            {/* Assignments Table */}
            <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-3 px-4">Course Name</th>
                    <th className="py-3 px-4">Grades & Sections</th>
                    <th className="py-3 px-4">Price Per Unit</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Assigned Trainer</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schoolAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No courses assigned yet.
                      </td>
                    </tr>
                  ) : (
                    schoolAssignments.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{a.courseTitle}</td>
                        <td className="py-3 px-4 text-slate-600">{a.eligibleGrades.join(', ')}</td>
                        <td className="py-3 px-4 font-bold text-purple-700">₹{a.appliedPricePerUnit}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{a.capacity}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{a.assignedTrainerName || 'Pending'}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {a.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Tab 5: Students */}
        {activeTab === 'students' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Enrolled Student Cadets ({schoolStudents.length})</h3>
              <span className="text-xs text-slate-500">Live roster synchronized with School Admin database</span>
            </div>

            {schoolStudents.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No individual student profiles seeded for this tenant yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Admission #</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Class & Section</th>
                      <th className="py-2.5 px-3">Parent Name & Phone</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schoolStudents.slice(0, 10).map(student => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{student.admissionNumber}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{student.firstName} {student.lastName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{student.gradeName} - {student.sectionName}</td>
                        <td className="py-2.5 px-3 text-slate-600">{student.parentName} ({student.parentPhone})</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {student.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 6: Staff */}
        {activeTab === 'staff' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Faculty & Administrative Staff ({schoolStaffMembers.length})</h3>
            {schoolStaffMembers.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No individual staff members recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {schoolStaffMembers.map(stf => (
                  <div key={stf.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">{stf.name}</span>
                      <span className="text-[11px] text-slate-500">{stf.designation} • {stf.department}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      {stf.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Tab 7: Finance */}
        {activeTab === 'finance' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Institutional Billing & Collections Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] font-semibold">Total Course Fees Invoiced</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">₹{((school.totalStudents * 1200) / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] font-semibold">Collections Received</span>
                <span className="text-xl font-black text-emerald-600 mt-1 block">₹{((school.totalStudents * 1050) / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] font-semibold">Pending Institutional Dues</span>
                <span className="text-xl font-black text-rose-600 mt-1 block">₹{((school.totalStudents * 150) / 100000).toFixed(2)} Lakhs</span>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 8: Reports */}
        {activeTab === 'reports' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Academic Performance & Analytics</h3>
            <p className="text-xs text-slate-500">Live STEM Lab telemetry, coding milestones, and attendance metrics for {school.name}.</p>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
              <span>View full curriculum telemetry in STEM Lab Directorate</span>
              <Link href="/school/stem">
                <Button size="sm" className="bg-indigo-600 text-white text-xs font-bold">Open STEM Telemetry</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Tab 9: Activity Logs */}
        {activeTab === 'activity' && (
          <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Institutional Audit Trail & Events</h3>
            {schoolActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent audit events recorded for this school.</p>
            ) : (
              <div className="space-y-3">
                {schoolActivities.map(act => (
                  <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-3">
                    <Activity className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{act.title}</span>
                        <span className="text-[10px] text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5">{act.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Edit School Profile Modal */}
        {isEditOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Edit School Profile</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">School Name</label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Phone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Principal Name</label>
                    <Input
                      value={editForm.principalName}
                      onChange={(e) => setEditForm({ ...editForm, principalName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">STEM Coordinator</label>
                    <Input
                      value={editForm.contactPersonName}
                      onChange={(e) => setEditForm({ ...editForm, contactPersonName: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">City</label>
                    <Input
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">State</label>
                    <Input
                      value={editForm.state}
                      onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Total Students</label>
                    <Input
                      type="number"
                      value={editForm.totalStudents}
                      onChange={(e) => setEditForm({ ...editForm, totalStudents: Number(e.target.value) })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Partnership Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                    Save Changes
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
