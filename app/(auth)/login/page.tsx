"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Trophy
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500 font-sans text-sm">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        Loading InnovatMind Secure Gateway...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  const { login, loginWithGoogle } = useAuth();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(
    errorParam === 'account_suspended'
      ? 'Your account has been suspended. Please contact your school administrator.'
      : ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // Google OAuth State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googleSuccessUser, setGoogleSuccessUser] = useState<string | null>(null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const routeUserByRole = (userRole: string, redirectTarget?: string | null) => {
    if (redirectTarget && redirectTarget.startsWith('/')) {
      if (userRole === 'STUDENT' && (redirectTarget.startsWith('/admin') || redirectTarget.startsWith('/school'))) {
        router.push('/student');
        return;
      }
      if (userRole === 'SCHOOL_ADMIN' && redirectTarget.startsWith('/admin')) {
        router.push('/school');
        return;
      }
      router.push(redirectTarget);
      return;
    }

    switch (userRole) {
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
        router.push('/teacher');
        break;
      case 'PARENT':
        router.push('/parent');
        break;
      default:
        router.push('/school');
        break;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      
      if (res.success && res.user) {
        setTimeout(() => {
          routeUserByRole(res.user!.role, redirectParam);
        }, 350);
      } else {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
        setIsLoading(false);
      }
    } catch {
      setError('Authentication failed. Please check your network connection.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    setError('');
    // Open Google Account Chooser dialog
    setIsGoogleModalOpen(true);
  };

  const executeGoogleAuth = async (emailToAuth: string) => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const res = await loginWithGoogle(emailToAuth);
      if (res.success && res.user) {
        setGoogleSuccessUser(`${res.user.displayName} (${res.user.role})`);
        setTimeout(() => {
          setIsGoogleModalOpen(false);
          routeUserByRole(res.user!.role, redirectParam);
        }, 500);
      } else {
        setError(res.error || 'Google sign-in failed. This account is not registered.');
        setIsGoogleLoading(false);
      }
    } catch {
      setError('Google authentication failed. Please verify your network.');
      setIsGoogleLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FF] via-[#FFFFFF] to-[#EFF5FF] text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-700 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Decorative Background Curved Glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-400/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-purple-400/10 blur-[120px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 leading-none">
              InnovatMind
            </span>
            <span className="text-xs font-semibold text-slate-400 -mt-0.5">
              School OS
            </span>
          </div>
        </Link>

        {/* Need Help Link */}
        <button
          onClick={() => setIsForgotModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer group"
        >
          <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span>Need Help?</span>
        </button>
      </header>

      {/* Main Two-Column Viewport */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 sm:py-8 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ===============================================================
              LEFT SECTION: Branding, 4 Feature Pillars & 3D Illustration
             =============================================================== */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-7 animate-[fade-in-up_0.5s_ease-out]">
            
            {/* Title & Tagline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-slate-900 leading-[1.12]">
                Smarter Schools <br />
                Brighter <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Futures</span>
              </h1>
              <p className="text-slate-500 text-sm sm:text-base max-w-lg leading-relaxed font-normal">
                A unified platform to manage schools, empower teachers and help students learn with technology.
              </p>
            </div>

            {/* 4 Feature Highlights Pills */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg pt-1">
              {/* 1. School Management */}
              <div className="flex flex-col items-center text-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-purple-100/80 flex items-center justify-center text-purple-600 shadow-xs group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                  School<br />Management
                </span>
              </div>

              {/* 2. Student Learning */}
              <div className="flex flex-col items-center text-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 flex items-center justify-center text-emerald-600 shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                  Student<br />Learning
                </span>
              </div>

              {/* 3. Analytics & Reports */}
              <div className="flex flex-col items-center text-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 flex items-center justify-center text-amber-600 shadow-xs group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                  Analytics<br />&amp; Reports
                </span>
              </div>

              {/* 4. AI, Robotics & Future Skills */}
              <div className="flex flex-col items-center text-center gap-2 group">
                <div className="w-12 h-12 rounded-2xl bg-pink-100/80 flex items-center justify-center text-pink-600 shadow-xs group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-700 leading-tight">
                  AI, Robotics<br />&amp; Future Skills
                </span>
              </div>
            </div>

            {/* Educational Illustration Canvas */}
            <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10 border border-slate-200/60 bg-white">
              <img
                src="/images/login-illustration.png"
                alt="Students learning coding, robotics and AI with digital mentor at InnovatMind School"
                className="w-full h-auto object-cover max-h-[300px] sm:max-h-[340px]"
              />
            </div>
          </div>

          {/* ===============================================================
              RIGHT SECTION: Premium White Login Card
             =============================================================== */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-[fade-in-up_0.6s_ease-out]">
            <div className="w-full max-w-[430px] bg-white rounded-3xl p-7 sm:p-8 shadow-2xl shadow-blue-900/10 border border-slate-100 relative">
              
              {/* Card Header Brand Logo */}
              <div className="flex items-center justify-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
                  M
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                    InnovatMind
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 -mt-0.5">
                    School OS
                  </span>
                </div>
              </div>

              {/* Card Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Login to your account to continue
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Email or Username */}
                <div className="space-y-1.5">
                  <label htmlFor="user-identifier" className="text-xs font-bold text-slate-700 block text-left">
                    Email or Username
                  </label>
                  <div className="relative">
                    <input
                      id="user-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                      placeholder="Enter your email or username"
                      required
                      autoComplete="username"
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="user-password" className="text-xs font-bold text-slate-700 block text-left">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {/* Forgot Password Link */}
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Error Message Alert */}
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 flex items-center gap-2 animate-shake" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* OR Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                id="google-signin-button"
                disabled={isGoogleLoading}
                onClick={handleGoogleSignInClick}
                className="w-full h-11 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Registration & Status Tracking Links */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
                <Link href="/register" className="hover:text-blue-600 transition-colors">
                  Register New School
                </Link>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <Link href="/register/status" className="text-blue-600 hover:text-blue-800 transition-colors">
                  Track Application Status →
                </Link>
              </div>

              {/* Discreet Demo Preview Link to Landing Page */}
              <div className="mt-2 text-center">
                <Link
                  href="/?demo=open"
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Looking for the Demo Preview? Explore sample sandbox on Home Page</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                </Link>
              </div>

              {/* Terms of Service & Privacy Policy */}
              <p className="text-[11px] text-slate-400 text-center mt-4 leading-normal">
                By logging in, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:underline font-semibold">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:underline font-semibold">Privacy Policy</a>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ===============================================================
          BOTTOM FOOTER STATS RIBBON (Matching Image Reference)
         =============================================================== */}
      <footer className="relative z-10 w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md py-4 mt-4">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80">
          
          {/* Stat 1: Partner Schools */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">500+</div>
              <div className="text-xs text-slate-500 font-medium">Partner Schools</div>
            </div>
          </div>

          {/* Stat 2: Students Learning */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">50,000+</div>
              <div className="text-xs text-slate-500 font-medium">Students Learning</div>
            </div>
          </div>

          {/* Stat 3: Learning Activities */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">1M+</div>
              <div className="text-xs text-slate-500 font-medium">Learning Activities</div>
            </div>
          </div>

          {/* Stat 4: School Satisfaction */}
          <div className="flex items-center gap-3.5 px-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">98%</div>
              <div className="text-xs text-slate-500 font-medium">School Satisfaction</div>
            </div>
          </div>

        </div>
      </footer>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-black text-slate-900">Reset Account Access</h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <span className="font-bold block">Password Reset Link Dispatched</span>
                <p className="text-[11px] text-slate-600">If an authorized profile exists for {forgotEmail}, an invitation has been sent.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered institutional email or Student Cadet Login ID. Your school admin or platform operations will receive an account authorization ticket.
                </p>
                <div>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. principal@institution.edu or Student ID"
                    className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs cursor-pointer shadow-md shadow-blue-500/20"
                >
                  Request Password Reset
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Google OAuth Account Chooser Modal */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 sm:p-7 shadow-2xl space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Sign in with Google</h3>
                  <p className="text-[11px] text-slate-400">Choose an account to continue to InnovatMind School OS</p>
                </div>
              </div>
              <button
                disabled={isGoogleLoading}
                onClick={() => {
                  setIsGoogleModalOpen(false);
                  setIsGoogleLoading(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success Feedback */}
            {googleSuccessUser ? (
              <div className="py-6 px-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 animate-bounce" />
                <div className="font-black text-sm">Authenticated Successfully!</div>
                <div className="text-xs text-slate-600 font-medium">
                  Signed in as <span className="font-bold text-slate-900">{googleSuccessUser}</span>. Redirecting to your dashboard...
                </div>
              </div>
            ) : (
              <>
                {/* Institutional Google Workspace Sign-In Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail.trim()) {
                      executeGoogleAuth(customGoogleEmail.trim());
                    }
                  }}
                  className="space-y-4 py-2"
                >
                  <div className="space-y-1.5 text-left">
                    <label htmlFor="custom-google-input" className="text-xs font-bold text-slate-700 block">
                      Institutional Google Workspace Email
                    </label>
                    <input
                      id="custom-google-input"
                      type="email"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="principal@institution.edu.in or yourname@school.org"
                      required
                      autoFocus
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
                    />
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enter your verified Google Workspace email provisioned by your school or InnovatMind HQ.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!customGoogleEmail.trim() || isGoogleLoading}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGoogleLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Institutional Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue with Google Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Cancel Button */}
            {!googleSuccessUser && (
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  disabled={isGoogleLoading}
                  onClick={() => {
                    setIsGoogleModalOpen(false);
                    setIsGoogleLoading(false);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
