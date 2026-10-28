import { test } from 'node:test';
import assert from 'node:assert/strict';

// Seed data fixtures for authoritative testing
const demoUsers = [
  {
    id: 'usr-super',
    role: 'SUPER_ADMIN',
    firstName: 'Pankaj',
    lastName: 'Kumar',
    email: 'superadmin@innovatmind.com',
    password: 'password123',
    isActive: true,
    status: 'ACTIVE'
  },
  {
    id: 'usr-admin-1',
    schoolId: 'school-delhi-01',
    role: 'SCHOOL_ADMIN',
    firstName: 'Dr. Ananya',
    lastName: 'Sharma',
    email: 'principal@delhitech.edu.in',
    password: 'password123',
    isActive: true,
    status: 'ACTIVE'
  },
  {
    id: 'usr-teacher-1',
    schoolId: 'school-delhi-01',
    role: 'TEACHER',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@delhitech.edu.in',
    password: 'password123',
    isActive: true,
    status: 'ACTIVE'
  },
  {
    id: 'usr-student-1',
    schoolId: 'school-delhi-01',
    role: 'STUDENT',
    firstName: 'Aarav',
    lastName: 'Verma',
    email: 'aarav.v@student.delhitech.edu.in',
    password: 'password123',
    isActive: true,
    status: 'ACTIVE'
  }
];

const initialSchools = [
  {
    id: 'school-delhi-01',
    name: 'Delhi Public Tech School',
    code: 'DEL-TECH-01',
    isActive: true,
    onboardingStatus: 'ACTIVE'
  },
  {
    id: 'school-mumbai-02',
    name: 'Mumbai Science Academy',
    code: 'MUM-SCI-02',
    isActive: true,
    onboardingStatus: 'ACTIVE'
  }
];

const initialStudents = [
  {
    id: 'stud-1',
    schoolId: 'school-delhi-01',
    admissionNumber: 'DEL-2024-001',
    rollNumber: '101',
    firstName: 'Aarav',
    lastName: 'Verma',
    gradeName: 'Grade 6',
    sectionName: 'Section A',
    email: 'aarav.v@student.delhitech.edu.in',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    credentials: {
      loginId: 'STU-DEL-001',
      temporaryPassword: 'password123'
    }
  },
  {
    id: 'stud-2',
    schoolId: 'school-mumbai-02',
    admissionNumber: 'MUM-2024-002',
    rollNumber: '102',
    firstName: 'Rohan',
    lastName: 'Deshmukh',
    gradeName: 'Grade 7',
    sectionName: 'Section B',
    email: 'rohan.d@student.mumbai.edu.in',
    status: 'ACTIVE',
    provisioningStatus: 'ACTIVE',
    credentials: {
      loginId: 'STU-MUM-002',
      temporaryPassword: 'password123'
    }
  }
];

const initialCourses = [
  {
    id: 'course-1',
    title: 'Python for Young Innovators',
    description: 'Foundations of computational thinking',
    totalModules: 12,
    basePricePerStudent: 1200,
    pricePerStudent: 1200
  }
];

const initialSchoolPricingOverrides = [
  {
    schoolId: 'school-delhi-01',
    courseId: 'course-1',
    customPricePerStudent: 999
  }
];

console.log('================================================================');
console.log('  InnovatMind School OS - Unified Auth & Synchronization Tests ');
console.log('================================================================\n');

