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
  | 'PENDING_APPROVAL'
  | 'UNDER_REVIEW'
  | 'ACTIVE' 
  | 'SUSPENDED'
  | 'REJECTED';

export interface School {
  id: string;
  registrationId?: string; // Stable unique identifier e.g. IMS-2026-000101
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
  tagline?: string;
  portalTitle?: string;
  subdomain?: string;
  customDomain?: string;
  brandThemeColor?: string;
  brandAccentColor?: string;
  boardAffiliation?: string;
  logoCrest?: string;
  faviconUrl?: string;
  signatureUrl?: string;
  websiteUrl?: string;
  principalName?: string;
  establishedYear?: number | string;
  isActive: boolean;
  isDemo?: boolean;
  totalStudents: number;
  totalStaff: number;
  enrolledCoursesCount: number;
  createdAt: string;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  onboardingStatus?: SchoolOnboardingStage;
  approvalDetails?: {
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    decisionNotes?: string;
  };
  suspensionDetails?: {
    isSuspended: boolean;
    reason?: string;
    suspendedAt?: string;
    suspendedBy?: string;
  };
  academicSession?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  notes?: string;
  enabledModules?: SchoolModulesConfig;
  adminCredentials?: {
    loginId: string;
    email: string;
    temporaryPassword?: string;
    generatedAt: string;
    provisionedBy: string;
  };
  welcomeKitDispatchedAt?: string;
  welcomeKitDispatchedBy?: string;
}

export interface SchoolModulesConfig {
  admission?: boolean;
  students?: boolean;
  parents?: boolean;
  staff?: boolean;
  attendance?: boolean;
  fees?: boolean;
  academics?: boolean;
  timetable?: boolean;
  exams?: boolean;
  courses?: boolean;
  notices?: boolean;
  transport?: boolean;
  resources?: boolean;
  utilities?: boolean;
}

export type NoticePriority = 'URGENT' | 'HOLIDAY' | 'ACADEMIC' | 'GENERAL' | 'FEES';
export type NoticeTargetAudience = 'ALL' | 'STUDENTS' | 'PARENTS' | 'STAFF';

export interface NoticeBroadcast {
  id: string;
  schoolId: string;
  title: string;
  messageContent: string;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  channels: ('PORTAL' | 'WHATSAPP' | 'SMS' | 'PUSH' | 'EMAIL')[];
  isEmergencyBanner?: boolean;
  sentAt: string;
  expiresAt?: string;
  authorName?: string;
  deliveredCount: number;
  totalRecipients: number;
  openRate: number;
  readByUsers?: string[];
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
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
  credentialsIssued?: boolean;
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

export type AuthProviderType = 'SUPABASE' | 'COGNITO' | 'DEMO';
export type AuthProvider = AuthProviderType;

export type LessonType = 'VIDEO' | 'DOCUMENT' | 'PDF' | 'ACTIVITY' | 'QUIZ';

export interface CourseActivity {
  id: string;
  lessonId: string;
  title: string;
  instructions: string;
  activityType: 'PROJECT' | 'LAB_EXERCISE' | 'SIMULATION' | 'CODING_CHALLENGE';
  maxScore: number;
}

export interface CourseAssessment {
  id: string;
  lessonId: string;
  title: string;
  questionsCount: number;
  passingScorePercent: number;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  durationMinutes: number;
  lessonType: LessonType;
  resourceUrl?: string;
  contentMarkdown?: string;
  completionCriteria?: string;
  isPublished: boolean;
  activities?: CourseActivity[];
  assessments?: CourseAssessment[];
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  order: number;
  description?: string;
  isPublished: boolean;
  lessons: CourseLesson[];
}

export type VideoProviderType = 'GOOGLE_DRIVE' | 'CLOUDFLARE_STREAM' | 'CUSTOM_CDN' | 'EMBED';
export type SchedulePolicy = 'DAILY' | 'WEEKLY' | 'CUSTOM';
export type UnlockPolicy = 'SCHEDULE_BASED' | 'SEQUENTIAL' | 'HYBRID_SCHEDULE_AND_COMPLETION';
export type GameType = 'HARDWARE_MATCH' | 'CODING_SEQUENCE' | 'MEMORY_CARDS' | 'BUG_HUNTER' | 'LOGIC_CIRCUIT' | 'INTERACTIVE_SIMULATION';
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'MATCH' | 'CODE_OUTPUT' | 'ORDERING';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  pairs?: Array<{ left: string; right: string }>;
  correctAnswer: string | number | string[];
  explanation: string;
  codeSnippet?: string;
  hint?: string;
}

