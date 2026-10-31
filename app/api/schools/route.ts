import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const allSchools = await serverDb.getSchools();

    // 1. If authenticated as Super Admin, return all schools with administrative data
    if (auth && auth.role === 'SUPER_ADMIN') {
      return NextResponse.json({ schools: allSchools });
    }

    // 2. If authenticated as School Admin, Teacher, or Student, restrict to their assigned school
    if (auth && auth.schoolId) {
      const scoped = allSchools.filter(s => s.id === auth.schoolId);
      return NextResponse.json({ schools: scoped });
    }

    // 3. For public / unauthenticated requests (Login page, school picker, registration status, incognito bootstrap):
    // Return all schools so users can authenticate and discover active institutions from any device or browser
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
    const targetSchoolId = schoolId || body.id;
    if (!targetSchoolId) {
      return NextResponse.json({ error: 'Missing required field: schoolId' }, { status: 400 });
    }
    const act = (action || '').toLowerCase().trim();

    if (act === 'approve') {
      const result = await serverDb.approveSchool(targetSchoolId, auth?.email || auth?.userId || 'Super Admin HQ', schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School approved and activated successfully' });
    }

    if (act === 'reject') {
      const result = await serverDb.rejectSchool(targetSchoolId, reason, auth?.email || auth?.userId || 'Super Admin HQ', schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School registration rejected' });
    }

    if (act === 'revoke') {
      const result = await serverDb.revokeSchoolDeletion(targetSchoolId, body.schoolSnapshot);
      return NextResponse.json({ success: true, school: result.school, message: 'School deletion revoked and tenant restored successfully' });
    }

    if (act === 'suspend') {
      const result = await serverDb.toggleSchoolSuspension(targetSchoolId, true, reason, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'School portal suspended successfully' });
    }

    if (act === 'activate' || act === 'unsuspend' || act === 'resume') {
      const result = await serverDb.toggleSchoolSuspension(targetSchoolId, false, reason, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'School suspension lifted and portal reactivated successfully' });
    }

    if (act === 'dispatch_welcome_kit') {
      const result = await serverDb.recordWelcomeKitDispatched(targetSchoolId, auth?.email || auth?.userId || 'Super Admin HQ');
      return NextResponse.json({ success: true, school: result.school, message: 'Welcome Kit dispatched and logged successfully' });
    }

    if (act === 'reassign_principal') {
      const result = await serverDb.reassignSchoolPrincipal(
        targetSchoolId,
        body.principalData || {
          firstName: body.firstName || 'Principal',
          lastName: body.lastName || 'Director',
          email: body.email,
          phone: body.phone,
          designation: body.designation,
          newPassword: body.newPassword
        },
        body.auditNote
      );
      return NextResponse.json({ success: true, school: result.school, message: result.message });
    }

    if (action === 'transfer_admin') {
      const result = await serverDb.transferAdministrator(
        body.userId,
        body.targetSchoolId,
        body.auditNote
      );
      return NextResponse.json({ success: true, user: result.user, message: result.message });
    }

    if (action === 'reassign_trainer') {
      const result = await serverDb.reassignTrainer(
        body.trainerId,
        schoolId,
        body.targetSchoolId,
        body.auditNote
      );
      return NextResponse.json({ success: true, trainer: result.trainer, message: result.message });
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
