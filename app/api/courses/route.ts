import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';
import { authenticateRequest, authorizeRole } from '@/lib/auth/server-guard';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const roleAuth = authorizeRole(auth, ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT']);
    if (roleAuth) return roleAuth;

    const [courses, pricingRules] = await Promise.all([
      serverDb.getCourses(),
      serverDb.getPricingRules()
    ]);

    return NextResponse.json({ courses, pricingRules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch course catalog' }, { status: 500 });
  }
}
