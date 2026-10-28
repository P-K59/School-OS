"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function AdmissionsPipelineCard() {
  const { admissions, activeSchool } = useAuth();

  const data = [
    { name: 'Enquiries', value: admissions.enquiries, color: '#4f46e5' }, // indigo-600
    { name: 'Verification', value: admissions.verification, color: '#06b6d4' }, // cyan-500
    { name: 'Approved', value: admissions.approved, color: '#9333ea' }, // purple-600
    { name: 'Enrolled', value: admissions.activeEnrolled, color: '#10b981' }, // emerald-500
  ];

  const totalPipeline = admissions.enquiries + admissions.verification + admissions.approved;

  return (
    <Card className="light-glass card-hover text-slate-900 flex flex-col justify-between">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-xs">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Admissions Funnel
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">{totalPipeline} in pipeline for {activeSchool.name}</span>
          </div>
        </div>
        <Link href="/school/students">
          <Badge variant="default" className="cursor-pointer hover:bg-indigo-100">
            Open CRM →
          </Badge>
        </Link>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Recharts Visualization */}
        <div className="h-[200px] w-full bg-white rounded-xl border border-slate-100 shadow-inner p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.03)' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Action Link Row */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-700 font-medium">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>{admissions.approved} approved applications waiting for final director registration</span>
          </div>
          <Link
            href="/school/students"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Review <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
