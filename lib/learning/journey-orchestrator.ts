/**
 * InnovatMind School OS — 6-Step Learning Journey Orchestrator
 * Controls the sequential step flow: Video -> Quiz -> Game -> Reward -> Progress -> Next Lecture.
 * Ensures server-side validation and idempotency for XP and progress telemetry.
 */

import type { CurriculumLecture, StudentLectureJourneyState, QuizQuestion } from '../types';

export interface VideoWatchProgressPayload {
  lectureNumber: number;
  watchedSeconds: number;
  totalDurationSeconds: number;
}

export interface QuizSubmissionPayload {
  lectureNumber: number;
  answers: Record<string, any>; // questionId -> answer
}

export interface GameCompletionPayload {
  lectureNumber: number;
  score: number;
  movesOrTimeSeconds?: number;
}

export interface JourneyStepResult {
  success: boolean;
  message: string;
  journeyState: StudentLectureJourneyState;
  nextStepAvailable: 'VIDEO' | 'QUIZ' | 'GAME' | 'COMPLETED';
  xpAwardedThisStep: number;
  newTotalXp?: number;
}

export class LearningJourneyOrchestrator {
  /**
   * Initialize or get student's journey state for a lecture
   */
  public static getOrCreateState(
    lecture: CurriculumLecture,
    existingState?: StudentLectureJourneyState
  ): StudentLectureJourneyState {
    if (existingState) {
      return { ...existingState };
    }
    return {
      lectureId: lecture.id,
      lectureNumber: lecture.lectureNumber,
      isUnlocked: true,
      videoWatchedSeconds: 0,
      videoWatchPercentage: 0,
      videoCompleted: false,
      quizUnlocked: false,
      quizCompleted: false,
      quizAttempts: 0,
      gameUnlocked: false,
      gameCompleted: false,
      xpAwarded: false,
      journeyCompleted: false
    };
  }

  /**
   * STEP 1: Process Video Watch Telemetry
   */
  public static processVideoWatch(
    lecture: CurriculumLecture,
    state: StudentLectureJourneyState,
    payload: VideoWatchProgressPayload
  ): JourneyStepResult {
    const updatedState = { ...state };
    const threshold = lecture.videoCompletionThresholdPercent || 80;

    const totalDuration = Math.max(1, payload.totalDurationSeconds || (lecture.estimatedDurationMinutes * 60));
    const watchedSeconds = Math.max(updatedState.videoWatchedSeconds, payload.watchedSeconds);
    const watchPercentage = Math.min(100, Math.round((watchedSeconds / totalDuration) * 100));

    updatedState.videoWatchedSeconds = watchedSeconds;
    updatedState.videoWatchPercentage = watchPercentage;

    if (watchPercentage >= threshold && !updatedState.videoCompleted) {
      updatedState.videoCompleted = true;
      updatedState.quizUnlocked = true; // Auto-unlock Quiz
    }

    const nextStep = !updatedState.videoCompleted
      ? 'VIDEO'
      : (!updatedState.quizCompleted ? 'QUIZ' : (!updatedState.gameCompleted ? 'GAME' : 'COMPLETED'));

    return {
      success: true,
      message: updatedState.videoCompleted
        ? `Video requirement fulfilled (${watchPercentage}% watched). Checkpoint quiz unlocked!`
        : `Watched ${watchPercentage}% of video (${threshold}% needed to unlock quiz).`,
      journeyState: updatedState,
      nextStepAvailable: nextStep,
      xpAwardedThisStep: 0
    };
  }

  /**
   * STEP 2: Evaluate Quiz Submission Server-Side
   */
  public static evaluateQuizSubmission(
    lecture: CurriculumLecture,
    state: StudentLectureJourneyState,
    payload: QuizSubmissionPayload
  ): JourneyStepResult {
    const updatedState = { ...state };

    if (!updatedState.quizUnlocked && !updatedState.videoCompleted) {
      return {
        success: false,
        message: 'Quiz is locked. Please complete the video lesson first.',
        journeyState: updatedState,
        nextStepAvailable: 'VIDEO',
        xpAwardedThisStep: 0
      };
    }

    const quiz = lecture.quiz;
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      // If lecture has no quiz, bypass directly to game
      updatedState.quizCompleted = true;
      updatedState.gameUnlocked = true;
      return {
        success: true,
        message: 'No quiz required for this session. Game unlocked!',
        journeyState: updatedState,
        nextStepAvailable: 'GAME',
        xpAwardedThisStep: 0
      };
    }

    updatedState.quizAttempts = (updatedState.quizAttempts || 0) + 1;

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    for (const q of quiz.questions) {
      const studentAns = payload.answers[q.id];
      if (studentAns !== undefined && studentAns !== null) {
        if (typeof q.correctAnswer === 'string' && typeof studentAns === 'string') {
          if (studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
            correctCount++;
          }
        } else if (Array.isArray(q.correctAnswer) && Array.isArray(studentAns)) {
          if (JSON.stringify(q.correctAnswer.sort()) === JSON.stringify(studentAns.sort())) {
            correctCount++;
          }
        } else if (studentAns === q.correctAnswer) {
          correctCount++;
        }
      }
    }

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passingThreshold = quiz.passingPercentage || 70;
    const passed = percentage >= passingThreshold;

    updatedState.quizScore = percentage;

    if (passed) {
      updatedState.quizCompleted = true;
      updatedState.gameUnlocked = true; // Auto-unlock Game
      return {
        success: true,
        message: `Quiz Passed with ${percentage}%! Interactive learning game unlocked!`,
        journeyState: updatedState,
        nextStepAvailable: 'GAME',
        xpAwardedThisStep: 0
      };
    } else {
      return {
        success: false,
        message: `Scored ${percentage}% (${passingThreshold}% required). Review the lesson and try again!`,
        journeyState: updatedState,
        nextStepAvailable: 'QUIZ',
        xpAwardedThisStep: 0
      };
    }
  }

  /**
   * STEP 3 & 4: Process Game Completion & Award Rewards
   */
  public static processGameCompletion(
    lecture: CurriculumLecture,
    state: StudentLectureJourneyState,
    payload: GameCompletionPayload
  ): JourneyStepResult {
    const updatedState = { ...state };

    if (!updatedState.gameUnlocked && !updatedState.quizCompleted) {
      return {
        success: false,
        message: 'Game is locked. Please pass the checkpoint quiz first.',
        journeyState: updatedState,
        nextStepAvailable: 'QUIZ',
        xpAwardedThisStep: 0
      };
    }

    updatedState.gameCompleted = true;
    updatedState.gameScore = payload.score;

    // Check if entire journey is complete
    let awardedXp = 0;
    if (!updatedState.xpAwarded) {
      const baseReward = lecture.xpReward || 50;
      const gameBonus = lecture.game?.xpBonus || 50;
      awardedXp = baseReward + gameBonus;
      updatedState.xpAwarded = true;
      updatedState.journeyCompleted = true;
      updatedState.completedAt = new Date().toISOString();
    }

    return {
      success: true,
      message: `Congratulations! Learning journey for Lecture ${lecture.lectureNumber} fully completed! +${awardedXp} XP awarded!`,
      journeyState: updatedState,
      nextStepAvailable: 'COMPLETED',
      xpAwardedThisStep: awardedXp
    };
  }
}
