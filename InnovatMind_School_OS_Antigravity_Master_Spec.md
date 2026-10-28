# InnovatMind School OS --- Antigravity Coding Agent Master Specification

## 1. Project Identity

**Company:** InnovatMind\
**Product:** InnovatMind School OS\
**Product Type:** Multi-tenant School ERP + CRM + EdTech + Student
Learning Platform\
**Primary Audience:** Schools, school administrators, teachers,
students, parents, and InnovatMind central operations team.

### Core Vision

InnovatMind School OS is a modern school operating platform that
provides schools with a powerful management system at no initial CRM
software cost while integrating InnovatMind's Computer, Coding, AI,
Robotics, and future-technology education programs.

The platform must combine:

1.  School administration
2.  Student and admission management
3.  Fees and finance management
4.  Staff and payroll management
5.  Academic management
6.  Parent communication
7.  Course/content management
8.  Student learning portal
9.  Coding and robotics learning
10. Gamification
11. AI-powered learning
12. Central InnovatMind operations
13. School-specific course pricing
14. Analytics and reporting

The product should feel like a premium, futuristic technology platform
rather than a traditional school ERP.

------------------------------------------------------------------------

# 2. Product Philosophy

## North Star

> Make school management simpler for schools and make technology
> education exciting enough that students voluntarily return to learn,
> build, code, and create.

The platform must not optimize merely for screen time.

Optimize for:

-   Learning engagement
-   Learning retention
-   Skill progression
-   Project completion
-   Curiosity
-   Practical creation
-   Student achievement

------------------------------------------------------------------------

# 3. Business Model

InnovatMind will use the School OS as a distribution platform.

### Free / low-friction school software

Schools receive access to core school-management functionality.

### InnovatMind services

InnovatMind can provide:

-   Computer education
-   Coding education
-   Robotics education
-   AI education
-   Teacher training
-   Robotics lab setup
-   Computer lab support
-   Hardware
-   Projects
-   Certifications
-   Technology workshops
-   Future technology programs

### Commercial pricing

Course/service pricing is centrally managed by InnovatMind.

Pricing may vary based on:

-   School
-   School type
-   City
-   State
-   Region
-   Grade
-   Course
-   Program
-   Student count
-   Contract
-   Custom commercial agreement

School administrators must not be able to modify InnovatMind's internal
pricing rules unless explicitly granted permission.

------------------------------------------------------------------------

# 4. Product Architecture

Use a multi-tenant architecture.

Conceptually:

``` text
InnovatMind Platform
│
├── Central Admin
│
├── School A
│   ├── Admin
│   ├── Teachers
│   ├── Students
│   └── Parents
│
├── School B
│   ├── Admin
│   ├── Teachers
│   ├── Students
│   └── Parents
│
└── School C
    ├── Admin
    ├── Teachers
    ├── Students
    └── Parents
```

Data belonging to one school must never be accessible to another school.

Use strong tenant isolation at the database and application layers.

------------------------------------------------------------------------

# 5. Recommended Technology Stack

Prefer the following unless a documented technical reason requires a
change.

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   shadcn/ui
-   Framer Motion

## Backend / Database

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Storage
-   Row Level Security

## Deployment

-   Vercel for web application
-   Supabase for backend/database/storage

## Engineering

-   TypeScript strict mode
-   ESLint
-   Prettier
-   Automated tests
-   Component tests
-   Integration tests
-   End-to-end browser tests

Do not introduce additional major dependencies without documenting why
they are needed.

------------------------------------------------------------------------

# 6. Application Structure

For the initial MVP, prefer one well-structured Next.js application with
role-based route groups rather than prematurely splitting into multiple
independent applications.

Suggested route structure:

``` text
/app
  /(public)
  /(auth)
  /admin
  /school
  /teacher
  /student
  /parent
```

As the platform grows, modules can be extracted if there is a genuine
architectural need.

------------------------------------------------------------------------

# 7. User Roles

Initial roles:

## SUPER_ADMIN

InnovatMind central team.

Can manage:

-   Schools
-   School activation
-   Courses
-   Content
-   Pricing
-   InnovatMind trainers
-   Course assignments
-   Analytics
-   Platform configuration
-   Support
-   Audit logs

