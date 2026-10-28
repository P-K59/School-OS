"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { AppShell } from '@/components/layout/app-shell';
import { Calendar, CreditCard, GraduationCap, MapPin, QrCode } from 'lucide-react';

export default function ParentPortal() {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FEES' | 'ID'>('OVERVIEW');

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] p-6 lg:p-10 font-sans selection:bg-indigo-500/30">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#222]">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">
                Parent Portal
              </h1>
              <p className="text-sm text-[#888] mt-1">Welcome, {user?.firstName}</p>
            </div>
          </div>

          <div className="flex gap-2 pb-2 border-b border-[#222]">
            {[
              { id: 'OVERVIEW', label: 'Overview' },
              { id: 'FEES', label: 'Fees' },
              { id: 'ID', label: 'Digital ID' }
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

          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#888]">Attendance</span>
                  <h3 className="text-xl font-semibold mt-1">94%</h3>
                </div>
                <Calendar className="w-4 h-4 text-[#666]" />
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#888]">Bus Status</span>
                  <h3 className="text-xl font-semibold mt-1">On Time</h3>
                </div>
                <MapPin className="w-4 h-4 text-[#666]" />
              </div>
            </div>
          )}

          {activeTab === 'FEES' && (
            <div className="bg-[#111] border border-[#222] rounded-xl p-6">
              <h3 className="text-sm font-medium mb-6">Pending Dues</h3>
              <div className="flex items-center justify-between p-4 border border-[#222] bg-[#0a0a0a] rounded-lg">
                <div className="flex items-center gap-4">
                  <CreditCard className="w-5 h-5 text-[#888]" />
                  <div>
                    <h4 className="text-sm font-medium text-white">Term 2 Tuition</h4>
                    <p className="text-xs text-[#666] mt-0.5">Due in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">₹25,000</span>
                  <button className="text-xs font-medium bg-white text-black px-4 py-2 rounded-md hover:bg-[#ccc] transition-colors">
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ID' && (
            <div className="flex justify-center">
              <div className="w-[300px] bg-white border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
                <div className="bg-[#111] p-4 text-center border-b border-[#222]">
                  <h3 className="text-white font-semibold">Student ID</h3>
                </div>
                <div className="p-6 text-center space-y-4">
                  <div className="w-24 h-24 bg-[#f0f0f0] rounded-full mx-auto" />
                  <div>
                    <h4 className="text-lg font-bold text-black">Aria M.</h4>
                    <p className="text-sm text-[#666]">Grade 6 - A</p>
                  </div>
                  <div className="pt-4 border-t border-[#eee] flex justify-center">
                    <QrCode className="w-32 h-32 text-black" />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
