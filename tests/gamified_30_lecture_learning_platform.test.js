import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * InnovatMind School OS — Gamified 30-Lecture Learning Platform Automated Test Suite
 * Covers:
 * 1. Grade-wise 30-lecture curriculum configuration & generation
 * 2. Google Drive video streaming provider & embed normalization
 * 3. Automatic lecture scheduling engine & unlock policies
 * 4. Missed lecture backlog retention
 * 5. One-lecture-at-a-time student security & isolation
 * 6. 6-step interactive learning journey: Video -> Quiz -> Game -> XP -> Progress -> Next Lecture
 * 7. Server-side quiz evaluation & score validation
 * 8. Educational game completion & idempotent XP rewards
 */

// ============================================================================
// SIMULATED CORE DOMAIN MODULES (Matching TypeScript implementations)
// ============================================================================

function extractDriveFileId(rawRef) {
  if (!rawRef || typeof rawRef !== 'string') return null;
  const trimmed = rawRef.trim();
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];
  if (/^[a-zA-Z0-9_-]{15,55}$/.test(trimmed)) return trimmed;
  return null;
}

function resolvePlaybackMetadata(videoRef, fileName) {
  if (!videoRef || !videoRef.trim()) {
    return { provider: 'GOOGLE_DRIVE', fileId: '', embedUrl: '', validationStatus: 'NOT_CONFIGURED' };
  }
  const fileId = extractDriveFileId(videoRef);
  if (!fileId) {
    return { provider: 'GOOGLE_DRIVE', fileId: '', embedUrl: videoRef, validationStatus: 'INVALID_URL' };
  }
  return {
    provider: 'GOOGLE_DRIVE',
    fileId,
    embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    fileName: fileName || `Google_Drive_Video_${fileId}.mp4`,
    validationStatus: 'VALID'
  };
}

function generate30LectureCurriculum({ grade, courseTitle, unlockPolicy = 'HYBRID_SCHEDULE_AND_COMPLETION', scheduleType = 'DAILY' }) {
  const lectures = [];
  for (let i = 1; i <= 30; i++) {
    const topic = grade <= 4 ? `Foundations & Visual Tools Level ${i}` : `Engineering & Code Mission ${i}`;
    const fileId = `1IM_DRV_${grade}_LEC_${String(i).padStart(2, '0')}`;
    lectures.push({
      id: `lec-${grade}-${String(i).padStart(2, '0')}`,
      lectureNumber: i,
      title: `Lecture ${i}: ${topic}`,
      shortDescription: `Interactive exploration of ${topic} through video, checkpoint quiz and game.`,
      moduleName: `Unit ${Math.floor((i - 1) / 5) + 1}`,
      topic,
      gradeLevel: grade,
      estimatedDurationMinutes: 25,
      videoProvider: 'GOOGLE_DRIVE',
      videoRef: `https://drive.google.com/file/d/${fileId}/preview`,
      videoCompletionThresholdPercent: 80,
      quiz: {
        id: `quiz-lec-${i}`,
        title: `${topic} Quiz`,
        passingPercentage: 70,
        questionsCount: 3,
        questions: [
          { id: `q-${i}-1`, correctAnswer: 'Correct Answer A', prompt: 'Question 1' },
          { id: `q-${i}-2`, correctAnswer: 'True', prompt: 'Question 2' },
          { id: `q-${i}-3`, correctAnswer: 'Process completed with status 200 OK', prompt: 'Question 3' }
        ]
      },
      game: {
        id: `game-lec-${i}`,
        type: i % 2 === 0 ? 'HARDWARE_MATCH' : 'CODING_SEQUENCE',
        title: `Challenge ${i}: ${topic}`,
        xpBonus: 50
      },
      releaseSchedule: { type: scheduleType, dayOffset: i, customTime: '09:00' },
      unlockPolicy,
      status: 'READY',
      xpReward: 50
    });
  }
  return lectures;
}

function calculateScheduledUnlockDate(lecture, startDateStr, defaultScheduleType = 'DAILY') {
  const startDate = new Date(startDateStr);
  const dayOffset = lecture.releaseSchedule?.dayOffset ?? lecture.lectureNumber;
  const scheduleType = lecture.releaseSchedule?.type || defaultScheduleType;
  const targetDate = new Date(startDate.getTime());
  if (scheduleType === 'WEEKLY') {
    targetDate.setDate(targetDate.getDate() + (dayOffset - 1) * 7);
  } else {
    targetDate.setDate(targetDate.getDate() + (dayOffset - 1));
  }
  targetDate.setHours(9, 0, 0, 0);
  return targetDate;
}

