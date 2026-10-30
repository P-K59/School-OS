import { createClient } from '@supabase/supabase-js';

const url = 'https://gbtwchghqiaozyhoiobc.supabase.co';
const key = 'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';
const supabase = createClient(url, key);

async function checkSupabase() {
  console.log('=== CHECKING SUPABASE TABLES & RLS ===');
  const candidateTables = [
    'schools',
    'profiles',
    'classes',
    'sections',
    'students',
    'courses',
    'pricing_rules',
    'school_pricing_overrides',
    'school_course_assignments',
    'course_enrollments',
    'student_course_progress',
    'attendance_records',
    'fee_structures',
    'fee_invoices',
    'payment_receipts',
    'audit_logs',
    'trainers',
    'trainer_allocations'
  ];

  const results = {};
  for (const table of candidateTables) {
    try {
      const { data, error, status } = await supabase.from(table).select('*').limit(5);
      if (error) {
        results[table] = { exists: false, error: error.message, code: error.code, status };
      } else {
        results[table] = { exists: true, count: data?.length || 0, sample: data?.slice(0, 1) };
      }
    } catch (e) {
      results[table] = { exists: false, exception: e.message };
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

checkSupabase();
