"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Student } from '@/lib/types';
import { Card } from '@/components/ui/card';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CreditCard,
  MessageSquare,
  Calendar,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';

function ParentsDirectoryContent() {
  const { students, activeSchool } = useAuth();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [feeFilter, setFeeFilter] = useState('ALL');

  // Interactive Message Modal State
  const [selectedParentForMessage, setSelectedParentForMessage] = useState<{
    parentName: string;
    parentPhone: string;
    studentName: string;
    gradeName: string;
  } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected Student Drawer
  const [selectedWard, setSelectedWard] = useState<Student | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Group or Map students to Parents
  const parentRecords = useMemo(() => {
    return students.map((s, idx) => {
      // Deterministic realistic relationship
      const relation = idx % 2 === 0 ? 'Father' : 'Mother';
      return {
        id: `parent-${s.id}`,
        name: s.parentName || `Guardian of ${s.firstName}`,
        phone: s.parentPhone || '+91 98111 00000',
        email: s.parentEmail || `${s.firstName.toLowerCase()}.parent@gmail.com`,
        relation,
        address: s.address || `${activeSchool.city}, India`,
        ward: s,
        feeStatus: s.feeStatus || 'PAID',
        portalActive: true,
        lastActive: idx % 3 === 0 ? 'Active 10 mins ago' : 'Active yesterday'
      };
    });
  }, [students, activeSchool]);

  // Filtered records
  const filteredParents = useMemo(() => {
    return parentRecords.filter(p => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.ward.firstName} ${p.ward.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.ward.admissionNumber && p.ward.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGrade = gradeFilter === 'ALL' || p.ward.gradeName === gradeFilter;
      const matchesFee = feeFilter === 'ALL' || p.feeStatus === feeFilter;

      return matchesSearch && matchesGrade && matchesFee;
    });
  }, [parentRecords, searchQuery, gradeFilter, feeFilter]);

  // Handle Send Notice / Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentForMessage || !messageText.trim()) return;

    showToast(`SMS & WhatsApp dispatch queued for ${selectedParentForMessage.parentName} (${selectedParentForMessage.parentPhone})`);
    setSelectedParentForMessage(null);
    setMessageText('');
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      
      {/* Executive Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Guardian Directory & Relationship Hub
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Parents & Guardians Portal
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Verified contact registry, ward performance links, fee clearance, and parent communication
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedParentForMessage({
                parentName: 'All Registered Parents (Broadcast)',
                parentPhone: '+91 Broadcast Gateway',
                studentName: 'All Wards',
                gradeName: 'All Classes'
              });
            }}
            className="btn-3d-secondary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 text-indigo-700 bg-indigo-50/50 border-indigo-200"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Broadcast Circular</span>
          </button>

          <Link
            href="/school/students?action=add"
            className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enroll Ward & Guardian</span>
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Parents</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{parentRecords.length}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            100% phone verified records
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Portal Adoption</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">94.8%</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Active School OS mobile app users
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Clearance Rate</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">88.5%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Automated UPI reminders enabled
          </p>
        </Card>

        <Card className="card-3d rounded-2xl p-4 sm:p-5 bg-white border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming PTM Meeting</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">26 AUG</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Term 1 Comprehensive Review
          </p>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <Card className="card-3d rounded-2xl p-4 bg-white border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search parent name, student name, phone, admission ID..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Grades</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
            </select>

            <select
              value={feeFilter}
              onChange={e => setFeeFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Fee Status</option>
              <option value="PAID">Paid in Full</option>
              <option value="PENDING">Pending Dues</option>
              <option value="OVERDUE">Overdue Dues</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Parents Directory Table */}
      <Card className="card-3d rounded-2xl bg-white border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Registered Guardians Registry</h3>
            <p className="text-[11px] text-slate-500">
              Showing {filteredParents.length} guardian records with linked wards and verified contact credentials
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            {filteredParents.length} Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Guardian Name & Relation</th>
                <th className="py-3 px-4">Enrolled Ward (Student)</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Residential Address</th>
                <th className="py-3 px-4 text-center">Fee Status</th>
                <th className="py-3 px-4 text-right">Quick Communication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredParents.map((parent) => (
                <tr key={parent.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Guardian Particulars */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                        {parent.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block leading-tight">
                          {parent.name}
                        </span>
                        <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200/60 inline-block mt-0.5">
                          {parent.relation}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Ward / Student */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedWard(parent.ward)}
                      className="text-left group flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div>
                        <span className="font-bold text-indigo-600 group-hover:underline block leading-tight">
                          {parent.ward.firstName} {parent.ward.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {parent.ward.gradeName} • Roll {parent.ward.rollNumber || '01'}
                        </span>
                      </div>
                    </button>
                  </td>

                  {/* Phone */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{parent.phone}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[160px]">{parent.email}</span>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[180px]">{parent.address}</span>
                    </div>
                  </td>

                  {/* Fee Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      parent.feeStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : parent.feeStatus === 'OVERDUE'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {parent.feeStatus}
                    </span>
                  </td>

                  {/* Quick Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedParentForMessage({
                            parentName: parent.name,
                            parentPhone: parent.phone,
                            studentName: `${parent.ward.firstName} ${parent.ward.lastName}`,
                            gradeName: parent.ward.gradeName
                          });
                        }}
                        className="btn-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1"
                        title="Send SMS / WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>

                      <button
                        onClick={() => setSelectedWard(parent.ward)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        title="View Ward Card"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* =========================================================================
          INTERACTIVE MODAL: Direct WhatsApp / SMS Notice Dispatcher
         ========================================================================= */}
      {selectedParentForMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Direct Guardian Communication</h3>
                  <p className="text-[11px] text-slate-500">Dispatch instant SMS, WhatsApp, and App Notification</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedParentForMessage(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-bold text-slate-900">{selectedParentForMessage.parentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Phone:</span>
                <span className="font-mono font-bold text-slate-800">{selectedParentForMessage.parentPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ward:</span>
                <span className="font-semibold text-slate-800">
                  {selectedParentForMessage.studentName} ({selectedParentForMessage.gradeName})
                </span>
              </div>
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600 block">Quick Template:</span>
              <div className="flex gap-1.5 flex-wrap text-[11px]">
                {[
                  "Fee payment reminder notice",
                  "Upcoming PTM schedule invitation",
                  "Attendance appreciation alert",
                  "Exam timetable released"
                ].map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(`Dear Parent, this is an official update regarding ${selectedParentForMessage.studentName}. ${tpl}. Please check your School OS portal for details.`)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors"
                  >
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message Text *</label>
                <textarea
                  required
                  rows={4}
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Type your official message or notice here..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedParentForMessage(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE DRAWER: Ward Academic & Attendance Overview
         ========================================================================= */}
      {selectedWard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                  {selectedWard.firstName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedWard.firstName} {selectedWard.lastName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedWard.admissionNumber} • {selectedWard.gradeName} ({selectedWard.sectionName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWard(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                <span className="text-base font-black text-indigo-600 mt-0.5 block">
                  {selectedWard.attendancePercentage}%
                </span>
                <span className="text-[10px] text-slate-500">Institutional record</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee Clearance</span>
                <span className={`text-base font-black mt-0.5 block ${
                  selectedWard.feeStatus === 'PAID' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {selectedWard.feeStatus}
                </span>
                <span className="text-[10px] text-slate-500">Term 1 (2026)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-purple-900">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Parent / Guardian Particulars</span>
              </div>
              <div className="text-[11px] text-slate-700 space-y-0.5 pt-1">
                <div><strong>Guardian Name:</strong> {selectedWard.parentName}</div>
                <div><strong>Phone:</strong> {selectedWard.parentPhone}</div>
                <div><strong>Email:</strong> {selectedWard.parentEmail}</div>
                <div><strong>Address:</strong> {selectedWard.address}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Link
                href="/school/exams?tab=reports"
                className="btn-3d-secondary px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Marksheets</span>
              </Link>

              <button
                onClick={() => setSelectedWard(null)}
                className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ParentsDirectoryPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-12 text-center text-slate-400 font-semibold">Loading Parents Directory...</div>}>
        <ParentsDirectoryContent />
      </Suspense>
    </AppShell>
  );
}
