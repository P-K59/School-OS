"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { isRealSchool } from '@/lib/db/mock-data';
import { School, SchoolType, SchoolOnboardingStage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  ExternalLink,
  CreditCard,
  BookOpen,
  UserCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  MoreVertical,
  SlidersHorizontal,
  ChevronLeft,
  Key,
  Check,
  Copy,
  Lock,
  Sliders,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  FileText
} from 'lucide-react';
import { SchoolModulesConfig } from '@/lib/types';
import { WelcomeKitModal } from '@/components/admin/welcome-kit-modal';

export default function SchoolsManagementPage() {
  const router = useRouter();
  const { 
    schools, 
    setSchoolStatus, 
    toggleSchoolSuspension,
    recordAuditEvent, 
    updateSchoolModules, 
    resetSchoolAdminPassword,
    deleteSchool,
    revokeSchoolDeletion,
    approveSchool,
    rejectSchool,
    activities
  } = useAuth();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Status Change Confirmation Modal
  const [statusConfirmSchool, setStatusConfirmSchool] = useState<School | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [isProcessingSuspension, setIsProcessingSuspension] = useState(false);

  // Module Configuration State
  const [configSchool, setConfigSchool] = useState<School | null>(null);
  const [modulesDraft, setModulesDraft] = useState<SchoolModulesConfig>({});

  // Password Reset State
  const [resetSchool, setResetSchool] = useState<School | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessPass, setResetSuccessPass] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Delete School State
  const [deleteConfirmSchool, setDeleteConfirmSchool] = useState<School | null>(null);
  const [deleteInputCode, setDeleteInputCode] = useState('');
  const [deleteCascadeConfirmed, setDeleteCascadeConfirmed] = useState(false);
  const [isDeletingSchool, setIsDeletingSchool] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Application Review & Rejection
  const [reviewSchoolModal, setReviewSchoolModal] = useState<School | null>(null);
  const [rejectModalSchool, setRejectModalSchool] = useState<School | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Accidental Deletion Recovery State
  const [isRecoveryLogOpen, setIsRecoveryLogOpen] = useState(false);
  const [revokeNotification, setRevokeNotification] = useState<string | null>(null);

  // Onboarding Welcome Kit Modal
  const [welcomeKitSchool, setWelcomeKitSchool] = useState<School | null>(null);

  const deletedAuditEvents = useMemo(() => {
    const fromContext = (activities || []).filter(a => a.isRevokable && a.deletedSnapshot);
    if (fromContext.length > 0) return fromContext;

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_os_activities');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter((a: any) => a.isRevokable && a.deletedSnapshot);
          }
        }
      } catch {}
    }
    return [];
  }, [activities]);

  // Filter out demo seed schools so only real onboarded schools appear
  const realSchools = useMemo(() => {
    return schools.filter(isRealSchool);
  }, [schools]);

  // Extract unique states for filter from real schools
  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(realSchools.map(s => s.state).filter(Boolean)));
    return states.sort();
  }, [realSchools]);

  // Filtered and Sorted Schools
  const filteredSchools = useMemo(() => {
    return realSchools.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (s.principalName && s.principalName.toLowerCase().includes(q));

      const matchesState = selectedState === 'ALL' || s.state === selectedState;
      const matchesType = selectedType === 'ALL' || s.schoolType === selectedType;
      
      let matchesStatus = true;
      if (selectedStatus === 'ACTIVE') {
        matchesStatus = s.isActive && (s.onboardingStatus === 'ACTIVE' || !s.onboardingStatus);
      } else if (selectedStatus === 'PENDING_APPROVAL') {
        matchesStatus = s.onboardingStatus === 'PENDING_APPROVAL' || s.onboardingStatus === 'UNDER_REVIEW' || !s.isActive;
      } else if (selectedStatus === 'ONBOARDING') {
        matchesStatus = s.onboardingStatus === 'ONBOARDING' || s.onboardingStatus === 'IN_DISCUSSION' || s.onboardingStatus === 'DEMO_SCHEDULED' || s.onboardingStatus === 'CONTRACT_STAGE';
      } else if (selectedStatus === 'SUSPENDED') {
        matchesStatus = !s.isActive || s.onboardingStatus === 'SUSPENDED';
      }

      return matchesSearch && matchesState && matchesType && matchesStatus;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'students') {
        comparison = (a.totalStudents || 0) - (b.totalStudents || 0);
      } else if (sortBy === 'created') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [realSchools, searchQuery, selectedState, selectedType, selectedStatus, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSchools.length / pageSize) || 1;
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchools.slice(start, start + pageSize);
  }, [filteredSchools, currentPage, pageSize]);

  // Overall statistics from real schools
  const totalCount = realSchools.length;
  const activeCount = realSchools.filter(s => s.isActive && (s.onboardingStatus === 'ACTIVE' || !s.onboardingStatus)).length;
  const pendingCount = realSchools.filter(s => s.onboardingStatus === 'PENDING_APPROVAL' || s.onboardingStatus === 'UNDER_REVIEW' || !s.isActive).length;
  const suspendedCount = realSchools.filter(s => !s.isActive || s.onboardingStatus === 'SUSPENDED').length;

  const handleToggleStatus = (school: School) => {
    const newActive = !school.isActive;
    const newOnboarding: SchoolOnboardingStage = newActive ? 'ACTIVE' : 'SUSPENDED';
    setSchoolStatus(school.id, newActive, newOnboarding);
    setStatusConfirmSchool(null);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                Super Admin Directorate
              </span>
              <span className="text-xs text-slate-500 font-medium">• Central School Registry</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Building2 className="w-8 h-8 text-indigo-600" />
              School Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Manage partner institutions, configure regional course pricing, allocate master trainers, and monitor contracts.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => setIsRecoveryLogOpen(true)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-1.5 h-10 px-3.5 rounded-xl cursor-pointer"
              title="Audit trail and accidental deletion recovery log"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Recovery Log</span>
              {deletedAuditEvents.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-100 text-rose-700">
                  {deletedAuditEvents.length}
                </span>
              )}
            </Button>

            <Link href="/admin/pricing">
              <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold gap-2 h-10 px-4">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Pricing Engine
              </Button>
            </Link>

            <Link href="/admin/schools/new">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs gap-2 h-10 px-5 shadow-md shadow-indigo-500/20">
                <Plus className="w-4 h-4" />
                Add New School
              </Button>
            </Link>
          </div>
        </div>

        {/* Revoke Restoration Success Banner */}
        {revokeNotification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{revokeNotification}</span>
            </div>
            <button onClick={() => setRevokeNotification(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Schools</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCount}</h3>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">Across 6 States</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Partner Schools</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Live STEM Labs</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Awaiting Confirmation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Suspended / Inactive</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{suspendedCount}</h3>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">Contract Renewal Pending</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <Card className="p-4 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by school name, code (e.g. SCH-MAH-004), city, or principal..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-slate-50 border-slate-200 text-xs h-10 w-full rounded-xl focus:bg-white"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 w-full md:w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL" suppressHydrationWarning>All States ({schools.length})</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            {/* School Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE">State Board</option>
              <option value="IB">IB World</option>
              <option value="CAMBRIDGE">Cambridge</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 w-full md:w-36 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Sort Order Toggle */}
            <div className="flex items-center gap-1 w-full md:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none"
              >
                <option value="name">Sort: Name</option>
                <option value="students">Sort: Students</option>
                <option value="created">Sort: Registered Date</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="h-10 px-2.5 border-slate-200 text-slate-600 hover:bg-slate-100"
                title={`Order: ${sortOrder.toUpperCase()}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Schools Table */}
        <Card className="bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">School Name & Code</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Board / Type</th>
                  <th className="py-3 px-4">Students & Staff</th>
                  <th className="py-3 px-4">Courses Assigned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedSchools.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                      <p className="font-semibold text-slate-600">No schools matching your search criteria.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try resetting the filters or add a new school.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedSchools.map((school, index) => {
                    const rowNumber = (currentPage - 1) * pageSize + index + 1;
                    const isActive = school.isActive && (school.onboardingStatus === 'ACTIVE' || !school.onboardingStatus);
                    const isOnboarding = school.onboardingStatus && ['ONBOARDING', 'IN_DISCUSSION', 'DEMO_SCHEDULED', 'CONTRACT_STAGE'].includes(school.onboardingStatus);

                    return (
                      <tr key={school.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="py-3.5 px-4 font-bold text-slate-400">{rowNumber}</td>
                        <td className="py-3.5 px-4">
                          <Link href={`/admin/schools/${school.id}`} className="block group-hover:text-indigo-600 transition-colors">
                            <span className="font-bold text-slate-900 block leading-tight">{school.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] font-mono text-slate-500 inline-block">{school.code}</span>
                              {school.registrationId && (
                                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                                  {school.registrationId}
                                </span>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {school.city}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{school.state}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge 
                            variant="outline" 
                            className={`font-bold text-[10px] px-2 py-0.5 rounded-md ${
                              school.schoolType === 'CBSE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              school.schoolType === 'ICSE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              school.schoolType === 'IB' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {school.schoolType}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{(school.totalStudents || 0).toLocaleString()} <span className="text-[10px] font-normal text-slate-500">students</span></span>
                          <span className="text-[11px] text-slate-500">{school.totalStaff || 0} faculty</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <BookOpen className="w-3 h-3 text-indigo-500" />
                            {school.enrolledCoursesCount || 0} Courses
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {school.onboardingStatus === 'PENDING_APPROVAL' || !school.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                              Pending Approval
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Suspended
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {(!school.isActive || school.onboardingStatus === 'PENDING_APPROVAL') && (
                              <Button
                                size="sm"
                                onClick={() => setReviewSchoolModal(school)}
                                className="h-8 px-2.5 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs gap-1 cursor-pointer"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Review
                              </Button>
                            )}

                            <Link href={`/admin/schools/${school.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200"
                              >
                                View Details
                              </Button>
                            </Link>

                            <Link href={`/admin/schools/${school.id}/pricing`} title="Course Pricing">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Link href={`/admin/schools/${school.id}/courses`} title="Assign Courses">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Link href={`/admin/schools/${school.id}/trainers`} title="Trainer Allocation">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Users className="w-3.5 h-3.5" />
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setConfigSchool(school);
                                setModulesDraft(school.enabledModules || {});
                              }}
                              title="Configure School Modules"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setWelcomeKitSchool(school)}
                              title="Welcome Kit & Credentials"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setResetSchool(school);
                                setNewPasswordInput('');
                                setResetSuccessPass(null);
                                setIsCopied(false);
                              }}
                              title="Reset Admin Password"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setStatusConfirmSchool(school);
                                setSuspensionReason(school.suspensionDetails?.reason || '');
                              }}
                              title={school.isActive ? "Suspend School Access" : "Reactivate School Access"}
                              className={`h-8 w-8 p-0 ${school.isActive ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteConfirmSchool(school);
                                setDeleteInputCode('');
                                setDeleteCascadeConfirmed(false);
                                setDeleteErrorMessage(null);
                              }}
                              title="Delete School (Irreversible)"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50/80 border-t border-slate-200/80 text-xs text-slate-500">
            <div suppressHydrationWarning>
              Showing <span className="font-bold text-slate-800" suppressHydrationWarning>{paginatedSchools.length}</span> of{' '}
              <span className="font-bold text-slate-800" suppressHydrationWarning>{filteredSchools.length}</span> institutions
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="h-8 px-2.5 text-xs text-slate-600 border-slate-200"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="px-3 py-1 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg text-xs">
                Page {currentPage} of {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="h-8 px-2.5 text-xs text-slate-600 border-slate-200"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Status Confirmation Modal */}
        {statusConfirmSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfirmSchool.isActive ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {statusConfirmSchool.isActive ? 'Suspend Institutional Access?' : 'Activate School Tenant?'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{statusConfirmSchool.name} ({statusConfirmSchool.code})</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {statusConfirmSchool.isActive 
                  ? 'Suspending this school will immediately restrict school admin and teacher dashboard access. Existing enrollments and billing history will remain archived and secure.' 
                  : 'Activating this school will restore active portal access for teachers, students, and coordinators under their active contract period.'}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusConfirmSchool(null)}
                  className="text-xs border-slate-200 text-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggleStatus(statusConfirmSchool)}
                  className={`text-xs font-bold text-white ${statusConfirmSchool.isActive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {statusConfirmSchool.isActive ? 'Confirm Suspension' : 'Confirm Activation'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Configure School Modules Modal */}
        {configSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Modular Functionality Access</h3>
                    <p className="text-xs text-slate-500">{configSchool.name} &bull; <span className="font-mono font-semibold">{configSchool.code}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setConfigSchool(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-3 px-3.5 my-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p>
                  Unchecking any module (e.g. <strong>Transport</strong> or <strong>Fees & Finance</strong>) instantly removes it from this school&apos;s navigation menu and restricts portal access for their school administrators and teachers.
                </p>
              </div>

              {/* Module Toggles List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 py-2">
                {[
                  { key: 'admission' as const, label: 'Admissions & Inquiries', desc: 'Online admissions, application forms & inquiry pipeline' },
                  { key: 'students' as const, label: 'Student Directory', desc: 'Enrollment records, student profiles & roll list' },
                  { key: 'parents' as const, label: 'Parents Directory & Portal', desc: 'Parent contacts, communication & guardian credentials' },
                  { key: 'staff' as const, label: 'Staff & Teachers Management', desc: 'Teacher login creation, role assignments & duties' },
                  { key: 'attendance' as const, label: 'Daily & RFID Attendance', desc: 'Classroom attendance, RFID punch & leave logging' },
                  { key: 'fees' as const, label: 'Fees & Finance Module', desc: 'Fee structures, invoices, payment gateway & dues tracking' },
                  { key: 'academics' as const, label: 'Academics & Syllabus', desc: 'Lesson plans, syllabus tracking & curriculum' },
                  { key: 'timetable' as const, label: 'Timetable & Scheduling', desc: 'Class periods, teacher schedules & room allocations' },
                  { key: 'exams' as const, label: 'Exams & Grading System', desc: 'Exam schedules, marksheets & report card generation' },
                  { key: 'courses' as const, label: 'STEM & Robotics Courses', desc: 'InnovatMind robotics, AI curriculum & assignments' },
                  { key: 'notices' as const, label: 'Notice Board & Circulars', desc: 'School-wide announcements, alerts & circular broadcasts' },
                  { key: 'transport' as const, label: 'Transport & GPS Tracking', desc: 'Bus routes, driver allocations, stops & live vehicle tracking' },
                  { key: 'resources' as const, label: 'Resource & Inventory Planning', desc: 'Lab equipment, library books & inventory stock' },
                  { key: 'utilities' as const, label: 'Utilities & Maintenance', desc: 'Classroom maintenance, IT support & campus complaints' },
                ].map((mod) => {
                  const isEnabled = modulesDraft[mod.key] !== false;
                  return (
                    <div
                      key={mod.key}
                      onClick={() => setModulesDraft(prev => ({ ...prev, [mod.key]: !isEnabled }))}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isEnabled
                          ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                          : 'bg-slate-50/80 border-slate-200/60 opacity-60'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isEnabled ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                            {mod.label}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {isEnabled ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{mod.desc}</p>
                      </div>

                      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                        isEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
                      }`}>
                        <div className="bg-white w-4 h-4 rounded-full shadow-md transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Enable all
                      const allEnabled: SchoolModulesConfig = {
                        admission: true, students: true, parents: true, staff: true,
                        attendance: true, fees: true, academics: true, timetable: true,
                        exams: true, courses: true, notices: true, transport: true,
                        resources: true, utilities: true
                      };
                      setModulesDraft(allEnabled);
                    }}
                    className="text-xs text-slate-600 border-slate-200 h-9"
                  >
                    Select All
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfigSchool(null)}
                    className="text-xs text-slate-600 border-slate-200 h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (!configSchool) return;
                      await updateSchoolModules(configSchool.id, modulesDraft);
                      setConfigSchool(null);
                    }}
                    className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-4 shadow-sm"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Reset School Admin Password Modal */}
        {resetSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Reset Admin Password</h3>
                    <p className="text-xs text-slate-500">{resetSchool.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setResetSchool(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {resetSuccessPass ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-emerald-950">Password Successfully Updated!</h4>
                    <p className="text-xs text-emerald-700">
                      The School Admin can now log in using these credentials at <span className="font-mono font-semibold">/login</span>.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Login ID / Email</span>
                      <p className="text-xs font-mono font-bold text-slate-800 break-all">
                        {resetSchool.adminCredentials?.email || resetSchool.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</span>
                      <p className="text-sm font-mono font-black text-indigo-600 tracking-wider">
                        {resetSuccessPass}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const text = `School OS Login Details\nSchool: ${resetSchool.name}\nLogin ID / Email: ${resetSchool.adminCredentials?.email || resetSchool.email}\nPassword: ${resetSuccessPass}\nLogin Portal: ${window.location.origin}/login`;
                        navigator.clipboard.writeText(text);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2500);
                      }}
                      className="flex-1 text-xs font-semibold border-slate-300 h-10 gap-2"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {isCopied ? 'Copied to Clipboard' : 'Copy Credentials'}
                    </Button>
                    <Button
                      onClick={() => setResetSchool(null)}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-5"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Account Email</span>
                    <p className="text-xs font-mono font-bold text-slate-800 break-all">
                      {resetSchool.adminCredentials?.email || resetSchool.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Set New Password</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Enter minimum 6 characters..."
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="text-xs font-mono h-10 rounded-xl bg-slate-50 border-slate-200 focus:bg-white flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const randPass = 'Admin@' + Math.floor(1000 + Math.random() * 9000);
                          setNewPasswordInput(randPass);
                        }}
                        className="text-xs font-semibold h-10 px-3 border-slate-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        Auto Generate
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setResetSchool(null)}
                      className="text-xs text-slate-600 border-slate-200 h-9"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!newPasswordInput || newPasswordInput.trim().length < 6}
                      onClick={async () => {
                        const pass = newPasswordInput.trim();
                        await resetSchoolAdminPassword(resetSchool.id, pass);
                        setResetSuccessPass(pass);
                      }}
                      className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white h-9 px-4 shadow-sm"
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Delete School Confirmation Modal */}
        {deleteConfirmSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-rose-200 space-y-5 animate-in fade-in zoom-in-95">
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
                  <span className="font-bold text-slate-900">{deleteConfirmSchool.name}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-semibold">Registration ID / Code:</span>
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {deleteConfirmSchool.registrationId || deleteConfirmSchool.code}
                  </span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-500 font-semibold">Location:</span>
                  <span className="font-medium text-slate-700">{deleteConfirmSchool.city}, {deleteConfirmSchool.state}</span>
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

              {deleteErrorMessage && (
                <div className="p-3 rounded-xl bg-rose-100 text-rose-800 text-xs font-semibold">
                  {deleteErrorMessage}
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
                    Type <strong className="font-mono text-rose-600">{deleteConfirmSchool.code}</strong> or <strong className="font-mono text-rose-600">DELETE</strong> to confirm:
                  </label>
                  <Input
                    type="text"
                    placeholder={`Type ${deleteConfirmSchool.code}`}
                    value={deleteInputCode}
                    onChange={(e) => setDeleteInputCode(e.target.value)}
                    className="text-xs font-mono h-9 bg-slate-50 border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmSchool(null)}
                  disabled={isDeletingSchool}
                  className="text-xs text-slate-600 border-slate-200 h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={
                    !deleteCascadeConfirmed ||
                    (deleteInputCode.trim().toUpperCase() !== deleteConfirmSchool.code.toUpperCase() &&
                     deleteInputCode.trim().toUpperCase() !== 'DELETE') ||
                    isDeletingSchool
                  }
                  onClick={async () => {
                    setIsDeletingSchool(true);
                    setDeleteErrorMessage(null);
                    const res = await deleteSchool(deleteConfirmSchool.id);
                    setIsDeletingSchool(false);
                    if (res.success) {
                      setDeleteConfirmSchool(null);
                    } else {
                      setDeleteErrorMessage(res.error || 'Failed to delete school tenant. Please try again.');
                    }
                  }}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isDeletingSchool ? 'Deleting Records...' : 'Permanently Delete School'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Application Review Modal */}
        {reviewSchoolModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Application
                    </span>
                    {reviewSchoolModal.registrationId && (
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {reviewSchoolModal.registrationId}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{reviewSchoolModal.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Submitted on {new Date(reviewSchoolModal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setReviewSchoolModal(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Institution Details</span>
                  <div><strong>Affiliation:</strong> {reviewSchoolModal.schoolType} Board</div>
                  <div><strong>Tenant Code:</strong> <span className="font-mono">{reviewSchoolModal.code}</span></div>
                  <div><strong>Location:</strong> {reviewSchoolModal.city}, {reviewSchoolModal.state}</div>
                  <div><strong>Address:</strong> {reviewSchoolModal.address || 'N/A'} ({reviewSchoolModal.postalCode || ''})</div>
                  <div><strong>Capacity:</strong> {(reviewSchoolModal as any).studentCapacity || reviewSchoolModal.totalStudents || 0} students</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Primary Administrative Contact</span>
                  <div><strong>Principal / Head:</strong> {reviewSchoolModal.principalName || 'Institutional Head'}</div>
                  <div><strong>Official Email:</strong> <span className="font-mono break-all">{reviewSchoolModal.email}</span></div>
                  <div><strong>Contact Phone:</strong> {reviewSchoolModal.phone || 'N/A'}</div>
                  {reviewSchoolModal.adminCredentials?.email && (
                    <div className="pt-2 border-t border-slate-200 text-indigo-900">
                      <strong>Designated Admin Login:</strong>
                      <span className="block font-mono text-[11px] text-indigo-600 mt-0.5 break-all">
                        {reviewSchoolModal.adminCredentials.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Approval &amp; Tenant Activation</span>
                </div>
                <p>
                  Approving this request will immediately provision the school tenant workspace, activate administrative credentials, and allow the school to sign in and configure their institution.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewSchoolModal(null)}
                  className="text-xs border-slate-200 text-slate-600 h-9"
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const sch = reviewSchoolModal;
                    setReviewSchoolModal(null);
                    setRejectModalSchool(sch);
                    setRejectReason('');
                  }}
                  className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 h-9 font-bold"
                >
                  Decline Application
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingApproval}
                  onClick={async () => {
                    setIsProcessingApproval(true);
                    try {
                      const res = await approveSchool(reviewSchoolModal.id);
                      if (res.success && res.school) {
                        const approved = res.school;
                        setReviewSchoolModal(null);
                        setWelcomeKitSchool(approved);
                      } else {
                        alert(res.error || 'Failed to approve school application');
                      }
                    } catch (err: any) {
                      alert(err.message || 'Error occurred while approving school');
                    } finally {
                      setIsProcessingApproval(false);
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessingApproval ? 'Activating...' : 'Approve & Activate Tenant'}</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectModalSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Decline Institutional Request</h3>
                  <p className="text-xs text-slate-500">{rejectModalSchool.name}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Reason for Rejection (Optional Notes)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Incomplete accreditation documents or duplicate application..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectModalSchool(null)}
                  className="text-xs text-slate-600 border-slate-200 h-9"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={isProcessingApproval}
                  onClick={async () => {
                    setIsProcessingApproval(true);
                    try {
                      await rejectSchool(rejectModalSchool.id, rejectReason);
                      setRejectModalSchool(null);
                    } finally {
                      setIsProcessingApproval(false);
                    }
                  }}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white h-9 px-4 rounded-xl shadow-sm"
                >
                  Confirm Decline
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* School Suspension / Reactivation Modal */}
        {statusConfirmSchool && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  statusConfirmSchool.isActive 
                    ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                }`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {statusConfirmSchool.isActive ? 'Suspend School Access' : 'Reactivate School Access'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{statusConfirmSchool.name} ({statusConfirmSchool.code})</p>
                </div>
              </div>

              {statusConfirmSchool.isActive ? (
                <>
                  <p className="text-xs text-slate-600 font-medium">
                    Temporarily freeze portal access for this school. All administrators and students will be prevented from logging in. <strong className="text-slate-900">All student, course, and fee records remain completely preserved.</strong>
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Reason for Suspension</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Annual subscription fee overdue, administrative compliance audit..."
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
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
                  {statusConfirmSchool.suspensionDetails?.reason && (
                    <div className="text-[11px] text-emerald-700 mt-1 pt-1 border-t border-emerald-200/60">
                      Previous suspension reason: &ldquo;{statusConfirmSchool.suspensionDetails.reason}&rdquo;
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusConfirmSchool(null)}
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
                        statusConfirmSchool.id,
                        statusConfirmSchool.isActive,
                        suspensionReason
                      );
                      setStatusConfirmSchool(null);
                    } finally {
                      setIsProcessingSuspension(false);
                    }
                  }}
                  className={`text-xs font-extrabold h-9 px-4 rounded-xl shadow-sm text-white cursor-pointer ${
                    statusConfirmSchool.isActive 
                      ? 'bg-amber-600 hover:bg-amber-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {statusConfirmSchool.isActive ? 'Confirm Suspension' : 'Confirm Reactivation'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Deletion & Recovery Log Modal */}
        {isRecoveryLogOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <Card className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Deletion Audit &amp; Recovery Log</h3>
                    <p className="text-xs text-slate-500">Revoke accidental deletions and restore institutional tenants</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRecoveryLogOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {deletedAuditEvents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium space-y-2">
                  <RotateCcw className="w-8 h-8 mx-auto text-slate-300 opacity-60" />
                  <p className="font-bold text-slate-600">No deleted school logs found.</p>
                  <p className="text-slate-400">All institutional records are intact or have already been restored.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deletedAuditEvents.map(event => {
                    const snap: School | undefined = event.deletedSnapshot;
                    return (
                      <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-sm">{snap?.name || event.title}</span>
                            {snap?.code && (
                              <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                {snap.code}
                              </span>
                            )}
                            {snap?.registrationId && (
                              <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                {snap.registrationId}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            {snap?.city ? `${snap.city}, ${snap.state} • ` : ''}Deleted at {event.time}
                          </p>
                          <p className="text-[11px] text-slate-600 italic">
                            &quot;{event.detail}&quot;
                          </p>
                        </div>

                        <Button
                          size="sm"
                          onClick={async () => {
                            const res = await revokeSchoolDeletion(event.id);
                            if (res.success) {
                              setRevokeNotification(`Accidental deletion revoked! School "${res.restoredSchool?.name}" successfully restored.`);
                              setIsRecoveryLogOpen(false);
                              setTimeout(() => setRevokeNotification(null), 6000);
                            }
                          }}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer shadow-xs shrink-0"
                          title="Restore this school and revoke deletion"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revoke Deletion</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRecoveryLogOpen(false)}
                  className="text-xs border-slate-200 text-slate-600 h-9"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Onboarding Welcome Kit & Credential Dispatcher Modal */}
        <WelcomeKitModal
          school={welcomeKitSchool}
          isOpen={Boolean(welcomeKitSchool)}
          onClose={() => setWelcomeKitSchool(null)}
          onDispatched={(updated) => setWelcomeKitSchool(updated)}
        />
      </div>
    </AppShell>
  );
}
