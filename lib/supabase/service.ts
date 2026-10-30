import { supabase } from './client';
import { School, Student, UserProfile, Course, FeeInvoice, AttendanceRecord, PaymentReceipt } from '../types';
import { initialWorkingRealSchool, isDemoSchool } from '../db/mock-data';

const PROD_STORAGE_SCHOOLS = 'school_os_prod_schools';
const PROD_STORAGE_STUDENTS = 'school_os_prod_students';
const PROD_STORAGE_STAFF = 'school_os_prod_staff';
const PROD_STORAGE_INVOICES = 'school_os_prod_invoices';
const PROD_STORAGE_ASSIGNMENTS = 'school_os_prod_assignments';
const PROD_STORAGE_ATTENDANCE = 'school_os_prod_attendance';
const PROD_STORAGE_RECEIPTS = 'school_os_prod_receipts';

/**
 * Generates a stable, readable, unique Registration ID e.g. IMS-2026-000123
 */
export function generateUniqueRegistrationId(existingSchools: { registrationId?: string }[] = []): string {
  const year = new Date().getFullYear();
  const existingIds = new Set(
    existingSchools
      .map(s => s.registrationId)
      .filter((id): id is string => Boolean(id))
  );

  let counter = 101 + existingSchools.length;
  let candidate = `IMS-${year}-${String(counter).padStart(6, '0')}`;

  while (existingIds.has(candidate)) {
    counter += 1;
    candidate = `IMS-${year}-${String(counter).padStart(6, '0')}`;
  }

  return candidate;
}

/**
 * Helper to retrieve stored production items
 */
function getLocalProdStore<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) || typeof parsed === 'object' ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Helper to save production items
 */
