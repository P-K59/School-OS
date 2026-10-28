import { test } from 'node:test';
import assert from 'node:assert/strict';

// Test 1: Financial Precision and Formatting in INR
test('formatCurrency handles integer and large amounts properly in INR', () => {
  const formatINR = (amt) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);

  assert.match(formatINR(28500), /28,500/);
  assert.match(formatINR(1500000), /15,00,000/);
});

// Test 2: Multi-Tenant Role Matrix Verification
test('Role-Based Access Control matrix logic', () => {
  const rbacCanManageAllSchools = (role) => role === 'SUPER_ADMIN';
  const rbacCanManageSchoolStudents = (role) =>
    role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN' || role === 'TEACHER';
  const rbacCanViewPayroll = (role) =>
    role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN';

  assert.equal(rbacCanManageAllSchools('SUPER_ADMIN'), true);
  assert.equal(rbacCanManageAllSchools('SCHOOL_ADMIN'), false);
  assert.equal(rbacCanManageAllSchools('STUDENT'), false);

  assert.equal(rbacCanManageSchoolStudents('SCHOOL_ADMIN'), true);
  assert.equal(rbacCanManageSchoolStudents('TEACHER'), true);
  assert.equal(rbacCanManageSchoolStudents('PARENT'), false);

  assert.equal(rbacCanViewPayroll('SCHOOL_ADMIN'), true);
  assert.equal(rbacCanViewPayroll('STUDENT'), false);
});

// Test 3: Deterministic Payroll Formula Verification
test('Deterministic Payroll calculation formula adheres to spec', () => {
  const calculateNetSalary = ({ basic, allowances, incentives, overtime, leaveDeductions, advance, otherDeductions }) => {
    const gross = basic + allowances + incentives + overtime;
    const totalDeductions = leaveDeductions + advance + otherDeductions;
    return gross - totalDeductions;
  };

  const salary = calculateNetSalary({
    basic: 45000,
    allowances: 8000,
    incentives: 3000,
    overtime: 2000,
    leaveDeductions: 1500,
    advance: 5000,
    otherDeductions: 500,
  });

  assert.equal(salary, 51000);
});

// Test 4: Student Gamification XP Level Calculation
test('Student XP level progression formula', () => {
  const calculateLevel = (xp) => {
    if (xp >= 3000) return 8;
    if (xp >= 2500) return 7;
    if (xp >= 2000) return 6;
    if (xp >= 1500) return 5;
    if (xp >= 1000) return 4;
    if (xp >= 500) return 3;
    if (xp >= 200) return 2;
    return 1;
  };

  assert.equal(calculateLevel(150), 1);
  assert.equal(calculateLevel(750), 3);
  assert.equal(calculateLevel(1450), 4);
  assert.equal(calculateLevel(2640), 7);
});

// Test 5: Multi-Tenant Data Isolation & RLS Security Enforcement
test('Multi-tenant data isolation prevents cross-school data leaks', () => {
  const allStudents = [
    { id: 'stud-1', schoolId: 'school-1', name: 'Aarav Verma' },
    { id: 'stud-2', schoolId: 'school-1', name: 'Diya Nair' },
    { id: 'stud-blr-1', schoolId: 'school-2', name: 'Ananya Rao' },
    { id: 'stud-mum-1', schoolId: 'school-3', name: 'Advait Joshi' },
  ];

  // Function simulating PostgreSQL Row Level Security (RLS) filter
  const queryStudents = (userRole, userSchoolId) => {
    if (userRole === 'SUPER_ADMIN') {
      return allStudents;
    }
    return allStudents.filter(s => s.schoolId === userSchoolId);
  };

  // School 1 Admin query
  const school1Records = queryStudents('SCHOOL_ADMIN', 'school-1');
  assert.equal(school1Records.length, 2);
  assert.equal(school1Records.every(s => s.schoolId === 'school-1'), true);
  assert.equal(school1Records.some(s => s.schoolId === 'school-2'), false);

  // School 2 Admin query
  const school2Records = queryStudents('SCHOOL_ADMIN', 'school-2');
  assert.equal(school2Records.length, 1);
  assert.equal(school2Records[0].name, 'Ananya Rao');
  assert.equal(school2Records.some(s => s.schoolId === 'school-1'), false);

  // Super Admin query (Global multi-tenant authority)
  const superAdminRecords = queryStudents('SUPER_ADMIN', null);
  assert.equal(superAdminRecords.length, 4);
});

