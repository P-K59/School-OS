"use client";

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { NoticeBroadcast, NoticePriority, NoticeTargetAudience } from '@/lib/types';
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
  Eye,
  Calendar,
  Pin,
  PinOff,
  Trash2,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

export default function SchoolNoticesPage() {
  const { activeSchool, notices, publishNotice, deleteNotice, togglePinNotice, currentUser } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerPriority, setComposerPriority] = useState<NoticePriority>('ACADEMIC');
  const [composerAudience, setComposerAudience] = useState<NoticeTargetAudience>('ALL');
  const [composerChannels, setComposerChannels] = useState<('PORTAL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL')[]>(['PORTAL', 'WHATSAPP', 'PUSH']);
  const [isEmergencyBanner, setIsEmergencyBanner] = useState(false);
  const [composerMessage, setComposerMessage] = useState('Dear {guardian_name}, this is an important announcement from {school_name} regarding {student_name}.');

  const totalDelivered = notices.reduce((acc, curr) => acc + (curr.deliveredCount || 0), 0);

  const filteredNotices = notices.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.messageContent.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedFilter === 'ALL' || n.priority === selectedFilter;
    return matchesSearch && matchesCat;
  });

  const toggleChannel = (ch: 'PORTAL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL') => {
    setComposerChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  };

  const handleInsertTag = (tag: string) => {
    setComposerMessage(prev => prev + ' ' + tag);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerTitle.trim() || !composerMessage.trim()) return;

    const res = await publishNotice({
      schoolId: activeSchool.id,
      title: composerTitle,
      messageContent: composerMessage,
      priority: composerPriority,
      targetAudience: composerAudience,
      channels: composerChannels,
      isEmergencyBanner: isEmergencyBanner || composerPriority === 'URGENT',
      authorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : activeSchool.name,
      status: 'PUBLISHED'
    });

    if (res.success) {
      setIsComposerOpen(false);
      setComposerTitle('');
      setIsEmergencyBanner(false);
      setToastNotice(`✓ Notice "${composerTitle}" published & dispatched across ${composerChannels.join(', ')}!`);
      setTimeout(() => setToastNotice(null), 5000);
    }
  };

  const handleSendEmergencyAlert = async () => {
    const res = await publishNotice({
      schoolId: activeSchool.id,
      title: '🚨 CRITICAL EMERGENCY BROADCAST: Rapid Response Protocol Activated',
      messageContent: `EMERGENCY ALERT: Important official bulletin from ${activeSchool.name}. School administration has activated emergency response protocols. All students are safe and under faculty supervision. Transport tracking is active.`,
      priority: 'URGENT',
      targetAudience: 'ALL',
      channels: ['PORTAL', 'WHATSAPP', 'SMS', 'PUSH'],
      isEmergencyBanner: true,
      authorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administration Directorate',
      status: 'PUBLISHED'
    });

    if (res.success) {
      setToastNotice(`🚨 EMERGENCY RED ALERT BROADCAST SENT to all parents, students & staff with top portal banner!`);
      setTimeout(() => setToastNotice(null), 7000);
    }
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
              <span>{activeSchool.name} • Communications &amp; Emergency Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              School Announcements &amp; Emergency Broadcast Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Publish urgent emergency warnings, holiday circulars, and academic updates with real-time top banners across student, parent, and staff portals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="default"
              onClick={handleSendEmergencyAlert}
              className="bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>1-Click Emergency Alert</span>
            </Button>

            <Button
              onClick={() => {
                setComposerTitle('');
                setComposerPriority('ACADEMIC');
                setComposerAudience('ALL');
                setIsEmergencyBanner(false);
                setIsComposerOpen(true);
              }}
              size="default"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 font-bold gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Announcement</span>
            </Button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastNotice && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{toastNotice}</span>
            </div>
            <button onClick={() => setToastNotice(null)} className="text-indigo-400 hover:text-indigo-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Broadcasts</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 font-mono">{notices.length} Published</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Multi-Channel Notices</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-indigo-700">
              <span>{totalDelivered} Total Deliveries</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Banners</span>
              <div className="text-3xl font-extrabold text-rose-700 mt-2 font-mono">
                {notices.filter(n => n.isEmergencyBanner).length} Active
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Pulsing Portal Alert Bar</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Priority High Override</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp &amp; SMS</span>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2 font-mono">99.2%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Meta Cloud &amp; DLT Gateway</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-emerald-700">
              <span>DLT Sender ID Verified</span>
            </div>
          </Card>

          <Card className="light-glass p-5 rounded-3xl border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Reach</span>
              <div className="text-3xl font-extrabold text-purple-700 mt-2 font-mono">97.4%</div>
              <div className="text-xs text-slate-500 font-medium mt-1">Average Portal View Rate</div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-purple-700">
              <span>Real-Time Multi-Tenant Dispatch</span>
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
            {['ALL', 'URGENT', 'HOLIDAY', 'ACADEMIC', 'FEES', 'GENERAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
          {filteredNotices.length === 0 ? (
            <Card className="p-8 text-center bg-white border-slate-200 rounded-3xl space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">No notices matching filter</h3>
              <p className="text-xs text-slate-400">Click &quot;New Announcement&quot; above to create a broadcast.</p>
            </Card>
          ) : (
            filteredNotices.map((notice) => (
              <Card key={notice.id} className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    {notice.priority === 'URGENT' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                        URGENT ALERT
                      </span>
                    ) : notice.priority === 'HOLIDAY' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        <Calendar className="w-3 h-3 text-amber-600" />
                        HOLIDAY
                      </span>
                    ) : notice.priority === 'FEES' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        FEE NOTICE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                        {notice.priority}
                      </span>
                    )}

                    {notice.isEmergencyBanner && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                        <Radio className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                        Top Banner Active
                      </span>
                    )}

                    <h3 className="font-extrabold text-sm text-slate-900">{notice.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                    <span>⏱ {new Date(notice.sentAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Audience: <strong className="text-slate-800">{notice.targetAudience}</strong></span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed font-mono">
                  {notice.messageContent}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold text-[11px]">Channels:</span>
                    {notice.channels.map(ch => (
                      <span key={ch} className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePinNotice(notice.id)}
                      className="h-8 text-[11px] font-semibold gap-1 border-slate-200 text-slate-600 hover:text-indigo-600 cursor-pointer"
                      title={notice.isEmergencyBanner ? "Deactivate Top Emergency Banner" : "Pin as Top Emergency Alert Banner"}
                    >
                      {notice.isEmergencyBanner ? <PinOff className="w-3.5 h-3.5 text-rose-600" /> : <Pin className="w-3.5 h-3.5" />}
                      <span>{notice.isEmergencyBanner ? 'Unpin Banner' : 'Pin Top Banner'}</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotice(notice.id)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal: Compose Broadcast with Live Mobile Preview */}
        {isComposerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
            <Card className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-indigo-900/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
                    <Send className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Broadcast Message Composer</h2>
                    <p className="text-xs text-indigo-300 font-medium">Multi-channel announcement with live portal banner option</p>
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
                      placeholder="e.g. Heavy Rain Warning or Science Exhibition"
                      value={composerTitle}
                      onChange={(e) => setComposerTitle(e.target.value)}
                      className="bg-white border-slate-300 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Notice Priority *</label>
                      <select
                        value={composerPriority}
                        onChange={(e) => setComposerPriority(e.target.value as NoticePriority)}
                        className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="URGENT">URGENT (Emergency Red Alert)</option>
                        <option value="HOLIDAY">HOLIDAY (Official Break)</option>
                        <option value="ACADEMIC">ACADEMIC (Exams &amp; Badges)</option>
                        <option value="FEES">FEES (Due Reminders)</option>
                        <option value="GENERAL">GENERAL (Sports &amp; Events)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Target Audience *</label>
                      <select
                        value={composerAudience}
                        onChange={(e) => setComposerAudience(e.target.value as NoticeTargetAudience)}
                        className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ALL">Everyone (All Students, Parents, Staff)</option>
                        <option value="STUDENTS">Students Only</option>
                        <option value="PARENTS">Parents Only</option>
                        <option value="STAFF">Faculty &amp; Staff Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Emergency Top Banner Checkbox */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Display as Emergency Top Alert Banner
                      </span>
                      <p className="text-[11px] text-slate-500">
                        Shows a high-contrast banner at the very top of user dashboards until acknowledged.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      id="emergencyBannerCheck"
                      checked={isEmergencyBanner || composerPriority === 'URGENT'}
                      onChange={(e) => setIsEmergencyBanner(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Delivery Channels *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'PORTAL', label: 'Portal Bulletin' },
                        { id: 'WHATSAPP', label: 'WhatsApp API' },
                        { id: 'SMS', label: 'SMS DLT' },
                        { id: 'PUSH', label: 'In-App Push' },
                        { id: 'EMAIL', label: 'Email' },
                      ].map((ch) => {
                        const isChecked = composerChannels.includes(ch.id as any);
                        return (
                          <button
                            type="button"
                            key={ch.id}
                            onClick={() => toggleChannel(ch.id as any)}
                            className={`px-3 py-1.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
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
                      <label className="font-bold text-slate-700">Message Content *</label>
                      <span className="text-[10px] text-slate-400">Insert tag</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {['{guardian_name}', '{student_name}', '{school_name}', '{due_amount}', '{portal_link}'].map(tag => (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => handleInsertTag(tag)}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono text-[10px] font-bold hover:bg-indigo-100 cursor-pointer"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 rounded-xl shadow-sm cursor-pointer"
                    >
                      Publish Announcement
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
                    <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-2" />

                    <div className="bg-emerald-950/30 rounded-2xl p-3 border border-emerald-800/30 min-h-[300px] flex flex-col justify-between">
                      <div className="flex items-center gap-2 pb-2 border-b border-emerald-800/40 text-[11px] text-white font-bold">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px]">
                          OS
                        </div>
                        <div className="truncate">
                          <div>{activeSchool.name}</div>
                          <div className="text-[8px] text-emerald-400 font-normal">Official Verified Notice ✓</div>
                        </div>
                      </div>

                      <div className="bg-emerald-900/90 text-white p-3 rounded-2xl text-[11px] shadow-sm leading-relaxed my-3 border border-emerald-700/50">
                        <div className="font-bold text-amber-300 text-[10px] mb-1">
                          [{composerPriority}] {composerTitle || 'Announcement Title'}
                        </div>
                        <p className="text-slate-100 whitespace-pre-wrap">{renderPreviewMessage()}</p>
                        <div className="text-right text-[8px] text-emerald-300 mt-1 font-mono">Just Now • Delivered ✓✓</div>
                      </div>

                      <div className="text-center text-[9px] text-slate-400">
                        Encrypted Institutional Gateway
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
