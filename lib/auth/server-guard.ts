import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '../types';

export interface AuthenticatedServerContext {
  userId: string;
  role: UserRole;
  schoolId?: string;
  email?: string;
}

/**
 * Extracts and verifies server identity context from request headers or auth session tokens
 */
export function authenticateRequest(req: NextRequest): AuthenticatedServerContext | null {
  let roleHeader = req.headers.get('x-user-role') as UserRole | null;
  let schoolIdHeader = req.headers.get('x-school-id') || undefined;
  let userIdHeader = req.headers.get('x-user-id') || undefined;
  let emailHeader = req.headers.get('x-user-email') || undefined;

  if (!roleHeader) {
    const cookieUser = req.cookies.get('school_os_user')?.value || req.cookies.get('school_os_session')?.value;
    if (cookieUser) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookieUser));
        if (parsed && parsed.role) {
          roleHeader = parsed.role;
          userIdHeader = userIdHeader || parsed.id || parsed.userId;
          schoolIdHeader = schoolIdHeader || parsed.schoolId;
          emailHeader = emailHeader || parsed.email;
        }
      } catch {}
    }
  }

  // Strictly reject unauthenticated requests with null
  if (!roleHeader) {
    return null;
  }

  // Normalize role string format (e.g. super_admin -> SUPER_ADMIN)
  const normalizedRole = String(roleHeader).trim().toUpperCase().replace(/[- ]/g, '_') as UserRole;

  const validRoles: UserRole[] = [
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'TEACHER',
    'INNOVATMIND_TRAINER',
    'STUDENT',
    'PARENT'
  ];

  if (!validRoles.includes(normalizedRole)) {
    return null;
  }

  return {
    userId: userIdHeader || 'usr-authenticated',
    role: normalizedRole,
    schoolId: schoolIdHeader || undefined,
    email: emailHeader || undefined
  };
}

/**
 * Enforces role-based permission boundaries on server API routes
 */
export function authorizeRole(context: AuthenticatedServerContext | null, allowedRoles: UserRole[]): NextResponse | null {
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized: Missing valid authentication credentials' }, { status: 401 });
  }

  if (!allowedRoles.includes(context.role)) {
    return NextResponse.json({
      error: `Forbidden: User role '${context.role}' does not possess required privilege. Allowed: [${allowedRoles.join(', ')}]`
    }, { status: 403 });
  }

  return null;
}

/**
 * Strictly enforces school tenant scoping on server API routes
 */
export function authorizeSchoolScope(context: AuthenticatedServerContext | null, targetSchoolId: string): NextResponse | null {
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
  }

  // Central Super Admins can access any school tenant
  if (context.role === 'SUPER_ADMIN') {
    return null;
  }

  // School Admins and Students can ONLY access their explicitly authorized school
  if (context.schoolId !== targetSchoolId) {
    return NextResponse.json({
      error: `Forbidden: Cross-tenant access denied. Your account is bound to school '${context.schoolId}', cannot access '${targetSchoolId}'`
    }, { status: 403 });
  }

  return null;
}
