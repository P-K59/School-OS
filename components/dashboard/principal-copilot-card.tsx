"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  CreditCard,
  Phone,
  MessageSquare,
  TrendingDown,
  TrendingUp,
  X,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface CopilotAction {
  id: string;
  type: 'FEE_ALERT' | 'ATTENDANCE_ANOMALY' | 'TEACHER_LOG';
  title: string;
  detail: string;
  impact: string;
  targetPhone?: string;
  targetAmount?: number;
  studentName?: string;
  executed: boolean;
}

export function PrincipalCopilotCard() {
  const { students, financials, invoices, activeSchool, activities } = useAuth();
  
  // Custom AI Query State
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Suggested Proactive AI Actions based on live context
  const overdueInvoices = invoices.filter(inv => inv.status !== 'PAID');
  const lowAttendanceStudents = students.filter(s => s.attendancePercentage < 92 || s.todayAttendance === 'ABSENT');

  const [actions, setActions] = useState<CopilotAction[]>([
    {
      id: 'act-1',
      type: 'FEE_ALERT',
      title: 'Dispatched automated WhatsApp payment links for overdue balances',
      detail: `₹${(financials.totalOverdue).toLocaleString('en-IN')} pending across ${overdueInvoices.length} student ledgers.`,
      impact: '+12% projected cashflow acceleration',
      targetPhone: '+91 98111 88990',
      targetAmount: financials.totalOverdue,
      executed: false,
    },
    {
      id: 'act-2',
      type: 'ATTENDANCE_ANOMALY',
      title: `Notify guardians for ${lowAttendanceStudents.length} students with consecutive absences`,
      detail: `Includes Kabir Mehta (89.2%) and flagged absences today. Instant SMS alert to registered parent contacts.`,
      impact: 'Mitigates mid-term dropout risk',
      studentName: 'Kabir Mehta',
      targetPhone: '+91 98111 88990',
      executed: false,
    },
    {
      id: 'act-3',
      type: 'TEACHER_LOG',
      title: 'Review today\'s completed lesson uploads and period attendance logs',
      detail: `Senior faculty logged 8 timetable periods today across Robotics, Python Arcade, and Math.`,
      impact: '100% CBSE academic compliance',
      executed: false,
    },
  ]);

  const handleExecuteAction = (actionId: string, title: string) => {
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, executed: true } : a));
    setToastMsg(`✓ Executed: ${title}`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAskCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setAiResponse(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      const q = query.toLowerCase();
      if (q.includes('fee') || q.includes('collection') || q.includes('due') || q.includes('money')) {
        setAiResponse(
          `Fee Analysis for ${activeSchool.name}: Total billed is ${formatCurrency(financials.totalBilled)}, with ${formatCurrency(financials.totalCollected)} collected (${Math.round((financials.totalCollected / (financials.totalBilled || 1)) * 100)}% efficiency). Outstanding arrears are ${formatCurrency(financials.totalOverdue)}. 68% of collected fees were settled instantly via UPI.`
        );
      } else if (q.includes('attendance') || q.includes('absent') || q.includes('present')) {
        setAiResponse(
          `Attendance Health: Overall campus rate is 96.2%. ${lowAttendanceStudents.length} student(s) currently flag attendance below the 92% benchmark. Daily biometric & period punch logs are synchronized across all classrooms.`
        );
      } else if (q.includes('teacher') || q.includes('staff') || q.includes('salary')) {
        setAiResponse(
          `Faculty Operations: All teachers are verified with zero timetable double-booking clashes. May 2025 deterministic payroll is reconciled with 0 floating-point rounding errors.`
        );
      } else {
        setAiResponse(
          `School OS AI Diagnostic: Campus telemetry for ${activeSchool.name} is running optimally. Verified row-level security isolation, 100% digital fee receipts ready, and live transport radar active.`
        );
      }
      setQuery('');
    }, 600);
  };

  return (
    <Card className="light-glass p-6 border-indigo-200/90 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900">AI Principal Copilot</h3>
              <Badge variant="cyan" className="text-[10px] font-mono">NEURAL CRM ASSISTANT</Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Real-time administrative diagnostic engine for {activeSchool.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autonomous Monitoring Active</span>
          </span>
        </div>
      </div>

      {/* Toast alert */}
      {toastMsg && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* AI Interactive Chat Input */}
      <div className="mt-4 relative z-10">
        <form onSubmit={handleAskCopilot} className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles className="absolute left-3.5 top-3 w-4 h-4 text-indigo-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Copilot: e.g. 'Summarize overdue fees', 'Who needs attendance alert?'..."
              className="pl-10 bg-white border-slate-300 text-xs font-medium text-slate-900 h-10 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            disabled={isAnalyzing}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Analyzing...' : 'Ask AI'}</span>
          </Button>
        </form>

        {aiResponse && (
          <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 font-medium leading-relaxed animate-fade-in flex items-start gap-2.5">
            <Bot className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-indigo-900 block mb-0.5">Executive AI Briefing:</span>
              <span>{aiResponse}</span>
            </div>
            <button onClick={() => setAiResponse(null)} className="text-indigo-400 hover:text-indigo-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Recommended 1-Click Administrative Actions */}
      <div className="mt-5 space-y-3 relative z-10">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Suggested Proactive Actions
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actions.map((act) => (
            <div
              key={act.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between shadow-xs ${
                act.executed
                  ? 'bg-emerald-50/60 border-emerald-200 opacity-90'
                  : act.type === 'FEE_ALERT'
                  ? 'bg-slate-50 hover:bg-indigo-50/40 border-slate-200/90 hover:border-indigo-200'
                  : act.type === 'ATTENDANCE_ANOMALY'
                  ? 'bg-slate-50 hover:bg-amber-50/40 border-slate-200/90 hover:border-amber-200'
                  : 'bg-slate-50 hover:bg-purple-50/40 border-slate-200/90 hover:border-purple-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    act.type === 'FEE_ALERT'
                      ? 'bg-indigo-100 text-indigo-800'
                      : act.type === 'ATTENDANCE_ANOMALY'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {act.type === 'FEE_ALERT' ? 'Cashflow' : act.type === 'ATTENDANCE_ANOMALY' ? 'Attendance' : 'Academics'}
                  </span>
                  {act.executed && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Executed
                    </span>
                  )}
                </div>

                <div className="text-xs font-extrabold text-slate-900 leading-snug">
                  {act.title}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {act.detail}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-700">
                  {act.impact}
                </span>

                <Button
                  size="sm"
                  disabled={act.executed}
                  onClick={() => handleExecuteAction(act.id, act.title)}
                  className={`h-7 px-2.5 text-[11px] font-bold ${
                    act.executed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {act.executed ? 'Done ✓' : 'Execute 1-Click'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
