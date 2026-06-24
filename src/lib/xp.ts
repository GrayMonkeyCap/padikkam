/** XP amounts per action, and the badge catalogue. */

import { orderedLessons } from '../content';

export const XP = {
  reviewCard: 2,
  newCard: 4,
  quizCorrect: 5,
  lessonComplete: 20,
  dialogueComplete: 10,
} as const;

export interface BadgeDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  /** Returns true when earned. */
  earned: (ctx: BadgeContext) => boolean;
}

export interface BadgeContext {
  xp: number;
  streak: number;
  completedLessons: number;
  totalReviews: number;
}

export const BADGES: BadgeDef[] = [
  {
    id: 'first-words',
    emoji: '🌱',
    title: 'First Words',
    description: 'Complete your first lesson',
    earned: (c) => c.completedLessons >= 1,
  },
  {
    id: 'on-a-roll',
    emoji: '🔥',
    title: 'On a Roll',
    description: 'Reach a 3-day streak',
    earned: (c) => c.streak >= 3,
  },
  {
    id: 'week-strong',
    emoji: '⚡',
    title: 'Week Strong',
    description: 'Reach a 7-day streak',
    earned: (c) => c.streak >= 7,
  },
  {
    id: 'chatty',
    emoji: '💬',
    title: 'Getting Chatty',
    description: 'Complete 3 lessons',
    earned: (c) => c.completedLessons >= 3,
  },
  {
    id: 'centurion',
    emoji: '💯',
    title: 'Centurion',
    description: 'Earn 100 XP',
    earned: (c) => c.xp >= 100,
  },
  {
    id: 'halfway',
    emoji: '🚀',
    title: 'Halfway There',
    description: 'Complete half of all lessons',
    earned: (c) => c.completedLessons >= Math.ceil(orderedLessons.length / 2),
  },
  {
    id: 'fluent-track',
    emoji: '🏆',
    title: 'Fluency Track',
    description: 'Complete all lessons',
    earned: (c) => c.completedLessons >= orderedLessons.length,
  },
];

export function levelFromXp(xp: number): { level: number; into: number; need: number } {
  // Gentle curve: each level needs 50 more XP than the last (50, 100, 150...).
  let level = 1;
  let remaining = xp;
  let need = 50;
  while (remaining >= need) {
    remaining -= need;
    level += 1;
    need += 50;
  }
  return { level, into: remaining, need };
}
