import { NextRequest, NextResponse } from 'next/server';
import { getActiveDataMode } from '@/lib/config/data-mode';
import { supabaseAdmin, isServiceRoleConfigured } from '@/lib/supabase/server-client';

export async function GET() {
  const currentMode = getActiveDataMode();
  let supabaseStatus = 'NOT_CONFIGURED';
  let supabaseSchoolCount = 0;
  let supabaseError: string | null = null;

  try {
    if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
      const { data, count, error } = await supabaseAdmin
        .from('schools')
        .select('id', { count: 'exact' });

      if (error) {
        supabaseStatus = 'ERROR';
        supabaseError = error.message;
      } else {
        supabaseStatus = 'CONNECTED';
        supabaseSchoolCount = count !== null ? count : (data ? data.length : 0);
      }
    }
  } catch (err: any) {
    supabaseStatus = 'EXCEPTION';
    supabaseError = err.message;
  }

  return NextResponse.json({
    mode: currentMode,
    isDemo: currentMode === 'DEMO',
    isProduction: currentMode === 'PRODUCTION',
    status: 'ONLINE',
    database: 'PostgreSQL Multi-Tenant Production Gateway',
    supabase: {
      status: supabaseStatus,
      isServiceRoleConfigured,
      remoteSchoolCount: supabaseSchoolCount,
      error: supabaseError
    },
    timestamp: new Date().toISOString()
  });
}
