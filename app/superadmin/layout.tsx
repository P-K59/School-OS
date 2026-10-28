"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Building2,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Global HQ', href: '/superadmin', icon: Globe },
    { name: 'Tenant Schools', href: '/superadmin/schools', icon: Building2 },
    { name: 'Curriculum Builder', href: '/superadmin/courses', icon: BookOpen },
    { name: 'System Telemetry', href: '/superadmin/telemetry', icon: Activity },
    { name: 'Platform Settings', href: '/superadmin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Superadmin Sidebar (Dark/Emerald Theme) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800 transition-transform duration-300 ease-in-out transform flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link href="/superadmin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              INNOVATMIND <span className="font-light text-slate-400">HQ</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Platform Management</div>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50 shadow-[inset_0_1px_1px_rgba(16,185,129,0.2)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {item.name}
                {item.name === 'Tenant Schools' && (
                  <span className="ml-auto bg-emerald-500/20 text-emerald-400 py-0.5 px-2 rounded-full text-[9px]">4</span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900/50 border border-slate-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center border border-indigo-700/50">
              <span className="text-indigo-400 font-bold text-xs">SA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">System Root</p>
              <p className="text-[10px] text-emerald-500 font-mono truncate">Access: GOD_MODE</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center w-full px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#050810]">
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <Globe className="w-6 h-6" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/50">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>SYSTEM.ONLINE [Latency: 12ms]</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse" />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050810] to-[#050810] pointer-events-none" />
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
