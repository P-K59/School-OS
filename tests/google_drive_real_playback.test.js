import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { GoogleDriveProvider, VideoProviderFactory } from '../lib/video/video-provider.ts';
import { SchedulingEngine } from '../lib/learning/scheduling-engine.ts';
import { generate30LectureCurriculum } from '../lib/courses/curriculum-generator.ts';

/**
 * InnovatMind School OS — Google Drive Real Playback & Asset Protection Test Suite
 * Tests Section 4: Real Google Drive test asset (1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri)
 * Tests Section 6: One active player, zero future video leakage, embed URL formatting
 */

test('=== SECTION 4 & 6: GOOGLE DRIVE REAL PLAYBACK & ASSET PROTECTION ===', async (t) => {
  const TEST_DRIVE_URL = 'https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view?usp=drive_link';
  const EXPECTED_FILE_ID = '1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri';
  const EXPECTED_EMBED_URL = `https://drive.google.com/file/d/${EXPECTED_FILE_ID}/preview`;

  const provider = new GoogleDriveProvider();

  // Test 1: File ID extraction on actual test asset URL
  await t.test('1. File ID extraction from provided test Google Drive link', () => {
    const extractedId = provider.extractDriveFileId(TEST_DRIVE_URL);
    assert.equal(extractedId, EXPECTED_FILE_ID, 'Must extract exact Google Drive file ID');
  });

  // Test 2: Playback metadata resolution & URL normalization
  await t.test('2. Playback metadata resolution & URL normalization', () => {
    const meta = provider.resolvePlaybackMetadata(TEST_DRIVE_URL, 'Grade 6 Robotics Lesson 1');
    assert.equal(meta.provider, 'GOOGLE_DRIVE');
    assert.equal(meta.fileId, EXPECTED_FILE_ID);
    assert.equal(meta.embedUrl, EXPECTED_EMBED_URL);
    assert.equal(meta.validationStatus, 'VALID');
  });

  // Test 3: Multiple Google Drive URL formats for this file
  await t.test('3. Diverse URL formats for asset 1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri', () => {
    const formats = [
      `https://drive.google.com/file/d/${EXPECTED_FILE_ID}/view`,
      `https://drive.google.com/file/d/${EXPECTED_FILE_ID}/preview`,
      `https://drive.google.com/open?id=${EXPECTED_FILE_ID}`,
      EXPECTED_FILE_ID
    ];

    for (const url of formats) {
      const id = provider.extractDriveFileId(url);
      assert.equal(id, EXPECTED_FILE_ID, `Format failed: ${url}`);
      const meta = provider.resolvePlaybackMetadata(url);
      assert.equal(meta.embedUrl, EXPECTED_EMBED_URL);
      assert.equal(meta.validationStatus, 'VALID');
    }
  });

  // Test 4: Factory resolution
  await t.test('4. VideoProviderFactory abstraction layer', () => {
    const meta = VideoProviderFactory.resolve('GOOGLE_DRIVE', TEST_DRIVE_URL);
    assert.equal(meta.fileId, EXPECTED_FILE_ID);
    assert.equal(meta.embedUrl, EXPECTED_EMBED_URL);
    assert.equal(meta.validationStatus, 'VALID');
  });

  // Test 5: Future Lecture Protection & Sanitization (Zero Future Leakage)
  await t.test('5. Single Active Player Guarantee & Zero Future Video Leakage', () => {
    const lectures = generate30LectureCurriculum({
      grade: 6,
      courseTitle: 'Grade 6 Robotics',
      unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION'
    });

    assert.equal(lectures.length, 30, 'Must have 30 lectures');
    // Lecture 1 uses verified test asset
    assert.ok(lectures[0].videoRef.includes(EXPECTED_FILE_ID), 'Lecture 1 must reference the verified test asset');

    // Resolve student journey where student is starting Course
    const journey = SchedulingEngine.resolveStudentLearningJourney(
      lectures,
      {},
      {
        enrollmentStartDate: new Date().toISOString(),
        schoolTimezone: 'Asia/Kolkata'
      },
      'HYBRID_SCHEDULE_AND_COMPLETION'
    );

    // Verify Active Lecture is strictly Lecture 1
    assert.ok(journey.activeLecture, 'Active lecture must exist');
    assert.equal(journey.activeLecture.lectureNumber, 1, 'Only Lecture 1 must be active for fresh student');
    assert.equal(journey.unlockedLecturesCount, 1, 'Strictly 1 lecture unlocked');

    // Future locked lectures must NOT be returned as active
    const evaluations = journey.evaluations;
    assert.equal(evaluations.length, 30);
    for (let i = 1; i < evaluations.length; i++) {
      assert.equal(evaluations[i].isUnlocked, false, `Lecture ${evaluations[i].lectureNumber} must be locked`);
    }
  });

  // Test 6: Netlify Content Security Policy Check
  await t.test('6. Netlify Frame-Src CSP allows Google Drive embed', () => {
    const netlifyToml = fs.readFileSync(path.join(process.cwd(), 'netlify.toml'), 'utf-8');
    assert.ok(netlifyToml.includes('drive.google.com'), 'CSP must allow drive.google.com in frame-src');
    assert.ok(netlifyToml.includes('docs.google.com'), 'CSP must allow docs.google.com in frame-src');
  });
});
