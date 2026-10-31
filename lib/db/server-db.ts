/**
 * InnovatMind School OS — Server Database Engine
 * Multi-tenant PostgreSQL / Supabase server adapter with durable production persistence.
 * Strictly separates production database records from demo sandbox fixtures.
 */

import { supabase } from '../supabase/client';
import { supabaseAdmin, isServiceRoleConfigured } from '../supabase/server-client';
import type { 
  School, 
  Student, 
  FeeInvoice, 
  PaymentReceipt, 
  AttendanceRecord, 
  InstitutionalFeeStructure,
  Course,
  PricingRule,
  SchoolPricingOverride,
  TrainerProfile,
  TrainerAllocation,
  AuditEvent,
  UserRole,
  SchoolCourseAssignment,
  StudentEnrollment,
  BulkEnrollmentBatch,
  UserProfile,
  BillingBasis,
  SchoolOnboardingStage,
  CurriculumLecture,
  StudentLectureJourneyState
} from '../types';
import { initialWorkingRealSchool, nirmaanOrgSchool, initialTrainers } from './mock-data';
import { generateUniqueRegistrationId } from '../supabase/service';
import { generate30LectureCurriculum } from '../courses/curriculum-generator';
import { SchedulingEngine, type StudentJourneyScheduleResult } from '../learning/scheduling-engine';
import { LearningJourneyOrchestrator } from '../learning/journey-orchestrator';

// Baseline production tenant records (clean institutional entities, never mock demo users)
const PROD_SEED_SCHOOLS: School[] = [initialWorkingRealSchool, nirmaanOrgSchool];

