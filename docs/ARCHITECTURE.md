# System Architecture Document
## InnovatMind School OS

**Version:** 1.0.0  
**Architectural Pattern:** Multi-Tenant Modular Monolith with Edge Serverless Layer  

---

## 1. Architectural Overview

InnovatMind School OS is designed as a unified Next.js (App Router) web application backed by PostgreSQL (Supabase) with strict Row Level Security (RLS). This eliminates operational overhead and deployment complexity while guaranteeing strict tenant data isolation.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Client Layer                                    │
│  Next.js 14+ App Router, React 18+, TypeScript (Strict), Tailwind CSS,     │
│  shadcn/ui Design System, Framer Motion Micro-Animations                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Application & API Layer                           │
│  - Route Groups: /(public), /(auth), /admin, /school, /teacher, /trainer,   │
│                  /student, /parent                                          │
│  - Server Actions & API Route Handlers (Server-Side Authorization & RLS)    │
│  - Modular Lib Engines: Pricing, Gamification, Payroll, AI Hints            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
┌──────────────────────────────────────────┐    ┌─────────────────────────────┐
│           PostgreSQL (Supabase)          │    │    External / Lab Services  │
│  - Strict Multi-Tenant Schema with RLS   │    │  - Isolated Code Sandbox    │
│  - Immutable Audit & Financial Ledgers   │    │  - Socratic AI Engine (LLM) │
│  - Auth & Role JWT Claims                │    │  - Storage (S3 / Supabase)  │
└──────────────────────────────────────────┘    └─────────────────────────────┘
```

---

## 2. Directory & Repository Structure

```text
school-os/
├── app/
│   ├── (public)/                     # Landing, marketing, public inquiry
│   │   ├── page.tsx
│   │   └── contact/
│   ├── (auth)/                       # Central authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── admin/                        # InnovatMind Super Admin command center
│   │   ├── page.tsx
│   │   ├── schools/
│   │   ├── courses/
│   │   ├── pricing/
│   │   └── analytics/
│   ├── school/                       # School Admin ERP & CRM dashboard
│   │   ├── page.tsx
│   │   ├── admissions/
│   │   ├── students/
│   │   ├── staff/
│   │   ├── fees/
│   │   ├── payroll/
│   │   ├── academic/
│   │   └── communications/
│   ├── teacher/                      # Teacher classroom & grading portal
│   │   ├── page.tsx
│   │   ├── attendance/
│   │   ├── assignments/
│   │   └── gradebook/
│   ├── trainer/                      # InnovatMind STEM Trainer portal
│   │   ├── page.tsx
│   │   ├── sessions/
│   │   └── lab-assessments/
│   ├── student/                      # Futuristic gamified student learning world
│   │   ├── page.tsx
│   │   ├── world/
│   │   ├── courses/
│   │   ├── lab/coding/
│   │   ├── lab/robotics/
│   │   └── achievements/
│   └── parent/                       # Parent portal (linked children only)
│       ├── page.tsx
│       ├── attendance/
│       ├── fees/
│       └── reports/
├── components/
│   ├── ui/                           # Base shadcn/ui atoms (Button, Dialog, etc.)
│   ├── layout/                       # Role-specific sidebars, navbars, shells
│   ├── shared/                       # Cross-cutting components (DataTable, FilterBar)
│   ├── admin/                        # Super admin management widgets
│   ├── school/                       # ERP/CRM domain components (FeeCollector, TimetableGrid)
│   ├── learning/                     # Course player, quiz runner, lesson viewer
│   ├── coding/                       # Block / Python editor sandboxes
│   └── gamification/                 # XP counter, Streak badge, Level-up modal
├── lib/
│   ├── supabase/                     # Client, server, and admin Supabase bindings
│   ├── auth/                         # RBAC session validation & permissions
│   ├── pricing/                      # Hierarchical pricing calculation engine
│   ├── payroll/                      # Deterministic salary calculation logic
│   ├── gamification/                 # XP, streak, badge awarding engine
│   └── ai/                           # Socratic hint generator & guardrails
├── supabase/
│   ├── migrations/                   # Sequential SQL migrations with RLS
│   └── seed/                         # Multi-tenant demo seed data
├── docs/                             # Architecture, PRD, DB, Security docs
└── tests/                            # E2E (Playwright), Unit (Vitest/Jest)
```

---

## 3. Core Architectural Subsystems

### 3.1 Hierarchical Dynamic Pricing Engine
```text
┌─────────────────────────┐
│     Default Course      │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│     Region / State      │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│          City           │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│       School Type       │ (e.g. Private, CBSE, ICSE, International)
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│      Grade / Course     │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ School Custom Override  │ (Explicit contract overrides)
└─────────────────────────┘
```
The pricing engine evaluates rules from general to specific. If a custom school contract rule exists, it takes precedence. All pricing computations are performed on the server side and logged for auditing.

### 3.2 Socratic AI Learning Subsystem
To prevent students from relying on AI for quick answers, the AI subsystem enforces a multi-step hint ladder:
1. **Hint Tier 1:** Identifies the conceptual misunderstanding without referencing the specific code.
2. **Hint Tier 2:** Guides the student toward relevant syntax or algorithmic concepts.
3. **Concept Explanation:** Explains the underlying theory with a generic, unrelated code snippet.
4. **Guided Walkthrough:** Step-by-step guidance. Direct complete solutions are withheld unless explicitly authorized by a teacher/trainer.

---

## 4. Architectural Decisions & Principles (ADRs)

* **ADR-001: PostgreSQL Row Level Security (RLS)** — Multi-tenancy is enforced directly at the database layer using `tenant_id` / `school_id` foreign keys and PostgreSQL RLS policies tied to JWT auth metadata.
* **ADR-002: Role-Based Route Encapsulation** — Next.js Route Groups cleanly segregate UI code for `/admin`, `/school`, `/teacher`, `/trainer`, `/student`, and `/parent` while reusing atomic components.
* **ADR-003: Deterministic Financial Arithmetic** — All currency fields use standard numeric types (`NUMERIC(12, 2)`). Calculations are pure server functions with regression unit test suites.
* **ADR-004: Safe Student Code Execution** — Client-side web/block code executes in isolated iframe sandboxes with restricted permissions, while backend Python execution runs in isolated serverless containers.
