"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { TrainerProfile, TrainerSpecialization } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  BookOpen,
  Plus,
  Star,
  Award
} from 'lucide-react';

export default function GlobalTrainersRosterPage() {
  const { trainers, trainerAllocations, schools } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredTrainers = useMemo(() => {
    return trainers.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.specialization.toLowerCase().includes(q);
      const matchesSpec = selectedSpecialization === 'ALL' || t.specialization === selectedSpecialization;
      const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
      return matchesSearch && matchesSpec && matchesStatus;
    });
  }, [trainers, searchQuery, selectedSpecialization, selectedStatus]);

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Operations & Mentorship
              </span>
              <span className="text-xs text-slate-500 font-medium">• Central Specialist Roster</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-8 h-8 text-blue-600" />
              InnovatMind Trainers Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Master STEM, Robotics, and AI trainers certified by InnovatMind HQ deployed across partner institutions.
            </p>
          </div>
        </div>

        {/* 4 Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Trainers</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">86</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">+8% this quarter</span>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active on Deployments</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">74</h3>
            <span className="text-[11px] text-slate-500 font-medium">Across 48 Schools</span>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Students Mentored</span>
            <h3 className="text-2xl font-black text-blue-600 mt-1">24,580</h3>
            <span className="text-[11px] text-slate-500 font-medium">Live In Labs</span>
          </Card>
          <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Rating</span>
            <h3 className="text-2xl font-black text-amber-500 mt-1">4.92 / 5.0</h3>
            <span className="text-[11px] text-slate-500 font-medium">Student & Principal Surveys</span>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search trainer by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Specializations</option>
              <option value="Robotics">Robotics</option>
              <option value="AI & ML">AI & Machine Learning</option>
              <option value="Coding">Coding</option>
              <option value="STEM & Projects">STEM & Projects</option>
              <option value="Computer Basics">Computer Basics</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </Card>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map(trainer => {
            const trainerActiveAllocations = trainerAllocations.filter(a => a.trainerId === trainer.id && a.status === 'ACTIVE');
            const workloadPercent = Math.min(100, Math.round((trainer.currentWorkloadHours / trainer.maxWorkloadHours) * 100));

            return (
              <Card key={trainer.id} className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                      {trainer.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-tight">{trainer.name}</h3>
                      <span className="text-[11px] font-semibold text-blue-600 block mt-0.5">{trainer.specialization}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{trainer.email}</span>
                    </div>
                  </div>

                  <Badge variant="outline" className={`text-[10px] font-bold ${trainer.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {trainer.status}
                  </Badge>
                </div>

                {/* Workload Progress */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Weekly Workload:</span>
                    <span className="font-bold text-slate-900">
                      {trainer.currentWorkloadHours} / {trainer.maxWorkloadHours} hrs
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        workloadPercent > 85 ? 'bg-rose-500' : workloadPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${workloadPercent}%` }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Schools</span>
                    <span className="font-bold text-slate-800">{trainer.assignedSchoolsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Students</span>
                    <span className="font-bold text-slate-800">{trainer.totalStudentsMentored.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Rating</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {trainer.rating}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
