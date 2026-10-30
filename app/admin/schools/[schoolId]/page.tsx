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
  Layers,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { WelcomeKitModal } from '@/components/admin/welcome-kit-modal';

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
    recordAuditEvent,
    deleteSchool,
    toggleSchoolSuspension
  } = useAuth();

  // Active tab state
  const initialTab = (searchParams.get('tab') as SchoolTab) || 'overview';
  const [activeTab, setActiveTab] = useState<SchoolTab>(initialTab);

  // Find school by ID, code, or registrationId
  const school = useMemo(() => {
    return schools.find(s => s.id === schoolId || s.code === schoolId || s.registrationId === schoolId) || null;
  }, [schools, schoolId]);

  // Edit School Profile Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: school?.name || '',
    email: school?.email || '',
    phone: school?.phone || '',
    principalName: school?.principalName || '',
    contactPersonName: school?.contactPersonName || '',
    contactPersonPhone: school?.contactPersonPhone || '',
    contactPersonEmail: school?.contactPersonEmail || '',
    city: school?.city || '',
    state: school?.state || '',
    address: school?.address || '',
    postalCode: school?.postalCode || '',
    totalStudents: school?.totalStudents || 0,
    totalStaff: school?.totalStaff || 0,
    contractStartDate: school?.contractStartDate || '',
    contractEndDate: school?.contractEndDate || '',
    notes: school?.notes || '',
  });

  // Delete School State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteCodeInput, setDeleteCodeInput] = useState('');
  const [deleteCascadeConfirmed, setDeleteCascadeConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Welcome Kit Modal State
  const [isWelcomeKitOpen, setIsWelcomeKitOpen] = useState(false);

  // Suspension Modal State
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [suspensionReasonInput, setSuspensionReasonInput] = useState('');
  const [isProcessingSuspension, setIsProcessingSuspension] = useState(false);

  // School-specific course assignments
  const schoolAssignments = useMemo(() => {
    return schoolCourseAssignments.filter(a => a.schoolId === school?.id);
  }, [schoolCourseAssignments, school?.id]);

  // School-specific pricing overrides
  const schoolOverrides = useMemo(() => {
    return schoolPricingOverrides.filter(o => o.schoolId === school?.id);
  }, [schoolPricingOverrides, school?.id]);

  // School-specific trainer allocations
  const schoolAllocations = useMemo(() => {
    return trainerAllocations.filter(a => a.schoolId === school?.id);
  }, [trainerAllocations, school?.id]);

  // School audit activities
  const schoolActivities = useMemo(() => {
    return activities.filter(a => a.schoolId === school?.id);
  }, [activities, school?.id]);

  // School students & staff
  const schoolStudents = useMemo(() => {
    return students.filter(s => s.schoolId === school?.id);
  }, [students, school?.id]);

  const schoolStaffMembers = useMemo(() => {
    return staff.filter(s => s.schoolId === school?.id);
  }, [staff, school?.id]);

  // Estimated contract value calculation
  const estimatedContractValue = useMemo(() => {
    return schoolAssignments.reduce((acc, curr) => {
      return acc + (curr.appliedPricePerUnit * (curr.capacity || school?.totalStudents || 0));
    }, 0);
  }, [schoolAssignments, school?.totalStudents]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!school) return;
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

  if (!school) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">School Tenant Not Found</h2>
          <p className="text-sm text-slate-500">
            No active or registered institution was found matching identifier &quot;{schoolId}&quot;.
          </p>
          <Link href="/admin/schools">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-10 px-5 rounded-xl cursor-pointer">
              Return to School Registry
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWelcomeKitOpen(true)}
                className="bg-indigo-950/40 border-indigo-800/80 hover:bg-indigo-900/60 text-indigo-300 hover:text-white text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                Welcome Kit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSuspensionModalOpen(true);
                  setSuspensionReasonInput(school.suspensionDetails?.reason || '');
                }}
                className={`text-xs font-semibold gap-1.5 cursor-pointer ${
                  school.isActive
                    ? 'bg-amber-950/40 border-amber-800/80 hover:bg-amber-900/60 text-amber-300 hover:text-white'
                    : 'bg-emerald-950/40 border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-300 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {school.isActive ? 'Suspend Access' : 'Reactivate Access'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsDeleteModalOpen(true);
                  setDeleteCodeInput('');
                  setDeleteCascadeConfirmed(false);
                  setDeleteError(null);
                }}
                className="bg-rose-950/40 border-rose-800/80 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-semibold gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete School
              </Button>
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

        {/* School Suspension Alert Banner */}
        {(!school.isActive || school.suspensionDetails?.isSuspended) && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-amber-950 flex items-center gap-2">
                  <span>School Portal Access is Currently Suspended</span>
                  <span className="text-[10px] font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    {school.suspensionDetails?.suspendedAt ? `Since ${new Date(school.suspensionDetails.suspendedAt).toLocaleDateString()}` : 'Suspended'}
                  </span>
                </div>
                <p className="text-amber-800">
                  School administrators and students under this institution cannot log in. All academic and fee data is safely preserved.
                  {school.suspensionDetails?.reason && (
                    <span className="block font-semibold mt-0.5">&ldquo;Reason: {school.suspensionDetails.reason}&rdquo;</span>
                  )}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={async () => {
                await toggleSchoolSuspension(school.id, false);
              }}
              className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs h-8 px-4 rounded-xl shrink-0 cursor-pointer shadow-xs"
            >
              Lift Suspension
            </Button>
          </div>
        )}

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
        {/* Delete School Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-rose-200 space-y-5 animate-in fade-in zoom-in-95 text-slate-900">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Delete School Tenant</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Irreversible removal of institutional records and operational data
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-semibold">School Name:</span>
                  <span className="font-bold text-slate-900">{school.name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-semibold">Registration ID / Code:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {school.registrationId || school.code}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-semibold">Location:</span>
                  <span className="font-medium text-slate-700">{school.city}, {school.state}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <span className="font-bold block">Scope of Deletion:</span>
                <p>
                  Deleting this tenant permanently purges all school-specific students, fee invoices, payments, attendance records, course enrollments, and teacher assignments.
                </p>
                <p className="font-semibold text-rose-800">
                  ✓ The Super Admin account and shared course catalog will NOT be deleted.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold">
                  {deleteError}
                </div>
              )}

              <div className="space-y-3 pt-1">
                <label className="flex items-start gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={deleteCascadeConfirmed}
                    onChange={(e) => setDeleteCascadeConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>
                    I confirm that I want to delete this school and all its dependent operational records permanently.
                  </span>
                </label>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Type <strong className="font-mono text-rose-600">{school.code}</strong> or <strong className="font-mono text-rose-600">DELETE</strong> to confirm:
                  </label>
                  <Input
                    type="text"
                    placeholder={`Type ${school.code}`}
                    value={deleteCodeInput}
                    onChange={(e) => setDeleteCodeInput(e.target.value)}
                    className="text-xs font-mono h-9 bg-slate-50 border-slate-200 focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="text-xs text-slate-600 border-slate-200 h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={
                    !deleteCascadeConfirmed ||
                    (deleteCodeInput.trim().toUpperCase() !== school.code.toUpperCase() &&
                     deleteCodeInput.trim().toUpperCase() !== 'DELETE') ||
                    isDeleting
                  }
                  onClick={async () => {
                    setIsDeleting(true);
                    setDeleteError(null);
                    const res = await deleteSchool(school.id);
                    setIsDeleting(false);
                    if (res.success) {
                      setIsDeleteModalOpen(false);
                      router.push('/admin/schools');
                    } else {
                      setDeleteError(res.error || 'Failed to delete school tenant. Please try again.');
                    }
                  }}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting Records...' : 'Permanently Delete School'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Suspension Modal */}
        {isSuspensionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  school.isActive ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {school.isActive ? 'Suspend School Access' : 'Reactivate School Access'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{school.name} ({school.code})</p>
                </div>
              </div>

              {school.isActive ? (
                <>
                  <p className="text-xs text-slate-600 font-medium">
                    Temporarily freeze portal access for this school. All administrators and students will be prevented from logging in. <strong className="text-slate-900">All student, course, and fee records remain completely preserved.</strong>
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Reason for Suspension</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Annual subscription fee overdue, administrative compliance audit..."
                      value={suspensionReasonInput}
                      onChange={(e) => setSuspensionReasonInput(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium text-slate-900"
                    />
                  </div>
                </>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 font-medium">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Restore Active Operations</span>
                  </div>
                  <p>
                    Lifting suspension will immediately allow school administrators and students to log in and access their portals.
                  </p>
                  {school.suspensionDetails?.reason && (
                    <div className="text-[11px] text-emerald-700 mt-1 pt-1 border-t border-emerald-200/60">
                      Previous suspension reason: &ldquo;{school.suspensionDetails.reason}&rdquo;
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSuspensionModalOpen(false)}
                  className="text-xs text-slate-600 border-slate-200 h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingSuspension}
                  onClick={async () => {
                    setIsProcessingSuspension(true);
                    try {
                      await toggleSchoolSuspension(
                        school.id,
                        school.isActive,
                        suspensionReasonInput
                      );
                      setIsSuspensionModalOpen(false);
                    } finally {
                      setIsProcessingSuspension(false);
                    }
                  }}
                  className={`text-xs font-extrabold h-9 px-4 rounded-xl shadow-sm text-white cursor-pointer ${
                    school.isActive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {school.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Onboarding Welcome Kit & Credential Dispatcher Modal */}
        <WelcomeKitModal
          school={school}
          isOpen={isWelcomeKitOpen}
          onClose={() => setIsWelcomeKitOpen(false)}
        />
      </div>
    </AppShell>
  );
}
