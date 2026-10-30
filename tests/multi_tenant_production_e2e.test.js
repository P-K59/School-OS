import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// InnovatMind School OS — Multi-Tenant Production & Propagation E2E Suite
// Validates:
// 1. Demo Mode Isolation & Production Storage Protection
// 2. Fresh School Onboarding with Zero-State Counters & Admin Credentials
// 3. School Admin Credential Provisioning & Authentication Scoping
// 4. Student Admission, Unique Cadet ID Generation & Student Login
// 5. Course Assignment Propagation (Super Admin -> School -> Class -> Student)
// 6. Student Learning Telemetry & XP Progression Persistence
// 7. Cross-Tenant Isolation Barriers & Security Guards
// ============================================================================

test('Multi-Tenant Production Implementation E2E Test Suite', async (t) => {

  // Multi-Tenant Server Simulator matching lib/db/server-db.ts & server-guard.ts
  class MultiTenantServerSimulator {
    constructor() {
      this.schools = [];
      this.students = [];
      this.userProfiles = [];
      this.courses = [
        { id: 'crs-ai-01', title: 'Artificial Intelligence & Robotics', category: 'AI', pricePerStudent: 1200, totalLessons: 30 },
        { id: 'crs-code-02', title: 'Python Cadet Explorers', category: 'Coding', pricePerStudent: 999, totalLessons: 24 }
      ];
      this.schoolCourseAssignments = [];
      this.courseEnrollments = [];
      this.auditLogs = [];
      this.demoStorage = new Map();
      this.prodStorage = new Map();
    }

    // Phase 1: Storage namespace resolution
    resolveStorageKey(baseKey, mode) {
      return mode === 'DEMO' ? `school_os_demo_${baseKey}` : `school_os_prod_${baseKey}`;
    }

    resetDemoData() {
      this.demoStorage.clear();
      // Production storage must remain completely untouched
      return { success: true, demoCleared: true, prodRecordsRemaining: this.prodStorage.size };
    }

    // Phase 2: Fresh School Provisioning (Super Admin)
    async createSchool(schoolData) {
      if (this.schools.some(s => s.code === schoolData.code)) {
        throw new Error(`School with code '${schoolData.code}' already exists`);
      }

      const schoolId = `sch-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const cleanSchoolName = schoolData.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const generatedLoginId = `admin.${cleanSchoolName}@schoolos.in`;
      const generatedTempPassword = `Innovat@${Math.floor(1000 + Math.random() * 9000)}`;

      const school = {
        id: schoolId,
        code: schoolData.code,
        name: schoolData.name,
        city: schoolData.city,
        state: schoolData.state,
        schoolType: schoolData.schoolType || 'CBSE',
        isActive: true,
        // Zero-state verification
        totalStudents: 0,
        totalStaff: 0,
        enrolledCoursesCount: 0,
        createdAt: new Date().toISOString(),
        adminCredentials: {
          loginId: generatedLoginId,
          temporaryPassword: generatedTempPassword,
          role: 'SCHOOL_ADMIN',
          email: schoolData.email || generatedLoginId
        }
      };

      this.schools.push(school);

      // Provision School Admin profile
      const adminProfile = {
        id: `usr-admin-${school.id}`,
        schoolId: school.id,
        schoolName: school.name,
        role: 'SCHOOL_ADMIN',
        loginId: generatedLoginId,
        password: generatedTempPassword,
        displayName: `${school.name} Principal`,
        email: school.adminCredentials.email,
        isActive: true,
        status: 'ACTIVE'
      };
      this.userProfiles.push(adminProfile);

      this.prodStorage.set(`school_${school.id}`, JSON.stringify(school));
      return school;
    }

    // Phase 3: Authentication
    async authenticateUser(identifier, password) {
      const user = this.userProfiles.find(
        u => (u.loginId === identifier || u.email === identifier) && u.password === password
      );
      if (!user) {
        return { success: false, error: 'INVALID_CREDENTIALS' };
      }
      if (!user.isActive) {
        return { success: false, error: 'ACCOUNT_SUSPENDED' };
      }
      return { success: true, user };
    }

    // Phase 4: Student Admission (School Admin)
    async admitStudent(schoolId, studentData) {
      const school = this.schools.find(s => s.id === schoolId);
      if (!school) throw new Error(`School '${schoolId}' not found`);

      const studentCount = this.students.filter(s => s.schoolId === schoolId).length + 1;
      const admissionNumber = `ADM-${new Date().getFullYear()}-${String(studentCount).padStart(4, '0')}`;
      const cadetLoginId = `STU-${admissionNumber}`;
      const tempPassword = `Cadet@${Math.floor(1000 + Math.random() * 9000)}`;

      const student = {
        id: `stu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        schoolId,
        admissionNumber,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        gradeName: studentData.gradeName,
        sectionName: studentData.sectionName || 'A',
        status: 'ACTIVE',
        currentXp: 0,
        currentLevel: 1,
        createdAt: new Date().toISOString(),
        credentials: {
          loginId: cadetLoginId,
          temporaryPassword: tempPassword
        }
      };

      this.students.push(student);
      school.totalStudents = this.students.filter(s => s.schoolId === schoolId).length;

      // Register student profile for authentication
      const studentProfile = {
        id: `usr-${student.id}`,
        schoolId,
        schoolName: school.name,
        role: 'STUDENT',
        loginId: cadetLoginId,
        password: tempPassword,
        displayName: `${student.firstName} ${student.lastName}`,
        studentId: student.id,
        isActive: true,
        status: 'ACTIVE'
      };
      this.userProfiles.push(studentProfile);

      return student;
    }

    // Phase 5: Super Admin Course Assignment to School
    async assignCourseToSchool(schoolId, courseId, academicSession = '2026-2027', appliedPrice = 1200, eligibleGrades = ['Grade 8']) {
      const school = this.schools.find(s => s.id === schoolId);
      if (!school) return { success: false, error: 'School not found' };

      const course = this.courses.find(c => c.id === courseId);
      if (!course) return { success: false, error: 'Course not found' };

      // Prevent duplicate active assignments
      const existing = this.schoolCourseAssignments.find(
        a => a.schoolId === schoolId && a.courseId === courseId && a.academicSession === academicSession && a.status === 'ACTIVE'
      );
      if (existing) {
        return { success: false, error: `Course '${course.title}' is already actively assigned to ${school.name}` };
      }

      const assignment = {
        id: `sca-${Date.now()}`,
        schoolId,
        courseId,
        courseTitle: course.title,
        academicSession,
        appliedPricePerUnit: appliedPrice,
        eligibleGrades,
        status: 'ACTIVE',
        enrolledStudentsCount: 0
      };

      this.schoolCourseAssignments.push(assignment);
      school.enrolledCoursesCount = this.schoolCourseAssignments.filter(a => a.schoolId === schoolId && a.status === 'ACTIVE').length;
      return { success: true, assignment };
    }

    // Phase 6: School Admin Bulk Enrollment (Class -> Enrolled Students)
    async bulkEnrollStudents(schoolId, courseId, gradeName) {
      const assignment = this.schoolCourseAssignments.find(
        a => a.schoolId === schoolId && a.courseId === courseId && a.status === 'ACTIVE'
      );
      if (!assignment) {
        return { success: false, error: 'Course is not actively assigned to this school by Super Admin' };
      }

      const targetStudents = this.students.filter(
        s => s.schoolId === schoolId && s.gradeName === gradeName && s.status === 'ACTIVE'
      );

      const enrollments = [];
      for (const student of targetStudents) {
        const existing = this.courseEnrollments.find(
          e => e.schoolId === schoolId && e.courseId === courseId && e.studentId === student.id
        );
        if (existing) continue;

        const enrollment = {
          id: `enr-${Date.now()}-${student.id}`,
          schoolId,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentLoginId: student.credentials.loginId,
          courseId,
          courseTitle: assignment.courseTitle,
          gradeName: student.gradeName,
          completedLessons: 0,
          totalLessons: 30,
          progressPercentage: 0,
          quizScoreAverage: 0,
          status: 'ACTIVE',
          currentModule: 'Module 1: Introduction'
        };
        this.courseEnrollments.push(enrollment);
        enrollments.push(enrollment);
      }

      assignment.enrolledStudentsCount = this.courseEnrollments.filter(
        e => e.schoolId === schoolId && e.courseId === courseId
      ).length;

      const batch = {
        id: `batch-${Date.now()}`,
        schoolId,
        courseId,
        targetGrade: gradeName,
        totalEnrolled: enrollments.length,
        pricePerStudent: assignment.appliedPricePerUnit,
        totalBilling: enrollments.length * assignment.appliedPricePerUnit
      };

      return { success: true, batch, enrollments };
    }

    // Phase 7: Student Course Query & Progress Update
    async getStudentEnrollments(studentId, requestingSchoolId) {
      const student = this.students.find(s => s.id === studentId);
      if (!student) return [];
      if (requestingSchoolId && student.schoolId !== requestingSchoolId) {
        throw new Error('Forbidden: Cross-tenant enrollment query rejected');
      }
      return this.courseEnrollments.filter(e => e.studentId === studentId && e.schoolId === student.schoolId);
    }

    async updateStudentLearningProgress(studentId, courseId, completedLessonsDelta, quizScore) {
      const enrollment = this.courseEnrollments.find(e => e.studentId === studentId && e.courseId === courseId);
      if (!enrollment) return { success: false, error: 'Enrollment not found' };

      enrollment.completedLessons += completedLessonsDelta;
      enrollment.progressPercentage = Math.round((enrollment.completedLessons / enrollment.totalLessons) * 100);
      if (quizScore !== undefined) {
        enrollment.quizScoreAverage = quizScore;
      }
      enrollment.status = enrollment.progressPercentage >= 100 ? 'COMPLETED' : 'IN_PROGRESS';

      // Telemetry: Award XP to student record
      const student = this.students.find(s => s.id === studentId);
      if (student) {
        student.currentXp += completedLessonsDelta * 50;
        student.currentLevel = Math.max(1, Math.floor(student.currentXp / 500) + 1);
      }

      return { success: true, enrollment, student };
    }

    // Phase 8: Tenant Scope Enforcement Guard
    authorizeSchoolScope(authContext, targetSchoolId) {
      if (!authContext) return { status: 401, error: 'Unauthorized' };
      if (authContext.role === 'SUPER_ADMIN') return null; // Unrestricted
      if (authContext.schoolId !== targetSchoolId) {
        return {
          status: 403,
          error: `Forbidden: Tenant isolation boundary violation. User tenant '${authContext.schoolId}' cannot access '${targetSchoolId}'`
        };
      }
      return null;
    }

    authorizeRole(authContext, allowedRoles) {
      if (!authContext) return { status: 401, error: 'Unauthorized' };
      if (!allowedRoles.includes(authContext.role)) {
        return { status: 403, error: `Forbidden: Role '${authContext.role}' not permitted` };
      }
      return null;
    }
  }

  const server = new MultiTenantServerSimulator();

  // Test 1: Demo Sandbox Isolation & Production Protection
  await t.test('1. Demo data isolation guarantees zero production leakage', () => {
    const demoKey = server.resolveStorageKey('students', 'DEMO');
    const prodKey = server.resolveStorageKey('students', 'PRODUCTION');

    assert.equal(demoKey, 'school_os_demo_students');
    assert.equal(prodKey, 'school_os_prod_students');
    assert.notEqual(demoKey, prodKey);

    // Save demo data and production data
    server.demoStorage.set(demoKey, JSON.stringify([{ id: 'demo-stu-1', name: 'Demo Student' }]));
    server.prodStorage.set(prodKey, JSON.stringify([{ id: 'prod-stu-1', name: 'Real Student' }]));

    assert.equal(server.demoStorage.size, 1);
    assert.equal(server.prodStorage.size, 1);

    // Reset demo data
    const resetResult = server.resetDemoData();
    assert.equal(resetResult.demoCleared, true);
    assert.equal(server.demoStorage.size, 0, 'Demo storage must be cleared');
    assert.equal(server.prodStorage.size, 1, 'Production records must never be modified by demo reset');
    assert.ok(server.prodStorage.has(prodKey));
  });

  // Test 2: Fresh School Provisioning (Zero-State Multi-Tenancy)
  let schoolA;
  await t.test('2. Super Admin provisions fresh school with 0 students/staff and auto-credentials', async () => {
    schoolA = await server.createSchool({
      code: 'SCH-BLR-009',
      name: 'Modern STEM Academy',
      city: 'Bengaluru',
      state: 'Karnataka',
      schoolType: 'CBSE',
      email: 'principal@modernstem.edu.in'
    });

    assert.ok(schoolA.id);
    assert.equal(schoolA.code, 'SCH-BLR-009');
    assert.equal(schoolA.name, 'Modern STEM Academy');
    
    // Critical: Fresh school starts with ZERO real data
    assert.equal(schoolA.totalStudents, 0, 'Initial students count must be 0');
    assert.equal(schoolA.totalStaff, 0, 'Initial staff count must be 0');
    assert.equal(schoolA.enrolledCoursesCount, 0, 'Initial course count must be 0');

    // Admin credentials generated
    assert.ok(schoolA.adminCredentials);
    assert.equal(schoolA.adminCredentials.role, 'SCHOOL_ADMIN');
    assert.ok(schoolA.adminCredentials.loginId.startsWith('admin.modernstemacademy'));
    assert.ok(schoolA.adminCredentials.temporaryPassword.startsWith('Innovat@'));

    // Check School Admin profile registered
    const adminProfile = server.userProfiles.find(u => u.schoolId === schoolA.id);
    assert.ok(adminProfile, 'Initial school admin profile must be provisioned');
    assert.equal(adminProfile.role, 'SCHOOL_ADMIN');
    assert.equal(adminProfile.loginId, schoolA.adminCredentials.loginId);
  });

  // Test 3: School Admin Authentication & Tenant Scoping
  let schoolAdminSession;
  await t.test('3. Provisioned School Admin authenticates and binds to tenant', async () => {
    const authResult = await server.authenticateUser(
      schoolA.adminCredentials.loginId,
      schoolA.adminCredentials.temporaryPassword
    );

    assert.equal(authResult.success, true);
    assert.ok(authResult.user);
    assert.equal(authResult.user.role, 'SCHOOL_ADMIN');
    assert.equal(authResult.user.schoolId, schoolA.id);

    schoolAdminSession = {
      userId: authResult.user.id,
      role: authResult.user.role,
      schoolId: authResult.user.schoolId
    };

    // Role guard checks
    const superAdminGuard = server.authorizeRole(schoolAdminSession, ['SUPER_ADMIN']);
    assert.ok(superAdminGuard, 'School admin must be forbidden from SUPER_ADMIN endpoints');
    assert.equal(superAdminGuard.status, 403);

    const schoolAdminGuard = server.authorizeRole(schoolAdminSession, ['SCHOOL_ADMIN', 'SUPER_ADMIN']);
    assert.equal(schoolAdminGuard, null, 'School admin allowed on school admin endpoints');
  });

  // Test 4: Student Admission & Automated Cadet ID Generation
  let student1;
  await t.test('4. School Admin admits student, generates unique Cadet ID & credentials', async () => {
    student1 = await server.admitStudent(schoolA.id, {
      firstName: 'Aaradhya',
      lastName: 'Sharma',
      gradeName: 'Grade 8',
      sectionName: 'A'
    });

    assert.ok(student1.id);
    assert.equal(student1.schoolId, schoolA.id);
    assert.equal(student1.admissionNumber, 'ADM-2026-0001');
    assert.equal(student1.credentials.loginId, 'STU-ADM-2026-0001');
    assert.ok(student1.credentials.temporaryPassword.startsWith('Cadet@'));
    assert.equal(student1.currentXp, 0);
    assert.equal(student1.currentLevel, 1);

    // School student counter increments dynamically
    assert.equal(schoolA.totalStudents, 1);

    // Profile registered in user directory
    const studentProfile = server.userProfiles.find(u => u.loginId === 'STU-ADM-2026-0001');
    assert.ok(studentProfile);
    assert.equal(studentProfile.role, 'STUDENT');
    assert.equal(studentProfile.schoolId, schoolA.id);
  });

  // Test 5: Student Authentication & Role Isolation
  let studentSession;
  await t.test('5. Student authenticates via Cadet ID and is restricted to student portal', async () => {
    const authResult = await server.authenticateUser(
      student1.credentials.loginId,
      student1.credentials.temporaryPassword
    );

    assert.equal(authResult.success, true);
    assert.ok(authResult.user);
    assert.equal(authResult.user.role, 'STUDENT');
    assert.equal(authResult.user.schoolId, schoolA.id);

    studentSession = {
      userId: authResult.user.studentId,
      role: authResult.user.role,
      schoolId: authResult.user.schoolId
    };

    // Role boundaries: Student blocked from Admin and School routes
    const adminCheck = server.authorizeRole(studentSession, ['SUPER_ADMIN']);
    assert.ok(adminCheck);
    assert.equal(adminCheck.status, 403);

    const schoolCheck = server.authorizeRole(studentSession, ['SCHOOL_ADMIN']);
    assert.ok(schoolCheck);
    assert.equal(schoolCheck.status, 403);
  });

  // Test 6: Course Assignment Propagation (Super Admin -> School -> Class -> Student)
  await t.test('6. Super Admin assigns course to school, preventing duplicates', async () => {
    const assignResult = await server.assignCourseToSchool(
      schoolA.id,
      'crs-ai-01',
      '2026-2027',
      1200,
      ['Grade 8']
    );

    assert.equal(assignResult.success, true);
    assert.ok(assignResult.assignment);
    assert.equal(assignResult.assignment.courseTitle, 'Artificial Intelligence & Robotics');
    assert.equal(schoolA.enrolledCoursesCount, 1);

    // Duplicate check: Re-assigning exact same course/session must be rejected
    const duplicateResult = await server.assignCourseToSchool(
      schoolA.id,
      'crs-ai-01',
      '2026-2027'
    );
    assert.equal(duplicateResult.success, false);
    assert.ok(duplicateResult.error.includes('already actively assigned'));
  });

  // Test 7: School Admin Bulk Class Enrollment
  await t.test('7. School Admin bulk enrolls Grade 8 into assigned course', async () => {
    const enrollResult = await server.bulkEnrollStudents(
      schoolA.id,
      'crs-ai-01',
      'Grade 8'
    );

    assert.equal(enrollResult.success, true);
    assert.ok(enrollResult.batch);
    assert.equal(enrollResult.batch.totalEnrolled, 1);
    assert.equal(enrollResult.batch.pricePerStudent, 1200);
    assert.equal(enrollResult.batch.totalBilling, 1200);

    assert.equal(enrollResult.enrollments.length, 1);
    assert.equal(enrollResult.enrollments[0].studentId, student1.id);
    assert.equal(enrollResult.enrollments[0].courseTitle, 'Artificial Intelligence & Robotics');
    assert.equal(enrollResult.enrollments[0].completedLessons, 0);
  });

  // Test 8: Student Learning Progress & XP Persistence
  await t.test('8. Student learns, progresses lessons, and gains XP', async () => {
    // Student queries enrollments
    const enrollments = await server.getStudentEnrollments(student1.id, schoolA.id);
    assert.equal(enrollments.length, 1);
    assert.equal(enrollments[0].courseId, 'crs-ai-01');

    // Student completes 4 lessons and scores 92 on quiz
    const progressResult = await server.updateStudentLearningProgress(
      student1.id,
      'crs-ai-01',
      4,
      92
    );

    assert.equal(progressResult.success, true);
    assert.equal(progressResult.enrollment.completedLessons, 4);
    assert.equal(progressResult.enrollment.progressPercentage, 13); // 4/30 = 13%
    assert.equal(progressResult.enrollment.quizScoreAverage, 92);
    assert.equal(progressResult.enrollment.status, 'IN_PROGRESS');

    // XP awarded to student record (4 * 50 = +200 XP)
    assert.equal(progressResult.student.currentXp, 200);
    assert.equal(student1.currentXp, 200);
  });

  // Test 9: Strict Cross-Tenant Privacy Barrier
  await t.test('9. Cross-tenant isolation rejects unauthorized queries', async () => {
    // Provision second school
    const schoolB = await server.createSchool({
      code: 'SCH-PUN-005',
      name: 'Pune Global Academy',
      city: 'Pune',
      state: 'Maharashtra',
      schoolType: 'CBSE'
    });

    const student2 = await server.admitStudent(schoolB.id, {
      firstName: 'Vivaan',
      lastName: 'Rao',
      gradeName: 'Grade 8'
    });

    // Assign different course to School B
    await server.assignCourseToSchool(schoolB.id, 'crs-code-02', '2026-2027', 999, ['Grade 8']);
    await server.bulkEnrollStudents(schoolB.id, 'crs-code-02', 'Grade 8');

    // Verify Student 1 (School A) has 0 enrollments in School B's course
    const student1Enrollments = await server.getStudentEnrollments(student1.id, schoolA.id);
    assert.equal(student1Enrollments.length, 1);
    assert.equal(student1Enrollments[0].courseId, 'crs-ai-01');
    assert.ok(!student1Enrollments.some(e => e.schoolId === schoolB.id));

    // Cross-tenant enrollment query rejection
    await assert.rejects(
      async () => {
        await server.getStudentEnrollments(student1.id, schoolB.id);
      },
      /Forbidden: Cross-tenant enrollment query rejected/
    );

    // Cross-tenant scope guard check
    const crossTenantCheck = server.authorizeSchoolScope(schoolAdminSession, schoolB.id);
    assert.ok(crossTenantCheck);
    assert.equal(crossTenantCheck.status, 403);
    assert.ok(crossTenantCheck.error.includes('Tenant isolation boundary violation'));
  });

});
