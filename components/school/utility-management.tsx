"use client";

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Droplets,
  Wifi,
  Flame,
  Bell,
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Check,
  ChevronDown,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Fuel,
  Activity
} from 'lucide-react';

export interface UtilityIssue {
  id: string;
  title: string;
  location: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  reportedDate: string;
  assignedTo?: string;
}

export interface UtilityBill {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  provider: string;
}

export function UtilityManagement() {
  // Power Status
  const [powerSource, setPowerSource] = useState<'GRID' | 'GENERATOR' | 'SOLAR'>('GRID');
  const [waterPumpOn, setWaterPumpOn] = useState(false);
  const [bellMuted, setBellMuted] = useState(false);

  // Issues List with localStorage persistence
  const [issues, setIssues] = useState<UtilityIssue[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_os_utility_issues');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'iss-1',
        title: 'Drinking Water Tap Leaking',
        location: 'Ground Floor Corridor',
        priority: 'HIGH',
        status: 'PENDING',
        reportedDate: 'Today, 8:30 AM',
        assignedTo: 'Ramesh Plumber (+91 98765 11223)'
      },
      {
        id: 'iss-2',
        title: 'Class 4 Ceiling Fan Vibration',
        location: 'Room 104, Primary Wing',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        reportedDate: 'Yesterday',
        assignedTo: 'Technician Mohan'
      },
      {
        id: 'iss-3',
        title: 'Solar Inverter Battery Water Top-Up',
        location: 'Administration Rooftop',
        priority: 'LOW',
        status: 'RESOLVED',
        reportedDate: '3 days ago'
      }
    ];
  });

  // Bills List
  const [bills, setBills] = useState<UtilityBill[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('school_os_utility_bills');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      { id: 'bill-1', type: 'State Electricity Board', amount: 3200, dueDate: '20 Oct 2026', isPaid: false, provider: 'Electricity Grid Supply' },
      { id: 'bill-2', type: 'Cafeteria Cooking LPG Refill', amount: 1100, dueDate: '15 Oct 2026', isPaid: true, provider: 'Indane Gas Agency' },
      { id: 'bill-3', type: 'Broadband Fiber & Smart Classroom WiFi', amount: 799, dueDate: '25 Oct 2026', isPaid: false, provider: 'BharatNet Fiber' },
      { id: 'bill-4', type: 'Drinking Water RO Filter Maintenance', amount: 1500, dueDate: '05 Oct 2026', isPaid: true, provider: 'PureWater RO Services' }
    ];
  });

  // New Issue Modal State
  const [showAddIssue, setShowAddIssue] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newPriority, setNewPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [newContact, setNewContact] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('school_os_utility_issues', JSON.stringify(issues));
    } catch {}
  }, [issues]);

  useEffect(() => {
    try {
      localStorage.setItem('school_os_utility_bills', JSON.stringify(bills));
    } catch {}
  }, [bills]);

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newIssue: UtilityIssue = {
      id: `iss-${Date.now()}`,
      title: newTitle.trim(),
      location: newLocation.trim() || 'Main Campus',
      priority: newPriority,
      status: 'PENDING',
      reportedDate: 'Just now',
      assignedTo: newContact.trim() || 'Internal Maintenance Team'
    };

    setIssues([newIssue, ...issues]);
    setNewTitle('');
    setNewLocation('');
    setNewContact('');
    setShowAddIssue(false);
  };

  const updateIssueStatus = (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
    setIssues(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const toggleBillPayment = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b));
  };

  return (
    <div className="space-y-6">
      {/* Clean Executive Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Campus Facilities
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Utility & Campus Maintenance
          </h2>
        </div>

        <button
          onClick={() => setShowAddIssue(true)}
          className="btn-3d-primary px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* 4 Clean Facility Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Power Card */}
        <div className="card-3d rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Power Grid</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${powerSource === 'GRID' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {powerSource === 'GRID' ? 'Grid Line (230V)' : powerSource === 'SOLAR' ? 'Solar Backup' : 'Diesel Generator'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Inverter Backup: 85% • Voltage Stable
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setPowerSource(p => p === 'GRID' ? 'SOLAR' : p === 'SOLAR' ? 'GENERATOR' : 'GRID')}
              className="btn-3d-secondary w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              Switch Source ({powerSource})
            </button>
          </div>
        </div>

        {/* Water Supply Card */}
        <div className="card-3d rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Water Supply</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Overhead Tank 80%</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              RO Purifier Active • Safe for Drinking
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setWaterPumpOn(!waterPumpOn)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                waterPumpOn
                  ? 'btn-3d-success'
                  : 'btn-3d-secondary'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              {waterPumpOn ? 'Pump: Running' : 'Start Water Pump'}
            </button>
          </div>
        </div>

        {/* Kitchen Gas */}
        <div className="card-3d rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cafeteria LPG</span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">2 Cylinders Full</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              1 Active in Kitchen • Safety Certified
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="inline-flex w-full items-center justify-center py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Safety Inspected Today
            </span>
          </div>
        </div>

        {/* WiFi & Bell */}
        <div className="card-3d rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Internet & Bell</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Fiber Online (25 Mbps)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {bellMuted ? 'Auto Bell: Paused' : 'Next Bell: Period 3 (10:30 AM)'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setBellMuted(!bellMuted)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                bellMuted ? 'btn-3d-amber' : 'btn-3d-secondary'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              {bellMuted ? 'Unpause Auto Bell' : 'Automated Bell Active'}
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Work Orders & Monthly Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Work Orders List (2 Columns Wide on Desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                <span>Campus Repairs & Maintenance Orders</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Click status button directly to update progress
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {issues.filter(i => i.status !== 'RESOLVED').length} Active
            </span>
          </div>

          <div className="space-y-3">
            {issues.map((issue) => {
              const isPending = issue.status === 'PENDING';
              const isInProgress = issue.status === 'IN_PROGRESS';
              const isResolved = issue.status === 'RESOLVED';

              return (
                <div
                  key={issue.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-slate-50/60 border-slate-200 opacity-75'
                      : isPending
                      ? 'bg-amber-50/30 border-amber-200'
                      : 'bg-blue-50/30 border-blue-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm sm:text-base font-semibold ${isResolved ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {issue.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        issue.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : issue.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {issue.priority === 'HIGH' ? 'Urgent Priority' : issue.priority === 'MEDIUM' ? 'Normal' : 'Low Priority'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">
                      {issue.reportedDate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-normal mb-3">
                    <strong className="text-slate-700">Location:</strong> {issue.location}
                    {issue.assignedTo && (
                      <span className="ml-3">
                        <strong className="text-slate-700">Assigned To:</strong> {issue.assignedTo}
                      </span>
                    )}
                  </p>

                  {/* 3-way status button bar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                    <span className="text-xs text-slate-500 font-medium mr-1">Status:</span>

                    <button
                      onClick={() => updateIssueStatus(issue.id, 'PENDING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isPending
                          ? 'btn-3d-amber'
                          : 'btn-3d-secondary text-slate-600'
                      }`}
                    >
                      Needs Repair
                    </button>

                    <button
                      onClick={() => updateIssueStatus(issue.id, 'IN_PROGRESS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isInProgress
                          ? 'btn-3d-primary'
                          : 'btn-3d-secondary text-slate-600'
                      }`}
                    >
                      In Progress
                    </button>

                    <button
                      onClick={() => updateIssueStatus(issue.id, 'RESOLVED')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isResolved
                          ? 'btn-3d-success'
                          : 'btn-3d-secondary text-slate-600'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Resolved & Fixed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Utility Bills & Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Monthly Invoices & Fuel</span>
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                Oct 2026
              </span>
            </div>

            <div className="space-y-3">
              {bills.map(bill => (
                <div
                  key={bill.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                      {bill.type}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                      {bill.provider} • Due {bill.dueDate}
                    </p>
                    <span className="text-sm font-bold text-slate-900 mt-1 inline-block">
                      ₹{bill.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleBillPayment(bill.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      bill.isPaid
                        ? 'btn-3d-success'
                        : 'btn-3d-primary'
                    }`}
                  >
                    {bill.isPaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        <span>Paid ✓</span>
                      </>
                    ) : (
                      <span>Mark Paid</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Service Directory */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Emergency Maintenance Contacts
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800 block">Electrician</span>
                <span className="text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                  <PhoneCall className="w-3 h-3" /> +91 98765-01010
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800 block">Water Tanker</span>
                <span className="text-indigo-600 font-medium flex items-center gap-1 mt-0.5">
                  <PhoneCall className="w-3 h-3" /> +91 98765-02020
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Report New Issue */}
      {showAddIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                Report Campus Issue
              </h3>
              <button
                onClick={() => setShowAddIssue(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Issue Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drinking water tap leaking, Class 3 tube light replacement..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Campus Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Room 102, Girls Restroom, Cafeteria"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal bg-white"
                  >
                    <option value="HIGH">High Priority (Urgent)</option>
                    <option value="MEDIUM">Medium Priority (Standard)</option>
                    <option value="LOW">Low Priority (Scheduled)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Assigned Personnel / Contact (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Plumber (+91 98765-11223) or Campus Caretaker"
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddIssue(false)}
                  className="btn-3d-secondary px-4 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Save & Log Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