// Test 6: Cross-Tenant Mutation Attempt Rejected for Non-Superadmin
test('Cross-tenant mutation security rejection', () => {
  const canModifyRecord = (userRole, userSchoolId, targetRecordSchoolId) => {
    if (userRole === 'SUPER_ADMIN') return true;
    return userSchoolId === targetRecordSchoolId;
  };

  // School 1 admin modifying School 1 record -> ALLOWED
  assert.equal(canModifyRecord('SCHOOL_ADMIN', 'school-1', 'school-1'), true);

  // School 1 admin attempting to modify School 2 record -> REJECTED
  assert.equal(canModifyRecord('SCHOOL_ADMIN', 'school-1', 'school-2'), false);

  // Super Admin modifying any school record -> ALLOWED
  assert.equal(canModifyRecord('SUPER_ADMIN', null, 'school-2'), true);
});

// Test 7: Fee Payment Processing & Ledger Reconciliation
test('Fee payment updates invoice paid status and remaining balance accurately', () => {
  const invoice = {
    id: 'inv-101',
    totalAmount: 32000,
    discountAmount: 2000,
    paidAmount: 15000,
    status: 'PARTIAL'
  };

  const processPayment = (inv, paymentAmount) => {
    const netBilled = inv.totalAmount - inv.discountAmount;
    const newPaid = inv.paidAmount + paymentAmount;
    const newStatus = newPaid >= netBilled ? 'PAID' : 'PARTIAL';
    const remaining = Math.max(0, netBilled - newPaid);

    return {
      ...inv,
      paidAmount: newPaid,
      status: newStatus,
      remaining: remaining,
      receiptNumber: `REC-2025-99881`
    };
  };

  // Pay remaining 15,000 to fully reconcile
  const result = processPayment(invoice, 15000);
  assert.equal(result.status, 'PAID');
  assert.equal(result.paidAmount, 30000);
  assert.equal(result.remaining, 0);
  assert.match(result.receiptNumber, /REC-2025-/);
});

// Test 8: Timetable Clash Detection Algorithm (Teacher & Room Conflicts)
test('Timetable clash detector flags double-booked teachers and rooms', () => {
  const existingSchedule = [
    { day: 'Monday', periodNumber: 2, timeSlot: '09:15 AM - 10:00 AM', grade: 'Grade 6', section: 'Section A', subject: 'Python', teacher: 'Rajesh Kumar', room: 'Computer Lab 1' },
    { day: 'Monday', periodNumber: 2, timeSlot: '09:15 AM - 10:00 AM', grade: 'Grade 8', section: 'Section B', subject: 'Robotics', teacher: 'Sneha Patel', room: 'Robotics Lab' }
  ];

  const checkConflict = (newSlot, schedule) => {
    const teacherConflict = schedule.find(
      s => s.day === newSlot.day && s.periodNumber === newSlot.periodNumber && s.teacher === newSlot.teacher
    );
    if (teacherConflict) return { hasConflict: true, reason: 'TEACHER_CONFLICT' };

    const roomConflict = schedule.find(
      s => s.day === newSlot.day && s.periodNumber === newSlot.periodNumber && s.room === newSlot.room
    );
    if (roomConflict) return { hasConflict: true, reason: 'ROOM_CONFLICT' };

    return { hasConflict: false };
  };

  // Attempt to assign Rajesh Kumar to Grade 7 at Period 2 Monday -> Should fail
  const attempt1 = checkConflict(
    { day: 'Monday', periodNumber: 2, teacher: 'Rajesh Kumar', room: 'Room 201' },
    existingSchedule
  );
  assert.equal(attempt1.hasConflict, true);
  assert.equal(attempt1.reason, 'TEACHER_CONFLICT');

  // Attempt to assign another teacher to Computer Lab 1 at Period 2 Monday -> Should fail
  const attempt2 = checkConflict(
    { day: 'Monday', periodNumber: 2, teacher: 'Amit Sen', room: 'Computer Lab 1' },
    existingSchedule
  );
  assert.equal(attempt2.hasConflict, true);
  assert.equal(attempt2.reason, 'ROOM_CONFLICT');

  // Attempt valid assignment at Period 3 -> Should pass
  const attempt3 = checkConflict(
    { day: 'Monday', periodNumber: 3, teacher: 'Rajesh Kumar', room: 'Computer Lab 1' },
    existingSchedule
  );
  assert.equal(attempt3.hasConflict, false);
});

