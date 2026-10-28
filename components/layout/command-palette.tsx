"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  Search,
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  FileSpreadsheet,
  BarChart3,
  Package,
  Bell,
  MapPin,
  Settings,
  Sparkles,
  GraduationCap,
  Shield,
  PlusCircle,
  AlertTriangle,
  X,
  CornerDownLeft,
  Home,
  BookOpen,
  Terminal,
  Cpu,
  Gamepad2,
  FolderKanban,
  Trophy,
  User,
  Plus,
  Building2,
  Bot,
  Zap,
  Award
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeSchool, students, schools, role } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Role Determination
  const isStudent = role === 'STUDENT' || pathname.startsWith('/student');
  const isSuperAdmin = !isStudent && (role === 'SUPER_ADMIN' || pathname.startsWith('/admin'));

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Keyboard Navigation Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // =========================================================================
  // Role-Specific Navigation & Searchable Items
  // =========================================================================

  const getSearchableItems = () => {
    // -----------------------------------------------------------------------
    // 1. STUDENT CADET ITEMS ONLY (Zero administrative or fee clutter)
    // -----------------------------------------------------------------------
    if (isStudent) {
      return [
        // Navigation
        { title: 'Student Home World', category: 'Navigation', icon: Home, href: '/student', hint: 'The 5 Floating Learning Islands overview' },
        { title: 'My Learning Courses', category: 'Learning', icon: BookOpen, href: '/student?tab=learning', hint: 'Computer, Coding, Robotics & AI syllabus' },
        { title: 'Python & Block Coding Lab', category: 'Labs', icon: Terminal, href: '/student?tab=coding', hint: 'Interactive drag-and-drop & Python maze puzzles' },
        { title: 'Autonomous Rover Lab', category: 'Labs', icon: Cpu, href: '/student?tab=robotics', hint: 'Simulate sensors, motors & maze navigation' },
        { title: 'AI Sparks & Vision Lab', category: 'Labs', icon: Sparkles, href: '/student?tab=ai', hint: 'Teachable Machine & neural pattern models' },
        { title: 'Quizzes & Game Arena', category: 'Gaming', icon: Gamepad2, href: '/student?tab=games', hint: 'Compete in Quiz Battles & earn XP' },
        { title: 'Student Capstone Projects', category: 'Projects', icon: FolderKanban, href: '/student?tab=projects', hint: 'My interactive STEM builds' },
        { title: 'Achievements & Badges', category: 'Gamification', icon: Trophy, href: '/student?tab=achievements', hint: 'XP badges, streaks, and tier rewards' },
        { title: 'Class Leaderboard', category: 'Rankings', icon: BarChart3, href: '/student?tab=leaderboard', hint: 'View top Cadet rankings' },
        { title: 'My Cadet Profile & Digital ID', category: 'Profile', icon: User, href: '/student?tab=profile', hint: 'Admission details & student card' },
        
        // Quick Student Actions
        { title: 'Launch Coding Challenge Level 1', category: 'Quick Action', icon: Zap, href: '/student?tab=coding', hint: 'Straight Forward 30m Rover Mission' },
        { title: 'Start Quiz Battle against AI', category: 'Quick Action', icon: Trophy, href: '/student?tab=games', hint: 'Earn +50 XP bonus' },
        { title: 'Consult AI Robot Mentor', category: 'Quick Action', icon: Bot, href: '/student?tab=ai', hint: 'Get 24/7 coding and robotics help' },
        { title: 'View Digital Identity Badge', category: 'Quick Action', icon: Award, href: '/student?tab=profile', hint: 'Print or export Student Cadet ID' },
      ];
    }

    // -----------------------------------------------------------------------
    // 2. SUPER ADMIN HQ ITEMS ONLY (Zero school-level operational clutter)
    // -----------------------------------------------------------------------
    if (isSuperAdmin) {
      const schoolSearchItems = schools.map(s => ({
        title: s.name,
        subtitle: `Code: ${s.code} • ${s.city}, ${s.state} • ${s.schoolType} Board • ${s.totalStudents} Students`,
        category: 'Partner Schools',
        icon: Building2,
        href: '/admin/schools',
        hint: `Manage ${s.name}`
      }));

      return [
        // Navigation
        { title: 'Central Command Overview', category: 'HQ Navigation', icon: LayoutDashboard, href: '/admin', hint: 'Platform KPIs, total schools & revenue metrics' },
        { title: 'School Management Directory', category: 'HQ Navigation', icon: Building2, href: '/admin/schools', hint: 'All institutional school tenants across India' },
        { title: 'Onboard New School Tenant', category: 'HQ Navigation', icon: Plus, href: '/admin/schools/new', hint: 'Provision school record & admin credentials' },
        { title: 'Course Dynamic Pricing Engine', category: 'HQ Navigation', icon: CreditCard, href: '/admin/pricing', hint: 'Regional tiers, subsidies & school overrides' },
        { title: 'InnovatMind STEM Trainers', category: 'HQ Navigation', icon: Users, href: '/admin/trainers', hint: 'Trainer allocation & workload optimizer' },
        { title: 'Global Course Catalog', category: 'HQ Navigation', icon: BookOpen, href: '/admin/courses', hint: 'Publish & price STEM, AI, Coding & Robotics courses' },
        { title: 'Platform Master Settings', category: 'HQ Navigation', icon: Settings, href: '/admin#settings', hint: 'OS system configurations & master audit' },

        // Quick Actions
        { title: 'Provision New School Partner', category: 'Quick Action', icon: PlusCircle, href: '/admin/schools/new', hint: 'Register school and generate principal password' },
        { title: 'Add Course Pricing Override', category: 'Quick Action', icon: CreditCard, href: '/admin/pricing', hint: 'Set custom price per student for a school' },
        { title: 'Allocate Trainer to Timetable', category: 'Quick Action', icon: Users, href: '/admin/trainers', hint: 'Assign STEM specialist to school schedule' },
        { title: 'Publish New STEM Course', category: 'Quick Action', icon: BookOpen, href: '/admin/courses', hint: 'Add Grade 1-12 curriculum syllabus' },

        // Searchable Partner Schools
        ...schoolSearchItems,
      ];
    }

    // -----------------------------------------------------------------------
    // 3. SCHOOL ADMIN ITEMS (Scoped strictly to this school tenant)
    // -----------------------------------------------------------------------
    // Students strictly isolated to active school
    const scopedStudents = students
      .filter(s => s.schoolId === activeSchool.id)
      .map(s => ({
        title: `${s.firstName} ${s.lastName}`,
        subtitle: `Roll: ${s.rollNumber} • ${s.gradeName || 'Grade 6'} • XP: ${s.currentXp} • ADM: ${s.admissionNumber}`,
        category: 'Students',
        icon: Users,
        href: '/school/students',
        hint: `View student record and digital ID`
      }));

    const busItems = [
      { title: 'Bus Route 14 (Cyber Hub Corridor)', subtitle: 'Loc: Sector 62 • Speed: 38 km/h • On Time', category: 'Transport', icon: MapPin, href: '/school/transport', hint: 'Live fleet telemetry' },
      { title: 'Bus Route 08 (Green Glen Flyover)', subtitle: 'Loc: Campus Bay 4 • Speed: 0 km/h • Arrived', category: 'Transport', icon: MapPin, href: '/school/transport', hint: 'Live fleet telemetry' },
      { title: 'Bus Route 03 (Paud Road Crossing)', subtitle: 'Loc: Paud Rd • Speed: 24 km/h • Delayed 8m', category: 'Transport', icon: MapPin, href: '/school/transport', hint: 'Live fleet telemetry' },
    ];

    return [
      // Navigation
      { title: 'Mission Control Dashboard', category: 'Navigation', icon: LayoutDashboard, href: '/school', hint: `${activeSchool.name} Overview & KPIs` },
      { title: 'Students & Admissions CRM', category: 'Navigation', icon: Users, href: '/school/students', hint: 'Student records, admission registry & digital ID cards' },
      { title: 'Fee Vault & Collections', category: 'Navigation', icon: CreditCard, href: '/school/fees', hint: 'UPI invoices, overdue tracking & digital receipts' },
      { title: 'Academic & Timetable Grid', category: 'Navigation', icon: Calendar, href: '/school/timetable', hint: '0-clash period scheduler & lab assignments' },
      { title: 'Faculty & Payroll Runner', category: 'Navigation', icon: FileSpreadsheet, href: '/school/staff', hint: 'Staff directory & automated salary slips' },
      { title: 'Exams & Assessment Cell', category: 'Navigation', icon: Award, href: '/school/exams', hint: 'Marks entry, gradebooks & report cards' },
      { title: 'InnovatMind STEM Courses', category: 'Navigation', icon: Sparkles, href: '/school/courses', hint: 'Assigned Computer, Coding, Robotics & AI courses' },
      { title: 'Analytics & Executive BI Suite', category: 'Navigation', icon: BarChart3, href: '/school/analytics', hint: 'Revenue & attendance distributions' },
      { title: 'STEM Lab Hardware Vault', category: 'Navigation', icon: Package, href: '/school/inventory', hint: 'Robotics kits & sensor checkout inventory' },
      { title: 'Notices & Broadcast Gateway', category: 'Navigation', icon: Bell, href: '/school/notices', hint: 'WhatsApp, SMS & email announcements' },
      { title: 'Fleet & GPS Transport Radar', category: 'Navigation', icon: MapPin, href: '/school/transport', hint: 'Live bus telemetry & transit manifests' },
      { title: 'School Settings & Branding', category: 'Navigation', icon: Settings, href: '/school/settings', hint: 'Custom logo, colors & institutional details' },

      // Quick Actions
      { title: 'Enroll New Student (Admission)', category: 'Quick Action', icon: PlusCircle, href: '/school/students?tab=admissions', hint: 'Register student & auto-provision Cadet login' },
      { title: 'Collect Student Fee via UPI', category: 'Quick Action', icon: CreditCard, href: '/school/fees', hint: 'Record fee payment & issue invoice' },
      { title: 'Broadcast School Notice', category: 'Quick Action', icon: AlertTriangle, href: '/school/notices', hint: 'Dispatch emergency or general announcement' },
      { title: 'Issue STEM Hardware Kit', category: 'Quick Action', icon: Package, href: '/school/inventory', hint: 'Checkout robotics components to class' },
      { title: 'Run Monthly Faculty Payroll', category: 'Quick Action', icon: FileSpreadsheet, href: '/school/staff', hint: 'Generate staff salary vouchers' },

      // Scoped student records and transport
      ...scopedStudents,
      ...busItems,
    ];
  };

  const allSearchable = getSearchableItems();

  const filteredItems = allSearchable.filter(item => {
    const term = query.toLowerCase().trim();
    if (!term) return true;
    return (
      item.title.toLowerCase().includes(term) ||
      (item.category && item.category.toLowerCase().includes(term)) ||
      ((item as any).hint && (item as any).hint.toLowerCase().includes(term)) ||
      ((item as any).subtitle && (item as any).subtitle.toLowerCase().includes(term))
    );
  });

  const handleSelect = (item: typeof filteredItems[0]) => {
    onClose();
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const searchPlaceholder = isStudent
    ? "Search courses, coding lab, robotics, AI, quiz battles, projects... (Ctrl+K)"
    : isSuperAdmin
    ? "Search schools, pricing rules, trainers, courses, platform settings... (Ctrl+K)"
    : "Search students, staff, fees, classes, timetables, inventory... (Ctrl+K)";

  const footerBranding = isStudent
    ? "InnovatMind Student Learning World • Grade 6"
    : isSuperAdmin
    ? "InnovatMind Central Command HQ • Super Admin"
    : `${activeSchool.name} • Institutional OS`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-sm p-4 pt-16 sm:pt-24 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none text-slate-900 text-sm font-medium focus:outline-none placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 font-mono text-[10px] font-bold">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              aria-label="Close Command Palette"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-50">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching commands or records found for &quot;{query}&quot;.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.slice(0, 15).map((item, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = item.icon;

                return (
                  <button
                    key={`${item.category}-${item.title}-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between gap-3 text-xs ${
                      isSelected
                        ? isStudent
                          ? 'bg-cyan-50 text-cyan-950 font-bold'
                          : isSuperAdmin
                          ? 'bg-purple-50 text-purple-950 font-bold'
                          : 'bg-indigo-50/80 text-indigo-950 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? isStudent
                            ? 'bg-cyan-500 text-white shadow-xs'
                            : isSuperAdmin
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-extrabold truncate">{item.title}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            {item.category}
                          </span>
                        </div>
                        {((item as any).hint || (item as any).subtitle) && (
                          <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                            {(item as any).hint || (item as any).subtitle}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      {isSelected && (
                        <span className={`flex items-center gap-1 font-bold ${
                          isStudent ? 'text-cyan-600' : isSuperAdmin ? 'text-purple-600' : 'text-indigo-600'
                        }`}>
                          <span>Jump</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Guide */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>•</span>
            <span>↵ to select</span>
            <span>•</span>
            <span>ESC to close</span>
          </div>
          <div className={`font-bold ${
            isStudent ? 'text-cyan-700' : isSuperAdmin ? 'text-purple-700' : 'text-indigo-700'
          }`}>
            {footerBranding}
          </div>
        </div>
      </div>
    </div>
  );
}
