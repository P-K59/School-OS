import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole, authorizeSchoolScope } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId') || auth?.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId parameter is required' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, schoolId);
    if (scopeAuth) return scopeAuth;

    const gradeName = searchParams.get('gradeName') || undefined;
    const sectionName = searchParams.get('sectionName') || undefined;

    const students = await serverDb.getStudents(schoolId, gradeName, sectionName);
    return NextResponse.json({ students });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const targetSchoolId = body.schoolId || auth?.schoolId;
    if (!targetSchoolId) {
      return NextResponse.json({ error: 'schoolId is required for student admission' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, targetSchoolId);
    if (scopeAuth) return scopeAuth;

    const student = await serverDb.createStudent({ ...body, schoolId: targetSchoolId });
    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to enroll student' }, { status: 400 });
  }
}