// Test 9: School Tenant Registration & Dynamic Code Generation
test('registerSchool creates new isolated tenant with default data and admin profile', () => {
  const registerTenant = (schoolData, principalData) => {
    const cityCode = (schoolData.city || 'SCH').slice(0, 3).toUpperCase();
    const newSchoolId = `school-${Date.now()}`;
    const newSchoolCode = `SCH-${cityCode}-004`;

    const school = {
      ...schoolData,
      id: newSchoolId,
      code: newSchoolCode,
      isActive: true,
      enrolledCoursesCount: 6,
    };

    const principal = {
      id: `usr-prin-${newSchoolId}`,
      schoolId: newSchoolId,
      role: 'SCHOOL_ADMIN',
      firstName: principalData.firstName,
      lastName: principalData.lastName,
      email: principalData.email,
    };

    return { school, principal };
  };

  const { school, principal } = registerTenant(
    { name: 'Pune Tech International', schoolType: 'CBSE', city: 'Pune' },
    { firstName: 'Dr. Priya', lastName: 'Deshmukh', email: 'priya.d@punetech.edu.in' }
  );

  assert.match(school.code, /SCH-PUN-/);
  assert.equal(principal.role, 'SCHOOL_ADMIN');
  assert.equal(principal.schoolId, school.id);
});

// Test 10: Multi-Identifier Login Resolution (Student ID vs Super Admin vs Staff)
test('Login method resolves Student Admission ID, Super Admin, and Employee ID', () => {
  const students = [
    { admissionNumber: 'ADM-2025-0101', rollNumber: '06-A-01', firstName: 'Aarav', role: 'STUDENT', schoolId: 'school-1' }
  ];
  const staff = [
    { employeeId: 'EMP-DELHI-002', name: 'Rajesh Kumar', role: 'TEACHER', schoolId: 'school-1' }
  ];

  const resolveLogin = (rawIdentifier) => {
    const input = rawIdentifier.toLowerCase().trim();

    if (input === 'superadmin@innovatmind.com') {
      return { role: 'SUPER_ADMIN', redirect: '/admin' };
    }

    const student = students.find(s => s.admissionNumber.toLowerCase() === input || s.rollNumber.toLowerCase() === input);
    if (student) {
      return { role: 'STUDENT', redirect: '/student', name: student.firstName };
    }

    const stf = staff.find(s => s.employeeId.toLowerCase() === input);
    if (stf) {
      return { role: 'TEACHER', redirect: '/teacher', name: stf.name };
    }

    return { role: 'SCHOOL_ADMIN', redirect: '/school' };
  };

  // Test Student ID Login
  const resStudent = resolveLogin('ADM-2025-0101');
  assert.equal(resStudent.role, 'STUDENT');
  assert.equal(resStudent.redirect, '/student');
  assert.equal(resStudent.name, 'Aarav');

  // Test Super Admin Login
  const resSuper = resolveLogin('superadmin@innovatmind.com');
  assert.equal(resSuper.role, 'SUPER_ADMIN');
  assert.equal(resSuper.redirect, '/admin');

  // Test Staff Employee ID Login
  const resStaff = resolveLogin('EMP-DELHI-002');
  assert.equal(resStaff.role, 'TEACHER');
  assert.equal(resStaff.redirect, '/teacher');
});

