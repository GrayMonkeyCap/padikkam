import type { SrsCard } from '../storage/repository';

/**
 * SM-2 spaced repetition (the classic SuperMemo-2 algorithm, public domain),
 * adapted to a 4-button self-grading UI.
 */

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

/** A brand-new, never-seen card, due immediately. */
export function newCard(now = Date.now()): SrsCard {
  return { ease: 2.5, interval: 0, reps: 0, lapses: 0, due: now, lastReviewed: 0 };
}

/** Map the 4 UI grades to an SM-2 quality score (0–5). */
const quality: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

/**
 * Apply a review grade and return the updated card.
 * "again" resets the card and re-shows it shortly (same session).
 */
export function review(card: SrsCard, grade: Grade, now = Date.now()): SrsCard {
  const q = quality[grade];

  if (grade === 'again') {
    return {
      ...card,
      reps: 0,
      lapses: card.lapses + 1,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      interval: 0,
      // Re-show in ~1 minute so it cycles back in the current session.
      due: now + 60 * 1000,
      lastReviewed: now,
    };
  }

  // Standard SM-2 ease update.
  const ease = Math.max(MIN_EASE, card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  const reps = card.reps + 1;

  let interval: number;
  if (reps === 1) {
    interval = grade === 'easy' ? 3 : 1;
  } else if (reps === 2) {
    interval = grade === 'easy' ? 8 : 6;
  } else {
    const factor = grade === 'hard' ? 1.2 : grade === 'easy' ? ease * 1.3 : ease;
    interval = Math.round(card.interval * factor);
  }
  interval = Math.max(1, interval);

  return { ...card, ease, reps, interval, due: now + interval * DAY_MS, lastReviewed: now };
}

/** Human-friendly "next review" label for a grade, shown on the buttons. */
export function previewInterval(card: SrsCard, grade: Grade, now = Date.now()): string {
  const next = review(card, grade, now);
  if (grade === 'again') return '<1 min';
  if (next.interval < 1) return 'soon';
  if (next.interval === 1) return '1 day';
  if (next.interval < 30) return `${next.interval} days`;
  const months = Math.round(next.interval / 30);
  return months === 1 ? '1 month' : `${months} months`;
}
