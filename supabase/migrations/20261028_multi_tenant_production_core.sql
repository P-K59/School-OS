-- ============================================================================
-- InnovatMind School OS - Database Migration: Multi-Tenant Production Core
-- Version: 20261028_multi_tenant_production_core.sql
-- Database: PostgreSQL 15+ (Supabase)
-- Enforces: Strict Multi-Tenant Isolation, RLS Boundaries, Role Escalation Protection,
--           Course Assignment Propagation, and Student Credentials Security.
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Enumerated Types
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

DO $$ BEGIN
    CREATE TYPE school_onboarding_status AS ENUM (
        'ENQUIRY',
        'IN_DISCUSSION',
        'DEMO_SCHEDULED',
        'CONTRACT_STAGE',
        'ONBOARDING',
        'ACTIVE',
        'SUSPENDED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status_type AS ENUM (
        'PRESENT',
        'ABSENT',
        'LATE',
        'HALF_DAY',
        'EXCUSED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'PENDING',
        'PARTIAL',
        'PAID',
        'OVERDUE',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- 3. CORE MULTI-TENANT ENTITIES
-- ============================================================================

-- Schools (Tenant Partition)
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    school_type VARCHAR(50) NOT NULL DEFAULT 'CBSE',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Delhi',
    state VARCHAR(100) NOT NULL DEFAULT 'Delhi',
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL DEFAULT '110001',
    logo_url TEXT,
    onboarding_status school_onboarding_status NOT NULL DEFAULT 'ACTIVE',
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Profiles (Auth Mapping)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE, -- Linked to auth.users in Supabase
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

-- Classes & Cohorts (Per School)
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. 'Grade 8'
    grade_level INTEGER NOT NULL,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_class UNIQUE(school_id, name, academic_session)
);

CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. 'A'
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_class_section UNIQUE(class_id, name)
);

-- Students Directory & Gamification Records
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    admission_number VARCHAR(100) NOT NULL,
    cadet_login_id VARCHAR(100) UNIQUE NOT NULL,
    roll_number VARCHAR(50) NOT NULL DEFAULT '101',
    grade_name VARCHAR(100) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    fee_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(50) NOT NULL,
    parent_email VARCHAR(150),
    current_xp INTEGER NOT NULL DEFAULT 100,
    current_level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    attendance_percentage NUMERIC(5, 2) NOT NULL DEFAULT 100.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_admission UNIQUE(school_id, admission_number)
);

-- Canonical Course Catalog (Centralized Super Admin Source of Truth)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'Coding', 'Robotics', 'AI', 'IoT', 'Hardware'
    min_grade INTEGER NOT NULL DEFAULT 1,
    max_grade INTEGER NOT NULL DEFAULT 12,
    thumbnail_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    total_modules INTEGER NOT NULL DEFAULT 10,
    total_lessons INTEGER NOT NULL DEFAULT 30,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    price_per_student NUMERIC(10, 2) NOT NULL DEFAULT 999.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Super Admin Central Course Pricing Rules
CREATE TABLE IF NOT EXISTS public.pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    course_title VARCHAR(255) NOT NULL,
    scope VARCHAR(50) NOT NULL, -- 'GLOBAL_DEFAULT', 'REGION', 'STATE', 'CITY', 'SCHOOL_TYPE', 'GRADE', 'COURSE'
    scope_value VARCHAR(150),
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT',
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- School Specific Pricing Overrides
CREATE TABLE IF NOT EXISTS public.school_pricing_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    custom_price NUMERIC(10, 2) NOT NULL CHECK (custom_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT',
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_course_override_rule UNIQUE(school_id, course_id, academic_session)
);

-- Super Admin -> School Course Assignments (Propagation Step 1)
CREATE TABLE IF NOT EXISTS public.school_course_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    eligible_grades TEXT[] NOT NULL DEFAULT '{}',
    eligible_sections TEXT[] NOT NULL DEFAULT '{}',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    applied_price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 999.00,
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    enrolled_students_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_active_school_course_assignment UNIQUE(school_id, course_id, academic_session)
);

-- School Admin -> Class/Student Bulk Enrollments (Propagation Step 2)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id VARCHAR(100),
    student_login_id VARCHAR(100) NOT NULL,
    grade_name VARCHAR(100) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    completed_lessons INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 30,
    progress_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    quiz_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    CONSTRAINT uq_student_course_enrollment UNIQUE(school_id, course_id, student_id)
);

-- Real-time Student Learning Progress & Capstone Telemetry (Propagation Step 3)
CREATE TABLE IF NOT EXISTS public.student_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    modules_completed INTEGER NOT NULL DEFAULT 0,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    current_module_index INTEGER NOT NULL DEFAULT 0,
    quiz_score NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    capstone_submitted BOOLEAN NOT NULL DEFAULT FALSE,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_progress_entry UNIQUE(student_id, course_id)
);

-- Daily Attendance Management
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status attendance_status_type NOT NULL DEFAULT 'PRESENT',
    remarks TEXT,
    marked_by VARCHAR(150) NOT NULL DEFAULT 'School Admin',
    marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_daily_attendance UNIQUE(school_id, student_id, date)
);

-- Institutional Fee Structures
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    grade_name VARCHAR(100) NOT NULL,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    tuition_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    stem_lab_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    exam_library_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    annual_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    total_annual_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_grade_fee UNIQUE(school_id, grade_name, academic_session)
);