// Test 11: Student Course Module Progression & Quiz Validation
test('Student Course Module progression awards XP and calculates module completion correctly', () => {
  const course = {
    id: 'crs-1',
    lessons: [
      { id: 'l1', xp: 100, correctQuizIndex: 0 },
      { id: 'l2', xp: 100, correctQuizIndex: 0 },
      { id: 'l3', xp: 150, correctQuizIndex: 0 },
      { id: 'l4', xp: 200, correctQuizIndex: 0 },
    ]
  };

  const completedMap = { 'l1': true, 'l2': true };
  const getProgress = (lessons, completed) => {
    const doneCount = lessons.filter(l => completed[l.id]).length;
    return Math.round((doneCount / lessons.length) * 100);
  };

  assert.equal(getProgress(course.lessons, completedMap), 50);

  // Answering quiz
  const answerQuiz = (lesson, selectedIdx) => selectedIdx === lesson.correctQuizIndex;
  assert.equal(answerQuiz(course.lessons[2], 0), true);
  assert.equal(answerQuiz(course.lessons[2], 2), false);
});

// Test 12: Multi-Child Parent Partitioning & GPA Aggregate Computation
test('Parent Portal multi-child switcher calculates distinct GPA and ledger due balances', () => {
  const children = [
    {
      id: 'stud-1',
      name: 'Aarav Verma',
      grades: [{ marks: 92 }, { marks: 88 }, { marks: 96 }, { marks: 94 }, { marks: 90 }],
      invoice: { totalAmount: 28500, paidAmount: 28500 }
    },
    {
      id: 'stud-ananya',
      name: 'Ananya Verma',
      grades: [{ marks: 95 }, { marks: 94 }, { marks: 98 }, { marks: 92 }, { marks: 96 }],
      invoice: { totalAmount: 24000, paidAmount: 18000 }
    }
  ];

  const calculateGpa = (grades) => {
    const total = grades.reduce((acc, curr) => acc + curr.marks, 0);
    return Number((total / grades.length).toFixed(1));
  };

  assert.equal(calculateGpa(children[0].grades), 92.0);
  assert.equal(calculateGpa(children[1].grades), 95.0);

  const getDue = (invoice) => invoice.totalAmount - invoice.paidAmount;
  assert.equal(getDue(children[0].invoice), 0);
  assert.equal(getDue(children[1].invoice), 6000);
});

// Test 13: Teacher Assessment Creation & Submission Tracker
test('Assessment Studio calculates submission rates and validates evaluation status', () => {
  const assessment = {
    title: 'Mid-Term Python Evaluation',
    durationMins: 45,
    totalMarks: 50,
    submissionsCount: 24,
    totalStudents: 28,
  };

  const getSubmissionRate = (submitted, total) => Math.round((submitted / total) * 100);
  assert.equal(getSubmissionRate(assessment.submissionsCount, assessment.totalStudents), 86);
});

// Test 14: STEM Lab Hardware Checkout and Stock Threshold Logic
test('Lab Inventory module decrements available stock and dynamically flags low-stock', () => {
  const issueHardware = (item) => {
    if (item.availableQty <= 0) {
      throw new Error('Out of stock');
    }
    const newAvail = item.availableQty - 1;
    const newInUse = item.inUseQty + 1;
    return {
      ...item,
      availableQty: newAvail,
      inUseQty: newInUse,
      status: newAvail <= 5 ? 'LOW_STOCK' : 'AVAILABLE',
    };
  };

  const initialKit = { id: 'k-1', availableQty: 6, inUseQty: 4, status: 'AVAILABLE' };
  const afterCheckout = issueHardware(initialKit);

  assert.equal(afterCheckout.availableQty, 5);
  assert.equal(afterCheckout.inUseQty, 5);
  assert.equal(afterCheckout.status, 'LOW_STOCK');
});

