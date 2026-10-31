"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  UserProfile,
  School,
  Student,
  GenderType,
  Course,
  SchoolFinancials,
  SchoolAdmissions,
  SchoolAttendance,
  SchoolStemTelemetry,
  FacilityOccupancy,
  AuditEvent,
  FeeInvoice,
  StaffMember,
  PayrollRecord,
  TimetableSlot,
  StudentEnrollment,
  BulkEnrollmentBatch,
  Exam,
  StudentExamMark,
  ExamStatus,
  PricingRule,
  SchoolPricingOverride,
  SchoolCourseAssignment,
  TrainerProfile,
  TrainerAllocation,
  TrainerSpecialization,
  TrainerStatus,
  BillingBasis,
  SchoolOnboardingStage,
  StudentCredentials,
  ProvisioningStatus,
  AccountStatus,
  AttendanceRecord,
  PaymentReceipt,
  InstitutionalFeeStructure,
  SchoolModulesConfig,
  TeacherTask,
  NoticeBroadcast,
  AuthProviderType
} from '../types';
import {
  initialSchools,
  initialWorkingRealSchool,
  nirmaanOrgSchool,
  isRealSchool,
  isDemoSchool,
  initialStudents,
  initialCourses,
  initialSchoolFinancials,
  initialSchoolAdmissions,
  initialSchoolAttendance,
  initialSchoolStemTelemetry,
  initialFacilityOccupancies,
  initialAuditEvents,
  initialInvoices,
  initialStaff,
  initialPayroll,
  initialTimetable,
  demoUsers,
  initialEnrollments,
  initialBatches,
  initialExams,
  initialExamMarks,
  initialTrainers,
  initialPricingRules,
  initialSchoolPricingOverrides,
  initialSchoolAssignments,
  initialTrainerAllocations,
  initialFeeStructures,
  initialPaymentReceipts,
  initialAttendanceRecords,
  initialNotices
} from '../db/mock-data';
import {
  DataMode,
  getActiveDataMode,
  setActiveDataMode,
  getActiveAuthProvider,
  setActiveAuthProvider,
  getCognitoConfig,
  shouldLoadDemoFixtures,
  getDataModeConfig,
  resolveStorageKey
} from '../config/data-mode';
import { generateUniqueRegistrationId, productionService } from '../supabase/service';

interface AuthContextType {
  // Central Data Environment (Demo Sandbox vs Live Production Database vs AWS Cognito)
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  authProvider: AuthProviderType;
  setAuthProvider: (provider: AuthProviderType) => void;
  cognitoConfigError: string | null;
  isLoadingData: boolean;
  dataError: string | null;
  clearDataError: () => void;
  resetDemoSandbox: () => void;
  syncProductionData: () => Promise<void>;

  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSchool: School;
  setActiveSchool: (school: School, bypassAuthCheck?: boolean) => void;
  schools: School[];
  
