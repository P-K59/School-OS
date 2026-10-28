"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
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
  ChevronLeft
} from 'lucide-react';

export default function SchoolsManagementPage() {
  const router = useRouter();
  const { schools, setSchoolStatus, recordAuditEvent } = useAuth();

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

  // Extract unique states for filter
  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(schools.map(s => s.state).filter(Boolean)));
    return states.sort();
  }, [schools]);

  // Filtered and Sorted Schools
  const filteredSchools = useMemo(() => {
    return schools.filter(s => {
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
  }, [schools, searchQuery, selectedState, selectedType, selectedStatus, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredSchools.length / pageSize) || 1;
  const paginatedSchools = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSchools.slice(start, start + pageSize);
  }, [filteredSchools, currentPage, pageSize]);

  // Overall statistics
  const totalCount = schools.length;
  const activeCount = schools.filter(s => s.isActive && (s.onboardingStatus === 'ACTIVE' || !s.onboardingStatus)).length;
  const onboardingCount = schools.filter(s => s.onboardingStatus && ['ONBOARDING', 'IN_DISCUSSION', 'DEMO_SCHEDULED', 'CONTRACT_STAGE'].includes(s.onboardingStatus)).length;
  const suspendedCount = schools.filter(s => !s.isActive || s.onboardingStatus === 'SUSPENDED').length;

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

          <div className="flex items-center gap-3">
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
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Onboarding</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{onboardingCount}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-0.5">Pipeline Stage</p>
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
              <option value="ALL">All States ({schools.length})</option>
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
                            <span className="text-[11px] font-mono text-slate-500 mt-0.5 inline-block">{school.code}</span>
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
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          ) : isOnboarding ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              {school.onboardingStatus?.replace('_', ' ')}
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
                              onClick={() => setStatusConfirmSchool(school)}
                              title={school.isActive ? "Suspend School" : "Activate School"}
                              className={`h-8 w-8 p-0 ${school.isActive ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"}`}
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
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
            <div>
              Showing <span className="font-bold text-slate-800">{paginatedSchools.length}</span> of{' '}
              <span className="font-bold text-slate-800">{filteredSchools.length}</span> institutions
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
      </div>
    </AppShell>
  );
}
