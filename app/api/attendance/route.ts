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

    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const gradeName = searchParams.get('gradeName') || undefined;
    const sectionName = searchParams.get('sectionName') || undefined;

    const summary = await serverDb.getAttendanceRecords(schoolId, date, gradeName, sectionName);
    return NextResponse.json(summary);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch attendance records' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const schoolId = body.schoolId || auth?.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: 'schoolId is required' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, schoolId);
    if (scopeAuth) return scopeAuth;

    if (Array.isArray(body.marks)) {
      // Batch attendance marking
      const results = [];
      for (const m of body.marks) {
        results.push(await serverDb.markAttendance(schoolId, m.studentId, m.status, body.date, m.remarks));
      }
      return NextResponse.json({ success: true, count: results.length, records: results });
    } else {
      // Single student attendance marking
      const { studentId, status, date, remarks } = body;
      if (!studentId || !status) {
        return NextResponse.json({ error: 'studentId and status are required' }, { status: 400 });
      }

      const record = await serverDb.markAttendance(schoolId, studentId, status, date, remarks);
      return NextResponse.json({ success: true, record });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to record attendance' }, { status: 400 });
  }
}
