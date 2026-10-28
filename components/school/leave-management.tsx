"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  FileText,
  UserMinus,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export interface LeaveRequest {
  id: string;
  applicantName: string;
  applicantType: 'TEACHER' | 'STAFF' | 'STUDENT';
  classNameOrDept: string;
  leaveType: 'CASUAL' | 'SICK' | 'URGENT' | 'MATERNITY' | 'DUTY';
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  contactPhone?: string;
  substituteTeacher?: string;
}

export function LeaveManagement() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial leave requests with localStorage persistence
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_os_leave_requests');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'lv-1',
        applicantName: 'Dr. Farhan Qureshi',
        applicantType: 'TEACHER',
        classNameOrDept: 'English Faculty (High School)',
        leaveType: 'SICK',
        startDate: '12 Oct 2026',
        endDate: '13 Oct 2026',
        daysCount: 2,
        reason: 'Severe fever and viral infection; physician advised 2 days of bed rest.',
        status: 'PENDING',
        appliedOn: 'Today, 7:15 AM',
        contactPhone: '+91 98765 43210',
        substituteTeacher: 'Anita Joshi requested for Period 3'
      },
      {
        id: 'lv-2',
        applicantName: 'Kavita Singh',
        applicantType: 'TEACHER',
        classNameOrDept: 'Social Studies & Primary Wing Lead',
        leaveType: 'URGENT',
        startDate: '12 Oct 2026',
        endDate: '12 Oct 2026',
        daysCount: 1,
        reason: 'Urgent civil documentation & administrative verification at district registry.',
        status: 'PENDING',
        appliedOn: 'Yesterday, 8:45 PM',
        contactPhone: '+91 98765 98765'
      },
      {
        id: 'lv-3',
        applicantName: 'Rohan Verma (Student)',
        applicantType: 'STUDENT',
        classNameOrDept: 'Class 7 - Section A',
        leaveType: 'SICK',
        startDate: '12 Oct 2026',
        endDate: '14 Oct 2026',
        daysCount: 3,
        reason: 'Recovery from acute bronchitis. Medical certificate submitted by guardian Manoj Verma.',
        status: 'PENDING',
        appliedOn: 'Today, 8:00 AM',
        contactPhone: '+91 98123 45678'
      },
      {
        id: 'lv-4',
        applicantName: 'Rajesh Kumar',
        applicantType: 'TEACHER',
        classNameOrDept: 'Senior Mathematics Faculty',
        leaveType: 'CASUAL',
        startDate: '08 Oct 2026',
        endDate: '09 Oct 2026',
        daysCount: 2,
        reason: 'Attending family wedding ceremony out of town.',
        status: 'APPROVED',
        appliedOn: '06 Oct 2026',
        substituteTeacher: 'Arranged lesson assignments in advance'
      },
      {
        id: 'lv-5',
        applicantName: 'Manoj Transport Driver',
        applicantType: 'STAFF',
        classNameOrDept: 'School Bus Route #4',
        leaveType: 'CASUAL',
        startDate: '05 Oct 2026',
        endDate: '05 Oct 2026',
        daysCount: 1,
        reason: 'Annual commercial vehicle inspection and fitness renewal at RTO.',
        status: 'APPROVED',
        appliedOn: '04 Oct 2026'
      }
    ];
  });

  // Modal State for New Leave Form
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantType, setApplicantType] = useState<'TEACHER' | 'STAFF' | 'STUDENT'>('TEACHER');
  const [classNameOrDept, setClassNameOrDept] = useState('Primary Wing Faculty');
  const [leaveType, setLeaveType] = useState<'CASUAL' | 'SICK' | 'URGENT'>('CASUAL');
  const [startDate, setStartDate] = useState('Today');
  const [daysCount, setDaysCount] = useState(1);
  const [reason, setReason] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('school_os_leave_requests', JSON.stringify(leaveRequests));
    } catch {}
  }, [leaveRequests]);

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim()) return;

    const newLeave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      applicantName: applicantName.trim(),
      applicantType,
      classNameOrDept: classNameOrDept.trim() || 'General Staff',
      leaveType,
      startDate,
      endDate: daysCount === 1 ? startDate : `${startDate} (+${daysCount - 1} days)`,
      daysCount,
      reason: reason.trim() || 'Leave of absence officially requested.',
      status: 'PENDING',
      appliedOn: 'Just now',
      contactPhone: contactPhone.trim() || undefined
    };

    setLeaveRequests([newLeave, ...leaveRequests]);
    setApplicantName('');
    setReason('');
    setContactPhone('');
    setShowApplyModal(false);
  };

  const handleApprove = (id: string) => {
    setLeaveRequests(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  };

  const handleReject = (id: string) => {
    setLeaveRequests(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED' } : item));
  };

  const filteredRequests = leaveRequests.filter(req => {
    const matchesTab = activeTab === 'ALL' || req.status === activeTab;
    const matchesSearch = req.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.classNameOrDept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const pendingCount = leaveRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="space-y-6">
      {/* Clean Executive Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Absence Requests
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Leave Approvals
          </h2>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-amber-200/90 bg-amber-50/20 shadow-xs">
          <span className="text-xs font-semibold text-amber-800 block uppercase tracking-wider">Pending Review</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 mt-1 flex items-baseline gap-2">
            <span>{pendingCount}</span>
            <span className="text-xs text-amber-700 font-medium">Action Required</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-200/90 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 block uppercase tracking-wider">Approved Leaves</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 mt-1 flex items-baseline gap-2">
            <span>{approvedCount}</span>
            <span className="text-xs text-emerald-700 font-medium">Archived</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Absent Today</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>2 Faculty</span>
            <span className="text-xs text-slate-500 font-normal">Substitutes active</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Annual Quota</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-baseline gap-2">
            <span>12 Casual</span>
            <span className="text-xs text-slate-500 font-normal">10 Medical / Year</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'PENDING', label: `Pending Review (${pendingCount})`, highlight: pendingCount > 0 },
            { id: 'APPROVED', label: `Approved History (${approvedCount})` },
            { id: 'REJECTED', label: 'Declined' },
            { id: 'ALL', label: 'All Applications' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : tab.highlight
                  ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search applicant name or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Leave Cards List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-900">No Applications in this View</h4>
            <p className="text-xs text-slate-500 mt-1 font-normal">All pending requests have been reviewed.</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isRejected = req.status === 'REJECTED';

            return (
              <div
                key={req.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-xs ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-500/10'
                    : isApproved
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Applicant details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                        req.applicantType === 'TEACHER'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : req.applicantType === 'STUDENT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {req.applicantType}
                      </span>

                      <h4 className="text-sm sm:text-base font-bold text-slate-900">
                        {req.applicantName}
                      </h4>

                      <span className="text-xs text-slate-500 font-medium">
                        ({req.classNameOrDept})
                      </span>

                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {req.leaveType} Leave
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                      <span className="flex items-center gap-1 text-slate-900">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Duration:</strong> {req.startDate} to {req.endDate}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold text-[11px]">
                        {req.daysCount} {req.daysCount === 1 ? 'Day' : 'Days'}
                      </span>
                      <span className="text-slate-400 font-normal">
                        Applied: {req.appliedOn}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50 rounded-xl p-2.5 border border-slate-100 font-normal leading-relaxed">
                      "{req.reason}"
                    </p>

                    {req.substituteTeacher && (
                      <p className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                        Substitute Arrangement: {req.substituteTeacher}
                      </p>
                    )}

                    {req.contactPhone && (
                      <p className="text-[11px] text-slate-500 font-normal">
                        Emergency Phone: <strong className="text-slate-700 font-medium">{req.contactPhone}</strong>
                      </p>
                    )}
                  </div>

                  {/* Right: Big Touch Friendly Action Buttons (3D Tactile) */}
                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="btn-3d-secondary flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <X className="w-4 h-4 text-rose-500" />
                          <span>Decline</span>
                        </button>

                        <button
                          onClick={() => handleApprove(req.id)}
                          className="btn-3d-success flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Approve Leave ✓</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Approved
                      </span>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Apply Leave */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Submit Leave Application
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Applicant Category *
                  </label>
                  <select
                    value={applicantType}
                    onChange={(e: any) => setApplicantType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="TEACHER">Faculty / Teacher</option>
                    <option value="STAFF">Administrative & Support Staff</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Leave Category *
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e: any) => setLeaveType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-normal bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CASUAL">Casual Leave</option>
                    <option value="SICK">Medical / Sick Leave</option>
                    <option value="URGENT">Personal Urgent Matter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Full Name of Applicant *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar or Student Aarav"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Class / Department
                  </label>
                  <input
                    type="text"
                    value={classNameOrDept}
                    onChange={(e) => setClassNameOrDept(e.target.value)}
                    placeholder="e.g. Mathematics, Class 7"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="e.g. 15 Oct 2026"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={daysCount}
                    onChange={(e) => setDaysCount(parseInt(e.target.value) || 1)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Reason for Absence *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="State the reason for absence..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Contact Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765-00000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