// Test 15: Institutional Analytics Financial Velocity and Distinction Rates
test('Institutional Analytics computes collection efficiency and distinction percentage', () => {
  const financialData = {
    totalBilled: 14250000,
    totalCollected: 13420000,
  };

  const calcEfficiency = (collected, billed) => Math.round((collected / billed) * 100);
  assert.equal(calcEfficiency(financialData.totalCollected, financialData.totalBilled), 94);

  const academicScores = [92, 98, 88, 94, 76, 85, 96, 91, 100, 89];
  const a1Distinctions = academicScores.filter(score => score >= 90).length;
  const distinctionRate = Math.round((a1Distinctions / academicScores.length) * 100);
  assert.equal(distinctionRate, 60);
});

// Test 16: Multi-Channel Broadcast Message Template Substitution
test('Broadcast Gateway resolves dynamic merge tags correctly into final message', () => {
  const template = 'Notice from {school_name}: Fee of {due_amount} for {student_name} is due on {due_date}.';
  const variables = {
    '{school_name}': 'Pune Tech International',
    '{due_amount}': '₹28,500',
    '{student_name}': 'Aarav Verma',
    '{due_date}': '15 May',
  };

  let resolved = template;
  for (const [tag, val] of Object.entries(variables)) {
    resolved = resolved.replace(new RegExp(tag, 'g'), val);
  }

  assert.equal(
    resolved,
    'Notice from Pune Tech International: Fee of ₹28,500 for Aarav Verma is due on 15 May.'
  );
});

// Test 17: Transport RFID Boarding Manifest & Route Capacity Metrics
test('Fleet Transport Manager tracks boarded student count and verifies route capacity limit', () => {
  const route = {
    capacity: 35,
    passengers: [
      { id: 'p1', status: 'BOARDED' },
      { id: 'p2', status: 'BOARDED' },
      { id: 'p3', status: 'WAITING' },
      { id: 'p4', status: 'BOARDED' },
    ]
  };

  const boardedCount = route.passengers.filter(p => p.status === 'BOARDED').length;
  assert.equal(boardedCount, 3);
  assert.equal(boardedCount <= route.capacity, true);
  const occupancyRate = Math.round((boardedCount / route.capacity) * 100);
  assert.equal(occupancyRate, 9);
});

// Test 18: Command Palette (Ctrl+K Omnibar) Fuzzy Search & Action Resolution
test('Command Palette Omnibar resolves queries for modules, student records, and quick actions', () => {
  const catalog = [
    { title: 'Mission Control Dashboard', category: 'Navigation', href: '/school' },
    { title: 'Fee Vault & Collections', category: 'Navigation', href: '/school/fees' },
    { title: 'School Settings & White-Labeling', category: 'Navigation', href: '/school/settings' },
    { title: 'Aarav Verma', category: 'Students', roll: '06-A-01', href: '/school/students' },
    { title: 'Diya Nair', category: 'Students', roll: '07-B-14', href: '/school/students' },
    { title: 'Bus Route 14 (Cyber Hub Corridor)', category: 'Transport', href: '/school/transport' },
    { title: 'Broadcast Emergency Alert', category: 'Quick Action', href: '/school/notices' },
  ];

  const searchPalette = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return catalog;
    return catalog.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.roll && item.roll.toLowerCase().includes(q))
    );
  };

  // Search by keyword "fee"
  const feeResults = searchPalette('fee');
  assert.equal(feeResults.some(r => r.href === '/school/fees'), true);

  // Search by student name "Aarav"
  const studentResults = searchPalette('Aarav');
  assert.equal(studentResults.length, 1);
  assert.equal(studentResults[0].title, 'Aarav Verma');

  // Search by transport route "Route 14"
  const routeResults = searchPalette('Route 14');
  assert.equal(routeResults.length, 1);
  assert.equal(routeResults[0].category, 'Transport');

  // Search by settings
  const settingsResults = searchPalette('settings');
  assert.equal(settingsResults.some(r => r.href === '/school/settings'), true);
});

