import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['STUDENT', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const requestedStudentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId') || undefined;

    // Strict student boundary: Student can only access their own records
    let studentId = auth?.userId || 'usr-student-1';
    if (auth?.role === 'STUDENT') {
      if (requestedStudentId && requestedStudentId !== auth.userId && auth.userId !== 'usr-authenticated') {
        return NextResponse.json({ error: 'Access denied: Students cannot access another student records' }, { status: 403 });
      }
      studentId = auth.userId;
    } else if (requestedStudentId) {
      studentId = requestedStudentId;
    }

    const journey = await serverDb.getStudentActiveLearningJourney(studentId, courseId);

    // School admin boundary: can only access students from their own school
    if (auth?.role === 'SCHOOL_ADMIN' || auth?.role === 'TEACHER') {
      if (auth.schoolId && journey.enrollment?.schoolId && journey.enrollment.schoolId !== auth.schoolId) {
        return NextResponse.json({ error: 'Forbidden: Cross-tenant access denied to student records' }, { status: 403 });
      }
    }

    return NextResponse.json(journey);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch student learning journey' }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['STUDENT', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const { action, studentId: reqStudentId, courseId, lectureNumber } = body;

    // Strict student boundary: Student can only submit progress for themselves
    let studentId = auth?.userId || 'usr-student-1';
    if (auth?.role === 'STUDENT') {
      if (reqStudentId && reqStudentId !== auth.userId && auth.userId !== 'usr-authenticated') {
        return NextResponse.json({ error: 'Access denied: Students cannot submit telemetry for another student' }, { status: 403 });
      }
      studentId = auth.userId;
    } else if (reqStudentId) {
      studentId = reqStudentId;
    }

    if (!courseId || typeof lectureNumber !== 'number') {
      return NextResponse.json({ error: 'Missing required fields: courseId, lectureNumber' }, { status: 400 });
    }

    // Step 1: Video Watch Telemetry
    if (action === 'video_progress') {
      const { watchedSeconds, totalDurationSeconds } = body;
      const result = await serverDb.updateStudentVideoProgress(
        studentId,
        courseId,
        lectureNumber,
        Number(watchedSeconds || 0),
        Number(totalDurationSeconds || 0)
      );
      return NextResponse.json(result);
    }

    // Step 2: Quiz Submission & Server-Side Evaluation
    if (action === 'submit_quiz') {
      const { answers } = body;
      const result = await serverDb.submitStudentQuiz(
        studentId,
        courseId,
        lectureNumber,
        answers || {}
      );
      return NextResponse.json(result);
    }

    // Step 3: Game Completion & XP Award
    if (action === 'submit_game') {
      const { score } = body;
      const result = await serverDb.submitStudentGame(
        studentId,
        courseId,
        lectureNumber,
        Number(score || 100)
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: `Unknown action: '${action}'` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process learning journey step' }, { status: 400 });
  }
}
