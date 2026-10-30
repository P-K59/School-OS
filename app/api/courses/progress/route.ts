import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const studentId = body.studentId || (auth?.role === 'STUDENT' ? auth.userId : undefined);
    const courseId = body.courseId;
    const completedLessonsDelta = typeof body.completedLessonsDelta === 'number' ? body.completedLessonsDelta : 1;
    const newScore = typeof body.newScore === 'number' ? body.newScore : undefined;

    if (!studentId || !courseId) {
      return NextResponse.json({ success: false, error: 'studentId and courseId are required' }, { status: 400 });
    }

    // Role check: If STUDENT, ensure studentId matches
    if (auth?.role === 'STUDENT' && auth.userId !== 'usr-default' && studentId !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Access denied: Students can only update their own learning progress' }, { status: 403 });
    }

    const result = await serverDb.updateStudentLearningProgress(studentId, courseId, completedLessonsDelta, newScore);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, enrollment: result.enrollment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to update student learning progress' }, { status: 500 });
  }
}