-- Student Fee Invoices
CREATE TABLE IF NOT EXISTS public.fee_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(200) NOT NULL,
    grade_name VARCHAR(100) NOT NULL,
    section_name VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Tuition & STEM Curriculum',
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    status payment_status_type NOT NULL DEFAULT 'PENDING',
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Verified Payment Receipts
CREATE TABLE IF NOT EXISTS public.payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_id UUID NOT NULL REFERENCES public.fee_invoices(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(200) NOT NULL,
    admission_number VARCHAR(100) NOT NULL,
    grade_name VARCHAR(100) NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'UPI',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    authorized_signatory VARCHAR(150) NOT NULL DEFAULT 'Accounts Officer, InnovatMind School OS'
);

-- Immutable Institutional Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. PERFORMANCE INDEXES (TENANT BOUNDARY OPTIMIZATION)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_schools_code ON public.schools(code);
CREATE INDEX IF NOT EXISTS idx_profiles_school_role ON public.profiles(school_id, role);
CREATE INDEX IF NOT EXISTS idx_students_school_grade ON public.students(school_id, grade_name, section_name);
CREATE INDEX IF NOT EXISTS idx_students_cadet_login ON public.students(cadet_login_id);
CREATE INDEX IF NOT EXISTS idx_school_assignments_lookup ON public.school_course_assignments(school_id, course_id, status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON public.course_enrollments(student_id, course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_lookup ON public.attendance_records(school_id, date);
CREATE INDEX IF NOT EXISTS idx_fee_invoices_student ON public.fee_invoices(school_id, student_id, status);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS & POLICIES
-- ============================================================================

-- Function: Extract Authenticated User's Profile
CREATE OR REPLACE FUNCTION public.get_auth_profile()
RETURNS public.profiles AS $$
DECLARE
    prof public.profiles;
BEGIN
    SELECT * INTO prof FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1;
    RETURN prof;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Extract Authenticated School ID
CREATE OR REPLACE FUNCTION public.get_auth_school_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT school_id FROM public.profiles WHERE auth_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Check if Authenticated User is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_id = auth.uid() AND role = 'SUPER_ADMIN' AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on All Tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS POLICIES: schools
-- ----------------------------------------------------------------------------
CREATE POLICY "super_admin_manage_schools" ON public.schools
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "school_admin_view_own_school" ON public.schools
    FOR SELECT USING (id = public.get_auth_school_id());

-- ----------------------------------------------------------------------------
-- RLS POLICIES: profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "super_admin_manage_profiles" ON public.profiles
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "users_read_same_school_profiles" ON public.profiles
    FOR SELECT USING (school_id = public.get_auth_school_id() OR auth_id = auth.uid());

CREATE POLICY "users_update_own_profile" ON public.profiles
    FOR UPDATE USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE auth_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- RLS POLICIES: students
-- ----------------------------------------------------------------------------
CREATE POLICY "super_admin_manage_students" ON public.students
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "school_admin_manage_school_students" ON public.students
    FOR ALL USING (school_id = public.get_auth_school_id())
    WITH CHECK (school_id = public.get_auth_school_id());

CREATE POLICY "student_view_own_record" ON public.students
    FOR SELECT USING (profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid()));

-- ----------------------------------------------------------------------------
-- RLS POLICIES: courses & pricing
-- ----------------------------------------------------------------------------
CREATE POLICY "public_read_published_courses" ON public.courses
    FOR SELECT USING (is_published = TRUE OR public.is_super_admin());

CREATE POLICY "super_admin_manage_courses" ON public.courses
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "super_admin_manage_pricing" ON public.pricing_rules
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "super_admin_manage_pricing_overrides" ON public.school_pricing_overrides
    FOR ALL USING (public.is_super_admin());

-- ----------------------------------------------------------------------------
-- RLS POLICIES: course assignments & enrollments
-- ----------------------------------------------------------------------------
CREATE POLICY "super_admin_manage_school_assignments" ON public.school_course_assignments
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "school_admin_view_school_assignments" ON public.school_course_assignments
    FOR SELECT USING (school_id = public.get_auth_school_id());

CREATE POLICY "super_admin_manage_enrollments" ON public.course_enrollments
    FOR ALL USING (public.is_super_admin());

CREATE POLICY "school_admin_manage_enrollments" ON public.course_enrollments
    FOR ALL USING (school_id = public.get_auth_school_id())
    WITH CHECK (school_id = public.get_auth_school_id());

CREATE POLICY "student_view_own_enrollments" ON public.course_enrollments
    FOR SELECT USING (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())));

CREATE POLICY "student_update_own_progress" ON public.student_course_progress
    FOR ALL USING (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())))
    WITH CHECK (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())));

-- ----------------------------------------------------------------------------
-- RLS POLICIES: attendance & finance
-- ----------------------------------------------------------------------------
CREATE POLICY "school_admin_manage_attendance" ON public.attendance_records
    FOR ALL USING (school_id = public.get_auth_school_id() OR public.is_super_admin())
    WITH CHECK (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "student_view_own_attendance" ON public.attendance_records
    FOR SELECT USING (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())));

CREATE POLICY "school_admin_manage_invoices" ON public.fee_invoices
    FOR ALL USING (school_id = public.get_auth_school_id() OR public.is_super_admin())
    WITH CHECK (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "student_view_own_invoices" ON public.fee_invoices
    FOR SELECT USING (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())));

CREATE POLICY "school_admin_manage_receipts" ON public.payment_receipts
    FOR ALL USING (school_id = public.get_auth_school_id() OR public.is_super_admin())
    WITH CHECK (school_id = public.get_auth_school_id() OR public.is_super_admin());

CREATE POLICY "student_view_own_receipts" ON public.payment_receipts
    FOR SELECT USING (student_id = (SELECT id FROM public.students WHERE profile_id = (SELECT id FROM public.profiles WHERE auth_id = auth.uid())));
