"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
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
  QrCode
} from 'lucide-react';

const BRAND_THEMES = [
  { id: 'indigo', name: 'Royal Indigo', hex: '#4f46e5', bgLight: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-600', gradient: 'from-indigo-600 to-purple-600' },
  { id: 'emerald', name: 'Emerald Forest', hex: '#059669', bgLight: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-600', gradient: 'from-emerald-600 to-teal-700' },
  { id: 'blue', name: 'Sapphire Ocean', hex: '#2563eb', bgLight: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600', gradient: 'from-blue-600 to-indigo-700' },
  { id: 'crimson', name: 'Crimson Ruby', hex: '#e11d48', bgLight: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-600', gradient: 'from-rose-600 to-pink-700' },
  { id: 'violet', name: 'Imperial Violet', hex: '#7c3aed', bgLight: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600', gradient: 'from-purple-600 to-violet-800' },
  { id: 'amber', name: 'Solar Amber', hex: '#d97706', bgLight: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-600', gradient: 'from-amber-600 to-orange-700' },
];

const CREST_ICONS = [
  { id: 'shield', name: 'Heritage Shield', icon: ShieldCheck },
  { id: 'award', name: 'Academic Laurels', icon: Award },
  { id: 'sparkles', name: 'STEM Innovation', icon: Sparkles },
  { id: 'cap', name: 'Scholastic Cap', icon: GraduationCap },
];

export default function SchoolBrandingSettingsPage() {
  const { activeSchool, updateSchoolBranding } = useAuth();

  const [formData, setFormData] = useState({
    name: activeSchool.name || '',
    slogan: activeSchool.slogan || 'Fostering Innovation, Scientific Curiosity & Leadership',
    boardAffiliation: activeSchool.boardAffiliation || 'CBSE Board (Affiliation #930214)',
    establishedYear: activeSchool.establishedYear || '2008',
    principalName: activeSchool.principalName || 'Dr. Rajeshwari Sharma, Ph.D.',
    websiteUrl: activeSchool.websiteUrl || 'https://stxavier-cyber.edu.in',
    phone: activeSchool.phone || '+91 98765 43210',
    brandThemeColor: activeSchool.brandThemeColor || '#4f46e5',
    logoCrest: activeSchool.logoCrest || 'shield',
  });

  const [activePreviewTab, setActivePreviewTab] = useState<'HEADER' | 'REPORT' | 'RECEIPT'>('HEADER');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when active school switches
  useEffect(() => {
    setFormData({
      name: activeSchool.name || '',
      slogan: activeSchool.slogan || 'Fostering Innovation, Scientific Curiosity & Leadership',
      boardAffiliation: activeSchool.boardAffiliation || 'CBSE Board (Affiliation #930214)',
      establishedYear: activeSchool.establishedYear || '2008',
      principalName: activeSchool.principalName || 'Dr. Rajeshwari Sharma, Ph.D.',
      websiteUrl: activeSchool.websiteUrl || 'https://stxavier-cyber.edu.in',
      phone: activeSchool.phone || '+91 98765 43210',
      brandThemeColor: activeSchool.brandThemeColor || '#4f46e5',
      logoCrest: activeSchool.logoCrest || 'shield',
    });
  }, [activeSchool]);

  const selectedTheme = BRAND_THEMES.find(t => t.hex === formData.brandThemeColor) || BRAND_THEMES[0];
  const SelectedCrest = (CREST_ICONS.find(c => c.id === formData.logoCrest) || CREST_ICONS[0]).icon;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolBranding({
      name: formData.name,
      slogan: formData.slogan,
      boardAffiliation: formData.boardAffiliation,
      establishedYear: formData.establishedYear,
      principalName: formData.principalName,
      websiteUrl: formData.websiteUrl,
      phone: formData.phone,
      brandThemeColor: formData.brandThemeColor,
      logoCrest: formData.logoCrest,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleReset = () => {
    setFormData({
      name: activeSchool.name,
      slogan: 'Fostering Innovation, Scientific Curiosity & Leadership',
      boardAffiliation: 'CBSE Affiliated #930214',
      establishedYear: '2008',
      principalName: 'Dr. Rajeshwari Sharma, Ph.D.',
      websiteUrl: 'https://stxavier-cyber.edu.in',
      phone: '+91 98765 43210',
      brandThemeColor: '#4f46e5',
      logoCrest: 'shield',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>White-Label & Institution Identity</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            School Branding & Identity Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize official colors, crest, digital letterheads, report cards, and fee receipts for <span className="font-semibold text-slate-800">{activeSchool.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tenant Isolated (RLS)</span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <div className="font-extrabold text-sm">School Branding Updated Successfully!</div>
              <div className="text-xs text-emerald-100">All portal navigation bars, fee receipts, and student report cards now reflect your custom identity.</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Form, Right Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Institutional Master Identity
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

            {/* School Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official School / Campus Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. St. Xavier Cyber World School"
              />
            </div>

            {/* Slogan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Motto / Institutional Slogan
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. Empowering Tomorrow's Innovators"
              />
            </div>

            {/* Grid for Board, Est Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Board Affiliation & Code
                </label>
                <input
                  type="text"
                  value={formData.boardAffiliation}
                  onChange={(e) => setFormData({ ...formData, boardAffiliation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. 2008"
                />
              </div>
            </div>

            {/* Principal Name & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Principal / Head of School
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g. Dr. Rajeshwari Sharma"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://stxavier-cyber.edu.in"
                />
              </div>
            </div>

            {/* Brand Theme Palette Picker */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Primary Brand Accent Theme
                </span>
                <span className="text-[11px] font-mono text-slate-400">{formData.brandThemeColor}</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {BRAND_THEMES.map((theme) => {
                  const isSelected = formData.brandThemeColor.toLowerCase() === theme.hex.toLowerCase();
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, brandThemeColor: theme.hex })}
                      className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-slate-900 ring-2 ring-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className="w-6 h-6 rounded-full shadow-xs flex items-center justify-center text-white"
                        style={{ backgroundColor: theme.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Official School Crest Badge Icon */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700 mb-2.5">
                Official Crest / Emblem Archetype
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-bold'
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

            {/* Submit Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: formData.brandThemeColor }}
              >
                <Save className="w-4 h-4" />
                <span>Save & Apply Identity</span>
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
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreviewTab === 'HEADER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Header
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('REPORT')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreviewTab === 'REPORT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Report Card
                </button>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('RECEIPT')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    activePreviewTab === 'RECEIPT' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Fee Receipt
                </button>
              </div>
            </div>

            {/* Preview Case 1: Portal Top Navigation Banner */}
            {activePreviewTab === 'HEADER' && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[11px] text-slate-500 font-medium">
                  How your customized school branding appears on student & parent login bars:
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: formData.brandThemeColor }}
                      >
                        <SelectedCrest className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 truncate max-w-[200px]">
                          {formData.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                          {formData.slogan}
                        </div>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider"
                      style={{ backgroundColor: formData.brandThemeColor }}
                    >
                      Campus Portal
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Affiliation:</span>
                    <span className="font-bold text-slate-800">{formData.boardAffiliation}</span>
                  </div>
                  <div className="mt-1.5 p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Principal:</span>
                    <span className="font-bold text-slate-800">{formData.principalName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Case 2: Digital Student Report Card */}
            {activePreviewTab === 'REPORT' && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[11px] text-slate-500 font-medium">
                  Official watermark crest and branding on downloadable student term report:
                </div>
                <div className="p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-xs relative overflow-hidden">
                  {/* Watermark Crest */}
                  <div className="absolute right-2 bottom-2 opacity-5 pointer-events-none">
                    <SelectedCrest className="w-32 h-32" />
                  </div>

                  {/* Letterhead */}
                  <div className="text-center pb-3 border-b-2 border-slate-100">
                    <div className="flex justify-center mb-1">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: formData.brandThemeColor }}
                      >
                        <SelectedCrest className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-xs font-black text-slate-900 tracking-tight">
                      {formData.name.toUpperCase()}
                    </div>
                    <div className="text-[9px] text-slate-500 italic">
                      &quot;{formData.slogan}&quot;
                    </div>
                    <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                      Est. {formData.establishedYear} • {formData.boardAffiliation}
                    </div>
                  </div>

                  {/* Student Sample Grade Grid */}
                  <div className="mt-3 space-y-1.5 text-[10px]">
                    <div className="flex justify-between font-bold text-slate-700 bg-slate-50 p-1 rounded">
                      <span>Subject</span>
                      <span>Grade / 100</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-600">
                      <span>Python & Algorithms</span>
                      <span className="font-bold text-emerald-600">98% (A+)</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-600">
                      <span>Robotics & Kinematics</span>
                      <span className="font-bold text-emerald-600">94% (A+)</span>
                    </div>
                    <div className="flex justify-between px-1 text-slate-600">
                      <span>Mathematics</span>
                      <span className="font-bold text-indigo-600">91% (A)</span>
                    </div>
                  </div>

                  {/* Principal Stamp */}
                  <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px]">
                    <div className="text-slate-400">Digitally Verified Document</div>
                    <div className="text-right">
                      <div className="font-bold text-slate-800">{formData.principalName}</div>
                      <div className="text-slate-400">Head of Institution</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Case 3: Official Fee Invoice & Receipt */}
            {activePreviewTab === 'RECEIPT' && (
              <div className="space-y-3 animate-fade-in">
                <div className="text-[11px] text-slate-500 font-medium">
                  Official automated tax invoice & UPI transaction receipt:
                </div>
                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: formData.brandThemeColor }}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">{formData.name}</div>
                        <div className="text-[9px] text-slate-400">TAX INVOICE #INV-2025-0891</div>
                      </div>
                    </div>
                    <div className="text-right text-[10px] font-mono text-emerald-600 font-bold">
                      PAID ✓
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-[10px] text-slate-600">
                    <div className="flex justify-between">
                      <span>Computer & STEM Lab Fee (Annual)</span>
                      <span className="font-bold text-slate-900">₹2,499.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Robotics Hardware Kit Deposit</span>
                      <span className="font-bold text-slate-900">₹500.00</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900 text-[11px]">
                      <span>Total Amount Settled</span>
                      <span style={{ color: formData.brandThemeColor }}>₹2,999.00</span>
                    </div>
                  </div>

                  <div className="mt-3 p-2 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div className="text-[9px] text-slate-500">
                      <div>Mode: UPI / BharatQR</div>
                      <div>Auth Ref: HDFC928172918</div>
                    </div>
                    <QrCode className="w-7 h-7 text-slate-700" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Tenant Assurance Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-indigo-900">Enterprise Tenant Data Quarantine</div>
              <p className="mt-0.5 text-[11px] text-indigo-800 leading-relaxed">
                Brand colors, logos, and custom institutional slogans are stored strictly within your tenant schema partition. Other schools on InnovatMind School OS cannot access or view your credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