## SCHOOL_ADMIN

Can manage their own school:

-   Students
-   Admissions
-   Teachers
-   Staff
-   Classes
-   Sections
-   Attendance
-   Fees
-   Expenses
-   Payroll where authorized
-   Academic operations
-   Timetable
-   Exams
-   Notices
-   Reports

## TEACHER

Can access assigned:

-   Classes
-   Students
-   Attendance
-   Assignments
-   Academic activities
-   Course activities
-   Student progress

## INNOVATMIND_TRAINER

Can access assigned:

-   Schools
-   Batches
-   Students
-   Courses
-   Sessions
-   Computer education
-   Coding
-   Robotics
-   Projects
-   Progress

## STUDENT

Can access:

-   Learning dashboard
-   Courses
-   Lessons
-   Coding
-   Robotics
-   AI learning
-   Quizzes
-   Challenges
-   Projects
-   XP
-   Levels
-   Badges
-   Streaks
-   Leaderboards
-   Profile

## PARENT

Can access only their linked children's permitted information:

-   Attendance
-   Fees
-   Receipts
-   Academic results
-   Timetable
-   Course progress
-   Announcements
-   Achievements

------------------------------------------------------------------------

# 8. Core CRM / School ERP Modules

## 8.1 Dashboard

School dashboard should show:

-   Total students
-   New admissions
-   Staff count
-   Attendance percentage
-   Fee collection
-   Pending fees
-   Salary payable
-   Expenses
-   Monthly financial overview
-   Academic performance
-   Learning engagement
-   Announcements
-   Upcoming events

------------------------------------------------------------------------

## 8.2 Student Management

Student profile:

-   Student ID
-   Admission number
-   Name
-   Date of birth
-   Gender
-   Photo
-   Grade
-   Section
-   Roll number
-   Academic session
-   Parent/guardian
-   Contact details
-   Address
-   Documents
-   Emergency information
-   Previous school
-   Transport details
-   House
-   Course enrollments

Student lifecycle:

``` text
Enquiry
  ↓
Application
  ↓
Document Verification
  ↓
Approval
  ↓
Admission
  ↓
Active Student
  ↓
Promotion / Transfer / Leaving
```

------------------------------------------------------------------------

# 9. Admission Management

Features:

-   Admission enquiry
-   Online application
-   Application tracking
-   Document collection
-   Document verification
-   Interview/test tracking
-   Admission approval
-   Admission fee
-   Student ID creation
-   Grade/section assignment
-   Parent account creation
-   Student portal account creation

------------------------------------------------------------------------

# 10. Fee Management

This is a core module.

## Fee categories

-   Admission fee
-   Tuition fee
-   Computer fee
-   Robotics fee
-   Coding fee
-   AI fee
-   Exam fee
-   Library fee
-   Laboratory fee
-   Transport fee
-   Activity fee
-   Annual fee
-   Other fees

## Fee structure

Support:

-   Grade-based fees
-   Section-based fees if required
-   Academic-session fees
-   Course fees
-   Installments
-   Discounts
-   Scholarships
-   Waivers
-   Late fees
-   Custom student-level adjustments

## Payments

Support recording:

-   Cash
-   UPI
-   Bank transfer
-   Cheque
-   Online payment
-   Other

Generate digital receipts.

## Fee status

``` text
Total
Paid
Pending
Overdue
```

## Notifications

Support future integration with:

-   Email
-   SMS
-   WhatsApp
-   Push notifications

Do not hard-code a communication provider.

------------------------------------------------------------------------

# 11. Expense Management

Track:

-   Electricity
-   Internet
-   Rent
-   Maintenance
-   Stationery
-   Computer equipment
-   Robotics equipment
-   Events
-   Transportation
-   Marketing
-   Utilities
-   Miscellaneous

Each expense should support:

-   Category
-   Amount
-   Date
-   Vendor
-   Payment method
-   Notes
-   Receipt/document
-   Created by
-   Approval status where required

------------------------------------------------------------------------

# 12. Staff Management

Staff categories:

