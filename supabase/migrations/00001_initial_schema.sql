-- 00001_initial_schema.sql
-- Multi-Tenant Database Schema for School OS 2.0
-- Enables strict Row-Level Security (RLS) ensuring schools can only access their own data.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Schools (Tenants)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  school_type TEXT NOT NULL, -- e.g., 'CBSE', 'ICSE', 'STATE'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (Profiles linked to Auth)
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE, -- Linked to auth.users (Supabase Auth)
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Students (Gamification Data)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  admission_number TEXT NOT NULL,
  roll_number TEXT,
  grade_name TEXT NOT NULL,
  section_name TEXT NOT NULL,
  current_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Financials (Per School)
CREATE TABLE public.school_financials (
  school_id UUID PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  total_billed NUMERIC DEFAULT 0,
  total_collected NUMERIC DEFAULT 0,
  total_overdue NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Audit Events (Activity Logs)
CREATE TABLE public.audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- MULTI-TENANT POLICIES (Users can only see data from their own school)
-- Note: Super Admins bypass RLS via a special role or function (omitted here for brevity).

CREATE POLICY "Users can read their school" 
  ON public.schools FOR SELECT 
  USING (id IN (SELECT school_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can read users in their school" 
  ON public.users FOR SELECT 
  USING (school_id IN (SELECT school_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can read students in their school" 
  ON public.students FOR SELECT 
  USING (school_id IN (SELECT school_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can read financials of their school" 
  ON public.school_financials FOR SELECT 
  USING (school_id IN (SELECT school_id FROM public.users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can read audit events of their school" 
  ON public.audit_events FOR SELECT 
  USING (school_id IN (SELECT school_id FROM public.users WHERE auth_id = auth.uid()));
