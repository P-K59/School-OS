import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN']);
    if (roleAuth) return roleAuth;

    const analytics = await serverDb.getPlatformAnalytics();
    return NextResponse.json({ analytics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch platform analytics' }, { status: 500 });
  }
}
