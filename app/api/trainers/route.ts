import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId') || undefined;

    const [trainers, allocations] = await Promise.all([
      serverDb.getTrainers(),
      serverDb.getTrainerAllocations(schoolId)
    ]);

    return NextResponse.json({ trainers, allocations }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch trainers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const body = await req.json();
    if (!body || !body.name || !body.email) {
      return NextResponse.json({ error: 'Trainer name and email are required' }, { status: 400 });
    }

    const result = await serverDb.createTrainer(body);

    return NextResponse.json({
      success: true,
      trainer: result.trainer,
      message: `Specialist trainer '${result.trainer.name}' onboarded successfully`
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to onboard trainer' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN']);
    if (roleAuth) return roleAuth;

    const { searchParams } = new URL(req.url);
    let trainerId = searchParams.get('trainerId');

    if (!trainerId) {
      try {
        const body = await req.json();
        trainerId = body.trainerId;
      } catch {}
    }

    if (!trainerId) {
      return NextResponse.json({ error: 'Missing required parameter: trainerId' }, { status: 400 });
    }

    const result = await serverDb.deleteTrainer(trainerId);
    return NextResponse.json({
      success: true,
      deletedTrainer: result.deletedTrainer,
      message: `Trainer '${result.deletedTrainer.name}' removed from roster successfully`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete trainer' }, { status: 400 });
  }
}
