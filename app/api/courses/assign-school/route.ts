import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole, authorizeSchoolScope } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId') || (auth?.role === 'SCHOOL_ADMIN' ? auth.schoolId : undefined);

    if (schoolId) {
      const scopeAuth = authorizeSchoolScope(auth, schoolId);
      if (scopeAuth) return scopeAuth;
    }

    const assignments = await serverDb.getSchoolCourseAssignments(schoolId);
    return NextResponse.json({ success: true, assignments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to fetch course assignments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    if (!body.schoolId || !body.courseId) {
      return NextResponse.json({ success: false, error: 'Both schoolId and courseId are required' }, { status: 400 });
    }

    const result = await serverDb.assignCourseToSchool({
      schoolId: body.schoolId,
      courseId: body.courseId,
      academicSession: body.academicSession,
      eligibleGrades: body.eligibleGrades,
      eligibleSections: body.eligibleSections,
      startDate: body.startDate,
      endDate: body.endDate,
      capacity: body.capacity,
      appliedPricePerUnit: body.appliedPricePerUnit,
      billingBasis: body.billingBasis,
      assignedTrainerId: body.assignedTrainerId,
      notes: body.notes
    });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, assignment: result.assignment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to assign course to school' }, { status: 500 });
  }
}
