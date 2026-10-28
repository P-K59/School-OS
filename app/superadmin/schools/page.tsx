"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle2,
  Ban,
  ShieldAlert,
  ArrowUpRight,
  MapPin,
  Users,
  CreditCard
} from 'lucide-react';

type SchoolStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

interface TenantSchool {
  id: string;
  name: string;
  code: string;
  location: string;
  principal: string;
  studentsCount: number;
  revenue: number;
  status: SchoolStatus;
  joinDate: string;
}

export default function SuperadminTenantManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SchoolStatus | 'ALL'>('ALL');

  const [schools, setSchools] = useState<TenantSchool[]>([
    { id: 't1', name: 'Oakwood International', code: 'OAK-99X', location: 'Mumbai, MH', principal: 'Dr. Sarah Sharma', studentsCount: 1250, revenue: 1250000, status: 'ACTIVE', joinDate: '2023-01-15' },
    { id: 't2', name: 'Pioneer STEM Academy', code: 'PIO-11A', location: 'Bangalore, KA', principal: 'Rajesh Kumar', studentsCount: 980, revenue: 980000, status: 'ACTIVE', joinDate: '2023-03-22' },
    { id: 't3', name: 'Crestview High', code: 'CRE-44B', location: 'Delhi, DL', principal: 'Anita Desai', studentsCount: 850, revenue: 850000, status: 'ACTIVE', joinDate: '2023-06-10' },
    { id: 't4', name: 'Future Leaders School', code: 'FUT-77C', location: 'Pune, MH', principal: 'Vikram Singh', studentsCount: 620, revenue: 0, status: 'PENDING', joinDate: '2023-09-28' },
    { id: 't5', name: 'Global Tech High', code: 'GLO-22D', location: 'Hyderabad, TS', principal: 'Meera Reddy', studentsCount: 450, revenue: 450000, status: 'SUSPENDED', joinDate: '2022-11-05' },
  ]);

  const handleStatusChange = (id: string, newStatus: SchoolStatus) => {
    setSchools(schools.map(school => 
      school.id === id ? { ...school, status: newStatus } : school
    ));
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) || school.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || school.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            Tenant Registry
            <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 bg-indigo-500/10 font-mono text-xs">
              {schools.length} SCHOOLS
            </Badge>
          </h1>
          <p className="text-slate-400 mt-1 font-medium text-sm">Manage global school licenses, view analytics, and control platform access.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] text-xs font-bold gap-2">
            <Building2 className="w-3.5 h-3.5" />
            Provision New Tenant
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-md">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by school name or tenant code (e.g. OAK-99X)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-slate-300 focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Licenses</option>
              <option value="PENDING">Pending Review</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="bg-slate-900/40 border-slate-800 backdrop-blur-sm hover:bg-slate-900/60 hover:border-slate-700 transition-all group overflow-hidden relative flex flex-col">
            
            {/* Status Indicator Glow */}
            <div className={`absolute top-0 left-0 w-full h-1 ${
              school.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
              school.status === 'PENDING' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
              'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]'
            }`} />

            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">{school.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="border-slate-700 text-slate-400 bg-slate-950/50 font-mono text-[10px]">
                      {school.code}
                    </Badge>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {school.location}
                    </span>
                  </div>
                </div>
                <button className="text-slate-600 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 flex-1">
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <Users className="w-4 h-4 text-cyan-500 mb-1" />
                  <span className="text-xs font-bold text-slate-300">{school.studentsCount}</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">Students</span>
                </div>
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-xs font-bold font-mono text-emerald-400">₹{(school.revenue / 100000).toFixed(1)}L</span>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">MRR</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-auto">
                <Badge variant="outline" className={`text-[10px] uppercase font-bold ${
                  school.status === 'ACTIVE' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                  school.status === 'PENDING' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                  'border-rose-500/30 text-rose-400 bg-rose-500/10'
                }`}>
                  {school.status}
                </Badge>

                <div className="flex items-center gap-2">
                  {school.status === 'PENDING' && (
                    <Button 
                      onClick={() => handleStatusChange(school.id, 'ACTIVE')}
                      size="sm" 
                      className="h-7 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                    </Button>
                  )}
                  {school.status === 'ACTIVE' && (
                    <Button 
                      onClick={() => handleStatusChange(school.id, 'SUSPENDED')}
                      variant="outline"
                      size="sm" 
                      className="h-7 border-slate-700 text-rose-400 hover:bg-rose-950 hover:text-rose-300 text-[10px] font-bold px-2 bg-transparent"
                    >
                      <Ban className="w-3 h-3 mr-1" /> Suspend
                    </Button>
                  )}
                  {school.status === 'SUSPENDED' && (
                    <Button 
                      onClick={() => handleStatusChange(school.id, 'ACTIVE')}
                      variant="outline"
                      size="sm" 
                      className="h-7 border-slate-700 text-emerald-400 hover:bg-emerald-950 hover:text-emerald-300 text-[10px] font-bold px-2 bg-transparent"
                    >
                      <ShieldAlert className="w-3 h-3 mr-1" /> Reactivate
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
