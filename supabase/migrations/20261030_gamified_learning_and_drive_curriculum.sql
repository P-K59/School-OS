-- ============================================================================
-- InnovatMind School OS — Database Migration: Gamified 30-Lecture Learning Platform
-- Version: 20261030_gamified_learning_and_drive_curriculum.sql
-- Enforces: Grade-wise 30-lecture curriculum, Google Drive streaming references,
--           interactive quizzes, educational game states, and RLS student journey isolation.
-- ============================================================================

-- 1. Curriculum Lectures Table (30 Lectures per Course)
CREATE TABLE IF NOT EXISTS public.curriculum_lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lecture_number INTEGER NOT NULL CHECK (lecture_number BETWEEN 1 AND 30),
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    module_name VARCHAR(150) NOT NULL DEFAULT 'Unit 1: The Magic of Computers',
    topic VARCHAR(150) NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 6,
    estimated_duration_minutes INTEGER NOT NULL DEFAULT 25,
    video_provider VARCHAR(50) NOT NULL DEFAULT 'GOOGLE_DRIVE',
    video_ref TEXT NOT NULL,
    video_metadata JSONB DEFAULT '{}'::jsonb,
    video_completion_threshold_percent INTEGER NOT NULL DEFAULT 80,
    quiz_definition JSONB DEFAULT '{}'::jsonb,
    game_definition JSONB DEFAULT '{}'::jsonb,
    release_schedule JSONB DEFAULT '{"type":"DAILY","dayOffset":1,"customTime":"09:00"}'::jsonb,
    unlock_policy VARCHAR(50) NOT NULL DEFAULT 'HYBRID_SCHEDULE_AND_COMPLETION',
    status VARCHAR(20) NOT NULL DEFAULT 'READY',
    xp_reward INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_course_lecture_number UNIQUE (course_id, lecture_number)
);

-- Index for rapid lookup by course and order
CREATE INDEX IF NOT EXISTS idx_curriculum_lectures_course_order 
ON public.curriculum_lectures(course_id, lecture_number);

-- 2. Student Lecture Journey States (Telemetry & Unlocking)
CREATE TABLE IF NOT EXISTS public.student_lecture_journey_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lecture_id UUID REFERENCES public.curriculum_lectures(id) ON DELETE CASCADE,
    lecture_number INTEGER NOT NULL CHECK (lecture_number BETWEEN 1 AND 30),
    is_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlock_reason TEXT,
    video_watched_seconds INTEGER NOT NULL DEFAULT 0,
    video_watch_percentage INTEGER NOT NULL DEFAULT 0,
    video_completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_completed BOOLEAN NOT NULL DEFAULT FALSE,
    quiz_score NUMERIC(5, 2),
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    game_unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    game_completed BOOLEAN NOT NULL DEFAULT FALSE,
    game_score NUMERIC(5, 2),
    xp_awarded BOOLEAN NOT NULL DEFAULT FALSE,
    journey_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_student_lecture_journey UNIQUE (student_id, course_id, lecture_number)
);

-- Index for rapid lookup of active student journey
CREATE INDEX IF NOT EXISTS idx_student_lecture_journey_lookup 
ON public.student_lecture_journey_states(student_id, course_id, lecture_number);

-- 3. Row-Level Security (RLS) Policies
ALTER TABLE public.curriculum_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lecture_journey_states ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full Management Access
CREATE POLICY super_admin_manage_curriculum_lectures ON public.curriculum_lectures
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.auth_id = auth.uid() 
            AND profiles.role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY super_admin_manage_journey_states ON public.student_lecture_journey_states
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.auth_id = auth.uid() 
            AND profiles.role = 'SUPER_ADMIN'
        )
    );

-- School Admin: View Course Lectures & Student Progress for their school
CREATE POLICY school_admin_view_course_lectures ON public.curriculum_lectures
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.school_course_assignments sca
            JOIN public.profiles p ON p.school_id = sca.school_id
            WHERE sca.course_id = curriculum_lectures.course_id
            AND p.auth_id = auth.uid()
            AND p.role IN ('SCHOOL_ADMIN', 'TEACHER')
        )
    );

CREATE POLICY school_admin_view_student_journey ON public.student_lecture_journey_states
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            JOIN public.profiles p ON p.school_id = s.school_id
            WHERE s.id = student_lecture_journey_states.student_id
            AND p.auth_id = auth.uid()
            AND p.role IN ('SCHOOL_ADMIN', 'TEACHER')
        )
    );

-- Students: Only SELECT and UPDATE their own learning journey states
CREATE POLICY student_manage_own_journey ON public.student_lecture_journey_states
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = student_lecture_journey_states.student_id
            AND s.profile_id = auth.uid()
        )
    );
