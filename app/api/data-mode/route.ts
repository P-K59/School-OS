import { NextRequest, NextResponse } from 'next/server';
import { getActiveDataMode } from '@/lib/config/data-mode';

export async function GET() {
  const currentMode = getActiveDataMode();
  return NextResponse.json({
    mode: currentMode,
    isDemo: currentMode === 'DEMO',
    isProduction: currentMode === 'PRODUCTION',
    status: 'ONLINE',
    database: 'PostgreSQL Multi-Tenant Production Gateway',
    timestamp: new Date().toISOString()
  });
}
