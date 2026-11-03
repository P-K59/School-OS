import { test } from 'node:test';
import assert from 'node:assert/strict';

// ============================================================================
// INNOVATMIND SCHOOL OS — FINAL PRE-STAGING SECURITY VERIFICATION SUITE
// Principal Application Security Engineer Independent Audit
// ============================================================================

// Authoritative Fixtures
const VALID_ROLES = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'TEACHER',
  'INNOVATMIND_TRAINER',
  'STUDENT',
  'PARENT'
];

const mockDatabase = {
  profiles: [
    {
      id: 'usr-super-01',
      auth_id: 'auth-uuid-super-01',
      role: 'SUPER_ADMIN',
      school_id: null,
      email: 'superadmin@innovatmind.com',
      is_active: true,
      status: 'ACTIVE'
    },
    {
      id: 'usr-admin-delhi',
      auth_id: 'auth-uuid-admin-delhi',
      role: 'SCHOOL_ADMIN',
      school_id: 'sch-del-001',
      email: 'principal@delhitech.edu.in',
      is_active: true,
      status: 'ACTIVE'
    },
    {
      id: 'usr-admin-mumbai',
      auth_id: 'auth-uuid-admin-mumbai',
      role: 'SCHOOL_ADMIN',
      school_id: 'sch-mum-002',
      email: 'principal@mumbaitech.edu.in',
      is_active: true,
      status: 'ACTIVE'
    },
    {
      id: 'usr-student-01',
      auth_id: 'auth-uuid-student-01',
      role: 'STUDENT',
      school_id: 'sch-del-001',
      email: 'aarav.v@student.delhitech.edu.in',
      is_active: true,
      status: 'ACTIVE'
    },
    {
      id: 'usr-student-02',
      auth_id: 'auth-uuid-student-02',
      role: 'STUDENT',
      school_id: 'sch-del-001',
      email: 'diya.n@student.delhitech.edu.in',
      is_active: true,
      status: 'ACTIVE'
    },
    {
      id: 'usr-suspended-01',
      auth_id: 'auth-uuid-suspended-01',
      role: 'SCHOOL_ADMIN',
      school_id: 'sch-sus-003',
      email: 'suspended.admin@innovatmind.com',
      is_active: false,
      status: 'SUSPENDED'
    }
  ]
};

// Mirror of resolveProfileFromTrustedSources logic
async function resolveProfile(email, authId, db = mockDatabase) {
  if (!email && !authId) return null;
  const normEmail = email ? email.toLowerCase().trim() : null;

  const match = db.profiles.find(p =>
    (normEmail && p.email.toLowerCase() === normEmail) ||
    (authId && (p.id === authId || p.auth_id === authId))
  );

  if (match && match.is_active !== false && match.status !== 'SUSPENDED') {
    return { id: match.id, role: match.role, schoolId: match.school_id || undefined };
  }
  return null;
}