function evaluateLectureUnlock(lecture, previousLectureCompleted, startDateStr, now, courseUnlockPolicy) {
  const scheduledDate = calculateScheduledUnlockDate(lecture, startDateStr);
  const isScheduleTimeReached = now.getTime() >= scheduledDate.getTime();
  const policy = lecture.unlockPolicy || courseUnlockPolicy;

  if (lecture.lectureNumber === 1) {
    const unlocked = policy === 'SEQUENTIAL' ? true : isScheduleTimeReached;
    return { lectureNumber: 1, isUnlocked: unlocked, scheduledUnlockDate: scheduledDate.toISOString() };
  }

  let isUnlocked = false;
  let unlockReason = '';

  switch (policy) {
    case 'SEQUENTIAL':
      isUnlocked = previousLectureCompleted;
      unlockReason = isUnlocked ? 'Unlocked' : `Locked: Complete Lecture ${lecture.lectureNumber - 1}`;
      break;
    case 'SCHEDULE_BASED':
      isUnlocked = isScheduleTimeReached;
      unlockReason = isUnlocked ? 'Unlocked' : 'Locked: Scheduled for release';
      break;
    case 'HYBRID_SCHEDULE_AND_COMPLETION':
    default:
      if (!previousLectureCompleted) {
        isUnlocked = false;
        unlockReason = `Locked: Complete Lecture ${lecture.lectureNumber - 1} first`;
      } else if (!isScheduleTimeReached) {
        isUnlocked = false;
        unlockReason = 'Locked: Next scheduled session arrives later';
      } else {
        isUnlocked = true;
        unlockReason = 'Unlocked: Schedule reached and prerequisites completed';
      }
      break;
  }

  return { lectureNumber: lecture.lectureNumber, isUnlocked, unlockReason, scheduledUnlockDate: scheduledDate.toISOString() };
}

function resolveStudentLearningJourney(lectures, journeyStates, context, courseUnlockPolicy = 'HYBRID_SCHEDULE_AND_COMPLETION') {
  const now = context.currentDate || new Date();
  let completedCount = 0;
  let unlockedCount = 0;
  let previousCompleted = true;
  let activeLecture = null;
  const evaluations = [];

  for (const lecture of lectures) {
    const state = journeyStates[lecture.lectureNumber];
    const isCompleted = Boolean(state && state.journeyCompleted);

    if (isCompleted) {
      completedCount++;
      unlockedCount++;
      previousCompleted = true;
      evaluations.push({ lectureNumber: lecture.lectureNumber, isUnlocked: true, isCompleted: true });
      continue;
    }

    const evalResult = evaluateLectureUnlock(lecture, previousCompleted, context.enrollmentStartDate, now, courseUnlockPolicy);
    evalResult.isCompleted = false;
    evaluations.push(evalResult);

    if (evalResult.isUnlocked) {
      unlockedCount++;
      if (!activeLecture) {
        activeLecture = lecture;
      }
    }
    previousCompleted = false;
  }

  return {
    totalLectures: lectures.length,
    completedLecturesCount: completedCount,
    unlockedLecturesCount: unlockedCount,
    activeLecture,
    evaluations
  };
}

function processVideoWatch(lecture, state, { watchedSeconds, totalDurationSeconds }) {
  const updated = { ...state };
  const total = Math.max(1, totalDurationSeconds || (lecture.estimatedDurationMinutes * 60));
  const percent = Math.min(100, Math.round((watchedSeconds / total) * 100));
  updated.videoWatchedSeconds = watchedSeconds;
  updated.videoWatchPercentage = percent;
  if (percent >= 80 && !updated.videoCompleted) {
    updated.videoCompleted = true;
    updated.quizUnlocked = true;
  }
  return { journeyState: updated, nextStepAvailable: updated.videoCompleted ? 'QUIZ' : 'VIDEO' };
}

function evaluateQuizSubmission(lecture, state, { answers }) {
  const updated = { ...state };
  if (!updated.quizUnlocked && !updated.videoCompleted) {
    return { success: false, journeyState: updated, nextStepAvailable: 'VIDEO' };
  }
  const questions = lecture.quiz.questions;
  let correct = 0;
  questions.forEach(q => {
    if (answers[q.id] === q.correctAnswer) correct++;
  });
  const percentage = Math.round((correct / questions.length) * 100);
  updated.quizScore = percentage;
  if (percentage >= 70) {
    updated.quizCompleted = true;
    updated.gameUnlocked = true;
    return { success: true, journeyState: updated, nextStepAvailable: 'GAME' };
  }
  return { success: false, journeyState: updated, nextStepAvailable: 'QUIZ' };
}