-   Principal
-   Vice Principal
-   Teacher
-   Computer Teacher
-   Robotics Instructor
-   Accountant
-   Admin Staff
-   Receptionist
-   Librarian
-   Lab Assistant
-   Driver
-   Support Staff

Staff profile:

-   Employee ID
-   Name
-   Photo
-   Designation
-   Department
-   Joining date
-   Qualification
-   Contact
-   Address
-   Documents
-   Salary structure
-   Leave information
-   Attendance
-   Bank/payment information

Sensitive financial information must have restricted access.

------------------------------------------------------------------------

# 13. Payroll / Staff Salary Management

Support:

-   Monthly payroll
-   Basic salary
-   Allowances
-   Incentives
-   Overtime
-   Bonus
-   Leave deductions
-   Advances
-   Other deductions
-   Net salary
-   Salary payment status
-   Salary history
-   Salary slips

Example:

``` text
Basic Salary
+ Allowances
+ Incentives
+ Overtime
- Leave Deduction
- Advance
- Other Deduction
= Net Salary
```

Payroll calculations must be deterministic, auditable, and testable.

Do not silently modify historical payroll records.

Use immutable or versioned payroll records where practical.

------------------------------------------------------------------------

# 14. Staff Attendance

Support:

-   Present
-   Absent
-   Half-day
-   Late
-   Leave

Provide:

-   Daily view
-   Monthly summary
-   Attendance reports

Future integrations:

-   Biometric
-   RFID
-   Device integrations

Do not build hardware integrations into the MVP unless explicitly
requested.

------------------------------------------------------------------------

# 15. Leave Management

Staff can:

-   Apply for leave
-   View balance
-   Cancel pending requests

Admins can:

-   Approve
-   Reject
-   Record leave

Track:

-   Leave type
-   Requested dates
-   Reason
-   Status
-   Approver
-   Approval timestamp

------------------------------------------------------------------------

# 16. Academic Management

Support:

-   Academic sessions
-   Grades
-   Sections
-   Subjects
-   Classes
-   Teacher assignment
-   Subject assignment
-   Academic calendar
-   Timetable
-   Exams
-   Assessments
-   Results
-   Report cards

------------------------------------------------------------------------

# 17. Timetable

Provide visual timetable management.

Support:

-   Grade
-   Section
-   Subject
-   Teacher
-   Room/lab
-   Time slot
-   Day

Prevent teacher and room conflicts.

------------------------------------------------------------------------

# 18. Student Attendance

Support:

-   Daily attendance
-   Monthly attendance
-   Leave
-   Late arrival
-   Absence tracking

Parents can later receive attendance notifications.

------------------------------------------------------------------------

# 19. Exam and Assessment

Support:

-   Exam creation
-   Exam schedule
-   Subject marks
-   Internal assessment
-   Practical marks
-   Project marks
-   Grades
-   Report cards
-   Result publishing

------------------------------------------------------------------------

# 20. Communication Center

School can publish:

-   Announcements
-   Circulars
-   Notices
-   Events
-   Emergency messages
-   Class-specific messages

Target audiences:

-   All students
-   Specific grade
-   Specific section
-   Parents
-   Teachers
-   Staff

------------------------------------------------------------------------

# 21. Parent Portal

Parent dashboard:

``` text
Child
Grade / Section
Attendance
Fees
Academic Performance
Course Progress
Assignments
Achievements
Announcements
```

Parents should never gain access to another student's information.

------------------------------------------------------------------------

# 22. Transport Management

Future module:

-   Vehicles
-   Drivers
-   Routes
-   Stops
-   Students
-   Transport fees
-   Vehicle status
-   Driver assignment

Future:

-   GPS
-   Live bus tracking
-   Parent notifications

------------------------------------------------------------------------

# 23. Inventory Management

Track:

## Computer Lab

-   Computers
-   Monitors
-   Keyboard
-   Mouse
-   UPS
-   Networking equipment

## Robotics Lab

-   Arduino
-   Sensors
-   Motors
-   Batteries
-   Robotics kits
-   Electronic components

## General

-   Projectors
-   Furniture
-   Stationery
-   Other assets

Statuses:

