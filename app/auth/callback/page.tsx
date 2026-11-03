"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600 font-sans">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Completing secure authentication...</p>
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  );
}

function AuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { establishSession, schools } = useAuth();
  
  const [status, setStatus] = useState<'VERIFYING' | 'SUCCESS' | 'DENIED' | 'ERROR'>('VERIFYING');
  const [errorMessage, setErrorMessage] = useState('');
  const [unauthorizedEmail, setUnauthorizedEmail] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function processCallback() {
      try {
        // 1. Check for OAuth errors in URL query params
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        if (errorParam) {
          throw new Error(errorDescription || errorParam || 'Authentication was cancelled or failed.');
        }

        // 2. Exchange code if PKCE code is present in query
        const code = searchParams.get('code');
        if (code && supabase && supabase.auth) {
          try {
            await supabase.auth.exchangeCodeForSession(code);
          } catch (codeErr: any) {
            console.warn('[auth/callback] Code exchange notice:', codeErr.message);
          }
        }

        // 3. Retrieve established Supabase session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session?.user) {
          // If no session found in direct call, set up a one-time auth state change listener
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user && isMounted) {
              subscription.unsubscribe();
              await handleAuthenticatedUser(session.user.email!, session.user.id, session.access_token);
            }
          });

          // Timeout after 8 seconds if session never appears
          setTimeout(() => {
            if (isMounted && status === 'VERIFYING') {
              setStatus('ERROR');
              setErrorMessage('Authentication session timed out. Please try logging in again.');
            }
          }, 8000);
          return;
        }

        const user = sessionData.session.user;
        await handleAuthenticatedUser(user.email!, user.id, sessionData.session.access_token);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ERROR');
        setErrorMessage(err.message || 'Authentication callback failed.');
      }
    }

    async function handleAuthenticatedUser(email: string, authId: string, accessToken: string) {
      try {
        // 4. Resolve Trusted Application Profile via secure backend API
        const profileRes = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ email, authId })
        });

        const profileData = await profileRes.json();

        // 5. Unknown Google accounts or unauthorized users MUST NOT receive dashboard access!
        if (!profileRes.ok || !profileData.success || !profileData.user) {
          // Immediately sign out from Supabase Auth so no orphaned session remains
          await supabase.auth.signOut();
          
          if (!isMounted) return;
          setStatus('DENIED');
          setUnauthorizedEmail(email);
          setErrorMessage(
            profileData.error || 
            `Access Denied: The Google account "${email}" has not been authorized on InnovatMind School OS.`
          );
          return;
        }

        // 6. Account is fully verified and authorized!
        const authorizedUser = profileData.user;
        
        if (!isMounted) return;
        setStatus('SUCCESS');

        // Update application state
        establishSession(authorizedUser);

        // 7. Route user to their authorized dashboard based on their role
        setTimeout(() => {
          switch (authorizedUser.role) {
            case 'SUPER_ADMIN':
              router.push('/admin');
              break;
            case 'SCHOOL_ADMIN':
              router.push('/school');
              break;
            case 'STUDENT':
              router.push('/student');
              break;
            case 'TEACHER':
            case 'INNOVATMIND_TRAINER':
              router.push('/school');
              break;
            default:
              router.push('/school');
              break;
          }
        }, 600);
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ERROR');
        setErrorMessage(err.message || 'Failed to verify account authorization.');
      }
    }

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#FFFFFF] to-[#EFF5FF] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 text-center">
        
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

        {/* State 1: Verifying */}
        {status === 'VERIFYING' && (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Verifying Identity</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Connecting with InnovatMind Central Identity Gateway and verifying your institutional authorization...
            </p>
          </div>
        )}

        {/* State 2: Success */}
        {status === 'SUCCESS' && (
          <div className="space-y-4 py-4 animate-scale-up">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Authentication Confirmed</h2>
            <p className="text-xs text-slate-500">
              Identity verified. Opening your authorized dashboard...
            </p>
          </div>
        )}

        {/* State 3: Denied (Unknown or Unauthorized Google Account) */}
        {status === 'DENIED' && (
          <div className="space-y-4 py-2 text-left animate-shake">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-black text-slate-900">Access Denied: Account Not Authorized</h2>
              <p className="text-xs text-slate-500 mt-1">
                Google account successfully authenticated, but has not been provisioned on InnovatMind School OS.
              </p>
            </div>
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-900">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Unauthorized Identity:</span>
              </div>
              <p className="font-mono text-[11px] break-all">{unauthorizedEmail}</p>
              <p className="text-[11px] text-rose-700 pt-1">
                Self-registration is disabled. Your institution administrator or Super Admin must onboard your profile before you can log in.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
              >
                Return to Login
              </Link>
              <Link
                href="/register"
                className="w-full h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
              >
                Register New Institution
              </Link>
            </div>
          </div>
        )}

        {/* State 4: Error */}
        {status === 'ERROR' && (
          <div className="space-y-4 py-2">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-slate-900">Authentication Error</h2>
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 font-medium">
              {errorMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
