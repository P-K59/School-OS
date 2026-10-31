/**
 * InnovatMind School OS — Automatic Lecture Scheduling & Unlock Engine
 * Calculates lecture availability, enforces unlock policies, and manages student backlog learning.
 */

import type { CurriculumLecture, StudentLectureJourneyState, UnlockPolicy, SchedulePolicy } from '../types';

export interface StudentScheduleContext {
  enrollmentStartDate: string; // ISO date string (when student/school was enrolled)
  schoolTimezone?: string; // e.g. "Asia/Kolkata"
  currentDate?: Date; // For deterministic testing or live clock
}

export interface LectureUnlockEvaluation {
  lectureNumber: number;
  lectureId: string;
  isUnlocked: boolean;
  unlockReason: string;
  scheduledUnlockDate: string; // ISO format
  isMissedBacklog: boolean; // True if scheduled before today but not yet completed
  isCompleted: boolean;
}

export interface StudentJourneyScheduleResult {
  totalLectures: number;
  completedLecturesCount: number;
  unlockedLecturesCount: number;
  activeLecture: CurriculumLecture | null; // The exact lecture the student is currently learning
  activeLectureState: StudentLectureJourneyState | null;
  overallProgressPercentage: number;
  isCourseCompleted: boolean;
  nextScheduledUnlock?: string;
  evaluations: LectureUnlockEvaluation[];
}

export class SchedulingEngine {
  /**
   * Calculate scheduled unlock date for a lecture based on enrollment start date and schedule rules.
   */
  public static calculateScheduledUnlockDate(
    lecture: CurriculumLecture,
    enrollmentStartDateStr: string,
    defaultScheduleType: SchedulePolicy = 'DAILY'
  ): Date {
    // If lecture has custom explicit date, use that
    if (lecture.releaseSchedule.type === 'CUSTOM' && lecture.releaseSchedule.customDate) {
      const timeStr = lecture.releaseSchedule.customTime || '09:00';
      const [hours, minutes] = timeStr.split(':').map(Number);
      const customDate = new Date(lecture.releaseSchedule.customDate);
      customDate.setHours(hours || 9, minutes || 0, 0, 0);
      return customDate;
    }

    const startDate = new Date(enrollmentStartDateStr);
    const dayOffset = lecture.releaseSchedule.dayOffset ?? lecture.lectureNumber;
    const scheduleType = lecture.releaseSchedule.type || defaultScheduleType;

    const targetDate = new Date(startDate.getTime());
    if (scheduleType === 'WEEKLY') {
      // 1 lecture per week: (dayOffset - 1) * 7 days
      targetDate.setDate(targetDate.getDate() + (dayOffset - 1) * 7);
    } else {
      // DAILY: 1 lecture per day: (dayOffset - 1) days
      targetDate.setDate(targetDate.getDate() + (dayOffset - 1));
    }

    const timeStr = lecture.releaseSchedule.customTime || '09:00';
    const [hours, minutes] = timeStr.split(':').map(Number);
    targetDate.setHours(hours || 9, minutes || 0, 0, 0);

    return targetDate;
  }