-   Available
-   Issued
-   Damaged
-   Under repair
-   Lost
-   Retired

------------------------------------------------------------------------

# 24. Asset Management

Every important asset should have:

-   Asset ID
-   Name
-   Category
-   Purchase date
-   Purchase cost
-   Location
-   Assigned person
-   Status
-   Warranty information
-   Maintenance history

------------------------------------------------------------------------

# 25. Document Management

Securely manage:

-   Student documents
-   Staff documents
-   Admission documents
-   Certificates
-   Fee receipts
-   Salary slips
-   Report cards
-   School documents

Use role-based access and secure storage.

------------------------------------------------------------------------

# 26. Support / Ticket Management

Schools can create support tickets.

Example:

``` text
Ticket ID
Category
Priority
Description
Attachments
Assigned Team
Status
Comments
Resolution
```

Statuses:

``` text
Open
Assigned
In Progress
Waiting
Resolved
Closed
```

------------------------------------------------------------------------

# 27. Audit Logs

Record sensitive actions:

-   Who performed the action
-   What changed
-   When
-   Relevant entity
-   Previous value where appropriate
-   New value where appropriate

Examples:

-   Fee structure changed
-   Student created
-   Student deleted/archived
-   Salary generated
-   Marks changed
-   Permission changed
-   School activated

Audit logs should be append-only from the application perspective.

------------------------------------------------------------------------

# 28. InnovatMind Central Admin

Central dashboard:

``` text
Schools
Students
Teachers
Courses
Trainers
Active Users
Course Enrollments
Learning Engagement
Revenue
School Contracts
Support Tickets
```

Central team can manage:

-   Schools
-   School status
-   School metadata
-   Course catalog
-   Course content
-   Pricing
-   Trainers
-   School assignments
-   Analytics
-   Platform settings
-   Feature flags
-   Support

------------------------------------------------------------------------

# 29. Central Pricing Engine

Pricing rules must support:

``` text
Default Price
    ↓
Region
    ↓
State
    ↓
City
    ↓
School Type
    ↓
Grade
    ↓
Course
    ↓
School-specific override
```

Never expose internal pricing formulas unnecessarily to school
administrators.

All pricing changes must be auditable.

------------------------------------------------------------------------

# 30. Course Management System

Course architecture:

``` text
Course
  ↓
Module
  ↓
Lesson
  ↓
Activity
  ↓
Quiz
  ↓
Challenge
  ↓
Project
```

Central team can create and manage:

-   Courses
-   Modules
-   Lessons
-   Videos
-   PDFs
-   Quizzes
-   Questions
-   Coding challenges
-   Robotics challenges
-   Projects
-   Assignments

Content should be reusable across schools.

------------------------------------------------------------------------

# 31. Student Learning Platform

The student portal is a core differentiator.

Do not build a generic LMS.

Student experience should feel like a futuristic learning world.

Primary areas:

-   Home
-   Learning World
-   Courses
-   Coding Lab
-   Robotics Lab
-   AI Lab
-   Challenge Arena
-   Projects
-   Achievements
-   Leaderboards
-   Profile

------------------------------------------------------------------------

# 32. Grade 1--12 Learning Strategy

## Grade 1--3

-   Digital literacy
-   Logic
-   Problem solving
-   Visual/block coding
-   Basic computer concepts

## Grade 4--5

-   Computational thinking
-   Block coding
-   Basic web concepts
-   Introductory robotics

## Grade 6--8

-   Python fundamentals
-   Web fundamentals
-   Programming logic
-   Robotics
-   Electronics
-   Projects

## Grade 9--10

-   Python
-   Web development
-   Algorithms
-   Robotics
-   IoT
-   AI fundamentals
-   Projects

## Grade 11--12

-   Advanced Python
-   Computer science
-   Data handling
-   AI/ML fundamentals
-   Web development
-   Robotics
-   IoT
-   Advanced projects

Curriculum must remain configurable through the course CMS.

------------------------------------------------------------------------

# 33. Gamification Engine

Core entities:

-   XP
-   Levels
-   Coins
-   Badges
-   Streaks
-   Missions
-   Quests
-   Achievements
-   Leaderboards
-   Unlockable content

