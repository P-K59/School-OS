import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole, authorizeSchoolScope } from '@/lib/auth/server-guard';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const schoolId = body.schoolId || auth?.schoolId;

    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 });
    }

    const scopeAuth = authorizeSchoolScope(auth, schoolId);
    if (scopeAuth) return scopeAuth;

    if (!body.courseId || !body.gradeName) {
      return NextResponse.json({ success: false, error: 'courseId and gradeName are required' }, { status: 400 });
    }

    const result = await serverDb.bulkEnrollStudents({
      schoolId,
      courseId: body.courseId,
      gradeName: body.gradeName,
      sectionName: body.sectionName,
      selectedStudentIds: body.selectedStudentIds
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      batch: result.batch,
      enrolledCount: result.enrolledCount,
      alreadyEnrolledCount: result.alreadyEnrolledCount,
      enrollments: result.enrollments
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to bulk enroll students' }, { status: 500 });
  }
}