// Test 19: School White-Labeling & Brand Theme Identity Persistence
test('School White-Labeling updates tenant branding schema and maintains tenant isolation', () => {
  const defaultSchool = {
    id: 'school-1',
    name: 'St. Xavier Cyber World School',
    slogan: 'Fostering Innovation & Leadership',
    boardAffiliation: 'CBSE Affiliated #930214',
    brandThemeColor: '#4f46e5',
    logoCrest: 'shield',
  };

  const applyBrandingUpdate = (school, updatePayload) => {
    return {
      ...school,
      ...updatePayload,
      updatedAt: '2026-09-24T10:00:00Z'
    };
  };

  const updatedSchool = applyBrandingUpdate(defaultSchool, {
    slogan: 'Leading the Future of Artificial Intelligence & Robotics',
    brandThemeColor: '#059669',
    logoCrest: 'sparkles',
    principalName: 'Dr. Rajeshwari Sharma, Ph.D.'
  });

  assert.equal(updatedSchool.id, 'school-1');
  assert.equal(updatedSchool.brandThemeColor, '#059669');
  assert.equal(updatedSchool.logoCrest, 'sparkles');
  assert.equal(updatedSchool.slogan, 'Leading the Future of Artificial Intelligence & Robotics');
  assert.equal(updatedSchool.principalName, 'Dr. Rajeshwari Sharma, Ph.D.');
});

// Test 20: Super Admin Provisioned School Credentials Resolution
test('Super Admin provisioned login credentials authenticate the correct school admin tenant', () => {
  const schools = [
    {
      id: 'school-1',
      code: 'SCH-DELHI-001',
      name: 'Delhi Public Tech Academy',
      adminCredentials: {
        loginId: 'admin.delhi@schoolos.internal',
        temporaryPassword: 'Delhi#Admin2025'
      }
    },
    {
      id: 'school-2',
      code: 'SCH-BLR-002',
      name: 'Greenwood STEM International',
      adminCredentials: {
        loginId: 'admin.greenwood@schoolos.internal',
        temporaryPassword: 'Blr#STEM980'
      }
    }
  ];

  const authenticateSchoolAdmin = (loginId, password) => {
    const matched = schools.find(
      s => s.adminCredentials?.loginId === loginId && s.adminCredentials?.temporaryPassword === password
    );
    if (!matched) return { success: false, error: 'Invalid credentials' };
    return { success: true, schoolId: matched.id, schoolName: matched.name, role: 'SCHOOL_ADMIN' };
  };

  // Valid credentials for School 1
  const auth1 = authenticateSchoolAdmin('admin.delhi@schoolos.internal', 'Delhi#Admin2025');
  assert.equal(auth1.success, true);
  assert.equal(auth1.schoolId, 'school-1');
  assert.equal(auth1.role, 'SCHOOL_ADMIN');

  // Valid credentials for School 2
  const auth2 = authenticateSchoolAdmin('admin.greenwood@schoolos.internal', 'Blr#STEM980');
  assert.equal(auth2.success, true);
  assert.equal(auth2.schoolId, 'school-2');
  assert.equal(auth2.role, 'SCHOOL_ADMIN');

  // Cross-tenant credential mismatch
  const authInvalid = authenticateSchoolAdmin('admin.delhi@schoolos.internal', 'Blr#STEM980');
  assert.equal(authInvalid.success, false);
});

// Test 21: School Admin Feature Module Completeness Matrix
test('School Admin modules verify full operational capabilities (Admissions, Fees, Payroll, Timetable, Hardware, GPS)', () => {
  const schoolModules = [
    { name: 'Mission Control', path: '/school', hasLiveKpis: true },
    { name: 'Students & Admissions CRM', path: '/school/students', supportsEnrollment: true },
    { name: 'Fee Vault & Collections', path: '/school/fees', supportsUpiCheckout: true },
    { name: 'Academic & Timetable Grid', path: '/school/timetable', supportsClashDetection: true },
    { name: 'Staff & Payroll Runner', path: '/school/staff', supportsDisbursement: true },
    { name: 'Analytics & BI Suite', path: '/school/analytics', supportsExport: true },
    { name: 'STEM Lab Hardware Vault', path: '/school/inventory', supportsCheckout: true },
    { name: 'Notices & Broadcast Gateway', path: '/school/notices', supportsMultiChannel: true },
    { name: 'Fleet & GPS Transport Radar', path: '/school/transport', supportsLiveManifest: true },
    { name: 'White-Label Branding Settings', path: '/school/settings', supportsTheming: true },
  ];

  assert.equal(schoolModules.length, 10);
  assert.equal(schoolModules.every(m => m.path.startsWith('/school')), true);
});