function setLocalProdStore<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[ProdService] Failed to persist ${key} to local storage`, err);
  }
}

/**
 * Service to manage production data paths with Supabase integration
 */
export const productionService = {
  /**
   * Fetches all registered real schools from Supabase / production store
   */
  async getSchools(): Promise<School[]> {
    let remoteSchools: School[] | null = null;

    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        remoteSchools = data.map(row => ({
          id: row.id,
          registrationId: row.registration_id || row.code,
          code: row.code,
          name: row.name,
          schoolType: row.school_type || 'CBSE',
          email: row.email,
          phone: row.phone,
          address: row.address || '',
          city: row.city || 'Delhi',
          state: row.state || 'Delhi',
          country: row.country || 'India',
          postalCode: row.postal_code || '110001',
          isActive: Boolean(row.is_active),
          isDemo: false,
          totalStudents: row.total_students || 0,
          totalStaff: row.total_staff || 1,
          enrolledCoursesCount: row.enrolled_courses_count || 0,
          createdAt: row.created_at || new Date().toISOString(),
          onboardingStatus: row.onboarding_status || 'ACTIVE'
        }));
      }
    } catch {
      // Supabase network / schema fallback
    }

    const localSchools = getLocalProdStore<School[]>(PROD_STORAGE_SCHOOLS, [initialWorkingRealSchool]);
    
    // Merge remote and local if remote exists, otherwise localSchools
    const source = remoteSchools && remoteSchools.length > 0 ? remoteSchools : localSchools;
    
    const deletedIds = new Set<string>();
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('school_os_deleted_school_ids');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) arr.forEach((id: string) => deletedIds.add(id));
        }
      } catch {}
    }

    // Filter strictly to ensure ZERO demo fixtures and NO deleted schools
    const filtered = source
      .filter(s => !isDemoSchool(s))
      .filter(s => !deletedIds.has(s.id) && !deletedIds.has(s.code) && !deletedIds.has(s.registrationId || ''));
    
    // Ensure initialWorkingRealSchool is present only if not deleted and list is otherwise empty
    if (!deletedIds.has(initialWorkingRealSchool.id) && !deletedIds.has(initialWorkingRealSchool.code)) {
      if (!filtered.some(s => s.id === initialWorkingRealSchool.id || s.email === initialWorkingRealSchool.email)) {
        filtered.unshift(initialWorkingRealSchool);
      }
    }

    setLocalProdStore(PROD_STORAGE_SCHOOLS, filtered);
    return filtered;
  },

  /**
   * Permanently removes a school from Supabase and local storage
   */
  async deleteSchool(schoolId: string): Promise<boolean> {
    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase.from('schools').delete().eq('id', schoolId);
      }
    } catch {}

    const localSchools = getLocalProdStore<School[]>(PROD_STORAGE_SCHOOLS, []);
    const updated = localSchools.filter(s => s.id !== schoolId && s.code !== schoolId && s.registrationId !== schoolId);
    setLocalProdStore(PROD_STORAGE_SCHOOLS, updated);
    return true;
  },

  /**
   * Registers a new school in Supabase and production store
   */
  async registerSchool(
    schoolData: Omit<School, 'id' | 'code' | 'isActive' | 'createdAt' | 'enrolledCoursesCount' | 'totalStudents' | 'totalStaff'>,
    principalData: { firstName: string; lastName: string; email: string; password?: string; designation?: string; phone?: string },
    createdBySuperAdmin = false
  ): Promise<{ success: boolean; school: School; user: UserProfile; error?: string }> {
    try {
      const existingSchools = await this.getSchools();
      
      // Check for duplicate school email
      if (existingSchools.some(s => s.email.toLowerCase() === schoolData.email.toLowerCase())) {
        return {
          success: false,
          school: {} as School,
          user: {} as UserProfile,
          error: `A school with email "${schoolData.email}" is already registered.`
        };
      }

      const cityCode = (schoolData.city || 'SCH').slice(0, 3).toUpperCase();
      const registrationId = generateUniqueRegistrationId(existingSchools);
      const newSchoolCode = `SCH-${cityCode}-${Math.floor(100 + Math.random() * 900)}`;
      const newSchoolId = `sch-${cityCode.toLowerCase()}-${Date.now().toString().slice(-6)}`;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const generatedTempPassword = `Pass@${randomSuffix}`;
      const finalPassword = principalData.password?.trim() || generatedTempPassword;

      const newSchool: School = {
        ...schoolData,
        id: newSchoolId,
        registrationId,
        code: newSchoolCode,
        isActive: createdBySuperAdmin, // Super Admin direct creation activates immediately; self-registration is PENDING_APPROVAL
        onboardingStatus: createdBySuperAdmin ? 'ACTIVE' : 'PENDING_APPROVAL',
        isDemo: false,
        totalStudents: 0,
        totalStaff: 1,
        enrolledCoursesCount: 0,
        createdAt: new Date().toISOString(),
        principalName: `${principalData.firstName} ${principalData.lastName}`.trim(),
        adminCredentials: {
          loginId: principalData.email,
          email: principalData.email,
          temporaryPassword: finalPassword,
          generatedAt: new Date().toISOString(),
          provisionedBy: createdBySuperAdmin ? 'InnovatMind Super Admin' : 'Self-Registration Portal'
        }
      };

      const principalProfile: UserProfile = {
        id: `usr-prin-${Date.now()}`,
        schoolId: newSchoolId,
        schoolName: newSchool.name,
        role: 'SCHOOL_ADMIN',
        firstName: principalData.firstName,
        lastName: principalData.lastName,
        displayName: `${principalData.firstName} ${principalData.lastName}`.trim(),
        email: principalData.email,
        phone: principalData.phone || schoolData.phone,
        designation: principalData.designation || 'Principal & Director',
        isActive: true,
        status: 'ACTIVE'
      };

      // Attempt Supabase insert
      try {
        await supabase.from('schools').insert([{
          id: newSchool.id,
          registration_id: newSchool.registrationId,
          code: newSchool.code,
          name: newSchool.name,
          school_type: newSchool.schoolType,
          email: newSchool.email,
          phone: newSchool.phone,
          address: newSchool.address,
          city: newSchool.city,
          state: newSchool.state,
          country: newSchool.country,
          postal_code: newSchool.postalCode,
          is_active: newSchool.isActive,
          onboarding_status: newSchool.onboardingStatus,
          created_at: newSchool.createdAt
        }]);

        await supabase.from('profiles').insert([{
          id: principalProfile.id,
          school_id: newSchool.id,
          role: 'SCHOOL_ADMIN',
          first_name: principalProfile.firstName,
          last_name: principalProfile.lastName,
          email: principalProfile.email,
          phone: principalProfile.phone,
          designation: principalProfile.designation,
          is_active: true
        }]);
      } catch {
        // Log remote schema warning if table is not yet in Supabase cache
      }

      // Persist in Production Local Store
      const updatedSchools = [newSchool, ...existingSchools];
      setLocalProdStore(PROD_STORAGE_SCHOOLS, updatedSchools);

      return {
        success: true,
        school: newSchool,
        user: principalProfile
      };
    } catch (err: any) {
      return {
        success: false,
        school: {} as School,
        user: {} as UserProfile,
        error: err?.message || 'Failed to register school'
      };
    }
  },

  /**
   * Approves a pending school in Supabase and production store
   */
  async approveSchool(schoolId: string): Promise<boolean> {
    try {
      const schools = await this.getSchools();
      const updated = schools.map(s => {
        if (s.id === schoolId) {
          return {
            ...s,
            isActive: true,
            onboardingStatus: 'ACTIVE' as const
          };
        }
        return s;
      });

      setLocalProdStore(PROD_STORAGE_SCHOOLS, updated);

      try {
        await supabase
          .from('schools')
          .update({ is_active: true, onboarding_status: 'ACTIVE' })
          .eq('id', schoolId);
      } catch {}

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Fetches students for a specific school (zero cross-tenant leakage)
   */
  async getStudents(schoolId: string): Promise<Student[]> {
    if (!schoolId) return [];

    let remoteStudents: Student[] | null = null;
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId);

      if (!error && Array.isArray(data)) {
        remoteStudents = data.map(row => ({
          id: row.id,
          schoolId: row.school_id,
          profileId: row.profile_id || `prof-${row.id}`,
          admissionNumber: row.admission_number,
          rollNumber: row.roll_number || '101',
          firstName: row.first_name || 'Student',
          lastName: row.last_name || '',
          email: row.email || '',
          gradeId: row.grade_id || 'grade-1',
          gradeName: row.grade_name || 'Class 6',
          sectionId: row.section_id || 'sec-1',
          sectionName: row.section_name || 'A',
          sessionId: row.academic_session || '2026-2027',
          dob: row.dob || '2014-05-10',
          gender: row.gender || 'OTHER',
          address: row.address || '',
          status: row.status || 'ACTIVE',
          parentName: row.parent_name || 'Guardian',
          parentPhone: row.parent_phone || '+91 99999 00000',
          parentEmail: row.parent_email || '',
          currentXp: row.current_xp || 0,
          currentLevel: row.current_level || 1,
          currentStreak: row.current_streak || 0,
          attendancePercentage: row.attendance_percentage || 100,
          feeStatus: row.fee_status || 'PENDING',
          createdAt: row.created_at || new Date().toISOString()
        }));
      }
    } catch {}

    const allLocal = getLocalProdStore<Student[]>(PROD_STORAGE_STUDENTS, []);
    const localForSchool = allLocal.filter(s => s.schoolId === schoolId);

    const result = remoteStudents !== null ? remoteStudents : localForSchool;
    return result;
  },

  /**
   * Enrolls a new student in a school
   */
  async createStudent(student: Omit<Student, 'id' | 'createdAt' | 'currentXp' | 'currentLevel' | 'currentStreak'>): Promise<Student> {
    const newStudentId = `stud-${Date.now()}`;
    const newStudent: Student = {
      ...student,
      id: newStudentId,
      currentXp: 0,
      currentLevel: 1,
      currentStreak: 0,
      createdAt: new Date().toISOString()
    };

    // Try Supabase insert
    try {
      await supabase.from('students').insert([{
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
        current_xp: 0,
        current_level: 1,
        created_at: newStudent.createdAt
      }]);
    } catch {}

    const allLocal = getLocalProdStore<Student[]>(PROD_STORAGE_STUDENTS, []);
    const updated = [newStudent, ...allLocal];
    setLocalProdStore(PROD_STORAGE_STUDENTS, updated);

    // Update school total students count
    const schools = await this.getSchools();
    const updatedSchools = schools.map(s => {
      if (s.id === newStudent.schoolId) {
        return { ...s, totalStudents: (s.totalStudents || 0) + 1 };
      }
      return s;
    });
    setLocalProdStore(PROD_STORAGE_SCHOOLS, updatedSchools);

    return newStudent;
  },

  /**
   * Course assignments: Super Admin -> School Admin
   */
  async assignCourseToSchool(
    schoolId: string,
    courseId: string,
    courseTitle: string,
    eligibleGrades: string[] = ['Class 6', 'Class 7', 'Class 8']
  ): Promise<{ success: boolean; assignmentId: string }> {
    const assignmentId = `sca-${Date.now()}`;
    const newAssignment = {
      id: assignmentId,
      schoolId,
      courseId,
      courseTitle,
      eligibleGrades,
      status: 'ACTIVE',
      assignedAt: new Date().toISOString()
    };

    try {
      await supabase.from('school_course_assignments').insert([{
        id: assignmentId,
        school_id: schoolId,
        course_id: courseId,
        eligible_grades: eligibleGrades,
        status: 'ACTIVE'
      }]);
    } catch {}

    const allAssignments = getLocalProdStore<any[]>(PROD_STORAGE_ASSIGNMENTS, []);
    // Prevent duplicate active assignments
    const existingIdx = allAssignments.findIndex(a => a.schoolId === schoolId && a.courseId === courseId);
    let updated;
    if (existingIdx >= 0) {
      allAssignments[existingIdx] = newAssignment;
      updated = [...allAssignments];
    } else {
      updated = [newAssignment, ...allAssignments];
    }
    setLocalProdStore(PROD_STORAGE_ASSIGNMENTS, updated);

    // Update school enrolledCoursesCount
    const schools = await this.getSchools();
    const updatedSchools = schools.map(s => {
      if (s.id === schoolId) {
        const count = updated.filter(a => a.schoolId === schoolId).length;
        return { ...s, enrolledCoursesCount: count };
      }
      return s;
    });
    setLocalProdStore(PROD_STORAGE_SCHOOLS, updatedSchools);

    return { success: true, assignmentId };
  },

  /**
   * Fetches courses assigned to a school
   */
  async getAssignedCoursesForSchool(schoolId: string): Promise<any[]> {
    if (!schoolId) return [];
    const allAssignments = getLocalProdStore<any[]>(PROD_STORAGE_ASSIGNMENTS, []);
    return allAssignments.filter(a => a.schoolId === schoolId);
  }
};
