# Security & Compliance Specification
## InnovatMind School OS

**Version:** 1.0.0  
**Compliance Standards:** Multi-Tenant Isolation, Child Privacy (COPPA/FERPA alignment), Append-Only Financial Integrity  

---

## 1. Security Architecture Principles

1. **Zero-Trust Client Identity:** The client cannot dictate permissions or pass tenant IDs in mutating payloads without server-side JWT verification.
2. **Database-Enforced Row Level Security (RLS):** All data access paths are constrained by PostgreSQL RLS.
3. **Child & Student Privacy By Design:** Minor personal data (PII) is strictly guarded and never exposed to unauthenticated or unauthorized users.
4. **Append-Only Financial & Audit Ledgers:** Financial transactions, fee modifications, and grade revisions cannot be deleted without audit logs.
5. **Sandboxed Code Execution:** Code written by students in coding labs must never execute with system privileges on main application servers.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Resource / Capability | SUPER_ADMIN | SCHOOL_ADMIN | TEACHER | TRAINER | STUDENT | PARENT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **All Schools & Tenant Setup** | **CRUD** | — | — | — | — | — |
| **Dynamic Pricing Rules** | **CRUD** | Read | — | — | — | — |
| **Global Course Catalog** | **CRUD** | Read | Read | Read | Read (Enrolled) | — |
| **School Students & Admissions** | Read | **CRUD** | Read/Update | Read | Read (Self) | Read (Child) |
| **Fee Structures & Invoices** | Read | **CRUD** | — | — | — | Read (Child) |
| **Fee Payments & Receipts** | Read | **CRUD** | — | — | — | Create/Read |
| **Staff & Payroll Records** | — | **CRUD** | Read (Self) | — | — | — |
| **Class Timetable & Attendance** | — | **CRUD** | **CRUD** | Read | Read (Self) | Read (Child) |
| **Gamified Learning & Labs** | Read | Read | Read | Read | **Active** | Read (Progress) |
| **Immutable Audit Logs** | **Read** | **Read** | — | — | — | — |

---

## 3. Student Data & Minor Privacy Protections

* **Anonymized Leaderboards:** Public or cross-school leaderboards display only avatars and first names with initial (e.g. `Aarav S.`), never full names, emails, phone numbers, or admission numbers.
* **Controlled AI Interactions:** AI tutor prompts and completions are monitored for safety. The system prevents ingestion of PII into external model training sets.
* **Parental Access Verification:** Parents can only link to student profiles through explicit school-verified verification tokens or administrative registration.

---

## 4. Code Sandbox Security Model

1. **Block Coding & Web Labs:** Execute inside a sandboxed `<iframe>` with attributes:
   `sandbox="allow-scripts"` (strictly prohibiting `allow-same-origin`, `allow-top-navigation`, or `allow-popups`).
2. **Python & Server-Side Execution:** Executes in ephemeral, isolated serverless container runtimes with:
   * CPU ceiling: 0.5 vCPU
   * Memory limit: 128MB
   * Execution timeout: 5,000 ms
   * Blocked network egress (isolated from internal VPC/database network).

---

## 5. Audit Logging Architecture

Every sensitive state transition generates an audit entry:
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'FEE_WAIVER_APPLIED', 'MARKS_UPDATED'
    entity_table VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```
Audit logs cannot be updated or deleted via normal application channels.
