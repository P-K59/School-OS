"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { School, SchoolType, SchoolOnboardingStage } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Check,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Users,
  ShieldCheck,
  Sparkles,
  FileText
} from 'lucide-react';

export default function NewSchoolRegistrationPage() {
  const router = useRouter();
  const { schools, createSchool } = useAuth();

  const [form, setForm] = useState({
    name: '',
    code: '',
    schoolType: 'CBSE' as SchoolType,
    region: 'North',
    city: '',
    state: '',
    country: 'India',
    address: '',
    postalCode: '',
    email: '',
    phone: '',
    principalName: '',
    principalEmail: '',
    contactPersonName: '',
    contactPersonPhone: '',
    contactPersonEmail: '',
    academicSession: '2026-2027',
    totalStudents: 600,
    totalStaff: 35,
    onboardingStatus: 'ACTIVE' as SchoolOnboardingStage,
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: '',
  });

  const [codeTouched, setCodeTouched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionedResult, setProvisionedResult] = useState<{
    school: School;
    loginId?: string;
    tempPassword?: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-generate recommended code when city or name changes if user hasn't explicitly customized
  const handleAutoCode = (cityName: string) => {
    if (!codeTouched) {
      const cityPrefix = (cityName || 'IND').slice(0, 3).toUpperCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      setForm(prev => ({ ...prev, code: `SCH-${cityPrefix}-${randomNum}` }));
    }
  };

  // Real-time check for duplicate school code
  const isDuplicateCode = form.code.trim() && schools.some(
    s => s.code.toUpperCase() === form.code.trim().toUpperCase()
  );

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!form.name.trim()) {
      setErrorMsg('School Name is required.');
      return;
    }
    if (!form.code.trim()) {
      setErrorMsg('Unique School Code is required.');
      return;
    }
    if (isDuplicateCode) {
      setErrorMsg(`School Code '${form.code}' is already registered. Please enter a unique code.`);
      return;
    }
    if (!form.city.trim() || !form.state.trim()) {
      setErrorMsg('City and State are required.');
      return;
    }
    if (!form.email.trim()) {
      setErrorMsg('Official School Email is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createSchool({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        schoolType: form.schoolType,
        region: form.region,
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country,
        address: form.address.trim() || form.city,
        postalCode: form.postalCode.trim() || '110001',
        email: form.email.trim(),
        phone: form.phone.trim() || '+91 98000 00000',
        principalName: form.principalName.trim() || 'Principal In-charge',
        contactPersonName: form.contactPersonName.trim() || form.principalName.trim(),
        contactPersonPhone: form.contactPersonPhone.trim() || form.phone.trim(),
        contactPersonEmail: form.contactPersonEmail.trim() || form.email.trim(),
        academicSession: form.academicSession,
        totalStudents: Number(form.totalStudents) || 500,
        totalStaff: Number(form.totalStaff) || 30,
        onboardingStatus: form.onboardingStatus,
        contractStartDate: form.contractStartDate,
        contractEndDate: form.contractEndDate,
        notes: form.notes.trim(),
        isActive: form.onboardingStatus === 'ACTIVE'
      });

      if (res.success && res.school) {
        setProvisionedResult({
          school: res.school,
          loginId: res.school.adminCredentials?.loginId,
          tempPassword: res.school.adminCredentials?.temporaryPassword
        });
      } else {
        setErrorMsg(res.error || 'Failed to register school.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/admin/schools" className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold">
            <ChevronLeft className="w-4 h-4" />
            Back to School Management
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-800">Add New Partner Institution</span>
        </div>

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Provision New School
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Register a partner institution, assign academic tiers, configure contract periods, and generate automated school admin credentials.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {provisionedResult && (
          <Card className="p-6 bg-gradient-to-br from-emerald-50 via-white to-indigo-50 border-2 border-emerald-500/40 shadow-xl rounded-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  School Provisioned Successfully! 🎉
                </h3>
                <p className="text-xs text-slate-600">
                  {provisionedResult.school.name} is now registered under code{' '}
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                    {provisionedResult.school.code}
                  </span>.
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Key className="w-4 h-4 text-amber-500" />
                <span>Generated Institutional School Admin Credentials</span>
                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                  One-time View
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Admin Login ID</span>
                    <span className="font-mono font-bold text-slate-900">{provisionedResult.loginId}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(provisionedResult.loginId || '', 'loginId')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                  >
                    {copiedKey === 'loginId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Temporary Password</span>
                    <span className="font-mono font-bold text-slate-900">{provisionedResult.tempPassword}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(provisionedResult.tempPassword || '', 'tempPassword')}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                  >
                    {copiedKey === 'tempPassword' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                These credentials can be shared with the School Principal or Administrator to access their dedicated school portal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/admin/schools">
                <Button variant="outline" className="text-xs font-semibold border-slate-300">
                  Return to Schools List
                </Button>
              </Link>
              <Link href={`/admin/schools/${provisionedResult.school.id}`}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-2">
                  <span>View School Workspace</span>
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Registration Form */}
        {!provisionedResult && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Section 1: Basic Identity */}
            <Card className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                1. Institutional Identity & Board Affiliation
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Heritage Valley Public School"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Unique School Code <span className="text-rose-500">*</span></span>
                    {isDuplicateCode && (
                      <span className="text-[10px] text-rose-600 font-semibold">Duplicate code exists!</span>
                    )}
                  </label>
                  <Input
                    placeholder="e.g. SCH-DEL-014"
                    value={form.code}
                    onChange={(e) => {
                      setCodeTouched(true);
                      setForm({ ...form, code: e.target.value.toUpperCase() });
                    }}
                    required
                    className={`h-10 text-xs font-mono rounded-xl uppercase ${isDuplicateCode ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/30' : ''}`}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    School Board / Affiliation <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.schoolType}
                    onChange={(e) => setForm({ ...form, schoolType: e.target.value as SchoolType })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="CBSE">CBSE (Central Board of Secondary Education)</option>
                    <option value="ICSE">ICSE (Indian Certificate of Secondary Education)</option>
                    <option value="STATE">State Government Affiliated</option>
                    <option value="IB">IB World School (International Baccalaureate)</option>
                    <option value="CAMBRIDGE">Cambridge International (CIE)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Geographic Region
                  </label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="North">North Region (Delhi, UP, Punjab, Haryana)</option>
                    <option value="West">West Region (Maharashtra, Gujarat, Goa)</option>
                    <option value="South">South Region (Karnataka, TN, Telangana, Kerala)</option>
                    <option value="Central">Central Region (Madhya Pradesh, Chhattisgarh)</option>
                    <option value="East">East Region (West Bengal, Odisha, Bihar)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Section 2: Location & Address */}
            <Card className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                2. Location & Campus Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Pune"
                    value={form.city}
                    onChange={(e) => {
                      setForm({ ...form, city: e.target.value });
                      handleAutoCode(e.target.value);
                    }}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Postal PIN Code
                  </label>
                  <Input
                    placeholder="e.g. 411001"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    Street Address & Campus Landmark
                  </label>
                  <Input
                    placeholder="e.g. Plot 45, Knowledge Park, Off Express Highway"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </Card>

            {/* Section 3: Official Contacts & Leadership */}
            <Card className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Users className="w-4 h-4 text-indigo-600" />
                3. Leadership & Official Communication
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Principal / Head of Institution
                  </label>
                  <Input
                    placeholder="e.g. Dr. Rajeshwari Sengupta"
                    value={form.principalName}
                    onChange={(e) => setForm({ ...form, principalName: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official School Email <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="admin@school.edu.in"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Official Phone Number
                  </label>
                  <Input
                    placeholder="+91 98000 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Designated STEM Coordinator Name
                  </label>
                  <Input
                    placeholder="e.g. Amitava Bose (HOD Computer Sc)"
                    value={form.contactPersonName}
                    onChange={(e) => setForm({ ...form, contactPersonName: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>
              </div>
            </Card>

            {/* Section 4: Academic Sizing & Contract Lifecycle */}
            <Card className="p-5 bg-white border border-slate-200/80 shadow-sm rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                4. Academic Session, Student Capacity & Contract
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Active Academic Session
                  </label>
                  <select
                    value={form.academicSession}
                    onChange={(e) => setForm({ ...form, academicSession: e.target.value })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    <option value="2026-2027">2026-2027 (Current Active)</option>
                    <option value="2025-2026">2025-2026 (Prior Cycle)</option>
                    <option value="2027-2028">2027-2028 (Upcoming Cycle)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estimated Student Enrollment
                  </label>
                  <Input
                    type="number"
                    min="10"
                    value={form.totalStudents}
                    onChange={(e) => setForm({ ...form, totalStudents: Number(e.target.value) })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Estimated Faculty & Staff
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.totalStaff}
                    onChange={(e) => setForm({ ...form, totalStaff: Number(e.target.value) })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Onboarding Status
                  </label>
                  <select
                    value={form.onboardingStatus}
                    onChange={(e) => setForm({ ...form, onboardingStatus: e.target.value as SchoolOnboardingStage })}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    <option value="ACTIVE">Active (Live Tenant)</option>
                    <option value="ONBOARDING">Onboarding (Setup in Progress)</option>
                    <option value="CONTRACT_STAGE">Contract Stage (Signing)</option>
                    <option value="DEMO_SCHEDULED">Demo Scheduled</option>
                    <option value="IN_DISCUSSION">In Discussion</option>
                    <option value="ENQUIRY">Initial Enquiry</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contract Start Date
                  </label>
                  <Input
                    type="date"
                    value={form.contractStartDate}
                    onChange={(e) => setForm({ ...form, contractStartDate: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contract End Date
                  </label>
                  <Input
                    type="date"
                    value={form.contractEndDate}
                    onChange={(e) => setForm({ ...form, contractEndDate: e.target.value })}
                    className="h-10 text-xs rounded-xl"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="font-bold text-slate-700 block mb-1">
                    Internal Partnership Notes & Special Terms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter any custom hardware lab commitments, discount approvals, or curriculum rollouts..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </Card>

            {/* Submit Bar */}
            <div className="flex items-center justify-between pt-2">
              <Link href="/admin/schools">
                <Button type="button" variant="outline" className="text-xs border-slate-200">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting || Boolean(isDuplicateCode)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs px-6 h-11 shadow-lg shadow-indigo-500/20 gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {isSubmitting ? 'Provisioning School...' : 'Provision Institution & Generate Credentials'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
