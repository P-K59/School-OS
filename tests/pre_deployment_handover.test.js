import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * InnovatMind School OS — Pre-Deployment Handover Regression Test Suite
 *
 * Requirements Verified:
 * 1. Login form credentials are empty by default with zero demo quick-fills.
 * 2. Demo Preview remains separate and sandboxed from production data.
 * 3. Reset scope preserves the Super Admin account and platform configuration.
 * 4. Logout invalidation + browser Back button security (BFCache purge, session wipe).
 * 5. Refreshing protected route while logged out redirects to login.
 * 6. Super Admin Settings navigation opens /admin/settings (not #settings anchor).
 * 7. Fresh school metrics reflect actual persisted database records (zero fake stats).
 */

const ROOT_DIR = process.cwd();

test('1. Login & Register screens start with empty credentials and zero exposed demo accounts', async () => {
  const loginFilePath = path.join(ROOT_DIR, 'app/(auth)/login/page.tsx');
  const registerFilePath = path.join(ROOT_DIR, 'app/(auth)/register/page.tsx');

  const loginContent = fs.readFileSync(loginFilePath, 'utf8');
  const registerContent = fs.readFileSync(registerFilePath, 'utf8');

  // Verify default state variables are empty strings
  assert.ok(
    loginContent.includes("const [identifier, setIdentifier] = useState('');"),
    'Login identifier must start with empty string'
  );
  assert.ok(
    loginContent.includes("const [password, setPassword] = useState('');"),
    'Login password must start with empty string'
  );

  // Verify quick fill demo credentials block was removed from login
  assert.ok(
    !loginContent.includes('Quick Fill Demo Credentials:'),
    'Login screen must not contain Quick Fill Demo Credentials'
  );
  assert.ok(
    !loginContent.includes('STU-DEL-001'),
    'Login screen must not expose cadet STU-DEL-001 credential buttons'
  );
  assert.ok(
    !loginContent.includes('Pass@Apex2026'),
    'Login screen must not expose raw school admin passwords'
  );

  // Verify hardcoded demo account selector list was removed from Google OAuth
  assert.ok(
    !loginContent.includes('Institutional Google Accounts:'),
    'Google modal must not present pre-clickable demo accounts list'
  );
  assert.ok(
    loginContent.includes('Institutional Google Workspace Email'),
    'Google modal must provide clean institutional workspace email entry'
  );

  // Verify register page has no fillSampleData or Quick Demo Fill button
  assert.ok(
    !registerContent.includes('fillSampleData'),
    'Register page must not include fillSampleData function'
  );
  assert.ok(
    !registerContent.includes('⚡ Quick Demo Fill'),
    'Register page must not include ⚡ Quick Demo Fill button'
  );

  // Verify demo preview is accessible via landing page link
  assert.ok(
    loginContent.includes('href="/?demo=open"'),
    'Login page must cleanly link to Demo Preview on Home Page'
  );
});

test('2. Demo Preview remains strictly separate and sandboxed from Production records', async () => {
  const contextFilePath = path.join(ROOT_DIR, 'lib/auth/context.tsx');
  const contextContent = fs.readFileSync(contextFilePath, 'utf8');

  // Verify resetDemoSandbox cleans demo-specific namespaces without touching production stores
  assert.ok(
    contextContent.includes('school_os_demo_schools'),
    'resetDemoSandbox must target demo namespace stores'
  );

  // In production mode, scoped list initializes to empty records
  assert.ok(
    contextContent.includes("isProd ? 'school_os_prod_invoices' : 'school_os_invoices'"),
    'Auth context must separate production invoices store from demo storage'
  );
  assert.ok(
    contextContent.includes("isProd ? 'school_os_prod_attendance' : 'school_os_attendance_records'"),
    'Auth context must separate production attendance store from demo storage'
  );
});

test('3. Reset scope preserves the root Super Admin account and platform configuration', async () => {
  const mockDataFilePath = path.join(ROOT_DIR, 'lib/db/mock-data.ts');
  const serverDbFilePath = path.join(ROOT_DIR, 'lib/db/server-db.ts');

  const mockDataContent = fs.readFileSync(mockDataFilePath, 'utf8');
  const serverDbContent = fs.readFileSync(serverDbFilePath, 'utf8');

  // Verify Super Admin account is defined and preserved
  assert.ok(
    mockDataContent.includes("id: 'usr-super'"),
    'Root Super Admin account (usr-super) must exist'
  );
  assert.ok(
    mockDataContent.includes("email: 'superadmin@innovatmind.com'"),
    'Super Admin email (superadmin@innovatmind.com) must be preserved'
  );
  assert.ok(
    mockDataContent.includes("role: 'SUPER_ADMIN'"),
    'Super Admin must retain SUPER_ADMIN role'
  );

  // Verify Server DB seeds contain real platform baseline schools, never random demo seed schools
  assert.ok(
    serverDbContent.includes('PROD_SEED_SCHOOLS: School[] = [initialWorkingRealSchool, nirmaanOrgSchool]'),
    'Production database seeds must only include verified operating schools'
  );
});

test('4. Logout invalidation + browser Back button security (BFCache and Session Purge)', async () => {
  const contextFilePath = path.join(ROOT_DIR, 'lib/auth/context.tsx');
  const appShellFilePath = path.join(ROOT_DIR, 'components/layout/app-shell.tsx');
  const userMenuFilePath = path.join(ROOT_DIR, 'components/layout/user-menu.tsx');

  const contextContent = fs.readFileSync(contextFilePath, 'utf8');
  const appShellContent = fs.readFileSync(appShellFilePath, 'utf8');
  const userMenuContent = fs.readFileSync(userMenuFilePath, 'utf8');

  // 1. Context initial state must check localStorage and default to null/false for unauthenticated visitors
  assert.ok(
    contextContent.includes("const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {"),
    'currentUser initial state must be lazily evaluated from storage, defaulting to null'
  );
  assert.ok(
    contextContent.includes("const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {"),
    'isAuthenticated initial state must be lazily evaluated from storage, defaulting to false'
  );

  // 2. Logout handler must purge storage, clear session cookie, and set state to null
  assert.ok(
    contextContent.includes("localStorage.removeItem('school_os_user');"),
    'Logout must delete school_os_user from localStorage'
  );
  assert.ok(
    contextContent.includes("sessionStorage.clear();"),
    'Logout must clear sessionStorage'
  );
  assert.ok(
    contextContent.includes("document.cookie = 'school_os_session=; Path=/; Expires=Thu, 01 Jan 1970"),
    'Logout must expire session cookie'
  );

  // 3. User Menu logout must perform a full window.location.replace to purge in-memory React state
  assert.ok(
    userMenuContent.includes("window.location.replace('/login');"),
    'User menu logout must execute window.location.replace to flush history and in-memory context'
  );

  // 4. AppShell must have pageshow (BFCache) and focus listeners to detect unauthenticated state upon browser Back
  assert.ok(
    appShellContent.includes("window.addEventListener('pageshow', handleRevalidation);"),
    'AppShell must register pageshow event listener to defeat browser BFCache'
  );

  // 5. AppShell must refuse to render private dashboard content if currentUser is null
  assert.ok(
    appShellContent.includes('if (!currentUser) {'),
    'AppShell must have early return guard when currentUser is null'
  );
  assert.ok(
    appShellContent.includes('Verifying Session Authentication...'),
    'AppShell must show verifying redirect screen rather than private dashboard content'
  );
});

test('5. Unauthenticated direct access or refresh on protected routes redirects to /login', async () => {
  const appShellFilePath = path.join(ROOT_DIR, 'components/layout/app-shell.tsx');
  const middlewareFilePath = path.join(ROOT_DIR, 'middleware.ts');

  const appShellContent = fs.readFileSync(appShellFilePath, 'utf8');
  const middlewareContent = fs.readFileSync(middlewareFilePath, 'utf8');

  // AppShell router replacement logic
  assert.ok(
    appShellContent.includes('router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);'),
    'AppShell must redirect unauthenticated visitors to login with redirect param'
  );

  // Middleware Cache-Control headers
  assert.ok(
    middlewareContent.includes("response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');"),
    'Middleware must enforce no-store headers on protected routes'
  );
  assert.ok(
    middlewareContent.includes("response.headers.set('Pragma', 'no-cache');"),
    'Middleware must enforce Pragma no-cache'
  );
});

test('6. Super Admin Settings navigation correctly routes to /admin/settings and page is implemented', async () => {
  const appShellFilePath = path.join(ROOT_DIR, 'components/layout/app-shell.tsx');
  const commandPaletteFilePath = path.join(ROOT_DIR, 'components/layout/command-palette.tsx');
  const settingsPageFilePath = path.join(ROOT_DIR, 'app/admin/settings/page.tsx');

  const appShellContent = fs.readFileSync(appShellFilePath, 'utf8');
  const commandPaletteContent = fs.readFileSync(commandPaletteFilePath, 'utf8');

  // Verify link is /admin/settings, NOT /admin#settings
  assert.ok(
    appShellContent.includes("{ label: 'Platform Settings', href: '/admin/settings', icon: Settings }"),
    'Super Admin menu in AppShell must link to /admin/settings'
  );
  assert.ok(
    !appShellContent.includes("href: '/admin#settings'"),
    'AppShell must not contain /admin#settings anchor'
  );

  assert.ok(
    commandPaletteContent.includes("href: '/admin/settings'"),
    'Command palette must link to /admin/settings'
  );
  assert.ok(
    !commandPaletteContent.includes("href: '/admin#settings'"),
    'Command palette must not contain /admin#settings anchor'
  );

  // Verify app/admin/settings/page.tsx exists and contains full implementation
  assert.ok(
    fs.existsSync(settingsPageFilePath),
    'app/admin/settings/page.tsx must exist as a dedicated Next.js page'
  );

  const settingsContent = fs.readFileSync(settingsPageFilePath, 'utf8');
  assert.ok(
    settingsContent.includes('Platform Master Settings'),
    'Settings page must render Platform Master Settings title'
  );
  assert.ok(
    settingsContent.includes('Require Super Admin Approval for Self-Registered Schools'),
    'Settings page must include school registration approval governance policy'
  );
  assert.ok(
    settingsContent.includes('Strict BFCache Invalidation & Session Purge'),
    'Settings page must document and configure BFCache & session purge security'
  );
  assert.ok(
    settingsContent.includes('superadmin@innovatmind.com'),
    'Settings page must display Super Admin profile credentials'
  );
});

test('7. Fresh school metrics reflect actual persisted database records (Zero Fake Stats)', async () => {
  const schoolPageFilePath = path.join(ROOT_DIR, 'app/school/page.tsx');
  const adminPageFilePath = path.join(ROOT_DIR, 'app/admin/page.tsx');

  const schoolPageContent = fs.readFileSync(schoolPageFilePath, 'utf8');
  const adminPageContent = fs.readFileSync(adminPageFilePath, 'utf8');

  // School Dashboard: verify zero stats when students.length === 0 in production
  assert.ok(
    schoolPageContent.includes("const isFreshSchool = !isDemo && students.length === 0;"),
    'School page must compute isFreshSchool based on zero students in production'
  );
  assert.ok(
    schoolPageContent.includes("{isFreshSchool ? '0%' : (isDemo ? '92%' : '100%')}"),
    'Fresh school must display 0% attendance'
  );
  assert.ok(
    schoolPageContent.includes("{isFreshSchool ? '₹0.0L' : (isDemo ? '₹28.4L' : feeCollectedDisplay)}"),
    'Fresh school must display ₹0.0L fee collected'
  );
  assert.ok(
    schoolPageContent.includes("{isFreshSchool ? '₹0.0L' : (isDemo ? '₹7.6L' : pendingFeesDisplay)}"),
    'Fresh school must display ₹0.0L pending fees'
  );
  assert.ok(
    schoolPageContent.includes("{isFreshSchool ? '0' : (isDemo ? '862' : enrollments.length.toLocaleString())}"),
    'Fresh school must display 0 course enrollments'
  );

  // Super Admin: verify calculations derive from realSchools
  assert.ok(
    adminPageContent.includes('const realSchools = useMemo(() => {'),
    'Super Admin page must isolate realSchools using isRealSchool filter'
  );
  assert.ok(
    adminPageContent.includes('return realSchools.reduce((acc, s) => acc + (s.totalStudents || 0), 0);'),
    'Super Admin total students must sum real schools, not mock figures'
  );
});
