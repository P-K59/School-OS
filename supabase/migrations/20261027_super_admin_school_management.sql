-- ============================================================================
-- InnovatMind School OS - Database Migration
-- Feature: Super Admin -> School Management, Central Course Pricing,
-- Course Assignment & Trainer Allocation
-- Database: PostgreSQL 15+ (Supabase)
-- ============================================================================

-- 1. Extend schools table with Onboarding and Contract Lifecycle
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS region VARCHAR(100),
ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS contact_person_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS contact_person_email VARCHAR(150),
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(50) DEFAULT 'ACTIVE' 
    CHECK (onboarding_status IN ('ENQUIRY', 'IN_DISCUSSION', 'DEMO_SCHEDULED', 'CONTRACT_STAGE', 'ONBOARDING', 'ACTIVE', 'SUSPENDED')),
ADD COLUMN IF NOT EXISTS academic_session VARCHAR(50) DEFAULT '2026-2027',
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Central Pricing Rules Table
-- Hierarchy Precedence: Default Price -> Region -> State -> City -> School Type -> Grade -> Course -> School Override
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    course_title VARCHAR(200) NOT NULL,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('GLOBAL_DEFAULT', 'REGION', 'STATE', 'CITY', 'SCHOOL_TYPE', 'GRADE', 'COURSE')),
    scope_value VARCHAR(150), -- e.g., 'Maharashtra', 'CBSE', 'Class 8'
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    grade_range VARCHAR(100),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT' CHECK (billing_basis IN ('PER_STUDENT', 'PER_BATCH', 'PER_TERM', 'ANNUAL_FLAT')),
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    discount_percent NUMERIC(5, 2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_pricing_rules_lookup 
ON pricing_rules(course_id, scope, scope_value, academic_session, is_active);

-- 3. School-Specific Pricing Overrides Table
CREATE TABLE IF NOT EXISTS school_pricing_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    custom_price NUMERIC(12, 2) NOT NULL CHECK (custom_price >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT' CHECK (billing_basis IN ('PER_STUDENT', 'PER_BATCH', 'PER_TERM', 'ANNUAL_FLAT')),
    effective_start_date DATE NOT NULL,
    effective_end_date DATE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_course_override UNIQUE(school_id, course_id, academic_session)
);

CREATE INDEX IF NOT EXISTS idx_school_pricing_override 
ON school_pricing_overrides(school_id, course_id, academic_session, status);

-- 4. School Course Assignments Table
CREATE TABLE IF NOT EXISTS school_course_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    eligible_grades TEXT[] NOT NULL,
    eligible_sections TEXT[],
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100 CHECK (capacity > 0),
    pricing_rule_id UUID REFERENCES pricing_rules(id),
    applied_price_per_unit NUMERIC(12, 2) NOT NULL CHECK (applied_price_per_unit >= 0),
    billing_basis VARCHAR(50) NOT NULL DEFAULT 'PER_STUDENT',
    assigned_trainer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'UPCOMING')),
    enrolled_students_count INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_active_school_course UNIQUE(school_id, course_id, academic_session)
);

CREATE INDEX IF NOT EXISTS idx_assignments_school_course 
ON school_course_assignments(school_id, course_id, status);

-- 5. InnovatMind Trainers Directory Table
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    avatar_url TEXT,
    specialization VARCHAR(100) NOT NULL CHECK (specialization IN ('Robotics', 'AI & ML', 'Coding', 'STEM & Projects', 'Computer Basics', 'IoT & Electronics')),
    experience_years INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'ASSIGNED', 'INACTIVE')),
    max_workload_hours INTEGER NOT NULL DEFAULT 40,
    current_workload_hours INTEGER NOT NULL DEFAULT 0,
    total_students_mentored INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 5.0,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Trainer Allocations Table
CREATE TABLE IF NOT EXISTS trainer_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assigned_grades TEXT[] NOT NULL,
    academic_session VARCHAR(50) NOT NULL DEFAULT '2026-2027',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    workload_hours_per_week INTEGER NOT NULL CHECK (workload_hours_per_week > 0),
    allocated_days TEXT[] NOT NULL,
    time_slot VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainer_allocations_lookup 
ON trainer_allocations(trainer_id, school_id, status);

-- 7. Row Level Security (RLS) Policies
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_pricing_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_allocations ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full Access across all entities
CREATE POLICY super_admin_all_pricing_rules ON pricing_rules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN')
    );

CREATE POLICY super_admin_all_overrides ON school_pricing_overrides
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN')
    );

CREATE POLICY super_admin_all_assignments ON school_course_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN')
    );

CREATE POLICY super_admin_all_trainers ON trainers
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN')
    );

CREATE POLICY super_admin_all_trainer_allocations ON trainer_allocations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'SUPER_ADMIN')
    );

-- School Admin: Read-only access to their own school assignments and pricing overrides
CREATE POLICY school_admin_read_own_assignments ON school_course_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'SCHOOL_ADMIN' 
            AND profiles.school_id = school_course_assignments.school_id
        )
    );

CREATE POLICY school_admin_read_own_overrides ON school_pricing_overrides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'SCHOOL_ADMIN' 
            AND profiles.school_id = school_pricing_overrides.school_id
        )
    );

CREATE POLICY school_admin_read_own_trainer_allocations ON trainer_allocations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'SCHOOL_ADMIN' 
            AND profiles.school_id = trainer_allocations.school_id
        )
    );
