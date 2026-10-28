"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { BookOpen, Calendar, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function TeacherPortal() {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ATTENDANCE' | 'GRADING'>('ATTENDANCE');

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-6 lg:p-10 font-sans selection:bg-indigo-500/30">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#222]">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Faculty Hub
              </h1>
              <p className="text-sm text-[#888] mt-1">Prof. {user?.lastName}</p>
            </div>
            <div className="flex gap-2">
              <button className="h-9 px-4 rounded-md bg-white text-black text-sm font-medium hover:bg-[#ccc] transition-colors">
                Start Class
              </button>
            </div>
          </div>

          <div className="flex gap-2 pb-2 border-b border-[#222]">
            {[
              { id: 'ATTENDANCE', label: 'Attendance' },
              { id: 'GRADING', label: 'Grading' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id ? 'bg-[#222] text-white' : 'text-[#888] hover:bg-[#111] hover:text-[#ccc]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'ATTENDANCE' && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium">Grade 6 - A</h3>
                <button className="text-xs font-medium text-[#888] hover:text-white">Mark All Present</button>
              </div>
              <div className="space-y-2">
                {['Aria M.', 'Zane T.', 'Liam K.', 'Noah B.'].map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-[#222] bg-[#0a0a0a] rounded-lg">
                    <span className="text-sm text-white">{name}</span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        P
                      </button>
                      <button className="w-8 h-8 rounded border border-[#333] text-[#666] hover:text-[#888] flex items-center justify-center">
                        A
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'GRADING' && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium">Pending Submissions</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Aria M.', task: 'Python Loop', status: 'Pending' },
                  { name: 'Zane T.', task: 'Python Loop', status: 'Graded' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-[#222] bg-[#0a0a0a] rounded-lg">
                    <div>
                      <h4 className="text-sm font-medium text-white">{item.name}</h4>
                      <p className="text-xs text-[#666] mt-0.5">{item.task}</p>
                    </div>
                    {item.status === 'Graded' ? (
                       <span className="text-xs text-emerald-500 font-medium">Graded</span>
                    ) : (
                      <button className="text-xs font-medium bg-[#222] border border-[#333] hover:bg-[#333] text-white px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
                        AI Grade
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
