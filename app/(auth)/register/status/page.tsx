"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Mail,
  MapPin,
  Sparkles,
  Search,
  School as SchoolIcon,
  HelpCircle
} from 'lucide-react';

import { useAuth } from '@/lib/auth/context';

interface SchoolStatusData {
  id: string;
  registrationId: string;
  name: string;
  code: string;
  city: string;
  state: string;
  schoolType: string;
  onboardingStatus: 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED';
  isActive: boolean;
  maskedEmail: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  decisionNotes?: string;
  statusBadge: 'PENDING' | 'APPROVED' | 'REJECTED';
}

function StatusTrackerContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('id') || searchParams.get('query') || '';
  const { schools } = useAuth();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [statusResult, setStatusResult] = useState<SchoolStatusData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchStatus = async (queryToSearch: string) => {
    const clean = queryToSearch.trim();
    if (!clean) {
      setErrorMessage('Please enter an IMS Registration ID (e.g. IMS-2026-XXXXXX), School Code, or Email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/schools/status?id=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (res.ok && data.found && data.school) {
        setStatusResult(data.school);
      } else {
        // Fallback: check in client-persisted schools
        const qLower = clean.toLowerCase();
        const clientMatch = schools.find(s => 
          (s.registrationId && s.registrationId.toLowerCase() === qLower) ||
          (s.code && s.code.toLowerCase() === qLower) ||
          (s.email && s.email.toLowerCase() === qLower) ||
          (s.id && s.id.toLowerCase() === qLower)
        );

        if (clientMatch) {
          const email = clientMatch.email || '';
          const maskedEmail = email.includes('@')
            ? `${email.split('@')[0].slice(0, 2)}***${email.split('@')[0].slice(-1)}@${email.split('@')[1]}`
            : 'Registered Email on File';
          const statusBadge: 'PENDING' | 'APPROVED' | 'REJECTED' = clientMatch.onboardingStatus === 'ACTIVE' 
            ? 'APPROVED' 
            : clientMatch.onboardingStatus === 'REJECTED' 
              ? 'REJECTED' 
              : 'PENDING';

          setStatusResult({
            id: clientMatch.id,
            registrationId: clientMatch.registrationId || clean,
            name: clientMatch.name,
            code: clientMatch.code,
            city: clientMatch.city,
            state: clientMatch.state,
            schoolType: clientMatch.schoolType,
            onboardingStatus: (clientMatch.onboardingStatus as any) || 'PENDING_APPROVAL',
            isActive: Boolean(clientMatch.isActive),
            maskedEmail,
            submittedAt: clientMatch.createdAt,
            reviewedAt: clientMatch.approvalDetails?.reviewedAt,
            reviewedBy: clientMatch.approvalDetails?.reviewedBy,
            decisionNotes: clientMatch.approvalDetails?.decisionNotes,
            statusBadge
          });
        } else {
          setStatusResult(null);
          setErrorMessage(data.error || `No school registration found matching "${clean}". Please verify your Registration ID (e.g. IMS-2026-XXXXXX) or official email address.`);
        }
      }
    } catch {
      setStatusResult(null);
      setErrorMessage('Network connection error while looking up status. Please check your internet and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchStatus(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(searchQuery);
  };

  const handleCopyId = (idText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(idText);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Search Header Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Institutional Verification Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Track Registration Status
        </h1>
        <p className="text-sm text-slate-600 font-medium">
          Check the real-time onboarding and approval status of your school application using your unique IMS Registration ID or registered contact email.
        </p>
      </div>

      {/* Search Input Box */}
      <Card className="light-glass p-6 sm:p-8 rounded-3xl shadow-xl border-slate-200/80 bg-white">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Registration ID (e.g. IMS-2026-630252) or Email"
                className="pl-12 pr-4 py-3 h-12 text-sm rounded-2xl border-slate-200 bg-slate-50/60 focus:bg-white text-slate-900 font-medium"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lookup Status</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Tip: Registration IDs start with <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono font-bold">IMS-YYYY-XXXXXX</code></span>
            </div>
            <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
              Need to register a new school? →
            </Link>
          </div>
        </form>
      </Card>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-rose-900">Application Record Not Found</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Status Result Display */}
      {statusResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Main Status Hero Card */}
          <Card className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${
            statusResult.statusBadge === 'APPROVED'
              ? 'bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 border-emerald-300'
              : statusResult.statusBadge === 'REJECTED'
                ? 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 border-rose-300'
                : 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                  statusResult.statusBadge === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : statusResult.statusBadge === 'REJECTED'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                }`}>
                  {statusResult.statusBadge === 'APPROVED' && <CheckCircle2 className="w-8 h-8" />}
                  {statusResult.statusBadge === 'REJECTED' && <XCircle className="w-8 h-8" />}
                  {statusResult.statusBadge === 'PENDING' && <Clock className="w-8 h-8 animate-pulse" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {statusResult.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-xs ${
                      statusResult.statusBadge === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : statusResult.statusBadge === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {statusResult.statusBadge === 'APPROVED' && 'Approved & Active'}
                      {statusResult.statusBadge === 'REJECTED' && 'Application Declined'}
                      {statusResult.statusBadge === 'PENDING' && 'Pending HQ Review'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{statusResult.city}, {statusResult.state} • {statusResult.schoolType} Board</span>
                  </div>
                </div>
              </div>

              {/* Status Action CTA */}
              <div className="shrink-0 flex items-center gap-3">
                {statusResult.statusBadge === 'APPROVED' && (
                  <Link href="/login">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md shadow-emerald-200 flex items-center gap-2 cursor-pointer transition-all">
                      <span>Launch School Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
                {statusResult.statusBadge === 'PENDING' && (
                  <Button
                    onClick={() => fetchStatus(statusResult.registrationId || searchQuery)}
                    variant="outline"
                    className="border-amber-300 text-amber-800 hover:bg-amber-100/60 font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refresh Status</span>
                  </Button>
                )}
                {statusResult.statusBadge === 'REJECTED' && (
                  <Link href="/register">
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer">
                      <span>Submit New Application</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Status Narrative */}
            <div className="pt-6">
              {statusResult.statusBadge === 'APPROVED' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-200 text-emerald-900 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-2 text-emerald-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Institutional Partition Activated
                  </div>
                  <p>
                    Your school onboarding application has been verified and fully approved by InnovatMind Super Admin HQ. Your school administrator credentials are now active. You can log into your dashboard using your registered email.
                  </p>
                </div>
              )}

              {statusResult.statusBadge === 'PENDING' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                  <div className="font-bold flex items-center gap-2 text-amber-950">
                    <Clock className="w-4 h-4 text-amber-600" />
                    Application Under Active Review
                  </div>
                  <p>
                    Your submission is queued in the Super Admin Central Verification Inbox. Expected turnaround time is 24 to 48 business hours. As soon as HQ verifies your board affiliation, your login credentials will be enabled automatically.
                  </p>
                </div>
              )}

              {statusResult.statusBadge === 'REJECTED' && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200 text-rose-900 text-xs font-medium space-y-2">
                  <div className="font-bold flex items-center gap-2 text-rose-950">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Application Not Approved by Super Admin
                  </div>
                  <p>
                    {statusResult.decisionNotes 
                      ? `Review Decision Feedback: "${statusResult.decisionNotes}"`
                      : 'The application could not be verified with the provided information. Please review the registration requirements and submit an updated application or contact support.'}
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Timeline */}
            <div className="mt-8 pt-6 border-t border-slate-200/80">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Onboarding Progress
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-2xs flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">1. Submitted</div>
                    <div className="text-slate-500 text-[11px]">
                      {statusResult.submittedAt ? new Date(statusResult.submittedAt).toLocaleDateString() : 'Recorded'}
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`p-3.5 rounded-2xl border shadow-2xs flex items-center gap-3 ${
                  statusResult.statusBadge === 'APPROVED'
                    ? 'bg-white border-emerald-200'
                    : statusResult.statusBadge === 'REJECTED'
                      ? 'bg-white border-rose-200'
                      : 'bg-amber-50/70 border-amber-300'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    statusResult.statusBadge === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : statusResult.statusBadge === 'REJECTED'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-amber-100 text-amber-700 animate-pulse'
                  }`}>
                    {statusResult.statusBadge === 'APPROVED' && <Check className="w-4 h-4" />}
                    {statusResult.statusBadge === 'REJECTED' && <XCircle className="w-4 h-4" />}
                    {statusResult.statusBadge === 'PENDING' && '2'}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">2. HQ Verification</div>
                    <div className="text-slate-500 text-[11px]">
                      {statusResult.statusBadge === 'APPROVED' ? 'Verified by Super Admin' : statusResult.statusBadge === 'REJECTED' ? 'Declined' : 'In Review'}
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`p-3.5 rounded-2xl border shadow-2xs flex items-center gap-3 ${
                  statusResult.statusBadge === 'APPROVED'
                    ? 'bg-white border-emerald-200'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    statusResult.statusBadge === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {statusResult.statusBadge === 'APPROVED' ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-900">3. Portal Active</div>
                    <div className="text-slate-500 text-[11px]">
                      {statusResult.statusBadge === 'APPROVED' ? 'Live & Operational' : 'Pending Verification'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Detailed Verification Ledger */}
          <Card className="light-glass p-6 sm:p-8 rounded-3xl shadow-lg border-slate-200/80 bg-white">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <SchoolIcon className="w-4 h-4 text-indigo-600" />
              Application Records & Audit Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold block">Unique Registration ID</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900 text-sm">{statusResult.registrationId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyId(statusResult.registrationId)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                    title="Copy Registration ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold block">Assigned School Code</span>
                <span className="font-mono font-bold text-indigo-700 text-sm block">{statusResult.code}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold block">Registered Contact Email</span>
                <span className="font-bold text-slate-900 block">{statusResult.maskedEmail}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-slate-500 font-semibold block">Submission Timestamp</span>
                <span className="font-bold text-slate-900 block">
                  {statusResult.submittedAt ? new Date(statusResult.submittedAt).toLocaleString() : 'N/A'}
                </span>
              </div>

              {statusResult.reviewedAt && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-semibold block">Super Admin Review Date</span>
                  <span className="font-bold text-slate-900 block">
                    {new Date(statusResult.reviewedAt).toLocaleString()}
                  </span>
                </div>
              )}

              {statusResult.reviewedBy && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-semibold block">Reviewing Authority</span>
                  <span className="font-bold text-slate-900 block">{statusResult.reviewedBy}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Helpful Links & FAQ */}
      <div className="p-5 rounded-3xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-indigo-950">Have questions about your institutional onboarding?</div>
            <div className="text-indigo-700">Contact the InnovatMind verification desk at support@innovatmind.com</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="font-bold text-indigo-700 hover:text-indigo-900">
            Sign In →
          </Link>
          <span className="text-indigo-300">•</span>
          <Link href="/register" className="font-bold text-indigo-700 hover:text-indigo-900">
            Register Another School →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SchoolStatusTrackerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col light-subtle-mesh selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center font-extrabold text-white shadow-md">
              IM
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-2">
                InnovatMind <span className="text-indigo-600 font-semibold">School OS</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Application Status
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/register"
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors hidden sm:inline"
            >
              School Registration
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content wrapped in Suspense for useSearchParams */}
      <main className="flex-1">
        <Suspense fallback={
          <div className="p-12 text-center text-xs text-slate-500 font-medium">
            Loading verification service...
          </div>
        }>
          <StatusTrackerContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium">
        InnovatMind School OS • Enterprise Multi-Tenant Architecture & Verification Service
      </footer>
    </div>
  );
}