  /**
   * Evaluate unlock status for an individual lecture given its predecessor's status.
   */
  public static evaluateLectureUnlock(
    lecture: CurriculumLecture,
    previousLectureCompleted: boolean,
    enrollmentStartDateStr: string,
    now: Date = new Date(),
    courseUnlockPolicy: UnlockPolicy = 'HYBRID_SCHEDULE_AND_COMPLETION'
  ): LectureUnlockEvaluation {
    const scheduledDate = this.calculateScheduledUnlockDate(lecture, enrollmentStartDateStr);
    const isScheduleTimeReached = now.getTime() >= scheduledDate.getTime();
    const policy = lecture.unlockPolicy || courseUnlockPolicy;

    // Lecture 1 is always unlocked on or after its start date
    if (lecture.lectureNumber === 1) {
      const unlocked = policy === 'SEQUENTIAL' ? true : isScheduleTimeReached;
      return {
        lectureNumber: 1,
        lectureId: lecture.id,
        isUnlocked: unlocked,
        unlockReason: unlocked ? 'Orientation lecture unlocked' : `Unlocks on ${scheduledDate.toLocaleDateString()}`,
        scheduledUnlockDate: scheduledDate.toISOString(),
        isMissedBacklog: isScheduleTimeReached && !unlocked,
        isCompleted: false
      };
    }

    let isUnlocked = false;
    let unlockReason = '';

    switch (policy) {
      case 'SEQUENTIAL':
        isUnlocked = previousLectureCompleted;
        unlockReason = isUnlocked
          ? 'Unlocked: Previous lecture successfully completed'
          : `Locked: Complete Lecture ${lecture.lectureNumber - 1} to unlock`;
        break;

      case 'SCHEDULE_BASED':
        isUnlocked = isScheduleTimeReached;
        unlockReason = isUnlocked
          ? 'Unlocked: Scheduled release date reached'
          : `Locked: Scheduled for release on ${scheduledDate.toLocaleDateString()}`;
        break;

      case 'HYBRID_SCHEDULE_AND_COMPLETION':
      default:
        if (!previousLectureCompleted) {
          isUnlocked = false;
          unlockReason = `Locked: Complete Lecture ${lecture.lectureNumber - 1} first`;
        } else if (!isScheduleTimeReached) {
          isUnlocked = false;
          unlockReason = `Locked: Next scheduled session arrives on ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
          isUnlocked = true;
          unlockReason = 'Unlocked: Schedule reached and prerequisites completed';
        }
        break;
    }

    const isMissedBacklog = isScheduleTimeReached && !isUnlocked && !previousLectureCompleted;

    return {
      lectureNumber: lecture.lectureNumber,
      lectureId: lecture.id,
      isUnlocked,
      unlockReason,
      scheduledUnlockDate: scheduledDate.toISOString(),
      isMissedBacklog,
      isCompleted: false
    };
  }

  /**
   * Compute full journey schedule evaluation for a student.
   * Identifies the single active lecture currently presented to the student.
   */
  public static resolveStudentLearningJourney(
    lectures: CurriculumLecture[],
    journeyStates: Record<number, StudentLectureJourneyState> = {},
    context: StudentScheduleContext,
    courseUnlockPolicy: UnlockPolicy = 'HYBRID_SCHEDULE_AND_COMPLETION'
  ): StudentJourneyScheduleResult {
    const now = context.currentDate || new Date();
    const sortedLectures = [...lectures].sort((a, b) => a.lectureNumber - b.lectureNumber);
    const totalLectures = sortedLectures.length;

    let completedCount = 0;
    let unlockedCount = 0;
    let previousCompleted = true; // Seed for lecture 1

    const evaluations: LectureUnlockEvaluation[] = [];
    let currentActiveLecture: CurriculumLecture | null = null;
    let currentActiveState: StudentLectureJourneyState | null = null;
    let nextScheduledUnlockDate: string | undefined;

    for (const lecture of sortedLectures) {
      const state = journeyStates[lecture.lectureNumber];
      const isCompleted = Boolean(state && state.journeyCompleted);

      if (isCompleted) {
        completedCount++;
        unlockedCount++;
        previousCompleted = true;
        evaluations.push({
          lectureNumber: lecture.lectureNumber,
          lectureId: lecture.id,
          isUnlocked: true,
          unlockReason: 'Completed',
          scheduledUnlockDate: this.calculateScheduledUnlockDate(lecture, context.enrollmentStartDate).toISOString(),
          isMissedBacklog: false,
          isCompleted: true
        });
        continue;
      }

      // First incomplete lecture
      const evalResult = this.evaluateLectureUnlock(
        lecture,
        previousCompleted,
        context.enrollmentStartDate,
        now,
        courseUnlockPolicy
      );
      evalResult.isCompleted = false;
      evaluations.push(evalResult);

      if (evalResult.isUnlocked) {
        unlockedCount++;
        if (!currentActiveLecture) {
          currentActiveLecture = lecture;
          currentActiveState = state || {
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
      } else {
        if (!nextScheduledUnlockDate) {
          nextScheduledUnlockDate = evalResult.scheduledUnlockDate;
        }
      }

      // Subsequent lectures require this one to complete under sequential / hybrid policies
      previousCompleted = false;
    }

    // If all unlocked lectures are completed, or student finished all 30
    const isCourseCompleted = completedCount >= totalLectures && totalLectures > 0;
    const overallProgressPercentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    return {
      totalLectures,
      completedLecturesCount: completedCount,
      unlockedLecturesCount: unlockedCount,
      activeLecture: currentActiveLecture,
      activeLectureState: currentActiveState,
      overallProgressPercentage,
      isCourseCompleted,
      nextScheduledUnlock: nextScheduledUnlockDate,
      evaluations
    };
  }
}
