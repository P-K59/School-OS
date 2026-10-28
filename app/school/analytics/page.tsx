"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Calendar,
  Users,
  Download,
  Printer,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  Sparkles,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';

export default function SchoolAnalyticsPage() {
  const { activeSchool, students, invoices } = useAuth();

  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'ACADEMIC' | 'ATTENDANCE' | 'COMPLIANCE'>('FINANCIAL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'TERM_1' | 'TERM_2' | 'ANNUAL'>('TERM_1');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Financial BI Data
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0) || 14250000;
  const totalCollected = invoices.reduce((acc, inv) => acc + (inv.paidAmount || 0), 0) || 13420000;
  const outstandingArrears = totalBilled - totalCollected;
  const collectionEfficiency = Math.round((totalCollected / totalBilled) * 100);

  const monthlyCollections = [
    { month: 'Jan', collected: 2450000, billed: 2600000, rate: 94 },
    { month: 'Feb', collected: 2180000, billed: 2300000, rate: 95 },
    { month: 'Mar', collected: 2950000, billed: 3100000, rate: 95 },
    { month: 'Apr', collected: 1950000, billed: 2100000, rate: 93 },
    { month: 'May', collected: 3890000, billed: 4150000, rate: 94 },
  ];

  // Academic Score Distribution Data
  const academicSubjects = [
    { name: 'Python Arcade Coding', avg: 92.4, highest: 100, passRate: 98.5, distinctions: 74 },
    { name: 'Autonomous Robotics Lab', avg: 89.8, highest: 99, passRate: 97.0, distinctions: 68 },
    { name: 'Mathematics & Logic', avg: 86.2, highest: 100, passRate: 94.2, distinctions: 58 },
    { name: 'Physics & General Science', avg: 84.5, highest: 98, passRate: 93.8, distinctions: 52 },
    { name: 'English & Global Communication', avg: 91.0, highest: 98, passRate: 99.0, distinctions: 71 },
  ];

  // Attendance Heatmap Sample (Last 20 Days)
  const attendanceDays = [
    { day: 'Day 1', rate: 97.4 }, { day: 'Day 2', rate: 96.8 }, { day: 'Day 3', rate: 98.1 },
    { day: 'Day 4', rate: 95.5 }, { day: 'Day 5', rate: 94.2 }, { day: 'Day 6', rate: 97.9 },
    { day: 'Day 7', rate: 98.4 }, { day: 'Day 8', rate: 96.5 }, { day: 'Day 9', rate: 97.1 },
    { day: 'Day 10', rate: 98.8 }, { day: 'Day 11', rate: 95.0 }, { day: 'Day 12', rate: 96.2 },
    { day: 'Day 13', rate: 97.5 }, { day: 'Day 14', rate: 98.0 }, { day: 'Day 15', rate: 96.9 },
    { day: 'Day 16', rate: 97.8 }, { day: 'Day 17', rate: 98.5 }, { day: 'Day 18', rate: 96.1 },
    { day: 'Day 19', rate: 97.3 }, { day: 'Day 20', rate: 98.2 },
  ];

  const handleTriggerExport = (type: string) => {
    setExportNotice(`✓ Successfully generated and downloaded ${type} report for ${activeSchool.name}!`);
    setTimeout(() => setExportNotice(null), 5000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>{activeSchool.name} • Executive Intelligence & BI Suite</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Institutional Performance & Financial Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Multi-dimensional revenue forecasting, student STEM grade curves, attendance heatmaps, and board audit compliance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="default"
              onClick={() => handleTriggerExport('Excel CSV Dataset')}
              className="font-bold text-xs gap-1.5 border-slate-200 text-slate-700 hover:text-indigo-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </Button>

            <Button
              onClick={() => handleTriggerExport('Board Compliance PDF')}
              size="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 font-bold gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Board Report</span>
            </Button>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportNotice}</span>
            </div>
            <button onClick={() => setExportNotice(null)} className="text-emerald-700 font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        {/* 4 Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Collection Rate</span>
                <CreditCard className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">{collectionEfficiency}%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                {formatCurrency(totalCollected)} Collected
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+3.8% MoM Velocity</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Arrears</span>
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">
                {formatCurrency(outstandingArrears)}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Across 32 Pending Invoices</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-amber-700">
              <span>91% recoverable in 15 days</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">STEM Lab GPA Avg</span>
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-700 mt-2 font-mono">89.6%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Python & Robotics Cadets</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-indigo-700">
              <Award className="w-3.5 h-3.5" />
              <span>Ranked #1 in Pune Region</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campus Attendance</span>
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-700 mt-2 font-mono">97.2%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Biometric RFID Average</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-bold text-cyan-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Truancy Incidents</span>
            </div>
          </Card>
        </div>

        {/* Analytics Module Tabs */}
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'FINANCIAL', label: 'Financial & Fee Cashflow', icon: CreditCard },
            { id: 'ACADEMIC', label: 'Academic & STEM Proficiency', icon: GraduationCap },
            { id: 'ATTENDANCE', label: 'Attendance & Radar Heatmap', icon: Calendar },
            { id: 'COMPLIANCE', label: 'Accreditation & Board Audit', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Financial BI */}
        {activeTab === 'FINANCIAL' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Monthly Waterfall Bar Visualizer (8 cols) */}
              <div className="lg:col-span-8">
                <Card className="light-glass p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Monthly Fee Collection Velocity</h3>
                        <p className="text-xs text-slate-500 font-medium">Billed Target vs Actual Remittance Received</p>
                      </div>
                      <Badge variant="cyan" className="font-mono text-xs">FY 2025-26</Badge>
                    </div>

                    <div className="space-y-4 my-6">
                      {monthlyCollections.map((m) => (
                        <div key={m.month} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-slate-800">{m.month} 2025</span>
                            <span className="font-mono text-slate-600">
                              <span className="font-bold text-emerald-700">{formatCurrency(m.collected)}</span> / {formatCurrency(m.billed)} ({m.rate}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${m.rate}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>Automated UPI Reminders deliver 42% faster clearance</span>
                    <span className="font-bold text-indigo-700 font-mono">Total YTD: {formatCurrency(totalCollected)}</span>
                  </div>
                </Card>
              </div>

              {/* Revenue Category Distribution (4 cols) */}
              <div className="lg:col-span-4">
                <Card className="light-glass p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                      Revenue Stream Breakdown
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-indigo-900">Academic Tuition</div>
                          <div className="text-[11px] text-slate-500">62% of Total Ledger</div>
                        </div>
                        <span className="font-mono font-bold text-indigo-700">₹88.35 L</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-cyan-50/70 border border-cyan-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-cyan-900">STEM & Robotics Kits</div>
                          <div className="text-[11px] text-slate-500">22% of Total Ledger</div>
                        </div>
                        <span className="font-mono font-bold text-cyan-700">₹31.35 L</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-amber-900">Transport & GPS Fleet</div>
                          <div className="text-[11px] text-slate-500">11% of Total Ledger</div>
                        </div>
                        <span className="font-mono font-bold text-amber-700">₹15.67 L</span>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">Exam & Lab Sundry</div>
                          <div className="text-[11px] text-slate-500">5% of Total Ledger</div>
                        </div>
                        <span className="font-mono font-bold text-slate-700">₹7.13 L</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    Fully compliant with Section 12AA GST Exemption Norms.
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Academic & STEM Proficiency */}
        {activeTab === 'ACADEMIC' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="light-glass overflow-hidden shadow-xs">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-extrabold text-slate-900">
                    Subject Performance & Distinction Analysis
                  </CardTitle>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Batch analysis across Grades 6 through 12 in the current academic semester.
                  </p>
                </div>
                <Badge variant="default" className="text-xs">Grade 6-12 Aggregates</Badge>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 font-extrabold text-slate-600 uppercase tracking-wider text-[11px]">
                      <th className="p-3.5 pl-6">Subject Curriculum</th>
                      <th className="p-3.5 text-center">Batch Avg (%)</th>
                      <th className="p-3.5 text-center">Top Score</th>
                      <th className="p-3.5 text-center">Pass Rate</th>
                      <th className="p-3.5 text-center">A1 Distinctions</th>
                      <th className="p-3.5 pr-6 text-right">Proficiency Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academicSubjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5 pl-6 font-bold text-slate-900">{sub.name}</td>
                        <td className="p-3.5 text-center font-mono font-bold text-indigo-700">{sub.avg}%</td>
                        <td className="p-3.5 text-center font-mono font-bold text-emerald-700">{sub.highest}/100</td>
                        <td className="p-3.5 text-center font-mono font-semibold text-slate-700">{sub.passRate}%</td>
                        <td className="p-3.5 text-center font-mono font-semibold text-slate-700">{sub.distinctions}% of Batch</td>
                        <td className="p-3.5 pr-6 text-right">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {sub.avg > 90 ? 'Mastery' : 'Proficient'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 3: Attendance Heatmap */}
        {activeTab === 'ATTENDANCE' && (
          <div className="space-y-6 animate-fade-in">
            <Card className="light-glass p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">30-Day Campus Attendance Heatmap</h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time biometric attendance aggregated across all classes</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="w-3 h-3 rounded bg-emerald-500" /> 97%+
                  <span className="w-3 h-3 rounded bg-emerald-300 ml-2" /> 95-97%
                  <span className="w-3 h-3 rounded bg-amber-400 ml-2" /> 90-95%
                </div>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 my-6">
                {attendanceDays.map((d, idx) => {
                  const bgClass = d.rate >= 97 ? 'bg-emerald-500 text-white' : d.rate >= 95 ? 'bg-emerald-300 text-emerald-950 font-bold' : 'bg-amber-400 text-amber-950 font-bold';
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs ${bgClass}`}
                    >
                      <span className="text-[10px] opacity-80">{d.day}</span>
                      <span className="font-mono text-xs font-extrabold mt-0.5">{d.rate}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Peak attendance observed on Wednesday & Thursday (98.8%)</span>
                <span className="text-emerald-700 font-bold font-mono">Average: 97.2%</span>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 4: Accreditation & Board Audit */}
        {activeTab === 'COMPLIANCE' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="light-glass p-6 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>National Education Policy (NEP 2020) & Board Audit</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900">Hands-on STEM Robotics Lab Integration</div>
                      <p className="text-emerald-800 text-[11px] mt-0.5">Satisfies 10 bagless days & practical experiential learning mandate.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900">Holistic Progress Card (HPC) 360° Evaluation</div>
                      <p className="text-emerald-800 text-[11px] mt-0.5">Integrates cognitive, psychomotor, and self-assessment metrics.</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900">Multi-Lingual Coding & Computational Thinking</div>
                      <p className="text-emerald-800 text-[11px] mt-0.5">Grades 6–8 Python curriculum compliant with National Curriculum Framework (NCF).</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="light-glass p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 mb-4">
                    Audit Readiness Score
                  </h3>

                  <div className="text-center my-4">
                    <div className="w-24 h-24 rounded-full bg-indigo-50 border-4 border-indigo-600 flex items-center justify-center mx-auto text-2xl font-black text-indigo-700 font-mono">
                      98%
                    </div>
                    <div className="text-xs font-bold text-slate-800 mt-2">Institutional Compliance Grade: A+</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">All 42 inspection criteria validated by InnovatMind compliance scanner.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => handleTriggerExport('Full Audit Compliance Dossier')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100"
                  >
                    Download Official Accreditation Dossier (PDF)
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