export interface LectureQuiz {
  id: string;
  title: string;
  description?: string;
  passingPercentage: number; // e.g. 70%
  timeLimitSeconds?: number;
  questionsCount: number;
  isMandatory: boolean;
  questions: QuizQuestion[];
}

export interface LectureGame {
  id: string;
  type: GameType;
  title: string;
  instructions: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  config: Record<string, any>;
  xpBonus: number;
}

export interface LectureBadgeReward {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface CurriculumLecture {
  id: string;
  lectureNumber: number; // 1 to 30
  title: string;
  shortDescription: string;
  learningObjectives: string[];
  moduleName: string;
  topic: string;
  gradeLevel?: number | string;
  estimatedDurationMinutes: number;
  videoProvider: VideoProviderType;
  videoRef: string; // Google Drive File ID, embed link, or stream URL
  videoMetadata?: {
    fileName?: string;
    durationSeconds?: number;
    resolution?: string;
    thumbnailUrl?: string;
    driveWebViewLink?: string;
  };
  videoCompletionThresholdPercent: number; // default 80
  quiz?: LectureQuiz;
  game?: LectureGame;
  releaseSchedule: {
    type: SchedulePolicy;
    dayOffset?: number; // 1 to 30 days from course start
    customDate?: string;
    customTime?: string; // e.g. "09:00"
  };
  unlockPolicy: UnlockPolicy;
  status: 'DRAFT' | 'READY';
  xpReward: number; // default 50
  badgeReward?: LectureBadgeReward;
}

export interface CourseDriveConfig {
  folderId?: string;
  folderName?: string;
  connectedAt?: string;
  accountEmail?: string;
  mappedVideosCount?: number;
  mappedVideos?: Array<{
    lectureNumber: number;
    driveFileId: string;
    fileName: string;
    embedUrl: string;
  }>;
}

export interface StudentLectureJourneyState {
  lectureId: string;
  lectureNumber: number;
  isUnlocked: boolean;
  unlockReason?: string;
  scheduledUnlockAt?: string;
  videoWatchedSeconds: number;
  videoWatchPercentage: number;
  videoCompleted: boolean;
  quizUnlocked: boolean;
  quizCompleted: boolean;
  quizScore?: number;
  quizAttempts: number;
  gameUnlocked: boolean;
  gameCompleted: boolean;
  gameScore?: number;
  xpAwarded: boolean;
  journeyCompleted: boolean;
  completedAt?: string;
}

export interface Course {
  id: string;
  code?: string;
  title: string;
  slug: string;
  description: string;
  category: 'Coding' | 'Robotics' | 'AI' | 'IoT' | 'Digital Literacy' | 'STEM Foundations';
  subject?: string;
  language?: string;
  minGrade: number;
  maxGrade: number;
  targetGrades?: string[];
  thumbnailUrl: string;
  isPublished: boolean;
  isArchived?: boolean;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  version?: string; // e.g. "v1.0"
  totalModules: number;
  totalLessons: number;
  estimatedDurationHours?: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  pricePerStudent: number; // Set & registered by Super Admin (0 indicates free course when isFreeCourse is true)
  isFreeCourse?: boolean;
  prerequisites?: string;
  learningOutcomes?: string[];
  unlockPolicy?: UnlockPolicy;
  defaultScheduleType?: SchedulePolicy;
  modules?: CourseModule[];
  curriculumLectures?: CurriculumLecture[]; // Grade-wise 30-Lecture sequence
  driveConfig?: CourseDriveConfig;
  creatorName?: string;
  creatorRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EnrollmentPriceSnapshot {
  unitPrice: number;
  discountPercent: number;
  finalPricePerStudent: number;
  billingBasis: BillingBasis | string;
  currency: 'INR' | 'USD' | string;
  resolvedRuleId?: string;
  isFreeCourse?: boolean;
  snapshotAt: string;
}

export interface BulkEnrollmentStudentRecord {
  studentName: string;
  studentId: string;
  admissionNumber: string;
  className: string;
  sectionName?: string;
  accountStatus: 'ACTIVE' | 'ACTIVATION_PENDING' | 'FAILED' | 'PROVISIONED';
  result: 'SUCCESS' | 'FAILED';
  reason?: string;
  activationToken?: string;
  activationUrl?: string;
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentLoginId: string;
  generatedPassword?: string;
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
  accountStatus?: AccountStatus;
  activationStatus?: 'ACTIVE' | 'PENDING_ACTIVATION' | 'FAILED';
  priceSnapshot?: EnrollmentPriceSnapshot;
  activeLectureNumber?: number; // 1 to 30
  currentLectureId?: string;
  journeyStates?: Record<number, StudentLectureJourneyState>;
}

export interface BulkEnrollmentBatch {
  id: string;
  schoolId: string;
  schoolName: string;
  courseId: string;
  courseTitle: string;
  targetGrade: string;
  totalEnrolled: number;
  failedCount?: number;
  pricePerStudent: number;
  totalBilling: number;
  priceSnapshot?: EnrollmentPriceSnapshot;
  enrolledAt: string;
  enrolledBy: string;
  studentCredentials: Array<{
    studentName: string;
    admissionNumber: string;
    loginId: string;
    password?: string;
    gradeName: string;
    accountStatus?: string;
  }>;
  enrolledStudentsResults?: BulkEnrollmentStudentRecord[];
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
  createdAt?: string;
  lastReminderSentAt?: string;
  lastReminderChannel?: 'WHATSAPP' | 'SMS' | 'EMAIL';
  waiverReason?: string;
  waiverApprovedBy?: string;
  paymentHistory?: Array<{
    receiptNumber: string;
    amount: number;
    paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE';
    transactionRef?: string;
    paidAt: string;
  }>;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  markedAt: string;
  markedBy?: string;
}

export interface PaymentReceipt {
  receiptNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  schoolId: string;
  schoolName: string;
  studentId: string;
  studentName: string;
  admissionNumber?: string;
  gradeName?: string;
  sectionName?: string;
  category: string;
  amountPaid: number;
  paymentMode: 'UPI' | 'NET_BANKING' | 'CASH' | 'CHEQUE';
  transactionRef?: string;
  bankName?: string;
  chequeNumber?: string;
  notes?: string;
  waiverReason?: string;
  totalAmount: number;
  discountAmount: number;
  previousPaidAmount: number;
  remainingBalance: number;
  status: PaymentStatus;
  paidAt: string;
  authorizedSignatory: string;
}

export interface InstitutionalFeeStructure {
  id: string;
  schoolId: string;
  gradeName: string;
  academicSession: string;
  tuitionFee: number;
  stemLabFee: number;
  examLibraryFee: number;
  annualCharges: number;
  totalAnnualFee: number;
}

export interface TeacherPermissionConfig {
  markAttendance?: boolean;
  canTakeAttendance?: boolean;
  enterExamMarks?: boolean;
  canGradeExams?: boolean;
  lecturePlanning?: boolean;
  canManageCurriculum?: boolean;
  manageAssignments?: boolean;
  canManageAssignments?: boolean;
  approveLeaves?: boolean;
  canApproveLeaves?: boolean;
}

export interface TeacherTask {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  title: string;
  description?: string;
  assignedGrade?: string;
  assignedSubject?: string;
  subject?: string;
  dueDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  assignedAt: string;
  assignedBy?: string;
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
  assignedGrades?: string[];
  assignedSubjects?: string[];
  permissions?: TeacherPermissionConfig;
  credentials?: {
    loginId: string;
    temporaryPassword?: string;
    generatedAt: string;
  };
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
  isRevokable?: boolean;
  targetEntityId?: string;
  targetEntityType?: 'SCHOOL' | 'TRAINER';
  deletedSnapshot?: any;
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

