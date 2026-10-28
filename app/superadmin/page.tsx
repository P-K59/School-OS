"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity,
  Globe,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function SuperadminDashboard() {
  const platformStats = [
    { label: 'Active Tenant Schools', value: '42', trend: '+3 this month', icon: Building2, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' },
    { label: 'Global Student Base', value: '18,450', trend: '+1,200 this term', icon: Users, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20' },
    { label: 'Platform MRR', value: '₹24.5L', trend: '+15% MoM', icon: CreditCard, color: 'text-indigo-400 bg-indigo-400/10 border-indigo-500/20' },
    { label: 'System Uptime', value: '99.99%', trend: 'Operational', icon: Server, color: 'text-amber-400 bg-amber-400/10 border-amber-500/20' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 15 },
    { month: 'Feb', revenue: 18 },
    { month: 'Mar', revenue: 16 },
    { month: 'Apr', revenue: 20 },
    { month: 'May', revenue: 22 },
    { month: 'Jun', revenue: 24.5 },
  ];

  const topSchools = [
    { name: 'Oakwood International', code: 'OAK-99X', students: 1250, status: 'Active' },
    { name: 'Pioneer STEM Academy', code: 'PIO-11A', students: 980, status: 'Active' },
    { name: 'Crestview High', code: 'CRE-44B', students: 850, status: 'Active' },
    { name: 'Future Leaders School', code: 'FUT-77C', students: 620, status: 'Pending Review' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Global Platform HQ
            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 font-mono text-xs shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              LIVE
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Central command for InnovatMind School OS multi-tenant ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-sm text-xs font-bold gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            System Logs
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] text-xs font-bold gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Onboard New School
          </Button>
        </div>
      </div>

      {/* Top Stats - Bento Grid Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat, idx) => (
          <Card key={idx} className="bg-slate-900/50 border-slate-800 backdrop-blur-md hover:bg-slate-800/50 transition-colors">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Bento Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart (Spans 2 cols) */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 backdrop-blur-md">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Platform MRR Growth (Lakhs ₹)
            </h3>
          </div>
          <CardContent className="p-5">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9', borderRadius: '8px' }}
                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Tenant Schools (Spans 1 col) */}
        <Card className="lg:col-span-1 bg-slate-900/50 border-slate-800 backdrop-blur-md flex flex-col">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Top Tenant Schools
            </h3>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-800">
              {topSchools.map((school, i) => (
                <div key={i} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-200">{school.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{school.code}</span>
                      <span className="text-[10px] text-slate-400">{school.students} Students</span>
                    </div>
                  </div>
                  <Badge variant={school.status === 'Active' ? 'outline' : 'secondary'} className={
                    school.status === 'Active' 
                      ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }>
                    {school.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
