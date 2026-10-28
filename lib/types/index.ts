export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'SCHOOL_ADMIN' 
  | 'TEACHER' 
  | 'INNOVATMIND_TRAINER' 
  | 'STUDENT' 
  | 'PARENT';

export type StudentStatus = 
  | 'ENQUIRY' 
  | 'APPLIED' 
  | 'VERIFIED' 
  | 'APPROVED' 
  | 'ACTIVE' 
  | 'SUSPENDED' 
  | 'TRANSFERRED' 
  | 'ALUMNI';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export type SchoolType = 'CBSE' | 'ICSE' | 'STATE' | 'IB' | 'CAMBRIDGE';

export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export type SchoolOnboardingStage = 
  | 'ENQUIRY' 
  | 'IN_DISCUSSION' 
  | 'DEMO_SCHEDULED' 
  | 'CONTRACT_STAGE' 
  | 'ONBOARDING' 
  | 'ACTIVE' 
  | 'SUSPENDED';

export interface School {
  id: string;
  code: string;
  name: string;
  schoolType: SchoolType;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  region?: string;
  logoUrl?: string;
  slogan?: string;
  brandThemeColor?: string;
  boardAffiliation?: string;
  logoCrest?: string;
  websiteUrl?: string;
  principalName?: string;
  establishedYear?: number | string;
  isActive: boolean;
  totalStudents: number;
  totalStaff: number;
  enrolledCoursesCount: number;
  createdAt: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  onboardingStatus?: SchoolOnboardingStage;
  academicSession?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  adminCredentials?: {
    loginId: string;
    email: string;
    temporaryPassword?: string;
    generatedAt: string;
    provisionedBy: string;
  };
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'INACTIVE';
export type ProvisioningStatus = 'PENDING' | 'PROVISIONING' | 'ACTIVE' | 'FAILED' | 'SUSPENDED';

export interface StudentCredentials {
  loginId: string;
  temporaryPassword?: string;
  provisionedAt: string;
  status: ProvisioningStatus;
  lastLoginAt?: string;
  reissuedAt?: string;
}

export interface UserProfile {
  id: string;
  auth_user_id?: string;
  schoolId?: string;
  schoolName?: string;
  studentId?: string; // Authoritative link to Student entity
  role: UserRole;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  designation?: string;
  isActive: boolean;
  status?: AccountStatus;
  admissionNumber?: string;
  gradeName?: string;
  sectionName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicSession {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Grade {
  id: string;
  schoolId: string;
  name: string;
  numericLevel: number;
}

export interface Section {
  id: string;
  schoolId: string;
  gradeId: string;
  name: string;
  classTeacherId?: string;
}

export interface Student {
  id: string;
  schoolId: string;
  profileId: string;
  admissionNumber: string;
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeId: string;
  gradeName: string;
  sectionId: string;
  sectionName: string;
  sessionId: string;
  dob: string;
  gender: GenderType;
  bloodGroup?: string;
  address: string;
  photoUrl?: string;
  todayAttendance?: 'PRESENT' | 'ABSENT' | 'LATE';
  status: StudentStatus;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  currentXp: number;
  currentLevel: number;
  currentStreak: number;
  attendancePercentage: number;
  feeStatus: PaymentStatus;
  provisioningStatus?: ProvisioningStatus;
  credentials?: StudentCredentials;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'Coding' | 'Robotics' | 'AI' | 'IoT' | 'Digital Literacy' | 'STEM Foundations';
  minGrade: number;
  maxGrade: number;
  thumbnailUrl: string;
  isPublished: boolean;
  totalModules: number;
  totalLessons: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  pricePerStudent: number; // Set & registered by Super Admin
  prerequisites?: string;
  learningOutcomes?: string[];
  createdAt?: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentLoginId: string;
  generatedPassword: string;
  admissionNumber: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  gradeName: string;
  sectionName: string;
  enrolledAt: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  lastActiveAt: string;
  quizScoreAverage: number;
  status: 'ACTIVE' | 'COMPLETED' | 'IN_PROGRESS';
  currentModule: string;
}

export interface BulkEnrollmentBatch {
  id: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  targetGrade: string;
  totalEnrolled: number;
  pricePerStudent: number;
  totalBilling: number;
  enrolledAt: string;
  enrolledBy: string;
  studentCredentials: Array<{
    studentName: string;
    admissionNumber: string;
    loginId: string;
    password: string;
    gradeName: string;
  }>;
}

export interface FeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  invoiceNumber: string;
  category: string;
  totalAmount: number;
  discountAmount: number;
  paidAmount: number;
  dueDate: string;
  status: PaymentStatus;
}

export interface StaffMember {
  id: string;
  schoolId: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  basicSalary: number;
  allowances: number;
  attendanceRate: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
}

export interface PayrollRecord {
  id: string;
  schoolId: string;
  staffId: string;
  staffName: string;
  month: string;
  basicSalary: number;
  allowances: number;
  incentives: number;
  overtime: number;
  leaveDeduction: number;
  advance: number;
  otherDeduction: number;
  netSalary: number;
  paymentStatus: 'PAID' | 'PENDING' | 'PROCESSING';
  generatedAt: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number;
  timeSlot: string;
  grade: string;
  section: string;
  subject: string;
  teacher: string;
  room: string;
}

// Multi-Tenant School-Specific Telemetry Types
export interface SchoolFinancials {
  schoolId: string;
  totalBilled: number;
  totalCollected: number;
  totalOverdue: number;
  upiPercentage: number;
  netBankingPercentage: number;
  cashPercentage: number;
}

export interface SchoolAdmissions {
  schoolId: string;
  enquiries: number;
  verification: number;
  approved: number;
  activeEnrolled: number;
}

export interface SchoolAttendance {
  schoolId: string;
  studentPercentage: number;
  staffPercentage: number;
  studentsPresent: number;
  studentsExcused: number;
  staffPresent: number;
  staffOnLeave: number;
  lateArrivalsCount: number;
}

export interface SchoolStemTelemetry {
  schoolId: string;
  activeCoders: number;
  virtualRovers: number;
  aiHintsDelivered: number;
  topCadetName: string;
  topCadetClass: string;
  topCadetStreak: number;
  topCadetXp: number;
  topCadetMission: string;
}

export interface FacilityOccupancy {
  id: string;
  schoolId: string;
  lab: string;
  class: string;
  teacher: string;
  topic: string;
  status: 'Occupied' | 'Available';
}

export interface AuditEvent {
  id: string;
  schoolId: string;
  title: string;
  detail: string;
  time: string;
  category: 'FEE' | 'STEM' | 'ADMISSION' | 'FACILITY' | 'AUTH' | 'TEACHER';
}

// Exam Cell & Assessment Types
export type AssessmentType = 
  | 'PERIODIC_TEST' 
  | 'MID_TERM' 
  | 'UNIT_TEST' 
  | 'FINAL_EXAM' 
  | 'PRACTICAL';

export type ExamStatus = 
  | 'SCHEDULED' 
  | 'ONGOING' 
  | 'EVALUATING' 
  | 'MARKS_SUBMITTED' 
  | 'DECLARED';

export interface Exam {
  id: string;
  schoolId: string;
  title: string;
  code: string;
  type: AssessmentType;
  academicSession: string;
  targetGrades: string[];
  startDate: string;
  endDate: string;
  status: ExamStatus;
  resultDeclaredDate?: string;
  isResultPublished: boolean;
  totalStudentsCount?: number;
  evaluatedStudentsCount?: number;
  averagePercentage?: number;
}

export interface StudentExamMark {
  id: string;
  examId: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  gradeName: string;
  sectionName: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  passMarks: number;
  grade: string; // A1, A2, B1, B2, C1, C2, D, E
  isAbsent?: boolean;
  remarks?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface StudentReportCard {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  rollNumber: string;
  gradeName: string;
  sectionName: string;
  examTitle: string;
  examCode: string;
  academicSession: string;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  resultStatus: 'PASSED' | 'FAILED' | 'PROMOTED';
  classRank?: number;
  attendancePercentage?: number;
  subjectBreakdown: {
    subject: string;
    marksObtained: number;
    maxMarks: number;
    passMarks: number;
    grade: string;
    status: 'PASSED' | 'FAILED' | 'ABSENT';
  }[];
  generalRemarks: string;
}

// ==========================================
// Super Admin -> Central Course Pricing Models
// Precedence: Default Price -> Region -> State -> City -> School Type -> Grade -> Course -> School-Specific Override
// ==========================================
export type BillingBasis = 'PER_STUDENT' | 'PER_BATCH' | 'PER_TERM' | 'ANNUAL_FLAT';

export type PricingRuleScope = 
  | 'GLOBAL_DEFAULT' 
  | 'REGION' 
  | 'STATE' 
  | 'CITY' 
  | 'SCHOOL_TYPE' 
  | 'GRADE' 
  | 'COURSE';

export interface PricingRule {
  id: string;
  courseId: string;
  courseTitle: string;
  scope: PricingRuleScope;
  scopeValue?: string; // e.g., 'Maharashtra', 'CBSE', 'Class 8', 'North Region'
  academicSession: string;
  gradeRange?: string; // e.g., 'Class 6 - 8'
  price: number;
  currency: 'INR' | 'USD';
  billingBasis: BillingBasis;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  discountPercent?: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface SchoolPricingOverride {
  id: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  academicSession: string;
  customPrice: number;
  currency: 'INR' | 'USD';
  billingBasis: BillingBasis;
  effectiveStartDate: string;
  effectiveEndDate?: string;
  reason: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdBy: string;
  updatedAt: string;
}

// ==========================================
// Super Admin -> Course Assignment to School
// ==========================================
export type AssignmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'UPCOMING';

export interface SchoolCourseAssignment {
  id: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  academicSession: string;
  eligibleGrades: string[];
  eligibleSections?: string[];
  startDate: string;
  endDate: string;
  capacity: number;
  pricingRuleId?: string;
  appliedPricePerUnit: number;
  billingBasis: BillingBasis;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  status: AssignmentStatus;
  enrolledStudentsCount: number;
  createdAt: string;
  notes?: string;
}

// ==========================================
// Super Admin -> InnovatMind Trainer Models
// ==========================================
export type TrainerSpecialization = 
  | 'Robotics' 
  | 'AI & ML' 
  | 'Coding' 
  | 'STEM & Projects' 
  | 'Computer Basics' 
  | 'IoT & Electronics';

export type TrainerStatus = 'ACTIVE' | 'ON_LEAVE' | 'ASSIGNED' | 'INACTIVE';

export interface TrainerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  specialization: TrainerSpecialization;
  experienceYears: number;
  status: TrainerStatus;
  assignedSchoolIds: string[];
  assignedSchoolsCount: number;
  maxWorkloadHours: number;
  currentWorkloadHours: number;
  totalStudentsMentored: number;
  rating: number;
  joinDate: string;
}

export interface TrainerAllocation {
  id: string;
  trainerId: string;
  trainerName: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  assignedGrades: string[];
  academicSession: string;
  startDate: string;
  endDate: string;
  workloadHoursPerWeek: number;
  allocatedDays: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
  timeSlot?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