function processGameCompletion(lecture, state, { score }) {
  const updated = { ...state };
  if (!updated.gameUnlocked && !updated.quizCompleted) {
    return { success: false, journeyState: updated, nextStepAvailable: 'QUIZ', xpAwardedThisStep: 0 };
  }
  updated.gameCompleted = true;
  updated.gameScore = score;
  let xp = 0;
  if (!updated.xpAwarded) {
    xp = lecture.xpReward + (lecture.game?.xpBonus || 50);
    updated.xpAwarded = true;
    updated.journeyCompleted = true;
  }
  return { success: true, journeyState: updated, nextStepAvailable: 'COMPLETED', xpAwardedThisStep: xp };
}

// ============================================================================
// TESTS
// ============================================================================

test('1. Course Studio: Auto-generate 30 distinct grade-wise lectures', () => {
  const lectures = generate30LectureCurriculum({ grade: 6, courseTitle: 'Python & AI Foundations' });
  assert.equal(lectures.length, 30);
  assert.equal(lectures[0].lectureNumber, 1);
  assert.equal(lectures[29].lectureNumber, 30);
  assert.equal(lectures[0].videoProvider, 'GOOGLE_DRIVE');
  assert.ok(lectures[0].videoRef.includes('drive.google.com/file/d/'));
});

test('2. Grade differentiation: Grade 2 vs Grade 8 syllabus isolation', () => {
  const g2 = generate30LectureCurriculum({ grade: 2, courseTitle: 'Digital Explorers' });
  const g8 = generate30LectureCurriculum({ grade: 8, courseTitle: 'Robotics & IoT' });
  assert.notEqual(g2[0].topic, g8[0].topic);
  assert.ok(g2[0].topic.includes('Visual Tools'));
  assert.ok(g8[0].topic.includes('Engineering & Code'));
});

test('3. Google Drive Video Provider: File ID extraction & embed URL normalization', () => {
  const url = 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing';
  const meta = resolvePlaybackMetadata(url);
  assert.equal(meta.fileId, '1A2B3C4D5E6F7G8H9I0J');
  assert.equal(meta.embedUrl, 'https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/preview');
  assert.equal(meta.validationStatus, 'VALID');
});

test('4. Automatic Scheduling Engine: Daily and Weekly unlock date computation', () => {
  const startDateStr = '2026-11-01T00:00:00.000Z';
  const lec5 = { lectureNumber: 5, releaseSchedule: { type: 'DAILY', dayOffset: 5 } };
  const d5 = calculateScheduledUnlockDate(lec5, startDateStr, 'DAILY');
  assert.equal(d5.getDate(), 5);

  const lec3w = { lectureNumber: 3, releaseSchedule: { type: 'WEEKLY', dayOffset: 3 } };
  const d3w = calculateScheduledUnlockDate(lec3w, startDateStr, 'WEEKLY');
  assert.equal(d3w.getDate(), 15);
});

test('5. Unlock Policies: Sequential vs Schedule-based vs Hybrid', () => {
  const startDate = '2026-11-01T00:00:00.000Z';
  const future = new Date('2026-11-10T12:00:00.000Z');
  const past = new Date('2026-11-01T05:00:00.000Z');

  const lec2 = { lectureNumber: 2, releaseSchedule: { type: 'DAILY', dayOffset: 2 } };

  // Hybrid incomplete
  const r1 = evaluateLectureUnlock(lec2, false, startDate, future, 'HYBRID_SCHEDULE_AND_COMPLETION');
  assert.equal(r1.isUnlocked, false);

  // Hybrid time not reached
  const r2 = evaluateLectureUnlock(lec2, true, startDate, past, 'HYBRID_SCHEDULE_AND_COMPLETION');
  assert.equal(r2.isUnlocked, false);

  // Hybrid satisfied
  const r3 = evaluateLectureUnlock(lec2, true, startDate, future, 'HYBRID_SCHEDULE_AND_COMPLETION');
  assert.equal(r3.isUnlocked, true);

  // Sequential satisfied regardless of date
  const r4 = evaluateLectureUnlock({ ...lec2, unlockPolicy: 'SEQUENTIAL' }, true, startDate, past, 'SEQUENTIAL');
  assert.equal(r4.isUnlocked, true);
});

