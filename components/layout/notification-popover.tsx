"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { AuditEvent, NoticeBroadcast, NoticePriority } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Clock,
  ChevronRight,
  CheckCheck,
  X,
  Radio,
  FileText,
  UserCheck,
  CreditCard,
  Cpu,
  GraduationCap
} from 'lucide-react';

interface NotificationPopoverProps {
  className?: string;
  isDarkTheme?: boolean;
}

interface NotificationItem {
  id: string;
  type: 'NOTICE' | 'AUDIT';
  title: string;
  description: string;
  timestamp: string;
  priority?: NoticePriority;
  category?: string;
  read: boolean;
  link?: string;
}

export function NotificationPopover({ className = '', isDarkTheme = false }: NotificationPopoverProps) {
  const { activities, notices, role, activeSchool } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'NOTICES' | 'ACTIVITY'>('ALL');
  const [readItemIds, setReadItemIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('school_os_read_notifications');
        if (stored) return new Set(JSON.parse(stored));
      } catch {}
    }
    return new Set<string>();
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close popover on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Build unified notifications list
  const allNotifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    // 1. Add active notices
    if (Array.isArray(notices)) {
      notices.slice(0, 10).forEach(notice => {
        items.push({
          id: `notif-notice-${notice.id}`,
          type: 'NOTICE',
          title: notice.title,
          description: notice.messageContent,
          timestamp: notice.sentAt || 'Recently',
          priority: notice.priority,
          category: notice.isEmergencyBanner ? 'Emergency' : 'Broadcast',
          read: readItemIds.has(`notif-notice-${notice.id}`),
          link: '/school/notices'
        });
      });
    }

    // 2. Add recent audit activities
    if (Array.isArray(activities)) {
      activities.slice(0, 15).forEach(activity => {
        items.push({
          id: `notif-act-${activity.id}`,
          type: 'AUDIT',
          title: activity.title,
          description: activity.detail,
          timestamp: activity.time || 'Recently',
          category: activity.category,
          read: readItemIds.has(`notif-act-${activity.id}`)
        });
      });
    }

    return items;
  }, [notices, activities, readItemIds]);

  // Unread items count
  const unreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.read).length;
  }, [allNotifications]);

  // Has any urgent notification
  const hasUrgent = useMemo(() => {
    return allNotifications.some(n => !n.read && n.priority === 'URGENT');
  }, [allNotifications]);

  // Filtered by tab
  const filteredItems = useMemo(() => {
    if (activeTab === 'NOTICES') return allNotifications.filter(n => n.type === 'NOTICE');
    if (activeTab === 'ACTIVITY') return allNotifications.filter(n => n.type === 'AUDIT');
    return allNotifications;
  }, [allNotifications, activeTab]);

  // Mark all as read
  const handleMarkAllRead = () => {
    const updated = new Set(readItemIds);
    allNotifications.forEach(n => updated.add(n.id));
    setReadItemIds(updated);
    try {
      localStorage.setItem('school_os_read_notifications', JSON.stringify(Array.from(updated)));
    } catch {}
  };

  // Mark single item read
  const handleItemClick = (id: string) => {
    if (!readItemIds.has(id)) {
      const updated = new Set(readItemIds);
      updated.add(id);
      setReadItemIds(updated);
      try {
        localStorage.setItem('school_os_read_notifications', JSON.stringify(Array.from(updated)));
      } catch {}
    }
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* Bell Button Trigger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`relative p-1.5 sm:p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
          isDarkTheme
            ? 'text-slate-400 hover:text-white hover:bg-slate-800'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        } ${isOpen ? (isDarkTheme ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900 ring-2 ring-blue-500/20') : ''}`}
        title="Notifications & System Activity"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

        {/* Dynamic Badge */}
        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 min-w-[15px] h-[15px] sm:min-w-[17px] sm:h-[17px] px-1 rounded-full text-white font-black text-[9px] sm:text-[10px] flex items-center justify-center leading-none shadow-sm ${
              hasUrgent
                ? 'bg-rose-600 animate-pulse'
                : 'bg-blue-600'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] z-50 animate-in fade-in zoom-in-95 origin-top-right">
          <Card className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                    <span>Notifications & Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-blue-600 px-1.5 py-0.2 rounded-full text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {role === 'SUPER_ADMIN' ? 'Platform HQ activity feed' : `${activeSchool.name} circulars & events`}
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] font-bold text-blue-300 hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between px-3 pt-2.5 pb-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === 'ALL'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  All ({allNotifications.length})
                </button>
                <button
                  onClick={() => setActiveTab('NOTICES')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === 'NOTICES'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Circulars ({notices?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('ACTIVITY')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeTab === 'ACTIVITY'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Activity ({activities?.length || 0})
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-medium">Real-time</span>
            </div>

            {/* Notifications Scroll List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">All Caught Up!</h4>
                  <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                    You have reviewed all recent announcements and audit activities.
                  </p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const isUnread = !item.read;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 relative ${
                        isUnread ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      {/* Unread indicator dot */}
                      {isUnread && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                      )}

                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {item.type === 'NOTICE' ? (
                          item.priority === 'URGENT' ? (
                            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                              <Radio className="w-3.5 h-3.5" />
                            </div>
                          )
                        ) : item.category === 'STEM' ? (
                          <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
                            <Cpu className="w-3.5 h-3.5" />
                          </div>
                        ) : item.category === 'FEE' ? (
                          <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
                            <GraduationCap className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Badges footer */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {item.priority && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                item.priority === 'URGENT'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : item.priority === 'HOLIDAY'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : item.priority === 'FEES'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {item.priority}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium">
                Showing {filteredItems.length} notification(s)
              </span>
              <Link
                href="/school/notices"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Notice Gateway</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

