// Comprehensive End-to-End Workflow Verification Script
// Tests: School Registration, Status Lookup, Super Admin Approval, Status Tracking, Deletion, and Edge Cases

async function run() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- STARTING COMPREHENSIVE E2E WORKFLOW VERIFICATION ---');

  // STEP 1: Register School
  console.log('\n[1] Submitting New School Registration...');
  const regPayload = {
    name: 'Cambridge Vedic Academy',
    code: 'SCH-VEDIC-901',
    email: 'admissions@vedicacademy.edu',
    phone: '+91 91234 56789',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 4, Hinjawadi',
    postalCode: '411057',
    principalName: 'Dr. Ananya Sharma',
    adminName: 'Ananya Sharma',
    adminEmail: 'principal@vedicacademy.edu',
    package: 'AI, Robotics & STEM Lab',
    studentsRange: '500-1000',
    curriculum: 'CBSE'
  };

  const regRes = await fetch(`${baseUrl}/api/schools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });

  if (!regRes.ok) {
    throw new Error(`Registration failed with HTTP ${regRes.status}: ${await regRes.text()}`);
  }

  const regData = await regRes.json();
  const school = regData.school;
  console.log('✓ School Registered Successfully:');
  console.log(`  - Internal ID: ${school.id}`);
  console.log(`  - Human Registration ID: ${school.registrationId}`);
  console.log(`  - School Code: ${school.code}`);
  console.log(`  - Onboarding Status: ${school.onboardingStatus}`);
  console.log(`  - Is Active: ${school.isActive}`);

  if (!school.registrationId || !school.registrationId.startsWith('IMS-2026-')) {
    throw new Error(`Invalid registrationId format: ${school.registrationId}`);
  }

  // STEP 2: Lookup Status via Registration ID
  console.log('\n[2] Looking up status by Registration ID:', school.registrationId);
  const statusRes1 = await fetch(`${baseUrl}/api/schools/status?id=${encodeURIComponent(school.registrationId)}`);
  const statusData1 = await statusRes1.json();
  console.log(`  - Found: ${statusData1.found}`);
  console.log(`  - School Name: ${statusData1.school?.name}`);
  console.log(`  - Status Badge: ${statusData1.school?.statusBadge}`);
  if (!statusData1.found || statusData1.school?.statusBadge !== 'PENDING') {
    throw new Error('Status lookup by registrationId failed or returned wrong badge');
  }

  // STEP 3: Lookup Status via Code
  console.log('\n[3] Looking up status by School Code:', school.code);
  const statusRes2 = await fetch(`${baseUrl}/api/schools/status?id=${encodeURIComponent(school.code)}`);
  const statusData2 = await statusRes2.json();
  console.log(`  - Found: ${statusData2.found}, Name: ${statusData2.school?.name}`);
  if (!statusData2.found) throw new Error('Status lookup by code failed');

  // STEP 4: Lookup Status via Email
  console.log('\n[4] Looking up status by Email:', regPayload.email);
  const statusRes3 = await fetch(`${baseUrl}/api/schools/status?id=${encodeURIComponent(regPayload.email)}`);
  const statusData3 = await statusRes3.json();
  console.log(`  - Found: ${statusData3.found}, Name: ${statusData3.school?.name}`);
  if (!statusData3.found) throw new Error('Status lookup by email failed');

  // STEP 5: Super Admin Approves School
  console.log('\n[5] Super Admin Approving School using registrationId...');
  const approveRes = await fetch(`${baseUrl}/api/schools`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'SUPER_ADMIN',
      'x-user-id': 'usr-superadmin-01'
    },
    body: JSON.stringify({
      schoolId: school.registrationId,
      action: 'approve'
    })
  });

  if (!approveRes.ok) {
    throw new Error(`Approval failed with HTTP ${approveRes.status}: ${await approveRes.text()}`);
  }

  const approveData = await approveRes.json();
  console.log('✓ Approval Response:');
  console.log(`  - Success: ${approveData.success}`);
  console.log(`  - Onboarding Status: ${approveData.school?.onboardingStatus}`);
  console.log(`  - Is Active: ${approveData.school?.isActive}`);
  console.log(`  - Provisioned Login ID: ${approveData.school?.adminCredentials?.loginId}`);
  console.log(`  - Welcome Kit Available: ${!!approveData.welcomeKit}`);

  if (!approveData.school?.isActive || approveData.school?.onboardingStatus !== 'ACTIVE') {
    throw new Error('School did not transition to ACTIVE status on approval');
  }

  // STEP 6: Verify Status Page Post-Approval
  console.log('\n[6] Verifying Applicant Status Page after approval...');
  const statusRes4 = await fetch(`${baseUrl}/api/schools/status?id=${encodeURIComponent(school.registrationId)}`);
  const statusData4 = await statusRes4.json();
  console.log(`  - Found: ${statusData4.found}`);
  console.log(`  - Post-Approval Status Badge: ${statusData4.school?.statusBadge}`);
  console.log(`  - Portal Access Ready: ${statusData4.school?.portalAccessReady}`);
  if (statusData4.school?.statusBadge !== 'APPROVED') {
    throw new Error(`Expected APPROVED badge, got: ${statusData4.school?.statusBadge}`);
  }

  // STEP 7: Delete Test School by Super Admin
  console.log('\n[7] Super Admin Deleting School using School Code:', school.code);
  const deleteRes = await fetch(`${baseUrl}/api/schools?schoolId=${encodeURIComponent(school.code)}`, {
    method: 'DELETE',
    headers: {
      'x-user-role': 'SUPER_ADMIN',
      'x-user-id': 'usr-superadmin-01'
    }
  });

  if (!deleteRes.ok) {
    throw new Error(`Deletion failed with HTTP ${deleteRes.status}: ${await deleteRes.text()}`);
  }

  const deleteData = await deleteRes.json();
  console.log('✓ Deletion Response:');
  console.log(`  - Success: ${deleteData.success}`);
  console.log(`  - Message: ${deleteData.message}`);
  console.log(`  - Cascade Deleted Students: ${deleteData.cascadeDeletedStudents}`);

  // STEP 8: Verify Status Lookup Returns Found = false
  console.log('\n[8] Verifying School is no longer found after deletion...');
  const statusRes5 = await fetch(`${baseUrl}/api/schools/status?id=${encodeURIComponent(school.registrationId)}`);
  const statusData5 = await statusRes5.json();
  console.log(`  - Found: ${statusData5.found}`);
  if (statusData5.found) {
    throw new Error('School was still found after deletion');
  }

  // STEP 9: Security & Edge Case Tests
  console.log('\n[9] Running Security & Edge Case Tests...');
  // 9a: Unauthorized Deletion Attempt (student role)
  const unauthDel = await fetch(`${baseUrl}/api/schools?schoolId=sch-del-101`, {
    method: 'DELETE',
    headers: {
      'x-user-role': 'STUDENT',
      'x-user-id': 'usr-student-01'
    }
  });
  console.log(`  - Student DELETE attempt returned HTTP ${unauthDel.status} (Expected 403)`);
  if (unauthDel.status !== 403) throw new Error(`Expected 403 for unauthorized delete, got ${unauthDel.status}`);

  // 9b: Protected platform tenant deletion guard
  const platDel = await fetch(`${baseUrl}/api/schools?schoolId=platform`, {
    method: 'DELETE',
    headers: {
      'x-user-role': 'SUPER_ADMIN',
      'x-user-id': 'usr-superadmin-01'
    }
  });
  console.log(`  - Protected platform DELETE attempt returned HTTP ${platDel.status} (Expected 400)`);
  if (platDel.status !== 400) throw new Error(`Expected 400 for platform delete, got ${platDel.status}`);

  console.log('\n======================================================');
  console.log('🎉 ALL END-TO-END WORKFLOW VERIFICATIONS PASSED 100%!');
  console.log('======================================================\n');
}

run().catch(err => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err);
  process.exit(1);
});
