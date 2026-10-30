import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/db/server-db';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = 
      searchParams.get('id') || 
      searchParams.get('query') || 
      searchParams.get('email') || 
      searchParams.get('code');

    if (!query || !query.trim()) {
      return NextResponse.json(
        { found: false, error: 'Please provide a valid Registration ID (e.g. IMS-2026-XXXXXX) or official email address.' },
        { status: 400 }
      );
    }

    const result = await serverDb.lookupSchoolStatus(query.trim());

    if (!result.found || !result.school) {
      return NextResponse.json(
        { found: false, error: result.error || 'No registration record found for the provided identifier.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      found: true,
      school: result.school
    });
  } catch (err: any) {
    return NextResponse.json(
      { found: false, error: err.message || 'An error occurred while looking up application status.' },
      { status: 500 }
    );
  }
}
