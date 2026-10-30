const test = require('node:test');
const assert = require('node:assert/strict');

test('Modular Access, School Admin Reset, and Teacher Tasks Workflow', async (t) => {
  await t.test('1. Super Admin can configure modular functionality for a school', () => {
    const school = {
      id: 'sch-delhi-001',
      name: 'Delhi Public Horizon',
      code: 'SCH-DEL-001',
      enabledModules: {
        admission: true,
        students: true,
        parents: true,
        staff: true,
        attendance: true,
        fees: true,
        academics: true,
        timetable: true,
        exams: true,
        courses: true,
        notices: true,
        transport: true,
        resources: true,
        utilities: true
      }
    };

    // Super Admin disables transport and fees modules
    const updatedModules = {
      ...school.enabledModules,
      transport: false,
      fees: false
    };

    const updatedSchool = {
      ...school,
      enabledModules: updatedModules
    };

    assert.strictEqual(updatedSchool.enabledModules.transport, false, 'Transport module must be disabled');
    assert.strictEqual(updatedSchool.enabledModules.fees, false, 'Fees module must be disabled');
    assert.strictEqual(updatedSchool.enabledModules.students, true, 'Student module must remain active');
    assert.strictEqual(updatedSchool.enabledModules.staff, true, 'Staff module must remain active');

    // Test sidebar nav items filtering
    const allNavItems = [
      { label: 'Overview', href: '/school', moduleKey: 'overview' },
      { label: 'Students', href: '/school/students', moduleKey: 'students' },
      { label: 'Staff & Teachers', href: '/school/staff', moduleKey: 'staff' },
      { label: 'Fees & Finance', href: '/school/fees', moduleKey: 'fees' },
      { label: 'Transport & GPS', href: '/school/transport', moduleKey: 'transport' },
      { label: 'Exams & Cell', href: '/school/exams', moduleKey: 'exams' }
    ];

    const visibleNavItems = allNavItems.filter(item => {
      if (!item.moduleKey || item.moduleKey === 'overview') return true;
      return updatedSchool.enabledModules[item.moduleKey] !== false;
    });

    const labels = visibleNavItems.map(i => i.label);
    assert.ok(!labels.includes('Transport & GPS'), 'Transport must be hidden from sidebar');
    assert.ok(!labels.includes('Fees & Finance'), 'Fees must be hidden from sidebar');
    assert.ok(labels.includes('Students'), 'Students must be visible');
    assert.ok(labels.includes('Staff & Teachers'), 'Staff must be visible');
  });

  await t.test('2. Super Admin can reset School Admin password', () => {
    const school = {
      id: 'sch-delhi-001',
      name: 'Delhi Public Horizon',
      email: 'principal@horizon.edu.in',
      adminCredentials: {
        email: 'principal@horizon.edu.in',
        loginId: 'principal@horizon.edu.in',
        temporaryPassword: 'InitialPassword123'
      }
    };

    const newGeneratedPassword = 'Admin@' + Math.floor(1000 + Math.random() * 9000);
    const updatedSchool = {
      ...school,
      adminCredentials: {
        ...school.adminCredentials,
        temporaryPassword: newGeneratedPassword
      }
    };

    assert.strictEqual(updatedSchool.adminCredentials.email, 'principal@horizon.edu.in');
    assert.strictEqual(updatedSchool.adminCredentials.temporaryPassword, newGeneratedPassword);
    assert.ok(updatedSchool.adminCredentials.temporaryPassword.length >= 8);
  });

  await t.test('3. School Admin creates Teacher Login using Email ID, with classes and permissions', () => {
    const teacherData = {
      name: 'Dr. Preeti Varma',
      email: 'preeti.varma@horizon.edu.in',
      designation: 'Senior Faculty & STEM Lead',
      department: 'Computer Science',
      assignedGrades: ['Grade 8', 'Grade 9', 'Grade 10'],
      assignedSubjects: ['Computer Science & AI', 'Robotics & STEM'],
      permissions: {
        canTakeAttendance: true,
        canGradeExams: true,
        canManageCurriculum: true,
        canManageAssignments: true,
        canApproveLeaves: false
      }
    };

    // Deterministic creation
    const tempPassword = 'Teach@' + Math.floor(1000 + Math.random() * 9000);
    const createdTeacher = {
      id: 'stf-' + Date.now(),
      schoolId: 'sch-delhi-001',
      ...teacherData,
      credentials: {
        loginId: teacherData.email.trim().toLowerCase(),
        temporaryPassword: tempPassword,
        generatedAt: new Date().toISOString()
      }
    };

    // Verify Login ID is exactly Email
    assert.strictEqual(createdTeacher.credentials.loginId, 'preeti.varma@horizon.edu.in');
    assert.strictEqual(createdTeacher.credentials.temporaryPassword, tempPassword);
    assert.deepStrictEqual(createdTeacher.assignedGrades, ['Grade 8', 'Grade 9', 'Grade 10']);
    assert.deepStrictEqual(createdTeacher.assignedSubjects, ['Computer Science & AI', 'Robotics & STEM']);
    assert.strictEqual(createdTeacher.permissions.canTakeAttendance, true);
    assert.strictEqual(createdTeacher.permissions.canApproveLeaves, false);
  });

  await t.test('4. School Admin assigns duties & tasks to Teacher', () => {
    const task = {
      id: 'task-101',
      schoolId: 'sch-delhi-001',
      teacherId: 'stf-001',
      teacherName: 'Dr. Preeti Varma',
      teacherEmail: 'preeti.varma@horizon.edu.in',
      title: 'Conduct Mid-Term Robotics Practical Exam',
      description: 'Setup sensor circuits and evaluate students on code logic',
      assignedGrade: 'Grade 8',
      subject: 'Robotics & STEM',
      dueDate: '2026-11-15',
      priority: 'HIGH',
      status: 'PENDING',
      assignedAt: new Date().toISOString()
    };

    assert.strictEqual(task.status, 'PENDING');
    assert.strictEqual(task.priority, 'HIGH');
    assert.strictEqual(task.assignedGrade, 'Grade 8');

    // Teacher begins working on task
    const inProgressTask = { ...task, status: 'IN_PROGRESS' };
    assert.strictEqual(inProgressTask.status, 'IN_PROGRESS');

    // Teacher completes task
    const completedTask = { ...inProgressTask, status: 'COMPLETED' };
    assert.strictEqual(completedTask.status, 'COMPLETED');
  });

  await t.test('5. School Admin can reset Teacher login password', () => {
    const teacher = {
      id: 'stf-001',
      name: 'Dr. Preeti Varma',
      email: 'preeti.varma@horizon.edu.in',
      credentials: {
        loginId: 'preeti.varma@horizon.edu.in',
        temporaryPassword: 'OldPassword123'
      }
    };

    const newTeacherPassword = 'Teach@' + Math.floor(1000 + Math.random() * 9000);
    const updatedTeacher = {
      ...teacher,
      credentials: {
        ...teacher.credentials,
        temporaryPassword: newTeacherPassword
      }
    };

    assert.strictEqual(updatedTeacher.credentials.temporaryPassword, newTeacherPassword);
    assert.notStrictEqual(updatedTeacher.credentials.temporaryPassword, 'OldPassword123');
  });

  await t.test('6. School Admin can customize White-Label Branding (Colors, Crest, Subdomain, Title)', () => {
    const school = {
      id: 'sch-delhi-001',
      name: 'Delhi Public Horizon',
      brandThemeColor: '#4f46e5',
      brandAccentColor: '#06b6d4',
      logoCrest: 'shield',
      portalTitle: 'Delhi Public Horizon',
      subdomain: 'horizon'
    };

    // School Admin customizes branding to Emerald STEM and custom title
    const customBranding = {
      brandThemeColor: '#059669',
      brandAccentColor: '#10b981',
      logoCrest: 'sparkles',
      portalTitle: 'Horizon STEM & AI World School',
      subdomain: 'dps-horizon',
      customDomain: 'portal.dpshorizon.edu.in',
      tagline: 'Empowering Young Innovators'
    };

    const updatedSchool = {
      ...school,
      ...customBranding
    };

    assert.strictEqual(updatedSchool.brandThemeColor, '#059669', 'Primary theme color must be updated to Emerald');
    assert.strictEqual(updatedSchool.brandAccentColor, '#10b981', 'Accent color must be updated');
    assert.strictEqual(updatedSchool.logoCrest, 'sparkles', 'Crest archetype must be updated');
    assert.strictEqual(updatedSchool.portalTitle, 'Horizon STEM & AI World School', 'Portal header title must be updated');
    assert.strictEqual(updatedSchool.subdomain, 'dps-horizon', 'Dedicated subdomain must be updated');
    assert.strictEqual(updatedSchool.customDomain, 'portal.dpshorizon.edu.in', 'Custom CNAME domain must be updated');
  });

  await t.test('7. Super Admin created school can login directly, but self-registered school requires Super Admin approval', () => {
    // 1. Super Admin created school (Active by default)
    const superAdminCreatedSchool = {
      id: 'school-super-01',
      code: 'SCH-DEL-778',
      name: 'Nirmaan Educational Campus',
      email: 'pankaj@nirmaan.org',
      isActive: true,
      onboardingStatus: 'ACTIVE',
      adminCredentials: {
        loginId: 'pankaj@nirmaan.org',
        email: 'pankaj@nirmaan.org',
        temporaryPassword: 'Pass@1653'
      }
    };

    // 2. Self-registered school (Requires Super Admin Approval)
    const selfRegisteredSchool = {
      id: 'school-self-02',
      code: 'SCH-MUM-445',
      name: 'St. Marys Academy',
      email: 'admin@stmarys.org',
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      adminCredentials: {
        loginId: 'admin@stmarys.org',
        email: 'admin@stmarys.org',
        temporaryPassword: 'Pass@9988'
      }
    };

    const candidateSchools = [superAdminCreatedSchool, selfRegisteredSchool];

    const authenticate = (rawId, pass) => {
      const normalized = rawId.trim().toLowerCase();
      const matched = candidateSchools.find(
        s => (s.adminCredentials?.loginId && s.adminCredentials.loginId.toLowerCase() === normalized) ||
             (s.adminCredentials?.email && s.adminCredentials.email.toLowerCase() === normalized) ||
             (s.email && s.email.toLowerCase() === normalized)
      );

      if (!matched) {
        return { success: false, error: 'No account found matching this identifier.' };
      }
      if (pass !== matched.adminCredentials?.temporaryPassword && pass !== 'password123') {
        return { success: false, error: 'Invalid password.' };
      }
      if (matched.onboardingStatus === 'PENDING_APPROVAL' || !matched.isActive) {
        return {
          success: false,
          error: `School registration for "${matched.name}" is pending approval by Super Admin. Please wait for verification before logging in.`,
          code: 'PENDING_APPROVAL'
        };
      }
      return { success: true, schoolName: matched.name, role: 'SCHOOL_ADMIN' };
    };

    // Case A: Super Admin created account logs in DIRECTLY without any approval
    const superAdminResult = authenticate('pankaj@nirmaan.org', 'Pass@1653');
    assert.strictEqual(superAdminResult.success, true, 'Super Admin created school must login directly');
    assert.strictEqual(superAdminResult.role, 'SCHOOL_ADMIN');
    assert.strictEqual(superAdminResult.schoolName, 'Nirmaan Educational Campus');

    // Case B: Self-registered account CANNOT login directly (Blocked pending approval)
    const selfRegisterResult = authenticate('admin@stmarys.org', 'Pass@9988');
    assert.strictEqual(selfRegisterResult.success, false, 'Self-registered school must not login before approval');
    assert.strictEqual(selfRegisterResult.code, 'PENDING_APPROVAL');

    // Case C: Super Admin approves the self-registered school
    selfRegisteredSchool.isActive = true;
    selfRegisteredSchool.onboardingStatus = 'ACTIVE';

    // Now self-registered school can log in directly!
    const approvedResult = authenticate('admin@stmarys.org', 'Pass@9988');
    assert.strictEqual(approvedResult.success, true, 'Once approved by Super Admin, login succeeds immediately');
    assert.strictEqual(approvedResult.role, 'SCHOOL_ADMIN');
  });
});