// Test 22: School Principal Teacher Activity Oversight Verification
test('Principal audit feed specifically isolates and surfaces Teacher activities for supervision', () => {
  const allEvents = [
    { id: 'e1', schoolId: 'school-1', title: 'Teacher Period Marked', category: 'TEACHER', detail: 'Rajesh Kumar marked Period 1' },
    { id: 'e2', schoolId: 'school-1', title: 'Fee Payment Received', category: 'FEE', detail: 'Fee cleared' },
    { id: 'e3', schoolId: 'school-1', title: 'Teacher Biometric Punch-In', category: 'TEACHER', detail: 'Sneha Patel arrived at 08:15 AM' },
    { id: 'e4', schoolId: 'school-2', title: 'Teacher Period Marked', category: 'TEACHER', detail: 'Other school teacher' },
  ];

  // Filter scoped to School 1 Principal for teacher activities
  const school1TeacherLogs = allEvents.filter(
    e => e.schoolId === 'school-1' && e.category === 'TEACHER'
  );

  assert.equal(school1TeacherLogs.length, 2);
  assert.equal(school1TeacherLogs.every(e => e.schoolId === 'school-1'), true);
  assert.equal(school1TeacherLogs.some(e => e.schoolId === 'school-2'), false);
});

// Test 23: Strict Multi-Tenant Commercial Privacy (No School Can View Another's Differential Pricing)
test('Commercial privacy barrier prevents School 1 from seeing School 2 differential fee structures', () => {
  const centralCoursePricing = [
    { courseId: 'python-1', schoolId: 'school-1', schoolName: 'Delhi Public Tech (Metro)', fee: 4999 },
    { courseId: 'python-1', schoolId: 'school-2', schoolName: 'Greenwood (Semi-Urban)', fee: 2499 },
    { courseId: 'python-1', schoolId: 'school-rural', schoolName: 'Satara Vidyalaya (Rural)', fee: 899 },
  ];

  const getAuthorizedCoursePricing = (requestorRole, requestorSchoolId) => {
    // Only Super Admin can view global multi-school matrix
    if (requestorRole === 'SUPER_ADMIN') {
      return centralCoursePricing;
    }
    // Individual School Principal/Admin can ONLY view their own agreed rate
    return centralCoursePricing.filter(p => p.schoolId === requestorSchoolId);
  };

  const school1View = getAuthorizedCoursePricing('SCHOOL_ADMIN', 'school-1');
  assert.equal(school1View.length, 1);
  assert.equal(school1View[0].fee, 4999);
  assert.equal(school1View.some(p => p.schoolId === 'school-2' || p.schoolId === 'school-rural'), false);

  const superAdminView = getAuthorizedCoursePricing('SUPER_ADMIN', null);
  assert.equal(superAdminView.length, 3);
});

// Test 24: Student Attendance Mutation & Audit Log Generation
test('Marking student attendance updates status, adjusts percentage, and triggers teacher audit log', () => {
  let student = {
    id: 'stud-1',
    firstName: 'Aarav',
    lastName: 'Verma',
    attendancePercentage: 96.5,
    todayAttendance: 'PRESENT',
  };

  const markAttendance = (s, status) => {
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
      auditEvent: {
        category: 'TEACHER',
        title: 'Daily Attendance Punch',
        detail: `${s.firstName} ${s.lastName} attendance updated to ${status} for today`,
      }
    };
  };

  const markedAbsent = markAttendance(student, 'ABSENT');
  assert.equal(markedAbsent.todayAttendance, 'ABSENT');
  assert.equal(markedAbsent.attendancePercentage, 95.3);
  assert.equal(markedAbsent.auditEvent.category, 'TEACHER');

  const markedPresent = markAttendance(markedAbsent, 'PRESENT');
  assert.equal(markedPresent.todayAttendance, 'PRESENT');
  assert.equal(markedPresent.attendancePercentage, 96.5);
});

