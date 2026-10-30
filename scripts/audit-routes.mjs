// Route Auditor Script: Verifies all major pages return HTTP 200 without SSR runtime crash

const routesToTest = [
  '/',
  '/login',
  '/register',
  '/register/status',
  '/admin',
  '/admin/schools',
  '/admin/trainers',
  '/admin/pricing',
  '/admin/settings',
  '/superadmin/courses',
  '/school',
  '/school/students',
  '/school/staff',
  '/school/fees',
  '/school/exams',
  '/student'
];

async function audit() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- STARTING ROUTE AUDIT ---');
  let failures = 0;

  for (const route of routesToTest) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.status === 200) {
        console.log(`✓ [200 OK] ${route}`);
      } else {
        console.error(`✗ [${res.status}] ${route}`);
        failures++;
      }
    } catch (e) {
      console.error(`✗ [ERROR] ${route}:`, e.message);
      failures++;
    }
  }

  console.log('----------------------------');
  if (failures > 0) {
    console.error(`Audit finished with ${failures} failure(s).`);
    process.exit(1);
  } else {
    console.log(`All ${routesToTest.length} routes audited successfully!`);
  }
}

audit();