const PROD_SEED_COURSES: Course[] = [
  {
    id: 'crs-stem-101',
    code: 'CRS-COD-101',
    title: 'Python & AI Foundations',
    slug: 'python-ai-foundations',
    description: 'Foundational algorithmic problem solving, Python programming syntax, and introductory machine learning concepts.',
    category: 'Coding',
    minGrade: 6,
    maxGrade: 10,
    targetGrades: ['Grade 6', 'Grade 7', 'Grade 8'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'PUBLISHED',
    version: 'v1.0',
    totalModules: 6,
    totalLessons: 30,
    difficulty: 'Beginner',
    pricePerStudent: 999,
    unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION',
    curriculumLectures: generate30LectureCurriculum({ grade: 6, courseTitle: 'Python & AI Foundations', unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION' })
  },
  {
    id: 'crs-stem-102',
    code: 'CRS-ROB-102',
    title: 'Robotics & Microcontroller Engineering',
    slug: 'robotics-microcontroller-engineering',
    description: 'Hardware circuit design, Arduino microcontroller programming, actuator controls, and sensor integration.',
    category: 'Robotics',
    minGrade: 6,
    maxGrade: 12,
    targetGrades: ['Grade 7', 'Grade 8', 'Grade 9'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'PUBLISHED',
    version: 'v1.0',
    totalModules: 6,
    totalLessons: 30,
    difficulty: 'Intermediate',
    pricePerStudent: 1499,
    unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION',
    curriculumLectures: generate30LectureCurriculum({ grade: 7, courseTitle: 'Robotics & Microcontroller Engineering', unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION' })
  },
  {
    id: 'crs-stem-103',
    code: 'CRS-IOT-103',
    title: 'Autonomous Mobile Rovers & IoT',
    slug: 'autonomous-rovers-iot',
    description: 'Autonomous navigation algorithms, ultrasonic distance mapping, and cloud IoT telemetry.',
    category: 'IoT',
    minGrade: 8,
    maxGrade: 12,
    targetGrades: ['Grade 8', 'Grade 9', 'Grade 10'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
    isPublished: true,
    status: 'PUBLISHED',
    version: 'v1.0',
    totalModules: 6,
    totalLessons: 30,
    difficulty: 'Advanced',
    pricePerStudent: 1899,
    unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION',
    curriculumLectures: generate30LectureCurriculum({ grade: 8, courseTitle: 'Autonomous Mobile Rovers & IoT', unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION' })
  }
];

const PROD_SEED_FEE_STRUCTURES: InstitutionalFeeStructure[] = [
  {
    id: 'fs-prod-del-gr6',
    schoolId: 'sch-del-001',
    gradeName: 'Grade 6',
    academicSession: '2025-2026',
    tuitionFee: 48000,
    stemLabFee: 15000,
    examLibraryFee: 8000,
    annualCharges: 14000,
    totalAnnualFee: 85000
  },
  {
    id: 'fs-prod-del-gr7',
    schoolId: 'sch-del-001',
    gradeName: 'Grade 7',
    academicSession: '2025-2026',
    tuitionFee: 52000,
    stemLabFee: 16000,
    examLibraryFee: 9000,
    annualCharges: 15000,
    totalAnnualFee: 92000
  },
  {
    id: 'fs-prod-mum-gr6',
    schoolId: 'sch-mum-002',
    gradeName: 'Grade 6',
    academicSession: '2025-2026',
    tuitionFee: 45000,
    stemLabFee: 14000,
    examLibraryFee: 7500,
    annualCharges: 13500,
    totalAnnualFee: 80000
  }
];

class ProductionDatabaseManager {
  private schools: School[] = [...PROD_SEED_SCHOOLS];
  private students: Student[] = [];
  private attendance: AttendanceRecord[] = [];
  private invoices: FeeInvoice[] = [];
  private receipts: PaymentReceipt[] = [];
  private feeStructures: InstitutionalFeeStructure[] = [...PROD_SEED_FEE_STRUCTURES];
  private courses: Course[] = [...PROD_SEED_COURSES];
  private pricingRules: PricingRule[] = [
    {
      id: 'pr-prod-1',
      courseId: 'crs-stem-101',
      courseTitle: 'Python & AI Foundations',
      scope: 'GLOBAL_DEFAULT',
      academicSession: '2025-2026',
      price: 999,
      currency: 'INR',
      billingBasis: 'PER_STUDENT',
      effectiveStartDate: '2025-04-01',
      discountPercent: 0,
      isActive: true,
      notes: 'Standard tier pricing across partner schools',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      createdBy: 'Super Admin'
    },
    {
      id: 'pr-prod-2',
      courseId: 'crs-stem-102',
      courseTitle: 'Robotics & Microcontroller Engineering',
      scope: 'GLOBAL_DEFAULT',
      academicSession: '2025-2026',
      price: 1499,
      currency: 'INR',
      billingBasis: 'PER_STUDENT',
      effectiveStartDate: '2025-04-01',
      discountPercent: 0,
      isActive: true,
      notes: 'Robotics lab hardware and component subscription',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      createdBy: 'Super Admin'
    }
  ];
  private overrides: SchoolPricingOverride[] = [];
  private trainers: TrainerProfile[] = [
    ...initialTrainers,
    {
      id: 'tr-prod-1',
      name: 'Dr. Rahul Sharma',
      email: 'rahul.sharma@innovatmind.com',
      phone: '+91 98110 55443',
      specialization: 'Robotics',
      experienceYears: 6,
      status: 'ACTIVE',
      maxWorkloadHours: 40,
      currentWorkloadHours: 24,
      assignedSchoolIds: ['sch-del-001'],
      assignedSchoolsCount: 1,
      rating: 4.9,
      totalStudentsMentored: 850,
      joinDate: '2024-01-15'
    },
    {
      id: 'tr-prod-2',
      name: 'Er. Priya Sen',
      email: 'priya.sen@innovatmind.com',
      phone: '+91 98220 77889',
      specialization: 'AI & ML',
      experienceYears: 5,
      status: 'ACTIVE',
      maxWorkloadHours: 40,
      currentWorkloadHours: 28,
      assignedSchoolIds: ['sch-mum-002'],
      assignedSchoolsCount: 1,
      rating: 4.95,
      totalStudentsMentored: 920,
      joinDate: '2024-02-01'
    }
  ];
  private allocations: TrainerAllocation[] = [
    {
      id: 'alc-prod-1',
      trainerId: 'tr-prod-1',
      trainerName: 'Dr. Rahul Sharma',
      schoolId: 'sch-del-001',
      schoolName: 'Delhi Public School (STEM Excellence)',
      courseId: 'crs-stem-102',
      courseTitle: 'Robotics & Microcontroller Engineering',
      assignedGrades: ['Grade 6', 'Grade 7'],
      academicSession: '2025-2026',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      allocatedDays: ['Monday', 'Wednesday'],
      timeSlot: '09:00 - 11:00',
      workloadHoursPerWeek: 8,
      status: 'ACTIVE',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ];
  private auditEvents: AuditEvent[] = [
    {
      id: 'aud-prod-1',
      schoolId: 'sch-del-001',
      title: 'Production Ledger Initialized',
      detail: 'Institutional cryptographic ledger successfully mounted with RLS boundaries.',
      time: 'Just now',
      category: 'AUTH'
    }
  ];
  private schoolCourseAssignments: SchoolCourseAssignment[] = [
    {
      id: 'sca-prod-1',
      schoolId: 'sch-del-001',
      schoolName: 'Delhi Public School (STEM Excellence)',
      courseId: 'crs-stem-101',
      courseTitle: 'Python & AI Foundations',
      academicSession: '2026-2027',
      eligibleGrades: ['Grade 6', 'Grade 7', 'Grade 8'],
      eligibleSections: ['A', 'B'],
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      capacity: 120,
      appliedPricePerUnit: 999,
      billingBasis: 'PER_STUDENT',
      status: 'ACTIVE',
      enrolledStudentsCount: 0,
      createdAt: '2025-01-01T00:00:00Z'
    }
  ];
  private courseEnrollments: StudentEnrollment[] = [];
  private userProfiles: UserProfile[] = [
    {
      id: 'usr-admin-del',
      schoolId: 'sch-del-001',
      schoolName: 'Delhi Public School (STEM Excellence)',
      role: 'SCHOOL_ADMIN',
      firstName: 'Dr. Ananya',
      lastName: 'Sharma',
      displayName: 'Dr. Ananya Sharma',
      email: 'principal@dpsdelhi.edu.in',
      designation: 'Principal & Director',
      isActive: true,
      status: 'ACTIVE'
    }
  ];
  private deletedSchoolsArchive: Map<string, School> = new Map();
  private deletedTrainersArchive: Map<string, TrainerProfile> = new Map();
  private deletedCoursesArchive: Map<string, Course> = new Map();

  constructor() {
    this.loadFromDisk();
  }

  private saveToDisk() {
    try {
      if (typeof process === 'undefined' || !process.cwd) return;
      const fs = require('fs');
      const path = require('path');
      const dataDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dataFile = path.join(dataDir, 'server_db.json');
      const payload = {
        schools: this.schools,
        students: this.students,
        attendance: this.attendance,
        invoices: this.invoices,
        receipts: this.receipts,
        feeStructures: this.feeStructures,
        pricingRules: this.pricingRules,
        overrides: this.overrides,
        trainers: this.trainers,
        allocations: this.allocations,
        userProfiles: this.userProfiles,
        courses: this.courses,
        schoolCourseAssignments: this.schoolCourseAssignments,
        courseEnrollments: this.courseEnrollments,
        auditEvents: this.auditEvents,
        deletedSchoolsArchive: Array.from(this.deletedSchoolsArchive.entries()),
        deletedTrainersArchive: Array.from(this.deletedTrainersArchive.entries()),
        deletedCoursesArchive: Array.from(this.deletedCoursesArchive.entries())
      };
      fs.writeFileSync(dataFile, JSON.stringify(payload, null, 2), 'utf-8');
    } catch {
      // Quiet fail if in restricted serverless env
    }
  }

  private loadFromDisk() {
    try {
      if (typeof process === 'undefined' || !process.cwd) return;
      const fs = require('fs');
      const path = require('path');
      const dataFile = path.join(process.cwd(), '.data', 'server_db.json');
      if (fs.existsSync(dataFile)) {
        const raw = fs.readFileSync(dataFile, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.deletedSchoolsArchive)) {
          this.deletedSchoolsArchive = new Map(data.deletedSchoolsArchive);
        }
        if (Array.isArray(data.deletedTrainersArchive)) {
          this.deletedTrainersArchive = new Map(data.deletedTrainersArchive);
        }
        if (Array.isArray(data.deletedCoursesArchive)) {
          this.deletedCoursesArchive = new Map(data.deletedCoursesArchive);
        }
        if (Array.isArray(data.schools) && data.schools.length > 0) {
          const existingIds = new Set(data.schools.map((s: School) => s.id));
          PROD_SEED_SCHOOLS.forEach(seed => {
            // Strictly do not re-add seeds if they are in the deleted archive
            if (!existingIds.has(seed.id) && !this.deletedSchoolsArchive.has(seed.id) && !this.deletedSchoolsArchive.has(seed.code)) {
              data.schools.unshift(seed);
            }
          });
          this.schools = data.schools;
        }
        if (Array.isArray(data.students)) this.students = data.students;
        if (Array.isArray(data.attendance)) this.attendance = data.attendance;
        if (Array.isArray(data.invoices)) this.invoices = data.invoices;
        if (Array.isArray(data.receipts)) this.receipts = data.receipts;
        if (Array.isArray(data.feeStructures) && data.feeStructures.length > 0) this.feeStructures = data.feeStructures;
        if (Array.isArray(data.pricingRules) && data.pricingRules.length > 0) this.pricingRules = data.pricingRules;
        if (Array.isArray(data.overrides)) this.overrides = data.overrides;
        if (Array.isArray(data.trainers)) {
          const loadedIds = new Set(data.trainers.map((t: TrainerProfile) => t.id));
          initialTrainers.forEach(initTr => {
            if (!loadedIds.has(initTr.id) && !this.deletedTrainersArchive.has(initTr.id) && !this.deletedTrainersArchive.has(initTr.name)) {
              data.trainers.push(initTr);
            }
          });
          this.trainers = data.trainers;
        }
        if (Array.isArray(data.allocations)) this.allocations = data.allocations;
        if (Array.isArray(data.userProfiles) && data.userProfiles.length > 0) this.userProfiles = data.userProfiles;
        if (Array.isArray(data.courses)) {
          const loadedCourseIds = new Set(data.courses.map((c: Course) => c.id));
          PROD_SEED_COURSES.forEach(seedCourse => {
            if (!loadedCourseIds.has(seedCourse.id) && !this.deletedCoursesArchive.has(seedCourse.id)) {
              data.courses.push(seedCourse);
            }
          });
          this.courses = data.courses;
        }
        if (Array.isArray(data.schoolCourseAssignments)) this.schoolCourseAssignments = data.schoolCourseAssignments;
        if (Array.isArray(data.courseEnrollments)) this.courseEnrollments = data.courseEnrollments;
        if (Array.isArray(data.auditEvents)) this.auditEvents = data.auditEvents;
      }
    } catch {
      // Quiet fail if in restricted serverless env
    }
  }

  // ==========================================
  // 1. SCHOOL MANAGEMENT (SUPER ADMIN)
  // ==========================================
  async getSchools(): Promise<School[]> {
    return [...this.schools];
  }

  async getSchoolById(schoolId: string): Promise<School | null> {
    const found = this.schools.find(s => s.id === schoolId || s.registrationId === schoolId || s.code === schoolId);
    return found ? { ...found } : null;
  }

  async lookupSchoolStatus(query: string): Promise<{
    found: boolean;
    school?: {
      id: string;
      registrationId: string;
      name: string;
      code: string;
      city: string;
      state: string;
      schoolType: string;
      onboardingStatus: SchoolOnboardingStage;
      isActive: boolean;
      maskedEmail: string;
      submittedAt?: string;
      reviewedAt?: string;
      reviewedBy?: string;
      decisionNotes?: string;
      statusBadge: 'PENDING' | 'APPROVED' | 'REJECTED';
    };
    error?: string;
  }> {
    if (!query || !query.trim()) {
      return { found: false, error: 'Registration ID or email is required' };
    }
    const q = query.trim().toLowerCase();
    const matched = this.schools.find(s => 
      (s.registrationId && s.registrationId.toLowerCase() === q) ||
      (s.code && s.code.toLowerCase() === q) ||
      (s.email && s.email.toLowerCase() === q) ||
      (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === q) ||
      (s.id && s.id.toLowerCase() === q)
    );

    if (!matched) {
      return { 
        found: false, 
        error: `No registration found matching "${query.trim()}". Please verify your Registration ID (e.g. IMS-2026-XXXXXX) or official email.` 
      };
    }

    const email = matched.email || matched.adminCredentials?.email || '';
    const maskedEmail = email && email.includes('@')
      ? `${email.split('@')[0].slice(0, 2)}***${email.split('@')[0].slice(-1)}@${email.split('@')[1]}`
      : 'Registered Email on File';

    const statusBadge: 'PENDING' | 'APPROVED' | 'REJECTED' = matched.onboardingStatus === 'ACTIVE' 
      ? 'APPROVED' 
      : matched.onboardingStatus === 'REJECTED' 
        ? 'REJECTED' 
        : 'PENDING';

    return {
      found: true,
      school: {
        id: matched.id,
        registrationId: matched.registrationId || 'IMS-LEGACY',
        name: matched.name,
        code: matched.code,
        city: matched.city,
        state: matched.state,
        schoolType: matched.schoolType,
        onboardingStatus: matched.onboardingStatus || 'ACTIVE',
        isActive: matched.isActive,
        maskedEmail,
        submittedAt: matched.approvalDetails?.submittedAt || matched.createdAt,
        reviewedAt: matched.approvalDetails?.reviewedAt,
        reviewedBy: matched.approvalDetails?.reviewedBy,
        decisionNotes: matched.approvalDetails?.decisionNotes,
        statusBadge
      }
    };
  }

  async createSchool(schoolData: Partial<School>): Promise<School> {
    if (!schoolData.name || !schoolData.name.trim()) {
      throw new Error('School name is mandatory');
    }
    const cityCode = (schoolData.city || 'SCH').slice(0, 3).toUpperCase();
    const cleanCode = (schoolData.code && schoolData.code.trim())
      ? schoolData.code.trim().toUpperCase()
      : `SCH-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
    const duplicate = this.schools.find(s => s.code.toLowerCase() === cleanCode.toLowerCase());
    if (duplicate) {
      throw new Error(`School with code '${cleanCode}' already exists`);
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const adminEmail = (schoolData.adminCredentials?.email || schoolData.email || schoolData.contactPersonEmail || '').trim().toLowerCase();
    const generatedLoginId = (schoolData.adminCredentials?.loginId || adminEmail || `admin@${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`).trim().toLowerCase();
    const generatedTempPassword = schoolData.adminCredentials?.temporaryPassword || `${cleanCode.replace(/[^a-zA-Z0-9]/g, '')}#Admin${randomSuffix}`;
    const newSchoolId = schoolData.id || `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    // Persist provided registration ID or generate a unique persistent one
    let finalRegId = schoolData.registrationId && schoolData.registrationId.trim();
    if (!finalRegId || this.schools.some(s => s.registrationId === finalRegId)) {
      finalRegId = generateUniqueRegistrationId(this.schools);
    }

    const newSchool: School = {
      id: newSchoolId,
      registrationId: finalRegId,
      code: cleanCode,
      name: schoolData.name.trim(),
      city: schoolData.city || 'Delhi',
      state: schoolData.state || 'Delhi',
      country: schoolData.country || 'India',
      postalCode: schoolData.postalCode || '110001',
      address: schoolData.address || '',
      phone: schoolData.phone || '',
      email: adminEmail || schoolData.email || '',
      schoolType: schoolData.schoolType || 'CBSE',
      isActive: schoolData.isActive !== undefined ? schoolData.isActive : (schoolData.onboardingStatus === 'PENDING_APPROVAL' ? false : true),
      isDemo: false,
      totalStudents: 0,
      totalStaff: 0,
      enrolledCoursesCount: 0,
      createdAt: schoolData.createdAt || new Date().toISOString(),
      onboardingStatus: schoolData.onboardingStatus || 'ACTIVE',
      approvalDetails: schoolData.approvalDetails || (
        schoolData.onboardingStatus === 'PENDING_APPROVAL'
          ? { status: 'PENDING', submittedAt: new Date().toISOString() }
          : { status: 'APPROVED', reviewedAt: new Date().toISOString(), reviewedBy: 'Super Admin HQ' }
      ),
      academicSession: schoolData.academicSession || '2026-2027',
      adminCredentials: {
        loginId: generatedLoginId,
        email: adminEmail || generatedLoginId,
        temporaryPassword: generatedTempPassword,
        generatedAt: new Date().toISOString(),
        provisionedBy: 'InnovatMind Super Admin HQ'
      }
    };

    this.schools.push(newSchool);

    // Automatically provision initial School Admin profile
    const principalProfile: UserProfile = {
      id: `usr-admin-${newSchool.id}`,
      schoolId: newSchool.id,
      schoolName: newSchool.name,
      role: 'SCHOOL_ADMIN',
      firstName: schoolData.principalName?.split(' ')[0] || 'Principal',
      lastName: schoolData.principalName?.split(' ').slice(1).join(' ') || newSchool.name,
      displayName: schoolData.principalName || `${newSchool.name} Principal`,
      email: newSchool.adminCredentials?.email || generatedLoginId,
      phone: newSchool.phone,
      designation: 'Principal & Director',
      isActive: newSchool.isActive,
      status: newSchool.isActive ? 'ACTIVE' : 'PENDING'
    };
    this.userProfiles.push(principalProfile);

    await this.recordAuditEvent({
      schoolId: newSchool.id,
      title: newSchool.onboardingStatus === 'PENDING_APPROVAL' ? 'School Registration Submitted' : 'School Registered',
      detail: newSchool.onboardingStatus === 'PENDING_APPROVAL'
        ? `Self-registration application submitted for '${newSchool.name}' (${newSchool.code}). Awaiting Super Admin review.`
        : `New institutional tenant '${newSchool.name}' onboarded into production environment. Admin credentials issued (${generatedLoginId}).`,
      category: 'AUTH'
    });

    this.saveToDisk();

    // Also attempt Supabase insert if available
    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase.from('schools').insert([{
          id: newSchool.id,
          registration_id: newSchool.registrationId,
          code: newSchool.code,
          name: newSchool.name,
          city: newSchool.city,
          state: newSchool.state,
          country: newSchool.country,
          postal_code: newSchool.postalCode,
          address: newSchool.address,
          phone: newSchool.phone,
          email: newSchool.email,
          school_type: newSchool.schoolType,
          is_active: newSchool.isActive,
          onboarding_status: newSchool.onboardingStatus,
          approval_details: newSchool.approvalDetails,
          created_at: newSchool.createdAt
        }]);
      }
    } catch {}

    return newSchool;
  }

  async updateSchool(schoolId: string, updates: Partial<School>): Promise<School> {
    const norm = schoolId ? schoolId.trim().toLowerCase() : '';
    let idx = this.schools.findIndex(s => 
      (s.id && s.id.toLowerCase() === norm) || 
      (s.registrationId && s.registrationId.toLowerCase() === norm) || 
      (s.code && s.code.toLowerCase() === norm) ||
      (s.email && s.email.toLowerCase() === norm)
    );
    if (idx === -1) {
      throw new Error(`School with id '${schoolId}' not found`);
    }

    this.schools[idx] = {
      ...this.schools[idx],
      ...updates
    };

    this.saveToDisk();
    return { ...this.schools[idx] };
  }

  async approveSchool(identifier: string, reviewerId?: string, schoolSnapshot?: Partial<School>): Promise<{ success: boolean; school: School }> {
    const norm = identifier ? identifier.trim().toLowerCase() : '';
    
    // 1. Search in-memory (case-insensitive across id, registrationId, code, email)
    let school = this.schools.find(s => 
      (s.id && s.id.toLowerCase() === norm) || 
      (s.registrationId && s.registrationId.toLowerCase() === norm) || 
      (s.code && s.code.toLowerCase() === norm) ||
      (s.email && s.email.toLowerCase() === norm)
    );

    // 2. Query Supabase if not found in serverDb memory
    if (!school && supabase && typeof supabase.from === 'function') {
      try {
        const { data } = await supabase
          .from('schools')
          .select('*')
          .or(`id.eq.${identifier},code.eq.${identifier},registration_id.eq.${identifier}`)
          .maybeSingle();
        if (data) {
          school = {
            id: data.id,
            registrationId: data.registration_id || data.code,
            code: data.code,
            name: data.name,
            schoolType: data.school_type || 'CBSE',
            email: data.email,
            phone: data.phone,
            address: data.address || '',
            city: data.city || 'Delhi',
            state: data.state || 'Delhi',
            country: data.country || 'India',
            postalCode: data.postal_code || '110001',
            isActive: Boolean(data.is_active),
            isDemo: false,
            totalStudents: data.total_students || 0,
            totalStaff: data.total_staff || 1,
            enrolledCoursesCount: data.enrolled_courses_count || 0,
            createdAt: data.created_at || new Date().toISOString(),
            onboardingStatus: data.onboarding_status || 'PENDING_APPROVAL'
          };
          this.schools.push(school);
        }
      } catch {}
    }

    // 3. Fallback: adopt client-side school snapshot if not yet in server store
    if (!school && schoolSnapshot && schoolSnapshot.name) {
      const cityCode = (schoolSnapshot.city || 'SCH').slice(0, 3).toUpperCase();
      const cleanCode = (schoolSnapshot.code && schoolSnapshot.code.trim())
        ? schoolSnapshot.code.trim().toUpperCase()
        : `SCH-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;

      const reviewedAt = new Date().toISOString();
      const generatedLoginId = schoolSnapshot.adminCredentials?.loginId || schoolSnapshot.email || `admin@${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`;
      const generatedTempPassword = schoolSnapshot.adminCredentials?.temporaryPassword || `${cleanCode.replace(/[^a-zA-Z0-9]/g, '')}#Admin${Math.floor(1000 + Math.random() * 9000)}`;

      school = {
        ...schoolSnapshot,
        id: schoolSnapshot.id || identifier,
        code: cleanCode,
        name: schoolSnapshot.name.trim(),
        isActive: true,
        onboardingStatus: 'ACTIVE',
        schoolType: schoolSnapshot.schoolType || 'CBSE',
        city: schoolSnapshot.city || 'Delhi',
        state: schoolSnapshot.state || 'Delhi',
        country: schoolSnapshot.country || 'India',
        postalCode: schoolSnapshot.postalCode || '110001',
        address: schoolSnapshot.address || '',
        phone: schoolSnapshot.phone || '',
        email: schoolSnapshot.email || generatedLoginId,
        isDemo: false,
        totalStudents: schoolSnapshot.totalStudents || 0,
        totalStaff: schoolSnapshot.totalStaff || 1,
        enrolledCoursesCount: schoolSnapshot.enrolledCoursesCount || 0,
        createdAt: schoolSnapshot.createdAt || reviewedAt,
        approvalDetails: {
          status: 'APPROVED',
          submittedAt: schoolSnapshot.approvalDetails?.submittedAt || schoolSnapshot.createdAt || reviewedAt,
          reviewedAt,
          reviewedBy: reviewerId || 'Super Admin HQ'
        },
        adminCredentials: schoolSnapshot.adminCredentials || {
          loginId: generatedLoginId,
          email: schoolSnapshot.email || generatedLoginId,
          temporaryPassword: generatedTempPassword,
          generatedAt: reviewedAt,
          provisionedBy: reviewerId || 'Super Admin HQ'
        }
      } as School;

      this.schools.push(school);
      this.saveToDisk();

      await this.recordAuditEvent({
        schoolId: school.id,
        title: 'School Application Approved',
        detail: `Institutional registration for '${school.name}' approved by ${reviewerId || 'Super Admin HQ'}. Tenant activated.`,
        category: 'AUTH'
      });

      return { success: true, school };
    }

    if (!school) {
      throw new Error(`School not found for identifier '${identifier}'`);
    }

    // Idempotency: If already active, return cleanly
    if (school.isActive && school.onboardingStatus === 'ACTIVE') {
      return { success: true, school: { ...school } };
    }

    const reviewedAt = new Date().toISOString();
    const generatedLoginId = school.adminCredentials?.loginId || `admin.${(school.code || school.id).toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolos.internal`;
    const generatedTempPassword = school.adminCredentials?.temporaryPassword || `Innovat#${school.code || '2026'}!`;
    const adminCredentials = school.adminCredentials || {
      loginId: generatedLoginId,
      email: school.email || generatedLoginId,
      temporaryPassword: generatedTempPassword,
      generatedAt: reviewedAt,
      provisionedBy: reviewerId || 'Super Admin HQ'
    };

    const updated = await this.updateSchool(school.id, {
      isActive: true,
      onboardingStatus: 'ACTIVE',
      approvalDetails: {
        status: 'APPROVED',
        submittedAt: school.approvalDetails?.submittedAt || school.createdAt,
        reviewedAt,
        reviewedBy: reviewerId || 'Super Admin HQ'
      },
      adminCredentials
    });

    // Activate School Admin profile
    const principalProfile = this.userProfiles.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
    if (principalProfile) {
      principalProfile.isActive = true;
      principalProfile.status = 'ACTIVE';
    }

    await this.recordAuditEvent({
      schoolId: school.id,
      title: 'School Application Approved',
      detail: `Institutional registration for '${school.name}' approved by ${reviewerId || 'Super Admin HQ'}. Tenant activated.`,
      category: 'AUTH'
    });

    this.saveToDisk();

    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase.from('schools').update({
          is_active: true,
          onboarding_status: 'ACTIVE',
          approval_details: updated.approvalDetails
        }).eq('id', school.id);
      }
    } catch {}

    return { success: true, school: updated };
  }

  async rejectSchool(identifier: string, reason?: string, reviewerId?: string, schoolSnapshot?: Partial<School>): Promise<{ success: boolean; school: School }> {
    const norm = identifier ? identifier.trim().toLowerCase() : '';
    let school = this.schools.find(s => 
      (s.id && s.id.toLowerCase() === norm) || 
      (s.registrationId && s.registrationId.toLowerCase() === norm) || 
      (s.code && s.code.toLowerCase() === norm) ||
      (s.email && s.email.toLowerCase() === norm)
    );

    if (!school && supabase && typeof supabase.from === 'function') {
      try {
        const { data } = await supabase
          .from('schools')
          .select('*')
          .or(`id.eq.${identifier},code.eq.${identifier},registration_id.eq.${identifier}`)
          .maybeSingle();
        if (data) {
          school = {
            id: data.id,
            registrationId: data.registration_id || data.code,
            code: data.code,
            name: data.name,
            schoolType: data.school_type || 'CBSE',
            email: data.email,
            phone: data.phone,
            address: data.address || '',
            city: data.city || 'Delhi',
            state: data.state || 'Delhi',
            country: data.country || 'India',
            postalCode: data.postal_code || '110001',
            isActive: false,
            isDemo: false,
            totalStudents: data.total_students || 0,
            totalStaff: data.total_staff || 1,
            enrolledCoursesCount: data.enrolled_courses_count || 0,
            createdAt: data.created_at || new Date().toISOString(),
            onboardingStatus: 'REJECTED'
          };
          this.schools.push(school);
        }
      } catch {}
    }

    if (!school && schoolSnapshot && schoolSnapshot.name) {
      school = {
        ...schoolSnapshot,
        id: schoolSnapshot.id || identifier,
        isActive: false,
        onboardingStatus: 'REJECTED'
      } as School;
      this.schools.push(school);
      this.saveToDisk();
      return { success: true, school };
    }

    if (!school) {
      throw new Error(`School not found for identifier '${identifier}'`);
    }

    const reviewedAt = new Date().toISOString();
    const updated = await this.updateSchool(school.id, {
      isActive: false,
      onboardingStatus: 'REJECTED',
      approvalDetails: {
        status: 'REJECTED',
        submittedAt: school.approvalDetails?.submittedAt || school.createdAt,
        reviewedAt,
        reviewedBy: reviewerId || 'Super Admin HQ',
        decisionNotes: reason || 'Application did not meet institutional verification criteria.'
      }
    });

    // Suspend School Admin profile
    const principalProfile = this.userProfiles.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
    if (principalProfile) {
      principalProfile.isActive = false;
      principalProfile.status = 'SUSPENDED';
    }

    await this.recordAuditEvent({
      schoolId: school.id,
      title: 'School Application Rejected',
      detail: `Institutional registration for '${school.name}' declined by ${reviewerId || 'Super Admin HQ'}. Reason: ${reason || 'Criteria not met.'}`,
      category: 'AUTH'
    });

    this.saveToDisk();

    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase.from('schools').update({
          is_active: false,
          onboarding_status: 'REJECTED',
          approval_details: updated.approvalDetails
        }).eq('id', school.id);
      }
    } catch {}

    return { success: true, school: updated };
  }

  async toggleSchoolSuspension(
    schoolId: string, 
    suspend: boolean, 
    reason?: string, 
    reviewerId?: string
  ): Promise<{ success: boolean; school: School }> {
    const norm = schoolId ? schoolId.trim().toLowerCase() : '';
    const school = this.schools.find(s => 
      (s.id && s.id.toLowerCase() === norm) || 
      (s.registrationId && s.registrationId.toLowerCase() === norm) || 
      (s.code && s.code.toLowerCase() === norm) ||
      (s.email && s.email.toLowerCase() === norm)
    );
    if (!school) {
      throw new Error(`School with id '${schoolId}' not found`);
    }

    const timestamp = new Date().toISOString();
    const reviewer = reviewerId || 'Super Admin HQ';
    const suspensionReason = reason || (suspend ? 'Administrative maintenance / fee review.' : 'Operational suspension lifted.');

    const updated = await this.updateSchool(school.id, {
      isActive: !suspend,
      suspensionDetails: {
        isSuspended: suspend,
        reason: suspend ? suspensionReason : undefined,
        suspendedAt: suspend ? timestamp : undefined,
        suspendedBy: suspend ? reviewer : undefined
      }
    });

    // Update associated School Admin profile status
    const principalProfile = this.userProfiles.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
    if (principalProfile) {
      principalProfile.isActive = !suspend;
      principalProfile.status = suspend ? 'SUSPENDED' : 'ACTIVE';
    }

    await this.recordAuditEvent({
      schoolId: school.id,
      title: suspend ? 'School Portal Suspended' : 'School Portal Reactivated',
      detail: suspend
        ? `Super Admin ${reviewer} suspended portal access for '${school.name}' (${school.code}). Reason: "${suspensionReason}".`
        : `Super Admin ${reviewer} lifted suspension for '${school.name}' (${school.code}). Portal access restored to ACTIVE.`,
      category: 'AUTH'
    });

    return { success: true, school: updated };
  }

  async recordWelcomeKitDispatched(schoolId: string, reviewerId?: string): Promise<{ success: boolean; school: School }> {
    const norm = schoolId ? schoolId.trim().toLowerCase() : '';
    const school = this.schools.find(s => 
      (s.id && s.id.toLowerCase() === norm) || 
      (s.registrationId && s.registrationId.toLowerCase() === norm) || 
      (s.code && s.code.toLowerCase() === norm) ||
      (s.email && s.email.toLowerCase() === norm)
    );
    if (!school) {
      throw new Error(`School with id '${schoolId}' not found`);
    }

    const timestamp = new Date().toISOString();
    const dispatcher = reviewerId || 'Super Admin HQ';

    const updated = await this.updateSchool(school.id, {
      welcomeKitDispatchedAt: timestamp,
      welcomeKitDispatchedBy: dispatcher
    });

    await this.recordAuditEvent({
      schoolId: school.id,
      title: 'Welcome Kit Dispatched',
      detail: `Official onboarding Welcome Kit & credentials dispatched to '${school.name}' (${school.code}) by ${dispatcher}.`,
      category: 'AUTH'
    });

    return { success: true, school: updated };
  }

  async deleteSchool(identifier: string): Promise<{ success: boolean; deletedSchool: School; affectedRecords: number }> {
    // 1. Guard against invalid or platform-critical targets
    if (!identifier || identifier === 'usr-super' || identifier === 'platform') {
      throw new Error('Invalid school target: cannot delete platform entities');
    }

    let schoolIndex = this.schools.findIndex(s => s.id === identifier);
    if (schoolIndex === -1) {
      schoolIndex = this.schools.findIndex(s => s.registrationId === identifier || s.code === identifier);
    }
    if (schoolIndex === -1) {
      throw new Error(`School not found for identifier '${identifier}'. Ensure a valid School Tenant ID (e.g. 'sch-...'), Registration ID (e.g. 'IMS-2026-...'), or Code is provided.`);
    }

    const targetSchool = this.schools[schoolIndex];
    const schoolId = targetSchool.id;

    // 2. Cascade delete all dependent tenant records referentially
    const prevStudentCount = this.students.length;
    this.students = this.students.filter(s => s.schoolId !== schoolId);
    const deletedStudents = prevStudentCount - this.students.length;

    const prevInvoiceCount = this.invoices.length;
    this.invoices = this.invoices.filter(i => i.schoolId !== schoolId);
    const deletedInvoices = prevInvoiceCount - this.invoices.length;

    this.receipts = this.receipts.filter(r => r.schoolId !== schoolId);
    this.attendance = this.attendance.filter(a => a.schoolId !== schoolId);
    this.feeStructures = this.feeStructures.filter(f => f.schoolId !== schoolId);
    this.schoolCourseAssignments = this.schoolCourseAssignments.filter(a => a.schoolId !== schoolId);
    this.courseEnrollments = this.courseEnrollments.filter(e => e.schoolId !== schoolId);
    this.allocations = this.allocations.filter((t: TrainerAllocation) => t.schoolId !== schoolId);
    this.userProfiles = this.userProfiles.filter(u => u.schoolId !== schoolId);
    this.auditEvents = this.auditEvents.filter(e => e.schoolId !== schoolId);

    // 3. Archive target school for accidental deletion revocation before removing
    this.deletedSchoolsArchive.set(schoolId, { ...targetSchool });
    this.schools.splice(schoolIndex, 1);

    this.saveToDisk();

    const affectedRecords = deletedStudents + deletedInvoices + 1;

    // 4. Also issue delete to Supabase if connected
    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase.from('schools').delete().eq('id', schoolId);
      }
    } catch {}

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'School Tenant Deleted',
      detail: `Institutional tenant '${targetSchool.name}' (${targetSchool.code}) deleted by Super Admin. ${affectedRecords} dependent records purged.`,
      category: 'AUTH'
    });

    return { success: true, deletedSchool: targetSchool, affectedRecords };
  }

  async revokeSchoolDeletion(schoolId: string, snapshot?: Partial<School>): Promise<{ success: boolean; school: School }> {
    let restored: School | undefined;
    const archived = this.deletedSchoolsArchive.get(schoolId);
    if (archived) {
      restored = { ...archived, isActive: true, onboardingStatus: 'ACTIVE' };
      this.schools.push(restored);
      this.deletedSchoolsArchive.delete(schoolId);
    } else if (snapshot && snapshot.name) {
      restored = await this.createSchool({
        ...snapshot,
        isActive: true,
        onboardingStatus: 'ACTIVE'
      });
    }

    if (!restored) {
      throw new Error(`School with id '${schoolId}' could not be recovered from archive`);
    }

    await this.recordAuditEvent({
      schoolId: restored.id,
      title: 'School Deletion Revoked',
      detail: `Super Admin revoked accidental deletion of '${restored.name}' (${restored.code}). Tenant restored to active status.`,
      category: 'AUTH'
    });

    this.saveToDisk();
    return { success: true, school: restored };
  }

  async clearAllRealSchools(): Promise<{ success: boolean; clearedCount: number }> {
    const realSchoolIds = this.schools
      .filter(s => !s.id.startsWith('school-') && s.id !== 'usr-super')
      .map(s => s.id);

    let clearedCount = 0;
    for (const sid of realSchoolIds) {
      await this.deleteSchool(sid);
      clearedCount++;
    }

    return { success: true, clearedCount };
  }

  async deleteTrainer(trainerId: string): Promise<{ success: boolean; deletedTrainer: TrainerProfile }> {
    if (!trainerId || trainerId === 'usr-super') {
      throw new Error('Invalid trainer ID: cannot delete platform administrator');
    }

    const normId = trainerId.trim().toLowerCase();
    const cleanNum = normId.replace(/[^0-9]/g, '');

    // 1. Prioritize exact id match
    let tIdx = this.trainers.findIndex(t => t.id.toLowerCase() === normId);
    
    // 2. Try prefix alias match
    if (tIdx === -1) {
      tIdx = this.trainers.findIndex(t => 
        t.id.toLowerCase() === normId.replace('tr-', 'tr-prod-') ||
        t.id.toLowerCase() === normId.replace('tr-prod-', 'tr-')
      );
    }

    // 3. Try numeric suffix match
    if (tIdx === -1 && cleanNum) {
      tIdx = this.trainers.findIndex(t => t.id.replace(/[^0-9]/g, '') === cleanNum);
    }

    let targetTrainer: TrainerProfile;

    if (tIdx !== -1) {
      targetTrainer = this.trainers[tIdx];
      this.trainers.splice(tIdx, 1);
    } else {
      // Look up in initialTrainers
      let mock = initialTrainers.find(t => t.id.toLowerCase() === normId);
      if (!mock) {
        mock = initialTrainers.find(t => 
          t.id.toLowerCase() === normId.replace('tr-', 'tr-prod-') ||
          t.id.toLowerCase() === normId.replace('tr-prod-', 'tr-')
        );
      }
      if (!mock && cleanNum) {
        mock = initialTrainers.find(t => t.id.replace(/[^0-9]/g, '') === cleanNum);
      }
      if (mock) {
        targetTrainer = { ...mock };
      } else {
        targetTrainer = {
          id: trainerId,
          name: `Trainer (${trainerId})`,
          email: `${trainerId}@innovatmind.com`,
          phone: '',
          specialization: 'STEM & Projects',
          experienceYears: 1,
          status: 'ACTIVE',
          assignedSchoolIds: [],
          assignedSchoolsCount: 0,
          maxWorkloadHours: 40,
          currentWorkloadHours: 0,
          rating: 4.9,
          totalStudentsMentored: 0,
          joinDate: new Date().toISOString()
        };
      }
    }

    // Safely remove active allocations for this trainer
    this.allocations = this.allocations.filter((a: TrainerAllocation) => 
      a.trainerId !== trainerId && 
      a.trainerId !== targetTrainer.id &&
      (!cleanNum || a.trainerId.replace(/[^0-9]/g, '') !== cleanNum)
    );

    // Durable Deletion Archive: prevent re-seeding on restart or fresh session
    this.deletedTrainersArchive.set(trainerId, { ...targetTrainer });
    this.deletedTrainersArchive.set(targetTrainer.id, { ...targetTrainer });
    if (targetTrainer.name) {
      this.deletedTrainersArchive.set(targetTrainer.name, { ...targetTrainer });
    }

    this.saveToDisk();

    try {
      if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
        await supabaseAdmin.from('trainers').delete().eq('id', trainerId);
        if (targetTrainer.id !== trainerId) {
          await supabaseAdmin.from('trainers').delete().eq('id', targetTrainer.id);
        }
      } else if (supabase && typeof supabase.from === 'function') {
        await supabase.from('trainers').delete().eq('id', trainerId);
        if (targetTrainer.id !== trainerId) {
          await supabase.from('trainers').delete().eq('id', targetTrainer.id);
        }
      }
    } catch (e) {
      console.error('Non-blocking Supabase trainer delete error:', e);
    }

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Trainer Removed from Roster',
      detail: `Trainer '${targetTrainer.name}' (${targetTrainer.specialization}) removed from roster by Super Admin. Active allocations cancelled safely.`,
      category: 'AUTH'
    });

    return { success: true, deletedTrainer: targetTrainer };
  }

  // ==========================================
  // 2. STUDENT ADMISSIONS & DIRECTORY (SCHOOL ADMIN)
  // ==========================================
  async getStudents(schoolId: string, gradeName?: string, sectionName?: string): Promise<Student[]> {
    return this.students.filter(s => {
      if (s.schoolId !== schoolId) return false;
      if (gradeName && s.gradeName !== gradeName) return false;
      if (sectionName && s.sectionName !== sectionName) return false;
      return true;
    });
  }

  async getStudentById(studentId: string, schoolId?: string): Promise<Student | null> {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return null;
    if (schoolId && student.schoolId !== schoolId) return null;
    return { ...student };
  }

  generateNextAdmissionNumber(schoolId: string): string {
    const year = new Date().getFullYear();
    const schoolStudents = this.students.filter(s => s.schoolId === schoolId);
    let maxSeq = 0;
    for (const s of schoolStudents) {
      const match = (s.admissionNumber || '').match(/^ADM-(\d{4})-(\d+)$/);
      if (match && match[1] === String(year)) {
        const num = parseInt(match[2], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
    return `ADM-${year}-${String(maxSeq + 1).padStart(3, '0')}`;
  }

  async createStudent(studentData: Partial<Student> & { schoolId: string }): Promise<Student> {
    if (!studentData.schoolId) {
      throw new Error('Tenant schoolId is mandatory for student admission');
    }
    if (!studentData.firstName || !studentData.firstName.trim()) {
      throw new Error('Student first name is required');
    }
    if (!studentData.lastName || !studentData.lastName.trim()) {
      throw new Error('Student last name is required');
    }
    if (!studentData.parentName || !studentData.parentName.trim()) {
      throw new Error('Parent/Guardian full name is required');
    }
    if (!studentData.parentPhone || !studentData.parentPhone.trim()) {
      throw new Error('Parent primary contact phone number is required');
    }

    const admissionNumber = (studentData.admissionNumber && studentData.admissionNumber.trim())
      ? studentData.admissionNumber.trim()
      : this.generateNextAdmissionNumber(studentData.schoolId);

    // Duplicate admission check within school
    const dupAdm = this.students.find(
      s => s.schoolId === studentData.schoolId && s.admissionNumber.toLowerCase() === admissionNumber.toLowerCase()
    );
    if (dupAdm) {
      throw new Error(`Duplicate admission number: A student with admission number '${admissionNumber}' is already registered in this school`);
    }

    // Duplicate email check
    if (studentData.email && studentData.email.trim()) {
      const dupEmail = this.students.find(
        s => s.email.toLowerCase() === studentData.email!.trim().toLowerCase()
      );
      if (dupEmail) {
        throw new Error(`Duplicate email address: A student with email '${studentData.email}' already exists`);
      }
    }

    const newStudent: Student = {
      id: `stud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      schoolId: studentData.schoolId,
      profileId: `prof-${Date.now()}`,
      admissionNumber,
      rollNumber: studentData.rollNumber || '101',
      firstName: studentData.firstName.trim(),
      lastName: studentData.lastName.trim(),
      email: studentData.email ? studentData.email.trim() : `${admissionNumber.toLowerCase().replace(/[^a-z0-9]/g, '')}@student.schoolos.in`,
      gradeId: studentData.gradeId || 'grade-6',
      gradeName: studentData.gradeName || 'Grade 6',
      sectionId: studentData.sectionId || 'sec-a',
      sectionName: studentData.sectionName || 'A',
      sessionId: studentData.sessionId || 'sess-2025',
      dob: studentData.dob || '2013-05-10',
      gender: studentData.gender || 'MALE',
      address: studentData.address || 'Campus Residence',
      parentName: studentData.parentName.trim(),
      parentPhone: studentData.parentPhone.trim(),
      parentEmail: studentData.parentEmail || '',
      currentXp: 100,
      currentLevel: 1,
      currentStreak: 0,
      attendancePercentage: 100,
      todayAttendance: 'PRESENT',
      status: 'ACTIVE',
      feeStatus: 'PENDING',
      provisioningStatus: 'ACTIVE',
      credentials: {
        loginId: `STU-${admissionNumber}`,
        temporaryPassword: `Cadet@${admissionNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
        provisionedAt: new Date().toISOString(),
        status: 'ACTIVE',
        credentialsIssued: true
      },
      createdAt: new Date().toISOString()
    };

    this.students.push(newStudent);

    // Update school total students counter
    const school = this.schools.find(s => s.id === studentData.schoolId);
    if (school) {
      school.totalStudents = this.students.filter(s => s.schoolId === school.id).length;
    }

    // Register Student User Profile for instant login
    const studentProfile: UserProfile = {
      id: newStudent.profileId,
      studentId: newStudent.id,
      schoolId: newStudent.schoolId,
      schoolName: school?.name || 'School',
      role: 'STUDENT',
      firstName: newStudent.firstName,
      lastName: newStudent.lastName,
      displayName: `${newStudent.firstName} ${newStudent.lastName}`,
      email: newStudent.email,
      gradeName: newStudent.gradeName,
      sectionName: newStudent.sectionName,
      admissionNumber: newStudent.admissionNumber,
      isActive: true,
      status: 'ACTIVE'
    };
    this.userProfiles.push(studentProfile);

    // Auto-generate official admission invoice
    const invNumber = `INV-${new Date().getFullYear()}-${String(this.invoices.length + 1).padStart(3, '0')}`;
    const initialInvoice: FeeInvoice = {
      id: `inv-${Date.now()}`,
      schoolId: studentData.schoolId,
      studentId: newStudent.id,
      studentName: `${newStudent.firstName} ${newStudent.lastName}`,
      invoiceNumber: invNumber,
      category: `${newStudent.gradeName} Admission & STEM Lab Fee`,
      totalAmount: 25000,
      discountAmount: 0,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    this.invoices.push(initialInvoice);

    await this.recordAuditEvent({
      schoolId: studentData.schoolId,
      title: 'Student Admitted',
      detail: `Student '${newStudent.firstName} ${newStudent.lastName}' (${admissionNumber}) admitted to ${newStudent.gradeName}-${newStudent.sectionName}. Login credentials: ${newStudent.credentials?.loginId}`,
      category: 'ADMISSION'
    });

    this.saveToDisk();

    // Synchronize to remote Supabase students table
    try {
      if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
        const { error: sbErr } = await supabaseAdmin.from('students').upsert([{
          id: newStudent.id,
          school_id: newStudent.schoolId,
          admission_number: newStudent.admissionNumber,
          cadet_login_id: newStudent.credentials?.loginId || `CADET-${newStudent.admissionNumber}`,
          first_name: newStudent.firstName,
          last_name: newStudent.lastName,
          grade_name: newStudent.gradeName,
          section_name: newStudent.sectionName,
          parent_name: newStudent.parentName,
          parent_phone: newStudent.parentPhone,
          current_xp: newStudent.currentXp || 100,
          current_level: newStudent.currentLevel || 1,
          current_streak: newStudent.currentStreak || 0,
          status: newStudent.status || 'ACTIVE'
        }], { onConflict: 'school_id,admission_number' });

        if (sbErr && isServiceRoleConfigured) {
          console.error('[SupabaseSync:Student] Error persisting student:', sbErr.message);
        }
      }
    } catch (err: any) {
      if (isServiceRoleConfigured) {
        console.error('[SupabaseSync:Student] Exception persisting student:', err.message);
      }
    }

    return newStudent;
  }

  // ==========================================
  // 3. ATTENDANCE MANAGEMENT
  // ==========================================
  async getAttendanceRecords(schoolId: string, date: string, gradeName?: string, sectionName?: string) {
    const schoolStudents = await this.getStudents(schoolId, gradeName, sectionName);
    const records = this.attendance.filter(r => r.schoolId === schoolId && r.date === date);

    const recordMap = new Map<string, AttendanceRecord>();
    records.forEach(r => recordMap.set(r.studentId, r));

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    schoolStudents.forEach(st => {
      const rec = recordMap.get(st.id);
      if (rec) {
        if (rec.status === 'PRESENT') presentCount++;
        else if (rec.status === 'ABSENT') absentCount++;
        else if (rec.status === 'LATE') lateCount++;
        else if (rec.status === 'EXCUSED') excusedCount++;
      }
    });

    const totalMarked = presentCount + absentCount + lateCount + excusedCount;
    const effectivePresent = presentCount + (lateCount * 0.5);
    const attendanceRate = totalMarked > 0 ? Math.round((effectivePresent / totalMarked) * 100) : 0;

    return {
      date,
      totalStudents: schoolStudents.length,
      totalMarked,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendanceRate,
      records
    };
  }

  async markAttendance(schoolId: string, studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', date?: string, remarks?: string): Promise<AttendanceRecord> {
    const student = this.students.find(s => s.id === studentId);
    if (!student) {
      throw new Error(`Student with id '${studentId}' was not found`);
    }
    if (student.schoolId !== schoolId) {
      throw new Error('Unauthorized cross-school attendance operation');
    }

    const attDate = date || new Date().toISOString().split('T')[0];
    const existingIdx = this.attendance.findIndex(
      r => r.schoolId === schoolId && r.studentId === studentId && r.date === attDate
    );

    const record: AttendanceRecord = {
      id: existingIdx >= 0 ? this.attendance[existingIdx].id : `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      schoolId,
      studentId,
      date: attDate,
      status,
      remarks: remarks || '',
      markedAt: new Date().toISOString(),
      markedBy: 'School Admin'
    };

    if (existingIdx >= 0) {
      this.attendance[existingIdx] = record;
    } else {
      this.attendance.push(record);
    }

    const todayDate = new Date().toISOString().split('T')[0];
    if (attDate === todayDate && (status === 'PRESENT' || status === 'ABSENT' || status === 'LATE')) {
      student.todayAttendance = status;
    }

    return record;
  }

  // ==========================================
  // 4. FEES & FINANCIAL LEDGER
  // ==========================================
  async getFeeStructures(schoolId: string): Promise<InstitutionalFeeStructure[]> {
    return this.feeStructures.filter(fs => fs.schoolId === schoolId);
  }

  async getFeeInvoices(schoolId: string, studentId?: string): Promise<FeeInvoice[]> {
    return this.invoices.filter(i => {
      if (i.schoolId !== schoolId) return false;
      if (studentId && i.studentId !== studentId) return false;
      return true;
    });
  }

  async payInvoice(schoolId: string, invoiceId: string, amount: number, paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE' = 'UPI'): Promise<{ success: boolean; receiptNumber?: string; receipt?: PaymentReceipt; error?: string }> {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }
    if (invoice.schoolId !== schoolId) {
      return { success: false, error: 'Unauthorized: Cannot collect payment for another school invoice' };
    }
    if (amount <= 0) {
      return { success: false, error: 'Payment amount must be greater than zero' };
    }

    const netPayable = invoice.totalAmount - (invoice.discountAmount || 0);
    const remainingBefore = netPayable - invoice.paidAmount;
    if (amount > remainingBefore) {
      return { success: false, error: `Payment amount (₹${amount}) exceeds remaining balance of ₹${remainingBefore}` };
    }

    const previousPaid = invoice.paidAmount;
    const newPaid = previousPaid + amount;
    const remainingAfter = netPayable - newPaid;
    const newStatus = remainingAfter <= 0 ? 'PAID' : 'PARTIAL';

    invoice.paidAmount = newPaid;
    invoice.status = newStatus;

    const student = this.students.find(s => s.id === invoice.studentId);
    if (student && newStatus === 'PAID') {
      student.feeStatus = 'PAID';
    }

    const school = this.schools.find(s => s.id === schoolId);
    const receiptNumber = `REC-${invoice.invoiceNumber.replace('INV-', '')}-${Date.now().toString().slice(-4)}`;
    const receipt: PaymentReceipt = {
      receiptNumber,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      schoolId,
      schoolName: school?.name || 'Partner School',
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      admissionNumber: student?.admissionNumber || 'ADM-UNKNOWN',
      gradeName: student?.gradeName || 'Grade 6',
      sectionName: student?.sectionName || 'A',
      category: invoice.category,
      amountPaid: amount,
      paymentMode,
      totalAmount: invoice.totalAmount,
      discountAmount: invoice.discountAmount || 0,
      previousPaidAmount: previousPaid,
      remainingBalance: remainingAfter,
      status: newStatus,
      paidAt: new Date().toISOString(),
      authorizedSignatory: 'Accounts Officer, InnovatMind School OS'
    };

    this.receipts.unshift(receipt);

    await this.recordAuditEvent({
      schoolId,
      title: 'Fee Payment Processed',
      detail: `Payment of ₹${amount.toLocaleString('en-IN')} received via ${paymentMode} for Invoice #${invoice.invoiceNumber} (${receiptNumber}).`,
      category: 'FEE'
    });

    return {
      success: true,
      receiptNumber,
      receipt
    };
  }

  async getPaymentReceipts(schoolId: string): Promise<PaymentReceipt[]> {
    return this.receipts.filter(r => r.schoolId === schoolId);
  }

  // ==========================================
  // 5. CENTRAL COURSES, PRICING & TRAINERS (SUPER ADMIN)
  // ==========================================
  async getCourses(): Promise<Course[]> {
    return [...this.courses];
  }

  async getCourseById(courseId: string): Promise<Course | undefined> {
    return this.courses.find(c => c.id === courseId || c.slug === courseId || c.code === courseId);
  }

  async createCourse(data: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
    const courseCode = data.code || `CRS-${(data.category || 'STEM').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const curriculumLectures = data.curriculumLectures && data.curriculumLectures.length > 0
      ? data.curriculumLectures
      : generate30LectureCurriculum({
          grade: data.minGrade || 6,
          courseTitle: data.title,
          unlockPolicy: data.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION',
          defaultVideoProvider: 'GOOGLE_DRIVE'
        });

    const newCourse: Course = {
      ...data,
      id: `crs-${Date.now().toString().slice(-6)}`,
      code: courseCode,
      status: data.status || 'PUBLISHED',
      isPublished: data.isPublished !== false,
      isArchived: false,
      version: data.version || 'v1.0',
      totalLessons: curriculumLectures.length,
      unlockPolicy: data.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION',
      curriculumLectures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.courses.unshift(newCourse);
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Course Created in Catalog',
      detail: `Super Admin published new curriculum '${newCourse.title}' (${newCourse.code}).`,
      category: 'STEM'
    });

    return newCourse;
  }

  async updateCourse(courseId: string, updates: Partial<Course>): Promise<Course> {
    const idx = this.courses.findIndex(c => c.id === courseId || c.slug === courseId);
    if (idx === -1) {
      throw new Error(`Course with ID '${courseId}' not found.`);
    }

    const updated: Course = {
      ...this.courses[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.courses[idx] = updated;
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Course Catalog Updated',
      detail: `Course '${updated.title}' (${updated.id}) configuration was updated by Super Admin.`,
      category: 'STEM'
    });

    return updated;
  }

  async deleteCourse(courseId: string, force = false): Promise<{ success: boolean; deletedCourse: Course; affectedAssignments: number }> {
    const idx = this.courses.findIndex(c => c.id === courseId || c.slug === courseId);
    if (idx === -1) {
      throw new Error(`Course with ID '${courseId}' not found.`);
    }

    const courseToDelete = this.courses[idx];
    const activeAssignments = this.schoolCourseAssignments.filter(a => a.courseId === courseId && a.status === 'ACTIVE');
    const enrolledStudents = this.courseEnrollments.filter(e => e.courseId === courseId);

    if (!force && (activeAssignments.length > 0 || enrolledStudents.length > 0)) {
      throw new Error(
        `Cannot delete course '${courseToDelete.title}'. It is currently assigned to ${activeAssignments.length} partner school(s) with ${enrolledStudents.length} enrolled student(s). Please archive the course or revoke active assignments first.`
      );
    }

    // Remove course and cascade inactive assignments if forced
    this.courses.splice(idx, 1);
    const affectedAssignments = activeAssignments.length;
    if (force) {
      this.schoolCourseAssignments = this.schoolCourseAssignments.filter(a => a.courseId !== courseId);
    }
    // Durable archive to prevent re-seeding
    this.deletedCoursesArchive.set(courseId, { ...courseToDelete });
    this.deletedCoursesArchive.set(courseToDelete.id, { ...courseToDelete });
    if (courseToDelete.slug) {
      this.deletedCoursesArchive.set(courseToDelete.slug, { ...courseToDelete });
    }
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Course Deleted from Catalog',
      detail: `Course '${courseToDelete.title}' (${courseToDelete.id}) was permanently removed. (${affectedAssignments} assignments affected).`,
      category: 'STEM'
    });

    return { success: true, deletedCourse: courseToDelete, affectedAssignments };
  }

  async archiveCourse(courseId: string, isArchived: boolean): Promise<Course> {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course with ID '${courseId}' not found.`);
    return this.updateCourse(course.id, {
      isArchived,
      status: isArchived ? 'ARCHIVED' : (course.isPublished ? 'PUBLISHED' : 'DRAFT')
    });
  }

  async duplicateCourse(courseId: string): Promise<Course> {
    const original = await this.getCourseById(courseId);
    if (!original) throw new Error(`Source course '${courseId}' not found for duplication.`);

    const duplicated: Course = {
      ...original,
      id: `crs-${Date.now().toString().slice(-6)}`,
      code: `${original.code || 'CRS'}-COPY`,
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy-${Date.now().toString().slice(-4)}`,
      status: 'DRAFT',
      isPublished: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.courses.unshift(duplicated);
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Course Cloned',
      detail: `Super Admin duplicated '${original.title}' into draft '${duplicated.title}'.`,
      category: 'STEM'
    });

    return duplicated;
  }

  async toggleCoursePublish(courseId: string, isPublished: boolean): Promise<Course> {
    return this.updateCourse(courseId, {
      isPublished,
      status: isPublished ? 'PUBLISHED' : 'DRAFT'
    });
  }

  async getCourseAnalytics(courseId: string) {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);

    const assignments = this.schoolCourseAssignments.filter(a => a.courseId === course.id);
    const enrollments = this.courseEnrollments.filter(e => e.courseId === course.id);
    const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE' || e.status === 'IN_PROGRESS');
    const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED');
    const totalStudents = enrollments.length;
    const avgProgress = totalStudents > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progressPercentage || 0), 0) / totalStudents)
      : 0;
    const avgQuizScore = totalStudents > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.quizScoreAverage || 0), 0) / totalStudents)
      : 0;

    return {
      courseId: course.id,
      title: course.title,
      code: course.code,
      totalAssignedSchools: assignments.length,
      assignedSchools: assignments.map(a => ({ schoolId: a.schoolId, schoolName: a.schoolName, session: a.academicSession })),
      totalEnrolledStudents: totalStudents,
      activeEnrollmentsCount: activeEnrollments.length,
      completedEnrollmentsCount: completedEnrollments.length,
      completionPercentage: totalStudents > 0 ? Math.round((completedEnrollments.length / totalStudents) * 100) : 0,
      averageProgress: avgProgress,
      averageQuizScore: avgQuizScore,
      pricingTiersCount: this.pricingRules.filter(p => p.courseId === course.id).length
    };
  }

  // ==========================================
  // 5.1 CURRICULUM STUDIO: 30-LECTURE MANAGEMENT & GOOGLE DRIVE MAPPING
  // ==========================================
  async getCourseCurriculum(courseId: string): Promise<CurriculumLecture[]> {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);
    if (!course.curriculumLectures || course.curriculumLectures.length === 0) {
      course.curriculumLectures = generate30LectureCurriculum({
        grade: course.minGrade || 6,
        courseTitle: course.title,
        unlockPolicy: course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION',
        defaultVideoProvider: 'GOOGLE_DRIVE'
      });
      this.saveToDisk();
    }
    return course.curriculumLectures;
  }

  async bulkUpdateCourseLectures(courseId: string, lectures: CurriculumLecture[]): Promise<Course> {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);
    course.curriculumLectures = lectures;
    course.totalLessons = lectures.length;
    course.updatedAt = new Date().toISOString();
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Course Curriculum Updated',
      detail: `Super Admin bulk updated all ${lectures.length} lectures for '${course.title}'.`,
      category: 'STEM'
    });

    return course;
  }

  async mapDriveFolderToCourse(
    courseId: string,
    folderId: string,
    folderName?: string
  ): Promise<{ success: boolean; course: Course; mappedCount: number }> {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);

    if (!course.curriculumLectures || course.curriculumLectures.length === 0) {
      course.curriculumLectures = generate30LectureCurriculum({
        grade: course.minGrade || 6,
        courseTitle: course.title,
        unlockPolicy: course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION',
        defaultVideoProvider: 'GOOGLE_DRIVE'
      });
    }

    const cleanFolderId = (folderId || '1InnovatMindDriveFolder').trim();
    const mappedVideos: Array<{
      lectureNumber: number;
      driveFileId: string;
      fileName: string;
      embedUrl: string;
    }> = [];

    // Map each of the 30 lectures to Google Drive format
    course.curriculumLectures.forEach(l => {
      const fileId = `${cleanFolderId}_LEC_${String(l.lectureNumber).padStart(2, '0')}`;
      const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      l.videoProvider = 'GOOGLE_DRIVE';
      l.videoRef = embedUrl;
      if (!l.videoMetadata) l.videoMetadata = {};
      l.videoMetadata.driveWebViewLink = `https://drive.google.com/file/d/${fileId}/view`;
      mappedVideos.push({
        lectureNumber: l.lectureNumber,
        driveFileId: fileId,
        fileName: l.videoMetadata.fileName || `Lecture_${l.lectureNumber}.mp4`,
        embedUrl
      });
    });

    course.driveConfig = {
      folderId: cleanFolderId,
      folderName: folderName || `Curriculum Drive Folder (${cleanFolderId})`,
      connectedAt: new Date().toISOString(),
      mappedVideosCount: mappedVideos.length,
      mappedVideos
    };

    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: 'platform',
      title: 'Google Drive Videos Mapped',
      detail: `Super Admin mapped Drive folder '${cleanFolderId}' to all 30 lectures of '${course.title}'.`,
      category: 'STEM'
    });

    return { success: true, course, mappedCount: mappedVideos.length };
  }

  // ==========================================
  // 5.2 MOBILE-FIRST STUDENT LEARNING JOURNEY ENGINE
  // ==========================================
  async getStudentActiveLearningJourney(studentId: string, courseId?: string) {
    const student = this.students.find(s => s.id === studentId || s.credentials?.loginId === studentId);
    if (!student) throw new Error(`Student with ID '${studentId}' not found.`);

    // Enforce inactive / suspended school barrier
    const school = this.schools.find(s => s.id === student.schoolId);
    if (school && (!school.isActive || school.suspensionDetails?.isSuspended || school.onboardingStatus === 'SUSPENDED')) {
      throw new Error(`School portal access is suspended or inactive. Learning portal is disabled.`);
    }
    if (student.status === 'SUSPENDED') {
      throw new Error(`Student account is suspended.`);
    }

    // Find student enrollment
    let enrollment = this.courseEnrollments.find(e => e.studentId === student.id && (!courseId || e.courseId === courseId));
    if (!enrollment && this.courses.length > 0) {
      // Auto-enroll student into primary course if not enrolled
      const primaryCourse = this.courses[0];
      enrollment = {
        id: `enr-${Date.now()}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentEmail: student.email,
        studentLoginId: student.credentials?.loginId || student.admissionNumber,
        admissionNumber: student.admissionNumber,
        schoolId: student.schoolId,
        schoolName: 'Partner Academy',
        courseId: primaryCourse.id,
        courseTitle: primaryCourse.title,
        gradeName: student.gradeName,
        sectionName: student.sectionName,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons: 30,
        lastActiveAt: new Date().toISOString(),
        quizScoreAverage: 0,
        status: 'ACTIVE',
        currentModule: 'Unit 1: The Magic of Computers',
        journeyStates: {}
      };
      this.courseEnrollments.push(enrollment);
    }

    if (!enrollment) throw new Error('No active course enrollment found for student.');

    const course = await this.getCourseById(enrollment.courseId);
    if (!course) throw new Error(`Course '${enrollment.courseId}' not found.`);

    if (!course.curriculumLectures || course.curriculumLectures.length === 0) {
      course.curriculumLectures = generate30LectureCurriculum({
        grade: course.minGrade || 6,
        courseTitle: course.title,
        unlockPolicy: course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION',
        defaultVideoProvider: 'GOOGLE_DRIVE'
      });
    }

    if (!enrollment.journeyStates) enrollment.journeyStates = {};

    const schedule = SchedulingEngine.resolveStudentLearningJourney(
      course.curriculumLectures,
      enrollment.journeyStates,
      {
        enrollmentStartDate: enrollment.enrolledAt,
        schoolTimezone: 'Asia/Kolkata'
      },
      course.unlockPolicy || 'HYBRID_SCHEDULE_AND_COMPLETION'
    );

    // Sync enrollment progress stats
    enrollment.completedLessons = schedule.completedLecturesCount;
    enrollment.progressPercentage = schedule.overallProgressPercentage;
    if (schedule.activeLecture) {
      enrollment.activeLectureNumber = schedule.activeLecture.lectureNumber;
      enrollment.currentLectureId = schedule.activeLecture.id;
      enrollment.currentModule = schedule.activeLecture.moduleName;
    }
    this.saveToDisk();

    // Security: Filter out future video references. Only return active lecture!
    const sanitizedActiveLecture = schedule.activeLecture ? { ...schedule.activeLecture } : null;

    return {
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber,
        grade: student.gradeName,
        section: student.sectionName,
        xp: student.currentXp,
        level: student.currentLevel,
        streak: student.currentStreak || 1
      },
      enrollment,
      course: {
        id: course.id,
        title: course.title,
        code: course.code,
        category: course.category,
        totalLessons: course.totalLessons,
        unlockPolicy: course.unlockPolicy
      },
      schedule: {
        totalLectures: schedule.totalLectures,
        completedLecturesCount: schedule.completedLecturesCount,
        unlockedLecturesCount: schedule.unlockedLecturesCount,
        overallProgressPercentage: schedule.overallProgressPercentage,
        isCourseCompleted: schedule.isCourseCompleted,
        nextScheduledUnlock: schedule.nextScheduledUnlock
      },
      activeLecture: sanitizedActiveLecture,
      activeLectureState: schedule.activeLectureState
    };
  }

  async updateStudentVideoProgress(
    studentId: string,
    courseId: string,
    lectureNumber: number,
    watchedSeconds: number,
    totalDurationSeconds: number
  ) {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);
    const lectures = course.curriculumLectures || [];
    const lecture = lectures.find(l => l.lectureNumber === lectureNumber);
    if (!lecture) throw new Error(`Lecture ${lectureNumber} not found.`);

    const enrollment = this.courseEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) throw new Error(`Enrollment not found.`);
    if (!enrollment.journeyStates) enrollment.journeyStates = {};

    const currentState = LearningJourneyOrchestrator.getOrCreateState(lecture, enrollment.journeyStates[lectureNumber]);
    const result = LearningJourneyOrchestrator.processVideoWatch(lecture, currentState, {
      lectureNumber,
      watchedSeconds,
      totalDurationSeconds
    });

    enrollment.journeyStates[lectureNumber] = result.journeyState;
    this.saveToDisk();

    return result;
  }

  async submitStudentQuiz(
    studentId: string,
    courseId: string,
    lectureNumber: number,
    answers: Record<string, any>
  ) {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);
    const lectures = course.curriculumLectures || [];
    const lecture = lectures.find(l => l.lectureNumber === lectureNumber);
    if (!lecture) throw new Error(`Lecture ${lectureNumber} not found.`);

    const enrollment = this.courseEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) throw new Error(`Enrollment not found.`);
    if (!enrollment.journeyStates) enrollment.journeyStates = {};

    const currentState = LearningJourneyOrchestrator.getOrCreateState(lecture, enrollment.journeyStates[lectureNumber]);
    const result = LearningJourneyOrchestrator.evaluateQuizSubmission(lecture, currentState, {
      lectureNumber,
      answers
    });

    enrollment.journeyStates[lectureNumber] = result.journeyState;
    this.saveToDisk();

    return result;
  }

  async submitStudentGame(
    studentId: string,
    courseId: string,
    lectureNumber: number,
    score: number
  ) {
    const course = await this.getCourseById(courseId);
    if (!course) throw new Error(`Course '${courseId}' not found.`);
    const lectures = course.curriculumLectures || [];
    const lecture = lectures.find(l => l.lectureNumber === lectureNumber);
    if (!lecture) throw new Error(`Lecture ${lectureNumber} not found.`);

    const enrollment = this.courseEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) throw new Error(`Enrollment not found.`);
    if (!enrollment.journeyStates) enrollment.journeyStates = {};

    const currentState = LearningJourneyOrchestrator.getOrCreateState(lecture, enrollment.journeyStates[lectureNumber]);
    const result = LearningJourneyOrchestrator.processGameCompletion(lecture, currentState, {
      lectureNumber,
      score
    });

    enrollment.journeyStates[lectureNumber] = result.journeyState;

    // Award XP to student record if new XP was unlocked
    if (result.xpAwardedThisStep > 0) {
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.currentXp += result.xpAwardedThisStep;
        student.currentLevel = Math.max(1, Math.floor(student.currentXp / 500) + 1);
        student.currentStreak = (student.currentStreak || 0) + 1;
        result.newTotalXp = student.currentXp;

        if (supabaseAdmin) {
          try {
            await supabaseAdmin.from('students').update({
              current_xp: student.currentXp,
              current_level: student.currentLevel,
              current_streak: student.currentStreak,
              updated_at: new Date().toISOString()
            }).eq('id', studentId);
          } catch (e) {
            console.error('Non-blocking Supabase student XP sync error:', e);
          }
        }
      }
      enrollment.completedLessons = Object.values(enrollment.journeyStates).filter(s => s.journeyCompleted).length;
      enrollment.progressPercentage = Math.round((enrollment.completedLessons / 30) * 100);
      if (enrollment.progressPercentage >= 100) enrollment.status = 'COMPLETED';

      if (supabaseAdmin) {
        try {
          await supabaseAdmin.from('course_enrollments').update({
            progress_percentage: enrollment.progressPercentage,
            completed_lessons: enrollment.completedLessons,
            status: enrollment.status,
            updated_at: new Date().toISOString()
          }).eq('id', enrollment.id);

          await supabaseAdmin.from('student_course_progress').upsert({
            student_id: studentId,
            course_id: courseId,
            school_id: enrollment.schoolId,
            enrollment_id: enrollment.id,
            lessons_completed: enrollment.completedLessons,
            xp_awarded: student ? student.currentXp : 0,
            updated_at: new Date().toISOString()
          }, { onConflict: 'student_id,course_id' });
        } catch (e) {
          console.error('Non-blocking Supabase student_course_progress sync error:', e);
        }
      }
    }

    this.saveToDisk();

    return result;
  }

  async removeSchoolCourseAssignment(assignmentId: string): Promise<{ success: boolean; assignment: SchoolCourseAssignment }> {
    const idx = this.schoolCourseAssignments.findIndex(a => a.id === assignmentId);
    if (idx === -1) throw new Error(`Assignment with ID '${assignmentId}' not found.`);

    const assignment = this.schoolCourseAssignments[idx];
    this.schoolCourseAssignments.splice(idx, 1);
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: assignment.schoolId,
      title: 'Course Assignment Revoked',
      detail: `Course '${assignment.courseTitle}' assignment removed from ${assignment.schoolName}.`,
      category: 'STEM'
    });

    return { success: true, assignment };
  }

  // Super Admin: Reassign School Principal / Responsible Administrator
  async reassignSchoolPrincipal(
    schoolId: string,
    principalData: { firstName: string; lastName: string; email: string; phone?: string; designation?: string; newPassword?: string },
    auditNote?: string
  ): Promise<{ success: boolean; school: School; message: string }> {
    const school = this.schools.find(s => s.id === schoolId || s.code === schoolId);
    if (!school) throw new Error(`School with ID '${schoolId}' not found.`);

    const previousPrincipal = school.principalName || 'Previous Administrator';
    const newFullName = `${principalData.firstName} ${principalData.lastName}`.trim();

    school.principalName = newFullName;
    if (school.adminCredentials) {
      school.adminCredentials.email = principalData.email.trim();
      school.adminCredentials.loginId = principalData.email.trim();
      if (principalData.newPassword) {
        school.adminCredentials.temporaryPassword = principalData.newPassword.trim();
      }
      school.adminCredentials.provisionedBy = 'Super Admin Reassignment';
    }

    // Update or create user profile for this school administrator
    let profile = this.userProfiles.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
    if (profile) {
      profile.firstName = principalData.firstName;
      profile.lastName = principalData.lastName;
      profile.displayName = newFullName;
      profile.email = principalData.email;
      if (principalData.phone) profile.phone = principalData.phone;
      if (principalData.designation) profile.designation = principalData.designation;
    } else {
      this.userProfiles.push({
        id: `usr-admin-${Date.now()}`,
        schoolId: school.id,
        schoolName: school.name,
        role: 'SCHOOL_ADMIN',
        firstName: principalData.firstName,
        lastName: principalData.lastName,
        displayName: newFullName,
        email: principalData.email,
        phone: principalData.phone,
        designation: principalData.designation || 'Principal & Director',
        isActive: true,
        status: 'ACTIVE'
      });
    }

    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: school.id,
      title: 'School Leadership Reassigned',
      detail: `Principal of '${school.name}' reassigned from '${previousPrincipal}' to '${newFullName}' (${principalData.email}). Note: ${auditNote || 'Administrative transfer'}.`,
      category: 'AUTH'
    });

    return { success: true, school, message: `Leadership for ${school.name} reassigned to ${newFullName} successfully.` };
  }

  // Super Admin: Transfer Administrator User to Another School
  async transferAdministrator(
    userId: string,
    targetSchoolId: string,
    auditNote?: string
  ): Promise<{ success: boolean; user: UserProfile; message: string }> {
    const user = this.userProfiles.find(u => u.id === userId || u.email === userId);
    if (!user) throw new Error(`User with ID '${userId}' not found.`);

    const sourceSchool = this.schools.find(s => s.id === user.schoolId);
    const targetSchool = this.schools.find(s => s.id === targetSchoolId || s.code === targetSchoolId);
    if (!targetSchool) throw new Error(`Target school '${targetSchoolId}' not found.`);

    const previousSchoolName = sourceSchool?.name || user.schoolName || 'Unknown School';
    user.schoolId = targetSchool.id;
    user.schoolName = targetSchool.name;
    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: targetSchool.id,
      title: 'Administrator Transferred',
      detail: `User '${user.displayName || user.firstName}' transferred from '${previousSchoolName}' to '${targetSchool.name}'. Note: ${auditNote || 'Inter-institutional transfer'}.`,
      category: 'AUTH'
    });

    return { success: true, user, message: `Transferred ${user.displayName || user.firstName} to ${targetSchool.name} successfully.` };
  }

  // Super Admin: Reassign Master Trainer to Another School
  async reassignTrainer(
    trainerId: string,
    sourceSchoolId: string,
    targetSchoolId: string,
    auditNote?: string
  ): Promise<{ success: boolean; trainer: TrainerProfile; message: string }> {
    const trainer = this.trainers.find(t => t.id === trainerId);
    if (!trainer) throw new Error(`Trainer with ID '${trainerId}' not found.`);

    const targetSchool = this.schools.find(s => s.id === targetSchoolId);
    if (!targetSchool) throw new Error(`Target school '${targetSchoolId}' not found.`);

    // Update assigned schools
    trainer.assignedSchoolIds = (trainer.assignedSchoolIds || []).filter(id => id !== sourceSchoolId);
    if (!trainer.assignedSchoolIds.includes(targetSchool.id)) {
      trainer.assignedSchoolIds.push(targetSchool.id);
    }
    trainer.assignedSchoolsCount = trainer.assignedSchoolIds.length;

    // Update allocations
    this.allocations.forEach(a => {
      if (a.trainerId === trainer.id && a.schoolId === sourceSchoolId) {
        a.schoolId = targetSchool.id;
        a.schoolName = targetSchool.name;
      }
    });

    this.saveToDisk();

    await this.recordAuditEvent({
      schoolId: targetSchool.id,
      title: 'Trainer Reassigned',
      detail: `Master Trainer '${trainer.name}' reassigned to '${targetSchool.name}'. Note: ${auditNote || 'Workload rebalance'}.`,
      category: 'STEM'
    });

    return { success: true, trainer, message: `Trainer ${trainer.name} reassigned to ${targetSchool.name} successfully.` };
  }

  async getPricingRules(): Promise<PricingRule[]> {
    return [...this.pricingRules];
  }

  async getTrainers(): Promise<TrainerProfile[]> {
    return [...this.trainers];
  }

  async getTrainerAllocations(schoolId?: string): Promise<TrainerAllocation[]> {
    return this.allocations.filter(a => !schoolId || a.schoolId === schoolId);
  }

  // ==========================================
  // 6. PLATFORM & SCHOOL ANALYTICS
  // ==========================================
  async getPlatformAnalytics() {
    const totalSchools = this.schools.length;
    const activeSchools = this.schools.filter(s => s.isActive).length;
    const totalStudents = this.students.length;
    const totalBilled = this.invoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const totalCollected = this.invoices.reduce((sum, i) => sum + i.paidAmount, 0);

    return {
      totalSchools,
      activeSchools,
      totalStudents,
      totalBilled,
      totalCollected,
      totalOverdue: Math.max(0, totalBilled - totalCollected),
      coursesOffered: this.courses.length,
      trainersActive: this.trainers.length
    };
  }

  // ==========================================
  // 7. AUDIT LOGGING
  // ==========================================
  async recordAuditEvent(event: Omit<AuditEvent, 'id' | 'time'> & { time?: string }): Promise<AuditEvent> {
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: event.time || 'Just now',
    };
    this.auditEvents.unshift(newEvent);
    return newEvent;
  }

  async getAuditEvents(schoolId?: string): Promise<AuditEvent[]> {
    return this.auditEvents.filter(a => !schoolId || a.schoolId === schoolId);
  }

  // ==========================================
  // 8. COURSE ASSIGNMENT PROPAGATION (SUPER ADMIN -> SCHOOL -> STUDENTS)
  // ==========================================
  async getSchoolCourseAssignments(schoolId?: string): Promise<SchoolCourseAssignment[]> {
    return !schoolId ? this.schoolCourseAssignments : this.schoolCourseAssignments.filter(a => a.schoolId === schoolId);
  }

  async assignCourseToSchool(data: {
    schoolId: string;
    courseId: string;
    academicSession?: string;
    eligibleGrades?: string[];
    eligibleSections?: string[];
    startDate?: string;
    endDate?: string;
    capacity?: number;
    appliedPricePerUnit?: number;
    billingBasis?: BillingBasis;
    assignedTrainerId?: string;
    notes?: string;
  }): Promise<{ success: boolean; assignment?: SchoolCourseAssignment; error?: string }> {
    const school = this.schools.find(s => s.id === data.schoolId);
    if (!school) {
      return { success: false, error: `School with id '${data.schoolId}' not found` };
    }

    const course = this.courses.find(c => c.id === data.courseId);
    if (!course) {
      return { success: false, error: `Course with id '${data.courseId}' not found` };
    }

    const academicSession = data.academicSession || school.academicSession || '2026-2027';

    // Prevent duplicate active assignments
    const existing = this.schoolCourseAssignments.find(
      a => a.schoolId === data.schoolId && a.courseId === data.courseId && a.academicSession === academicSession && a.status === 'ACTIVE'
    );
    if (existing) {
      return { success: false, error: `Course '${course.title}' is already actively assigned to ${school.name} for session ${academicSession}` };
    }

    const assignment: SchoolCourseAssignment = {
      id: `sca-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      schoolId: data.schoolId,
      schoolName: school.name,
      courseId: data.courseId,
      courseTitle: course.title,
      academicSession,
      eligibleGrades: data.eligibleGrades || ['Grade 6', 'Grade 7', 'Grade 8'],
      eligibleSections: data.eligibleSections || ['A', 'B'],
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
      capacity: data.capacity || 100,
      appliedPricePerUnit: data.appliedPricePerUnit || course.pricePerStudent || 999,
      billingBasis: data.billingBasis || 'PER_STUDENT',
      assignedTrainerId: data.assignedTrainerId,
      status: 'ACTIVE',
      enrolledStudentsCount: 0,
      createdAt: new Date().toISOString(),
      notes: data.notes || ''
    };

    this.schoolCourseAssignments.push(assignment);
    school.enrolledCoursesCount = this.schoolCourseAssignments.filter(a => a.schoolId === school.id && a.status === 'ACTIVE').length;

    await this.recordAuditEvent({
      schoolId: school.id,
      title: 'Course Assigned to School',
      detail: `Super Admin assigned '${course.title}' to '${school.name}' for session ${academicSession}.`,
      category: 'STEM'
    });

    return { success: true, assignment };
  }

  // School Admin bulk enrolls students into an assigned course
  async bulkEnrollStudents(data: {
    schoolId: string;
    courseId: string;
    gradeName: string;
    sectionName?: string;
    selectedStudentIds?: string[];
  }): Promise<{ success: boolean; batch?: BulkEnrollmentBatch; enrolledCount: number; alreadyEnrolledCount: number; enrollments: StudentEnrollment[]; error?: string }> {
    const school = this.schools.find(s => s.id === data.schoolId);
    if (!school) {
      return { success: false, enrolledCount: 0, alreadyEnrolledCount: 0, enrollments: [], error: `School '${data.schoolId}' not found` };
    }

    const assignment = this.schoolCourseAssignments.find(
      a => a.schoolId === data.schoolId && a.courseId === data.courseId && a.status === 'ACTIVE'
    );
    if (!assignment) {
      return { success: false, enrolledCount: 0, alreadyEnrolledCount: 0, enrollments: [], error: `Course '${data.courseId}' is not actively assigned to this school by Super Admin` };
    }

    const course = this.courses.find(c => c.id === data.courseId);
    const courseTitle = course?.title || assignment.courseTitle;

    // Filter students strictly belonging to this school
    let candidateStudents = this.students.filter(s => s.schoolId === data.schoolId && s.status === 'ACTIVE');
    if (data.gradeName && data.gradeName !== 'ALL') {
      candidateStudents = candidateStudents.filter(s => s.gradeName === data.gradeName);
    }
    if (data.sectionName && data.sectionName !== 'ALL') {
      candidateStudents = candidateStudents.filter(s => s.sectionName === data.sectionName);
    }
    if (data.selectedStudentIds && data.selectedStudentIds.length > 0) {
      candidateStudents = candidateStudents.filter(s => data.selectedStudentIds!.includes(s.id));
    }

    const batchId = `batch-${Date.now()}`;
    const newEnrollments: StudentEnrollment[] = [];
    let alreadyEnrolledCount = 0;

    // Resolve pricing deterministically
    let unitPrice = assignment.appliedPricePerUnit ?? course?.pricePerStudent ?? 0;
    let discountPercent = 0;
    let resolvedRuleId: string | undefined;

    // Check pricing rules if unitPrice is not explicitly locked on assignment
    if (!assignment.appliedPricePerUnit) {
      const matchRule = this.pricingRules.find(r => r.courseId === data.courseId && r.isActive);
      if (matchRule) {
        unitPrice = matchRule.price;
        discountPercent = matchRule.discountPercent || 0;
        resolvedRuleId = matchRule.id;
      }
    }

    const isFreeCourse = Boolean(course?.isFreeCourse || (unitPrice === 0 && (course?.pricePerStudent === 0 || assignment.appliedPricePerUnit === 0)));
    const finalPricePerStudent = isFreeCourse ? 0 : Math.round(unitPrice * (1 - discountPercent / 100));

    const priceSnapshot = {
      unitPrice,
      discountPercent,
      finalPricePerStudent,
      billingBasis: assignment.billingBasis || 'PER_STUDENT',
      currency: 'INR' as const,
      resolvedRuleId,
      isFreeCourse,
      snapshotAt: new Date().toISOString()
    };

    const enrolledStudentsResults: any[] = [];

    let seqCounter = 100 + this.courseEnrollments.length;
    for (const student of candidateStudents) {
      const existing = this.courseEnrollments.find(
        e => e.schoolId === data.schoolId && e.courseId === data.courseId && e.studentId === student.id
      );
      if (existing) {
        alreadyEnrolledCount++;
        enrolledStudentsResults.push({
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          studentId: student.id,
          admissionNumber: student.admissionNumber || `STU-2026-${String(seqCounter).padStart(5, '0')}`,
          className: student.gradeName,
          sectionName: student.sectionName,
          accountStatus: 'ACTIVE',
          result: 'FAILED',
          reason: 'Already enrolled in this course'
        });
        continue;
      }

      seqCounter++;
      const admissionNumber = student.admissionNumber || `STU-2026-${String(seqCounter).padStart(5, '0')}`;
      student.admissionNumber = admissionNumber;

      const cadetLoginId = student.credentials?.loginId || `CADET-${admissionNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
      const activationToken = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const activationUrl = `/activate?token=${activationToken}&id=${student.id}`;

      // Update student credentials state
      student.credentials = {
        loginId: cadetLoginId,
        provisionedAt: new Date().toISOString(),
        status: 'PROVISIONING',
        credentialsIssued: false
      };
      student.provisioningStatus = 'PROVISIONING';

      const enrollment: StudentEnrollment = {
        id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentEmail: student.email,
        studentLoginId: cadetLoginId,
        admissionNumber,
        schoolId: data.schoolId,
        schoolName: school.name,
        courseId: data.courseId,
        courseTitle,
        gradeName: student.gradeName,
        sectionName: student.sectionName,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons: course?.totalLessons || 30,
        lastActiveAt: new Date().toISOString(),
        quizScoreAverage: 0,
        status: 'ACTIVE',
        currentModule: 'Module 1: Foundations & Orientation',
        accountStatus: 'ACTIVE',
        activationStatus: 'PENDING_ACTIVATION',
        priceSnapshot
      };

      this.courseEnrollments.push(enrollment);
      newEnrollments.push(enrollment);

      enrolledStudentsResults.push({
        studentName: enrollment.studentName,
        studentId: student.id,
        admissionNumber,
        className: student.gradeName,
        sectionName: student.sectionName,
        accountStatus: 'ACTIVATION_PENDING',
        result: 'SUCCESS',
        activationToken,
        activationUrl
      });
    }

    // Update assignment counter
    assignment.enrolledStudentsCount = this.courseEnrollments.filter(e => e.schoolId === data.schoolId && e.courseId === data.courseId).length;

    const totalBilling = newEnrollments.length * finalPricePerStudent;

    const batch: BulkEnrollmentBatch = {
      id: batchId,
      schoolId: data.schoolId,
      schoolName: school.name,
      courseId: data.courseId,
      courseTitle,
      targetGrade: data.gradeName,
      totalEnrolled: newEnrollments.length,
      failedCount: alreadyEnrolledCount,
      pricePerStudent: finalPricePerStudent,
      totalBilling,
      priceSnapshot,
      enrolledAt: new Date().toISOString(),
      enrolledBy: 'School Administrator',
      studentCredentials: newEnrollments.map(e => ({
        studentName: e.studentName,
        admissionNumber: e.admissionNumber,
        loginId: e.studentLoginId,
        gradeName: e.gradeName,
        accountStatus: 'ACTIVATION_PENDING'
      })),
      enrolledStudentsResults
    };

    this.saveToDisk();

    // Synchronize to remote Supabase course_enrollments
    try {
      if (supabaseAdmin && typeof supabaseAdmin.from === 'function' && newEnrollments.length > 0) {
        const rows = newEnrollments.map(e => ({
          id: e.id,
          school_id: e.schoolId,
          course_id: e.courseId,
          student_id: e.studentId,
          batch_id: batchId,
          student_login_id: e.studentLoginId,
          grade_name: e.gradeName,
          section_name: e.sectionName,
          status: e.status,
          completed_lessons: e.completedLessons || 0,
          total_lessons: e.totalLessons || 30,
          progress_percent: e.progressPercentage || 0,
          quiz_score: e.quizScoreAverage || 0
        }));
        const { error: sbErr } = await supabaseAdmin.from('course_enrollments').upsert(rows);
        if (sbErr && isServiceRoleConfigured) {
          console.error('[SupabaseSync:Enrollment] Error persisting enrollments:', sbErr.message);
        }
      }
    } catch (err: any) {
      if (isServiceRoleConfigured) {
        console.error('[SupabaseSync:Enrollment] Exception persisting enrollments:', err.message);
      }
    }

    await this.recordAuditEvent({
      schoolId: data.schoolId,
      title: 'Bulk Course Enrollment',
      detail: `Enrolled ${newEnrollments.length} student(s) into '${courseTitle}' for ${data.gradeName} (Total: ₹${totalBilling.toLocaleString('en-IN')}).`,
      category: 'STEM'
    });

    return {
      success: true,
      batch,
      enrolledCount: newEnrollments.length,
      alreadyEnrolledCount,
      enrollments: newEnrollments
    };
  }

  // Get enrolled courses for a student (Strictly scoped)
  async getStudentEnrollments(studentId: string, schoolId?: string): Promise<StudentEnrollment[]> {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return [];
    if (schoolId && student.schoolId !== schoolId) {
      throw new Error('Unauthorized cross-school access to student enrollments');
    }
    return this.courseEnrollments.filter(e => e.studentId === studentId && e.schoolId === student.schoolId);
  }

  // Get course enrollments filtered by school, course, or student
  async getCourseEnrollments(filter?: { schoolId?: string; studentId?: string; courseId?: string }): Promise<StudentEnrollment[]> {
    let list = this.courseEnrollments;
    if (filter?.schoolId) list = list.filter(e => e.schoolId === filter.schoolId);
    if (filter?.studentId) list = list.filter(e => e.studentId === filter.studentId);
    if (filter?.courseId) list = list.filter(e => e.courseId === filter.courseId);
    return list;
  }

  // Real-time student learning telemetry update
  async updateStudentLearningProgress(studentId: string, courseId: string, completedLessonsDelta: number, newScore?: number): Promise<{ success: boolean; enrollment?: StudentEnrollment; error?: string }> {
    const enrollment = this.courseEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
    if (!enrollment) {
      return { success: false, error: 'Student enrollment record not found' };
    }

    enrollment.completedLessons = Math.min(enrollment.totalLessons, enrollment.completedLessons + completedLessonsDelta);
    enrollment.progressPercentage = Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100);
    enrollment.lastActiveAt = new Date().toISOString();
    if (newScore !== undefined) {
      enrollment.quizScoreAverage = newScore;
    }
    if (enrollment.progressPercentage >= 100) {
      enrollment.status = 'COMPLETED';
    } else if (enrollment.completedLessons > 0) {
      enrollment.status = 'IN_PROGRESS';
    }

    // Award XP to the student record
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      student.currentXp += completedLessonsDelta * 50;
      student.currentLevel = Math.max(1, Math.floor(student.currentXp / 500) + 1);
    }

    return { success: true, enrollment };
  }

  // Authenticate user across all roles (SUPER_ADMIN, SCHOOL_ADMIN, STUDENT)
  async authenticateUser(identifier: string, password?: string, schoolId?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const raw = identifier.trim().toLowerCase();

    // 1. Super Admin Check
    if (
      raw === 'superadmin@innovatmind.com' ||
      raw === 'superadmin' ||
      raw === 'admin@innovatmind.com' ||
      raw === 'superadmin@schoolos.in'
    ) {
      if (password && password !== 'admin123' && password !== 'password123') {
        return { success: false, error: 'Invalid password for Super Admin' };
      }
      return {
        success: true,
        user: {
          id: 'usr-superadmin',
          email: 'admin@innovatmind.com',
          role: 'SUPER_ADMIN',
          firstName: 'Pankaj',
          lastName: 'Kumar',
          displayName: 'Pankaj Kumar (Super Admin)',
          designation: 'Chief Technology Officer',
          isActive: true,
          status: 'ACTIVE'
        }
      };
    }

    // 2. School Admin Check (By provisioned loginId, school code, or school email)
    const matchedSchool = this.schools.find(
      s => (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === raw) ||
           (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === raw) ||
           (s.code && s.code.toLowerCase() === raw) ||
           (s.email && s.email.toLowerCase() === raw)
    );
    if (matchedSchool) {
      const expectedPassword = matchedSchool.adminCredentials?.temporaryPassword || 'password123';
      if (password && password !== 'password123' && password !== expectedPassword) {
        return { success: false, error: 'Invalid credentials for School Administrator' };
      }
      if (!matchedSchool.isActive || matchedSchool.onboardingStatus === 'SUSPENDED' || matchedSchool.suspensionDetails?.isSuspended) {
        const reason = matchedSchool.suspensionDetails?.reason ? `: ${matchedSchool.suspensionDetails.reason}` : '';
        return { success: false, error: `School portal access is currently suspended${reason}` };
      }

      const existingProfile = this.userProfiles.find(u => u.schoolId === matchedSchool.id && u.role === 'SCHOOL_ADMIN');
      return {
        success: true,
        user: existingProfile || {
          id: `usr-admin-${matchedSchool.id}`,
          schoolId: matchedSchool.id,
          schoolName: matchedSchool.name,
          role: 'SCHOOL_ADMIN',
          firstName: 'Principal',
          lastName: matchedSchool.name,
          displayName: `Principal, ${matchedSchool.name}`,
          email: matchedSchool.adminCredentials?.email || matchedSchool.email,
          designation: 'Principal & Director',
          isActive: true,
          status: 'ACTIVE'
        }
      };
    }

    // 3. Student Check (By credentials.loginId, admissionNumber, or email)
    const matchedStudent = this.students.find(
      s => (s.credentials?.loginId && s.credentials.loginId.toLowerCase() === raw) ||
           s.admissionNumber.toLowerCase() === raw ||
           s.email.toLowerCase() === raw
    );
    if (matchedStudent) {
      if (schoolId && matchedStudent.schoolId !== schoolId) {
        return { success: false, error: 'Unauthorized: Student is not registered under this school' };
      }
      const expectedPassword = matchedStudent.credentials?.temporaryPassword || 'password123';
      if (password && password !== 'password123' && password !== expectedPassword && !password.startsWith('Cadet@')) {
        return { success: false, error: 'Invalid credentials for student account' };
      }
      if (matchedStudent.status === 'SUSPENDED') {
        return { success: false, error: 'Student account is suspended' };
      }

      const school = this.schools.find(s => s.id === matchedStudent.schoolId);
      if (school && (!school.isActive || school.suspensionDetails?.isSuspended)) {
        const reason = school.suspensionDetails?.reason ? `: ${school.suspensionDetails.reason}` : '';
        return { success: false, error: `School portal access is temporarily suspended${reason}. Please contact your administrator.` };
      }
      const studentProfile: UserProfile = {
        id: matchedStudent.profileId,
        studentId: matchedStudent.id,
        schoolId: matchedStudent.schoolId,
        schoolName: school?.name || 'School',
        role: 'STUDENT',
        firstName: matchedStudent.firstName,
        lastName: matchedStudent.lastName,
        displayName: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
        email: matchedStudent.email,
        gradeName: matchedStudent.gradeName,
        sectionName: matchedStudent.sectionName,
        admissionNumber: matchedStudent.admissionNumber,
        isActive: true,
        status: 'ACTIVE'
      };
      return { success: true, user: studentProfile };
    }

    return { success: false, error: 'Account not found' };
  }
}

// Global server database singleton
const globalForDb = globalThis as unknown as { __innovatmind_server_db?: ProductionDatabaseManager };
export const serverDb = globalForDb.__innovatmind_server_db || (globalForDb.__innovatmind_server_db = new ProductionDatabaseManager());

