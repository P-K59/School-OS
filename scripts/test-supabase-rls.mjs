import { createClient } from '@supabase/supabase-js';

const url = 'https://gbtwchghqiaozyhoiobc.supabase.co';
const key = 'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';
const supabase = createClient(url, key);

async function testSupabaseRLS() {
  console.log('--- TESTING SUPABASE RLS & CONNECTIVITY ---');
  
  // 1. Read Test
  const { data: readData, error: readError } = await supabase.from('schools').select('*').limit(5);
  console.log('Read schools result:', { error: readError?.message || null, count: readData?.length });

  // 2. Try inserting a probe record
  const probeId = 'sch-test-' + Date.now();
  const probeCode = 'SCH-TEST-' + Math.floor(100 + Math.random() * 900);
  console.log('Testing insert into schools with probeId:', probeId);
  const { data: insertData, error: insertError } = await supabase.from('schools').insert({
    code: probeCode,
    name: 'Supabase RLS Probe Academy',
    email: `probe-${Date.now()}@supabase-probe.test`,
    phone: '+91 99999 88888',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    school_type: 'CBSE'
  }).select();

  console.log('Insert school result:', { 
    error: insertError?.message || null, 
    code: insertError?.code || null,
    inserted: insertData 
  });

  // If inserted, clean up probe record safely
  if (insertData && insertData.length > 0) {
    const insertedId = insertData[0].id;
    console.log('Cleaning up probe record with id:', insertedId);
    const { error: delError } = await supabase.from('schools').delete().eq('id', insertedId);
    console.log('Cleanup result:', { error: delError?.message || null });
  }

  // 3. Test students read
  const { data: studentsData, error: studentsError } = await supabase.from('students').select('*').limit(5);
  console.log('Read students result:', { error: studentsError?.message || null, count: studentsData?.length });

  // 4. Test courses read
  const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*').limit(5);
  console.log('Read courses result:', { error: coursesError?.message || null, count: coursesData?.length });
}

testSupabaseRLS();