Example:

``` text
Complete lesson → XP
Pass quiz → XP + coins
Complete challenge → XP + badge progress
Build project → major achievement
Daily learning → streak
```

Do not reward meaningless clicking.

Rewards should correspond to meaningful learning activity.

------------------------------------------------------------------------

# 34. Student Learning World

Long-term visual concept:

``` text
Digital World

Logic Island
     ↓
Coding City
     ↓
Robotics Lab
     ↓
AI Mountain
     ↓
Innovation Space
```

Students unlock areas through learning progress.

This should be progressively implemented, not over-engineered in the
first MVP.

------------------------------------------------------------------------

# 35. Coding Lab

Progressive implementation.

## Phase 1

Block coding / visual logic.

## Phase 2

Python.

## Phase 3

JavaScript / web.

## Phase 4

Advanced programming environments.

Student code execution must use a secure isolated execution
architecture.

Never execute untrusted student code directly on the main application
server.

------------------------------------------------------------------------

# 36. Robotics Lab

Long-term feature:

-   Virtual robot
-   Sensors
-   Motors
-   Environment
-   Obstacles
-   Programming
-   Simulation
-   Challenge system

Example mission:

``` text
Detect obstacle
↓
Stop
↓
Turn left
↓
Continue
```

Later integrate physical robotics kits.

------------------------------------------------------------------------

# 37. AI Learning Layer

Build AI as a learning assistant, not simply an answer generator.

Features:

-   AI tutor
-   AI hints
-   Concept explanation
-   Code feedback
-   Learning recommendations
-   Practice generation
-   Student progress insights
-   Teacher insights

AI hint progression:

``` text
Hint 1
↓
Hint 2
↓
Concept explanation
↓
Example
↓
Guided solution
```

Avoid giving direct final answers when guided learning is more
appropriate.

AI interactions involving minors should follow strict privacy and safety
requirements.

------------------------------------------------------------------------

# 38. Student Projects

Project workflow:

``` text
Mission
 ↓
Learn
 ↓
Plan
 ↓
Build
 ↓
Submit
 ↓
AI feedback
 ↓
Teacher review
 ↓
Achievement
```

Projects should be a major part of the platform.

------------------------------------------------------------------------

# 39. Leaderboards

Possible scopes:

-   Class
-   Grade
-   School
-   City
-   State
-   National

However, minor/student privacy must be protected.

Prefer:

-   First name + initial
-   Avatar
-   Anonymous display names
-   Configurable visibility

Do not expose sensitive student data publicly.

------------------------------------------------------------------------

# 40. Analytics

## School analytics

-   Student count
-   Attendance
-   Fee collection
-   Pending fees
-   Expenses
-   Payroll
-   Academic results
-   Course completion
-   Learning engagement

## InnovatMind analytics

-   Schools onboarded
-   Active schools
-   Students
-   Course enrollments
-   Active learners
-   Completion rate
-   Coding activity
-   Robotics activity
-   Retention
-   School performance
-   Program performance

------------------------------------------------------------------------

# 41. AI Analytics

Long-term AI insights:

``` text
Grade 7 students struggle with loops.

12% of students have not logged in for 7 days.

Robotics Module 4 has a high failure rate.

School B has higher coding engagement than School A.
```

AI insights must always be presented as analysis/recommendations, not
unquestionable facts.

------------------------------------------------------------------------

# 42. Security Requirements

Security is a first-class requirement.

Must implement:

-   Role-based access control
-   Multi-tenant isolation
-   PostgreSQL RLS
-   Secure authentication
-   Secure sessions
-   Server-side authorization
-   Input validation
-   Rate limiting
-   Secure file uploads
-   Audit logging
-   Secret management
-   Least-privilege access
-   Secure coding sandbox
-   No sensitive data in client-side logs

Never expose server/service secrets in frontend code.

Never trust client-supplied role or school identifiers.

Every sensitive action must be authorized server-side.

------------------------------------------------------------------------

# 43. Data Privacy

The platform handles student/minor data.

Follow privacy-by-design principles:

-   Collect only necessary data
-   Minimize sensitive information
-   Restrict access
-   Encrypt data in transit
-   Use secure storage
-   Audit sensitive access
-   Provide appropriate deletion/archive workflows
-   Avoid exposing student information publicly
-   Separate school data
-   Keep AI data handling controlled

Before production deployment, perform a formal legal/privacy review
appropriate to the jurisdictions where the platform operates.

------------------------------------------------------------------------

# 44. Design System

The product must feel premium and futuristic.

Reference aesthetic:

-   Apple-level simplicity
-   Linear-like product UI
-   Modern Vercel-style clarity
-   Subtle gaming inspiration for student portal

Avoid:

-   Cheap neon
-   Excessive gradients
-   Clutter
-   Generic Bootstrap appearance
-   Overuse of glassmorphism
-   Cartoon-heavy school UI

Use:

-   Strong typography
-   Clean spacing
-   High-quality cards
-   Soft depth
-   Subtle motion
-   Responsive layouts
-   Premium empty states
-   Clear hierarchy
-   Purposeful animation

Different experiences:

### Central Admin

Professional command center.

### School CRM

Clean institutional productivity interface.

### Student Portal

Futuristic, immersive, gamified.

------------------------------------------------------------------------

# 45. Accessibility

Build accessibility into the system.

Support:

-   Keyboard navigation
-   Visible focus states
-   Semantic HTML
-   Proper labels
-   Sufficient contrast
-   Screen-reader-friendly components
-   Reduced-motion preferences
-   Responsive layouts

------------------------------------------------------------------------

# 46. Responsive Requirements

Support:

-   Desktop
-   Laptop
-   Tablet
-   Mobile

Prioritize:

-   School computer labs
-   School office desktops
-   Student laptops
-   Tablets

------------------------------------------------------------------------

# 47. Engineering Rules for Antigravity

The coding agent MUST:

1.  Read this document before starting.
2.  Read project documentation before changing architecture.
3.  Inspect the existing code before creating new files.
4.  Reuse existing components.
5.  Avoid duplicate components.
6.  Keep TypeScript strict.
7.  Keep modules small and maintainable.
8.  Add tests for important business logic.
9.  Never bypass authorization.
10. Never expose secrets.
11. Never execute untrusted code directly on the main server.
12. Never change database schema casually.
13. Document important architectural decisions.
14. Run lint/typecheck/tests after meaningful changes.
15. Fix regressions before moving forward.
16. Do not rewrite working modules without a reason.
17. Do not install unnecessary packages.
18. Do not create fake backend functionality and present it as
    production-ready.
19. Clearly mark mock/demo data.
20. Keep production logic separate from UI demo logic.

------------------------------------------------------------------------

# 48. Definition of Done

A feature is not complete merely because the UI exists.

A feature is complete only when appropriate:

-   UI
-   Database
-   Authorization
-   Validation
-   Error handling
-   Loading states
-   Empty states
-   Success states
-   Tests
-   Responsive behavior
-   Audit requirements
-   Documentation

have been addressed.

------------------------------------------------------------------------

# 49. Development Strategy

Do NOT ask an agent:

> "Build the entire School OS."

Instead build vertical slices.

Recommended order:

``` text
Phase 0
Product specification
Architecture
Database design
Design system

Phase 1
Authentication
Roles
Organizations
Schools
Permissions

Phase 2
Student management
Admission
Grades
Sections

Phase 3
Staff management
Attendance
Leave
Payroll

Phase 4
Fees
Expenses
Financial reporting

Phase 5
Academic management
Timetable
Exams
Results

Phase 6
Communication
Parent portal
Documents

Phase 7
Course CMS

Phase 8
Student portal

Phase 9
Gamification

Phase 10
Coding Lab

Phase 11
AI learning

Phase 12
Robotics

Phase 13
Advanced analytics

Phase 14
Payments / integrations / production hardening
```

------------------------------------------------------------------------

# 50. MVP Definition

The first pilot should NOT attempt to build the complete Grade 1--12
ecosystem.

## School side

Must have:

-   School registration
-   School admin login
-   Student admission
-   Bulk student import
-   Grade/section management
-   Student accounts
-   Staff management
-   Basic attendance
-   Fees
-   Expenses
-   Basic payroll
-   Academic basics

