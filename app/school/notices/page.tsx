"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell,
  Send,
  Smartphone,
  MessageSquare,
  Mail,
  AlertTriangle,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  X,
  Sparkles,
  Radio,
  Eye
} from 'lucide-react';

interface NoticeBroadcast {
  id: string;
  title: string;
  category: 'ACADEMIC' | 'FEES' | 'EMERGENCY' | 'EVENTS';
  targetAudience: string;
  channels: ('WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL')[];
  sentAt: string;
  deliveredCount: number;
  totalRecipients: number;
  openRate: number;
  messageContent: string;
}

export default function SchoolNoticesPage() {
  const { activeSchool } = useAuth();

  const [notices, setNotices] = useState<NoticeBroadcast[]>([
    {
      id: 'notif-1',
      title: 'Term 1 Report Cards & STEM Innovation Badges Released',
      category: 'ACADEMIC',
      targetAudience: 'All Parents & Students (Grades 1-12)',
      channels: ['WHATSAPP', 'PUSH', 'EMAIL'],
      sentAt: 'Today, 09:30 AM',
      deliveredCount: 642,
      totalRecipients: 650,
      openRate: 94.5,
      messageContent: 'Dear {guardian_name}, Term 1 Evaluation Report for {student_name} is now published on the InnovatMind Parent Portal. View report card & robotics badge: {portal_link}',
    },
    {
      id: 'notif-2',
      title: 'Term 1 Fee Clearance & UPI Gateway Reminder',
      category: 'FEES',
      targetAudience: 'Parents with Pending Balance',
      channels: ['WHATSAPP', 'SMS'],
      sentAt: 'Yesterday, 04:15 PM',
      deliveredCount: 38,
      totalRecipients: 40,
      openRate: 97.5,
      messageContent: 'Notice from {school_name}: Remaining balance of {due_amount} for {student_name} is due on 15 May. Pay instantly via 0% surcharge UPI QR code: {portal_link}',
    },
    {
      id: 'notif-3',
      title: 'Heavy Rain Warning: School Dispersal at 01:30 PM Today',
      category: 'EMERGENCY',
      targetAudience: 'All Guardians & Bus Fleet Drivers',
      channels: ['WHATSAPP', 'SMS', 'PUSH'],
      sentAt: '2 Days Ago',
      deliveredCount: 650,
      totalRecipients: 650,
      openRate: 99.2,
      messageContent: 'EMERGENCY ALERT: Due to heavy waterlogging forecast in Pune, all classes will disperse early at 01:30 PM. GPS tracking is active for all 14 bus routes.',
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerCategory, setComposerCategory] = useState<'ACADEMIC' | 'FEES' | 'EMERGENCY' | 'EVENTS'>('ACADEMIC');
  const [composerAudience, setComposerAudience] = useState('All Parents (Grades 1-12)');
  const [composerChannels, setComposerChannels] = useState<('WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL')[]>(['WHATSAPP', 'PUSH']);
  const [composerMessage, setComposerMessage] = useState('Dear {guardian_name}, this is an important announcement from {school_name} regarding {student_name}.');

  const totalDelivered = notices.reduce((acc, curr) => acc + curr.deliveredCount, 0);

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.messageContent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedFilter === 'ALL' || n.category === selectedFilter;
    return matchesSearch && matchesCat;
  });

  const toggleChannel = (ch: 'WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL') => {
    setComposerChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleInsertTag = (tag: string) => {
    setComposerMessage(prev => prev + ' ' + tag);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTitle.trim() || !composerMessage.trim()) return;

    const newBroadcast: NoticeBroadcast = {
      id: `notif-${Date.now()}`,
      title: composerTitle,
      category: composerCategory,
      targetAudience: composerAudience,
      channels: composerChannels,
      sentAt: 'Just Now',
      deliveredCount: 648,
      totalRecipients: 650,
      openRate: 98.0,
      messageContent: composerMessage,
    };

    setNotices(prev => [newBroadcast, ...prev]);
    setIsComposerOpen(false);
    setComposerTitle('');
    setToastNotice(`✓ Multi-Channel Broadcast "${newBroadcast.title}" successfully dispatched across ${composerChannels.join(', ')} to ${newBroadcast.deliveredCount} recipients!`);
    setTimeout(() => setToastNotice(null), 6000);
  };

  const handleSendEmergencyAlert = () => {
    const emergencyNotice: NoticeBroadcast = {
      id: `notif-emergency-${Date.now()}`,
      title: '🚨 CRITICAL EMERGENCY BROADCAST: Immediate Parent Notification',
      category: 'EMERGENCY',
      targetAudience: 'All Registered Guardians & Staff (Priority Override)',
      channels: ['WHATSAPP', 'SMS', 'PUSH'],
      sentAt: 'Just Now',
      deliveredCount: 650,
      totalRecipients: 650,
      openRate: 99.8,
      messageContent: `EMERGENCY ALERT: Important official bulletin from ${activeSchool.name}. School administration has activated rapid response protocol. All students are safe and under faculty supervision.`,
    };

    setNotices(prev => [emergencyNotice, ...prev]);
    setToastNotice(`🚨 EMERGENCY RED ALERT BROADCAST SENT to 650 parents & staff with 99.8% instant delivery!`);
    setTimeout(() => setToastNotice(null), 7000);
  };

  // Preview Message with Substituted Sample Tags
  const renderPreviewMessage = () => {
    return composerMessage
      .replace(/{guardian_name}/g, 'Manoj Verma')
      .replace(/{student_name}/g, 'Aarav Verma')
      .replace(/{school_name}/g, activeSchool.name)
      .replace(/{due_amount}/g, '₹28,500')
      .replace(/{portal_link}/g, 'https://schoolos.innovatmind.com/portal');
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 mb-1">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>{activeSchool.name} • Multi-Channel Communications Gateway</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Notices & Emergency Broadcast Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Enterprise WhatsApp Business API, SMS Gateway, and In-App Push alerts with real-time delivery telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="default"
              onClick={handleSendEmergencyAlert}
              className="bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs gap-1.5 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>1-Click Emergency Alert</span>
            </Button>

            <Button
              onClick={() => setIsComposerOpen(true)}
              size="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 font-bold gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Broadcast</span>
            </Button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastNotice}</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-emerald-700 font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Broadcasts</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{notices.length} Sent</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Multi-Channel Dispatches</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700">
              <span>{totalDelivered} Successful Deliveries</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp API Rate</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">99.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Meta Cloud API Enterprise Tier</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Zero Template Failures</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS DLT Delivery</span>
              <div className="text-3xl font-extrabold text-cyan-700 mt-2 font-mono">98.9%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">TRAI Registered Sender ID</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-cyan-700">
              <span>Sender ID: SCH-PUN</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Guardian Engagement</span>
              <div className="text-3xl font-extrabold text-purple-700 mt-2 font-mono">96.8%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Average Open / Read Rate</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-700">
              <span>Under 4 Mins Read Velocity</span>
            </div>
          </Card>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search announcements & notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'ACADEMIC', 'FEES', 'EMERGENCY', 'EVENTS'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedFilter === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Notices Cards List */}
        <div className="space-y-4">
          {filteredNotices.map((notice) => (
            <Card key={notice.id} className="light-glass p-5 rounded-3xl border border-slate-200/80 shadow-xs luxury-card-hover">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Badge variant={notice.category === 'EMERGENCY' ? 'destructive' : notice.category === 'FEES' ? 'warning' : 'default'}>
                    {notice.category}
                  </Badge>
                  <h3 className="font-extrabold text-sm text-slate-900">{notice.title}</h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>⏱ {notice.sentAt}</span>
                  <span>•</span>
                  <span>Target: <strong className="text-slate-800">{notice.targetAudience}</strong></span>
                </div>
              </div>

              <div className="my-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono">
                {notice.messageContent}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">Channels Active:</span>
                  {notice.channels.map(ch => (
                    <span key={ch} className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                      {ch}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-600">Delivered: <strong className="text-emerald-700">{notice.deliveredCount}/{notice.totalRecipients}</strong></span>
                  <span className="text-slate-600">Open Rate: <strong className="text-indigo-700">{notice.openRate}%</strong></span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Modal: Compose Broadcast with Live Mobile Preview */}
        {isComposerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white">Broadcast Message Composer</h2>
                    <p className="text-xs text-indigo-300 font-medium">Multi-channel instant dispatch with live preview</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Main Body (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                {/* Left Column: Form Fields (7 cols) */}
                <form onSubmit={handleSendBroadcast} className="lg:col-span-7 p-6 space-y-4 overflow-y-auto text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Announcement Title *</label>
                    <Input
                      required
                      placeholder="e.g. Annual STEM Science Fair Schedule"
                      value={composerTitle}
                      onChange={(e) => setComposerTitle(e.target.value)}
                      className="bg-white border-slate-300 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Category *</label>
                      <select
                        value={composerCategory}
                        onChange={(e) => setComposerCategory(e.target.value as any)}
                        className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACADEMIC">Academic</option>
                        <option value="FEES">Fees & Invoices</option>
                        <option value="EMERGENCY">Emergency Notice</option>
                        <option value="EVENTS">Events & Activities</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Audience *</label>
                      <select
                        value={composerAudience}
                        onChange={(e) => setComposerAudience(e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="All Parents (Grades 1-12)">All Parents (Grades 1-12)</option>
                        <option value="Grade 6 Parents (Cyber & Explorers)">Grade 6 Parents (Cyber & Explorers)</option>
                        <option value="All Faculty & Staff">All Faculty & Staff</option>
                        <option value="Parents with Pending Fee Invoices">Parents with Pending Fee Invoices</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Delivery Channels *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'WHATSAPP', label: 'WhatsApp Business API' },
                        { id: 'SMS', label: 'SMS Gateway (DLT)' },
                        { id: 'PUSH', label: 'Mobile App Push' },
                        { id: 'EMAIL', label: 'Official Email' },
                      ].map((ch) => {
                        const isChecked = composerChannels.includes(ch.id as any);
                        return (
                          <button
                            type="button"
                            key={ch.id}
                            onClick={() => toggleChannel(ch.id as any)}
                            className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all ${
                              isChecked
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '}
                            {ch.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">Message Content Template *</label>
                      <span className="text-[10px] text-slate-400">Click tags below to insert</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['{guardian_name}', '{student_name}', '{school_name}', '{due_amount}', '{portal_link}'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => handleInsertTag(tag)}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold hover:bg-indigo-100"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      required
                      rows={4}
                      value={composerMessage}
                      onChange={(e) => setComposerMessage(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsComposerOpen(false)}
                      className="font-bold"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={composerChannels.length === 0}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      Broadcast to 650 Recipients
                    </Button>
                  </div>
                </form>

                {/* Right Column: Live Mobile Mockup Preview (5 cols) */}
                <div className="lg:col-span-5 p-6 bg-slate-50/70 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>Live Recipient Preview</span>
                  </div>

                  {/* Smartphone Frame Mockup */}
                  <div className="w-full max-w-[280px] bg-slate-900 rounded-[36px] p-3 shadow-2xl border-4 border-slate-800">
                    {/* Phone Top Notch */}
                    <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2" />

                    {/* WhatsApp Chat Screen */}
                    <div className="bg-emerald-950/30 rounded-2xl p-3 border border-emerald-800/30 min-h-[300px] flex flex-col justify-between">
                      {/* Sender Header */}
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40 text-[11px] text-white font-bold">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px]">
                          OS
                        </div>
                        <div className="truncate">
                          <div>{activeSchool.name}</div>
                          <div className="text-[8px] text-emerald-400 font-normal">Official Verified Account ✓</div>
                        </div>
                      </div>

                      {/* Chat Bubble Message */}
                      <div className="bg-emerald-900/90 text-white p-3 rounded-2xl text-[11px] shadow-sm leading-relaxed my-3 border border-emerald-700/50">
                        <div className="font-bold text-amber-300 text-[10px] mb-1">
                          [{composerCategory}] {composerTitle || 'Announcement Title'}
                        </div>
                        <p className="text-slate-100 whitespace-pre-wrap">{renderPreviewMessage()}</p>
                        <div className="text-right text-[8px] text-emerald-300 mt-1 font-mono">10:45 AM • Delivered ✓✓</div>
                      </div>

                      <div className="text-center text-[9px] text-slate-400">
                        End-to-end encrypted via Meta Business Cloud API
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
