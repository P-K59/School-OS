-- ============================================================================
-- InnovatMind School OS - Database Migration: Unique School Registration ID
-- Version: 20261029_add_school_registration_id.sql
-- Database: PostgreSQL 15+ (Supabase)
-- Enforces: Unique stable database-backed registration identifier (IMS-YYYY-XXXXXX)
-- ============================================================================

-- 1. Create a dedicated sequence for school registration numbering
CREATE SEQUENCE IF NOT EXISTS school_registration_seq
    START WITH 101
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- 2. Add registration_id column to public.schools if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'schools' 
          AND column_name = 'registration_id'
    ) THEN
        ALTER TABLE public.schools ADD COLUMN registration_id VARCHAR(50);
    END IF;
END $$;

-- 3. Function to format Registration ID as IMS-<CURRENT_YEAR>-<6_DIGIT_PAD>
CREATE OR REPLACE FUNCTION generate_school_registration_id()
RETURNS TRIGGER AS $$
DECLARE
    current_yr TEXT;
    seq_val BIGINT;
BEGIN
    IF NEW.registration_id IS NULL OR NEW.registration_id = '' THEN
        current_yr := TO_CHAR(CURRENT_DATE, 'YYYY');
        seq_val := NEXTVAL('school_registration_seq');
        NEW.registration_id := 'IMS-' || current_yr || '-' || LPAD(seq_val::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger before insert on public.schools
DROP TRIGGER IF EXISTS trg_school_registration_id ON public.schools;
CREATE TRIGGER trg_school_registration_id
BEFORE INSERT ON public.schools
FOR EACH ROW
EXECUTE FUNCTION generate_school_registration_id();

-- 5. Backfill existing records if any have NULL registration_id
UPDATE public.schools
SET registration_id = 'IMS-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(NEXTVAL('school_registration_seq')::TEXT, 6, '0')
WHERE registration_id IS NULL;

-- 6. Add UNIQUE constraint and index
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_schools_registration_id'
    ) THEN
        ALTER TABLE public.schools 
        ADD CONSTRAINT uq_schools_registration_id UNIQUE (registration_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_schools_registration_id ON public.schools (registration_id);

COMMENT ON COLUMN public.schools.registration_id IS 'Unique immutable registration identifier generated on creation (e.g. IMS-2026-000101)';