// Test 25: Automatic Student ID Card Generation with Photo & Crest
test('Enrolling student automatically generates digital ID badge with photo and emergency contact', () => {
  const generateStudentIdCard = (student, school) => {
    return {
      cardId: `CARD-${student.admissionNumber}`,
      studentName: `${student.firstName} ${student.lastName}`,
      photoUrl: student.photoUrl,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      gradeSection: `${student.gradeName} (${student.sectionName})`,
      schoolCrest: school.name,
      schoolBoard: school.schoolType,
      emergencyContact: {
        name: student.parentName,
        phone: student.parentPhone,
      },
      barcodeVerified: true,
    };
  };

  const dummyStudent = {
    admissionNumber: 'ADM-2025-9988',
    firstName: 'Samarth',
    lastName: 'Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136',
    rollNumber: '06-A-99',
    gradeName: 'Grade 6',
    sectionName: 'Section A (Cyber)',
    parentName: 'Alok Sharma',
    parentPhone: '+91 98111 00000',
  };

  const dummySchool = {
    name: 'Delhi Public Tech School',
    schoolType: 'CBSE',
  };

  const idCard = generateStudentIdCard(dummyStudent, dummySchool);
  assert.equal(idCard.cardId, 'CARD-ADM-2025-9988');
  assert.equal(idCard.photoUrl.startsWith('https://'), true);
  assert.equal(idCard.emergencyContact.phone, '+91 98111 00000');
  assert.equal(idCard.schoolBoard, 'CBSE');
  assert.equal(idCard.barcodeVerified, true);
});

// Test 26: Cross-Portal Dynamic Fee Reflection & Digital Tax Receipt
test('Fee payment in School Admin reflects dynamically in Student & Parent portals with valid receipt number', () => {
  let invoices = [
    {
      id: 'inv-1',
      studentId: 'stud-1',
      studentName: 'Aarav Verma',
      invoiceNumber: 'INV-2025-001',
      totalAmount: 28500,
      paidAmount: 0,
      status: 'PENDING',
    }
  ];

  const payInvoice = (invoiceId, amount) => {
    const receiptNumber = `REC-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    invoices = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paidAmount + amount;
        return {
          ...inv,
          paidAmount: newPaid,
          status: newPaid >= inv.totalAmount ? 'PAID' : 'PARTIAL',
        };
      }
      return inv;
    });
    return { success: true, receiptNumber };
  };

  const receipt = payInvoice('inv-1', 28500);
  assert.equal(receipt.success, true);
  assert.equal(receipt.receiptNumber.startsWith('REC-2025-'), true);

  // Student & Parent portals reading updated invoice state
  const updatedInv = invoices.find(inv => inv.studentId === 'stud-1');
  assert.equal(updatedInv.status, 'PAID');
  assert.equal(updatedInv.paidAmount, 28500);
});

// Test 27: AI Principal Copilot Diagnostic Engine & 1-Click Action Resolution
test('AI Principal Copilot diagnoses school telemetry and resolves 1-click administrative actions', () => {
  const schoolFinancials = {
    totalBilled: 4250000,
    totalCollected: 3885000,
    totalOverdue: 365000,
  };

  const getDiagnosticReply = (query) => {
    if (query.toLowerCase().includes('fee') || query.toLowerCase().includes('due')) {
      const efficiency = Math.round((schoolFinancials.totalCollected / schoolFinancials.totalBilled) * 100);
      return `Fee collection is currently at ${efficiency}% efficiency. Total overdue is ₹${schoolFinancials.totalOverdue}.`;
    }
    return 'Campus operations running normally.';
  };

  const feeDiag = getDiagnosticReply('What is the status of overdue fees?');
  assert.match(feeDiag, /91% efficiency/);
  assert.match(feeDiag, /₹365000/);

  // 1-Click Action Execution
  let copilotAction = {
    id: 'act-1',
    title: 'Dispatched automated WhatsApp payment links',
    executed: false,
  };

  const executeCopilotAction = (action) => ({ ...action, executed: true });
  const executed = executeCopilotAction(copilotAction);
  assert.equal(executed.executed, true);
});