## InnovatMind side

Must have:

-   School management
-   Course management
-   Pricing management
-   Content management
-   Trainer management

## Student side

Must have:

-   Login
-   Dashboard
-   Course
-   Lesson
-   Quiz
-   XP
-   Badge
-   Streak
-   Progress

## Initial learning pilot

Start with:

-   Grade 6--8 Computer/Coding
-   One Robotics Foundation program

Then validate with a real pilot school.

------------------------------------------------------------------------

# 51. Suggested Repository

``` text
school-os/

├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── admin/
│   ├── school/
│   ├── teacher/
│   ├── trainer/
│   ├── student/
│   └── parent/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── students/
│   ├── fees/
│   ├── payroll/
│   ├── courses/
│   ├── learning/
│   └── gamification/
│
├── lib/
│   ├── auth/
│   ├── permissions/
│   ├── database/
│   ├── pricing/
│   ├── courses/
│   ├── gamification/
│   └── ai/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── SECURITY.md
│   ├── DESIGN-SYSTEM.md
│   ├── GAMIFICATION.md
│   ├── COURSE-SYSTEM.md
│   ├── AI-SYSTEM.md
│   └── ROADMAP.md
│
└── tests/
```

This is a suggested structure, not a rigid requirement. The agent may
adapt it if a better architecture is justified.

------------------------------------------------------------------------

# 52. Agent Workflow

Before coding:

``` text
1. Read requirements.
2. Inspect repository.
3. Identify existing architecture.
4. Read relevant docs.
5. Create implementation plan.
6. Identify dependencies.
7. Identify security implications.
8. Implement smallest coherent slice.
9. Test.
10. Review.
11. Document.
```

For large features:

``` text
Plan
→ Database
→ Backend
→ Authorization
→ UI
→ Integration
→ Tests
→ QA
```

Never build a complex UI first and invent the data model later.

------------------------------------------------------------------------

# 53. Antigravity Agent Specialization

If using multiple agents, use specialized responsibilities.

## Product Architect

Responsible for:

-   Product requirements
-   Architecture
-   Feature specifications
-   Technical decisions

## Frontend / UX Agent

Responsible for:

-   Design system
-   Components
-   Pages
-   Responsive UI
-   Animation

## Backend Agent

Responsible for:

-   Database
-   Supabase
-   APIs
-   Business logic
-   Authorization

## Finance Agent

Responsible for:

-   Fees
-   Expenses
-   Payroll
-   Financial reports

## Learning Agent

Responsible for:

-   Courses
-   Lessons
-   Assessments
-   Progress

## Gamification Agent

Responsible for:

-   XP
-   Levels
-   Badges
-   Missions
-   Streaks
-   Leaderboards

## AI Agent

Responsible for:

-   AI tutor
-   Hints
-   Code review
-   Recommendations
-   AI analytics

## QA Agent

Responsible for:

-   Unit tests
-   Integration tests
-   E2E tests
-   Browser testing
-   Regression testing

## Security Agent

Responsible for:

-   RLS
-   RBAC
-   Tenant isolation
-   Authentication
-   Secrets
-   Audit
-   Security review

------------------------------------------------------------------------

# 54. Agent Communication Rules

Agents must not silently override decisions made by another agent.

When an architectural conflict is found:

``` text
Stop
↓
Explain conflict
↓
Propose options
↓
Select based on documented architecture
↓
Update documentation
↓
Continue
```

Important decisions must be recorded in:

``` text
docs/ARCHITECTURE.md
```

------------------------------------------------------------------------

# 55. Product Quality Standard

Every major page should feel:

-   Fast
-   Premium
-   Clear
-   Responsive
-   Trustworthy
-   Modern

Every workflow should have:

-   Loading state
-   Empty state
-   Error state
-   Success feedback
-   Confirmation for destructive actions

Never leave users staring at a blank screen.

------------------------------------------------------------------------

# 56. Financial Integrity

Financial modules require special care.

Rules:

