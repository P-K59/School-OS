"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { SchoolType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  UserCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  School as SchoolIcon,
  CheckCircle2,
  Mail,
  Lock,
  Phone,
  MapPin,
  Users,
  Cpu,
  Layers,
  CreditCard
} from 'lucide-react';

export default function SchoolRegisterPage() {
  const router = useRouter();
  const { registerSchool } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Institution State
  const [schoolName, setSchoolName] = useState('Pune Future Tech Academy');
  const [schoolType, setSchoolType] = useState<SchoolType>('CBSE');
  const [city, setCity] = useState('Pune');
  const [stateName, setStateName] = useState('Maharashtra');
  const [address, setAddress] = useState('Hinjawadi IT Park, Phase 1');
  const [postalCode, setPostalCode] = useState('411057');
  const [officialEmail, setOfficialEmail] = useState('principal@punetech.edu.in');
  const [phone, setPhone] = useState('+91 98230 11223');
  const [studentCapacity, setStudentCapacity] = useState(850);
  const [staffCapacity, setStaffCapacity] = useState(54);

  // Principal State
  const [principalFirstName, setPrincipalFirstName] = useState('Dr. Priya');
  const [principalLastName, setPrincipalLastName] = useState('Deshmukh');
  const [principalEmail, setPrincipalEmail] = useState('priya.deshmukh@punetech.edu.in');
  const [password, setPassword] = useState('password123');
  const [designation, setDesignation] = useState('Principal & Director');

  // Add-ons State
  const [hasStemLabs, setHasStemLabs] = useState(true);
  const [hasCodingArcade, setHasCodingArcade] = useState(true);
  const [hasFeeGateway, setHasFeeGateway] = useState(true);

  // Computed tenant code
  const cityCode = city.trim().slice(0, 3).toUpperCase() || 'SCH';
  const computedSchoolCode = `SCH-${cityCode}-004`;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await registerSchool(
      {
        name: schoolName,
        schoolType: schoolType,
        email: officialEmail,
        phone: phone,
        address: address,
        city: city,
        state: stateName,
        country: 'India',
        postalCode: postalCode,
        totalStudents: Number(studentCapacity),
        totalStaff: Number(staffCapacity),
      },
      {
        firstName: principalFirstName,
        lastName: principalLastName,
        email: principalEmail || officialEmail,
        password: password,
        designation: designation,
        phone: phone,
      }
    );

    if (result.success) {
      setSuccessNotice(`Institution "${result.school.name}" successfully registered with code ${result.school.code}! Launching Mission Control...`);
      setTimeout(() => {
        router.push('/school');
      }, 1200);
    }
  };

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
                  Institutional Registration
                </span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">Already registered?</span>
            <Link
              href="/login"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Sign In to Existing School →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold mb-3 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multi-Tenant School Onboarding</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Register Your School Institution
          </h1>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Instantly spin up an isolated ERP, Fee Ledger, and STEM Robotics Lab workspace tailored to your board affiliation.
          </p>
        </div>

        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-6">
          {/* Section 1: Institutional Core Profile */}
          <Card className="light-glass p-6 sm:p-8 rounded-3xl shadow-md border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                  <SchoolIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">1. School Information & Affiliation</h2>
                  <p className="text-xs text-slate-500 font-medium">Official accreditation details and location</p>
                </div>
              </div>

              {/* Dynamic School Code Generated Badge */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tenant Code Preview</span>
                <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {computedSchoolCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Official School Name *</label>
                <Input
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Pune Future Tech Academy"
                  className="bg-white border-slate-300 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Board / Curriculum *</label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                >
                  <option value="CBSE">CBSE (Central Board)</option>
                  <option value="ICSE">ICSE / ISC</option>
                  <option value="IB">IB (International Baccalaureate)</option>
                  <option value="CAMBRIDGE">Cambridge IGCSE</option>
                  <option value="STATE">State Board</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                <Input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Pune"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">State *</label>
                <Input
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Postal PIN Code</label>
                <Input
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="411057"
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Campus Street Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Hinjawadi IT Park, Phase 1"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Contact Email *</label>
                <Input
                  type="email"
                  required
                  value={officialEmail}
                  onChange={(e) => setOfficialEmail(e.target.value)}
                  placeholder="admin@punetech.edu.in"
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Official Phone *</label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98230 11223"
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Student Enrollment Size</label>
                <Input
                  type="number"
                  min={50}
                  value={studentCapacity}
                  onChange={(e) => setStudentCapacity(Number(e.target.value))}
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Faculty & Staff Count</label>
                <Input
                  type="number"
                  min={5}
                  value={staffCapacity}
                  onChange={(e) => setStaffCapacity(Number(e.target.value))}
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Principal / Admin Credentials */}
          <Card className="light-glass p-6 sm:p-8 rounded-3xl shadow-md border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">2. Principal / Administrator Profile</h2>
                <p className="text-xs text-slate-500 font-medium">This administrator will have single-tenant authority over your school</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">First Name *</label>
                <Input
                  required
                  value={principalFirstName}
                  onChange={(e) => setPrincipalFirstName(e.target.value)}
                  placeholder="e.g. Dr. Priya"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Last Name *</label>
                <Input
                  required
                  value={principalLastName}
                  onChange={(e) => setPrincipalLastName(e.target.value)}
                  placeholder="e.g. Deshmukh"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Designation</label>
                <Input
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Principal & Director"
                  className="bg-white border-slate-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Login Email *</label>
                <Input
                  type="email"
                  required
                  value={principalEmail}
                  onChange={(e) => setPrincipalEmail(e.target.value)}
                  placeholder="priya.d@punetech.edu.in"
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Admin Password *</label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white border-slate-300 text-xs font-mono"
                />
              </div>

              <div className="flex items-center pt-5">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Locked strictly to School ID</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: InnovatMind Modules & EdTech Stack */}
          <Card className="light-glass p-6 sm:p-8 rounded-3xl shadow-md border-slate-200">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">3. Activate InnovatMind Pro Modules</h2>
                <p className="text-xs text-slate-500 font-medium">Select automated features enabled for your student body and staff</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                hasStemLabs ? 'bg-indigo-50/60 border-indigo-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={hasStemLabs}
                    onChange={(e) => setHasStemLabs(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
                  />
                </div>
                <div className="mt-3">
                  <div className="font-extrabold text-xs text-slate-900">STEM Robotics Lab</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Virtual Rover simulator, obstacle avoidance maps & Arduino kits.
                  </p>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                hasCodingArcade ? 'bg-purple-50/60 border-purple-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={hasCodingArcade}
                    onChange={(e) => setHasCodingArcade(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
                  />
                </div>
                <div className="mt-3">
                  <div className="font-extrabold text-xs text-slate-900">Python Coding Arcade</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Interactive Python editor with automated test validation & XP badges.
                  </p>
                </div>
              </label>

              <label className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                hasFeeGateway ? 'bg-emerald-50/60 border-emerald-300 shadow-xs' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <input
                    type="checkbox"
                    checked={hasFeeGateway}
                    onChange={(e) => setHasFeeGateway(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-1"
                  />
                </div>
                <div className="mt-3">
                  <div className="font-extrabold text-xs text-slate-900">Instant Fee Ledger</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Multi-channel UPI collection, receipt generator, and overdue tracking.
                  </p>
                </div>
              </label>
            </div>
          </Card>

          {/* Submission Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-lg">
            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
              By registering, your institution will receive an isolated tenant partition with strict PostgreSQL RLS.
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-8 py-3 rounded-2xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Spinning Up Workspace...' : 'Register School & Launch Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500 font-medium mt-12">
        InnovatMind School OS • Enterprise Multi-Tenant Architecture & Child Privacy Compliant
      </footer>
    </div>
  );
}