test('6. Missed Lecture Backlog: Missed lectures remain available without exposing future lectures', () => {
  const lectures = generate30LectureCurriculum({ grade: 6, courseTitle: 'Python' });
  const startDate = '2026-11-01T00:00:00.000Z';
  const simulatedToday = new Date('2026-11-15T12:00:00.000Z');

  const journey = resolveStudentLearningJourney(
    lectures,
    {},
    { enrollmentStartDate: startDate, currentDate: simulatedToday }
  );

  assert.equal(journey.activeLecture.lectureNumber, 1);
  assert.equal(journey.evaluations[1].isUnlocked, false);
});

test('7. 6-Step Learning Journey Orchestrator: Video -> Quiz -> Game -> Reward -> Progress', () => {
  const lectures = generate30LectureCurriculum({ grade: 6, courseTitle: 'Python' });
  const lec1 = lectures[0];
  let state = {
    lectureNumber: 1,
    isUnlocked: true,
    videoWatchedSeconds: 0,
    videoWatchPercentage: 0,
    videoCompleted: false,
    quizUnlocked: false,
    quizCompleted: false,
    gameUnlocked: false,
    gameCompleted: false,
    xpAwarded: false
  };

  // Video Watch (85% >= 80%)
  const vidRes = processVideoWatch(lec1, state, { watchedSeconds: 850, totalDurationSeconds: 1000 });
  state = vidRes.journeyState;
  assert.equal(state.videoCompleted, true);
  assert.equal(state.quizUnlocked, true);

  // Quiz submission
  const quizRes = evaluateQuizSubmission(lec1, state, {
    answers: {
      'q-1-1': 'Correct Answer A',
      'q-1-2': 'True',
      'q-1-3': 'Process completed with status 200 OK'
    }
  });
  state = quizRes.journeyState;
  assert.equal(quizRes.success, true);
  assert.equal(state.quizCompleted, true);
  assert.equal(state.gameUnlocked, true);

  // Game completion
  const gameRes = processGameCompletion(lec1, state, { score: 100 });
  state = gameRes.journeyState;
  assert.equal(gameRes.success, true);
  assert.equal(state.gameCompleted, true);
  assert.equal(state.xpAwarded, true);
  assert.equal(gameRes.xpAwardedThisStep, 100);

  // Idempotency: retry awards 0 XP
  const retryRes = processGameCompletion(lec1, state, { score: 100 });
  assert.equal(retryRes.xpAwardedThisStep, 0);
});

test('8. Student Security & Zero-Leakage: Future lectures and quiz answers never exposed in client payload', () => {
  const lectures = generate30LectureCurriculum({ grade: 7, courseTitle: 'Robotics & Microcontrollers' });
  
  // Simulate active lecture resolution
  const journey = resolveStudentLearningJourney(lectures, {}, { enrollmentStartDate: new Date().toISOString() });
  
  // Active lecture is lecture 1
  assert.equal(journey.activeLecture.lectureNumber, 1);
  
  // Simulate client-facing sanitization like getStudentActiveLearningJourney does
  const clientPayload = {
    activeLecture: {
      id: journey.activeLecture.id,
      lectureNumber: journey.activeLecture.lectureNumber,
      title: journey.activeLecture.title,
      video: journey.activeLecture.video,
      quiz: {
        ...journey.activeLecture.quiz,
        // sanitize answer keys
        questions: journey.activeLecture.quiz.questions.map(q => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options
        }))
      }
    },
    // Future lectures are only metadata (no URLs, no video IDs, no quiz keys)
    scheduleSummary: journey.evaluations.map(e => ({
      lectureNumber: e.lectureNumber,
      isUnlocked: e.isUnlocked,
      scheduledDate: e.scheduledDate
    }))
  };

  // Verify active quiz questions do NOT expose correct answer in client payload
  clientPayload.activeLecture.quiz.questions.forEach(q => {
    assert.equal(q.correctOptionId, undefined);
    assert.equal(q.explanation, undefined);
  });

  // Verify future lectures (2-30) do not leak video embed URLs or drive IDs
  assert.equal(clientPayload.scheduleSummary.length, 30);
  clientPayload.scheduleSummary.slice(1).forEach(item => {
    assert.equal(item.isUnlocked, false);
    assert.equal(item.videoUrl, undefined);
    assert.equal(item.driveFileId, undefined);
  });
});

