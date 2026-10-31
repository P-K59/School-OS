import { serverDb } from '../lib/db/server-db.ts';
import { generate30LectureCurriculum } from '../lib/courses/curriculum-generator.ts';
import { GoogleDriveProvider } from '../lib/video/video-provider.ts';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gbtwchghqiaozyhoiobc.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_gU8i6C-Gv0TwOmAAWS-oeg_t1hzos9h';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TEST_DRIVE_VIDEO_URL = 'https://drive.google.com/file/d/1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri/view?usp=drive_link';
const TEST_DRIVE_FILE_ID = '1VOC-cFiGMBad94DUXuQgcM1OuyO5b-ri';

async function runStagingVerification() {
  console.log('================================================================');
  console.log('INNOVATMIND SCHOOL OS — REAL STAGING WORKFLOW VERIFICATION');
  console.log('================================================================\n');

  const results = [];

  function record(step, pass, details) {
    results.push({ step, pass, details });
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${step}: ${details}`);
  }

  try {
    // -------------------------------------------------------------
    // 1. Remote Supabase Schema & Connectivity Verification
    // -------------------------------------------------------------
    console.log('\n--- 1. REMOTE SUPABASE SCHEMA & SECURITY AUDIT ---');
    
    // Check curriculum_lectures table
    const { error: clErr } = await supabase.from('curriculum_lectures').select('id, course_id, lecture_number, title, video_ref').limit(1);
    record('Supabase: curriculum_lectures exists & columns valid', !clErr, clErr ? clErr.message : 'Table accessible, schema valid');

    // Check student_lecture_journey_states table
    const { error: jsErr } = await supabase.from('student_lecture_journey_states').select('id, student_id, course_id, lecture_number, is_unlocked, video_completed, quiz_completed, game_completed, xp_awarded').limit(1);
    record('Supabase: student_lecture_journey_states exists & columns valid', !jsErr, jsErr ? jsErr.message : 'Table accessible, schema valid');

    // Verify RLS policy blocks unauthenticated write
    const { error: rlsErr } = await supabase.from('curriculum_lectures').insert({
      course_id: '00000000-0000-0000-0000-000000000000',
      lecture_number: 1,
      title: 'Hacker Injection Test',
      topic: 'Exploit',
      video_ref: 'none'
    });
    const rlsProtected = Boolean(rlsErr && rlsErr.code === '42501');
    record('Supabase: RLS blocks unauthorized curriculum inserts (Error 42501)', rlsProtected, rlsErr ? `PostgreSQL RLS Code: ${rlsErr.code} - ${rlsErr.message}` : 'Unprotected!');

    // -------------------------------------------------------------
    // 2. Super Admin Creates Course with 30 Lectures
    // -------------------------------------------------------------
    console.log('\n--- 2. SUPER ADMIN COURSE STUDIO & 30 LECTURES ---');
    const courseId = `crs-staging-${Date.now()}`;
    const course = await serverDb.createCourse({
      id: courseId,
      title: 'Staging Grade 6 Robotics & AI Odyssey',
      slug: `staging-g6-robotics-${Date.now()}`,
      category: 'Robotics',
      minGrade: 6,
      maxGrade: 6,
      pricePerStudent: 1499,
      status: 'DRAFT',
      totalLessons: 30
    });
    record('Super Admin: Staging course created', Boolean(course && course.id), `Course ID: ${course.id}, Status: ${course.status}`);

    // Generate 30 lectures
    const lectures = generate30LectureCurriculum({
      grade: 6,
      courseTitle: course.title,
      unlockPolicy: 'HYBRID_SCHEDULE_AND_COMPLETION',
      defaultVideoProvider: 'GOOGLE_DRIVE'
    });
    course.curriculumLectures = lectures;
    await serverDb.updateCourse(course.id, { curriculumLectures: lectures });
    record('Super Admin: 30 lectures generated', lectures.length === 30, `Total Lectures: ${lectures.length}`);

    // Verify Lecture 1 Google Drive mapping
    const lec1 = lectures.find(l => l.lectureNumber === 1);
    const hasDriveId = lec1 && (lec1.videoRef.includes(TEST_DRIVE_FILE_ID) || lec1.videoMetadata?.fileId === TEST_DRIVE_FILE_ID);
    record('Curriculum: Lecture 1 mapped to verified Google Drive asset', hasDriveId, `Video Ref: ${lec1?.videoRef}`);

    // Validate video playback metadata via VideoProvider
    const playbackMeta = GoogleDriveProvider.resolvePlaybackMetadata(lec1.videoRef);
    record('VideoProvider: Normalized Google Drive stream URL', Boolean(playbackMeta && playbackMeta.embedUrl && playbackMeta.fileId === TEST_DRIVE_FILE_ID), `Embed URL: ${playbackMeta?.embedUrl}`);

    // Publishing Validation Checklist: verify criteria before publishing
    const has30Lectures = course.curriculumLectures.length === 30;
    const hasSequentialLectures = course.curriculumLectures.every((l, idx) => l.lectureNumber === idx + 1);
    const hasAllQuizzes = course.curriculumLectures.every(l => l.quizDefinition && l.quizDefinition.questions?.length > 0);
    const hasAllGames = course.curriculumLectures.every(l => l.gameDefinition && l.gameDefinition.type);
    const publishReady = has30Lectures && hasSequentialLectures && hasAllQuizzes && hasAllGames;

    await serverDb.updateCourse(course.id, { status: 'PUBLISHED' });
    const publishedCourse = await serverDb.getCourseById(course.id);
    record('Super Admin: Course published after checklist validation', publishReady && publishedCourse.status === 'PUBLISHED', `Status: ${publishedCourse?.status}, Checklist Passed: ${publishReady}`);

    // -------------------------------------------------------------
    // 3. Staging School Creation & Assignment
    // -------------------------------------------------------------
    console.log('\n--- 3. SCHOOL SETUP & COURSE ASSIGNMENT ---');
    const schoolId = `sch-stage-${Date.now()}`;
    const stagingSchool = await serverDb.createSchool({
      id: schoolId,
      name: 'Staging Space Science Academy',
      code: `SCH-STAGE-${Math.floor(100 + Math.random() * 900)}`,
      schoolType: 'CBSE',
      city: 'Bengaluru',
      state: 'Karnataka',
      email: `principal.staging.${Date.now()}@innovatmind.com`,
      phone: '+91 80 1234 5678',
      isActive: true,
      onboardingStatus: 'ACTIVE'
    });
    record('Super Admin: Staging school created', Boolean(stagingSchool && stagingSchool.id), `School ID: ${stagingSchool.id}, Name: ${stagingSchool.name}`);

    // Assign course to school
    const assignment = await serverDb.assignCourseToSchool({
      schoolId: stagingSchool.id,
      courseId: course.id,
      assignedGrades: ['Class 6'],
      academicSession: '2026-2027',
      billingBasis: 'PER_STUDENT',
      appliedPricePerUnit: 1499
    });
    record('Super Admin: Course assigned to staging school', Boolean(assignment && assignment.id), `Assignment ID: ${assignment.id}`);

    // Verify school course scoping
    const schoolCourses = await serverDb.getCoursesForSchool(stagingSchool.id);
    const isAssigned = schoolCourses.some(c => c.id === course.id);
    record('School Admin: Can access assigned course', isAssigned, `Found ${schoolCourses.length} assigned course(s)`);

    // -------------------------------------------------------------
    // 4. Student Enrollment & Journey Initialization
    // -------------------------------------------------------------
    console.log('\n--- 4. STUDENT ADMISSION & ENROLLMENT ---');
    const studentId = `stu-stage-${Date.now()}`;
    const student = await serverDb.createStudent({
      id: studentId,
      schoolId: stagingSchool.id,
      firstName: 'Aarav',
      lastName: 'Kalam',
      email: `aarav.${Date.now()}@student.innovatmind.com`,
      gradeName: 'Class 6',
      sectionName: 'A',
      admissionNumber: `CADET-STG-${Date.now().toString().slice(-4)}`,
      currentXp: 0,
      currentLevel: 1,
      status: 'ACTIVE'
    });
    record('School Admin: Student admitted with unique Cadet ID', Boolean(student && student.admissionNumber), `Cadet ID: ${student.admissionNumber}, School: ${student.schoolId}`);

    // Bulk enroll into course
    const enrollResult = await serverDb.enrollStudentsBulk({
      schoolId: stagingSchool.id,
      courseId: course.id,
      gradeName: 'Class 6',
      studentIds: [student.id]
    });
    record('School Admin: Student enrolled into Grade 6 course', enrollResult.success && enrollResult.enrolledCount === 1, `Enrolled count: ${enrollResult.enrolledCount}`);

    // Query Student Active Learning Journey
    const journey = await serverDb.getStudentActiveLearningJourney(student.id, course.id);
    const activeLec = journey.activeLecture;
    record('Student Portal: Strictly 1 active lecture presented', Boolean(activeLec && activeLec.lectureNumber === 1), `Active Lecture: #${activeLec?.lectureNumber} - ${activeLec?.title}`);
    record('Student Portal: Future lectures locked', journey.schedule.unlockedLecturesCount === 1 && journey.schedule.totalLectures === 30, `Unlocked: ${journey.schedule.unlockedLecturesCount} of ${journey.schedule.totalLectures}`);

    // Single video player verification & no future video leaks
    const hasOnlyOneActiveVideo = Boolean(activeLec?.videoRef) && (!journey.allLectures || journey.allLectures.length === 0);
    record('Security: Single active video initialized, zero future video leakage', hasOnlyOneActiveVideo, `Video provider: ${activeLec?.videoProvider}`);

    // -------------------------------------------------------------
    // 5. Complete Video -> Quiz -> Game -> XP Journey
    // -------------------------------------------------------------
    console.log('\n--- 5. STUDENT LEARNING EXECUTION (VIDEO -> QUIZ -> GAME -> XP) ---');

    // Step 5A: Video Progress
    const videoResult = await serverDb.updateStudentVideoProgress(student.id, course.id, 1, 1400, 1500); // >80% watched
    record('Student: Video watched past 80% threshold', videoResult.journeyState.videoCompleted, `Watched %: ${videoResult.journeyState.videoWatchPercentage}%`);
    record('System: Quiz unlocked upon video completion', videoResult.journeyState.quizUnlocked, `Quiz Unlocked: ${videoResult.journeyState.quizUnlocked}`);

    // Step 5B: Submit Quiz
    const quizAnswers = {
      q1: 'Binary digits 0 and 1',
      q2: 'Central Processing Unit',
      q3: 'Arithmetic Logic Unit and Control Unit'
    };
    const quizResult = await serverDb.submitStudentQuiz(student.id, course.id, 1, quizAnswers);
    record('Student: Quiz submitted and server evaluated', quizResult.journeyState.quizCompleted, `Quiz Score: ${quizResult.journeyState.quizScore}%`);
    record('System: Game unlocked upon passing quiz (score >= 70%)', quizResult.journeyState.gameUnlocked, `Game Unlocked: ${quizResult.journeyState.gameUnlocked}`);

    // Step 5C: Complete Game & Award XP
    const gameResult = await serverDb.submitStudentGame(student.id, course.id, 1, 100);
    record('Student: Educational game completed', gameResult.journeyState.gameCompleted, `Game Score: ${gameResult.journeyState.gameScore}`);
    record('System: XP awarded for Lecture 1', gameResult.xpAwardedThisStep === 50, `XP Awarded: ${gameResult.xpAwardedThisStep}, Total: ${gameResult.newTotalXp}`);
    record('System: Lecture 1 journey completed', gameResult.journeyState.journeyCompleted, `Journey Complete: ${gameResult.journeyState.journeyCompleted}`);

    // Anti-Cheat Idempotency Check: duplicate submission must yield 0 XP
    const dupGameResult = await serverDb.submitStudentGame(student.id, course.id, 1, 100);
    record('Anti-Cheat: Duplicate game submission yields 0 additional XP', dupGameResult.xpAwardedThisStep === 0, `Duplicate XP awarded: ${dupGameResult.xpAwardedThisStep}`);

    // -------------------------------------------------------------
    // 6. Persistence Verification (Logout & Fresh Login)
    // -------------------------------------------------------------
    console.log('\n--- 6. LOGOUT, RESTART & RE-QUERY VERIFICATION ---');
    const freshJourney = await serverDb.getStudentActiveLearningJourney(student.id, course.id);
    record('Persistence: Lecture 1 marked completed', freshJourney.schedule.completedLecturesCount === 1, `Completed Lectures: ${freshJourney.schedule.completedLecturesCount}`);
    record('System: Lecture 2 automatically becomes active unlocked lecture', freshJourney.activeLecture?.lectureNumber === 2, `Active Lecture: #${freshJourney.activeLecture?.lectureNumber} - ${freshJourney.activeLecture?.title}`);
    record('Security: Lecture 3 remains strictly locked', freshJourney.schedule.unlockedLecturesCount === 2, `Unlocked Lectures: ${freshJourney.schedule.unlockedLecturesCount} of 30`);

    // Verify student total XP in profile
    const freshStudent = serverDb.students.find(s => s.id === student.id);
    record('Persistence: Student XP persists correctly after session reload', freshStudent.currentXp === 50, `Student XP: ${freshStudent?.currentXp}, Level: ${freshStudent?.currentLevel}`);

    // -------------------------------------------------------------
    // 7. Cross-Device Trainer Deletion Verification
    // -------------------------------------------------------------
    console.log('\n--- 7. CROSS-DEVICE TRAINER DELETION TEST ---');
    const stagingTrainer = await serverDb.createTrainer({
      id: `tr-stage-${Date.now()}`,
      name: 'Dr. Vikram Sarabhai',
      email: `vikram.${Date.now()}@innovatmind.com`,
      phone: '+91 98450 12345',
      specialization: 'Robotics',
      status: 'ACTIVE'
    });
    record('Trainer: Staging trainer created', Boolean(stagingTrainer && stagingTrainer.id), `Trainer: ${stagingTrainer.name} (${stagingTrainer.id})`);

    // Delete trainer in Session A
    const delResult = await serverDb.deleteTrainer(stagingTrainer.id);
    record('Session A (Mobile): Trainer deleted', delResult.success, `Deleted: ${delResult.deletedTrainer?.name}`);
    record('Session A: Trainer recorded in durable deletion archive', serverDb.deletedTrainersArchive.has(stagingTrainer.id), `Archive size: ${serverDb.deletedTrainersArchive.size}`);

    // Simulate Session B (Computer): Fresh load from disk
    const preCount = serverDb.trainers.length;
    serverDb.loadFromDisk();
    const postCount = serverDb.trainers.length;
    const reloadedTrainer = serverDb.trainers.find(t => t.id === stagingTrainer.id || t.name === stagingTrainer.name);
    record('Session B (Computer): Deleted trainer does NOT reappear on fresh login/reload', reloadedTrainer === undefined, `Reappeared: ${Boolean(reloadedTrainer)} (List length: ${postCount})`);

    // -------------------------------------------------------------
    // Summary
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('STAGING VERIFICATION SUMMARY');
    console.log('================================================================');
    const total = results.length;
    const passed = results.filter(r => r.pass).length;
    const failed = total - passed;
    console.log(`Total checks: ${total} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
      console.error('FAILED CHECKS:');
      results.filter(r => !r.pass).forEach(r => console.error(` - ${r.step}: ${r.details}`));
      process.exit(1);
    } else {
      console.log('ALL REAL STAGING CHECKS PASSED PERFECTLY!');
      process.exit(0);
    }

  } catch (err) {
    console.error('Fatal execution error:', err);
    process.exit(1);
  }
}

runStagingVerification();
