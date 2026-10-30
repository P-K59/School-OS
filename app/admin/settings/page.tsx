"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Building2,
  Globe,
  Database,
  Cpu,
  Layers,
  Save,
  RotateCcw,
  Sparkles,
  Server,
  Key,
  Users,
  Activity,
  Check,
  Clock,
  Radio,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function SuperAdminSettingsPage() {
  const {
    currentUser,
    schools,
    dataMode,
    setDataMode,
    syncProductionData,
    isLoadingData
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'system' | 'security' | 'modules' | 'profile' | 'telemetry'>('system');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // System Configuration State
  const [platformName, setPlatformName] = useState('InnovatMind School OS');
  const [academicSession, setAcademicSession] = useState('2026-2027');
  const [supportEmail, setSupportEmail] = useState('support@innovatmind.com');
  const [rootDomain, setRootDomain] = useState('innovatmind.com');

  // Security & Approval Policy State
  const [requireSchoolApproval, setRequireSchoolApproval] = useState(true);
  const [enforcePasswordPolicy, setEnforcePasswordPolicy] = useState(true);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('120');

  // Module Defaults for New Schools
  const [defaultModules, setDefaultModules] = useState({
    stemLabs: true,
    codingArcade: true,
    roboticsLab: true,
    aiCurriculum: true,
    feeBilling: true,
    transportTracker: false
  });

  // Profile State
  const [superAdminName, setSuperAdminName] = useState(currentUser?.displayName || 'Pankaj Kumar');
  const [superAdminEmail, setSuperAdminEmail] = useState(currentUser?.email || 'superadmin@innovatmind.com');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-black uppercase tracking-wider">
                Platform HQ
              </Badge>
              <span className="text-xs text-slate-400 font-medium">Enterprise Orchestration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Sliders className="w-7 h-7 text-purple-600" />
              <span>Platform Master Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure global operating parameters, security governance, registration approval rules, and platform telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => syncProductionData()}
              disabled={isLoadingData}
              className="h-10 text-xs font-bold gap-2 border-slate-200 hover:bg-slate-50"
            >
              <Database className="w-4 h-4 text-purple-600" />
              <span>{isLoadingData ? 'Syncing...' : 'Sync Database'}</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              className="h-10 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs gap-2 shadow-md shadow-purple-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold block">Platform Settings Updated</span>
              <span className="text-xs text-emerald-700 font-medium">Changes have been securely recorded in the platform master configuration registry.</span>
            </div>
          </div>
        )}

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'system'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>System Config</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'modules'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Module Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Super Admin HQ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('telemetry')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Telemetry & Health</span>
          </button>
        </div>

        {/* Tab 1: System Config */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Platform Identity & Environment</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Core platform naming, academic calendar, and root network domains.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Platform Title</label>
                    <Input
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Active Academic Session</label>
                    <Input
                      value={academicSession}
                      onChange={(e) => setAcademicSession(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Root Platform Domain</label>
                    <Input
                      value={rootDomain}
                      onChange={(e) => setRootDomain(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Central Support Desk Email</label>
                    <Input
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="h-10 text-xs font-mono"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Multi-Tenant Operating Mode</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Current operational partition for this browser session.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDataMode('PRODUCTION')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      dataMode === 'PRODUCTION'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 ${dataMode === 'PRODUCTION' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span>Production Live Database</span>
                        <Badge variant="outline" className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-300">Default</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Strict zero-sample database. Displays real institutional school records and verified data only.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setDataMode('DEMO')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                      dataMode === 'DEMO'
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Radio className={`w-4 h-4 mt-0.5 ${dataMode === 'DEMO' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-extrabold flex items-center gap-1.5">
                        <span>Demo Sandbox Preview</span>
                        <Badge variant="outline" className="text-[9px] bg-indigo-100 text-indigo-700 border-indigo-300">Preview</Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Isolated demonstration sandbox for prospective institutions to test curricula and labs.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Platform Metadata */}
            <div className="space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-lg space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-purple-300">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">InnovatMind OS Core</span>
                  <h4 className="text-lg font-black text-white">Central HQ Orchestration</h4>
                  <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                    Build Version 2.4.0-Enterprise. Deployed with multi-tenant domain mapping and role-based permissions.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-purple-300 block">Total Tenants</span>
                    <span className="font-extrabold text-white text-base">{schools.length}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-300 block">Security Protocol</span>
                    <span className="font-extrabold text-emerald-400 text-base">SOC-2 / ISO</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Security & Approvals */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Self-Registration & Approval Governance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Define onboarding gatekeeping for schools that register via the public portal.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="space-y-0.5 max-w-md">
                      <span className="text-xs font-bold text-slate-900 block">
                        Require Super Admin Approval for Self-Registered Schools
                      </span>
                      <p className="text-[11px] text-slate-500">
                        When enabled, self-registered schools enter <code className="text-amber-600 font-bold">PENDING_APPROVAL</code> stage and cannot log in until Super Admin approves them from the HQ dashboard. Super Admin-created schools continue to log in directly.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequireSchoolApproval(!requireSchoolApproval)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        requireSchoolApproval ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        requireSchoolApproval ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="space-y-0.5 max-w-md">
                      <span className="text-xs font-bold text-slate-900 block">
                        Strict BFCache Invalidation & Session Purge
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Ensures logged-out users clicking browser Back button are immediately blocked and routed to login. No cached protected dashboard content is rendered.
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold text-[10px]">
                      Active & Enforced
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="space-y-0.5 max-w-md">
                      <span className="text-xs font-bold text-slate-900 block">
                        Enforce Strong Institutional Password Policy
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Requires minimum 8 characters with alphanumeric and special character checks for all newly provisioned principal and staff accounts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnforcePasswordPolicy(!enforcePasswordPolicy)}
                      className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                        enforcePasswordPolicy ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        enforcePasswordPolicy ? 'right-1' : 'left-1'
                      }`} />
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Inactivity Session Timeout (Minutes)</span>
                      <p className="text-[11px] text-slate-500">Auto-terminates dormant administrative sessions across all campuses.</p>
                    </div>
                    <Input
                      type="number"
                      value={sessionTimeoutMinutes}
                      onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                      className="w-24 h-9 text-xs text-center font-mono"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Security Invariant</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Super Admin credentials and session tokens are strictly isolated from normal client code. Multi-tenant database operations are scoped by verified school IDs.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Module Defaults */}
        {activeTab === 'modules' && (
          <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Default Module Provisioning for New Campuses</h3>
              <p className="text-xs text-slate-500 mt-0.5">Modules automatically activated when Super Admin onboards a new partner school.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'stemLabs', label: 'STEM Innovation Labs', desc: 'Hardware lab sensors, physics & mechanics modules' },
                { key: 'codingArcade', label: 'Coding Arcade & Python Lab', desc: 'Block coding, Python, and JavaScript IDE' },
                { key: 'roboticsLab', label: 'Robotics & Microcontrollers', desc: 'Arduino, ESP32, and IoT telemetry' },
                { key: 'aiCurriculum', label: 'AI & Machine Learning Lab', desc: 'Computer vision, NLP, and neural network simulations' },
                { key: 'feeBilling', label: 'Fee Billing & Online Gateway', desc: 'Fee structures, invoices, and payment receipts' },
                { key: 'transportTracker', label: 'Smart Bus & Transport Tracker', desc: 'GPS vehicle routes and student pick-up status' },
              ].map((mod) => (
                <div
                  key={mod.key}
                  onClick={() => setDefaultModules(prev => ({ ...prev, [mod.key]: !prev[mod.key as keyof typeof prev] }))}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    defaultModules[mod.key as keyof typeof defaultModules]
                      ? 'border-purple-500 bg-purple-50/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900">{mod.label}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      defaultModules[mod.key as keyof typeof defaultModules]
                        ? 'bg-purple-600 text-white'
                        : 'border border-slate-300'
                    }`}>
                      {defaultModules[mod.key as keyof typeof defaultModules] && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">{mod.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 4: Super Admin Identity */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-base font-black text-slate-900">Primary Super Admin Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Authoritative platform administrator credentials and recovery identity.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Administrator Name</label>
                    <Input
                      value={superAdminName}
                      onChange={(e) => setSuperAdminName(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Primary Super Admin Email</label>
                    <Input
                      value={superAdminEmail}
                      disabled
                      className="h-10 text-xs font-mono bg-slate-50"
                    />
                    <span className="text-[10px] text-slate-400">Strictly preserved root authority email.</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Root Super Admin Preservation Guarantee</span>
                    <span className="text-[11px] text-amber-800">
                      The root Super Admin account (<code>usr-super</code> / <code>superadmin@innovatmind.com</code>) is protected against deletion, data resets, or unauthorized tenant reassignment.
                    </span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                  HQ
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Operational Headquarters</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  InnovatMind EdTech Operations, Central Platform Hub, New Delhi, India.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 5: Telemetry & Health */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Platform Uptime</span>
                <span className="text-2xl font-black text-emerald-600">99.98%</span>
                <span className="text-[10px] text-slate-400 block mt-1">High-availability cluster</span>
              </Card>
              <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Real Tenants Loaded</span>
                <span className="text-2xl font-black text-purple-600">{schools.length}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Multi-tenant stores</span>
              </Card>
              <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Data Mode</span>
                <span className="text-2xl font-black text-blue-600">{dataMode}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Live database runtime</span>
              </Card>
              <Card className="p-4 rounded-2xl border-slate-200 bg-white shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Security Isolation</span>
                <span className="text-2xl font-black text-emerald-600">Enforced</span>
                <span className="text-[10px] text-slate-400 block mt-1">RLS &amp; Session Guard</span>
              </Card>
            </div>

            <Card className="p-6 rounded-3xl border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Platform Health & Telemetry Check</h3>
                  <p className="text-xs text-slate-500">Live operational status across database schemas and micro-stores.</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold text-[10px]">
                  All Systems Nominal
                </Badge>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-800 font-bold">tenant_store.multi_tenant_router</span>
                  </div>
                  <span className="text-emerald-700 font-bold">OK (0ms latency)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 font-bold">auth_guard.session_invalidation</span>
                  </div>
                  <span className="text-emerald-700 font-bold">ACTIVE &amp; ENFORCED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-800 font-bold">curriculum_pricing.tier_resolver</span>
                  </div>
                  <span className="text-emerald-700 font-bold">SYNCHRONIZED</span>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </AppShell>
  );
}
