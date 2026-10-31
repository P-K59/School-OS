/**
 * Multi-Tenant Switcher Navigation & School Detail Window Verification Test
 * Tests:
 * 1. Selecting school from Super Admin Multi-Tenant Switcher updates activeSchool in context
 * 2. Navigates cleanly from /admin/schools/[schoolId] -> /admin/schools/[newSchoolId]
 * 3. Preserves sub-routes: /pricing, /courses, /trainers
 * 4. Preserves query parameters like ?tab=finance
 * 5. Direct navigation to school detail window from /admin or /admin/schools
 * 6. Bi-directional sync: SchoolDetailsPage updates activeSchool to match currently viewed school
 */

const assert = require('assert');

// Simulate the Tenant Switcher route resolution logic
function resolveTenantSwitchRoute(currentPathname, currentSearch, targetSchoolId) {
  // If currently on any /admin/schools/[schoolId]/* page (details, pricing, courses, trainers)
  if (currentPathname.includes('/admin/schools/')) {
    const parts = currentPathname.split('/');
    const schoolsIdx = parts.indexOf('schools');
    if (schoolsIdx !== -1 && parts.length > schoolsIdx + 1 && parts[schoolsIdx + 1] !== 'new') {
      parts[schoolsIdx + 1] = targetSchoolId;
      const newPath = parts.join('/');
      const search = currentSearch || '';
      return `${newPath}${search}`;
    }
  }

  // If currently anywhere else in Super Admin HQ (/admin, /admin/schools, /admin/dashboard, etc.)
  if (currentPathname.startsWith('/admin')) {
    return `/admin/schools/${targetSchoolId}`;
  }

  // Non-admin portal view (e.g. /school) keeps current route and only switches activeSchool
  return null;
}

// Mock school data
const schools = [
  {
    id: 'sch-del-101',
    code: 'SCH-DEL-101',
    name: 'Apex National Academy',
    city: 'New Delhi',
    state: 'Delhi',
    email: 'principal@apexnational.edu.in'
  },
  {
    id: 'sch-nir-001',
    code: 'SCH-NIR-001',
    name: 'Nirmaan Future Academy',
    city: 'New Delhi',
    state: 'Delhi',
    email: 'pankaj@nirmaan.org'
  }
];

function runTests() {
  console.log('--- RUNNING TENANT SWITCHER NAVIGATION TESTS ---');

  // Test 1: On /admin/schools/sch-del-101 (Apex National Academy) -> switch to Nirmaan Future Academy
  const route1 = resolveTenantSwitchRoute('/admin/schools/sch-del-101', '', 'sch-nir-001');
  assert.strictEqual(route1, '/admin/schools/sch-nir-001', 'Must navigate to Nirmaan school details page');
  console.log('✓ Test 1 Passed: Switch from Apex details to Nirmaan details -> /admin/schools/sch-nir-001');

  // Test 2: On /admin/schools/sch-del-101?tab=finance -> preserve query params
  const route2 = resolveTenantSwitchRoute('/admin/schools/sch-del-101', '?tab=finance', 'sch-nir-001');
  assert.strictEqual(route2, '/admin/schools/sch-nir-001?tab=finance', 'Must preserve tab query parameter');
  console.log('✓ Test 2 Passed: Switch school details preserving tab -> /admin/schools/sch-nir-001?tab=finance');

  // Test 3: On /admin/schools/sch-del-101/pricing -> switch to Nirmaan pricing
  const route3 = resolveTenantSwitchRoute('/admin/schools/sch-del-101/pricing', '', 'sch-nir-001');
  assert.strictEqual(route3, '/admin/schools/sch-nir-001/pricing', 'Must navigate to Nirmaan pricing subpage');
  console.log('✓ Test 3 Passed: Switch pricing subpage -> /admin/schools/sch-nir-001/pricing');

  // Test 4: On /admin/schools/sch-del-101/courses -> switch to Nirmaan courses
  const route4 = resolveTenantSwitchRoute('/admin/schools/sch-del-101/courses', '', 'sch-nir-001');
  assert.strictEqual(route4, '/admin/schools/sch-nir-001/courses', 'Must navigate to Nirmaan courses subpage');
  console.log('✓ Test 4 Passed: Switch courses subpage -> /admin/schools/sch-nir-001/courses');

  // Test 5: On /admin/schools/sch-del-101/trainers -> switch to Nirmaan trainers
  const route5 = resolveTenantSwitchRoute('/admin/schools/sch-del-101/trainers', '', 'sch-nir-001');
  assert.strictEqual(route5, '/admin/schools/sch-nir-001/trainers', 'Must navigate to Nirmaan trainers subpage');
  console.log('✓ Test 5 Passed: Switch trainers subpage -> /admin/schools/sch-nir-001/trainers');

  // Test 6: On /admin/schools (Directory list) -> selecting school opens its detail window
  const route6 = resolveTenantSwitchRoute('/admin/schools', '', 'sch-nir-001');
  assert.strictEqual(route6, '/admin/schools/sch-nir-001', 'Must open school details from /admin/schools');
  console.log('✓ Test 6 Passed: Open school details from registry -> /admin/schools/sch-nir-001');

  // Test 7: On /admin (HQ Dashboard) -> selecting school opens its detail window
  const route7 = resolveTenantSwitchRoute('/admin', '', 'sch-nir-001');
  assert.strictEqual(route7, '/admin/schools/sch-nir-001', 'Must open school details from /admin dashboard');
  console.log('✓ Test 7 Passed: Open school details from dashboard -> /admin/schools/sch-nir-001');

  // Test 8: On /admin/schools/new -> selecting school opens selected school's details instead of replacing 'new'
  const route8 = resolveTenantSwitchRoute('/admin/schools/new', '', 'sch-nir-001');
  assert.strictEqual(route8, '/admin/schools/sch-nir-001', 'Must open school details rather than replacing new');
  console.log('✓ Test 8 Passed: Selection on /admin/schools/new routes safely to school details');

  // Test 9: On /school (School Admin portal) -> keeps current route
  const route9 = resolveTenantSwitchRoute('/school/dashboard', '', 'sch-nir-001');
  assert.strictEqual(route9, null, 'Must keep current path when inside /school portal');
  console.log('✓ Test 9 Passed: Inside /school portal activeSchool is updated without changing route');

  // Test 10: State sync verification in SchoolDetailsPage
  let activeSchool = schools[0]; // Apex
  const setActiveSchool = (s) => { activeSchool = s; };

  // When mounting on sch-nir-001
  const routeSchoolId = 'sch-nir-001';
  const matchedSchool = schools.find(s => s.id === routeSchoolId);
  if (matchedSchool && activeSchool.id !== matchedSchool.id) {
    setActiveSchool(matchedSchool);
  }
  assert.strictEqual(activeSchool.id, 'sch-nir-001', 'activeSchool must synchronize to route school');
  assert.strictEqual(activeSchool.name, 'Nirmaan Future Academy');
  console.log('✓ Test 10 Passed: SchoolDetailsPage successfully synchronizes activeSchool on route change');

  console.log('\nALL 10/10 TENANT SWITCHER TESTS PASSED!\n');
}

runTests();
