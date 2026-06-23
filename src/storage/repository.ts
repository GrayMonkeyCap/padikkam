/**
 * Single persistence boundary for the whole app.
 *
 * v1 ships LocalStorageRepository. To add accounts/sync later, implement this same
 * interface against a backend (e.g. RemoteStorageRepository) and swap it in store.ts —
 * no UI or logic changes required.
 */

export interface SrsCard {
  /** Easiness factor (SM-2), starts at 2.5, floor 1.3. */
  ease: number;
  /** Current interval in days. */
  interval: number;
  /** Successful reps in a row. */
  reps: number;
  /** Times the card was forgotten. */
  lapses: number;
  /** Next due time (epoch ms). */
  due: number;
  /** Last review time (epoch ms), 0 if never reviewed. */
  lastReviewed: number;
}

export type SrsState = Record<string, SrsCard>;

export interface Progress {
  xp: number;
  /** Consecutive-day streak count. */
  streak: number;
  /** ISO date (YYYY-MM-DD) of the last day any XP was earned. */
  lastActiveDate: string | null;
  /** XP earned today, keyed to `lastActiveDate`. */
  todayXp: number;
  /** Daily XP goal. */
  dailyGoal: number;
  /** Streak freezes in reserve — auto-consumed to forgive one missed day. */
  streakFreezes: number;
  /** Lesson ids the learner has completed at least once. */
  completedLessons: string[];
  /** Best mastery % (0–100) reached per lesson, from quizzes. */
  lessonMastery: Record<string, number>;
  /** Crown level (0–5) per lesson — increments each time you pass its quiz. */
  lessonLevels: Record<string, number>;
  /** Phrase ids the learner has gotten wrong and not yet re-mastered. */
  mistakes: string[];
  /** Earned badge ids. */
  badges: string[];
}

export interface StorageRepository {
  getProgress(): Progress;
  saveProgress(p: Progress): void;
  getSrs(): SrsState;
  saveSrs(s: SrsState): void;
  reset(): void;
}

export const defaultProgress = (): Progress => ({
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  todayXp: 0,
  dailyGoal: 30,
  streakFreezes: 2,
  completedLessons: [],
  lessonMastery: {},
  lessonLevels: {},
  mistakes: [],
  badges: [],
});
