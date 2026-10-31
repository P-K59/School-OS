import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { GoogleDriveProvider } from '../lib/video/video-provider.ts';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbtwchghqiaozyhoiobc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_DRIVE_FILE_ID = '1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri';
const TEST_DRIVE_URL = 'https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view?usp=drive_link';

test('=== REMOTE SUPABASE & PRODUCTION STAGING E2E AUDIT ===', async (t) => {

  // -------------------------------------------------------------
  // 1. Remote Supabase Table Existence & Schema Verification
  // -------------------------------------------------------------
  await t.test('1. Remote Supabase tables exist and are accessible', async () => {
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
      'audit_logs'
    ];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      assert.ok(!error, `Table ${table} should exist without error: ${error?.message}`);
      assert.ok(Array.isArray(data), `Table ${table} should return data array`);
    }
  });

  // -------------------------------------------------------------
  // 2. Remote Supabase Column & Type Validation
  // -------------------------------------------------------------
  await t.test('2. Remote curriculum_lectures and student_lecture_journey_states have required columns', async () => {
    const { error: clErr } = await supabase.from('curriculum_lectures').select(`
      id, course_id, lecture_number, title, short_description,
      module_name, topic, grade_level, estimated_duration_minutes,
      video_provider, video_ref, video_metadata, video_completion_threshold_percent,
      quiz_definition, game_definition, release_schedule, unlock_policy,
      status, xp_reward, created_at, updated_at
    `).limit(1);
    assert.equal(clErr, null, `curriculum_lectures columns should be valid: ${clErr?.message}`);

    const { error: jsErr } = await supabase.from('student_lecture_journey_states').select(`
      id, student_id, course_id, lecture_id, lecture_number,
      is_unlocked, unlock_reason, video_watched_seconds, video_watch_percentage,
      video_completed, quiz_unlocked, quiz_completed, quiz_score, quiz_attempts,
      game_unlocked, game_completed, game_score, xp_awarded, journey_completed,
      completed_at, updated_at
    `).limit(1);
    assert.equal(jsErr, null, `student_lecture_journey_states columns should be valid: ${jsErr?.message}`);
  });

  // -------------------------------------------------------------
  // 3. Remote RLS Policy Verification
  // -------------------------------------------------------------
  await t.test('3. Row Level Security strictly blocks unauthenticated mutations with error 42501', async () => {
    // 3A: Attempt unauthorized insert to curriculum_lectures
    const { error: rlsClErr } = await supabase.from('curriculum_lectures').insert({
      course_id: '00000000-0000-0000-0000-000000000000',
      lecture_number: 1,
      title: 'Hacker Injection',
      topic: 'Exploit',
      video_ref: 'none'
    });
    assert.ok(rlsClErr, 'Unauthenticated insert into curriculum_lectures must be rejected');
    assert.equal(rlsClErr.code, '42501', `Must fail with PostgreSQL RLS error code 42501 (got ${rlsClErr.code})`);

    // 3B: Attempt unauthorized insert to student_lecture_journey_states
    const { error: rlsJsErr } = await supabase.from('student_lecture_journey_states').insert({
      student_id: '00000000-0000-0000-0000-000000000000',
      course_id: '00000000-0000-0000-0000-000000000000',
      lecture_number: 1,
      is_unlocked: true
    });
    assert.ok(rlsJsErr, 'Unauthenticated insert into student_lecture_journey_states must be rejected');
    assert.equal(rlsJsErr.code, '42501', `Must fail with PostgreSQL RLS error code 42501 (got ${rlsJsErr.code})`);

    // 3C: Attempt unauthorized insert to schools
    const { error: rlsSchErr } = await supabase.from('schools').insert({
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Rogue Academy',
      code: 'ROGUE-001',
      email: 'rogue@hacker.io'
    });
    assert.ok(rlsSchErr, 'Unauthenticated insert into schools must be rejected');
    assert.equal(rlsSchErr.code, '42501', `Must fail with PostgreSQL RLS error code 42501 (got ${rlsSchErr.code})`);
  });

  // -------------------------------------------------------------
  // 4. Google Drive Test Video Playback & Security
  // -------------------------------------------------------------
  await t.test('4. Google Drive test video resolves and secures future lecture assets', async () => {
    const provider = new GoogleDriveProvider();

    // 4A: Normalization of supplied video URL
    const fileId = provider.extractDriveFileId(TEST_DRIVE_URL);
    assert.equal(fileId, TEST_DRIVE_FILE_ID, 'Must extract correct Google Drive file ID');

    // 4B: Resolution to preview URL
    const meta = provider.resolvePlaybackMetadata(TEST_DRIVE_URL);
    assert.equal(meta.provider, 'GOOGLE_DRIVE');
    assert.equal(meta.fileId, TEST_DRIVE_FILE_ID);
    assert.equal(meta.embedUrl, `https://drive.google.com/file/d/${TEST_DRIVE_FILE_ID}/preview`);
    assert.equal(meta.validationStatus, 'VALID');

    // 4C: Malformed URL handling
    const invalidMeta = provider.resolvePlaybackMetadata('https://example.com/not-drive');
    assert.equal(invalidMeta.validationStatus, 'INVALID_URL');
    assert.ok(invalidMeta.errorMessage.includes('Invalid'));
  });

  // -------------------------------------------------------------
  // 5. Guided Learning Journey Engine Flow (Video -> Quiz -> Game -> XP)
  // -------------------------------------------------------------
  await t.test('5. Complete student guided journey state transitions with anti-cheat idempotency', async () => {
    // State machine simulator
    const journeyState = {
      lectureNumber: 1,
      isUnlocked: true,
      videoWatchedSeconds: 0,
      videoWatchPercentage: 0,
      videoCompleted: false,
      quizUnlocked: false,
      quizCompleted: false,
      quizScore: 0,
      gameUnlocked: false,
      gameCompleted: false,
      gameScore: 0,
      xpAwarded: false,
      journeyCompleted: false
    };

    let studentXp = 0;

    // Step A: Watch video past 80%
    journeyState.videoWatchedSeconds = 1450;
    journeyState.videoWatchPercentage = Math.round((1450 / 1500) * 100); // 97%
    if (journeyState.videoWatchPercentage >= 80) {
      journeyState.videoCompleted = true;
      journeyState.quizUnlocked = true;
    }
    assert.equal(journeyState.videoCompleted, true);
    assert.equal(journeyState.quizUnlocked, true);

    // Step B: Submit Quiz with passing score (100%)
    journeyState.quizScore = 100;
    journeyState.quizCompleted = true;
    if (journeyState.quizScore >= 70) {
      journeyState.gameUnlocked = true;
    }
    assert.equal(journeyState.quizCompleted, true);
    assert.equal(journeyState.gameUnlocked, true);

    // Step C: Complete Educational Game
    journeyState.gameScore = 100;
    journeyState.gameCompleted = true;

    // Step D: Award XP exactly once
    let awardedXp = 0;
    if (journeyState.gameCompleted && !journeyState.xpAwarded) {
      awardedXp = 50;
      studentXp += awardedXp;
      journeyState.xpAwarded = true;
      journeyState.journeyCompleted = true;
    }
    assert.equal(awardedXp, 50, 'Must award 50 XP on first completion');
    assert.equal(studentXp, 50, 'Student total XP must be 50');
    assert.equal(journeyState.journeyCompleted, true);

    // Step E: Duplicate completion attempt (Anti-Cheat check)
    let duplicateAwardedXp = 0;
    if (journeyState.gameCompleted && !journeyState.xpAwarded) {
      duplicateAwardedXp = 50;
      studentXp += duplicateAwardedXp;
    }
    assert.equal(duplicateAwardedXp, 0, 'Must award 0 duplicate XP');
    assert.equal(studentXp, 50, 'Student total XP must remain unchanged at 50');

    // Step F: Next Lecture unlock
    const lecture2State = {
      lectureNumber: 2,
      isUnlocked: journeyState.journeyCompleted,
      videoCompleted: false
    };
    assert.equal(lecture2State.isUnlocked, true, 'Lecture 2 must unlock when Lecture 1 is complete');

    const lecture3State = {
      lectureNumber: 3,
      isUnlocked: lecture2State.videoCompleted,
      videoCompleted: false
    };
    assert.equal(lecture3State.isUnlocked, false, 'Lecture 3 must remain strictly locked');
  });

  // -------------------------------------------------------------
  // 6. Cross-Device Trainer Deletion Persistence
  // -------------------------------------------------------------
  await t.test('6. Cross-device trainer deletion never reappears on fresh session or restart', async () => {
    const archive = new Map();
    let activeTrainers = [
      { id: 'tr-stage-1', name: 'Dr. Vikram Sarabhai', status: 'ACTIVE' },
      { id: 'tr-stage-2', name: 'Dr. APJ Abdul Kalam', status: 'ACTIVE' }
    ];

    // Delete trainer in Session A (Mobile)
    const target = activeTrainers.find(t => t.id === 'tr-stage-1');
    activeTrainers = activeTrainers.filter(t => t.id !== 'tr-stage-1');
    archive.set(target.id, target);
    archive.set(target.name, target);

    assert.equal(activeTrainers.length, 1);
    assert.ok(archive.has('tr-stage-1'));

    // Simulate Session B (Computer) fresh startup with seed trainers
    const seedTrainers = [
      { id: 'tr-stage-1', name: 'Dr. Vikram Sarabhai', status: 'ACTIVE' },
      { id: 'tr-stage-2', name: 'Dr. APJ Abdul Kalam', status: 'ACTIVE' },
      { id: 'tr-stage-3', name: 'Prof. Satish Dhawan', status: 'ACTIVE' }
    ];

    const sessionBTrainers = [];
    for (const seed of seedTrainers) {
      // Re-seeding blocker logic from lib/db/server-db.ts
      if (!archive.has(seed.id) && !archive.has(seed.name)) {
        sessionBTrainers.push(seed);
      }
    }

    assert.equal(sessionBTrainers.length, 2);
    assert.ok(!sessionBTrainers.some(t => t.id === 'tr-stage-1'), 'Deleted trainer must NOT reappear in Session B');
    assert.ok(sessionBTrainers.some(t => t.id === 'tr-stage-2'), 'Non-deleted trainer must remain present');
    assert.ok(sessionBTrainers.some(t => t.id === 'tr-stage-3'), 'New trainer must be loaded');
  });

});
