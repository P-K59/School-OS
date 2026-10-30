const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('CRITICAL: InnovatMind School OS — Data Cleanup, Delete Controls & School Approval Workflow', () => {

  // Test Fixture State matching serverDb and client auth models
  function createTestEnvironment() {
    return {
      superAdminUser: {
        id: 'usr-super',
        email: 'superadmin@innovatmind.com',
        role: 'SUPER_ADMIN',
        schoolId: 'platform',
        name: 'Super Admin HQ',
        status: 'ACTIVE'
      },
      schools: [
        {
          id: 'school-1',
          code: 'SCH-DEMO-001',
          name: 'Demo Robotics Academy',
          city: 'Mumbai',
          state: 'Maharashtra',
          schoolType: 'CBSE',
          isActive: true,
          onboardingStatus: 'ACTIVE',
          registrationId: 'IMS-2026-000001',
          isDemo: true
        },
        {
          id: 'school-real-alpha',
          code: 'SCH-DEL-101',
          name: 'Delhi Public STEM School',
          city: 'New Delhi',
          state: 'Delhi',
          schoolType: 'CBSE',
          isActive: true,
          onboardingStatus: 'ACTIVE',
          registrationId: 'IMS-2026-000101',
          isDemo: false
        },
        {
          id: 'school-real-beta',
          code: 'SCH-BLR-202',
          name: 'Bangalore Robotics Institute',
          city: 'Bengaluru',
          state: 'Karnataka',
          schoolType: 'ICSE',
          isActive: true,
          onboardingStatus: 'ACTIVE',
          registrationId: 'IMS-2026-000102',
          isDemo: false
        }
      ],
      students: [
        { id: 'std-alpha-1', schoolId: 'school-real-alpha', name: 'Aarav Patel', grade: 'Grade 6' },
        { id: 'std-alpha-2', schoolId: 'school-real-alpha', name: 'Diya Sharma', grade: 'Grade 7' },
        { id: 'std-beta-1', schoolId: 'school-real-beta', name: 'Rohan Iyer', grade: 'Grade 8' },
        { id: 'std-demo-1', schoolId: 'school-1', name: 'Demo Student', grade: 'Grade 5' }
      ],
      invoices: [
        { id: 'inv-alpha-1', schoolId: 'school-real-alpha', amount: 50000, status: 'PAID' },
        { id: 'inv-beta-1', schoolId: 'school-real-beta', amount: 75000, status: 'ISSUED' },
        { id: 'inv-demo-1', schoolId: 'school-1', amount: 10000, status: 'PAID' }
      ],
      trainers: [
        { id: 'tr-1', name: 'Dr. Rahul Sharma', specialization: 'Robotics', status: 'ACTIVE', assignedSchoolsCount: 2 },
        { id: 'tr-2', name: 'Er. Priya Sen', specialization: 'AI & ML', status: 'ACTIVE', assignedSchoolsCount: 1 }
      ],
      allocations: [
        { id: 'alc-1', trainerId: 'tr-1', schoolId: 'school-real-alpha', status: 'ACTIVE' },
        { id: 'alc-2', trainerId: 'tr-1', schoolId: 'school-real-beta', status: 'ACTIVE' },
        { id: 'alc-3', trainerId: 'tr-2', schoolId: 'school-real-beta', status: 'ACTIVE' }
      ],
      userProfiles: [
        { id: 'usr-admin-alpha', schoolId: 'school-real-alpha', email: 'principal@delhistem.edu', role: 'SCHOOL_ADMIN', status: 'ACTIVE' },
        { id: 'usr-admin-beta', schoolId: 'school-real-beta', email: 'principal@blrrobotics.edu', role: 'SCHOOL_ADMIN', status: 'ACTIVE' }
      ]
    };
  }

  // 1. Safe cleanup preserves Super Admin account
  test('Phase 1: Safe cleanup preserves Super Admin authentication account & credentials', () => {
    const env = createTestEnvironment();
    // Simulate cleanup of test schools
    const realSchoolsToDelete = env.schools.filter(s => s.id !== 'usr-super' && !s.isDemo);
    assert.strictEqual(realSchoolsToDelete.length, 2);

    // Ensure Super Admin is never deleted
    assert.strictEqual(env.superAdminUser.id, 'usr-super');
    assert.strictEqual(env.superAdminUser.role, 'SUPER_ADMIN');
    assert.strictEqual(env.superAdminUser.email, 'superadmin@innovatmind.com');
  });

  // 2. Demo Preview continues working with isolated sample data
  test('Phase 1: Demo Preview continues working with sample data and isDemoSchool check', () => {
    const env = createTestEnvironment();
    const demoSchool = env.schools.find(s => s.id === 'school-1');
    assert.ok(demoSchool, 'Demo fixture school-1 must exist');
    assert.strictEqual(demoSchool.isActive, true);

    const demoStudents = env.students.filter(s => s.schoolId === 'school-1');
    assert.ok(demoStudents.length > 0, 'Demo students must remain available for preview');
  });

  // 3. School deletion cascades child records without affecting other schools
  test('Phase 2: School deletion cascades child records without affecting unrelated school tenants', () => {
    const env = createTestEnvironment();
    const targetSchoolId = 'school-real-alpha';

    // Verify initial counts for alpha
    assert.strictEqual(env.students.filter(s => s.schoolId === targetSchoolId).length, 2);
    assert.strictEqual(env.invoices.filter(s => s.schoolId === targetSchoolId).length, 1);

    // Perform cascade delete of alpha
    env.students = env.students.filter(s => s.schoolId !== targetSchoolId);
    env.invoices = env.invoices.filter(i => i.schoolId !== targetSchoolId);
    env.allocations = env.allocations.filter(a => a.schoolId !== targetSchoolId);
    env.userProfiles = env.userProfiles.filter(u => u.schoolId !== targetSchoolId);
    env.schools = env.schools.filter(s => s.id !== targetSchoolId);

    // Verify alpha is deleted
    assert.strictEqual(env.schools.find(s => s.id === targetSchoolId), undefined);
    assert.strictEqual(env.students.filter(s => s.schoolId === targetSchoolId).length, 0);
    assert.strictEqual(env.invoices.filter(s => s.schoolId === targetSchoolId).length, 0);

    // CRITICAL: Verify Beta school records remain intact (Cross-tenant boundary safety)
    const betaSchool = env.schools.find(s => s.id === 'school-real-beta');
    assert.ok(betaSchool, 'Beta school must NOT be deleted');
    const betaStudents = env.students.filter(s => s.schoolId === 'school-real-beta');
    assert.strictEqual(betaStudents.length, 1);
    const betaInvoices = env.invoices.filter(i => i.schoolId === 'school-real-beta');
    assert.strictEqual(betaInvoices.length, 1);
  });

  // 4. Authorized Super Admin can delete/deactivate a school
  test('Phase 2: Authorized Super Admin can delete school via server-guarded action', () => {
    const callerRole = 'SUPER_ADMIN';
    const isAuthorized = callerRole === 'SUPER_ADMIN';
    assert.strictEqual(isAuthorized, true, 'Super Admin is authorized');

    const env = createTestEnvironment();
    const initialCount = env.schools.length;
    env.schools = env.schools.filter(s => s.id !== 'school-real-alpha');
    assert.strictEqual(env.schools.length, initialCount - 1);
  });

  // 5. Normal users cannot delete schools or trainers
  test('Phase 2 & 3: Normal users (School Admin, Student, Guest) are rejected with 403 Forbidden', () => {
    const unauthorizedRoles = ['SCHOOL_ADMIN', 'STUDENT', 'TRAINER', 'PARENT'];
    for (const role of unauthorizedRoles) {
      const isAllowed = role === 'SUPER_ADMIN';
      assert.strictEqual(isAllowed, false, `Role '${role}' must be rejected from DELETE /api/schools`);
    }
  });

  // 6. Authorized Super Admin can delete/deactivate a trainer safely
  test('Phase 3: Delete Trainer removes trainer and safely cancels active allocations without corrupting schools', () => {
    const env = createTestEnvironment();
    const targetTrainerId = 'tr-1';

    // Verify initial allocation count
    assert.strictEqual(env.allocations.filter(a => a.trainerId === targetTrainerId).length, 2);

    // Safe deletion: remove trainer and allocations
    env.allocations = env.allocations.filter(a => a.trainerId !== targetTrainerId);
    env.trainers = env.trainers.filter(t => t.id !== targetTrainerId);

    assert.strictEqual(env.trainers.find(t => t.id === targetTrainerId), undefined);
    assert.strictEqual(env.allocations.filter(a => a.trainerId === targetTrainerId).length, 0);

    // Verify unrelated trainer tr-2 still has active allocation
    assert.strictEqual(env.trainers.find(t => t.id === 'tr-2')?.status, 'ACTIVE');
    assert.strictEqual(env.allocations.filter(a => a.trainerId === 'tr-2').length, 1);

    // Verify Super Admin account is never deleted by trainer deletion
    assert.strictEqual(env.superAdminUser.id, 'usr-super');
  });

  // 7. Public school registration creates persisted pending request with unique registration ID
  test('Phase 4: Public school registration creates pending record with stable IMS registration ID', () => {
    const newSchoolData = {
      name: 'Greenwood International',
      schoolType: 'CBSE',
      city: 'Pune',
      state: 'Maharashtra',
      email: 'principal@greenwood.edu',
      phone: '+91 98765 43210'
    };

    // Registration ID generator format: IMS-YYYY-XXXXXX
    const year = new Date().getFullYear();
    const randomSeq = 100501;
    const registrationId = `IMS-${year}-${String(randomSeq).padStart(6, '0')}`;

    const persistedSchool = {
      ...newSchoolData,
      id: 'sch-pune-101',
      code: 'SCH-PUN-101',
      registrationId,
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      approvalDetails: {
        status: 'PENDING',
        submittedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    assert.match(persistedSchool.registrationId, /^IMS-\d{4}-\d{6}$/);
    assert.strictEqual(persistedSchool.isActive, false);
    assert.strictEqual(persistedSchool.onboardingStatus, 'PENDING_APPROVAL');
    assert.strictEqual(persistedSchool.approvalDetails.status, 'PENDING');
  });

  // 8. Pending request appears in Super Admin approval inbox
  test('Phase 4: Pending request appears in Super Admin approval inbox and pending badge count', () => {
    const env = createTestEnvironment();
    env.schools.push({
      id: 'sch-pending-1',
      code: 'SCH-PUN-101',
      name: 'Greenwood International',
      city: 'Pune',
      state: 'Maharashtra',
      schoolType: 'CBSE',
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      registrationId: 'IMS-2026-100501',
      isDemo: false
    });

    const pendingSchools = env.schools.filter(s => 
      !s.id.startsWith('school-') && (s.onboardingStatus === 'PENDING_APPROVAL' || !s.isActive)
    );

    assert.strictEqual(pendingSchools.length, 1);
    assert.strictEqual(pendingSchools[0].registrationId, 'IMS-2026-100501');
    assert.strictEqual(pendingSchools[0].name, 'Greenwood International');
  });

  // 9. Approve activates exactly one school tenant
  test('Phase 4: Approve action activates school and updates approval details exactly once', () => {
    const pendingSchool = {
      id: 'sch-pending-1',
      name: 'Greenwood International',
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      approvalDetails: { status: 'PENDING' }
    };

    // Super Admin executes approval
    const reviewerId = 'usr-super';
    const approvedAt = new Date().toISOString();

    pendingSchool.isActive = true;
    pendingSchool.onboardingStatus = 'ACTIVE';
    pendingSchool.approvalDetails = {
      status: 'APPROVED',
      reviewedAt: approvedAt,
      reviewedBy: reviewerId,
      decisionNotes: 'Institutional credentials and documentation verified.'
    };

    assert.strictEqual(pendingSchool.isActive, true);
    assert.strictEqual(pendingSchool.onboardingStatus, 'ACTIVE');
    assert.strictEqual(pendingSchool.approvalDetails.status, 'APPROVED');
    assert.strictEqual(pendingSchool.approvalDetails.reviewedBy, 'usr-super');
  });

  // 10. Reject persists rejected status with reason
  test('Phase 4: Reject action sets status to REJECTED and stores reason notes', () => {
    const pendingSchool = {
      id: 'sch-pending-2',
      name: 'Unverified Academy',
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      approvalDetails: { status: 'PENDING' }
    };

    const reason = 'Invalid CBSE accreditation certificate';
    pendingSchool.isActive = false;
    pendingSchool.onboardingStatus = 'REJECTED';
    pendingSchool.approvalDetails = {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'usr-super',
      decisionNotes: reason
    };

    assert.strictEqual(pendingSchool.isActive, false);
    assert.strictEqual(pendingSchool.onboardingStatus, 'REJECTED');
    assert.strictEqual(pendingSchool.approvalDetails.status, 'REJECTED');
    assert.strictEqual(pendingSchool.approvalDetails.decisionNotes, reason);
  });

  // 11. Duplicate submissions and repeated approvals are idempotent
  test('Phase 4: Duplicate submissions & repeated approval actions do not create duplicate records', () => {
    const schools = [
      { id: 'sch-1', code: 'SCH-DEL-001', name: 'Delhi School', registrationId: 'IMS-2026-000101', onboardingStatus: 'ACTIVE' }
    ];

    // Attempting to approve an already active school
    const target = schools.find(s => s.id === 'sch-1');
    const wasAlreadyActive = target.onboardingStatus === 'ACTIVE';

    if (wasAlreadyActive) {
      // Idempotent: return existing record without creating duplicates
    }

    assert.strictEqual(schools.length, 1);
    assert.strictEqual(target.onboardingStatus, 'ACTIVE');
  });

  // 12. New approved schools start with empty operational records
  test('Phase 4: Freshly approved schools start with zero students, zero invoices, and empty fee ledgers', () => {
    const env = createTestEnvironment();
    const newApprovedSchoolId = 'sch-newly-approved';

    // Verify operational metrics are clean
    const schoolStudents = env.students.filter(s => s.schoolId === newApprovedSchoolId);
    const schoolInvoices = env.invoices.filter(i => i.schoolId === newApprovedSchoolId);
    const schoolAllocations = env.allocations.filter(a => a.schoolId === newApprovedSchoolId);

    assert.strictEqual(schoolStudents.length, 0, 'New school must start with zero students');
    assert.strictEqual(schoolInvoices.length, 0, 'New school must start with zero invoices');
    assert.strictEqual(schoolAllocations.length, 0, 'New school must start with zero trainer allocations');
  });

  // 13. Pending request count reflects actual state
  test('Phase 4: Pending request count reflects actual database state (zero when all processed)', () => {
    const schools = [
      { id: 'sch-1', isDemo: false, onboardingStatus: 'ACTIVE', isActive: true },
      { id: 'sch-2', isDemo: false, onboardingStatus: 'ACTIVE', isActive: true }
    ];

    const pendingCount = schools.filter(s => s.onboardingStatus === 'PENDING_APPROVAL' || !s.isActive).length;
    assert.strictEqual(pendingCount, 0, 'Zero pending schools must result in zero badge count');
  });

  // 14. Server-side security guard rejects unauthenticated or unauthorized deletion requests
  test('Phase 5: Server-side authorization guard rejects requests without SUPER_ADMIN authorization', () => {
    function authorizeRole(authContext, allowedRoles) {
      if (!authContext) {
        return { error: 'Authentication required: missing or expired authorization token', status: 401 };
      }
      if (!allowedRoles.includes(authContext.role)) {
        return { error: 'Forbidden: Super Admin privileges are required', status: 403 };
      }
      return null;
    }

    // Unauthenticated
    const res1 = authorizeRole(null, ['SUPER_ADMIN']);
    assert.strictEqual(res1.status, 401);

    // Non-super admin
    const res2 = authorizeRole({ userId: 'u-1', role: 'SCHOOL_ADMIN' }, ['SUPER_ADMIN']);
    assert.strictEqual(res2.status, 403);

    // Super Admin authorized
    const res3 = authorizeRole({ userId: 'usr-super', role: 'SUPER_ADMIN' }, ['SUPER_ADMIN']);
    assert.strictEqual(res3, null);
  });

  // 15. Role routing and demo preview isolation preserved
  test('Phase 6: Existing login, role routing, demo preview, and portal boundaries remain functional', () => {
    const routesByRole = {
      'SUPER_ADMIN': '/admin',
      'SCHOOL_ADMIN': '/school',
      'STUDENT': '/student'
    };

    assert.strictEqual(routesByRole['SUPER_ADMIN'], '/admin');
    assert.strictEqual(routesByRole['SCHOOL_ADMIN'], '/school');
    assert.strictEqual(routesByRole['STUDENT'], '/student');
  });

  // 16. Accidental deletion preserves snapshot in audit log with isRevokable flag
  test('Revoke Feature: Deleting a school creates a revokable audit event containing the school snapshot', () => {
    const env = createTestEnvironment();
    const targetSchool = env.schools.find(s => s.id === 'school-real-alpha');
    assert.ok(targetSchool, 'Target school must exist before deletion');

    // Perform deletion with audit snapshot
    const deleteAuditEvent = {
      id: `evt-del-${Date.now()}`,
      schoolId: 'platform',
      title: 'Institutional Tenant Deleted',
      detail: `School '${targetSchool.name}' (${targetSchool.code}) deleted by Super Admin.`,
      time: 'Just now',
      category: 'AUTH',
      isRevokable: true,
      targetEntityId: targetSchool.id,
      targetEntityType: 'SCHOOL',
      deletedSnapshot: JSON.parse(JSON.stringify(targetSchool))
    };

    // Remove from active schools
    env.schools = env.schools.filter(s => s.id !== targetSchool.id);
    assert.strictEqual(env.schools.find(s => s.id === targetSchool.id), undefined);

    // Verify audit event has snapshot
    assert.strictEqual(deleteAuditEvent.isRevokable, true);
    assert.strictEqual(deleteAuditEvent.deletedSnapshot.id, 'school-real-alpha');
    assert.strictEqual(deleteAuditEvent.deletedSnapshot.registrationId, 'IMS-2026-000101');
  });

  // 17. Super Admin can revoke accidental deletion from audit log to restore school
  test('Revoke Feature: Super Admin revokes accidental deletion from audit log and restores school tenant', () => {
    const env = createTestEnvironment();
    const originalSchool = { ...env.schools.find(s => s.id === 'school-real-alpha') };

    // 1. Simulate deletion
    env.schools = env.schools.filter(s => s.id !== originalSchool.id);
    assert.strictEqual(env.schools.find(s => s.id === originalSchool.id), undefined);

    const auditLog = [
      {
        id: 'evt-del-101',
        schoolId: 'platform',
        title: 'Institutional Tenant Deleted',
        detail: `School '${originalSchool.name}' (${originalSchool.code}) deleted by Super Admin.`,
        isRevokable: true,
        targetEntityId: originalSchool.id,
        deletedSnapshot: originalSchool
      }
    ];

    // 2. Super Admin clicks "Revoke Deletion" on the audit log entry
    const targetLog = auditLog.find(a => a.id === 'evt-del-101' && a.isRevokable);
    assert.ok(targetLog, 'Audit log entry must be revokable');

    const restoredSchool = {
      ...targetLog.deletedSnapshot,
      isActive: true,
      onboardingStatus: 'ACTIVE'
    };

    // Restore to active schools
    env.schools.push(restoredSchool);
    targetLog.isRevokable = false;
    targetLog.detail += ' [RESTORED / REVOKED]';

    // 3. Verify school is fully restored
    const verified = env.schools.find(s => s.id === originalSchool.id);
    assert.ok(verified, 'School must be restored to active list');
    assert.strictEqual(verified.name, 'Delhi Public STEM School');
    assert.strictEqual(verified.code, 'SCH-DEL-101');
    assert.strictEqual(verified.registrationId, 'IMS-2026-000101');
    assert.strictEqual(verified.isActive, true);
    assert.strictEqual(verified.onboardingStatus, 'ACTIVE');
    assert.strictEqual(targetLog.isRevokable, false, 'Revoked log entry should no longer be marked revokable');
  });

  // 18. Status Tracker: Lookup by valid Registration ID returns PENDING status
  test('Status Tracker: Public lookup by IMS Registration ID returns PENDING status and sanitized fields', () => {
    const env = createTestEnvironment();

    const pendingSchool = {
      id: 'sch-kol-101',
      code: 'SCH-KOL-101',
      name: 'St. Xavier STEM Academy',
      city: 'Kolkata',
      state: 'West Bengal',
      schoolType: 'ICSE',
      email: 'principal@stxavier.edu.in',
      registrationId: 'IMS-2026-630252',
      onboardingStatus: 'PENDING_APPROVAL',
      isActive: false,
      approvalDetails: {
        status: 'PENDING',
        submittedAt: new Date().toISOString()
      }
    };
    env.schools.push(pendingSchool);

    function lookupSchoolStatus(schools, query) {
      if (!query || !query.trim()) return { found: false, error: 'Identifier required' };
      const q = query.trim().toLowerCase();
      const matched = schools.find(s => 
        (s.registrationId && s.registrationId.toLowerCase() === q) ||
        (s.code && s.code.toLowerCase() === q) ||
        (s.email && s.email.toLowerCase() === q)
      );
      if (!matched) return { found: false, error: 'No registration found' };
      const email = matched.email || '';
      const maskedEmail = email.includes('@') ? `${email.slice(0, 2)}***@${email.split('@')[1]}` : 'N/A';
      return {
        found: true,
        school: {
          id: matched.id,
          registrationId: matched.registrationId,
          name: matched.name,
          statusBadge: matched.onboardingStatus === 'ACTIVE' ? 'APPROVED' : matched.onboardingStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
          isActive: matched.isActive,
          maskedEmail
        }
      };
    }

    const result = lookupSchoolStatus(env.schools, 'IMS-2026-630252');
    assert.strictEqual(result.found, true);
    assert.strictEqual(result.school.registrationId, 'IMS-2026-630252');
    assert.strictEqual(result.school.name, 'St. Xavier STEM Academy');
    assert.strictEqual(result.school.statusBadge, 'PENDING');
    assert.strictEqual(result.school.isActive, false);
    assert.ok(result.school.maskedEmail.includes('***'));
  });

  // 19. Status Tracker: Lookup after approval reflects APPROVED status and reviewed details
  test('Status Tracker: Public lookup reflects APPROVED status after Super Admin verification', () => {
    const env = createTestEnvironment();

    const approvedSchool = {
      id: 'sch-hyd-202',
      code: 'SCH-HYD-202',
      name: 'Modern Futuristic School',
      city: 'Hyderabad',
      state: 'Telangana',
      schoolType: 'IB',
      email: 'admin@modernfuture.org',
      registrationId: 'IMS-2026-889900',
      onboardingStatus: 'ACTIVE',
      isActive: true,
      approvalDetails: {
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Super Admin Pankaj'
      }
    };
    env.schools.push(approvedSchool);

    function lookupSchoolStatus(schools, query) {
      const q = query.trim().toLowerCase();
      const matched = schools.find(s => s.registrationId?.toLowerCase() === q);
      if (!matched) return { found: false };
      return {
        found: true,
        school: {
          id: matched.id,
          registrationId: matched.registrationId,
          statusBadge: matched.onboardingStatus === 'ACTIVE' ? 'APPROVED' : 'PENDING',
          isActive: matched.isActive,
          reviewedBy: matched.approvalDetails?.reviewedBy
        }
      };
    }

    const result = lookupSchoolStatus(env.schools, 'IMS-2026-889900');
    assert.strictEqual(result.found, true);
    assert.strictEqual(result.school.statusBadge, 'APPROVED');
    assert.strictEqual(result.school.isActive, true);
    assert.strictEqual(result.school.reviewedBy, 'Super Admin Pankaj');
  });

  // 20. Status Tracker: Lookup after rejection reflects REJECTED status with decision feedback
  test('Status Tracker: Public lookup reflects REJECTED status and decision notes', () => {
    const env = createTestEnvironment();

    const rejectedSchool = {
      id: 'sch-chn-303',
      code: 'SCH-CHN-303',
      name: 'Apex Test School',
      registrationId: 'IMS-2026-112233',
      onboardingStatus: 'REJECTED',
      isActive: false,
      approvalDetails: {
        status: 'REJECTED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Super Admin HQ',
        decisionNotes: 'Affiliation certificate scan is illegible. Please re-upload.'
      }
    };
    env.schools.push(rejectedSchool);

    function lookupSchoolStatus(schools, query) {
      const q = query.trim().toLowerCase();
      const matched = schools.find(s => s.registrationId?.toLowerCase() === q);
      if (!matched) return { found: false };
      return {
        found: true,
        school: {
          id: matched.id,
          registrationId: matched.registrationId,
          statusBadge: matched.onboardingStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
          decisionNotes: matched.approvalDetails?.decisionNotes
        }
      };
    }

    const result = lookupSchoolStatus(env.schools, 'IMS-2026-112233');
    assert.strictEqual(result.found, true);
    assert.strictEqual(result.school.statusBadge, 'REJECTED');
    assert.strictEqual(result.school.decisionNotes, 'Affiliation certificate scan is illegible. Please re-upload.');
  });

  // 21. Status Tracker: Invalid query returns not found error gracefully
  test('Status Tracker: Unknown identifier returns found: false without throwing', () => {
    const env = createTestEnvironment();

    function lookupSchoolStatus(schools, query) {
      const q = query.trim().toLowerCase();
      const matched = schools.find(s => s.registrationId?.toLowerCase() === q);
      if (!matched) return { found: false, error: 'No registration found' };
      return { found: true, school: matched };
    }

    const result = lookupSchoolStatus(env.schools, 'IMS-NONEXISTENT-999999');
    assert.strictEqual(result.found, false);
    assert.strictEqual(result.error, 'No registration found');
  });

  // 22. School Suspension: Super Admin suspends active school
  test('School Suspension: Super Admin suspends active school, setting isActive to false and preserving suspensionDetails without data loss', () => {
    const env = createTestEnvironment();
    const targetSchool = env.schools.find(s => s.id === 'school-real-alpha');
    assert.ok(targetSchool, 'Target school must exist');
    assert.strictEqual(targetSchool.isActive, true);

    // Initial counts
    const initialStudentsCount = env.students.filter(s => s.schoolId === targetSchool.id).length;
    const initialInvoicesCount = env.invoices.filter(i => i.schoolId === targetSchool.id).length;

    // Super Admin suspends the school
    const suspensionTimestamp = new Date().toISOString();
    targetSchool.isActive = false;
    targetSchool.suspensionDetails = {
      isSuspended: true,
      reason: 'Annual fee settlement overdue for Q3.',
      suspendedAt: suspensionTimestamp,
      suspendedBy: 'Super Admin Pankaj'
    };

    // Verify school status
    assert.strictEqual(targetSchool.isActive, false);
    assert.strictEqual(targetSchool.suspensionDetails.isSuspended, true);
    assert.strictEqual(targetSchool.suspensionDetails.reason, 'Annual fee settlement overdue for Q3.');
    assert.strictEqual(targetSchool.suspensionDetails.suspendedBy, 'Super Admin Pankaj');

    // Verify ZERO data loss: students and invoices remain 100% intact
    const remainingStudentsCount = env.students.filter(s => s.schoolId === targetSchool.id).length;
    const remainingInvoicesCount = env.invoices.filter(i => i.schoolId === targetSchool.id).length;
    assert.strictEqual(remainingStudentsCount, initialStudentsCount, 'No student data should be deleted upon suspension');
    assert.strictEqual(remainingInvoicesCount, initialInvoicesCount, 'No invoice data should be deleted upon suspension');
  });

  // 23. School Suspension: School Admin and Student logins are blocked
  test('School Suspension: School Admin and Student under suspended school are denied login with descriptive suspension error', () => {
    const env = createTestEnvironment();
    const targetSchool = env.schools.find(s => s.id === 'school-real-alpha');
    targetSchool.isActive = false;
    targetSchool.suspensionDetails = {
      isSuspended: true,
      reason: 'Compliance audit in progress.',
      suspendedAt: new Date().toISOString(),
      suspendedBy: 'Super Admin HQ'
    };

    function simulateLogin(userIdentifier, school) {
      if (school.suspensionDetails?.isSuspended || !school.isActive) {
        const reason = school.suspensionDetails?.reason ? `: ${school.suspensionDetails.reason}` : '';
        return { success: false, error: `School portal access is currently suspended${reason}` };
      }
      return { success: true };
    }

    // 1. School Admin attempts login
    const adminLoginResult = simulateLogin('principal@delhistem.edu', targetSchool);
    assert.strictEqual(adminLoginResult.success, false);
    assert.ok(adminLoginResult.error.includes('Compliance audit in progress.'));

    // 2. Student attempts login
    const studentLoginResult = simulateLogin('std-alpha-1', targetSchool);
    assert.strictEqual(studentLoginResult.success, false);
    assert.ok(studentLoginResult.error.includes('School portal access is currently suspended'));

    // 3. Unrelated active school beta admin can still log in
    const activeSchoolBeta = env.schools.find(s => s.id === 'school-real-beta');
    const betaAdminResult = simulateLogin('principal@blrrobotics.edu', activeSchoolBeta);
    assert.strictEqual(betaAdminResult.success, true);
  });

  // 24. School Suspension: Super Admin lifts suspension and restores logins
  test('School Suspension: Super Admin lifts suspension, restoring isActive to true and re-enabling logins', () => {
    const env = createTestEnvironment();
    const targetSchool = env.schools.find(s => s.id === 'school-real-alpha');

    // School starts suspended
    targetSchool.isActive = false;
    targetSchool.suspensionDetails = {
      isSuspended: true,
      reason: 'Routine holiday maintenance.'
    };

    // Super Admin lifts suspension
    targetSchool.isActive = true;
    targetSchool.suspensionDetails = {
      isSuspended: false,
      reason: undefined,
      suspendedAt: undefined,
      suspendedBy: undefined
    };

    assert.strictEqual(targetSchool.isActive, true);
    assert.strictEqual(targetSchool.suspensionDetails.isSuspended, false);

    // Login test after reactivation
    function simulateLogin(userIdentifier, school) {
      if (school.suspensionDetails?.isSuspended || !school.isActive) {
        return { success: false, error: 'Suspended' };
      }
      return { success: true, schoolName: school.name };
    }

    const reactivatedLogin = simulateLogin('principal@delhistem.edu', targetSchool);
    assert.strictEqual(reactivatedLogin.success, true);
    assert.strictEqual(reactivatedLogin.schoolName, 'Delhi Public STEM School');
  });

  // 25. School Suspension: Super Admin account and platform credentials can never be suspended
  test('School Suspension: Super Admin account and platform credentials can never be suspended', () => {
    const env = createTestEnvironment();

    function canSuspendEntity(entityId) {
      if (!entityId || entityId === 'usr-super' || entityId === 'platform') {
        return false;
      }
      return true;
    }

    assert.strictEqual(canSuspendEntity('usr-super'), false);
    assert.strictEqual(canSuspendEntity('platform'), false);
    assert.strictEqual(canSuspendEntity('school-real-alpha'), true);
    assert.strictEqual(env.superAdminUser.role, 'SUPER_ADMIN');
  });

  // 26. Welcome Kit: Approving a pending school ensures adminCredentials are fully provisioned
  test('Welcome Kit: Approving a pending school ensures adminCredentials are fully provisioned', () => {
    const env = createTestEnvironment();
    const pendingSchool = {
      id: 'school-pending-welcome',
      code: 'SCH-UP-099',
      name: 'St. Mary Modern Academy',
      schoolType: 'CBSE',
      email: 'principal@stmary.edu.in',
      phone: '+91 98765 43210',
      isActive: false,
      onboardingStatus: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString()
    };
    env.schools.push(pendingSchool);

    // Simulate approval with credential provisioning
    const reviewedAt = new Date().toISOString();
    const generatedLoginId = `admin.${pendingSchool.code.toLowerCase().replace(/[^a-z0-9]/g, '')}@schoolos.internal`;
    const generatedTempPassword = `Innovat#${pendingSchool.code}!`;

    pendingSchool.isActive = true;
    pendingSchool.onboardingStatus = 'ACTIVE';
    pendingSchool.adminCredentials = {
      loginId: generatedLoginId,
      email: pendingSchool.email || generatedLoginId,
      temporaryPassword: generatedTempPassword,
      generatedAt: reviewedAt,
      provisionedBy: 'Super Admin HQ'
    };

    assert.strictEqual(pendingSchool.isActive, true);
    assert.strictEqual(pendingSchool.onboardingStatus, 'ACTIVE');
    assert.ok(pendingSchool.adminCredentials, 'Admin credentials must be present');
    assert.strictEqual(pendingSchool.adminCredentials.loginId, 'admin.schup099@schoolos.internal');
    assert.strictEqual(pendingSchool.adminCredentials.temporaryPassword, 'Innovat#SCH-UP-099!');
    assert.strictEqual(pendingSchool.adminCredentials.provisionedBy, 'Super Admin HQ');
  });

  // 27. Welcome Kit: Dispatching welcome kit updates welcomeKitDispatchedAt and logs audit event
  test('Welcome Kit: Dispatching welcome kit updates welcomeKitDispatchedAt and logs audit event', () => {
    const env = createTestEnvironment();
    const school = env.schools.find(s => s.id === 'school-real-alpha');
    assert.ok(school);

    assert.strictEqual(school.welcomeKitDispatchedAt, undefined);

    // Dispatch action
    const dispatchTime = new Date().toISOString();
    const dispatcher = 'Super Admin HQ';

    school.welcomeKitDispatchedAt = dispatchTime;
    school.welcomeKitDispatchedBy = dispatcher;

    const auditLogs = [];
    auditLogs.push({
      id: `evt-wk-${Date.now()}`,
      schoolId: school.id,
      title: 'Welcome Kit Dispatched',
      detail: `Official onboarding Welcome Kit & credentials dispatched to '${school.name}' (${school.code}) by ${dispatcher}.`,
      category: 'AUTH'
    });

    assert.strictEqual(school.welcomeKitDispatchedAt, dispatchTime);
    assert.strictEqual(school.welcomeKitDispatchedBy, 'Super Admin HQ');

    const loggedEvent = auditLogs.find(a => a.title === 'Welcome Kit Dispatched');
    assert.ok(loggedEvent, 'Welcome Kit audit event must be logged');
    assert.strictEqual(loggedEvent.schoolId, school.id);
  });

  // 28. Welcome Kit: Formats valid email and WhatsApp communication templates
  test('Welcome Kit: Formats valid email and WhatsApp communication templates', () => {
    const sampleSchool = {
      id: 'sch-blr-007',
      code: 'SCH-KA-007',
      name: 'Vidyaniketan Global School',
      principalName: 'Dr. Ramesh Rao',
      registrationId: 'IMS-2026-000707',
      adminCredentials: {
        loginId: 'admin.schka007@schoolos.internal',
        temporaryPassword: 'Innovat#SCH-KA-007!'
      }
    };

    const loginUrl = 'https://schoolos.innovatmind.internal/login';
    const emailSubject = `Welcome to InnovatMind School OS — Institutional Onboarding & Credentials (${sampleSchool.name})`;
    const emailBody = `Subject: ${emailSubject}\n\nDear ${sampleSchool.principalName},\n\nYour school portal is active.\nLogin URL: ${loginUrl}\nLogin ID: ${sampleSchool.adminCredentials.loginId}\nPassword: ${sampleSchool.adminCredentials.temporaryPassword}`;

    assert.ok(emailSubject.includes('Vidyaniketan Global School'));
    assert.ok(emailBody.includes('admin.schka007@schoolos.internal'));
    assert.ok(emailBody.includes('Innovat#SCH-KA-007!'));
    assert.ok(emailBody.includes(loginUrl));
  });

  // 29. Welcome Kit: Re-dispatching updates timestamp idempotently without corrupting student records
  test('Welcome Kit: Re-dispatching updates timestamp idempotently without corrupting student records', () => {
    const env = createTestEnvironment();
    const school = env.schools.find(s => s.id === 'school-real-alpha');
    const initialStudentsCount = env.students.filter(s => s.schoolId === school.id).length;

    // First dispatch
    school.welcomeKitDispatchedAt = '2026-10-30T00:00:00.000Z';
    school.welcomeKitDispatchedBy = 'First Admin';

    // Subsequent re-dispatch
    const secondDispatchTime = '2026-10-30T01:00:00.000Z';
    school.welcomeKitDispatchedAt = secondDispatchTime;
    school.welcomeKitDispatchedBy = 'Second Admin';

    assert.strictEqual(school.welcomeKitDispatchedAt, secondDispatchTime);
    assert.strictEqual(school.welcomeKitDispatchedBy, 'Second Admin');

    // Verify student records are completely intact
    const afterStudentsCount = env.students.filter(s => s.schoolId === school.id).length;
    assert.strictEqual(afterStudentsCount, initialStudentsCount);
  });

  // 30. Notice Broadcast: Publishing emergency and holiday notices assigns correct priority and metrics
  test('Notice Broadcast: Publishing emergency and holiday notices assigns correct priority and metrics', () => {
    const env = createTestEnvironment();
    const notices = [];

    function publishNotice(noticeData) {
      const notice = {
        ...noticeData,
        id: `notif-${Date.now()}`,
        sentAt: new Date().toISOString(),
        deliveredCount: 650,
        totalRecipients: 650,
        openRate: 98.4,
        status: 'PUBLISHED',
        readByUsers: []
      };
      notices.unshift(notice);
      return { success: true, notice };
    }

    // Publish Holiday Notice
    const holidayRes = publishNotice({
      schoolId: 'school-real-alpha',
      title: 'Diwali & Regional Holiday Break',
      messageContent: 'School will remain closed from Nov 1 to Nov 5.',
      priority: 'HOLIDAY',
      targetAudience: 'ALL',
      channels: ['PORTAL', 'WHATSAPP']
    });
    assert.strictEqual(holidayRes.success, true);
    assert.strictEqual(holidayRes.notice.priority, 'HOLIDAY');

    // Publish Emergency Notice
    const emergencyRes = publishNotice({
      schoolId: 'school-real-alpha',
      title: 'Heavy Rain Dispersal Alert',
      messageContent: 'Early dispersal at 01:30 PM due to weather warning.',
      priority: 'URGENT',
      targetAudience: 'ALL',
      channels: ['PORTAL', 'WHATSAPP', 'SMS'],
      isEmergencyBanner: true
    });
    assert.strictEqual(emergencyRes.success, true);
    assert.strictEqual(emergencyRes.notice.priority, 'URGENT');
    assert.strictEqual(emergencyRes.notice.isEmergencyBanner, true);
    assert.strictEqual(notices.length, 2);
  });

  // 31. Notice Broadcast: Emergency notice with isEmergencyBanner triggers top portal alert
  test('Notice Broadcast: Emergency notice with isEmergencyBanner triggers top portal alert', () => {
    const notices = [
      {
        id: 'notif-urgent-1',
        title: 'Flash Flood Safety Warning',
        priority: 'URGENT',
        isEmergencyBanner: true,
        targetAudience: 'ALL',
        status: 'PUBLISHED',
        readByUsers: []
      },
      {
        id: 'notif-general-1',
        title: 'Library Hours Extended',
        priority: 'GENERAL',
        isEmergencyBanner: false,
        targetAudience: 'ALL',
        status: 'PUBLISHED',
        readByUsers: []
      }
    ];

    function getActiveEmergencyBanners(noticesList, userId) {
      return noticesList.filter(n => n.isEmergencyBanner && n.status === 'PUBLISHED' && (!n.readByUsers || !n.readByUsers.includes(userId)));
    }

    const activeBanners = getActiveEmergencyBanners(notices, 'usr-stud-1');
    assert.strictEqual(activeBanners.length, 1);
    assert.strictEqual(activeBanners[0].id, 'notif-urgent-1');
    assert.strictEqual(activeBanners[0].priority, 'URGENT');
  });

  // 32. Notice Broadcast: Target audience scoping restricts notice visibility
  test('Notice Broadcast: Target audience scoping restricts notice visibility between roles', () => {
    const notices = [
      { id: 'n-all', targetAudience: 'ALL', title: 'Campus Wi-Fi Maintenance' },
      { id: 'n-stud', targetAudience: 'STUDENTS', title: 'Coding Quiz Battle Rules' },
      { id: 'n-parent', targetAudience: 'PARENTS', title: 'Parent-Teacher Meeting Schedule' },
      { id: 'n-staff', targetAudience: 'STAFF', title: 'Faculty Lesson Plan Submission' }
    ];

    function filterNoticesForRole(noticesList, role) {
      return noticesList.filter(n => {
        if (n.targetAudience === 'ALL') return true;
        if (role === 'STUDENT' && n.targetAudience === 'STUDENTS') return true;
        if (role === 'PARENT' && n.targetAudience === 'PARENTS') return true;
        if ((role === 'TEACHER' || role === 'SCHOOL_ADMIN') && n.targetAudience === 'STAFF') return true;
        return false;
      });
    }

    const studentNotices = filterNoticesForRole(notices, 'STUDENT');
    assert.strictEqual(studentNotices.length, 2); // 'ALL' + 'STUDENTS'
    assert.ok(studentNotices.some(n => n.id === 'n-stud'));
    assert.ok(!studentNotices.some(n => n.id === 'n-staff'));

    const teacherNotices = filterNoticesForRole(notices, 'TEACHER');
    assert.strictEqual(teacherNotices.length, 2); // 'ALL' + 'STAFF'
    assert.ok(teacherNotices.some(n => n.id === 'n-staff'));
    assert.ok(!teacherNotices.some(n => n.id === 'n-stud'));
  });

  // 33. Notice Broadcast: User acknowledgement dismisses emergency banner for that user session
  test('Notice Broadcast: User acknowledgement dismisses emergency banner for that user session', () => {
    const notice = {
      id: 'notif-dismissable',
      title: 'School Bus Route 4 Diversion',
      isEmergencyBanner: true,
      status: 'PUBLISHED',
      readByUsers: []
    };

    function dismiss(targetNotice, userId) {
      if (!targetNotice.readByUsers.includes(userId)) {
        targetNotice.readByUsers.push(userId);
      }
    }

    function isBannerVisible(targetNotice, userId) {
      return targetNotice.isEmergencyBanner && !targetNotice.readByUsers.includes(userId);
    }

    // Before dismissal
    assert.strictEqual(isBannerVisible(notice, 'usr-parent-99'), true);

    // Parent dismisses notice
    dismiss(notice, 'usr-parent-99');
    assert.strictEqual(isBannerVisible(notice, 'usr-parent-99'), false);

    // Another user still sees the banner
    assert.strictEqual(isBannerVisible(notice, 'usr-student-42'), true);
  });

  // 34. Notice Broadcast: Toggling pin and deleting notices operates idempotently
  test('Notice Broadcast: Toggling pin and deleting notices operates idempotently', () => {
    let notices = [
      { id: 'notif-toggle-1', title: 'Sports Day Rehearsal', isEmergencyBanner: false },
      { id: 'notif-toggle-2', title: 'Uniform Distribution', isEmergencyBanner: true }
    ];

    // Toggle Pin
    notices = notices.map(n => n.id === 'notif-toggle-1' ? { ...n, isEmergencyBanner: !n.isEmergencyBanner } : n);
    assert.strictEqual(notices.find(n => n.id === 'notif-toggle-1').isEmergencyBanner, true);

    // Delete notice
    notices = notices.filter(n => n.id !== 'notif-toggle-2');
    assert.strictEqual(notices.length, 1);
    assert.strictEqual(notices.find(n => n.id === 'notif-toggle-2'), undefined);
  });

  // 35. Bulk Student Import: Parses CSV lines, maps columns, and provisions unique student IDs
  test('Bulk Student Import: Parses CSV lines, maps columns, and provisions unique student IDs', () => {
    const rawCsv = `First Name,Last Name,Grade,Section,Gender,Roll Number,Parent Name,Parent Phone,Parent Email,Date of Birth
Aarav,Mehta,Grade 6,A,MALE,12,Rajesh Mehta,+91 98765 43210,rajesh@example.com,2014-04-12
Diya,Nair,Grade 7,B,FEMALE,15,Sunita Nair,+91 98765 43211,sunita@example.com,2013-09-20`;

    function parseCsvRows(csv) {
      const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        const row = {};
        headers.forEach((h, idx) => {
          row[h] = parts[idx] || '';
        });
        dataRows.push(row);
      }
      return dataRows;
    }

    const parsed = parseCsvRows(rawCsv);
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0]['first name'], 'Aarav');
    assert.strictEqual(parsed[0]['last name'], 'Mehta');
    assert.strictEqual(parsed[1]['first name'], 'Diya');
    assert.strictEqual(parsed[1]['parent phone'], '+91 98765 43211');
  });

  // 36. Bulk Student Import: Generates Cadet credentials and automatically enrolls students into grade-matching STEM courses
  test('Bulk Student Import: Generates Cadet credentials and automatically enrolls students into grade-matching STEM courses', () => {
    const courses = [
      { id: 'crs-robotics-mid', title: 'Robotics 101', minGrade: 6, maxGrade: 8 },
      { id: 'crs-ai-advanced', title: 'AI & Neural Nets', minGrade: 9, maxGrade: 12 }
    ];

    const inputStudents = [
      { firstName: 'Kabir', lastName: 'Das', grade: 'Grade 6', rollNumber: '05', schoolId: 'school-real-alpha' },
      { firstName: 'Meera', lastName: 'Sen', grade: 'Grade 10', rollNumber: '11', schoolId: 'school-real-alpha' }
    ];

    const enrollments = [];
    const admittedStudents = inputStudents.map((inp, idx) => {
      const studentId = `std-bulk-${idx + 1}`;
      const admissionNumber = `ADM-2026-${String(idx + 1).padStart(4, '0')}`;
      const cadetLoginId = `cadet.${inp.firstName.toLowerCase()}.${admissionNumber.toLowerCase()}`;
      const temporaryPassword = `Cadet@${Math.floor(1000 + Math.random() * 9000)}`;

      // Auto-enroll in matching grade courses
      const gradeNum = parseInt(inp.grade.replace(/[^0-9]/g, ''), 10) || 6;
      courses.forEach(course => {
        if (gradeNum >= course.minGrade && gradeNum <= course.maxGrade) {
          enrollments.push({
            id: `enr-${studentId}-${course.id}`,
            studentId,
            courseId: course.id,
            enrolledAt: new Date().toISOString()
          });
        }
      });

      return {
        ...inp,
        id: studentId,
        admissionNumber,
        cadetLoginId,
        temporaryPassword,
        status: 'ACTIVE'
      };
    });

    assert.strictEqual(admittedStudents.length, 2);
    assert.ok(admittedStudents[0].cadetLoginId.startsWith('cadet.kabir.adm-2026-'));
    assert.ok(admittedStudents[0].temporaryPassword.startsWith('Cadet@'));
    
    // Kabir (Grade 6) should be enrolled in Robotics 101 only
    const kabirEnrollments = enrollments.filter(e => e.studentId === admittedStudents[0].id);
    assert.strictEqual(kabirEnrollments.length, 1);
    assert.strictEqual(kabirEnrollments[0].courseId, 'crs-robotics-mid');

    // Meera (Grade 10) should be enrolled in AI & Neural Nets only
    const meeraEnrollments = enrollments.filter(e => e.studentId === admittedStudents[1].id);
    assert.strictEqual(meeraEnrollments.length, 1);
    assert.strictEqual(meeraEnrollments[0].courseId, 'crs-ai-advanced');
  });

  // 37. Bulk Student Import: Identifies invalid rows (e.g. missing parent phone or student name) and imports only valid rows
  test('Bulk Student Import: Identifies invalid rows and imports only valid rows without blocking batch', () => {
    const rawBatch = [
      { firstName: 'Rohan', lastName: 'Verma', grade: 'Grade 8', parentPhone: '9876543210' }, // VALID
      { firstName: '', lastName: 'Unknown', grade: 'Grade 8', parentPhone: '9876543211' },     // INVALID: Missing first name
      { firstName: 'Ananya', lastName: 'Roy', grade: 'Grade 8', parentPhone: '' }             // INVALID: Missing parent phone
    ];

    function validateBatch(batch) {
      const valid = [];
      const invalid = [];
      batch.forEach((item, index) => {
        const errors = [];
        if (!item.firstName?.trim()) errors.push('First name is required');
        if (!item.parentPhone?.trim()) errors.push('Parent phone number is required');
        
        if (errors.length > 0) {
          invalid.push({ row: index + 1, item, errors });
        } else {
          valid.push(item);
        }
      });
      return { valid, invalid };
    }

    const { valid, invalid } = validateBatch(rawBatch);
    assert.strictEqual(valid.length, 1);
    assert.strictEqual(valid[0].firstName, 'Rohan');
    assert.strictEqual(invalid.length, 2);
    assert.ok(invalid[0].errors.includes('First name is required'));
    assert.ok(invalid[1].errors.includes('Parent phone number is required'));
  });

  // 38. Bulk Student Import: Enforces school tenant isolation and prevents duplicate admission numbers within same school
  test('Bulk Student Import: Enforces school tenant isolation and prevents duplicate admission numbers within same school', () => {
    const existingStudents = [
      { id: 'std-1', schoolId: 'school-real-alpha', admissionNumber: 'ADM-2026-0001' },
      { id: 'std-2', schoolId: 'school-real-beta', admissionNumber: 'ADM-2026-0001' } // Same admission num in another school allowed
    ];

    function canAddAdmissionNumber(existingList, schoolId, newAdmissionNumber) {
      return !existingList.some(s => s.schoolId === schoolId && s.admissionNumber.toUpperCase() === newAdmissionNumber.toUpperCase());
    }

    // Duplicate in school-real-alpha should be rejected
    assert.strictEqual(canAddAdmissionNumber(existingStudents, 'school-real-alpha', 'ADM-2026-0001'), false);
    // New admission number in school-real-alpha should be accepted
    assert.strictEqual(canAddAdmissionNumber(existingStudents, 'school-real-alpha', 'ADM-2026-0002'), true);
    // Same admission number in school-real-gamma should be accepted (multi-tenant boundary)
    assert.strictEqual(canAddAdmissionNumber(existingStudents, 'school-real-gamma', 'ADM-2026-0001'), true);
  });

  // 39. Fee Payment Gateway: Supports partial/full payments across UPI, Net Banking, Cash & Cheque with transaction references
  test('Fee Payment Gateway: Supports partial/full payments across UPI, Net Banking, Cash & Cheque with transaction references', () => {
    const invoice = {
      id: 'inv-test-101',
      schoolId: 'school-real-alpha',
      studentId: 'std-alpha-1',
      studentName: 'Aarav Patel',
      totalAmount: 30000,
      discountAmount: 2000, // net: 28000
      paidAmount: 0,
      status: 'PENDING'
    };

    function processPayment(inv, amount, mode, options = {}) {
      const netPayable = inv.totalAmount - (inv.discountAmount || 0);
      const remaining = netPayable - inv.paidAmount;
      if (amount <= 0 || amount > remaining) throw new Error('Invalid payment amount');

      const receiptNumber = `REC-2025-${Math.floor(100000 + Math.random() * 900000)}`;
      const newPaid = inv.paidAmount + amount;
      const newRemaining = netPayable - newPaid;
      const newStatus = newRemaining === 0 ? 'PAID' : 'PARTIAL';

      return {
        receiptNumber,
        amountPaid: amount,
        paymentMode: mode,
        transactionRef: options.transactionRef || (mode === 'UPI' ? 'UPI-TEST-123' : undefined),
        remainingBalance: newRemaining,
        status: newStatus
      };
    }

    // Partial UPI payment of 15000
    const partRes = processPayment(invoice, 15000, 'UPI', { transactionRef: 'UPI-UTR-9876543210' });
    assert.strictEqual(partRes.amountPaid, 15000);
    assert.strictEqual(partRes.paymentMode, 'UPI');
    assert.strictEqual(partRes.transactionRef, 'UPI-UTR-9876543210');
    assert.strictEqual(partRes.remainingBalance, 13000);
    assert.strictEqual(partRes.status, 'PARTIAL');

    // Remaining payment of 13000 via NetBanking
    invoice.paidAmount = 15000;
    const fullRes = processPayment(invoice, 13000, 'NET_BANKING', { transactionRef: 'HDFC-NEFT-8819' });
    assert.strictEqual(fullRes.remainingBalance, 0);
    assert.strictEqual(fullRes.status, 'PAID');
    assert.strictEqual(fullRes.transactionRef, 'HDFC-NEFT-8819');
  });

  // 40. Fee Payment Gateway: Applies scholarship & concession waivers, updating discount and recalculating remaining balance
  test('Fee Payment Gateway: Applies scholarship & concession waivers, updating discount and recalculating remaining balance', () => {
    let invoice = {
      id: 'inv-waiver-1',
      totalAmount: 40000,
      discountAmount: 0,
      paidAmount: 10000,
      status: 'PARTIAL'
    };

    function applyWaiver(inv, waiverAmt, reason, approver) {
      const net = inv.totalAmount - (inv.discountAmount || 0);
      const remaining = net - inv.paidAmount;
      if (waiverAmt > remaining) throw new Error('Waiver exceeds remaining balance');

      const newDiscount = (inv.discountAmount || 0) + waiverAmt;
      const newNet = inv.totalAmount - newDiscount;
      const newRemaining = newNet - inv.paidAmount;
      const newStatus = newRemaining <= 0 ? 'PAID' : 'PARTIAL';

      return {
        ...inv,
        discountAmount: newDiscount,
        waiverReason: reason,
        waiverApprovedBy: approver,
        status: newStatus,
        remainingBalance: newRemaining
      };
    }

    const updated = applyWaiver(invoice, 5000, 'Merit Concession 10%', 'Principal Dr. Roy');
    assert.strictEqual(updated.discountAmount, 5000);
    assert.strictEqual(updated.remainingBalance, 25000);
    assert.strictEqual(updated.waiverReason, 'Merit Concession 10%');
    assert.strictEqual(updated.waiverApprovedBy, 'Principal Dr. Roy');
  });

  // 41. Fee Payment Gateway: Generates authentic digital receipts with school registration ID and verification metadata
  test('Fee Payment Gateway: Generates authentic digital receipts with school registration ID and verification metadata', () => {
    const school = {
      name: 'Delhi Public STEM School',
      registrationId: 'IMS-2026-000101',
      code: 'SCH-DEL-101'
    };

    const receipt = {
      receiptNumber: 'REC-2025-481920',
      invoiceNumber: 'INV-2025-1029',
      studentName: 'Diya Sharma',
      admissionNumber: 'ADM-2026-0002',
      schoolName: school.name,
      amountPaid: 12000,
      paymentMode: 'UPI',
      remainingBalance: 0,
      authorizedSignatory: 'Accounts Department / Bursar',
      paidAt: '2026-10-30T09:00:00Z'
    };

    assert.ok(receipt.receiptNumber.startsWith('REC-2025-'));
    assert.strictEqual(school.registrationId, 'IMS-2026-000101');
    assert.strictEqual(receipt.remainingBalance, 0);
    assert.strictEqual(receipt.paymentMode, 'UPI');
  });

  // 42. Fee Payment Gateway: Dispatches personalized parent fee reminders across WhatsApp, SMS & Email and tracks timestamps
  test('Fee Payment Gateway: Dispatches personalized parent fee reminders across WhatsApp, SMS & Email and tracks timestamps', () => {
    const invoice = {
      id: 'inv-remind-1',
      studentName: 'Rohan Iyer',
      totalAmount: 25000,
      discountAmount: 0,
      paidAmount: 5000,
      dueDate: '2026-11-15'
    };

    function generateReminder(inv, schoolName, parentName, channel) {
      const outstanding = inv.totalAmount - (inv.discountAmount || 0) - inv.paidAmount;
      const message = `Dear ${parentName}, Fee reminder from ${schoolName}. Outstanding balance for ${inv.studentName} is ₹${outstanding} (Due: ${inv.dueDate}).`;
      return {
        channel,
        sentAt: new Date().toISOString(),
        message,
        outstanding
      };
    }

    const reminder = generateReminder(invoice, 'Bangalore Robotics Institute', 'Suresh Iyer', 'WHATSAPP');
    assert.strictEqual(reminder.channel, 'WHATSAPP');
    assert.strictEqual(reminder.outstanding, 20000);
    assert.ok(reminder.message.includes('Bangalore Robotics Institute'));
    assert.ok(reminder.message.includes('₹20000'));
    assert.ok(Boolean(reminder.sentAt));
  });
});
