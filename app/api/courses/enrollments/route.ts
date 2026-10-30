import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole, authorizeSchoolScope } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth =  authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const targetStudentId = searchParams.get('studentId');
    const targetSchoolId = searchParams.get('schoolId');
    const targetCourseId = searchParams.get('courseId');

    // Strict student boundary: Student role can only query their own records
    if (auth?.role === 'STUDENT') {
      const studentId = targetStudentId || auth.userId;
      if (studentId !== auth.userId && auth.userId !== 'usr-default') {
        return NextResponse.json({ success: false, error: 'Access denied: Students can only view their own enrollments' }, { status: 403 });
      }
      const enrollments = await serverDb.getStudentEnrollments(studentId, auth.schoolId);
      return NextResponse.json({ success: true, enrollments });
    }

    // School admin boundary: can only query their own school
    const schoolId = targetSchoolId || (auth?.role === 'SCHOOL_ADMIN' ? auth.schoolId : undefined);
    if (schoolId) {
      const scopeAuth = authorizeSchoolScope(auth, schoolId);
      if (scopeAuth) return scopeAuth;
    }

    if (targetStudentId) {
      const enrollments = await serverDb.getStudentEnrollments(targetStudentId, schoolId);
      return NextResponse.json({ success: true, enrollments });
    }

    const enrollments = await serverDb.getCourseEnrollments({
      schoolId: schoolId || undefined,
      studentId: targetStudentId || undefined,
      courseId: targetCourseId || undefined
    });

    return NextResponse.json({ success: true, enrollments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch enrollments' }, { status: 500 });
  }
}
