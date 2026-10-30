import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const allSchools = await serverDb.getSchools();

    // If user is SCHOOL_ADMIN, TEACHER, or STUDENT, restrict to their assigned school
    if (auth && auth.role !== 'SUPER_ADMIN' && auth.schoolId) {
      const scoped = allSchools.filter(s => s.id === auth.schoolId);
      return NextResponse.json({ schools: scoped });
    }

    // Super Admin receives all schools
    return NextResponse.json({ schools: allSchools });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch schools' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json();

    // Super Admin can directly provision ACTIVE schools; public self-registrations strictly require approval
    const isSuperAdmin = auth?.role === 'SUPER_ADMIN';
    const schoolData = {
      ...body,
      onboardingStatus: isSuperAdmin ? (body.onboardingStatus || 'ACTIVE') : 'PENDING_APPROVAL',
      isActive: isSuperAdmin ? (body.isActive !== false) : false
    };

    const createdSchool = await serverDb.createSchool(schoolData);
    return NextResponse.json({ success: true, school: createdSchool }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register school' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    const { schoolId, action, reason, schoolSnapshot, ...updates } = body;
    if (!schoolId) {
      return NextResponse.json({ error: 'Missing required field: schoolId' }, { status: 400 });
    }

    if (action === 'approve') {
      const result = await serverDb.approveSchool(schoolId, auth?.email || auth?.userId || 'Super Admin HQ', schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School approved and activated successfully' });
    }

    if (action === 'reject') {
      const result = await serverDb.rejectSchool(schoolId, reason, auth?.email || auth?.userId || 'Super Admin HQ', schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School registration rejected' });
    }

    if (action === 'revoke') {
      const result = await serverDb.revokeSchoolDeletion(schoolId, body.schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School deletion revoked and tenant restored successfully' });
    }

    if (action === 'suspend') {
      const result = await serverDb.toggleSchoolSuspension(schoolId, true, reason, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'School portal suspended successfully' });
    }

    if (action === 'activate' || action === 'unsuspend' || action === 'resume') {
      const result = await serverDb.toggleSchoolSuspension(schoolId, false, reason, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'School suspension lifted and portal reactivated successfully' });
    }

    if (action === 'dispatch_welcome_kit') {
      const result = await serverDb.recordWelcomeKitDispatched(schoolId, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'Welcome Kit dispatched and logged successfully' });
    }

    const updated = await serverDb.updateSchool(schoolId, updates);
    return NextResponse.json({ success: true, school: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update school' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    let schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      try {
        const body = await req.json();
        schoolId = body.schoolId;
      } catch {}
    }

    if (!schoolId) {
      return NextResponse.json({ error: 'Missing required parameter: schoolId' }, { status: 400 });
    }

    const result = await serverDb.deleteSchool(schoolId);
    return NextResponse.json({
      success: true,
      deletedSchool: result.deletedSchool,
      affectedRecords: result.affectedRecords,
      message: `School '${result.deletedSchool.name}' and all associated records deleted successfully`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete school' }, { status: 400 });
  }
}
