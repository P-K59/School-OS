"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Wallet, AlertCircle, ShieldCheck } from 'lucide-react';

export function FinancialVaultCard() {
  const { financials, activeSchool } = useAuth();
  
  const totalBilled = financials.totalBilled;
  const totalCollected = financials.totalCollected;
  const totalOverdue = financials.totalOverdue;
  const collectionRate = Math.round((totalCollected / totalBilled) * 100);

  return (
    <Card className="light-glass card-hover text-slate-900 flex flex-col justify-between">
      <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shadow-xs">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Fee Vault & Cashflow Ledger
            </CardTitle>
            <span className="text-xs text-slate-500 font-medium">Tenant Scoped: {activeSchool.name}</span>
          </div>
        </div>
        <Badge variant="success">{collectionRate}% Reconciled</Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        {/* Main Collection Numbers */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalCollected)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Collected of <span className="font-semibold text-slate-700">{formatCurrency(totalBilled)}</span> Term 1 Billing
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-rose-600 flex items-center gap-1 justify-end">
              <AlertCircle className="w-4 h-4" />
              {formatCurrency(totalOverdue)}
            </span>
            <div className="text-xs text-slate-500 font-medium">Pending Overdue</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
            <span>Collection Velocity</span>
            <span className="text-emerald-700 font-bold">{collectionRate}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>

        {/* Payment Channels Grid */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="text-sm font-extrabold text-cyan-700">{financials.upiPercentage}%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Instant UPI</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="text-sm font-extrabold text-indigo-700">{financials.netBankingPercentage}%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Net Banking</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 shadow-xs">
            <div className="text-sm font-extrabold text-slate-700">{financials.cashPercentage}%</div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">Cash / Cheque</div>
          </div>
        </div>

        <div className="pt-2">
          <a
            href="/school/fees"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold transition-colors"
          >
            <span>Open Full Fee Ledger & Invoicing</span>
            <span className="text-indigo-600 font-mono">→</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