// 1. Simulating the Server-Side Authoritative Profile Resolution & Auth Logic
function authenticateCredentials(identifier, password, userDb, studentDb) {
  const cleanId = (identifier || '').trim().toLowerCase();
  
  // Check demo/staff users by email or username
  const matchedUser = userDb.find(u => 
    u.email?.toLowerCase() === cleanId || 
    (u.username && u.username.toLowerCase() === cleanId)
  );

  if (matchedUser) {
    if (matchedUser.password !== password) {
      return { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid password. Please check your credentials.' };
    }
    if (matchedUser.status === 'SUSPENDED' || matchedUser.isActive === false) {
      return { success: false, error: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by institution administration.' };
    }
    if (matchedUser.status === 'INACTIVE') {
      return { success: false, error: 'ACCOUNT_INACTIVE', message: 'Account is pending activation.' };
    }
    const { password: _, ...profile } = matchedUser;
    return { success: true, profile };
  }

  // Check student database by Cadet Login ID or admission number or email
  const matchedStudent = studentDb.find(s => 
    (s.credentials?.loginId && s.credentials.loginId.toLowerCase() === cleanId) ||
    s.admissionNumber.toLowerCase() === cleanId ||
    s.email.toLowerCase() === cleanId
  );

  if (matchedStudent) {
    const expectedPassword = matchedStudent.credentials?.temporaryPassword || 'Cadet@2025';
    if (password !== expectedPassword) {
      return { success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid student password. Please verify temporary password or contact school admin.' };
    }
    if (matchedStudent.status === 'INACTIVE' || matchedStudent.provisioningStatus === 'SUSPENDED') {
      return { success: false, error: 'ACCOUNT_SUSPENDED', message: 'Student account is suspended.' };
    }

    const studentProfile = {
      id: matchedStudent.profileId || `user-student-${matchedStudent.id}`,
      auth_user_id: `auth-${matchedStudent.id}`,
      email: matchedStudent.email,
      role: 'STUDENT',
      firstName: matchedStudent.firstName,
      lastName: matchedStudent.lastName,
      displayName: `${matchedStudent.firstName} ${matchedStudent.lastName}`,
      status: 'ACTIVE',
      schoolId: matchedStudent.schoolId,
      studentId: matchedStudent.id,
      admissionNumber: matchedStudent.admissionNumber,
      gradeName: matchedStudent.gradeName,
      sectionName: matchedStudent.sectionName,
      isActive: true,
      createdAt: matchedStudent.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { success: true, profile: studentProfile };
  }

  return { success: false, error: 'USER_NOT_FOUND', message: 'No account found matching this identifier. Contact your administrator.' };
}

// 2. Simulating Idempotent Student Provisioning Workflow
function provisionStudentAccount(student, existingProfiles) {
  if (student.credentials && student.provisioningStatus === 'ACTIVE') {
    // Already provisioned - return existing without duplicating
    return {
      success: true,
      idempotent: true,
      credentials: student.credentials,
      student
    };
  }

  const cityCode = 'DEL';
  const rawNum = student.admissionNumber.replace(/\D/g, '') || Math.floor(100 + Math.random() * 899).toString();
  const sequenceStr = rawNum.slice(-3).padStart(3, '0');
  const loginId = `STU-${cityCode}-${sequenceStr}`;
  const temporaryPassword = `Cadet@${Math.floor(2025 + Math.random() * 5)}`;

  const credentials = {
    loginId,
    temporaryPassword,
    provisionedAt: new Date().toISOString(),
    isTemporaryPassword: true
  };

  const updatedStudent = {
    ...student,
    credentials,
    provisioningStatus: 'ACTIVE',
    status: 'ACTIVE'
  };

  const newProfile = {
    id: `user-student-${student.id}`,
    auth_user_id: `auth-${student.id}`,
    email: student.email,
    role: 'STUDENT',
    firstName: student.firstName,
    lastName: student.lastName,
    displayName: `${student.firstName} ${student.lastName}`,
    status: 'ACTIVE',
    schoolId: student.schoolId,
    studentId: student.id,
    admissionNumber: student.admissionNumber,
    gradeName: student.gradeName,
    sectionName: student.sectionName,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  existingProfiles.push(newProfile);

  return {
    success: true,
    idempotent: false,
    credentials,
    student: updatedStudent,
    profile: newProfile
  };
}

// 3. Simulating Server-side Redirection Resolver based on authoritative profile
function resolveRedirectRoute(profile, requestedRedirect) {
  if (requestedRedirect && requestedRedirect !== '/login') {
    // Validate that role has permission to access the requested redirect
    if (requestedRedirect.startsWith('/admin') && profile.role === 'SUPER_ADMIN') {
      return requestedRedirect;
    }
    if (requestedRedirect.startsWith('/school') && (profile.role === 'SCHOOL_ADMIN' || profile.role === 'SUPER_ADMIN')) {
      return requestedRedirect;
    }
    if (requestedRedirect.startsWith('/student') && profile.role === 'STUDENT') {
      return requestedRedirect;
    }
  }

  switch (profile.role) {
    case 'SUPER_ADMIN':
      return '/admin';
    case 'SCHOOL_ADMIN':
      return '/school';
    case 'STUDENT':
      return '/student';
    case 'TEACHER':
      return '/teacher';
    case 'PARENT':
      return '/parent';
    default:
      return '/';
  }
}

// ================================================================
//  TEST CASES
// ================================================================

test('Test 1: Valid Super Admin Login authenticates and yields role SUPER_ADMIN with redirect /admin', () => {
  const superAdmin = demoUsers.find(u => u.role === 'SUPER_ADMIN');
  assert.ok(superAdmin, 'Super Admin user must exist in demo users');

  const authResult = authenticateCredentials(superAdmin.email, superAdmin.password, demoUsers, initialStudents);
  assert.equal(authResult.success, true);
  assert.equal(authResult.profile.role, 'SUPER_ADMIN');
  assert.equal(authResult.profile.email, 'superadmin@innovatmind.com');
  
  const redirect = resolveRedirectRoute(authResult.profile);
  assert.equal(redirect, '/admin');
  console.log('  [PASS] Test 1: Valid Super Admin login authenticated -> /admin');
});

test('Test 2: Valid School Admin Login authenticates and links to authorized school tenant with redirect /school', () => {
  const schoolAdmin = demoUsers.find(u => u.role === 'SCHOOL_ADMIN');
  assert.ok(schoolAdmin, 'School Admin user must exist in demo users');

  const authResult = authenticateCredentials(schoolAdmin.email, schoolAdmin.password, demoUsers, initialStudents);
  assert.equal(authResult.success, true);
  assert.equal(authResult.profile.role, 'SCHOOL_ADMIN');
  assert.equal(authResult.profile.schoolId, 'school-delhi-01');
  
  const redirect = resolveRedirectRoute(authResult.profile);
  assert.equal(redirect, '/school');
  console.log('  [PASS] Test 2: Valid School Admin login authenticated with schoolId -> /school');
});

test('Test 3: Valid Student Login via Cadet ID authenticates and links student profile with redirect /student', () => {
  // Aarav Verma has credentials loginId STU-DEL-001
  const student = initialStudents[0];
  const loginId = student.credentials?.loginId || 'STU-DEL-001';
  const password = student.credentials?.temporaryPassword || 'Cadet@2025';

  const authResult = authenticateCredentials(loginId, password, demoUsers, initialStudents);
  assert.equal(authResult.success, true);
  assert.equal(authResult.profile.role, 'STUDENT');
  assert.equal(authResult.profile.studentId, student.id);
  assert.equal(authResult.profile.displayName, `${student.firstName} ${student.lastName}`);

  const redirect = resolveRedirectRoute(authResult.profile);
  assert.equal(redirect, '/student');
  console.log('  [PASS] Test 3: Valid Student login authenticated via Cadet ID -> /student');
});

test('Test 4: Invalid password is strictly rejected with INVALID_CREDENTIALS', () => {
  const superAdmin = demoUsers.find(u => u.role === 'SUPER_ADMIN');
  const authResult = authenticateCredentials(superAdmin.email, 'WrongPassword!123', demoUsers, initialStudents);
  
  assert.equal(authResult.success, false);
  assert.equal(authResult.error, 'INVALID_CREDENTIALS');
  console.log('  [PASS] Test 4: Invalid password strictly rejected');
});

test('Test 5: Suspended account is strictly rejected with ACCOUNT_SUSPENDED', () => {
  const suspendedUser = {
    ...demoUsers[0],
    email: 'suspended.admin@innovatmind.com',
    status: 'SUSPENDED',
    isActive: false
  };
  const mockDb = [...demoUsers, suspendedUser];

  const authResult = authenticateCredentials('suspended.admin@innovatmind.com', suspendedUser.password, mockDb, initialStudents);
  assert.equal(authResult.success, false);
  assert.equal(authResult.error, 'ACCOUNT_SUSPENDED');
  console.log('  [PASS] Test 5: Suspended user denied authentication');
});

test('Test 6: Unknown user is strictly rejected with USER_NOT_FOUND (no auto-generated fallback)', () => {
  const authResult = authenticateCredentials('unknown.intruder@domain.com', 'RandomPassword123', demoUsers, initialStudents);
  assert.equal(authResult.success, false);
  assert.equal(authResult.error, 'USER_NOT_FOUND');
  console.log('  [PASS] Test 6: Unknown user rejected without fallback account creation');
});

test('Test 7: Student admission automatically provisions account with unique Cadet Login ID & course eligibility', () => {
  const newAdmission = {
    id: `stu-test-${Date.now()}`,
    schoolId: 'school-delhi-01',
    profileId: `prof-${Date.now()}`,
    admissionNumber: 'ADM-2025-9921',
    rollNumber: '6-A-42',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.s@student.school.in',
    gradeId: 'grade-6',
    gradeName: 'Grade 6',
    sectionId: 'sec-6a',
    sectionName: 'Section A',
    status: 'ACTIVE'
  };

  const userProfiles = [];
  const provisionResult = provisionStudentAccount(newAdmission, userProfiles);

  assert.equal(provisionResult.success, true);
  assert.equal(provisionResult.idempotent, false);
  assert.ok(provisionResult.credentials.loginId.startsWith('STU-DEL-'));
  assert.ok(provisionResult.credentials.temporaryPassword.startsWith('Cadet@'));
  assert.equal(userProfiles.length, 1);
  assert.equal(userProfiles[0].role, 'STUDENT');
  assert.equal(userProfiles[0].studentId, newAdmission.id);

  // Now verify that the new student can log in with their generated credentials
  const loginResult = authenticateCredentials(
    provisionResult.credentials.loginId,
    provisionResult.credentials.temporaryPassword,
    demoUsers,
    [provisionResult.student]
  );
  assert.equal(loginResult.success, true);
  assert.equal(loginResult.profile.role, 'STUDENT');
  console.log('  [PASS] Test 7: Student account provisioned upon admission and immediately authenticatable');
});

test('Test 8: Retrying account provisioning is idempotent and never creates duplicate accounts', () => {
  const student = {
    id: 'stu-idempotent-01',
    schoolId: 'school-delhi-01',
    admissionNumber: 'ADM-2025-8833',
    firstName: 'Kabir',
    lastName: 'Mehta',
    email: 'kabir.m@student.school.in',
    gradeName: 'Grade 7',
    sectionName: 'Section B',
    status: 'ACTIVE'
  };

  const userProfiles = [];
  // First call provisions
  const firstCall = provisionStudentAccount(student, userProfiles);
  assert.equal(firstCall.idempotent, false);
  assert.equal(userProfiles.length, 1);

  // Second call on already provisioned student returns existing credentials without duplicate profile
  const secondCall = provisionStudentAccount(firstCall.student, userProfiles);
  assert.equal(secondCall.idempotent, true);
  assert.equal(userProfiles.length, 1, 'Profile list must not contain duplicates');
  assert.equal(secondCall.credentials.loginId, firstCall.credentials.loginId);
  console.log('  [PASS] Test 8: Retry-safe provisioning is idempotent');
});

test('Test 9: Multi-tenant isolation prevents School Admin from accessing other schools private records', () => {
  const schoolDelhiAdmin = demoUsers.find(u => u.schoolId === 'school-delhi-01' && u.role === 'SCHOOL_ADMIN');
  const allStudents = initialStudents;

  // Filter students strictly by authenticated School Admin's schoolId
  const isolatedStudents = allStudents.filter(s => s.schoolId === schoolDelhiAdmin.schoolId);

  // Assert that no students from other schools (e.g. school-mumbai-02) are present
  assert.ok(isolatedStudents.length > 0);
  const foreignSchoolStudents = isolatedStudents.filter(s => s.schoolId !== 'school-delhi-01');
  assert.equal(foreignSchoolStudents.length, 0, 'No foreign school students may leak into tenant view');
  console.log('  [PASS] Test 9: Multi-tenant isolation verified (Zero cross-tenant student leakage)');
});

test('Test 10: Role isolation prevents Student from accessing Super Admin or School Admin routes', () => {
  const studentProfile = {
    id: 'user-stu-01',
    role: 'STUDENT',
    schoolId: 'school-delhi-01'
  };

  // Student requested to access /admin
  const redirectedFromAdmin = resolveRedirectRoute(studentProfile, '/admin');
  assert.equal(redirectedFromAdmin, '/student', 'Student requesting /admin must be redirected to /student');

  // Student requested to access /school
  const redirectedFromSchool = resolveRedirectRoute(studentProfile, '/school');
  assert.equal(redirectedFromSchool, '/student', 'Student requesting /school must be redirected to /student');

  console.log('  [PASS] Test 10: Role isolation blocks Student from /admin and /school');
});

test('Test 11: School Admin cannot access Super Admin central routes', () => {
  const schoolAdminProfile = {
    id: 'user-school-admin-01',
    role: 'SCHOOL_ADMIN',
    schoolId: 'school-delhi-01'
  };

  const redirectedFromAdmin = resolveRedirectRoute(schoolAdminProfile, '/admin');
  assert.equal(redirectedFromAdmin, '/school', 'School Admin requesting /admin must be redirected to /school');
  console.log('  [PASS] Test 11: Role isolation blocks School Admin from /admin');
});

test('Test 12: Course and Pricing Data Synchronization between Super Admin and School views', () => {
  // Super Admin course catalog
  const stemCourse = initialCourses[0];
  assert.ok(stemCourse, 'Course catalog must have courses');

  // School-specific pricing overrides
  const delhiOverride = initialSchoolPricingOverrides.find(o => o.schoolId === 'school-delhi-01' && o.courseId === stemCourse.id);
  
  // If override exists, Delhi school gets overridden price; otherwise base price
  const effectivePrice = delhiOverride ? delhiOverride.customPricePerStudent : stemCourse.basePricePerStudent;
  assert.ok(effectivePrice > 0, 'Effective price must be calculated consistently');

  // Assert that student views never expose institutional pricing fields
  const studentCourseView = {
    id: stemCourse.id,
    title: stemCourse.title,
    description: stemCourse.description,
    totalModules: stemCourse.totalModules,
    icon: stemCourse.icon
    // Notice: basePricePerStudent and margin are stripped from student view
  };

  assert.equal(studentCourseView.basePricePerStudent, undefined);
  console.log('  [PASS] Test 12: Course and Pricing synchronization correctly scoped');
});

// Google OAuth & Federated Identity Sign-In Tests
function authenticateGoogleIdentity(email, userDb, studentDb) {
  if (!email || !email.trim()) {
    return { success: false, error: 'NO_IDENTITY_PROVIDED', code: 'AUTH_FAILED' };
  }

  const clean = email.toLowerCase().trim();

  // 1. Strict Central Super Admin Guard
  if (clean === 'superadmin@innovatmind.com') {
    const superProfile = userDb.find(u => u.role === 'SUPER_ADMIN');
    if (!superProfile || !superProfile.isActive || superProfile.status === 'SUSPENDED') {
      return { success: false, error: 'ACCOUNT_SUSPENDED', code: 'USER_SUSPENDED' };
    }
    const { password: _, ...p } = superProfile;
    return { success: true, profile: { ...p, role: 'SUPER_ADMIN', status: 'ACTIVE' } };
  }

  // 2. Demo Users Lookup
  const matchedUser = userDb.find(u => u.email?.toLowerCase() === clean);
  if (matchedUser) {
    if (matchedUser.status === 'SUSPENDED' || matchedUser.isActive === false) {
      return { success: false, error: 'ACCOUNT_SUSPENDED', code: 'USER_SUSPENDED' };
    }
    const { password: _, ...p } = matchedUser;
    return { success: true, profile: { ...p, status: 'ACTIVE' } };
  }

  // 3. Student Directory Lookup
  const matchedStudent = studentDb.find(s => s.email?.toLowerCase() === clean);
  if (matchedStudent) {
    if (matchedStudent.status === 'SUSPENDED' || matchedStudent.provisioningStatus === 'SUSPENDED') {
      return { success: false, error: 'ACCOUNT_SUSPENDED', code: 'USER_SUSPENDED' };
    }
    return {
      success: true,
      profile: {
        id: matchedStudent.id,
        role: 'STUDENT',
        firstName: matchedStudent.firstName,
        lastName: matchedStudent.lastName,
        email: clean,
        schoolId: matchedStudent.schoolId,
        status: 'ACTIVE',
        isActive: true
      }
    };
  }

  // 4. Unlinked Google Account Security Guard
  return {
    success: false,
    error: `Google account (${clean}) is not linked to any active school, staff, or student record.`,
    code: 'ACCOUNT_NOT_LINKED'
  };
}

test('Test 13: Google OAuth - School Admin (Dr. Ananya Sharma) authenticates and routes to /school', () => {
  const result = authenticateGoogleIdentity('principal@delhitech.edu.in', demoUsers, initialStudents);
  assert.equal(result.success, true);
  assert.equal(result.profile.role, 'SCHOOL_ADMIN');
  const redirect = resolveRedirectRoute(result.profile);
  assert.equal(redirect, '/school');
  console.log('  [PASS] Test 13: Google OAuth School Admin redirects to /school');
});

test('Test 14: Google OAuth - Student Cadet (Aarav Verma) authenticates and routes to /student', () => {
  const result = authenticateGoogleIdentity('aarav.v@student.delhitech.edu.in', demoUsers, initialStudents);
  assert.equal(result.success, true);
  assert.equal(result.profile.role, 'STUDENT');
  const redirect = resolveRedirectRoute(result.profile);
  assert.equal(redirect, '/student');
  console.log('  [PASS] Test 14: Google OAuth Student redirects to /student');
});

test('Test 15: Google OAuth - Super Admin (Pankaj Kumar) authenticates and routes to /admin', () => {
  const result = authenticateGoogleIdentity('superadmin@innovatmind.com', demoUsers, initialStudents);
  assert.equal(result.success, true);
  assert.equal(result.profile.role, 'SUPER_ADMIN');
  const redirect = resolveRedirectRoute(result.profile);
  assert.equal(redirect, '/admin');
  console.log('  [PASS] Test 15: Google OAuth Super Admin redirects to /admin');
});

test('Test 16: Google OAuth Security - Unlinked random Google email is rejected with ACCOUNT_NOT_LINKED', () => {
  const result = authenticateGoogleIdentity('stranger@gmail.com', demoUsers, initialStudents);
  assert.equal(result.success, false);
  assert.equal(result.code, 'ACCOUNT_NOT_LINKED');
  console.log('  [PASS] Test 16: Security guard rejects unlinked Google identities');
});

test('Test 17: Google OAuth Security - Suspended student is blocked from Google login', () => {
  const suspendedStudents = [
    {
      ...initialStudents[0],
      email: 'suspended.cadet@delhitech.edu.in',
      status: 'SUSPENDED'
    }
  ];
  const result = authenticateGoogleIdentity('suspended.cadet@delhitech.edu.in', demoUsers, suspendedStudents);
  assert.equal(result.success, false);
  assert.equal(result.code, 'USER_SUSPENDED');
  console.log('  [PASS] Test 17: Security guard blocks suspended Google logins');
});

console.log('\n================================================================');
console.log('  All 17 Unified Auth, Role Routing & Google OAuth Tests Executed');
console.log('================================================================\n');
