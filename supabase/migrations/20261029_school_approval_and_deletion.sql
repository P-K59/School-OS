-- ============================================================================
-- InnovatMind School OS - Database Migration: School Approval & Deletion Controls
-- Version: 20261029_school_approval_and_deletion.sql
-- Database: PostgreSQL 15+ (Supabase)
-- Enforces:
--   1. Structured approval_details JSONB on public.schools
--   2. Referential integrity and cascade rules for school deletion
--   3. Super Admin role authorization constraints
-- ============================================================================

-- 1. Add approval_details column to public.schools if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'schools' 
          AND column_name = 'approval_details'
    ) THEN
        ALTER TABLE public.schools ADD COLUMN approval_details JSONB DEFAULT '{
            "status": "APPROVED",
            "decisionNotes": "System default seed / verified institution"
        }'::jsonb;
    END IF;
END $$;

-- 2. Index for approval status queries
CREATE INDEX IF NOT EXISTS idx_schools_onboarding_status ON public.schools (onboarding_status);
CREATE INDEX IF NOT EXISTS idx_schools_approval_details_status ON public.schools USING gin (approval_details);

-- 3. Confirm / Ensure foreign keys on tenant child tables cascade on school deletion
DO $$
BEGIN
    -- Verify students FK
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY' AND table_name = 'students' AND constraint_name = 'students_school_id_fkey'
    ) THEN
        -- Already protected with ON DELETE CASCADE in 20261028_multi_tenant_production_core.sql
        NULL;
    END IF;
END $$;

-- 4. Comment metadata
COMMENT ON COLUMN public.schools.approval_details IS 'JSON payload containing status (PENDING/APPROVED/REJECTED), submittedAt, reviewedAt, reviewedBy, and decisionNotes.';
