import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * InnovatMind School OS — Phase 3: Tenant Security & Hardening Test Suite
 * Tests strict role separation, cross-tenant isolation, and student boundaries against live API
 */

const BASE_URL = 'http://localhost:3000';

test('=== PHASE 3: MULTI-TENANT SECURITY & HARDENING VERIFICATION ===', async (t) => {

  // Setup School A, School B, Student A, Student B
  const schoolAId = `sch-sec-a-${Date.now()}`;
  const schoolBId = `sch-sec-b-${Date.now()}`;
  let studentAId = '';
  let studentBId = '';
  let courseId = '';

  await t.test('1. Setup Schools, Course, and Students for Tenant Isolation Tests', async () => {
    // 1. Create School A
    const resA = await fetch(`${BASE_URL}/api/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN', 'x-user-id': 'usr-superadmin' },
      body: JSON.stringify({
        id: schoolAId,
        name: 'Alpha International Academy',
        code: `ALPHA-${Date.now().toString().slice(-4)}`,
        city: 'Delhi',
        state: 'Delhi',
        email: `alpha.${Date.now()}@innovatmind.com`,
        phone: '+91 99999 11111',
        schoolType: 'CBSE'
      })
    });
    assert.equal(resA.status, 201);

    // 2. Create School B
    const resB = await fetch(`${BASE_URL}/api/schools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN', 'x-user-id': 'usr-superadmin' },
      body: JSON.stringify({
        id: schoolBId,
        name: 'Beta Global School',
        code: `BETA-${Date.now().toString().slice(-4)}`,
        city: 'Mumbai',
        state: 'Maharashtra',
        email: `beta.${Date.now()}@innovatmind.com`,
        phone: '+91 99999 22222',
        schoolType: 'ICSE'
      })
    });
    assert.equal(resB.status, 201);

    // 3. Create Course
    const resC = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN', 'x-user-id': 'usr-superadmin' },
      body: JSON.stringify({
        title: 'Cyber Security & Network Defense',
        category: 'Coding',
        description: 'Multi-tenant secure course',
        minGrade: 6,
        maxGrade: 8,
        pricePerStudent: 999
      })
    });
    const cData = await resC.json();
    courseId = cData.course.id;

    // 4. Admit Student A in School A
    const resStudA = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SCHOOL_ADMIN', 'x-school-id': schoolAId, 'x-user-id': `admin-${schoolAId}` },
      body: JSON.stringify({
        schoolId: schoolAId,
        admissionNumber: `ADM-A-${Date.now().toString().slice(-4)}`,
        firstName: 'Alice',
        lastName: 'Sharma',
        email: `alice.${Date.now()}@innovatmind.com`,
        gradeName: 'Class 6',
        sectionName: 'A',
        parentName: 'Sunil Sharma',
        parentPhone: '+91 99999 33333'
      })
    });
    const dataStudA = await resStudA.json();
    studentAId = dataStudA.student.id;

    // 5. Admit Student B in School B
    const resStudB = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SCHOOL_ADMIN', 'x-school-id': schoolBId, 'x-user-id': `admin-${schoolBId}` },
      body: JSON.stringify({
        schoolId: schoolBId,
        admissionNumber: `ADM-B-${Date.now().toString().slice(-4)}`,
        firstName: 'Bob',
        lastName: 'Mehta',
        email: `bob.${Date.now()}@innovatmind.com`,
        gradeName: 'Class 6',
        sectionName: 'A',
        parentName: 'Kunal Mehta',
        parentPhone: '+91 99999 44444'
      })
    });
    const dataStudB = await resStudB.json();
    studentBId = dataStudB.student.id;
  });

  await t.test('2. Multi-Tenant Barrier: School Admin A cannot access School B students or enrollments', async () => {
    // School Admin A attempts to fetch School B students
    const res = await fetch(`${BASE_URL}/api/students?schoolId=${schoolBId}`, {
      headers: {
        'x-user-role': 'SCHOOL_ADMIN',
        'x-school-id': schoolAId,
        'x-user-id': `admin-${schoolAId}`
      }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Cross-tenant access denied'));
  });

  await t.test('3. Student Privacy: Student A cannot access Student B learning journey', async () => {
    // Student A attempts to query Student B's journey
    const res = await fetch(`${BASE_URL}/api/courses/learning-journey?studentId=${studentBId}`, {
      headers: {
        'x-user-role': 'STUDENT',
        'x-school-id': schoolAId,
        'x-user-id': studentAId
      }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Students cannot access another student'));
  });

  await t.test('4. Role Protection: School Admin cannot access Super Admin catalog deletion', async () => {
    // School Admin attempts to delete a course from central catalog
    const res = await fetch(`${BASE_URL}/api/courses?courseId=${courseId}`, {
      method: 'DELETE',
      headers: {
        'x-user-role': 'SCHOOL_ADMIN',
        'x-school-id': schoolAId,
        'x-user-id': `admin-${schoolAId}`
      }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes('Forbidden'));
  });

  await t.test('5. Anonymous Protection: Unauthenticated request strictly rejected', async () => {
    // Direct access with no credentials
    const res = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      headers: {} // No x-user-role
    });
    assert.equal(res.status, 401);
  });

  await t.test('6. Inactive / Suspended School Barrier: Suspended school blocks student learning access', async () => {
    // 1. Suspend School A as Super Admin
    const suspendRes = await fetch(`${BASE_URL}/api/schools`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'SUPER_ADMIN', 'x-user-id': 'usr-superadmin' },
      body: JSON.stringify({
        action: 'suspend',
        schoolId: schoolAId,
        reason: 'Payment compliance audit underway'
      })
    });
    assert.equal(suspendRes.status, 200);

    // 2. Student A tries to load their learning journey
    const journeyRes = await fetch(`${BASE_URL}/api/courses/learning-journey?courseId=${courseId}`, {
      headers: {
        'x-user-role': 'STUDENT',
        'x-school-id': schoolAId,
        'x-user-id': studentAId
      }
    });
    assert.equal(journeyRes.status, 400);
    const data = await journeyRes.json();
    assert.ok(data.error.includes('suspended') || data.error.includes('inactive'));
  });

});