-   Use decimal/numeric database types for money.
-   Never use floating-point arithmetic for monetary values.
-   Store currency explicitly.
-   Keep transaction history.
-   Avoid destructive edits to completed transactions.
-   Use reversals/adjustments where appropriate.
-   Record who created/modified financial records.
-   Test fee and payroll calculations extensively.

------------------------------------------------------------------------

# 57. Scalability

Design for growth from the beginning, but do not prematurely
over-engineer.

Initial target:

``` text
1–10 schools
```

Architecture should have a clean path to:

``` text
100 schools
→ 1,000 schools
→ 10,000+ schools
```

Optimize only after measuring actual bottlenecks.

------------------------------------------------------------------------

# 58. Future Integrations

Keep integration boundaries clean for:

-   Online payments
-   WhatsApp
-   SMS
-   Email
-   Google Workspace
-   Microsoft 365
-   Biometric devices
-   RFID
-   GPS
-   Robotics hardware
-   LMS integrations
-   Accounting systems

Do not tightly couple the core domain model to one vendor.

------------------------------------------------------------------------

# 59. What NOT to Build in the First Sprint

Do not begin with:

-   Robotics simulator
-   Advanced AI
-   Payment gateway
-   GPS tracking
-   Biometric integration
-   National leaderboard
-   Complex animations
-   Multiple programming languages
-   Mobile native apps

First make the foundation reliable.

------------------------------------------------------------------------

# 60. First Coding Sprint

The first implementation sprint should produce:

``` text
1. Next.js application
2. Premium base design system
3. Authentication
4. User roles
5. Organization/school model
6. School admin dashboard shell
7. Central admin dashboard shell
8. Student model
9. Grade/section model
10. Basic student management
11. Database migrations
12. RLS policies
13. Seed/demo data
14. Automated tests
15. Documentation
```

Do not proceed to advanced modules until this foundation is stable.

------------------------------------------------------------------------

# 61. Seed Data

Development environment should include clearly marked demo data:

``` text
InnovatMind Demo Organization

Demo School A
Demo School B

Demo Admin
Demo Teacher
Demo Trainer
Demo Student
Demo Parent
```

Never use fake demo data in production without an explicit seed/demo
environment.

------------------------------------------------------------------------

# 62. Final Product Direction

The final experience should communicate:

> **InnovatMind is not just another school ERP.**

It is:

``` text
School Management
        +
School ERP
        +
Student CRM
        +
Computer Education
        +
Coding
        +
Robotics
        +
AI
        +
Gamified Learning
        +
Future Technology
```

The long-term vision is to create a technology ecosystem where schools
use InnovatMind School OS for daily operations and students use the same
ecosystem to develop real technology skills from Grade 1 through Grade
12.

------------------------------------------------------------------------

# 63. First Instruction to the Antigravity Agent

Before writing production code, do the following:

1.  Inspect the repository.
2.  Read this master specification completely.
3.  Create or update `docs/PRD.md`.
4.  Create `docs/ARCHITECTURE.md`.
5.  Create `docs/DATABASE.md`.
6.  Create `docs/SECURITY.md`.
7.  Create `docs/ROADMAP.md`.
8.  Propose the initial database schema.
9.  Propose the route structure.
10. Propose the role/permission matrix.
11. Propose the first implementation sprint.
12. Do not implement large features until the plan is internally
    consistent.
13. After planning, implement only the approved first sprint.
14. Run typecheck, lint, tests, and browser validation.
15. Report what was implemented, what was tested, and what remains.

The agent must behave like a senior product engineering team member, not
like a code generator.

------------------------------------------------------------------------

# 64. InnovatMind Product Principle

Every feature must answer at least one of these questions:

1.  Does it make school administration easier?
2.  Does it improve financial/operational visibility?
3.  Does it improve teacher productivity?
4.  Does it improve parent communication?
5.  Does it improve student learning?
6.  Does it strengthen Computer/Coding/Robotics education?
7.  Does it improve InnovatMind's ability to operate schools at scale?

If a feature does none of these, question whether it belongs in the
product.

------------------------------------------------------------------------

## End of Master Specification

**Company:** InnovatMind\
**Product:** InnovatMind School OS\
**Status:** Product Architecture / MVP Planning\
**Primary Development Environment:** Antigravity
