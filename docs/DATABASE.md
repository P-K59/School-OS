# Database Architecture & Schema Specification
## InnovatMind School OS

**Database Engine:** PostgreSQL 15+ (Supabase)  
**Security Model:** Mandatory Row Level Security (RLS) with Multi-Tenant Isolation  

---

## 1. Schema Design Principles

1. **Mandatory Tenant Foreign Keys:** Every school-scoped table must include `school_id UUID REFERENCES schools(id) ON DELETE CASCADE`.
2. **Deterministic Financial Precision:** All monetary amounts are defined as `NUMERIC(12, 2)` (never `FLOAT` or `REAL`).
3. **Audit Logging & Soft Deletes:** Critical business records (students, fees, transactions, payroll) feature audit timestamps (`created_at`, `updated_at`, `created_by`, `deleted_at`).
4. **Row Level Security (RLS) Everywhere:** No public read or write access on any table by default. Explicit policies regulate access per user role.

---

## 2. Core Enums & Types

```sql
-- Role Hierarchy
CREATE TYPE user_role AS ENUM (
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'INNOVATMIND_TRAINER',
    'STUDENT',
    'PARENT'
);

-- Admission & Student Lifecycle
CREATE TYPE student_status AS ENUM (
    'ENQUIRY',
    'APPLIED',
    'VERIFIED',
    'APPROVED',
    'ACTIVE',
    'SUSPENDED',
    'TRANSFERRED',
    'ALUMNI'
);

-- Gender
CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- Fee & Payment Types
CREATE TYPE fee_frequency AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE payment_method AS ENUM ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'ONLINE_GATEWAY');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- Attendance Status
CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'EXCUSED_LEAVE');

-- Staff Leave Status
CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
```

---

## 3. Core Relational Entities

### 3.1 Organization & School Model
```sql
-- Multi-Tenant Schools Directory
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'SCH-DELHI-001'
    name VARCHAR(255) NOT NULL,
    school_type VARCHAR(50) NOT NULL, -- 'CBSE', 'ICSE', 'STATE', 'IB', etc.
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20) NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Profiles (Linked to Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL, -- Null for SUPER_ADMIN
    role user_role NOT NULL DEFAULT 'STUDENT',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.2 Academic Structure & Students
```sql
-- Academic Years / Sessions
CREATE TABLE academic_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- '2025-2026'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Grades / Classes
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'Grade 6'
    numeric_level INTEGER NOT NULL, -- 6
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Sections
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- 'A', 'B', 'Rose'
    class_teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Students Profile & Lifecycle
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    admission_number VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50),
    grade_id UUID NOT NULL REFERENCES grades(id),
    section_id UUID NOT NULL REFERENCES sections(id),
    session_id UUID NOT NULL REFERENCES academic_sessions(id),
    dob DATE NOT NULL,
    gender gender_type NOT NULL,
    blood_group VARCHAR(10),
    address TEXT NOT NULL,
    status student_status DEFAULT 'ACTIVE',
    parent_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_school_admission UNIQUE(school_id, admission_number)
);
```

### 3.3 Fees & Financial Ledger
```sql
-- Fee Categories
CREATE TABLE fee_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- 'Tuition Fee', 'Robotics & STEM Lab Fee'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Fee Structures
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES academic_sessions(id) ON DELETE CASCADE,
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES fee_categories(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    frequency fee_frequency NOT NULL,
    due_day_of_month INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices / Fee Demands
CREATE TABLE student_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    total_amount NUMERIC(12, 2) NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status payment_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments / Transaction Ledger (Append-Only)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES student_invoices(id) ON DELETE CASCADE,
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_method payment_method NOT NULL,
    transaction_reference VARCHAR(255),
    payment_date TIMESTAMPTZ DEFAULT now(),
    received_by UUID NOT NULL REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Gamification & Course System
```sql
-- Courses Directory
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Coding', 'Robotics', 'AI', 'Digital Literacy'
    min_grade INTEGER NOT NULL,
    max_grade INTEGER NOT NULL,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Student Gamification Progress
CREATE TABLE student_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    current_xp INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    coins INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 4. Row Level Security (RLS) Policy Specifications

```sql
-- Enable RLS on all core tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user's school_id and role from JWT/profile
CREATE OR REPLACE FUNCTION get_auth_role() RETURNS user_role AS $$
    SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_auth_school_id() RETURNS UUID AS $$
    SELECT school_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Schools Policy: SUPER_ADMIN sees all; School admins/teachers/students see their own
CREATE POLICY "Super admins view all schools"
ON schools FOR ALL
USING (get_auth_role() = 'SUPER_ADMIN');

CREATE POLICY "School users view own school"
ON schools FOR SELECT
USING (id = get_auth_school_id());

-- 2. Students Policy
CREATE POLICY "Super admins view all students"
ON students FOR ALL
USING (get_auth_role() = 'SUPER_ADMIN');

CREATE POLICY "School staff manage own school students"
ON students FOR ALL
USING (school_id = get_auth_school_id() AND get_auth_role() IN ('SCHOOL_ADMIN', 'TEACHER'));

CREATE POLICY "Students view own profile"
ON students FOR SELECT
USING (profile_id = auth.uid());

CREATE POLICY "Parents view linked children"
ON students FOR SELECT
USING (parent_profile_id = auth.uid());
```
