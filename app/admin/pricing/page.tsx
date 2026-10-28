"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/app-shell';
import { useAuth } from '@/lib/auth/context';
import { PricingRule, PricingRuleScope, BillingBasis } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CreditCard,
  Plus,
  ArrowRight,
  HelpCircle,
  Building2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

export default function CentralPricingEnginePage() {
  const {
    courses,
    schools,
    pricingRules,
    schoolPricingOverrides,
    savePricingRule,
    togglePricingRuleStatus
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  const [form, setForm] = useState({
    courseId: courses[0]?.id || '',
    scope: 'STATE' as PricingRuleScope,
    scopeValue: 'Maharashtra',
    academicSession: '2026-2027',
    gradeRange: 'Class 6 - 8',
    price: 899,
    currency: 'INR' as const,
    billingBasis: 'PER_STUDENT' as BillingBasis,
    effectiveStartDate: '2026-04-01',
    effectiveEndDate: '2027-03-31',
    discountPercent: 10,
    notes: '',
  });

  const filteredRules = useMemo(() => {
    return pricingRules.filter(r => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || r.courseTitle.toLowerCase().includes(q) || (r.scopeValue && r.scopeValue.toLowerCase().includes(q));
      const matchesScope = selectedScope === 'ALL' || r.scope === selectedScope;
      return matchesSearch && matchesScope;
    });
  }, [pricingRules, searchQuery, selectedScope]);

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === form.courseId) || courses[0];
  }, [courses, form.courseId]);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(form.price) < 0) {
      alert('Price cannot be negative.');
      return;
    }

    savePricingRule({
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.title,
      scope: form.scope,
      scopeValue: form.scopeValue.trim(),
      academicSession: form.academicSession,
      gradeRange: form.gradeRange,
      price: Number(form.price),
      currency: form.currency,
      billingBasis: form.billingBasis,
      effectiveStartDate: form.effectiveStartDate,
      effectiveEndDate: form.effectiveEndDate,
      discountPercent: Number(form.discountPercent) || 0,
      isActive: true,
      notes: form.notes.trim(),
      createdBy: 'usr-super'
    });

    setIsAddRuleOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-12 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                Central Pricing Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">• Tiered Hierarchy System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-8 h-8 text-purple-600" />
              Central Course Pricing Directorate
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Manage global course prices, regional discounts, state subsidies, and institutional tier overrides.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddRuleOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-2 h-10 px-5 shadow-md shadow-purple-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Hierarchy Tier Rule
            </Button>
          </div>
        </div>

        {/* Pricing Hierarchy Banner */}
        <Card className="p-4 bg-gradient-to-r from-purple-50 via-indigo-50/50 to-white border border-purple-200 rounded-2xl shadow-sm text-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-purple-950 block text-sm">
                Deterministic Pricing Precedence Hierarchy:
              </span>
              <p className="text-[11px] text-slate-600">
                Default Catalog Rate (0) → Region Tier (1) → State Tier (2) → City Tier (3) → School Board Tier (4) → Grade Tier (5) → School Specific Override (6, Absolute Priority).
              </p>
            </div>
          </div>
        </Card>

        {/* Filters Bar */}
        <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search by course or tier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-slate-500 font-semibold">Tier Scope:</span>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 text-xs focus:outline-none"
            >
              <option value="ALL">All Tiers ({pricingRules.length})</option>
              <option value="GLOBAL_DEFAULT">Global Default</option>
              <option value="STATE">State Level</option>
              <option value="SCHOOL_TYPE">School Board / Type</option>
              <option value="REGION">Regional Tier</option>
              <option value="GRADE">Grade Tier</option>
            </select>
          </div>
        </Card>

        {/* Central Rules Table */}
        <Card className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Tier Scope</th>
                  <th className="py-3 px-4">Scope Target Value</th>
                  <th className="py-3 px-4">Grade Range</th>
                  <th className="py-3 px-4">Rate (INR)</th>
                  <th className="py-3 px-4">Billing Basis</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRules.map(rule => (
                  <tr key={rule.id} className="hover:bg-purple-50/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{rule.courseTitle}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] bg-slate-50 font-bold text-purple-700 border-purple-200">
                        {rule.scope}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {rule.scopeValue || 'Global Standard'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {rule.gradeRange || 'All Grades'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                      ₹{rule.price}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rule.billingBasis.toLowerCase().replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`text-[10px] font-bold ${rule.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                        {rule.isActive ? 'Active Rule' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePricingRuleStatus(rule.id, !rule.isActive)}
                        className={`text-[11px] font-semibold ${rule.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Add New Pricing Rule */}
        {isAddRuleOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="max-w-lg w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Create Tiered Pricing Rule</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsAddRuleOpen(false)} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Course</label>
                  <select
                    value={form.courseId}
                    onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                    className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tier Scope</label>
                    <select
                      value={form.scope}
                      onChange={(e) => setForm({ ...form, scope: e.target.value as PricingRuleScope })}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                    >
                      <option value="STATE">State Tier</option>
                      <option value="SCHOOL_TYPE">School Board / Type</option>
                      <option value="REGION">Regional Tier</option>
                      <option value="CITY">City Tier</option>
                      <option value="GRADE">Grade Tier</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Value</label>
                    <Input
                      placeholder="e.g. Maharashtra or CBSE"
                      value={form.scopeValue}
                      onChange={(e) => setForm({ ...form, scopeValue: e.target.value })}
                      required
                      className="h-9 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tier Price (₹)</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      required
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Billing Basis</label>
                    <select
                      value={form.billingBasis}
                      onChange={(e) => setForm({ ...form, billingBasis: e.target.value as BillingBasis })}
                      className="h-9 px-3 bg-white border border-slate-200 rounded-xl text-xs font-medium w-full focus:outline-none"
                    >
                      <option value="PER_STUDENT">Per Student</option>
                      <option value="PER_BATCH">Per Batch</option>
                      <option value="ANNUAL_FLAT">Annual Flat</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRuleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
                    Save Tier Rule
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
