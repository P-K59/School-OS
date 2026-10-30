"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { NoticeBroadcast } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Calendar,
  X,
  Info,
  Radio,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  BellRing
} from 'lucide-react';

export function EmergencyNoticeBanner() {
  const { notices, currentUser, dismissNotice, role } = useAuth();
  const [selectedNoticeForModal, setSelectedNoticeForModal] = useState<NoticeBroadcast | null>(null);

  const userId = currentUser?.id || 'session-guest';

  // Find the highest-priority active emergency or pinned notice for this user
  const activeEmergencyNotices = notices.filter(n => {
    if (!n.isEmergencyBanner || n.status !== 'PUBLISHED') return false;

    // Check if dismissed
    if (n.readByUsers && n.readByUsers.includes(userId)) return false;

    // Target audience check
    if (n.targetAudience === 'ALL') return true;
    if (role === 'STUDENT' && n.targetAudience === 'STUDENTS') return true;
    if (role === 'PARENT' && n.targetAudience === 'PARENTS') return true;
    if ((role === 'TEACHER' || role === 'SCHOOL_ADMIN') && n.targetAudience === 'STAFF') return true;

    return false;
  });

  if (activeEmergencyNotices.length === 0) return null;

  const topNotice = activeEmergencyNotices[0];
  const isUrgent = topNotice.priority === 'URGENT';
  const isHoliday = topNotice.priority === 'HOLIDAY';

  return (
    <>
      <div className={`w-full text-xs font-medium border-b transition-all duration-300 shadow-sm print:hidden ${
        isUrgent
          ? 'bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 text-rose-100 border-rose-700/80'
          : isHoliday
          ? 'bg-gradient-to-r from-amber-950 via-orange-900 to-amber-950 text-amber-100 border-amber-700/80'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-indigo-100 border-indigo-700/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Pulsing indicator */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold ${
              isUrgent
                ? 'bg-rose-500/30 text-rose-300 border border-rose-400/40 animate-pulse'
                : isHoliday
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/40'
                : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40'
            }`}>
              {isUrgent ? <AlertTriangle className="w-4 h-4 text-rose-300" /> : isHoliday ? <Calendar className="w-4 h-4 text-amber-300" /> : <BellRing className="w-4 h-4 text-indigo-300" />}
            </div>

            {/* Tag & Title */}
            <div className="flex flex-wrap items-center gap-2 truncate">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isUrgent
                  ? 'bg-rose-500 text-white'
                  : isHoliday
                  ? 'bg-amber-500 text-amber-950'
                  : 'bg-indigo-500 text-white'
              }`}>
                {isUrgent ? 'EMERGENCY BROADCAST' : isHoliday ? 'OFFICIAL HOLIDAY' : 'IMPORTANT NOTICE'}
              </span>

              <span className="font-extrabold text-white truncate">
                {topNotice.title}
              </span>

              <span className="hidden md:inline text-slate-300 text-[11px] truncate max-w-md">
                — {topNotice.messageContent}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedNoticeForModal(topNotice)}
              className="text-[11px] font-bold underline hover:text-white transition-colors cursor-pointer px-1 py-0.5"
            >
              Read Full Notice
            </button>

            <button
              onClick={() => dismissNotice(topNotice.id)}
              className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Acknowledge and dismiss alert"
              aria-label="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Full Notice Reading Modal */}
      {selectedNoticeForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                  selectedNoticeForModal.priority === 'URGENT'
                    ? 'bg-rose-100 text-rose-600 border border-rose-200'
                    : selectedNoticeForModal.priority === 'HOLIDAY'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  {selectedNoticeForModal.priority === 'URGENT' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : selectedNoticeForModal.priority === 'HOLIDAY' ? (
                    <Calendar className="w-5 h-5" />
                  ) : (
                    <BellRing className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {selectedNoticeForModal.priority} • Target: {selectedNoticeForModal.targetAudience}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    {selectedNoticeForModal.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedNoticeForModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
              {selectedNoticeForModal.messageContent}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span>Author: <strong className="text-slate-700">{selectedNoticeForModal.authorName || 'School Administration'}</strong></span>
              <span>Dispatched: <strong className="text-slate-700">{new Date(selectedNoticeForModal.sentAt).toLocaleDateString()}</strong></span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedNoticeForModal(null)}
                className="text-xs text-slate-600 border-slate-200 h-9"
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  dismissNotice(selectedNoticeForModal.id);
                  setSelectedNoticeForModal(null);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 rounded-xl"
              >
                Acknowledge &amp; Dismiss
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
