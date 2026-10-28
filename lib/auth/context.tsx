"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  School,
  Student,
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
  BillingBasis,
  SchoolOnboardingStage,
  StudentCredentials,
  ProvisioningStatus,
  AccountStatus
} from '../types';
import {
  initialSchools,
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
  initialTrainerAllocations
} from '../db/mock-data';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeSchool: School;
  setActiveSchool: (school: School, bypassAuthCheck?: boolean) => void;
  schools: School[];
  
  // Authentication Actions
  login: (identifier: string, password?: string, targetSchoolId?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  loginWithGoogle: (email?: string, idToken?: string) => Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    code?: 'OAUTH_CONFIG_MISSING' | 'ACCOUNT_NOT_LINKED' | 'USER_SUSPENDED' | 'AUTH_FAILED';
  }>;
  loginAsRole: (role: UserRole, schoolId?: string) => void;
  registerSchool: (
    schoolData: Omit<School, 'id' | 'code' | 'isActive' | 'createdAt' | 'enrolledCoursesCount'>,
    principalData: { firstName: string; lastName: string; email: string; password?: string; designation?: string; phone?: string }
  ) => Promise<{ success: boolean; school: School; user: UserProfile }>;
  logout: () => void;

  // Super Admin -> School Management & Lifecycle
  createSchool: (data: Partial<School>) => Promise<{ success: boolean; school?: School; error?: string }>;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  setSchoolStatus: (schoolId: string, isActive: boolean, onboardingStatus?: SchoolOnboardingStage) => void;

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

  // Course Management & Dynamic Pricing (Super Admin)
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCoursePrice: (courseId: string, price: number) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;

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

  // Mutators
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'currentXp' | 'currentLevel' | 'currentStreak'>) => Student;
  updateStudentStatus: (studentId: string, status: Student['status']) => void;
  markAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => void;
  
  // Fee Mutators
  payInvoice: (invoiceId: string, amount: number, paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE') => { success: boolean; receiptNumber: string };
  createInvoice: (inv: Omit<FeeInvoice, 'id' | 'invoiceNumber'>) => void;

  // Staff & Payroll Mutators
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  runPayrollForMonth: (month: string) => { generatedCount: number; totalDisbursed: number };
  markPayrollPaid: (recordId: string) => void;

  // Timetable Mutators
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'schoolId'>) => { success: boolean; conflict?: string };
  deleteTimetableSlot: (slotId: string) => void;

  // White-Label Branding Mutator
  updateSchoolBranding: (brandingData: Partial<School>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [schools, setSchools] = useState<School[]>(initialSchools);
  const [activeSchool, setActiveSchoolState] = useState<School>(initialSchools[0]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(demoUsers[1]); // Default: Dr. Ananya Sharma (Principal)
  const [role, setRoleState] = useState<UserRole>('SCHOOL_ADMIN');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Core multi-tenant state lists
  const [studentsList, setStudentsList] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_students');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialStudents;
  });
  const [invoicesList, setInvoicesList] = useState<FeeInvoice[]>(initialInvoices);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff);
  const [payrollList, setPayrollList] = useState<PayrollRecord[]>(initialPayroll);
  const [timetableList, setTimetableList] = useState<TimetableSlot[]>(initialTimetable);
  const [activitiesList, setActivitiesList] = useState<AuditEvent[]>(initialAuditEvents);
  const [financialsMap, setFinancialsMap] = useState<Record<string, SchoolFinancials>>(initialSchoolFinancials);
  const [coursesList, setCoursesList] = useState<Course[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_courses');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialCourses;
  });

  const [enrollmentsList, setEnrollmentsList] = useState<StudentEnrollment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_enrollments');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialEnrollments;
  });

  const [batchesList, setBatchesList] = useState<BulkEnrollmentBatch[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_batches');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialBatches;
  });

  const [examsList, setExamsList] = useState<Exam[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_exams');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialExams;
  });

  const [examMarksList, setExamMarksList] = useState<StudentExamMark[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_exam_marks');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialExamMarks;
  });

  // Super Admin Central Collections
  const [trainersList, setTrainersList] = useState<TrainerProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_trainers');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialTrainers;
  });

  const [pricingRulesList, setPricingRulesList] = useState<PricingRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_pricing_rules');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialPricingRules;
  });

  const [schoolPricingOverridesList, setSchoolPricingOverridesList] = useState<SchoolPricingOverride[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_pricing_overrides');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialSchoolPricingOverrides;
  });

  const [assignmentsList, setAssignmentsList] = useState<SchoolCourseAssignment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_assignments');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialSchoolAssignments;
  });

  const [allocationsList, setAllocationsList] = useState<TrainerAllocation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('school_os_allocations');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return initialTrainerAllocations;
  });

  const [activeStudent, setActiveStudent] = useState<Student | null>(initialStudents[0]);

  // Load persisted session on initial mount
  useEffect(() => {
    try {
      const savedUserJson = localStorage.getItem('school_os_user');
      const savedSchoolId = localStorage.getItem('school_os_school_id');
      const savedSchoolsJson = localStorage.getItem('school_os_custom_schools');
      
      let currentSchools = initialSchools;
      if (savedSchoolsJson) {
        try {
          const customSchools: School[] = JSON.parse(savedSchoolsJson);
          if (Array.isArray(customSchools) && customSchools.length > 0) {
            currentSchools = [...initialSchools, ...customSchools];
            setSchools(currentSchools);
          }
        } catch {}
      }

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

        const targetSchool = currentSchools.find(s => s.id === (parsedUser.schoolId || savedSchoolId)) || currentSchools[0];
        setActiveSchoolState(targetSchool);
      }
    } catch {
      // Ignore SSR/storage errors
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'SUPER_ADMIN') {
      const superUser = demoUsers[0];
      const { password: _, ...profile } = superUser;
      setCurrentUser(profile);
      try {
        localStorage.setItem('school_os_user', JSON.stringify(profile));
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
  ): Promise<{ success: boolean; school: School; user: UserProfile }> => {
    const cityCode = (schoolData.city || 'SCH').slice(0, 3).toUpperCase();
    const newSchoolId = `school-${Date.now()}`;
    const newSchoolCode = `SCH-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedLoginId = `admin.${cityCode.toLowerCase()}${randomSuffix}@schoolos.internal`;
    const generatedTempPassword = `${cityCode}#Admin${randomSuffix}`;

    const newSchool: School = {
      ...schoolData,
      id: newSchoolId,
      code: newSchoolCode,
      isActive: true,
      enrolledCoursesCount: 6,
      createdAt: new Date().toISOString(),
      adminCredentials: {
        loginId: generatedLoginId,
        email: principalData.email,
        temporaryPassword: generatedTempPassword,
        generatedAt: new Date().toISOString(),
        provisionedBy: 'InnovatMind Super Admin HQ',
      },
    };

    // Initialize Default Scoped Data for the new school
    setFinancialsMap(prev => ({
      ...prev,
      [newSchoolId]: {
        schoolId: newSchoolId,
        totalBilled: (schoolData.totalStudents || 250) * 25000,
        totalCollected: Math.round((schoolData.totalStudents || 250) * 25000 * 0.85),
        totalOverdue: Math.round((schoolData.totalStudents || 250) * 25000 * 0.15),
        upiPercentage: 70,
        netBankingPercentage: 20,
        cashPercentage: 10,
      }
    }));

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
      isActive: true,
    };

    // Update School state & persist custom schools
    setSchools(prev => {
      const updated = [...prev, newSchool];
      try {
        const customOnly = updated.filter(s => !initialSchools.some(init => init.id === s.id));
        localStorage.setItem('school_os_custom_schools', JSON.stringify(customOnly));
      } catch {}
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
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: 95000,
      allowances: 25000,
      attendanceRate: 100.0,
      status: 'ACTIVE',
    };
    setStaffList(prev => [newStaffMember, ...prev]);

    // Audit Event
    const registrationEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: newSchoolId,
      title: 'Institutional Workspace Initialized',
      detail: `${newSchool.name} registered under ${newSchool.schoolType} Board by ${principalData.firstName} ${principalData.lastName}. Admin credentials provisioned.`,
      time: 'Just now',
      category: 'AUTH',
    };
    setActivitiesList(prev => [registrationEvent, ...prev]);

    // Authenticate and lock into this new school
    setCurrentUser(newPrincipal);
    setRoleState('SCHOOL_ADMIN');
    setActiveSchoolState(newSchool);
    setIsAuthenticated(true);

    try {
      localStorage.setItem('school_os_user', JSON.stringify(newPrincipal));
      localStorage.setItem('school_os_school_id', newSchoolId);
    } catch {}

    return { success: true, school: newSchool, user: newPrincipal };
  };

  // Audit Event Recorder
  const recordAuditEvent = (title: string, detail: string, category: AuditEvent['category'] = 'AUTH', schoolId?: string) => {
    const event: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: schoolId || activeSchool.id,
      title,
      detail,
      time: 'Just now',
      category
    };
    setActivitiesList(prev => [event, ...prev]);
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
    const generatedLoginId = `admin.${cityCode.toLowerCase()}${randomSuffix}@schoolos.internal`;
    const generatedTempPassword = `${cityCode}#Admin${randomSuffix}`;

    const newSchool: School = {
      id: newSchoolId,
      code: targetCode,
      name: data.name.trim(),
      schoolType: data.schoolType || 'CBSE',
      email: data.email?.trim() || `contact@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
      phone: data.phone?.trim() || '+91 98000 00000',
      address: data.address?.trim() || data.city || 'Main Campus',
      city: data.city?.trim() || 'Metropolis',
      state: data.state?.trim() || 'State',
      country: data.country?.trim() || 'India',
      postalCode: data.postalCode?.trim() || '100001',
      region: data.region || 'North',
      isActive: data.isActive !== undefined ? data.isActive : true,
      totalStudents: Number(data.totalStudents) || 500,
      totalStaff: Number(data.totalStaff) || 30,
      enrolledCoursesCount: 0,
      createdAt: new Date().toISOString(),
      principalName: data.principalName?.trim() || 'Principal In-charge',
      contactPersonName: data.contactPersonName?.trim() || data.principalName?.trim(),
      contactPersonPhone: data.contactPersonPhone?.trim() || data.phone?.trim(),
      contactPersonEmail: data.contactPersonEmail?.trim() || data.email?.trim(),
      onboardingStatus: data.onboardingStatus || 'ACTIVE',
      academicSession: data.academicSession || '2026-2027',
      contractStartDate: data.contractStartDate || new Date().toISOString().split('T')[0],
      contractEndDate: data.contractEndDate || new Date(Date.now() + 365*24*3600*1000).toISOString().split('T')[0],
      notes: data.notes?.trim() || '',
      adminCredentials: {
        loginId: generatedLoginId,
        email: data.email?.trim() || `admin@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
        temporaryPassword: generatedTempPassword,
        generatedAt: new Date().toISOString(),
        provisionedBy: 'InnovatMind Super Admin HQ',
      }
    };

    setSchools(prev => {
      const updated = [newSchool, ...prev];
      try {
        localStorage.setItem('school_os_schools', JSON.stringify(updated));
      } catch {}
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
      try {
        localStorage.setItem('school_os_schools', JSON.stringify(updated));
      } catch {}
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

  // Super Admin -> Deterministic Course Pricing Hierarchy Resolver
  // Hierarchy Precedence: Default Price -> Region -> State -> City -> School Type -> Grade -> Course -> School Override
  const resolveCoursePrice = (courseId: string, schoolId?: string, academicSession = '2026-2027', gradeName?: string) => {
    const targetSchool = schools.find(s => s.id === schoolId) || activeSchool;
    const course = coursesList.find(c => c.id === courseId);
    const basePrice = course?.pricePerStudent || 999;

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
        reason: schoolOverride.reason
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
          overrideApplied: false
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
          overrideApplied: false
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
          overrideApplied: false
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
          overrideApplied: false
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
          overrideApplied: false
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
        overrideApplied: false
      };
    }

    // 8. Fallback to course base price
    return {
      price: basePrice,
      currency: 'INR' as const,
      billingBasis: 'PER_STUDENT' as const,
      source: 'Course Catalog Price',
      overrideApplied: false
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

  // Login handler supporting Email, Student Admission ID, Employee ID, School Code, or Super Admin
  const login = async (
    identifier: string,
    password?: string,
    targetSchoolId?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
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

    // 3. Check Provisioned School Admin Credentials by Login ID, School Code, or School Email
    const matchedSchoolByAdminCreds = schools.find(
      s => (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === raw) ||
           (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === raw) ||
           (s.code && s.code.toLowerCase() === raw) ||
           (s.email && s.email.toLowerCase() === raw)
    );
    if (matchedSchoolByAdminCreds) {
      const expectedPassword = matchedSchoolByAdminCreds.adminCredentials?.temporaryPassword || 'password123';
      if (password !== 'password123' && password !== expectedPassword) {
        return { success: false, error: `Invalid password for ${matchedSchoolByAdminCreds.name}. Please enter your provisioned password.` };
      }
      if (!matchedSchoolByAdminCreds.isActive || matchedSchoolByAdminCreds.onboardingStatus === 'SUSPENDED') {
        return { success: false, error: `Account for ${matchedSchoolByAdminCreds.name} is currently suspended.` };
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

    // 4. Check in Student Directory or Generated Student Credentials
    const matchedEnrollment = enrollmentsList.find(
      enr => enr.studentLoginId.toLowerCase() === raw ||
             (enr.studentEmail && enr.studentEmail.toLowerCase() === raw)
    );
    const matchedStudent = studentsList.find(
      s => s.admissionNumber.toLowerCase() === raw ||
           s.rollNumber.toLowerCase() === raw ||
           s.email.toLowerCase() === raw ||
           (s.credentials?.loginId && s.credentials.loginId.toLowerCase() === raw) ||
           (matchedEnrollment && s.id === matchedEnrollment.studentId)
    );

    if (matchedStudent || matchedEnrollment) {
      const validStudent = matchedStudent || studentsList.find(s => s.id === matchedEnrollment?.studentId);
      const studentPassword = validStudent?.credentials?.temporaryPassword || matchedEnrollment?.generatedPassword || 'password123';
      
      if (password !== 'password123' && password !== studentPassword) {
        return { success: false, error: 'Invalid password for student account.' };
      }
      if (validStudent && (validStudent.status === 'SUSPENDED' || validStudent.provisioningStatus === 'SUSPENDED')) {
        return { success: false, error: 'Your student account has been suspended. Please contact your school administrator.' };
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

    // 5. Check in Staff Directory by Employee ID or Email
    const matchedStaff = staffList.find(
      stf => stf.employeeId.toLowerCase() === raw || stf.email.toLowerCase() === raw
    );
    if (matchedStaff) {
      if (password !== 'password123') {
        return { success: false, error: 'Invalid password for staff account.' };
      }
      if (matchedStaff.status === 'RESIGNED') {
        return { success: false, error: 'This staff account is currently inactive or resigned.' };
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
    code?: 'OAUTH_CONFIG_MISSING' | 'ACCOUNT_NOT_LINKED' | 'USER_SUSPENDED' | 'AUTH_FAILED';
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
      if (!matchedSchoolByEmail.isActive || matchedSchoolByEmail.onboardingStatus === 'SUSPENDED') {
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
    const targetSchool = schools.find(s => s.id === (targetSchoolId || matched.schoolId || 'school-1')) || schools[0];

    const { password: _, ...profile } = matched;
    const finalProfile: UserProfile = {
      ...profile,
      role: targetRole,
      schoolId: targetRole === 'SUPER_ADMIN' ? undefined : targetSchool.id,
    };

    setCurrentUser(finalProfile);
    setRoleState(targetRole);
    setIsAuthenticated(true);
    setActiveSchoolState(targetSchool);

    try {
      localStorage.setItem('school_os_user', JSON.stringify(finalProfile));
      localStorage.setItem('school_os_school_id', targetSchool.id);
    } catch {}
  };

  // Logout handler
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('school_os_user');
      localStorage.removeItem('school_os_school_id');
    } catch {}
  };

  // Sync active student with active school
  useEffect(() => {
    const schoolStudents = studentsList.filter(s => s.schoolId === activeSchool.id);
    if (schoolStudents.length > 0) {
      setActiveStudent(schoolStudents[0]);
    } else {
      setActiveStudent(null);
    }
  }, [activeSchool, studentsList]);

  // Tenant-Scoped Data Computations (Enforcing PostgreSQL RLS paradigm)
  const scopedStudents = role === 'SUPER_ADMIN'
    ? studentsList
    : studentsList.filter(s => s.schoolId === activeSchool.id);

  const scopedInvoices = role === 'SUPER_ADMIN'
    ? invoicesList
    : invoicesList.filter(inv => inv.schoolId === activeSchool.id);

  const scopedStaff = role === 'SUPER_ADMIN'
    ? staffList
    : staffList.filter(stf => stf.schoolId === activeSchool.id);

  const scopedPayroll = role === 'SUPER_ADMIN'
    ? payrollList
    : payrollList.filter(p => p.schoolId === activeSchool.id);

  const scopedTimetable = role === 'SUPER_ADMIN'
    ? timetableList
    : timetableList.filter(t => t.schoolId === activeSchool.id);

  const scopedFinancials = financialsMap[activeSchool.id] || {
    schoolId: activeSchool.id,
    totalBilled: 3000000,
    totalCollected: 2700000,
    totalOverdue: 300000,
    upiPercentage: 65,
    netBankingPercentage: 25,
    cashPercentage: 10,
  };

  const scopedAdmissions = initialSchoolAdmissions[activeSchool.id] || {
    schoolId: activeSchool.id,
    enquiries: 30,
    verification: 10,
    approved: 5,
    activeEnrolled: activeSchool.totalStudents,
  };

  const scopedAttendance = initialSchoolAttendance[activeSchool.id] || {
    schoolId: activeSchool.id,
    studentPercentage: 96.0,
    staffPercentage: 97.0,
    studentsPresent: Math.round(activeSchool.totalStudents * 0.96),
    studentsExcused: 10,
    staffPresent: Math.round(activeSchool.totalStaff * 0.97),
    staffOnLeave: 2,
    lateArrivalsCount: 5,
  };

  const scopedStemTelemetry = initialSchoolStemTelemetry[activeSchool.id] || {
    schoolId: activeSchool.id,
    activeCoders: Math.round(activeSchool.totalStudents * 0.3),
    virtualRovers: 20,
    aiHintsDelivered: 250,
    topCadetName: 'Student Cadet',
    topCadetClass: 'Grade 6',
    topCadetStreak: 10,
    topCadetXp: 1200,
    topCadetMission: 'Mission 1: Foundations',
  };

  const scopedFacilities = initialFacilityOccupancies.filter(f => f.schoolId === activeSchool.id);
  const scopedActivities = activitiesList.filter(a => a.schoolId === activeSchool.id);

  const scopedEnrollments = role === 'SUPER_ADMIN'
    ? enrollmentsList
    : enrollmentsList.filter(e => e.schoolId === activeSchool.id);

  const scopedBatches = role === 'SUPER_ADMIN'
    ? batchesList
    : batchesList.filter(b => b.schoolId === activeSchool.id);

  const scopedExams = role === 'SUPER_ADMIN'
    ? examsList
    : examsList.filter(e => e.schoolId === activeSchool.id);

  const scopedExamMarks = role === 'SUPER_ADMIN'
    ? examMarksList
    : examMarksList.filter(m => m.schoolId === activeSchool.id);

  // Super Admin Course Mutators & Dynamic Pricing
  const addCourse = (newCourseData: Omit<Course, 'id'>): Course => {
    const course: Course = {
      ...newCourseData,
      id: `course-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [course, ...coursesList];
    setCoursesList(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('school_os_courses', JSON.stringify(updated));
      } catch {}
    }
    return course;
  };

  const updateCoursePrice = (courseId: string, price: number) => {
    setCoursesList(prev => {
      const updated = prev.map(c => c.id === courseId ? { ...c, pricePerStudent: price } : c);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_os_courses', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setCoursesList(prev => {
      const updated = prev.map(c => c.id === courseId ? { ...c, ...updates } : c);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('school_os_courses', JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  // 1-Click Bulk Enrollment & Automated Credentials Generator
  const bulkEnrollStudents = (courseId: string, gradeName: string, selectedStudentIds?: string[]) => {
    const targetCourse = coursesList.find(c => c.id === courseId);
    if (!targetCourse) throw new Error('Course not found');

    let eligibleStudents = scopedStudents;
    if (selectedStudentIds && selectedStudentIds.length > 0) {
      eligibleStudents = scopedStudents.filter(s => selectedStudentIds.includes(s.id));
    } else if (gradeName !== 'ALL') {
      eligibleStudents = scopedStudents.filter(s => s.gradeName === gradeName || s.gradeName.includes(gradeName));
    }

    const newEnrollments: StudentEnrollment[] = [];
    const credentialsList: Array<{
      studentName: string;
      admissionNumber: string;
      loginId: string;
      password: string;
      gradeName: string;
    }> = [];

    eligibleStudents.forEach(student => {
      const already = enrollmentsList.find(e => e.studentId === student.id && e.courseId === courseId);
      if (already) return;

      const randomPin = Math.floor(1000 + Math.random() * 9000);
      const cleanFirstName = student.firstName.replace(/[^a-zA-Z]/g, '') || 'Cadet';
      const studentLoginId = `STU-${student.admissionNumber || student.rollNumber || student.id.slice(-4).toUpperCase()}`;
      const generatedPassword = `Learn#${randomPin}@${cleanFirstName}`;

      const enrollment: StudentEnrollment = {
        id: `enr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        studentEmail: student.email || `${studentLoginId.toLowerCase()}@${activeSchool.code.toLowerCase()}.edu.in`,
        studentLoginId,
        generatedPassword,
        admissionNumber: student.admissionNumber || student.rollNumber || 'STU-001',
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
        currentModule: 'Module 1: Orientation & Setup'
      };

      newEnrollments.push(enrollment);
      credentialsList.push({
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        admissionNumber: student.admissionNumber || student.rollNumber || 'STU-001',
        loginId: studentLoginId,
        password: generatedPassword,
        gradeName: student.gradeName
      });
    });

    const enrolledCount = newEnrollments.length;
    const totalBilling = enrolledCount * (targetCourse.pricePerStudent || 999);

    const batch: BulkEnrollmentBatch = {
      id: `batch-${Date.now()}`,
      schoolId: activeSchool.id,
      schoolName: activeSchool.name,
      courseId: targetCourse.id,
      courseTitle: targetCourse.title,
      targetGrade: gradeName,
      totalEnrolled: enrolledCount,
      pricePerStudent: targetCourse.pricePerStudent || 999,
      totalBilling,
      enrolledAt: new Date().toISOString(),
      enrolledBy: `${currentUser?.firstName || 'Principal'} ${currentUser?.lastName || ''}`.trim(),
      studentCredentials: credentialsList
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

  // Student Mutators
  const addStudent = (newStudentData: Omit<Student, 'id' | 'createdAt' | 'currentXp' | 'currentLevel' | 'currentStreak'>): Student => {
    const studentId = `stud-${Date.now()}`;
    const cityCode = (activeSchool.city || 'DEL').slice(0, 3).toUpperCase();
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
            schoolName: activeSchool.name,
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

    // Create admission audit event
    recordAuditEvent(
      'New Student Enrolled & Account Provisioned',
      `${newStudent.firstName} ${newStudent.lastName} enrolled into ${newStudent.gradeName} (${newStudent.sectionName}). Cadet Login: ${loginId} created.`,
      'ADMISSION',
      activeSchool.id
    );

    return newStudent;
  };

  const updateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudentsList(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const markAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    let studentName = '';
    setStudentsList(prev => prev.map(s => {
      if (s.id === studentId) {
        studentName = `${s.firstName} ${s.lastName}`;
        // Adjust attendance percentage slightly based on status
        let newPct = s.attendancePercentage;
        if (status === 'ABSENT' && s.todayAttendance !== 'ABSENT') {
          newPct = Math.max(50, Math.round((s.attendancePercentage - 1.2) * 10) / 10);
        } else if (status === 'PRESENT' && s.todayAttendance === 'ABSENT') {
          newPct = Math.min(100, Math.round((s.attendancePercentage + 1.2) * 10) / 10);
        }
        return {
          ...s,
          todayAttendance: status,
          attendancePercentage: newPct,
        };
      }
      return s;
    }));

    // Record Audit Log for Principal/Teacher oversight
    const auditEvt: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: activeSchool.id,
      title: 'Daily Attendance Punch',
      detail: `${studentName} attendance updated to ${status} for today`,
      time: 'Just now',
      category: 'TEACHER',
    };
    setActivitiesList(prev => [auditEvt, ...prev]);
  };

  // Fee Collection Mutators
  const payInvoice = (invoiceId: string, amount: number, paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE') => {
    const receiptNumber = `REC-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    let targetStudentName = '';

    setInvoicesList(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        targetStudentName = inv.studentName;
        const newPaid = inv.paidAmount + amount;
        const newStatus = newPaid >= (inv.totalAmount - inv.discountAmount) ? 'PAID' : 'PARTIAL';
        return {
          ...inv,
          paidAmount: newPaid,
          status: newStatus,
        };
      }
      return inv;
    }));

    // Update School Financials
    setFinancialsMap(prev => {
      const current = prev[activeSchool.id] || scopedFinancials;
      return {
        ...prev,
        [activeSchool.id]: {
          ...current,
          totalCollected: current.totalCollected + amount,
          totalOverdue: Math.max(0, current.totalOverdue - amount),
        }
      };
    });

    // Add Audit Log
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: activeSchool.id,
      title: `Fee Payment Received (${paymentMode})`,
      detail: `₹${amount.toLocaleString('en-IN')} collected for ${targetStudentName} [Receipt: ${receiptNumber}]`,
      time: 'Just now',
      category: 'FEE',
    };
    setActivitiesList(prev => [newEvent, ...prev]);

    return { success: true, receiptNumber };
  };

  const createInvoice = (inv: Omit<FeeInvoice, 'id' | 'invoiceNumber'>) => {
    const newInvoice: FeeInvoice = {
      ...inv,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2025-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setInvoicesList(prev => [newInvoice, ...prev]);

    setFinancialsMap(prev => {
      const current = prev[activeSchool.id] || scopedFinancials;
      return {
        ...prev,
        [activeSchool.id]: {
          ...current,
          totalBilled: current.totalBilled + newInvoice.totalAmount,
          totalOverdue: current.totalOverdue + (newInvoice.totalAmount - newInvoice.discountAmount - newInvoice.paidAmount),
        }
      };
    });
  };

  // Staff & Deterministic Payroll Mutators
  const addStaff = (member: Omit<StaffMember, 'id'>) => {
    const newStaff: StaffMember = {
      ...member,
      id: `stf-${Date.now()}`,
    };
    setStaffList(prev => [newStaff, ...prev]);
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

    setPayrollList(prev => [...newRecords, ...prev.filter(p => !(p.schoolId === activeSchool.id && p.month === month))]);

    // Audit Event
    const newEvent: AuditEvent = {
      id: `evt-${Date.now()}`,
      schoolId: activeSchool.id,
      title: `Monthly Payroll Executed (${month})`,
      detail: `₹${totalDisbursed.toLocaleString('en-IN')} disbursed deterministically across ${schoolStaff.length} faculty/staff members.`,
      time: 'Just now',
      category: 'AUTH',
    };
    setActivitiesList(prev => [newEvent, ...prev]);

    return { generatedCount: schoolStaff.length, totalDisbursed };
  };

  const markPayrollPaid = (recordId: string) => {
    setPayrollList(prev => prev.map(p => p.id === recordId ? { ...p, paymentStatus: 'PAID' } : p));
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

    setTimetableList(prev => [...prev, newSlot]);
    return { success: true };
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetableList(prev => prev.filter(t => t.id !== slotId));
  };

  const updateSchoolBranding = (brandingData: Partial<School>) => {
    const updated = {
      ...activeSchool,
      ...brandingData,
    };
    setActiveSchoolState(updated);
    setSchools(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`school_brand_${updated.id}`, JSON.stringify(brandingData));
    }
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
        provisionStudentAccount,
        resetStudentCredentials,
        updateStudentStatus,
        markAttendance,
        payInvoice,
        createInvoice,
        addStaff,
        runPayrollForMonth,
        markPayrollPaid,
        addTimetableSlot,
        deleteTimetableSlot,
        createSchool,
        updateSchool,
        setSchoolStatus,
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
        recordAuditEvent,
        updateSchoolBranding,
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

