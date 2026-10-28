# Product Requirements Document (PRD)
## InnovatMind School OS

**Product Name:** InnovatMind School OS  
**Organization:** InnovatMind  
**Document Version:** 1.0.0  
**Target Category:** Multi-Tenant School ERP + CRM + EdTech + Gamified STEM/Robotics/AI Learning Platform  

---

## 1. Executive Summary

InnovatMind School OS is an integrated education ecosystem designed to solve two fundamental challenges:
1. **School Operational Friction:** Provides K-12 educational institutions with an institutional-grade, free/low-friction School ERP and CRM for admissions, fee collection, staff payroll, attendance, timetables, and academic reporting.
2. **STEM & Future-Tech Education Distribution:** Serves as the primary learning and distribution platform for InnovatMind's Grade 1–12 Computer Science, Coding, Robotics, Artificial Intelligence, and IoT curriculum.

The platform eliminates the need for schools to juggle disconnected ERP software and third-party EdTech tools by unifying administrative workflows and futuristic student learning within a single, secure, multi-tenant cloud application.

---

## 2. Target Personas & Core User Journeys

### 2.1 Personas
1. **Super Admin (InnovatMind Central Team):** Manages school onboarding, trainer assignments, dynamic hierarchical pricing rules, central course catalog publishing, platform health, and global analytics.
2. **School Admin (Principal / School Director / Registrar):** Oversees admissions, student records, fee collection & receipts, staff records, attendance, deterministic payroll calculations, timetables, and parent circulars.
3. **Teacher / Academic Staff:** Manages assigned classroom sections, records attendance, grades exams/assignments, monitors student academic progress, and issues report cards.
4. **InnovatMind STEM Trainer:** Deploys hands-on coding and robotics sessions across partner schools, tracks batch progress, and provides project guidance.
5. **Student (Grades 1–12):** Engages with a gamified learning portal, solves block/Python coding challenges, experiments in virtual robotics labs, interacts with the Socratic AI tutor, and earns XP, badges, and streaks.
6. **Parent / Guardian:** Monitors their linked children’s attendance, pays school fees digitally, views fee receipts, tracks academic performance, and receives school notices.

---

## 3. Product Scope & Functional Modules

### 3.1 Module Matrix

| Module | Core Functionality | Primary Roles |
| :--- | :--- | :--- |
| **Authentication & RBAC** | Secure multi-tenant login, session handling, role enforcement | All |
| **Tenant & School Management** | Multi-school lifecycle, branch config, feature flags | Super Admin, School Admin |
| **Admissions & Student CRM** | Lead enquiry pipeline, document verification, roll assignment | School Admin |
| **Fee & Finance Engine** | Non-floating point fee ledger, installment plans, digital receipts | School Admin, Parent |
| **Staff & Deterministic Payroll** | Employee directory, attendance, formula-driven payroll calculation | School Admin, Teacher |
| **Academic & Timetable Engine** | Sessions, grades, conflict-free timetable matrix, exam reporting | School Admin, Teacher |
| **Communication Center** | Targeted notices, SMS/WhatsApp ready circulars, audit records | School Admin, Teacher, Parent |
| **Central Course CMS** | Modular curriculum (Modules, Lessons, Quizzes, Challenges, Projects) | Super Admin, Trainer |
| **Gamified Student Learning** | Learning world, quests, XP, badges, streaks, levels, leaderboards | Student, Teacher, Trainer |
| **Coding & Robotics Labs** | Sandboxed visual block & Python coding runner, robotics simulation | Student, Trainer |
| **Socratic AI Learning Layer** | Multi-tier progressive hint engine, automated feedback, analytics | Student, Teacher, Super Admin |
| **Centralized Pricing Engine** | Hierarchical pricing cascading down to school-specific overrides | Super Admin |
| **Audit & Security Logging** | Immutable, append-only logs for all sensitive system state changes | Super Admin, School Admin |

---

## 4. Non-Functional Requirements

### 4.1 Security & Multi-Tenancy
* **Data Isolation:** Complete row-level security (PostgreSQL RLS) ensuring no tenant can access another school's data.
* **Minor Privacy:** Compliance with international child data privacy best practices (COPPA/FERPA alignment); no public exposure of student PII.
* **Sandbox Execution:** Student code execution isolated from backend host servers.
* **Financial Precision:** Strict use of SQL `NUMERIC(12, 2)` for monetary values to eliminate IEEE 754 floating-point rounding errors.

### 4.2 Performance & Usability
* **Lighthouse Target:** $\ge 90$ performance score on standard school lab network conditions.
* **Responsive Breakpoints:** Optimized for Desktop (Admin/Labs), Laptop (Teachers/Trainers), Tablet & Mobile (Parents/Students).
* **UI/UX Standard:** Linear/Apple-inspired minimalist command center for institutional users; futuristic, interactive visual aesthetic for students.

---

## 5. Success Metrics & KPIs
* **Admin Efficiency:** $\ge 50\%$ reduction in manual fee reconciliation and report generation time.
* **Student Retention:** $\ge 70\%$ weekly active learner return rate on coding/robotics modules.
* **Zero Data Leakage:** $100\%$ tenant isolation verified across all Supabase RLS policies.
