-- ============================================================================
-- InnovatMind School OS — Secure Authentication & Identity Management
-- Migration: 20261101_secure_auth_identity_and_rls.sql
-- Enforces Supabase Auth Identity Mapping, Profile RLS, and Account Protection
-- ============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ensure user_role enum exists
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'SUPER_ADMIN',
        'SCHOOL_ADMIN',
        'TEACHER',
        'INNOVATMIND_TRAINER',
        'STUDENT',
        'PARENT'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Ensure public.profiles table exists with exact column constraints
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Linked to auth.users in Supabase Auth
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'STUDENT',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    designation VARCHAR(150),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create performance indexes for authentication and lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles (auth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_school_role ON public.profiles (school_id, role);

-- 5. Enable Row Level Security (RLS) on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. Clean up legacy / conflicting profile policies idempotently
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_read_same_school_profiles" ON public.profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "super_admin_manage_profiles" ON public.profiles;

-- 7. Define production RLS policies
-- A. Users can strictly read their own profile (by auth_id or verified JWT email)
CREATE POLICY "users_read_own_profile" ON public.profiles
    FOR SELECT
    USING (
        auth_id = auth.uid() 
        OR LOWER(email) = LOWER(auth.jwt() ->> 'email')
    );

-- B. Users can update their own profile details (excluding privilege escalation on role)
CREATE POLICY "users_update_own_profile" ON public.profiles
    FOR UPDATE
    USING (auth_id = auth.uid())
    WITH CHECK (
        auth_id = auth.uid() 
        AND role = (SELECT role FROM public.profiles WHERE auth_id = auth.uid())
    );

-- C. Super Admins can manage all profiles across all institutions
CREATE POLICY "super_admin_manage_profiles" ON public.profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_id = auth.uid() AND p.role = 'SUPER_ADMIN' AND p.is_active = TRUE
        )
    );

-- D. School Admins can view profiles belonging to their assigned school
CREATE POLICY "school_admin_view_school_profiles" ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.auth_id = auth.uid() 
              AND p.role = 'SCHOOL_ADMIN' 
              AND p.school_id = public.profiles.school_id 
              AND p.is_active = TRUE
        )
    );

-- 8. Secure verification function to check email authorization without data leakage
CREATE OR REPLACE FUNCTION public.is_email_authorized(query_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE LOWER(email) = LOWER(TRIM(query_email))
          AND is_active = TRUE
    );
END;
$$;

