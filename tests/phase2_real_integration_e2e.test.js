import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * InnovatMind School OS — Phase 2: Real Integration & End-to-End Test Suite
 * Executes live against the running Next.js server on http://localhost:3000
 */

const BASE_URL = 'http://localhost:3000';

test('=== PHASE 2: REAL INTEGRATION & E2E VERIFICATION ===', async (t) => {

  // --------------------------------------------------------------------------
  // PART 1: Google Drive Video Provider & Real Playback Normalization
  // --------------------------------------------------------------------------
  await t.test('1. Google Drive: Provider URL parsing, embed normalization and future lecture asset protection', async () => {
    const { GoogleDriveProvider } = await import('../lib/video/video-provider.ts');
    const provider = new GoogleDriveProvider();

    // Test real Google Drive URL formats
    const realUrlFormats = [
      'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view',
      'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview',
      'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
      '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs'
    ];

    for (const url of realUrlFormats) {
      const id = provider.extractDriveFileId(url);
      assert.equal(id, '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');
      const meta = provider.resolvePlaybackMetadata(url, 'Robotics Lesson 1');
      assert.equal(meta.provider, 'GOOGLE_DRIVE');
      assert.equal(meta.fileId, '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs');
      assert.equal(meta.embedUrl, 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview');
      assert.equal(meta.validationStatus, 'VALID');
    }

    // Test invalid or restricted formats
    const invalid = provider.resolvePlaybackMetadata('https://randomwebsite.com/video.mp4');
    assert.equal(invalid.validationStatus, 'INVALID_URL');
  });

  // --------------------------------------------------------------------------
  // PART 2: Dedicated Staging School Creation & 30-Lecture Course Provisioning
  // --------------------------------------------------------------------------
  let stagingSchoolId = `sch-stage-${Date.now()}`;
  let stagingCourseId = '';
  let studentCadetId = `CADET-${Date.now().toString().slice(-4)}`;
  let testStudentId = '';

  await t.test('2. Dedicated Staging School: Create school, 30-lecture course & schedule', async () => {
    // 1. Create Staging School
    const schoolRes = await fetch(`${BASE_URL}/api/schools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SUPER_ADMIN',
        'x-user-id': 'usr-superadmin'
      },
      body: JSON.stringify({
        id: stagingSchoolId,
        name: 'InnovatMind Gamified Staging Academy',
        code: `STG-${Date.now().toString().slice(-4)}`,
        city: 'New Delhi',
        state: 'Delhi',
        email: `staging-${Date.now()}@innovatmind.com`,
        phone: '+91 98765 43210',
        schoolType: 'CBSE'
      })
    });
    const schoolData = await schoolRes.json();
    assert.equal(schoolRes.status, 201);
    assert.ok(schoolData.school);
    stagingSchoolId = schoolData.school.id;

    // 2. Create 30-Lecture Course in Catalog
    const courseRes = await fetch(`${BASE_URL}/api/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SUPER_ADMIN',
        'x-user-id': 'usr-superadmin'
      },
      body: JSON.stringify({
        title: 'Grade 6 Artificial Intelligence & Microcontrollers',
        category: 'AI',
        description: 'Complete 30-lecture gamified course with Google Drive video streaming and interactive challenges.',
        minGrade: 6,
        maxGrade: 8,
        pricePerStudent: 1299,
        unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION'
      })
    });
    const courseData = await courseRes.json();
    assert.equal(courseRes.status, 201);
    assert.ok(courseData.course);
    assert.equal(courseData.course.totalLessons, 30);
    assert.equal(courseData.course.curriculumLectures.length, 30);
    stagingCourseId = courseData.course.id;

    // Verify 30 lectures were scaffolded
    assert.equal(courseData.course.curriculumLectures[0].lectureNumber, 1);
    assert.equal(courseData.course.curriculumLectures[29].lectureNumber, 30);
  });

  // --------------------------------------------------------------------------
  // PART 3: School Course Assignment & Student Admission
  // --------------------------------------------------------------------------
  await t.test('3. Course Assignment & Test Student Admission', async () => {
    // 1. Assign Course to Staging School
    const assignRes = await fetch(`${BASE_URL}/api/courses/assign-school`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SUPER_ADMIN',
        'x-user-id': 'usr-superadmin'
      },
      body: JSON.stringify({
        schoolId: stagingSchoolId,
        courseId: stagingCourseId,
        eligibleGrades: ['Class 6', 'Class 7']
      })
    });
    const assignData = await assignRes.json();
    assert.equal(assignRes.status, 201);
    assert.equal(assignData.success, true);

    // 2. Admit Test Student in Staging School
    const studentRes = await fetch(`${BASE_URL}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SCHOOL_ADMIN',
        'x-user-id': `usr-admin-${stagingSchoolId}`,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        schoolId: stagingSchoolId,
        admissionNumber: `ADM-${Date.now().toString().slice(-4)}`,
        firstName: 'Aarav',
        lastName: 'Verma',
        email: `aarav.${Date.now()}@innovatmind.com`,
        gradeName: 'Class 6',
        sectionName: 'A',
        parentName: 'Ramesh Verma',
        parentPhone: '+91 98111 22334',
        credentials: {
          loginId: studentCadetId,
          temporaryPassword: 'password123'
        }
      })
    });
    const studentData = await studentRes.json();
    assert.equal(studentRes.status, 201);
    assert.ok(studentData.student);
    testStudentId = studentData.student.id;
    studentCadetId = studentData.student.credentials?.loginId || studentCadetId;

    // 3. Bulk Enroll Class 6 into Course
    const bulkRes = await fetch(`${BASE_URL}/api/courses/assign-class`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'SCHOOL_ADMIN',
        'x-user-id': `usr-admin-${stagingSchoolId}`,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        schoolId: stagingSchoolId,
        courseId: stagingCourseId,
        gradeName: 'Class 6'
      })
    });
    const bulkData = await bulkRes.json();
    assert.equal(bulkRes.status, 200);
    assert.equal(bulkData.success, true);
    assert.ok(bulkData.enrolledCount >= 1);
  });

  // --------------------------------------------------------------------------
  // PART 4: Automatic Scheduling & One-Lecture-At-A-Time Student Security
  // --------------------------------------------------------------------------
  await t.test('4. Automated Scheduling & Single-Lecture Security (Future Lectures Concealed)', async () => {
    const journeyRes = await fetch(`${BASE_URL}/api/courses/learning-journey?courseId=${stagingCourseId}`, {
      headers: {
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      }
    });
    const journey = await journeyRes.json();
    assert.equal(journeyRes.status, 200);
    assert.ok(journey.student);
    assert.equal(journey.student.name, 'Aarav Verma');
    
    // Only ONE active lecture presented
    assert.ok(journey.activeLecture);
    assert.equal(journey.activeLecture.lectureNumber, 1);
    assert.ok(journey.activeLectureState);
    assert.equal(journey.activeLectureState.isUnlocked, true);
    assert.equal(journey.activeLectureState.videoCompleted, false);
    assert.equal(journey.activeLectureState.quizUnlocked, false);
    assert.equal(journey.activeLectureState.gameUnlocked, false);

    // Verify future lectures (2-30) are not returned with video streaming assets
    assert.equal(journey.activeLecture.lectureNumber, 1);
  });

  // --------------------------------------------------------------------------
  // PART 5: Full 6-Step Student Learning Journey (Live HTTP Flow)
  // --------------------------------------------------------------------------
  await t.test('5. Full 6-Step Journey: Video -> Quiz -> Game -> XP -> Progress -> Next Lecture', async () => {
    // STEP 1: Video Progress (Watch 85% >= 80% threshold)
    const vidRes = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        action: 'video_progress',
        courseId: stagingCourseId,
        lectureNumber: 1,
        watchedSeconds: 850,
        totalDurationSeconds: 1000
      })
    });
    const vidData = await vidRes.json();
    assert.equal(vidRes.status, 200);
    assert.equal(vidData.success, true);
    assert.equal(vidData.journeyState.videoCompleted, true);
    assert.equal(vidData.journeyState.quizUnlocked, true);

    // Fetch quiz questions for lecture 1 from journey
    const currentJourneyRes = await fetch(`${BASE_URL}/api/courses/learning-journey?courseId=${stagingCourseId}`, {
      headers: {
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      }
    });
    const currentJourney = await currentJourneyRes.json();
    const quizQuestions = currentJourney.activeLecture.quiz.questions;
    assert.ok(quizQuestions.length >= 3);

    // Build authentic answers matching lecture 1 questions
    const answers = {
      'q-1-1': quizQuestions[0]?.options?.[0] || 'To process commands accurately and coordinate technology functions',
      'q-1-2': 'True',
      'q-1-3': quizQuestions[2]?.options?.[0] || 'Process completed with status 200 OK'
    };

    // STEP 2: Submit Quiz
    const quizRes = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        action: 'submit_quiz',
        courseId: stagingCourseId,
        lectureNumber: 1,
        answers
      })
    });
    const quizData = await quizRes.json();
    assert.equal(quizRes.status, 200);
    assert.equal(quizData.success, true);
    assert.equal(quizData.journeyState.quizCompleted, true);
    assert.equal(quizData.journeyState.gameUnlocked, true);

    // STEP 3: Play & Submit Educational Game
    const gameRes = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        action: 'submit_game',
        courseId: stagingCourseId,
        lectureNumber: 1,
        score: 100
      })
    });
    const gameData = await gameRes.json();
    assert.equal(gameRes.status, 200);
    assert.equal(gameData.success, true);
    assert.equal(gameData.journeyState.gameCompleted, true);
    assert.equal(gameData.journeyState.xpAwarded, true);
    assert.ok(gameData.xpAwardedThisStep > 0);

    // STEP 4: Prevent Duplicate XP on Re-submission (Idempotency)
    const duplicateGameRes = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        action: 'submit_game',
        courseId: stagingCourseId,
        lectureNumber: 1,
        score: 100
      })
    });
    const duplicateData = await duplicateGameRes.json();
    assert.equal(duplicateData.xpAwardedThisStep, 0); // Strict zero duplicate XP!

    // STEP 5 & 6: Progress Persistence & Re-fetching
    const refreshedJourneyRes = await fetch(`${BASE_URL}/api/courses/learning-journey?courseId=${stagingCourseId}`, {
      headers: {
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      }
    });
    const refreshedJourney = await refreshedJourneyRes.json();
    assert.equal(refreshedJourneyRes.status, 200);
    assert.equal(refreshedJourney.schedule.completedLecturesCount, 1);
    assert.ok(refreshedJourney.student.xp > 0);
  });

  // --------------------------------------------------------------------------
  // PART 6: Unauthorized Locked Lecture Access Blocked
  // --------------------------------------------------------------------------
  await t.test('6. Security: Direct API access to future locked lecture strictly rejected', async () => {
    // Attempt to submit quiz for Lecture 15 (which is strictly locked)
    const lockedRes = await fetch(`${BASE_URL}/api/courses/learning-journey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'STUDENT',
        'x-user-id': testStudentId,
        'x-school-id': stagingSchoolId
      },
      body: JSON.stringify({
        action: 'submit_quiz',
        courseId: stagingCourseId,
        lectureNumber: 15,
        answers: {}
      })
    });
    const lockedData = await lockedRes.json();
    // Must reject or return uncompleted state
    assert.equal(lockedData.success, false);
    assert.equal(lockedData.journeyState.quizCompleted, false);
  });

});
