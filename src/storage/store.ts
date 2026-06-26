import { create } from 'zustand';
import { LocalStorageRepository } from './localStorage';
import type { Progress, SrsState, StorageRepository } from './repository';
import { newCard, review as srsReview, type Grade } from '../srs/sm2';
import { todayKey, daysBetween } from '../lib/dates';
import { XP, BADGES, type BadgeContext } from '../lib/xp';

// Swap this single line for a RemoteStorageRepository to add accounts later.
const repo: StorageRepository = new LocalStorageRepository();

interface StoreState {
  progress: Progress;
  srs: SrsState;

  /** Award XP and roll the daily streak. */
  addXp: (amount: number) => void;
  /** Grade a flashcard; updates SRS schedule and awards XP. */
  reviewPhrase: (phraseId: string, grade: Grade) => void;
  /** Mark a lesson complete (idempotent reward). */
  completeLesson: (lessonId: string) => void;
  /** Record best quiz mastery for a lesson (0–100). */
  recordMastery: (lessonId: string, pct: number) => void;
  /** Bump a lesson's crown level (capped at 5) when its quiz is passed. */
  levelUpLesson: (lessonId: string) => void;
  /** Flag a phrase the learner got wrong, for the mistakes deck. */
  addMistake: (phraseId: string) => void;
  /** Remove a phrase from the mistakes deck once re-mastered. */
  clearMistake: (phraseId: string) => void;
  setDailyGoal: (goal: number) => void;
  resetAll: () => void;
  loadProfile: (progress: Progress, srs: SrsState) => void;
}

function badgeContext(progress: Progress, srs: SrsState): BadgeContext {
  return {
    xp: progress.xp,
    streak: progress.streak,
    completedLessons: progress.completedLessons.length,
    totalReviews: Object.values(srs).filter((c) => c.lastReviewed > 0).length,
  };
}

function withEarnedBadges(progress: Progress, srs: SrsState): Progress {
  const ctx = badgeContext(progress, srs);
  const earned = BADGES.filter((b) => b.earned(ctx)).map((b) => b.id);
  const merged = Array.from(new Set([...progress.badges, ...earned]));
  return merged.length === progress.badges.length ? progress : { ...progress, badges: merged };
}

export const useStore = create<StoreState>((set, get) => ({
  progress: repo.getProgress(),
  srs: repo.getSrs(),

  addXp: (amount) => {
    const { progress, srs } = get();
    const today = todayKey();
    let { streak, todayXp } = progress;

    let streakFreezes = progress.streakFreezes;
    if (progress.lastActiveDate === today) {
      todayXp += amount;
    } else {
      const gap = progress.lastActiveDate ? daysBetween(progress.lastActiveDate, today) : null;
      if (gap === 1 || gap === null) {
        streak = gap === 1 ? streak + 1 : 1;
      } else if (gap === 2 && streakFreezes > 0) {
        // Forgive a single missed day by spending a streak freeze.
        streakFreezes -= 1;
        streak = streak + 1;
      } else {
        streak = 1;
      }
      todayXp = amount;
    }

    let next: Progress = {
      ...progress,
      xp: progress.xp + amount,
      streak,
      streakFreezes,
      todayXp,
      lastActiveDate: today,
    };
    next = withEarnedBadges(next, srs);
    repo.saveProgress(next);
    set({ progress: next });
  },

  reviewPhrase: (phraseId, grade) => {
    const { srs } = get();
    const existing = srs[phraseId];
    const isNew = !existing;
    const card = existing ?? newCard();
    const updated = srsReview(card, grade);
    const nextSrs = { ...srs, [phraseId]: updated };
    repo.saveSrs(nextSrs);
    set({ srs: nextSrs });
    get().addXp(isNew ? XP.newCard : XP.reviewCard);
  },

  completeLesson: (lessonId) => {
    const { progress } = get();
    if (progress.completedLessons.includes(lessonId)) return;
    const next: Progress = {
      ...progress,
      completedLessons: [...progress.completedLessons, lessonId],
    };
    repo.saveProgress(next);
    set({ progress: next });
    get().addXp(XP.lessonComplete);
  },

  recordMastery: (lessonId, pct) => {
    const { progress } = get();
    const best = Math.max(progress.lessonMastery[lessonId] ?? 0, Math.round(pct));
    const next: Progress = {
      ...progress,
      lessonMastery: { ...progress.lessonMastery, [lessonId]: best },
    };
    repo.saveProgress(next);
    set({ progress: next });
  },

  levelUpLesson: (lessonId) => {
    const { progress } = get();
    const current = progress.lessonLevels[lessonId] ?? 0;
    if (current >= 5) return;
    const next: Progress = {
      ...progress,
      lessonLevels: { ...progress.lessonLevels, [lessonId]: current + 1 },
    };
    repo.saveProgress(next);
    set({ progress: next });
  },

  addMistake: (phraseId) => {
    const { progress } = get();
    if (progress.mistakes.includes(phraseId)) return;
    const next: Progress = { ...progress, mistakes: [...progress.mistakes, phraseId] };
    repo.saveProgress(next);
    set({ progress: next });
  },

  clearMistake: (phraseId) => {
    const { progress } = get();
    if (!progress.mistakes.includes(phraseId)) return;
    const next: Progress = {
      ...progress,
      mistakes: progress.mistakes.filter((id) => id !== phraseId),
    };
    repo.saveProgress(next);
    set({ progress: next });
  },

  setDailyGoal: (goal) => {
    const { progress } = get();
    const next = { ...progress, dailyGoal: goal };
    repo.saveProgress(next);
    set({ progress: next });
  },

  resetAll: () => {
    repo.reset();
    set({ progress: repo.getProgress(), srs: repo.getSrs() });
  },

  loadProfile: (progress, srs) => {
    repo.saveProgress(progress);
    repo.saveSrs(srs);
    set({ progress, srs });
  },
}));
