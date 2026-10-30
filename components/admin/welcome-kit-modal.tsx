"use client";

import React, { useState, useEffect } from 'react';
import { School } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import {
  X,
  Copy,
  Check,
  Printer,
  Mail,
  Share2,
  Send,
  Eye,
  EyeOff,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Building2,
  Calendar,
  Lock,
  User,
  GraduationCap,
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';

interface WelcomeKitModalProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatched?: (updatedSchool: School) => void;
}

export function WelcomeKitModal({ school, isOpen, onClose, onDispatched }: WelcomeKitModalProps) {
  const { dispatchWelcomeKit } = useAuth();
  const [activeTab, setActiveTab] = useState<'CREDENTIALS' | 'LETTER' | 'SHARE'>('CREDENTIALS');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(school);

  useEffect(() => {
    setCurrentSchool(school);
    setShowPassword(false);
    setCopiedType(null);
  }, [school]);

  if (!isOpen || !currentSchool) return null;

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://schoolos.innovatmind.internal';
  const loginUrl = `${originUrl}/login`;
  
  const loginId = currentSchool.adminCredentials?.loginId || `admin.${(currentSchool.code || currentSchool.id).toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolos.internal`;
  const tempPassword = currentSchool.adminCredentials?.temporaryPassword || `Innovat#${currentSchool.code || '2026'}!`;
  const regId = currentSchool.registrationId || `IMS-${new Date().getFullYear()}-${currentSchool.code.replace(/[^0-9]/g, '').padStart(6, '0') || '000101'}`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // fallback
    }
  };

  const emailSubject = `Welcome to InnovatMind School OS — Institutional Onboarding & Credentials (${currentSchool.name})`;
  
  const emailTemplateText = `Subject: ${emailSubject}

Dear ${currentSchool.principalName || 'Principal / School Leadership'},
${currentSchool.name},

Congratulations and welcome to InnovatMind School OS! Your institutional workspace has been provisioned and is now active for institutional deployment.

--- INSTITUTIONAL CREDENTIALS ---
• School Code: ${currentSchool.code}
• Registration ID: ${regId}
• School Portal Login URL: ${loginUrl}
• Principal / Administrator Login ID: ${loginId}
• Temporary Password: ${tempPassword}
• Authorized Role: SCHOOL_ADMIN (Principal & Director)

--- FIRST-TIME SETUP CHECKLIST ---
1. Login to the portal at ${loginUrl} using the credentials above.
2. Update your administrative password in Settings -> Security.
3. Configure your Academic Sessions, Grades, and Class Sections.
4. Add faculty members and enroll student cohorts to activate the STEM, Robotics, and LMS learning modules.

If you require any assistance with curriculum integration or trainer deployment, feel free to reply directly to this notice.

Sincerely,
InnovatMind Platform Operations HQ
Website: ${originUrl}`;

  const whatsappMessageText = `*Welcome to InnovatMind School OS!* 🎓
Institutional access has been activated for *${currentSchool.name}* (${currentSchool.code}).

🔑 *Admin Credentials:*
• *Portal URL:* ${loginUrl}
• *Login ID:* ${loginId}
• *Password:* ${tempPassword}
• *Registration Ref:* ${regId}

Please log in to complete institutional onboarding and classroom setup. Welcome aboard!`;

  const handlePrint = () => {
    window.print();
  };

  const handleMarkDispatched = async () => {
    if (!currentSchool) return;
    setIsDispatching(true);
    try {
      const res = await dispatchWelcomeKit(currentSchool.id);
      if (res.success && res.school) {
        setCurrentSchool(res.school);
        if (onDispatched) onDispatched(res.school);
      }
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white print:fixed-none">
      {/* Modal Dialog Container */}
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative border-b border-indigo-900/60 print:hidden">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-xl shrink-0">
              <GraduationCap className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                  Onboarding Welcome Kit & Credential Dispatcher
                </span>
                {currentSchool.welcomeKitDispatchedAt ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Dispatched on {new Date(currentSchool.welcomeKitDispatchedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Ready for Dispatch
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white">{currentSchool.name}</h2>
              <p className="text-xs text-slate-300 font-medium">
                Code: <strong className="text-indigo-200">{currentSchool.code}</strong> • Ref: <strong className="text-slate-200">{regId}</strong> • Principal: <strong className="text-white">{currentSchool.principalName || 'Appointed Head'}</strong>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('CREDENTIALS')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'CREDENTIALS'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Credentials & Quick Setup
            </button>
            <button
              onClick={() => setActiveTab('SHARE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SHARE'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Email & WhatsApp Copy
            </button>
            <button
              onClick={() => setActiveTab('LETTER')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'LETTER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Printable Handover Letter
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: CREDENTIALS & QUICK ACTIONS */}
          {activeTab === 'CREDENTIALS' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Credentials Card Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-slate-50 border border-indigo-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">Official Portal Login Credentials</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = `School: ${currentSchool.name}\nCode: ${currentSchool.code}\nPortal URL: ${loginUrl}\nLogin ID: ${loginId}\nPassword: ${tempPassword}`;
                      copyToClipboard(text, 'ALL_CREDS');
                    }}
                    className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 gap-1.5"
                  >
                    {copiedType === 'ALL_CREDS' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'ALL_CREDS' ? 'Copied Card!' : 'Copy Credentials'}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Portal URL */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Portal Login URL</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-800 truncate">{loginUrl}</span>
                      <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800" title="Open Portal">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* School Code */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">School Code</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-black text-indigo-600 text-sm">{currentSchool.code}</span>
                      <button onClick={() => copyToClipboard(currentSchool.code, 'CODE')} className="text-slate-400 hover:text-slate-700">
                        {copiedType === 'CODE' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Principal Login ID */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Principal Login ID / Email</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900 truncate">{loginId}</span>
                      <button onClick={() => copyToClipboard(loginId, 'LOGIN')} className="text-slate-400 hover:text-slate-700">
                        {copiedType === 'LOGIN' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Temporary Password */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Temporary Password</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {showPassword ? tempPassword : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(tempPassword, 'PASS')}
                          className="text-slate-400 hover:text-slate-700 p-0.5"
                          title="Copy Password"
                        >
                          {copiedType === 'PASS' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Principal will be prompted to replace this temporary password with a personal secure passphrase upon first login.</span>
                </div>
              </div>

              {/* 4-Step Quick Onboarding Roadmap */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Handover &amp; Launch Sequence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">1</span>
                      <span>Dispatch Welcome Kit</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Copy the pre-written invitation email or letter below and send it to {currentSchool.principalName || 'the Principal'}.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">2</span>
                      <span>First Admin Sign-In</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      School Admin logs into {loginUrl} with the issued credentials and activates 2FA / reset password.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">3</span>
                      <span>Setup Academic Classes</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Principal reviews enabled modules, sets up class sections (Grade 1-12) and invites academic coordinators.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center">4</span>
                      <span>Deploy STEM &amp; Robotics</span>
                    </div>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Master trainers from InnovatMind conduct on-site lab orientation and begin student coding sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHARE & COPY TEMPLATES */}
          {activeTab === 'SHARE' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Formal Email Copy */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Official Onboarding Email Template</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(emailTemplateText, 'EMAIL_BODY')}
                    className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-100/50 gap-1.5 cursor-pointer"
                  >
                    {copiedType === 'EMAIL_BODY' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'EMAIL_BODY' ? 'Copied Email Body!' : 'Copy Email Message'}</span>
                  </Button>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap max-h-52 overflow-y-auto leading-relaxed select-all">
                  {emailTemplateText}
                </div>
              </div>

              {/* WhatsApp / SMS Quick Text */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">WhatsApp / Instant Message Format</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(whatsappMessageText, 'WHATSAPP_BODY')}
                    className="h-8 text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 gap-1.5 cursor-pointer"
                  >
                    {copiedType === 'WHATSAPP_BODY' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'WHATSAPP_BODY' ? 'Copied WhatsApp Text!' : 'Copy WhatsApp Message'}</span>
                  </Button>
                </div>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono whitespace-pre-wrap leading-relaxed select-all">
                  {whatsappMessageText}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL PRINTABLE HANDOVER LETTER */}
          {activeTab === 'LETTER' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl print:hidden">
                <span className="text-xs text-slate-600 font-medium">
                  Click below to generate an official 1-page PDF handover certificate or print on physical letterhead.
                </span>
                <Button
                  onClick={handlePrint}
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-4 rounded-xl shadow-xs gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </Button>
              </div>

              {/* Printable Letterhead Document */}
              <div className="p-8 bg-white border border-slate-300 rounded-2xl shadow-sm text-slate-900 space-y-6 print:border-none print:shadow-none print:p-0">
                {/* Letter Header */}
                <div className="flex items-start justify-between border-b-2 border-indigo-900 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-black text-sm">
                        IM
                      </div>
                      <span className="text-xl font-black text-indigo-950 tracking-tight">INNOVATMIND SCHOOL OS</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                      National STEM &amp; Digital School Infrastructure Platform
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <span className="font-bold text-slate-900 block">OFFICIAL INSTITUTIONAL HANDOVER</span>
                    <span className="text-[11px] text-slate-500">Ref: {regId}</span>
                    <span className="text-[11px] text-slate-500 block">Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* To Address */}
                <div className="text-xs space-y-1">
                  <p className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">HANDOVER RECIPIENT:</p>
                  <p className="font-bold text-sm text-slate-950">{currentSchool.name}</p>
                  <p className="text-slate-700 font-medium">Attention: {currentSchool.principalName || 'Principal & Board of Governors'}</p>
                  <p className="text-slate-600">{currentSchool.address}, {currentSchool.city}, {currentSchool.state} - {currentSchool.postalCode}</p>
                </div>

                {/* Formal Statement */}
                <p className="text-xs leading-relaxed text-slate-800">
                  We are pleased to formally certify that <strong>{currentSchool.name}</strong> (Institutional Code: <code>{currentSchool.code}</code>) has been successfully verified, accredited, and activated on the InnovatMind School OS multi-tenant cloud platform. Portal access credentials for administrative control and LMS deployment are hereby granted:
                </p>

                {/* Credential Box */}
                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 border-b border-slate-300 uppercase tracking-wider text-[10px]">
                    Master Administrative Credentials
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Portal Access Link</span>
                      <span className="font-mono font-bold text-slate-900 text-xs block">{loginUrl}</span>
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">School Institutional Code</span>
                      <span className="font-mono font-black text-indigo-700 text-xs block">{currentSchool.code}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-slate-200 border-t border-slate-200">
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Principal Login ID</span>
                      <span className="font-mono font-bold text-slate-900 text-xs block">{loginId}</span>
                    </div>
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Initial Temporary Password</span>
                      <span className="font-mono font-bold text-slate-900 text-xs block">{tempPassword}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code / Portal Scan Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-slate-950 block">Mobile &amp; Web Quick Launch</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Scan the security QR code with any smartphone camera to launch the encrypted login gateway directly without typing the URL.
                    </p>
                  </div>
                  <div className="w-20 h-20 bg-white border border-slate-300 rounded-xl p-1.5 shrink-0 flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-slate-800" />
                  </div>
                </div>

                {/* Sign-off & Seal */}
                <div className="flex items-end justify-between pt-6 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Provisioned by</span>
                    <span className="font-bold text-slate-900">InnovatMind Operations Directorate</span>
                    <span className="text-slate-500 block text-[11px]">Bangalore • New Delhi • Mumbai</span>
                  </div>
                  <div className="text-right">
                    <div className="w-32 border-b border-slate-400 pb-1 mb-1 text-center font-serif italic text-slate-700">
                      Pankaj Kumar
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {currentSchool.welcomeKitDispatchedAt ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Dispatched by {currentSchool.welcomeKitDispatchedBy || 'Super Admin HQ'}
              </span>
            ) : (
              <span>Not yet recorded as dispatched to the school.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs text-slate-600 border-slate-200 h-9 px-4 rounded-xl"
            >
              Close
            </Button>

            {!currentSchool.welcomeKitDispatchedAt && (
              <Button
                size="sm"
                disabled={isDispatching}
                onClick={handleMarkDispatched}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDispatching ? 'Recording Dispatch...' : 'Mark as Dispatched'}</span>
              </Button>
            )}

            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs h-9 px-4 rounded-xl gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Handover</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
