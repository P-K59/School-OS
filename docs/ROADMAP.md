# Product Development Roadmap
## InnovatMind School OS

**Version:** 1.0.0  
**Methodology:** Incremental Vertical Slices  

---

## 1. Roadmap Overview & Phased Milestones

```text
Phase 0: Specifications, Architecture, Database & Security Design   [COMPLETED]
   │
   ▼
Phase 1 (Sprint 1): Foundational Core                               [ACTIVE TARGET]
   - Next.js 14+ App Router, TypeScript (Strict), Tailwind + shadcn/ui
   - Multi-tenant Organization & School Domain Model
   - Multi-Role Authentication & Session Layer (Supabase Auth & Profiles)
   - Central Admin & School Admin Dashboard Command Shells
   - Student, Grade & Section Management Foundations
   - Database Migrations & RLS Policies
   - Seed & Demo Data Harness
   │
   ▼
Phase 2: Admissions & Student CRM Lifecycle
   - Enquiry Pipeline, Verification & Approvals
   - Bulk CSV Student / Staff Import Engine
   - Student Digital ID & Guardian Linking
   │
   ▼
Phase 3: Staff Management & Deterministic Payroll
   - Staff Directory, Designation & Attendance
   - Formula-based Salary Engine & Versioned Slips
   - Staff Leave Management & Approvals
   │
   ▼
Phase 4: Fee & Finance Management
   - Fee Categories, Grade-wise Structures & Installments
   - Multi-channel Invoicing & Digital Receipt Generation
   - School Expense Tracking & Monthly Financial Reports
   │
   ▼
Phase 5: Academic Management, Timetable & Exams
   - Sessions, Subjects, Conflict-Free Visual Timetable Engine
   - Examination Scheduling, Grading & Report Cards
   │
   ▼
Phase 6: Communication Center & Parent Portal
   - Targeted Circulars (School, Grade, Section, Role)
   - Parent View: Child Attendance, Fees & Performance
   │
   ▼
Phase 7: Central Course CMS & Hierarchical Pricing Engine
   - Course, Module, Lesson, Quiz & Challenge Builder
   - Cascading Regional/School Pricing Override Calculator
   │
   ▼
Phase 8: Gamified Student Learning Portal
   - Futuristic Student Learning World & Quests
   - XP, Leveling Trees, Badges, Coins & Streaks
   │
   ▼
Phase 9: Coding Lab & Virtual Robotics Lab (Grade 6–8 Pilot)
   - Sandboxed Block Coding & Python Runner
   - Virtual 2D Robotics Simulation Environment
   │
   ▼
Phase 10: Socratic AI Learning Layer & Production Hardening
   - Multi-tier Socratic Hint Engine
   - Automated Code Review & Concept Explanations
   - E2E Testing, Security Audits & Pilot School Rollout
```

---

## 2. Sprint 1 Deliverables & Acceptance Criteria

### Scope
1. **Next.js Foundation:** App router architecture with designated role layout wrappers (`/admin`, `/school`, `/teacher`, `/trainer`, `/student`, `/parent`).
2. **Design System & Theme Engine:** Dark/light modern aesthetic using Tailwind CSS and Radix/shadcn primitives with high-density command center styling.
3. **Multi-Tenant Database & Migration Suite:** Complete initial PostgreSQL DDL migrations with strict Row Level Security (RLS) policies.
4. **Multi-Role Authentication & Mock/Live Auth Handlers:** Profiles, role assignment, active tenant switching, and server-side route guards.
5. **School Admin Command Center Shell:** Key KPI metric widgets (Total Students, Attendance %, Fee Collection, Active Courses).
6. **Central Admin Command Center Shell:** Multi-school directory, tenant provisioning modal, and system health status.
7. **Student Management MVP:** Grade/section listings, student table, add student modal with validation, and responsive profile preview.
8. **Seed Data:** Realistic sample dataset (InnovatMind Demo Org, Demo School A & B, Demo Admin, Teachers, Students).
9. **Automated Verification:** Unit tests for business utilities and lint/typecheck passing.
