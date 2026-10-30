import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbtwchghqiaozyhoiobc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('=== REMOTE SUPABASE DATABASE SCHEMA AUDIT ===');
  console.log('Target URL:', supabaseUrl);
  console.log('Using Service Role Key:', Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY));

  const tables = [
    'schools',
    'profiles',
    'classes',
    'sections',
    'students',
    'courses',
    'curriculum_lectures',
    'student_lecture_journey_states',
    'course_enrollments',
    'student_course_progress',
    'school_course_assignments',
    'pricing_rules',
    'school_pricing_overrides',
    'attendance_records',
    'fee_structures',
    'fee_invoices',
    'payment_receipts',
    'audit_logs'
  ];

  const report = {};

  for (const table of tables) {
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(1);
      if (error) {
        report[table] = {
          exists: error.code !== 'PGRST205',
          status: error.code === 'PGRST205' ? 'MISSING_IN_SCHEMA' : 'RLS_RESTRICTED',
          code: error.code,
          message: error.message
        };
      } else {
        report[table] = {
          exists: true,
          status: 'ACCESSIBLE',
          rowCount: data?.length || 0
        };
      }
    } catch (err) {
      report[table] = {
        exists: false,
        status: 'EXCEPTION',
        message: err.message
      };
    }
  }

  console.log(JSON.stringify(report, null, 2));
}

runAudit();
