import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbtwchghqiaozyhoiobc.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';

export const isServiceRoleConfigured = Boolean(serviceRoleKey && serviceRoleKey.length > 20);

/**
 * Server-side Supabase client for API routes and background operations.
 * Uses SUPABASE_SERVICE_ROLE_KEY when configured to bypass RLS for administrative actions,
 * or falls back to anon key with strict multi-tenant boundary checks.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
