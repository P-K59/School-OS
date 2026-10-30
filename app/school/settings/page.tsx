"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sliders,
  Sparkles,
  Building2,
  Palette,
  CheckCircle2,
  FileText,
  CreditCard,
  GraduationCap,
  ShieldCheck,
  Globe,
  Phone,
  User,
  Calendar,
  Save,
  RotateCcw,
  Eye,
  Award,
  Layers,
  Check,
  QrCode,
  Link as LinkIcon,
  UploadCloud,
  CheckCircle,
  Copy,
  ExternalLink,
  Lock,
  ChevronRight,
  Shield
} from 'lucide-react';

const BRAND_THEMES = [
  { id: 'indigo', name: 'Royal Indigo', hex: '#4f46e5', accent: '#06b6d4', bgLight: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-600', gradient: 'from-indigo-600 to-purple-600' },
  { id: 'emerald', name: 'Emerald STEM', hex: '#059669', accent: '#10b981', bgLight: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-600', gradient: 'from-emerald-600 to-teal-700' },
  { id: 'blue', name: 'Sapphire Ocean', hex: '#2563eb', accent: '#38bdf8', bgLight: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600', gradient: 'from-blue-600 to-indigo-700' },
  { id: 'crimson', name: 'Crimson Ruby', hex: '#e11d48', accent: '#fb7185', bgLight: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-600', gradient: 'from-rose-600 to-pink-700' },
  { id: 'violet', name: 'Imperial Violet', hex: '#7c3aed', accent: '#c084fc', bgLight: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600', gradient: 'from-purple-600 to-violet-800' },
  { id: 'amber', name: 'Solar Amber', hex: '#d97706', accent: '#fbbf24', bgLight: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-600', gradient: 'from-amber-600 to-orange-700' },
  { id: 'teal', name: 'Cyber Teal', hex: '#0d9488', accent: '#2dd4bf', bgLight: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-600', gradient: 'from-teal-600 to-emerald-700' },
  { id: 'slate', name: 'Midnight Slate', hex: '#0f172a', accent: '#64748b', bgLight: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-800', gradient: 'from-slate-800 to-slate-950' },
];

const CREST_ICONS = [
  { id: 'shield', name: 'Heritage Shield', icon: ShieldCheck },
  { id: 'award', name: 'Academic Laurels', icon: Award },
  { id: 'sparkles', name: 'STEM Innovation', icon: Sparkles },
  { id: 'cap', name: 'Scholastic Cap', icon: GraduationCap },
  { id: 'globe', name: 'Global Academy', icon: Globe },
  { id: 'crest', name: 'Emblem Crest', icon: Shield },
];

export default function SchoolBrandingSettingsPage() {
  const { activeSchool, updateSchoolBranding } = useAuth();

  const [formData, setFormData] = useState({
    name: activeSchool.name || '',
    portalTitle: activeSchool.portalTitle || activeSchool.name || '',
    slogan: activeSchool.slogan || 'Fostering Innovation, Scientific Curiosity & Leadership',
    tagline: activeSchool.tagline || 'Excellence in AI, Robotics & Future-Ready Education',
    boardAffiliation: activeSchool.boardAffiliation || 'CBSE Board (Affiliation #930214)',
    establishedYear: activeSchool.establishedYear || '2008',
    principalName: activeSchool.principalName || 'Dr. Rajeshwari Sharma, Ph.D.',
    websiteUrl: activeSchool.websiteUrl || 'https://stxavier-cyber.edu.in',
    phone: activeSchool.phone || '+91 98765 43210',
    brandThemeColor: activeSchool.brandThemeColor || '#4f46e5',
    brandAccentColor: activeSchool.brandAccentColor || '#06b6d4',
    logoCrest: activeSchool.logoCrest || 'shield',
    logoUrl: activeSchool.logoUrl || '',
    subdomain: activeSchool.subdomain || activeSchool.code?.toLowerCase().replace('sch-', '') || 'horizon',
    customDomain: activeSchool.customDomain || '',
  });

  const [activePreviewTab, setActivePreviewTab] = useState<'HEADER' | 'REPORT' | 'RECEIPT' | 'IDCARD'>('HEADER');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCopiedDomain, setIsCopiedDomain] = useState(false);

  // Sync state when active school switches
  useEffect(() => {
    setFormData({
      name: activeSchool.name || '',
      portalTitle: activeSchool.portalTitle || activeSchool.name || '',
      slogan: activeSchool.slogan || 'Fostering Innovation, Scientific Curiosity & Leadership',
      tagline: activeSchool.tagline || 'Excellence in AI, Robotics & Future-Ready Education',
      boardAffiliation: activeSchool.boardAffiliation || 'CBSE Board (Affiliation #930214)',
      establishedYear: activeSchool.establishedYear || '2008',
      principalName: activeSchool.principalName || 'Dr. Rajeshwari Sharma, Ph.D.',
      websiteUrl: activeSchool.websiteUrl || 'https://stxavier-cyber.edu.in',
      phone: activeSchool.phone || '+91 98765 43210',
      brandThemeColor: activeSchool.brandThemeColor || '#4f46e5',
      brandAccentColor: activeSchool.brandAccentColor || '#06b6d4',
      logoCrest: activeSchool.logoCrest || 'shield',
      logoUrl: activeSchool.logoUrl || '',
      subdomain: activeSchool.subdomain || activeSchool.code?.toLowerCase().replace('sch-', '') || 'horizon',
      customDomain: activeSchool.customDomain || '',
    });
  }, [activeSchool]);

  const selectedTheme = BRAND_THEMES.find(t => t.hex.toLowerCase() === formData.brandThemeColor.toLowerCase()) || BRAND_THEMES[0];
  const SelectedCrest = (CREST_ICONS.find(c => c.id === formData.logoCrest) || CREST_ICONS[0]).icon;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolBranding({
      name: formData.name,
      portalTitle: formData.portalTitle,
      slogan: formData.slogan,
      tagline: formData.tagline,
      boardAffiliation: formData.boardAffiliation,
      establishedYear: formData.establishedYear,
      principalName: formData.principalName,
      websiteUrl: formData.websiteUrl,
      phone: formData.phone,
      brandThemeColor: formData.brandThemeColor,
      brandAccentColor: formData.brandAccentColor,
      logoCrest: formData.logoCrest,
      logoUrl: formData.logoUrl,
      subdomain: formData.subdomain.trim().toLowerCase(),
      customDomain: formData.customDomain.trim().toLowerCase(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = () => {
    setFormData({
      name: activeSchool.name,
      portalTitle: activeSchool.name,
      slogan: 'Fostering Innovation, Scientific Curiosity & Leadership',
      tagline: 'Excellence in AI, Robotics & Future-Ready Education',
      boardAffiliation: 'CBSE Affiliated #930214',
      establishedYear: '2008',
      principalName: 'Dr. Rajeshwari Sharma, Ph.D.',
      websiteUrl: 'https://stxavier-cyber.edu.in',
      phone: '+91 98765 43210',
      brandThemeColor: '#4f46e5',
      brandAccentColor: '#06b6d4',
      logoCrest: 'shield',
      logoUrl: '',
      subdomain: activeSchool.code?.toLowerCase().replace('sch-', '') || 'horizon',
      customDomain: '',
    });
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Page Top Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1" style={{ color: formData.brandThemeColor }}>
              <Sliders className="w-4 h-4" />
              <span>White-Label & Institution Identity Studio</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              White-Label Customization
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Customize your official school crest, brand colors, portal title, custom subdomain, report cards, and fee receipts for <span className="font-semibold text-slate-800">{activeSchool.name}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>White-Label Active</span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-md flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5" />
              <div>
                <div className="font-extrabold text-sm">School Branding & White-Label Settings Saved!</div>
                <div className="text-xs text-emerald-100">
                  Your sidebar, navigation bar, portal headers, student report cards, and fee receipts now reflect your custom identity.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Studio Grid: Left Form, Right Live Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Customization Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              
              {/* Section 1: School Identity */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    School Identity & Portal Title
                  </h2>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official School Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Delhi Public Horizon School"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Custom Portal Header Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.portalTitle}
                      onChange={(e) => setFormData({ ...formData, portalTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Horizon Campus Portal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Institutional Slogan / Motto
                    </label>
                    <input
                      type="text"
                      value={formData.slogan}
                      onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Empowering Tomorrow's Innovators"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tagline / Vision
                    </label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Center of Excellence in STEM & AI"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Board Affiliation & Code
                    </label>
                    <input
                      type="text"
                      value={formData.boardAffiliation}
                      onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. CBSE Affiliation #930214"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Year Established
                    </label>
                    <input
                      type="text"
                      value={formData.establishedYear}
                      onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. 2008"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Principal / Head of Institution
                    </label>
                    <input
                      type="text"
                      value={formData.principalName}
                      onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Dr. Rajeshwari Sharma, Ph.D."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Official Website
                    </label>
                    <input
                      type="text"
                      value={formData.websiteUrl}
                      onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://horizon.edu.in"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Logo Image & Crest Archetype */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  School Crest & Logo Image
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Custom School Logo URL (PNG/SVG with transparent background)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://example.com/school-crest-logo.png"
                    />
                    {formData.logoUrl && (
                      <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                        <img src={formData.logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Leave blank to automatically use one of the institutional crest archetypes below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Crest Archetype
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CREST_ICONS.map((crest) => {
                      const Icon = crest.icon;
                      const isSelected = formData.logoCrest === crest.id;
                      return (
                        <button
                          key={crest.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, logoCrest: crest.id })}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="text-[11px] truncate w-full">{crest.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Brand Color Palette */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-600" />
                    Brand Color Palette
                  </h2>
                  <span className="text-xs font-mono font-bold text-indigo-600">{formData.brandThemeColor}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {BRAND_THEMES.map((theme) => {
                    const isSelected = formData.brandThemeColor.toLowerCase() === theme.hex.toLowerCase();
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          brandThemeColor: theme.hex,
                          brandAccentColor: theme.accent
                        })}
                        className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'border-slate-900 ring-2 ring-slate-900 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-xs flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: theme.hex }}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-slate-800 block truncate">
                            {theme.name}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            {theme.hex}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Custom Primary Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.brandThemeColor}
                        onChange={(e) => setFormData({ ...formData, brandThemeColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer bg-white p-1"
                      />
                      <input
                        type="text"
                        value={formData.brandThemeColor}
                        onChange={(e) => setFormData({ ...formData, brandThemeColor: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                        placeholder="#4f46e5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Custom Accent Color (Hex)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.brandAccentColor}
                        onChange={(e) => setFormData({ ...formData, brandAccentColor: e.target.value })}
                        className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer bg-white p-1"
                      />
                      <input
                        type="text"
                        value={formData.brandAccentColor}
                        onChange={(e) => setFormData({ ...formData, brandAccentColor: e.target.value })}
                        className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900"
                        placeholder="#06b6d4"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Subdomain & White-Label Domain Routing */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" />
                  White-Label Subdomain & Custom URL
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Dedicated School Subdomain
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={formData.subdomain}
                        onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                        className="flex-1 px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-200 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        placeholder="horizon"
                      />
                      <span className="px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-r-xl text-xs font-semibold text-slate-500">
                        .schoolos.in
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Custom Domain (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.customDomain}
                      onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                      placeholder="portal.horizon.edu.in"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SSL Certificate Status: <strong>Active & Auto-Renewed</strong></span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                    CNAME ROUTED
                  </span>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: formData.brandThemeColor }}
                >
                  <Save className="w-4 h-4" />
                  <span>Save & Apply White-Label Identity</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Interactive Previews (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Live Identity Preview
                  </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('HEADER')}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activePreviewTab === 'HEADER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Portal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('REPORT')}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activePreviewTab === 'REPORT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Report Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('RECEIPT')}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activePreviewTab === 'RECEIPT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePreviewTab('IDCARD')}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      activePreviewTab === 'IDCARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    ID Card
                  </button>
                </div>
              </div>

              {/* Preview 1: Portal Header & Sidebar */}
              {activePreviewTab === 'HEADER' && (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-[#0B0F19] text-white p-4 border border-slate-800 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Logo" className="w-7 h-7 rounded-lg object-contain bg-white p-0.5" />
                        ) : (
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs font-bold text-xs"
                            style={{ backgroundColor: formData.brandThemeColor }}
                          >
                            <SelectedCrest className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-black truncate max-w-[180px]">{formData.portalTitle || formData.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">{formData.subdomain}.schoolos.in</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        Online
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center justify-between"
                        style={{ backgroundColor: formData.brandThemeColor }}
                      >
                        <span>Dashboard</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white">
                        Students Directory
                      </div>
                      <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white">
                        Staff & Teachers
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                    <span className="font-bold text-slate-700 block">Active Portal Address:</span>
                    <a
                      href={`https://${formData.subdomain}.schoolos.in`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <span>https://{formData.subdomain}.schoolos.in</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Preview 2: Student Term Report Card */}
              {activePreviewTab === 'REPORT' && (
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3 shadow-sm text-xs">
                  <div className="text-center pb-2 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-white" style={{ backgroundColor: formData.brandThemeColor }}>
                      <SelectedCrest className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{formData.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{formData.boardAffiliation} &bull; Est. {formData.establishedYear}</p>
                    <p className="text-[9px] italic text-slate-400 mt-0.5">&ldquo;{formData.slogan}&rdquo;</p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Student Name</span>
                      <span className="font-bold text-slate-900">Aarav Verma</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Grade & Roll</span>
                      <span className="font-bold text-slate-900">Grade 8-A (#04)</span>
                    </div>
                  </div>

                  <table className="w-full text-[10px] border border-slate-200 rounded-lg overflow-hidden">
                    <thead style={{ backgroundColor: formData.brandThemeColor, color: '#ffffff' }}>
                      <tr>
                        <th className="p-1.5 text-left">Subject</th>
                        <th className="p-1.5 text-right">Marks</th>
                        <th className="p-1.5 text-right">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-1.5 font-medium">Robotics & AI Kinematics</td>
                        <td className="p-1.5 text-right font-bold">95/100</td>
                        <td className="p-1.5 text-right font-bold text-emerald-600">A+</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-medium">Computer Science & Python</td>
                        <td className="p-1.5 text-right font-bold">92/100</td>
                        <td className="p-1.5 text-right font-bold text-emerald-600">A+</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 font-medium">Mathematics</td>
                        <td className="p-1.5 text-right font-bold">88/100</td>
                        <td className="p-1.5 text-right font-bold text-indigo-600">A</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
                    <div>
                      <span className="block font-bold text-slate-800">{formData.principalName}</span>
                      <span className="text-[9px]">Principal & Head of School</span>
                    </div>
                    <div className="w-12 h-6 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400">
                      SEAL
                    </div>
                  </div>
                </div>
              )}

              {/* Preview 3: Official Fee Receipt */}
              {activePreviewTab === 'RECEIPT' && (
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3 shadow-sm text-xs">
                  <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-black text-slate-900 text-xs">{formData.name}</h4>
                      <p className="text-[10px] text-slate-500">Official Institutional Fee Receipt</p>
                    </div>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: formData.brandThemeColor }}>
                      <SelectedCrest className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[10px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Receipt No:</span>
                      <span className="font-mono font-bold text-slate-800">RCP-2026-0891</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Student:</span>
                      <span className="font-bold text-slate-800">Aarav Verma (ADM-DEL-001)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Term:</span>
                      <span className="font-medium text-slate-800">Q1 Academic Session 2026-27</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900 text-[11px]">
                      <span>Total Amount Settled</span>
                      <span style={{ color: formData.brandThemeColor }}>₹14,500.00</span>
                    </div>
                  </div>

                  <div className="mt-2 p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="text-[9px] text-slate-500">
                      <div>Mode: UPI / BharatQR</div>
                      <div>Auth Ref: HDFC928172918</div>
                    </div>
                    <QrCode className="w-6 h-6 text-slate-700" />
                  </div>
                </div>
              )}

              {/* Preview 4: Student ID Card */}
              {activePreviewTab === 'IDCARD' && (
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white space-y-3 shadow-sm text-xs max-w-sm mx-auto">
                  <div className="p-3 rounded-xl text-white text-center space-y-0.5" style={{ backgroundColor: formData.brandThemeColor }}>
                    <div className="w-7 h-7 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-1">
                      <SelectedCrest className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-black text-xs">{formData.name}</div>
                    <div className="text-[9px] opacity-80">{formData.boardAffiliation}</div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-14 h-16 rounded-xl bg-slate-200 flex items-center justify-center font-bold text-slate-400 text-xs shrink-0">
                      PHOTO
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="font-extrabold text-slate-900 text-xs">Aarav Verma</div>
                      <div className="text-slate-500">Class: <strong>Grade 8 - Sec A</strong></div>
                      <div className="text-slate-500">Roll No: <strong>04</strong></div>
                      <div className="text-slate-500 font-mono">ID: <strong>ADM-2026-081</strong></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Blood Group: <strong>B+</strong></span>
                    <QrCode className="w-6 h-6 text-slate-800" />
                  </div>
                </div>
              )}
            </div>

            {/* Enterprise Tenant Assurance */}
            <div className="p-4 rounded-3xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-extrabold text-indigo-900">Multi-Tenant Data Quarantine</div>
                <p className="mt-0.5 text-[11px] text-indigo-800 leading-relaxed">
                  Brand colors, logos, and custom institutional slogans are stored strictly within your tenant schema partition. Other schools on InnovatMind School OS cannot access or view your credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
