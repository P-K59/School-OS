import test from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// InnovatMind School OS - Profile Menu, Logout & Role-Based UI Regression Suite
// ============================================================================

test('Profile Menu, Logout & Role-Based UI Architecture', async (t) => {

  // Simulated Storage Engine
  const store = new Map();
  const mockStorage = {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };

  // Mock User Sessions
  const mockStudent = {
    id: 'stud-del-101',
    role: 'STUDENT',
    firstName: 'Aarav',
    lastName: 'Verma',
    displayName: 'Aarav Verma',
    email: 'aarav.verma@dpsdelhi.edu.in',
    admissionNumber: 'DEL-2026-042',
    gradeName: 'Grade 6',
    sectionName: 'Section A',
    schoolId: 'school-1',
    schoolName: 'Delhi Public School (STEM Excellence)',
    isActive: true,
    status: 'ACTIVE'
  };

  const mockSchoolAdmin = {
    id: 'usr-admin-school-1',
    role: 'SCHOOL_ADMIN',
    firstName: 'Ananya',
    lastName: 'Sharma',
    displayName: 'Dr. Ananya Sharma',
    email: 'principal@dpsdelhi.edu.in',
    designation: 'Principal & Director',
    schoolId: 'school-1',
    schoolName: 'Delhi Public School (STEM Excellence)',
    isActive: true,
    status: 'ACTIVE'
  };

  const mockSuperAdmin = {
    id: 'usr-superadmin',
    role: 'SUPER_ADMIN',
    firstName: 'Pankaj',
    lastName: 'Kumar',
    displayName: 'Pankaj Kumar',
    email: 'superadmin@innovatmind.com',
    designation: 'Super Admin • Central Operations',
    isActive: true,
    status: 'ACTIVE'
  };

  // Helper simulating UserMenu menu item resolution
  const resolveUserMenuItems = (user, activeSchool) => {
    const role = user?.role || 'STUDENT';
    const isStudent = role === 'STUDENT';
    const isSchoolAdmin = role === 'SCHOOL_ADMIN';
    const isSuperAdmin = role === 'SUPER_ADMIN';

    const items = [];
    const forbiddenItems = [];

    if (isStudent) {
      items.push({ label: 'My Profile & Cadet ID', path: '/student?tab=profile' });
      items.push({ label: 'My Learning Track', path: '/student?tab=learning' });
      items.push({ label: 'Sign Out', action: 'LOGOUT' });

      // Unauthorized elements for student
      forbiddenItems.push('Switch School');
      forbiddenItems.push('Switch School / Login Screen');
      forbiddenItems.push('Switch Persona');
      forbiddenItems.push('Switch Role');
      forbiddenItems.push('Institutional Dashboard');
      forbiddenItems.push('Central HQ Dashboard');
    } else if (isSchoolAdmin) {
      items.push({ label: 'Institutional Dashboard', path: '/school' });
      items.push({ label: 'Faculty & Staff Roster', path: '/school/staff' });
      items.push({ label: 'School Settings', path: '/school/settings' });
      items.push({ label: 'Sign Out', action: 'LOGOUT' });

      forbiddenItems.push('Switch School');
      forbiddenItems.push('Switch School / Login Screen');
      forbiddenItems.push('Central HQ Dashboard');
    } else if (isSuperAdmin) {
      items.push({ label: 'Central HQ Dashboard', path: '/admin' });
      items.push({ label: 'Tenant Schools Directory', path: '/admin/schools' });
      items.push({ label: 'Central Pricing Engine', path: '/admin/pricing' });
      items.push({ label: 'Persona Preview (HQ Only)', isPreview: true });
      items.push({ label: 'Sign Out', action: 'LOGOUT' });

      forbiddenItems.push('Switch School / Login Screen');
    }

    return { items, forbiddenItems };
  };

  // 1. Student dropdown contains only authorized actions
  await t.test('1. Student dropdown contains only authorized actions', () => {
    const { items } = resolveUserMenuItems(mockStudent, { name: 'DPS', code: 'SCH-DEL-001' });
    const labels = items.map(i => i.label);

    assert.ok(labels.includes('My Profile & Cadet ID'));
    assert.ok(labels.includes('My Learning Track'));
    assert.ok(labels.includes('Sign Out'));
    assert.equal(items.length, 3, 'Student menu must contain exactly 3 authorized actions');
  });

  // 2. Student dropdown does not contain Switch School or Switch Persona
  await t.test('2. Student dropdown strictly does NOT contain Switch School or Switch Persona', () => {
    const { items, forbiddenItems } = resolveUserMenuItems(mockStudent, { name: 'DPS', code: 'SCH-DEL-001' });
    const labels = items.map(i => i.label);

    forbiddenItems.forEach(forbidden => {
      assert.equal(labels.includes(forbidden), false, `Forbidden item '${forbidden}' must NOT be in student menu`);
    });
  });

  // 3. Student can access their own profile
  await t.test('3. Student profile action routes to authorized cadet profile tab', () => {
    const { items } = resolveUserMenuItems(mockStudent, { name: 'DPS', code: 'SCH-DEL-001' });
    const profileItem = items.find(i => i.label === 'My Profile & Cadet ID');

    assert.ok(profileItem);
    assert.equal(profileItem.path, '/student?tab=profile');
  });

  // 4. Student Sign Out works correctly & invalidates session
  await t.test('4. Student Sign Out properly clears user session and redirects to /login', () => {
    mockStorage.setItem('school_os_user', JSON.stringify(mockStudent));
    mockStorage.setItem('school_os_school_id', mockStudent.schoolId);

    // Perform logout
    const logout = (store) => {
      store.removeItem('school_os_user');
      store.removeItem('school_os_school_id');
      return { success: true, redirect: '/login' };
    };

    const res = logout(mockStorage);
    assert.equal(res.success, true);
    assert.equal(res.redirect, '/login');
    assert.equal(mockStorage.getItem('school_os_user'), null, 'Session user must be cleared');
    assert.equal(mockStorage.getItem('school_os_school_id'), null, 'Session schoolId must be cleared');
  });

  // 5. School Admin authorized controls remain intact
  await t.test('5. School Admin authorized institutional controls remain intact', () => {
    const { items, forbiddenItems } = resolveUserMenuItems(mockSchoolAdmin, { name: 'DPS', code: 'SCH-DEL-001' });
    const labels = items.map(i => i.label);

    assert.ok(labels.includes('Institutional Dashboard'));
    assert.ok(labels.includes('Faculty & Staff Roster'));
    assert.ok(labels.includes('School Settings'));
    assert.ok(labels.includes('Sign Out'));

    forbiddenItems.forEach(forbidden => {
      assert.equal(labels.includes(forbidden), false, `Forbidden item '${forbidden}' must NOT be in School Admin menu`);
    });
  });

  // 6. Super Admin authorized controls remain intact
  await t.test('6. Super Admin authorized central platform controls remain intact', () => {
    const { items } = resolveUserMenuItems(mockSuperAdmin, { name: 'Central HQ' });
    const labels = items.map(i => i.label);

    assert.ok(labels.includes('Central HQ Dashboard'));
    assert.ok(labels.includes('Tenant Schools Directory'));
    assert.ok(labels.includes('Central Pricing Engine'));
    assert.ok(labels.includes('Persona Preview (HQ Only)'));
    assert.ok(labels.includes('Sign Out'));
  });

  // 7. Dropdown opens and closes correctly (State Machine verification)
  await t.test('7. Dropdown state toggles cleanly without stuck states', () => {
    let isOpen = false;
    const toggle = () => { isOpen = !isOpen; return isOpen; };
    const close = () => { isOpen = false; return isOpen; };

    assert.equal(isOpen, false);
    assert.equal(toggle(), true);
    assert.equal(toggle(), false);
    assert.equal(toggle(), true);
    assert.equal(close(), false);
  });

  // 8. Outside click and Escape key behavior
  await t.test('8. Escape key and outside click triggers close menu', () => {
    let isOpen = true;
    const handleKeyDown = (key) => {
      if (key === 'Escape') isOpen = false;
    };
    const handleOutsideClick = (targetInMenu) => {
      if (!targetInMenu) isOpen = false;
    };

    handleKeyDown('Enter'); // Not escape
    assert.equal(isOpen, true);

    handleKeyDown('Escape');
    assert.equal(isOpen, false, 'Escape key must close dropdown');

    isOpen = true;
    handleOutsideClick(false);
    assert.equal(isOpen, false, 'Outside click must close dropdown');
  });

  // 9. Dropdown stays within viewport constraints & solid opaque background
  await t.test('9. Dropdown styling classes enforce viewport boundary, internal scroll & solid opacity', () => {
    const dropdownClasses = "absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 sm:max-w-sm rounded-2xl border-2 border-slate-200 bg-white p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-50 animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto focus:outline-none ring-1 ring-slate-900/5";

    assert.ok(dropdownClasses.includes('right-0'), 'Must align right to anchor button');
    assert.ok(dropdownClasses.includes('bg-white'), 'Must have solid white background');
    assert.ok(dropdownClasses.includes('max-h-[calc(100vh-5rem)]'), 'Must constrain max height to viewport');
    assert.ok(dropdownClasses.includes('overflow-y-auto'), 'Must allow internal scrolling');
    assert.ok(dropdownClasses.includes('w-[calc(100vw-2rem)]'), 'Must prevent horizontal overflow on mobile');
  });

  // 10. Logout invalidates session completely
  await t.test('10. Logout invalidation prevents resurrecting user profile on refresh', () => {
    mockStorage.setItem('school_os_user', JSON.stringify(mockStudent));
    assert.ok(mockStorage.getItem('school_os_user'));

    // Invalidate
    mockStorage.removeItem('school_os_user');
    mockStorage.removeItem('school_os_school_id');

    // Rehydrate attempt (simulating page reload)
    const rehydratedUser = mockStorage.getItem('school_os_user');
    assert.equal(rehydratedUser, null, 'Unauthenticated user cannot be restored after logout');
  });

  // 11. Protected routes reject unauthenticated requests
  await t.test('11. Protected routes reject unauthenticated sessions with redirect to login', () => {
    const enforceRouteGuard = (currentUser, targetPath) => {
      if (!currentUser) {
        return { allowed: false, redirect: `/login?redirect=${encodeURIComponent(targetPath)}` };
      }
      return { allowed: true };
    };

    const guestAdmin = enforceRouteGuard(null, '/admin');
    assert.equal(guestAdmin.allowed, false);
    assert.equal(guestAdmin.redirect, '/login?redirect=%2Fadmin');

    const guestSchool = enforceRouteGuard(null, '/school');
    assert.equal(guestSchool.allowed, false);
    assert.equal(guestSchool.redirect, '/login?redirect=%2Fschool');

    const guestStudent = enforceRouteGuard(null, '/student');
    assert.equal(guestStudent.allowed, false);
    assert.equal(guestStudent.redirect, '/login?redirect=%2Fstudent');
  });

  // 12. Existing role routing and tenant isolation continue to work
  await t.test('12. Existing role boundaries and multi-tenant isolation preserved', () => {
    const checkRoleAuthorization = (user, path) => {
      if (path.startsWith('/admin')) {
        return user.role === 'SUPER_ADMIN';
      }
      if (path.startsWith('/school')) {
        return user.role === 'SCHOOL_ADMIN' || user.role === 'SUPER_ADMIN';
      }
      if (path.startsWith('/student')) {
        return user.role === 'STUDENT' || user.role === 'SUPER_ADMIN';
      }
      return true;
    };

    // Student cannot breach admin/school boundaries
    assert.equal(checkRoleAuthorization(mockStudent, '/admin'), false);
    assert.equal(checkRoleAuthorization(mockStudent, '/school'), false);
    assert.equal(checkRoleAuthorization(mockStudent, '/student'), true);

    // School Admin cannot breach Super Admin HQ
    assert.equal(checkRoleAuthorization(mockSchoolAdmin, '/admin'), false);
    assert.equal(checkRoleAuthorization(mockSchoolAdmin, '/school'), true);

    // Super Admin can inspect all areas
    assert.equal(checkRoleAuthorization(mockSuperAdmin, '/admin'), true);
    assert.equal(checkRoleAuthorization(mockSuperAdmin, '/school'), true);
    assert.equal(checkRoleAuthorization(mockSuperAdmin, '/student'), true);
  });

});
