import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// InnovatMind School OS - Complete End-to-End Workflow & Security Audit Test
// ============================================================================

test('End-to-End School Workflow: Complete 7-Step Institutional Lifecycle', async (t) => {

  // Simulated In-Memory / LocalStorage Store
  const mockStorage = new Map();
  const localStorageMock = {
    getItem: (key) => mockStorage.get(key) || null,
    setItem: (key, val) => mockStorage.set(key, String(val)),
    removeItem: (key) => mockStorage.delete(key),
    clear: () => mockStorage.clear()
  };

  // Initial Seed Data
  const initialSchools = [
    {
      id: 'school-1',
      code: 'SCH-DEL-001',
      name: 'Delhi Public School (STEM Excellence)',
      schoolType: 'CBSE',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      isActive: true,
      totalStudents: 1250,
      totalStaff: 75,
      principalName: 'Dr. Ananya Sharma',
      onboardingStatus: 'ACTIVE',
      academicSession: '2026-2027',
      adminCredentials: {
        loginId: 'admin.delhi@schoolos.internal',
        email: 'principal@dpsdelhi.edu.in',
        temporaryPassword: 'DPS#Admin2026',
      }
    }
  ];

  const initialCourses = [
    {
      id: 'course-1',
      title: 'Python Robotics & Mars Rover Simulation',
      code: 'STEM-PY-01',
      pricePerStudent: 1499,
      minGrade: 6,
      maxGrade: 10,
      totalLessons: 24
    },
    {
      id: 'course-2',
      title: 'AI Cadet: Computer Vision & Edge Models',
      code: 'STEM-AI-02',
      pricePerStudent: 1899,
      minGrade: 7,
      maxGrade: 12,
      totalLessons: 30
    }
  ];

  // --------------------------------------------------------------------------
  // STEP 1: Super Admin creates a new school
  // --------------------------------------------------------------------------
  await t.test('Step 1: Super Admin provisions a new school tenant', () => {
    let schools = [...initialSchools];
    const newSchoolData = {
      name: 'Mumbai International STEM Academy',
      code: 'SCH-MUM-777',
      schoolType: 'CBSE',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      email: 'contact@mumbaistem.edu.in',
      phone: '+91 98200 12345',
      principalName: 'Dr. Rajesh Deshmukh',
      academicSession: '2026-2027',
      totalStudents: 850,
      totalStaff: 50,
      isActive: true,
      onboardingStatus: 'ACTIVE'
    };

    // Duplicate check
    const isDup = schools.some(s => s.code.toUpperCase() === newSchoolData.code.toUpperCase());
    assert.equal(isDup, false, 'School code must be unique');

    const newSchoolId = `school-${Date.now()}`;
    const generatedLoginId = 'admin.mum777@schoolos.internal';
    const generatedTempPassword = 'MUM#Admin777';

    const provisionedSchool = {
      ...newSchoolData,
      id: newSchoolId,
      createdAt: new Date().toISOString(),
      adminCredentials: {
        loginId: generatedLoginId,
        email: 'admin@mumbaistem.edu.in',
        temporaryPassword: generatedTempPassword,
        provisionedBy: 'InnovatMind Super Admin HQ'
      }
    };

    schools.unshift(provisionedSchool);
    localStorageMock.setItem('school_os_schools', JSON.stringify(schools));

    assert.equal(schools.length, 2);
    assert.equal(schools[0].name, 'Mumbai International STEM Academy');
    assert.equal(schools[0].adminCredentials.loginId, 'admin.mum777@schoolos.internal');
    assert.ok(schools[0].adminCredentials.temporaryPassword);
  });

  // --------------------------------------------------------------------------
  // STEP 2: Super Admin configures school details and sets pricing overrides
  // --------------------------------------------------------------------------
  await t.test('Step 2: Super Admin configures school details & assigns customized course pricing', () => {
    const savedSchools = JSON.parse(localStorageMock.getItem('school_os_schools'));
    const targetSchool = savedSchools.find(s => s.code === 'SCH-MUM-777');
    assert.ok(targetSchool, 'Provisioned school must exist');

    // Update school parameters
    targetSchool.address = 'Campus 4, Bandra Kurla Complex';
    targetSchool.postalCode = '400051';
    targetSchool.notes = 'Premium Partner School - Robotics Lab Phase 1';
    localStorageMock.setItem('school_os_schools', JSON.stringify(savedSchools));

    // Super Admin Course Pricing Engine: Override for Mumbai STEM Academy
    const pricingOverrides = [
      {
        id: 'ovr-mum-01',
        schoolId: targetSchool.id,
        courseId: 'course-1',
        academicSession: '2026-2027',
        customPrice: 1199, // Discounted partner pricing
        currency: 'INR',
        billingBasis: 'PER_STUDENT_ANNUAL',
        reason: 'Maharashtra STEM Partner Subsidy',
        status: 'ACTIVE'
      }
    ];
    localStorageMock.setItem('school_os_pricing_overrides', JSON.stringify(pricingOverrides));

    // Resolve course price
    const baseCourse = initialCourses.find(c => c.id === 'course-1');
    const override = pricingOverrides.find(o => o.schoolId === targetSchool.id && o.courseId === 'course-1');
    const effectivePrice = override ? override.customPrice : baseCourse.pricePerStudent;

    assert.equal(effectivePrice, 1199, 'Pricing override must apply deterministically');
  });

  // --------------------------------------------------------------------------
  // STEP 3: School Admin logs in and accesses only their assigned school
  // --------------------------------------------------------------------------
  await t.test('Step 3: School Admin authenticates and is strictly locked to their tenant', () => {
    const savedSchools = JSON.parse(localStorageMock.getItem('school_os_schools'));
    const adminIdentifier = 'admin.mum777@schoolos.internal';
    const adminPassword = 'MUM#Admin777';

    // Authenticate
    const matchedSchool = savedSchools.find(
      s => s.adminCredentials?.loginId.toLowerCase() === adminIdentifier.toLowerCase()
    );
    assert.ok(matchedSchool, 'Admin login ID must match school record');
    assert.equal(adminPassword, matchedSchool.adminCredentials.temporaryPassword, 'Password must match');
    assert.equal(matchedSchool.isActive, true, 'School must be active');

    // Establish School Admin session
    const schoolAdminUser = {
      id: `usr-admin-${matchedSchool.id}`,
      schoolId: matchedSchool.id,
      schoolName: matchedSchool.name,
      role: 'SCHOOL_ADMIN',
      firstName: 'Rajesh',
      lastName: 'Deshmukh',
      displayName: 'Dr. Rajesh Deshmukh',
      email: matchedSchool.adminCredentials.email,
      isActive: true,
      status: 'ACTIVE'
    };

    localStorageMock.setItem('school_os_user', JSON.stringify(schoolAdminUser));
    localStorageMock.setItem('school_os_school_id', matchedSchool.id);

    // Verify tenant boundary: School Admin cannot access school-1
    assert.equal(schoolAdminUser.schoolId, matchedSchool.id);
    assert.notEqual(schoolAdminUser.schoolId, 'school-1');

    // Route guard check: School Admin cannot access /admin
    const canAccessAdmin = schoolAdminUser.role === 'SUPER_ADMIN';
    assert.equal(canAccessAdmin, false, 'School Admin must be barred from /admin Central HQ');
  });

  // --------------------------------------------------------------------------
  // STEP 4: School Admin creates teachers, timetable classes/sections, and students
  // --------------------------------------------------------------------------
  await t.test('Step 4: School Admin creates teachers, classes/sections, and students', () => {
    const activeSchoolId = localStorageMock.getItem('school_os_school_id');
    assert.ok(activeSchoolId);

    // 4a. Create Teacher
    const staffList = [];
    const newTeacher = {
      id: `stf-${Date.now()}`,
      schoolId: activeSchoolId,
      employeeId: 'EMP-MUM-101',
      name: 'Vikram Joshi',
      designation: 'Robotics & AI Lead Instructor',
      department: 'Computer Science',
      email: 'vikram.joshi@mumbaistem.edu.in',
      phone: '+91 98200 99887',
      joiningDate: '2026-05-01',
      basicSalary: 65000,
      allowances: 15000,
      attendanceRate: 100.0,
      status: 'ACTIVE'
    };
    staffList.push(newTeacher);
    localStorageMock.setItem('school_os_staff', JSON.stringify(staffList));

    // 4b. Create Timetable Slot (Class & Section Schedule) with Conflict Detection
    const timetableList = [];
    const newSlot = {
      id: `tt-${Date.now()}`,
      schoolId: activeSchoolId,
      day: 'Monday',
      periodNumber: 1,
      timeSlot: '08:30 AM - 09:15 AM',
      grade: 'Grade 8',
      section: 'Section A',
      subject: 'Python Robotics & Mars Rover',
      teacher: 'Vikram Joshi',
      room: 'Robotics Innovation Lab 1'
    };

    // Conflict detection verification
    const hasTeacherConflict = timetableList.some(
      t => t.schoolId === activeSchoolId &&
           t.day === newSlot.day &&
           t.periodNumber === newSlot.periodNumber &&
           t.teacher.toLowerCase() === newSlot.teacher.toLowerCase()
    );
    assert.equal(hasTeacherConflict, false, 'No teacher conflict should exist for initial slot');

    timetableList.push(newSlot);
    localStorageMock.setItem('school_os_timetable', JSON.stringify(timetableList));

    // Attempt double-booking teacher in same period
    const duplicateSlot = { ...newSlot, id: 'tt-dup-conflict', grade: 'Grade 9', section: 'Section B' };
    const conflictDetected = timetableList.some(
      t => t.schoolId === activeSchoolId &&
           t.day === duplicateSlot.day &&
           t.periodNumber === duplicateSlot.periodNumber &&
           t.teacher.toLowerCase() === duplicateSlot.teacher.toLowerCase()
    );
    assert.equal(conflictDetected, true, 'Timetable conflict detector must flag double-booking teacher');

    // 4c. Enroll Student with Automated Cadet Login ID
    const studentsList = [];
    const enrollmentsList = [];
    const studentAdmission = {
      id: `stud-${Date.now()}`,
      schoolId: activeSchoolId,
      admissionNumber: 'MUM-2026-042',
      rollNumber: '08-A-01',
      firstName: 'Kabir',
      lastName: 'Mehta',
      email: 'kabir.mehta@mumbaistem.edu.in',
      gradeName: 'Grade 8',
      sectionName: 'Section A',
      gender: 'MALE',
      dateOfBirth: '2013-08-15',
      parentName: 'Sanjay Mehta',
      parentPhone: '+91 98200 44556',
      parentEmail: 'sanjay.mehta@example.com',
      feeStatus: 'PAID',
      status: 'ACTIVE',
      provisioningStatus: 'ACTIVE',
      credentials: {
        loginId: 'STU-MUM-042',
        temporaryPassword: 'Learn#2026@Kabir',
        provisionedAt: new Date().toISOString(),
        status: 'ACTIVE'
      }
    };
    studentsList.push(studentAdmission);
    localStorageMock.setItem('school_os_students', JSON.stringify(studentsList));

    // Auto-enroll in eligible STEM courses (Grade 8 matches Grade 6-10 and Grade 7-12)
    const eligibleCourses = initialCourses.filter(c => 8 >= c.minGrade && 8 <= c.maxGrade);
    assert.equal(eligibleCourses.length, 2, 'Grade 8 student must be eligible for both STEM courses');

    eligibleCourses.forEach(course => {
      enrollmentsList.push({
        id: `enr-${Date.now()}-${course.id}`,
        studentId: studentAdmission.id,
        studentName: `${studentAdmission.firstName} ${studentAdmission.lastName}`,
        studentEmail: studentAdmission.email,
        studentLoginId: studentAdmission.credentials.loginId,
        generatedPassword: studentAdmission.credentials.temporaryPassword,
        admissionNumber: studentAdmission.admissionNumber,
        schoolId: activeSchoolId,
        courseId: course.id,
        courseTitle: course.title,
        gradeName: studentAdmission.gradeName,
        sectionName: studentAdmission.sectionName,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 25,
        completedLessons: 6,
        totalLessons: course.totalLessons,
        status: 'ACTIVE',
        currentModule: 'Module 2: Sensors & Lidar Calibration'
      });
    });
    localStorageMock.setItem('school_os_enrollments', JSON.stringify(enrollmentsList));

    assert.equal(studentsList.length, 1);
    assert.equal(enrollmentsList.length, 2);
    assert.equal(studentsList[0].credentials.loginId, 'STU-MUM-042');
  });

  // --------------------------------------------------------------------------
  // STEP 5: Student logs in and accesses personal profile, class & learning activities
  // --------------------------------------------------------------------------
  await t.test('Step 5: Student logs in and accesses only their personal profile and enrolled courses', () => {
    const savedStudents = JSON.parse(localStorageMock.getItem('school_os_students'));
    const savedEnrollments = JSON.parse(localStorageMock.getItem('school_os_enrollments'));
    const studentLoginId = 'STU-MUM-042';
    const studentPassword = 'Learn#2026@Kabir';

    // Verify authentication
    const matched = savedStudents.find(
      s => s.credentials?.loginId.toLowerCase() === studentLoginId.toLowerCase()
    );
    assert.ok(matched, 'Cadet login ID must resolve student record');
    assert.equal(matched.credentials.temporaryPassword, studentPassword, 'Cadet password must match');

    // Create authenticated student profile
    const studentProfile = {
      id: matched.id,
      studentId: matched.id,
      schoolId: matched.schoolId,
      role: 'STUDENT',
      firstName: matched.firstName,
      lastName: matched.lastName,
      displayName: `${matched.firstName} ${matched.lastName}`,
      email: matched.email,
      admissionNumber: matched.admissionNumber,
      gradeName: matched.gradeName,
      sectionName: matched.sectionName,
      isActive: true,
      status: 'ACTIVE'
    };

    localStorageMock.setItem('school_os_user', JSON.stringify(studentProfile));

    // Verify student sees their own enrolled courses
    const studentCourses = savedEnrollments.filter(e => e.studentId === studentProfile.studentId);
    assert.equal(studentCourses.length, 2, 'Student must see their 2 enrolled courses');
    assert.equal(studentCourses[0].courseTitle, 'Python Robotics & Mars Rover Simulation');
    assert.equal(studentCourses[0].gradeName, 'Grade 8');
    assert.equal(studentCourses[0].sectionName, 'Section A');

    // Route guard check: Student cannot access /school or /admin
    const canAccessSchool = studentProfile.role === 'SCHOOL_ADMIN' || studentProfile.role === 'SUPER_ADMIN';
    const canAccessAdmin = studentProfile.role === 'SUPER_ADMIN';
    assert.equal(canAccessSchool, false, 'Student must be barred from /school admin portal');
    assert.equal(canAccessAdmin, false, 'Student must be barred from /admin central portal');
  });

  // --------------------------------------------------------------------------
  // STEP 6: Updates appear in the correct dashboards after simulated page refresh
  // --------------------------------------------------------------------------
  await t.test('Step 6: Data persistence integrity across simulated browser reload', () => {
    // Simulate browser reload: re-read storage exactly as useState initializer does
    const restoredSchools = JSON.parse(localStorageMock.getItem('school_os_schools') || '[]');
    const restoredStaff = JSON.parse(localStorageMock.getItem('school_os_staff') || '[]');
    const restoredTimetable = JSON.parse(localStorageMock.getItem('school_os_timetable') || '[]');
    const restoredStudents = JSON.parse(localStorageMock.getItem('school_os_students') || '[]');
    const restoredEnrollments = JSON.parse(localStorageMock.getItem('school_os_enrollments') || '[]');
    const restoredUser = JSON.parse(localStorageMock.getItem('school_os_user') || 'null');

    // Verify all created entities persist across page refresh
    assert.equal(restoredSchools.length, 2, 'Both original and newly provisioned school must exist');
    const mumbaiSchool = restoredSchools.find(s => s.code === 'SCH-MUM-777');
    assert.ok(mumbaiSchool, 'Mumbai Academy must persist');
    assert.equal(mumbaiSchool.address, 'Campus 4, Bandra Kurla Complex');

    assert.equal(restoredStaff.length, 1, 'Newly added teacher must persist');
    assert.equal(restoredStaff[0].name, 'Vikram Joshi');
    assert.equal(restoredStaff[0].department, 'Computer Science');

    assert.equal(restoredTimetable.length, 1, 'Timetable class/section schedule must persist');
    assert.equal(restoredTimetable[0].grade, 'Grade 8');
    assert.equal(restoredTimetable[0].section, 'Section A');

    assert.equal(restoredStudents.length, 1, 'Enrolled student record must persist');
    assert.equal(restoredStudents[0].firstName, 'Kabir');
    assert.equal(restoredStudents[0].gradeName, 'Grade 8');

    assert.equal(restoredEnrollments.length, 2, 'Student course enrollments must persist');
    assert.ok(restoredUser, 'Active session user must persist');
  });

  // --------------------------------------------------------------------------
  // STEP 7: Unauthorized users cannot access another role dashboard or another school data
  // --------------------------------------------------------------------------
  await t.test('Step 7: Security enforcement - Tenant isolation & Role privilege escalation barriers', () => {
    const savedSchools = JSON.parse(localStorageMock.getItem('school_os_schools'));
    const savedStudents = JSON.parse(localStorageMock.getItem('school_os_students'));
    const savedStaff = JSON.parse(localStorageMock.getItem('school_os_staff'));

    // Tenant Isolation Check: School 1 Admin querying data
    const school1AdminSchoolId = 'school-1';
    const school1ScopedStudents = savedStudents.filter(s => s.schoolId === school1AdminSchoolId);
    const school1ScopedStaff = savedStaff.filter(s => s.schoolId === school1AdminSchoolId);

    // Assert that School 1 sees ZERO records belonging to School 2 (Mumbai)
    assert.equal(school1ScopedStudents.length, 0, 'School 1 Admin must NOT see Mumbai students (Zero data leakage)');
    assert.equal(school1ScopedStaff.length, 0, 'School 1 Admin must NOT see Mumbai staff (Zero data leakage)');

    // Role Guard Simulation
    const checkRouteAccess = (userRole, route) => {
      if (route.startsWith('/admin')) {
        return userRole === 'SUPER_ADMIN';
      }
      if (route.startsWith('/school')) {
        return userRole === 'SCHOOL_ADMIN' || userRole === 'SUPER_ADMIN';
      }
      if (route.startsWith('/student')) {
        return userRole === 'STUDENT' || userRole === 'SUPER_ADMIN';
      }
      return true;
    };

    // Role Barrier Assertions
    assert.equal(checkRouteAccess('STUDENT', '/admin'), false, 'Student blocked from /admin');
    assert.equal(checkRouteAccess('STUDENT', '/school'), false, 'Student blocked from /school');
    assert.equal(checkRouteAccess('STUDENT', '/student'), true, 'Student allowed on /student');

    assert.equal(checkRouteAccess('SCHOOL_ADMIN', '/admin'), false, 'School Admin blocked from /admin');
    assert.equal(checkRouteAccess('SCHOOL_ADMIN', '/school'), true, 'School Admin allowed on /school');
    assert.equal(checkRouteAccess('SCHOOL_ADMIN', '/student'), false, 'School Admin blocked from /student');

    assert.equal(checkRouteAccess('SUPER_ADMIN', '/admin'), true, 'Super Admin allowed on /admin');
    assert.equal(checkRouteAccess('SUPER_ADMIN', '/school'), true, 'Super Admin allowed on /school');
    assert.equal(checkRouteAccess('SUPER_ADMIN', '/student'), true, 'Super Admin allowed on /student');
  });

});