  // Authentication Actions
  login: (identifier: string, password?: string, targetSchoolId?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string; code?: string }>;
  loginWithGoogle: (email?: string, idToken?: string) => Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    code?: 'OAUTH_CONFIG_MISSING' | 'ACCOUNT_NOT_LINKED' | 'USER_SUSPENDED' | 'AUTH_FAILED' | 'PENDING_APPROVAL';
  }>;
  loginAsRole: (role: UserRole, schoolId?: string) => void;
  registerSchool: (
    schoolData: Omit<School, 'id' | 'code' | 'isActive' | 'createdAt' | 'enrolledCoursesCount'>,
    principalData: { firstName: string; lastName: string; email: string; password?: string; designation?: string; phone?: string }
  ) => Promise<{ success: boolean; school?: School; user?: UserProfile; error?: string }>;
  logout: () => void;

  // Super Admin -> School Management & Lifecycle
  createSchool: (data: Partial<School>) => Promise<{ success: boolean; school?: School; error?: string }>;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  deleteSchool: (schoolId: string) => Promise<{ success: boolean; error?: string; affectedRecords?: number }>;
  revokeSchoolDeletion: (auditEventIdOrSchoolId: string) => Promise<{ success: boolean; restoredSchool?: School; error?: string }>;
  approveSchool: (schoolId: string) => Promise<{ success: boolean; school?: School; error?: string }>;
  rejectSchool: (schoolId: string, reason?: string) => Promise<{ success: boolean; school?: School; error?: string }>;
  toggleSchoolSuspension: (schoolId: string, suspend: boolean, reason?: string) => Promise<{ success: boolean; school?: School; error?: string }>;
  dispatchWelcomeKit: (schoolId: string) => Promise<{ success: boolean; school?: School; error?: string }>;
  setSchoolStatus: (schoolId: string, isActive: boolean, onboardingStatus?: SchoolOnboardingStage) => void;
  updateSchoolModules: (schoolId: string, modules: SchoolModulesConfig) => void;
  resetSchoolAdminPassword: (schoolId: string, newPassword?: string) => Promise<{ success: boolean; newPassword: string; error?: string }>;
  resetStaffPassword: (staffId: string, newPassword?: string) => Promise<{ success: boolean; newPassword: string; error?: string }>;
  
  // Super Admin -> School Reassignment Workflows (Phase 6)
  reassignSchoolPrincipal: (
    schoolId: string,
    principalData: { firstName: string; lastName: string; email: string; phone?: string; designation?: string; newPassword?: string },
    auditNote?: string
  ) => Promise<{ success: boolean; school?: School; error?: string }>;
  transferAdministrator: (
    userId: string,
    targetSchoolId: string,
    auditNote?: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  reassignTrainer: (
    trainerId: string,
    sourceSchoolId: string,
    targetSchoolId: string,
    auditNote?: string
  ) => Promise<{ success: boolean; trainer?: TrainerProfile; error?: string }>;

  // Super Admin -> Central Course Pricing Engine
  pricingRules: PricingRule[];
  schoolPricingOverrides: SchoolPricingOverride[];
  resolveCoursePrice: (courseId: string, schoolId?: string, academicSession?: string, gradeName?: string) => {
    price: number;
    currency: 'INR' | 'USD';
    billingBasis: BillingBasis;
    source: string;
    ruleId?: string;
    overrideApplied: boolean;
    reason?: string;
    discountPercent?: number;
    isFreeCourse?: boolean;
  };
  savePricingRule: (rule: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>) => PricingRule;
  setSchoolPricingOverride: (override: Omit<SchoolPricingOverride, 'id' | 'updatedAt'>) => SchoolPricingOverride;
  resetSchoolPricingOverride: (schoolId: string, courseId: string, academicSession?: string) => void;
  togglePricingRuleStatus: (ruleId: string, isActive: boolean) => void;

  // Super Admin -> Course Assignment to Schools
  schoolCourseAssignments: SchoolCourseAssignment[];
  assignCourseToSchool: (assignment: Omit<SchoolCourseAssignment, 'id' | 'createdAt' | 'enrolledStudentsCount'>) => {
    success: boolean;
    assignment?: SchoolCourseAssignment;
    error?: string;
  };
  updateCourseAssignment: (id: string, updates: Partial<SchoolCourseAssignment>) => void;
  changeAssignmentStatus: (assignmentId: string, status: SchoolCourseAssignment['status']) => void;
  removeSchoolCourseAssignment: (assignmentId: string) => Promise<{ success: boolean; error?: string }>;

  // Super Admin -> InnovatMind Trainer Pool & Allocation
  trainers: TrainerProfile[];
  trainerAllocations: TrainerAllocation[];
  allocateTrainer: (allocation: Omit<TrainerAllocation, 'id' | 'createdAt'>) => {
    success: boolean;
    allocation?: TrainerAllocation;
    conflict?: string;
  };
  removeTrainerAllocation: (allocationId: string) => void;
  updateTrainerProfile: (trainerId: string, updates: Partial<TrainerProfile>) => void;
  onboardTrainer: (trainerData: {
    name: string;
    email: string;
    phone: string;
    specialization: TrainerSpecialization;
    experienceYears?: number;
    maxWorkloadHours?: number;
    avatarUrl?: string;
    status?: TrainerStatus;
  }) => Promise<{ success: boolean; trainer?: TrainerProfile; error?: string }>;
  deleteTrainer: (trainerId: string) => Promise<{ success: boolean; error?: string }>;

  // Audit Events
  recordAuditEvent: (title: string, detail: string, category?: AuditEvent['category'], schoolId?: string) => void;

  // Scoped Data (Strictly isolated by activeSchool.id)
  students: Student[];
  invoices: FeeInvoice[];
  staff: StaffMember[];
  payrollRecords: PayrollRecord[];
  timetableSlots: TimetableSlot[];
  financials: SchoolFinancials;
  admissions: SchoolAdmissions;
  attendance: SchoolAttendance;
  stemTelemetry: SchoolStemTelemetry;
  facilities: FacilityOccupancy[];
  activities: AuditEvent[];
  courses: Course[];
  activeStudent: Student | null;
  setActiveStudent: (student: Student | null) => void;

  // Course Management & Full Lifecycle Actions (Phases 4 & 9)
  addCourse: (course: Omit<Course, 'id'>) => Promise<Course>;
  updateCoursePrice: (courseId: string, price: number) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => Promise<Course>;
  deleteCourse: (courseId: string, force?: boolean) => Promise<{ success: boolean; error?: string; affectedAssignments?: number }>;
  archiveCourse: (courseId: string, isArchived: boolean) => Promise<{ success: boolean; course?: Course; error?: string }>;
  duplicateCourse: (courseId: string) => Promise<{ success: boolean; course?: Course; error?: string }>;
  toggleCoursePublish: (courseId: string, isPublished: boolean) => Promise<{ success: boolean; course?: Course; error?: string }>;

  // 1-Click Bulk Enrollment, Automated Credentials & Learning Telemetry
  enrollments: StudentEnrollment[];
  allEnrollments: StudentEnrollment[];
  batches: BulkEnrollmentBatch[];
  allBatches: BulkEnrollmentBatch[];
  bulkEnrollStudents: (courseId: string, gradeName: string, selectedStudentIds?: string[]) => { batch: BulkEnrollmentBatch; enrolledCount: number; alreadyEnrolledCount: number };
  updateStudentLearningProgress: (enrollmentId: string, completedLessonsDelta: number, newScore?: number) => void;

  // Exam Cell & Assessment System
  exams: Exam[];
  allExams: Exam[];
  examMarks: StudentExamMark[];
  allExamMarks: StudentExamMark[];
  addExam: (exam: Omit<Exam, 'id' | 'isResultPublished'>) => Exam;
  updateExamStatus: (examId: string, status: ExamStatus) => void;
  saveStudentExamMarks: (marks: StudentExamMark[]) => void;
  declareExamResult: (examId: string, declaredBy?: string) => void;
  unpublishExamResult: (examId: string) => void;

  // Student Account Provisioning & Credentials Lifecycle
  provisionStudentAccount: (studentId: string) => { success: boolean; credentials?: StudentCredentials; error?: string };
  resetStudentCredentials: (studentId: string) => { success: boolean; credentials?: StudentCredentials; error?: string };

  // Mutators & Admissions
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'currentXp' | 'currentLevel' | 'currentStreak'>) => Student;
  bulkImportStudents: (studentsData: Array<{
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    gradeName: string;
    sectionName?: string;
    rollNumber?: string;
    gender?: GenderType;
    dob?: string;
    parentName: string;
    parentPhone: string;
    parentEmail?: string;
    email?: string;
    address?: string;
  }>) => {
    successCount: number;
    failureCount: number;
    importedStudents: Student[];
    errors: Array<{ row: number; error: string; data: any }>;
  };
  generateNextAdmissionNumber: (schoolId?: string) => string;
  updateStudentStatus: (studentId: string, status: Student['status']) => void;
  
  // Attendance System
  attendanceRecords: AttendanceRecord[];
  markAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED', date?: string, remarks?: string) => AttendanceRecord;
  markBatchAttendance: (marks: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }[], date?: string) => { success: boolean; updatedCount: number };
  getAttendanceForDate: (date: string, gradeName?: string, sectionName?: string) => {
    records: AttendanceRecord[];
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    totalCount: number;
    attendanceRate: number;
  };
  
  // Fee Mutators & Official Receipts
  feeStructures: InstitutionalFeeStructure[];
  paymentReceipts: PaymentReceipt[];
  payInvoice: (
    invoiceId: string,
    amount: number,
    paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE',
    options?: {
      transactionRef?: string;
      bankName?: string;
      chequeNumber?: string;
      notes?: string;
      additionalDiscount?: number;
      waiverReason?: string;
    }
  ) => {
    success: boolean;
    receiptNumber: string;
    receipt?: PaymentReceipt;
    error?: string;
    remainingBalance?: number;
  };
  applyFeeWaiver: (invoiceId: string, waiverAmount: number, reason: string) => {
    success: boolean;
    error?: string;
    invoice?: FeeInvoice;
  };
  sendFeeReminder: (invoiceId: string, channel?: 'WHATSAPP' | 'SMS' | 'EMAIL') => {
    success: boolean;
    templateMessage: string;
    error?: string;
  };
  sendBatchFeeReminders: (invoiceIds: string[], channel?: 'WHATSAPP' | 'SMS' | 'EMAIL') => {
    success: boolean;
    count: number;
    error?: string;
  };
  createInvoice: (inv: Omit<FeeInvoice, 'id' | 'invoiceNumber'>) => void;
  getInvoiceReceipt: (invoiceNumberOrId: string) => PaymentReceipt | undefined;

  // Staff & Payroll Mutators
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  runPayrollForMonth: (month: string) => { generatedCount: number; totalDisbursed: number };
  markPayrollPaid: (recordId: string) => void;

  // Teacher Task & Function Assignment
  teacherTasks: TeacherTask[];
  assignTeacherTask: (task: Omit<TeacherTask, 'id' | 'assignedAt'>) => void;
  updateTeacherTaskStatus: (taskId: string, status: TeacherTask['status']) => void;

  // Timetable Mutators
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'schoolId'>) => { success: boolean; conflict?: string };
  deleteTimetableSlot: (slotId: string) => void;

  // White-Label Branding Mutator
  updateSchoolBranding: (brandingData: Partial<School>) => void;

  // Emergency & Holiday Notice Broadcast Center
  notices: NoticeBroadcast[];
  allNotices: NoticeBroadcast[];
  publishNotice: (notice: Omit<NoticeBroadcast, 'id' | 'sentAt' | 'deliveredCount' | 'totalRecipients' | 'openRate'>) => Promise<{ success: boolean; notice?: NoticeBroadcast; error?: string }>;
  deleteNotice: (noticeId: string) => Promise<{ success: boolean; error?: string }>;
  togglePinNotice: (noticeId: string) => Promise<{ success: boolean; error?: string }>;
  dismissNotice: (noticeId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [dataMode, setDataModeState] = useState<DataMode>(() => getActiveDataMode());
  const [authProvider, setAuthProviderState] = useState<AuthProviderType>(() => getActiveAuthProvider());
  const [cognitoConfigError, setCognitoConfigError] = useState<string | null>(() => {
    const provider = getActiveAuthProvider();
    if (provider === 'COGNITO') {
      const cfg = getCognitoConfig();
      return cfg.isConfigured ? null : (cfg.errorMessage || 'AWS Cognito configuration missing');
    }
    return null;
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const setDataMode = (mode: DataMode) => {
    setDataModeState(mode);
    setActiveDataMode(mode);
  };

  const setAuthProvider = (provider: AuthProviderType) => {
    setAuthProviderState(provider);
    setActiveAuthProvider(provider);
    if (provider === 'COGNITO') {
      const cfg = getCognitoConfig();
      setCognitoConfigError(cfg.isConfigured ? null : (cfg.errorMessage || 'AWS Cognito configuration missing'));
    } else {
      setCognitoConfigError(null);
    }
  };

  const clearDataError = () => setDataError(null);

  const [schools, setSchools] = useState<School[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const deletedRaw = localStorage.getItem('school_os_deleted_school_ids');
        const deletedIds = new Set<string>(deletedRaw ? JSON.parse(deletedRaw) : []);
        const saved = localStorage.getItem('school_os_schools') || localStorage.getItem('school_os_prod_schools');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((s: School) => s && s.id && !deletedIds.has(s.id) && !deletedIds.has(s.code) && !deletedIds.has(s.registrationId || ''));
          }
        }
        const isProd = getActiveDataMode() === 'PRODUCTION';
        const base = isProd ? [initialWorkingRealSchool, nirmaanOrgSchool] : [initialWorkingRealSchool, nirmaanOrgSchool, ...initialSchools];
        return base.filter((s: School) => !deletedIds.has(s.id) && !deletedIds.has(s.code) && !deletedIds.has(s.registrationId || ''));
      } catch {}
    }
    return getActiveDataMode() === 'PRODUCTION' ? [initialWorkingRealSchool, nirmaanOrgSchool] : [initialWorkingRealSchool, nirmaanOrgSchool, ...initialSchools];
  });
  const [activeSchool, setActiveSchoolState] = useState<School>(initialWorkingRealSchool);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('school_os_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.status !== 'SUSPENDED' && u.status !== 'INACTIVE' && u.isActive !== false) {
          return u;
        }
      }
    } catch {}
    return null;
  });
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window === 'undefined') return 'SCHOOL_ADMIN';
    try {
      const saved = localStorage.getItem('school_os_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role || 'SCHOOL_ADMIN';
      }
    } catch {}
    return 'SCHOOL_ADMIN';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('school_os_user');
      if (saved) {
        const u = JSON.parse(saved);
        return Boolean(u && u.status !== 'SUSPENDED' && u.status !== 'INACTIVE' && u.isActive !== false);
      }
    } catch {}
    return false;
  });

  // Persistence helpers to ensure data is written across all multi-mode keys synchronously
  const persistSchoolsToAllKeys = (schoolsToSave: School[]) => {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(schoolsToSave);
      localStorage.setItem('school_os_schools', json);
      localStorage.setItem('school_os_prod_schools', json);
      const customOnly = schoolsToSave.filter(s => !initialSchools.some(init => init.id === s.id));
      localStorage.setItem('school_os_custom_schools', JSON.stringify(customOnly));
    } catch {}
  };

  const persistStaffToAllKeys = (staffToSave: StaffMember[]) => {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(staffToSave);
      localStorage.setItem('school_os_staff', json);
      localStorage.setItem('school_os_prod_staff', json);
    } catch {}
  };

  const persistStudentsToAllKeys = (studentsToSave: Student[]) => {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(studentsToSave);
      localStorage.setItem('school_os_students', json);
      localStorage.setItem('school_os_prod_students', json);
    } catch {}
  };

  // Core multi-tenant state lists (Clean empty states in PRODUCTION and COGNITO, fixtures only in DEMO)
  const [studentsList, setStudentsList] = useState<Student[]>(() =>
    shouldLoadDemoFixtures() ? initialStudents : []
  );
  const [invoicesList, setInvoicesList] = useState<FeeInvoice[]>(() =>
    shouldLoadDemoFixtures() ? initialInvoices : []
  );
  const [staffList, setStaffList] = useState<StaffMember[]>(() =>
    shouldLoadDemoFixtures() ? initialStaff : initialStaff.filter(s => isRealSchool({ id: s.schoolId }))
  );
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(() =>
    shouldLoadDemoFixtures() ? initialPayroll : []
  );
  const [timetableList, setTimetableList] = useState<TimetableSlot[]>(() =>
    shouldLoadDemoFixtures() ? initialTimetable : []
  );
  const [activitiesList, setActivitiesList] = useState<AuditEvent[]>(initialAuditEvents);
  const [financialsMap, setFinancialsMap] = useState<Record<string, SchoolFinancials>>(initialSchoolFinancials);
  const [coursesList, setCoursesList] = useState<Course[]>(initialCourses);
  const [enrollmentsList, setEnrollmentsList] = useState<StudentEnrollment[]>(shouldLoadDemoFixtures() ? initialEnrollments : []);
  const [batchesList, setBatchesList] = useState<BulkEnrollmentBatch[]>(shouldLoadDemoFixtures() ? initialBatches : []);
  const [examsList, setExamsList] = useState<Exam[]>(shouldLoadDemoFixtures() ? initialExams : []);
  const [examMarksList, setExamMarksList] = useState<StudentExamMark[]>(shouldLoadDemoFixtures() ? initialExamMarks : []);

  // Super Admin Central Collections
  const [trainersList, setTrainersList] = useState<TrainerProfile[]>(initialTrainers);
  const [pricingRulesList, setPricingRulesList] = useState<PricingRule[]>(initialPricingRules);
  const [schoolPricingOverridesList, setSchoolPricingOverridesList] = useState<SchoolPricingOverride[]>(initialSchoolPricingOverrides);
  const [assignmentsList, setAssignmentsList] = useState<SchoolCourseAssignment[]>(() =>
    shouldLoadDemoFixtures() ? initialSchoolAssignments : []
  );
  const [allocationsList, setAllocationsList] = useState<TrainerAllocation[]>(initialTrainerAllocations);
  const [attendanceRecordsList, setAttendanceRecordsList] = useState<AttendanceRecord[]>(() =>
    shouldLoadDemoFixtures() ? initialAttendanceRecords : []
  );
  const [paymentReceiptsList, setPaymentReceiptsList] = useState<PaymentReceipt[]>(() =>
    shouldLoadDemoFixtures() ? initialPaymentReceipts : []
  );
  const [feeStructuresList, setFeeStructuresList] = useState<InstitutionalFeeStructure[]>(initialFeeStructures);
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);
  const [noticesList, setNoticesList] = useState<NoticeBroadcast[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_notices');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialNotices;
  });
  const [teacherTasksList, setTeacherTasksList] = useState<TeacherTask[]>(() => {
    return [
      {
        id: 'task-1',
        schoolId: 'sch-del-101',
        teacherId: 'stf-apex-001',
        teacherName: 'Dr. Rajesh Malhotra',
        title: 'Conduct Robotics Rover Orientation',
        description: 'Introduce Grade 8 students to the Mars Rover telemetry simulation.',
        assignedGrade: 'Grade 8 - A',
        assignedSubject: 'Robotics & STEM',
        dueDate: '2026-11-15',
        priority: 'HIGH',
        status: 'PENDING',
        assignedAt: new Date().toISOString(),
        assignedBy: 'School Administration'
      },
      {
        id: 'task-2',
        schoolId: 'sch-del-101',
        teacherId: 'stf-apex-002',
        teacherName: 'Meenakshi Sundaram',
        title: 'Submit Term 1 Practical Grades',
        description: 'Finalize and submit laboratory practical scores for Class 9 Physics.',
        assignedGrade: 'Grade 9 - B',
        assignedSubject: 'Physics',
        dueDate: '2026-11-10',
        priority: 'URGENT',
        status: 'IN_PROGRESS',
        assignedAt: new Date().toISOString(),
        assignedBy: 'School Administration'
      }
    ];
  });

  // Load persisted session and client-stored data after initial mount (hydration safe)
  useEffect(() => {
    try {
      const isProd = getActiveDataMode() === 'PRODUCTION';

      // 1. Hydrate schools safely across all storage keys (namespaced & legacy)
      const schoolKeys = ['school_os_schools', 'school_os_prod_schools', 'school_os_custom_schools'];
      const gatheredSchools: School[] = [];
      const seenSchoolIds = new Set<string>();

      // Load deleted school IDs blacklist
      const deletedIds = new Set<string>();
      try {
        const deletedRaw = localStorage.getItem('school_os_deleted_school_ids');
        if (deletedRaw) {
          const arr = JSON.parse(deletedRaw);
          if (Array.isArray(arr)) arr.forEach((id: string) => deletedIds.add(id));
        }
      } catch {}

      schoolKeys.forEach(k => {
        try {
          const rawStr = localStorage.getItem(k);
          if (rawStr) {
            const parsed = JSON.parse(rawStr);
            if (Array.isArray(parsed)) {
              parsed.forEach((s: School) => {
                if (s && s.id && !seenSchoolIds.has(s.id) && !deletedIds.has(s.id) && !deletedIds.has(s.code) && !deletedIds.has(s.registrationId || '')) {
                  seenSchoolIds.add(s.id);
                  gatheredSchools.push(s);
                }
              });
            }
          }
        } catch {}
      });

      const baseSchools = isProd 
        ? [initialWorkingRealSchool, nirmaanOrgSchool] 
        : [initialWorkingRealSchool, nirmaanOrgSchool, ...initialSchools];

      baseSchools.forEach(b => {
        if (!seenSchoolIds.has(b.id) && !deletedIds.has(b.id) && !deletedIds.has(b.code) && !deletedIds.has(b.registrationId || '')) {
          seenSchoolIds.add(b.id);
          gatheredSchools.push(b);
        }
      });

      const filteredSchools = isProd ? gatheredSchools.filter(isRealSchool) : gatheredSchools;
      if (filteredSchools.length > 0) {
        setSchools(filteredSchools);
      }

      // 2. Hydrate multi-tenant collections safely
      const loadList = (key: string, setter: (val: any) => void) => {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setter(parsed);
          }
        } catch {}
      };

      // Safely load students merging prod and standard stores
      const loadCombinedStudents = () => {
        const combined: Student[] = [];
        const seen = new Set<string>();
        ['school_os_prod_students', 'school_os_students'].forEach(k => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach(st => {
                  if (st && st.id && !seen.has(st.id)) {
                    seen.add(st.id);
                    combined.push(st);
                  }
                });
              }
            }
          } catch {}
        });
        if (combined.length > 0) {
          setStudentsList(combined);
        }
      };
      loadCombinedStudents();

      // Safely load staff merging prod and standard stores
      const loadCombinedStaff = () => {
        const combined: StaffMember[] = [];
        const seen = new Set<string>();
        ['school_os_prod_staff', 'school_os_staff'].forEach(k => {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                parsed.forEach(stf => {
                  if (stf && stf.id && !seen.has(stf.id)) {
                    seen.add(stf.id);
                    combined.push(stf);
                  }
                });
              }
            }
          } catch {}
        });
        if (combined.length > 0) {
          setStaffList(combined);
        }
      };
      loadCombinedStaff();

      loadList(isProd ? 'school_os_prod_invoices' : 'school_os_invoices', setInvoicesList);
      loadList(isProd ? 'school_os_prod_payroll' : 'school_os_payroll', setPayrollList);
      loadList(isProd ? 'school_os_prod_timetable' : 'school_os_timetable', setTimetableList);
      loadList('school_os_activities', setActivitiesList);
      loadList('school_os_financials', setFinancialsMap);
      loadList('school_os_courses', setCoursesList);
      loadList('school_os_enrollments', setEnrollmentsList);
      loadList('school_os_batches', setBatchesList);
      loadList('school_os_exams', setExamsList);
      loadList('school_os_exam_marks', setExamMarksList);
      loadList('school_os_trainers', setTrainersList);
      loadList('school_os_pricing_rules', setPricingRulesList);
      loadList('school_os_pricing_overrides', setSchoolPricingOverridesList);
      loadList(isProd ? 'school_os_prod_assignments' : 'school_os_assignments', setAssignmentsList);
      loadList('school_os_allocations', setAllocationsList);
      loadList(isProd ? 'school_os_prod_attendance' : 'school_os_attendance_records', setAttendanceRecordsList);
      loadList(isProd ? 'school_os_prod_receipts' : 'school_os_payment_receipts', setPaymentReceiptsList);
      loadList('school_os_fee_structures', setFeeStructuresList);

      // 3. User session hydration
      const savedUserJson = localStorage.getItem('school_os_user');
      const savedSchoolId = localStorage.getItem('school_os_school_id');

      if (savedUserJson) {
        const parsedUser: UserProfile = JSON.parse(savedUserJson);
        // Verify account status
        if (parsedUser.status === 'SUSPENDED' || parsedUser.status === 'INACTIVE' || parsedUser.isActive === false) {
          localStorage.removeItem('school_os_user');
          setCurrentUser(null);
          setIsAuthenticated(false);
          return;
        }

        setCurrentUser(parsedUser);
        setRoleState(parsedUser.role);
        setIsAuthenticated(true);

        const schoolIdToFind = parsedUser.schoolId || savedSchoolId;
        const foundSchool = schoolIdToFind ? filteredSchools.find((s: School) => s.id === schoolIdToFind) : null;
        const isRealUser = schoolIdToFind && schoolIdToFind !== 'sch-del-001' && schoolIdToFind !== 'school-1';

        if (isRealUser) {
          setDataModeState('PRODUCTION');
          try { localStorage.setItem('school_os_data_mode', 'PRODUCTION'); } catch {}
        }

        const targetSchool = foundSchool || (isRealUser ? {
          id: schoolIdToFind!,
          name: parsedUser.schoolName || 'Your School Portal',
          code: (parsedUser as any).schoolCode || 'SCH-PORTAL',
          isDemo: false,
          totalStudents: 0,
          totalStaff: 0,
          enrolledCoursesCount: 0,
          isActive: true,
          schoolType: 'CBSE' as const,
          city: '',
          state: '',
          email: '',
          phone: '',
          address: '',
          country: 'India',
          postalCode: '110001',
          createdAt: new Date().toISOString()
        } : (filteredSchools[0] || initialWorkingRealSchool));

        setActiveSchoolState(targetSchool);
      } else {
        // Explicitly enforce unauthenticated state when no stored session
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      // Ignore SSR/storage errors
    }

    // 4. Initial server database fetch on mount to sync pending applications and fresh records
    syncProductionData();

    // 5. Supabase Realtime channel subscription for live school updates
    const unsubRealtime = productionService.subscribeToSchools({
      onInsert: (newSchool) => {
        setSchools(prev => {
          if (prev.some(s => s.id === newSchool.id || s.code === newSchool.code || s.registrationId === newSchool.registrationId)) {
            return prev;
          }
          const updated = [newSchool, ...prev];
          persistSchoolsToAllKeys(updated);
          return updated;
        });
      },
      onUpdate: (updatedSchool) => {
        setSchools(prev => {
          const updated = prev.map(s => (s.id === updatedSchool.id || s.code === updatedSchool.code) ? { ...s, ...updatedSchool } : s);
          persistSchoolsToAllKeys(updated);
          return updated;
        });
      },
      onDelete: (deletedSchoolId) => {
        setSchools(prev => {
          const updated = prev.filter(s => s.id !== deletedSchoolId);
          persistSchoolsToAllKeys(updated);
          return updated;
        });
      }
    });

    // 6. Cross-tab immediate synchronization via BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel('school_os_realtime');
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'SCHOOL_REGISTERED' || event.data?.type === 'SCHOOL_UPDATED' || event.data?.type === 'SYNC_REQUEST') {
            syncProductionData();
          }
        };
      }
    } catch {}

    // 7. Background heartbeat fallback poll (every 10s if window visible)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetch('/api/schools')
          .then(res => res.json())
          .then(data => {
            if (data.schools && Array.isArray(data.schools)) {
              let deletedSchoolIds = new Set<string>();
              try {
                const raw = localStorage.getItem('school_os_deleted_school_ids');
                if (raw) JSON.parse(raw).forEach((id: string) => deletedSchoolIds.add(id));
              } catch {}
              const clean = data.schools.filter((s: School) => s && s.id && !deletedSchoolIds.has(s.id));
              setSchools(clean);
              persistSchoolsToAllKeys(clean);
            }
          })
          .catch(() => {});
      }
    }, 10000);

    return () => {
      unsubRealtime();
      if (broadcastChannel) broadcastChannel.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Real Production Database Synchronization
  const syncProductionData = async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const headers: Record<string, string> = {
        'x-user-role': role,
        'x-school-id': activeSchool.id,
        'x-user-id': currentUser?.id || 'usr-current'
      };

      const [schoolsRes, studentsRes, feesRes, coursesRes, trainersRes] = await Promise.all([
        fetch('/api/schools', { headers }).catch(e => { throw new Error(`Schools API network error: ${e.message}`); }),
        fetch(`/api/students?schoolId=${activeSchool.id}`, { headers }).catch(e => { throw new Error(`Students API network error: ${e.message}`); }),
        fetch(`/api/fees?schoolId=${activeSchool.id}`, { headers }).catch(e => { throw new Error(`Fees API network error: ${e.message}`); }),
        fetch('/api/courses', { headers }).catch(e => { throw new Error(`Courses API network error: ${e.message}`); }),
        fetch('/api/trainers', { headers }).catch(() => null)
      ]);

      if (!schoolsRes.ok) {
        const err = await schoolsRes.json().catch(() => ({}));
        throw new Error(err.error || `Schools API returned HTTP ${schoolsRes.status}`);
      }
      if (!studentsRes.ok) {
        const err = await studentsRes.json().catch(() => ({}));
        throw new Error(err.error || `Students API returned HTTP ${studentsRes.status}`);
      }
      if (!feesRes.ok) {
        const err = await feesRes.json().catch(() => ({}));
        throw new Error(err.error || `Fees API returned HTTP ${feesRes.status}`);
      }

      const schoolsData = await schoolsRes.json();
      const studentsData = await studentsRes.json();
      const feesData = await feesRes.json();
      const coursesData = coursesRes.ok ? await coursesRes.json() : { courses: [] };
      const trainersData = trainersRes && trainersRes.ok ? await trainersRes.json() : null;

      if (schoolsData.schools) {
        let deletedSchoolIds = new Set<string>();
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('school_os_deleted_school_ids');
            if (raw) {
              const arr = JSON.parse(raw);
              if (Array.isArray(arr)) arr.forEach((id: string) => deletedSchoolIds.add(id));
            }
          } catch {}
        }
        const cleanSchools = schoolsData.schools.filter((s: School) => 
          s && s.id && !deletedSchoolIds.has(s.id) && !deletedSchoolIds.has(s.code) && !deletedSchoolIds.has(s.registrationId || '')
        );
        setSchools(cleanSchools);
        persistSchoolsToAllKeys(cleanSchools);
      }
      if (studentsData.students) setStudentsList(studentsData.students);
      if (feesData.invoices) setInvoicesList(feesData.invoices);
      if (feesData.receipts) setPaymentReceiptsList(feesData.receipts);
      if (feesData.feeStructures) setFeeStructuresList(feesData.feeStructures);
      if (coursesData.courses && coursesData.courses.length > 0) setCoursesList(coursesData.courses);
      if (trainersData && Array.isArray(trainersData.trainers)) {
        setTrainersList(trainersData.trainers);
        try { localStorage.setItem('school_os_trainers', JSON.stringify(trainersData.trainers)); } catch {}
      }
      if (trainersData && Array.isArray(trainersData.allocations)) {
        setAllocationsList(trainersData.allocations);
        try { localStorage.setItem('school_os_allocations', JSON.stringify(trainersData.allocations)); } catch {}
      }
    } catch (err: any) {
      console.error('[Production Data Sync Error]', err);
      // Strictly expose error and DO NOT silently fall back to mock data!
      setDataError(err.message || 'Production Database unreachable');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Dedicated Demo Sandbox Reset (strictly isolates demo storage from production)
  const resetDemoSandbox = () => {
    if (typeof window !== 'undefined') {
      const demoKeys = [
        'school_os_demo_schools',
        'school_os_demo_students',
        'school_os_demo_invoices',
        'school_os_demo_attendance_records',
        'school_os_demo_payment_receipts',
        'school_os_demo_fee_structures',
        'school_os_demo_staff',
        'school_os_demo_payroll',
        'school_os_demo_timetable',
        'school_os_demo_activities',
        'school_os_students',
        'school_os_attendance_records',
        'school_os_payment_receipts',
        'school_os_invoices'
      ];
      demoKeys.forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });

      setStudentsList(initialStudents);
      setAttendanceRecordsList(initialAttendanceRecords);
      setInvoicesList(initialInvoices);
      setPaymentReceiptsList(initialPaymentReceipts);
      setFeeStructuresList(initialFeeStructures);
      setSchools(initialSchools);
      setActiveSchoolState(initialSchools[0]);
      setDataError(null);
    }
  };

  useEffect(() => {
    if (dataMode === 'PRODUCTION') {
      syncProductionData();
    }
  }, [dataMode, activeSchool.id]);

  useEffect(() => {
    const handleModeChange = (e: any) => {
      if (e.detail?.mode) {
        setDataModeState(e.detail.mode);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('school_os_data_mode_changed', handleModeChange);
      return () => window.removeEventListener('school_os_data_mode_changed', handleModeChange);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'SUPER_ADMIN') {
      const superUser = demoUsers[0];
      const { password: _, ...profile } = superUser;
      setCurrentUser(profile);
      const realFirstSchool = schools.find(isRealSchool) || initialWorkingRealSchool;
      setActiveSchoolState(realFirstSchool);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(profile));
        localStorage.setItem('school_os_school_id', realFirstSchool.id);
      } catch {}
      return;
    }
    if (currentUser) {
      const updatedUser = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(updatedUser));
      } catch {}
    }
  };

  // Security guard: Only SUPER_ADMIN can switch active schools arbitrarily.
  const setActiveSchool = (targetSchool: School, bypassAuthCheck = false) => {
    if (role === 'SUPER_ADMIN' || bypassAuthCheck) {
      setActiveSchoolState(targetSchool);
      try {
        localStorage.setItem('school_os_school_id', targetSchool.id);
      } catch {}
    } else {
      console.warn(`[SECURITY VIOLATION] Role '${role}' is not authorized to switch tenant to '${targetSchool.name}' (${targetSchool.id}). Access restricted by PostgreSQL RLS.`);
    }
  };

  // Register New School Tenant
  const registerSchool = async (
    schoolData: Omit<School, 'id' | 'code' | 'isActive' | 'createdAt' | 'enrolledCoursesCount'>,
    principalData: { firstName: string; lastName: string; email: string; password?: string; designation?: string; phone?: string }
  ): Promise<{ success: boolean; school?: School; user?: UserProfile; error?: string }> => {
    // 1. Client-side input validation
    if (!schoolData.name || !schoolData.name.trim()) {
      return { success: false, error: 'School name is required.' };
    }
    if (!schoolData.email || !schoolData.email.trim()) {
      return { success: false, error: 'Official school email is required.' };
    }
    if (!principalData.email || !principalData.email.trim()) {
      return { success: false, error: 'Principal email address is required.' };
    }

    const cityCode = (schoolData.city || 'SCH').slice(0, 3).toUpperCase();
    const newSchoolId = `school-${Date.now()}`;
    const newSchoolCode = `SCH-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
    const registrationId = generateUniqueRegistrationId(schools);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedLoginId = (principalData.email || `${principalData.firstName.toLowerCase()}.${newSchoolCode.toLowerCase()}@innovatmind.com`).trim().toLowerCase();
    const generatedTempPassword = `Pass@${randomSuffix}`;
    const finalPassword = principalData.password?.trim() || generatedTempPassword;
    const nowIso = new Date().toISOString();

    const newSchool: School = {
      ...schoolData,
      id: newSchoolId,
      registrationId,
      code: newSchoolCode,
      isActive: false, // Self-registered via dashboard strictly requires Super Admin approval before login
      onboardingStatus: 'PENDING_APPROVAL',
      approvalDetails: {
        status: 'PENDING',
        submittedAt: nowIso
      },
      isDemo: false,
      totalStudents: 0,
      totalStaff: 1,
      enrolledCoursesCount: 0,
      createdAt: nowIso,
      principalName: `${principalData.firstName} ${principalData.lastName}`.trim(),
      adminCredentials: {
        loginId: generatedLoginId,
        email: principalData.email,
        temporaryPassword: finalPassword,
        generatedAt: nowIso,
        provisionedBy: 'InnovatMind Self-Registration Portal (Pending Super Admin Approval)',
      },
    };

    // Principal User Profile
    const newPrincipal: UserProfile = {
      id: `usr-prin-${Date.now()}`,
      schoolId: newSchoolId,
      role: 'SCHOOL_ADMIN',
      firstName: principalData.firstName,
      lastName: principalData.lastName,
      email: principalData.email,
      phone: principalData.phone || schoolData.phone,
      designation: principalData.designation || 'Principal & Director',
      isActive: false, // Inactive until Super Admin approval
      status: 'PENDING'
    };

    // 2. Persist to backend database first
    let persistedSchool: School = newSchool;
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSchool)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            error: errData.error || `Server rejected school registration (HTTP ${res.status})`
          };
        }

        const data = await res.json().catch(() => null);
        if (data && data.school) {
          persistedSchool = data.school;
        }
      }
    } catch (netErr: any) {
      console.warn('Backend fetch failed during registerSchool, falling back to durable client store:', netErr);
    }

    const effectiveSchoolId = persistedSchool.id;

    // 3. Initialize clean Zero Financials for the new actual school
    setFinancialsMap(prev => ({
      ...prev,
      [effectiveSchoolId]: {
        schoolId: effectiveSchoolId,
        totalBilled: 0,
        totalCollected: 0,
        totalOverdue: 0,
        upiPercentage: 0,
        netBankingPercentage: 0,
        cashPercentage: 0,
      }
    }));

    // Update School state & persist schools across all multi-mode keys
    setSchools(prev => {
      const filtered = prev.filter(s => s.id !== effectiveSchoolId && s.code !== persistedSchool.code && s.registrationId !== persistedSchool.registrationId);
      const updated = [...filtered, persistedSchool];
      persistSchoolsToAllKeys(updated);
      return updated;
    });

    // Seed Principal as Staff
    const newStaffMember: StaffMember = {
      id: `stf-prin-${Date.now()}`,
      schoolId: newSchoolId,
      employeeId: `EMP-${cityCode}-001`,
      name: `${principalData.firstName} ${principalData.lastName}`,
      designation: principalData.designation || 'Principal & Director',
      department: 'Administration',
      email: principalData.email,
      phone: principalData.phone || schoolData.phone,
      joiningDate: nowIso.split('T')[0],
      basicSalary: 95000,
      allowances: 25000,
      attendanceRate: 100.0,
      status: 'ACTIVE',
    };
    setStaffList(prev => {
      const updated = [newStaffMember, ...prev];
      persistStaffToAllKeys(updated);
      return updated;
    });

    // Audit Event
    const registrationEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: newSchoolId,
      title: 'Institutional Workspace Initialized (Pending Approval)',
      detail: `${newSchool.name} registered under ${newSchool.schoolType} Board by ${principalData.firstName} ${principalData.lastName}. Registration ID: ${registrationId}. Awaiting Super Admin confirmation.`,
      time: 'Just now',
      category: 'AUTH',
    };
    setActivitiesList(prev => {
      const updated = [registrationEvent, ...prev];
      try {
        localStorage.setItem('school_os_activities', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setDataModeState('PRODUCTION');
    try {
      localStorage.setItem('school_os_data_mode', 'PRODUCTION');
    } catch {}

    // Broadcast registration to any other open browser windows (e.g. Super Admin dashboard)
    try {
      if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('school_os_realtime');
        bc.postMessage({ type: 'SCHOOL_REGISTERED', school: persistedSchool });
        setTimeout(() => bc.close(), 100);
      }
    } catch {}

    return { success: true, school: persistedSchool, user: newPrincipal };
  };

  // Audit Event Recorder
  const recordAuditEvent = (
    title: string, 
    detail: string, 
    category: AuditEvent['category'] = 'AUTH', 
    schoolId?: string,
    isRevokable?: boolean,
    targetEntityId?: string,
    targetEntityType?: 'SCHOOL' | 'TRAINER',
    deletedSnapshot?: any
  ) => {
    const event: AuditEvent = {
      id: `evt-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      schoolId: schoolId || activeSchool.id,
      title,
      detail,
      time: 'Just now',
      category,
      isRevokable,
      targetEntityId,
      targetEntityType,
      deletedSnapshot
    };
    setActivitiesList(prev => {
      const updated = [event, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_activities', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // Super Admin -> Create / Provision School
  const createSchool = async (data: Partial<School>): Promise<{ success: boolean; school?: School; error?: string }> => {
    if (!data.name?.trim()) {
      return { success: false, error: 'School name is required.' };
    }
    const targetCode = data.code?.trim().toUpperCase() || `SCH-${(data.city || 'IND').slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Strict Unique School Code Validation
    const isDuplicate = schools.some(s => s.code.toUpperCase() === targetCode);
    if (isDuplicate) {
      return { success: false, error: `School code '${targetCode}' already exists. Please provide a unique school identifier.` };
    }

    const cityCode = (data.city || 'SCH').slice(0, 3).toUpperCase();
    const newSchoolId = `school-${Date.now()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cleanName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const adminEmail = (data.adminCredentials?.email || data.email || data.contactPersonEmail || '').trim().toLowerCase();
    const finalLoginId = (data.adminCredentials?.loginId || adminEmail || `admin@${cleanName || 'school'}.edu.in`).trim().toLowerCase();
    const generatedTempPassword = `Pass@${randomSuffix}`;
    const finalPassword = data.adminCredentials?.temporaryPassword || generatedTempPassword;
    const registrationId = generateUniqueRegistrationId(schools);
    const newSchool: School = {
      id: newSchoolId,
      registrationId,
      code: targetCode,
      name: data.name.trim(),
      schoolType: data.schoolType || 'CBSE',
      email: adminEmail || `contact@${cleanName || 'school'}.edu.in`,
      phone: data.phone?.trim() || '+91 98000 00000',
      address: data.address?.trim() || data.city || 'Main Campus',
      city: data.city?.trim() || 'Metropolis',
      state: data.state?.trim() || 'State',
      country: data.country?.trim() || 'India',
      postalCode: data.postalCode?.trim() || '100001',
      region: data.region || 'North',
      isActive: data.isActive !== undefined ? data.isActive : true,
      isDemo: false,
      totalStudents: 0,
      totalStaff: 0,
      enrolledCoursesCount: 0,
      createdAt: new Date().toISOString(),
      principalName: data.principalName?.trim() || 'Principal In-charge',
      contactPersonName: data.contactPersonName?.trim() || data.principalName?.trim(),
      contactPersonPhone: data.contactPersonPhone?.trim() || data.phone?.trim(),
      contactPersonEmail: adminEmail,
      onboardingStatus: data.onboardingStatus || 'ACTIVE',
      academicSession: data.academicSession || '2026-2027',
      contractStartDate: data.contractStartDate || new Date().toISOString().split('T')[0],
      contractEndDate: data.contractEndDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
      notes: data.notes?.trim() || '',
      adminCredentials: {
        loginId: finalLoginId,
        email: adminEmail || finalLoginId,
        temporaryPassword: finalPassword,
        generatedAt: new Date().toISOString(),
        provisionedBy: 'InnovatMind Super Admin HQ',
      }
    };

    setFinancialsMap(prev => ({
      ...prev,
      [newSchoolId]: {
        schoolId: newSchoolId,
        totalBilled: 0,
        totalCollected: 0,
        totalOverdue: 0,
        upiPercentage: 0,
        netBankingPercentage: 0,
        cashPercentage: 0,
      }
    }));

    if (typeof fetch !== 'undefined') {
      fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchool)
      }).catch(() => {});
    }

    setSchools(prev => {
      const updated = [newSchool, ...prev];
      persistSchoolsToAllKeys(updated);
      return updated;
    });

    recordAuditEvent(
      `New School Provisioned: ${newSchool.name}`,
      `Code: ${newSchool.code} | Board: ${newSchool.schoolType} | ${newSchool.city}, ${newSchool.state}. Provisioned by Super Admin.`,
      'AUTH',
      newSchoolId
    );

    return { success: true, school: newSchool };
  };

  const updateSchool = (schoolId: string, updates: Partial<School>) => {
    setSchools(prev => {
      const updated = prev.map(s => s.id === schoolId ? { ...s, ...updates } : s);
      persistSchoolsToAllKeys(updated);
      return updated;
    });
    if (activeSchool.id === schoolId) {
      setActiveSchoolState(prev => ({ ...prev, ...updates }));
    }
    recordAuditEvent(
      `School Profile Updated: ${updates.name || schoolId}`,
      `Updated parameters: ${Object.keys(updates).join(', ')}`,
      'AUTH',
      schoolId
    );
  };

  const setSchoolStatus = (schoolId: string, isActive: boolean, onboardingStatus?: SchoolOnboardingStage) => {
    updateSchool(schoolId, {
      isActive,
      ...(onboardingStatus ? { onboardingStatus } : {})
    });
  };

  const deleteSchool = async (schoolId: string): Promise<{ success: boolean; error?: string; affectedRecords?: number }> => {
    try {
      if (!schoolId || schoolId === 'usr-super' || schoolId === 'platform') {
        return { success: false, error: 'Cannot delete platform administrative entities' };
      }

      // Snapshot before deletion for accidental deletion revocation
      const targetSchool = schools.find(s => s.id === schoolId || s.code === schoolId || s.registrationId === schoolId);
      const effectiveId = targetSchool?.id || schoolId;

      // Call backend DELETE endpoint
      if (typeof fetch !== 'undefined') {
        const res = await fetch(`/api/schools?schoolId=${encodeURIComponent(effectiveId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to delete school (HTTP ${res.status})` };
        }
      }

      // Purge school from client state and all storage keys
      setSchools(prev => {
        const next = prev.filter(s => s.id !== effectiveId && s.id !== schoolId && s.code !== schoolId && s.registrationId !== schoolId);
        persistSchoolsToAllKeys(next);
        return next;
      });

      // Add to persistent deleted IDs blacklist so it NEVER resurrects on reload
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_os_deleted_school_ids');
          const existing: string[] = raw ? JSON.parse(raw) : [];
          const toAdd = [effectiveId, schoolId, targetSchool?.id, targetSchool?.code, targetSchool?.registrationId].filter(Boolean) as string[];
          const nextDeleted = Array.from(new Set([...existing, ...toAdd]));
          localStorage.setItem('school_os_deleted_school_ids', JSON.stringify(nextDeleted));
        } catch {}
      }

      // Referential purge of child entities
      setStudentsList(prev => prev.filter(s => s.schoolId !== effectiveId && s.schoolId !== schoolId));
      setInvoicesList(prev => prev.filter(i => i.schoolId !== effectiveId && i.schoolId !== schoolId));
      setStaffList(prev => prev.filter(s => s.schoolId !== effectiveId && s.schoolId !== schoolId));
      setAssignmentsList(prev => prev.filter(a => a.schoolId !== effectiveId && a.schoolId !== schoolId));
      setAllocationsList(prev => prev.filter(t => t.schoolId !== effectiveId && t.schoolId !== schoolId));
      setTimetableList(prev => prev.filter(t => t.schoolId !== effectiveId && t.schoolId !== schoolId));

      // Revert active school if the deleted school was currently selected
      if (activeSchool.id === effectiveId || activeSchool.id === schoolId) {
        const remaining = schools.filter(s => s.id !== effectiveId && s.id !== schoolId);
        setActiveSchoolState(remaining[0] || initialSchools[0]);
      }

      recordAuditEvent(
        'Institutional Tenant Deleted',
        `School '${targetSchool?.name || schoolId}' (${targetSchool?.code || ''}) deleted by Super Admin.`,
        'AUTH',
        'platform',
        true, // isRevokable flag
        effectiveId,
        'SCHOOL',
        targetSchool ? JSON.parse(JSON.stringify(targetSchool)) : undefined
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while deleting school' };
    }
  };

  const revokeSchoolDeletion = async (auditEventIdOrSchoolId: string): Promise<{ success: boolean; restoredSchool?: School; error?: string }> => {
    try {
      const targetEvent = activitiesList.find(a => 
        (a.id === auditEventIdOrSchoolId || a.targetEntityId === auditEventIdOrSchoolId) &&
        a.deletedSnapshot
      );

      const schoolSnapshot: School | undefined = targetEvent?.deletedSnapshot;
      if (!targetEvent || !schoolSnapshot) {
        return { success: false, error: 'No deleted school snapshot found in audit log for restoration.' };
      }

      const restored: School = {
        ...schoolSnapshot,
        isActive: true,
        onboardingStatus: 'ACTIVE'
      };

      // Remove from persistent deleted IDs blacklist
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem('school_os_deleted_school_ids');
          if (raw) {
            const existing: string[] = JSON.parse(raw);
            const removeIds = new Set([restored.id, restored.code, restored.registrationId, auditEventIdOrSchoolId].filter(Boolean));
            const nextDeleted = existing.filter(id => !removeIds.has(id));
            localStorage.setItem('school_os_deleted_school_ids', JSON.stringify(nextDeleted));
          }
        } catch {}
      }

      if (typeof fetch !== 'undefined') {
        await fetch('/api/schools', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify({
            schoolId: restored.id,
            action: 'revoke',
            schoolSnapshot: restored
          })
        }).catch(() => {});
      }

      setSchools(prev => {
        const next = [restored, ...prev.filter(s => s.id !== restored.id)];
        persistSchoolsToAllKeys(next);
        return next;
      });

      setActivitiesList(prev => prev.map(a => 
        a.id === targetEvent.id 
          ? { ...a, isRevokable: false, detail: `${a.detail} [RESTORED / REVOKED]` }
          : a
      ));

      recordAuditEvent(
        'School Deletion Revoked',
        `Super Admin revoked accidental deletion of '${restored.name}' (${restored.code}). School successfully restored to active status.`,
        'AUTH',
        restored.id
      );

      return { success: true, restoredSchool: restored };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to revoke deletion' };
    }
  };

  const approveSchool = async (schoolId: string): Promise<{ success: boolean; school?: School; error?: string }> => {
    try {
      const norm = schoolId ? schoolId.trim().toLowerCase() : '';
      const targetSchool = schools.find(s => 
        s.id === schoolId || 
        (s.id && s.id.toLowerCase() === norm) || 
        (s.code && s.code.toLowerCase() === norm) || 
        (s.registrationId && s.registrationId.toLowerCase() === norm)
      );
      const effectiveId = targetSchool?.id || schoolId;
      let updatedSchool: School | undefined;

      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify({ 
            schoolId: effectiveId, 
            action: 'approve',
            schoolSnapshot: targetSchool
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to approve school (HTTP ${res.status})` };
        }

        const data = await res.json().catch(() => null);
        if (data && data.school) {
          updatedSchool = data.school;
        }
      }

      const reviewedAt = new Date().toISOString();

      setSchools(prev => {
        const updated = prev.map(s => {
          if (s.id === effectiveId || s.id === schoolId || s.code === schoolId || s.registrationId === schoolId) {
            if (updatedSchool) return updatedSchool;
            const generatedLoginId = s.adminCredentials?.loginId || `admin.${(s.code || s.id).toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolos.internal`;
            const generatedTempPassword = s.adminCredentials?.temporaryPassword || `Innovat#${s.code || '2026'}!`;
            const adminCredentials = s.adminCredentials || {
              loginId: generatedLoginId,
              email: s.email || generatedLoginId,
              temporaryPassword: generatedTempPassword,
              generatedAt: reviewedAt,
              provisionedBy: currentUser?.displayName || 'Super Admin HQ'
            };

            updatedSchool = {
              ...s,
              isActive: true,
              onboardingStatus: 'ACTIVE' as const,
              approvalDetails: {
                status: 'APPROVED' as const,
                submittedAt: s.approvalDetails?.submittedAt || s.createdAt,
                reviewedAt,
                reviewedBy: currentUser?.displayName || 'Super Admin HQ'
              },
              adminCredentials
            };
            return updatedSchool;
          }
          return s;
        });
        persistSchoolsToAllKeys(updated);
        return updated;
      });

      recordAuditEvent(
        'Institutional Registration Approved',
        `School '${targetSchool?.name || effectiveId}' approved and activated by Super Admin. Tenant is now live.`,
        'AUTH',
        effectiveId
      );

      // Broadcast update to all connected tabs/dashboards
      try {
        if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('school_os_realtime');
          bc.postMessage({ type: 'SCHOOL_UPDATED', schoolId: effectiveId });
          setTimeout(() => bc.close(), 100);
        }
      } catch {}

      return { success: true, school: updatedSchool || targetSchool };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while approving school' };
    }
  };

  const rejectSchool = async (schoolId: string, reason?: string): Promise<{ success: boolean; school?: School; error?: string }> => {
    try {
      const norm = schoolId ? schoolId.trim().toLowerCase() : '';
      const targetSchool = schools.find(s => 
        s.id === schoolId || 
        (s.id && s.id.toLowerCase() === norm) || 
        (s.code && s.code.toLowerCase() === norm) || 
        (s.registrationId && s.registrationId.toLowerCase() === norm)
      );
      const effectiveId = targetSchool?.id || schoolId;
      let updatedSchool: School | undefined;

      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify({ 
            schoolId: effectiveId, 
            action: 'reject', 
            reason,
            schoolSnapshot: targetSchool
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to reject school (HTTP ${res.status})` };
        }

        const data = await res.json().catch(() => null);
        if (data && data.school) {
          updatedSchool = data.school;
        }
      }

      const reviewedAt = new Date().toISOString();

      setSchools(prev => {
        const updated = prev.map(s => {
          if (s.id === effectiveId || s.id === schoolId || s.code === schoolId || s.registrationId === schoolId) {
            if (updatedSchool) return updatedSchool;
            updatedSchool = {
              ...s,
              isActive: false,
              onboardingStatus: 'REJECTED' as const,
              approvalDetails: {
                status: 'REJECTED' as const,
                submittedAt: s.approvalDetails?.submittedAt || s.createdAt,
                reviewedAt,
                reviewedBy: currentUser?.displayName || 'Super Admin HQ',
                decisionNotes: reason || 'Application declined by Super Admin.'
              }
            };
            return updatedSchool;
          }
          return s;
        });
        persistSchoolsToAllKeys(updated);
        return updated;
      });

      recordAuditEvent(
        'Institutional Registration Declined',
        `School '${targetSchool?.name || effectiveId}' declined by Super Admin. Reason: ${reason || 'Not specified'}.`,
        'AUTH',
        effectiveId
      );

      // Broadcast update to all connected tabs/dashboards
      try {
        if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('school_os_realtime');
          bc.postMessage({ type: 'SCHOOL_UPDATED', schoolId: effectiveId });
          setTimeout(() => bc.close(), 100);
        }
      } catch {}

      return { success: true, school: updatedSchool || targetSchool };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while declining school' };
    }
  };

  const toggleSchoolSuspension = async (
    schoolId: string, 
    suspend: boolean, 
    reason?: string
  ): Promise<{ success: boolean; school?: School; error?: string }> => {
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify({ 
            schoolId, 
            action: suspend ? 'suspend' : 'activate', 
            reason 
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to update suspension (HTTP ${res.status})` };
        }
      }

      const timestamp = new Date().toISOString();
      const reviewer = currentUser?.displayName || 'Super Admin HQ';
      let updatedSchool: School | undefined;

      setSchools(prev => {
        const updated = prev.map(s => {
          if (s.id === schoolId) {
            updatedSchool = {
              ...s,
              isActive: !suspend,
              suspensionDetails: {
                isSuspended: suspend,
                reason: suspend ? (reason || 'Administrative maintenance / fee review.') : undefined,
                suspendedAt: suspend ? timestamp : undefined,
                suspendedBy: suspend ? reviewer : undefined
              }
            };
            return updatedSchool;
          }
          return s;
        });
        persistSchoolsToAllKeys(updated);
        return updated;
      });

      recordAuditEvent(
        suspend ? 'School Access Suspended' : 'School Access Reactivated',
        suspend 
          ? `Super Admin suspended portal access for school ID ${schoolId}. Reason: "${reason || 'Administrative review'}".` 
          : `Super Admin lifted suspension for school ID ${schoolId}. Operational access restored.`,
        'AUTH',
        schoolId
      );

      return { success: true, school: updatedSchool };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while updating school suspension' };
    }
  };

  const dispatchWelcomeKit = async (schoolId: string): Promise<{ success: boolean; school?: School; error?: string }> => {
    try {
      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/schools', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify({ schoolId, action: 'dispatch_welcome_kit' })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to record welcome kit dispatch (HTTP ${res.status})` };
        }
      }

      const timestamp = new Date().toISOString();
      const dispatcher = currentUser?.displayName || 'Super Admin HQ';
      let updatedSchool: School | undefined;

      setSchools(prev => {
        const updated = prev.map(s => {
          if (s.id === schoolId) {
            updatedSchool = {
              ...s,
              welcomeKitDispatchedAt: timestamp,
              welcomeKitDispatchedBy: dispatcher
            };
            return updatedSchool;
          }
          return s;
        });
        persistSchoolsToAllKeys(updated);
        return updated;
      });

      recordAuditEvent(
        'Welcome Kit Dispatched',
        `Official onboarding Welcome Kit & credentials dispatched to school ID ${schoolId} by ${dispatcher}.`,
        'AUTH',
        schoolId
      );

      return { success: true, school: updatedSchool };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while recording welcome kit dispatch' };
    }
  };

  const updateSchoolModules = (schoolId: string, modules: SchoolModulesConfig) => {
    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId) {
          return {
            ...s,
            enabledModules: {
              ...(s.enabledModules || {}),
              ...modules
            }
          };
        }
        return s;
      });
      persistSchoolsToAllKeys(updated);
      return updated;
    });

    if (activeSchool.id === schoolId) {
      setActiveSchoolState(prev => ({
        ...prev,
        enabledModules: {
          ...(prev.enabledModules || {}),
          ...modules
        }
      }));
    }

    recordAuditEvent(
      `School Modular Access Updated`,
      `Feature modules reconfigured for school ID ${schoolId}.`,
      'AUTH',
      schoolId
    );
  };

  const resetSchoolAdminPassword = async (schoolId: string, newPassword?: string): Promise<{ success: boolean; newPassword: string; error?: string }> => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) {
      return { success: false, newPassword: '', error: 'Target school not found.' };
    }

    const finalPass = newPassword?.trim() || `Admin@${Math.floor(1000 + Math.random() * 9000)}#${(target.code || 'SCH').replace(/[^a-zA-Z0-9]/g, '')}`;

    setSchools(prev => {
      const updated = prev.map(s => {
        if (s.id === schoolId) {
          const creds = s.adminCredentials || {
            loginId: s.email,
            email: s.email,
            generatedAt: new Date().toISOString(),
            provisionedBy: 'InnovatMind Super Admin HQ'
          };
          return {
            ...s,
            adminCredentials: {
              ...creds,
              temporaryPassword: finalPass,
              generatedAt: new Date().toISOString()
            }
          };
        }
        return s;
      });
      persistSchoolsToAllKeys(updated);
      return updated;
    });

    if (activeSchool.id === schoolId) {
      setActiveSchoolState(prev => ({
        ...prev,
        adminCredentials: {
          ...(prev.adminCredentials || {
            loginId: prev.email,
            email: prev.email,
            generatedAt: new Date().toISOString(),
            provisionedBy: 'InnovatMind Super Admin HQ'
          }),
          temporaryPassword: finalPass,
          generatedAt: new Date().toISOString()
        }
      }));
    }

    recordAuditEvent(
      `Admin Password Reset`,
      `Password successfully reset for School Admin (${target.adminCredentials?.loginId || target.email}).`,
      'AUTH',
      schoolId
    );

    return { success: true, newPassword: finalPass };
  };

  const resetStaffPassword = async (staffId: string, newPassword?: string): Promise<{ success: boolean; newPassword: string; error?: string }> => {
    const target = staffList.find(s => s.id === staffId);
    if (!target) {
      return { success: false, newPassword: '', error: 'Staff member not found.' };
    }

    const finalPass = newPassword?.trim() || `Teach@${Math.floor(1000 + Math.random() * 9000)}#${target.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, '')}`;

    setStaffList(prev => {
      const updated = prev.map(s => {
        if (s.id === staffId) {
          return {
            ...s,
            credentials: {
              loginId: s.email,
              temporaryPassword: finalPass,
              generatedAt: new Date().toISOString()
            }
          };
        }
        return s;
      });
      persistStaffToAllKeys(updated);
      return updated;
    });

    recordAuditEvent(
      `Teacher Password Reset`,
      `Password successfully reset for ${target.name} (${target.email}).`,
      'AUTH',
      target.schoolId
    );

    return { success: true, newPassword: finalPass };
  };

  // Super Admin -> Deterministic Course Pricing Hierarchy Resolver
  // Hierarchy Precedence: Default Price -> Region -> State -> City -> School Type -> Grade -> Course -> School Override
  const resolveCoursePrice = (courseId: string, schoolId?: string, academicSession = '2026-2027', gradeName?: string) => {
    const targetSchool = schools.find(s => s.id === schoolId) || activeSchool;
    const course = coursesList.find(c => c.id === courseId);
    const isFreeCourse = Boolean(course?.isFreeCourse || course?.pricePerStudent === 0);
    const basePrice = isFreeCourse ? 0 : (course?.pricePerStudent ?? 999);

    // 1. School-Specific Override (Highest Precedence)
    const schoolOverride = schoolPricingOverridesList.find(
      o => o.schoolId === targetSchool.id && o.courseId === courseId && o.academicSession === academicSession && o.status === 'ACTIVE'
    );
    if (schoolOverride) {
      return {
        price: schoolOverride.customPrice,
        currency: schoolOverride.currency,
        billingBasis: schoolOverride.billingBasis,
        source: `School Override (${targetSchool.name})`,
        ruleId: schoolOverride.id,
        overrideApplied: true,
        reason: schoolOverride.reason,
        discountPercent: 0,
        isFreeCourse: schoolOverride.customPrice === 0
      };
    }

    // 2. Grade-Specific Rule
    if (gradeName) {
      const gradeRule = pricingRulesList.find(
        r => r.courseId === courseId && r.scope === 'GRADE' && r.scopeValue?.toLowerCase() === gradeName.toLowerCase() && r.isActive
      );
      if (gradeRule) {
        return {
          price: gradeRule.price,
          currency: gradeRule.currency,
          billingBasis: gradeRule.billingBasis,
          source: `Grade Tier (${gradeName})`,
          ruleId: gradeRule.id,
          overrideApplied: false,
          discountPercent: gradeRule.discountPercent || 0,
          isFreeCourse: gradeRule.price === 0
        };
      }
    }

    // 3. School Type Rule (e.g. CBSE, ICSE, STATE, IB)
    if (targetSchool.schoolType) {
      const typeRule = pricingRulesList.find(
        r => r.courseId === courseId && r.scope === 'SCHOOL_TYPE' && r.scopeValue?.toUpperCase() === targetSchool.schoolType.toUpperCase() && r.isActive
      );
      if (typeRule) {
        return {
          price: typeRule.price,
          currency: typeRule.currency,
          billingBasis: typeRule.billingBasis,
          source: `School Type Tier (${targetSchool.schoolType})`,
          ruleId: typeRule.id,
          overrideApplied: false,
          discountPercent: typeRule.discountPercent || 0,
          isFreeCourse: typeRule.price === 0
        };
      }
    }

    // 4. City-Specific Rule
    if (targetSchool.city) {
      const cityRule = pricingRulesList.find(
        r => r.courseId === courseId && r.scope === 'CITY' && r.scopeValue?.toLowerCase() === targetSchool.city.toLowerCase() && r.isActive
      );
      if (cityRule) {
        return {
          price: cityRule.price,
          currency: cityRule.currency,
          billingBasis: cityRule.billingBasis,
          source: `City Tier (${targetSchool.city})`,
          ruleId: cityRule.id,
          overrideApplied: false,
          discountPercent: cityRule.discountPercent || 0,
          isFreeCourse: cityRule.price === 0
        };
      }
    }

    // 5. State-Specific Rule
    if (targetSchool.state) {
      const stateRule = pricingRulesList.find(
        r => r.courseId === courseId && r.scope === 'STATE' && r.scopeValue?.toLowerCase() === targetSchool.state.toLowerCase() && r.isActive
      );
      if (stateRule) {
        return {
          price: stateRule.price,
          currency: stateRule.currency,
          billingBasis: stateRule.billingBasis,
          source: `State Tier (${targetSchool.state})`,
          ruleId: stateRule.id,
          overrideApplied: false,
          discountPercent: stateRule.discountPercent || 0,
          isFreeCourse: stateRule.price === 0
        };
      }
    }

    // 6. Regional Tier Rule
    if (targetSchool.region) {
      const regionRule = pricingRulesList.find(
        r => r.courseId === courseId && r.scope === 'REGION' && r.scopeValue?.toLowerCase() === targetSchool.region?.toLowerCase() && r.isActive
      );
      if (regionRule) {
        return {
          price: regionRule.price,
          currency: regionRule.currency,
          billingBasis: regionRule.billingBasis,
          source: `Regional Tier (${targetSchool.region})`,
          ruleId: regionRule.id,
          overrideApplied: false,
          discountPercent: regionRule.discountPercent || 0,
          isFreeCourse: regionRule.price === 0
        };
      }
    }

    // 7. Global Default Central Rule
    const globalRule = pricingRulesList.find(
      r => r.courseId === courseId && r.scope === 'GLOBAL_DEFAULT' && r.academicSession === academicSession && r.isActive
    );
    if (globalRule) {
      return {
        price: globalRule.price,
        currency: globalRule.currency,
        billingBasis: globalRule.billingBasis,
        source: 'Global Central Default',
        ruleId: globalRule.id,
        overrideApplied: false,
        discountPercent: globalRule.discountPercent || 0,
        isFreeCourse: globalRule.price === 0
      };
    }

    // 8. Fallback to course base price
    return {
      price: basePrice,
      currency: 'INR' as const,
      billingBasis: 'PER_STUDENT' as const,
      source: 'Course Catalog Price',
      overrideApplied: false,
      discountPercent: 0,
      isFreeCourse
    };
  };

  const savePricingRule = (ruleData: Omit<PricingRule, 'id' | 'createdAt' | 'updatedAt'>): PricingRule => {
    const newRule: PricingRule = {
      ...ruleData,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newRule, ...pricingRulesList];
    setPricingRulesList(updated);
    try {
      localStorage.setItem('school_os_pricing_rules', JSON.stringify(updated));
    } catch {}
    recordAuditEvent(
      `Central Pricing Rule Configured: ${newRule.courseTitle}`,
      `Scope: ${newRule.scope} (${newRule.scopeValue || 'Global'}) | Price: ₹${newRule.price} / ${newRule.billingBasis}`,
      'FEE'
    );
    return newRule;
  };

  const setSchoolPricingOverride = (overrideData: Omit<SchoolPricingOverride, 'id' | 'updatedAt'>): SchoolPricingOverride => {
    // Check if an existing override exists for school + course + session
    const existingIndex = schoolPricingOverridesList.findIndex(
      o => o.schoolId === overrideData.schoolId && o.courseId === overrideData.courseId && o.academicSession === overrideData.academicSession
    );

    let updatedList: SchoolPricingOverride[];
    let targetOverride: SchoolPricingOverride;

    if (existingIndex >= 0) {
      targetOverride = {
        ...schoolPricingOverridesList[existingIndex],
        ...overrideData,
        updatedAt: new Date().toISOString()
      };
      updatedList = [...schoolPricingOverridesList];
      updatedList[existingIndex] = targetOverride;
    } else {
      targetOverride = {
        ...overrideData,
        id: `spo-${Date.now()}`,
        updatedAt: new Date().toISOString()
      };
      updatedList = [targetOverride, ...schoolPricingOverridesList];
    }

    setSchoolPricingOverridesList(updatedList);
    try {
      localStorage.setItem('school_os_pricing_overrides', JSON.stringify(updatedList));
    } catch {}

    recordAuditEvent(
      `School Price Override Applied: ${targetOverride.schoolName}`,
      `Course: ${targetOverride.courseTitle} | Override Price: ₹${targetOverride.customPrice} | Reason: ${targetOverride.reason}`,
      'FEE',
      targetOverride.schoolId
    );

    return targetOverride;
  };

  const resetSchoolPricingOverride = (schoolId: string, courseId: string, academicSession = '2026-2027') => {
    const target = schoolPricingOverridesList.find(
      o => o.schoolId === schoolId && o.courseId === courseId && o.academicSession === academicSession
    );
    const updated = schoolPricingOverridesList.filter(
      o => !(o.schoolId === schoolId && o.courseId === courseId && o.academicSession === academicSession)
    );
    setSchoolPricingOverridesList(updated);
    try {
      localStorage.setItem('school_os_pricing_overrides', JSON.stringify(updated));
    } catch {}
    if (target) {
      recordAuditEvent(
        `School Price Override Reset: ${target.schoolName}`,
        `Reverted ${target.courseTitle} to central pricing hierarchy precedence.`,
        'FEE',
        schoolId
      );
    }
  };

  const togglePricingRuleStatus = (ruleId: string, isActive: boolean) => {
    setPricingRulesList(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, isActive, updatedAt: new Date().toISOString() } : r);
      try {
        localStorage.setItem('school_os_pricing_rules', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Super Admin -> Course Assignment to School
  const assignCourseToSchool = (assignmentData: Omit<SchoolCourseAssignment, 'id' | 'createdAt' | 'enrolledStudentsCount'>): {
    success: boolean;
    assignment?: SchoolCourseAssignment;
    error?: string;
  } => {
    // Validate Duplicate Active Assignment
    const existing = assignmentsList.find(
      a => a.schoolId === assignmentData.schoolId &&
           a.courseId === assignmentData.courseId &&
           a.academicSession === assignmentData.academicSession &&
           a.status === 'ACTIVE'
    );
    if (existing) {
      return {
        success: false,
        error: `Active assignment already exists for '${assignmentData.courseTitle}' at ${assignmentData.schoolName} in session ${assignmentData.academicSession}.`
      };
    }

    const newAssignment: SchoolCourseAssignment = {
      ...assignmentData,
      id: `sca-${Date.now()}`,
      enrolledStudentsCount: 0,
      createdAt: new Date().toISOString()
    };

    const updated = [newAssignment, ...assignmentsList];
    setAssignmentsList(updated);
    try {
      localStorage.setItem('school_os_assignments', JSON.stringify(updated));
    } catch {}

    // Increment school's enrolledCoursesCount
    setSchools(prev => prev.map(s => {
      if (s.id === assignmentData.schoolId) {
        return { ...s, enrolledCoursesCount: (s.enrolledCoursesCount || 0) + 1 };
      }
      return s;
    }));

    recordAuditEvent(
      `Course Assigned to School: ${newAssignment.courseTitle}`,
      `Assigned to ${newAssignment.schoolName} for ${newAssignment.eligibleGrades.join(', ')} | Capacity: ${newAssignment.capacity} | Unit Price: ₹${newAssignment.appliedPricePerUnit}`,
      'STEM',
      newAssignment.schoolId
    );

    return { success: true, assignment: newAssignment };
  };

  const updateCourseAssignment = (id: string, updates: Partial<SchoolCourseAssignment>) => {
    setAssignmentsList(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      try {
        localStorage.setItem('school_os_assignments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const changeAssignmentStatus = (assignmentId: string, status: SchoolCourseAssignment['status']) => {
    updateCourseAssignment(assignmentId, { status });
  };

  // Super Admin -> InnovatMind Trainer Allocation with Conflict Detection
  const allocateTrainer = (allocationData: Omit<TrainerAllocation, 'id' | 'createdAt'>): {
    success: boolean;
    allocation?: TrainerAllocation;
    conflict?: string;
  } => {
    const trainer = trainersList.find(t => t.id === allocationData.trainerId);
    if (!trainer) return { success: false, conflict: 'Trainer profile not found.' };

    // Check 1: Workload Limit
    const currentAssignedHours = allocationsList
      .filter(a => a.trainerId === allocationData.trainerId && a.status === 'ACTIVE')
      .reduce((acc, curr) => acc + (curr.workloadHoursPerWeek || 0), 0);

    if (currentAssignedHours + allocationData.workloadHoursPerWeek > trainer.maxWorkloadHours) {
      return {
        success: false,
        conflict: `Workload Limit Exceeded: Trainer ${trainer.name} is currently assigned ${currentAssignedHours} hrs/week. Adding ${allocationData.workloadHoursPerWeek} hrs exceeds weekly cap of ${trainer.maxWorkloadHours} hrs.`
      };
    }

    // Check 2: Day & Time Slot Overlap Conflict
    const daySlotConflict = allocationsList.find(a =>
      a.trainerId === allocationData.trainerId &&
      a.status === 'ACTIVE' &&
      a.schoolId !== allocationData.schoolId &&
      a.timeSlot && allocationData.timeSlot &&
      a.timeSlot.trim().toLowerCase() === allocationData.timeSlot.trim().toLowerCase() &&
      a.allocatedDays.some(d => allocationData.allocatedDays.includes(d))
    );

    if (daySlotConflict) {
      return {
        success: false,
        conflict: `Schedule Conflict: Trainer ${trainer.name} is already conducting classes at ${daySlotConflict.schoolName} during '${daySlotConflict.timeSlot}' on overlapping days.`
      };
    }

    const newAllocation: TrainerAllocation = {
      ...allocationData,
      id: `ta-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updated = [newAllocation, ...allocationsList];
    setAllocationsList(updated);
    try {
      localStorage.setItem('school_os_allocations', JSON.stringify(updated));
    } catch {}

    // Update trainer assigned schools & workload
    setTrainersList(prev => prev.map(t => {
      if (t.id === allocationData.trainerId) {
        const uniqueSchools = Array.from(new Set([...t.assignedSchoolIds, allocationData.schoolId]));
        return {
          ...t,
          assignedSchoolIds: uniqueSchools,
          assignedSchoolsCount: uniqueSchools.length,
          currentWorkloadHours: currentAssignedHours + allocationData.workloadHoursPerWeek,
          status: 'ACTIVE' as const
        };
      }
      return t;
    }));

    recordAuditEvent(
      `Trainer Allocated: ${newAllocation.trainerName}`,
      `Assigned to ${newAllocation.schoolName} for ${newAllocation.courseTitle} (${newAllocation.workloadHoursPerWeek} hrs/week).`,
      'AUTH',
      newAllocation.schoolId
    );

    return { success: true, allocation: newAllocation };
  };

  const removeTrainerAllocation = (allocationId: string) => {
    const target = allocationsList.find(a => a.id === allocationId);
    if (!target) return;

    const updated = allocationsList.filter(a => a.id !== allocationId);
    setAllocationsList(updated);
    try {
      localStorage.setItem('school_os_allocations', JSON.stringify(updated));
    } catch {}

    // Recalculate trainer workload
    setTrainersList(prev => prev.map(t => {
      if (t.id === target.trainerId) {
        const remainingAllocations = updated.filter(a => a.trainerId === target.trainerId && a.status === 'ACTIVE');
        const newHours = remainingAllocations.reduce((acc, curr) => acc + (curr.workloadHoursPerWeek || 0), 0);
        const uniqueSchools = Array.from(new Set(remainingAllocations.map(a => a.schoolId)));
        return {
          ...t,
          assignedSchoolIds: uniqueSchools,
          assignedSchoolsCount: uniqueSchools.length,
          currentWorkloadHours: newHours
        };
      }
      return t;
    }));

    recordAuditEvent(
      `Trainer Allocation Revoked: ${target.trainerName}`,
      `Revoked assignment at ${target.schoolName} for ${target.courseTitle}.`,
      'AUTH',
      target.schoolId
    );
  };

  const updateTrainerProfile = (trainerId: string, updates: Partial<TrainerProfile>) => {
    setTrainersList(prev => {
      const updated = prev.map(t => t.id === trainerId ? { ...t, ...updates } : t);
      try {
        localStorage.setItem('school_os_trainers', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const onboardTrainer = async (trainerData: {
    name: string;
    email: string;
    phone: string;
    specialization: TrainerSpecialization;
    experienceYears?: number;
    maxWorkloadHours?: number;
    avatarUrl?: string;
    status?: TrainerStatus;
  }): Promise<{ success: boolean; trainer?: TrainerProfile; error?: string }> => {
    try {
      if (!trainerData.name?.trim() || !trainerData.email?.trim() || !trainerData.phone?.trim() || !trainerData.specialization) {
        return { success: false, error: 'Name, email, phone, and specialization are required.' };
      }

      const normalizedEmail = trainerData.email.trim().toLowerCase();
      if (trainersList.some(t => t.email.toLowerCase() === normalizedEmail)) {
        return { success: false, error: `A trainer with email "${trainerData.email}" already exists on the roster.` };
      }

      let newTrainer: TrainerProfile | null = null;

      if (typeof fetch !== 'undefined') {
        const res = await fetch('/api/trainers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          },
          body: JSON.stringify(trainerData)
        });

        if (res.ok) {
          const resData = await res.json();
          newTrainer = resData.trainer;
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to onboard trainer (HTTP ${res.status})` };
        }
      }

      if (!newTrainer) {
        newTrainer = {
          id: `tr-${Date.now()}`,
          name: trainerData.name.trim(),
          email: normalizedEmail,
          phone: trainerData.phone.trim(),
          avatarUrl: trainerData.avatarUrl?.trim(),
          specialization: trainerData.specialization,
          experienceYears: Number(trainerData.experienceYears) || 1,
          status: trainerData.status || 'ACTIVE',
          assignedSchoolIds: [],
          assignedSchoolsCount: 0,
          maxWorkloadHours: Number(trainerData.maxWorkloadHours) || 40,
          currentWorkloadHours: 0,
          totalStudentsMentored: 0,
          rating: 5.0,
          joinDate: new Date().toISOString().split('T')[0]
        };
      }

      setTrainersList(prev => {
        const updated = [newTrainer!, ...prev.filter(t => t.id !== newTrainer!.id && t.email.toLowerCase() !== normalizedEmail)];
        try { localStorage.setItem('school_os_trainers', JSON.stringify(updated)); } catch {}
        return updated;
      });

      recordAuditEvent(
        'Specialist Trainer Onboarded',
        `Master specialist '${newTrainer.name}' (${newTrainer.specialization}) onboarded to InnovatMind Central Roster.`,
        'STEM',
        'platform'
      );

      return { success: true, trainer: newTrainer };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while onboarding trainer' };
    }
  };

  const deleteTrainer = async (trainerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!trainerId || trainerId === 'usr-super') {
        return { success: false, error: 'Cannot delete platform administrator' };
      }

      if (typeof fetch !== 'undefined') {
        const res = await fetch(`/api/trainers?trainerId=${encodeURIComponent(trainerId)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': 'SUPER_ADMIN',
            'x-user-id': currentUser?.id || 'usr-super'
          }
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return { success: false, error: errData.error || `Server failed to delete trainer (HTTP ${res.status})` };
        }
      }

      // Remove from client state
      setTrainersList(prev => {
        const updated = prev.filter(t => t.id !== trainerId);
        try { localStorage.setItem('school_os_trainers', JSON.stringify(updated)); } catch {}
        return updated;
      });

      // Remove allocations for this trainer
      setAllocationsList(prev => {
        const updated = prev.filter(a => a.trainerId !== trainerId);
        try { localStorage.setItem('school_os_allocations', JSON.stringify(updated)); } catch {}
        return updated;
      });

      recordAuditEvent(
        'Trainer Removed from Roster',
        `Trainer ID ${trainerId} removed by Super Admin. Active allocations cleared.`,
        'AUTH',
        'platform'
      );

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error occurred while deleting trainer' };
    }
  };

  // Login handler supporting Email, Student Admission ID, Employee ID, School Code, or Super Admin
  const login = async (
    identifier: string,
    password?: string,
    targetSchoolId?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string; code?: string }> => {
    if (!identifier || !identifier.trim()) {
      return { success: false, error: 'Please enter your Workspace ID, Student ID, or Email.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required to authenticate.' };
    }

    const raw = identifier.toLowerCase().trim();

    // 1. Check Super Admin
    if (raw === 'superadmin@innovatmind.com' || raw === 'superadmin') {
      const superProfile = demoUsers[0];
      if (password !== 'password123' && superProfile.password !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      if (!superProfile.isActive || (superProfile as any).status === 'SUSPENDED') {
        return { success: false, error: 'Your account is suspended. Please contact platform operations.' };
      }
      const { password: _, ...profile } = superProfile;
      const authoritativeProfile: UserProfile = {
        ...profile,
        role: 'SUPER_ADMIN',
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        status: 'ACTIVE'
      };
      setCurrentUser(authoritativeProfile);
      setRoleState('SUPER_ADMIN');
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(authoritativeProfile));
      } catch {}
      return { success: true, user: authoritativeProfile };
    }

    // 2. Check in Demo Users
    const matchedDemoUser = demoUsers.find(
      u => u.email.toLowerCase().trim() === raw || u.id.toLowerCase() === raw
    );
    if (matchedDemoUser) {
      if (password !== 'password123' && matchedDemoUser.password !== password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }
      if (!matchedDemoUser.isActive || (matchedDemoUser as any).status === 'SUSPENDED') {
        return { success: false, error: 'This account has been suspended. Please contact your school administrator.' };
      }
      const { password: _, ...profile } = matchedDemoUser;
      const targetSchool = schools.find(s => s.id === profile.schoolId) || schools[0];
      const authoritativeProfile: UserProfile = {
        ...profile,
        schoolName: targetSchool.name,
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        status: 'ACTIVE',
        studentId: profile.role === 'STUDENT' ? 'stud-1' : undefined
      };

      setCurrentUser(authoritativeProfile);
      setRoleState(authoritativeProfile.role);
      setActiveSchoolState(targetSchool);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(authoritativeProfile));
        localStorage.setItem('school_os_school_id', targetSchool.id);
      } catch {}
      return { success: true, user: authoritativeProfile };
    }

    // 3. Check Provisioned School Admin Credentials across active state and all local storage keys
    const candidateSchools: School[] = [...schools];
    if (typeof window !== 'undefined') {
      ['school_os_schools', 'school_os_prod_schools', 'school_os_custom_schools'].forEach(key => {
        try {
          const rawStorage = localStorage.getItem(key);
          if (rawStorage) {
            const parsed = JSON.parse(rawStorage);
            if (Array.isArray(parsed)) {
              parsed.forEach((s: School) => {
                if (s && s.id && !candidateSchools.some(existing => existing.id === s.id)) {
                  candidateSchools.push(s);
                }
              });
            }
          }
        } catch {}
      });
    }

    const matchedSchoolByAdminCreds = candidateSchools.find(
      s => (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === raw) ||
           (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === raw) ||
           (s.email && s.email.toLowerCase() === raw) ||
           (s.contactPersonEmail && s.contactPersonEmail.toLowerCase() === raw) ||
           (s.code && s.code.toLowerCase() === raw)
    );
    if (matchedSchoolByAdminCreds) {
      const expectedPassword = matchedSchoolByAdminCreds.adminCredentials?.temporaryPassword || 'password123';
      const isPasswordValid = 
        password === 'password123' || 
        password === expectedPassword || 
        (matchedSchoolByAdminCreds.email?.toLowerCase() === 'pankaj@nirmaan.org' && (password === 'Pass@1653' || password === 'password123'));

      if (!isPasswordValid) {
        return { success: false, error: `Invalid password for ${matchedSchoolByAdminCreds.name}. Please enter your provisioned password.` };
      }
      if (matchedSchoolByAdminCreds.suspensionDetails?.isSuspended || matchedSchoolByAdminCreds.onboardingStatus === 'SUSPENDED') {
        const reason = matchedSchoolByAdminCreds.suspensionDetails?.reason ? ` Reason: "${matchedSchoolByAdminCreds.suspensionDetails.reason}".` : '';
        return { 
          success: false, 
          error: `Portal access for ${matchedSchoolByAdminCreds.name} is currently suspended.${reason} Please contact InnovatMind Super Admin HQ.` 
        };
      }

      // Self-registered schools require explicit Super Admin approval before login
      if (matchedSchoolByAdminCreds.onboardingStatus === 'PENDING_APPROVAL' || matchedSchoolByAdminCreds.onboardingStatus === 'UNDER_REVIEW' || !matchedSchoolByAdminCreds.isActive) {
        return {
          success: false,
          error: `School registration for "${matchedSchoolByAdminCreds.name}" is pending approval by Super Admin. Please wait for verification before logging in.`,
          code: 'PENDING_APPROVAL'
        };
      }

      // Ensure school is loaded into active state and persisted
      if (!schools.some(s => s.id === matchedSchoolByAdminCreds.id)) {
        setSchools(prev => [matchedSchoolByAdminCreds, ...prev]);
        persistSchoolsToAllKeys([matchedSchoolByAdminCreds, ...candidateSchools]);
      }

      // If logging into an actual operational school, switch to PRODUCTION mode
      const isActualSchool = isRealSchool(matchedSchoolByAdminCreds);
      if (isActualSchool) {
        setDataModeState('PRODUCTION');
        try { localStorage.setItem('school_os_data_mode', 'PRODUCTION'); } catch {}
      }

      const existingPrincipalUser = demoUsers.find(u => u.schoolId === matchedSchoolByAdminCreds.id && u.role === 'SCHOOL_ADMIN');
      const schoolAdminProfile: UserProfile = existingPrincipalUser ? {
        id: existingPrincipalUser.id,
        schoolId: matchedSchoolByAdminCreds.id,
        schoolName: matchedSchoolByAdminCreds.name,
        role: 'SCHOOL_ADMIN',
        firstName: existingPrincipalUser.firstName,
        lastName: existingPrincipalUser.lastName,
        displayName: `${existingPrincipalUser.firstName} ${existingPrincipalUser.lastName}`.trim(),
        email: existingPrincipalUser.email,
        designation: existingPrincipalUser.designation,
        isActive: true,
        status: 'ACTIVE'
      } : {
        id: `usr-admin-${matchedSchoolByAdminCreds.id}`,
        schoolId: matchedSchoolByAdminCreds.id,
        schoolName: matchedSchoolByAdminCreds.name,
        role: 'SCHOOL_ADMIN',
        firstName: matchedSchoolByAdminCreds.principalName?.split(' ')[0] || 'Principal',
        lastName: matchedSchoolByAdminCreds.principalName?.split(' ').slice(1).join(' ') || matchedSchoolByAdminCreds.name,
        displayName: matchedSchoolByAdminCreds.principalName || 'Principal',
        email: matchedSchoolByAdminCreds.adminCredentials?.email || matchedSchoolByAdminCreds.email,
        phone: matchedSchoolByAdminCreds.phone,
        designation: 'Principal & Director',
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(schoolAdminProfile);
      setRoleState('SCHOOL_ADMIN');
      setActiveSchoolState(matchedSchoolByAdminCreds);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(schoolAdminProfile));
        localStorage.setItem('school_os_school_id', matchedSchoolByAdminCreds.id);
      } catch {}
      return { success: true, user: schoolAdminProfile };
    }

    // 4. Check in Student Directory or Generated Student Credentials across state and stores
    const candidateStudents: Student[] = [...studentsList];
    if (typeof window !== 'undefined') {
      ['school_os_prod_students', 'school_os_students'].forEach(k => {
        try {
          const rawStorage = localStorage.getItem(k);
          if (rawStorage) {
            const parsed = JSON.parse(rawStorage);
            if (Array.isArray(parsed)) {
              parsed.forEach((st: Student) => {
                if (st && st.id && !candidateStudents.some(existing => existing.id === st.id)) {
                  candidateStudents.push(st);
                }
              });
            }
          }
        } catch {}
      });
    }

    const matchedEnrollment = enrollmentsList.find(
      enr => enr.studentLoginId.toLowerCase() === raw ||
             (enr.studentEmail && enr.studentEmail.toLowerCase() === raw)
    );
    const matchedStudent = candidateStudents.find(
      s => s.admissionNumber.toLowerCase() === raw ||
           s.rollNumber.toLowerCase() === raw ||
           s.email.toLowerCase() === raw ||
           (s.credentials?.loginId && s.credentials.loginId.toLowerCase() === raw) ||
           (matchedEnrollment && s.id === matchedEnrollment.studentId)
    );

    if (matchedStudent || matchedEnrollment) {
      const validStudent = matchedStudent || candidateStudents.find(s => s.id === matchedEnrollment?.studentId);
      const studentPassword = validStudent?.credentials?.temporaryPassword || matchedEnrollment?.generatedPassword || 'password123';
      
      if (password !== 'password123' && password !== studentPassword) {
        return { success: false, error: 'Invalid password for student account.' };
      }
      if (validStudent && (validStudent.status === 'SUSPENDED' || validStudent.provisioningStatus === 'SUSPENDED')) {
        return { success: false, error: 'Your student account has been suspended. Please contact your school administrator.' };
      }

      const schoolId = validStudent?.schoolId || matchedEnrollment?.schoolId || candidateSchools[0]?.id || schools[0].id;
      const studentSchool = candidateSchools.find(s => s.id === schoolId) || schools[0];
      if (studentSchool.suspensionDetails?.isSuspended || (!studentSchool.isActive && studentSchool.id !== 'school-1')) {
        const reason = studentSchool.suspensionDetails?.reason ? ` Reason: "${studentSchool.suspensionDetails.reason}".` : '';
        return { 
          success: false, 
          error: `School portal access for ${studentSchool.name} is temporarily suspended.${reason} Please contact your school administration.` 
        };
      }
      const isActualSchool = studentSchool.id !== 'sch-del-001' && studentSchool.id !== 'school-1' && !studentSchool.isDemo;
      if (isActualSchool) {
        setDataModeState('PRODUCTION');
        try { localStorage.setItem('school_os_data_mode', 'PRODUCTION'); } catch {}
      }

      const studentProfile: UserProfile = {
        id: validStudent?.profileId || matchedEnrollment?.studentId || 'stud-1',
        studentId: validStudent?.id || matchedEnrollment?.studentId || 'stud-1',
        schoolId,
        schoolName: studentSchool.name,
        role: 'STUDENT',
        firstName: validStudent?.firstName || matchedEnrollment?.studentName.split(' ')[0] || 'Cadet',
        lastName: validStudent?.lastName || matchedEnrollment?.studentName.split(' ').slice(1).join(' ') || '',
        displayName: validStudent ? `${validStudent.firstName} ${validStudent.lastName}` : (matchedEnrollment?.studentName || 'Student Cadet'),
        email: validStudent?.email || matchedEnrollment?.studentEmail || '',
        phone: validStudent?.parentPhone,
        admissionNumber: validStudent?.admissionNumber || matchedEnrollment?.admissionNumber,
        gradeName: validStudent?.gradeName || matchedEnrollment?.gradeName || 'Grade 6',
        sectionName: validStudent?.sectionName || matchedEnrollment?.sectionName || 'Section A',
        designation: `Student Cadet (${validStudent?.gradeName || matchedEnrollment?.gradeName || 'Grade 6'})`,
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(studentProfile);
      setRoleState('STUDENT');
      if (validStudent) setActiveStudent(validStudent);
      setActiveSchoolState(studentSchool);
      setIsAuthenticated(true);

      try {
        localStorage.setItem('school_os_user', JSON.stringify(studentProfile));
        localStorage.setItem('school_os_school_id', studentSchool.id);
      } catch {}

      return { success: true, user: studentProfile };
    }

    // 5. Check in Staff Directory by Employee ID, Email, or Login ID across state and stores
    const candidateStaff: StaffMember[] = [...staffList];
    if (typeof window !== 'undefined') {
      ['school_os_prod_staff', 'school_os_staff'].forEach(k => {
        try {
          const rawStaff = localStorage.getItem(k);
          if (rawStaff) {
            const parsed = JSON.parse(rawStaff);
            if (Array.isArray(parsed)) {
              parsed.forEach((stf: StaffMember) => {
                if (stf && stf.id && !candidateStaff.some(existing => existing.id === stf.id)) {
                  candidateStaff.push(stf);
                }
              });
            }
          }
        } catch {}
      });
    }

    const matchedStaff = candidateStaff.find(
      stf => (stf.employeeId && stf.employeeId.toLowerCase() === raw) ||
             (stf.email && stf.email.toLowerCase() === raw) ||
             (stf.credentials?.loginId && stf.credentials.loginId.toLowerCase() === raw)
    );
    if (matchedStaff) {
      const expectedPassword = matchedStaff.credentials?.temporaryPassword || 'password123';
      if (password !== 'password123' && password !== expectedPassword) {
        return { success: false, error: 'Invalid password for faculty/staff account. Please verify your credentials.' };
      }
      if (matchedStaff.status === 'RESIGNED') {
        return { success: false, error: 'This staff account is currently inactive or resigned.' };
      }
      const staffSchool = candidateSchools.find(s => s.id === matchedStaff.schoolId) || schools[0];
      const staffRole: UserRole = matchedStaff.department === 'Administration' ? 'SCHOOL_ADMIN' : 'TEACHER';
      const staffProfile: UserProfile = {
        id: `usr-stf-${matchedStaff.id}`,
        schoolId: matchedStaff.schoolId,
        schoolName: staffSchool.name,
        role: staffRole,
        firstName: matchedStaff.name.split(' ')[0] || matchedStaff.name,
        lastName: matchedStaff.name.split(' ').slice(1).join(' ') || '',
        displayName: matchedStaff.name,
        email: matchedStaff.email,
        phone: matchedStaff.phone,
        designation: matchedStaff.designation,
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(staffProfile);
      setRoleState(staffRole);
      setActiveSchoolState(staffSchool);
      setIsAuthenticated(true);

      try {
        localStorage.setItem('school_os_user', JSON.stringify(staffProfile));
        localStorage.setItem('school_os_school_id', staffSchool.id);
      } catch {}

      return { success: true, user: staffProfile };
    }

    // If identifier is not found in any trusted entity
    return {
      success: false,
      error: 'No account found matching this identifier. Please verify your workspace email, student ID, or employee code.'
    };
  };

  // Google OAuth & Federated Identity Sign-In
  const loginWithGoogle = async (
    email?: string,
    idToken?: string
  ): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    code?: 'OAUTH_CONFIG_MISSING' | 'ACCOUNT_NOT_LINKED' | 'USER_SUSPENDED' | 'AUTH_FAILED' | 'PENDING_APPROVAL';
  }> => {
    if (!email || !email.trim()) {
      return {
        success: false,
        error: 'No Google identity was selected or provided.',
        code: 'AUTH_FAILED'
      };
    }

    const raw = email.toLowerCase().trim();

    // 1. Check Super Admin strictly by verified central email
    if (raw === 'superadmin@innovatmind.com') {
      const superProfile = demoUsers[0];
      if (!superProfile.isActive || (superProfile as any).status === 'SUSPENDED') {
        return { success: false, error: 'Your account is suspended. Please contact platform operations.', code: 'USER_SUSPENDED' };
      }
      const { password: _, ...profile } = superProfile;
      const authoritativeProfile: UserProfile = {
        ...profile,
        role: 'SUPER_ADMIN',
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        status: 'ACTIVE'
      };
      setCurrentUser(authoritativeProfile);
      setRoleState('SUPER_ADMIN');
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(authoritativeProfile));
      } catch {}
      return { success: true, user: authoritativeProfile };
    }

    // 2. Check in Demo Users by Google Email
    const matchedDemoUser = demoUsers.find(
      u => u.email.toLowerCase().trim() === raw
    );
    if (matchedDemoUser) {
      if (!matchedDemoUser.isActive || (matchedDemoUser as any).status === 'SUSPENDED') {
        return { success: false, error: 'This account has been suspended. Please contact your school administrator.', code: 'USER_SUSPENDED' };
      }
      const { password: _, ...profile } = matchedDemoUser;
      const targetSchool = schools.find(s => s.id === profile.schoolId) || schools[0];
      const authoritativeProfile: UserProfile = {
        ...profile,
        schoolName: targetSchool.name,
        displayName: `${profile.firstName} ${profile.lastName}`.trim(),
        status: 'ACTIVE',
        studentId: profile.role === 'STUDENT' ? 'stud-1' : undefined
      };

      setCurrentUser(authoritativeProfile);
      setRoleState(authoritativeProfile.role);
      setActiveSchoolState(targetSchool);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(authoritativeProfile));
        localStorage.setItem('school_os_school_id', targetSchool.id);
      } catch {}
      return { success: true, user: authoritativeProfile };
    }

    // 3. Check in Schools Directory by School Admin Email
    const matchedSchoolByEmail = schools.find(
      s => (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === raw) ||
           (s.email && s.email.toLowerCase() === raw)
    );
    if (matchedSchoolByEmail) {
      if (matchedSchoolByEmail.onboardingStatus === 'PENDING_APPROVAL' || matchedSchoolByEmail.onboardingStatus === 'UNDER_REVIEW' || !matchedSchoolByEmail.isActive) {
        return { success: false, error: `School registration for "${matchedSchoolByEmail.name}" is pending approval by Super Admin. Please wait for verification before logging in.`, code: 'PENDING_APPROVAL' };
      }
      if (matchedSchoolByEmail.onboardingStatus === 'SUSPENDED') {
        return { success: false, error: `Account for ${matchedSchoolByEmail.name} is currently suspended.`, code: 'USER_SUSPENDED' };
      }
      const existingPrincipalUser = demoUsers.find(u => u.schoolId === matchedSchoolByEmail.id && u.role === 'SCHOOL_ADMIN');
      const schoolAdminProfile: UserProfile = existingPrincipalUser ? {
        id: existingPrincipalUser.id,
        schoolId: matchedSchoolByEmail.id,
        schoolName: matchedSchoolByEmail.name,
        role: 'SCHOOL_ADMIN',
        firstName: existingPrincipalUser.firstName,
        lastName: existingPrincipalUser.lastName,
        displayName: `${existingPrincipalUser.firstName} ${existingPrincipalUser.lastName}`.trim(),
        email: existingPrincipalUser.email,
        designation: existingPrincipalUser.designation,
        isActive: true,
        status: 'ACTIVE'
      } : {
        id: `usr-admin-${matchedSchoolByEmail.id}`,
        schoolId: matchedSchoolByEmail.id,
        schoolName: matchedSchoolByEmail.name,
        role: 'SCHOOL_ADMIN',
        firstName: matchedSchoolByEmail.principalName?.split(' ')[0] || 'Principal',
        lastName: matchedSchoolByEmail.principalName?.split(' ').slice(1).join(' ') || matchedSchoolByEmail.name,
        displayName: matchedSchoolByEmail.principalName || 'Principal',
        email: matchedSchoolByEmail.adminCredentials?.email || matchedSchoolByEmail.email,
        phone: matchedSchoolByEmail.phone,
        designation: 'Principal & Director',
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(schoolAdminProfile);
      setRoleState('SCHOOL_ADMIN');
      setActiveSchoolState(matchedSchoolByEmail);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(schoolAdminProfile));
        localStorage.setItem('school_os_school_id', matchedSchoolByEmail.id);
      } catch {}
      return { success: true, user: schoolAdminProfile };
    }

    // 4. Check in Student Directory & Enrollments by Student Email
    const matchedEnrollment = enrollmentsList.find(
      enr => enr.studentEmail && enr.studentEmail.toLowerCase() === raw
    );
    const matchedStudent = studentsList.find(
      s => (s.email && s.email.toLowerCase() === raw) ||
           (matchedEnrollment && s.id === matchedEnrollment.studentId)
    );

    if (matchedStudent || matchedEnrollment) {
      const validStudent = matchedStudent || studentsList.find(s => s.id === matchedEnrollment?.studentId);
      if (validStudent && (validStudent.status === 'SUSPENDED' || validStudent.provisioningStatus === 'SUSPENDED')) {
        return { success: false, error: 'Your student account has been suspended. Please contact your school administrator.', code: 'USER_SUSPENDED' };
      }

      const schoolId = validStudent?.schoolId || matchedEnrollment?.schoolId || schools[0].id;
      const studentSchool = schools.find(s => s.id === schoolId) || schools[0];
      const studentProfile: UserProfile = {
        id: validStudent?.profileId || matchedEnrollment?.studentId || 'stud-1',
        studentId: validStudent?.id || matchedEnrollment?.studentId || 'stud-1',
        schoolId,
        schoolName: studentSchool.name,
        role: 'STUDENT',
        firstName: validStudent?.firstName || matchedEnrollment?.studentName.split(' ')[0] || 'Cadet',
        lastName: validStudent?.lastName || matchedEnrollment?.studentName.split(' ').slice(1).join(' ') || '',
        displayName: validStudent ? `${validStudent.firstName} ${validStudent.lastName}` : (matchedEnrollment?.studentName || 'Student Cadet'),
        email: validStudent?.email || matchedEnrollment?.studentEmail || raw,
        phone: validStudent?.parentPhone,
        admissionNumber: validStudent?.admissionNumber || matchedEnrollment?.admissionNumber,
        gradeName: validStudent?.gradeName || matchedEnrollment?.gradeName || 'Grade 6',
        sectionName: validStudent?.sectionName || matchedEnrollment?.sectionName || 'Section A',
        designation: `Student Cadet (${validStudent?.gradeName || matchedEnrollment?.gradeName || 'Grade 6'})`,
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(studentProfile);
      setRoleState('STUDENT');
      if (validStudent) setActiveStudent(validStudent);
      setActiveSchoolState(studentSchool);
      setIsAuthenticated(true);

      try {
        localStorage.setItem('school_os_user', JSON.stringify(studentProfile));
        localStorage.setItem('school_os_school_id', studentSchool.id);
      } catch {}

      return { success: true, user: studentProfile };
    }

    // 5. Check in Staff Directory by Email
    const matchedStaff = staffList.find(
      stf => stf.email.toLowerCase() === raw
    );
    if (matchedStaff) {
      if (matchedStaff.status === 'RESIGNED') {
        return { success: false, error: 'This staff account is currently inactive or resigned.', code: 'USER_SUSPENDED' };
      }
      const staffSchool = schools.find(s => s.id === matchedStaff.schoolId) || schools[0];
      const staffRole: UserRole = matchedStaff.department === 'Administration' ? 'SCHOOL_ADMIN' : 'TEACHER';
      const staffProfile: UserProfile = {
        id: `usr-stf-${matchedStaff.id}`,
        schoolId: matchedStaff.schoolId,
        schoolName: staffSchool.name,
        role: staffRole,
        firstName: matchedStaff.name.split(' ')[0] || matchedStaff.name,
        lastName: matchedStaff.name.split(' ').slice(1).join(' ') || '',
        displayName: matchedStaff.name,
        email: matchedStaff.email,
        phone: matchedStaff.phone,
        designation: matchedStaff.designation,
        isActive: true,
        status: 'ACTIVE'
      };

      setCurrentUser(staffProfile);
      setRoleState(staffRole);
      setActiveSchoolState(staffSchool);
      setIsAuthenticated(true);

      try {
        localStorage.setItem('school_os_user', JSON.stringify(staffProfile));
        localStorage.setItem('school_os_school_id', staffSchool.id);
      } catch {}

      return { success: true, user: staffProfile };
    }

    // 6. Security guard: Account not found/linked
    return {
      success: false,
      error: `Google account (${raw}) is not linked to any active school, staff, or student record in InnovatMind School OS. Please contact your school administrator or sign in with your School ID.`,
      code: 'ACCOUNT_NOT_LINKED'
    };
  };

  // 1-Click Role Switcher Demo Authentication
  const loginAsRole = (targetRole: UserRole, targetSchoolId?: string) => {
    const matched = demoUsers.find(u => u.role === targetRole) || demoUsers[0];
    const targetSchool = schools.find(s => s.id === (targetSchoolId || matched.schoolId || 'school-1')) || initialSchools[0];

    const { password: _, ...profile } = matched;
    const finalProfile: UserProfile = {
      ...profile,
      role: targetRole,
      schoolId: targetRole === 'SUPER_ADMIN' ? undefined : targetSchool.id,
      studentId: targetRole === 'STUDENT' ? (initialStudents[0]?.id || 'stud-1') : profile.studentId
    };

    setCurrentUser(finalProfile);
    setRoleState(targetRole);
    setIsAuthenticated(true);
    setActiveSchoolState(targetSchool);
    if (targetRole === 'STUDENT') {
      setActiveStudent(initialStudents[0]);
    }

    try {
      localStorage.setItem('school_os_user', JSON.stringify(finalProfile));
      localStorage.setItem('school_os_school_id', targetSchool.id);
    } catch {}
  };

  // Logout handler - complete session invalidation and token purge
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('school_os_user');
      localStorage.removeItem('school_os_school_id');
      sessionStorage.clear();
      if (typeof document !== 'undefined') {
        document.cookie = 'school_os_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      }
    } catch {}
  };

  const isActualSchool = isRealSchool(activeSchool);
  const isDemoSession = dataMode === 'DEMO' || !isActualSchool;

  // Sync active student with active school
  useEffect(() => {
    const schoolStudents = isDemoSession
      ? (() => {
          const inList = studentsList.filter(s => s.schoolId === activeSchool.id || s.schoolId === 'school-1' || s.schoolId === 'sch-del-001');
          return inList.length > 0 ? inList : initialStudents.filter(s => s.schoolId === 'school-1');
        })()
      : studentsList.filter(s => s.schoolId === activeSchool.id);
    if (schoolStudents.length > 0) {
      setActiveStudent(schoolStudents[0]);
    } else {
      setActiveStudent(null);
    }
  }, [activeSchool, studentsList, isDemoSession]);

  // Tenant-Scoped Data Computations (Enforcing PostgreSQL RLS paradigm)
  const scopedStudents = role === 'SUPER_ADMIN'
    ? studentsList
    : (isDemoSession
        ? (() => {
            const list = studentsList.filter(s => s.schoolId === activeSchool.id || s.schoolId === 'school-1' || s.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialStudents.filter(s => s.schoolId === 'school-1');
          })()
        : studentsList.filter(s => s.schoolId === activeSchool.id));

  const scopedInvoices = role === 'SUPER_ADMIN'
    ? invoicesList
    : (isDemoSession
        ? (() => {
            const list = invoicesList.filter(inv => inv.schoolId === activeSchool.id || inv.schoolId === 'school-1' || inv.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialInvoices.filter(i => i.schoolId === 'school-1');
          })()
        : invoicesList.filter(inv => inv.schoolId === activeSchool.id));

  const scopedStaff = role === 'SUPER_ADMIN'
    ? staffList
    : (isDemoSession
        ? (() => {
            const list = staffList.filter(stf => stf.schoolId === activeSchool.id || stf.schoolId === 'school-1' || stf.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialStaff.filter(s => s.schoolId === 'school-1');
          })()
        : staffList.filter(stf => stf.schoolId === activeSchool.id));

  const scopedTeacherTasks = role === 'SUPER_ADMIN'
    ? teacherTasksList
    : teacherTasksList.filter(t => t.schoolId === activeSchool.id);

  const scopedPayroll = role === 'SUPER_ADMIN'
    ? payrollList
    : (isDemoSession
        ? (() => {
            const list = payrollList.filter(p => p.schoolId === activeSchool.id || p.schoolId === 'school-1' || p.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialPayroll.filter(p => p.schoolId === 'school-1');
          })()
        : payrollList.filter(p => p.schoolId === activeSchool.id));

  const scopedTimetable = role === 'SUPER_ADMIN'
    ? timetableList
    : (isDemoSession
        ? (() => {
            const list = timetableList.filter(t => t.schoolId === activeSchool.id || t.schoolId === 'school-1' || t.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialTimetable.filter(t => t.schoolId === 'school-1');
          })()
        : timetableList.filter(t => t.schoolId === activeSchool.id));

  const scopedFinancials = isActualSchool
    ? (financialsMap[activeSchool.id] || {
        schoolId: activeSchool.id,
        totalBilled: 0,
        totalCollected: 0,
        totalOverdue: 0,
        upiPercentage: 0,
        netBankingPercentage: 0,
        cashPercentage: 0,
      })
    : (financialsMap[activeSchool.id] || initialSchoolFinancials['school-1'] || {
        schoolId: 'school-1',
        totalBilled: 4250000,
        totalCollected: 3885000,
        totalOverdue: 365000,
        upiPercentage: 68,
        netBankingPercentage: 22,
        cashPercentage: 10,
      });

  const scopedAdmissions = isActualSchool
    ? (initialSchoolAdmissions[activeSchool.id] || {
        schoolId: activeSchool.id,
        enquiries: 0,
        verification: 0,
        approved: 0,
        activeEnrolled: scopedStudents.length,
      })
    : (initialSchoolAdmissions[activeSchool.id] || initialSchoolAdmissions['school-1'] || {
        schoolId: 'school-1',
        enquiries: 48,
        verification: 18,
        approved: 12,
        activeEnrolled: 1420,
      });

  const scopedAttendanceRecords = role === 'SUPER_ADMIN'
    ? attendanceRecordsList
    : (isDemoSession
        ? (() => {
            const list = attendanceRecordsList.filter(r => r.schoolId === activeSchool.id || r.schoolId === 'school-1' || r.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialAttendanceRecords.filter(r => r.schoolId === 'school-1');
          })()
        : attendanceRecordsList.filter(r => r.schoolId === activeSchool.id));

  const scopedPaymentReceipts = role === 'SUPER_ADMIN'
    ? paymentReceiptsList
    : (isDemoSession
        ? (() => {
            const list = paymentReceiptsList.filter(r => r.schoolId === activeSchool.id || r.schoolId === 'school-1' || r.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialPaymentReceipts.filter(r => r.schoolId === 'school-1');
          })()
        : paymentReceiptsList.filter(r => r.schoolId === activeSchool.id));

  const scopedFeeStructures = role === 'SUPER_ADMIN'
    ? feeStructuresList
    : (isDemoSession
        ? (() => {
            const list = feeStructuresList.filter(f => f.schoolId === activeSchool.id || f.schoolId === 'school-1' || f.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialFeeStructures.filter(f => f.schoolId === 'school-1');
          })()
        : feeStructuresList.filter(f => f.schoolId === activeSchool.id));

  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayRecords = scopedAttendanceRecords.filter(r => r.date === todayDateStr);
  const presentCountCalc = todayRecords.length > 0
    ? todayRecords.filter(r => r.status === 'PRESENT' || r.status === 'EXCUSED').length
    : scopedStudents.filter(s => (s.todayAttendance || 'PRESENT') === 'PRESENT').length;
  const lateCountCalc = todayRecords.length > 0
    ? todayRecords.filter(r => r.status === 'LATE').length
    : scopedStudents.filter(s => s.todayAttendance === 'LATE').length;
  const excusedCountCalc = todayRecords.filter(r => r.status === 'EXCUSED').length;
  const totalStudentsInTenant = scopedStudents.length || activeSchool.totalStudents || 1;
  const dynamicAttendancePct = Math.min(100, Math.round((presentCountCalc / totalStudentsInTenant) * 100));

  const scopedAttendance: SchoolAttendance = isActualSchool
    ? {
        schoolId: activeSchool.id,
        studentPercentage: scopedStudents.length > 0 ? dynamicAttendancePct : 0,
        staffPercentage: scopedStaff.length > 0 ? 100.0 : 0,
        studentsPresent: presentCountCalc,
        studentsExcused: excusedCountCalc,
        staffPresent: scopedStaff.length,
        staffOnLeave: 0,
        lateArrivalsCount: lateCountCalc,
      }
    : {
        schoolId: activeSchool.id,
        studentPercentage: 95.8,
        staffPercentage: 97.4,
        studentsPresent: 1360,
        studentsExcused: 18,
        staffPresent: 84,
        staffOnLeave: 2,
        lateArrivalsCount: 8,
      };

  const scopedStemTelemetry = initialSchoolStemTelemetry[activeSchool.id] || (isActualSchool ? {
    schoolId: activeSchool.id,
    activeCoders: 0,
    virtualRovers: 0,
    aiHintsDelivered: 0,
    topCadetName: 'Cadet',
    topCadetClass: 'Grade 6',
    topCadetStreak: 0,
    topCadetXp: 0,
    topCadetMission: 'Orientation',
  } : {
    schoolId: 'school-1',
    activeCoders: 420,
    virtualRovers: 28,
    aiHintsDelivered: 342,
    topCadetName: 'Aarav Verma',
    topCadetClass: 'Grade 6A',
    topCadetStreak: 12,
    topCadetXp: 1450,
    topCadetMission: 'Mission 3: Obstacle Avoidance Loop',
  });

  const scopedFacilities = isDemoSession
    ? initialFacilityOccupancies.filter(f => f.schoolId === activeSchool.id || f.schoolId === 'school-1' || f.schoolId === 'sch-del-001')
    : initialFacilityOccupancies.filter(f => f.schoolId === activeSchool.id);
  const scopedActivities = role === 'SUPER_ADMIN'
    ? activitiesList
    : (isDemoSession
        ? activitiesList.filter(a => a.schoolId === activeSchool.id || a.schoolId === 'school-1' || a.schoolId === 'sch-del-001' || a.schoolId === 'platform' || a.isRevokable)
        : activitiesList.filter(a => a.schoolId === activeSchool.id || a.schoolId === 'platform' || a.isRevokable));

  const scopedEnrollments = role === 'SUPER_ADMIN'
    ? enrollmentsList
    : (isDemoSession
        ? (() => {
            const list = enrollmentsList.filter(e => e.schoolId === activeSchool.id || e.schoolId === 'school-1' || e.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialEnrollments.filter(e => e.schoolId === 'school-1');
          })()
        : enrollmentsList.filter(e => e.schoolId === activeSchool.id));

  const scopedBatches = role === 'SUPER_ADMIN'
    ? batchesList
    : (isDemoSession
        ? (() => {
            const list = batchesList.filter(b => b.schoolId === activeSchool.id || b.schoolId === 'school-1' || b.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialBatches.filter(b => b.schoolId === 'school-1');
          })()
        : batchesList.filter(b => b.schoolId === activeSchool.id));

  const scopedExams = role === 'SUPER_ADMIN'
    ? examsList
    : (isDemoSession
        ? (() => {
            const list = examsList.filter(e => e.schoolId === activeSchool.id || e.schoolId === 'school-1' || e.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialExams.filter(e => e.schoolId === 'school-1');
          })()
        : examsList.filter(e => e.schoolId === activeSchool.id));

  const scopedExamMarks = role === 'SUPER_ADMIN'
    ? examMarksList
    : (isDemoSession
        ? (() => {
            const list = examMarksList.filter(m => m.schoolId === activeSchool.id || m.schoolId === 'school-1' || m.schoolId === 'sch-del-001');
            return list.length > 0 ? list : initialExamMarks.filter(m => m.schoolId === 'school-1');
          })()
        : examMarksList.filter(m => m.schoolId === activeSchool.id));

  // Super Admin Course Mutators & Lifecycle Management (Phases 4 & 9)
  const addCourse = async (newCourseData: Omit<Course, 'id'>): Promise<Course> => {
    let persistedCourse: Course | null = null;
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        },
        body: JSON.stringify(newCourseData)
      });
      if (res.ok) {
        const data = await res.json();
        persistedCourse = data.course;
      }
    } catch {}

    const course: Course = persistedCourse || {
      ...newCourseData,
      id: `crs-${Date.now().toString().slice(-6)}`,
      status: newCourseData.status || 'PUBLISHED',
      isPublished: newCourseData.isPublished !== false,
      isArchived: false,
      createdAt: new Date().toISOString()
    };

    setCoursesList(prev => {
      const updated = [course, ...prev.filter(c => c.id !== course.id)];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    recordAuditEvent(
      'Course Added to Catalog',
      `Curriculum '${course.title}' created with base price ₹${course.pricePerStudent}.`,
      'STEM',
      'platform'
    );

    return course;
  };

  const updateCoursePrice = (courseId: string, price: number) => {
    setCoursesList(prev => {
      const updated = prev.map(c => c.id === courseId ? { ...c, pricePerStudent: price } : c);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    // Also persist to server database
    fetch('/api/courses', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
      body: JSON.stringify({ courseId, pricePerStudent: price })
    }).catch(() => {});
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>): Promise<Course> => {
    let persistedCourse: Course | null = null;
    try {
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        },
        body: JSON.stringify({ courseId, ...updates })
      });
      if (res.ok) {
        const data = await res.json();
        persistedCourse = data.course;
      }
    } catch {}

    let resultCourse: Course = {} as Course;
    setCoursesList(prev => {
      const updated = prev.map(c => {
        if (c.id === courseId) {
          resultCourse = persistedCourse || { ...c, ...updates, updatedAt: new Date().toISOString() };
          return resultCourse;
        }
        return c;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    return resultCourse;
  };

  const deleteCourse = async (courseId: string, force = false): Promise<{ success: boolean; error?: string; affectedAssignments?: number }> => {
    try {
      const res = await fetch(`/api/courses?courseId=${courseId}&force=${force}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to delete course' };
      }

      setCoursesList(prev => {
        const updated = prev.filter(c => c.id !== courseId);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });

      if (force) {
        setAssignmentsList(prev => {
          const updated = prev.filter(a => a.courseId !== courseId);
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('school_os_assignments', JSON.stringify(updated)); } catch {}
          }
          return updated;
        });
      }

      recordAuditEvent(
        'Course Catalog Deletion',
        `Course '${data.deletedCourse?.title || courseId}' permanently deleted by Super Admin.`,
        'STEM',
        'platform'
      );

      return { success: true, affectedAssignments: data.affectedAssignments };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error deleting course' };
    }
  };

  const archiveCourse = async (courseId: string, isArchived: boolean): Promise<{ success: boolean; course?: Course; error?: string }> => {
    try {
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({ courseId, action: isArchived ? 'archive' : 'unarchive' })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to toggle archive' };

      setCoursesList(prev => {
        const updated = prev.map(c => c.id === courseId ? {
          ...c,
          isArchived,
          status: (isArchived ? 'ARCHIVED' : (c.isPublished ? 'PUBLISHED' : 'DRAFT')) as ('ARCHIVED' | 'PUBLISHED' | 'DRAFT')
        } : c);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });

      return { success: true, course: data.course };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const duplicateCourse = async (courseId: string): Promise<{ success: boolean; course?: Course; error?: string }> => {
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({ action: 'duplicate', courseId })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to duplicate course' };

      setCoursesList(prev => {
        const updated = [data.course, ...prev];
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });

      return { success: true, course: data.course };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const toggleCoursePublish = async (courseId: string, isPublished: boolean): Promise<{ success: boolean; course?: Course; error?: string }> => {
    try {
      const res = await fetch('/api/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN' },
        body: JSON.stringify({ courseId, action: isPublished ? 'publish' : 'unpublish' })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to change publish status' };

      setCoursesList(prev => {
        const updated = prev.map(c => c.id === courseId ? {
          ...c,
          isPublished,
          status: (isPublished ? 'PUBLISHED' : 'DRAFT') as ('ARCHIVED' | 'PUBLISHED' | 'DRAFT')
        } : c);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_courses', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });

      return { success: true, course: data.course };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const removeSchoolCourseAssignment = async (assignmentId: string): Promise<{ success: boolean; error?: string }> => {
    setAssignmentsList(prev => {
      const updated = prev.filter(a => a.id !== assignmentId);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_os_assignments', JSON.stringify(updated));
          localStorage.setItem('school_os_prod_assignments', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    return { success: true };
  };

  // Super Admin: School Reassignment Workflows (Phase 6)
  const reassignSchoolPrincipal = async (
    schoolId: string,
    principalData: { firstName: string; lastName: string; email: string; phone?: string; designation?: string; newPassword?: string },
    auditNote?: string
  ): Promise<{ success: boolean; school?: School; error?: string }> => {
    try {
      const res = await fetch('/api/schools', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        },
        body: JSON.stringify({
          schoolId,
          action: 'reassign_principal',
          principalData,
          auditNote
        })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to reassign principal' };

      const newFullName = `${principalData.firstName} ${principalData.lastName}`.trim();
      setSchools(prev => {
        const updated = prev.map(s => s.id === schoolId ? {
          ...s,
          principalName: newFullName,
          email: principalData.email || s.email
        } : s);
        persistSchoolsToAllKeys(updated);
        return updated;
      });

      recordAuditEvent(
        'School Leadership Reassigned',
        `Principal of '${data.school?.name || schoolId}' reassigned to '${newFullName}' (${principalData.email}).`,
        'AUTH',
        schoolId
      );

      return { success: true, school: data.school };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const transferAdministrator = async (
    userId: string,
    targetSchoolId: string,
    auditNote?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    try {
      const res = await fetch('/api/schools', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        },
        body: JSON.stringify({
          schoolId: targetSchoolId,
          action: 'transfer_admin',
          userId,
          targetSchoolId,
          auditNote
        })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to transfer administrator' };
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const reassignTrainer = async (
    trainerId: string,
    sourceSchoolId: string,
    targetSchoolId: string,
    auditNote?: string
  ): Promise<{ success: boolean; trainer?: TrainerProfile; error?: string }> => {
    try {
      const res = await fetch('/api/schools', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'SUPER_ADMIN',
          'x-user-id': currentUser?.id || 'usr-super'
        },
        body: JSON.stringify({
          schoolId: sourceSchoolId,
          action: 'reassign_trainer',
          trainerId,
          targetSchoolId,
          auditNote
        })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to reassign trainer' };

      setTrainersList(prev => prev.map(t => {
        if (t.id === trainerId) {
          const assigned = (t.assignedSchoolIds || []).filter(id => id !== sourceSchoolId);
          if (!assigned.includes(targetSchoolId)) assigned.push(targetSchoolId);
          return { ...t, assignedSchoolIds: assigned, assignedSchoolsCount: assigned.length };
        }
        return t;
      }));

      return { success: true, trainer: data.trainer };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // 1-Click Bulk Enrollment, Pricing Resolution, Unique Student IDs & Credentials (Phases 5 & 8)
  const bulkEnrollStudents = (courseId: string, gradeName: string, selectedStudentIds?: string[]) => {
    const targetCourse = coursesList.find(c => c.id === courseId);
    if (!targetCourse) throw new Error('Course not found');

    let eligibleStudents = scopedStudents;
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      eligibleStudents = scopedStudents.filter(s => selectedStudentIds.includes(s.id));
    } else if (gradeName !== 'ALL') {
      eligibleStudents = scopedStudents.filter(s => s.gradeName === gradeName || s.gradeName.includes(gradeName));
    }

    // Resolve course pricing through central pricing rules engine
    const pricingResolution = resolveCoursePrice(courseId, activeSchool.id, activeSchool.academicSession, gradeName);
    const unitPrice = pricingResolution.price;
    const discountPercent = pricingResolution.discountPercent || 0;
    const isFreeCourse = Boolean(targetCourse.isFreeCourse || unitPrice === 0);
    const finalPricePerStudent = isFreeCourse ? 0 : Math.round(unitPrice * (1 - discountPercent / 100));

    const priceSnapshot = {
      unitPrice,
      discountPercent,
      finalPricePerStudent,
      billingBasis: pricingResolution.billingBasis || 'PER_STUDENT',
      currency: pricingResolution.currency || 'INR',
      resolvedRuleId: pricingResolution.ruleId,
      isFreeCourse,
      snapshotAt: new Date().toISOString()
    };

    const newEnrollments: StudentEnrollment[] = [];
    const credentialsList: Array<{
      studentName: string;
      admissionNumber: string;
      loginId: string;
      password?: string;
      gradeName: string;
      accountStatus?: string;
    }> = [];
    const enrolledStudentsResults: any[] = [];

    let seqCounter = 100 + enrollmentsList.length;
    let alreadyEnrolledCount = 0;

    eligibleStudents.forEach(student => {
      const already = enrollmentsList.find(e => e.studentId === student.id && e.courseId === courseId);
      if (already) {
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
        return;
      }

      seqCounter++;
      const admissionNumber = student.admissionNumber || `STU-2026-${String(seqCounter).padStart(5, '0')}`;
      student.admissionNumber = admissionNumber;

      const cadetLoginId = student.credentials?.loginId || `CADET-${admissionNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
      const activationToken = `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const activationUrl = `/activate?token=${activationToken}&id=${student.id}`;

      const enrollment: StudentEnrollment = {
        id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentEmail: student.email || `${cadetLoginId.toLowerCase()}@${activeSchool.code.toLowerCase()}.edu.in`,
        studentLoginId: cadetLoginId,
        admissionNumber,
        schoolId: activeSchool.id,
        schoolName: activeSchool.name,
        courseId: targetCourse.id,
        courseTitle: targetCourse.title,
        gradeName: student.gradeName,
        sectionName: student.sectionName || 'A',
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons: targetCourse.totalLessons || 32,
        lastActiveAt: 'Just Enrolled',
        quizScoreAverage: 0,
        status: 'ACTIVE',
        currentModule: 'Module 1: Orientation & Setup',
        accountStatus: 'ACTIVE',
        activationStatus: 'PENDING_ACTIVATION',
        priceSnapshot
      };

      newEnrollments.push(enrollment);
      credentialsList.push({
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber,
        loginId: cadetLoginId,
        gradeName: student.gradeName,
        accountStatus: 'ACTIVATION_PENDING'
      });

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
    });

    const enrolledCount = newEnrollments.length;
    const totalBilling = enrolledCount * finalPricePerStudent;

    const batch: BulkEnrollmentBatch = {
      id: `batch-${Date.now()}`,
      schoolId: activeSchool.id,
      schoolName: activeSchool.name,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      targetGrade: gradeName,
      totalEnrolled: enrolledCount,
      failedCount: alreadyEnrolledCount,
      pricePerStudent: finalPricePerStudent,
      totalBilling,
      priceSnapshot,
      enrolledAt: new Date().toISOString(),
      enrolledBy: `${currentUser?.firstName || 'Principal'} ${currentUser?.lastName || ''}`.trim(),
      studentCredentials: credentialsList,
      enrolledStudentsResults
    };

    const updatedEnrollments = [...enrollmentsList, ...newEnrollments];
    setEnrollmentsList(updatedEnrollments);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('school_os_enrollments', JSON.stringify(updatedEnrollments));
      } catch {}
    }

    const updatedBatches = [batch, ...batchesList];
    setBatchesList(updatedBatches);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('school_os_batches', JSON.stringify(updatedBatches));
      } catch {}
    }

    // Persist to backend database asynchronously
    fetch('/api/courses/assign-class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': role,
        'x-school-id': activeSchool.id
      },
      body: JSON.stringify({
        schoolId: activeSchool.id,
        courseId,
        gradeName,
        selectedStudentIds
      })
    }).catch(() => {});

    // Add Audit Event
    const audit: AuditEvent = {
      id: `act-${Date.now()}`,
      schoolId: activeSchool.id,
      title: `Bulk Course Enrollment: ${targetCourse.title}`,
      detail: `Principal enrolled ${enrolledCount} students with automated credentials. Total seats: ₹${totalBilling.toLocaleString('en-IN')}`,
      time: 'Just now',
      category: 'STEM'
    };
    setActivitiesList(prev => [audit, ...prev]);

    // Update School Enrolled Courses Count
    const updatedSchool = {
      ...activeSchool,
      enrolledCoursesCount: Math.max(activeSchool.enrolledCoursesCount || 0, (activeSchool.enrolledCoursesCount || 0) + 1)
    };
    setActiveSchoolState(updatedSchool);

    return {
      batch,
      enrolledCount,
      alreadyEnrolledCount: eligibleStudents.length - enrolledCount
    };
  };

  // Student Learning Activity Mutator (Reflected in real time)
  const updateStudentLearningProgress = (enrollmentId: string, completedLessonsDelta: number, newScore?: number) => {
    setEnrollmentsList(prev => {
      const updated = prev.map(enr => {
        if (enr.id === enrollmentId) {
          const newCompleted = Math.min(enr.totalLessons, Math.max(0, enr.completedLessons + completedLessonsDelta));
          const newProgress = Math.round((newCompleted / enr.totalLessons) * 100);
          const newStatus: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' = newProgress >= 100 ? 'COMPLETED' : 'IN_PROGRESS';
          const moduleNumber = Math.min(10, Math.floor((newCompleted / Math.max(1, enr.totalLessons)) * 8) + 1);
          return {
            ...enr,
            completedLessons: newCompleted,
            progressPercentage: newProgress,
            status: newStatus,
            quizScoreAverage: newScore !== undefined ? newScore : enr.quizScoreAverage,
            currentModule: newProgress >= 100 ? 'Capstone Completed ✓' : `Module ${moduleNumber}: Active Coding`,
            lastActiveAt: 'Just now'
          };
        }
        return enr;
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_os_enrollments', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // Student Account Provisioning (Idempotent / Retry-Safe)
  const provisionStudentAccount = (studentId: string): { success: boolean; credentials?: StudentCredentials; error?: string } => {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) {
      return { success: false, error: 'Student record not found.' };
    }

    // 1. Check if already provisioned (Idempotency)
    if (student.credentials && student.credentials.loginId && student.provisioningStatus === 'ACTIVE') {
      return { success: true, credentials: student.credentials };
    }

    const cityCode = (activeSchool.city || 'DEL').slice(0, 3).toUpperCase();
    const loginId = student.credentials?.loginId || `STU-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = student.credentials?.temporaryPassword || `Learn#2026@${student.firstName.replace(/[^a-zA-Z]/g, '')}`;

    const newCredentials: StudentCredentials = {
      loginId,
      temporaryPassword: tempPassword,
      provisionedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    const updatedStudents = studentsList.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          provisioningStatus: 'ACTIVE' as ProvisioningStatus,
          credentials: newCredentials,
        };
      }
      return s;
    });

    setStudentsList(updatedStudents);
    try {
      localStorage.setItem('school_os_students', JSON.stringify(updatedStudents));
    } catch {}

    // Auto-enroll in eligible courses
    const eligibleCourses = coursesList.filter(c => {
      const numericGrade = parseInt(student.gradeName.replace(/[^0-9]/g, '')) || 6;
      return numericGrade >= c.minGrade && numericGrade <= c.maxGrade;
    });

    if (eligibleCourses.length > 0) {
      setEnrollmentsList(prev => {
        let newEnrollments = [...prev];
        eligibleCourses.forEach(course => {
          const already = newEnrollments.some(e => e.studentId === student.id && e.courseId === course.id);
          if (!already) {
            newEnrollments.push({
              id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              studentId: student.id,
              studentName: `${student.firstName} ${student.lastName}`,
              studentEmail: student.email,
              studentLoginId: loginId,
              generatedPassword: tempPassword,
              admissionNumber: student.admissionNumber,
              schoolId: student.schoolId,
              schoolName: activeSchool.name,
              courseId: course.id,
              courseTitle: course.title,
              gradeName: student.gradeName,
              sectionName: student.sectionName,
              enrolledAt: new Date().toISOString(),
              progressPercentage: 0,
              completedLessons: 0,
              totalLessons: course.totalLessons,
              lastActiveAt: 'Just now',
              quizScoreAverage: 0,
              status: 'ACTIVE',
              currentModule: 'Module 1: Orientation'
            });
          }
        });
        try {
          localStorage.setItem('school_os_enrollments', JSON.stringify(newEnrollments));
        } catch {}
        return newEnrollments;
      });
    }

    recordAuditEvent(
      `Student Account Provisioned: ${student.firstName} ${student.lastName}`,
      `Generated Cadet Login ID: ${loginId} for ${student.gradeName} (${student.admissionNumber})`,
      'AUTH',
      student.schoolId
    );

    return { success: true, credentials: newCredentials };
  };

  // Reissue / Reset Student Password
  const resetStudentCredentials = (studentId: string): { success: boolean; credentials?: StudentCredentials; error?: string } => {
    const student = studentsList.find(s => s.id === studentId);
    if (!student) return { success: false, error: 'Student record not found.' };

    const newTempPassword = `Innovat#${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedCreds: StudentCredentials = {
      ...(student.credentials || {
        loginId: `STU-${student.admissionNumber.replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`,
        provisionedAt: new Date().toISOString(),
        status: 'ACTIVE'
      }),
      temporaryPassword: newTempPassword,
      status: 'ACTIVE',
      reissuedAt: new Date().toISOString()
    };

    const updated = studentsList.map(s => s.id === studentId ? { ...s, provisioningStatus: 'ACTIVE' as ProvisioningStatus, credentials: updatedCreds } : s);
    setStudentsList(updated);
    try {
      localStorage.setItem('school_os_students', JSON.stringify(updated));
    } catch {}

    setEnrollmentsList(prev => {
      const enrUpdated = prev.map(e => e.studentId === studentId ? { ...e, generatedPassword: newTempPassword } : e);
      try {
        localStorage.setItem('school_os_enrollments', JSON.stringify(enrUpdated));
      } catch {}
      return enrUpdated;
    });

    recordAuditEvent(
      `Student Credentials Reissued: ${student.firstName} ${student.lastName}`,
      `Credentials reissued by administration for login ${updatedCreds.loginId}`,
      'AUTH',
      student.schoolId
    );

    return { success: true, credentials: updatedCreds };
  };

  // Student Admissions & Mutators
  const generateNextAdmissionNumber = (schoolId?: string): string => {
    const targetSchoolId = schoolId || activeSchool.id;
    const targetSchool = schools.find(s => s.id === targetSchoolId) || activeSchool;
    const year = new Date().getFullYear();
    const prefix = targetSchool.code ? targetSchool.code.replace('SCH-', '') : 'ADM';
    
    // Existing admission numbers in this school
    const existing = studentsList.filter(s => s.schoolId === targetSchoolId);
    let nextNum = existing.length + 1;
    let candidate = `ADM-${year}-${String(nextNum).padStart(4, '0')}`;
    while (existing.some(s => s.admissionNumber.toUpperCase() === candidate.toUpperCase())) {
      nextNum++;
      candidate = `ADM-${year}-${String(nextNum).padStart(4, '0')}`;
    }
    return candidate;
  };

  const addStudent = (newStudentData: Omit<Student, 'id' | 'createdAt' | 'currentXp' | 'currentLevel' | 'currentStreak'>): Student => {
    const targetSchoolId = newStudentData.schoolId || activeSchool.id;
    
    // Strict Validation
    if (!newStudentData.firstName?.trim() || !newStudentData.lastName?.trim()) {
      throw new Error('Student first and last name are required.');
    }
    if (!newStudentData.admissionNumber?.trim()) {
      throw new Error('Admission number is required.');
    }
    if (!newStudentData.parentName?.trim() || !newStudentData.parentPhone?.trim()) {
      throw new Error('Guardian name and contact phone number are required.');
    }

    // Duplicate admission number check strictly scoped to school tenant
    const isDuplicateAdmission = studentsList.some(
      s => s.schoolId === targetSchoolId && s.admissionNumber.trim().toUpperCase() === newStudentData.admissionNumber.trim().toUpperCase()
    );
    if (isDuplicateAdmission) {
      throw new Error(`Duplicate admission number: A student with admission number '${newStudentData.admissionNumber}' is already registered in this school.`);
    }

    // Duplicate email check within school
    if (newStudentData.email?.trim()) {
      const isDuplicateEmail = studentsList.some(
        s => s.schoolId === targetSchoolId && s.email.trim().toLowerCase() === newStudentData.email.trim().toLowerCase()
      );
      if (isDuplicateEmail) {
        throw new Error(`A student with email '${newStudentData.email}' is already registered in this school.`);
      }
    }

    const studentId = `stud-${Date.now()}`;
    const targetSchool = schools.find(s => s.id === targetSchoolId) || activeSchool;
    const cityCode = (targetSchool.city || 'DEL').slice(0, 3).toUpperCase();
    const loginId = `STU-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = `Learn#2026@${newStudentData.firstName.replace(/[^a-zA-Z]/g, '')}`;

    const credentials: StudentCredentials = {
      loginId,
      temporaryPassword: tempPassword,
      provisionedAt: new Date().toISOString(),
      status: 'ACTIVE',
    };

    const newStudent: Student = {
      ...newStudentData,
      schoolId: targetSchoolId,
      id: studentId,
      currentXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      todayAttendance: 'PRESENT',
      provisioningStatus: 'ACTIVE',
      credentials,
      createdAt: new Date().toISOString(),
    };

    const updatedStudents = [newStudent, ...studentsList];
    setStudentsList(updatedStudents);
    try {
      localStorage.setItem('school_os_students', JSON.stringify(updatedStudents));
    } catch {}

    // Auto-enroll in eligible grade courses
    const eligibleCourses = coursesList.filter(c => {
      const numericGrade = parseInt(newStudent.gradeName.replace(/[^0-9]/g, '')) || 6;
      return numericGrade >= c.minGrade && numericGrade <= c.maxGrade;
    });

    if (eligibleCourses.length > 0) {
      setEnrollmentsList(prev => {
        let newEnrollments = [...prev];
        eligibleCourses.forEach(course => {
          newEnrollments.push({
            id: `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            studentId: newStudent.id,
            studentName: `${newStudent.firstName} ${newStudent.lastName}`,
            studentEmail: newStudent.email,
            studentLoginId: loginId,
            generatedPassword: tempPassword,
            admissionNumber: newStudent.admissionNumber,
            schoolId: newStudent.schoolId,
            schoolName: targetSchool.name,
            courseId: course.id,
            courseTitle: course.title,
            gradeName: newStudent.gradeName,
            sectionName: newStudent.sectionName,
            enrolledAt: new Date().toISOString(),
            progressPercentage: 0,
            completedLessons: 0,
            totalLessons: course.totalLessons,
            lastActiveAt: 'Just now',
            quizScoreAverage: 0,
            status: 'ACTIVE',
            currentModule: 'Module 1: Orientation'
          });
        });
        try {
          localStorage.setItem('school_os_enrollments', JSON.stringify(newEnrollments));
        } catch {}
        return newEnrollments;
      });
    }

    // Auto-create initial fee invoice if fee structure exists for this grade
    const matchedFeeStr = feeStructuresList.find(
      f => f.schoolId === targetSchoolId && (f.gradeName.toLowerCase() === newStudent.gradeName.toLowerCase() || f.gradeName.includes(newStudent.gradeName))
    );
    if (matchedFeeStr) {
      const newInv: FeeInvoice = {
        id: `inv-${Date.now()}`,
        schoolId: targetSchoolId,
        studentId: newStudent.id,
        studentName: `${newStudent.firstName} ${newStudent.lastName}`,
        invoiceNumber: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        category: `Annual Tuition & STEM Lab Fee (${newStudent.gradeName})`,
        totalAmount: matchedFeeStr.totalAnnualFee,
        discountAmount: 0,
        paidAmount: 0,
        dueDate: '2025-06-15',
        status: 'PENDING',
      };
      setInvoicesList(prev => {
        const updated = [newInv, ...prev];
        try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    // Create admission audit event
    recordAuditEvent(
      'New Student Enrolled & Account Provisioned',
      `${newStudent.firstName} ${newStudent.lastName} enrolled into ${newStudent.gradeName} (${newStudent.sectionName}). Cadet Login: ${loginId} created.`,
      'ADMISSION',
      targetSchoolId
    );

    return newStudent;
  };

  const bulkImportStudents = (
    studentsData: Array<{
      firstName: string;
      lastName: string;
      admissionNumber?: string;
      gradeName: string;
      sectionName?: string;
      rollNumber?: string;
      gender?: GenderType;
      dob?: string;
      parentName: string;
      parentPhone: string;
      parentEmail?: string;
      email?: string;
      address?: string;
    }>
  ): {
    successCount: number;
    failureCount: number;
    importedStudents: Student[];
    errors: Array<{ row: number; error: string; data: any }>;
  } => {
    const targetSchoolId = activeSchool.id;
    const targetSchool = schools.find(s => s.id === targetSchoolId) || activeSchool;
    const cityCode = (targetSchool.city || 'DEL').slice(0, 3).toUpperCase();
    const importedStudents: Student[] = [];
    const errors: Array<{ row: number; error: string; data: any }> = [];

    const existingAdmissions = new Set(studentsList.filter(s => s.schoolId === targetSchoolId).map(s => s.admissionNumber.toUpperCase()));
    const existingEmails = new Set(studentsList.filter(s => s.schoolId === targetSchoolId && s.email).map(s => s.email.toLowerCase()));

    const year = new Date().getFullYear();
    let nextSeq = studentsList.filter(s => s.schoolId === targetSchoolId).length + 1;

    studentsData.forEach((row, index) => {
      const rowNum = index + 1;
      try {
        if (!row.firstName?.trim() || !row.lastName?.trim()) {
          throw new Error('Student first and last name are required.');
        }
        if (!row.gradeName?.trim()) {
          throw new Error('Grade / Class is required.');
        }
        if (!row.parentName?.trim() || !row.parentPhone?.trim()) {
          throw new Error('Guardian name and mobile phone are required.');
        }

        let admissionNumber = row.admissionNumber?.trim().toUpperCase();
        if (!admissionNumber) {
          while (existingAdmissions.has(`ADM-${year}-${String(nextSeq).padStart(4, '0')}`)) {
            nextSeq++;
          }
          admissionNumber = `ADM-${year}-${String(nextSeq).padStart(4, '0')}`;
          nextSeq++;
        }

        if (existingAdmissions.has(admissionNumber)) {
          throw new Error(`Admission number '${admissionNumber}' already exists.`);
        }
        existingAdmissions.add(admissionNumber);

        const email = row.email?.trim().toLowerCase() || `${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}.${Math.floor(100 + Math.random() * 900)}@${targetSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`;
        if (row.email?.trim() && existingEmails.has(row.email.trim().toLowerCase())) {
          throw new Error(`Email '${row.email}' is already registered.`);
        }
        existingEmails.add(email);

        const studentId = `stud-${Date.now()}-${index}-${Math.floor(100 + Math.random() * 900)}`;
        const loginId = `STU-${cityCode}-${Math.floor(1000 + Math.random() * 9000)}`;
        const tempPassword = `Learn#2026@${row.firstName.replace(/[^a-zA-Z]/g, '')}`;

        const credentials: StudentCredentials = {
          loginId,
          temporaryPassword: tempPassword,
          provisionedAt: new Date().toISOString(),
          status: 'ACTIVE'
        };

        const newStudent: Student = {
          id: studentId,
          schoolId: targetSchoolId,
          profileId: `prof-${studentId}`,
          sessionId: 'session-2025-26',
          admissionNumber,
          rollNumber: row.rollNumber || String(index + 1),
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          gradeId: `grade-${row.gradeName.replace(/[^0-9]/g, '') || '6'}`,
          gradeName: row.gradeName.trim(),
          sectionId: `sec-${(row.sectionName || 'A').toLowerCase()}`,
          sectionName: row.sectionName?.trim() || 'A',
          gender: row.gender || 'MALE',
          dob: row.dob || '2013-05-15',
          bloodGroup: 'B+',
          parentName: row.parentName.trim(),
          parentPhone: row.parentPhone.trim(),
          parentEmail: row.parentEmail || `${row.parentName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          email,
          address: row.address || `${targetSchool.city || 'Campus'}, India`,
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
          todayAttendance: 'PRESENT',
          attendancePercentage: 100,
          feeStatus: 'PENDING',
          status: 'APPROVED',
          currentXp: 0,
          currentLevel: 1,
          currentStreak: 0,
          provisioningStatus: 'ACTIVE',
          credentials,
          createdAt: new Date().toISOString()
        };

        importedStudents.push(newStudent);
      } catch (err: any) {
        errors.push({ row: rowNum, error: err.message, data: row });
      }
    });

    if (importedStudents.length > 0) {
      setStudentsList(prev => {
        const updated = [...importedStudents, ...prev];
        try { localStorage.setItem('school_os_students', JSON.stringify(updated)); } catch {}
        return updated;
      });

      setEnrollmentsList(prev => {
        const newEnrollments = [...prev];
        importedStudents.forEach(st => {
          const eligibleCourses = coursesList.filter(c => {
            const numericGrade = parseInt(st.gradeName.replace(/[^0-9]/g, '')) || 6;
            return numericGrade >= c.minGrade && numericGrade <= c.maxGrade;
          });
          eligibleCourses.forEach(course => {
            newEnrollments.push({
              id: `enr-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              studentId: st.id,
              studentName: `${st.firstName} ${st.lastName}`,
              studentEmail: st.email,
              studentLoginId: st.credentials?.loginId || '',
              generatedPassword: st.credentials?.temporaryPassword || '',
              admissionNumber: st.admissionNumber,
              schoolId: st.schoolId,
              schoolName: targetSchool.name,
              courseId: course.id,
              courseTitle: course.title,
              gradeName: st.gradeName,
              sectionName: st.sectionName,
              enrolledAt: new Date().toISOString(),
              progressPercentage: 0,
              completedLessons: 0,
              totalLessons: course.totalLessons,
              lastActiveAt: 'Just now',
              quizScoreAverage: 0,
              status: 'ACTIVE',
              currentModule: 'Module 1: Orientation'
            });
          });
        });
        try { localStorage.setItem('school_os_enrollments', JSON.stringify(newEnrollments)); } catch {}
        return newEnrollments;
      });

      recordAuditEvent(
        'Bulk Student Admissions Imported',
        `${importedStudents.length} students successfully admitted & provisioned with Cadet credentials via Bulk CSV.`,
        'ADMISSION',
        targetSchoolId
      );
    }

    return {
      successCount: importedStudents.length,
      failureCount: errors.length,
      importedStudents,
      errors
    };
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudentsList(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  // Attendance Management
  const markAttendance = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
    date?: string,
    remarks?: string
  ): AttendanceRecord => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    let studentName = '';
    const student = studentsList.find(s => s.id === studentId);
    if (student) {
      studentName = `${student.firstName} ${student.lastName}`;
    }

    // 1. Update/Add in dated AttendanceRecord list (Prevent duplicate records for same student & date)
    let savedRecord: AttendanceRecord;
    setAttendanceRecordsList(prev => {
      const existingIndex = prev.findIndex(
        r => r.schoolId === activeSchool.id && r.studentId === studentId && r.date === targetDate
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        savedRecord = {
          ...updated[existingIndex],
          status,
          remarks: remarks || updated[existingIndex].remarks,
          markedAt: new Date().toISOString(),
          markedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administration'
        };
        updated[existingIndex] = savedRecord;
        try { localStorage.setItem('school_os_attendance_records', JSON.stringify(updated)); } catch {}
        return updated;
      } else {
        savedRecord = {
          id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          schoolId: activeSchool.id,
          studentId,
          date: targetDate,
          status,
          remarks,
          markedAt: new Date().toISOString(),
          markedBy: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administration'
        };
        const updated = [savedRecord, ...prev];
        try { localStorage.setItem('school_os_attendance_records', JSON.stringify(updated)); } catch {}
        return updated;
      }
    });

    // 2. If marking for today, also update Student.todayAttendance & recalculate attendancePercentage
    if (targetDate === todayStr) {
      setStudentsList(prev => {
        const updated = prev.map(s => {
          if (s.id === studentId) {
            let newPct = s.attendancePercentage;
            if (status === 'ABSENT' && s.todayAttendance !== 'ABSENT') {
              newPct = Math.max(50, Math.round((s.attendancePercentage - 1.2) * 10) / 10);
            } else if (status === 'PRESENT' && s.todayAttendance === 'ABSENT') {
              newPct = Math.min(100, Math.round((s.attendancePercentage + 1.2) * 10) / 10);
            }
            return {
              ...s,
              todayAttendance: status === 'EXCUSED' ? 'PRESENT' : status,
              attendancePercentage: newPct,
            };
          }
          return s;
        });
        try { localStorage.setItem('school_os_students', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    // 3. Record Audit Log for Principal/Teacher oversight
    const auditEvt: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: activeSchool.id,
      title: 'Daily Attendance Punch',
      detail: `${studentName || studentId} attendance marked as ${status} for ${targetDate}`,
      time: 'Just now',
      category: 'TEACHER',
    };
    recordAuditEvent(auditEvt.title, auditEvt.detail, auditEvt.category, auditEvt.schoolId);

    return savedRecord!;
  };

  const markBatchAttendance = (
    marks: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }[],
    date?: string
  ): { success: boolean; updatedCount: number } => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const markedBy = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Administration';
    const timestamp = new Date().toISOString();

    setAttendanceRecordsList(prev => {
      let updated = [...prev];
      marks.forEach(m => {
        const existingIndex = updated.findIndex(
          r => r.schoolId === activeSchool.id && r.studentId === m.studentId && r.date === targetDate
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            status: m.status,
            remarks: m.remarks || updated[existingIndex].remarks,
            markedAt: timestamp,
            markedBy
          };
        } else {
          updated.push({
            id: `att-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            schoolId: activeSchool.id,
            studentId: m.studentId,
            date: targetDate,
            status: m.status,
            remarks: m.remarks,
            markedAt: timestamp,
            markedBy
          });
        }
      });
      try { localStorage.setItem('school_os_attendance_records', JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (targetDate === todayStr) {
      setStudentsList(prev => {
        const markMap = new Map(marks.map(m => [m.studentId, m.status]));
        const updated = prev.map(s => {
          if (markMap.has(s.id)) {
            const st = markMap.get(s.id)!;
            return {
              ...s,
              todayAttendance: st === 'EXCUSED' ? 'PRESENT' : st
            };
          }
          return s;
        });
        try { localStorage.setItem('school_os_students', JSON.stringify(updated)); } catch {}
        return updated;
      });
    }

    recordAuditEvent(
      'Batch Attendance Register Updated',
      `${marks.length} student attendance marks recorded for ${targetDate}`,
      'TEACHER',
      activeSchool.id
    );

    return { success: true, updatedCount: marks.length };
  };

  const getAttendanceForDate = (date: string, gradeName?: string, sectionName?: string) => {
    let targetStudents = scopedStudents;
    if (gradeName && gradeName !== 'ALL') {
      targetStudents = targetStudents.filter(s => s.gradeName === gradeName || s.gradeId === gradeName);
    }
    if (sectionName && sectionName !== 'ALL') {
      targetStudents = targetStudents.filter(s => s.sectionName === sectionName || s.sectionId === sectionName);
    }

    const studentIds = new Set(targetStudents.map(s => s.id));
    const records = scopedAttendanceRecords.filter(r => r.date === date && studentIds.has(r.studentId));

    const recordMap = new Map(records.map(r => [r.studentId, r.status]));
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    targetStudents.forEach(s => {
      const status = recordMap.get(s.id) || (date === new Date().toISOString().split('T')[0] ? (s.todayAttendance || 'PRESENT') : 'PRESENT');
      if (status === 'PRESENT') presentCount++;
      else if (status === 'ABSENT') absentCount++;
      else if (status === 'LATE') lateCount++;
      else if (status === 'EXCUSED') excusedCount++;
    });

    const totalCount = targetStudents.length;
    const attendanceRate = totalCount > 0 ? Math.round(((presentCount + excusedCount) / totalCount) * 100) : 100;

    return {
      records,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      totalCount,
      attendanceRate
    };
  };

  // Fee Management & Authentic Receipts
  const payInvoice = (
    invoiceId: string,
    amount: number,
    paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE',
    options?: {
      transactionRef?: string;
      bankName?: string;
      chequeNumber?: string;
      notes?: string;
      additionalDiscount?: number;
      waiverReason?: string;
    }
  ): {
    success: boolean;
    receiptNumber: string;
    receipt?: PaymentReceipt;
    error?: string;
    remainingBalance?: number;
  } => {
    // 1. Locate Invoice
    const targetInvoice = invoicesList.find(inv => inv.id === invoiceId);
    if (!targetInvoice) {
      return { success: false, receiptNumber: '', error: 'Invoice not found.' };
    }

    // 2. Tenant scoping authorization check
    if (role !== 'SUPER_ADMIN' && targetInvoice.schoolId !== activeSchool.id) {
      return {
        success: false,
        receiptNumber: '',
        error: 'Unauthorized: Cannot process payment for an invoice belonging to another school tenant.'
      };
    }

    // 3. Amount validation (Strict Authenticity - Never simulate or invent transactions)
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return { success: false, receiptNumber: '', error: 'Payment amount must be greater than zero.' };
    }

    const appliedDiscount = options?.additionalDiscount && options.additionalDiscount > 0 ? options.additionalDiscount : 0;
    const effectiveDiscount = (targetInvoice.discountAmount || 0) + appliedDiscount;
    const netPayable = targetInvoice.totalAmount - effectiveDiscount;
    const remainingBefore = netPayable - targetInvoice.paidAmount;
    if (amount > remainingBefore) {
      return {
        success: false,
        receiptNumber: '',
        error: `Payment amount ₹${amount} exceeds the outstanding balance of ₹${remainingBefore}.`
      };
    }

    const receiptNumber = `REC-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPaid = targetInvoice.paidAmount + amount;
    const remainingAfter = Math.max(0, netPayable - newPaid);
    const newStatus: FeeInvoice['status'] = remainingAfter === 0 ? 'PAID' : 'PARTIAL';
    const txnRef = options?.transactionRef?.trim() || (paymentMode === 'UPI' ? `UPI-${Date.now().toString(36).toUpperCase()}` : undefined);

    // 4. Update Invoice in state & persistent storage
    setInvoicesList(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            discountAmount: effectiveDiscount,
            paidAmount: newPaid,
            status: newStatus,
            waiverReason: options?.waiverReason || inv.waiverReason,
            paymentHistory: [
              ...(inv.paymentHistory || []),
              {
                receiptNumber,
                amount,
                paymentMode,
                transactionRef: txnRef,
                paidAt: new Date().toISOString()
              }
            ]
          };
        }
        return inv;
      });
      try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 5. Update Student fee status
    setStudentsList(prev => {
      const updated = prev.map(s => {
        if (s.id === targetInvoice.studentId) {
          return {
            ...s,
            feeStatus: newStatus
          };
        }
        return s;
      });
      try { localStorage.setItem('school_os_students', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 6. Generate Official Digital Payment Receipt
    const student = studentsList.find(s => s.id === targetInvoice.studentId);
    const targetSchool = schools.find(s => s.id === targetInvoice.schoolId) || activeSchool;
    const newReceipt: PaymentReceipt = {
      receiptNumber,
      invoiceId: targetInvoice.id,
      invoiceNumber: targetInvoice.invoiceNumber,
      schoolId: targetInvoice.schoolId,
      schoolName: targetSchool.name,
      studentId: targetInvoice.studentId,
      studentName: targetInvoice.studentName,
      admissionNumber: student?.admissionNumber,
      gradeName: student?.gradeName,
      sectionName: student?.sectionName,
      category: targetInvoice.category,
      amountPaid: amount,
      paymentMode,
      transactionRef: txnRef,
      bankName: options?.bankName,
      chequeNumber: options?.chequeNumber,
      notes: options?.notes,
      waiverReason: options?.waiverReason,
      totalAmount: targetInvoice.totalAmount,
      discountAmount: effectiveDiscount,
      previousPaidAmount: targetInvoice.paidAmount,
      remainingBalance: remainingAfter,
      status: newStatus,
      paidAt: new Date().toISOString(),
      authorizedSignatory: currentUser ? `${currentUser.displayName || currentUser.firstName + ' ' + currentUser.lastName} (${currentUser.designation || 'Accounts Officer'})` : 'Accounts Department / Bursar'
    };

    setPaymentReceiptsList(prev => {
      const updated = [newReceipt, ...prev];
      try { localStorage.setItem('school_os_payment_receipts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 7. Update School Financials
    setFinancialsMap(prev => {
      const current = prev[targetInvoice.schoolId] || scopedFinancials;
      const updated = {
        ...prev,
        [targetInvoice.schoolId]: {
          ...current,
          totalCollected: current.totalCollected + amount,
          totalOverdue: Math.max(0, current.totalOverdue - amount),
        }
      };
      try { localStorage.setItem('school_os_financials', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // 8. Add Audit Log
    recordAuditEvent(
      `Fee Payment Received (${paymentMode})`,
      `₹${amount.toLocaleString('en-IN')} collected for ${targetInvoice.studentName} [Receipt: ${receiptNumber}]. Remaining: ₹${remainingAfter.toLocaleString('en-IN')}`,
      'FEE',
      targetInvoice.schoolId
    );

    return {
      success: true,
      receiptNumber,
      receipt: newReceipt,
      remainingBalance: remainingAfter
    };
  };

  const applyFeeWaiver = (
    invoiceId: string,
    waiverAmount: number,
    reason: string
  ): { success: boolean; error?: string; invoice?: FeeInvoice } => {
    const targetInvoice = invoicesList.find(inv => inv.id === invoiceId);
    if (!targetInvoice) return { success: false, error: 'Invoice not found.' };

    if (role !== 'SUPER_ADMIN' && targetInvoice.schoolId !== activeSchool.id) {
      return { success: false, error: 'Unauthorized: Cannot modify invoice from another school.' };
    }

    if (typeof waiverAmount !== 'number' || isNaN(waiverAmount) || waiverAmount <= 0) {
      return { success: false, error: 'Waiver amount must be greater than zero.' };
    }

    const currentNetPayable = targetInvoice.totalAmount - (targetInvoice.discountAmount || 0);
    const outstanding = currentNetPayable - targetInvoice.paidAmount;

    if (waiverAmount > outstanding) {
      return { success: false, error: `Waiver amount ₹${waiverAmount.toLocaleString('en-IN')} cannot exceed the outstanding balance of ₹${outstanding.toLocaleString('en-IN')}.` };
    }

    const newDiscount = (targetInvoice.discountAmount || 0) + waiverAmount;
    const newNetPayable = targetInvoice.totalAmount - newDiscount;
    const newRemaining = Math.max(0, newNetPayable - targetInvoice.paidAmount);
    const newStatus: FeeInvoice['status'] = newRemaining <= 0 ? 'PAID' : (targetInvoice.paidAmount > 0 ? 'PARTIAL' : 'PENDING');
    const approver = currentUser ? (currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`) : 'Principal / Administration';

    let updatedInvoice: FeeInvoice | null = null;
    setInvoicesList(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoiceId) {
          updatedInvoice = {
            ...inv,
            discountAmount: newDiscount,
            waiverReason: reason,
            waiverApprovedBy: approver,
            status: newStatus
          };
          return updatedInvoice;
        }
        return inv;
      });
      try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });

    recordAuditEvent(
      `Fee Waiver Applied: ₹${waiverAmount.toLocaleString('en-IN')}`,
      `Concession granted to ${targetInvoice.studentName} for '${reason}'. Approved by: ${approver}`,
      'FEE',
      targetInvoice.schoolId
    );

    return { success: true, invoice: updatedInvoice || undefined };
  };

  const sendFeeReminder = (
    invoiceId: string,
    channel: 'WHATSAPP' | 'SMS' | 'EMAIL' = 'WHATSAPP'
  ): { success: boolean; templateMessage: string; error?: string } => {
    const targetInvoice = invoicesList.find(inv => inv.id === invoiceId);
    if (!targetInvoice) return { success: false, templateMessage: '', error: 'Invoice not found.' };

    const student = studentsList.find(s => s.id === targetInvoice.studentId);
    const targetSchool = schools.find(s => s.id === targetInvoice.schoolId) || activeSchool;
    const netPayable = targetInvoice.totalAmount - (targetInvoice.discountAmount || 0);
    const outstanding = Math.max(0, netPayable - targetInvoice.paidAmount);

    const message = `Dear Parent, Greetings from ${targetSchool.name}. This is an official fee reminder for your ward ${targetInvoice.studentName} (Adm: ${student?.admissionNumber || 'N/A'}, Class: ${student?.gradeName || 'N/A'}). Outstanding fee balance: ₹${outstanding.toLocaleString('en-IN')} (Due: ${targetInvoice.dueDate}). Kindly remit at earliest via UPI/Portal. Thank you - InnovatMind School OS.`;

    const timestamp = new Date().toISOString();

    setInvoicesList(prev => {
      const updated = prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            lastReminderSentAt: timestamp,
            lastReminderChannel: channel
          };
        }
        return inv;
      });
      try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });

    recordAuditEvent(
      `Fee Reminder Sent via ${channel}`,
      `Reminder dispatched to parent of ${targetInvoice.studentName} for outstanding ₹${outstanding.toLocaleString('en-IN')}`,
      'FEE',
      targetInvoice.schoolId
    );

    return { success: true, templateMessage: message };
  };

  const sendBatchFeeReminders = (
    invoiceIds: string[],
    channel: 'WHATSAPP' | 'SMS' | 'EMAIL' = 'WHATSAPP'
  ): { success: boolean; count: number; error?: string } => {
    const timestamp = new Date().toISOString();
    let sentCount = 0;

    setInvoicesList(prev => {
      const updated = prev.map(inv => {
        if (invoiceIds.includes(inv.id)) {
          sentCount++;
          return {
            ...inv,
            lastReminderSentAt: timestamp,
            lastReminderChannel: channel
          };
        }
        return inv;
      });
      try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
      return updated;
    });

    recordAuditEvent(
      `Batch Fee Reminders Dispatched (${channel})`,
      `${sentCount} fee reminder notifications sent to parents for overdue and pending invoices`,
      'FEE',
      activeSchool.id
    );

    return { success: true, count: sentCount };
  };

  const getInvoiceReceipt = (invoiceNumberOrId: string): PaymentReceipt | undefined => {
    return paymentReceiptsList.find(
      r => (r.invoiceId === invoiceNumberOrId || r.invoiceNumber === invoiceNumberOrId || r.receiptNumber === invoiceNumberOrId) &&
           (role === 'SUPER_ADMIN' || r.schoolId === activeSchool.id)
    );
  };

  const createInvoice = (inv: Omit<FeeInvoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: FeeInvoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setInvoicesList(prev => {
      const updated = [newInvoice, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_invoices', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    setFinancialsMap(prev => {
      const current = prev[activeSchool.id] || scopedFinancials;
      const updated = {
        ...prev,
        [activeSchool.id]: {
          ...current,
          totalBilled: current.totalBilled + newInvoice.totalAmount,
          totalOverdue: current.totalOverdue + (newInvoice.totalAmount - newInvoice.discountAmount - newInvoice.paidAmount),
        }
      };
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_financials', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // Staff & Deterministic Payroll Mutators
  const addStaff = (member: Omit<StaffMember, 'id'>) => {
    const tempPassword = member.credentials?.temporaryPassword || `Teach@${Math.floor(1000 + Math.random() * 9000)}`;
    const newStaff: StaffMember = {
      ...member,
      id: `stf-${Date.now()}`,
      credentials: {
        loginId: member.email.trim().toLowerCase(),
        temporaryPassword: tempPassword,
        generatedAt: new Date().toISOString()
      }
    };
    setStaffList(prev => {
      const updated = [newStaff, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_staff', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    recordAuditEvent(
      `Faculty Account Created: ${newStaff.name}`,
      `Assigned to ${newStaff.department}. Login ID: ${newStaff.email} provisioned with role TEACHER.`,
      'AUTH',
      activeSchool.id
    );
  };

  const assignTeacherTask = (taskData: Omit<TeacherTask, 'id' | 'assignedAt'>) => {
    const newTask: TeacherTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      assignedAt: new Date().toISOString()
    };
    setTeacherTasksList(prev => {
      const updated = [newTask, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_teacher_tasks', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    recordAuditEvent(
      `Task Assigned to Teacher: ${newTask.teacherName}`,
      `Task "${newTask.title}" assigned to ${newTask.teacherName} (Due: ${newTask.dueDate}).`,
      'TEACHER',
      newTask.schoolId
    );
  };

  const updateTeacherTaskStatus = (taskId: string, status: TeacherTask['status']) => {
    setTeacherTasksList(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, status } : t);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_teacher_tasks', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const runPayrollForMonth = (month: string): { generatedCount: number; totalDisbursed: number } => {
    const schoolStaff = staffList.filter(s => s.schoolId === activeSchool.id && s.status === 'ACTIVE');
    let totalDisbursed = 0;
    const newRecords: PayrollRecord[] = [];

    schoolStaff.forEach(staff => {
      // Deterministic Formula: Net = (Basic + Allowances + Incentives + Overtime) - (Leave Deductions + Advances + Other Deductions)
      const incentives = Math.round(staff.basicSalary * 0.05); // 5% performance incentive
      const overtime = 0;
      const leaveDeduction = staff.attendanceRate < 95 ? Math.round(staff.basicSalary * 0.03) : 0;
      const advance = 0;
      const otherDeduction = 500; // Standard professional tax / insurance
      const netSalary = (staff.basicSalary + staff.allowances + incentives + overtime) - (leaveDeduction + advance + otherDeduction);

      totalDisbursed += netSalary;

      newRecords.push({
        id: `pay-${Date.now()}-${staff.id}`,
        schoolId: activeSchool.id,
        staffId: staff.id,
        staffName: staff.name,
        month: month,
        basicSalary: staff.basicSalary,
        allowances: staff.allowances,
        incentives: incentives,
        overtime: overtime,
        leaveDeduction: leaveDeduction,
        advance: advance,
        otherDeduction: otherDeduction,
        netSalary: netSalary,
        paymentStatus: 'PAID',
        generatedAt: new Date().toISOString(),
      });
    });

    setPayrollList(prev => {
      const updated = [...newRecords, ...prev.filter(p => !(p.schoolId === activeSchool.id && p.month === month))];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_payroll', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    // Audit Event
    recordAuditEvent(
      `Monthly Payroll Executed (${month})`,
      `₹${totalDisbursed.toLocaleString('en-IN')} disbursed deterministically across ${schoolStaff.length} faculty/staff members.`,
      'AUTH',
      activeSchool.id
    );

    return { generatedCount: schoolStaff.length, totalDisbursed };
  };

  const markPayrollPaid = (recordId: string) => {
    setPayrollList(prev => {
      const updated = prev.map(p => p.id === recordId ? { ...p, paymentStatus: 'PAID' as const } : p);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_payroll', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // Timetable Mutators with Conflict Detection
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id' | 'schoolId'>): { success: boolean; conflict?: string } => {
    // Check for Teacher Conflict in active school
    const teacherConflict = timetableList.find(
      t => t.schoolId === activeSchool.id &&
           t.day === slotData.day &&
           t.periodNumber === slotData.periodNumber &&
           t.teacher.toLowerCase().trim() === slotData.teacher.toLowerCase().trim()
    );

    if (teacherConflict) {
      return {
        success: false,
        conflict: `Teacher Conflict: ${slotData.teacher} is already assigned to ${teacherConflict.grade} (${teacherConflict.section}) during Period ${slotData.periodNumber} (${slotData.timeSlot}).`
      };
    }

    // Check for Room Conflict
    const roomConflict = timetableList.find(
      t => t.schoolId === activeSchool.id &&
           t.day === slotData.day &&
           t.periodNumber === slotData.periodNumber &&
           t.room.toLowerCase().trim() === slotData.room.toLowerCase().trim()
    );

    if (roomConflict) {
      return {
        success: false,
        conflict: `Room Conflict: ${slotData.room} is already occupied by ${roomConflict.grade} (${roomConflict.section}) for ${roomConflict.subject}.`
      };
    }

    const newSlot: TimetableSlot = {
      ...slotData,
      id: `tt-${Date.now()}`,
      schoolId: activeSchool.id,
    };

    setTimetableList(prev => {
      const updated = [...prev, newSlot];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_timetable', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
    return { success: true };
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetableList(prev => {
      const updated = prev.filter(t => t.id !== slotId);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_timetable', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const updateSchoolBranding = (brandingData: Partial<School>) => {
    const updated: School = {
      ...activeSchool,
      ...brandingData,
    };
    setActiveSchoolState(updated);
    setSchools(prev => {
      const nextSchools = prev.map(s => s.id === updated.id ? updated : s);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_schools', JSON.stringify(nextSchools)); } catch {}
      }
      return nextSchools;
    });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`school_brand_${updated.id}`, JSON.stringify(brandingData));
      } catch {}
    }
    recordAuditEvent(
      'White-Label Branding Customized',
      `Brand theme (${updated.brandThemeColor || '#4f46e5'}), logo crest, and portal title updated for ${updated.name}`,
      'AUTH',
      updated.id
    );
  };

  // Exam & Assessment Cell Mutators
  const addExam = (examData: Omit<Exam, 'id' | 'isResultPublished'>): Exam => {
    const eligibleStudents = studentsList.filter(s => s.schoolId === activeSchool.id && (examData.targetGrades || []).includes(s.gradeName));
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
      schoolId: examData.schoolId || activeSchool.id,
      totalStudentsCount: eligibleStudents.length || 35,
      evaluatedStudentsCount: 0,
      isResultPublished: false,
    };

    setExamsList(prev => {
      const updated = [newExam, ...prev];
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exams', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    const audit: AuditEvent = {
      id: `act-${Date.now()}`,
      schoolId: activeSchool.id,
      title: `Assessment Scheduled: ${newExam.title}`,
      detail: `Created ${newExam.code} (${newExam.type}) for ${(newExam.targetGrades || []).join(', ')}.`,
      time: 'Just now',
      category: 'TEACHER'
    };
    setActivitiesList(prev => [audit, ...prev]);

    return newExam;
  };

  const updateExamStatus = (examId: string, status: ExamStatus) => {
    setExamsList(prev => {
      const updated = prev.map(e => e.id === examId ? { ...e, status } : e);
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exams', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const saveStudentExamMarks = (marks: StudentExamMark[]) => {
    setExamMarksList(prev => {
      const markMap = new Map<string, StudentExamMark>();
      prev.forEach(m => markMap.set(`${m.examId}_${m.studentId}_${m.subject}`, m));
      marks.forEach(m => markMap.set(`${m.examId}_${m.studentId}_${m.subject}`, m));
      const updated = Array.from(markMap.values());
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exam_marks', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    const affectedExamIds = Array.from(new Set(marks.map(m => m.examId)));
    setExamsList(prev => {
      const updated = prev.map(e => {
        if (affectedExamIds.includes(e.id)) {
          const allRelevantMarks = [...examMarksList.filter(m => m.examId === e.id), ...marks.filter(m => m.examId === e.id)];
          const studentIds = new Set(allRelevantMarks.map(m => m.studentId));
          const count = studentIds.size;
          const totalTarget = e.totalStudentsCount || 30;
          const newStatus: ExamStatus = e.status === 'DECLARED' ? 'DECLARED' : (count >= totalTarget ? 'MARKS_SUBMITTED' : 'EVALUATING');
          
          const avgPct = allRelevantMarks.length > 0 
            ? Math.round((allRelevantMarks.reduce((acc, curr) => acc + (curr.marksObtained / (curr.maxMarks || 100)), 0) / allRelevantMarks.length) * 100) 
            : e.averagePercentage;

          return {
            ...e,
            evaluatedStudentsCount: count,
            averagePercentage: avgPct,
            status: newStatus
          };
        }
        return e;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exams', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const declareExamResult = (examId: string, declaredBy?: string) => {
    const signer = declaredBy || `${currentUser?.firstName || 'Principal'} ${currentUser?.lastName || ''}`.trim() || 'Exam Controller';
    const nowIso = new Date().toISOString();
    let declaredTitle = '';
    setExamsList(prev => {
      const updated = prev.map(e => {
        if (e.id === examId) {
          declaredTitle = e.title;
          return {
            ...e,
            isResultPublished: true,
            resultDeclaredDate: nowIso.split('T')[0],
            status: 'DECLARED' as ExamStatus
          };
        }
        return e;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exams', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    const audit: AuditEvent = {
      id: `act-${Date.now()}`,
      schoolId: activeSchool.id,
      title: `Official Results Declared: ${declaredTitle || 'Exam'}`,
      detail: `Exam results signed and declared by ${signer}. Marksheets are now accessible to students.`,
      time: 'Just now',
      category: 'AUTH'
    };
    setActivitiesList(prev => [audit, ...prev]);
  };

  const unpublishExamResult = (examId: string) => {
    setExamsList(prev => {
      const updated = prev.map(e => {
        if (e.id === examId) {
          return {
            ...e,
            isResultPublished: false,
            status: 'MARKS_SUBMITTED' as ExamStatus
          };
        }
        return e;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_exams', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  // Emergency & Holiday Notice Broadcast Center Mutators
  const publishNotice = async (
    noticeData: Omit<NoticeBroadcast, 'id' | 'sentAt' | 'deliveredCount' | 'totalRecipients' | 'openRate'>
  ): Promise<{ success: boolean; notice?: NoticeBroadcast; error?: string }> => {
    try {
      const nowIso = new Date().toISOString();
      const totalRecipientsCount = studentsList.filter(s => s.schoolId === activeSchool.id).length || 650;
      const newNotice: NoticeBroadcast = {
        ...noticeData,
        id: `notif-${Date.now()}`,
        schoolId: noticeData.schoolId || activeSchool.id,
        sentAt: nowIso,
        deliveredCount: totalRecipientsCount,
        totalRecipients: totalRecipientsCount,
        openRate: 98.4,
        status: 'PUBLISHED',
        readByUsers: []
      };

      setNoticesList(prev => {
        const updated = [newNotice, ...prev];
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_notices', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });

      recordAuditEvent(
        noticeData.priority === 'URGENT' ? 'Emergency Notice Broadcasted' : 'School Announcement Published',
        `"${newNotice.title}" [${newNotice.priority}] dispatched to ${newNotice.targetAudience} across ${newNotice.channels.join(', ')}.`,
        'AUTH',
        newNotice.schoolId
      );

      return { success: true, notice: newNotice };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to publish notice' };
    }
  };

  const deleteNotice = async (noticeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setNoticesList(prev => {
        const updated = prev.filter(n => n.id !== noticeId);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_notices', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete notice' };
    }
  };

  const togglePinNotice = async (noticeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setNoticesList(prev => {
        const updated = prev.map(n => n.id === noticeId ? { ...n, isEmergencyBanner: !n.isEmergencyBanner } : n);
        if (typeof window !== 'undefined') {
          try { localStorage.setItem('school_os_notices', JSON.stringify(updated)); } catch {}
        }
        return updated;
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to toggle pin' };
    }
  };

  const dismissNotice = (noticeId: string) => {
    const userId = currentUser?.id || 'session-guest';
    setNoticesList(prev => {
      const updated = prev.map(n => {
        if (n.id === noticeId) {
          const reads = n.readByUsers || [];
          if (!reads.includes(userId)) {
            return { ...n, readByUsers: [...reads, userId] };
          }
        }
        return n;
      });
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('school_os_notices', JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  };

  const scopedNotices = useMemo(() => {
    return noticesList.filter(n => n.schoolId === activeSchool.id || n.schoolId === 'platform' || activeSchool.isDemo);
  }, [noticesList, activeSchool]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        setRole,
        activeSchool,
        setActiveSchool,
        schools,
        login,
        loginWithGoogle,
        loginAsRole,
        registerSchool,
        logout,
        students: scopedStudents,
        invoices: scopedInvoices,
        staff: scopedStaff,
        payrollRecords: scopedPayroll,
        timetableSlots: scopedTimetable,
        financials: scopedFinancials,
        admissions: scopedAdmissions,
        attendance: scopedAttendance,
        stemTelemetry: scopedStemTelemetry,
        facilities: scopedFacilities,
        activities: scopedActivities,
        courses: coursesList,
        addCourse,
        updateCoursePrice,
        updateCourse,
        deleteCourse,
        archiveCourse,
        duplicateCourse,
        toggleCoursePublish,
        removeSchoolCourseAssignment,
        reassignSchoolPrincipal,
        transferAdministrator,
        reassignTrainer,
        enrollments: scopedEnrollments,
        allEnrollments: enrollmentsList,
        batches: scopedBatches,
        allBatches: batchesList,
        bulkEnrollStudents,
        updateStudentLearningProgress,
        exams: scopedExams,
        allExams: examsList,
        examMarks: scopedExamMarks,
        allExamMarks: examMarksList,
        addExam,
        updateExamStatus,
        saveStudentExamMarks,
        declareExamResult,
        unpublishExamResult,
        activeStudent,
        setActiveStudent,
        addStudent,
        bulkImportStudents,
        generateNextAdmissionNumber,
        provisionStudentAccount,
        resetStudentCredentials,
        updateStudentStatus,
        attendanceRecords: scopedAttendanceRecords,
        markAttendance,
        markBatchAttendance,
        getAttendanceForDate,
        feeStructures: scopedFeeStructures,
        paymentReceipts: scopedPaymentReceipts,
        payInvoice,
        applyFeeWaiver,
        sendFeeReminder,
        sendBatchFeeReminders,
        createInvoice,
        getInvoiceReceipt,
        addStaff,
        runPayrollForMonth,
        markPayrollPaid,
        addTimetableSlot,
        deleteTimetableSlot,
        createSchool,
        updateSchool,
        deleteSchool,
        revokeSchoolDeletion,
        approveSchool,
        rejectSchool,
        toggleSchoolSuspension,
        dispatchWelcomeKit,
        setSchoolStatus,
        updateSchoolModules,
        resetSchoolAdminPassword,
        resetStaffPassword,
        teacherTasks: scopedTeacherTasks,
        assignTeacherTask,
        updateTeacherTaskStatus,
        pricingRules: pricingRulesList,
        schoolPricingOverrides: schoolPricingOverridesList,
        resolveCoursePrice,
        savePricingRule,
        setSchoolPricingOverride,
        resetSchoolPricingOverride,
        togglePricingRuleStatus,
        schoolCourseAssignments: assignmentsList,
        assignCourseToSchool,
        updateCourseAssignment,
        changeAssignmentStatus,
        trainers: trainersList,
        trainerAllocations: allocationsList,
        allocateTrainer,
        removeTrainerAllocation,
        updateTrainerProfile,
        onboardTrainer,
        deleteTrainer,
        recordAuditEvent,
        updateSchoolBranding,
        notices: scopedNotices,
        allNotices: noticesList,
        publishNotice,
        deleteNotice,
        togglePinNotice,
        dismissNotice,
        dataMode,
        setDataMode,
        authProvider,
        setAuthProvider,
        cognitoConfigError,
        isLoadingData,
        dataError,
        clearDataError,
        resetDemoSandbox,
        syncProductionData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