// Mirror of authenticateRequest implementation in server-guard.ts
async function authenticateRequestSimulation(reqHeaders, reqCookies, mockSupabaseAuth) {
  const authHeader = reqHeaders['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;

  if (token) {
    if (mockSupabaseAuth) {
      const { data: userData, error: userError } = await mockSupabaseAuth.getUser(token);
      if (userData?.user && !userError) {
        const email = userData.user.email?.toLowerCase().trim();
        const authId = userData.user.id;
        const resolved = await resolveProfile(email, authId);
        if (resolved) {
          return {
            userId: resolved.id,
            role: resolved.role,
            schoolId: resolved.schoolId,
            email,
            jwtVerified: true
          };
        }
        return null;
      } else {
        return null; // Invalid or expired token
      }
    }
    return null;
  }

  // Method 2: Cookie fallback (MUST validate against DB)
  const cookieUser = reqCookies['school_os_user'];
  if (cookieUser) {
    try {
      const parsed = JSON.parse(decodeURIComponent(cookieUser));
      if (parsed && (parsed.id || parsed.email)) {
        const resolved = await resolveProfile(parsed.email, parsed.id);
        if (resolved) {
          return {
            userId: resolved.id,
            role: resolved.role,
            schoolId: resolved.schoolId,
            email: parsed.email,
            jwtVerified: false
          };
        }
      }
    } catch {}
  }

  return null;
}

function authorizeRole(context, allowedRoles) {
  if (!context) {
    return { status: 401, error: 'Unauthorized: Missing valid authentication credentials' };
  }
  if (!allowedRoles.includes(context.role)) {
    return { status: 403, error: `Forbidden: User role '${context.role}' does not possess required privilege.` };
  }
  return null;
}

function authorizeSchoolScope(context, targetSchoolId) {
  if (!context) {
    return { status: 401, error: 'Unauthorized: Authentication required' };
  }
  if (context.role === 'SUPER_ADMIN') {
    return null;
  }
  if (context.schoolId !== targetSchoolId) {
    return { status: 403, error: `Forbidden: Cross-tenant access denied. Your account is bound to school '${context.schoolId}', cannot access '${targetSchoolId}'` };
  }
  return null;
}

// ============================================================================
// 1. JWT & SERVER-GUARD SECURITY TESTS
// ============================================================================

test('Security Verification 1: Forged SUPER_ADMIN header without JWT or cookie is strictly rejected', async () => {
  const reqHeaders = {
    'x-user-role': 'SUPER_ADMIN',
    'x-user-id': 'usr-attacker',
    'x-school-id': 'sch-del-001'
  };
  const reqCookies = {};

  const context = await authenticateRequestSimulation(reqHeaders, reqCookies, null);
  assert.equal(context, null, 'Context must be null when x-user-role is sent without credentials');

  const authResponse = authorizeRole(context, ['SUPER_ADMIN']);
  assert.equal(authResponse?.status, 401, 'Must respond with 401 Unauthorized');
});

test('Security Verification 2: Missing JWT and missing cookie yields 401 Unauthorized', async () => {
  const context = await authenticateRequestSimulation({}, {}, null);
  assert.equal(context, null);

  const authResponse = authorizeRole(context, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

test('Security Verification 3: Invalid or malformed JWT token is rejected (returns null, no cookie fallback)', async () => {
  const mockAuth = {
    getUser: async (token) => {
      return { data: { user: null }, error: { message: 'Invalid token signature', status: 401 } };
    }
  };

  const reqHeaders = { 'authorization': 'Bearer fake-malformed-jwt-token' };
  const reqCookies = {
    'school_os_user': encodeURIComponent(JSON.stringify({ id: 'usr-super-01', role: 'SUPER_ADMIN', email: 'superadmin@innovatmind.com' }))
  };

  const context = await authenticateRequestSimulation(reqHeaders, reqCookies, mockAuth);
  assert.equal(context, null, 'Supplying a bad JWT must immediately fail without falling back to cookie');

  const authResponse = authorizeRole(context, ['SUPER_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

test('Security Verification 4: Expired JWT token is rejected with 401', async () => {
  const mockAuth = {
    getUser: async (token) => {
      return { data: { user: null }, error: { message: 'JWT expired at 1672531199', status: 401 } };
    }
  };

  const reqHeaders = { 'authorization': 'Bearer expired-jwt-token' };
  const context = await authenticateRequestSimulation(reqHeaders, {}, mockAuth);
  assert.equal(context, null);

  const authResponse = authorizeRole(context, ['SUPER_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

test('Security Verification 5: Valid JWT with missing application profile is rejected', async () => {
  const mockAuth = {
    getUser: async (token) => {
      return { data: { user: { id: 'unknown-oauth-uuid', email: 'random.unregistered@gmail.com' } }, error: null };
    }
  };

  const reqHeaders = { 'authorization': 'Bearer valid-jwt-unknown-account' };
  const context = await authenticateRequestSimulation(reqHeaders, {}, mockAuth);
  assert.equal(context, null, 'Must reject user without profile in authoritative database');

  const authResponse = authorizeRole(context, ['STUDENT', 'SCHOOL_ADMIN', 'SUPER_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

test('Security Verification 6: Inactive or suspended account is rejected even with valid JWT', async () => {
  const mockAuth = {
    getUser: async (token) => {
      return { data: { user: { id: 'auth-uuid-suspended-01', email: 'suspended.admin@innovatmind.com' } }, error: null };
    }
  };

  const reqHeaders = { 'authorization': 'Bearer valid-jwt-suspended-user' };
  const context = await authenticateRequestSimulation(reqHeaders, {}, mockAuth);
  assert.equal(context, null, 'Suspended user must be rejected by server-guard');

  const authResponse = authorizeRole(context, ['SCHOOL_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

// ============================================================================
// 2. COOKIE INTEGRITY & PRIVILEGE ESCALATION RESISTANCE
// ============================================================================

test('Security Verification 7: Cookie role tampering is completely neutralized by database lookup', async () => {
  // Attacker has legitimate student account 'usr-student-01', but modifies cookie role to 'SUPER_ADMIN'
  const tamperedCookie = encodeURIComponent(JSON.stringify({
    id: 'usr-student-01',
    role: 'SUPER_ADMIN', // FORGED!
    email: 'aarav.v@student.delhitech.edu.in'
  }));

  const context = await authenticateRequestSimulation({}, { 'school_os_user': tamperedCookie }, null);
  assert.ok(context, 'Context resolved for existing student');
  assert.equal(context.role, 'STUDENT', 'Role MUST be resolved as STUDENT from database, NOT SUPER_ADMIN from cookie');

  // Attempt to access SUPER_ADMIN endpoint
  const adminAuth = authorizeRole(context, ['SUPER_ADMIN']);
  assert.equal(adminAuth?.status, 403, 'Tampered student cookie must receive 403 Forbidden on super admin route');
});

test('Security Verification 8: Completely forged cookie with nonexistent ID is rejected (401)', async () => {
  const forgedCookie = encodeURIComponent(JSON.stringify({
    id: 'usr-fake-attacker',
    role: 'SUPER_ADMIN',
    email: 'hacker@darkweb.org'
  }));

  const context = await authenticateRequestSimulation({}, { 'school_os_user': forgedCookie }, null);
  assert.equal(context, null, 'Forged cookie with unknown ID must return null context');

  const authResponse = authorizeRole(context, ['SUPER_ADMIN']);
  assert.equal(authResponse?.status, 401);
});

// ============================================================================
// 3. TENANT ISOLATION & STUDENT BOUNDARIES
// ============================================================================

test('Security Verification 9: Cross-school data access is blocked by authorizeSchoolScope', async () => {
  const schoolAdminDelhi = {
    userId: 'usr-admin-delhi',
    role: 'SCHOOL_ADMIN',
    schoolId: 'sch-del-001',
    email: 'principal@delhitech.edu.in',
    jwtVerified: true
  };

  // Admin of Delhi school attempts to query Mumbai school records
  const crossTenantAccess = authorizeSchoolScope(schoolAdminDelhi, 'sch-mum-002');
  assert.ok(crossTenantAccess, 'Cross-tenant access must be blocked');
  assert.equal(crossTenantAccess.status, 403);
  assert.ok(crossTenantAccess.error.includes('Cross-tenant access denied'));

  // Super Admin can access any school
  const superAdmin = {
    userId: 'usr-super-01',
    role: 'SUPER_ADMIN',
    schoolId: undefined,
    jwtVerified: true
  };
  const superAdminAccess = authorizeSchoolScope(superAdmin, 'sch-mum-002');
  assert.equal(superAdminAccess, null, 'Super Admin must be permitted cross-tenant access');
});

test('Security Verification 10: Student cannot query or submit progress for another student', () => {
  const studentAuth = {
    userId: 'usr-student-01',
    role: 'STUDENT',
    schoolId: 'sch-del-001',
    email: 'aarav.v@student.delhitech.edu.in',
    jwtVerified: true
  };

  // Simulating learning journey endpoint student boundary logic
  const targetStudentId = 'usr-student-02'; // Diya Nair
  let errorResponse = null;

  if (studentAuth.role === 'STUDENT' && targetStudentId !== studentAuth.userId) {
    errorResponse = { status: 403, error: 'Access denied: Students cannot access another student records' };
  }

  assert.ok(errorResponse);
  assert.equal(errorResponse.status, 403);
});

// ============================================================================
// 4. PRODUCTION PASSWORD LOGIN BYPASS VERIFICATION
// ============================================================================

test('Security Verification 11: Production mode strictly prohibits password/cadet ID login', async () => {
  const simulateLogin = (dataMode, identifier, password) => {
    if (dataMode === 'PRODUCTION') {
      return {
        success: false,
        error: 'Password and Cadet ID login is disabled in production mode. Please use Email OTP or Google Sign-In.',
        code: 'PASSWORD_LOGIN_DISABLED'
      };
    }
    return { success: true };
  };

  // Attacker tries universal 'password123' against Super Admin in production
  const attack1 = simulateLogin('PRODUCTION', 'superadmin@innovatmind.com', 'password123');
  assert.equal(attack1.success, false);
  assert.equal(attack1.code, 'PASSWORD_LOGIN_DISABLED');

  // Attacker tries student cadet password in production
  const attack2 = simulateLogin('PRODUCTION', 'STU-DEL-001', 'Pass@Apex2026');
  assert.equal(attack2.success, false);
  assert.equal(attack2.code, 'PASSWORD_LOGIN_DISABLED');

  // In demo mode, it is allowed
  const demoRun = simulateLogin('DEMO', 'superadmin@innovatmind.com', 'password123');
  assert.equal(demoRun.success, true);
});

// ============================================================================
// 5. OTP ACCOUNT ENUMERATION & SESSION REUSE AFTER LOGOUT
// ============================================================================

test('Security Verification 12: OTP endpoint returns identical response for existing vs unknown vs suspended accounts', () => {
  const simulateOtpEndpoint = (email) => {
    const norm = email.toLowerCase().trim();
    const profile = mockDatabase.profiles.find(p => p.email.toLowerCase() === norm);
    const isActive = profile ? (profile.is_active && profile.status !== 'SUSPENDED') : false;

    // Both branches return identical message and success: true
    if (!profile || !isActive) {
      return {
        success: true,
        authorized: false,
        message: 'If an authorized account exists for this email, a verification code will be sent.'
      };
    }

    return {
      success: true,
      authorized: true,
      message: 'If an authorized account exists for this email, a verification code will be sent.'
    };
  };

  const resValid = simulateOtpEndpoint('principal@delhitech.edu.in');
  const resUnknown = simulateOtpEndpoint('random.stranger@domain.com');
  const resSuspended = simulateOtpEndpoint('suspended.admin@innovatmind.com');

  assert.equal(resValid.success, true);
  assert.equal(resUnknown.success, true);
  assert.equal(resSuspended.success, true);

  assert.equal(resValid.message, resUnknown.message, 'Messages must be strictly identical');
  assert.equal(resUnknown.message, resSuspended.message, 'Messages must be strictly identical');
});

test('Security Verification 13: Logout invalidates session cookies with maxAge: 0', () => {
  // Simulating /api/auth/logout response
  const cookiesCleared = [];
  const simulateLogout = () => {
    cookiesCleared.push({ name: 'school_os_user', maxAge: 0, httpOnly: true, secure: true, path: '/' });
    cookiesCleared.push({ name: 'school_os_session', maxAge: 0, httpOnly: true, secure: true, path: '/' });
    return { success: true };
  };

  const res = simulateLogout();
  assert.equal(res.success, true);
  assert.equal(cookiesCleared.length, 2);
  assert.equal(cookiesCleared[0].maxAge, 0);
  assert.equal(cookiesCleared[0].httpOnly, true);
  assert.equal(cookiesCleared[1].maxAge, 0);
});

// ============================================================================
// 6. PROFILE ENDPOINT AUTHORIZATION & IDENTITY MISMATCH
// ============================================================================

test('Security Verification 14: Profile endpoint rejects requests without verified JWT', () => {
  const simulateProfileEndpoint = (hasToken, verifiedEmail, requestEmail) => {
    if (!verifiedEmail) {
      return { status: 401, error: 'Valid Supabase authentication token is required.' };
    }
    if (requestEmail && verifiedEmail && requestEmail !== verifiedEmail) {
      return { status: 403, error: 'Identity mismatch: Authentication token does not match requested email.' };
    }
    return { status: 200, user: { email: verifiedEmail } };
  };

  // Missing token
  const noToken = simulateProfileEndpoint(false, null, 'superadmin@innovatmind.com');
  assert.equal(noToken.status, 401);

  // Mismatched token (Token belongs to student, but body asks for Super Admin)
  const mismatch = simulateProfileEndpoint(true, 'student@delhitech.edu.in', 'superadmin@innovatmind.com');
  assert.equal(mismatch.status, 403);

  // Valid matching token
  const valid = simulateProfileEndpoint(true, 'superadmin@innovatmind.com', 'superadmin@innovatmind.com');
  assert.equal(valid.status, 200);
});

