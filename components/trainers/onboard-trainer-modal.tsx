"use client";

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { TrainerSpecialization, TrainerStatus } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Award,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface OnboardTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SPECIALIZATIONS: { label: string; value: TrainerSpecialization }[] = [
  { label: 'Robotics & Hardware Labs', value: 'Robotics' },
  { label: 'AI & Machine Learning', value: 'AI & ML' },
  { label: 'Coding & Computational Thinking', value: 'Coding' },
  { label: 'STEM & Maker Projects', value: 'STEM & Projects' },
  { label: 'Computer Basics & Digital Literacy', value: 'Computer Basics' },
  { label: 'IoT & Embedded Electronics', value: 'IoT & Electronics' }
];

export function OnboardTrainerModal({ isOpen, onClose, onSuccess }: OnboardTrainerModalProps) {
  const { onboardTrainer } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'Robotics' as TrainerSpecialization,
    experienceYears: 2,
    maxWorkloadHours: 40,
    avatarUrl: '',
    status: 'ACTIVE' as TrainerStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Please enter trainer full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid official email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter a valid contact phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await onboardTrainer({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization,
        experienceYears: Number(formData.experienceYears) || 1,
        maxWorkloadHours: Number(formData.maxWorkloadHours) || 40,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        status: formData.status
      });

      setIsSubmitting(false);

      if (res.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(res.error || 'Failed to onboard trainer. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full">
                  Super Admin Console
                </span>
                <span className="text-white/60 text-xs">• Central Specialist Roster</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">Onboard Specialist Trainer</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Register verified STEM & AI instructors for partner institution deployments.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="e.g. Dr. Vikram Sarabhai or Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="text-xs h-10 pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                />
                <UserPlus className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Official Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="trainer@innovatmind.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="text-xs h-10 pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="text-xs h-10 pl-9 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Specialization & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Primary Domain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value as TrainerSpecialization }))}
                  className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium focus:outline-none"
                >
                  {SPECIALIZATIONS.map(spec => (
                    <option key={spec.value} value={spec.value}>{spec.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Experience (Years)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="40"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: Number(e.target.value) || 0 }))}
                  className="text-xs h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Workload & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Max Weekly Workload (Hours)
                </label>
                <Input
                  type="number"
                  min="10"
                  max="60"
                  value={formData.maxWorkloadHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxWorkloadHours: Number(e.target.value) || 40 }))}
                  className="text-xs h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TrainerStatus }))}
                  className="w-full text-xs h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 font-medium focus:outline-none"
                >
                  <option value="ACTIVE">Active & Available for Deployments</option>
                  <option value="ON_LEAVE">On Leave / Training</option>
                </select>
              </div>
            </div>

            {/* Profile Avatar URL (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Profile Photo URL <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.avatarUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                className="text-xs h-10 rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-mono"
              />
            </div>
          </div>

          {/* Quick Roster Card Preview */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                {(formData.name.trim() || 'TR').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {formData.name.trim() || 'New Specialist Trainer'}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    {formData.specialization}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {formData.experienceYears}y exp • {formData.maxWorkloadHours}h cap
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs text-slate-600 border-slate-200 h-10 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Onboard Trainer to Roster</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

