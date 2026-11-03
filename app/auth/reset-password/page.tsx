"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600 font-sans">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading password recovery...</p>
      </div>
    }>
      <ResetPasswordHandler />
    </Suspense>
  );
}

function ResetPasswordHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 1. Extract access token from URL hash fragment if present (Supabase recovery link)
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hashClean = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
      const params = new URLSearchParams(hashClean);
      const token = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (token) {
        setAccessToken(token);
        if (supabase && supabase.auth && refreshToken) {
          supabase.auth.setSession({ access_token: token, refresh_token: refreshToken }).then(({ data }) => {
            if (data?.user?.email) setUserEmail(data.user.email);
          }).catch(() => {});
        }
      }
    }

    // 2. Also check active Supabase session
    if (supabase && supabase.auth) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session) {
          if (!accessToken && data.session.access_token) {
            setAccessToken(data.session.access_token);
          }
          if (data.session.user?.email) {
            setUserEmail(data.session.user.email);
          }
        }
      }).catch(() => {});
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setStatus('LOADING');

    try {
      // 1. Supabase client update if active session exists
      if (supabase && supabase.auth) {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) {
            console.warn('[reset-password] Client updateUser notice:', error.message);
          }
        } catch {}
      }

      // 2. Backend API update
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify({
          action: 'RESET',
          newPassword: password,
          token: accessToken,
          email: userEmail
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password. Please request a new reset link.');
      }

      setStatus('SUCCESS');
    } catch (err: any) {
      setStatus('ERROR');
      setErrorMessage(err.message || 'An unexpected error occurred while resetting password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#FFFFFF] to-[#EFF5FF] flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25">
            M
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">InnovatMind</span>
            <span className="text-xs font-semibold text-slate-400 -mt-0.5">School OS Identity Gateway</span>
          </div>
        </div>

        {status === 'SUCCESS' ? (
          <div className="space-y-4 py-4 text-center animate-scale-up">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Password Updated Successfully!</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your account password has been updated. You can now log in to InnovatMind School OS using your new credentials.
            </p>
            <div className="pt-3">
              <Link
                href="/login"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-500/25"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Set New Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                {userEmail ? (
                  <>Setting new password for <strong className="text-slate-700">{userEmail}</strong></>
                ) : (
                  'Please choose a strong password with at least 6 characters.'
                )}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block text-left">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block text-left">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                    placeholder="Repeat new password"
                    required
                    minLength={6}
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'LOADING'}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-blue-500/25 disabled:opacity-60 cursor-pointer"
              >
                {status === 'LOADING' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
